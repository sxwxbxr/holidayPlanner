-- Migration: Add is_active column to lobby_users table
-- Run this if you already have the database set up from before

-- Add is_active column with default TRUE
ALTER TABLE lobby_users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Set all existing users to active
UPDATE lobby_users
SET is_active = TRUE
WHERE is_active IS NULL;

-- Verify the migration
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'lobby_users'
  AND column_name = 'is_active';
