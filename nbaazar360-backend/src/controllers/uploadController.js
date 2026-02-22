const MediaFile = require('../models/MediaFile');
const { sendSuccess, sendError, sendNotFound } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteFile } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Upload image
 * POST /api/admin/upload/image
 * Files are saved directly to disk by multer middleware
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'Asnjë skedar nuk u ngarkua', 'NO_FILE', 400);
  }

  try {
    // File is already saved by multer, just get the path
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);

    logger.info('Image uploaded', {
      filename: req.file.filename,
      size: `${fileSizeMB} MB`,
      path: fileUrl
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

    // Clean up file on error
    if (req.file && req.file.path) {
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
    const fileUrl = `/uploads/stories/${req.file.filename}`;
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);

    logger.info('Video uploaded', {
      filename: req.file.filename,
      size: `${fileSizeMB} MB`,
      path: fileUrl
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

    if (req.file && req.file.path) {
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
    const fileUrl = `/uploads/panoramas/${req.file.filename}`;
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);

    logger.info('Panorama uploaded (HIGH QUALITY - NO COMPRESSION)', {
      filename: req.file.filename,
      size: `${fileSizeMB} MB`,
      path: fileUrl
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

    if (req.file && req.file.path) {
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

  // Delete the actual file from disk
  if (mediaFile.file_path && mediaFile.file_path.startsWith('/uploads/')) {
    const deleted = deleteFile(mediaFile.file_path);
    if (deleted) {
      logger.info('File deleted from disk', { path: mediaFile.file_path });
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
