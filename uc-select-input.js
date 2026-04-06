"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5132],{5151:(e,t,i)=>{i.r(t),i.d(t,{UltraSelectInputModule:()=>d});var o=i(5183),r=i(6478),l=i(7475),s=i(5147),n=i(8938),a=i(5262);i(7921);class d extends l.m{constructor(){super(...arguments),this.metadata={type:"select_input",title:"Select Input",description:"Dropdown or chip selector linked to input_select helpers",author:"WJD Designs",version:"1.0.0",icon:"mdi:form-dropdown",category:"input",tags:["select","dropdown","input","form","helper","interactive","options"]}}createDefault(e,t){return{id:e||this.generateId("select_input"),type:"select_input",select_style:"dropdown",show_label:!0,label:"",font_size:14,text_color:"var(--primary-text-color)",active_color:"var(--primary-color)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getStyleOptions(e){return[{value:"dropdown",label:(0,r.kg)("editor.select_input.style_options.dropdown",e,"Dropdown")},{value:"segmented",label:(0,r.kg)("editor.select_input.style_options.segmented",e,"Segmented Buttons")},{value:"chips",label:(0,r.kg)("editor.select_input.style_options.chips",e,"Chips / Pills")}]}renderGeneralTab(e,t,i,l){var s,n;const a=e,d=(null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)||"en";return o.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,r.kg)("editor.select_input.entity.title",d,"Entity Configuration"),(0,r.kg)("editor.select_input.entity.desc",d,"Link to a Home Assistant input_select or select entity."),[{title:(0,r.kg)("editor.select_input.entity_field",d,"Entity"),description:(0,r.kg)("editor.select_input.entity_field_desc",d,"Select an input_select entity to bind to."),hass:t,data:{entity:a.entity||""},schema:[this.entityField("entity",["input_select","select"])],onChange:e=>l(e.detail.value)}])}

        <div class="settings-section">
          <div class="section-title">${(0,r.kg)("editor.select_input.appearance.title",d,"Appearance")}</div>
          <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:16px;opacity:.8;line-height:1.4;">
            ${(0,r.kg)("editor.select_input.appearance.desc",d,"Choose how the options are displayed.")}
          </div>

          <div class="field-group" style="margin-bottom:16px;">
            ${this.renderFieldSection((0,r.kg)("editor.select_input.select_style",d,"Selection Style"),(0,r.kg)("editor.select_input.select_style_desc",d,"How options are presented to the user"),t,{select_style:a.select_style||"dropdown"},[this.selectField("select_style",this.getStyleOptions(d))],(e=>{l(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>

          ${this.renderFieldSection((0,r.kg)("editor.select_input.label",d,"Label"),(0,r.kg)("editor.select_input.label_desc",d,"Label displayed above the selector"),t,{label:a.label||""},[{name:"label",selector:{text:{}}}],(e=>l(e.detail.value)))}
          ${this.renderFieldSection((0,r.kg)("editor.select_input.show_label",d,"Show Label"),(0,r.kg)("editor.select_input.show_label_desc",d,"Display the label"),t,{show_label:!1!==a.show_label},[{name:"show_label",selector:{boolean:{}}}],(e=>{l(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <div class="settings-section">
          <div class="section-title">${(0,r.kg)("editor.select_input.styling.title",d,"Styling")}</div>
          ${this.renderSliderField((0,r.kg)("editor.select_input.font_size",d,"Font Size"),(0,r.kg)("editor.select_input.font_size_desc",d,"Font size in pixels"),null!==(n=a.font_size)&&void 0!==n?n:14,14,10,24,1,(e=>l({font_size:e})),"px")}
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,r.kg)("editor.select_input.active_color",d,"Active/Selected Color")}
              .value=${a.active_color||"var(--primary-color)"}
              @color-changed=${e=>{l({active_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom:16px;">
            <ultra-color-picker .label=${(0,r.kg)("editor.select_input.text_color",d,"Text Color")}
              .value=${a.text_color||"var(--primary-text-color)"}
              @color-changed=${e=>l({text_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(e,t,i,o){return s.A.render(e,t,(e=>o(e)))}renderOtherTab(e,t,i,o){return n.X.render(e,t,(e=>o(e)))}getStyles(){return l.m.getSliderStyles()}renderPreview(e,t,i){var r,l,s,n;const d=e;if(!(null===(r=d.entity)||void 0===r?void 0:r.trim()))return this.renderGradientErrorState("Configure Entity","Select an input_select entity in the General tab","mdi:form-dropdown");const c=null===(l=null==t?void 0:t.states)||void 0===l?void 0:l[d.entity];if(!c)return this.renderGradientErrorState("Entity Not Found",`Entity "${d.entity}" is not available`,"mdi:alert-circle-outline");const p=(null===(s=c.attributes)||void 0===s?void 0:s.options)||[],g=c.state||"",u=d.design||{},v=null!==(n=d.font_size)&&void 0!==n?n:14,_=d.text_color||"var(--primary-text-color)",b=d.active_color||"var(--primary-color)",h=d.select_style||"dropdown",y=!1!==d.show_label&&!!d.label,$=this._buildContainerStyles(u),x=a.k.getHoverEffectClass(u.hover_effect),m=d.id,f=e=>{if(!d.entity||!t)return;const i=d.entity.split(".")[0];t.callService(i,"select_option",{entity_id:d.entity,option:e})};return"segmented"===h?o.qy`
        <style>
          .sel-seg-${m} { display:flex; border-radius:8px; overflow:hidden; border:1px solid var(--divider-color); }
          .sel-seg-btn-${m} { flex:1; padding:10px 12px; border:none; background:transparent; cursor:pointer;
            font-size:${v}px; color:${_}; font-family:inherit; transition:all .2s;
            border-right:1px solid var(--divider-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .sel-seg-btn-${m}:last-child { border-right:none; }
          .sel-seg-btn-${m}.active { background:${b}; color:#fff; font-weight:500; }
          .sel-seg-btn-${m}:not(.active):hover { background:rgba(var(--rgb-primary-text-color,0,0,0),.05); }
          .sel-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${x}" style=${this._css($)}>
          ${y?o.qy`<div class="sel-label">${d.label}</div>`:""}
          <div class="sel-seg-${m}">
            ${p.map((e=>o.qy`
              <button class="sel-seg-btn-${m} ${e===g?"active":""}" @click=${()=>f(e)}>${e}</button>
            `))}
          </div>
        </div>
      `:"chips"===h?o.qy`
        <style>
          .sel-chips-${m} { display:flex; flex-wrap:wrap; gap:8px; }
          .sel-chip-${m} { padding:8px 16px; border-radius:20px; border:1px solid var(--divider-color);
            background:transparent; cursor:pointer; font-size:${v}px; color:${_};
            font-family:inherit; transition:all .2s; white-space:nowrap; }
          .sel-chip-${m}.active { background:${b}; color:#fff; border-color:${b}; font-weight:500; }
          .sel-chip-${m}:not(.active):hover { border-color:${b}; }
          .sel-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
        </style>
        <div class="${x}" style=${this._css($)}>
          ${y?o.qy`<div class="sel-label">${d.label}</div>`:""}
          <div class="sel-chips-${m}">
            ${p.map((e=>o.qy`
              <button class="sel-chip-${m} ${e===g?"active":""}" @click=${()=>f(e)}>${e}</button>
            `))}
          </div>
        </div>
      `:o.qy`
      <style>
        .sel-dd-wrap-${m} { position:relative; }
        .sel-dd-${m} { width:100%; padding:12px; font-size:${v}px; color:${_}; font-family:inherit;
          background:transparent; border:1px solid var(--divider-color); border-radius:8px; cursor:pointer;
          appearance:none; -webkit-appearance:none; outline:none; transition:border-color .2s, box-shadow .2s; }
        .sel-dd-${m}:focus { border-color:${b}; box-shadow:0 0 0 1px ${b}; }
        .sel-dd-arrow { position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none;
          color:var(--secondary-text-color); --mdc-icon-size:20px; }
        .sel-label { font-size:12px; font-weight:500; color:var(--secondary-text-color); margin-bottom:6px; padding-left:2px; }
      </style>
      <div class="${x}" style=${this._css($)}>
        ${y?o.qy`<div class="sel-label">${d.label}</div>`:""}
        <div class="sel-dd-wrap-${m}">
          <select class="sel-dd-${m}" .value=${g} @change=${e=>f(e.target.value)}>
            ${p.map((e=>o.qy`<option value=${e} ?selected=${e===g}>${e}</option>`))}
          </select>
          <span class="sel-dd-arrow"><ha-icon icon="mdi:chevron-down"></ha-icon></span>
        </div>
      </div>
    `}_buildContainerStyles(e){return{width:"100%",height:"auto",padding:e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${e.padding_top||"0px"} ${e.padding_right||"0px"} ${e.padding_bottom||"0px"} ${e.padding_left||"0px"}`:"0",margin:e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${e.margin_top||"8px"} ${e.margin_right||"0px"} ${e.margin_bottom||"8px"} ${e.margin_left||"0px"}`:"8px 0",background:e.background_color||"transparent","border-radius":e.border_radius||"0",border:e.border_style&&"none"!==e.border_style?`${e.border_width||"1px"} ${e.border_style} ${e.border_color||"var(--divider-color)"}`:"none","box-sizing":"border-box"}}_css(e){return Object.entries(e).map((([e,t])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}:${t}`)).join(";")}}}}]);