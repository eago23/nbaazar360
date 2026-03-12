const User = require('../models/User');
const Story = require('../models/Story');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendPaginated, sendNotFound, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendVendorApprovalEmail, sendVendorRejectionEmail } = require('../utils/email');
const { deleteFile, useCloudinary } = require('../middleware/upload');
const { PAGINATION } = require('../config/constants');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// ============================================
// PUBLIC VENDOR BROWSING
// ============================================

/**
 * Get all active vendors (public)
 * GET /api/vendors
 */
const getActiveVendors = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    business_type,
    location_id,
    search,
    sort = 'newest'
  } = req.query;

  const result = await User.getActiveVendors({
    page: parseInt(page),
    limit: Math.min(parseInt(limit), PAGINATION.MAX_LIMIT),
    business_type,
    location_id: location_id ? parseInt(location_id) : null,
    search,
    sort
  });

  return sendPaginated(
    res,
    result.vendors,
    result.total,
    result.page,
    result.limit,
    'vendors'
  );
});

/**
 * Get vendor public profile by username or ID
 * GET /api/vendors/:username
 */
const getVendorProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  logger.info('Fetching vendor profile', { param: username, isNumeric: /^\d+$/.test(username) });

  // Check if param is numeric (ID) or string (username)
  let vendor;
  if (/^\d+$/.test(username)) {
    vendor = await User.getPublicProfileById(parseInt(username, 10));
  } else {
    vendor = await User.getPublicProfile(username);
  }

  if (!vendor) {
    logger.warn('Vendor not found or not active', { param: username });
    return sendNotFound(res, 'Vendor');
  }

  // Get vendor's stories
  let publishedStories = [];
  try {
    const stories = await Story.getByVendorId(vendor.id);
    publishedStories = stories
      .filter((s) => s.is_published)
      .map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        thumbnail_url: s.thumbnail_url,
        video_url: s.video_url,
        view_count: s.view_count
      }));
  } catch (storiesError) {
    logger.warn('Failed to fetch vendor stories', { vendorId: vendor.id, error: storiesError.message });
    // Continue without stories
  }

  // Track view (don't let analytics failure break the page)
  try {
    await Analytics.trackView({
      entity_type: 'vendor',
      entity_id: vendor.id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      referrer: req.get('Referrer')
    });
  } catch (analyticsError) {
    logger.warn('Failed to track vendor view', { vendorId: vendor.id, error: analyticsError.message });
    // Continue without tracking - don't fail the request
  }

  return sendSuccess(res, {
    ...vendor,
    location: vendor.location_id
      ? { id: vendor.location_id, name: vendor.location_name }
      : null,
    stories: publishedStories
  });
});

/**
 * Get vendor's stories (public)
 * GET /api/vendors/:username/stories
 */
const getVendorStories = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const vendor = await User.getPublicProfile(username);
  if (!vendor) {
    return sendNotFound(res, 'Vendor');
  }

  const stories = await Story.getByVendorId(vendor.id);
  const publishedStories = stories.filter((s) => s.is_published);

  return sendSuccess(res, { stories: publishedStories });
});

// ============================================
// ADMIN VENDOR MANAGEMENT
// ============================================

/**
 * Get pending vendor applications (admin)
 * GET /api/admin/vendors/pending
 */
const getPendingVendors = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sort = 'newest'
  } = req.query;

  const result = await User.getPendingVendors(
    parseInt(page),
    Math.min(parseInt(limit), PAGINATION.MAX_LIMIT)
  );

  return sendPaginated(
    res,
    result.vendors,
    result.total,
    result.page,
    result.limit,
    'applications'
  );
});

/**
 * Get all vendors (admin)
 * GET /api/admin/vendors
 */
const getAllVendors = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
    business_type,
    search,
    sort = 'created_at',
    order = 'DESC'
  } = req.query;

  console.log('[ADMIN VENDORS] Query params:', { status, page, limit, business_type, search });

  const result = await User.getVendors({
    page: parseInt(page),
    limit: Math.min(parseInt(limit), PAGINATION.MAX_LIMIT),
    status,
    business_type,
    search,
    sort,
    order
  });

  console.log('[ADMIN VENDORS] Result:', { total: result.total, count: result.vendors.length, statuses: result.vendors.map(v => v.status) });

  return sendPaginated(
    res,
    result.vendors,
    result.total,
    result.page,
    result.limit,
    'vendors'
  );
});

