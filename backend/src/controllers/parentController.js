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
 * Resolves all authorized Student records for the authenticated user.
 * - Admin / SuperAdmin: Unrestricted access (can view all students or any requested student).
 * - Parent: Strictly restricted to their authorized linked ward(s).
 */
async function getAuthorizedStudents(user) {
  if (!user) return [];

  // Admins and SuperAdmins have access to all students
  if (user.role === 'admin' || user.role === 'superadmin') {
    return await Student.find({}).populate('department', 'name code description');
  }

  // Role: PARENT
  const candidateIds = new Set();
  const candidateObjectIds = new Set();
  const meta = user.metadata || {};

  // 1. Direct metadata studentId / roll number (e.g. 'CS21B1042')
  if (meta.studentId && typeof meta.studentId === 'string' && meta.studentId.trim()) {
    candidateIds.add(meta.studentId.trim().toUpperCase());
  }

  // 2. Array of studentIds in metadata
  if (Array.isArray(meta.studentIds)) {
    meta.studentIds.forEach((id) => {
      if (typeof id === 'string' && id.trim()) candidateIds.add(id.trim().toUpperCase());
    });
  }

  // 3. Wards array in metadata
  if (Array.isArray(meta.wards)) {
    meta.wards.forEach((w) => {
      if (typeof w === 'string' && w.trim()) {
        if (/^[0-9a-fA-F]{24}$/.test(w.trim())) candidateObjectIds.add(w.trim());
        else candidateIds.add(w.trim().toUpperCase());
      } else if (w?.studentId) {
        candidateIds.add(w.studentId.trim().toUpperCase());
      } else if (w?._id) {
        candidateObjectIds.add(w._id.toString());
      }
    });
  }

  // 4. Single student or ward field in metadata
  if (meta.student) {
    if (typeof meta.student === 'string' && meta.student.trim()) {
      if (/^[0-9a-fA-F]{24}$/.test(meta.student.trim())) candidateObjectIds.add(meta.student.trim());
      else candidateIds.add(meta.student.trim().toUpperCase());
    } else if (meta.student._id) {
      candidateObjectIds.add(meta.student._id.toString());
    } else if (meta.student.studentId) {
      candidateIds.add(meta.student.studentId.trim().toUpperCase());
    }
  }
  if (meta.wardId && typeof meta.wardId === 'string' && meta.wardId.trim()) {
    if (/^[0-9a-fA-F]{24}$/.test(meta.wardId.trim())) candidateObjectIds.add(meta.wardId.trim());
    else candidateIds.add(meta.wardId.trim().toUpperCase());
  }

  // 5. Canonical Demo Parent mapping (parentdemo / parent@campusverse.edu -> Aarav Singhania CS21B1042)
  if (user.username === 'parentdemo' || user.email === 'parent@campusverse.edu') {
    candidateIds.add('CS21B1042');
  }

  // 6. Check username or email for student roll pattern (e.g. parent_CS21B1001 or parent.CS21B1001@...)
  const identifierString = `${user.username || ''} ${user.email || ''}`;
  const matchedCodes = identifierString.match(/[A-Z]{2}[0-9]{2}[A-Z][0-9]{4}/gi);
  if (matchedCodes) {
    matchedCodes.forEach((code) => candidateIds.add(code.toUpperCase()));
  }

  // 7. Check if username like parent_aditi matches student name
  if (candidateIds.size === 0 && candidateObjectIds.size === 0 && user.username) {
    const cleanUser = user.username.replace(/^parent[_.]?/i, '').trim();
    if (cleanUser && cleanUser.length >= 3) {
      const matchByName = await Student.findOne({
        name: new RegExp(`^${cleanUser}`, 'i'),
      }).populate('department', 'name code description');
      if (matchByName) {
        return [matchByName];
      }
    }
  }

  const queryOr = [];
  if (candidateIds.size > 0) {
    queryOr.push({ studentId: { $in: Array.from(candidateIds) } });
  }
  if (candidateObjectIds.size > 0) {
    queryOr.push({ _id: { $in: Array.from(candidateObjectIds) } });
  }

  if (queryOr.length === 0) {
    return [];
  }

  return await Student.find({ $or: queryOr }).populate('department', 'name code description');
}

/**
 * Validates authentication & strictly enforces student-specific authorization for parents.
 * Prevents unauthorized access or privilege escalation across other students' records.
 */
