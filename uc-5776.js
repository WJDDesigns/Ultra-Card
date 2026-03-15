"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5776],{5776:(e,t,i)=>{i.r(t),i.d(t,{UltraDynamicWeatherModule:()=>l});var r=i(5183),a=i(7475),o=i(8938),n=i(378),d=i(1713),s=i(6478);class l extends a.m{constructor(){super(...arguments),this.metadata={type:"dynamic_weather",title:"Dynamic Weather",description:"Add animated weather effects (rain, snow, fog, sun beams) to your dashboard view.",author:"WJD Designs",version:"1.0.0",icon:"mdi:weather-partly-rainy",category:"media",tags:["weather","effects","pro","premium","animated","rain","snow","fog"]}}createDefault(e,t){const i=this._findWeatherEntity(t);return{id:e||this.generateId("dynamic_weather"),type:"dynamic_weather",enabled:!0,mode:"automatic",weather_entity:i,manual_effect:"rain",position:"background",opacity:50,matrix_rain_color:"#00ff00",enable_on_mobile:!0,respect_reduced_motion:!0,display_mode:"always",display_conditions:[]}}_findWeatherEntity(e){if(!e)return"";const t=Object.keys(e.states).filter((e=>e.startsWith("weather.")));return t.length>0?t[0]:""}renderGeneralTab(e,t,i,a){var o,s,l,c,p;const u=e,m=(null===(o=null==t?void 0:t.locale)||void 0===o?void 0:o.language)||"en",g=n.x.checkIntegrationAuth(t);return"pro"===(null===(s=null==g?void 0:g.subscription)||void 0===s?void 0:s.tier)&&"active"===(null===(l=null==g?void 0:g.subscription)||void 0===l?void 0:l.status)?r.qy`
      <div class="uc-dynamic-weather-settings">
        ${this.injectUcFormStyles()}

        <!-- Module Info -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <ha-icon
              icon="mdi:weather-partly-rainy"
              style="color: var(--primary-color); --mdi-icon-size: 32px;"
            ></ha-icon>
            <div>
              <div style="font-size: 18px; font-weight: 700;">Dynamic Weather Effects (Pro)</div>
              <div style="font-size: 12px; color: var(--secondary-text-color);">
                View-wide animated weather effects with automatic or manual control
              </div>
            </div>
          </div>

          <div
            style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color);"
          >
            <div style="font-size: 13px; line-height: 1.5;">
              <strong>Note:</strong> This module controls weather effects for the entire view. It
              will not display as a visible card. Only the topmost enabled module with passing logic
              conditions will render.
            </div>
          </div>

          <div
            style="margin-top: 12px; padding: 10px; background: rgba(var(--rgb-warning-color), 0.12); border-radius: 6px; border-left: 4px solid var(--warning-color); color: var(--warning-color); font-size: 12px; line-height: 1.4;"
          >
            ⚠️ Lightning effects (Rain Storm) include rapid flashes.
          </div>
        </div>

        <!-- Core Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            CORE SETTINGS
          </div>

          <!-- Enable Toggle -->
          ${this.renderSettingsSection("","",[{title:"Enable Weather Effects",description:"Turn the weather effects on or off",hass:t,data:{enabled:u.enabled},schema:[this.booleanField("enabled")],onChange:e=>a(e.detail.value)}])}

          <!-- Mode Selection -->
          ${this.renderFieldSection("Mode","Choose how weather effects are controlled",t,{mode:u.mode||"automatic"},[this.selectField("mode",[{value:"automatic",label:"Automatic (from weather entity)"},{value:"manual",label:"Manual (select effect)"}])],(e=>a(e.detail.value)))}

          <!-- Automatic Mode Settings -->
          ${"automatic"===u.mode?r.qy`
                <div style="margin-top: 16px;">
                  ${this.renderConditionalFieldsGroup("Automatic Mode",r.qy`
                      ${this.renderFieldSection("Weather Entity","Select the weather entity to monitor for automatic effects",t,{weather_entity:u.weather_entity||""},[this.entityField("weather_entity")],(e=>a(e.detail.value)))}

                      <!-- Current Effect Preview -->
                      ${u.weather_entity&&t.states[u.weather_entity]?r.qy`
                            <div style="margin-top: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px;">
                              <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                                Current Detection:
                              </div>
                              <div style="font-size: 13px; color: var(--secondary-text-color);">
                                Weather State: <strong>${t.states[u.weather_entity].state}</strong>
                              </div>
                              <div style="font-size: 13px; color: var(--secondary-text-color);">
                                Effect: <strong>${(0,d.$A)((0,d.Gi)(t,u.weather_entity))}</strong>
                              </div>
                            </div>
                          `:""}
                    `)}
                </div>
              `:""}

          <!-- Manual Mode Settings -->
          ${"manual"===u.mode?r.qy`
                <div style="margin-top: 16px;">
                  ${this.renderConditionalFieldsGroup("Manual Mode",r.qy`
                      ${this.renderFieldSection("Weather Effect","Choose which weather effect to display",t,{manual_effect:u.manual_effect||"rain"},[this.selectField("manual_effect",(0,d.Mn)().map((e=>({value:e.value,label:e.label}))))],(e=>{a(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50)}))}

                      <!-- Matrix Rain Color Picker (only shown when matrix_rain is selected) -->
                      ${"matrix_rain"===u.manual_effect?r.qy`
                            <div style="margin-top: 16px;">
                              <ultra-color-picker
                                .label=${"Matrix Rain Color"}
                                .value=${u.matrix_rain_color||"#00ff00"}
                                .defaultValue=${"#00ff00"}
                                .hass=${t}
                                @value-changed=${e=>{a({matrix_rain_color:e.detail.value})}}
                              ></ultra-color-picker>
                            </div>
                          `:""}
                    `)}
                </div>
              `:""}
        </div>

        <!-- Display Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            DISPLAY SETTINGS
          </div>

          <!-- Position -->
          ${this.renderFieldSection("Position","Place effects in the foreground (above cards) or background (behind cards)",t,{position:u.position||"background"},[this.selectField("position",[{value:"background",label:"Background (behind cards)"},{value:"foreground",label:"Foreground (above cards)"}])],(e=>a(e.detail.value)))}

          <!-- Opacity Slider -->
          <div style="margin-top: 24px; margin-bottom: 12px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Opacity
            </div>
            <div class="field-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
              Control the transparency of weather effects (0-100%)
            </div>
            <div class="number-range-control" style="display: flex; gap: 8px; align-items: center;">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="100"
                step="1"
                .value="${null!==(c=u.opacity)&&void 0!==c?c:50}"
                @input=${e=>{const t=e.target,i=parseInt(t.value);a({opacity:i})}}
                style="flex: 0 0 65%; height: 6px; background: var(--divider-color); border-radius: 3px; cursor: pointer;"
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="100"
                step="1"
                .value="${null!==(p=u.opacity)&&void 0!==p?p:50}"
                @input=${e=>{const t=e.target,i=parseInt(t.value);isNaN(i)||a({opacity:i})}}
                style="flex: 0 0 20%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 13px; text-align: center;"
              />
              <button
                class="range-reset-btn"
                @click=${()=>a({opacity:50})}
                title="Reset to default (50)"
                style="width: 32px; height: 32px; padding: 0; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); cursor: pointer; display: flex; align-items: center; justify-content: center;"
              >
                <ha-icon icon="mdi:refresh" style="font-size: 14px;"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile & Accessibility Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            MOBILE & ACCESSIBILITY
          </div>

          ${this.renderSettingsSection("","",[{title:"Enable on Mobile",description:"Show weather effects on mobile devices (reduced particle count)",hass:t,data:{enable_on_mobile:u.enable_on_mobile},schema:[this.booleanField("enable_on_mobile")],onChange:e=>a(e.detail.value)},{title:"Respect Reduced Motion",description:"Disable effects when user prefers reduced motion",hass:t,data:{respect_reduced_motion:u.respect_reduced_motion},schema:[this.booleanField("respect_reduced_motion")],onChange:e=>a(e.detail.value)}])}
        </div>
      </div>
    `:this.renderProLockUI(m)}renderProLockUI(e){return r.qy`
      <div
        style="padding: 32px; text-align: center; background: var(--secondary-background-color); border-radius: 8px; margin: 16px;"
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--warning-color); --mdi-icon-size: 64px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${(0,s.kg)("editor.pro_feature",e)}
        </div>
        <div style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 24px;">
          Dynamic Weather Effects is a Pro feature. Upgrade to unlock animated weather effects
          including rain, snow, fog, and sun beams.
        </div>
        <a
          href="https://ultracardpro.com"
          target="_blank"
          style="display: inline-block; padding: 12px 24px; background: var(--primary-color); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
        >
          Upgrade to Pro
        </a>
      </div>
    `}renderLogicTab(e,t,i){return o.X.render(e,t,i)}renderPreview(e,t,i,a){const o=e,n=(()=>{if("dashboard"===a)return!0;try{return"1"===new URLSearchParams(window.location.search).get("edit")}catch(e){return!1}})();return"live"===a||"ha-preview"===a||"dashboard"===a||n?r.qy`
        <div
          style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px; border: 2px dashed var(--divider-color);"
        >
          <ha-icon
            icon="mdi:weather-partly-rainy"
            style="--mdi-icon-size: 48px; color: var(--primary-color); margin-bottom: 8px;"
          ></ha-icon>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            Dynamic Weather Effects
          </div>
          <div style="font-size: 12px;">
            ${o.enabled?"automatic"===o.mode?`Auto: ${o.weather_entity||"No entity selected"}`:`Manual: ${(0,d.$A)(o.manual_effect||"none")}`:"Disabled"}
          </div>
          <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">
            Effects are rendered view-wide. Check your dashboard to see them in action.
          </div>
        </div>
      `:r.qy``}validate(e){const t=e,i=[];return"automatic"!==t.mode||t.weather_entity||i.push("Weather entity is required in automatic mode"),"manual"!==t.mode||t.manual_effect||i.push("Manual effect selection is required in manual mode"),(t.opacity<0||t.opacity>100)&&i.push("Opacity must be between 0 and 100"),{valid:0===i.length,errors:i}}}}}]);