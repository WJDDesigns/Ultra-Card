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

export class UltraMarkdownModule extends BaseUltraModule {
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
      markdown_content: `# Welcome to Markdown

This is a **markdown** module that supports:

- *Italic* and **bold** text
- [Links](https://example.com)
- \`inline code\`
- Lists and more!

## Features
1. Headers (H1-H6)
2. Tables
3. Code blocks
4. And much more...

> This is a blockquote example

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Content  | Here     |`,
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

        <!-- Feature Settings Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.markdown.features.title', lang, 'Markdown Features')}
          </div>

          <div class="three-column-grid">
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
                      'Allow HTML tags in markdown content'
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

            <div class="field-group">
              <ha-form
                .hass=${hass}
                .data=${{ enable_tables: markdownModule.enable_tables !== false }}
                .schema=${[
                  {
                    name: 'enable_tables',
                    label: localize('editor.markdown.enable_tables', lang, 'Enable Tables'),
                    description: localize(
                      'editor.markdown.enable_tables_desc',
                      lang,
                      'Support for markdown table syntax'
                    ),
                    selector: { boolean: {} },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || schema.name}
                .computeDescription=${(schema: any) => schema.description || ''}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ enable_tables: e.detail.value.enable_tables })}
              ></ha-form>
            </div>

            <div class="field-group">
              <ha-form
                .hass=${hass}
                .data=${{
                  enable_code_highlighting: markdownModule.enable_code_highlighting !== false,
                }}
                .schema=${[
                  {
                    name: 'enable_code_highlighting',
                    label: localize('editor.markdown.code_highlighting', lang, 'Code Highlighting'),
                    description: localize(
                      'editor.markdown.code_highlighting_desc',
                      lang,
                      'Syntax highlighting for code blocks'
                    ),
                    selector: { boolean: {} },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || schema.name}
                .computeDescription=${(schema: any) => schema.description || ''}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({
                    enable_code_highlighting: e.detail.value.enable_code_highlighting,
                  })}
              ></ha-form>
            </div>
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
          : '0',
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${this.addPixelUnit(designProperties.margin_top || moduleWithDesign.margin_top) || '8px'} ${this.addPixelUnit(designProperties.margin_right || moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(designProperties.margin_bottom || moduleWithDesign.margin_bottom) || '8px'} ${this.addPixelUnit(designProperties.margin_left || moduleWithDesign.margin_left) || '0px'}`
          : '8px 0',
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
        (moduleWithDesign.font_size
          ? `${moduleWithDesign.font_size}px`
          : `${markdownModule.font_size || 14}px`),
      fontFamily:
        designProperties.font_family ||
        moduleWithDesign.font_family ||
        markdownModule.font_family ||
        'Roboto',
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
        1.6,
      letterSpacing:
        designProperties.letter_spacing ||
        moduleWithDesign.letter_spacing ||
        markdownModule.letter_spacing ||
        'normal',
      // Only apply padding if explicitly set by user
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
          : '0',
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

    // Enhanced markdown to HTML conversion with feature toggle support
    const renderMarkdown = (content: string): string => {
      if (!content) return '';

      let html = content;

      // HTML support (respect HTML setting) - handle early if disabled
      if (!markdownModule.enable_html) {
        // Escape HTML tags if HTML is disabled (but preserve markdown syntax)
        html = html.replace(
          /<(?![/]?(h[1-6]|p|strong|em|code|pre|blockquote|ul|ol|li|a|hr|table|thead|tbody|tr|th|td)\b)[^>]*>/g,
          match => {
            return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
        );
      }

      html = html
        // Headers (support H1-H6)
        .replace(/^#{6} (.*$)/gim, '<h6>$1</h6>')
        .replace(/^#{5} (.*$)/gim, '<h5>$1</h5>')
        .replace(/^#{4} (.*$)/gim, '<h4>$1</h4>')
        .replace(/^#{3} (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#{2} (.*$)/gim, '<h2>$1</h2>')
        .replace(/^#{1} (.*$)/gim, '<h1>$1</h1>')
        // Bold and italic (order matters)
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gim, '<hr>')
        .replace(/^\*\*\*$/gim, '<hr>');

      // Code blocks and inline code (respect code highlighting setting)
      if (markdownModule.enable_code_highlighting !== false) {
        // Code blocks (triple backticks)
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
          const className = lang ? ` class="language-${lang}"` : '';
          return `<pre><code${className}>${code.trim()}</code></pre>`;
        });
        // Inline code
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
      } else {
        // Simple code formatting without highlighting
        html = html.replace(/```[\s\S]*?```/g, match => {
          const code = match.replace(/```(\w+)?\n?/, '').replace(/```$/, '');
          return `<pre><code>${code.trim()}</code></pre>`;
        });
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
      }

      // Tables (respect table setting)
      if (markdownModule.enable_tables !== false) {
        // Simple table parsing
        const lines = html.split('\n');
        let inTable = false;
        let tableHtml = '';
        let processedLines: string[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.includes('|') && line.split('|').length > 2) {
            if (!inTable) {
              inTable = true;
              tableHtml = '<table>';
              // Check if next line is a separator
              const nextLine = lines[i + 1]?.trim();
              const isHeader = nextLine && /^[\|\-\s:]+$/.test(nextLine);

              if (isHeader) {
                tableHtml += '<thead>';
                const cells = line.split('|').filter(cell => cell.trim());
                tableHtml += '<tr>';
                cells.forEach(cell => {
                  tableHtml += `<th>${cell.trim()}</th>`;
                });
                tableHtml += '</tr></thead><tbody>';
                i++; // Skip separator line
              } else {
                tableHtml += '<tbody>';
                const cells = line.split('|').filter(cell => cell.trim());
                tableHtml += '<tr>';
                cells.forEach(cell => {
                  tableHtml += `<td>${cell.trim()}</td>`;
                });
                tableHtml += '</tr>';
              }
            } else {
              const cells = line.split('|').filter(cell => cell.trim());
              tableHtml += '<tr>';
              cells.forEach(cell => {
                tableHtml += `<td>${cell.trim()}</td>`;
              });
              tableHtml += '</tr>';
            }
          } else {
            if (inTable) {
              inTable = false;
              tableHtml += '</tbody></table>';
              processedLines.push(tableHtml);
              tableHtml = '';
            }
            processedLines.push(line);
          }
        }

        if (inTable) {
          tableHtml += '</tbody></table>';
          processedLines.push(tableHtml);
        }

        html = processedLines.join('\n');
      }

      // Line breaks (preserve double newlines as paragraphs)
      html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>');

      // Wrap in paragraph tags
      html = '<p>' + html + '</p>';

      // Clean up empty paragraphs and fix nesting
      html = html.replace(/<p><\/p>/g, '');
      html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
      html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1');
      html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
      html = html.replace(/<p>(<table>[\s\S]*?<\/table>)<\/p>/g, '$1');
      html = html.replace(/<p>(<pre>[\s\S]*?<\/pre>)<\/p>/g, '$1');

      // Lists (improved implementation)
      html = html.replace(/^[-*+] (.*$)/gim, '<li>$1</li>');
      html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

      // Wrap consecutive <li> elements in <ul>
      html = html.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, '<ul>$1</ul>');

      return html;
    };

    const content = renderMarkdown(markdownModule.markdown_content || '');

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

    const element = html`<div class="markdown-content" .innerHTML=${content}></div>`;

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
      .markdown-module-preview {
        min-height: 20px;
        word-wrap: break-word;
      }
      

      .markdown-content {
        width: 100%;
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

      .markdown-content h1,
      .markdown-content h2,
      .markdown-content h3,
      .markdown-content h4,
      .markdown-content h5,
      .markdown-content h6 {
        margin: 16px 0 8px 0;
        font-weight: 600;
        line-height: 1.2;
      }

      .markdown-content h1 { font-size: 2em; }
      .markdown-content h2 { font-size: 1.5em; }
      .markdown-content h3 { font-size: 1.25em; }
      .markdown-content h4 { font-size: 1.1em; }
      .markdown-content h5 { font-size: 1em; font-weight: 700; }
      .markdown-content h6 { font-size: 0.9em; font-weight: 700; }

      .markdown-content p {
        margin: 8px 0;
        line-height: inherit;
      }

      .markdown-content ul,
      .markdown-content ol {
        margin: 8px 0;
        padding-left: 20px;
      }

      .markdown-content li {
        margin: 4px 0;
        line-height: inherit;
      }

      .markdown-content code {
        background: var(--secondary-background-color);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
      }

      .markdown-content blockquote {
        border-left: 4px solid var(--primary-color);
        margin: 16px 0;
        padding: 8px 16px;
        background: var(--secondary-background-color);
        font-style: italic;
      }

      .markdown-content a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .markdown-content a:hover {
        text-decoration: underline;
      }

      .markdown-content strong {
        font-weight: 600;
      }

      .markdown-content em {
        font-style: italic;
      }

      .markdown-content br {
        line-height: inherit;
      }
      
      .markdown-content hr {
        border: none;
        border-top: 1px solid var(--divider-color);
        margin: 16px 0;
      }
      
      .markdown-content table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }
      
      .markdown-content th,
      .markdown-content td {
        border: 1px solid var(--divider-color);
        padding: 8px 12px;
        text-align: left;
      }
      
      .markdown-content th {
        background: var(--secondary-background-color);
        font-weight: 600;
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
