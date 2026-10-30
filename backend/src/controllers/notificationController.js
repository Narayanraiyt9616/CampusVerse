const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { EXPIRATION_WINDOW_MS } = require('../services/notificationCleanupService');

/**
 * Builds user-specific recipient filter to guarantee strict isolation.
 * Users can only access and delete notifications belonging to their own account.
 * Admins cannot accidentally access or delete another user's notifications.
 */
const getUserRecipientQuery = async (user) => {
  if (!user || !user._id) return { _id: null }; // Match nothing if unauthenticated

  if (user.role === 'student') {
    let student = await Student.findOne({
      $or: [
        { email: user.email },
        { studentId: (user.username || '').toUpperCase() },
      ],
    });

    if (!student && user.metadata?.studentId) {
      student = await Student.findOne({ studentId: user.metadata.studentId });
    }

    const conditions = [{ recipientUser: user._id }];
    if (student) {
      conditions.push({ recipient: student._id });
      if (student.studentId) {
        conditions.push({ studentId: student.studentId });
      }
    }
    return { $or: conditions };
  }

  // For faculty, admin, superadmin, parent, placement, hostel, staff
  return { recipientUser: user._id };
};

/**
 * Returns a filter query that strictly excludes any notification older than 48 hours
 */
const getNotExpiredFilter = () => {
  const cutoff = new Date(Date.now() - EXPIRATION_WINDOW_MS);
  const now = new Date();
  return {
    createdAt: { $gt: cutoff },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } },
    ],
  };
};

/**
 * GET /api/notifications
 * Retrieves all valid notifications for the current authenticated user across any portal.
 */
const getNotifications = async (req, res) => {
  try {
    const userQuery = await getUserRecipientQuery(req.user);
    const notExpiredFilter = getNotExpiredFilter();

    const query = {
      $and: [userQuery, notExpiredFilter],
    };

    if (req.query.unreadOnly === 'true') {
      query.read = false;
    }

    const limit = parseInt(req.query.limit, 10) || 50;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const [notifications, unreadCount, totalCount] = await Promise.all([
      Notification.find(query)
        .populate('drive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({
        $and: [userQuery, notExpiredFilter, { read: false }],
      }),
      Notification.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      totalCount,
      unreadCount,
      notifications,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications.',
      details: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read (scoped to current user)
 */
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid notification ID format.' });
    }

    const userQuery = await getUserRecipientQuery(req.user);
    const notExpiredFilter = getNotExpiredFilter();

    const notif = await Notification.findOneAndUpdate(
      {
        _id: id,
        $and: [userQuery, notExpiredFilter],
      },
      {
        $set: { read: true, readAt: new Date() },
      },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found, expired, or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      notification: notif,
      data: notif,
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update notification.',
      details: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all active notifications for the current user as read
 */
const markAllRead = async (req, res) => {
  try {
    const userQuery = await getUserRecipientQuery(req.user);
    const notExpiredFilter = getNotExpiredFilter();

    const result = await Notification.updateMany(
      {
        $and: [userQuery, notExpiredFilter, { read: false }],
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read.',
      details: error.message,
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Permanently deletes a single notification from the database.
 * Strict ownership check ensures a user can only delete their own notification.
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid notification ID format.' });
    }

    const userQuery = await getUserRecipientQuery(req.user);

    // Find and permanently delete document belonging to this user
    const deleted = await Notification.findOneAndDelete({
      _id: id,
      ...userQuery,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or you do not have permission to delete it.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted permanently.',
      data: {
        id: deleted._id,
      },
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete notification.',
      details: error.message,
    });
  }
};

/**
 * DELETE /api/notifications/clear-all
 * Permanently clears all notifications for the current authenticated user from MongoDB.
 * Confirmation is enforced on the frontend before calling this endpoint.
 */
const clearAllNotifications = async (req, res) => {
  try {
    const userQuery = await getUserRecipientQuery(req.user);

    // Permanently remove all notifications belonging to current user from DB
    const result = await Notification.deleteMany(userQuery);

    return res.status(200).json({
      success: true,
      message: `Successfully deleted all (${result.deletedCount}) notifications.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear notifications.',
      details: error.message,
    });
  }
};

module.exports = {
  getUserRecipientQuery,
  getNotExpiredFilter,
  getNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
};
