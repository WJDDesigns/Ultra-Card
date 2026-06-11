import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, PageBreakModule } from '../types';
import { localize } from '../localize/localize';

export class UltraPageBreakModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'pagebreak',
    title: 'Page Break',
    description: 'Separates slider content into pages',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:format-page-break',
    category: 'layout',
    tags: ['slider', 'page', 'break', 'separator', 'divider'],
  };

  createDefault(id?: string, hass?: HomeAssistant): PageBreakModule {
    return {
      id: id || this.generateId('pagebreak'),
      type: 'pagebreak',
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Info Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <ha-icon
              icon="mdi:information"
              style="color: var(--info-color); margin-top: 2px; flex-shrink: 0; font-size: 24px;"
            ></ha-icon>
            <div style="font-size: 14px; line-height: 1.5; color: var(--primary-text-color);">
              <strong>How Page Breaks Work:</strong><br />
              Page breaks are only visible in the editor. When used inside a Slider Layout, they
              separate content into different slides. All modules before a page break belong to one
              page, and modules after it belong to the next page.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    // Page breaks are organizational markers: show a slim labeled divider in editor
    // preview contexts only, and render nothing on the actual dashboard.
    const isEditorPreview = previewContext === 'live' || previewContext === 'ha-preview';
    if (!isEditorPreview) {
      return html``;
    }

    const lang = hass?.locale?.language || 'en';
    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="pagebreak-module-container">
        <ha-icon icon="mdi:format-page-break"></ha-icon>
        <span>${localize('editor.pagebreak.preview_label', lang, 'Page Break')}</span>
      </div>
    `;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    return baseValidation;
  }

  getStyles(): string {
    return `
      .pagebreak-module-container {
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 2px 0;
        color: var(--secondary-text-color);
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
      }

      .pagebreak-module-container::before,
      .pagebreak-module-container::after {
        content: '';
        flex: 1;
        border-top: 1px dashed var(--divider-color);
      }

      .pagebreak-module-container ha-icon {
        --mdc-icon-size: 14px;
        flex-shrink: 0;
      }
    `;
  }
}
