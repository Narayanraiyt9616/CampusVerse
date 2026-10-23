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

// Create assignment (faculty or admin)
exports.create = async (req, res) => {
  try {
    let payload = { ...req.body };

    // Parse JSON string fields if sent via FormData
    if (typeof payload.questions === 'string') {
      try {
        payload.questions = JSON.parse(payload.questions);
      } catch {
        payload.questions = [];
      }
    }
    if (typeof payload.options === 'string') {
      try { payload.options = JSON.parse(payload.options); } catch {}
    }
    if (payload.maxMarks !== undefined && typeof payload.maxMarks === 'string') {
      payload.maxMarks = Number(payload.maxMarks);
    }
    if (payload.targetSemester !== undefined && typeof payload.targetSemester === 'string') {
      payload.targetSemester = Number(payload.targetSemester);
    }
    if (payload.requiresPdfSubmission !== undefined && typeof payload.requiresPdfSubmission === 'string') {
      payload.requiresPdfSubmission = payload.requiresPdfSubmission === 'true';
    }

    // Attach uploaded PDF question paper if provided
    if (req.file) {
      payload.questionPaper = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/assignments/${req.file.filename}`,
      };
    }

    // Default faculty to authenticated user
    if (!payload.faculty) {
      payload.faculty = req.user._id;
    }

    // Normalize assignmentType
    const rawType = (payload.assignmentType || 'mcq').toLowerCase();
    payload.assignmentType = rawType === 'pdf' ? 'pdf' : 'mcq';

    // If MCQ, auto-calculate maxMarks from questions if questions exist
    if (payload.assignmentType === 'mcq' && Array.isArray(payload.questions) && payload.questions.length > 0) {
      const calculatedMax = payload.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
      payload.maxMarks = calculatedMax > 0 ? calculatedMax : (payload.maxMarks || 10);
    } else if (!payload.maxMarks) {
      payload.maxMarks = 50;
    }

    // Validate course if provided
    if (payload.course && typeof payload.course === 'string') {
      const courseExists = await Course.findById(payload.course).catch(() => null);
      if (!courseExists) {
        delete payload.course;
      }
    }

    const { error, value } = createAssignmentSchema.validate(payload, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: error.details, message: error.details[0]?.message } });
    }

    value.faculty = req.user._id;
    value.published = true;

    const assignment = await Assignment.create(value);

    // Notify targeted students
    const studentQuery = { status: 'Active' };
    if (assignment.targetSemester) {
      studentQuery.semester = assignment.targetSemester;
    }
    const targetStudents = await Student.find(studentQuery).limit(200);

    if (targetStudents.length > 0) {
      const notifications = targetStudents.map((st) => ({
        recipient: st._id,
        studentId: st.studentId,
        title: `New ${assignment.assignmentType.toUpperCase()} Assignment: ${assignment.title}`,
        message: `A new ${assignment.assignmentType.toUpperCase()} assignment has been published for ${assignment.subject || 'your course'}. Deadline: ${new Date(assignment.dueDate).toLocaleDateString('en-IN')}. Max Marks: ${assignment.maxMarks}`,
        category: 'Academic',
        priority: 'Normal',
        type: 'ASSIGNMENT_PUBLISHED',
        metadata: {
          assignmentId: assignment._id.toString(),
          assignmentType: assignment.assignmentType,
          deadline: assignment.dueDate,
          title: assignment.title,
        },
      }));
      await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
    }

    res.status(201).json({ success: true, data: assignment, assignment });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
};

// List assignments – filter by course, faculty, published flag
exports.list = async (req, res) => {
  const { course, faculty, published, page = 1, limit = 50 } = req.query;
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
      .sort({ createdAt: -1 });

    // If student is fetching, strip correctAnswer from questions
    const sanitized = data.map((a) => {
      const obj = a.toJSON();
      if (req.user?.role === 'student' && obj.assignmentType === 'mcq') {
        obj.questions = (obj.questions || []).map((q) => {
          const { correctAnswer, explanation, ...rest } = q;
          return rest;
        });
      }
      return obj;
    });

    res.json({ success: true, meta: { total, page: Number(page), limit: Number(limit) }, data: sanitized, assignments: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
};

// Get details
exports.detail = async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findById(id)
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email');
    if (!assignment) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assignment not found' } });
    }

    const aObj = assignment.toJSON();

    // If student, check whether they have submitted
    if (req.user?.role === 'student') {
      const student = await resolveStudent(req.user);
      let sub = null;
      if (student) {
        sub = await AssignmentSubmission.findOne({ assignment: assignment._id, student: student._id });
      }
      aObj.submission = sub;

      // CRITICAL SECURITY: If student has NOT evaluated submission, hide correct answers
      const isEvaluated = sub && (sub.status === 'Evaluated' || sub.marksObtained !== null && sub.marksObtained !== undefined);
      if (aObj.assignmentType === 'mcq' && !isEvaluated) {
        aObj.questions = (aObj.questions || []).map((q) => {
          const { correctAnswer, explanation, ...rest } = q;
          return rest;
        });
      }
    }

    res.json({ success: true, data: aObj, assignment: aObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
};

// Update – only creator faculty or admin
exports.update = async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateAssignmentSchema.validate(req.body, { stripUnknown: true });
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
    res.json({ success: true, data: assignment, assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
};

// Delete – admin or creator faculty
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    if (req.user.role === 'faculty' && assignment.faculty.toString() !== req.user._id.toString()) {
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

    // Find published assignments for student cohort
    const filter = { published: true };
    if (student.semester) {
      filter.$or = [
        { targetSemester: student.semester },
        { targetSemester: null },
        { targetClass: 'All' },
        { targetClass: '' },
        { targetClass: { $exists: false } },
      ];
    }

    const assignments = await Assignment.find(filter)
      .populate('course', 'courseCode title department semester')
      .populate('faculty', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

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
      const isLate = now > new Date(a.dueDate);

      if (sub) {
        if (sub.status === 'Evaluated' || (sub.marksObtained !== undefined && sub.marksObtained !== null)) {
          status = 'Evaluated';
        } else if (sub.status === 'late' || sub.status === 'Late Submitted') {
          status = 'Late Submitted';
        } else {
          status = 'Submitted';
        }
      } else if (isLate) {
        status = 'Overdue';
      } else if ((now - new Date(a.createdAt)) < 24 * 60 * 60 * 1000) {
        status = 'New';
      }

      // CRITICAL: Strip correctAnswer if not evaluated
      const isEvaluated = status === 'Evaluated';
      if (aObj.assignmentType === 'mcq' && !isEvaluated) {
        aObj.questions = (aObj.questions || []).map((q) => {
          const { correctAnswer, explanation, ...rest } = q;
          return rest;
        });
      }

      return {
        ...aObj,
        assignmentType: aObj.assignmentType || 'mcq',
        submissionStatus: status,
        isSubmitted: !!sub,
        isEvaluated,
        isOverdue: !sub && isLate,
        marksObtained: sub?.marksObtained ?? null,
        maxMarks: aObj.maxMarks,
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

// POST /api/assignments/:id/submit – student submits their assignment (MCQ or PDF)
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

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    // Prevent duplicate submissions
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment: assignment._id,
      student: student._id,
    });
    if (existingSubmission && (existingSubmission.status === 'Evaluated' || existingSubmission.status === 'Submitted')) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted this assignment. Duplicate submissions are not permitted.',
      });
    }

    const type = (assignment.assignmentType || 'mcq').toLowerCase();

    // ─── A. MCQ Assignment Workflow ──────────────────────────────────────────
    if (type === 'mcq') {
      let rawAnswers = req.body.answers || req.body.mcqAnswers;
      if (typeof rawAnswers === 'string') {
        try { rawAnswers = JSON.parse(rawAnswers); } catch { rawAnswers = []; }
      }
      if (!Array.isArray(rawAnswers)) {
        return res.status(400).json({ success: false, error: 'Answers must be provided as an array.' });
      }

      let correctCount = 0;
      let incorrectCount = 0;
      let marksObtained = 0;

      const questions = assignment.questions || [];
      const evaluatedAnswers = questions.map((q, idx) => {
        const studentAns = rawAnswers.find(
          (a) => Number(a.questionIndex) === idx || a.questionId?.toString() === q._id?.toString()
        );

        const selectedOption =
          studentAns !== undefined && studentAns.selectedOption !== undefined && studentAns.selectedOption !== null && studentAns.selectedOption !== ''
            ? Number(studentAns.selectedOption)
            : -1;

        const isCorrect = selectedOption >= 0 && selectedOption === Number(q.correctAnswer);
        const qMarks = Number(q.marks) || 1;
        const earnedMarks = isCorrect ? qMarks : 0;

        if (selectedOption === -1) {
          // unanswered
        } else if (isCorrect) {
          correctCount++;
          marksObtained += earnedMarks;
        } else {
          incorrectCount++;
        }

        return {
          questionId: q._id,
          questionIndex: idx,
          selectedOption,
          isCorrect,
          marksObtained: earnedMarks,
        };
      });

      const totalQuestions = questions.length;
      const unansweredCount = totalQuestions - (correctCount + incorrectCount);

      const submission = await AssignmentSubmission.findOneAndUpdate(
        { assignment: assignment._id, student: student._id },
        {
          $set: {
            submissionType: 'mcq',
            mcqAnswers: evaluatedAnswers,
            totalQuestions,
            correctCount,
            incorrectCount,
            unansweredCount,
            marksObtained,
            maxMarks: assignment.maxMarks,
            status: 'Evaluated',
            submittedAt: now,
            evaluatedAt: now,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Student notification for instant result
      await Notification.create({
        recipient: student._id,
        studentId: student.studentId,
        title: `MCQ Evaluated: ${assignment.title}`,
        message: `You scored ${marksObtained}/${assignment.maxMarks} on "${assignment.title}" (${correctCount}/${totalQuestions} correct).`,
        category: 'Academic',
        priority: 'Normal',
        type: 'ASSIGNMENT_EVALUATION',
        metadata: {
          assignmentId: assignment._id.toString(),
          marksObtained,
          maxMarks: assignment.maxMarks,
        },
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'MCQ assignment submitted and evaluated successfully!',
        result: {
          score: marksObtained,
          marksObtained,
          maxMarks: assignment.maxMarks,
          totalQuestions,
          correctCount,
          incorrectCount,
          unansweredCount,
          status: 'Evaluated',
          submittedAt: now,
          mcqAnswers: evaluatedAnswers,
        },
        submission,
        data: submission,
      });
    }

    // ─── B. PDF Assignment Workflow ──────────────────────────────────────────
    let fileMeta = null;
    if (req.file) {
      // Validate PDF format
      const ext = req.file.originalname ? req.file.originalname.toLowerCase() : '';
      if (!ext.endsWith('.pdf') && req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ success: false, error: 'Invalid file format: Answer document must be a PDF file (.pdf).' });
      }

      fileMeta = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/assignments/${req.file.filename}`,
      };
    }

    const { submissionText } = req.body;

    if (!fileMeta && !submissionText) {
      return res.status(400).json({
        success: false,
        error: 'Please upload your completed answer PDF file.',
      });
    }

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignment: assignment._id, student: student._id },
      {
        $set: {
          submissionType: 'pdf',
          ...(fileMeta ? { file: fileMeta } : {}),
          submissionText: submissionText || '',
          maxMarks: assignment.maxMarks,
          status: isLate ? 'Late Submitted' : 'Submitted',
          submittedAt: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify faculty of new PDF submission
    if (assignment.faculty) {
      await Notification.create({
        recipientUser: assignment.faculty,
        title: `New PDF Submission: ${assignment.title}`,
        message: `${student.name} (${student.studentId}) submitted an answer file for "${assignment.title}".`,
        category: 'Academic',
        priority: 'Normal',
        type: 'ASSIGNMENT_SUBMISSION',
        metadata: {
          assignmentId: assignment._id.toString(),
          studentId: student.studentId,
          studentName: student.name,
        },
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: isLate ? 'PDF answer submitted (late submission recorded).' : 'PDF assignment submitted successfully!',
      submission,
      data: submission,
    });
  } catch (err) {
    console.error('Error submitting assignment:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/assignments/:id/submissions – faculty views submissions
exports.getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    // Check authorization: faculty who created or admin
    if (req.user.role === 'faculty' && assignment.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view submissions for this assignment' });
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignment._id })
      .populate('student', 'studentId name email semester department')
      .populate('evaluatedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions,
      data: submissions,
      assignment,
    });
  } catch (err) {
    console.error('Error getting submissions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/assignments/submissions/:id/grade – faculty grades submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { marksObtained, feedback } = req.body;
    if (marksObtained === undefined || marksObtained === null || marksObtained === '') {
      return res.status(400).json({ success: false, error: 'Marks obtained is required.' });
    }

    const submission = await AssignmentSubmission.findById(req.params.id)
      .populate('assignment')
      .populate('student');

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found.' });
    }

    const maxMarks = submission.assignment?.maxMarks || 100;
    const numMarks = Number(marksObtained);
    if (isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) {
      return res.status(400).json({
        success: false,
        error: `Marks obtained must be between 0 and maximum marks (${maxMarks}).`,
      });
    }

    submission.marksObtained = numMarks;
    submission.feedback = feedback || '';
    submission.status = 'Evaluated';
    submission.evaluatedAt = new Date();
    submission.evaluatedBy = req.user._id;
    await submission.save();

    // Notify student of grading
    if (submission.student) {
      await Notification.create({
        recipient: submission.student._id,
        studentId: submission.student.studentId,
        title: `Assignment Evaluated: ${submission.assignment?.title || 'Assignment'}`,
        message: `Your submission for "${submission.assignment?.title}" has been evaluated by faculty. Marks: ${numMarks}/${maxMarks}. Feedback: ${feedback || 'Evaluated.'}`,
        category: 'Academic',
        priority: 'High',
        type: 'ASSIGNMENT_EVALUATION',
        metadata: {
          assignmentId: submission.assignment?._id?.toString(),
          marksObtained: numMarks,
          maxMarks,
        },
      }).catch(() => {});
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
      .populate('student', 'name studentId email semester');
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

