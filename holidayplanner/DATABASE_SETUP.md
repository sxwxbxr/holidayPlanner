# Database Setup Guide

## Quick Start

Run the initialization script to create all necessary tables.

### Option 1: Neon SQL Editor (Recommended)

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click **SQL Editor** in the sidebar
4. Copy the entire contents of `lib/db/init.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Verify you see success messages

### Option 2: Using psql Command Line

```bash
# From the holidayplanner directory
psql $DATABASE_URL -f lib/db/init.sql
```

Or if you have the connection string directly:
```bash
psql "postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require" -f lib/db/init.sql
```

### Option 3: Copy-Paste for Quick Testing

Just copy this into Neon SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS lobbies (
  code VARCHAR(6) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lobby_users (
  id UUID PRIMARY KEY,
  lobby_code VARCHAR(6) NOT NULL REFERENCES lobbies(code) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_lobby_users_lobby ON lobby_users(lobby_code);
CREATE INDEX IF NOT EXISTS idx_time_blocks_lobby ON time_blocks(lobby_code);
CREATE INDEX IF NOT EXISTS idx_time_blocks_user ON time_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_time ON time_blocks(start_time, end_time);
```

## Verify Setup

After running the script, verify tables were created:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('lobbies', 'lobby_users', 'time_blocks');

-- Should return 3 rows
```

## Database Schema

### Tables Overview

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `lobbies` | Stores lobby sessions | code (PK), name, created_at |
| `lobby_users` | Users in lobbies | id (PK), lobby_code (FK), name, color |
| `time_blocks` | Availability blocks | id (PK), lobby_code (FK), user_id (FK), start_time, end_time |

### Relationships

```
lobbies (1) ──< (many) lobby_users
lobbies (1) ──< (many) time_blocks
lobby_users (1) ──< (many) time_blocks
```

### Indexes

- `idx_lobby_users_lobby` - Fast lookup of users by lobby
- `idx_time_blocks_lobby` - Fast lookup of blocks by lobby
- `idx_time_blocks_user` - Fast lookup of blocks by user
- `idx_time_blocks_time` - Fast time-based queries

## Troubleshooting

### Error: "permission denied for schema public"

Your database user needs CREATE permissions. In Neon SQL Editor:
```sql
GRANT CREATE ON SCHEMA public TO neondb_owner;
```

### Error: "relation already exists"

Tables already exist. Either:
1. Drop and recreate: Uncomment the DROP statements in `init.sql`
2. Or ignore - tables are already set up

### Reset Everything (Careful!)

To completely reset and start fresh:
```sql
DROP TABLE IF EXISTS time_blocks CASCADE;
DROP TABLE IF EXISTS lobby_users CASCADE;
DROP TABLE IF EXISTS lobbies CASCADE;
```

Then run the initialization script again.

## Next Steps

After database setup:
1. Ensure `DATABASE_URL` is set in `.env.local`
2. Add `DATABASE_URL` to Vercel environment variables
3. Run `npm run dev` to start the app
4. Create a lobby to test database connectivity
