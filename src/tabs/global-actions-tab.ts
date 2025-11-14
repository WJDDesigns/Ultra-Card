import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fireEvent } from 'custom-card-helpers';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule, HoverEffectConfig, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { UcFormUtils } from '../utils/uc-form-utils';
import '../components/ultra-color-picker';

@customElement('ultra-global-actions-tab')
export class GlobalActionsTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public module!: CardModule;
  @property({ attribute: false }) public tabTitle?: string;

  @state() private _config: any = {};

  /**
   * Check if a module has an entity (directly or through nested structures)
   */
  private _moduleHasEntity(module: CardModule): boolean {
    // Check for direct entity field
    if ((module as any).entity && typeof (module as any).entity === 'string') {
      return true;
    }

    // Special handling for icon modules - check first icon's entity
    if (module.type === 'icon') {
      const iconModule = module as any;
      if (iconModule.icons && iconModule.icons.length > 0 && iconModule.icons[0].entity) {
        return true;
      }
    }

    // Special handling for info modules - check first info entity's entity
    if (module.type === 'info') {
      const infoModule = module as any;
      if (
        infoModule.info_entities &&
        infoModule.info_entities.length > 0 &&
        infoModule.info_entities[0].entity
      ) {
        return true;
      }
    }

    // Check for graphs module entities array
    if (module.type === 'graphs') {
      const graphsModule = module as any;
      if (graphsModule.entities && Array.isArray(graphsModule.entities) && graphsModule.entities.length > 0) {
        return true;
      }
    }

    // Check for bar module entity
    if (module.type === 'bar' && (module as any).entity) {
      return true;
    }

    // Check for camera module entity
    if (module.type === 'camera' && (module as any).entity) {
      return true;
    }

    // Check for light module entity
    if (module.type === 'light' && (module as any).entity) {
      return true;
    }

    // Check for climate module entity
    if (module.type === 'climate' && (module as any).entity) {
      return true;
    }

    // Check for slider module entity
    if (module.type === 'slider' && (module as any).entity) {
      return true;
    }

    // Check for button module entity
    if (module.type === 'button' && (module as any).entity) {
      return true;
    }

    // Check for image module entity
    if (module.type === 'image' && (module as any).entity) {
      return true;
    }

    // Check for map module entity
    if (module.type === 'map' && (module as any).entity) {
      return true;
    }

    // Check for spinbox module entity (optional but still counts)
    if (module.type === 'spinbox' && (module as any).entity) {
      return true;
    }

    return false;
  }

  protected willUpdate(changedProps: PropertyValues) {
    if (changedProps.has('module')) {
      // Sync internal state when module changes
      this._config = {
        tap_action: (this.module as any).tap_action,
        hold_action: (this.module as any).hold_action,
        double_tap_action: (this.module as any).double_tap_action,
      };
    }
  }

  private _processAction(action: any): any {
      if (!action) return action;

      // Get the appropriate entity for this module
      let moduleEntity: string | undefined = (this.module as any).entity;

      // Special handling for icon modules - use first icon's entity
      if (!moduleEntity && this.module.type === 'icon') {
        const iconModule = this.module as any;
        if (iconModule.icons && iconModule.icons.length > 0 && iconModule.icons[0].entity) {
          moduleEntity = iconModule.icons[0].entity;
        }
      }

      // Special handling for info modules - use first info entity's entity
      if (!moduleEntity && this.module.type === 'info') {
        const infoModule = this.module as any;
        if (
          infoModule.info_entities &&
          infoModule.info_entities.length > 0 &&
          infoModule.info_entities[0].entity
        ) {
          moduleEntity = infoModule.info_entities[0].entity;
        }
      }

      // If it's more-info without an entity, add the module's entity
      if (action.action === 'more-info' && !action.entity && moduleEntity) {
        return { ...action, entity: moduleEntity };
      }

      // If it's toggle without an entity, add the module's entity
      if (action.action === 'toggle' && !action.entity && !action.target && moduleEntity) {
        return { ...action, entity: moduleEntity };
      }

      return action;
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();

    // Direct passthrough like Mushroom - update internal state
    this._config = { ...ev.detail.value };
    
    // Trigger update to show/hide entity selectors
    this.requestUpdate();

    // Process actions to add module entity if needed
    const processAction = (action: any) => this._processAction(action);

    // Fire event for parent to handle
    this.dispatchEvent(
      new CustomEvent('module-changed', {
        detail: {
          updates: {
            tap_action: processAction(ev.detail.value.tap_action),
            hold_action: processAction(ev.detail.value.hold_action),
            double_tap_action: processAction(ev.detail.value.double_tap_action),
          },
        },
        bubbles: true,
        composed: true,
      })
    );

    // Trigger preview update
    this._triggerPreviewUpdate();
  }

  private _triggerPreviewUpdate(): void {
    // Dispatch custom event to update any live previews
    if (!window._ultraCardUpdateTimer) {
      window._ultraCardUpdateTimer = setTimeout(() => {
        const event = new CustomEvent('ultra-card-template-update', {
          bubbles: true,
          composed: true,
        });
        window.dispatchEvent(event);
        window._ultraCardUpdateTimer = null;
      }, 50);
    }
  }

  protected render() {
    if (!this.hass || !this.module) {
      return html``;
    }

    const lang = this.hass.locale?.language || 'en';
    const localizedTitle =
      this.tabTitle || localize('editor.actions.title', lang, 'Actions Configuration');

    const moduleHasEntity = this._moduleHasEntity(this.module);
    const tapAction = this._config.tap_action || {};
    const holdAction = this._config.hold_action || {};
    const doubleTapAction = this._config.double_tap_action || {};

    return html`
      <div class="actions-section">
        <div class="section-header">
          <h4>
            <ha-icon icon="mdi:gesture-tap"></ha-icon>
            ${localizedTitle}
          </h4>
          <p>
            ${localize(
              'editor.actions.description',
              lang,
              "Configure how this module responds to user interactions. Uses Home Assistant's native action system for consistent behavior across your dashboard."
            )}
          </p>
        </div>

        <!-- Tap Action -->
        <div style="margin-bottom: 24px;">
          <ha-form
            .hass=${this.hass}
            .data=${{ tap_action: tapAction }}
            .schema=${[
              {
                name: 'tap_action',
                selector: { ui_action: {} },
              },
            ]}
            .computeLabel=${(schema: any) =>
              this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`)}
            @value-changed=${(e: CustomEvent) => {
              const newAction = e.detail.value.tap_action;
              this._config = { ...this._config, tap_action: newAction };
              this.requestUpdate();
              // Fire event for parent to handle
              this.dispatchEvent(
                new CustomEvent('module-changed', {
                  detail: {
                    updates: {
                      tap_action: this._processAction(newAction),
                    },
                  },
                  bubbles: true,
                  composed: true,
                })
              );
              this._triggerPreviewUpdate();
            }}
          ></ha-form>
          ${this._renderEntitySelectors('tap_action', tapAction, moduleHasEntity, lang)}
        </div>

        <!-- Hold Action -->
        <div style="margin-bottom: 24px;">
          <ha-form
            .hass=${this.hass}
            .data=${{ hold_action: holdAction }}
            .schema=${[
              {
                name: 'hold_action',
                selector: { ui_action: {} },
              },
            ]}
            .computeLabel=${(schema: any) =>
              this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`)}
            @value-changed=${(e: CustomEvent) => {
              const newAction = e.detail.value.hold_action;
              this._config = { ...this._config, hold_action: newAction };
              this.requestUpdate();
              // Fire event for parent to handle
              this.dispatchEvent(
                new CustomEvent('module-changed', {
                  detail: {
                    updates: {
                      hold_action: this._processAction(newAction),
                    },
                  },
                  bubbles: true,
                  composed: true,
                })
              );
              this._triggerPreviewUpdate();
            }}
          ></ha-form>
          ${this._renderEntitySelectors('hold_action', holdAction, moduleHasEntity, lang)}
        </div>

        <!-- Double Tap Action -->
        <div style="margin-bottom: 24px;">
          <ha-form
            .hass=${this.hass}
            .data=${{ double_tap_action: doubleTapAction }}
            .schema=${[
              {
                name: 'double_tap_action',
                selector: { ui_action: {} },
              },
            ]}
            .computeLabel=${(schema: any) =>
              this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`)}
            @value-changed=${(e: CustomEvent) => {
              const newAction = e.detail.value.double_tap_action;
              this._config = { ...this._config, double_tap_action: newAction };
              this.requestUpdate();
              // Fire event for parent to handle
              this.dispatchEvent(
                new CustomEvent('module-changed', {
                  detail: {
                    updates: {
                      double_tap_action: this._processAction(newAction),
                    },
                  },
                  bubbles: true,
                  composed: true,
                })
              );
              this._triggerPreviewUpdate();
            }}
          ></ha-form>
          ${this._renderEntitySelectors('double_tap_action', doubleTapAction, moduleHasEntity, lang)}
        </div>
      </div>

      <!-- Hover Effects Section -->
      ${this._renderHoverEffectsSection()}
    `;
  }

  private _renderEntitySelectors(
    actionType: 'tap_action' | 'hold_action' | 'double_tap_action',
    action: any,
    moduleHasEntity: boolean,
    lang: string
  ): TemplateResult {
    if (moduleHasEntity) {
      return html``;
    }

    const actionLabel =
      actionType === 'tap_action'
        ? localize('editor.actions.tap_action', lang, 'Tap Action')
        : actionType === 'hold_action'
          ? localize('editor.actions.hold_action', lang, 'Hold Action')
          : localize('editor.actions.double_tap_action', lang, 'Double Tap Action');

    return html`
      ${action?.action === 'more-info'
        ? html`
            <div
              class="conditional-fields-group"
              style="margin-top: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0; overflow: hidden;"
            >
              <div
                class="conditional-fields-header"
                style="background: rgba(var(--rgb-primary-color), 0.15); padding: 12px 16px; font-size: 14px; font-weight: 600; color: var(--primary-color); border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2); text-transform: uppercase; letter-spacing: 0.5px;"
              >
                ${actionLabel} - More Info Configuration
              </div>
              <div class="conditional-fields-content" style="padding: 16px;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  Entity
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  Select which entity to show more information for
                </div>
                <ha-form
                  .hass=${this.hass}
                  .data=${{ entity: action.entity || '' }}
                  .schema=${[
                    {
                      name: 'entity',
                      label: 'Entity',
                      selector: { entity: {} },
                    },
                  ]}
                  @value-changed=${(e: CustomEvent) => {
                    const entity = e.detail.value?.entity;
                    const updatedAction = { ...action, entity };
                    this._config = { ...this._config, [actionType]: updatedAction };
                    this.requestUpdate();
                    this.dispatchEvent(
                      new CustomEvent('module-changed', {
                        detail: { updates: { [actionType]: updatedAction } },
                        bubbles: true,
                        composed: true,
                      })
                    );
                  }}
                ></ha-form>
              </div>
            </div>
          `
        : ''}
      ${action?.action === 'toggle'
        ? html`
            <div
              class="conditional-fields-group"
              style="margin-top: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0; overflow: hidden;"
            >
              <div
                class="conditional-fields-header"
                style="background: rgba(var(--rgb-primary-color), 0.15); padding: 12px 16px; font-size: 14px; font-weight: 600; color: var(--primary-color); border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2); text-transform: uppercase; letter-spacing: 0.5px;"
              >
                ${actionLabel} - Toggle Configuration
              </div>
              <div class="conditional-fields-content" style="padding: 16px;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  Entity
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  Select which entity to toggle on/off
                </div>
                <ha-form
                  .hass=${this.hass}
                  .data=${{ entity: action.entity || '' }}
                  .schema=${[
                    {
                      name: 'entity',
                      label: 'Entity',
                      selector: { entity: {} },
                    },
                  ]}
                  @value-changed=${(e: CustomEvent) => {
                    const entity = e.detail.value?.entity;
                    const updatedAction = { ...action, entity };
                    this._config = { ...this._config, [actionType]: updatedAction };
                    this.requestUpdate();
                    this.dispatchEvent(
                      new CustomEvent('module-changed', {
                        detail: { updates: { [actionType]: updatedAction } },
                        bubbles: true,
                        composed: true,
                      })
                    );
                  }}
                ></ha-form>
              </div>
            </div>
          `
        : ''}
    `;
  }

  private _renderHoverEffectsSection() {
    // Get the current design properties
    const design = (this.module as any).design || {};
    const hoverEffect = design.hover_effect || { effect: 'none' };

    const updateHoverEffect = (updates: Partial<HoverEffectConfig>) => {
      const newHoverEffect = { ...hoverEffect, ...updates };

      // Clean up undefined/empty values
      Object.keys(newHoverEffect).forEach(key => {
        const val = (newHoverEffect as any)[key];
        if (val === '' || val === undefined || val === null) {
          delete (newHoverEffect as any)[key];
        }
      });

      // If effect is 'none', clear all hover effect properties
      let updatedDesign;
      if (newHoverEffect.effect === 'none') {
        updatedDesign = { ...design };
        delete updatedDesign.hover_effect;
      } else {
        updatedDesign = { ...design, hover_effect: newHoverEffect };
      }

      // Fire event for parent to handle
      this.dispatchEvent(
        new CustomEvent('module-changed', {
          detail: {
            updates: { design: updatedDesign },
          },
          bubbles: true,
          composed: true,
        })
      );
    };

    const lang = this.hass?.locale?.language || 'en';

    // Effect options based on Hover.css and custom effects
    const effectOptions = [
      { value: 'none', label: localize('editor.hover_effects.effects.none', lang, 'None') },
      {
        value: 'highlight',
        label: localize('editor.hover_effects.effects.highlight', lang, 'Highlight'),
      },
      {
        value: 'outline',
        label: localize('editor.hover_effects.effects.outline', lang, 'Outline'),
      },
      { value: 'grow', label: localize('editor.hover_effects.effects.grow', lang, 'Grow') },
      { value: 'shrink', label: localize('editor.hover_effects.effects.shrink', lang, 'Shrink') },
      { value: 'pulse', label: localize('editor.hover_effects.effects.pulse', lang, 'Pulse') },
      { value: 'bounce', label: localize('editor.hover_effects.effects.bounce', lang, 'Bounce') },
      { value: 'float', label: localize('editor.hover_effects.effects.float', lang, 'Float') },
      { value: 'glow', label: localize('editor.hover_effects.effects.glow', lang, 'Glow') },
      { value: 'shadow', label: localize('editor.hover_effects.effects.shadow', lang, 'Shadow') },
      { value: 'rotate', label: localize('editor.hover_effects.effects.rotate', lang, 'Rotate') },
      { value: 'skew', label: localize('editor.hover_effects.effects.skew', lang, 'Skew') },
      { value: 'wobble', label: localize('editor.hover_effects.effects.wobble', lang, 'Wobble') },
      { value: 'buzz', label: localize('editor.hover_effects.effects.buzz', lang, 'Buzz') },
      { value: 'fade', label: localize('editor.hover_effects.effects.fade', lang, 'Fade') },
    ];

    const timingOptions = [
      { value: 'ease', label: 'Ease' },
      { value: 'ease-in', label: 'Ease In' },
      { value: 'ease-out', label: 'Ease Out' },
      { value: 'ease-in-out', label: 'Ease In Out' },
      { value: 'linear', label: 'Linear' },
    ];

    const intensityOptions = [
      { value: 'subtle', label: 'Subtle' },
      { value: 'normal', label: 'Normal' },
      { value: 'strong', label: 'Strong' },
    ];

    return html`
      <div class="actions-section" style="margin-top: 20px;">
        <div class="section-header">
          <h4>
            <ha-icon icon="mdi:cursor-default-gesture"></ha-icon>
            ${localize('editor.hover_effects.title', lang, 'Hover Effects')}
          </h4>
          <p>
            ${localize(
              'editor.hover_effects.description',
              lang,
              'Configure visual effects that appear when hovering over this module, row, or column.'
            )}
          </p>
        </div>

        <!-- Effect Type Selection -->
        <div class="action-form">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.hover_effects.effect', lang, 'Hover Effect')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.hover_effects.effect_desc',
              lang,
              'Select the visual effect to apply when hovering'
            )}
          </div>
          ${UcFormUtils.renderForm(
            this.hass,
            { effect: hoverEffect.effect || 'none' },
            [UcFormUtils.select('effect', effectOptions)],
            (e: CustomEvent) => {
              const next = e.detail.value.effect;
              const current = hoverEffect.effect || 'none';
              if (next === current) return;
              updateHoverEffect({ effect: next });
              setTimeout(() => {
                this._triggerPreviewUpdate();
              }, 50);
            },
            false
          )}
        </div>

        ${hoverEffect.effect && hoverEffect.effect !== 'none'
          ? html`
              <!-- Timing and Duration Settings -->
              <div
                class="conditional-fields-group"
                style="margin-top: 16px; border-left: 4px solid var(--primary-color); background: rgba(var(--rgb-primary-color), 0.08); border-radius: 0 8px 8px 0; overflow: hidden;"
              >
                <div
                  class="conditional-fields-header"
                  style="background: rgba(var(--rgb-primary-color), 0.15); padding: 12px 16px; font-size: 14px; font-weight: 600; color: var(--primary-color); border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2); text-transform: uppercase; letter-spacing: 0.5px;"
                >
                  ${localize('editor.hover_effects.animation_settings', lang, 'Animation Settings')}
                </div>
                <div class="conditional-fields-content" style="padding: 16px;">
                  <!-- Duration Field -->
                  <div style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                    >
                      ${localize('editor.hover_effects.duration', lang, 'Duration (ms)')}
                    </div>
                    ${UcFormUtils.renderForm(
                      this.hass,
                      { duration: hoverEffect.duration || 300 },
                      [UcFormUtils.number('duration', 100, 2000, 50)],
                      (e: CustomEvent) => {
                        const next = e.detail.value.duration;
                        const current = hoverEffect.duration || 300;
                        if (next === current) return;
                        updateHoverEffect({ duration: next });
                        setTimeout(() => {
                          this._triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>

                  <!-- Timing Function Field -->
                  <div style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                    >
                      ${localize('editor.hover_effects.timing', lang, 'Timing Function')}
                    </div>
                    ${UcFormUtils.renderForm(
                      this.hass,
                      { timing: hoverEffect.timing || 'ease' },
                      [UcFormUtils.select('timing', timingOptions)],
                      (e: CustomEvent) => {
                        const next = e.detail.value.timing;
                        const current = hoverEffect.timing || 'ease';
                        if (next === current) return;
                        updateHoverEffect({ timing: next });
                        setTimeout(() => {
                          this._triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>

                  <!-- Intensity Field -->
                  <div style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                    >
                      ${localize('editor.hover_effects.intensity', lang, 'Intensity')}
                    </div>
                    ${UcFormUtils.renderForm(
                      this.hass,
                      { intensity: hoverEffect.intensity || 'normal' },
                      [UcFormUtils.select('intensity', intensityOptions)],
                      (e: CustomEvent) => {
                        const next = e.detail.value.intensity;
                        const current = hoverEffect.intensity || 'normal';
                        if (next === current) return;
                        updateHoverEffect({ intensity: next });
                        setTimeout(() => {
                          this._triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 0;
      }

      .actions-section {
        background: var(--secondary-background-color);
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .section-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      .section-header h4 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-header p {
        margin: 6px 0 0 0;
        color: var(--secondary-text-color);
        font-size: 13px;
        line-height: 1.4;
      }

      /* Allow native HA form styling to show through */
      ha-form {
        display: block;
        margin: 0;
        padding: 0;
      }

      .action-form {
        margin-bottom: 20px;
      }

      .field-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }

      .field-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
        opacity: 0.8;
        line-height: 1.4;
      }

      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .field-container {
        margin-bottom: 16px;
      }
    `;
  }

  // Legacy static render method for backwards compatibility
  static render<M extends CardModule>(
    module: M,
    hass: HomeAssistant,
    updateModule: (updates: Partial<M>) => void,
    title?: string
  ): TemplateResult {
    return html`
      <ultra-global-actions-tab
        .hass=${hass}
        .module=${module}
        .tabTitle=${title}
        @module-changed=${(e: CustomEvent) => updateModule(e.detail.updates)}
      ></ultra-global-actions-tab>
    `;
  }

  // Backwards-compatible helpers for clickable wrappers used in modules
  static getClickableClass(module: any): string {
    const hasAction =
      (module?.tap_action && module.tap_action.action !== 'none') ||
      (module?.hold_action && module.hold_action.action !== 'none') ||
      (module?.double_tap_action && module.double_tap_action.action !== 'none');
    return hasAction ? 'graphs-module-clickable' : '';
  }

  static getClickableStyle(module: any): string {
    // Legacy hover effects removed - now handled by new hover effects system
    return '';
  }

  /**
   * Resolves 'default' actions to their actual behavior at runtime
   * 'default' becomes 'more-info' for the module's entity if available, otherwise 'none'
   */
  static resolveAction(action: any, moduleEntity?: string): any {
    if (!action || action.action !== 'default') {
      return action;
    }

    // Convert 'default' to smart behavior
    if (moduleEntity) {
      return { action: 'more-info', entity: moduleEntity };
    } else {
      return { action: 'none' };
    }
  }

  static getHoverStyles(): string {
    // Legacy hover effects removed - now handled by new hover effects system
    return '';
  }
}
