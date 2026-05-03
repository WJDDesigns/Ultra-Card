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
import {
  parseUnifiedTemplate,
  hasTemplateError,
  unifiedTemplateQrContent,
} from '../utils/template-parser';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { uploadImage, getImageUrl } from '../utils/image-upload';
import '../components/ultra-color-picker';
import '../components/ultra-template-editor';
import { ucToastService } from '../services/uc-toast-service';

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
 * Fetch a logo URL and store it as a base64 data URL so that
 * qr-code-styling can embed it in a canvas without CORS/auth issues.
 *
 * Strategy:
 *  - HA-internal paths (relative, /local/, /api/, or same-origin absolute): fetch with Bearer token.
 *  - External http(s) URLs pointing to a different host: plain CORS fetch (no token).
 *
 * Dispatches UC_QR_DATA_READY_EVENT when done (success or failure).
 */
function fetchLogoAsDataUrl(logoUrl: string, hass?: HomeAssistant): void {
  if (logoFetchingSet.has(logoUrl)) return;
  logoFetchingSet.add(logoUrl);

  // A URL is "external" only when it is an absolute http(s) URL pointing to a
  // different host than the current page (i.e. not our HA instance).
  const isExternalAbsolute =
    (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) &&
    !logoUrl.startsWith(`${window.location.protocol}//${window.location.host}`);

  const headers: Record<string, string> = {};
  if (!isExternalAbsolute && hass?.auth?.data?.access_token) {
    headers['Authorization'] = `Bearer ${hass.auth.data.access_token}`;
  }

  fetch(logoUrl, { mode: 'cors', headers })
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

function logoStatus(module: QrCodeModule, hass?: HomeAssistant): string {
  if (!module.logo_enabled) return 'nologo';
  const effectiveUrl = _getEffectiveLogoUrl(module, hass);
  if (!effectiveUrl) return 'nologo';
  const cached = logoDataUrlCache.get(effectiveUrl);
  if (cached === undefined) return 'logo:pending';
  if (cached === '') return 'logo:failed';
  return 'logo:loaded';
}

/**
 * Resolve the effective logo URL from the module config.
 * For 'url' and 'upload' modes the stored logo_url is used directly.
 * For 'entity' / 'attribute' modes we derive the URL from hass state.
 * Returns an empty string when the URL cannot be determined yet.
 */
function _getEffectiveLogoUrl(module: QrCodeModule, hass: HomeAssistant | undefined): string {
  if (!module.logo_enabled) return '';
  const sourceType = module.logo_image_type || 'url';
  if (sourceType === 'url' || sourceType === 'upload') {
    // Run through getImageUrl so /api/image/serve/ paths get /original appended
    // and local media paths are resolved to their /local/ equivalents.
    const raw = module.logo_url || '';
    if (!raw) return '';
    return hass ? getImageUrl(hass, raw) : raw;
  }
  if (!hass) return '';
  const entityId = module.logo_image_entity;
  if (!entityId || !hass.states[entityId]) return '';
  const stateObj = hass.states[entityId];
  if (sourceType === 'entity') {
    // Prefer entity_picture attribute, then fall back to state
    const ep = (stateObj.attributes as Record<string, unknown>)?.entity_picture;
    if (ep) return getImageUrl(hass, String(ep));
    if (stateObj.state) return getImageUrl(hass, stateObj.state);
    return '';
  }
  if (sourceType === 'attribute') {
    const attrPath = module.logo_image_attribute || '';
    if (!attrPath) return '';
    // Support dot-notation attribute paths (e.g. vehicle_data.image)
    const parts = attrPath.split('.');
    let val: unknown = stateObj.attributes;
    for (const part of parts) {
      if (val == null || typeof val !== 'object') { val = undefined; break; }
      val = (val as Record<string, unknown>)[part];
    }
    return val != null ? getImageUrl(hass, String(val)) : '';
  }
  return '';
}

function cacheKey(module: QrCodeModule, content: string, hass?: HomeAssistant): string {
  const size = module.size || 200;
  const fg = module.fg_color || '#000000';
  const bg = module.bg_color || '#ffffff';
  const ec = module.error_correction || 'M';
  const margin = module.qr_margin ?? 1;
  const dot = module.dot_style || 'square';
  const cSq = module.corner_square_style || 'square';
  const cDot = module.corner_dot_style || 'square';
  const effectiveUrl = _getEffectiveLogoUrl(module, hass);
  const logoSuffix = module.logo_enabled && effectiveUrl
    ? `${logoStatus(module, hass)}|${module.logo_size ?? 0.25}|${module.logo_margin ?? 4}|${module.logo_hide_bg_dots !== false}`
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
      unified_template_mode: false,
      unified_template: '',
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
      logo_image_type: 'url',
      logo_url: '',
      logo_image_entity: '',
      logo_image_attribute: '',
      logo_size: 0.25,
      logo_margin: 2,
      logo_hide_bg_dots: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as QrCodeModule, hass, updates =>
      updateModule(updates)
    );
  }

  override renderOtherTab(
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
      ${this.injectUcFormStyles()}

      <!-- Content source -->
      ${this.renderSettingsSection(
        localize('editor.qr_code.content_title', lang, 'Content'),
        localize('editor.qr_code.content_title_desc', lang, 'Configure the text or URL to encode.'),
        [
          {
            title: localize('editor.qr_code.content_mode', lang, 'Source'),
            description: localize('editor.qr_code.content_mode_desc', lang, 'Where to get the text to encode'),
            hass,
            data: { content_mode: qrModule.content_mode || 'static' },
            schema: [this.selectField('content_mode', [
              { value: 'static', label: localize('editor.qr_code.static', lang, 'Static URL / Text') },
              {
                value: 'unified',
                label: localize('editor.qr_code.unified_template', lang, 'Unified template'),
              },
              { value: 'entity', label: localize('editor.qr_code.entity', lang, 'Entity State') },
            ])],
            onChange: (e: CustomEvent) => {
              const mode = e.detail.value.content_mode as 'static' | 'entity' | 'unified';
              updateModule({
                content_mode: mode,
                unified_template_mode: mode === 'unified',
                ...(mode !== 'unified' ? { unified_template: '' } : {}),
              });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
          },
        ]
      )}
      ${qrModule.content_mode === 'static'
        ? this.renderFieldSection(
            localize('editor.qr_code.static_content', lang, 'URL or text'),
            localize('editor.qr_code.static_desc', lang, 'Text or URL to encode in the QR code'),
            hass,
            { content_static: qrModule.content_static || '' },
            [this.textField('content_static')],
            (e: CustomEvent) => { updateModule({ content_static: e.detail.value.content_static }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )
        : ''}
      ${qrModule.content_mode === 'unified' || qrModule.unified_template_mode
        ? html`
            <div>
              <div
                style="font-size: 13px; color: var(--secondary-text-color); margin: 8px 0 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;"
              >
                <span
                  >${localize(
                    'editor.qr_code.unified_template_desc',
                    lang,
                    'JSON with "qr_content" (URL or text to encode), or a plain Jinja string result.'
                  )}</span
                >
                <button
                  type="button"
                  class="help-btn"
                  style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:#fff;cursor:pointer;border-radius:50%;line-height:0;"
                  title="${localize('editor.qr_code.unified_cheatsheet', lang, 'Template cheatsheet')}"
                  @click=${(e: Event) => {
                    (e.currentTarget as HTMLElement).dispatchEvent(
                      new CustomEvent('uc-open-template-cheatsheet', {
                        bubbles: true,
                        composed: true,
                        detail: { module: 'qr' },
                      })
                    );
                  }}
                >
                  <ha-icon
                    icon="mdi:help-circle"
                    style="--mdc-icon-size:18px;width:18px;height:18px;color:#fff;"
                  ></ha-icon>
                </button>
              </div>
            <div
              style="margin-top: 12px;"
              @mousedown=${(e: Event) => {
                const t = e.target as HTMLElement;
                if (!t.closest('ultra-template-editor') && !t.closest('.cm-editor')) e.stopPropagation();
              }}
              @dragstart=${(e: Event) => e.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${hass}
                .value=${qrModule.unified_template || ''}
                .placeholder=${'{\n  "qr_content": "{{ states(\'sensor.door_lock\') }}"\n}'}
                .minHeight=${120}
                .maxHeight=${360}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ unified_template: e.detail.value });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              ></ultra-template-editor>
            </div>
            </div>
          `
        : ''}
      ${qrModule.content_mode === 'entity'
        ? html`
            ${this.renderEntityPickerWithVariables(
              hass, config, 'content_entity', qrModule.content_entity || '',
              (value: string) => { updateModule({ content_entity: value }); setTimeout(() => this.triggerPreviewUpdate(), 50); },
              undefined,
              localize('editor.qr_code.entity_picker', lang, 'Entity')
            )}
            <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
              ${localize('editor.qr_code.entity_picker_desc', lang, 'Select an entity whose state (or attribute) will be encoded into the QR code.')}
            </div>
            ${this.renderFieldSection(
              localize('editor.qr_code.attribute', lang, 'Attribute (optional)'),
              localize('editor.qr_code.attribute_desc', lang, 'Leave empty to use state; or e.g. friendly_name'),
              hass,
              { content_attribute: qrModule.content_attribute || '' },
              [this.textField('content_attribute')],
              (e: CustomEvent) => { updateModule({ content_attribute: e.detail.value.content_attribute || undefined }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          `
        : ''}

      <!-- Display -->
      ${this.renderSettingsSection(
        localize('editor.qr_code.display_title', lang, 'Display'),
        '',
        [
          {
            title: localize('editor.qr_code.alignment', lang, 'Alignment'),
            description: '',
            hass,
            data: { alignment: qrModule.alignment || 'center' },
            schema: [this.selectField('alignment', [
              { value: 'left', label: localize('editor.qr_code.align_left', lang, 'Left') },
              { value: 'center', label: localize('editor.qr_code.align_center', lang, 'Center') },
              { value: 'right', label: localize('editor.qr_code.align_right', lang, 'Right') },
            ])],
            onChange: (e: CustomEvent) => { updateModule({ alignment: e.detail.value.alignment as 'left' | 'center' | 'right' }); setTimeout(() => this.triggerPreviewUpdate(), 50); },
          },
          {
            title: localize('editor.qr_code.show_label', lang, 'Show label'),
            description: '',
            hass,
            data: { show_label: qrModule.show_label ?? false },
            schema: [this.booleanField('show_label')],
            onChange: (e: CustomEvent) => { updateModule({ show_label: e.detail.value.show_label }); setTimeout(() => this.triggerPreviewUpdate(), 50); },
          },
        ]
      )}
      ${this.renderSliderField(
        localize('editor.qr_code.size', lang, 'Size'),
        localize('editor.qr_code.size_desc', lang, 'Width and height in pixels'),
        qrModule.size ?? 200, 200, 64, 512, 8,
        (v: number) => { updateModule({ size: v }); setTimeout(() => this.triggerPreviewUpdate(), 50); }, 'px'
      )}
      ${qrModule.show_label
        ? html`
            ${this.renderFieldSection(
              localize('editor.qr_code.label_text', lang, 'Label text'),
              '',
              hass,
              { label_text: qrModule.label_text || '' },
              [this.textField('label_text')],
              (e: CustomEvent) => { updateModule({ label_text: e.detail.value.label_text }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
            ${this.renderFieldSection(
              localize('editor.qr_code.label_below', lang, 'Label below QR'),
              '',
              hass,
              { label_below: qrModule.label_below !== false },
              [this.booleanField('label_below')],
              (e: CustomEvent) => { updateModule({ label_below: e.detail.value.label_below }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          `
        : ''}

      <!-- Style -->
      ${this.renderSettingsSection(
        localize('editor.qr_code.style_title', lang, 'Style'),
        '',
        [
          {
            title: localize('editor.qr_code.dot_style', lang, 'Dot pattern'),
            description: localize('editor.qr_code.dot_style_desc', lang, 'Shape of each individual data module'),
            hass,
            data: { dot_style: qrModule.dot_style || 'square' },
            schema: [this.selectField('dot_style', [
              { value: 'square', label: localize('editor.qr_code.dot_square', lang, 'Square') },
              { value: 'dots', label: localize('editor.qr_code.dot_dots', lang, 'Dots') },
              { value: 'rounded', label: localize('editor.qr_code.dot_rounded', lang, 'Rounded') },
              { value: 'extra-rounded', label: localize('editor.qr_code.dot_extra_rounded', lang, 'Extra Rounded') },
              { value: 'classy', label: localize('editor.qr_code.dot_classy', lang, 'Classy') },
              { value: 'classy-rounded', label: localize('editor.qr_code.dot_classy_rounded', lang, 'Classy Rounded') },
            ])],
            onChange: (e: CustomEvent) => { updateModule({ dot_style: e.detail.value.dot_style as QrCodeModule['dot_style'] }); setTimeout(() => this.triggerPreviewUpdate(), 50); },
          },
          {
            title: localize('editor.qr_code.corner_square_style', lang, 'Corner squares'),
            description: localize('editor.qr_code.corner_square_desc', lang, 'Shape of the three large corner finder squares'),
            hass,
            data: { corner_square_style: qrModule.corner_square_style || 'square' },
            schema: [this.selectField('corner_square_style', [
              { value: 'square', label: localize('editor.qr_code.cs_square', lang, 'Square') },
              { value: 'dot', label: localize('editor.qr_code.cs_dot', lang, 'Dot') },
              { value: 'extra-rounded', label: localize('editor.qr_code.cs_extra_rounded', lang, 'Extra Rounded') },
            ])],
            onChange: (e: CustomEvent) => { updateModule({ corner_square_style: e.detail.value.corner_square_style as QrCodeModule['corner_square_style'] }); setTimeout(() => this.triggerPreviewUpdate(), 50); },
          },
          {
            title: localize('editor.qr_code.corner_dot_style', lang, 'Corner dots'),
            description: localize('editor.qr_code.corner_dot_desc', lang, 'Shape of the small inner dots inside each corner square'),
            hass,
            data: { corner_dot_style: qrModule.corner_dot_style || 'square' },
            schema: [this.selectField('corner_dot_style', [
              { value: 'square', label: localize('editor.qr_code.cd_square', lang, 'Square') },
              { value: 'dot', label: localize('editor.qr_code.cd_dot', lang, 'Dot') },
            ])],
            onChange: (e: CustomEvent) => { updateModule({ corner_dot_style: e.detail.value.corner_dot_style as QrCodeModule['corner_dot_style'] }); setTimeout(() => this.triggerPreviewUpdate(), 50); },
          },
        ]
      )}

      <!-- Logo -->
      ${this.renderSettingsSection(
        localize('editor.qr_code.logo_title', lang, 'Logo / Icon'),
        '',
        [
          {
            title: localize('editor.qr_code.logo_enabled', lang, 'Show logo in center'),
            description: '',
            hass,
            data: { logo_enabled: qrModule.logo_enabled ?? false },
            schema: [this.booleanField('logo_enabled')],
            onChange: (e: CustomEvent) => { updateModule({ logo_enabled: e.detail.value.logo_enabled }); setTimeout(() => this.triggerPreviewUpdate(), 50); },
          },
        ]
      )}
      ${qrModule.logo_enabled
        ? html`
            ${this.renderFieldSection(
              localize('editor.qr_code.logo_image_type', lang, 'Logo source'),
              localize('editor.qr_code.logo_image_type_desc', lang, 'Where to load the logo image from'),
              hass,
              { logo_image_type: qrModule.logo_image_type || 'url' },
              [this.selectField('logo_image_type', [
                { value: 'url',       label: localize('editor.qr_code.logo_source_url',       lang, 'Image URL') },
                { value: 'upload',    label: localize('editor.qr_code.logo_source_upload',    lang, 'Upload Image') },
                { value: 'entity',    label: localize('editor.qr_code.logo_source_entity',    lang, 'Entity Image') },
                { value: 'attribute', label: localize('editor.qr_code.logo_source_attribute', lang, 'Entity Attribute') },
              ])],
              (e: CustomEvent) => { updateModule({ logo_image_type: e.detail.value.logo_image_type as QrCodeModule['logo_image_type'] }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}

            ${(qrModule.logo_image_type || 'url') === 'url'
              ? html`
                  ${this.renderFieldSection(
                    localize('editor.qr_code.logo_url', lang, 'Logo image URL'),
                    localize('editor.qr_code.logo_url_desc', lang, 'Direct URL to a PNG, JPG, or SVG image. Use /local/ paths for best results.'),
                    hass,
                    { logo_url: qrModule.logo_url || '' },
                    [this.textField('logo_url')],
                    (e: CustomEvent) => {
                      const v = e.detail.value.logo_url;
                      if (v !== qrModule.logo_url) {
                        logoDataUrlCache.delete(qrModule.logo_url || '');
                        logoDataUrlCache.delete(v);
                        for (const k of [...qrDataUrlCache.keys()]) {
                          if (k.includes('logo:')) qrDataUrlCache.delete(k);
                        }
                      }
                      updateModule({ logo_url: v });
                    }
                  )}
                  ${qrModule.logo_url && logoDataUrlCache.get(qrModule.logo_url) === ''
                    ? html`
                        <div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;margin-bottom:12px;background:rgba(var(--warning-color-int,255,152,0),0.12);border:1px solid var(--warning-color,#ff9800);border-radius:8px;font-size:13px;">
                          <ha-icon icon="mdi:alert-outline" style="--mdi-icon-size:18px;color:var(--warning-color,#ff9800);flex-shrink:0;margin-top:1px;"></ha-icon>
                          <div>
                            <strong>${localize('editor.qr_code.cors_title', lang, 'Image blocked by CORS')}</strong><br/>
                            <span style="color:var(--secondary-text-color);">${localize('editor.qr_code.cors_hint', lang, 'Copy the image to /config/www/ and use /local/your-image.png instead.')}</span>
                          </div>
                        </div>
                      `
                    : ''}
                `
              : ''}

            ${(qrModule.logo_image_type || 'url') === 'upload'
              ? html`
                  <div class="field-title">${localize('editor.qr_code.logo_upload_label', lang, 'Upload logo image')}</div>
                  <div class="field-description">${localize('editor.qr_code.logo_upload_desc', lang, 'Click to upload a PNG, JPG, or SVG from your device.')}</div>
                  <input
                    type="file"
                    accept="image/*"
                    style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); margin-bottom: 16px;"
                    @change=${(e: Event) => this._handleLogoFileUpload(e, updateModule, hass)}
                  />
                  ${qrModule.logo_url ? html`<div style="font-size:12px;color:var(--secondary-text-color);"><ha-icon icon="mdi:check-circle" style="--mdi-icon-size:14px;color:var(--success-color,#4caf50);"></ha-icon> ${localize('editor.qr_code.logo_uploaded', lang, 'Uploaded')}: <code>${qrModule.logo_url}</code></div>` : ''}
                `
              : ''}

            ${(qrModule.logo_image_type || 'url') === 'entity'
              ? this.renderEntityPickerWithVariables(
                  hass, config, 'logo_image_entity', qrModule.logo_image_entity || '',
                  (value: string) => {
                    if (value !== qrModule.logo_image_entity) logoDataUrlCache.delete(qrModule.logo_url || '');
                    updateModule({ logo_image_entity: value });
                  },
                  undefined,
                  localize('editor.qr_code.logo_entity', lang, 'Entity')
                )
              : ''}

            ${(qrModule.logo_image_type || 'url') === 'attribute'
              ? html`
                  ${this.renderEntityPickerWithVariables(
                    hass, config, 'logo_image_entity', qrModule.logo_image_entity || '',
                    (value: string) => {
                      if (value !== qrModule.logo_image_entity) logoDataUrlCache.delete(qrModule.logo_url || '');
                      updateModule({ logo_image_entity: value });
                    },
                    undefined,
                    localize('editor.qr_code.logo_entity', lang, 'Entity')
                  )}
                  ${this.renderFieldSection(
                    localize('editor.qr_code.logo_attribute', lang, 'Attribute name'),
                    localize('editor.qr_code.logo_attribute_desc', lang, 'Attribute path containing the image URL (dot notation supported).'),
                    hass,
                    { logo_image_attribute: qrModule.logo_image_attribute || '' },
                    [this.textField('logo_image_attribute')],
                    (e: CustomEvent) => {
                      logoDataUrlCache.delete(qrModule.logo_url || '');
                      updateModule({ logo_image_attribute: e.detail.value.logo_image_attribute || undefined });
                    }
                  )}
                `
              : ''}

            ${this.renderSliderField(
              localize('editor.qr_code.logo_size', lang, 'Logo size'),
              localize('editor.qr_code.logo_size_desc', lang, 'Logo as a fraction of the QR code area (10–30%).'),
              Math.round((qrModule.logo_size ?? 0.25) * 100), 25, 10, 30, 5,
              (v: number) => { updateModule({ logo_size: v / 100 }); setTimeout(() => this.triggerPreviewUpdate(), 50); }, '%'
            )}
            ${this.renderSliderField(
              localize('editor.qr_code.logo_margin', lang, 'Logo margin'),
              localize('editor.qr_code.logo_margin_desc', lang, 'Padding around the logo in pixels.'),
              qrModule.logo_margin ?? 2, 2, 0, 8, 1,
              (v: number) => { updateModule({ logo_margin: v }); setTimeout(() => this.triggerPreviewUpdate(), 50); }, 'px'
            )}
            ${(qrModule.error_correction || 'M') !== 'H'
              ? html`
                  <div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;margin-bottom:12px;background:rgba(var(--info-color-int,33,150,243),0.1);border:1px solid var(--info-color,#2196f3);border-radius:8px;font-size:13px;">
                    <ha-icon icon="mdi:information-outline" style="--mdi-icon-size:18px;color:var(--info-color,#2196f3);flex-shrink:0;margin-top:1px;"></ha-icon>
                    <div>
                      <strong>${localize('editor.qr_code.logo_ec_tip_title', lang, 'Tip: use H error correction')}</strong><br/>
                      <span style="color:var(--secondary-text-color);">${localize('editor.qr_code.logo_ec_tip', lang, 'Set error correction to H (30%) in the Advanced section for the best logo clarity.')}</span>
                    </div>
                  </div>
                `
              : ''}
            ${this.renderFieldSection(
              localize('editor.qr_code.logo_hide_bg_dots', lang, 'Hide dots behind logo'),
              '',
              hass,
              { logo_hide_bg_dots: qrModule.logo_hide_bg_dots !== false },
              [this.booleanField('logo_hide_bg_dots')],
              (e: CustomEvent) => { updateModule({ logo_hide_bg_dots: e.detail.value.logo_hide_bg_dots }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
            )}
          `
        : ''}

      <!-- Advanced -->
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;">
        <div class="section-title">${localize('editor.qr_code.advanced_title', lang, 'Advanced')}</div>
        <div class="field-title" style="margin-top: 8px;">${localize('editor.qr_code.fg_color', lang, 'Foreground color')}</div>
        <ultra-color-picker
          .label="${''}"
          .value="${qrModule.fg_color || '#000000'}"
          .defaultValue="${'#000000'}"
          .hass="${hass}"
          @value-changed="${(e: CustomEvent) => { updateModule({ fg_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}"
        ></ultra-color-picker>
        <div class="field-title" style="margin-top: 16px;">${localize('editor.qr_code.bg_color', lang, 'Background color')}</div>
        <ultra-color-picker
          .label="${''}"
          .value="${qrModule.bg_color || '#ffffff'}"
          .defaultValue="${'#ffffff'}"
          .hass="${hass}"
          @value-changed="${(e: CustomEvent) => { updateModule({ bg_color: e.detail.value }); setTimeout(() => this.triggerPreviewUpdate(), 50); }}"
        ></ultra-color-picker>
        ${this.renderFieldSection(
          localize('editor.qr_code.error_correction', lang, 'Error correction'),
          localize('editor.qr_code.error_correction_desc', lang, 'Higher = more damage tolerance, larger code'),
          hass,
          { error_correction: qrModule.error_correction || 'M' },
          [this.selectField('error_correction', [
            { value: 'L', label: 'L (7%)' },
            { value: 'M', label: 'M (15%)' },
            { value: 'Q', label: 'Q (25%)' },
            { value: 'H', label: 'H (30%)' },
          ])],
          (e: CustomEvent) => { updateModule({ error_correction: e.detail.value.error_correction as 'L' | 'M' | 'Q' | 'H' }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
        )}
        ${this.renderSliderField(
          localize('editor.qr_code.quiet_zone', lang, 'Quiet zone (margin)'),
          localize('editor.qr_code.quiet_zone_desc', lang, 'Modules around the QR code (0–10)'),
          qrModule.qr_margin ?? 1, 1, 0, 10, 1,
          (v: number) => { updateModule({ qr_margin: v }); setTimeout(() => this.triggerPreviewUpdate(), 50); }
        )}
      </div>
    `;
  }

  private _hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
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
    const legacyTemplate =
      (module as any).content_mode === 'template' && (module as any).content_template;
    const unifiedOn =
      module.unified_template_mode === true ||
      module.content_mode === 'unified' ||
      !!legacyTemplate;
    const templateSource = legacyTemplate
      ? String((module as any).content_template)
      : (module.unified_template || '').trim();

    if (unifiedOn && templateSource && hass) {
      const processed = preprocessTemplateVariables(templateSource, hass, config);
      const templateHash = this._hashString(processed);
      const key = `qr_unified_${module.id}_${templateHash}`;
      const cached = (hass as any).__uvc_template_strings?.[key];
      if (cached != null) {
        const parsed = parseUnifiedTemplate(String(cached));
        if (!hasTemplateError(parsed)) {
          const q = unifiedTemplateQrContent(parsed);
          if (q) return q.trim();
        }
      }
      try {
        const svc = new TemplateService(hass);
        svc.subscribeToTemplate(processed, key, () => {
          window.dispatchEvent(new CustomEvent(UC_QR_DATA_READY_EVENT));
        }, {}, config);
      } catch (_) {
        // ignore
      }
      return '';
    }

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
    return '';
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const qrModule = module as QrCodeModule;
    const legacyTpl =
      (qrModule as any).content_mode === 'template' && (qrModule as any).content_template;
    const unifiedPending =
      (qrModule.unified_template_mode ||
        qrModule.content_mode === 'unified' ||
        !!legacyTpl) &&
      String(legacyTpl || qrModule.unified_template || '').trim().length > 0;
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
    // Resolve the effective logo URL (handles url/upload/entity/attribute modes),
    // then pre-fetch it as a data URL so qr-code-styling can embed it without CORS issues.
    let resolvedLogoDataUrl: string | undefined;
    let logoCorsError = false;
    const effectiveLogoUrl = _getEffectiveLogoUrl(qrModule, hass);
    if (qrModule.logo_enabled && effectiveLogoUrl) {
      const cached = logoDataUrlCache.get(effectiveLogoUrl);
      if (cached === undefined) {
        // Not yet fetched - kick off fetch and render without logo for now
        fetchLogoAsDataUrl(effectiveLogoUrl, hass);
      } else if (cached === '') {
        // Fetch failed (CORS or network error)
        logoCorsError = true;
      } else {
        resolvedLogoDataUrl = cached;
      }
    }
    // --- End logo resolution ---

    const key = cacheKey(qrModule, content, hass);
    const dataUrl = qrDataUrlCache.get(key);

    if (!content && !unifiedPending) {
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
        ...(resolvedLogoDataUrl ? { image: resolvedLogoDataUrl } : {}),
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

    // Only show the CORS warning for external-URL source mode where the user can actually fix it.
    const isExternalUrl =
      (qrModule.logo_image_type || 'url') === 'url' &&
      (qrModule.logo_url || '').startsWith('http') &&
      !qrModule.logo_url!.startsWith(`${window.location.protocol}//${window.location.host}`);

    const corsWarningEl = logoCorsError && isExternalUrl
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

    const hoverClass = this.getHoverEffectClass(module);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    return this.wrapWithAnimation(html`
      <div
        class="qr-code-module-preview ${hoverClass}"
        @pointerdown="${handlers.onPointerDown}"
        @pointermove="${handlers.onPointerMove}"
        @pointerup="${handlers.onPointerUp}"
        @pointerleave="${handlers.onPointerLeave}"
        @pointercancel="${handlers.onPointerCancel}"
        style="${designStyles}; cursor: ${qrModule.tap_action?.action !== 'nothing' ? 'pointer' : 'default'};"
      >
        ${labelBelow ? imgEl : labelEl}
        ${labelBelow ? labelEl : imgEl}
        ${corsWarningEl}
      </div>
    `, module, hass);
  }

  private async _handleLogoFileUpload(
    event: Event,
    updateModule: (updates: Partial<QrCodeModule>) => void,
    hass: HomeAssistant
  ): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    try {
      const imagePath = await uploadImage(hass, file);
      // Clear stale logo cache entries (both raw path and resolved URL)
      logoDataUrlCache.delete(imagePath);
      logoDataUrlCache.delete(getImageUrl(hass, imagePath));
      // Also bust any pending QR caches
      for (const k of [...qrDataUrlCache.keys()]) {
        if (k.includes('logo:')) qrDataUrlCache.delete(k);
      }
      updateModule({ logo_url: imagePath, logo_image_type: 'upload' });
    } catch (error) {
      console.error('Error uploading logo file:', error);
      ucToastService.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const qr = module as QrCodeModule;
    const errors = [...base.errors];
    const mode = qr.content_mode || 'static';
    if (mode === 'static' && !(qr.content_static || '').trim()) {
      errors.push('Static content is required when source is Static');
    }
    if (
      (mode === 'unified' || qr.unified_template_mode) &&
      !(String(qr.unified_template || '').trim())
    ) {
      errors.push('Unified template is required when source is Unified template');
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
      ${BaseUltraModule.getSliderStyles()}
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
