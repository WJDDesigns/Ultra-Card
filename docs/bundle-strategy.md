# Bundle size and CI policy

## Current behavior

- **Production artifact:** `dist/ultra-card.js` (webpack production build).
- **CI / release:** After `npm run release:check`, workflows run a **bundle size check** that measures `dist/ultra-card.js` with `stat` and emits a **GitHub Actions warning** if the file exceeds **8 MiB** (8 388 608 bytes). The job does **not** fail the build on oversize.
- **Rationale:** Oversize is treated as a **signal** (mobile download, parse cost) while avoiding brittle CI breaks from small fluctuations. Tightening to **fail** is a deliberate product decision when the team agrees on a budget and remediation path (more lazy chunks, dependency trims, etc.).

## Chunk strategy (high level)

- **Core entry** loads the card shell, editor, and shared utilities.
- **Lazy modules** are split into async chunks loaded by the module registry when a layout references a given module type (see `uc-module-preload-scheduler` for optional background preloads).
- When adding heavy dependencies, prefer **dynamic `import()`** at the module boundary so the main chunk stays bounded.

## Changing the policy

1. Edit `.github/workflows/ci.yml` and `.github/workflows/build.yml` — the `Bundle size check` step.
2. To **fail** on oversize, replace `echo "::warning::..."` with `exit 1` (and optionally adjust the threshold).
3. Keep this document in sync with the threshold and fail/warn choice.
