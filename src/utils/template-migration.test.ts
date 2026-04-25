import { describe, it, expect } from 'vitest';
import { autoMigrateCardModule, migrateToUnified } from './template-migration';

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

describe('autoMigrateCardModule info', () => {
  it('migrates legacy templates inside info_entities', () => {
    const module = {
      id: 'info-existing-card',
      type: 'info',
      info_entities: [
        {
          id: 'left-rear',
          entity: 'sensor.left_rear_tire',
          dynamic_color_template_mode: true,
          dynamic_color_template: '{% if state|float(0) > 35 %}green{% else %}red{% endif %}',
        },
      ],
    } as any;

    const migrated = autoMigrateCardModule(module) as any;
    const entity = migrated.info_entities[0];

    expect(entity.unified_template_mode).toBe(true);
    expect(entity.unified_template).toContain('"icon_color"');
    expect(entity.dynamic_color_template_mode).toBe(false);
    expect(entity.dynamic_color_template).toBe('');
  });
});
