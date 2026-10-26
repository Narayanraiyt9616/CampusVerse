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
const OnlineClass = require('../src/models/OnlineClass');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = createApp();

describe('CampusVerse – Share with Students Complete Workflow Verification', () => {
  let dbConnected = false;
  let facultyUser, eligibleStudentUser, ineligibleStudentUser;
  let facultyToken, eligibleStudentToken, ineligibleStudentToken;
  let createdClassId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    assert.ok(dbConnected, 'MongoDB should be connected for testing');

    await initializeAccounts();

    let cseDept = await Department.findOne({
      $or: [{ code: 'CSE' }, { name: /Computer Science/i }],
    });
    if (!cseDept) {
      cseDept = await Department.create({
        name: 'Computer Science & Engineering',
        code: 'CSE',
        establishedYear: 2018,
      });
    }

    let mechDept = await Department.findOne({
      $or: [{ code: 'MECH' }, { name: /Mechanical/i }],
    });
    if (!mechDept) {
      mechDept = await Department.create({
        name: 'Mechanical Engineering',
        code: 'MECH',
        establishedYear: 2018,
      });
    }

    const testPasswordHash = await bcrypt.hash('Password@123', 10);

    // Faculty user
    facultyUser = await User.findOne({ email: 'share_btn_faculty@campusverse.edu' });
    if (!facultyUser) {
      facultyUser = await User.create({
        name: 'Prof. Rajiv Raman',
        email: 'share_btn_faculty@campusverse.edu',
        passwordHash: testPasswordHash,
        role: 'faculty',
        status: 'active',
      });
    }

    // Eligible Student User (Sem 7, CSE)
    eligibleStudentUser = await User.findOne({ email: 'share_btn_eligible_student@campusverse.edu' });
    if (!eligibleStudentUser) {
      eligibleStudentUser = await User.create({
        name: 'Arjun Singhania',
        email: 'share_btn_eligible_student@campusverse.edu',
        passwordHash: testPasswordHash,
        role: 'student',
        status: 'active',
      });
    }

    let eligibleStudentDoc = await Student.findOne({ email: 'share_btn_eligible_student@campusverse.edu' });
    if (!eligibleStudentDoc) {
      eligibleStudentDoc = await Student.create({
        user: eligibleStudentUser._id,
        studentId: 'CS20B1088',
        name: 'Arjun Singhania',
        email: 'share_btn_eligible_student@campusverse.edu',
        semester: 7,
        enrollmentYear: 2020,
        department: cseDept._id,
        status: 'Active',
      });
    } else {
      eligibleStudentDoc.user = eligibleStudentUser._id;
      eligibleStudentDoc.semester = 7;
      eligibleStudentDoc.department = cseDept._id;
      await eligibleStudentDoc.save();
    }

    // Ineligible Student User (Sem 3, MECH)
    ineligibleStudentUser = await User.findOne({ email: 'share_btn_ineligible_student@campusverse.edu' });
    if (!ineligibleStudentUser) {
      ineligibleStudentUser = await User.create({
        name: 'Karan Verma',
        email: 'share_btn_ineligible_student@campusverse.edu',
        passwordHash: testPasswordHash,
        role: 'student',
        status: 'active',
      });
    }

    let ineligibleStudentDoc = await Student.findOne({ email: 'share_btn_ineligible_student@campusverse.edu' });
    if (!ineligibleStudentDoc) {
      await Student.create({
        user: ineligibleStudentUser._id,
        studentId: 'ME23B1044',
        name: 'Karan Verma',
        email: 'share_btn_ineligible_student@campusverse.edu',
        semester: 3,
        enrollmentYear: 2023,
        department: mechDept._id,
        status: 'Active',
      });
    }

    facultyToken = jwt.sign(
      { sub: facultyUser._id, id: facultyUser._id, email: facultyUser.email, role: facultyUser.role, name: facultyUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    eligibleStudentToken = jwt.sign(
      { sub: eligibleStudentUser._id, id: eligibleStudentUser._id, email: eligibleStudentUser.email, role: eligibleStudentUser.role, name: eligibleStudentUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    ineligibleStudentToken = jwt.sign(
      { sub: ineligibleStudentUser._id, id: ineligibleStudentUser._id, email: ineligibleStudentUser.email, role: ineligibleStudentUser.role, name: ineligibleStudentUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  });

  after(async () => {
    if (createdClassId) {
      await OnlineClass.findByIdAndDelete(createdClassId);
    }
    await OnlineClass.deleteMany({ title: /Workflow Test Class/i });
    await disconnectDB();
  });

  it('1. Share with Students saves class to MongoDB with published: true', async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      title: 'Workflow Test Class - Advanced Neural Networks',
      subject: 'Artificial Intelligence & Deep Learning',
      description: 'Comprehensive walkthrough of Transformer architectures and multi-head attention.',
      instructions: 'Keep microphones muted upon entry; have PyTorch installed locally.',
      scheduledDate: today,
      startTime: '14:30',
      endTime: '15:30',
      meetingUrl: 'https://meet.google.com/xyz-cvai-test',
      meetingCode: 'xyz-cvai-test',
      platform: 'Google Meet',
      passcode: 'AI-2026',
      semester: 7,
      departmentName: 'Computer Science & Engineering',
      courseName: 'B.Tech CSE',
      section: 'A',
      published: true,
    };

    const res = await request(app)
      .post('/api/online-classes')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send(payload);

    assert.equal(res.status, 201, `Expected 201 Created but got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.success, true);
    assert.ok(res.body.class, 'Response should contain class object');
    assert.equal(res.body.class.title, payload.title);
    assert.equal(res.body.class.published, true);
    assert.equal(res.body.class.meetingCode, 'xyz-cvai-test');
    assert.equal(res.body.class.instructions, payload.instructions);

    createdClassId = res.body.class._id;

    // Verify directly in MongoDB
    const dbDoc = await OnlineClass.findById(createdClassId);
    assert.ok(dbDoc, 'MongoDB document must exist');
    assert.equal(dbDoc.published, true, 'published must be true in MongoDB');
    assert.equal(dbDoc.meetingUrl, 'https://meet.google.com/xyz-cvai-test');
    assert.equal(dbDoc.meetingCode, 'xyz-cvai-test');
    assert.equal(dbDoc.semester, 7);
  });

  it('2. Eligible Student (Sem 7, CSE) can view the shared class in Online Classes section', async () => {
    const res = await request(app)
      .get('/api/online-classes')
      .set('Authorization', `Bearer ${eligibleStudentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.classes));

    const found = res.body.classes.find((c) => c._id === createdClassId);
    assert.ok(found, 'Shared online class must appear in eligible student class list');
    assert.equal(found.title, 'Workflow Test Class - Advanced Neural Networks');
    assert.equal(found.meetingUrl, 'https://meet.google.com/xyz-cvai-test');
    assert.equal(found.meetingCode, 'xyz-cvai-test');
    assert.equal(found.instructions, 'Keep microphones muted upon entry; have PyTorch installed locally.');
  });

  it('3. Ineligible Student (Sem 3, MECH) CANNOT see the Semester 7 CSE class', async () => {
    const res = await request(app)
      .get('/api/online-classes')
      .set('Authorization', `Bearer ${ineligibleStudentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.classes));

    const found = res.body.classes.find((c) => c._id === createdClassId);
    assert.equal(found, undefined, 'Ineligible student must NOT see Semester 7 CSE class');
  });

  it('4. Rejects class without joining credentials when published: true', async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      title: 'Missing Link Class',
      subject: 'Data Structures',
      scheduledDate: today,
      startTime: '10:00',
      endTime: '11:00',
      meetingUrl: '',
      meetingCode: '',
      semester: 7,
      published: true,
    };

    const res = await request(app)
      .post('/api/online-classes')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send(payload);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /joining method/i);
  });

  it('5. Rejects invalid meeting URL format (e.g. javascript: or plain text)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      title: 'Invalid URL Class',
      subject: 'Data Structures',
      scheduledDate: today,
      startTime: '10:00',
      endTime: '11:00',
      meetingUrl: 'javascript:alert(1)',
      semester: 7,
      published: true,
    };

    const res = await request(app)
      .post('/api/online-classes')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send(payload);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('6. Rejects class when startTime >= endTime on the same day', async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      title: 'Time Sequence Test Class',
      subject: 'Operating Systems',
      scheduledDate: today,
      startTime: '15:00',
      endTime: '14:00',
      meetingUrl: 'https://meet.google.com/test-seq-123',
      semester: 7,
      published: true,
    };

    const res = await request(app)
      .post('/api/online-classes')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send(payload);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /End time must be strictly after/i);
  });

  it('7. Forbids students from creating classes (Role 403 Forbidden)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      title: 'Student Attempt Class',
      subject: 'Hack Attempt',
      scheduledDate: today,
      startTime: '10:00',
      endTime: '11:00',
      meetingUrl: 'https://meet.google.com/student-hack-123',
      semester: 7,
      published: true,
    };

    const res = await request(app)
      .post('/api/online-classes')
      .set('Authorization', `Bearer ${eligibleStudentToken}`)
      .send(payload);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });
});
