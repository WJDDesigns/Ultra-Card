/**
 * Card-chrome surface tokens. The button-like surface map that used to live
 * here moved to `uc-surface-recipes.ts` (role `control`); the old names are
 * re-exported so existing imports keep working.
 */

import {
  getControlSurfaceStyles,
  getControlSurfaceStyleString,
  UC_CONTROL_RECIPES,
  type UcControlSurfaceOptions,
  type UcSurfaceRecipe,
} from './uc-surface-recipes';

/** @deprecated use `UcSurfaceRecipe` */
export type UcButtonSurfaceStyle = Exclude<UcSurfaceRecipe, 'dashed' | 'dots' | 'minimal'>;
/** @deprecated use `UC_CONTROL_RECIPES` */
export const UC_BUTTON_SURFACE_STYLES: readonly UcButtonSurfaceStyle[] = UC_CONTROL_RECIPES as readonly UcButtonSurfaceStyle[];
/** @deprecated use `UcControlSurfaceOptions` */
export type UcButtonSurfaceOptions = UcControlSurfaceOptions;
/** @deprecated use `getControlSurfaceStyles` */
export const getButtonSurfaceStyles = getControlSurfaceStyles;
/** @deprecated use `getControlSurfaceStyleString` */
export const getButtonSurfaceStyleString = getControlSurfaceStyleString;

/**
 * Surface-level CSS tokens a theme exposes on the card host as `--uc-*`
 * variables. Modules and the card chrome read these as defaults.
 */
export interface UcSurfaceTokens {
  background: string;
  border: string;
  shadow: string;
  backdropFilter: string;
}

export function getSurfaceTokens(
  surface: string | undefined,
  opts: { blur?: number | undefined; borderWidth?: number | undefined; borderColor?: string | undefined; shadow?: string | undefined }
): UcSurfaceTokens {
  const blur = opts.blur ?? 12;
  const bw = opts.borderWidth;
  const bc = opts.borderColor;
  const border = (fallbackWidth: number, fallbackColor: string) =>
    `${bw ?? fallbackWidth}px solid ${bc ?? fallbackColor}`;

  switch (surface) {
    case 'glass':
      return {
        background: 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.05)',
        border: border(1, 'rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.12)'),
        shadow: opts.shadow ?? '0 8px 24px rgba(0, 0, 0, 0.18)',
        backdropFilter: `blur(${blur}px) saturate(160%)`,
      };
    case 'neumorphic':
      return {
        background: 'var(--card-background-color, var(--ha-card-background, white))',
        border: border(0, 'transparent'),
        shadow:
          opts.shadow ??
          '6px 6px 14px rgba(0, 0, 0, 0.14), -6px -6px 14px rgba(255, 255, 255, 0.08)',
        backdropFilter: 'none',
      };
    case 'glossy':
      return {
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0)), var(--card-background-color, var(--ha-card-background, white))',
        border: border(0, 'transparent'),
        shadow: opts.shadow ?? '0 4px 16px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'none',
      };
    case 'outline':
      return {
        background: 'transparent',
        border: border(1, 'var(--divider-color)'),
        shadow: opts.shadow ?? 'none',
        backdropFilter: 'none',
      };
    case 'minimal':
      return {
        background: 'transparent',
        border: border(0, 'transparent'),
        shadow: opts.shadow ?? 'none',
        backdropFilter: 'none',
      };
    case 'flat':
    default:
      return {
        background: 'var(--card-background-color, var(--ha-card-background, white))',
        border: border(1, 'var(--divider-color)'),
        shadow: opts.shadow ?? 'none',
        backdropFilter: 'none',
      };
  }
}
