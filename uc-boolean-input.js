"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5790],{8927:(t,e,o)=>{o.r(e),o.d(e,{UltraBooleanInputModule:()=>d});var i=o(5183),l=o(6478),n=o(7475),a=o(5147),r=o(8938),s=o(5262);o(7921);class d extends n.m{constructor(){super(...arguments),this.metadata={type:"boolean_input",title:"Boolean Input",description:"Toggle switch linked to input_boolean and switch entities",author:"WJD Designs",version:"1.0.0",icon:"mdi:toggle-switch-outline",category:"input",tags:["boolean","toggle","switch","input","form","helper","interactive"]}}createDefault(t,e){return{id:t||this.generateId("boolean_input"),type:"boolean_input",toggle_style:"switch",show_label:!0,label:"",show_state_text:!0,on_text:"",off_text:"",font_size:14,text_color:"var(--primary-text-color)",on_color:"var(--primary-color)",off_color:"var(--disabled-color, #bdbdbd)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getToggleStyleOptions(t){return[{value:"switch",label:(0,l.kg)("editor.boolean_input.style_options.switch",t,"Switch")},{value:"checkbox",label:(0,l.kg)("editor.boolean_input.style_options.checkbox",t,"Checkbox")},{value:"pill",label:(0,l.kg)("editor.boolean_input.style_options.pill",t,"Pill Toggle")}]}renderGeneralTab(t,e,o,n){var a,r;const s=t,d=(null===(a=null==e?void 0:e.locale)||void 0===a?void 0:a.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,l.kg)("editor.boolean_input.entity.title",d,"Entity Configuration"),(0,l.kg)("editor.boolean_input.entity.desc",d,"Link to a Home Assistant input_boolean or switch entity."),[{title:(0,l.kg)("editor.boolean_input.entity_field",d,"Entity"),description:(0,l.kg)("editor.boolean_input.entity_field_desc",d,"Select an input_boolean or switch entity."),hass:e,data:{entity:s.entity||""},schema:[this.entityField("entity",["input_boolean","switch"])],onChange:t=>n(t.detail.value)}])}

        <div class="settings-section">
          <div class="section-title">${(0,l.kg)("editor.boolean_input.appearance.title",d,"Appearance")}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${(0,l.kg)("editor.boolean_input.appearance.desc",d,"Configure the toggle style and labels.")}
          </div>

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection((0,l.kg)("editor.boolean_input.toggle_style",d,"Toggle Style"),(0,l.kg)("editor.boolean_input.toggle_style_desc",d,"Visual style of the toggle"),e,{toggle_style:s.toggle_style||"switch"},[this.selectField("toggle_style",this.getToggleStyleOptions(d))],(t=>{n(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>

          ${this.renderFieldSection((0,l.kg)("editor.boolean_input.label",d,"Label"),(0,l.kg)("editor.boolean_input.label_desc",d,"Label displayed beside the toggle"),e,{label:s.label||""},[{name:"label",selector:{text:{}}}],(t=>n(t.detail.value)))}
          ${this.renderFieldSection((0,l.kg)("editor.boolean_input.show_label",d,"Show Label"),(0,l.kg)("editor.boolean_input.show_label_desc",d,"Display the label"),e,{show_label:!1!==s.show_label},[{name:"show_label",selector:{boolean:{}}}],(t=>{n(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          ${this.renderFieldSection((0,l.kg)("editor.boolean_input.show_state_text",d,"Show State Text"),(0,l.kg)("editor.boolean_input.show_state_text_desc",d,"Display On/Off text beside the toggle"),e,{show_state_text:!1!==s.show_state_text},[{name:"show_state_text",selector:{boolean:{}}}],(t=>{n(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          ${!1!==s.show_state_text?i.qy`
            ${this.renderFieldSection((0,l.kg)("editor.boolean_input.on_text",d,"On Text"),(0,l.kg)("editor.boolean_input.on_text_desc",d,"Custom text for the On state (default: On)"),e,{on_text:s.on_text||""},[{name:"on_text",selector:{text:{}}}],(t=>n(t.detail.value)))}
            ${this.renderFieldSection((0,l.kg)("editor.boolean_input.off_text",d,"Off Text"),(0,l.kg)("editor.boolean_input.off_text_desc",d,"Custom text for the Off state (default: Off)"),e,{off_text:s.off_text||""},[{name:"off_text",selector:{text:{}}}],(t=>n(t.detail.value)))}
          `:""}
        </div>

        <div class="settings-section">
          <div class="section-title">${(0,l.kg)("editor.boolean_input.styling.title",d,"Styling")}</div>
          ${this.renderSliderField((0,l.kg)("editor.boolean_input.font_size",d,"Font Size"),(0,l.kg)("editor.boolean_input.font_size_desc",d,"Font size in pixels"),null!==(r=s.font_size)&&void 0!==r?r:14,14,10,24,1,(t=>n({font_size:t})),"px")}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,l.kg)("editor.boolean_input.on_color",d,"On Color")}
              .value=${s.on_color||"var(--primary-color)"}
              @color-changed=${t=>{n({on_color:t.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,l.kg)("editor.boolean_input.off_color",d,"Off Color")}
              .value=${s.off_color||"var(--disabled-color, #bdbdbd)"}
              @color-changed=${t=>{n({off_color:t.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,l.kg)("editor.boolean_input.text_color",d,"Text Color")}
              .value=${s.text_color||"var(--primary-text-color)"}
              @color-changed=${t=>n({text_color:t.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(t,e,o,i){return a.A.render(t,e,(t=>i(t)))}renderOtherTab(t,e,o,i){return r.X.render(t,e,(t=>i(t)))}getStyles(){return n.m.getSliderStyles()}renderPreview(t,e,o){var l,n,a,r,d;const c=t;if(!(null===(l=c.entity)||void 0===l?void 0:l.trim()))return this.renderGradientErrorState("Configure Entity","Select an input_boolean entity in the General tab","mdi:toggle-switch-outline");const p=null===(n=null==e?void 0:e.states)||void 0===n?void 0:n[c.entity];if(!p)return this.renderGradientErrorState("Entity Not Found",`Entity "${c.entity}" is not available`,"mdi:alert-circle-outline");const b="on"===p.state,g=c.design||{},_=null!==(a=c.font_size)&&void 0!==a?a:14,u=c.text_color||"var(--primary-text-color)",x=c.on_color||"var(--primary-color)",h=c.off_color||"var(--disabled-color, #bdbdbd)",v=c.toggle_style||"switch",f=!1!==c.show_label&&!!c.label,y=!1!==c.show_state_text,$=c.on_text||"On",m=c.off_text||"Off",w=this._buildContainerStyles(g),k=s.k.getHoverEffectClass(g.hover_effect),S=c.id,z=()=>{if(!c.entity||!e)return;const t=c.entity.split(".")[0];e.callService(t,"toggle",{entity_id:c.entity})},T=b?x:h;return"checkbox"===v?i.qy`
        <style>
          .bool-cb-row-${S} { display:flex; align-items:center; gap:12px; cursor:pointer; }
          .bool-cb-box-${S} { width:22px; height:22px; border-radius:4px; border:2px solid ${T};
            display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0;
            background:${b?T:"transparent"}; }
          .bool-cb-box-${S} ha-icon { --mdc-icon-size:16px; color:#fff; opacity:${b?"1":"0"}; transition:opacity .2s; }
          .bool-cb-label { font-size:${_}px; color:${u}; }
          .bool-state-text { font-size:${Math.max(11,_-2)}px; color:var(--secondary-text-color); margin-left:auto; }
          .bool-top-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${k}" style=${this._css(w)}>
          ${f?i.qy`<div class="bool-top-label">${c.label}</div>`:""}
          <div class="bool-cb-row-${S}" @click=${z}>
            <div class="bool-cb-box-${S}"><ha-icon icon="mdi:check"></ha-icon></div>
            ${f?i.qy`<span class="bool-cb-label">${(null===(r=p.attributes)||void 0===r?void 0:r.friendly_name)||c.entity}</span>`:""}
            ${y?i.qy`<span class="bool-state-text">${b?$:m}</span>`:""}
          </div>
        </div>
      `:"pill"===v?i.qy`
        <style>
          .bool-pill-row-${S} { display:flex; align-items:center; gap:12px; }
          .bool-pill-${S} { display:flex; border-radius:20px; overflow:hidden; border:1px solid var(--divider-color); }
          .bool-pill-btn-${S} { padding:8px 20px; border:none; cursor:pointer; font-size:${_}px;
            font-family:inherit; transition:all .2s; background:transparent; color:${u}; }
          .bool-pill-btn-${S}.active { background:${T}; color:#fff; font-weight:500; }
          .bool-pill-btn-${S}:not(.active):hover { background:rgba(var(--rgb-primary-text-color,0,0,0),.05); }
          .bool-pill-label { font-size:${_}px; color:${u}; flex:1; }
          .bool-top-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${k}" style=${this._css(w)}>
          ${f?i.qy`<div class="bool-top-label">${c.label}</div>`:""}
          <div class="bool-pill-row-${S}">
            <div class="bool-pill-${S}">
              <button class="bool-pill-btn-${S} ${b?"":"active"}" @click=${()=>{b&&z()}}>${m}</button>
              <button class="bool-pill-btn-${S} ${b?"active":""}" @click=${()=>{b||z()}}>${$}</button>
            </div>
          </div>
        </div>
      `:i.qy`
      <style>
        .bool-sw-row-${S} { display:flex; align-items:center; gap:12px; cursor:pointer; }
        .bool-sw-track-${S} { width:48px; height:26px; border-radius:13px; position:relative;
          background:${T}; transition:background .3s; flex-shrink:0; }
        .bool-sw-thumb-${S} { width:22px; height:22px; border-radius:50%; background:#fff;
          position:absolute; top:2px; left:${b?"24px":"2px"}; transition:left .3s;
          box-shadow:0 1px 3px rgba(0,0,0,.3); }
        .bool-sw-label { font-size:${_}px; color:${u}; flex:1; }
        .bool-state-text { font-size:${Math.max(11,_-2)}px; color:var(--secondary-text-color); }
        .bool-top-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
      </style>
      <div class="${k}" style=${this._css(w)}>
        ${f?i.qy`<div class="bool-top-label">${c.label}</div>`:""}
        <div class="bool-sw-row-${S}" @click=${z}>
          <div class="bool-sw-track-${S}"><div class="bool-sw-thumb-${S}"></div></div>
          ${f?i.qy`<span class="bool-sw-label">${(null===(d=p.attributes)||void 0===d?void 0:d.friendly_name)||c.entity}</span>`:""}
          ${y?i.qy`<span class="bool-state-text">${b?$:m}</span>`:""}
        </div>
      </div>
    `}_buildContainerStyles(t){return{width:"100%",height:"auto",padding:t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${t.padding_top||"0px"} ${t.padding_right||"0px"} ${t.padding_bottom||"0px"} ${t.padding_left||"0px"}`:"0",margin:t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${t.margin_top||"8px"} ${t.margin_right||"0px"} ${t.margin_bottom||"8px"} ${t.margin_left||"0px"}`:"8px 0",background:t.background_color||"transparent","border-radius":t.border_radius||"0",border:t.border_style&&"none"!==t.border_style?`${t.border_width||"1px"} ${t.border_style} ${t.border_color||"var(--divider-color)"}`:"none","box-sizing":"border-box"}}_css(t){return Object.entries(t).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}:${e}`)).join(";")}}}}]);