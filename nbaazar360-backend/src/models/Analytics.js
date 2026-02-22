const { query, insert } = require('../config/database');

/**
 * Analytics Model
 */
const Analytics = {
  /**
   * Track content view
   */
  trackView: async (viewData) => {
    const sql = `
      INSERT INTO analytics_views (
        entity_type, entity_id, ip_address, user_agent, referrer, viewed_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      viewData.entity_type,
      viewData.entity_id,
      viewData.ip_address || null,
      viewData.user_agent || null,
      viewData.referrer || null
    ];

    return insert(sql, params);
  },

  /**
   * Track site visit (homepage)
   */
  trackSiteVisit: async (visitData) => {
    const sql = `
      INSERT INTO analytics_site_visits (
        ip_address, user_agent, visited_at
      ) VALUES (?, ?, NOW())
    `;

    const params = [
      visitData.ip_address || null,
      visitData.user_agent || null
    ];

    return insert(sql, params);
  },

  /**
   * Get total site visitors
   */
  getTotalVisitors: async () => {
    const result = await query('SELECT COUNT(*) as total FROM analytics_site_visits');
    return result[0].total;
  },

  /**
   * Get total views
   */
  getTotalViews: async () => {
    const result = await query('SELECT COUNT(*) as total FROM analytics_views');
    return result[0].total;
  },

  /**
   * Get views for entity
   */
  getEntityViews: async (entityType, entityId) => {
    const result = await query(
      'SELECT COUNT(*) as count FROM analytics_views WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );
    return result[0].count;
  },

  /**
   * Get views by entity type
   */
  getViewsByType: async (entityType) => {
    const result = await query(
      'SELECT COUNT(*) as count FROM analytics_views WHERE entity_type = ?',
      [entityType]
    );
    return result[0].count;
  },

  /**
   * Get views within date range
   */
  getViewsInRange: async (startDate, endDate, entityType = null, entityId = null) => {
    let sql = `
      SELECT DATE(viewed_at) as date, COUNT(*) as views
      FROM analytics_views
      WHERE viewed_at BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (entityType) {
      sql += ` AND entity_type = ?`;
      params.push(entityType);
    }

    if (entityId) {
      sql += ` AND entity_id = ?`;
      params.push(entityId);
    }

    sql += ` GROUP BY DATE(viewed_at) ORDER BY date ASC`;

    return query(sql, params);
  },

  /**
   * Get top viewed entities
   */
  getTopViewed: async (entityType, limit = 10) => {
    const sql = `
      SELECT entity_id, COUNT(*) as views
      FROM analytics_views
      WHERE entity_type = ?
      GROUP BY entity_id
      ORDER BY views DESC
      LIMIT ?
    `;

    return query(sql, [entityType, limit]);
  },

  /**
   * Get dashboard summary
   */
  getSummary: async () => {
    // Total visitors (site visits)
    const totalVisitors = await Analytics.getTotalVisitors();

    // Total views
    const totalViews = await Analytics.getTotalViews();

    // Active stories count
    const storiesResult = await query(
      'SELECT COUNT(*) as count FROM ar_stories WHERE is_published = 1'
    );
    const activeStories = storiesResult[0].count;

    // Active vendors count
    const vendorsResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'vendor' AND status = 'active'`
    );
    const activeVendors = vendorsResult[0].count;

    // Locations count
    const locationsResult = await query(
      'SELECT COUNT(*) as count FROM locations WHERE is_published = 1'
    );
    const locationsCount = locationsResult[0].count;

    // Events count (upcoming)
    const eventsResult = await query(
      'SELECT COUNT(*) as count FROM events WHERE is_published = 1 AND start_date >= CURDATE()'
    );
    const eventsCount = eventsResult[0].count;

    // Views trend (current month vs last month)
    const currentMonthViews = await query(`
      SELECT COUNT(*) as count FROM analytics_views
      WHERE MONTH(viewed_at) = MONTH(CURDATE()) AND YEAR(viewed_at) = YEAR(CURDATE())
    `);
    const lastMonthViews = await query(`
      SELECT COUNT(*) as count FROM analytics_views
      WHERE MONTH(viewed_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND YEAR(viewed_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    `);

    const currentCount = currentMonthViews[0].count;
    const lastCount = lastMonthViews[0].count;
    let viewsTrend = '0%';
    if (lastCount > 0) {
      const change = ((currentCount - lastCount) / lastCount) * 100;
      viewsTrend = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    }

    // Top vendors (by story views)
    const topVendors = await query(`
      SELECT
        u.username, u.business_name,
        COALESCE(SUM(s.view_count), 0) as views
      FROM users u
      LEFT JOIN ar_stories s ON s.vendor_id = u.id
      WHERE u.role = 'vendor' AND u.status = 'active'
      GROUP BY u.id
      ORDER BY views DESC
      LIMIT 5
    `);

    // Top locations
    const topLocations = await query(`
      SELECT name, view_count as views
      FROM locations
      WHERE is_published = 1
      ORDER BY view_count DESC
      LIMIT 5
    `);

    // Popular stories
    const popularStories = await query(`
      SELECT title, view_count as views
      FROM ar_stories
      WHERE is_published = 1
      ORDER BY view_count DESC
      LIMIT 5
    `);

    return {
      total_visitors: totalVisitors,
      total_views: totalViews,
      active_stories: activeStories,
      active_vendors: activeVendors,
      locations_count: locationsCount,
      events_count: eventsCount,
      views_trend: viewsTrend,
      top_vendors: topVendors,
      top_locations: topLocations,
      popular_stories: popularStories
    };
  },

  /**
   * Get vendor analytics
   */
  getVendorAnalytics: async (vendorId = null) => {
    let sql = `
      SELECT
        u.id, u.username, u.business_name,
        COALESCE((
          SELECT COUNT(*) FROM analytics_views
          WHERE entity_type = 'vendor' AND entity_id = u.id
        ), 0) as profile_views,
        COALESCE(SUM(s.view_count), 0) as story_views,
        COUNT(s.id) as story_count
      FROM users u
      LEFT JOIN ar_stories s ON s.vendor_id = u.id
      WHERE u.role = 'vendor' AND u.status = 'active'
    `;
    const params = [];

    if (vendorId) {
      sql += ` AND u.id = ?`;
      params.push(vendorId);
    }

    sql += ` GROUP BY u.id ORDER BY story_views DESC`;

    const vendors = await query(sql, params);

    // Add total views
    return vendors.map((v) => ({
      ...v,
      total_views: v.profile_views + v.story_views
    }));
  },

  /**
   * Get vendor's own analytics
   */
  getVendorOwnAnalytics: async (vendorId) => {
    // Profile views
    const profileViewsResult = await query(
      `SELECT COUNT(*) as count FROM analytics_views WHERE entity_type = 'vendor' AND entity_id = ?`,
      [vendorId]
    );
    const profileViews = profileViewsResult[0].count;

    // Story views
    const storyViewsResult = await query(
      `SELECT COALESCE(SUM(view_count), 0) as count FROM ar_stories WHERE vendor_id = ?`,
      [vendorId]
    );
    const storyViews = storyViewsResult[0].count;

    // Views this month
    const monthViewsResult = await query(`
      SELECT COUNT(*) as count FROM analytics_views
      WHERE entity_type = 'vendor' AND entity_id = ?
        AND MONTH(viewed_at) = MONTH(CURDATE()) AND YEAR(viewed_at) = YEAR(CURDATE())
    `, [vendorId]);
    const viewsThisMonth = monthViewsResult[0].count;

    // Popular stories
    const popularStories = await query(
      `SELECT title, view_count as views FROM ar_stories WHERE vendor_id = ? ORDER BY view_count DESC LIMIT 5`,
      [vendorId]
    );

    return {
      profile_views: profileViews,
      story_views: storyViews,
      total_views: profileViews + storyViews,
      views_this_month: viewsThisMonth,
      popular_stories: popularStories
    };
  }
};

module.exports = Analytics;
