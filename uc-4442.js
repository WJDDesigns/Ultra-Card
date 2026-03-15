"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[4442],{4442:(e,n,t)=>{t.r(n),t.d(n,{UltraVerticalModule:()=>u});var i=t(5183),o=t(7475),a=t(6990),r=t(5255),l=t(8938),d=t(6478),s=t(230),c=t(378),p=t(361),g=t(6477);class u extends o.m{constructor(){super(...arguments),this.metadata={type:"vertical",title:"Vertical Layout",description:"Arrange modules in columns with flexible alignment and spacing",author:"WJD Designs",version:"1.0.0",icon:"mdi:view-agenda",category:"layout",tags:["layout","vertical","alignment","container","flexbox"]}}createDefault(e,n){return{id:e||this.generateId("vertical"),type:"vertical",alignment:"center",horizontal_alignment:"stretch",gap:1.2,modules:[],tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,n,t,o){var a;const r=e,l=(null===(a=null==n?void 0:n.locale)||void 0===a?void 0:a.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        ${this.renderSettingsSection((0,d.kg)("editor.vertical.layout.title",l,"Layout Configuration"),(0,d.kg)("editor.vertical.layout.desc",l,"Configure alignment and spacing for items in a single column."),[{title:(0,d.kg)("editor.vertical.alignment.horizontal",l,"Horizontal Alignment"),description:(0,d.kg)("editor.vertical.alignment.horizontal_desc",l,"Choose how items are aligned horizontally within the column."),hass:n,data:{horizontal_alignment:r.horizontal_alignment||"center"},schema:[this.selectField("horizontal_alignment",[{value:"left",label:(0,d.kg)("editor.common.left",l,"Left")},{value:"center",label:(0,d.kg)("editor.common.center",l,"Center")},{value:"right",label:(0,d.kg)("editor.common.right",l,"Right")},{value:"stretch",label:(0,d.kg)("editor.common.stretch",l,"Stretch")}])],onChange:e=>{e.detail.value.horizontal_alignment!==(r.horizontal_alignment||"center")&&(o(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}},{title:(0,d.kg)("editor.vertical.alignment.vertical",l,"Vertical Distribution"),description:(0,d.kg)("editor.vertical.alignment.vertical_desc",l,"How items are distributed along the vertical axis."),hass:n,data:{alignment:r.alignment||"top"},schema:[this.selectField("alignment",[{value:"top",label:(0,d.kg)("editor.common.top",l,"Top")},{value:"center",label:(0,d.kg)("editor.common.center",l,"Center")},{value:"bottom",label:(0,d.kg)("editor.common.bottom",l,"Bottom")},{value:"space-between",label:(0,d.kg)("editor.common.space_between",l,"Space Between")},{value:"space-around",label:(0,d.kg)("editor.common.space_around",l,"Space Around")}])],onChange:e=>{e.detail.value.alignment!==(r.alignment||"top")&&(o(e.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}

        <!-- Gap Between Items Field with Custom Slider -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,d.kg)("editor.vertical.gap.title",l,"Gap Configuration")}
          </div>

          <div style="margin-bottom: 8px;">
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              ${(0,d.kg)("editor.vertical.gap.between_items",l,"Gap Between Items")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${(0,d.kg)("editor.vertical.gap.desc",l,"Set the spacing between vertical items (in rem units). Use negative values to overlap items. Any value is allowed. Note: Gap is disabled when using Space Between or Space Around distribution.")}
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px; ${"space-between"===r.alignment||"space-around"===r.alignment?"opacity: 0.5; pointer-events: none;":""}"
            >
              <input
                type="range"
                class="gap-slider"
                min="-50"
                max="50"
                step="0.1"
                .value="${void 0!==r.gap?r.gap:1.2}"
                @input=${e=>{const n=e.target,t=parseFloat(n.value);o({gap:t})}}
              />
              <input
                type="number"
                class="gap-input"
                style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                step="0.1"
                .value="${void 0!==r.gap?r.gap:1.2}"
                @input=${e=>{const n=e.target,t=parseFloat(n.value);isNaN(t)||o({gap:t})}}
                @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const n=e.target,t=(parseFloat(n.value)||0)+("ArrowUp"===e.key?.1:-.1),i=Math.round(10*t)/10;o({gap:i})}}}
              />
              <button
                class="reset-btn"
                @click=${()=>o({gap:1.2})}
                title="Reset to default (1.2)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    `}renderPreview(e,n,t,o){var a,r,l,c;const u=e;this._currentConfig=t,this._currentPreviewContext=o;const m=(null===(a=null==n?void 0:n.locale)||void 0===a?void 0:a.language)||"en",v=u,h=Object.assign(Object.assign({},v),v.design||{}),b=u.modules&&u.modules.length>0,_=void 0!==u.gap?u.gap:1.2,x=(0,g.U9)({color:h.background_color,fallback:"transparent",image:this.getBackgroundImageCSS(h,n),imageSize:h.background_size||"cover",imagePosition:h.background_position||"center",imageRepeat:h.background_repeat||"no-repeat"}),y=h.border_radius||v.border_radius||(void 0!==(null===(r=h.border)||void 0===r?void 0:r.radius)?h.border.radius:void 0)||(void 0!==(null===(l=v.border)||void 0===l?void 0:l.radius)?v.border.radius:void 0),w=Object.assign(Object.assign({padding:this.getPaddingCSS(h),margin:this.getMarginCSS(h)},x.styles),{border:h.border_width||h.border_color||h.border_style&&"none"!==h.border_style?this.getBorderCSS(h):"none",borderRadius:this.addPixelUnit(y)||"0",position:h.position||(h.z_index?"relative":"static"),zIndex:h.z_index||"auto",width:h.width||void 0,height:h.height||void 0,maxWidth:h.max_width||void 0,minWidth:h.min_width||void 0,maxHeight:h.max_height||void 0,boxShadow:h.box_shadow||void 0,backdropFilter:h.backdrop_filter||void 0,clipPath:h.clip_path||void 0,display:"flex",flexDirection:"column",justifyContent:this.getJustifyContent(u.alignment||"center"),gap:_>=0&&"space-between"!==u.alignment&&"space-around"!==u.alignment?`${_}rem`:"0",alignItems:this.getAlignItems(u.horizontal_alignment||"center"),minHeight:h.min_height||"auto",overflow:(()=>{const e=h.overflow;return e&&"visible"!==e?e:y&&"0"!==String(y)&&"0px"!==String(y)?"hidden":e||"visible"})(),boxSizing:"border-box"}),f=this.createGestureHandlers(u.id,{tap_action:u.tap_action,hold_action:u.hold_action,double_tap_action:u.double_tap_action,entity:u.entity,module:u},n,t),k=null===(c=u.design)||void 0===c?void 0:c.css_variable_prefix;if(k){const e=(0,p.E)(k,u.design);Object.assign(w,e)}const $=u.tap_action&&"nothing"!==u.tap_action.action||u.hold_action&&"nothing"!==u.hold_action.action||u.double_tap_action&&"nothing"!==u.double_tap_action.action;return i.qy`
      <div class="vertical-module-preview">
        <div
          class="vertical-preview-content"
          style="${this.styleObjectToCss(w)}; cursor: ${$?"pointer":"default"}; ${$?"pointer-events: auto;":""}"
          @pointerdown=${$?f.onPointerDown:null}
          @pointerup=${$?f.onPointerUp:null}
          @pointercancel=${$?f.onPointerCancel:null}
          @pointerleave=${$?f.onPointerLeave:null}
        >
          ${b?(()=>{s.S.setHass(n);const e=u.modules.filter((e=>{var n,t,i,o;const a=e,r=s.S.evaluateModuleVisibility(a),l=s.S.evaluateLogicProperties({logic_entity:null===(n=null==a?void 0:a.design)||void 0===n?void 0:n.logic_entity,logic_attribute:null===(t=null==a?void 0:a.design)||void 0===t?void 0:t.logic_attribute,logic_operator:null===(i=null==a?void 0:a.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(o=null==a?void 0:a.design)||void 0===o?void 0:o.logic_value});return r&&l}));return e.map(((e,t)=>{const o=_<0&&t>0&&"space-between"!==u.alignment&&"space-around"!==u.alignment,a=o?`${_}rem 0 0 0`:"0",r=o;return i.qy`
                    <div
                      class="child-module-preview ${r?"negative-gap":""}"
                      style="max-width: 100%; box-sizing: border-box; margin: ${a}; ${r?"padding: 0; border: none; background: transparent;":""}"
                    >
                      ${this._renderChildModulePreview(e,n,v,this._currentConfig,this._currentPreviewContext)}
                    </div>
                  `}))})():i.qy`
                <div class="empty-layout-message">
                  <span
                    >${(0,d.kg)("editor.vertical.empty.no_modules",m,"No modules added yet")}</span
                  >
                  <small
                    >${(0,d.kg)("editor.vertical.empty.add_modules",m,"Add modules in the layout builder to see them here")}</small
                  >
                </div>
              `}
        </div>
      </div>
    `}_renderChildModulePreview(e,n,t,o,a){var l,d,p,g,u,m,v,h,b,_,x,y,w,f,k,$,S,z,C,P;let U=e;t&&(U=this.applyLayoutDesignToChild(e,t)),s.S.setHass(n);const j=U,A=s.S.evaluateModuleVisibility(j),L=s.S.evaluateLogicProperties({logic_entity:null===(l=null==j?void 0:j.design)||void 0===l?void 0:l.logic_entity,logic_attribute:null===(d=null==j?void 0:j.design)||void 0===d?void 0:d.logic_attribute,logic_operator:null===(p=null==j?void 0:j.design)||void 0===p?void 0:p.logic_operator,logic_value:null===(g=null==j?void 0:j.design)||void 0===g?void 0:g.logic_value});if(!A||!L)return i.qy``;const B=(0,r.oD)().getModule(U.type);if(!B)return i.qy``;const I=(null===(m=null===(u=B.metadata)||void 0===u?void 0:u.tags)||void 0===m?void 0:m.includes("pro"))||(null===(h=null===(v=B.metadata)||void 0===v?void 0:v.tags)||void 0===h?void 0:h.includes("premium"))||!1;let M=!1;const D=c.x.checkIntegrationAuth(n);if("pro"===(null===(b=null==D?void 0:D.subscription)||void 0===b?void 0:b.tier)&&"active"===(null===(_=null==D?void 0:D.subscription)||void 0===_?void 0:_.status))M=!0;else if(c.x.isAuthenticated()){const e=c.x.getCurrentUser();"pro"===(null===(x=null==e?void 0:e.subscription)||void 0===x?void 0:x.tier)&&"active"===(null===(y=null==e?void 0:e.subscription)||void 0===y?void 0:y.status)&&(M=!0)}const T=I&&!M;if(B){const e=B.renderPreview(U,n,o,a);if(T)return i.qy`
          <div class="pro-module-locked" style="position: relative;">
            ${e}
            <div
              class="pro-module-overlay"
              style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.8);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 12px;
              z-index: 10;
            "
            >
              <div
                class="pro-module-message"
                style="
                text-align: center;
                color: white;
                padding: 6px;
                max-width: 95%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
              "
              >
                <ha-icon icon="mdi:lock" style="font-size: 20px; flex-shrink: 0;"></ha-icon>
                <div
                  style="font-size: 11px; font-weight: 600; line-height: 1.2; white-space: nowrap;"
                >
                  Pro Module
                </div>
                <div style="font-size: 9px; opacity: 0.8; line-height: 1.2; display: none;">
                  Login to view
                </div>
              </div>
            </div>
          </div>
        `;const t=U,r=t.animation_type||(null===(w=t.design)||void 0===w?void 0:w.animation_type);if(r&&"none"!==r){const o=t.animation_duration||(null===(f=t.design)||void 0===f?void 0:f.animation_duration)||"2s",a=t.animation_delay||(null===(k=t.design)||void 0===k?void 0:k.animation_delay)||"0s",l=t.animation_timing||(null===($=t.design)||void 0===$?void 0:$.animation_timing)||"ease",d=t.animation_entity||(null===(S=t.design)||void 0===S?void 0:S.animation_entity),s=t.animation_trigger_type||(null===(z=t.design)||void 0===z?void 0:z.animation_trigger_type)||"state",c=t.animation_attribute||(null===(C=t.design)||void 0===C?void 0:C.animation_attribute),p=t.animation_state||(null===(P=t.design)||void 0===P?void 0:P.animation_state);let g=!1;if(d){if(p&&n&&n.states[d]){const e=n.states[d];g="attribute"===s&&c?String(e.attributes[c])===p:e.state===p}}else g=!0;if(g)return i.qy`
            <div
              class="module-animation-wrapper animation-${r}"
              style="
                --animation-duration: ${o};
                --animation-delay: ${a};
                --animation-timing: ${l};
              "
            >
              ${e}
            </div>
          `}return e}return i.qy`
      <div class="unknown-child-module">
        <ha-icon icon="mdi:help-circle"></ha-icon>
        <span>Unknown Module: ${U.type}</span>
      </div>
    `}applyLayoutDesignToChild(e,n){const t=Object.assign({},e);return n.color&&(t.color=n.color),n.font_size&&(t.font_size=n.font_size),n.font_family&&(t.font_family=n.font_family),n.font_weight&&(t.font_weight=n.font_weight),n.text_align&&(t.text_align=n.text_align),n.line_height&&(t.line_height=n.line_height),n.letter_spacing&&(t.letter_spacing=n.letter_spacing),n.text_transform&&(t.text_transform=n.text_transform),n.font_style&&(t.font_style=n.font_style),n.white_space&&(t.white_space=n.white_space),n.text_shadow_h&&(t.text_shadow_h=n.text_shadow_h),n.text_shadow_v&&(t.text_shadow_v=n.text_shadow_v),n.text_shadow_blur&&(t.text_shadow_blur=n.text_shadow_blur),n.text_shadow_color&&(t.text_shadow_color=n.text_shadow_color),n.box_shadow_h&&(t.box_shadow_h=n.box_shadow_h),n.box_shadow_v&&(t.box_shadow_v=n.box_shadow_v),n.box_shadow_blur&&(t.box_shadow_blur=n.box_shadow_blur),n.box_shadow_spread&&(t.box_shadow_spread=n.box_shadow_spread),n.box_shadow_color&&(t.box_shadow_color=n.box_shadow_color),n.animation_type&&(t.animation_type=n.animation_type),n.animation_entity&&(t.animation_entity=n.animation_entity),n.animation_trigger_type&&(t.animation_trigger_type=n.animation_trigger_type),n.animation_attribute&&(t.animation_attribute=n.animation_attribute),n.animation_state&&(t.animation_state=n.animation_state),n.intro_animation&&(t.intro_animation=n.intro_animation),n.outro_animation&&(t.outro_animation=n.outro_animation),n.animation_duration&&(t.animation_duration=n.animation_duration),n.animation_delay&&(t.animation_delay=n.animation_delay),n.animation_timing&&(t.animation_timing=n.animation_timing),t}renderLogicTab(e,n,t,i){return l.X.render(e,n,(e=>i(e)))}validate(e){const n=[...super.validate(e).errors];return{valid:0===n.length,errors:n}}styleObjectToCss(e){return Object.entries(e).map((([e,n])=>`${this.camelToKebab(e)}: ${n}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}getPaddingCSS(e){return e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${this.addPixelUnit(e.padding_top)||"0px"} ${this.addPixelUnit(e.padding_right)||"0px"} ${this.addPixelUnit(e.padding_bottom)||"0px"} ${this.addPixelUnit(e.padding_left)||"0px"}`:"0px"}getMarginCSS(e){return e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${this.addPixelUnit(e.margin_top)||"0"} ${this.addPixelUnit(e.margin_right)||"0"} ${this.addPixelUnit(e.margin_bottom)||"0"} ${this.addPixelUnit(e.margin_left)||"0"}`:"0"}getBackgroundCSS(e){const n=e.background_color||"";return n&&(n.includes("gradient")||n.includes("linear-")||n.includes("radial-"))?"transparent":n||"transparent"}getBackgroundImageOrGradient(e,n){const t=e.background_color||"";return t&&(t.includes("gradient")||t.includes("linear-")||t.includes("radial-"))?t:this.getBackgroundImageCSS(e,n)}getBackgroundImageCSS(e,n){var t,i;if(!e.background_image_type||"none"===e.background_image_type)return e.background_image?`url("${e.background_image}")`:"none";switch(e.background_image_type){case"upload":if(e.background_image)return`url("${(0,a.V)(n,e.background_image)}")`;break;case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==n?void 0:n.states[e.background_image_entity])){const o=n.states[e.background_image_entity];let r="";if((null===(t=o.attributes)||void 0===t?void 0:t.entity_picture)?r=o.attributes.entity_picture:(null===(i=o.attributes)||void 0===i?void 0:i.image)?r=o.attributes.image:o.state&&"string"==typeof o.state&&(o.state.startsWith("/")||o.state.startsWith("http"))&&(r=o.state),r)return`url("${(0,a.V)(n,r)}")`}}return"none"}getBorderCSS(e){const n=e.border_style&&"none"!==e.border_style;return`${this.addPixelUnit(e.border_width)||(n?"1px":"0")} ${e.border_style||"solid"} ${e.border_color||"var(--divider-color)"}`}getJustifyContent(e){switch(e){case"top":default:return"flex-start";case"center":return"center";case"bottom":return"flex-end";case"space-between":return"space-between";case"space-around":return"space-around"}}getAlignItems(e){switch(e){case"left":default:return"flex-start";case"center":return"center";case"right":return"flex-end";case"stretch":return"stretch"}}getStyles(){return'\n      /* Vertical Module Styles */\n      .vertical-module-preview {\n        /* Let flexbox handle width naturally - no forced width */\n        /* Removed min-height: 60px to prevent background color showing in empty space */\n      }\n\n      .vertical-preview-content {\n        background: transparent;\n        border-radius: 6px;\n        border: none;\n        transition: all 0.2s ease;\n        position: relative;\n      }\n\n      /* When vertical layout has actions, disable pointer events on children so container action takes precedence */\n      .vertical-preview-content[style*="cursor: pointer"] .child-module-preview {\n        pointer-events: none;\n      }\n\n      /* But allow specific interactive elements within children to still work if no parent action */\n      .vertical-preview-content:not([style*="cursor: pointer"]) .child-module-preview {\n        pointer-events: auto;\n      }\n\n      .child-module-preview {\n        background: transparent;\n        border: none;\n        border-radius: 4px;\n        padding: 0;\n        transition: all 0.2s ease;\n        /* Let flexbox handle width naturally - only constrain to prevent overflow */\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      .child-module-preview.negative-gap {\n        background: transparent !important;\n        border: none !important;\n        border-radius: 0 !important;\n        padding: 0 !important;\n      }\n\n      /* Legacy hover effects removed - now handled by new hover effects system */\n\n      .empty-layout-message {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        width: 100%;\n        padding: 20px;\n      }\n\n      .empty-layout-message span {\n        font-size: 14px;\n        font-weight: 500;\n      }\n\n      .empty-layout-message small {\n        font-size: 12px;\n        opacity: 0.8;\n      }\n\n      .unknown-child-module {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n      }\n\n      /* Scoped list-style reset to avoid stray bullet markers in preview */\n      .vertical-module-preview ul,\n      .vertical-module-preview ol {\n        list-style: none;\n        margin: 0;\n        padding: 0;\n      }\n      .vertical-module-preview li::marker {\n        content: \'\';\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n      \n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Custom Range Slider Styling */\n      input[type="range"] {\n        -webkit-appearance: none;\n        appearance: none;\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        outline: none;\n        opacity: 0.7;\n        transition: opacity 0.2s;\n      }\n\n      input[type="range"]:hover {\n        opacity: 1;\n      }\n\n      input[type="range"]::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        appearance: none;\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-webkit-slider-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-moz-range-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-track {\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        border: none;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 48px !important;\n        max-width: 48px !important;\n        min-width: 48px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    '}}}}]);