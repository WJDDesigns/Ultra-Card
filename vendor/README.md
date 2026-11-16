# Vendored runtime files

Files here are published to GitHub Pages (`https://wjddesigns.github.io/Ultra-Card/`)
by `.github/workflows/vendor-pages.yml`, so the card can load them from an
origin this project controls instead of a public CDN (issue #280).

Each package lives under `<name>/<version>/` and never changes once published:
a new version gets a new folder. The workflow refuses to deploy unless every
file matches its `SHA256SUMS` and is byte-identical to the file in the
published npm package.

| Path | Package | Used by |
| --- | --- | --- |
| `open-meteo/weather-map-layer/0.3.0/` | `@openmeteo/weather-map-layer@0.3.0` (`dist/`) | Rain Radar weather layers (`src/services/uc-open-meteo-layer.ts`) |

Open-Meteo granted Ultra Card permission to use and bundle this package under
MIT; see THIRD_PARTY_NOTICES.md.

## Adding a version

1. `npm pack @openmeteo/weather-map-layer@X.Y.Z && tar xzf *.tgz`
2. Copy the runtime files from `package/dist/` (`index.mjs`, `worker.js`,
   `om_file_format.web.mjs`, `om_file_format.web.wasm`,
   `leaflet-pbf-worker.mjs`) and `LICENSE` into `open-meteo/weather-map-layer/X.Y.Z/`.
3. `sha256sum index.mjs worker.js om_file_format.web.mjs om_file_format.web.wasm leaflet-pbf-worker.mjs > SHA256SUMS`
4. Add the version to the workflow's package check, bump
   `OPEN_METEO_LAYER_VERSION`, and merge. Pages must deploy before a release
   that uses the new version goes out.
