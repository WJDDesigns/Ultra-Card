import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localize } from '../localize/localize';
import type {
  UcThemeDefinition,
  UcThemeSurface,
  UcThemeDensity,
  UcThemePaletteKey,
} from '../themes/uc-theme-types';
import { UC_THEME_MODULE_FIELDS } from '../themes/uc-theme-module-options';
import { sanitizeThemeDefinition, scanThemeCss } from '../themes/uc-theme-validate';
import './uc-theme-swatch';

const SURFACES: UcThemeSurface[] = ['flat', 'glass', 'neumorphic', 'glossy', 'outline', 'minimal'];
const DENSITIES: UcThemeDensity[] = ['compact', 'regular', 'comfortable'];
const PALETTE_FIELDS: { key: UcThemePaletteKey; label: string; placeholder: string }[] = [
  { key: 'primary', label: 'Primary', placeholder: 'var(--primary-color)' },
  { key: 'accent', label: 'Accent', placeholder: 'var(--accent-color)' },
  { key: 'card_bg', label: 'Card background', placeholder: 'var(--card-background-color)' },
  { key: 'text', label: 'Text', placeholder: 'var(--primary-text-color)' },
  { key: 'text_secondary', label: 'Secondary text', placeholder: 'var(--secondary-text-color)' },
  { key: 'divider', label: 'Divider', placeholder: 'var(--divider-color)' },
  { key: 'on_primary', label: 'Text on primary', placeholder: 'auto (derived from primary)' },
];

