-- Migration: Update event_type column to support Albanian categories
-- Run this script once to update the database schema and existing data

-- Step 1: Change ENUM to VARCHAR to support Albanian characters
ALTER TABLE events
MODIFY COLUMN event_type VARCHAR(50) NOT NULL;

-- Step 2: Update existing events to new category values
-- Map old English values to new Albanian categories
UPDATE events SET event_type = 'Festival' WHERE event_type = 'festival';
UPDATE events SET event_type = 'Workshop' WHERE event_type = 'workshop';
UPDATE events SET event_type = 'Ekspozitë & Art' WHERE event_type = 'exhibition';
UPDATE events SET event_type = 'Teatër & Performancë' WHERE event_type = 'performance';
UPDATE events SET event_type = 'Treg & Artizanat' WHERE event_type = 'market';

-- Verify the migration
SELECT id, title, event_type FROM events;
