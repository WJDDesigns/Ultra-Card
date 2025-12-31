import { TemplateResult, html, css } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  SportsScoreModule,
  SportsGameData,
  SportsLeague,
  SportsDisplayStyle,
  UltraCardConfig,
} from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { sportsDataService, LEAGUE_NAMES, SportsDataService } from '../services/sports-data-service';
import { localize } from '../localize/localize';
import { getImageUrl } from '../utils/image-upload';
import '../components/ultra-color-picker';

/**
 * Sports Score Module - Pro Feature
 *
 * Displays live sports scores, upcoming games, and team information.
 * Features include:
 * - Dual data source support (HA sensors + ESPN API)
 * - Multiple display styles (scorecard, upcoming, compact, detailed, mini)
 * - Customizable element visibility
 * - Auto-refresh with configurable interval
 * - Full Ultra Card integration (actions, logic, design)
 */
export class UltraSportsScoreModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'sports_score',
    title: 'Sports Score',
    description: 'Display live sports scores, upcoming games, and team info for your favorite teams',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:scoreboard',
    category: 'data',
    tags: ['sports', 'scores', 'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'pro'],
  };

  // State stored per config key to prevent conflicts between multiple preview contexts
  private _stateByConfig: Map<string, {
    gameData: SportsGameData | null;
    loading: boolean;
    error: string | null;
    lastFetch: number;
    fetchInProgress: boolean;
  }> = new Map();
  
  // Auto-refresh intervals per config key for live game updates
  private _refreshIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private _teams: Map<SportsLeague, { id: string; name: string; logo: string }[]> = new Map();

  private _getState(configKey: string) {
    if (!this._stateByConfig.has(configKey)) {
      this._stateByConfig.set(configKey, {
        gameData: null,
        loading: false,
        error: null,
        lastFetch: 0,
        fetchInProgress: false,
      });
    }
    return this._stateByConfig.get(configKey)!;
  }

  // Track which interval key is currently active to detect changes
  private _activeIntervalKey: string = '';

  /**
   * Set up auto-refresh interval for live game updates.
   * Uses shorter intervals for live games, longer for scheduled games.
   */
  private _setupAutoRefresh(module: SportsScoreModule, configKey: string, isLive: boolean): void {
    // Calculate the appropriate refresh interval
    // Live games: use configured interval (default 5 min, min 1 min for live)
    // Scheduled games: check less frequently (every 10-15 min)
    const configuredMinutes = module.refresh_interval || 5;
    const refreshMinutes = isLive 
      ? Math.max(1, Math.min(configuredMinutes, 5)) // Live: 1-5 min, capped at configured
      : Math.max(configuredMinutes, 10); // Scheduled: at least 10 min
    const refreshMs = refreshMinutes * 60 * 1000;

    // Create a unique key for this interval configuration
    const intervalKey = `${configKey}_${refreshMs}_${isLive}`;
    
    // If we already have this exact interval set up, do nothing
    if (this._activeIntervalKey === intervalKey && this._refreshIntervals.has(configKey)) {
      return;
    }

    // Clean up ALL existing intervals when config changes
    // This prevents memory leaks from orphaned intervals
    if (this._refreshIntervals.size > 0) {
      for (const [key, id] of this._refreshIntervals.entries()) {
        clearInterval(id);
      }
      this._refreshIntervals.clear();
    }

    // Only set up auto-refresh for ESPN API (HA sensors are updated by HA itself)
    if (module.data_source !== 'espn_api') {
      this._activeIntervalKey = '';
      return;
    }

    // Don't set up refresh if no team is selected
    if (!module.team_id) {
      this._activeIntervalKey = '';
      return;
    }

    // Set up the new interval
    const intervalId = setInterval(() => {
      const state = this._getState(configKey);
      // Reset lastFetch to force a new fetch on next render
      state.lastFetch = 0;
      // Trigger a preview update which will call renderPreview and fetch new data
      this.triggerPreviewUpdate(true);
    }, refreshMs);

    this._refreshIntervals.set(configKey, intervalId);
    this._activeIntervalKey = intervalKey;

    // Log for debugging (can be removed in production)
    console.debug(`[Sports Module] Auto-refresh set up for ${configKey}: every ${refreshMinutes} min (live: ${isLive})`);
  }

  /**
   * Clean up all refresh intervals. Called when module is removed or changed.
   */
  public cleanup(): void {
    for (const [key, intervalId] of this._refreshIntervals.entries()) {
      clearInterval(intervalId);
    }
    this._refreshIntervals.clear();
    this._stateByConfig.clear();
    console.debug('[Sports Module] Cleaned up all refresh intervals');
  }

  /**
   * Clean up a specific config's refresh interval
   */
  private _cleanupConfigInterval(configKey: string): void {
    const intervalId = this._refreshIntervals.get(configKey);
    if (intervalId) {
      clearInterval(intervalId);
      this._refreshIntervals.delete(configKey);
    }
  }

  createDefault(id?: string, hass?: HomeAssistant): SportsScoreModule {
    return {
      id: id || this.generateId('sports_score'),
      type: 'sports_score',

      // Data source configuration
      data_source: 'espn_api',
      sensor_entity: '',
      league: 'nfl',
      team_id: '',
      team_name: '',

      // Display configuration
      display_style: 'scorecard',
      refresh_interval: 5,

      // Element visibility
      show_team_logos: true,
      show_team_names: true,
      show_team_records: true,
      show_game_time: true,
      show_venue: false,
      show_broadcast: false,
      show_score: true,
      show_odds: false,
      show_status_detail: true,

      // Styling
      use_team_colors: true,
      win_color: '#4caf50',
      loss_color: '#f44336',
      in_progress_color: '#ff9800',
      scheduled_color: 'var(--primary-text-color)',

      // Font sizes
      team_name_font_size: '16px',
      score_font_size: '32px',
      detail_font_size: '12px',

      // Layout
      logo_size: '48px',
      compact_mode: false,

      // Logo BG style options
      show_logo_background: true,
      logo_background_size: '80px',
      logo_background_opacity: 8,

      // Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Hover
      enable_hover_effect: false,
      hover_background_color: '',

      // Logic
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as SportsScoreModule, hass, updates => updateModule(updates));
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as SportsScoreModule, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const sportsModule = module as SportsScoreModule;
    const lang = hass?.locale?.language || 'en';

    // Check Pro authentication
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    // If not Pro, show lock UI
    if (!isPro) {
      return this.renderProLockUI(lang);
    }

    return html`
      <style>
        ${this.injectUcFormStyles()}
        ${this.getEditorStyles()}
      </style>

      <!-- Data Source Section -->
      ${this.renderDataSourceSection(sportsModule, hass, updateModule, lang)}

      <!-- Display Settings Section -->
      ${this.renderDisplaySettingsSection(sportsModule, hass, updateModule, lang)}

      <!-- Element Visibility Section -->
      ${this.renderElementVisibilitySection(sportsModule, hass, updateModule, lang)}

      <!-- Styling Section -->
      ${this.renderStylingSection(sportsModule, hass, updateModule, lang)}
    `;
  }

  private renderProLockUI(lang: string): TemplateResult {
    return html`
      <div class="pro-lock-container" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        text-align: center;
        background: var(--secondary-background-color);
        border-radius: 12px;
        margin: 16px;
      ">
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${localize('editor.pro.feature_locked', lang, 'Pro Feature')}
        </div>
        <div style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;">
          ${localize('editor.pro.sports_description', lang, 'Sports Score module requires an Ultra Card Pro subscription to display live sports scores and team information.')}
        </div>
        <a
          href="https://ultracard.io/pro"
          target="_blank"
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          "
        >
          <ha-icon icon="mdi:crown" style="--mdi-icon-size: 20px;"></ha-icon>
          ${localize('editor.pro.upgrade_button', lang, 'Upgrade to Pro')}
        </a>
      </div>
    `;
  }

  private renderDataSourceSection(
    module: SportsScoreModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<SportsScoreModule>) => void,
    lang: string
  ): TemplateResult {
    const leagues = sportsDataService.getSupportedLeagues();

    return html`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${localize('editor.sports.data_source', lang, 'DATA SOURCE')}
        </div>
        <div class="section-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize('editor.sports.data_source_desc', lang, 'Choose how to get sports data. Use an existing Home Assistant sensor (like Team Tracker) or fetch directly from ESPN.')}
        </div>

        <!-- Data Source Toggle -->
        ${this.renderFieldSection(
          localize('editor.sports.source_type', lang, 'Source Type'),
          localize('editor.sports.source_type_desc', lang, 'Select the data source for sports information'),
          hass,
          { data_source: module.data_source || 'espn_api' },
          [
            this.selectField('data_source', [
              { value: 'espn_api', label: 'ESPN API (No Setup Required)' },
              { value: 'ha_sensor', label: 'Home Assistant Sensor' },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ data_source: e.detail.value.data_source });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${module.data_source === 'ha_sensor'
          ? html`
              <div style="margin-top: 16px;">
                ${this.renderConditionalFieldsGroup(
                  localize('editor.sports.ha_sensor_config', lang, 'Home Assistant Sensor'),
                  html`
                    ${this.renderFieldSection(
                      localize('editor.sports.sensor_entity', lang, 'Sensor Entity'),
                      localize('editor.sports.sensor_entity_desc', lang, 'Select a Team Tracker or other sports sensor'),
                      hass,
                      { sensor_entity: module.sensor_entity || '' },
                      [
                        {
                          name: 'sensor_entity',
                          selector: { entity: { domain: 'sensor' } },
                        },
                      ],
                      (e: CustomEvent) => {
                        updateModule({ sensor_entity: e.detail.value.sensor_entity });
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }
                    )}

                    ${module.sensor_entity && hass.states[module.sensor_entity]
                      ? html`
                          <div style="margin-top: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                              ${localize('editor.sports.sensor_status', lang, 'Sensor Status')}:
                            </div>
                            <div style="font-size: 13px; color: var(--secondary-text-color);">
                              State: <strong>${hass.states[module.sensor_entity].state}</strong>
                            </div>
                          </div>
                        `
                      : ''}
                  `
                )}
              </div>
            `
          : html`
              <div style="margin-top: 16px;">
                ${this.renderConditionalFieldsGroup(
                  localize('editor.sports.espn_config', lang, 'ESPN Configuration'),
                  html`
                    <!-- League Selection -->
                    ${this.renderFieldSection(
                      localize('editor.sports.league', lang, 'League'),
                      localize('editor.sports.league_desc', lang, 'Select the sports league'),
                      hass,
                      { league: module.league || 'nfl' },
                      [
                        this.selectField(
                          'league',
                          leagues.map(l => ({ value: l.value, label: l.label }))
                        ),
                      ],
                      (e: CustomEvent) => {
                        updateModule({
                          league: e.detail.value.league,
                          team_id: '', // Reset team when league changes
                          team_name: '',
                        });
                        this._loadTeamsForLeague(e.detail.value.league);
                        // Use immediate update to force refresh
                        this.triggerPreviewUpdate(true);
                      }
                    )}

                    <!-- Team Selection -->
                    ${this.renderTeamSelector(module, hass, updateModule, lang)}
                  `
                )}
              </div>
            `}
      </div>
    `;
  }

  private renderTeamSelector(
    module: SportsScoreModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<SportsScoreModule>) => void,
    lang: string
  ): TemplateResult {
    const league = module.league || 'nfl';
    const teams = this._teams.get(league) || [];

    // Load teams if not already loaded
    if (teams.length === 0) {
      this._loadTeamsForLeague(league);
    }

    const teamOptions = teams.map(team => ({
      value: team.id,
      label: team.name,
    }));

    // Add current selection if it exists
    if (module.team_id && module.team_name && !teamOptions.find(t => t.value === module.team_id)) {
      teamOptions.unshift({ value: module.team_id, label: module.team_name });
    }

    return html`
      <div style="margin-top: 16px;">
        ${this.renderFieldSection(
          localize('editor.sports.team', lang, 'Team'),
          localize('editor.sports.team_desc', lang, 'Select your favorite team'),
          hass,
          { team_id: module.team_id || '' },
          [
            this.selectField(
              'team_id',
              teamOptions.length > 0
                ? teamOptions
                : [{ value: '', label: 'Loading teams...' }]
            ),
          ],
          (e: CustomEvent) => {
            const teamId = e.detail.value.team_id;
            const selectedTeam = teams.find(t => t.id === teamId);
            updateModule({
              team_id: teamId,
              team_name: selectedTeam?.name || '',
            });
            // Use immediate update to force refresh with new team
            this.triggerPreviewUpdate(true);
          }
        )}

        ${module.team_id && module.team_name
          ? html`
              <div style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                ${teams.find(t => t.id === module.team_id)?.logo
                  ? html`<img src="${teams.find(t => t.id === module.team_id)?.logo}" style="width: 32px; height: 32px; object-fit: contain;" />`
                  : ''}
                <div style="font-weight: 600;">${module.team_name}</div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private async _loadTeamsForLeague(league: SportsLeague): Promise<void> {
    if (this._teams.has(league)) {
      return;
    }

    try {
      const teams = await sportsDataService.getTeams(league);
      this._teams.set(
        league,
        teams.map(t => ({ id: t.id, name: t.name, logo: t.logo }))
      );
      this.triggerPreviewUpdate();
    } catch (error) {
      console.error('Sports module: Error loading teams:', error);
    }
  }

  private renderDisplaySettingsSection(
    module: SportsScoreModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<SportsScoreModule>) => void,
    lang: string
  ): TemplateResult {
    const displayStyles: { value: SportsDisplayStyle; label: string }[] = [
      { value: 'scorecard', label: 'Scorecard - Classic score display' },
      { value: 'upcoming', label: 'Upcoming - Next game info' },
      { value: 'compact', label: 'Compact - Single line ticker' },
      { value: 'detailed', label: 'Detailed - Full game info' },
      { value: 'mini', label: 'Mini - Small logo & score' },
      { value: 'logo_bg', label: 'Logo BG - Half-card with logo background' },
    ];

    return html`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${localize('editor.sports.display_settings', lang, 'DISPLAY SETTINGS')}
        </div>

        <!-- Display Style -->
        ${this.renderFieldSection(
          localize('editor.sports.display_style', lang, 'Display Style'),
          localize('editor.sports.display_style_desc', lang, 'Choose how to display the game information'),
          hass,
          { display_style: module.display_style || 'scorecard' },
          [this.selectField('display_style', displayStyles)],
          (e: CustomEvent) => {
            updateModule({ display_style: e.detail.value.display_style });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        <!-- Refresh Interval -->
        ${this.renderFieldSection(
          localize('editor.sports.refresh_interval', lang, 'Refresh Interval (minutes)'),
          localize('editor.sports.refresh_interval_desc', lang, 'How often to refresh the data (1-60 minutes)'),
          hass,
          { refresh_interval: module.refresh_interval || 5 },
          [this.numberField('refresh_interval', 1, 60)],
          (e: CustomEvent) => updateModule({ refresh_interval: e.detail.value.refresh_interval })
        )}
      </div>
    `;
  }

  private renderElementVisibilitySection(
    module: SportsScoreModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<SportsScoreModule>) => void,
    lang: string
  ): TemplateResult {
    const style = module.display_style || 'scorecard';

    // Define which toggles are available per style
    // Scorecard: logos, names, records, score, time, venue, broadcast, status
    // Upcoming: logos, names, time, venue, broadcast
    // Compact: logos, names, score, status
    // Detailed: logos, names, records, score, time, venue, broadcast, status, odds
    // Mini: logos, score, time, status

    const styleFeatures: Record<SportsDisplayStyle, string[]> = {
      scorecard: ['logos', 'names', 'records', 'score', 'time', 'venue', 'broadcast', 'status'],
      upcoming: ['logos', 'names', 'time', 'venue', 'broadcast'],
      compact: ['logos', 'names', 'score', 'status'],
      detailed: ['logos', 'names', 'records', 'score', 'time', 'venue', 'broadcast', 'status', 'odds'],
      mini: ['logos', 'score', 'time', 'status'],
      logo_bg: ['logos', 'names', 'score', 'time', 'status'],
    };

    const features = styleFeatures[style] || styleFeatures.scorecard;

    const toggleConfigs: Array<{
      key: string;
      field: keyof SportsScoreModule;
      title: string;
      titleKey: string;
      desc: string;
      descKey: string;
    }> = [
      { key: 'logos', field: 'show_team_logos', titleKey: 'editor.sports.show_team_logos', title: 'Team Logos', descKey: 'editor.sports.show_team_logos_desc', desc: 'Display team logos' },
      { key: 'names', field: 'show_team_names', titleKey: 'editor.sports.show_team_names', title: 'Team Names', descKey: 'editor.sports.show_team_names_desc', desc: 'Display team names' },
      { key: 'records', field: 'show_team_records', titleKey: 'editor.sports.show_team_records', title: 'Team Records', descKey: 'editor.sports.show_team_records_desc', desc: 'Display win-loss records' },
      { key: 'score', field: 'show_score', titleKey: 'editor.sports.show_score', title: 'Score', descKey: 'editor.sports.show_score_desc', desc: 'Display the game score' },
      { key: 'time', field: 'show_game_time', titleKey: 'editor.sports.show_game_time', title: 'Game Time', descKey: 'editor.sports.show_game_time_desc', desc: 'Display game date and time' },
      { key: 'venue', field: 'show_venue', titleKey: 'editor.sports.show_venue', title: 'Venue', descKey: 'editor.sports.show_venue_desc', desc: 'Display game venue/stadium' },
      { key: 'broadcast', field: 'show_broadcast', titleKey: 'editor.sports.show_broadcast', title: 'Broadcast Info', descKey: 'editor.sports.show_broadcast_desc', desc: 'Display TV/streaming channel' },
      { key: 'status', field: 'show_status_detail', titleKey: 'editor.sports.show_status_detail', title: 'Status Details', descKey: 'editor.sports.show_status_detail_desc', desc: 'Display quarter/period/inning info' },
      { key: 'odds', field: 'show_odds', titleKey: 'editor.sports.show_odds', title: 'Betting Odds', descKey: 'editor.sports.show_odds_desc', desc: 'Display spread and over/under' },
    ];

    // Filter to only show toggles relevant to this style
    const relevantToggles = toggleConfigs.filter((t) => features.includes(t.key));

    return html`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${localize('editor.sports.element_visibility', lang, 'ELEMENT VISIBILITY')}
        </div>
        <div class="section-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize('editor.sports.element_visibility_desc', lang, 'Choose which elements to show in the display')}
          <span style="display: block; margin-top: 4px; font-style: italic; opacity: 0.8;">
            Showing options for: <strong>${style.charAt(0).toUpperCase() + style.slice(1)}</strong> style
          </span>
        </div>
        
        <!-- Data availability note -->
        <div style="background: rgba(var(--rgb-primary-color), 0.1); border-left: 3px solid var(--primary-color); padding: 8px 12px; margin-bottom: 16px; border-radius: 0 4px 4px 0; font-size: 12px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:information-outline" style="--mdi-icon-size: 14px; margin-right: 4px; vertical-align: middle;"></ha-icon>
          <span style="vertical-align: middle;">Some data (records, broadcast, odds) may not be available for all leagues or games depending on the data source.</span>
        </div>

        ${this.renderSettingsSection(
          '',
          '',
          relevantToggles.map((toggle) => ({
            title: localize(toggle.titleKey, lang, toggle.title),
            description: localize(toggle.descKey, lang, toggle.desc),
            hass,
            data: { [toggle.field]: module[toggle.field] },
            schema: [this.booleanField(toggle.field)],
            onChange: (e: CustomEvent) => {
              updateModule({ [toggle.field]: e.detail.value[toggle.field] } as Partial<SportsScoreModule>);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
          }))
        )}
      </div>
    `;
  }

  private renderStylingSection(
    module: SportsScoreModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<SportsScoreModule>) => void,
    lang: string
  ): TemplateResult {
    const style = module.display_style || 'scorecard';

    // Define which size controls are available per style
    // Scorecard: logo, score, name, detail
    // Upcoming: logo, name, detail
    // Compact: logo, score, name
    // Detailed: logo, score, name, detail
    // Mini: logo, score

    const styleSizeFeatures: Record<SportsDisplayStyle, string[]> = {
      scorecard: ['logo', 'score', 'name', 'detail'],
      upcoming: ['logo', 'name', 'detail'],
      compact: ['logo', 'score', 'name'],
      detailed: ['logo', 'score', 'name', 'detail'],
      mini: ['logo', 'score'],
      logo_bg: ['logo', 'score', 'name'],
    };

    const sizeFeatures = styleSizeFeatures[style] || styleSizeFeatures.scorecard;
    const hasScore = sizeFeatures.includes('score');
    const hasName = sizeFeatures.includes('name');
    const hasDetail = sizeFeatures.includes('detail');

    return html`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${localize('editor.sports.styling', lang, 'STYLING')}
        </div>

        <!-- Use Team Colors -->
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.sports.use_team_colors', lang, 'Use Team Colors'),
            description: localize('editor.sports.use_team_colors_desc', lang, 'Automatically apply team brand colors'),
            hass,
            data: { use_team_colors: module.use_team_colors },
            schema: [this.booleanField('use_team_colors')],
            onChange: (e: CustomEvent) => {
              updateModule({ use_team_colors: e.detail.value.use_team_colors });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
          },
        ])}

        <!-- Status Colors -->
        <div style="margin-top: 16px;">
          <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">
            ${localize('editor.sports.status_colors', lang, 'Status Colors')}
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${localize('editor.sports.in_progress_color', lang, 'Live/In Progress')}
              </div>
              <ultra-color-picker
                .value=${module.in_progress_color || '#ff9800'}
                .defaultValue=${'#ff9800'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ in_progress_color: e.detail.value });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              ></ultra-color-picker>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${localize('editor.sports.scheduled_color', lang, 'Scheduled')}
              </div>
              <ultra-color-picker
                .value=${module.scheduled_color || 'var(--primary-text-color)'}
                .defaultValue=${'var(--primary-text-color)'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ scheduled_color: e.detail.value });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              ></ultra-color-picker>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${localize('editor.sports.win_color', lang, 'Win')}
              </div>
              <ultra-color-picker
                .value=${module.win_color || '#4caf50'}
                .defaultValue=${'#4caf50'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ win_color: e.detail.value });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              ></ultra-color-picker>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${localize('editor.sports.loss_color', lang, 'Loss')}
              </div>
              <ultra-color-picker
                .value=${module.loss_color || '#f44336'}
                .defaultValue=${'#f44336'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ loss_color: e.detail.value });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              ></ultra-color-picker>
            </div>
          </div>
        </div>

        <!-- Size Controls - Conditional per style -->
        <div style="margin-top: 24px;">
          <div class="section-title" style="font-size: 16px; margin-bottom: 16px;">
            ${localize('editor.sports.size_controls', lang, 'SIZE CONTROLS')}
            <span style="font-weight: 400; font-size: 12px; color: var(--secondary-text-color); margin-left: 8px;">
              (${style.charAt(0).toUpperCase() + style.slice(1)} style)
            </span>
          </div>
          
          <!-- Logo Size - Always available -->
          ${this._renderSizeSlider(
            module,
            updateModule,
            'logo_size',
            localize('editor.sports.logo_size', lang, 'Logo Size'),
            localize('editor.sports.logo_size_desc', lang, 'Size of team logos in pixels'),
            16,
            96,
            style === 'mini' ? 32 : style === 'compact' ? 20 : style === 'detailed' ? 56 : 48
          )}

          <!-- Score Font Size - Conditional -->
          ${hasScore
            ? this._renderSizeSlider(
                module,
                updateModule,
                'score_font_size',
                localize('editor.sports.score_font_size', lang, 'Score Font Size'),
                localize('editor.sports.score_font_size_desc', lang, 'Size of score text in pixels'),
                12,
                64,
                style === 'mini' ? 16 : style === 'compact' ? 14 : style === 'detailed' ? 36 : 32
              )
            : ''}

          <!-- Team Name Font Size - Conditional -->
          ${hasName
            ? this._renderSizeSlider(
                module,
                updateModule,
                'team_name_font_size',
                localize('editor.sports.team_name_font_size', lang, 'Team Name Font Size'),
                localize('editor.sports.team_name_font_size_desc', lang, 'Size of team name text in pixels'),
                10,
                32,
                style === 'detailed' ? 15 : style === 'compact' ? 14 : 16
              )
            : ''}

          <!-- Detail Font Size - Conditional -->
          ${hasDetail
            ? this._renderSizeSlider(
                module,
                updateModule,
                'detail_font_size',
                localize('editor.sports.detail_font_size', lang, 'Detail Font Size'),
                localize('editor.sports.detail_font_size_desc', lang, 'Size of detail text (records, venue, etc.) in pixels'),
                8,
                20,
                12
              )
            : ''}
        </div>

        <!-- Logo BG Style Options - Only shown for logo_bg style -->
        ${style === 'logo_bg'
          ? html`
              <div style="margin-top: 24px;">
                <div class="section-title" style="font-size: 16px; margin-bottom: 16px;">
                  ${localize('editor.sports.logo_bg_options', lang, 'BACKGROUND LOGO OPTIONS')}
                </div>
                
                <!-- Show Logo Background Toggle -->
                ${this.renderSettingsSection('', '', [
                  {
                    title: localize('editor.sports.show_logo_background', lang, 'Show Background Logos'),
                    description: localize('editor.sports.show_logo_background_desc', lang, 'Display subtle watermark logos in the background'),
                    hass,
                    data: { show_logo_background: module.show_logo_background !== false },
                    schema: [this.booleanField('show_logo_background')],
                    onChange: (e: CustomEvent) => {
                      updateModule({ show_logo_background: e.detail.value.show_logo_background });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                  },
                ])}

                ${module.show_logo_background !== false
                  ? html`
                      <div style="margin-top: 16px;">
                        ${this._renderSizeSlider(
                          module,
                          updateModule,
                          'logo_background_size',
                          localize('editor.sports.logo_background_size', lang, 'Background Logo Size'),
                          localize('editor.sports.logo_background_size_desc', lang, 'Size of the watermark logos in the background'),
                          40,
                          150,
                          80
                        )}
                      </div>
                      <div style="margin-top: 16px;">
                        <div class="field-container">
                          <div class="field-title">${localize('editor.sports.logo_background_opacity', lang, 'Background Logo Opacity')}</div>
                          <div class="field-description">${localize('editor.sports.logo_background_opacity_desc', lang, 'Transparency of the watermark logos (1-20%)')}</div>
                          <div class="gap-control-container">
                            <input
                              type="range"
                              class="gap-slider"
                              min="1"
                              max="20"
                              step="1"
                              .value="${String(module.logo_background_opacity || 8)}"
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                updateModule({ logo_background_opacity: parseInt(target.value, 10) });
                                this.triggerPreviewUpdate();
                              }}
                            />
                            <input
                              type="number"
                              class="gap-input"
                              min="1"
                              max="20"
                              step="1"
                              .value="${String(module.logo_background_opacity || 8)}"
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                const numValue = parseInt(target.value, 10);
                                if (!isNaN(numValue) && numValue >= 1 && numValue <= 20) {
                                  updateModule({ logo_background_opacity: numValue });
                                  this.triggerPreviewUpdate();
                                }
                              }}
                            />
                            <span style="font-size: 12px; color: var(--secondary-text-color); min-width: 20px;">%</span>
                            <button
                              class="reset-btn"
                              @click=${() => {
                                updateModule({ logo_background_opacity: 8 });
                                this.triggerPreviewUpdate();
                              }}
                              title="Reset to default (8%)"
                            >
                              <ha-icon icon="mdi:refresh"></ha-icon>
                            </button>
                          </div>
                        </div>
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private getEditorStyles(): string {
    return `
      .settings-section {
        margin-bottom: 16px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
      }
      .section-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 16px;
      }
      .field-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .field-description {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        padding: 16px;
      }
      /* Slider control styles */
      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .gap-slider {
        flex: 1;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .gap-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .gap-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .gap-slider:hover {
        background: var(--primary-color);
        opacity: 0.7;
      }
      .gap-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
      }
      .gap-slider:hover::-moz-range-thumb {
        transform: scale(1.1);
      }
      .gap-input {
        width: 56px !important;
        max-width: 56px !important;
        min-width: 56px !important;
        padding: 4px 6px !important;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }
      .gap-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }
      .reset-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }
      .reset-btn ha-icon {
        font-size: 16px;
      }
    `;
  }

  /**
   * Render a size slider control with input field and reset button
   */
  private _renderSizeSlider(
    module: SportsScoreModule,
    updateModule: (updates: Partial<SportsScoreModule>) => void,
    property: keyof SportsScoreModule,
    label: string,
    description: string,
    min: number,
    max: number,
    defaultValue: number,
    unit: string = 'px'
  ): TemplateResult {
    // Parse current value - strip 'px' suffix if present
    const rawValue = module[property] as string | number | undefined;
    const currentValue = typeof rawValue === 'string' 
      ? parseInt(rawValue.replace(unit, ''), 10) || defaultValue
      : typeof rawValue === 'number' 
        ? rawValue 
        : defaultValue;

    return html`
      <div class="field-container" style="margin-bottom: 16px;">
        <div class="field-title">${label}</div>
        <div class="field-description">${description}</div>
        <div class="gap-control-container">
          <input
            type="range"
            class="gap-slider"
            min="${min}"
            max="${max}"
            step="1"
            .value="${String(currentValue)}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const newValue = `${target.value}${unit}`;
              updateModule({ [property]: newValue } as Partial<SportsScoreModule>);
              this.triggerPreviewUpdate();
            }}
          />
          <input
            type="number"
            class="gap-input"
            min="${min}"
            max="${max}"
            step="1"
            .value="${String(currentValue)}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const numValue = parseInt(target.value, 10);
              if (!isNaN(numValue) && numValue >= min && numValue <= max) {
                const newValue = `${numValue}${unit}`;
                updateModule({ [property]: newValue } as Partial<SportsScoreModule>);
                this.triggerPreviewUpdate();
              }
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                const current = parseInt(target.value, 10) || defaultValue;
                const increment = e.key === 'ArrowUp' ? 1 : -1;
                const newNum = Math.max(min, Math.min(max, current + increment));
                const newValue = `${newNum}${unit}`;
                updateModule({ [property]: newValue } as Partial<SportsScoreModule>);
                this.triggerPreviewUpdate();
              }
            }}
          />
          <button
            class="reset-btn"
            @click=${() => {
              const newValue = `${defaultValue}${unit}`;
              updateModule({ [property]: newValue } as Partial<SportsScoreModule>);
              this.triggerPreviewUpdate();
            }}
            title="Reset to default (${defaultValue}${unit})"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  // ============================================
  // PREVIEW RENDERING
  // ============================================

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const sportsModule = module as SportsScoreModule;
    const moduleWithDesign = sportsModule as any;
    const designFromDesignObject = (sportsModule as any).design || {};

    // Check Pro access for preview
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    if (!isPro) {
      return this.renderLockedPreview();
    }

    // Create config key from the MODULE being rendered (not from singleton state)
    const configKey = `${sportsModule.data_source}_${sportsModule.league}_${sportsModule.team_id}_${sportsModule.sensor_entity}`;
    const state = this._getState(configKey);

    // Start data fetch if needed (async - will trigger update when complete)
    this._fetchDataIfNeeded(sportsModule, hass, configKey);

    // Only show loading while an actual fetch is in progress for THIS config
    if (state.loading) {
      return this.renderLoadingState();
    }

    // Store state temporarily for style renderers to access
    this._currentGameData = state.gameData;
    this._currentError = state.error;
    this._currentLoading = state.loading;

    // Set up auto-refresh based on game status (only after initial fetch completes)
    if (state.gameData && !state.loading) {
      const isLive = SportsDataService.isLive(state.gameData.status);
      this._setupAutoRefresh(sportsModule, configKey, isLive);
    } else if (!state.loading && !state.fetchInProgress && sportsModule.team_id) {
      // Even without game data, set up a refresh to check for upcoming games
      this._setupAutoRefresh(sportsModule, configKey, false);
    }

    // Extract design properties (prioritize top-level over design object)
    const designProperties = {
      background_color: moduleWithDesign.background_color || designFromDesignObject.background_color,
      background_image: moduleWithDesign.background_image || designFromDesignObject.background_image,
      background_image_type: moduleWithDesign.background_image_type || designFromDesignObject.background_image_type,
      background_image_entity: moduleWithDesign.background_image_entity || designFromDesignObject.background_image_entity,
      background_image_upload: moduleWithDesign.background_image_upload || designFromDesignObject.background_image_upload,
      background_image_url: moduleWithDesign.background_image_url || designFromDesignObject.background_image_url,
      background_size: moduleWithDesign.background_size || designFromDesignObject.background_size,
      background_position: moduleWithDesign.background_position || designFromDesignObject.background_position,
      background_repeat: moduleWithDesign.background_repeat || designFromDesignObject.background_repeat,
      padding_top: designFromDesignObject.padding_top !== undefined ? designFromDesignObject.padding_top : moduleWithDesign.padding_top,
      padding_bottom: designFromDesignObject.padding_bottom !== undefined ? designFromDesignObject.padding_bottom : moduleWithDesign.padding_bottom,
      padding_left: designFromDesignObject.padding_left !== undefined ? designFromDesignObject.padding_left : moduleWithDesign.padding_left,
      padding_right: designFromDesignObject.padding_right !== undefined ? designFromDesignObject.padding_right : moduleWithDesign.padding_right,
      margin_top: designFromDesignObject.margin_top !== undefined ? designFromDesignObject.margin_top : moduleWithDesign.margin_top,
      margin_bottom: designFromDesignObject.margin_bottom !== undefined ? designFromDesignObject.margin_bottom : moduleWithDesign.margin_bottom,
      margin_left: designFromDesignObject.margin_left !== undefined ? designFromDesignObject.margin_left : moduleWithDesign.margin_left,
      margin_right: designFromDesignObject.margin_right !== undefined ? designFromDesignObject.margin_right : moduleWithDesign.margin_right,
      border_style: moduleWithDesign.border_style || designFromDesignObject.border_style,
      border_width: moduleWithDesign.border_width || designFromDesignObject.border_width,
      border_color: moduleWithDesign.border_color || designFromDesignObject.border_color,
      border_radius: moduleWithDesign.border_radius || designFromDesignObject.border_radius,
      box_shadow_h: moduleWithDesign.box_shadow_h || designFromDesignObject.box_shadow_h,
      box_shadow_v: moduleWithDesign.box_shadow_v || designFromDesignObject.box_shadow_v,
      box_shadow_blur: moduleWithDesign.box_shadow_blur || designFromDesignObject.box_shadow_blur,
      box_shadow_spread: moduleWithDesign.box_shadow_spread || designFromDesignObject.box_shadow_spread,
      box_shadow_color: moduleWithDesign.box_shadow_color || designFromDesignObject.box_shadow_color,
      width: moduleWithDesign.width || designFromDesignObject.width,
      height: moduleWithDesign.height || designFromDesignObject.height,
      min_width: moduleWithDesign.min_width || designFromDesignObject.min_width,
      min_height: moduleWithDesign.min_height || designFromDesignObject.min_height,
      max_width: moduleWithDesign.max_width || designFromDesignObject.max_width,
      max_height: moduleWithDesign.max_height || designFromDesignObject.max_height,
      overflow: moduleWithDesign.overflow || designFromDesignObject.overflow,
      backdrop_filter: moduleWithDesign.backdrop_filter || designFromDesignObject.backdrop_filter,
      background_filter: moduleWithDesign.background_filter || designFromDesignObject.background_filter,
    };

    // Check if background filter is present - requires pseudo-element approach
    const hasBackgroundFilter = designProperties.background_filter && designProperties.background_filter !== 'none';
    const bgImageCSS = this.getBackgroundImageCSS(designProperties, hass);

    // Build container styles
    // When background_filter is present, we use CSS variables for pseudo-element approach
    const containerStyles: Record<string, string> = {
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left) || '0px'}`
          : '0',
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right
          ? `${this.addPixelUnit(designProperties.margin_top) || '0px'} ${this.addPixelUnit(designProperties.margin_right) || '0px'} ${this.addPixelUnit(designProperties.margin_bottom) || '0px'} ${this.addPixelUnit(designProperties.margin_left) || '0px'}`
          : '0',
      // When background filter is present, set background on pseudo-element via CSS variables
      background: hasBackgroundFilter ? 'transparent' : (designProperties.background_color || 'var(--card-background-color, var(--ha-card-background))'),
      backgroundImage: hasBackgroundFilter ? 'none' : bgImageCSS,
      backgroundSize: hasBackgroundFilter ? 'auto' : (designProperties.background_size || 'cover'),
      backgroundPosition: hasBackgroundFilter ? 'center' : (designProperties.background_position || 'center'),
      backgroundRepeat: hasBackgroundFilter ? 'repeat' : (designProperties.background_repeat || 'no-repeat'),
      backdropFilter: designProperties.backdrop_filter || 'none',
      border:
        designProperties.border_style && designProperties.border_style !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width) || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius: this.addPixelUnit(designProperties.border_radius) || '8px',
      boxShadow:
        designProperties.box_shadow_h || designProperties.box_shadow_v || designProperties.box_shadow_blur
          ? `${designProperties.box_shadow_h || '0px'} ${designProperties.box_shadow_v || '0px'} ${designProperties.box_shadow_blur || '0px'} ${designProperties.box_shadow_spread || '0px'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.2)'}`
          : 'none',
      width: designProperties.width || 'auto',
      height: designProperties.height || 'auto',
      minWidth: designProperties.min_width || 'auto',
      minHeight: designProperties.min_height || 'auto',
      maxWidth: designProperties.max_width || 'none',
      maxHeight: designProperties.max_height || 'none',
      overflow: hasBackgroundFilter ? 'hidden' : (designProperties.overflow || 'visible'),
    };

    // Add CSS variables for pseudo-element when background filter is present
    if (hasBackgroundFilter) {
      containerStyles['--bg-image'] = bgImageCSS;
      containerStyles['--bg-color'] = designProperties.background_color || 'var(--card-background-color, var(--ha-card-background))';
      containerStyles['--bg-size'] = designProperties.background_size || 'cover';
      containerStyles['--bg-position'] = designProperties.background_position || 'center';
      containerStyles['--bg-repeat'] = designProperties.background_repeat || 'no-repeat';
      containerStyles['--bg-filter'] = designProperties.background_filter;
      containerStyles['position'] = 'relative';
      containerStyles['isolation'] = 'isolate';
    }

    // Get style content based on display style
    let styleContent: TemplateResult;
    switch (sportsModule.display_style) {
      case 'upcoming':
        styleContent = this.renderUpcomingStyle(sportsModule, hass);
        break;
      case 'compact':
        styleContent = this.renderCompactStyle(sportsModule, hass);
        break;
      case 'detailed':
        styleContent = this.renderDetailedStyle(sportsModule, hass);
        break;
      case 'mini':
        styleContent = this.renderMiniStyle(sportsModule, hass);
        break;
      case 'logo_bg':
        styleContent = this.renderLogoBgStyle(sportsModule, hass);
        break;
      case 'scorecard':
      default:
        styleContent = this.renderScorecardStyle(sportsModule, hass);
        break;
    }

    // Wrap content with design container
    const filterClass = hasBackgroundFilter ? 'has-background-filter' : '';
    
    return html`
      <style>
        /* Background filter support - use pseudo-element to avoid blurring content */
        .sports-module-container.has-background-filter {
          position: relative;
          isolation: isolate;
        }
        .sports-module-container.has-background-filter::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-color);
          background-image: var(--bg-image);
          background-size: var(--bg-size);
          background-position: var(--bg-position);
          background-repeat: var(--bg-repeat);
          filter: var(--bg-filter);
          border-radius: inherit;
          z-index: -1;
          pointer-events: none;
        }
      </style>
      <div class="sports-module-container ${filterClass}" style="${this.styleObjectToCss(containerStyles)}">
        ${styleContent}
      </div>
    `;
  }

  /**
   * Helper to convert design properties to background image CSS
   */
  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;
    const backgroundUpload = moduleWithDesign.background_image_upload;
    const backgroundUrl = moduleWithDesign.background_image_url;

    if (!imageType || imageType === 'none') return 'none';

    switch (imageType) {
      case 'upload': {
        const img = backgroundUpload || backgroundImage;
        if (img) {
          const resolved = getImageUrl(hass, img);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        const url = backgroundUrl || backgroundImage;
        if (url) {
          return `url("${url}")`;
        }
        break;
      }
      case 'entity': {
        if (backgroundEntity && hass.states[backgroundEntity]) {
          const entityState = hass.states[backgroundEntity];
          const imageUrl = entityState.attributes?.entity_picture || entityState.state;
          if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
            return `url("${imageUrl}")`;
          }
        }
        break;
      }
    }

    return 'none';
  }

  /**
   * Convert style object to CSS string
   * Only filters out undefined/null - lets valid CSS values through
   */
  private styleObjectToCss(styles: Record<string, any>): string {
    return Object.entries(styles)
      .filter(([key, value]) => {
        // Skip undefined/null
        if (value === undefined || value === null) return false;
        // Skip default/reset values that shouldn't be applied (but not for CSS variables)
        if (!key.startsWith('--')) {
          if (key === 'padding' && value === '0') return false;
          if (key === 'margin' && value === '0') return false;
          if (key === 'border' && value === 'none') return false;
          if (key === 'boxShadow' && value === 'none') return false;
          if (key === 'backgroundImage' && value === 'none') return false;
          if (key === 'backdropFilter' && value === 'none') return false;
        }
        return true;
      })
      .map(([key, value]) => {
        // CSS variables should be kept as-is (e.g., --bg-image)
        if (key.startsWith('--')) {
          return `${key}: ${value}`;
        }
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  // Temporary storage for current render's state (avoids multiple Map lookups)
  private _currentGameData: SportsGameData | null = null;
  private _currentError: string | null = null;
  private _currentLoading: boolean = false;

  private renderLockedPreview(): TemplateResult {
    return html`
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        text-align: center;
      ">
        <ha-icon icon="mdi:lock" style="color: var(--primary-color); --mdi-icon-size: 32px; margin-bottom: 8px;"></ha-icon>
        <div style="font-size: 14px; font-weight: 600;">Pro Feature</div>
        <div style="font-size: 12px; color: var(--secondary-text-color);">Upgrade to view sports scores</div>
      </div>
    `;
  }

  private async _fetchDataIfNeeded(module: SportsScoreModule, hass: HomeAssistant, configKey: string): Promise<void> {
    const refreshMs = (module.refresh_interval || 5) * 60 * 1000;
    const now = Date.now();
    const state = this._getState(configKey);

    // Skip if we recently fetched for this config
    if (state.lastFetch > 0 && now - state.lastFetch < refreshMs) {
      return;
    }

    // Skip if a fetch is already in progress for this config
    if (state.fetchInProgress) {
      return;
    }

    // Mark fetch as in progress
    state.fetchInProgress = true;
    state.loading = true;
    state.error = null;

    try {
      const data = await sportsDataService.getGameData(
        hass,
        module.data_source,
        module.sensor_entity,
        module.league,
        module.team_id
      );

      // Update state for this config
      state.gameData = data;
      state.lastFetch = Date.now();
      state.loading = false;
      state.fetchInProgress = false;
      
      // Trigger update after fetch completes
      this.triggerPreviewUpdate(true);
    } catch (error: any) {
      state.error = error.message || 'Failed to fetch data';
      state.lastFetch = Date.now();
      state.loading = false;
      state.fetchInProgress = false;
      
      // Trigger update after fetch fails
      this.triggerPreviewUpdate(true);
    }
  }

  private renderScorecardStyle(module: SportsScoreModule, hass: HomeAssistant): TemplateResult {
    const data = this._currentGameData;
    const logoSize = module.logo_size || '48px';
    const scoreFontSize = module.score_font_size || '32px';
    const nameFontSize = module.team_name_font_size || '16px';

    if (this._currentLoading) {
      return this.renderLoadingState();
    }

    if (this._currentError || !data) {
      return this.renderNoDataState(module);
    }

    const isLive = SportsDataService.isLive(data.status);
    const statusColor = isLive
      ? module.in_progress_color || '#ff9800'
      : data.status === 'final'
      ? 'var(--secondary-text-color)'
      : module.scheduled_color || 'var(--primary-text-color)';

    const homeColor = module.use_team_colors && data.homeTeam.color ? data.homeTeam.color : 'inherit';
    const awayColor = module.use_team_colors && data.awayTeam.color ? data.awayTeam.color : 'inherit';

    return html`
      <style>
        .sports-scorecard {
          padding: 16px;
          border-radius: inherit;
          background: transparent;
        }
        .sports-scorecard .teams-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .sports-scorecard .team {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }
        .sports-scorecard .team-logo {
          width: ${logoSize};
          height: ${logoSize};
          object-fit: contain;
          margin-bottom: 8px;
        }
        .sports-scorecard .team-name {
          font-size: ${nameFontSize};
          font-weight: 600;
          margin-bottom: 4px;
        }
        .sports-scorecard .team-record {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .sports-scorecard .score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px;
        }
        .sports-scorecard .score {
          font-size: ${scoreFontSize};
          font-weight: 700;
        }
        .sports-scorecard .status {
          font-size: 12px;
          font-weight: 600;
          margin-top: 4px;
          text-transform: uppercase;
        }
        .sports-scorecard .game-info {
          text-align: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--divider-color);
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: ${module.in_progress_color || '#ff9800'};
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>

      <div class="sports-scorecard">
        <div class="teams-container">
          <!-- Away Team -->
          <div class="team">
            ${module.show_team_logos && data.awayTeam.logo
              ? html`<img class="team-logo" src="${data.awayTeam.logo}" alt="${data.awayTeam.name}" />`
              : ''}
            ${module.show_team_names
              ? html`<div class="team-name" style="color: ${awayColor}">${data.awayTeam.abbreviation || data.awayTeam.name}</div>`
              : ''}
            ${module.show_team_records && data.awayTeam.record
              ? html`<div class="team-record">${data.awayTeam.record}</div>`
              : ''}
          </div>

          <!-- Score -->
          <div class="score-container">
            ${module.show_score && this._hasValidScore(data.awayTeam.score, data.homeTeam.score)
              ? html`<div class="score">${this._formatScore(data.awayTeam.score)} - ${this._formatScore(data.homeTeam.score)}</div>`
              : html`<div class="score" style="font-size: 16px;">vs</div>`}
            ${module.show_status_detail
              ? html`
                  <div class="status" style="color: ${statusColor}">
                    ${isLive
                      ? html`<span class="live-indicator"><span class="live-dot"></span> ${SportsDataService.getStatusText(data.status, data.statusDetail)}</span>`
                      : SportsDataService.getStatusText(data.status, data.statusDetail)}
                  </div>
                `
              : ''}
          </div>

          <!-- Home Team -->
          <div class="team">
            ${module.show_team_logos && data.homeTeam.logo
              ? html`<img class="team-logo" src="${data.homeTeam.logo}" alt="${data.homeTeam.name}" />`
              : ''}
            ${module.show_team_names
              ? html`<div class="team-name" style="color: ${homeColor}">${data.homeTeam.abbreviation || data.homeTeam.name}</div>`
              : ''}
            ${module.show_team_records && data.homeTeam.record
              ? html`<div class="team-record">${data.homeTeam.record}</div>`
              : ''}
          </div>
        </div>

        ${module.show_game_time || module.show_venue || module.show_broadcast
          ? html`
              <div class="game-info">
                ${module.show_game_time && data.gameTime
                  ? html`<div>${SportsDataService.formatGameTime(data.gameTime)}</div>`
                  : ''}
                ${module.show_venue && data.venue ? html`<div>${data.venue}</div>` : ''}
                ${module.show_broadcast && data.broadcast ? html`<div>📺 ${data.broadcast}</div>` : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderUpcomingStyle(module: SportsScoreModule, hass: HomeAssistant): TemplateResult {
    const data = this._currentGameData;
    const logoSize = module.logo_size || '48px';
    const nameFontSize = module.team_name_font_size || '16px';
    const detailFontSize = module.detail_font_size || '12px';

    if (this._currentLoading) {
      return this.renderLoadingState();
    }

    if (this._currentError || !data) {
      return this.renderNoDataState(module);
    }

    return html`
      <style>
        .sports-upcoming {
          padding: 16px;
          border-radius: inherit;
          background: transparent;
        }
        .sports-upcoming .matchup {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        .sports-upcoming .team-logo {
          width: ${logoSize};
          height: ${logoSize};
          object-fit: contain;
        }
        .sports-upcoming .vs {
          font-size: calc(${nameFontSize} * 1.25);
          font-weight: 700;
          color: var(--secondary-text-color);
        }
        .sports-upcoming .game-time {
          text-align: center;
          font-size: calc(${nameFontSize} * 1.125);
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 8px;
        }
        .sports-upcoming .details {
          text-align: center;
          font-size: ${detailFontSize};
          color: var(--secondary-text-color);
        }
        .sports-upcoming .team-name-abbr {
          font-size: ${nameFontSize};
          font-weight: 600;
        }
      </style>

      <div class="sports-upcoming">
        <div class="matchup">
          ${module.show_team_logos && data.awayTeam.logo
            ? html`<img class="team-logo" src="${data.awayTeam.logo}" alt="${data.awayTeam.name}" />`
            : module.show_team_names
            ? html`<span class="team-name-abbr">${data.awayTeam.abbreviation}</span>`
            : ''}
          <span class="vs">@</span>
          ${module.show_team_logos && data.homeTeam.logo
            ? html`<img class="team-logo" src="${data.homeTeam.logo}" alt="${data.homeTeam.name}" />`
            : module.show_team_names
            ? html`<span class="team-name-abbr">${data.homeTeam.abbreviation}</span>`
            : ''}
        </div>

        ${module.show_game_time && data.gameTime
          ? html`<div class="game-time">${SportsDataService.formatGameTime(data.gameTime)}</div>`
          : ''}

        <div class="details">
          ${module.show_team_names
            ? html`<div>${data.awayTeam.name} at ${data.homeTeam.name}</div>`
            : ''}
          ${module.show_venue && data.venue ? html`<div>${data.venue}</div>` : ''}
          ${module.show_broadcast && data.broadcast ? html`<div>📺 ${data.broadcast}</div>` : ''}
        </div>
      </div>
    `;
  }

  private renderCompactStyle(module: SportsScoreModule, hass: HomeAssistant): TemplateResult {
    const data = this._currentGameData;
    const logoSize = module.logo_size || '20px';
    const scoreFontSize = module.score_font_size || '14px';
    const nameFontSize = module.team_name_font_size || '14px';

    if (this._currentLoading) {
      return html`<div style="padding: 8px; text-align: center; font-size: 12px;">Loading...</div>`;
    }

    if (this._currentError || !data) {
      return html`<div style="padding: 8px; text-align: center; font-size: 12px; color: var(--secondary-text-color);">No game data</div>`;
    }

    const isLive = SportsDataService.isLive(data.status);
    const statusColor = isLive ? module.in_progress_color || '#ff9800' : 'var(--secondary-text-color)';

    return html`
      <style>
        .sports-compact {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: ${nameFontSize};
        }
        .sports-compact .team-logo {
          width: ${logoSize};
          height: ${logoSize};
          object-fit: contain;
        }
        .sports-compact .score {
          font-size: ${scoreFontSize};
          font-weight: 700;
        }
        .sports-compact .status {
          font-size: 10px;
          text-transform: uppercase;
        }
      </style>

      <div class="sports-compact">
        ${module.show_team_logos && data.awayTeam.logo
          ? html`<img class="team-logo" src="${data.awayTeam.logo}" />`
          : html`<span>${data.awayTeam.abbreviation}</span>`}
        
        ${module.show_score && this._hasValidScore(data.awayTeam.score, data.homeTeam.score)
          ? html`<span class="score">${this._formatScore(data.awayTeam.score)} - ${this._formatScore(data.homeTeam.score)}</span>`
          : html`<span>vs</span>`}
        
        ${module.show_team_logos && data.homeTeam.logo
          ? html`<img class="team-logo" src="${data.homeTeam.logo}" />`
          : html`<span>${data.homeTeam.abbreviation}</span>`}
        
        ${isLive
          ? html`<span class="status" style="color: ${statusColor};">● LIVE</span>`
          : ''}
      </div>
    `;
  }

  private renderDetailedStyle(module: SportsScoreModule, hass: HomeAssistant): TemplateResult {
    const data = this._currentGameData;
    const logoSize = module.logo_size || '56px';
    const scoreFontSize = module.score_font_size || '36px';
    const nameFontSize = module.team_name_font_size || '15px';
    const detailFontSize = module.detail_font_size || '12px';

    if (this._currentLoading) {
      return this.renderLoadingState();
    }

    if (this._currentError || !data) {
      return this.renderNoDataState(module);
    }

    const isLive = SportsDataService.isLive(data.status);
    const isScheduled = data.status === 'scheduled';
    const isFinal = data.status === 'final';
    const hasScore = this._hasValidScore(data.awayTeam.score, data.homeTeam.score);
    
    // Determine status badge color and text
    let statusBadgeColor = 'var(--secondary-background-color)';
    let statusBadgeTextColor = 'var(--primary-text-color)';
    let statusText = '';
    
    if (isLive) {
      statusBadgeColor = module.in_progress_color || '#ff9800';
      statusBadgeTextColor = 'white';
      statusText = `● ${data.statusDetail || 'LIVE'}`;
    } else if (isFinal) {
      statusBadgeColor = 'var(--secondary-background-color)';
      statusBadgeTextColor = 'var(--secondary-text-color)';
      statusText = 'FINAL';
    } else if (isScheduled && data.gameTime) {
      // For scheduled games, show the date/time in the badge
      const gameDate = data.gameTime;
      const options: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric' };
      const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
      statusText = `${gameDate.toLocaleDateString(undefined, options)} - ${gameDate.toLocaleTimeString(undefined, timeOptions)}`;
    }

    return html`
      <style>
        .sports-detailed {
          padding: 20px;
          border-radius: inherit;
          background: transparent;
        }
        .sports-detailed .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--divider-color);
        }
        .sports-detailed .league-info {
          font-size: ${detailFontSize};
          font-weight: 600;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sports-detailed .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: ${detailFontSize};
          font-weight: 600;
        }
        .sports-detailed .matchup {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
        }
        .sports-detailed .team-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
          max-width: 140px;
        }
        .sports-detailed .team-logo {
          width: ${logoSize};
          height: ${logoSize};
          object-fit: contain;
          margin-bottom: 8px;
        }
        .sports-detailed .team-name {
          font-size: ${nameFontSize};
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .sports-detailed .team-record {
          font-size: ${detailFontSize};
          color: var(--secondary-text-color);
        }
        .sports-detailed .score-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
        }
        .sports-detailed .score-display {
          font-size: ${scoreFontSize};
          font-weight: 700;
          letter-spacing: 2px;
        }
        .sports-detailed .score-vs {
          font-size: calc(${scoreFontSize} * 0.67);
          font-weight: 600;
          color: var(--secondary-text-color);
        }
        .sports-detailed .live-indicator {
          font-size: ${detailFontSize};
          font-weight: 600;
          color: ${module.in_progress_color || '#ff9800'};
          margin-top: 4px;
          animation: pulse 1.5s infinite;
        }
        .sports-detailed .game-info {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          padding: 12px 16px;
          background: var(--secondary-background-color);
          border-radius: 8px;
          font-size: ${detailFontSize};
        }
        .sports-detailed .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--primary-text-color);
        }
        .sports-detailed .info-item ha-icon {
          color: var(--secondary-text-color);
          --mdi-icon-size: 16px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>

      <div class="sports-detailed">
        <div class="header">
          <span class="league-info">${LEAGUE_NAMES[data.league] || data.league.toUpperCase()}</span>
          ${statusText ? html`
            <span class="status-badge" style="background: ${statusBadgeColor}; color: ${statusBadgeTextColor};">
              ${statusText}
            </span>
          ` : ''}
        </div>

        <div class="matchup">
          <!-- Away Team -->
          <div class="team-block">
            ${module.show_team_logos && data.awayTeam.logo
              ? html`<img class="team-logo" src="${data.awayTeam.logo}" alt="${data.awayTeam.name}" />`
              : ''}
            ${module.show_team_names
              ? html`<div class="team-name">${data.awayTeam.name}</div>`
              : ''}
            ${module.show_team_records && data.awayTeam.record
              ? html`<div class="team-record">${data.awayTeam.record}</div>`
              : ''}
          </div>

          <!-- Score / VS -->
          <div class="score-center">
            ${module.show_score && hasScore
              ? html`<div class="score-display">${this._formatScore(data.awayTeam.score)} - ${this._formatScore(data.homeTeam.score)}</div>`
              : html`<div class="score-vs">VS</div>`}
            ${isLive && data.clock
              ? html`<div class="live-indicator">● ${data.clock}</div>`
              : ''}
          </div>

          <!-- Home Team -->
          <div class="team-block">
            ${module.show_team_logos && data.homeTeam.logo
              ? html`<img class="team-logo" src="${data.homeTeam.logo}" alt="${data.homeTeam.name}" />`
              : ''}
            ${module.show_team_names
              ? html`<div class="team-name">${data.homeTeam.name}</div>`
              : ''}
            ${module.show_team_records && data.homeTeam.record
              ? html`<div class="team-record">${data.homeTeam.record}</div>`
              : ''}
          </div>
        </div>

        ${(module.show_game_time && data.gameTime && !isLive && !isFinal) || 
          (module.show_venue && data.venue) || 
          (module.show_broadcast && data.broadcast) || 
          (module.show_odds && data.odds?.spread)
          ? html`
            <div class="game-info">
              ${module.show_game_time && data.gameTime && !isLive && !isFinal
                ? html`<div class="info-item"><ha-icon icon="mdi:calendar-clock"></ha-icon> ${SportsDataService.formatGameTime(data.gameTime)}</div>`
                : ''}
              ${module.show_venue && data.venue
                ? html`<div class="info-item"><ha-icon icon="mdi:stadium"></ha-icon> ${data.venue}</div>`
                : ''}
              ${module.show_broadcast && data.broadcast
                ? html`<div class="info-item"><ha-icon icon="mdi:television"></ha-icon> ${data.broadcast}</div>`
                : ''}
              ${module.show_odds && data.odds?.spread
                ? html`<div class="info-item"><ha-icon icon="mdi:chart-line"></ha-icon> ${data.odds.spread} ${data.odds.overUnder || ''}</div>`
                : ''}
            </div>
          `
          : ''}
      </div>
    `;
  }

  private renderMiniStyle(module: SportsScoreModule, hass: HomeAssistant): TemplateResult {
    const data = this._currentGameData;
    const logoSize = module.logo_size || '32px';
    const scoreFontSize = module.score_font_size || '16px';

    if (this._currentLoading) {
      return html`<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>`;
    }

    if (this._currentError || !data) {
      return html`<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--secondary-text-color);">No data</div>`;
    }

    const isLive = SportsDataService.isLive(data.status);

    return html`
      <style>
        .sports-mini {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
          min-width: 80px;
          border-radius: inherit;
          background: transparent;
        }
        .sports-mini .logos {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 4px;
        }
        .sports-mini .team-logo {
          width: ${logoSize};
          height: ${logoSize};
          object-fit: contain;
        }
        .sports-mini .score {
          font-size: ${scoreFontSize};
          font-weight: 700;
        }
        .sports-mini .live-dot {
          width: 6px;
          height: 6px;
          background: ${module.in_progress_color || '#ff9800'};
          border-radius: 50%;
          margin-top: 4px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>

      <div class="sports-mini">
        <div class="logos">
          ${data.awayTeam.logo
            ? html`<img class="team-logo" src="${data.awayTeam.logo}" />`
            : html`<span style="font-size: 10px;">${data.awayTeam.abbreviation}</span>`}
          ${data.homeTeam.logo
            ? html`<img class="team-logo" src="${data.homeTeam.logo}" />`
            : html`<span style="font-size: 10px;">${data.homeTeam.abbreviation}</span>`}
        </div>
        ${module.show_score && this._hasValidScore(data.awayTeam.score, data.homeTeam.score)
          ? html`<div class="score">${this._formatScore(data.awayTeam.score)}-${this._formatScore(data.homeTeam.score)}</div>`
          : html`<div style="font-size: 10px;">${SportsDataService.formatGameTime(data.gameTime)}</div>`}
        ${isLive ? html`<div class="live-dot"></div>` : ''}
      </div>
    `;
  }

  private renderLogoBgStyle(module: SportsScoreModule, hass: HomeAssistant): TemplateResult {
    const data = this._currentGameData;
    const logoSize = module.logo_size || '40px';
    const scoreFontSize = module.score_font_size || '18px';
    const nameFontSize = module.team_name_font_size || '11px';
    
    // Logo BG specific options
    const showLogoBg = module.show_logo_background !== false;
    const logoBgSize = module.logo_background_size || '80px';
    const logoBgOpacity = (module.logo_background_opacity || 8) / 100;

    if (this._currentLoading) {
      return html`<div style="height: 80px; display: flex; align-items: center; justify-content: center;"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>`;
    }

    if (this._currentError || !data) {
      return html`
        <div style="height: 80px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--secondary-text-color);">
          ${module.team_id ? 'No game data' : 'Select a team'}
        </div>
      `;
    }

    const isLive = SportsDataService.isLive(data.status);
    const hasScore = this._hasValidScore(data.awayTeam.score, data.homeTeam.score);
    const statusColor = isLive ? module.in_progress_color || '#ff9800' : module.scheduled_color || 'var(--primary-text-color)';

    // Use team colors for subtle background accents if enabled
    const homeColor = module.use_team_colors && data.homeTeam.color ? data.homeTeam.color : 'var(--primary-color)';
    const awayColor = module.use_team_colors && data.awayTeam.color ? data.awayTeam.color : 'var(--primary-color)';

    return html`
      <style>
        .sports-logo-bg {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          min-height: 60px;
          border-radius: inherit;
          background: transparent;
          overflow: hidden;
        }
        .sports-logo-bg .bg-logo {
          position: absolute;
          width: ${logoBgSize};
          height: ${logoBgSize};
          object-fit: contain;
          opacity: ${logoBgOpacity};
          pointer-events: none;
          filter: grayscale(30%);
        }
        .sports-logo-bg .bg-logo-away {
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
        }
        .sports-logo-bg .bg-logo-home {
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
        }
        .sports-logo-bg .team-side {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
          min-width: 0;
        }
        .sports-logo-bg .team-logo {
          width: ${logoSize};
          height: ${logoSize};
          object-fit: contain;
          margin-bottom: 4px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
        }
        .sports-logo-bg .team-abbr {
          font-size: ${nameFontSize};
          font-weight: 700;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .sports-logo-bg .center-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          min-width: 70px;
        }
        .sports-logo-bg .score-display {
          font-size: ${scoreFontSize};
          font-weight: 800;
          letter-spacing: 1px;
          line-height: 1.1;
        }
        .sports-logo-bg .vs-display {
          font-size: calc(${scoreFontSize} * 0.7);
          font-weight: 600;
          color: var(--secondary-text-color);
        }
        .sports-logo-bg .status-line {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 2px;
          white-space: nowrap;
        }
        .sports-logo-bg .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .sports-logo-bg .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: pulse-logo-bg 1.5s infinite;
        }
        .sports-logo-bg .game-time-line {
          font-size: 9px;
          color: var(--secondary-text-color);
          margin-top: 2px;
          white-space: nowrap;
        }
        @keyframes pulse-logo-bg {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      </style>

      <div class="sports-logo-bg">
        <!-- Background logos for visual effect (conditional) -->
        ${showLogoBg && data.awayTeam.logo
          ? html`<img class="bg-logo bg-logo-away" src="${data.awayTeam.logo}" alt="" />`
          : ''}
        ${showLogoBg && data.homeTeam.logo
          ? html`<img class="bg-logo bg-logo-home" src="${data.homeTeam.logo}" alt="" />`
          : ''}

        <!-- Away Team -->
        <div class="team-side">
          ${module.show_team_logos && data.awayTeam.logo
            ? html`<img class="team-logo" src="${data.awayTeam.logo}" alt="${data.awayTeam.name}" />`
            : ''}
          ${module.show_team_names
            ? html`<div class="team-abbr" style="color: ${module.use_team_colors && awayColor ? awayColor : 'inherit'}">${data.awayTeam.abbreviation || data.awayTeam.name.substring(0, 3).toUpperCase()}</div>`
            : ''}
        </div>

        <!-- Center: Score or VS + Status -->
        <div class="center-content">
          ${module.show_score && hasScore
            ? html`<div class="score-display">${this._formatScore(data.awayTeam.score)} - ${this._formatScore(data.homeTeam.score)}</div>`
            : html`<div class="vs-display">VS</div>`}
          
          ${module.show_status_detail
            ? isLive
              ? html`
                  <div class="status-line" style="color: ${statusColor}">
                    <span class="live-indicator">
                      <span class="live-dot" style="background: ${statusColor}"></span>
                      ${data.statusDetail || 'LIVE'}
                    </span>
                  </div>
                `
              : data.status === 'final'
                ? html`<div class="status-line" style="color: var(--secondary-text-color)">FINAL</div>`
                : module.show_game_time && data.gameTime
                  ? html`<div class="game-time-line">${SportsDataService.formatGameTime(data.gameTime)}</div>`
                  : ''
            : module.show_game_time && data.gameTime && data.status === 'scheduled'
              ? html`<div class="game-time-line">${SportsDataService.formatGameTime(data.gameTime)}</div>`
              : ''}
        </div>

        <!-- Home Team -->
        <div class="team-side">
          ${module.show_team_logos && data.homeTeam.logo
            ? html`<img class="team-logo" src="${data.homeTeam.logo}" alt="${data.homeTeam.name}" />`
            : ''}
          ${module.show_team_names
            ? html`<div class="team-abbr" style="color: ${module.use_team_colors && homeColor ? homeColor : 'inherit'}">${data.homeTeam.abbreviation || data.homeTeam.name.substring(0, 3).toUpperCase()}</div>`
            : ''}
        </div>
      </div>
    `;
  }

  private renderLoadingState(): TemplateResult {
    return html`
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        gap: 12px;
      ">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div style="font-size: 12px; color: var(--secondary-text-color);">Loading sports data...</div>
      </div>
    `;
  }

  private renderNoDataState(module: SportsScoreModule): TemplateResult {
    const message = module.data_source === 'ha_sensor' && !module.sensor_entity
      ? 'Select a sensor entity'
      : module.data_source === 'espn_api' && !module.team_id
      ? 'Select a team'
      : this._currentError || 'No game data available';

    return html`
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
        background: var(--secondary-background-color);
        border-radius: 8px;
      ">
        <ha-icon icon="mdi:scoreboard-outline" style="--mdi-icon-size: 32px; color: var(--secondary-text-color); margin-bottom: 8px;"></ha-icon>
        <div style="font-size: 14px; color: var(--secondary-text-color);">${message}</div>
      </div>
    `;
  }

  /**
   * Check if we have valid scores to display (not null, undefined, or NaN)
   */
  private _hasValidScore(score1: number | null, score2: number | null): boolean {
    const isValid = (s: number | null): boolean => 
      s !== null && s !== undefined && !isNaN(s);
    return isValid(score1) || isValid(score2);
  }

  /**
   * Format score for display - handles null, undefined, and NaN
   */
  private _formatScore(score: number | null, fallback: string = '0'): string {
    if (score === null || score === undefined || isNaN(score)) {
      return fallback;
    }
    return String(score);
  }

  /**
   * Helper to add pixel unit to numeric values
   */
  private addPixelUnit(value: string | number | undefined): string | undefined {
    if (!value && value !== 0) return undefined;
    
    const valueStr = String(value);
    
    // Handle special CSS values
    if (valueStr === 'auto' || valueStr === 'none' || valueStr === 'inherit' || valueStr === 'initial' || valueStr === 'unset') {
      return valueStr;
    }
    
    // If value is just a number, add px
    if (/^\d+$/.test(valueStr)) {
      return `${valueStr}px`;
    }
    
    // If already has unit, return as-is
    if (/[a-zA-Z%]/.test(valueStr)) {
      return valueStr;
    }
    
    return valueStr;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const sportsModule = module as SportsScoreModule;
    const errors = [...baseValidation.errors];

    if (sportsModule.data_source === 'ha_sensor' && !sportsModule.sensor_entity) {
      errors.push('Sensor entity is required when using HA sensor mode');
    }

    if (sportsModule.data_source === 'espn_api') {
      if (!sportsModule.league) {
        errors.push('League is required when using ESPN API mode');
      }
      if (!sportsModule.team_id) {
        errors.push('Team is required when using ESPN API mode');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .sports-module-container {
        width: 100%;
      }
    `;
  }
}

