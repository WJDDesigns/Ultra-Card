import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
import {
  applyModuleDesignUpdates,
  extractModuleDesignProperties,
} from '../editor/design-tab-bridge';

/**
 * GlobalDesignTab — thin shim that mounts the canonical
 * `<ultra-global-design-tab>` for module Design tabs.
 *
 * The element is defined by `src/editor/global-design-tab.ts`, imported from
 * the editor chunk (layout tab), not here: importing it from this file would
 * drag ~200 KB of design-tab source into ultra-card.js via base-module.
 */
export class GlobalDesignTab {
  static render<M extends CardModule>(
    module: M,
    hass: HomeAssistant,
    updateModule: (updates: Partial<M>) => void
  ): TemplateResult {
    return html`
      <ultra-global-design-tab
        .hass=${hass}
        .designProperties=${extractModuleDesignProperties(module)}
        .responsiveDesign=${(module as any).design}
        .onUpdate=${(updates: any) => {
          updateModule(applyModuleDesignUpdates(module, updates) as Partial<M>);
        }}
      ></ultra-global-design-tab>
    `;
  }
}
