const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const AdmitCard = require('../models/AdmitCard');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Department = require('../models/Department');
const { generateAdmitCardPdfBuffer } = require('../utils/admitCardPdfGenerator');
const { recordAuditLog } = require('../utils/auditLogger');
const { UPLOAD_DIR } = require('../middleware/uploadAdmitCardMiddleware');

/**
 * Helper to resolve the authenticated student's record
 */
async function resolveStudentForUser(user) {
  if (!user) return null;
  const metaSid = user.metadata?.studentId;
  if (metaSid) {
    const s = await Student.findOne({ studentId: metaSid.trim().toUpperCase() }).populate('department', 'name code');
    if (s) return s;
  }
  // Match by institutional email
  if (user.email) {
    const s = await Student.findOne({ email: user.email.trim().toLowerCase() }).populate('department', 'name code');
    if (s) return s;
  }
  // Match by username
  if (user.username) {
    const s = await Student.findOne({ studentId: user.username.trim().toUpperCase() }).populate('department', 'name code');
    if (s) return s;
  }
  return null;
}

/**
 * 1. GET /api/admit-cards
 * Admin: List all admit cards with filtering, search, and pagination
 */
exports.getAdmitCards = async (req, res) => {
  try {
    const { semester, examSession, status, studentId, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (semester) {
      const s = parseInt(semester, 10);
      if (!isNaN(s)) query.semester = s;
    }
    if (examSession && examSession !== 'ALL') {
      query.examSession = examSession;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (studentId) {
      query.studentId = studentId.trim().toUpperCase();
    }
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [
        { studentId: reg },
        { studentName: reg },
        { examTitle: reg },
        { examSession: reg },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [admitCards, total] = await Promise.all([
      AdmitCard.find(query)
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AdmitCard.countDocuments(query),
    ]);

    // Summary counts for KPIs
    const [issuedCount, reissuedCount, uniqueStudents] = await Promise.all([
      AdmitCard.countDocuments({ status: 'Issued' }),
      AdmitCard.countDocuments({ status: 'Reissued' }),
      AdmitCard.distinct('studentId'),
    ]);

    return res.json({
      success: true,
      data: admitCards,
      admitCards,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      summary: {
        totalIssued: total,
        issuedCount,
        reissuedCount,
        uniqueStudentsCount: uniqueStudents.length,
      },
    });
  } catch (err) {
    console.error('getAdmitCards error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 2. GET /api/admit-cards/my-admit-cards
 * Student Portal: View only the authenticated student's issued admit cards
 */
exports.getMyAdmitCards = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.json({
        success: true,
        student: null,
        admitCards: [],
        message: 'No student profile is linked to your user account.',
      });
    }

    // Strictly fetch admit cards belonging ONLY to this student
    const admitCards = await AdmitCard.find({
      $or: [
        { student: student._id },
        { studentId: student.studentId },
      ],
      status: { $in: ['Issued', 'Reissued'] },
    })
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        department: student.department?.name || 'Computer Science & Engineering',
        departmentCode: student.department?.code || 'CSE',
        semester: student.semester,
      },
      data: admitCards,
      admitCards,
    });
  } catch (err) {
    console.error('getMyAdmitCards error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. GET /api/admit-cards/:id
 * Get single admit card with strict authorization check
 */
exports.getAdmitCardById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid admit card ID.' });
    }

    const admitCard = await AdmitCard.findById(id).populate('department', 'name code');
    if (!admitCard) {
      return res.status(404).json({ success: false, error: 'Admit card not found.' });
    }

    // Role-based security check: A student can ONLY view their own admit card
    if (req.user.role === 'student') {
      const student = await resolveStudentForUser(req.user);
      const isOwner =
        student &&
        (admitCard.student.toString() === student._id.toString() ||
          admitCard.studentId.toUpperCase() === student.studentId.toUpperCase());

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: You are not authorized to view this admit card.',
        });
      }
    }

    return res.json({ success: true, data: admitCard, admitCard });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Helper to send/stream the admit card PDF binary
 */
