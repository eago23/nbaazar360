const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { optionalAuth } = require('../middleware/auth');
const { validateIdParam, validatePagination } = require('../middleware/validate');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route GET /api/stories
 * @desc Get all published stories
 * @access Public
 */
router.get('/', validatePagination, storyController.getPublishedStories);

/**
 * @route GET /api/stories/:id
 * @desc Get single story by ID
 * @access Public
 */
router.get('/:id', validateIdParam, optionalAuth, storyController.getStory);

module.exports = router;
