const { body, param, query: queryValidator, validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/responses');
const {
  USERNAME,
  PASSWORD,
  BUSINESS_TYPES,
  HOTSPOT_TYPES,
  EVENT_TYPES,
  ENTITY_TYPES
} = require('../config/constants');

/**
 * Handle validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));
    return sendValidationError(res, formattedErrors);
  }
  next();
};

// ============================================
// AUTH VALIDATIONS
// ============================================

const validateVendorSignup = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email është i detyrueshëm')
    .isEmail({ require_tld: true, allow_display_name: false })
    .withMessage('Adresa email nuk është e vlefshme')
    .normalizeEmail(),

  body('password')
    .isLength({ min: PASSWORD.MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD.MIN_LENGTH} characters`),

  body('business_name')
    .notEmpty()
    .withMessage('Business name is required')
    .trim(),

  body('business_type')
    .optional()
    .isIn(Object.values(BUSINESS_TYPES))
    .withMessage('Invalid business type'),

  body('phone')
    .optional()
    .trim(),

  body('terms_accepted')
    .equals('true')
    .withMessage('You must accept the terms and conditions'),

  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email është i detyrueshëm')
    .isEmail({ require_tld: true, allow_display_name: false })
    .withMessage('Adresa email nuk është e vlefshme')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

const validateCheckUsername = [
  body('username')
    .isLength({ min: USERNAME.MIN_LENGTH, max: USERNAME.MAX_LENGTH })
    .withMessage(`Username must be ${USERNAME.MIN_LENGTH}-${USERNAME.MAX_LENGTH} characters`)
    .matches(USERNAME.PATTERN)
    .withMessage('Username can only contain lowercase letters, numbers, and underscores'),

  handleValidationErrors
];

// ============================================
// LOCATION VALIDATIONS
// ============================================

const validateCreateLocation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),

  body('description')
    .optional()
    .trim(),

  body('short_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Short description must be at most 500 characters')
    .trim(),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),

  body('address')
    .optional()
    .trim(),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  handleValidationErrors
];

const validateUpdateLocation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .trim(),

  body('short_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Short description must be at most 500 characters'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  handleValidationErrors
];

// ============================================
// PANORAMA VALIDATIONS
// ============================================

const validateCreatePanorama = [
  body('location_id')
    .isInt({ min: 1 })
    .withMessage('Valid location_id is required'),

  body('title')
    .optional()
    .trim(),

  body('image_url')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL'),

  body('thumbnail_url')
    .optional()
    .isURL()
    .withMessage('Invalid thumbnail URL'),

  body('initial_view_angle')
    .optional()
    .isInt({ min: 0, max: 360 })
    .withMessage('Initial view angle must be 0-360'),

  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean'),

  handleValidationErrors
];

const validateUpdatePanorama = [
  body('title')
    .optional()
    .trim(),

  body('image_url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),

  body('initial_view_angle')
    .optional()
    .isInt({ min: 0, max: 360 })
    .withMessage('Initial view angle must be 0-360'),

  body('is_primary')
    .optional()
    .isBoolean()
    .withMessage('is_primary must be a boolean'),

  handleValidationErrors
];

// ============================================
// HOTSPOT VALIDATIONS
// ============================================

const validateCreateHotspot = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim(),

  body('description')
    .optional()
    .trim(),

  body('hotspot_type')
    .isIn(Object.values(HOTSPOT_TYPES))
    .withMessage('Invalid hotspot type'),

  body('pitch')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Pitch must be between -90 and 90'),

  body('yaw')
    .isFloat({ min: 0, max: 360 })
    .withMessage('Yaw must be between 0 and 360'),

  body('media_url')
    .optional()
    .isURL()
    .withMessage('Invalid media URL'),

  body('link_to_panorama_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid panorama ID'),

  body('link_to_story_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid story ID'),

  handleValidationErrors
];

// ============================================
// STORY VALIDATIONS
// ============================================

/**
 * Admin story creation validation
 * Required: video_url, full_story (description)
 * Optional: title, artisan_name
 */
const validateCreateStory = [
  body('title')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('artisan_name')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('profession')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('short_bio')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Short bio must be at most 500 characters')
    .trim(),

  body('full_story')
    .notEmpty()
    .withMessage('Description (full_story) is required')
    .trim(),

  body('video_url')
    .notEmpty()
    .withMessage('Video URL is required')
    .trim(),

  body('thumbnail_url')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('location_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Invalid location ID'),

  body('vendor_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Invalid vendor ID'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  handleValidationErrors
];

/**
 * Vendor story creation validation
 * Required: video_url, full_story (description)
 * Everything else auto-filled from vendor profile
 */
const validateVendorCreateStory = [
  body('full_story')
    .notEmpty()
    .withMessage('Description is required')
    .trim(),

  body('video_url')
    .notEmpty()
    .withMessage('Video URL is required')
    .trim(),

  body('thumbnail_url')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  handleValidationErrors
];

const validateUpdateStory = [
  // Title is optional and can be cleared (null/empty allowed)
  body('title')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  // Artisan/Business name is optional and can be cleared
  body('artisan_name')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  // Profession is optional and can be cleared
  body('profession')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('short_bio')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Short bio must be at most 500 characters'),

  body('full_story')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('video_url')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('thumbnail_url')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('location_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Invalid location ID'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  handleValidationErrors
];

// ============================================
// EVENT VALIDATIONS
// ============================================

const validateCreateEvent = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim(),

  body('description')
    .optional()
    .trim(),

  body('short_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Short description must be at most 500 characters')
    .trim(),

  body('event_type')
    .isIn(Object.values(EVENT_TYPES))
    .withMessage('Invalid event type'),

  body('start_date')
    .isISO8601()
    .withMessage('Invalid start date format'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  body('start_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage('Invalid start time format (HH:MM or HH:MM:SS)'),

  body('end_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage('Invalid end time format (HH:MM or HH:MM:SS)'),

  body('location_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid location ID'),

  body('venue_name')
    .optional()
    .trim(),

  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive number'),

  body('registration_required')
    .optional()
    .isBoolean()
    .withMessage('registration_required must be a boolean'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),

  handleValidationErrors
];

const validateUpdateEvent = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .trim(),

  body('event_type')
    .optional()
    .isIn(Object.values(EVENT_TYPES))
    .withMessage('Invalid event type'),

  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),

  handleValidationErrors
];

// ============================================
// ANALYTICS VALIDATIONS
// ============================================

const validateTrackView = [
  body('entity_type')
    .isIn(Object.values(ENTITY_TYPES))
    .withMessage('Invalid entity type'),

  body('entity_id')
    .isInt({ min: 1 })
    .withMessage('Invalid entity ID'),

  body('referrer')
    .optional()
    .trim(),

  handleValidationErrors
];

// ============================================
// VENDOR VALIDATIONS
// ============================================

const validateUpdateVendorProfile = [
  body('business_description')
    .optional()
    .trim(),

  body('phone')
    .optional()
    .trim(),

  body('address')
    .optional()
    .trim(),

  body('about')
    .optional()
    .trim(),

  body('contact_info')
    .optional()
    .trim(),

  handleValidationErrors
];

const validateApproveVendor = [
  body('notes')
    .optional()
    .trim(),

  handleValidationErrors
];

const validateRejectVendor = [
  body('reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .trim(),

  handleValidationErrors
];

const validateEventAttendance = [
  body('attended_count')
    .isInt({ min: 0 })
    .withMessage('Attended count must be a non-negative number'),

  body('notes')
    .optional()
    .trim(),

  handleValidationErrors
];

// ============================================
// COMMON PARAM VALIDATIONS
// ============================================

const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID'),

  handleValidationErrors
];

const validateSlugParam = [
  param('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .trim(),

  handleValidationErrors
];

const validateUsernameParam = [
  param('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim(),

  handleValidationErrors
];

// ============================================
// PAGINATION VALIDATIONS
// ============================================

const validatePagination = [
  queryValidator('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  queryValidator('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  // Auth
  validateVendorSignup,
  validateLogin,
  validateCheckUsername,
  // Location
  validateCreateLocation,
  validateUpdateLocation,
  // Panorama
  validateCreatePanorama,
  validateUpdatePanorama,
  // Hotspot
  validateCreateHotspot,
  // Story
  validateCreateStory,
  validateVendorCreateStory,
  validateUpdateStory,
  // Event
  validateCreateEvent,
  validateUpdateEvent,
  // Analytics
  validateTrackView,
  // Vendor
  validateUpdateVendorProfile,
  validateApproveVendor,
  validateRejectVendor,
  validateEventAttendance,
  // Common
  validateIdParam,
  validateSlugParam,
  validateUsernameParam,
  validatePagination
};
