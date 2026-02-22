const express = require('express');
const router = express.Router();
const panoramaController = require('../controllers/panoramaController');
const hotspotController = require('../controllers/hotspotController');
const { validateIdParam } = require('../middleware/validate');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route GET /api/panoramas/:id
 * @desc Get single panorama with hotspots
 * @access Public
 */
router.get('/:id', validateIdParam, panoramaController.getPanorama);

/**
 * @route GET /api/panoramas/:panoramaId/hotspots
 * @desc Get hotspots for a panorama
 * @access Public
 */
router.get('/:panoramaId/hotspots', hotspotController.getHotspotsByPanorama);

module.exports = router;
