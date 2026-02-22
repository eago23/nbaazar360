/**
 * Standardized API response helpers
 */

/**
 * Success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted success response
 */
const success = (data, message = 'Success') => ({
  success: true,
  data,
  message,
  error: null
});

/**
 * Error response
 * @param {string} message - Error message
 * @param {string} errorCode - Error code
 * @returns {Object} Formatted error response
 */
const error = (message, errorCode = 'ERROR') => ({
  success: false,
  data: null,
  message,
  error: errorCode
});

/**
 * Validation error response
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Formatted validation error response
 */
const validationError = (errors) => ({
  success: false,
  message: 'Validation failed',
  errors
});

/**
 * Paginated response
 * @param {Array} items - List of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} key - Key name for items array
 * @returns {Object} Formatted paginated response
 */
const paginated = (items, total, page, limit, key = 'items') => ({
  success: true,
  data: {
    [key]: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  },
  message: 'Success',
  error: null
});

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json(success(data, message));
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} errorCode - Error code
 * @param {number} statusCode - HTTP status code
 */
const sendError = (res, message, errorCode = 'ERROR', statusCode = 400) => {
  return res.status(statusCode).json(error(message, errorCode));
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const sendValidationError = (res, errors) => {
  return res.status(400).json(validationError(errors));
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - List of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} key - Key name for items array
 */
const sendPaginated = (res, items, total, page, limit, key = 'items') => {
  return res.status(200).json(paginated(items, total, page, limit, key));
};

// Albanian resource names mapping
const resourceNames = {
  'Resource': 'Burimi',
  'User': 'Përdoruesi',
  'Vendor': 'Biznesi',
  'Story': 'Historia',
  'Event': 'Ngjarja',
  'Location': 'Vendndodhja',
  'Panorama': 'Panorama',
  'Hotspot': 'Pika'
};

/**
 * Send not found error
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 */
const sendNotFound = (res, resource = 'Resource') => {
  const albanianResource = resourceNames[resource] || resource;
  return res.status(404).json(error(`${albanianResource} nuk u gjet`, 'NOT_FOUND'));
};

/**
 * Send unauthorized error
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message = 'Nuk jeni i autorizuar') => {
  return res.status(401).json(error(message, 'UNAUTHORIZED'));
};

/**
 * Send forbidden error
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendForbidden = (res, message = 'Nuk keni leje për këtë veprim') => {
  return res.status(403).json(error(message, 'FORBIDDEN'));
};

module.exports = {
  success,
  error,
  validationError,
  paginated,
  sendSuccess,
  sendError,
  sendValidationError,
  sendPaginated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden
};
