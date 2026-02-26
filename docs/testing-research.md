# Testing Framework Research Report for Breeze

## 1. Executive Summary

Breeze is a Tauri 2 desktop app with a React/TypeScript frontend and a thin Rust backend. The frontend handles all business logic — widget CRUD, layout management, dashboard operations — via Jotai atoms and direct SQL calls through `@tauri-apps/plugin-sql`. The Rust backend is essentially a shell: it boots Tauri, registers the SQL plugin with migrations, and has **zero custom commands**.

This architecture means the testing strategy should be heavily frontend-weighted. This report evaluates frameworks across three testing layers, then provides a concrete recommendation.

---

## 2. Codebase Analysis

### What needs testing

| Layer | Code | Complexity | Testability |
|---|---|---|---|
| **Pure logic** (`lib/`) | `findWidgetSlot.ts`, `gridConfig.ts`, `widgetTypes.ts` | Low | Trivially unit-testable — zero dependencies on Tauri or DOM |
| **Database layer** (`lib/db.ts`) | 8 async functions (CRUD for dashboards + widgets) | Medium | Requires mocking `@tauri-apps/plugin-sql` |
| **State atoms** (`atoms/index.ts`) | 9 atoms including 1 derived (`activeDashboardAtom`) | Low | Best tested through component behavior, not in isolation |
| **UI components** | `Widget`, `LinkWidget`, `NotesWidget`, `AddWidgetsModal`, `Toast` | Medium | Render tests with React Testing Library |
| **Feature views** | `Dashboard`, `Sidebar`, `Topbar` | High | Complex: drag-drop, grid layout, inline editing |
| **Rust backend** (`src-tauri/src/lib.rs`) | ~28 lines, no custom commands | None | Nothing to unit-test on the Rust side today |

### Key interaction flows worth testing

1. **Dashboard CRUD**: Create view → appears in sidebar → becomes active
2. **Widget lifecycle**: Add widget (slot-finding) → render on grid → close widget → removed
3. **Dashboard rename**: Click edit → type new name → save on blur/Enter → persisted
4. **Sidebar reorder**: Drag dashboard items → new order persisted
5. **Grid layout persistence**: Move/resize widgets → debounced save → reload restores positions
6. **Edge cases**: Full grid → toast shown; empty state → default dashboard created

---

## 3. Framework Evaluation

### Layer 1: Frontend Unit & Integration Tests

| Framework | Fit for Breeze | Pros | Cons |
|---|---|---|---|
| **Vitest + React Testing Library** | **Excellent** | Native Vite integration (zero config overhead); fast HMR-aware watch mode; built-in mocking (`vi.mock`); jsdom environment; Jest-compatible API; first-class TypeScript | Requires mocking `@tauri-apps/plugin-sql` and `@tauri-apps/api` |
| Jest + RTL | Adequate | Mature ecosystem; large community | Requires separate bundler config; ESM support still awkward; no Vite integration; slower than Vitest |
| Bun test runner | Poor | Fast | Immature; limited mocking; no RTL integration; poor jsdom support |

**Verdict: Vitest + React Testing Library** is the clear winner. The project already uses Vite, so Vitest plugs in with near-zero config. RTL's philosophy of "test as the user would" aligns perfectly with testing Jotai-backed components without coupling to atom internals.

#### What to mock

- **`@tauri-apps/plugin-sql`**: Mock the `Database` class and its `.select()` / `.execute()` methods. This is the primary integration boundary.
- **`crypto.randomUUID()`**: jsdom lacks WebCrypto; provide a deterministic stub for reproducible widget IDs.
- No Tauri IPC mocking needed (`@tauri-apps/api/mocks` `mockIPC`) because Breeze doesn't use `invoke()` — all backend communication goes through the SQL plugin directly.

#### What to test at this layer

| Category | Examples | Priority |
|---|---|---|
| Pure functions | `findFirstAvailableSlot` with various layouts; `getDefaultMetadata` | P0 |
| DB layer (mocked) | `createDashboard`, `upsertWidgets`, `deleteDashboard` call correct SQL | P1 |
| Component rendering | `Widget` shows title, close button only in edit mode; `NotesWidget` updates atom on input; `LinkWidget` renders URL | P1 |
| Feature integration | `AddWidgetsModal` → select type → calls `onSelect`; `Topbar` rename flow | P2 |

### Layer 2: End-to-End Tests

| Framework | Fit for Breeze | Pros | Cons |
|---|---|---|---|
| **WebdriverIO + tauri-driver** | **Good (official)** | Officially supported by Tauri; tests the real compiled app; WebDriver standard; CI-friendly with `xvfb-run` on Linux | Requires building the app first (slow); limited to WebDriver API (no direct DOM access); macOS not supported; setup complexity |
| Selenium + tauri-driver | Adequate | Also officially supported; wider language bindings | Heavier setup; Java dependency; WebdriverIO is more ergonomic |
| Playwright | **Not viable** | Best-in-class DX for web apps | Cannot connect to Tauri's WebKitGTK webview; no native Tauri support; only works for Electron apps |
| Cypress | Not viable | Good DX for web E2E | Same limitation as Playwright — cannot target Tauri windows |

**Verdict: WebdriverIO + tauri-driver** is the only viable E2E framework for Tauri desktop apps. However, E2E tests are expensive (require full build + launch), so they should be used sparingly for critical user flows.

