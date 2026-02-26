# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # Install dependencies
bun tauri dev        # Run in development mode (starts Vite + Tauri)
bun run build        # Build frontend (tsc + vite build)
bun tauri build      # Build desktop app bundle
```

There are no test commands configured.

## Architecture

Breeze is a Tauri 2 desktop app — a React frontend communicates with a Rust backend via the Tauri bridge. The app stores all data in a local SQLite database via `@tauri-apps/plugin-sql`.

### Key design decisions

- **No custom Rust commands** — the SQL plugin is used directly from the frontend. All database operations are in `src/lib/db.ts`.
- **Jotai for state** — atoms are defined in `src/atoms/index.ts`. The `dbAtom` holds the SQLite connection; `layoutAtom` and `widgetMetadataAtom` hold the current dashboard's widget state.
- **Debounced persistence** — `Dashboard.tsx` debounces writes (300ms) triggered by both layout changes (drag/resize) and metadata changes (e.g. note typing). `upsertWidgets()` always receives the full layout + metadata together.
- **Widget metadata in atoms** — widget content (URL, notes text) lives in `widgetMetadataAtom` keyed by widget ID. It's loaded from DB on dashboard switch (via `getWidgets`) and persisted on any change.
- **Widget registry** — `src/lib/widgetRegistry.ts` is the stable registry infrastructure. `src/lib/widgetTypes.tsx` registers the built-in types ("link", "notes") and is imported as a side-effect in `main.tsx`. **Adding a new widget type = create one component + one `register()` call in `widgetTypes.tsx`.**
- **Free-form grid** — `react-grid-layout` is configured without collision forcing; `src/lib/findWidgetSlot.ts` handles finding open slots when adding widgets.

### Data flow

1. `App.tsx` initializes the DB, loads dashboards, and creates a default one if none exist.
2. `Sidebar.tsx` manages dashboard selection and reordering (`@dnd-kit`).
3. `Topbar.tsx` handles edit mode toggle, dashboard rename, and widget creation.
4. `Dashboard.tsx` renders the `react-grid-layout` grid, loads widgets when `activeDashboardIdAtom` changes, and persists layout changes.
5. Widgets are rendered via the `renderWidget()` factory in `src/components/Widget/index.tsx`, which looks up the widget type in the registry and renders the registered component wrapped in the `Widget` frame.

### Database schema

Two tables managed via migrations in `src-tauri/migrations/`:
- `dashboards` — id, name, sort_order, created_at, updated_at
- `widgets` — id, dashboard_id, x, y, w, h, type, title, data (JSON), created_at

`upsertWidgets()` does a full replace: deletes all widgets for a dashboard then re-inserts from the current layout state.

### Grid constants (`src/lib/gridConfig.ts`)

- 32 columns × 18 rows, 8px gap, 8px padding
- Default widget size: 2×2

### Path alias

`@/` resolves to `src/` (configured in `vite.config.ts`).
