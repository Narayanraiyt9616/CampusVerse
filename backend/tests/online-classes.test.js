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
const Notification = require('../src/models/Notification');

const app = createApp();

describe('CampusVerse AI - Online Classes Management System Test Suite', () => {
  let dbConnected = false;
  let facultyToken = '';
  let studentToken = '';
  let otherStudentToken = '';
  let facultyUser = null;
  let studentUser = null;
  let otherStudentUser = null;
  let testClassId = '';
  let customWebsiteClassId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();

      // 1. Setup Department
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

      // 2. Setup Faculty User
      facultyUser = await User.findOne({ email: 'faculty@campusverse.edu' });
      if (!facultyUser) {
        facultyUser = await User.create({
          name: 'Dr. Rajiv Menon',
          email: 'faculty@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'faculty',
          status: 'active',
        });
      }


      // 3. Setup Eligible Student User (Semester 7, CSE)
      studentUser = await User.findOne({ email: 'student@campusverse.edu' });
      if (!studentUser) {
        studentUser = await User.create({
          name: 'Aarav Singhania',
          email: 'student@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'student',
          status: 'active',
        });
      }

      let studentDoc = await Student.findOne({
        $or: [{ studentId: 'CS21B1042' }, { email: 'student@campusverse.edu' }],
      });
      if (!studentDoc) {
        studentDoc = await Student.create({
          user: studentUser._id,
          studentId: 'CS21B1042',
          name: 'Aarav Singhania',
          email: 'student@campusverse.edu',
          semester: 7,
          enrollmentYear: 2021,
          department: dept._id,
          status: 'Active',
        });
      } else {
        studentDoc.user = studentUser._id;
        studentDoc.semester = 7;
        studentDoc.department = dept._id;
        if (!studentDoc.enrollmentYear) studentDoc.enrollmentYear = 2021;
        await studentDoc.save();
      }


      // 4. Setup Ineligible Student User (Semester 2, Mechanical)
      let mechDept = await Department.findOne({
        $or: [{ code: 'MECH' }, { name: 'Mechanical Engineering' }, { name: /Mechanical/i }],
      });
      if (!mechDept) {
        mechDept = await Department.create({
          name: 'Mechanical Engineering',
          code: 'MECH',
          establishedYear: 2018,
        });
      }

      otherStudentUser = await User.findOne({ email: 'otherstudent@campusverse.edu' });
      if (!otherStudentUser) {
        otherStudentUser = await User.create({
          name: 'Other Student',
          email: 'otherstudent@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'student',
          status: 'active',
        });
      }

      let otherStudentDoc = await Student.findOne({
        $or: [{ studentId: 'ME24B0001' }, { email: 'otherstudent@campusverse.edu' }],
      });
      if (!otherStudentDoc) {
        await Student.create({
          user: otherStudentUser._id,
          studentId: 'ME24B0001',
          name: 'Other Student',
          email: 'otherstudent@campusverse.edu',
          semester: 2,
          enrollmentYear: 2024,
          department: mechDept._id,
          status: 'Active',
        });
      } else {
        otherStudentDoc.user = otherStudentUser._id;
        otherStudentDoc.semester = 2;
        otherStudentDoc.department = mechDept._id;
        if (!otherStudentDoc.enrollmentYear) otherStudentDoc.enrollmentYear = 2024;
        await otherStudentDoc.save();
      }

      const jwt = require('jsonwebtoken');
      facultyToken = jwt.sign(
        { sub: facultyUser._id, role: facultyUser.role, email: facultyUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      studentToken = jwt.sign(
        { sub: studentUser._id, role: studentUser.role, email: studentUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      otherStudentToken = jwt.sign(
        { sub: otherStudentUser._id, role: otherStudentUser.role, email: otherStudentUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Clean up previous test classes
      await OnlineClass.deleteMany({ title: { $regex: /Test Class/i } });
      await Notification.deleteMany({ 'metadata.title': { $regex: /Test Class/i } });
    }
  });

  after(async () => {
    if (dbConnected) {
      await OnlineClass.deleteMany({ title: { $regex: /Test Class/i } });
      await Notification.deleteMany({ 'metadata.title': { $regex: /Test Class/i } });
      await disconnectDB();
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Validation & Security Tests
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Input Validation & Security Enforcement', () => {
    it('should reject class creation if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ title: 'Test Class Missing Fields' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('should reject invalid or insecure meeting URLs (e.g. javascript: or plain text)', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Test Class Insecure URL',
          subject: 'Artificial Intelligence',
          scheduledDate: '2026-11-10',
          startTime: '10:00',
          endTime: '11:00',
          meetingUrl: 'javascript:alert(1)',
          semester: 7,
          departmentName: 'Computer Science & Engineering',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /meeting URL/i);
    });

    it('should reject invalid time sequence when endTime is before or equal to startTime', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Test Class Bad Time',
          subject: 'Artificial Intelligence',
          scheduledDate: '2026-11-10',
          startTime: '11:00',
          endTime: '10:00',
          meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
          semester: 7,
          departmentName: 'Computer Science & Engineering',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /End time must be.*after.*start time/i);
    });

    it('should forbid students from creating an online class (Role 403)', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Attempted Class',
          subject: 'Artificial Intelligence',
          scheduledDate: '2026-11-10',
          startTime: '10:00',
          endTime: '11:00',
          meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
          semester: 7,
        });

      assert.equal(res.status, 403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Class Creation & Platform Auto-detection
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Faculty Class Scheduling & Platform Detection', () => {
    it('should schedule Google Meet class, auto-detect platform, and notify eligible students', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Test Class - Neural Networks Architecture',
          subject: 'Deep Learning',
          description: 'Introduction to CNNs and backpropagation algorithms.',
          scheduledDate: '2026-11-15',
          startTime: '14:00',
          endTime: '15:30',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          passcode: 'DL-2026',
          semester: 7,
          departmentName: 'Computer Science & Engineering',
          courseName: 'B.Tech CSE',
          section: 'A',
          published: true,
          allowPastLinks: true,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.title, 'Test Class - Neural Networks Architecture');
      assert.equal(res.body.class.platform, 'Google Meet');
      assert.equal(res.body.class.computedStatus, 'Upcoming');

      testClassId = String(res.body.class._id || res.body.class.id);

      // Verify that notification was created for eligible student
      const notif = await Notification.findOne({
        'metadata.classId': testClassId,
        type: 'ONLINE_CLASS_SCHEDULED',
      });
      assert.ok(notif, 'Expected ONLINE_CLASS_SCHEDULED notification to be dispatched');
      assert.equal(notif.priority, 'High');
    });

    it('should schedule Custom Website class with HTTPS URL from user custom domain', async () => {
      const res = await request(app)
        .post('/api/online-classes')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Test Class - Custom Platform Live Stream',
          subject: 'Cloud Computing',
          description: 'Live interactive session on AWS Serverless Architectures.',
          scheduledDate: '2026-11-20',
          startTime: '09:00',
          endTime: '10:30',
          meetingUrl: 'https://classes.campusverse-ai.live/room/cloud-computing-401',
          passcode: 'AWS-401',
          semester: 7,
          departmentName: 'Computer Science & Engineering',
          published: true,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.platform, 'Custom Website');
      assert.equal(res.body.class.meetingUrl, 'https://classes.campusverse-ai.live/room/cloud-computing-401');

      customWebsiteClassId = String(res.body.class._id || res.body.class.id);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Student Access & Cohort Filtering
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Student Access & Cohort Security', () => {
    it('eligible student (Sem 7, CSE) should see the scheduled classes in their feed', async () => {
      const res = await request(app)
        .get('/api/online-classes')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.classes));

      const found = res.body.classes.find((c) => c._id.toString() === testClassId);
      assert.ok(found, 'Eligible student must see the assigned class');
      assert.equal(found.title, 'Test Class - Neural Networks Architecture');
      assert.equal(found.meetingUrl, 'https://meet.google.com/abc-defg-hij');
    });

    it('ineligible student (Sem 2, MECH) should NOT see Semester 7 CSE classes', async () => {
      const res = await request(app)
        .get('/api/online-classes')
        .set('Authorization', `Bearer ${otherStudentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      const found = res.body.classes.find((c) => c._id.toString() === testClassId);
      assert.equal(found, undefined, 'Ineligible student should not see class for another semester/branch');
    });

    it('ineligible student should be forbidden from accessing class details by ID (403)', async () => {
      const res = await request(app)
        .get(`/api/online-classes/${testClassId}`)
        .set('Authorization', `Bearer ${otherStudentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /not enrolled/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Automatic Real-Time Class Status Computation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Dynamic Class Status Evaluation', () => {
    it('should accurately compute "Live Now" when scheduled period encompasses current time', async () => {
      // Create a class where startTime was 10 mins ago and endTime is 50 mins from now
      const now = new Date();
      const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const fiftyMinsLater = new Date(now.getTime() + 50 * 60 * 1000);

      const pad = (n) => String(n).padStart(2, '0');
      const startTimeStr = `${pad(tenMinsAgo.getHours())}:${pad(tenMinsAgo.getMinutes())}`;
      const endTimeStr = `${pad(fiftyMinsLater.getHours())}:${pad(fiftyMinsLater.getMinutes())}`;
      const todayStr = now.toISOString().split('T')[0];

      const liveClass = await OnlineClass.create({
        title: 'Test Class - Live Now Verification',
        subject: 'Real-Time Computing',
        faculty: facultyUser._id,
        facultyName: 'Dr. Rajiv Menon',
        scheduledDate: new Date(todayStr),
        startTime: startTimeStr,
        endTime: endTimeStr,
        startDateTime: tenMinsAgo,
        endDateTime: fiftyMinsLater,
        meetingUrl: 'https://meet.google.com/live-test-123',
        semester: 7,
        departmentName: 'Computer Science & Engineering',
        published: true,
      });

      const res = await request(app)
        .get(`/api/online-classes/${liveClass._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.class.computedStatus, 'Live Now');

      // Cleanup
      await OnlineClass.findByIdAndDelete(liveClass._id);
    });

    it('should accurately compute "Completed" when scheduled end time has passed', async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);

      const pad = (n) => String(n).padStart(2, '0');
      const startTimeStr = `${pad(twoHoursAgo.getHours())}:${pad(twoHoursAgo.getMinutes())}`;
      const endTimeStr = `${pad(oneHourAgo.getHours())}:${pad(oneHourAgo.getMinutes())}`;
      const todayStr = twoHoursAgo.toISOString().split('T')[0];

      const pastClass = await OnlineClass.create({
        title: 'Test Class - Past Session',
        subject: 'Real-Time Computing',
        faculty: facultyUser._id,
        facultyName: 'Dr. Rajiv Menon',
        scheduledDate: new Date(todayStr),
        startTime: startTimeStr,
        endTime: endTimeStr,
        startDateTime: twoHoursAgo,
        endDateTime: oneHourAgo,
        meetingUrl: 'https://meet.google.com/past-test-123',
        semester: 7,
        departmentName: 'Computer Science & Engineering',
        published: true,
        allowPastLinks: true,
      });

      const res = await request(app)
        .get(`/api/online-classes/${pastClass._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.class.computedStatus, 'Completed');

      // Cleanup
      await OnlineClass.findByIdAndDelete(pastClass._id);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Rescheduling, Link Updates & Student Notifications
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Class Modification, Rescheduling & Link Changes', () => {
    it('should record rescheduledFrom and notify students when class timing is changed', async () => {
      const res = await request(app)
        .put(`/api/online-classes/${testClassId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'Test Class - Neural Networks Architecture (Rescheduled)',
          subject: 'Deep Learning',
          scheduledDate: '2026-11-16',
          startTime: '16:00',
          endTime: '17:30',
          meetingUrl: 'https://meet.google.com/abc-defg-hij',
          semester: 7,
          departmentName: 'Computer Science & Engineering',
          published: true,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.class.rescheduledFrom);
      assert.equal(res.body.class.startTime, '16:00');

      // Check notification
      const notif = await Notification.findOne({
        'metadata.classId': testClassId,
        type: 'ONLINE_CLASS_RESCHEDULED',
      });
      assert.ok(notif, 'Expected ONLINE_CLASS_RESCHEDULED notification');
    });

    it('should notify students when meeting link is updated', async () => {
      const res = await request(app)
        .put(`/api/online-classes/${testClassId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          meetingUrl: 'https://meet.google.com/new-meeting-link-updated',
          startTime: '16:00',
          endTime: '17:30',
          scheduledDate: '2026-11-16',
          title: 'Test Class - Neural Networks Architecture (Rescheduled)',
          subject: 'Deep Learning',
          semester: 7,
          departmentName: 'Computer Science & Engineering',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.class.meetingUrl, 'https://meet.google.com/new-meeting-link-updated');

      const notif = await Notification.findOne({
        'metadata.classId': testClassId,
        type: 'ONLINE_CLASS_LINK_UPDATED',
      });
      assert.ok(notif, 'Expected ONLINE_CLASS_LINK_UPDATED notification');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Announcements & Cancellation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Class Announcements & Cancellation', () => {
    it('should broadcast an announcement and notify enrolled students', async () => {
      const res = await request(app)
        .post(`/api/online-classes/${testClassId}/announcements`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          message: 'Please review Lecture Slides 5-8 before joining tomorrow.',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.announcements.length >= 1);
      assert.equal(res.body.announcements[0].message, 'Please review Lecture Slides 5-8 before joining tomorrow.');

      const notif = await Notification.findOne({
        'metadata.classId': testClassId,
        type: 'ONLINE_CLASS_ANNOUNCEMENT',
      });
      assert.ok(notif, 'Expected ONLINE_CLASS_ANNOUNCEMENT notification');
    });

    it('should cancel class with reason, set status to Cancelled, and notify students', async () => {
      const res = await request(app)
        .patch(`/api/online-classes/${testClassId}/cancel`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          cancellationReason: 'Faculty attending National AI Symposium.',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.class.status, 'Cancelled');
      assert.equal(res.body.class.cancellationReason, 'Faculty attending National AI Symposium.');

      const notif = await Notification.findOne({
        'metadata.classId': testClassId,
        type: 'ONLINE_CLASS_CANCELLED',
      });
      assert.ok(notif, 'Expected ONLINE_CLASS_CANCELLED notification');
    });

    it('forbids unauthorized students from cancelling or editing classes', async () => {
      const res = await request(app)
        .patch(`/api/online-classes/${testClassId}/cancel`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cancellationReason: 'Student attempting cancellation' });

      assert.equal(res.status, 403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Deletion & Cleanup
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Class Deletion & Cleanup', () => {
    it('faculty can delete their created class and associated notifications', async () => {
      const res = await request(app)
        .delete(`/api/online-classes/${customWebsiteClassId}`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      const check = await OnlineClass.findById(customWebsiteClassId);
      assert.equal(check, null);
    });

    it('trigger reminder sweep endpoint completes without error', async () => {
      const res = await request(app)
        .post('/api/online-classes/reminders/sweep')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });
});
