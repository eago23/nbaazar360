const MediaFile = require('../models/MediaFile');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteFile, getFileUrl, useCloudinary } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Get the URL from an uploaded file
 * Cloudinary: req.file.path is the full HTTPS URL
 * Local: construct relative path like /uploads/folder/filename
 */
const getUploadedFileUrl = (file, folder = '') => {
  if (!file) return null;

  // Cloudinary uploads have path as the full URL
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }

  // Local uploads - construct relative URL
  if (file.filename) {
    return folder ? `/uploads/${folder}/${file.filename}` : `/uploads/${file.filename}`;
  }

  return null;
};

/**
 * Upload image
 * POST /api/admin/upload/image
 * Files are saved to Cloudinary (or local disk as fallback)
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Asnjë skedar nuk u ngarkua', 'NO_FILE', 400);
  }

  try {
    // Get file URL (Cloudinary HTTPS URL or local relative path)
    const fileUrl = getUploadedFileUrl(req.file, '');
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);

    logger.info('Image uploaded', {
      filename: req.file.originalname,
      size: `${fileSizeMB} MB`,
      url: fileUrl,
      storage: useCloudinary ? 'cloudinary' : 'local'
    });

    // Save to database
    const mediaFile = await MediaFile.create({
      file_name: req.file.originalname,
      file_path: fileUrl,
      file_url: fileUrl,
      file_type: 'image',
      mime_type: req.file.mimetype,
      file_size_kb: Math.round(req.file.size / 1024),
      uploaded_by: req.user.id
    });

    return sendSuccess(res, {
      file_url: fileUrl,
      thumbnail_url: fileUrl,
      file_id: mediaFile.id,
      size_mb: fileSizeMB
    }, 'Image uploaded successfully', 201);
  } catch (error) {
    logger.error('Image upload failed', { error: error.message });

    // Clean up file on error (only for local uploads)
    if (!useCloudinary && req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        logger.warn('Failed to delete file on error', { path: req.file.path });
      }
    }

    return sendError(res, 'Ngarkimi i imazhit dështoi', 'UPLOAD_ERROR', 500);
  }
});

/**
 * Upload video
 * POST /api/admin/upload/video
 */
const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Asnjë skedar nuk u ngarkua', 'NO_FILE', 400);
  }

  try {
    // Get file URL (Cloudinary HTTPS URL or local relative path)
    const fileUrl = getUploadedFileUrl(req.file, 'stories');
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);

    logger.info('Video uploaded', {
      filename: req.file.originalname,
      size: `${fileSizeMB} MB`,
      url: fileUrl,
      storage: useCloudinary ? 'cloudinary' : 'local'
    });

    // Save to database
    const mediaFile = await MediaFile.create({
      file_name: req.file.originalname,
      file_path: fileUrl,
      file_url: fileUrl,
      file_type: 'video',
      mime_type: req.file.mimetype,
      file_size_kb: Math.round(req.file.size / 1024),
      uploaded_by: req.user.id
    });

    return sendSuccess(res, {
      file_url: fileUrl,
      file_id: mediaFile.id,
      size_mb: fileSizeMB
    }, 'Video uploaded successfully', 201);
  } catch (error) {
    logger.error('Video upload failed', { error: error.message });

    // Clean up file on error (only for local uploads)
    if (!useCloudinary && req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        logger.warn('Failed to delete file on error', { path: req.file.path });
      }
    }

    return sendError(res, 'Ngarkimi i videos dështoi', 'UPLOAD_ERROR', 500);
  }
});

/**
 * Upload panorama (360 image)
 * POST /api/admin/upload/panorama
 */
const uploadPanorama = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Asnjë skedar nuk u ngarkua', 'NO_FILE', 400);
  }

  try {
    // Get file URL (Cloudinary HTTPS URL or local relative path)
    const fileUrl = getUploadedFileUrl(req.file, 'panoramas');
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);

    logger.info('Panorama uploaded (HIGH QUALITY - NO COMPRESSION)', {
      filename: req.file.originalname,
      size: `${fileSizeMB} MB`,
      url: fileUrl,
      storage: useCloudinary ? 'cloudinary' : 'local'
    });

    // Save to database
    const mediaFile = await MediaFile.create({
      file_name: req.file.originalname,
      file_path: fileUrl,
      file_url: fileUrl,
      file_type: 'panorama',
      mime_type: req.file.mimetype,
      file_size_kb: Math.round(req.file.size / 1024),
      uploaded_by: req.user.id
    });

    return sendSuccess(res, {
      file_url: fileUrl,
      thumbnail_url: fileUrl,
      file_id: mediaFile.id,
      size_mb: fileSizeMB
    }, 'Panorama uploaded successfully (full quality preserved)', 201);
  } catch (error) {
    logger.error('Panorama upload failed', { error: error.message });

    // Clean up file on error (only for local uploads)
    if (!useCloudinary && req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        logger.warn('Failed to delete file on error', { path: req.file.path });
      }
    }

    return sendError(res, 'Ngarkimi i panoramës dështoi', 'UPLOAD_ERROR', 500);
  }
});

/**
 * Delete media file
 * DELETE /api/admin/media/:id
 */
const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mediaFile = await MediaFile.findById(parseInt(id, 10));
  if (!mediaFile) {
    return sendNotFound(res, 'Media file');
  }

  // Delete the actual file (supports both Cloudinary and local)
  if (mediaFile.file_path) {
    const deleted = await deleteFile(mediaFile.file_path);
    if (deleted) {
      logger.info('File deleted', { path: mediaFile.file_path });
    }
  }

  // Delete from database
  await MediaFile.delete(parseInt(id, 10));

  return sendSuccess(res, null, 'Media file deleted successfully');
});

/**
 * Get media files by entity
 * GET /api/admin/media/:entityType/:entityId
 */
const getMediaByEntity = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  const files = await MediaFile.getByEntity(entityType, parseInt(entityId, 10));

  return sendSuccess(res, { files });
});

module.exports = {
  uploadImage,
  uploadVideo,
  uploadPanorama,
  deleteMedia,
  getMediaByEntity
};
