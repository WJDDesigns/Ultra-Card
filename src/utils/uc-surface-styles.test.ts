import { describe, it, expect } from 'vitest';
import {
  getButtonSurfaceStyles,
  getButtonSurfaceStyleString,
  getSurfaceTokens,
  UC_BUTTON_SURFACE_STYLES,
} from './uc-surface-styles';

const bg = 'var(--primary-color)';

describe('getButtonSurfaceStyles', () => {
  it('reproduces the historical button map', () => {
    expect(getButtonSurfaceStyles('flat', { background: bg })).toEqual({
      background: bg,
      border: 'none',
      boxShadow: 'none',
    });
    expect(getButtonSurfaceStyles('glass', { background: bg })).toEqual({
      background: bg,
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,0.25)',
    });
    expect(getButtonSurfaceStyles('neon-glow', { background: bg }).boxShadow).toBe(
      `0 0 10px ${bg}, 0 0 20px ${bg}`
    );
    expect(getButtonSurfaceStyles('glossy', { background: bg }).background).toBe(
      `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${bg}`
    );
  });

  it('recolours outline/metallic labels only without a custom text colour', () => {
    expect(getButtonSurfaceStyles('outline', { background: bg }).color).toBe(bg);
    expect(getButtonSurfaceStyles('metallic', { background: bg }).color).toBe('#333');
    expect(getButtonSurfaceStyles('outline', { background: bg, hasCustomTextColor: true }).color).toBeUndefined();
    expect(getButtonSurfaceStyles('flat', { background: bg }).color).toBeUndefined();
  });

  it('falls back to flat for unknown styles and covers every listed style', () => {
    expect(getButtonSurfaceStyles('nope', { background: bg })).toEqual(
      getButtonSurfaceStyles('flat', { background: bg })
    );
    expect(getButtonSurfaceStyles(undefined, { background: bg })).toEqual(
      getButtonSurfaceStyles('flat', { background: bg })
    );
    for (const style of UC_BUTTON_SURFACE_STYLES) {
      expect(Object.keys(getButtonSurfaceStyles(style, { background: bg })).length).toBeGreaterThan(0);
    }
  });

  it('serialises to kebab-case css', () => {
    const css = getButtonSurfaceStyleString('glass', { background: bg, hasCustomTextColor: false });
    expect(css).toContain('backdrop-filter: blur(6px);');
    expect(css).toContain('border: 1px solid rgba(255,255,255,0.25);');
    const outline = getButtonSurfaceStyleString('outline', { background: bg, hasCustomTextColor: false });
    expect(outline).toContain(`color: ${bg};`);
  });
});

describe('getSurfaceTokens', () => {
  it('honours border overrides and blur', () => {
    const glass = getSurfaceTokens('glass', { blur: 20, borderWidth: 2, borderColor: 'red' });
    expect(glass.backdropFilter).toContain('blur(20px)');
    expect(glass.border).toBe('2px solid red');
    const flat = getSurfaceTokens('flat', {});
    expect(flat.border).toBe('1px solid var(--divider-color)');
    expect(flat.backdropFilter).toBe('none');
    expect(getSurfaceTokens('minimal', {}).background).toBe('transparent');
  });
});
