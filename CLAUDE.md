# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Time Sync** - A real-time availability coordination app where friends can sync their free time blocks through lobby-based sessions. Users create or join lobbies via codes, mark when they're available, and see overlapping free time to coordinate hangouts or gaming sessions.

## Development Commands

All commands should be run from the `holidayplanner/` subdirectory:

```bash
cd holidayplanner

npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Important**: Before running, set up your Neon database (see Setup section below).

## Tech Stack

- **Framework**: Next.js 16 with App Router (React Server Components enabled)
- **Language**: TypeScript (strict mode)
- **Database**: Neon (Serverless Postgres)
- **Real-time**: SWR with 3-second polling
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui (new-york style) + Animate UI
- **Animations**: Framer Motion (via Animate UI)
- **State Management**: Zustand with localStorage persistence
- **Dates**: date-fns
- **Theming**: next-themes

## Setup

### 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string

### 2. Configure Environment Variables

Create `.env.local` file:
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. Run Database Schema

The schema script is idempotent - safe to run on fresh or existing databases:
```bash
psql $DATABASE_URL < lib/db/schema.sql
```

This will create tables if missing, add any new columns, and set up indexes.

### 4. Start Development Server

```bash
npm run dev
```

## Architecture

- `holidayplanner/app/` - Next.js App Router pages and layouts
  - `page.tsx` - Landing/join page
  - `lobby/[code]/page.tsx` - Lobby room with calendar
  - `api/lobbies/` - API routes for lobby operations
    - `route.ts` - Create lobby
    - `[code]/route.ts` - Get lobby state
    - `[code]/join/route.ts` - Join lobby
    - `[code]/link/route.ts` - Link device using user code
    - `[code]/leave/route.ts` - Leave lobby
    - `[code]/blocks/route.ts` - Add time block
    - `[code]/blocks/[id]/route.ts` - Update/delete block
- `holidayplanner/components/` - React components
  - `ui/` - Base shadcn/ui components
  - `animate-ui/` - Animate UI components (Dialog, Sheet, Accordion, Popover, etc.)
  - `lobby/` - Lobby join/info components
  - `timeblocks/` - Time block form and dialog
  - `layout/` - Header, layout components
  - `providers/` - ThemeProvider
  - `notifications/` - Toast notification container
- `holidayplanner/lib/` - Utility functions and hooks
  - `db/` - Database connection and schema
  - `hooks/use-lobby.ts` - SWR hook for lobby data with polling
- `holidayplanner/store/` - Zustand stores (lobby, notifications)
- `holidayplanner/types/` - TypeScript type definitions

## Path Aliases

Use `@/` to import from the `holidayplanner/` root:
- `@/components` - Components
- `@/components/ui` - shadcn/ui components
- `@/store` - Zustand stores
- `@/types` - TypeScript types
- `@/lib` - Utilities

## Adding Animate UI Components

```bash
npx shadcn@latest add "https://animate-ui.com/r/components-[category]-[name].json"
```

Example: `npx shadcn@latest add "https://animate-ui.com/r/components-radix-dialog.json"`

---

## IMPLEMENTATION STATUS

### ✅ CORE IMPLEMENTATION COMPLETE

**Time Sync** - Real-time availability coordination app

**Implemented Features:**

1. **Backend Infrastructure**:
   - Neon serverless Postgres database
   - Next.js API routes for CRUD operations
   - SWR with 3-second polling for real-time-like updates
   - Persistent data storage

2. **Lobby System**:
   - Create lobbies with auto-generated 6-character codes
   - Join lobbies via code sharing
   - Persistent lobby state across sessions
   - Multi-user support (unlimited per lobby)
   - Lobby info with all users

3. **Time Block Management**:
   - Add/edit/delete time blocks
   - **Block types**: "Available" (when you're free) or "Busy" (when you can't meet)
   - Delete blocks from day timeline view (only own blocks)
   - Time range selection (start/end times)
   - Optional titles and descriptions
   - Auto-sync every 3 seconds
   - Immediate refresh after mutations
   - Busy blocks shown in red with different styling

4. **Calendar View**:
   - Monthly calendar with time blocks
   - Color-coded by user
   - Overlap detection (highlighted when multiple users are free)
   - Clickable days open detailed timeline dialog
   - Day timeline shows hour-by-hour availability
   - Overlapping time periods highlighted in timeline
   - Responsive grid layout
   - Navigate months

5. **User Session Management**:
   - Persistent user sessions (rejoining doesn't create duplicates)
   - Users marked as inactive when leaving (not deleted)
   - Explicit "Leave Lobby" button
   - Automatic reactivation when rejoining
   - User history preserved in database
   - **Cross-device authentication**: Each user gets a unique 8-character device code
   - "Link Device" feature to sync as the same user on multiple devices (phone, PC, etc.)

6. **UI/UX**:
   - Clean landing page with create/join options
   - Loading/synced status indicators
   - Theme switching (light/dark/system)
   - Animate UI for smooth transitions
   - Toast notifications
   - Mobile browser compatibility with UUID fallback

**Data Models:**
```typescript
// Lobby: code, name, users[], timeBlocks[]
// User: id, name, color, isActive, userCode
// TimeBlock: id, userId, startTime, endTime, blockType, title, description
// BlockType: "available" | "busy"
```

**Recent Updates:**
- ✅ **Block types**: Time blocks can now be "Available" or "Busy"
- ✅ **Cross-device authentication**: Link your phone and PC as the same user
- ✅ Device code shown in Lobby Info section
- ✅ "Link Device" option on home page
- ✅ Calendar uses Monday-first week layout
- ✅ Day timeline dialog with overlapping time detection
- ✅ Delete availability blocks from timeline (only own blocks)
- ✅ User session persistence (no duplicate users on rejoin)
- ✅ Inactive user status instead of deletion
- ✅ Leave Lobby button
- ✅ Mobile browser UUID generation fallback

### Next Steps (Optional Enhancements):
- Week view for detailed time blocks
- Export availability to calendar formats (iCal, Google Calendar)
- Recurring availability blocks
- Private/public time blocks
- Push notifications for overlaps
- Mobile app (React Native)

### Environment Variables:
```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### Database Schema:
- **schema_version**: version (PK), applied_at, description - tracks schema version
- **lobbies**: code (PK), name, created_at
- **lobby_users**: id (PK), lobby_code (FK), name, color, is_active, user_code, joined_at, last_seen
- **time_blocks**: id (PK), lobby_code (FK), user_id (FK), start_time, end_time, block_type, title, description, created_at, updated_at

**Note**: The schema script (`lib/db/schema.sql`) is idempotent and can be run on any database state. It handles fresh installs and upgrades automatically.

### Component Usage:
- **Dialog**: Time block forms (use `from="bottom"`)
- **DayTimelineDialog**: Shows daily timeline with overlaps and delete functionality
- **useLobby hook**: SWR-based data fetching with auto-polling, includes leaveLobby function
- **LobbyStore**: Local state management with Zustand
- **generateUUID()**: Cross-browser UUID generation with fallback for mobile
