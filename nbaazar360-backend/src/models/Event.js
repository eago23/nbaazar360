const { query, insert } = require('../config/database');
const { generateUniqueSlug } = require('../utils/slugify');

/**
 * Event Model
 */
const Event = {
  /**
   * Find event by ID
   */
  findById: async (id) => {
    const events = await query('SELECT * FROM events WHERE id = ?', [id]);
    return events[0] || null;
  },

  /**
   * Find event by slug
   */
  findBySlug: async (slug) => {
    const events = await query('SELECT * FROM events WHERE slug = ?', [slug]);
    return events[0] || null;
  },

  /**
   * Check if slug exists
   */
  slugExists: async (slug) => {
    const events = await query('SELECT id FROM events WHERE slug = ?', [slug]);
    return events.length > 0;
  },

  /**
   * Create new event
   */
  create: async (eventData) => {
    const slug = await generateUniqueSlug(eventData.title, Event.slugExists);

    const sql = `
      INSERT INTO events (
        title, slug, description, short_description, event_type,
        start_date, end_date, start_time, end_time, location_id,
        venue_name, thumbnail_url, banner_url, is_published, is_featured,
        max_participants, registration_required, registration_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      eventData.title,
      slug,
      eventData.description || null,
      eventData.short_description || null,
      eventData.event_type,
      eventData.start_date,
      eventData.end_date || null,
      eventData.start_time || null,
      eventData.end_time || null,
      eventData.location_id || null,
      eventData.venue_name || null,
      eventData.thumbnail_url || null,
      eventData.banner_url || null,
      eventData.is_published || false,
      eventData.is_featured || false,
      eventData.max_participants || null,
      eventData.registration_required || false,
      eventData.registration_url || null
    ];

    const id = await insert(sql, params);
    return Event.findById(id);
  },

  /**
   * Update event
   */
  update: async (id, updateData) => {
    const allowedFields = [
      'title', 'description', 'short_description', 'event_type',
      'start_date', 'end_date', 'start_time', 'end_time', 'location_id',
      'venue_name', 'thumbnail_url', 'banner_url', 'is_published', 'is_featured',
      'max_participants', 'registration_required', 'registration_url'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    // Update slug if title changed
    if (updateData.title) {
      const newSlug = await generateUniqueSlug(updateData.title, async (slug) => {
        const existing = await query('SELECT id FROM events WHERE slug = ? AND id != ?', [slug, id]);
        return existing.length > 0;
      });
      updates.push('slug = ?');
      params.push(newSlug);
    }

    if (updates.length === 0) return Event.findById(id);

    params.push(id);
    await query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params);
    return Event.findById(id);
  },

  /**
   * Delete event
   */
  delete: async (id) => {
    await query('DELETE FROM events WHERE id = ?', [id]);
    return true;
  },

  /**
   * Get published events
   */
  getPublished: async (options = {}) => {
    const {
      page = 1,
      limit = 10,
      event_type = null,
      featured = null,
      upcoming = true,
      search = null
    } = options;

    let sql = `SELECT * FROM events WHERE is_published = 1`;
    const params = [];

    if (event_type) {
      sql += ` AND event_type = ?`;
      params.push(event_type);
    }

    if (featured === true) {
      sql += ` AND is_featured = 1`;
    }

    if (upcoming) {
      sql += ` AND (end_date >= CURDATE() OR (end_date IS NULL AND start_date >= CURDATE()))`;
    }

    // Search functionality
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 2) {
        sql += ` AND (
          LOWER(title) LIKE LOWER(?)
          OR LOWER(description) LIKE LOWER(?)
          OR LOWER(short_description) LIKE LOWER(?)
          OR LOWER(venue_name) LIKE LOWER(?)
          OR LOWER(event_type) LIKE LOWER(?)
        )`;
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }
    }

    // Count total
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // Add sorting and pagination
    sql += ` ORDER BY start_date ASC, start_time ASC`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const events = await query(sql, params);

    return { events, total, page, limit };
  },

  /**
   * Get all events (admin)
   */
  getAll: async (options = {}) => {
    const { page = 1, limit = 10 } = options;

    const countResult = await query('SELECT COUNT(*) as total FROM events');
    const total = countResult[0].total;

    const sql = `
      SELECT e.*, l.name as location_name
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      ORDER BY e.start_date DESC
      LIMIT ? OFFSET ?
    `;

    const events = await query(sql, [limit, (page - 1) * limit]);

    return { events, total, page, limit };
  },

  /**
   * Get events for calendar (month view)
   */
  getByMonth: async (year, month) => {
    const sql = `
      SELECT id, title, slug, event_type, start_date, end_date, start_time, end_time
      FROM events
      WHERE is_published = 1
        AND (
          (YEAR(start_date) = ? AND MONTH(start_date) = ?)
          OR (YEAR(end_date) = ? AND MONTH(end_date) = ?)
          OR (start_date <= LAST_DAY(?) AND (end_date >= ? OR end_date IS NULL))
        )
      ORDER BY start_date ASC, start_time ASC
    `;

    const monthDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const params = [year, month, year, month, monthDate, monthDate];

    return query(sql, params);
  },

  /**
   * Get event with location info (by slug)
   */
  getFullEvent: async (slug) => {
    const sql = `
      SELECT e.*, l.name as location_name, l.slug as location_slug
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE e.slug = ?
    `;
    const events = await query(sql, [slug]);
    return events[0] || null;
  },

  /**
   * Get event with location info (by ID)
   */
  getFullEventById: async (id) => {
    const sql = `
      SELECT e.*, l.name as location_name, l.slug as location_slug
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE e.id = ?
    `;
    const events = await query(sql, [id]);
    return events[0] || null;
  },

  /**
   * Get or create event attendance record
   */
  getAttendance: async (eventId) => {
    const results = await query(
      'SELECT * FROM event_attendance WHERE event_id = ?',
      [eventId]
    );
    return results[0] || null;
  },

  /**
   * Update event attendance
   */
  updateAttendance: async (eventId, count, notes, updatedBy) => {
    const existing = await Event.getAttendance(eventId);

    if (existing) {
      await query(
        'UPDATE event_attendance SET attended_count = ?, notes = ?, updated_by = ? WHERE event_id = ?',
        [count, notes, updatedBy, eventId]
      );
    } else {
      await query(
        'INSERT INTO event_attendance (event_id, attended_count, notes, updated_by) VALUES (?, ?, ?, ?)',
        [eventId, count, notes, updatedBy]
      );
    }

    return Event.getAttendance(eventId);
  }
};

module.exports = Event;
