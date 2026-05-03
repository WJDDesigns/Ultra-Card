import { describe, it, expect } from 'vitest';
import {
  autoMigrateCardModule,
  autoMigrateTemplatesInConfig,
  migrateModuleDefaultMargins,
  migrateToUnified,
} from './template-migration';

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

  it('repairs half-migrated info_entities with unified mode enabled but empty template', () => {
    const module = {
      id: 'info-half-migrated',
      type: 'info',
      info_entities: [
        {
          id: 'fuel',
          entity: 'sensor.fuel_level',
          unified_template_mode: true,
          unified_template: '',
          dynamic_color_template_mode: true,
          dynamic_color_template: '{% if state|float(0) > 50 %}#00ff00{% else %}#ff0000{% endif %}',
        },
      ],
    } as any;

    const migrated = autoMigrateCardModule(module) as any;
    const entity = migrated.info_entities[0];

    expect(entity.unified_template_mode).toBe(true);
    expect(entity.unified_template).toContain('"icon_color"');
    expect(entity.unified_template).toContain('#00ff00');
    expect(entity.dynamic_color_template_mode).toBe(false);
    expect(entity.dynamic_color_template).toBe('');
  });

  it('adds a stable id to already-unified info_entities that were pasted without ids', () => {
    const module = {
      id: 'info-pasted-yaml',
      type: 'info',
      info_entities: [
        {
          entity: 'input_number.test_nummer',
          name: 'Test Nummer',
          icon: 'mdi:numeric',
          unified_template_mode: true,
          unified_template: '{ "icon_color": "{{ state }}" }',
        },
      ],
    } as any;

    const migrated = autoMigrateCardModule(module) as any;
    const entity = migrated.info_entities[0];

    expect(entity.id).toBe('info-entity-info-pasted-yaml-0');
    expect(entity.unified_template_mode).toBe(true);
    expect(entity.unified_template).toContain('icon_color');
  });
});

describe('autoMigrateTemplatesInConfig', () => {
  it('migrates legacy text module template fields for editor/runtime parity', () => {
    const cfg = {
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'row-1',
            columns: [
              {
                id: 'col-1',
                modules: [
                  {
                    id: 'text-1',
                    type: 'text',
                    text: 'Example',
                    template_mode: true,
                    template: "{{ now() | as_timestamp | timestamp_custom('%H') }}",
                  },
                ],
              },
            ],
          },
        ],
      },
    } as any;

    const migrated = autoMigrateTemplatesInConfig(cfg);
    const text = migrated.layout.rows[0].columns[0].modules[0] as any;

    expect(text.unified_template_mode).toBe(true);
    expect(text.unified_template).toContain('"content"');
    expect(text.unified_template).toContain('timestamp_custom');
    expect(text.template_mode).toBe(false);
    expect(text.template).toBe('');
  });
});

