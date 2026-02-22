const Hotspot = require('../models/Hotspot');
const Panorama = require('../models/Panorama');
const { sendSuccess, sendNotFound, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get hotspots for a panorama
 * GET /api/panoramas/:panoramaId/hotspots
 */
const getHotspotsByPanorama = asyncHandler(async (req, res) => {
  const { panoramaId } = req.params;

  const panorama = await Panorama.findById(parseInt(panoramaId, 10));
  if (!panorama) {
    return sendNotFound(res, 'Panorama');
  }

  const hotspots = await Hotspot.getByPanoramaId(parseInt(panoramaId, 10));

  return sendSuccess(res, { hotspots });
});

/**
 * Get single hotspot
 * GET /api/hotspots/:id
 */
const getHotspot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hotspot = await Hotspot.findById(parseInt(id, 10));

  if (!hotspot) {
    return sendNotFound(res, 'Hotspot');
  }

  return sendSuccess(res, hotspot);
});

/**
 * Create new hotspot
 * POST /api/admin/panoramas/:panoramaId/hotspots
 */
const createHotspot = asyncHandler(async (req, res) => {
  const { panoramaId } = req.params;
  const {
    title,
    description,
    hotspot_type,
    pitch,
    yaw,
    media_url,
    link_to_panorama_id,
    link_to_story_id
  } = req.body;

  // Verify panorama exists
  const panorama = await Panorama.findById(parseInt(panoramaId, 10));
  if (!panorama) {
    return sendError(res, 'Panorama nuk u gjet', 'NOT_FOUND', 404);
  }

  // Verify linked panorama exists if provided
  if (link_to_panorama_id) {
    const linkedPanorama = await Panorama.findById(parseInt(link_to_panorama_id, 10));
    if (!linkedPanorama) {
      return sendError(res, 'Panorama e lidhur nuk u gjet', 'NOT_FOUND', 404);
    }
  }

  // Verify linked story exists if provided
  if (link_to_story_id) {
    const Story = require('../models/Story');
    const linkedStory = await Story.findById(parseInt(link_to_story_id, 10));
    if (!linkedStory) {
      return sendError(res, 'Historia e lidhur nuk u gjet', 'NOT_FOUND', 404);
    }
  }

  const hotspotData = {
    panorama_id: parseInt(panoramaId, 10),
    title,
    description,
    hotspot_type,
    pitch: parseFloat(pitch),
    yaw: parseFloat(yaw),
    media_url,
    link_to_panorama_id: link_to_panorama_id ? parseInt(link_to_panorama_id, 10) : null,
    link_to_story_id: link_to_story_id ? parseInt(link_to_story_id, 10) : null
  };

  const hotspot = await Hotspot.create(hotspotData);

  return sendSuccess(res, hotspot, 'Hotspot created successfully', 201);
});

/**
 * Update hotspot
 * PUT /api/admin/hotspots/:id
 */
const updateHotspot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingHotspot = await Hotspot.findById(parseInt(id, 10));
  if (!existingHotspot) {
    return sendNotFound(res, 'Hotspot');
  }

  const {
    title,
    description,
    hotspot_type,
    pitch,
    yaw,
    media_url,
    link_to_panorama_id,
    link_to_story_id
  } = req.body;

  // Verify linked panorama exists if provided
  if (link_to_panorama_id) {
    const linkedPanorama = await Panorama.findById(parseInt(link_to_panorama_id, 10));
    if (!linkedPanorama) {
      return sendError(res, 'Panorama e lidhur nuk u gjet', 'NOT_FOUND', 404);
    }
  }

  // Verify linked story exists if provided
  if (link_to_story_id) {
    const Story = require('../models/Story');
    const linkedStory = await Story.findById(parseInt(link_to_story_id, 10));
    if (!linkedStory) {
      return sendError(res, 'Historia e lidhur nuk u gjet', 'NOT_FOUND', 404);
    }
  }

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (hotspot_type !== undefined) updateData.hotspot_type = hotspot_type;
  if (pitch !== undefined) updateData.pitch = parseFloat(pitch);
  if (yaw !== undefined) updateData.yaw = parseFloat(yaw);
  if (media_url !== undefined) updateData.media_url = media_url;
  if (link_to_panorama_id !== undefined) {
    updateData.link_to_panorama_id = link_to_panorama_id ? parseInt(link_to_panorama_id, 10) : null;
  }
  if (link_to_story_id !== undefined) {
    updateData.link_to_story_id = link_to_story_id ? parseInt(link_to_story_id, 10) : null;
  }

  const hotspot = await Hotspot.update(parseInt(id, 10), updateData);

  return sendSuccess(res, hotspot, 'Hotspot updated successfully');
});

/**
 * Delete hotspot
 * DELETE /api/admin/hotspots/:id
 */
const deleteHotspot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hotspot = await Hotspot.findById(parseInt(id, 10));
  if (!hotspot) {
    return sendNotFound(res, 'Hotspot');
  }

  await Hotspot.delete(parseInt(id, 10));

  return sendSuccess(res, null, 'Hotspot deleted successfully');
});

module.exports = {
  getHotspotsByPanorama,
  getHotspot,
  createHotspot,
  updateHotspot,
  deleteHotspot
};
