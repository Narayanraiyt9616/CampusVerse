require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const Student = require('../src/models/Student');
const Department = require('../src/models/Department');
const Fee = require('../src/models/Fee');

const app = createApp();

describe('CampusVerse AI - Admin Portal Required Fixes Test Suite', () => {
  let dbConnected = false;
  let adminToken = '';
  let studentToken = '';
  let testStudent = null;
  let testFee = null;

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();

      // Admin login
      const resAdmin = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'narayanrai',
          password: '321456',
        });
      assert.equal(resAdmin.status, 200, 'Admin login must succeed');
      adminToken = resAdmin.body.token;

      // Student login
      const resStudent = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'studentdemo',
          password: process.env.STUDENT_PASSWORD || 'Student@2026',
        });
      assert.equal(resStudent.status, 200, 'Student login must succeed');
      studentToken = resStudent.body.token;

      // Find or create test student
      let dept = await Department.findOne();
      if (!dept) {
        dept = await Department.create({ name: 'Computer Science and Engineering', code: 'CSE' });
      }

      testStudent = await Student.findOne({ studentId: 'CS21B1042' });
      if (!testStudent) {
        testStudent = await Student.create({
          studentId: 'CS21B1042',
          name: 'Aarav Singhania',
          email: 'student@campusverse.edu',
          semester: 6,
          department: dept._id,
          enrollmentYear: 2021,
          status: 'Active',
        });
      }

      // Create a test fee record
      testFee = await Fee.create({
        student: testStudent._id,
        invoiceNumber: `TEST-INV-${Date.now().toString().slice(-6)}`,
        category: 'Tuition Fee',
        description: 'Semester 6 Tuition Fee',
        amount: 50000,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'Pending',
        semester: 6,
        academicYear: '2025-2026',
      });
    }
  });

  after(async () => {
    if (dbConnected) {
      if (testFee) {
        await Fee.findByIdAndDelete(testFee._id);
      }
      await disconnectDB();
    }
  });

  /* ──────────────────────────────────────────────────────────────────────────
     1. Fee Management: Fully Editable & Real-Time Persistence
     ────────────────────────────────────────────────────────────────────────── */
  describe('1. Fee Management Editing & Persistence', () => {
    it('Admin can update fee details via PUT/PATCH and changes persist to MongoDB', async () => {
      const updatePayload = {
        category: 'Examination Fee',
        amount: 55000,
        paidAmount: 20000,
        status: 'Pending',
        dueDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        paymentMode: 'Online',
        receiptNumber: 'REC-TEST-999',
        description: 'Updated Examination & Lab Fee description',
        remarks: 'Payment verified by administrator',
        semester: 7,
        academicYear: '2026-2027',
      };

      const res = await request(app)
        .put(`/api/admin/fees/${testFee._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      assert.equal(res.status, 200, `Update fee failed: ${JSON.stringify(res.body)}`);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.category, 'Examination Fee');
      assert.equal(res.body.data.amount, 55000);
      assert.equal(res.body.data.paidAmount, 20000);
      assert.equal(res.body.data.semester, 7);
      assert.equal(res.body.data.academicYear, '2026-2027');

      // Verify directly from MongoDB database
      const dbFee = await Fee.findById(testFee._id);
      assert.equal(dbFee.category, 'Examination Fee', 'Category must be updated in MongoDB');
      assert.equal(dbFee.amount, 55000, 'Amount must be updated in MongoDB');
      assert.equal(dbFee.paidAmount, 20000, 'Paid amount must be updated in MongoDB');
      assert.equal(dbFee.semester, 7, 'Semester must be updated in MongoDB');
      assert.equal(dbFee.receiptNumber, 'REC-TEST-999', 'Receipt number must be updated in MongoDB');
    });

    it('Fee update automatically marks status as Paid when paidAmount reaches total amount', async () => {
      const res = await request(app)
        .patch(`/api/admin/fees/${testFee._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paidAmount: 55000,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'Paid', 'Status should automatically become Paid');

      // Verify in DB
      const dbFee = await Fee.findById(testFee._id);
      assert.equal(dbFee.status, 'Paid');
    });

    it('Rejects negative fee amounts with 400 validation error', async () => {
      const res = await request(app)
        .patch(`/api/admin/fees/${testFee._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -500,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
     2. Export Reports: Complete Data & CSV/JSON Formats
     ────────────────────────────────────────────────────────────────────────── */
  describe('2. Export Reports Dataset & Download Endpoints', () => {
    it('Admin can fetch complete dataset for student enrollment report', async () => {
      const res = await request(app)
        .get('/api/admin/reports?type=students')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
      assert.ok(res.body.data[0]['Student ID'], 'Field Student ID must exist');
      assert.ok(res.body.data[0]['Department'], 'Field Department must exist');
    });

    it('Admin can fetch complete dataset for fee ledger report matching portal records', async () => {
      const res = await request(app)
        .get('/api/admin/reports?type=fees')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.some((f) => f['Invoice Number'] === testFee.invoiceNumber));
    });

    it('Admin can export reports as CSV file with UTF-8 BOM and attachment headers', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export?type=students&format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.match(res.headers['content-type'], /text\/csv/i);
      assert.match(res.headers['content-disposition'], /attachment/i);
      assert.match(res.headers['content-disposition'], /CampusVerse_students/i);
      assert.ok(res.text.includes('\uFEFF'), 'CSV must contain UTF-8 BOM for Excel compatibility');
      assert.ok(res.text.includes('Student ID'), 'CSV headers must be included');
    });

    it('Admin can export reports as JSON format dataset', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export?type=fees&format=json')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.match(res.headers['content-type'], /application\/json/i);
      assert.match(res.headers['content-disposition'], /attachment/i);
      assert.ok(Array.isArray(res.body));
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
     3. Navigation Bar Global Search
     ────────────────────────────────────────────────────────────────────────── */
  describe('3. Global Navigation Bar Search Feature', () => {
    it('Search finds student record by name with accurate metadata', async () => {
      const res = await request(app)
        .get('/api/search?q=Aarav')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.results));
      assert.ok(res.body.results.some((r) => r.type === 'student' && r.title.includes('Aarav')));
    });

    it('Search finds student record by roll number (CS21B1042)', async () => {
      const res = await request(app)
        .get('/api/search?q=CS21B1042')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.results.some((r) => r.badge === 'CS21B1042'));
    });

    it('Search finds fee invoices by invoice ID prefix', async () => {
      const res = await request(app)
        .get(`/api/search?q=${testFee.invoiceNumber}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.results.some((r) => r.type === 'fee' && r.title.includes(testFee.invoiceNumber)));
    });

    it('Handles empty or unmatched search queries cleanly with 0 results', async () => {
      const res = await request(app)
        .get('/api/search?q=nonexistent_token_string_99999')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 0);
      assert.deepEqual(res.body.results, []);
    });
  });
});
