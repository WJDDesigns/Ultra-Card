import { LitElement, html, css, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { isGradient } from '../utils/uc-color-utils';

const PATH_POLL_LIMIT = 120;

/** Render an icon in a solid color, or as a `uc-gradient-icon` when the color is a gradient. */
export const renderColoredIcon = (
  icon: string,
  color: string | undefined,
  size: number
): TemplateResult =>
  color && isGradient(color)
    ? html`<uc-gradient-icon .icon=${icon} .gradient=${color.trim()} .size=${size}></uc-gradient-icon>`
    : html`<ha-icon
        icon="${icon}"
        style="${color ? `color: ${color}; ` : ''}--mdc-icon-size: ${size}px; display: flex;"
      ></ha-icon>`;

/** Build a CSS mask URL from an SVG path so a gradient can be clipped to an icon glyph. */
export const iconMaskUrl = (path: string, viewBox = '0 0 24 24'): string => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}'><path d='${path}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/**
 * An `ha-icon` painted with a CSS gradient. SVG glyphs ignore
 * `background-clip: text`, so the glyph path resolved by `ha-icon` is used as
 * a mask over a gradient fill. Until the path resolves the plain icon shows.
 */
@customElement('uc-gradient-icon')
export class UcGradientIcon extends LitElement {
  @property() public icon = '';
  @property() public gradient = '';
  @property({ type: Number }) public size = 24;

  @state() private _path = '';
  @state() private _viewBox = '0 0 24 24';

  private _pollFrame = 0;

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
      flex-shrink: 0;
      position: relative;
    }
    ha-icon {
      display: flex;
    }
    .fill {
      position: absolute;
      inset: 0;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      pointer-events: none;
    }
  `;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._pollFrame);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) this._resolvePath();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('icon')) {
      this._path = '';
      this._resolvePath();
    }
  }

  private _resolvePath(attempt = 0): void {
    cancelAnimationFrame(this._pollFrame);
    const haIcon = this.shadowRoot?.querySelector('ha-icon') as
      | (HTMLElement & { _path?: string })
      | null;
    const svgIcon = haIcon?.shadowRoot?.querySelector('ha-svg-icon') as
      | (HTMLElement & { path?: string; viewBox?: string })
      | null;
    const path = svgIcon?.path || haIcon?._path || '';
    if (path) {
      this._path = path;
      this._viewBox = svgIcon?.viewBox || '0 0 24 24';
      return;
    }
    if (attempt < PATH_POLL_LIMIT) {
      this._pollFrame = requestAnimationFrame(() => this._resolvePath(attempt + 1));
    }
  }

  protected override render(): TemplateResult {
    const size = `${this.size}px`;
    const mask = this._path ? iconMaskUrl(this._path, this._viewBox) : '';
    return html`
      <ha-icon
        .icon=${this.icon}
        style="--mdc-icon-size: ${size}; width: ${size}; height: ${size}; ${this._path
          ? 'visibility: hidden;'
          : ''}"
      ></ha-icon>
      ${this._path
        ? html`<span
            class="fill"
            style="background: ${this.gradient}; -webkit-mask-image: ${mask}; mask-image: ${mask};"
          ></span>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-gradient-icon': UcGradientIcon;
  }
}
