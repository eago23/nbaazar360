const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateVendorSignup, validateLogin, validateCheckUsername } = require('../middleware/validate');
const { uploadVendorFiles, handleUploadError } = require('../middleware/upload');

/**
 * @route POST /api/auth/vendor-signup
 * @desc Register new vendor (requires approval)
 * @access Public
 */
router.post(
  '/vendor-signup',
  uploadVendorFiles,
  handleUploadError,
  validateVendorSignup,
  authController.vendorSignup
);

/**
 * @route POST /api/auth/login
 * @desc Login user (admin or vendor)
 * @access Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route POST /api/auth/check-username
 * @desc Check if username is available
 * @access Public
 */
router.post('/check-username', validateCheckUsername, authController.checkUsername);

module.exports = router;
