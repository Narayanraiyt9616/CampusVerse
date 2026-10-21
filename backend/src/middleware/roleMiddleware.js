// middleware/roleMiddleware.js
/**
 * Role-based access control middleware.
 * Usage: router.get('/protected', authMiddleware, authorizeRoles('admin', 'superadmin'), handler);
 */
const normalizeRole = (r) => {
  if (!r) return '';
  const s = String(r).toLowerCase().trim();
  if (s === 'super-admin' || s === 'super_admin') return 'superadmin';
  if (s === 'placement_officer' || s === 'placement-officer') return 'placement';
  return s;
};

const createAuthorizeRoles = (...allowedRoles) => {
  const normalized = allowedRoles.map(normalizeRole);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }
    const userRole = normalizeRole(req.user.role);
    if (normalized.includes(userRole)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Insufficient permissions for this resource.',
      requiredRoles: allowedRoles,
      userRole: req.user.role,
    });
  };
};

module.exports = createAuthorizeRoles;
