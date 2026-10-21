const express = require('express');
const {
  getSystemHealth,
  getAuditLogs,
  listUsers,
  updateUserStatus,
} = require('../controllers/superAdminController');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes in this router require superadmin database role
router.use(authorizeRoles('superadmin'));

router.get('/health', getSystemHealth);
router.get('/audit-logs', getAuditLogs);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
