/**
 * MODULE SCAFFOLD TEMPLATE
 *
 * Copy this file to create a new Ultra Card module.
 * Steps:
 *  1. Rename the file  (e.g. my-widget-module.ts)
 *  2. Replace every occurrence of "Template" / "template" with your module name
 *  3. Fill in metadata, createDefault, renderPreview, and validate
 *  4. Delete any sections of renderGeneralTab that don't apply
 *
 * CANONICAL RULES — every General tab must follow these:
 *  1. Always call this.injectUcFormStyles() first
 *  2. Group related fields with this.renderSettingsSection() (entity, display, layout, advanced)
 *  3. Use this.renderFieldSection() for ungrouped standalone fields
 *  4. Use this.booleanField() for all toggles — never ha-switch or renderCheckbox
 *  5. Use this.renderSliderField() for all numeric sliders
 *     — also return BaseUltraModule.getSliderStyles() from getStyles()
 *  6. Use this.renderEntityPickerWithVariables() for entity pickers
 *  7. Use localize() for all visible text — never hardcoded English strings
 *  8. Call this.triggerPreviewUpdate() after changes that affect the live preview
 *  9. Use this.renderConditionalFieldsGroup(header, content) for conditional sub-sections
 *
 * Reference implementation: src/modules/cover-module.ts
 */

import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplateModule extends CardModule {
  entity: string;
  name?: string | undefined;
  icon?: string | undefined;
  show_name?: boolean | undefined;
  show_state?: boolean | undefined;
  // layout?: 'compact' | 'standard';
  // size?: number;
}

// ─── Module class ─────────────────────────────────────────────────────────────

export class UltraTemplateModule extends BaseUltraModule {

  metadata: ModuleMetadata = {
    type: 'template',                        // unique snake_case key
    title: 'Template',                       // human-readable name shown in the editor
    description: 'A starter module.',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:widgets',
    category: 'content',                     // content | layout | media | data | interactive | input
    tags: ['template'],
  };

  // ── createDefault ────────────────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): TemplateModule {
    return {
      id: id || this.generateId('template'),
      type: 'template',
      entity: '',
      name: '',
      icon: '',
      show_name: true,
      show_state: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // ── validate ─────────────────────────────────────────────────────────────────

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as TemplateModule;

    if (!module.id)   errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.entity)    errors.push('Select an entity');

