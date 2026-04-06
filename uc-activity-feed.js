"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[7517],{9088:(e,t,i)=>{i.r(t),i.d(t,{UltraActivityFeedModule:()=>l});var a=i(5183),n=i(7475),o=i(766),r=i(5147),s=i(8938);i(7921);class l extends n.m{constructor(){super(...arguments),this.metadata={type:"activity_feed",title:"Activity Feed",description:"Real-time home activity feed with timeline and social views",author:"WJD Designs",version:"1.0.0",icon:"mdi:timeline-text",category:"data",tags:["activity","feed","timeline","history","events","pro","premium"]},this._expandedEntities=new Set}createDefault(e){return{id:e||this.generateId("activity_feed"),type:"activity_feed",entities:[],enable_auto_filter:!0,include_domains:["light","switch","binary_sensor","lock","cover"],exclude_domains:[],exclude_patterns:[],view_mode:"feed",title:"Activity Feed",show_title:!0,max_items:25,show_entity_icon:!0,show_relative_time:!0,show_absolute_time:!1,show_state_change:!0,group_by_time:!0,timeline_line_color:"var(--primary-color)",timeline_dot_color:"var(--primary-color)",timeline_dot_size:12,feed_card_style:"elevated",show_avatar:!0,avatar_style:"circle",sort_direction:"newest_first",accent_color:"",text_color:"",secondary_text_color:"",card_background_color:"",tap_action:{action:"more-info"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(e){const t=e,i=[...super.validate(e).errors];return t.enable_auto_filter||t.entities&&0!==t.entities.length||i.push("At least one entity must be configured, or auto-filter must be enabled"),{valid:0===i.length,errors:i}}renderActionsTab(e,t,i,a){return r.A.render(e,t,(e=>a(e)))}renderOtherTab(e,t,i,a){return s.X.render(e,t,(e=>a(e)))}renderGeneralTab(e,t,i,n){const r=e;return a.qy`
      ${this.injectUcFormStyles()}
      <style>
        .settings-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--primary-color);
          letter-spacing: 0.5px;
        }
        .view-mode-switcher {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .view-mode-btn {
          flex: 1;
          padding: 16px 12px;
          border: 2px solid var(--divider-color);
          border-radius: 12px;
          background: var(--card-background-color);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
        }
        .view-mode-btn:hover {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.05);
        }
        .view-mode-btn.active {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
        }
        .view-mode-btn ha-icon {
          display: block;
          margin: 0 auto 8px;
          color: var(--primary-color);
          --mdc-icon-size: 28px;
        }
        .view-mode-btn .mode-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .view-mode-btn .mode-desc {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        .domain-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
          min-height: 32px;
        }
        .domain-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-radius: 16px;
          font-size: 13px;
          transition: all 0.2s ease;
          position: relative;
        }
        .domain-chip.exclude {
          background: var(--error-color);
        }
        .domain-chip:hover {
          opacity: 0.9;
          padding-right: 32px;
        }
        .domain-chip .chip-remove {
          cursor: pointer;
          font-size: 16px;
          opacity: 0;
          position: absolute;
          right: 8px;
          transition: opacity 0.2s ease;
        }
        .domain-chip:hover .chip-remove {
          opacity: 1;
        }
        .domain-input-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .domain-input {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }
        .add-btn {
          padding: 8px 16px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .add-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .add-btn.full-width {
          width: 100%;
          justify-content: center;
          padding: 12px;
        }
        .entity-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid var(--divider-color);
          transition: all 0.2s ease;
        }
        .entity-row:hover {
          background: var(--primary-color);
          opacity: 0.9;
        }
        .entity-info {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity-info.empty {
          color: var(--secondary-text-color);
          font-style: italic;
        }
        .expand-icon {
          cursor: pointer;
          color: var(--primary-color);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .expand-icon.expanded {
          transform: rotate(180deg);
        }
        .delete-icon {
          cursor: pointer;
          color: var(--error-color);
          flex-shrink: 0;
        }
        .entity-settings {
          padding: 16px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          border-radius: 0 8px 8px 0;
          margin-bottom: 8px;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div class="module-settings">
        <!-- View Mode -->
        <div class="settings-section">
          <div class="section-title">VIEW MODE</div>
          <div class="view-mode-switcher">
            <div
              class="view-mode-btn ${"timeline"===r.view_mode?"active":""}"
              @click=${()=>n({view_mode:"timeline"})}
            >
              <ha-icon icon="mdi:timeline"></ha-icon>
              <div class="mode-title">Timeline</div>
              <div class="mode-desc">Vertical timeline with dots and lines</div>
            </div>
            <div
              class="view-mode-btn ${"feed"===r.view_mode?"active":""}"
              @click=${()=>n({view_mode:"feed"})}
            >
              <ha-icon icon="mdi:card-text-outline"></ha-icon>
              <div class="mode-title">Social Feed</div>
              <div class="mode-desc">Card-based like a social media feed</div>
            </div>
          </div>
        </div>

        <!-- Title & Display -->
        <div class="settings-section">
          <div class="section-title">DISPLAY</div>
          ${o.U.renderFieldSection("Title","Title to display at the top of the feed.",t,{title:r.title||"Activity Feed"},[o.U.text("title")],(e=>n({title:e.detail.value.title})))}
          ${this.renderSettingsSection("","",[{title:"Show Title",description:"Display the title at the top.",hass:t,data:{show_title:r.show_title},schema:[this.booleanField("show_title")],onChange:e=>n({show_title:e.detail.value.show_title})},{title:"Show Entity Icon",description:"Display icons for each event.",hass:t,data:{show_entity_icon:r.show_entity_icon},schema:[this.booleanField("show_entity_icon")],onChange:e=>n({show_entity_icon:e.detail.value.show_entity_icon})},{title:"Show Relative Time",description:'Show "2 minutes ago" style timestamps.',hass:t,data:{show_relative_time:r.show_relative_time},schema:[this.booleanField("show_relative_time")],onChange:e=>n({show_relative_time:e.detail.value.show_relative_time})},{title:"Show Absolute Time",description:"Show exact time (e.g. 3:45 PM).",hass:t,data:{show_absolute_time:r.show_absolute_time},schema:[this.booleanField("show_absolute_time")],onChange:e=>n({show_absolute_time:e.detail.value.show_absolute_time})},{title:"Show State Change",description:'Show "off → on" state transitions.',hass:t,data:{show_state_change:r.show_state_change},schema:[this.booleanField("show_state_change")],onChange:e=>n({show_state_change:e.detail.value.show_state_change})},{title:"Group by Time",description:"Group events by today, yesterday, etc.",hass:t,data:{group_by_time:r.group_by_time},schema:[this.booleanField("group_by_time")],onChange:e=>n({group_by_time:e.detail.value.group_by_time})}])}
          ${this.renderSliderField("Max Items","Maximum number of events to show.",r.max_items||25,25,5,100,1,(e=>n({max_items:e})),"")}
          ${this.renderFieldSection("Sort Direction","Order of events in the feed.",t,{sort_direction:r.sort_direction||"newest_first"},[this.selectField("sort_direction",[{value:"newest_first",label:"Newest First"},{value:"oldest_first",label:"Oldest First"}])],(e=>n({sort_direction:e.detail.value.sort_direction})))}
        </div>

        <!-- View-specific settings -->
        ${"timeline"===r.view_mode?this._renderTimelineSettings(r,t,n):this._renderFeedSettings(r,t,n)}

        <!-- Entity Source -->
        <div class="settings-section">
          <div class="section-title">ENTITY SOURCE</div>
          ${this.renderSettingsSection("","",[{title:"Auto Filter by Domain",description:"Automatically include entities based on domain filters.",hass:t,data:{enable_auto_filter:r.enable_auto_filter},schema:[this.booleanField("enable_auto_filter")],onChange:e=>n({enable_auto_filter:e.detail.value.enable_auto_filter})}])}
          ${r.enable_auto_filter?this._renderDomainFilters(r,n):""}

          <div style="margin-top: 16px; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
            Manual Entities
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
            Add specific entities to always include in the feed.
          </div>
          ${(r.entities||[]).map(((e,i)=>this._renderEntityRow(e,i,r,t,n)))}
          <button
            class="add-btn full-width"
            @click=${()=>{const e=[...r.entities||[]],t={id:this.generateId("af_entity"),entity:""};e.push(t),n({entities:e}),this._expandedEntities.add(t.id)}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </button>
        </div>

        <!-- Colors -->
        <div class="settings-section">
          <div class="section-title">COLORS</div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${"Accent Color"}
              .value=${r.accent_color||""}
              .defaultValue=${"var(--primary-color)"}
              .hass=${t}
              @value-changed=${e=>n({accent_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${"Text Color"}
              .value=${r.text_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${t}
              @value-changed=${e=>n({text_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${"Secondary Text Color"}
              .value=${r.secondary_text_color||""}
              .defaultValue=${"var(--secondary-text-color)"}
              .hass=${t}
              @value-changed=${e=>n({secondary_text_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${"Card Background (Feed mode)"}
              .value=${r.card_background_color||""}
              .defaultValue=${"var(--card-background-color)"}
              .hass=${t}
              @value-changed=${e=>n({card_background_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}_renderTimelineSettings(e,t,i){return a.qy`
      <div class="settings-section">
        <div class="section-title">TIMELINE SETTINGS</div>
        <div style="margin-bottom: 16px;">
          <ultra-color-picker
            .label=${"Line Color"}
            .value=${e.timeline_line_color||""}
            .defaultValue=${"var(--primary-color)"}
            .hass=${t}
            @value-changed=${e=>i({timeline_line_color:e.detail.value})}
          ></ultra-color-picker>
        </div>
        <div style="margin-bottom: 16px;">
          <ultra-color-picker
            .label=${"Dot Color"}
            .value=${e.timeline_dot_color||""}
            .defaultValue=${"var(--primary-color)"}
            .hass=${t}
            @value-changed=${e=>i({timeline_dot_color:e.detail.value})}
          ></ultra-color-picker>
        </div>
        ${this.renderSliderField("Dot Size","Size of the timeline dots in pixels.",e.timeline_dot_size||12,12,6,24,1,(e=>i({timeline_dot_size:e})),"px")}
      </div>
    `}_renderFeedSettings(e,t,i){return a.qy`
      <div class="settings-section">
        <div class="section-title">FEED SETTINGS</div>
        ${this.renderFieldSection("Card Style","Visual style for each feed card.",t,{feed_card_style:e.feed_card_style||"elevated"},[this.selectField("feed_card_style",[{value:"flat",label:"Flat"},{value:"elevated",label:"Elevated (Shadow)"},{value:"outlined",label:"Outlined (Border)"}])],(e=>i({feed_card_style:e.detail.value.feed_card_style})))}
        ${this.renderSettingsSection("","",[{title:"Show Avatar",description:"Show entity icon as an avatar on each card.",hass:t,data:{show_avatar:e.show_avatar},schema:[this.booleanField("show_avatar")],onChange:e=>i({show_avatar:e.detail.value.show_avatar})}])}
        ${e.show_avatar?this.renderFieldSection("Avatar Style","Shape of the avatar.",t,{avatar_style:e.avatar_style||"circle"},[this.selectField("avatar_style",[{value:"circle",label:"Circle"},{value:"rounded",label:"Rounded Square"},{value:"square",label:"Square"}])],(e=>i({avatar_style:e.detail.value.avatar_style}))):""}
      </div>
    `}_renderDomainFilters(e,t){return a.qy`
      <div style="margin-top: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          Include Domains
        </div>
        <div
          style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
        >
          Only show events from these domains. Common: light, switch, binary_sensor,
          lock, cover, climate, fan, media_player
        </div>
        <div class="domain-chips">
          ${(e.include_domains||[]).map((i=>a.qy`
              <span class="domain-chip">
                ${i}
                <ha-icon
                  icon="mdi:close"
                  class="chip-remove"
                  @click=${()=>{const a=(e.include_domains||[]).filter((e=>e!==i));t({include_domains:a})}}
                ></ha-icon>
              </span>
            `))}
        </div>
        <div class="domain-input-row">
          <input
            type="text"
            class="domain-input"
            placeholder="e.g., light, sensor, person"
            @keydown=${i=>{if("Enter"===i.key){const a=i.target,n=a.value.trim().toLowerCase();n&&!(e.include_domains||[]).includes(n)&&(t({include_domains:[...e.include_domains||[],n]}),a.value="")}}}
          />
          <button
            class="add-btn"
            @click=${i=>{const a=i.target.closest(".domain-input-row"),n=null==a?void 0:a.querySelector("input"),o=null==n?void 0:n.value.trim().toLowerCase();o&&!(e.include_domains||[]).includes(o)&&(t({include_domains:[...e.include_domains||[],o]}),n.value="")}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>

        <div style="margin-top: 24px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
            Exclude Domains
          </div>
          <div
            style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
          >
            Hide events from these domains.
          </div>
          <div class="domain-chips">
            ${(e.exclude_domains||[]).map((i=>a.qy`
                <span class="domain-chip exclude">
                  ${i}
                  <ha-icon
                    icon="mdi:close"
                    class="chip-remove"
                    @click=${()=>{const a=(e.exclude_domains||[]).filter((e=>e!==i));t({exclude_domains:a})}}
                  ></ha-icon>
                </span>
              `))}
          </div>
          <div class="domain-input-row">
            <input
              type="text"
              class="domain-input"
              placeholder="e.g., automation, update"
              @keydown=${i=>{if("Enter"===i.key){const a=i.target,n=a.value.trim().toLowerCase();n&&!(e.exclude_domains||[]).includes(n)&&(t({exclude_domains:[...e.exclude_domains||[],n]}),a.value="")}}}
            />
            <button
              class="add-btn"
              @click=${i=>{const a=i.target.closest(".domain-input-row"),n=null==a?void 0:a.querySelector("input"),o=null==n?void 0:n.value.trim().toLowerCase();o&&!(e.exclude_domains||[]).includes(o)&&(t({exclude_domains:[...e.exclude_domains||[],o]}),n.value="")}}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `}_renderEntityRow(e,t,i,n,r){const s=this._expandedEntities.has(e.id);return a.qy`
      <div class="entity-row">
        <div class="entity-info ${e.entity?"":"empty"}">
          ${e.entity||"No entity selected"}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${s?"expanded":""}"
          @click=${()=>{this._expandedEntities.has(e.id)?this._expandedEntities.delete(e.id):this._expandedEntities.add(e.id),window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${()=>{const a=[...i.entities||[]];a.splice(t,1),this._expandedEntities.delete(e.id),r({entities:a})}}
        ></ha-icon>
      </div>
      ${s?a.qy`
            <div class="entity-settings">
              ${o.U.renderFieldSection("Entity","The entity to track.",n,{entity:e.entity||""},[o.U.entity("entity")],(e=>{const a=[...i.entities||[]];a[t]=Object.assign(Object.assign({},a[t]),{entity:e.detail.value.entity}),r({entities:a})}))}
              ${o.U.renderFieldSection("Label Override","Custom name to display instead of entity name.",n,{label:e.label||""},[o.U.text("label")],(e=>{const a=[...i.entities||[]];a[t]=Object.assign(Object.assign({},a[t]),{label:e.detail.value.label}),r({entities:a})}))}
              ${o.U.renderFieldSection("Icon Override","Custom icon to display.",n,{icon:e.icon||""},[o.U.icon("icon")],(e=>{const a=[...i.entities||[]];a[t]=Object.assign(Object.assign({},a[t]),{icon:e.detail.value.icon}),r({entities:a})}))}
            </div>
          `:""}
    `}renderPreview(e,t,i){const n=e;if(!t||!t.states)return this.renderGradientErrorState("Waiting for Home Assistant","Connecting to entity states...","mdi:loading");const o=this._buildEvents(n,t);if(0===o.length)return this.renderGradientErrorState("No Activity","Configure entities or domains in the General tab","mdi:timeline-text");const r=n.accent_color||"var(--primary-color)",s=n.text_color||"var(--primary-text-color)",l=n.secondary_text_color||"var(--secondary-text-color)",d="timeline"===n.view_mode?this._renderTimeline(o,n,r,s,l):this._renderFeed(o,n,r,s,l);return a.qy`
      <style>
        ${this._getPreviewStyles(n)}
      </style>
      <div class="af-container">
        ${n.show_title?a.qy`<div class="af-title" style="color: ${s};">
              ${n.title||"Activity Feed"}
            </div>`:a.s6}
        ${d}
      </div>
    `}_buildEvents(e,t){const i=new Set;for(const a of e.entities||[])a.entity&&t.states[a.entity]&&i.add(a.entity);if(e.enable_auto_filter){const a=e.include_domains||[],n=e.exclude_domains||[],o=e.exclude_patterns||[];for(const e of Object.keys(t.states)){const t=e.split(".")[0];a.length>0&&!a.includes(t)||n.includes(t)||o.some((t=>e.toLowerCase().includes(t.toLowerCase())))||i.add(e)}}const a=[],n=new Map;for(const t of e.entities||[])t.entity&&n.set(t.entity,t);for(const e of i){const i=t.states[e];if(!i)continue;const o=n.get(e),r=e.split(".")[0],s=new Date(i.last_changed);a.push({entityId:e,entityName:(null==o?void 0:o.label)||i.attributes.friendly_name||e,icon:(null==o?void 0:o.icon)||i.attributes.icon||this._domainIcon(r),color:(null==o?void 0:o.color)||this._domainColor(r),domain:r,newState:i.state,oldState:void 0,timestamp:s,relativeTime:this._relativeTime(s),absoluteTime:this._absoluteTime(s),dateLabel:this._dateLabel(s)})}a.sort(((t,i)=>"oldest_first"===e.sort_direction?t.timestamp.getTime()-i.timestamp.getTime():i.timestamp.getTime()-t.timestamp.getTime()));const o=e.max_items||25;return a.slice(0,o)}_renderTimeline(e,t,i,n,o){const r=t.timeline_line_color||i,s=t.timeline_dot_color||i,l=t.timeline_dot_size||12,d=t.group_by_time?this._groupByDate(e):null;return d?a.qy`
        <div class="af-timeline" style="--tl-line: ${r}; --tl-dot: ${s}; --tl-dot-size: ${l}px;">
          ${d.map((e=>a.qy`
              <div class="af-tl-group-label" style="color: ${i};">
                ${e.label}
              </div>
              ${e.events.map((e=>this._renderTimelineItem(e,t,n,o)))}
            `))}
        </div>
      `:a.qy`
      <div class="af-timeline" style="--tl-line: ${r}; --tl-dot: ${s}; --tl-dot-size: ${l}px;">
        ${e.map((e=>this._renderTimelineItem(e,t,n,o)))}
      </div>
    `}_renderTimelineItem(e,t,i,n){return a.qy`
      <div class="af-tl-item">
        <div class="af-tl-dot-wrap">
          <div class="af-tl-dot" style="background: ${e.color};"></div>
        </div>
        <div class="af-tl-content">
          <div class="af-tl-header">
            ${t.show_entity_icon?a.qy`<ha-icon icon="${e.icon}" style="color: ${e.color}; --mdc-icon-size: 18px;"></ha-icon>`:a.s6}
            <span class="af-tl-name" style="color: ${i};">${e.entityName}</span>
          </div>
          <div class="af-tl-detail" style="color: ${n};">
            ${t.show_state_change?a.qy`<span class="af-tl-state">${this._formatState(e.newState)}</span>`:a.s6}
            ${t.show_relative_time?a.qy`<span class="af-tl-time">${e.relativeTime}</span>`:a.s6}
            ${t.show_absolute_time?a.qy`<span class="af-tl-time">${e.absoluteTime}</span>`:a.s6}
          </div>
        </div>
      </div>
    `}_renderFeed(e,t,i,n,o){const r=t.card_background_color||"var(--card-background-color)",s=t.feed_card_style||"elevated",l=t.group_by_time?this._groupByDate(e):null;return l?a.qy`
        <div class="af-feed">
          ${l.map((e=>a.qy`
              <div class="af-feed-group-label" style="color: ${i};">
                <span>${e.label}</span>
                <span class="af-feed-group-count">${e.events.length}</span>
              </div>
              ${e.events.map((e=>this._renderFeedCard(e,t,r,s,i,n,o)))}
            `))}
        </div>
      `:a.qy`
      <div class="af-feed">
        ${e.map((e=>this._renderFeedCard(e,t,r,s,i,n,o)))}
      </div>
    `}_renderFeedCard(e,t,i,n,o,r,s){const l="circle"===t.avatar_style?"50%":"rounded"===t.avatar_style?"8px":"2px";return a.qy`
      <div class="af-feed-card af-feed-card--${n}" style="background: ${i};">
        <div class="af-feed-card-body">
          ${t.show_avatar?a.qy`
                <div
                  class="af-feed-avatar"
                  style="background: ${e.color}20; border-radius: ${l};"
                >
                  <ha-icon
                    icon="${e.icon}"
                    style="color: ${e.color}; --mdc-icon-size: 20px;"
                  ></ha-icon>
                </div>
              `:a.s6}
          <div class="af-feed-card-text">
            <div class="af-feed-card-header">
              <span class="af-feed-card-name" style="color: ${r};">
                ${e.entityName}
              </span>
              <span class="af-feed-card-time" style="color: ${s};">
                ${t.show_relative_time?e.relativeTime:""}
                ${t.show_absolute_time?e.absoluteTime:""}
              </span>
            </div>
            <div class="af-feed-card-desc" style="color: ${s};">
              ${t.show_state_change?a.qy`
                    <span class="af-feed-state-badge" style="background: ${e.color}18; color: ${e.color};">
                      ${this._formatState(e.newState)}
                    </span>
                  `:a.s6}
              <span>${this._eventDescription(e)}</span>
            </div>
          </div>
        </div>
      </div>
    `}_groupByDate(e){const t=new Map;for(const i of e){const e=i.dateLabel;t.has(e)||t.set(e,[]),t.get(e).push(i)}return Array.from(t.entries()).map((([e,t])=>({label:e,events:t})))}_relativeTime(e){const t=Math.floor((Date.now()-e.getTime())/1e3);if(t<5)return"just now";if(t<60)return`${t}s ago`;const i=Math.floor(t/60);if(i<60)return`${i}m ago`;const a=Math.floor(i/60);return a<24?`${a}h ago`:`${Math.floor(a/24)}d ago`}_absoluteTime(e){const t=e.getHours();return`${t%12||12}:${e.getMinutes().toString().padStart(2,"0")} ${t>=12?"PM":"AM"}`}_dateLabel(e){const t=new Date,i=new Date(t.getFullYear(),t.getMonth(),t.getDate()),a=new Date(e.getFullYear(),e.getMonth(),e.getDate()),n=Math.floor((i.getTime()-a.getTime())/864e5);return 0===n?"Today":1===n?"Yesterday":n<7?e.toLocaleDateString(void 0,{weekday:"long"}):e.toLocaleDateString(void 0,{month:"short",day:"numeric"})}_formatState(e){return e.charAt(0).toUpperCase()+e.slice(1).replace(/_/g," ")}_eventDescription(e){const t={light:e=>"on"===e?"turned on":"off"===e?"turned off":`changed to ${e}`,switch:e=>"on"===e?"turned on":"off"===e?"turned off":`changed to ${e}`,binary_sensor:e=>"on"===e?"detected":"off"===e?"cleared":`changed to ${e}`,lock:e=>"locked"===e?"was locked":"unlocked"===e?"was unlocked":`changed to ${e}`,cover:e=>"open"===e?"was opened":"closed"===e?"was closed":`changed to ${e}`,climate:e=>`set to ${e}`,fan:e=>"on"===e?"turned on":"off"===e?"turned off":`changed to ${e}`,media_player:e=>"playing"===e?"started playing":"paused"===e?"was paused":"idle"===e?"went idle":`changed to ${e}`,person:e=>`is ${e}`,device_tracker:e=>`is ${e}`}[e.domain];return t?t(e.newState):`changed to ${e.newState}`}_domainIcon(e){return{light:"mdi:lightbulb",switch:"mdi:light-switch",binary_sensor:"mdi:radiobox-marked",sensor:"mdi:eye",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",media_player:"mdi:cast",person:"mdi:account",device_tracker:"mdi:map-marker",automation:"mdi:robot",scene:"mdi:palette",script:"mdi:script-text",input_boolean:"mdi:toggle-switch",input_number:"mdi:ray-vertex",input_select:"mdi:form-dropdown",camera:"mdi:camera",vacuum:"mdi:robot-vacuum",alarm_control_panel:"mdi:shield-home"}[e]||"mdi:help-circle-outline"}_domainColor(e){return{light:"#FFB300",switch:"#43A047",binary_sensor:"#1E88E5",sensor:"#8E24AA",climate:"#E53935",cover:"#6D4C41",fan:"#00ACC1",lock:"#F4511E",media_player:"#7B1FA2",person:"#3949AB",device_tracker:"#00897B",automation:"#546E7A",scene:"#D81B60",camera:"#5E35B1",vacuum:"#00BFA5",alarm_control_panel:"#FF6F00"}[e]||"var(--primary-color)"}_getPreviewStyles(e){return"\n      .af-container {\n        width: 100%;\n        box-sizing: border-box;\n        padding: 8px;\n        font-family: inherit;\n      }\n\n      .af-title {\n        font-size: 18px;\n        font-weight: 700;\n        margin-bottom: 16px;\n        text-align: center;\n      }\n\n      /* ====== TIMELINE VIEW ====== */\n\n      .af-timeline {\n        position: relative;\n        padding-left: 28px;\n      }\n\n      .af-timeline::before {\n        content: '';\n        position: absolute;\n        left: calc(var(--tl-dot-size) / 2 - 1px);\n        top: 4px;\n        bottom: 4px;\n        width: 2px;\n        background: var(--tl-line);\n        opacity: 0.3;\n        border-radius: 1px;\n      }\n\n      .af-tl-group-label {\n        font-size: 12px;\n        font-weight: 700;\n        text-transform: uppercase;\n        letter-spacing: 0.8px;\n        padding: 12px 0 8px;\n        margin-left: -28px;\n        padding-left: 28px;\n      }\n\n      .af-tl-item {\n        position: relative;\n        display: flex;\n        gap: 12px;\n        padding: 8px 0;\n        align-items: flex-start;\n      }\n\n      .af-tl-dot-wrap {\n        position: absolute;\n        left: -28px;\n        top: 12px;\n        width: var(--tl-dot-size);\n        height: var(--tl-dot-size);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      .af-tl-dot {\n        width: var(--tl-dot-size);\n        height: var(--tl-dot-size);\n        border-radius: 50%;\n        box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color), 0.15);\n        transition: transform 0.2s ease;\n      }\n\n      .af-tl-item:hover .af-tl-dot {\n        transform: scale(1.3);\n      }\n\n      .af-tl-content {\n        flex: 1;\n        min-width: 0;\n      }\n\n      .af-tl-header {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .af-tl-name {\n        font-size: 14px;\n        font-weight: 600;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n\n      .af-tl-detail {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        margin-top: 2px;\n        font-size: 12px;\n      }\n\n      .af-tl-state {\n        font-weight: 500;\n      }\n\n      .af-tl-time {\n        opacity: 0.7;\n      }\n\n      .af-tl-time::before {\n        content: '·';\n        margin-right: 8px;\n      }\n\n      /* ====== SOCIAL FEED VIEW ====== */\n\n      .af-feed {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n      }\n\n      .af-feed-group-label {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 12px;\n        font-weight: 700;\n        text-transform: uppercase;\n        letter-spacing: 0.8px;\n        padding: 12px 0 4px;\n      }\n\n      .af-feed-group-count {\n        font-size: 10px;\n        font-weight: 600;\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 2px 8px;\n        border-radius: 10px;\n      }\n\n      .af-feed-card {\n        border-radius: 12px;\n        transition: transform 0.15s ease, box-shadow 0.15s ease;\n        overflow: hidden;\n      }\n\n      .af-feed-card:hover {\n        transform: translateY(-1px);\n      }\n\n      .af-feed-card--flat {\n        background: transparent;\n      }\n\n      .af-feed-card--elevated {\n        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);\n      }\n\n      .af-feed-card--elevated:hover {\n        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);\n      }\n\n      .af-feed-card--outlined {\n        border: 1px solid var(--divider-color);\n      }\n\n      .af-feed-card-body {\n        display: flex;\n        gap: 12px;\n        padding: 12px;\n        align-items: center;\n      }\n\n      .af-feed-avatar {\n        flex-shrink: 0;\n        width: 40px;\n        height: 40px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      .af-feed-card-text {\n        flex: 1;\n        min-width: 0;\n      }\n\n      .af-feed-card-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .af-feed-card-name {\n        font-size: 14px;\n        font-weight: 600;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n\n      .af-feed-card-time {\n        font-size: 11px;\n        flex-shrink: 0;\n        opacity: 0.7;\n      }\n\n      .af-feed-card-desc {\n        font-size: 13px;\n        margin-top: 3px;\n        display: flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      .af-feed-state-badge {\n        display: inline-block;\n        font-size: 11px;\n        font-weight: 600;\n        padding: 2px 8px;\n        border-radius: 6px;\n        flex-shrink: 0;\n      }\n    "}getStyles(){return`${n.m.getSliderStyles()}`}}}}]);