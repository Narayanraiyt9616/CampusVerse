/**
 * 404 Not Found Middleware for unknown routes
 */
const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist on this server.`,
    },
  });
};

module.exports = notFoundMiddleware;
