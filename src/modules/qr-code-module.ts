import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import QRCodeStyling from 'qr-code-styling';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, QrCodeModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import { TemplateService } from '../services/template-service';
import '../components/ultra-color-picker';

/** Event dispatched when QR data URL is ready so the card can re-render */
export const UC_QR_DATA_READY_EVENT = 'uc-qr-data-ready';

/** Cache: key = cacheKey(module, content), value = generated QR data URL */
const qrDataUrlCache = new Map<string, string>();

/**
 * Logo image cache.
 * key = original URL
 * value = base64 data URL on success, '' on CORS/load failure, undefined = not yet fetched
 */
const logoDataUrlCache = new Map<string, string>();
/** URLs currently being fetched so we don't duplicate requests */
const logoFetchingSet = new Set<string>();

/**
 * Fetch a remote logo URL and store it as a base64 data URL so that
 * qr-code-styling can embed it in a canvas without hitting CORS restrictions.
 * Dispatches UC_QR_DATA_READY_EVENT when done (success or failure).
 */
function fetchLogoAsDataUrl(logoUrl: string): void {
  if (logoFetchingSet.has(logoUrl)) return;
  logoFetchingSet.add(logoUrl);
  fetch(logoUrl, { mode: 'cors' })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    )
    .then((dataUrl) => {
      logoDataUrlCache.set(logoUrl, dataUrl);
      logoFetchingSet.delete(logoUrl);
      // Bust all cached QR images that were waiting on this logo
      for (const k of [...qrDataUrlCache.keys()]) {
        if (k.includes('logo:pending')) qrDataUrlCache.delete(k);
      }
      window.dispatchEvent(new CustomEvent(UC_QR_DATA_READY_EVENT));
    })
    .catch(() => {
      logoDataUrlCache.set(logoUrl, ''); // '' = failed
      logoFetchingSet.delete(logoUrl);
      for (const k of [...qrDataUrlCache.keys()]) {
        if (k.includes('logo:pending')) qrDataUrlCache.delete(k);
      }
      window.dispatchEvent(new CustomEvent(UC_QR_DATA_READY_EVENT));
    });
}

function logoStatus(module: QrCodeModule): string {
  if (!module.logo_enabled || !module.logo_url) return 'nologo';
  const cached = logoDataUrlCache.get(module.logo_url);
  if (cached === undefined) return 'logo:pending';
  if (cached === '') return 'logo:failed';
  return 'logo:loaded';
}

function cacheKey(module: QrCodeModule, content: string): string {
  const size = module.size || 200;
  const fg = module.fg_color || '#000000';
  const bg = module.bg_color || '#ffffff';
  const ec = module.error_correction || 'M';
  const margin = module.qr_margin ?? 1;
  const dot = module.dot_style || 'square';
  const cSq = module.corner_square_style || 'square';
  const cDot = module.corner_dot_style || 'square';
  const logoSuffix = module.logo_enabled && module.logo_url
    ? `${logoStatus(module)}|${module.logo_size ?? 0.25}|${module.logo_margin ?? 4}|${module.logo_hide_bg_dots !== false}`
    : 'nologo';
  return `${module.id}|${content}|${size}|${fg}|${bg}|${ec}|${margin}|${dot}|${cSq}|${cDot}|${logoSuffix}`;
}

/**
 * QR Code Module - Pro Feature
 *
 * Generates QR codes from static text/URL, HA template, or entity state.
 * Simple for basic use; advanced options for colors, error correction, and quiet zone.
 */
