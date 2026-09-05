import { TemplateResult, html, render } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, DrawerModule } from '../types';
import { getModuleRegistry } from './module-registry';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { localize } from '../localize/localize';
import { Z_INDEX } from '../utils/uc-z-index';
import { renderChildModulePreview } from './layout-container-utils';

const DRAWER_TRANSITION_MS = 280;

// Module-scope state so the host card can tear down open drawers when the
// drawer module is removed or hidden by logic (renderPreview is skipped then).
const drawerOpenStates = new Map<string, boolean>();
const drawerPortals = new Map<string, HTMLElement>();
const drawerCloseTimers = new Map<string, number>();

/** Close (and remove the portal of) any open drawer belonging to the module id. */
export const closeDrawersForModule = (moduleId: string): void => {
  if (!drawerOpenStates.get(moduleId)) return;
  drawerOpenStates.set(moduleId, false);
  const portal = drawerPortals.get(moduleId);
  if (!portal) return;
  const keydown = (portal as any)._ucDrawerKeydown;
  if (keydown) document.removeEventListener('keydown', keydown);
  const timer = drawerCloseTimers.get(moduleId);
  if (timer) window.clearTimeout(timer);
  (portal as any)._ucDrawerInertObserver?.disconnect();
  portal.remove();
  drawerPortals.delete(moduleId);
  drawerCloseTimers.delete(moduleId);
};

export class UltraDrawerModule extends BaseUltraModule {
  closePortalsForModule(moduleId: string): void {
    closeDrawersForModule(moduleId);
  }

  metadata: ModuleMetadata = {
    type: 'drawer',
    title: 'Drawer',
    description: 'Slide-in panel (side drawer or bottom sheet) opened by a trigger button',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:page-layout-sidebar-left',
    category: 'layout',
    tags: ['layout', 'drawer', 'bottom-sheet', 'panel', 'slide', 'overlay', 'container'],
  };

  /** Open state + portal element per drawer module instance (module-scope maps) */
  private _openStates = drawerOpenStates;
  private _portals = drawerPortals;
  private _closeTimers = drawerCloseTimers;

