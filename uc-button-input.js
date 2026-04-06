"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6424],{719:(t,e,n)=>{n.r(e),n.d(e,{UltraButtonInputModule:()=>d});var i=n(5183),o=n(6478),r=n(7475),l=n(5147),a=n(8938),s=n(5262);n(7921);class d extends r.m{constructor(){super(...arguments),this._rippleTimers=new Map,this.metadata={type:"button_input",title:"Button Input",description:"Press button linked to input_button helpers",author:"WJD Designs",version:"1.0.0",icon:"mdi:gesture-tap-button",category:"input",tags:["button","press","input","form","helper","interactive","trigger"]}}createDefault(t,e){return{id:t||this.generateId("button_input"),type:"button_input",button_label:"",button_icon:"",button_style:"filled",font_size:14,text_color:"#ffffff",button_color:"var(--primary-color)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getButtonStyleOptions(t){return[{value:"filled",label:(0,o.kg)("editor.button_input.style_options.filled",t,"Filled")},{value:"outlined",label:(0,o.kg)("editor.button_input.style_options.outlined",t,"Outlined")},{value:"text",label:(0,o.kg)("editor.button_input.style_options.text",t,"Text Only")}]}renderGeneralTab(t,e,n,r){var l,a;const s=t,d=(null===(l=null==e?void 0:e.locale)||void 0===l?void 0:l.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,o.kg)("editor.button_input.entity.title",d,"Entity Configuration"),(0,o.kg)("editor.button_input.entity.desc",d,"Link to a Home Assistant input_button helper entity."),[{title:(0,o.kg)("editor.button_input.entity_field",d,"Entity"),description:(0,o.kg)("editor.button_input.entity_field_desc",d,"Select an input_button entity to trigger on press."),hass:e,data:{entity:s.entity||""},schema:[this.entityField("entity",["input_button"])],onChange:t=>r(t.detail.value)}])}

        <div class="settings-section">
          <div class="section-title">${(0,o.kg)("editor.button_input.appearance.title",d,"Appearance")}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${(0,o.kg)("editor.button_input.appearance.desc",d,"Configure the button label, icon, and style.")}
          </div>

          ${this.renderFieldSection((0,o.kg)("editor.button_input.button_label",d,"Button Label"),(0,o.kg)("editor.button_input.button_label_desc",d,"Text displayed on the button (uses entity name if empty)"),e,{button_label:s.button_label||""},[{name:"button_label",selector:{text:{}}}],(t=>r(t.detail.value)))}
          ${this.renderFieldSection((0,o.kg)("editor.button_input.button_icon",d,"Icon"),(0,o.kg)("editor.button_input.button_icon_desc",d,"Icon displayed on the button"),e,{button_icon:s.button_icon||""},[{name:"button_icon",selector:{icon:{}}}],(t=>{r(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection((0,o.kg)("editor.button_input.button_style",d,"Button Style"),(0,o.kg)("editor.button_input.button_style_desc",d,"Visual style of the button"),e,{button_style:s.button_style||"filled"},[this.selectField("button_style",this.getButtonStyleOptions(d))],(t=>{r(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>
        </div>

        <div class="settings-section">
          <div class="section-title">${(0,o.kg)("editor.button_input.styling.title",d,"Styling")}</div>
          ${this.renderSliderField((0,o.kg)("editor.button_input.font_size",d,"Font Size"),(0,o.kg)("editor.button_input.font_size_desc",d,"Font size in pixels"),null!==(a=s.font_size)&&void 0!==a?a:14,14,10,24,1,(t=>r({font_size:t})),"px")}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,o.kg)("editor.button_input.button_color",d,"Button Color")}
              .value=${s.button_color||"var(--primary-color)"}
              @color-changed=${t=>{r({button_color:t.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,o.kg)("editor.button_input.text_color",d,"Text Color")}
              .value=${s.text_color||"#ffffff"}
              @color-changed=${t=>r({text_color:t.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(t,e,n,i){return l.A.render(t,e,(t=>i(t)))}renderOtherTab(t,e,n,i){return a.X.render(t,e,(t=>i(t)))}getStyles(){return r.m.getSliderStyles()}renderPreview(t,e,n){var o,r,l,a;const d=t;if(!(null===(o=d.entity)||void 0===o?void 0:o.trim()))return this.renderGradientErrorState("Configure Entity","Select an input_button entity in the General tab","mdi:gesture-tap-button");const u=null===(r=null==e?void 0:e.states)||void 0===r?void 0:r[d.entity];if(!u)return this.renderGradientErrorState("Entity Not Found",`Entity "${d.entity}" is not available`,"mdi:alert-circle-outline");const p=d.design||{},c=null!==(l=d.font_size)&&void 0!==l?l:14,b=d.text_color||"#ffffff",_=d.button_color||"var(--primary-color)",g=d.button_style||"filled",y=d.button_label||(null===(a=u.attributes)||void 0===a?void 0:a.friendly_name)||"Press",h=d.button_icon||"",f=this._buildContainerStyles(p),v=s.k.getHoverEffectClass(p.hover_effect),m=d.id;let x,$,k;return"outlined"===g?(x="transparent",$=`2px solid ${_}`,k=_):"text"===g?(x="transparent",$="none",k=_):(x=_,$="none",k=b),i.qy`
      <style>
        .btn-input-${m} {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:12px 24px; border-radius:8px; cursor:pointer; font-size:${c}px;
          font-family:inherit; font-weight:500; transition:all .2s; position:relative;
          overflow:hidden; background:${x}; border:${$}; color:${k};
          width:100%; box-sizing:border-box; --mdc-icon-size:${Math.min(24,c+4)}px;
        }
        .btn-input-${m}:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.15); }
        .btn-input-${m}:active { transform:translateY(0); opacity:.8; }
        .btn-input-${m} .ripple {
          position:absolute; border-radius:50%; background:rgba(255,255,255,.4);
          transform:scale(0); animation:btn-ripple-${m} .5s ease-out; pointer-events:none;
        }
        @keyframes btn-ripple-${m} { to { transform:scale(4); opacity:0; } }
      </style>
      <div class="${v}" style=${this._css(f)}>
        <button class="btn-input-${m}" @click=${t=>{d.entity&&e&&e.callService("input_button","press",{entity_id:d.entity});const n=t.currentTarget,i=n.getBoundingClientRect(),o=t,r=document.createElement("span");r.className="ripple";const l=Math.max(i.width,i.height);r.style.cssText=`width:${l}px;height:${l}px;left:${o.clientX-i.left-l/2}px;top:${o.clientY-i.top-l/2}px;`,n.appendChild(r);const a=setTimeout((()=>r.remove()),500);this._rippleTimers.set(m,a)}}>
          ${h?i.qy`<ha-icon icon="${h}"></ha-icon>`:""}
          <span>${y}</span>
        </button>
      </div>
    `}_buildContainerStyles(t){return{width:"100%",height:"auto",padding:t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${t.padding_top||"0px"} ${t.padding_right||"0px"} ${t.padding_bottom||"0px"} ${t.padding_left||"0px"}`:"0",margin:t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${t.margin_top||"8px"} ${t.margin_right||"0px"} ${t.margin_bottom||"8px"} ${t.margin_left||"0px"}`:"8px 0",background:t.background_color||"transparent","border-radius":t.border_radius||"0",border:t.border_style&&"none"!==t.border_style?`${t.border_width||"1px"} ${t.border_style} ${t.border_color||"var(--divider-color)"}`:"none","box-sizing":"border-box"}}_css(t){return Object.entries(t).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}:${e}`)).join(";")}}}}]);