"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[646],{9364:(t,e,o)=>{o.r(e),o.d(e,{UltraStatusSummaryModule:()=>h});var i=o(5183),a=o(9811),s=o(7475),r=o(766),l=o(5147),n=o(8938);class d{constructor(t){this.hass=t,this._colorSubscriptions=new Map,this._colorResults=new Map,this._colorEvaluationCache=new Map,this.CACHE_TTL=1e3}getColorResult(t){const e=this._colorEvaluationCache.get(t);return e&&Date.now()-e.timestamp<this.CACHE_TTL?e.value:this._colorResults.get(t)}hasColorSubscription(t){return this._colorSubscriptions.has(t)}getAllColorResults(){return this._colorResults}async subscribeToColorTemplate(t,e,o){if(t&&this.hass&&!this._colorSubscriptions.has(e))try{const i=new Promise(((i,a)=>{i(this.hass.connection.subscribeMessage((t=>{const i=t.result;this.hass.__uvc_dynamic_colors||(this.hass.__uvc_dynamic_colors={}),this.hass.__uvc_dynamic_colors[e]=i;const a=this.parseColorResult(i);a!==this._colorResults.get(e)&&o&&o(),this._colorResults.set(e,a),this._colorEvaluationCache.set(e,{value:a,timestamp:Date.now()})}),{type:"render_template",template:t}))}));this._colorSubscriptions.set(e,i)}catch(e){console.error(`[UltraVehicleCard] Failed to subscribe to color template: ${t}`,e)}}parseColorResult(t){if(null==t)return"var(--primary-color)";if("string"==typeof t){const e=t.trim();return this.isValidColor(e)?e:(console.warn(`[UltraVehicleCard] Color template evaluated to invalid color '${e}', using default.`),"var(--primary-color)")}return console.warn(`[UltraVehicleCard] Color template evaluated to non-string type '${typeof t}', using default.`),"var(--primary-color)"}isValidColor(t){return t.toLowerCase().includes("gradient")?/^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\(.*\)$/i.test(t.trim()):[/^#[0-9A-Fa-f]{3,8}$/,/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i,/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i,/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i,/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/i,/^var\(--[\w-]+\)$/i,/^(red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey|transparent)$/i].some((e=>e.test(t)))}async unsubscribeAllColorTemplates(){for(const[t,e]of this._colorSubscriptions.entries())try{if(e){const t=await Promise.resolve(e).catch((t=>null));if(t&&"function"==typeof t)try{await t()}catch(t){}}}catch(t){}this._colorSubscriptions.clear(),this._colorResults.clear(),this._colorEvaluationCache.clear()}updateHass(t){this.hass=t,this._colorEvaluationCache.clear()}}var c=o(5155),m=o(6478);function u(t){const e=t;return e.__ucDynamicColorService?e.__ucDynamicColorService.updateHass(t):e.__ucDynamicColorService=new d(t),e.__ucDynamicColorService}function _(){"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update",{detail:{moduleType:"status_summary"}}))}o(7921);class h extends s.m{constructor(){super(...arguments),this.metadata={type:"status_summary",title:"Status Summary",description:"Display entity activity with timestamps and customizable color coding",author:"WJD Designs",version:"1.0.0",icon:"mdi:format-list-bulleted-square",category:"data",tags:["status","activity","monitor","summary","entities","tracking"]},this._expandedEntities=new Set,this._draggedItem=null}createDefault(t,e){const o={id:this.generateId("status_entity"),entity:"",color_mode:"state",state_colors:{on:"yellow",off:"gray"}};return{id:t||this.generateId("status_summary"),type:"status_summary",entities:[o],enable_auto_filter:!1,include_filters:[],exclude_filters:[],max_time_since_change:void 0,title:"Status Summary",show_title:!0,show_last_change_header:!0,show_time_header:!1,sort_by:"last_change",sort_direction:"desc",max_items_to_show:50,global_show_icon:!0,global_show_state:!1,row_height:40,row_gap:4,max_entity_name_length:30,show_separator_lines:!0,global_color_mode:"none",global_state_colors:{},global_time_colors:[],global_custom_color_template:"",default_text_color:"var(--primary-text-color)",default_icon_color:"var(--primary-color)",header_text_color:"var(--primary-text-color)",header_background_color:"var(--secondary-background-color)",template_mode:!1,template:"",unified_template_mode:!1,unified_template:"",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(t){const e=t,o=[...super.validate(t).errors];return e.enable_auto_filter||(e.entities&&0!==e.entities.length||o.push("At least one entity must be configured, or auto-filter must be enabled"),e.entities&&e.entities.forEach(((t,e)=>{t.entity&&""!==t.entity.trim()||o.push(`Entity ${e+1} must have an entity ID configured`)}))),{valid:0===o.length,errors:o}}renderActionsTab(t,e,o,i){return l.A.render(t,e,(t=>i(t)))}renderLogicTab(t,e,o,i){return n.X.render(t,e,(t=>i(t)))}renderGeneralTab(t,e,o,a){var s;const l=t,n=(null===(s=null==e?void 0:e.locale)||void 0===s?void 0:s.language)||"en";return this._hass=e,this.migrateEntitiesToGlobalSettings(l,a),l.enable_auto_filter&&e&&this.syncAutoFilteredEntities(l,e,a),i.qy`
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

        .entity-rows-container {
          margin-top: 16px;
        }

        .entity-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: move;
          border: 1px solid var(--divider-color);
          transition: all 0.2s ease;
        }

        .entity-row:hover {
          background: var(--primary-color);
          opacity: 0.9;
        }

        .entity-row.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .entity-row.drag-over {
          border-top: 3px solid var(--primary-color);
        }

        .entity-row.auto-generated {
          border-left: 3px solid var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.05);
        }

        .lock-icon {
          flex-shrink: 0;
        }

        .drag-handle {
          cursor: grab;
          color: var(--secondary-text-color);
          flex-shrink: 0;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .entity-info {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entity-info.no-entity {
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

        .delete-icon:hover {
          opacity: 0.7;
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
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .add-entity-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .add-entity-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .state-color-editor {
          margin-top: 12px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 4px;
        }

        .state-color-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 16px;
        }

        .state-color-input {
          flex: 0 0 150px;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }

        .time-threshold-editor {
          margin-top: 12px;
        }

        .time-threshold-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 16px;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-radius: 16px;
          font-size: 13px;
          margin: 4px;
          transition: all 0.2s ease;
          position: relative;
        }

        .filter-chip.exclude-chip {
          background: var(--error-color);
        }

        .filter-chip:hover {
          opacity: 0.9;
          padding-right: 32px;
        }

        .chip-remove-icon {
          cursor: pointer;
          font-size: 16px;
          opacity: 0;
          position: absolute;
          right: 8px;
          transition: opacity 0.2s ease;
        }

        .filter-chip:hover .chip-remove-icon {
          opacity: 1;
        }

        .domain-input-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
      </style>

      <div class="module-settings">
        <!-- Title & Display Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.title_display",n,"TITLE & DISPLAY")}
          </div>

          ${r.U.renderFieldSection((0,m.kg)("editor.status_summary.title",n,"Title"),(0,m.kg)("editor.status_summary.title_desc",n,"Title to display at the top of the summary."),e,{title:l.title||"Status Summary"},[r.U.text("title")],(t=>a({title:t.detail.value.title})))}
          ${this.renderSettingsSection("","",[{title:(0,m.kg)("editor.status_summary.show_title",n,"Show Title"),description:(0,m.kg)("editor.status_summary.show_title_desc",n,"Display the title at the top of the summary."),hass:e,data:{show_title:l.show_title},schema:[this.booleanField("show_title")],onChange:t=>a({show_title:t.detail.value.show_title})},{title:(0,m.kg)("editor.status_summary.show_last_change_header",n,"Show Last Change Header"),description:(0,m.kg)("editor.status_summary.show_last_change_header_desc",n,'Display "Last Change" column header.'),hass:e,data:{show_last_change_header:l.show_last_change_header},schema:[this.booleanField("show_last_change_header")],onChange:t=>a({show_last_change_header:t.detail.value.show_last_change_header})},{title:(0,m.kg)("editor.status_summary.show_time_header",n,"Show Time Header"),description:(0,m.kg)("editor.status_summary.show_time_header_desc",n,'Display "Time" column header.'),hass:e,data:{show_time_header:l.show_time_header},schema:[this.booleanField("show_time_header")],onChange:t=>a({show_time_header:t.detail.value.show_time_header})}])}
          ${this.renderFieldSection((0,m.kg)("editor.status_summary.sort_by",n,"Sort By"),(0,m.kg)("editor.status_summary.sort_by_desc",n,"How to sort the entity list."),e,{sort_by:l.sort_by||"last_change"},[this.selectField("sort_by",[{value:"name",label:"Name"},{value:"last_change",label:"Last Change"},{value:"custom",label:"Custom Order"}])],(t=>a({sort_by:t.detail.value.sort_by})))}
          ${this.renderFieldSection((0,m.kg)("editor.status_summary.sort_direction",n,"Sort Direction"),(0,m.kg)("editor.status_summary.sort_direction_desc",n,"Sort order direction."),e,{sort_direction:l.sort_direction||"asc"},[this.selectField("sort_direction",[{value:"asc",label:"Ascending"},{value:"desc",label:"Descending"}])],(t=>a({sort_direction:t.detail.value.sort_direction})))}
          ${this.renderSliderField((0,m.kg)("editor.status_summary.max_items_to_show",n,"Max Items to Show"),(0,m.kg)("editor.status_summary.max_items_to_show_desc",n,"Maximum number of entities to display. Set to 0 for unlimited."),l.max_items_to_show||50,50,0,1e3,1,(t=>a({max_items_to_show:0===t?void 0:t})),"")}
        </div>

        <!-- Global Display Settings Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.global_display_settings",n,"GLOBAL DISPLAY SETTINGS")}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${(0,m.kg)("editor.status_summary.global_display_settings_desc",n,"Set default display options for all entities. Individual entity settings will override these.")}
          </div>

          ${this.renderSettingsSection("","",[{title:(0,m.kg)("editor.status_summary.global_show_icon",n,"Show Icons"),description:(0,m.kg)("editor.status_summary.global_show_icon_desc",n,"Display entity icons by default for all entities."),hass:e,data:{global_show_icon:l.global_show_icon},schema:[this.booleanField("global_show_icon")],onChange:t=>a({global_show_icon:t.detail.value.global_show_icon})},{title:(0,m.kg)("editor.status_summary.global_show_state",n,"Show States"),description:(0,m.kg)("editor.status_summary.global_show_state_desc",n,'Display entity states (e.g., "on", "off") by default for all entities.'),hass:e,data:{global_show_state:l.global_show_state},schema:[this.booleanField("global_show_state")],onChange:t=>a({global_show_state:t.detail.value.global_show_state})}])}
        </div>

        <!-- Entity Management Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.entity_management",n,"ENTITY MANAGEMENT")}
          </div>

          <div class="entity-rows-container">
            ${l.entities.map(((t,o)=>this.renderEntityRow(t,o,l,e,a)))}
          </div>

          <button
            class="add-entity-btn"
            @click=${()=>this.addEntity(l,a)}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            ${(0,m.kg)("editor.status_summary.add_entity",n,"Add Entity")}
          </button>
        </div>

        <!-- Auto Filter Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.auto_filter",n,"AUTO FILTER")}
          </div>

          ${this.renderSettingsSection("","",[{title:(0,m.kg)("editor.status_summary.enable_auto_filter",n,"Enable Auto Filter"),description:(0,m.kg)("editor.status_summary.enable_auto_filter_desc",n,"Automatically include entities based on domain and device class filters."),hass:e,data:{enable_auto_filter:l.enable_auto_filter},schema:[this.booleanField("enable_auto_filter")],onChange:t=>a({enable_auto_filter:t.detail.value.enable_auto_filter})}])}
          ${l.enable_auto_filter?i.qy`
                <div style="margin-top: 16px;">
                  <!-- Include Filters -->
                  <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                    ${(0,m.kg)("editor.status_summary.include_filters",n,"Include Filters")}
                  </div>
                  <div
                    style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
                  >
                    ${(0,m.kg)("editor.status_summary.include_filters_desc",n,'Add domains or partial names to include. Examples: "binary_sensor", "light", "garage", "kitchen"')}
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-bottom: 8px; font-style: italic;"
                  >
                    Common domains: binary_sensor, light, switch, sensor, climate, cover, fan, lock,
                    media_player
                  </div>

                  <!-- Include filter tags -->
                  <div style="margin-bottom: 8px; min-height: 32px;">
                    ${(l.include_filters||[]).map((t=>i.qy`
                        <span class="filter-chip">
                          ${t}
                          <ha-icon
                            icon="mdi:close"
                            class="chip-remove-icon"
                            @click=${e=>this.removeFilter("include",t,l,a,e)}
                          ></ha-icon>
                        </span>
                      `))}
                  </div>

                  <div class="domain-input-row">
                    <input
                      type="text"
                      class="state-color-input"
                      placeholder="e.g., binary_sensor, garage, kitchen"
                      @keydown=${t=>{"Enter"===t.key&&this.addFilter("include",l,a,t)}}
                    />
                    <button
                      class="add-entity-btn"
                      style="width: auto; padding: 8px 16px;"
                      @click=${t=>this.addFilter("include",l,a,t)}
                    >
                      <ha-icon icon="mdi:plus"></ha-icon>
                    </button>
                  </div>

                  <!-- Exclude Filters -->
                  <div style="margin-top: 24px;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                      ${(0,m.kg)("editor.status_summary.exclude_filters",n,"Exclude Filters")}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
                    >
                      ${(0,m.kg)("editor.status_summary.exclude_filters_desc",n,'Add domains or partial names to exclude. Examples: "battery", "update", "unavailable"')}
                    </div>

                    <!-- Exclude filter tags -->
                    <div style="margin-bottom: 8px; min-height: 32px;">
                      ${(l.exclude_filters||[]).map((t=>i.qy`
                          <span class="filter-chip exclude-chip">
                            ${t}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${e=>this.removeFilter("exclude",t,l,a,e)}
                            ></ha-icon>
                          </span>
                        `))}
                    </div>

                    <div class="domain-input-row">
                      <input
                        type="text"
                        class="state-color-input"
                        placeholder="e.g., battery, update, unavailable"
                        @keydown=${t=>{"Enter"===t.key&&this.addFilter("exclude",l,a,t)}}
                      />
                      <button
                        class="add-entity-btn"
                        style="width: auto; padding: 8px 16px;"
                        @click=${t=>this.addFilter("exclude",l,a,t)}
                      >
                        <ha-icon icon="mdi:plus"></ha-icon>
                      </button>
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Global Color Mode Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.global_color_mode",n,"GLOBAL COLOR MODE")}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${(0,m.kg)("editor.status_summary.global_color_mode_desc",n,"Set a default color mode for all entities. Individual entity color modes will override this setting.")}
          </div>

          ${this.renderFieldSection((0,m.kg)("editor.status_summary.global_color_mode_select",n,"Global Color Mode"),(0,m.kg)("editor.status_summary.global_color_mode_select_desc",n,"How to determine colors for entities by default."),e,{global_color_mode:l.global_color_mode||"none"},[this.selectField("global_color_mode",[{value:"none",label:"None (Use Default Colors)"},{value:"state",label:"State-based"},{value:"time",label:"Time-based"},{value:"custom",label:"Custom Template"}])],(t=>a({global_color_mode:t.detail.value.global_color_mode})))}
          ${"state"===l.global_color_mode?this.renderGlobalStateColorEditor(l,a,n):""}
          ${"time"===l.global_color_mode?this.renderGlobalTimeColorEditor(l,a,n):""}
          ${"custom"===l.global_color_mode?i.qy`
                ${r.U.renderFieldSection((0,m.kg)("editor.status_summary.global_custom_color_template",n,"Global Custom Color Template"),(0,m.kg)("editor.status_summary.global_custom_color_template_desc",n,"Template that returns a color value for all entities."),e,{global_custom_color_template:l.global_custom_color_template||""},[r.U.text("global_custom_color_template",!0)],(t=>a({global_custom_color_template:t.detail.value.global_custom_color_template})))}
              `:""}
        </div>

        <!-- Time Filtering Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.time_filtering",n,"TIME FILTERING")}
          </div>

          ${this.renderSliderField((0,m.kg)("editor.status_summary.max_time_since_change",n,"Max Time Since Change (minutes)"),(0,m.kg)("editor.status_summary.max_time_since_change_desc",n,"Hide entities that haven't changed in this many minutes. Leave empty for no limit."),l.max_time_since_change||0,0,0,10080,1,(t=>a({max_time_since_change:0===t?void 0:t})),"min")}
        </div>

        <!-- Layout Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.layout",n,"LAYOUT")}
          </div>

          ${this.renderSliderField((0,m.kg)("editor.status_summary.row_height",n,"Row Height (px)"),(0,m.kg)("editor.status_summary.row_height_desc",n,"Height of each entity row in pixels."),l.row_height||40,40,20,100,1,(t=>a({row_height:t})),"px")}
          ${this.renderSliderField((0,m.kg)("editor.status_summary.row_gap",n,"Row Gap (px)"),(0,m.kg)("editor.status_summary.row_gap_desc",n,"Gap between entity rows in pixels."),l.row_gap||4,4,0,20,1,(t=>a({row_gap:t})),"px")}
          ${this.renderSliderField((0,m.kg)("editor.status_summary.max_entity_name_length",n,"Max Entity Name Length"),(0,m.kg)("editor.status_summary.max_entity_name_length_desc",n,"Maximum number of characters to display for entity names before truncating."),l.max_entity_name_length||30,30,10,100,1,(t=>a({max_entity_name_length:t})),"")}
          ${this.renderSettingsSection("","",[{title:(0,m.kg)("editor.status_summary.show_separator_lines",n,"Show Separator Lines"),description:(0,m.kg)("editor.status_summary.show_separator_lines_desc",n,"Display lines between entity rows."),hass:e,data:{show_separator_lines:l.show_separator_lines},schema:[this.booleanField("show_separator_lines")],onChange:t=>a({show_separator_lines:t.detail.value.show_separator_lines})}])}
        </div>

        <!-- Default Colors Section -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,m.kg)("editor.status_summary.default_colors",n,"DEFAULT COLORS")}
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,m.kg)("editor.status_summary.default_text_color",n,"Default Text Color")}
              .value=${l.default_text_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${e}
              @value-changed=${t=>{a({default_text_color:t.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,m.kg)("editor.status_summary.default_icon_color",n,"Default Icon Color")}
              .value=${l.default_icon_color||""}
              .defaultValue=${"var(--primary-color)"}
              .hass=${e}
              @value-changed=${t=>{a({default_icon_color:t.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,m.kg)("editor.status_summary.header_text_color",n,"Header Text Color")}
              .value=${l.header_text_color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${e}
              @value-changed=${t=>{a({header_text_color:t.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,m.kg)("editor.status_summary.header_background_color",n,"Header Background Color")}
              .value=${l.header_background_color||""}
              .defaultValue=${"var(--secondary-background-color)"}
              .hass=${e}
              @value-changed=${t=>{a({header_background_color:t.detail.value})}}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderEntityRow(t,e,o,a,s){var l,n;const d=this._expandedEntities.has(t.id),c=(null===(l=null==a?void 0:a.locale)||void 0===l?void 0:l.language)||"en",u=t.is_auto_generated||!1;return i.qy`
      <div
        class="entity-row ${(null===(n=this._draggedItem)||void 0===n?void 0:n.id)===t.id?"dragging":""} ${u?"auto-generated":""}"
        draggable="true"
        @dragstart=${e=>this.handleDragStart(e,t)}
        @dragend=${()=>this.handleDragEnd()}
        @dragover=${t=>this.handleDragOver(t)}
        @drop=${t=>this.handleDrop(t,e,o,s)}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <div class="entity-info ${t.entity?"":"no-entity"}">
          ${u?i.qy`<ha-icon
                icon="mdi:auto-fix"
                style="margin-right: 4px; color: var(--primary-color);"
              ></ha-icon>`:""}
          ${t.entity||"No entity selected"}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${d?"expanded":""}"
          @click=${()=>this.toggleExpand(t.id)}
        ></ha-icon>
        ${u?i.qy`
              <ha-icon
                icon="mdi:lock"
                class="lock-icon"
                style="color: var(--secondary-text-color); cursor: help;"
                title="Auto-generated from filters. Adjust filters to remove."
              ></ha-icon>
            `:i.qy`
              <ha-icon
                icon="mdi:delete"
                class="delete-icon"
                @click=${()=>this.deleteEntity(e,o,s)}
              ></ha-icon>
            `}
      </div>

      ${d?i.qy`
            <div class="entity-settings">
              ${u?i.qy`
                    <div
                      style="background: rgba(var(--rgb-primary-color), 0.1); padding: 12px; border-radius: 4px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
                    >
                      <ha-icon
                        icon="mdi:information"
                        style="color: var(--primary-color);"
                      ></ha-icon>
                      <div style="font-size: 13px; color: var(--primary-text-color);">
                        This entity was auto-generated from your filters. You can customize its
                        appearance, but it will be removed if it no longer matches your filters.
                      </div>
                    </div>
                  `:""}
              ${u?i.qy`
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
                        Entity
                      </div>
                      <div
                        style="font-size: 13px; color: var(--secondary-text-color); padding: 8px; background: var(--secondary-background-color); border-radius: 4px;"
                      >
                        ${t.entity}
                      </div>
                    </div>
                  `:i.qy`
                    ${r.U.renderFieldSection((0,m.kg)("editor.status_summary.entity",c,"Entity"),(0,m.kg)("editor.status_summary.entity_desc",c,"Entity to monitor for status."),a,{entity:t.entity||""},[r.U.entity("entity")],(t=>this.updateEntity(e,{entity:t.detail.value.entity},o,s)))}
                  `}
              ${r.U.renderFieldSection((0,m.kg)("editor.status_summary.label",c,"Label Override"),(0,m.kg)("editor.status_summary.label_desc",c,"Custom label to display instead of entity name."),a,{label:t.label||""},[r.U.text("label")],(t=>this.updateEntity(e,{label:t.detail.value.label},o,s)))}
              ${r.U.renderFieldSection((0,m.kg)("editor.status_summary.icon",c,"Icon Override"),(0,m.kg)("editor.status_summary.icon_desc",c,"Custom icon to display instead of entity icon."),a,{icon:t.icon||""},[r.U.icon("icon")],(t=>this.updateEntity(e,{icon:t.detail.value.icon},o,s)))}
              ${this.renderSettingsSection("","",[{title:(0,m.kg)("editor.status_summary.show_icon",c,"Show Icon"),description:(0,m.kg)("editor.status_summary.show_icon_desc",c,"Display entity icon. Leave unset to use global setting."),hass:a,data:{show_icon:void 0!==t.show_icon?t.show_icon:o.global_show_icon},schema:[this.booleanField("show_icon")],onChange:t=>this.updateEntity(e,{show_icon:t.detail.value.show_icon},o,s)},{title:(0,m.kg)("editor.status_summary.show_state",c,"Show State"),description:(0,m.kg)("editor.status_summary.show_state_desc",c,"Display entity state. Leave unset to use global setting."),hass:a,data:{show_state:void 0!==t.show_state?t.show_state:o.global_show_state},schema:[this.booleanField("show_state")],onChange:t=>this.updateEntity(e,{show_state:t.detail.value.show_state},o,s)}])}
              ${this.renderFieldSection((0,m.kg)("editor.status_summary.color_mode",c,"Color Mode"),(0,m.kg)("editor.status_summary.color_mode_desc",c,"How to determine the color for this entity."),a,{color_mode:t.color_mode||"none"},[this.selectField("color_mode",[{value:"none",label:"None (Use Default)"},{value:"state",label:"State-based"},{value:"time",label:"Time-based"},{value:"custom",label:"Custom Template"}])],(t=>this.updateEntity(e,{color_mode:t.detail.value.color_mode},o,s)))}
              ${"state"===t.color_mode?this.renderStateColorEditor(t,e,o,s,c):""}
              ${"time"===t.color_mode?this.renderTimeColorEditor(t,e,o,s,c):""}
              ${"custom"===t.color_mode?i.qy`
                    ${r.U.renderFieldSection((0,m.kg)("editor.status_summary.custom_color_template",c,"Custom Color Template"),(0,m.kg)("editor.status_summary.custom_color_template_desc",c,"Template that returns a color value."),a,{custom_color_template:t.custom_color_template||""},[r.U.text("custom_color_template",!0)],(t=>this.updateEntity(e,{custom_color_template:t.detail.value.custom_color_template},o,s)))}
                  `:""}
            </div>
          `:""}
    `}renderGlobalStateColorEditor(t,e,o){const a=t.global_state_colors||{},s=this._hass;return i.qy`
      <div class="state-color-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${(0,m.kg)("editor.status_summary.global_state_colors",o,"Global State Colors")}
        </div>
        ${Object.entries(a).map((([o,a])=>i.qy`
            <div class="state-color-row">
              <input
                type="text"
                class="state-color-input"
                placeholder="State (e.g., on, off)"
                .value=${o}
                @input=${i=>this.updateGlobalStateColor(o,i.target.value,a,t,e)}
              />
              <ultra-color-picker
                .label=${""}
                .value=${a}
                .defaultValue=${"gray"}
                .hass=${s}
                style="flex: 1;"
                @value-changed=${i=>{this.updateGlobalStateColor(o,o,i.detail.value,t,e)}}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${()=>this.removeGlobalStateColor(o,t,e)}
              ></ha-icon>
            </div>
          `))}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${()=>this.addGlobalStateColor(t,e)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${(0,m.kg)("editor.status_summary.add_state_color",o,"Add State Color")}
        </button>
      </div>
    `}renderGlobalTimeColorEditor(t,e,o){const a=t.global_time_colors||[],s=this._hass;return i.qy`
      <div class="time-threshold-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${(0,m.kg)("editor.status_summary.global_time_thresholds",o,"Global Time Thresholds")}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Threshold is the maximum minutes since last change. If the entity changed within this
          time, apply the color.
        </div>
        ${a.map(((o,a)=>i.qy`
            <div class="time-threshold-row">
              <input
                type="number"
                class="state-color-input"
                placeholder="Minutes"
                style="flex: 0 0 120px;"
                .value=${o.threshold.toString()}
                @input=${i=>this.updateGlobalTimeThreshold(a,parseInt(i.target.value)||0,o.color,t,e)}
              />
              <ultra-color-picker
                .label=${""}
                .value=${o.color}
                .defaultValue=${"gray"}
                .hass=${s}
                style="flex: 1;"
                @value-changed=${i=>{this.updateGlobalTimeThreshold(a,o.threshold,i.detail.value,t,e)}}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${()=>this.removeGlobalTimeThreshold(a,t,e)}
              ></ha-icon>
            </div>
          `))}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${()=>this.addGlobalTimeThreshold(t,e)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${(0,m.kg)("editor.status_summary.add_time_threshold",o,"Add Time Threshold")}
        </button>
      </div>
    `}renderStateColorEditor(t,e,o,a,s){const r=t.state_colors||{},l=this._hass;return i.qy`
      <div class="state-color-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${(0,m.kg)("editor.status_summary.state_colors",s,"State Colors")}
        </div>
        ${Object.entries(r).map((([t,s])=>i.qy`
            <div class="state-color-row">
              <input
                type="text"
                class="state-color-input"
                placeholder="State (e.g., on, off)"
                .value=${t}
                @input=${i=>this.updateStateColor(e,t,i.target.value,s,o,a)}
              />
              <ultra-color-picker
                .label=${""}
                .value=${s}
                .defaultValue=${"gray"}
                .hass=${l}
                style="flex: 1;"
                @value-changed=${i=>{this.updateStateColor(e,t,t,i.detail.value,o,a)}}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${()=>this.removeStateColor(e,t,o,a)}
              ></ha-icon>
            </div>
          `))}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${()=>this.addStateColor(e,o,a)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${(0,m.kg)("editor.status_summary.add_state_color",s,"Add State Color")}
        </button>
      </div>
    `}renderTimeColorEditor(t,e,o,a,s){const r=t.time_colors||[],l=this._hass;return i.qy`
      <div class="time-threshold-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${(0,m.kg)("editor.status_summary.time_thresholds",s,"Time Thresholds")}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Threshold is the maximum minutes since last change. If the entity changed within this
          time, apply the color.
        </div>
        ${r.map(((t,s)=>i.qy`
            <div class="time-threshold-row">
              <input
                type="number"
                class="state-color-input"
                placeholder="Minutes"
                style="flex: 0 0 120px;"
                .value=${t.threshold.toString()}
                @input=${i=>this.updateTimeThreshold(e,s,parseInt(i.target.value)||0,t.color,o,a)}
              />
              <ultra-color-picker
                .label=${""}
                .value=${t.color}
                .defaultValue=${"gray"}
                .hass=${l}
                style="flex: 1;"
                @value-changed=${i=>{this.updateTimeThreshold(e,s,t.threshold,i.detail.value,o,a)}}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${()=>this.removeTimeThreshold(e,s,o,a)}
              ></ha-icon>
            </div>
          `))}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${()=>this.addTimeThreshold(e,o,a)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${(0,m.kg)("editor.status_summary.add_time_threshold",s,"Add Time Threshold")}
        </button>
      </div>
    `}addEntity(t,e){const o={id:this.generateId("status_entity"),entity:"",show_icon:!0,show_state:!0,color_mode:"none"};e({entities:[...t.entities,o]}),this._expandedEntities.add(o.id)}deleteEntity(t,e,o){const i=[...e.entities],a=i.splice(t,1);a[0]&&this._expandedEntities.delete(a[0].id),o({entities:i})}updateEntity(t,e,o,i){const a=[...o.entities];a[t]=Object.assign(Object.assign({},a[t]),e),i({entities:a})}toggleExpand(t){this._expandedEntities.has(t)?this._expandedEntities.delete(t):this._expandedEntities.add(t),"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}handleDragStart(t,e){this._draggedItem=e,t.dataTransfer&&(t.dataTransfer.effectAllowed="move")}handleDragEnd(){this._draggedItem=null,"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}handleDragOver(t){t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move")}handleDrop(t,e,o,i){if(t.preventDefault(),!this._draggedItem)return;const a=[...o.entities],s=a.findIndex((t=>t.id===this._draggedItem.id));if(-1===s||s===e)return;const[r]=a.splice(s,1);a.splice(e,0,r),i({entities:a}),this._draggedItem=null}addGlobalStateColor(t,e){e({global_state_colors:Object.assign(Object.assign({},t.global_state_colors||{}),{new_state:"gray"})})}removeGlobalStateColor(t,e,o){const i=Object.assign({},e.global_state_colors||{});delete i[t],o({global_state_colors:i})}updateGlobalStateColor(t,e,o,i,a){const s=Object.assign({},i.global_state_colors||{});t!==e&&delete s[t],s[e]=o,a({global_state_colors:s})}addGlobalTimeThreshold(t,e){e({global_time_colors:[...t.global_time_colors||[],{threshold:60,color:"gray"}]})}removeGlobalTimeThreshold(t,e,o){const i=[...e.global_time_colors||[]];i.splice(t,1),o({global_time_colors:i})}updateGlobalTimeThreshold(t,e,o,i,a){const s=[...i.global_time_colors||[]];s[t]={threshold:e,color:o},a({global_time_colors:s})}addStateColor(t,e,o){const i=[...e.entities],a=i[t],s=Object.assign(Object.assign({},a.state_colors||{}),{new_state:"gray"});i[t]=Object.assign(Object.assign({},a),{state_colors:s}),o({entities:i})}removeStateColor(t,e,o,i){const a=[...o.entities],s=a[t],r=Object.assign({},s.state_colors||{});delete r[e],a[t]=Object.assign(Object.assign({},s),{state_colors:r}),i({entities:a})}updateStateColor(t,e,o,i,a,s){const r=[...a.entities],l=r[t],n=Object.assign({},l.state_colors||{});e!==o&&delete n[e],n[o]=i,r[t]=Object.assign(Object.assign({},l),{state_colors:n}),s({entities:r})}addTimeThreshold(t,e,o){const i=[...e.entities],a=i[t],s=[...a.time_colors||[],{threshold:60,color:"gray"}];i[t]=Object.assign(Object.assign({},a),{time_colors:s}),o({entities:i})}removeTimeThreshold(t,e,o,i){const a=[...o.entities],s=a[t],r=[...s.time_colors||[]];r.splice(e,1),a[t]=Object.assign(Object.assign({},s),{time_colors:r}),i({entities:a})}updateTimeThreshold(t,e,o,i,a,s){const r=[...a.entities],l=r[t],n=[...l.time_colors||[]];n[e]={threshold:o,color:i},r[t]=Object.assign(Object.assign({},l),{time_colors:n}),s({entities:r})}migrateEntitiesToGlobalSettings(t,e){let o=!1;const i=t.entities.map((e=>{const i=Object.assign({},e);return!0===i.show_icon&&!0===t.global_show_icon&&(delete i.show_icon,o=!0),!0===i.show_state&&!0===t.global_show_state&&(delete i.show_state,o=!0),!1===i.show_state&&!1===t.global_show_state&&(delete i.show_state,o=!0),i}));o&&e({entities:i})}syncAutoFilteredEntities(t,e,o){const i=this.getAutoFilteredEntities(t,e),a=t.entities||[],s=a.filter((t=>!t.is_auto_generated)),r=a.filter((t=>t.is_auto_generated)),l=new Map;r.forEach((t=>{t.entity&&l.set(t.entity,t)}));const n=[];i.forEach((t=>{const e=l.get(t);if(e)n.push(e);else{const e={id:this.generateId("status_entity"),entity:t,color_mode:"none",is_auto_generated:!0};n.push(e)}}));const d=[...s,...n];JSON.stringify(a)!==JSON.stringify(d)&&o({entities:d})}addFilter(t,e,o,i){i.preventDefault(),i.stopPropagation();const a=i.target.closest(".domain-input-row"),s=null==a?void 0:a.querySelector("input");if(!s||!s.value.trim())return;const r=s.value.trim().toLowerCase(),l="include"===t?"include_filters":"exclude_filters",n=[...e[l]||[]];n.includes(r)||(n.push(r),o({[l]:n}),s.value="",setTimeout((()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}),50))}removeFilter(t,e,o,i,a){a.preventDefault(),a.stopPropagation();const s="include"===t?"include_filters":"exclude_filters",r=(o[s]||[]).filter((t=>t!==e));i({[s]:r}),setTimeout((()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-module-update"))}),50)}getStyles(){return`${s.m.getSliderStyles()}`}renderPreview(t,e,o){const a=t,s=this.getEntitiesToDisplay(a,e),r=this.sortEntities(s,a,e),l=a.max_items_to_show||0,n=l>0?r.slice(0,l):r;return r.length,n.length,this._ensureStatusSummaryColorSubscriptions(a,e,o),i.qy`
      <style>
        .status-summary-container {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
        }

        .summary-title {
          font-size: 18px;
          font-weight: 700;
          color: ${a.header_text_color||"var(--primary-text-color)"};
          margin-bottom: 12px;
          text-align: center;
        }

        .summary-table {
          width: 100%;
          display: grid;
          grid-template-columns: ${this.getGridColumns(a)};
          gap: ${a.row_gap||4}px;
        }

        .summary-header {
          display: contents;
        }

        .header-cell {
          font-size: 14px;
          font-weight: 600;
          color: ${a.header_text_color||"var(--primary-text-color)"};
          background: ${a.header_background_color||"var(--secondary-background-color)"};
          padding: 8px;
          text-align: left;
        }

        .header-cell:last-child {
          text-align: right;
        }

        .summary-row {
          display: contents;
        }

        .row-cell {
          height: ${a.row_height||40}px;
          display: flex;
          align-items: center;
          padding: 0 8px;
          font-size: 14px;
          ${a.show_separator_lines?"border-bottom: 1px solid var(--divider-color);":""}
        }

        .entity-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .entity-cell:hover {
          background-color: rgba(var(--rgb-primary-color), 0.1);
        }

        .entity-icon {
          flex-shrink: 0;
        }

        .entity-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entity-state {
          font-size: 12px;
          opacity: 0.7;
          margin-left: 4px;
        }

        .last-change-cell {
          text-align: center;
          color: var(--secondary-text-color);
        }

        .time-cell {
          text-align: right;
          color: var(--secondary-text-color);
        }

        @media (max-width: 600px) {
          .summary-table {
            grid-template-columns: 1fr;
          }

          .header-cell:nth-child(2),
          .header-cell:nth-child(3),
          .last-change-cell,
          .time-cell {
            display: none;
          }

          .row-cell {
            border-bottom: 1px solid var(--divider-color);
            padding: 12px 8px;
          }
        }
      </style>

      <div class="status-summary-container">
        ${a.show_title?i.qy`<div class="summary-title">${a.title||"Status Summary"}</div>`:""}

        <div class="summary-table">
          ${a.show_last_change_header||a.show_time_header?i.qy`
                <div class="summary-header">
                  <div class="header-cell">Entity</div>
                  ${a.show_last_change_header?i.qy`<div class="header-cell">Last Change</div>`:""}
                  ${a.show_time_header?i.qy`<div class="header-cell">Time</div>`:""}
                </div>
              `:""}
          ${n.map((t=>{const o=e.states[t.entity.entity];if(!o)return"";const s=this.getEntityColor(t.entity,o,a,e),r=t.entity.icon||o.attributes.icon||this.getDefaultIcon(o.entity_id);let l=t.entity.label||o.attributes.friendly_name||o.entity_id;const n=void 0!==t.entity.show_icon?t.entity.show_icon:a.global_show_icon,d=void 0!==t.entity.show_state?t.entity.show_state:a.global_show_state,c=a.max_entity_name_length||30;return l.length>c&&(l=l.substring(0,c)+"..."),i.qy`
              <div class="summary-row">
                <div
                  class="row-cell entity-cell"
                  style="color: ${s};"
                  @click=${e=>this.handleEntityClick(e,t.entity.entity)}
                >
                  ${n?i.qy`<ha-icon
                        class="entity-icon"
                        icon="${r}"
                        style="color: ${s};"
                      ></ha-icon>`:""}
                  <span class="entity-name">${l}</span>
                  ${d?i.qy`<span class="entity-state">(${o.state})</span>`:""}
                </div>
                ${a.show_last_change_header?i.qy`<div class="row-cell last-change-cell">${t.lastChangeFormatted}</div>`:""}
                ${a.show_time_header?i.qy`<div class="row-cell time-cell">${t.timeFormatted}</div>`:""}
              </div>
            `}))}
        </div>
      </div>
    `}getEntitiesToDisplay(t,e){const o=[];return t.entities.forEach((i=>{if(i.entity&&e.states[i.entity]){const a=e.states[i.entity],s=new Date(a.last_changed);if(t.max_time_since_change&&(Date.now()-s.getTime())/6e4>t.max_time_since_change)return;o.push({entity:i,lastChange:s})}})),o}getAutoFilteredEntities(t,e){return e&&e.states&&t.include_filters&&0!==t.include_filters.length?Object.keys(e.states).filter((o=>{const i=o.split(".")[0],a=(e.states[o].attributes.friendly_name||"").toLowerCase(),s=o.toLowerCase();return!!t.include_filters.some((t=>{const e=t.toLowerCase();return i===e||s.includes(e)||a.includes(e)}))&&!(t.exclude_filters&&t.exclude_filters.length>0&&t.exclude_filters.some((t=>{const e=t.toLowerCase();return i===e||s.includes(e)||a.includes(e)})))})):[]}sortEntities(t,e,o){const i=t.map((t=>Object.assign(Object.assign({},t),{lastChangeFormatted:this.formatTimeSince(t.lastChange),timeFormatted:this.formatTime(t.lastChange)})));return"custom"===e.sort_by||i.sort(((t,i)=>{let a=0;if("name"===e.sort_by){const e=this.getEntityName(t.entity,o),s=this.getEntityName(i.entity,o);a=e.localeCompare(s)}else"last_change"===e.sort_by&&(a=i.lastChange.getTime()-t.lastChange.getTime());return"desc"===e.sort_direction?-a:a})),i}getEntityName(t,e){if(t.label)return t.label;const o=e.states[t.entity];return(null==o?void 0:o.attributes.friendly_name)||t.entity}_ensureStatusSummaryColorSubscriptions(t,e,o){var i,a;const s=u(e);if("custom"===t.global_color_mode&&(null===(i=t.global_custom_color_template)||void 0===i?void 0:i.trim())){const i=(0,c.KD)(t.global_custom_color_template.trim(),e,o);s.subscribeToColorTemplate(i,`uc_status_summary_${t.id}_global_color`,_)}for(const i of t.entities||[])if("custom"===i.color_mode&&(null===(a=i.custom_color_template)||void 0===a?void 0:a.trim())){const a=(0,c.KD)(i.custom_color_template.trim(),e,o);s.subscribeToColorTemplate(a,`uc_status_summary_${t.id}_entity_${i.id}_color`,_)}}getEntityColor(t,e,o,i){var a,s;if("none"!==t.color_mode)if("custom"===t.color_mode&&t.custom_color_template){const e=u(i),s=`uc_status_summary_${o.id}_entity_${t.id}_color`,r=e.getColorResult(s);if(r&&"var(--primary-color)"!==r)return r;const l=null===(a=i.__uvc_dynamic_colors)||void 0===a?void 0:a[s];if("string"==typeof l&&l.trim())return e.parseColorResult(l)}else if("state"===t.color_mode&&t.state_colors){const o=t.state_colors[e.state];if(o)return o}else if("time"===t.color_mode&&t.time_colors){const o=(Date.now()-new Date(e.last_changed).getTime())/6e4,i=[...t.time_colors].sort(((t,e)=>t.threshold-e.threshold)).find((t=>o<=t.threshold));if(i)return i.color}if("none"!==o.global_color_mode)if("custom"===o.global_color_mode&&o.global_custom_color_template){const t=u(i),e=`uc_status_summary_${o.id}_global_color`,a=t.getColorResult(e);if(a&&"var(--primary-color)"!==a)return a;const r=null===(s=i.__uvc_dynamic_colors)||void 0===s?void 0:s[e];if("string"==typeof r&&r.trim())return t.parseColorResult(r)}else if("state"===o.global_color_mode&&o.global_state_colors){const t=o.global_state_colors[e.state];if(t)return t}else if("time"===o.global_color_mode&&o.global_time_colors){const t=(Date.now()-new Date(e.last_changed).getTime())/6e4,i=[...o.global_time_colors].sort(((t,e)=>t.threshold-e.threshold)).find((e=>t<=e.threshold));if(i)return i.color}return o.default_text_color||"var(--primary-text-color)"}formatTimeSince(t){const e=Math.floor((Date.now()-t.getTime())/1e3);if(e<60)return`${e} s`;const o=Math.floor(e/60);if(o<60)return`${o} m`;const i=Math.floor(o/60);if(i<24){const t=o%60;return t>0?`${i} h ${t} m`:`${i} h`}const a=Math.floor(i/24),s=i%24;return s>0?`${a} d ${s} h`:`${a} d`}formatTime(t){const e=t.getHours(),o=e>=12?"PM":"AM";return`${e%12||12}:${t.getMinutes().toString().padStart(2,"0")} ${o}`}getDefaultIcon(t){return{binary_sensor:"mdi:radiobox-marked",light:"mdi:lightbulb",switch:"mdi:light-switch",sensor:"mdi:eye",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",media_player:"mdi:cast",person:"mdi:account",device_tracker:"mdi:account-arrow-right"}[t.split(".")[0]]||"mdi:help-circle"}getGridColumns(t){const e=["1fr"];return t.show_last_change_header&&e.push("auto"),t.show_time_header&&e.push("auto"),e.join(" ")}handleEntityClick(t,e){t.stopPropagation(),(0,a.fireEvent)(t.target,"hass-more-info",{entityId:e})}}}}]);