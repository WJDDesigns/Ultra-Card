/**
 * Ultra Card Dashboard Scanner Service
 *
 * Scans Home Assistant dashboards to find all Ultra Card instances,
 * their positions, and view information for snapshot functionality.
 *
 * @author WJD Designs
 */

import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';

// Types for dashboard structure
export interface DashboardView {
  id: string;
  title: string;
  path: string;
  icon?: string;
  panel?: boolean;
  theme?: string;
}

export interface DashboardCard {
  config: UltraCardConfig;
  card_index: number;
  view_id: string;
  view_title: string;
  view_path: string;
  card_name?: string;
  section_index?: number; // For sections views
  card_index_in_section?: number; // Position within section
}

export interface DashboardSnapshot {
  cards: DashboardCard[];
  views: DashboardView[];
  scanned_at: string;
  card_count: number;
  dashboard_path?: string;
}

class UcDashboardScannerService {
  private hass: HomeAssistant | null = null;

  /**
   * Initialize with Home Assistant instance
   */
  initialize(hass: HomeAssistant): void {
    this.hass = hass;
  }

  /**
   * Scan entire dashboard for Ultra Cards
   * This is the main method called for creating snapshots
   */
  async scanDashboard(): Promise<DashboardSnapshot> {
    if (!this.hass) {
      throw new Error('Dashboard scanner not initialized with Home Assistant instance');
    }

    console.log('🔍 Starting full dashboard scan for Ultra Cards...');

    try {
      // Get dashboard configuration
      const lovelaceConfig = await this.getLovelaceConfig();

      if (!lovelaceConfig) {
        console.warn('⚠️ Could not retrieve Lovelace configuration');
        return this.createEmptySnapshot();
      }

      // Extract views
      const views = this.extractViews(lovelaceConfig);
      console.log(`📋 Found ${views.length} views in dashboard`);

      // Scan each view for Ultra Cards
      const allCards: DashboardCard[] = [];

      console.log(`🔍 Scanning ${views.length} views for Ultra Cards...`);
      for (const view of views) {
        console.log(`  🔎 Scanning view: "${view.title}" (id: ${view.id}, path: ${view.path})`);
        const cardsInView = this.scanViewForUltraCards(view, lovelaceConfig);
        allCards.push(...cardsInView);
        console.log(`    ✓ Found ${cardsInView.length} Ultra Cards in this view`);
      }

      console.log(
        `✅ Scan complete! Found ${allCards.length} Ultra Cards across ${views.length} views`
      );

      return {
        cards: allCards,
        views: views,
        scanned_at: new Date().toISOString(),
        card_count: allCards.length,
        dashboard_path: this.getCurrentDashboardPath(),
      };
    } catch (error) {
      console.error('❌ Dashboard scan failed:', error);
      throw new Error(`Failed to scan dashboard: ${error.message}`);
    }
  }

  /**
   * Get list of all views in the dashboard
   */
  async getDashboardViews(): Promise<DashboardView[]> {
    if (!this.hass) {
      throw new Error('Dashboard scanner not initialized');
    }

    try {
      const lovelaceConfig = await this.getLovelaceConfig();

      if (!lovelaceConfig) {
        return [];
      }

      return this.extractViews(lovelaceConfig);
    } catch (error) {
      console.error('Failed to get dashboard views:', error);
      return [];
    }
  }

  /**
   * Scan a specific view for Ultra Cards
   */
  async scanView(viewId: string): Promise<DashboardCard[]> {
    if (!this.hass) {
      throw new Error('Dashboard scanner not initialized');
    }

    try {
      const lovelaceConfig = await this.getLovelaceConfig();

      if (!lovelaceConfig) {
        return [];
      }

      const views = this.extractViews(lovelaceConfig);
      const targetView = views.find(v => v.id === viewId || v.path === viewId);

      if (!targetView) {
        console.warn(`View ${viewId} not found`);
        return [];
      }

      return this.scanViewForUltraCards(targetView, lovelaceConfig);
    } catch (error) {
      console.error(`Failed to scan view ${viewId}:`, error);
      return [];
    }
  }

  /**
   * Get current dashboard path
   */
  private getCurrentDashboardPath(): string {
    // Try to determine current dashboard from URL
    const path = window.location.pathname;
    const match = path.match(/\/lovelace\/([^\/]+)/);
    return match ? match[1] : 'default';
  }

