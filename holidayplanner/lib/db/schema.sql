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

-- ============================================================================
-- DATA FIXES - Ensure existing data has proper defaults
-- ============================================================================

-- Set is_active = TRUE for any NULL values (from before migration)
UPDATE lobby_users SET is_active = TRUE WHERE is_active IS NULL;

-- Set last_seen = joined_at for any NULL values
UPDATE lobby_users SET last_seen = joined_at WHERE last_seen IS NULL;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lobby_users_lobby ON lobby_users(lobby_code);
CREATE INDEX IF NOT EXISTS idx_lobby_users_active ON lobby_users(lobby_code, is_active);
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
