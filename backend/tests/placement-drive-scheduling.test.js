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
const PlacementDrive = require('../src/models/PlacementDrive');
const Notification = require('../src/models/Notification');
const bcrypt = require('bcryptjs');

const app = createApp();

describe('CampusVerse AI — Placement Drive Scheduling & Targeted Student Notifications Suite', () => {
  let dbConnected = false;
  let placementToken = '';
  let cseStudentToken = '';
  let eceStudentToken = '';
  let mechStudentToken = '';

  let cseStudentUser, eceStudentUser, mechStudentUser;
  let cseDept, eceDept, mechDept;

  let singleCourseDriveId = '';
  let multiCourseDriveId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (!dbConnected) return;

    await initializeAccounts();

    // 1. Setup / find departments
    const getOrCreateDept = async (name, code) => {
      let dept = await Department.findOne({
        $or: [{ code: new RegExp(`^${code}$`, 'i') }, { name: new RegExp(name, 'i') }],
      });
      if (!dept) {
        dept = await Department.create({ name, code });
      }
      return dept;
    };

    cseDept = await getOrCreateDept('Computer Science & Engineering', 'CSE');
    eceDept = await getOrCreateDept('Electronics & Communication Engineering', 'ECE');
    mechDept = await getOrCreateDept('Mechanical Engineering', 'MECH');

    const passwordHash = await bcrypt.hash('TestStudent@2026', 10);

    // 2. Setup Student Accounts & Student Records
    // CSE Student (Aarav Singhania)
    cseStudentUser = await User.findOneAndUpdate(
      { username: 'test_cse_student' },
      {
        username: 'test_cse_student',
        email: 'cse_student_test@campusverse.edu',
        name: 'Aarav Singhania (CSE)',
        passwordHash,
        role: 'student',
        status: 'active',
        metadata: { studentId: 'CS21B1042', course: 'Computer Science & Engineering' },
      },
      { upsert: true, new: true }
    );
    await Student.findOneAndUpdate(
      { studentId: 'CS21B1042' },
      {
        studentId: 'CS21B1042',
        name: 'Aarav Singhania',
        email: 'cse_student_test@campusverse.edu',
        department: cseDept._id,
        semester: 7,
        enrollmentYear: 2021,
        status: 'Active',
      },
      { upsert: true }
    );

    // ECE Student (Rohan Deshmukh)
    eceStudentUser = await User.findOneAndUpdate(
      { username: 'test_ece_student' },
      {
        username: 'test_ece_student',
        email: 'ece_student_test@campusverse.edu',
        name: 'Rohan Deshmukh (ECE)',
        passwordHash,
        role: 'student',
        status: 'active',
        metadata: { studentId: 'EC22B2014', course: 'Electronics & Communication Engineering' },
      },
      { upsert: true, new: true }
    );
    await Student.findOneAndUpdate(
      { studentId: 'EC22B2014' },
      {
        studentId: 'EC22B2014',
        name: 'Rohan Deshmukh',
        email: 'ece_student_test@campusverse.edu',
        department: eceDept._id,
        semester: 7,
        enrollmentYear: 2022,
        status: 'Active',
      },
      { upsert: true }
    );

    // Mechanical Student (Pooja Iyer)
    mechStudentUser = await User.findOneAndUpdate(
      { username: 'test_mech_student' },
      {
        username: 'test_mech_student',
        email: 'mech_student_test@campusverse.edu',
        name: 'Pooja Iyer (MECH)',
        passwordHash,
        role: 'student',
        status: 'active',
        metadata: { studentId: 'ME23B3008', course: 'Mechanical Engineering' },
      },
      { upsert: true, new: true }
    );
    await Student.findOneAndUpdate(
      { studentId: 'ME23B3008' },
      {
        studentId: 'ME23B3008',
        name: 'Pooja Iyer',
        email: 'mech_student_test@campusverse.edu',
        department: mechDept._id,
        semester: 7,
        enrollmentYear: 2023,
        status: 'Active',
      },
      { upsert: true }
    );

    // 3. Login as Placement Officer
    const placementLogin = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'placementdemo',
        password: process.env.PLACEMENT_PASSWORD || 'Placement@2026',
      });
    assert.equal(placementLogin.status, 200);
    placementToken = placementLogin.body.token;

    // Login CSE Student
    const cseLogin = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'test_cse_student',
        password: 'TestStudent@2026',
      });
    assert.equal(cseLogin.status, 200);
    cseStudentToken = cseLogin.body.token;

    // Login ECE Student
    const eceLogin = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'test_ece_student',
        password: 'TestStudent@2026',
      });
    assert.equal(eceLogin.status, 200);
    eceStudentToken = eceLogin.body.token;

    // Login MECH Student
    const mechLogin = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'test_mech_student',
        password: 'TestStudent@2026',
      });
    assert.equal(mechLogin.status, 200);
    mechStudentToken = mechLogin.body.token;
  });

  after(async () => {
    if (dbConnected) {
      if (singleCourseDriveId) await PlacementDrive.findByIdAndDelete(singleCourseDriveId);
      if (multiCourseDriveId) await PlacementDrive.findByIdAndDelete(multiCourseDriveId);
      await Notification.deleteMany({
        $or: [
          { recipient: cseStudentUser._id },
          { recipient: eceStudentUser._id },
          { recipient: mechStudentUser._id },
        ],
      });
      await disconnectDB();
    }
  });

  it('1. Schedules a drive for a Single Course (Computer Science & Engineering) with Job Field (Web Development)', async () => {
    const payload = {
      companyName: 'Atlassian Cloud Systems',
      jobTitle: 'Full-Stack Web Engineer',
      jobField: 'Web Development',
      jobType: 'Full-Time',
      description: 'Design and build cloud-native enterprise web services.',
      displayPackage: '₹ 26.5 LPA (CTC)',
      minCgpa: 7.5,
      maxBacklogs: 0,
      requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      eligibleCourses: ['Computer Science & Engineering'],
      driveDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      applicationDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      venue: 'HackerEarth Online Platform & Tech Hall A',
      evaluationRounds: ['Coding Challenge', 'System Architecture', 'HR Interview'],
    };

    const res = await request(app)
      .post('/api/placement/drives')
      .set('Authorization', `Bearer ${placementToken}`)
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.drive.companyName, 'Atlassian Cloud Systems');
    assert.equal(res.body.drive.jobField, 'Web Development');
    assert.deepEqual(res.body.drive.eligibleCourses, ['Computer Science & Engineering']);
    singleCourseDriveId = res.body.drive._id;
  });

  const driveIdMatches = (n, id) => {
    const dId = n.drive?._id || n.drive;
    return String(dId) === String(id) || String(n.metadata?.driveId) === String(id);
  };

  const getNotifs = (res) => res.body.data || res.body.notifications || [];

  it('2. Targeted notification delivered ONLY to eligible CSE student; NOT to ECE or Mechanical students', async () => {
    // Check CSE student notifications
    const cseNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${cseStudentToken}`);

    assert.equal(cseNotifs.status, 200);
    assert.equal(cseNotifs.body.success, true);

    const cseList = getNotifs(cseNotifs);
    const matchingCseAlert = cseList.find((n) => driveIdMatches(n, singleCourseDriveId));
    assert.ok(matchingCseAlert, 'CSE student should receive targeted notification for Atlassian drive');
    assert.equal(matchingCseAlert.title, 'A new placement opportunity is available for your course!');
    assert.equal(matchingCseAlert.companyName || matchingCseAlert.metadata?.companyName, 'Atlassian Cloud Systems');
    assert.equal(matchingCseAlert.jobRole || matchingCseAlert.metadata?.jobTitle, 'Full-Stack Web Engineer');
    assert.deepEqual(matchingCseAlert.eligibleCourses || matchingCseAlert.metadata?.eligibleCourses, ['Computer Science & Engineering']);

    // Check ECE student notifications: MUST NOT HAVE IT
    const eceNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${eceStudentToken}`);
    const eceList = getNotifs(eceNotifs);
    const matchingEceAlert = eceList.find((n) => driveIdMatches(n, singleCourseDriveId));
    assert.equal(matchingEceAlert, undefined, 'ECE student must NOT receive notification for CSE-only drive');

    // Check Mechanical student notifications: MUST NOT HAVE IT
    const mechNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${mechStudentToken}`);
    const mechList = getNotifs(mechNotifs);
    const matchingMechAlert = mechList.find((n) => driveIdMatches(n, singleCourseDriveId));
    assert.equal(matchingMechAlert, undefined, 'Mechanical student must NOT receive notification for CSE-only drive');
  });

  it('3. Course Eligibility Enforcement: Eligible CSE student can view drive, but ineligible students are blocked (403)', async () => {
    // CSE student can view via /eligible-drives
    const cseEligibleDrives = await request(app)
      .get('/api/placement/eligible-drives')
      .set('Authorization', `Bearer ${cseStudentToken}`);
    assert.equal(cseEligibleDrives.status, 200);
    const hasDriveInEligibleList = (cseEligibleDrives.body.drives || []).some(
      (d) => String(d._id) === String(singleCourseDriveId)
    );
    assert.ok(hasDriveInEligibleList, 'CSE student should see Atlassian in their eligible drives');

    // CSE student can fetch specific drive
    const cseDriveDetail = await request(app)
      .get(`/api/placement/drives/${singleCourseDriveId}`)
      .set('Authorization', `Bearer ${cseStudentToken}`);
    assert.equal(cseDriveDetail.status, 200);
    assert.equal(cseDriveDetail.body.drive.companyName, 'Atlassian Cloud Systems');

    // Mechanical student fetches specific drive URL directly: MUST RETURN 403 Forbidden
    const mechDriveDetail = await request(app)
      .get(`/api/placement/drives/${singleCourseDriveId}`)
      .set('Authorization', `Bearer ${mechStudentToken}`);
    assert.equal(mechDriveDetail.status, 403);
    const errMsg = mechDriveDetail.body.error || mechDriveDetail.body.message || '';
    assert.ok(errMsg.toLowerCase().includes('not eligible'), 'Must return descriptive eligibility error');

    // Mechanical student tries to submit application directly: MUST RETURN 403 Forbidden
    const mechApply = await request(app)
      .post('/api/placement/applications')
      .set('Authorization', `Bearer ${mechStudentToken}`)
      .send({ driveId: singleCourseDriveId });
    assert.equal(mechApply.status, 403);
  });

  it('4. Schedules a drive for Multiple Courses (CSE and ECE) with Job Field (Software Development)', async () => {
    const payload = {
      companyName: 'Qualcomm India Technologies',
      jobTitle: 'Embedded Software Engineer',
      jobField: 'Software Development',
      jobType: 'Full-Time',
      description: 'System software and hardware firmware development.',
      displayPackage: '₹ 22.0 LPA (CTC)',
      minCgpa: 7.0,
      maxBacklogs: 0,
      requiredSkills: ['C', 'C++', 'RTOS', 'Linux Kernel'],
      eligibleCourses: [
        'Computer Science & Engineering',
        'Electronics & Communication Engineering',
      ],
      driveDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      applicationDeadline: new Date(Date.now() + 86400000 * 4).toISOString(),
      venue: 'Auditorium 1',
      evaluationRounds: ['Aptitude & Technical MCQ', 'Technical Interview', 'HR'],
    };

    const res = await request(app)
      .post('/api/placement/drives')
      .set('Authorization', `Bearer ${placementToken}`)
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.drive.companyName, 'Qualcomm India Technologies');
    assert.equal(res.body.drive.jobField, 'Software Development');
    assert.equal(res.body.drive.eligibleCourses.length, 2);
    multiCourseDriveId = res.body.drive._id;

    // Both CSE and ECE students should receive notifications
    const cseNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${cseStudentToken}`);
    const cseList = getNotifs(cseNotifs);
    const cseHasQualcomm = cseList.some((n) => driveIdMatches(n, multiCourseDriveId));
    assert.ok(cseHasQualcomm, 'CSE student should receive Qualcomm notification');

    const eceNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${eceStudentToken}`);
    const eceList = getNotifs(eceNotifs);
    const eceHasQualcomm = eceList.some((n) => driveIdMatches(n, multiCourseDriveId));
    assert.ok(eceHasQualcomm, 'ECE student should receive Qualcomm notification');

    // Mechanical student MUST NOT receive notification
    const mechNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${mechStudentToken}`);
    const mechList = getNotifs(mechNotifs);
    const mechHasQualcomm = mechList.some((n) => driveIdMatches(n, multiCourseDriveId));
    assert.equal(mechHasQualcomm, false, 'Mechanical student must NOT receive Qualcomm notification');
  });

  it('5. Editing drive courses and job field synchronizes notifications without duplicate records', async () => {
    // Update Qualcomm drive to also include Mechanical Engineering
    const updatePayload = {
      jobField: 'Core Engineering & Embedded Systems',
      eligibleCourses: [
        'Computer Science & Engineering',
        'Electronics & Communication Engineering',
        'Mechanical Engineering',
      ],
      venue: 'Main Campus Convention Center & Online Labs',
    };

    const updateRes = await request(app)
      .put(`/api/placement/drives/${multiCourseDriveId}`)
      .set('Authorization', `Bearer ${placementToken}`)
      .send(updatePayload);

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.success, true);
    assert.equal(updateRes.body.drive.jobField, 'Core Engineering & Embedded Systems');
    assert.equal(updateRes.body.drive.eligibleCourses.length, 3);

    // Now Mechanical student SHOULD have the notification
    const mechNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${mechStudentToken}`);
    const mechList = getNotifs(mechNotifs);
    const mechHasUpdated = mechList.some((n) => driveIdMatches(n, multiCourseDriveId));
    assert.ok(mechHasUpdated, 'Mechanical student should now receive Qualcomm notification after edit');

    // Verify CSE student does NOT have duplicate notifications for this drive
    const cseNotifs = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${cseStudentToken}`);
    const cseList = getNotifs(cseNotifs);
    const cseDriveAlerts = cseList.filter((n) => driveIdMatches(n, multiCourseDriveId));
    assert.equal(cseDriveAlerts.length, 1, 'CSE student must have exactly 1 notification for this drive (no duplicates)');
  });

  it('6. Reading notifications persists and updates status in real-time', async () => {
    const cseNotifsBefore = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${cseStudentToken}`);
    const cseListBefore = getNotifs(cseNotifsBefore);
    const unreadNotif = cseListBefore.find((n) => !n.read && !n.isRead);
    assert.ok(unreadNotif, 'Should have at least one unread notification');

    // Mark single notification read
    const readRes = await request(app)
      .patch(`/api/students/notifications/${unreadNotif._id}/read`)
      .set('Authorization', `Bearer ${cseStudentToken}`);
    assert.equal(readRes.status, 200);
    const updatedNotif = readRes.body.notification || readRes.body.data;
    assert.ok(updatedNotif.read || updatedNotif.isRead, 'Notification should be marked read');

    // Mark all as read
    const markAllRes = await request(app)
      .patch('/api/students/notifications/read-all')
      .set('Authorization', `Bearer ${cseStudentToken}`);
    assert.equal(markAllRes.status, 200);
    assert.equal(markAllRes.body.success, true);

    // Verify all notifications are read
    const cseNotifsAfter = await request(app)
      .get('/api/students/notifications')
      .set('Authorization', `Bearer ${cseStudentToken}`);
    const cseListAfter = getNotifs(cseNotifsAfter);
    const remainingUnread = cseListAfter.filter((n) => !n.read && !n.isRead);
    assert.equal(remainingUnread.length, 0);
  });
});
