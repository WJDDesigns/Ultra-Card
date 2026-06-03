import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import { TemplateService } from '../services/template-service';
import { preprocessTemplateVariables } from './uc-template-processor';
import { containsTemplate } from './uc-action-template-renderer';
import {
  parseUnifiedTemplate,
  hasTemplateError,
  isStringResult,
  UnifiedTemplateResult,
} from './template-parser';
import { parseTemplateColorResult } from './uc-template-color-result';

/** Card-level fields that may contain inline Jinja when unified template mode is off. */
export const CARD_INLINE_TEMPLATE_FIELDS = [
  'card_background',
  'card_border_color',
  'card_shadow_color',
] as const;

export type CardInlineTemplateField = (typeof CARD_INLINE_TEMPLATE_FIELDS)[number];

export interface ResolvedCardAppearance {
  card_background?: string | undefined;
  card_border_radius?: number | undefined;
  card_border_color?: string | undefined;
  card_border_width?: number | undefined;
  card_padding?: number | undefined;
  card_shadow_enabled?: boolean | undefined;
  card_shadow_color?: string | undefined;
  card_shadow_horizontal?: number | undefined;
  card_shadow_vertical?: number | undefined;
  card_shadow_blur?: number | undefined;
  card_shadow_spread?: number | undefined;
}

function hashTemplateString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function getCardInstanceScope(config: UltraCardConfig | undefined): string {
  const id = (config as any)?.__ucInstanceId;
  if (id && String(id).trim() !== '') return String(id).trim();
  return 'card_unknown';
}

export function buildCardUnifiedTemplateKey(
  instanceScope: string,
  processedTemplate: string
): string {
  return `unified_card_${instanceScope}_${hashTemplateString(processedTemplate)}`;
}

export function buildCardFieldTemplateKey(
  field: CardInlineTemplateField,
  instanceScope: string,
  processedTemplate: string
): string {
  return `card_field_${field}_${instanceScope}_${hashTemplateString(processedTemplate)}`;
}

function coerceNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.trim());
    if (isFinite(parsed)) return parsed;
  }
  return undefined;
}

function coerceBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return undefined;
}

function applyUnifiedCardTemplate(
  parsed: UnifiedTemplateResult,
  resolved: ResolvedCardAppearance
): void {
  if (hasTemplateError(parsed)) return;

  if (isStringResult(parsed) && parsed.content) {
    const color = parseTemplateColorResult(parsed.content, parsed.content);
    if (color) resolved.card_background = color;
    return;
  }

  if (parsed.card_background !== undefined) {
    resolved.card_background = parseTemplateColorResult(
      parsed.card_background,
      parsed.card_background
    );
  }
  if (parsed.card_border_color !== undefined) {
    resolved.card_border_color = parseTemplateColorResult(
      parsed.card_border_color,
      parsed.card_border_color
    );
  }
  if (parsed.card_shadow_color !== undefined) {
    resolved.card_shadow_color = parseTemplateColorResult(
      parsed.card_shadow_color,
      parsed.card_shadow_color
    );
  }

  const radius = coerceNumber(parsed.card_border_radius);
  if (radius !== undefined) resolved.card_border_radius = radius;

  const borderWidth = coerceNumber(parsed.card_border_width);
  if (borderWidth !== undefined) resolved.card_border_width = borderWidth;

  const padding = coerceNumber(parsed.card_padding);
  if (padding !== undefined) resolved.card_padding = padding;

  const shadowEnabled = coerceBoolean(parsed.card_shadow_enabled);
  if (shadowEnabled !== undefined) resolved.card_shadow_enabled = shadowEnabled;

  const shadowHorizontal = coerceNumber(parsed.card_shadow_horizontal);
  if (shadowHorizontal !== undefined) resolved.card_shadow_horizontal = shadowHorizontal;

  const shadowVertical = coerceNumber(parsed.card_shadow_vertical);
  if (shadowVertical !== undefined) resolved.card_shadow_vertical = shadowVertical;

  const shadowBlur = coerceNumber(parsed.card_shadow_blur);
  if (shadowBlur !== undefined) resolved.card_shadow_blur = shadowBlur;

  const shadowSpread = coerceNumber(parsed.card_shadow_spread);
  if (shadowSpread !== undefined) resolved.card_shadow_spread = shadowSpread;
}

function readInlineTemplateValue(
  hass: HomeAssistant | undefined,
  templateKey: string,
  fallback: string | undefined,
  isColorField: boolean
): string | undefined {
  const raw = hass?.__uvc_template_strings?.[templateKey];
  if (raw === undefined || raw === null) return fallback;
  const rendered = String(raw).trim();
  if (!rendered) return fallback;
  return isColorField ? parseTemplateColorResult(rendered, fallback || rendered) : rendered;
}

/**
 * Register card-level unified and inline field template subscriptions.
 */
