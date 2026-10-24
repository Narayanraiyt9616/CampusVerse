const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// All notification endpoints are user-authenticated (handled via authMiddleware in app.js)
// 1. Fetch user notifications
router.get('/', notificationController.getNotifications);

// 2. Mark all as read
router.patch('/read-all', notificationController.markAllRead);

// 3. Mark single notification as read
router.patch('/:id/read', notificationController.markNotificationRead);

// 4. Clear all notifications permanently
router.delete('/clear-all', notificationController.clearAllNotifications);

// 5. Delete single notification permanently
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