    return { valid: errors.length === 0, errors };
  }

  // ── General tab ──────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as TemplateModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">

        <!-- ── ENTITY SECTION ─────────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.template.entity_section', lang, 'Entity'),
          localize('editor.template.entity_section_desc', lang, 'Choose the entity this module displays.'),
          [
            {
              title: localize('editor.template.entity', lang, 'Entity'),
              description: localize('editor.template.entity_desc', lang, 'The entity to display.'),
              hass,
              data: { entity: m.entity || '' },
              schema: [{ name: 'entity', selector: { entity: {} } }],
              onChange: (e: CustomEvent) => {
                updateModule({ entity: e.detail.value?.entity ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.template.name', lang, 'Name override'),
              description: localize('editor.template.name_desc', lang, 'Leave blank to use the entity friendly name.'),
              hass,
              data: { name: m.name || '' },
              schema: [{ name: 'name', selector: { text: {} } }],
              onChange: (e: CustomEvent) => {
                updateModule({ name: e.detail.value?.name ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.template.icon', lang, 'Icon override'),
              description: localize('editor.template.icon_desc', lang, 'Leave blank to use the entity icon.'),
              hass,
              data: { icon: m.icon || '' },
              schema: [{ name: 'icon', selector: { icon: {} } }],
              onChange: (e: CustomEvent) => {
                updateModule({ icon: e.detail.value?.icon ?? '' });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        <!-- ── DISPLAY SECTION ────────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.template.display_section', lang, 'Display'),
          localize('editor.template.display_section_desc', lang, 'Choose what to show.'),
          [
            {
              title: localize('editor.template.show_name', lang, 'Show name'),
              description: localize('editor.template.show_name_desc', lang, 'Display the entity name.'),
              hass,
              data: { show_name: m.show_name !== false },
              schema: [this.booleanField('show_name')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_name: e.detail.value?.show_name ?? true }),
            },
            {
              title: localize('editor.template.show_state', lang, 'Show state'),
              description: localize('editor.template.show_state_desc', lang, 'Display the entity state.'),
              hass,
              data: { show_state: m.show_state !== false },
              schema: [this.booleanField('show_state')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_state: e.detail.value?.show_state ?? true }),
            },
          ]
        )}

        <!-- ── LAYOUT SECTION (optional) ──────────────────────────────── -->
        <!-- ${this.renderSettingsSection(
          localize('editor.template.layout_section', lang, 'Layout'),
          localize('editor.template.layout_section_desc', lang, 'How the module is arranged.'),
          [
            {
              title: localize('editor.template.layout', lang, 'Layout'),
              description: localize('editor.template.layout_desc', lang, 'Choose a layout style.'),
              hass,
              data: { layout: (m as any).layout || 'standard' },
              schema: [this.selectField('layout', [
                { value: 'compact',  label: localize('editor.template.layout_compact',  lang, 'Compact') },
                { value: 'standard', label: localize('editor.template.layout_standard', lang, 'Standard') },
              ])],
              onChange: (e: CustomEvent) => {
                updateModule({ layout: e.detail.value?.layout || 'standard' });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )} -->

        <!-- ── SLIDER (optional) ──────────────────────────────────────── -->
        <!-- ${this.renderSliderField(
          localize('editor.template.size', lang, 'Size'),
          localize('editor.template.size_desc', lang, 'Set the display size.'),
          (m as any).size ?? 24,   // current value
          24,                       // default
          8, 120, 1,                // min, max, step
          (v: number) => { updateModule({ size: v } as any); this.triggerPreviewUpdate(); },
          'px'
        )} -->

        <!-- ── CONDITIONAL SUB-SECTION (optional) ────────────────────── -->
        <!-- ${(m as any).show_extra ? this.renderConditionalFieldsGroup(
          localize('editor.template.extra_section', lang, 'Extra options'),
          html`
            ${this.renderFieldSection(
              localize('editor.template.extra_option', lang, 'Extra option'),
              localize('editor.template.extra_option_desc', lang, 'An extra option that only appears when enabled.'),
              hass,
              { extra_option: (m as any).extra_option || '' },
              [{ name: 'extra_option', selector: { text: {} } }],
              (e: CustomEvent) => updateModule({ extra_option: e.detail.value?.extra_option ?? '' } as any)
            )}
          `
        ) : ''} -->

      </div>
    `;
  }

  // ── Preview ──────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as TemplateModule;
    const lang = hass?.locale?.language || 'en';
    const entityId = this.resolveEntity(m.entity, config) || m.entity;

    if (!entityId || !hass?.states[entityId]) {
      return this.renderGradientErrorState(
        localize('editor.template.config_needed', lang, 'Select an entity'),
        localize('editor.template.config_needed_desc', lang, 'Choose an entity in the General tab'),
        'mdi:widgets'
      );
    }

    const state = hass.states[entityId];
    const name = m.name?.trim() || state.attributes?.friendly_name || entityId;
    const icon = m.icon || state.attributes?.icon || 'mdi:widgets';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <div
        class="uc-template-wrapper ${hoverClass}"
        style="padding: 16px; border-radius: 12px; background: var(--card-background-color); ${designStyles}"
      >
        ${this.wrapWithAnimation(
          html`
            <div style="display: flex; align-items: center; gap: 12px;">
              <ha-icon icon="${icon}" style="color: var(--primary-color); --mdc-icon-size: 28px;"></ha-icon>
              <div>
                ${m.show_name !== false ? html`<div style="font-weight: 600; font-size: 15px;">${name}</div>` : ''}
                ${m.show_state !== false ? html`<div style="font-size: 13px; color: var(--secondary-text-color);">${state.state}</div>` : ''}
              </div>
            </div>
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  // ── CSS ──────────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      .uc-template-wrapper { box-sizing: border-box; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
