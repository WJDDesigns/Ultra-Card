import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Z_INDEX } from '../utils/uc-z-index';

@customElement('ultra-wysiwyg-editor')
export class UltraWysiwygEditor extends LitElement {
  @property({ type: String }) public content = '';
  @property({ type: String }) public placeholder = 'Start typing...';
  @property({ type: Boolean }) public disabled = false;
  @property({ attribute: false }) public editorStyles: Record<string, string> = {};

  @state() private _editor: Editor | null = null;
  @state() private _isBold = false;
  @state() private _isItalic = false;
  @state() private _isUnderline = false;
  @state() private _isStrike = false;
  @state() private _textAlign = 'left';
  @state() private _isLink = false;
  @state() private _showLinkInput = false;
  @state() private _linkUrl = '';
  @state() private _showColorPicker = false;
  @state() private _showHighlightPicker = false;
  @state() private _currentColor = '';
  @state() private _currentHighlight = '';

  private _isUpdating = false;
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  static override get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      .wysiwyg-container {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--card-background-color, #fff);
      }

      .wysiwyg-container:focus-within {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 6px 8px;
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
        align-items: center;
      }

      .toolbar-group {
        display: flex;
        gap: 2px;
        align-items: center;
      }

      .toolbar-group + .toolbar-group {
        margin-left: 4px;
        padding-left: 6px;
        border-left: 1px solid var(--divider-color);
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 0;
        transition: background 0.15s ease;
      }

