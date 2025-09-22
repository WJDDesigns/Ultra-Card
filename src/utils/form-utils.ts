import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';

// Module-level change guard to prevent infinite loops
let _formChangeGuard = false;

/**
 * Utility class for rendering clean forms without redundant labels
 * Eliminates the duplicate field names that appear above custom field titles
 */
export class FormUtils {
  private static activeObservers = new Map<string, MutationObserver>();
  private static cleanupQueue = new Set<string>();

  /**
   * Renders a clean ha-form without redundant labels
   * @param hass Home Assistant instance
   * @param data Form data object
   * @param schema Form schema array
   * @param onChange Value change handler
   * @returns Clean form template with hidden redundant labels
   */
  static renderCleanForm(
    hass: HomeAssistant,
    data: Record<string, any>,
    schema: any[],
    onChange: (e: CustomEvent) => void
  ): TemplateResult {
    console.log('🔧 RENDER CLEAN FORM:', {
      data,
      schema,
      dataKeys: Object.keys(data),
      timestamp: Date.now(),
    });
    // Generate a unique ID for this form instance
    const formId = `clean-form-${Math.random().toString(36).substr(2, 9)}`;

    // Schedule immediate cleanup
    setTimeout(() => {
      const formElement = document.getElementById(formId);
      if (formElement) {
        FormUtils.setupFormObserver(formElement, formId);
        FormUtils.aggressiveCleanup(formElement);
      }
    }, 0);

    // Also schedule delayed cleanup for dynamic content
    setTimeout(() => {
      const formElement = document.getElementById(formId);
      if (formElement) {
        FormUtils.aggressiveCleanup(formElement);
      }
    }, 100);

    return html`
      <div class="ultra-clean-form" id="${formId}">
        <ha-form
          .hass=${hass}
          .data=${data}
          .schema=${schema}
          .computeLabel=${() => ''}
          .computeDescription=${() => ''}
          @value-changed=${(e: CustomEvent) => {
            // Prevent re-entrant calls that cause infinite loops
            if (_formChangeGuard) {
              return;
            }

            _formChangeGuard = true;
            // Use requestAnimationFrame for better performance than setTimeout
            requestAnimationFrame(() => {
              _formChangeGuard = false;
            });

            // Reduced logging for better performance
            // console.log('🔧 FORM VALUE CHANGED:', { event: e, detail: e.detail, value: e.detail.value, data, timestamp: Date.now() });
            onChange(e);
            // Immediate cleanup after value changes
            requestAnimationFrame(() => {
              const element = document.getElementById(formId);
              if (element) {
                FormUtils.aggressiveCleanup(element);
              }
            });
          }}
        ></ha-form>
      </div>
    `;
  }

