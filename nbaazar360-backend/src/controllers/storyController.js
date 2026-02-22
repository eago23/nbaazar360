const Story = require('../models/Story');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendPaginated, sendNotFound, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateStoryQRCode, generateQRCodeBuffer } = require('../utils/qr');
const { PAGINATION } = require('../config/constants');

/**
 * Get all published stories
 * GET /api/stories
 */
const getPublishedStories = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    featured,
    location_id,
    search
  } = req.query;

  const result = await Story.getPublished({
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT),
    featured: featured === 'true',
    location_id: location_id ? parseInt(location_id, 10) : null,
    search: search || null
  });

  return sendPaginated(
    res,
    result.stories,
    result.total,
    result.page,
    result.limit,
    'stories'
  );
});

/**
 * Get single story by ID
 * GET /api/stories/:id
 */
const getStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.getFullStoryById(parseInt(id, 10));

  if (!story) {
    return sendNotFound(res, 'Story');
  }

  // Check if published (for public access)
  if (!story.is_published && (!req.user || req.user.role !== 'admin')) {
    return sendNotFound(res, 'Story');
  }

  // Track view
  await Story.incrementViews(story.id);
  await Analytics.trackView({
    entity_type: 'story',
    entity_id: story.id,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    referrer: req.get('Referrer')
  });

  return sendSuccess(res, story);
});

/**
 * Get all stories (admin)
 * GET /api/admin/stories
 */
const getAllStories = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = req.query;

  const result = await Story.getAll({
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
  });

  return sendPaginated(
    res,
    result.stories,
    result.total,
    result.page,
    result.limit,
    'stories'
  );
});

/**
 * Create new story (admin)
 * POST /api/admin/stories
 */
const createStory = asyncHandler(async (req, res) => {
  const {
    title,
    artisan_name,
    profession,
    short_bio,
    full_story,
    thumbnail_url,
    video_url,
    duration_seconds,
    location_id,
    vendor_id,
    is_featured,
    is_published
  } = req.body;

  const storyData = {
    title,
    artisan_name,
    profession,
    short_bio,
    full_story,
    thumbnail_url,
    video_url,
    duration_seconds: duration_seconds ? parseInt(duration_seconds, 10) : null,
    location_id: location_id ? parseInt(location_id, 10) : null,
    vendor_id: vendor_id ? parseInt(vendor_id, 10) : null,
    is_featured: is_featured === true || is_featured === 'true',
    is_published: is_published !== false && is_published !== 'false'
  };

  const story = await Story.create(storyData);

  return sendSuccess(res, story, 'Story created successfully', 201);
});

/**
 * Update story (admin)
 * PUT /api/admin/stories/:id
 */
const updateStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingStory = await Story.findById(parseInt(id, 10));
  if (!existingStory) {
    return sendNotFound(res, 'Story');
  }

  const {
    title,
    artisan_name,
    profession,
    short_bio,
    full_story,
    thumbnail_url,
    video_url,
    duration_seconds,
    location_id,
    is_featured,
    is_published
  } = req.body;

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (artisan_name !== undefined) updateData.artisan_name = artisan_name;
  if (profession !== undefined) updateData.profession = profession;
  if (short_bio !== undefined) updateData.short_bio = short_bio;
  if (full_story !== undefined) updateData.full_story = full_story;
  if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
  if (video_url !== undefined) updateData.video_url = video_url;
  if (duration_seconds !== undefined) updateData.duration_seconds = parseInt(duration_seconds, 10);
  if (location_id !== undefined) updateData.location_id = location_id ? parseInt(location_id, 10) : null;
  if (is_featured !== undefined) updateData.is_featured = is_featured === true || is_featured === 'true';
  if (is_published !== undefined) updateData.is_published = is_published === true || is_published === 'true';

  const story = await Story.update(parseInt(id, 10), updateData);

  return sendSuccess(res, story, 'Story updated successfully');
});

/**
 * Delete story (admin)
 * DELETE /api/admin/stories/:id
 */
const deleteStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(parseInt(id, 10));
  if (!story) {
    return sendNotFound(res, 'Story');
  }

  await Story.delete(parseInt(id, 10));

  return sendSuccess(res, null, 'Story deleted successfully');
});

/**
 * Set story as primary for vendor (admin)
 * POST /api/admin/stories/:id/set-primary
 */
const setPrimaryStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(parseInt(id, 10));
  if (!story) {
    return sendNotFound(res, 'Story');
  }

  if (!story.vendor_id) {
    return sendError(res, 'Historia nuk është e lidhur me një biznes', 'INVALID_REQUEST', 400);
  }

  const updatedStory = await Story.setPrimary(parseInt(id, 10), story.vendor_id);

  return sendSuccess(res, {
    story_id: updatedStory.id,
    vendor_id: updatedStory.vendor_id,
    is_primary: updatedStory.is_primary_story
  }, 'Story set as primary for this vendor');
});

/**
 * Generate QR code for story (admin)
 * POST /api/admin/stories/:id/generate-qr
 */
const generateQRCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(parseInt(id, 10));
  if (!story) {
    return sendNotFound(res, 'Story');
  }

  const { qrCodeUrl, storyUrl } = await generateStoryQRCode(story.slug, story.id);

  // Update story with QR code URL
  await Story.updateQRCode(parseInt(id, 10), qrCodeUrl);

  return sendSuccess(res, {
    qr_code_url: qrCodeUrl,
    story_url: storyUrl,
    story_id: story.id
  }, 'QR code generated successfully');
});

/**
 * Download QR code image (admin)
 * GET /api/admin/stories/:id/qr-code
 */
const downloadQRCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(parseInt(id, 10));
  if (!story) {
    return sendNotFound(res, 'Story');
  }

  const storyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/stories/${story.slug}`;
  const buffer = await generateQRCodeBuffer(storyUrl);

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="qr-story-${story.id}.png"`);
  return res.send(buffer);
});

module.exports = {
  getPublishedStories,
  getStory,
  getAllStories,
  createStory,
  updateStory,
  deleteStory,
  setPrimaryStory,
  generateQRCode,
  downloadQRCode
};
