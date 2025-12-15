# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Holiday Planner - a web-based application for syncing holiday plans between multiple people. Uses Animate UI components for polished animations.

## Development Commands

All commands should be run from the `holidayplanner/` subdirectory:

```bash
cd holidayplanner

npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router (React Server Components enabled)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui (new-york style) + Animate UI
- **Animations**: Framer Motion (via Animate UI)
- **State Management**: Zustand with localStorage persistence
- **Dates**: date-fns
- **Theming**: next-themes

## Architecture

- `holidayplanner/app/` - Next.js App Router pages and layouts
- `holidayplanner/components/` - React components
  - `ui/` - Base shadcn/ui components
  - `animate-ui/` - Animate UI components (Dialog, Sheet, Accordion, Popover, etc.)
  - `calendar/` - Calendar view components
  - `trips/` - Trip management components
  - `participants/` - Participant management components
  - `activities/` - Activity management components
  - `layout/` - Header, layout components
  - `providers/` - ThemeProvider
  - `notifications/` - Toast notification container
- `holidayplanner/store/` - Zustand stores (trips, participants, activities, notifications)
- `holidayplanner/types/` - TypeScript type definitions
- `holidayplanner/lib/` - Utility functions

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

## IMPLEMENTATION STATUS (In Progress)

### Completed:
1. **Dependencies installed**: zustand, framer-motion, next-themes, date-fns
2. **Animate UI components installed**: Dialog, Sheet, Accordion, Popover, ThemeToggler, GradientBackground
3. **Base shadcn components installed**: button, input, label, card, badge, avatar, calendar
4. **Types created**: `types/index.ts` - Trip, Participant, Activity, Notification types
5. **Zustand stores created**: trips.ts, participants.ts, activities.ts, notifications.ts
6. **Utility functions**: `lib/utils.ts` (cn, colors), `lib/date-utils.ts` (date formatting, calendar helpers)
7. **Layout components**: ThemeProvider, Header with navigation and ThemeTogglerButton
8. **Root layout updated**: Includes providers, GradientBackground, Header, NotificationContainer
9. **Calendar components**: CalendarView, CalendarHeader, CalendarDay, CalendarTripBadge
10. **Trip components**: TripForm, TripDialog, TripCard, TripDetailsSheet, TripList

### TODO - Continue from here:
1. **Create participant components** (IN PROGRESS):
   - `components/participants/participant-avatar.tsx`
   - `components/participants/participant-form.tsx`
   - `components/participants/participant-list.tsx`
   - `components/participants/participant-popover.tsx`

2. **Create activity components**:
   - `components/activities/activity-card.tsx`
   - `components/activities/activity-form.tsx`
   - `components/activities/activity-dialog.tsx`
   - `components/activities/activity-list.tsx` (uses Accordion)

3. **Update pages**:
   - `app/page.tsx` - Calendar dashboard with TripDialog
   - `app/trips/page.tsx` - All trips list
   - `app/trips/[tripId]/page.tsx` - Trip details
   - `app/participants/page.tsx` - Manage participants

### Data Models (for reference):
```typescript
// Trip: id, name, destination, description, startDate, endDate, participantIds, color
// Participant: id, name, email, avatarUrl, color
// Activity: id, tripId, title, description, date, startTime, endTime, location, category, assignedParticipantIds
```

### Component Usage:
- **Dialog**: Trip/Activity create/edit forms (use `from="bottom"`)
- **Sheet**: Trip details panel (`side="right"`)
- **Accordion**: Activity list grouped by date
- **Popover**: Quick participant add
