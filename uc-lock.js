"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8358],{9185:(o,n,r)=>{r.r(n),r.d(n,{UltraLockModule:()=>i});var c=r(5183),e=r(6478),t=r(7475);class i extends t.m{constructor(){super(...arguments),this._lockPending=new Map,this.metadata={type:"lock",title:"Lock Control",description:"Modern lock control with lock, unlock, and open when supported",author:"WJD Designs",version:"1.0.0",icon:"mdi:lock",category:"interactive",tags:["lock","security","door","interactive"]}}createDefault(o,n){return{id:o||this.generateId("lock"),type:"lock",entity:"",name:"",icon:"",layout:"standard",alignment:"center",show_title:!0,show_icon:!0,show_state:!0,show_open_button:!0,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(o){var n;const r=[],c=o;return o.id||r.push("Module ID is required"),o.type&&"lock"===o.type||r.push("Module type must be lock"),(null===(n=c.entity)||void 0===n?void 0:n.trim())||r.push((0,e.kg)("editor.lock.error_entity","en","Select a lock entity")),{valid:0===r.length,errors:r}}getLayoutOptions(o){return[{value:"hero",label:(0,e.kg)("editor.lock.layout_hero",o,"Hero")},{value:"standard",label:(0,e.kg)("editor.lock.layout_standard",o,"Standard")},{value:"compact",label:(0,e.kg)("editor.lock.layout_compact",o,"Compact")}]}renderGeneralTab(o,n,r,t){var i;const l=o,a=(null===(i=null==n?void 0:n.locale)||void 0===i?void 0:i.language)||"en";return c.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,e.kg)("editor.lock.entity_section",a,"Entity"),(0,e.kg)("editor.lock.entity_section_desc",a,"Select the lock to control."),[{title:(0,e.kg)("editor.lock.entity",a,"Lock entity"),description:(0,e.kg)("editor.lock.entity_field_desc",a,"Home Assistant lock entity"),hass:n,data:{entity:l.entity||""},schema:[{name:"entity",selector:{entity:{domain:"lock"}}}],onChange:o=>{var n,r;t({entity:null!==(r=null===(n=o.detail.value)||void 0===n?void 0:n.entity)&&void 0!==r?r:""}),setTimeout((()=>this.triggerPreviewUpdate()),50)}},{title:(0,e.kg)("editor.lock.icon_override",a,"Icon override"),description:(0,e.kg)("editor.lock.icon_override_desc",a,"Optional mdi: icon; leave empty for default lock icons"),hass:n,data:{icon:l.icon||""},schema:[this.textField("icon")],onChange:o=>{var n,r;return t({icon:null!==(r=null===(n=o.detail.value)||void 0===n?void 0:n.icon)&&void 0!==r?r:""})}}])}

        ${this.renderSettingsSection((0,e.kg)("editor.lock.display_section",a,"Display"),(0,e.kg)("editor.lock.display_desc",a,"Choose what to show on the card."),[{title:(0,e.kg)("editor.lock.show_title",a,"Show title"),description:(0,e.kg)("editor.lock.show_title_desc",a,"Display the lock name"),hass:n,data:{show_title:!1!==l.show_title},schema:[this.booleanField("show_title")],onChange:o=>{var n,r;return t({show_title:null===(r=null===(n=o.detail.value)||void 0===n?void 0:n.show_title)||void 0===r||r})}},{title:(0,e.kg)("editor.lock.show_icon",a,"Show icon"),description:(0,e.kg)("editor.lock.show_icon_desc",a,"Show lock icon (standard / compact / hero)"),hass:n,data:{show_icon:!1!==l.show_icon},schema:[this.booleanField("show_icon")],onChange:o=>{var n,r;return t({show_icon:null===(r=null===(n=o.detail.value)||void 0===n?void 0:n.show_icon)||void 0===r||r})}},{title:(0,e.kg)("editor.lock.show_state",a,"Show state"),description:(0,e.kg)("editor.lock.show_state_desc",a,"Display locked / unlocked text"),hass:n,data:{show_state:!1!==l.show_state},schema:[this.booleanField("show_state")],onChange:o=>{var n,r;return t({show_state:null===(r=null===(n=o.detail.value)||void 0===n?void 0:n.show_state)||void 0===r||r})}},{title:(0,e.kg)("editor.lock.show_open_button",a,"Show open button"),description:(0,e.kg)("editor.lock.show_open_button_desc",a,"Show Open when the lock supports unlatch (OPEN feature)"),hass:n,data:{show_open_button:!1!==l.show_open_button},schema:[this.booleanField("show_open_button")],onChange:o=>{var n,r;return t({show_open_button:null===(r=null===(n=o.detail.value)||void 0===n?void 0:n.show_open_button)||void 0===r||r})}}])}

        ${this.renderSettingsSection((0,e.kg)("editor.lock.layout_section",a,"Layout"),(0,e.kg)("editor.lock.layout_desc",a,"Visual style of the lock control."),[{title:(0,e.kg)("editor.lock.layout",a,"Layout"),description:(0,e.kg)("editor.lock.layout_style_desc",a,"Hero, standard, or compact"),hass:n,data:{layout:l.layout||"standard"},schema:[this.selectField("layout",this.getLayoutOptions(a))],onChange:o=>{var n;t({layout:(null===(n=o.detail.value)||void 0===n?void 0:n.layout)||"standard"}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}
      </div>
    `}injectLockStyles(){return c.qy`<style>
      ${this.getStyles()}
    </style>`}syncLockPending(o,n){const r=this._lockPending.get(o);r&&(("lock"!==r||"locked"!==n&&"locking"!==n)&&("unlock"!==r||"unlocked"!==n&&"unlocking"!==n)&&("open"!==r||"unlocked"!==n&&"unlocking"!==n)||this._lockPending.delete(o))}renderPreview(o,n,r,t){var i,l,a,d,s;const k=o,u=this.resolveEntity(k.entity,r)||k.entity,p=(null===(i=null==n?void 0:n.locale)||void 0===i?void 0:i.language)||"en";if(!u||!(null===(l=null==n?void 0:n.states)||void 0===l?void 0:l[u]))return c.qy`
        ${this.injectLockStyles()}
        <div class="uc-lock-wrapper" style="border-radius: 16px; overflow: hidden;">
          ${this.renderGradientErrorState((0,e.kg)("editor.lock.config_needed",p,"Select a lock"),(0,e.kg)("editor.lock.config_needed_desc",p,"Choose a lock entity in the General tab"),"mdi:lock")}
        </div>
      `;const g=n.states[u],h=g.attributes||{},v=String(g.state).toLowerCase();this.syncLockPending(u,v);const b=function(o){const n=o.supported_features;return"number"==typeof n?n:0}(h),m=function(o){return!!(1&o)}(b),y=!1!==k.show_open_button&&m,x="unavailable"===v||"unknown"===v,w="locking"===v||"unlocking"===v,_="jammed"===v,f="locked"===v,$="unlocked"===v,S=k.layout||"standard",j=!1!==k.show_title,q=!1!==k.show_icon,C=!1!==k.show_state,L=null===(a=k.icon)||void 0===a?void 0:a.trim(),z=(null===(d=k.name)||void 0===d?void 0:d.trim())||("string"==typeof h.friendly_name?h.friendly_name:"")||(null===(s=u.split(".").pop())||void 0===s?void 0:s.replace(/_/g," "))||"Lock",P=x?(0,e.kg)("editor.lock.unavailable",p,"Unavailable"):_?(0,e.kg)("editor.lock.jammed",p,"Jammed"):"locking"===v?(0,e.kg)("editor.lock.locking",p,"Locking…"):"unlocking"===v?(0,e.kg)("editor.lock.unlocking",p,"Unlocking…"):f?(0,e.kg)("editor.lock.locked",p,"Locked"):$?(0,e.kg)("editor.lock.unlocked",p,"Unlocked"):v.replace(/_/g," "),D=L||(f?"mdi:lock":"mdi:lock-open-variant"),U=o=>{n.callService("lock",o,{entity_id:u})},O=o=>{this._lockPending.set(u,o),this.triggerPreviewUpdate(!0)},A=()=>{O("lock"),U("lock")},E=()=>{O("unlock"),U("unlock")},F=()=>{O("open"),U("open")},H=x||w,M=f||"locking"===v,T=o=>c.qy`
      <ha-icon
        class="uc-lock-ha-icon ${M?"uc-lock-ha-icon--locked":""}"
        style="--mdc-icon-size: ${o}px; color: var(--primary-color);"
        icon="${D}"
      ></ha-icon>
    `,G=()=>c.qy`
      <button
        type="button"
        class="uc-lock-btn ${f?"uc-lock-btn--active":""}"
        @click=${A}
        ?disabled=${H}
      >
        <ha-icon style="--mdc-icon-size: 18px;" icon="mdi:lock"></ha-icon>
        ${(0,e.kg)("editor.lock.action_lock",p,"Lock")}
      </button>
      <button
        type="button"
        class="uc-lock-btn ${$?"uc-lock-btn--active":""}"
        @click=${E}
        ?disabled=${H}
      >
        <ha-icon style="--mdc-icon-size: 18px;" icon="mdi:lock-open-variant"></ha-icon>
        ${(0,e.kg)("editor.lock.action_unlock",p,"Unlock")}
      </button>
      ${y?c.qy`<button
            type="button"
            class="uc-lock-btn uc-lock-btn--ghost"
            @click=${F}
            ?disabled=${H}
          >
            <ha-icon style="--mdc-icon-size: 18px;" icon="mdi:door-open"></ha-icon>
            ${(0,e.kg)("editor.lock.action_open",p,"Open")}
          </button>`:c.s6}
    `;let I;I="hero"===S?c.qy`
        <div class="uc-lock uc-lock--hero">
          <div class="uc-lock__visual">
            <div class="uc-lock__glow ${M?"uc-lock__glow--on":""}"></div>
            <div class="uc-lock-circle ${M?"uc-lock-circle--locked":""} ${_?"uc-lock-circle--jammed":""}">
              ${q?T(56):c.s6}
            </div>
          </div>
          <div class="uc-lock__identity">
            ${j?c.qy`<h2 class="uc-lock-title">${z}</h2>`:c.s6}
            ${C?c.qy`<span class="uc-lock-badge ${M?"uc-lock-badge--locked":""} ${_?"uc-lock-badge--jammed":""} ${x?"uc-lock-badge--unavail":""}">
                  ${M&&!x?c.qy`<span class="uc-lock-status-dot"></span>`:c.s6}
                  ${P}
                </span>`:c.s6}
          </div>
          ${_?c.qy`<p class="uc-lock-warn">${(0,e.kg)("editor.lock.jammed_hint",p,"Check the lock hardware.")}</p>`:c.s6}
          <div class="uc-lock__actions" role="group">${G()}</div>
        </div>
      `:"compact"===S?c.qy`
        <div class="uc-lock uc-lock--compact">
          <div class="uc-lock-compact__row">
            ${q?c.qy`<div class="uc-lock-icon-well ${M?"uc-lock-icon-well--locked":""} ${_?"uc-lock-icon-well--jammed":""}">
                  ${T(18)}
                </div>`:c.s6}
            <span class="uc-lock-chip-label">${j?z:P}</span>
            <button
              type="button"
              class="uc-lock-chip-btn ${M?"":"uc-lock-chip-btn--active"}"
              @click=${f?E:A}
              ?disabled=${H}
            >
              ${f?(0,e.kg)("editor.lock.action_unlock",p,"Unlock"):(0,e.kg)("editor.lock.action_lock",p,"Lock")}
            </button>
          </div>
        </div>
      `:c.qy`
        <div class="uc-lock uc-lock--standard">
          <div class="uc-lock-std__row">
            ${q?c.qy`<div class="uc-lock-icon-well uc-lock-icon-well--std ${M?"uc-lock-icon-well--locked":""} ${_?"uc-lock-icon-well--jammed":""}">
                  ${T(28)}
                </div>`:c.s6}
            <div class="uc-lock-std__meta">
              ${j?c.qy`<h2 class="uc-lock-title uc-lock-title--std">${z}</h2>`:c.s6}
              ${C?c.qy`<p class="uc-lock-subtitle">${P}</p>`:c.s6}
            </div>
            <div class="uc-lock-std__actions" role="group">${G()}</div>
          </div>
          ${_?c.qy`<p class="uc-lock-warn">${(0,e.kg)("editor.lock.jammed_hint",p,"Check the lock hardware.")}</p>`:c.s6}
        </div>
      `;const R=this.buildDesignStyles(o,n),J=Object.entries(R).filter((([,o])=>null!=o&&""!==o)).map((([o,n])=>`${o.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${n}`)).join("; "),N=this.getHoverEffectClass(o);return c.qy`
      ${this.injectLockStyles()}
      <div
        class="uc-lock-wrapper ${N} ${_?"uc-lock-wrapper--jammed":""}"
        style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 18px; overflow: hidden; ${J}"
      >
        ${this.wrapWithAnimation(I,o,n)}
      </div>
    `}getStyles(){return"\n      .uc-lock-wrapper { box-sizing: border-box; }\n      .uc-lock { box-sizing: border-box; color: var(--primary-text-color); }\n\n      /* ═══ HERO ═══════════════════════════════════ */\n      .uc-lock--hero {\n        padding: 28px 20px 24px;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 16px;\n      }\n      .uc-lock__visual {\n        position: relative;\n        width: 140px;\n        height: 140px;\n        flex-shrink: 0;\n      }\n      .uc-lock__glow {\n        position: absolute;\n        inset: -14px;\n        border-radius: 50%;\n        background: radial-gradient(circle, color-mix(in srgb, var(--primary-color) 12%, transparent) 0%, transparent 70%);\n        opacity: 0;\n        transition: opacity 0.4s ease;\n        pointer-events: none;\n      }\n      .uc-lock__glow--on { opacity: 1; }\n      .uc-lock-circle {\n        width: 100%;\n        height: 100%;\n        border-radius: 50%;\n        background: radial-gradient(\n          circle at 38% 32%,\n          color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background))) 0%,\n          color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 92%, var(--primary-color)) 100%\n        );\n        border: 1.5px solid color-mix(in srgb, var(--divider-color) 40%, transparent);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        box-shadow: inset 0 2px 16px rgba(0,0,0,0.12);\n        transition: border-color 0.3s ease, box-shadow 0.3s ease;\n        position: relative;\n        z-index: 1;\n      }\n      .uc-lock-circle--locked {\n        border-color: color-mix(in srgb, var(--primary-color) 35%, transparent);\n        box-shadow: inset 0 2px 16px rgba(0,0,0,0.14), 0 0 40px color-mix(in srgb, var(--primary-color) 12%, transparent);\n      }\n      .uc-lock-circle--jammed {\n        border-color: color-mix(in srgb, var(--error-color, #db4437) 45%, transparent);\n      }\n      .uc-lock__identity {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 8px;\n        text-align: center;\n      }\n      .uc-lock--hero .uc-lock__actions {\n        display: flex;\n        gap: 8px;\n        width: 100%;\n        max-width: 340px;\n      }\n\n      /* ═══ STANDARD (single row) ══════════════════ */\n      .uc-lock--standard { padding: 14px 16px; }\n      .uc-lock-std__row {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n      .uc-lock-std__meta { flex: 1; min-width: 0; overflow: hidden; }\n      .uc-lock-std__actions {\n        flex-shrink: 0;\n        display: flex;\n        align-items: center;\n        gap: 7px;\n      }\n      .uc-lock-std__actions .uc-lock-btn {\n        padding: 7px 14px;\n        font-size: 0.8125rem;\n        border-radius: 999px;\n      }\n      .uc-lock-icon-well--std { width: 40px; height: 40px; }\n      .uc-lock-title--std { font-size: 0.9375rem; font-weight: 700; }\n      .uc-lock-subtitle {\n        margin: 3px 0 0;\n        font-size: 0.8125rem;\n        line-height: 1.35;\n        color: var(--secondary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      /* ═══ COMPACT (chip) ═════════════════════════ */\n      .uc-lock--compact { padding: 6px 10px; }\n      .uc-lock-compact__row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n      .uc-lock-chip-label {\n        flex: 1;\n        min-width: 0;\n        font-size: 0.8125rem;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n      .uc-lock-chip-btn {\n        flex-shrink: 0;\n        font: inherit;\n        font-size: 0.75rem;\n        font-weight: 700;\n        padding: 5px 12px;\n        border-radius: 999px;\n        cursor: pointer;\n        border: 1.5px solid color-mix(in srgb, var(--divider-color) 75%, transparent);\n        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        transition: background 0.15s, border-color 0.15s, color 0.15s;\n      }\n      .uc-lock-chip-btn:disabled { opacity: 0.45; cursor: not-allowed; }\n      .uc-lock-chip-btn--active {\n        border-color: color-mix(in srgb, var(--primary-color) 50%, transparent);\n        background: color-mix(in srgb, var(--primary-color) 14%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--primary-color);\n      }\n\n      /* ═══ SHARED ═════════════════════════════════ */\n      .uc-lock-icon-well {\n        flex-shrink: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        border-radius: 50%;\n        background: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background)));\n        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);\n        transition: box-shadow 0.2s ease, border-color 0.2s ease;\n      }\n      .uc-lock--compact .uc-lock-icon-well {\n        width: 28px; height: 28px;\n        background: transparent;\n        border: none;\n      }\n      .uc-lock-icon-well--locked {\n        border-color: color-mix(in srgb, var(--primary-color) 38%, transparent);\n        box-shadow: 0 2px 14px color-mix(in srgb, var(--primary-color) 12%, transparent);\n      }\n      .uc-lock-icon-well--jammed {\n        border-color: color-mix(in srgb, var(--error-color, #db4437) 40%, transparent);\n      }\n      .uc-lock-ha-icon { line-height: 1; transition: transform 0.28s ease; }\n      .uc-lock-ha-icon--locked { transform: scale(1.05); }\n      @media (prefers-reduced-motion: reduce) {\n        .uc-lock-ha-icon { transition: none; }\n        .uc-lock-ha-icon--locked { transform: none; }\n      }\n\n      .uc-lock-title {\n        margin: 0;\n        font-size: 1.25rem;\n        font-weight: 800;\n        letter-spacing: -0.02em;\n        line-height: 1.25;\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n      .uc-lock-badge {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n        padding: 4px 14px;\n        border-radius: 999px;\n        font-size: 0.75rem;\n        font-weight: 700;\n        letter-spacing: 0.03em;\n        text-transform: uppercase;\n        background: color-mix(in srgb, var(--divider-color) 15%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--secondary-text-color);\n        border: 1px solid color-mix(in srgb, var(--divider-color) 35%, transparent);\n      }\n      .uc-lock-badge--locked {\n        background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--primary-color);\n        border-color: color-mix(in srgb, var(--primary-color) 25%, transparent);\n      }\n      .uc-lock-badge--jammed {\n        background: color-mix(in srgb, var(--error-color, #db4437) 12%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--error-color, #db4437);\n        border-color: color-mix(in srgb, var(--error-color, #db4437) 25%, transparent);\n      }\n      .uc-lock-badge--unavail { opacity: 0.6; }\n      .uc-lock-status-dot {\n        width: 7px; height: 7px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        box-shadow: 0 0 6px color-mix(in srgb, var(--primary-color) 60%, transparent);\n        flex-shrink: 0;\n      }\n      .uc-lock-warn {\n        margin: 0;\n        font-size: 0.8125rem;\n        color: var(--error-color, #db4437);\n        font-weight: 600;\n      }\n      .uc-lock-wrapper--jammed .uc-lock-badge {\n        color: color-mix(in srgb, var(--error-color, #db4437) 70%, var(--secondary-text-color));\n      }\n\n      .uc-lock-btn {\n        flex: 1;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 6px;\n        font: inherit;\n        font-size: 0.8125rem;\n        font-weight: 700;\n        padding: 10px 14px;\n        border-radius: 14px;\n        cursor: pointer;\n        border: 1.5px solid color-mix(in srgb, var(--divider-color) 60%, transparent);\n        background: color-mix(in srgb, var(--divider-color) 6%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;\n      }\n      .uc-lock-btn:active:not(:disabled) { transform: scale(0.97); }\n      .uc-lock-btn:disabled { opacity: 0.4; cursor: not-allowed; }\n      .uc-lock-btn--active {\n        border-color: color-mix(in srgb, var(--primary-color) 50%, transparent);\n        background: color-mix(in srgb, var(--primary-color) 14%, var(--card-background-color, var(--ha-card-background)));\n        color: var(--primary-color);\n      }\n      .uc-lock-btn:hover:not(:disabled) {\n        border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);\n        box-shadow: 0 4px 16px color-mix(in srgb, var(--primary-color) 10%, transparent);\n      }\n      .uc-lock-btn--ghost {\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        background: transparent;\n        border-color: color-mix(in srgb, var(--divider-color) 40%, transparent);\n      }\n    "}}}}]);