# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Indian Stamps Explorer — a full-stack app for browsing, filtering, and managing Indian postage stamps. It has two separate processes that must both be running:

- **Frontend**: React 19 + Vite (port 5173)
- **Backend**: Express + SQLite (port 3001)

## Commands

### Frontend (`indian-stamps-explorer/`)
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Backend (`indian-stamps-explorer/server/`)
```bash
npm start        # Start Express server (node index.js)
```

Both must run simultaneously during development. The frontend hardcodes `http://localhost:3001/api` as the API base URL (in `src/App.jsx`).

## Architecture

### Data Flow
`App.jsx` owns all state and data fetching. It passes data and callbacks down as props — there is no global state manager (no Redux, no Context).

### Frontend Components (`src/components/`)
- **Navbar** — top bar with admin toggle and group cart opener
- **FilterSidebar** — year/type/search filters; drives `App.filters` state
- **StampGallery** / **StampCard** — displays filtered stamps; each card has an "add to group" dropdown
- **GroupCart** — slide-in panel showing all groups and their stamps
- **AdminDashboard** — full CRUD UI for stamps (create/edit/delete with image upload)
- **ShortlistCart** — legacy component, superseded by GroupCart (not currently used in App.jsx)

### Backend (`server/`)
- **`db.js`** — singleton SQLite connection via `sqlite`/`sqlite3`; seeds 60+ stamps on first run using `generateMassiveStampData()`
- **`index.js`** — Express app with three API namespaces:
  - `GET/POST /api/stamps` + `GET /api/filters` — public stamp browsing with year/type/search query params
  - `GET/POST/DELETE /api/groups` + `/api/groups/:id/items` — user-managed stamp groups
  - `GET/POST/PUT/DELETE /api/admin/stamps` + `GET /api/admin/stats` — admin CRUD

### Database Schema (SQLite)
- `stamps` — id, name, year, date, type, imageUrl, description, buyLinks (JSON string)
- `groups` — id, name (UNIQUE)
- `group_items` — id, groupId, stampId (UNIQUE pair, CASCADE on delete)

### Image Handling
- Static stamp images served from `public/images/` via `/images/` route
- Admin-uploaded images stored in `server/uploads/` and served via `/uploads/` route (max 5MB, images only)
- On stamp update/delete, old uploaded files are deleted from disk