/**
 * Get vendor details (admin)
 * GET /api/admin/vendors/:id
 */
const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await User.findById(parseInt(id));
  if (!vendor || vendor.role !== 'vendor') {
    return sendNotFound(res, 'Vendor');
  }

  // Remove sensitive data
  const { password_hash, ...vendorData } = vendor;

  return sendSuccess(res, vendorData);
});

/**
 * Approve vendor (admin)
 * POST /api/admin/vendors/:id/approve
 */
const approveVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const vendor = await User.findById(parseInt(id));
  if (!vendor || vendor.role !== 'vendor') {
    return sendNotFound(res, 'Vendor');
  }

  if (vendor.status !== 'pending') {
    return sendError(res, 'Biznesi nuk është në statusin pritës', 'INVALID_STATUS', 400);
  }

  const approvedVendor = await User.approve(parseInt(id), req.user.id);

  // Send approval email
  try {
    await sendVendorApprovalEmail({
      email: approvedVendor.email,
      username: approvedVendor.username,
      business_name: approvedVendor.business_name
    });
  } catch (emailError) {
    logger.warn('Approval email failed', { error: emailError.message });
  }

  logger.info('Vendor approved', {
    vendorId: id,
    adminId: req.user.id,
    notes
  });

  return sendSuccess(res, {
    id: approvedVendor.id,
    username: approvedVendor.username,
    status: approvedVendor.status,
    approved_at: approvedVendor.approved_at
  }, 'Vendor approved successfully. Approval email sent.');
});

/**
 * Reject vendor (admin)
 * POST /api/admin/vendors/:id/reject
 */
const rejectVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const vendor = await User.findById(parseInt(id));
  if (!vendor || vendor.role !== 'vendor') {
    return sendNotFound(res, 'Vendor');
  }

  if (vendor.status !== 'pending') {
    return sendError(res, 'Biznesi nuk është në statusin pritës', 'INVALID_STATUS', 400);
  }

  const rejectedVendor = await User.reject(parseInt(id), reason);

  // Send rejection email
  try {
    console.log('[VENDOR REJECTION] About to send rejection email to:', rejectedVendor.email);
    console.log('[VENDOR REJECTION] VENDOR_EMAIL_NOTIFICATIONS =', process.env.VENDOR_EMAIL_NOTIFICATIONS);
    console.log('[VENDOR REJECTION] SMTP_USER =', process.env.SMTP_USER || 'NOT SET');

    await sendVendorRejectionEmail(
      {
        email: rejectedVendor.email,
        business_name: rejectedVendor.business_name
      },
      reason
    );

    console.log('[VENDOR REJECTION] Rejection email sent successfully to:', rejectedVendor.email);
  } catch (emailError) {
    console.error('[VENDOR REJECTION] Rejection email FAILED:', emailError.message, emailError.stack);
    logger.warn('Rejection email failed', { error: emailError.message });
  }

  logger.info('Vendor rejected', {
    vendorId: id,
    adminId: req.user.id,
    reason
  });

  return sendSuccess(res, {
    id: rejectedVendor.id,
    status: rejectedVendor.status,
    rejection_reason: rejectedVendor.rejection_reason
  }, 'Application rejected. Notification email sent.');
});

/**
 * Suspend vendor (admin)
 * POST /api/admin/vendors/:id/suspend
 */
const suspendVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const vendor = await User.findById(parseInt(id));
  if (!vendor || vendor.role !== 'vendor') {
    return sendNotFound(res, 'Vendor');
  }

  if (vendor.status !== 'active') {
    return sendError(res, 'Biznesi nuk është aktiv', 'INVALID_STATUS', 400);
  }

  const suspendedVendor = await User.suspend(parseInt(id), reason);

  logger.info('Vendor suspended', {
    vendorId: id,
    adminId: req.user.id,
    reason
  });

  return sendSuccess(res, {
    id: suspendedVendor.id,
    status: suspendedVendor.status,
    rejection_reason: suspendedVendor.rejection_reason
  }, 'Vendor suspended successfully');
});

