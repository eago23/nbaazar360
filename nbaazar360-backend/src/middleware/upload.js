const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  isCloudinaryConfigured,
  imageStorage,
  videoStorage,
  panoramaStorage,
  documentStorage,
  vendorStorage,
  deleteFromCloudinary
} = require('../config/cloudinary');

// ============================================
// ENSURE LOCAL UPLOAD DIRECTORIES EXIST (FALLBACK)
// ============================================

const uploadDirs = [
  'uploads/panoramas',
  'uploads/vendors',
  'uploads/stories',
  'uploads/events',
  'uploads/documents'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log('Created directory:', dir);
  }
});

// ============================================
// FILE SIZE LIMITS (in bytes)
// ============================================

const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,      // 10MB
  PANORAMA: 50 * 1024 * 1024,   // 50MB for 360 photos
  VIDEO: 100 * 1024 * 1024,     // 100MB
  DOCUMENT: 5 * 1024 * 1024     // 5MB
};

// ============================================
// ALLOWED MIME TYPES
// ============================================

const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm'],
  DOCUMENT: ['image/jpeg', 'image/jpg', 'image/png']
};

// ============================================
// LOCAL STORAGE CONFIGURATIONS (FALLBACK)
// ============================================

/**
 * Create disk storage for a specific folder (fallback when Cloudinary not configured)
 */
const createDiskStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', folder);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .substring(0, 50);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// Local storage options for fallback
const localPanoramaStorage = createDiskStorage('panoramas');
const localVendorStorage = createDiskStorage('vendors');
const localStoryStorage = createDiskStorage('stories');
const localEventStorage = createDiskStorage('events');
const localDocumentStorage = createDiskStorage('documents');
const localGeneralStorage = createDiskStorage('');

// ============================================
// FILE FILTERS
// ============================================

const imageFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.IMAGE.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const videoFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.VIDEO.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4 and WebM videos are allowed'), false);
  }
};

const documentFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.DOCUMENT.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed for documents'), false);
  }
};

const mediaFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.IMAGE.includes(file.mimetype) ||
      ALLOWED_MIME_TYPES.VIDEO.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// ============================================
// DETERMINE STORAGE (Cloudinary or Local)
// ============================================

const useCloudinary = isCloudinaryConfigured();

// Log which storage is being used
if (useCloudinary) {
  console.log('Using Cloudinary storage for file uploads');
} else {
  console.log('Using local disk storage for file uploads (Cloudinary not configured)');
}

// ============================================
// UPLOAD MIDDLEWARES
// ============================================

/**
 * Upload single image (general purpose)
 */
const uploadImage = multer({
  storage: useCloudinary ? imageStorage : localGeneralStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: imageFilter
}).single('file');

/**
 * Upload single video
 */
const uploadVideo = multer({
  storage: useCloudinary ? videoStorage : localStoryStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.VIDEO },
  fileFilter: videoFilter
}).single('file');

/**
 * Upload single panorama (360 photo)
 */
const uploadPanorama = multer({
  storage: useCloudinary ? panoramaStorage : localPanoramaStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.PANORAMA },
  fileFilter: imageFilter
}).single('file');

/**
 * Upload document (ID card)
 */
const uploadDocument = multer({
  storage: useCloudinary ? documentStorage : localDocumentStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.DOCUMENT },
  fileFilter: documentFilter
}).single('id_document');

/**
 * Upload vendor stall photo
 */
const uploadStallPhoto = multer({
  storage: useCloudinary ? vendorStorage : localVendorStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: imageFilter
}).single('stall_photo');

/**
 * Upload vendor files (ID document and optional stall photo)
 */
const uploadVendorFilesMulter = multer({
  storage: useCloudinary ? documentStorage : localDocumentStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'id_document') {
      return documentFilter(req, file, cb);
    }
    if (file.fieldname === 'stall_photo') {
      return imageFilter(req, file, cb);
    }
    cb(new Error('Unexpected field'), false);
  }
}).fields([
  { name: 'id_document', maxCount: 1 },
  { name: 'stall_photo', maxCount: 1 }
]);

/**
 * Optional upload middleware - allows JSON requests without files
 */
const uploadVendorFiles = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }
  uploadVendorFilesMulter(req, res, next);
};

/**
 * Upload vendor logo
 */
const uploadLogo = multer({
  storage: useCloudinary ? vendorStorage : localVendorStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: imageFilter
}).single('file');

/**
 * Upload vendor cover image
 */
const uploadCover = multer({
  storage: useCloudinary ? vendorStorage : localVendorStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: imageFilter
}).single('file');

// ============================================
// ERROR HANDLER
// ============================================

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the allowed limit',
        error: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        error: 'UNEXPECTED_FILE'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'UPLOAD_ERROR'
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'UPLOAD_ERROR'
    });
  }

  next();
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the public URL path for an uploaded file
 * For Cloudinary: returns req.file.path (full HTTPS URL)
 * For local: returns relative path like /uploads/folder/filename
 */
const getFileUrl = (file, folder) => {
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
 * Delete a file (supports both Cloudinary and local)
 * @param {string} fileUrl - The file URL to delete
 * @returns {Promise<boolean>|boolean}
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl) return false;

  // Cloudinary URL
  if (fileUrl.includes('cloudinary.com')) {
    return await deleteFromCloudinary(fileUrl);
  }

  // Local file
  if (fileUrl.startsWith('/uploads/')) {
    const fullPath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  }

  return false;
};

/**
 * Check if a URL is a Cloudinary URL
 */
const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

console.log('Multer configured');
console.log('File size limits: IMAGE=10MB, PANORAMA=50MB, VIDEO=100MB');

module.exports = {
  uploadImage,
  uploadVideo,
  uploadPanorama,
  uploadDocument,
  uploadStallPhoto,
  uploadVendorFiles,
  uploadLogo,
  uploadCover,
  handleUploadError,
  getFileUrl,
  deleteFile,
  isCloudinaryUrl,
  useCloudinary,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES
};
