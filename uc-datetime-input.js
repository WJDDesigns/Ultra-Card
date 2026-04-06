"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6319],{1244:(e,t,i)=>{i.r(t),i.d(t,{UltraDatetimeInputModule:()=>s});var a=i(5183),o=i(6478),n=i(7475),r=i(5147),d=i(8938),l=i(5262);i(7921);class s extends n.m{constructor(){super(...arguments),this.metadata={type:"datetime_input",title:"Date/Time Input",description:"Date and time picker linked to input_datetime helpers",author:"WJD Designs",version:"1.0.0",icon:"mdi:calendar-clock",category:"input",tags:["date","time","datetime","input","form","helper","interactive","calendar"]}}createDefault(e,t){return{id:e||this.generateId("datetime_input"),type:"datetime_input",display_mode_datetime:"auto",show_label:!0,label:"",font_size:16,text_color:"var(--primary-text-color)",focus_color:"var(--primary-color)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getDisplayModeOptions(e){return[{value:"auto",label:(0,o.kg)("editor.datetime_input.display_mode_options.auto",e,"Auto (from entity)")},{value:"date",label:(0,o.kg)("editor.datetime_input.display_mode_options.date",e,"Date Only")},{value:"time",label:(0,o.kg)("editor.datetime_input.display_mode_options.time",e,"Time Only")},{value:"datetime",label:(0,o.kg)("editor.datetime_input.display_mode_options.datetime",e,"Date & Time")}]}resolveDisplayMode(e,t){var i,a;const o=e.display_mode_datetime||"auto";if("auto"===o&&t)return{showDate:!1!==(null===(i=t.attributes)||void 0===i?void 0:i.has_date),showTime:!1!==(null===(a=t.attributes)||void 0===a?void 0:a.has_time)};switch(o){case"date":return{showDate:!0,showTime:!1};case"time":return{showDate:!1,showTime:!0};default:return{showDate:!0,showTime:!0}}}renderGeneralTab(e,t,i,n){var r,d,l;const s=e,c=(null===(r=null==t?void 0:t.locale)||void 0===r?void 0:r.language)||"en";return s.entity&&(null===(d=null==t?void 0:t.states)||void 0===d||d[s.entity]),a.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity Configuration -->
        ${this.renderSettingsSection((0,o.kg)("editor.datetime_input.entity.title",c,"Entity Configuration"),(0,o.kg)("editor.datetime_input.entity.desc",c,"Link to a Home Assistant input_datetime helper entity."),[{title:(0,o.kg)("editor.datetime_input.entity_field",c,"Entity"),description:(0,o.kg)("editor.datetime_input.entity_field_desc",c,"Select an input_datetime entity to bind this picker to."),hass:t,data:{entity:s.entity||""},schema:[this.entityField("entity",["input_datetime"])],onChange:e=>{n(e.detail.value)}}])}

        <!-- Display Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,o.kg)("editor.datetime_input.display.title",c,"Display Configuration")}
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,o.kg)("editor.datetime_input.display.desc",c,"Configure which pickers to show and how they appear.")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,o.kg)("editor.datetime_input.display_mode_datetime",c,"Display Mode"),(0,o.kg)("editor.datetime_input.display_mode_datetime_desc",c,"Which pickers to show. Auto detects from the entity."),t,{display_mode_datetime:s.display_mode_datetime||"auto"},[this.selectField("display_mode_datetime",this.getDisplayModeOptions(c))],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>

          ${this.renderFieldSection((0,o.kg)("editor.datetime_input.label",c,"Label"),(0,o.kg)("editor.datetime_input.label_desc",c,"Label displayed above the picker fields"),t,{label:s.label||""},[{name:"label",selector:{text:{}}}],(e=>n(e.detail.value)))}

          ${this.renderFieldSection((0,o.kg)("editor.datetime_input.show_label",c,"Show Label"),(0,o.kg)("editor.datetime_input.show_label_desc",c,"Display the label above the pickers"),t,{show_label:!1!==s.show_label},[{name:"show_label",selector:{boolean:{}}}],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <!-- Styling -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,o.kg)("editor.datetime_input.styling.title",c,"Styling")}
          </div>

          ${this.renderSliderField((0,o.kg)("editor.datetime_input.font_size",c,"Font Size"),(0,o.kg)("editor.datetime_input.font_size_desc",c,"Font size of the date/time inputs in pixels"),null!==(l=s.font_size)&&void 0!==l?l:16,16,10,32,1,(e=>n({font_size:e})),"px")}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,o.kg)("editor.datetime_input.text_color",c,"Text Color")}
              .value=${s.text_color||"var(--primary-text-color)"}
              @color-changed=${e=>{n({text_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,o.kg)("editor.datetime_input.focus_color",c,"Focus/Accent Color")}
              .value=${s.focus_color||"var(--primary-color)"}
              @color-changed=${e=>{n({focus_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(e,t,i,a){return r.A.render(e,t,(e=>a(e)))}renderOtherTab(e,t,i,a){return d.X.render(e,t,(e=>a(e)))}getStyles(){return`\n      ${n.m.getSliderStyles()}\n    `}renderPreview(e,t,i,n){var r,d,s,c;const p=e;if(!p.entity||!p.entity.trim())return this.renderGradientErrorState("Configure Entity","Select an input_datetime entity in the General tab","mdi:calendar-clock");const u=null===(r=null==t?void 0:t.states)||void 0===r?void 0:r[p.entity];if(!u)return this.renderGradientErrorState("Entity Not Found",`Entity "${p.entity}" is not available`,"mdi:alert-circle-outline");const{showDate:m,showTime:_}=this.resolveDisplayMode(p,u),g=this.getDateValue(u),h=this.getTimeValue(u),v=p.design||{},y=null!==(d=p.font_size)&&void 0!==d?d:16,b=p.text_color||"var(--primary-text-color)",f=p.focus_color||"var(--primary-color)",x=!1!==p.show_label&&!!p.label,$=p.label||"",k={width:"100%",height:"auto",padding:v.padding_top||v.padding_bottom||v.padding_left||v.padding_right?`${v.padding_top||"0px"} ${v.padding_right||"0px"} ${v.padding_bottom||"0px"} ${v.padding_left||"0px"}`:"0",margin:v.margin_top||v.margin_bottom||v.margin_left||v.margin_right?`${v.margin_top||"8px"} ${v.margin_right||"0px"} ${v.margin_bottom||"8px"} ${v.margin_left||"0px"}`:"8px 0",background:v.background_color||"transparent",backgroundImage:this.getBackgroundImageCss(Object.assign(Object.assign({},p),v),t),"background-size":"cover","background-position":"center","background-repeat":"no-repeat","border-radius":v.border_radius||"0",border:v.border_style&&"none"!==v.border_style?`${v.border_width||"1px"} ${v.border_style} ${v.border_color||"var(--divider-color)"}`:"none","box-shadow":v.box_shadow_h||v.box_shadow_v||v.box_shadow_blur||v.box_shadow_spread?`${v.box_shadow_h||"0px"} ${v.box_shadow_v||"0px"} ${v.box_shadow_blur||"0px"} ${v.box_shadow_spread||"0px"} ${v.box_shadow_color||"rgba(0,0,0,.2)"}`:"none","box-sizing":"border-box"},w=v.hover_effect,S=l.k.getHoverEffectClass(w),D=e=>{const t=e.currentTarget.querySelector("input");if(t&&"function"==typeof t.showPicker)try{t.showPicker()}catch(e){}},T=p.id;return a.qy`
      <style>
        .datetime-input-wrapper-${T} {
          display: flex;
          gap: 12px;
          align-items: stretch;
          flex-wrap: wrap;
        }
        .datetime-input-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-bottom: 6px;
          padding-left: 2px;
        }
        .datetime-input-sublabel {
          font-size: 11px;
          color: var(--secondary-text-color);
          opacity: 0.6;
          flex-shrink: 0;
          min-width: 35px;
          align-self: center;
        }
        .datetime-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .datetime-picker-field-${T} {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden;
        }
        .datetime-picker-field-${T}:focus-within {
          border-color: ${f};
          box-shadow: 0 0 0 1px ${f};
        }
        .datetime-picker-field-${T}:hover {
          border-color: ${f};
        }
        .datetime-picker-field-${T} input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          padding: 10px 12px;
          font-size: ${y}px;
          color: ${b};
          font-family: inherit;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
        }
        .datetime-picker-field-${T} input::-webkit-calendar-picker-indicator {
          display: none;
        }
        .datetime-picker-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          color: var(--secondary-text-color);
          opacity: 0.7;
          flex-shrink: 0;
          --mdc-icon-size: 20px;
          pointer-events: none;
        }
      </style>
      <div
        class="datetime-input-module-container ${S}"
        style=${this.styleObjectToCss(k)}
      >
        ${x?a.qy`<div class="datetime-input-label">${$}</div>`:""}
        <div class="datetime-input-wrapper-${T}">
          ${m?a.qy`
                <div class="datetime-input-row">
                  ${m&&_?a.qy`<span class="datetime-input-sublabel">${(0,o.kg)("editor.datetime_input.date_label",(null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)||"en","Date")}</span>`:""}
                  <div class="datetime-picker-field-${T}" @click=${D}>
                    <span class="datetime-picker-icon">
                      <ha-icon icon="mdi:calendar"></ha-icon>
                    </span>
                    <input
                      type="date"
                      .value=${g}
                      @change=${e=>{const i=e.target;i.value&&this.setEntityDatetime(p.entity,i.value,void 0,u,t)}}
                    />
                  </div>
                </div>
              `:""}
          ${_?a.qy`
                <div class="datetime-input-row">
                  ${m&&_?a.qy`<span class="datetime-input-sublabel">${(0,o.kg)("editor.datetime_input.time_label",(null===(c=null==t?void 0:t.locale)||void 0===c?void 0:c.language)||"en","Time")}</span>`:""}
                  <div class="datetime-picker-field-${T}" @click=${D}>
                    <span class="datetime-picker-icon">
                      <ha-icon icon="mdi:clock-outline"></ha-icon>
                    </span>
                    <input
                      type="time"
                      .value=${h}
                      @change=${e=>{const i=e.target;i.value&&this.setEntityDatetime(p.entity,void 0,i.value,u,t)}}
                    />
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}getDateValue(e){if(!e)return"";const t=e.attributes;if((null==t?void 0:t.year)&&(null==t?void 0:t.month)&&(null==t?void 0:t.day))return`${String(t.year).padStart(4,"0")}-${String(t.month).padStart(2,"0")}-${String(t.day).padStart(2,"0")}`;const i=e.state;if(i&&i.includes("-")){const e=i.split(" ")[0]||i.split("T")[0]||i;if(/^\d{4}-\d{2}-\d{2}/.test(e))return e.substring(0,10)}return""}getTimeValue(e){if(!e)return"";const t=e.attributes;if(void 0!==(null==t?void 0:t.hour)&&void 0!==(null==t?void 0:t.minute))return`${String(t.hour).padStart(2,"0")}:${String(t.minute).padStart(2,"0")}:${void 0!==t.second?String(t.second).padStart(2,"0"):"00"}`;const i=e.state;if(i){const e=i.includes(" ")?i.split(" ")[1]:i.includes("T")?i.split("T")[1]:/^\d{2}:\d{2}/.test(i)?i:"";if(e&&/^\d{2}:\d{2}/.test(e))return e.substring(0,8)}return""}async setEntityDatetime(e,t,i,a,o){var n,r;if(!e||!o)return;const d=!1!==(null===(n=null==a?void 0:a.attributes)||void 0===n?void 0:n.has_date),l=!1!==(null===(r=null==a?void 0:a.attributes)||void 0===r?void 0:r.has_time),s={entity_id:e};if(d&&l){const e=t||this.getDateValue(a),o=i||this.getTimeValue(a);e&&o?s.datetime=`${e} ${o}`:e?s.date=e:o&&(s.time=o)}else if(d&&t)s.date=t;else{if(!l||!i)return;s.time=i}try{await o.callService("input_datetime","set_datetime",s)}catch(t){console.error(`[DatetimeInput] Failed to set datetime for ${e}:`,t)}}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${t}`)).join("; ")}}}}]);