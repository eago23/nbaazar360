const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const uploadController = require('../controllers/uploadController');
const { authenticate, requireVendor } = require('../middleware/auth');
const { uploadLogo, uploadCover, uploadImage, uploadVideo, handleUploadError } = require('../middleware/upload');
const {
  validateIdParam,
  validateUpdateVendorProfile,
  validateUpdateStory,
  validateVendorCreateStory
} = require('../middleware/validate');

// Apply authentication and vendor check to all routes
router.use(authenticate);
router.use(requireVendor);

// ============================================
// VENDOR SELF-MANAGEMENT ROUTES
// ============================================

/**
 * @route GET /api/vendor/profile
 * @desc Get own profile
 * @access Vendor
 */
router.get('/profile', vendorController.getOwnProfile);

/**
 * @route PUT /api/vendor/profile
 * @desc Update own profile
 * @access Vendor
 */
router.put('/profile', validateUpdateVendorProfile, vendorController.updateOwnProfile);

/**
 * @route POST /api/vendor/profile/logo
 * @desc Upload vendor logo
 * @access Vendor
 */
router.post('/profile/logo', uploadLogo, handleUploadError, vendorController.uploadLogo);

/**
 * @route POST /api/vendor/profile/cover
 * @desc Upload vendor cover image
 * @access Vendor
 */
router.post('/profile/cover', uploadCover, handleUploadError, vendorController.uploadCover);

// ============================================
// VENDOR UPLOAD ROUTES
// ============================================

/**
 * @route POST /api/vendor/upload/image
 * @desc Upload image (for stories)
 * @access Vendor
 */
router.post('/upload/image', uploadImage, handleUploadError, uploadController.uploadImage);

/**
 * @route POST /api/vendor/upload/video
 * @desc Upload video (for stories)
 * @access Vendor
 */
router.post('/upload/video', uploadVideo, handleUploadError, uploadController.uploadVideo);

/**
 * @route GET /api/vendor/stories
 * @desc Get own stories
 * @access Vendor
 */
router.get('/stories', vendorController.getOwnStories);

/**
 * @route POST /api/vendor/stories
 * @desc Create story about self (only needs video + description)
 * @access Vendor
 */
router.post('/stories', validateVendorCreateStory, vendorController.createOwnStory);

/**
 * @route PUT /api/vendor/stories/:id
 * @desc Update own story
 * @access Vendor
 */
router.put('/stories/:id', validateIdParam, validateUpdateStory, vendorController.updateOwnStory);

/**
 * @route DELETE /api/vendor/stories/:id
 * @desc Delete own story
 * @access Vendor
 */
router.delete('/stories/:id', validateIdParam, vendorController.deleteOwnStory);

/**
 * @route GET /api/vendor/analytics
 * @desc Get own analytics
 * @access Vendor
 */
router.get('/analytics', vendorController.getOwnAnalytics);

module.exports = router;
