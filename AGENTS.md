# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Breeze is a Tauri 2 desktop app (React + Rust) for customizable widget dashboards. See `README.md` for run commands.

### Services
| Service | Command | Notes |
|---|---|---|
| Full app (Vite + Tauri) | `bun tauri dev` | Starts Vite on port 1420 and compiles/launches the Rust backend |
| Frontend only | `bun run dev` | Vite dev server on port 1420 (no native window) |

### Gotchas
- **Rust version**: The project requires Rust ≥1.85 (the `home` crate needs edition 2024). Run `rustup update stable && rustup default stable` if `cargo check` fails with `feature edition2024 is required`.
- **Tauri system deps on Linux**: Requires `libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libssl-dev`, `libxdo-dev`. Install with `sudo apt-get install -y libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev libxdo-dev build-essential`.
- **Display required**: This is a desktop app. Ensure `DISPLAY=:1` (or a valid X display) is set when running `bun tauri dev`.
- **No test framework**: There are no automated tests configured (no vitest, jest, or playwright). TypeScript type checking via `npx tsc --noEmit` is the only lint/check available.
- **First Rust build is slow**: Initial `cargo build` for `src-tauri` takes ~1-2 minutes. Subsequent incremental builds are fast.
- **SQLite is embedded**: No external database server needed. The `tauri-plugin-sql` manages `breeze.db` automatically with migrations on app start.
- **Package manager**: Uses Bun (lockfile: `bun.lock`). Do not use npm/yarn/pnpm.
