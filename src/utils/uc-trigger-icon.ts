import { UcAlignment, ucAlignmentToJustify } from './uc-alignment';

export type UcTriggerIconBackground = 'none' | 'circle' | 'rounded-square';

export const UC_TRIGGER_ICON_SIZE_DEFAULT = 24;
export const UC_TRIGGER_ICON_BACKGROUND_PADDING_DEFAULT = 8;

export interface UcTriggerIconChrome {
  iconSize?: number | undefined;
  iconColor?: string | undefined;
  background?: UcTriggerIconBackground | undefined;
  backgroundColor?: string | undefined;
  backgroundPadding?: number | undefined;
}

/**
 * Full-width flex row so left/center/right actually move a shrink-to-content
 * trigger. `inline-flex` + `width: auto` made Popup "Rechts" a no-op.
 */
export function ucTriggerAlignStyle(
  alignment?: UcAlignment,
  fallback: UcAlignment = 'center'
): string {
  const justify = ucAlignmentToJustify(alignment ?? fallback);
  return `display: flex; justify-content: ${justify}; width: 100%; pointer-events: auto; box-sizing: border-box;`;
}

/**
 * Background well behind a trigger icon (Popup icon trigger / Drawer Icon Only).
 * `none` paints no well — callers that still need a fill (legacy Drawer circle)
 * keep that on their own element.
 */
export function ucTriggerIconChromeStyle(chrome: UcTriggerIconChrome = {}): string {
  const background = chrome.background || 'none';
  const parts = ['display: inline-flex', 'align-items: center', 'justify-content: center'];
  if (background !== 'none') {
    parts.push(
      `background: ${chrome.backgroundColor || 'var(--secondary-background-color)'}`,
      `padding: ${chrome.backgroundPadding ?? UC_TRIGGER_ICON_BACKGROUND_PADDING_DEFAULT}px`,
      background === 'circle' ? 'border-radius: 50%' : 'border-radius: var(--uc-r-8, 8px)'
    );
  }
  return parts.join('; ');
}

export function ucTriggerIconGlyphStyle(
  chrome: UcTriggerIconChrome = {},
  defaults?: { size?: number; color?: string }
): string {
  const size = chrome.iconSize ?? defaults?.size ?? UC_TRIGGER_ICON_SIZE_DEFAULT;
  const color = chrome.iconColor || defaults?.color || 'var(--primary-color)';
  return `--mdc-icon-size: ${size}px; color: ${color}; display: flex;`;
}

/**
 * Intrinsic box for an icon trigger when Design tab width/height are empty.
 * Sized from the glyph (+ well padding when a shape is set).
 */
export function ucTriggerIconIntrinsicPx(
  chrome: UcTriggerIconChrome = {},
  fallbackPx: number = UC_TRIGGER_ICON_SIZE_DEFAULT
): number {
  if (chrome.iconSize != null && chrome.iconSize > 0) {
    const shaped = !!chrome.background && chrome.background !== 'none';
    const pad = shaped
      ? (chrome.backgroundPadding ?? UC_TRIGGER_ICON_BACKGROUND_PADDING_DEFAULT) * 2
      : 0;
    return chrome.iconSize + pad;
  }
  return fallbackPx;
}