export class UltraQrCodeModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'qr_code',
    title: 'QR Code',
    description: 'Generate QR codes from URL, text, template, or entity state',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:qrcode',
    category: 'content',
    tags: ['qr', 'qrcode', 'pro', 'premium', 'barcode'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): QrCodeModule {
    return {
      id: id || this.generateId('qr_code'),
      type: 'qr_code',
      content_mode: 'static',
      content_static: 'https://www.home-assistant.io',
      size: 200,
      alignment: 'center',
      show_label: false,
      label_text: '',
      label_below: true,
      fg_color: '#000000',
      bg_color: '#ffffff',
      error_correction: 'M',
      qr_margin: 1,
      dot_style: 'square',
      corner_square_style: 'square',
      corner_dot_style: 'square',
      logo_enabled: false,
      logo_url: '',
      logo_size: 0.25,
      logo_margin: 4,
      logo_hide_bg_dots: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as QrCodeModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as QrCodeModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const qrModule = module as QrCodeModule;
    const lang = hass?.locale?.language || 'en';

    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    if (!isPro) {
      return this.renderProLockUI(lang);
    }

    return html`
      <style>
        ${this.injectUcFormStyles()} ${BaseUltraModule.getSliderStyles()}
      </style>

      <!-- Content source -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.qr_code.content_title', lang, 'CONTENT')}
        </div>
        ${this.renderSelect(
          localize('editor.qr_code.content_mode', lang, 'Source'),
          qrModule.content_mode || 'static',
          [
            { value: 'static', label: localize('editor.qr_code.static', lang, 'Static URL / Text') },
            { value: 'template', label: localize('editor.qr_code.template', lang, 'HA Template') },
            { value: 'entity', label: localize('editor.qr_code.entity', lang, 'Entity State') },
          ],
          (v: string) => updateModule({ content_mode: v as 'static' | 'template' | 'entity' }),
          localize('editor.qr_code.content_mode_desc', lang, 'Where to get the text to encode')
        )}
        ${qrModule.content_mode === 'static'
          ? this.renderTextInput(
              localize('editor.qr_code.static_content', lang, 'URL or text'),
              qrModule.content_static || '',
              (v: string) => updateModule({ content_static: v }),
              'https://www.home-assistant.io',
              localize('editor.qr_code.static_desc', lang, 'Text or URL to encode in the QR code')
            )
          : ''}
        ${qrModule.content_mode === 'template'
          ? this.renderTextArea(
              localize('editor.qr_code.template_content', lang, 'Template'),
              qrModule.content_template || '',
              (v: string) => updateModule({ content_template: v }),
              '{{ states("sensor.example") }}',
              localize('editor.qr_code.template_desc', lang, 'Jinja2 template that outputs the string to encode')
            )
          : ''}
        ${qrModule.content_mode === 'entity'
          ? html`
              ${this.renderEntityPicker(
                localize('editor.qr_code.entity_picker', lang, 'Entity'),
                qrModule.content_entity || '',
                (v: string) => updateModule({ content_entity: v }),
                hass,
                undefined,
                localize('editor.qr_code.entity_desc', lang, 'Entity whose state (or attribute) will be encoded')
              )}
              ${this.renderTextInput(
                localize('editor.qr_code.attribute', lang, 'Attribute (optional)'),
                qrModule.content_attribute || '',
                (v: string) => updateModule({ content_attribute: v || undefined }),
                '',
                localize('editor.qr_code.attribute_desc', lang, 'Leave empty to use state; or e.g. friendly_name')
              )}
            `
          : ''}
      </div>

      <!-- Display -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.qr_code.display_title', lang, 'DISPLAY')}
        </div>
        ${this.renderSliderField(
          localize('editor.qr_code.size', lang, 'Size'),
          localize('editor.qr_code.size_desc', lang, 'Width and height in pixels'),
          qrModule.size ?? 200,
          200,
          64,
          512,
          8,
          (v: number) => updateModule({ size: v }),
          'px'
        )}
        ${this.renderSelect(
          localize('editor.qr_code.alignment', lang, 'Alignment'),
          qrModule.alignment || 'center',
          [
            { value: 'left', label: localize('editor.qr_code.align_left', lang, 'Left') },
            { value: 'center', label: localize('editor.qr_code.align_center', lang, 'Center') },
            { value: 'right', label: localize('editor.qr_code.align_right', lang, 'Right') },
          ],
          (v: string) => updateModule({ alignment: v as 'left' | 'center' | 'right' })
        )}
        ${this.renderCheckbox(
          localize('editor.qr_code.show_label', lang, 'Show label'),
          qrModule.show_label ?? false,
          (v: boolean) => updateModule({ show_label: v })
        )}
        ${qrModule.show_label
          ? html`
              ${this.renderTextInput(
                localize('editor.qr_code.label_text', lang, 'Label text'),
                qrModule.label_text || '',
                (v: string) => updateModule({ label_text: v })
              )}
              ${this.renderCheckbox(
                localize('editor.qr_code.label_below', lang, 'Label below QR'),
                qrModule.label_below !== false,
                (v: boolean) => updateModule({ label_below: v })
              )}
            `
          : ''}
      </div>

      <!-- Style -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.qr_code.style_title', lang, 'STYLE')}
        </div>
        ${this.renderSelect(
          localize('editor.qr_code.dot_style', lang, 'Dot pattern'),
          qrModule.dot_style || 'square',
          [
            { value: 'square', label: localize('editor.qr_code.dot_square', lang, 'Square') },
            { value: 'dots', label: localize('editor.qr_code.dot_dots', lang, 'Dots') },
            { value: 'rounded', label: localize('editor.qr_code.dot_rounded', lang, 'Rounded') },
            { value: 'extra-rounded', label: localize('editor.qr_code.dot_extra_rounded', lang, 'Extra Rounded') },
            { value: 'classy', label: localize('editor.qr_code.dot_classy', lang, 'Classy') },
            { value: 'classy-rounded', label: localize('editor.qr_code.dot_classy_rounded', lang, 'Classy Rounded') },
          ],
          (v: string) => updateModule({ dot_style: v as QrCodeModule['dot_style'] }),
          localize('editor.qr_code.dot_style_desc', lang, 'Shape of each individual data module')
        )}
        ${this.renderSelect(
          localize('editor.qr_code.corner_square_style', lang, 'Corner squares'),
          qrModule.corner_square_style || 'square',
          [
            { value: 'square', label: localize('editor.qr_code.cs_square', lang, 'Square') },
            { value: 'dot', label: localize('editor.qr_code.cs_dot', lang, 'Dot') },
            { value: 'extra-rounded', label: localize('editor.qr_code.cs_extra_rounded', lang, 'Extra Rounded') },
          ],
          (v: string) => updateModule({ corner_square_style: v as QrCodeModule['corner_square_style'] }),
          localize('editor.qr_code.corner_square_desc', lang, 'Shape of the three large corner finder squares')
        )}
        ${this.renderSelect(
          localize('editor.qr_code.corner_dot_style', lang, 'Corner dots'),
          qrModule.corner_dot_style || 'square',
          [
            { value: 'square', label: localize('editor.qr_code.cd_square', lang, 'Square') },
            { value: 'dot', label: localize('editor.qr_code.cd_dot', lang, 'Dot') },
          ],
          (v: string) => updateModule({ corner_dot_style: v as QrCodeModule['corner_dot_style'] }),
          localize('editor.qr_code.corner_dot_desc', lang, 'Shape of the small inner dots inside each corner square')
        )}
      </div>

      <!-- Logo -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.qr_code.logo_title', lang, 'LOGO / ICON')}
        </div>
        ${this.renderCheckbox(
          localize('editor.qr_code.logo_enabled', lang, 'Show logo in center'),
          qrModule.logo_enabled ?? false,
          (v: boolean) => updateModule({ logo_enabled: v })
        )}
        ${qrModule.logo_enabled
          ? html`
              ${this.renderTextInput(
                localize('editor.qr_code.logo_url', lang, 'Logo image URL'),
                qrModule.logo_url || '',
                (v: string) => {
                  // Clear logo cache when URL changes so it re-fetches
                  if (v !== qrModule.logo_url) {
                    logoDataUrlCache.delete(qrModule.logo_url || '');
                    logoDataUrlCache.delete(v);
                  }
                  updateModule({ logo_url: v });
                },
                'https://example.com/logo.png',
                localize('editor.qr_code.logo_url_desc', lang, 'Direct URL to a PNG, JPG, or SVG image. Use /local/ paths for best results.')
              )}
              ${qrModule.logo_url && logoDataUrlCache.get(qrModule.logo_url) === ''
                ? html`
                    <div
                      style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;margin-bottom:12px;background:rgba(var(--warning-color-int,255,152,0),0.12);border:1px solid var(--warning-color,#ff9800);border-radius:8px;font-size:13px;"
                    >
                      <ha-icon icon="mdi:alert-outline" style="--mdi-icon-size:18px;color:var(--warning-color,#ff9800);flex-shrink:0;margin-top:1px;"></ha-icon>
                      <div>
                        <strong>${localize('editor.qr_code.cors_title', lang, 'Image blocked by CORS')}</strong><br/>
                        <span style="color:var(--secondary-text-color);">
                          ${localize('editor.qr_code.cors_hint', lang, 'The server rejected cross-origin requests. Copy the image to /config/www/ and use /local/your-image.png instead.')}
                        </span>
                      </div>
                    </div>
                  `
                : ''}
              ${this.renderSliderField(
                localize('editor.qr_code.logo_size', lang, 'Logo size'),
                localize('editor.qr_code.logo_size_desc', lang, 'Logo as a fraction of the QR code area (10–40%)'),
                Math.round((qrModule.logo_size ?? 0.25) * 100),
                25,
                10,
                40,
                5,
                (v: number) => updateModule({ logo_size: v / 100 }),
                '%'
              )}
              ${this.renderSliderField(
                localize('editor.qr_code.logo_margin', lang, 'Logo margin'),
                localize('editor.qr_code.logo_margin_desc', lang, 'White space around the logo in pixels'),
                qrModule.logo_margin ?? 4,
                4,
                0,
                16,
                1,
                (v: number) => updateModule({ logo_margin: v }),
                'px'
              )}
              ${this.renderCheckbox(
                localize('editor.qr_code.logo_hide_bg_dots', lang, 'Hide dots behind logo'),
                qrModule.logo_hide_bg_dots !== false,
                (v: boolean) => updateModule({ logo_hide_bg_dots: v })
              )}
            `
          : ''}
      </div>

      <!-- Advanced -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.qr_code.advanced_title', lang, 'ADVANCED')}
        </div>
        <div class="form-field" style="margin-bottom: 16px;">
          <label class="form-label">${localize('editor.qr_code.fg_color', lang, 'Foreground color')}</label>
          <ultra-color-picker
            .label="${''}"
            .value="${qrModule.fg_color || '#000000'}"
            .defaultValue="${'#000000'}"
            .hass="${hass}"
            @value-changed="${(e: CustomEvent) => updateModule({ fg_color: e.detail.value })}"
          ></ultra-color-picker>
        </div>
        <div class="form-field" style="margin-bottom: 16px;">
          <label class="form-label">${localize('editor.qr_code.bg_color', lang, 'Background color')}</label>
          <ultra-color-picker
            .label="${''}"
            .value="${qrModule.bg_color || '#ffffff'}"
            .defaultValue="${'#ffffff'}"
            .hass="${hass}"
            @value-changed="${(e: CustomEvent) => updateModule({ bg_color: e.detail.value })}"
          ></ultra-color-picker>
        </div>
        ${this.renderSelect(
          localize('editor.qr_code.error_correction', lang, 'Error correction'),
          qrModule.error_correction || 'M',
          [
            { value: 'L', label: 'L (7%)' },
            { value: 'M', label: 'M (15%)' },
            { value: 'Q', label: 'Q (25%)' },
            { value: 'H', label: 'H (30%)' },
          ],
          (v: string) => updateModule({ error_correction: v as 'L' | 'M' | 'Q' | 'H' }),
          localize('editor.qr_code.error_correction_desc', lang, 'Higher = more damage tolerance, larger code')
        )}
        ${this.renderSliderField(
          localize('editor.qr_code.quiet_zone', lang, 'Quiet zone (margin)'),
          localize('editor.qr_code.quiet_zone_desc', lang, 'Modules around the QR code (0–10)'),
          qrModule.qr_margin ?? 1,
          1,
          0,
          10,
          1,
          (v: number) => updateModule({ qr_margin: v })
        )}
      </div>
    `;
  }

  private renderProLockUI(lang: string): TemplateResult {
    return html`
      <div
        class="pro-lock-container"
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
          background: var(--secondary-background-color);
          border-radius: 12px;
          margin: 16px;
        "
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${localize('editor.pro.feature_locked', lang, 'Pro Feature')}
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;"
        >
          ${localize(
            'editor.qr_code.pro_description',
            lang,
            'QR Code is a Pro feature that generates scannable QR codes from URLs, text, templates, or entity state.'
          )}
        </div>
        <a
          href="https://ultracard.io/pro"
          target="_blank"
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          "
        >
          <ha-icon icon="mdi:crown" style="--mdi-icon-size: 20px;"></ha-icon>
          ${localize('editor.pro.upgrade_button', lang, 'Upgrade to Pro')}
        </a>
      </div>
    `;
  }

  private _resolveContent(module: QrCodeModule, hass: HomeAssistant, config?: UltraCardConfig): string {
    const mode = module.content_mode || 'static';
    if (mode === 'static') {
      return (module.content_static || '').trim() || 'https://www.home-assistant.io';
    }
    if (mode === 'entity' && module.content_entity && hass?.states?.[module.content_entity]) {
      const stateObj = hass.states[module.content_entity];
      if (module.content_attribute) {
        const v = (stateObj.attributes as Record<string, unknown>)?.[module.content_attribute];
        return v != null ? String(v) : '';
      }
      return stateObj.state != null ? String(stateObj.state) : '';
    }
    if (mode === 'template' && module.content_template && hass) {
      const key = `qr_${module.id}`;
      const cached = (hass as any).__uvc_template_strings?.[key];
      if (cached != null) return String(cached).trim();
      try {
        const svc = new TemplateService(hass);
        svc.subscribeToTemplate(module.content_template, key, () => {
          window.dispatchEvent(new CustomEvent(UC_QR_DATA_READY_EVENT));
        }, {}, config);
      } catch (_) {
        // ignore
      }
      return '';
    }
    return '';
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const qrModule = module as QrCodeModule;
    const content = this._resolveContent(qrModule, hass, config);
    const size = Math.min(512, Math.max(64, qrModule.size ?? 200));
    const fg = qrModule.fg_color || '#000000';
    const bg = qrModule.bg_color || '#ffffff';
    const ec = (qrModule.error_correction || 'M') as 'L' | 'M' | 'Q' | 'H';
    const margin = qrModule.qr_margin ?? 1;
    const alignment = qrModule.alignment || 'center';
    const showLabel = qrModule.show_label ?? false;
    const labelText = (qrModule.label_text || '').trim();
    const labelBelow = qrModule.label_below !== false;

    // --- Logo resolution ---
    // Pre-fetch the logo and convert to a data URL so qr-code-styling can embed
    // it in the canvas without CORS issues (passing a data URL is always same-origin).
    let resolvedLogoDataUrl: string | undefined;
    let logoCorsError = false;
    if (qrModule.logo_enabled && qrModule.logo_url) {
      const cached = logoDataUrlCache.get(qrModule.logo_url);
      if (cached === undefined) {
        // Not yet fetched - kick off fetch and render without logo for now
        fetchLogoAsDataUrl(qrModule.logo_url);
      } else if (cached === '') {
        // Fetch failed (CORS or network error)
        logoCorsError = true;
      } else {
        resolvedLogoDataUrl = cached;
      }
    }
    // --- End logo resolution ---

    const key = cacheKey(qrModule, content);
    let dataUrl = qrDataUrlCache.get(key);

    if (!content && qrModule.content_mode !== 'template') {
      return html`
        <div class="qr-code-module-preview qr-code-placeholder" style="text-align: center; padding: 24px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:qrcode" style="--mdi-icon-size: 48px; opacity: 0.5;"></ha-icon>
          <div style="margin-top: 8px; font-size: 14px;">${localize('editor.qr_code.no_content', hass?.locale?.language || 'en', 'Add content in General tab')}</div>
        </div>
      `;
    }

    if (!dataUrl && content) {
      const dispatchReady = () => window.dispatchEvent(new CustomEvent(UC_QR_DATA_READY_EVENT));

      const qrInstance = new QRCodeStyling({
        width: size,
        height: size,
        data: content,
        margin,
        // Pass the pre-fetched data URL (same-origin) so canvas is never tainted.
        // If still pending or failed, skip the logo entirely.
        image: resolvedLogoDataUrl || undefined,
        qrOptions: { errorCorrectionLevel: ec },
        dotsOptions: { type: (qrModule.dot_style || 'square') as any, color: fg },
        cornersSquareOptions: { type: (qrModule.corner_square_style || 'square') as any, color: fg },
        cornersDotOptions: { type: (qrModule.corner_dot_style || 'square') as any, color: fg },
        backgroundOptions: { color: bg },
        // imageOptions must always be an object - qr-code-styling unconditionally reads
        // imageOptions.hideBackgroundDots even when no image is provided, causing a crash
        // when the property is undefined.
        imageOptions: {
          // No crossOrigin needed - we're passing a data URL, which is same-origin
          margin: resolvedLogoDataUrl ? (qrModule.logo_margin ?? 4) : 0,
          imageSize: resolvedLogoDataUrl ? (qrModule.logo_size ?? 0.25) : 0.4,
          hideBackgroundDots: resolvedLogoDataUrl ? (qrModule.logo_hide_bg_dots !== false) : true,
          saveAsBlob: true,
        },
      });

      qrInstance
        .getRawData('png')
        .then((blob) => {
          if (!blob) {
            qrDataUrlCache.set(key, '');
            dispatchReady();
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            qrDataUrlCache.set(key, (reader.result as string) || '');
            dispatchReady();
          };
          reader.onerror = () => {
            qrDataUrlCache.set(key, '');
            dispatchReady();
          };
          reader.readAsDataURL(blob as Blob);
        })
        .catch(() => {
          qrDataUrlCache.set(key, '');
          dispatchReady();
        });

      return html`
        <div class="qr-code-module-preview qr-code-loading" style="text-align: center; padding: 24px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:loading" class="qr-code-spinner" style="--mdi-icon-size: 32px;"></ha-icon>
          <div style="margin-top: 8px; font-size: 14px;">${localize('editor.qr_code.generating', hass?.locale?.language || 'en', 'Generating QR...')}</div>
        </div>
      `;
    }

    if (!dataUrl) {
      return html`
        <div class="qr-code-module-preview qr-code-placeholder" style="text-align: center; padding: 24px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:qrcode" style="--mdi-icon-size: 48px; opacity: 0.5;"></ha-icon>
        </div>
      `;
    }

    const handlers = this.createGestureHandlers(
      module.id,
      {
        tap_action: qrModule.tap_action,
        hold_action: qrModule.hold_action,
        double_tap_action: qrModule.double_tap_action,
        entity: undefined,
        module: qrModule,
      },
      hass,
      config
    );

    const alignStyle =
      alignment === 'center'
        ? 'margin-left: auto; margin-right: auto;'
        : alignment === 'right'
          ? 'margin-left: auto; margin-right: 0;'
          : 'margin-left: 0; margin-right: auto;';

    const labelEl =
      showLabel && labelText
        ? html`
            <div
              class="qr-code-label"
              style="font-size: 14px; color: var(--primary-text-color); margin-top: ${labelBelow ? 8 : 0}px; margin-bottom: ${labelBelow ? 0 : 8}px; text-align: center;"
            >
              ${labelText}
            </div>
          `
        : '';

    const imgEl = html`
      <img
        src="${dataUrl}"
        alt="QR Code"
        width="${size}"
        height="${size}"
        style="display: block; ${alignStyle}"
      />
    `;

    const corsWarningEl = logoCorsError
      ? html`
          <div
            class="qr-cors-warning"
            style="display:flex;align-items:center;gap:6px;padding:6px 10px;margin-top:6px;background:rgba(var(--warning-color-int,255,152,0),0.15);border:1px solid var(--warning-color,#ff9800);border-radius:6px;font-size:12px;color:var(--primary-text-color);"
          >
            <ha-icon icon="mdi:alert-outline" style="--mdi-icon-size:16px;color:var(--warning-color,#ff9800);flex-shrink:0;"></ha-icon>
            <span>${localize('editor.qr_code.cors_error', hass?.locale?.language || 'en', 'Logo not loaded — the image server blocked cross-origin requests. Use a /local/ path or a CORS-enabled URL.')}</span>
          </div>
        `
      : '';

    return html`
      <div
        class="qr-code-module-preview"
        @pointerdown="${handlers.onPointerDown}"
        @pointerup="${handlers.onPointerUp}"
        @pointerleave="${handlers.onPointerLeave}"
        @pointercancel="${handlers.onPointerCancel}"
        style="cursor: ${qrModule.tap_action?.action !== 'nothing' ? 'pointer' : 'default'};"
      >
        ${labelBelow ? imgEl : labelEl}
        ${labelBelow ? labelEl : imgEl}
        ${corsWarningEl}
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const qr = module as QrCodeModule;
    const errors = [...base.errors];
    const mode = qr.content_mode || 'static';
    if (mode === 'static' && !(qr.content_static || '').trim()) {
      errors.push('Static content is required when source is Static');
    }
    if (mode === 'template' && !(qr.content_template || '').trim()) {
      errors.push('Template is required when source is Template');
    }
    if (mode === 'entity' && !(qr.content_entity || '').trim()) {
      errors.push('Entity is required when source is Entity');
    }
    const size = qr.size ?? 200;
    if (size < 64 || size > 512) {
      errors.push('Size must be between 64 and 512');
    }
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .qr-code-module-preview img {
        display: block;
      }
      .qr-code-loading .qr-code-spinner,
      .qr-code-loading ha-icon.qr-code-spinner {
        animation: qr-spin 1s linear infinite;
        display: inline-block;
      }
      @keyframes qr-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
  }
}
