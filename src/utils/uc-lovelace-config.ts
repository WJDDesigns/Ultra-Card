import { findActiveLovelacePanel } from '../services/uc-sections-layout-service';

/**
 * Minimal Lovelace config shape HA's nested card pickers need.
 *
 * `hui-card-picker` (used by Conditional, Vertical Stack, Grid, …) requires a
 * `lovelace` property typed as `LovelaceConfig` and calls
 * `computeUsedEntities(this.lovelace)`, which walks `config.views`. Without
 * this, the Card tab renders an empty bordered box and cards cannot be added.
 */
export type LovelaceConfigLike = {
  views: unknown[];
  [key: string]: unknown;
};

const EMPTY_LOVELACE_CONFIG: LovelaceConfigLike = { views: [] };

function asLovelaceConfig(value: unknown): LovelaceConfigLike | null {
  if (!value || typeof value !== 'object') return null;
  const views = (value as { views?: unknown }).views;
  return Array.isArray(views) ? (value as LovelaceConfigLike) : null;
}

/**
 * Resolve a LovelaceConfig for native HA card editors embedded in Ultra Card.
 *
 * `hass.lovelace` is not how HA exposes the dashboard config, so relying on it
 * leaves nested card pickers blank. Prefer the active panel, then common DOM
 * fallbacks, then an empty `{ views: [] }` so the picker can still render.
 */
export function resolveEditorLovelaceConfig(): LovelaceConfigLike {
  if (typeof document === 'undefined') {
    return EMPTY_LOVELACE_CONFIG;
  }

  const fromActivePanel = asLovelaceConfig(
    (findActiveLovelacePanel() as { lovelace?: { config?: unknown } } | null)?.lovelace?.config
  );
  if (fromActivePanel) return fromActivePanel;

  const panel = document.querySelector('ha-panel-lovelace') as {
    lovelace?: { config?: unknown };
    _lovelace?: { config?: unknown };
  } | null;
  const fromPanel = asLovelaceConfig(panel?.lovelace?.config ?? panel?._lovelace?.config);
  if (fromPanel) return fromPanel;

  const fromHa = asLovelaceConfig(
    (document.querySelector('home-assistant') as { lovelace?: { config?: unknown } } | null)
      ?.lovelace?.config
  );
  if (fromHa) return fromHa;

  return EMPTY_LOVELACE_CONFIG;
}
