import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule } from '../types';
import '../editor/global-design-tab';
import {
  applyModuleDesignUpdates,
  extractModuleDesignProperties,
} from '../editor/design-tab-bridge';

/**
 * Compatibility shim: `uc-responsive-design-tab` now delegates to the
 * canonical `<ultra-global-design-tab>`. Prefer ultra-global-design-tab directly.
 */
@customElement('uc-responsive-design-tab')
export class UcResponsiveDesignTab extends LitElement {
  @property({ attribute: false }) public module!: CardModule;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public updateModule!: (updates: Partial<CardModule>) => void;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    // Light DOM so nested ultra-global-design-tab inherits HA form styles cleanly
    // and tests can deep-query consistently with other design surfaces.
    return this;
  }

  override render(): TemplateResult {
    if (!this.module || !this.hass || !this.updateModule) {
      return html``;
    }

    return html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${extractModuleDesignProperties(this.module)}
        .responsiveDesign=${(this.module as any).design}
        .onUpdate=${(updates: any) => {
          this.updateModule(applyModuleDesignUpdates(this.module, updates));
        }}
      ></ultra-global-design-tab>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-responsive-design-tab': UcResponsiveDesignTab;
  }
}
