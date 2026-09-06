import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ucThemeService } from '../services/uc-theme-service';
import type { UcThemeDefinition } from '../themes/uc-theme-types';
import { UC_THEME_HA_NATIVE, UC_THEME_NONE } from '../themes/uc-theme-types';
import { localize } from '../localize/localize';
import './uc-theme-swatch';

export const UC_THEME_PICKER_FOLLOW_GLOBAL = '';

export interface UcThemePickedEvent {
  /** `''` = follow the global default, `'none'` = opt out, otherwise a theme id. */
  detail: { value: string };
}

/**
 * Radio-tile picker for Ultra Card themes with a live miniature of each one.
 * Used in Card Settings > Appearance and in the Hub.
 *
 * `value` semantics mirror `UltraCardConfig.uc_theme`:
 *   ''        follow the global default (shown with the resolved theme's name)
 *   'none'    no theme at all, not even the global default
 *   <id>      a specific theme
 */
@customElement('uc-theme-picker')
export class UcThemePicker extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ type: String }) public value: string = UC_THEME_PICKER_FOLLOW_GLOBAL;
  /** Hide the "Follow global default" tile (Hub uses the picker to *set* the global). */
  @property({ type: Boolean, attribute: 'hide-follow-global' }) public hideFollowGlobal = false;
  /** Hide the "None" tile. */
  @property({ type: Boolean, attribute: 'hide-none' }) public hideNone = false;
  /** Restrict to these ids (in order). Defaults to every registered theme. */
  @property({ attribute: false }) public themeIds: string[] | undefined;
  @property({ type: Boolean }) public compact = false;

  @state() private _tick = 0;
  private _unsubscribe: (() => void) | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._unsubscribe = ucThemeService.subscribe(() => {
      this._tick++;
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribe?.();
    this._unsubscribe = null;
  }

  private get _lang(): string {
    return this.hass?.locale?.language || 'en';
  }

  private _themes(): UcThemeDefinition[] {
    const all = ucThemeService.getAllThemes();
    if (!this.themeIds) return all;
    return this.themeIds
      .map(id => all.find(t => t.id === id))
      .filter((t): t is UcThemeDefinition => !!t);
  }

  private _pick(value: string): void {
    if (value === this.value) return;
    this.dispatchEvent(
      new CustomEvent('theme-picked', { detail: { value }, bubbles: true, composed: true })
    );
  }

  protected override render(): TemplateResult {
    const lang = this._lang;
    const globalId = ucThemeService.getGlobalDefaultId();
    const globalTheme =
      ucThemeService.getTheme(globalId) ?? ucThemeService.getTheme(UC_THEME_HA_NATIVE)!;
    const themes = this._themes();

    return html`
      <div class="tiles ${this.compact ? 'compact' : ''}" role="radiogroup" data-tick=${this._tick}>
        ${this.hideFollowGlobal
          ? nothing
          : this._renderTile({
              value: UC_THEME_PICKER_FOLLOW_GLOBAL,
              name: localize('editor.theme.follow_global', lang, 'Follow global default'),
              desc: globalTheme.name,
              icon: 'mdi:earth',
              theme: globalTheme.id === UC_THEME_HA_NATIVE ? null : globalTheme,
            })}
        ${themes.map(theme =>
          this._renderTile({
            value: theme.id,
            name: theme.name,
            desc: theme.description ?? '',
            icon: theme.icon ?? 'mdi:palette',
            theme: theme.id === UC_THEME_HA_NATIVE ? null : theme,
            badge: theme.source && theme.source !== 'builtin' ? theme.source : undefined,
          })
        )}
        ${this.hideNone
          ? nothing
          : this._renderTile({
              value: UC_THEME_NONE,
              name: localize('editor.theme.none', lang, 'None'),
              desc: localize(
                'editor.theme.none_desc',
                lang,
                'Ignore every theme, including the global default.'
              ),
              icon: 'mdi:cancel',
              theme: null,
            })}
      </div>
    `;
  }

  private _renderTile(t: {
    value: string;
    name: string;
    desc: string;
    icon: string;
    theme: UcThemeDefinition | null;
    badge?: string | undefined;
  }): TemplateResult {
    const selected = t.value === this.value;
    return html`
      <button
        type="button"
        role="radio"
        class="tile ${selected ? 'selected' : ''}"
        aria-checked=${selected}
        title=${t.desc}
        @click=${() => this._pick(t.value)}
      >
        <uc-theme-swatch .theme=${t.theme}></uc-theme-swatch>
        <div class="meta">
          <div class="name-row">
            <ha-icon .icon=${t.icon}></ha-icon>
            <span class="name">${t.name}</span>
            ${t.badge ? html`<span class="badge">${t.badge}</span>` : nothing}
          </div>
          ${this.compact ? nothing : html`<span class="desc">${t.desc}</span>`}
        </div>
      </button>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
    }
    .tiles.compact {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    .tile {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      text-align: left;
      cursor: pointer;
      font: inherit;
      transition:
        border-color 120ms ease,
        box-shadow 120ms ease;
    }
    /* Pointer-only: touch devices keep :hover latched on the last tapped tile,
       which reads as a second selection. */
    @media (hover: hover) {
      .tile:hover {
        border-color: var(--primary-color);
      }
    }
    .tile.selected {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color) inset;
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
    }
    .tile:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .name-row {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .name-row ha-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-color);
      flex: none;
    }
    .name {
      font-weight: 500;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .badge {
      margin-left: auto;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 1px 6px;
      border-radius: 999px;
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
      color: var(--primary-color);
      flex: none;
    }
    .desc {
      font-size: 11px;
      color: var(--secondary-text-color);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-theme-picker': UcThemePicker;
  }
}
