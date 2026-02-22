// User roles
const ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  GUEST: 'guest'
};

// User/Vendor status
const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

// Business types
const BUSINESS_TYPES = {
  ARTISAN: 'artisan',
  SHOP: 'shop',
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  SERVICE: 'service'
};

// Hotspot types
const HOTSPOT_TYPES = {
  INFO: 'info',
  NAVIGATION: 'navigation',
  MEDIA: 'media',
  STORY: 'story'
};

// Event types
const EVENT_TYPES = {
  FESTIVAL: 'festival',
  WORKSHOP: 'workshop',
  EXHIBITION: 'exhibition',
  PERFORMANCE: 'performance',
  MARKET: 'market'
};

// File types
const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  PANORAMA: 'panorama'
};

// Analytics entity types
const ENTITY_TYPES = {
  LOCATION: 'location',
  STORY: 'story',
  EVENT: 'event',
  PANORAMA: 'panorama',
  VENDOR: 'vendor'
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,      // 10MB
  PANORAMA: 50 * 1024 * 1024,   // 50MB
  VIDEO: 100 * 1024 * 1024,     // 100MB
  DOCUMENT: 5 * 1024 * 1024     // 5MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm'],
  DOCUMENT: ['image/jpeg', 'image/jpg', 'image/png']
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Rate limiting - relaxed limits in development
const isDevelopment = process.env.NODE_ENV !== 'production';

const RATE_LIMITS = {
  PUBLIC: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: isDevelopment ? 1000 : 100  // 1000 in dev, 100 in prod
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: isDevelopment ? 100 : 5     // 100 in dev, 5 in prod
  },
  ADMIN: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: isDevelopment ? 1000 : 200  // 1000 in dev, 200 in prod
  }
};

// Username validation
const USERNAME = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
  PATTERN: /^[a-z0-9_]+$/
};

// Password validation
const PASSWORD = {
  MIN_LENGTH: 8
};

module.exports = {
  ROLES,
  USER_STATUS,
  BUSINESS_TYPES,
  HOTSPOT_TYPES,
  EVENT_TYPES,
  FILE_TYPES,
  ENTITY_TYPES,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  PAGINATION,
  RATE_LIMITS,
  USERNAME,
  PASSWORD
};
