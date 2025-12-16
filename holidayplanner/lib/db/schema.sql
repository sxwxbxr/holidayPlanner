-- ============================================================================
-- Time Sync Database Schema
--
-- This script is idempotent - safe to run multiple times on any database state.
-- It will create missing tables, add missing columns, and set up indexes.
-- ============================================================================

-- Schema version tracking (for future migrations)
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Lobbies table
CREATE TABLE IF NOT EXISTS lobbies (
  code VARCHAR(6) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users in lobbies (base structure)
CREATE TABLE IF NOT EXISTS lobby_users (
  id UUID PRIMARY KEY,
  lobby_code VARCHAR(6) NOT NULL REFERENCES lobbies(code) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time blocks
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY,
  lobby_code VARCHAR(6) NOT NULL REFERENCES lobbies(code) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES lobby_users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MIGRATIONS - Add columns that may be missing from older versions
-- ============================================================================

-- Migration 001: Add is_active column to lobby_users
ALTER TABLE lobby_users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Migration 002: Add last_seen column to lobby_users
ALTER TABLE lobby_users
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Migration 003: Add block_type column to time_blocks (available or busy)
ALTER TABLE time_blocks
ADD COLUMN IF NOT EXISTS block_type VARCHAR(20) DEFAULT 'available';

-- Migration 004: Add user_code column to lobby_users for cross-device auth
ALTER TABLE lobby_users
ADD COLUMN IF NOT EXISTS user_code VARCHAR(8);

-- Migration 005: Add is_all_day column to time_blocks for whole day/multi-day blocks
ALTER TABLE time_blocks
ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- DATA FIXES - Ensure existing data has proper defaults
-- ============================================================================

-- Set is_active = TRUE for any NULL values (from before migration)
UPDATE lobby_users SET is_active = TRUE WHERE is_active IS NULL;

-- Set last_seen = joined_at for any NULL values
UPDATE lobby_users SET last_seen = joined_at WHERE last_seen IS NULL;

-- Set block_type = 'available' for any NULL values (from before migration)
UPDATE time_blocks SET block_type = 'available' WHERE block_type IS NULL;

-- Set is_all_day = FALSE for any NULL values (from before migration)
UPDATE time_blocks SET is_all_day = FALSE WHERE is_all_day IS NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lobby_users_lobby ON lobby_users(lobby_code);
CREATE INDEX IF NOT EXISTS idx_lobby_users_active ON lobby_users(lobby_code, is_active);
CREATE INDEX IF NOT EXISTS idx_lobby_users_code ON lobby_users(lobby_code, user_code);
CREATE INDEX IF NOT EXISTS idx_time_blocks_lobby ON time_blocks(lobby_code);
CREATE INDEX IF NOT EXISTS idx_time_blocks_user ON time_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_time ON time_blocks(start_time, end_time);

-- ============================================================================
-- RECORD SCHEMA VERSION
-- ============================================================================

-- Insert current schema version (upsert pattern)
INSERT INTO schema_version (version, description)
VALUES (2, 'Add is_active and last_seen columns to lobby_users')
ON CONFLICT (version) DO NOTHING;

INSERT INTO schema_version (version, description)
VALUES (3, 'Add block_type to time_blocks and user_code to lobby_users')
ON CONFLICT (version) DO NOTHING;

INSERT INTO schema_version (version, description)
VALUES (4, 'Add is_all_day to time_blocks for whole day and multi-day blocks')
ON CONFLICT (version) DO NOTHING;
