const mongoose = require('mongoose');
const Student = require('../models/Student');
const Department = require('../models/Department');
const { getDBStatus } = require('../config/db');

/**
 * Student Controller
 * Handles CRUD operations for university students with department validation and search.
 */

const checkDBReady = (res) => {
  if (getDBStatus().status !== 'connected') {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is currently disconnected. Student records cannot be accessed at this time.',
      },
    });
    return false;
  }
  return true;
};

// GET /api/students
const getStudents = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    // Strict Parent authorization: A parent can only list their authorized ward(s)
    if (req.user && req.user.role === 'parent') {
      const { getAuthorizedStudents } = require('./parentController');
      const authorizedWards = await getAuthorizedStudents(req.user);
      return res.status(200).json({
        success: true,
        data: authorizedWards,
        pagination: {
          total: authorizedWards.length,
          page: 1,
          limit: authorizedWards.length,
          totalPages: 1,
        },
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.department) {
      if (mongoose.Types.ObjectId.isValid(req.query.department)) {
        query.department = req.query.department;
      }
    }

    if (req.query.semester) {
      const sem = parseInt(req.query.semester, 10);
      if (!isNaN(sem)) query.semester = sem;
    }

    if (req.query.enrollmentYear) {
      const year = parseInt(req.query.enrollmentYear, 10);
      if (!isNaN(year)) query.enrollmentYear = year;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('department', 'name code')
        .sort({ studentId: 1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { id } = req.params;
    let student;

    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id).populate('department', 'name code description');
    } else {
      // Lookup by unique studentId / rollNumber (e.g. CS21B1042)
      student = await Student.findOne({ studentId: id.toUpperCase().trim() }).populate('department', 'name code description');
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Student with identifier "${id}" was not found.`,
        },
      });
    }

    // Strict Parent authorization: A parent can only view their own linked ward's profile
    if (req.user && req.user.role === 'parent') {
      const { getAuthorizedStudents } = require('./parentController');
      const authorizedWards = await getAuthorizedStudents(req.user);
      const isAuthorized = authorizedWards.some(
        (w) =>
          w._id.toString() === student._id.toString() ||
          (w.studentId && student.studentId && w.studentId.toUpperCase() === student.studentId.toUpperCase())
      );
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access Denied: You are not authorized to access records for student "${id}". You can only view data for your own linked ward.`,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/students
const createStudent = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { studentId, name, email, department, semester, enrollmentYear, status } = req.body;

    // Verify department reference exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REFERENCE',
          message: `Referenced Department ID "${department}" does not exist in the database.`,
        },
      });
    }

    const student = new Student({
      studentId: studentId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: deptExists._id,
      semester: Number(semester),
      enrollmentYear: Number(enrollmentYear),
      status: status || 'Active',
    });

    await student.save();
    await student.populate('department', 'name code');

    res.status(201).json({
      success: true,
      data: student,
      message: 'Student record created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { studentId: id.toUpperCase().trim() };

    // If department is being updated, verify it exists
    if (req.body.department) {
      const deptExists = await Department.findById(req.body.department);
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REFERENCE',
            message: `Referenced Department ID "${req.body.department}" does not exist.`,
          },
        });
      }
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.email !== undefined) updates.email = req.body.email.trim().toLowerCase();
    if (req.body.department !== undefined) updates.department = req.body.department;
    if (req.body.semester !== undefined) updates.semester = Number(req.body.semester);
    if (req.body.enrollmentYear !== undefined) updates.enrollmentYear = Number(req.body.enrollmentYear);
    if (req.body.status !== undefined) updates.status = req.body.status;

    const student = await Student.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Student with identifier "${id}" was not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: student,
      message: 'Student record updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { studentId: id.toUpperCase().trim() };

    const student = await Student.findOneAndDelete(query);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Student with identifier "${id}" was not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Student record "${student.studentId}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/me – student sees own profile by matching email
