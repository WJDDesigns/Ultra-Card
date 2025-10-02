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

      for (const view of views) {
        const cardsInView = this.scanViewForUltraCards(view, lovelaceConfig);
        allCards.push(...cardsInView);
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
      return null;
    }

    try {
      // Method 1: Try to get from lovelace object (most reliable)
      if ((window as any).loadCardHelpers) {
        const helpers = await (window as any).loadCardHelpers();

        // Access lovelace instance
        const lovelace = (document.querySelector('home-assistant') as any)?.lovelace;

        if (lovelace && lovelace.config) {
          console.log('📥 Retrieved config from lovelace instance');
          return lovelace.config;
        }
      }

      // Method 2: Try via hass connection
      const dashboardPath = this.getCurrentDashboardPath();

      try {
        const config = await this.hass.callWS({
          type: 'lovelace/config',
          url_path: dashboardPath === 'default' ? null : dashboardPath,
        });

        if (config) {
          console.log('📥 Retrieved config via WebSocket');
          return config;
        }
      } catch (wsError) {
        console.warn('WebSocket config fetch failed:', wsError);
      }

      // Method 3: Try accessing from DOM
      const haEl = document.querySelector('home-assistant');
      if (haEl && (haEl as any).lovelace && (haEl as any).lovelace.config) {
        console.log('📥 Retrieved config from DOM');
        return (haEl as any).lovelace.config;
      }

      console.warn('⚠️ Could not retrieve Lovelace config via any method');
      return null;
    } catch (error) {
      console.error('Error getting Lovelace config:', error);
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

    if (!viewConfig.cards || !Array.isArray(viewConfig.cards)) {
      return cards;
    }

    // Scan each card in the view
    viewConfig.cards.forEach((cardConfig: any, cardIndex: number) => {
      if (this.isUltraCard(cardConfig)) {
        cards.push({
          config: cardConfig as UltraCardConfig,
          card_index: cardIndex,
          view_id: view.id,
          view_title: view.title,
          view_path: view.path,
          card_name: cardConfig.card_name || `Ultra Card ${cardIndex + 1}`,
        });
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
