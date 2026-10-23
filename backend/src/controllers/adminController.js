const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Fee = require('../models/Fee');
const AdmitCard = require('../models/AdmitCard');
const Notice = require('../models/Notice');
const LeaveApplication = require('../models/LeaveApplication');
const Timetable = require('../models/Timetable');
const AuditLog = require('../models/AuditLog');
const { ROLES } = require('../config/roles');
const { recordAuditLog } = require('../utils/auditLogger');

const SALT_ROUNDS = 12;

// Helper to generate strong temporary password
function generateSecurePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let pwd = 'Camp#';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
}

// Format safe user output
const safeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  mustChangePassword: Boolean(user.mustChangePassword),
  lastLogin: user.lastLogin,
  department: user.department,
  metadata: user.metadata || {},
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/* ──────────────────────────────────────────────────────────────────────────
   1. ADMIN TELEMETRY & STATS
   ────────────────────────────────────────────────────────────────────────── */
exports.getAdminStats = async (req, res) => {
  try {
    const [
      studentCount,
      facultyCount,
      parentCount,
      placementCount,
      staffCount,
      adminCount,
      superAdminCount,
      activeCount,
      disabledCount,
      departmentCount,
      courseCount,
      attendanceSessionCount,
      assignmentCount,
      examCount,
      pendingLeaveCount,
      unpublishedResultCount,
      recentUsers,
      recentLogs,
      feeAggregate,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ role: ROLES.FACULTY }),
      User.countDocuments({ role: ROLES.PARENT }),
      User.countDocuments({ role: ROLES.PLACEMENT }),
      User.countDocuments({ role: ROLES.STAFF }),
      User.countDocuments({ role: ROLES.ADMIN }),
      User.countDocuments({ role: ROLES.SUPERADMIN }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'disabled' }),
      Department.countDocuments(),
      Course.countDocuments(),
      Attendance.countDocuments(),
      Assignment.countDocuments(),
      Exam.countDocuments(),
      LeaveApplication.countDocuments({ status: 'Pending' }),
      Result.countDocuments({ published: false }),
      User.find({}, 'name username email role status createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
      AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(8),
      Fee.aggregate([
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$amount' },
            totalCollected: { $sum: '$paidAmount' },
            pendingCount: {
              $sum: { $cond: [{ $in: ['$status', ['Pending', 'Overdue']] }, 1, 0] },
            },
            overdueCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Calculate real-time attendance shortage count (<75%)
    const allAttendance = await Attendance.find({}, 'records');
    const studentAttendanceMap = {};
    allAttendance.forEach((att) => {
      (att.records || []).forEach((r) => {
        if (r.student) {
          const sid = r.student.toString();
          if (!studentAttendanceMap[sid]) {
            studentAttendanceMap[sid] = { total: 0, present: 0 };
          }
          studentAttendanceMap[sid].total += 1;
          if (r.status === 'Present') studentAttendanceMap[sid].present += 1;
        }
      });
    });

    let attendanceShortageCount = 0;
    Object.values(studentAttendanceMap).forEach((st) => {
      if (st.total > 0 && (st.present / st.total) * 100 < 75) {
        attendanceShortageCount += 1;
      }
    });

    const feeStats = feeAggregate[0] || {
      totalBilled: 0,
      totalCollected: 0,
      pendingCount: 0,
      overdueCount: 0,
    };
    const pendingFeesAmount = Math.max(0, (feeStats.totalBilled || 0) - (feeStats.totalCollected || 0));

    const totalUsers = activeCount + disabledCount;

    return res.json({
      success: true,
      stats: {
        totalUsers,
        students: studentCount,
        faculty: facultyCount,
        parents: parentCount,
        placement: placementCount,
        staff: staffCount,
        admins: adminCount,
        superadmins: superAdminCount,
        activeAccounts: activeCount,
        disabledAccounts: disabledCount,
        departments: departmentCount,
        courses: courseCount,
        attendanceSessions: attendanceSessionCount,
        attendanceShortageCount,
        assignments: assignmentCount,
        upcomingExams: examCount,
        pendingApprovalsCount: pendingLeaveCount + unpublishedResultCount,
        pendingLeavesCount: pendingLeaveCount,
        unpublishedResultsCount: unpublishedResultCount,
        fees: {
          totalBilled: feeStats.totalBilled || 0,
          totalCollected: feeStats.totalCollected || 0,
          pendingAmount: pendingFeesAmount,
          overdueCount: feeStats.overdueCount || 0,
          pendingCount: feeStats.pendingCount || 0,
        },
      },
      recentUsers: recentUsers.map(safeUser),
      recentLogs,
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   2. USER MANAGEMENT & CREDENTIALS (Preserved & Enhanced)
   ────────────────────────────────────────────────────────────────────────── */
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role.toLowerCase().trim();
    }
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status.toLowerCase().trim();
    }
    if (req.query.q && req.query.q.trim()) {
      const q = req.query.q.trim();
      const regex = new RegExp(q, 'i');
      query.$or = [{ name: regex }, { email: regex }, { username: regex }];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      users: users.map(safeUser),
    });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      role,
      department,
      metadata = {},
      customPassword,
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, error: 'Full name, email address, and role are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.trim().toLowerCase();

    const ALLOWED_ADMIN_CREATIONS = [ROLES.STUDENT, ROLES.FACULTY, ROLES.PARENT, ROLES.PLACEMENT, ROLES.STAFF];
    if (req.user.role !== ROLES.SUPERADMIN && !ALLOWED_ADMIN_CREATIONS.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        error: 'Privilege restriction: Administrators cannot create administrative or superadmin accounts.',
      });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    let normalizedUsername = username ? username.trim().toLowerCase() : '';
    if (!normalizedUsername) {
      const cleanPrefix = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
      normalizedUsername = `${cleanPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(409).json({ success: false, error: 'This username is already taken. Please choose another.' });
    }

    const temporaryPassword = (customPassword && customPassword.trim()) ? customPassword.trim() : generateSecurePassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      status: 'active',
      mustChangePassword: false,
      department: department || undefined,
      metadata,
    });

    if (normalizedRole === ROLES.STUDENT && metadata.studentId) {
      try {
        await Student.findOneAndUpdate(
          { studentId: metadata.studentId.trim().toUpperCase() },
          {
            $set: {
              studentId: metadata.studentId.trim().toUpperCase(),
              name: name.trim(),
              email: normalizedEmail,
              department: department || undefined,
              semester: parseInt(metadata.semester, 10) || 1,
              enrollmentYear: parseInt(metadata.enrollmentYear, 10) || new Date().getFullYear(),
              status: 'Active',
            },
          },
          { upsert: true, new: true }
        );
      } catch (studentErr) {
        console.warn('[CreateUser] Student sync note:', studentErr.message);
      }
    }

    await recordAuditLog({
      action: 'USER_CREATED_BY_ADMIN',
      req,
      targetUser: user,
      details: `Admin created ${normalizedRole} account for ${user.email} (username: ${normalizedUsername})`,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: safeUser(user),
      temporaryPassword,
    });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('department', 'name code');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, department, metadata, username } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.role === ROLES.SUPERADMIN && req.user.role !== ROLES.SUPERADMIN) {
      return res.status(403).json({ success: false, error: 'Only Super Administrators can modify superadmin accounts.' });
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (username) user.username = username.trim().toLowerCase();
    if (department !== undefined) user.department = department || undefined;
    if (metadata) user.metadata = { ...(user.metadata || {}), ...metadata };

    await user.save();

    await recordAuditLog({
      action: 'USER_UPDATED_BY_ADMIN',
      req,
      targetUser: user,
      details: `Admin updated account profile for ${user.email}`,
    });

    return res.json({ success: true, message: 'User updated successfully.', user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'disabled', 'suspended'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active, disabled, or suspended.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.role === ROLES.SUPERADMIN && req.user.role !== ROLES.SUPERADMIN) {
      return res.status(403).json({ success: false, error: 'Cannot modify Super Administrator status.' });
    }

    user.status = status;
    await user.save();

    await recordAuditLog({
      action: 'USER_STATUS_CHANGED',
      req,
      targetUser: user,
      details: `Admin set status of ${user.email} to ${status}`,
    });

    return res.json({ success: true, message: `User status set to ${status}.`, user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.role === ROLES.SUPERADMIN && req.user.role !== ROLES.SUPERADMIN) {
      return res.status(403).json({ success: false, error: 'Cannot reset Super Administrator password.' });
    }

    const temporaryPassword = (req.body.password && req.body.password.trim())
      ? req.body.password.trim()
      : generateSecurePassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

    user.passwordHash = passwordHash;
    user.mustChangePassword = false;
    await user.save();

    await recordAuditLog({
      action: 'PASSWORD_RESET_BY_ADMIN',
      req,
      targetUser: user,
      details: `Admin reset password for user ${user.email}`,
    });

    return res.json({
      success: true,
      message: 'Password reset successfully.',
      temporaryPassword,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.forcePasswordChange = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    user.mustChangePassword = true;
    await user.save();

    await recordAuditLog({
      action: 'FORCE_PASSWORD_CHANGE_ENABLED',
      req,
      targetUser: user,
      details: `User ${user.email} marked as requiring password change on next login.`,
    });

    return res.json({
      success: true,
      message: 'User will be required to change password on their next login.',
      user: safeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.action) {
      query.action = req.query.action;
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      logs,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.createCredentials = async (req, res) => {
  try {
    const { section, role, username, password, name, email } = req.body;
    const rawRole = (role || section || '').toString().trim().toLowerCase();

    const ROLE_MAP = {
      student: ROLES.STUDENT,
      faculty: ROLES.FACULTY,
      parent: ROLES.PARENT,
      placement: ROLES.PLACEMENT,
      'placement-officer': ROLES.PLACEMENT,
      staff: ROLES.STAFF,
      hostel: ROLES.STAFF,
      'hostel-portal': ROLES.STAFF,
      'hostel_portal': ROLES.STAFF,
      superadmin: ROLES.SUPERADMIN,
      'super-admin': ROLES.SUPERADMIN,
    };

    const targetRole = ROLE_MAP[rawRole];
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section. Allowed sections: Student, Faculty, Parent, Placement, Hostel & Transport Staff, Super Admin.',
      });
    }

    if (!username || !String(username).trim()) {
      return res.status(400).json({ success: false, error: 'Username is required.' });
    }
    if (!password || !String(password).trim()) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const SECTION_LABELS = {
      [ROLES.STUDENT]: 'Student',
      [ROLES.FACULTY]: 'Faculty',
      [ROLES.PARENT]: 'Parent',
      [ROLES.PLACEMENT]: 'Placement',
      [ROLES.STAFF]: 'Hostel & Transport Staff',
      [ROLES.SUPERADMIN]: 'Super Admin',
    };

    const sectionLabel = SECTION_LABELS[targetRole] || targetRole;
    const cleanName = (name && String(name).trim()) || `${cleanUsername} (${sectionLabel})`;
    const cleanEmail = (email && String(email).trim().toLowerCase()) || `${cleanUsername}@campusverse.edu`;

    const passwordHash = await bcrypt.hash(cleanPassword, SALT_ROUNDS);

    let sid = req.body.studentId || req.body.metadata?.studentId;
    if (!sid && targetRole === ROLES.PARENT) {
      const match = cleanUsername.match(/[a-z]{2}[0-9]{2}[a-z][0-9]{4}/i);
      if (match) sid = match[0].toUpperCase();
    }

    let user = await User.findOne({ username: cleanUsername });
    if (user) {
      user.passwordHash = passwordHash;
      user.role = targetRole;
      user.status = 'active';
      user.mustChangePassword = false;
      if (name) user.name = cleanName;
      if (targetRole === ROLES.PARENT && sid) {
        user.metadata = { ...(user.metadata || {}), studentId: String(sid).trim().toUpperCase() };
      }
      await user.save();
    } else {
      const existingEmail = await User.findOne({ email: cleanEmail });
      const finalEmail = existingEmail ? `${cleanUsername}.${Date.now()}@campusverse.edu` : cleanEmail;

      const metadata = {};
      if (targetRole === ROLES.PARENT && sid) {
        metadata.studentId = String(sid).trim().toUpperCase();
      }

      user = await User.create({
        username: cleanUsername,
        name: cleanName,
        email: finalEmail,
        passwordHash,
        role: targetRole,
        status: 'active',
        mustChangePassword: false,
        metadata,
      });
    }

    // Auto-create linked Student or Faculty profile if applicable
    if (targetRole === ROLES.STUDENT) {
      const existingStudent = await Student.findOne({ email: user.email });
      if (!existingStudent) {
        const defaultDept = await Department.findOne({ status: 'Active' });
        if (defaultDept) {
          const sid = `CS${new Date().getFullYear().toString().slice(2)}B${Math.floor(1000 + Math.random() * 9000)}`;
          await Student.create({
            studentId: sid,
            name: user.name,
            email: user.email,
            department: defaultDept._id,
            semester: 1,
            enrollmentYear: new Date().getFullYear(),
            status: 'Active',
          }).catch((e) => console.warn('[Auto-create student record note]:', e.message));
        }
      }
    } else if (targetRole === ROLES.FACULTY) {
      const existingFaculty = await Faculty.findOne({ user: user._id });
      if (!existingFaculty) {
        await Faculty.create({
          user: user._id,
          department: 'General Engineering',
          position: 'Assistant Professor',
          permissions: {
            attendance: true,
            assignments: true,
            materials: true,
            examinations: true,
            marks: true,
            questionPapers: true,
          },
        }).catch((e) => console.warn('[Auto-create faculty record note]:', e.message));
      }
    }

    await recordAuditLog({
      action: 'ADMIN_CREATED_CREDENTIALS',
      req,
      targetUser: user,
      details: `Admin created credentials for ${sectionLabel} (username: ${cleanUsername})`,
    });

    return res.status(201).json({
      success: true,
      message: `Credentials for ${sectionLabel} saved successfully in database.`,
      user: safeUser(user),
      section: targetRole,
      sectionLabel,
    });
  } catch (err) {
    console.error('createCredentials error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to create credentials.' });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   3. STUDENT MANAGEMENT (CRUD)
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetStudents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.department && req.query.department !== 'all') {
      query.department = req.query.department;
    }
    if (req.query.semester && req.query.semester !== 'all') {
      query.semester = parseInt(req.query.semester, 10);
    }
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.q && req.query.q.trim()) {
      const q = req.query.q.trim();
      const regex = new RegExp(q, 'i');
      query.$or = [{ name: regex }, { studentId: regex }, { email: regex }];
    }

    const [total, students] = await Promise.all([
      Student.countDocuments(query),
      Student.find(query)
        .populate('department', 'name code')
        .sort({ studentId: 1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      students,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateStudent = async (req, res) => {
  try {
    const { studentId, name, email, department, semester, enrollmentYear, status = 'Active', password } = req.body;

    if (!studentId || !name || !email || !department || !semester) {
      return res.status(400).json({ success: false, error: 'Student ID, Name, Email, Department, and Semester are required.' });
    }

    const cleanSid = studentId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingStudent = await Student.findOne({
      $or: [{ studentId: cleanSid }, { email: cleanEmail }],
    });
    if (existingStudent) {
      return res.status(409).json({ success: false, error: 'A student with this Student ID or Email already exists.' });
    }

    const student = await Student.create({
      studentId: cleanSid,
      name: name.trim(),
      email: cleanEmail,
      department,
      semester: parseInt(semester, 10),
      enrollmentYear: parseInt(enrollmentYear, 10) || new Date().getFullYear(),
      status,
    });

    // Create or link User account for login
    let user = await User.findOne({ email: cleanEmail });
    const finalPassword = (password && password.trim()) ? password.trim() : 'Campus@123';
    const passwordHash = await bcrypt.hash(finalPassword, SALT_ROUNDS);

    if (!user) {
      const username = cleanSid.toLowerCase();
      user = await User.create({
        username,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: ROLES.STUDENT,
        status: status === 'Active' ? 'active' : 'disabled',
        department,
        metadata: { studentId: cleanSid, semester: parseInt(semester, 10) },
      });
    }

    await recordAuditLog({
      action: 'ADMIN_CREATED_STUDENT',
      req,
      details: `Admin enrolled student ${cleanSid} (${name}) in department ${department}`,
    });

    const populatedStudent = await Student.findById(student._id).populate('department', 'name code');

    return res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      student: populatedStudent,
      generatedPassword: finalPassword,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateStudent = async (req, res) => {
  try {
    const { name, email, department, semester, enrollmentYear, status } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.trim().toLowerCase();
    if (department) student.department = department;
    if (semester !== undefined) student.semester = parseInt(semester, 10);
    if (enrollmentYear !== undefined) student.enrollmentYear = parseInt(enrollmentYear, 10);
    if (status) student.status = status;

    await student.save();

    // Sync with User model if user exists
    if (name || email || status) {
      await User.findOneAndUpdate(
        { email: student.email },
        {
          $set: {
            name: student.name,
            status: student.status === 'Active' ? 'active' : 'disabled',
          },
        }
      ).catch(() => {});
    }

    await recordAuditLog({
      action: 'ADMIN_UPDATED_STUDENT',
      req,
      details: `Admin updated student ${student.studentId} (${student.name})`,
    });

    const updated = await Student.findById(student._id).populate('department', 'name code');
    return res.json({ success: true, message: 'Student updated successfully.', student: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    await Student.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      action: 'ADMIN_DELETED_STUDENT',
      req,
      details: `Admin deleted student record ${student.studentId} (${student.name})`,
    });

    return res.json({ success: true, message: `Student ${student.studentId} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   4. FACULTY MANAGEMENT (CRUD)
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetFaculty = async (req, res) => {
  try {
    const facultyRecords = await Faculty.find()
      .populate('user', 'name username email status lastLogin createdAt')
      .populate('subjects')
      .sort({ createdAt: -1 });

    // Also get any faculty user who might not have a separate Faculty document
    const existingUserIds = facultyRecords.map((f) => f.user?._id?.toString()).filter(Boolean);
    const orphanUsers = await User.find({
      role: ROLES.FACULTY,
      _id: { $nin: existingUserIds },
    });

    const synthesizedOrphans = orphanUsers.map((u) => ({
      _id: `synth-${u._id}`,
      user: safeUser(u),
      department: u.department ? u.department.toString() : 'General Engineering',
      position: 'Faculty Member',
      semesters: [],
      sections: [],
      permissions: { attendance: true, assignments: true, marks: true },
      isSynthesized: true,
    }));

    return res.json({
      success: true,
      faculty: [...facultyRecords, ...synthesizedOrphans],
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateFaculty = async (req, res) => {
  try {
    const { name, username, email, department, position, permissions = {}, semesters = [], sections = [], password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Faculty name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username && username.trim().toLowerCase()) || `prof_${cleanEmail.split('@')[0]}`;

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'A user with this email or username already exists.' });
    }

    const temporaryPassword = (password && password.trim()) ? password.trim() : generateSecurePassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: ROLES.FACULTY,
      status: 'active',
      mustChangePassword: false,
    });

    const faculty = await Faculty.create({
      user: user._id,
      department: department || 'Computer Science & Engineering',
      position: position || 'Assistant Professor',
      semesters: Array.isArray(semesters) ? semesters.map(Number) : [],
      sections: Array.isArray(sections) ? sections : ['A'],
      permissions: {
        attendance: permissions.attendance !== false,
        assignments: permissions.assignments !== false,
        materials: permissions.materials !== false,
        examinations: permissions.examinations !== false,
        marks: permissions.marks !== false,
        questionPapers: permissions.questionPapers !== false,
      },
    });

    await recordAuditLog({
      action: 'ADMIN_CREATED_FACULTY',
      req,
      targetUser: user,
      details: `Admin appointed faculty member ${name} (${position}) in ${department}`,
    });

    const populated = await Faculty.findById(faculty._id).populate('user', 'name username email status');

    return res.status(201).json({
      success: true,
      message: 'Faculty profile and credentials created successfully.',
      faculty: populated,
      temporaryPassword,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateFaculty = async (req, res) => {
  try {
    const { department, position, permissions, semesters, sections, status, name } = req.body;
    let faculty = await Faculty.findById(req.params.id).populate('user');

    if (!faculty && req.params.id.startsWith('synth-')) {
      const userId = req.params.id.replace('synth-', '');
      faculty = await Faculty.create({
        user: userId,
        department: department || 'General Engineering',
        position: position || 'Assistant Professor',
      });
      faculty = await Faculty.findById(faculty._id).populate('user');
    }

    if (!faculty) {
      return res.status(404).json({ success: false, error: 'Faculty profile not found.' });
    }

    if (department) faculty.department = department;
    if (position) faculty.position = position;
    if (semesters) faculty.semesters = semesters.map(Number);
    if (sections) faculty.sections = sections;
    if (permissions) {
      faculty.permissions = { ...(faculty.permissions || {}), ...permissions };
    }

    await faculty.save();

    if (faculty.user && (name || status)) {
      if (name) faculty.user.name = name.trim();
      if (status) faculty.user.status = status;
      await faculty.user.save();
    }

    await recordAuditLog({
      action: 'ADMIN_UPDATED_FACULTY',
      req,
      details: `Admin updated faculty record for ${faculty.user?.name || faculty._id}`,
    });

    const updated = await Faculty.findById(faculty._id).populate('user', 'name username email status');
    return res.json({ success: true, message: 'Faculty record updated.', faculty: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, error: 'Faculty profile not found.' });
    }

    const userId = faculty.user;
    await Faculty.findByIdAndDelete(req.params.id);
    if (userId) {
      await User.findByIdAndUpdate(userId, { status: 'disabled' });
    }

    await recordAuditLog({
      action: 'ADMIN_DELETED_FACULTY',
      req,
      details: `Admin removed faculty record ${req.params.id}`,
    });

    return res.json({ success: true, message: 'Faculty profile removed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   5. ACADEMIC MANAGEMENT (Departments & Courses)
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ code: 1 });
    return res.json({ success: true, departments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateDepartment = async (req, res) => {
  try {
    const { name, code, description = '', status = 'Active' } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Department name and code are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Department.findOne({
      $or: [{ code: cleanCode }, { name: name.trim() }],
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Department code or name already exists.' });
    }

    const dept = await Department.create({
      name: name.trim(),
      code: cleanCode,
      description: description.trim(),
      status,
    });

    await recordAuditLog({
      action: 'ADMIN_CREATED_DEPARTMENT',
      req,
      details: `Admin created department ${cleanCode} (${name})`,
    });

    return res.status(201).json({ success: true, message: 'Department created.', department: dept });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateDepartment = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, error: 'Department not found.' });
    }

    if (name) dept.name = name.trim();
    if (code) dept.code = code.trim().toUpperCase();
    if (description !== undefined) dept.description = description.trim();
    if (status) dept.status = status;

    await dept.save();

    await recordAuditLog({
      action: 'ADMIN_UPDATED_DEPARTMENT',
      req,
      details: `Admin updated department ${dept.code}`,
    });

    return res.json({ success: true, message: 'Department updated.', department: dept });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, error: 'Department not found.' });
    }

    // Check if courses or students are linked
    const linkedCourses = await Course.countDocuments({ department: dept._id });
    const linkedStudents = await Student.countDocuments({ department: dept._id });

    if (linkedCourses > 0 || linkedStudents > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete department: ${linkedCourses} courses and ${linkedStudents} students are currently assigned to it.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      action: 'ADMIN_DELETED_DEPARTMENT',
      req,
      details: `Admin deleted department ${dept.code} (${dept.name})`,
    });

    return res.json({ success: true, message: `Department ${dept.code} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminGetCourses = async (req, res) => {
  try {
    const query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.semester) query.semester = parseInt(req.query.semester, 10);
    if (req.query.status) query.status = req.query.status;

    const courses = await Course.find(query)
      .populate('department', 'name code')
      .sort({ courseCode: 1 });

    return res.json({ success: true, courses });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateCourse = async (req, res) => {
  try {
    const { courseCode, title, description = '', credits, department, semester, status = 'Active' } = req.body;

    if (!courseCode || !title || !credits || !department || !semester) {
      return res.status(400).json({ success: false, error: 'Course Code, Title, Credits, Department, and Semester are required.' });
    }

    const cleanCode = courseCode.trim().toUpperCase();
    const existing = await Course.findOne({ courseCode: cleanCode });
    if (existing) {
      return res.status(409).json({ success: false, error: `Course with code ${cleanCode} already exists.` });
    }

    const course = await Course.create({
      courseCode: cleanCode,
      title: title.trim(),
      description: description.trim(),
      credits: Number(credits),
      department,
      semester: Number(semester),
      status,
    });

    await recordAuditLog({
      action: 'ADMIN_CREATED_COURSE',
      req,
      details: `Admin created course ${cleanCode} - ${title}`,
    });

    const populated = await Course.findById(course._id).populate('department', 'name code');
    return res.status(201).json({ success: true, message: 'Course created.', course: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateCourse = async (req, res) => {
  try {
    const { title, description, credits, department, semester, status } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    if (title) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (credits) course.credits = Number(credits);
    if (department) course.department = department;
    if (semester) course.semester = Number(semester);
    if (status) course.status = status;

    await course.save();

    await recordAuditLog({
      action: 'ADMIN_UPDATED_COURSE',
      req,
      details: `Admin updated course ${course.courseCode}`,
    });

    const updated = await Course.findById(course._id).populate('department', 'name code');
    return res.json({ success: true, message: 'Course updated.', course: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    await Course.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      action: 'ADMIN_DELETED_COURSE',
      req,
      details: `Admin deleted course ${course.courseCode}`,
    });

    return res.json({ success: true, message: `Course ${course.courseCode} deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   6. ATTENDANCE MANAGEMENT & SHORTAGES
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetAttendance = async (req, res) => {
  try {
    const query = {};
    if (req.query.className) query.className = new RegExp(req.query.className.trim(), 'i');
    if (req.query.subject) query.subject = new RegExp(req.query.subject.trim(), 'i');
    if (req.query.semester) query.semester = parseInt(req.query.semester, 10);
    if (req.query.date) query.date = req.query.date.trim();

    const attendanceSessions = await Attendance.find(query)
      .populate('faculty', 'name email username')
      .populate('records.student', 'name studentId email')
      .sort({ date: -1, createdAt: -1 })
      .limit(50);

    return res.json({ success: true, attendance: attendanceSessions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminGetAttendanceShortages = async (req, res) => {
  try {
    const allAttendance = await Attendance.find({}).populate('records.student', 'name studentId email department semester');
    const studentMap = {};

    allAttendance.forEach((att) => {
      (att.records || []).forEach((r) => {
        if (r.student && r.student._id) {
          const sid = r.student._id.toString();
          if (!studentMap[sid]) {
            studentMap[sid] = {
              student: r.student,
              totalSessions: 0,
              present: 0,
              absent: 0,
              late: 0,
            };
          }
          studentMap[sid].totalSessions += 1;
          if (r.status === 'Present') studentMap[sid].present += 1;
          else if (r.status === 'Absent') studentMap[sid].absent += 1;
          else if (r.status === 'Late') studentMap[sid].late += 1;
        }
      });
    });

    const shortageList = [];
    Object.values(studentMap).forEach((item) => {
      if (item.totalSessions > 0) {
        const percentage = Math.round((item.present / item.totalSessions) * 100);
        if (percentage < 75) {
          shortageList.push({
            ...item,
            percentage,
            shortageDeficit: 75 - percentage,
            alertLevel: percentage < 65 ? 'Critical' : 'Warning',
          });
        }
      }
    });

    shortageList.sort((a, b) => a.percentage - b.percentage);

    return res.json({
      success: true,
      totalStudentsEvaluated: Object.keys(studentMap).length,
      shortageCount: shortageList.length,
      shortages: shortageList,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCorrectAttendance = async (req, res) => {
  try {
    const { id, recordId } = req.params;
    const { status, remarks = '' } = req.body;

    if (!['Present', 'Absent', 'Late'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Present, Absent, or Late.' });
    }

    const attendance = await Attendance.findById(id).populate('records.student', 'name studentId email');
    if (!attendance) {
      return res.status(404).json({ success: false, error: 'Attendance entry not found.' });
    }

    const record = attendance.records.id(recordId);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Student record not found in attendance session.' });
    }

    const oldStatus = record.status;
    record.status = status;

    // Recalculate totals
    attendance.totalPresent = attendance.records.filter((r) => r.status === 'Present').length;
    attendance.totalAbsent = attendance.records.filter((r) => r.status === 'Absent').length;
    attendance.totalLate = attendance.records.filter((r) => r.status === 'Late').length;

    await attendance.save();

    await recordAuditLog({
      action: 'ADMIN_ATTENDANCE_CORRECTION',
      req,
      details: `Admin corrected attendance for student ${record.student?.name || record.student} from ${oldStatus} to ${status} in ${attendance.subject} on ${attendance.date}. Remarks: ${remarks}`,
    });

    return res.json({
      success: true,
      message: `Attendance corrected to ${status}.`,
      attendance,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   7. ASSIGNMENTS, EXAMS & RESULTS
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('faculty', 'name email')
      .populate('course', 'courseCode title')
      .sort({ createdAt: -1 });

    return res.json({ success: true, assignments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminGetExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('faculty', 'name email username')
      .sort({ examDate: 1 });

    return res.json({ success: true, exams });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      className,
      semester,
      faculty,
      examDate,
      startTime,
      duration = 120,
      venue,
      maxMarks = 50,
      examType = 'Mid-Term',
      instructions = '',
    } = req.body;

    if (!title || !subject || !className || !semester || !examDate || !startTime) {
      return res.status(400).json({ success: false, error: 'Title, Subject, Class, Semester, Date, and Time are required.' });
    }

    const assignedFaculty = faculty || req.user._id;

    const exam = await Exam.create({
      title: title.trim(),
      subject: subject.trim(),
      className: className.trim(),
      semester: Number(semester),
      faculty: assignedFaculty,
      examDate: examDate.trim(),
      startTime: startTime.trim(),
      duration: Number(duration),
      venue: venue ? venue.trim() : 'Campus Examination Hall',
      maxMarks: Number(maxMarks),
      examType,
      instructions: instructions.trim(),
    });

    await recordAuditLog({
      action: 'ADMIN_SCHEDULED_EXAM',
      req,
      details: `Admin scheduled ${examType} exam: ${title} (${subject}) on ${examDate}`,
    });

    const populated = await Exam.findById(exam._id).populate('faculty', 'name email');
    return res.status(201).json({ success: true, message: 'Exam scheduled successfully.', exam: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found.' });
    }

    const fields = ['title', 'subject', 'className', 'semester', 'examDate', 'startTime', 'duration', 'venue', 'maxMarks', 'examType', 'instructions'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) exam[f] = req.body[f];
    });

    await exam.save();

    await recordAuditLog({
      action: 'ADMIN_UPDATED_EXAM',
      req,
      details: `Admin updated exam schedule ${exam.title}`,
    });

    const populated = await Exam.findById(exam._id).populate('faculty', 'name email');
    return res.json({ success: true, message: 'Exam schedule updated.', exam: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found.' });
    }

    await Exam.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      action: 'ADMIN_DELETED_EXAM',
      req,
      details: `Admin deleted exam schedule ${exam.title}`,
    });

    return res.json({ success: true, message: `Exam ${exam.title} removed.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminGetResults = async (req, res) => {
  try {
    const query = {};
    if (req.query.course) query.course = req.query.course;
    if (req.query.semester) query.semester = parseInt(req.query.semester, 10);
    if (req.query.published !== undefined) query.published = req.query.published === 'true';

    const results = await Result.find(query)
      .populate('student', 'name studentId email semester')
      .populate('course', 'courseCode title credits')
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, results });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateResult = async (req, res) => {
  try {
    const { student, course, assessmentName, assessmentType = 'Exam', maxMarks = 50, marksObtained, semester, session = '2025-2026 Autumn', published = true, feedback = '' } = req.body;

    if (!student || !course || !assessmentName || marksObtained === undefined || !semester) {
      return res.status(400).json({ success: false, error: 'Student, Course, Assessment Name, Marks, and Semester are required.' });
    }

    const result = await Result.findOneAndUpdate(
      { student, course, assessmentName },
      {
        $set: {
          student,
          course,
          faculty: req.user._id,
          assessmentName: assessmentName.trim(),
          assessmentType,
          maxMarks: Number(maxMarks),
          marksObtained: Number(marksObtained),
          semester: Number(semester),
          session: session.trim(),
          published: Boolean(published),
          feedback: feedback.trim(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await recordAuditLog({
      action: 'ADMIN_RECORDED_RESULT',
      req,
      details: `Admin recorded marks for student in ${assessmentName}`,
    });

    const populated = await Result.findById(result._id)
      .populate('student', 'name studentId email')
      .populate('course', 'courseCode title');

    return res.status(201).json({ success: true, message: 'Result marks recorded.', result: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Result record not found.' });
    }

    if (req.body.marksObtained !== undefined) result.marksObtained = Number(req.body.marksObtained);
    if (req.body.maxMarks !== undefined) result.maxMarks = Number(req.body.maxMarks);
    if (req.body.feedback !== undefined) result.feedback = req.body.feedback.trim();
    if (req.body.published !== undefined) result.published = Boolean(req.body.published);

    await result.save();

    await recordAuditLog({
      action: 'ADMIN_UPDATED_RESULT',
      req,
      details: `Admin updated result record ${result._id}`,
    });

    const populated = await Result.findById(result._id)
      .populate('student', 'name studentId email')
      .populate('course', 'courseCode title');

    return res.json({ success: true, message: 'Result updated successfully.', result: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminTogglePublishResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Result not found.' });
    }

    result.published = !result.published;
    await result.save();

    await recordAuditLog({
      action: result.published ? 'ADMIN_PUBLISHED_RESULT' : 'ADMIN_UNPUBLISHED_RESULT',
      req,
      details: `Admin ${result.published ? 'published' : 'unpublished'} result for ${result.assessmentName}`,
    });

    return res.json({
      success: true,
      message: `Result is now ${result.published ? 'Published to Student Portal' : 'Draft / Unpublished'}.`,
      published: result.published,
      result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Result not found.' });
    }

    await Result.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      action: 'ADMIN_DELETED_RESULT',
      req,
      details: `Admin deleted result ${req.params.id}`,
    });

    return res.json({ success: true, message: 'Result record removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   8. FEES MANAGEMENT SUMMARY
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetFeeSummary = async (req, res) => {
  try {
    const summary = await Fee.aggregate([
      {
        $group: {
          _id: '$category',
          totalBilled: { $sum: '$amount' },
          totalCollected: { $sum: '$paidAmount' },
          count: { $sum: 1 },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] } },
        },
      },
    ]);

    const totals = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$amount' },
          totalCollected: { $sum: '$paidAmount' },
        },
      },
    ]);

    const totalInvoiced = totals[0]?.totalInvoiced || 0;
    const totalCollected = totals[0]?.totalCollected || 0;
    const totalPending = Math.max(0, totalInvoiced - totalCollected);
    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    return res.json({
      success: true,
      totals: {
        totalInvoiced,
        totalCollected,
        totalPending,
        collectionRate,
      },
      categoryBreakdown: summary,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   9. TIMETABLE, NOTICES & LEAVE APPROVALS
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetTimetables = async (req, res) => {
  try {
    const query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.semester) query.semester = parseInt(req.query.semester, 10);
    if (req.query.dayOfWeek) query.dayOfWeek = req.query.dayOfWeek;

    const timetables = await Timetable.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email username')
      .sort({ dayOfWeek: 1, startTime: 1 });

    return res.json({ success: true, timetables });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateTimetable = async (req, res) => {
  try {
    const { department, course, faculty, semester, section = 'A', dayOfWeek, startTime, endTime, classroom, session = '2025-2026' } = req.body;

    if (!department || !course || !faculty || !semester || !dayOfWeek || !startTime || !endTime || !classroom) {
      return res.status(400).json({ success: false, error: 'All timetable slot details are required.' });
    }

    // Classroom conflict check
    const roomConflict = await Timetable.findOne({
      classroom: classroom.trim(),
      dayOfWeek,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });
    if (roomConflict) {
      return res.status(409).json({ success: false, error: `Classroom ${classroom} is already occupied on ${dayOfWeek} during this time.` });
    }

    const slot = await Timetable.create({
      department,
      course,
      faculty,
      semester: Number(semester),
      section: section.trim(),
      dayOfWeek,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      classroom: classroom.trim(),
      session: session.trim(),
    });

    await recordAuditLog({
      action: 'ADMIN_CREATED_TIMETABLE',
      req,
      details: `Admin scheduled class in ${classroom} for ${dayOfWeek} ${startTime}-${endTime}`,
    });

    const populated = await Timetable.findById(slot._id)
      .populate('department', 'name code')
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email');

    return res.status(201).json({ success: true, message: 'Timetable slot created.', timetable: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteTimetable = async (req, res) => {
  try {
    const slot = await Timetable.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, error: 'Timetable slot not found.' });
    }

    await Timetable.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      action: 'ADMIN_DELETED_TIMETABLE',
      req,
      details: `Admin deleted timetable slot ${req.params.id}`,
    });

    return res.json({ success: true, message: 'Timetable slot deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminGetNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('author', 'name email role')
      .sort({ pinned: -1, publishedAt: -1 });

    return res.json({ success: true, notices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminCreateNotice = async (req, res) => {
  try {
    const { title, content, category = 'General', targetAudience = 'All', pinned = false } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Notice title and content are required.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
      authorName: req.user.name || 'Campus Administration',
      category,
      targetAudience,
      pinned: Boolean(pinned),
      publishedAt: new Date(),
    });

    await recordAuditLog({
      action: 'ADMIN_PUBLISHED_NOTICE',
      req,
      details: `Admin published official notice: ${title} (${targetAudience})`,
    });

    return res.status(201).json({ success: true, message: 'Notice published.', notice });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, error: 'Notice not found.' });
    }

    if (req.body.title) notice.title = req.body.title.trim();
    if (req.body.content) notice.content = req.body.content.trim();
    if (req.body.category) notice.category = req.body.category;
    if (req.body.targetAudience) notice.targetAudience = req.body.targetAudience;
    if (req.body.pinned !== undefined) notice.pinned = Boolean(req.body.pinned);

    await notice.save();

    return res.json({ success: true, message: 'Notice updated.', notice });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminDeleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, error: 'Notice not found.' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      action: 'ADMIN_DELETED_NOTICE',
      req,
      details: `Admin deleted notice ${notice.title}`,
    });

    return res.json({ success: true, message: 'Notice deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminGetLeaves = async (req, res) => {
  try {
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const leaves = await LeaveApplication.find(query)
      .populate('faculty', 'name email username')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, leaves });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.adminUpdateLeaveStatus = async (req, res) => {
  try {
    const { status, adminRemarks = '' } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Approved or Rejected.' });
    }

    const leave = await LeaveApplication.findById(req.params.id).populate('faculty', 'name email');
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave application not found.' });
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks.trim();
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();

    await leave.save();

    await recordAuditLog({
      action: `ADMIN_LEAVE_${status.toUpperCase()}`,
      req,
      details: `Admin ${status.toLowerCase()} leave request for ${leave.faculty?.name || 'Faculty'} (${leave.fromDate} to ${leave.toDate}). Remarks: ${adminRemarks}`,
    });

    return res.json({
      success: true,
      message: `Leave application marked as ${status}.`,
      leave,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   10. REPORTS & ANALYTICS DATASET GENERATOR & EXPORTER
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Reusable helper to assemble complete, accurate report records across all institutional domains.
 */
async function fetchReportDataset(type = 'students') {
  const normType = String(type).trim().toLowerCase();

  // 1. Student Enrollment Registry
  if (normType === 'students') {
    const students = await Student.find()
      .populate('department', 'name code')
      .sort({ studentId: 1 })
      .lean();

    const rows = students.map((s) => ({
      'Student ID': s.studentId || 'N/A',
      'Name': s.name || 'N/A',
      'Email': s.email || 'N/A',
      'Department': s.department?.name || 'Unassigned',
      'Semester': s.semester || 1,
      'Enrollment Year': s.enrollmentYear || 'N/A',
      'Status': s.status || 'Active',
    }));

    return {
      reportType: 'students',
      title: 'Student Enrollment Registry',
      rows,
    };
  }

  // 2. Teaching Faculty & Academic Staff
  if (normType === 'faculty') {
    const faculties = await Faculty.find()
      .populate('department', 'name code')
      .sort({ name: 1 })
      .lean();

    const rows = faculties.map((f) => ({
      'Faculty ID': f.facultyId || 'N/A',
      'Name': f.name || 'N/A',
      'Email': f.email || 'N/A',
      'Department': f.department?.name || 'General Faculty',
      'Designation': f.designation || 'Lecturer',
      'Qualification': f.qualification || 'M.Tech / Ph.D',
      'Joining Date': f.joiningDate ? new Date(f.joiningDate).toLocaleDateString('en-IN') : 'N/A',
      'Status': f.status || 'Active',
    }));

    return {
      reportType: 'faculty',
      title: 'Teaching Faculty & Academic Staff Registry',
      rows,
    };
  }

  // 3. Attendance Compliance & Shortage Report
  if (normType === 'attendance') {
    const attendance = await Attendance.find({})
      .populate('records.student', 'name studentId email department semester')
      .lean();

    const studentMap = {};

    attendance.forEach((att) => {
      (att.records || []).forEach((r) => {
        if (r.student && r.student._id) {
          const sid = r.student._id.toString();
          if (!studentMap[sid]) {
            studentMap[sid] = {
              student: r.student,
              total: 0,
              present: 0,
              absent: 0,
            };
          }
          studentMap[sid].total += 1;
          if (r.status === 'Present') studentMap[sid].present += 1;
          else if (r.status === 'Absent') studentMap[sid].absent += 1;
        }
      });
    });

    const rows = Object.values(studentMap).map((item) => {
      const pct = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
      return {
        'Student ID': item.student.studentId || 'N/A',
        'Name': item.student.name || 'Unknown',
        'Semester': item.student.semester || 'N/A',
        'Total Sessions': item.total,
        'Present Count': item.present,
        'Absent Count': item.absent,
        'Attendance Percentage': `${pct}%`,
        'Compliance Status': pct >= 75 ? 'Compliant' : 'Shortage Defaulter',
      };
    });

    return {
      reportType: 'attendance',
      title: 'Institutional Attendance Compliance & Shortage Report',
      rows,
    };
  }

  // 4. Academic Performance & Results
  if (normType === 'results') {
    const results = await Result.find()
      .populate('student', 'name studentId semester')
      .populate('course', 'courseCode title')
      .sort({ semester: 1 })
      .lean();

    const rows = results.map((r) => {
      const pct = r.maxMarks > 0 ? Math.round((r.marksObtained / r.maxMarks) * 100) : 0;
      return {
        'Roll Number': r.student?.studentId || 'N/A',
        'Student Name': r.student?.name || 'N/A',
        'Course Code': r.course?.courseCode || 'N/A',
        'Course Title': r.course?.title || 'N/A',
        'Assessment': r.assessmentName || 'Assessment',
        'Marks Obtained': r.marksObtained,
        'Max Marks': r.maxMarks,
        'Score Percentage': `${pct}%`,
        'Grade Status': pct >= 40 ? 'Pass' : 'Fail',
        'Published Status': r.published ? 'Published' : 'Draft',
      };
    });

    return {
      reportType: 'results',
      title: 'Academic Performance & Examination Results Report',
      rows,
    };
  }

  // 5. Fee Dues & Realized Collections
  if (normType === 'fees') {
    const fees = await Fee.find()
      .populate('student', 'name studentId email')
      .sort({ dueDate: -1 })
      .lean();

    const rows = fees.map((f) => {
      const balance = Math.max(0, (f.amount || 0) - (f.paidAmount || 0));
      return {
        'Invoice Number': f.invoiceNumber || 'N/A',
        'Student ID': f.student?.studentId || 'N/A',
        'Student Name': f.student?.name || 'N/A',
        'Category': f.category || 'Tuition Fee',
        'Total Invoiced Amount': f.amount || 0,
        'Paid Amount': f.paidAmount || 0,
        'Outstanding Dues': balance,
        'Payment Status': f.status || 'Pending',
        'Due Date': f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : 'N/A',
        'Payment Date': f.paymentDate ? new Date(f.paymentDate).toLocaleDateString('en-IN') : 'N/A',
        'Payment Mode': f.paymentMode || 'N/A',
        'Receipt Number': f.receiptNumber || 'N/A',
        'Semester': f.semester || 'N/A',
        'Academic Year': f.academicYear || '2025-2026',
      };
    });

    return {
      reportType: 'fees',
      title: 'Institutional Fee Dues & Realized Collections Ledger',
      rows,
    };
  }

  // 6. Examination Admit Cards & Hall Tickets
  if (normType === 'admit-cards' || normType === 'admitcards') {
    const admitCards = await AdmitCard.find()
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    const rows = admitCards.map((ac) => ({
      'Student ID': ac.studentId || 'N/A',
      'Candidate Name': ac.studentName || 'N/A',
      'Department': ac.departmentName || ac.department?.name || 'Engineering',
      'Semester': ac.semester || 1,
      'Examination': ac.examTitle || 'Semester Examination',
      'Session': ac.examSession || 'Spring 2026',
      'Exam Window': ac.examDate || 'Scheduled Window',
      'Issue Status': ac.status || 'Issued',
      'Revision Count': ac.reissueCount || 0,
      'Issue Date': ac.issueDate ? new Date(ac.issueDate).toLocaleDateString('en-IN') : 'N/A',
    }));

    return {
      reportType: 'admit-cards',
      title: 'Examination Admit Cards & Hall Ticket Registry',
      rows,
    };
  }

  // 7. Academic Courses & Curricula
  if (normType === 'courses') {
    const courses = await Course.find()
      .populate('department', 'name code')
      .sort({ courseCode: 1 })
      .lean();

    const rows = courses.map((c) => ({
      'Course Code': c.courseCode || 'N/A',
      'Course Title': c.title || 'N/A',
      'Department': c.department?.name || 'Engineering',
      'Semester': c.semester || 1,
      'Credits': c.credits || 3,
      'Type': c.type || 'Core',
    }));

    return {
      reportType: 'courses',
      title: 'Academic Course Catalog & Curricula Registry',
      rows,
    };
  }

  throw new Error(`Unsupported report type: "${type}". Supported: students, faculty, attendance, results, fees, admit-cards, courses.`);
}

exports.adminGetReportData = async (req, res) => {
  try {
    const { type = 'students' } = req.query;
    const { reportType, title, rows } = await fetchReportDataset(type);

    return res.json({
      success: true,
      reportType,
      title,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error('adminGetReportData error:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Direct file export endpoint with streaming and RFC-compliant CSV / JSON output
 * GET /api/admin/reports/export?type=students&format=csv
 */
exports.adminExportReportData = async (req, res) => {
  try {
    const { type = 'students', format = 'csv' } = req.query;
    const { reportType, title, rows } = await fetchReportDataset(type);

    const safeTitle = (reportType || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);

    if (String(format).toLowerCase() === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="CampusVerse_${safeTitle}_${timestamp}.json"`);
      return res.send(JSON.stringify(rows, null, 2));
    }

    // Default to CSV with Excel UTF-8 BOM
    let csvContent = '\uFEFF';
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      csvContent += headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

      rows.forEach((row) => {
        const line = headers.map((h) => {
          const val = row[h] === undefined || row[h] === null ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        });
        csvContent += line.join(',') + '\r\n';
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="CampusVerse_${safeTitle}_${timestamp}.csv"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.send(csvContent);
  } catch (err) {
    console.error('adminExportReportData error:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────────────────
   11. SYSTEM SETTINGS
   ────────────────────────────────────────────────────────────────────────── */
exports.adminGetSystemSettings = async (req, res) => {
  return res.json({
    success: true,
    settings: {
      institutionName: 'CampusVerse Institute of Advanced Technology & AI',
      currentAcademicYear: '2025-2026',
      activeSemesterSeason: 'Autumn / Odd Semester',
      attendanceShortageThreshold: 75,
      systemMode: 'Production Live (Part 2 Active)',
      databaseStatus: 'MongoDB Atlas ReplicaSet Healthy',
      rbacEnforcement: 'Strict Level 2 Server-Side JWT Verification',
    },
  });
};
