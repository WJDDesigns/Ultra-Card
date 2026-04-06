"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8863],{908:(e,t,i)=>{i.r(t),i.d(t,{UltraNumberInputModule:()=>d});var n=i(5183),r=i(6478),o=i(7475),l=i(5147),a=i(8938),s=i(5262);i(7921);class d extends o.m{constructor(){super(...arguments),this._debounceTimer=null,this._localValue=null,this._localValueTimer=null,this.metadata={type:"number_input",title:"Number Input",description:"Number input field linked to input_number helpers",author:"WJD Designs",version:"1.0.0",icon:"mdi:numeric",category:"input",tags:["number","input","form","helper","interactive","stepper"]}}createDefault(e,t){return{id:e||this.generateId("number_input"),type:"number_input",input_appearance:"outlined",show_label:!0,label:"",show_stepper:!0,show_unit:!0,font_size:16,text_color:"var(--primary-text-color)",focus_color:"var(--primary-color)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getAppearanceOptions(e){return[{value:"outlined",label:(0,r.kg)("editor.number_input.appearance_options.outlined",e,"Outlined")},{value:"filled",label:(0,r.kg)("editor.number_input.appearance_options.filled",e,"Filled")},{value:"underlined",label:(0,r.kg)("editor.number_input.appearance_options.underlined",e,"Underlined")}]}renderGeneralTab(e,t,i,o){var l,a;const s=e,d=(null===(l=null==t?void 0:t.locale)||void 0===l?void 0:l.language)||"en";return n.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,r.kg)("editor.number_input.entity.title",d,"Entity Configuration"),(0,r.kg)("editor.number_input.entity.desc",d,"Link to a Home Assistant input_number helper entity."),[{title:(0,r.kg)("editor.number_input.entity_field",d,"Entity"),description:(0,r.kg)("editor.number_input.entity_field_desc",d,"Select an input_number entity to bind this field to."),hass:t,data:{entity:s.entity||""},schema:[this.entityField("entity",["input_number","number"])],onChange:e=>o(e.detail.value)}])}

        <div class="settings-section">
          <div class="section-title">
            ${(0,r.kg)("editor.number_input.appearance.title",d,"Appearance")}
          </div>
          <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;">
            ${(0,r.kg)("editor.number_input.appearance.desc",d,"Configure how the number input field looks.")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,r.kg)("editor.number_input.input_appearance",d,"Input Style"),(0,r.kg)("editor.number_input.input_appearance_desc",d,"Visual style of the input field"),t,{input_appearance:s.input_appearance||"outlined"},[this.selectField("input_appearance",this.getAppearanceOptions(d))],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>

          ${this.renderFieldSection((0,r.kg)("editor.number_input.label",d,"Label"),(0,r.kg)("editor.number_input.label_desc",d,"Label displayed above the input field"),t,{label:s.label||""},[{name:"label",selector:{text:{}}}],(e=>o(e.detail.value)))}

          ${this.renderFieldSection((0,r.kg)("editor.number_input.show_label",d,"Show Label"),(0,r.kg)("editor.number_input.show_label_desc",d,"Display the label above the input"),t,{show_label:!1!==s.show_label},[{name:"show_label",selector:{boolean:{}}}],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <div class="settings-section">
          <div class="section-title">
            ${(0,r.kg)("editor.number_input.controls.title",d,"Controls")}
          </div>

          ${this.renderFieldSection((0,r.kg)("editor.number_input.show_stepper",d,"Show +/- Buttons"),(0,r.kg)("editor.number_input.show_stepper_desc",d,"Display increment/decrement stepper buttons"),t,{show_stepper:!1!==s.show_stepper},[{name:"show_stepper",selector:{boolean:{}}}],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,r.kg)("editor.number_input.show_unit",d,"Show Unit"),(0,r.kg)("editor.number_input.show_unit_desc",d,"Display the unit of measurement"),t,{show_unit:!1!==s.show_unit},[{name:"show_unit",selector:{boolean:{}}}],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <div class="settings-section">
          <div class="section-title">${(0,r.kg)("editor.number_input.styling.title",d,"Styling")}</div>

          ${this.renderSliderField((0,r.kg)("editor.number_input.font_size",d,"Font Size"),(0,r.kg)("editor.number_input.font_size_desc",d,"Font size of the input text in pixels"),null!==(a=s.font_size)&&void 0!==a?a:16,16,10,32,1,(e=>o({font_size:e})),"px")}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,r.kg)("editor.number_input.text_color",d,"Text Color")}
              .value=${s.text_color||"var(--primary-text-color)"}
              @color-changed=${e=>o({text_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,r.kg)("editor.number_input.focus_color",d,"Focus/Accent Color")}
              .value=${s.focus_color||"var(--primary-color)"}
              @color-changed=${e=>o({focus_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(e,t,i,n){return l.A.render(e,t,(e=>n(e)))}renderOtherTab(e,t,i,n){return a.X.render(e,t,(e=>n(e)))}getStyles(){return`${o.m.getSliderStyles()}`}renderPreview(e,t,i,r){var o,l,a,d,u,p,c,b,m,_;const g=e;if(!(null===(o=g.entity)||void 0===o?void 0:o.trim()))return this.renderGradientErrorState("Configure Entity","Select an input_number entity in the General tab","mdi:numeric");const h=null===(l=null==t?void 0:t.states)||void 0===l?void 0:l[g.entity];if(!h)return this.renderGradientErrorState("Entity Not Found",`Entity "${g.entity}" is not available`,"mdi:alert-circle-outline");const v=null!==this._localValue?this._localValue:parseFloat(h.state)||0,y=null!==(d=null===(a=h.attributes)||void 0===a?void 0:a.min)&&void 0!==d?d:0,f=null!==(p=null===(u=h.attributes)||void 0===u?void 0:u.max)&&void 0!==p?p:100,$=null!==(b=null===(c=h.attributes)||void 0===c?void 0:c.step)&&void 0!==b?b:1,x=(null===(m=h.attributes)||void 0===m?void 0:m.unit_of_measurement)||"",k=g.design||{},w=g.input_appearance||"outlined",S=null!==(_=g.font_size)&&void 0!==_?_:16,T=g.text_color||"var(--primary-text-color)",F=g.focus_color||"var(--primary-color)",z=!1!==g.show_stepper,C=!1!==g.show_unit&&!!x,E=!1!==g.show_label&&!!g.label,V=this.buildContainerStyles(k),A=s.k.getHoverEffectClass(k.hover_effect),U=e=>{const i=Math.min(f,Math.max(y,parseFloat(e.toFixed(10))));this._localValue=i,this._debounceTimer&&clearTimeout(this._debounceTimer),this._localValueTimer&&clearTimeout(this._localValueTimer),this._debounceTimer=setTimeout((()=>{this.callEntityService(g.entity,i,t),this._localValueTimer=setTimeout((()=>{this._localValue=null}),1e3)}),300)};let N="1px solid var(--divider-color)",O="transparent",j="";"filled"===w?(O="var(--input-fill-color, rgba(var(--rgb-primary-text-color, 0,0,0), 0.05))",N="none",j="border-bottom: 2px solid var(--divider-color);"):"underlined"===w&&(O="transparent",N="none",j="border-bottom: 2px solid var(--divider-color); border-radius: 0 !important;");const q=g.id;return n.qy`
      <style>
        .num-wrap-${q} {
          display: flex; align-items: center; background: ${O};
          border: ${N}; border-radius: 8px; ${j}
          transition: border-color .2s, box-shadow .2s; overflow: hidden;
        }
        .num-wrap-${q}:focus-within {
          border-color: ${F};
          ${"outlined"===w?`box-shadow: 0 0 0 1px ${F};`:""}
          ${"outlined"!==w?`border-bottom-color: ${F};`:""}
        }
        .num-field-${q} {
          flex: 1; border: none; outline: none; background: transparent;
          padding: 12px; font-size: ${S}px; color: ${T};
          font-family: inherit; min-width: 0; text-align: center;
          -moz-appearance: textfield;
        }
        .num-field-${q}::-webkit-inner-spin-button,
        .num-field-${q}::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .num-step-btn {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 100%; min-height: 44px; cursor: pointer;
          color: var(--primary-text-color); background: transparent;
          border: none; flex-shrink: 0; transition: background .15s;
          --mdc-icon-size: 20px;
        }
        .num-step-btn:hover { background: rgba(var(--rgb-primary-text-color, 0,0,0), .06); }
        .num-step-btn:active { background: rgba(var(--rgb-primary-text-color, 0,0,0), .12); }
        .num-unit { font-size: ${Math.max(12,S-2)}px; color: var(--secondary-text-color);
          padding-right: 12px; flex-shrink: 0; }
        .num-label { font-size: 12px; font-weight: 500; color: var(--secondary-text-color);
          margin-bottom: 6px; padding-left: 2px; }
      </style>
      <div class="number-input-container ${A}" style=${this.styleObjectToCss(V)}>
        ${E?n.qy`<div class="num-label">${g.label}</div>`:""}
        <div class="num-wrap-${q}">
          ${z?n.qy`
            <button class="num-step-btn" @click=${()=>U(v-$)}>
              <ha-icon icon="mdi:minus"></ha-icon>
            </button>`:""}
          <input class="num-field-${q}" type="number"
            .value=${String(v)} min=${y} max=${f} step=${$}
            @input=${e=>{const t=e.target,i=parseFloat(t.value);isNaN(i)||U(i)}} />
          ${C?n.qy`<span class="num-unit">${x}</span>`:""}
          ${z?n.qy`
            <button class="num-step-btn" @click=${()=>U(v+$)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>`:""}
        </div>
      </div>
    `}async callEntityService(e,t,i){if(!e||!i)return;const n=e.split(".")[0];try{await i.callService(n,"set_value",{entity_id:e,value:t})}catch(t){console.error(`[NumberInput] Failed to set value for ${e}:`,t)}}buildContainerStyles(e){return{width:"100%",height:"auto",padding:e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${e.padding_top||"0px"} ${e.padding_right||"0px"} ${e.padding_bottom||"0px"} ${e.padding_left||"0px"}`:"0",margin:e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${e.margin_top||"8px"} ${e.margin_right||"0px"} ${e.margin_bottom||"8px"} ${e.margin_left||"0px"}`:"8px 0",background:e.background_color||"transparent","border-radius":e.border_radius||"0",border:e.border_style&&"none"!==e.border_style?`${e.border_width||"1px"} ${e.border_style} ${e.border_color||"var(--divider-color)"}`:"none","box-sizing":"border-box"}}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${t}`)).join("; ")}}}}]);