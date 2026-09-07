import { describe, it, expect } from 'vitest';
import { getControlSurfaceStyles, getControlSurfaceStyleString, UC_CONTROL_RECIPES } from './uc-surface-recipes';
import { getSurfaceTokens } from './uc-surface-styles';

const bg = 'var(--primary-color)';

describe('getControlSurfaceStyles', () => {
  it('reproduces the historical button map', () => {
    expect(getControlSurfaceStyles('flat', { background: bg })).toEqual({
      background: bg,
      border: 'none',
      boxShadow: 'none',
    });
    expect(getControlSurfaceStyles('glass', { background: bg })).toEqual({
      background: bg,
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,0.25)',
    });
    expect(getControlSurfaceStyles('neon-glow', { background: bg }).boxShadow).toBe(
      `0 0 10px ${bg}, 0 0 20px ${bg}`
    );
    expect(getControlSurfaceStyles('glossy', { background: bg }).background).toBe(
      `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${bg}`
    );
  });

  it('recolours outline/metallic labels only without a custom text colour', () => {
    expect(getControlSurfaceStyles('outline', { background: bg }).color).toBe(bg);
    expect(getControlSurfaceStyles('metallic', { background: bg }).color).toBe('#333');
    expect(getControlSurfaceStyles('outline', { background: bg, hasCustomTextColor: true }).color).toBeUndefined();
    expect(getControlSurfaceStyles('flat', { background: bg }).color).toBeUndefined();
  });

  it('falls back to flat for unknown styles and covers every listed style', () => {
    expect(getControlSurfaceStyles('nope', { background: bg })).toEqual(
      getControlSurfaceStyles('flat', { background: bg })
    );
    expect(getControlSurfaceStyles(undefined, { background: bg })).toEqual(
      getControlSurfaceStyles('flat', { background: bg })
    );
    for (const style of UC_CONTROL_RECIPES) {
      expect(Object.keys(getControlSurfaceStyles(style, { background: bg })).length).toBeGreaterThan(0);
    }
  });

  it('serialises to kebab-case css', () => {
    const css = getControlSurfaceStyleString('glass', { background: bg, hasCustomTextColor: false });
    expect(css).toContain('backdrop-filter: blur(6px);');
    expect(css).toContain('border: 1px solid rgba(255,255,255,0.25);');
    const outline = getControlSurfaceStyleString('outline', { background: bg, hasCustomTextColor: false });
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
