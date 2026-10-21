const AuditLog = require('../models/AuditLog');

/**
 * Record an audit log event in MongoDB safely.
 * Never stores raw passwords or secrets.
 */
async function recordAuditLog({ action, req, actor, targetUser, details }) {
  try {
    const act = actor || (req?.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    } : {
      name: 'System',
      role: 'system',
    });

    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    await AuditLog.create({
      action,
      actor: act,
      targetUser: targetUser ? {
        id: targetUser._id || targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      } : undefined,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      ipAddress: String(ipAddress).slice(0, 50),
      userAgent: String(userAgent).slice(0, 200),
    });
  } catch (err) {
    // Audit logging failure should not crash the main operation
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
}

module.exports = {
  recordAuditLog,
};
