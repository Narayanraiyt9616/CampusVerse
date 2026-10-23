const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createAssignmentSchema, updateAssignmentSchema } = require('../validators/assignmentValidator');

// Helper to resolve Student document for the authenticated user
const resolveStudent = async (user) => {
  if (!user) return null;
  return Student.findOne({
    $or: [
      { email: user.email },
      { studentId: (user.username || '').toUpperCase() },
      ...(user.metadata?.studentId ? [{ studentId: user.metadata.studentId }] : []),
    ],
  }).populate('department');
};

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
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    await assignment.deleteOne();
    res.json({ success: true, message: 'Assignment removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
};

// GET /api/assignments/my-assignments – student views their assignments with submission status
exports.getMyAssignments = async (req, res) => {
  try {
    const student = await resolveStudent(req.user);
    if (!student) {
      return res.status(200).json({ success: true, count: 0, data: [], assignments: [] });
    }

    // Find published assignments
    const assignments = await Assignment.find({ published: true })
      .populate('course', 'courseCode title department semester')
      .populate('faculty', 'name email')
      .sort({ dueDate: 1 });

    // Fetch student's existing submissions
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await AssignmentSubmission.find({
      assignment: { $in: assignmentIds },
      student: student._id,
    });

    const subMap = new Map();
    submissions.forEach((s) => subMap.set(s.assignment.toString(), s));

    const now = new Date();

    const result = assignments.map((a) => {
      const aObj = a.toJSON();
      const sub = subMap.get(a._id.toString());

      let status = 'Pending';
      if (sub) {
        if (sub.marksObtained !== undefined && sub.marksObtained !== null) {
          status = 'Evaluated';
        } else {
          status = sub.status === 'late' ? 'Late Submitted' : 'Submitted';
        }
      } else if (new Date(a.dueDate) < now) {
        status = 'Overdue';
      }

      return {
        ...aObj,
        submissionStatus: status,
        isSubmitted: !!sub,
        isEvaluated: sub ? sub.marksObtained !== undefined && sub.marksObtained !== null : false,
        isOverdue: !sub && new Date(a.dueDate) < now,
        marksObtained: sub?.marksObtained ?? null,
        feedback: sub?.feedback || '',
        submittedAt: sub?.submittedAt || null,
        submission: sub || null,
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      assignments: result,
    });
  } catch (err) {
    console.error('Error fetching student assignments:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/assignments/:id/submit – student submits their assignment
exports.submitAssignment = async (req, res) => {
  try {
    const student = await resolveStudent(req.user);
    if (!student) {
      return res.status(403).json({ success: false, error: 'Only enrolled students can submit assignments.' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    const { submissionText } = req.body;
    let fileMeta = null;
    if (req.file) {
      fileMeta = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/assignments/${req.file.filename}`,
      };
    }

    if (!submissionText && !fileMeta) {
      return res.status(400).json({
        success: false,
        error: 'Please provide submission content (text notes, repository link, or upload a solution file).',
      });
    }

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignment: assignment._id, student: student._id },
      {
        $set: {
          submissionText: submissionText || '',
          ...(fileMeta ? { file: fileMeta } : {}),
          submittedAt: now,
          status: isLate ? 'late' : 'submitted',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (late submission recorded).' : 'Assignment submitted successfully!',
      submission,
      data: submission,
    });
  } catch (err) {
    console.error('Error submitting assignment:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/assignments/submissions/:id/grade – faculty or admin grades submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;
    if (marksObtained === undefined || marksObtained === null) {
      return res.status(400).json({ success: false, error: 'Marks obtained is required.' });
    }

    const submission = await AssignmentSubmission.findById(req.params.id)
      .populate('assignment')
      .populate('student');

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found.' });
    }

    submission.marksObtained = Number(marksObtained);
    if (feedback !== undefined) submission.feedback = feedback;
    submission.status = 'graded';
    await submission.save();

    // Notify student of grading
    if (submission.student) {
      await Notification.create({
        recipient: submission.student._id,
        studentId: submission.student.studentId,
        title: `Assignment Evaluated: ${submission.assignment?.title || 'Assignment'}`,
        message: `Your assignment "${submission.assignment?.title}" has been evaluated by faculty. Marks: ${marksObtained}/${submission.assignment?.maxMarks || 100}. Feedback: ${feedback || 'Good work.'}`,
        category: 'Academic',
        priority: 'Normal',
        type: 'ASSIGNMENT_EVALUATION',
      });
    }

    return res.json({ success: true, message: 'Submission evaluated successfully.', submission });
  } catch (err) {
    console.error('Error grading submission:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/assignments/submissions/:id
exports.getSubmissionDetail = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findById(req.params.id)
      .populate('assignment')
      .populate('student', 'name studentId email');
    if (!submission) return res.status(404).json({ success: false, error: 'Submission not found.' });

    // Authorization: if student, must be own submission
    if (req.user.role === 'student') {
      const student = await resolveStudent(req.user);
      if (!student || submission.student._id.toString() !== student._id.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view this submission.' });
      }
    }

    return res.json({ success: true, submission, data: submission });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
