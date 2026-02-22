const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticate, requireVendor } = require('../middleware/auth');
const { uploadLogo, uploadCover, handleUploadError } = require('../middleware/upload');
const {
  validateIdParam,
  validateUsernameParam,
  validatePagination,
  validateUpdateVendorProfile,
  validateCreateStory,
  validateUpdateStory
} = require('../middleware/validate');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route GET /api/vendors
 * @desc Get all active vendors
 * @access Public
 */
router.get('/', validatePagination, vendorController.getActiveVendors);

/**
 * @route GET /api/vendors/:username
 * @desc Get vendor public profile by username
 * @access Public
 */
router.get('/:username', validateUsernameParam, vendorController.getVendorProfile);

/**
 * @route GET /api/vendors/:username/stories
 * @desc Get vendor's published stories
 * @access Public
 */
router.get('/:username/stories', validateUsernameParam, vendorController.getVendorStories);

module.exports = router;
