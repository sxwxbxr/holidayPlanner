-- Time Sync Database Initialization Script
-- Run this in your Neon SQL Editor to set up all tables

-- Drop existing tables if you want a fresh start (OPTIONAL - comment out if not needed)
-- DROP TABLE IF EXISTS time_blocks CASCADE;
-- DROP TABLE IF EXISTS lobby_users CASCADE;
-- DROP TABLE IF EXISTS lobbies CASCADE;

-- =====================================================
-- 1. LOBBIES TABLE
-- =====================================================
-- Stores lobby information
CREATE TABLE IF NOT EXISTS lobbies (
  code VARCHAR(6) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. LOBBY USERS TABLE
-- =====================================================
-- Stores users who have joined lobbies
CREATE TABLE IF NOT EXISTS lobby_users (
  id UUID PRIMARY KEY,
  lobby_code VARCHAR(6) NOT NULL REFERENCES lobbies(code) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. TIME BLOCKS TABLE
-- =====================================================
-- Stores availability time blocks created by users
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

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================
-- Index on lobby_users for faster lookup by lobby
CREATE INDEX IF NOT EXISTS idx_lobby_users_lobby ON lobby_users(lobby_code);

-- Index on time_blocks for faster lookup by lobby
CREATE INDEX IF NOT EXISTS idx_time_blocks_lobby ON time_blocks(lobby_code);

-- Index on time_blocks for faster lookup by user
CREATE INDEX IF NOT EXISTS idx_time_blocks_user ON time_blocks(user_id);

-- Index on time_blocks for faster time-based queries
CREATE INDEX IF NOT EXISTS idx_time_blocks_time ON time_blocks(start_time, end_time);

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================
-- Check that all tables were created successfully
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('lobbies', 'lobby_users', 'time_blocks')
ORDER BY table_name;

-- Check indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('lobbies', 'lobby_users', 'time_blocks')
ORDER BY tablename, indexname;
