import { describe, it, expect, beforeEach } from 'vitest';
import {
  UC_MODULE_RADII,
  UC_RADIUS_SCALE_MAX,
  UC_THEME_BASE_CSS,
  chromeFromTokens,
  paneVars,
  resolveThemeCardChrome,
  radiusInner,
  radiusScale,
  seedForSlot,
  ucThemeService,
} from './uc-theme-service';
import {
  BEACH_THEME,
  BUILTIN_THEMES,
  GLASS_THEME,
  GUMMY_THEME,
  METALLIC_THEME,
  GREEN_TERMINAL_THEME,
  HILLARY_THEME,
  LIQUID_GLASS_THEME,
  MONOCHROME_THEME,
} from '../themes/builtin-themes';
import { contrastRatio, isLight, parseColor, toRgbTriple } from '../themes/uc-theme-color';
import { svgDataUrl } from '../themes/uc-theme-artwork';
import { UC_THEME_HA_NATIVE, UC_THEME_NONE } from '../themes/uc-theme-types';
import {
  UC_THEME_MAX_PAGE_BACKGROUND_LENGTH,
  UC_THEME_MAX_PANE_BACKGROUND_LENGTH,
  sanitizeThemeDefinition,
  scanThemeCss,
} from '../themes/uc-theme-validate';
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
    ucThemeService.setGlobalDefault('glass');
    expect(ucThemeService.resolveThemeId(cfg())).toBe('glass');
    expect(ucThemeService.resolveThemeId(cfg('bold'))).toBe('bold');
    expect(ucThemeService.resolveThemeId(cfg(UC_THEME_NONE))).toBe(UC_THEME_NONE);
    expect(ucThemeService.resolveTheme(cfg(UC_THEME_NONE))).toBeNull();
  });

  it('unknown ids fall through to the global default / HA Native', () => {
    expect(ucThemeService.resolveThemeId(cfg('does-not-exist'))).toBe(UC_THEME_HA_NATIVE);
    ucThemeService.setGlobalDefault('bold');
    expect(ucThemeService.resolveThemeId(cfg('does-not-exist'))).toBe('bold');
  });

  it('classic and soft are gone', () => {
    const ids = BUILTIN_THEMES.map(t => t.id);
    expect(ids).not.toContain('classic');
    expect(ids).not.toContain('soft');
  });

  it('tokens alone style the card shell: radius, border and see-through surfaces', () => {
    // A builder/Hub-editor theme has no `card` block; the shell must still follow it.
    expect(chromeFromTokens({ surface: 'flat', radius: 20, border_width: 3, border_color: '#f00' })).toEqual({
      card_border_radius: 20,
      card_border_width: 3,
      card_border_color: '#f00',
    });
    // Surfaces supply the border when the theme does not.
    expect(chromeFromTokens({ surface: 'glossy', radius: 16 })).toEqual({ card_border_radius: 16, card_border_width: 0 });
    expect(chromeFromTokens({ surface: 'outline', radius: 8 })).toMatchObject({
      card_border_width: 1,
      card_border_color: 'var(--divider-color)',
      card_background: 'transparent',
    });
    expect(chromeFromTokens({ surface: 'minimal', radius: 8 })).toMatchObject({ card_border_width: 0, card_background: 'transparent' });
    // An explicit `card` block still wins over what tokens imply.
    ucThemeService.saveToLibrary({
      id: 'tok',
      name: 'Tokens only',
      version: 1,
      tokens: { surface: 'flat', radius: 30, border_width: 2 },
      card: { card_border_radius: 4 },
    });
    expect(ucThemeService.getCardChrome(cfg('tok'))).toEqual({ card_border_radius: 4, card_border_width: 2, card_border_color: 'var(--divider-color)' });
    expect(resolveThemeCardChrome(null)).toEqual({});
    // Background, shadow and backdrop ride the host variables via the base stylesheet.
    expect(UC_THEME_BASE_CSS).toMatch(/\.card-container \{[^}]*background: var\(--uc-surface-bg/);
    expect(UC_THEME_BASE_CSS).toMatch(/box-shadow: var\(--uc-shadow/);
    expect(UC_THEME_BASE_CSS).toMatch(/backdrop-filter: var\(--uc-surface-backdrop/);
  });

  it('deals each card a distinct hue and random seeds, and gummy paints with them', () => {
    // Golden-angle dispensing: any run of consecutive cards differs by well over a flavour step.
    const hues = Array.from({ length: 12 }, (_, i) => seedForSlot(i, 1234).hue);
    for (let i = 1; i < hues.length; i++) {
      const d = Math.abs(hues[i] - hues[i - 1]);
      expect(Math.min(d, 360 - d)).toBeGreaterThan(60);
    }
    for (const h of hues) (expect(h).toBeGreaterThanOrEqual(0), expect(h).toBeLessThan(360));
    // Seeds are in [0, 1), deterministic per slot/salt, and differ between slots.
    const s0 = seedForSlot(0, 1234);
    expect(s0).toEqual(seedForSlot(0, 1234));
    for (const v of s0.seeds) (expect(v).toBeGreaterThanOrEqual(0), expect(v).toBeLessThan(1));
    expect(s0.seeds).not.toEqual(seedForSlot(1, 1234).seeds);
    // A different salt (page load) deals a different hand.
    expect(seedForSlot(0, 1).hue).not.toBe(seedForSlot(0, 181).hue);

    // Each element keeps its slot; two elements get different hues.
    const elA = document.createElement('div');
    const elB = document.createElement('div');
    const seedA = ucThemeService.cardSeed(elA);
    expect(ucThemeService.cardSeed(elA)).toEqual(seedA);
    expect(ucThemeService.cardSeed(elB).hue).not.toBe(seedA.hue);

    const gummy = BUILTIN_THEMES.find(t => t.id === 'gummy')!;
    ucThemeService.applyThemeToHost(elA, gummy, seedA);
    expect(elA.style.getPropertyValue('--uc-card-hue')).toBe(String(seedA.hue));
    expect(elA.style.getPropertyValue('--uc-card-seed-1')).toBe(String(seedA.seeds[0]));
    expect(elA.style.getPropertyValue('--uc-card-seed-3')).toBe(String(seedA.seeds[2]));
    expect(elA.style.getPropertyValue('--card-background-color')).toContain('var(--uc-card-hue');
    expect(gummy.css).toContain('--uc-card-hue');
    expect(gummy.css).toContain('--uc-card-seed-1');
    expect(gummy.css).not.toContain('data:image'); // gloss is gradients driven by seeds, not a stamp
    // Changing only the seed re-applies.
    const seedB = { ...seedA, hue: (seedA.hue + 1) % 360 };
    expect(ucThemeService.applyThemeToHost(elA, gummy, seedB)).toBe(true);
    expect(elA.style.getPropertyValue('--uc-card-hue')).toBe(String(seedB.hue));
    ucThemeService.applyThemeToHost(elA, null);
    expect(elA.style.getPropertyValue('--uc-card-hue')).toBe('');
    expect(elA.style.getPropertyValue('--uc-card-seed-1')).toBe('');
  });

  it('scales module-internal radii with the card radius', () => {
    expect(radiusScale(12)).toBe('1'); // designed against the 12px default
    expect(radiusScale(0)).toBe('0'); // square themes square everything
    expect(radiusScale(8)).toBe('0.67');
    expect(radiusScale(26)).toBe(String(UC_RADIUS_SCALE_MAX)); // clamped
    for (const t of BUILTIN_THEMES) {
      if (t.id === UC_THEME_HA_NATIVE) continue;
      expect(ucThemeService.getHostVars(t)['--uc-radius-scale']).toBe(radiusScale(t.tokens.radius));
    }
  });

  it('exposes pane tokens for module-drawn rows, tiles and chips', () => {
    for (const t of BUILTIN_THEMES) {
      if (t.id === UC_THEME_HA_NATIVE) continue;
      const vars = ucThemeService.getHostVars(t);
      expect(vars['--uc-pane-bg']).toBeTruthy();
      expect(vars['--uc-pane-border']).toBeTruthy();
      expect(vars['--uc-pane-shadow']).toBeTruthy();
    }
    // Explicit tokens win; otherwise the surface decides.
    const neu = BUILTIN_THEMES.find(t => t.id === 'neumorphic-dark')!;
    expect(ucThemeService.getHostVars(neu)['--uc-pane-shadow']).toContain('inset');
    expect(paneVars({ surface: 'outline', radius: 8 } as any)['--uc-pane-bg']).toBe('transparent');
    expect(
      paneVars({ surface: 'flat', radius: 8, pane_background: '#abc' } as any)['--uc-pane-bg']
    ).toBe('#abc');
    // HA Native resolves to no theme, so nothing is set and module fallbacks apply untouched.
    expect(ucThemeService.resolveTheme(cfg(UC_THEME_HA_NATIVE))).toBeNull();
    expect(ucThemeService.getHostVars(null)).toEqual({});
    // Design surfaces pick up the pane shadow from the base CSS.
    expect(UC_THEME_BASE_CSS).toContain('box-shadow: var(--uc-pane-shadow, none)');
  });

  it('caps nested radii so they step down concentrically from the card radius', () => {
    expect(radiusInner(0, 16)).toBe(0); // square stays square
    expect(radiusInner(26, 20)).toBe(13); // radius - padding is 6, held at half radius
    expect(radiusInner(28, 18)).toBe(14);
    expect(radiusInner(12, 4)).toBe(8); // true concentric value used when it fits the band
    expect(radiusInner(8, 16)).toBe(4);
    for (const t of BUILTIN_THEMES) {
      if (t.id === UC_THEME_HA_NATIVE) continue;
      const inner = parseFloat(ucThemeService.getHostVars(t)['--uc-radius-inner']);
      expect(inner).toBeLessThan(Math.max(t.tokens.radius, 1));
      expect(inner).toBeGreaterThanOrEqual(0);
    }
    // Every module-side --uc-r-N variable is defined by the base CSS, scaled and capped.
    for (const n of UC_MODULE_RADII) {
      const name = `--uc-r-${String(n).replace('.', '_')}`;
      expect(UC_THEME_BASE_CSS).toContain(
        `${name}: min(calc(${n}px * var(--uc-radius-scale, 1)), var(--uc-radius-inner, 999px));`
      );
    }
  });

  it('material follows MD3: baseline scheme, 12dp corners, pill controls, level-1 elevation', () => {
    const material = BUILTIN_THEMES.find(t => t.id === 'material')!;
    expect(material.tokens.radius).toBe(12);
    expect(material.tokens.radius_sm).toBe(20);
    expect(material.tokens.border_width).toBe(0);
    expect(material.tokens.shadow).toBe(
      '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)'
    );
    expect(material.modules?.spinbox?.button_shape).toBe('circle');
    expect(material.tokens.palette?.primary).toBe('#6750a4');
    expect(material.tokens.palette?.card_bg).toBe('#f7f2fa');
    expect(material.tokens.pane_background).toBe('#ece6f0');
    expect(material.tokens.pane_border).toBe('none');
    expect(material.tokens.page_background).toMatch(/data:image\/svg\+xml.*#fef7ff$/);
    expect(material.tokens.font_family).toMatch(/Google Sans/);
  });

  it('module style: explicit wins, inherit uses theme, then fallback', () => {
    const glass = cfg('glass');
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'style', 'outline', 'flat')).toBe(
      'outline'
    );
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'style', undefined, 'flat')).toBe(
      'glass'
    );
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'style', 'theme', 'flat')).toBe(
      'glass'
    );
    // key not allow-listed for the module → fallback
    expect(ucThemeService.resolveModuleStyle(glass, 'button', 'entity', undefined, 'x')).toBe('x');
    // no theme → fallback
    expect(ucThemeService.resolveModuleStyle(cfg(), 'button', 'style', undefined, 'flat')).toBe(
      'flat'
    );
  });

  it('surface fields fall back to the theme recipe for their role', () => {
    // A theme that sets no per-module styles: recipes derive from `surface`.
    ucThemeService.saveToLibrary({
      id: 'local-just-glass',
      name: 'Just glass',
      version: 1,
      tokens: { surface: 'glass', radius: 16 },
    });
    const c = cfg('local-just-glass');
    expect(ucThemeService.getRecipes(c)).toEqual({ control: 'glass', track: 'glass', fill: 'flat', pane: 'glass' });
    expect(ucThemeService.resolveModuleStyle(c, 'button', 'style', 'theme', 'flat')).toBe('glass');
    expect(ucThemeService.resolveModuleStyle(c, 'bar', 'bar_style', 'theme', 'flat')).toBe('glass');
    expect(ucThemeService.resolveModuleStyle(c, 'spinbox', 'button_style', 'theme', 'flat')).toBe('glass');
    // layout vocabularies are not surfaces: still the module fallback
    expect(ucThemeService.resolveModuleStyle(c, 'grid', 'grid_style', 'theme', 'style_1')).toBe('style_1');
    // an explicit module value in the theme still wins over the recipe
    ucThemeService.saveToLibrary({
      id: 'local-glass-flat-bars',
      name: 'Glass, flat bars',
      version: 1,
      tokens: { surface: 'glass', radius: 16, recipes: { track: 'inset' } },
      modules: { bar: { bar_style: 'dots' } },
    });
    const c2 = cfg('local-glass-flat-bars');
    expect(ucThemeService.getRecipes(c2).track).toBe('inset');
    expect(ucThemeService.resolveModuleStyle(c2, 'bar', 'bar_style', 'theme', 'flat')).toBe('dots');
    expect(ucThemeService.resolveModuleStyle(c2, 'slider_control', 'slider_style', 'theme', 'flat')).toBe('inset');
    // a recipe the role cannot render reads as flat for that role
    ucThemeService.saveToLibrary({
      id: 'local-dotty',
      name: 'Dotty',
      version: 1,
      tokens: { surface: 'flat', radius: 12, recipes: { control: 'dots' as any, track: 'dots' } },
    });
    const c3 = cfg('local-dotty');
    expect(ucThemeService.getRecipes(c3)).toEqual({ control: 'flat', track: 'dots', fill: 'flat', pane: 'flat' });
    expect(ucThemeService.resolveModuleStyle(c3, 'button', 'style', 'theme', 'flat')).toBe('flat');
    // HA Native: flat everywhere, i.e. every module's own default
    expect(ucThemeService.getRecipes(cfg())).toEqual({ control: 'flat', track: 'flat', fill: 'flat', pane: 'flat' });
  });

  it('pane recipe: surface-derived leaves pane vars untouched, another recipe replaces them', () => {
    const glassTokens = { surface: 'glass', radius: 16 } as const;
    const base = paneVars(glassTokens);
    expect(paneVars(glassTokens, 'glass')).toEqual({ ...base, '--uc-pane-backdrop': 'blur(6px) saturate(140%)' });
    expect(base['--uc-pane-backdrop']).toBe('blur(6px) saturate(140%)');
    const inset = paneVars(glassTokens, 'inset');
    expect(inset['--uc-pane-shadow']).toContain('inset 0 2px 5px');
    expect(inset['--uc-pane-backdrop']).toBeUndefined();
    // explicit pane tokens still win over any recipe
    const pinned = paneVars({ surface: 'flat', radius: 12, pane_background: '#123', pane_shadow: 'none' }, 'neon-glow');
    expect(pinned['--uc-pane-bg']).toBe('#123');
    expect(pinned['--uc-pane-shadow']).toBe('none');
    expect(pinned['--uc-pane-border']).toContain('rgba(var(--rgb-primary-color), 0.5)');
    // themes without recipes: identical to before
    for (const t of BUILTIN_THEMES) {
      if (t.tokens.recipes) continue;
      const before = paneVars(t.tokens);
      const after = ucThemeService.getHostVars(t);
      for (const k of Object.keys(before)) expect(after[k], `${t.id} ${k}`).toBe(before[k]);
    }
    expect(UC_THEME_BASE_CSS).toContain('[data-uc-role="pane"]');
  });

  it('host vars expose the recipe per role', () => {
    const vars = ucThemeService.getHostVars(METALLIC_THEME);
    expect(vars['--uc-recipe-control']).toBe('metallic');
    expect(vars['--uc-recipe-pane']).toBe('inset');
    expect(ucThemeService.getHostVars(GLASS_THEME)['--uc-recipe-track']).toBe('glass');
  });
});

