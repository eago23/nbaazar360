const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const panoramaController = require('../controllers/panoramaController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateCreateLocation, validateUpdateLocation, validateIdParam, validatePagination } = require('../middleware/validate');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route GET /api/locations
 * @desc Get all published locations
 * @access Public
 */
router.get('/', validatePagination, locationController.getPublishedLocations);

/**
 * @route GET /api/locations/:id
 * @desc Get single location (by ID or slug)
 * @access Public
 */
router.get('/:id', optionalAuth, locationController.getLocation);

/**
 * @route GET /api/locations/:locationId/panoramas
 * @desc Get panoramas for a location
 * @access Public
 */
router.get('/:locationId/panoramas', optionalAuth, panoramaController.getPanoramasByLocation);

module.exports = router;
