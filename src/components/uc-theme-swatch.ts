import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ucThemeService } from '../services/uc-theme-service';
import type { UcThemeDefinition } from '../themes/uc-theme-types';

/**
 * A tiny "card with a title, two buttons and a bar" painted with a theme's
 * tokens. The same `--uc-*` variables the real card host receives are set
 * inline, so the swatch is a faithful miniature rather than an illustration.
 * `theme = null` draws the HA Native / no-theme look.
 */
@customElement('uc-theme-swatch')
export class UcThemeSwatch extends LitElement {
  @property({ attribute: false }) public theme: UcThemeDefinition | null = null;
  /** Larger stage for the theme editor preview. */
  @property({ type: Boolean }) public large = false;

  protected override render(): TemplateResult {
    const theme = this.theme;
    const vars = theme ? ucThemeService.getHostVars(theme) : {};
    const chrome = theme?.card ?? {};
    const radius = chrome.card_border_radius ?? theme?.tokens.radius ?? 12;
    const bg = chrome.card_transparent
      ? 'transparent'
      : chrome.card_background ?? 'var(--card-background-color, var(--ha-card-background, white))';
    const borderWidth = chrome.card_border_width ?? (theme ? theme.tokens.border_width ?? 1 : 1);
    const borderColor = chrome.card_border_color ?? theme?.tokens.border_color ?? 'var(--divider-color)';
    const shadow =
      chrome.card_shadow_enabled === false
        ? 'none'
        : chrome.card_shadow_enabled
          ? `${chrome.card_shadow_horizontal ?? 0}px ${chrome.card_shadow_vertical ?? 4}px ${chrome.card_shadow_blur ?? 12}px ${chrome.card_shadow_spread ?? 0}px ${chrome.card_shadow_color ?? 'rgba(0,0,0,0.15)'}`
          : theme
            ? vars['--uc-shadow'] ?? 'none'
            : 'var(--ha-card-box-shadow, none)';
    const surface = theme?.tokens.surface ?? 'flat';
    const accent = theme?.tokens.accent ?? 'var(--primary-color)';
    const font = theme?.tokens.font_family;
    const scale = this.large ? 2 : 1;

    const cardStyle: Record<string, string> = {
      ...vars,
      borderRadius: `${Math.min(Number(radius) || 0, 14 * scale)}px`,
      background: bg,
      border: `${borderWidth}px solid ${borderColor}`,
      boxShadow: shadow,
      backdropFilter: surface === 'glass' ? vars['--uc-surface-backdrop'] ?? 'none' : 'none',
      filter: vars['--uc-color-filter'] ?? 'none',
    };
    if (font) cardStyle.fontFamily = font;

    // The stage shows the page the theme asks for, so materials that depend
    // on a matching page (neumorphism, wood) preview the way they render.
    // `fixed` would pin a wallpaper to the viewport; the tile wants it inside the tile.
    const stageStyle = theme?.tokens.page_background
      ? { background: theme.tokens.page_background.replace(/\s+fixed\b/g, '') }
      : {};

    return html`
      <div class="swatch ${this.large ? 'large' : ''}" style=${styleMap(stageStyle)}>
        <div class="mini-card" style=${styleMap(cardStyle)}>
          <div class="mini-title">${this.large ? theme?.name ?? 'HA Native' : ''}</div>
          <div class="mini-row">
            <div
              class="mini-btn ${surface}"
              style=${styleMap({
                background: surface === 'outline' ? 'transparent' : accent,
                borderColor: accent,
              })}
            ></div>
            <div class="mini-btn ghost"></div>
          </div>
          <div class="mini-bar">
            <div class="mini-fill" style=${styleMap({ background: accent })}></div>
          </div>
        </div>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    .swatch {
      /* A neutral stage so glass / outline themes have something to sit on. */
      padding: 10px;
      border-radius: 8px;
      background:
        linear-gradient(135deg, rgba(var(--rgb-primary-color, 3, 169, 244), 0.18), transparent 60%),
        var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    }
    .swatch.large {
      padding: 24px;
      border-radius: 12px;
    }
    .mini-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      min-height: 46px;
      box-sizing: border-box;
      color: var(--primary-text-color);
    }
    .large .mini-card {
      gap: 12px;
      padding: 16px;
      min-height: 96px;
    }
    .mini-title {
      width: 55%;
      height: 5px;
      border-radius: 3px;
      background: currentColor;
      opacity: 0.65;
    }
    .large .mini-title {
      width: auto;
      height: auto;
      background: none;
      opacity: 1;
      font-size: 14px;
      font-weight: 600;
    }
    .mini-row {
      display: flex;
      gap: 4px;
    }
    .large .mini-row {
      gap: 8px;
    }
    .mini-btn {
      flex: 1;
      height: 10px;
      border-radius: var(--uc-radius-sm, 4px);
      border: 1px solid transparent;
      box-sizing: border-box;
    }
    .large .mini-btn {
      height: 28px;
    }
    .mini-btn.ghost {
      background: currentColor;
      opacity: 0.12;
      border-color: transparent !important;
    }
    .mini-btn.outline {
      border-width: 1px;
      border-style: solid;
    }
    .mini-btn.glass {
      opacity: 0.75;
    }
    .mini-btn.neumorphic {
      box-shadow:
        2px 2px 4px rgba(0, 0, 0, 0.18),
        -2px -2px 4px rgba(255, 255, 255, 0.12);
    }
    .mini-btn.glossy {
      background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0)) !important;
      background-blend-mode: overlay;
    }
    .mini-bar {
      height: 5px;
      border-radius: var(--uc-radius-sm, 3px);
      background: currentColor;
      opacity: 0.9;
      position: relative;
      overflow: hidden;
    }
    .large .mini-bar {
      height: 10px;
    }
    .mini-bar::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--card-background-color, white);
      opacity: 0.85;
    }
    .mini-fill {
      position: absolute;
      inset: 0 40% 0 0;
      border-radius: inherit;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-theme-swatch': UcThemeSwatch;
  }
}