const getMyProfile = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const student = await Student.findOne({ email: req.user.email }).populate('department', 'name code description');
    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'No student profile linked to this account. Please contact the administrator.' },
      });
    }
    // Merge user metadata (phone, address, guardian) into the response
    const userMeta = req.user.metadata || {};
    res.status(200).json({
      success: true,
      data: {
        ...student.toJSON(),
        phone: userMeta.phone || null,
        address: userMeta.address || null,
        guardianName: userMeta.guardianName || null,
        guardianPhone: userMeta.guardianPhone || null,
        guardianRelation: userMeta.guardianRelation || null,
        bloodGroup: userMeta.bloodGroup || null,
        photo: userMeta.photo || null,
        course: userMeta.course || null,
        userName: req.user.name,
        userEmail: req.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/students/me – student updates own editable metadata fields
const updateMyProfile = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const User = require('../models/User');
    const allowed = ['phone', 'address', 'guardianName', 'guardianPhone', 'guardianRelation', 'bloodGroup', 'photo', 'course'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[`metadata.${key}`] = req.body[key];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UPDATES', message: 'No valid fields provided for update.' } });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: { metadata: updatedUser.metadata } });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/notifications – authenticated student fetches their targeted notifications
const getMyNotifications = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Notification = require('../models/Notification');
    let student = await Student.findOne({
      $or: [
        { email: req.user.email },
        { studentId: (req.user.username || '').toUpperCase() },
      ],
    });

    if (!student && req.user.metadata?.studentId) {
      student = await Student.findOne({ studentId: req.user.metadata.studentId });
    }

    if (!student) {
      return res.status(200).json({ success: true, count: 0, unreadCount: 0, notifications: [], data: [] });
    }

    const { unreadOnly } = req.query;
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const filter = {
      $and: [
        {
          $or: [
            { recipient: student._id },
            { recipientUser: req.user._id },
          ],
        },
        {
          createdAt: { $gt: cutoff },
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        },
      ],
    };
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter)
      .populate('drive')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      read: false,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/students/notifications/:id/read – mark single notification read
const markNotificationRead = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Notification = require('../models/Notification');
    const student = await Student.findOne({
      $or: [
        { email: req.user.email },
        { studentId: (req.user.username || '').toUpperCase() },
      ],
    });
    const conditions = [{ recipientUser: req.user._id }];
    if (student) conditions.push({ recipient: student._id });

    const notif = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: conditions,
      },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, error: 'Notification not found or access denied.' });
    return res.json({ success: true, notification: notif, data: notif });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/students/notifications/read-all – mark all student notifications read
