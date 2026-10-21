const mongoose = require('mongoose');

/**
 * Request validation for Course endpoints
 */

const validateCreateCourse = (req, res, next) => {
  const { courseCode, title, description, credits, department, semester, status } = req.body;
  const errors = [];

  if (!courseCode || typeof courseCode !== 'string' || courseCode.trim().length < 2) {
    errors.push({ field: 'courseCode', message: 'Course code is required and must be at least 2 characters.' });
  } else if (courseCode.trim().length > 15) {
    errors.push({ field: 'courseCode', message: 'Course code cannot exceed 15 characters.' });
  }

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Course title is required and must be at least 3 characters.' });
  } else if (title.trim().length > 150) {
    errors.push({ field: 'title', message: 'Course title cannot exceed 150 characters.' });
  }

  const creditsNum = Number(credits);
  if (credits === undefined || isNaN(creditsNum) || !Number.isInteger(creditsNum) || creditsNum < 1 || creditsNum > 10) {
    errors.push({ field: 'credits', message: 'Course credits must be an integer between 1 and 10.' });
  }

  if (!department || typeof department !== 'string' || !mongoose.Types.ObjectId.isValid(department)) {
    errors.push({ field: 'department', message: 'A valid department ObjectId reference is required.' });
  }

  const semesterNum = Number(semester);
  if (semester === undefined || isNaN(semesterNum) || !Number.isInteger(semesterNum) || semesterNum < 1 || semesterNum > 12) {
    errors.push({ field: 'semester', message: 'Semester must be an integer between 1 and 12.' });
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Course description must be a text string.' });
  } else if (description && description.length > 1000) {
    errors.push({ field: 'description', message: 'Course description cannot exceed 1000 characters.' });
  }

  if (status !== undefined && !['Active', 'Archived', 'Draft'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be one of: "Active", "Archived", "Draft".' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid course data provided.',
        details: errors,
      },
    });
  }

  next();
};

const validateUpdateCourse = (req, res, next) => {
  const { courseCode, title, description, credits, department, semester, status } = req.body;
  const errors = [];

  if (courseCode !== undefined) {
    if (typeof courseCode !== 'string' || courseCode.trim().length < 2) {
      errors.push({ field: 'courseCode', message: 'Course code must be at least 2 characters.' });
    } else if (courseCode.trim().length > 15) {
      errors.push({ field: 'courseCode', message: 'Course code cannot exceed 15 characters.' });
    }
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Course title must be at least 3 characters.' });
    } else if (title.trim().length > 150) {
      errors.push({ field: 'title', message: 'Course title cannot exceed 150 characters.' });
    }
  }

  if (credits !== undefined) {
    const creditsNum = Number(credits);
    if (isNaN(creditsNum) || !Number.isInteger(creditsNum) || creditsNum < 1 || creditsNum > 10) {
      errors.push({ field: 'credits', message: 'Course credits must be an integer between 1 and 10.' });
    }
  }

  if (department !== undefined) {
    if (typeof department !== 'string' || !mongoose.Types.ObjectId.isValid(department)) {
      errors.push({ field: 'department', message: 'A valid department ObjectId reference is required.' });
    }
  }

  if (semester !== undefined) {
    const semesterNum = Number(semester);
    if (isNaN(semesterNum) || !Number.isInteger(semesterNum) || semesterNum < 1 || semesterNum > 12) {
      errors.push({ field: 'semester', message: 'Semester must be an integer between 1 and 12.' });
    }
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Course description must be a string.' });
  } else if (description && description.length > 1000) {
    errors.push({ field: 'description', message: 'Course description cannot exceed 1000 characters.' });
  }

  if (status !== undefined && !['Active', 'Archived', 'Draft'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be one of: "Active", "Archived", "Draft".' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid course update data provided.',
        details: errors,
      },
    });
  }

  next();
};

module.exports = {
  validateCreateCourse,
  validateUpdateCourse,
};