  /**
   * Sets up a MutationObserver to watch for new form elements and clean them immediately
   */
  private static setupFormObserver(container: HTMLElement, formId: string): void {
    // Clean up any existing observer for this form
    if (FormUtils.activeObservers.has(formId)) {
      FormUtils.activeObservers.get(formId)?.disconnect();
    }

    const observer = new MutationObserver(mutations => {
      let needsCleanup = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              needsCleanup = true;
            }
          });
        }
      });

      if (needsCleanup && !FormUtils.cleanupQueue.has(formId)) {
        FormUtils.cleanupQueue.add(formId);
        setTimeout(() => {
          FormUtils.aggressiveCleanup(container);
          FormUtils.cleanupQueue.delete(formId);
        }, 10);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    FormUtils.activeObservers.set(formId, observer);

    // Clean up observer when container is removed
    setTimeout(() => {
      if (!document.contains(container)) {
        observer.disconnect();
        FormUtils.activeObservers.delete(formId);
      }
    }, 30000); // Clean up after 30 seconds if container is gone
  }

  /**
   * Aggressive cleanup function that removes redundant labels immediately
   */
  private static aggressiveCleanup(container: HTMLElement): void {
    if (!container) return;

    const redundantTexts = [
      'action',
      'entity',
      'template_mode',
      'icon',
      'name',
      'value',
      'text',
      'url',
      'path',
      'attribute',
      'state',
      'condition',
      'enabled',
      'disabled',
      'template',
      'mode',
      'type',
      'size',
      'color',
      'style',
      'width',
      'height',
      'radius',
      'opacity',
      'service',
      'data',
      'latitude',
      'longitude',
      'navigation_path',
      'show_icon',
      'label',
      'button',
    ];

    // Find the ha-form element
    const haForm = container.querySelector('ha-form');
    if (!haForm) return;

    // Method 1: Remove all text nodes that contain only redundant text
    const walker = document.createTreeWalker(haForm, NodeFilter.SHOW_TEXT, null);

    const textNodesToRemove: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim().toLowerCase();
      if (text && redundantTexts.includes(text)) {
        textNodesToRemove.push(node as Text);
      }
    }

    textNodesToRemove.forEach(textNode => {
      const parent = textNode.parentElement;
      if (parent) {
        // Check if this text node is likely a redundant label
        const hasFormControl = parent.querySelector(
          'input, select, ha-entity-picker, ha-selector, mwc-select, mwc-textfield'
        );
        const isSmallText = textNode.textContent && textNode.textContent.trim().length < 30;

        if (
          isSmallText &&
          (hasFormControl ||
            parent.parentElement?.querySelector('input, select, ha-entity-picker, ha-selector'))
        ) {
          textNode.remove();
        }
      }
    });

    // Method 2: Hide elements that only contain redundant text
    const allElements = haForm.querySelectorAll('*');
    allElements.forEach(element => {
      const text = element.textContent?.trim().toLowerCase();

      if (text && redundantTexts.includes(text) && element.children.length === 0) {
        // This is a text-only element with redundant content
        const hasFormControlSibling = element.parentElement?.querySelector(
          'input, select, ha-entity-picker, ha-selector'
        );

        if (hasFormControlSibling) {
          (element as HTMLElement).style.cssText =
            'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; margin: 0 !important; padding: 0 !important;';
        }
      }
    });

    // Method 3: Target specific HA form label patterns
    const problematicSelectors = [
      'div[role="group"] > div:first-child:not([class])',
      'div[role="group"] > span:first-child:not([class])',
      '.mdc-form-field__label',
      '.mdc-text-field__label',
      '.mdc-select__label',
      'label:not([for])',
      'div:not([class]):not([id])',
      'span:not([class]):not([id])',
    ];

    problematicSelectors.forEach(selector => {
      try {
        const elements = haForm.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent?.trim().toLowerCase();
          if (text && redundantTexts.includes(text)) {
            (element as HTMLElement).style.cssText = 'display: none !important;';
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });

    // Method 4: Special handling for MDC components
    const mdcElements = haForm.querySelectorAll('[class*="mdc-"]');
    mdcElements.forEach(element => {
      const text = element.textContent?.trim().toLowerCase();
      if (text && redundantTexts.includes(text) && element.children.length === 0) {
        const isLabel =
          element.classList.contains('mdc-floating-label') ||
          element.classList.contains('mdc-form-field__label') ||
          element.classList.contains('mdc-text-field__label');

        if (isLabel) {
          (element as HTMLElement).style.cssText = 'display: none !important;';
        }
      }
    });

    // Method 5: Remove any remaining standalone redundant text
    setTimeout(() => {
      const finalWalker = document.createTreeWalker(haForm, NodeFilter.SHOW_TEXT, null);

      const finalTextNodes: Text[] = [];
      let finalNode;
      while ((finalNode = finalWalker.nextNode())) {
        const text = finalNode.textContent?.trim().toLowerCase();
        if (text && redundantTexts.includes(text)) {
          finalTextNodes.push(finalNode as Text);
        }
      }

      finalTextNodes.forEach(textNode => {
        if (textNode.parentNode) {
          textNode.textContent = '';
        }
      });
    }, 50);
  }

  /**
   * Gets the CSS styles needed to hide redundant form labels
   * @returns CSS string for clean form styling
   */
  static getCleanFormStyles(): string {
    return `
      /* Ultra-aggressive label hiding */
      .ultra-clean-form ha-form label,
      .ultra-clean-form ha-form .label,
      .ultra-clean-form ha-form .mdc-floating-label,
      .ultra-clean-form ha-form .mdc-text-field__label,
      .ultra-clean-form ha-form .mdc-select__label,
      .ultra-clean-form ha-form .mdc-form-field__label,
      .ultra-clean-form ha-form .ha-form-label,
      .ultra-clean-form ha-form .mdc-notched-outline__leading,
      .ultra-clean-form ha-form .mdc-notched-outline__notch,
      .ultra-clean-form ha-form .mdc-notched-outline__trailing,
      .ultra-clean-form ha-form .mdc-line-ripple {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }

      /* Override any existing label styles completely */
      .ultra-clean-form label,
      .ultra-clean-form .ultra-clean-form label *,
      .ultra-clean-form ha-form label,
      .ultra-clean-form ha-form label * {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        background: none !important;
        font-size: 0 !important;
        line-height: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        z-index: -1 !important;
        pointer-events: none !important;
      }

      /* Hide any text that could be a redundant label */
      .ultra-clean-form ha-form div:not([class]):not([id]),
      .ultra-clean-form ha-form span:not([class]):not([id]),
      .ultra-clean-form ha-form p:not([class]):not([id]) {
        font-size: 0 !important;
        line-height: 0 !important;
        color: transparent !important;
        height: 0 !important;
        overflow: hidden !important;
      }

      /* Make sure form inputs still work */
      .ultra-clean-form ha-form input,
      .ultra-clean-form ha-form select,
      .ultra-clean-form ha-form textarea,
      .ultra-clean-form ha-form ha-entity-picker,
      .ultra-clean-form ha-form ha-icon-picker,
      .ultra-clean-form ha-form ha-selector,
      .ultra-clean-form ha-form .mdc-text-field,
      .ultra-clean-form ha-form .mdc-select,
      .ultra-clean-form ha-form .mdc-switch {
        font-size: 14px !important;
        line-height: normal !important;
        color: var(--primary-text-color) !important;
        height: auto !important;
        width: auto !important;
        margin-top: 0 !important;
        border-radius: 8px !important;
      }

      /* Ensure dropdowns work */
      .ultra-clean-form ha-form .mdc-select__selected-text,
      .ultra-clean-form ha-form .mdc-select__dropdown-icon {
        font-size: 14px !important;
        color: var(--primary-text-color) !important;
        opacity: 1 !important;
        height: auto !important;
        width: auto !important;
      }

      /* Style field titles and descriptions consistently */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
       
        margin-bottom: 4px !important;
        display: block !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
    `;
  }

  /**
   * JavaScript-based cleanup to remove redundant text nodes
   * Call this after rendering forms as a backup solution
   */
  static cleanupRedundantLabels(containerElement: HTMLElement): void {
    FormUtils.aggressiveCleanup(containerElement);
  }

  /**
   * Renders a field with title, description, and clean form
   * @param title Field title
   * @param description Field description
   * @param hass Home Assistant instance
   * @param data Form data
   * @param schema Form schema
   * @param onChange Change handler
   * @returns Complete field template
   */
  static renderField(
    title: string,
    description: string,
    hass: HomeAssistant,
    data: Record<string, any>,
    schema: any[],
    onChange: (e: CustomEvent) => void
  ): TemplateResult {
    return html`
      <div class="form-field-container">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${title}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; font-weight: 400; margin-bottom: 12px; color: var(--secondary-text-color);"
        >
          ${description}
        </div>
        ${FormUtils.renderCleanForm(hass, data, schema, onChange)}
      </div>
    `;
  }

  /**
   * Creates a schema item with consistent structure
   * @param name Field name
   * @param selector Selector configuration
   * @returns Schema item without redundant label
   */
  static createSchemaItem(name: string, selector: any): any {
    return {
      name,
      selector,
      // Explicitly remove label to prevent redundant display
    };
  }

  /**
   * Renders a complete form section with title, description, and multiple fields
   * @param title Section title
   * @param description Section description
   * @param fields Array of field configurations
   * @returns Complete section template
   */
  static renderSection(
    title: string,
    description: string,
    fields: Array<{
      title: string;
      description: string;
      hass: HomeAssistant;
      data: Record<string, any>;
      schema: any[];
      onChange: (e: CustomEvent) => void;
    }>
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
        >
          ${title}
        </div>
        ${description
          ? html`
              <div
                class="field-description"
                style="font-size: 13px; font-weight: 400; margin-bottom: 16px; color: var(--secondary-text-color);"
              >
                ${description}
              </div>
            `
          : ''}
        ${fields.map(
          field => html`
            <div style="margin-bottom: 16px;">
              ${FormUtils.renderField(
                field.title,
                field.description,
                field.hass,
                field.data,
                field.schema,
                field.onChange
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  /**
   * Injects the clean form styles into a component
   * @returns Style template with clean form CSS
   */
  static injectCleanFormStyles(): TemplateResult {
    return html`
      <style>
        ${FormUtils.getCleanFormStyles()}
      </style>
    `;
  }
}
