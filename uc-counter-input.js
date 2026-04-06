"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[3242],{9959:(t,e,n)=>{n.r(e),n.d(e,{UltraCounterInputModule:()=>s});var i=n(5183),o=n(6478),r=n(7475),l=n(5147),a=n(8938),c=n(5262);n(7921);class s extends r.m{constructor(){super(...arguments),this.metadata={type:"counter_input",title:"Counter Input",description:"Counter with increment, decrement, and reset linked to counter helpers",author:"WJD Designs",version:"1.0.0",icon:"mdi:counter",category:"input",tags:["counter","increment","decrement","input","form","helper","interactive"]}}createDefault(t,e){return{id:t||this.generateId("counter_input"),type:"counter_input",show_label:!0,label:"",show_reset:!0,counter_style:"inline",font_size:24,text_color:"var(--primary-text-color)",button_color:"var(--primary-color)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getCounterStyleOptions(t){return[{value:"inline",label:(0,o.kg)("editor.counter_input.style_options.inline",t,"Inline (- value +)")},{value:"stacked",label:(0,o.kg)("editor.counter_input.style_options.stacked",t,"Stacked (buttons below)")},{value:"compact",label:(0,o.kg)("editor.counter_input.style_options.compact",t,"Compact (small)")}]}renderGeneralTab(t,e,n,r){var l,a;const c=t,s=(null===(l=null==e?void 0:e.locale)||void 0===l?void 0:l.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,o.kg)("editor.counter_input.entity.title",s,"Entity Configuration"),(0,o.kg)("editor.counter_input.entity.desc",s,"Link to a Home Assistant counter helper entity."),[{title:(0,o.kg)("editor.counter_input.entity_field",s,"Entity"),description:(0,o.kg)("editor.counter_input.entity_field_desc",s,"Select a counter entity to control."),hass:e,data:{entity:c.entity||""},schema:[this.entityField("entity",["counter"])],onChange:t=>r(t.detail.value)}])}

        <div class="settings-section">
          <div class="section-title">${(0,o.kg)("editor.counter_input.appearance.title",s,"Appearance")}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${(0,o.kg)("editor.counter_input.appearance.desc",s,"Configure layout and display options.")}
          </div>

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection((0,o.kg)("editor.counter_input.counter_style",s,"Layout Style"),(0,o.kg)("editor.counter_input.counter_style_desc",s,"How the counter and buttons are arranged"),e,{counter_style:c.counter_style||"inline"},[this.selectField("counter_style",this.getCounterStyleOptions(s))],(t=>{r(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>

          ${this.renderFieldSection((0,o.kg)("editor.counter_input.label",s,"Label"),(0,o.kg)("editor.counter_input.label_desc",s,"Label displayed above the counter"),e,{label:c.label||""},[{name:"label",selector:{text:{}}}],(t=>r(t.detail.value)))}
          ${this.renderFieldSection((0,o.kg)("editor.counter_input.show_label",s,"Show Label"),(0,o.kg)("editor.counter_input.show_label_desc",s,"Display the label"),e,{show_label:!1!==c.show_label},[{name:"show_label",selector:{boolean:{}}}],(t=>{r(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          ${this.renderFieldSection((0,o.kg)("editor.counter_input.show_reset",s,"Show Reset Button"),(0,o.kg)("editor.counter_input.show_reset_desc",s,"Display a reset button"),e,{show_reset:!1!==c.show_reset},[{name:"show_reset",selector:{boolean:{}}}],(t=>{r(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <div class="settings-section">
          <div class="section-title">${(0,o.kg)("editor.counter_input.styling.title",s,"Styling")}</div>
          ${this.renderSliderField((0,o.kg)("editor.counter_input.font_size",s,"Value Font Size"),(0,o.kg)("editor.counter_input.font_size_desc",s,"Font size of the counter value"),null!==(a=c.font_size)&&void 0!==a?a:24,24,14,48,1,(t=>r({font_size:t})),"px")}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,o.kg)("editor.counter_input.button_color",s,"Button Color")}
              .value=${c.button_color||"var(--primary-color)"}
              @color-changed=${t=>{r({button_color:t.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,o.kg)("editor.counter_input.text_color",s,"Text Color")}
              .value=${c.text_color||"var(--primary-text-color)"}
              @color-changed=${t=>r({text_color:t.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(t,e,n,i){return l.A.render(t,e,(t=>i(t)))}renderOtherTab(t,e,n,i){return a.X.render(t,e,(t=>i(t)))}getStyles(){return r.m.getSliderStyles()}renderPreview(t,e,n){var o,r,l,a,s;const d=t;if(!(null===(o=d.entity)||void 0===o?void 0:o.trim()))return this.renderGradientErrorState("Configure Entity","Select a counter entity in the General tab","mdi:counter");const u=null===(r=null==e?void 0:e.states)||void 0===r?void 0:r[d.entity];if(!u)return this.renderGradientErrorState("Entity Not Found",`Entity "${d.entity}" is not available`,"mdi:alert-circle-outline");const p=parseInt(u.state,10)||0,_=null!==(a=null===(l=u.attributes)||void 0===l?void 0:l.step)&&void 0!==a?a:1,g=d.design||{},b=null!==(s=d.font_size)&&void 0!==s?s:24,y=d.text_color||"var(--primary-text-color)",v=d.button_color||"var(--primary-color)",h=d.counter_style||"inline",m=!1!==d.show_label&&!!d.label,$=!1!==d.show_reset,x=this._buildContainerStyles(g),f=c.k.getHoverEffectClass(g.hover_effect),k=d.id,w=()=>{d.entity&&e&&e.callService("counter","increment",{entity_id:d.entity})},S=()=>{d.entity&&e&&e.callService("counter","decrement",{entity_id:d.entity})},C=()=>{d.entity&&e&&e.callService("counter","reset",{entity_id:d.entity})},z="compact"===h?32:44,F="compact"===h?18:22;return i.qy`
      <style>
        .cnt-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:8px; padding-left:2px; }
        .cnt-btn-${k} {
          display:flex; align-items:center; justify-content:center; width:${z}px; height:${z}px;
          border-radius:50%; border:none; cursor:pointer; background:${v}; color:#fff;
          transition:all .15s; --mdc-icon-size:${F}px; flex-shrink:0;
        }
        .cnt-btn-${k}:hover { opacity:.85; transform:scale(1.05); }
        .cnt-btn-${k}:active { transform:scale(.95); }
        .cnt-btn-${k}.reset { background:transparent; color:var(--secondary-text-color); border:1px solid var(--divider-color); }
        .cnt-btn-${k}.reset:hover { color:${v}; border-color:${v}; }
        .cnt-value-${k} { font-size:${b}px; font-weight:700; color:${y}; font-variant-numeric:tabular-nums;
          min-width:${2*b}px; text-align:center; line-height:1; }
        .cnt-step { font-size:11px; color:var(--secondary-text-color); opacity:.6; }
        .cnt-inline-${k} { display:flex; align-items:center; justify-content:center; gap:${"compact"===h?"12px":"20px"}; }
        .cnt-stacked-${k} { display:flex; flex-direction:column; align-items:center; gap:12px; }
        .cnt-stacked-btns { display:flex; align-items:center; gap:12px; }
      </style>
      <div class="${f}" style=${this._css(x)}>
        ${m?i.qy`<div class="cnt-label">${d.label}</div>`:""}
        ${"stacked"===h?i.qy`
          <div class="cnt-stacked-${k}">
            <div class="cnt-value-${k}">${p}</div>
            <div class="cnt-stacked-btns">
              <button class="cnt-btn-${k}" @click=${S}><ha-icon icon="mdi:minus"></ha-icon></button>
              ${$?i.qy`<button class="cnt-btn-${k} reset" @click=${C}><ha-icon icon="mdi:refresh"></ha-icon></button>`:""}
              <button class="cnt-btn-${k}" @click=${w}><ha-icon icon="mdi:plus"></ha-icon></button>
            </div>
          </div>
        `:i.qy`
          <div class="cnt-inline-${k}">
            <button class="cnt-btn-${k}" @click=${S}><ha-icon icon="mdi:minus"></ha-icon></button>
            <div style="display:flex;flex-direction:column;align-items:center;">
              <span class="cnt-value-${k}">${p}</span>
              ${1!==_?i.qy`<span class="cnt-step">step: ${_}</span>`:""}
            </div>
            <button class="cnt-btn-${k}" @click=${w}><ha-icon icon="mdi:plus"></ha-icon></button>
            ${$?i.qy`<button class="cnt-btn-${k} reset" @click=${C}><ha-icon icon="mdi:refresh"></ha-icon></button>`:""}
          </div>
        `}
      </div>
    `}_buildContainerStyles(t){return{width:"100%",height:"auto",padding:t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${t.padding_top||"0px"} ${t.padding_right||"0px"} ${t.padding_bottom||"0px"} ${t.padding_left||"0px"}`:"4px 0",margin:t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${t.margin_top||"8px"} ${t.margin_right||"0px"} ${t.margin_bottom||"8px"} ${t.margin_left||"0px"}`:"8px 0",background:t.background_color||"transparent","border-radius":t.border_radius||"0",border:t.border_style&&"none"!==t.border_style?`${t.border_width||"1px"} ${t.border_style} ${t.border_color||"var(--divider-color)"}`:"none","box-sizing":"border-box"}}_css(t){return Object.entries(t).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}:${e}`)).join(";")}}}}]);