  /**
   * Get Lovelace configuration from Home Assistant
   */
  private async getLovelaceConfig(): Promise<any> {
    if (!this.hass) {
      console.error('❌ Hass instance not available');
      return null;
    }

    console.log('🔍 Attempting to retrieve Lovelace config...');

    try {
      // Method 1a: Try via hass connection (WebSocket) - YAML mode
      const dashboardPath = this.getCurrentDashboardPath();
      console.log(`   Method 1a: WebSocket (YAML mode) for dashboard path: ${dashboardPath}`);

      try {
        const config = await this.hass.callWS({
          type: 'lovelace/config',
          url_path: dashboardPath === 'default' ? null : dashboardPath,
        });

        if (config) {
          console.log('✅ Method 1a SUCCESS: Retrieved config via WebSocket (YAML mode)');
          return config;
        }
      } catch (wsError) {
        console.warn('⚠️ Method 1a FAILED: YAML mode fetch failed, trying storage mode...');
      }

      // Method 1b: Try to get dashboards list and access storage config
      console.log(`   Method 1b: WebSocket - Getting dashboards list`);

      try {
        // Get list of all dashboards
        const dashboards: any = await this.hass.callWS({
          type: 'lovelace/dashboards/list',
        });

        console.log(`   Found ${Array.isArray(dashboards) ? dashboards.length : 0} dashboards`);

        if (Array.isArray(dashboards)) {
          // Log all available dashboards for debugging
          console.log('   Available dashboards:');
          dashboards.forEach((d: any, index: number) => {
            console.log(
              `     ${index + 1}. id: "${d.id}", url_path: "${d.url_path}", mode: "${d.mode}", title: "${d.title}"`
            );
          });
          console.log(`   Looking for: "${dashboardPath}"`);

          // Find our dashboard
          const targetDashboard = dashboards.find(
            (d: any) => d.url_path === dashboardPath || d.id === dashboardPath
          );

          if (targetDashboard) {
            console.log(
              `   ✓ Found matching dashboard: ${targetDashboard.url_path || targetDashboard.id} (mode: ${targetDashboard.mode})`
            );

            // Try to get the config
            const config = await this.hass.callWS({
              type: 'lovelace/config',
              url_path: targetDashboard.url_path || targetDashboard.id,
            });

            if (config) {
              console.log('✅ Method 1b SUCCESS: Retrieved storage config via dashboard list');
              return config;
            } else {
              console.warn('   Dashboard found but config returned null');
            }
          } else {
            console.warn(
              `   ✗ No dashboard matched "${dashboardPath}", trying as default dashboard...`
            );

            // If not found in list, try getting it as the default lovelace dashboard
            try {
              const defaultConfig = await this.hass.callWS({
                type: 'lovelace/config',
                url_path: null, // null = default lovelace dashboard
              });

              if (defaultConfig) {
                console.log('✅ Method 1b SUCCESS: Retrieved default lovelace config');
                return defaultConfig;
              }
            } catch (defaultError) {
              console.warn('   Could not load as default dashboard either');
            }
          }
        }
      } catch (dashboardListError) {
        console.warn('⚠️ Method 1b FAILED: Dashboard list fetch failed:', dashboardListError);
      }

      // Method 2: Try to get from lovelace object
      console.log('   Method 2: Lovelace instance from window');
      const lovelace = (document.querySelector('home-assistant') as any)?.lovelace;

      if (lovelace && lovelace.config) {
        console.log('✅ Method 2 SUCCESS: Retrieved config from lovelace instance');
        return lovelace.config;
      } else {
        console.warn('⚠️ Method 2 FAILED: Lovelace instance not found or no config');
      }

      // Method 3: Try via panel element (hui-root)
      console.log('   Method 3: Panel element (hui-root)');
      const panelEl = document.querySelector('hui-root');
      if (panelEl) {
        console.log('   Found hui-root element');
        const panelLovelace = (panelEl as any).lovelace;
        if (panelLovelace) {
          console.log('   Found lovelace on hui-root');
          if (panelLovelace.config) {
            console.log('✅ Method 3 SUCCESS: Retrieved config from panel element');
            return panelLovelace.config;
          } else {
            console.warn('   Lovelace found but no config property');
          }
        } else {
          console.warn('   No lovelace property on hui-root');
        }
      } else {
        console.warn('⚠️ Method 3 FAILED: hui-root element not found');
      }

      // Method 4: Try accessing from DOM home-assistant element
      console.log('   Method 4: DOM home-assistant element');
      const haEl = document.querySelector('home-assistant');
      if (haEl && (haEl as any).lovelace && (haEl as any).lovelace.config) {
        console.log('✅ Method 4 SUCCESS: Retrieved config from DOM');
        return (haEl as any).lovelace.config;
      } else {
        console.warn('⚠️ Method 4 FAILED: home-assistant element not found or no config');
      }

      // Method 5: Try via ha-panel-lovelace
      console.log('   Method 5: ha-panel-lovelace element');
      const panelLovelace = document.querySelector('ha-panel-lovelace');
      if (panelLovelace) {
        console.log('   Found ha-panel-lovelace');
        const lovelacePanel = (panelLovelace as any).lovelace || (panelLovelace as any)._lovelace;
        if (lovelacePanel && lovelacePanel.config) {
          console.log('✅ Method 5 SUCCESS: Retrieved config from ha-panel-lovelace');
          return lovelacePanel.config;
        } else {
          console.warn('   ha-panel-lovelace found but no config');
        }
      } else {
        console.warn('⚠️ Method 5 FAILED: ha-panel-lovelace not found');
      }

      // Method 6: Last resort - try window.__lovelace
      console.log('   Method 6: window.__lovelace');
      if ((window as any).__lovelace) {
        const windowLovelace = (window as any).__lovelace;
        if (windowLovelace.config) {
          console.log('✅ Method 6 SUCCESS: Retrieved config from window.__lovelace');
          return windowLovelace.config;
        }
      } else {
        console.warn('⚠️ Method 6 FAILED: window.__lovelace not found');
      }

      console.error('❌ Could not retrieve Lovelace config via any method');
      console.log('   Dashboard Path:', dashboardPath);
      console.log('   Window location:', window.location.pathname);
      console.log('   Hass states available:', !!this.hass?.states);
      console.log('   Available elements:');
      console.log('     - home-assistant:', !!document.querySelector('home-assistant'));
      console.log('     - hui-root:', !!document.querySelector('hui-root'));
      console.log('     - ha-panel-lovelace:', !!document.querySelector('ha-panel-lovelace'));
      return null;
    } catch (error) {
      console.error('❌ Error getting Lovelace config:', error);
      return null;
    }
  }

