"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[2858],{2858:(e,o,t)=>{t.r(o),t.d(o,{UltraSportsScoreModule:()=>h});var a=t(5183),r=t(7475),i=t(5147),s=t(8938),n=t(378);const l="https://site.api.espn.com/apis/site/v2/sports",d={nfl:"football/nfl",nba:"basketball/nba",mlb:"baseball/mlb",nhl:"hockey/nhl",mls:"soccer/usa.1",premier_league:"soccer/eng.1",ncaaf:"football/college-football",ncaab:"basketball/mens-college-basketball",la_liga:"soccer/esp.1",bundesliga:"soccer/ger.1",serie_a:"soccer/ita.1",ligue_1:"soccer/fra.1"},c={nfl:"NFL",nba:"NBA",mlb:"MLB",nhl:"NHL",mls:"MLS",premier_league:"Premier League",ncaaf:"NCAA Football",ncaab:"NCAA Basketball",la_liga:"La Liga",bundesliga:"Bundesliga",serie_a:"Serie A",ligue_1:"Ligue 1"};class m{constructor(e){this._cache=new Map,this._cacheTTL=6e4,this._teamCache=new Map,e&&(this._cacheTTL=e)}async getGameData(e,o,t,a,r){return"ha_sensor"===o?this.getFromHASensor(e,t):this.getFromESPN(a,r)}async getFromHASensor(e,o){if(!o||!(null==e?void 0:e.states))return null;const t=e.states[o];return t?this.normalizeHASensorData(t):(console.warn(`Sports module: Sensor ${o} not found`),null)}normalizeHASensorData(e){var o,t,a,r;const i=e.attributes||{},s={PRE:"scheduled",IN:"in_progress",POST:"final",NOT_FOUND:"scheduled",BYE:"scheduled",HALF:"halftime"}[e.state]||"scheduled";let n="nfl";if(i.league){const e=i.league.toLowerCase();e.includes("nfl")?n="nfl":e.includes("nba")?n="nba":e.includes("mlb")?n="mlb":e.includes("nhl")?n="nhl":e.includes("mls")?n="mls":e.includes("ncaaf")||e.includes("college football")?n="ncaaf":e.includes("ncaab")||e.includes("college basketball")?n="ncaab":e.includes("premier")&&(n="premier_league")}const l=e=>{if(null==e||""===e)return null;const o=parseInt(e,10);return isNaN(o)?null:o};return{gameId:i.event_id||`${i.team_abbr}_${Date.now()}`,league:n,homeTeam:{id:"home"===i.team_homeaway?i.team_id||"":i.opponent_id||"",name:"home"===i.team_homeaway?i.team_name||"":i.opponent_name||"",abbreviation:"home"===i.team_homeaway?i.team_abbr||"":i.opponent_abbr||"",logo:"home"===i.team_homeaway?i.team_logo||"":i.opponent_logo||"",score:"home"===i.team_homeaway?l(i.team_score):l(i.opponent_score),record:"home"===i.team_homeaway?i.team_record:i.opponent_record,color:"home"===i.team_homeaway?null===(o=i.team_colors)||void 0===o?void 0:o[0]:null===(t=i.opponent_colors)||void 0===t?void 0:t[0]},awayTeam:{id:"away"===i.team_homeaway?i.team_id||"":i.opponent_id||"",name:"away"===i.team_homeaway?i.team_name||"":i.opponent_name||"",abbreviation:"away"===i.team_homeaway?i.team_abbr||"":i.opponent_abbr||"",logo:"away"===i.team_homeaway?i.team_logo||"":i.opponent_logo||"",score:"away"===i.team_homeaway?l(i.team_score):l(i.opponent_score),record:"away"===i.team_homeaway?i.team_record:i.opponent_record,color:"away"===i.team_homeaway?null===(a=i.team_colors)||void 0===a?void 0:a[0]:null===(r=i.opponent_colors)||void 0===r?void 0:r[0]},status:s,statusDetail:i.quarter||i.period||i.inning,clock:i.clock,period:i.quarter||i.period,gameTime:i.date?new Date(i.date):null,venue:i.venue||i.location,broadcast:i.broadcast||i.tv_network,odds:i.odds?{spread:i.odds,overUnder:i.overunder}:void 0,lastUpdated:new Date}}async getFromESPN(e,o){if(!e||!o)return null;const t=`espn_${e}_${o}`,a=this._cache.get(t);if(a&&Date.now()-a.timestamp<this._cacheTTL)return a.data;try{if(!d[e])return console.warn(`[Sports Service] Unknown league ${e}`),null;let a=await this.findTeamGameInScoreboard(e,o);return a||(a=await this.fetchTeamSchedule(e,o)),a&&this._cache.set(t,{data:a,timestamp:Date.now()}),a}catch(e){return console.error("[Sports Service] ESPN API fetch error:",e),null}}async findTeamGameInScoreboard(e,o){var t;try{const a=`${l}/${d[e]}/scoreboard`;console.debug(`Sports module: Fetching scoreboard from ${a}`);const r=await fetch(a);if(!r.ok)return console.debug(`Sports module: Scoreboard request failed with status ${r.status}`),null;const i=await r.json(),s=(null==i?void 0:i.events)||[];console.debug(`Sports module: Found ${s.length} events in scoreboard`);for(const a of s){const r=null===(t=a.competitions)||void 0===t?void 0:t[0];if(!r)continue;const i=(r.competitors||[]).some((e=>{var t,a;return(null===(t=e.team)||void 0===t?void 0:t.id)===o||String(null===(a=e.team)||void 0===a?void 0:a.id)===String(o)}));if(i){console.debug(`Sports module: Found team ${o} in scoreboard game`);const t=this.normalizeESPNEvent(a,e);return console.debug("Sports module: Normalized game data:",t),t}}return console.debug(`Sports module: Team ${o} not found in today's scoreboard`),null}catch(e){return console.debug("Sports module: Scoreboard fetch failed:",e),null}}async fetchTeamSchedule(e,o){var t,a,r,i;try{const s=d[e],n=`${l}/${s}/teams/${o}`,c=await fetch(n);if(c.ok){const o=await c.json(),a=(null===(t=null==o?void 0:o.team)||void 0===t?void 0:t.nextEvent)||[];if(a.length>0){const o=this.normalizeESPNEvent(a[0],e);if(o)return o}}const m=`${l}/${s}/teams/${o}/schedule`,g=await fetch(m);if(!g.ok)return null;const p=await g.json(),u=(null==p?void 0:p.events)||[];if(!u.length)return null;const h=new Date;let _=null,v=null,y=new Date(0);for(const e of u){const o=null===(a=e.competitions)||void 0===a?void 0:a[0];if(!o)continue;const t=(null===(i=null===(r=o.status)||void 0===r?void 0:r.type)||void 0===i?void 0:i.name)||"",s=new Date(e.date);if(t.includes("IN_PROGRESS")||t.includes("HALFTIME")){_=e;break}s>h&&(!_||s<new Date(_.date))&&(_=e),t.includes("FINAL")&&s>y&&(v=e,y=s)}return!_&&v&&(_=v),_?this.normalizeESPNEvent(_,e):null}catch(e){return console.debug("Sports module: Team schedule fetch failed:",e),null}}async getScoreboard(e){const o=`espn_scoreboard_${e}`,t=this._cache.get(o);if(t&&Date.now()-t.timestamp<this._cacheTTL)return t.data;try{const t=d[e];if(!t)return[];const a=`${l}/${t}/scoreboard`,r=await fetch(a);if(!r.ok)return[];const i=await r.json(),s=this.parseESPNScoreboardResponse(i,e);return this._cache.set(o,{data:s,timestamp:Date.now()}),s}catch(e){return console.error("Sports module: ESPN scoreboard fetch error:",e),[]}}parseESPNScoreboardResponse(e,o){return((null==e?void 0:e.events)||[]).map((e=>this.normalizeESPNEvent(e,o))).filter(Boolean)}normalizeESPNEvent(e,o){var t,a,r,i,s,n,l,d,c,m,g,p,u,h,_,v,y,f,b,x,w,$,k,S;const T=null===(t=e.competitions)||void 0===t?void 0:t[0];if(!T)return null;const z=T.competitors||[],q=z.find((e=>"home"===e.homeAway)),D=z.find((e=>"away"===e.homeAway));if(!q||!D)return null;const L=(null===(r=null===(a=T.status)||void 0===a?void 0:a.type)||void 0===r?void 0:r.name)||"";let P,N="scheduled";if(L.includes("IN_PROGRESS")?N="in_progress":L.includes("HALFTIME")?N="halftime":L.includes("FINAL")||L.includes("END")?N="final":L.includes("DELAYED")?N="delayed":L.includes("POSTPONED")?N="postponed":L.includes("CANCELLED")&&(N="cancelled"),((null===(s=null===(i=T.broadcasts)||void 0===i?void 0:i[0])||void 0===s?void 0:s.names)||[]).join(", "),T.odds&&T.odds.length>0){const e=T.odds[0];P={spread:e.details,overUnder:e.overUnder?`O/U ${e.overUnder}`:void 0}}const I=e=>{if(null==e||""===e)return null;const o=parseInt(e,10);return isNaN(o)?null:o},E=e=>{var o;const t=null==e?void 0:e.team;if(!t)return console.debug("Sports module: No team data for logo extraction"),"";if(t.logo)return console.debug(`Sports module: Found direct logo: ${t.logo}`),t.logo;if(t.logos&&t.logos.length>0){const e=t.logos.find((e=>{var o,t;return(null===(o=e.rel)||void 0===o?void 0:o.includes("default"))||(null===(t=e.rel)||void 0===t?void 0:t.includes("full"))})),a=(null==e?void 0:e.href)||(null===(o=t.logos[0])||void 0===o?void 0:o.href)||"";return console.debug(`Sports module: Found logo from array: ${a}`),a}return console.debug(`Sports module: No logo found for team ${t.abbreviation||t.name}`),""},U=e=>{var o,t;if(e.records&&e.records.length>0){const t=e.records.find((e=>"total"===e.type||"overall"===e.type||"overall"===e.name));if(null==t?void 0:t.summary)return t.summary;if(null===(o=e.records[0])||void 0===o?void 0:o.summary)return e.records[0].summary}if(e.form)return e.form;const a=e.statistics||(null===(t=e.team)||void 0===t?void 0:t.statistics);if(a&&a.length>0){const e=a.find((e=>"points"===e.name||"PTS"===e.abbreviation)),o=a.find((e=>"gamesPlayed"===e.name||"GP"===e.abbreviation));if(e&&o)return`${o.value}GP, ${e.value}Pts`}};return{gameId:e.id||`${null===(n=q.team)||void 0===n?void 0:n.id}_${null===(l=D.team)||void 0===l?void 0:l.id}_${e.date}`,league:o,homeTeam:{id:(null===(d=q.team)||void 0===d?void 0:d.id)||"",name:(null===(c=q.team)||void 0===c?void 0:c.displayName)||(null===(m=q.team)||void 0===m?void 0:m.name)||"",abbreviation:(null===(g=q.team)||void 0===g?void 0:g.abbreviation)||"",logo:E(q),score:I(q.score),record:U(q),color:(null===(p=q.team)||void 0===p?void 0:p.color)?`#${q.team.color}`:void 0},awayTeam:{id:(null===(u=D.team)||void 0===u?void 0:u.id)||"",name:(null===(h=D.team)||void 0===h?void 0:h.displayName)||(null===(_=D.team)||void 0===_?void 0:_.name)||"",abbreviation:(null===(v=D.team)||void 0===v?void 0:v.abbreviation)||"",logo:E(D),score:I(D.score),record:U(D),color:(null===(y=D.team)||void 0===y?void 0:y.color)?`#${D.team.color}`:void 0},status:N,statusDetail:(null===(b=null===(f=T.status)||void 0===f?void 0:f.type)||void 0===b?void 0:b.shortDetail)||(null===(w=null===(x=T.status)||void 0===x?void 0:x.type)||void 0===w?void 0:w.description),clock:null===($=T.status)||void 0===$?void 0:$.displayClock,period:null===(k=T.status)||void 0===k?void 0:k.period,gameTime:e.date?new Date(e.date):null,venue:null===(S=T.venue)||void 0===S?void 0:S.fullName,broadcast:(()=>{var e;if(T.broadcasts&&T.broadcasts.length>0){const o=[];for(const t of T.broadcasts)t.names&&t.names.length>0?o.push(...t.names):t.market&&(null===(e=t.media)||void 0===e?void 0:e.shortName)&&o.push(t.media.shortName);if(o.length>0)return o.join(", ")}if(T.geoBroadcasts&&T.geoBroadcasts.length>0){const e=T.geoBroadcasts.filter((e=>{var o;return null===(o=e.media)||void 0===o?void 0:o.shortName})).map((e=>e.media.shortName));if(e.length>0)return[...new Set(e)].join(", ")}return""})(),odds:P,lastUpdated:new Date}}async getTeams(e){const o=`teams_${e}`,t=this._teamCache.get(o);if(t)return t;try{const t=d[e];if(!t)return[];const a=`${l}/${t}/teams?limit=100`,r=await fetch(a);if(!r.ok)return[];const i=await r.json(),s=this.parseESPNTeamsResponse(i,e);return this._teamCache.set(o,s),s}catch(e){return console.error("Sports module: ESPN teams fetch error:",e),[]}}parseESPNTeamsResponse(e,o){var t,a,r,i,s,n;const l=[],d=(null===(i=null===(r=null===(a=null===(t=null==e?void 0:e.sports)||void 0===t?void 0:t[0])||void 0===a?void 0:a.leagues)||void 0===r?void 0:r[0])||void 0===i?void 0:i.teams)||[];for(const e of d){const t=e.team;t&&l.push({id:t.id||"",name:t.displayName||t.name||"",abbreviation:t.abbreviation||"",logo:(null===(n=null===(s=t.logos)||void 0===s?void 0:s[0])||void 0===n?void 0:n.href)||t.logo||"",league:o,color:t.color?`#${t.color}`:void 0})}return l.sort(((e,o)=>e.name.localeCompare(o.name))),l}async searchTeams(e,o){const t=await this.getTeams(e),a=o.toLowerCase();return t.filter((e=>e.name.toLowerCase().includes(a)||e.abbreviation.toLowerCase().includes(a)))}getSupportedLeagues(){return Object.entries(c).map((([e,o])=>({value:e,label:o})))}static formatGameTime(e,o=!1){if(!e)return"TBD";const t=new Date,a=new Date(t.getFullYear(),t.getMonth(),t.getDate()),r=new Date(a);r.setDate(r.getDate()+1);const i=new Date(e.getFullYear(),e.getMonth(),e.getDate()),s={hour:"numeric",minute:"2-digit",hour12:!o},n=e.toLocaleTimeString(void 0,s);if(i.getTime()===a.getTime())return`Today ${n}`;if(i.getTime()===r.getTime())return`Tomorrow ${n}`;{const o={weekday:"short",month:"short",day:"numeric"};return`${e.toLocaleDateString(void 0,o)} ${n}`}}static formatScore(e,o){return null===e||null===o?"vs":`${o} - ${e}`}static getStatusText(e,o){switch(e){case"in_progress":return o||"LIVE";case"halftime":return"HALFTIME";case"final":return o||"FINAL";case"delayed":return"DELAYED";case"postponed":return"POSTPONED";case"cancelled":return"CANCELLED";default:return o||""}}static isLive(e){return"in_progress"===e||"halftime"===e}clearCache(){this._cache.clear()}setCacheTTL(e){this._cacheTTL=e}}const g=new m;var p=t(6478),u=t(6990);t(7921);class h extends r.m{constructor(){super(...arguments),this.metadata={type:"sports_score",title:"Sports Score",description:"Display live sports scores, upcoming games, and team info for your favorite teams",author:"WJD Designs",version:"1.0.0",icon:"mdi:scoreboard",category:"data",tags:["sports","scores","nfl","nba","mlb","nhl","soccer","football","pro"]},this._stateByConfig=new Map,this._refreshIntervals=new Map,this._teams=new Map,this._activeIntervalKey="",this._currentGameData=null,this._currentError=null,this._currentLoading=!1}_getState(e){return this._stateByConfig.has(e)||this._stateByConfig.set(e,{gameData:null,loading:!1,error:null,lastFetch:0,fetchInProgress:!1}),this._stateByConfig.get(e)}_setupAutoRefresh(e,o,t){const a=e.refresh_interval||5,r=t?Math.max(1,Math.min(a,5)):Math.max(a,10),i=60*r*1e3,s=`${o}_${i}_${t}`;if(this._activeIntervalKey===s&&this._refreshIntervals.has(o))return;if(this._refreshIntervals.size>0){for(const[e,o]of this._refreshIntervals.entries())clearInterval(o);this._refreshIntervals.clear()}if("espn_api"!==e.data_source)return void(this._activeIntervalKey="");if(!e.team_id)return void(this._activeIntervalKey="");const n=setInterval((()=>{this._getState(o).lastFetch=0,this.triggerPreviewUpdate(!0)}),i);this._refreshIntervals.set(o,n),this._activeIntervalKey=s,console.debug(`[Sports Module] Auto-refresh set up for ${o}: every ${r} min (live: ${t})`)}cleanup(){for(const[e,o]of this._refreshIntervals.entries())clearInterval(o);this._refreshIntervals.clear(),this._stateByConfig.clear(),console.debug("[Sports Module] Cleaned up all refresh intervals")}_cleanupConfigInterval(e){const o=this._refreshIntervals.get(e);o&&(clearInterval(o),this._refreshIntervals.delete(e))}createDefault(e,o){return{id:e||this.generateId("sports_score"),type:"sports_score",data_source:"espn_api",sensor_entity:"",league:"nfl",team_id:"",team_name:"",display_style:"scorecard",refresh_interval:5,show_team_logos:!0,show_team_names:!0,show_team_records:!0,show_game_time:!0,show_venue:!1,show_broadcast:!1,show_score:!0,show_odds:!1,show_status_detail:!0,use_team_colors:!0,win_color:"#4caf50",loss_color:"#f44336",in_progress_color:"#ff9800",scheduled_color:"var(--primary-text-color)",text_color:"",team_name_font_size:"16px",score_font_size:"32px",detail_font_size:"12px",logo_size:"48px",compact_mode:!1,show_logo_background:!0,logo_background_size:"80px",logo_background_opacity:8,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},enable_hover_effect:!1,hover_background_color:"",display_mode:"always",display_conditions:[]}}renderActionsTab(e,o,t,a){return i.A.render(e,o,(e=>a(e)))}renderOtherTab(e,o,t,a){return s.X.render(e,o,(e=>a(e)))}renderGeneralTab(e,o,t,r){var i,s,l;const d=e,c=(null===(i=null==o?void 0:o.locale)||void 0===i?void 0:i.language)||"en",m=n.x.checkIntegrationAuth(o);return"pro"===(null===(s=null==m?void 0:m.subscription)||void 0===s?void 0:s.tier)&&"active"===(null===(l=null==m?void 0:m.subscription)||void 0===l?void 0:l.status)?a.qy`
      <style>
        ${this.injectUcFormStyles()}
        ${this.getEditorStyles()}
      </style>

      <!-- Data Source Section -->
      ${this.renderDataSourceSection(d,o,r,c)}

      <!-- Display Settings Section -->
      ${this.renderDisplaySettingsSection(d,o,r,c)}

      <!-- Element Visibility Section -->
      ${this.renderElementVisibilitySection(d,o,r,c)}

      <!-- Styling Section -->
      ${this.renderStylingSection(d,o,r,c)}
    `:this.renderProLockUI(c)}renderProLockUI(e){return a.qy`
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
          ${(0,p.kg)("editor.pro.feature_locked",e,"Pro Feature")}
        </div>
        <div style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;">
          ${(0,p.kg)("editor.pro.sports_description",e,"Sports Score module requires an Ultra Card Pro subscription to display live sports scores and team information.")}
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
          ${(0,p.kg)("editor.pro.upgrade_button",e,"Upgrade to Pro")}
        </a>
      </div>
    `}renderDataSourceSection(e,o,t,r){const i=g.getSupportedLeagues();return a.qy`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${(0,p.kg)("editor.sports.data_source",r,"DATA SOURCE")}
        </div>
        <div class="section-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${(0,p.kg)("editor.sports.data_source_desc",r,"Choose how to get sports data. Use an existing Home Assistant sensor (like Team Tracker) or fetch directly from ESPN.")}
        </div>

        <!-- Data Source Toggle -->
        ${this.renderFieldSection((0,p.kg)("editor.sports.source_type",r,"Source Type"),(0,p.kg)("editor.sports.source_type_desc",r,"Select the data source for sports information"),o,{data_source:e.data_source||"espn_api"},[this.selectField("data_source",[{value:"espn_api",label:"ESPN API (No Setup Required)"},{value:"ha_sensor",label:"Home Assistant Sensor"}])],(e=>{t({data_source:e.detail.value.data_source}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

        ${"ha_sensor"===e.data_source?a.qy`
              <div style="margin-top: 16px;">
                ${this.renderConditionalFieldsGroup((0,p.kg)("editor.sports.ha_sensor_config",r,"Home Assistant Sensor"),a.qy`
                    ${this.renderFieldSection((0,p.kg)("editor.sports.sensor_entity",r,"Sensor Entity"),(0,p.kg)("editor.sports.sensor_entity_desc",r,"Select a Team Tracker or other sports sensor"),o,{sensor_entity:e.sensor_entity||""},[{name:"sensor_entity",selector:{entity:{domain:"sensor"}}}],(e=>{t({sensor_entity:e.detail.value.sensor_entity}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

                    ${e.sensor_entity&&o.states[e.sensor_entity]?a.qy`
                          <div style="margin-top: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                              ${(0,p.kg)("editor.sports.sensor_status",r,"Sensor Status")}:
                            </div>
                            <div style="font-size: 13px; color: var(--secondary-text-color);">
                              State: <strong>${o.states[e.sensor_entity].state}</strong>
                            </div>
                          </div>
                        `:""}
                  `)}
              </div>
            `:a.qy`
              <div style="margin-top: 16px;">
                ${this.renderConditionalFieldsGroup((0,p.kg)("editor.sports.espn_config",r,"ESPN Configuration"),a.qy`
                    <!-- League Selection -->
                    ${this.renderFieldSection((0,p.kg)("editor.sports.league",r,"League"),(0,p.kg)("editor.sports.league_desc",r,"Select the sports league"),o,{league:e.league||"nfl"},[this.selectField("league",i.map((e=>({value:e.value,label:e.label}))))],(e=>{t({league:e.detail.value.league,team_id:"",team_name:""}),this._loadTeamsForLeague(e.detail.value.league),this.triggerPreviewUpdate(!0)}))}

                    <!-- Team Selection -->
                    ${this.renderTeamSelector(e,o,t,r)}
                  `)}
              </div>
            `}
      </div>
    `}renderTeamSelector(e,o,t,r){var i,s;const n=e.league||"nfl",l=this._teams.get(n)||[];0===l.length&&this._loadTeamsForLeague(n);const d=l.map((e=>({value:e.id,label:e.name})));return e.team_id&&e.team_name&&!d.find((o=>o.value===e.team_id))&&d.unshift({value:e.team_id,label:e.team_name}),a.qy`
      <div style="margin-top: 16px;">
        ${this.renderFieldSection((0,p.kg)("editor.sports.team",r,"Team"),(0,p.kg)("editor.sports.team_desc",r,"Select your favorite team"),o,{team_id:e.team_id||""},[this.selectField("team_id",d.length>0?d:[{value:"",label:"Loading teams..."}])],(e=>{const o=e.detail.value.team_id,a=l.find((e=>e.id===o));t({team_id:o,team_name:(null==a?void 0:a.name)||""}),this.triggerPreviewUpdate(!0)}))}

        ${e.team_id&&e.team_name?a.qy`
              <div style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                ${(null===(i=l.find((o=>o.id===e.team_id)))||void 0===i?void 0:i.logo)?a.qy`<img src="${null===(s=l.find((o=>o.id===e.team_id)))||void 0===s?void 0:s.logo}" style="width: 32px; height: 32px; object-fit: contain;" />`:""}
                <div style="font-weight: 600;">${e.team_name}</div>
              </div>
            `:""}
      </div>
    `}async _loadTeamsForLeague(e){if(!this._teams.has(e))try{const o=await g.getTeams(e);this._teams.set(e,o.map((e=>({id:e.id,name:e.name,logo:e.logo})))),this.triggerPreviewUpdate()}catch(e){console.error("Sports module: Error loading teams:",e)}}renderDisplaySettingsSection(e,o,t,r){return a.qy`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${(0,p.kg)("editor.sports.display_settings",r,"DISPLAY SETTINGS")}
        </div>

        <!-- Display Style -->
        ${this.renderFieldSection((0,p.kg)("editor.sports.display_style",r,"Display Style"),(0,p.kg)("editor.sports.display_style_desc",r,"Choose how to display the game information"),o,{display_style:e.display_style||"scorecard"},[this.selectField("display_style",[{value:"scorecard",label:"Scorecard - Classic score display"},{value:"upcoming",label:"Upcoming - Next game info"},{value:"compact",label:"Compact - Single line ticker"},{value:"detailed",label:"Detailed - Full game info"},{value:"mini",label:"Mini - Small logo & score"},{value:"logo_bg",label:"Logo BG - Half-card with logo background"}])],(e=>{t({display_style:e.detail.value.display_style}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

        <!-- Refresh Interval -->
        ${this.renderSliderField((0,p.kg)("editor.sports.refresh_interval",r,"Refresh Interval (minutes)"),(0,p.kg)("editor.sports.refresh_interval_desc",r,"How often to refresh the data (1-60 minutes)"),e.refresh_interval||5,5,1,60,1,(e=>t({refresh_interval:e})),"min")}
      </div>
    `}renderElementVisibilitySection(e,o,t,r){const i=e.display_style||"scorecard",s={scorecard:["logos","names","records","score","time","venue","broadcast","status"],upcoming:["logos","names","time","venue","broadcast"],compact:["logos","names","score","status"],detailed:["logos","names","records","score","time","venue","broadcast","status","odds"],mini:["logos","score","time","status"],logo_bg:["logos","names","score","time","status"]},n=s[i]||s.scorecard,l=[{key:"logos",field:"show_team_logos",titleKey:"editor.sports.show_team_logos",title:"Team Logos",descKey:"editor.sports.show_team_logos_desc",desc:"Display team logos"},{key:"names",field:"show_team_names",titleKey:"editor.sports.show_team_names",title:"Team Names",descKey:"editor.sports.show_team_names_desc",desc:"Display team names"},{key:"records",field:"show_team_records",titleKey:"editor.sports.show_team_records",title:"Team Records",descKey:"editor.sports.show_team_records_desc",desc:"Display win-loss records"},{key:"score",field:"show_score",titleKey:"editor.sports.show_score",title:"Score",descKey:"editor.sports.show_score_desc",desc:"Display the game score"},{key:"time",field:"show_game_time",titleKey:"editor.sports.show_game_time",title:"Game Time",descKey:"editor.sports.show_game_time_desc",desc:"Display game date and time"},{key:"venue",field:"show_venue",titleKey:"editor.sports.show_venue",title:"Venue",descKey:"editor.sports.show_venue_desc",desc:"Display game venue/stadium"},{key:"broadcast",field:"show_broadcast",titleKey:"editor.sports.show_broadcast",title:"Broadcast Info",descKey:"editor.sports.show_broadcast_desc",desc:"Display TV/streaming channel"},{key:"status",field:"show_status_detail",titleKey:"editor.sports.show_status_detail",title:"Status Details",descKey:"editor.sports.show_status_detail_desc",desc:"Display quarter/period/inning info"},{key:"odds",field:"show_odds",titleKey:"editor.sports.show_odds",title:"Betting Odds",descKey:"editor.sports.show_odds_desc",desc:"Display spread and over/under"}].filter((e=>n.includes(e.key)));return a.qy`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${(0,p.kg)("editor.sports.element_visibility",r,"ELEMENT VISIBILITY")}
        </div>
        <div class="section-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${(0,p.kg)("editor.sports.element_visibility_desc",r,"Choose which elements to show in the display")}
          <span style="display: block; margin-top: 4px; font-style: italic; opacity: 0.8;">
            Showing options for: <strong>${i.charAt(0).toUpperCase()+i.slice(1)}</strong> style
          </span>
        </div>
        
        <!-- Data availability note -->
        <div style="background: rgba(var(--rgb-primary-color), 0.1); border-left: 3px solid var(--primary-color); padding: 8px 12px; margin-bottom: 16px; border-radius: 0 4px 4px 0; font-size: 12px; color: var(--secondary-text-color);">
          <ha-icon icon="mdi:information-outline" style="--mdi-icon-size: 14px; margin-right: 4px; vertical-align: middle;"></ha-icon>
          <span style="vertical-align: middle;">Some data (records, broadcast, odds) may not be available for all leagues or games depending on the data source.</span>
        </div>

        ${this.renderSettingsSection("","",l.map((a=>({title:(0,p.kg)(a.titleKey,r,a.title),description:(0,p.kg)(a.descKey,r,a.desc),hass:o,data:{[a.field]:e[a.field]},schema:[this.booleanField(a.field)],onChange:e=>{t({[a.field]:e.detail.value[a.field]}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}))))}
      </div>
    `}renderStylingSection(e,o,t,r){const i=e.display_style||"scorecard",s={scorecard:["logo","score","name","detail"],upcoming:["logo","name","detail"],compact:["logo","score","name"],detailed:["logo","score","name","detail"],mini:["logo","score"],logo_bg:["logo","score","name"]},n=s[i]||s.scorecard,l=n.includes("score"),d=n.includes("name"),c=n.includes("detail");return a.qy`
      <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div class="section-title" style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;">
          ${(0,p.kg)("editor.sports.styling",r,"STYLING")}
        </div>

        <!-- Use Team Colors -->
        ${this.renderSettingsSection("","",[{title:(0,p.kg)("editor.sports.use_team_colors",r,"Use Team Colors"),description:(0,p.kg)("editor.sports.use_team_colors_desc",r,"Automatically apply team brand colors"),hass:o,data:{use_team_colors:e.use_team_colors},schema:[this.booleanField("use_team_colors")],onChange:e=>{t({use_team_colors:e.detail.value.use_team_colors}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}

        <!-- Text Color Override -->
        <div style="margin-top: 16px;">
          <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            ${(0,p.kg)("editor.sports.text_color",r,"Text Color")}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
            ${(0,p.kg)("editor.sports.text_color_desc",r,"Override the default text color for better readability")}
          </div>
          <ultra-color-picker
            .value=${e.text_color||""}
            .defaultValue=${""}
            .hass=${o}
            @value-changed=${e=>{t({text_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          ></ultra-color-picker>
        </div>

        <!-- Status Colors -->
        <div style="margin-top: 16px;">
          <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">
            ${(0,p.kg)("editor.sports.status_colors",r,"Status Colors")}
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${(0,p.kg)("editor.sports.in_progress_color",r,"Live/In Progress")}
              </div>
              <ultra-color-picker
                .value=${e.in_progress_color||"#ff9800"}
                .defaultValue=${"#ff9800"}
                .hass=${o}
                @value-changed=${e=>{t({in_progress_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              ></ultra-color-picker>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${(0,p.kg)("editor.sports.scheduled_color",r,"Scheduled")}
              </div>
              <ultra-color-picker
                .value=${e.scheduled_color||"var(--primary-text-color)"}
                .defaultValue=${"var(--primary-text-color)"}
                .hass=${o}
                @value-changed=${e=>{t({scheduled_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              ></ultra-color-picker>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${(0,p.kg)("editor.sports.win_color",r,"Win")}
              </div>
              <ultra-color-picker
                .value=${e.win_color||"#4caf50"}
                .defaultValue=${"#4caf50"}
                .hass=${o}
                @value-changed=${e=>{t({win_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              ></ultra-color-picker>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px;">
                ${(0,p.kg)("editor.sports.loss_color",r,"Loss")}
              </div>
              <ultra-color-picker
                .value=${e.loss_color||"#f44336"}
                .defaultValue=${"#f44336"}
                .hass=${o}
                @value-changed=${e=>{t({loss_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              ></ultra-color-picker>
            </div>
          </div>
        </div>

        <!-- Size Controls - Conditional per style -->
        <div style="margin-top: 24px;">
          <div class="section-title" style="font-size: 16px; margin-bottom: 16px;">
            ${(0,p.kg)("editor.sports.size_controls",r,"SIZE CONTROLS")}
            <span style="font-weight: 400; font-size: 12px; color: var(--secondary-text-color); margin-left: 8px;">
              (${i.charAt(0).toUpperCase()+i.slice(1)} style)
            </span>
          </div>
          
          <!-- Logo Size - Always available -->
          ${this._renderSizeSlider(e,t,"logo_size",(0,p.kg)("editor.sports.logo_size",r,"Logo Size"),(0,p.kg)("editor.sports.logo_size_desc",r,"Size of team logos in pixels"),16,96,"mini"===i?32:"compact"===i?20:"detailed"===i?56:48)}

          <!-- Score Font Size - Conditional -->
          ${l?this._renderSizeSlider(e,t,"score_font_size",(0,p.kg)("editor.sports.score_font_size",r,"Score Font Size"),(0,p.kg)("editor.sports.score_font_size_desc",r,"Size of score text in pixels"),12,64,"mini"===i?16:"compact"===i?14:"detailed"===i?36:32):""}

          <!-- Team Name Font Size - Conditional -->
          ${d?this._renderSizeSlider(e,t,"team_name_font_size",(0,p.kg)("editor.sports.team_name_font_size",r,"Team Name Font Size"),(0,p.kg)("editor.sports.team_name_font_size_desc",r,"Size of team name text in pixels"),10,32,"detailed"===i?15:"compact"===i?14:16):""}

          <!-- Detail Font Size - Conditional -->
          ${c?this._renderSizeSlider(e,t,"detail_font_size",(0,p.kg)("editor.sports.detail_font_size",r,"Detail Font Size"),(0,p.kg)("editor.sports.detail_font_size_desc",r,"Size of detail text (records, venue, etc.) in pixels"),8,20,12):""}
        </div>

        <!-- Logo BG Style Options - Only shown for logo_bg style -->
        ${"logo_bg"===i?a.qy`
              <div style="margin-top: 24px;">
                <div class="section-title" style="font-size: 16px; margin-bottom: 16px;">
                  ${(0,p.kg)("editor.sports.logo_bg_options",r,"BACKGROUND LOGO OPTIONS")}
                </div>
                
                <!-- Show Logo Background Toggle -->
                ${this.renderSettingsSection("","",[{title:(0,p.kg)("editor.sports.show_logo_background",r,"Show Background Logos"),description:(0,p.kg)("editor.sports.show_logo_background_desc",r,"Display subtle watermark logos in the background"),hass:o,data:{show_logo_background:!1!==e.show_logo_background},schema:[this.booleanField("show_logo_background")],onChange:e=>{t({show_logo_background:e.detail.value.show_logo_background}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}

                ${!1!==e.show_logo_background?a.qy`
                      <div style="margin-top: 16px;">
                        ${this._renderSizeSlider(e,t,"logo_background_size",(0,p.kg)("editor.sports.logo_background_size",r,"Background Logo Size"),(0,p.kg)("editor.sports.logo_background_size_desc",r,"Size of the watermark logos in the background"),40,150,80)}
                      </div>
                      <div style="margin-top: 16px;">
                        <div class="field-container">
                          <div class="field-title">${(0,p.kg)("editor.sports.logo_background_opacity",r,"Background Logo Opacity")}</div>
                          <div class="field-description">${(0,p.kg)("editor.sports.logo_background_opacity_desc",r,"Transparency of the watermark logos (1-20%)")}</div>
                          <div class="gap-control-container">
                            <input
                              type="range"
                              class="gap-slider"
                              min="1"
                              max="20"
                              step="1"
                              .value="${String(e.logo_background_opacity||8)}"
                              @input=${e=>{const o=e.target;t({logo_background_opacity:parseInt(o.value,10)}),this.triggerPreviewUpdate()}}
                            />
                            <input
                              type="number"
                              class="gap-input"
                              min="1"
                              max="20"
                              step="1"
                              .value="${String(e.logo_background_opacity||8)}"
                              @input=${e=>{const o=e.target,a=parseInt(o.value,10);!isNaN(a)&&a>=1&&a<=20&&(t({logo_background_opacity:a}),this.triggerPreviewUpdate())}}
                            />
                            <span style="font-size: 12px; color: var(--secondary-text-color); min-width: 20px;">%</span>
                            <button
                              class="reset-btn"
                              @click=${()=>{t({logo_background_opacity:8}),this.triggerPreviewUpdate()}}
                              title="Reset to default (8%)"
                            >
                              <ha-icon icon="mdi:refresh"></ha-icon>
                            </button>
                          </div>
                        </div>
                      </div>
                    `:""}
              </div>
            `:""}
      </div>
    `}getEditorStyles(){return"\n      .settings-section {\n        margin-bottom: 16px;\n      }\n      .section-title {\n        font-size: 18px;\n        font-weight: 700;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 16px;\n      }\n      .section-description {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        margin-bottom: 16px;\n      }\n      .field-title {\n        font-size: 14px;\n        font-weight: 600;\n        margin-bottom: 4px;\n      }\n      .field-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-bottom: 8px;\n      }\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        padding: 16px;\n      }\n      /* Slider control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n      .gap-input {\n        width: 56px !important;\n        max-width: 56px !important;\n        min-width: 56px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    "}_renderSizeSlider(e,o,t,r,i,s,n,l,d="px"){const c=e[t],m="string"==typeof c?parseInt(c.replace(d,""),10)||l:"number"==typeof c?c:l;return a.qy`
      <div class="field-container" style="margin-bottom: 16px;">
        <div class="field-title">${r}</div>
        <div class="field-description">${i}</div>
        <div class="gap-control-container">
          <input
            type="range"
            class="gap-slider"
            min="${s}"
            max="${n}"
            step="1"
            .value="${String(m)}"
            @input=${e=>{const a=`${e.target.value}${d}`;o({[t]:a}),this.triggerPreviewUpdate()}}
          />
          <input
            type="number"
            class="gap-input"
            min="${s}"
            max="${n}"
            step="1"
            .value="${String(m)}"
            @input=${e=>{const a=e.target,r=parseInt(a.value,10);if(!isNaN(r)&&r>=s&&r<=n){const e=`${r}${d}`;o({[t]:e}),this.triggerPreviewUpdate()}}}
            @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const a=e.target,r=parseInt(a.value,10)||l,i="ArrowUp"===e.key?1:-1,c=`${Math.max(s,Math.min(n,r+i))}${d}`;o({[t]:c}),this.triggerPreviewUpdate()}}}
          />
          <button
            class="reset-btn"
            @click=${()=>{const e=`${l}${d}`;o({[t]:e}),this.triggerPreviewUpdate()}}
            title="Reset to default (${l}${d})"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `}renderPreview(e,o,t,r){var i,s;const l=e,d=l,c=l.design||{},g=n.x.checkIntegrationAuth(o);if("pro"!==(null===(i=null==g?void 0:g.subscription)||void 0===i?void 0:i.tier)||"active"!==(null===(s=null==g?void 0:g.subscription)||void 0===s?void 0:s.status))return this.renderLockedPreview();const p=`${l.data_source}_${l.league}_${l.team_id}_${l.sensor_entity}`,u=this._getState(p);if(this._fetchDataIfNeeded(l,o,p),u.loading)return this.renderLoadingState();if(this._currentGameData=u.gameData,this._currentError=u.error,this._currentLoading=u.loading,u.gameData&&!u.loading){const e=m.isLive(u.gameData.status);this._setupAutoRefresh(l,p,e)}else u.loading||u.fetchInProgress||!l.team_id||this._setupAutoRefresh(l,p,!1);const h={background_color:d.background_color||c.background_color,background_image:d.background_image||c.background_image,background_image_type:d.background_image_type||c.background_image_type,background_image_entity:d.background_image_entity||c.background_image_entity,background_image_upload:d.background_image_upload||c.background_image_upload,background_image_url:d.background_image_url||c.background_image_url,background_size:d.background_size||c.background_size,background_position:d.background_position||c.background_position,background_repeat:d.background_repeat||c.background_repeat,padding_top:void 0!==c.padding_top?c.padding_top:d.padding_top,padding_bottom:void 0!==c.padding_bottom?c.padding_bottom:d.padding_bottom,padding_left:void 0!==c.padding_left?c.padding_left:d.padding_left,padding_right:void 0!==c.padding_right?c.padding_right:d.padding_right,margin_top:void 0!==c.margin_top?c.margin_top:d.margin_top,margin_bottom:void 0!==c.margin_bottom?c.margin_bottom:d.margin_bottom,margin_left:void 0!==c.margin_left?c.margin_left:d.margin_left,margin_right:void 0!==c.margin_right?c.margin_right:d.margin_right,border_style:d.border_style||c.border_style,border_width:d.border_width||c.border_width,border_color:d.border_color||c.border_color,border_radius:d.border_radius||c.border_radius,box_shadow_h:d.box_shadow_h||c.box_shadow_h,box_shadow_v:d.box_shadow_v||c.box_shadow_v,box_shadow_blur:d.box_shadow_blur||c.box_shadow_blur,box_shadow_spread:d.box_shadow_spread||c.box_shadow_spread,box_shadow_color:d.box_shadow_color||c.box_shadow_color,width:d.width||c.width,height:d.height||c.height,min_width:d.min_width||c.min_width,min_height:d.min_height||c.min_height,max_width:d.max_width||c.max_width,max_height:d.max_height||c.max_height,overflow:d.overflow||c.overflow,backdrop_filter:d.backdrop_filter||c.backdrop_filter,background_filter:d.background_filter||c.background_filter},_=h.background_filter&&"none"!==h.background_filter,v=this.getBackgroundImageCSS(h,o),y={padding:h.padding_top||h.padding_bottom||h.padding_left||h.padding_right?`${this.addPixelUnit(h.padding_top)||"0px"} ${this.addPixelUnit(h.padding_right)||"0px"} ${this.addPixelUnit(h.padding_bottom)||"0px"} ${this.addPixelUnit(h.padding_left)||"0px"}`:"0",margin:h.margin_top||h.margin_bottom||h.margin_left||h.margin_right?`${this.addPixelUnit(h.margin_top)||"0px"} ${this.addPixelUnit(h.margin_right)||"0px"} ${this.addPixelUnit(h.margin_bottom)||"0px"} ${this.addPixelUnit(h.margin_left)||"0px"}`:"0",background:_?"transparent":h.background_color||"var(--card-background-color, var(--ha-card-background))",backgroundImage:_?"none":v,backgroundSize:_?"auto":h.background_size||"cover",backgroundPosition:_?"center":h.background_position||"center",backgroundRepeat:_?"repeat":h.background_repeat||"no-repeat",backdropFilter:h.backdrop_filter||"none",border:h.border_style&&"none"!==h.border_style?`${this.addPixelUnit(h.border_width)||"1px"} ${h.border_style} ${h.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(h.border_radius)||"8px",boxShadow:h.box_shadow_h||h.box_shadow_v||h.box_shadow_blur?`${h.box_shadow_h||"0px"} ${h.box_shadow_v||"0px"} ${h.box_shadow_blur||"0px"} ${h.box_shadow_spread||"0px"} ${h.box_shadow_color||"rgba(0,0,0,0.2)"}`:"none",width:h.width||"auto",height:h.height||"auto",minWidth:h.min_width||"auto",minHeight:h.min_height||"auto",maxWidth:h.max_width||"none",maxHeight:h.max_height||"none",overflow:_?"hidden":h.overflow||"visible"};let f;switch(_&&(y["--bg-image"]=v,y["--bg-color"]=h.background_color||"var(--card-background-color, var(--ha-card-background))",y["--bg-size"]=h.background_size||"cover",y["--bg-position"]=h.background_position||"center",y["--bg-repeat"]=h.background_repeat||"no-repeat",y["--bg-filter"]=h.background_filter,y.position="relative",y.isolation="isolate"),l.display_style){case"upcoming":f=this.renderUpcomingStyle(l,o);break;case"compact":f=this.renderCompactStyle(l,o);break;case"detailed":f=this.renderDetailedStyle(l,o);break;case"mini":f=this.renderMiniStyle(l,o);break;case"logo_bg":f=this.renderLogoBgStyle(l,o);break;default:f=this.renderScorecardStyle(l,o)}const b=_?"has-background-filter":"";return a.qy`
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
      <div class="sports-module-container ${b}" style="${this.styleObjectToCss(y)}">
        ${f}
      </div>
    `}getBackgroundImageCSS(e,o){var t;const a=e.background_image_type,r=e.background_image,i=e.background_image_entity,s=e.background_image_upload,n=e.background_image_url;if(!a||"none"===a)return"none";switch(a){case"upload":{const e=s||r;if(e)return`url("${(0,u.V)(o,e)}")`;break}case"url":{const e=n||r;if(e)return`url("${e}")`;break}case"entity":if(i&&o.states[i]){const e=o.states[i],a=(null===(t=e.attributes)||void 0===t?void 0:t.entity_picture)||e.state;if(a&&"unknown"!==a&&"unavailable"!==a)return`url("${a}")`}}return"none"}styleObjectToCss(e){return Object.entries(e).filter((([e,o])=>{if(null==o)return!1;if(!e.startsWith("--")){if("padding"===e&&"0"===o)return!1;if("margin"===e&&"0"===o)return!1;if("border"===e&&"none"===o)return!1;if("boxShadow"===e&&"none"===o)return!1;if("backgroundImage"===e&&"none"===o)return!1;if("backdropFilter"===e&&"none"===o)return!1}return!0})).map((([e,o])=>e.startsWith("--")?`${e}: ${o}`:`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${o}`)).join("; ")}renderLockedPreview(){return a.qy`
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
    `}async _fetchDataIfNeeded(e,o,t){const a=60*(e.refresh_interval||5)*1e3,r=Date.now(),i=this._getState(t);if(!(i.lastFetch>0&&r-i.lastFetch<a||i.fetchInProgress)){i.fetchInProgress=!0,i.loading=!0,i.error=null;try{const t=await g.getGameData(o,e.data_source,e.sensor_entity,e.league,e.team_id);i.gameData=t,i.lastFetch=Date.now(),i.loading=!1,i.fetchInProgress=!1,this.triggerPreviewUpdate(!0)}catch(e){i.error=e.message||"Failed to fetch data",i.lastFetch=Date.now(),i.loading=!1,i.fetchInProgress=!1,this.triggerPreviewUpdate(!0)}}}renderScorecardStyle(e,o){const t=this._currentGameData,r=e.logo_size||"48px",i=e.score_font_size||"32px",s=e.team_name_font_size||"16px",n=e.text_color||"var(--secondary-text-color)";if(this._currentLoading)return this.renderLoadingState();if(this._currentError||!t)return this.renderNoDataState(e);const l=m.isLive(t.status),d=l?e.in_progress_color||"#ff9800":"final"===t.status?n:e.scheduled_color||"var(--primary-text-color)",c=e.use_team_colors&&t.homeTeam.color?t.homeTeam.color:"inherit",g=e.use_team_colors&&t.awayTeam.color?t.awayTeam.color:"inherit";return a.qy`
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
          width: ${r};
          height: ${r};
          object-fit: contain;
          margin-bottom: 8px;
        }
        .sports-scorecard .team-name {
          font-size: ${s};
          font-weight: 600;
          margin-bottom: 4px;
        }
        .sports-scorecard .team-record {
          font-size: 12px;
          color: ${n};
        }
        .sports-scorecard .score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px;
        }
        .sports-scorecard .score {
          font-size: ${i};
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
          color: ${n};
        }
        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: ${e.in_progress_color||"#ff9800"};
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
            ${e.show_team_logos&&t.awayTeam.logo?a.qy`<img class="team-logo" src="${t.awayTeam.logo}" alt="${t.awayTeam.name}" />`:""}
            ${e.show_team_names?a.qy`<div class="team-name" style="color: ${g}">${t.awayTeam.abbreviation||t.awayTeam.name}</div>`:""}
            ${e.show_team_records&&t.awayTeam.record?a.qy`<div class="team-record">${t.awayTeam.record}</div>`:""}
          </div>

          <!-- Score -->
          <div class="score-container">
            ${e.show_score&&this._hasValidScore(t.awayTeam.score,t.homeTeam.score)?a.qy`<div class="score">${this._formatScore(t.awayTeam.score)} - ${this._formatScore(t.homeTeam.score)}</div>`:a.qy`<div class="score" style="font-size: 16px;">vs</div>`}
            ${e.show_status_detail?a.qy`
                  <div class="status" style="color: ${d}">
                    ${l?a.qy`<span class="live-indicator"><span class="live-dot"></span> ${m.getStatusText(t.status,t.statusDetail)}</span>`:m.getStatusText(t.status,t.statusDetail)}
                  </div>
                `:""}
          </div>

          <!-- Home Team -->
          <div class="team">
            ${e.show_team_logos&&t.homeTeam.logo?a.qy`<img class="team-logo" src="${t.homeTeam.logo}" alt="${t.homeTeam.name}" />`:""}
            ${e.show_team_names?a.qy`<div class="team-name" style="color: ${c}">${t.homeTeam.abbreviation||t.homeTeam.name}</div>`:""}
            ${e.show_team_records&&t.homeTeam.record?a.qy`<div class="team-record">${t.homeTeam.record}</div>`:""}
          </div>
        </div>

        ${e.show_game_time||e.show_venue||e.show_broadcast?a.qy`
              <div class="game-info">
                ${e.show_game_time&&t.gameTime?a.qy`<div>${m.formatGameTime(t.gameTime)}</div>`:""}
                ${e.show_venue&&t.venue?a.qy`<div>${t.venue}</div>`:""}
                ${e.show_broadcast&&t.broadcast?a.qy`<div>📺 ${t.broadcast}</div>`:""}
              </div>
            `:""}
      </div>
    `}renderUpcomingStyle(e,o){const t=this._currentGameData,r=e.logo_size||"48px",i=e.team_name_font_size||"16px",s=e.detail_font_size||"12px",n=e.text_color||"var(--secondary-text-color)";return this._currentLoading?this.renderLoadingState():this._currentError||!t?this.renderNoDataState(e):a.qy`
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
          width: ${r};
          height: ${r};
          object-fit: contain;
        }
        .sports-upcoming .vs {
          font-size: calc(${i} * 1.25);
          font-weight: 700;
          color: ${n};
        }
        .sports-upcoming .game-time {
          text-align: center;
          font-size: calc(${i} * 1.125);
          font-weight: 600;
          color: ${e.scheduled_color||"var(--primary-color)"};
          margin-bottom: 8px;
        }
        .sports-upcoming .details {
          text-align: center;
          font-size: ${s};
          color: ${n};
        }
        .sports-upcoming .team-name-abbr {
          font-size: ${i};
          font-weight: 600;
          color: ${n};
        }
      </style>

      <div class="sports-upcoming">
        <div class="matchup">
          ${e.show_team_logos&&t.awayTeam.logo?a.qy`<img class="team-logo" src="${t.awayTeam.logo}" alt="${t.awayTeam.name}" />`:e.show_team_names?a.qy`<span class="team-name-abbr">${t.awayTeam.abbreviation}</span>`:""}
          <span class="vs">@</span>
          ${e.show_team_logos&&t.homeTeam.logo?a.qy`<img class="team-logo" src="${t.homeTeam.logo}" alt="${t.homeTeam.name}" />`:e.show_team_names?a.qy`<span class="team-name-abbr">${t.homeTeam.abbreviation}</span>`:""}
        </div>

        ${e.show_game_time&&t.gameTime?a.qy`<div class="game-time">${m.formatGameTime(t.gameTime)}</div>`:""}

        <div class="details">
          ${e.show_team_names?a.qy`<div>${t.awayTeam.name} at ${t.homeTeam.name}</div>`:""}
          ${e.show_venue&&t.venue?a.qy`<div>${t.venue}</div>`:""}
          ${e.show_broadcast&&t.broadcast?a.qy`<div>📺 ${t.broadcast}</div>`:""}
        </div>
      </div>
    `}renderCompactStyle(e,o){const t=this._currentGameData,r=e.logo_size||"20px",i=e.score_font_size||"14px",s=e.team_name_font_size||"14px",n=e.text_color||"var(--secondary-text-color)";if(this._currentLoading)return a.qy`<div style="padding: 8px; text-align: center; font-size: 12px;">Loading...</div>`;if(this._currentError||!t)return a.qy`<div style="padding: 8px; text-align: center; font-size: 12px; color: ${n};">No game data</div>`;const l=m.isLive(t.status),d=l?e.in_progress_color||"#ff9800":n;return a.qy`
      <style>
        .sports-compact {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: ${s};
        }
        .sports-compact .team-logo {
          width: ${r};
          height: ${r};
          object-fit: contain;
        }
        .sports-compact .score {
          font-size: ${i};
          font-weight: 700;
        }
        .sports-compact .status {
          font-size: 10px;
          text-transform: uppercase;
        }
      </style>

      <div class="sports-compact">
        ${e.show_team_logos&&t.awayTeam.logo?a.qy`<img class="team-logo" src="${t.awayTeam.logo}" />`:a.qy`<span>${t.awayTeam.abbreviation}</span>`}
        
        ${e.show_score&&this._hasValidScore(t.awayTeam.score,t.homeTeam.score)?a.qy`<span class="score">${this._formatScore(t.awayTeam.score)} - ${this._formatScore(t.homeTeam.score)}</span>`:a.qy`<span>vs</span>`}
        
        ${e.show_team_logos&&t.homeTeam.logo?a.qy`<img class="team-logo" src="${t.homeTeam.logo}" />`:a.qy`<span>${t.homeTeam.abbreviation}</span>`}
        
        ${l?a.qy`<span class="status" style="color: ${d};">● LIVE</span>`:""}
      </div>
    `}renderDetailedStyle(e,o){var t,r;const i=this._currentGameData,s=e.logo_size||"56px",n=e.score_font_size||"36px",l=e.team_name_font_size||"15px",d=e.detail_font_size||"12px",g=e.text_color||"var(--secondary-text-color)";if(this._currentLoading)return this.renderLoadingState();if(this._currentError||!i)return this.renderNoDataState(e);const p=m.isLive(i.status),u="scheduled"===i.status,h="final"===i.status,_=this._hasValidScore(i.awayTeam.score,i.homeTeam.score);let v="var(--secondary-background-color)",y="var(--primary-text-color)",f="";if(p)v=e.in_progress_color||"#ff9800",y="white",f=`● ${i.statusDetail||"LIVE"}`;else if(h)v="var(--secondary-background-color)",y="var(--secondary-text-color)",f="FINAL";else if(u&&i.gameTime){const e=i.gameTime,o={month:"numeric",day:"numeric"},t={hour:"numeric",minute:"2-digit"};f=`${e.toLocaleDateString(void 0,o)} - ${e.toLocaleTimeString(void 0,t)}`}return a.qy`
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
          font-size: ${d};
          font-weight: 600;
          color: ${g};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sports-detailed .status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: ${d};
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
          width: ${s};
          height: ${s};
          object-fit: contain;
          margin-bottom: 8px;
        }
        .sports-detailed .team-name {
          font-size: ${l};
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 4px;
        }
        .sports-detailed .team-record {
          font-size: ${d};
          color: ${g};
        }
        .sports-detailed .score-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
        }
        .sports-detailed .score-display {
          font-size: ${n};
          font-weight: 700;
          letter-spacing: 2px;
        }
        .sports-detailed .score-vs {
          font-size: calc(${n} * 0.67);
          font-weight: 600;
          color: ${g};
        }
        .sports-detailed .live-indicator {
          font-size: ${d};
          font-weight: 600;
          color: ${e.in_progress_color||"#ff9800"};
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
          font-size: ${d};
        }
        .sports-detailed .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--primary-text-color);
        }
        .sports-detailed .info-item ha-icon {
          color: ${g};
          --mdi-icon-size: 16px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>

      <div class="sports-detailed">
        <div class="header">
          <span class="league-info">${c[i.league]||i.league.toUpperCase()}</span>
          ${f?a.qy`
            <span class="status-badge" style="background: ${v}; color: ${y};">
              ${f}
            </span>
          `:""}
        </div>

        <div class="matchup">
          <!-- Away Team -->
          <div class="team-block">
            ${e.show_team_logos&&i.awayTeam.logo?a.qy`<img class="team-logo" src="${i.awayTeam.logo}" alt="${i.awayTeam.name}" />`:""}
            ${e.show_team_names?a.qy`<div class="team-name">${i.awayTeam.name}</div>`:""}
            ${e.show_team_records&&i.awayTeam.record?a.qy`<div class="team-record">${i.awayTeam.record}</div>`:""}
          </div>

          <!-- Score / VS -->
          <div class="score-center">
            ${e.show_score&&_?a.qy`<div class="score-display">${this._formatScore(i.awayTeam.score)} - ${this._formatScore(i.homeTeam.score)}</div>`:a.qy`<div class="score-vs">VS</div>`}
            ${p&&i.clock?a.qy`<div class="live-indicator">● ${i.clock}</div>`:""}
          </div>

          <!-- Home Team -->
          <div class="team-block">
            ${e.show_team_logos&&i.homeTeam.logo?a.qy`<img class="team-logo" src="${i.homeTeam.logo}" alt="${i.homeTeam.name}" />`:""}
            ${e.show_team_names?a.qy`<div class="team-name">${i.homeTeam.name}</div>`:""}
            ${e.show_team_records&&i.homeTeam.record?a.qy`<div class="team-record">${i.homeTeam.record}</div>`:""}
          </div>
        </div>

        ${e.show_game_time&&i.gameTime&&!p&&!h||e.show_venue&&i.venue||e.show_broadcast&&i.broadcast||e.show_odds&&(null===(t=i.odds)||void 0===t?void 0:t.spread)?a.qy`
            <div class="game-info">
              ${e.show_game_time&&i.gameTime&&!p&&!h?a.qy`<div class="info-item"><ha-icon icon="mdi:calendar-clock"></ha-icon> ${m.formatGameTime(i.gameTime)}</div>`:""}
              ${e.show_venue&&i.venue?a.qy`<div class="info-item"><ha-icon icon="mdi:stadium"></ha-icon> ${i.venue}</div>`:""}
              ${e.show_broadcast&&i.broadcast?a.qy`<div class="info-item"><ha-icon icon="mdi:television"></ha-icon> ${i.broadcast}</div>`:""}
              ${e.show_odds&&(null===(r=i.odds)||void 0===r?void 0:r.spread)?a.qy`<div class="info-item"><ha-icon icon="mdi:chart-line"></ha-icon> ${i.odds.spread} ${i.odds.overUnder||""}</div>`:""}
            </div>
          `:""}
      </div>
    `}renderMiniStyle(e,o){const t=this._currentGameData,r=e.logo_size||"32px",i=e.score_font_size||"16px",s=e.text_color||"var(--secondary-text-color)";if(this._currentLoading)return a.qy`<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>`;if(this._currentError||!t)return a.qy`<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: ${s};">No data</div>`;const n=m.isLive(t.status);return a.qy`
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
          width: ${r};
          height: ${r};
          object-fit: contain;
        }
        .sports-mini .score {
          font-size: ${i};
          font-weight: 700;
        }
        .sports-mini .live-dot {
          width: 6px;
          height: 6px;
          background: ${e.in_progress_color||"#ff9800"};
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
          ${t.awayTeam.logo?a.qy`<img class="team-logo" src="${t.awayTeam.logo}" />`:a.qy`<span style="font-size: 10px;">${t.awayTeam.abbreviation}</span>`}
          ${t.homeTeam.logo?a.qy`<img class="team-logo" src="${t.homeTeam.logo}" />`:a.qy`<span style="font-size: 10px;">${t.homeTeam.abbreviation}</span>`}
        </div>
        ${e.show_score&&this._hasValidScore(t.awayTeam.score,t.homeTeam.score)?a.qy`<div class="score">${this._formatScore(t.awayTeam.score)}-${this._formatScore(t.homeTeam.score)}</div>`:a.qy`<div style="font-size: 10px;">${m.formatGameTime(t.gameTime)}</div>`}
        ${n?a.qy`<div class="live-dot"></div>`:""}
      </div>
    `}renderLogoBgStyle(e,o){const t=this._currentGameData,r=e.logo_size||"40px",i=e.score_font_size||"18px",s=e.team_name_font_size||"11px",n=e.text_color||"var(--secondary-text-color)",l=!1!==e.show_logo_background,d=e.logo_background_size||"80px",c=(e.logo_background_opacity||8)/100;if(this._currentLoading)return a.qy`<div style="height: 80px; display: flex; align-items: center; justify-content: center;"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>`;if(this._currentError||!t)return a.qy`
        <div style="height: 80px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--secondary-text-color);">
          ${e.team_id?"No game data":"Select a team"}
        </div>
      `;const g=m.isLive(t.status),p=this._hasValidScore(t.awayTeam.score,t.homeTeam.score),u=g?e.in_progress_color||"#ff9800":e.scheduled_color||"var(--primary-text-color)",h=e.use_team_colors&&t.homeTeam.color?t.homeTeam.color:"var(--primary-color)",_=e.use_team_colors&&t.awayTeam.color?t.awayTeam.color:"var(--primary-color)";return a.qy`
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
          width: ${d};
          height: ${d};
          object-fit: contain;
          opacity: ${c};
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
          width: ${r};
          height: ${r};
          object-fit: contain;
          margin-bottom: 4px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
        }
        .sports-logo-bg .team-abbr {
          font-size: ${s};
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
          font-size: ${i};
          font-weight: 800;
          letter-spacing: 1px;
          line-height: 1.1;
        }
        .sports-logo-bg .vs-display {
          font-size: calc(${i} * 0.7);
          font-weight: 600;
          color: ${n};
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
          color: ${n};
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
        ${l&&t.awayTeam.logo?a.qy`<img class="bg-logo bg-logo-away" src="${t.awayTeam.logo}" alt="" />`:""}
        ${l&&t.homeTeam.logo?a.qy`<img class="bg-logo bg-logo-home" src="${t.homeTeam.logo}" alt="" />`:""}

        <!-- Away Team -->
        <div class="team-side">
          ${e.show_team_logos&&t.awayTeam.logo?a.qy`<img class="team-logo" src="${t.awayTeam.logo}" alt="${t.awayTeam.name}" />`:""}
          ${e.show_team_names?a.qy`<div class="team-abbr" style="color: ${e.use_team_colors&&_?_:"inherit"}">${t.awayTeam.abbreviation||t.awayTeam.name.substring(0,3).toUpperCase()}</div>`:""}
        </div>

        <!-- Center: Score or VS + Status -->
        <div class="center-content">
          ${e.show_score&&p?a.qy`<div class="score-display">${this._formatScore(t.awayTeam.score)} - ${this._formatScore(t.homeTeam.score)}</div>`:a.qy`<div class="vs-display">VS</div>`}
          
          ${e.show_status_detail?g?a.qy`
                  <div class="status-line" style="color: ${u}">
                    <span class="live-indicator">
                      <span class="live-dot" style="background: ${u}"></span>
                      ${t.statusDetail||"LIVE"}
                    </span>
                  </div>
                `:"final"===t.status?a.qy`<div class="status-line" style="color: var(--secondary-text-color)">FINAL</div>`:e.show_game_time&&t.gameTime?a.qy`<div class="game-time-line">${m.formatGameTime(t.gameTime)}</div>`:"":e.show_game_time&&t.gameTime&&"scheduled"===t.status?a.qy`<div class="game-time-line">${m.formatGameTime(t.gameTime)}</div>`:""}
        </div>

        <!-- Home Team -->
        <div class="team-side">
          ${e.show_team_logos&&t.homeTeam.logo?a.qy`<img class="team-logo" src="${t.homeTeam.logo}" alt="${t.homeTeam.name}" />`:""}
          ${e.show_team_names?a.qy`<div class="team-abbr" style="color: ${e.use_team_colors&&h?h:"inherit"}">${t.homeTeam.abbreviation||t.homeTeam.name.substring(0,3).toUpperCase()}</div>`:""}
        </div>
      </div>
    `}renderLoadingState(){return a.qy`
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
    `}renderNoDataState(e){const o="ha_sensor"!==e.data_source||e.sensor_entity?"espn_api"!==e.data_source||e.team_id?this._currentError||"No game data available":"Select a team":"Select a sensor entity";return a.qy`
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
        <div style="font-size: 14px; color: var(--secondary-text-color);">${o}</div>
      </div>
    `}_hasValidScore(e,o){const t=e=>null!=e&&!isNaN(e);return t(e)||t(o)}_formatScore(e,o="0"){return null==e||isNaN(e)?o:String(e)}addPixelUnit(e){if(!e&&0!==e)return;const o=String(e);return"auto"===o||"none"===o||"inherit"===o||"initial"===o||"unset"===o?o:/^\d+$/.test(o)?`${o}px`:(/[a-zA-Z%]/.test(o),o)}validate(e){const o=e,t=[...super.validate(e).errors];return"ha_sensor"!==o.data_source||o.sensor_entity||t.push("Sensor entity is required when using HA sensor mode"),"espn_api"===o.data_source&&(o.league||t.push("League is required when using ESPN API mode"),o.team_id||t.push("Team is required when using ESPN API mode")),{valid:0===t.length,errors:t}}getStyles(){return`\n      ${r.m.getSliderStyles()}\n      .sports-module-container {\n        width: 100%;\n      }\n    `}}}}]);