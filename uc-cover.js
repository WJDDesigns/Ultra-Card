"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8512],{2997:(t,e,o)=>{o.r(e),o.d(e,{UltraCoverModule:()=>l});var i=o(5183),n=o(6478),r=o(7475);o(7921);class l extends r.m{constructor(){super(...arguments),this.metadata={type:"cover",title:"Cover Control",description:"Control blinds, garage doors, and shutters",author:"WJD Designs",version:"1.0.0",icon:"mdi:blinds",category:"interactive",tags:["cover","blinds","garage","shutters"]}}createDefault(t,e){return{id:t||this.generateId("cover"),type:"cover",entity:"",name:"",icon:"",show_title:!0,show_icon:!0,show_state:!0,show_position:!0,show_stop:!0,show_position_control:!0,layout:"standard",alignment:"center",show_tilt:!1,show_tilt_control:!1,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(t){const e=[],o=t;t.id||e.push("Module ID is required"),t.type&&"cover"===t.type||e.push("Module type must be cover");const i=!(!o.entity||!o.entity.trim()),n=Array.isArray(o.entities)&&o.entities.length>0;return i||n||e.push("Select at least one cover entity"),{valid:0===e.length,errors:e}}getLayoutOptions(t){return[{value:"compact",label:(0,n.kg)("editor.cover.layout_compact",t,"Compact")},{value:"standard",label:(0,n.kg)("editor.cover.layout_standard",t,"Standard")},{value:"buttons",label:(0,n.kg)("editor.cover.layout_buttons",t,"Buttons")}]}getAlignmentOptions(t){return[{value:"left",label:(0,n.kg)("editor.cover.alignment_left",t,"Left")},{value:"center",label:(0,n.kg)("editor.cover.alignment_center",t,"Center")},{value:"right",label:(0,n.kg)("editor.cover.alignment_right",t,"Right")}]}renderGeneralTab(t,e,o,r){var l,s,a;const d=t,c=(null===(l=null==e?void 0:e.locale)||void 0===l?void 0:l.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity -->
        ${this.renderSettingsSection((0,n.kg)("editor.cover.entity_section",c,"Entity"),(0,n.kg)("editor.cover.entity_desc",c,"Select the cover to control (blinds, garage, shutters)."),[{title:(0,n.kg)("editor.cover.entity",c,"Cover entity"),description:(0,n.kg)("editor.cover.entity_desc",c,"Select the cover to control."),hass:e,data:{entity:d.entity||""},schema:[{name:"entity",selector:{entity:{domain:"cover"}}}],onChange:t=>{var e,o;r({entity:null!==(o=null===(e=t.detail.value)||void 0===e?void 0:e.entity)&&void 0!==o?o:""}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}

        <!-- Display -->
        ${this.renderSettingsSection((0,n.kg)("editor.cover.display_section",c,"Display"),(0,n.kg)("editor.cover.display_desc",c,"Choose what to show on the card."),[{title:(0,n.kg)("editor.cover.show_title",c,"Show title"),description:(0,n.kg)("editor.cover.show_title_desc",c,"Display the cover name"),hass:e,data:{show_title:!1!==d.show_title},schema:[this.booleanField("show_title")],onChange:t=>{var e,o;return r({show_title:null===(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_title)||void 0===o||o})}},{title:(0,n.kg)("editor.cover.show_icon",c,"Show icon"),description:(0,n.kg)("editor.cover.show_icon_desc",c,"Display the cover icon"),hass:e,data:{show_icon:!1!==d.show_icon},schema:[this.booleanField("show_icon")],onChange:t=>{var e,o;return r({show_icon:null===(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_icon)||void 0===o||o})}},{title:(0,n.kg)("editor.cover.show_state",c,"Show state"),description:(0,n.kg)("editor.cover.show_state_desc",c,"Display open/closed/opening/closing"),hass:e,data:{show_state:!1!==d.show_state},schema:[this.booleanField("show_state")],onChange:t=>{var e,o;return r({show_state:null===(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_state)||void 0===o||o})}},{title:(0,n.kg)("editor.cover.show_position",c,"Show position"),description:(0,n.kg)("editor.cover.show_position_desc",c,"Show position bar or percentage"),hass:e,data:{show_position:!1!==d.show_position},schema:[this.booleanField("show_position")],onChange:t=>{var e,o;return r({show_position:null===(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_position)||void 0===o||o})}},{title:(0,n.kg)("editor.cover.show_position_control",c,"Show position slider"),description:(0,n.kg)("editor.cover.show_position_control_desc",c,"Allow setting position 0-100%"),hass:e,data:{show_position_control:!1!==d.show_position_control},schema:[this.booleanField("show_position_control")],onChange:t=>{var e,o;return r({show_position_control:null===(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_position_control)||void 0===o||o})}},{title:(0,n.kg)("editor.cover.show_stop",c,"Show stop button"),description:(0,n.kg)("editor.cover.show_stop_desc",c,"Show stop button when supported"),hass:e,data:{show_stop:!1!==d.show_stop},schema:[this.booleanField("show_stop")],onChange:t=>{var e,o;return r({show_stop:null===(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_stop)||void 0===o||o})}}])}

        <!-- Layout -->
        ${this.renderSettingsSection((0,n.kg)("editor.cover.layout_section",c,"Layout"),(0,n.kg)("editor.cover.layout_desc",c,"How the controls are arranged."),[{title:(0,n.kg)("editor.cover.layout",c,"Layout style"),description:(0,n.kg)("editor.cover.layout_style_desc",c,"Compact, standard, or buttons only"),hass:e,data:{layout:d.layout||"standard"},schema:[this.selectField("layout",this.getLayoutOptions(c))],onChange:t=>{var e;r({layout:(null===(e=t.detail.value)||void 0===e?void 0:e.layout)||"standard"}),setTimeout((()=>this.triggerPreviewUpdate()),50)}},{title:(0,n.kg)("editor.cover.alignment",c,"Alignment"),description:(0,n.kg)("editor.cover.alignment_desc",c,"Align content left, center, or right"),hass:e,data:{alignment:d.alignment||"center"},schema:[this.selectField("alignment",this.getAlignmentOptions(c))],onChange:t=>{var e;r({alignment:(null===(e=t.detail.value)||void 0===e?void 0:e.alignment)||"center"}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}

        <!-- Advanced: Tilt & multi-cover -->
        <div class="settings-section" style="margin-top: 16px;">
          <div class="section-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
            ${(0,n.kg)("editor.cover.advanced_section",c,"Advanced")}
          </div>
          <div class="field-description" style="margin-bottom: 12px; color: var(--secondary-text-color);">
            ${(0,n.kg)("editor.cover.advanced_desc",c,"Tilt and multi-cover options.")}
          </div>
          ${this.renderFieldSection((0,n.kg)("editor.cover.show_tilt",c,"Show tilt"),(0,n.kg)("editor.cover.show_tilt_desc",c,"Show tilt state and controls when supported"),e,{show_tilt:null!==(s=d.show_tilt)&&void 0!==s&&s},[this.booleanField("show_tilt")],(t=>{var e,o;return r({show_tilt:null!==(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_tilt)&&void 0!==o&&o})}))}
          ${this.renderFieldSection((0,n.kg)("editor.cover.show_tilt_control",c,"Show tilt slider"),(0,n.kg)("editor.cover.show_tilt_control_desc",c,"Allow setting tilt position when supported"),e,{show_tilt_control:null!==(a=d.show_tilt_control)&&void 0!==a&&a},[this.booleanField("show_tilt_control")],(t=>{var e,o;return r({show_tilt_control:null!==(o=null===(e=t.detail.value)||void 0===e?void 0:e.show_tilt_control)&&void 0!==o&&o})}))}
        </div>
      </div>
    `}renderPreview(t,e,o,r){var l,s,a;const d=t,c=this.resolveEntity(d.entity,o)||d.entity,v=(null===(l=null==e?void 0:e.locale)||void 0===l?void 0:l.language)||"en";if(!c||!(null==e?void 0:e.states[c]))return i.qy`
        <div class="uc-cover-wrapper" style="border-radius: 12px; overflow: hidden;">
          ${this.renderGradientErrorState((0,n.kg)("editor.cover.config_needed",v,"Select a cover"),(0,n.kg)("editor.cover.config_needed_desc",v,"Choose a cover entity in the General tab"),"mdi:blinds")}
        </div>
      `;const p=e.states[c],h=p.attributes||{},u="number"==typeof h.supported_features?h.supported_features:0,g=!!(4&u),y=!!(8&u),_=!!(176&u),w=void 0!==h.current_position?Number(h.current_position):void 0,b=void 0!==h.current_tilt_position?Number(h.current_tilt_position):void 0,m=String(p.state),$=!1!==d.show_title,x=!1!==d.show_icon,k=!1!==d.show_state,f=!1!==d.show_position&&(g||void 0!==w),S=!1!==d.show_position_control&&g,C=!1!==d.show_stop&&y,q=!1!==d.show_tilt&&_,z=!1!==d.show_tilt_control&&_,F=d.layout||"standard",A=d.alignment||"center",O=(null===(s=d.name)||void 0===s?void 0:s.trim())||h.friendly_name||(null===(a=c.split(".").pop())||void 0===a?void 0:a.replace(/_/g," "))||"Cover",D=d.icon||h.icon||"mdi:blinds",T=()=>{e.callService("cover","open_cover",{entity_id:c})},j=()=>{e.callService("cover","close_cover",{entity_id:c})},L=()=>{e.callService("cover","stop_cover",{entity_id:c})},N=t=>{e.callService("cover","set_cover_position",{entity_id:c,position:t})},P=t=>{e.callService("cover","set_cover_tilt_position",{entity_id:c,tilt_position:t})},E="opening"===m||"closing"===m,U=void 0!==w?w:"open"===m?100:0,G=(()=>{switch(m){case"open":return(0,n.kg)("editor.cover.state_open",v,"Open");case"closed":return(0,n.kg)("editor.cover.state_closed",v,"Closed");case"opening":return(0,n.kg)("editor.cover.state_opening",v,"Opening");case"closing":return(0,n.kg)("editor.cover.state_closing",v,"Closing");default:return m}})(),M="left"===A?"uc-cover-align-left":"right"===A?"uc-cover-align-right":"uc-cover-align-center",H="compact"===F?i.qy`
          <div class="uc-cover uc-cover-compact ${M}" style="padding: 12px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            ${x?i.qy`<ha-icon icon="${D}" style="font-size: 28px; color: var(--primary-color);"></ha-icon>`:""}
            <div style="flex: 1; min-width: 0;">
              ${$?i.qy`<div style="font-weight: 600; font-size: 14px;">${O}</div>`:""}
              ${k?i.qy`<div style="font-size: 12px; color: var(--secondary-text-color);">${G}</div>`:""}
              ${f&&(void 0!==w||g)?i.qy`<div style="font-size: 12px;">${U}%</div>`:""}
            </div>
            <div style="display: flex; gap: 6px;">
              <ha-button dense @click=${T} ?disabled=${"open"===m||E}>
                ${(0,n.kg)("editor.cover.open",v,"Open")}
              </ha-button>
              ${C?i.qy`<ha-button dense outlined @click=${L} ?disabled=${!E}>${(0,n.kg)("editor.cover.stop",v,"Stop")}</ha-button>`:""}
              <ha-button dense @click=${j} ?disabled=${"closed"===m||E}>
                ${(0,n.kg)("editor.cover.close",v,"Close")}
              </ha-button>
            </div>
          </div>
        `:"buttons"===F?i.qy`
          <div class="uc-cover uc-cover-buttons ${M}" style="padding: 16px;">
            ${$||x?i.qy`
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; justify-content: ${"left"===A?"flex-start":"right"===A?"flex-end":"center"};">
                    ${x?i.qy`<ha-icon icon="${D}" style="font-size: 24px; color: var(--primary-color);"></ha-icon>`:""}
                    ${$?i.qy`<span style="font-weight: 600;">${O}</span>`:""}
                  </div>
                `:""}
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: ${"left"===A?"flex-start":"right"===A?"flex-end":"center"};">
              <ha-button @click=${T} ?disabled=${"open"===m||E}>
                ${(0,n.kg)("editor.cover.open",v,"Open")}
              </ha-button>
              ${C?i.qy`<ha-button outlined @click=${L} ?disabled=${!E}>${(0,n.kg)("editor.cover.stop",v,"Stop")}</ha-button>`:""}
              <ha-button @click=${j} ?disabled=${"closed"===m||E}>
                ${(0,n.kg)("editor.cover.close",v,"Close")}
              </ha-button>
            </div>
            ${S&&g?i.qy`
                  <div style="margin-top: 12px;">
                    <div style="font-size: 12px; margin-bottom: 4px; color: var(--secondary-text-color);">${(0,n.kg)("editor.cover.position",v,"Position")}</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      .value=${String(U)}
                      @input=${t=>N(Number(t.target.value))}
                      style="width: 100%;"
                    />
                  </div>
                `:""}
            ${z&&_?i.qy`
                  <div style="margin-top: 12px;">
                    <div style="font-size: 12px; margin-bottom: 4px; color: var(--secondary-text-color);">${(0,n.kg)("editor.cover.tilt",v,"Tilt")}</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      .value=${String(null!=b?b:0)}
                      @input=${t=>P(Number(t.target.value))}
                      style="width: 100%;"
                    />
                  </div>
                `:""}
          </div>
        `:i.qy`
        <div class="uc-cover uc-cover-standard ${M}" style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; justify-content: ${"left"===A?"flex-start":"right"===A?"flex-end":"center"};">
            ${x?i.qy`<ha-icon icon="${D}" style="font-size: 28px; color: var(--primary-color);"></ha-icon>`:""}
            <div>
              ${$?i.qy`<div style="font-weight: 600; font-size: 16px;">${O}</div>`:""}
              ${k?i.qy`<div style="font-size: 13px; color: var(--secondary-text-color);">${G}</div>`:""}
            </div>
          </div>
          ${f&&(g||void 0!==w)?i.qy`
                <div style="margin-bottom: 12px;">
                  <div style="height: 8px; background: var(--divider-color); border-radius: 4px; overflow: hidden;">
                    <div
                      style="height: 100%; width: ${U}%; background: var(--primary-color); border-radius: 4px; transition: width 0.2s;"
                    ></div>
                  </div>
                  ${S?i.qy`<div style="font-size: 12px; text-align: center; margin-top: 4px;">${U}%</div>`:""}
                </div>
              `:""}
          <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: ${"left"===A?"flex-start":"right"===A?"flex-end":"center"};">
            <ha-button @click=${T} ?disabled=${"open"===m||E}>
              ${(0,n.kg)("editor.cover.open",v,"Open")}
            </ha-button>
            ${C?i.qy`<ha-button outlined @click=${L} ?disabled=${!E}>${(0,n.kg)("editor.cover.stop",v,"Stop")}</ha-button>`:""}
            <ha-button @click=${j} ?disabled=${"closed"===m||E}>
              ${(0,n.kg)("editor.cover.close",v,"Close")}
            </ha-button>
          </div>
          ${S&&g?i.qy`
                <div style="margin-top: 12px;">
                  <div style="font-size: 12px; margin-bottom: 4px; color: var(--secondary-text-color);">${(0,n.kg)("editor.cover.position",v,"Position")}</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    .value=${String(U)}
                    @input=${t=>N(Number(t.target.value))}
                    style="width: 100%;"
                  />
                </div>
              `:""}
          ${q&&_?i.qy`
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color);">
                  <div style="font-size: 12px; margin-bottom: 6px; color: var(--secondary-text-color);">${(0,n.kg)("editor.cover.tilt",v,"Tilt")}</div>
                  ${z?i.qy`
                        <input
                          type="range"
                          min="0"
                          max="100"
                          .value=${String(null!=b?b:0)}
                          @input=${t=>P(Number(t.target.value))}
                          style="width: 100%;"
                        />
                      `:i.qy`
                        <div style="display: flex; gap: 8px;">
                          <ha-button dense outlined @click=${()=>{e.callService("cover","open_cover_tilt",{entity_id:c})}}>${(0,n.kg)("editor.cover.open",v,"Open")}</ha-button>
                          <ha-button dense outlined @click=${()=>{e.callService("cover","close_cover_tilt",{entity_id:c})}}>${(0,n.kg)("editor.cover.close",v,"Close")}</ha-button>
                        </div>
                      `}
                </div>
              `:""}
        </div>
      `,I=this.buildDesignStyles(t,e),W=Object.entries(I).filter((([,t])=>null!=t&&""!==t)).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${e}`)).join("; "),B=this.getHoverEffectClass(t);return i.qy`
      <div class="uc-cover-wrapper ${B}" style="background: var(--card-background-color); border-radius: 12px; overflow: hidden; ${W}">
        ${this.wrapWithAnimation(H,t,e)}
      </div>
    `}getStyles(){return'\n      .uc-cover-wrapper { box-sizing: border-box; }\n      .uc-cover-align-left { text-align: left; }\n      .uc-cover-align-center { text-align: center; }\n      .uc-cover-align-right { text-align: right; }\n      .uc-cover input[type="range"] {\n        -webkit-appearance: none;\n        appearance: none;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n      }\n      .uc-cover input[type="range"]::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        width: 18px;\n        height: 18px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n      }\n      .uc-cover input[type="range"]::-moz-range-thumb {\n        width: 18px;\n        height: 18px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n      }\n    '}}}}]);