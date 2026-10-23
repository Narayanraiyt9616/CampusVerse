require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');

const app = createApp();

describe('CampusVerse AI - Parent Portal Secure Student-Specific Access Suite', () => {
  let dbConnected = false;
  let parentTokenAarav = '';
  let parentTokenAditi = '';
  let adminToken = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();

      // Login as parentdemo (linked to Aarav Singhania - CS21B1042)
      const resAarav = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'parentdemo',
          password: process.env.PARENT_PASSWORD || 'Parent@2026',
        });
      assert.equal(resAarav.status, 200);
      parentTokenAarav = resAarav.body.token;

      // Login as parent_aditi (linked to Aditi Nair - CS21B1001)
      const resAditi = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'parent_aditi',
          password: 'Parent@2026',
        });
      assert.equal(resAditi.status, 200);
      parentTokenAditi = resAditi.body.token;

      // Login as admin (narayanrai)
      const resAdmin = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'narayanrai',
          password: '321456',
        });
      assert.equal(resAdmin.status, 200);
      adminToken = resAdmin.body.token;
    }
  });

  after(async () => {
    if (dbConnected) {
      await disconnectDB();
    }
  });

  describe('1. Parent Account Data Isolation (Aarav Singhania - CS21B1042)', () => {
    it('GET /api/parent/dashboard returns ONLY authorized student data (CS21B1042)', async () => {
      const res = await request(app)
        .get('/api/parent/dashboard')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.student.studentId, 'CS21B1042');
      assert.equal(res.body.student.name, 'Aarav Singhania');
    });

    it('GET /api/parent/student returns ONLY authorized student profile (CS21B1042)', async () => {
      const res = await request(app)
        .get('/api/parent/student')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.student.studentId, 'CS21B1042');
    });

    it('GET /api/parent/attendance-and-results returns ONLY authorized student attendance and marks', async () => {
      const res = await request(app)
        .get('/api/parent/attendance-and-results')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.student.studentId, 'CS21B1042');
    });

    it('GET /api/parent/fees returns ONLY authorized student fee invoices', async () => {
      const res = await request(app)
        .get('/api/parent/fees')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.student.studentId, 'CS21B1042');
    });

    it('GET /api/parent/wards returns ONLY the parent own linked ward(s), NOT all students', async () => {
      const res = await request(app)
        .get('/api/parent/wards')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.wards));
      assert.equal(res.body.wards.length, 1);
      assert.equal(res.body.wards[0].studentId, 'CS21B1042');
    });
  });

  describe('2. IDOR Prevention & Cross-Student Authorization Enforcement', () => {
    it('Parent A requesting Aditi Nair (CS21B1001) via ?studentId must return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/parent/dashboard?studentId=CS21B1001')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /Access Denied/i);
    });

    it('Parent A requesting Aditi Nair (CS21B1001) in /api/parent/student must return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/parent/student?studentId=CS21B1001')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /Access Denied/i);
    });

    it('Parent A requesting Aditi Nair (CS21B1001) in /api/parent/fees must return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/parent/fees?studentId=CS21B1001')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /Access Denied/i);
    });

    it('Parent A requesting Aditi Nair (CS21B1001) in /api/parent/attendance-and-results must return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/parent/attendance-and-results?studentId=CS21B1001')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /Access Denied/i);
    });

    it('Parent A requesting Aditi Nair (CS21B1001) in /api/students/:id must return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/students/CS21B1001')
        .set('Authorization', `Bearer ${parentTokenAarav}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.error.message || res.body.error, /Access Denied/i);
    });
  });

  describe('3. Multi-Parent Account Isolation Verification (Aditi Nair - CS21B1001)', () => {
    it('Parent B (parent_aditi) sees ONLY Aditi Nair (CS21B1001)', async () => {
      const res = await request(app)
        .get('/api/parent/dashboard')
        .set('Authorization', `Bearer ${parentTokenAditi}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.student.studentId, 'CS21B1001');
      assert.equal(res.body.student.name, 'Aditi Nair');
    });

    it('Parent B attempting to access Aarav Singhania (CS21B1042) must return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/parent/dashboard?studentId=CS21B1042')
        .set('Authorization', `Bearer ${parentTokenAditi}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.error, /Access Denied/i);
    });
  });

  describe('4. Administrative Multi-Student Visibility Verification', () => {
    it('Administrator can inspect any student records without restriction', async () => {
      const res1 = await request(app)
        .get('/api/parent/dashboard?studentId=CS21B1001')
        .set('Authorization', `Bearer ${adminToken}`);
      assert.equal(res1.status, 200);
      assert.equal(res1.body.student.studentId, 'CS21B1001');

      const res2 = await request(app)
        .get('/api/parent/dashboard?studentId=CS21B1042')
        .set('Authorization', `Bearer ${adminToken}`);
      assert.equal(res2.status, 200);
      assert.equal(res2.body.student.studentId, 'CS21B1042');
    });
  });
});
