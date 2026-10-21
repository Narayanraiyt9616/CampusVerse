const Result = require('../models/Result');
const { createResultSchema, updateResultSchema } = require('../validators/resultValidator');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');

// Create result entry – admin or faculty of course
exports.create = async (req, res) => {
  const { error, value } = createResultSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details } });
  }
  // Verify references
  const [student, course, faculty] = await Promise.all([
    Student.findById(value.student),
    Course.findById(value.course),
    User.findById(value.faculty),
  ]);
  if (!student || !course || !faculty) {
    return res.status(400).json({ success: false, error: { code: 'REFERENCE_ERROR' } });
  }
  // Authorization – faculty must belong to the course or admin
  if (req.user.role === 'faculty' && req.user._id.toString() !== value.faculty) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  }
  try {
    const result = await Result.create(value);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESULT' } });
    }
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// List results – admin can view all, faculty view their entered, student view own published
exports.list = async (req, res) => {
  const { student, course, faculty, assessmentName, published, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (course) filter.course = course;
  if (faculty) filter.faculty = faculty;
  if (assessmentName) filter.assessmentName = new RegExp(assessmentName, 'i');
  if (published !== undefined) filter.published = published === 'true';

  // Role‑based restrictions
  if (req.user.role === 'student') {
    filter.student = req.user._id; // student sees own
    filter.published = true; // only published
  } else if (req.user.role === 'faculty') {
    // faculty sees entries they entered or any for their courses
    filter.$or = [{ faculty: req.user._id }];
  }

  try {
    const total = await Result.countDocuments(filter);
    const data = await Result.find(filter)
      .populate('student', 'studentId name')
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ success: true, meta: { total, page: Number(page), limit: Number(limit) }, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// Update result – admin or the faculty who entered it
exports.update = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateResultSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details } });
  }
  try {
    const result = await Result.findById(id);
    if (!result) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    if (req.user.role === 'faculty' && result.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    Object.assign(result, value);
    await result.save();
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// Delete – admin only
exports.remove = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  }
  try {
    const result = await Result.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, message: 'Result removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};
