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
