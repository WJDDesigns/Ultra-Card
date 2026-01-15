import { HomeAssistant } from 'custom-card-helpers';
import { ucCustomVariablesService } from './uc-custom-variables-service';
import { UltraCardConfig, CustomVariable } from '../types';

/**
 * Entity Picker Enhancer Service
 * 
 * Provides TWO key features for custom variable support in entity pickers:
 * 
 * 1. DROPDOWN CHIPS: Automatically injects custom variable chips into ALL ha-picker-combo-box 
 *    dropdowns when they open. Chips appear between search input and entity list.
 * 
 * 2. VISUAL INDICATOR: When an entity picker has a variable value ($varname), injects a
 *    visual badge showing the variable name and resolved entity, replacing "Unknown entity".
 * 
 * This provides a seamless UX where variables are always accessible in entity pickers
 * without modifying individual modules.
 * 
 * DOM Structure (from ha-entity-picker):
 * ha-entity-picker → shadow → wa-popover[open] → shadow → ha-picker-combo-box → shadow → 
 *   ha-textfield, .virtualizer-wrapper > lit-virtualizer
 */
class UcEntityPickerEnhancer {
  private _observer: MutationObserver | null = null;
  private _hass: HomeAssistant | null = null;
  private _config: UltraCardConfig | undefined;
  private _initialized = false;
  private _injectedComboBoxes = new WeakSet<Element>();
  private _scanInterval: number | null = null;

  /**
   * Initialize the enhancer with HASS and config context
   */
  initialize(hass: HomeAssistant, config?: UltraCardConfig): void {
    this._hass = hass;
    this._config = config;

    if (this._initialized) {
      return;
    }

    this._initialized = true;
    this._setupObserver();
    
    // Start periodic scanning for open dropdowns
    // This catches dropdowns that might be missed by the observer
    this._scanInterval = window.setInterval(() => {
      this._scanForOpenDropdowns();
    }, 500);
  }

  /**
   * Update the HASS and config context (call on config changes)
   */
  update(hass: HomeAssistant, config?: UltraCardConfig): void {
    this._hass = hass;
    this._config = config;
  }

