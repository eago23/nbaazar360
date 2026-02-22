const Location = require('../models/Location');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendPaginated, sendNotFound, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');

/**
 * Get all published locations
 * GET /api/locations
 */
const getPublishedLocations = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sort = 'display_order',
    search
  } = req.query;

  const result = await Location.getPublished({
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT),
    sort,
    search: search || null
  });

  return sendPaginated(
    res,
    result.locations,
    result.total,
    result.page,
    result.limit,
    'locations'
  );
});

/**
 * Get single location by ID or slug
 * GET /api/locations/:id
 */
const getLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let location;

  // Check if id is numeric or slug
  if (/^\d+$/.test(id)) {
    location = await Location.getWithPanoramas(parseInt(id, 10));
  } else {
    const found = await Location.findBySlug(id);
    if (found) {
      location = await Location.getWithPanoramas(found.id);
    }
  }

  if (!location) {
    return sendNotFound(res, 'Location');
  }

  // Check if published (for public access)
  if (!location.is_published && (!req.user || req.user.role !== 'admin')) {
    return sendNotFound(res, 'Location');
  }

  // Track view
  await Location.incrementViews(location.id);
  await Analytics.trackView({
    entity_type: 'location',
    entity_id: location.id,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    referrer: req.get('Referrer')
  });

  return sendSuccess(res, location);
});

/**
 * Get all locations (admin)
 * GET /api/admin/locations
 */
const getAllLocations = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = req.query;

  const result = await Location.getAll({
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT),
    includeUnpublished: true
  });

  return sendPaginated(
    res,
    result.locations,
    result.total,
    result.page,
    result.limit,
    'locations'
  );
});

/**
 * Create new location
 * POST /api/admin/locations
 */
const createLocation = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    short_description,
    latitude,
    longitude,
    address,
    thumbnail_url,
    panorama_url,
    is_published,
    display_order,
    interactive_points_count
  } = req.body;

  const locationData = {
    name,
    description,
    short_description,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    address,
    thumbnail_url,
    panorama_url,
    is_published: is_published === true || is_published === 'true',
    display_order: display_order ? parseInt(display_order, 10) : 0,
    interactive_points_count: interactive_points_count ? parseInt(interactive_points_count, 10) : 0,
    created_by: req.user.id
  };

  const location = await Location.create(locationData);

  return sendSuccess(res, location, 'Location created successfully', 201);
});

/**
 * Update location
 * PUT /api/admin/locations/:id
 */
const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingLocation = await Location.findById(parseInt(id, 10));
  if (!existingLocation) {
    return sendNotFound(res, 'Location');
  }

  const {
    name,
    description,
    short_description,
    latitude,
    longitude,
    address,
    thumbnail_url,
    panorama_url,
    is_published,
    display_order,
    interactive_points_count
  } = req.body;

  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (short_description !== undefined) updateData.short_description = short_description;
  if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
  if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
  if (address !== undefined) updateData.address = address;
  if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
  if (panorama_url !== undefined) updateData.panorama_url = panorama_url;
  if (is_published !== undefined) updateData.is_published = is_published === true || is_published === 'true';
  if (display_order !== undefined) updateData.display_order = parseInt(display_order, 10);
  if (interactive_points_count !== undefined) updateData.interactive_points_count = parseInt(interactive_points_count, 10);

  const location = await Location.update(parseInt(id, 10), updateData);

  return sendSuccess(res, location, 'Location updated successfully');
});

/**
 * Delete location
 * DELETE /api/admin/locations/:id
 */
const deleteLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const location = await Location.findById(parseInt(id, 10));
  if (!location) {
    return sendNotFound(res, 'Location');
  }

  await Location.delete(parseInt(id, 10));

  return sendSuccess(res, null, 'Location deleted successfully');
});

module.exports = {
  getPublishedLocations,
  getLocation,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation
};
