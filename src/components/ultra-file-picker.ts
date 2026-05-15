import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref, Ref } from 'lit/directives/ref.js';
import { HomeAssistant } from 'custom-card-helpers';
import { uploadImage, SUPPORTED_IMAGE_ACCEPT } from '../utils/image-upload';
import { ucToastService } from '../services/uc-toast-service';

/**
 * `<ultra-file-picker>` — Styled file/image upload for module editors.
 *
 * IMPORTANT (consistency rule):
 * ALWAYS use this component (via `BaseUltraModule.renderFileField`) for any file
 * upload UI in a module editor. NEVER hand-roll a `<input type="file">` (visible
 * or hidden behind a `<label>`) — those drift visually per-module (some have
 * dashed drop zones, some have generic browser file inputs, some have separate
 * "current path" displays), which breaks Ultra Card's "every module looks the same"
 * guarantee.
 *
 * Uploads via {@link uploadImage} and emits `value-changed` with `{ value: string }`
 * (the resolved /media path). Provides:
 * - Primary-color "Choose file" button
 * - Dashed drop-zone framing
 * - Current-file chip with × to clear
 * - Toast notifications on success / failure
 * - Uploading state with spinner-like text
 */
@customElement('ultra-file-picker')
export class UltraFilePicker extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  /**
   * `accept` attribute for the underlying `<input type="file">`. Defaults to
   * the canonical image-format list (see {@link SUPPORTED_IMAGE_ACCEPT}) so
   * modern formats like WebP, AVIF, HEIC, and JPEG XL are pickable in every
   * environment. Override to narrow (e.g. `'image/png,.png'`) or broaden to
   * the universal any-file glob.
   */
  @property({ type: String }) accept = SUPPORTED_IMAGE_ACCEPT;

  @property({ type: String }) label = '';

  @property({ type: String }) description = '';

  /** Current uploaded path / URL (shown as chip when set). */
  @property({ type: String }) value = '';

  @property({ type: Boolean }) disabled = false;

  @property({ type: String }) chooseFileLabel = 'Choose file';

  @property({ type: String }) clearLabel = 'Remove';

  @state() private _uploading = false;

  private _fileInputRef: Ref<HTMLInputElement> = createRef();

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    .uc-fp-label {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 4px;
      display: block;
    }
    .uc-fp-desc {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      opacity: 0.85;
      line-height: 1.4;
      display: block;
    }
    .uc-fp-zone {
      border: 2px dashed var(--divider-color);
      border-radius: 12px;
      padding: 16px;
      background: var(--secondary-background-color);
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      transition: border-color 0.2s ease, background 0.2s ease;
    }
    .uc-fp-zone:hover:not([data-disabled]) {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.06);
    }
    .uc-fp-zone[data-disabled] {
      opacity: 0.55;
      pointer-events: none;
    }
    .uc-fp-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    input[type='file'] {
      position: absolute;
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      z-index: -1;
    }
    .uc-fp-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.15s ease, transform 0.1s ease;
    }
    .uc-fp-btn:hover {
      opacity: 0.92;
    }
    .uc-fp-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .uc-fp-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 100%;
      padding: 6px 12px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-radius: 16px;
      font-size: 13px;
      position: relative;
    }
    .uc-fp-chip-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: min(100%, 280px);
    }
    .uc-fp-chip-remove {
      cursor: pointer;
      flex-shrink: 0;
      --mdc-icon-size: 18px;
    }
    .uc-fp-spinner {
      font-size: 14px;
      color: var(--secondary-text-color);
    }
  `;

  private _onClear() {
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: '' },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.hass) return;
    this._uploading = true;
    try {
      const path = await uploadImage(this.hass, file);
      ucToastService.success('Image uploaded');
      this.dispatchEvent(
        new CustomEvent('value-changed', {
          detail: { value: path },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      ucToastService.error(
        `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      this._uploading = false;
    }
  }

  override render() {
    return html`
      ${this.label ? html`<span class="uc-fp-label">${this.label}</span>` : nothing}
      ${this.description ? html`<span class="uc-fp-desc">${this.description}</span>` : nothing}
      <div class="uc-fp-zone" ?data-disabled=${this.disabled || this._uploading}>
        <div class="uc-fp-row">
          <input
            ${ref(this._fileInputRef)}
            type="file"
            accept=${this.accept}
            ?disabled=${this.disabled || this._uploading}
            @change=${this._onFileChange}
          />
          <button
            type="button"
            class="uc-fp-btn"
            ?disabled=${this.disabled || this._uploading}
            @click=${() => this._fileInputRef.value?.click()}
          >
            <ha-icon icon="mdi:upload"></ha-icon>
            ${this._uploading ? 'Uploading…' : this.chooseFileLabel}
          </button>
          ${this._uploading ? html`<span class="uc-fp-spinner">Please wait…</span>` : nothing}
        </div>
        ${this.value
          ? html`
              <div class="uc-fp-chip" title=${this.value}>
                <span class="uc-fp-chip-label">${this._shortPath(this.value)}</span>
                <ha-icon
                  class="uc-fp-chip-remove"
                  icon="mdi:close"
                  @click=${() => this._onClear()}
                  title=${this.clearLabel}
                ></ha-icon>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _shortPath(p: string): string {
    if (!p) return '';
    if (p.length <= 48) return p;
    return `${p.slice(0, 20)}…${p.slice(-22)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-file-picker': UltraFilePicker;
  }
}
