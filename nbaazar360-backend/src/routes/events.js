const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { optionalAuth } = require('../middleware/auth');
const { validateIdParam, validatePagination } = require('../middleware/validate');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route GET /api/events
 * @desc Get all published upcoming events
 * @access Public
 */
router.get('/', validatePagination, eventController.getPublishedEvents);

/**
 * @route GET /api/events/calendar/:year/:month
 * @desc Get events for calendar view
 * @access Public
 */
router.get('/calendar/:year/:month', eventController.getEventsCalendar);

/**
 * @route GET /api/events/:id/attendance
 * @desc Get event attendance info
 * @access Public
 */
router.get('/:id/attendance', eventController.getEventAttendance);

/**
 * @route GET /api/events/:id
 * @desc Get single event by ID
 * @access Public
 */
router.get('/:id', validateIdParam, optionalAuth, eventController.getEvent);

module.exports = router;