describe('migrateModuleDefaultMargins (v1/v2 → v3)', () => {
  // Helper: build a single-module config with a column-level dropdown
  const buildConfig = (moduleProps: Record<string, any>) =>
    ({
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'row-1',
            columns: [
              {
                id: 'col-1',
                modules: [
                  {
                    id: 'dropdown-1',
                    type: 'dropdown',
                    ...moduleProps,
                  },
                ],
              },
            ],
          },
        ],
      },
    }) as any;

  const getModule = (cfg: any) => cfg.layout.rows[0].columns[0].modules[0];

  it('stamps both 8px defaults to flat AND design when the user set no margins at all', () => {
    const cfg = buildConfig({});
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin_top).toBe('8px');
    expect(m.margin_bottom).toBe('8px');
    expect(m.design.margin_top).toBe('8px');
    expect(m.design.margin_bottom).toBe('8px');
    expect(cfg._config_version).toBe(3);
  });

  it('preserves user margin_top and stamps the missing margin_bottom default in both forms', () => {
    const cfg = buildConfig({ margin_top: '20px' });
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin_top).toBe('20px');
    expect(m.margin_bottom).toBe('8px');
    expect(m.design.margin_top).toBeUndefined();
    expect(m.design.margin_bottom).toBe('8px');
  });

  it('stamps both top/bottom 8px when only margin_left is set', () => {
    const cfg = buildConfig({ margin_left: '-10px' });
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin_left).toBe('-10px');
    expect(m.margin_top).toBe('8px');
    expect(m.margin_bottom).toBe('8px');
    expect(m.design.margin_top).toBe('8px');
    expect(m.design.margin_bottom).toBe('8px');
  });

  it('handles the reported case: negative margin_top + margin_left → keeps both, stamps 8px bottom', () => {
    const cfg = buildConfig({
      margin_top: '-99px',
      margin_left: '-113px',
      margin: { top: '-99px', left: '-113px' },
    });
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin_top).toBe('-99px');
    expect(m.margin_left).toBe('-113px');
    expect(m.margin_bottom).toBe('8px');
    expect(m.design.margin_top).toBeUndefined();
    expect(m.design.margin_bottom).toBe('8px');
    expect(m.design.margin_left).toBeUndefined();
  });

  it('is a no-op when the user explicitly set both top and bottom', () => {
    const cfg = buildConfig({ margin_top: '5px', margin_bottom: '5px' });
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin_top).toBe('5px');
    expect(m.margin_bottom).toBe('5px');
    expect(m.design).toBeUndefined();
  });

  it('treats the legacy nested margin object as explicit (does not double-stamp)', () => {
    const cfg = buildConfig({ margin: { top: '4px', bottom: '4px' } });
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin.top).toBe('4px');
    expect(m.margin.bottom).toBe('4px');
    expect(m.design).toBeUndefined();
  });

  it('treats existing design.margin_top as explicit', () => {
    const cfg = buildConfig({ design: { margin_top: '12px' } });
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.design.margin_top).toBe('12px');
    expect(m.design.margin_bottom).toBe('8px');
    expect(m.margin_bottom).toBe('8px');
  });

  it('treats nested design.margin.bottom as explicit', () => {
    const cfg = buildConfig({ design: { margin: { bottom: '0px' } } });
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.design.margin.bottom).toBe('0px');
    expect(m.design.margin_bottom).toBeUndefined();
    expect(m.design.margin_top).toBe('8px');
    expect(m.margin_top).toBe('8px');
  });

  it('stamps legacy defaults for nested modules with NO margin set', () => {
    const cfg = {
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'row-1',
            columns: [
              {
                id: 'col-1',
                modules: [
                  {
                    id: 'vert-1',
                    type: 'vertical',
                    modules: [{ id: 'dropdown-inner', type: 'dropdown' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    } as any;
    migrateModuleDefaultMargins(cfg);
    const inner = cfg.layout.rows[0].columns[0].modules[0].modules[0];
    expect(inner.margin_top).toBe('8px');
    expect(inner.margin_bottom).toBe('8px');
    expect(inner.design.margin_top).toBe('8px');
    expect(inner.design.margin_bottom).toBe('8px');
  });

  it('stamps missing direction on inside-container child WITH a partial margin override', () => {
    // Mirrors the reported case: spinbox inside vertical with only margin_top set.
    // applyLayoutDesignToChild leaves all margins alone when any is explicit,
    // so v1's render-time 8px bottom default must be persisted explicitly.
    const cfg = {
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'row-1',
            columns: [
              {
                id: 'col-1',
                modules: [
                  {
                    id: 'vert-1',
                    type: 'vertical',
                    modules: [
                      {
                        id: 'spinbox-1',
                        type: 'spinbox',
                        margin_top: '128px',
                        design: { margin_top: '128px' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    } as any;
    migrateModuleDefaultMargins(cfg);
    const inner = cfg.layout.rows[0].columns[0].modules[0].modules[0];
    expect(inner.margin_top).toBe('128px');
    expect(inner.margin_bottom).toBe('8px');
    expect(inner.design.margin_top).toBe('128px');
    expect(inner.design.margin_bottom).toBe('8px');
  });

  it('does not touch non-legacy module types (e.g. markdown)', () => {
    const cfg = {
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'row-1',
            columns: [
              { id: 'col-1', modules: [{ id: 'md-1', type: 'markdown' }] },
            ],
          },
        ],
      },
    } as any;
    migrateModuleDefaultMargins(cfg);
    const m = cfg.layout.rows[0].columns[0].modules[0];
    expect(m.design).toBeUndefined();
  });

  it('is idempotent — second run after _config_version=3 is a no-op', () => {
    const cfg = buildConfig({ margin_top: '20px' });
    migrateModuleDefaultMargins(cfg);
    expect(cfg._config_version).toBe(3);
    // Mutate stamped value to verify second run does NOT overwrite it
    getModule(cfg).design.margin_bottom = '0px';
    migrateModuleDefaultMargins(cfg);
    expect(getModule(cfg).design.margin_bottom).toBe('0px');
  });

  it('repairs previously-saved v2 configs with partial explicit margins', () => {
    const cfg = {
      _config_version: 2,
      ...buildConfig({ margin_top: '-99px', margin_left: '-113px' }),
    } as any;
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin_top).toBe('-99px');
    expect(m.margin_left).toBe('-113px');
    expect(m.margin_bottom).toBe('8px');
    expect(m.design.margin_bottom).toBe('8px');
    expect(cfg._config_version).toBe(3);
  });

  it('does not stamp no-margin modules during v2 repair mode', () => {
    const cfg = {
      _config_version: 2,
      ...buildConfig({}),
    } as any;
    migrateModuleDefaultMargins(cfg);
    const m = getModule(cfg);
    expect(m.margin_top).toBeUndefined();
    expect(m.margin_bottom).toBeUndefined();
    expect(m.design).toBeUndefined();
    expect(cfg._config_version).toBe(3);
  });
});
