const { verifyToken, extractToken } = require('../utils/jwt');
const { sendUnauthorized, sendForbidden } = require('../utils/responses');
const { ROLES, USER_STATUS } = require('../config/constants');
const { query } = require('../config/database');

/**
 * Authenticate user from JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return sendUnauthorized(res, 'Sesioni ka skaduar. Ju lutem hyni përsëri');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return sendUnauthorized(res, 'Sesioni ka skaduar. Ju lutem hyni përsëri');
    }

    // Verify user still exists and is active
    const users = await query(
      'SELECT id, email, username, full_name, role, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return sendUnauthorized(res, 'Përdoruesi nuk u gjet');
    }

    const user = users[0];

    // Check if user is active (for vendors)
    if (user.role === ROLES.VENDOR && user.status !== USER_STATUS.ACTIVE) {
      console.log('[authenticate] UNAUTHORIZED: Vendor status is', user.status, 'expected', USER_STATUS.ACTIVE);
      if (user.status === 'pending') {
        return sendUnauthorized(res, 'Llogaria juaj ende nuk është aprovuar');
      }
      if (user.status === 'rejected') {
        return sendUnauthorized(res, 'Llogaria juaj është refuzuar');
      }
      if (user.status === 'suspended') {
        return sendUnauthorized(res, 'Llogaria juaj është pezulluar');
      }
      return sendUnauthorized(res, 'Llogaria nuk është aktive');
    }

    console.log('[authenticate] User authenticated:', { id: user.id, role: user.role, status: user.status });
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return sendUnauthorized(res, 'Autentifikimi dështoi');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const users = await query(
          'SELECT id, email, username, full_name, role, status FROM users WHERE id = ?',
          [decoded.id]
        );

        if (users.length > 0) {
          req.user = users[0];
        }
      }
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Duhet të jeni i kyçur');
  }

  if (req.user.role !== ROLES.ADMIN) {
    return sendForbidden(res, 'Nuk keni leje për këtë veprim');
  }

  next();
};

/**
 * Require vendor role (and active status)
 */
const requireVendor = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Duhet të jeni i kyçur');
  }

  if (req.user.role !== ROLES.VENDOR) {
    console.log('[requireVendor] FORBIDDEN: User role is', req.user.role, 'expected', ROLES.VENDOR);
    return sendForbidden(res, 'Nuk keni leje për këtë veprim');
  }

  if (req.user.status !== USER_STATUS.ACTIVE) {
    console.log('[requireVendor] FORBIDDEN: User status is', req.user.status, 'expected', USER_STATUS.ACTIVE);
    return sendForbidden(res, 'Llogaria juaj nuk është aktive');
  }

  next();
};

/**
 * Require either admin or vendor role
 */
const requireAdminOrVendor = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Duhet të jeni i kyçur');
  }

  if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.VENDOR) {
    return sendForbidden(res, 'Nuk keni leje për këtë veprim');
  }

  // If vendor, check active status
  if (req.user.role === ROLES.VENDOR && req.user.status !== USER_STATUS.ACTIVE) {
    return sendForbidden(res, 'Llogaria juaj nuk është aktive');
  }

  next();
};

/**
 * Check if user owns a resource
 * @param {string} table - Database table name
 * @param {string} ownerField - Field that contains owner ID (default: 'vendor_id')
 * @param {string} paramName - Route parameter name (default: 'id')
 */
const requireOwnership = (table, ownerField = 'vendor_id', paramName = 'id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Duhet të jeni i kyçur');
    }

    // Admins have access to everything
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    const resourceId = req.params[paramName];

    try {
      const results = await query(
        `SELECT ${ownerField} FROM ${table} WHERE id = ?`,
        [resourceId]
      );

      if (results.length === 0) {
        return sendForbidden(res, 'Burimi nuk u gjet');
      }

      if (results[0][ownerField] !== req.user.id) {
        return sendForbidden(res, 'Nuk keni leje për këtë burim');
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return sendForbidden(res, 'Qasja u mohua');
    }
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireVendor,
  requireAdminOrVendor,
  requireOwnership
};
