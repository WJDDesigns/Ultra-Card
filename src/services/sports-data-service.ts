import { HomeAssistant } from 'custom-card-helpers';
import { SportsGameData, SportsLeague, SportsGameStatus, SportsTeamInfo } from '../types';

/**
 * Sports Data Service
 *
 * Handles fetching and caching sports data from multiple sources:
 * - Home Assistant sensors (Team Tracker compatible)
 * - ESPN public API (free, no authentication required)
 *
 * Provides utilities for:
 * - Dual-source data fetching
 * - Response caching with configurable TTL
 * - Data normalization to unified SportsGameData format
 * - League/team lookup utilities
 */

// ESPN API endpoints
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// League path mappings for ESPN API
const LEAGUE_PATHS: Record<SportsLeague, string> = {
  nfl: 'football/nfl',
  nba: 'basketball/nba',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
  mls: 'soccer/usa.1',
  premier_league: 'soccer/eng.1',
  ncaaf: 'football/college-football',
  ncaab: 'basketball/mens-college-basketball',
  la_liga: 'soccer/esp.1',
  bundesliga: 'soccer/ger.1',
  serie_a: 'soccer/ita.1',
  ligue_1: 'soccer/fra.1',
};

// League display names
export const LEAGUE_NAMES: Record<SportsLeague, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  mlb: 'MLB',
  nhl: 'NHL',
  mls: 'MLS',
  premier_league: 'Premier League',
  ncaaf: 'NCAA Football',
  ncaab: 'NCAA Basketball',
  la_liga: 'La Liga',
  bundesliga: 'Bundesliga',
  serie_a: 'Serie A',
  ligue_1: 'Ligue 1',
};

// Cache entry type
interface CacheEntry {
  data: SportsGameData | SportsGameData[] | SportsTeamInfo[];
  timestamp: number;
}

class SportsDataService {
  private _cache: Map<string, CacheEntry> = new Map();
  private _cacheTTL: number = 60 * 1000; // 60 seconds default
  private _teamCache: Map<string, SportsTeamInfo[]> = new Map();

  constructor(cacheTTL?: number) {
    if (cacheTTL) {
      this._cacheTTL = cacheTTL;
    }
  }

  /**
   * Get game data from either HA sensor or ESPN API
   */
  async getGameData(
    hass: HomeAssistant,
    dataSource: 'ha_sensor' | 'espn_api',
    sensorEntity?: string,
    league?: SportsLeague,
    teamId?: string
  ): Promise<SportsGameData | null> {
    if (dataSource === 'ha_sensor') {
      return this.getFromHASensor(hass, sensorEntity);
    } else {
      return this.getFromESPN(league, teamId);
    }
  }

  /**
   * Get game data from Home Assistant sensor (Team Tracker compatible)
   */
  async getFromHASensor(
    hass: HomeAssistant,
    sensorEntity?: string
  ): Promise<SportsGameData | null> {
    if (!sensorEntity || !hass?.states) {
      return null;
    }

    const state = hass.states[sensorEntity];
    if (!state) {
      console.warn(`Sports module: Sensor ${sensorEntity} not found`);
      return null;
    }

    return this.normalizeHASensorData(state);
  }

