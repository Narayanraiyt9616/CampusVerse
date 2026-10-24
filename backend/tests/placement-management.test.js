require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createApp = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { initializeAccounts } = require('../src/config/initAdmin');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Department = require('../src/models/Department');
const PlacementDrive = require('../src/models/PlacementDrive');
const PlacementApplication = require('../src/models/PlacementApplication');
const PlacementProfile = require('../src/models/PlacementProfile');
const Notification = require('../src/models/Notification');
const { computeDeadlineStatus, formatDriveWithDeadline } = require('../src/controllers/placementController');
const bcrypt = require('bcryptjs');

const app = createApp();

describe('Placement Management Enhancement Suite (Deadlines, Applications, Workflow)', () => {
  let dbConnected = false;
  let placementToken = '';
  let studentToken = '';
  let studentUser = null;
  let studentRecord = null;
  let department = null;

  let openDriveId = '';
  let closingSoonDriveId = '';
  let expiredDriveId = '';
  let cancelDriveId = '';
  let createdApplicationId = '';

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (!dbConnected) return;

    await initializeAccounts();

    // 1. Placement Admin Auth
    let placementUser = await User.findOne({ role: 'placement' });
    if (!placementUser) {
      placementUser = await User.create({
        username: 'placement_test_admin',
        name: 'Placement Officer',
        email: 'placement_test@campusverse.edu',
        passwordHash: await bcrypt.hash('TestPlacement@123', 10),
        role: 'placement',
        status: 'active',
      });
    }
    placementToken = jwt.sign(
      { sub: placementUser._id, role: 'placement', email: placementUser.email, username: placementUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 2. Department
    department = await Department.findOne({
      $or: [{ code: 'CSE' }, { name: 'Computer Science & Engineering' }],
    });
    if (!department) {
      department = await Department.create({
        name: 'Computer Science & Engineering',
        code: 'CSE',
      });
    }

    // 3. Test Student
    const passwordHash = await bcrypt.hash('TestStudent@123', 10);
    studentUser = await User.findOneAndUpdate(
      { username: 'test_placement_student_1' },
      {
        name: 'John Doe Candidate',
        username: 'test_placement_student_1',
        email: 'john_candidate@campusverse.edu',
        passwordHash,
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    studentRecord = await Student.findOneAndUpdate(
      { studentId: 'CV-PTEST-001' },
      {
        studentId: 'CV-PTEST-001',
        name: 'John Doe Candidate',
        email: 'john_candidate@campusverse.edu',
        user: studentUser._id,
        department: department._id,
        course: 'Computer Science & Engineering',
        semester: 8,
        cgpa: 8.5,
        status: 'active',
      },
      { upsert: true, new: true }
    );

    await PlacementProfile.findOneAndUpdate(
      { student: studentRecord._id },
      {
        student: studentRecord._id,
        cgpa: 8.5,
        department: 'Computer Science & Engineering',
        branch: 'CSE',
        resumeUrl: 'https://example.com/resumes/john.pdf',
        placementStatus: 'Not Placed',
      },
      { upsert: true, new: true }
    );

    // 4. Student Auth
    studentToken = jwt.sign(
      { sub: studentUser._id, role: 'student', email: studentUser.email, username: studentUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Clean up any test drives / applications previously created
    await PlacementDrive.deleteMany({ companyName: { $regex: /^TEST_/ } });
    await PlacementApplication.deleteMany({ student: studentRecord._id });
  });

  after(async () => {
    if (!dbConnected) return;
    try {
      await PlacementDrive.deleteMany({ companyName: { $regex: /^TEST_/ } });
      await PlacementApplication.deleteMany({ student: studentRecord._id });
      await disconnectDB();
    } catch {}
  });

  describe('0. Unit Test: Deadline Calculation & Schema Contract Validation', () => {
    it('computeDeadlineStatus returns "Open" for drives with future deadline > 48h', () => {
      const drive = {
        applicationDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
        status: 'Active',
      };
      assert.equal(computeDeadlineStatus(drive), 'Open');
    });

    it('computeDeadlineStatus returns "Closing Soon" for deadline <= 48h', () => {
      const drive = {
        applicationDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000),
        status: 'Active',
      };
      assert.equal(computeDeadlineStatus(drive), 'Closing Soon');
    });

    it('computeDeadlineStatus returns "Deadline Expired" for past deadline', () => {
      const drive = {
        applicationDeadline: new Date(Date.now() - 5 * 60 * 1000),
        status: 'Active',
      };
      assert.equal(computeDeadlineStatus(drive), 'Deadline Expired');
    });

    it('computeDeadlineStatus returns "Applications Closed" if drive is cancelled or closed', () => {
      const cancelledDrive = {
        applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Cancelled',
      };
      assert.equal(computeDeadlineStatus(cancelledDrive), 'Applications Closed');

      const closedDrive = {
        applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Applications Closed',
      };
      assert.equal(computeDeadlineStatus(closedDrive), 'Applications Closed');
    });

    it('formatDriveWithDeadline properly enriches drive object with deadlineStatus', () => {
      const driveObj = {
        companyName: 'Acme Corp',
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'Active',
      };
      const formatted = formatDriveWithDeadline(driveObj);
      assert.equal(formatted.deadlineStatus, 'Open');
      assert.equal(formatted.companyName, 'Acme Corp');
    });

    it('PlacementDrive schema defines cancellationReason and updated status enums', () => {
      const schemaPaths = PlacementDrive.schema.paths;
      assert.ok(schemaPaths.cancellationReason, 'PlacementDrive must have cancellationReason');
      assert.ok(schemaPaths['status'].enumValues.includes('Applications Closed'));
      assert.ok(schemaPaths['status'].enumValues.includes('Cancelled'));
    });

    it('PlacementApplication schema defines rejectionReason, githubLink, portfolioLink, and full status enums', () => {
      const schemaPaths = PlacementApplication.schema.paths;
      assert.ok(schemaPaths.rejectionReason, 'PlacementApplication must have rejectionReason');
      assert.ok(schemaPaths.githubLink, 'PlacementApplication must have githubLink');
      assert.ok(schemaPaths.portfolioLink, 'PlacementApplication must have portfolioLink');
      assert.ok(schemaPaths.liveProjectLink, 'PlacementApplication must have liveProjectLink');
      assert.ok(schemaPaths.coverNote, 'PlacementApplication must have coverNote');
      assert.ok(schemaPaths['interviewSchedule.instructions'], 'interviewSchedule must support instructions');

      const statusEnum = schemaPaths.status.enumValues;
      assert.ok(statusEnum.includes('Applied'));
      assert.ok(statusEnum.includes('Under Review'));
      assert.ok(statusEnum.includes('Shortlisted'));
      assert.ok(statusEnum.includes('Accepted'));
      assert.ok(statusEnum.includes('Interview Scheduled'));
      assert.ok(statusEnum.includes('Selected'));
      assert.ok(statusEnum.includes('Rejected'));
      assert.ok(statusEnum.includes('Not Selected'));
    });
  });

  describe('1. Company Deadline Detection & Management', () => {
    it('Placement Admin can create a drive with a future deadline (> 48h) returning "Open"', async () => {
      if (!dbConnected) return;

      const futureDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const driveDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/placement/drives')
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          companyName: 'TEST_Google_Cloud',
          jobTitle: 'Cloud Engineer',
          jobField: 'Cloud / DevOps',
          applicationDeadline: futureDeadline,
          driveDate,
          venue: 'Campus Tech Hall A',
          eligibleCourses: ['Computer Science & Engineering'],
          eligibilityCriteria: { minCgpa: 7.0, maxBacklogs: 0 },
          salaryPackage: { displayPackage: '18 LPA' },
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.drive._id);
      openDriveId = res.body.drive._id;
      assert.equal(res.body.drive.deadlineStatus, 'Open');
    });

    it('Company approaching its deadline within 48h returns "Closing Soon"', async () => {
      if (!dbConnected) return;

      // 24 hours from now
      const closingSoonDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const driveDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/placement/drives')
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          companyName: 'TEST_Microsoft_Azure',
          jobTitle: 'Systems Architect',
          jobField: 'Infrastructure',
          applicationDeadline: closingSoonDeadline,
          driveDate,
          venue: 'Virtual Teams Call',
          eligibleCourses: ['Computer Science & Engineering'],
          eligibilityCriteria: { minCgpa: 7.5, maxBacklogs: 0 },
        });

      assert.equal(res.status, 201);
      closingSoonDriveId = res.body.drive._id;
      assert.equal(res.body.drive.deadlineStatus, 'Closing Soon');
    });

    it('Company with past deadline returns "Deadline Expired"', async () => {
      if (!dbConnected) return;

      // 2 days ago
      const pastDeadline = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const pastDriveDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/placement/drives')
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          companyName: 'TEST_Oracle_Expired',
          jobTitle: 'Database Admin',
          jobField: 'Databases',
          applicationDeadline: pastDeadline,
          driveDate: pastDriveDate,
          venue: 'Old Auditorium',
          eligibleCourses: ['Computer Science & Engineering'],
          eligibilityCriteria: { minCgpa: 6.5, maxBacklogs: 0 },
        });

      assert.equal(res.status, 201);
      expiredDriveId = res.body.drive._id;
      assert.equal(res.body.drive.deadlineStatus, 'Deadline Expired');
    });
  });

  describe('2. Backend Deadline Enforcement & Application Creation', () => {
    it('Blocks student application when deadline has expired with HTTP 400', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .post('/api/placement/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          driveId: expiredDriveId,
          resumeLink: 'https://example.com/resumes/john.pdf',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.deadlineExpired, true);
      assert.ok(res.body.error.includes('expired'));
    });

    it('Successfully accepts student application for an Open drive, storing GitHub and project links', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .post('/api/placement/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          driveId: openDriveId,
          resumeLink: 'https://example.com/resumes/john.pdf',
          githubLink: 'https://github.com/johndoe',
          portfolioLink: 'https://johndoe.dev',
          liveProjectLink: 'https://cloud-demo.johndoe.dev',
          coverNote: 'Eager to contribute to the cloud infrastructure team.',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.application._id);
      createdApplicationId = res.body.application._id;

      // Verify fields saved
      assert.equal(res.body.application.githubLink, 'https://github.com/johndoe');
      assert.equal(res.body.application.portfolioLink, 'https://johndoe.dev');
      assert.equal(res.body.application.liveProjectLink, 'https://cloud-demo.johndoe.dev');
      assert.equal(res.body.application.coverNote, 'Eager to contribute to the cloud infrastructure team.');
      assert.equal(res.body.application.status, 'Applied');
    });

    it('Blocks duplicate application to the same placement drive with HTTP 400', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .post('/api/placement/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          driveId: openDriveId,
          resumeLink: 'https://example.com/resumes/john.pdf',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.includes('already submitted') || res.body.error.includes('duplicate'));
    });
  });

  describe('3. Application Review Workflow & Status Synchronization', () => {
    it('Placement Admin can Shortlist an applicant and triggers notification', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .put(`/api/placement/applications/${createdApplicationId}`)
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          status: 'Shortlisted',
          currentRound: 'Technical Interview 1',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.application.status, 'Shortlisted');

      // Verify student received PLACEMENT_SHORTLISTED notification
      const notif = await Notification.findOne({
        user: studentUser._id,
        type: 'PLACEMENT_SHORTLISTED',
      });
      assert.ok(notif, 'Shortlist notification must exist for student');
    });

    it('Placement Admin can Accept an application (advancing to next round without marking placed)', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .put(`/api/placement/applications/${createdApplicationId}`)
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          status: 'Accepted',
          currentRound: 'Aptitude / Coding Round',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.application.status, 'Accepted');

      // Check student profile: must NOT be placed
      const profile = await PlacementProfile.findOne({ student: studentRecord._id });
      assert.equal(profile.placementStatus, 'Not Placed', 'Accepted must not mark student as Placed');

      // Verify notification
      const notif = await Notification.findOne({
        user: studentUser._id,
        type: 'PLACEMENT_ACCEPTED',
      });
      assert.ok(notif, 'Accepted notification must exist for student');
    });

    it('Placement Admin can Schedule an Interview with instructions', async () => {
      if (!dbConnected) return;

      const interviewDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .put(`/api/placement/applications/${createdApplicationId}`)
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          status: 'Interview Scheduled',
          interviewSchedule: {
            roundName: 'Technical Interview Round 1',
            date: interviewDate,
            time: '02:30 PM',
            venueOrLink: 'https://meet.google.com/xyz-cv-placement',
            instructions: 'Please bring 2 copies of your resume, laptop, and college ID card.',
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.application.status, 'Interview Scheduled');
      assert.equal(
        res.body.application.interviewSchedule.instructions,
        'Please bring 2 copies of your resume, laptop, and college ID card.'
      );

      // Verify interview notification
      const notif = await Notification.findOne({
        user: studentUser._id,
        type: 'PLACEMENT_INTERVIEW',
      });
      assert.ok(notif, 'Interview notification must exist');
      assert.ok(notif.message.includes('Please bring 2 copies'));
    });

    it('Placement Admin can Reject an application with a rejection reason', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .put(`/api/placement/applications/${createdApplicationId}`)
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          status: 'Rejected',
          rejectionReason: 'CGPA did not meet the updated corporate benchmark of 8.8.',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.application.status, 'Rejected');
      assert.equal(
        res.body.application.rejectionReason,
        'CGPA did not meet the updated corporate benchmark of 8.8.'
      );

      // Verify rejection notification
      const notif = await Notification.findOne({
        user: studentUser._id,
        type: 'PLACEMENT_REJECTED',
      });
      assert.ok(notif, 'Rejection notification must exist');
      assert.ok(notif.message.includes('Reason: CGPA did not meet'));
    });

    it('Placement Admin can Mark a candidate Selected (final offer) and updates PlacementProfile to Placed', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .put(`/api/placement/applications/${createdApplicationId}`)
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          status: 'Selected',
          offerDetails: {
            designation: 'Cloud Engineer Level 1',
            offeredCtc: '18 LPA',
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.application.status, 'Selected');

      // Check student profile: must NOW be marked 'Placed'
      const profile = await PlacementProfile.findOne({ student: studentRecord._id });
      assert.equal(profile.placementStatus, 'Placed', 'Selected must update profile to Placed');

      // Verify selection notification
      const notif = await Notification.findOne({
        user: studentUser._id,
        type: 'PLACEMENT_SELECTED',
      });
      assert.ok(notif, 'Selected notification must exist');
      assert.ok(notif.title.includes('Selected'));
    });
  });

  describe('4. Placement Drive Cancellation & Student Notification', () => {
    it('Placement Admin can cancel a drive with cancellationReason and notifies applicants', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .put(`/api/placement/drives/${openDriveId}`)
        .set('Authorization', `Bearer ${placementToken}`)
        .send({
          status: 'Cancelled',
          cancellationReason: 'The company has frozen hiring for this quarter due to corporate restructuring.',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.drive.status, 'Cancelled');
      assert.equal(
        res.body.drive.cancellationReason,
        'The company has frozen hiring for this quarter due to corporate restructuring.'
      );

      // Verify cancellation notification delivered to candidate
      const notif = await Notification.findOne({
        user: studentUser._id,
        type: 'PLACEMENT_CANCELLED',
      });
      assert.ok(notif, 'Drive cancellation notification must exist for applicant');
      assert.ok(notif.message.includes('frozen hiring'));
    });
  });

  describe('5. Student Portal My Applications Visibility', () => {
    it('Student can fetch their applications with complete deadline status and rejection/schedule details', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .get('/api/placement/my-applications')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.applications));
      assert.ok(res.body.applications.length >= 1);

      const appItem = res.body.applications.find(
        (a) => a._id.toString() === createdApplicationId.toString()
      );
      assert.ok(appItem, 'Submitted application must be present in My Applications');
      assert.ok(appItem.drive, 'Application must populate drive details');
      assert.ok(appItem.drive.deadlineStatus, 'Drive must include deadlineStatus');
      assert.equal(appItem.status, 'Selected');
    });

    it('Unauthorized user cannot update application outcomes', async () => {
      if (!dbConnected) return;

      const res = await request(app)
        .put(`/api/placement/applications/${createdApplicationId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          status: 'Accepted',
        });

      // Role authorization should prevent student from modifying applications
      assert.ok(res.status === 403 || res.status === 401, 'Student must not update applications');
    });
  });
});