  /**
   * Extract view information from Lovelace config
   */
  private extractViews(lovelaceConfig: any): DashboardView[] {
    if (!lovelaceConfig || !lovelaceConfig.views) {
      return [];
    }

    const views: DashboardView[] = [];

    lovelaceConfig.views.forEach((view: any, index: number) => {
      views.push({
        id: view.path || `view_${index}`,
        title: view.title || view.path || `View ${index + 1}`,
        path: view.path || `${index}`,
        icon: view.icon,
        panel: view.panel || false,
        theme: view.theme,
      });
    });

    return views;
  }

  /**
   * Scan a specific view for Ultra Cards
   */
  private scanViewForUltraCards(view: DashboardView, lovelaceConfig: any): DashboardCard[] {
    if (!lovelaceConfig || !lovelaceConfig.views) {
      return [];
    }

    const cards: DashboardCard[] = [];

    // Find the view in config
    const viewIndex = lovelaceConfig.views.findIndex(
      (v: any) => (v.path && v.path === view.path) || (v.title && v.title === view.title)
    );

    if (viewIndex === -1) {
      return cards;
    }

    const viewConfig = lovelaceConfig.views[viewIndex];

    console.log(`      View config found at index ${viewIndex}`);
    console.log(`      View type: "${viewConfig?.type || 'panel'}"`);

    // Handle "sections" view type (new Home Assistant layout)
    if (viewConfig.type === 'sections' && Array.isArray(viewConfig.sections)) {
      console.log(`      This is a SECTIONS view with ${viewConfig.sections.length} section(s)`);

      viewConfig.sections.forEach((section: any, sectionIndex: number) => {
        console.log(`        Section ${sectionIndex}: type="${section.type}"`);

        if (Array.isArray(section.cards)) {
          console.log(`          Found ${section.cards.length} cards in this section`);

          section.cards.forEach((cardConfig: any, cardIndexInSection: number) => {
            console.log(`          Card ${cardIndexInSection}: type="${cardConfig?.type}"`);

            // Check if this card is an Ultra Card
            if (this.isUltraCard(cardConfig)) {
              console.log(`            ✓ This is an Ultra Card!`);
              cards.push({
                config: cardConfig as UltraCardConfig,
                card_index: cards.length, // Global index across all sections
                view_id: view.id,
                view_title: view.title,
                view_path: view.path,
                card_name: cardConfig.card_name || `Ultra Card ${cards.length + 1}`,
                section_index: sectionIndex,
                card_index_in_section: cardIndexInSection,
              });
            } else {
              // Check for nested cards
              const nestedUltraCards = this.findNestedUltraCards(cardConfig);
              if (nestedUltraCards.length > 0) {
                console.log(
                  `            ✓ Found ${nestedUltraCards.length} nested Ultra Card(s) inside "${cardConfig?.type}"`
                );
                nestedUltraCards.forEach(nestedCard => {
                  cards.push({
                    config: nestedCard as UltraCardConfig,
                    card_index: cards.length, // Global index
                    view_id: view.id,
                    view_title: view.title,
                    view_path: view.path,
                    card_name: nestedCard.card_name || `Ultra Card ${cards.length + 1}`,
                    section_index: sectionIndex,
                    card_index_in_section: cardIndexInSection,
                  });
                });
              }
            }
          });
        }
      });

      return cards;
    }

    // Handle traditional views with direct cards array
    if (!viewConfig.cards || !Array.isArray(viewConfig.cards)) {
      console.warn(`      ⚠️ No cards array found in view config (and not a sections view)!`);
      return cards;
    }

    console.log(`      Traditional view with ${viewConfig.cards.length} card(s)`);

    // Scan each card in the view (including nested cards)
    viewConfig.cards.forEach((cardConfig: any, cardIndex: number) => {
      console.log(`      Card ${cardIndex}: type="${cardConfig?.type}"`);

      // Check if this card is an Ultra Card
      if (this.isUltraCard(cardConfig)) {
        console.log(`        ✓ This is an Ultra Card!`);
        cards.push({
          config: cardConfig as UltraCardConfig,
          card_index: cardIndex,
          view_id: view.id,
          view_title: view.title,
          view_path: view.path,
          card_name: cardConfig.card_name || `Ultra Card ${cardIndex + 1}`,
        });
      } else {
        // Check for nested cards (in stack cards, grid cards, etc.)
        const nestedUltraCards = this.findNestedUltraCards(cardConfig);
        if (nestedUltraCards.length > 0) {
          console.log(
            `        ✓ Found ${nestedUltraCards.length} nested Ultra Card(s) inside "${cardConfig?.type}"`
          );
          nestedUltraCards.forEach(nestedCard => {
            cards.push({
              config: nestedCard as UltraCardConfig,
              card_index: cardIndex, // Use parent card index
              view_id: view.id,
              view_title: view.title,
              view_path: view.path,
              card_name: nestedCard.card_name || `Ultra Card ${cardIndex + 1}`,
            });
          });
        }
      }
    });

    console.log(`  📍 View "${view.title}": Found ${cards.length} Ultra Cards`);

    return cards;
  }

