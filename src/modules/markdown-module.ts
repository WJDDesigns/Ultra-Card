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
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
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
            <ha-form
              .hass=${hass}
              .data=${{ markdown_content: markdownModule.markdown_content || '' }}
              .schema=${[
                {
                  name: 'markdown_content',
                  label: localize('editor.markdown.content.label', lang, 'Content'),
                  description: localize(
                    'editor.markdown.content.desc',
                    lang,
                    'Enter your markdown content with full formatting support'
                  ),
                  selector: { text: { multiline: true } },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ markdown_content: e.detail.value.markdown_content })}
            ></ha-form>
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

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const markdownModule = module as MarkdownModule;

    // Apply design properties with priority - design properties override module properties
    const moduleWithDesign = markdownModule as any;
    const designProperties = (markdownModule as any).design || {};

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
          ? `${this.addPixelUnit(designProperties.margin_top || moduleWithDesign.margin_top) || '0px'} ${this.addPixelUnit(designProperties.margin_right || moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(designProperties.margin_bottom || moduleWithDesign.margin_bottom) || '0px'} ${this.addPixelUnit(designProperties.margin_left || moduleWithDesign.margin_left) || '0px'}`
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
      fontSize:
        (designProperties.font_size && designProperties.font_size) ||
        (moduleWithDesign.font_size ? `${moduleWithDesign.font_size}px` : '14px'), // Match HA default
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

      // Check if content contains Jinja templates
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
              window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
            }
          });
        }

        // Use latest rendered string if available
        const rendered = hass.__uvc_template_strings?.[templateKey];
        if (rendered !== undefined) {
          processedContent = String(rendered);
        } else {
          // Try immediate template evaluation as fallback
          try {
            hass
              .callApi<string>('POST', 'template', { template: content })
              .then(result => {
                if (!hass.__uvc_template_strings) {
                  hass.__uvc_template_strings = {};
                }
                hass.__uvc_template_strings[templateKey] = result;

                // Clear the cache so it will re-render with the new content
                this._clearMarkdownCache(markdownModule.id);

                // Trigger re-render
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                }
              })
              .catch(() => {
                // Silent fail for invalid templates
              });
          } catch {
            // Silent fail for invalid templates
          }
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
    const contentKey = `${markdownModule.id}_${this._hashString(markdownModule.markdown_content || '')}`;

    // Check if we already have rendered content
    let renderedContent =
      this._renderedContentCache.get(contentKey) || markdownModule.markdown_content || '';

    // Only process if we don't have cached content
    if (!this._renderedContentCache.has(contentKey)) {
      try {
        // Process markdown synchronously
        const result = renderMarkdown(markdownModule.markdown_content || '');
        // Cache the result
        this._renderedContentCache.set(contentKey, result);
        renderedContent = result;
      } catch (error) {
        console.warn('Ultra Card: Failed to render markdown:', error);
        // Use original content as fallback
        renderedContent = markdownModule.markdown_content || '';
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
            e.target as HTMLElement
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
          markdownModule.double_tap_action &&
          markdownModule.double_tap_action.action !== 'nothing'
        ) {
          UltraLinkComponent.handleAction(
            markdownModule.double_tap_action as any,
            hass,
            e.target as HTMLElement
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
          if (markdownModule.tap_action && markdownModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              markdownModule.tap_action as any,
              hass,
              e.target as HTMLElement
            );
          }
        }, 300); // Wait 300ms to see if double click follows
      }
    };

    const element = html`<div class="markdown-content" .innerHTML=${renderedContent}></div>`;

    return html`
      <div
        class="markdown-module-container"
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
        font-size: var(--ha-font-size-s);
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
        font-size: var(--ha-font-size-xl);
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
