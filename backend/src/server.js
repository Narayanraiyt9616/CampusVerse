require('dotenv').config();
const createApp = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { initializeAccounts } = require('./config/initAdmin');
const { startCleanupJob, stopCleanupJob } = require('./services/notificationCleanupService');
const { startClassReminderJob, stopClassReminderJob } = require('./services/onlineClassNotificationService');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const app = createApp();

let server;

/**
 * Start the HTTP server and initialize database connection
 */
const startServer = async () => {
  // Attempt Database Connection
  const conn = await connectDB();
  if (conn && conn.success) {
    await initializeAccounts();
    startCleanupJob();
    startClassReminderJob();
  }

  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` CampusVerse AI - Backend Server (Part 2 Active)       `);
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(` Listening on: http://localhost:${PORT}                `);
    console.log(` API Gateway : http://localhost:${PORT}/api            `);
    console.log(` Health Check: http://localhost:${PORT}/api/health     `);
    console.log(`=======================================================`);
  });

  // Handle port conflict explicitly
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Fatal] Port ${PORT} is already in use by another process.`);
      console.error(`Please terminate the conflicting process or specify a different port in backend/.env (e.g. PORT=5001).`);
      process.exit(1);
    } else {
      console.error(`[Fatal] Server failed to start:`, err.message);
      process.exit(1);
    }
  });
};

/**
 * Graceful shutdown handlers
 */
const shutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    stopCleanupJob();
    stopClassReminderJob();
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      console.log('[Server] Graceful shutdown complete. Exiting process.');
      process.exit(0);
    });

    // Force exit after 10s if graceful closure stalls
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

module.exports = server;
