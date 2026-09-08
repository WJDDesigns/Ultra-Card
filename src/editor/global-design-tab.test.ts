import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import './global-design-tab';
import {
  DESIGN_SECTION_PROPERTIES,
  type DesignProperties,
  type GlobalDesignTab,
} from './global-design-tab';
import { mockHass } from './tabs/__tests__/layout-tab-harness';

type Payload = Record<string, unknown>;

async function mount(opts: {
  designProperties?: DesignProperties;
  responsiveDesign?: Record<string, unknown>;
  useEvent?: boolean;
}): Promise<{ el: GlobalDesignTab; payloads: Payload[] }> {
  const payloads: Payload[] = [];
  const el = document.createElement('ultra-global-design-tab') as GlobalDesignTab;
  el.hass = mockHass as any;
  el.designProperties = opts.designProperties ?? {};
  el.responsiveDesign = opts.responsiveDesign as any;
  if (opts.useEvent) {
    el.addEventListener('design-changed', (e: Event) =>
      payloads.push((e as CustomEvent).detail as Payload)
    );
  } else {
    el.onUpdate = (p: Payload) => payloads.push(p);
  }
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, payloads };
}

function priv(el: GlobalDesignTab): any {
  return el as any;
}

describe('ultra-global-design-tab', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('section map covers every DesignProperties key exactly once', () => {
    const source = readFileSync(resolve(__dirname, 'global-design-tab.ts'), 'utf8');
    const iface = source.slice(
      source.indexOf('export interface DesignProperties {'),
      source.indexOf('type DesignKey =')
    );
    const declared = [...iface.matchAll(/^\s{2}(\w+)\?:/gm)].map(m => m[1]);
    expect(declared.length).toBeGreaterThan(50);

    const mapped: string[] = [];
    for (const keys of Object.values(DESIGN_SECTION_PROPERTIES)) mapped.push(...keys);

    const missing = declared.filter(k => !mapped.includes(k));
    const duplicates = mapped.filter((k, i) => mapped.indexOf(k) !== i);
    const unknown = mapped.filter(k => !declared.includes(k));
    expect(missing, `not in any section: ${missing.join(', ')}`).toEqual([]);
    expect(duplicates, `in multiple sections: ${duplicates.join(', ')}`).toEqual([]);
    expect(unknown, `not a DesignProperties key: ${unknown.join(', ')}`).toEqual([]);
  });

  it('flat update through onUpdate normalises empty strings to undefined', async () => {
    const { el, payloads } = await mount({ designProperties: { width: '10px' } });
    priv(el)._updateProperty('width', '  ');
    expect(payloads).toEqual([{ width: undefined }]);
    expect(el.designProperties.width).toBeUndefined();
  });

  it('falls back to the design-changed event when no onUpdate is set', async () => {
    const { el, payloads } = await mount({ useEvent: true });
    priv(el)._updateProperty('font_size', '18px');
    expect(payloads).toEqual([{ font_size: '18px' }]);
  });

  it('device mode clears keys with explicit undefined so the parent deletes them', async () => {
    const { el, payloads } = await mount({
      designProperties: { color: 'red' },
      responsiveDesign: { color: 'red', mobile: { color: 'blue', font_size: '12px' } },
    });
    await el.updateComplete; // auto-enables responsive mode
    priv(el)._selectedDevice = 'mobile';
    priv(el)._updateProperty('color', '');

    expect(payloads).toHaveLength(1);
    const design = payloads[0].design as Record<string, any>;
    expect(design.mobile).toHaveProperty('color');
    expect(design.mobile.color).toBeUndefined();
    expect(design.mobile.font_size).toBe('12px');
    // no flat keys leak out of a device-only update
    expect(Object.keys(payloads[0])).toEqual(['design']);
  });

  it('section reset in device mode clears only that device\'s overrides', async () => {
    const { el, payloads } = await mount({
      designProperties: { width: '100px' },
      responsiveDesign: { width: '100px', tablet: { width: '50%', color: 'blue' } },
    });
    await el.updateComplete;
    priv(el)._selectedDevice = 'tablet';
    priv(el)._resetSection('sizes');

    const design = payloads[0].design as Record<string, any>;
    expect(design.tablet.width).toBeUndefined();
    expect(design.tablet.color).toBe('blue');
    expect(el.designProperties.width).toBe('100px');
  });

  it('desktop update in responsive mode sends flat props plus design.base', async () => {
    const { el, payloads } = await mount({
      designProperties: {},
      responsiveDesign: { mobile: { color: 'blue' } },
    });
    await el.updateComplete;
    expect(priv(el)._responsiveEnabled).toBe(true);
    priv(el)._updateProperty('color', 'red');

    expect(payloads[0].color).toBe('red');
    const design = payloads[0].design as Record<string, any>;
    expect(design.base.color).toBe('red');
    expect(design.mobile.color).toBe('blue');
  });

  it('reset all clears every visual section but keeps custom targeting', async () => {
    const { el, payloads } = await mount({
      designProperties: {
        transform_rotate_x: '10deg',
        background_filter: 'blur(2px)',
        background_size: 'contain',
        element_id: 'keep-me',
      },
    });
    priv(el)._resetAllDesign();
    const payload = payloads[0];
    expect(payload).toHaveProperty('transform_rotate_x');
    expect(payload).toHaveProperty('background_filter');
    expect(payload).toHaveProperty('background_size');
    expect(payload).not.toHaveProperty('element_id');
    expect(el.designProperties.element_id).toBe('keep-me');
    expect(el.designProperties.transform_rotate_x).toBeUndefined();
  });

  it('locking spacing mirrors top onto all sides in a single update', async () => {
    const { el, payloads } = await mount({
      designProperties: { padding_top: '8px', padding_left: '2px' },
    });
    priv(el)._toggleSpacingLock('padding');
    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toEqual({
      padding_top: '8px',
      padding_right: '8px',
      padding_bottom: '8px',
      padding_left: '8px',
    });
    // while locked, only the top field drives updates
    priv(el)._updateSpacing('padding', 'left', '99px');
    expect(payloads).toHaveLength(1);
    priv(el)._updateSpacing('padding', 'top', '4px');
    expect(payloads[1]).toEqual({
      padding_top: '4px',
      padding_right: '4px',
      padding_bottom: '4px',
      padding_left: '4px',
    });
  });

  it('arrow-key stepping keeps the typed unit and only falls back when empty', async () => {
    const { el } = await mount({});
    const step = (value: string, key: string, unit?: string, mods: Partial<KeyboardEventInit> = {}) => {
      let out = '';
      const ev = new KeyboardEvent('keydown', { key, ...mods });
      priv(el)._handleNumericKeydown(ev, value, (v: string) => (out = v), unit);
      return out;
    };
    expect(step('10px', 'ArrowUp')).toBe('11px');
    expect(step('1.5rem', 'ArrowDown')).toBe('1.4rem'); // rem/em step by 0.1
    expect(step('1.5', 'ArrowUp')).toBe('2.5'); // unitless stays unitless
    expect(step('', 'ArrowUp')).toBe('1px'); // empty -> default px
    expect(step('', 'ArrowUp', '')).toBe('1'); // z-index style field
    expect(step('', 'ArrowUp', 'deg')).toBe('1deg');
    expect(step('30deg', 'ArrowUp', 'deg', { shiftKey: true })).toBe('40deg');
    expect(step('10px', 'ArrowUp', undefined, { altKey: true })).toBe('10.1px');
  });

  it('background filter counts as a background edit and is cleared by section reset', async () => {
    const { el, payloads } = await mount({
      designProperties: { background_filter: 'grayscale(1)' },
    });
    expect(priv(el)._hasModifiedProperties('background')).toBe(true);
    priv(el)._resetSection('background');
    expect(payloads[0]).toHaveProperty('background_filter');
    expect(priv(el)._hasModifiedProperties('background')).toBe(false);
  });

  it('neutral "none" enum values are not flagged as edits', async () => {
    const { el } = await mount({
      designProperties: { animation_type: 'none', background_image_type: 'none' },
    });
    expect(priv(el)._hasModifiedProperties('animations')).toBe(false);
    expect(priv(el)._hasModifiedProperties('background')).toBe(false);
  });

  it('copy excludes element_id and empty values; paste applies the clipboard', async () => {
    const { el } = await mount({
      designProperties: { color: 'red', element_id: 'unique', width: '' },
    });
    priv(el)._copyDesign();
    const stored = JSON.parse(localStorage.getItem('ultra-card-design-clipboard') || '{}');
    expect(stored).toEqual({ color: 'red' });

    const target = await mount({ designProperties: {} });
    priv(target.el)._loadClipboardFromStorage();
    priv(target.el)._pasteDesign();
    expect(target.payloads[0]).toEqual({ color: 'red' });
  });

  it('font family select shows the stored font on first render', async () => {
    const { el } = await mount({ designProperties: { font_family: 'Roboto' } });
    const select = el.shadowRoot!.querySelector('.accordion-toggle') as HTMLElement;
    select.click();
    await el.updateComplete;
    const fontSelect = el.shadowRoot!.querySelector('select.property-select') as HTMLSelectElement;
    expect(fontSelect).toBeTruthy();
    expect(fontSelect.value).toBe('Roboto');
  });

  it('renders one accordion per section in order with reset only where edited', async () => {
    const { el } = await mount({ designProperties: { border_width: '2px' } });
    const headers = [...el.shadowRoot!.querySelectorAll('.accordion-section')];
    expect(headers).toHaveLength(Object.keys(DESIGN_SECTION_PROPERTIES).length);
    const withReset = headers.filter(h => h.querySelector('.reset-button'));
    expect(withReset).toHaveLength(1);
    expect(withReset[0].textContent).toContain('Border');
  });
});
