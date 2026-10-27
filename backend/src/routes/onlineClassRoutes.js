const express = require('express');
const router = express.Router();
const onlineClassController = require('../controllers/onlineClassController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Require authentication for all online class operations
router.use(auth);

// Reminder sweep endpoint (must be before :id routes)
router.post(
  '/reminders/sweep',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.triggerRemindersSweep
);

// Saved Meeting Links endpoints (must be before :id routes)
router.get(
  '/saved-links',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.getSavedMeetingLinks
);
router.post(
  '/saved-links',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.createSavedMeetingLink
);
router.put(
  '/saved-links/:id',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.updateSavedMeetingLink
);
router.delete(
  '/saved-links/:id',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.deleteSavedMeetingLink
);

// List classes – scoped by role in controller
router.get(
  '/',
  authorize('faculty', 'student', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.getOnlineClasses
);

// Faculty or Admin can create a new online class
router.post(
  '/',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.createOnlineClass
);

// Class details by ID
router.get(
  '/:id',
  authorize('faculty', 'student', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.getOnlineClassById
);

// Update/reschedule an online class (creator faculty or admin)
router.put(
  '/:id',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.updateOnlineClass
);

// Cancel an online class with reason
router.patch(
  '/:id/cancel',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.cancelOnlineClass
);

// Post an announcement to enrolled students
router.post(
  '/:id/announcements',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.addAnnouncement
);

// Delete an online class
router.delete(
  '/:id',
  authorize('faculty', 'admin', 'superadmin', 'super_admin'),
  onlineClassController.deleteOnlineClass
);

module.exports = router;
