const Notification = require('../models/Notification');

/**
 * Service to manage automatic 48-hour expiration and background deletion of notifications.
 * Works alongside MongoDB TTL indexes to ensure reliable deletion even if MongoDB background
 * thread has not executed yet, and gracefully handles legacy/existing notifications.
 */

const EXPIRATION_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

let cleanupTimer = null;

/**
 * Cleans up all expired notifications from MongoDB.
 * A notification is expired if:
 * 1. its `expiresAt` date has passed (<= now)
 * 2. OR its `createdAt` date is older than 48 hours
 *
 * @returns {Promise<{ deletedCount: number }>}
 */
const cleanExpiredNotifications = async () => {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - EXPIRATION_WINDOW_MS);

    const deleteFilter = {
      $or: [
        { expiresAt: { $lte: now } },
        { createdAt: { $lte: cutoffDate } },
      ],
    };

    const result = await Notification.deleteMany(deleteFilter);
    if (result.deletedCount > 0) {
      console.log(`[Notification Cleanup] Auto-deleted ${result.deletedCount} expired notification(s) older than 48 hours.`);
    }
    return { success: true, deletedCount: result.deletedCount };
  } catch (err) {
    console.error('[Notification Cleanup Error]:', err.message);
    return { success: false, deletedCount: 0, error: err.message };
  }
};

/**
 * Ensures existing notifications in the database have their expiresAt field set properly,
 * or immediately removes them if they are already older than 48 hours.
 */
const backfillExistingNotifications = async () => {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - EXPIRATION_WINDOW_MS);

    // 1. Immediately delete any existing notifications created more than 48 hours ago
    const deleteOldResult = await Notification.deleteMany({
      createdAt: { $lte: cutoffDate },
    });
    if (deleteOldResult.deletedCount > 0) {
      console.log(`[Notification Cleanup] Purged ${deleteOldResult.deletedCount} existing notification(s) older than 48 hours.`);
    }

    // 2. For notifications without expiresAt, calculate and set expiresAt = createdAt + 48 hours
    const updateResult = await Notification.updateMany(
      { expiresAt: { $exists: false } },
      [
        {
          $set: {
            expiresAt: {
              $add: [{ $ifNull: ['$createdAt', now] }, EXPIRATION_WINDOW_MS],
            },
          },
        },
      ]
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`[Notification Cleanup] Backfilled expiration timestamp for ${updateResult.modifiedCount} existing notification(s).`);
    }

    return {
      deletedOldCount: deleteOldResult.deletedCount,
      backfilledCount: updateResult.modifiedCount,
    };
  } catch (err) {
    console.error('[Notification Backfill Error]:', err.message);
    return { error: err.message };
  }
};

/**
 * Starts the periodic background cleanup job.
 * @param {number} intervalMs - Interval between cleanup runs (defaults to 10 minutes)
 */
const startCleanupJob = (intervalMs = 10 * 60 * 1000) => {
  if (cleanupTimer) return;

  // Run immediately on initiation
  backfillExistingNotifications().catch(() => {});

  cleanupTimer = setInterval(async () => {
    await cleanExpiredNotifications();
  }, intervalMs);

  // unref prevents the interval from holding Node process open during graceful shutdown or tests
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  console.log(`[Notification Cleanup] Background 48-hour auto-delete scheduler started (interval: ${intervalMs / 1000}s).`);
};

/**
 * Stops the periodic background cleanup job.
 */
const stopCleanupJob = () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    console.log('[Notification Cleanup] Background auto-delete scheduler stopped.');
  }
};

module.exports = {
  EXPIRATION_WINDOW_MS,
  cleanExpiredNotifications,
  backfillExistingNotifications,
  startCleanupJob,
  stopCleanupJob,
};