function sendPdfResponse(res, admitCard, disposition = 'inline') {
  const safeSession = (admitCard.examSession || 'Session').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeSid = (admitCard.studentId || 'STUDENT').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `AdmitCard_${safeSid}_${safeSession}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  // 1. Try streaming from filesystem if file exists
  if (admitCard.file?.path && fs.existsSync(admitCard.file.path)) {
    const fileStream = fs.createReadStream(admitCard.file.path);
    return fileStream.pipe(res);
  }

  // 2. Fallback to stored Base64 buffer
  if (admitCard.file?.dataBase64) {
    const pdfBuf = Buffer.from(admitCard.file.dataBase64, 'base64');
    res.setHeader('Content-Length', pdfBuf.length);
    return res.send(pdfBuf);
  }

  // 3. Fallback: dynamically generate clean PDF buffer
  const generatedBuf = generateAdmitCardPdfBuffer({
    studentId: admitCard.studentId,
    studentName: admitCard.studentName,
    departmentName: admitCard.departmentName,
    semester: admitCard.semester,
    examTitle: admitCard.examTitle,
    examSession: admitCard.examSession,
    examDate: admitCard.examDate,
    examSchedule: admitCard.examSchedule,
    remarks: admitCard.remarks,
  });

  res.setHeader('Content-Length', generatedBuf.length);
  return res.send(generatedBuf);
}

/**
 * 4. GET /api/admit-cards/:id/preview
 * Secure in-browser PDF preview stream
 */
exports.previewAdmitCard = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid admit card ID.' });
    }

    const admitCard = await AdmitCard.findById(id);
    if (!admitCard) {
      return res.status(404).json({ success: false, error: 'Admit card not found.' });
    }

    // Role-based security check: A student can ONLY preview their own admit card
    if (req.user.role === 'student') {
      const student = await resolveStudentForUser(req.user);
      const isOwner =
        student &&
        (admitCard.student.toString() === student._id.toString() ||
          admitCard.studentId.toUpperCase() === student.studentId.toUpperCase());

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: You are not authorized to preview this admit card.',
        });
      }
    }

    return sendPdfResponse(res, admitCard, 'inline');
  } catch (err) {
    console.error('previewAdmitCard error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 5. GET /api/admit-cards/:id/download
 * Secure PDF download endpoint
 */
exports.downloadAdmitCard = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid admit card ID.' });
    }

    const admitCard = await AdmitCard.findById(id);
    if (!admitCard) {
      return res.status(404).json({ success: false, error: 'Admit card not found.' });
    }

    // Role-based security check: A student can ONLY download their own admit card
    if (req.user.role === 'student') {
      const student = await resolveStudentForUser(req.user);
      const isOwner =
        student &&
        (admitCard.student.toString() === student._id.toString() ||
          admitCard.studentId.toUpperCase() === student.studentId.toUpperCase());

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: You are not authorized to download this admit card.',
        });
      }
    }

    return sendPdfResponse(res, admitCard, 'attachment');
  } catch (err) {
    console.error('downloadAdmitCard error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 6. POST /api/admit-cards/issue
 * Admin: Issue an admit card to a selected student with PDF upload or auto-generation
 */
exports.issueAdmitCard = async (req, res) => {
  try {
    const {
      studentId,
      semester,
      examTitle,
      examSession = 'Spring 2026',
      examDate,
      remarks,
      schedule,
    } = req.body;

    if (!studentId || !String(studentId).trim()) {
      return res.status(400).json({ success: false, error: 'Student ID / Roll number is required.' });
    }
    if (!examTitle || !String(examTitle).trim()) {
      return res.status(400).json({ success: false, error: 'Examination title is required.' });
    }

    const cleanSid = String(studentId).trim().toUpperCase();

    // Verify student exists in MongoDB
    const student = await Student.findOne({
      $or: [
        { studentId: cleanSid },
        { _id: mongoose.Types.ObjectId.isValid(cleanSid) ? cleanSid : null },
      ],
    }).populate('department', 'name code');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student with identifier "${cleanSid}" was not found in the university registry.`,
      });
    }

    const semNumber = parseInt(semester, 10) || student.semester || 1;
    let examSchedule = [];
    if (schedule) {
      try {
        examSchedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
      } catch (e) {
        examSchedule = [];
      }
    }

    // Determine PDF file: uploaded via Multer or auto-generated
    let fileInfo = {};

    if (req.file) {
      // Custom PDF uploaded by admin
      const fileBuf = fs.readFileSync(req.file.path);
      fileInfo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype || 'application/pdf',
        size: req.file.size,
        path: req.file.path,
        dataBase64: fileBuf.toString('base64'),
      };
    } else {
      // Auto-generate official University PDF
      const pdfBuffer = generateAdmitCardPdfBuffer({
        studentId: student.studentId,
        studentName: student.name,
        departmentName: student.department?.name || 'Computer Science & Engineering',
        semester: semNumber,
        examTitle: examTitle.trim(),
        examSession: examSession.trim(),
        examDate: examDate || 'May 15 - May 30, 2026',
        examSchedule,
        remarks: remarks || 'Candidate must bring this original admit card along with valid institutional ID.',
      });

      const filename = `admit-card-${student.studentId}-${Date.now()}.pdf`;
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, pdfBuffer);

      fileInfo = {
        originalName: `AdmitCard_${student.studentId}_${examSession.replace(/\s+/g, '_')}.pdf`,
        filename,
        mimeType: 'application/pdf',
        size: pdfBuffer.length,
        path: filePath,
        dataBase64: pdfBuffer.toString('base64'),
      };
    }

    // Check if an admit card for this student and session already exists
    let admitCard = await AdmitCard.findOne({
      student: student._id,
      examSession: examSession.trim(),
    });

    if (admitCard) {
      // Update / Reissue existing
      admitCard.examTitle = examTitle.trim();
      admitCard.semester = semNumber;
      admitCard.examDate = examDate || admitCard.examDate;
      admitCard.remarks = remarks || admitCard.remarks;
      admitCard.file = fileInfo;
      admitCard.status = 'Reissued';
      admitCard.reissueCount += 1;
      admitCard.lastReissuedAt = new Date();
      admitCard.issuedBy = req.user._id;
      admitCard.issuedByName = req.user.name || 'Dean & Academic Registrar';
      if (examSchedule.length > 0) admitCard.examSchedule = examSchedule;
      await admitCard.save();
    } else {
      // Create new Admit Card
      admitCard = await AdmitCard.create({
        student: student._id,
        studentId: student.studentId,
        studentName: student.name,
        studentEmail: student.email,
        department: student.department?._id,
        departmentName: student.department?.name || 'Computer Science & Engineering',
        semester: semNumber,
        examTitle: examTitle.trim(),
        examSession: examSession.trim(),
        examDate: examDate || 'May 15 - May 30, 2026',
        status: 'Issued',
        issueDate: new Date(),
        issuedBy: req.user._id,
        issuedByName: req.user.name || 'Dean & Academic Registrar',
        file: fileInfo,
        examSchedule,
        remarks: remarks || 'Candidate must bring this original admit card along with valid institutional ID.',
      });
    }

    await recordAuditLog({
      action: 'ADMIT_CARD_ISSUED',
      req,
      details: `Admin issued examination admit card for ${student.studentId} (${student.name}) for session ${examSession}`,
    });

    return res.status(201).json({
      success: true,
      message: `Admit card successfully issued for ${student.name} (${student.studentId}).`,
      data: admitCard,
      admitCard,
    });
  } catch (err) {
    console.error('issueAdmitCard error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to issue admit card.' });
  }
};

