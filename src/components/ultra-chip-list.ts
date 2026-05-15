import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { keyed } from 'lit/directives/keyed.js';

/**
 * `<ultra-chip-list>` — Chip list for string-array values with add/remove UX.
 *
 * IMPORTANT (consistency rule):
 * ALWAYS use this component (via `BaseUltraModule.renderChipListField`) for any
 * "list of strings or entity IDs with add/remove" UI in a module editor. NEVER
 * hand-roll a `domain-chips` / `domain-chip` / `filter-chip` row with its own
 * CSS, hover behavior, or remove button — those produce per-module visual drift
 * that breaks Ultra Card's "every module looks the same" guarantee.
 *
 * Use this for:
 * - Include/exclude domain lists (light, switch, sensor…)
 * - Keyword include/exclude lists
 * - Pinned/hidden entity ID lists
 * - Any other string-array setting
 *
 * Modes:
 * - `mode: 'free-text'` — type in a text input + Enter / + button to add
 * - `mode: 'entity'` — uses `ha-entity-picker` (with optional `entityDomains`
 *   filter) to autocomplete real Home Assistant entity IDs
 *
 * Variants:
 * - `variant: 'primary'` — primary-color chips (additive lists)
 * - `variant: 'exclude'` — error-color chips (exclusion lists)
 *
 * Emits `value-changed` with `{ value: string[] }`.
 */
