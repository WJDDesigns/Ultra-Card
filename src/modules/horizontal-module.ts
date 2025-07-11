import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig } from '../types';
import { getModuleRegistry } from './module-registry';

// Use the existing HorizontalModule interface from types
import { HorizontalModule } from '../types';

export class UltraHorizontalModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'horizontal',
    title: 'Horizontal Layout',
    description: 'Arrange modules in rows',
    author: 'Ultra Card Team',
    version: '1.0.0',
    icon: 'mdi:view-sequential',
    category: 'layout',
    tags: ['layout', 'horizontal', 'alignment', 'container'],
  };

  createDefault(id?: string): HorizontalModule {
    return {
      id: id || this.generateId('horizontal'),
      type: 'horizontal',
      alignment: 'left',
      gap: 0.7,
      wrap: false,
      modules: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const horizontalModule = module as HorizontalModule;

    const alignmentOptions = [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
      { value: 'space-between', label: 'Space Between' },
      { value: 'space-around', label: 'Space Around' },
      { value: 'justify', label: 'Justify' },
    ];

    const gapOptions = [
      { value: '0', label: '0rem' },
      { value: '0.2', label: '0.2rem' },
      { value: '0.4', label: '0.4rem' },
      { value: '0.6', label: '0.6rem' },
      { value: '0.7', label: '0.7rem' },
      { value: '0.8', label: '0.8rem' },
      { value: '1.0', label: '1.0rem' },
      { value: '1.2', label: '1.2rem' },
      { value: '1.5', label: '1.5rem' },
      { value: '2.0', label: '2.0rem' },
    ];

    return html`
      <div class="module-general-settings">
        <!-- Horizontal Alignment -->
        <div class="form-group">
          <label class="form-label">Items Horizontal Alignment</label>
          <div class="alignment-buttons horizontal-alignment">
            ${alignmentOptions.map(
              option => html`
                <button
                  type="button"
                  class="alignment-button ${horizontalModule.alignment === option.value
                    ? 'active'
                    : ''}"
                  @click=${() => updateModule({ alignment: option.value as any })}
                  title="${option.label}"
                >
                  ${this.getHorizontalAlignmentIcon(option.value)}
                </button>
              `
            )}
          </div>
        </div>

        <!-- Gap between Items -->
        <div class="form-group">
          <label class="form-label">Gap between Items</label>
          <div class="gap-control">
            ${this.renderSelect(
              '',
              horizontalModule.gap?.toString() || '0.7',
              gapOptions,
              value => updateModule({ gap: parseFloat(value) }),
              'Space between horizontal items'
            )}
            <div class="gap-slider">
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                .value=${horizontalModule.gap.toString()}
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateModule({ gap: parseFloat(target.value) });
                }}
                class="gap-range"
              />
            </div>
          </div>
        </div>

        <!-- Allow Wrap -->
        ${this.renderCheckbox(
          'Allow move items to the next line',
          horizontalModule.wrap || false,
          checked => updateModule({ wrap: checked }),
          "Allow items to wrap to the next line if they don't fit"
        )}
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const horizontalModule = module as HorizontalModule;
    const hasChildren = horizontalModule.modules && horizontalModule.modules.length > 0;

    return html`
      <div class="horizontal-module-preview">
        <div
          class="horizontal-preview-content"
          style="
            display: flex;
            flex-direction: row;
            justify-content: ${this.getJustifyContent(horizontalModule.alignment)};
            gap: ${horizontalModule.gap || 0.7}rem;
            flex-wrap: ${horizontalModule.wrap ? 'wrap' : 'nowrap'};
            align-items: flex-start;
            width: 100%;
            min-height: 60px;
            padding: 8px;
          "
        >
          ${hasChildren
            ? horizontalModule.modules!.map(
                (childModule, index) => html`
                  <div
                    class="child-module-preview"
                    style="max-width: 100%; overflow: hidden; flex-shrink: 1;"
                  >
                    ${this._renderChildModulePreview(childModule, hass)}
                  </div>
                `
              )
            : html`
                <div class="empty-layout-message">
                  <span>No modules added yet</span>
                  <small>Add modules in the layout builder to see them here</small>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _renderChildModulePreview(childModule: CardModule, hass: HomeAssistant): TemplateResult {
    // Render actual module content using the registry
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(childModule.type);

    if (moduleHandler) {
      return moduleHandler.renderPreview(childModule, hass);
    }

    // Fallback for unknown module types
    return html`
      <div class="unknown-child-module">
        <ha-icon icon="mdi:help-circle"></ha-icon>
        <span>Unknown Module: ${childModule.type}</span>
      </div>
    `;
  }

  private _getModuleTitle(module: CardModule): string {
    const moduleAny = module as any;
    if (moduleAny.name) return moduleAny.name;
    if (moduleAny.text)
      return moduleAny.text.length > 15 ? `${moduleAny.text.substring(0, 15)}...` : moduleAny.text;
    return `${module.type.charAt(0).toUpperCase() + module.type.slice(1)} Module`;
  }

  private _getModuleIcon(moduleType: string): string {
    const iconMap: Record<string, string> = {
      text: 'mdi:text',
      image: 'mdi:image',
      icon: 'mdi:star',
      bar: 'mdi:chart-box',
      button: 'mdi:gesture-tap-button',
      separator: 'mdi:minus',
      info: 'mdi:information',
      markdown: 'mdi:language-markdown',
    };
    return iconMap[moduleType] || 'mdi:puzzle';
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const horizontalModule = module as HorizontalModule;
    const errors = [...baseValidation.errors];

    // Validate gap value
    if (horizontalModule.gap && (horizontalModule.gap < 0 || horizontalModule.gap > 10)) {
      errors.push('Gap must be between 0 and 10 rem');
    }

    // Validate nested modules to prevent horizontal inside vertical and vice versa
    if (horizontalModule.modules && horizontalModule.modules.length > 0) {
      for (const childModule of horizontalModule.modules) {
        if (childModule.type === 'vertical') {
          errors.push('Vertical layout modules cannot be placed inside horizontal layout modules');
        }
        if (childModule.type === 'horizontal') {
          errors.push(
            'Horizontal layout modules cannot be nested inside other horizontal layout modules'
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private getHorizontalAlignmentIcon(alignment: string): TemplateResult {
    switch (alignment) {
      case 'left':
        return html`<ha-icon icon="mdi:format-align-left"></ha-icon>`;
      case 'center':
        return html`<ha-icon icon="mdi:format-align-center"></ha-icon>`;
      case 'right':
        return html`<ha-icon icon="mdi:format-align-right"></ha-icon>`;
      case 'justify':
        return html`<ha-icon icon="mdi:format-align-justify"></ha-icon>`;
      default:
        return html`<ha-icon icon="mdi:format-align-left"></ha-icon>`;
    }
  }

  private getJustifyContent(alignment: string): string {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'justify':
        return 'space-between';
      default:
        return 'flex-start';
    }
  }

  private getAlignItems(alignment: string): string {
    switch (alignment) {
      case 'top':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'bottom':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  }

  // Drag and drop event handlers
  private _onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  private _onDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  private _onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  private _onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement module drop logic
    console.log('Module dropped into horizontal layout');
  }

  private _onModuleDragStart(e: DragEvent, index: number): void {
    e.stopPropagation();
    // TODO: Implement module drag start logic
    console.log('Module drag started:', index);
  }

  private _onDragEnd(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement drag end logic
    console.log('Drag ended');
  }

  private _onAddModuleClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement add module logic - should open module selector
    console.log('Add module clicked');
  }

  getStyles(): string {
    return `
      /* Container Module Specific Variables */
      .container-module {
        --container-primary-color: #9c27b0; /* Purple for layout modules */
        --container-secondary-color: #e1bee7; /* Light purple */
        --container-accent-color: #7b1fa2; /* Dark purple */
        --container-border-color: #ba68c8; /* Medium purple */
      }
      
      .horizontal-module-preview.container-module {
        border: 2px solid var(--container-border-color);
        border-radius: 8px;
        background: var(--card-background-color);
        overflow: hidden;
        position: relative;
      }
      
      .container-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: var(--container-primary-color);
        color: white;
        font-weight: 500;
        border-bottom: 2px solid var(--container-primary-color);
      }
      
      .container-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.8);
        cursor: grab;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }
      
      .container-drag-handle:hover {
        color: white;
      }
      
      .container-drag-handle:active {
        cursor: grabbing;
      }
      
      .container-badge {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-left: auto;
      }
      
      .container-content {
        padding: 16px;
        min-height: 120px;
        display: flex;
        border: 2px dashed var(--container-secondary-color);
        margin: 8px;
        border-radius: 6px;
        background: rgba(156, 39, 176, 0.05);
      }
      
      .horizontal-preview {
        flex-direction: row;
        width: 100%;
      }
      
      .container-child-item {
        position: relative;
        padding: 8px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid var(--container-border-color);
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      
      .container-child-item:hover {
        background: white;
        border-color: var(--container-primary-color);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(156, 39, 176, 0.2);
      }
      
      .child-module-preview {
        padding: 4px;
      }
      
      .child-module-summary {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
      }
      
      .child-module-title {
        font-weight: 500;
        color: var(--primary-text-color);
      }
      

      
      .container-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--container-primary-color);
        font-size: 14px;
        width: 100%;
        min-height: 80px;
        text-align: center;
      }
      
      .container-placeholder ha-icon {
        --mdc-icon-size: 32px;
        opacity: 0.7;
      }
      
      .container-placeholder small {
        font-size: 12px;
        opacity: 0.8;
        color: var(--secondary-text-color);
      }
      

      
      /* Form Styling */
      .alignment-buttons {
        display: flex;
        gap: 4px;
        background: var(--secondary-background-color);
        padding: 4px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
      }
      
      .alignment-button {
        flex: 1;
        padding: 8px 12px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        color: var(--secondary-text-color);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .alignment-button:hover {
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }
      
      .alignment-button.active {
        background: var(--container-primary-color);
        color: white;
      }
      
      .gap-control {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .gap-slider {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .gap-range {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: var(--secondary-background-color);
        outline: none;
        appearance: none;
      }
      
      .gap-range::-webkit-slider-thumb {
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--container-primary-color);
        cursor: pointer;
        border: 2px solid var(--card-background-color);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .gap-range::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--container-primary-color);
        cursor: pointer;
        border: 2px solid var(--card-background-color);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .form-group {
        margin-bottom: 16px;
      }
      
      .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      
      /* Layout Module Container - Styled like columns in layout builder */
      .layout-module-container {
        border: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        border-radius: 6px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;
        margin-bottom: 8px;
      }
      
      .layout-module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--accent-color, var(--orange-color, #ff9800));
        color: white;
        border-bottom: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        border-radius: 6px 6px 0px 0px;
      }
      
      .layout-module-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .layout-module-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }
      
      .layout-module-drag-handle:hover {
        opacity: 1;
      }
      
      .layout-module-drag-handle:active {
        cursor: grabbing;
      }
      
      .layout-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      
      .layout-module-settings-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 12px;
        min-width: 28px;
        min-height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 16px;
      }
      
      .layout-module-settings-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        transform: scale(1.05);
      }
      
      .layout-modules-container {
        display: flex;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--secondary-color, var(--accent-color, #ff9800));
        border-top: none;
        border-radius: 0px 0px 6px 6px;
        margin-top: 0;
        min-height: 100px;
        position: relative;
        overflow: visible;
      }
      
      .layout-modules-container.drop-target {
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        border-color: var(--primary-color);
      }
      
      .layout-module-item {
        position: relative;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      
      .layout-module-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }
      
      .layout-module-item.dragging {
        opacity: 0.6;
        transform: scale(0.95);
      }
      
      .layout-module-content {
        padding: 8px;
      }
      
      .layout-module-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
        padding: 20px;
        border: 2px dashed var(--divider-color);
        border-radius: 6px;
        text-align: center;
        flex: 1;
        min-height: 60px;
      }
      
      .layout-module-placeholder ha-icon {
        --mdc-icon-size: 24px;
        opacity: 0.7;
      }
      
      .layout-add-module-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 12px;
        background: none;
        border: 2px dashed var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 12px;
        transition: all 0.2s ease;
        min-width: 80px;
        min-height: 40px;
        flex-shrink: 0;
      }
      
      .layout-add-module-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
      }
      
      .layout-add-module-btn ha-icon {
        --mdc-icon-size: 16px;
      }
      
      /* Clean Preview Styles */
      .horizontal-module-preview {
        width: 100%;
        min-height: 60px;
      }
      
      .horizontal-preview-content {
        background: var(--secondary-background-color);
        border-radius: 6px;
        border: 1px solid var(--divider-color);
      }
      
      .child-module-preview {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 6px;
        transition: all 0.2s ease;
      }
      
      .child-module-preview:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .empty-layout-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        width: 100%;
        padding: 20px;
      }
      
      .empty-layout-message span {
        font-size: 14px;
        font-weight: 500;
      }
      
      .empty-layout-message small {
        font-size: 12px;
        opacity: 0.8;
      }
    `;
  }
}
