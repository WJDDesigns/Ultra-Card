import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { haTemplateAutocomplete } from '../utils/ha-autocomplete';

/**
 * Ultra Template Editor Component
 * A CodeMirror-based template editor for Home Assistant templates
 * with syntax highlighting and intelligent autocomplete
 */
@customElement('ultra-template-editor')
export class UltraTemplateEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ type: String }) public value = '';
  @property({ type: String }) public placeholder = '';
  @property({ type: Number }) public minHeight = 100;
  @property({ type: Number }) public maxHeight = 400;

  @state() private _editor?: EditorView;
  private _isUpdating = false;
  private _userIsTyping = false;

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      .editor-container {
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
        background: var(--code-editor-background-color, var(--card-background-color));
      }

      .cm-editor {
        font-family: 'Courier New', Consolas, Monaco, monospace;
        font-size: 13px;
      }

      .cm-scroller {
        overflow: auto;
      }

      .cm-content {
        padding: 8px 0;
      }

      .cm-line {
        padding: 0 8px;
      }

      /* Theme integration with Home Assistant */
      .cm-editor.cm-focused {
        outline: 2px solid var(--primary-color);
        outline-offset: -1px;
      }

      /* Autocomplete styling - force proper z-index and colors */
      .cm-tooltip-autocomplete {
        background: var(--card-background-color) !important;
        border: 1px solid var(--divider-color) !important;
        border-radius: 4px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
        z-index: 1000 !important;
      }

      .cm-tooltip.cm-tooltip-autocomplete > ul {
        background: var(--card-background-color) !important;
      }

      .cm-tooltip.cm-tooltip-autocomplete > ul > li {
        color: var(--primary-text-color) !important;
        background: transparent !important;
      }

      .cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected] {
        background: var(--primary-color) !important;
        color: var(--text-primary-color, white) !important;
      }

      .cm-completionLabel {
        color: var(--primary-text-color) !important;
      }

      .cm-completionDetail {
        color: var(--secondary-text-color) !important;
        font-style: italic;
        opacity: 0.8;
      }

      .cm-completionInfo {
        background: var(--secondary-background-color) !important;
        border: 1px solid var(--divider-color) !important;
        color: var(--primary-text-color) !important;
      }

      /* Syntax highlighting for light theme */
      :host-context([data-theme='light']) .cm-editor,
      .cm-editor {
        --cm-keyword: #0000ff;
        --cm-function: #795e26;
        --cm-variable: #001080;
        --cm-string: #a31515;
        --cm-number: #098658;
        --cm-comment: #008000;
        --cm-operator: #000000;
        --cm-bracket: #0431fa;
        --cm-property: #001080;
        --cm-atom: #0000ff;
        color: var(--primary-text-color);
      }

      /* Syntax highlighting for dark theme */
      :host-context([data-theme='dark']) .cm-editor,
      :host([theme='dark']) .cm-editor {
        --cm-keyword: #569cd6;
        --cm-function: #dcdcaa;
        --cm-variable: #9cdcfe;
        --cm-string: #ce9178;
        --cm-number: #b5cea8;
        --cm-comment: #6a9955;
        --cm-operator: #d4d4d4;
        --cm-bracket: #ffd700;
        --cm-property: #9cdcfe;
        --cm-atom: #569cd6;
        color: var(--primary-text-color);
      }

      .cm-keyword {
        color: var(--cm-keyword);
        font-weight: bold;
      }

      .cm-function {
        color: var(--cm-function);
      }

      .cm-variableName {
        color: var(--cm-variable);
      }

      .cm-string {
        color: var(--cm-string);
      }

      .cm-number {
        color: var(--cm-number);
      }

      .cm-comment {
        color: var(--cm-comment);
        font-style: italic;
      }

      .cm-operator {
        color: var(--cm-operator);
      }

      .cm-bracket {
        color: var(--cm-bracket);
      }

      .cm-propertyName {
        color: var(--cm-property);
      }

      .cm-atom {
        color: var(--cm-atom);
      }

      /* Placeholder styling */
      .cm-placeholder {
        color: var(--secondary-text-color);
        opacity: 0.6;
      }

      /* Selection */
      .cm-selectionBackground {
        background: var(--primary-color) !important;
        opacity: 0.3;
      }

      .cm-focused .cm-selectionBackground {
        background: var(--primary-color) !important;
        opacity: 0.3;
      }

      /* Cursor - make it highly visible */
      .cm-cursor,
      .cm-cursor-primary {
        border-left: 2px solid var(--primary-text-color) !important;
        border-left-color: var(--primary-text-color) !important;
        margin-left: -1px;
      }

      .cm-focused .cm-cursor,
      .cm-focused .cm-cursor-primary {
        border-left: 2px solid var(--primary-color) !important;
        border-left-color: var(--primary-color) !important;
      }

      /* Active line */
      .cm-activeLine {
        background: var(--secondary-background-color);
      }

      /* Gutters */
      .cm-gutters {
        background: var(--secondary-background-color);
        border-right: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
      }

      .cm-lineNumbers .cm-gutterElement {
        padding: 0 8px;
      }
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this._initializeEditor();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // Prevent updates while editor is being used or while we're already updating
    if (this._isUpdating || this._userIsTyping) {
      return;
    }

    // Update editor value if it changed externally (but not from user input)
    if (changedProperties.has('value') && this._editor) {
      const currentValue = this._editor.state.doc.toString();
      const hasFocus = this._editor.hasFocus;

      // Only update if value actually differs and editor is not in use
      if (currentValue !== this.value && !hasFocus && !this._userIsTyping) {
        this._isUpdating = true;

        // Store cursor position
        const selection = this._editor.state.selection.main;

        this._editor.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: this.value,
          },
          // Restore cursor position if it's still valid
          selection: selection.from <= this.value.length ? selection : undefined,
        });

        this._isUpdating = false;
      }
    }

    // Only reinitialize if hass actually changed AND editor is not focused
    if (changedProperties.has('hass') && this._editor && this.hass) {
      const oldHass = changedProperties.get('hass') as HomeAssistant | undefined;

      // Don't reinitialize if just updating hass reference (check if states changed)
      const statesChanged =
        !oldHass ||
        Object.keys(oldHass.states || {}).length !== Object.keys(this.hass.states || {}).length;

      if (statesChanged && !this._editor.hasFocus && !this._userIsTyping) {
        const hadFocus = this._editor.hasFocus;
        const selection = this._editor.state.selection.main;

        this._reinitializeEditor();

        if (hadFocus && selection) {
          // Restore focus and cursor position after reinit
          requestAnimationFrame(() => {
            if (this._editor && selection.from <= this._editor.state.doc.length) {
              this._editor.focus();
              this._editor.dispatch({
                selection: { anchor: selection.from, head: selection.to },
              });
            }
          });
        }
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._destroyEditor();
  }

  private _initializeEditor(): void {
    const container = this.shadowRoot?.querySelector('.editor-container');
    if (!container) return;

    const extensions: Extension[] = [
      // Basic setup with line numbers, folding, etc.
      EditorView.lineWrapping,
      keymap.of([...defaultKeymap, indentWithTab]),

      // Language support (JavaScript as base, could be extended for Jinja2)
      javascript(),

      // Autocomplete with Home Assistant context
      autocompletion({
        override: this.hass ? [haTemplateAutocomplete(this.hass)] : [],
        activateOnTyping: true,
        maxRenderedOptions: 20,
        closeOnBlur: false, // Don't close on blur to prevent focus issues
      }),

      // Placeholder support
      EditorView.contentAttributes.of({
        'aria-placeholder': this.placeholder,
      }),

      // Handle value changes - don't update on every keystroke to prevent focus loss
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          // Mark that user is typing to prevent external updates
          this._userIsTyping = true;

          const newValue = update.state.doc.toString();
          if (newValue !== this.value && !this._isUpdating) {
            this.value = newValue;
            // Use requestAnimationFrame to avoid focus issues
            requestAnimationFrame(() => {
              this._dispatchValueChanged(newValue);
              // Clear typing flag after a short delay
              setTimeout(() => {
                this._userIsTyping = false;
              }, 150);
            });
          }
        }
      }),

      // Track focus state to prevent updates while focused
      EditorView.focusChangeEffect.of((state, focusing) => {
        if (focusing) {
          this._userIsTyping = true;
        }
        return null;
      }),

      // Height constraints
      EditorView.theme({
        '&': {
          minHeight: `${this.minHeight}px`,
          maxHeight: `${this.maxHeight}px`,
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
        '.cm-content': {
          caretColor: 'var(--primary-color)',
        },
        '.cm-cursor, .cm-dropCursor': {
          borderLeftColor: 'var(--primary-color)',
        },
      }),
    ];

    const state = EditorState.create({
      doc: this.value,
      extensions,
    });

    this._editor = new EditorView({
      state,
      parent: container as HTMLElement,
    });
  }

  private _reinitializeEditor(): void {
    this._destroyEditor();
    this._initializeEditor();
  }

  private _destroyEditor(): void {
    if (this._editor) {
      this._editor.destroy();
      this._editor = undefined;
    }
  }

  private _dispatchValueChanged(value: string): void {
    // Don't dispatch if template is incomplete and editor lost focus
    if (
      (!this._editor?.hasFocus && value.trim() && value.includes('{{') && !value.includes('}}')) ||
      (value.includes('}}') && !value.includes('{{'))
    ) {
      return; // Skip incomplete templates on blur
    }

    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value },
        bubbles: true,
        composed: true,
      })
    );
  }

  public focus(): void {
    if (this._editor) {
      this._editor.focus();
    }
  }

  render() {
    return html` <div class="editor-container"></div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-template-editor': UltraTemplateEditor;
  }
}