const markAllNotificationsRead = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Notification = require('../models/Notification');
    const student = await Student.findOne({
      $or: [
        { email: req.user.email },
        { studentId: (req.user.username || '').toUpperCase() },
      ],
    });
    const conditions = [{ recipientUser: req.user._id }];
    if (student) conditions.push({ recipient: student._id });

    await Notification.updateMany(
      { $or: conditions, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/notifications/:id – permanently delete single student notification
const deleteStudentNotification = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Notification = require('../models/Notification');
    const student = await Student.findOne({
      $or: [
        { email: req.user.email },
        { studentId: (req.user.username || '').toUpperCase() },
      ],
    });
    const conditions = [{ recipientUser: req.user._id }];
    if (student) conditions.push({ recipient: student._id });

    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      $or: conditions,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Notification not found or access denied.' });
    }
    return res.json({ success: true, message: 'Notification deleted permanently.', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/notifications/clear-all – permanently delete all student notifications
const clearAllStudentNotifications = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Notification = require('../models/Notification');
    const student = await Student.findOne({
      $or: [
        { email: req.user.email },
        { studentId: (req.user.username || '').toUpperCase() },
      ],
    });
    const conditions = [{ recipientUser: req.user._id }];
    if (student) conditions.push({ recipient: student._id });

    const result = await Notification.deleteMany({
      $or: conditions,
    });

    return res.json({ success: true, message: 'All notifications cleared permanently.', deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

// Helper to resolve student for authenticated user
const resolveStudentForUser = async (user) => {
  if (!user) return null;
  return Student.findOne({
    $or: [
      { email: user.email },
      { studentId: (user.username || '').toUpperCase() },
      ...(user.metadata?.studentId ? [{ studentId: user.metadata.studentId }] : []),
    ],
  }).populate('department');
};

// GET /api/students/exams - Student views published exams for their semester / course
const getStudentExams = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Exam = require('../models/Exam');
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(200).json({ success: true, count: 0, exams: [], data: [] });
    }

    const filter = {
      $or: [
        { semester: student.semester },
        ...(student.department?.name ? [{ className: { $regex: student.department.name, $options: 'i' } }] : []),
        ...(student.department?.code ? [{ className: { $regex: student.department.code, $options: 'i' } }] : []),
      ],
    };

    if (req.query.semester) {
      filter.semester = Number(req.query.semester);
    }

    const exams = await Exam.find(filter)
      .populate('faculty', 'name email')
      .sort({ examDate: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/attendance-report - Calculate real subject-wise and overall attendance records
const getAttendanceReport = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Attendance = require('../models/Attendance');
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    const attendanceRecords = await Attendance.find({
      'records.student': student._id,
    }).populate('faculty', 'name email').sort({ date: 1 });

    const subjectMap = {};

    attendanceRecords.forEach((session) => {
      const studentRec = session.records.find(
        (r) => r.student && r.student.toString() === student._id.toString()
      );
      if (!studentRec) return;

      const subjectName = session.subject || 'General';
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          semester: session.semester || student.semester,
          className: session.className || '',
          conducted: 0,
          attended: 0,
          missed: 0,
          late: 0,
          sessions: [],
        };
      }

      subjectMap[subjectName].conducted += 1;
      if (studentRec.status === 'Present') {
        subjectMap[subjectName].attended += 1;
      } else if (studentRec.status === 'Late') {
        subjectMap[subjectName].attended += 1;
        subjectMap[subjectName].late += 1;
      } else {
        subjectMap[subjectName].missed += 1;
      }

      subjectMap[subjectName].sessions.push({
        date: session.date,
        status: studentRec.status,
        faculty: session.faculty?.name || 'Faculty',
      });
    });

    const subjects = Object.values(subjectMap).map((sub) => ({
      ...sub,
      percentage: sub.conducted > 0 ? Number(((sub.attended / sub.conducted) * 100).toFixed(1)) : 0,
      status:
        sub.conducted === 0
          ? 'No Classes'
          : (sub.attended / sub.conducted) >= 0.75
          ? 'Eligible'
          : 'Short Attendance',
    }));

    const totalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const totalMissed = subjects.reduce((sum, s) => sum + s.missed, 0);
    const overallPercentage =
      totalConducted > 0 ? Number(((totalAttended / totalConducted) * 100).toFixed(1)) : 0;

    const report = {
      student: {
        id: student._id,
        studentId: student.studentId,
        rollNumber: student.rollNumber || student.studentId,
        name: student.name,
        email: student.email,
        department: student.department?.name || 'Department',
        departmentCode: student.department?.code || '',
        semester: student.semester || 1,
        academicYear: `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
      },
      summary: {
        totalConducted,
        totalAttended,
        totalMissed,
        overallPercentage,
        isEligibleForExams: overallPercentage >= 75,
        criteriaThreshold: 75,
      },
      subjects,
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      report,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/academic-progress - Complete academic progress report
const getAcademicProgressReport = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const Result = require('../models/Result');
    const Assignment = require('../models/Assignment');
    const AssignmentSubmission = require('../models/AssignmentSubmission');

    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    const [assignments, submissions, results] = await Promise.all([
      Assignment.find({ published: true }).populate('course', 'courseCode title'),
      AssignmentSubmission.find({ student: student._id }).populate('assignment'),
      Result.find({ student: student._id }).populate('course', 'courseCode title').populate('faculty', 'name'),
    ]);

    const subMap = new Map();
    submissions.forEach((s) => {
      if (s.assignment?._id) subMap.set(s.assignment._id.toString(), s);
    });

    // Assignment marks
    const assignmentRecords = assignments.map((a) => {
      const sub = subMap.get(a._id.toString());
      const isEvaluated = sub && sub.marksObtained !== undefined && sub.marksObtained !== null;
      let status = 'Pending';
      if (isEvaluated) {
        status = 'Evaluated';
      } else if (sub) {
        status = sub.status === 'late' ? 'Late Submitted' : 'Submitted';
      } else if (new Date(a.dueDate) < new Date()) {
        status = 'Overdue';
      }

      return {
        title: a.title,
        subject: a.course?.title || a.course?.courseCode || 'Coursework',
        courseCode: a.course?.courseCode || '',
        maxMarks: a.maxMarks || 100,
        marksObtained: isEvaluated ? sub.marksObtained : null,
        status,
        submittedAt: sub?.submittedAt || null,
        feedback: sub?.feedback || '',
      };
    });

    const midtermRecords = [];
    const internalRecords = [];
    const practicalRecords = [];
    const otherRecords = [];

    results.forEach((r) => {
      const isEvaluated = r.marksObtained !== undefined && r.marksObtained !== null;
      const item = {
        id: r._id,
        assessmentName: r.assessmentName,
        subject: r.course?.title || r.course?.courseCode || 'Subject',
        courseCode: r.course?.courseCode || '',
        assessmentType: r.assessmentType,
        maxMarks: r.maxMarks,
        marksObtained: isEvaluated ? r.marksObtained : null,
        percentage: isEvaluated && r.maxMarks > 0 ? Number(((r.marksObtained / r.maxMarks) * 100).toFixed(1)) : null,
        status: isEvaluated ? 'Evaluated' : 'Pending',
        semester: r.semester,
        session: r.session,
        feedback: r.feedback || '',
        evaluator: r.faculty?.name || 'Faculty',
      };

      const nameLower = (r.assessmentName || '').toLowerCase();
      const typeLower = (r.assessmentType || '').toLowerCase();

      if (typeLower === 'exam' || nameLower.includes('mid') || nameLower.includes('end-term') || nameLower.includes('semester')) {
        midtermRecords.push(item);
      } else if (typeLower === 'quiz' || nameLower.includes('quiz') || nameLower.includes('internal') || nameLower.includes('unit')) {
        internalRecords.push(item);
      } else if (typeLower === 'project' || typeLower === 'other' || nameLower.includes('lab') || nameLower.includes('practical') || nameLower.includes('viva')) {
        practicalRecords.push(item);
      } else {
        otherRecords.push(item);
      }
    });

    const subjectMap = {};
    const allAssessments = [...assignmentRecords, ...midtermRecords, ...internalRecords, ...practicalRecords, ...otherRecords];

    allAssessments.forEach((item) => {
      const subj = item.subject || 'General';
      if (!subjectMap[subj]) {
        subjectMap[subj] = {
          subject: subj,
          courseCode: item.courseCode || '',
          totalMaxMarks: 0,
          totalObtainedMarks: 0,
          evaluatedCount: 0,
          pendingCount: 0,
        };
      }
      if (item.marksObtained !== null && item.marksObtained !== undefined) {
        subjectMap[subj].totalMaxMarks += item.maxMarks;
        subjectMap[subj].totalObtainedMarks += item.marksObtained;
        subjectMap[subj].evaluatedCount += 1;
      } else {
        subjectMap[subj].pendingCount += 1;
      }
    });

    const subjectPerformance = Object.values(subjectMap).map((s) => ({
      ...s,
      percentage: s.totalMaxMarks > 0 ? Number(((s.totalObtainedMarks / s.totalMaxMarks) * 100).toFixed(1)) : null,
    }));

    let grandMaxMarks = 0;
    let grandObtainedMarks = 0;
    let totalEvaluatedCount = 0;
    let totalPendingCount = 0;

    subjectPerformance.forEach((s) => {
      grandMaxMarks += s.totalMaxMarks;
      grandObtainedMarks += s.totalObtainedMarks;
      totalEvaluatedCount += s.evaluatedCount;
      totalPendingCount += s.pendingCount;
    });

    const overallPercentage = grandMaxMarks > 0 ? Number(((grandObtainedMarks / grandMaxMarks) * 100).toFixed(1)) : null;

    const progressReport = {
      student: {
        id: student._id,
        studentId: student.studentId,
        rollNumber: student.rollNumber || student.studentId,
        name: student.name,
        email: student.email,
        department: student.department?.name || 'Department',
        departmentCode: student.department?.code || '',
        semester: student.semester || 1,
        academicSession: `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
      },
      summary: {
        totalEvaluatedCount,
        totalPendingCount,
        grandMaxMarks,
        grandObtainedMarks,
        overallPercentage,
        grade: overallPercentage === null ? 'N/A' : overallPercentage >= 90 ? 'A+' : overallPercentage >= 80 ? 'A' : overallPercentage >= 70 ? 'B+' : overallPercentage >= 60 ? 'B' : overallPercentage >= 50 ? 'C' : 'F',
      },
      assignmentMarks: assignmentRecords,
      midtermMarks: midtermRecords,
      internalAssessmentMarks: internalRecords,
      practicalMarks: practicalRecords,
      otherMarks: otherRecords,
      subjectPerformance,
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      report: progressReport,
      data: progressReport,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteStudentNotification,
  clearAllStudentNotifications,
  getStudentExams,
  getAttendanceReport,
  getAcademicProgressReport,
};
