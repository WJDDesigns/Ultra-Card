import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
// Import the responsive design tab component
import './uc-responsive-design-tab';

/**
 * GlobalDesignTab - Now delegates to the responsive design tab component
 * which provides WPBakery-style device-specific design controls.
 */
export class GlobalDesignTab {
  static render<M extends CardModule>(
    module: M,
    hass: HomeAssistant,
    updateModule: (updates: Partial<M>) => void
  ): TemplateResult {
    // Use the new responsive design tab component
    return html`
      <uc-responsive-design-tab
        .module=${module}
        .hass=${hass}
        .updateModule=${updateModule}
      ></uc-responsive-design-tab>
    `;
  }
}
