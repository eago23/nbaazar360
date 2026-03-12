const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('../utils/logger');

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  logger.info('Cloudinary configured successfully', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
  });
} else {
  logger.warn('Cloudinary not configured - falling back to local storage');
}

// ============================================
// CLOUDINARY STORAGE CONFIGURATIONS
// ============================================

/**
 * Storage for general images (vendor profiles, event thumbnails, story thumbnails)
 */
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nbazaar360/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto:good' }],
    resource_type: 'image'
  }
});

/**
 * Storage for videos (AR stories)
 */
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nbazaar360/videos',
    allowed_formats: ['mp4', 'webm', 'mov'],
    resource_type: 'video'
  }
});

/**
 * Storage for panoramas (360 images) - NO compression for quality
 */
const panoramaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nbazaar360/panoramas',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // No transformation to preserve full quality for 360 panoramas
    resource_type: 'image'
  }
});

/**
 * Storage for documents (ID cards - kept separate for security)
 */
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nbazaar360/documents',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image',
    // Documents should not be publicly accessible
    type: 'private'
  }
});

/**
 * Storage for vendor assets (logos, cover images)
 */
const vendorStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nbazaar360/vendors',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto:good' }],
    resource_type: 'image'
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Delete a file from Cloudinary by its public_id or URL
 * @param {string} urlOrPublicId - Cloudinary URL or public_id
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
const deleteFromCloudinary = async (urlOrPublicId) => {
  try {
    // If it's a URL, extract the public_id
    let publicId = urlOrPublicId;

    if (urlOrPublicId.includes('cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
      const matches = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
      if (matches && matches[1]) {
        publicId = matches[1];
      } else {
        logger.warn('Could not extract public_id from Cloudinary URL', { url: urlOrPublicId });
        return false;
      }
    }

    // Determine resource type from the URL or public_id
    const resourceType = urlOrPublicId.includes('/videos/') || urlOrPublicId.includes('nbazaar360/videos')
      ? 'video'
      : 'image';

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    logger.info('Deleted file from Cloudinary', { publicId, result: result.result });
    return result.result === 'ok';
  } catch (error) {
    logger.error('Failed to delete from Cloudinary', { error: error.message, urlOrPublicId });
    return false;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  imageStorage,
  videoStorage,
  panoramaStorage,
  documentStorage,
  vendorStorage,
  deleteFromCloudinary
};