/**
 * Unsuspend vendor (admin)
 * POST /api/admin/vendors/:id/unsuspend
 */
const unsuspendVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await User.findById(parseInt(id));
  if (!vendor || vendor.role !== 'vendor') {
    return sendNotFound(res, 'Vendor');
  }

  if (vendor.status !== 'suspended') {
    return sendError(res, 'Biznesi nuk është i pezulluar', 'INVALID_STATUS', 400);
  }

  const reactivatedVendor = await User.unsuspend(parseInt(id));

  logger.info('Vendor unsuspended', {
    vendorId: id,
    adminId: req.user.id
  });

  return sendSuccess(res, {
    id: reactivatedVendor.id,
    status: reactivatedVendor.status
  }, 'Vendor reactivated successfully');
});

/**
 * Delete vendor (admin)
 * DELETE /api/admin/vendors/:id
 */
const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendor = await User.findById(parseInt(id));
  if (!vendor || vendor.role !== 'vendor') {
    return sendNotFound(res, 'Vendor');
  }

  // Delete associated stories first
  await Story.deleteByVendorId(parseInt(id));

  // Delete the vendor
  await User.delete(parseInt(id));

  logger.info('Vendor deleted', {
    vendorId: id,
    vendorUsername: vendor.username,
    adminId: req.user.id
  });

  return sendSuccess(res, null, 'Vendor deleted successfully');
});

// ============================================
// VENDOR SELF-MANAGEMENT
// ============================================

/**
 * Get own profile (vendor)
 * GET /api/vendor/profile
 */
const getOwnProfile = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.user.id);
  if (!vendor) {
    return sendNotFound(res, 'Profile');
  }

  const { password_hash, id_document_url, ...profileData } = vendor;

  return sendSuccess(res, profileData);
});

/**
 * Update own profile (vendor)
 * PUT /api/vendor/profile
 */
const updateOwnProfile = asyncHandler(async (req, res) => {
  const {
    business_name,
    business_description,
    business_type,
    phone,
    address,
    about,
    contact_info
  } = req.body;

  const updateData = {};

  if (business_name !== undefined) updateData.business_name = business_name;
  if (business_description !== undefined) updateData.business_description = business_description;
  if (business_type !== undefined) updateData.business_type = business_type;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (about !== undefined) updateData.about = about;
  if (contact_info !== undefined) updateData.contact_info = contact_info;

  const vendor = await User.update(req.user.id, updateData);
  const { password_hash, id_document_url, ...profileData } = vendor;

  return sendSuccess(res, profileData, 'Profile updated successfully');
});

/**
 * Upload logo (vendor)
 * POST /api/vendor/profile/logo
 */
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Asnjë skedar nuk u ngarkua', 'NO_FILE', 400);
  }

  try {
    // Get current user to check for old logo
    const vendor = await User.findById(req.user.id);

    // Delete old logo if exists (supports both Cloudinary and local)
    if (vendor.logo_url) {
      await deleteFile(vendor.logo_url);
      logger.info('Deleted old logo', { path: vendor.logo_url });
    }

    // Get file URL (Cloudinary HTTPS URL or local relative path)
    let logoUrl;
    if (req.file.path && req.file.path.startsWith('http')) {
      // Cloudinary URL
      logoUrl = req.file.path;
    } else {
      // Local path
      logoUrl = `/uploads/vendors/${req.file.filename}`;
    }

    await User.update(req.user.id, { logo_url: logoUrl });

    logger.info('Logo uploaded', {
      userId: req.user.id,
      url: logoUrl,
      storage: useCloudinary ? 'cloudinary' : 'local'
    });

    return sendSuccess(res, { logo_url: logoUrl }, 'Logo uploaded successfully');
  } catch (error) {
    logger.error('Logo upload failed', { error: error.message });
    return sendError(res, 'Ngarkimi i logos dështoi', 'UPLOAD_ERROR', 500);
  }
});

/**
 * Upload cover image (vendor)
 * POST /api/vendor/profile/cover
 */
const uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Asnjë skedar nuk u ngarkua', 'NO_FILE', 400);
  }

  try {
    // Get current user to check for old cover
    const vendor = await User.findById(req.user.id);

    // Delete old cover if exists (supports both Cloudinary and local)
    if (vendor.cover_image_url) {
      await deleteFile(vendor.cover_image_url);
      logger.info('Deleted old cover', { path: vendor.cover_image_url });
    }

    // Get file URL (Cloudinary HTTPS URL or local relative path)
    let coverUrl;
    if (req.file.path && req.file.path.startsWith('http')) {
      // Cloudinary URL
      coverUrl = req.file.path;
    } else {
      // Local path
      coverUrl = `/uploads/vendors/${req.file.filename}`;
    }

    await User.update(req.user.id, { cover_image_url: coverUrl });

    logger.info('Cover uploaded', {
      userId: req.user.id,
      url: coverUrl,
      storage: useCloudinary ? 'cloudinary' : 'local'
    });

    return sendSuccess(res, { cover_image_url: coverUrl }, 'Cover image uploaded successfully');
  } catch (error) {
    logger.error('Cover upload failed', { error: error.message });
    return sendError(res, 'Ngarkimi i fotos së kopertinës dështoi', 'UPLOAD_ERROR', 500);
  }
});

/**
 * Get own stories (vendor)
 * GET /api/vendor/stories
 */
const getOwnStories = asyncHandler(async (req, res) => {
  const stories = await Story.getByVendorId(req.user.id);

  return sendSuccess(res, { stories });
});

/**
 * Create story (vendor)
 * POST /api/vendor/stories
 * Only requires: video_url, full_story (description)
 * Auto-fills: title from business_name (artisan_name left null to avoid duplicates)
 */
const createOwnStory = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.user.id);

  const {
    full_story,
    thumbnail_url,
    video_url,
    is_published
  } = req.body;

  // Auto-fill title from vendor profile (artisan_name intentionally left null)
  const businessName = vendor.business_name || vendor.full_name || 'Artisan';

  const storyData = {
    title: businessName,
    artisan_name: null,  // Don't auto-fill to avoid duplicate name display
    profession: null,
    short_bio: full_story ? full_story.substring(0, 150) : '',
    full_story: full_story || '',
    thumbnail_url: thumbnail_url || null,
    video_url: video_url || null,
    location_id: vendor.location_id,
    vendor_id: req.user.id,
    is_published: is_published !== false && is_published !== 'false'
  };

  const story = await Story.create(storyData);

  return sendSuccess(res, story, 'Story created successfully', 201);
});

/**
 * Update own story (vendor)
 * PUT /api/vendor/stories/:id
 */
const updateOwnStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(parseInt(id));
  if (!story) {
    return sendNotFound(res, 'Story');
  }

  // Check ownership
  if (story.vendor_id !== req.user.id) {
    return sendError(res, 'Kjo histori nuk ju përket', 'FORBIDDEN', 403);
  }

  const {
    title,
    artisan_name,
    profession,
    short_bio,
    full_story,
    thumbnail_url,
    video_url,
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
  if (is_published !== undefined) updateData.is_published = is_published === true || is_published === 'true';

  const updatedStory = await Story.update(parseInt(id), updateData);

  return sendSuccess(res, updatedStory, 'Story updated successfully');
});

/**
 * Delete own story (vendor)
 * DELETE /api/vendor/stories/:id
 */
const deleteOwnStory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(parseInt(id));
  if (!story) {
    return sendNotFound(res, 'Story');
  }

  // Check ownership
  if (story.vendor_id !== req.user.id) {
    return sendError(res, 'Kjo histori nuk ju përket', 'FORBIDDEN', 403);
  }

  await Story.delete(parseInt(id));

  return sendSuccess(res, null, 'Story deleted successfully');
});

/**
 * Get own analytics (vendor)
 * GET /api/vendor/analytics
 */
const getOwnAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Analytics.getVendorOwnAnalytics(req.user.id);
  return sendSuccess(res, analytics);
});

module.exports = {
  // Public
  getActiveVendors,
  getVendorProfile,
  getVendorStories,
  // Admin
  getPendingVendors,
  getAllVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  suspendVendor,
  unsuspendVendor,
  deleteVendor,
  // Vendor self-management
  getOwnProfile,
  updateOwnProfile,
  uploadLogo,
  uploadCover,
  getOwnStories,
  createOwnStory,
  updateOwnStory,
  deleteOwnStory,
  getOwnAnalytics
};