type Draft = {
  id: string;
  name: string;
  description: string;
  author: string;
  icon: string;
  surface: UcThemeSurface;
  radius: string;
  radius_sm: string;
  blur: string;
  border_width: string;
  border_color: string;
  shadow: string;
  density: UcThemeDensity | '';
  accent: string;
  font_family: string;
  grayscale: string;
  color_filter: string;
  card_background: string;
  card_padding: string;
  card_shadow_enabled: '' | 'true' | 'false';
  palette: Partial<Record<UcThemePaletteKey, string>>;
  modules: Record<string, Record<string, string>>;
  css: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function draftFromTheme(theme: UcThemeDefinition | null): Draft {
  const t = theme?.tokens;
  const modules: Record<string, Record<string, string>> = {};
  for (const [type, entry] of Object.entries(theme?.modules ?? {})) {
    if (!entry) continue;
    modules[type] = {};
    for (const [k, v] of Object.entries(entry)) modules[type][k] = String(v);
  }
  return {
    id: theme?.id ?? '',
    name: theme?.name ?? '',
    description: theme?.description ?? '',
    author: theme?.author ?? '',
    icon: theme?.icon ?? 'mdi:palette',
    surface: t?.surface ?? 'flat',
    radius: t ? String(t.radius) : '12',
    radius_sm: t?.radius_sm !== undefined ? String(t.radius_sm) : '',
    blur: t?.blur !== undefined ? String(t.blur) : '',
    border_width: t?.border_width !== undefined ? String(t.border_width) : '',
    border_color: t?.border_color ?? '',
    shadow: t?.shadow ?? '',
    density: t?.density ?? '',
    accent: t?.accent ?? '',
    font_family: t?.font_family ?? '',
    grayscale: t?.grayscale !== undefined ? String(t.grayscale) : '',
    color_filter: t?.color_filter ?? '',
    card_background: theme?.card?.card_background ?? '',
    card_padding: theme?.card?.card_padding !== undefined ? String(theme.card.card_padding) : '',
    card_shadow_enabled:
      theme?.card?.card_shadow_enabled === undefined ? '' : theme.card.card_shadow_enabled ? 'true' : 'false',
    palette: { ...(t?.palette ?? {}) },
    modules,
    css: theme?.css ?? '',
  };
}

function numOrUndef(s: string): number | undefined {
  const n = parseFloat(s);
  return isFinite(n) ? n : undefined;
}

/** Raw (unsanitised) theme object from the form. The service sanitises on save. */
function themeFromDraft(d: Draft, version: number): Record<string, unknown> {
  const tokens: Record<string, unknown> = { surface: d.surface, radius: numOrUndef(d.radius) ?? 12 };
  const rs = numOrUndef(d.radius_sm);
  if (rs !== undefined) tokens.radius_sm = rs;
  const blur = numOrUndef(d.blur);
  if (blur !== undefined) tokens.blur = blur;
  const bw = numOrUndef(d.border_width);
  if (bw !== undefined) tokens.border_width = bw;
  if (d.border_color.trim()) tokens.border_color = d.border_color.trim();
  if (d.shadow.trim()) tokens.shadow = d.shadow.trim();
  if (d.density) tokens.density = d.density;
  if (d.accent.trim()) tokens.accent = d.accent.trim();
  if (d.font_family.trim()) tokens.font_family = d.font_family.trim();
  const gray = numOrUndef(d.grayscale);
  if (gray !== undefined && gray > 0) tokens.grayscale = Math.min(1, gray);
  if (d.color_filter.trim()) tokens.color_filter = d.color_filter.trim();
  const palette: Record<string, string> = {};
  for (const f of PALETTE_FIELDS) {
    const v = d.palette[f.key]?.trim();
    if (v) palette[f.key] = v;
  }
  if (Object.keys(palette).length) tokens.palette = palette;

  const card: Record<string, unknown> = {
    card_border_radius: tokens.radius,
  };
  if (bw !== undefined) card.card_border_width = bw;
  if (d.border_color.trim()) card.card_border_color = d.border_color.trim();
  if (d.card_background.trim()) card.card_background = d.card_background.trim();
  const pad = numOrUndef(d.card_padding);
  if (pad !== undefined) card.card_padding = pad;
  if (d.card_shadow_enabled) card.card_shadow_enabled = d.card_shadow_enabled === 'true';

  const modules: Record<string, Record<string, unknown>> = {};
  for (const field of UC_THEME_MODULE_FIELDS) {
    const raw = d.modules[field.moduleType]?.[field.key];
    if (raw === undefined || raw === '') continue;
    modules[field.moduleType] ??= {};
    modules[field.moduleType][field.key] = field.kind === 'number' ? numOrUndef(raw) : raw;
  }

  const out: Record<string, unknown> = {
    id: d.id || slugify(d.name),
    name: d.name.trim(),
    version,
    tokens,
    card,
  };
  if (d.description.trim()) out.description = d.description.trim();
  if (d.author.trim()) out.author = d.author.trim();
  if (d.icon.trim()) out.icon = d.icon.trim();
  if (Object.keys(modules).length) out.modules = modules;
  if (d.css.trim()) out.css = d.css;
  return out;
}

/**
 * Create / edit a theme. Emits `theme-save` with the raw theme object (the
 * caller stores it through `ucThemeService.saveToLibrary`, which sanitises)
 * and `theme-cancel`.
 */
@customElement('uc-theme-editor-dialog')
export class UcThemeEditorDialog extends LitElement {
  @property({ attribute: false }) public hass: any;
  /** Theme to edit; null for a new one. */
  @property({ attribute: false }) public theme: UcThemeDefinition | null = null;
  /** Editing a copy: id is regenerated from the name and version resets. */
  @property({ type: Boolean }) public asCopy = false;

  @state() private _draft: Draft = draftFromTheme(null);
  @state() private _error = '';
  @state() private _cssWarnings: string[] = [];
  @state() private _modulesOpen = false;
  @state() private _paletteOpen = false;

  private get _lang(): string {
    return this.hass?.locale?.language || 'en';
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('theme') || changed.has('asCopy')) {
      const d = draftFromTheme(this.theme);
      if (this.asCopy) {
        d.id = '';
        d.name = this.theme ? `${this.theme.name} copy` : '';
      }
      this._draft = d;
      this._error = '';
      this._cssWarnings = [];
      if (Object.keys(d.palette).length) this._paletteOpen = true;
    }
  }

  private _setPalette(key: UcThemePaletteKey, value: string): void {
    const palette = { ...this._draft.palette };
    if (value.trim() === '') delete palette[key];
    else palette[key] = value;
    this._draft = { ...this._draft, palette };
  }

  private _set<K extends keyof Draft>(key: K, value: Draft[K]): void {
    this._draft = { ...this._draft, [key]: value };
    if (key === 'css') {
      this._cssWarnings = scanThemeCss(value as string).reasons;
    }
  }

  private _setModule(type: string, key: string, value: string): void {
    const modules = { ...this._draft.modules, [type]: { ...(this._draft.modules[type] ?? {}) } };
    if (value === '') delete modules[type][key];
    else modules[type][key] = value;
    if (!Object.keys(modules[type]).length) delete modules[type];
    this._draft = { ...this._draft, modules };
  }

  private _previewTheme(): UcThemeDefinition | null {
    const raw = themeFromDraft({ ...this._draft, name: this._draft.name || 'Preview' }, 1);
    if (!raw.id) raw.id = 'preview';
    return sanitizeThemeDefinition(raw).theme;
  }

  private _save(): void {
    const lang = this._lang;
    if (!this._draft.name.trim()) {
      this._error = localize('hub.themes.editor_name_required', lang, 'Give the theme a name first');
      return;
    }
    const version = this.asCopy || !this.theme ? 1 : (this.theme.version ?? 0) + 1;
    const raw = themeFromDraft(this._draft, version);
    const { theme, warnings } = sanitizeThemeDefinition(raw, { source: 'local' });
    if (!theme) {
      this._error = warnings.join(', ') || 'Invalid theme';
      return;
    }
    this.dispatchEvent(
      new CustomEvent('theme-save', { detail: { theme: raw, warnings }, bubbles: true, composed: true })
    );
  }

  private _cancel(): void {
    this.dispatchEvent(new CustomEvent('theme-cancel', { bubbles: true, composed: true }));
  }

  protected override render(): TemplateResult {
    const lang = this._lang;
    const d = this._draft;
    const isNew = this.asCopy || !this.theme;
    const t = (k: string, fb: string) => localize(`hub.themes.${k}`, lang, fb);

    return html`
      <div class="backdrop" @click=${this._cancel}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-label=${isNew ? t('editor_title_new', 'New theme') : t('editor_title_edit', 'Edit theme')}>
        <header>
          <ha-icon icon="mdi:palette-swatch"></ha-icon>
          <h2>${isNew ? t('editor_title_new', 'New theme') : t('editor_title_edit', 'Edit theme')}</h2>
          <button class="icon-btn" @click=${this._cancel} aria-label=${t('editor_cancel', 'Cancel')}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </header>

        <div class="body">
          <div class="form">
            <section>
              <h3>${t('editor_basics', 'Basics')}</h3>
              <div class="grid-2">
                ${this._text('name', t('editor_name', 'Name'), d.name, v => {
                  this._set('name', v);
                  if (isNew) this._set('id', slugify(v));
                })}
                ${this._text('id', t('editor_id', 'Id'), d.id, v => this._set('id', slugify(v)), 'my-theme')}
                ${this._text('author', t('editor_author', 'Author'), d.author, v => this._set('author', v))}
                ${this._text('icon', t('editor_icon', 'Icon (mdi:...)'), d.icon, v => this._set('icon', v))}
              </div>
              ${this._text(
                'description',
                t('editor_description', 'Description'),
                d.description,
                v => this._set('description', v)
              )}
            </section>

            <section>
              <h3>${t('editor_tokens', 'Surface & shape')}</h3>
              <div class="grid-2">
                ${this._select(
                  t('editor_surface', 'Surface'),
                  d.surface,
                  SURFACES.map(s => ({ value: s, label: s })),
                  v => this._set('surface', v as UcThemeSurface)
                )}
                ${this._select(
                  t('editor_density', 'Density'),
                  d.density,
                  [{ value: '', label: '—' }, ...DENSITIES.map(s => ({ value: s, label: s }))],
                  v => this._set('density', v as UcThemeDensity | '')
                )}
                ${this._text('radius', t('editor_radius', 'Card radius (px)'), d.radius, v => this._set('radius', v), '12', 'number')}
                ${this._text('radius_sm', t('editor_radius_sm', 'Control radius (px)'), d.radius_sm, v => this._set('radius_sm', v), 'radius / 2', 'number')}
                ${this._text('blur', t('editor_blur', 'Glass blur (px)'), d.blur, v => this._set('blur', v), '12', 'number')}
                ${this._text('border_width', t('editor_border_width', 'Border width (px)'), d.border_width, v => this._set('border_width', v), '1', 'number')}
                ${this._text('border_color', t('editor_border_color', 'Border colour'), d.border_color, v => this._set('border_color', v), 'var(--divider-color)')}
                ${this._text('accent', t('editor_accent', 'Accent colour'), d.accent, v => this._set('accent', v), 'var(--primary-color)')}
              </div>
              ${this._text('shadow', t('editor_shadow', 'Shadow (CSS box-shadow)'), d.shadow, v => this._set('shadow', v), '0 4px 16px rgba(0,0,0,0.08)')}
              ${this._text('font_family', t('editor_font', 'Font family'), d.font_family, v => this._set('font_family', v), 'inherit')}
              ${this._text('grayscale', t('editor_grayscale', 'Desaturate whole card (0 = colour, 1 = monochrome)'), d.grayscale, v => this._set('grayscale', v), '0', 'number')}
              ${this._text('color_filter', t('editor_color_filter', 'Colour filter (CSS filter chain, overrides desaturate)'), d.color_filter, v => this._set('color_filter', v), 'grayscale(1) sepia(1) hue-rotate(80deg) saturate(2.5)')}
            </section>

            <section>
              <h3>${t('editor_card', 'Card chrome')}</h3>
              <p class="hint">${t('editor_card_hint', "Leave a field empty to let the card fall back to Home Assistant's own variables.")}</p>
              <div class="grid-2">
                ${this._text('card_background', t('editor_card_background', 'Background'), d.card_background, v => this._set('card_background', v), 'var(--card-background-color)')}
                ${this._text('card_padding', t('editor_card_padding', 'Padding (px)'), d.card_padding, v => this._set('card_padding', v), '16', 'number')}
                ${this._select(
                  t('editor_card_shadow', 'Card shadow'),
                  d.card_shadow_enabled,
                  [
                    { value: '', label: '—' },
                    { value: 'true', label: 'On' },
                    { value: 'false', label: 'Off' },
                  ],
                  v => this._set('card_shadow_enabled', v as Draft['card_shadow_enabled'])
                )}
              </div>
            </section>

            <section>
              <button class="section-toggle" @click=${() => (this._paletteOpen = !this._paletteOpen)}>
                <h3>${t('editor_palette', 'Colours')}</h3>
                <ha-icon icon=${this._paletteOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
              </button>
              ${this._paletteOpen
                ? html`
                    <p class="hint">${t('editor_palette_hint', 'Pins Home Assistant colour variables on cards using this theme. Leave empty to follow the active HA theme.')}</p>
                    <div class="grid-2">
                      ${PALETTE_FIELDS.map(f =>
                        this._text(
                          `palette.${f.key}`,
                          t(`editor_palette_${f.key}`, f.label),
                          d.palette[f.key] ?? '',
                          v => this._setPalette(f.key, v),
                          f.placeholder
                        )
                      )}
                    </div>
                  `
                : nothing}
            </section>

            <section>
              <button class="section-toggle" @click=${() => (this._modulesOpen = !this._modulesOpen)}>
                <h3>${t('editor_modules', 'Module defaults')}</h3>
                <ha-icon icon=${this._modulesOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
              </button>
              ${this._modulesOpen
                ? html`<div class="grid-2">
                    ${UC_THEME_MODULE_FIELDS.map(f => {
                      const current = d.modules[f.moduleType]?.[f.key] ?? '';
                      const label = `${f.moduleLabel} · ${f.label}`;
                      return f.kind === 'select'
                        ? this._select(
                            label,
                            current,
                            [{ value: '', label: t('editor_module_inherit', 'Module default') }, ...(f.options ?? [])],
                            v => this._setModule(f.moduleType, f.key, v)
                          )
                        : this._text(
                            `${f.moduleType}.${f.key}`,
                            label,
                            current,
                            v => this._setModule(f.moduleType, f.key, v),
                            '',
                            'number'
                          );
                    })}
                  </div>`
                : nothing}
            </section>

            <section>
              <h3>${t('editor_css', 'Custom CSS')}</h3>
              <p class="hint">${t('editor_css_help', 'Scoped to this card\'s shadow root. Use .card-container and module classes. url(), @import and @font-face are not allowed.')}</p>
              <textarea
                rows="6"
                spellcheck="false"
                .value=${d.css}
                @input=${(e: Event) => this._set('css', (e.target as HTMLTextAreaElement).value)}
              ></textarea>
              ${this._cssWarnings.length
                ? html`<ul class="warn">${this._cssWarnings.map(w => html`<li>${w}</li>`)}</ul>`
                : nothing}
            </section>
          </div>

          <aside class="preview">
            <h3>${t('editor_preview', 'Preview')}</h3>
            <uc-theme-swatch large .theme=${this._previewTheme()}></uc-theme-swatch>
          </aside>
        </div>

        <footer>
          ${this._error ? html`<span class="error">${this._error}</span>` : html`<span></span>`}
          <div class="actions">
            <button class="btn ghost" @click=${this._cancel}>${t('editor_cancel', 'Cancel')}</button>
            <button class="btn primary" @click=${this._save}>${t('editor_save', 'Save theme')}</button>
          </div>
        </footer>
      </div>
    `;
  }

  private _text(
    key: string,
    label: string,
    value: string,
    onInput: (v: string) => void,
    placeholder = '',
    type: 'text' | 'number' = 'text'
  ): TemplateResult {
    return html`
      <label class="field">
        <span>${label}</span>
        <input
          type=${type}
          data-key=${key}
          .value=${value}
          placeholder=${placeholder}
          @input=${(e: Event) => onInput((e.target as HTMLInputElement).value)}
        />
      </label>
    `;
  }

  private _select(
    label: string,
    value: string,
    options: readonly { value: string; label: string }[],
    onChange: (v: string) => void
  ): TemplateResult {
    return html`
      <label class="field">
        <span>${label}</span>
        <select .value=${value} @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}>
          ${options.map(o => html`<option value=${o.value} ?selected=${o.value === value}>${o.label}</option>`)}
        </select>
      </label>
    `;
  }

  static override styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: block;
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    .panel {
      position: absolute;
      inset: 4vh 50% auto auto;
      transform: translateX(50%);
      width: min(960px, 96vw);
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      border-radius: 16px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
      overflow: hidden;
    }
    header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--divider-color);
    }
    header ha-icon {
      color: var(--primary-color);
    }
    header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      flex: 1;
    }
    .icon-btn {
      border: none;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
    }
    .icon-btn:hover {
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
    }
    .body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 20px;
      padding: 20px;
      overflow: auto;
    }
    @media (max-width: 760px) {
      .body {
        grid-template-columns: 1fr;
      }
      .preview {
        order: -1;
      }
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 0;
    }
    section h3 {
      margin: 0 0 10px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }
    .section-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: inherit;
      font: inherit;
    }
    .section-toggle h3 {
      margin: 0;
    }
    .section-toggle ha-icon {
      color: var(--secondary-text-color);
    }
    .hint {
      margin: -4px 0 10px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px 14px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    .field input,
    .field select,
    textarea {
      font: inherit;
      font-size: 13px;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 8px 10px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .field input:focus,
    .field select:focus,
    textarea:focus {
      border-color: var(--primary-color);
    }
    textarea {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      resize: vertical;
    }
    .warn {
      margin: 8px 0 0;
      padding-left: 18px;
      font-size: 12px;
      color: var(--warning-color, #ff9800);
    }
    .preview {
      position: sticky;
      top: 0;
      align-self: start;
    }
    .preview h3 {
      margin: 0 0 10px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }
    footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 20px;
      border-top: 1px solid var(--divider-color);
    }
    .error {
      color: var(--error-color, #f44336);
      font-size: 13px;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      border-radius: 10px;
      padding: 8px 16px;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
    }
    .btn.primary {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, white);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-theme-editor-dialog': UcThemeEditorDialog;
  }
}
