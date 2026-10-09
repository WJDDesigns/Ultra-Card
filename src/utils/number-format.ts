import type { HomeAssistant } from '../ha/types';

/**
 * Format an entity's state or a provided numeric state using Home Assistant's
 * computeStateDisplay() so that locale, number formatting, and entity-level
 * display precision are respected. Optionally include or strip the unit.
 */
/** For HA versions without hass.formatEntityState (pre-2023.9): number + unit. */
function fallbackStateDisplay(
  hass: HomeAssistant,
  stateObj: { state: string; attributes?: Record<string, any> },
  override?: string | number
): string {
  const state = override !== undefined ? String(override) : stateObj.state;
  const unit = stateObj.attributes?.unit_of_measurement;
  const num = Number(state);
  const text =
    state !== '' && !isNaN(num)
      ? new Intl.NumberFormat(hass.locale?.language || hass.language || undefined).format(num)
      : state;
  return unit ? `${text} ${unit}` : text;
}

export const formatEntityState = (
  hass: HomeAssistant,
  entityId: string,
  options?: { state?: string | number | undefined; includeUnit?: boolean }
): string => {
  const includeUnit = options?.includeUnit !== false;
  const stateObj = hass?.states?.[entityId];
  if (!hass || !stateObj) {
    return options?.state !== undefined ? String(options.state) : '';
  }

  // Prefer HA's native formatter if present (respects per-entity Display Precision)
  const haFormatter = (hass as any).formatEntityState as
    | ((stateObj: any, state?: string) => string)
    | undefined;
  const raw = haFormatter
    ? haFormatter(stateObj, options?.state !== undefined ? String(options.state) : undefined)
    : fallbackStateDisplay(hass, stateObj, options?.state);

  if (includeUnit) return raw;

  // Strip unit if present (only for numeric-style states where unit is appended)
  const unit = (stateObj.attributes as any)?.unit_of_measurement;
  if (unit && typeof raw === 'string') {
    const suffix = ` ${unit}`;
    if (raw.endsWith(suffix)) return raw.slice(0, -suffix.length);
  }
  return raw;
};

/**
 * Convenience wrapper for formatting a plain number using an entity's display precision
 * without the unit by default (use includeUnit=true to append the unit).
 */
export const formatEntityNumber = (
  hass: HomeAssistant,
  entityId: string,
  value: number,
  includeUnit: boolean = false
): string => {
  return formatEntityState(hass, entityId, { state: value, includeUnit });
};
