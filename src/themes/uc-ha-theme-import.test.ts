import { describe, it, expect } from 'vitest';
import { flattenHaTheme, haThemeToUcTheme, listHaThemes, resolveHaVar } from './uc-ha-theme-import';
import { sanitizeThemeDefinition } from './uc-theme-validate';

const mushroom = {
  'primary-color': '#03a9f4',
  'accent-color': 'var(--primary-color)',
  'card-background-color': '#1c1c1c',
  'ha-card-background': 'var(--card-background-color)',
  'primary-text-color': '#e1e1e1',
  'secondary-text-color': 'rgba(225, 225, 225, 0.7)',
  'divider-color': 'rgba(255, 255, 255, 0.12)',
  'ha-card-border-radius': '24px',
  'ha-card-border-width': '0',
  'ha-card-box-shadow': '0 2px 4px rgba(0,0,0,0.3)',
  'primary-font-family': 'Roboto, sans-serif',
};

describe('listHaThemes', () => {
  it('lists installed themes sorted, flagging light/dark modes', () => {
    const list = listHaThemes({
      themes: { themes: { Zed: {}, Alpha: { modes: { light: {}, dark: {} } } } },
    });
    expect(list).toEqual([
      { name: 'Alpha', hasModes: true },
      { name: 'Zed', hasModes: false },
    ]);
  });
});

describe('resolveHaVar', () => {
  it('resolves references within the theme, keeps unknown ones', () => {
    const vars = { a: 'var(--b)', b: '#fff', c: 'var(--missing, red)' };
    expect(resolveHaVar('var(--a)', vars)).toBe('#fff');
    expect(resolveHaVar('var(--missing)', vars)).toBe('var(--missing)');
    expect(resolveHaVar('var(--c)', vars)).toBe('red');
  });

  it('does not loop on self references', () => {
    expect(resolveHaVar('var(--a)', { a: 'var(--a)' })).toBe('var(--a)');
  });
});

describe('flattenHaTheme', () => {
  it('overlays the picked mode on the base record', () => {
    const rec = {
      'primary-color': 'red',
      modes: { light: { 'card-background-color': 'white' }, dark: { 'card-background-color': 'black' } },
    };
    expect(flattenHaTheme(rec, 'dark', false)['card-background-color']).toBe('black');
    expect(flattenHaTheme(rec, 'auto', false)['card-background-color']).toBe('white');
    expect(flattenHaTheme(rec, 'auto', true)['card-background-color']).toBe('black');
    expect(flattenHaTheme(rec, 'auto', true)['primary-color']).toBe('red');
  });
});

describe('haThemeToUcTheme', () => {
  it('maps HA variables onto tokens, card chrome and palette', () => {
    const { theme, mapped } = haThemeToUcTheme('Mushroom Dark', mushroom);
    expect(theme.id).toBe('local-ha-mushroom-dark');
    expect(theme.source).toBe('local');
    expect(theme.tokens.surface).toBe('flat');
    expect(theme.tokens.radius).toBe(24);
    expect(theme.tokens.border_width).toBe(0);
    expect(theme.tokens.shadow).toBe('0 2px 4px rgba(0,0,0,0.3)');
    expect(theme.tokens.font_family).toBe('Roboto, sans-serif');
    expect(theme.tokens.palette).toEqual({
      primary: '#03a9f4',
      accent: '#03a9f4',
      card_bg: '#1c1c1c',
      text: '#e1e1e1',
      text_secondary: 'rgba(225, 225, 225, 0.7)',
      divider: 'rgba(255, 255, 255, 0.12)',
    });
    expect(theme.card).toEqual({
      card_border_radius: 24,
      card_border_width: 0,
      card_background: '#1c1c1c',
    });
    expect(mapped).toContain('radius');
    expect(mapped).toContain('palette.primary');
  });

  it('turns a backdrop-filter into a glass surface and "none" shadow into shadow off', () => {
    const { theme } = haThemeToUcTheme('Glassy', {
      'ha-card-backdrop-filter': 'blur(14px) saturate(1.2)',
      'ha-card-box-shadow': 'none',
    });
    expect(theme.tokens.surface).toBe('glass');
    expect(theme.tokens.blur).toBe(14);
    expect(theme.tokens.shadow).toBeUndefined();
    expect(theme.card?.card_shadow_enabled).toBe(false);
  });

  it('produces a definition the sanitiser accepts unchanged', () => {
    const { theme } = haThemeToUcTheme('Mushroom Dark', mushroom, { mode: 'dark' });
    const { theme: clean, warnings } = sanitizeThemeDefinition(theme);
    expect(warnings).toEqual([]);
    expect(clean?.tokens.palette).toEqual(theme.tokens.palette);
    expect(clean?.id).toBe(theme.id);
  });

  it('falls back to a sensible default with an empty theme', () => {
    const { theme, mapped } = haThemeToUcTheme('Empty', {});
    expect(theme.tokens).toEqual({ surface: 'flat', radius: 12 });
    expect(theme.card).toBeUndefined();
    expect(mapped).toEqual([]);
  });
});
