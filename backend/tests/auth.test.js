require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const User = require('../src/models/User');

const app = createApp();

describe('CampusVerse AI - Multi-Role Authentication & Authorization Suite', () => {
  let dbConnected = false;

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();
    }
  });

  after(async () => {
    if (dbConnected) {
      await disconnectDB();
    }
  });

  describe('1. Input Validation & Error Handling', () => {
    it('POST /api/auth/login should reject empty body with 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error);
    });

    it('POST /api/auth/login should reject unknown email with 401 generic error', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent.user@campusverse.edu',
          password: 'SomePassword@123',
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error, 'Invalid email or password.');
    });

    it('POST /api/auth/login should reject incorrect password with 401 generic error', async () => {
      if (!dbConnected) return; // Requires DB
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@campusverse.edu',
          password: 'WrongPassword@999',
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error, 'Invalid email or password.');
    });
  });

  describe('2. Fixed Administrator Account & Role Login', () => {
    it('Administrator login with valid credentials on Admin portal should succeed', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@campusverse.edu',
          password: 'CampusAdmin@2026',
          portalRole: 'admin',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'admin');
      assert.equal(res.body.user.email, 'admin@campusverse.edu');
      assert.ok(!res.body.user.passwordHash, 'Must not return password hash');
      assert.ok(res.body.token, 'Must return JWT token');
    });

    it('Superadmin login with valid credentials on super-admin portal should succeed', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'superadmin@campusverse.edu',
          password: 'SuperAdmin@2026',
          portalRole: 'superadmin',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'superadmin');
    });

    it('Student login with valid student credentials on student portal should succeed', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@campusverse.edu',
          password: 'Student@2026',
          portalRole: 'student',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'student');
    });

    it('Faculty login with valid faculty credentials on faculty portal should succeed', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'faculty@campusverse.edu',
          password: 'Faculty@2026',
          portalRole: 'faculty',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'faculty');
    });

    it('Parent login with valid parent credentials on parent portal should succeed', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'parent@campusverse.edu',
          password: 'Parent@2026',
          portalRole: 'parent',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'parent');
    });

    it('Placement officer login with valid placement credentials should succeed', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'placement@campusverse.edu',
          password: 'Placement@2026',
          portalRole: 'placement',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'placement');
    });

    it('Staff login with valid staff credentials on staff portal should succeed', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'staff@campusverse.edu',
          password: 'Staff@2026',
          portalRole: 'staff',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'staff');
    });
  });

  describe('3. Strict Cross-Role Validation (Cases 3 & 4)', () => {
    it('CASE 3: Admin credentials on Student Portal must fail with exact message', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@campusverse.edu',
          password: 'CampusAdmin@2026',
          portalRole: 'student',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(
        res.body.error,
        'These credentials are not authorized for the Student Portal. Please use the correct portal.'
      );
    });

    it('CASE 4: Student credentials on Administrator Console must fail with exact message', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@campusverse.edu',
          password: 'Student@2026',
          portalRole: 'admin',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(
        res.body.error,
        'You are not authorized to access the Administrator Console.'
      );
    });

    it('Admin credentials on Super Admin Console must fail', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@campusverse.edu',
          password: 'CampusAdmin@2026',
          portalRole: 'superadmin',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(
        res.body.error,
        'You are not authorized to access the Super Admin Console.'
      );
    });
  });

  describe('4. Session Inspection & Protected Superadmin Routes', () => {
    let studentToken;
    let adminToken;
    let superAdminToken;

    before(async () => {
      if (!dbConnected) return;
      const sLogin = await request(app).post('/api/auth/login').send({ email: 'student@campusverse.edu', password: 'Student@2026' });
      studentToken = sLogin.body.token;

      const aLogin = await request(app).post('/api/auth/login').send({ email: 'admin@campusverse.edu', password: 'CampusAdmin@2026' });
      adminToken = aLogin.body.token;

      const saLogin = await request(app).post('/api/auth/login').send({ email: 'superadmin@campusverse.edu', password: 'SuperAdmin@2026' });
      superAdminToken = saLogin.body.token;
    });

    it('GET /api/auth/me without token should return 401', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('GET /api/auth/me with valid Bearer token should return user profile', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, 'admin');
    });

    it('GET /api/superadmin/health with student token should return 403 Forbidden', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .get('/api/superadmin/health')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it('GET /api/superadmin/health with admin token should return 403 Forbidden (Admin is NOT Superadmin)', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .get('/api/superadmin/health')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it('GET /api/superadmin/health with superadmin token should return 200 OK', async () => {
      if (!dbConnected) return;
      const res = await request(app)
        .get('/api/superadmin/health')
        .set('Authorization', `Bearer ${superAdminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.system);
    });

    it('POST /api/auth/logout should clear session', async () => {
      const res = await request(app).post('/api/auth/logout');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });
});