  /**
   * Check if a card config is an Ultra Card
   */
  private isUltraCard(cardConfig: any): boolean {
    if (!cardConfig || typeof cardConfig !== 'object') {
      return false;
    }

    // Check for Ultra Card type identifiers
    return (
      cardConfig.type === 'custom:ultra-card' ||
      cardConfig.type === 'custom:ultra-vehicle-card' ||
      (cardConfig.layout && cardConfig.layout.rows) // Ultra Card has layout.rows
    );
  }

  /**
   * Recursively find Ultra Cards nested inside container cards
   */
  private findNestedUltraCards(cardConfig: any): any[] {
    const found: any[] = [];

    if (!cardConfig || typeof cardConfig !== 'object') {
      return found;
    }

    // Check for cards property (vertical-stack, horizontal-stack, grid, etc.)
    if (Array.isArray(cardConfig.cards)) {
      cardConfig.cards.forEach((nestedCard: any) => {
        if (this.isUltraCard(nestedCard)) {
          found.push(nestedCard);
        } else {
          // Recursively check nested cards
          found.push(...this.findNestedUltraCards(nestedCard));
        }
      });
    }

    // Check for card property (conditional card, entity card, etc.)
    if (cardConfig.card) {
      if (this.isUltraCard(cardConfig.card)) {
        found.push(cardConfig.card);
      } else {
        found.push(...this.findNestedUltraCards(cardConfig.card));
      }
    }

    return found;
  }

  /**
   * Create empty snapshot structure
   */
  private createEmptySnapshot(): DashboardSnapshot {
    return {
      cards: [],
      views: [],
      scanned_at: new Date().toISOString(),
      card_count: 0,
    };
  }

  /**
   * Validate that we can scan dashboards
   */
  async canScan(): Promise<boolean> {
    if (!this.hass) {
      return false;
    }

    try {
      const config = await this.getLovelaceConfig();
      return config !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get statistics about current dashboard
   */
  async getDashboardStats(): Promise<{
    total_views: number;
    total_cards: number;
    ultra_cards: number;
  }> {
    try {
      const lovelaceConfig = await this.getLovelaceConfig();

      if (!lovelaceConfig || !lovelaceConfig.views) {
        return { total_views: 0, total_cards: 0, ultra_cards: 0 };
      }

      const views = lovelaceConfig.views;
      let totalCards = 0;
      let ultraCards = 0;

      views.forEach((view: any) => {
        if (view.cards && Array.isArray(view.cards)) {
          totalCards += view.cards.length;
          ultraCards += view.cards.filter((card: any) => this.isUltraCard(card)).length;
        }
      });

      return {
        total_views: views.length,
        total_cards: totalCards,
        ultra_cards: ultraCards,
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return { total_views: 0, total_cards: 0, ultra_cards: 0 };
    }
  }
}

// Export singleton instance
export const ucDashboardScannerService = new UcDashboardScannerService();
