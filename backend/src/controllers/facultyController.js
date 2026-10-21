const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Result = require('../models/Result');
const Timetable = require('../models/Timetable');
const LeaveApplication = require('../models/LeaveApplication');
const Notice = require('../models/Notice');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Faculty = require('../models/Faculty');

// ─────────────────── FACULTY PROFILE ───────────────────

exports.getMyProfile = async (req, res) => {
  try {
    const facultyDoc = await Faculty.findOne({ user: req.user._id });
    res.json({
      success: true,
      profile: {
        ...req.user.toJSON(),
        facultyDetails: facultyDoc || {},
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address, qualification, designation, employeeId } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone || address || qualification || designation || employeeId) {
      updates['metadata.phone'] = phone;
      updates['metadata.address'] = address;
      updates['metadata.qualification'] = qualification;
      updates['metadata.designation'] = designation;
      updates['metadata.employeeId'] = employeeId;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );
    res.json({ success: true, profile: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────── STUDENT MANAGEMENT ───────────────────

exports.getAssignedStudents = async (req, res) => {
  try {
    // For demo: return all students or filter by semester
    const { semester } = req.query;
    const query = {};
    if (semester) query.semester = parseInt(semester);
    const students = await Student.find(query).populate('department', 'name shortName');
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('department', 'name shortName');
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────── ATTENDANCE MANAGEMENT ───────────────────

exports.getAttendanceRecords = async (req, res) => {
  try {
    const { className, subject, date } = req.query;
    const query = { faculty: req.user._id };
    if (className) query.className = className;
    if (subject) query.subject = subject;
    if (date) query.date = date;

    const records = await Attendance.find(query)
      .populate('records.student', 'studentId name email semester')
      .sort({ date: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { className, subject, semester, date, records } = req.body;
    if (!className || !subject || !semester || !date || !records?.length) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check for duplicate
    const existing = await Attendance.findOne({
      faculty: req.user._id,
      className,
      subject,
      date,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Attendance for ${className} - ${subject} on ${date} already recorded. Use edit to modify.`,
        existingId: existing._id,
      });
    }

    const totalPresent = records.filter(r => r.status === 'Present').length;
    const totalAbsent = records.filter(r => r.status === 'Absent').length;
    const totalLate = records.filter(r => r.status === 'Late').length;

    const attendance = await Attendance.create({
      faculty: req.user._id,
      className,
      subject,
      semester,
      date,
      records,
      totalPresent,
      totalAbsent,
      totalLate,
    });

    res.status(201).json({ success: true, attendance });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Attendance already marked for this class, subject, and date.',
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.editAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ _id: req.params.id, faculty: req.user._id });
    if (!attendance) return res.status(404).json({ success: false, error: 'Record not found' });

    const { records } = req.body;
    if (records) {
      attendance.records = records;
      attendance.totalPresent = records.filter(r => r.status === 'Present').length;
      attendance.totalAbsent = records.filter(r => r.status === 'Absent').length;
      attendance.totalLate = records.filter(r => r.status === 'Late').length;
    }
    await attendance.save();
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────── ASSIGNMENTS & EXAMS ───────────────────

exports.getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ faculty: req.user._id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, assignments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, dueDate, maxMarks, submissionType } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      faculty: req.user._id,
      dueDate,
      maxMarks,
      submissionType: submissionType || 'text',
      published: true,
    });
    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'studentId name email')
      .sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.giveFeedback = async (req, res) => {
  try {
    const { feedback, marksObtained } = req.body;
    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.id,
      { feedback, marksObtained, gradedBy: req.user._id, gradedAt: new Date() },
      { new: true }
    );
    if (!submission) return res.status(404).json({ success: false, error: 'Submission not found' });
    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Exams
exports.getMyExams = async (req, res) => {
  try {
    const exams = await Exam.find({ faculty: req.user._id }).sort({ examDate: 1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.scheduleExam = async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, faculty: req.user._id });
    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user._id },
      req.body,
      { new: true }
    );
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found' });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────── RESULTS MANAGEMENT ───────────────────

exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ faculty: req.user._id })
      .populate('student', 'studentId name email semester')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.enterResult = async (req, res) => {
  try {
    const { studentId, courseId, assessmentName, assessmentType, maxMarks, marksObtained, semester, session, feedback } = req.body;
    const result = await Result.create({
      student: studentId,
      course: courseId,
      faculty: req.user._id,
      assessmentName,
      assessmentType,
      maxMarks,
      marksObtained,
      semester,
      session,
      feedback,
      published: true,
    });
    res.status(201).json({ success: true, result });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Result for this student, course, and assessment already exists. Use update.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user._id },
      req.body,
      { new: true }
    );
    if (!result) return res.status(404).json({ success: false, error: 'Result not found' });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────── TIMETABLE ───────────────────

exports.getMyTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ faculty: req.user._id })
      .populate('department', 'name shortName')
      .populate('course', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ success: true, timetable });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────── LEAVE MANAGEMENT ───────────────────

exports.applyLeave = async (req, res) => {
  try {
    const leave = await LeaveApplication.create({
      ...req.body,
      faculty: req.user._id,
      status: 'Pending',
    });
    res.status(201).json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveApplication.find({ faculty: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.cancelLeave = async (req, res) => {
  try {
    const leave = await LeaveApplication.findOne({ _id: req.params.id, faculty: req.user._id });
    if (!leave) return res.status(404).json({ success: false, error: 'Leave application not found' });
    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'Only pending leaves can be cancelled.' });
    }
    await leave.deleteOne();
    res.json({ success: true, message: 'Leave application cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────── NOTICES ───────────────────

exports.getNotices = async (req, res) => {
  try {
    const { audience } = req.query;
    const query = {};
    if (audience) query.targetAudience = { $in: [audience, 'All'] };
    else query.targetAudience = { $in: ['Faculty', 'All'] };
    const notices = await Notice.find(query)
      .populate('author', 'name email')
      .sort({ pinned: -1, publishedAt: -1 })
      .limit(50);
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const { title, content, category, targetAudience, pinned } = req.body;
    const notice = await Notice.create({
      title,
      content,
      category,
      targetAudience: targetAudience || 'All',
      pinned: pinned || false,
      author: req.user._id,
      authorName: req.user.name,
    });
    res.status(201).json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
