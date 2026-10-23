require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const AdmitCard = require('../src/models/AdmitCard');

const bcrypt = require('bcryptjs');
const Department = require('../src/models/Department');

const app = createApp();

describe('CampusVerse AI - Admit Card Management System Test Suite', () => {
  let dbConnected = false;
  let adminToken = '';
  let studentTokenAarav = '';
  let studentTokenOther = '';
  let issuedCardId = '';
  let aaravStudentDoc = null;
  let otherStudentDoc = null;

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

      // 1. Admin login (narayanrai)
      const resAdmin = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'narayanrai',
          password: '321456',
        });
      assert.equal(resAdmin.status, 200, 'Admin login should succeed');
      adminToken = resAdmin.body.token;

      // 2. Find or create student Aarav
      aaravStudentDoc = await Student.findOne({ studentId: 'CS21B1042' });
      if (!aaravStudentDoc) {
        aaravStudentDoc = await Student.create({
          studentId: 'CS21B1042',
          name: 'Aarav Singhania',
          email: 'student@campusverse.edu',
          semester: 6,
          department: dept._id,
          enrollmentYear: 2021,
          status: 'Active',
        });
      }

      // Link studentdemo user to aaravStudentDoc if not linked
      const aaravUser = await User.findOne({ username: 'studentdemo' });
      if (aaravUser && !aaravUser.studentRef) {
        aaravUser.studentRef = aaravStudentDoc._id;
        aaravUser.studentId = 'CS21B1042';
        aaravUser.metadata = { ...(aaravUser.metadata || {}), studentId: 'CS21B1042' };
        await aaravUser.save();
      }

      // Student login (studentdemo / CS21B1042 - Aarav Singhania)
      const resStudent = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'studentdemo',
          password: process.env.STUDENT_PASSWORD || 'Student@2026',
        });
      assert.equal(resStudent.status, 200, 'Student login should succeed');
      studentTokenAarav = resStudent.body.token;

      // 3. Create or find a second student to test unauthorized IDOR access
      otherStudentDoc = await Student.findOne({ studentId: 'CS21B1099' });
      if (!otherStudentDoc) {
        otherStudentDoc = await Student.create({
          studentId: 'CS21B1099',
          name: 'Rohan Sharma',
          email: 'rohan.sharma@campusverse.edu',
          semester: 6,
          department: dept._id,
          enrollmentYear: 2021,
          status: 'Active',
        });
      }

      let otherUser = await User.findOne({ username: 'student_rohan' });
      if (!otherUser) {
        const hash = await bcrypt.hash('Password@2026', 10);
        otherUser = await User.create({
          username: 'student_rohan',
          email: 'rohan.sharma@campusverse.edu',
          passwordHash: hash,
          role: 'student',
          studentRef: otherStudentDoc._id,
          studentId: 'CS21B1099',
          name: 'Rohan Sharma',
          status: 'active',
          metadata: { studentId: 'CS21B1099' },
        });
      }

      const resOther = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'student_rohan',
          password: 'Password@2026',
        });
      assert.equal(resOther.status, 200, 'Second student login should succeed');
      studentTokenOther = resOther.body.token;

      // Clean up any lingering admit cards from previous test runs
      await AdmitCard.deleteMany({ studentId: { $in: ['CS21B1042', 'CS21B1099'] } });
    }
  });

  after(async () => {
    if (dbConnected) {
      if (issuedCardId) {
        await AdmitCard.findByIdAndDelete(issuedCardId);
      }
      await AdmitCard.deleteMany({ studentId: { $in: ['CS21B1042', 'CS21B1099'] } });
      await disconnectDB();
    }
  });

  it('1. Admin can fetch admit card metadata options', async () => {
    const res = await request(app)
      .get('/api/admit-cards/meta/options')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.students), 'Students list should be returned');
    assert.ok(Array.isArray(res.body.sessions), 'Sessions list should be returned');
  });

  it('2. Admin can issue an admit card for student with auto-generated PDF hall ticket', async () => {
    const res = await request(app)
      .post('/api/admit-cards/issue')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: 'CS21B1042',
        semester: 6,
        examTitle: 'End-Semester Theory & Practical Examination',
        examSession: 'Spring 2026',
        examDate: 'May 15 - May 30, 2026',
        remarks: 'Candidate must bring physical copy and institutional ID card.',
      });

    assert.equal(res.status, 201, `Issue failed: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.success, true);
    issuedCardId = (res.body.data && res.body.data._id) || (res.body.admitCard && res.body.admitCard._id);
    assert.ok(issuedCardId, 'Admit card ID should be present');
    assert.equal(res.body.data.studentId, 'CS21B1042');
    assert.equal(res.body.data.status, 'Issued');
  });

  it('3. Admin can list all admit cards and KPI summaries', async () => {
    const res = await request(app)
      .get('/api/admit-cards')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data), 'Data must be an array');
    assert.ok(res.body.summary, 'Summary KPI metrics should exist');
    assert.ok(res.body.data.some((c) => c._id.toString() === issuedCardId.toString()));
  });

  it('4. Student can retrieve ONLY their own issued admit cards', async () => {
    const res = await request(app)
      .get('/api/admit-cards/my-admit-cards')
      .set('Authorization', `Bearer ${studentTokenAarav}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data), 'Data should be array');
    assert.ok(res.body.data.length >= 1, 'Should contain at least one admit card');
    // Ensure all returned cards belong to student
    for (const card of res.body.data) {
      assert.equal(card.studentId, 'CS21B1042');
    }
  });

  it('5. Student can preview their own admit card as PDF stream', async () => {
    const res = await request(app)
      .get(`/api/admit-cards/${issuedCardId}/preview`)
      .set('Authorization', `Bearer ${studentTokenAarav}`);

    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /application\/pdf/i);
    assert.match(res.headers['content-disposition'], /inline/i);
    assert.ok(res.body.length > 0 || res.text.length > 0);
  });

  it('6. Student can download their own admit card with attachment header', async () => {
    const res = await request(app)
      .get(`/api/admit-cards/${issuedCardId}/download`)
      .set('Authorization', `Bearer ${studentTokenAarav}`);

    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /application\/pdf/i);
    assert.match(res.headers['content-disposition'], /attachment/i);
  });

  it('7. IDOR Security: Another student CANNOT preview, download, or access Aarav\'s admit card', async () => {
    // 7a. Get card details
    const resGet = await request(app)
      .get(`/api/admit-cards/${issuedCardId}`)
      .set('Authorization', `Bearer ${studentTokenOther}`);
    assert.equal(resGet.status, 403, 'Should forbid other student from viewing card details');

    // 7b. Preview card
    const resPreview = await request(app)
      .get(`/api/admit-cards/${issuedCardId}/preview`)
      .set('Authorization', `Bearer ${studentTokenOther}`);
    assert.equal(resPreview.status, 403, 'Should forbid other student from previewing PDF');

    // 7c. Download card
    const resDownload = await request(app)
      .get(`/api/admit-cards/${issuedCardId}/download`)
      .set('Authorization', `Bearer ${studentTokenOther}`);
    assert.equal(resDownload.status, 403, 'Should forbid other student from downloading PDF');
  });

  it('8. Student cannot issue, reissue, or delete admit cards (Admin only)', async () => {
    // Attempt issue
    const resIssue = await request(app)
      .post('/api/admit-cards/issue')
      .set('Authorization', `Bearer ${studentTokenAarav}`)
      .send({ studentId: 'CS21B1042', semester: 6 });
    assert.equal(resIssue.status, 403, 'Student should be forbidden from issuing admit cards');

    // Attempt reissue
    const resReissue = await request(app)
      .put(`/api/admit-cards/${issuedCardId}/reissue`)
      .set('Authorization', `Bearer ${studentTokenAarav}`)
      .send({ examDate: 'June 1 - June 15, 2026' });
    assert.equal(resReissue.status, 403, 'Student should be forbidden from reissuing admit cards');

    // Attempt delete
    const resDelete = await request(app)
      .delete(`/api/admit-cards/${issuedCardId}`)
      .set('Authorization', `Bearer ${studentTokenAarav}`);
    assert.equal(resDelete.status, 403, 'Student should be forbidden from deleting admit cards');
  });

  it('9. Admin can reissue an admit card with revision tracking', async () => {
    const res = await request(app)
      .put(`/api/admit-cards/${issuedCardId}/reissue`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        examTitle: 'Revised End-Semester Theory & Practical Examination',
        examDate: 'May 20 - June 5, 2026',
        remarks: 'Revised schedule due to university festival.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'Reissued');
    assert.equal(res.body.data.reissueCount, 1);
    assert.equal(res.body.data.examTitle, 'Revised End-Semester Theory & Practical Examination');
  });

  it('10. Admin can delete an admit card', async () => {
    const res = await request(app)
      .delete(`/api/admit-cards/${issuedCardId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify card is removed from DB
    const checkCard = await AdmitCard.findById(issuedCardId);
    assert.equal(checkCard, null, 'Admit card document should be removed from database');
    issuedCardId = null; // Cleaned up
  });
});
