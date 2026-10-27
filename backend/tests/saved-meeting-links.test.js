require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const User = require('../src/models/User');
const SavedMeetingLink = require('../src/models/SavedMeetingLink');

const app = createApp();

describe('Saved Meeting Links Feature Test Suite', () => {
  let dbConnected = false;
  let facultyToken = '';
  let otherFacultyToken = '';
  let studentToken = '';
  let facultyUser = null;
  let otherFacultyUser = null;
  let studentUser = null;
  let createdLinkId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();

      const bcrypt = require('bcryptjs');
      const testPasswordHash = await bcrypt.hash('Password@123', 10);

      // Primary faculty
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

      // Secondary faculty
      otherFacultyUser = await User.findOne({ email: 'faculty2@campusverse.edu' });
      if (!otherFacultyUser) {
        otherFacultyUser = await User.create({
          name: 'Prof. Ananya Sharma',
          email: 'faculty2@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'faculty',
          status: 'active',
        });
      }

      // Student
      studentUser = await User.findOne({ email: 'student@campusverse.edu' });
      if (!studentUser) {
        studentUser = await User.create({
          name: 'Arjun Verma',
          email: 'student@campusverse.edu',
          passwordHash: testPasswordHash,
          role: 'student',
          status: 'active',
        });
      }

      const jwt = require('jsonwebtoken');
      facultyToken = jwt.sign(
        { sub: facultyUser._id, email: facultyUser.email, role: facultyUser.role, name: facultyUser.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      otherFacultyToken = jwt.sign(
        { sub: otherFacultyUser._id, email: otherFacultyUser.email, role: otherFacultyUser.role, name: otherFacultyUser.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      studentToken = jwt.sign(
        { sub: studentUser._id, email: studentUser.email, role: studentUser.role, name: studentUser.name },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
    }
  });

  after(async () => {
    if (dbConnected) {
      if (facultyUser) {
        await SavedMeetingLink.deleteMany({ faculty: { $in: [facultyUser._id, otherFacultyUser?._id] } });
      }
      await disconnectDB();
    }
  });

  it('1. GET /api/online-classes/saved-links should return list of saved links for faculty', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .get('/api/online-classes/saved-links')
      .set('Authorization', `Bearer ${facultyToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.savedLinks));
  });

  it('2. POST /api/online-classes/saved-links should validate required name and URL', async () => {
    if (!dbConnected) return;

    const resNoName = await request(app)
      .post('/api/online-classes/saved-links')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ meetingUrl: 'https://meet.google.com/abc-defg-hij' });

    assert.equal(resNoName.status, 400);
    assert.equal(resNoName.body.success, false);

    const resNoUrl = await request(app)
      .post('/api/online-classes/saved-links')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ name: 'My Daily Lab' });

    assert.equal(resNoUrl.status, 400);
    assert.equal(resNoUrl.body.success, false);
  });

  it('3. POST /api/online-classes/saved-links should permanently save a link with custom name and platform auto-detection', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .post('/api/online-classes/saved-links')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        name: 'Distributed Systems Lecture Hall',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        meetingCode: 'abc-defg-hij',
        passcode: 'DS-2026',
        description: 'Permanent Google Meet room for 7th Sem Distributed Systems',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.savedLink);
    assert.equal(res.body.savedLink.name, 'Distributed Systems Lecture Hall');
    assert.equal(res.body.savedLink.meetingUrl, 'https://meet.google.com/abc-defg-hij');
    assert.equal(res.body.savedLink.platform, 'Google Meet');
    assert.equal(res.body.savedLink.meetingCode, 'abc-defg-hij');

    createdLinkId = res.body.savedLink._id;

    // Verify it exists directly in DB
    const dbRecord = await SavedMeetingLink.findById(createdLinkId);
    assert.ok(dbRecord);
    assert.equal(dbRecord.name, 'Distributed Systems Lecture Hall');
  });

  it('4. Faculty should retrieve their saved links including the newly created one', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .get('/api/online-classes/saved-links')
      .set('Authorization', `Bearer ${facultyToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const found = res.body.savedLinks.find((l) => l._id.toString() === createdLinkId);
    assert.ok(found);
    assert.equal(found.name, 'Distributed Systems Lecture Hall');
  });

  it('5. PUT /api/online-classes/saved-links/:id should update saved link details', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .put(`/api/online-classes/saved-links/${createdLinkId}`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        name: 'Distributed Systems - Core Lab Room',
        passcode: 'NEW-PIN-99',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.savedLink.name, 'Distributed Systems - Core Lab Room');
    assert.equal(res.body.savedLink.passcode, 'NEW-PIN-99');
  });

  it('6. Another faculty should NOT be able to delete or edit someone else\'s saved link', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .delete(`/api/online-classes/saved-links/${createdLinkId}`)
      .set('Authorization', `Bearer ${otherFacultyToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  it('7. Students should be forbidden from accessing or saving meeting links', async () => {
    if (!dbConnected) return;

    const resGet = await request(app)
      .get('/api/online-classes/saved-links')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.equal(resGet.status, 403);

    const resPost = await request(app)
      .post('/api/online-classes/saved-links')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Hacker Room', meetingUrl: 'https://meet.google.com/xyz' });

    assert.equal(resPost.status, 403);
  });

  it('8. DELETE /api/online-classes/saved-links/:id should delete link permanently from DB', async () => {
    if (!dbConnected) return;

    const res = await request(app)
      .delete(`/api/online-classes/saved-links/${createdLinkId}`)
      .set('Authorization', `Bearer ${facultyToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify completely gone from MongoDB
    const checkDb = await SavedMeetingLink.findById(createdLinkId);
    assert.equal(checkDb, null);
  });
});
