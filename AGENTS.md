# AGENTS.md

## Cursor Cloud specific instructions

**Breeze** is a Tauri 2 desktop app (React + Rust). All dev commands are documented in `CLAUDE.md` and `README.md`.

### Running the app

- Start with `DISPLAY=:1 bun tauri dev`. The Xvfb display at `:1` is pre-configured in the Cloud VM.
- First Rust compilation takes ~60-80s; subsequent incremental builds are faster.
- The `libEGL warning: DRI3 error` message on startup is harmless — the app renders fine via software rendering on the virtual display.
- There are no automated tests configured in this repository (`CLAUDE.md` confirms this).
- No linter is configured beyond TypeScript checking (`bun run build` runs `tsc && vite build`).

### Gotchas

- The Rust toolchain must be **stable latest** (>= 1.85) due to transitive crate dependencies requiring `edition2024`. The VM's pre-installed toolchain was pinned to 1.83; the update script handles this via `rustup default stable`.
- Bun must be on `$PATH` — it installs to `~/.bun/bin`. Source `~/.bashrc` or export the path before running commands.
