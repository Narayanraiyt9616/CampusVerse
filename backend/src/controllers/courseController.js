const mongoose = require('mongoose');
const Course = require('../models/Course');
const Department = require('../models/Department');
const { getDBStatus } = require('../config/db');

/**
 * Course Controller
 * Handles CRUD operations for academic courses with department population and filters.
 */

const checkDBReady = (res) => {
  if (getDBStatus().status !== 'connected') {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is currently disconnected. Course records cannot be accessed at this time.',
      },
    });
    return false;
  }
  return true;
};

// GET /api/courses
const getCourses = async (req, res, next) => {
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

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ courseCode: searchRegex }, { title: searchRegex }];
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('department', 'name code')
        .sort({ courseCode: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
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

// GET /api/courses/:id
const getCourseById = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { id } = req.params;
    let course;

    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id).populate('department', 'name code description');
    } else {
      // Lookup by unique courseCode (e.g. CS701)
      course = await Course.findOne({ courseCode: id.toUpperCase().trim() }).populate('department', 'name code description');
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Course with identifier "${id}" was not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/courses
const createCourse = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { courseCode, title, description, credits, department, semester, status } = req.body;

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

    const course = new Course({
      courseCode: courseCode.trim().toUpperCase(),
      title: title.trim(),
      description: description ? description.trim() : '',
      credits: Number(credits),
      department: deptExists._id,
      semester: Number(semester),
      status: status || 'Active',
    });

    await course.save();
    await course.populate('department', 'name code');

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/courses/:id
const updateCourse = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { courseCode: id.toUpperCase().trim() };

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
    if (req.body.courseCode !== undefined) updates.courseCode = req.body.courseCode.trim().toUpperCase();
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.credits !== undefined) updates.credits = Number(req.body.credits);
    if (req.body.department !== undefined) updates.department = req.body.department;
    if (req.body.semester !== undefined) updates.semester = Number(req.body.semester);
    if (req.body.status !== undefined) updates.status = req.body.status;

    const course = await Course.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Course with identifier "${id}" was not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: course,
      message: 'Course updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
};
