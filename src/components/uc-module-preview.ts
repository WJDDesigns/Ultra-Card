/**
 * <uc-module-preview type="gauge" .hass=${hass}>
 *
 * Renders a LIVE preview of any Ultra Card module using the user's OWN Home
 * Assistant instance and their own entities.
 *
 * Why this needs no sample-data library: every module's `createDefault(id, hass)`
 * is already entity-aware — it inspects `hass` and picks a suitable entity from
 * what the user actually owns (see e.g. gauge's findSuitableSensor). So inside
 * HA the honest preview is simply:
 *
 *     createDefault(id, hass)  ->  renderPreview(module, hass, undefined, 'dashboard')
 *
 * The curated sample-config library in `src/website-demo/` exists only for the
 * OPPOSITE case: rendering these same modules where there is no Home Assistant
 * at all (the website, README screenshots, CI). Keep the two separate — the demo
 * data must never leak into the product.
 *
 * Usage in the "Add Module" picker: keep the grid exactly as it is and add a
 * preview affordance per tile; the add flow stays one click.
 */
import { LitElement, html, css, PropertyValues, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { getModuleRegistry } from '../modules';

@customElement('uc-module-preview')
export class UcModulePreview extends LitElement {
  /** Module type to preview, e.g. "gauge". */
  @property({ type: String }) public type = '';
  @property({ attribute: false }) public hass?: HomeAssistant;
  /** Render at reduced scale so a full module fits a small tile. */
  @property({ type: Number }) public scale = 1;

  @state() private _module: any = null;
  @state() private _error = '';
  @state() private _loading = true;

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('type')) {
      this._module = null;
      this._error = '';
      this._loading = true;
      void this._build();
    }
  }

  private async _build(): Promise<void> {
    const type = this.type;
    if (!type) return;
    try {
      const registry = getModuleRegistry();
      await registry.ensureModuleLoaded(type);
      if (this.type !== type) return; // superseded while loading
      const handler = registry.getModule(type);
      if (!handler) throw new Error(`Unknown module "${type}"`);
      // createDefault inspects hass and binds the user's own entities.
      this._module = handler.createDefault(`uc_preview_${type}`, this.hass);
      this._loading = false;
    } catch (err) {
      this._error = err instanceof Error ? err.message : String(err);
      this._loading = false;
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (this._loading) {
      return html`<div class="uc-mp-state">
        <ha-circular-progress indeterminate size="small"></ha-circular-progress>
      </div>`;
    }
    if (this._error || !this._module || !this.hass) {
      return html`<div class="uc-mp-state uc-mp-error">
        <ha-icon icon="mdi:eye-off-outline"></ha-icon>
        <span>Preview unavailable</span>
      </div>`;
    }

    const handler = getModuleRegistry().getModule(this.type);
    if (!handler) return nothing;

    let body: TemplateResult;
    try {
      body = handler.renderPreview(this._module, this.hass, undefined, 'dashboard');
    } catch (err) {
      return html`<div class="uc-mp-state uc-mp-error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <span>Preview unavailable</span>
      </div>`;
    }

    return html`
      <div class="uc-mp-frame" aria-hidden="true">
        <div class="uc-mp-scale" style=${`transform:scale(${this.scale});width:${100 / this.scale}%`}>
          ${body}
        </div>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      pointer-events: none; /* a preview is never a control */
    }
    .uc-mp-frame {
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 12px;
      padding: 10px;
      overflow: hidden;
      box-sizing: border-box;
    }
    .uc-mp-scale {
      transform-origin: top left;
    }
    .uc-mp-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 84px;
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .uc-mp-error ha-icon {
      --mdc-icon-size: 18px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-module-preview': UcModulePreview;
  }
}
