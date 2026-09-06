import { describe, it, expect, beforeEach } from 'vitest';
import { ucThemeService } from './uc-theme-service';
import { GLASS_THEME, MONOCHROME_THEME } from '../themes/builtin-themes';
import { UC_THEME_HA_NATIVE, UC_THEME_NONE } from '../themes/uc-theme-types';
import { sanitizeThemeDefinition, scanThemeCss } from '../themes/uc-theme-validate';
import type { UltraCardConfig } from '../types';

const cfg = (uc_theme?: string): UltraCardConfig =>
  ({ type: 'custom:ultra-card', layout: { rows: [] }, uc_theme }) as UltraCardConfig;

beforeEach(() => {
  localStorage.clear();
  ucThemeService.setGlobalDefault(null);
  for (const t of ucThemeService.getLibraryThemes()) ucThemeService.removeFromLibrary(t.id);
});

describe('resolution order', () => {
  it('defaults to HA Native (no-op) when nothing is set', () => {
    expect(ucThemeService.resolveThemeId(cfg())).toBe(UC_THEME_HA_NATIVE);
    expect(ucThemeService.resolveTheme(cfg())).toBeNull();
    expect(ucThemeService.getCardChrome(cfg())).toEqual({});
  });

  it('card uc_theme beats global default, none opts out', () => {
    ucThemeService.setGlobalDefault('soft');
    expect(ucThemeService.resolveThemeId(cfg())).toBe('soft');
    expect(ucThemeService.resolveThemeId(cfg('glass'))).toBe('glass');
    expect(ucThemeService.resolveThemeId(cfg(UC_THEME_NONE))).toBe(UC_THEME_NONE);
    expect(ucThemeService.resolveTheme(cfg(UC_THEME_NONE))).toBeNull();
  });

  it('unknown ids fall through to the global default / HA Native', () => {
    expect(ucThemeService.resolveThemeId(cfg('does-not-exist'))).toBe(UC_THEME_HA_NATIVE);
    ucThemeService.setGlobalDefault('bold');
    expect(ucThemeService.resolveThemeId(cfg('does-not-exist'))).toBe('bold');
  });

  it('module style: explicit wins, inherit uses theme, then fallback', () => {
    const glass = cfg('glass');
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'style', 'outline', 'flat')).toBe('outline');
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'style', undefined, 'flat')).toBe('glass');
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'style', 'theme', 'flat')).toBe('glass');
    // key not allow-listed for the module → fallback
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'entity', undefined, 'x')).toBe('x');
    // no theme → fallback
    expect(ucThemeService.resolveModuleStyle(cfg(), 'button', 'style', undefined, 'flat')).toBe('flat');
  });
});

describe('host vars', () => {
  it('emits --uc-* tokens and palette vars', () => {
    const vars = ucThemeService.getHostVars(GLASS_THEME);
    expect(vars['--uc-radius']).toBe('18px');
    expect(vars['--uc-radius-sm']).toBe('12px');
    expect(vars['--uc-surface-backdrop']).toContain('blur(12px)');
    expect(vars['--uc-theme-surface']).toBe('glass');

    const mono = ucThemeService.getHostVars(MONOCHROME_THEME);
    expect(mono['--primary-color']).toBe('var(--primary-text-color)');
    expect(mono['--uc-density']).toBe('0.875');
  });

  it('applies and clears on an element without leaking', () => {
    const el = document.createElement('div');
    expect(ucThemeService.applyThemeToHost(el, GLASS_THEME)).toBe(true);
    expect(el.getAttribute('data-uc-theme')).toBe('glass');
    expect(el.style.getPropertyValue('--uc-radius')).toBe('18px');
    expect(ucThemeService.applyThemeToHost(el, GLASS_THEME)).toBe(false);
    expect(ucThemeService.applyThemeToHost(el, MONOCHROME_THEME)).toBe(true);
    expect(el.style.getPropertyValue('--uc-radius')).toBe('6px');
    expect(ucThemeService.applyThemeToHost(el, null)).toBe(true);
    expect(el.style.getPropertyValue('--uc-radius')).toBe('');
    expect(el.hasAttribute('data-uc-theme')).toBe(false);
  });
});

describe('library', () => {
  it('stores sanitised themes, refuses to shadow built-ins, exports JSON', () => {
    const saved = ucThemeService.saveToLibrary({
      id: 'My Theme!',
      name: 'My Theme',
      tokens: { surface: 'glass', radius: 30 },
      modules: { button: { style: 'glass', entity: 'light.hack' } },
    });
    expect(saved?.id).toBe('my-theme-');
    expect(saved?.modules?.button).toEqual({ style: 'glass' });
    expect(ucThemeService.getTheme('my-theme-')).toBeDefined();

    const shadow = ucThemeService.saveToLibrary({ id: 'glass', name: 'Fake glass', tokens: { surface: 'flat', radius: 1 } });
    expect(shadow?.id).toBe('local-glass');
    expect(ucThemeService.getTheme('glass')).toBe(GLASS_THEME);

    const json = ucThemeService.exportTheme('my-theme-');
    expect(JSON.parse(json!).name).toBe('My Theme');
    expect(JSON.parse(json!).source).toBeUndefined();

    expect(ucThemeService.removeFromLibrary('my-theme-')).toBe(true);
    expect(ucThemeService.getTheme('my-theme-')).toBeUndefined();
  });

  it('clears the global default when its theme is removed', () => {
    ucThemeService.saveToLibrary({ id: 'tmp', name: 'Tmp', tokens: { surface: 'flat', radius: 1 } });
    ucThemeService.setGlobalDefault('tmp');
    expect(ucThemeService.getGlobalDefaultId()).toBe('tmp');
    ucThemeService.removeFromLibrary('tmp');
    expect(ucThemeService.getGlobalDefaultId()).toBeNull();
  });

  it('notifies subscribers', () => {
    let calls = 0;
    const off = ucThemeService.subscribe(() => calls++);
    ucThemeService.setGlobalDefault('soft');
    ucThemeService.setGlobalDefault('soft');
    off();
    ucThemeService.setGlobalDefault(null);
    expect(calls).toBe(1);
  });
});

describe('sanitizeThemeDefinition', () => {
  it('rejects garbage and strips dangerous css', () => {
    expect(sanitizeThemeDefinition(null).theme).toBeNull();
    expect(sanitizeThemeDefinition({ name: 'x' }).theme).toBeNull();
    const { theme, warnings } = sanitizeThemeDefinition({
      id: 'evil',
      name: 'Evil',
      tokens: { surface: 'glass', radius: 10, border_color: 'red; } body { display:none' },
      card: { card_background: 'url(http://x)', card_border_radius: 9999 },
      css: '.card-container { background: url(http://evil) }',
      preview: 'javascript:alert(1)',
    });
    expect(theme).not.toBeNull();
    expect(theme!.tokens.border_color).toBeUndefined();
    expect(theme!.card).toEqual({ card_border_radius: 400 });
    expect(theme!.css).toBeUndefined();
    expect(theme!.preview).toBeUndefined();
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('keeps safe css', () => {
    expect(scanThemeCss('.card-container { border-radius: 4px }').ok).toBe(true);
    expect(scanThemeCss('@import "x"').ok).toBe(false);
  });
});
