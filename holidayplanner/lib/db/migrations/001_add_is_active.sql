-- ============================================================================
-- DEPRECATED: This migration is now included in schema.sql
--
-- The main schema.sql script is now idempotent and includes all migrations.
-- You only need to run: psql $DATABASE_URL < lib/db/schema.sql
--
-- This file is kept for historical reference only.
-- ============================================================================

-- Migration: Add is_active column to lobby_users table
-- Run this if you already have the database set up from before

-- Add is_active column with default TRUE
ALTER TABLE lobby_users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Set all existing users to active
UPDATE lobby_users
SET is_active = TRUE
WHERE is_active IS NULL;