export function registerCardAppearanceTemplateSubscriptions(
  config: UltraCardConfig | undefined,
  hass: HomeAssistant | undefined,
  templateService: TemplateService | null | undefined,
  onUpdate: () => void
): void {
  if (!config || !hass || !templateService) return;

  const instanceScope = getCardInstanceScope(config);

  if (config.card_unified_template_mode && config.card_unified_template) {
    const processed = preprocessTemplateVariables(config.card_unified_template, hass, config);
    const templateKey = buildCardUnifiedTemplateKey(instanceScope, processed);
    templateService.subscribeToTemplate(processed, templateKey, onUpdate, {}, config);
  }

  if (!config.card_unified_template_mode) {
    for (const field of CARD_INLINE_TEMPLATE_FIELDS) {
      const rawValue = config[field];
      if (!containsTemplate(rawValue)) continue;
      const processed = preprocessTemplateVariables(rawValue, hass, config);
      const templateKey = buildCardFieldTemplateKey(field, instanceScope, processed);
      templateService.subscribeToTemplate(processed, templateKey, onUpdate, {}, config);
    }
  }
}

/**
 * Resolve effective card appearance values from static config plus template results.
 * Unified template (when enabled) takes precedence over static values for keys it returns.
 * Inline field templates apply when unified mode is off.
 */
export function resolveCardAppearance(
  config: UltraCardConfig | undefined,
  hass: HomeAssistant | undefined
): ResolvedCardAppearance {
  if (!config) return {};

  const resolved: ResolvedCardAppearance = {
    card_background: config.card_background,
    card_border_radius: config.card_border_radius,
    card_border_color: config.card_border_color,
    card_border_width: config.card_border_width,
    card_padding: config.card_padding,
    card_shadow_enabled: config.card_shadow_enabled,
    card_shadow_color: config.card_shadow_color,
    card_shadow_horizontal: config.card_shadow_horizontal,
    card_shadow_vertical: config.card_shadow_vertical,
    card_shadow_blur: config.card_shadow_blur,
    card_shadow_spread: config.card_shadow_spread,
  };

  if (!hass) return resolved;

  const instanceScope = getCardInstanceScope(config);

  if (config.card_unified_template_mode && config.card_unified_template) {
    const processed = preprocessTemplateVariables(config.card_unified_template, hass, config);
    const templateKey = buildCardUnifiedTemplateKey(instanceScope, processed);
    const raw = hass?.__uvc_template_strings?.[templateKey];
    if (raw !== undefined && raw !== null) {
      applyUnifiedCardTemplate(parseUnifiedTemplate(raw), resolved);
    }
  } else {
    for (const field of CARD_INLINE_TEMPLATE_FIELDS) {
      const rawValue = config[field];
      if (!containsTemplate(rawValue)) continue;
      const processed = preprocessTemplateVariables(rawValue!, hass, config);
      const templateKey = buildCardFieldTemplateKey(field, instanceScope, processed);
      resolved[field] = readInlineTemplateValue(
        hass,
        templateKey,
        config[field],
        true
      );
    }
  }

  return resolved;
}

/**
 * Build CSS style string for card container from resolved appearance values.
 */
export function buildCardContainerStyleFromAppearance(
  appearance: ResolvedCardAppearance,
  options?: {
    includeDefaultBackground?: boolean | undefined;
    includeDefaultRadius?: boolean | undefined;
    includeDefaultPadding?: boolean | undefined;
    defaultBorderWidth?: number | undefined;
    defaultBorderColor?: string | undefined;
    requirePositiveBorderWidth?: boolean | undefined;
  }
): string {
  const styles: string[] = [];
  const includeDefaultBackground = options?.includeDefaultBackground ?? false;
  const includeDefaultRadius = options?.includeDefaultRadius ?? false;
  const includeDefaultPadding = options?.includeDefaultPadding ?? false;
  const defaultBorderWidth = options?.defaultBorderWidth ?? 1;
  const defaultBorderColor = options?.defaultBorderColor ?? 'var(--divider-color)';
  const requirePositiveBorderWidth = options?.requirePositiveBorderWidth ?? false;

  if (appearance.card_background) {
    styles.push(`background: ${appearance.card_background}`);
  } else if (includeDefaultBackground) {
    styles.push(`background: var(--card-background-color, var(--ha-card-background, white))`);
  }

  if (appearance.card_border_radius !== undefined) {
    styles.push(`border-radius: ${appearance.card_border_radius}px`);
  } else if (includeDefaultRadius) {
    styles.push(`border-radius: 12px`);
  }

  if (appearance.card_border_color || appearance.card_border_width !== undefined) {
    const borderWidth =
      appearance.card_border_width !== undefined ? appearance.card_border_width : defaultBorderWidth;
    const borderColor = appearance.card_border_color || defaultBorderColor;
    if (!requirePositiveBorderWidth || borderWidth > 0) {
      styles.push(`border: ${borderWidth}px solid ${borderColor}`);
    }
  }

  if (appearance.card_padding !== undefined) {
    styles.push(`padding: ${appearance.card_padding}px`);
  } else if (includeDefaultPadding) {
    styles.push(`padding: 16px`);
  }

  if (appearance.card_shadow_enabled) {
    const shadowColor = appearance.card_shadow_color || 'rgba(0, 0, 0, 0.15)';
    const horizontal = appearance.card_shadow_horizontal ?? 0;
    const vertical = appearance.card_shadow_vertical ?? 2;
    const blur = appearance.card_shadow_blur ?? 8;
    const spread = appearance.card_shadow_spread ?? 0;
    styles.push(`box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${shadowColor}`);
  }

  return styles.join('; ');
}