/**
 * 7. PUT /api/admit-cards/:id/reissue
 * Admin: Reissue an admit card with optional updated file or details
 */
exports.reissueAdmitCard = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid admit card ID.' });
    }

    const admitCard = await AdmitCard.findById(id);
    if (!admitCard) {
      return res.status(404).json({ success: false, error: 'Admit card not found.' });
    }

    const { examTitle, examSession, examDate, remarks, semester } = req.body;

    if (examTitle) admitCard.examTitle = examTitle.trim();
    if (examSession) admitCard.examSession = examSession.trim();
    if (examDate) admitCard.examDate = examDate.trim();
    if (remarks) admitCard.remarks = remarks.trim();
    if (semester) admitCard.semester = parseInt(semester, 10) || admitCard.semester;

    // If new PDF was uploaded
    if (req.file) {
      const fileBuf = fs.readFileSync(req.file.path);
      // Clean up old file if on disk
      if (admitCard.file?.path && fs.existsSync(admitCard.file.path)) {
        try { fs.unlinkSync(admitCard.file.path); } catch (e) {}
      }

      admitCard.file = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype || 'application/pdf',
        size: req.file.size,
        path: req.file.path,
        dataBase64: fileBuf.toString('base64'),
      };
    }

    admitCard.status = 'Reissued';
    admitCard.reissueCount += 1;
    admitCard.lastReissuedAt = new Date();
    admitCard.issuedBy = req.user._id;
    admitCard.issuedByName = req.user.name || 'Dean & Academic Registrar';

    await admitCard.save();

    await recordAuditLog({
      action: 'ADMIT_CARD_REISSUED',
      req,
      details: `Admin reissued admit card for ${admitCard.studentId} (Reissue #${admitCard.reissueCount})`,
    });

    return res.json({
      success: true,
      message: `Admit card successfully reissued for ${admitCard.studentName} (${admitCard.studentId}).`,
      data: admitCard,
      admitCard,
    });
  } catch (err) {
    console.error('reissueAdmitCard error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to reissue admit card.' });
  }
};

