"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[7485],{9362:(e,t,i)=>{i.r(t),i.d(t,{UltraTextInputModule:()=>d});var o=i(5183),r=i(6478),n=i(7475),l=i(5147),a=i(8938),s=i(5262);i(7921);class d extends n.m{constructor(){super(...arguments),this._debounceTimer=null,this._localValue=null,this._localValueTimer=null,this.metadata={type:"text_input",title:"Text Input",description:"Text input field linked to input_text helpers",author:"WJD Designs",version:"1.0.0",icon:"mdi:form-textbox",category:"input",tags:["text","input","form","helper","interactive"]}}createDefault(e,t){return{id:e||this.generateId("text_input"),type:"text_input",placeholder:"Enter text...",input_appearance:"outlined",show_clear_button:!0,show_character_count:!1,show_label:!0,label:"",font_size:16,text_color:"var(--primary-text-color)",focus_color:"var(--primary-color)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getAppearanceOptions(e){return[{value:"outlined",label:(0,r.kg)("editor.text_input.appearance_options.outlined",e,"Outlined")},{value:"filled",label:(0,r.kg)("editor.text_input.appearance_options.filled",e,"Filled")},{value:"underlined",label:(0,r.kg)("editor.text_input.appearance_options.underlined",e,"Underlined")}]}renderGeneralTab(e,t,i,n){var l,a,s,d;const c=e,u=(null===(l=null==t?void 0:t.locale)||void 0===l?void 0:l.language)||"en";return c.entity&&(null===(a=null==t?void 0:t.states)||void 0===a||a[c.entity]),o.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity Configuration -->
        ${this.renderSettingsSection((0,r.kg)("editor.text_input.entity.title",u,"Entity Configuration"),(0,r.kg)("editor.text_input.entity.desc",u,"Link to a Home Assistant input_text helper entity."),[{title:(0,r.kg)("editor.text_input.entity_field",u,"Entity"),description:(0,r.kg)("editor.text_input.entity_field_desc",u,"Select an input_text entity to bind this text field to."),hass:t,data:{entity:c.entity||""},schema:[this.entityField("entity",["input_text"])],onChange:e=>{n(e.detail.value)}}])}

        <!-- Appearance Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,r.kg)("editor.text_input.appearance.title",u,"Appearance")}
          </div>
          <div
            class="section-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,r.kg)("editor.text_input.appearance.desc",u,"Configure how the text input field looks.")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,r.kg)("editor.text_input.input_appearance",u,"Input Style"),(0,r.kg)("editor.text_input.input_appearance_desc",u,"Visual style of the input field"),t,{input_appearance:c.input_appearance||"outlined"},[this.selectField("input_appearance",this.getAppearanceOptions(u))],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>

          ${this.renderFieldSection((0,r.kg)("editor.text_input.placeholder",u,"Placeholder"),(0,r.kg)("editor.text_input.placeholder_desc",u,"Placeholder text shown when the field is empty"),t,{placeholder:c.placeholder||""},[{name:"placeholder",selector:{text:{}}}],(e=>n(e.detail.value)))}

          ${this.renderFieldSection((0,r.kg)("editor.text_input.label",u,"Label"),(0,r.kg)("editor.text_input.label_desc",u,"Label displayed above the input field"),t,{label:c.label||""},[{name:"label",selector:{text:{}}}],(e=>n(e.detail.value)))}

          ${this.renderFieldSection((0,r.kg)("editor.text_input.show_label",u,"Show Label"),(0,r.kg)("editor.text_input.show_label_desc",u,"Display the label above the input"),t,{show_label:!1!==c.show_label},[{name:"show_label",selector:{boolean:{}}}],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,r.kg)("editor.text_input.multiline",u,"Multiline"),(0,r.kg)("editor.text_input.multiline_desc",u,"Allow multiple lines of text (textarea)"),t,{multiline:!0===c.multiline},[{name:"multiline",selector:{boolean:{}}}],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${c.multiline?this.renderSliderField((0,r.kg)("editor.text_input.rows",u,"Rows"),(0,r.kg)("editor.text_input.rows_desc",u,"Number of visible text rows"),null!==(s=c.rows)&&void 0!==s?s:4,4,2,12,1,(e=>{n({rows:e}),setTimeout((()=>this.triggerPreviewUpdate()),50)})):""}
        </div>

        <!-- Icons & Controls -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,r.kg)("editor.text_input.controls.title",u,"Icons & Controls")}
          </div>

          ${this.renderFieldSection((0,r.kg)("editor.text_input.prefix_icon",u,"Prefix Icon"),(0,r.kg)("editor.text_input.prefix_icon_desc",u,"Icon displayed at the start of the input field"),t,{prefix_icon:c.prefix_icon||""},[{name:"prefix_icon",selector:{icon:{}}}],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,r.kg)("editor.text_input.suffix_icon",u,"Suffix Icon"),(0,r.kg)("editor.text_input.suffix_icon_desc",u,"Icon displayed at the end of the input field"),t,{suffix_icon:c.suffix_icon||""},[{name:"suffix_icon",selector:{icon:{}}}],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,r.kg)("editor.text_input.show_clear_button",u,"Show Clear Button"),(0,r.kg)("editor.text_input.show_clear_button_desc",u,"Show a button to clear the input field"),t,{show_clear_button:!1!==c.show_clear_button},[{name:"show_clear_button",selector:{boolean:{}}}],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,r.kg)("editor.text_input.show_character_count",u,"Show Character Count"),(0,r.kg)("editor.text_input.show_character_count_desc",u,"Display a character counter below the input"),t,{show_character_count:!0===c.show_character_count},[{name:"show_character_count",selector:{boolean:{}}}],(e=>{n(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <!-- Styling -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,r.kg)("editor.text_input.styling.title",u,"Styling")}
          </div>

          ${this.renderSliderField((0,r.kg)("editor.text_input.font_size",u,"Font Size"),(0,r.kg)("editor.text_input.font_size_desc",u,"Font size of the input text in pixels"),null!==(d=c.font_size)&&void 0!==d?d:16,16,10,32,1,(e=>n({font_size:e})),"px")}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,r.kg)("editor.text_input.text_color",u,"Text Color")}
              .value=${c.text_color||"var(--primary-text-color)"}
              @color-changed=${e=>{n({text_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,r.kg)("editor.text_input.focus_color",u,"Focus/Accent Color")}
              .value=${c.focus_color||"var(--primary-color)"}
              @color-changed=${e=>{n({focus_color:e.detail.value})}}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(e,t,i,o){return l.A.render(e,t,(e=>o(e)))}renderOtherTab(e,t,i,o){return a.X.render(e,t,(e=>o(e)))}getStyles(){return`\n      ${n.m.getSliderStyles()}\n    `}renderPreview(e,t,i,r){var n,l,a,d,c;const u=e;if(!u.entity||!u.entity.trim())return this.renderGradientErrorState("Configure Entity","Select an input_text entity in the General tab","mdi:form-textbox");const p=null===(n=null==t?void 0:t.states)||void 0===n?void 0:n[u.entity];if(!p)return this.renderGradientErrorState("Entity Not Found",`Entity "${u.entity}" is not available`,"mdi:alert-circle-outline");const _=null!==this._localValue?this._localValue:p.state||"",x=null===(l=p.attributes)||void 0===l?void 0:l.max,h=(null===(a=p.attributes)||void 0===a?void 0:a.mode)||"text",g=u.design||{},b=u.input_appearance||"outlined",v=null!==(d=u.font_size)&&void 0!==d?d:16,f=u.text_color||"var(--primary-text-color)",m=u.focus_color||"var(--primary-color)",y=u.placeholder||"",$=!1!==u.show_clear_button,w=!0===u.show_character_count,k=!1!==u.show_label&&!!u.label,T=u.label||"",S={width:"100%",height:"auto",padding:g.padding_top||g.padding_bottom||g.padding_left||g.padding_right?`${g.padding_top||"0px"} ${g.padding_right||"0px"} ${g.padding_bottom||"0px"} ${g.padding_left||"0px"}`:"0",margin:g.margin_top||g.margin_bottom||g.margin_left||g.margin_right?`${g.margin_top||"8px"} ${g.margin_right||"0px"} ${g.margin_bottom||"8px"} ${g.margin_left||"0px"}`:"8px 0",background:g.background_color||"transparent",backgroundImage:this.getBackgroundImageCss(Object.assign(Object.assign({},u),g),t),"background-size":"cover","background-position":"center","background-repeat":"no-repeat","border-radius":g.border_radius||"0",border:g.border_style&&"none"!==g.border_style?`${g.border_width||"1px"} ${g.border_style} ${g.border_color||"var(--divider-color)"}`:"none","box-shadow":g.box_shadow_h||g.box_shadow_v||g.box_shadow_blur||g.box_shadow_spread?`${g.box_shadow_h||"0px"} ${g.box_shadow_v||"0px"} ${g.box_shadow_blur||"0px"} ${g.box_shadow_spread||"0px"} ${g.box_shadow_color||"rgba(0,0,0,.2)"}`:"none","box-sizing":"border-box"},C=g.hover_effect,F=s.k.getHoverEffectClass(C),V=!0===u.multiline,z=null!==(c=u.rows)&&void 0!==c?c:4,E="password"===h?"password":"text",I=e=>{const i=e.target.value;this._localValue=i,this._localValueTimer&&clearTimeout(this._localValueTimer),this._debounceTimer&&clearTimeout(this._debounceTimer),this._debounceTimer=setTimeout((()=>{this.setEntityValue(u.entity,i,t),this._localValueTimer=setTimeout((()=>{this._localValue=null}),1e3)}),300)};let P="",U="",A="";switch(b){case"filled":U="var(--input-fill-color, rgba(var(--rgb-primary-text-color, 0,0,0), 0.05))",P="none",A="border-bottom: 2px solid var(--divider-color);";break;case"underlined":U="transparent",P="none",A="border-bottom: 2px solid var(--divider-color); border-radius: 0 !important;";break;default:U="transparent",P="1px solid var(--divider-color)",A=""}const j=u.id;return o.qy`
      <style>
        .text-input-wrapper-${j} {
          position: relative;
          display: flex;
          align-items: ${V?"flex-start":"center"};
          background: ${U};
          border: ${P};
          border-radius: 8px;
          ${A}
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden;
        }
        .text-input-wrapper-${j}:focus-within {
          border-color: ${m};
          ${"outlined"===b?`box-shadow: 0 0 0 1px ${m};`:""}
          ${"underlined"===b||"filled"===b?`border-bottom-color: ${m};`:""}
        }
        .text-input-field-${j} {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 12px;
          font-size: ${v}px;
          color: ${f};
          font-family: inherit;
          min-width: 0;
        }
        .text-input-field-${j}::placeholder {
          color: var(--secondary-text-color);
          opacity: 0.6;
        }
        textarea.text-input-field-${j} {
          resize: vertical;
          line-height: 1.5;
        }
        .text-input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          color: var(--secondary-text-color);
          flex-shrink: 0;
          --mdc-icon-size: 20px;
        }
        .text-input-clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          cursor: pointer;
          color: var(--secondary-text-color);
          opacity: 0.6;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
          background: none;
          border: none;
          --mdc-icon-size: 18px;
        }
        .text-input-clear-btn:hover {
          opacity: 1;
        }
        .text-input-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-bottom: 6px;
          padding-left: 2px;
        }
        .text-input-char-count {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 4px;
          text-align: right;
          padding-right: 4px;
          opacity: 0.7;
        }
      </style>
      <div
        class="text-input-module-container ${F}"
        style=${this.styleObjectToCss(S)}
      >
        ${k?o.qy`<div class="text-input-label">${T}</div>`:""}
        <div class="text-input-wrapper-${j}">
          ${u.prefix_icon?o.qy`<div class="text-input-icon" style="${V?"padding-top: 12px;":""}">
                <ha-icon icon="${u.prefix_icon}"></ha-icon>
              </div>`:""}
          ${V?o.qy`<textarea
                class="text-input-field-${j}"
                rows=${z}
                .value=${_}
                placeholder="${y}"
                @input=${I}
              ></textarea>`:o.qy`<input
                class="text-input-field-${j}"
                type="${E}"
                .value=${_}
                placeholder="${y}"
                @input=${I}
              />`}
          ${$&&_?o.qy`<button class="text-input-clear-btn" style="${V?"padding-top: 10px; align-self: flex-start;":""}" @click=${e=>{e.stopPropagation(),this._debounceTimer&&(clearTimeout(this._debounceTimer),this._debounceTimer=null),this._localValueTimer&&clearTimeout(this._localValueTimer),this._localValue="",this.setEntityValue(u.entity,"",t),this._localValueTimer=setTimeout((()=>{this._localValue=null}),1e3)}}>
                <ha-icon icon="mdi:close-circle"></ha-icon>
              </button>`:""}
          ${u.suffix_icon?o.qy`<div class="text-input-icon" style="${V?"padding-top: 12px;":""}">
                <ha-icon icon="${u.suffix_icon}"></ha-icon>
              </div>`:""}
        </div>
        ${w?o.qy`<div class="text-input-char-count">
              ${_.length}${x?` / ${x}`:""}
            </div>`:""}
      </div>
    `}async setEntityValue(e,t,i){if(e&&i)try{await i.callService("input_text","set_value",{entity_id:e,value:t})}catch(t){console.error(`[TextInput] Failed to set value for ${e}:`,t)}}styleObjectToCss(e){return Object.entries(e).map((([e,t])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${t}`)).join("; ")}}}}]);