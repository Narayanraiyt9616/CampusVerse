/**
 * Middleware restricting mutation operations (POST, PATCH, DELETE)
 * to development environment until Part 3 authentication and RBAC are implemented.
 */
const devOnlyMiddleware = (req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_WRITES === 'true';

  if (!isDev) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'OPERATION_RESTRICTED',
        message: 'Write operations are restricted in production environment until Part 3 authentication and role-based access control are active.',
      },
    });
  }

  next();
};

module.exports = devOnlyMiddleware;
