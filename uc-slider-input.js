"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[3379],{28:(e,i,t)=>{t.r(i),t.d(i,{UltraSliderInputModule:()=>d});var r=t(5183),l=t(6478),o=t(7475),a=t(5147),n=t(8938),s=t(5262);t(7921);class d extends o.m{constructor(){super(...arguments),this._localValue=null,this._localValueTimer=null,this._isDragging=!1,this.metadata={type:"slider_input",title:"Slider Input",description:"Range slider linked to input_number helpers",author:"WJD Designs",version:"1.0.0",icon:"mdi:tune-variant",category:"input",tags:["slider","range","number","input","form","helper","interactive"]}}createDefault(e,i){return{id:e||this.generateId("slider_input"),type:"slider_input",show_label:!0,label:"",show_value:!0,show_min_max:!1,show_unit:!0,slider_height:8,slider_color:"var(--primary-color)",track_color:"var(--divider-color)",thumb_size:20,font_size:14,text_color:"var(--primary-text-color)",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,i,t,o){var a,n,s,d;const u=e,c=(null===(a=null==i?void 0:i.locale)||void 0===a?void 0:a.language)||"en";return r.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection((0,l.kg)("editor.slider_input.entity.title",c,"Entity Configuration"),(0,l.kg)("editor.slider_input.entity.desc",c,"Link to a Home Assistant input_number helper entity."),[{title:(0,l.kg)("editor.slider_input.entity_field",c,"Entity"),description:(0,l.kg)("editor.slider_input.entity_field_desc",c,"Select an input_number entity to bind this slider to."),hass:i,data:{entity:u.entity||""},schema:[this.entityField("entity",["input_number","number"])],onChange:e=>o(e.detail.value)}])}

        <div class="settings-section">
          <div class="section-title">${(0,l.kg)("editor.slider_input.display.title",c,"Display")}</div>
          <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;">
            ${(0,l.kg)("editor.slider_input.display.desc",c,"Configure what information to show with the slider.")}
          </div>

          ${this.renderFieldSection((0,l.kg)("editor.slider_input.label",c,"Label"),(0,l.kg)("editor.slider_input.label_desc",c,"Label displayed above the slider"),i,{label:u.label||""},[{name:"label",selector:{text:{}}}],(e=>o(e.detail.value)))}

          ${this.renderFieldSection((0,l.kg)("editor.slider_input.show_label",c,"Show Label"),(0,l.kg)("editor.slider_input.show_label_desc",c,"Display the label"),i,{show_label:!1!==u.show_label},[{name:"show_label",selector:{boolean:{}}}],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,l.kg)("editor.slider_input.show_value",c,"Show Value"),(0,l.kg)("editor.slider_input.show_value_desc",c,"Display the current numeric value"),i,{show_value:!1!==u.show_value},[{name:"show_value",selector:{boolean:{}}}],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,l.kg)("editor.slider_input.show_min_max",c,"Show Min/Max"),(0,l.kg)("editor.slider_input.show_min_max_desc",c,"Display min and max values at the ends"),i,{show_min_max:!0===u.show_min_max},[{name:"show_min_max",selector:{boolean:{}}}],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection((0,l.kg)("editor.slider_input.show_unit",c,"Show Unit"),(0,l.kg)("editor.slider_input.show_unit_desc",c,"Display the unit of measurement"),i,{show_unit:!1!==u.show_unit},[{name:"show_unit",selector:{boolean:{}}}],(e=>{o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <div class="settings-section">
          <div class="section-title">${(0,l.kg)("editor.slider_input.styling.title",c,"Styling")}</div>

          ${this.renderSliderField((0,l.kg)("editor.slider_input.slider_height",c,"Track Height"),(0,l.kg)("editor.slider_input.slider_height_desc",c,"Height of the slider track in pixels"),null!==(n=u.slider_height)&&void 0!==n?n:8,8,2,24,1,(e=>{o({slider_height:e}),setTimeout((()=>this.triggerPreviewUpdate()),50)}),"px")}

          ${this.renderSliderField((0,l.kg)("editor.slider_input.thumb_size",c,"Thumb Size"),(0,l.kg)("editor.slider_input.thumb_size_desc",c,"Size of the slider thumb in pixels"),null!==(s=u.thumb_size)&&void 0!==s?s:20,20,12,36,1,(e=>{o({thumb_size:e}),setTimeout((()=>this.triggerPreviewUpdate()),50)}),"px")}

          ${this.renderSliderField((0,l.kg)("editor.slider_input.font_size",c,"Font Size"),(0,l.kg)("editor.slider_input.font_size_desc",c,"Font size of labels and value"),null!==(d=u.font_size)&&void 0!==d?d:14,14,10,28,1,(e=>o({font_size:e})),"px")}

          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.slider_input.slider_color",c,"Slider Color")}
              .value=${u.slider_color||"var(--primary-color)"}
              @color-changed=${e=>{o({slider_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.slider_input.track_color",c,"Track Color")}
              .value=${u.track_color||"var(--divider-color)"}
              @color-changed=${e=>{o({track_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,l.kg)("editor.slider_input.text_color",c,"Text Color")}
              .value=${u.text_color||"var(--primary-text-color)"}
              @color-changed=${e=>o({text_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}renderActionsTab(e,i,t,r){return a.A.render(e,i,(e=>r(e)))}renderOtherTab(e,i,t,r){return n.X.render(e,i,(e=>r(e)))}getStyles(){return`${o.m.getSliderStyles()}`}renderPreview(e,i,t,l){var o,a,n,d,u,c,p,h,_,g,v,m;const b=e;if(!(null===(o=b.entity)||void 0===o?void 0:o.trim()))return this.renderGradientErrorState("Configure Entity","Select an input_number entity in the General tab","mdi:tune-variant");const $=null===(a=null==i?void 0:i.states)||void 0===a?void 0:a[b.entity];if(!$)return this.renderGradientErrorState("Entity Not Found",`Entity "${b.entity}" is not available`,"mdi:alert-circle-outline");const y=null!==this._localValue?this._localValue:parseFloat($.state)||0,x=null!==(d=null===(n=$.attributes)||void 0===n?void 0:n.min)&&void 0!==d?d:0,w=null!==(c=null===(u=$.attributes)||void 0===u?void 0:u.max)&&void 0!==c?c:100,k=null!==(h=null===(p=$.attributes)||void 0===p?void 0:p.step)&&void 0!==h?h:1,f=(null===(_=$.attributes)||void 0===_?void 0:_.unit_of_measurement)||"",S=b.design||{},z=null!==(g=b.font_size)&&void 0!==g?g:14,T=b.text_color||"var(--primary-text-color)",F=b.slider_color||"var(--primary-color)",C=b.track_color||"var(--divider-color)",D=null!==(v=b.slider_height)&&void 0!==v?v:8,U=null!==(m=b.thumb_size)&&void 0!==m?m:20,V=!1!==b.show_label&&!!b.label,E=!1!==b.show_value,P=!0===b.show_min_max,j=!1!==b.show_unit&&!!f,q=w>x?(y-x)/(w-x)*100:0,N=this.buildContainerStyles(S),I=s.k.getHoverEffectClass(S.hover_effect),L=Number.isInteger(k)?y.toFixed(0):y.toFixed(1),M=b.id;return r.qy`
      <style>
        .si-container-${M} { width: 100%; }
        .si-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .si-label { font-size: ${z}px; font-weight: 500; color: ${T}; }
        .si-value { font-size: ${z}px; font-weight: 600; color: ${T}; }
        .si-track-wrap { position: relative; width: 100%; height: ${Math.max(U,D+8)}px;
          display: flex; align-items: center; }
        .si-range-${M} {
          -webkit-appearance: none; appearance: none; width: 100%; height: ${D}px;
          background: linear-gradient(to right, ${F} ${q}%, ${C} ${q}%);
          border-radius: ${D/2}px; outline: none; cursor: pointer; margin: 0;
        }
        .si-range-${M}::-webkit-slider-thumb {
          -webkit-appearance: none; width: ${U}px; height: ${U}px;
          border-radius: 50%; background: ${F}; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,.3); border: 2px solid white;
          transition: transform .15s ease;
        }
        .si-range-${M}::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .si-range-${M}::-moz-range-thumb {
          width: ${U}px; height: ${U}px; border-radius: 50%;
          background: ${F}; cursor: pointer; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,.3);
        }
        .si-range-${M}::-moz-range-track {
          height: ${D}px; background: ${C};
          border-radius: ${D/2}px; border: none;
        }
        .si-range-${M}::-moz-range-progress {
          height: ${D}px; background: ${F};
          border-radius: ${D/2}px;
        }
        .si-minmax { display: flex; justify-content: space-between; margin-top: 4px;
          font-size: ${Math.max(10,z-2)}px; color: var(--secondary-text-color); opacity: .7; }
      </style>
      <div class="si-container-${M} ${I}" style=${this.styleObjectToCss(N)}>
        ${V||E?r.qy`
          <div class="si-header">
            ${V?r.qy`<span class="si-label">${b.label}</span>`:r.qy`<span></span>`}
            ${E?r.qy`<span class="si-value">${L}${j?` ${f}`:""}</span>`:""}
          </div>
        `:""}
        <div class="si-track-wrap">
          <input class="si-range-${M}" type="range"
            min=${x} max=${w} step=${k} .value=${String(y)}
            @input=${e=>{const i=e.target,t=parseFloat(i.value);isNaN(t)||(this._localValue=t,this._isDragging=!0)}} @change=${e=>{const t=e.target,r=parseFloat(t.value);isNaN(r)||(this._isDragging=!1,this._localValue=r,this._localValueTimer&&clearTimeout(this._localValueTimer),this.callEntityService(b.entity,r,i),this._localValueTimer=setTimeout((()=>{this._localValue=null}),1e3))}} />
        </div>
        ${P?r.qy`
          <div class="si-minmax">
            <span>${x}${j?` ${f}`:""}</span>
            <span>${w}${j?` ${f}`:""}</span>
          </div>
        `:""}
      </div>
    `}async callEntityService(e,i,t){if(!e||!t)return;const r=e.split(".")[0];try{await t.callService(r,"set_value",{entity_id:e,value:i})}catch(i){console.error(`[SliderInput] Failed to set value for ${e}:`,i)}}buildContainerStyles(e){return{width:"100%",height:"auto",padding:e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${e.padding_top||"0px"} ${e.padding_right||"0px"} ${e.padding_bottom||"0px"} ${e.padding_left||"0px"}`:"4px 0",margin:e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${e.margin_top||"8px"} ${e.margin_right||"0px"} ${e.margin_bottom||"8px"} ${e.margin_left||"0px"}`:"8px 0",background:e.background_color||"transparent","border-radius":e.border_radius||"0",border:e.border_style&&"none"!==e.border_style?`${e.border_width||"1px"} ${e.border_style} ${e.border_color||"var(--divider-color)"}`:"none","box-sizing":"border-box"}}styleObjectToCss(e){return Object.entries(e).map((([e,i])=>`${e.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${i}`)).join("; ")}}}}]);