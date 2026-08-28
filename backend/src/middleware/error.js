const ApiError = require('../utils/ApiError');

// 404 handler - for unmatched routes
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`, 'NOT_FOUND'));
}

// Centralized error handler - must be the last middleware
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
    code = 'INVALID_ID';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    code = 'VALIDATION_ERROR';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field || 'Field'} already exists`;
    code = 'DUPLICATE_KEY';
  }

  // Never leak stack traces in production
  const response = {
    success: false,
    message,
    code,
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };
