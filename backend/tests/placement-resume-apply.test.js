require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Department = require('../src/models/Department');
const PlacementDrive = require('../src/models/PlacementDrive');
const Company = require('../src/models/Company');
const PlacementApplication = require('../src/models/PlacementApplication');
const bcrypt = require('bcryptjs');

const app = createApp();

describe('Student Portal - "Apply with Resume" File Upload & End-to-End Application Flow', () => {
  let dbConnected = false;
  let studentToken = '';
  let studentUser = null;
  let studentRecord = null;
  let department = null;
  let testDriveId = '';
  let testPdfPath = '';
  let testDocxPath = '';
  let createdAppWithPdfId = '';
  let testCompany = null;

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (!dbConnected) return;

    await initializeAccounts();

    // 1. Department
    department = await Department.findOne({
      $or: [{ code: 'CSE' }, { name: 'Computer Science & Engineering' }],
    });
    if (!department) {
      department = await Department.create({
        name: 'Computer Science & Engineering',
        code: 'CSE',
      });
    }

    // 2. Test Student User & Record
    const passwordHash = await bcrypt.hash('Student@2026', 10);
    studentUser = await User.findOneAndUpdate(
      { email: 'resume_apply_student@campusverse.edu' },
      {
        name: 'Aarav Singhania Test',
        username: 'resume_apply_stu',
        email: 'resume_apply_student@campusverse.edu',
        passwordHash,
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    studentRecord = await Student.findOneAndUpdate(
      { studentId: 'CV-RESUME-001' },
      {
        studentId: 'CV-RESUME-001',
        name: 'Aarav Singhania Test',
        email: 'resume_apply_student@campusverse.edu',
        user: studentUser._id,
        department: department._id,
        course: 'Computer Science & Engineering',
        semester: 8,
        cgpa: 9.1,
        status: 'Active',
      },
      { upsert: true, new: true }
    );

    studentToken = jwt.sign(
      { sub: studentUser._id, role: 'student', email: studentUser.email, username: studentUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 3. Create an Open Placement Drive with future deadline (> 48h)
    testCompany = await Company.findOne({ name: 'Stripe India Systems' });
    if (!testCompany) {
      testCompany = await Company.create({
        name: 'Stripe India Systems',
        industry: 'FinTech',
        website: 'https://stripe.com',
      });
    }

    const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const drive = await PlacementDrive.create({
      company: testCompany._id,
      companyName: 'Stripe India Systems',
      jobTitle: 'Backend Software Engineer (Payments Core)',
      jobField: 'Software Engineering',
      salaryPackage: { minLPA: 24, maxLPA: 28, displayPackage: '28.0 LPA' },
      driveDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      applicationDeadline: futureDeadline,
      venue: 'Main Campus Convention Center',
      status: 'Registration Open',
      eligibleCourses: ['Computer Science & Engineering', 'Information Technology'],
      eligibilityCriteria: {
        minCgpa: 7.5,
        eligibleDepartments: ['Computer Science & Engineering'],
      },
    });
    testDriveId = drive._id.toString();

    // 4. Create dummy PDF and DOCX files for testing
    testPdfPath = path.join(__dirname, 'test_resume_sample.pdf');
    fs.writeFileSync(testPdfPath, '%PDF-1.4\n%Sample resume PDF content for CampusVerse automated testing\n%%EOF');

    testDocxPath = path.join(__dirname, 'test_resume_sample.docx');
    fs.writeFileSync(testDocxPath, 'PK\x03\x04Mock DOCX file payload for resume attachment test');
  });

  after(async () => {
    // Clean up temporary resume files
    if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);
    if (fs.existsSync(testDocxPath)) fs.unlinkSync(testDocxPath);

    if (testDriveId) {
      await PlacementDrive.findByIdAndDelete(testDriveId).catch(() => {});
      await PlacementApplication.deleteMany({ drive: testDriveId }).catch(() => {});
    }
    if (studentUser) {
      await User.findByIdAndDelete(studentUser._id).catch(() => {});
    }
    if (studentRecord) {
      await Student.findByIdAndDelete(studentRecord._id).catch(() => {});
    }
    await disconnectDB();
  });

  it('1. Successfully applies with a PDF resume file and stores uploaded file path', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('driveId', testDriveId)
      .field('githubLink', 'https://github.com/aarav-singhania')
      .field('portfolioLink', 'https://aaravsinghania.dev')
      .field('liveProjectLink', 'https://paystream.aaravsinghania.dev')
      .field('coverNote', 'Specialized in distributed payment systems and transaction atomicity.')
      .attach('resume', testPdfPath);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.application._id);
    createdAppWithPdfId = res.body.application._id;

    // Check resumeLink was saved as a static upload path
    assert.ok(res.body.application.resumeLink, 'Application must have a resumeLink');
    assert.ok(
      res.body.application.resumeLink.startsWith('/uploads/resumes/'),
      `resumeLink must point to /uploads/resumes/, got: ${res.body.application.resumeLink}`
    );
    assert.ok(
      res.body.application.resumeLink.endsWith('.pdf'),
      `resumeLink must preserve .pdf extension, got: ${res.body.application.resumeLink}`
    );

    // Verify physical file was written to disk
    const savedFilename = path.basename(res.body.application.resumeLink);
    const diskPath = path.join(__dirname, '../uploads/resumes', savedFilename);
    assert.ok(fs.existsSync(diskPath), `Uploaded resume file must exist on disk at ${diskPath}`);

    // Clean up physical file after verification
    try { fs.unlinkSync(diskPath); } catch {}
  });

  it('2. Prevents duplicate application submission for the same placement drive', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('driveId', testDriveId)
      .attach('resume', testPdfPath);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(
      res.body.error.toLowerCase().includes('already') ||
      res.body.error.toLowerCase().includes('duplicate')
    );
  });

  it('3. Rejects invalid resume file format (e.g. .exe, .sh, .txt)', async () => {
    if (!dbConnected) return;

    // Create a new separate drive to test invalid format
    const tempDrive = await PlacementDrive.create({
      company: testCompany._id,
      companyName: 'Format Test Corp',
      jobTitle: 'QA Intern',
      status: 'Registration Open',
      salaryPackage: { minLPA: 6, maxLPA: 8, displayPackage: '8.0 LPA' },
      driveDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      eligibleCourses: ['Computer Science & Engineering'],
    });

    const invalidFilePath = path.join(__dirname, 'malicious_script.sh');
    fs.writeFileSync(invalidFilePath, '#!/bin/bash\necho "test"');

    const res = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('driveId', tempDrive._id.toString())
      .attach('resume', invalidFilePath);

    if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);
    await PlacementDrive.findByIdAndDelete(tempDrive._id);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(
      res.body.error.toLowerCase().includes('format') ||
      res.body.error.toLowerCase().includes('invalid file') ||
      res.body.error.toLowerCase().includes('pdf')
    );
  });

  it('4. Student can retrieve their submitted application with resume link in getMyPlacementApplications', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .get('/api/placement/my-applications')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.applications));

    const found = res.body.applications.find(
      (a) => (a._id || '').toString() === createdAppWithPdfId.toString()
    );
    assert.ok(found, 'Submitted application must be present in My Applications list');
    assert.equal(found.status, 'Applied');
    assert.ok(found.resumeLink && found.resumeLink.startsWith('/uploads/resumes/'));
  });
});
