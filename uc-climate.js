"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[1244],{2125:(e,t,o)=>{o.r(t),o.d(t,{UltraClimateModule:()=>r});var i=o(5183),n=o(7475),a=o(5262);o(7921);class r extends n.m{constructor(){super(...arguments),this.metadata={type:"climate",title:"Climate Control",description:"Interactive circular thermostat control for climate entities",author:"WJD Designs",version:"1.0.0",icon:"mdi:thermostat",category:"interactive",tags:["climate","thermostat","temperature","hvac","heating","cooling","pro"]}}createDefault(e,t){return{id:e||this.generateId("climate"),type:"climate",entity:"",name:"",show_current_temp:!0,show_target_temp:!0,show_humidity:!0,show_mode_switcher:!0,show_power_button:!0,show_fan_controls:!1,show_preset_modes:!1,show_temp_controls:!0,show_dial:!0,enable_dial_interaction:!0,dial_size:280,dynamic_colors:!0,temperature_unit:"auto",temp_control_size:26,fan_layout:"chips",preset_layout:"chips",humidity_icon:"mdi:water-percent",current_temp_color:"var(--primary-text-color)",target_temp_color:"var(--secondary-text-color)",mode_text_color:"var(--secondary-text-color)",humidity_color:"var(--secondary-text-color)",tap_action:{action:"default"},hold_action:{action:"default"},double_tap_action:{action:"default"}}}renderGeneralTab(e,t,o,n){const a=e;return i.qy`
      <style>
        ${this.injectUcFormStyles()}
      </style>

      <!-- Entity Configuration -->
      ${this.renderSettingsSection("Entity Configuration","Select the climate entity to control",[{title:"Climate Entity",description:"Select a climate entity (thermostat, HVAC system)",hass:t,data:{entity:a.entity||""},schema:[{name:"entity",selector:{entity:{domain:"climate"}}}],onChange:e=>n({entity:e.detail.value.entity})}])}

      <!-- Dial & Temperature -->
      ${this.renderSettingsSection("Dial & Temperature","Control the primary dial and temperature stack",[{title:"Show Dial",description:"Display the circular dial and arc",hass:t,data:{show_dial:!1!==a.show_dial},schema:[this.booleanField("show_dial")],onChange:e=>n({show_dial:e.detail.value.show_dial})},{title:"Show Current Temperature",description:"Display the current temperature in the dial center",hass:t,data:{show_current_temp:!1!==a.show_current_temp},schema:[this.booleanField("show_current_temp")],onChange:e=>n({show_current_temp:e.detail.value.show_current_temp})},{title:"Show Target Temperature",description:"Display the target/set temperature",hass:t,data:{show_target_temp:!1!==a.show_target_temp},schema:[this.booleanField("show_target_temp")],onChange:e=>n({show_target_temp:e.detail.value.show_target_temp})},{title:"Show Temperature Controls",description:"Display +/- buttons for temperature adjustment",hass:t,data:{show_temp_controls:!1!==a.show_temp_controls},schema:[this.booleanField("show_temp_controls")],onChange:e=>n({show_temp_controls:e.detail.value.show_temp_controls})},{title:"Show Humidity",description:"Display current humidity percentage",hass:t,data:{show_humidity:!1!==a.show_humidity},schema:[this.booleanField("show_humidity")],onChange:e=>n({show_humidity:e.detail.value.show_humidity})}])}

      <!-- Control Buttons -->
      ${this.renderSettingsSection("Control Buttons","Toggle the optional buttons below the dial",[{title:"Show Mode Switcher",description:"Display HVAC mode buttons (heat, cool, off, etc.)",hass:t,data:{show_mode_switcher:!1!==a.show_mode_switcher},schema:[this.booleanField("show_mode_switcher")],onChange:e=>n({show_mode_switcher:e.detail.value.show_mode_switcher})},{title:"Show Power Toggle",description:"Display the power on/off button",hass:t,data:{show_power_button:!1!==a.show_power_button},schema:[this.booleanField("show_power_button")],onChange:e=>n({show_power_button:e.detail.value.show_power_button})},{title:"Show Fan Controls",description:"Display fan mode controls",hass:t,data:{show_fan_controls:a.show_fan_controls||!1},schema:[this.booleanField("show_fan_controls")],onChange:e=>n({show_fan_controls:e.detail.value.show_fan_controls})},{title:"Show Preset Modes",description:"Display preset mode controls (home, away, sleep, etc.)",hass:t,data:{show_preset_modes:a.show_preset_modes||!1},schema:[this.booleanField("show_preset_modes")],onChange:e=>n({show_preset_modes:e.detail.value.show_preset_modes})}])}

      <!-- Dial Configuration -->
      <!-- Dial Configuration -->
      ${this.renderSliderField("Dial Size","Diameter of the circular dial in pixels (200-400)",a.dial_size||280,280,200,400,10,(e=>n({dial_size:e})),"px")}

      ${this.renderSettingsSection("","",[{title:"Temperature Unit",description:"Display unit for temperature (auto-detects from entity)",hass:t,data:{temperature_unit:a.temperature_unit||"auto"},schema:[this.selectField("temperature_unit",[{value:"auto",label:"Auto (from entity)"},{value:"fahrenheit",label:"Fahrenheit (°F)"},{value:"celsius",label:"Celsius (°C)"}])],onChange:e=>n({temperature_unit:e.detail.value.temperature_unit})}])}

      ${this.renderSliderField("Control Button Size","Size of the +/- temperature control buttons (24-60px)",a.temp_control_size||32,32,24,60,2,(e=>n({temp_control_size:e})),"px")}

      <!-- Colors -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">Colors</h3>
          <p class="section-description">Customize colors for different states and elements</p>
        </div>
        <div class="section-content">
          <!-- Dynamic Colors Toggle -->
          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
            >
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; margin: 0; white-space: nowrap;"
              >
                Dynamic Colors
              </div>
              ${this.renderUcForm(t,{dynamic_colors:!1!==a.dynamic_colors},[this.booleanField("dynamic_colors")],(e=>n({dynamic_colors:e.detail.value.dynamic_colors})),!1)}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              Automatically use reddish-orange for heating and blue for cooling. When disabled, use
              custom colors below.
            </div>
          </div>

          <!-- Conditional Color Pickers -->
          ${!1===a.dynamic_colors?i.qy`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Heating Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when heating is active
                  </div>
                  <ultra-color-picker
                    .value=${a.dial_color_heating||"#ff6b6b"}
                    .defaultValue=${"#ff6b6b"}
                    .hass=${t}
                    @value-changed=${e=>n({dial_color_heating:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Cooling Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when cooling is active
                  </div>
                  <ultra-color-picker
                    .value=${a.dial_color_cooling||"#4dabf7"}
                    .defaultValue=${"#4dabf7"}
                    .hass=${t}
                    @value-changed=${e=>n({dial_color_cooling:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Idle Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when idle (on but not actively heating/cooling)
                  </div>
                  <ultra-color-picker
                    .value=${a.dial_color_idle||"var(--primary-color)"}
                    .defaultValue=${"var(--primary-color)"}
                    .hass=${t}
                    @value-changed=${e=>n({dial_color_idle:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Off Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Dial color when HVAC is off
                  </div>
                  <ultra-color-picker
                    .value=${a.dial_color_off||"var(--disabled-text-color)"}
                    .defaultValue=${"var(--disabled-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>n({dial_color_off:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              `:""}

          <!-- Current Temperature Color (hidden when Dynamic Colors is enabled) -->
          ${!1===a.dynamic_colors?i.qy`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Current Temperature Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the large temperature value in the dial center
                  </div>
                  <ultra-color-picker
                    .value=${a.current_temp_color||"var(--primary-text-color)"}
                    .defaultValue=${"var(--primary-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>n({current_temp_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              `:""}

          <!-- Target Temperature Color (hidden when Dynamic Colors is enabled) -->
          ${!1===a.dynamic_colors?i.qy`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Target Temperature Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the set temperature row
                  </div>
                  <ultra-color-picker
                    .value=${a.target_temp_color||"var(--secondary-text-color)"}
                    .defaultValue=${"var(--secondary-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>n({target_temp_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              `:""}

          <!-- Preset Text Color (hidden when Dynamic Colors is enabled) -->
          ${!1===a.dynamic_colors?i.qy`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Preset Text Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color for preset mode labels in the top display
                  </div>
                  <ultra-color-picker
                    .value=${a.mode_text_color||"var(--secondary-text-color)"}
                    .defaultValue=${"var(--secondary-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>n({mode_text_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              `:""}

          <!-- Humidity Color (hidden when Dynamic Colors is enabled) -->
          ${!1===a.dynamic_colors?i.qy`
                <div style="margin-bottom: 0;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"
                  >
                    Humidity Color
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Color of the humidity label and value
                  </div>
                  <ultra-color-picker
                    .value=${a.humidity_color||"var(--secondary-text-color)"}
                    .defaultValue=${"var(--secondary-text-color)"}
                    .hass=${t}
                    @value-changed=${e=>n({humidity_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              `:""}
        </div>
      </div>
    `}renderPreview(e,t,o,n){var r,l,s,c,d,p,m,u,h,v,g;const f=e;if(!f.entity)return this.renderGradientErrorState("No Climate Entity","Select a climate entity in the General tab");const y=t.states[f.entity];if(!y)return this.renderGradientErrorState("Entity Not Found",`Climate entity "${f.entity}" not found`);const _=y.attributes.current_temperature,b=y.attributes.temperature,w=y.attributes.target_temp_high,x=y.attributes.target_temp_low,$=y.attributes.min_temp||44.6,C=y.attributes.max_temp||95,k=f.temp_step_override||y.attributes.target_temp_step||.5,z=y.attributes.current_humidity,T=null!=z&&!isNaN(Number(z)),S=T?Number(z):void 0,q=y.state,D=y.attributes.hvac_action,P=y.attributes.hvac_modes||[],F=y.attributes.fan_mode,M=null!=F,L=M?F:void 0,N=y.attributes.fan_modes,E=null!=N&&Array.isArray(N)&&N.length>0?N:[],H=y.attributes.preset_mode,A=null!=H,V=A?H:void 0,j=y.attributes.preset_modes,I=null!=j&&Array.isArray(j)&&j.length>0?j:[],U=f.dial_size||280,B=!1!==f.show_dial;let G="°F";if("fahrenheit"===f.temperature_unit)G="°F";else if("celsius"===f.temperature_unit)G="°C";else{const e=y.attributes.unit_of_measurement,t=y.attributes.temperature_unit;t?G="C"===t?"°C":"°F":e&&(G=e.includes("C")?"°C":"°F")}let O=f.dial_color_idle||"var(--primary-color)";O=!1!==f.dynamic_colors?"off"===q?"#6b7280":"heating"===D||"heat"===q?"#ff4500":"cooling"===D||"cool"===q?"#1e90ff":"heat_cool"===q||"auto"===q?"heating"===D?"#ff4500":"cooling"===D?"#1e90ff":"#6366f1":"#6366f1":"off"===q?f.dial_color_off||"var(--disabled-text-color)":"heating"===D||"heat"===q?f.dial_color_heating||"#ff6b6b":"cooling"===D||"cool"===q?f.dial_color_cooling||"#4dabf7":f.dial_color_idle||"var(--primary-color)";const R=f.target_temp_color||"var(--secondary-text-color)";this._lastRenderedEntity!==f.entity&&(this._liveTargetValue=void 0,this._liveTargetLow=void 0,this._liveTargetHigh=void 0,this._lastRenderedEntity=f.entity);const W=B&&"heat_cool"===q&&void 0!==x&&void 0!==w;W||(this._liveTargetLow=void 0,this._liveTargetHigh=void 0);const Y=null!==(r={heat:"start",cool:"end",heat_cool:"full",auto:"full",dry:"full",fan_only:"full",off:"full"}[q])&&void 0!==r?r:"full",J=null!==(l=null!=b?b:_)&&void 0!==l?l:$,K=null!==(c=null!==(s=this._liveTargetValue)&&void 0!==s?s:J)&&void 0!==c?c:$,Q=null!==(m=null!==(p=null!==(d=this._liveTargetLow)&&void 0!==d?d:x)&&void 0!==p?p:J)&&void 0!==m?m:$,X=null!==(v=null!==(h=null!==(u=this._liveTargetHigh)&&void 0!==u?u:w)&&void 0!==h?h:J)&&void 0!==v?v:C,Z=!1!==f.dynamic_colors?"#ff4500":f.dial_color_heating||"#ff6b6b",ee=!1!==f.dynamic_colors?"#1e90ff":f.dial_color_cooling||"#4dabf7",te=[`--control-circular-slider-color: ${O}`,"--control-circular-slider-background: rgba(var(--rgb-primary-text-color), 0.12)","--control-circular-slider-background-opacity: 0.5"];W&&(te.push(`--control-circular-slider-low-color: ${Z}`),te.push(`--control-circular-slider-high-color: ${ee}`));const oe=te.join("; "),ie=!B||!1===f.enable_dial_interaction,ne="off"===q||!B,ae=e=>e?e.split("_").filter(Boolean).map((e=>e.charAt(0).toUpperCase()+e.slice(1))).join(" "):"None",re=ae(V),le=e=>{if(ie)return;const t="number"==typeof e.detail.value?e.detail.value:void 0;this._liveTargetValue=t},se=async e=>{var o;if(ie)return;const i="number"==typeof e.detail.value?e.detail.value:null!==(o=this._liveTargetValue)&&void 0!==o?o:b;this._liveTargetValue=void 0,this.triggerPreviewUpdate(!0),void 0===i||Number.isNaN(i)||await this.callClimateService("set_temperature",f.entity,{temperature:i},t)},ce=e=>({heat:"mdi:fire",cool:"mdi:snowflake",heat_cool:"mdi:thermostat-auto",auto:"mdi:thermostat-auto",off:"mdi:power",dry:"mdi:water-percent",fan_only:"mdi:fan"}[e]||"mdi:thermostat"),de=async e=>{if(e.stopPropagation(),!b)return;const o=Math.min(C,b+k);await this.callClimateService("set_temperature",f.entity,{temperature:o},t)},pe=async e=>{if(e.stopPropagation(),!b)return;const o=Math.max($,b-k);await this.callClimateService("set_temperature",f.entity,{temperature:o},t)},me=async e=>{await this.callClimateService("set_hvac_mode",f.entity,{hvac_mode:e},t)},ue=async e=>{await this.callClimateService("set_fan_mode",f.entity,{fan_mode:e},t)},he=async e=>{await this.callClimateService("set_preset_mode",f.entity,{preset_mode:e},t)},ve=null===(g=f.design)||void 0===g?void 0:g.hover_effect,ge=a.k.getHoverEffectClass(ve);return i.qy`
      <style>
        ${this.getStyles()}
      </style>

      <div
        class="climate-module-container ${ge}"
        @click=${e=>{const t=e.target;t.closest(".climate-mode-popup")||t.closest(".climate-fan-popup")||t.closest(".climate-preset-popup")||t.closest(".climate-info-popup")||t.closest(".climate-bottom-icon")||t.closest(".climate-preset-display")||e.currentTarget.querySelectorAll(".climate-mode-popup.show, .climate-fan-popup.show, .climate-preset-popup.show, .climate-info-popup.show").forEach((e=>e.classList.remove("show")))}}
      >
        <!-- Circular Dial -->
        <div
          class="climate-dial-wrapper"
          style="--dial-color: ${O}; --dial-size: ${U}px;"
        >
          <!-- Pulse Circles (shown when heating/cooling) - Background layer -->
          ${"heating"===D||"cooling"===D?i.qy`
                <div class="climate-pulse-background" style="--pulse-color: ${O};">
                  <div class="climate-pulse-circle"></div>
                  <div class="climate-pulse-circle"></div>
                  <div class="climate-pulse-circle"></div>
                  <div class="climate-pulse-circle"></div>
                  <!-- Center mask to hide animation in the middle -->
                  <div class="climate-pulse-mask"></div>
                </div>
              `:""}
          ${B?W?i.qy`
                  <ha-control-circular-slider
                    class="climate-ha-slider"
                    style="${oe}"
                    .dual=${!0}
                    .mode=${Y}
                    .low=${Q}
                    .high=${X}
                    .current=${_}
                    .min=${$}
                    .max=${C}
                    .step=${k}
                    .inactive=${ne}
                    .disabled=${ie}
                    .readonly=${ie}
                    @low-changing=${e=>{if(!W||ie)return;const t="number"==typeof e.detail.value?e.detail.value:void 0;this._liveTargetLow=t}}
                    @low-changed=${async e=>{var o,i,n;if(!W||ie)return;const a="number"==typeof e.detail.value?e.detail.value:null!==(o=this._liveTargetLow)&&void 0!==o?o:x,r=null!==(n=null!==(i=this._liveTargetHigh)&&void 0!==i?i:w)&&void 0!==n?n:a;this._liveTargetLow=void 0,this.triggerPreviewUpdate(!0),void 0===a||Number.isNaN(a)||void 0===r||Number.isNaN(r)||await this.callClimateService("set_temperature",f.entity,{target_temp_low:a,target_temp_high:r},t)}}
                    @high-changing=${e=>{if(!W||ie)return;const t="number"==typeof e.detail.value?e.detail.value:void 0;this._liveTargetHigh=t}}
                    @high-changed=${async e=>{var o,i,n;if(!W||ie)return;const a="number"==typeof e.detail.value?e.detail.value:null!==(o=this._liveTargetHigh)&&void 0!==o?o:w,r=null!==(n=null!==(i=this._liveTargetLow)&&void 0!==i?i:x)&&void 0!==n?n:a;this._liveTargetHigh=void 0,this.triggerPreviewUpdate(!0),void 0===a||Number.isNaN(a)||void 0===r||Number.isNaN(r)||await this.callClimateService("set_temperature",f.entity,{target_temp_low:r,target_temp_high:a},t)}}
                    @value-changing=${le}
                    @value-changed=${se}
                  ></ha-control-circular-slider>
                `:i.qy`
                  <ha-control-circular-slider
                    class="climate-ha-slider"
                    style="${oe}"
                    .mode=${Y}
                    .value=${K}
                    .current=${_}
                    .min=${$}
                    .max=${C}
                    .step=${k}
                    .inactive=${ne}
                    .disabled=${ie}
                    .readonly=${ie}
                    @value-changing=${le}
                    @value-changed=${se}
                  ></ha-control-circular-slider>
                `:""}

          <!-- Center content -->
          <div class="climate-dial-center">
            <!-- Items wrapper for centering when some are disabled -->
            <div class="climate-dial-items">
              <!-- Preset Display -->
              ${f.show_preset_modes&&A&&I.length>0?i.qy`
                    <div
                      class="climate-preset-display"
                      style="color: ${!1===f.dynamic_colors&&f.mode_text_color||"var(--secondary-text-color)"};"
                      @click=${e=>{e.stopPropagation();const t=e.currentTarget.closest(".climate-dial-wrapper");null==t||t.querySelectorAll(".climate-mode-popup.show, .climate-fan-popup.show").forEach((e=>e.classList.remove("show")));const o=null==t?void 0:t.querySelector(".climate-preset-popup");o&&o.classList.toggle("show")}}
                      title="Current preset"
                    >
                      <span class="climate-preset-value">${re}</span>
                    </div>
                  `:""}

              <!-- Current Temperature -->
              ${!1!==f.show_current_temp&&void 0!==_?i.qy`
                    <div
                      class="climate-current-temp"
                      style="color: ${f.current_temp_color||"var(--primary-text-color)"}; cursor: pointer;"
                      @click=${e=>{e.stopPropagation();const t=e.currentTarget.closest(".climate-dial-wrapper");null==t||t.querySelectorAll(".climate-info-popup.show").forEach((e=>e.classList.remove("show")));const o=null==t?void 0:t.querySelector(".climate-temp-info-popup");o&&o.classList.toggle("show")}}
                      title="Tap for temperature details"
                    >
                      ${Math.round(_)}${G}
                    </div>
                  `:""}

              <!-- Target Temperature -->
              ${(()=>{if(!1===f.show_target_temp&&!1===f.show_temp_controls||!1===f.show_target_temp&&"off"===q)return"";const e=f.temp_control_size||26,t=!1!==f.show_temp_controls&&"off"!==q,o=e-6,n=Math.max(12,Math.floor(.5*o));return i.qy`
                  <div class="climate-target-stack" style="color: ${R}">
                    <div class="climate-target-row">
                      ${t?i.qy`
                            <button
                              class="climate-control-btn-inline"
                              style="width: ${o}px; height: ${o}px; --icon-size: ${n}px; border-color: ${O}; color: ${O};"
                              @click=${pe}
                              ?disabled=${!b||b<=$}
                            >
                              <ha-icon icon="mdi:minus"></ha-icon>
                            </button>
                          `:""}
                      ${!1!==f.show_target_temp?i.qy`
                            <div
                              class="climate-target-temp"
                              @click=${e=>{e.stopPropagation();const t=e.currentTarget.closest(".climate-dial-wrapper");null==t||t.querySelectorAll(".climate-info-popup.show").forEach((e=>e.classList.remove("show")));const o=null==t?void 0:t.querySelector(".climate-target-info-popup");o&&o.classList.toggle("show")}}
                              title="Tap for target temperature details"
                              style="cursor: pointer;"
                            >
                              ${W&&void 0!==Q&&void 0!==X?i.qy`${Math.round(Q)}-${Math.round(X)}${G}`:void 0!==K?i.qy`${Math.round(K)}${G}`:""}
                            </div>
                          `:""}
                      ${t?i.qy`
                            <button
                              class="climate-control-btn-inline"
                              style="width: ${o}px; height: ${o}px; --icon-size: ${n}px; border-color: ${O}; color: ${O};"
                              @click=${de}
                              ?disabled=${!b||b>=C}
                            >
                              <ha-icon icon="mdi:plus"></ha-icon>
                            </button>
                          `:""}
                    </div>
                  </div>
                `})()}

              <!-- Humidity Display (Below target temp) -->
              ${f.show_humidity&&T&&void 0!==S?i.qy`
                    <div
                      class="climate-humidity-row"
                      style="color: ${!1===f.dynamic_colors&&f.humidity_color||"var(--secondary-text-color)"}; cursor: pointer;"
                      @click=${e=>{e.stopPropagation();const t=e.currentTarget.closest(".climate-dial-wrapper");null==t||t.querySelectorAll(".climate-info-popup.show").forEach((e=>e.classList.remove("show")));const o=null==t?void 0:t.querySelector(".climate-humidity-info-popup");o&&o.classList.toggle("show")}}
                      title="Tap for humidity details"
                    >
                      <span class="climate-humidity-label">Humidity:</span>
                      <span class="climate-humidity-value">${Math.round(S)}%</span>
                    </div>
                  `:""}

              <!-- Bottom Control Icons (power, mode, fan) -->
            ${(()=>{const e=(!1!==f.show_mode_switcher?1:0)+(!1!==f.show_power_button?1:0)+(f.show_fan_controls&&E.length>0?1:0);return i.qy`
                <div class="climate-bottom-controls climate-bottom-controls-${e}">
                  <!-- Mode Icon -->
                  ${!1!==f.show_mode_switcher?i.qy`
                        <div
                          class="climate-bottom-icon ${"off"!==q?"active":""}"
                          style="${"off"!==q?`background-color: ${O}; border-color: ${O};`:""}"
                          @click=${e=>{e.stopPropagation();const t=e.currentTarget.closest(".climate-dial-wrapper");null==t||t.querySelectorAll(".climate-fan-popup.show, .climate-preset-popup.show").forEach((e=>e.classList.remove("show")));const o=null==t?void 0:t.querySelector(".climate-mode-popup");o&&o.classList.toggle("show")}}
                          title="${q.replace("_"," ").toUpperCase()}"
                        >
                          <ha-icon icon="${ce(q)}"></ha-icon>
                        </div>
                      `:""}

                  <!-- Power Icon -->
                  ${!1!==f.show_power_button?i.qy`
                        <div
                          class="climate-bottom-icon ${"off"===q?"power-off":"active"}"
                          style="${"off"!==q?`background-color: ${O}; border-color: ${O};`:""}"
                          @click=${async e=>{e.stopPropagation();const t="off"===q?"heat":"off";await me(t)}}
                          title="Power ${"off"===q?"On":"Off"}"
                        >
                          <ha-icon icon="mdi:power"></ha-icon>
                        </div>
                      `:""}

                  <!-- Fan Icon -->
                  ${f.show_fan_controls&&M&&E.length>0?i.qy`
                        <div
                          class="climate-bottom-icon ${"on"===L||"auto"===L?"active":""}"
                          style="${"on"===L||"auto"===L?`background-color: ${O}; border-color: ${O};`:""}"
                          @click=${e=>{e.stopPropagation();const t=e.currentTarget.closest(".climate-dial-wrapper");null==t||t.querySelectorAll(".climate-mode-popup.show, .climate-preset-popup.show").forEach((e=>e.classList.remove("show")));const o=null==t?void 0:t.querySelector(".climate-fan-popup");o&&o.classList.toggle("show")}}
                          title="Fan: ${(L||"auto").replace("_"," ").toUpperCase()}"
                        >
                          <ha-icon icon="mdi:fan"></ha-icon>
                        </div>
                      `:""}
                </div>
              `})()}
            </div>

            <!-- Mode Popup (hidden by default, shows when mode icon clicked) -->
            ${!1!==f.show_mode_switcher&&P.length>0?i.qy`
                  <div class="climate-mode-popup">
                    <div class="climate-mode-popup-content">
                      ${P.map((e=>i.qy`
                          <button
                            class="climate-mode-popup-btn ${e===q?"active":""}"
                            @click=${t=>{t.stopPropagation(),me(e);const o=t.currentTarget.closest(".climate-mode-popup");o&&o.classList.remove("show")}}
                          >
                            <ha-icon icon="${ce(e)}"></ha-icon>
                            <span>${e.replace("_"," ")}</span>
                          </button>
                        `))}
                    </div>
                  </div>
                `:""}

            <!-- Fan Popup (hidden by default, shows when fan icon clicked) -->
            ${f.show_fan_controls&&M&&E.length>0?i.qy`
                  <div class="climate-fan-popup climate-mode-popup">
                    <div class="climate-mode-popup-content">
                      ${E.map((e=>i.qy`
                          <button
                            class="climate-mode-popup-btn ${e===L?"active":""}"
                            @click=${t=>{t.stopPropagation(),ue(e);const o=t.currentTarget.closest(".climate-fan-popup");o&&o.classList.remove("show")}}
                          >
                            <ha-icon icon="mdi:fan"></ha-icon>
                            <span>${e.replace("_"," ").toUpperCase()}</span>
                          </button>
                        `))}
                    </div>
                  </div>
                `:""}
            ${f.show_preset_modes&&A&&I.length>0?i.qy`
                  <div class="climate-preset-popup climate-mode-popup">
                    <div class="climate-mode-popup-content">
                      ${I.map((e=>i.qy`
                          <button
                            class="climate-mode-popup-btn ${e===V?"active":""}"
                            @click=${t=>{t.stopPropagation(),he(e);const o=t.currentTarget.closest(".climate-preset-popup");o&&o.classList.remove("show")}}
                          >
                            <span>${ae(e)}</span>
                          </button>
                        `))}
                    </div>
                  </div>
                `:""}

            <!-- Temperature Info Popup -->
            <div class="climate-info-popup climate-temp-info-popup">
              <div class="climate-info-popup-content">
                <div class="climate-info-popup-title">Current Temperature</div>
                <div class="climate-info-popup-value">${Math.round(_)}${G}</div>
                <div class="climate-info-popup-detail">Min: ${Math.round($)}${G}</div>
                <div class="climate-info-popup-detail">Max: ${Math.round(C)}${G}</div>
              </div>
            </div>

            <!-- Target Temperature Info Popup -->
            <div class="climate-info-popup climate-target-info-popup">
              <div class="climate-info-popup-content">
                <div class="climate-info-popup-title">Target Temperature</div>
                <div class="climate-info-popup-value">
                  ${W&&void 0!==Q&&void 0!==X?i.qy`${Math.round(Q)}-${Math.round(X)}${G}`:void 0!==K?i.qy`${Math.round(K)}${G}`:"N/A"}
                </div>
                <div class="climate-info-popup-detail">Step: ${k}${G}</div>
              </div>
            </div>

            <!-- Humidity Info Popup -->
            ${T&&void 0!==S?i.qy`
                  <div class="climate-info-popup climate-humidity-info-popup">
                    <div class="climate-info-popup-content">
                      <div class="climate-info-popup-title">Humidity</div>
                      <div class="climate-info-popup-value">${Math.round(S)}%</div>
                      <div class="climate-info-popup-detail">Relative Humidity</div>
                    </div>
                  </div>
                `:""}
          </div>
        </div>
      </div>
    `}validate(e){const t=e,o=[...super.validate(e).errors];return t.entity&&""!==t.entity.trim()||o.push("Climate entity is required"),t.entity&&!t.entity.startsWith("climate.")&&o.push("Entity must be a climate domain entity (climate.*)"),t.dial_size&&(t.dial_size<200||t.dial_size>400)&&o.push("Dial size must be between 200 and 400 pixels"),{valid:0===o.length,errors:o}}async callClimateService(e,t,o,i){try{await i.callService("climate",e,Object.assign({entity_id:t},o))}catch(t){console.error(`Failed to call climate.${e}:`,t)}}getStyles(){return`\n      ${n.m.getSliderStyles()}\n      /* Climate Module Container */\n      .climate-module-container {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 16px;\n        padding: 16px;\n        width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Info Section */\n      .climate-info-top,\n      .climate-info-bottom {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        width: 100%;\n        max-width: 320px;\n      }\n\n      .climate-mode-display,\n      .climate-humidity {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n\n      .climate-mode-display ha-icon,\n      .climate-humidity ha-icon {\n        --mdc-icon-size: 20px;\n        color: var(--primary-color);\n      }\n\n      /* Dial Wrapper */\n      .climate-dial-wrapper {\n        position: relative;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: var(--dial-size, 280px);\n        height: var(--dial-size, 280px);\n        z-index: 1;\n      }\n \n      .climate-ha-slider {\n        width: 100%;\n        height: auto;\n        display: block;\n        z-index: 1;\n        position: relative;\n      }\n\n      /* Dial Center Content */\n      .climate-dial-center {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        text-align: center;\n        pointer-events: none;\n        width: 80%;\n        height: 80%;\n        z-index: 10;\n      }\n\n      /* Enable pointer events on interactive elements inside dial center */\n      .climate-dial-center .climate-preset-display,\n      .climate-dial-center .climate-current-temp,\n      .climate-dial-center .climate-target-stack,\n      .climate-dial-center .climate-humidity-row,\n      .climate-dial-center .climate-bottom-controls,\n      .climate-dial-center .climate-mode-popup,\n      .climate-dial-center .climate-fan-popup,\n      .climate-dial-center .climate-preset-popup,\n      .climate-dial-center .climate-info-popup {\n        pointer-events: auto;\n      }\n\n      /* Dial items wrapper to keep items centered when some are disabled */\n      .climate-dial-items {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 0;\n        padding-top: 20px;\n        width: 100%;\n        height: 100%;\n      }\n\n      .climate-mode-indicator {\n        position: absolute;\n        top: 2%;\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        font-size: 11px;\n        font-weight: 600;\n        letter-spacing: 0.5px;\n        cursor: pointer;\n        padding: 4px 8px;\n        border-radius: 4px;\n        transition: all 0.2s ease;\n        pointer-events: auto;\n      }\n\n      .climate-mode-indicator:hover {\n        background: rgba(var(--rgb-primary-color), 0.1);\n      }\n\n      .climate-humidity-row {\n        position: static;\n        transform: none;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 6px;\n        font-size: 11px;\n        font-weight: 500;\n        opacity: 0.7;\n        text-align: center;\n        flex: 0 0 auto;\n        margin-top: 8px;\n      }\n\n      .climate-humidity-label {\n        text-transform: uppercase;\n        letter-spacing: 0.6px;\n        font-weight: 700;\n        opacity: 0.8;\n      }\n\n      .climate-humidity-value {\n        font-weight: 700;\n      }\n\n      .climate-current-temp {\n        position: static;\n        transform: none;\n        font-size: 56px;\n        font-weight: 700;\n        line-height: 1;\n        transition: font-size 0.3s ease;\n        flex: 0 0 auto;\n      }\n\n      .climate-target-temp {\n        position: static;\n        transform: none;\n        font-size: 14px;\n        font-weight: 500;\n        opacity: 0.8;\n        text-align: center;\n      }\n\n      .climate-target-stack {\n        position: static;\n        transform: none;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 4px;\n        pointer-events: auto;\n        flex: 0 0 auto;\n        padding-top: 4px;\n      }\n \n       .climate-target-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n       }\n \n       /* Bottom Control Icons (power, mode, fan) */\n       .climate-bottom-controls {\n         position: static;\n         transform: none;\n         display: flex;\n         gap: 9px;\n         align-items: center;\n         justify-content: center;\n         pointer-events: auto;\n         margin-top: 10px;\n         flex: 0 0 auto;\n       }\n\n       /* Center button groups based on count */\n       .climate-bottom-controls-1 {\n         width: 50px;\n       }\n\n       .climate-bottom-controls-2 {\n         width: 100px;\n       }\n\n       .climate-bottom-controls-3 {\n         width: 150px;\n       }\n \n       .climate-preset-display {\n         position: static;\n         transform: none;\n         display: inline-flex;\n         align-items: center;\n         padding: 1px 10px;\n         border-radius: 999px;\n         border: none;\n         background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.18);\n         font-size: 12px;\n         font-weight: 600;\n         letter-spacing: 0.3px;\n         cursor: pointer;\n         pointer-events: auto;\n         transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;\n         flex: 0 0 auto;\n         margin-bottom: 4px;\n       }\n\n       .climate-preset-display:hover {\n        background: rgba(var(--rgb-primary-color), 0.22);\n        color: var(--text-primary-color);\n        transform: translateY(-1px);\n      }\n\n      .climate-preset-value {\n        text-transform: capitalize;\n        font-weight: 700;\n      }\n\n      .climate-bottom-icon {\n        width: 24px;\n        height: 24px;\n        border-radius: 50%;\n        border: 2px solid var(--divider-color);\n        background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.05);\n        color: var(--primary-text-color);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .climate-bottom-icon:hover {\n        background: rgba(var(--rgb-primary-color), 0.2);\n        border-color: var(--primary-color);\n        transform: scale(1.05);\n      }\n\n      .climate-bottom-icon.active {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .climate-bottom-icon ha-icon {\n        --mdc-icon-size: 14px;\n        transform: translateY(-1px);\n        display: block;\n      }\n\n      .climate-bottom-icon.power-off {\n        opacity: 0.5;\n      }\n\n      .climate-control-btn-inline {\n        /* Size controlled via inline style, color controlled via inline style */\n        border-radius: 50%;\n        border: 2px solid;\n        background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.9);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        backdrop-filter: blur(10px);\n      }\n\n      .climate-control-btn-inline:hover:not(:disabled) {\n        transform: scale(1.1);\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n        opacity: 0.8;\n      }\n\n      .climate-control-btn-inline:active:not(:disabled) {\n        transform: scale(0.95);\n      }\n\n      .climate-control-btn-inline:disabled {\n        opacity: 0.3;\n        cursor: not-allowed;\n      }\n\n      .climate-control-btn-inline ha-icon {\n        --mdc-icon-size: var(--icon-size, 20px);\n        display: block;\n      }\n\n      /* Mode Popup */\n      .climate-mode-popup {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        z-index: 9999;\n        opacity: 0;\n        visibility: hidden;\n        pointer-events: none;\n        transition: all 0.2s ease;\n      }\n\n      .climate-mode-popup.show {\n        opacity: 1;\n        visibility: visible;\n        pointer-events: auto;\n      }\n\n      .climate-mode-popup-content {\n        background: var(--card-background-color);\n        border-radius: 12px;\n        padding: 8px;\n        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\n        border: 2px solid var(--divider-color);\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n        min-width: 140px;\n      }\n\n      .climate-mode-popup-btn {\n        padding: 12px 16px;\n        border-radius: 8px;\n        border: none;\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        font-size: 13px;\n        font-weight: 500;\n        text-transform: capitalize;\n        text-align: left;\n      }\n\n      .climate-mode-popup-btn ha-icon {\n        --mdc-icon-size: 20px;\n        color: var(--primary-color);\n      }\n\n      .climate-mode-popup-btn:hover {\n        background: var(--secondary-background-color);\n      }\n\n      .climate-mode-popup-btn.active {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n      }\n\n      .climate-mode-popup-btn.active ha-icon {\n        color: var(--text-primary-color);\n      }\n\n      /* Info Popups */\n      .climate-info-popup {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        z-index: 9999;\n        opacity: 0;\n        visibility: hidden;\n        pointer-events: none;\n        transition: all 0.2s ease;\n      }\n\n      .climate-info-popup.show {\n        opacity: 1;\n        visibility: visible;\n        pointer-events: auto;\n      }\n\n      .climate-info-popup-content {\n        background: var(--card-background-color);\n        border-radius: 12px;\n        padding: 16px;\n        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\n        border: 2px solid var(--divider-color);\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        min-width: 160px;\n        text-align: center;\n      }\n\n      .climate-info-popup-title {\n        font-size: 12px;\n        font-weight: 600;\n        text-transform: uppercase;\n        color: var(--secondary-text-color);\n        letter-spacing: 0.5px;\n      }\n\n      .climate-info-popup-value {\n        font-size: 24px;\n        font-weight: 700;\n        color: var(--primary-text-color);\n        line-height: 1;\n      }\n\n      .climate-info-popup-detail {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        opacity: 0.8;\n      }\n\n      /* Fan and Preset Controls */\n      .climate-fan-controls,\n      .climate-preset-controls {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        width: 100%;\n        max-width: 320px;\n      }\n\n      .climate-control-label {\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .climate-chip-group {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 8px;\n      }\n\n      .climate-chip {\n        padding: 6px 12px;\n        border-radius: 16px;\n        border: 1px solid var(--divider-color);\n        background: var(--card-background-color);\n        color: var(--primary-text-color);\n        font-size: 12px;\n        font-weight: 500;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        text-transform: capitalize;\n      }\n\n      .climate-chip:hover {\n        background: var(--secondary-background-color);\n        border-color: var(--primary-color);\n      }\n\n      .climate-chip.active {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      /* Pulse Effect - Growing circles when heating/cooling (background) */\n      .climate-pulse-background {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        width: var(--dial-size, 280px);\n        height: var(--dial-size, 280px);\n        border-radius: 50%;\n        pointer-events: none;\n        z-index: 1;\n      }\n\n      .climate-pulse-circle {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        background-color: var(--pulse-color);\n        border-radius: 50%;\n        opacity: 0.3;\n        animation: climate-pulse-grow 2s ease-out infinite;\n      }\n\n      .climate-pulse-circle:nth-of-type(1) {\n        animation-delay: 0s;\n      }\n\n      .climate-pulse-circle:nth-of-type(2) {\n        animation-delay: 0.5s;\n      }\n\n      .climate-pulse-circle:nth-of-type(3) {\n        animation-delay: 1s;\n      }\n\n      .climate-pulse-circle:nth-of-type(4) {\n        animation-delay: 1.5s;\n      }\n\n      @keyframes climate-pulse-grow {\n        0% {\n          width: 60%;\n          height: 60%;\n          opacity: 0.4;\n        }\n        100% {\n          width: 100%;\n          height: 100%;\n          opacity: 0;\n        }\n      }\n\n      .climate-pulse-mask {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        width: 75%;\n        height: 75%;\n        border-radius: 50%;\n        background-color: var(--card-background-color, var(--ha-card-background, white));\n        z-index: 5;\n        pointer-events: none;\n      }\n\n      /* Dial style variations removed */\n\n      /* Animations removed */\n\n      /* Responsive Design */\n      @media (max-width: 768px) {\n        .climate-module-container {\n          padding: 12px;\n        }\n\n        .climate-current-temp {\n          font-size: 36px;\n        }\n\n        .climate-target-temp {\n          font-size: 12px;\n        }\n\n        .climate-mode-btn {\n          min-width: 60px;\n          padding: 6px 10px;\n          font-size: 10px;\n        }\n      }\n    `}}}}]);