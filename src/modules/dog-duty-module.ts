import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DogDutyModule, DogDutyPin, UltraCardConfig } from '../types';
import { getImageUrl } from '../utils/image-upload';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/safe-storage';

const PIN_STORAGE_PREFIX = 'ultra_card_dog_duty_pins_';

export class UltraDogDutyModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'dog_duty',
    title: 'Dog Duty',
    description: 'Tap a photo of your yard to drop pins where the dog did its business, then clear them all at once',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:dog-side',
    category: 'interactive',
    tags: ['dog', 'pet', 'duty', 'pins', 'yard', 'tracker', 'interactive'],
  };

  // ── createDefault ────────────────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): DogDutyModule {
    return {
      id: id || this.generateId('dog_duty'),
      type: 'dog_duty',
      image_type: 'upload',
      image_url: '',
      image_entity: '',
      pin_icon: 'mdi:paw',
      pin_color: '#e53935',
      pin_size: 28,
      tap_pin_to_remove: true,
      show_clear_button: true,
      clear_button_label: '',
      show_pin_count: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // ── Pin persistence (localStorage, keyed by module id) ──────────────────────

  private _loadPins(moduleId: string): DogDutyPin[] {
    try {
      const raw = safeGetItem(`${PIN_STORAGE_PREFIX}${moduleId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private _savePins(moduleId: string, pins: DogDutyPin[]): void {
    if (pins.length === 0) {
      safeRemoveItem(`${PIN_STORAGE_PREFIX}${moduleId}`);
    } else {
      safeSetItem(`${PIN_STORAGE_PREFIX}${moduleId}`, JSON.stringify(pins));
    }
  }

  // ── validate ─────────────────────────────────────────────────────────────────

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  // ── General tab ──────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as DogDutyModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- ── IMAGE SECTION ─────────────────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px; max-width: 100%; box-sizing: border-box;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color); letter-spacing: 0.5px;"
          >
            ${localize('editor.dog_duty.image_section', lang, 'Yard Image')}
          </div>
          ${this.renderSegmentedField(
            localize('editor.dog_duty.source_type', lang, 'Image Source'),
            localize(
              'editor.dog_duty.source_type_desc',
              lang,
              'Choose the screenshot or photo pins are placed on.'
            ),
            m.image_type || 'upload',
            [
              {
                value: 'upload',
                label: localize('editor.dog_duty.source_upload', lang, 'Upload'),
                icon: 'mdi:upload',
              },
              {
                value: 'url',
                label: localize('editor.dog_duty.source_url', lang, 'URL'),
                icon: 'mdi:link',
              },
              {
                value: 'entity',
                label: localize('editor.dog_duty.source_entity', lang, 'Entity'),
                icon: 'mdi:home-assistant',
              },
            ],
            next => {
              updateModule({ image_type: next as DogDutyModule['image_type'] });
              this.triggerPreviewUpdate();
            }
          )}
          ${m.image_type === 'upload'
            ? this.renderFileField(
                localize('editor.dog_duty.upload', lang, 'Upload Image'),
                localize(
                  'editor.dog_duty.upload_desc',
                  lang,
                  'Upload a screenshot or photo of your yard.'
                ),
                hass,
                m.image_url || '',
                (path: string) => {
                  updateModule({ image_url: path });
                  this.triggerPreviewUpdate();
                }
              )
            : ''}
          ${m.image_type === 'url'
            ? this.renderFieldSection(
                localize('editor.dog_duty.url', lang, 'Image URL'),
                localize('editor.dog_duty.url_desc', lang, 'Direct link to the image.'),
                hass,
                { image_url: m.image_url || '' },
                [{ name: 'image_url', selector: { text: {} } }],
                (e: CustomEvent) => {
                  updateModule({ image_url: e.detail.value?.image_url ?? '' });
                  this.triggerPreviewUpdate();
                }
              )
            : ''}
          ${m.image_type === 'entity'
            ? this.renderFieldSection(
                localize('editor.dog_duty.entity', lang, 'Image Entity'),
                localize(
                  'editor.dog_duty.entity_desc',
                  lang,
                  'Entity whose picture is used (e.g. a camera or image entity).'
                ),
                hass,
                { image_entity: m.image_entity || '' },
                [{ name: 'image_entity', selector: { entity: {} } }],
                (e: CustomEvent) => {
                  updateModule({ image_entity: e.detail.value?.image_entity ?? '' });
                  this.triggerPreviewUpdate();
                }
              )
            : ''}
        </div>

        <!-- ── PINS SECTION ──────────────────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px; max-width: 100%; box-sizing: border-box;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary-color); letter-spacing: 0.5px;"
          >
            ${localize('editor.dog_duty.pins_section', lang, 'Pins')}
          </div>
          ${this.renderIconField(
            localize('editor.dog_duty.pin_icon', lang, 'Pin icon'),
            localize('editor.dog_duty.pin_icon_desc', lang, 'Icon dropped where you tap.'),
            hass,
            m.pin_icon || 'mdi:paw',
            (next: string) => {
              updateModule({ pin_icon: next || 'mdi:paw' });
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderColorField(
            localize('editor.dog_duty.pin_color', lang, 'Pin color'),
            localize('editor.dog_duty.pin_color_desc', lang, 'Color of the dropped pins.'),
            hass,
            m.pin_color || '#e53935',
            '#e53935',
            (next: string) => {
              updateModule({ pin_color: next || '#e53935' });
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderSliderField(
            localize('editor.dog_duty.pin_size', lang, 'Pin size'),
            localize('editor.dog_duty.pin_size_desc', lang, 'Size of each pin.'),
            m.pin_size ?? 28,
            28,
            16,
            64,
            1,
            (v: number) => {
              updateModule({ pin_size: v });
              this.triggerPreviewUpdate();
            },
            'px'
          )}
          ${this.renderFieldSection(
            localize('editor.dog_duty.tap_pin_to_remove', lang, 'Tap a pin to remove it'),
            localize(
              'editor.dog_duty.tap_pin_to_remove_desc',
              lang,
              'Tapping an existing pin deletes just that pin.'
            ),
            hass,
            { tap_pin_to_remove: m.tap_pin_to_remove !== false },
            [this.booleanField('tap_pin_to_remove')],
            (e: CustomEvent) => {
              updateModule({ tap_pin_to_remove: e.detail.value?.tap_pin_to_remove ?? true });
              this.triggerPreviewUpdate();
            }
          )}
        </div>

        <!-- ── CONTROLS SECTION ──────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.dog_duty.controls_section', lang, 'Controls'),
          localize(
            'editor.dog_duty.controls_section_desc',
            lang,
            'Footer controls shown under the image.'
          ),
          [
            {
              title: localize('editor.dog_duty.show_pin_count', lang, 'Show pin count'),
              description: localize(
                'editor.dog_duty.show_pin_count_desc',
                lang,
                'Display how many pins are on the image.'
              ),
              hass,
              data: { show_pin_count: m.show_pin_count !== false },
              schema: [this.booleanField('show_pin_count')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_pin_count: e.detail.value?.show_pin_count ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.show_clear_button', lang, 'Show clear button'),
              description: localize(
                'editor.dog_duty.show_clear_button_desc',
                lang,
                'Button that removes every pin from the image.'
              ),
              hass,
              data: { show_clear_button: m.show_clear_button !== false },
              schema: [this.booleanField('show_clear_button')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_clear_button: e.detail.value?.show_clear_button ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.clear_button_label', lang, 'Clear button label'),
              description: localize(
                'editor.dog_duty.clear_button_label_desc',
                lang,
                'Leave blank for "Clear".'
              ),
              hass,
              data: { clear_button_label: m.clear_button_label || '' },
              schema: [{ name: 'clear_button_label', selector: { text: {} } }],
              onChange: (e: CustomEvent) => {
                updateModule({ clear_button_label: e.detail.value?.clear_button_label ?? '' });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
      </div>
    `;
  }

  // ── Preview ──────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as DogDutyModule;
    const lang = hass?.locale?.language || 'en';
    const imageUrl = this._resolveImageUrl(m, hass);

    if (!imageUrl) {
      return this.renderGradientErrorState(
        localize('editor.dog_duty.config_needed', lang, 'Add a yard image'),
        localize(
          'editor.dog_duty.config_needed_desc',
          lang,
          'Upload or link a screenshot in the General tab'
        ),
        'mdi:dog-side'
      );
    }

    const pins = this._loadPins(m.id);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const pinIcon = m.pin_icon || 'mdi:paw';
    const pinColor = m.pin_color || '#e53935';
    const pinSize = m.pin_size ?? 28;
    const tapPinToRemove = m.tap_pin_to_remove !== false;
    const showFooter = m.show_clear_button !== false || m.show_pin_count !== false;

    return html`
      <div class="uc-dog-duty ${hoverClass}" style="${designStyles}">
        ${this.wrapWithAnimation(
          html`
            <div
              class="uc-dog-duty__stage"
              @click=${(e: MouseEvent) => this._handleStageTap(e, m)}
            >
              <img
                class="uc-dog-duty__image"
                src="${imageUrl}"
                alt="${localize('editor.dog_duty.image_alt', lang, 'Dog duty yard image')}"
                draggable="false"
              />
              ${pins.map(
                pin => html`
                  <div
                    class="uc-dog-duty__pin ${tapPinToRemove ? 'uc-dog-duty__pin--removable' : ''}"
                    style="left: ${pin.x}%; top: ${pin.y}%; --uc-dog-duty-pin-size: ${pinSize}px; --uc-dog-duty-pin-color: ${pinColor};"
                    title="${new Date(pin.ts).toLocaleString()}"
                    @click=${(e: MouseEvent) => {
                      if (!tapPinToRemove) return;
                      e.stopPropagation();
                      this._removePin(m, pin.id);
                    }}
                  >
                    <ha-icon icon="${pinIcon}"></ha-icon>
                  </div>
                `
              )}
            </div>
            ${showFooter
              ? html`
                  <div class="uc-dog-duty__footer">
                    ${m.show_pin_count !== false
                      ? html`
                          <span class="uc-dog-duty__count">
                            ${pins.length === 1
                              ? localize('editor.dog_duty.one_pin', lang, '1 pin')
                              : `${pins.length} ${localize('editor.dog_duty.pins', lang, 'pins')}`}
                          </span>
                        `
                      : html`<span></span>`}
                    ${m.show_clear_button !== false
                      ? html`
                          <button
                            class="uc-dog-duty__clear"
                            ?disabled=${pins.length === 0}
                            @click=${(e: MouseEvent) => {
                              e.stopPropagation();
                              this._clearPins(m);
                            }}
                          >
                            <ha-icon icon="mdi:broom"></ha-icon>
                            ${m.clear_button_label?.trim() ||
                            localize('editor.dog_duty.clear', lang, 'Clear')}
                          </button>
                        `
                      : ''}
                  </div>
                `
              : ''}
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  // ── Runtime pin handling ─────────────────────────────────────────────────────

  private _handleStageTap(e: MouseEvent, m: DogDutyModule): void {
    const stage = e.currentTarget as HTMLElement;
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;

    const pins = this._loadPins(m.id);
    pins.push({
      id: `pin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      ts: Date.now(),
    });
    this._savePins(m.id, pins);
    this.triggerPreviewUpdate(true);
  }

  private _removePin(m: DogDutyModule, pinId: string): void {
    const pins = this._loadPins(m.id).filter(p => p.id !== pinId);
    this._savePins(m.id, pins);
    this.triggerPreviewUpdate(true);
  }

  private _clearPins(m: DogDutyModule): void {
    this._savePins(m.id, []);
    this.triggerPreviewUpdate(true);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private _resolveImageUrl(m: DogDutyModule, hass: HomeAssistant): string {
    switch (m.image_type) {
      case 'entity': {
        if (!m.image_entity) return '';
        const state = hass?.states?.[m.image_entity];
        const picture = state?.attributes?.entity_picture;
        return picture ? getImageUrl(hass, picture) : '';
      }
      case 'url':
      case 'upload':
      default:
        return m.image_url ? getImageUrl(hass, m.image_url) : '';
    }
  }

  // ── CSS ──────────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      .uc-dog-duty {
        box-sizing: border-box;
        border-radius: 12px;
        overflow: hidden;
      }

      .uc-dog-duty__stage {
        position: relative;
        display: block;
        width: 100%;
        line-height: 0;
        cursor: crosshair;
        -webkit-tap-highlight-color: transparent;
      }

      .uc-dog-duty__image {
        display: block;
        width: 100%;
        height: auto;
        user-select: none;
        -webkit-user-drag: none;
      }

      .uc-dog-duty__pin {
        position: absolute;
        transform: translate(-50%, -50%);
        line-height: normal;
        color: var(--uc-dog-duty-pin-color, #e53935);
        filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6));
        animation: uc-dog-duty-pin-drop 0.25s ease-out;
        z-index: 1;
      }

      .uc-dog-duty__pin ha-icon {
        --mdc-icon-size: var(--uc-dog-duty-pin-size, 28px);
        display: block;
      }

      .uc-dog-duty__pin--removable {
        cursor: pointer;
      }

      .uc-dog-duty__pin--removable:hover {
        transform: translate(-50%, -50%) scale(1.2);
      }

      @keyframes uc-dog-duty-pin-drop {
        from {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        to {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      }

      .uc-dog-duty__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 12px;
        background: var(--card-background-color);
      }

      .uc-dog-duty__count {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .uc-dog-duty__clear {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border: none;
        border-radius: 18px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .uc-dog-duty__clear:hover:not(:disabled) {
        opacity: 0.85;
      }

      .uc-dog-duty__clear:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .uc-dog-duty__clear ha-icon {
        --mdc-icon-size: 16px;
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
