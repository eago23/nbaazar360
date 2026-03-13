const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const vendorRoutes = require('./vendor');
const locationRoutes = require('./locations');
const panoramaRoutes = require('./panoramas');
const storyRoutes = require('./stories');
const eventRoutes = require('./events');
const analyticsRoutes = require('./analytics');
const vendorsRoutes = require('./vendors');
const contactRoutes = require('./contact');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: "n'Bazaar360 API is running",
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// MOUNT ROUTES
// ============================================

// Authentication routes
router.use('/auth', authRoutes);

// Admin routes (all admin endpoints under /api/admin/*)
router.use('/admin', adminRoutes);

// Vendor self-management routes (/api/vendor/*)
router.use('/vendor', vendorRoutes);

// Public routes
router.use('/locations', locationRoutes);
router.use('/panoramas', panoramaRoutes);
router.use('/stories', storyRoutes);
router.use('/events', eventRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/vendors', vendorsRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
