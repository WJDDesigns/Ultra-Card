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
    isEditorPreview?: boolean
  ): TemplateResult {
    // Page breaks are only for editor organization - don't render anything in the card preview
    return html``;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    return baseValidation;
  }

  getStyles(): string {
    return `
      .pagebreak-module-container {
        user-select: none;
      }
    `;
  }
}
