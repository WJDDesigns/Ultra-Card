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

    try {
      // Get dashboard configuration
      const lovelaceConfig = await this.getLovelaceConfig();

      if (!lovelaceConfig) {
        return this.createEmptySnapshot();
      }

      // Extract views
      const views = this.extractViews(lovelaceConfig);

      // Scan each view for Ultra Cards
      const allCards: DashboardCard[] = [];

      for (const view of views) {
        const cardsInView = this.scanViewForUltraCards(view, lovelaceConfig);
        allCards.push(...cardsInView);
      }

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
   * Scan ALL dashboards for Ultra Cards (not just current dashboard)
   * Used for global external card limit enforcement
   */
  async scanAllDashboards(): Promise<DashboardSnapshot> {
    if (!this.hass) {
      throw new Error('Dashboard scanner not initialized with Home Assistant instance');
    }

    try {
      // Get list of all dashboards
      const dashboards: any = await this.hass.callWS({
        type: 'lovelace/dashboards/list',
      });

      const allCards: DashboardCard[] = [];
      const allViews: DashboardView[] = [];

      // Scan the default dashboard first
      try {
        const defaultConfig = await this.hass.callWS({
          type: 'lovelace/config',
          url_path: null,
        });

        if (defaultConfig) {
          const views = this.extractViews(defaultConfig);
          allViews.push(...views);

          for (const view of views) {
            const cardsInView = this.scanViewForUltraCards(view, defaultConfig);
            allCards.push(...cardsInView);
          }
        }
      } catch (error) {
        // Silently continue if default dashboard scan fails
      }

      // Scan all other dashboards
      if (Array.isArray(dashboards)) {
        for (const dashboard of dashboards) {
          const dashPath = dashboard.url_path || dashboard.id;

          try {
            const config = await this.hass.callWS({
              type: 'lovelace/config',
              url_path: dashPath,
            });

            if (config) {
              const views = this.extractViews(config);
              allViews.push(...views);

              for (const view of views) {
                const cardsInView = this.scanViewForUltraCards(view, config);
                allCards.push(...cardsInView);
              }
            }
          } catch (error) {
            // Silently continue if dashboard scan fails
          }
        }
      }

      return {
        cards: allCards,
        views: allViews,
        scanned_at: new Date().toISOString(),
        card_count: allCards.length,
        dashboard_path: 'all', // Indicate this is a global scan
      };
    } catch (error) {
      console.error('❌ Global dashboard scan failed:', error);
      throw new Error(`Failed to scan all dashboards: ${error.message}`);
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
      return null;
    }

    try {
      // Method 1a: Try via hass connection (WebSocket) - YAML mode
      const dashboardPath = this.getCurrentDashboardPath();

      try {
        const config = await this.hass.callWS({
          type: 'lovelace/config',
          url_path: dashboardPath === 'default' ? null : dashboardPath,
        });

        if (config) {
          return config;
        }
      } catch (wsError) {
        // Continue to next method
      }

      // Method 1b: Try to get dashboards list and access storage config
      try {
        // Get list of all dashboards
        const dashboards: any = await this.hass.callWS({
          type: 'lovelace/dashboards/list',
        });

        if (Array.isArray(dashboards)) {
          // Find our dashboard
          const targetDashboard = dashboards.find(
            (d: any) => d.url_path === dashboardPath || d.id === dashboardPath
          );

          if (targetDashboard) {
            // Try to get the config
            const config = await this.hass.callWS({
              type: 'lovelace/config',
              url_path: targetDashboard.url_path || targetDashboard.id,
            });

            if (config) {
              return config;
            }
          } else {
            // If not found in list, try getting it as the default lovelace dashboard
            try {
              const defaultConfig = await this.hass.callWS({
                type: 'lovelace/config',
                url_path: null, // null = default lovelace dashboard
              });

              if (defaultConfig) {
                return defaultConfig;
              }
            } catch (defaultError) {
              // Continue to next method
            }
          }
        }
      } catch (dashboardListError) {
        // Continue to next method
      }

      // Method 2: Try to get from lovelace object
      const lovelace = (document.querySelector('home-assistant') as any)?.lovelace;

      if (lovelace && lovelace.config) {
        return lovelace.config;
      }

      // Method 3: Try via panel element (hui-root)
      const panelEl = document.querySelector('hui-root');
      if (panelEl) {
        const panelLovelace = (panelEl as any).lovelace;
        if (panelLovelace && panelLovelace.config) {
          return panelLovelace.config;
        }
      }

      // Method 4: Try accessing from DOM home-assistant element
      const haEl = document.querySelector('home-assistant');
      if (haEl && (haEl as any).lovelace && (haEl as any).lovelace.config) {
        return (haEl as any).lovelace.config;
      }

      // Method 5: Try via ha-panel-lovelace
      const panelLovelace = document.querySelector('ha-panel-lovelace');
      if (panelLovelace) {
        const lovelacePanel = (panelLovelace as any).lovelace || (panelLovelace as any)._lovelace;
        if (lovelacePanel && lovelacePanel.config) {
          return lovelacePanel.config;
        }
      }

      // Method 6: Last resort - try window.__lovelace
      if ((window as any).__lovelace) {
        const windowLovelace = (window as any).__lovelace;
        if (windowLovelace.config) {
          return windowLovelace.config;
        }
      }

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

    // Handle "sections" view type (new Home Assistant layout)
    if (viewConfig.type === 'sections' && Array.isArray(viewConfig.sections)) {
      viewConfig.sections.forEach((section: any, sectionIndex: number) => {
        if (Array.isArray(section.cards)) {
          section.cards.forEach((cardConfig: any, cardIndexInSection: number) => {
            // Check if this card is an Ultra Card
            if (this.isUltraCard(cardConfig)) {
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
      return cards;
    }

    // Scan each card in the view (including nested cards)
    viewConfig.cards.forEach((cardConfig: any, cardIndex: number) => {
      // Check if this card is an Ultra Card
      if (this.isUltraCard(cardConfig)) {
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
