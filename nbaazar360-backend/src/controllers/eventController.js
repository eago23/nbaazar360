const Event = require('../models/Event');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendPaginated, sendNotFound, sendError } = require('../utils/responses');
const { asyncHandler } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');

/**
 * Get all published events
 * GET /api/events
 */
const getPublishedEvents = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    type,
    featured,
    month,
    search
  } = req.query;

  const result = await Event.getPublished({
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT),
    event_type: type,
    featured: featured === 'true',
    upcoming: true,
    search: search || null
  });

  return sendPaginated(
    res,
    result.events,
    result.total,
    result.page,
    result.limit,
    'events'
  );
});

/**
 * Get events for calendar view
 * GET /api/events/calendar/:year/:month
 */
const getEventsCalendar = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const events = await Event.getByMonth(parseInt(year, 10), parseInt(month, 10));

  return sendSuccess(res, {
    events,
    month: parseInt(month, 10),
    year: parseInt(year, 10)
  });
});

/**
 * Get single event by ID
 * GET /api/events/:id
 */
const getEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.getFullEventById(parseInt(id, 10));

  if (!event) {
    return sendNotFound(res, 'Event');
  }

  // Check if published (for public access)
  if (!event.is_published && (!req.user || req.user.role !== 'admin')) {
    return sendNotFound(res, 'Event');
  }

  // Track view
  await Analytics.trackView({
    entity_type: 'event',
    entity_id: event.id,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    referrer: req.get('Referrer')
  });

  return sendSuccess(res, event);
});

/**
 * Get event attendance
 * GET /api/events/:id/attendance
 */
const getEventAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try to find event by slug or ID
  let event;
  if (/^\d+$/.test(id)) {
    event = await Event.findById(parseInt(id, 10));
  } else {
    event = await Event.findBySlug(id);
  }

  if (!event) {
    return sendNotFound(res, 'Event');
  }

  const attendance = await Event.getAttendance(event.id);

  return sendSuccess(res, {
    event_id: event.id,
    attended_count: attendance?.attended_count || 0,
    notes: attendance?.notes || null,
    updated_at: attendance?.updated_at || null
  });
});

/**
 * Get all events (admin)
 * GET /api/admin/events
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = req.query;

  const result = await Event.getAll({
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
  });

  return sendPaginated(
    res,
    result.events,
    result.total,
    result.page,
    result.limit,
    'events'
  );
});

/**
 * Create new event
 * POST /api/admin/events
 */
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    short_description,
    event_type,
    start_date,
    end_date,
    start_time,
    end_time,
    location_id,
    venue_name,
    thumbnail_url,
    banner_url,
    is_published,
    is_featured,
    max_participants,
    registration_required,
    registration_url
  } = req.body;

  const eventData = {
    title,
    description,
    short_description,
    event_type,
    start_date,
    end_date,
    start_time,
    end_time,
    location_id: location_id ? parseInt(location_id, 10) : null,
    venue_name,
    thumbnail_url,
    banner_url,
    is_published: is_published === true || is_published === 'true',
    is_featured: is_featured === true || is_featured === 'true',
    max_participants: max_participants ? parseInt(max_participants, 10) : null,
    registration_required: registration_required === true || registration_required === 'true',
    registration_url
  };

  const event = await Event.create(eventData);

  return sendSuccess(res, event, 'Event created successfully', 201);
});

/**
 * Update event
 * PUT /api/admin/events/:id
 */
const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingEvent = await Event.findById(parseInt(id, 10));
  if (!existingEvent) {
    return sendNotFound(res, 'Event');
  }

  const {
    title,
    description,
    short_description,
    event_type,
    start_date,
    end_date,
    start_time,
    end_time,
    location_id,
    venue_name,
    thumbnail_url,
    banner_url,
    is_published,
    is_featured,
    max_participants,
    registration_required,
    registration_url
  } = req.body;

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (short_description !== undefined) updateData.short_description = short_description;
  if (event_type !== undefined) updateData.event_type = event_type;
  if (start_date !== undefined) updateData.start_date = start_date;
  if (end_date !== undefined) updateData.end_date = end_date;
  if (start_time !== undefined) updateData.start_time = start_time;
  if (end_time !== undefined) updateData.end_time = end_time;
  if (location_id !== undefined) updateData.location_id = location_id ? parseInt(location_id) : null;
  if (venue_name !== undefined) updateData.venue_name = venue_name;
  if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
  if (banner_url !== undefined) updateData.banner_url = banner_url;
  if (is_published !== undefined) updateData.is_published = is_published === true || is_published === 'true';
  if (is_featured !== undefined) updateData.is_featured = is_featured === true || is_featured === 'true';
  if (max_participants !== undefined) updateData.max_participants = max_participants ? parseInt(max_participants) : null;
  if (registration_required !== undefined) updateData.registration_required = registration_required === true || registration_required === 'true';
  if (registration_url !== undefined) updateData.registration_url = registration_url;

  const event = await Event.update(parseInt(id, 10), updateData);

  return sendSuccess(res, event, 'Event updated successfully');
});

/**
 * Delete event
 * DELETE /api/admin/events/:id
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(parseInt(id, 10));
  if (!event) {
    return sendNotFound(res, 'Event');
  }

  await Event.delete(parseInt(id, 10));

  return sendSuccess(res, null, 'Event deleted successfully');
});

/**
 * Update event attendance (admin)
 * POST /api/admin/events/:id/attendance
 */
const updateEventAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { attended_count, notes } = req.body;

  const event = await Event.findById(parseInt(id, 10));
  if (!event) {
    return sendNotFound(res, 'Event');
  }

  const attendance = await Event.updateAttendance(
    parseInt(id, 10),
    parseInt(attended_count, 10),
    notes,
    req.user.id
  );

  return sendSuccess(res, attendance, 'Attendance updated successfully');
});

module.exports = {
  getPublishedEvents,
  getEventsCalendar,
  getEvent,
  getEventAttendance,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventAttendance
};
