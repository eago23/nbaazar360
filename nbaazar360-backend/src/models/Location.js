const { query, insert } = require('../config/database');
const { slugify, generateUniqueSlug } = require('../utils/slugify');

/**
 * Location Model
 */
const Location = {
  /**
   * Find location by ID
   */
  findById: async (id) => {
    const locations = await query('SELECT * FROM locations WHERE id = ?', [id]);
    return locations[0] || null;
  },

  /**
   * Find location by slug
   */
  findBySlug: async (slug) => {
    const locations = await query('SELECT * FROM locations WHERE slug = ?', [slug]);
    return locations[0] || null;
  },

  /**
   * Check if slug exists
   */
  slugExists: async (slug) => {
    const locations = await query('SELECT id FROM locations WHERE slug = ?', [slug]);
    return locations.length > 0;
  },

  /**
   * Create new location
   */
  create: async (locationData) => {
    const slug = await generateUniqueSlug(locationData.name, Location.slugExists);

    const sql = `
      INSERT INTO locations (
        name, slug, description, short_description,
        latitude, longitude, address, thumbnail_url, panorama_url,
        is_published, display_order, interactive_points_count, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      locationData.name,
      slug,
      locationData.description || null,
      locationData.short_description || null,
      locationData.latitude || null,
      locationData.longitude || null,
      locationData.address || null,
      locationData.thumbnail_url || null,
      locationData.panorama_url || null,
      locationData.is_published || false,
      locationData.display_order || 0,
      locationData.interactive_points_count || 0,
      locationData.created_by || null
    ];

    const id = await insert(sql, params);
    return Location.findById(id);
  },

  /**
   * Update location
   */
  update: async (id, updateData) => {
    const allowedFields = [
      'name', 'description', 'short_description',
      'latitude', 'longitude', 'address', 'thumbnail_url', 'panorama_url',
      'is_published', 'display_order', 'interactive_points_count'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    // Update slug if name changed
    if (updateData.name) {
      const newSlug = await generateUniqueSlug(updateData.name, async (slug) => {
        const existing = await query('SELECT id FROM locations WHERE slug = ? AND id != ?', [slug, id]);
        return existing.length > 0;
      });
      updates.push('slug = ?');
      params.push(newSlug);
    }

    if (updates.length === 0) return Location.findById(id);

    params.push(id);
    await query(`UPDATE locations SET ${updates.join(', ')} WHERE id = ?`, params);
    return Location.findById(id);
  },

  /**
   * Delete location
   */
  delete: async (id) => {
    await query('DELETE FROM locations WHERE id = ?', [id]);
    return true;
  },

  /**
   * Increment view count
   */
  incrementViews: async (id) => {
    await query('UPDATE locations SET view_count = view_count + 1 WHERE id = ?', [id]);
  },

  /**
   * Get published locations
   */
  getPublished: async (options = {}) => {
    const { page = 1, limit = 10, sort = 'display_order', search = null } = options;

    let whereClause = 'l.is_published = 1';
    const params = [];

    // Search functionality
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 2) {
        whereClause += ` AND (
          LOWER(l.name) LIKE LOWER(?)
          OR LOWER(l.description) LIKE LOWER(?)
          OR LOWER(l.short_description) LIKE LOWER(?)
          OR LOWER(l.address) LIKE LOWER(?)
        )`;
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM locations l WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const sortMap = {
      name: 'name ASC',
      views: 'view_count DESC',
      created_at: 'created_at DESC',
      display_order: 'display_order ASC'
    };
    const sortClause = sortMap[sort] || sortMap.display_order;

    const sql = `
      SELECT
        l.*,
        (SELECT COUNT(*) FROM panoramas WHERE location_id = l.id) as panorama_count
      FROM locations l
      WHERE ${whereClause}
      ORDER BY ${sortClause}
      LIMIT ? OFFSET ?
    `;

    const locations = await query(sql, [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);

    return { locations, total, page, limit };
  },

  /**
   * Get all locations (admin)
   */
  getAll: async (options = {}) => {
    const { page = 1, limit = 10, includeUnpublished = true } = options;

    let whereCl = '';
    if (!includeUnpublished) {
      whereCl = 'WHERE is_published = 1';
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM locations ${whereCl}`);
    const total = countResult[0].total;

    const sql = `
      SELECT
        l.*,
        (SELECT COUNT(*) FROM panoramas WHERE location_id = l.id) as panorama_count
      FROM locations l
      ${whereCl}
      ORDER BY display_order ASC, created_at DESC
      LIMIT ? OFFSET ?
    `;

    const locations = await query(sql, [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);

    return { locations, total, page, limit };
  },

  /**
   * Get location with panoramas
   */
  getWithPanoramas: async (id) => {
    const location = await Location.findById(id);
    if (!location) return null;

    const panoramas = await query(
      'SELECT * FROM panoramas WHERE location_id = ? ORDER BY is_primary DESC, display_order ASC',
      [id]
    );

    return { ...location, panoramas };
  }
};

module.exports = Location;
