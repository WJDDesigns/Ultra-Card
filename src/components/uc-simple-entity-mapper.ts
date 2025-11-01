import { HomeAssistant } from 'custom-card-helpers';
import { EntityReference, EntityMapping } from '../types';
import { entityMapper } from '../services/uc-entity-mapper';

interface MappingState {
  original: string;
  mapped: string;
  suggestions: string[];
  domain: string;
  context?: string;
  moduleType?: string;
  location: string; // The specific location path to distinguish duplicates
}

export class UcSimpleEntityMapper {
  private hass!: HomeAssistant;
  private container: HTMLDivElement | null = null;
  private mappings: Map<string, MappingState> = new Map();
  private onApplyCallback?: (mappings: EntityMapping[]) => void;
  private onCancelCallback?: () => void;

  constructor() {
    console.log('🎯 Simple Entity Mapper initialized');
  }

  public show(
    hass: HomeAssistant,
    title: string,
    references: EntityReference[],
    onApply: (mappings: EntityMapping[]) => void,
    onCancel?: () => void
  ): void {
    console.log('🎬 Simple Entity Mapper show called');
    console.log('📋 Entity references:', references);
    console.log('📋 References length:', references.length);
    console.log('📋 References details:', JSON.stringify(references, null, 2));
    
    this.hass = hass;
    this.onApplyCallback = onApply;
    this.onCancelCallback = onCancel;
    
    // Initialize mappings
    this.initializeMappings(references);
    
    // Create and show dialog
    this.createDialog(title);
  }

  private initializeMappings(references: EntityReference[]): void {
    console.log('🔧 Initializing mappings...');
    console.log('🔧 References to process:', references);
    this.mappings.clear();
    
    if (!references || references.length === 0) {
      console.warn('⚠️ No entity references provided!');
      return;
    }
    
    const availableEntities = Object.keys(this.hass.states);
    console.log('📊 Available entities count:', availableEntities.length);

    references.forEach((ref, index) => {
      if (!ref || !ref.entityId) {
        console.warn('⚠️ Invalid reference:', ref);
        return;
      }
      
      const domain = this.getDomain(ref.entityId);
      const exists = this.hass.states[ref.entityId] !== undefined;
      const suggestions = entityMapper.suggestEntities(ref.entityId, availableEntities);
      
      // Use location as unique key to handle duplicate entities in different modules
      const uniqueKey = `${ref.entityId}__${ref.locations[0]}`;
      
      console.log(`🔍 Processing entity reference ${index}: ${ref.entityId} at ${ref.locations[0]}`, {
        domain,
        exists,
        moduleType: ref.moduleType,
        suggestionsCount: suggestions.length,
        suggestions: suggestions.slice(0, 3)
      });

      this.mappings.set(uniqueKey, {
        original: ref.entityId,
        mapped: exists ? ref.entityId : suggestions[0] || ref.entityId,
        suggestions,
        domain,
        context: ref.context,
        moduleType: ref.moduleType,
        location: ref.locations[0],
      });
    });

    console.log('✅ Mappings initialized:', Array.from(this.mappings.entries()));
  }

  private createDialog(title: string): void {
    // Remove any existing dialog element but don't clear mappings
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'uc-simple-entity-mapper';
    
    // Build HTML
    const html = this.buildDialogHTML(title);
    this.container.innerHTML = html;
    
    // Add to body
    document.body.appendChild(this.container);
    
    // Force the dialog to be interactive and on top
    setTimeout(() => {
      if (this.container) {
        // Remove inert attribute if it exists (this prevents interaction)
        this.container.removeAttribute('inert');
        
        // Ensure it's on top
        this.container.style.zIndex = '9999999';
        
        // Make sure all child elements are also not inert
        const allElements = this.container.querySelectorAll('*');
        allElements.forEach(el => {
          el.removeAttribute('inert');
        });
        
        // Force pointer events to be enabled
        this.container.style.pointerEvents = 'auto';
        const backdrop = this.container.querySelector('.dialog-backdrop') as HTMLElement;
        if (backdrop) {
          backdrop.style.pointerEvents = 'auto';
        }
        const dialogContainer = this.container.querySelector('.dialog-container') as HTMLElement;
        if (dialogContainer) {
          dialogContainer.style.pointerEvents = 'auto';
        }
        
        console.log('🎆 Dialog made interactive - removed inert attributes');
      }
    }, 100);
    
    // Bind events using direct property assignment
    this.bindEvents();
    
    console.log('✅ Dialog created and events bound');
    console.log('📍 Dialog parent:', this.container?.parentElement);
  }

