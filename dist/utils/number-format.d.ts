import { HomeAssistant } from 'custom-card-helpers';
/**
 * Format an entity's state or a provided numeric state using Home Assistant's
 * computeStateDisplay() so that locale, number formatting, and entity-level
 * display precision are respected. Optionally include or strip the unit.
 */
export declare const formatEntityState: (hass: HomeAssistant, entityId: string, options?: {
    state?: string | number;
    includeUnit?: boolean;
}) => string;
/**
 * Convenience wrapper for formatting a plain number using an entity's display precision
 * without the unit by default (use includeUnit=true to append the unit).
 */
export declare const formatEntityNumber: (hass: HomeAssistant, entityId: string, value: number, includeUnit?: boolean) => string;
