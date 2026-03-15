"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5372],{5372:(e,i,t)=>{t.r(i),t.d(i,{UltraGridModule:()=>u});var n=t(5183),o=t(7475),a=t(766),r=t(5147),l=t(8938),s=t(230);t(7921);const d=[{id:"style_1",name:"Modern Stack",description:"Name above icon above state",category:"modern",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:32,defaultFontSize:12,defaultPadding:"16px",defaultBorderRadius:"12px",supportsVariableHeight:!0},{id:"style_2",name:"Minimalist",description:"Icon above state only",category:"modern",showIcon:!0,showName:!1,showState:!0,layout:"vertical",defaultIconSize:36,defaultFontSize:11,defaultPadding:"12px",defaultBorderRadius:"8px",supportsVariableHeight:!0},{id:"style_3",name:"Sidebar",description:"Icon left, name + state right",category:"modern",showIcon:!0,showName:!0,showState:!0,layout:"horizontal",defaultIconSize:28,defaultFontSize:13,defaultPadding:"12px",defaultBorderRadius:"10px",supportsVariableHeight:!1},{id:"style_4",name:"Badge Icon",description:"Large icon with floating state badge",category:"modern",showIcon:!0,showName:!1,showState:!0,layout:"icon-only",defaultIconSize:48,defaultFontSize:10,defaultPadding:"16px",defaultBorderRadius:"50%",supportsVariableHeight:!0},{id:"style_5",name:"Compact Row",description:"Icon + name horizontal, state below",category:"modern",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:24,defaultFontSize:12,defaultPadding:"10px",defaultBorderRadius:"8px",supportsVariableHeight:!0},{id:"style_6",name:"Icon Only",description:"Icon only, hover shows name",category:"minimal",showIcon:!0,showName:!1,showState:!1,layout:"icon-only",defaultIconSize:32,defaultFontSize:11,defaultPadding:"12px",defaultBorderRadius:"8px",supportsVariableHeight:!0},{id:"style_7",name:"Compact",description:"Icon + state, no name",category:"minimal",showIcon:!0,showName:!1,showState:!0,layout:"vertical",defaultIconSize:24,defaultFontSize:10,defaultPadding:"8px",defaultBorderRadius:"6px",supportsVariableHeight:!0},{id:"style_8",name:"Text Only",description:"Name + state, no icon",category:"minimal",showIcon:!1,showName:!0,showState:!0,layout:"vertical",defaultIconSize:0,defaultFontSize:13,defaultPadding:"12px",defaultBorderRadius:"8px",supportsVariableHeight:!0},{id:"style_9",name:"Ring Progress",description:"Circular icon with progress ring",category:"minimal",showIcon:!0,showName:!1,showState:!0,layout:"icon-only",defaultIconSize:40,defaultFontSize:11,defaultPadding:"8px",defaultBorderRadius:"50%",supportsVariableHeight:!0},{id:"style_10",name:"Corner Badge",description:"Square tile with corner state",category:"minimal",showIcon:!0,showName:!1,showState:!0,layout:"icon-only",defaultIconSize:28,defaultFontSize:9,defaultPadding:"12px",defaultBorderRadius:"8px",supportsVariableHeight:!0},{id:"style_11",name:"Card",description:"Card-like with shadow",category:"classic",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:32,defaultFontSize:12,defaultPadding:"16px",defaultBorderRadius:"12px",supportsVariableHeight:!0},{id:"style_12",name:"Button",description:"Button-style with border",category:"classic",showIcon:!0,showName:!0,showState:!1,layout:"horizontal",defaultIconSize:20,defaultFontSize:13,defaultPadding:"10px 16px",defaultBorderRadius:"24px",supportsVariableHeight:!1},{id:"style_13",name:"List Item",description:"List-style horizontal",category:"classic",showIcon:!0,showName:!0,showState:!0,layout:"horizontal",defaultIconSize:24,defaultFontSize:14,defaultPadding:"8px 12px",defaultBorderRadius:"4px",supportsVariableHeight:!1},{id:"style_14",name:"Badge",description:"Badge-style rounded",category:"classic",showIcon:!0,showName:!0,showState:!1,layout:"horizontal",defaultIconSize:16,defaultFontSize:12,defaultPadding:"6px 12px",defaultBorderRadius:"16px",supportsVariableHeight:!1},{id:"style_15",name:"Panel",description:"Panel with header bar",category:"classic",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:28,defaultFontSize:12,defaultPadding:"0",defaultBorderRadius:"8px",supportsVariableHeight:!0},{id:"style_16",name:"Glass",description:"Glass morphism effect",category:"advanced",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:32,defaultFontSize:12,defaultPadding:"16px",defaultBorderRadius:"16px",supportsVariableHeight:!0},{id:"style_17",name:"Gradient",description:"Gradient background overlay",category:"advanced",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:36,defaultFontSize:12,defaultPadding:"20px",defaultBorderRadius:"12px",supportsVariableHeight:!0},{id:"style_18",name:"Split",description:"Split-color design",category:"advanced",showIcon:!0,showName:!0,showState:!0,layout:"horizontal",defaultIconSize:28,defaultFontSize:12,defaultPadding:"0",defaultBorderRadius:"10px",supportsVariableHeight:!1},{id:"style_19",name:"Neumorphic",description:"Soft UI design",category:"advanced",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:32,defaultFontSize:12,defaultPadding:"16px",defaultBorderRadius:"16px",supportsVariableHeight:!0},{id:"style_20",name:"Accent Border",description:"Flat with accent border",category:"advanced",showIcon:!0,showName:!0,showState:!0,layout:"vertical",defaultIconSize:28,defaultFontSize:12,defaultPadding:"14px",defaultBorderRadius:"8px",supportsVariableHeight:!0}];function c(e){return d.find((i=>i.id===e))||d[0]}class u extends o.m{constructor(){super(...arguments),this.metadata={type:"grid",title:"Grid",description:"Display entities in a customizable grid layout with multiple styles",author:"WJD Designs",version:"1.0.0",icon:"mdi:view-grid",category:"data",tags:["grid","entities","dashboard","tiles","display"]},this._expandedEntities=new Set,this._draggedItem=null,this._currentPages=new Map,this._animationStartTimes=new Map,this._entityActionStates=new Map,this._gestureState=new Map}createDefault(e,i){return{id:e||this.generateId("grid"),type:"grid",entities:[],enable_auto_filter:!1,include_domains:[],exclude_domains:[],exclude_entities:[],include_keywords:[],exclude_keywords:[],grid_style:"style_1",grid_display_mode:"grid",columns:4,rows:0,gap:12,sort_by:"name",sort_direction:"asc",max_items:15,enable_pagination:!1,items_per_page:12,pagination_style:"both",enable_load_animation:!0,load_animation:"fadeIn",grid_animation_duration:600,animation_stagger:100,global_icon_size:32,global_font_size:12,global_name_color:"var(--primary-text-color)",global_state_color:"var(--secondary-text-color)",global_icon_color:"var(--primary-color)",global_background_color:"var(--card-background-color)",global_border_radius:"12px",global_padding:"16px",global_border_width:0,global_border_color:"var(--divider-color)",global_on_color:"var(--state-active-color, #fdd835)",global_off_color:"var(--secondary-text-color)",global_unavailable_color:"var(--disabled-color, #bdbdbd)",glass_tint_color:"rgba(255, 255, 255, 0.1)",glass_blur_amount:10,glass_border_color:"rgba(255, 255, 255, 0.2)",gradient_start_color:"#6666FF",gradient_end_color:"#000070",gradient_direction:"to-bottom-right",panel_header_color:"var(--primary-color)",panel_header_text_color:"var(--text-primary-color, #fff)",split_left_color:"var(--primary-color)",split_right_color:"var(--card-background-color)",neumorphic_light_shadow:"rgba(255, 255, 255, 0.1)",neumorphic_dark_shadow:"rgba(0, 0, 0, 0.15)",accent_border_color:"var(--primary-color)",card_shadow_color:"rgba(0, 0, 0, 0.1)",tap_action:{action:"default"},hold_action:{action:"more-info"},double_tap_action:{action:"nothing"},enable_hover_effect:!0,hover_effect:"scale",hover_scale:1.05,display_mode:"always",display_conditions:[]}}validate(e){const i=e,t=[...super.validate(e).errors];return i.enable_auto_filter||i.entities&&0!==i.entities.length||t.push("At least one entity must be configured, or enable auto-filter"),(i.columns<1||i.columns>12)&&t.push("Columns must be between 1 and 12"),{valid:0===t.length,errors:t}}getAvailableDomains(e){if(!(null==e?void 0:e.states))return[];const i=new Set;return Object.keys(e.states).forEach((e=>{const t=e.split(".")[0];i.add(t)})),Array.from(i).sort()}getFilteredEntities(e,i){let t=[...e.entities||[]];if(e.enable_auto_filter&&(null==i?void 0:i.states)){const n=Object.keys(i.states);let o=n;e.include_domains&&e.include_domains.length>0&&(o=n.filter((i=>{const t=i.split(".")[0];return e.include_domains.includes(t)}))),e.include_keywords&&e.include_keywords.length>0&&(o=o.filter((i=>{const t=i.toLowerCase();return e.include_keywords.some((e=>t.includes(e.toLowerCase())))}))),e.exclude_domains&&e.exclude_domains.length>0&&(o=o.filter((i=>{const t=i.split(".")[0];return!e.exclude_domains.includes(t)}))),e.exclude_keywords&&e.exclude_keywords.length>0&&(o=o.filter((i=>{const t=i.toLowerCase();return!e.exclude_keywords.some((e=>t.includes(e.toLowerCase())))}))),e.exclude_entities&&e.exclude_entities.length>0&&(o=o.filter((i=>!e.exclude_entities.includes(i))));const a=new Set(t.map((e=>e.entity))),r=o.filter((e=>!a.has(e))).map((e=>({id:this.generateId("grid_entity"),entity:e})));t=[...t,...r]}return t=t.filter((e=>!e.hidden)),t=t.filter((e=>!e.display_mode||"always"===e.display_mode||s.S.evaluateDisplayConditions(e.display_conditions||[],e.display_mode))),t}sortEntities(e,i,t,n){return[...e].sort(((e,o)=>{var a,r,l,s;const d=null===(a=null==n?void 0:n.states)||void 0===a?void 0:a[e.entity],c=null===(r=null==n?void 0:n.states)||void 0===r?void 0:r[o.entity];let u=0;switch(i){case"name":const i=e.custom_name||(null===(l=null==d?void 0:d.attributes)||void 0===l?void 0:l.friendly_name)||e.entity,t=o.custom_name||(null===(s=null==c?void 0:c.attributes)||void 0===s?void 0:s.friendly_name)||o.entity;u=i.localeCompare(t);break;case"last_updated":u=((null==d?void 0:d.last_updated)?new Date(d.last_updated).getTime():0)-((null==c?void 0:c.last_updated)?new Date(c.last_updated).getTime():0);break;case"state":const n=(null==d?void 0:d.state)||"",a=(null==c?void 0:c.state)||"";u=n.localeCompare(a);break;case"domain":const r=e.entity.split(".")[0],p=o.entity.split(".")[0];u=r.localeCompare(p);break;default:u=0}return"desc"===t?-u:u}))}getPaginatedEntities(e,i,t){if(!i.enable_pagination||i.items_per_page<=0)return{entities:e,currentPage:1,totalPages:1};const n=this._currentPages.get(t)||1,o=Math.ceil(e.length/i.items_per_page),a=(n-1)*i.items_per_page,r=a+i.items_per_page;return{entities:e.slice(a,r),currentPage:n,totalPages:o}}getEntityDisplayInfo(e,i,t){var n,o,a,r;const l=null===(n=null==i?void 0:i.states)||void 0===n?void 0:n[e.entity],s=e.custom_name||(null===(o=null==l?void 0:l.attributes)||void 0===o?void 0:o.friendly_name)||e.entity.split(".")[1]||e.entity,d=(null==l?void 0:l.state)||"unavailable",c=e.custom_icon||(null===(a=null==l?void 0:l.attributes)||void 0===a?void 0:a.icon)||this.getDefaultIcon(e.entity),u=["on","open","playing","home","active"].includes(d.toLowerCase());return{name:s,state:d,icon:c,isOn:u,isUnavailable:"unavailable"===d||"unknown"===d,entityPicture:e.custom_icon?null:(null===(r=null==l?void 0:l.attributes)||void 0===r?void 0:r.entity_picture)||null}}getDefaultIcon(e){return{light:"mdi:lightbulb",switch:"mdi:toggle-switch",sensor:"mdi:eye",binary_sensor:"mdi:checkbox-marked-circle",climate:"mdi:thermostat",cover:"mdi:window-shutter",fan:"mdi:fan",lock:"mdi:lock",media_player:"mdi:cast",vacuum:"mdi:robot-vacuum",camera:"mdi:video",automation:"mdi:robot",script:"mdi:script",scene:"mdi:palette",input_boolean:"mdi:toggle-switch-outline",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",person:"mdi:account",device_tracker:"mdi:crosshairs-gps",weather:"mdi:weather-partly-cloudy",sun:"mdi:white-balance-sunny",zone:"mdi:map-marker",timer:"mdi:timer",counter:"mdi:counter",alarm_control_panel:"mdi:shield-home",water_heater:"mdi:water-boiler",humidifier:"mdi:air-humidifier"}[e.split(".")[0]]||"mdi:help-circle"}getIconColor(e,i,t,n){var o,a,r;if(e.custom_color)return e.custom_color;if(e.state_colors){const i=null===(r=null===(a=null===(o=this._hass)||void 0===o?void 0:o.states)||void 0===a?void 0:a[e.entity])||void 0===r?void 0:r.state;if(i&&e.state_colors[i])return e.state_colors[i]}return t?n.global_unavailable_color||"var(--disabled-color)":i?n.global_on_color||n.global_icon_color||"var(--state-active-color)":n.global_off_color||n.global_icon_color||"var(--primary-color)"}getSmartDefaultAction(e,i){var t;const n=e.split(".")[0];if(null===(t=null==i?void 0:i.states)||void 0===t||t[e],["light","switch","fan","input_boolean","automation","script","scene","cover","lock","vacuum","media_player","climate","humidifier","water_heater"].includes(n))return{action:"toggle",entity:e};switch(n){case"button":case"input_button":return{action:"perform-action",perform_action:"button.press",target:{entity_id:e}};case"script":return{action:"perform-action",perform_action:"script.turn_on",target:{entity_id:e}};case"scene":return{action:"perform-action",perform_action:"scene.turn_on",target:{entity_id:e}};default:return{action:"more-info",entity:e}}}getGestureState(e){return this._gestureState.has(e)||this._gestureState.set(e,{holdTimeout:null,clickTimeout:null,isHolding:!1,clickCount:0,lastClickTime:0}),this._gestureState.get(e)}resolveAction(e,i,t,n){let o;if(i.override_actions&&("tap"===e&&i.tap_action?o=i.tap_action:"hold"===e&&i.hold_action?o=i.hold_action:"double_tap"===e&&i.double_tap_action&&(o=i.double_tap_action)),o||("tap"===e?o=t.tap_action:"hold"===e?o=t.hold_action:"double_tap"===e&&(o=t.double_tap_action)),"default"===(null==o?void 0:o.action)&&(o="tap"===e?this.getSmartDefaultAction(i.entity,n):{action:"more-info",entity:i.entity}),!o||"nothing"===o.action||"none"===o.action)return null;const a=Object.assign({},o);return"more-info"!==a.action&&"toggle"!==a.action||a.entity||(a.entity=i.entity),a}handleItemPointerDown(e,i,t,n){e.preventDefault();const o=this.getGestureState(i.id);o.isHolding=!1,o.holdTimeout=setTimeout((()=>{o.isHolding=!0;const a=this.resolveAction("hold",i,t,n);a&&this.handleModuleAction(a,n,e.target)}),500)}handleItemPointerUp(e,i,t,n){e.preventDefault();const o=this.getGestureState(i.id);if(o.holdTimeout&&(clearTimeout(o.holdTimeout),o.holdTimeout=null),o.isHolding)return void(o.isHolding=!1);const a=Date.now();if(a-o.lastClickTime<300&&1===o.clickCount){o.clickTimeout&&(clearTimeout(o.clickTimeout),o.clickTimeout=null),o.clickCount=0;const a=this.resolveAction("double_tap",i,t,n);a&&this.handleModuleAction(a,n,e.target)}else o.clickCount=1,o.lastClickTime=a,o.clickTimeout=setTimeout((()=>{o.clickCount=0;const a=this.resolveAction("tap",i,t,n);a&&this.handleModuleAction(a,n,e.target)}),300)}handleItemPointerCancel(e){const i=this.getGestureState(e.id);i.holdTimeout&&(clearTimeout(i.holdTimeout),i.holdTimeout=null),i.isHolding=!1}renderActionsTab(e,i,t,n){return r.A.render(e,i,(e=>n(e)))}renderOtherTab(e,i,t,n){return l.X.render(e,i,(e=>n(e)))}renderGeneralTab(e,i,t,o){var r,l,s,u,p,g,m;const v=e;null===(r=null==i?void 0:i.locale)||void 0===r||r.language,this._hass=i;const h=c(v.grid_style||"style_1"),y=d.map((e=>({value:e.id,label:`${e.name} - ${e.description}`}))),_=c(v.grid_style||"style_1").supportsVariableHeight?[{value:"grid",label:"Regular Grid"},{value:"masonry",label:"Masonry"},{value:"metro",label:"Metro Tiles"}]:[{value:"grid",label:"Regular Grid"}],f=this.getAvailableDomains(i);return n.qy`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getEditorStyles()}
      </style>

      <div class="module-settings">
        <!-- Entity Selection Section -->
        <div class="settings-section">
          <div class="section-title">ENTITIES</div>

          <div class="entity-rows-container">
            ${(v.entities||[]).map(((e,t)=>this.renderEntityRow(e,t,v,i,o)))}
          </div>

          <button
            class="add-entity-btn"
            @click=${()=>{const e={id:this.generateId("grid_entity"),entity:""};o({entities:[...v.entities||[],e]}),this._expandedEntities.add(e.id)}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </button>

          <!-- Auto Filter Toggle -->
          <div style="margin-top: 24px;">
            ${this.renderSettingsSection("","",[{title:"Enable Auto Filter",description:"Automatically include entities from selected domains.",hass:i,data:{enable_auto_filter:v.enable_auto_filter||!1},schema:[this.booleanField("enable_auto_filter")],onChange:e=>o({enable_auto_filter:e.detail.value.enable_auto_filter})}])}
          </div>

          ${v.enable_auto_filter?n.qy`
                <div class="conditional-group">
                  <!-- Include Domains -->
                  <div class="field-container">
                    <div class="field-title">Include Domains</div>
                    <div class="field-description">Select domains to include in the grid.</div>
                    <div class="chips-container">
                      ${(v.include_domains||[]).map((e=>n.qy`
                          <div class="filter-chip">
                            ${e}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${()=>{o({include_domains:(v.include_domains||[]).filter((i=>i!==e))})}}
                            ></ha-icon>
                          </div>
                        `))}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${e=>{const i=e.target,t=i.value;t&&!(v.include_domains||[]).includes(t)&&o({include_domains:[...v.include_domains||[],t]}),i.value=""}}
                      >
                        <option value="">Select domain to include...</option>
                        ${f.filter((e=>!(v.include_domains||[]).includes(e))).map((e=>n.qy`<option value="${e}">${e}</option>`))}
                      </select>
                    </div>
                  </div>

                  <!-- Exclude Domains -->
                  <div class="field-container">
                    <div class="field-title">Exclude Domains</div>
                    <div class="field-description">Select domains to exclude from the grid.</div>
                    <div class="chips-container">
                      ${(v.exclude_domains||[]).map((e=>n.qy`
                          <div class="filter-chip exclude-chip">
                            ${e}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${()=>{o({exclude_domains:(v.exclude_domains||[]).filter((i=>i!==e))})}}
                            ></ha-icon>
                          </div>
                        `))}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${e=>{const i=e.target,t=i.value;t&&!(v.exclude_domains||[]).includes(t)&&o({exclude_domains:[...v.exclude_domains||[],t]}),i.value=""}}
                      >
                        <option value="">Select domain to exclude...</option>
                        ${f.filter((e=>!(v.exclude_domains||[]).includes(e))).map((e=>n.qy`<option value="${e}">${e}</option>`))}
                      </select>
                    </div>
                  </div>

                  <!-- Include Keywords -->
                  <div class="field-container">
                    <div class="field-title">Include Keywords</div>
                    <div class="field-description">Only show entities containing these words (case-insensitive).</div>
                    <div class="chips-container">
                      ${(v.include_keywords||[]).map((e=>n.qy`
                          <div class="filter-chip">
                            ${e}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${()=>{o({include_keywords:(v.include_keywords||[]).filter((i=>i!==e))})}}
                            ></ha-icon>
                          </div>
                        `))}
                    </div>
                    <div class="keyword-input-row">
                      <input
                        type="text"
                        class="keyword-input"
                        placeholder="Type keyword and press Enter..."
                        @keydown=${e=>{if("Enter"===e.key){const i=e.target,t=i.value.trim();t&&!(v.include_keywords||[]).includes(t)&&o({include_keywords:[...v.include_keywords||[],t]}),i.value=""}}}
                      />
                    </div>
                  </div>

                  <!-- Exclude Keywords -->
                  <div class="field-container">
                    <div class="field-title">Exclude Keywords</div>
                    <div class="field-description">Hide entities containing these words (case-insensitive).</div>
                    <div class="chips-container">
                      ${(v.exclude_keywords||[]).map((e=>n.qy`
                          <div class="filter-chip exclude-chip">
                            ${e}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${()=>{o({exclude_keywords:(v.exclude_keywords||[]).filter((i=>i!==e))})}}
                            ></ha-icon>
                          </div>
                        `))}
                    </div>
                    <div class="keyword-input-row">
                      <input
                        type="text"
                        class="keyword-input"
                        placeholder="Type keyword and press Enter..."
                        @keydown=${e=>{if("Enter"===e.key){const i=e.target,t=i.value.trim();t&&!(v.exclude_keywords||[]).includes(t)&&o({exclude_keywords:[...v.exclude_keywords||[],t]}),i.value=""}}}
                      />
                    </div>
                  </div>

                  <!-- Entity Count Info -->
                  <div class="info-box">
                    <ha-icon icon="mdi:information"></ha-icon>
                    <span>
                      ${this.getFilteredEntities(v,i).length} entities match your filters
                    </span>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Grid Style Section -->
        <div class="settings-section">
          <div class="section-title">GRID STYLE</div>

          ${a.U.renderFieldSection("Style Preset","Choose a visual style for your grid items.",i,{grid_style:v.grid_style||"style_1"},[a.U.select("grid_style",y)],(e=>{const i=e.detail.value.grid_style,t=c(i),n=t.supportsVariableHeight||"grid"===v.grid_display_mode?{}:{grid_display_mode:"grid"};o(Object.assign({grid_style:i,global_icon_size:t.defaultIconSize,global_font_size:t.defaultFontSize,global_padding:t.defaultPadding,global_border_radius:t.defaultBorderRadius},n))}))}

        </div>

        <!-- Layout Section -->
        <div class="settings-section">
          <div class="section-title">LAYOUT</div>

          ${a.U.renderFieldSection("Display Mode","How items are arranged in the grid.",i,{grid_display_mode:v.grid_display_mode||"grid"},[a.U.select("grid_display_mode",_)],(e=>o({grid_display_mode:e.detail.value.grid_display_mode})))}

          <div class="field-container">
            <div class="field-title">Columns (${v.columns||4})</div>
            <div class="field-description">Number of columns in the grid (1-12).</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="1"
                max="12"
                step="1"
                .value="${String(v.columns||4)}"
                @input=${e=>{const i=e.target;o({columns:parseInt(i.value,10)})}}
              />
              <input
                type="number"
                class="range-input"
                min="1"
                max="12"
                step="1"
                .value="${String(v.columns||4)}"
                @input=${e=>{const i=e.target,t=parseInt(i.value,10);!isNaN(t)&&t>=1&&t<=12&&o({columns:t})}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>o({columns:4})}
                title="Reset to default (4)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <div class="field-container">
            <div class="field-title">Mobile columns (${null!==(s=null!==(l=v.columns_mobile)&&void 0!==l?l:v.columns)&&void 0!==s?s:4})</div>
            <div class="field-description">Columns on narrow screens (≤600px). Empty = same as Columns.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="1"
                max="12"
                step="1"
                .value="${String(null!==(p=null!==(u=v.columns_mobile)&&void 0!==u?u:v.columns)&&void 0!==p?p:4)}"
                @input=${e=>{const i=e.target;o({columns_mobile:parseInt(i.value,10)})}}
              />
              <input
                type="number"
                class="range-input"
                min="1"
                max="12"
                step="1"
                .value="${String(null!==(m=null!==(g=v.columns_mobile)&&void 0!==g?g:v.columns)&&void 0!==m?m:4)}"
                @input=${e=>{const i=e.target,t=parseInt(i.value,10);!isNaN(t)&&t>=1&&t<=12&&o({columns_mobile:t})}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>o({columns_mobile:void 0})}
                title="Use same as Columns"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <div class="field-container">
            <div class="field-title">Gap (${v.gap||12}px)</div>
            <div class="field-description">Space between grid items in pixels.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="32"
                step="2"
                .value="${String(v.gap||12)}"
                @input=${e=>{const i=e.target;o({gap:parseInt(i.value,10)})}}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="32"
                step="2"
                .value="${String(v.gap||12)}"
                @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({gap:t})}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>o({gap:12})}
                title="Reset to default (12)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Sorting Section -->
        <div class="settings-section">
          <div class="section-title">SORTING & DISPLAY</div>

          ${a.U.renderFieldSection("Sort By","How to sort the grid items.",i,{sort_by:v.sort_by||"name"},[a.U.select("sort_by",[{value:"name",label:"Name"},{value:"last_updated",label:"Last Updated"},{value:"state",label:"State"},{value:"domain",label:"Domain"},{value:"custom",label:"Custom Order"}])],(e=>o({sort_by:e.detail.value.sort_by})))}

          ${this.renderSettingsSection("","",[{title:"Invert Sort Order",description:"Reverse the sort direction.",hass:i,data:{sort_direction:"desc"===v.sort_direction},schema:[this.booleanField("sort_direction")],onChange:e=>o({sort_direction:e.detail.value.sort_direction?"desc":"asc"})}])}

          <div class="field-container">
            <div class="field-title">Max Items (${v.max_items||0} = All)</div>
            <div class="field-description">Maximum number of items to display.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="100"
                step="1"
                .value="${String(v.max_items||0)}"
                @input=${e=>{const i=e.target;o({max_items:parseInt(i.value,10)})}}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                step="1"
                .value="${String(v.max_items||0)}"
                @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({max_items:t})}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>o({max_items:0})}
                title="Reset to default (0 = All)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Section -->
        <div class="settings-section">
          <div class="section-title">PAGINATION</div>

          ${this.renderSettingsSection("","",[{title:"Enable Pagination",description:"Show pagination controls.",hass:i,data:{enable_pagination:v.enable_pagination||!1},schema:[this.booleanField("enable_pagination")],onChange:e=>o({enable_pagination:e.detail.value.enable_pagination})}])}

          ${v.enable_pagination?n.qy`
                <div class="conditional-group">
                  ${a.U.renderFieldSection("Pagination Style","Type of pagination controls.",i,{pagination_style:v.pagination_style||"both"},[a.U.select("pagination_style",[{value:"numbers",label:"Page Numbers"},{value:"buttons",label:"Prev/Next Buttons"},{value:"both",label:"Both"}])],(e=>o({pagination_style:e.detail.value.pagination_style})))}

                  <div class="field-container">
                    <div class="field-title">Items Per Page (${v.items_per_page||12})</div>
                    <div class="field-description">Number of items per page.</div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="4"
                        max="48"
                        step="4"
                        .value="${String(v.items_per_page||12)}"
                        @input=${e=>{const i=e.target;o({items_per_page:parseInt(i.value,10)})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="1"
                        step="1"
                        .value="${String(v.items_per_page||12)}"
                        @input=${e=>{const i=e.target,t=parseInt(i.value,10);!isNaN(t)&&t>0&&o({items_per_page:t})}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>o({items_per_page:12})}
                        title="Reset to default (12)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Animation Section -->
        <div class="settings-section">
          <div class="section-title">ANIMATION</div>

          ${this.renderSettingsSection("","",[{title:"Enable Load Animation",description:"Animate items when they first appear.",hass:i,data:{enable_load_animation:!1!==v.enable_load_animation},schema:[this.booleanField("enable_load_animation")],onChange:e=>o({enable_load_animation:e.detail.value.enable_load_animation})}])}

          ${!1!==v.enable_load_animation?n.qy`
                <div class="conditional-group">
                  ${a.U.renderFieldSection("Animation Type","The animation effect for items.",i,{load_animation:v.load_animation||"fadeIn"},[a.U.select("load_animation",[{value:"none",label:"None"},{value:"fadeIn",label:"Fade In"},{value:"slideUp",label:"Slide Up"},{value:"slideDown",label:"Slide Down"},{value:"slideLeft",label:"Slide Left"},{value:"slideRight",label:"Slide Right"},{value:"zoomIn",label:"Zoom In"}])],(e=>o({load_animation:e.detail.value.load_animation})))}

                  <div class="field-container">
                    <div class="field-title">Animation Duration (${v.grid_animation_duration||600}ms)</div>
                    <div class="field-description">How long each animation takes.</div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="200"
                        max="2000"
                        step="100"
                        .value="${String(v.grid_animation_duration||600)}"
                        @input=${e=>{const i=e.target;o({grid_animation_duration:parseInt(i.value,10)})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="100"
                        step="50"
                        .value="${String(v.grid_animation_duration||600)}"
                        @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({grid_animation_duration:t})}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>o({grid_animation_duration:600})}
                        title="Reset to default (600)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <div class="field-container">
                    <div class="field-title">Stagger Delay (${v.animation_stagger||100}ms)</div>
                    <div class="field-description">Delay between each item's animation.</div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="0"
                        max="300"
                        step="10"
                        .value="${String(v.animation_stagger||100)}"
                        @input=${e=>{const i=e.target;o({animation_stagger:parseInt(i.value,10)})}}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="0"
                        step="10"
                        .value="${String(v.animation_stagger||100)}"
                        @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({animation_stagger:t})}}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${()=>o({animation_stagger:100})}
                        title="Reset to default (100)"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        ${this.renderGridStylingSection(v,i,h,o)}
      </div>
    `}renderGridStylingSection(e,i,t,o){return n.qy`
      <!-- Icon Styling (if style shows icons) -->
      ${t.showIcon?n.qy`
            <div class="settings-section">
              <div class="section-title">ICON STYLING</div>

              <div class="field-container">
                <div class="field-title">Icon Size (${e.global_icon_size||32}px)</div>
                <div class="field-description">Size of icons in pixels.</div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="16"
                    max="72"
                    step="2"
                    .value="${String(e.global_icon_size||32)}"
                    @input=${e=>{const i=e.target;o({global_icon_size:parseInt(i.value,10)})}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="12"
                    max="100"
                    step="1"
                    .value="${String(e.global_icon_size||32)}"
                    @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({global_icon_size:t})}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>o({global_icon_size:t.defaultIconSize})}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <div class="color-field">
                <div class="field-title">Icon Color (Default)</div>
                <div class="field-description">Default color for icons.</div>
                <ultra-color-picker
                  .hass=${i}
                  .value=${e.global_icon_color||"var(--primary-color)"}
                  @value-changed=${e=>{o({global_icon_color:e.detail.value})}}
                ></ultra-color-picker>
              </div>

              <div class="color-field">
                <div class="field-title">Active/On Color</div>
                <div class="field-description">Color when entity is on/active.</div>
                <ultra-color-picker
                  .hass=${i}
                  .value=${e.global_on_color||"var(--state-active-color)"}
                  @value-changed=${e=>{o({global_on_color:e.detail.value})}}
                ></ultra-color-picker>
              </div>

              <div class="color-field">
                <div class="field-title">Inactive/Off Color</div>
                <div class="field-description">Color when entity is off/inactive.</div>
                <ultra-color-picker
                  .hass=${i}
                  .value=${e.global_off_color||"var(--secondary-text-color)"}
                  @value-changed=${e=>{o({global_off_color:e.detail.value})}}
                ></ultra-color-picker>
              </div>

              <div class="color-field">
                <div class="field-title">Unavailable Color</div>
                <div class="field-description">Color when entity is unavailable.</div>
                <ultra-color-picker
                  .hass=${i}
                  .value=${e.global_unavailable_color||"var(--disabled-color)"}
                  @value-changed=${e=>{o({global_unavailable_color:e.detail.value})}}
                ></ultra-color-picker>
              </div>
            </div>
          `:""}

      <!-- Text Styling (if style shows name or state) -->
      ${t.showName||t.showState?n.qy`
            <div class="settings-section">
              <div class="section-title">TEXT STYLING</div>

              <div class="field-container">
                <div class="field-title">Font Size (${e.global_font_size||12}px)</div>
                <div class="field-description">Base font size for text.</div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="10"
                    max="24"
                    step="1"
                    .value="${String(e.global_font_size||12)}"
                    @input=${e=>{const i=e.target;o({global_font_size:parseInt(i.value,10)})}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="8"
                    max="36"
                    step="1"
                    .value="${String(e.global_font_size||12)}"
                    @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({global_font_size:t})}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>o({global_font_size:t.defaultFontSize})}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              ${t.showName?n.qy`
                    <div class="color-field">
                      <div class="field-title">Name Color</div>
                      <div class="field-description">Color for entity names.</div>
                      <ultra-color-picker
                        .hass=${i}
                        .value=${e.global_name_color||"var(--primary-text-color)"}
                        @value-changed=${e=>{o({global_name_color:e.detail.value})}}
                      ></ultra-color-picker>
                    </div>
                  `:""}

              ${t.showState?n.qy`
                    <div class="color-field">
                      <div class="field-title">State Color</div>
                      <div class="field-description">Color for state text.</div>
                      <ultra-color-picker
                        .hass=${i}
                        .value=${e.global_state_color||"var(--secondary-text-color)"}
                        @value-changed=${e=>{o({global_state_color:e.detail.value})}}
                      ></ultra-color-picker>
                    </div>
                  `:""}
            </div>
          `:""}

      <!-- Item Styling -->
      <div class="settings-section">
        <div class="section-title">ITEM STYLING</div>

        <div class="color-field">
          <div class="field-title">Item Background</div>
          <div class="field-description">Background color for grid items.</div>
          <ultra-color-picker
            .hass=${i}
            .value=${e.global_background_color||"var(--card-background-color)"}
            @value-changed=${e=>{o({global_background_color:e.detail.value})}}
          ></ultra-color-picker>
        </div>

        ${a.U.renderFieldSection("Border Radius","Corner rounding for items (e.g., 8px or 50% for circles).",i,{global_border_radius:e.global_border_radius||"12px"},[a.U.text("global_border_radius")],(e=>o({global_border_radius:e.detail.value.global_border_radius})))}

        ${a.U.renderFieldSection("Item Padding","Inner spacing for items (e.g., 16px or 12px 16px).",i,{global_padding:e.global_padding||"16px"},[a.U.text("global_padding")],(e=>o({global_padding:e.detail.value.global_padding})))}

        <div class="field-container">
          <div class="field-title">Border Width (${e.global_border_width||0}px)</div>
          <div class="field-description">Border thickness in pixels.</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="4"
              step="1"
              .value="${String(e.global_border_width||0)}"
              @input=${e=>{const i=e.target;o({global_border_width:parseInt(i.value,10)})}}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="10"
              step="1"
              .value="${String(e.global_border_width||0)}"
              @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({global_border_width:t})}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>o({global_border_width:0})}
              title="Reset to default (0)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        ${(e.global_border_width||0)>0?n.qy`
              <div class="color-field" style="margin-top: 12px;">
                <div class="field-title">Border Color</div>
                <div class="field-description">Color for item borders.</div>
                <ultra-color-picker
                  .hass=${i}
                  .value=${e.global_border_color||"var(--divider-color)"}
                  @value-changed=${e=>{o({global_border_color:e.detail.value})}}
                ></ultra-color-picker>
              </div>
            `:""}
      </div>

      <!-- Style-Specific Colors -->
      ${this.renderStyleSpecificColors(e,i,t,o)}

      <!-- Hover Effects -->
      <div class="settings-section">
        <div class="section-title">HOVER EFFECTS</div>

        ${this.renderSettingsSection("","",[{title:"Enable Hover Effect",description:"Add visual feedback on hover.",hass:i,data:{enable_hover_effect:!1!==e.enable_hover_effect},schema:[this.booleanField("enable_hover_effect")],onChange:e=>o({enable_hover_effect:e.detail.value.enable_hover_effect})}])}

        ${!1!==e.enable_hover_effect?n.qy`
              <div class="conditional-group">
                ${a.U.renderFieldSection("Hover Effect","Type of hover animation.",i,{hover_effect:e.hover_effect||"scale"},[a.U.select("hover_effect",[{value:"none",label:"None"},{value:"scale",label:"Scale"},{value:"glow",label:"Glow"},{value:"lift",label:"Lift"},{value:"color",label:"Color Change"}])],(e=>o({hover_effect:e.detail.value.hover_effect})))}

                ${"scale"===e.hover_effect?n.qy`
                      <div class="field-container">
                        <div class="field-title">Scale Amount (${e.hover_scale||1.05}x)</div>
                        <div class="field-description">How much to scale on hover.</div>
                        <div class="number-range-control">
                          <input
                            type="range"
                            class="range-slider"
                            min="1"
                            max="1.2"
                            step="0.01"
                            .value="${String(e.hover_scale||1.05)}"
                            @input=${e=>{const i=e.target;o({hover_scale:parseFloat(i.value)})}}
                          />
                          <input
                            type="number"
                            class="range-input"
                            min="1"
                            max="1.5"
                            step="0.01"
                            .value="${String(e.hover_scale||1.05)}"
                            @input=${e=>{const i=e.target,t=parseFloat(i.value);isNaN(t)||o({hover_scale:t})}}
                          />
                          <button
                            class="range-reset-btn"
                            @click=${()=>o({hover_scale:1.05})}
                            title="Reset to default (1.05)"
                          >
                            <ha-icon icon="mdi:refresh"></ha-icon>
                          </button>
                        </div>
                      </div>
                    `:""}

                ${"color"===e.hover_effect?n.qy`
                      <div class="color-field">
                        <div class="field-title">Hover Background Color</div>
                        <div class="field-description">Background color on hover.</div>
                        <ultra-color-picker
                          .hass=${i}
                          .value=${e.hover_background_color||"var(--primary-color)"}
                          @value-changed=${e=>{o({hover_background_color:e.detail.value})}}
                        ></ultra-color-picker>
                      </div>
                    `:""}

                ${"glow"===e.hover_effect?n.qy`
                      <div class="color-field">
                        <div class="field-title">Glow Color</div>
                        <div class="field-description">Color of the glow effect.</div>
                        <ultra-color-picker
                          .hass=${i}
                          .value=${e.hover_glow_color||"var(--primary-color)"}
                          @value-changed=${e=>{o({hover_glow_color:e.detail.value})}}
                        ></ultra-color-picker>
                      </div>
                    `:""}
              </div>
            `:""}
      </div>
    `}renderEntitiesTab(e,i,t,o){var r;const l=e,s=(null===(r=null==i?void 0:i.locale)||void 0===r||r.language,this.getAvailableDomains(i));return n.qy`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getEditorStyles()}
      </style>

      <div class="module-settings">
        <!-- Manual Entity Selection -->
        <div class="settings-section">
          <div class="section-title">ENTITIES</div>

          <div class="entity-rows-container">
            ${(l.entities||[]).map(((e,t)=>this.renderEntityRow(e,t,l,i,o)))}
          </div>

          <button
            class="add-entity-btn"
            @click=${()=>{const e={id:this.generateId("grid_entity"),entity:""};o({entities:[...l.entities||[],e]}),this._expandedEntities.add(e.id)}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </button>
        </div>

        <!-- Auto Filter Section -->
        <div class="settings-section">
          <div class="section-title">AUTO FILTER</div>

          ${this.renderSettingsSection("","",[{title:"Enable Auto Filter",description:"Automatically include entities from selected domains.",hass:i,data:{enable_auto_filter:l.enable_auto_filter||!1},schema:[this.booleanField("enable_auto_filter")],onChange:e=>o({enable_auto_filter:e.detail.value.enable_auto_filter})}])}

          ${l.enable_auto_filter?n.qy`
                <div class="conditional-group">
                  <!-- Include Domains -->
                  <div class="field-container">
                    <div class="field-title">Include Domains</div>
                    <div class="field-description">Select domains to include in the grid.</div>
                    <div class="chips-container">
                      ${(l.include_domains||[]).map((e=>n.qy`
                          <div class="filter-chip">
                            ${e}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${()=>{o({include_domains:(l.include_domains||[]).filter((i=>i!==e))})}}
                            ></ha-icon>
                          </div>
                        `))}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${e=>{const i=e.target,t=i.value;t&&!(l.include_domains||[]).includes(t)&&o({include_domains:[...l.include_domains||[],t]}),i.value=""}}
                      >
                        <option value="">Select domain...</option>
                        ${s.filter((e=>!(l.include_domains||[]).includes(e))).map((e=>n.qy`<option value="${e}">${e}</option>`))}
                      </select>
                    </div>
                  </div>

                  <!-- Exclude Domains -->
                  <div class="field-container">
                    <div class="field-title">Exclude Domains</div>
                    <div class="field-description">Select domains to exclude from the grid.</div>
                    <div class="chips-container">
                      ${(l.exclude_domains||[]).map((e=>n.qy`
                          <div class="filter-chip exclude-chip">
                            ${e}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${()=>{o({exclude_domains:(l.exclude_domains||[]).filter((i=>i!==e))})}}
                            ></ha-icon>
                          </div>
                        `))}
                    </div>
                    <div class="domain-input-row">
                      <select
                        class="domain-select"
                        @change=${e=>{const i=e.target,t=i.value;t&&!(l.exclude_domains||[]).includes(t)&&o({exclude_domains:[...l.exclude_domains||[],t]}),i.value=""}}
                      >
                        <option value="">Select domain...</option>
                        ${s.filter((e=>!(l.exclude_domains||[]).includes(e))).map((e=>n.qy`<option value="${e}">${e}</option>`))}
                      </select>
                    </div>
                  </div>

                  <!-- Exclude Entities -->
                  <div class="field-container">
                    <div class="field-title">Exclude Specific Entities</div>
                    <div class="field-description">Exclude specific entities from the grid.</div>
                    <div class="chips-container">
                      ${(l.exclude_entities||[]).map((e=>n.qy`
                          <div class="filter-chip exclude-chip">
                            ${e.split(".")[1]||e}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${()=>{o({exclude_entities:(l.exclude_entities||[]).filter((i=>i!==e))})}}
                            ></ha-icon>
                          </div>
                        `))}
                    </div>
                    ${a.U.renderFieldSection("","",i,{exclude_entity:""},[a.U.entity("exclude_entity")],(e=>{const i=e.detail.value.exclude_entity;i&&!(l.exclude_entities||[]).includes(i)&&o({exclude_entities:[...l.exclude_entities||[],i]})}))}
                  </div>

                  <!-- Entity Count -->
                  <div class="info-box">
                    <ha-icon icon="mdi:information"></ha-icon>
                    <span>
                      ${this.getFilteredEntities(l,i).length} entities match your filters
                    </span>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}renderEntityRow(e,i,t,o,r){var l,s,d;const c=this._expandedEntities.has(e.id),u=null===(l=null==o?void 0:o.states)||void 0===l?void 0:l[e.entity],p=e.custom_name||(null===(s=null==u?void 0:u.attributes)||void 0===s?void 0:s.friendly_name)||e.entity||"No entity";return n.qy`
      <div
        class="entity-row ${(null===(d=this._draggedItem)||void 0===d?void 0:d.id)===e.id?"dragging":""}"
        draggable="true"
        @dragstart=${i=>{var t;this._draggedItem=e,null===(t=i.dataTransfer)||void 0===t||t.setData("text/plain",e.id)}}
        @dragend=${()=>{this._draggedItem=null}}
        @dragover=${e=>{e.preventDefault(),e.currentTarget.classList.add("drag-over")}}
        @dragleave=${e=>{e.currentTarget.classList.remove("drag-over")}}
        @drop=${i=>{if(i.preventDefault(),i.currentTarget.classList.remove("drag-over"),this._draggedItem&&this._draggedItem.id!==e.id){const i=[...t.entities||[]],n=i.findIndex((e=>e.id===this._draggedItem.id)),o=i.findIndex((i=>i.id===e.id));if(-1!==n&&-1!==o){const[e]=i.splice(n,1);i.splice(o,0,e),r({entities:i})}}}}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <div class="entity-info ${e.entity?"":"no-entity"}">
          ${p}
        </div>
        <ha-icon
          icon="${c?"mdi:chevron-up":"mdi:chevron-down"}"
          class="expand-icon ${c?"expanded":""}"
          @click=${()=>{c?this._expandedEntities.delete(e.id):this._expandedEntities.add(e.id),this.triggerPreviewUpdate()}}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${()=>{r({entities:(t.entities||[]).filter((i=>i.id!==e.id))})}}
        ></ha-icon>
      </div>

      ${c?n.qy`
            <div class="entity-settings">
              ${a.U.renderFieldSection("Entity","Select the entity to display.",o,{entity:e.entity||""},[a.U.entity("entity")],(i=>{const n=[...t.entities||[]],o=n.findIndex((i=>i.id===e.id));-1!==o&&(n[o]=Object.assign(Object.assign({},n[o]),{entity:i.detail.value.entity}),r({entities:n}))}))}

              ${a.U.renderFieldSection("Custom Name","Override the entity display name.",o,{custom_name:e.custom_name||""},[a.U.text("custom_name")],(i=>{const n=[...t.entities||[]],o=n.findIndex((i=>i.id===e.id));-1!==o&&(n[o]=Object.assign(Object.assign({},n[o]),{custom_name:i.detail.value.custom_name}),r({entities:n}))}))}

              ${a.U.renderFieldSection("Custom Icon","Override the entity icon.",o,{custom_icon:e.custom_icon||""},[a.U.icon("custom_icon")],(i=>{const n=[...t.entities||[]],o=n.findIndex((i=>i.id===e.id));-1!==o&&(n[o]=Object.assign(Object.assign({},n[o]),{custom_icon:i.detail.value.custom_icon}),r({entities:n}))}))}

              <div class="color-field">
                <div class="field-title">Custom Color</div>
                <div class="field-description">Override the icon color.</div>
                <ultra-color-picker
                  .hass=${o}
                  .value=${e.custom_color||""}
                  @value-changed=${i=>{const n=[...t.entities||[]],o=n.findIndex((i=>i.id===e.id));-1!==o&&(n[o]=Object.assign(Object.assign({},n[o]),{custom_color:i.detail.value}),r({entities:n}))}}
                ></ultra-color-picker>
              </div>

              ${"metro"===t.grid_display_mode?n.qy`
                    ${a.U.renderFieldSection("Metro Size","Size of this tile in metro mode.",o,{metro_size:e.metro_size||"small"},[a.U.select("metro_size",[{value:"small",label:"Small (1x1)"},{value:"medium",label:"Medium (2x1)"},{value:"large",label:"Large (2x2)"}])],(i=>{const n=[...t.entities||[]],o=n.findIndex((i=>i.id===e.id));-1!==o&&(n[o]=Object.assign(Object.assign({},n[o]),{metro_size:i.detail.value.metro_size}),r({entities:n}))}))}
                  `:""}

              ${this.renderSettingsSection("","",[{title:"Override Actions",description:"Use custom actions for this item.",hass:o,data:{override_actions:e.override_actions||!1},schema:[this.booleanField("override_actions")],onChange:i=>{const n=i.detail.value.override_actions;n||this._entityActionStates.delete(e.id);const o=[...t.entities||[]],a=o.findIndex((i=>i.id===e.id));-1!==a&&(o[a]=Object.assign(Object.assign({},o[a]),{override_actions:n}),r({entities:o}))}}])}

              ${e.override_actions?(()=>{let i=this._entityActionStates.get(e.id);return i||(i={tap_action:e.tap_action||{action:"toggle"},hold_action:e.hold_action||{action:"more-info"},double_tap_action:e.double_tap_action||{action:"none"}},this._entityActionStates.set(e.id,i)),n.qy`
                    <div class="entity-actions-override">
                      <div class="entity-action-info">
                        <ha-icon icon="mdi:information-outline"></ha-icon>
                        <span>Override the default domain-based actions for this entity.</span>
                      </div>
                      
                      <!-- Tap Action -->
                      <div class="entity-action-field">
                        <ha-form
                          .hass=${o}
                          .data=${{tap_action:i.tap_action}}
                          .schema=${[{name:"tap_action",selector:{ui_action:{}}}]}
                          .computeLabel=${()=>"Tap Action"}
                          @value-changed=${i=>{const n=i.detail.value.tap_action,o=this._entityActionStates.get(e.id)||{};o.tap_action=n,this._entityActionStates.set(e.id,o);const a=[...t.entities||[]],l=a.findIndex((i=>i.id===e.id));-1!==l&&(a[l]=Object.assign(Object.assign({},a[l]),{tap_action:n}),r({entities:a}))}}
                        ></ha-form>
                      </div>
                      
                      <!-- Hold Action -->
                      <div class="entity-action-field">
                        <ha-form
                          .hass=${o}
                          .data=${{hold_action:i.hold_action}}
                          .schema=${[{name:"hold_action",selector:{ui_action:{}}}]}
                          .computeLabel=${()=>"Hold Action"}
                          @value-changed=${i=>{const n=i.detail.value.hold_action,o=this._entityActionStates.get(e.id)||{};o.hold_action=n,this._entityActionStates.set(e.id,o);const a=[...t.entities||[]],l=a.findIndex((i=>i.id===e.id));-1!==l&&(a[l]=Object.assign(Object.assign({},a[l]),{hold_action:n}),r({entities:a}))}}
                        ></ha-form>
                      </div>
                      
                      <!-- Double Tap Action -->
                      <div class="entity-action-field">
                        <ha-form
                          .hass=${o}
                          .data=${{double_tap_action:i.double_tap_action}}
                          .schema=${[{name:"double_tap_action",selector:{ui_action:{}}}]}
                          .computeLabel=${()=>"Double Tap Action"}
                          @value-changed=${i=>{const n=i.detail.value.double_tap_action,o=this._entityActionStates.get(e.id)||{};o.double_tap_action=n,this._entityActionStates.set(e.id,o);const a=[...t.entities||[]],l=a.findIndex((i=>i.id===e.id));-1!==l&&(a[l]=Object.assign(Object.assign({},a[l]),{double_tap_action:n}),r({entities:a}))}}
                        ></ha-form>
                      </div>
                    </div>
                  `})():""}

              <!-- Spacer between sections -->
              <div class="entity-section-spacer"></div>

              <!-- Conditional Display Logic -->
              ${this.renderSettingsSection("","",[{title:"Conditional Display",description:"Control when this entity is shown based on conditions.",hass:o,data:{has_logic:e.display_mode&&"always"!==e.display_mode||!1},schema:[this.booleanField("has_logic")],onChange:i=>{const n=[...t.entities||[]],o=n.findIndex((i=>i.id===e.id));-1!==o&&(n[o]=Object.assign(Object.assign({},n[o]),{display_mode:i.detail.value.has_logic?"every":"always",display_conditions:i.detail.value.has_logic&&n[o].display_conditions||[]}),r({entities:n}))}}])}

              ${e.display_mode&&"always"!==e.display_mode?n.qy`
                    <div class="conditional-group">
                      ${a.U.renderFieldSection("Display Mode","When multiple conditions exist, show this entity if...",o,{display_mode:e.display_mode||"every"},[a.U.select("display_mode",[{value:"every",label:"EVERY condition is met"},{value:"any",label:"ANY condition is met"}])],(i=>{const n=[...t.entities||[]],o=n.findIndex((i=>i.id===e.id));-1!==o&&(n[o]=Object.assign(Object.assign({},n[o]),{display_mode:i.detail.value.display_mode}),r({entities:n}))}))}

                      <div class="entity-conditions-list">
                        <div style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;">
                          <div style="font-size: 14px; font-weight: 600;">Conditions</div>
                          <button
                            class="add-condition-btn"
                            @click=${()=>{const i=[...t.entities||[]],n=i.findIndex((i=>i.id===e.id));if(-1!==n){const e={id:`cond_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,type:"entity_state",entity:"",operator:"=",value:""};i[n]=Object.assign(Object.assign({},i[n]),{display_conditions:[...i[n].display_conditions||[],e]}),r({entities:i})}}}
                            style="display:flex; align-items:center; gap:6px; padding:4px 8px; border:1px dashed var(--primary-color); background:none; color:var(--primary-color); border-radius:4px; cursor:pointer; font-size: 12px;"
                          >
                            <ha-icon icon="mdi:plus" style="--mdc-icon-size: 14px;"></ha-icon>
                            Add
                          </button>
                        </div>

                        ${0===(e.display_conditions||[]).length?n.qy`<div style="text-align: center; padding: 12px; color: var(--secondary-text-color); font-style: italic; font-size: 12px;">
                              No conditions. Add one to control visibility.
                            </div>`:""}

                        ${(e.display_conditions||[]).map(((i,n)=>this.renderEntityCondition(e,i,n,t,o,r)))}
                      </div>
                    </div>
                  `:""}
            </div>
          `:""}
    `}renderEntityCondition(e,i,t,o,r,l){const s=n=>{const a=[...o.entities||[]],r=a.findIndex((i=>i.id===e.id));if(-1!==r){const e=[...a[r].display_conditions||[]];e[t]=Object.assign(Object.assign({},i),n),a[r]=Object.assign(Object.assign({},a[r]),{display_conditions:e}),l({entities:a})}};return n.qy`
      <div class="entity-condition-item">
        <div class="entity-condition-header">
          <span class="entity-condition-label">Condition ${t+1}</span>
          <ha-icon
            icon="mdi:delete"
            class="entity-condition-delete"
            @click=${()=>{const i=[...o.entities||[]],n=i.findIndex((i=>i.id===e.id));if(-1!==n){const e=(i[n].display_conditions||[]).filter(((e,i)=>i!==t));i[n]=Object.assign(Object.assign({},i[n]),{display_conditions:e}),l({entities:i})}}}
          ></ha-icon>
        </div>

        ${a.U.renderFieldSection("Type","",r,{type:i.type||"entity_state"},[a.U.select("type",[{value:"entity_state",label:"Entity State"},{value:"entity_attribute",label:"Entity Attribute"},{value:"template",label:"Template"},{value:"time",label:"Time Range"}])],(e=>{const i=e.detail.value.type,t={type:i};"entity_state"===i?Object.assign(t,{entity:"",operator:"=",value:""}):"entity_attribute"===i?Object.assign(t,{entity:"",attribute:"",operator:"=",value:""}):"time"===i?Object.assign(t,{time_from:"00:00",time_to:"23:59"}):"template"===i&&Object.assign(t,{template:""}),s(t)}))}

        ${"entity_state"!==i.type&&i.type?"":n.qy`
              ${a.U.renderFieldSection("Entity","",r,{entity:i.entity||""},[a.U.entity("entity")],(e=>s(e.detail.value)))}
              ${a.U.renderFieldSection("Operator","",r,{operator:i.operator||"="},[a.U.select("operator",[{value:"=",label:"="},{value:"!=",label:"!="},{value:">",label:">"},{value:">=",label:">="},{value:"<",label:"<"},{value:"<=",label:"<="},{value:"contains",label:"contains"},{value:"not_contains",label:"not_contains"},{value:"has_value",label:"has_value"},{value:"no_value",label:"no_value"}])],(e=>s(e.detail.value)))}
              ${a.U.renderFieldSection("Value","",r,{value:i.value||""},[a.U.text("value")],(e=>s(e.detail.value)))}
            `}

        ${"entity_attribute"===i.type?n.qy`
              ${a.U.renderFieldSection("Entity","",r,{entity:i.entity||""},[a.U.entity("entity")],(e=>s(e.detail.value)))}
              ${a.U.renderFieldSection("Attribute","",r,{attribute:i.attribute||""},[a.U.text("attribute")],(e=>s(e.detail.value)))}
              ${a.U.renderFieldSection("Operator","",r,{operator:i.operator||"="},[a.U.select("operator",[{value:"=",label:"="},{value:"!=",label:"!="},{value:">",label:">"},{value:">=",label:">="},{value:"<",label:"<"},{value:"<=",label:"<="},{value:"contains",label:"contains"},{value:"not_contains",label:"not_contains"}])],(e=>s(e.detail.value)))}
              ${a.U.renderFieldSection("Value","",r,{value:i.value||""},[a.U.text("value")],(e=>s(e.detail.value)))}
            `:""}

        ${"time"===i.type?n.qy`
              ${a.U.renderFieldSection("From","Time in HH:MM format (e.g., 08:00)",r,{time_from:i.time_from||"00:00"},[a.U.text("time_from")],(e=>s(e.detail.value)))}
              ${a.U.renderFieldSection("To","Time in HH:MM format (e.g., 22:00)",r,{time_to:i.time_to||"23:59"},[a.U.text("time_to")],(e=>s(e.detail.value)))}
            `:""}

        ${"template"===i.type?n.qy`
              ${a.U.renderFieldSection("Template","Jinja2 template that evaluates to true/false",r,{template:i.template||""},[a.U.text("template")],(e=>s(e.detail.value)))}
            `:""}
      </div>
    `}renderStyleSpecificColors(e,i,t,o){const r=e.grid_style||"style_1",l="style_16"===r,s="style_17"===r,d="style_15"===r,c="style_18"===r,u="style_19"===r,p="style_20"===r,g="style_11"===r,m=l||s||d||c||u||p||g;return n.qy`
      <div class="settings-section">
        <div class="section-title">STYLE COLORS</div>
        <div class="style-info">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span>Customize colors for the <strong>${t.name}</strong> style</span>
        </div>

        <!-- If no style-specific options, show info message -->
        ${m?"":n.qy`
          <div class="info-box" style="margin-top: 0;">
            <ha-icon icon="mdi:information-outline"></ha-icon>
            <span>This style uses the standard colors from the sections above. Try <strong>Glass</strong>, <strong>Gradient</strong>, or <strong>Panel</strong> styles for additional color options.</span>
          </div>
        `}

        <!-- Glass Style (style_16) -->
        ${l?n.qy`
          <div class="color-field">
            <div class="field-title">Glass Tint Color</div>
            <div class="field-description">Background tint for the glass effect.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.glass_tint_color||"rgba(255, 255, 255, 0.1)"}
              @value-changed=${e=>{o({glass_tint_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Glass Border Color</div>
            <div class="field-description">Border color for the glass effect.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.glass_border_color||"rgba(255, 255, 255, 0.2)"}
              @value-changed=${e=>{o({glass_border_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="field-container">
            <div class="field-title">Blur Amount (${e.glass_blur_amount||10}px)</div>
            <div class="field-description">Intensity of the blur effect.</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="30"
                step="1"
                .value="${String(e.glass_blur_amount||10)}"
                @input=${e=>{const i=e.target;o({glass_blur_amount:parseInt(i.value,10)})}}
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="50"
                step="1"
                .value="${String(e.glass_blur_amount||10)}"
                @input=${e=>{const i=e.target,t=parseInt(i.value,10);isNaN(t)||o({glass_blur_amount:t})}}
              />
              <button
                class="range-reset-btn"
                @click=${()=>o({glass_blur_amount:10})}
                title="Reset to default (10)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        `:""}

        <!-- Gradient Style (style_17) -->
        ${s?n.qy`
          <div class="color-field">
            <div class="field-title">Gradient Start Color</div>
            <div class="field-description">Starting color of the gradient.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.gradient_start_color||"#6666FF"}
              @value-changed=${e=>{o({gradient_start_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Gradient End Color</div>
            <div class="field-description">Ending color of the gradient.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.gradient_end_color||"#000070"}
              @value-changed=${e=>{o({gradient_end_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          ${a.U.renderFieldSection("Gradient Direction","Direction of the gradient flow.",i,{gradient_direction:e.gradient_direction||"to-bottom-right"},[a.U.select("gradient_direction",[{value:"to-bottom",label:"Top to Bottom"},{value:"to-right",label:"Left to Right"},{value:"to-bottom-right",label:"Diagonal (↘)"},{value:"to-bottom-left",label:"Diagonal (↙)"}])],(e=>o({gradient_direction:e.detail.value.gradient_direction})))}
        `:""}

        <!-- Panel Style (style_15) -->
        ${d?n.qy`
          <div class="color-field">
            <div class="field-title">Header Background</div>
            <div class="field-description">Background color for the header bar.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.panel_header_color||"var(--primary-color)"}
              @value-changed=${e=>{o({panel_header_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Header Text Color</div>
            <div class="field-description">Text color in the header bar.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.panel_header_text_color||"#ffffff"}
              @value-changed=${e=>{o({panel_header_text_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>
        `:""}

        <!-- Split Style (style_18) -->
        ${c?n.qy`
          <div class="color-field">
            <div class="field-title">Left Side Color</div>
            <div class="field-description">Color for the left side of the split.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.split_left_color||"var(--primary-color)"}
              @value-changed=${e=>{o({split_left_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Right Side Color</div>
            <div class="field-description">Color for the right side of the split.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.split_right_color||"var(--card-background-color)"}
              @value-changed=${e=>{o({split_right_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>
        `:""}

        <!-- Neumorphic Style (style_19) -->
        ${u?n.qy`
          <div class="color-field">
            <div class="field-title">Light Shadow Color</div>
            <div class="field-description">Color for the light (highlight) shadow.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.neumorphic_light_shadow||"rgba(255, 255, 255, 0.1)"}
              @value-changed=${e=>{o({neumorphic_light_shadow:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="color-field">
            <div class="field-title">Dark Shadow Color</div>
            <div class="field-description">Color for the dark shadow.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.neumorphic_dark_shadow||"rgba(0, 0, 0, 0.15)"}
              @value-changed=${e=>{o({neumorphic_dark_shadow:e.detail.value})}}
            ></ultra-color-picker>
          </div>
        `:""}

        <!-- Accent Border Style (style_20) -->
        ${p?n.qy`
          <div class="color-field">
            <div class="field-title">Accent Border Color</div>
            <div class="field-description">Color for the accent border on the left side.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.accent_border_color||"var(--primary-color)"}
              @value-changed=${e=>{o({accent_border_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>
        `:""}

        <!-- Card Style (style_11) -->
        ${g?n.qy`
          <div class="color-field">
            <div class="field-title">Shadow Color</div>
            <div class="field-description">Color for the card shadow.</div>
            <ultra-color-picker
              .hass=${i}
              .value=${e.card_shadow_color||"rgba(0, 0, 0, 0.1)"}
              @value-changed=${e=>{o({card_shadow_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>
        `:""}
      </div>
    `}renderPreview(e,i,t,o){const a=e;this._hass=i;let r=this.getFilteredEntities(a,i);r=this.sortEntities(r,a.sort_by,a.sort_direction,i),a.max_items&&a.max_items>0&&(r=r.slice(0,a.max_items));const{entities:l,currentPage:s,totalPages:d}=this.getPaginatedEntities(r,a,a.id),u=c(a.grid_style||"style_1"),p=!1!==a.enable_load_animation&&"none"!==a.load_animation,g=this.buildGridStyles(a),m="metro"===a.grid_display_mode?this.calculateMetroSizes(l.length,a.columns||4):void 0;let v;return"live"===o||"ha-preview"===o?v=Date.now():(this._animationStartTimes.has(a.id)||this._animationStartTimes.set(a.id,Date.now()),v=this._animationStartTimes.get(a.id)),n.qy`
      <style>
        ${this.getStyles()}
      </style>
      <div 
        class="uc-grid-container uc-grid-mode-${a.grid_display_mode||"grid"}" 
        data-mode="${a.grid_display_mode||"grid"}"
        data-animation-key="${v}"
        style="${g}"
      >
        ${l.length>0?l.map(((e,t)=>this.renderGridItem(e,t,a,i,u,p,m))):n.qy`
              <div class="grid-empty-state">
                <ha-icon icon="mdi:view-grid-plus"></ha-icon>
                <span>No entities configured</span>
              </div>
            `}
      </div>
      ${a.enable_pagination&&d>1?this.renderPaginationControls(s,d,a):""}
    `}buildGridStyles(e){var i;const t=e.gap||12,n=e.columns||4,o=null!==(i=e.columns_mobile)&&void 0!==i?i:n;let a=`display: grid; gap: ${t}px; width: 100%; --uc-grid-columns: ${n}; --uc-grid-columns-mobile: ${o};`;switch(e.grid_display_mode){case"masonry":a+=`grid-template-columns: repeat(${n}, minmax(0, 1fr)); grid-auto-rows: 80px; grid-auto-flow: dense; align-items: stretch;`;break;case"metro":a+=`--uc-grid-metro-columns-mobile: ${2*o}; grid-template-columns: repeat(${2*n}, minmax(0, 1fr)); grid-auto-rows: 90px; grid-auto-flow: dense; align-items: stretch;`;break;default:a+=`grid-template-columns: repeat(${n}, minmax(0, 1fr));`}return a}calculateMetroSizes(e,i){const t=[],n=2*i;for(let i=0;i<e;i++)i%6==0&&e>3?t.push("large"):i%3==2?t.push("medium"):t.push("small");let o=0;const a=[0];for(let e=0;e<t.length;e++){const i="small"===t[e]?2:4;o+i>n?(a.push(e),o=i):o+=i,o===n&&(e<t.length-1&&a.push(e+1),o=0)}for(let e=0;e<a.length;e++){const i=a[e],o=e<a.length-1?a[e+1]:t.length;let r=0;for(let e=i;e<o;e++)r+="small"===t[e]?2:4;const l=n-r;if(l>0&&l<n)for(let e=i;e<o&&l>0;e++)if("small"===t[e]){const i=r+2;if(i<=n&&(t[e]="medium",r=i,r===n))break}}return t}renderGridItem(e,i,t,o,a,r,l){const{name:s,state:d,icon:c,isOn:u,isUnavailable:p,entityPicture:g}=this.getEntityDisplayInfo(e,o,t),m=this.getIconColor(e,u,p,t),v=this.buildItemStyles(e,t,a,u,p),h=r?this.buildAnimationStyles(t,i):"";let y="";"metro"===t.grid_display_mode?y=e.metro_size?`metro-${e.metro_size}`:l&&l[i]?`metro-${l[i]}`:"metro-small":"masonry"===t.grid_display_mode&&(i%5==0?y="masonry-extra-tall":i%3==0&&(y="masonry-tall"));const _=!1!==t.enable_hover_effect?`hover-${t.hover_effect||"scale"}`:"",f=this.resolveAction("tap",e,t,o),b=this.resolveAction("hold",e,t,o),x=this.resolveAction("double_tap",e,t,o),$=this.createGestureHandlers(`${t.id}_${e.id}`,{tap_action:f,hold_action:b,double_tap_action:x,entity:e.entity,module:t},o,void 0);return n.qy`
      <div
        class="uc-grid-item grid-style-${t.grid_style} ${y} ${_}"
        style="${v}${h}"
        @pointerdown=${$.onPointerDown}
        @pointerup=${$.onPointerUp}
        @pointercancel=${$.onPointerCancel}
        @pointerleave=${$.onPointerLeave}
      >
        ${this.renderItemContent(e,t,a,s,d,c,m,g)}
      </div>
    `}buildItemStyles(e,i,t,n,o){const a=e.custom_background||i.global_background_color||"var(--card-background-color)",r=i.global_border_radius||t.defaultBorderRadius,l=i.global_padding||t.defaultPadding,s=i.global_border_width||0,d=i.global_border_color||"var(--divider-color)";let c=`background: ${a}; border-radius: ${r}; padding: ${l}; cursor: pointer; transition: all 0.2s ease;`;switch(s>0&&(c+=`border: ${s}px solid ${d};`),i.grid_style){case"style_11":c+=`box-shadow: 0 2px 8px ${i.card_shadow_color||"rgba(0, 0, 0, 0.1)"};`;break;case"style_15":case"style_18":break;case"style_16":const e=i.glass_tint_color||"rgba(255, 255, 255, 0.1)",t=i.glass_blur_amount||10;c+=`background: ${e}; backdrop-filter: blur(${t}px); -webkit-backdrop-filter: blur(${t}px); border: 1px solid ${i.glass_border_color||"rgba(255, 255, 255, 0.2)"};`;break;case"style_17":const o=i.gradient_start_color||"#6666FF",a=i.gradient_end_color||"#000070";c+=`background: linear-gradient(${(i.gradient_direction||"to-bottom-right").replace("to-","to ").replace("-"," ")}, ${o}, ${a}) !important;`;break;case"style_19":const r=i.neumorphic_light_shadow||"rgba(255, 255, 255, 0.1)";c+=`box-shadow: 6px 6px 12px ${i.neumorphic_dark_shadow||"rgba(0, 0, 0, 0.15)"}, -6px -6px 12px ${r};`;break;case"style_20":c+=`border-left: 3px solid ${n?i.accent_border_color||i.global_on_color||"var(--primary-color)":i.accent_border_color||"var(--divider-color)"};`}return c}buildAnimationStyles(e,i){if(!e.enable_load_animation||"none"===e.load_animation)return"";const t=e.grid_animation_duration||600,n=(e.animation_stagger||100)*i;return`opacity: 0; animation: grid-${e.load_animation||"fadeIn"} ${t}ms ease-out ${n}ms forwards;`}renderItemContent(e,i,t,o,a,r,l,s){const d=i.global_icon_size||t.defaultIconSize,c=i.global_font_size||t.defaultFontSize,u=i.global_name_color||"var(--primary-text-color)",p=i.global_state_color||"var(--secondary-text-color)",g=(e,i)=>s?n.qy`
          <div class="grid-item-picture" style="width: ${e}px; height: ${e}px;">
            <img src="${s}" alt="${o}" />
          </div>
        `:n.qy`<ha-icon icon="${r}" style="--mdc-icon-size: ${e}px; color: ${i};"></ha-icon>`;switch(t.layout){case"horizontal":return n.qy`
          <div class="grid-item-horizontal">
            ${t.showIcon?g(d,l):""}
            <div class="grid-item-text">
              ${t.showName?n.qy`<span class="grid-item-name" style="font-size: ${c}px; color: ${u};">${o}</span>`:""}
              ${t.showState?n.qy`<span class="grid-item-state" style="font-size: ${c-1}px; color: ${p};">${a}</span>`:""}
            </div>
          </div>
        `;case"icon-only":return n.qy`
          <div class="grid-item-icon-only">
            ${t.showIcon?g(d,l):""}
            ${t.showState&&"style_4"===i.grid_style?n.qy`<span class="grid-item-badge" style="font-size: ${c-2}px;">${a}</span>`:""}
            ${t.showState&&"style_10"===i.grid_style?n.qy`<span class="grid-item-corner-badge" style="font-size: ${c-3}px;">${a}</span>`:""}
            ${t.showState&&"style_9"===i.grid_style?n.qy`<span class="grid-item-ring-state" style="font-size: ${c}px;">${a}</span>`:""}
          </div>
        `;default:if("style_1"===i.grid_style)return n.qy`
            <div class="grid-item-vertical">
              ${t.showName?n.qy`<span class="grid-item-name" style="font-size: ${c}px; color: ${u}; margin-bottom: 8px;">${o}</span>`:""}
              ${t.showIcon?g(d,l):""}
              ${t.showState?n.qy`<span class="grid-item-state" style="font-size: ${c-1}px; color: ${p}; margin-top: 8px;">${a}</span>`:""}
            </div>
          `;if("style_5"===i.grid_style)return n.qy`
            <div class="grid-item-compact">
              <div class="grid-item-top-row">
                ${t.showIcon?g(d,l):""}
                ${t.showName?n.qy`<span class="grid-item-name" style="font-size: ${c}px; color: ${u};">${o}</span>`:""}
              </div>
              ${t.showState?n.qy`<span class="grid-item-state" style="font-size: ${c-1}px; color: ${p};">${a}</span>`:""}
            </div>
          `;if("style_15"===i.grid_style){const e=i.panel_header_color||l,g=i.panel_header_text_color||"var(--text-primary-color, white)";return n.qy`
            <div class="grid-item-panel">
              <div class="grid-item-panel-header" style="background: ${e};">
                ${t.showIcon?s?n.qy`<div class="grid-item-picture" style="width: ${d-4}px; height: ${d-4}px;"><img src="${s}" alt="${o}" /></div>`:n.qy`<ha-icon icon="${r}" style="--mdc-icon-size: ${d-4}px; color: ${g};"></ha-icon>`:""}
              </div>
              <div class="grid-item-panel-body" style="padding: 12px;">
                ${t.showName?n.qy`<span class="grid-item-name" style="font-size: ${c}px; color: ${u};">${o}</span>`:""}
                ${t.showState?n.qy`<span class="grid-item-state" style="font-size: ${c-1}px; color: ${p};">${a}</span>`:""}
              </div>
            </div>
          `}if("style_18"===i.grid_style){const e=i.split_left_color||l,g=i.split_right_color||"transparent";return n.qy`
            <div class="grid-item-split">
              <div class="grid-item-split-left" style="background: ${e}; padding: 16px;">
                ${t.showIcon?s?n.qy`<div class="grid-item-picture" style="width: ${d}px; height: ${d}px;"><img src="${s}" alt="${o}" /></div>`:n.qy`<ha-icon icon="${r}" style="--mdc-icon-size: ${d}px; color: var(--text-primary-color, white);"></ha-icon>`:""}
              </div>
              <div class="grid-item-split-right" style="background: ${g}; padding: 12px;">
                ${t.showName?n.qy`<span class="grid-item-name" style="font-size: ${c}px; color: ${u};">${o}</span>`:""}
                ${t.showState?n.qy`<span class="grid-item-state" style="font-size: ${c-1}px; color: ${p};">${a}</span>`:""}
              </div>
            </div>
          `}return n.qy`
            <div class="grid-item-vertical">
              ${t.showIcon?g(d,l):""}
              ${t.showName?n.qy`<span class="grid-item-name" style="font-size: ${c}px; color: ${u}; ${t.showIcon?"margin-top: 8px;":""}">${o}</span>`:""}
              ${t.showState?n.qy`<span class="grid-item-state" style="font-size: ${c-1}px; color: ${p}; margin-top: 4px;">${a}</span>`:""}
            </div>
          `}}renderPaginationControls(e,i,t){const o=t.pagination_style||"both",a="numbers"===o||"both"===o,r="buttons"===o||"both"===o;return n.qy`
      <div class="uc-grid-pagination">
        ${r?n.qy`
              <button
                class="pagination-btn"
                ?disabled=${e<=1}
                @click=${()=>{this._currentPages.set(t.id,e-1),this.triggerPreviewUpdate()}}
              >
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </button>
            `:""}
        ${a?n.qy`
              <div class="pagination-numbers">
                ${Array.from({length:i},((e,i)=>i+1)).map((i=>n.qy`
                    <button
                      class="pagination-number ${i===e?"active":""}"
                      @click=${()=>{this._currentPages.set(t.id,i),this.triggerPreviewUpdate()}}
                    >
                      ${i}
                    </button>
                  `))}
              </div>
            `:""}
        ${r?n.qy`
              <button
                class="pagination-btn"
                ?disabled=${e>=i}
                @click=${()=>{this._currentPages.set(t.id,e+1),this.triggerPreviewUpdate()}}
              >
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>
            `:""}
      </div>
    `}getEditorStyles(){return"\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 24px;\n      }\n      .section-title {\n        font-size: 18px;\n        font-weight: 700;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 16px;\n        padding-bottom: 8px;\n        border-bottom: 2px solid var(--primary-color);\n        letter-spacing: 0.5px;\n      }\n      .field-container {\n        margin-bottom: 16px;\n      }\n      .field-title {\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 4px;\n      }\n      .field-description {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        margin-bottom: 12px;\n        opacity: 0.8;\n        line-height: 1.4;\n      }\n      .number-range-control {\n        display: flex;\n        gap: 8px;\n        align-items: center;\n      }\n      .range-slider {\n        flex: 0 0 65%;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n      }\n      .range-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 18px;\n        height: 18px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n      .range-input {\n        flex: 0 0 20%;\n        padding: 6px 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n      }\n      .range-reset-btn {\n        width: 32px;\n        height: 32px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n      .range-reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n      .conditional-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        padding: 16px;\n      }\n      .entity-rows-container {\n        margin-top: 16px;\n      }\n      .entity-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px;\n        background: var(--card-background-color);\n        border-radius: 8px;\n        margin-bottom: 8px;\n        cursor: move;\n        border: 1px solid var(--divider-color);\n        transition: all 0.2s ease;\n      }\n      .entity-row:hover {\n        border-color: var(--primary-color);\n      }\n      .entity-row.dragging {\n        opacity: 0.5;\n      }\n      .entity-row.drag-over {\n        border-top: 3px solid var(--primary-color);\n      }\n      .drag-handle {\n        cursor: grab;\n        color: var(--secondary-text-color);\n      }\n      .entity-info {\n        flex: 1;\n        font-size: 14px;\n        color: var(--primary-text-color);\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n      .entity-info.no-entity {\n        color: var(--secondary-text-color);\n        font-style: italic;\n      }\n      .expand-icon {\n        cursor: pointer;\n        color: var(--primary-color);\n        transition: transform 0.2s ease;\n      }\n      .expand-icon.expanded {\n        transform: rotate(180deg);\n      }\n      .delete-icon {\n        cursor: pointer;\n        color: var(--error-color);\n      }\n      .entity-settings {\n        padding: 16px;\n        background: rgba(var(--rgb-primary-color), 0.05);\n        border-left: 3px solid var(--primary-color);\n        border-radius: 0 8px 8px 0;\n        margin-bottom: 8px;\n        animation: slideDown 0.3s ease;\n      }\n      @keyframes slideDown {\n        from { opacity: 0; transform: translateY(-10px); }\n        to { opacity: 1; transform: translateY(0); }\n      }\n      .add-entity-btn {\n        width: 100%;\n        padding: 12px;\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border: none;\n        border-radius: 8px;\n        cursor: pointer;\n        font-size: 14px;\n        font-weight: 600;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        transition: all 0.2s ease;\n      }\n      .add-entity-btn:hover {\n        opacity: 0.9;\n      }\n      .chips-container {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 8px;\n        margin-bottom: 12px;\n      }\n      .filter-chip {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n        padding: 6px 12px;\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-radius: 16px;\n        font-size: 13px;\n        transition: all 0.2s ease;\n        position: relative;\n      }\n      .filter-chip.exclude-chip {\n        background: var(--error-color);\n      }\n      .filter-chip:hover {\n        opacity: 0.9;\n        padding-right: 32px;\n      }\n      .chip-remove-icon {\n        cursor: pointer;\n        font-size: 16px;\n        opacity: 0;\n        position: absolute;\n        right: 8px;\n        transition: opacity 0.2s ease;\n      }\n      .filter-chip:hover .chip-remove-icon {\n        opacity: 1;\n      }\n      .domain-select {\n        width: 100%;\n        padding: 10px 12px;\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        font-size: 14px;\n        cursor: pointer;\n      }\n      .keyword-input-row {\n        margin-top: 8px;\n      }\n      .keyword-input {\n        width: 100%;\n        padding: 10px 12px;\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        font-size: 14px;\n        box-sizing: border-box;\n      }\n      .keyword-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n      }\n      .keyword-input::placeholder {\n        color: var(--secondary-text-color);\n        opacity: 0.7;\n      }\n      .info-box {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px;\n        background: rgba(var(--rgb-primary-color), 0.1);\n        border-radius: 8px;\n        margin-top: 16px;\n        font-size: 13px;\n        color: var(--primary-color);\n      }\n      .style-info {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px;\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 8px;\n        margin-bottom: 16px;\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        border-left: 3px solid var(--primary-color);\n      }\n      .style-info ha-icon {\n        color: var(--primary-color);\n        --mdc-icon-size: 20px;\n      }\n      .style-info strong {\n        color: var(--primary-text-color);\n      }\n      .color-field {\n        margin-bottom: 16px;\n      }\n      .action-override-note {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px;\n        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);\n        border-radius: 8px;\n        font-size: 13px;\n        color: var(--info-color, #03a9f4);\n        margin-top: 12px;\n      }\n      /* Entity Actions Override Styles */\n      .entity-actions-override {\n        margin-top: 16px;\n        padding: 16px;\n        background: rgba(var(--rgb-primary-color), 0.05);\n        border-radius: 8px;\n        border-left: 3px solid var(--primary-color);\n      }\n      .entity-action-info {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 10px 12px;\n        background: rgba(var(--rgb-info-color, 3, 169, 244), 0.1);\n        border-radius: 6px;\n        font-size: 12px;\n        color: var(--info-color, #03a9f4);\n        margin-bottom: 16px;\n      }\n      .entity-action-info ha-icon {\n        --mdc-icon-size: 18px;\n        flex-shrink: 0;\n      }\n      .entity-action-field {\n        margin-bottom: 16px;\n      }\n      .entity-action-field:last-child {\n        margin-bottom: 0;\n      }\n      .entity-action-field ha-form {\n        --ha-form-padding: 0;\n        display: block;\n        width: 100%;\n      }\n      /* Ensure action selectors can expand and show all fields */\n      .entity-action-field ha-selector,\n      .entity-action-field ha-selector-ui-action {\n        display: block;\n        width: 100%;\n      }\n      .entity-action-field ha-expansion-panel {\n        --expansion-panel-content-padding: 0 16px 16px;\n      }\n      /* Section Spacer */\n      .entity-section-spacer {\n        height: 24px;\n        margin: 8px 0;\n        border-bottom: 1px dashed var(--divider-color);\n      }\n      /* Entity Condition Styles */\n      .entity-conditions-list {\n        margin-top: 12px;\n      }\n      .add-condition-btn {\n        font-size: 12px;\n        transition: all 0.2s ease;\n      }\n      .add-condition-btn:hover {\n        background: var(--primary-color) !important;\n        color: var(--text-primary-color) !important;\n        border-style: solid !important;\n      }\n      .entity-condition-item {\n        border: 1px solid var(--divider-color);\n        border-radius: 6px;\n        padding: 12px;\n        margin-bottom: 8px;\n        background: var(--card-background-color);\n        transition: all 0.2s ease;\n      }\n      .entity-condition-item:hover {\n        border-color: var(--primary-color);\n      }\n      .entity-condition-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin-bottom: 12px;\n        padding-bottom: 8px;\n        border-bottom: 1px solid var(--divider-color);\n      }\n      .entity-condition-label {\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n      .entity-condition-delete {\n        cursor: pointer;\n        color: var(--error-color);\n        --mdc-icon-size: 18px;\n        transition: transform 0.2s ease;\n      }\n      .entity-condition-delete:hover {\n        transform: scale(1.1);\n      }\n    "}getStyles(){return"\n      /* Grid Container */\n      .uc-grid-container {\n        width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Grid Container Mode Styles */\n      .uc-grid-container.uc-grid-mode-metro {\n        /* Metro uses dense packing to fill gaps */\n      }\n\n      .uc-grid-container.uc-grid-mode-masonry {\n        /* Masonry allows variable heights */\n        align-items: start;\n      }\n\n      /* Grid Item Base */\n      .uc-grid-item {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        text-align: center;\n        box-sizing: border-box;\n        /* overflow hidden causes text cutoff - use visible but clip visual overflow */\n        overflow: visible;\n      }\n\n      /* In regular grid mode, items have equal height */\n      .uc-grid-mode-grid .uc-grid-item {\n        min-height: 80px;\n      }\n\n      /* In masonry mode, items span rows based on class */\n      .uc-grid-mode-masonry .uc-grid-item {\n        grid-row: span 1;\n        /* Don't force overflow hidden - let content determine height within row span */\n        min-height: auto;\n        height: 100%;\n      }\n\n      /* In metro mode, items have defined sizes via classes */\n      .uc-grid-mode-metro .uc-grid-item {\n        min-height: auto;\n        height: 100%;\n      }\n\n      /* Hover Effects */\n      .uc-grid-item.hover-scale:hover {\n        transform: scale(var(--hover-scale, 1.05));\n        z-index: 1;\n      }\n\n      .uc-grid-item.hover-glow:hover {\n        box-shadow: 0 0 20px var(--hover-glow-color, var(--primary-color));\n      }\n\n      .uc-grid-item.hover-lift:hover {\n        transform: translateY(-4px);\n        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);\n      }\n\n      .uc-grid-item.hover-color:hover {\n        background: var(--hover-background-color, var(--primary-color)) !important;\n      }\n\n      /* Metro Sizes - spans based on doubled column grid */\n      /* Small = 1 visual column (2 grid columns) */\n      .uc-grid-item.metro-small {\n        grid-column: span 2;\n        grid-row: span 1;\n        height: 100%;\n        min-width: 0;\n      }\n\n      /* Medium = 2 visual columns (4 grid columns) */\n      .uc-grid-item.metro-medium {\n        grid-column: span 4;\n        grid-row: span 1;\n        height: 100%;\n        min-width: 0;\n      }\n\n      /* Large = 2 visual columns, 2 rows tall */\n      .uc-grid-item.metro-large {\n        grid-column: span 4;\n        grid-row: span 2;\n        height: 100%;\n        min-width: 0;\n      }\n\n      /* Masonry varied heights - items fill their row span completely */\n      .uc-grid-item.masonry-tall {\n        grid-row: span 2;\n        height: 100%;\n      }\n\n      .uc-grid-item.masonry-extra-tall {\n        grid-row: span 3;\n        height: 100%;\n      }\n\n      /* Grid Item Content Layouts */\n      .grid-item-vertical {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        width: 100%;\n        height: 100%;\n        gap: 4px;\n        padding: 8px;\n        box-sizing: border-box;\n      }\n\n      .grid-item-horizontal {\n        display: flex;\n        flex-direction: row;\n        align-items: center;\n        gap: 12px;\n        width: 100%;\n        height: 100%;\n        padding: 8px;\n        box-sizing: border-box;\n      }\n\n      .grid-item-text {\n        display: flex;\n        flex-direction: column;\n        align-items: flex-start;\n        flex: 1;\n        min-width: 0;\n        overflow: hidden;\n      }\n\n      .grid-item-icon-only {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        position: relative;\n        width: 100%;\n        height: 100%;\n      }\n\n      /* Entity picture for person, camera, media_player entities */\n      .grid-item-picture {\n        border-radius: 50%;\n        overflow: hidden;\n        flex-shrink: 0;\n        background: var(--secondary-background-color);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      .grid-item-picture img {\n        width: 100%;\n        height: 100%;\n        object-fit: cover;\n        display: block;\n      }\n\n      .grid-item-compact {\n        display: flex;\n        flex-direction: column;\n        width: 100%;\n        height: 100%;\n        padding: 8px;\n        box-sizing: border-box;\n      }\n\n      .grid-item-top-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        margin-bottom: 4px;\n      }\n\n      /* Panel Style */\n      .grid-item-panel {\n        display: flex;\n        flex-direction: column;\n        width: 100%;\n        height: 100%;\n        overflow: hidden;\n      }\n\n      .grid-item-panel-header {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 12px;\n      }\n\n      .grid-item-panel-body {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        flex: 1;\n      }\n\n      /* Split Style */\n      .grid-item-split {\n        display: flex;\n        flex-direction: row;\n        width: 100%;\n        height: 100%;\n        overflow: hidden;\n      }\n\n      .grid-item-split-left {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        flex: 0 0 40%;\n      }\n\n      .grid-item-split-right {\n        display: flex;\n        flex-direction: column;\n        align-items: flex-start;\n        justify-content: center;\n        flex: 1;\n      }\n\n      /* Text Elements */\n      .grid-item-name {\n        font-weight: 500;\n        line-height: 1.3;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        max-width: 100%;\n        /* Allow wrapping for longer names in metro/masonry but truncate in regular grid */\n        word-break: break-word;\n      }\n\n      /* Regular grid: single line with ellipsis */\n      .uc-grid-mode-grid .grid-item-name {\n        white-space: nowrap;\n      }\n\n      /* Metro/Masonry: allow wrapping for larger tiles */\n      .uc-grid-mode-metro .grid-item-name,\n      .uc-grid-mode-masonry .grid-item-name {\n        white-space: normal;\n        display: -webkit-box;\n        -webkit-line-clamp: 2;\n        -webkit-box-orient: vertical;\n      }\n\n      /* Large metro tiles can show more lines */\n      .uc-grid-mode-metro .metro-large .grid-item-name {\n        -webkit-line-clamp: 3;\n      }\n\n      .grid-item-state {\n        opacity: 0.8;\n        line-height: 1.3;\n        text-transform: capitalize;\n      }\n\n      /* Badge Styles */\n      .grid-item-badge {\n        position: absolute;\n        bottom: -4px;\n        right: -4px;\n        background: var(--primary-color);\n        color: var(--text-primary-color, white);\n        padding: 2px 6px;\n        border-radius: 10px;\n        font-weight: 600;\n        text-transform: capitalize;\n      }\n\n      .grid-item-corner-badge {\n        position: absolute;\n        top: 4px;\n        right: 4px;\n        font-size: 10px;\n        background: rgba(0, 0, 0, 0.5);\n        color: white;\n        padding: 2px 4px;\n        border-radius: 4px;\n        text-transform: capitalize;\n      }\n\n      .grid-item-ring-state {\n        position: absolute;\n        bottom: 8px;\n        left: 50%;\n        transform: translateX(-50%);\n        text-transform: capitalize;\n        color: var(--primary-text-color);\n        font-weight: 500;\n        white-space: nowrap;\n      }\n\n      /* Empty State */\n      .grid-empty-state {\n        grid-column: 1 / -1;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        padding: 32px;\n        color: var(--secondary-text-color);\n        gap: 8px;\n      }\n\n      .grid-empty-state ha-icon {\n        --mdc-icon-size: 48px;\n        opacity: 0.5;\n      }\n\n      /* Pagination */\n      .uc-grid-pagination {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        margin-top: 16px;\n        padding: 8px;\n      }\n\n      .pagination-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 36px;\n        height: 36px;\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .pagination-btn:hover:not([disabled]) {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .pagination-btn[disabled] {\n        opacity: 0.4;\n        cursor: not-allowed;\n      }\n\n      .pagination-numbers {\n        display: flex;\n        gap: 4px;\n      }\n\n      .pagination-number {\n        width: 32px;\n        height: 32px;\n        border: 1px solid var(--divider-color);\n        border-radius: 6px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        font-size: 13px;\n        font-weight: 500;\n        transition: all 0.2s ease;\n      }\n\n      .pagination-number:hover {\n        border-color: var(--primary-color);\n      }\n\n      .pagination-number.active {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      /* Load Animations */\n      @keyframes grid-fadeIn {\n        from { opacity: 0; }\n        to { opacity: 1; }\n      }\n\n      @keyframes grid-slideUp {\n        from { opacity: 0; transform: translateY(20px); }\n        to { opacity: 1; transform: translateY(0); }\n      }\n\n      @keyframes grid-slideDown {\n        from { opacity: 0; transform: translateY(-20px); }\n        to { opacity: 1; transform: translateY(0); }\n      }\n\n      @keyframes grid-slideLeft {\n        from { opacity: 0; transform: translateX(20px); }\n        to { opacity: 1; transform: translateX(0); }\n      }\n\n      @keyframes grid-slideRight {\n        from { opacity: 0; transform: translateX(-20px); }\n        to { opacity: 1; transform: translateX(0); }\n      }\n\n      @keyframes grid-zoomIn {\n        from { opacity: 0; transform: scale(0.8); }\n        to { opacity: 1; transform: scale(1); }\n      }\n\n      /* Style-specific Overrides */\n      .grid-style-style_4 .grid-item-icon-only {\n        min-height: 60px;\n      }\n\n      .grid-style-style_6:hover::after {\n        content: attr(data-name);\n        position: absolute;\n        bottom: 100%;\n        left: 50%;\n        transform: translateX(-50%);\n        background: var(--tooltip-background-color, rgba(0, 0, 0, 0.9));\n        color: var(--tooltip-text-color, white);\n        padding: 4px 8px;\n        border-radius: 4px;\n        font-size: 12px;\n        white-space: nowrap;\n        pointer-events: none;\n        z-index: 10;\n      }\n\n      /* Ring Progress style - circular ring with icon inside */\n      .grid-style-style_9 {\n        position: relative;\n        aspect-ratio: 1 / 1 !important;\n        border-radius: 50% !important;\n        background: transparent !important;\n        border: 3px solid var(--primary-color) !important;\n        box-sizing: border-box;\n      }\n      \n      .grid-style-style_9 .grid-item-icon-only {\n        flex-direction: column;\n      }\n\n      .grid-style-style_12 {\n        border: 2px solid var(--divider-color) !important;\n      }\n\n      .grid-style-style_12:hover {\n        border-color: var(--primary-color) !important;\n      }\n\n      .grid-style-style_15 {\n        padding: 0 !important;\n        overflow: hidden;\n      }\n\n      /* Style 17 (Gradient) - background set via inline styles from buildItemStyles */\n      .grid-style-style_17 .grid-item-name,\n      .grid-style-style_17 .grid-item-state {\n        color: var(--text-primary-color, white);\n      }\n\n      .grid-style-style_18 {\n        padding: 0 !important;\n        overflow: hidden;\n      }\n\n      /* Responsive: use --uc-grid-columns-mobile (set on container) so mobile can show configured columns */\n      @media (max-width: 600px) {\n        .uc-grid-container.uc-grid-mode-grid,\n        .uc-grid-container.uc-grid-mode-masonry {\n          grid-template-columns: repeat(var(--uc-grid-columns-mobile, var(--uc-grid-columns, 4)), minmax(0, 1fr)) !important;\n        }\n\n        .uc-grid-container.uc-grid-mode-metro {\n          grid-template-columns: repeat(var(--uc-grid-metro-columns-mobile, 8), minmax(0, 1fr)) !important;\n        }\n\n        .uc-grid-item.metro-small {\n          grid-column: span 2;\n          grid-row: span 1;\n        }\n\n        .uc-grid-item.metro-medium,\n        .uc-grid-item.metro-large {\n          grid-column: span 4;\n          grid-row: span 1;\n        }\n\n        .uc-grid-item.masonry-tall,\n        .uc-grid-item.masonry-extra-tall {\n          grid-row: span 1;\n        }\n      }\n    "}}}}]);