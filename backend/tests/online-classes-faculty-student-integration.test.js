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

const app = createApp();

describe('CampusVerse – Faculty & Student Online Classes Integration Tests', () => {
  let dbConnected = false;
  let facultyToken = '';
  let studentToken = '';
  let otherStudentToken = '';
  let facultyUser = null;
  let studentUser = null;
  let otherStudentUser = null;

  let urlOnlyClassId = '';
  let codeOnlyClassId = '';
  let bothMethodsClassId = '';
  let draftClassId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();

      let dept = await Department.findOne({
        $or: [{ code: 'CSE' }, { name: 'Computer Science & Engineering' }, { name: /Computer Science/i }],
      });
      if (!dept) {
        dept = await Department.create({
          name: 'Computer Science & Engineering',
          code: 'CSE',
          establishedYear: 2018,
        });
      }

      const bcrypt = require('bcryptjs');
      const testPasswordHash = await bcrypt.hash('Password@123', 10);

      // Faculty user
      facultyUser = await User.findOne({ email: 'faculty_integration_test@campusverse.edu' });
      if (!facultyUser) {
        facultyUser = await User.create({
          name: 'Prof. Ananya Sharma',
          email: 'faculty_integration_test@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'faculty',
          status: 'active',
        });
      }

      // Eligible Student User (Sem 5, CSE)
      studentUser = await User.findOne({ email: 'student_integration_test@campusverse.edu' });
      if (!studentUser) {
        studentUser = await User.create({
          name: 'Rohan Mehra',
          email: 'student_integration_test@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'student',
          status: 'active',
        });
      }

      let studentDoc = await Student.findOne({ email: 'student_integration_test@campusverse.edu' });
      if (!studentDoc) {
        studentDoc = await Student.create({
          user: studentUser._id,
          studentId: 'CS22B1099',
          name: 'Rohan Mehra',
          email: 'student_integration_test@campusverse.edu',
          semester: 5,
          enrollmentYear: 2022,
          department: dept._id,
          status: 'Active',
        });
      } else {
        studentDoc.user = studentUser._id;
        studentDoc.semester = 5;
        studentDoc.department = dept._id;
        await studentDoc.save();
      }

      // Ineligible Student User (Sem 2, MECH)
      otherStudentUser = await User.findOne({ email: 'other_student_test@campusverse.edu' });
      if (!otherStudentUser) {
        otherStudentUser = await User.create({
          name: 'Vikram Joshi',
          email: 'other_student_test@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'student',
          status: 'active',
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

      let otherStudentDoc = await Student.findOne({ email: 'other_student_test@campusverse.edu' });
      if (!otherStudentDoc) {
        await Student.create({
          user: otherStudentUser._id,
          studentId: 'ME24B1001',
          name: 'Vikram Joshi',
          email: 'other_student_test@campusverse.edu',
          semester: 2,
          enrollmentYear: 2024,
          department: mechDept._id,
          status: 'Active',
        });
      }

      const jwt = require('jsonwebtoken');
      facultyToken = jwt.sign(
        { sub: facultyUser._id, id: facultyUser._id, email: facultyUser.email, role: facultyUser.role, name: facultyUser.name },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      studentToken = jwt.sign(
        { sub: studentUser._id, id: studentUser._id, email: studentUser.email, role: studentUser.role, name: studentUser.name },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      otherStudentToken = jwt.sign(
        { sub: otherStudentUser._id, id: otherStudentUser._id, email: otherStudentUser.email, role: otherStudentUser.role, name: otherStudentUser.name },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
    }
  });

  after(async () => {
    if (dbConnected) {
      if (urlOnlyClassId) await OnlineClass.findByIdAndDelete(urlOnlyClassId).catch(() => {});
      if (codeOnlyClassId) await OnlineClass.findByIdAndDelete(codeOnlyClassId).catch(() => {});
      if (bothMethodsClassId) await OnlineClass.findByIdAndDelete(bothMethodsClassId).catch(() => {});
      if (draftClassId) await OnlineClass.findByIdAndDelete(draftClassId).catch(() => {});
      await disconnectDB();
    }
  });

  describe('1. Flexible Joining Methods (URL only, Code only, Both)', () => {
    it('Faculty can publish a class with Meeting URL only', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Advanced Operating Systems - Concurrency',
          subject: 'Operating Systems',
          description: 'Mutex, semaphores, and reader-writer problems.',
          instructions: 'Keep your textbook Chapter 5 ready.',
          scheduledDate: '2026-11-25',
          startTime: '10:00',
          endTime: '11:00',
          meetingUrl: 'https://meet.google.com/aos-concurrency-101',
          platform: 'Google Meet',
          semester: 5,
          departmentName: 'Computer Science & Engineering',
          published: true,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.title, 'Advanced Operating Systems - Concurrency');
      assert.equal(res.body.class.meetingUrl, 'https://meet.google.com/aos-concurrency-101');
      assert.equal(res.body.class.instructions, 'Keep your textbook Chapter 5 ready.');
      urlOnlyClassId = res.body.class._id;
    });

    it('Faculty can publish a class with Meeting Code only (no URL)', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Database Management Systems - Normalization',
          subject: 'DBMS',
          description: '3NF and BCNF schema decomposition.',
          instructions: 'Join via Zoom client using the provided meeting code.',
          scheduledDate: '2026-11-26',
          startTime: '11:30',
          endTime: '12:30',
          meetingCode: 'ZOOM-882-991-002',
          platform: 'Zoom',
          semester: 5,
          departmentName: 'Computer Science & Engineering',
          published: true,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.meetingCode, 'ZOOM-882-991-002');
      assert.equal(res.body.class.meetingUrl, '');
      codeOnlyClassId = res.body.class._id;
    });

    it('Faculty can publish a class with BOTH Meeting URL and Meeting Code', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Software Engineering - Agile Sprints',
          subject: 'Software Engineering',
          description: 'Sprint planning and user story estimations.',
          instructions: 'You can join via direct link or enter the code on MS Teams.',
          scheduledDate: '2026-11-27',
          startTime: '14:00',
          endTime: '15:30',
          meetingUrl: 'https://teams.microsoft.com/l/meetup-join/se-agile-123',
          meetingCode: 'TEAMS-SE-449',
          passcode: 'SE2026',
          platform: 'Microsoft Teams',
          semester: 5,
          departmentName: 'Computer Science & Engineering',
          published: true,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.meetingUrl, 'https://teams.microsoft.com/l/meetup-join/se-agile-123');
      assert.equal(res.body.class.meetingCode, 'TEAMS-SE-449');
      bothMethodsClassId = res.body.class._id;
    });

    it('Rejects publishing when NEITHER Meeting URL nor Meeting Code is supplied', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Empty Joining Methods Class',
          subject: 'Testing',
          scheduledDate: '2026-11-28',
          startTime: '10:00',
          endTime: '11:00',
          semester: 5,
          departmentName: 'Computer Science & Engineering',
          published: true,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /at least one valid joining method/i);
    });
  });

  describe('2. Drafts vs Published Classes Visibility', () => {
    it('Faculty can save a class as Draft (without immediate joining methods)', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Compiler Design - Parsing (Draft)',
          subject: 'Compiler Design',
          scheduledDate: '2026-12-01',
          startTime: '09:00',
          endTime: '10:00',
          semester: 5,
          departmentName: 'Computer Science & Engineering',
          published: false,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.publicationStatus, 'Draft');
      draftClassId = res.body.class._id;
    });

    it('Eligible student CANNOT see Draft classes in their feed', async () => {
      const res = await request(app)
        .get('/api/online-classes')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      const foundDraft = res.body.classes.find((c) => c._id.toString() === draftClassId);
      assert.equal(foundDraft, undefined, 'Draft classes must not be visible to students');
    });

    it('Faculty CAN see their Draft classes in the Faculty Portal', async () => {
      const res = await request(app)
        .get('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      const foundDraft = res.body.classes.find((c) => c._id.toString() === draftClassId);
      assert.ok(foundDraft, 'Faculty must see their own draft classes');
      assert.equal(foundDraft.publicationStatus, 'Draft');
    });

    it('Faculty can publish the draft by adding meeting code and setting published to true', async () => {
      const res = await request(app)
        .put(`/api/online-classes/${draftClassId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          meetingCode: 'COMPILER-999',
          published: true,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.publicationStatus, 'Published');

      // Now eligible student should see it
      const studentRes = await request(app)
        .get('/api/online-classes')
        .set('Authorization', `Bearer ${studentToken}`);

      const found = studentRes.body.classes.find((c) => c._id.toString() === draftClassId);
      assert.ok(found, 'Student must see previously drafted class once published');
      assert.equal(found.meetingCode, 'COMPILER-999');
    });
  });

  describe('3. Student Portal Verification & Data Availability', () => {
    it('Eligible student (Sem 5, CSE) sees published classes with all details', async () => {
      const res = await request(app)
        .get('/api/online-classes')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Verify URL-only class
      const urlCls = res.body.classes.find((c) => c._id.toString() === urlOnlyClassId);
      assert.ok(urlCls, 'Student should see URL-only class');
      assert.equal(urlCls.meetingUrl, 'https://meet.google.com/aos-concurrency-101');
      assert.equal(urlCls.instructions, 'Keep your textbook Chapter 5 ready.');

      // Verify Code-only class
      const codeCls = res.body.classes.find((c) => c._id.toString() === codeOnlyClassId);
      assert.ok(codeCls, 'Student should see Code-only class');
      assert.equal(codeCls.meetingCode, 'ZOOM-882-991-002');
      assert.equal(codeCls.meetingUrl, '');

      // Verify Both-methods class
      const bothCls = res.body.classes.find((c) => c._id.toString() === bothMethodsClassId);
      assert.ok(bothCls, 'Student should see Both-methods class');
      assert.equal(bothCls.meetingUrl, 'https://teams.microsoft.com/l/meetup-join/se-agile-123');
      assert.equal(bothCls.meetingCode, 'TEAMS-SE-449');
      assert.equal(bothCls.passcode, 'SE2026');
    });

    it('Ineligible student (Sem 2, MECH) CANNOT see Semester 5 CSE classes', async () => {
      const res = await request(app)
        .get('/api/online-classes')
        .set('Authorization', `Bearer ${otherStudentToken}`);

      assert.equal(res.status, 200);
      const unauthorizedClass = res.body.classes.find(
        (c) => [urlOnlyClassId, codeOnlyClassId, bothMethodsClassId].includes(c._id.toString())
      );
      assert.equal(unauthorizedClass, undefined, 'Cohort isolation must hide unassigned classes');
    });
  });

  describe('4. Class Cancellation & Faculty Ownership Security', () => {
    it('Faculty can cancel their own class with a reason', async () => {
      const res = await request(app)
        .patch(`/api/online-classes/${urlOnlyClassId}/cancel`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ cancellationReason: 'Faculty attending an urgent academic conference.' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.status, 'Cancelled');
      assert.equal(res.body.class.cancellationReason, 'Faculty attending an urgent academic conference.');
    });

    it('Another user CANNOT cancel or edit a class they do not own', async () => {
      const res = await request(app)
        .patch(`/api/online-classes/${bothMethodsClassId}/cancel`)
        .set('Authorization', `Bearer ${otherStudentToken}`)
        .send({ cancellationReason: 'Malicious attempt' });

      // Student is forbidden
      assert.equal(res.status, 403);
    });
  });
});
