const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { getDBStatus } = require('../config/db');

const checkDBReady = (res) => {
  if (getDBStatus().status !== 'connected') {
    res.status(503).json({
      success: false,
      error: { code: 'DATABASE_UNAVAILABLE', message: 'Database is currently disconnected. Enrollment operations unavailable.' },
    });
    return false;
  }
  return true;
};

// GET /api/enrollments - optional filters student, course
const listEnrollments = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const { student, course, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (student && mongoose.Types.ObjectId.isValid(student)) query.student = student;
    if (course && mongoose.Types.ObjectId.isValid(course)) query.course = course;
    if (status) query.status = status;
    const pg = Math.max(1, parseInt(page, 10));
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pg - 1) * lim;
    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('student', 'studentId name email')
        .populate('course', 'courseCode title')
        .skip(skip)
        .limit(lim)
        .sort({ enrolledAt: -1 }),
      Enrollment.countDocuments(query),
    ]);
    res.status(200).json({ success: true, data: enrollments, pagination: { total, page: pg, limit: lim, totalPages: Math.ceil(total / lim) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/enrollments - create new enrollment
const createEnrollment = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const { student, course, semester, status } = req.body;
    // validate referenced student and course exist
    const [studentDoc, courseDoc] = await Promise.all([
      Student.findById(student),
      Course.findById(course),
    ]);
    if (!studentDoc) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_REFERENCE', message: Student ID  does not exist. } });
    }
    if (!courseDoc) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_REFERENCE', message: Course ID  does not exist. } });
    }
    const enrollment = new Enrollment({ student, course, semester, status });
    await enrollment.save();
    await enrollment.populate('student', 'studentId name').populate('course', 'courseCode title');
    res.status(201).json({ success: true, data: enrollment, message: 'Enrollment created successfully.' });
  } catch (err) {
    // Duplicate key error handling
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE_ENROLLMENT', message: 'Student is already enrolled in this course.' } });
    }
    next(err);
  }
};

// DELETE /api/enrollments/:id - withdraw/delete enrollment
const deleteEnrollment = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;
    const { id } = req.params;
    const enrollment = await Enrollment.findByIdAndDelete(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: Enrollment  not found. } });
    }
    res.status(200).json({ success: true, message: 'Enrollment withdrawn successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listEnrollments, createEnrollment, deleteEnrollment };