  private buildDialogHTML(title: string): string {
    const summary = this.getSummary();
    
    console.log('🔧 Building dialog HTML');
    console.log('🔧 Mappings size:', this.mappings.size);
    console.log('🔧 Summary:', summary);
    
    let entityRows = '';
    this.mappings.forEach((state, uniqueKey) => {
      const options = [`<option value="${state.original}">Keep Original: ${state.original}</option>`];
      
      // Add suggestions first (top matches)
      if (state.suggestions.length > 0) {
        options.push(`<optgroup label="Suggested Matches">`);
        state.suggestions.forEach(suggestion => {
          const selected = state.mapped === suggestion ? 'selected' : '';
          options.push(`<option value="${suggestion}" ${selected}>${suggestion}</option>`);
        });
        options.push(`</optgroup>`);
      }
      
      // Add all entities of the same domain
      const allEntities = Object.keys(this.hass.states);
      const domainEntities = allEntities
        .filter(e => e.startsWith(state.domain + '.'))
        .filter(e => e !== state.original && !state.suggestions.includes(e))
        .sort();
      
      if (domainEntities.length > 0) {
        options.push(`<optgroup label="All ${state.domain.charAt(0).toUpperCase() + state.domain.slice(1)} Entities">`);
        domainEntities.forEach(entity => {
          const selected = state.mapped === entity ? 'selected' : '';
          options.push(`<option value="${entity}" ${selected}>${entity}</option>`);
        });
        options.push(`</optgroup>`);
      }
      
      entityRows += `
        <div class="entity-row">
          <div class="entity-info">
            <div class="entity-original">${state.original}</div>
            ${state.context ? `<div class="entity-context">${state.context}</div>` : ''}
            <div class="entity-tags">
              <span class="entity-domain">${state.domain}</span>
              ${state.moduleType ? `<span class="entity-module-type">${state.moduleType}</span>` : ''}
            </div>
          </div>
          <div class="entity-picker">
            <select class="entity-select" data-unique-key="${uniqueKey}" data-original="${state.original}">
              ${options.join('')}
            </select>
          </div>
        </div>
      `;
    });

    return `
      <div class="dialog-backdrop">
        <div class="dialog-container">
          <div class="dialog-header">
            <h2>${title}</h2>
            <p>${summary.total} entities detected</p>
          </div>
          
          <div class="dialog-content">
          <div class="bulk-actions">
            <button type="button" id="auto-map-btn" class="bulk-btn">Auto-Map Similar</button>
            <button type="button" id="keep-all-btn" class="bulk-btn">Use Original Entities</button>
            <button type="button" id="clear-all-btn" class="bulk-btn">Clear All</button>
          </div>
            
            <div class="entity-list">
              ${entityRows}
            </div>
            
            <div class="summary">
              <p id="summary-text">${summary.mapped} mapped, ${summary.unmapped} unmapped of ${summary.total} total</p>
            </div>
          </div>
          
          <div class="dialog-footer">
            <button type="button" id="cancel-btn" class="dialog-btn">Cancel</button>
            <button type="button" id="apply-btn" class="dialog-btn primary" ${summary.unmapped > 0 ? 'disabled' : ''}>Apply Preset</button>
          </div>
        </div>
      </div>
      
      <style>
        .uc-simple-entity-mapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999999 !important;
          pointer-events: auto !important;
        }
        
        .dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 999999 !important;
          pointer-events: auto !important;
        }
        
        .dialog-container {
          background: var(--card-background-color, #fff);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 999999 !important;
          pointer-events: auto !important;
        }
        
        .dialog-header {
          padding: 24px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        
        .dialog-header h2 {
          margin: 0 0 8px;
          font-size: 20px;
          color: var(--primary-text-color);
        }
        
        .dialog-header p {
          margin: 0;
          font-size: 14px;
          color: var(--secondary-text-color);
        }
        
        .dialog-content {
          padding: 20px 24px;
          overflow-y: auto;
          flex: 1;
        }
        
        .bulk-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .bulk-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          font-size: 14px;
          pointer-events: auto !important;
          position: relative;
          z-index: 1;
        }
        
        .bulk-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        .entity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .entity-row {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: 8px;
          background: var(--secondary-background-color, #f5f5f5);
          border: 1px solid var(--divider-color);
        }
        
        .entity-info {
          flex: 1;
        }
        
        .entity-original {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
          font-family: monospace;
        }
        
        .entity-context {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        
        .entity-tags {
          display: flex;
          gap: 4px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        
        .entity-domain,
        .entity-module-type {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .entity-domain {
          background: var(--primary-color);
          color: white;
        }
        
        .entity-module-type {
          background: var(--accent-color, #ff9800);
          color: white;
          text-transform: capitalize;
        }
        
        .entity-picker {
          flex: 1;
        }
        
        .entity-select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          cursor: pointer;
          pointer-events: auto !important;
          position: relative;
          z-index: 1;
        }
        
        .entity-select:focus {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
        
        .summary {
          margin-top: 20px;
          padding: 16px;
          border-radius: 8px;
          background: var(--primary-color);
          color: white;
        }
        
        .summary p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }
        
        .dialog-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--divider-color);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .dialog-btn {
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          pointer-events: auto !important;
          position: relative;
          z-index: 1;
        }
        
        .dialog-btn:hover {
          background: var(--divider-color);
        }
        
        .dialog-btn.primary {
          background: var(--primary-color);
          color: white;
        }
        
        .dialog-btn.primary:hover {
          opacity: 0.9;
        }
        
        .dialog-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>
    `;
  }

