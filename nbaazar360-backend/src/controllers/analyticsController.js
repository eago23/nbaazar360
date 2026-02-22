const Analytics = require('../models/Analytics');
const { sendSuccess, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Track content view (public)
 * POST /api/analytics/view
 */
const VALID_ENTITY_TYPES = ['story', 'location', 'event', 'vendor', 'panorama'];

const trackView = asyncHandler(async (req, res) => {
  const { entity_type, entity_id, referrer } = req.body;

  // Validate entity_type
  if (!entity_type || !VALID_ENTITY_TYPES.includes(entity_type)) {
    return sendError(res, 'Invalid entity_type', 'VALIDATION_ERROR', 400);
  }

  // Validate entity_id
  const parsedEntityId = parseInt(entity_id, 10);
  if (!entity_id || isNaN(parsedEntityId) || parsedEntityId <= 0) {
    return sendError(res, 'Invalid entity_id', 'VALIDATION_ERROR', 400);
  }

  await Analytics.trackView({
    entity_type,
    entity_id: parsedEntityId,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    referrer
  });

  return sendSuccess(res, null, 'View tracked');
});

/**
 * Track site visit / homepage visit (public)
 * POST /api/analytics/visit
 */
const trackSiteVisit = asyncHandler(async (req, res) => {
  await Analytics.trackSiteVisit({
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  return sendSuccess(res, null, 'Visit tracked');
});

/**
 * Get analytics summary (admin dashboard)
 * GET /api/admin/analytics/summary
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await Analytics.getSummary();
  return sendSuccess(res, summary);
});

/**
 * Get detailed view analytics (admin)
 * GET /api/admin/analytics/views
 */
const getViewAnalytics = asyncHandler(async (req, res) => {
  const {
    entity_type,
    entity_id,
    start_date,
    end_date
  } = req.query;

  // Default to last 30 days if no dates provided
  const endDate = end_date || new Date().toISOString().split('T')[0];
  const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const views = await Analytics.getViewsInRange(
    startDate,
    endDate,
    entity_type,
    entity_id ? parseInt(entity_id, 10) : null
  );

  // Get totals
  let totalViews = 0;
  views.forEach((v) => {
    totalViews += v.views;
  });

  // Get top viewed
  let topViewed = [];
  if (entity_type && !entity_id) {
    topViewed = await Analytics.getTopViewed(entity_type, 10);
  }

  return sendSuccess(res, {
    views,
    total_views: totalViews,
    top_viewed: topViewed,
    date_range: {
      start: startDate,
      end: endDate
    }
  });
});

/**
 * Get vendor performance metrics (admin)
 * GET /api/admin/analytics/vendors
 */
const getVendorAnalytics = asyncHandler(async (req, res) => {
  const vendors = await Analytics.getVendorAnalytics();

  return sendSuccess(res, { vendors });
});

/**
 * Get specific vendor analytics (admin)
 * GET /api/admin/analytics/vendors/:id
 */
const getVendorAnalyticsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [vendorData] = await Analytics.getVendorAnalytics(parseInt(id, 10));

  if (!vendorData) {
    return sendError(res, 'Vendor not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, vendorData);
});

module.exports = {
  trackView,
  trackSiteVisit,
  getSummary,
  getViewAnalytics,
  getVendorAnalytics,
  getVendorAnalyticsById
};
