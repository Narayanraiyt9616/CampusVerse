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

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
};
