const { query, insert } = require('../config/database');
const { generateUniqueSlug } = require('../utils/slugify');

/**
 * AR Story Model
 */
const Story = {
  /**
   * Find story by ID
   */
  findById: async (id) => {
    const stories = await query('SELECT * FROM ar_stories WHERE id = ?', [id]);
    return stories[0] || null;
  },

  /**
   * Find story by slug
   */
  findBySlug: async (slug) => {
    const stories = await query('SELECT * FROM ar_stories WHERE slug = ?', [slug]);
    return stories[0] || null;
  },

  /**
   * Check if slug exists
   */
  slugExists: async (slug) => {
    const stories = await query('SELECT id FROM ar_stories WHERE slug = ?', [slug]);
    return stories.length > 0;
  },

  /**
   * Create new story
   */
  create: async (storyData) => {
    // Auto-generate title from artisan_name if not provided
    const title = storyData.title || storyData.artisan_name || 'Untitled Story';
    const slug = await generateUniqueSlug(title, Story.slugExists);

    const sql = `
      INSERT INTO ar_stories (
        title, slug, artisan_name, profession, short_bio, full_story,
        thumbnail_url, video_url, duration_seconds, location_id, vendor_id,
        is_primary_story, is_featured, is_published, display_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      title,
      slug,
      storyData.artisan_name,
      storyData.profession || '',
      storyData.short_bio || '',
      storyData.full_story || '',
      storyData.thumbnail_url || null,
      storyData.video_url || null,
      storyData.duration_seconds || null,
      storyData.location_id || null,
      storyData.vendor_id || null,
      storyData.is_primary_story || false,
      storyData.is_featured || false,
      storyData.is_published !== false, // Default to true
      storyData.display_order || 0
    ];

    const id = await insert(sql, params);
    return Story.findById(id);
  },

  /**
   * Update story
   */
  update: async (id, updateData) => {
    const allowedFields = [
      'title', 'artisan_name', 'profession', 'short_bio', 'full_story',
      'thumbnail_url', 'video_url', 'duration_seconds', 'location_id',
      'is_primary_story', 'qr_code_url', 'is_featured', 'is_published', 'display_order'
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
        const existing = await query('SELECT id FROM ar_stories WHERE slug = ? AND id != ?', [slug, id]);
        return existing.length > 0;
      });
      updates.push('slug = ?');
      params.push(newSlug);
    }

    if (updates.length === 0) return Story.findById(id);

    params.push(id);
    await query(`UPDATE ar_stories SET ${updates.join(', ')} WHERE id = ?`, params);
    return Story.findById(id);
  },

  /**
   * Delete story
   */
  delete: async (id) => {
    await query('DELETE FROM ar_stories WHERE id = ?', [id]);
    return true;
  },

  /**
   * Delete all stories by vendor ID
   */
  deleteByVendorId: async (vendorId) => {
    await query('DELETE FROM ar_stories WHERE vendor_id = ?', [vendorId]);
    return true;
  },

  /**
   * Increment view count
   */
  incrementViews: async (id) => {
    await query('UPDATE ar_stories SET view_count = view_count + 1 WHERE id = ?', [id]);
  },

  /**
   * Set story as primary for vendor
   */
  setPrimary: async (id, vendorId) => {
    // Unset other primaries for this vendor
    await query(
      'UPDATE ar_stories SET is_primary_story = 0 WHERE vendor_id = ?',
      [vendorId]
    );

    // Set this story as primary
    await query(
      'UPDATE ar_stories SET is_primary_story = 1 WHERE id = ?',
      [id]
    );

    return Story.findById(id);
  },

  /**
   * Update QR code URL
   */
  updateQRCode: async (id, qrCodeUrl) => {
    await query('UPDATE ar_stories SET qr_code_url = ? WHERE id = ?', [qrCodeUrl, id]);
    return Story.findById(id);
  },

  /**
   * Get published stories
   */
  getPublished: async (options = {}) => {
    const {
      page = 1,
      limit = 10,
      featured = null,
      location_id = null,
      vendor_id = null,
      search = null
    } = options;

    let sql = `SELECT * FROM ar_stories WHERE is_published = 1`;
    const params = [];

    if (featured === true) {
      sql += ` AND is_featured = 1`;
    }

    if (location_id) {
      sql += ` AND location_id = ?`;
      params.push(location_id);
    }

    if (vendor_id) {
      sql += ` AND vendor_id = ?`;
      params.push(vendor_id);
    }

    // Search functionality
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 2) {
        sql += ` AND (
          LOWER(title) LIKE LOWER(?)
          OR LOWER(artisan_name) LIKE LOWER(?)
          OR LOWER(profession) LIKE LOWER(?)
          OR LOWER(short_bio) LIKE LOWER(?)
          OR LOWER(full_story) LIKE LOWER(?)
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
    sql += ` ORDER BY is_featured DESC, display_order ASC, created_at DESC`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const stories = await query(sql, params);

    return { stories, total, page, limit };
  },

  /**
   * Get all stories (admin)
   */
  getAll: async (options = {}) => {
    const { page = 1, limit = 10 } = options;

    const countResult = await query('SELECT COUNT(*) as total FROM ar_stories');
    const total = countResult[0].total;

    const sql = `
      SELECT s.*, u.username as vendor_username, u.business_name
      FROM ar_stories s
      LEFT JOIN users u ON s.vendor_id = u.id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const stories = await query(sql, [limit, (page - 1) * limit]);

    return { stories, total, page, limit };
  },

  /**
   * Get stories by vendor ID
   */
  getByVendorId: async (vendorId) => {
    return query(
      'SELECT * FROM ar_stories WHERE vendor_id = ? ORDER BY is_primary_story DESC, created_at DESC',
      [vendorId]
    );
  },

  /**
   * Get primary story for vendor
   */
  getPrimaryByVendorId: async (vendorId) => {
    const stories = await query(
      'SELECT * FROM ar_stories WHERE vendor_id = ? AND is_primary_story = 1 LIMIT 1',
      [vendorId]
    );
    return stories[0] || null;
  },

  /**
   * Get story with location and vendor info (by slug)
   */
  getFullStory: async (slug) => {
    const sql = `
      SELECT
        s.*,
        l.name as location_name,
        l.slug as location_slug,
        u.username as vendor_username,
        u.business_name as vendor_business_name
      FROM ar_stories s
      LEFT JOIN locations l ON s.location_id = l.id
      LEFT JOIN users u ON s.vendor_id = u.id
      WHERE s.slug = ?
    `;
    const stories = await query(sql, [slug]);
    return stories[0] || null;
  },

  /**
   * Get story with location and vendor info (by ID)
   */
  getFullStoryById: async (id) => {
    const sql = `
      SELECT
        s.*,
        l.name as location_name,
        l.slug as location_slug,
        u.username as vendor_username,
        u.business_name as vendor_business_name
      FROM ar_stories s
      LEFT JOIN locations l ON s.location_id = l.id
      LEFT JOIN users u ON s.vendor_id = u.id
      WHERE s.id = ?
    `;
    const stories = await query(sql, [id]);
    return stories[0] || null;
  }
};

module.exports = Story;