      .toolbar-btn:hover {
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.12);
      }

      .toolbar-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .toolbar-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .toolbar-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .color-btn {
        position: relative;
      }

      .color-indicator {
        width: 14px;
        height: 3px;
        border-radius: 1px;
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
      }

      .color-picker-popup {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: ${Z_INDEX.AUTOCOMPLETE};
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        display: grid;
        grid-template-columns: repeat(6, 28px);
        gap: 4px;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.1s ease, border-color 0.1s ease;
      }

      .color-swatch:hover {
        transform: scale(1.15);
        border-color: var(--primary-color);
      }

      .color-swatch.active {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color);
      }

      .color-swatch.clear-color {
        background: linear-gradient(
          135deg,
          #fff 45%,
          #ff0000 45%,
          #ff0000 55%,
          #fff 55%
        );
        border: 1px solid var(--divider-color);
      }

      .link-input-popup {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: ${Z_INDEX.AUTOCOMPLETE};
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        display: flex;
        gap: 6px;
        align-items: center;
        min-width: 280px;
      }

      .link-input-popup input {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
      }

      .link-input-popup input:focus {
        border-color: var(--primary-color);
      }

      .link-input-popup button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }

      .link-input-popup .remove-link-btn {
        background: var(--error-color, #db4437);
      }

      .editor-content {
        padding: 12px 16px;
        min-height: 80px;
        max-height: 300px;
        overflow-y: auto;
        outline: none;
        font-family: var(--primary-font-family, 'Roboto', sans-serif);
        font-size: 16px;
        line-height: 1.6;
        color: var(--primary-text-color);
      }

      .editor-content .ProseMirror {
        outline: none;
        min-height: 60px;
      }

      .editor-content .ProseMirror p {
        margin: 0 0 0.5em 0;
      }

      .editor-content .ProseMirror p:last-child {
        margin-bottom: 0;
      }

      .editor-content .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: var(--secondary-text-color);
        opacity: 0.5;
        pointer-events: none;
        height: 0;
      }

      .editor-content .ProseMirror a {
        color: var(--primary-color);
        text-decoration: underline;
      }

      .editor-content .ProseMirror mark {
        border-radius: 2px;
        padding: 0 2px;
      }

      .popup-wrapper {
        position: relative;
        display: inline-flex;
      }

      .popup-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: ${Z_INDEX.AUTOCOMPLETE - 1};
      }
    `;
  }

  private static readonly COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC',
    '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF', '#980000', '#FF0000',
    '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF',
    '#9900FF', '#FF00FF', '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC',
    '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  ];

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this._initEditor();
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (this._isUpdating) return;

    if (changedProperties.has('content') && this._editor) {
      const currentHtml = this._editor.getHTML();
      const isEmpty = currentHtml === '<p></p>' && !this.content;
      if (currentHtml !== this.content && !isEmpty && !this._editor.isFocused) {
        this._isUpdating = true;
        this._editor.commands.setContent(this.content || '', { emitUpdate: false });
        this._isUpdating = false;
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._destroyEditor();
  }

  private _initEditor(): void {
    const editorEl = this.shadowRoot?.querySelector('.editor-content');
    if (!editorEl) return;

    this._editor = new Editor({
      element: editorEl as HTMLElement,
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          blockquote: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          horizontalRule: false,
          code: false,
        }),
        Underline,
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({ types: ['paragraph'] }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        }),
      ],
      content: this.content || '',
      editable: !this.disabled,
      onUpdate: ({ editor }) => {
        if (this._isUpdating) return;
        this._updateToolbarState(editor);
        this._emitContentDebounced(editor.getHTML());
      },
      onSelectionUpdate: ({ editor }) => {
        this._updateToolbarState(editor);
      },
      onFocus: () => {
        this._updateToolbarState(this._editor!);
      },
      editorProps: {
        attributes: {
          'data-placeholder': this.placeholder,
        },
      },
    });

    this._updateToolbarState(this._editor);
  }

  private _destroyEditor(): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    if (this._editor) {
      this._editor.destroy();
      this._editor = null;
    }
  }

  private _updateToolbarState(editor: Editor): void {
    this._isBold = editor.isActive('bold');
    this._isItalic = editor.isActive('italic');
    this._isUnderline = editor.isActive('underline');
    this._isStrike = editor.isActive('strike');
    this._isLink = editor.isActive('link');
    this._currentColor = (editor.getAttributes('textStyle').color as string) || '';
    this._currentHighlight = (editor.getAttributes('highlight').color as string) || '';

    if (editor.isActive({ textAlign: 'center' })) this._textAlign = 'center';
    else if (editor.isActive({ textAlign: 'right' })) this._textAlign = 'right';
    else if (editor.isActive({ textAlign: 'justify' })) this._textAlign = 'justify';
    else this._textAlign = 'left';
  }

  private _emitContentDebounced(htmlContent: string): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      const empty = htmlContent === '<p></p>';
      this.dispatchEvent(
        new CustomEvent('content-changed', {
          detail: { value: empty ? '' : htmlContent },
          bubbles: true,
          composed: true,
        })
      );
    }, 150);
  }

  private _toggleBold(): void { this._editor?.chain().focus().toggleBold().run(); }
  private _toggleItalic(): void { this._editor?.chain().focus().toggleItalic().run(); }
  private _toggleUnderline(): void { this._editor?.chain().focus().toggleUnderline().run(); }
  private _toggleStrike(): void { this._editor?.chain().focus().toggleStrike().run(); }

  private _setAlign(align: string): void {
    this._editor?.chain().focus().setTextAlign(align).run();
  }

  private _setColor(color: string): void {
    if (color) {
      this._editor?.chain().focus().setColor(color).run();
    } else {
      this._editor?.chain().focus().unsetColor().run();
    }
    this._showColorPicker = false;
  }

  private _setHighlight(color: string): void {
    if (color) {
      this._editor?.chain().focus().setHighlight({ color }).run();
    } else {
      this._editor?.chain().focus().unsetHighlight().run();
    }
    this._showHighlightPicker = false;
  }

  private _toggleLinkInput(): void {
    if (this._isLink) {
      this._editor?.chain().focus().unsetLink().run();
      this._showLinkInput = false;
    } else {
      this._linkUrl = '';
      this._showLinkInput = !this._showLinkInput;
    }
  }

  private _applyLink(): void {
    if (!this._linkUrl) return;
    let url = this._linkUrl.trim();
    if (url && !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('#')) {
      url = `https://${url}`;
    }
    this._editor?.chain().focus().setLink({ href: url }).run();
    this._showLinkInput = false;
    this._linkUrl = '';
  }

  private _clearFormatting(): void {
    this._editor?.chain().focus().clearNodes().unsetAllMarks().run();
  }

  private _renderColorPalette(
    colors: string[],
    currentColor: string,
    onSelect: (color: string) => void
  ): TemplateResult {
    return html`
      <div class="color-picker-popup" @mousedown=${(e: Event) => e.preventDefault()}>
        <div
          class="color-swatch clear-color ${!currentColor ? 'active' : ''}"
          @click=${() => onSelect('')}
          title="Remove color"
        ></div>
        ${colors.map(
          (c) => html`
            <div
              class="color-swatch ${currentColor === c ? 'active' : ''}"
              style="background: ${c}"
              @click=${() => onSelect(c)}
              title="${c}"
            ></div>
          `
        )}
      </div>
    `;
  }

  private _computeEditorStyle(): string {
    return Object.entries(this.editorStyles)
      .filter(([, v]) => v && v !== 'inherit' && v !== 'none')
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
      .join('; ');
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  private _handleKeyPress(e: KeyboardEvent): void {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  override render() {
    return html`
      <div
        class="wysiwyg-container"
        @keydown=${this._handleKeyDown}
        @keypress=${this._handleKeyPress}
        @mousedown=${(e: Event) => e.stopPropagation()}
        @dragstart=${(e: Event) => e.stopPropagation()}
      >
        <div class="toolbar">
          <!-- Text formatting -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn ${this._isBold ? 'active' : ''}"
              @click=${this._toggleBold}
              title="Bold"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-bold"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._isItalic ? 'active' : ''}"
              @click=${this._toggleItalic}
              title="Italic"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-italic"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._isUnderline ? 'active' : ''}"
              @click=${this._toggleUnderline}
              title="Underline"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-underline"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._isStrike ? 'active' : ''}"
              @click=${this._toggleStrike}
              title="Strikethrough"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-strikethrough"></ha-icon>
            </button>
          </div>

          <!-- Colors -->
          <div class="toolbar-group">
            <div class="popup-wrapper">
              <button
                class="toolbar-btn color-btn"
                @click=${() => {
                  this._showColorPicker = !this._showColorPicker;
                  this._showHighlightPicker = false;
                  this._showLinkInput = false;
                }}
                title="Text color"
                ?disabled=${this.disabled}
              >
                <ha-icon icon="mdi:format-color-text"></ha-icon>
                <span
                  class="color-indicator"
                  style="background: ${this._currentColor || 'var(--primary-text-color)'}"
                ></span>
              </button>
              ${this._showColorPicker
                ? html`
                    <div class="popup-backdrop" @click=${() => (this._showColorPicker = false)}></div>
                    ${this._renderColorPalette(
                      UltraWysiwygEditor.COLORS,
                      this._currentColor,
                      (c) => this._setColor(c)
                    )}
                  `
                : ''}
            </div>
            <div class="popup-wrapper">
              <button
                class="toolbar-btn color-btn"
                @click=${() => {
                  this._showHighlightPicker = !this._showHighlightPicker;
                  this._showColorPicker = false;
                  this._showLinkInput = false;
                }}
                title="Highlight color"
                ?disabled=${this.disabled}
              >
                <ha-icon icon="mdi:format-color-highlight"></ha-icon>
                <span
                  class="color-indicator"
                  style="background: ${this._currentHighlight || 'transparent'}"
                ></span>
              </button>
              ${this._showHighlightPicker
                ? html`
                    <div class="popup-backdrop" @click=${() => (this._showHighlightPicker = false)}></div>
                    ${this._renderColorPalette(
                      UltraWysiwygEditor.COLORS,
                      this._currentHighlight,
                      (c) => this._setHighlight(c)
                    )}
                  `
                : ''}
            </div>
          </div>

          <!-- Alignment -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn ${this._textAlign === 'left' ? 'active' : ''}"
              @click=${() => this._setAlign('left')}
              title="Align left"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-left"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._textAlign === 'center' ? 'active' : ''}"
              @click=${() => this._setAlign('center')}
              title="Align center"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-center"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._textAlign === 'right' ? 'active' : ''}"
              @click=${() => this._setAlign('right')}
              title="Align right"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-right"></ha-icon>
            </button>
            <button
              class="toolbar-btn ${this._textAlign === 'justify' ? 'active' : ''}"
              @click=${() => this._setAlign('justify')}
              title="Justify"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-align-justify"></ha-icon>
            </button>
          </div>

          <!-- Link -->
          <div class="toolbar-group">
            <div class="popup-wrapper">
              <button
                class="toolbar-btn ${this._isLink ? 'active' : ''}"
                @click=${this._toggleLinkInput}
                title="Link"
                ?disabled=${this.disabled}
              >
                <ha-icon icon="mdi:link-variant"></ha-icon>
              </button>
              ${this._showLinkInput
                ? html`
                    <div class="popup-backdrop" @click=${() => (this._showLinkInput = false)}></div>
                    <div class="link-input-popup" @mousedown=${(e: Event) => e.preventDefault()}>
                      <input
                        type="text"
                        placeholder="https://example.com"
                        .value=${this._linkUrl}
                        @input=${(e: Event) => (this._linkUrl = (e.target as HTMLInputElement).value)}
                        @keydown=${(e: KeyboardEvent) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') this._applyLink();
                          if (e.key === 'Escape') this._showLinkInput = false;
                        }}
                      />
                      <button @click=${this._applyLink}>Apply</button>
                    </div>
                  `
                : ''}
            </div>
          </div>

          <!-- Clear formatting -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn"
              @click=${this._clearFormatting}
              title="Clear formatting"
              ?disabled=${this.disabled}
            >
              <ha-icon icon="mdi:format-clear"></ha-icon>
            </button>
          </div>
        </div>

        <div class="editor-content" style=${this._computeEditorStyle()}></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-wysiwyg-editor': UltraWysiwygEditor;
  }
}
