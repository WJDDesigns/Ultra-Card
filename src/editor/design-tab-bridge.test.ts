import { describe, it, expect } from 'vitest';
import {
  applyModuleDesignUpdates,
  extractModuleDesignProperties,
} from './design-tab-bridge';

describe('design-tab-bridge', () => {
  it('extracts design and top-level props', () => {
    const props = extractModuleDesignProperties({
      id: 't1',
      type: 'text',
      color: '#fff',
      design: { padding_top: '4px', text_align: 'center' },
    } as any);
    expect(props.padding_top).toBe('4px');
    expect(props.text_align).toBe('center');
    expect(props.color).toBe('#fff');
  });

  it('extracts text shadow and 3D transform values stored in design', () => {
    const props = extractModuleDesignProperties({
      id: 't1',
      type: 'text',
      design: {
        text_shadow_h: '1px',
        text_shadow_v: '2px',
        text_shadow_blur: '3px',
        text_shadow_color: '#000',
        transform_perspective: '800px',
        transform_rotate_x: '10deg',
        transform_rotate_y: '20deg',
        transform_rotate_z: '30deg',
      },
    } as any);
    expect(props.text_shadow_h).toBe('1px');
    expect(props.text_shadow_v).toBe('2px');
    expect(props.text_shadow_blur).toBe('3px');
    expect(props.text_shadow_color).toBe('#000');
    expect(props.transform_perspective).toBe('800px');
    expect(props.transform_rotate_x).toBe('10deg');
    expect(props.transform_rotate_y).toBe('20deg');
    expect(props.transform_rotate_z).toBe('30deg');
  });

  it('merges flat updates into design', () => {
    const module = {
      id: 't1',
      type: 'text',
      design: { padding_top: '2px' },
    } as any;
    const next = applyModuleDesignUpdates(module, { padding_top: '8px', text_align: 'left' });
    expect(next.design.padding_top).toBe('8px');
    expect(next.design.text_align).toBe('left');
  });

  it('passes through responsive design payloads', () => {
    const module = { id: 't1', type: 'text', design: {} } as any;
    const design = { base: { color: 'red' }, mobile: { color: 'blue' } };
    const next = applyModuleDesignUpdates(module, { design } as any);
    expect(next.design).toEqual(design);
  });
});
