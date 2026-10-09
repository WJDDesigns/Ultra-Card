import { describe, it, expect } from 'vitest';
import {
  UC_TRIGGER_ICON_BACKGROUND_PADDING_DEFAULT,
  UC_TRIGGER_ICON_SIZE_DEFAULT,
  ucTriggerAlignStyle,
  ucTriggerIconChromeStyle,
  ucTriggerIconGlyphStyle,
  ucTriggerIconIntrinsicPx,
} from './uc-trigger-icon';

describe('ucTriggerAlignStyle', () => {
  it('builds a full-width flex row so left/right can move the trigger', () => {
    expect(ucTriggerAlignStyle('right')).toBe(
      'display: flex; justify-content: flex-end; width: 100%; pointer-events: auto; box-sizing: border-box;'
    );
    expect(ucTriggerAlignStyle('left')).toBe(
      'display: flex; justify-content: flex-start; width: 100%; pointer-events: auto; box-sizing: border-box;'
    );
    expect(ucTriggerAlignStyle('center')).toBe(
      'display: flex; justify-content: center; width: 100%; pointer-events: auto; box-sizing: border-box;'
    );
  });

  it('uses the fallback when alignment is unset (Drawer stays left)', () => {
    expect(ucTriggerAlignStyle(undefined, 'left')).toContain('justify-content: flex-start');
    expect(ucTriggerAlignStyle(undefined, 'center')).toContain('justify-content: center');
  });
});

describe('ucTriggerIconChromeStyle', () => {
  it('leaves a bare icon when background is none', () => {
    expect(ucTriggerIconChromeStyle({})).toBe(
      'display: inline-flex; align-items: center; justify-content: center'
    );
    expect(ucTriggerIconChromeStyle({ background: 'none' })).not.toContain('border-radius');
    expect(ucTriggerIconChromeStyle({ background: 'none' })).not.toContain('padding:');
  });

  it('draws a circle well with padding and colour', () => {
    const css = ucTriggerIconChromeStyle({
      background: 'circle',
      backgroundColor: 'rgb(1, 2, 3)',
      backgroundPadding: 12,
    });
    expect(css).toContain('border-radius: 50%');
    expect(css).toContain('padding: 12px');
    expect(css).toContain('background: rgb(1, 2, 3)');
  });

  it('draws a rounded-square well with the default padding', () => {
    const css = ucTriggerIconChromeStyle({ background: 'rounded-square' });
    expect(css).toContain('border-radius: var(--uc-r-8, 8px)');
    expect(css).toContain(`padding: ${UC_TRIGGER_ICON_BACKGROUND_PADDING_DEFAULT}px`);
    expect(css).toContain('background: var(--secondary-background-color)');
  });
});

describe('ucTriggerIconGlyphStyle', () => {
  it('sizes and colours the ha-icon glyph', () => {
    expect(ucTriggerIconGlyphStyle({ iconSize: 32, iconColor: 'red' })).toBe(
      '--mdc-icon-size: 32px; color: red; display: flex;'
    );
  });

  it('falls back to popup defaults', () => {
    expect(ucTriggerIconGlyphStyle({})).toBe(
      `--mdc-icon-size: ${UC_TRIGGER_ICON_SIZE_DEFAULT}px; color: var(--primary-color); display: flex;`
    );
  });
});

describe('ucTriggerIconIntrinsicPx', () => {
  it('returns the fallback when icon size is unset', () => {
    expect(ucTriggerIconIntrinsicPx({}, 42)).toBe(42);
    expect(ucTriggerIconIntrinsicPx({})).toBe(UC_TRIGGER_ICON_SIZE_DEFAULT);
  });

  it('uses glyph size when background is none', () => {
    expect(ucTriggerIconIntrinsicPx({ iconSize: 32, background: 'none' }, 42)).toBe(32);
  });

  it('adds well padding on both sides for a shaped background', () => {
    expect(
      ucTriggerIconIntrinsicPx(
        { iconSize: 24, background: 'circle', backgroundPadding: 8 },
        42
      )
    ).toBe(40);
  });
});
