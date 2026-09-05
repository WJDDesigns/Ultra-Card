import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';

/**
 * Actions tab entry point used by every module's `renderActionsTab`.
 *
 * `render()` only mounts `<ultra-global-actions-tab>`; the element itself is
 * defined in `src/editor/global-actions-tab-element.ts` (editor chunk), so this
 * file stays tiny and the form code is not part of ultra-card.js. The other
 * statics are runtime helpers modules call from `renderPreview`.
 */
export class GlobalActionsTab {
  static render<M extends CardModule>(
    module: M,
    hass: HomeAssistant,
    updateModule: (updates: Partial<M>) => void,
    title?: string
  ): TemplateResult {
    return html`
      <ultra-global-actions-tab
        .hass=${hass}
        .module=${module}
        .tabTitle=${title}
        @module-changed=${(e: CustomEvent) => updateModule(e.detail.updates)}
      ></ultra-global-actions-tab>
    `;
  }

  // Backwards-compatible helpers for clickable wrappers used in modules
  static getClickableClass(module: any): string {
    const hasAction =
      (module?.tap_action &&
        module.tap_action.action !== 'nothing' &&
        module.tap_action.action !== 'none') ||
      (module?.hold_action &&
        module.hold_action.action !== 'nothing' &&
        module.hold_action.action !== 'none') ||
      (module?.double_tap_action &&
        module.double_tap_action.action !== 'nothing' &&
        module.double_tap_action.action !== 'none');
    return hasAction ? 'graphs-module-clickable' : '';
  }

  static getClickableStyle(module: any): string {
    // Legacy hover effects removed - now handled by new hover effects system
    return '';
  }

  /**
   * Resolves 'default' actions to their actual behavior at runtime
   * 'default' becomes 'more-info' for the module's entity if available, otherwise 'nothing'
   */
  static resolveAction(action: any, moduleEntity?: string): any {
    if (!action || action.action !== 'default') {
      return action;
    }

    // Convert 'default' to smart behavior
    if (moduleEntity) {
      return { action: 'more-info', entity: moduleEntity };
    } else {
      return { action: 'nothing' };
    }
  }

  static getHoverStyles(): string {
    // Legacy hover effects removed - now handled by new hover effects system
    return '';
  }
}

