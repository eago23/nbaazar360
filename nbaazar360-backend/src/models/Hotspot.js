const { query, insert } = require('../config/database');

/**
 * Hotspot Model
 */
const Hotspot = {
  /**
   * Find hotspot by ID
   */
  findById: async (id) => {
    const hotspots = await query('SELECT * FROM hotspots WHERE id = ?', [id]);
    return hotspots[0] || null;
  },

  /**
   * Get hotspots by panorama ID
   */
  getByPanoramaId: async (panoramaId) => {
    return query(
      'SELECT * FROM hotspots WHERE panorama_id = ? ORDER BY id ASC',
      [panoramaId]
    );
  },

  /**
   * Create new hotspot
   */
  create: async (hotspotData) => {
    const sql = `
      INSERT INTO hotspots (
        panorama_id, title, description, hotspot_type,
        pitch, yaw, media_url, link_to_panorama_id, link_to_story_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      hotspotData.panorama_id,
      hotspotData.title,
      hotspotData.description || null,
      hotspotData.hotspot_type,
      hotspotData.pitch,
      hotspotData.yaw,
      hotspotData.media_url || null,
      hotspotData.link_to_panorama_id || null,
      hotspotData.link_to_story_id || null
    ];

    const id = await insert(sql, params);
    return Hotspot.findById(id);
  },

  /**
   * Update hotspot
   */
  update: async (id, updateData) => {
    const allowedFields = [
      'title', 'description', 'hotspot_type',
      'pitch', 'yaw', 'media_url', 'link_to_panorama_id', 'link_to_story_id'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) return Hotspot.findById(id);

    params.push(id);
    await query(`UPDATE hotspots SET ${updates.join(', ')} WHERE id = ?`, params);
    return Hotspot.findById(id);
  },

  /**
   * Delete hotspot
   */
  delete: async (id) => {
    await query('DELETE FROM hotspots WHERE id = ?', [id]);
    return true;
  },

  /**
   * Get hotspots by type
   */
  getByType: async (panoramaId, type) => {
    return query(
      'SELECT * FROM hotspots WHERE panorama_id = ? AND hotspot_type = ?',
      [panoramaId, type]
    );
  },

  /**
   * Count hotspots for panorama
   */
  countByPanoramaId: async (panoramaId) => {
    const result = await query(
      'SELECT COUNT(*) as count FROM hotspots WHERE panorama_id = ?',
      [panoramaId]
    );
    return result[0].count;
  }
};

module.exports = Hotspot;
