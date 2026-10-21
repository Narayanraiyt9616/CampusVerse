const User = require('../models/User');
const { getDBStatus } = require('../config/db');

/**
 * Super Admin Controller - Strictly restricted to 'superadmin' role
 */
exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = getDBStatus();
    const userCount = await User.countDocuments();
    const activeUserCount = await User.countDocuments({ status: 'active' });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      database: dbStatus,
      userTelemetry: {
        totalAccounts: userCount,
        activeAccounts: activeUserCount,
      },
      security: {
        rbacEnforced: true,
        jwtConfigured: !!process.env.JWT_SECRET,
        superAdminRestricted: true,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  // Demonstration security audit log stream
  return res.json({
    success: true,
    logs: [
      {
        id: 'LOG-001',
        event: 'AUTHENTICATION_GATEWAY_INITIALIZED',
        actor: req.user.email,
        role: req.user.role,
        severity: 'INFO',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'LOG-002',
        event: 'SUPERADMIN_PORTAL_SESSION_VERIFIED',
        actor: req.user.email,
        role: req.user.role,
        severity: 'SECURITY',
        timestamp: new Date().toISOString(),
      },
    ],
  });
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role status createdAt updatedAt').sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or disabled' });
    }
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    // Prevent disabling the superadmin themselves
    if (targetUser.role === 'superadmin' && String(targetUser._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, error: 'Cannot disable currently active superadmin account' });
    }
    targetUser.status = status;
    await targetUser.save();
    return res.json({ success: true, user: { id: targetUser._id, email: targetUser.email, status: targetUser.status } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
