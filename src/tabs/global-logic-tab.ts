import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import { FormUtils } from '../utils/form-utils';
import type { CardModule } from '../types';
import { localize } from '../localize/localize';
import '../components/ultra-template-editor';

export class GlobalLogicTab {
  static render<M extends CardModule>(
    module: M,
    hass: HomeAssistant,
    updateModule: (updates: Partial<M>) => void
  ): TemplateResult {
    const conditions = ((module as any).display_conditions || []) as any[];
    const displayMode = ((module as any).display_mode || 'always') as 'always' | 'every' | 'any';
    const lang = hass?.locale?.language || 'en';

    return html`
      <div class="uc-global-logic-tab">
        ${FormUtils.injectCleanFormStyles()}
        <!-- Display Mode -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          ${FormUtils.renderField(
            localize('editor.layout_logic.display_title', lang, 'Display this Module'),
            localize(
              'editor.layout_logic.display_desc',
              lang,
              'Control when this module is shown. Choose "Always" to keep it visible. Select "If EVERY" or "If ANY" to display it only when the conditions you add below evaluate to true.'
            ),
            hass,
            { display_mode: displayMode },
            [
              FormUtils.createSchemaItem('display_mode', {
                select: {
                  options: [
                    {
                      value: 'always',
                      label: localize('editor.layout_logic.always', lang, 'Always'),
                    },
                    {
                      value: 'every',
                      label: localize(
                        'editor.layout_logic.every',
                        lang,
                        'If EVERY condition below is met'
                      ),
                    },
                    {
                      value: 'any',
                      label: localize(
                        'editor.layout_logic.any',
                        lang,
                        'If ANY condition below is met'
                      ),
                    },
                  ],
                  mode: 'dropdown',
                },
              }),
            ],
            (e: CustomEvent) => {
              updateModule({ display_mode: e.detail.value.display_mode } as any);
            }
          )}
        </div>

        <!-- Conditions List -->
        ${displayMode !== 'always'
          ? html`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
              >
                <div
                  style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;"
                >
                  <div style="font-size: 16px; font-weight: 700;">
                    ${localize('editor.layout_logic.conditions', lang, 'Conditions')}
                  </div>
                  <button
                    class="add-condition"
                    @click=${() => {
                      const newCond = {
                        id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        type: 'entity_state',
                        ui_expanded: true,
                        entity: '',
                        operator: '=',
                        value: '',
                      } as any;
                      const next = [...conditions, newCond];
                      updateModule({ display_conditions: next } as any);
                    }}
                    style="display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px dashed var(--primary-color); background:none; color:var(--primary-color); border-radius:6px; cursor:pointer;"
                    title="${localize('editor.layout_logic.add_condition', lang, 'Add Condition')}"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    ${localize('editor.layout_logic.add_condition', lang, 'Add Condition')}
                  </button>
                </div>

                <div style="display:flex; flex-direction: column; gap: 12px;">
                  ${conditions.length === 0
                    ? html`
                        <div
                          style="text-align: center; padding: 24px; color: var(--secondary-text-color); font-style: italic;"
                        >
                          ${localize(
                            'editor.layout_logic.no_conditions',
                            lang,
                            'No conditions added yet. Click "Add Condition" to get started.'
                          )}
                        </div>
                      `
                    : ''}
                  ${conditions.map((cond, index) => {
                    const onChange = (updates: Record<string, any>) => {
                      const next = [...conditions];
                      next[index] = { ...cond, ...updates };
                      updateModule({ display_conditions: next } as any);
                    };
                    const remove = () => {
                      const next = conditions.filter((_, i) => i !== index);
                      updateModule({ display_conditions: next } as any);
                    };

                    // Drag and drop handlers to reorder conditions
                    const onDragStart = (e: DragEvent) => {
                      if (!e.dataTransfer) return;
                      e.dataTransfer.setData('text/plain', String(index));
                      e.dataTransfer.effectAllowed = 'move';
                    };
                    const onDragOver = (e: DragEvent) => {
                      e.preventDefault();
                    };
                    const onDrop = (e: DragEvent) => {
                      e.preventDefault();
                      if (!e.dataTransfer) return;
                      const from = Number(e.dataTransfer.getData('text/plain'));
                      const to = index;
                      if (isNaN(from) || from === to) return;
                      const next = [...conditions];
                      const [moved] = next.splice(from, 1);
                      next.splice(to, 0, moved);
                      updateModule({ display_conditions: next } as any);
                    };

                    const expanded = (cond as any).ui_expanded !== false;
                    const headerLabel =
                      (cond as any).custom_name ||
                      `${localize('editor.layout_logic.condition_header', lang, 'Condition')} ${index + 1}`;

                    return html` <div
                      class="uc-condition-item"
                      draggable="true"
                      @dragstart=${onDragStart}
                      @dragover=${onDragOver}
                      @drop=${onDrop}
                      style="border:1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); overflow: hidden;"
                    >
                      <div
                        class="uc-condition-header"
                        style="display:flex; align-items:center; justify-content: space-between; gap:10px; padding: 12px 14px; border-bottom: 1px solid var(--divider-color);"
                      >
                        <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                          <button
                            @click=${() => onChange({ ui_expanded: !expanded })}
                            title=${expanded ? 'Collapse' : 'Expand'}
                            style="background:none; border:none; color:var(--secondary-text-color); cursor:pointer;"
                          >
                            <ha-icon
                              icon=${expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                            ></ha-icon>
                          </button>
                          <span
                            style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
                            >${headerLabel}</span
                          >
                        </div>
                        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                          <button
                            @click=${() => {
                              const copy = {
                                ...(cond as any),
                                id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                              };
                              const next = [...conditions];
                              next.splice(index + 1, 0, copy);
                              updateModule({ display_conditions: next } as any);
                            }}
                            style="background:none; border:none; padding:4px; cursor:pointer; color: var(--secondary-text-color);"
                            title="Duplicate Condition"
                          >
                            <ha-icon
                              icon="mdi:content-copy"
                              style="--mdi-icon-size: 18px;"
                            ></ha-icon>
                          </button>
                          <button
                            @click=${remove}
                            style="background:none; border:none; padding:4px; cursor:pointer; color: var(--error-color);"
                            title="Remove Condition"
                          >
                            <ha-icon
                              icon="mdi:trash-can-outline"
                              style="--mdi-icon-size: 18px;"
                            ></ha-icon>
                          </button>
                          <button
                            class="condition-drag-handle"
                            title="Drag to reorder"
                            style="background:none; border:none; padding:4px; cursor:grab; display:inline-flex; align-items:center; justify-content:center; color: var(--secondary-text-color);"
                          >
                            <ha-icon icon="mdi:dots-grid" style="--mdi-icon-size: 18px;"></ha-icon>
                          </button>
                        </div>
                      </div>

                      ${expanded
                        ? html`
                            <div
                              style="padding: 12px 14px; display:flex; flex-direction:column; gap:12px;"
                            >
                              ${FormUtils.renderField(
                                localize('editor.layout_logic.custom_name', lang, 'Custom Name'),
                                localize(
                                  'editor.layout_logic.custom_name_desc',
                                  lang,
                                  'Optional: Give this condition a custom name for easier identification'
                                ),
                                hass,
                                { custom_name: (cond as any).custom_name || '' },
                                [FormUtils.createSchemaItem('custom_name', { text: {} })],
                                (e: CustomEvent) => onChange(e.detail.value)
                              )}
                              ${FormUtils.renderField(
                                localize(
                                  'editor.layout_logic.condition_type',
                                  lang,
                                  'Condition Type'
                                ),
                                '',
                                hass,
                                { type: (cond as any).type || 'entity_state' },
                                [
                                  FormUtils.createSchemaItem('type', {
                                    select: {
                                      options: [
                                        {
                                          value: 'entity_state',
                                          label: localize(
                                            'editor.layout_logic.condition_types.entity_state',
                                            lang,
                                            'Entity State'
                                          ),
                                        },
                                        {
                                          value: 'entity_attribute',
                                          label: localize(
                                            'editor.layout_logic.condition_types.entity_attribute',
                                            lang,
                                            'Entity Attribute'
                                          ),
                                        },
                                        {
                                          value: 'time',
                                          label: localize(
                                            'editor.layout_logic.condition_types.time',
                                            lang,
                                            'Time Range'
                                          ),
                                        },
                                        {
                                          value: 'template',
                                          label: localize(
                                            'editor.layout_logic.condition_types.template',
                                            lang,
                                            'Template'
                                          ),
                                        },
                                      ],
                                      mode: 'dropdown',
                                    },
                                  }),
                                ],
                                (e: CustomEvent) => {
                                  const newType = e.detail.value.type;
                                  const base: any = { type: newType };
                                  if (newType === 'entity_state') {
                                    Object.assign(base, { entity: '', operator: '=', value: '' });
                                  } else if (newType === 'entity_attribute') {
                                    Object.assign(base, {
                                      entity: '',
                                      attribute: '',
                                      operator: '=',
                                      value: '',
                                    });
                                  } else if (newType === 'time') {
                                    Object.assign(base, { time_from: '00:00', time_to: '23:59' });
                                  } else if (newType === 'template') {
                                    Object.assign(base, { template: '' });
                                  }
                                  onChange(base);
                                }
                              )}
                              ${(() => {
                                if (((cond as any).type || 'entity_state') === 'entity_state') {
                                  return html`
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.entity',
                                        lang,
                                        'Entity'
                                      ),
                                      '',
                                      hass,
                                      { entity: (cond as any).entity || '' },
                                      [FormUtils.createSchemaItem('entity', { entity: {} })],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.operator',
                                        lang,
                                        'Operator'
                                      ),
                                      '',
                                      hass,
                                      { operator: (cond as any).operator || '=' },
                                      [
                                        FormUtils.createSchemaItem('operator', {
                                          select: {
                                            options: [
                                              { value: '=', label: '=' },
                                              { value: '!=', label: '!=' },
                                              { value: '>', label: '>' },
                                              { value: '>=', label: '>=' },
                                              { value: '<', label: '<' },
                                              { value: '<=', label: '<=' },
                                              { value: 'contains', label: 'contains' },
                                              { value: 'not_contains', label: 'not_contains' },
                                              { value: 'has_value', label: 'has_value' },
                                              { value: 'no_value', label: 'no_value' },
                                            ],
                                            mode: 'dropdown',
                                          },
                                        }),
                                      ],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.value',
                                        lang,
                                        'Value'
                                      ),
                                      '',
                                      hass,
                                      { value: (cond as any).value || '' },
                                      [FormUtils.createSchemaItem('value', { text: {} })],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                  `;
                                }

                                if ((cond as any).type === 'entity_attribute') {
                                  return html`
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.entity',
                                        lang,
                                        'Entity'
                                      ),
                                      '',
                                      hass,
                                      { entity: (cond as any).entity || '' },
                                      [FormUtils.createSchemaItem('entity', { entity: {} })],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.attribute',
                                        lang,
                                        'Attribute'
                                      ),
                                      '',
                                      hass,
                                      { attribute: (cond as any).attribute || '' },
                                      [FormUtils.createSchemaItem('attribute', { text: {} })],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.operator',
                                        lang,
                                        'Operator'
                                      ),
                                      '',
                                      hass,
                                      { operator: (cond as any).operator || '=' },
                                      [
                                        FormUtils.createSchemaItem('operator', {
                                          select: {
                                            options: [
                                              { value: '=', label: '=' },
                                              { value: '!=', label: '!=' },
                                              { value: '>', label: '>' },
                                              { value: '>=', label: '>=' },
                                              { value: '<', label: '<' },
                                              { value: '<=', label: '<=' },
                                              { value: 'contains', label: 'contains' },
                                              { value: 'not_contains', label: 'not_contains' },
                                            ],
                                            mode: 'dropdown',
                                          },
                                        }),
                                      ],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.value',
                                        lang,
                                        'Value'
                                      ),
                                      '',
                                      hass,
                                      { value: (cond as any).value || '' },
                                      [FormUtils.createSchemaItem('value', { text: {} })],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                  `;
                                }

                                if ((cond as any).type === 'time') {
                                  return html`
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.time_from',
                                        lang,
                                        'From'
                                      ),
                                      '',
                                      hass,
                                      { time_from: (cond as any).time_from || '00:00' },
                                      [FormUtils.createSchemaItem('time_from', { text: {} })],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                    ${FormUtils.renderField(
                                      localize(
                                        'editor.layout_logic.condition_fields.time_to',
                                        lang,
                                        'To'
                                      ),
                                      '',
                                      hass,
                                      { time_to: (cond as any).time_to || '23:59' },
                                      [FormUtils.createSchemaItem('time_to', { text: {} })],
                                      (e: CustomEvent) => onChange(e.detail.value)
                                    )}
                                  `;
                                }

                                return html`
                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div
                                      class="field-title"
                                      style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                                    >
                                      ${localize(
                                        'editor.layout_logic.condition_fields.template',
                                        lang,
                                        'Template'
                                      )}
                                    </div>
                                    <div
                                      class="field-description"
                                      style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                                    >
                                      Jinja2 template that should evaluate to true/false.
                                    </div>
                                    <div
                                      @mousedown=${(e: Event) => {
                                        // Only stop propagation for drag operations, not clicks on the editor
                                        const target = e.target as HTMLElement;
                                        if (!target.closest('ultra-template-editor') && !target.closest('.cm-editor')) {
                                          e.stopPropagation();
                                        }
                                      }}
                                      @dragstart=${(e: Event) => e.stopPropagation()}
                                    >
                                      <ultra-template-editor
                                        .hass=${hass}
                                        .value=${(cond as any).template || ''}
                                        .placeholder=${"{% if states('sensor.example') | int > 50 %}true{% else %}false{% endif %}"}
                                        .minHeight=${100}
                                        .maxHeight=${300}
                                        @value-changed=${(e: CustomEvent) =>
                                          onChange({ template: e.detail.value })}
                                      ></ultra-template-editor>
                                    </div>
                                  </div>
                                `;
                              })()}
                            </div>
                          `
                        : ''}
                    </div>`;
                  })}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }
}
