const Timetable = require('../models/Timetable');
const { createTimetableSchema, updateTimetableSchema } = require('../validators/timetableValidator');
const Course = require('../models/Course');
const Department = require('../models/Department');
const User = require('../models/User');

/** Helper: check for overlapping entries */
const hasOverlap = async (filter) => {
  const count = await Timetable.countDocuments(filter);
  return count > 0;
};

// Create a new timetable entry (admin/super_admin)
exports.create = async (req, res) => {
  const { error, value } = createTimetableSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details } });
  }
  // Verify referenced IDs exist
  const [dept, course, faculty] = await Promise.all([
    Department.findById(value.department),
    Course.findById(value.course),
    User.findById(value.faculty),
  ]);
  if (!dept || !course || !faculty) {
    return res.status(400).json({ success: false, error: { code: 'REFERENCE_ERROR' } });
  }

  // Conflict detection
  const overlapFilters = [
    // Faculty overlap
    { faculty: value.faculty, dayOfWeek: value.dayOfWeek, $or: [{ startTime: { $lt: value.endTime }, endTime: { $gt: value.startTime } }] },
    // Classroom overlap
    { classroom: value.classroom, dayOfWeek: value.dayOfWeek, $or: [{ startTime: { $lt: value.endTime }, endTime: { $gt: value.startTime } }] },
    // Section (department+semester+section) overlap
    { department: value.department, semester: value.semester, section: value.section, dayOfWeek: value.dayOfWeek, $or: [{ startTime: { $lt: value.endTime }, endTime: { $gt: value.startTime } }] },
  ];

  for (const filter of overlapFilters) {
    if (await hasOverlap(filter)) {
      return res.status(409).json({ success: false, error: { code: 'TIMETABLE_CONFLICT' } });
    }
  }

  try {
    const tt = await Timetable.create(value);
    res.status(201).json({ success: true, data: tt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// List timetable entries – admin can filter, faculty/student gets limited view later
exports.list = async (req, res) => {
  const { page = 1, limit = 20, department, course, faculty, dayOfWeek, semester, section, session } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (course) filter.course = course;
  if (faculty) filter.faculty = faculty;
  if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
  if (semester) filter.semester = Number(semester);
  if (section) filter.section = section;
  if (session) filter.session = session;

  try {
    const total = await Timetable.countDocuments(filter);
    const records = await Timetable.find(filter)
      .populate('department', 'name code')
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ success: true, meta: { total, page: Number(page), limit: Number(limit) }, data: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// Retrieve timetable for a student (by department/semester/section)
exports.getByStudent = async (req, res) => {
  const studentId = req.params.studentId; // expecting ObjectId of Student
  const Student = require('../models/Student');
  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });

  const filter = {
    department: student.department,
    semester: student.semester,
    // Assuming a default section naming convention; we use student.section if available – not in schema, so optional
    // For simplicity, we match any section belonging to that dept+semester
  };
  const records = await Timetable.find(filter).populate('course faculty', 'title name email').sort({ dayOfWeek: 1, startTime: 1 });
  res.json({ success: true, data: records });
};

// Retrieve timetable for a faculty member
exports.getByFaculty = async (req, res) => {
  const facultyId = req.params.facultyId;
  const records = await Timetable.find({ faculty: facultyId })
    .populate('course department', 'title courseCode name')
    .sort({ dayOfWeek: 1, startTime: 1 });
  res.json({ success: true, data: records });
};

// Update an entry – admin/super_admin only (faculty cannot edit)
exports.update = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateTimetableSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details } });
  }
  try {
    const tt = await Timetable.findById(id);
    if (!tt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    // Apply updates
    Object.assign(tt, value);
    await tt.save();
    res.json({ success: true, data: tt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// Delete entry – admin/super_admin
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const tt = await Timetable.findByIdAndDelete(id);
    if (!tt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};