  createDefault(id?: string, hass?: HomeAssistant): DrawerModule {
    return {
      id: id || this.generateId('drawer'),
      type: 'drawer',
      modules: [],
      drawer_position: 'right',
      drawer_title: '',
      show_close_button: true,
      close_on_overlay_click: true,
      trigger_style: 'button',
      trigger_label: 'Open',
      trigger_icon: 'mdi:menu-open',
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const drawerModule = module as DrawerModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Drawer Panel -->
        ${this.renderSettingsSection(
          localize('editor.drawer.panel.title', lang, 'Drawer Panel'),
          localize(
            'editor.drawer.panel.desc',
            lang,
            'Where the drawer slides in from and how it looks. Modules added to this container appear inside the drawer.'
          ),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${this.renderSegmentedField(
            localize('editor.drawer.panel.position', lang, 'Position'),
            '',
            drawerModule.drawer_position || 'right',
            [
              {
                value: 'left',
                label: localize('editor.common.left', lang, 'Left'),
                icon: 'mdi:dock-left',
              },
              {
                value: 'right',
                label: localize('editor.common.right', lang, 'Right'),
                icon: 'mdi:dock-right',
              },
              {
                value: 'top',
                label: localize('editor.common.top', lang, 'Top'),
                icon: 'mdi:dock-top',
              },
              {
                value: 'bottom',
                label: localize('editor.common.bottom', lang, 'Bottom'),
                icon: 'mdi:dock-bottom',
              },
            ],
            next =>
              updateModule({ drawer_position: next as 'left' | 'right' | 'top' | 'bottom' })
          )}
          ${this.renderFieldSection(
            localize('editor.drawer.panel.size', lang, 'Panel Size'),
            localize(
              'editor.drawer.panel.size_desc',
              lang,
              'Width for left/right drawers, height for top/bottom (e.g. 340px, 50vh, 80%). Leave empty for the default.'
            ),
            hass,
            { drawer_size: drawerModule.drawer_size || '' },
            [this.textField('drawer_size')],
            (e: CustomEvent) => {
              updateModule({ drawer_size: e.detail.value.drawer_size });
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderFieldSection(
            localize('editor.drawer.panel.title_field', lang, 'Drawer Title'),
            '',
            hass,
            { drawer_title: drawerModule.drawer_title || '' },
            [this.textField('drawer_title')],
            (e: CustomEvent) => {
              updateModule({ drawer_title: e.detail.value.drawer_title });
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderColorField(
            localize('editor.drawer.panel.background', lang, 'Panel Background'),
            '',
            hass,
            drawerModule.drawer_background || '',
            'var(--card-background-color)',
            next => updateModule({ drawer_background: next })
          )}
          ${this.renderFieldSection(
            localize('editor.drawer.panel.close_button', lang, 'Show Close Button'),
            '',
            hass,
            { show_close_button: drawerModule.show_close_button !== false },
            [this.booleanField('show_close_button')],
            (e: CustomEvent) => {
              updateModule({ show_close_button: e.detail.value.show_close_button });
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderFieldSection(
            localize('editor.drawer.panel.overlay_close', lang, 'Close On Overlay Click'),
            '',
            hass,
            { close_on_overlay_click: drawerModule.close_on_overlay_click !== false },
            [this.booleanField('close_on_overlay_click')],
            (e: CustomEvent) => {
              updateModule({ close_on_overlay_click: e.detail.value.close_on_overlay_click });
              this.triggerPreviewUpdate();
            }
          )}
        </div>

        <!-- Trigger -->
        ${this.renderSettingsSection(
          localize('editor.drawer.trigger.title', lang, 'Trigger'),
          localize(
            'editor.drawer.trigger.desc',
            lang,
            'The button rendered in the card that opens the drawer.'
          ),
          []
        )}
        <div style="margin-top: -24px; margin-bottom: 32px;">
          ${this.renderSegmentedField(
            localize('editor.drawer.trigger.style', lang, 'Trigger Style'),
            '',
            drawerModule.trigger_style || 'button',
            [
              {
                value: 'button',
                label: localize('editor.drawer.trigger.button', lang, 'Button'),
                icon: 'mdi:gesture-tap-button',
              },
              {
                value: 'icon',
                label: localize('editor.drawer.trigger.icon', lang, 'Icon Only'),
                icon: 'mdi:circle-outline',
              },
            ],
            next => updateModule({ trigger_style: next as 'button' | 'icon' })
          )}
          ${(drawerModule.trigger_style || 'button') === 'button'
            ? this.renderFieldSection(
                localize('editor.drawer.trigger.label', lang, 'Trigger Label'),
                '',
                hass,
                { trigger_label: drawerModule.trigger_label || '' },
                [this.textField('trigger_label')],
                (e: CustomEvent) => {
                  updateModule({ trigger_label: e.detail.value.trigger_label });
                  this.triggerPreviewUpdate();
                }
              )
            : ''}
          ${this.renderIconField(
            localize('editor.drawer.trigger.icon_field', lang, 'Trigger Icon'),
            '',
            hass,
            drawerModule.trigger_icon || 'mdi:menu-open',
            next => updateModule({ trigger_icon: next })
          )}
          ${this.renderColorField(
            localize('editor.drawer.trigger.bg', lang, 'Trigger Background'),
            '',
            hass,
            drawerModule.trigger_background || '',
            'var(--primary-color)',
            next => updateModule({ trigger_background: next })
          )}
          ${this.renderColorField(
            localize('editor.drawer.trigger.color', lang, 'Trigger Text/Icon Color'),
            '',
            hass,
            drawerModule.trigger_color || '',
            'var(--text-primary-color, #fff)',
            next => updateModule({ trigger_color: next })
          )}
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const drawerModule = module as DrawerModule;
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);
    const triggerStyle = drawerModule.trigger_style || 'button';
    const triggerBg = drawerModule.trigger_background || 'var(--primary-color)';
    const triggerColor = drawerModule.trigger_color || 'var(--text-primary-color, #fff)';

    // Keep the portal in sync while open (hass/config updates re-render content)
    if (this._openStates.get(drawerModule.id)) {
      this._renderPortal(drawerModule, hass, config, previewContext);
    }

    const openDrawer = () => this._openDrawer(drawerModule, hass, config, previewContext);

    return this.wrapWithAnimation(
      html`
        <div class="drawer-trigger-wrapper ${hoverClass}" style="${this.buildStyleString(designStyles)}">
          ${triggerStyle === 'icon'
            ? html`
                <button
                  type="button"
                  class="drawer-trigger-icon-btn"
                  style="background: ${triggerBg}; color: ${triggerColor};"
                  aria-label="${drawerModule.drawer_title || drawerModule.trigger_label || 'Open drawer'}"
                  @click=${openDrawer}
                >
                  <ha-icon
                    icon="${drawerModule.trigger_icon || 'mdi:menu-open'}"
                    style="color: ${triggerColor};"
                  ></ha-icon>
                </button>
              `
            : html`
                <button
                  type="button"
                  class="drawer-trigger-btn"
                  style="background: ${triggerBg}; color: ${triggerColor};"
                  @click=${openDrawer}
                >
                  ${drawerModule.trigger_icon
                    ? html`<ha-icon
                        icon="${drawerModule.trigger_icon}"
                        style="color: ${triggerColor}; --mdc-icon-size: 18px;"
                      ></ha-icon>`
                    : ''}
                  <span>${drawerModule.trigger_label || 'Open'}</span>
                </button>
              `}
        </div>
      `,
      module,
      hass
    );
  }

  private _openDrawer(
    drawerModule: DrawerModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): void {
    if (this._openStates.get(drawerModule.id)) return;
    this._openStates.set(drawerModule.id, true);
    this._renderPortal(drawerModule, hass, config, previewContext);

    // Slide in on the next frame so the initial (off-screen) state is painted first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const portal = this._portals.get(drawerModule.id);
        portal?.classList.add('uc-drawer-open');
      });
    });

    // Close automatically if the user navigates away
    window.addEventListener('location-changed', () => this._closeDrawer(drawerModule.id), {
      once: true,
    });
  }

  private _closeDrawer(moduleId: string): void {
    if (!this._openStates.get(moduleId)) return;
    this._openStates.set(moduleId, false);

    const portal = this._portals.get(moduleId);
    if (!portal) return;
    portal.classList.remove('uc-drawer-open');

    const existingTimer = this._closeTimers.get(moduleId);
    if (existingTimer) window.clearTimeout(existingTimer);
      this._closeTimers.set(
      moduleId,
      window.setTimeout(() => {
        const keydown = (portal as any)._ucDrawerKeydown;
        if (keydown) document.removeEventListener('keydown', keydown);
        (portal as any)._ucDrawerInertObserver?.disconnect();
        portal.remove();
        this._portals.delete(moduleId);
        this._closeTimers.delete(moduleId);
      }, DRAWER_TRANSITION_MS)
    );
  }

  /** Concatenate getStyles() for all module types used inside the drawer so
   *  class-based child styles work in the light-DOM portal. */
  private _collectChildStyles(modules: CardModule[] | undefined): string {
    const registry = getModuleRegistry();
    const seen = new Set<string>();
    const collect = (list: CardModule[] | undefined): void => {
      (list || []).forEach(m => {
        seen.add(m.type);
        const nested = (m as any).modules;
        if (Array.isArray(nested)) collect(nested);
      });
    };
    collect(modules);
    let css = '';
    seen.forEach(type => {
      const handler = registry.getModule(type);
      if (handler?.getStyles) css += handler.getStyles();
    });
    return css;
  }

  private _renderPortal(
    drawerModule: DrawerModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): void {
    const lang = hass?.locale?.language || 'en';
    let portal = this._portals.get(drawerModule.id);
    const isNewPortal = !portal;

    if (!portal) {
      portal = document.createElement('div');
      portal.id = `ultra-drawer-portal-${drawerModule.id}`;
      portal.className = 'ultra-drawer-portal';
      portal.style.position = 'fixed';
      portal.style.inset = '0';
      portal.style.zIndex = `${Z_INDEX.DIALOG_OVERLAY}`;
      portal.style.pointerEvents = 'auto';
      document.body.appendChild(portal);
      this._portals.set(drawerModule.id, portal);

      const keydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          this._closeDrawer(drawerModule.id);
        }
      };
      document.addEventListener('keydown', keydown);
      (portal as any)._ucDrawerKeydown = keydown;

      // HA's config dialog (mwc-dialog blocking elements) marks other body children
      // as inert, which silently swallows all clicks on the drawer. Strip it and
      // keep a watchdog so it can't be re-applied while the drawer is open.
      const inertObserver = new MutationObserver(() => {
        if (portal!.hasAttribute('inert')) portal!.removeAttribute('inert');
      });
      inertObserver.observe(portal, { attributes: true, attributeFilter: ['inert'] });
      (portal as any)._ucDrawerInertObserver = inertObserver;
    }

    // Ensure the portal stays clickable on every render (inert may have been
    // added by the HA dialog or a browser extension before the observer attached)
    portal.removeAttribute('inert');
    portal.style.pointerEvents = 'auto';

    const position = drawerModule.drawer_position || 'right';
    const isVertical = position === 'top' || position === 'bottom';
    const size = drawerModule.drawer_size || (isVertical ? '45vh' : '340px');
    const background = drawerModule.drawer_background || 'var(--card-background-color)';
    const children = drawerModule.modules || [];

    const panelPositionCss: Record<string, string> = {
      left: `top: 0; left: 0; bottom: 0; width: ${size}; max-width: 90vw; transform: translateX(-100%); border-radius: 0 16px 16px 0;`,
      right: `top: 0; right: 0; bottom: 0; width: ${size}; max-width: 90vw; transform: translateX(100%); border-radius: 16px 0 0 16px;`,
      top: `top: 0; left: 0; right: 0; height: ${size}; max-height: 90vh; transform: translateY(-100%); border-radius: 0 0 16px 16px;`,
      bottom: `bottom: 0; left: 0; right: 0; height: ${size}; max-height: 90vh; transform: translateY(100%); border-radius: 16px 16px 0 0;`,
    };

    const content = html`
      <style>
        .ultra-drawer-portal .uc-drawer-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          transition: opacity ${DRAWER_TRANSITION_MS}ms ease;
        }
        .ultra-drawer-portal.uc-drawer-open .uc-drawer-overlay {
          opacity: 1;
        }
        .ultra-drawer-portal .uc-drawer-panel {
          position: absolute;
          display: flex;
          flex-direction: column;
          background: ${background};
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
          transition: transform ${DRAWER_TRANSITION_MS}ms cubic-bezier(0.25, 0.8, 0.35, 1);
          overflow: hidden;
          box-sizing: border-box;
        }
        .ultra-drawer-portal.uc-drawer-open .uc-drawer-panel {
          transform: translate(0, 0) !important;
        }
        .ultra-drawer-portal .uc-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 14px 16px 8px 20px;
          flex-shrink: 0;
        }
        .ultra-drawer-portal .uc-drawer-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ultra-drawer-portal .uc-drawer-close {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
          color: var(--secondary-text-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ultra-drawer-portal .uc-drawer-close:hover {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
        }
        .ultra-drawer-portal .uc-drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px 16px 16px 16px;
          -webkit-overflow-scrolling: touch;
        }
        .ultra-drawer-portal .uc-drawer-child {
          margin-bottom: 8px;
        }
        .ultra-drawer-portal .uc-drawer-empty {
          padding: 24px;
          text-align: center;
          color: var(--secondary-text-color);
          font-style: italic;
        }
        ${this._collectChildStyles(children)}
      </style>
      <div
        class="uc-drawer-overlay"
        @click=${() => {
          if (drawerModule.close_on_overlay_click !== false) {
            this._closeDrawer(drawerModule.id);
          }
        }}
      ></div>
      <div
        class="uc-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="${drawerModule.drawer_title || 'Drawer'}"
        style="${panelPositionCss[position]}"
      >
        ${drawerModule.drawer_title || drawerModule.show_close_button !== false
          ? html`
              <div class="uc-drawer-header">
                <div class="uc-drawer-title">${drawerModule.drawer_title || ''}</div>
                ${drawerModule.show_close_button !== false
                  ? html`
                      <button
                        type="button"
                        class="uc-drawer-close"
                        aria-label="Close"
                        @click=${() => this._closeDrawer(drawerModule.id)}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    `
                  : ''}
              </div>
            `
          : ''}
        <div class="uc-drawer-content">
          ${children.length > 0
            ? children.map(
                child => html`
                  <div class="uc-drawer-child">
                    ${renderChildModulePreview(child, hass, config, previewContext)}
                  </div>
                `
              )
            : html`
                <div class="uc-drawer-empty">
                  ${localize(
                    'editor.drawer.preview.no_modules',
                    lang,
                    'No modules added. Add modules to this drawer in the layout builder.'
                  )}
                </div>
              `}
        </div>
      </div>
    `;

    if (isNewPortal) {
      portal.innerHTML = '';
    }
    render(content, portal);
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  getStyles(): string {
    return `
      .drawer-trigger-wrapper {
        display: flex;
      }

      .drawer-trigger-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: filter 0.15s ease, transform 0.1s ease;
      }

      .drawer-trigger-btn:hover {
        filter: brightness(1.1);
      }

      .drawer-trigger-btn:active {
        transform: scale(0.97);
      }

      .drawer-trigger-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: filter 0.15s ease, transform 0.1s ease;
      }

      .drawer-trigger-icon-btn:hover {
        filter: brightness(1.1);
      }

      .drawer-trigger-icon-btn:active {
        transform: scale(0.94);
      }

      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