describe('built-ins', () => {
  it('every built-in survives the sanitiser without losing anything', () => {
    for (const builtin of BUILTIN_THEMES) {
      const { theme, warnings } = sanitizeThemeDefinition(builtin);
      expect(warnings, builtin.id).toEqual([]);
      expect(theme?.id).toBe(builtin.id);
      expect(theme?.tokens).toEqual(builtin.tokens);
      expect(theme?.css ?? undefined).toBe(builtin.css ?? undefined);
      expect(theme?.card ?? undefined).toEqual(builtin.card ?? undefined);
      expect(theme?.modules ?? undefined).toEqual(builtin.modules ?? undefined);
    }
  });

  it('liquid glass: clear tint, deep blur, lensing rim, dark ink on its own lens wallpaper', () => {
    const vars = ucThemeService.getHostVars(LIQUID_GLASS_THEME);
    expect(vars['--uc-radius']).toBe('32px');
    expect(vars['--uc-radius-sm']).toBe('22px');
    expect(vars['--uc-surface-backdrop']).toContain('blur(10px)');
    expect(vars['--uc-shadow']).toContain('inset 0 1px 0');
    expect(vars['--primary-text-color']).toBe('#10224d');
    expect(vars['--card-background-color']).toBe('rgba(255, 255, 255, 0.08)');
    // Inline lens artwork sized to cover, over the sky gradient.
    expect(LIQUID_GLASS_THEME.tokens.page_background).toMatch(
      /^url\("data:image\/svg\+xml,[^"]+"\) center \/ 100% 100% no-repeat fixed, /
    );
    expect(LIQUID_GLASS_THEME.tokens.page_background).toMatch(/linear-gradient\(180deg/);
    expect(LIQUID_GLASS_THEME.css).toContain('backdrop-filter');
    expect(LIQUID_GLASS_THEME.css).toMatch(
      /\.card-container::before[\s\S]*mask-composite: exclude/
    );
    // Chromium-only refraction: an inline SVG displacement filter as backdrop-filter,
    // gated so other engines keep the plain blur.
    expect(LIQUID_GLASS_THEME.css).toMatch(
      /@supports \(-webkit-app-region: no-drag\)[\s\S]*backdrop-filter: saturate\(150%\) url\("data:image\/svg\+xml,[^"]*#card"\)/
    );
    const decoded = decodeURIComponent(
      /url\("data:image\/svg\+xml,([^"#]*)#card"\)/.exec(LIQUID_GLASS_THEME.css!)![1]
    );
    expect(decoded).toContain('<feDisplacementMap');
    expect(decoded).toMatch(/<filter id="card" x="0" y="0" width="1" height="1"/);
    expect(decoded).toMatch(/<filter id="pane"/);
  });

  it('material themes paint the page in their own colour; adaptive ones leave it to HA', () => {
    const paints = new Map(BUILTIN_THEMES.map(t => [t.id, t.tokens.page_background]));
    expect(paints.get('neumorphic-light')).toBe('#e4e8ef');
    expect(paints.get('neumorphic-dark')).toBe('#2a2e35');
    expect(paints.get('material')).toContain('#fef7ff');
    for (const id of ['ha-native', 'glass', 'bold', 'monochrome']) {
      expect(paints.get(id), id).toBeUndefined();
    }
  });
});

describe('background tokens with artwork', () => {
  const mk = (page_background: string, pane_background?: string) =>
    sanitizeThemeDefinition({
      id: 'a',
      name: 'A',
      tokens: { surface: 'flat', radius: 8, page_background, pane_background },
    });

  it('accepts inline image data URIs in page/pane backgrounds and keeps them intact', () => {
    const art = svgDataUrl(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle r="4" fill="url(#g)"/></svg>'
    );
    const value = `${art} center / cover no-repeat, #e4e8ef`;
    expect(mk(value).theme?.tokens.page_background).toBe(value);
  });

  it('rejects external url() and scripted artwork in backgrounds', () => {
    expect(
      mk('url(https://evil.example/x.png), #fff').theme?.tokens.page_background
    ).toBeUndefined();
    const bad = svgDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>');
    expect(mk(`${bad}, #fff`).theme?.tokens.page_background).toBeUndefined();
    const ext = svgDataUrl(
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example/a.png"/></svg>'
    );
    expect(mk(`${ext}, #fff`).theme?.tokens.page_background).toBeUndefined();
  });

  it('drops an oversize background rather than truncating it', () => {
    // Within budget: a ~150 KB raster (base64) is the wallpaper use case.
    const photo = `url("data:image/webp;base64,${'A'.repeat(180_000)}") center / cover fixed`;
    expect(mk(photo).theme?.tokens.page_background).toBe(photo);
    // Over budget: rejected outright, never cut (a truncated data URI is garbage).
    const huge = `url("data:image/webp;base64,${'A'.repeat(UC_THEME_MAX_PAGE_BACKGROUND_LENGTH)}") center / cover`;
    expect(mk(huge).theme?.tokens.page_background).toBeUndefined();
    // Panes have a much tighter budget: props, not photos.
    const paneArt = `url("data:image/png;base64,${'A'.repeat(UC_THEME_MAX_PANE_BACKGROUND_LENGTH)}")`;
    expect(mk('#fff', paneArt).theme?.tokens.pane_background).toBeUndefined();
  });
});

describe('page painting switch', () => {
  it('is on by default, persists when turned off, and gates pageBackgroundFor', () => {
    const neu = BUILTIN_THEMES.find(t => t.id === 'neumorphic-dark')!;
    expect(ucThemeService.getPaintPage()).toBe(true);
    expect(ucThemeService.pageBackgroundFor(neu)).toBe('#2a2e35');
    expect(ucThemeService.pageBackgroundFor(null)).toBeUndefined();

    ucThemeService.setPaintPage(false);
    expect(localStorage.getItem('ultra-card-theme-paint-page')).toBe('0');
    expect(ucThemeService.pageBackgroundFor(neu)).toBeUndefined();

    ucThemeService.setPaintPage(true);
    expect(localStorage.getItem('ultra-card-theme-paint-page')).toBeNull();
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

  it('derives the companion HA variables from a literal palette', () => {
    const vars = ucThemeService.getHostVars(HILLARY_THEME);
    // Nested surfaces step off the linen card instead of staying HA-dark.
    const nested = parseColor(vars['--secondary-background-color'])!;
    expect(isLight(nested)).toBe(true);
    expect(nested).not.toEqual(parseColor(HILLARY_THEME.tokens.palette!.card_bg));
    expect(vars['--rgb-secondary-background-color']).toBe(toRgbTriple(nested));
    expect(vars['--input-fill-color']).toBe(vars['--secondary-background-color']);
    expect(vars['--mdc-theme-surface']).toBe(HILLARY_THEME.tokens.palette!.card_bg);
    // Pine primary gets white on top; text companions follow the pinned ink.
    expect(vars['--text-primary-color']).toBe('#ffffff');
    expect(vars['--rgb-text-primary-color']).toBe('255, 255, 255');
    const ink = parseColor(HILLARY_THEME.tokens.palette!.text)!;
    expect(vars['--disabled-text-color']).toBe(`rgba(${toRgbTriple(ink)}, 0.38)`);
    expect(vars['--input-ink-color']).toBe(HILLARY_THEME.tokens.palette!.text);
    // Explicit palette entries are never overwritten by derivation.
    expect(vars['--secondary-text-color']).toBe(HILLARY_THEME.tokens.palette!.text_secondary);
    expect(vars['--divider-color']).toBe(HILLARY_THEME.tokens.palette!.divider);
  });

  it('puts dark text on a bright phosphor primary', () => {
    const vars = ucThemeService.getHostVars(GREEN_TERMINAL_THEME);
    expect(vars['--text-primary-color']).toBe('#212121');
    expect(isLight(parseColor(vars['--secondary-background-color'])!)).toBe(false);
  });

  it('honours an explicit on_primary and derives nothing from var() palettes', () => {
    const mono = ucThemeService.getHostVars(MONOCHROME_THEME);
    expect(mono['--text-primary-color']).toMatch(/^var\(--card-background-color/);
    expect(mono['--secondary-background-color']).toBeUndefined();
    // Translucent card backgrounds (Glass) are not a readable surface to derive from.
    const glass = BUILTIN_THEMES.find(t => t.id === 'glass')!;
    expect(ucThemeService.getHostVars(glass)['--secondary-background-color']).toBeUndefined();
  });

  it('pins readable text when only card_bg is pinned', () => {
    const vars = ucThemeService.getHostVars({
      id: 't',
      name: 'T',
      version: 1,
      tokens: { surface: 'flat', radius: 8, palette: { card_bg: '#101418' } },
    });
    expect(vars['--primary-text-color']).toBe('#ffffff');
    expect(vars['--secondary-text-color']).toBe('rgba(255, 255, 255, 0.7)');
  });

  it('every built-in palette meets WCAG AA on its own card', () => {
    for (const theme of BUILTIN_THEMES) {
      const p = theme.tokens.palette;
      const bg = parseColor(p?.card_bg);
      if (!bg || bg.a < 1) continue;
      const text = parseColor(p?.text);
      const secondary = parseColor(p?.text_secondary);
      if (text) expect(contrastRatio(bg, text), `${theme.id} text`).toBeGreaterThanOrEqual(4.5);
      if (secondary && secondary.a >= 1) {
        expect(contrastRatio(bg, secondary), `${theme.id} text_secondary`).toBeGreaterThanOrEqual(
          4.5
        );
      }
      const primary = parseColor(p?.primary);
      if (primary) {
        const on = parseColor(ucThemeService.getHostVars(theme)['--text-primary-color'])!;
        expect(contrastRatio(primary, on), `${theme.id} on_primary`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('monochrome desaturates the whole card; colour themes set no filter', () => {
    expect(ucThemeService.getHostVars(MONOCHROME_THEME)['--uc-color-filter']).toBe('grayscale(1)');
    expect(ucThemeService.getHostVars(GLASS_THEME)['--uc-color-filter']).toBeUndefined();
    // The base sheet routes the variable onto the card container and falls back to none.
    expect(UC_THEME_BASE_CSS).toMatch(
      /\.card-container\s*\{[^}]*filter:\s*var\(--uc-color-filter,\s*none\)/
    );
  });

  it('grayscale token is clamped and dropped when zero', () => {
    const half = sanitizeThemeDefinition({
      id: 'g',
      name: 'G',
      tokens: { surface: 'flat', radius: 8, grayscale: 0.5 },
    }).theme!;
    expect(half.tokens.grayscale).toBe(0.5);
    expect(ucThemeService.getHostVars(half)['--uc-color-filter']).toBe('grayscale(0.5)');
    const over = sanitizeThemeDefinition({
      id: 'g',
      name: 'G',
      tokens: { surface: 'flat', radius: 8, grayscale: 3 },
    }).theme!;
    expect(over.tokens.grayscale).toBe(1);
    const zero = sanitizeThemeDefinition({
      id: 'g',
      name: 'G',
      tokens: { surface: 'flat', radius: 8, grayscale: 0 },
    }).theme!;
    expect(zero.tokens.grayscale).toBeUndefined();
    const bool = sanitizeThemeDefinition({
      id: 'g',
      name: 'G',
      tokens: { surface: 'flat', radius: 8, grayscale: true },
    }).theme!;
    expect(bool.tokens.grayscale).toBe(1);
  });

  it('color_filter accepts only colour functions and wins over grayscale', () => {
    const tok = (color_filter: unknown) =>
      sanitizeThemeDefinition({
        id: 'f',
        name: 'F',
        tokens: { surface: 'flat', radius: 8, grayscale: 1, color_filter },
      }).theme!.tokens;
    expect(tok('grayscale(1) sepia(1)  hue-rotate(80deg) saturate(2.5)').color_filter).toBe(
      'grayscale(1) sepia(1) hue-rotate(80deg) saturate(2.5)'
    );
    expect(tok('url(#x)').color_filter).toBeUndefined();
    expect(tok('blur(4px)').color_filter).toBeUndefined();
    expect(tok('drop-shadow(0 0 4px red)').color_filter).toBeUndefined();
    expect(tok('sepia(1); background: red').color_filter).toBeUndefined();
    expect(tok('none').color_filter).toBeUndefined();

    const green = tok('sepia(1) hue-rotate(80deg)');
    expect(
      ucThemeService.getHostVars({ id: 'f', name: 'F', version: 1, tokens: green })[
        '--uc-color-filter'
      ]
    ).toBe('sepia(1) hue-rotate(80deg)');
    expect(ucThemeService.getHostVars(GREEN_TERMINAL_THEME)['--uc-color-filter']).toContain(
      'hue-rotate(80deg)'
    );
    expect(ucThemeService.getHostVars(GREEN_TERMINAL_THEME)['--uc-font-family']).toContain(
      'monospace'
    );
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

    const shadow = ucThemeService.saveToLibrary({
      id: 'glass',
      name: 'Fake glass',
      tokens: { surface: 'flat', radius: 1 },
    });
    expect(shadow?.id).toBe('local-glass');
    expect(ucThemeService.getTheme('glass')).toBe(GLASS_THEME);

    const json = ucThemeService.exportTheme('my-theme-');
    expect(JSON.parse(json!).name).toBe('My Theme');
    expect(JSON.parse(json!).source).toBeUndefined();

    expect(ucThemeService.removeFromLibrary('my-theme-')).toBe(true);
    expect(ucThemeService.getTheme('my-theme-')).toBeUndefined();
  });

  it('clears the global default when its theme is removed', () => {
    ucThemeService.saveToLibrary({
      id: 'tmp',
      name: 'Tmp',
      tokens: { surface: 'flat', radius: 1 },
    });
    ucThemeService.setGlobalDefault('tmp');
    expect(ucThemeService.getGlobalDefaultId()).toBe('tmp');
    ucThemeService.removeFromLibrary('tmp');
    expect(ucThemeService.getGlobalDefaultId()).toBeNull();
  });

  it('notifies subscribers', () => {
    let calls = 0;
    const off = ucThemeService.subscribe(() => calls++);
    ucThemeService.setGlobalDefault('glass');
    ucThemeService.setGlobalDefault('glass');
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

  it('allows inline image artwork but no other url()', () => {
    const art = svgDataUrl(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><circle cx='5' cy='5' r='4' fill='#186a7a'/></svg>`
    );
    expect(art.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(art.slice('url("data:image/svg+xml,'.length, -2)).not.toMatch(/[<>#'()]/);
    expect(scanThemeCss(`.card-container { background-image: ${art}; }`).ok).toBe(true);
    expect(
      scanThemeCss(`.card-container { background-image: url(data:image/png;base64,iVBORw0KGgo=); }`)
        .ok
    ).toBe(true);

    expect(
      scanThemeCss(`.card-container { background-image: url(https://evil.example/x.png); }`).ok
    ).toBe(false);
    expect(scanThemeCss(`.card-container { background-image: url(data:text/html,hi); }`).ok).toBe(
      false
    );
    // Script or external references inside the SVG payload are refused even though SVG-as-image would ignore them.
    const scripted = svgDataUrl(
      `<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>`
    );
    expect(scanThemeCss(`.a { background: ${scripted} }`).ok).toBe(false);
    const external = svgDataUrl(
      `<svg xmlns='http://www.w3.org/2000/svg'><image href='https://evil.example/t.png'/></svg>`
    );
    expect(scanThemeCss(`.a { background: ${external} }`).ok).toBe(false);
    const b64 = `url(data:image/svg+xml;base64,${btoa('<svg onload="x()"></svg>')})`;
    expect(scanThemeCss(`.a { background: ${b64} }`).ok).toBe(false);
    // Paint servers inside the same SVG are fine; url() to anything else inside the SVG is not.
    const gradient = svgDataUrl(
      `<svg xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g'/></defs><rect fill='url(#g)'/></svg>`
    );
    expect(scanThemeCss(`.a { background: ${gradient} }`).ok).toBe(true);
    const leak = svgDataUrl(
      `<svg xmlns='http://www.w3.org/2000/svg'><rect fill='url(https://evil.example/p.svg#g)'/></svg>`
    );
    expect(scanThemeCss(`.a { background: ${leak} }`).ok).toBe(false);
  });

  it('beach artwork and the metallic recess pseudo-element survive the sanitiser', () => {
    expect(BEACH_THEME.css).toContain('data:image/svg+xml');
    expect(sanitizeThemeDefinition(BEACH_THEME).theme?.css).toBe(BEACH_THEME.css);
    expect(METALLIC_THEME.css).toContain('.card-container::before'); // the recessed panel
    expect(sanitizeThemeDefinition(GUMMY_THEME).theme?.css).toBe(GUMMY_THEME.css);
    expect(sanitizeThemeDefinition(METALLIC_THEME).theme?.css).toBe(METALLIC_THEME.css);
  });
});