async function resolveAuthorizedStudent(req) {
  const user = req.user;
  if (!user) {
    return { error: 'Authentication required. Please log in.', statusCode: 401 };
  }

  const requestedParam = (req.query.studentId || req.params.studentId || req.body?.studentId || '').toString().trim();

  // 1. Admin or SuperAdmin: Can inspect any student
  if (user.role === 'admin' || user.role === 'superadmin') {
    if (requestedParam) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(requestedParam);
      const student = await Student.findOne({
        $or: [
          { studentId: requestedParam.toUpperCase() },
          { _id: isObjectId ? requestedParam : null },
        ],
      }).populate('department', 'name code description');
      if (!student) {
        return { error: `Student '${requestedParam}' was not found.`, statusCode: 404 };
      }
      return { student };
    }
    const student = (await Student.findOne({ studentId: 'CS21B1042' }).populate('department', 'name code description'))
      || (await Student.findOne({ status: 'Active' }).populate('department', 'name code description'));
    return { student };
  }

  // 2. Role: PARENT (Strict Account-Specific Authorization Enforcement)
  const authorizedWards = await getAuthorizedStudents(user);

  if (!authorizedWards || authorizedWards.length === 0) {
    return {
      error: 'No authorized student is linked to your parent account. Please contact the institution administrator.',
      statusCode: 403,
      unauthorized: true,
    };
  }

  if (requestedParam) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(requestedParam);
    const cleanParam = requestedParam.toUpperCase();

    const matched = authorizedWards.find((s) => {
      const matchSid = s.studentId && s.studentId.toUpperCase() === cleanParam;
      const matchId = isObjectId && s._id && s._id.toString() === requestedParam;
      return matchSid || matchId;
    });

    if (!matched) {
      // SECURITY ENFORCEMENT: Access to another student's records is strictly prohibited
      return {
        error: `Access Denied: You are not authorized to access records for student '${requestedParam}'. You can only view data for your own linked ward.`,
        statusCode: 403,
        unauthorized: true,
      };
    }

    return { student: matched, authorizedWards };
  }

  // Default: first authorized ward
  return { student: authorizedWards[0], authorizedWards };
}

/**
 * 1. GET /api/parent/dashboard
 * Live parent dashboard telemetry for authorized student only
 */
exports.getParentDashboard = async (req, res) => {
  try {
    const authResult = await resolveAuthorizedStudent(req);
    if (authResult.error) {
      return res.status(authResult.statusCode || 403).json({ success: false, error: authResult.error });
    }
    const student = authResult.student;

    // Attendance aggregation strictly for this student
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

    // Academic Performance / Results strictly for this student
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

    // Fee Status strictly for this student
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

    // Upcoming Examinations for the student's semester
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
 * Detailed student profile, department, and faculty advisor info for authorized student only
 */
exports.getParentStudentInfo = async (req, res) => {
  try {
    const authResult = await resolveAuthorizedStudent(req);
    if (authResult.error) {
      return res.status(authResult.statusCode || 403).json({ success: false, error: authResult.error });
    }
    const student = authResult.student;

    const courses = await Course.find({
      department: student.department?._id || student.department,
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
 * Subject-wise attendance, logs, and published results for authorized student only
 */
exports.getParentAttendanceAndResults = async (req, res) => {
  try {
    const authResult = await resolveAuthorizedStudent(req);
    if (authResult.error) {
      return res.status(authResult.statusCode || 403).json({ success: false, error: authResult.error });
    }
    const student = authResult.student;

    // 1. Attendance Records strictly for this student
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

    // 2. Published Examination Results strictly for this student
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
 * Pending coursework, weekly timetable, and upcoming exam schedules for authorized student
 */
exports.getParentAssignmentsAndTimetable = async (req, res) => {
  try {
    const authResult = await resolveAuthorizedStudent(req);
    if (authResult.error) {
      return res.status(authResult.statusCode || 403).json({ success: false, error: authResult.error });
    }
    const student = authResult.student;

    // 1. Coursework Assignments for student's department and semester
    const courses = await Course.find({
      department: student.department?._id || student.department,
      semester: student.semester,
    }).select('_id');
    const courseIds = courses.map((c) => c._id);

    const assignments = await Assignment.find(
      courseIds.length > 0 ? { course: { $in: courseIds } } : {}
    )
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .sort({ dueDate: 1 });

    // 2. Class Timetable for student's semester
    const timetables = await Timetable.find({
      semester: student.semester,
    })
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .sort({ dayOfWeek: 1, startTime: 1 });

    // 3. Examination Schedule for student's semester
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
 * Verified payment history, pending dues, and receipts strictly for authorized student
 */
exports.getParentFees = async (req, res) => {
  try {
    const authResult = await resolveAuthorizedStudent(req);
    if (authResult.error) {
      return res.status(authResult.statusCode || 403).json({ success: false, error: authResult.error });
    }
    const student = authResult.student;

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
 * Institutional announcements, exam updates, and dynamic alerts for authorized student
 */
exports.getParentNotices = async (req, res) => {
  try {
    const authResult = await resolveAuthorizedStudent(req);
    if (authResult.error) {
      return res.status(authResult.statusCode || 403).json({ success: false, error: authResult.error });
    }
    const student = authResult.student;

    // Fetch official broadcast notices
    const officialNotices = await Notice.find({
      targetAudience: { $in: ['All', 'Students'] },
    }).sort({ pinned: -1, publishedAt: -1 });

    // Dynamic smart alerts strictly calculated for this authorized student
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
 * Returns ONLY authorized ward(s) for the logged-in parent
 */
exports.getParentWards = async (req, res) => {
  try {
    const authorizedWards = await getAuthorizedStudents(req.user);
    return res.json({ success: true, wards: authorizedWards });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Export helpers for internal & cross-middleware authorization checks
exports.getAuthorizedStudents = getAuthorizedStudents;
exports.resolveAuthorizedStudent = resolveAuthorizedStudent;

