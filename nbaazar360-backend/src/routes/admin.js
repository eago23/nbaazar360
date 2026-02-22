const express = require('express');
const router = express.Router();

// Import controllers
const locationController = require('../controllers/locationController');
const panoramaController = require('../controllers/panoramaController');
const hotspotController = require('../controllers/hotspotController');
const storyController = require('../controllers/storyController');
const eventController = require('../controllers/eventController');
const uploadController = require('../controllers/uploadController');
const analyticsController = require('../controllers/analyticsController');
const vendorController = require('../controllers/vendorController');

// Import middleware
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadImage, uploadVideo, uploadPanorama, handleUploadError } = require('../middleware/upload');
const {
  validateCreateLocation,
  validateUpdateLocation,
  validateCreatePanorama,
  validateUpdatePanorama,
  validateCreateHotspot,
  validateCreateStory,
  validateUpdateStory,
  validateCreateEvent,
  validateUpdateEvent,
  validateEventAttendance,
  validateApproveVendor,
  validateRejectVendor,
  validateIdParam,
  validatePagination
} = require('../middleware/validate');

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(requireAdmin);

// ============================================
// LOCATION ROUTES
// ============================================

router.get('/locations', validatePagination, locationController.getAllLocations);
router.post('/locations', validateCreateLocation, locationController.createLocation);
router.put('/locations/:id', validateIdParam, validateUpdateLocation, locationController.updateLocation);
router.delete('/locations/:id', validateIdParam, locationController.deleteLocation);

// ============================================
// PANORAMA ROUTES
// ============================================

router.post('/panoramas', validateCreatePanorama, panoramaController.createPanorama);
router.put('/panoramas/:id', validateIdParam, validateUpdatePanorama, panoramaController.updatePanorama);
router.delete('/panoramas/:id', validateIdParam, panoramaController.deletePanorama);

// ============================================
// HOTSPOT ROUTES
// ============================================

router.post('/panoramas/:panoramaId/hotspots', validateCreateHotspot, hotspotController.createHotspot);
router.put('/hotspots/:id', validateIdParam, hotspotController.updateHotspot);
router.delete('/hotspots/:id', validateIdParam, hotspotController.deleteHotspot);

// ============================================
// STORY ROUTES
// ============================================

router.get('/stories', validatePagination, storyController.getAllStories);
router.post('/stories', validateCreateStory, storyController.createStory);
router.put('/stories/:id', validateIdParam, validateUpdateStory, storyController.updateStory);
router.delete('/stories/:id', validateIdParam, storyController.deleteStory);
router.post('/stories/:id/set-primary', validateIdParam, storyController.setPrimaryStory);
router.post('/stories/:id/generate-qr', validateIdParam, storyController.generateQRCode);
router.get('/stories/:id/qr-code', validateIdParam, storyController.downloadQRCode);

// ============================================
// EVENT ROUTES
// ============================================

router.get('/events', validatePagination, eventController.getAllEvents);
router.post('/events', validateCreateEvent, eventController.createEvent);
router.put('/events/:id', validateIdParam, validateUpdateEvent, eventController.updateEvent);
router.delete('/events/:id', validateIdParam, eventController.deleteEvent);
router.post('/events/:id/attendance', validateIdParam, validateEventAttendance, eventController.updateEventAttendance);

// ============================================
// UPLOAD ROUTES
// ============================================

router.post('/upload/image', uploadImage, handleUploadError, uploadController.uploadImage);
router.post('/upload/video', uploadVideo, handleUploadError, uploadController.uploadVideo);
router.post('/upload/panorama', uploadPanorama, handleUploadError, uploadController.uploadPanorama);
router.delete('/media/:id', validateIdParam, uploadController.deleteMedia);
router.get('/media/:entityType/:entityId', uploadController.getMediaByEntity);

// ============================================
// ANALYTICS ROUTES
// ============================================

router.get('/analytics/summary', analyticsController.getSummary);
router.get('/analytics/views', analyticsController.getViewAnalytics);
router.get('/analytics/vendors', analyticsController.getVendorAnalytics);
router.get('/analytics/vendors/:id', validateIdParam, analyticsController.getVendorAnalyticsById);

// ============================================
// VENDOR MANAGEMENT ROUTES
// ============================================

router.get('/vendors/pending', validatePagination, vendorController.getPendingVendors);
router.get('/vendors', validatePagination, vendorController.getAllVendors);
router.get('/vendors/:id', validateIdParam, vendorController.getVendorById);
router.post('/vendors/:id/approve', validateIdParam, validateApproveVendor, vendorController.approveVendor);
router.post('/vendors/:id/reject', validateIdParam, validateRejectVendor, vendorController.rejectVendor);
router.post('/vendors/:id/suspend', validateIdParam, validateRejectVendor, vendorController.suspendVendor);
router.post('/vendors/:id/unsuspend', validateIdParam, vendorController.unsuspendVendor);
router.delete('/vendors/:id', validateIdParam, vendorController.deleteVendor);

module.exports = router;
