import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, SeparatorModule, UltraCardConfig } from '../types';

export class UltraSeparatorModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'separator',
    title: 'Separator Module',
    description: 'Visual dividers and spacing',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:minus',
    category: 'layout',
    tags: ['separator', 'divider', 'spacing', 'layout'],
  };

  createDefault(id?: string): SeparatorModule {
    return {
      id: id || this.generateId('separator'),
      type: 'separator',
      separator_style: 'line',
      thickness: 1,
      width_percent: 100,
      color: 'var(--divider-color)',
      show_title: false,
      title: '',
      title_size: 14,
      title_color: 'var(--secondary-text-color)',
      title_bold: false,
      title_italic: false,
      title_uppercase: false,
      title_strikethrough: false,
      title_underline: false,
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const separatorModule = module as SeparatorModule;

    return html`
      <div class="module-general-settings">
        <!-- Separator Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Separator Configuration
          </div>

          <!-- Separator Style -->
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Separator Style
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
          >
            Choose the visual style of the separator line.
          </div>
          <ha-form
            .hass=${hass}
            .data=${{ separator_style: separatorModule.separator_style || 'line' }}
            .schema=${[
              {
                name: 'separator_style',
                selector: {
                  select: {
                    options: [
                      { value: 'line', label: 'Solid Line' },
                      { value: 'double_line', label: 'Double Line' },
                      { value: 'dotted', label: 'Dotted Line' },
                      { value: 'double_dotted', label: 'Double Dotted' },
                      { value: 'shadow', label: 'Shadow' },
                      { value: 'blank', label: 'Blank Space' },
                    ],
                    mode: 'dropdown',
                  },
                },
                label: '',
              },
            ]}
            @value-changed=${(e: CustomEvent) =>
              updateModule({ separator_style: e.detail.value.separator_style })}
          ></ha-form>
        </div>

        <!-- Appearance Configuration -->
        ${separatorModule.separator_style !== 'blank'
          ? html`
              <div
                class="settings-section"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                >
                  Appearance
                </div>

                <!-- Thickness -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Thickness (px)
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Thickness of the separator line.
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ thickness: separatorModule.thickness || 1 }}
                    .schema=${[
                      {
                        name: 'thickness',
                        selector: { number: { min: 1, max: 20, step: 1, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ thickness: e.detail.value.thickness })}
                  ></ha-form>
                </div>

                <!-- Width -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Width (%)
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Width of the separator as percentage of container.
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ width_percent: separatorModule.width_percent || 100 }}
                    .schema=${[
                      {
                        name: 'width_percent',
                        selector: { number: { min: 10, max: 100, step: 5, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ width_percent: e.detail.value.width_percent })}
                  ></ha-form>
                </div>

                <!-- Color -->
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Color of the separator line.
                  </div>
                  <ultra-color-picker
                    .label=${''}
                    .value=${separatorModule.color || ''}
                    .defaultValue=${'var(--divider-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      const value = e.detail.value;
                      updateModule({ color: value });
                    }}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}

        <!-- Text in Separator -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Text in Separator
            </div>
            <ha-form
              .hass=${hass}
              .data=${{ show_title: separatorModule.show_title || false }}
              .schema=${[{ name: 'show_title', selector: { boolean: {} }, label: '' }]}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ show_title: e.detail.value.show_title })}
            ></ha-form>
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            Add text in the middle of the separator line (e.g., ------ Text ------).
          </div>

          ${separatorModule.show_title
            ? html`
                <!-- Text Content -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Text Content
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Text to display in the middle of the separator.
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ title: separatorModule.title || '' }}
                    .schema=${[
                      {
                        name: 'title',
                        selector: { text: {} },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ title: e.detail.value.title })}
                  ></ha-form>
                </div>

                <!-- Font Size -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Font Size
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Size of the text in pixels.
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ title_size: separatorModule.title_size || 14 }}
                    .schema=${[
                      {
                        name: 'title_size',
                        selector: { number: { min: 8, max: 48, step: 1, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ title_size: e.detail.value.title_size })}
                  ></ha-form>
                </div>

                <!-- Text Color -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Text Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Color of the separator text.
                  </div>
                  <ultra-color-picker
                    .label=${''}
                    .value=${separatorModule.title_color || ''}
                    .defaultValue=${'var(--secondary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      const value = e.detail.value;
                      updateModule({ title_color: value });
                    }}
                  ></ultra-color-picker>
                </div>

                <!-- Text Formatting -->
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    Text Formatting
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    Apply formatting styles to the separator text.
                  </div>
                  <div class="format-buttons" style="display: flex; gap: 8px;">
                    <button
                      class="format-btn ${separatorModule.title_bold ? 'active' : ''}"
                      @click=${() => updateModule({ title_bold: !separatorModule.title_bold })}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${separatorModule.title_bold
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_bold
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Bold"
                    >
                      <ha-icon icon="mdi:format-bold"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${separatorModule.title_italic ? 'active' : ''}"
                      @click=${() => updateModule({ title_italic: !separatorModule.title_italic })}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${separatorModule.title_italic
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_italic
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Italic"
                    >
                      <ha-icon icon="mdi:format-italic"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${separatorModule.title_underline ? 'active' : ''}"
                      @click=${() =>
                        updateModule({ title_underline: !separatorModule.title_underline })}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${separatorModule.title_underline
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_underline
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Underline"
                    >
                      <ha-icon icon="mdi:format-underline"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${separatorModule.title_uppercase ? 'active' : ''}"
                      @click=${() =>
                        updateModule({ title_uppercase: !separatorModule.title_uppercase })}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${separatorModule.title_uppercase
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_uppercase
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Uppercase"
                    >
                      <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
                    </button>
                    <button
                      class="format-btn ${separatorModule.title_strikethrough ? 'active' : ''}"
                      @click=${() =>
                        updateModule({
                          title_strikethrough: !separatorModule.title_strikethrough,
                        })}
                      style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${separatorModule.title_strikethrough
                        ? 'var(--primary-color)'
                        : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${separatorModule.title_strikethrough
                        ? 'white'
                        : 'var(--primary-text-color)'};"
                      title="Strikethrough"
                    >
                      <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                    </button>
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const separatorModule = module as SeparatorModule;

    // Apply design properties with priority
    const moduleWithDesign = separatorModule as any;

    // Container styles for design system
    const containerStyles = {
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${moduleWithDesign.padding_top || '8'}px ${moduleWithDesign.padding_right || '0'}px ${moduleWithDesign.padding_bottom || '8'}px ${moduleWithDesign.padding_left || '0'}px`
          : '8px 0',
      margin:
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${moduleWithDesign.margin_top || '0'}px ${moduleWithDesign.margin_right || '0'}px ${moduleWithDesign.margin_bottom || '0'}px ${moduleWithDesign.margin_left || '0'}px`
          : '0',
      background: moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border:
        moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none'
          ? `${moduleWithDesign.border_width || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0',
      position: moduleWithDesign.position || 'relative',
      top: moduleWithDesign.top || 'auto',
      bottom: moduleWithDesign.bottom || 'auto',
      left: moduleWithDesign.left || 'auto',
      right: moduleWithDesign.right || 'auto',
      zIndex: moduleWithDesign.z_index || 'auto',
      width: moduleWithDesign.width || '100%',
      height: moduleWithDesign.height || 'auto',
      maxWidth: moduleWithDesign.max_width || '100%',
      maxHeight: moduleWithDesign.max_height || 'none',
      minWidth: moduleWithDesign.min_width || 'none',
      minHeight: moduleWithDesign.min_height || 'auto',
      overflow: moduleWithDesign.overflow || 'visible',
      clipPath: moduleWithDesign.clip_path || 'none',
      backdropFilter: moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
          ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    if (separatorModule.separator_style === 'blank') {
      return html`
        <div class="separator-module-container" style=${this.styleObjectToCss(containerStyles)}>
          <div
            class="separator-preview blank-separator"
            style="height: ${separatorModule.thickness || 1}px;"
          >
            ${separatorModule.show_title && separatorModule.title
              ? html`
                  <div class="separator-title" style=${this.getTitleStyles(separatorModule)}>
                    ${separatorModule.title}
                  </div>
                `
              : ''}
          </div>
        </div>
      `;
    }

    const separatorStyles = this.getSeparatorStyles(separatorModule);

    return html`
      <div class="separator-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="separator-preview" style="width: 100%; text-align: center;">
          ${separatorModule.show_title && separatorModule.title
            ? html`
                <div
                  class="separator-with-title"
                  style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%;"
                >
                  <div
                    class="separator-line-left"
                    style=${this.getSeparatorLineStyles(separatorModule, 'left')}
                  ></div>
                  <div class="separator-title" style=${this.getTitleStyles(separatorModule)}>
                    ${separatorModule.title}
                  </div>
                  <div
                    class="separator-line-right"
                    style=${this.getSeparatorLineStyles(separatorModule, 'right')}
                  ></div>
                </div>
              `
            : html` <div class="separator-line" style=${separatorStyles}></div> `}
        </div>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const separatorModule = module as SeparatorModule;
    const errors = [...baseValidation.errors];

    if (
      separatorModule.thickness &&
      (separatorModule.thickness < 1 || separatorModule.thickness > 50)
    ) {
      errors.push('Thickness must be between 1 and 50 pixels');
    }

    if (
      separatorModule.width_percent &&
      (separatorModule.width_percent < 1 || separatorModule.width_percent > 100)
    ) {
      errors.push('Width must be between 1 and 100 percent');
    }

    if (
      separatorModule.show_title &&
      (!separatorModule.title || separatorModule.title.trim() === '')
    ) {
      errors.push('Title text is required when show title is enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      .separator-preview {
        min-height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .blank-separator {
        background: transparent;
        border: 1px dashed var(--divider-color);
        opacity: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 20px;
      }
      
      .separator-with-title {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      
      .separator-title {
        margin: 0;
        line-height: 1.2;
        background: var(--card-background-color);
        padding: 0 8px;
        position: relative;
        z-index: 1;
        white-space: nowrap;
      }
      
      .separator-line,
      .separator-line-left,
      .separator-line-right {
        display: block;
      }
      
      .separator-line-left,
      .separator-line-right {
        flex: 1;
      }
      
      /* Format button styles */
      .format-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .format-btn {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        min-height: 36px;
      }
      
      .format-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .format-btn ha-icon {
        font-size: 16px;
      }
      
      /* Settings section styling */
      .settings-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 32px;
      }
      
      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
        padding-bottom: 0;
        border-bottom: none;
        letter-spacing: 0.5px;
      }
      
      .field-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .field-description {
        font-size: 13px;
        font-weight: 400;
        margin-bottom: 12px;
        color: var(--secondary-text-color);
      }
      
      .field-group {
        margin-bottom: 16px;
      }
    `;
  }

  private getSeparatorStyles(separatorModule: SeparatorModule): string {
    const styles: Record<string, string> = {
      width: `${separatorModule.width_percent || 100}%`,
      height: `${separatorModule.thickness || 1}px`,
      margin: '0 auto',
    };

    switch (separatorModule.separator_style) {
      case 'line':
        styles.backgroundColor = separatorModule.color || 'var(--divider-color)';
        break;
      case 'double_line':
        styles.borderTop = `${separatorModule.thickness || 1}px solid ${separatorModule.color || 'var(--divider-color)'}`;
        styles.borderBottom = `${separatorModule.thickness || 1}px solid ${separatorModule.color || 'var(--divider-color)'}`;
        styles.height = `${(separatorModule.thickness || 1) * 3}px`;
        break;
      case 'dotted':
        styles.borderTop = `${separatorModule.thickness || 1}px dotted ${separatorModule.color || 'var(--divider-color)'}`;
        styles.height = '0';
        break;
      case 'double_dotted':
        styles.borderTop = `${separatorModule.thickness || 1}px dotted ${separatorModule.color || 'var(--divider-color)'}`;
        styles.borderBottom = `${separatorModule.thickness || 1}px dotted ${separatorModule.color || 'var(--divider-color)'}`;
        styles.height = `${(separatorModule.thickness || 1) * 3}px`;
        break;
      case 'shadow':
        styles.boxShadow = `0 ${separatorModule.thickness || 1}px ${(separatorModule.thickness || 1) * 2}px ${separatorModule.color || 'rgba(0,0,0,0.2)'}`;
        styles.height = '0';
        break;
    }

    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private getSeparatorLineStyles(
    separatorModule: SeparatorModule,
    position: 'left' | 'right'
  ): string {
    const styles: Record<string, string> = {
      flex: '1',
      height: `${separatorModule.thickness || 1}px`,
      margin: '0',
    };

    switch (separatorModule.separator_style) {
      case 'line':
        styles.backgroundColor = separatorModule.color || 'var(--divider-color)';
        break;
      case 'double_line':
        styles.borderTop = `${separatorModule.thickness || 1}px solid ${separatorModule.color || 'var(--divider-color)'}`;
        styles.borderBottom = `${separatorModule.thickness || 1}px solid ${separatorModule.color || 'var(--divider-color)'}`;
        styles.height = `${(separatorModule.thickness || 1) * 3}px`;
        break;
      case 'dotted':
        styles.borderTop = `${separatorModule.thickness || 1}px dotted ${separatorModule.color || 'var(--divider-color)'}`;
        styles.height = '0';
        break;
      case 'double_dotted':
        styles.borderTop = `${separatorModule.thickness || 1}px dotted ${separatorModule.color || 'var(--divider-color)'}`;
        styles.borderBottom = `${separatorModule.thickness || 1}px dotted ${separatorModule.color || 'var(--divider-color)'}`;
        styles.height = `${(separatorModule.thickness || 1) * 3}px`;
        break;
      case 'shadow':
        styles.boxShadow = `0 ${separatorModule.thickness || 1}px ${(separatorModule.thickness || 1) * 2}px ${separatorModule.color || 'rgba(0,0,0,0.2)'}`;
        styles.height = '0';
        break;
    }

    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private getTitleStyles(separatorModule: SeparatorModule): string {
    const styles: Record<string, string> = {
      fontSize: `${separatorModule.title_size || 14}px`,
      color: separatorModule.title_color || 'var(--secondary-text-color)',
      fontWeight: separatorModule.title_bold ? 'bold' : 'normal',
      fontStyle: separatorModule.title_italic ? 'italic' : 'normal',
      textTransform: separatorModule.title_uppercase ? 'uppercase' : 'none',
      margin: '0',
      padding: '0 8px',
      backgroundColor: 'var(--card-background-color)',
      position: 'relative',
      zIndex: '1',
    };

    // Handle multiple text decorations
    const decorations: string[] = [];
    if (separatorModule.title_strikethrough) decorations.push('line-through');
    if (separatorModule.title_underline) decorations.push('underline');
    styles.textDecoration = decorations.length > 0 ? decorations.join(' ') : 'none';

    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (
      !moduleWithDesign.background_image_type ||
      moduleWithDesign.background_image_type === 'none'
    ) {
      return 'none';
    }

    switch (moduleWithDesign.background_image_type) {
      case 'upload':
      case 'url':
        if (moduleWithDesign.background_image) {
          return `url("${moduleWithDesign.background_image}")`;
        }
        break;

      case 'entity':
        if (
          moduleWithDesign.background_image_entity &&
          hass?.states[moduleWithDesign.background_image_entity]
        ) {
          const entityState = hass.states[moduleWithDesign.background_image_entity];
          let imageUrl = '';

          // Try to get image from entity
          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            // Handle cases where state itself is an image path
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            // Handle Home Assistant local paths
            if (imageUrl.startsWith('/local/') || imageUrl.startsWith('/media/')) {
              imageUrl = imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = imageUrl;
            }
            return `url("${imageUrl}")`;
          }
        }
        break;
    }

    return 'none';
  }

  private styleObjectToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  // Helper method to ensure border radius values have proper units
  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return value;
  }
}
