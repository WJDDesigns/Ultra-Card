import { describe, it, expect } from 'vitest';
import {
  applyHaThemeToElement,
  listHaThemeNames,
  resolveHaThemeVars,
  type HaThemes,
} from './uc-apply-ha-theme';

const themes: HaThemes = {
  default_theme: 'default',
  darkMode: false,
  themes: {
    Glass: {
      'primary-color': '#3366ff',
      'card-background-color': 'rgba(255,255,255,0.1)',
      modes: {
        light: { 'primary-text-color': '#111111' },
        dark: { 'primary-text-color': '#eeeeee' },
      },
    },
    Mono: { 'primary-color': '#000' },
  },
};

describe('resolveHaThemeVars', () => {
  it('merges mode-specific values over shared ones', () => {
    expect(resolveHaThemeVars(themes.themes.Glass, false)['primary-text-color']).toBe('#111111');
    expect(resolveHaThemeVars(themes.themes.Glass, true)['primary-text-color']).toBe('#eeeeee');
    expect(resolveHaThemeVars(themes.themes.Glass, true).modes).toBeUndefined();
  });
});

describe('applyHaThemeToElement', () => {
  it('sets theme vars and derives rgb for hex colours', () => {
    const el = document.createElement('div');
    expect(applyHaThemeToElement(el, themes, 'Glass')).toBe(true);
    expect(el.style.getPropertyValue('--primary-color')).toBe('#3366ff');
    expect(el.style.getPropertyValue('--rgb-primary-color')).toBe('51, 102, 255');
    // Non-hex colours get no rgb twin
    expect(el.style.getPropertyValue('--rgb-card-background-color')).toBe('');
    expect(el.style.getPropertyValue('--primary-text-color')).toBe('#111111');
  });

  it('expands 3-digit hex', () => {
    const el = document.createElement('div');
    applyHaThemeToElement(el, themes, 'Mono');
    expect(el.style.getPropertyValue('--rgb-primary-color')).toBe('0, 0, 0');
  });

  it('is a no-op when nothing changed', () => {
    const el = document.createElement('div');
    applyHaThemeToElement(el, themes, 'Glass');
    expect(applyHaThemeToElement(el, themes, 'Glass')).toBe(false);
  });

  it('re-applies when dark mode flips', () => {
    const el = document.createElement('div');
    applyHaThemeToElement(el, themes, 'Glass');
    expect(applyHaThemeToElement(el, { ...themes, darkMode: true }, 'Glass')).toBe(true);
    expect(el.style.getPropertyValue('--primary-text-color')).toBe('#eeeeee');
  });

  it('removes everything when the theme is cleared or unknown', () => {
    const el = document.createElement('div');
    applyHaThemeToElement(el, themes, 'Glass');
    expect(applyHaThemeToElement(el, themes, undefined)).toBe(true);
    expect(el.style.getPropertyValue('--primary-color')).toBe('');
    expect(el.style.getPropertyValue('--rgb-primary-color')).toBe('');

    applyHaThemeToElement(el, themes, 'Glass');
    applyHaThemeToElement(el, themes, 'does-not-exist');
    expect(el.style.getPropertyValue('--primary-color')).toBe('');
  });

  it('swaps cleanly between themes without leaking keys', () => {
    const el = document.createElement('div');
    applyHaThemeToElement(el, themes, 'Glass');
    applyHaThemeToElement(el, themes, 'Mono');
    expect(el.style.getPropertyValue('--primary-color')).toBe('#000');
    expect(el.style.getPropertyValue('--card-background-color')).toBe('');
  });
});

describe('listHaThemeNames', () => {
  it('sorts names and tolerates missing themes', () => {
    expect(listHaThemeNames(themes)).toEqual(['Glass', 'Mono']);
    expect(listHaThemeNames(undefined)).toEqual([]);
  });
});
