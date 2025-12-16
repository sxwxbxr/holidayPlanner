-- Lobbies table
CREATE TABLE IF NOT EXISTS lobbies (
  code VARCHAR(6) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users in lobbies
CREATE TABLE IF NOT EXISTS lobby_users (
  id UUID PRIMARY KEY,
  lobby_code VARCHAR(6) NOT NULL REFERENCES lobbies(code) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lobby_users_lobby ON lobby_users(lobby_code);
CREATE INDEX IF NOT EXISTS idx_time_blocks_lobby ON time_blocks(lobby_code);
CREATE INDEX IF NOT EXISTS idx_time_blocks_user ON time_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_time ON time_blocks(start_time, end_time);
