import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import type {
  PresetDefinition,
  PresetWizardField,
  PresetWizardApplyResult,
  EntityMapping,
} from '../types';
import { entityMapper } from '../services/uc-entity-mapper';

function findOverlayHost(): HTMLElement {
  const findOpenDialog = (root: Document | ShadowRoot): HTMLElement | null => {
    const dialogs = Array.from(root.querySelectorAll('dialog, ha-dialog, mwc-dialog'));
    for (const dialog of dialogs) {
      const htmlDialog = dialog as HTMLDialogElement;
      const isOpen =
        Boolean((htmlDialog as any).open) ||
        dialog.hasAttribute('open') ||
        dialog.classList.contains('open') ||
        dialog.getAttribute('aria-hidden') === 'false';
      if (isOpen) return dialog as HTMLElement;
    }
    const allElements = Array.from(root.querySelectorAll('*')) as HTMLElement[];
    for (const el of allElements) {
      if (el.shadowRoot) {
        const nested = findOpenDialog(el.shadowRoot);
        if (nested) return nested;
      }
    }
    return null;
  };
  return findOpenDialog(document) || document.body;
}

function getDomain(entityId: string): string {
  const parts = entityId.split('.');
  return parts.length > 1 ? parts[0] : '';
}

function domainIcon(domain: string): string {
  const icons: Record<string, string> = {
    sensor: 'mdi:eye',
    binary_sensor: 'mdi:radiobox-marked',
    switch: 'mdi:toggle-switch',
    light: 'mdi:lightbulb',
    climate: 'mdi:thermostat',
    cover: 'mdi:window-shutter',
    fan: 'mdi:fan',
    lock: 'mdi:lock',
    media_player: 'mdi:speaker',
    camera: 'mdi:cctv',
    vacuum: 'mdi:robot-vacuum',
    alarm_control_panel: 'mdi:shield-home',
    input_boolean: 'mdi:toggle-switch-outline',
    input_number: 'mdi:numeric',
    input_select: 'mdi:form-select',
    number: 'mdi:numeric',
    select: 'mdi:form-select',
    person: 'mdi:account',
    device_tracker: 'mdi:map-marker',
    weather: 'mdi:weather-partly-cloudy',
    sun: 'mdi:white-balance-sunny',
    zone: 'mdi:map-marker-radius',
  };
  return icons[domain] || 'mdi:help-circle-outline';
}

/**
 * Multi-step preset setup wizard.
 * Dispatches `wizard-apply` with detail `{ result: PresetWizardApplyResult }` or `wizard-cancel`.
 */
