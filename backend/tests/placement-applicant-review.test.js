require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Department = require('../src/models/Department');
const PlacementDrive = require('../src/models/PlacementDrive');
const PlacementApplication = require('../src/models/PlacementApplication');
const Project = require('../src/models/Project');
const Company = require('../src/models/Company');
const bcrypt = require('bcryptjs');

const app = createApp();

describe('Placement Cell — Applicant Resume & Live Project Review Suite', () => {
  let dbConnected = false;
  let placementToken = '';
  let studentAToken = '';
  let studentBToken = '';

  let studentAUser, studentBUser;
  let studentARecord, studentBRecord;
  let testDrive;
  let testCompany;
  let testProject1, testProject2;
  let appAId = '', appBId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (!dbConnected) return;

    await initializeAccounts();

    // 1. Department
    let dept = await Department.findOne({
      $or: [{ code: 'CSE' }, { name: 'Computer Science & Engineering' }],
    });
    if (!dept) {
      dept = await Department.create({ name: 'Computer Science & Engineering', code: 'CSE' });
    }

    const passwordHash = await bcrypt.hash('TestStudent@2026', 10);

    // 2. Student A (has resume + 2 live projects)
    studentAUser = await User.findOneAndUpdate(
      { username: 'test_applicant_a' },
      {
        name: 'Applicant Alpha',
        username: 'test_applicant_a',
        email: 'applicant_a@campusverse.edu',
        passwordHash,
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    studentARecord = await Student.findOneAndUpdate(
      { studentId: 'CV-TEST-APP-A' },
      {
        studentId: 'CV-TEST-APP-A',
        name: 'Applicant Alpha',
        email: 'applicant_a@campusverse.edu',
        user: studentAUser._id,
        department: dept._id,
        course: 'Computer Science & Engineering',
        semester: 8,
        status: 'active',
      },
      { upsert: true, new: true }
    );

    // 3. Student B (has resume, no live projects)
    studentBUser = await User.findOneAndUpdate(
      { username: 'test_applicant_b' },
      {
        name: 'Applicant Beta',
        username: 'test_applicant_b',
        email: 'applicant_b@campusverse.edu',
        passwordHash,
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    studentBRecord = await Student.findOneAndUpdate(
      { studentId: 'CV-TEST-APP-B' },
      {
        studentId: 'CV-TEST-APP-B',
        name: 'Applicant Beta',
        email: 'applicant_b@campusverse.edu',
        user: studentBUser._id,
        department: dept._id,
        course: 'Computer Science & Engineering',
        semester: 8,
        status: 'active',
      },
      { upsert: true, new: true }
    );

    // 4. Log in placement officer and students
    const placementLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'placement_officer', password: process.env.DEFAULT_PLACEMENT_PASSWORD || 'Placement@2026' });

    if (placementLogin.body.success) {
      placementToken = placementLogin.body.token;
    } else {
      // Fallback: login as admin who has placement privileges
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026' });
      placementToken = adminLogin.body.token;
    }

    const resLoginA = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test_applicant_a', password: 'TestStudent@2026' });
    studentAToken = resLoginA.body.token;

    const resLoginB = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test_applicant_b', password: 'TestStudent@2026' });
    studentBToken = resLoginB.body.token;

    // 5. Create company & drive
    testCompany = await Company.create({
      name: 'Google Tech India Test Corp',
      industry: 'Information Technology',
      location: 'Hyderabad',
      tier: 'Tier 1 (Dream)',
    });

    testDrive = await PlacementDrive.create({
      company: testCompany._id,
      companyName: testCompany.name,
      jobTitle: 'Software Engineer - AI Systems',
      jobField: 'Software Development',
      eligibleCourses: ['Computer Science & Engineering'],
      salaryPackage: { minLPA: 24, maxLPA: 36, displayPackage: '₹ 24 - 36 LPA' },
      driveDate: new Date(Date.now() + 86400000 * 7),
      applicationDeadline: new Date(Date.now() + 86400000 * 3),
      status: 'Registration Open',
    });

    // 6. Student A submits 2 live projects
    testProject1 = await Project.create({
      student: studentARecord._id,
      title: 'Neural Vision AI Portal',
      description: 'Computer vision platform for medical scan analysis.',
      liveUrl: 'https://neural-vision-demo.vercel.app',
      githubUrl: 'https://github.com/applicant-a/neural-vision',
      technologies: ['React', 'FastAPI', 'PyTorch'],
      category: 'AI & Machine Learning',
      semester: 8,
    });

    testProject2 = await Project.create({
      student: studentARecord._id,
      title: 'Decentralized Micro-Exchange',
      description: 'Sub-millisecond matching engine using WebSockets.',
      liveUrl: 'https://dex-exchange-live.onrender.com',
      githubUrl: 'https://github.com/applicant-a/dex-exchange',
      technologies: ['Node.js', 'Redis', 'Docker'],
      category: 'Full-Stack Web',
      semester: 8,
    });
  });

  after(async () => {
    // Cleanup created test records
    try {
      if (testProject1) await Project.findByIdAndDelete(testProject1._id);
      if (testProject2) await Project.findByIdAndDelete(testProject2._id);
      if (appAId) await PlacementApplication.findByIdAndDelete(appAId);
      if (appBId) await PlacementApplication.findByIdAndDelete(appBId);
      if (testDrive) await PlacementDrive.findByIdAndDelete(testDrive._id);
      if (testCompany) await Company.findByIdAndDelete(testCompany._id);
      if (studentARecord) await Student.findByIdAndDelete(studentARecord._id);
      if (studentBRecord) await Student.findByIdAndDelete(studentBRecord._id);
      if (studentAUser) await User.findByIdAndDelete(studentAUser._id);
      if (studentBUser) await User.findByIdAndDelete(studentBUser._id);
    } catch (err) {
      // ignore cleanup errors
    }
  });

  it('1. Student A submits placement application with resume link', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        driveId: testDrive._id.toString(),
        resumeLink: '/uploads/resumes/applicant_a_resume.pdf',
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.application._id);
    assert.strictEqual(res.body.application.resumeLink, '/uploads/resumes/applicant_a_resume.pdf');
    appAId = res.body.application._id;
  });

  it('2. Student B submits placement application with a different resume link', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({
        driveId: testDrive._id.toString(),
        resumeLink: '/uploads/resumes/applicant_b_resume.pdf',
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.application._id);
    assert.strictEqual(res.body.application.resumeLink, '/uploads/resumes/applicant_b_resume.pdf');
    appBId = res.body.application._id;
  });

  it('3. Placement team retrieves applications with verified student-specific resume and live projects', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .get(`/api/placement/applications?driveId=${testDrive._id}`)
      .set('Authorization', `Bearer ${placementToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.applications));

    const appA = res.body.applications.find((a) => a._id.toString() === appAId.toString());
    const appB = res.body.applications.find((a) => a._id.toString() === appBId.toString());

    assert.ok(appA, 'Applicant A application must be present');
    assert.ok(appB, 'Applicant B application must be present');

    // Verify Applicant A: resume + 2 live projects
    assert.strictEqual(appA.resumeLink, '/uploads/resumes/applicant_a_resume.pdf');
    assert.ok(Array.isArray(appA.projects), 'Projects array must exist');
    assert.strictEqual(appA.projects.length, 2, 'Applicant A must have exactly 2 projects');

    const projectTitles = appA.projects.map((p) => p.title);
    assert.ok(projectTitles.includes('Neural Vision AI Portal'));
    assert.ok(projectTitles.includes('Decentralized Micro-Exchange'));

    const neuralProj = appA.projects.find((p) => p.title === 'Neural Vision AI Portal');
    assert.strictEqual(neuralProj.liveUrl, 'https://neural-vision-demo.vercel.app');
    assert.strictEqual(neuralProj.githubUrl, 'https://github.com/applicant-a/neural-vision');

    // Verify Applicant B: resume + 0 live projects (No leakage from Applicant A!)
    assert.strictEqual(appB.resumeLink, '/uploads/resumes/applicant_b_resume.pdf');
    assert.ok(Array.isArray(appB.projects), 'Applicant B projects array must exist');
    assert.strictEqual(appB.projects.length, 0, 'Applicant B must have 0 projects (strictly applicant-isolated)');
  });

  it('4. Placement team reviews Applicant A live project links and shortlists them', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .put(`/api/placement/applications/${appAId}`)
      .set('Authorization', `Bearer ${placementToken}`)
      .send({
        status: 'Shortlisted',
        currentRound: 'Technical Interview Round 1',
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.application.status, 'Shortlisted');
    assert.strictEqual(res.body.application.currentRound, 'Technical Interview Round 1');
  });
});
