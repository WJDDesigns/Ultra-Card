"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5158],{7999:(n,e,a)=>{a.r(e),a.d(e,{UltraFanModule:()=>s});var r=a(5183),o=a(6478),t=a(7475);function i(n){const e=n.trim();return e?e.replace(/_/g," ").split(/\s+/).map((n=>n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():n)).join(" "):e}a(7921);class s extends t.m{constructor(){super(...arguments),this._fanSpeedOverride=new Map,this.metadata={type:"fan",title:"Fan Control",description:"Modern fan control with speed, presets, oscillation, and direction",author:"WJD Designs",version:"1.0.0",icon:"mdi:fan",category:"interactive",tags:["fan","speed","hvac","air","interactive"]}}createDefault(n,e){return{id:n||this.generateId("fan"),type:"fan",entity:"",name:"",icon:"",layout:"standard",alignment:"center",show_title:!0,show_icon:!0,show_state:!0,show_percentage:!0,show_percentage_control:!0,show_preset_modes:!0,show_oscillate:!0,show_direction:!0,show_speed_steppers:!0,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(n){var e;const a=[],r=n;return n.id||a.push("Module ID is required"),n.type&&"fan"===n.type||a.push("Module type must be fan"),(null===(e=r.entity)||void 0===e?void 0:e.trim())||a.push((0,o.kg)("editor.fan.error_entity","en","Select a fan entity")),{valid:0===a.length,errors:a}}getLayoutOptions(n){return[{value:"hero",label:(0,o.kg)("editor.fan.layout_hero",n,"Hero")},{value:"standard",label:(0,o.kg)("editor.fan.layout_standard",n,"Standard")},{value:"compact",label:(0,o.kg)("editor.fan.layout_compact",n,"Compact")}]}getAlignmentOptions(n){return[{value:"left",label:(0,o.kg)("editor.fan.alignment_left",n,"Left")},{value:"center",label:(0,o.kg)("editor.fan.alignment_center",n,"Center")},{value:"right",label:(0,o.kg)("editor.fan.alignment_right",n,"Right")}]}renderGeneralTab(n,e,a,t){var i;const s=n,c=(null===(i=null==e?void 0:e.locale)||void 0===i?void 0:i.language)||"en";return r.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,o.kg)("editor.fan.entity_section",c,"Entity"),(0,o.kg)("editor.fan.entity_desc",c,"Select the fan to control."),[{title:(0,o.kg)("editor.fan.entity",c,"Fan entity"),description:(0,o.kg)("editor.fan.entity_field_desc",c,"Home Assistant fan entity"),hass:e,data:{entity:s.entity||""},schema:[{name:"entity",selector:{entity:{domain:"fan"}}}],onChange:n=>{var e,a;t({entity:null!==(a=null===(e=n.detail.value)||void 0===e?void 0:e.entity)&&void 0!==a?a:""}),setTimeout((()=>this.triggerPreviewUpdate()),50)}},{title:(0,o.kg)("editor.fan.icon_override",c,"Icon override"),description:(0,o.kg)("editor.fan.icon_override_desc",c,"Optional mdi: icon; leave empty for the animated fan graphic"),hass:e,data:{icon:s.icon||""},schema:[this.textField("icon")],onChange:n=>{var e,a;return t({icon:null!==(a=null===(e=n.detail.value)||void 0===e?void 0:e.icon)&&void 0!==a?a:""})}}])}

        ${this.renderSettingsSection((0,o.kg)("editor.fan.display_section",c,"Display"),(0,o.kg)("editor.fan.display_desc",c,"Choose what to show on the card."),[{title:(0,o.kg)("editor.fan.show_title",c,"Show title"),description:(0,o.kg)("editor.fan.show_title_desc",c,"Display the fan name"),hass:e,data:{show_title:!1!==s.show_title},schema:[this.booleanField("show_title")],onChange:n=>{var e,a;return t({show_title:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_title)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_icon",c,"Show icon"),description:(0,o.kg)("editor.fan.show_icon_desc",c,"Show header icon (layout standard/compact)"),hass:e,data:{show_icon:!1!==s.show_icon},schema:[this.booleanField("show_icon")],onChange:n=>{var e,a;return t({show_icon:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_icon)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_state",c,"Show state"),description:(0,o.kg)("editor.fan.show_state_desc",c,"Display on/off and mode text"),hass:e,data:{show_state:!1!==s.show_state},schema:[this.booleanField("show_state")],onChange:n=>{var e,a;return t({show_state:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_state)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_percentage",c,"Show percentage"),description:(0,o.kg)("editor.fan.show_percentage_desc",c,"Show speed bar and value when supported"),hass:e,data:{show_percentage:!1!==s.show_percentage},schema:[this.booleanField("show_percentage")],onChange:n=>{var e,a;return t({show_percentage:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_percentage)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_percentage_control",c,"Show speed slider"),description:(0,o.kg)("editor.fan.show_percentage_control_desc",c,"Allow 0–100% when supported"),hass:e,data:{show_percentage_control:!1!==s.show_percentage_control},schema:[this.booleanField("show_percentage_control")],onChange:n=>{var e,a;return t({show_percentage_control:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_percentage_control)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_preset_modes",c,"Show preset modes"),description:(0,o.kg)("editor.fan.show_preset_modes_desc",c,"Preset chips when supported"),hass:e,data:{show_preset_modes:!1!==s.show_preset_modes},schema:[this.booleanField("show_preset_modes")],onChange:n=>{var e,a;return t({show_preset_modes:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_preset_modes)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_oscillate",c,"Show oscillate"),description:(0,o.kg)("editor.fan.show_oscillate_desc",c,"Oscillation toggle when supported"),hass:e,data:{show_oscillate:!1!==s.show_oscillate},schema:[this.booleanField("show_oscillate")],onChange:n=>{var e,a;return t({show_oscillate:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_oscillate)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_direction",c,"Show direction"),description:(0,o.kg)("editor.fan.show_direction_desc",c,"Forward / reverse when supported"),hass:e,data:{show_direction:!1!==s.show_direction},schema:[this.booleanField("show_direction")],onChange:n=>{var e,a;return t({show_direction:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_direction)||void 0===a||a})}},{title:(0,o.kg)("editor.fan.show_speed_steppers",c,"Show speed steppers"),description:(0,o.kg)("editor.fan.show_speed_steppers_desc",c,"Increase / decrease speed buttons"),hass:e,data:{show_speed_steppers:!1!==s.show_speed_steppers},schema:[this.booleanField("show_speed_steppers")],onChange:n=>{var e,a;return t({show_speed_steppers:null===(a=null===(e=n.detail.value)||void 0===e?void 0:e.show_speed_steppers)||void 0===a||a})}}])}

        ${this.renderSettingsSection((0,o.kg)("editor.fan.layout_section",c,"Layout"),(0,o.kg)("editor.fan.layout_desc",c,"Visual style and alignment."),[{title:(0,o.kg)("editor.fan.layout",c,"Layout"),description:(0,o.kg)("editor.fan.layout_style_desc",c,"Hero, standard, or compact"),hass:e,data:{layout:s.layout||"standard"},schema:[this.selectField("layout",this.getLayoutOptions(c))],onChange:n=>{var e;t({layout:(null===(e=n.detail.value)||void 0===e?void 0:e.layout)||"standard"}),setTimeout((()=>this.triggerPreviewUpdate()),50)}},{title:(0,o.kg)("editor.fan.alignment",c,"Alignment"),description:(0,o.kg)("editor.fan.alignment_desc",c,"Align content"),hass:e,data:{alignment:s.alignment||"center"},schema:[this.selectField("alignment",this.getAlignmentOptions(c))],onChange:n=>{var e;t({alignment:(null===(e=n.detail.value)||void 0===e?void 0:e.alignment)||"center"}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}
      </div>
    `}injectFanStyles(){return r.qy`<style>
      ${this.getStyles()}
    </style>`}renderFanBladesSvg(n,e,a,o){return String(n||"fan").replace(/[^a-zA-Z0-9_-]/g,""),r.qy`
      <svg
        class="uc-fan-svg"
        viewBox="0 0 100 100"
        width="${e}"
        height="${e}"
        style="display: block; color: var(--primary-color);"
        aria-hidden="true"
      >
        <g
          class="uc-fan-blades ${o?"uc-fan-blades--spin":""}"
          style="transform-origin: 50px 50px; --uc-fan-dur: ${a};"
        >
          ${[0,90,180,270].map((n=>r.JW`
              <g transform="rotate(${n} 50 50)">
                <path
                  d="M 50,42 C 46,36 43,22 46,12 C 48,6 54,8 56,16 C 58,24 54,36 50,42 Z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </g>
            `))}
        </g>
        <circle cx="50" cy="50" r="9" fill="var(--card-background-color, var(--ha-card-background, #111))" />
        <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.95" />
        <circle cx="50" cy="50" r="2.5" fill="var(--card-background-color, var(--ha-card-background, #111))" opacity="0.65" />
      </svg>
    `}renderPreview(n,e,a,t){var s,c,l,d,p;const u=n,f=this.resolveEntity(u.entity,a)||u.entity,h=(null===(s=null==e?void 0:e.locale)||void 0===s?void 0:s.language)||"en";if(!f||!(null===(c=null==e?void 0:e.states)||void 0===c?void 0:c[f]))return r.qy`
        ${this.injectFanStyles()}
        <div class="uc-fan-wrapper" style="border-radius: 16px; overflow: hidden;">
          ${this.renderGradientErrorState((0,o.kg)("editor.fan.config_needed",h,"Select a fan"),(0,o.kg)("editor.fan.config_needed_desc",h,"Choose a fan entity in the General tab"),"mdi:fan")}
        </div>
      `;const g=e.states[f],v=g.attributes||{},m=function(n){const e=n.supported_features;return"number"==typeof e?e:0}(v),b=!!(1&m),w=!!(2&m),_=!!(4&m),x=!!(8&m),y=!!(32&m),k=!!(16&m),$=String(g.state),S="unavailable"===$||"unknown"===$,C=!S&&function(n,e){if("on"===n)return!0;if("off"===n||"unavailable"===n||"unknown"===n)return!1;const a=e.percentage;if("number"==typeof a&&a>0)return!0;const r=e.preset_mode;return"string"==typeof r&&r.length>0}($,v),q=v.percentage,F="number"==typeof q?Math.max(0,Math.min(100,q)):void 0,M="string"==typeof v.preset_mode?v.preset_mode:void 0,z=Array.isArray(v.preset_modes)?v.preset_modes.filter((n=>"string"==typeof n)):[],O=!0===v.oscillating,A="string"==typeof v.direction?v.direction:void 0;let j=this._fanSpeedOverride.get(f);void 0!==j&&void 0!==F&&Math.abs(F-j)<=1&&(this._fanSpeedOverride.delete(f),j=void 0);const P=Math.max(0,Math.min(100,Math.round(void 0!==j?j:void 0!==F?F:C?100:0))),T=P,D=function(n,e){if(!e)return"0s";const a=void 0===n?100:Math.max(1,Math.min(100,n));return`${Math.max(.38,2.35-a/100*1.97).toFixed(2)}s`}(C?P:void 0,C),U=!1!==u.show_title,L=!1!==u.show_icon,H=!1!==u.show_state,I=!1!==u.show_percentage&&b,B=!1!==u.show_percentage_control&&b,E=!1!==u.show_preset_modes&&x&&z.length>0,G=!1!==u.show_oscillate&&w,R=!1!==u.show_direction&&_,W=(u.show_speed_steppers,u.layout||"standard"),Z=u.alignment||"center",J=null===(l=u.icon)||void 0===l?void 0:l.trim(),N=(null===(d=u.name)||void 0===d?void 0:d.trim())||("string"==typeof v.friendly_name?v.friendly_name:"")||(null===(p=f.split(".").pop())||void 0===p?void 0:p.replace(/_/g," "))||"Fan",V=S?(0,o.kg)("editor.fan.unavailable",h,"Unavailable"):C?M?i(M):b?`${P}% Speed`:(0,o.kg)("editor.fan.state_on",h,"On"):(0,o.kg)("editor.fan.state_off",h,"Off"),Y=(n,a={})=>{e.callService("fan",n,Object.assign({entity_id:f},a))},K=()=>{this._fanSpeedOverride.delete(f),y&&k?e.callService("fan","toggle",{entity_id:f}):C&&k?Y("turn_off"):!C&&y&&Y("turn_on"),this.triggerPreviewUpdate(!0)},Q=n=>{const e=Math.max(0,Math.min(100,Math.round(Number(n.target.value))));this._fanSpeedOverride.set(f,e),(n=>{const e=Math.max(0,Math.min(100,Math.round(n)));0===e&&k?Y("turn_off"):Y("set_percentage",{percentage:e})})(e),this.triggerPreviewUpdate(!0)},X=e=>J?r.qy`<ha-icon
            class="${C&&!S?"uc-fan-mdi-spin":""}"
            style="font-size: ${e}px; color: var(--primary-color); --uc-fan-dur: ${D};"
            icon="${J}"
          ></ha-icon>`:this.renderFanBladesSvg(n.id,e,D,C&&!S),nn=(n,e)=>r.qy`
      <div class="uc-fan-icon-well ${e} ${C?"uc-fan-icon-well--on":""}">
        ${X(n)}
      </div>
    `,en=n=>b&&(I||B)?r.qy`
            <div class="uc-fan-speed-section">
              <div class="uc-fan-speed__row">
                <span class="uc-fan-section-label">
                  ${(0,o.kg)("editor.fan.speed",h,"Speed")}
                </span>
                ${I&&b?n?r.qy`<span class="uc-fan-speed__big">${P}<span class="uc-fan-speed__unit">%</span></span>`:r.qy`<span class="uc-fan-speed__sm">${P}%</span>`:r.s6}
              </div>
              ${B?r.qy`
                    <div
                      class="uc-fan-slider-combo"
                      style="--uc-fan-pct: ${P};"
                    >
                      <div class="uc-fan-slider-fill"></div>
                      <input
                        type="range"
                        class="uc-fan-range"
                        min="0"
                        max="100"
                        .value=${String(P)}
                        @input=${Q}
                        ?disabled=${S}
                      />
                    </div>
                  `:I?r.qy`<div class="uc-fan-track">
                      <div class="uc-fan-track__fill" style="width: ${T}%;"></div>
                    </div>`:r.s6}
            </div>
          `:r.s6,an=E||R?r.qy`
            <div class="uc-fan-two-col">
              ${E?r.qy`
                    <div class="uc-fan-col">
                      <p class="uc-fan-section-label">
                        ${(0,o.kg)("editor.fan.presets_label",h,"Airflow Mode")}
                      </p>
                      <div class="uc-fan-chips">
                        ${z.map((n=>r.qy`
                            <button
                              type="button"
                              class="uc-fan-chip ${M===n?"is-active":""}"
                              @click=${()=>Y("set_preset_mode",{preset_mode:n})}
                              ?disabled=${S}
                            >
                              ${i(n)}
                            </button>
                          `))}
                      </div>
                    </div>
                  `:r.s6}
              ${R?r.qy`
                    <div class="uc-fan-col">
                      <p class="uc-fan-section-label">
                        ${(0,o.kg)("editor.fan.direction",h,"Direction")}
                      </p>
                      <div class="uc-fan-chips">
                        <button
                          type="button"
                          class="uc-fan-chip ${"forward"===A?"is-active":""}"
                          @click=${()=>Y("set_direction",{direction:"forward"})}
                          ?disabled=${S}
                        >
                          ${(0,o.kg)("editor.fan.forward",h,"Forward")}
                        </button>
                        <button
                          type="button"
                          class="uc-fan-chip ${"reverse"===A?"is-active":""}"
                          @click=${()=>Y("set_direction",{direction:"reverse"})}
                          ?disabled=${S}
                        >
                          ${(0,o.kg)("editor.fan.reverse",h,"Reverse")}
                        </button>
                      </div>
                    </div>
                  `:r.s6}
            </div>
          `:r.s6,rn=G?r.qy`
          <div class="uc-fan-chips">
            <button
              type="button"
              class="uc-fan-chip ${O?"is-active":""}"
              @click=${()=>Y("oscillate",{oscillating:!O})}
              ?disabled=${S}
            >
              ${(0,o.kg)("editor.fan.oscillate",h,"Oscillate")}
            </button>
          </div>
        `:r.s6,on=n=>y||k?r.qy`<button
            type="button"
            class="uc-fan-power-btn ${C?"":"uc-fan-power-btn--off"} ${"compact"===n||"standard"===n?"uc-fan-power-btn--sm":"uc-fan-power-btn--full"}"
            @click=${K}
            ?disabled=${S}
          >
            ${C?(0,o.kg)("editor.fan.turn_off",h,"Turn off"):(0,o.kg)("editor.fan.turn_on",h,"Turn on")}
          </button>`:r.s6;let tn;tn="hero"===W?r.qy`
        <div class="uc-fan uc-fan-hero uc-fan-align-${Z}">
          <div class="uc-fan-hero__grid">
            <!-- Circle stage -->
            <div class="uc-fan-hero__stage">
              <div class="uc-fan-circle ${C?"uc-fan-circle--on":""}">
                ${X(148)}
              </div>
              ${U||H?r.qy`
                    <div class="uc-fan-hero__ident">
                      ${U?r.qy`<h2 class="uc-fan-title uc-fan-title--hero">${N}</h2>`:r.s6}
                      ${H?r.qy`
                            <p class="uc-fan-subtitle">
                              ${C?r.qy`<span class="uc-fan-status-dot" aria-hidden="true"></span>`:r.s6}
                              ${V}
                            </p>
                          `:r.s6}
                    </div>
                  `:r.s6}
            </div>

            <!-- Controls -->
            <div class="uc-fan-hero__controls">
              ${en(!0)}
              ${an}
              ${rn}
              ${on("hero")}
            </div>
          </div>
        </div>
      `:"compact"===W?r.qy`
        <div class="uc-fan uc-fan-compact uc-fan-align-${Z}">
          <div class="uc-fan-compact__row">
            ${L?nn(34,"uc-fan-icon-well--compact"):r.s6}
            <div class="uc-fan-compact__meta">
              ${U?r.qy`<h2 class="uc-fan-title uc-fan-title--compact">${N}</h2>`:r.s6}
              ${H?r.qy`<p class="uc-fan-subtitle">${V}</p>`:r.s6}
            </div>
            ${I&&b?r.qy`<span class="uc-fan-chip uc-fan-chip--speed">${P}%</span>`:r.s6}
            ${on("compact")}
          </div>
          ${b&&B?r.qy`
                <div
                  class="uc-fan-slider-combo"
                  style="--uc-fan-pct: ${P};"
                >
                  <div class="uc-fan-slider-fill"></div>
                  <input
                    type="range"
                    class="uc-fan-range"
                    min="0"
                    max="100"
                    .value=${String(P)}
                    @input=${Q}
                    ?disabled=${S}
                  />
                </div>
              `:b&&I&&!B?r.qy`<div class="uc-fan-track">
                  <div class="uc-fan-track__fill" style="width: ${T}%;"></div>
                </div>`:r.s6}
        </div>
      `:r.qy`
        <div class="uc-fan uc-fan-standard uc-fan-align-${Z}">
          <div class="uc-fan-header">
            ${L?nn(46,"uc-fan-icon-well--standard"):r.s6}
            <div class="uc-fan-header__text">
              ${U?r.qy`<h2 class="uc-fan-title uc-fan-title--standard">${N}</h2>`:r.s6}
              ${H?r.qy`<p class="uc-fan-subtitle">${V}</p>`:r.s6}
            </div>
            <div class="uc-fan-header__actions">
              ${on("standard")}
            </div>
          </div>
          ${en(!1)}
          ${an}
          ${rn}
        </div>
      `;const sn=this.buildDesignStyles(n,e),cn=Object.entries(sn).filter((([,n])=>null!=n&&""!==n)).map((([n,e])=>`${n.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${e}`)).join("; "),ln=this.getHoverEffectClass(n);return r.qy`
      ${this.injectFanStyles()}
      <div
        class="uc-fan-wrapper ${ln}"
        style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 18px; overflow: hidden; ${cn}"
      >
        ${this.wrapWithAnimation(tn,n,e)}
      </div>
    `}getStyles(){return"\n      /* ── Base ───────────────────────────────────── */\n      .uc-fan-wrapper { box-sizing: border-box; }\n      .uc-fan { box-sizing: border-box; color: var(--primary-text-color); }\n\n      /* ── Hero layout ────────────────────────────── */\n      .uc-fan-hero { padding: 22px 20px 20px; }\n      .uc-fan-hero__grid {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 22px;\n        align-items: flex-start;\n        justify-content: center;\n      }\n      .uc-fan-hero__stage {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 14px;\n        flex-shrink: 0;\n      }\n      .uc-fan-circle {\n        position: relative;\n        width: 148px;\n        height: 148px;\n        border-radius: 50%;\n        background: radial-gradient(\n          circle at 38% 32%,\n          color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color, var(--ha-card-background))) 0%,\n          color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 95%, var(--primary-color)) 100%\n        );\n        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        box-shadow: inset 0 2px 12px rgba(0,0,0,0.15);\n        transition: box-shadow 0.3s ease, border-color 0.3s ease;\n      }\n      .uc-fan-circle--on {\n        border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);\n        /* Soft glow only — avoid a second ring (no duplicate outline vs. border) */\n        box-shadow:\n          inset 0 2px 12px rgba(0,0,0,0.18),\n          0 10px 36px color-mix(in srgb, var(--primary-color) 14%, transparent);\n      }\n      .uc-fan-hero__ident { text-align: center; }\n      .uc-fan-hero__controls {\n        flex: 1;\n        min-width: 220px;\n        display: flex;\n        flex-direction: column;\n        gap: 16px;\n        justify-content: center;\n      }\n\n      /* ── Standard layout ────────────────────────── */\n      .uc-fan-standard {\n        padding: 18px;\n        display: flex;\n        flex-direction: column;\n        gap: 14px;\n      }\n      .uc-fan-header {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n      .uc-fan-header__text { flex: 1; min-width: 0; }\n      .uc-fan-header__actions {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        flex-shrink: 0;\n        flex-wrap: wrap;\n      }\n\n      /* ── Compact layout ─────────────────────────── */\n      .uc-fan-compact { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }\n      .uc-fan-compact__row {\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        flex-wrap: nowrap;\n        overflow: hidden;\n      }\n      .uc-fan-compact__meta { flex: 1; min-width: 0; overflow: hidden; }\n\n      /* ── Icon well ──────────────────────────────── */\n      .uc-fan-icon-well {\n        flex-shrink: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        border-radius: 50%;\n        background: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background)));\n        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);\n        transition: box-shadow 0.2s ease, border-color 0.2s ease;\n      }\n      .uc-fan-icon-well--standard { width: 46px; height: 46px; }\n      .uc-fan-icon-well--compact  { width: 40px; height: 40px; }\n      .uc-fan-icon-well--on {\n        border-color: color-mix(in srgb, var(--primary-color) 38%, transparent);\n        box-shadow: 0 2px 14px color-mix(in srgb, var(--primary-color) 12%, transparent);\n      }\n      .uc-fan-icon-well .uc-fan-svg { display: block; }\n      .uc-fan-icon-well--on .uc-fan-svg {\n        filter: drop-shadow(0 1px 5px color-mix(in srgb, var(--primary-color) 38%, transparent));\n      }\n\n      /* ── Typography ─────────────────────────────── */\n      .uc-fan-title {\n        margin: 0;\n        font-weight: 700;\n        letter-spacing: -0.01em;\n        line-height: 1.25;\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n      .uc-fan-title--hero    { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.025em; }\n      .uc-fan-title--standard { font-size: 1rem; }\n      .uc-fan-title--compact  { font-size: 0.9375rem; }\n      .uc-fan-subtitle {\n        margin: 3px 0 0;\n        font-size: 0.8125rem;\n        line-height: 1.35;\n        color: var(--secondary-text-color);\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n      .uc-fan-status-dot {\n        width: 7px;\n        height: 7px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        box-shadow: 0 0 6px color-mix(in srgb, var(--primary-color) 60%, transparent);\n        flex-shrink: 0;\n        display: inline-block;\n      }\n\n      /* ── Speed section ──────────────────────────── */\n      .uc-fan-speed-section { display: flex; flex-direction: column; gap: 8px; }\n      .uc-fan-speed__row {\n        display: flex;\n        align-items: baseline;\n        justify-content: space-between;\n        gap: 10px;\n      }\n      .uc-fan-section-label {\n        font-size: 0.6875rem;\n        font-weight: 700;\n        text-transform: uppercase;\n        letter-spacing: 0.1em;\n        color: var(--secondary-text-color);\n        margin: 0 0 6px;\n        display: block;\n      }\n      .uc-fan-speed__row .uc-fan-section-label { margin: 0; }\n      .uc-fan-speed__big {\n        font-size: 2.2rem;\n        font-weight: 800;\n        font-variant-numeric: tabular-nums;\n        color: var(--primary-color);\n        letter-spacing: -0.03em;\n        line-height: 1;\n        text-shadow: 0 0 20px color-mix(in srgb, var(--primary-color) 28%, transparent);\n      }\n      .uc-fan-speed__unit { font-size: 1.1rem; font-weight: 600; letter-spacing: 0; }\n      .uc-fan-speed__sm {\n        font-size: 0.9375rem;\n        font-weight: 700;\n        color: var(--primary-color);\n        font-variant-numeric: tabular-nums;\n      }\n\n      /* ── Track ──────────────────────────────────── */\n      .uc-fan-track {\n        height: 7px;\n        border-radius: 999px;\n        background: color-mix(in srgb, var(--divider-color) 38%, var(--card-background-color, var(--ha-card-background)));\n        overflow: hidden;\n      }\n      .uc-fan-track--hero { height: 11px; }\n      .uc-fan-track__fill {\n        height: 100%;\n        border-radius: 999px;\n        background: linear-gradient(\n          90deg,\n          color-mix(in srgb, var(--primary-color) 55%, transparent),\n          var(--primary-color)\n        );\n        box-shadow: 0 0 12px color-mix(in srgb, var(--primary-color) 28%, transparent);\n        transition: width 0.32s cubic-bezier(0.25, 0.8, 0.25, 1);\n      }\n\n      /* ── Combined slider (fill layer under range) ── */\n      .uc-fan-slider-combo {\n        position: relative;\n        height: 26px;\n        display: flex;\n        align-items: center;\n        /* Thumb width must match ::-webkit-slider-thumb / ::-moz-range-thumb for alignment */\n        --uc-fan-thumb: 20px;\n        --uc-fan-pct: 0;\n      }\n      .uc-fan-slider-fill {\n        position: absolute;\n        left: 0;\n        top: 50%;\n        transform: translateY(-50%);\n        height: 6px;\n        border-radius: 999px;\n        /* Fill to the range thumb *center* (inset by half-thumb at each end) */\n        width: calc(\n          (var(--uc-fan-thumb) / 2) + (100% - var(--uc-fan-thumb)) * var(--uc-fan-pct) / 100\n        );\n        max-width: 100%;\n        background: linear-gradient(\n          90deg,\n          color-mix(in srgb, var(--primary-color) 55%, transparent),\n          var(--primary-color)\n        );\n        box-shadow: 0 0 10px color-mix(in srgb, var(--primary-color) 25%, transparent);\n        pointer-events: none;\n      }\n\n      /* ── Range slider ───────────────────────────── */\n      .uc-fan-range {\n        width: 100%;\n        margin: 0;\n        height: 26px;\n        -webkit-appearance: none;\n        appearance: none;\n        background: transparent;\n        cursor: pointer;\n        position: relative;\n        z-index: 1;\n      }\n      .uc-fan-range:focus { outline: none; }\n      .uc-fan-range:focus-visible::-webkit-slider-thumb {\n        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 35%, transparent);\n      }\n      .uc-fan-range::-webkit-slider-runnable-track {\n        height: 6px;\n        border-radius: 999px;\n        background: color-mix(in srgb, var(--divider-color) 45%, transparent);\n      }\n      .uc-fan-range::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        margin-top: -7px;\n        border-radius: 50%;\n        background: var(--card-background-color, var(--ha-card-background));\n        border: 2.5px solid var(--primary-color);\n        box-shadow: 0 2px 8px rgba(0,0,0,0.14);\n        cursor: pointer;\n        transition: transform 0.12s ease;\n      }\n      .uc-fan-range::-webkit-slider-thumb:hover { transform: scale(1.15); }\n      .uc-fan-range::-moz-range-track {\n        height: 6px;\n        border-radius: 999px;\n        background: color-mix(in srgb, var(--divider-color) 45%, transparent);\n      }\n      .uc-fan-range::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--card-background-color, var(--ha-card-background));\n        border: 2.5px solid var(--primary-color);\n        cursor: pointer;\n      }\n\n      /* ── Preset mode section ────────────────────── */\n      .uc-fan-mode-section { display: flex; flex-direction: column; }\n\n      /* ── Two-column presets + direction ─────────── */\n      .uc-fan-two-col {\n        display: flex;\n        gap: 18px;\n        flex-wrap: wrap;\n        align-items: flex-start;\n      }\n      .uc-fan-col {\n        display: flex;\n        flex-direction: column;\n        gap: 6px;\n        flex: 1;\n        min-width: 80px;\n      }\n      .uc-fan-col .uc-fan-section-label { margin: 0 0 4px; }\n\n      /* ── Chips ──────────────────────────────────── */\n      .uc-fan-chips { display: flex; flex-wrap: wrap; gap: 7px; }\n      .uc-fan-chip {\n        font: inherit;\n        font-size: 0.8125rem;\n        font-weight: 500;\n        padding: 7px 15px;\n        border-radius: 999px;\n        border: 1px solid color-mix(in srgb, var(--divider-color) 72%, transparent);\n        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--secondary-text-color);\n        cursor: pointer;\n        transition: background 0.14s, border-color 0.14s, color 0.14s, box-shadow 0.14s;\n        white-space: nowrap;\n        letter-spacing: 0.01em;\n      }\n      .uc-fan-chip.is-active {\n        border-color: color-mix(in srgb, var(--primary-color) 55%, transparent);\n        background: linear-gradient(\n          135deg,\n          color-mix(in srgb, var(--primary-color) 15%, var(--card-background-color, var(--ha-card-background))),\n          color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background)))\n        );\n        color: var(--primary-color);\n        font-weight: 600;\n        box-shadow: 0 2px 10px color-mix(in srgb, var(--primary-color) 12%, transparent);\n      }\n      .uc-fan-chip:disabled { opacity: 0.4; cursor: not-allowed; }\n      .uc-fan-chip:hover:not(:disabled):not(.is-active) {\n        border-color: color-mix(in srgb, var(--primary-color) 28%, var(--divider-color));\n        color: var(--primary-text-color);\n      }\n      /* Speed display in compact — same size/shape as power button */\n      .uc-fan-chip--speed {\n        pointer-events: none;\n        color: var(--primary-color);\n        border-color: color-mix(in srgb, var(--primary-color) 40%, transparent);\n        background: color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color, var(--ha-card-background)));\n        font-weight: 700;\n        font-variant-numeric: tabular-nums;\n      }\n\n      /* ── Power button ───────────────────────────── */\n      .uc-fan-power-btn {\n        font: inherit;\n        font-size: 0.8125rem;\n        font-weight: 700;\n        padding: 9px 20px;\n        border-radius: 999px;\n        cursor: pointer;\n        border: 1.5px solid color-mix(in srgb, var(--primary-color) 50%, transparent);\n        background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--primary-color);\n        white-space: nowrap;\n        transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;\n        flex-shrink: 0;\n      }\n      .uc-fan-power-btn:hover:not(:disabled) {\n        background: color-mix(in srgb, var(--primary-color) 20%, var(--card-background-color, var(--ha-card-background)));\n        box-shadow: 0 4px 14px color-mix(in srgb, var(--primary-color) 14%, transparent);\n      }\n      .uc-fan-power-btn--off {\n        border-color: color-mix(in srgb, var(--divider-color) 80%, transparent);\n        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--secondary-text-color);\n      }\n      .uc-fan-power-btn--sm { font-size: 0.75rem; padding: 7px 14px; }\n      /* Full-width power button for hero layout */\n      .uc-fan-power-btn--full {\n        width: 100%;\n        text-align: center;\n        flex-shrink: unset;\n      }\n      .uc-fan-power-btn:disabled { opacity: 0.4; cursor: not-allowed; }\n\n      /* ── Power row (hero bottom) ─────────────────── */\n      .uc-fan-power-row {\n        display: flex;\n        flex-wrap: wrap;\n        align-items: center;\n        gap: 10px;\n      }\n\n      /* ── Alignment ──────────────────────────────── */\n      .uc-fan-align-left   .uc-fan-hero__ident,\n      .uc-fan-align-left   .uc-fan-header__text  { text-align: left; }\n      .uc-fan-align-center .uc-fan-hero__ident   { text-align: center; }\n      .uc-fan-align-right  .uc-fan-hero__ident,\n      .uc-fan-align-right  .uc-fan-header__text  { text-align: right; }\n\n      /* ── Animations ─────────────────────────────── */\n      @keyframes ucFanSpin {\n        from { transform: rotate(0deg); }\n        to   { transform: rotate(360deg); }\n      }\n      .uc-fan-blades--spin {\n        animation: ucFanSpin var(--uc-fan-dur, 1.2s) linear infinite;\n      }\n      .uc-fan-mdi-spin {\n        display: inline-block;\n        animation: ucFanSpin var(--uc-fan-dur, 1.2s) linear infinite;\n        transform-origin: center center;\n      }\n      @media (prefers-reduced-motion: reduce) {\n        .uc-fan-blades--spin,\n        .uc-fan-mdi-spin { animation: none !important; }\n      }\n    "}}}}]);