import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, CoverModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';

// Home Assistant cover supported features (bitmask)
const COVER_SUPPORT_OPEN = 1;
const COVER_SUPPORT_CLOSE = 2;
const COVER_SUPPORT_SET_POSITION = 4;
const COVER_SUPPORT_STOP = 8;
const COVER_SUPPORT_OPEN_TILT = 16;
const COVER_SUPPORT_CLOSE_TILT = 32;
const COVER_SUPPORT_STOP_TILT = 64;
const COVER_SUPPORT_SET_TILT_POSITION = 128;

/**
 * Cover Module
 *
 * Control blinds, garage doors, shutters, and other cover entities.
 * Simple by default: one entity, open/close/stop and position.
 * Advanced: tilt, multiple entities, layout options.
 */
export class UltraCoverModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'cover',
    title: 'Cover Control',
    description: 'Control blinds, garage doors, and shutters',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:blinds',
    category: 'interactive',
    tags: ['cover', 'blinds', 'garage', 'shutters'],
  };

  createDefault(id?: string, hass?: HomeAssistant): CoverModule {
    return {
      id: id || this.generateId('cover'),
      type: 'cover',
      entity: '',
      name: '',
      icon: '',
      show_title: true,
      show_icon: true,
      show_state: true,
      show_position: true,
      show_stop: true,
      show_position_control: true,
      layout: 'standard',
      alignment: 'center',
      show_tilt: false,
      show_tilt_control: false,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const coverModule = module as CoverModule;

    if (!module.id) errors.push('Module ID is required');
    if (!module.type || module.type !== 'cover') errors.push('Module type must be cover');

    const hasEntity = !!(coverModule.entity && coverModule.entity.trim());
    const hasEntities =
      Array.isArray(coverModule.entities) && coverModule.entities.length > 0;
    if (!hasEntity && !hasEntities) {
      errors.push('Select at least one cover entity');
    }

    return { valid: errors.length === 0, errors };
  }

  private getLayoutOptions(lang: string): Array<{ value: CoverModule['layout']; label: string }> {
    return [
      { value: 'compact', label: localize('editor.cover.layout_compact', lang, 'Compact') },
      { value: 'standard', label: localize('editor.cover.layout_standard', lang, 'Standard') },
      { value: 'buttons', label: localize('editor.cover.layout_buttons', lang, 'Buttons') },
    ];
  }

  private getAlignmentOptions(lang: string): Array<{ value: 'left' | 'center' | 'right'; label: string }> {
    return [
      { value: 'left', label: localize('editor.cover.alignment_left', lang, 'Left') },
      { value: 'center', label: localize('editor.cover.alignment_center', lang, 'Center') },
      { value: 'right', label: localize('editor.cover.alignment_right', lang, 'Right') },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const coverModule = module as CoverModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity -->
        ${this.renderSettingsSection(
          localize('editor.cover.entity_section', lang, 'Entity'),
          localize('editor.cover.entity_desc', lang, 'Select the cover to control (blinds, garage, shutters).'),
          [
            {
              title: localize('editor.cover.entity', lang, 'Cover entity'),
              description: localize('editor.cover.entity_desc', lang, 'Select the cover to control.'),
              hass,
              data: { entity: coverModule.entity || '' },
              schema: [{ name: 'entity', selector: { entity: { domain: 'cover' } } }],
              onChange: (e: CustomEvent) => {
                updateModule({ entity: e.detail.value?.entity ?? '' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Display -->
        ${this.renderSettingsSection(
          localize('editor.cover.display_section', lang, 'Display'),
          localize('editor.cover.display_desc', lang, 'Choose what to show on the card.'),
          [
            {
              title: localize('editor.cover.show_title', lang, 'Show title'),
              description: localize('editor.cover.show_title_desc', lang, 'Display the cover name'),
              hass,
              data: { show_title: coverModule.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_title: e.detail.value?.show_title ?? true }),
            },
            {
              title: localize('editor.cover.show_icon', lang, 'Show icon'),
              description: localize('editor.cover.show_icon_desc', lang, 'Display the cover icon'),
              hass,
              data: { show_icon: coverModule.show_icon !== false },
              schema: [this.booleanField('show_icon')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_icon: e.detail.value?.show_icon ?? true }),
            },
            {
              title: localize('editor.cover.show_state', lang, 'Show state'),
              description: localize('editor.cover.show_state_desc', lang, 'Display open/closed/opening/closing'),
              hass,
              data: { show_state: coverModule.show_state !== false },
              schema: [this.booleanField('show_state')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_state: e.detail.value?.show_state ?? true }),
            },
            {
              title: localize('editor.cover.show_position', lang, 'Show position'),
              description: localize('editor.cover.show_position_desc', lang, 'Show position bar or percentage'),
              hass,
              data: { show_position: coverModule.show_position !== false },
              schema: [this.booleanField('show_position')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_position: e.detail.value?.show_position ?? true }),
            },
            {
              title: localize('editor.cover.show_position_control', lang, 'Show position slider'),
              description: localize('editor.cover.show_position_control_desc', lang, 'Allow setting position 0-100%'),
              hass,
              data: { show_position_control: coverModule.show_position_control !== false },
              schema: [this.booleanField('show_position_control')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_position_control: e.detail.value?.show_position_control ?? true }),
            },
            {
              title: localize('editor.cover.show_stop', lang, 'Show stop button'),
              description: localize('editor.cover.show_stop_desc', lang, 'Show stop button when supported'),
              hass,
              data: { show_stop: coverModule.show_stop !== false },
              schema: [this.booleanField('show_stop')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_stop: e.detail.value?.show_stop ?? true }),
            },
          ]
        )}

        <!-- Layout -->
        ${this.renderSettingsSection(
          localize('editor.cover.layout_section', lang, 'Layout'),
          localize('editor.cover.layout_desc', lang, 'How the controls are arranged.'),
          [
            {
              title: localize('editor.cover.layout', lang, 'Layout style'),
              description: localize('editor.cover.layout_style_desc', lang, 'Compact, standard, or buttons only'),
              hass,
              data: { layout: coverModule.layout || 'standard' },
              schema: [this.selectField('layout', this.getLayoutOptions(lang))],
              onChange: (e: CustomEvent) => {
                updateModule({ layout: e.detail.value?.layout || 'standard' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.cover.alignment', lang, 'Alignment'),
              description: localize('editor.cover.alignment_desc', lang, 'Align content left, center, or right'),
              hass,
              data: { alignment: coverModule.alignment || 'center' },
              schema: [this.selectField('alignment', this.getAlignmentOptions(lang))],
              onChange: (e: CustomEvent) => {
                updateModule({ alignment: e.detail.value?.alignment || 'center' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Advanced: Tilt & multi-cover -->
        <div class="settings-section" style="margin-top: 16px;">
          <div class="section-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
            ${localize('editor.cover.advanced_section', lang, 'Advanced')}
          </div>
          <div class="field-description" style="margin-bottom: 12px; color: var(--secondary-text-color);">
            ${localize('editor.cover.advanced_desc', lang, 'Tilt and multi-cover options.')}
          </div>
          ${this.renderFieldSection(
            localize('editor.cover.show_tilt', lang, 'Show tilt'),
            localize('editor.cover.show_tilt_desc', lang, 'Show tilt state and controls when supported'),
            hass,
            { show_tilt: coverModule.show_tilt ?? false },
            [this.booleanField('show_tilt')],
            (e: CustomEvent) => updateModule({ show_tilt: e.detail.value?.show_tilt ?? false })
          )}
          ${this.renderFieldSection(
            localize('editor.cover.show_tilt_control', lang, 'Show tilt slider'),
            localize('editor.cover.show_tilt_control_desc', lang, 'Allow setting tilt position when supported'),
            hass,
            { show_tilt_control: coverModule.show_tilt_control ?? false },
            [this.booleanField('show_tilt_control')],
            (e: CustomEvent) =>
              updateModule({ show_tilt_control: e.detail.value?.show_tilt_control ?? false })
          )}
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const coverModule = module as CoverModule;
    const entityId = this.resolveEntity(coverModule.entity, config) || coverModule.entity;
    const lang = hass?.locale?.language || 'en';

    if (!entityId || !hass?.states[entityId]) {
      return html`
        <div class="uc-cover-wrapper" style="border-radius: 12px; overflow: hidden;">
          ${this.renderGradientErrorState(
            localize('editor.cover.config_needed', lang, 'Select a cover'),
            localize('editor.cover.config_needed_desc', lang, 'Choose a cover entity in the General tab'),
            'mdi:blinds'
          )}
        </div>
      `;
    }

    const state = hass.states[entityId];
    const attrs = state.attributes || {};
    const supported = typeof attrs.supported_features === 'number' ? attrs.supported_features : 0;
    const hasPosition = (supported & COVER_SUPPORT_SET_POSITION) !== 0;
    const hasStop = (supported & COVER_SUPPORT_STOP) !== 0;
    const hasTilt =
      (supported & (COVER_SUPPORT_OPEN_TILT | COVER_SUPPORT_CLOSE_TILT | COVER_SUPPORT_SET_TILT_POSITION)) !== 0;

    const currentPosition =
      attrs.current_position !== undefined ? Number(attrs.current_position) : undefined;
    const currentTilt =
      attrs.current_tilt_position !== undefined ? Number(attrs.current_tilt_position) : undefined;
    const stateStr = String(state.state);

    const showTitle = coverModule.show_title !== false;
    const showIcon = coverModule.show_icon !== false;
    const showState = coverModule.show_state !== false;
    const showPosition = coverModule.show_position !== false && (hasPosition || currentPosition !== undefined);
    const showPositionControl = coverModule.show_position_control !== false && hasPosition;
    const showStop = coverModule.show_stop !== false && hasStop;
    const showTilt = coverModule.show_tilt !== false && hasTilt;
    const showTiltControl = coverModule.show_tilt_control !== false && hasTilt;
    const layout = coverModule.layout || 'standard';
    const alignment = coverModule.alignment || 'center';

    const name =
      coverModule.name?.trim() ||
      attrs.friendly_name ||
      entityId.split('.').pop()?.replace(/_/g, ' ') ||
      'Cover';
    const icon = coverModule.icon || attrs.icon || 'mdi:blinds';

    const openCover = () => {
      hass.callService('cover', 'open_cover', { entity_id: entityId });
    };
    const closeCover = () => {
      hass.callService('cover', 'close_cover', { entity_id: entityId });
    };
    const stopCover = () => {
      hass.callService('cover', 'stop_cover', { entity_id: entityId });
    };
    const setPosition = (position: number) => {
      hass.callService('cover', 'set_cover_position', {
        entity_id: entityId,
        position,
      });
    };
    const openTilt = () => {
      hass.callService('cover', 'open_cover_tilt', { entity_id: entityId });
    };
    const closeTilt = () => {
      hass.callService('cover', 'close_cover_tilt', { entity_id: entityId });
    };
    const setTiltPosition = (tiltPosition: number) => {
      hass.callService('cover', 'set_cover_tilt_position', {
        entity_id: entityId,
        tilt_position: tiltPosition,
      });
    };

    const isMoving = stateStr === 'opening' || stateStr === 'closing';
    const positionPercent =
      currentPosition !== undefined ? currentPosition : stateStr === 'open' ? 100 : 0;

    const stateLabel = (() => {
      switch (stateStr) {
        case 'open':
          return localize('editor.cover.state_open', lang, 'Open');
        case 'closed':
          return localize('editor.cover.state_closed', lang, 'Closed');
        case 'opening':
          return localize('editor.cover.state_opening', lang, 'Opening');
        case 'closing':
          return localize('editor.cover.state_closing', lang, 'Closing');
        default:
          return stateStr;
      }
    })();

    const alignClass =
      alignment === 'left'
        ? 'uc-cover-align-left'
        : alignment === 'right'
          ? 'uc-cover-align-right'
          : 'uc-cover-align-center';

    const content = (() => {
      if (layout === 'compact') {
        return html`
          <div class="uc-cover uc-cover-compact ${alignClass}" style="padding: 12px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            ${showIcon ? html`<ha-icon icon="${icon}" style="font-size: 28px; color: var(--primary-color);"></ha-icon>` : ''}
            <div style="flex: 1; min-width: 0;">
              ${showTitle ? html`<div style="font-weight: 600; font-size: 14px;">${name}</div>` : ''}
              ${showState ? html`<div style="font-size: 12px; color: var(--secondary-text-color);">${stateLabel}</div>` : ''}
              ${showPosition && (currentPosition !== undefined || hasPosition)
                ? html`<div style="font-size: 12px;">${positionPercent}%</div>`
                : ''}
            </div>
            <div style="display: flex; gap: 6px;">
              <ha-button dense @click=${openCover} ?disabled=${stateStr === 'open' || isMoving}>
                ${localize('editor.cover.open', lang, 'Open')}
              </ha-button>
              ${showStop ? html`<ha-button dense outlined @click=${stopCover} ?disabled=${!isMoving}>${localize('editor.cover.stop', lang, 'Stop')}</ha-button>` : ''}
              <ha-button dense @click=${closeCover} ?disabled=${stateStr === 'closed' || isMoving}>
                ${localize('editor.cover.close', lang, 'Close')}
              </ha-button>
            </div>
          </div>
        `;
      }

      if (layout === 'buttons') {
        return html`
          <div class="uc-cover uc-cover-buttons ${alignClass}" style="padding: 16px;">
            ${showTitle || showIcon
              ? html`
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; justify-content: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};">
                    ${showIcon ? html`<ha-icon icon="${icon}" style="font-size: 24px; color: var(--primary-color);"></ha-icon>` : ''}
                    ${showTitle ? html`<span style="font-weight: 600;">${name}</span>` : ''}
                  </div>
                `
              : ''}
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};">
              <ha-button @click=${openCover} ?disabled=${stateStr === 'open' || isMoving}>
                ${localize('editor.cover.open', lang, 'Open')}
              </ha-button>
              ${showStop ? html`<ha-button outlined @click=${stopCover} ?disabled=${!isMoving}>${localize('editor.cover.stop', lang, 'Stop')}</ha-button>` : ''}
              <ha-button @click=${closeCover} ?disabled=${stateStr === 'closed' || isMoving}>
                ${localize('editor.cover.close', lang, 'Close')}
              </ha-button>
            </div>
            ${showPositionControl && hasPosition
              ? html`
                  <div style="margin-top: 12px;">
                    <div style="font-size: 12px; margin-bottom: 4px; color: var(--secondary-text-color);">${localize('editor.cover.position', lang, 'Position')}</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      .value=${String(positionPercent)}
                      @input=${(e: Event) => setPosition(Number((e.target as HTMLInputElement).value))}
                      style="width: 100%;"
                    />
                  </div>
                `
              : ''}
            ${showTiltControl && hasTilt
              ? html`
                  <div style="margin-top: 12px;">
                    <div style="font-size: 12px; margin-bottom: 4px; color: var(--secondary-text-color);">${localize('editor.cover.tilt', lang, 'Tilt')}</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      .value=${String(currentTilt ?? 0)}
                      @input=${(e: Event) => setTiltPosition(Number((e.target as HTMLInputElement).value))}
                      style="width: 100%;"
                    />
                  </div>
                `
              : ''}
          </div>
        `;
      }

      // standard
      return html`
        <div class="uc-cover uc-cover-standard ${alignClass}" style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; justify-content: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};">
            ${showIcon ? html`<ha-icon icon="${icon}" style="font-size: 28px; color: var(--primary-color);"></ha-icon>` : ''}
            <div>
              ${showTitle ? html`<div style="font-weight: 600; font-size: 16px;">${name}</div>` : ''}
              ${showState ? html`<div style="font-size: 13px; color: var(--secondary-text-color);">${stateLabel}</div>` : ''}
            </div>
          </div>
          ${showPosition && (hasPosition || currentPosition !== undefined)
            ? html`
                <div style="margin-bottom: 12px;">
                  <div style="height: 8px; background: var(--divider-color); border-radius: 4px; overflow: hidden;">
                    <div
                      style="height: 100%; width: ${positionPercent}%; background: var(--primary-color); border-radius: 4px; transition: width 0.2s;"
                    ></div>
                  </div>
                  ${showPositionControl ? html`<div style="font-size: 12px; text-align: center; margin-top: 4px;">${positionPercent}%</div>` : ''}
                </div>
              `
            : ''}
          <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: ${alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center'};">
            <ha-button @click=${openCover} ?disabled=${stateStr === 'open' || isMoving}>
              ${localize('editor.cover.open', lang, 'Open')}
            </ha-button>
            ${showStop ? html`<ha-button outlined @click=${stopCover} ?disabled=${!isMoving}>${localize('editor.cover.stop', lang, 'Stop')}</ha-button>` : ''}
            <ha-button @click=${closeCover} ?disabled=${stateStr === 'closed' || isMoving}>
              ${localize('editor.cover.close', lang, 'Close')}
            </ha-button>
          </div>
          ${showPositionControl && hasPosition
            ? html`
                <div style="margin-top: 12px;">
                  <div style="font-size: 12px; margin-bottom: 4px; color: var(--secondary-text-color);">${localize('editor.cover.position', lang, 'Position')}</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    .value=${String(positionPercent)}
                    @input=${(e: Event) => setPosition(Number((e.target as HTMLInputElement).value))}
                    style="width: 100%;"
                  />
                </div>
              `
            : ''}
          ${showTilt && hasTilt
            ? html`
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color);">
                  <div style="font-size: 12px; margin-bottom: 6px; color: var(--secondary-text-color);">${localize('editor.cover.tilt', lang, 'Tilt')}</div>
                  ${showTiltControl
                    ? html`
                        <input
                          type="range"
                          min="0"
                          max="100"
                          .value=${String(currentTilt ?? 0)}
                          @input=${(e: Event) => setTiltPosition(Number((e.target as HTMLInputElement).value))}
                          style="width: 100%;"
                        />
                      `
                    : html`
                        <div style="display: flex; gap: 8px;">
                          <ha-button dense outlined @click=${openTilt}>${localize('editor.cover.open', lang, 'Open')}</ha-button>
                          <ha-button dense outlined @click=${closeTilt}>${localize('editor.cover.close', lang, 'Close')}</ha-button>
                        </div>
                      `}
                </div>
              `
            : ''}
        </div>
      `;
    })();

    const styles = this.buildDesignStyles(module, hass);
    const styleStr = Object.entries(styles)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
      .join('; ');
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <div class="uc-cover-wrapper ${hoverClass}" style="background: var(--card-background-color); border-radius: 12px; overflow: hidden; ${styleStr}">
        ${this.wrapWithAnimation(content, module, hass)}
      </div>
    `;
  }

  getStyles?(): string {
    return `
      .uc-cover-wrapper { box-sizing: border-box; }
      .uc-cover-align-left { text-align: left; }
      .uc-cover-align-center { text-align: center; }
      .uc-cover-align-right { text-align: right; }
      .uc-cover input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
      }
      .uc-cover input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
      }
      .uc-cover input[type="range"]::-moz-range-thumb {
        width: 18px;
        height: 18px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }
    `;
  }
}
