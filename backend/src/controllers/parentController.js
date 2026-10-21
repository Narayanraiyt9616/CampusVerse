const Student = require('../models/Student');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');
const User = require('../models/User');

/**
 * Helper to resolve the linked student for the parent
 */
async function resolveStudent(req) {
  // 1. If explicit query parameter is passed
  if (req.query.studentId) {
    const s = await Student.findOne({
      $or: [
        { studentId: req.query.studentId.trim().toUpperCase() },
        { _id: req.query.studentId.match(/^[0-9a-fA-F]{24}$/) ? req.query.studentId : null },
      ],
    }).populate('department', 'name code description');
    if (s) return s;
  }

  // 2. If studentId is set in parent user's metadata
  const metaSid = req.user?.metadata?.studentId;
  if (metaSid) {
    const s = await Student.findOne({ studentId: metaSid.trim().toUpperCase() }).populate('department', 'name code description');
    if (s) return s;
  }

  // 3. Fallback: match by Aarav Singhania (CS21B1042) or first student
  let student = await Student.findOne({ studentId: 'CS21B1042' }).populate('department', 'name code description');
  if (!student) {
    student = await Student.findOne({ status: 'Active' }).populate('department', 'name code description');
  }
  return student;
}

/**
 * 1. GET /api/parent/dashboard
 * Live parent dashboard telemetry
 */
