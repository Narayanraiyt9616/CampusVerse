/**
 * Centralized Error Handling Middleware for CampusVerse AI Backend
 * Formats errors consistently, sanitizes internal messages, and suppresses stack traces in client responses.
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal server error occurred.';
  let details = err.details || null;

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_IDENTIFIER';
    message = `Invalid ${err.path || 'identifier'} format provided: "${err.value}".`;
    details = [{ path: err.path, value: err.value }];
  }

  // Handle Mongoose Schema ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Data validation failed.';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  }

  // Handle MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'record';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `A ${field} with value "${value}" already exists. Duplicate values are not permitted.`;
    details = [{ field, value }];
  }

  // Handle SyntaxError in request JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Malformed JSON request body received. Please verify JSON syntax.';
  }

  // Log server errors internally (only in non-test mode)
  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(`[Error] [${req.method}] ${req.originalUrl} - ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(details ? { details } : {}),
    },
  });
};

module.exports = {
  AppError,
  errorMiddleware,
};
