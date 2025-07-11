import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, MarkdownModule, UltraCardConfig } from '../types';

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

  createDefault(id?: string): MarkdownModule {
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

> This is a blockquote example`,
      link: '',
      hide_if_no_link: false,
      template_mode: false,
      template: '',
      enable_html: false,
      enable_tables: true,
      enable_code_highlighting: true,
      max_height: 'none',
      overflow_behavior: 'visible',
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const markdownModule = module as MarkdownModule;

    return html`
      <div class="module-general-settings">
        <!-- Content Section -->
        <div class="wpbakery-section">
          <h4>Markdown Content</h4>
          <div class="ha-form-field">
            <ha-form
              .hass=${hass}
              .data=${{ markdown_content: markdownModule.markdown_content || '' }}
              .schema=${[
                {
                  name: 'markdown_content',
                  label: 'Content',
                  description: 'Enter your markdown content with full formatting support',
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

        <!-- Link & Behavior Section -->
        <div class="wpbakery-section">
          <h4>Link & Behavior</h4>
          <div class="two-column-grid">
            <div class="ha-form-field">
              <ha-form
                .hass=${hass}
                .data=${{ link: markdownModule.link || '' }}
                .schema=${[
                  {
                    name: 'link',
                    label: 'Link URL',
                    description: 'Optional URL to make the markdown clickable',
                    selector: { text: {} },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || schema.name}
                .computeDescription=${(schema: any) => schema.description || ''}
                @value-changed=${(e: CustomEvent) => updateModule({ link: e.detail.value.link })}
              ></ha-form>
            </div>
            <div class="ha-form-field">
              <ha-form
                .hass=${hass}
                .data=${{ hide_if_no_link: markdownModule.hide_if_no_link || false }}
                .schema=${[
                  {
                    name: 'hide_if_no_link',
                    label: 'Hide if No Link',
                    description: 'Hide module when no link is provided',
                    selector: { boolean: {} },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || schema.name}
                .computeDescription=${(schema: any) => schema.description || ''}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ hide_if_no_link: e.detail.value.hide_if_no_link })}
              ></ha-form>
            </div>
          </div>
        </div>

        <!-- Display Options Section -->
        <div class="wpbakery-section">
          <h4>Display Options</h4>
          <div class="two-column-grid">
            <div class="ha-form-field">
              <ha-form
                .hass=${hass}
                .data=${{ max_height: markdownModule.max_height || 'none' }}
                .schema=${[
                  {
                    name: 'max_height',
                    label: 'Max Height',
                    description: 'Maximum height (e.g., 300px, 50vh, none)',
                    selector: { text: {} },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || schema.name}
                .computeDescription=${(schema: any) => schema.description || ''}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ max_height: e.detail.value.max_height })}
              ></ha-form>
            </div>
            <div class="ha-form-field">
              <ha-form
                .hass=${hass}
                .data=${{ overflow_behavior: markdownModule.overflow_behavior || 'visible' }}
                .schema=${[
                  {
                    name: 'overflow_behavior',
                    label: 'Overflow Behavior',
                    selector: {
                      select: {
                        options: [
                          { value: 'visible', label: 'Visible' },
                          { value: 'scroll', label: 'Scroll' },
                          { value: 'hidden', label: 'Hidden' },
                        ],
                        mode: 'dropdown',
                      },
                    },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || schema.name}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ overflow_behavior: e.detail.value.overflow_behavior })}
              ></ha-form>
            </div>
          </div>

          <!-- Feature Toggles -->
          <div class="three-column-grid">
            <ha-form
              .hass=${hass}
              .data=${{ enable_html: markdownModule.enable_html || false }}
              .schema=${[
                {
                  name: 'enable_html',
                  label: 'Enable HTML',
                  description: 'Allow HTML tags in markdown',
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ enable_html: e.detail.value.enable_html })}
            ></ha-form>

            <ha-form
              .hass=${hass}
              .data=${{ enable_tables: markdownModule.enable_tables !== false }}
              .schema=${[
                {
                  name: 'enable_tables',
                  label: 'Enable Tables',
                  description: 'Support for markdown tables',
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ enable_tables: e.detail.value.enable_tables })}
            ></ha-form>

            <ha-form
              .hass=${hass}
              .data=${{
                enable_code_highlighting: markdownModule.enable_code_highlighting !== false,
              }}
              .schema=${[
                {
                  name: 'enable_code_highlighting',
                  label: 'Code Highlighting',
                  description: 'Syntax highlighting for code blocks',
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ enable_code_highlighting: e.detail.value.enable_code_highlighting })}
            ></ha-form>
          </div>
        </div>

        <!-- Template Mode Section -->
        <div class="wpbakery-section">
          <h4>Template Mode</h4>

          <ha-form
            .hass=${hass}
            .data=${{ template_mode: markdownModule.template_mode || false }}
            .schema=${[
              {
                name: 'template_mode',
                label: 'Enable Template Mode',
                description: 'Use Home Assistant Jinja2 templates for dynamic content',
                selector: { boolean: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label || schema.name}
            .computeDescription=${(schema: any) => schema.description || ''}
            @value-changed=${(e: CustomEvent) =>
              updateModule({ template_mode: e.detail.value.template_mode })}
          ></ha-form>

          ${markdownModule.template_mode
            ? html`
                <div style="margin-top: 16px;">
                  <ha-form
                    .hass=${hass}
                    .data=${{ template: markdownModule.template || '' }}
                    .schema=${[
                      {
                        name: 'template',
                        label: 'Template',
                        description:
                          'Jinja2 template for dynamic content (e.g., {{ states("sensor.temperature") }}°C)',
                        selector: { text: { multiline: true } },
                      },
                    ]}
                    .computeLabel=${(schema: any) => schema.label || schema.name}
                    .computeDescription=${(schema: any) => schema.description || ''}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ template: e.detail.value.template })}
                  ></ha-form>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const markdownModule = module as MarkdownModule;

    // Check if element should be hidden when no link
    if (
      markdownModule.hide_if_no_link &&
      (!markdownModule.link || markdownModule.link.trim() === '')
    ) {
      return html`<div class="markdown-module-hidden">Hidden (no link)</div>`;
    }

    // Apply design properties with priority
    const moduleWithDesign = markdownModule as any;

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
      background:
        moduleWithDesign.background_color && moduleWithDesign.background_color !== 'transparent'
          ? moduleWithDesign.background_color
          : 'transparent',
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border:
        moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none'
          ? `${moduleWithDesign.border_width || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0',
      position: moduleWithDesign.position || 'static',
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

    const contentStyles = {
      fontSize: moduleWithDesign.font_size
        ? `${moduleWithDesign.font_size}px`
        : `${markdownModule.font_size || 14}px`,
      fontFamily: moduleWithDesign.font_family || markdownModule.font_family || 'Roboto',
      color: moduleWithDesign.color || markdownModule.color || 'var(--primary-text-color)',
      textAlign: moduleWithDesign.text_align || markdownModule.alignment || 'left',
      lineHeight: moduleWithDesign.line_height || markdownModule.line_height || 1.6,
      letterSpacing: moduleWithDesign.letter_spacing || markdownModule.letter_spacing || 'normal',
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${moduleWithDesign.padding_top || '8'}px ${moduleWithDesign.padding_right || '0'}px ${moduleWithDesign.padding_bottom || '8'}px ${moduleWithDesign.padding_left || '0'}px`
          : '8px 0',
      maxHeight:
        markdownModule.max_height && markdownModule.max_height !== 'none'
          ? markdownModule.max_height
          : 'none',
      overflow:
        markdownModule.max_height && markdownModule.max_height !== 'none'
          ? markdownModule.overflow_behavior || 'visible'
          : 'visible',
      // Shadow effects
      textShadow:
        moduleWithDesign.text_shadow_h && moduleWithDesign.text_shadow_v
          ? `${moduleWithDesign.text_shadow_h || '0'} ${moduleWithDesign.text_shadow_v || '0'} ${moduleWithDesign.text_shadow_blur || '0'} ${moduleWithDesign.text_shadow_color || 'rgba(0,0,0,0.5)'}`
          : 'none',
      boxShadow:
        moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
          ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
    };

    // Enhanced markdown to HTML conversion
    const renderMarkdown = (content: string): string => {
      if (!content) return '';

      let html = content
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
        // Inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gim, '<hr>')
        .replace(/^\*\*\*$/gim, '<hr>')
        // Line breaks (preserve double newlines as paragraphs)
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');

      // Wrap in paragraph tags
      html = '<p>' + html + '</p>';

      // Clean up empty paragraphs
      html = html.replace(/<p><\/p>/g, '');
      html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
      html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1');
      html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

      // Lists (improved implementation)
      html = html.replace(/^[-*+] (.*$)/gim, '<li>$1</li>');
      html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

      // Wrap consecutive <li> elements in <ul>
      html = html.replace(/(<li>[\s\S]*?<\/li>(?:\s*<li>[\s\S]*?<\/li>)*)/g, '<ul>$1</ul>');

      return html;
    };

    const content =
      markdownModule.template_mode && markdownModule.template
        ? `Template: ${markdownModule.template}`
        : renderMarkdown(markdownModule.markdown_content || '');

    const element =
      markdownModule.link && markdownModule.link.trim() !== ''
        ? html`<a href="${markdownModule.link}" style="color: inherit; text-decoration: inherit;">
            <div class="markdown-content" .innerHTML=${content}></div>
          </a>`
        : html`<div class="markdown-content" .innerHTML=${content}></div>`;

    return html`
      <div class="markdown-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="markdown-module-preview" style=${this.styleObjectToCss(contentStyles)}>
          ${element}
        </div>
      </div>
    `;
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
      
      .markdown-module-hidden {
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 4px;
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
