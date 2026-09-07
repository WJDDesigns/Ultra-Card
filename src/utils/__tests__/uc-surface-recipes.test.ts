import { describe, it, expect } from 'vitest';
import {
  UC_CONTROL_RECIPES,
  UC_SURFACE_RECIPES,
  getBarSurfaceCss,
  getControlSurfaceStyles,
  getSliderSurfaceCss,
  normalizeRecipe,
  recipeForRole,
  recipesFromSurface,
  surfaceRoleFor,
} from '../uc-surface-recipes';
import { getButtonSurfaceStyles, UC_BUTTON_SURFACE_STYLES } from '../uc-surface-styles';

describe('surface recipes', () => {
  it('normalises synonyms and rejects non-recipes', () => {
    expect(normalizeRecipe('gradient')).toBe('gradient-overlay');
    expect(normalizeRecipe('neon')).toBe('neon-glow');
    expect(normalizeRecipe(' Glass ')).toBe('glass');
    expect(normalizeRecipe('style_16')).toBeUndefined();
    expect(normalizeRecipe(undefined)).toBeUndefined();
  });

  it('restricts recipes to what a role can render', () => {
    expect(recipeForRole('dots', 'track')).toBe('dots');
    expect(recipeForRole('dots', 'control')).toBe('flat');
    expect(recipeForRole('minimal', 'pane')).toBe('flat');
    expect(recipeForRole('glass', 'pane')).toBe('glass');
  });

  it('maps only the five surface fields to roles', () => {
    expect(surfaceRoleFor('bar', 'bar_style')).toBe('track');
    expect(surfaceRoleFor('button', 'style')).toBe('control');
    expect(surfaceRoleFor('grid', 'grid_style')).toBeUndefined();
    expect(surfaceRoleFor('bar', 'glass_blur_amount')).toBeUndefined();
  });

  it('derives sensible role recipes from a surface', () => {
    expect(recipesFromSurface('glass')).toEqual({ control: 'glass', track: 'glass', fill: 'flat', pane: 'glass' });
    expect(recipesFromSurface('flat')).toEqual({ control: 'flat', track: 'flat', fill: 'flat', pane: 'flat' });
    expect(recipesFromSurface(undefined).control).toBe('flat');
  });

  it('keeps the legacy button helper as an alias', () => {
    expect(UC_BUTTON_SURFACE_STYLES).toEqual(UC_CONTROL_RECIPES);
    expect(getButtonSurfaceStyles('glass', { background: '#123456', blur: 4 })).toEqual(
      getControlSurfaceStyles('glass', { background: '#123456', blur: 4 })
    );
  });

  it('control: metallic and outline pick a readable text colour unless the user set one', () => {
    expect(getControlSurfaceStyles('metallic', { background: '#f00' }).color).toBe('#333');
    expect(getControlSurfaceStyles('outline', { background: '#f00' }).color).toBe('#f00');
    expect(getControlSurfaceStyles('outline', { background: '#f00', hasCustomTextColor: true }).color).toBeUndefined();
    expect(getControlSurfaceStyles('dashed', { background: '#f00' })).toEqual(getControlSurfaceStyles('flat', { background: '#f00' }));
  });

  const barCtx = {
    percentage: 55,
    fill_direction: 'left-to-right',
    borderRadius: 10,
    trackBackground: '#eee',
    fillBackground: '#2196f3',
    useGradient: false,
    barColor: '#2196f3',
    glowColor: '#2196f3',
    glassBlur: 8,
    resolveColor: (c: string) => c,
  };

  it('bar: every recipe produces some CSS and gradients move gloss to the overlay', () => {
    for (const r of UC_SURFACE_RECIPES) {
      const out = getBarSurfaceCss(r, barCtx);
      expect(out.track + out.fill + out.overlay, r).not.toBe('');
    }
    const solid = getBarSurfaceCss('glossy', barCtx);
    const grad = getBarSurfaceCss('glossy', { ...barCtx, useGradient: true, fillBackground: 'linear-gradient(to right, red, blue)' });
    expect(solid.fill).toContain('linear-gradient(to bottom');
    expect(solid.overlay).toBe('');
    expect(grad.fill).toBe('');
    expect(grad.overlay).toContain('background-image');
  });

  it('bar: dots follow the percentage, dashed rounds only at 100%', () => {
    expect(getBarSurfaceCss('dots', { ...barCtx, percentage: 35 }).fill.match(/radial-gradient/g)).toHaveLength(3);
    expect(getBarSurfaceCss('dots', { ...barCtx, percentage: 5 }).fill).toContain('transparent');
    expect(getBarSurfaceCss('dashed', { ...barCtx, percentage: 100 }).fill).toContain('border-radius: 0 10px 10px 0');
    expect(getBarSurfaceCss('dashed', { ...barCtx, percentage: 40 }).fill).toContain('border-radius: 0;');
  });

  it('bar: unknown recipe paints nothing extra (legacy undefined style)', () => {
    expect(getBarSurfaceCss(undefined, barCtx)).toEqual({ track: '', fill: '', overlay: '' });
  });

  it('slider: recipes fall back to a flat container', () => {
    const ctx = { trackColor: '#ccc', fill: '#f0f', baseBackground: 'linear-gradient(90deg, #f0f 0%, #f0f 40%, #ccc 40%)', borderRadius: '10px', overlayFillSnippet: 'background: #f0f;', glassBlur: 8 };
    expect(getSliderSurfaceCss('nonsense', ctx).container).toContain(ctx.baseBackground);
    expect(getSliderSurfaceCss('glass', ctx).overlay).toContain('blur(8px)');
    expect(getSliderSurfaceCss('outline', ctx).overlay).toBe(ctx.overlayFillSnippet);
  });
});