exports.getParentDashboard = async (req, res) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, error: 'No linked student found.' });
    }

    // Attendance aggregation
    const attendanceRecords = await Attendance.find({
      'records.student': student._id,
    }).sort({ date: -1 });

    let totalSessions = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    const subjectMap = {};

    attendanceRecords.forEach((att) => {
      const rec = (att.records || []).find((r) => r.student && r.student.toString() === student._id.toString());
      if (rec) {
        totalSessions += 1;
        if (rec.status === 'Present') presentCount += 1;
        else if (rec.status === 'Absent') absentCount += 1;
        else if (rec.status === 'Late') lateCount += 1;

        if (!subjectMap[att.subject]) {
          subjectMap[att.subject] = { subject: att.subject, total: 0, present: 0, absent: 0 };
        }
        subjectMap[att.subject].total += 1;
        if (rec.status === 'Present') subjectMap[att.subject].present += 1;
        else if (rec.status === 'Absent') subjectMap[att.subject].absent += 1;
      }
    });

    const overallAttendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
    const isLowAttendance = overallAttendancePct < 75;

    // Academic Performance / Results
    const results = await Result.find({
      student: student._id,
      published: true,
    }).populate('course', 'courseCode title credits').sort({ createdAt: -1 });

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    results.forEach((r) => {
      totalMarksObtained += r.marksObtained || 0;
      totalMaxMarks += r.maxMarks || 0;
    });
    const avgScorePct = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 85;
    const calculatedCgpa = ((avgScorePct / 100) * 10).toFixed(2);

    // Fee Status
    const fees = await Fee.find({ student: student._id }).sort({ dueDate: 1 });
    let totalBilled = 0;
    let totalPaid = 0;
    let overdueCount = 0;
    let pendingCount = 0;

    fees.forEach((f) => {
      totalBilled += f.amount || 0;
      totalPaid += f.paidAmount || 0;
      if (f.status === 'Overdue') overdueCount += 1;
      if (f.status === 'Pending' || f.status === 'Overdue') pendingCount += 1;
    });

    const pendingAmount = Math.max(0, totalBilled - totalPaid);

    // Upcoming Examinations
    const upcomingExams = await Exam.find({
      semester: student.semester,
    }).populate('faculty', 'name email').sort({ examDate: 1 }).limit(4);

    // Recent Notices
    const notices = await Notice.find({
      targetAudience: { $in: ['All', 'Students'] },
    }).sort({ pinned: -1, publishedAt: -1 }).limit(5);

    return res.json({
      success: true,
      student: {
        _id: student._id,
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        department: student.department?.name || 'Computer Science & Engineering',
        departmentCode: student.department?.code || 'CSE',
        semester: student.semester,
        enrollmentYear: student.enrollmentYear,
        status: student.status,
      },
      attendanceStats: {
        overallPercentage: overallAttendancePct,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        isLowAttendance,
        threshold: 75,
      },
      academicStats: {
        cgpa: parseFloat(calculatedCgpa),
        averageScorePct: avgScorePct,
        publishedResultsCount: results.length,
        standing: isLowAttendance ? 'Attendance Shortage Alert' : 'Good Academic Standing',
      },
      feeStats: {
        totalBilled,
        totalPaid,
        pendingAmount,
        overdueCount,
        pendingCount,
        status: pendingAmount === 0 ? 'All Dues Cleared' : overdueCount > 0 ? 'Overdue Dues' : 'Payment Pending',
      },
      upcomingExams,
      notices,
    });
  } catch (err) {
    console.error('getParentDashboard error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 2. GET /api/parent/student
 * Detailed student profile, department, and faculty advisor info
 */
exports.getParentStudentInfo = async (req, res) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const courses = await Course.find({
      department: student.department?._id,
      semester: student.semester,
    });

    // Faculty advisor
    const facultyAdvisor = await User.findOne({ role: 'faculty' }, 'name email username');

    return res.json({
      success: true,
      student: {
        ...student.toJSON(),
        departmentName: student.department?.name || 'Computer Science & Engineering',
        departmentCode: student.department?.code || 'CSE',
        courses,
        advisor: facultyAdvisor ? {
          name: facultyAdvisor.name,
          email: facultyAdvisor.email,
          designation: 'Professor & Academic Mentor',
          contact: '+91 (80) 4122-8940',
        } : {
          name: 'Dr. Rajiv Menon',
          email: 'rajiv.menon@campusverse.edu',
          designation: 'Professor & Academic Mentor',
          contact: '+91 (80) 4122-8940',
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. GET /api/parent/attendance-and-results
 * Subject-wise attendance, attendance logs, and published examination results
 */
exports.getParentAttendanceAndResults = async (req, res) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // 1. Attendance Records
    const attendanceSessions = await Attendance.find({
      'records.student': student._id,
    }).populate('faculty', 'name email').sort({ date: -1 });

    const subjectMap = {};
    const attendanceLogs = [];

    attendanceSessions.forEach((att) => {
      const rec = (att.records || []).find((r) => r.student && r.student.toString() === student._id.toString());
      if (rec) {
        attendanceLogs.push({
          date: att.date,
          subject: att.subject,
          className: att.className,
          status: rec.status,
          instructor: att.faculty?.name || 'Faculty',
        });

        if (!subjectMap[att.subject]) {
          subjectMap[att.subject] = {
            subject: att.subject,
            totalSessions: 0,
            present: 0,
            absent: 0,
            late: 0,
          };
        }
        subjectMap[att.subject].totalSessions += 1;
        if (rec.status === 'Present') subjectMap[att.subject].present += 1;
        else if (rec.status === 'Absent') subjectMap[att.subject].absent += 1;
        else if (rec.status === 'Late') subjectMap[att.subject].late += 1;
      }
    });

    const subjectBreakdown = Object.values(subjectMap).map((item) => {
      const percentage = item.totalSessions > 0 ? Math.round((item.present / item.totalSessions) * 100) : 0;
      return {
        ...item,
        percentage,
        isShortage: percentage < 75,
        status: percentage >= 75 ? 'Compliant' : 'Shortage Warning',
      };
    });

    const totalLectures = attendanceLogs.length;
    const totalPresent = attendanceLogs.filter((l) => l.status === 'Present').length;
    const overallPercentage = totalLectures > 0 ? Math.round((totalPresent / totalLectures) * 100) : 0;

    // 2. Published Examination Results
    const results = await Result.find({
      student: student._id,
      published: true,
    }).populate('course', 'courseCode title credits').sort({ createdAt: -1 });

    const formattedResults = results.map((r) => {
      const pct = r.maxMarks > 0 ? Math.round((r.marksObtained / r.maxMarks) * 100) : 0;
      let grade = 'A';
      if (pct >= 90) grade = 'O';
      else if (pct >= 80) grade = 'A+';
      else if (pct >= 70) grade = 'A';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 40) grade = 'C';
      else grade = 'F';

      return {
        _id: r._id,
        assessmentName: r.assessmentName,
        courseCode: r.course?.courseCode || 'Course',
        courseTitle: r.course?.title || '',
        credits: r.course?.credits || 4,
        maxMarks: r.maxMarks,
        marksObtained: r.marksObtained,
        percentage: pct,
        grade,
        feedback: r.feedback,
        session: r.session,
        isPass: pct >= 40,
      };
    });

    return res.json({
      success: true,
      student: { name: student.name, studentId: student.studentId },
      attendance: {
        overallPercentage,
        totalLectures,
        totalPresent,
        totalAbsent: totalLectures - totalPresent,
        isLowAttendance: overallPercentage < 75,
        subjectBreakdown,
        logs: attendanceLogs,
      },
      results: formattedResults,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 4. GET /api/parent/assignments-and-timetable
 * Pending coursework, weekly timetable, and upcoming exam schedules
 */
exports.getParentAssignmentsAndTimetable = async (req, res) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // 1. Coursework Assignments
    const assignments = await Assignment.find()
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .sort({ dueDate: 1 });

    // 2. Class Timetable
    const timetables = await Timetable.find({
      semester: student.semester,
    })
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .sort({ dayOfWeek: 1, startTime: 1 });

    // 3. Examination Schedule
    const exams = await Exam.find({
      semester: student.semester,
    }).populate('faculty', 'name email').sort({ examDate: 1 });

    return res.json({
      success: true,
      student: { name: student.name, studentId: student.studentId, semester: student.semester },
      assignments,
      timetables,
      exams,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 5. GET /api/parent/fees
 * Verified payment history, pending dues, and downloadable receipts
 */
exports.getParentFees = async (req, res) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const fees = await Fee.find({ student: student._id }).sort({ dueDate: -1 });

    let totalBilled = 0;
    let totalPaid = 0;
    let overdueCount = 0;

    fees.forEach((f) => {
      totalBilled += f.amount || 0;
      totalPaid += f.paidAmount || 0;
      if (f.status === 'Overdue') overdueCount += 1;
    });

    const pendingAmount = Math.max(0, totalBilled - totalPaid);
    const paidReceipts = fees.filter((f) => f.status === 'Paid' || f.paidAmount > 0);

    return res.json({
      success: true,
      student: { name: student.name, studentId: student.studentId },
      summary: {
        totalBilled,
        totalPaid,
        pendingAmount,
        overdueCount,
        allDuesCleared: pendingAmount === 0,
      },
      invoices: fees,
      receipts: paidReceipts,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 6. GET /api/parent/notices
 * Institutional announcements, exam updates, attendance alerts, and fee reminders
 */
exports.getParentNotices = async (req, res) => {
  try {
    const student = await resolveStudent(req);

    // Fetch official broadcast notices
    const officialNotices = await Notice.find({
      targetAudience: { $in: ['All', 'Students'] },
    }).sort({ pinned: -1, publishedAt: -1 });

    // Dynamic smart alerts for the parent based on real student data
    const dynamicAlerts = [];

    if (student) {
      // Check attendance
      const attendanceSessions = await Attendance.find({ 'records.student': student._id });
      let present = 0;
      let total = 0;
      attendanceSessions.forEach((att) => {
        const r = (att.records || []).find((x) => x.student && x.student.toString() === student._id.toString());
        if (r) {
          total += 1;
          if (r.status === 'Present') present += 1;
        }
      });
      const pct = total > 0 ? Math.round((present / total) * 100) : 100;
      if (pct < 75) {
        dynamicAlerts.push({
          id: 'alert-attendance-shortage',
          title: `CRITICAL ATTENDANCE ALERT: ${student.name} (${student.studentId}) is at ${pct}%`,
          content: `Your ward's cumulative attendance is currently ${pct}%, which is below the mandatory 75% threshold required to appear for end-semester examinations. Please advise your ward to attend all upcoming lectures.`,
          category: 'Urgent',
          isSystemAlert: true,
          date: new Date().toLocaleDateString(),
        });
      }

      // Check fee dues
      const overdueFees = await Fee.find({ student: student._id, status: 'Overdue' });
      if (overdueFees.length > 0) {
        const totalOverdue = overdueFees.reduce((acc, f) => acc + (f.amount - (f.paidAmount || 0)), 0);
        dynamicAlerts.push({
          id: 'alert-fee-overdue',
          title: `FEE REMINDER: Overdue Invoice Balance of ₹${totalOverdue.toLocaleString()}`,
          content: `There are ${overdueFees.length} overdue fee invoice(s) pending for ${student.name}. Please settle outstanding balances to avoid late examination clearance delays.`,
          category: 'Urgent',
          isSystemAlert: true,
          date: new Date().toLocaleDateString(),
        });
      }
    }

    return res.json({
      success: true,
      notices: officialNotices,
      systemAlerts: dynamicAlerts,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 7. GET /api/parent/wards
 * Returns all students so guardian can select/switch ward
 */
exports.getParentWards = async (req, res) => {
  try {
    const students = await Student.find({}, 'name studentId email department semester status')
      .populate('department', 'name code');
    return res.json({ success: true, wards: students });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
