const Assignment = require('../models/Assignment');
const { createAssignmentSchema, updateAssignmentSchema } = require('../validators/assignmentValidator');
const Course = require('../models/Course');
const User = require('../models/User');

// Create assignment (faculty of the course or admin)
exports.create = async (req, res) => {
  const { error, value } = createAssignmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details } });
  }

  // Verify referenced course and faculty exist
  const [course, faculty] = await Promise.all([
    Course.findById(value.course),
    User.findById(value.faculty),
  ]);
  if (!course || !faculty) {
    return res.status(400).json({ success: false, error: { code: 'REFERENCE_ERROR' } });
  }

  // Authorization: faculty must be assigned to course or admin
  if (req.user.role === 'faculty' && req.user._id.toString() !== value.faculty) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
  }

  try {
    const assignment = await Assignment.create(value);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// List assignments – filter by course, faculty, published flag
exports.list = async (req, res) => {
  const { course, faculty, published, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (course) filter.course = course;
  if (faculty) filter.faculty = faculty;
  if (published !== undefined) filter.published = published === 'true';

  try {
    const total = await Assignment.countDocuments(filter);
    const data = await Assignment.find(filter)
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ dueDate: -1 });
    res.json({ success: true, meta: { total, page: Number(page), limit: Number(limit) }, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// Get details (including submissions count)
exports.detail = async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findById(id)
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email');
    if (!assignment) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }
    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// Update – only creator faculty or admin
exports.update = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateAssignmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details } });
  }

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    if (req.user.role === 'faculty' && assignment.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    Object.assign(assignment, value);
    await assignment.save();
    res.json({ success: true, data: assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// Delete – admin only (faculty cannot delete once published)
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    await assignment.deleteOne();
    res.json({ success: true, message: 'Assignment removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};
