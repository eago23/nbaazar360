const Panorama = require('../models/Panorama');
const Location = require('../models/Location');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendNotFound, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get panoramas for a location
 * GET /api/locations/:locationId/panoramas
 */
const getPanoramasByLocation = asyncHandler(async (req, res) => {
  const { locationId } = req.params;

  const location = await Location.findById(parseInt(locationId));
  if (!location) {
    return sendNotFound(res, 'Location');
  }

  // Check if location is published (for public access)
  if (!location.is_published && (!req.user || req.user.role !== 'admin')) {
    return sendNotFound(res, 'Location');
  }

  const panoramas = await Panorama.getByLocationId(parseInt(locationId));

  // Add hotspot count to each panorama
  const panoramasWithCounts = await Promise.all(
    panoramas.map(async (p) => {
      const hotspotCount = await require('../models/Hotspot').countByPanoramaId(p.id);
      return { ...p, hotspot_count: hotspotCount };
    })
  );

  return sendSuccess(res, { panoramas: panoramasWithCounts });
});

/**
 * Get single panorama with hotspots
 * GET /api/panoramas/:id
 */
const getPanorama = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const panorama = await Panorama.getWithHotspots(parseInt(id));

  if (!panorama) {
    return sendNotFound(res, 'Panorama');
  }

  // Track view
  await Analytics.trackView({
    entity_type: 'panorama',
    entity_id: panorama.id,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    referrer: req.get('Referrer')
  });

  return sendSuccess(res, panorama);
});

/**
 * Create new panorama
 * POST /api/admin/panoramas
 */
const createPanorama = asyncHandler(async (req, res) => {
  const {
    location_id,
    title,
    image_url,
    thumbnail_url,
    initial_view_angle,
    is_primary,
    display_order
  } = req.body;

  // Verify location exists
  const location = await Location.findById(parseInt(location_id));
  if (!location) {
    return sendError(res, 'Vendndodhja nuk u gjet', 'NOT_FOUND', 404);
  }

  const panoramaData = {
    location_id: parseInt(location_id),
    title,
    image_url,
    thumbnail_url,
    initial_view_angle: initial_view_angle ? parseInt(initial_view_angle) : 0,
    is_primary: is_primary === true || is_primary === 'true',
    display_order: display_order ? parseInt(display_order) : 0
  };

  const panorama = await Panorama.create(panoramaData);

  return sendSuccess(res, panorama, 'Panorama created successfully', 201);
});

/**
 * Update panorama
 * PUT /api/admin/panoramas/:id
 */
const updatePanorama = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingPanorama = await Panorama.findById(parseInt(id));
  if (!existingPanorama) {
    return sendNotFound(res, 'Panorama');
  }

  const {
    title,
    image_url,
    thumbnail_url,
    initial_view_angle,
    is_primary,
    display_order
  } = req.body;

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (image_url !== undefined) updateData.image_url = image_url;
  if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
  if (initial_view_angle !== undefined) updateData.initial_view_angle = parseInt(initial_view_angle);
  if (is_primary !== undefined) updateData.is_primary = is_primary === true || is_primary === 'true';
  if (display_order !== undefined) updateData.display_order = parseInt(display_order);

  const panorama = await Panorama.update(parseInt(id), updateData);

  return sendSuccess(res, panorama, 'Panorama updated successfully');
});

/**
 * Delete panorama
 * DELETE /api/admin/panoramas/:id
 */
const deletePanorama = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const panorama = await Panorama.findById(parseInt(id));
  if (!panorama) {
    return sendNotFound(res, 'Panorama');
  }

  await Panorama.delete(parseInt(id));

  return sendSuccess(res, null, 'Panorama deleted successfully');
});

module.exports = {
  getPanoramasByLocation,
  getPanorama,
  createPanorama,
  updatePanorama,
  deletePanorama
};