  /**
   * Normalize HA sensor data to SportsGameData format
   * Compatible with Team Tracker integration format
   */
  private normalizeHASensorData(state: any): SportsGameData {
    const attrs = state.attributes || {};

    // Map Team Tracker state to our status
    const statusMap: Record<string, SportsGameStatus> = {
      PRE: 'scheduled',
      IN: 'in_progress',
      POST: 'final',
      NOT_FOUND: 'scheduled',
      BYE: 'scheduled',
      HALF: 'halftime',
    };

    const status = statusMap[state.state] || 'scheduled';

    // Determine league from sensor attributes or entity ID
    let league: SportsLeague = 'nfl';
    if (attrs.league) {
      const leagueLower = attrs.league.toLowerCase();
      if (leagueLower.includes('nfl')) league = 'nfl';
      else if (leagueLower.includes('nba')) league = 'nba';
      else if (leagueLower.includes('mlb')) league = 'mlb';
      else if (leagueLower.includes('nhl')) league = 'nhl';
      else if (leagueLower.includes('mls')) league = 'mls';
      else if (leagueLower.includes('ncaaf') || leagueLower.includes('college football'))
        league = 'ncaaf';
      else if (leagueLower.includes('ncaab') || leagueLower.includes('college basketball'))
        league = 'ncaab';
      else if (leagueLower.includes('premier')) league = 'premier_league';
    }

    // Helper to safely parse score - returns null for NaN, undefined, or empty values
    const parseScore = (score: any): number | null => {
      if (score === undefined || score === null || score === '') return null;
      const parsed = parseInt(score, 10);
      return isNaN(parsed) ? null : parsed;
    };

    return {
      gameId: attrs.event_id || `${attrs.team_abbr}_${Date.now()}`,
      league,
      homeTeam: {
        id: attrs.team_homeaway === 'home' ? attrs.team_id || '' : attrs.opponent_id || '',
        name: attrs.team_homeaway === 'home' ? attrs.team_name || '' : attrs.opponent_name || '',
        abbreviation:
          attrs.team_homeaway === 'home' ? attrs.team_abbr || '' : attrs.opponent_abbr || '',
        logo: attrs.team_homeaway === 'home' ? attrs.team_logo || '' : attrs.opponent_logo || '',
        score:
          attrs.team_homeaway === 'home'
            ? parseScore(attrs.team_score)
            : parseScore(attrs.opponent_score),
        record: attrs.team_homeaway === 'home' ? attrs.team_record : attrs.opponent_record,
        color: attrs.team_homeaway === 'home' ? attrs.team_colors?.[0] : attrs.opponent_colors?.[0],
      },
      awayTeam: {
        id: attrs.team_homeaway === 'away' ? attrs.team_id || '' : attrs.opponent_id || '',
        name: attrs.team_homeaway === 'away' ? attrs.team_name || '' : attrs.opponent_name || '',
        abbreviation:
          attrs.team_homeaway === 'away' ? attrs.team_abbr || '' : attrs.opponent_abbr || '',
        logo: attrs.team_homeaway === 'away' ? attrs.team_logo || '' : attrs.opponent_logo || '',
        score:
          attrs.team_homeaway === 'away'
            ? parseScore(attrs.team_score)
            : parseScore(attrs.opponent_score),
        record: attrs.team_homeaway === 'away' ? attrs.team_record : attrs.opponent_record,
        color: attrs.team_homeaway === 'away' ? attrs.team_colors?.[0] : attrs.opponent_colors?.[0],
      },
      status,
      statusDetail: attrs.quarter || attrs.period || attrs.inning,
      clock: attrs.clock,
      period: attrs.quarter || attrs.period,
      gameTime: attrs.date ? new Date(attrs.date) : null,
      venue: attrs.venue || attrs.location,
      broadcast: attrs.broadcast || attrs.tv_network,
      odds: attrs.odds
        ? {
            spread: attrs.odds,
            overUnder: attrs.overunder,
          }
        : undefined,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get game data from ESPN API
   * Tries scoreboard first (has full data), falls back to team schedule
   */
  async getFromESPN(league?: SportsLeague, teamId?: string): Promise<SportsGameData | null> {
    if (!league || !teamId) {
      return null;
    }

    const cacheKey = `espn_${league}_${teamId}`;
    const cached = this._cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this._cacheTTL) {
      return cached.data as SportsGameData;
    }

    try {
      const path = LEAGUE_PATHS[league];
      if (!path) {
        console.warn(`[Sports Service] Unknown league ${league}`);
        return null;
      }

      // First, try the scoreboard endpoint (has full game data including scores and logos)
      let gameData = await this.findTeamGameInScoreboard(league, teamId);

      // If no game found in scoreboard, try the team's schedule for upcoming games
      if (!gameData) {
        gameData = await this.fetchTeamSchedule(league, teamId);
      }

      if (gameData) {
        this._cache.set(cacheKey, { data: gameData, timestamp: Date.now() });
      }

      return gameData;
    } catch (error) {
      console.error('[Sports Service] ESPN API fetch error:', error);
      return null;
    }
  }

  /**
   * Find a team's game in the current scoreboard
   */
  private async findTeamGameInScoreboard(
    league: SportsLeague,
    teamId: string
  ): Promise<SportsGameData | null> {
    try {
      const path = LEAGUE_PATHS[league];
      const url = `${ESPN_BASE}/${path}/scoreboard`;
      console.debug(`Sports module: Fetching scoreboard from ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        console.debug(`Sports module: Scoreboard request failed with status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const events = data?.events || [];
      console.debug(`Sports module: Found ${events.length} events in scoreboard`);

      // Find the game involving this team
      for (const event of events) {
        const competition = event.competitions?.[0];
        if (!competition) continue;

        const competitors = competition.competitors || [];
        const isTeamInGame = competitors.some(
          (c: any) => c.team?.id === teamId || String(c.team?.id) === String(teamId)
        );

        if (isTeamInGame) {
          console.debug(`Sports module: Found team ${teamId} in scoreboard game`);
          const gameData = this.normalizeESPNEvent(event, league);
          console.debug('Sports module: Normalized game data:', gameData);
          return gameData;
        }
      }

      console.debug(`Sports module: Team ${teamId} not found in today's scoreboard`);
      return null;
    } catch (error) {
      console.debug('Sports module: Scoreboard fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch team's schedule and find the most relevant game
   */
  private async fetchTeamSchedule(
    league: SportsLeague,
    teamId: string
  ): Promise<SportsGameData | null> {
    try {
      const path = LEAGUE_PATHS[league];

      // First try to get the team info with next event
      const teamUrl = `${ESPN_BASE}/${path}/teams/${teamId}`;
      const teamResponse = await fetch(teamUrl);

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const nextEvents = teamData?.team?.nextEvent || [];

        if (nextEvents.length > 0) {
          const gameData = this.normalizeESPNEvent(nextEvents[0], league);
          if (gameData) return gameData;
        }
      }

      // Fall back to schedule endpoint for more games
      const scheduleUrl = `${ESPN_BASE}/${path}/teams/${teamId}/schedule`;
      const scheduleResponse = await fetch(scheduleUrl);

      if (!scheduleResponse.ok) {
        return null;
      }

      const scheduleData = await scheduleResponse.json();
      const events = scheduleData?.events || [];

      if (!events.length) {
        return null;
      }

      // Find the most relevant game
      const now = new Date();
      let selectedEvent: any = null;
      let mostRecentPast: any = null;
      let mostRecentPastDate = new Date(0);

      for (const event of events) {
        const competition = event.competitions?.[0];
        if (!competition) continue;

        const status = competition.status?.type?.name || '';
        const gameDate = new Date(event.date);

        // Prefer in-progress games
        if (status.includes('IN_PROGRESS') || status.includes('HALFTIME')) {
          selectedEvent = event;
          break;
        }

        // Then upcoming games (closest to now)
        if (gameDate > now && (!selectedEvent || gameDate < new Date(selectedEvent.date))) {
          selectedEvent = event;
        }

        // Track most recent completed game
        if (status.includes('FINAL') && gameDate > mostRecentPastDate) {
          mostRecentPast = event;
          mostRecentPastDate = gameDate;
        }
      }

      // If no upcoming game, show most recent completed
      if (!selectedEvent && mostRecentPast) {
        selectedEvent = mostRecentPast;
      }

      if (!selectedEvent) {
        return null;
      }

      return this.normalizeESPNEvent(selectedEvent, league);
    } catch (error) {
      console.debug('Sports module: Team schedule fetch failed:', error);
      return null;
    }
  }

  /**
   * Get current/recent scoreboard for a league from ESPN
   */
  async getScoreboard(league: SportsLeague): Promise<SportsGameData[]> {
    const cacheKey = `espn_scoreboard_${league}`;
    const cached = this._cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this._cacheTTL) {
      return cached.data as SportsGameData[];
    }

    try {
      const path = LEAGUE_PATHS[league];
      if (!path) {
        return [];
      }

      const url = `${ESPN_BASE}/${path}/scoreboard`;
      const response = await fetch(url);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const games = this.parseESPNScoreboardResponse(data, league);

      this._cache.set(cacheKey, { data: games, timestamp: Date.now() });
      return games;
    } catch (error) {
      console.error('Sports module: ESPN scoreboard fetch error:', error);
      return [];
    }
  }

  /**
   * Parse ESPN scoreboard response
   */
  private parseESPNScoreboardResponse(data: any, league: SportsLeague): SportsGameData[] {
    const events = data?.events || [];
    return events.map((event: any) => this.normalizeESPNEvent(event, league)).filter(Boolean);
  }

  /**
   * Normalize ESPN event data to SportsGameData format
   */
  private normalizeESPNEvent(event: any, league: SportsLeague): SportsGameData | null {
    const competition = event.competitions?.[0];
    if (!competition) {
      return null;
    }

    const competitors = competition.competitors || [];
    const homeTeamData = competitors.find((c: any) => c.homeAway === 'home');
    const awayTeamData = competitors.find((c: any) => c.homeAway === 'away');

    if (!homeTeamData || !awayTeamData) {
      return null;
    }

    // Map ESPN status to our status
    const espnStatus = competition.status?.type?.name || '';
    let status: SportsGameStatus = 'scheduled';

    if (espnStatus.includes('IN_PROGRESS')) status = 'in_progress';
    else if (espnStatus.includes('HALFTIME')) status = 'halftime';
    else if (espnStatus.includes('FINAL') || espnStatus.includes('END')) status = 'final';
    else if (espnStatus.includes('DELAYED')) status = 'delayed';
    else if (espnStatus.includes('POSTPONED')) status = 'postponed';
    else if (espnStatus.includes('CANCELLED')) status = 'cancelled';

    // Get broadcast info
    const broadcasts = competition.broadcasts?.[0]?.names || [];
    const broadcast = broadcasts.join(', ');

    // Get odds
    let odds = undefined;
    if (competition.odds && competition.odds.length > 0) {
      const oddsData = competition.odds[0];
      odds = {
        spread: oddsData.details,
        overUnder: oddsData.overUnder ? `O/U ${oddsData.overUnder}` : undefined,
      };
    }

    // Helper to safely parse score - returns null for NaN, undefined, or empty values
    const parseScore = (score: any): number | null => {
      if (score === undefined || score === null || score === '') return null;
      const parsed = parseInt(score, 10);
      return isNaN(parsed) ? null : parsed;
    };

    // Helper to extract logo URL from various ESPN response formats
    const getLogoUrl = (teamData: any): string => {
      const team = teamData?.team;
      if (!team) {
        console.debug('Sports module: No team data for logo extraction');
        return '';
      }

      // Try direct logo property first
      if (team.logo) {
        console.debug(`Sports module: Found direct logo: ${team.logo}`);
        return team.logo;
      }

      // Try logos array (ESPN often uses this format)
      if (team.logos && team.logos.length > 0) {
        // Prefer the default/primary logo
        const defaultLogo = team.logos.find(
          (l: any) => l.rel?.includes('default') || l.rel?.includes('full')
        );
        const logoUrl = defaultLogo?.href || team.logos[0]?.href || '';
        console.debug(`Sports module: Found logo from array: ${logoUrl}`);
        return logoUrl;
      }

      console.debug(`Sports module: No logo found for team ${team.abbreviation || team.name}`);
      return '';
    };

    // Helper to extract team record with multiple fallbacks
    const getTeamRecord = (teamData: any): string | undefined => {
      // Try records array first (most common for US sports)
      if (teamData.records && teamData.records.length > 0) {
        // Look for overall record first
        const overallRecord = teamData.records.find(
          (r: any) => r.type === 'total' || r.type === 'overall' || r.name === 'overall'
        );
        if (overallRecord?.summary) return overallRecord.summary;
        // Fall back to first record
        if (teamData.records[0]?.summary) return teamData.records[0].summary;
      }

      // Try form (soccer/football recent results like "WWDLW")
      if (teamData.form) return teamData.form;

      // Try statistics for league standings (soccer)
      const stats = teamData.statistics || teamData.team?.statistics;
      if (stats && stats.length > 0) {
        // Look for standings-related stats
        const points = stats.find((s: any) => s.name === 'points' || s.abbreviation === 'PTS');
        const gamesPlayed = stats.find(
          (s: any) => s.name === 'gamesPlayed' || s.abbreviation === 'GP'
        );
        if (points && gamesPlayed) {
          return `${gamesPlayed.value}GP, ${points.value}Pts`;
        }
      }

      return undefined;
    };

    // Helper to get broadcast info with fallbacks
    const getBroadcast = (): string => {
      // Try broadcasts array first
      if (competition.broadcasts && competition.broadcasts.length > 0) {
        const allBroadcasts: string[] = [];
        for (const broadcast of competition.broadcasts) {
          if (broadcast.names && broadcast.names.length > 0) {
            allBroadcasts.push(...broadcast.names);
          } else if (broadcast.market && broadcast.media?.shortName) {
            allBroadcasts.push(broadcast.media.shortName);
          }
        }
        if (allBroadcasts.length > 0) return allBroadcasts.join(', ');
      }

      // Try geoBroadcasts
      if (competition.geoBroadcasts && competition.geoBroadcasts.length > 0) {
        const names = competition.geoBroadcasts
          .filter((gb: any) => gb.media?.shortName)
          .map((gb: any) => gb.media.shortName);
        if (names.length > 0) return [...new Set(names)].join(', ');
      }

      return '';
    };

    return {
      gameId: event.id || `${homeTeamData.team?.id}_${awayTeamData.team?.id}_${event.date}`,
      league,
      homeTeam: {
        id: homeTeamData.team?.id || '',
        name: homeTeamData.team?.displayName || homeTeamData.team?.name || '',
        abbreviation: homeTeamData.team?.abbreviation || '',
        logo: getLogoUrl(homeTeamData),
        score: parseScore(homeTeamData.score),
        record: getTeamRecord(homeTeamData),
        color: homeTeamData.team?.color ? `#${homeTeamData.team.color}` : undefined,
      },
      awayTeam: {
        id: awayTeamData.team?.id || '',
        name: awayTeamData.team?.displayName || awayTeamData.team?.name || '',
        abbreviation: awayTeamData.team?.abbreviation || '',
        logo: getLogoUrl(awayTeamData),
        score: parseScore(awayTeamData.score),
        record: getTeamRecord(awayTeamData),
        color: awayTeamData.team?.color ? `#${awayTeamData.team.color}` : undefined,
      },
      status,
      statusDetail: competition.status?.type?.shortDetail || competition.status?.type?.description,
      clock: competition.status?.displayClock,
      period: competition.status?.period,
      gameTime: event.date ? new Date(event.date) : null,
      venue: competition.venue?.fullName,
      broadcast: getBroadcast(),
      odds,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get list of teams for a league from ESPN
   */
  async getTeams(league: SportsLeague): Promise<SportsTeamInfo[]> {
    // Check cache first
    const cacheKey = `teams_${league}`;
    const cached = this._teamCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const path = LEAGUE_PATHS[league];
      if (!path) {
        return [];
      }

      const url = `${ESPN_BASE}/${path}/teams?limit=100`;
      const response = await fetch(url);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const teams = this.parseESPNTeamsResponse(data, league);

      this._teamCache.set(cacheKey, teams);
      return teams;
    } catch (error) {
      console.error('Sports module: ESPN teams fetch error:', error);
      return [];
    }
  }

  /**
   * Parse ESPN teams response
   */
  private parseESPNTeamsResponse(data: any, league: SportsLeague): SportsTeamInfo[] {
    const teams: SportsTeamInfo[] = [];
    const sportsData = data?.sports?.[0]?.leagues?.[0]?.teams || [];

    for (const teamEntry of sportsData) {
      const team = teamEntry.team;
      if (team) {
        teams.push({
          id: team.id || '',
          name: team.displayName || team.name || '',
          abbreviation: team.abbreviation || '',
          logo: team.logos?.[0]?.href || team.logo || '',
          league,
          color: team.color ? `#${team.color}` : undefined,
        });
      }
    }

    // Sort alphabetically by name
    teams.sort((a, b) => a.name.localeCompare(b.name));

    return teams;
  }

  /**
   * Search teams by name
   */
  async searchTeams(league: SportsLeague, query: string): Promise<SportsTeamInfo[]> {
    const teams = await this.getTeams(league);
    const lowerQuery = query.toLowerCase();

    return teams.filter(
      team =>
        team.name.toLowerCase().includes(lowerQuery) ||
        team.abbreviation.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all supported leagues
   */
  getSupportedLeagues(): { value: SportsLeague; label: string }[] {
    return Object.entries(LEAGUE_NAMES).map(([value, label]) => ({
      value: value as SportsLeague,
      label,
    }));
  }

  /**
   * Format game time for display
   */
  static formatGameTime(gameTime: Date | null, use24h: boolean = false): string {
    if (!gameTime) {
      return 'TBD';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const gameDate = new Date(gameTime.getFullYear(), gameTime.getMonth(), gameTime.getDate());

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !use24h,
    };

    const time = gameTime.toLocaleTimeString(undefined, timeOptions);

    if (gameDate.getTime() === today.getTime()) {
      return `Today ${time}`;
    } else if (gameDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow ${time}`;
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      };
      const date = gameTime.toLocaleDateString(undefined, dateOptions);
      return `${date} ${time}`;
    }
  }

  /**
   * Format score display
   */
  static formatScore(homeScore: number | null, awayScore: number | null): string {
    if (homeScore === null || awayScore === null) {
      return 'vs';
    }
    return `${awayScore} - ${homeScore}`;
  }

  /**
   * Get status display text
   */
  static getStatusText(status: SportsGameStatus, statusDetail?: string): string {
    switch (status) {
      case 'in_progress':
        return statusDetail || 'LIVE';
      case 'halftime':
        return 'HALFTIME';
      case 'final':
        return statusDetail || 'FINAL';
      case 'delayed':
        return 'DELAYED';
      case 'postponed':
        return 'POSTPONED';
      case 'cancelled':
        return 'CANCELLED';
      case 'scheduled':
      default:
        return statusDetail || '';
    }
  }

  /**
   * Determine if game is live
   */
  static isLive(status: SportsGameStatus): boolean {
    return status === 'in_progress' || status === 'halftime';
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this._cache.clear();
  }

  /**
   * Set cache TTL (in milliseconds)
   */
  setCacheTTL(ttl: number): void {
    this._cacheTTL = ttl;
  }
}

// Export singleton instance
export const sportsDataService = new SportsDataService();

// Export class for testing or custom instances
export { SportsDataService };
