"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[678],{678:(e,t,i)=>{i.r(t),i.d(t,{UltraTimerModule:()=>g});var n=i(5183),o=i(7475),r=i(6478);const s="__ultraTimerStore__",a="__ultraTimerEntitySync__";function l(){const e=window;return e[s]||(e[s]=new Map),e[s]}function d(){window.dispatchEvent(new CustomEvent("ultra-card-template-update",{bubbles:!0,composed:!0}))}function c(e){const t=l().get(e);if(t&&"running"===t.status&&(t.remaining_seconds=Math.max(0,t.remaining_seconds-1),d(),t.remaining_seconds<=0)){t.interval_id&&(clearInterval(t.interval_id),t.interval_id=void 0),t.status="expired";const e=t.on_expire;t.on_expire=void 0,e&&e(),d()}}const u={getState:e=>l().get(e),start(e,t,i){const n=l(),o=n.get(e);(null==o?void 0:o.interval_id)&&clearInterval(o.interval_id);const r={status:"running",remaining_seconds:t,end_time:Date.now()+1e3*t,on_expire:i};r.interval_id=setInterval((()=>c(e)),1e3),n.set(e,r),d()},pause(e){const t=l().get(e);t&&"running"===t.status&&(t.interval_id&&(clearInterval(t.interval_id),t.interval_id=void 0),t.status="paused",t.end_time=void 0,d())},resume(e){const t=l().get(e);t&&"paused"===t.status&&(t.status="running",t.end_time=Date.now()+1e3*t.remaining_seconds,t.interval_id=setInterval((()=>c(e)),1e3),d())},reset(e){const t=l(),i=t.get(e);(null==i?void 0:i.interval_id)&&clearInterval(i.interval_id),t.delete(e),d()},dismiss(e){this.reset(e)},snooze(e,t){const i=l().get(e),n=null==i?void 0:i.on_expire;(null==i?void 0:i.interval_id)&&clearInterval(i.interval_id),this.start(e,t,n)},syncFromEntity(e,t,i,n,o){var r;const s=function(){const e=window;return e[a]||(e[a]=new Map),e[a]}(),u=s.get(e);if(u&&u.haState===t&&u.lastChanged===n)return;s.set(e,{haState:t,lastChanged:n});const v=l(),m=v.get(e);if("active"===t){(null==m?void 0:m.interval_id)&&clearInterval(m.interval_id);const t=Math.round(i),n={status:"running",remaining_seconds:t,end_time:Date.now()+1e3*t,on_expire:o};n.interval_id=setInterval((()=>c(e)),1e3),v.set(e,n),d()}else if("paused"===t){(null==m?void 0:m.interval_id)&&clearInterval(m.interval_id);const t={status:"paused",remaining_seconds:Math.round(i),on_expire:null!==(r=null==m?void 0:m.on_expire)&&void 0!==r?r:o};v.set(e,t),d()}else m&&"idle"!==m.status&&(m.interval_id&&clearInterval(m.interval_id),v.delete(e),d())}};i(7921);const v=[300,600,900,1800,3600];function m(e){const t=Math.floor(e/3600),i=Math.floor(e%3600/60),n=e%60;return t>0?`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}:${String(n).padStart(2,"0")}`:`${String(i).padStart(2,"0")}:${String(n).padStart(2,"0")}`}class g extends o.m{constructor(){super(...arguments),this.metadata={type:"timer",title:"Timer",description:"Countdown timer with optional action when time runs out",author:"WJD Designs",version:"1.0.0",icon:"mdi:timer-outline",category:"interactive",tags:["timer","countdown","kitchen","automation"]}}createDefault(e,t){return{id:e||this.generateId("timer"),type:"timer",title:"",icon:"mdi:timer-outline",duration_seconds:300,preset_durations:v,style:"circle",on_expire_action:{action:"nothing"},show_snooze_dismiss:!1,snooze_seconds:300,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getStyleOptions(e){return[{value:"circle",label:(0,r.kg)("editor.timer.style.circle",e,"Circle")},{value:"progress_bar",label:(0,r.kg)("editor.timer.style.progress_bar",e,"Progress Bar")},{value:"digital",label:(0,r.kg)("editor.timer.style.digital",e,"Digital")},{value:"background_fill",label:(0,r.kg)("editor.timer.style.background_fill",e,"Background Fill")}]}renderGeneralTab(e,t,i,o){var s,a,l;const d=e,c=(null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)||"en";return n.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Basic -->
        ${this.renderSettingsSection((0,r.kg)("editor.timer.basic.title",c,"Basic"),(0,r.kg)("editor.timer.basic.desc",c,"Title and icon for the timer."),[{title:(0,r.kg)("editor.timer.title",c,"Title"),description:(0,r.kg)("editor.timer.title_desc",c,"Optional label (e.g. Kitchen, Door close)"),hass:t,data:{title:d.title||""},schema:[this.textField("title")],onChange:e=>o(Object.assign({},e.detail.value))},{title:(0,r.kg)("editor.timer.icon",c,"Icon"),description:(0,r.kg)("editor.timer.icon_desc",c,"Icon for the timer"),hass:t,data:{icon:d.icon||"mdi:timer-outline"},schema:[this.iconField("icon")],onChange:e=>o(Object.assign({},e.detail.value))}])}

        <!-- Duration -->
        <div class="settings-section">
          <div class="section-title">${(0,r.kg)("editor.timer.duration.title",c,"Duration")}</div>
          <div class="section-description" style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 14px;">
            ${(0,r.kg)("editor.timer.duration.desc",c,"Default duration when Start is pressed.")}
          </div>
          ${this.renderFieldSection((0,r.kg)("editor.timer.duration_seconds",c,"Default duration (seconds)"),(0,r.kg)("editor.timer.duration_seconds_desc",c,"e.g. 300 = 5 minutes"),t,{duration_seconds:null!==(a=d.duration_seconds)&&void 0!==a?a:300},[this.numberField("duration_seconds",1,86400)],(e=>o(e.detail.value)))}
        </div>

        <!-- When timer ends -->
        <div class="settings-section">
          <div class="section-title">${(0,r.kg)("editor.timer.on_expire.title",c,"When timer ends")}</div>
          <div class="section-description" style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 14px;">
            ${(0,r.kg)("editor.timer.on_expire.desc",c,"Action to run when the countdown reaches zero (e.g. turn off light, close cover).")}
          </div>
          <ha-form
            .hass=${t}
            .data=${{on_expire_action:d.on_expire_action||{action:"nothing"}}}
            .schema=${[{name:"on_expire_action",selector:{ui_action:{}}}]}
            .computeLabel=${e=>t.localize(`ui.panel.lovelace.editor.card.generic.${e.name}`)||"Action"}
            @value-changed=${e=>{var t;const i=null===(t=e.detail.value)||void 0===t?void 0:t.on_expire_action;i&&o({on_expire_action:i}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
          ></ha-form>
        </div>

        <!-- Display style -->
        ${this.renderFieldSection((0,r.kg)("editor.timer.style.title",c,"Display style"),(0,r.kg)("editor.timer.style.desc",c,"How the timer is shown"),t,{style:d.style||"circle"},[this.selectField("style",this.getStyleOptions(c))],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

        <!-- Advanced -->
        <div class="settings-section">
          <div class="section-title">${(0,r.kg)("editor.timer.advanced.title",c,"Advanced")}</div>
          ${this.renderFieldSection((0,r.kg)("editor.timer.timer_entity",c,"Timer entity"),(0,r.kg)("editor.timer.timer_entity_desc",c,"Optional Home Assistant timer entity to sync with"),t,{timer_entity:d.timer_entity||""},[this.entityField("timer_entity")],(e=>o(e.detail.value)))}
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              ${(0,r.kg)("editor.timer.show_snooze_dismiss",c,"Show Snooze / Dismiss when expired")}
            </div>
            <div class="field-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px;">
              ${(0,r.kg)("editor.timer.show_snooze_dismiss_desc",c,"When the timer ends, show Snooze (restart) and Dismiss buttons.")}
            </div>
            <ha-switch
              .checked=${!!d.show_snooze_dismiss}
              @change=${e=>{const t=e.target;o({show_snooze_dismiss:t.checked}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ha-switch>
          </div>
          ${d.show_snooze_dismiss?this.renderFieldSection((0,r.kg)("editor.timer.snooze_seconds",c,"Snooze duration (seconds)"),(0,r.kg)("editor.timer.snooze_seconds_desc",c,"Restart countdown for this many seconds when Snooze is tapped"),t,{snooze_seconds:null!==(l=d.snooze_seconds)&&void 0!==l?l:300},[this.numberField("snooze_seconds",1,3600)],(e=>o(e.detail.value))):""}
        </div>
      </div>
    `}renderPreview(e,t,i,o){var s,a,l,d,c,g;const p=e,h=Math.max(1,null!==(s=p.duration_seconds)&&void 0!==s?s:300),_=null!==(a=p.preset_durations)&&void 0!==a?a:v,y=p.style||"circle",x=p.icon||"mdi:timer-outline",f=p.title||(0,r.kg)("editor.timer.default_title",(null===(l=null==t?void 0:t.locale)||void 0===l?void 0:l.language)||"en","Timer"),b=!!p.show_snooze_dismiss,w=null!==(d=p.snooze_seconds)&&void 0!==d?d:300,k=()=>{const n=p.on_expire_action,o=null==n?void 0:n.action;n&&"nothing"!==o&&"none"!==o&&this.handleModuleAction(n,t,void 0,i,void 0,e)};if(p.timer_entity&&t){const e=t.states[p.timer_entity];if(e){const t=e.state,i=function(e){var t;const i=(null!==(t=e.attributes.remaining)&&void 0!==t?t:"0:00:00").split(":").map(Number);let n=0;if(n=3===i.length?3600*i[0]+60*i[1]+i[2]:2===i.length?60*i[0]+i[1]:i[0]||0,"active"===e.state){const t=(Date.now()-new Date(e.last_changed).getTime())/1e3;n=Math.max(0,n-t)}return n}(e);u.syncFromEntity(p.id,t,i,e.last_changed,k)}}const $=u.getState(p.id),z=null!==(c=null==$?void 0:$.status)&&void 0!==c?c:"idle",S=null!==(g=null==$?void 0:$.remaining_seconds)&&void 0!==g?g:0,D=e=>{u.start(p.id,e,k)},q=(()=>{var e,i,o,s,a,l,d,c,v;if("expired"===z)return n.qy`
          <div class="uc-timer uc-timer-expired" style="padding: 16px; text-align: center;">
            <ha-icon icon="${x}" style="font-size: 48px; color: var(--primary-color); margin-bottom: 8px;"></ha-icon>
            <div class="uc-timer-title" style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${f}</div>
            <div style="font-size: 16px; color: var(--primary-color); margin-bottom: 16px;">
              ${(0,r.kg)("editor.timer.times_up",(null===(e=null==t?void 0:t.locale)||void 0===e?void 0:e.language)||"en","Time's up!")}
            </div>
            ${b?n.qy`
                  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <ha-button
                      @click=${()=>{u.snooze(p.id,w)}}
                    >
                      ${(0,r.kg)("editor.timer.snooze",(null===(i=null==t?void 0:t.locale)||void 0===i?void 0:i.language)||"en","Snooze")}
                    </ha-button>
                    <ha-button
                      outlined
                      @click=${()=>u.dismiss(p.id)}
                    >
                      ${(0,r.kg)("editor.timer.dismiss",(null===(o=null==t?void 0:t.locale)||void 0===o?void 0:o.language)||"en","Dismiss")}
                    </ha-button>
                  </div>
                `:n.qy`
                  <ha-button outlined @click=${()=>u.dismiss(p.id)}>
                    ${(0,r.kg)("editor.timer.dismiss",(null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)||"en","Dismiss")}
                  </ha-button>
                `}
          </div>
        `;if("idle"===z)return n.qy`
          <div class="uc-timer uc-timer-idle" style="padding: 16px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
              <ha-icon icon="${x}" style="font-size: 28px; color: var(--primary-color);"></ha-icon>
              <span class="uc-timer-title" style="font-size: 16px; font-weight: 600;">${f}</span>
            </div>
            <div style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: var(--primary-text-color);">
              ${m(h)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; justify-content: center;">
              ${_.map((e=>n.qy`
                    <ha-button
                      dense
                      @click=${()=>D(e)}
                    >
                      ${e<3600?e/60+"m":e/3600+"h"}
                    </ha-button>
                  `))}
            </div>
            <ha-button raised style="width: 100%;" @click=${()=>D(h)}>
              ${(0,r.kg)("editor.timer.start",(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en","Start")}
            </ha-button>
          </div>
        `;const g=h>0?1-S/h:0,k=100*Math.min(1,Math.max(0,g));return n.qy`
        <div class="uc-timer uc-timer-running" style="padding: 16px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
            <ha-icon icon="${x}" style="font-size: 24px; color: var(--primary-color);"></ha-icon>
            <span class="uc-timer-title" style="font-size: 14px; font-weight: 600;">${f}</span>
          </div>
          ${"paused"===z?n.qy`<div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">${(0,r.kg)("editor.timer.paused",(null===(l=null==t?void 0:t.locale)||void 0===l?void 0:l.language)||"en","Paused")}</div>`:""}

          ${"circle"===y?n.qy`
                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 16px;">
                  <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--divider-color)" stroke-width="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="var(--primary-color)"
                      stroke-width="3"
                      stroke-dasharray="${100} ${100}"
                      stroke-dashoffset="${100-k}"
                      stroke-linecap="round"
                      style="transition: stroke-dashoffset 0.3s ease;"
                    />
                  </svg>
                  <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: var(--primary-text-color);">
                    ${m(S)}
                  </div>
                </div>
              `:"progress_bar"===y?n.qy`
                  <div style="margin-bottom: 16px;">
                    <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;">
                      ${m(S)}
                    </div>
                    <div style="height: 12px; background: var(--divider-color); border-radius: 6px; overflow: hidden;">
                      <div
                        style="height: 100%; width: ${k}%; background: var(--primary-color); border-radius: 6px; transition: width 0.3s ease;"
                      ></div>
                    </div>
                  </div>
                `:"background_fill"===y?n.qy`
                    <div
                      style="
                        position: relative;
                        min-height: 80px;
                        border-radius: 12px;
                        background: var(--divider-color);
                        overflow: hidden;
                        margin-bottom: 16px;
                      "
                    >
                      <div
                        style="
                          position: absolute;
                          bottom: 0;
                          left: 0;
                          right: 0;
                          height: ${k}%;
                          background: var(--primary-color);
                          opacity: 0.4;
                          transition: height 0.3s ease;
                        "
                      ></div>
                      <div style="position: relative; padding: 16px; font-size: 28px; font-weight: 700; color: var(--primary-text-color);">
                        ${m(S)}
                      </div>
                    </div>
                  `:n.qy`
                    <div style="font-size: 36px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px; text-align: center;">
                      ${m(S)}
                    </div>
                  `}

          <div style="display: flex; gap: 8px; justify-content: center;">
            ${"running"===z?n.qy`
                  <ha-button outlined @click=${()=>u.pause(p.id)}>
                    ${(0,r.kg)("editor.timer.pause",(null===(d=null==t?void 0:t.locale)||void 0===d?void 0:d.language)||"en","Pause")}
                  </ha-button>
                `:n.qy`
                  <ha-button @click=${()=>u.resume(p.id)}>
                    ${(0,r.kg)("editor.timer.resume",(null===(c=null==t?void 0:t.locale)||void 0===c?void 0:c.language)||"en","Resume")}
                  </ha-button>
                `}
            <ha-button outlined @click=${()=>u.reset(p.id)}>
              ${(0,r.kg)("editor.timer.cancel",(null===(v=null==t?void 0:t.locale)||void 0===v?void 0:v.language)||"en","Cancel")}
            </ha-button>
          </div>
        </div>
      `})();return n.qy`
      <div class="uc-timer-wrapper" style="background: var(--card-background-color); border-radius: 12px; overflow: hidden;">
        ${q}
      </div>
    `}validate(e){const t=[];e.id||t.push("Module ID is required"),e.type&&"timer"===e.type||t.push("Module type must be timer");const i=e;return void 0!==i.duration_seconds&&(i.duration_seconds<1||i.duration_seconds>86400)&&t.push("Duration must be between 1 and 86400 seconds"),{valid:0===t.length,errors:t}}}}}]);