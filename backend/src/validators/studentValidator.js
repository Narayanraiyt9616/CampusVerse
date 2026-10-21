const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Request validation for Student endpoints
 */

const validateCreateStudent = (req, res, next) => {
  const { studentId, name, email, department, semester, enrollmentYear, status } = req.body;
  const errors = [];

  if (!studentId || typeof studentId !== 'string' || studentId.trim().length < 3) {
    errors.push({ field: 'studentId', message: 'Student ID is required and must be at least 3 characters.' });
  } else if (studentId.trim().length > 20) {
    errors.push({ field: 'studentId', message: 'Student ID cannot exceed 20 characters.' });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Student name is required and must be at least 2 characters.' });
  } else if (name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Student name cannot exceed 100 characters.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required.' });
  }

  if (!department || typeof department !== 'string' || !mongoose.Types.ObjectId.isValid(department)) {
    errors.push({ field: 'department', message: 'A valid department ObjectId reference is required.' });
  }

  const semesterNum = Number(semester);
  if (semester === undefined || isNaN(semesterNum) || !Number.isInteger(semesterNum) || semesterNum < 1 || semesterNum > 12) {
    errors.push({ field: 'semester', message: 'Semester must be an integer between 1 and 12.' });
  }

  const yearNum = Number(enrollmentYear);
  if (enrollmentYear === undefined || isNaN(yearNum) || !Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
    errors.push({ field: 'enrollmentYear', message: 'Enrollment year must be an integer between 2000 and 2100.' });
  }

  if (status !== undefined && !['Active', 'Graduated', 'Suspended', 'On Leave'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be one of: "Active", "Graduated", "Suspended", "On Leave".' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid student data provided.',
        details: errors,
      },
    });
  }

  next();
};

const validateUpdateStudent = (req, res, next) => {
  const { studentId, name, email, department, semester, enrollmentYear, status } = req.body;
  const errors = [];

  // Prevent modifying the immutable identifier studentId unless needed
  if (studentId !== undefined) {
    if (typeof studentId !== 'string' || studentId.trim().length < 3 || studentId.trim().length > 20) {
      errors.push({ field: 'studentId', message: 'Student ID must be between 3 and 20 characters.' });
    }
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Student name must be between 2 and 100 characters.' });
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      errors.push({ field: 'email', message: 'A valid email address is required.' });
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

  if (enrollmentYear !== undefined) {
    const yearNum = Number(enrollmentYear);
    if (isNaN(yearNum) || !Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
      errors.push({ field: 'enrollmentYear', message: 'Enrollment year must be between 2000 and 2100.' });
    }
  }

  if (status !== undefined && !['Active', 'Graduated', 'Suspended', 'On Leave'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be one of: "Active", "Graduated", "Suspended", "On Leave".' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid student update data provided.',
        details: errors,
      },
    });
  }

  next();
};

module.exports = {
  validateCreateStudent,
  validateUpdateStudent,
};
