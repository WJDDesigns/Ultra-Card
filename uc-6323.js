"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6323],{6323:(t,e,i)=>{i.r(e),i.d(e,{UltraIconModule:()=>f});var n=i(5183),o=i(7475),a=i(9760),r=i(5147),c=i(5320),s=i(571),l=i(5262),d=i(8869),_=i(6990),p=i(6478),m=i(8938),v=i(6477),u=(i(7921),i(9654),i(6358),i(9327)),g=i(5121),h=i(5064);class f extends o.m{constructor(){super(...arguments),this.metadata={type:"icon",title:"Icons",description:"Interactive icon buttons",author:"WJD Designs",version:"1.0.0",icon:"mdi:circle",category:"interactive",tags:["icon","button","interactive","control"]},this._previewCollapsed=!1,this._attributeCache=new Map,this._processingAttributes=new Set}_injectGlobalStyles(){if(!f._globalStylesInjected&&"undefined"!=typeof document){const t="uvc-icon-module-styles";if(!document.getElementById(t)){const e=document.createElement("style");e.id=t,e.textContent=f._ANIMATION_KEYFRAMES,document.head.appendChild(e)}f._globalStylesInjected=!0}}_hashString(t){let e=0;if(0===t.length)return e.toString();for(let i=0;i<t.length;i++)e=(e<<5)-e+t.charCodeAt(i),e|=0;return Math.abs(e).toString(36)}_formValue(t,e){var i,n,o,a;return null!==(o=null===(n=null===(i=t.detail)||void 0===i?void 0:i.value)||void 0===n?void 0:n[e])&&void 0!==o?o:null===(a=t.detail)||void 0===a?void 0:a[e]}_highlightJinja2(t){if(!t)return"";let e=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return e=e.replace(/(\{\{[\s\S]*?\}\})/g,'<span style="color: #569cd6;">$1</span>'),e=e.replace(/(\{%[\s\S]*?%\})/g,'<span style="color: #c586c0;">$1</span>'),e=e.replace(/((['"`])[^'"`]*?\2)/g,'<span style="color: #ce9178;">$1</span>'),["if","else","elif","endif","for","endfor","in","not","and","or","is","true","false","none","True","False","None"].forEach((t=>{const i=new RegExp(`\\b(${t})\\b`,"g");e=e.replace(i,'<span style="color: #569cd6;">$1</span>')})),e=e.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,'<span style="color: #dcdcaa;">$1</span>('),e=e.replace(/\|\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,'| <span style="color: #dcdcaa;">$1</span>'),e=e.replace(/\b(\d+(?:\.\d+)?)\b/g,'<span style="color: #b5cea8;">$1</span>'),e=e.replace(/(==|!=|<=|>=|<|>|\+|-|\*|\/|%)/g,'<span style="color: #d4d4d4;">$1</span>'),e}createDefault(t,e){return{id:t||this.generateId("icon"),type:"icon",icons:[{id:this.generateId("icon-item"),icon_mode:"entity",entity:"weather.forecast_home",name:"",icon_inactive:"mdi:weather-partly-cloudy",icon_active:"mdi:weather-partly-cloudy",inactive_state:"",active_state:"",inactive_attribute:"",active_attribute:"",display_attribute:"",custom_inactive_state_text:"",custom_active_state_text:"",custom_inactive_name_text:"",custom_active_name_text:"",inactive_template_mode:!1,inactive_template:"",active_template_mode:!1,active_template:"",use_entity_color_for_icon:!1,use_state_color_for_inactive_icon:!1,use_state_color_for_active_icon:!1,color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_icon_color:"var(--secondary-text-color)",active_icon_color:"var(--primary-color)",inactive_name_color:"var(--primary-text-color)",active_name_color:"var(--primary-text-color)",inactive_state_color:"var(--secondary-text-color)",active_state_color:"var(--secondary-text-color)",show_name_when_inactive:!0,show_state_when_inactive:!0,show_icon_when_inactive:!0,show_name_when_active:!0,show_state_when_active:!0,show_icon_when_active:!0,show_state:!0,show_name:!0,show_units:!0,enable_hover_effect:!1,icon_size:26,text_size:14,name_icon_gap:8,name_state_gap:2,icon_state_gap:4,active_icon_size:26,inactive_icon_size:26,active_text_size:14,inactive_text_size:14,state_size:14,active_state_size:14,inactive_state_size:14,icon_size_locked:!0,text_size_locked:!0,state_size_locked:!0,active_icon_locked:!0,active_icon_color_locked:!1,active_icon_background_locked:!0,active_icon_background_color_locked:!0,active_name_locked:!0,active_name_color_locked:!0,active_state_locked:!1,active_state_color_locked:!0,icon_background:"none",use_entity_color_for_icon_background:!1,icon_background_color:"transparent",icon_background_padding:8,inactive_icon_background_padding:8,active_icon_background_padding:8,active_icon_background_padding_locked:!0,inactive_icon_animation:"none",active_icon_animation:"none",vertical_alignment:"center",container_width:void 0,container_background_shape:"none",container_background_color:"#808080",tap_action:void 0,hold_action:void 0,double_tap_action:void 0,click_action:"toggle",double_click_action:"none",hold_action_legacy:"none",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",unified_template_mode:!1,unified_template:"",ignore_entity_state_config:!1}],columns:3,gap:16,allow_wrap:!0,text_size:16,icon_size:24,tap_action:void 0,hold_action:void 0,double_tap_action:void 0,display_mode:"always",display_conditions:[]}}renderGeneralTab(t,e,i,o){var a;const r=t,c=(null===(a=null==e?void 0:e.locale)||void 0===a?void 0:a.language)||"en";return n.qy`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Module-Wide Size Controls -->
        <div class="settings-section" style="margin-bottom: 32px;">
          <div class="section-title">SIZE CONTROLS</div>
          <div class="section-description" style="margin-bottom: 16px;">
            Control the default text and icon sizes for this module. Design tab overrides these
            settings.
          </div>

          <!-- Text Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Text Size (${r.text_size||16}px)</div>
            <div class="field-description">Default size for all text elements (name, state)</div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="10"
                max="48"
                step="1"
                .value="${String(r.text_size||16)}"
                @input=${t=>{const e=t.target;o({text_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              />
              <input
                type="number"
                class="gap-input"
                min="10"
                max="100"
                step="1"
                .value="${String(r.text_size||16)}"
                @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(o({text_size:i}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||16,n="ArrowUp"===t.key?1:-1,a=Math.max(10,Math.min(100,i+n));o({text_size:a}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
              />
              <button
                class="reset-btn"
                @click=${()=>{o({text_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                title="${(0,p.kg)("editor.fields.reset_default_value",c,"Reset to default ({value})").replace("{value}","16")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Icon Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Icon Size (${r.icon_size||24}px)</div>
            <div class="field-description">Default size for all icons</div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="12"
                max="64"
                step="1"
                .value="${String(r.icon_size||24)}"
                @input=${t=>{const e=t.target;o({icon_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              />
              <input
                type="number"
                class="gap-input"
                min="12"
                max="100"
                step="1"
                .value="${String(r.icon_size||24)}"
                @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(o({icon_size:i}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||24,n="ArrowUp"===t.key?1:-1,a=Math.max(12,Math.min(100,i+n));o({icon_size:a}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
              />
              <button
                class="reset-btn"
                @click=${()=>{o({icon_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                title="${(0,p.kg)("editor.fields.reset_default_value",c,"Reset to default ({value})").replace("{value}","24")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        ${r.icons.map(((t,i)=>{var a,s;return n.qy`
            <div class="icon-settings-container">
              <!-- Icon Mode Selector -->
              <div class="settings-section" style="margin-bottom: 24px;">
                <div class="section-title">
                  ${(0,p.kg)("editor.icon.icon_mode.title",c,"ICON MODE")}
                </div>
                <div
                  class="section-description"
                  style="margin-bottom: 16px; font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;"
                >
                  ${(0,p.kg)("editor.icon.icon_mode.desc",c,"Choose between an entity-connected icon or a static standalone icon")}
                </div>
                <div style="display: flex; gap: 8px;">
                  <button
                    style="
                      flex: 1;
                      padding: 12px 16px;
                      border: 2px solid ${"entity"===(t.icon_mode||"entity")?"var(--primary-color)":"var(--divider-color)"};
                      border-radius: 8px;
                      background: ${"entity"===(t.icon_mode||"entity")?"var(--primary-color)":"transparent"};
                      color: ${"entity"===(t.icon_mode||"entity")?"var(--text-primary-color, #fff)":"var(--primary-text-color)"};
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                    "
                    @click=${()=>{this._updateIcon(r,i,{icon_mode:"entity"},o),setTimeout((()=>this._triggerPreviewUpdate()),50)}}
                  >
                    <ha-icon icon="mdi:link-variant" style="--mdc-icon-size: 20px;"></ha-icon>
                    ${(0,p.kg)("editor.icon.icon_mode.entity",c,"Entity-Based")}
                  </button>
                  <button
                    style="
                      flex: 1;
                      padding: 12px 16px;
                      border: 2px solid ${"static"===t.icon_mode?"var(--primary-color)":"var(--divider-color)"};
                      border-radius: 8px;
                      background: ${"static"===t.icon_mode?"var(--primary-color)":"transparent"};
                      color: ${"static"===t.icon_mode?"var(--text-primary-color, #fff)":"var(--primary-text-color)"};
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                    "
                    @click=${()=>{this._updateIcon(r,i,{icon_mode:"static"},o),setTimeout((()=>this._triggerPreviewUpdate()),50)}}
                  >
                    <ha-icon icon="mdi:image-outline" style="--mdc-icon-size: 20px;"></ha-icon>
                    ${(0,p.kg)("editor.icon.icon_mode.static",c,"Static")}
                  </button>
                </div>
              </div>

              ${"static"===t.icon_mode?n.qy`
                    <!-- Static Icon Configuration -->
                    ${this._renderStaticIconSettings(t,i,r,e,c,o)}
                  `:n.qy`
                    <!-- Entity Configuration -->
                    ${this.renderSettingsSection((0,p.kg)("editor.icon.entity_config.title",c,"ENTITY CONFIGURATION"),(0,p.kg)("editor.icon.entity_config.desc",c,"Configure the entity and active/inactive states"),[{title:(0,p.kg)("editor.icon.entity",c,"Entity"),description:(0,p.kg)("editor.icon.entity_desc",c,"Select the entity this icon represents"),hass:e,data:{entity:t.entity||""},schema:[this.entityField("entity")],onChange:n=>{this._handleEntitySelection(t,i,r,n.detail.value.entity,e,o)}},{title:(0,p.kg)("editor.icon.inactive_state",c,"Inactive State"),description:(0,p.kg)("editor.icon.inactive_state_desc",c,'State value considered "inactive" (leave blank to use actual entity state)'),hass:e,data:{inactive_state:t.inactive_state||""},schema:[this.textField("inactive_state")],onChange:t=>this._updateIcon(r,i,{inactive_state:t.detail.value.inactive_state},o)},{title:(0,p.kg)("editor.icon.active_state",c,"Active State"),description:(0,p.kg)("editor.icon.active_state_desc",c,'State value considered "active" (leave blank to use actual entity state)'),hass:e,data:{active_state:t.active_state||""},schema:[this.textField("active_state")],onChange:t=>this._updateIcon(r,i,{active_state:t.detail.value.active_state},o)}])}

                    <!-- Attributes Section -->
                    <div class="settings-section" style="margin-bottom: 24px;">
                      <div class="section-title">
                        ${(0,p.kg)("editor.icon.attributes_section.title",c,"ATTRIBUTES")}
                      </div>
                      <div
                        class="section-description"
                        style="margin-bottom: 16px; font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;"
                      >
                        ${(0,p.kg)("editor.icon.attributes_section.desc",c,"Select entity attributes to use instead of the main entity state for determining active/inactive conditions")}
                      </div>

                      <!-- Display Attribute (simple override) -->
                      <div class="field-container" style="margin-bottom: 16px;">
                        <div class="field-title">
                          ${(0,p.kg)("editor.icon.display_attribute",c,"Display Attribute")}
                        </div>
                        <div class="field-description">
                          ${(0,p.kg)("editor.icon.display_attribute_desc",c,"Select an attribute to display instead of the entity state. For separate active/inactive attributes, use the options below.")}
                        </div>
                        ${this.renderUcForm(e,{display_attribute:t.display_attribute||""},[this.selectField("display_attribute",this._getEntityAttributes(t.entity,e))],(t=>{const e=t.detail.value.display_attribute;e!==(r.icons[i].display_attribute||"")&&(this._updateIcon(r,i,{display_attribute:e},o),setTimeout((()=>{this._triggerPreviewUpdate()}),50))}),!1)}
                      </div>

                      <!-- Inactive Attribute -->
                      <div class="field-container" style="margin-bottom: 16px;">
                        <div class="field-title">
                          ${(0,p.kg)("editor.icon.inactive_attribute",c,"Inactive Attribute")}
                        </div>
                        <div class="field-description">
                          ${(0,p.kg)("editor.icon.inactive_attribute_desc",c,'Entity attribute to check for inactive state (e.g., "condition" for weather)')}
                        </div>
                        ${this.renderUcForm(e,{inactive_attribute:t.inactive_attribute||""},[this.selectField("inactive_attribute",this._getEntityAttributes(t.entity,e))],(t=>{const e=t.detail.value.inactive_attribute;e!==(r.icons[i].inactive_attribute||"")&&(this._updateIcon(r,i,{inactive_attribute:e},o),setTimeout((()=>{this._triggerPreviewUpdate()}),50))}),!1)}
                      </div>

                      <!-- Active Attribute -->
                      <div class="field-container">
                        <div class="field-title">
                          ${(0,p.kg)("editor.icon.active_attribute",c,"Active Attribute")}
                        </div>
                        <div class="field-description">
                          ${(0,p.kg)("editor.icon.active_attribute_desc",c,'Entity attribute to check for active state (e.g., "condition" for weather)')}
                        </div>
                        ${this.renderUcForm(e,{active_attribute:t.active_attribute||""},[this.selectField("active_attribute",this._getEntityAttributes(t.entity,e))],(t=>{const e=t.detail.value.active_attribute;e!==(r.icons[i].active_attribute||"")&&(this._updateIcon(r,i,{active_attribute:e},o),setTimeout((()=>{this._triggerPreviewUpdate()}),50))}),!1)}
                      </div>
                    </div>

                    <!-- Icon Section -->
                    <div class="settings-section" style="margin-bottom: 24px;">
                      <div class="section-title">
                        <div style="display: flex; align-items: center; gap: 12px;">
                          <span>${(0,p.kg)("editor.icon.icon_section.title",c,"Icon")}</span>
                          <ha-switch
                            .checked=${!1!==t.show_icon_when_active&&!1!==t.show_icon_when_inactive}
                            @change=${t=>{const e=t.target.checked;this._updateIcon(r,i,{show_icon_when_active:e,show_icon_when_inactive:e},o)}}
                          ></ha-switch>
                        </div>
                      </div>

                      ${!1!==t.show_icon_when_active||!1!==t.show_icon_when_inactive?n.qy`
                            <!-- Inactive Icon Section -->
                            <div style="margin-top: 16px;">
                              <details
                                style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                                @toggle=${t=>{const e=t.target,i=e.querySelector("ha-icon");i&&(i.style.transform=e.open?"rotate(90deg)":"rotate(0deg)")}}
                              >
                                <summary
                                  style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                >
                                  <ha-icon
                                    icon="mdi:chevron-right"
                                    style="transition: transform 0.2s;"
                                  ></ha-icon>
                                  ${(0,p.kg)("editor.icon.inactive_icon",c,"Inactive Icon")}
                                </summary>
                                <div style="padding: 16px;">
                                  ${this.renderSettingsSection((0,p.kg)("editor.icon.inactive_icon_config",c,"Inactive Icon Configuration"),(0,p.kg)("editor.icon.inactive_icon_config_desc",c,"Configure the inactive icon settings"),[{title:(0,p.kg)("editor.icon.inactive_icon",c,"Inactive Icon"),description:(0,p.kg)("editor.icon.inactive_icon_desc",c,"Icon to show when inactive"),hass:e,data:{icon_inactive:t.icon_inactive||""},schema:[this.iconField("icon_inactive")],onChange:t=>this._updateIconWithLockSync(r,i,"icon_inactive",t.detail.value.icon_inactive,o)}])}

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_icon_color",c,"Inactive Icon Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.icon_color_inactive",c,"Color when inactive")}
                                    </div>
                                    <ultra-color-picker
                                      .value=${t.inactive_icon_color||"var(--secondary-text-color)"}
                                      @value-changed=${t=>this._debouncedUpdateIconWithLockSync(r,i,"inactive_icon_color",t.detail.value,o,50)}
                                    ></ultra-color-picker>
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.use_state_color_inactive",c,"Use State Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.use_state_color_inactive_desc",c,"Use the entity state color (RGB attributes) for inactive icon color")}
                                    </div>
                                    <ha-switch
                                      .checked=${t.use_state_color_for_inactive_icon||!1}
                                      @change=${t=>{const e=t.target;this._updateIcon(r,i,{use_state_color_for_inactive_icon:e.checked},o)}}
                                    ></ha-switch>
                                  </div>

                                  ${this.renderSettingsSection((0,p.kg)("editor.icon.background_section.title",c,"Inactive Background"),(0,p.kg)("editor.icon.background_section.desc",c,"Configure the inactive background settings"),[{title:(0,p.kg)("editor.icon.inactive_icon_background",c,"Inactive Background Shape"),description:(0,p.kg)("editor.icon.background_shape_inactive",c,"Background shape when inactive"),hass:e,data:{inactive_icon_background:t.inactive_icon_background||"none"},schema:[this.selectField("inactive_icon_background",[{value:"none",label:"None"},{value:"circle",label:"Circle"},{value:"square",label:"Square"},{value:"rounded-square",label:"Rounded Square"}])],onChange:t=>{const e=this._formValue(t,"inactive_icon_background");if(void 0===e)return;const n=String(e);if(n===(r.icons[i].inactive_icon_background||"none"))return;const a={inactive_icon_background:n};n&&"none"!==n&&(a.inactive_icon_background_color="var(--divider-color)"),this._updateIcon(r,i,a,o)}}])}

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_icon_background_color",c,"Inactive Background Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.background_color_inactive",c,"Background color when inactive")}
                                    </div>
                                    <ultra-color-picker
                                      .value=${t.inactive_icon_background_color||"transparent"}
                                      @value-changed=${t=>this._debouncedUpdateIconWithLockSync(r,i,"inactive_icon_background_color",t.detail.value,o,50)}
                                    ></ultra-color-picker>
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_icon_background_padding",c,"Inactive Background Padding")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.background_padding_inactive",c,"Padding between icon and background when inactive")}
                                    </div>
                                    ${this._renderSizeControl(r,i,o,"inactive_icon_background_padding",null!==(a=t.inactive_icon_background_padding)&&void 0!==a?a:8,0,50,8)}
                                  </div>

                                  <div class="field-container">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_icon_size",c,"Inactive Icon Size")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.icon_size_inactive",c,"Icon size when inactive")}
                                    </div>
                                    ${this._renderSizeControl(r,i,o,"inactive_icon_size",t.inactive_icon_size||26,0,200,26)}
                                  </div>
                                </div>
                              </details>
                            </div>

                            <!-- Active Icon Section -->
                            <div style="margin-top: 16px;">
                              <details
                                style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                                @toggle=${t=>{const e=t.target,i=e.querySelector("ha-icon");i&&(i.style.transform=e.open?"rotate(90deg)":"rotate(0deg)")}}
                              >
                                <summary
                                  style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                >
                                  <ha-icon
                                    icon="mdi:chevron-right"
                                    style="transition: transform 0.2s;"
                                  ></ha-icon>
                                  ${(0,p.kg)("editor.icon.active_icon",c,"Active Icon")}
                                </summary>
                                <div style="padding: 16px;">
                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_icon",c,"Active Icon")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.active_icon_desc",c,"Icon to show when active")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_icon_locked","icon_active","icon_inactive",t.icon_active||t.icon_inactive||"","icon",e)}
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_icon_color",c,"Active Icon Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.icon_color_active",c,"Color when active")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_icon_color_locked","active_icon_color","inactive_icon_color",t.active_icon_color||"var(--primary-color)","color",e)}
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.use_state_color_active",c,"Use State Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.use_state_color_active_desc",c,"Use the entity state color (RGB attributes) for active icon color")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_state_color_locked","use_state_color_for_active_icon","use_state_color_for_inactive_icon",t.use_state_color_for_active_icon||!1,"toggle",e)}
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_icon_background",c,"Active Background Shape")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.background_shape_active",c,"Background shape when active")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_icon_background_locked","active_icon_background","inactive_icon_background",t.active_icon_background||"none","select",e,[{value:"none",label:"None"},{value:"circle",label:"Circle"},{value:"square",label:"Square"},{value:"rounded-square",label:"Rounded Square"}])}
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_icon_background_color",c,"Active Background Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.background_color_active",c,"Background color when active")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_icon_background_color_locked","active_icon_background_color","inactive_icon_background_color",t.active_icon_background_color||"transparent","color",e)}
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_icon_background_padding",c,"Active Background Padding")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.background_padding_active",c,"Padding between icon and background when active")}
                                    </div>
                                    ${this._renderSizeControlWithLock(r,i,o,"active_icon_background_padding_locked","active_icon_background_padding","inactive_icon_background_padding",null!==(s=t.active_icon_background_padding)&&void 0!==s?s:8,0,50,8)}
                                  </div>

                                  <div class="field-container">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_icon_size",c,"Active Icon Size")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.icon_size_active",c,"Icon size when active")}
                                    </div>
                                    ${this._renderSizeControlWithLock(r,i,o,"icon_size","active_icon_size","inactive_icon_size",t.active_icon_size||26,0,200,26)}
                                  </div>
                                </div>
                              </details>
                            </div>
                          `:""}
                    </div>

                    <!-- Name Section -->
                    <div class="settings-section" style="margin-bottom: 24px;">
                      <div class="section-title">
                        <div style="display: flex; align-items: center; gap: 12px;">
                          <span>${(0,p.kg)("editor.icon.name_section.title",c,"Name")}</span>
                          <ha-switch
                            .checked=${!1!==t.show_name_when_active&&!1!==t.show_name_when_inactive}
                            @change=${t=>{const e=t.target.checked;this._updateIcon(r,i,{show_name_when_active:e,show_name_when_inactive:e},o)}}
                          ></ha-switch>
                        </div>
                      </div>

                      ${!1!==t.show_name_when_active||!1!==t.show_name_when_inactive?n.qy`
                            <!-- Inactive Name Section -->
                            <div style="margin-top: 16px;">
                              <details
                                style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                                @toggle=${t=>{const e=t.target,i=e.querySelector("ha-icon");i&&(i.style.transform=e.open?"rotate(90deg)":"rotate(0deg)")}}
                              >
                                <summary
                                  style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                >
                                  <ha-icon
                                    icon="mdi:chevron-right"
                                    style="transition: transform 0.2s;"
                                  ></ha-icon>
                                  ${(0,p.kg)("editor.icon.inactive_name",c,"Inactive Name")}
                                </summary>
                                <div style="padding: 16px;">
                                  ${this.renderSettingsSection((0,p.kg)("editor.icon.inactive_name_config",c,"Inactive Name Configuration"),(0,p.kg)("editor.icon.inactive_name_config_desc",c,"Configure the inactive name settings"),[{title:(0,p.kg)("editor.icon.custom_inactive_name",c,"Custom Inactive Name"),description:(0,p.kg)("editor.icon.custom_inactive_name_desc",c,"Override entity name when inactive (leave empty to use entity name)"),hass:e,data:{custom_inactive_name_text:t.custom_inactive_name_text||""},schema:[this.textField("custom_inactive_name_text")],onChange:t=>this._updateIcon(r,i,{custom_inactive_name_text:t.detail.value.custom_inactive_name_text},o)}])}

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_name_color",c,"Inactive Name Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.name_color_inactive",c,"Name color when inactive")}
                                    </div>
                                    <ultra-color-picker
                                      .value=${t.inactive_name_color||"var(--primary-text-color)"}
                                      @value-changed=${t=>this._debouncedUpdateIconWithLockSync(r,i,"inactive_name_color",t.detail.value,o,50)}
                                    ></ultra-color-picker>
                                  </div>

                                  <div class="field-container">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_name_size",c,"Inactive Name Size")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.name_size_inactive",c,"Name text size when inactive")}
                                    </div>
                                    ${this._renderSizeControl(r,i,o,"inactive_text_size",t.inactive_text_size||14,0,50,14)}
                                  </div>
                                </div>
                              </details>
                            </div>

                            <!-- Active Name Section -->
                            <div style="margin-top: 16px;">
                              <details
                                style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                                @toggle=${t=>{const e=t.target,i=e.querySelector("ha-icon");i&&(i.style.transform=e.open?"rotate(90deg)":"rotate(0deg)")}}
                              >
                                <summary
                                  style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                >
                                  <ha-icon
                                    icon="mdi:chevron-right"
                                    style="transition: transform 0.2s;"
                                  ></ha-icon>
                                  ${(0,p.kg)("editor.icon.active_name",c,"Active Name")}
                                </summary>
                                <div style="padding: 16px;">
                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.custom_active_name",c,"Custom Active Name")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.custom_active_name_desc",c,"Override entity name when active (leave empty to use entity name)")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_name_locked","custom_active_name_text","custom_inactive_name_text",t.custom_active_name_text||"","text",e)}
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_name_color",c,"Active Name Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.name_color_active",c,"Name color when active")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_name_color_locked","active_name_color","inactive_name_color",t.active_name_color||"var(--primary-text-color)","color",e)}
                                  </div>

                                  <div class="field-container">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_name_size",c,"Active Name Size")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.name_size_active",c,"Name text size when active")}
                                    </div>
                                    ${this._renderSizeControlWithLock(r,i,o,"text_size","active_text_size","inactive_text_size",t.active_text_size||t.inactive_text_size||14,0,50,12)}
                                  </div>
                                </div>
                              </details>
                            </div>
                          `:""}
                    </div>

                    <!-- State Section -->
                    <div class="settings-section" style="margin-bottom: 24px;">
                      <div class="section-title">
                        <div style="display: flex; align-items: center; gap: 12px;">
                          <span>${(0,p.kg)("editor.icon.state_section.title",c,"State")}</span>
                          <ha-switch
                            .checked=${!1!==t.show_state_when_active&&!1!==t.show_state_when_inactive}
                            @change=${t=>{const e=t.target.checked;this._updateIcon(r,i,{show_state_when_active:e,show_state_when_inactive:e},o)}}
                          ></ha-switch>
                        </div>
                      </div>

                      ${!1!==t.show_state_when_active||!1!==t.show_state_when_inactive?n.qy`
                            <!-- Inactive State Section -->
                            <div style="margin-top: 16px;">
                              <details
                                style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                                @toggle=${t=>{const e=t.target,i=e.querySelector("ha-icon");i&&(i.style.transform=e.open?"rotate(90deg)":"rotate(0deg)")}}
                              >
                                <summary
                                  style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                >
                                  <ha-icon
                                    icon="mdi:chevron-right"
                                    style="transition: transform 0.2s;"
                                  ></ha-icon>
                                  ${(0,p.kg)("editor.icon.inactive_state",c,"Inactive State")}
                                </summary>
                                <div style="padding: 16px;">
                                  ${this.renderSettingsSection((0,p.kg)("editor.icon.inactive_state_config",c,"Inactive State Configuration"),(0,p.kg)("editor.icon.inactive_state_config_desc",c,"Configure the inactive state settings"),[{title:(0,p.kg)("editor.icon.custom_inactive_state",c,"Custom Inactive State"),description:(0,p.kg)("editor.icon.custom_inactive_state_desc",c,"Custom text when inactive (leave empty to use actual state)"),hass:e,data:{custom_inactive_state_text:t.custom_inactive_state_text||""},schema:[this.textField("custom_inactive_state_text")],onChange:t=>this._updateIcon(r,i,{custom_inactive_state_text:t.detail.value.custom_inactive_state_text},o)}])}

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_state_color",c,"Inactive State Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.state_color_inactive",c,"State color when inactive")}
                                    </div>
                                    <ultra-color-picker
                                      .value=${t.inactive_state_color||"var(--secondary-text-color)"}
                                      @value-changed=${t=>this._debouncedUpdateIconWithLockSync(r,i,"inactive_state_color",t.detail.value,o,50)}
                                    ></ultra-color-picker>
                                  </div>

                                  <div class="field-container">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.inactive_state_size",c,"Inactive State Size")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.state_size_inactive",c,"State text size when inactive")}
                                    </div>
                                    ${this._renderSizeControl(r,i,o,"inactive_state_size",t.inactive_state_size||10,0,50,10)}
                                  </div>
                                </div>
                              </details>
                            </div>

                            <!-- Active State Section -->
                            <div style="margin-top: 16px;">
                              <details
                                style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                                @toggle=${t=>{const e=t.target,i=e.querySelector("ha-icon");i&&(i.style.transform=e.open?"rotate(90deg)":"rotate(0deg)")}}
                              >
                                <summary
                                  style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                >
                                  <ha-icon
                                    icon="mdi:chevron-right"
                                    style="transition: transform 0.2s;"
                                  ></ha-icon>
                                  ${(0,p.kg)("editor.icon.active_state",c,"Active State")}
                                </summary>
                                <div style="padding: 16px;">
                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.custom_active_state",c,"Custom Active State")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.custom_active_state_desc",c,"Custom text when active (leave empty to use actual state)")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_state_locked","custom_active_state_text","custom_inactive_state_text",t.custom_active_state_text||"","text",e)}
                                  </div>

                                  <div class="field-container" style="margin-bottom: 16px;">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_state_color",c,"Active State Color")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.state_color_active",c,"State color when active")}
                                    </div>
                                    ${this._renderFieldWithLock(r,i,o,"active_state_color_locked","active_state_color","inactive_state_color",t.active_state_color||"var(--secondary-text-color)","color",e)}
                                  </div>

                                  <div class="field-container">
                                    <div class="field-title">
                                      ${(0,p.kg)("editor.icon.active_state_size",c,"Active State Size")}
                                    </div>
                                    <div class="field-description">
                                      ${(0,p.kg)("editor.icon.state_size_active",c,"State text size when active")}
                                    </div>
                                    ${this._renderSizeControlWithLock(r,i,o,"state_size","active_state_size","inactive_state_size",t.active_state_size||10,0,50,10)}
                                  </div>
                                </div>
                              </details>
                            </div>
                          `:""}
                    </div>

                    <!-- Migration Banner (if legacy templates detected) -->
                    ${(0,h.bk)(t)?n.qy`
                          <div
                            class="migration-banner"
                            style="
                        background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.1), rgba(var(--rgb-primary-color), 0.05));
                        border: 2px solid var(--primary-color);
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 24px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      "
                          >
                            <div style="display: flex; align-items: start; gap: 16px;">
                              <ha-icon
                                icon="mdi:lightbulb-on-outline"
                                style="color: var(--primary-color); font-size: 32px; flex-shrink: 0;"
                              ></ha-icon>
                              <div style="flex: 1;">
                                <div
                                  style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;"
                                >
                                  ${(0,p.kg)("editor.icon.migration_title",c,"Template Migration Available")}
                                </div>
                                <div
                                  style="font-size: 14px; color: var(--primary-text-color); margin-bottom: 12px; line-height: 1.5;"
                                >
                                  ${(0,p.kg)("editor.icon.migration_desc",c,`You have ${(0,h.aI)(t).templateCount} separate template(s). Combine them into one unified template for easier editing and better entity remapping support.`)}
                                </div>
                                <div style="display: flex; gap: 12px;">
                                  <button
                                    style="
                                background: var(--primary-color);
                                color: white;
                                border: none;
                                border-radius: 8px;
                                padding: 10px 20px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                              "
                                    @click=${()=>{const e=(0,h.Xc)(t);this._updateIcon(r,i,{unified_template_mode:e.unified_template_mode,unified_template:e.unified_template,ignore_entity_state_config:e.ignore_entity_state_config,template_mode:!1,dynamic_icon_template_mode:!1,dynamic_color_template_mode:!1},o)}}
                                    @mouseover=${t=>{const e=t.target;e.style.transform="translateY(-2px)",e.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.3)"}}
                                    @mouseout=${t=>{const e=t.target;e.style.transform="translateY(0)",e.style.boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"}}
                                  >
                                    ${(0,p.kg)("editor.icon.migrate_button",c,"Migrate to Unified Template")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        `:""}

                    <!-- Unified Template Section (New Preferred Method) -->
                    <div class="template-section" style="margin-bottom: 24px;">
                      <div class="template-header">
                        <div class="switch-container">
                          <div class="switch-label-row">
                            <label class="switch-label"
                              >${(0,p.kg)("editor.icon.unified_template_section.title",c,"Template Mode")}</label
                            >
                            <button
                              class="help-btn"
                              style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:#fff;cursor:pointer;border-radius:50%;line-height:0;"
                              title="${(0,p.kg)("editor.icon.template_cheatsheet",c,"Template Cheatsheet")}"
                              @click=${t=>{t.currentTarget.dispatchEvent(new CustomEvent("uc-open-template-cheatsheet",{detail:{module:"icon"},bubbles:!0,composed:!0}))}}
                            >
                              <ha-icon icon="mdi:help-circle" style="--mdc-icon-size:18px;width:18px;height:18px;color:#fff;"></ha-icon>
                            </button>
                          </div>
                          <label class="switch">
                            <input
                              type="checkbox"
                              .checked=${t.unified_template_mode||!1}
                              @change=${t=>{const e=t.target.checked;this._updateIcon(r,i,{unified_template_mode:e},o)}}
                            />
                            <span class="slider round"></span>
                          </label>
                        </div>
                        <div class="template-description">
                          ${(0,p.kg)("editor.icon.unified_template_section.desc",c,"Use Jinja2 templates to control icon and color dynamically. Return simple string for icon-only, or JSON object for multiple properties. Uses entity context variables (entity, state, name, attributes) for seamless entity remapping.")}
                        </div>
                      </div>

                      <!-- Cheatsheet Component (always available) -->
                      <uc-template-cheatsheet .module=${"icon"}></uc-template-cheatsheet>

                      ${t.unified_template_mode?n.qy`
                            <!-- Ignore Entity State Config Toggle -->
                            <div
                              style="margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1); border-radius: 8px; border-left: 4px solid var(--warning-color, #FF9800);"
                            >
                              <div style="display: flex; align-items: center; gap: 12px;">
                                <ha-switch
                                  .checked=${t.ignore_entity_state_config||!1}
                                  @change=${t=>{const e=t.target;this._updateIcon(r,i,{ignore_entity_state_config:e.checked},o)}}
                                ></ha-switch>
                                <div style="flex: 1;">
                                  <div style="font-weight: 600; margin-bottom: 4px;">
                                    ${(0,p.kg)("editor.icon.ignore_entity_state",c,"Ignore Entity State Config")}
                                  </div>
                                  <div style="font-size: 12px; color: var(--secondary-text-color);">
                                    ${(0,p.kg)("editor.icon.ignore_entity_state_desc",c,"When enabled, entity state settings above will be ignored and template will control active/inactive state for animations")}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              class="template-content"
                              @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                              @dragstart=${t=>t.stopPropagation()}
                              @insert-snippet=${t=>{var e,i,n;const o=t.currentTarget.querySelector("ultra-template-editor");null===(e=null==o?void 0:o.insertAtCursor)||void 0===e||e.call(o,null!==(n=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==n?n:"")}}
                            >
                              <ultra-template-editor
                                .hass=${e}
                                .value=${t.unified_template||""}
                                .placeholder=${'{% set level = state | int %}\n{\n  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",\n  "icon_color": "{% if level <= 20 %}red{% else %}green{% endif %}"\n}'}
                                .minHeight=${200}
                                .maxHeight=${500}
                                @value-changed=${t=>{this._updateIcon(r,i,{unified_template:t.detail.value},o)}}
                              ></ultra-template-editor>
                              <div class="template-help">
                                <p><strong>Return simple string for icon-only:</strong></p>
                                <ul>
                                  <li><code>mdi:fire</code> → Changes icon only</li>
                                  <li>
                                    <code
                                      >{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{%
                                      endif %}</code
                                    >
                                  </li>
                                </ul>
                                <p><strong>Return JSON for multiple properties:</strong></p>
                                <ul>
                                  <li>
                                    <code>{ "icon": "mdi:fire", "icon_color": "#FF0000" }</code>
                                  </li>
                                  <li>
                                    Available properties: <code>icon</code>, <code>icon_color</code>
                                  </li>
                                </ul>
                                <p>
                                  <strong
                                    >Entity context variables (no need to hardcode entity
                                    ID):</strong
                                  >
                                </p>
                                <ul>
                                  <li><code>entity</code> → Entity ID (${t.entity})</li>
                                  <li><code>state</code> → Current state value</li>
                                  <li><code>name</code> → Entity name</li>
                                  <li><code>attributes</code> → All entity attributes</li>
                                  <li><code>unit</code> → Unit of measurement</li>
                                  <li>
                                    <code>domain</code> → Entity domain (e.g., 'sensor', 'light')
                                  </li>
                                  <li><code>device_class</code> → Device class</li>
                                </ul>
                                <p><strong>Example - Works with ANY battery entity:</strong></p>
                                <code
                                  style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px;"
                                >
                                  {% set level = state | int %}<br />
                                  {<br />
                                  &nbsp;&nbsp;"icon": "mdi:battery-{{ (level / 10) | round(0) * 10
                                  }}",<br />
                                  &nbsp;&nbsp;"icon_color": "{% if level <= 20 %}#FF0000{% elif
                                  level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"<br />
                                  }
                                </code>
                              </div>
                            </div>
                          `:""}
                    </div>

                    <!-- Icon Animation Section -->
                    ${this.renderSettingsSection((0,p.kg)("editor.icon.animation_section.title",c,"Icon Animation"),(0,p.kg)("editor.icon.animation_section.desc",c,"Configure animations for active and inactive states"),[{title:(0,p.kg)("editor.icon.active_animation",c,"Active Animation"),description:(0,p.kg)("editor.icon.active_animation_desc",c,"Animation when icon is active"),hass:e,data:{active_icon_animation:t.active_icon_animation||"none"},schema:[this.selectField("active_icon_animation",[{value:"none",label:(0,p.kg)("editor.icon.animation_none",c,"None")},{value:"pulse",label:(0,p.kg)("editor.icon.animation_pulse",c,"Pulse")},{value:"spin",label:(0,p.kg)("editor.icon.animation_spin",c,"Spin")},{value:"bounce",label:(0,p.kg)("editor.icon.animation_bounce",c,"Bounce")},{value:"flash",label:(0,p.kg)("editor.icon.animation_flash",c,"Flash")},{value:"shake",label:(0,p.kg)("editor.icon.animation_shake",c,"Shake")},{value:"vibrate",label:(0,p.kg)("editor.icon.animation_vibrate",c,"Vibrate")},{value:"rotate-left",label:(0,p.kg)("editor.icon.animation_rotate_left",c,"Rotate Left")},{value:"rotate-right",label:(0,p.kg)("editor.icon.animation_rotate_right",c,"Rotate Right")},{value:"fade",label:(0,p.kg)("editor.icon.animation_fade",c,"Fade")},{value:"scale",label:(0,p.kg)("editor.icon.animation_scale",c,"Scale")},{value:"tada",label:(0,p.kg)("editor.icon.animation_tada",c,"Tada")}])],onChange:t=>{const e=this._formValue(t,"active_icon_animation");if(void 0===e)return;const n=String(e);n!==(r.icons[i].active_icon_animation||"none")&&(this._updateIcon(r,i,{active_icon_animation:n},o),setTimeout((()=>{this._triggerPreviewUpdate()}),50))}},{title:(0,p.kg)("editor.icon.inactive_animation",c,"Inactive Animation"),description:(0,p.kg)("editor.icon.inactive_animation_desc",c,"Animation when icon is inactive"),hass:e,data:{inactive_icon_animation:t.inactive_icon_animation||"none"},schema:[this.selectField("inactive_icon_animation",[{value:"none",label:(0,p.kg)("editor.icon.animation_none",c,"None")},{value:"pulse",label:(0,p.kg)("editor.icon.animation_pulse",c,"Pulse")},{value:"spin",label:(0,p.kg)("editor.icon.animation_spin",c,"Spin")},{value:"bounce",label:(0,p.kg)("editor.icon.animation_bounce",c,"Bounce")},{value:"flash",label:(0,p.kg)("editor.icon.animation_flash",c,"Flash")},{value:"shake",label:(0,p.kg)("editor.icon.animation_shake",c,"Shake")},{value:"vibrate",label:(0,p.kg)("editor.icon.animation_vibrate",c,"Vibrate")},{value:"rotate-left",label:(0,p.kg)("editor.icon.animation_rotate_left",c,"Rotate Left")},{value:"rotate-right",label:(0,p.kg)("editor.icon.animation_rotate_right",c,"Rotate Right")},{value:"fade",label:(0,p.kg)("editor.icon.animation_fade",c,"Fade")},{value:"scale",label:(0,p.kg)("editor.icon.animation_scale",c,"Scale")},{value:"tada",label:(0,p.kg)("editor.icon.animation_tada",c,"Tada")}])],onChange:t=>{const e=this._formValue(t,"inactive_icon_animation");if(void 0===e)return;const n=String(e);n!==(r.icons[i].inactive_icon_animation||"none")&&(this._updateIcon(r,i,{inactive_icon_animation:n},o),setTimeout((()=>{this._triggerPreviewUpdate()}),50))}}])}
                  `}
            </div>
          `}))}
      </div>
    `}_renderStaticIconSettings(t,e,i,o,a,r){var c;return n.qy`
      <!-- Static Icon Settings -->
      <div class="settings-section" style="margin-bottom: 24px;">
        <div class="section-title">
          ${(0,p.kg)("editor.icon.static_icon_settings.title",a,"ICON SETTINGS")}
        </div>
        <div
          class="section-description"
          style="margin-bottom: 16px; font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;"
        >
          ${(0,p.kg)("editor.icon.static_icon_settings.desc",a,"Configure the appearance of this static icon")}
        </div>

        <!-- Icon Picker -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${(0,p.kg)("editor.icon.icon",a,"Icon")}</div>
          <div class="field-description">
            ${(0,p.kg)("editor.icon.icon_desc",a,"Select an MDI icon")}
          </div>
          ${this.renderUcForm(o,{icon_inactive:t.icon_inactive||"mdi:star"},[this.iconField("icon_inactive")],(t=>{const n=t.detail.value.icon_inactive;this._updateIcon(i,e,{icon_inactive:n,icon_active:n},r),setTimeout((()=>this._triggerPreviewUpdate()),50)}),!1)}
        </div>

        <!-- Icon Size -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${(0,p.kg)("editor.icon.icon_size",a,"Icon Size")}</div>
          <div class="field-description">
            ${(0,p.kg)("editor.icon.icon_size_desc",a,"Size of the icon in pixels")}
          </div>
          ${this._renderSizeControl(i,e,r,"inactive_icon_size",t.inactive_icon_size||26,0,100,26)}
        </div>

        <!-- Icon Color -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${(0,p.kg)("editor.icon.icon_color",a,"Icon Color")}</div>
          <div class="field-description">
            ${(0,p.kg)("editor.icon.icon_color_desc",a,"Color of the icon")}
          </div>
          <ultra-color-picker
            .value=${t.inactive_icon_color||"var(--primary-color)"}
            @value-changed=${t=>{this._updateIcon(i,e,{inactive_icon_color:t.detail.value,active_icon_color:t.detail.value},r),setTimeout((()=>this._triggerPreviewUpdate()),50)}}
          ></ultra-color-picker>
        </div>

        <!-- Background Shape -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">
            ${(0,p.kg)("editor.icon.background_shape",a,"Background Shape")}
          </div>
          <div class="field-description">
            ${(0,p.kg)("editor.icon.background_shape_desc",a,"Shape behind the icon")}
          </div>
          ${this.renderUcForm(o,{inactive_icon_background:t.inactive_icon_background||"none"},[this.selectField("inactive_icon_background",[{value:"none",label:(0,p.kg)("editor.icon.shape_none",a,"None")},{value:"circle",label:(0,p.kg)("editor.icon.shape_circle",a,"Circle")},{value:"square",label:(0,p.kg)("editor.icon.shape_square",a,"Square")},{value:"rounded-square",label:(0,p.kg)("editor.icon.shape_rounded",a,"Rounded Square")}])],(t=>{const n=this._formValue(t,"inactive_icon_background");if(void 0===n)return;const o=String(n);if(o===(i.icons[e].inactive_icon_background||"none"))return;const a={inactive_icon_background:o,active_icon_background:o};o&&"none"!==o&&(a.inactive_icon_background_color="var(--divider-color)",a.active_icon_background_color="var(--divider-color)"),this._updateIcon(i,e,a,r),setTimeout((()=>this._triggerPreviewUpdate()),50)}),!1)}
        </div>

        <!-- Background Color (only show if background shape is not 'none') -->
        ${t.inactive_icon_background&&"none"!==t.inactive_icon_background?n.qy`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${(0,p.kg)("editor.icon.background_color",a,"Background Color")}
                </div>
                <div class="field-description">
                  ${(0,p.kg)("editor.icon.background_color_desc",a,"Color of the background shape")}
                </div>
                <ultra-color-picker
                  .value=${t.inactive_icon_background_color||"var(--divider-color)"}
                  @value-changed=${t=>{this._updateIcon(i,e,{inactive_icon_background_color:t.detail.value,active_icon_background_color:t.detail.value},r),setTimeout((()=>this._triggerPreviewUpdate()),50)}}
                ></ultra-color-picker>
              </div>

              <!-- Background Padding -->
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${(0,p.kg)("editor.icon.background_padding",a,"Background Padding")}
                </div>
                <div class="field-description">
                  ${(0,p.kg)("editor.icon.background_padding_desc",a,"Distance from the icon to the background edge")}
                </div>
                ${this._renderBackgroundPaddingControl(i,e,r,null!==(c=t.inactive_icon_background_padding)&&void 0!==c?c:8)}
              </div>
            `:""}

        <!-- Animation -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${(0,p.kg)("editor.icon.animation",a,"Animation")}</div>
          <div class="field-description">
            ${(0,p.kg)("editor.icon.animation_desc",a,"Continuous animation for the icon")}
          </div>
          ${this.renderUcForm(o,{inactive_icon_animation:t.inactive_icon_animation||"none"},[this.selectField("inactive_icon_animation",[{value:"none",label:(0,p.kg)("editor.icon.animation_none",a,"None")},{value:"pulse",label:(0,p.kg)("editor.icon.animation_pulse",a,"Pulse")},{value:"spin",label:(0,p.kg)("editor.icon.animation_spin",a,"Spin")},{value:"bounce",label:(0,p.kg)("editor.icon.animation_bounce",a,"Bounce")},{value:"flash",label:(0,p.kg)("editor.icon.animation_flash",a,"Flash")},{value:"shake",label:(0,p.kg)("editor.icon.animation_shake",a,"Shake")},{value:"vibrate",label:(0,p.kg)("editor.icon.animation_vibrate",a,"Vibrate")},{value:"rotate-left",label:(0,p.kg)("editor.icon.animation_rotate_left",a,"Rotate Left")},{value:"rotate-right",label:(0,p.kg)("editor.icon.animation_rotate_right",a,"Rotate Right")},{value:"fade",label:(0,p.kg)("editor.icon.animation_fade",a,"Fade")},{value:"scale",label:(0,p.kg)("editor.icon.animation_scale",a,"Scale")},{value:"tada",label:(0,p.kg)("editor.icon.animation_tada",a,"Tada")}])],(t=>{const n=this._formValue(t,"inactive_icon_animation");if(void 0===n)return;const o=String(n);o!==(i.icons[e].inactive_icon_animation||"none")&&(this._updateIcon(i,e,{inactive_icon_animation:o,active_icon_animation:o},r),setTimeout((()=>this._triggerPreviewUpdate()),50))}),!1)}
        </div>

        <!-- Hover Effect -->
        <div class="field-container">
          <div class="field-title">
            ${(0,p.kg)("editor.icon.hover_effect",a,"Hover Effect")}
          </div>
          <div class="field-description">
            ${(0,p.kg)("editor.icon.hover_effect_desc",a,"Enable hover animation on mouse over")}
          </div>
          <ha-switch
            .checked=${t.enable_hover_effect||!1}
            @change=${t=>{const n=t.target;this._updateIcon(i,e,{enable_hover_effect:n.checked},r),setTimeout((()=>this._triggerPreviewUpdate()),50)}}
          ></ha-switch>
        </div>
      </div>
    `}renderActionsTab(t,e,i,n){return r.A.render(t,e,(t=>n(t)))}renderLogicTab(t,e,i,n){return m.X.render(t,e,(t=>n(t)))}renderOtherTab(t,e,i,n){return this.renderLogicTab(t,e,i,n)}renderPreview(t,e,i,o){var a;const r=t;!this._templateService&&e&&(this._templateService=new c.I(e)),this._templateService&&e&&this._templateService.updateHass(e);const s=r,d=r.design||{},_={color:r.color||d.color,font_size:r.font_size||d.font_size,font_weight:r.font_weight||d.font_weight,font_style:r.font_style||d.font_style,text_transform:r.text_transform||d.text_transform,font_family:r.font_family||d.font_family,line_height:r.line_height||d.line_height,letter_spacing:r.letter_spacing||d.letter_spacing,text_align:r.text_align||d.text_align,text_shadow_h:r.text_shadow_h||d.text_shadow_h,text_shadow_v:r.text_shadow_v||d.text_shadow_v,text_shadow_blur:r.text_shadow_blur||d.text_shadow_blur,text_shadow_color:r.text_shadow_color||d.text_shadow_color,background_color:r.background_color||d.background_color,background_image:r.background_image||d.background_image,background_image_type:r.background_image_type||d.background_image_type,background_image_entity:r.background_image_entity||d.background_image_entity,background_size:r.background_size||d.background_size,background_position:r.background_position||d.background_position,background_repeat:r.background_repeat||d.background_repeat,border_radius:r.border_radius||d.border_radius,border_style:r.border_style||d.border_style,border_width:r.border_width||d.border_width,border_color:r.border_color||d.border_color,padding_top:r.padding_top||d.padding_top,padding_bottom:r.padding_bottom||d.padding_bottom,padding_left:r.padding_left||d.padding_left,padding_right:r.padding_right||d.padding_right,margin_top:r.margin_top||d.margin_top,margin_bottom:r.margin_bottom||d.margin_bottom,margin_left:r.margin_left||d.margin_left,margin_right:r.margin_right||d.margin_right,position:r.position||d.position,top:r.top||d.top,bottom:r.bottom||d.bottom,left:r.left||d.left,right:r.right||d.right,z_index:r.z_index||d.z_index,width:r.width||d.width,height:r.height||d.height,max_width:r.max_width||d.max_width,max_height:r.max_height||d.max_height,min_width:r.min_width||d.min_width,min_height:r.min_height||d.min_height,overflow:r.overflow||d.overflow,clip_path:r.clip_path||d.clip_path,backdrop_filter:r.backdrop_filter||d.backdrop_filter,box_shadow_h:r.box_shadow_h||d.box_shadow_h,box_shadow_v:r.box_shadow_v||d.box_shadow_v,box_shadow_blur:r.box_shadow_blur||d.box_shadow_blur,box_shadow_spread:r.box_shadow_spread||d.box_shadow_spread,box_shadow_color:r.box_shadow_color||d.box_shadow_color,hover_effect:r.hover_effect||d.hover_effect};let p="";const m=(r.icons||[]).filter((t=>t.entity&&""!==t.entity.trim()));for(const t of m)if(t.unified_template_mode&&t.unified_template){!this._templateService&&e&&(this._templateService=new c.I(e));const n=this._hashString(t.unified_template),o=`unified_${t.entity}_${t.id}_${n}`;if(e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(o)){const n=this._getEntityContext(t,e);this._templateService.subscribeToTemplate(t.unified_template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),n,i)}const r=null===(a=null==e?void 0:e.__uvc_template_strings)||void 0===a?void 0:a[o];if(r&&""!==String(r).trim()){const t=(0,g.cv)(r);if(!(0,g.HD)(t)&&t.container_background_color){p=t.container_background_color;break}}}const u={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:_.padding_top||_.padding_bottom||_.padding_left||_.padding_right||s.padding_top||s.padding_bottom||s.padding_left||s.padding_right?`${this.addPixelUnit(_.padding_top||s.padding_top)||"0px"} ${this.addPixelUnit(_.padding_right||s.padding_right)||"0px"} ${this.addPixelUnit(_.padding_bottom||s.padding_bottom)||"0px"} ${this.addPixelUnit(_.padding_left||s.padding_left)||"0px"}`:"0",margin:_.margin_top||_.margin_bottom||_.margin_left||_.margin_right||s.margin_top||s.margin_bottom||s.margin_left||s.margin_right?`${_.margin_top||s.margin_top||"8px"} ${_.margin_right||s.margin_right||"0px"} ${_.margin_bottom||s.margin_bottom||"8px"} ${_.margin_left||s.margin_left||"0px"}`:"8px 0",background:p||_.background_color||s.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},s),_),e),backgroundSize:_.background_size||s.background_size||"cover",backgroundPosition:_.background_position||s.background_position||"center",backgroundRepeat:_.background_repeat||s.background_repeat||"no-repeat",border:(_.border_style||s.border_style)&&"none"!==(_.border_style||s.border_style)?`${this.addPixelUnit(_.border_width||s.border_width)||"1px"} ${_.border_style||s.border_style} ${_.border_color||s.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(_.border_radius||s.border_radius)||"0",position:_.position||s.position||"relative",top:_.top||s.top||"auto",bottom:_.bottom||s.bottom||"auto",left:_.left||s.left||"auto",right:_.right||s.right||"auto",zIndex:_.z_index||s.z_index||"auto",width:_.width||s.width||"100%",height:_.height||s.height||"auto",maxWidth:_.max_width||s.max_width||"100%",maxHeight:_.max_height||s.max_height||"none",minWidth:_.min_width||s.min_width||"none",minHeight:_.min_height||s.min_height||"auto",overflow:_.overflow||s.overflow||"hidden",clipPath:_.clip_path||s.clip_path||"none",backdropFilter:_.backdrop_filter||s.backdrop_filter||"none",boxShadow:_.box_shadow_h&&_.box_shadow_v?`${_.box_shadow_h||"0"} ${_.box_shadow_v||"0"} ${_.box_shadow_blur||"0"} ${_.box_shadow_spread||"0"} ${_.box_shadow_color||"rgba(0,0,0,0.1)"}`:s.box_shadow_h&&s.box_shadow_v?`${s.box_shadow_h||"0"} ${s.box_shadow_v||"0"} ${s.box_shadow_blur||"0"} ${s.box_shadow_spread||"0"} ${s.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"};this._injectGlobalStyles(),this._injectKeyframesForAllSplitPreviewIcons();const h=n.qy`<style>
        ${f._ANIMATION_KEYFRAMES}
        ${this.getStyles()}
      </style>`,b=(r.icons||[]).filter((t=>"static"===t.icon_mode||t.entity&&""!==t.entity.trim())),y=(r.icons||[]).filter((t=>"static"!==t.icon_mode&&(!t.entity||""===t.entity.trim())));if(!r.icons||0===r.icons.length)return n.qy`
        ${h}
        ${this.renderGradientErrorState("Add Icons","Configure icons in the General tab","mdi:shape-outline")}
      `;if(0===b.length&&y.length>0){const t=y.map(((t,e)=>`Icon ${e+1}`)).join(", ");return n.qy`
        ${h}
        ${this.renderGradientErrorState("Icons Need Entities",t,"mdi:shape-outline")}
      `}const x=y.length>0?this.renderGradientWarningBanner(`${y.length>1?"icons":"icon"} need${1===y.length?"s":""} entities`,y.length):"";return n.qy`
      ${h} ${x}
      <div class="icon-module-container" style=${this.styleObjectToCss(u)}>
        <div class="icon-module-preview">
          <div
            class="icon-grid"
            style="
            display: grid;
            grid-template-columns: repeat(${Math.min(r.columns||3,b.length)}, 1fr);
            grid-auto-flow: ${!1===r.allow_wrap?"column":"row"};
            gap: ${r.gap||16}px;
            justify-content: ${r.alignment||"center"};
          "
          >
            ${b.slice(0,6).map((t=>{var o,a,s,d,p,m,u,h,f,b,y,x,k,w,$,S,z;const I="static"===t.icon_mode,C=I||null==e?void 0:e.states[t.entity],T=(null==C?void 0:C.state)||"unknown",A=!I&&this._evaluateIconState(t,e);let U;const E=!!I||(A?!1!==t.show_icon_when_active:!1!==t.show_icon_when_inactive),j=!I&&(A?!1!==t.show_name_when_active:!1!==t.show_name_when_inactive),F=!I&&(A?!1!==t.show_state_when_active:!1!==t.show_state_when_inactive);let N=A&&t.icon_active||t.icon_inactive,P=A?t.use_state_color_for_active_icon?this._getEntityStateColor(C)||t.active_icon_color:t.use_entity_color_for_icon&&(null===(o=null==C?void 0:C.attributes)||void 0===o?void 0:o.rgb_color)?`rgb(${C.attributes.rgb_color.join(",")})`:t.active_icon_color:t.use_state_color_for_inactive_icon?this._getEntityStateColor(C)||t.inactive_icon_color:t.use_entity_color_for_icon&&(null===(a=null==C?void 0:C.attributes)||void 0===a?void 0:a.rgb_color)?`rgb(${C.attributes.rgb_color.join(",")})`:t.inactive_icon_color;if(t.unified_template_mode&&t.unified_template){!this._templateService&&e?this._templateService=new c.I(e):this._templateService&&e&&this._templateService.updateHass(e);const n=this._hashString(t.unified_template),o=`unified_${t.entity}_${t.id}_${n}`;if(e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(o)){const n=this._getEntityContext(t,e);this._templateService.subscribeToTemplate(t.unified_template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),n,i)}const a=null===(s=null==e?void 0:e.__uvc_template_strings)||void 0===s?void 0:s[o];if(a&&""!==String(a).trim()){const e=(0,g.cv)(a);(0,g.HD)(e)||(e.icon&&(N=e.icon),e.icon_color&&t.ignore_entity_state_config&&(P=e.icon_color),e.name&&(t._template_name=e.name),void 0!==e.state_text&&(t._template_state_text=e.state_text),e.name_color&&(t._template_name_color=e.name_color),e.state_color&&(t._template_state_color=e.state_color),e.container_background_color&&(U=e.container_background_color))}}else if(t.dynamic_icon_template_mode&&t.dynamic_icon_template){!this._templateService&&e?this._templateService=new c.I(e):this._templateService&&e&&this._templateService.updateHass(e);const n=this._hashString(t.dynamic_icon_template),o=`dynamic_icon_${t.entity}_${t.id}_${n}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(o)&&this._templateService.subscribeToTemplate(t.dynamic_icon_template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,i);const a=null===(d=null==e?void 0:e.__uvc_template_strings)||void 0===d?void 0:d[o];a&&""!==String(a).trim()&&(N=String(a))}else(null===(p=null==C?void 0:C.attributes)||void 0===p?void 0:p.icon)&&!N&&(N=C.attributes.icon);if(t.dynamic_color_template_mode&&t.dynamic_color_template){!this._templateService&&e?this._templateService=new c.I(e):this._templateService&&e&&this._templateService.updateHass(e);const n=this._hashString(t.dynamic_color_template),o=`dynamic_color_${t.entity}_${t.id}_${n}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(o)&&this._templateService.subscribeToTemplate(t.dynamic_color_template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,i);const a=null===(m=null==e?void 0:e.__uvc_template_strings)||void 0===m?void 0:m[o];a&&""!==String(a).trim()&&(P=String(a))}const q=t._template_name_color||_.color||(A?t.active_name_color:t.inactive_name_color),R=t._template_state_color||_.color||(A?t.active_state_color:t.inactive_state_color),L=_.font_size?/[a-zA-Z%]/.test(_.font_size)?_.font_size:this.addPixelUnit(_.font_size)||_.font_size:void 0,O=_.font_family||void 0,W=_.font_weight||void 0,M=_.font_style||void 0,B=_.text_transform||void 0,D=_.line_height||void 0,H=_.letter_spacing||void 0,V=_.text_align||void 0,G=_.text_shadow_h&&_.text_shadow_v?`${_.text_shadow_h||"0"} ${_.text_shadow_v||"0"} ${_.text_shadow_blur||"0"} ${_.text_shadow_color||"rgba(0,0,0,0.5)"}`:void 0,Y=t._template_name||(A?t.custom_active_name_text||t.name||(null===(u=null==C?void 0:C.attributes)||void 0===u?void 0:u.friendly_name)||t.entity:t.custom_inactive_name_text||t.name||(null===(h=null==C?void 0:C.attributes)||void 0===h?void 0:h.friendly_name)||t.entity);let K;if(void 0!==t._template_state_text)K=t._template_state_text;else if(t.template_mode&&t.template){!this._templateService&&e&&(this._templateService=new c.I(e));const n=this._hashString(t.template),o=`display_${t.entity}_${t.id}_${n}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(o)&&this._templateService.subscribeToTemplate(t.template,o,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}),void 0,i);const a=null===(f=null==e?void 0:e.__uvc_template_strings)||void 0===f?void 0:f[o];if(void 0!==a&&""!==String(a).trim()){const i=String(a).trim(),n=i.toLowerCase(),o=/^(mdi:|hass:|hass-clab:|hc:)/.test(i),r=["true","false","on","off","yes","no","0","1"].includes(n);o?(N=i,K=this._getDisplayStateValue(t,e,A)):K=r?A?t.custom_active_state_text&&""!==t.custom_active_state_text.trim()?t.custom_active_state_text:this._formatValueWithUnits(T,t.entity,t,e):t.custom_inactive_state_text&&""!==t.custom_inactive_state_text.trim()?t.custom_inactive_state_text:this._formatValueWithUnits(T,t.entity,t,e):"unknown"===String(a)?"Template Error: Check entity names":String(a)}else K=A?t.custom_active_state_text&&""!==t.custom_active_state_text.trim()?t.custom_active_state_text:this._formatValueWithUnits(T,t.entity,t,e):t.custom_inactive_state_text&&""!==t.custom_inactive_state_text.trim()?t.custom_inactive_state_text:this._formatValueWithUnits(T,t.entity,t,e)}else K=this._getDisplayStateValue(t,e,A);const X=A?t.active_icon_background||t.icon_background:t.inactive_icon_background||t.icon_background,Z=A?t.active_icon_background_color||t.icon_background_color:t.inactive_icon_background_color||t.icon_background_color,J=A?null!==(y=null!==(b=t.active_icon_background_padding)&&void 0!==b?b:t.icon_background_padding)&&void 0!==y?y:8:null!==(k=null!==(x=t.inactive_icon_background_padding)&&void 0!==x?x:t.icon_background_padding)&&void 0!==k?k:8,Q=(()=>{var e;if("none"===X)return{};const i=t.use_entity_color_for_icon_background&&(null===(e=null==C?void 0:C.attributes)||void 0===e?void 0:e.rgb_color)?`rgb(${C.attributes.rgb_color.join(",")})`:Z,{styles:n}=(0,v.U9)({color:i,fallback:Z||"transparent"});return Object.assign(Object.assign({},n),{borderRadius:"circle"===X?"50%":"rounded-square"===X?"8px":"0",padding:`${J}px`})})(),tt=Object.assign(Object.assign({},{display:"flex",alignItems:"center",justifyContent:"center"}),Q),et=t.active_icon_animation||"none",it=t.inactive_icon_animation||"none",nt=A?et:it,ot="none"!==nt?`icon-animation-${nt}`:"";ot&&setTimeout((()=>{this._updateIconAnimationClasses(t.entity,ot,A)}),100);const at={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:t.vertical_alignment||"center",padding:_.padding_top||_.padding_bottom||_.padding_left||_.padding_right?`${this.addPixelUnit(_.padding_top)||"0px"} ${this.addPixelUnit(_.padding_right)||"0px"} ${this.addPixelUnit(_.padding_bottom)||"0px"} ${this.addPixelUnit(_.padding_left)||"0px"}`:"0",borderRadius:_.border_radius?this.addPixelUnit(_.border_radius)||"0":"circle"===t.container_background_shape?"50%":"rounded"===t.container_background_shape?"8px":(t.container_background_shape,"0"),cursor:"pointer",transition:"all 0.2s ease",width:t.container_width?`${t.container_width}%`:"auto"};if(t.container_background_shape&&"none"!==t.container_background_shape){const i=U||t.container_background_color||"#808080",{styles:n}=(0,v.U9)({color:i,fallback:i,image:this.getBackgroundImageCSS(t,e),imageSize:t.background_size||"cover",imagePosition:t.background_position||"center",imageRepeat:t.background_repeat||"no-repeat"});Object.assign(at,n)}else U?(at.backgroundColor=U,at.background=U,_.border_radius&&(at.borderRadius=this.addPixelUnit(_.border_radius)||"0")):(at.background="transparent",at.backgroundColor="transparent");const rt=this.createGestureHandlers(`${r.id}_${t.id}`,{tap_action:r.tap_action,hold_action:r.hold_action,double_tap_action:r.double_tap_action,entity:t.entity,module:r},e,i),ct=null===(w=r.design)||void 0===w?void 0:w.hover_effect,st=l.k.getHoverEffectClass(ct);return n.qy`
                <div
                  class="icon-item-preview ${st}"
                  style=${this.styleObjectToCss(Object.assign(Object.assign({},at),{gap:"0px",touchAction:"manipulation",backgroundImage:this.getBackgroundImageCSS(t,e),backgroundSize:t.background_size||"cover",backgroundPosition:_.background_position||"center",backgroundRepeat:_.background_repeat||"no-repeat",margin:"0 auto"}))}
                  @pointerdown=${rt.onPointerDown}
                  @pointerup=${rt.onPointerUp}
                  @pointerleave=${rt.onPointerLeave}
                >
                  ${E?n.qy`
                        <div
                          style="${this.styleObjectToCss(Object.assign(Object.assign({},tt),{marginBottom:j?`${null!==($=t.name_icon_gap)&&void 0!==$?$:8}px`:F?`${null!==(S=t.icon_state_gap)&&void 0!==S?S:4}px`:"0px"}))}"
                        >
                          ${this._shouldUseEntityPicture(C)?n.qy`
                                <img
                                  src="${this._getEntityPicture(C,e)}"
                                  class="${ot} ultra-force-animation entity-picture"
                                  style="
                                    width: ${Number(A?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||26}px;
                                    height: ${Number(A?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||26}px;
                                    border-radius: 50%;
                                    object-fit: cover;
                                    ${ot&&"none"!==ot?`animation: ${this._getInlineAnimation(ot)} !important;`:""}
                                  "
                                  data-animation-debug="${ot||"none"}"
                                  data-is-active="${A}"
                                  alt="Entity picture"
                                />
                              `:n.qy`
                                <ha-icon
                                  icon="${N||"mdi:help-circle"}"
                                  class="${ot} ultra-force-animation"
                                  style="
                                    color: ${P||"var(--secondary-text-color)"};
                                    --mdc-icon-size: ${Number(A?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||26}px;
                                    ${ot&&"none"!==ot?`animation: ${this._getInlineAnimation(ot)} !important;`:""}
                                  "
                                  data-animation-debug="${ot||"none"}"
                                  data-is-active="${A}"
                                ></ha-icon>
                              `}
                        </div>
                      `:""}
                  ${j?n.qy`
                        <div
                          class="icon-name"
                          style="
                      font-size: ${L||`${A?t.active_text_size||t.text_size||12:t.inactive_text_size||t.text_size||14}px`};
                        color: ${q||"var(--primary-text-color)"};
                      text-align: ${V||"center"};
                      line-height: ${D||"1.2"};
                        max-width: 120px;
                      word-wrap: break-word;
                      margin-bottom: ${F?`${null!==(z=t.name_state_gap)&&void 0!==z?z:2}px`:"0px"};
                      font-family: ${O||"inherit"};
                      font-weight: ${W||"inherit"};
                      font-style: ${M||"inherit"};
                      text-transform: ${B||"inherit"};
                      letter-spacing: ${H||"inherit"};
                      text-shadow: ${G||"none"};
                    "
                        >
                          ${Y}
                        </div>
                      `:""}
                  ${F?n.qy`
                        <div
                          class="icon-state"
                          style="
                      font-size: ${L||`${A?t.active_state_size||t.state_size||12:t.inactive_state_size||t.state_size||12}px`};
                        color: ${R||"var(--secondary-text-color)"};
                      text-align: ${V||"center"};
                      line-height: ${D||"1.2"};
                      font-family: ${O||"inherit"};
                      font-weight: ${W||"inherit"};
                      font-style: ${M||"inherit"};
                      text-transform: ${B||"inherit"};
                      letter-spacing: ${H||"inherit"};
                      text-shadow: ${G||"none"};
                    "
                        >
                          ${K}
                        </div>
                      `:""}
                </div>
              `}))}
            ${b.length>6?n.qy`
                  <div
                    class="more-icons"
                    style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                color: var(--secondary-text-color);
                font-size: 12px;
                font-style: italic;
              "
                  >
                    +${b.length-6} more
                  </div>
                `:""}
          </div>

          <!-- More Icons Indicator -->
          ${b.length>6?n.qy`
                <div
                  class="more-icons"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    color: var(--secondary-text-color);
                    font-size: 12px;
                    font-style: italic;
                    margin-top: 8px;
                  "
                >
                  +${b.length-6} more icons
                </div>
              `:""}
        </div>
      </div>
    `}renderSplitPreview(t,e){var i;const o=t;let a=!1;if(o.icons.length>0){const t=o.icons[0];if(a=this._evaluateIconState(t,e),t.template_mode&&t.template){!this._templateService&&e&&(this._templateService=new c.I(e));const n=this._hashString(t.template),o=`display_${t.entity}_${t.id}_${n}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(o)&&this._templateService.subscribeToTemplate(t.template,o,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}));const r=null===(i=null==e?void 0:e.__uvc_template_strings)||void 0===i?void 0:i[o];if(void 0!==r){const i=String(r).toLowerCase();if(["true","false","on","off","yes","no","0","1"].includes(i))a=["true","on","yes","1"].includes(i)||parseFloat(i)>0&&!isNaN(parseFloat(i));else if(""!==String(r).trim()){const i=null==e?void 0:e.states[t.entity],n=(null==i?void 0:i.state)||"unknown";a=String(r)!==n||this._evaluateIconState(t,e)}else a=!1}}else a=this._evaluateIconState(t,e)}return this._injectGlobalStyles(),this._injectKeyframesForAllSplitPreviewIcons(),n.qy`
      <style>
        ${f._ANIMATION_KEYFRAMES} .icon-split-preview {
          --animation-duration: 2s;
          --animation-timing: linear;
        }
        .icon-split-preview .icon-animation-spin {
          animation: iconSpin var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-bounce {
          animation: iconBounce 1s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-pulse {
          animation: iconPulse 1.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-flash {
          animation: iconFlash 1s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-shake {
          animation: iconShake 0.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-vibrate {
          animation: iconVibrate 0.3s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-rotate-left {
          animation: iconRotateLeft var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-rotate-right {
          animation: iconRotateRight var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-fade {
          animation: iconFade 2s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-scale {
          animation: iconScale 1.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-tada {
          animation: iconTada 2s ease-in-out infinite;
        }
      </style>
      <div class="icon-split-preview">
        <!-- State Labels -->
        <div
          style="
               display: grid; 
               grid-template-columns: 1fr 1fr; 
               margin-bottom: 12px;
               text-align: center;
             "
        >
          <div>
            ${a?n.qy`<div style="height: 14px; margin-bottom: 4px;"></div>`:n.qy`<div
                  style="font-size: 10px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"
                >
                  Current
                </div>`}
            <div style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color);">
              Inactive State
            </div>
          </div>
          <div>
            ${a?n.qy`<div
                  style="font-size: 10px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"
                >
                  Current
                </div>`:n.qy`<div style="height: 14px; margin-bottom: 4px;"></div>`}
            <div style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color);">
              Active State
            </div>
          </div>
        </div>

        <!-- Split Preview Container -->
        <div
          style="
               display: grid; 
               grid-template-columns: 1fr 1fr; 
               border: 1px solid var(--divider-color); 
               border-radius: 8px; 
               overflow: hidden;
               min-height: 120px;
             "
        >
          <!-- Inactive Preview -->
          <div
            style="
                 background: var(--card-background-color);
                 border-right: 1px solid var(--divider-color);
                 padding: 16px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
               "
          >
            ${this._renderSimpleIconGrid(o,e,!1)}
          </div>

          <!-- Active Preview -->
          <div
            style="
                 background: var(--card-background-color);
                 padding: 16px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
               "
          >
            ${this._renderSimpleIconGrid(o,e,!0)}
          </div>
        </div>

        <!-- Icon Count Indicator -->
        ${o.icons.length>6?n.qy`
              <div
                style="
                 text-align: center;
                 padding: 8px;
                 color: var(--secondary-text-color);
                 font-size: 12px;
                 font-style: italic;
               "
              >
                Showing first 6 of ${o.icons.length} icons
              </div>
            `:""}
      </div>
    `}_renderSimpleIconGrid(t,e,i){const o=t.icons.slice(0,6),a=(Math.min(3,o.length),t.design||{}),r={color:a.color,font_size:a.font_size,font_weight:a.font_weight,font_style:a.font_style,text_transform:a.text_transform,font_family:a.font_family,line_height:a.line_height,letter_spacing:a.letter_spacing,text_align:a.text_align,text_shadow_h:a.text_shadow_h,text_shadow_v:a.text_shadow_v,text_shadow_blur:a.text_shadow_blur,text_shadow_color:a.text_shadow_color,background_position:a.background_position,background_repeat:a.background_repeat,hover_effect:a.hover_effect};return n.qy`
      <div
        style="
          display: flex;
        "
      >
        ${o.map((n=>this._renderSingleIconPreview(n,e,i,t,r)))}
      </div>
    `}_renderSingleIconPreview(t,e,i,o,a){var r,s,_,p,m,u,h,f,b,y,x,k,w,$,S,z,I;const C=null==e?void 0:e.states[t.entity],T=(null==C?void 0:C.state)||"unknown";let A;const U=i?!1!==t.show_icon_when_active:!1!==t.show_icon_when_inactive,E=i?!1!==t.show_name_when_active:!1!==t.show_name_when_inactive,j=i?!1!==t.show_state_when_active:!1!==t.show_state_when_inactive;let F=i&&t.icon_active||t.icon_inactive,N=i?t.use_state_color_for_active_icon?this._getEntityStateColor(C)||t.active_icon_color:t.use_entity_color_for_icon&&(null===(r=null==C?void 0:C.attributes)||void 0===r?void 0:r.rgb_color)?`rgb(${C.attributes.rgb_color.join(",")})`:t.active_icon_color:t.use_state_color_for_inactive_icon?this._getEntityStateColor(C)||t.inactive_icon_color:t.use_entity_color_for_icon&&(null===(s=null==C?void 0:C.attributes)||void 0===s?void 0:s.rgb_color)?`rgb(${C.attributes.rgb_color.join(",")})`:t.inactive_icon_color;if(t.unified_template_mode&&t.unified_template){!this._templateService&&e&&(this._templateService=new c.I(e));const i=this._hashString(t.unified_template),n=`unified_${t.entity}_${t.id}_${i}`;if(e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(n)){const i=this._getEntityContext(t,e);this._templateService.subscribeToTemplate(t.unified_template,n,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}),i)}const o=null===(_=null==e?void 0:e.__uvc_template_strings)||void 0===_?void 0:_[n];if(o&&""!==String(o).trim()){const e=(0,g.cv)(o);(0,g.HD)(e)||(e.icon&&(F=e.icon),e.icon_color&&t.ignore_entity_state_config&&(N=e.icon_color),e.name&&(t._template_name=e.name),void 0!==e.state_text&&(t._template_state_text=e.state_text),e.name_color&&(t._template_name_color=e.name_color),e.state_color&&(t._template_state_color=e.state_color),e.container_background_color&&(A=e.container_background_color))}}else if(t.dynamic_icon_template_mode&&t.dynamic_icon_template){!this._templateService&&e&&(this._templateService=new c.I(e));const i=this._hashString(t.dynamic_icon_template),n=`dynamic_icon_${t.entity}_${t.id}_${i}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(n)&&this._templateService.subscribeToTemplate(t.dynamic_icon_template,n,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}));const o=null===(p=null==e?void 0:e.__uvc_template_strings)||void 0===p?void 0:p[n];o&&""!==String(o).trim()&&(F=String(o))}else(null===(m=null==C?void 0:C.attributes)||void 0===m?void 0:m.icon)&&!F&&(F=C.attributes.icon);if(t.dynamic_color_template_mode&&t.dynamic_color_template){!this._templateService&&e&&(this._templateService=new c.I(e));const i=this._hashString(t.dynamic_color_template),n=`dynamic_color_${t.entity}_${t.id}_${i}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(n)&&this._templateService.subscribeToTemplate(t.dynamic_color_template,n,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}));const o=null===(u=null==e?void 0:e.__uvc_template_strings)||void 0===u?void 0:u[n];o&&""!==String(o).trim()&&(N=String(o))}const P=t._template_name_color||(null==a?void 0:a.color)||(i?t.active_name_color:t.inactive_name_color),q=t._template_state_color||(null==a?void 0:a.color)||(i?t.active_state_color:t.inactive_state_color),R=a?{fontSize:a.font_size?/[a-zA-Z%]/.test(a.font_size)?a.font_size:this.addPixelUnit(a.font_size)||a.font_size:void 0,fontFamily:a.font_family||void 0,fontWeight:a.font_weight||void 0,fontStyle:a.font_style||void 0,textTransform:a.text_transform||void 0,lineHeight:a.line_height||void 0,letterSpacing:a.letter_spacing||void 0,textAlign:a.text_align||void 0,textShadow:a.text_shadow_h&&a.text_shadow_v?`${a.text_shadow_h||"0"} ${a.text_shadow_v||"0"} ${a.text_shadow_blur||"0"} ${a.text_shadow_color||"rgba(0,0,0,0.5)"}`:void 0}:{fontSize:void 0,fontFamily:void 0,fontWeight:void 0,fontStyle:void 0,textTransform:void 0,lineHeight:void 0,letterSpacing:void 0,textAlign:void 0,textShadow:void 0},L=t._template_name||(i?t.custom_active_name_text||t.name||(null===(h=null==C?void 0:C.attributes)||void 0===h?void 0:h.friendly_name)||t.entity:t.custom_inactive_name_text||t.name||(null===(f=null==C?void 0:C.attributes)||void 0===f?void 0:f.friendly_name)||t.entity);let O;if(void 0!==t._template_state_text)O=t._template_state_text;else if(t.template_mode&&t.template){!this._templateService&&e&&(this._templateService=new c.I(e));const n=this._hashString(t.template),o=`state_${t.entity}_${t.id}_${n}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(o)&&this._templateService.subscribeToTemplate(t.template,o,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}));const a=null===(b=null==e?void 0:e.__uvc_template_strings)||void 0===b?void 0:b[o];if(void 0!==a&&""!==String(a).trim()){const n=String(a).trim(),o=n.toLowerCase(),r=/^(mdi:|hass:|hass-clab:|hc:)/.test(n),c=["true","false","on","off","yes","no","0","1"].includes(o);r?(F=n,O=this._getDisplayStateValue(t,e,i)):O=c?i?t.custom_active_state_text&&""!==t.custom_active_state_text.trim()?t.custom_active_state_text:this._formatValueWithUnits(T,t.entity,t,e):t.custom_inactive_state_text&&""!==t.custom_inactive_state_text.trim()?t.custom_inactive_state_text:this._formatValueWithUnits(T,t.entity,t,e):"unknown"===String(a)?"Template Error: Check entity names":String(a)}else O=this._formatValueWithUnits(T,t.entity,t,e)}else O=this._getDisplayStateValue(t,e,i);const W=i?t.active_icon_background||t.icon_background:t.inactive_icon_background||t.icon_background,M=i?t.active_icon_background_color||t.icon_background_color:t.inactive_icon_background_color||t.icon_background_color,B=i?null!==(x=null!==(y=t.active_icon_background_padding)&&void 0!==y?y:t.icon_background_padding)&&void 0!==x?x:8:null!==(w=null!==(k=t.inactive_icon_background_padding)&&void 0!==k?k:t.icon_background_padding)&&void 0!==w?w:8,D=(()=>{var e;if("none"===W)return{};const i=t.use_entity_color_for_icon_background&&(null===(e=null==C?void 0:C.attributes)||void 0===e?void 0:e.rgb_color)?`rgb(${C.attributes.rgb_color.join(",")})`:M,{styles:n}=(0,v.U9)({color:i,fallback:M||"transparent"});return Object.assign(Object.assign({},n),{borderRadius:"circle"===W?"50%":"rounded-square"===W?"8px":"0",padding:`${B}px`})})(),H=Object.assign(Object.assign({},{display:"flex",alignItems:"center",justifyContent:"center"}),D),V=t.active_icon_animation||"none",G=t.inactive_icon_animation||"none",Y=i?V:G,K="none"!==Y?`icon-animation-${Y}`:"",X={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:t.vertical_alignment||"center",padding:(null==a?void 0:a.padding_top)||(null==a?void 0:a.padding_bottom)||(null==a?void 0:a.padding_left)||(null==a?void 0:a.padding_right)?`${this.addPixelUnit(a.padding_top)||"0px"} ${this.addPixelUnit(a.padding_right)||"0px"} ${this.addPixelUnit(a.padding_bottom)||"0px"} ${this.addPixelUnit(a.padding_left)||"0px"}`:"0",borderRadius:(null==a?void 0:a.border_radius)?this.addPixelUnit(a.border_radius)||"0":"circle"===t.container_background_shape?"50%":"rounded"===t.container_background_shape?"8px":"square"===t.container_background_shape?"0":"8px",cursor:"pointer",transition:"all 0.2s ease",width:t.container_width?`${t.container_width}%`:"auto",margin:"0 auto"};if(t.container_background_shape&&"none"!==t.container_background_shape){const i=A||t.container_background_color||"#808080",{styles:n}=(0,v.U9)({color:i,fallback:i,image:this.getBackgroundImageCSS(t,e),imageSize:t.background_size||"cover",imagePosition:t.background_position||"center",imageRepeat:t.background_repeat||"no-repeat"});Object.assign(X,n)}else A?(X.backgroundColor=A,X.background=A,(null==a?void 0:a.border_radius)&&(X.borderRadius=this.addPixelUnit(a.border_radius)||"0")):(X.background="transparent",X.backgroundColor="transparent");const Z=null!==($=t.name_icon_gap)&&void 0!==$?$:8,J=null!==(S=t.name_state_gap)&&void 0!==S?S:2,Q=null!==(z=t.icon_state_gap)&&void 0!==z?z:4,tt=o?null===(I=o.design)||void 0===I?void 0:I.hover_effect:void 0,et=l.k.getHoverEffectClass(tt);return n.qy`
      <div
        class="icon-item-preview ${et}"
        style=${this.styleObjectToCss(Object.assign(Object.assign({},X),{gap:"0px"}))}
        @click=${i=>{if(i.preventDefault(),!o.tap_action||"nothing"!==o.tap_action.action){const n=o.tap_action||{action:"default",entity:t.entity};d.K.handleAction(n,e,i.target,void 0,t.entity,o)}}}
      >
        ${U?n.qy`
              <div
                style="${this.styleObjectToCss(Object.assign(Object.assign({},H),{marginBottom:E?`${Z}px`:j?`${Q}px`:"0px"}))}"
              >
                ${this._shouldUseEntityPicture(C)?n.qy`
                      <img
                        src="${this._getEntityPicture(C,e)}"
                        class="${K} ultra-force-animation entity-picture"
                        style="
                          width: ${Number(i?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||26}px;
                          height: ${Number(i?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size)||26}px;
                          border-radius: 50%;
                          object-fit: cover;
                          ${K&&"none"!==K?`animation: ${this._getInlineAnimation(K)} !important;`:""}
                        "
                        data-animation-debug="${K||"none"}"
                        data-is-active="${i}"
                        alt="Entity picture"
                      />
                    `:n.qy`
                      <ha-icon
                        icon="${F||"mdi:help-circle"}"
                        class="${K} ultra-force-animation"
                        style="
                          color: ${N||"var(--secondary-text-color)"};
                          --mdc-icon-size: ${(()=>{const e=Number(i?t.active_icon_size||t.icon_size:t.inactive_icon_size||t.icon_size);return e?`${e}px`:(null==o?void 0:o.icon_size)?`${o.icon_size}px`:"26px"})()};
                          ${K&&"none"!==K?`animation: ${this._getInlineAnimation(K)} !important;`:""}
                        "
                        data-animation-debug="${K||"none"}"
                        data-is-active="${i}"
                      ></ha-icon>
                    `}
              </div>
            `:""}
        ${E?n.qy`
              <div
                class="icon-name"
                style="
                  font-size: ${(()=>{if(R.fontSize)return R.fontSize;const e=i?t.active_text_size||t.text_size:t.inactive_text_size||t.text_size;return e?`${e}px`:(null==o?void 0:o.text_size)?`${o.text_size}px`:i?"12px":"14px"})()};
                  color: ${P||"var(--primary-text-color)"};
                  text-align: ${R.textAlign||"center"};
                  line-height: ${R.lineHeight||"1.2"};
                  max-width: 120px;
                  word-wrap: break-word;
                  margin-bottom: ${j?`${J}px`:"0px"};
                  font-family: ${R.fontFamily||"inherit"};
                  font-weight: ${R.fontWeight||"inherit"};
                  font-style: ${R.fontStyle||"inherit"};
                  text-transform: ${R.textTransform||"inherit"};
                  letter-spacing: ${R.letterSpacing||"inherit"};
                  text-shadow: ${R.textShadow||"none"};
                "
              >
                ${L}
              </div>
            `:""}
        ${j?n.qy`
              <div
                class="icon-state"
                style="
                  font-size: ${(()=>{if(R.fontSize)return R.fontSize;const e=i?t.active_state_size||t.state_size:t.inactive_state_size||t.state_size;return e?`${e}px`:(null==o?void 0:o.text_size)?`${o.text_size}px`:"10px"})()};
                  color: ${q||"var(--secondary-text-color)"};
                  text-align: ${R.textAlign||"center"};
                  line-height: ${R.lineHeight||"1.2"};
                  font-family: ${R.fontFamily||"inherit"};
                  font-weight: ${R.fontWeight||"inherit"};
                  font-style: ${R.fontStyle||"inherit"};
                  text-transform: ${R.textTransform||"inherit"};
                  letter-spacing: ${R.letterSpacing||"inherit"};
                  text-shadow: ${R.textShadow||"none"};
                "
              >
                ${O}
              </div>
            `:""}
      </div>
    `}renderIconGrid(t,e,i,o=!0){var a;const r=null===(a=t.design)||void 0===a?void 0:a.hover_effect,s=l.k.getHoverEffectClass(r),d=t.design||{},_={color:d.color,font_size:d.font_size,font_weight:d.font_weight,font_style:d.font_style,text_transform:d.text_transform,font_family:d.font_family,line_height:d.line_height,letter_spacing:d.letter_spacing,text_align:d.text_align,text_shadow_h:d.text_shadow_h,text_shadow_v:d.text_shadow_v,text_shadow_blur:d.text_shadow_blur,text_shadow_color:d.text_shadow_color,background_position:d.background_position,background_repeat:d.background_repeat,hover_effect:d.hover_effect};return n.qy`
      <div
        class="icon-grid"
        style="
          display: grid;
          grid-template-columns: repeat(${Math.min(Math.max(1,Math.floor((t.columns||3)/2)),t.icons.length)}, 1fr);
          grid-auto-flow: ${!1===t.allow_wrap?"column":"row"};
          gap: ${t.gap||16}px;
          justify-content: ${t.alignment||"center"};
        "
      >
        ${t.icons.slice(0,6).map((a=>{var r,l,d,p,m,u,h,f,b,y,x,k,w;const $=null==e?void 0:e.states[a.entity],S=(null==$||$.state,i);let z;if(a.unified_template_mode&&a.unified_template){!this._templateService&&e&&(this._templateService=new c.I(e));const t=this._hashString(a.unified_template),i=`unified_${a.entity}_${a.id}_${t}`;if(e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(i)){const t=this._getEntityContext(a,e);this._templateService.subscribeToTemplate(a.unified_template,i,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}),t)}const n=null===(r=null==e?void 0:e.__uvc_template_strings)||void 0===r?void 0:r[i];if(n&&""!==String(n).trim()){const t=(0,g.cv)(n);(0,g.HD)(t)||(t.icon&&(a._template_icon=t.icon),t.icon_color&&(a._template_icon_color=t.icon_color),t.name&&(a._template_name=t.name),void 0!==t.state_text&&(a._template_state_text=t.state_text),t.name_color&&(a._template_name_color=t.name_color),t.state_color&&(a._template_state_color=t.state_color),t.container_background_color&&(z=t.container_background_color))}}const I=S?!1!==a.show_icon_when_active:!1!==a.show_icon_when_inactive,C=S?!1!==a.show_name_when_active:!1!==a.show_name_when_inactive,T=S?!1!==a.show_state_when_active:!1!==a.show_state_when_inactive;let A=S&&a.icon_active||a.icon_inactive;(null===(l=null==$?void 0:$.attributes)||void 0===l?void 0:l.icon)&&!A&&(A=$.attributes.icon);const U=S?a.use_state_color_for_active_icon?this._getEntityStateColor($)||a.active_icon_color:a.use_entity_color_for_icon&&(null===(d=null==$?void 0:$.attributes)||void 0===d?void 0:d.rgb_color)?`rgb(${$.attributes.rgb_color.join(",")})`:a.active_icon_color:a.use_state_color_for_inactive_icon?this._getEntityStateColor($)||a.inactive_icon_color:a.use_entity_color_for_icon&&(null===(p=null==$?void 0:$.attributes)||void 0===p?void 0:p.rgb_color)?`rgb(${$.attributes.rgb_color.join(",")})`:a.inactive_icon_color,E=a._template_name_color||_.color||(S?a.active_name_color:a.inactive_name_color),j=a._template_state_color||_.color||(S?a.active_state_color:a.inactive_state_color),F=_.font_size?/[a-zA-Z%]/.test(_.font_size)?_.font_size:this.addPixelUnit(_.font_size)||_.font_size:void 0,N=_.font_family||void 0,P=_.font_weight||void 0,q=_.font_style||void 0,R=_.text_transform||void 0,L=_.line_height||void 0,O=_.letter_spacing||void 0,W=_.text_align||void 0,M=_.text_shadow_h&&_.text_shadow_v?`${_.text_shadow_h||"0"} ${_.text_shadow_v||"0"} ${_.text_shadow_blur||"0"} ${_.text_shadow_color||"rgba(0,0,0,0.5)"}`:void 0,B=a._template_name||(S?a.custom_active_name_text||a.name||(null===(m=null==$?void 0:$.attributes)||void 0===m?void 0:m.friendly_name)||a.entity:a.custom_inactive_name_text||a.name||(null===(u=null==$?void 0:$.attributes)||void 0===u?void 0:u.friendly_name)||a.entity);let D;D=void 0!==a._template_state_text?a._template_state_text:this._getDisplayStateValue(a,e,S);const H=S?a.active_icon_background||a.icon_background:a.inactive_icon_background||a.icon_background,V=S?a.active_icon_background_color||a.icon_background_color:a.inactive_icon_background_color||a.icon_background_color,G=S?null!==(f=null!==(h=a.active_icon_background_padding)&&void 0!==h?h:a.icon_background_padding)&&void 0!==f?f:8:null!==(y=null!==(b=a.inactive_icon_background_padding)&&void 0!==b?b:a.icon_background_padding)&&void 0!==y?y:8,Y=(()=>{var t;if("none"===H)return{};const e=a.use_entity_color_for_icon_background&&(null===(t=null==$?void 0:$.attributes)||void 0===t?void 0:t.rgb_color)?`rgb(${$.attributes.rgb_color.join(",")})`:V,{styles:i}=(0,v.U9)({color:e,fallback:V||"transparent"});return Object.assign(Object.assign({},i),{borderRadius:"circle"===H?"50%":"rounded-square"===H?"8px":"0",padding:`${G}px`})})(),K=Object.assign(Object.assign({},{display:"flex",alignItems:"center",justifyContent:"center"}),Y),X=a.active_icon_animation||"none",Z=a.inactive_icon_animation||"none",J=S?X:Z,Q="none"!==J?`icon-animation-${J}`:"";Q&&o&&setTimeout((()=>{this._updateIconAnimationClasses(a.entity,Q,S)}),150);const tt={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:a.vertical_alignment||"center",padding:"8px",borderRadius:"circle"===a.container_background_shape?"50%":"rounded"===a.container_background_shape?"8px":"square"===a.container_background_shape?"0":"8px",cursor:"pointer",transition:"all 0.2s ease",width:a.container_width?`${a.container_width}%`:"auto",margin:"0 auto"};if(a.container_background_shape&&"none"!==a.container_background_shape){const t=z||a.container_background_color||"#808080",{styles:i}=(0,v.U9)({color:t,fallback:t,image:this.getBackgroundImageCSS(a,e),imageSize:a.background_size||"cover",imagePosition:a.background_position||"center",imageRepeat:a.background_repeat||"no-repeat"});Object.assign(tt,i)}else z?(tt.backgroundColor=z,tt.background=z):(tt.background="transparent",tt.backgroundColor="transparent");const et=null!==(x=a.name_icon_gap)&&void 0!==x?x:8,it=null!==(k=a.name_state_gap)&&void 0!==k?k:2,nt=null!==(w=a.icon_state_gap)&&void 0!==w?w:4;return n.qy`
            <div
              class="icon-item-preview ${s}"
              style=${this.styleObjectToCss(Object.assign(Object.assign({},tt),{gap:"0px"}))}
            >
              ${I?n.qy`
                    <div
                      style="${this.styleObjectToCss(Object.assign(Object.assign({},K),{marginBottom:C?`${et}px`:T?`${nt}px`:"0px"}))}"
                    >
                      ${this._shouldUseEntityPicture($)?n.qy`
                            <img
                              src="${this._getEntityPicture($,e)}"
                              class="${Q} ultra-force-animation entity-picture"
                              style="
                                width: ${Number(S?a.active_icon_size||a.icon_size:a.inactive_icon_size||a.icon_size)||26}px;
                                height: ${Number(S?a.active_icon_size||a.icon_size:a.inactive_icon_size||a.icon_size)||26}px;
                                border-radius: 50%;
                                object-fit: cover;
                                ${Q&&"none"!==Q?`animation: ${this._getInlineAnimation(Q)} !important;`:""}
                              "
                              data-animation-debug="${Q||"none"}"
                              data-is-active="${S}"
                              alt="Entity picture"
                            />
                          `:n.qy`
                            <ha-icon
                              icon="${A||"mdi:help-circle"}"
                              class="${Q} ultra-force-animation"
                              style="
                                color: ${U||"var(--secondary-text-color)"};
                                --mdc-icon-size: ${(()=>{const e=Number(S?a.active_icon_size||a.icon_size:a.inactive_icon_size||a.icon_size);return e?`${e}px`:(null==t?void 0:t.icon_size)?`${t.icon_size}px`:"26px"})()};
                                ${Q&&"none"!==Q?`animation: ${this._getInlineAnimation(Q)} !important;`:""}
                              "
                              data-animation-debug="${Q||"none"}"
                              data-is-active="${S}"
                            ></ha-icon>
                          `}
                    </div>
                  `:""}
              ${C?n.qy`
                    <div
                      class="icon-name"
                      style="
                        font-size: ${F||`${S?a.active_text_size||a.text_size||12:a.inactive_text_size||a.text_size||14}px`};
                        color: ${E||"var(--primary-text-color)"};
                        text-align: ${W||"center"};
                        line-height: ${L||"1.2"};
                        max-width: 120px;
                        word-wrap: break-word;
                        margin-bottom: ${T?`${it}px`:"0px"};
                        font-family: ${N||"inherit"};
                        font-weight: ${P||"inherit"};
                        font-style: ${q||"inherit"};
                        text-transform: ${R||"inherit"};
                        letter-spacing: ${O||"inherit"};
                        text-shadow: ${M||"none"};
                      "
                    >
                      ${B}
                    </div>
                  `:""}
              ${T?n.qy`
                    <div
                      class="icon-state"
                      style="
                        font-size: ${F||`${S?a.active_state_size||a.state_size||10:a.inactive_state_size||a.state_size||10}px`};
                        color: ${j||"var(--secondary-text-color)"};
                        text-align: ${W||"center"};
                        line-height: ${L||"1.2"};
                        font-family: ${N||"inherit"};
                        font-weight: ${P||"inherit"};
                        font-style: ${q||"inherit"};
                        text-transform: ${R||"inherit"};
                        letter-spacing: ${O||"inherit"};
                        text-shadow: ${M||"none"};
                      "
                    >
                      ${D}
                    </div>
                  `:""}
            </div>
          `}))}
      </div>
    `}validate(t){const e=t,i=[...super.validate(t).errors];return e.icons&&e.icons.length>0&&e.icons.forEach(((t,e)=>{"static"===t.icon_mode?t.icon_inactive&&t.icon_inactive.trim():t.entity&&""!==t.entity.trim()||t.icon_inactive&&t.icon_inactive.trim()})),{valid:0===i.length,errors:i}}updateHass(t){this._templateService&&this._templateService.updateHass(t)}cleanup(){this._templateService&&(this._templateService.unsubscribeAllTemplates(),this._templateService=void 0),this._attributeCache.clear(),this._processingAttributes.clear(),this._updateTimeout&&(clearTimeout(this._updateTimeout),this._updateTimeout=void 0)}_getDisplayStateValue(t,e,i){var n,o;const a=null==e?void 0:e.states[t.entity];if(!a)return"unknown";const r=a.state;if(t.display_attribute&&void 0!==(null===(n=a.attributes)||void 0===n?void 0:n[t.display_attribute])){const i=a.attributes[t.display_attribute];return this._formatValueWithUnits(String(i),t.entity,t,e)}const c=i?t.active_attribute:t.inactive_attribute;if(c&&void 0!==(null===(o=a.attributes)||void 0===o?void 0:o[c])){const i=a.attributes[c];return this._formatValueWithUnits(String(i),t.entity,t,e)}const s=i?t.custom_active_state_text:t.custom_inactive_state_text;return s&&""!==s.trim()?s:this._formatValueWithUnits(r,t.entity,t,e)}_getEntityAttributes(t,e){var i;const n=[{value:"",label:"None (Use State)"}];try{if(!t||!(null===(i=null==e?void 0:e.states)||void 0===i?void 0:i[t]))return n;const o=e.states[t].attributes||{};return Object.keys(o).forEach((t=>{if(!t.startsWith("_")&&"friendly_name"!==t&&"entity_picture"!==t&&"supported_features"!==t&&"device_class"!==t&&"state_class"!==t){const e=o[t];let i="";i=null==e?"null":"object"==typeof e?Array.isArray(e)?`[${e.length} items]`:"{object}":String(e).substring(0,20),n.push({value:t,label:`${t} (${i})`})}})),n}catch(t){return console.error("Error getting attributes:",t),n}}_isBinaryEntity(t){const e=t.split(".")[0];return["binary_sensor","switch","input_boolean","automation","script","light","fan","lock","cover","device_tracker"].includes(e)}_matchesState(t,e,i){var n,o;if(t===e)return!0;if(t.toLowerCase()===e.toLowerCase())return!0;const a=e.match(/^(>=|<=|!=|>|<|=)\s*(.+)$/);if(a){const e=a[1],i=a[2].trim(),n=parseFloat(t),o=parseFloat(i);if(isNaN(n)||isNaN(o))switch(e){case"!=":return t.toLowerCase()!==i.toLowerCase();case"=":return t.toLowerCase()===i.toLowerCase();default:return!1}else switch(e){case">":return n>o;case">=":return n>=o;case"<":return n<o;case"<=":return n<=o;case"!=":return n!==o;case"=":return n===o}}const r=null===(n=null==i?void 0:i.entity_id)||void 0===n?void 0:n.split(".")[0],c=null===(o=null==i?void 0:i.attributes)||void 0===o?void 0:o.device_class,s=this._getStateMappings(r,c);return s[e.toLowerCase()]===t.toLowerCase()||s[t.toLowerCase()]===e.toLowerCase()}_getStateMappings(t,e){const i={on:"on",off:"off",true:"on",false:"off",yes:"on",no:"off",1:"on",0:"off"};switch(t){case"binary_sensor":if(i.open="on",i.closed="off",i.detected="on",i.clear="off",i.motion="on",i.no_motion="off",i.occupied="on",i.not_occupied="off",i.wet="on",i.dry="off",i.connected="on",i.disconnected="off",i.home="on",i.away="off",i.problem="on",i.ok="off",i.unsafe="on",i.safe="off",e)switch(e){case"door":case"window":case"garage_door":i.open="on",i.closed="off";break;case"lock":i.unlocked="on",i.locked="off";break;case"motion":i.motion="on",i.no_motion="off";break;case"occupancy":i.occupied="on",i.not_occupied="off";break;case"presence":i.home="on",i.away="off";break;case"connectivity":i.connected="on",i.disconnected="off"}break;case"cover":i.open="on",i.closed="off",i.opening="on",i.closing="off";break;case"lock":i.unlocked="on",i.locked="off",i.unlocking="on",i.locking="off";break;case"device_tracker":case"person":i.home="on",i.away="off",i.not_home="off";break;case"alarm_control_panel":i.disarmed="off",i.armed_home="on",i.armed_away="on",i.armed_night="on",i.armed_vacation="on",i.armed_custom_bypass="on"}return i}_evaluateIconState(t,e){var i,n,o,a,r,s;if("static"===t.icon_mode)return!1;const l=null==e?void 0:e.states[t.entity];if(!l)return!1;const d=l.state,_=t.inactive_attribute?(null===(n=null===(i=l.attributes)||void 0===i?void 0:i[t.inactive_attribute])||void 0===n?void 0:n.toString())||"":d,p=t.active_attribute?(null===(a=null===(o=l.attributes)||void 0===o?void 0:o[t.active_attribute])||void 0===a?void 0:a.toString())||"":d;let m=!1;if(t.unified_template_mode&&t.unified_template&&t.ignore_entity_state_config){m=!0,!this._templateService&&e?this._templateService=new c.I(e):this._templateService&&e&&this._templateService.updateHass(e);const i=this._hashString(t.unified_template),n=`unified_${t.entity}_${t.id}_${i}`;if(e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(n)){const i=this._getEntityContext(t,e);this._templateService.subscribeToTemplate(t.unified_template,n,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}),i)}const o=null===(r=null==e?void 0:e.__uvc_template_strings)||void 0===r?void 0:r[n];if(void 0!==o){const t=String(o).trim(),e=t.toLowerCase();if(["true","false","on","off","yes","no","0","1"].includes(e))return["true","on","yes","1"].includes(e)||parseFloat(e)>0&&!isNaN(parseFloat(e));if(t.startsWith("{")&&t.endsWith("}"))try{const e=JSON.parse(t);if(void 0!==e.active)return Boolean(e.active);if(void 0!==e.is_active)return Boolean(e.is_active)}catch(t){}}}if(!m&&t.template_mode&&t.template){!this._templateService&&e?this._templateService=new c.I(e):this._templateService&&e&&this._templateService.updateHass(e);const i=this._hashString(t.template),n=`display_${t.entity}_${t.id}_${i}`;e.__uvc_template_strings||(e.__uvc_template_strings={}),this._templateService&&!this._templateService.hasTemplateSubscription(n)&&this._templateService.subscribeToTemplate(t.template,n,(()=>{"undefined"!=typeof window&&window.dispatchEvent(new CustomEvent("ultra-card-template-update"))}));const o=null===(s=null==e?void 0:e.__uvc_template_strings)||void 0===s?void 0:s[n];if(void 0!==o){const e=String(o).toLowerCase();if(["true","false","on","off","yes","no","0","1"].includes(e))return["true","on","yes","1"].includes(e)||parseFloat(e)>0&&!isNaN(parseFloat(e));if(""===String(o).trim())return!1;if(String(o)===d);else if(!t.active_state&&!t.inactive_state)return!0}}if(t.active_state&&t.inactive_state)return!!this._matchesState(p,t.active_state,l)||(this._matchesState(_,t.inactive_state,l),!1);if(t.active_state)return this._matchesState(p,t.active_state,l);if(t.inactive_state)return!this._matchesState(_,t.inactive_state,l);if((t.active_attribute||t.inactive_attribute)&&!t.active_state&&!t.inactive_state){const t=parseFloat(p||_);if(!isNaN(t))return t>70;const e=(p||_).toLowerCase(),i=["sunny","clear","fair","cold","cool"];return!!["cloudy","rainy","stormy","snowy","windy","hot","warm"].some((t=>e.includes(t)))||!i.some((t=>e.includes(t)))}const v=t.active_attribute||t.inactive_attribute?t.active_attribute?p:_:d;if(["on","true","active","open","playing","home"].includes(v.toLowerCase()))return!0;if(["off","false","inactive","closed","paused","stopped","away","unavailable","unknown"].includes(v.toLowerCase()))return!1;const u=parseFloat(v);return!isNaN(u)&&u>0}_getEntityContext(t,e){return(0,u.pL)(t.entity,e,{name:t.name,icon_inactive:t.icon_inactive,icon_active:t.icon_active,active_state:t.active_state,inactive_state:t.inactive_state})}getStyles(){return`\n      /* Hide unwanted form labels with underscores and slots */\n      [slot='label'] {\n        display: none !important;\n      }\n\n      ha-form .mdc-form-field > label,\n      ha-form .mdc-text-field > label,\n      ha-form .mdc-floating-label,\n      ha-form .mdc-notched-outline__leading,\n      ha-form .mdc-notched-outline__notch,\n      ha-form .mdc-notched-outline__trailing,\n      ha-form .mdc-floating-label--float-above,\n      ha-form label[for],\n      ha-form .ha-form-label,\n      ha-form .form-label {\n        display: none !important;\n      }\n\n      /* Hide any labels containing underscores */\n      ha-form label[data-label*='_'],\n      ha-form .label-text:contains('_'),\n      label:contains('_') {\n        display: none !important;\n      }\n        .label {\n          display: none !important;\n        }\n\n      /* Additional safeguards for underscore labels */\n      ha-form .mdc-text-field-character-counter,\n      ha-form .mdc-text-field-helper-text,\n      ha-form mwc-formfield,\n      ha-form .formfield {\n        display: none !important;\n      }\n\n      /* Hide form field labels that match underscore patterns */\n      ha-form[data-field*='_'] label,\n      ha-form[data-field*='_'] .mdc-floating-label,\n      ha-form[data-field*='_'] .mdc-notched-outline__notch > .mdc-floating-label {\n        display: none !important;\n      }\n\n      /* Target specific underscore field names */\n      ha-form[data-field='use_entity_color_for_icon'] label,\n      ha-form[data-field='use_entity_color_for_icon_background'] label,\n      ha-form[data-field='show_name_when_active'] label,\n      ha-form[data-field='show_state_when_active'] label,\n      ha-form[data-field='show_icon_when_active'] label,\n      ha-form[data-field='show_name_when_inactive'] label,\n      ha-form[data-field='show_state_when_inactive'] label,\n      ha-form[data-field='show_icon_when_inactive'] label,\n      ha-form[data-field='active_template_mode'] label,\n      ha-form[data-field='inactive_template_mode'] label,\n      ha-form[data-field='dynamic_icon_template_mode'] label,\n      ha-form[data-field='dynamic_color_template_mode'] label {\n        display: none !important;\n      }\n\n      /* Make dynamic template toggles more compact */\n      ha-form[data-field='dynamic_icon_template_mode'] ha-switch,\n      ha-form[data-field='dynamic_color_template_mode'] ha-switch {\n        --mdc-switch-track-width: 36px !important;\n        --mdc-switch-track-height: 20px !important;\n        --switch-checked-track-color: var(--primary-color) !important;\n        --switch-unchecked-track-color: var(--disabled-color) !important;\n        transform: scale(0.8) !important;\n      }\n\n      ha-form[data-field='dynamic_icon_template_mode'] .mdc-switch,\n      ha-form[data-field='dynamic_color_template_mode'] .mdc-switch {\n        transform: scale(0.8) !important;\n      }\n\n      /* Hide any element with underscore in text content */\n      *:not(script):not(style) {\n        text-decoration: none !important;\n      }\n      \n      /* Target elements that might show underscore text */\n      .mdc-form-field__label:contains('_'),\n      .mdc-text-field__input + label:contains('_'),\n      .mdc-select__selected-text:contains('_') {\n        display: none !important;\n      }\n\n\n      \n      .icon-grid {\n        width: 100%;\n      }\n\n      /* Collapsible Header Styles */\n      .collapsible-header:hover {\n        background: rgba(var(--rgb-primary-color), 0.08) !important;\n        border-color: var(--primary-color) !important;\n      }\n\n      .collapsible-header:active {\n        transform: scale(0.98);\n      }\n\n      /* Split Preview Styles */\n      .split-preview-container {\n        position: relative;\n      }\n\n      .split-preview-container::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 50%;\n        transform: translateX(-50%);\n        width: 1px;\n        height: 100%;\n        background: var(--divider-color);\n        z-index: 1;\n      }\n\n      .icon-module-split-preview .inactive-preview .icon-item-preview {\n        border: 1px solid rgba(var(--rgb-primary-color), 0.1);\n        background: rgba(var(--rgb-primary-color), 0.02);\n      }\n\n      .icon-module-split-preview .active-preview .icon-item-preview {\n        border: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        background: rgba(var(--rgb-primary-color), 0.04);\n      }\n\n      .icon-module-split-preview .inactive-preview .icon-item-preview.hover-enabled:hover {\n        background: rgba(var(--rgb-primary-color), 0.08) !important;\n        border-color: var(--primary-color) !important;\n        transform: scale(1.02);\n      }\n\n      .icon-module-split-preview .active-preview .icon-item-preview.hover-enabled:hover {\n        background: rgba(var(--rgb-primary-color), 0.12) !important;\n        border-color: var(--primary-color) !important;\n        transform: scale(1.02);\n      }\n\n      /* Preview state indicators */\n      .icon-module-split-preview .preview-header div {\n        padding: 8px 12px;\n        border-radius: 20px;\n        font-size: 12px;\n        font-weight: 700;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        margin: 0 8px;\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border: 1px solid rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      /* Responsive adjustments for split view */\n      @media (max-width: 768px) {\n        .icon-module-split-preview .split-preview-container {\n          grid-template-columns: 1fr !important;\n          grid-template-rows: auto auto;\n        }\n\n        .icon-module-split-preview .preview-header {\n          flex-direction: column !important;\n          gap: 8px !important;\n        }\n\n        .icon-module-split-preview .inactive-preview {\n          border-right: none !important;\n          border-bottom: 1px solid var(--divider-color) !important;\n        }\n\n        .icon-module-split-preview .split-preview-container::before {\n          display: none;\n        }\n\n        .icon-module-split-preview .preview-header div {\n          margin: 0 !important;\n        }\n\n        .collapsible-header {\n          padding: 10px 12px !important;\n        }\n\n        .collapsible-header span {\n          font-size: 14px !important;\n        }\n\n        .collapsible-header ha-icon {\n          font-size: 16px !important;\n        }\n      }\n\n      @media (max-width: 480px) {\n        /* Removed mobile-specific icon-grid overrides to maintain consistent user-configured spacing */\n\n        .icon-module-split-preview .inactive-preview,\n        .icon-module-split-preview .active-preview {\n          padding: 8px !important;\n        }\n\n        .icon-module-split-preview .preview-header div {\n          font-size: 10px !important;\n          padding: 6px 8px !important;\n        }\n\n        .collapsible-header {\n          padding: 8px 10px !important;\n        }\n\n        .collapsible-header span {\n          font-size: 12px !important;\n        }\n\n        .collapsible-header ha-icon {\n          font-size: 14px !important;\n        }\n      }\n      \n      .icon-item-preview.hover-enabled:hover {\n        background: var(--primary-color) !important;\n        color: white;\n        transform: scale(1.05);\n      }\n      \n      .icon-item-preview.hover-enabled:hover ha-icon {\n        color: white !important;\n      }\n      \n      .icon-item-preview.hover-enabled:hover .icon-name,\n      .icon-item-preview.hover-enabled:hover .icon-state {\n        color: white !important;\n      }\n      \n      /* Field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n     \n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Expandable details styling */\n      details > summary {\n        list-style: none;\n      }\n\n      details > summary::-webkit-details-marker {\n        display: none;\n      }\n\n      details[open] > summary ha-icon {\n        transform: rotate(90deg);\n      }\n\n      details > summary:hover {\n        background: rgba(var(--rgb-primary-color), 0.1) !important;\n      }\n\n      /* Icon animations - Simple and direct selectors */\n      .icon-animation-pulse {\n        animation: iconPulse 2s ease-in-out infinite !important;\n      }\n\n      .icon-animation-spin {\n        animation: iconSpin 2s linear infinite !important;\n      }\n\n      .icon-animation-bounce {\n        animation: iconBounce 1s ease-in-out infinite !important;\n      }\n\n      .icon-animation-flash {\n        animation: iconFlash 1s ease-in-out infinite !important;\n      }\n\n      .icon-animation-shake {\n        animation: iconShake 0.5s ease-in-out infinite !important;\n      }\n\n      .icon-animation-vibrate {\n        animation: iconVibrate 0.3s ease-in-out infinite !important;\n      }\n\n      .icon-animation-rotate-left {\n        animation: iconRotateLeft 2s linear infinite !important;\n      }\n\n      .icon-animation-rotate-right {\n        animation: iconRotateRight 2s linear infinite !important;\n      }\n\n      .icon-animation-fade {\n        animation: iconFade 2s ease-in-out infinite !important;\n      }\n\n      .icon-animation-scale {\n        animation: iconScale 1s ease-in-out infinite !important;\n      }\n\n      .icon-animation-tada {\n        animation: iconTada 1s ease-in-out infinite !important;\n      }\n\n\n\n      @keyframes iconPulse {\n        0%, 100% { opacity: 1; transform: scale(1); }\n        50% { opacity: 0.7; transform: scale(1.1); }\n      }\n\n      @keyframes iconSpin {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n\n      @keyframes iconBounce {\n        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }\n        40% { transform: translateY(-10px); }\n        60% { transform: translateY(-5px); }\n      }\n\n      @keyframes iconFlash {\n        0%, 50%, 100% { opacity: 1; }\n        25%, 75% { opacity: 0.3; }\n      }\n\n      @keyframes iconShake {\n        0%, 100% { transform: translateX(0); }\n        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }\n        20%, 40%, 60%, 80% { transform: translateX(2px); }\n      }\n\n      @keyframes iconVibrate {\n        0%, 100% { transform: translate(0); }\n        10% { transform: translate(-1px, -1px); }\n        20% { transform: translate(1px, -1px); }\n        30% { transform: translate(-1px, 1px); }\n        40% { transform: translate(1px, 1px); }\n        50% { transform: translate(-1px, -1px); }\n        60% { transform: translate(1px, -1px); }\n        70% { transform: translate(-1px, 1px); }\n        80% { transform: translate(1px, 1px); }\n        90% { transform: translate(-1px, -1px); }\n      }\n\n      @keyframes iconRotateLeft {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(-360deg); }\n      }\n\n      @keyframes iconRotateRight {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n\n      @keyframes iconFade {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.3; }\n      }\n\n      @keyframes iconScale {\n        0%, 100% { transform: scale(1); }\n        50% { transform: scale(1.2); }\n      }\n\n      @keyframes iconTada {\n        0% { transform: scale(1); }\n        10%, 20% { transform: scale(0.9) rotate(-3deg); }\n        30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }\n        40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }\n        100% { transform: scale(1) rotate(0); }\n      }\n\n      @keyframes lockUnlockedPulse {\n        0%, 100% { \n          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);\n          border-color: var(--info-color, #2196F3);\n        }\n        50% { \n          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.4);\n          border-color: var(--info-color, #1976D2);\n        }\n      }\n\n      /* Respect user's motion preferences */\n      @media (prefers-reduced-motion: reduce) {\n        .lock-btn.unlocked {\n          animation: none !important;\n        }\n      }\n\n      /* Add icon button styling */\n      .add-icon-btn:hover {\n        background: var(--primary-color);\n        color: white;\n      }\n      \n      /* Remove icon button styling */\n      .remove-icon-btn:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n\n      /* Icon picker specific styling */\n      ha-icon-picker {\n        --ha-icon-picker-width: 100%;\n        --ha-icon-picker-height: 56px;\n      }\n\n      /* Dropdown styling */\n      ha-select {\n        width: 100%;\n        --ha-select-height: 40px;\n      }\n\n      /* Hide any radio buttons that might still be rendered */\n      ha-radio,\n      mwc-radio,\n      .mdc-radio {\n        display: none !important;\n      }\n\n      /* Text field and select consistency */\n      ha-textfield,\n      ha-select {\n        --mdc-shape-small: 8px;\n        --mdc-theme-primary: var(--primary-color);\n      }\n\n      /* Note: Dropdown positioning fixes are now handled globally in ultra-card-editor.ts */\n\n      /* Module tab content input width - restrict to icon module only */\n      .icon-module .module-tab-content input[type="number"], \n      .icon-module .module-tab-content input[type="text"],\n      .icon-module .module-tab-content .gap-input {\n        width: 25% !important;\n        max-width: 25% !important;\n        min-width: 25% !important;\n      }\n\n      /* Grid styling for layout options */\n      .settings-section[style*="grid"] > div {\n        min-width: 0;\n      }\n\n      /* Responsive adjustments */\n      @media (max-width: 768px) {\n        .settings-section[style*="grid-template-columns: 1fr 1fr 1fr"] {\n          grid-template-columns: 1fr !important;\n          gap: 12px !important;\n        }\n\n        .settings-section[style*="grid-template-columns: 1fr 1fr"] {\n          grid-template-columns: 1fr !important;\n          gap: 12px !important;\n        }\n\n        .conditional-fields-group {\n          border-left-width: 3px;\n        }\n        \n        .conditional-fields-header {\n          padding: 10px 12px;\n          font-size: 13px;\n        }\n        \n        .conditional-fields-content {\n          padding: 12px;\n        }\n\n        /* Mobile-friendly field titles and descriptions */\n        .field-title {\n          font-size: 14px !important;\n        }\n\n        .field-description {\n          font-size: 12px !important;\n          line-height: 1.3 !important;\n        }\n\n        .section-title {\n          font-size: 16px !important;\n        }\n\n        /* Mobile-friendly size controls */\n        .gap-control-container {\n          gap: 8px !important;\n        }\n\n        .gap-input {\n          width: 44px !important;\n          max-width: 44px !important;\n          min-width: 44px !important;\n          font-size: 12px !important;\n        }\n\n        .reset-btn {\n          width: 32px !important;\n          height: 32px !important;\n        }\n\n        .reset-btn ha-icon {\n          font-size: 14px !important;\n          display: flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          line-height: 1 !important;\n        }\n\n        /* Mobile-friendly lock buttons */\n        .lock-btn {\n          padding: 6px 12px !important;\n          font-size: 12px !important;\n        }\n\n        .lock-btn ha-icon {\n          font-size: 16px !important;\n        }\n\n        .lock-btn.unlocked {\n          border-color: var(--info-color, #2196F3) !important;\n          background: rgba(33, 150, 243, 0.15) !important;\n          color: var(--info-color, #2196F3) !important;\n          box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.3) !important;\n        }\n\n        .lock-btn.unlocked ha-icon {\n          color: var(--info-color, #2196F3) !important;\n        }\n\n        /* Mobile-friendly accordions */\n        details > summary {\n          padding: 12px !important;\n          font-size: 14px !important;\n        }\n\n        details > summary ha-icon {\n          font-size: 16px !important;\n        }\n\n        /* Mobile-friendly form fields */\n        .icon-settings-container {\n          padding: 12px !important;\n        }\n\n        /* Removed mobile-specific icon-grid overrides to maintain consistent user-configured spacing across all screen sizes */\n        /* Note: .icon-item-preview padding intentionally not modified on mobile to keep desktop/mobile parity */\n      }\n\n      /* Extra small devices (phones, 480px and down) */\n      @media (max-width: 480px) {\n        .field-title {\n          font-size: 13px !important;\n        }\n\n        .field-description {\n          font-size: 11px !important;\n        }\n\n        .section-title {\n          font-size: 14px !important;\n        }\n\n        .gap-input {\n          width: 40px !important;\n          max-width: 40px !important;\n          min-width: 40px !important;\n          font-size: 11px !important;\n        }\n\n        .reset-btn {\n          width: 28px !important;\n          height: 28px !important;\n        }\n\n        .reset-btn ha-icon {\n          font-size: 12px !important;\n          display: flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          line-height: 1 !important;\n        }\n\n        .lock-btn {\n          padding: 4px 8px !important;\n          font-size: 11px !important;\n        }\n\n        .lock-btn.unlocked {\n          border-color: var(--info-color, #2196F3) !important;\n          background: rgba(33, 150, 243, 0.15) !important;\n          color: var(--info-color, #2196F3) !important;\n          box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.3) !important;\n        }\n\n        .lock-btn.unlocked ha-icon {\n          color: var(--info-color, #2196F3) !important;\n        }\n\n        .icon-settings-container {\n          padding: 8px !important;\n        }\n\n        /* Stack lock controls vertically on very small screens */\n        .gap-control-container {\n          flex-wrap: wrap !important;\n          gap: 6px !important;\n        }\n\n        .gap-slider {\n          width: 100% !important;\n          order: 1;\n        }\n\n        .gap-input {\n          order: 2;\n        }\n\n        .reset-btn {\n          order: 3;\n        }\n\n        .lock-btn {\n          order: 4;\n          width: 100% !important;\n          justify-content: center !important;\n        }\n      }\n\n      /* Ensure form elements don't overflow */\n      .settings-section ha-form {\n        max-width: 100%;\n        overflow: visible;\n      }\n\n      /* Color picker adjustments */\n      .settings-section ha-form[data-field*="color"] {\n        min-height: 56px;\n      }\n\n      /* Boolean toggle adjustments */\n      .settings-section ha-form[data-field*="mode"] {\n        display: flex;\n        align-items: center;\n        min-height: auto;\n      }\n\n      /* Number slider adjustments */\n      .settings-section ha-form[data-field*="size"] .mdc-slider,\n      .settings-section ha-form[data-field*="gap"] .mdc-slider,\n      .settings-section ha-form[data-field*="columns"] .mdc-slider {\n        width: 100%;\n        max-width: 100%;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 48px !important;\n        max-width: 48px !important;\n        min-width: 48px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n        transform: none;\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        margin: 0;\n        padding: 0;\n        line-height: 1;\n      }\n\n      /* Lock button styles */\n      .lock-btn {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px 16px;\n        border: 2px solid var(--divider-color);\n        border-radius: 8px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        font-size: 14px;\n        font-weight: 500;\n        transition: all 0.3s ease;\n        outline: none;\n        position: relative;\n      }\n\n      .lock-btn:hover {\n        border-color: var(--primary-color);\n        background: var(--primary-color);\n        color: white;\n      }\n\n      .lock-btn.locked {\n        border-color: var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.1);\n        color: var(--primary-color);\n      }\n\n      .lock-btn.locked:hover {\n        background: var(--primary-color);\n        color: white;\n      }\n\n      button.lock-btn.unlocked {\n        background-color: var(--primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .lock-btn.unlocked {\n        border-color: var(--info-color, #2196F3) !important;\n        background: rgba(33, 150, 243, 0.15) !important;\n        color: var(--info-color, #2196F3) !important;\n        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2) !important;\n        animation: lockUnlockedPulse 2s ease-in-out infinite;\n      }\n\n      .lock-btn.unlocked:hover {\n        background: var(--info-color, #2196F3) !important;\n        color: white !important;\n        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.4) !important;\n        animation: none !important;\n      }\n\n      .lock-btn.unlocked ha-icon {\n        color: var(--info-color, #2196F3) !important;\n      }\n\n      .lock-btn.unlocked:hover ha-icon {\n        color: white !important;\n      }\n\n      .lock-btn ha-icon {\n        font-size: 18px;\n      }\n\n      /* Field lock button styling */\n      .field-container .lock-btn {\n        padding: 6px 12px;\n        font-size: 12px;\n        min-width: auto;\n      }\n\n      .field-container .lock-btn ha-icon {\n        font-size: 16px;\n      }\n\n      /* Icon settings container */\n      .icon-settings-container {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 24px;\n        border: 1px solid var(--divider-color);\n      }\n\n      .icon-header {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        margin-bottom: 16px;\n        padding-bottom: 12px;\n        border-bottom: 1px solid var(--divider-color);\n      }\n\n      .icon-preview {\n        width: 32px;\n        height: 32px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: var(--primary-color);\n        color: white;\n        border-radius: 50%;\n        flex-shrink: 0;\n      }\n\n      .icon-title {\n        flex: 1;\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n\n      .remove-icon-btn {\n        background: var(--error-color);\n        color: white;\n        border: none;\n        border-radius: 4px;\n        padding: 6px;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n      }\n\n      .remove-icon-btn:hover {\n        background: var(--error-color);\n        opacity: 0.8;\n      }\n\n      .remove-icon-btn:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n\n      .remove-icon-btn ha-icon {\n        font-size: 16px;\n      }\n\n      /* Size lock container */\n      .size-lock-container {\n        padding: 12px;\n        background: rgba(var(--rgb-primary-color), 0.05);\n        border-radius: 8px;\n        border: 1px solid rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      /* Removed overrides that modified ui_action options to avoid conflicts with HA selector */\n\n      /* Template Section Styles */\n      .template-section {\n        background: var(--card-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        border: 1px solid var(--divider-color);\n        margin-bottom: 32px;\n      }\n\n      .template-header {\n        margin-bottom: 16px;\n      }\n\n      .switch-container {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        gap: 8px;\n        margin-bottom: 8px;\n      }\n\n      .switch-label-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .switch-label {\n        font-weight: 600;\n        color: var(--primary-text-color);\n        font-size: 16px;\n      }\n\n      .help-btn {\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        width: 28px;\n        height: 28px;\n        padding: 0;\n        background: var(--primary-color) !important;\n        border: none !important;\n        color: var(--text-primary-color, white) !important;\n        cursor: pointer;\n        border-radius: 50%;\n        line-height: 0;\n      }\n\n      .help-btn:hover {\n        opacity: 0.85;\n      }\n\n      .help-btn ha-icon {\n        --mdc-icon-size: 18px;\n        width: 18px;\n        height: 18px;\n        flex-shrink: 0;\n        display: block;\n      }\n\n      .switch {\n        position: relative;\n        display: inline-block;\n        width: 50px;\n        height: 24px;\n      }\n\n      .switch input {\n        opacity: 0;\n        width: 0;\n        height: 0;\n      }\n\n      .slider {\n        position: absolute;\n        cursor: pointer;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background-color: var(--switch-unchecked-color, #ccc);\n        transition: .4s;\n      }\n\n      .slider:before {\n        position: absolute;\n        content: "";\n        height: 18px;\n        width: 18px;\n        left: 3px;\n        bottom: 3px;\n        background-color: white;\n        transition: .4s;\n      }\n\n      input:checked + .slider {\n        background-color: var(--primary-color);\n      }\n\n      input:checked + .slider:before {\n        transform: translateX(26px);\n      }\n\n      .slider.round {\n        border-radius: 24px;\n    max-width: 50px;\n}\n      }\n\n      .slider.round:before {\n        border-radius: 50%;\n      }\n\n      .template-description {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        line-height: 1.4;\n        margin-bottom: 8px;\n      }\n\n      .template-content {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n      }\n\n      .template-editor {\n        min-height: 120px;\n        font-family: 'Courier New', monospace;\n        font-size: 13px;\n        line-height: 1.4;\n        resize: vertical;\n        width: 100%;\n        padding: 12px;\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        outline: none;\n        transition: border-color 0.2s ease;\n      }\n\n      .template-editor:focus {\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 1px var(--primary-color);\n      }\n\n      .template-help {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        margin-top: 4px;\n      }\n\n      .template-help p {\n        margin: 8px 0;\n        font-weight: 500;\n      }\n\n      .template-help ul {\n        margin: 4px 0;\n        padding-left: 16px;\n      }\n\n      .template-help li {\n        margin: 2px 0;\n      }\n\n      .template-help code {\n        background: rgba(var(--rgb-primary-color), 0.1);\n        padding: 2px 4px;\n        border-radius: 3px;\n        font-family: 'Courier New', monospace;\n        font-size: 11px;\n      }\n\n      ${r.A.getHoverStyles()}\n    `}_addIcon(t,e){const i={id:this.generateId("icon-item"),icon_mode:"entity",entity:"weather.forecast_home",name:"",icon_inactive:"mdi:weather-partly-cloudy",icon_active:"mdi:weather-partly-cloudy",inactive_state:"",active_state:"",inactive_attribute:"",active_attribute:"",display_attribute:"",custom_inactive_state_text:"",custom_active_state_text:"",custom_inactive_name_text:"",custom_active_name_text:"",inactive_template_mode:!1,inactive_template:"",active_template_mode:!1,active_template:"",use_entity_color_for_icon:!1,use_state_color_for_inactive_icon:!1,use_state_color_for_active_icon:!1,color_inactive:"var(--secondary-text-color)",color_active:"var(--primary-color)",inactive_icon_color:"var(--secondary-text-color)",active_icon_color:"var(--primary-color)",inactive_name_color:"var(--primary-text-color)",active_name_color:"var(--primary-text-color)",inactive_state_color:"var(--secondary-text-color)",active_state_color:"var(--secondary-text-color)",show_name_when_inactive:!0,show_state_when_inactive:!0,show_icon_when_inactive:!0,show_name_when_active:!0,show_state_when_active:!0,show_icon_when_active:!0,show_state:!0,show_name:!0,icon_size:26,text_size:14,name_icon_gap:8,name_state_gap:2,icon_state_gap:4,active_icon_size:26,inactive_icon_size:26,active_text_size:14,inactive_text_size:14,state_size:14,active_state_size:14,inactive_state_size:14,icon_background:"none",use_entity_color_for_icon_background:!1,icon_background_color:"transparent",active_icon_background:"none",inactive_icon_background:"none",active_icon_background_color:"transparent",inactive_icon_background_color:"transparent",icon_background_padding:8,inactive_icon_background_padding:8,active_icon_background_padding:8,active_icon_background_padding_locked:!0,icon_size_locked:!0,text_size_locked:!0,state_size_locked:!0,active_icon_locked:!0,active_icon_color_locked:!1,active_icon_background_locked:!0,active_icon_background_color_locked:!0,active_name_locked:!0,active_name_color_locked:!0,active_state_locked:!1,active_state_color_locked:!0,inactive_icon_animation:"none",active_icon_animation:"none",show_units:!0,vertical_alignment:"center",container_width:void 0,container_background_shape:"none",container_background_color:"#808080",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},click_action:"toggle",double_click_action:"none",hold_action_legacy:"none",navigation_path:"",url:"",service:"",service_data:{},template_mode:!1,template:"",dynamic_icon_template_mode:!1,dynamic_icon_template:"",dynamic_color_template_mode:!1,dynamic_color_template:"",unified_template_mode:!1,unified_template:"",ignore_entity_state_config:!1};e({icons:[...t.icons,i]})}_removeIcon(t,e,i){t.icons.length<=1||i({icons:t.icons.filter(((t,i)=>i!==e))})}_updateIcon(t,e,i,n){n({icons:t.icons.map(((t,n)=>n===e?Object.assign(Object.assign({},t),i):t))})}_handleEntitySelection(t,e,i,n,o,a){const r={entity:n};if(n&&(null==o?void 0:o.states[n])){const t=s.s.getEntityIcon(n,o);t&&(r.icon_inactive=t,!1!==i.icons[e].active_icon_locked&&(r.icon_active=t))}if(n&&this._isBinaryEntity(n)){const t=i.icons[e];t.active_state||t.inactive_state||(r.active_state="on",r.inactive_state="off")}a({icons:i.icons.map(((t,i)=>i===e?Object.assign(Object.assign({},t),r):t))}),setTimeout((()=>{try{this._triggerPreviewUpdate()}catch(t){}window.dispatchEvent(new CustomEvent("ultra-card-actions-refresh",{detail:{moduleId:i.id},bubbles:!0,composed:!0}))}),50);const c=`${t.entity}_attributes`,l=`${n}_attributes`;this._attributeCache.delete(c),this._attributeCache.delete(l)}_debouncedUpdateIcon(t,e,i,n,o=100){this._updateTimeout&&clearTimeout(this._updateTimeout),this._updateTimeout=setTimeout((()=>{this._updateIcon(t,e,i,n)}),o)}_triggerPreviewUpdate(){this._attributeCache.clear(),"undefined"!=typeof window&&(window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window.dispatchEvent(new CustomEvent("ultra-card-preview-update")),window.dispatchEvent(new CustomEvent("ultra-card-state-changed")));try{this.requestUpdate&&this.requestUpdate()}catch(t){}}_updateIconWithLockSync(t,e,i,n,o){const a=t.icons[e],r={[i]:n},c={icon_inactive:{active:"icon_active",lock:"active_icon_locked"},inactive_icon_size:{active:"active_icon_size",lock:"icon_size_locked"},inactive_text_size:{active:"active_text_size",lock:"text_size_locked"},inactive_state_size:{active:"active_state_size",lock:"state_size_locked"},inactive_icon_color:{active:"active_icon_color",lock:"active_icon_color_locked"},inactive_name_color:{active:"active_name_color",lock:"active_name_color_locked"},inactive_state_color:{active:"active_state_color",lock:"active_state_color_locked"},inactive_icon_background:{active:"active_icon_background",lock:"active_icon_background_locked"},inactive_icon_background_color:{active:"active_icon_background_color",lock:"active_icon_background_color_locked"},use_state_color_for_inactive_icon:{active:"use_state_color_for_active_icon",lock:"active_state_color_locked"}}[i];c&&!1!==a[c.lock]&&(r[c.active]=n),this._updateIcon(t,e,r,o)}_debouncedUpdateIconWithLockSync(t,e,i,n,o,a=50){this._updateTimeout&&clearTimeout(this._updateTimeout),this._updateTimeout=setTimeout((()=>{this._updateIconWithLockSync(t,e,i,n,o)}),a)}getBackgroundImageCSS(t,e){var i,n;const o=t.background_image_type,a=t.background_image,r=t.background_image_entity;if(!o||"none"===o)return"none";switch(o){case"upload":if(a)return`url("${(0,_.V)(e,a)}")`;break;case"url":if(a)return`url("${a}")`;break;case"entity":if(r&&e){const t=e.states[r];if(t){const o=(null===(i=t.attributes)||void 0===i?void 0:i.entity_picture)||(null===(n=t.attributes)||void 0===n?void 0:n.image)||("string"==typeof t.state?t.state:"");if(o&&"unknown"!==o&&"unavailable"!==o)return`url("${(0,_.V)(e,o)}")`}}}return"none"}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/[A-Z]/g,(t=>`-${t.toLowerCase()}`))}: ${e}`)).join("; ")}_renderSizeControl(t,e,i,o,a,r,c,s){return n.qy`
      <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
        <input
          type="range"
          class="gap-slider"
          min="${r}"
          max="${c}"
          step="1"
          .value="${a}"
          @input=${n=>{const a=n.target,r=Number(a.value);this._updateIconWithLockSync(t,e,o,r,i)}}
        />
        <input
          type="number"
          class="gap-input"
          min="${r}"
          max="${c}"
          step="1"
          .value="${a}"
          @input=${n=>{const a=n.target,s=Number(a.value);!isNaN(s)&&s>=r&&s<=c&&this._updateIconWithLockSync(t,e,o,s,i)}}
          @keydown=${n=>{if("ArrowUp"===n.key||"ArrowDown"===n.key){n.preventDefault();const a=n.target,l=Number(a.value)||s,d="ArrowUp"===n.key?1:-1,_=Math.max(r,Math.min(c,l+d));this._updateIconWithLockSync(t,e,o,_,i)}}}
        />
        <button
          class="reset-btn"
          @click=${()=>{this._updateIconWithLockSync(t,e,o,s,i)}}
          title="Reset to default (${s})"
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
      </div>
    `}_renderBackgroundPaddingControl(t,e,i,o){const a=n=>{this._updateIcon(t,e,{inactive_icon_background_padding:n,active_icon_background_padding:n,icon_background_padding:n},i),setTimeout((()=>this._triggerPreviewUpdate()),50)};return n.qy`
      <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
        <input
          type="range"
          class="gap-slider"
          min="${0}"
          max="${50}"
          step="1"
          .value="${o}"
          @input=${t=>{const e=t.target;a(Number(e.value))}}
        />
        <input
          type="number"
          class="gap-input"
          min="${0}"
          max="${50}"
          step="1"
          .value="${o}"
          @input=${t=>{const e=t.target,i=Number(e.value);!isNaN(i)&&i>=0&&i<=50&&a(i)}}
          @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||8,n="ArrowUp"===t.key?1:-1,o=Math.max(0,Math.min(50,i+n));a(o)}}}
        />
        <button
          class="reset-btn"
          @click=${()=>a(8)}
          title="Reset to default (${8}px)"
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
      </div>
    `}_renderFieldWithLock(t,e,i,o,a,r,c,s,l,d){const _=t.icons[e],p=!1!==_[o],m=p&&_[r]||c;return n.qy`
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="flex: 1;">
          ${"icon"===s?n.qy`
                <div
                  style="opacity: ${p?"0.5":"1"}; pointer-events: ${p?"none":"auto"};"
                >
                  ${this.renderUcForm(l,{[a]:m},[this.iconField(a)],(n=>{if(!p){const o=this._formValue(n,a);if(void 0===o)return;this._updateIcon(t,e,{[a]:o},i)}}),!1)}
                </div>
              `:"color"===s?n.qy`
                  <ultra-color-picker
                    .value=${m}
                    .disabled=${p}
                    @value-changed=${n=>{if(!p){const o=n.detail&&"value"in n.detail?n.detail.value:void 0;if(void 0===o)return;this._updateIcon(t,e,{[a]:o},i)}}}
                  ></ultra-color-picker>
                `:"select"===s?n.qy`
                    <div
                      style="opacity: ${p?"0.5":"1"}; pointer-events: ${p?"none":"auto"};"
                    >
                      ${this.renderUcForm(l,{[a]:m},[this.selectField(a,d||[])],(n=>{const o=this._formValue(n,a);if(void 0===o)return;const r=String(o);r!==_[a]&&this._updateIcon(t,e,{[a]:r},i)}),!1)}
                    </div>
                  `:"toggle"===s?n.qy`
                      <ha-switch
                        .checked=${m}
                        .disabled=${p}
                        @change=${n=>{if(!p){const o=n.target;this._updateIcon(t,e,{[a]:o.checked},i)}}}
                      ></ha-switch>
                    `:n.qy`
                      <div
                        style="opacity: ${p?"0.5":"1"}; pointer-events: ${p?"none":"auto"};"
                      >
                        ${this.renderUcForm(l,{[a]:m},[this.textField(a)],(n=>{const o=this._formValue(n,a);if(void 0===o)return;const r="string"==typeof o?o:String(o);r!==_[a]&&this._updateIcon(t,e,{[a]:r},i)}),!1)}
                      </div>
                    `}
        </div>
        <button
          class="lock-btn ${p?"locked":"unlocked"}"
          @click=${()=>{const n=!p,c={[o]:n};n&&(c[a]=_[r]),this._updateIcon(t,e,c,i)}}
          title="${p?"Unlock to customize this field independently":"Lock to inherit from inactive state"}"
        >
          <ha-icon icon="${p?"mdi:lock":"mdi:lock-open"}"></ha-icon>
        </button>
      </div>
    `}_renderSizeControlWithLock(t,e,i,o,a,r,c,s,l,d){const _=t.icons[e],p=`${o}_locked`,m=!1!==_[p],v=m?_[r]||d:c;return n.qy`
      <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
        <input
          type="range"
          class="gap-slider"
          min="${s}"
          max="${l}"
          step="1"
          .value="${v}"
          .disabled=${m}
          @input=${n=>{if(!m){const o=n.target,r=Number(o.value);this._updateIcon(t,e,{[a]:r},i)}}}
        />
        <input
          type="number"
          class="gap-input"
          min="${s}"
          max="${l}"
          step="1"
          .value="${v}"
          .disabled=${m}
          @input=${n=>{if(!m){const o=n.target,r=Number(o.value);!isNaN(r)&&r>=s&&r<=l&&this._updateIcon(t,e,{[a]:r},i)}}}
          @keydown=${n=>{if(!m&&("ArrowUp"===n.key||"ArrowDown"===n.key)){n.preventDefault();const o=n.target,r=Number(o.value)||d,c="ArrowUp"===n.key?1:-1,_=Math.max(s,Math.min(l,r+c));this._updateIcon(t,e,{[a]:_},i)}}}
        />
        <button
          class="reset-btn"
          @click=${()=>{m||this._updateIcon(t,e,{[a]:d},i)}}
          title="Reset to default (${d})"
          .disabled=${m}
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
        <button
          class="lock-btn ${m?"locked":"unlocked"}"
          @click=${()=>{const n=!m,o={[p]:n};n&&(o[a]=_[r]||d),this._updateIcon(t,e,o,i)}}
          title="${m?"Unlock to set different sizes for active/inactive":"Lock to use same size for both states"}"
        >
          <ha-icon icon="${m?"mdi:lock":"mdi:lock-open"}"></ha-icon>
        </button>
      </div>
    `}_updateIconAnimationClasses(t,e,i){[document,document.body,this.shadowRoot,this.renderRoot,...Array.from(document.querySelectorAll("*")).filter((t=>t.shadowRoot)).map((t=>t.shadowRoot))].filter(Boolean).forEach(((t,i)=>{try{t.querySelectorAll("ha-icon").forEach((t=>{if((t.getAttribute("data-animation-debug")||"")!==e)return;const i=t.className.split(" ").filter((t=>!t.startsWith("icon-animation-")));e&&!e.includes("none")&&i.push(e),t.className=i.join(" ");const n=e.replace("icon-animation-","");if(n&&"none"!==n){const e="icon"+n.split("-").map((t=>t.charAt(0).toUpperCase()+t.slice(1))).join(""),i=n.includes("spin")||n.includes("rotate")?"2s linear infinite":"1s ease-in-out infinite";t.style.animation=`${e} ${i}`}else t.style.animation="";this._injectKeyframesIntoHaIcon(t),t.offsetHeight}))}catch(t){}}))}_getInlineAnimation(t){const e=t.replace("icon-animation-","");return e&&"none"!==e?`${"icon"+e.split("-").map((t=>t.charAt(0).toUpperCase()+t.slice(1))).join("")} ${e.includes("spin")||e.includes("rotate")?"2s linear infinite":"bounce"===e?"1s ease-in-out infinite":"shake"===e?"0.5s ease-in-out infinite":"vibrate"===e?"0.3s ease-in-out infinite":"2s ease-in-out infinite"}`:""}_applyAnimationDirectly(t,e){const i=e.replace("icon-animation-","");if(!i||"none"===i)return;const n="icon"+i.split("-").map((t=>t.charAt(0).toUpperCase()+t.slice(1))).join(""),o=i.includes("spin")||i.includes("rotate")?"2s linear infinite":"2s ease-in-out infinite";t.style.animation=`${n} ${o}`,this._injectKeyframesIntoHaIcon(t)}_injectKeyframesForAllSplitPreviewIcons(){const t=(e=1)=>{const i=document.querySelectorAll('ha-icon[data-animation-debug]:not([data-animation-debug="none"])'),n=[...Array.from(document.querySelectorAll("*")).filter((t=>t.shadowRoot)).map((t=>t.shadowRoot))],o=Array.from(i);n.forEach((t=>{t.querySelectorAll('ha-icon[data-animation-debug]:not([data-animation-debug="none"])').forEach((t=>o.push(t)))}));let a=0;o.forEach((t=>{this._injectKeyframesIntoHaIcon(t),a++})),0===a&&e<10&&setTimeout((()=>t(e+1)),150)};t()}addPixelUnit(t){if(!t&&0!==t)return t;const e=String(t);return"auto"===e||"none"===e||"inherit"===e||"initial"===e||"unset"===e?e:e.endsWith("x")&&!e.endsWith("px")?e.replace(/x$/,"px"):e.includes("px")||e.includes("%")||e.includes("em")||e.includes("rem")||e.includes("vh")||e.includes("vw")||e.includes("ch")||e.includes("ex")||e.includes("vmin")||e.includes("vmax")?e:/^\d+(\.\d+)?$/.test(e)?`${e}px`:/^[\d\.\s]+$/.test(e)?e.split(" ").map((t=>t.trim()&&/^\d+(\.\d+)?$/.test(t.trim())?`${t.trim()}px`:t.trim())).join(" "):e}_formatValueWithUnits(t,e,i,n){var o;return e&&(null===(o=null==n?void 0:n.states)||void 0===o?void 0:o[e])?(0,a.formatEntityState)(n,e,{state:t,includeUnit:!1!==i.show_units}):t}_getEntityStateColor(t){if(!t||!t.attributes)return null;if(t.attributes.rgb_color&&Array.isArray(t.attributes.rgb_color))return`rgb(${t.attributes.rgb_color.join(",")})`;if(t.attributes.hs_color&&Array.isArray(t.attributes.hs_color)){const[e,i]=t.attributes.hs_color;return`rgb(${this._hsToRgb(e/360,i/100,1).join(",")})`}if(t.attributes.color_name)return t.attributes.color_name;if(t.attributes.color&&"string"==typeof t.attributes.color)return t.attributes.color;if(t.entity_id){const e=t.entity_id.split(".")[0];if("binary_sensor"===e||"switch"===e)return"on"===t.state?"#4CAF50":"#F44336"}return null}_hsToRgb(t,e,i){let n,o,a;const r=Math.floor(6*t),c=6*t-r,s=i*(1-e),l=i*(1-c*e),d=i*(1-(1-c)*e);switch(r%6){case 0:n=i,o=d,a=s;break;case 1:n=l,o=i,a=s;break;case 2:n=s,o=i,a=d;break;case 3:n=s,o=l,a=i;break;case 4:n=d,o=s,a=i;break;case 5:n=i,o=s,a=l;break;default:n=o=a=0}return[Math.round(255*n),Math.round(255*o),Math.round(255*a)]}_getEntityPicture(t,e){var i,n;if(!t||!e)return null;if(!t.entity_id)return null;const o=null===(i=t.attributes)||void 0===i?void 0:i.entity_picture;if(o)return o.startsWith("/")?`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}${o}`:o;const a=["image","picture","thumbnail","avatar","photo","icon_url","image_url"];for(const i of a){const o=null===(n=t.attributes)||void 0===n?void 0:n[i];if(o&&"string"==typeof o)return o.startsWith("/")?`${(e.hassUrl?e.hassUrl():"").replace(/\/$/,"")}${o}`:o}return null}_shouldUseEntityPicture(t){var e;return!!t&&(!!t.entity_id&&(!!(null===(e=t.attributes)||void 0===e?void 0:e.entity_picture)||["image","picture","thumbnail","avatar","photo","icon_url","image_url"].some((e=>{var i;return(null===(i=t.attributes)||void 0===i?void 0:i[e])&&"string"==typeof t.attributes[e]&&""!==t.attributes[e].trim()}))))}_injectKeyframesIntoHaIcon(t){const e=t.shadowRoot;if(!e)return;const i=e.querySelector("style[data-uvc-keyframes]");i&&i.remove();try{const t=document.createElement("style");if(t.setAttribute("data-uvc-keyframes",""),t.textContent=f._ANIMATION_KEYFRAMES,e.appendChild(t),!document.head.querySelector("style[data-uvc-global-keyframes]")){const t=document.createElement("style");t.setAttribute("data-uvc-global-keyframes",""),t.textContent=f._ANIMATION_KEYFRAMES,document.head.appendChild(t)}}catch(t){console.error("❌ Error injecting keyframes:",t)}}}f._globalStylesInjected=!1,f._ANIMATION_KEYFRAMES="\n    @keyframes iconPulse {0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(1.1);}}\n    @keyframes iconSpin {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}\n    @keyframes iconBounce {0%,20%,50%,80%,100%{transform:translateY(0);}40%{transform:translateY(-10px);}60%{transform:translateY(-5px);}}\n    @keyframes iconFlash {0%,50%,100%{opacity:1;}25%,75%{opacity:0.3;}}\n    @keyframes iconShake {0%,100%{transform:translateX(0);}10%,30%,50%,70%,90%{transform:translateX(-2px);}20%,40%,60%,80%{transform:translateX(2px);}}\n    @keyframes iconVibrate {0%,100%{transform:translate(0);}10%{transform:translate(-1px,-1px);}20%{transform:translate(1px,-1px);}30%{transform:translate(-1px,1px);}40%{transform:translate(1px,1px);}50%{transform:translate(-1px,-1px);}60%{transform:translate(1px,-1px);}70%{transform:translate(-1px,1px);}80%{transform:translate(1px,1px);}90%{transform:translate(-1px,-1px);}}\n    @keyframes iconRotateLeft {from{transform:rotate(0deg);}to{transform:rotate(-360deg);}}\n    @keyframes iconRotateRight {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}\n    @keyframes iconFade {0%,100%{opacity:1;}50%{opacity:0.3;}}\n    @keyframes iconScale {0%,100%{transform:scale(1);}50%{transform:scale(1.2);}}\n    @keyframes iconTada {0%{transform:scale(1);}10%,20%{transform:scale(0.9) rotate(-3deg);}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg);}40%,60%,80%{transform:scale(1.1) rotate(-3deg);}100%{transform:scale(1) rotate(0);}}\n  "}}]);