@customElement('ultra-chip-list')
export class UltraChipList extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ type: Array }) values: string[] = [];

  @property({ type: String }) label = '';

  @property({ type: String }) description = '';

  @property({ type: String }) placeholder = '';

  @property({ type: String }) variant: 'primary' | 'exclude' = 'primary';

  @property({ type: String }) mode: 'free-text' | 'entity' | 'select' = 'free-text';

  /** When mode is entity, restrict to these domains (empty = all). */
  @property({ type: Array }) entityDomains?: string[] | undefined;

  /**
   * When `mode === 'select'`, the dropdown shows these options for the add control.
   * Options already in `values` are filtered out automatically.
   */
  @property({ type: Array }) selectOptions?: Array<{ value: string; label: string }> | undefined;

  /** When `mode === 'select'`, the placeholder for the dropdown's label. */
  @property({ type: String }) selectAddLabel?: string | undefined;

  @state() private _entityPickerKey = 0;

  private _entityFilter = (entityId: string): boolean => {
    const doms = this.entityDomains;
    if (!doms?.length) return true;
    const prefix = entityId.split('.')[0] || '';
    return doms.includes(prefix);
  };

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    .uc-cl-label {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 4px;
      display: block;
    }
    .uc-cl-desc {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      opacity: 0.85;
      line-height: 1.4;
      display: block;
    }
    .uc-cl-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      min-height: 8px;
    }
    .uc-cl-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-radius: 16px;
      font-size: 13px;
      max-width: 100%;
      position: relative;
      transition: padding 0.15s ease;
    }
    .uc-cl-chip.exclude {
      background: var(--error-color);
    }
    .uc-cl-chip:hover {
      padding-right: 30px;
    }
    .uc-cl-chip-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 220px;
    }
    .uc-cl-chip-remove {
      cursor: pointer;
      font-size: 16px;
      opacity: 0;
      position: absolute;
      right: 8px;
      transition: opacity 0.15s ease;
      --mdc-icon-size: 16px;
    }
    .uc-cl-chip:hover .uc-cl-chip-remove {
      opacity: 1;
    }
    .uc-cl-input-row {
      display: flex;
      gap: 8px;
      align-items: stretch;
    }
    .uc-cl-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }
    .uc-cl-add {
      padding: 8px 14px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .uc-cl-add ha-icon {
      --mdc-icon-size: 20px;
    }
    .uc-cl-select-add {
      display: flex;
    }
    .uc-cl-select {
      flex: 1;
      padding: 10px 12px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      background: transparent;
      color: var(--primary-text-color);
      font-size: 14px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: linear-gradient(
        45deg,
        transparent 50%,
        var(--secondary-text-color) 50%
      ),
      linear-gradient(135deg, var(--secondary-text-color) 50%, transparent 50%);
      background-position:
        calc(100% - 18px) 50%,
        calc(100% - 12px) 50%;
      background-size: 6px 6px, 6px 6px;
      background-repeat: no-repeat;
      padding-right: 32px;
    }
    .uc-cl-select:hover,
    .uc-cl-select:focus {
      border-color: var(--primary-color);
      outline: none;
    }
  `;

  private _emit(next: string[]) {
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: next },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _remove(v: string) {
    const next = (this.values || []).filter(x => x !== v);
    this._emit(next);
  }

  private _addFreeText(raw: string) {
    const val = raw.trim();
    if (!val) return;
    const cur = [...(this.values || [])];
    if (cur.includes(val)) return;
    cur.push(val);
    this._emit(cur);
  }

  private _renderSelectAdd() {
    const taken = new Set(this.values || []);
    const opts = (this.selectOptions || []).filter(o => !taken.has(o.value));
    const fieldName = '_uc_cl_add';
    return html`
      <div class="uc-cl-select-add">
        <select
          class="uc-cl-select"
          aria-label=${this.selectAddLabel || 'Add'}
          @change=${(e: Event) => {
            const target = e.target as HTMLSelectElement;
            const v = target.value;
            target.value = '';
            if (!v) return;
            const cur = [...(this.values || [])];
            if (cur.includes(v)) return;
            cur.push(v);
            this._emit(cur);
          }}
        >
          <option value="">${this.selectAddLabel || this.placeholder || 'Add…'}</option>
          ${opts.map(
            o => html`<option value=${o.value}>${o.label}</option>`
          )}
        </select>
      </div>
    `;
    // (Intentionally uses a native <select> inside this *shared* component.
    //  The canonical static test forbids raw <select> in module bodies, not inside
    //  the shared Lit components themselves — those are the source of truth.)
  }

  private _onEntityPicked(e: CustomEvent) {
    const raw = e.detail as { value?: string | { entity?: string } };
    let id = '';
    const v = raw?.value;
    if (typeof v === 'string') id = v.trim();
    else if (v && typeof v === 'object' && typeof (v as { entity?: string }).entity === 'string') {
      id = String((v as { entity?: string }).entity).trim();
    }
    if (!id) return;
    const cur = [...(this.values || [])];
    if (cur.includes(id)) return;
    cur.push(id);
    this._entityPickerKey += 1;
    this._emit(cur);
  }

  override render() {
    const vals = this.values || [];
    const isExclude = this.variant === 'exclude';
    return html`
      ${this.label ? html`<span class="uc-cl-label">${this.label}</span>` : nothing}
      ${this.description ? html`<span class="uc-cl-desc">${this.description}</span>` : nothing}
      <div class="uc-cl-chips">
        ${vals.map(
          v => html`
            <div class="uc-cl-chip ${isExclude ? 'exclude' : ''}" title=${v}>
              <span class="uc-cl-chip-label">${v}</span>
              <ha-icon
                class="uc-cl-chip-remove"
                icon="mdi:close"
                @click=${() => this._remove(v)}
              ></ha-icon>
            </div>
          `
        )}
      </div>
      ${this.mode === 'entity' && this.hass
        ? keyed(
            this._entityPickerKey,
            html`
              <ha-entity-picker
                .hass=${this.hass}
                .value=""
                .label=${this.placeholder || 'Add entity'}
                .entityFilter=${this._entityFilter}
                @value-changed=${this._onEntityPicked}
              ></ha-entity-picker>
            `
          )
        : this.mode === 'select'
          ? this._renderSelectAdd()
          : html`
            <div class="uc-cl-input-row">
              <input
                class="uc-cl-input"
                type="text"
                placeholder=${this.placeholder}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    this._addFreeText((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                type="button"
                class="uc-cl-add"
                title="Add"
                @click=${(e: Event) => {
                  const row = (e.target as HTMLElement).closest('.uc-cl-input-row');
                  const input = row?.querySelector('input') as HTMLInputElement;
                  if (input) {
                    this._addFreeText(input.value);
                    input.value = '';
                  }
                }}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-chip-list': UltraChipList;
  }
}