#### What to test at this layer

| Flow | Priority |
|---|---|
| App launches and shows default dashboard | P0 |
| Add a Notes widget, type text, verify it appears | P1 |
| Add a Link widget, verify it renders | P1 |
| Create a new view, switch between views | P2 |
| Delete a widget in edit mode | P2 |

### Layer 3: Rust Backend Tests

| Approach | Fit for Breeze | Notes |
|---|---|---|
| `cargo test` with `tauri::test::mock_context` | **Not needed today** | The Rust layer has no custom commands, no business logic — it only wires up plugins. Testing would be testing Tauri's own plugin system. |
| Future consideration | Worth adding when custom Tauri commands are introduced | Use `tauri::test::mock_builder()` to create a mock app and call commands directly. |

**Verdict**: Skip Rust tests entirely for now. Revisit when custom `#[tauri::command]` functions are added.

---

## 4. Recommendation

### Implement in two phases

#### Phase 1: Vitest + React Testing Library (implement first)

This gives the highest ROI — fast feedback loop, tests the majority of the business logic, runs in CI without a display server.

**Setup:**
```
bun add -d vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Config** (in `vite.config.ts`):
```ts
/// <reference types="vitest/config" />
// add to defineConfig:
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: false,
}
```

**Test file structure:**
```
src/
├── test/
│   ├── setup.ts           # jsdom setup, crypto mock, cleanup
│   └── mocks/
│       └── tauri-sql.ts   # Mock for @tauri-apps/plugin-sql
├── lib/
│   ├── findWidgetSlot.test.ts    # Pure logic tests
│   ├── widgetTypes.test.ts       # Pure logic tests
│   └── db.test.ts                # DB layer with mocked SQL plugin
├── components/
│   ├── Widget/
│   │   ├── Widget.test.tsx
│   │   ├── NotesWidget.test.tsx
│   │   └── LinkWidget.test.tsx
│   ├── AddWidgetsModal.test.tsx
│   └── Toast.test.tsx
└── features/
    ├── Topbar.test.tsx
    └── Sidebar.test.tsx
```

**Suggested `package.json` scripts:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Priority order for writing tests:**
1. `findWidgetSlot.test.ts` — pure function, zero mocking, validates slot-finding algorithm including edge cases (full grid, single slot remaining, various widget sizes)
2. `widgetTypes.test.ts` — pure function, validates default metadata generation
3. `db.test.ts` — mock `Database`, verify correct SQL strings and parameters
4. `Widget.test.tsx`, `NotesWidget.test.tsx`, `LinkWidget.test.tsx` — component rendering and interaction
5. `AddWidgetsModal.test.tsx` — modal open/close, widget type selection callback
6. `Toast.test.tsx` — appearance/disappearance timing
7. `Topbar.test.tsx` — rename flow, add widget flow
8. `Sidebar.test.tsx` — dashboard selection, add view

#### Phase 2: WebdriverIO E2E (implement second, optional for early stage)

This is higher-effort and should only be added once the app stabilizes. It provides confidence that the full stack (Rust + webview + SQLite) works correctly.

**Setup:**
```
mkdir e2e && cd e2e
bun init
bun add @wdio/cli @wdio/local-runner @wdio/mocha-framework @wdio/spec-reporter
```

Also install system dependencies:
```
cargo install tauri-driver --locked
# Ensure WebKitWebDriver is available on Linux
```

**Run:**
```
# Build the app first
bun tauri build --debug

# Run E2E tests (headless on Linux)
xvfb-run bun --cwd e2e test
```

**Note:** E2E tests require a full Tauri build (~2-3 min), so they're best suited for CI pipelines rather than rapid local iteration.

---

## 5. What NOT to implement

| Approach | Why skip |
|---|---|
| Storybook | Overkill for 5 components; no design system to document |
| Playwright/Cypress | Cannot connect to Tauri's WebKitGTK webview |
| Rust backend tests | No custom commands to test |
| Snapshot tests | Fragile for a UI that's still evolving; prefer behavioral assertions |
| Testing Jotai atoms in isolation | Test through component behavior instead (per Jotai's own guidance) |

---

## 6. CI Integration

For GitHub Actions, a minimal CI workflow would look like:

```yaml
jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run test        # Vitest unit/integration
      - run: npx tsc --noEmit    # Type checking

  test-e2e:  # Optional, gated on Phase 2
    runs-on: ubuntu-latest
    steps:
      - # ... install Rust, system deps, bun
      - run: bun tauri build --debug
      - run: xvfb-run bun --cwd e2e test
```

---

## 7. Summary

| Layer | Framework | Priority | Effort | ROI |
|---|---|---|---|---|
| Unit + Integration (frontend) | **Vitest + RTL** | **P0 — implement first** | Low (~1 day) | High |
| E2E (full stack) | **WebdriverIO + tauri-driver** | P1 — implement later | Medium (~1-2 days) | Medium |
| Rust backend | cargo test | P2 — when needed | N/A today | N/A |

**Start with Vitest + React Testing Library.** It covers the most code with the least effort, integrates natively with the existing Vite toolchain, and provides fast feedback during development. Add WebdriverIO E2E tests once the app reaches a stable feature set.
