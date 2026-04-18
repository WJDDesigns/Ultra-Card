import { describe, it, expect } from 'vitest';
import { migrateToUnified } from './template-migration';

describe('migrateToUnified bar', () => {
  it('does not map percentage_template to unified value in difference mode', () => {
    const cfg = {
      percentage_type: 'difference',
      percentage_template: '{{ states("sensor.x") | float }}',
    };
    const result = migrateToUnified(cfg, 'bar');
    expect(result.unified_template_mode).toBe(false);
    expect(result.unified_template).not.toContain('"value"');
  });

  it('still migrates percentage_template for entity mode', () => {
    const cfg = {
      percentage_type: 'entity',
      percentage_template: '{{ 50 }}',
    };
    const result = migrateToUnified(cfg, 'bar');
    expect(result.migratedFrom).toContain('percentage_template');
    expect(result.unified_template).toContain('"value"');
    expect(result.unified_template_mode).toBe(true);
  });
});
