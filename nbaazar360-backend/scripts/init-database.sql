-- ============================================
-- N'BAZAAR360 DATABASE SCHEMA
-- Run this script to create all tables
-- ============================================

-- Set UTF-8 encoding for this session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- Drop and recreate database with proper charset
DROP DATABASE IF EXISTS nbaazar360;
CREATE DATABASE nbaazar360 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nbaazar360;

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS event_attendance;
DROP TABLE IF EXISTS analytics_site_visits;
DROP TABLE IF EXISTS analytics_views;
DROP TABLE IF EXISTS media_files;
DROP TABLE IF EXISTS hotspots;
DROP TABLE IF EXISTS panoramas;
DROP TABLE IF EXISTS ar_stories;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS locations;

-- ============================================
-- LOCATIONS TABLE
-- ============================================
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address VARCHAR(255),
    thumbnail_url VARCHAR(500),
    is_published BOOLEAN DEFAULT false,
    view_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_published (is_published),
    INDEX idx_order (display_order)
);

-- ============================================
-- USERS TABLE (Admins, Vendors, Guests)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    -- Authentication (login credentials)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Public identity
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,

    -- User type and status
    role ENUM('admin', 'vendor', 'guest') DEFAULT 'vendor',
    status ENUM('pending', 'active', 'rejected', 'suspended') DEFAULT 'pending',

    -- Vendor-specific fields
    business_name VARCHAR(255) UNIQUE,
    business_description TEXT,
    phone VARCHAR(50),
    business_type ENUM('artisan', 'shop', 'restaurant', 'cafe', 'service'),
    address VARCHAR(500),
    location_id INT,

    -- Vendor profile content
    about TEXT,
    contact_info TEXT,

    -- Vendor verification (approval workflow)
    id_document_url VARCHAR(500),
    stall_photo_url VARCHAR(500),
    rejection_reason TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,

    -- Terms & Conditions
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP NULL,

    -- Vendor profile media
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),

    -- Activity tracking
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_business_name (business_name),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Add foreign key for locations.created_by after users table exists
ALTER TABLE locations ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- PANORAMAS TABLE (360° Images)
-- ============================================
CREATE TABLE panoramas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL,
    title VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    initial_view_angle INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location (location_id),
    INDEX idx_primary (is_primary)
);

-- ============================================
-- AR STORIES TABLE
-- ============================================
CREATE TABLE ar_stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    artisan_name VARCHAR(255) NOT NULL,
    profession VARCHAR(255) NOT NULL,
    short_bio VARCHAR(500),
    full_story TEXT,
    thumbnail_url VARCHAR(500),
    video_url VARCHAR(500),
    duration_seconds INT,
    location_id INT,
    vendor_id INT,

    -- QR Code System
    is_primary_story BOOLEAN DEFAULT false,
    qr_code_url VARCHAR(500),

    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    view_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_vendor (vendor_id),
    INDEX idx_primary (is_primary_story, vendor_id),
    INDEX idx_featured (is_featured),
    INDEX idx_published (is_published)
);

-- ============================================
-- HOTSPOTS TABLE
-- ============================================
CREATE TABLE hotspots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    panorama_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    hotspot_type ENUM('info', 'navigation', 'media', 'story') NOT NULL,
    pitch DECIMAL(5, 2) NOT NULL,
    yaw DECIMAL(6, 2) NOT NULL,
    media_url VARCHAR(500),
    link_to_panorama_id INT,
    link_to_story_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (panorama_id) REFERENCES panoramas(id) ON DELETE CASCADE,
    FOREIGN KEY (link_to_panorama_id) REFERENCES panoramas(id) ON DELETE SET NULL,
    FOREIGN KEY (link_to_story_id) REFERENCES ar_stories(id) ON DELETE SET NULL,
    INDEX idx_panorama (panorama_id),
    INDEX idx_type (hotspot_type)
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    event_type ENUM('festival', 'workshop', 'exhibition', 'performance', 'market') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location_id INT,
    venue_name VARCHAR(255),
    thumbnail_url VARCHAR(500),
    banner_url VARCHAR(500),
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    max_participants INT,
    registration_required BOOLEAN DEFAULT false,
    registration_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_type (event_type),
    INDEX idx_published (is_published)
);

-- ============================================
-- MEDIA FILES TABLE
-- ============================================
CREATE TABLE media_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'video', 'audio', 'document', 'panorama') NOT NULL,
    mime_type VARCHAR(100),
    file_size_kb INT,
    width INT,
    height INT,
    uploaded_by INT,
    entity_type VARCHAR(50),
    entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_type (file_type)
);

-- ============================================
-- ANALYTICS VIEWS TABLE
-- ============================================
CREATE TABLE analytics_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('location', 'story', 'event', 'panorama', 'vendor') NOT NULL,
    entity_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_date (viewed_at)
);

-- ============================================
-- ANALYTICS SITE VISITS TABLE
-- ============================================
CREATE TABLE analytics_site_visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (visited_at)
);

-- ============================================
-- EVENT ATTENDANCE TABLE
-- ============================================
CREATE TABLE event_attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    attended_count INT DEFAULT 0,
    notes TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_event (event_id)
);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
CREATE TABLE site_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Database schema created successfully!' as status;
SHOW TABLES;