  /**
   * Cleanup the enhancer
   */
  destroy(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._scanInterval) {
      clearInterval(this._scanInterval);
      this._scanInterval = null;
    }
    this._initialized = false;
    this._injectedComboBoxes = new WeakSet();
  }

  /**
   * Setup MutationObserver to watch for dropdown openings
   */
  private _setupObserver(): void {
    this._observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check for attribute changes (open state)
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          // Check if a popover just opened
          if (target.tagName?.toLowerCase() === 'wa-popover' && target.hasAttribute('open')) {
            this._handlePopoverOpen(target);
          }
        }
        
        // Check added nodes
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              // Check if this is a popover or contains one
              if (node.tagName?.toLowerCase() === 'wa-popover') {
                this._handlePopoverOpen(node);
              }
              // Also check shadow roots of added elements
              this._deepScanElement(node);
            }
          });
        }
      }
    });

    // Observe the entire document
    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    });
  }

  /**
   * Scan document for any open dropdowns containing ha-picker-combo-box
   * AND fix the display of entity pickers that have variable values
   */
  private _scanForOpenDropdowns(): void {
    // Scan all shadow roots in the document for open wa-popovers
    this._deepScanForPopovers(document.body);
    
    // Fix display of entity pickers with variable values
    this._fixVariableEntityPickers();
  }

  /**
   * Find entity pickers with variable values and fix their display
   * by modifying the shadow DOM content directly
   */
  private _fixVariableEntityPickers(): void {
    // Find all ha-entity-picker elements
    this._deepScanForEntityPickers(document.body);
  }

  /**
   * Deep scan for entity pickers with variable values
   */
  private _deepScanForEntityPickers(root: Element | Document): void {
    // Check direct entity pickers
    const pickers = root.querySelectorAll('ha-entity-picker');
    pickers.forEach(picker => this._fixPickerDisplay(picker));

    // Check shadow roots
    const allElements = root.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.shadowRoot) {
        const shadowPickers = el.shadowRoot.querySelectorAll('ha-entity-picker');
        shadowPickers.forEach(picker => this._fixPickerDisplay(picker));
        // Recurse into shadow
        this._deepScanForEntityPickers(el.shadowRoot as unknown as Document);
      }
    });
  }

  /**
   * Fix the display of a single entity picker if it has a variable value
   */
  private _fixPickerDisplay(picker: Element): void {
    const value = (picker as any).value;
    
    // Only process if it's a variable reference
    if (!value || !value.startsWith('$')) {
      // Remove our custom styling if present
      this._removeCustomStyling(picker);
      return;
    }

    // Check if we already styled this picker with the same value
    if ((picker as any).__ucVarValue === value) {
      return;
    }
    (picker as any).__ucVarValue = value;

    // Get variable info
    const varInfo = ucCustomVariablesService.getVariableInfo(value, this._config);
    const isGlobal = varInfo.variable?.isGlobal !== false;
    const resolvedEntity = varInfo.resolvedEntity || 'not configured';

    // Find the shadow root and modify the display
    const shadowRoot = picker.shadowRoot;
    if (!shadowRoot) return;

    // Inject our custom styles
    let styleEl = shadowRoot.querySelector('#uc-var-styles') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'uc-var-styles';
      shadowRoot.appendChild(styleEl);
    }

    styleEl.textContent = `
      /* Override error/warning colors for variable values */
      :host {
        --ha-field-container-error-color: var(--primary-color) !important;
        --ha-color-fill-warning-quiet-resting: transparent !important;
      }
      
      /* Override the unknown warning background */
      :host([unknown]) ha-combo-box-item,
      :host([unknown]) .container,
      ha-combo-box-item {
        background-color: transparent !important;
      }
      
      /* Target the unknown class specifically */
      .unknown,
      [slot="supporting-text"].unknown {
        color: var(--primary-color) !important;
      }
      
      /* Style the variable indicator */
      .uc-var-indicator {
        display: inline-flex !important;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--primary-color) !important;
        font-weight: 500;
      }
      .uc-var-indicator .scope {
        font-size: 11px;
      }
      .uc-var-styled {
        color: var(--primary-color) !important;
      }
    `;
    
    // Also inject styles into nested shadow roots
    this._injectNestedStyles(shadowRoot);

    // Try to find and replace the secondary/error text
    // The structure varies but usually has a secondary line showing "Unknown entity"
    setTimeout(() => {
      this._replaceErrorText(shadowRoot, value, resolvedEntity, isGlobal);
    }, 50);
  }

  /**
   * Replace the "Unknown entity selected" text with variable info
   * The structure is: ha-entity-picker → shadow → ha-picker-textfield → shadow → ha-combo-box-item → div[slot="supporting-text"].unknown
   */
  private _replaceErrorText(shadowRoot: ShadowRoot, varName: string, resolvedEntity: string, isGlobal: boolean): void {
    const scopeIcon = isGlobal ? '🌐' : '📋';
    const replacement = `<span class="uc-var-indicator"><span class="scope">${scopeIcon}</span> Variable → ${resolvedEntity}</span>`;

    // Look for the supporting-text element with various selectors
    const selectors = [
      '[slot="supporting-text"]',
      '.unknown',
      '[slot="supporting-text"].unknown',
      '.secondary',
      '[slot="secondary"]',
      '.mdc-list-item__secondary-text',
    ];

    // Try direct lookup first
    for (const selector of selectors) {
      const el = shadowRoot.querySelector(selector);
      if (el && el.textContent?.includes('Unknown')) {
        el.innerHTML = replacement;
        el.classList.add('uc-var-styled');
        (el as HTMLElement).style.color = 'var(--primary-color)';
        return;
      }
    }

    // Deep search through all nested shadow roots
    this._deepSearchAndReplace(shadowRoot, selectors, replacement);
  }

  /**
   * Recursively search shadow roots for the error text element
   */
  private _deepSearchAndReplace(root: ShadowRoot | Element, selectors: string[], replacement: string): boolean {
    // Check all elements in this root
    const allElements = root.querySelectorAll('*');
    
    for (const el of Array.from(allElements)) {
      // Check if this element matches
      for (const selector of selectors) {
        if (el.matches(selector) && el.textContent?.includes('Unknown')) {
          el.innerHTML = replacement;
          el.classList.add('uc-var-styled');
          (el as HTMLElement).style.color = 'var(--primary-color)';
          return true;
        }
      }
      
      // Check shadow root
      if (el.shadowRoot) {
        // Try direct selectors in shadow
        for (const selector of selectors) {
          const found = el.shadowRoot.querySelector(selector);
          if (found && found.textContent?.includes('Unknown')) {
            found.innerHTML = replacement;
            found.classList.add('uc-var-styled');
            (found as HTMLElement).style.color = 'var(--primary-color)';
            return true;
          }
        }
        
        // Recurse deeper
        if (this._deepSearchAndReplace(el.shadowRoot, selectors, replacement)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Inject styles into nested shadow roots
   */
  private _injectNestedStyles(root: ShadowRoot | Element): void {
    const css = `
      /* Override warning background for variable values */
      :host([unknown]) ha-combo-box-item,
      :host([unknown]) .container,
      :host {
        --ha-color-fill-warning-quiet-resting: transparent !important;
        background-color: transparent !important;
      }
      ha-combo-box-item {
        background-color: transparent !important;
      }
      
      .unknown,
      [slot="supporting-text"].unknown,
      .uc-var-styled {
        color: var(--primary-color) !important;
      }
      .uc-var-indicator {
        display: inline-flex !important;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--primary-color) !important;
        font-weight: 500;
      }
      .uc-var-indicator .scope {
        font-size: 11px;
      }
    `;

    const allElements = root.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.shadowRoot) {
        // Inject style if not already there
        if (!el.shadowRoot.querySelector('#uc-var-nested-styles')) {
          const style = document.createElement('style');
          style.id = 'uc-var-nested-styles';
          style.textContent = css;
          el.shadowRoot.appendChild(style);
        }
        // Recurse
        this._injectNestedStyles(el.shadowRoot);
      }
    });
  }

  /**
   * Remove custom styling from a picker
   */
  private _removeCustomStyling(picker: Element): void {
    delete (picker as any).__ucVarValue;
    const shadowRoot = picker.shadowRoot;
    if (shadowRoot) {
      const styleEl = shadowRoot.querySelector('#uc-var-styles');
      if (styleEl) styleEl.remove();
      
      // Restore any modified secondary text
      const styledElements = shadowRoot.querySelectorAll('.uc-var-styled');
      styledElements.forEach(el => {
        el.classList.remove('uc-var-styled');
        // The text will be restored when the picker re-renders
      });
    }
  }


  /**
   * Deep scan an element and its shadow roots for open popovers
   */
  private _deepScanForPopovers(element: Element | Document): void {
    // Check direct children
    const popovers = element.querySelectorAll('wa-popover[open]');
    popovers.forEach((popover) => {
      this._handlePopoverOpen(popover);
    });

    // Check shadow roots
    if (element instanceof Element && element.shadowRoot) {
      this._deepScanForPopovers(element.shadowRoot as unknown as Document);
    }

    // Recursively check all elements with shadow roots
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el.shadowRoot) {
        const shadowPopovers = el.shadowRoot.querySelectorAll('wa-popover[open]');
        shadowPopovers.forEach((popover) => {
          this._handlePopoverOpen(popover);
        });
        // Continue deeper
        this._deepScanForPopovers(el.shadowRoot as unknown as Document);
      }
    });
  }

  /**
   * Deep scan an element for combo boxes
   */
  private _deepScanElement(element: Element): void {
    // Check if it's a combo box
    if (element.tagName?.toLowerCase() === 'ha-picker-combo-box') {
      this._injectChipsIntoComboBox(element);
    }

    // Check shadow root
    if (element.shadowRoot) {
      const comboBoxes = element.shadowRoot.querySelectorAll('ha-picker-combo-box');
      comboBoxes.forEach((cb) => this._injectChipsIntoComboBox(cb));
      
      // Scan shadow children
      element.shadowRoot.querySelectorAll('*').forEach((child) => {
        this._deepScanElement(child);
      });
    }

    // Check children
    element.querySelectorAll('ha-picker-combo-box').forEach((cb) => {
      this._injectChipsIntoComboBox(cb);
    });
  }

  /**
   * Handle a popover opening - find and inject into any combo boxes
   */
  private _handlePopoverOpen(popover: Element): void {
    if (!popover.hasAttribute('open')) {
      return;
    }

    // Look for ha-picker-combo-box inside the popover's shadow root
    const shadowRoot = popover.shadowRoot;
    if (shadowRoot) {
      const comboBox = shadowRoot.querySelector('ha-picker-combo-box');
      if (comboBox) {
        this._injectChipsIntoComboBox(comboBox);
      }
    }

    // Also check direct children (in case it's not in shadow)
    const directComboBox = popover.querySelector('ha-picker-combo-box');
    if (directComboBox) {
      this._injectChipsIntoComboBox(directComboBox);
    }
  }

  /**
   * Inject variable chips into a ha-picker-combo-box dropdown
   */
  private _injectChipsIntoComboBox(comboBox: Element): void {
    // Skip if already injected
    if (this._injectedComboBoxes.has(comboBox)) {
      return;
    }

    // Get variables
    const globalVars = ucCustomVariablesService.getVariables();
    const cardVars = this._config 
      ? ucCustomVariablesService.getCardSpecificVariables(this._config) 
      : [];
    
    // Don't inject if no variables
    if (globalVars.length === 0 && cardVars.length === 0) {
      return;
    }

    // Find the shadow root
    const shadowRoot = comboBox.shadowRoot;
    if (!shadowRoot) {
      return;
    }

    // Find the virtualizer wrapper (entity list container)
    const virtualizerWrapper = shadowRoot.querySelector('.virtualizer-wrapper');
    if (!virtualizerWrapper) {
      // Try again after a short delay (dropdown might still be rendering)
      setTimeout(() => this._retryInjection(comboBox, globalVars, cardVars), 100);
      return;
    }

    // Check if already injected (double-check)
    if (shadowRoot.querySelector('.uc-variable-chips-dropdown')) {
      this._injectedComboBoxes.add(comboBox);
      return;
    }

    this._performInjection(comboBox, shadowRoot, virtualizerWrapper, globalVars, cardVars);
  }

  /**
   * Retry chip injection after delay
   */
  private _retryInjection(
    comboBox: Element,
    globalVars: CustomVariable[],
    cardVars: CustomVariable[]
  ): void {
    if (this._injectedComboBoxes.has(comboBox)) {
      return;
    }

    const shadowRoot = comboBox.shadowRoot;
    if (!shadowRoot) return;

    const virtualizerWrapper = shadowRoot.querySelector('.virtualizer-wrapper');
    if (!virtualizerWrapper) {
      // One more retry
      setTimeout(() => {
        const sr = comboBox.shadowRoot;
        const vw = sr?.querySelector('.virtualizer-wrapper');
        if (sr && vw) {
          this._performInjection(comboBox, sr, vw, globalVars, cardVars);
        }
      }, 200);
      return;
    }

    this._performInjection(comboBox, shadowRoot, virtualizerWrapper, globalVars, cardVars);
  }

  /**
   * Actually perform the chip injection
   */
  private _performInjection(
    comboBox: Element,
    shadowRoot: ShadowRoot,
    virtualizerWrapper: Element,
    globalVars: CustomVariable[],
    cardVars: CustomVariable[]
  ): void {
    // Final check if already injected
    if (shadowRoot.querySelector('.uc-variable-chips-dropdown')) {
      this._injectedComboBoxes.add(comboBox);
      return;
    }

    this._injectedComboBoxes.add(comboBox);

    // Create the chips container
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'uc-variable-chips-dropdown';
    chipsContainer.innerHTML = this._buildChipsHTML(globalVars, cardVars);

    // Add styles
    const styleEl = document.createElement('style');
    styleEl.textContent = this._getChipsStyles();
    shadowRoot.appendChild(styleEl);

    // Insert before the virtualizer wrapper
    virtualizerWrapper.parentNode?.insertBefore(chipsContainer, virtualizerWrapper);

    // Add click handlers to chips
    this._attachChipClickHandlers(comboBox, chipsContainer);
    
    console.log('[UC Entity Enhancer] ✅ Injected variable chips into entity picker');
  }

  /**
   * Build the HTML for variable chips
   */
  private _buildChipsHTML(globalVars: CustomVariable[], cardVars: CustomVariable[]): string {
    const allVars = [...globalVars, ...cardVars];
    
    const chipsHTML = allVars.map((v) => {
      const isGlobal = v.isGlobal !== false;
      const resolvedValue = this._getResolvedValue(v);
      const tooltip = `${isGlobal ? '🌐 Global' : '📋 Card'}: $${v.name} → ${v.entity}${resolvedValue ? ` (${resolvedValue})` : ''}`;
      
      // Store both the variable name (what we'll set) and the entity (for reference)
      return `
        <button 
          type="button" 
          class="uc-var-chip"
          data-variable="\$${v.name}"
          data-entity="${v.entity}"
          title="${tooltip}"
        >
          <span class="uc-var-chip-scope">${isGlobal ? '🌐' : '📋'}</span>
          <span class="uc-var-chip-name">$${v.name}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="uc-var-chips-header">
        <ha-icon icon="mdi:variable"></ha-icon>
        <span>Custom Variables</span>
      </div>
      <div class="uc-var-chips-list">
        ${chipsHTML}
      </div>
    `;
  }

  /**
   * Get resolved value of a variable for tooltip
   */
  private _getResolvedValue(variable: CustomVariable): string {
    if (!this._hass) return '';
    const entityState = this._hass.states[variable.entity];
    if (!entityState) return 'unavailable';
    
    switch (variable.value_type) {
      case 'entity_id':
        return variable.entity;
      case 'state':
        return entityState.state;
      case 'attribute':
        if (variable.attribute_name && entityState.attributes) {
          const val = entityState.attributes[variable.attribute_name];
          return val !== undefined ? String(val) : 'undefined';
        }
        return 'no attr';
      default:
        return entityState.state;
    }
  }

  /**
   * Attach click handlers to chips
   */
  private _attachChipClickHandlers(comboBox: Element, chipsContainer: HTMLElement): void {
    const chips = chipsContainer.querySelectorAll('.uc-var-chip');
    
    chips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Store the variable syntax ($varname) - this enables true indirection
        // When the variable's entity is changed later, all references auto-update
        const variableName = (chip as HTMLElement).dataset.variable;
        const entityId = (chip as HTMLElement).dataset.entity;
        if (variableName) {
          this._selectVariable(comboBox, variableName, entityId);
        }
      });
    });
  }

  /**
   * Select a variable and store its syntax in the entity field
   * This enables true indirection - change the variable once, all references update
   */
  private _selectVariable(comboBox: Element, variableName: string, entityId?: string): void {
    // Find the wa-popover that contains this combo-box (for closing)
    let popover: Element | null = null;
    let current: Element | null = comboBox;
    
    // Walk up to find the wa-popover
    while (current) {
      const parent = current.parentElement || (current.getRootNode() as ShadowRoot)?.host;
      if (parent?.tagName?.toLowerCase() === 'wa-popover') {
        popover = parent;
        break;
      }
      current = parent as Element;
    }

    // Find the entity picker (parent of the popover)
    let entityPicker: Element | null = null;
    if (popover) {
      current = popover;
      while (current) {
        const parent = current.parentElement || (current.getRootNode() as ShadowRoot)?.host;
        if (parent?.tagName?.toLowerCase() === 'ha-entity-picker' || 
            parent?.tagName?.toLowerCase() === 'ha-selector-entity') {
          entityPicker = parent;
          break;
        }
        current = parent as Element;
      }
    }

    // Store the variable syntax (e.g., "$globaltest") - NOT the entity ID
    // This enables true indirection - change variable definition, all uses update
    const valueToStore = variableName;

    // Method 1: Fire value-changed on the combo-box (this is what HA does internally)
    comboBox.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: valueToStore },
      bubbles: true,
      composed: true,
    }));

    // Method 2: Also set value directly on entity picker if found
    if (entityPicker) {
      (entityPicker as any).value = valueToStore;
      
      // Fire value-changed event on entity picker
      entityPicker.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value: valueToStore },
        bubbles: true,
        composed: true,
      }));
    }

    // Close the popover
    if (popover) {
      // Method 1: Set open to false
      (popover as any).open = false;
      
      // Method 2: Also try clicking outside to close
      setTimeout(() => {
        if ((popover as any).open) {
          // Try dispatching escape key
          document.dispatchEvent(new KeyboardEvent('keydown', { 
            key: 'Escape', 
            code: 'Escape',
            bubbles: true 
          }));
        }
      }, 50);
    }

    console.log(`[UC Entity Enhancer] Selected variable ${variableName} (resolves to: ${entityId})`);
  }

  /**
   * Get CSS styles for injected chips
   */
  private _getChipsStyles(): string {
    return `
      .uc-variable-chips-dropdown {
        padding: 8px 12px;
        border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.12));
        background: var(--primary-background-color, #1c1c1c);
      }

      .uc-var-chips-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        color: var(--primary-color, #03a9f4);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .uc-var-chips-header ha-icon {
        --mdc-icon-size: 14px;
      }

      .uc-var-chips-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .uc-var-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        font-size: 12px;
        font-family: var(--code-font-family, monospace);
        border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
        border-radius: 16px;
        background: var(--card-background-color, #2c2c2c);
        color: var(--primary-text-color, #fff);
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }

      .uc-var-chip:hover {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color, #03a9f4);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .uc-var-chip:active {
        transform: translateY(0);
      }

      .uc-var-chip-scope {
        font-size: 10px;
      }

      .uc-var-chip-name {
        font-weight: 500;
      }
    `;
  }
}

// Export singleton instance
export const ucEntityPickerEnhancer = new UcEntityPickerEnhancer();
