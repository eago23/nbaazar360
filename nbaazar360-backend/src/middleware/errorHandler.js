const logger = require('../utils/logger');
const { sendError } = require('../utils/responses');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 400, errorCode = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Albanian resource names mapping
const resourceNames = {
  'Resource': 'Burimi',
  'User': 'Përdoruesi',
  'Vendor': 'Biznesi',
  'Story': 'Historia',
  'Event': 'Ngjarja',
  'Location': 'Vendndodhja',
  'Panorama': 'Panorama',
  'Hotspot': 'Pika',
  'Endpoint': 'Endpoint',
  'Profile': 'Profili',
  'Media file': 'Skedari'
};

/**
 * Not found error
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    const albanianResource = resourceNames[resource] || resource;
    super(`${albanianResource} nuk u gjet`, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized error
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Nuk jeni i autorizuar') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden error
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Nuk keni leje për këtë veprim') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Validation error
 */
class ValidationError extends ApiError {
  constructor(message = 'Validimi dështoi') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Conflict error (duplicate entry)
 */
class ConflictError extends ApiError {
  constructor(message = 'Ky burim ekziston tashmë') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Handle 404 Not Found
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Endpoint');
  next(error);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.errorCode, err.statusCode);
  }

  // Handle MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    return sendError(res, 'Ky burim ekziston tashmë', 'DUPLICATE_ENTRY', 409);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return sendError(res, 'Burimi i referencuar nuk u gjet', 'FOREIGN_KEY_ERROR', 400);
  }

  if (err.code === 'ECONNREFUSED') {
    return sendError(res, 'Lidhja me bazën e të dhënave dështoi', 'DB_CONNECTION_ERROR', 503);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Tokeni është i pavlefshëm', 'INVALID_TOKEN', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Tokeni ka skaduar', 'TOKEN_EXPIRED', 401);
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'Skedari është shumë i madh', 'FILE_TOO_LARGE', 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, 'Lloji i skedarit nuk pritet', 'UNEXPECTED_FILE', 400);
  }

  // Handle validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    const errors = err.array().map((e) => ({
      field: e.path,
      message: e.msg
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Ndodhi një gabim i papritur'
      : err.message || 'Gabim në server';

  return sendError(res, message, 'SERVER_ERROR', statusCode);
};

/**
 * Async handler wrapper to catch errors in async functions
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  ApiError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  notFoundHandler,
  errorHandler,
  asyncHandler
};
