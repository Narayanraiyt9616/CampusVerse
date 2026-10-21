const mongoose = require('mongoose');

/**
 * CampusVerse AI - Central Database Connection Manager
 * Manages Mongoose connection lifecycle, state polling, and graceful teardown.
 */

// Connection state string mapping
const STATE_NAMES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Connect to MongoDB using the configured MONGODB_URI
 * @returns {Promise<{ success: boolean, status: string, error?: string }>}
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.warn('[Database] MONGODB_URI is not defined in environment variables. Running in disconnected database state.');
    return {
      success: false,
      status: 'disconnected',
      reason: 'MONGODB_URI_NOT_CONFIGURED',
    };
  }

  try {
    const conn = await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 15000, // Allow 15s for Atlas initial handshake
    });

    console.log(`[Database] MongoDB connected successfully to database "${conn.connection.name}"`);
    return {
      success: true,
      status: 'connected',
      database: conn.connection.name,
    };
  } catch (error) {
    console.error(`[Database] MongoDB connection failed: ${error.message}`);
    return {
      success: false,
      status: 'disconnected',
      error: error.message,
    };
  }
};

/**
 * Get current real-time database connection status
 * @returns {{ status: string, readyState: number, name: string | null }}
 */
const getDBStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    status: STATE_NAMES[stateCode] || 'unknown',
    readyState: stateCode,
    name: mongoose.connection.name || null,
  };
};

/**
 * Gracefully disconnect database (used during shutdown & testing)
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed.');
  }
};

module.exports = {
  connectDB,
  getDBStatus,
  disconnectDB,
};
