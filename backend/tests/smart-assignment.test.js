require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Assignment = require('../src/models/Assignment');
const AssignmentSubmission = require('../src/models/AssignmentSubmission');
const Department = require('../src/models/Department');

const app = createApp();

describe('CampusVerse AI - Smart Assignment Management System Test Suite', () => {
  let dbConnected = false;
  let facultyToken = '';
  let studentToken = '';
  let facultyUser = null;
  let studentUser = null;
  let studentDoc = null;
  let mcqAssignmentId = '';
  let pdfAssignmentId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();

      // Find or create department
      let dept = await Department.findOne();
      if (!dept) {
        dept = await Department.create({
          name: 'Computer Science and Engineering',
          code: 'CSE',
          establishedYear: 2015,
        });
      }

      const jwt = require('jsonwebtoken');
      const dummyHash = '$2a$10$w6IeA29m5xZtN8jWd3GkC.J9dK2QG1wP0TfG8Z7J3D4R6N9L2X5Y6';

      // 1. Ensure Faculty User exists and log in
      facultyUser = await User.findOne({ email: 'faculty@campusverse.edu' });
      if (!facultyUser) {
        facultyUser = await User.create({
          name: 'Dr. Rajiv Menon',
          email: 'faculty@campusverse.edu',
          username: 'facultydemo',
          passwordHash: dummyHash,
          role: 'faculty',
          status: 'active',
        });
      } else if (facultyUser.status !== 'active') {
        facultyUser.status = 'active';
        await facultyUser.save();
      }

      facultyToken = jwt.sign(
        { sub: facultyUser._id, role: 'faculty', email: facultyUser.email, username: facultyUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 2. Ensure Student User and Student Document exist and log in
      studentUser = await User.findOne({ email: 'student_assign_test@campusverse.edu' });
      if (!studentUser) {
        studentUser = await User.create({
          name: 'Test Student Assignments',
          email: 'student_assign_test@campusverse.edu',
          username: 'student_assign_test',
          passwordHash: dummyHash,
          role: 'student',
          status: 'active',
        });
      } else if (studentUser.status !== 'active') {
        studentUser.status = 'active';
        await studentUser.save();
      }

      studentToken = jwt.sign(
        { sub: studentUser._id, role: 'student', email: studentUser.email, username: studentUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      studentDoc = await Student.findOne({ email: studentUser.email });
      if (!studentDoc) {
        studentDoc = await Student.create({
          studentId: 'ASSIGN_STU_001',
          name: studentUser.name,
          email: studentUser.email,
          semester: 7,
          enrollmentYear: 2021,
          department: dept._id,
          status: 'Active',
        });
      }
    }
  });

  after(async () => {
    // Clean up test assignments
    if (mcqAssignmentId) {
      await Assignment.findByIdAndDelete(mcqAssignmentId).catch(() => {});
      await AssignmentSubmission.deleteMany({ assignment: mcqAssignmentId }).catch(() => {});
    }
    if (pdfAssignmentId) {
      await Assignment.findByIdAndDelete(pdfAssignmentId).catch(() => {});
      await AssignmentSubmission.deleteMany({ assignment: pdfAssignmentId }).catch(() => {});
    }
    await disconnectDB();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MCQ Assignment Workflow
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. MCQ Assignment Creation, Security & Auto-Evaluation Workflow', () => {
    it('Faculty creates an MCQ assignment with 3 questions, 4 options each, and marks', async () => {
      if (!facultyToken) return;

      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const payload = {
        title: 'Operating Systems Virtual Memory MCQ Test',
        subject: 'Operating Systems',
        description: 'Test on paging, page replacement algorithms, and TLB.',
        instructions: 'Select the single best answer for each question.',
        assignmentType: 'mcq',
        targetSemester: 7,
        dueDate,
        questions: [
          {
            questionText: 'Which page replacement algorithm suffers from Belady’s Anomaly?',
            options: ['FIFO', 'LRU', 'Optimal', 'Clock'],
            correctAnswer: 0,
            marks: 2,
            explanation: 'FIFO (First-In-First-Out) is known to suffer from Belady’s anomaly.',
          },
          {
            questionText: 'What is the purpose of the Translation Lookaside Buffer (TLB)?',
            options: [
              'To speed up virtual address translation',
              'To store disk blocks',
              'To handle page faults directly',
              'To allocate heap memory',
            ],
            correctAnswer: 0,
            marks: 3,
            explanation: 'TLB is a fast hardware cache for virtual-to-physical address mappings.',
          },
          {
            questionText: 'Thrashing occurs when:',
            options: [
              'CPU utilization is low and paging activity is very high',
              'System has excessive free RAM',
              'Page size is too large',
              'There are no page faults',
            ],
            correctAnswer: 0,
            marks: 2,
            explanation: 'Thrashing happens when processes spend more time paging than executing.',
          },
        ],
      };

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(payload);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.assignment.assignmentType, 'mcq');
      assert.equal(res.body.assignment.questions.length, 3);
      // Auto-calculated maxMarks: 2 + 3 + 2 = 7
      assert.equal(res.body.assignment.maxMarks, 7);
      mcqAssignmentId = res.body.assignment._id;
    });

    it('SECURITY CHECK: Student querying unsubmitted MCQ assignment NEVER receives correctAnswer or explanation', async () => {
      if (!studentToken || !mcqAssignmentId) return;

      const res = await request(app)
        .get(`/api/assignments/${mcqAssignmentId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const asgn = res.body.assignment || res.body.data;
      assert.ok(Array.isArray(asgn.questions));
      assert.equal(asgn.questions.length, 3);

      // Verify each question does NOT have correctAnswer or explanation
      asgn.questions.forEach((q, idx) => {
        assert.equal(
          q.correctAnswer,
          undefined,
          `Question ${idx} must not expose correctAnswer to student before evaluation`
        );
        assert.equal(
          q.explanation,
          undefined,
          `Question ${idx} must not expose explanation to student before evaluation`
        );
      });
    });

    it('Student submits MCQ answers and gets instant automatic evaluation on the server', async () => {
      if (!studentToken || !mcqAssignmentId) return;

      // Student answers: Q0 = 0 (correct, 2 marks), Q1 = 1 (wrong, 0 marks), Q2 = 0 (correct, 2 marks)
      // Expected score = 4 / 7. Correct = 2, Incorrect = 1, Unanswered = 0.
      const submissionPayload = {
        answers: [
          { questionIndex: 0, selectedOption: 0 },
          { questionIndex: 1, selectedOption: 1 },
          { questionIndex: 2, selectedOption: 0 },
        ],
      };

      const res = await request(app)
        .post(`/api/assignments/${mcqAssignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(submissionPayload);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.result);
      assert.equal(res.body.result.marksObtained, 4);
      assert.equal(res.body.result.maxMarks, 7);
      assert.equal(res.body.result.correctCount, 2);
      assert.equal(res.body.result.incorrectCount, 1);
      assert.equal(res.body.result.unansweredCount, 0);
      assert.equal(res.body.result.status, 'Evaluated');
    });

    it('Score and evaluation persist in database; student sees solutions and marks on revisit', async () => {
      if (!studentToken || !mcqAssignmentId) return;

      const res = await request(app)
        .get(`/api/assignments/${mcqAssignmentId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      const asgn = res.body.assignment || res.body.data;
      assert.ok(asgn.submission);
      assert.equal(asgn.submission.status, 'Evaluated');
      assert.equal(asgn.submission.marksObtained, 4);
      assert.equal(asgn.submission.correctCount, 2);

      // Now that it is evaluated, correct answers and explanations can be reviewed
      assert.equal(asgn.questions[0].correctAnswer, 0);
      assert.ok(asgn.questions[0].explanation);
    });

    it('Student duplicate submission is blocked', async () => {
      if (!studentToken || !mcqAssignmentId) return;

      const res = await request(app)
        .post(`/api/assignments/${mcqAssignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: [{ questionIndex: 0, selectedOption: 0 }] });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /already submitted/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PDF Assignment Workflow
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. PDF Assignment Creation, Student Upload & Faculty Grading Workflow', () => {
    it('Faculty creates a PDF assignment with question paper and max marks', async () => {
      if (!facultyToken) return;

      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const dummyPdfContent = Buffer.from('%PDF-1.4 Question Paper Content\n%%EOF');

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${facultyToken}`)
        .field('title', 'Compiler Design Syntax Analysis Problem Set')
        .field('subject', 'Compiler Design')
        .field('description', 'Construct LL(1) and LR(0) parsing tables for given grammar.')
        .field('instructions', 'Submit handwritten or typed PDF solution.')
        .field('assignmentType', 'pdf')
        .field('maxMarks', 30)
        .field('targetSemester', 7)
        .field('dueDate', dueDate)
        .attach('questionPaper', dummyPdfContent, 'Compiler_Assignment_1.pdf');

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.assignment.assignmentType, 'pdf');
      assert.equal(res.body.assignment.maxMarks, 30);
      assert.ok(res.body.assignment.questionPaper);
      assert.match(res.body.assignment.questionPaper.url, /\.pdf$/i);
      pdfAssignmentId = res.body.assignment._id;
    });

    it('Student uploads solution PDF file', async () => {
      if (!studentToken || !pdfAssignmentId) return;

      const dummyAnswerPdf = Buffer.from('%PDF-1.4 Student Completed Solution\n%%EOF');

      const res = await request(app)
        .post(`/api/assignments/${pdfAssignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .field('submissionText', 'Here is my complete derivation for Grammar 3.')
        .attach('file', dummyAnswerPdf, 'Student_Compiler_Solution.pdf');

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.submission.status, 'Submitted');
      assert.equal(res.body.submission.submissionType, 'pdf');
      assert.ok(res.body.submission.file);
      assert.equal(res.body.submission.file.originalName, 'Student_Compiler_Solution.pdf');
    });

    it('Faculty views submissions for the PDF assignment', async () => {
      if (!facultyToken || !pdfAssignmentId) return;

      const res = await request(app)
        .get(`/api/assignments/${pdfAssignmentId}/submissions`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.submissions));
      assert.equal(res.body.submissions.length, 1);
      const sub = res.body.submissions[0];
      assert.equal(sub.submissionType, 'pdf');
      assert.ok(sub.file);
      assert.equal(sub.file.originalName, 'Student_Compiler_Solution.pdf');
    });

    it('Faculty reviews submission, assigns marks within maxMarks and provides feedback', async () => {
      if (!facultyToken || !pdfAssignmentId) return;

      const subRes = await request(app)
        .get(`/api/assignments/${pdfAssignmentId}/submissions`)
        .set('Authorization', `Bearer ${facultyToken}`);
      const submissionId = subRes.body.submissions[0]._id;

      // Grade: 28 / 30 marks
      const res = await request(app)
        .put(`/api/assignments/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          marksObtained: 28,
          feedback: 'Excellent derivation! Clear first and follow sets.',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.submission.marksObtained, 28);
      assert.equal(res.body.submission.status, 'Evaluated');
      assert.equal(res.body.submission.feedback, 'Excellent derivation! Clear first and follow sets.');
    });

    it('Student sees evaluated marks and faculty feedback in their assignment dashboard', async () => {
      if (!studentToken || !pdfAssignmentId) return;

      const res = await request(app)
        .get('/api/assignments/my-assignments')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const myAsgn = res.body.assignments.find((a) => a._id.toString() === pdfAssignmentId.toString());
      assert.ok(myAsgn, 'PDF assignment must be found in student list');
      assert.equal(myAsgn.submissionStatus, 'Evaluated');
      assert.equal(myAsgn.marksObtained, 28);
      assert.equal(myAsgn.feedback, 'Excellent derivation! Clear first and follow sets.');
    });
  });
});