@customElement('uc-preset-wizard-dialog')
export class UcPresetWizardDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public preset!: PresetDefinition;
  @property({ type: Boolean, reflect: true }) public open = false;

  @state() private _stepIndex = 0;
  @state() private _values: Record<string, unknown> = {};
  @state() private _sameAs: Record<string, boolean> = {};
  @state() private _skipped: Record<string, boolean> = {};

  static override styles = css`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 999999;
      pointer-events: none;
    }
    :host([open]) {
      pointer-events: auto;
    }

    /* ── Overlay ── */
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }

    /* ── Dialog shell ── */
    .dialog {
      background: var(--card-background-color, #1c1c1e);
      color: var(--primary-text-color);
      border-radius: 20px;
      max-width: 620px;
      width: 100%;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      animation: dialog-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    @keyframes dialog-in {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Header ── */
    .header {
      padding: 22px 24px 18px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .header-text {}
    .preset-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--primary-color);
      margin-bottom: 6px;
    }
    .preset-badge ha-icon {
      --mdc-icon-size: 14px;
    }
    .header h2 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.01em;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 0.87rem;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .close-btn {
      background: var(--secondary-background-color, rgba(120,120,128,.18));
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      transition: background 0.15s;
    }
    .close-btn:hover {
      background: var(--divider-color);
    }
    .close-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    /* ── Progress bar ── */
    .progress-track {
      height: 3px;
      background: var(--divider-color);
      margin: 0 24px;
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
      transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Step dots ── */
    .step-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 10px 24px 0;
    }
    .step-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--divider-color);
      transition: all 0.2s;
    }
    .step-dot.done {
      background: var(--primary-color);
      opacity: 0.5;
    }
    .step-dot.current {
      background: var(--primary-color);
      width: 22px;
      border-radius: 4px;
    }

    /* ── Toolbar (entity steps only) ── */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px 4px;
      flex-wrap: wrap;
    }
    .toolbar-label {
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--secondary-text-color);
      margin-right: auto;
    }
    .tool-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 11px 5px 8px;
      border-radius: 20px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color, rgba(120,120,128,.12));
      color: var(--primary-text-color);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .tool-btn ha-icon {
      --mdc-icon-size: 16px;
      color: var(--secondary-text-color);
    }
    .tool-btn:hover {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .tool-btn:hover ha-icon {
      color: var(--text-primary-color, #fff);
    }

    /* ── Content area ── */
    .content {
      padding: 12px 24px 8px;
      overflow-y: auto;
      flex: 1;
      scrollbar-width: thin;
    }

    /* ── Field card ── */
    .field-card {
      background: var(--secondary-background-color, rgba(120,120,128,.1));
      border: 1px solid var(--divider-color);
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .field-card.mapped {
      border-color: var(--success-color, #4caf50);
    }
    .field-card.required-empty {
      border-color: var(--warning-color, #ff9800);
    }
    .field-card-top {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    .field-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--primary-color);
      opacity: 0.85;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .field-icon ha-icon {
      --mdc-icon-size: 20px;
      color: #fff;
    }
    .field-meta {
      flex: 1;
      min-width: 0;
    }
    .field-label {
      font-weight: 700;
      font-size: 0.97rem;
      line-height: 1.3;
    }
    .field-desc {
      font-size: 0.83rem;
      color: var(--secondary-text-color);
      margin-top: 3px;
      line-height: 1.4;
    }
    .field-status {
      flex-shrink: 0;
    }
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.73rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
    }
    .status-chip.mapped {
      background: rgba(76,175,80,.18);
      color: var(--success-color, #4caf50);
    }
    .status-chip.empty {
      background: rgba(255,152,0,.14);
      color: var(--warning-color, #ff9800);
    }
    .status-chip ha-icon {
      --mdc-icon-size: 13px;
    }
    .status-chip.skipped {
      background: rgba(158,158,158,.18);
      color: var(--secondary-text-color);
    }
    .field-card.skipped {
      border-color: var(--divider-color);
      opacity: 0.6;
    }
    .skip-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      margin-top: 10px;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 6px 10px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(120,120,128,.06));
      transition: background 0.15s;
    }
    .skip-row:hover {
      background: var(--divider-color);
    }
    .skip-row input[type="checkbox"] {
      accent-color: var(--secondary-text-color);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .original-id {
      font-family: monospace;
      font-size: 0.78rem;
      color: var(--secondary-text-color);
      background: var(--divider-color);
      border-radius: 4px;
      padding: 2px 6px;
      margin-bottom: 10px;
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .same-as-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      margin-bottom: 10px;
      cursor: pointer;
      color: var(--secondary-text-color);
    }
    .same-as-row input[type="checkbox"] {
      accent-color: var(--primary-color);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .same-as-value {
      margin-left: auto;
      font-family: monospace;
      font-size: 0.78rem;
      color: var(--primary-color);
      background: rgba(3,169,244,.12);
      padding: 2px 8px;
      border-radius: 8px;
    }

    /* ── Non-entity fields (options step) ── */
    .option-block {
      margin-bottom: 16px;
    }
    .option-label {
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }
    .option-desc {
      font-size: 0.83rem;
      color: var(--secondary-text-color);
      margin-bottom: 10px;
    }

    /* ── Review ── */
    .review-intro {
      font-size: 0.88rem;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .review-table {
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      overflow: hidden;
    }
    .review-row {
      display: grid;
      grid-template-columns: minmax(120px, 1fr) 1.5fr;
      gap: 0;
      padding: 11px 16px;
      border-bottom: 1px solid var(--divider-color);
      font-size: 0.88rem;
      align-items: center;
    }
    .review-row:last-child {
      border-bottom: none;
    }
    .review-key {
      font-weight: 600;
      color: var(--secondary-text-color);
    }
    .review-val {
      font-family: monospace;
      font-size: 0.82rem;
      color: var(--primary-text-color);
      word-break: break-all;
    }
    .review-val.empty {
      color: var(--secondary-text-color);
      font-family: inherit;
      font-style: italic;
    }

    /* ── Footer ── */
    .footer {
      padding: 16px 24px 20px;
      border-top: 1px solid var(--divider-color);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .footer-progress-text {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      margin-right: auto;
    }
    .footer-progress-text strong {
      color: var(--primary-text-color);
    }
    .btn {
      min-width: 80px;
      padding: 9px 18px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.15s;
    }
    .btn:hover:not(:disabled) {
      background: var(--divider-color);
    }
    .btn.primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
      font-weight: 600;
    }
    .btn.primary:hover:not(:disabled) {
      opacity: 0.88;
    }
    .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  `;

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('open') && this.open && this.preset?.wizard) {
      this._resetState();
    }
  }

  private _resetState(): void {
    this._stepIndex = 0;
    const next: Record<string, unknown> = {};
    const same: Record<string, boolean> = {};
    const w = this.preset.wizard;
    if (!w) return;
    for (const step of w.steps) {
      for (const f of step.fields) {
        if (f.default !== undefined) {
          next[f.id] = f.default;
        } else if (f.type === 'entity') {
          next[f.id] = '';
        } else if (f.type === 'unit_system') {
          next[f.id] = 'metric';
        } else if (f.type === 'number') {
          next[f.id] = 0;
        } else {
          next[f.id] = '';
        }
        if (f.allowSameAs) same[f.id] = false;
      }
    }
    this._values = next;
    this._sameAs = same;
    this._skipped = {};
  }

  /** Auto-map: for every unmapped entity field, pick best suggestion from hass */
  private _autoMap(): void {
    const w = this.preset.wizard;
    if (!w) return;
    const allIds = Object.keys(this.hass?.states || {});
    const next = { ...this._values };
    for (const step of w.steps) {
      for (const f of step.fields) {
        if (f.type !== 'entity') continue;
        const current = next[f.id];
        if (current && typeof current === 'string' && this.hass?.states?.[current]) continue;
        const orig = f.targetEntityIds?.[0] ?? '';
        let searchKey = orig;
        if (orig.startsWith('$') && f.entityDomain) {
          const tail = orig.slice(1).replace(/\./g, '_');
          searchKey = `${f.entityDomain}.${tail || 'entity'}`;
        }
        const suggestions = entityMapper.suggestEntities(searchKey, allIds);
        if (suggestions.length > 0) {
          next[f.id] = suggestions[0];
        } else if (f.entityDomain) {
          const first = allIds.find(id => id.startsWith(f.entityDomain! + '.'));
          if (first) next[f.id] = first;
        }
      }
    }
    this._values = next;
    this.requestUpdate();
  }

  /** Reset: put all entity fields back to the preset's original placeholder / default */
  private _resetEntities(): void {
    const w = this.preset.wizard;
    if (!w) return;
    const next = { ...this._values };
    for (const step of w.steps) {
      for (const f of step.fields) {
        if (f.type !== 'entity') continue;
        next[f.id] = f.default !== undefined ? f.default : '';
      }
    }
    this._values = next;
    this.requestUpdate();
  }

  /** Clear: blank every entity field */
  private _clearEntities(): void {
    const w = this.preset.wizard;
    if (!w) return;
    const next = { ...this._values };
    for (const step of w.steps) {
      for (const f of step.fields) {
        if (f.type !== 'entity') continue;
        next[f.id] = '';
      }
    }
    this._values = next;
    this.requestUpdate();
  }

  private _allStepsCount(): number {
    return (this.preset?.wizard?.steps?.length ?? 0) + 1;
  }

  private _isReviewStep(): boolean {
    return this._stepIndex >= (this.preset?.wizard?.steps?.length ?? 0);
  }

  private _currentStepHasEntityFields(): boolean {
    const w = this.preset?.wizard;
    if (!w?.steps?.length || this._isReviewStep()) return false;
    return w.steps[this._stepIndex].fields.some(f => f.type === 'entity');
  }

  private _fieldLabelForId(fieldId: string): string {
    const w = this.preset?.wizard;
    if (!w) return fieldId;
    for (const step of w.steps) {
      const f = step.fields.find(x => x.id === fieldId);
      if (f) return f.label;
    }
    return fieldId;
  }

  private _resolvedEntityValue(field: PresetWizardField): string {
    if (field.allowSameAs && this._sameAs[field.id]) {
      const ref = this._values[field.allowSameAs];
      return typeof ref === 'string' ? ref : '';
    }
    const v = this._values[field.id];
    return typeof v === 'string' ? v : '';
  }

  private _setValue(id: string, value: unknown): void {
    this._values = { ...this._values, [id]: value };
    this.requestUpdate();
  }

  private _entitySelector(field: PresetWizardField): Record<string, unknown> {
    const sel: Record<string, unknown> = {};
    if (field.entityDomain) sel.domain = field.entityDomain;
    if (field.entityDeviceClass) sel.device_class = field.entityDeviceClass;
    return { entity: sel };
  }

  private _mappedCount(): number {
    const w = this.preset?.wizard;
    if (!w?.steps?.length) return 0;
    let count = 0;
    for (const step of w.steps) {
      for (const f of step.fields) {
        if (f.type !== 'entity') continue;
        if (this._skipped[f.id]) { count++; continue; }
        const val = this._resolvedEntityValue(f);
        if (val && this.hass?.states?.[val]) count++;
      }
    }
    return count;
  }

  private _totalEntityFields(): number {
    const w = this.preset?.wizard;
    if (!w?.steps?.length) return 0;
    let count = 0;
    for (const step of w.steps) count += step.fields.filter(f => f.type === 'entity').length;
    return count;
  }

  private _validateCurrentStep(): boolean {
    if (this._isReviewStep()) return true;
    const w = this.preset.wizard!;
    const step = w.steps[this._stepIndex];
    if (!step) return true;
    for (const f of step.fields) {
      if (!f.required) continue;
      if (f.type === 'entity') {
        if (this._skipped[f.id]) continue;
        const ent = this._resolvedEntityValue(f).trim();
        if (!ent) return false;
        if (this.hass?.states && !this.hass.states[ent]) return false;
      } else {
        const v = this._values[f.id];
        if (v === undefined || v === null || v === '') return false;
      }
    }
    return true;
  }

  private _buildMappings(): EntityMapping[] {
    const mappings: EntityMapping[] = [];
    const w = this.preset.wizard;
    if (!w) return mappings;
    for (const step of w.steps) {
      for (const f of step.fields) {
        if (f.type !== 'entity' || !f.targetEntityIds?.length) continue;
        if (this._skipped[f.id]) continue;
        const selected = this._resolvedEntityValue(f).trim();
        if (!selected) continue;
        for (const orig of f.targetEntityIds) {
          if (!orig) continue;
          mappings.push({ original: orig, mapped: selected, domain: getDomain(orig) });
        }
      }
    }
    return mappings;
  }

  private _buildSkippedEntityIds(): string[] {
    const ids: string[] = [];
    const w = this.preset.wizard;
    if (!w) return ids;
    for (const step of w.steps) {
      for (const f of step.fields) {
        if (f.type !== 'entity' || !this._skipped[f.id]) continue;
        if (f.targetEntityIds?.length) {
          ids.push(...f.targetEntityIds.filter(Boolean));
        }
      }
    }
    return ids;
  }

  private _onApply(): void {
    const skippedEntityIds = this._buildSkippedEntityIds();
    const result: PresetWizardApplyResult = {
      mappings: this._buildMappings(),
      fieldValues: { ...this._values },
      ...(skippedEntityIds.length > 0 ? { skippedEntityIds } : {}),
    };
    this.dispatchEvent(
      new CustomEvent('wizard-apply', { detail: { result }, bubbles: true, composed: true })
    );
    this.open = false;
  }

  private _onCancel(): void {
    this.dispatchEvent(new CustomEvent('wizard-cancel', { bubbles: true, composed: true }));
    this.open = false;
  }

  private _renderEntityField(field: PresetWizardField): TemplateResult {
    const useSame = field.allowSameAs ? this._sameAs[field.id] : false;
    const isSkipped = !!this._skipped[field.id];
    const currentVal = this._resolvedEntityValue(field);
    const isMapped = !isSkipped && !!(currentVal && this.hass?.states?.[currentVal]);
    const origId = field.targetEntityIds?.[0] ?? '';
    const domain = field.entityDomain || getDomain(origId) || getDomain(currentVal);

    return html`
      <div class="field-card ${isSkipped ? 'skipped' : isMapped ? 'mapped' : field.required ? 'required-empty' : ''}">
        <div class="field-card-top">
          <div class="field-icon">
            <ha-icon icon=${domainIcon(domain)}></ha-icon>
          </div>
          <div class="field-meta">
            <div class="field-label">${field.label}</div>
            ${field.description
              ? html`<div class="field-desc">${field.description}</div>`
              : nothing}
          </div>
          <div class="field-status">
            ${isSkipped
              ? html`<span class="status-chip skipped">
                  <ha-icon icon="mdi:skip-next"></ha-icon>Skipped
                </span>`
              : isMapped
                ? html`<span class="status-chip mapped">
                    <ha-icon icon="mdi:check-circle"></ha-icon>Mapped
                  </span>`
                : html`<span class="status-chip empty">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                    ${field.required ? 'Required' : 'Optional'}
                  </span>`}
          </div>
        </div>

        ${origId
          ? html`<div class="original-id" title="Original preset entity: ${origId}">
              <ha-icon icon="mdi:label-outline" style="--mdc-icon-size:12px;vertical-align:middle;margin-right:3px;"></ha-icon>${origId}
            </div>`
          : nothing}

        ${field.allowSameAs
          ? html`
              <label class="same-as-row">
                <input
                  type="checkbox"
                  .checked=${useSame}
                  @change=${(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    this._sameAs = { ...this._sameAs, [field.id]: checked };
                    if (checked && field.allowSameAs) {
                      this._values = {
                        ...this._values,
                        [field.id]: this._values[field.allowSameAs],
                      };
                    }
                    this.requestUpdate();
                  }}
                />
                Use same as "${this._fieldLabelForId(field.allowSameAs)}"
                ${useSame && currentVal
                  ? html`<span class="same-as-value">${currentVal}</span>`
                  : nothing}
              </label>
            `
          : nothing}

        ${!useSame && !isSkipped
          ? html`
              <ha-form
                .hass=${this.hass}
                .data=${{ v: currentVal }}
                .schema=${[
                  {
                    name: 'v',
                    selector: this._entitySelector(field),
                    label: ' ',
                  },
                ]}
                .computeLabel=${() => ''}
                @value-changed=${(e: CustomEvent) => {
                  const v = e.detail.value?.v;
                  this._setValue(field.id, typeof v === 'string' ? v : '');
                }}
              ></ha-form>
            `
          : nothing}

        <label class="skip-row">
          <input
            type="checkbox"
            .checked=${isSkipped}
            @change=${(e: Event) => {
              const checked = (e.target as HTMLInputElement).checked;
              this._skipped = { ...this._skipped, [field.id]: checked };
              this.requestUpdate();
            }}
          />
          Skip this entity (modules using it will be removed)
        </label>
      </div>
    `;
  }

  private _renderOptionField(field: PresetWizardField): TemplateResult {
    if (field.type === 'unit_system') {
      const data = { v: String(this._values[field.id] ?? 'metric') };
      return html`
        <div class="option-block">
          <div class="option-label">${field.label}</div>
          ${field.description ? html`<div class="option-desc">${field.description}</div>` : nothing}
          <ha-form
            .hass=${this.hass}
            .data=${data}
            .schema=${[
              {
                name: 'v',
                selector: {
                  select: {
                    options: [
                      { value: 'metric', label: 'Metric (°C)' },
                      { value: 'imperial', label: 'Imperial (°F)' },
                    ],
                  },
                },
                label: field.label,
              },
            ]}
            .computeLabel=${(s: any) => s.label || s.name}
            @value-changed=${(e: CustomEvent) => this._setValue(field.id, e.detail.value?.v ?? 'metric')}
          ></ha-form>
        </div>
      `;
    }

    if (field.type === 'select' && field.options?.length) {
      return html`
        <div class="option-block">
          <div class="option-label">${field.label}</div>
          ${field.description ? html`<div class="option-desc">${field.description}</div>` : nothing}
          <ha-form
            .hass=${this.hass}
            .data=${{ v: String(this._values[field.id] ?? '') }}
            .schema=${[
              {
                name: 'v',
                selector: { select: { options: field.options } },
                label: field.label,
              },
            ]}
            .computeLabel=${(s: any) => s.label || s.name}
            @value-changed=${(e: CustomEvent) => this._setValue(field.id, e.detail.value?.v ?? '')}
          ></ha-form>
        </div>
      `;
    }

    if (field.type === 'number') {
      return html`
        <div class="option-block">
          <div class="option-label">${field.label}</div>
          ${field.description ? html`<div class="option-desc">${field.description}</div>` : nothing}
          <ha-form
            .hass=${this.hass}
            .data=${{ v: Number(this._values[field.id] ?? 0) }}
            .schema=${[{ name: 'v', selector: { number: { mode: 'box' } }, label: field.label }]}
            .computeLabel=${(s: any) => s.label || s.name}
            @value-changed=${(e: CustomEvent) => {
              const n = e.detail.value?.v;
              this._setValue(field.id, typeof n === 'number' ? n : Number(n));
            }}
          ></ha-form>
        </div>
      `;
    }

    // text
    return html`
      <div class="option-block">
        <div class="option-label">${field.label}</div>
        ${field.description ? html`<div class="option-desc">${field.description}</div>` : nothing}
        <ha-form
          .hass=${this.hass}
          .data=${{ v: String(this._values[field.id] ?? '') }}
          .schema=${[{ name: 'v', selector: { text: {} }, label: field.label }]}
          .computeLabel=${(s: any) => s.label || s.name}
          @value-changed=${(e: CustomEvent) => this._setValue(field.id, e.detail.value?.v ?? '')}
        ></ha-form>
      </div>
    `;
  }

  private _renderFields(fields: PresetWizardField[]): TemplateResult[] {
    return fields.map(f =>
      f.type === 'entity' ? this._renderEntityField(f) : this._renderOptionField(f)
    );
  }

  private _renderReview(): TemplateResult {
    const w = this.preset.wizard!;
    const rows: TemplateResult[] = [];
    for (const step of w.steps) {
      for (const f of step.fields) {
        const isSkipped = f.type === 'entity' && !!this._skipped[f.id];
        const display = isSkipped
          ? ''
          : f.type === 'entity'
            ? this._resolvedEntityValue(f)
            : String(this._values[f.id] ?? '');
        rows.push(html`
          <div class="review-row">
            <span class="review-key">${f.label}</span>
            <span class="review-val ${isSkipped ? 'empty' : !display ? 'empty' : ''}"
              >${isSkipped ? 'Skipped — modules removed' : display || 'Not set'}</span
            >
          </div>
        `);
      }
    }
    const skippedCount = Object.values(this._skipped).filter(Boolean).length;
    return html`
      <p class="review-intro">
        Everything looks good! Review your selections below, then apply the preset to your card.
        ${skippedCount > 0
          ? html`<br /><strong>${skippedCount} skipped entit${skippedCount === 1 ? 'y' : 'ies'}</strong>
              — modules using ${skippedCount === 1 ? 'it' : 'them'} will be removed from the card.`
          : nothing}
      </p>
      <div class="review-table">${rows}</div>
    `;
  }

  protected override render(): TemplateResult {
    if (!this.open || !this.preset?.wizard?.steps?.length) return html``;

    const w = this.preset.wizard;
    const total = this._allStepsCount();
    const review = this._isReviewStep();
    const step = !review ? w.steps[this._stepIndex] : null;
    const hasEntityFields = this._currentStepHasEntityFields();
    const progressPct = Math.round(((this._stepIndex + (review ? 1 : 0)) / (total - 1)) * 100);
    const mappedCount = this._mappedCount();
    const totalEntities = this._totalEntityFields();

    return html`
      <div class="overlay" @click=${this._onCancel}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>

          <!-- Header -->
          <div class="header">
            <div class="header-text">
              <div class="preset-badge">
                <ha-icon icon="mdi:puzzle-outline"></ha-icon>
                ${this.preset.name}
              </div>
              <h2>${review ? 'Review & Apply' : step!.title}</h2>
              <p>
                ${review
                  ? 'Confirm your selections before applying.'
                  : step!.description || `Step ${this._stepIndex + 1} of ${total - 1}`}
              </p>
            </div>
            <button class="close-btn" @click=${this._onCancel} aria-label="Close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <!-- Progress -->
          <div style="padding: 0 24px; margin-bottom: 4px;">
            <div class="progress-track">
              <div class="progress-fill" style="width: ${progressPct}%"></div>
            </div>
          </div>
          <div class="step-dots">
            ${Array.from({ length: total }).map((_, i) => {
              const cls =
                i === this._stepIndex ? 'current' : i < this._stepIndex ? 'done' : '';
              return html`<div class="step-dot ${cls}"></div>`;
            })}
          </div>

          <!-- Toolbar (entity steps) -->
          ${hasEntityFields
            ? html`
                <div class="toolbar">
                  <span class="toolbar-label">Quick actions</span>
                  <button class="tool-btn" type="button" @click=${this._autoMap}>
                    <ha-icon icon="mdi:auto-fix"></ha-icon>Auto-map
                  </button>
                  <button class="tool-btn" type="button" @click=${this._resetEntities}>
                    <ha-icon icon="mdi:restore"></ha-icon>Reset
                  </button>
                  <button class="tool-btn" type="button" @click=${this._clearEntities}>
                    <ha-icon icon="mdi:eraser"></ha-icon>Clear
                  </button>
                </div>
              `
            : nothing}

          <!-- Content -->
          <div class="content">
            ${review ? this._renderReview() : this._renderFields(step!.fields)}
          </div>

          <!-- Footer -->
          <div class="footer">
            ${totalEntities > 0 && !review
              ? html`
                  <span class="footer-progress-text">
                    <strong>${mappedCount}</strong> of ${totalEntities} entities mapped
                  </span>
                `
              : html`<span style="margin-right:auto"></span>`}

            <button class="btn" type="button" @click=${this._onCancel}>Cancel</button>

            ${this._stepIndex > 0
              ? html`
                  <button
                    class="btn"
                    type="button"
                    @click=${() => {
                      this._stepIndex -= 1;
                      this.requestUpdate();
                    }}
                  >
                    Back
                  </button>
                `
              : nothing}

            ${!review
              ? html`
                  <button
                    class="btn primary"
                    type="button"
                    ?disabled=${!this._validateCurrentStep()}
                    @click=${() => {
                      this._stepIndex += 1;
                      this.requestUpdate();
                    }}
                  >
                    Next
                  </button>
                `
              : html`
                  <button class="btn primary" type="button" @click=${this._onApply}>
                    Apply preset
                  </button>
                `}
          </div>

        </div>
      </div>
    `;
  }
}

