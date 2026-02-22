const { query, insert } = require('../config/database');

/**
 * Panorama Model
 */
const Panorama = {
  /**
   * Find panorama by ID
   */
  findById: async (id) => {
    const panoramas = await query('SELECT * FROM panoramas WHERE id = ?', [id]);
    return panoramas[0] || null;
  },

  /**
   * Get panoramas by location ID
   */
  getByLocationId: async (locationId) => {
    return query(
      'SELECT * FROM panoramas WHERE location_id = ? ORDER BY is_primary DESC, display_order ASC',
      [locationId]
    );
  },

  /**
   * Get primary panorama for location
   */
  getPrimaryByLocationId: async (locationId) => {
    const panoramas = await query(
      'SELECT * FROM panoramas WHERE location_id = ? AND is_primary = 1 LIMIT 1',
      [locationId]
    );
    return panoramas[0] || null;
  },

  /**
   * Create new panorama
   */
  create: async (panoramaData) => {
    // If this is primary, unset other primaries for this location
    if (panoramaData.is_primary) {
      await query(
        'UPDATE panoramas SET is_primary = 0 WHERE location_id = ?',
        [panoramaData.location_id]
      );
    }

    const sql = `
      INSERT INTO panoramas (
        location_id, title, image_url, thumbnail_url,
        initial_view_angle, is_primary, display_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      panoramaData.location_id,
      panoramaData.title || null,
      panoramaData.image_url,
      panoramaData.thumbnail_url || null,
      panoramaData.initial_view_angle || 0,
      panoramaData.is_primary || false,
      panoramaData.display_order || 0
    ];

    const id = await insert(sql, params);
    return Panorama.findById(id);
  },

  /**
   * Update panorama
   */
  update: async (id, updateData) => {
    const panorama = await Panorama.findById(id);
    if (!panorama) return null;

    // If setting as primary, unset other primaries for this location
    if (updateData.is_primary === true) {
      await query(
        'UPDATE panoramas SET is_primary = 0 WHERE location_id = ? AND id != ?',
        [panorama.location_id, id]
      );
    }

    const allowedFields = [
      'title', 'image_url', 'thumbnail_url',
      'initial_view_angle', 'is_primary', 'display_order'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) return panorama;

    params.push(id);
    await query(`UPDATE panoramas SET ${updates.join(', ')} WHERE id = ?`, params);
    return Panorama.findById(id);
  },

  /**
   * Delete panorama
   */
  delete: async (id) => {
    await query('DELETE FROM panoramas WHERE id = ?', [id]);
    return true;
  },

  /**
   * Get panorama with hotspots
   */
  getWithHotspots: async (id) => {
    const panorama = await Panorama.findById(id);
    if (!panorama) return null;

    const hotspots = await query(
      'SELECT * FROM hotspots WHERE panorama_id = ? ORDER BY id ASC',
      [id]
    );

    return { ...panorama, hotspots };
  },

  /**
   * Count panoramas for location
   */
  countByLocationId: async (locationId) => {
    const result = await query(
      'SELECT COUNT(*) as count FROM panoramas WHERE location_id = ?',
      [locationId]
    );
    return result[0].count;
  }
};

module.exports = Panorama;
