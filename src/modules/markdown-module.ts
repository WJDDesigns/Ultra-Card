import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, MarkdownModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { getImageUrl } from '../utils/image-upload';
import { localize } from '../localize/localize';
import { TemplateService } from '../services/template-service';
import { marked } from 'marked';

export class UltraMarkdownModule extends BaseUltraModule {
  private _templateService: TemplateService | null = null;
  private _renderedContentCache: Map<string, string> = new Map();
  private _templateInputDebounce: any = null;
  private _templateUpdateListener: (() => void) | null = null;

  // Hash function for template caching
  private _hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash).toString(36);
  }

  // Clear markdown cache (useful when content changes)
  private _clearMarkdownCache(moduleId?: string): void {
    if (moduleId) {
      // Clear cache for specific module
      const keysToDelete = Array.from(this._renderedContentCache.keys()).filter(key =>
        key.startsWith(`${moduleId}_`)
      );
      keysToDelete.forEach(key => {
        this._renderedContentCache.delete(key);
      });
    } else {
      // Clear all cache
      this._renderedContentCache.clear();
    }
  }

  // Cleanup method to remove event listeners
  cleanup(): void {
    if (this._templateUpdateListener) {
      window.removeEventListener('ultra-card-template-update', this._templateUpdateListener);
      this._templateUpdateListener = null;
    }

    // Clear template service subscriptions
    if (this._templateService) {
      // The template service will handle its own cleanup
      this._templateService = null;
    }

    // Clear caches
    this._renderedContentCache.clear();

    // Clear any pending timers
    if (this._templateInputDebounce) {
      clearTimeout(this._templateInputDebounce);
      this._templateInputDebounce = null;
    }
  }

  metadata: ModuleMetadata = {
    type: 'markdown',
    title: 'Markdown Module',
    description: 'Display rich markdown content',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:language-markdown',
    category: 'content',
    tags: ['markdown', 'content', 'rich-text', 'formatting', 'template'],
  };

  createDefault(id?: string, hass?: HomeAssistant): MarkdownModule {
    return {
      id: id || this.generateId('markdown'),
      type: 'markdown',
      markdown_content: `# Markdown Module

The **Markdown** module supports rich formatting including **bold**, *italicized*, \`inline code\`, ~~strikethrough~~, and [links](https://example.com).

> Blockquotes and nested content work perfectly
>> Including nested blockquotes

**Lists and formatting:**
- **Bold**, *italic*, ~~strikethrough~~
- \`inline code\` and code blocks
- Tables, headers, and horizontal rules

**Jinja Templates:**
- Current time: {{now().strftime('%H:%M:%S')}}
- Date: {{now().strftime('%Y-%m-%d')}}

All standard markdown features are automatically enabled!`,
      enable_html: false,
      enable_tables: true,
      enable_code_highlighting: true,
      // Template configuration
      template_mode: false,
      template: '',
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
      smart_scaling: true,
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const markdownModule = module as MarkdownModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Content Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.markdown.content.title', lang, 'Markdown Content')}
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.markdown.content.label', lang, 'Content')}
            </div>
            <div
              class="field-description"
              style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              ${localize(
                'editor.markdown.content.desc',
                lang,
                'Enter your markdown content with full formatting support'
              )}
            </div>
            <ultra-template-editor
              .hass=${hass}
              .value=${markdownModule.markdown_content || ''}
              .placeholder=${'# Welcome\n\nEnter your **markdown** content here with full formatting support...\n\n- Lists\n- **Bold** and *italic*\n- Tables, code blocks, and more!'}
              .minHeight=${200}
              .maxHeight=${400}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ markdown_content: e.detail.value });
              }}
            ></ultra-template-editor>
          </div>
        </div>

        <!-- HTML Support Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.markdown.html.title', lang, 'HTML Support')}
          </div>

          <div class="field-group">
            <ha-form
              .hass=${hass}
              .data=${{ enable_html: markdownModule.enable_html || false }}
              .schema=${[
                {
                  name: 'enable_html',
                  label: localize('editor.markdown.enable_html', lang, 'Enable HTML'),
                  description: localize(
                    'editor.markdown.enable_html_desc',
                    lang,
                    'Allow raw HTML tags in markdown content (all standard markdown features are always enabled)'
                  ),
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ enable_html: e.detail.value.enable_html })}
            ></ha-form>
          </div>
        </div>

        <!-- Template Configuration -->
        <div
          class="settings-section template-mode-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.markdown.template_mode', lang, 'Template Mode')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${localize(
              'editor.markdown.template_mode_desc',
              lang,
              'Use Home Assistant templating syntax to render markdown content dynamically'
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ template_mode: markdownModule.template_mode || false }}
              .schema=${[
                {
                  name: 'template_mode',
                  label: localize('editor.markdown.template_mode', lang, 'Template Mode'),
                  description: localize(
                    'editor.markdown.template_mode_desc',
                    lang,
                    'Use Home Assistant templating syntax to render markdown content dynamically'
                  ),
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ template_mode: e.detail.value.template_mode })}
            ></ha-form>
          </div>

          ${markdownModule.template_mode
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${localize('editor.markdown.template.content', lang, 'Template Content')}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                  >
                    ${localize(
                      'editor.markdown.template.content_desc',
                      lang,
                      'Enter markdown content with Jinja2 templates that will be processed dynamically'
                    )}
                  </div>
                  <ultra-template-editor
                    .hass=${hass}
                    .value=${markdownModule.template || markdownModule.markdown_content || ''}
                    .placeholder=${"# Welcome Home\n\nToday is **{{ now().strftime('%A, %B %d') }}**\n\nCurrent temperature: {{ states('sensor.temperature') }}°F"}
                    .minHeight=${200}
                    .maxHeight=${400}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({ template: e.detail.value });
                    }}
                  ></ultra-template-editor>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${localize('editor.markdown.template.examples_title', lang, 'Common Examples:')}
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      # Dashboard Header<br />
                      Today is **{{ now().strftime('%A, %B %d') }}**<br />
                      Temperature: {{ states('sensor.temperature') }}°F
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${localize(
                        'editor.markdown.template.examples.header',
                        lang,
                        'Dynamic header with current date and sensor values'
                      )}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      ## System Status<br />
                      - ✅ Internet: Connected<br />
                      - ✅ Security: {{ states('alarm_control_panel.home') }}<br />
                      - ⚠️ Backup: {{ states('sensor.backup_status') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${localize(
                        'editor.markdown.template.examples.status',
                        lang,
                        'Status list with dynamic entity states'
                      )}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      ### Quick Info<br /><br />
                      | Sensor | Value |<br />
                      | ----------- | ------------------------------------ |<br />
                      | Temperature | {{ states('sensor.temperature') }}°F |<br />
                      | Humidity | {{ states('sensor.humidity') }}% |
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${localize(
                        'editor.markdown.template.examples.table',
                        lang,
                        'Table with dynamic sensor data'
                      )}
                    </div>
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as any, hass, updates => updateModule(updates));
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const markdownModule = module as MarkdownModule;

    // Set up template update listener if not already set up
    if (!this._templateUpdateListener && typeof window !== 'undefined') {
      this._templateUpdateListener = () => {
        // Clear cache when template updates occur to force re-render
        this._renderedContentCache.clear();
        // Trigger a preview update
        this.triggerPreviewUpdate();
      };
      window.addEventListener('ultra-card-template-update', this._templateUpdateListener);
    }

    // Apply design properties with priority - design properties override module properties
    const moduleWithDesign = markdownModule as any;
    const designFromDesignObject = (markdownModule as any).design || {};

    // Create merged design properties object that prioritizes top-level properties (where Global Design saves)
    // over design object properties, and includes all properties needed by the container styles
    const designProperties = {
      // Text properties - prioritize top-level (where Global Design saves them)
      color: (markdownModule as any).color || designFromDesignObject.color,
      font_size: (markdownModule as any).font_size || designFromDesignObject.font_size,
      font_weight: (markdownModule as any).font_weight || designFromDesignObject.font_weight,
      font_style: (markdownModule as any).font_style || designFromDesignObject.font_style,
      text_transform:
        (markdownModule as any).text_transform || designFromDesignObject.text_transform,
      font_family: (markdownModule as any).font_family || designFromDesignObject.font_family,
      line_height: (markdownModule as any).line_height || designFromDesignObject.line_height,
      letter_spacing:
        (markdownModule as any).letter_spacing || designFromDesignObject.letter_spacing,
      text_align: (markdownModule as any).text_align || designFromDesignObject.text_align,
      text_shadow_h: (markdownModule as any).text_shadow_h || designFromDesignObject.text_shadow_h,
      text_shadow_v: (markdownModule as any).text_shadow_v || designFromDesignObject.text_shadow_v,
      text_shadow_blur:
        (markdownModule as any).text_shadow_blur || designFromDesignObject.text_shadow_blur,
      text_shadow_color:
        (markdownModule as any).text_shadow_color || designFromDesignObject.text_shadow_color,
      // Container properties - also check both locations
      background_color:
        (markdownModule as any).background_color || designFromDesignObject.background_color,
      background_image:
        (markdownModule as any).background_image || designFromDesignObject.background_image,
      background_image_type:
        (markdownModule as any).background_image_type ||
        designFromDesignObject.background_image_type,
      background_image_entity:
        (markdownModule as any).background_image_entity ||
        designFromDesignObject.background_image_entity,
      background_repeat:
        (markdownModule as any).background_repeat || designFromDesignObject.background_repeat,
      background_position:
        (markdownModule as any).background_position || designFromDesignObject.background_position,
      background_size:
        (markdownModule as any).background_size || designFromDesignObject.background_size,
      backdrop_filter:
        (markdownModule as any).backdrop_filter || designFromDesignObject.backdrop_filter,
      width: (markdownModule as any).width || designFromDesignObject.width,
      height: (markdownModule as any).height || designFromDesignObject.height,
      max_width: (markdownModule as any).max_width || designFromDesignObject.max_width,
      max_height: (markdownModule as any).max_height || designFromDesignObject.max_height,
      min_width: (markdownModule as any).min_width || designFromDesignObject.min_width,
      min_height: (markdownModule as any).min_height || designFromDesignObject.min_height,
      margin_top: (markdownModule as any).margin_top || designFromDesignObject.margin_top,
      margin_bottom: (markdownModule as any).margin_bottom || designFromDesignObject.margin_bottom,
      margin_left: (markdownModule as any).margin_left || designFromDesignObject.margin_left,
      margin_right: (markdownModule as any).margin_right || designFromDesignObject.margin_right,
      padding_top: (markdownModule as any).padding_top || designFromDesignObject.padding_top,
      padding_bottom:
        (markdownModule as any).padding_bottom || designFromDesignObject.padding_bottom,
      padding_left: (markdownModule as any).padding_left || designFromDesignObject.padding_left,
      padding_right: (markdownModule as any).padding_right || designFromDesignObject.padding_right,
      border_radius: (markdownModule as any).border_radius || designFromDesignObject.border_radius,
      border_style: (markdownModule as any).border_style || designFromDesignObject.border_style,
      border_width: (markdownModule as any).border_width || designFromDesignObject.border_width,
      border_color: (markdownModule as any).border_color || designFromDesignObject.border_color,
      position: (markdownModule as any).position || designFromDesignObject.position,
      top: (markdownModule as any).top || designFromDesignObject.top,
      bottom: (markdownModule as any).bottom || designFromDesignObject.bottom,
      left: (markdownModule as any).left || designFromDesignObject.left,
      right: (markdownModule as any).right || designFromDesignObject.right,
      z_index: (markdownModule as any).z_index || designFromDesignObject.z_index,
      overflow: (markdownModule as any).overflow || designFromDesignObject.overflow,
      clip_path: (markdownModule as any).clip_path || designFromDesignObject.clip_path,
      box_shadow_h: (markdownModule as any).box_shadow_h || designFromDesignObject.box_shadow_h,
      box_shadow_v: (markdownModule as any).box_shadow_v || designFromDesignObject.box_shadow_v,
      box_shadow_blur:
        (markdownModule as any).box_shadow_blur || designFromDesignObject.box_shadow_blur,
      box_shadow_spread:
        (markdownModule as any).box_shadow_spread || designFromDesignObject.box_shadow_spread,
      box_shadow_color:
        (markdownModule as any).box_shadow_color || designFromDesignObject.box_shadow_color,
    };

    const containerStyles = {
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : '16px', // Match HA card padding
      // Minimal margin like HA markdown card
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '0px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '0px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '0',
      background:
        designProperties.background_color && designProperties.background_color !== 'transparent'
          ? designProperties.background_color
          : moduleWithDesign.background_color && moduleWithDesign.background_color !== 'transparent'
            ? moduleWithDesign.background_color
            : 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width || moduleWithDesign.border_width) || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      position: designProperties.position || moduleWithDesign.position || 'static',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      width: designProperties.width || moduleWithDesign.width || '100%',
      height: designProperties.height || moduleWithDesign.height || 'auto',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || '100%',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || 'none',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || 'auto',
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'visible',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || 'none',
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
            ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
            : 'none',
      boxSizing: 'border-box',
    };

    const contentStyles = {
      fontSize: (() => {
        if (
          designProperties.font_size &&
          typeof designProperties.font_size === 'string' &&
          designProperties.font_size.trim() !== ''
        ) {
          // If it already has units, use as-is; otherwise add px
          if (/[a-zA-Z%]/.test(designProperties.font_size)) {
            return designProperties.font_size;
          }
          return this.addPixelUnit(designProperties.font_size) || designProperties.font_size;
        }
        if (moduleWithDesign.font_size !== undefined) return `${moduleWithDesign.font_size}px`;
        // Default font size for markdown modules when no design or module font_size is set - use clamp for responsive scaling
        return 'clamp(12px, 3vw, 14px)'; // Match HA default with responsive scaling
      })(),
      fontFamily:
        designProperties.font_family ||
        moduleWithDesign.font_family ||
        markdownModule.font_family ||
        'var(--primary-font-family, "Roboto", sans-serif)', // Use HA font
      color:
        (designProperties && designProperties.color) ||
        moduleWithDesign.color ||
        markdownModule.color ||
        'var(--primary-text-color)',
      textAlign:
        (designProperties.text_align && designProperties.text_align !== 'inherit'
          ? designProperties.text_align
          : undefined) ||
        moduleWithDesign.text_align ||
        markdownModule.alignment ||
        'left',
      lineHeight:
        designProperties.line_height ||
        moduleWithDesign.line_height ||
        markdownModule.line_height ||
        1.4, // Match HA line height
      letterSpacing:
        designProperties.letter_spacing ||
        moduleWithDesign.letter_spacing ||
        markdownModule.letter_spacing ||
        'normal',
      // Remove default padding - let CSS handle it
      padding: '0',
      maxHeight:
        (designProperties.max_height && designProperties.max_height !== 'none'
          ? designProperties.max_height
          : undefined) ||
        (markdownModule.max_height && markdownModule.max_height !== 'none'
          ? markdownModule.max_height
          : 'none'),
      overflow:
        (designProperties.max_height && designProperties.max_height !== 'none'
          ? designProperties.overflow || 'visible'
          : undefined) ||
        (markdownModule.max_height && markdownModule.max_height !== 'none'
          ? markdownModule.overflow_behavior || 'visible'
          : 'visible'),
      // Shadow effects
      textShadow:
        designProperties.text_shadow_h && designProperties.text_shadow_v
          ? `${designProperties.text_shadow_h || '0'} ${designProperties.text_shadow_v || '0'} ${designProperties.text_shadow_blur || '0'} ${designProperties.text_shadow_color || 'rgba(0,0,0,0.5)'}`
          : moduleWithDesign.text_shadow_h && moduleWithDesign.text_shadow_v
            ? `${moduleWithDesign.text_shadow_h || '0'} ${moduleWithDesign.text_shadow_v || '0'} ${moduleWithDesign.text_shadow_blur || '0'} ${moduleWithDesign.text_shadow_color || 'rgba(0,0,0,0.5)'}`
            : 'none',
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
            ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
            : 'none',
    };

    // Process markdown using marked.js like Home Assistant does
    const renderMarkdown = (content: string): string => {
      if (!content) return '';

      // Process Jinja templates first if they exist in the content
      let processedContent = content;

      // Check if content contains Jinja templates (both {{ }} and {% %} syntax)
      const hasTemplates = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/.test(content);

      if (hasTemplates && hass) {
        // Initialize template service if needed
        if (!this._templateService) {
          this._templateService = new TemplateService(hass);
        }

        // Ensure template string cache exists on hass
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }

        const templateHash = this._hashString(content);
        const templateKey = `state_text_markdown_${markdownModule.id}_${templateHash}`;

        // Subscribe to template if needed
        if (!this._templateService.hasTemplateSubscription(templateKey)) {
          this._templateService.subscribeToTemplate(content, templateKey, () => {
            if (typeof window !== 'undefined') {
              // Use global debounced update
              if (!window._ultraCardUpdateTimer) {
                window._ultraCardUpdateTimer = setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                  window._ultraCardUpdateTimer = null;
                }, 50);
              }
            }
          });
        }

        // Use latest rendered string if available from WebSocket subscription
        const rendered = hass.__uvc_template_strings?.[templateKey];
        if (rendered !== undefined) {
          processedContent = String(rendered);
        } else {
          // For initial render, show a placeholder instead of raw template
          processedContent = 'Template processing...';
        }
      }

      // Configure marked.js options like Home Assistant
      const markedOptions = {
        breaks: false, // HA default
        gfm: true, // GitHub Flavored Markdown - enables strikethrough
        tables: true, // Always enable tables
        headerIds: false,
        mangle: false,
      };

      try {
        // Use marked.js to process the markdown (synchronous version)
        let html = marked(processedContent, markedOptions) as string;

        // Allow all markdown-generated HTML (marked.js is trusted)
        // Only escape raw HTML if HTML is explicitly disabled
        if (!markdownModule.enable_html) {
          // marked.js already generates safe HTML, so we trust its output
          // Only escape obvious raw HTML that wasn't generated by markdown
          html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
          html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
          html = html.replace(/<embed\b[^<]*>/gi, '');
        }

        return html;
      } catch (error) {
        console.warn('Ultra Card: Failed to process markdown:', error);
        return processedContent; // Fallback to original content
      }
    };

    // Create a cache key for this content
    // Use template content if template mode is enabled, otherwise use markdown content
    const sourceContent =
      markdownModule.template_mode && markdownModule.template
        ? markdownModule.template
        : markdownModule.markdown_content || '';

    const contentKey = `${markdownModule.id}_${this._hashString(sourceContent)}`;

    // Check if we already have rendered content
    let renderedContent = this._renderedContentCache.get(contentKey) || sourceContent;

    // Check if content contains templates - if so, always re-process to get latest template values
    const hasTemplates = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/.test(sourceContent);
    const shouldReProcess = !this._renderedContentCache.has(contentKey) || hasTemplates;

    if (shouldReProcess) {
      try {
        // Process markdown synchronously
        const result = renderMarkdown(sourceContent);
        // Cache the result
        this._renderedContentCache.set(contentKey, result);
        renderedContent = result;
      } catch (error) {
        console.warn('Ultra Card: Failed to render markdown:', error);
        // Use original content as fallback
        renderedContent = sourceContent;
      }
    } else {
      // For template content, always use the latest rendered result from template subscription
      if (hasTemplates && hass) {
        const templateHash = this._hashString(sourceContent);
        const templateKey = `state_text_markdown_${markdownModule.id}_${templateHash}`;
        const rendered = hass.__uvc_template_strings?.[templateKey];
        if (rendered !== undefined) {
          // Re-process with the latest template result
          const result = renderMarkdown(String(rendered));
          this._renderedContentCache.set(contentKey, result);
          renderedContent = result;
        }
      }
    }

    // Gesture handling variables
    let clickTimeout: any = null;
    let holdTimeout: any = null;
    let isHolding = false;
    let clickCount = 0;
    let lastClickTime = 0;

    // Handle gesture events for tap, hold, double-tap actions
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isHolding = false;

      // Start hold timer
      holdTimeout = setTimeout(() => {
        isHolding = true;
        if (markdownModule.hold_action && markdownModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            markdownModule.hold_action as any,
            hass,
            e.target as HTMLElement,
            config
          );
        }
      }, 500); // 500ms hold threshold
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Clear hold timer
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }

      // If this was a hold gesture, don't process as click
      if (isHolding) {
        isHolding = false;
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;

      // Double click detection (within 300ms)
      if (timeSinceLastClick < 300 && clickCount === 1) {
        // This is a double click
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickCount = 0;

        if (
          !markdownModule.double_tap_action ||
          markdownModule.double_tap_action.action !== 'nothing'
        ) {
          UltraLinkComponent.handleAction(
            (markdownModule.double_tap_action as any) || ({ action: 'default' } as any),
            hass,
            e.target as HTMLElement,
            config,
            (markdownModule as any).entity
          );
        }
      } else {
        // This might be a single click, but wait to see if double click follows
        clickCount = 1;
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
          // This is a single click
          clickCount = 0;

          // Execute tap action
          if (!markdownModule.tap_action || markdownModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (markdownModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config,
              (markdownModule as any).entity
            );
          }
        }, 300); // Wait 300ms to see if double click follows
      }
    };

    const element = html`<div class="markdown-content" .innerHTML=${renderedContent}></div>`;

    // Get hover effect configuration from module design
    const hoverEffect = (moduleWithDesign as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <div
        class="markdown-module-container ${hoverEffectClass}"
        style="${this.styleObjectToCss(containerStyles)}; cursor: ${(markdownModule.tap_action &&
          markdownModule.tap_action.action !== 'nothing') ||
        (markdownModule.hold_action && markdownModule.hold_action.action !== 'nothing') ||
        (markdownModule.double_tap_action && markdownModule.double_tap_action.action !== 'nothing')
          ? 'pointer'
          : 'default'};"
        @pointerdown=${handlePointerDown}
        @pointerup=${handlePointerUp}
      >
        <div class="markdown-module-preview" style=${this.styleObjectToCss(contentStyles)}>
          ${element}
        </div>
      </div>
    `;
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const markdownModule = module as MarkdownModule;
    const errors = [...baseValidation.errors];

    if (!markdownModule.markdown_content || markdownModule.markdown_content.trim() === '') {
      errors.push('Markdown content is required');
    }

    if (
      markdownModule.font_size &&
      (markdownModule.font_size < 1 || markdownModule.font_size > 200)
    ) {
      errors.push('Font size must be between 1 and 200 pixels');
    }

    // Validate link format if provided
    if (markdownModule.link && markdownModule.link.trim() !== '') {
      try {
        new URL(markdownModule.link);
      } catch {
        if (!markdownModule.link.startsWith('/') && !markdownModule.link.startsWith('#')) {
          errors.push('Link must be a valid URL or start with "/" for relative paths');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      /* Match Home Assistant ha-markdown exactly */
      .markdown-module-preview {
        display: block;
        -ms-user-select: text;
        -webkit-user-select: text;
        -moz-user-select: text;
      }

      .markdown-content {
        width: 100%;
      }

      /* Match HA's exact first/last child rules */
      .markdown-content > *:first-child {
        margin-top: 0;
      }

      .markdown-content > *:last-child {
        margin-bottom: 0;
      }

      /* Links - Match HA exactly */
      .markdown-content a {
        color: -webkit-link;
        cursor: pointer;
        text-decoration: underline !important;
      }

      /* Images - Match HA */
      .markdown-content img {
        max-width: 100%;
      }

      /* Code and Pre - Match HA exactly */
      .markdown-content code,
      .markdown-content pre {
        background-color: var(--markdown-code-background-color, none);
        border-radius: 3px;
      }

      /* Strikethrough - exact HA styling */
      .markdown-content del {
        text-decoration: line-through !important;
        color: var(--primary-text-color) !important;
      }

      .markdown-content code {
        font-size: inherit;
        color: var(--primary-text-color) !important;
        padding: .2em .4em;
      }

      .markdown-content pre code {
        padding: 0;
      }

      .markdown-content pre {
        padding: 16px;
        overflow: auto;
        line-height: var(--ha-line-height-condensed);
        font-family: var(--ha-font-family-code);
      }

      /* Headers - Match HA exactly */
      .markdown-content h1,
      .markdown-content h2,
      .markdown-content h3,
      .markdown-content h4,
      .markdown-content h5,
      .markdown-content h6 {
        line-height: initial;
      }

      .markdown-content h2 {
        font-size: inherit;
        font-weight: var(--ha-font-weight-bold);
      }

      /* Horizontal rules - Match HA */
      .markdown-content hr {
        border-color: var(--divider-color);
        border-bottom: none;
        margin: 16px 0;
      }

      /* Module-specific grid layouts */
      .two-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }

      .three-column-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
      }
       
      @media (max-width: 768px) {
        .two-column-grid,
        .three-column-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
      }
    `;
  }

  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    if (!imageType || imageType === 'none') return 'none';

    switch (imageType) {
      case 'upload': {
        if (backgroundImage) {
          const resolved = getImageUrl(hass, backgroundImage);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        if (backgroundImage) {
          return `url("${backgroundImage}")`;
        }
        break;
      }
      case 'entity': {
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            const imageUrl =
              (entityState.attributes as any)?.entity_picture ||
              (entityState.attributes as any)?.image ||
              (typeof entityState.state === 'string' ? entityState.state : '');
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              const resolved = getImageUrl(hass, imageUrl);
              return `url("${resolved}")`;
            }
          }
        }
        break;
      }
    }

    return 'none';
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
