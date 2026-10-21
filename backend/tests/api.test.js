const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');

// Create test instance of Express app
const app = createApp();

describe('CampusVerse AI - Backend API Suite (Part 2)', () => {

  describe('1. Health & Core Gateway Routes', () => {
    it('GET /api should return gateway metadata and endpoints directory', async () => {
      const res = await request(app).get('/api');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.endpoints.health);
      assert.ok(res.body.endpoints.students);
      assert.ok(res.body.endpoints.departments);
      assert.ok(res.body.endpoints.courses);
    });

    it('GET /api/health should report server operational and honest DB disconnected status when offline', async () => {
      const res = await request(app).get('/api/health');
      // When MongoDB is not connected, must return 503 Service Unavailable with degraded status
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.status, 'degraded');
      assert.equal(res.body.server.status, 'operational');
      assert.equal(res.body.database.status, 'disconnected');
      assert.ok(res.body.timestamp);
    });

    it('GET /api/unknown-endpoint should return structured 404 error response', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'ROUTE_NOT_FOUND');
    });
  });

  describe('2. Validation & Security Guard - Students API', () => {
    it('POST /api/students should reject empty body with 400 and validation errors', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(Array.isArray(res.body.error.details));
      const fields = res.body.error.details.map((d) => d.field);
      assert.ok(fields.includes('studentId'));
      assert.ok(fields.includes('name'));
      assert.ok(fields.includes('email'));
      assert.ok(fields.includes('department'));
    });

    it('POST /api/students should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({
          studentId: 'CS21B1099',
          name: 'Test Student',
          email: 'not-an-email',
          department: '507f1f77bcf86cd799439011',
          semester: 5,
          enrollmentYear: 2022,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      const emailErr = res.body.error.details.find((d) => d.field === 'email');
      assert.ok(emailErr);
    });

    it('POST /api/students should reject invalid department ObjectId', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({
          studentId: 'CS21B1099',
          name: 'Test Student',
          email: 'test.student@campusverse.edu',
          department: 'invalid-non-object-id',
          semester: 5,
          enrollmentYear: 2022,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      const deptErr = res.body.error.details.find((d) => d.field === 'department');
      assert.ok(deptErr);
    });

    it('POST /api/students should reject out-of-range semester (>12 or <1)', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({
          studentId: 'CS21B1099',
          name: 'Test Student',
          email: 'test.student@campusverse.edu',
          department: '507f1f77bcf86cd799439011',
          semester: 15,
          enrollmentYear: 2022,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      const semErr = res.body.error.details.find((d) => d.field === 'semester');
      assert.ok(semErr);
    });
  });

  describe('3. Validation - Departments API', () => {
    it('POST /api/departments should reject missing department code and name', async () => {
      const res = await request(app)
        .post('/api/departments')
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      const fields = res.body.error.details.map((d) => d.field);
      assert.ok(fields.includes('name'));
      assert.ok(fields.includes('code'));
    });

    it('POST /api/departments should reject single character department code', async () => {
      const res = await request(app)
        .post('/api/departments')
        .send({
          name: 'Bio Engineering',
          code: 'B', // Must be at least 2 chars
        });

      assert.equal(res.status, 400);
      const codeErr = res.body.error.details.find((d) => d.field === 'code');
      assert.ok(codeErr);
    });
  });

  describe('4. Validation - Courses API', () => {
    it('POST /api/courses should reject credits exceeding 10 or less than 1', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          courseCode: 'CS999',
          title: 'Advanced Neural Systems',
          credits: 15, // Out of range
          department: '507f1f77bcf86cd799439011',
          semester: 7,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      const creditsErr = res.body.error.details.find((d) => d.field === 'credits');
      assert.ok(creditsErr);
    });
  });

  describe('5. Database Offline State Protection', () => {
    it('GET /api/students should return 503 DATABASE_UNAVAILABLE when database is disconnected', async () => {
      const res = await request(app).get('/api/students');
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'DATABASE_UNAVAILABLE');
    });

    it('GET /api/departments should return 503 DATABASE_UNAVAILABLE when database is disconnected', async () => {
      const res = await request(app).get('/api/departments');
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'DATABASE_UNAVAILABLE');
    });

    it('GET /api/courses should return 503 DATABASE_UNAVAILABLE when database is disconnected', async () => {
      const res = await request(app).get('/api/courses');
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'DATABASE_UNAVAILABLE');
    });
  });

  describe('6. Error Handling & Malformed Payloads', () => {
    it('POST with malformed JSON body should return 400 INVALID_JSON', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Content-Type', 'application/json')
        .send('{"bad_json: true');

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'INVALID_JSON');
    });
  });

});