/**
 * 8. DELETE /api/admit-cards/:id
 * Admin: Delete an admit card
 */
exports.deleteAdmitCard = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid admit card ID.' });
    }

    const admitCard = await AdmitCard.findById(id);
    if (!admitCard) {
      return res.status(404).json({ success: false, error: 'Admit card not found.' });
    }

    // Remove file from disk if present
    if (admitCard.file?.path && fs.existsSync(admitCard.file.path)) {
      try { fs.unlinkSync(admitCard.file.path); } catch (e) {}
    }

    await AdmitCard.findByIdAndDelete(id);

    await recordAuditLog({
      action: 'ADMIT_CARD_DELETED',
      req,
      details: `Admin deleted admit card for student ${admitCard.studentId} (${admitCard.examTitle})`,
    });

    return res.json({
      success: true,
      message: `Admit card for student ${admitCard.studentId} deleted successfully.`,
    });
  } catch (err) {
    console.error('deleteAdmitCard error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 9. GET /api/admit-cards/meta/options
 * Admin: Fetch students, semesters, exams, and sessions to populate the issue form
 */
exports.getAdmitCardOptions = async (req, res) => {
  try {
    const [students, exams, departments] = await Promise.all([
      Student.find({ status: 'Active' }, 'studentId name email semester department')
        .populate('department', 'name code')
        .sort({ studentId: 1 }),
      Exam.find({}, 'title subject semester examDate startTime className').sort({ examDate: 1 }),
      Department.find({ status: 'Active' }, 'name code'),
    ]);

    const sessions = [
      'Spring 2026',
      'Autumn 2025',
      'Even Semester 2025-26',
      'Odd Semester 2025-26',
      'Summer Supplementary 2026',
    ];

    return res.json({
      success: true,
      students,
      exams,
      departments,
      sessions,
    });
  } catch (err) {
    console.error('getAdmitCardOptions error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
