require('dotenv').config();
const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Notification = require('../src/models/Notification');
const {
  cleanExpiredNotifications,
  backfillExistingNotifications,
} = require('../src/services/notificationCleanupService');

const Department = require('../src/models/Department');

const app = createApp();

describe('CampusVerse AI - Alert & Notification Auto-Delete System (All Portals)', () => {
  let dbConnected = false;
  let adminToken, studentToken, student2Token, facultyToken, parentToken, placementToken, staffToken;
  let adminUser, studentUser, student2User, facultyUser, parentUser, placementUser, staffUser;
  let studentDoc, student2Doc;

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (dbConnected) {
      await initializeAccounts();

      // Find or create users for each portal
      adminUser = await User.findOne({ role: 'admin' });
      studentUser = await User.findOne({ role: 'student' });
      facultyUser = await User.findOne({ role: 'faculty' });
      parentUser = await User.findOne({ role: 'parent' });
      placementUser = await User.findOne({ role: 'placement' });
      staffUser = await User.findOne({ role: 'staff' });

      let dept = await Department.findOne();
      if (!dept) {
        dept = await Department.create({
          name: 'Computer Science and Engineering',
          code: 'CSE',
        });
      }

      // Create studentDoc if not existing
      studentDoc = await Student.findOne({ email: studentUser?.email });
      if (!studentDoc && studentUser) {
        studentDoc = await Student.create({
          name: studentUser.name || 'Student Aarav',
          email: studentUser.email,
          studentId: 'CS21B001',
          department: dept._id,
          semester: 6,
          enrollmentYear: 2021,
          status: 'Active',
        });
      }

      // Create a second student for cross-user permission testing
      student2User = await User.findOne({ email: 'student2.test@campusverse.edu' });
      if (!student2User) {
        student2User = await User.create({
          name: 'Student Diya',
          username: 'studentdiya',
          email: 'student2.test@campusverse.edu',
          passwordHash: 'dummyhash',
          role: 'student',
          status: 'active',
        });
      }
      student2Doc = await Student.findOne({ email: student2User.email });
      if (!student2Doc) {
        student2Doc = await Student.create({
          name: 'Student Diya',
          email: student2User.email,
          studentId: 'CS21B002',
          department: dept._id,
          semester: 4,
          enrollmentYear: 2022,
          status: 'Active',
        });
      }

      // Generate JWT tokens
      adminToken = jwt.sign({ sub: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      studentToken = jwt.sign({ sub: studentUser._id, role: studentUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      student2Token = jwt.sign({ sub: student2User._id, role: student2User.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      facultyToken = jwt.sign({ sub: facultyUser._id, role: facultyUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      parentToken = jwt.sign({ sub: parentUser._id, role: parentUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      placementToken = jwt.sign({ sub: placementUser._id, role: placementUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      staffToken = jwt.sign({ sub: staffUser._id, role: staffUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }
  });

  after(async () => {
    if (dbConnected) {
      // Clean up test notifications
      await Notification.deleteMany({ title: /\[TEST\]/ });
      await User.deleteOne({ email: 'student2.test@campusverse.edu' });
      await Student.deleteOne({ email: 'student2.test@campusverse.edu' });
      await disconnectDB();
    }
  });

  beforeEach(async () => {
    if (dbConnected) {
      await Notification.deleteMany({ title: /\[TEST\]/ });
    }
  });

  describe('1. 48-Hour Automatic Expiration & Server-Side Deletion', () => {
    it('Should set expiresAt to precisely 48 hours after creation when notification is created', async () => {
      if (!dbConnected) return;

      const notif = await Notification.create({
        recipientUser: studentUser._id,
        recipient: studentDoc._id,
        title: '[TEST] Placement Drive Alert',
        message: 'Google is conducting an on-campus placement drive.',
        category: 'Placement',
      });

      assert.ok(notif.expiresAt, 'expiresAt must be defined');
      const expectedExpiry = new Date(notif.createdAt.getTime() + 48 * 60 * 60 * 1000).getTime();
      assert.ok(
        Math.abs(notif.expiresAt.getTime() - expectedExpiry) < 5000,
        'expiresAt must be ~48 hours after createdAt'
      );
    });

    it('Should automatically delete notifications older than 48 hours via cleanExpiredNotifications()', async () => {
      if (!dbConnected) return;

      const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000);
      const expiredNotif = await Notification.create({
        recipientUser: studentUser._id,
        title: '[TEST] Expired Alert 50h Old',
        message: 'This notification was created 50 hours ago.',
        createdAt: fiftyHoursAgo,
        expiresAt: new Date(fiftyHoursAgo.getTime() + 48 * 60 * 60 * 1000),
      });

      const freshNotif = await Notification.create({
        recipientUser: studentUser._id,
        title: '[TEST] Fresh Alert 2h Old',
        message: 'This notification was created 2 hours ago.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 46 * 60 * 60 * 1000),
      });

      // Run automatic cleanup
      const { deletedCount } = await cleanExpiredNotifications();
      assert.ok(deletedCount >= 1, 'Should have deleted at least the expired notification');

      // Verify DB state: expired is permanently deleted, fresh remains
      const foundExpired = await Notification.findById(expiredNotif._id);
      const foundFresh = await Notification.findById(freshNotif._id);
      assert.equal(foundExpired, null, 'Expired notification must be deleted from database');
      assert.ok(foundFresh, 'Fresh notification must still exist');
    });

    it('GET /api/notifications should never return notifications older than 48 hours even before cleanup runs', async () => {
      if (!dbConnected) return;

      const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000);
      await Notification.create({
        recipientUser: studentUser._id,
        recipient: studentDoc._id,
        title: '[TEST] Stale Alert Bypassing Cleanup',
        message: 'Stale alert',
        createdAt: fiftyHoursAgo,
        expiresAt: new Date(fiftyHoursAgo.getTime() + 48 * 60 * 60 * 1000),
      });

      await Notification.create({
        recipientUser: studentUser._id,
        recipient: studentDoc._id,
        title: '[TEST] Active Valid Alert',
        message: 'Valid alert',
        createdAt: new Date(),
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const titles = res.body.data.map((n) => n.title);
      assert.ok(titles.includes('[TEST] Active Valid Alert'));
      assert.ok(!titles.includes('[TEST] Stale Alert Bypassing Cleanup'), 'Expired alerts must not be returned');
    });

    it('backfillExistingNotifications() should purge existing notifications older than 48 hours and backfill expiresAt for unexpired ones', async () => {
      if (!dbConnected) return;

      const sixtyHoursAgo = new Date(Date.now() - 60 * 60 * 60 * 1000);
      const legacyExpired = new Notification({
        recipientUser: studentUser._id,
        title: '[TEST] Legacy 60h Old',
        message: 'No expiresAt set initially',
        createdAt: sixtyHoursAgo,
      });
      // Bypass mongoose pre-save default to simulate legacy document
      await Notification.collection.insertOne({
        recipientUser: studentUser._id,
        title: '[TEST] Legacy 60h Old Raw',
        message: 'Legacy doc without expiresAt',
        createdAt: sixtyHoursAgo,
      });

      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
      const legacyActive = await Notification.collection.insertOne({
        recipientUser: studentUser._id,
        title: '[TEST] Legacy 10h Old Raw',
        message: 'Legacy doc without expiresAt',
        createdAt: tenHoursAgo,
      });

      await backfillExistingNotifications();

      const foundOld = await Notification.findOne({ title: '[TEST] Legacy 60h Old Raw' });
      assert.equal(foundOld, null, 'Legacy notification > 48 hours must be purged');

      const foundActive = await Notification.findOne({ title: '[TEST] Legacy 10h Old Raw' });
      assert.ok(foundActive, 'Legacy active notification must be retained');
      assert.ok(foundActive.expiresAt, 'Legacy active notification must have expiresAt set');
    });
  });

  describe('2. Manual Single Notification Deletion (All Portals)', () => {
    it('DELETE /api/notifications/:id should permanently delete a notification from the database', async () => {
      if (!dbConnected) return;

      const notif = await Notification.create({
        recipientUser: studentUser._id,
        title: '[TEST] Single Delete Test',
        message: 'Will be deleted manually',
      });

      const res = await request(app)
        .delete(`/api/notifications/${notif._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, notif._id.toString());

      // Ensure actually deleted from DB, not merely hidden
      const checkDb = await Notification.findById(notif._id);
      assert.equal(checkDb, null, 'Notification must be permanently deleted from database');
    });

    it('DELETE /api/notifications/:id should return 404 when notification does not exist or already deleted', async () => {
      if (!dbConnected) return;

      const fakeId = new Notification()._id;
      const res = await request(app)
        .delete(`/api/notifications/${fakeId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('Faculty should be able to delete their own notification via DELETE /api/notifications/:id and legacy /api/faculty/notifications/:id', async () => {
      if (!dbConnected) return;

      const fNotif1 = await Notification.create({
        recipientUser: facultyUser._id,
        title: '[TEST] Faculty Notification 1',
        message: 'Assignment submitted by student',
      });

      const fNotif2 = await Notification.create({
        recipientUser: facultyUser._id,
        title: '[TEST] Faculty Notification 2',
        message: 'Department meeting notice',
      });

      // 1. Unified endpoint
      const res1 = await request(app)
        .delete(`/api/notifications/${fNotif1._id}`)
        .set('Authorization', `Bearer ${facultyToken}`);
      assert.equal(res1.status, 200);
      assert.equal(await Notification.findById(fNotif1._id), null);

      // 2. Legacy faculty endpoint
      const res2 = await request(app)
        .delete(`/api/faculty/notifications/${fNotif2._id}`)
        .set('Authorization', `Bearer ${facultyToken}`);
      assert.equal(res2.status, 200);
      assert.equal(await Notification.findById(fNotif2._id), null);
    });

    it('Student should be able to delete their own notification via legacy /api/students/notifications/:id', async () => {
      if (!dbConnected) return;

      const sNotif = await Notification.create({
        recipientUser: studentUser._id,
        recipient: studentDoc._id,
        title: '[TEST] Student Legacy Route Delete',
        message: 'Legacy student delete test',
      });

      const res = await request(app)
        .delete(`/api/students/notifications/${sNotif._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(await Notification.findById(sNotif._id), null);
    });
  });

  describe('3. "Clear All" Notifications Option (All Portals)', () => {
    it('DELETE /api/notifications/clear-all should delete all notifications belonging to the current user', async () => {
      if (!dbConnected) return;

      // Seed 3 notifications for student
      await Notification.create([
        { recipientUser: studentUser._id, recipient: studentDoc._id, title: '[TEST] Alert 1', message: 'M1' },
        { recipientUser: studentUser._id, recipient: studentDoc._id, title: '[TEST] Alert 2', message: 'M2' },
        { recipientUser: studentUser._id, recipient: studentDoc._id, title: '[TEST] Alert 3', message: 'M3' },
      ]);

      const res = await request(app)
        .delete('/api/notifications/clear-all')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.deletedCount >= 3);

      // Check DB
      const remaining = await Notification.find({
        $or: [{ recipientUser: studentUser._id }, { recipient: studentDoc._id }],
      });
      assert.equal(remaining.length, 0, 'All student notifications must be deleted');
    });

    it('Faculty clear-all via legacy /api/faculty/notifications/clear-all should purge only faculty notifications', async () => {
      if (!dbConnected) return;

      await Notification.create([
        { recipientUser: facultyUser._id, title: '[TEST] Fac 1', message: 'F1' },
        { recipientUser: facultyUser._id, title: '[TEST] Fac 2', message: 'F2' },
      ]);

      const res = await request(app)
        .delete('/api/faculty/notifications/clear-all')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.deletedCount >= 2);

      const remaining = await Notification.find({ recipientUser: facultyUser._id });
      assert.equal(remaining.length, 0);
    });
  });

  describe('4. Strict User-Specific Isolation & Security Across All Portals', () => {
    it('User A (Student 1) CANNOT delete User B (Student 2) notification', async () => {
      if (!dbConnected) return;

      const student2Notif = await Notification.create({
        recipientUser: student2User._id,
        recipient: student2Doc._id,
        title: '[TEST] Private Diya Notification',
        message: 'Confidential fee receipt',
      });

      // Student 1 attempts to delete Student 2's notification
      const res = await request(app)
        .delete(`/api/notifications/${student2Notif._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 404, 'Must return 404 / denied when attempting to delete another user notification');

      // Verify the notification was NOT deleted from DB
      const stillExists = await Notification.findById(student2Notif._id);
      assert.ok(stillExists, 'Target notification must NOT be deleted');
    });

    it('Admin cannot accidentally delete student notifications when clearing their own notifications', async () => {
      if (!dbConnected) return;

      // Create admin notification
      const adminNotif = await Notification.create({
        recipientUser: adminUser._id,
        title: '[TEST] Admin System Audit Alert',
        message: 'System audit report ready',
      });

      // Create student notification
      const studentNotif = await Notification.create({
        recipientUser: studentUser._id,
        recipient: studentDoc._id,
        title: '[TEST] Student Placement Notice',
        message: 'Student placement notice',
      });

      // Admin clears all their notifications
      const res = await request(app)
        .delete('/api/notifications/clear-all')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);

      // Verify Admin notification is deleted, but Student notification is completely untouched
      assert.equal(await Notification.findById(adminNotif._id), null);
      const studentNotifStillExists = await Notification.findById(studentNotif._id);
      assert.ok(studentNotifStillExists, "Student's notification must not be affected by Admin clear-all");
    });

    it('Parent, Placement Officer, and Hostel Staff can manage notifications on their respective portals', async () => {
      if (!dbConnected) return;

      // 1. Parent
      const parentNotif = await Notification.create({
        recipientUser: parentUser._id,
        title: '[TEST] Ward Attendance Alert',
        message: 'Ward attendance is above 90%',
      });
      const pRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${parentToken}`);
      assert.equal(pRes.status, 200);
      assert.ok(pRes.body.data.some((n) => n._id.toString() === parentNotif._id.toString()));

      // 2. Placement Officer
      const placementNotif = await Notification.create({
        recipientUser: placementUser._id,
        title: '[TEST] New Drive Application Submissions',
        message: '50 students applied for Infosys',
      });
      const plRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${placementToken}`);
      assert.equal(plRes.status, 200);
      assert.ok(plRes.body.data.some((n) => n._id.toString() === placementNotif._id.toString()));

      // 3. Hostel Staff
      const staffNotif = await Notification.create({
        recipientUser: staffUser._id,
        title: '[TEST] Hostel Room Maintenance Request',
        message: 'Block B room 204 electrical fix requested',
      });
      const stRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${staffToken}`);
      assert.equal(stRes.status, 200);
      assert.ok(stRes.body.data.some((n) => n._id.toString() === staffNotif._id.toString()));

      // Delete staff notification
      const delStaffRes = await request(app)
        .delete(`/api/notifications/${staffNotif._id}`)
        .set('Authorization', `Bearer ${staffToken}`);
      assert.equal(delStaffRes.status, 200);
      assert.equal(await Notification.findById(staffNotif._id), null);
    });
  });

  describe('5. Mark as Read and Mark All as Read Consistency', () => {
    it('PATCH /api/notifications/:id/read should mark notification as read', async () => {
      if (!dbConnected) return;

      const notif = await Notification.create({
        recipientUser: studentUser._id,
        recipient: studentDoc._id,
        title: '[TEST] Unread Notice',
        message: 'Please check your schedule',
        read: false,
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.read, true);
      assert.ok(res.body.data.readAt);
    });

    it('PATCH /api/notifications/read-all should mark all user notifications as read', async () => {
      if (!dbConnected) return;

      await Notification.create([
        { recipientUser: studentUser._id, recipient: studentDoc._id, title: '[TEST] Unread 1', message: 'M1', read: false },
        { recipientUser: studentUser._id, recipient: studentDoc._id, title: '[TEST] Unread 2', message: 'M2', read: false },
      ]);

      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      const unreadCount = await Notification.countDocuments({
        $or: [{ recipientUser: studentUser._id }, { recipient: studentDoc._id }],
        read: false,
      });
      assert.equal(unreadCount, 0, 'Unread count should be 0');
    });
  });
});
