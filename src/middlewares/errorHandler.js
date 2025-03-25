const { logger } = require('../utils/logger');
const ErrorResponse = require('../utils/errors');

exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  logger.error(err);

  // Prisma error handling
  if (err.code) {
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta.target[0];
      error = new ErrorResponse(`The ${field} is already taken`, 400);
    }

    // Prisma record not found
    if (err.code === 'P2001' || err.code === 'P2018') {
      error = new ErrorResponse('Resource not found', 404);
    }

    // Prisma foreign key constraint violation
    if (err.code === 'P2003') {
      error = new ErrorResponse('Related resource not found', 404);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};