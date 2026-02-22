const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { validateTrackView } = require('../middleware/validate');

// ============================================
// PUBLIC ROUTES (Tracking)
// ============================================

/**
 * @route POST /api/analytics/view
 * @desc Track content view
 * @access Public
 */
router.post('/view', validateTrackView, analyticsController.trackView);

/**
 * @route POST /api/analytics/visit
 * @desc Track site visit (homepage)
 * @access Public
 */
router.post('/visit', analyticsController.trackSiteVisit);

module.exports = router;
