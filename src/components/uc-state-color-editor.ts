import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { HomeAssistant } from '../ha/types';
import type { DisplayCondition } from '../types';
import { localize, uiLanguage } from '../localize/localize';
import { UcFormUtils } from '../utils/uc-form-utils';
import {
  StateColorRule,
  StateColorValue,
  newStateColorCondition,
  newStateColorRule,
  resolveStateColor,
} from '../utils/uc-state-color';

const OPERATORS = [
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'contains',
  'not_contains',
  'has_value',
  'no_value',
] as const;

/**
 * Rule list for a colour picker in "By state" mode: each rule is a colour plus
 * the conditions that switch it on; the fallback applies when no rule matches.
 * Fires `value-changed` with the whole StateColorValue.
 */
@customElement('uc-state-color-editor')
export class UcStateColorEditor extends LitElement {
  @property({ attribute: false }) public hass: HomeAssistant | undefined;
  @property({ attribute: false }) public value!: StateColorValue;
  @property({ type: Boolean, attribute: 'no-gradients' }) public noGradients = false;

  private _t(key: string, fallback: string): string {
    return localize(`editor.state_color.${key}`, uiLanguage(), fallback);
  }

  private _emit(next: StateColorValue): void {
    this.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: next }, bubbles: true, composed: true })
    );
  }

  private _rules(): StateColorRule[] {
    return Array.isArray(this.value?.rules) ? this.value.rules : [];
  }

  private _setRules(rules: StateColorRule[]): void {
    this._emit({ ...this.value, rules });
  }

  private _updateRule(index: number, patch: Partial<StateColorRule>): void {
    const rules = [...this._rules()];
    rules[index] = { ...rules[index], ...patch };
    this._setRules(rules);
  }

  private _updateCondition(ruleIndex: number, condIndex: number, patch: Partial<DisplayCondition>): void {
    const rule = this._rules()[ruleIndex];
    const conditions = [...(rule.conditions || [])];
    conditions[condIndex] = { ...conditions[condIndex], ...patch } as DisplayCondition;
    this._updateRule(ruleIndex, { conditions });
  }

  private _moveRule(index: number, delta: number): void {
    const rules = [...this._rules()];
    const to = index + delta;
    if (to < 0 || to >= rules.length) return;
    const [moved] = rules.splice(index, 1);
    rules.splice(to, 0, moved);
    this._setRules(rules);
  }

  /** Inner pickers and forms fire their own value-changed; keep them from reaching the module editor. */
  private _stop(e: Event): void {
    e.stopPropagation();
  }

  private _form(data: Record<string, unknown>, schema: unknown[], onChange: (v: Record<string, never>) => void): TemplateResult {
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${() => ''}
      @value-changed=${(e: CustomEvent) => {
        e.stopPropagation();
        onChange(e.detail.value);
      }}
    ></ha-form>`;
  }

  private _renderCondition(cond: DisplayCondition, ruleIndex: number, condIndex: number, canRemove: boolean): TemplateResult {
    const type = cond.type || 'entity_state';
    const op = cond.operator || '=';
    const needsValue = op !== 'has_value' && op !== 'no_value';
    const typeOptions = [
      { value: 'entity_state', label: this._t('type_state', 'Entity state') },
      { value: 'entity_attribute', label: this._t('type_attribute', 'Entity attribute') },
      { value: 'template', label: this._t('type_template', 'Template') },
    ];

    return html`
      <div class="condition">
        <div class="condition-row">
          <div class="grow">
            ${this._form(
              { type },
              [{ name: 'type', selector: { select: { options: typeOptions, mode: 'dropdown' } } }],
              v => {
                if (v.type === type) return;
                const base: Partial<DisplayCondition> =
                  v.type === 'template'
                    ? { type: 'template', template: '', entity: undefined, attribute: undefined }
                    : { type: v.type, operator: '=', value: '' };
                this._updateCondition(ruleIndex, condIndex, base);
              }
            )}
          </div>
          ${canRemove
            ? html`<button
                class="icon-btn danger"
                type="button"
                title=${this._t('remove_condition', 'Remove condition')}
                @click=${() => {
                  const rule = this._rules()[ruleIndex];
                  this._updateRule(ruleIndex, {
                    conditions: rule.conditions.filter((_, i) => i !== condIndex),
                  });
                }}
              >
                <ha-icon icon="mdi:close"></ha-icon>
              </button>`
            : nothing}
        </div>
        ${type === 'template'
          ? html`<div @value-changed=${this._stop}>
              <ultra-template-editor
                .hass=${this.hass}
                .value=${cond.template || ''}
                .placeholder=${"{{ is_state('climate.bedroom', 'heat') }}"}
                .minHeight=${60}
                .maxHeight=${200}
                @value-changed=${(e: CustomEvent) => {
                  e.stopPropagation();
                  this._updateCondition(ruleIndex, condIndex, { template: e.detail.value });
                }}
              ></ultra-template-editor>
            </div>`
          : html`
              ${this._form({ entity: cond.entity || '' }, [{ name: 'entity', selector: { entity: {} } }], v =>
                this._updateCondition(ruleIndex, condIndex, { entity: v.entity || '' })
              )}
              ${type === 'entity_attribute'
                ? html`<div class="sub-label">${this._t('attribute', 'Attribute')}</div>
                    ${this._form(
                      { attribute: cond.attribute || '' },
                      [
                        {
                          name: 'attribute',
                          selector: cond.entity
                            ? { attribute: { entity_id: cond.entity } }
                            : { text: {} },
                        },
                      ],
                      v => this._updateCondition(ruleIndex, condIndex, { attribute: v.attribute || '' })
                    )}`
                : nothing}
              <div class="condition-row">
                <div class="op">
                  ${this._form(
                    { operator: op },
                    [
                      {
                        name: 'operator',
                        selector: {
                          select: {
                            options: OPERATORS.map(o => ({ value: o, label: o })),
                            mode: 'dropdown',
                          },
                        },
                      },
                    ],
                    v => this._updateCondition(ruleIndex, condIndex, { operator: v.operator })
                  )}
                </div>
                ${needsValue
                  ? html`<div class="grow">
                      ${this._form(
                        { value: cond.value ?? '' },
                        [UcFormUtils.conditionValue('value', this.hass, cond as { entity?: string; operator?: string; attribute?: string })],
                        v => this._updateCondition(ruleIndex, condIndex, { value: v.value ?? '' })
                      )}
                    </div>`
                  : nothing}
              </div>
            `}
      </div>
    `;
  }

  private _renderRule(rule: StateColorRule, index: number, count: number, activeIndex: number): TemplateResult {
    const conditions = rule.conditions || [];
    const match = rule.match === 'any' ? 'any' : 'every';
    return html`
      <div class="rule ${index === activeIndex ? 'active' : ''}">
        <div class="rule-head">
          <span class="rule-title">
            ${this._t('rule', 'Rule')} ${index + 1}
            ${index === activeIndex
              ? html`<span class="badge">${this._t('active_now', 'Active now')}</span>`
              : nothing}
          </span>
          <span class="rule-actions">
            <button class="icon-btn" type="button" title=${this._t('move_up', 'Move up')}
              ?disabled=${index === 0} @click=${() => this._moveRule(index, -1)}>
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </button>
            <button class="icon-btn" type="button" title=${this._t('move_down', 'Move down')}
              ?disabled=${index === count - 1} @click=${() => this._moveRule(index, 1)}>
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </button>
            <button class="icon-btn danger" type="button" title=${this._t('remove_rule', 'Remove rule')}
              @click=${() => this._setRules(this._rules().filter((_, i) => i !== index))}>
              <ha-icon icon="mdi:trash-can-outline"></ha-icon>
            </button>
          </span>
        </div>

        <div class="sub-label">${this._t('use_color', 'Use this color')}</div>
        <ultra-color-picker
          .hass=${this.hass}
          .value=${rule.color}
          ?no-gradients=${this.noGradients}
          no-state
          @value-changed=${(e: CustomEvent) => {
            e.stopPropagation();
            this._updateRule(index, { color: e.detail.value });
          }}
        ></ultra-color-picker>

        <div class="when-row">
          <span class="sub-label">${this._t('when', 'When')}</span>
          ${conditions.length > 1
            ? html`<div class="match">
                ${this._form(
                  { match },
                  [
                    {
                      name: 'match',
                      selector: {
                        select: {
                          options: [
                            { value: 'every', label: this._t('match_every', 'all of these are true') },
                            { value: 'any', label: this._t('match_any', 'any of these is true') },
                          ],
                          mode: 'dropdown',
                        },
                      },
                    },
                  ],
                  v => this._updateRule(index, { match: v.match })
                )}
              </div>`
            : nothing}
        </div>
        ${conditions.map((c, ci) => this._renderCondition(c, index, ci, conditions.length > 1))}
        <button
          class="add-btn small"
          type="button"
          @click=${() => this._updateRule(index, { conditions: [...conditions, newStateColorCondition()] })}
        >
          <ha-icon icon="mdi:plus"></ha-icon>${this._t('add_condition', 'Add condition')}
        </button>
      </div>
    `;
  }

  protected override render(): TemplateResult {
    if (!this.value) return html``;
    const rules = this._rules();
    const current = resolveStateColor(this.value, this.hass);
    const activeIndex = this.hass
      ? rules.findIndex(r => r && r.color === current && current !== this.value.fallback)
      : -1;

    return html`
      <div class="editor">
        <div class="hint">
          ${this._t(
            'hint',
            'The first rule that matches sets the color. If none match, the color below is used.'
          )}
        </div>
        ${rules.map((r, i) => this._renderRule(r, i, rules.length, activeIndex))}
        <button class="add-btn" type="button" @click=${() => this._setRules([...rules, newStateColorRule()])}>
          <ha-icon icon="mdi:plus"></ha-icon>${this._t('add_rule', 'Add rule')}
        </button>

        <div class="sub-label otherwise">${this._t('otherwise', 'Otherwise use')}</div>
        <ultra-color-picker
          .hass=${this.hass}
          .value=${this.value.fallback || ''}
          ?no-gradients=${this.noGradients}
          no-state
          @value-changed=${(e: CustomEvent) => {
            e.stopPropagation();
            this._emit({ ...this.value, fallback: e.detail.value });
          }}
        ></ultra-color-picker>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    .editor {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .rule {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--card-background-color);
    }
    .rule.active {
      border-color: var(--primary-color);
    }
    .rule-head,
    .condition-row,
    .when-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .rule-head {
      justify-content: space-between;
    }
    .rule-title {
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      font-size: 11px;
      font-weight: 500;
      padding: 1px 6px;
      border-radius: 10px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .rule-actions {
      display: inline-flex;
      gap: 2px;
    }
    .grow,
    .match {
      flex: 1;
      min-width: 0;
    }
    .op {
      flex: 0 0 120px;
    }
    .condition {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      border-radius: 6px;
      background: var(--secondary-background-color);
    }
    .sub-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
    }
    .otherwise {
      margin-top: 4px;
    }
    .icon-btn {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: var(--secondary-text-color);
      display: inline-flex;
      --mdc-icon-size: 18px;
    }
    .icon-btn[disabled] {
      opacity: 0.35;
      cursor: default;
    }
    .icon-btn.danger {
      color: var(--error-color);
    }
    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      align-self: flex-start;
      padding: 6px 10px;
      border: 1px dashed var(--primary-color);
      border-radius: 6px;
      background: none;
      color: var(--primary-color);
      cursor: pointer;
      font: inherit;
      --mdc-icon-size: 18px;
    }
    .add-btn.small {
      padding: 4px 8px;
      font-size: 13px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-state-color-editor': UcStateColorEditor;
  }
}