/**
 * Imperative host: mounts the wizard on the top overlay layer.
 */
export class UcPresetWizardDialogController {
  private _container: HTMLDivElement | null = null;
  private _el: UcPresetWizardDialog | null = null;

  show(
    hass: HomeAssistant,
    preset: PresetDefinition,
    onApply: (result: PresetWizardApplyResult) => void,
    onCancel?: () => void
  ): void {
    this.close();
    if (!preset.wizard?.steps?.length) return;

    this._container = document.createElement('div');
    this._container.className = 'uc-preset-wizard-root';

    this._el = document.createElement('uc-preset-wizard-dialog') as UcPresetWizardDialog;
    this._el.hass = hass;
    this._el.preset = preset;
    this._el.open = true;

    const onApplyEv = (e: Event) => {
      const ce = e as CustomEvent<{ result: PresetWizardApplyResult }>;
      onApply(ce.detail.result);
      this.close();
    };
    const onCancelEv = () => {
      onCancel?.();
      this.close();
    };

    this._el.addEventListener('wizard-apply', onApplyEv as EventListener);
    this._el.addEventListener('wizard-cancel', onCancelEv);

    this._container.appendChild(this._el);
    findOverlayHost().appendChild(this._container);
  }

  close(): void {
    if (this._el) {
      this._el.open = false;
      this._el.remove();
      this._el = null;
    }
    if (this._container?.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._container = null;
  }
}

export const presetWizardDialog = new UcPresetWizardDialogController();