  private bindEvents(): void {
    if (!this.container) return;

    // Use direct property assignment for maximum compatibility
    const autoMapBtn = this.container.querySelector('#auto-map-btn') as HTMLButtonElement;
    const keepAllBtn = this.container.querySelector('#keep-all-btn') as HTMLButtonElement;
    const clearAllBtn = this.container.querySelector('#clear-all-btn') as HTMLButtonElement;
    const cancelBtn = this.container.querySelector('#cancel-btn') as HTMLButtonElement;
    const applyBtn = this.container.querySelector('#apply-btn') as HTMLButtonElement;

    if (autoMapBtn) {
      autoMapBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('🚀 Auto-map button clicked!');
        this.handleAutoMap();
      };
    }

    if (keepAllBtn) {
      keepAllBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('🔒 Keep all unmapped button clicked!');
        this.handleKeepAllUnmapped();
      };
    }

    if (clearAllBtn) {
      clearAllBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('🧹 Clear all button clicked!');
        this.handleClearAll();
      };
    }

    if (cancelBtn) {
      cancelBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('❌ Cancel button clicked!');
        this.handleCancel();
      };
    }

    if (applyBtn) {
      applyBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('✅ Apply button clicked!');
        this.handleApply();
      };
    }

    // Bind dropdown events
    const selects = this.container.querySelectorAll('.entity-select') as NodeListOf<HTMLSelectElement>;
    console.log(`🔧 Binding events to ${selects.length} dropdowns`);
    selects.forEach((select, index) => {
      const uniqueKey = select.dataset.uniqueKey;
      const original = select.dataset.original;
      console.log(`🔧 Binding dropdown ${index}: ${original} (key: ${uniqueKey})`);
      
      // Try multiple event binding approaches for maximum compatibility
      select.addEventListener('change', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const target = e.target as HTMLSelectElement;
        const key = target.dataset.uniqueKey;
        if (key) {
          console.log('🎉 Dropdown changed via addEventListener:', key, 'to', target.value);
          this.handleMappingChange(key, target.value);
        }
      });
      
      select.onchange = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const target = e.target as HTMLSelectElement;
        const key = target.dataset.uniqueKey;
        if (key) {
          console.log('🎉 Dropdown changed via onchange:', key, 'to', target.value);
          this.handleMappingChange(key, target.value);
        }
      };
      
      // Also add click handler to debug if clicks are being received
      select.onclick = (e) => {
        console.log('🔍 Dropdown clicked:', original);
      };
    });

    console.log('✅ All events bound using direct property assignment');
  }

  private handleAutoMap(): void {
    console.log('🤖 Auto-map button handler called!');
    let changes = 0;
    this.mappings.forEach((state, original) => {
      if (state.suggestions.length > 0) {
        console.log(`🔄 Auto-mapping ${original} to ${state.suggestions[0]}`);
        state.mapped = state.suggestions[0];
        changes++;
      }
    });
    
    console.log(`✅ Auto-map completed: ${changes} entities mapped`);
    this.updateUI();
  }

  private handleKeepAllUnmapped(): void {
    console.log('🔒 Keep all unmapped button clicked!');
    let changes = 0;
    this.mappings.forEach(state => {
      // Always set back to original value - this button means "use original entities"
      console.log(`🔒 Resetting ${state.original} to original value`);
      state.mapped = state.original;
      changes++;
    });
    
    console.log(`✅ Keep all unmapped completed: ${changes} entities reset to original`);
    this.updateUI();
  }

  private handleClearAll(): void {
    this.mappings.forEach(state => {
      console.log(`🧹 Clearing mapping for ${state.original}`);
      state.mapped = '';
    });
    
    console.log('✅ Clear all completed');
    this.updateUI();
  }

  private handleMappingChange(uniqueKey: string, mapped: string): void {
    console.log(`🔄 handleMappingChange called: ${uniqueKey} -> ${mapped}`);
    const state = this.mappings.get(uniqueKey);
    if (state) {
      state.mapped = mapped;
      console.log('✅ Updated mapping state:', state);
      this.updateUI();
    } else {
      console.error('❌ No state found for:', uniqueKey);
      console.log('📋 Current mappings:', Array.from(this.mappings.keys()));
    }
  }

  private handleCancel(): void {
    console.log('🔄 Calling cancel callback');
    const callback = this.onCancelCallback;
    this.close();
    if (callback) {
      callback();
    }
  }

  private handleApply(): void {
    const mappings: EntityMapping[] = [];

    this.mappings.forEach((state, uniqueKey) => {
      if (state.mapped && state.mapped !== state.original) {
        mappings.push({
          original: state.original,
          mapped: state.mapped,
          domain: state.domain,
        });
        console.log(`📝 Adding mapping: ${state.original} → ${state.mapped} (at ${state.location})`);
      }
    });

    console.log('📋 Final mappings to apply:', mappings);
    
    const callback = this.onApplyCallback;
    this.close();
    
    if (callback) {
      callback(mappings);
    }
  }

  private updateUI(): void {
    if (!this.container) return;

    // Update dropdowns
    this.mappings.forEach((state, uniqueKey) => {
      const select = this.container!.querySelector(`[data-unique-key="${uniqueKey}"]`) as HTMLSelectElement;
      if (select) {
        select.value = state.mapped;
      }
    });

    // Update summary
    const summary = this.getSummary();
    const summaryText = this.container.querySelector('#summary-text');
    if (summaryText) {
      summaryText.textContent = `${summary.mapped} mapped, ${summary.unmapped} unmapped of ${summary.total} total`;
    }

    // Update apply button state
    const applyBtn = this.container.querySelector('#apply-btn') as HTMLButtonElement;
    if (applyBtn) {
      applyBtn.disabled = summary.unmapped > 0;
    }
  }

  private getSummary(): { total: number; mapped: number; unmapped: number } {
    let mapped = 0;
    let unmapped = 0;

    this.mappings.forEach(state => {
      if (state.mapped && state.mapped !== state.original) {
        mapped++;
      } else if (!state.mapped || state.mapped === '') {
        unmapped++;
      }
    });

    return {
      total: this.mappings.size,
      mapped,
      unmapped,
    };
  }

  private getDomain(entityId: string): string {
    const parts = entityId.split('.');
    return parts.length > 1 ? parts[0] : '';
  }

  public close(): void {
    console.log('🚪 Closing dialog');
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.mappings.clear();
    this.onApplyCallback = undefined;
    this.onCancelCallback = undefined;
  }
}

// Create singleton instance
export const simpleEntityMapper = new UcSimpleEntityMapper();
