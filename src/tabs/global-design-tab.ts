import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
import '../editor/global-design-tab';
import {
  applyModuleDesignUpdates,
  extractModuleDesignProperties,
} from '../editor/design-tab-bridge';

/**
 * GlobalDesignTab — thin shim that mounts the canonical
 * `<ultra-global-design-tab>` for module Design tabs.
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
