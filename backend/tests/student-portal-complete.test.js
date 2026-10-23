require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');

const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Department = require('../src/models/Department');
const Course = require('../src/models/Course');
const Assignment = require('../src/models/Assignment');
const AssignmentSubmission = require('../src/models/AssignmentSubmission');
const Exam = require('../src/models/Exam');
const Attendance = require('../src/models/Attendance');
const Result = require('../src/models/Result');
const Project = require('../src/models/Project');
const PlacementDrive = require('../src/models/PlacementDrive');
const PlacementApplication = require('../src/models/PlacementApplication');
const Company = require('../src/models/Company');
const Notification = require('../src/models/Notification');
const jwt = require('jsonwebtoken');

const app = createApp();

const makeToken = (u) =>
  jwt.sign(
    { sub: u._id, role: u.role, email: u.email, username: u.username },
    process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars',
    { expiresIn: '2h' }
  );

describe('CampusVerse AI — Student Portal Complete Functional Improvements Suite', () => {
  let dbConnected = false;
  let adminToken = '';
  let facultyToken = '';
  let student1Token = '';
  let student2Token = '';

  let deptCSE = null;
  let deptECE = null;
  let courseCS = null;

  let facultyUser = null;
  let student1Doc = null;
  let student1User = null;
  let student2Doc = null;
  let student2User = null;

  let testAssignmentId = '';
  let testExamId = '';
  let testDriveId = '';
  let testProjectId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    assert.ok(dbConnected, 'Database must connect for tests to execute');

    await initializeAccounts();

    // 1. Setup departments
    deptCSE = await Department.findOne({ code: 'CSE' });
    if (!deptCSE) {
      deptCSE = await Department.findOne({ name: { $regex: /computer/i } });
    }
    if (!deptCSE) {
      deptCSE = await Department.create({
        name: 'Computer Science and Engineering',
        code: 'CSE',
        establishedYear: 2015,
      });
    }

    deptECE = await Department.findOne({ code: 'ECE' });
    if (!deptECE) {
      deptECE = await Department.findOne({ name: { $regex: /electronics/i } });
    }
    if (!deptECE) {
      deptECE = await Department.create({
        name: 'Electronics and Communication Engineering',
        code: 'ECE',
        establishedYear: 2016,
      });
    }

    // 2. Setup Faculty
    facultyUser = await User.findOne({ username: 'facultydemo' });
    if (!facultyUser) {
      facultyUser = await User.create({
        username: 'facultydemo',
        email: 'faculty_portal_test@campusverse.edu',
        passwordHash: '$2a$10$w6IeA29m5xZtN8jWd3GkC.J9dK2QG1wP0TfG8Z7J3D4R6N9L2X5Y6', // dummy
        name: 'Dr. Rajiv Menon',
        role: 'faculty',
      });
    }

    // 3. Setup Course
    courseCS = await Course.findOne({ courseCode: 'CS301' });
    if (!courseCS) {
      courseCS = await Course.create({
        courseCode: 'CS301',
        title: 'Design and Analysis of Algorithms',
        department: deptCSE._id,
        credits: 4,
        semester: 6,
      });
    }

    // 4. Setup Student 1 (CSE, 6th Sem - Eligible for CSE Drives)
    student1Doc = await Student.findOne({ studentId: 'TESTS1_CSE' });
    if (!student1Doc) {
      student1Doc = await Student.create({
        studentId: 'TESTS1_CSE',
        name: 'Student One CSE',
        email: 'student1_cse@campusverse.edu',
        semester: 6,
        department: deptCSE._id,
        enrollmentYear: 2021,
        status: 'Active',
      });
    }

    student1User = await User.findOne({ email: 'student1_cse@campusverse.edu' });
    if (!student1User) {
      student1User = await User.create({
        username: 'student1_cse',
        email: 'student1_cse@campusverse.edu',
        passwordHash: facultyUser.passwordHash,
        name: 'Student One CSE',
        role: 'student',
        studentRef: student1Doc._id,
        metadata: { studentId: 'TESTS1_CSE' },
      });
    }

    // 5. Setup Student 2 (ECE, 6th Sem - Ineligible for CSE-Only Drives)
    student2Doc = await Student.findOne({ studentId: 'TESTS2_ECE' });
    if (!student2Doc) {
      student2Doc = await Student.create({
        studentId: 'TESTS2_ECE',
        name: 'Student Two ECE',
        email: 'student2_ece@campusverse.edu',
        semester: 6,
        department: deptECE._id,
        enrollmentYear: 2021,
        status: 'Active',
      });
    }

    student2User = await User.findOne({ email: 'student2_ece@campusverse.edu' });
    if (!student2User) {
      student2User = await User.create({
        username: 'student2_ece',
        email: 'student2_ece@campusverse.edu',
        passwordHash: facultyUser.passwordHash,
        name: 'Student Two ECE',
        role: 'student',
        studentRef: student2Doc._id,
        metadata: { studentId: 'TESTS2_ECE' },
      });
    }

    // Login Admin
    const resAdmin = await request(app).post('/api/auth/login').send({
      identifier: 'narayanrai',
      password: '321456',
    });
    adminToken = resAdmin.body.token;

    // Login Student 1
    const resS1 = await request(app).post('/api/auth/login').send({
      identifier: 'student1_cse',
      password: 'testpassword123',
    });
    // Fallback if password hash differs: generate token using test utility or login
    if (resS1.status === 200) {
      student1Token = resS1.body.token;
    } else {
      student1Token = makeToken(student1User);
    }

    // Token for Student 2 & Faculty
    student2Token = makeToken(student2User);
    facultyToken = makeToken(facultyUser);
  });

  // Scenario 1 & 2: Faculty assigns an assignment, student views, submits, and submission persists
  it('1 & 2. Faculty creates assignment, Student 1 submits file/notes, submission is saved and evaluatable', async () => {
    // 1. Faculty creates assignment
    const asgnRes = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        title: 'Algorithms Graph Traversal Assignment',
        course: courseCS._id.toString(),
        faculty: facultyUser._id.toString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: 100,
        description: 'Implement BFS and DFS with cycle detection.',
        instructions: 'Submit your solution as a code file or zip archive.',
        published: true,
      });

    assert.equal(asgnRes.status, 201, 'Assignment creation should return 201');
    testAssignmentId = asgnRes.body.data._id;

    // 2. Student 1 views assignment in my-assignments
    const myAsgnRes = await request(app)
      .get('/api/assignments/my-assignments')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(myAsgnRes.status, 200);
    const target = (myAsgnRes.body.assignments || []).find((a) => a._id === testAssignmentId);
    assert.ok(target, 'Student should see the published assignment');
    assert.equal(target.submissionStatus, 'Pending', 'Initial submission status must be Pending');

    // 3. Student 1 submits assignment
    const submitRes = await request(app)
      .post(`/api/assignments/${testAssignmentId}/submit`)
      .set('Authorization', `Bearer ${student1Token}`)
      .field('submissionText', 'https://github.com/student/graph-traversal-solution')
      .attach('file', Buffer.from('console.log("Graph algorithms BFS/DFS");'), 'bfs_dfs_solution.txt');

    assert.equal(submitRes.status, 200, 'Assignment submission should succeed with 200');
    assert.ok(submitRes.body.submission, 'Submission record must be returned');

    // 4. Persistence check: Refresh / get my-assignments again
    const verifyRes = await request(app)
      .get('/api/assignments/my-assignments')
      .set('Authorization', `Bearer ${student1Token}`);

    const verified = (verifyRes.body.assignments || []).find((a) => a._id === testAssignmentId);
    assert.ok(verified, 'Assignment must exist after refresh');
    assert.equal(verified.submissionStatus, 'Submitted', 'Status must be updated to Submitted');
    assert.ok(verified.submission?.file?.url, 'Uploaded file URL must be retrievable');

    // 5. Faculty grades the submission
    const gradeRes = await request(app)
      .put(`/api/assignments/submissions/${verified.submission._id}/grade`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        marksObtained: 95,
        feedback: 'Excellent implementation with full test coverage.',
      });

    assert.equal(gradeRes.status, 200, 'Faculty grading should succeed');
    assert.equal(gradeRes.body.submission.marksObtained, 95);
  });

  // Scenario 3: Examination schedule appears for relevant students
  it('3. Examination information appears correctly for the relevant student by semester & course', async () => {
    // Admin or Faculty creates exam schedule
    const examDoc = await Exam.create({
      title: 'Design & Analysis of Algorithms Mid-Term Examination',
      subject: 'Algorithms (CS301)',
      className: deptCSE.name,
      semester: 6,
      faculty: facultyUser._id,
      examDate: '2026-11-15',
      startTime: '10:00 AM',
      duration: 120,
      venue: 'Auditorium Hall B',
      maxMarks: 50,
      examType: 'Mid-Term',
      instructions: 'Calculators and formula sheets permitted. Arrive 15 minutes before start.',
    });
    testExamId = examDoc._id;

    // Student 1 (Sem 6, CSE) fetches exams
    const examsRes = await request(app)
      .get('/api/students/exams')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(examsRes.status, 200);
    const foundExam = (examsRes.body.exams || []).find((e) => e._id.toString() === testExamId.toString());
    assert.ok(foundExam, 'Exam schedule must appear for relevant semester & course student');
    assert.equal(foundExam.venue, 'Auditorium Hall B');
  });

  // Scenario 4 & 5: Placement drive course eligibility & resume upload
  it('4 & 5. Eligible student can apply with resume upload; Ineligible student is rejected (403)', async () => {
    let companyDoc = await Company.findOne({ name: 'Apex Cloud Systems Corp' });
    if (!companyDoc) {
      companyDoc = await Company.create({
        name: 'Apex Cloud Systems Corp',
        industry: 'Cloud Computing',
        location: 'Bengaluru',
      });
    }

    // Create a drive restricted ONLY to Computer Science & Engineering
    const driveDoc = await PlacementDrive.create({
      company: companyDoc._id,
      companyName: 'Apex Cloud Systems Corp',
      jobTitle: 'Cloud Backend Engineer',
      salaryPackage: { displayPackage: '18 LPA' },
      jobField: 'Cloud & DevOps',
      eligibleCourses: ['Computer Science & Engineering', 'Computer Science and Engineering'],
      eligibilityCriteria: {
        minCgpa: 7.0,
        maxBacklogs: 0,
        eligibleCourses: ['Computer Science & Engineering', 'Computer Science and Engineering'],
      },
      driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: 'Tech Auditorium Block C',
      status: 'Registration Open',
    });
    testDriveId = driveDoc._id;

    // 1. Ineligible Student 2 (ECE) attempts to apply directly -> 403 Forbidden
    const ineligibleRes = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ driveId: testDriveId });

    assert.equal(ineligibleRes.status, 403, 'Ineligible student must receive 403 Forbidden');
    assert.match(ineligibleRes.body.error, /not eligible/i);

    // 2. Eligible Student 1 (CSE) applies with uploaded resume
    const applyRes = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${student1Token}`)
      .field('driveId', testDriveId.toString())
      .attach('resume', Buffer.from('%PDF-1.4 Mock Student Resume Content'), 'Aarav_Resume.pdf');

    assert.equal(applyRes.status, 201, 'Eligible student should successfully apply with 201');
    assert.ok(applyRes.body.application.resumeLink, 'Uploaded resume link must be saved');

    // 3. Duplicate Prevention: Attempt to apply again -> 400 Bad Request
    const duplicateRes = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${student1Token}`)
      .field('driveId', testDriveId.toString())
      .field('resumeLink', 'https://resume.com/cv.pdf');

    assert.equal(duplicateRes.status, 400, 'Duplicate application must be rejected');
    assert.match(duplicateRes.body.error, /already/i);
  });

  // Scenario 6: Selection notification delivered ONLY to selected student
  it('6. When student is Selected/Offered, only that student receives targeted selection notification', async () => {
    // Find Student 1's application
    const appDoc = await PlacementApplication.findOne({
      student: student1Doc._id,
      drive: testDriveId,
    });
    assert.ok(appDoc, 'Application record must exist');

    // Update status to 'Selected / Offered'
    const updateRes = await request(app)
      .put(`/api/placement/applications/${appDoc._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Selected / Offered',
        currentRound: 'Offer Confirmation',
        offerDetails: {
          designation: 'Associate Cloud Engineer',
          offeredCtc: '18 LPA',
          joiningLocation: 'Bengaluru / Hyderabad',
        },
      });

    assert.equal(updateRes.status, 200, 'Application update should succeed');

    // Verify Student 1 receives the selection notification
    const s1NotifRes = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(s1NotifRes.status, 200);
    const selectionNotif = (s1NotifRes.body.notifications || []).find(
      (n) => n.type === 'PLACEMENT_SELECTED' || (n.title || '').includes('Selected')
    );
    assert.ok(selectionNotif, 'Selected student must receive targeted placement selection notification');
    assert.match(selectionNotif.message, /Apex Cloud/i);

    // Verify Student 2 did NOT receive this notification
    const s2NotifRes = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${student2Token}`);

    const unrelatedNotif = (s2NotifRes.body.notifications || []).find(
      (n) => (n.title || '').includes('Apex Cloud') && (n.title || '').includes('Selected')
    );
    assert.equal(unrelatedNotif, undefined, 'Unrelated student must NOT receive selection notification');
  });

  // Scenario 7: Attendance report accurate calculations from database
  it('7. Attendance report calculates accurate percentages from real database records', async () => {
    // Seed real attendance sessions
    await Attendance.deleteMany({ subject: 'Algorithms Lab' });

    // Session 1: Student 1 Present, Student 2 Absent
    await Attendance.create({
      faculty: facultyUser._id,
      className: deptCSE.name,
      subject: 'Algorithms Lab',
      semester: 6,
      date: '2026-10-10',
      records: [
        { student: student1Doc._id, status: 'Present' },
        { student: student2Doc._id, status: 'Absent' },
      ],
      totalPresent: 1,
      totalAbsent: 1,
    });

    // Session 2: Student 1 Present, Student 2 Present
    await Attendance.create({
      faculty: facultyUser._id,
      className: deptCSE.name,
      subject: 'Algorithms Lab',
      semester: 6,
      date: '2026-10-17',
      records: [
        { student: student1Doc._id, status: 'Present' },
        { student: student2Doc._id, status: 'Present' },
      ],
      totalPresent: 2,
      totalAbsent: 0,
    });

    // Session 3: Student 1 Absent, Student 2 Present
    await Attendance.create({
      faculty: facultyUser._id,
      className: deptCSE.name,
      subject: 'Algorithms Lab',
      semester: 6,
      date: '2026-10-24',
      records: [
        { student: student1Doc._id, status: 'Absent' },
        { student: student2Doc._id, status: 'Present' },
      ],
      totalPresent: 1,
      totalAbsent: 1,
    });

    // Student 1 Attendance Report: Conducted 3, Attended 2, Missed 1 -> 66.7%
    const repRes = await request(app)
      .get('/api/students/attendance-report')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(repRes.status, 200);
    const report = repRes.body.report;
    assert.ok(report, 'Attendance report object must be returned');

    const algoSubj = (report.subjects || []).find((s) => s.subject === 'Algorithms Lab');
    assert.ok(algoSubj, 'Algorithms Lab must be in report');
    assert.equal(algoSubj.conducted, 3, 'Conducted must be 3');
    assert.equal(algoSubj.attended, 2, 'Attended must be 2');
    assert.equal(algoSubj.missed, 1, 'Missed must be 1');
    assert.equal(algoSubj.percentage, 66.7, 'Calculated percentage must accurately be 66.7%');
    assert.equal(algoSubj.status, 'Short Attendance', 'Must indicate Short Attendance below 75%');
  });

  // Scenario 8 & 9: Progress reports with all marks and missing marks displayed as Pending
  it('8 & 9. Academic progress report aggregates marks and displays missing marks as Pending (not 0)', async () => {
    // Create evaluated midterm exam result
    await Result.findOneAndUpdate(
      { student: student1Doc._id, course: courseCS._id, assessmentName: 'Algorithms Mid-Term' },
      {
        student: student1Doc._id,
        course: courseCS._id,
        faculty: facultyUser._id,
        assessmentName: 'Algorithms Mid-Term',
        assessmentType: 'Exam',
        maxMarks: 50,
        marksObtained: 44,
        semester: 6,
        session: '2025-2026',
        published: true,
      },
      { upsert: true, new: true }
    );

    // Create unevaluated quiz result (missing marks)
    await Result.findOneAndUpdate(
      { student: student1Doc._id, course: courseCS._id, assessmentName: 'Algorithms Quiz 2' },
      {
        student: student1Doc._id,
        course: courseCS._id,
        faculty: facultyUser._id,
        assessmentName: 'Algorithms Quiz 2',
        assessmentType: 'Quiz',
        maxMarks: 20,
        marksObtained: null, // Marks not yet entered
        semester: 6,
        session: '2025-2026',
        published: true,
      },
      { upsert: true, new: true }
    );

    const progRes = await request(app)
      .get('/api/students/academic-progress')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(progRes.status, 200);
    const report = progRes.body.report;
    assert.ok(report, 'Progress report must be returned');

    // 1. Assignment marks included
    assert.ok(report.assignmentMarks.length > 0, 'Assignment marks must be included');

    // 2. Midterm marks evaluated
    const mid = report.midtermMarks.find((m) => m.assessmentName === 'Algorithms Mid-Term');
    assert.ok(mid, 'Midterm result must be included');
    assert.equal(mid.marksObtained, 44);
    assert.equal(mid.status, 'Evaluated');

    // 3. Missing marks handled appropriately
    const quiz = report.internalAssessmentMarks.find((q) => q.assessmentName === 'Algorithms Quiz 2');
    assert.ok(quiz, 'Quiz must be included');
    assert.equal(quiz.marksObtained, null, 'Missing marks must NOT be treated as 0');
    assert.equal(quiz.status, 'Pending', 'Status must be Pending when unevaluated');
  });

  // Scenario 10, 11 & 12: Live project submission, faculty review, and student review notifications
  it('10, 11 & 12. Student submits live project, faculty reviews with marks/feedback, student notified', async () => {
    // 1. Student submits live project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        title: 'Cloud Distributed Task Scheduler',
        description: 'Microservices architecture for scheduling batch processing jobs with Redis and Docker.',
        liveUrl: 'https://scheduler-demo.campusverse.ai',
        githubUrl: 'https://github.com/student/cloud-task-scheduler',
        technologies: ['Node.js', 'Redis', 'Docker', 'React'],
        category: 'Cloud & DevOps',
      });

    assert.equal(projRes.status, 201, 'Project submission should return 201');
    testProjectId = projRes.body.project._id;
    assert.equal(projRes.body.project.reviewStatus, 'Pending Review');

    // 2. Student verifies project in my-projects
    const myProjRes = await request(app)
      .get('/api/projects/my-projects')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(myProjRes.status, 200);
    const foundProj = (myProjRes.body.projects || []).find((p) => p._id === testProjectId);
    assert.ok(foundProj, 'Project must appear in student my-projects list');

    // 3. Faculty reviews the project and enters marks and feedback
    const reviewRes = await request(app)
      .put(`/api/projects/${testProjectId}/review`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        reviewStatus: 'Reviewed',
        feedback: 'Outstanding microservices architecture and clean code structure.',
        suggestions: 'Consider adding Prometheus metrics for production monitoring.',
        marks: 92,
      });

    assert.equal(reviewRes.status, 200, 'Faculty review should succeed with 200');
    assert.equal(reviewRes.body.project.reviewStatus, 'Reviewed');
    assert.equal(reviewRes.body.project.review.marks, 92);

    // 4. Student receives targeted project review notification
    const notifRes = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${student1Token}`);

    const projectNotif = (notifRes.body.notifications || []).find(
      (n) => n.type === 'PROJECT_REVIEW' || (n.title || '').includes('Project Review')
    );
    assert.ok(projectNotif, 'Student must receive real-time project review notification');
    assert.match(projectNotif.message, /Cloud Distributed Task Scheduler/i);
    assert.match(projectNotif.message, /92/);
  });

  // Scenario 13: IDOR Security verification
  it('13. Students cannot access another student private submissions or applications', async () => {
    // Student 2 attempts to edit Student 1's live project -> 403 Forbidden
    const hijackRes = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ title: 'Hijacked Project Title' });

    assert.equal(hijackRes.status, 403, 'Cross-student project edit must be forbidden (403)');

    // Student 2 fetching my-projects only sees their own
    const s2ProjectsRes = await request(app)
      .get('/api/projects/my-projects')
      .set('Authorization', `Bearer ${student2Token}`);

    const hasS1Project = (s2ProjectsRes.body.projects || []).some((p) => p._id === testProjectId);
    assert.equal(hasS1Project, false, 'Student 2 must not see Student 1 project in my-projects');
  });

  // Scenario 14 & 15: Persistence and existing system stability
  it('14 & 15. All records persist across fresh sessions and core API endpoints remain fully functional', async () => {
    // Verify Health endpoint
    const healthRes = await request(app).get('/api/health');
    assert.equal(healthRes.status, 200);

    // Verify Department listing
    const deptRes = await request(app)
      .get('/api/departments')
      .set('Authorization', `Bearer ${student1Token}`);
    assert.equal(deptRes.status, 200);

    // Verify Student Profile persistence
    const profRes = await request(app)
      .get('/api/students/me')
      .set('Authorization', `Bearer ${student1Token}`);
    assert.equal(profRes.status, 200);
    assert.equal(profRes.body.data.studentId, 'TESTS1_CSE');
  });

  after(async () => {
    // Clean up created test items
    if (testAssignmentId) await Assignment.findByIdAndDelete(testAssignmentId);
    if (testExamId) await Exam.findByIdAndDelete(testExamId);
    if (testDriveId) await PlacementDrive.findByIdAndDelete(testDriveId);
    if (testProjectId) await Project.findByIdAndDelete(testProjectId);
    await disconnectDB();
  });
});
