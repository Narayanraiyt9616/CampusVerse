const { getDBStatus } = require('../config/db');

/**
 * Health Check Controller
 * Returns server operational status and real database connection telemetry.
 */
const getHealth = (req, res) => {
  const dbStatus = getDBStatus();
  const isDBConnected = dbStatus.status === 'connected';

  const healthPayload = {
    success: isDBConnected,
    application: 'CampusVerse AI - Intelligent University Management Ecosystem',
    server: {
      status: 'operational',
      uptimeSeconds: Math.floor(process.uptime()),
    },
    database: {
      status: dbStatus.status,
      name: dbStatus.name || 'unassigned',
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  };

  // If database is not connected, return 503 Service Unavailable with degraded status
  if (!isDBConnected) {
    return res.status(503).json({
      ...healthPayload,
      status: 'degraded',
      message: 'Server is running, but MongoDB connection is currently offline or unconfigured.',
    });
  }

  return res.status(200).json({
    ...healthPayload,
    status: 'healthy',
    message: 'All core backend services and database connections are operational.',
  });
};

module.exports = {
  getHealth,
};
