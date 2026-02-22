const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// ENSURE UPLOAD DIRECTORIES EXIST
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
// STORAGE CONFIGURATIONS
// ============================================

/**
 * Create disk storage for a specific folder
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

// Storage for different upload types
const panoramaStorage = createDiskStorage('panoramas');
const vendorStorage = createDiskStorage('vendors');
const storyStorage = createDiskStorage('stories');
const eventStorage = createDiskStorage('events');
const documentStorage = createDiskStorage('documents');
const generalStorage = createDiskStorage('');

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
// UPLOAD MIDDLEWARES
// ============================================

/**
 * Upload single image (general purpose)
 */
const uploadImage = multer({
  storage: generalStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: imageFilter
}).single('file');

/**
 * Upload single video
 */
const uploadVideo = multer({
  storage: storyStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.VIDEO },
  fileFilter: videoFilter
}).single('file');

/**
 * Upload single panorama (360 photo)
 */
const uploadPanorama = multer({
  storage: panoramaStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.PANORAMA },
  fileFilter: imageFilter
}).single('file');

/**
 * Upload document (ID card)
 */
const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.DOCUMENT },
  fileFilter: documentFilter
}).single('id_document');

/**
 * Upload vendor stall photo
 */
const uploadStallPhoto = multer({
  storage: vendorStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: imageFilter
}).single('stall_photo');

/**
 * Upload vendor files (ID document and optional stall photo)
 */
const uploadVendorFilesMulter = multer({
  storage: documentStorage,
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
  storage: vendorStorage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter: imageFilter
}).single('file');

/**
 * Upload vendor cover image
 */
const uploadCover = multer({
  storage: vendorStorage,
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
 */
const getFileUrl = (filename, folder) => {
  return `/uploads/${folder}/${filename}`;
};

/**
 * Delete a file from uploads folder
 */
const deleteFile = (filePath) => {
  const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

console.log('Multer configured for local disk storage');
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
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES
};
