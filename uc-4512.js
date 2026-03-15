"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[4512],{4512:(e,n,t)=>{t.r(n),t.d(n,{UltraHorizontalModule:()=>h});var i=t(5183),o=t(7475),a=t(6990),r=t(5255),l=t(5262),d=t(8938),s=t(6478),c=t(230),u=t(378),p=t(361),g=t(6477);class h extends o.m{constructor(){super(...arguments),this.metadata={type:"horizontal",title:"Horizontal Layout",description:"Arrange modules in rows with flexible horizontal and vertical alignment and spacing",author:"WJD Designs",version:"1.0.0",icon:"mdi:view-column",category:"layout",tags:["layout","horizontal","vertical","alignment","container","flexbox"]}}createDefault(e,n){return{id:e||this.generateId("horizontal"),type:"horizontal",alignment:"center",vertical_alignment:void 0,gap:.7,wrap:!1,modules:[],tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,n,t,o){var a;const r=e,l=(null===(a=null==n?void 0:n.locale)||void 0===a?void 0:a.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        ${this.renderSettingsSection((0,s.kg)("editor.horizontal.layout.title",l,"Layout Configuration"),(0,s.kg)("editor.horizontal.layout.desc",l,"Configure how items are arranged horizontally within the container."),[{title:(0,s.kg)("editor.horizontal.alignment.horizontal",l,"Horizontal Alignment"),description:(0,s.kg)("editor.horizontal.alignment.horizontal_desc",l,"Choose how items are aligned horizontally within the container."),hass:n,data:r,schema:[this.selectField("alignment",[{value:"left",label:(0,s.kg)("editor.common.left",l,"Left")},{value:"center",label:(0,s.kg)("editor.common.center",l,"Center")},{value:"right",label:(0,s.kg)("editor.common.right",l,"Right")},{value:"space-between",label:(0,s.kg)("editor.common.space_between",l,"Space Between")},{value:"space-around",label:(0,s.kg)("editor.common.space_around",l,"Space Around")},{value:"justify",label:(0,s.kg)("editor.common.justify",l,"Justify")}])],onChange:e=>{e.detail.value.alignment!==r.alignment&&o(e.detail.value)}}])}
        ${this.renderSettingsSection("","",[{title:(0,s.kg)("editor.horizontal.alignment.vertical",l,"Vertical Alignment"),description:(0,s.kg)("editor.horizontal.alignment.vertical_desc",l,"Choose how items are aligned vertically within the container."),hass:n,data:r,schema:[this.selectField("vertical_alignment",[{value:"top",label:(0,s.kg)("editor.common.top",l,"Top")},{value:"center",label:(0,s.kg)("editor.common.center",l,"Center")},{value:"bottom",label:(0,s.kg)("editor.common.bottom",l,"Bottom")},{value:"stretch",label:(0,s.kg)("editor.common.stretch",l,"Stretch")},{value:"baseline",label:(0,s.kg)("editor.common.baseline",l,"Baseline")}])],onChange:e=>{var n;const t=null===(n=e.detail.value)||void 0===n?void 0:n.vertical_alignment;void 0!==t&&t!==r.vertical_alignment&&o({vertical_alignment:t})}}])}

        <!-- Allow Wrapping Toggle -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="flex: 1;">
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
              >
                ${(0,s.kg)("editor.horizontal.wrapping.title",l,"Allow Wrapping")}
              </div>
              <div
                class="field-description"
                style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
              >
                ${(0,s.kg)("editor.horizontal.wrapping.desc",l,"Allow items to wrap to the next line when they exceed the container width.")}
              </div>
            </div>
            <div style="margin-left: 16px;">
              <ha-switch
                .checked=${r.wrap||!1}
                @change=${e=>{const n=e.target;o({wrap:n.checked})}}
              ></ha-switch>
            </div>
          </div>
        </div>

        <!-- Gap Between Items Field with Custom Slider -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.horizontal.gap.title",l,"Gap Configuration")}
          </div>

          <div style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              ${(0,s.kg)("editor.horizontal.gap.between_items",l,"Gap Between Items")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${(0,s.kg)("editor.horizontal.gap.desc",l,"Set the spacing between horizontal items (in rem units). Use negative values to overlap items. Any value is allowed.")}
            </div>
            <div
              class="gap-control-container"
              style="display: flex; align-items: center; gap: 12px;"
            >
              <input
                type="range"
                class="gap-slider"
                min="-50"
                max="50"
                step="0.1"
                .value="${void 0!==r.gap?r.gap:.7}"
                @input=${e=>{const n=e.target,t=parseFloat(n.value);o({gap:t})}}
              />
              <input
                type="number"
                class="gap-input"
                style="width: 50px !important; max-width: 50px !important; min-width: 50px !important; padding: 4px 6px !important; font-size: 13px !important;"
                step="0.1"
                .value="${void 0!==r.gap?r.gap:.7}"
                @input=${e=>{const n=e.target,t=parseFloat(n.value);isNaN(t)||o({gap:t})}}
                @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const n=e.target,t=(parseFloat(n.value)||0)+("ArrowUp"===e.key?.1:-.1),i=Math.round(10*t)/10;o({gap:i})}}}
              />
              <button
                class="reset-btn"
                @click=${()=>o({gap:.7})}
                title="${(0,s.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","0.7")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    `}renderPreview(e,n,t,o){var a,r,d,u,h;const m=e;this._currentConfig=t,this._currentPreviewContext=o;const v=(null===(a=null==n?void 0:n.locale)||void 0===a?void 0:a.language)||"en",b=m,_=Object.assign(Object.assign({},b),b.design||{}),x=m.modules&&m.modules.length>0,w=void 0!==m.gap?m.gap:.7,f=m.alignment,y=void 0!==_.width&&null!==_.width&&""!==_.width?_.width:void 0,k=this.getMarginCSS(_),z=(0,g.U9)({color:_.background_color,fallback:"transparent",image:this.getBackgroundImageCSS(_,n),imageSize:_.background_size||"cover",imagePosition:_.background_position||"center",imageRepeat:_.background_repeat||"no-repeat"}),$=_.border_radius||b.border_radius||(void 0!==(null===(r=_.border)||void 0===r?void 0:r.radius)?_.border.radius:void 0)||(void 0!==(null===(d=b.border)||void 0===d?void 0:d.radius)?b.border.radius:void 0),S=Object.assign(Object.assign({padding:this.getPaddingCSS(_)},z.styles),{border:_.border_width?this.getBorderCSS(_):"none",borderRadius:this.addPixelUnit($)||"0",position:_.position||(_.z_index?"relative":"static"),zIndex:_.z_index||"auto",width:y,height:_.height||void 0,maxWidth:_.max_width||void 0,minWidth:_.min_width||void 0,maxHeight:_.max_height||void 0,boxShadow:_.box_shadow||void 0,backdropFilter:_.backdrop_filter||void 0,clipPath:_.clip_path||void 0,display:"flex",flexDirection:"row",justifyContent:f?this.getJustifyContent(f):void 0,gap:w>=0?`${w}rem`:"0",flexWrap:m.wrap?"wrap":"nowrap",alignItems:m.vertical_alignment?this.getAlignItems(m.vertical_alignment):void 0,minHeight:_.min_height||"auto",overflow:(()=>{const e=_.overflow;return e&&"visible"!==e?e:$&&"0"!==String($)&&"0px"!==String($)?"hidden":e||"visible"})(),boxSizing:"border-box"});void 0!==k&&"0"!==k&&(S.margin=k);const C=this.createGestureHandlers(m.id,{tap_action:m.tap_action,hold_action:m.hold_action,double_tap_action:m.double_tap_action,entity:m.entity,module:m},n,t),P=null===(u=m.design)||void 0===u?void 0:u.hover_effect,j=l.k.getHoverEffectClass(P),A=null===(h=m.design)||void 0===h?void 0:h.css_variable_prefix;if(A){const e=(0,p.E)(A,m.design);Object.assign(S,e)}const M=m.tap_action&&"nothing"!==m.tap_action.action||m.hold_action&&"nothing"!==m.hold_action.action||m.double_tap_action&&"nothing"!==m.double_tap_action.action;return i.qy`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="horizontal-module-preview"
        style="${S.width?`width: ${S.width};`:""}"
      >
        <div
          class="horizontal-preview-content ${j}"
          style="${this.styleObjectToCss(S)}; cursor: ${M?"pointer":"default"}; ${M?"pointer-events: auto;":""}"
          data-wrap=${m.wrap?"true":"false"}
          @pointerdown=${M?C.onPointerDown:null}
          @pointerup=${M?C.onPointerUp:null}
          @pointercancel=${M?C.onPointerCancel:null}
          @pointerleave=${M?C.onPointerLeave:null}
        >
          ${x?(()=>{c.S.setHass(n);const e=m.modules.filter((e=>{var n,t,i,o;const a=e,r=c.S.evaluateModuleVisibility(a),l=c.S.evaluateLogicProperties({logic_entity:null===(n=null==a?void 0:a.design)||void 0===n?void 0:n.logic_entity,logic_attribute:null===(t=null==a?void 0:a.design)||void 0===t?void 0:t.logic_attribute,logic_operator:null===(i=null==a?void 0:a.design)||void 0===i?void 0:i.logic_operator,logic_value:null===(o=null==a?void 0:a.design)||void 0===o?void 0:o.logic_value});return r&&l}));return e.map(((e,t)=>{const o=w<0&&t>0?`0 0 0 ${w}rem`:"0",a=w<0,r="justify"===m.alignment,l=this.childShouldFillAvailableSpace(e),d=r||l?null:this.getChildPreferredWidth(e),s=`\n                    overflow: visible;\n                    ${[r?"flex-grow: 1; flex-shrink: 1; flex-basis: 0;":"",l?"flex-grow: 1; flex-shrink: 1; flex-basis: auto; min-width: 10%;":"",r||l||!d?"":`flex: 0 0 ${d}; max-width: ${d}; width: ${d};`].filter(Boolean).join(" ")}\n                    box-sizing: border-box;\n                    margin: ${o};\n                  `,c=a?"padding: 0; border: none; background: transparent;":"";return i.qy`
                    <div
                      class="child-module-preview ${a?"negative-gap":""}"
                      data-flex-constrained="${d?"true":"false"}"
                      style="${s} ${c}"
                    >
                      ${this._renderChildModulePreview(e,n,b,this._currentConfig,this._currentPreviewContext)}
                    </div>
                  `}))})():i.qy`
                <div class="empty-layout-message">
                  <span
                    >${(0,s.kg)("editor.horizontal.empty.no_modules",v,"No modules added yet")}</span
                  >
                  <small
                    >${(0,s.kg)("editor.horizontal.empty.add_modules",v,"Add modules in the layout builder to see them here")}</small
                  >
                </div>
              `}
        </div>
      </div>
    `}_renderChildModulePreview(e,n,t,o,a){var l,d,s,p,g,h,m,v,b,_,x,w,f,y,k,z,$,S,C,P;let j=e;t&&(j=this.applyLayoutDesignToChild(e,t));const A=t;if(A&&A.alignment){const e=j;e.alignment||(e.alignment=A.alignment)}c.S.setHass(n);const M=j,U=c.S.evaluateModuleVisibility(M),L=c.S.evaluateLogicProperties({logic_entity:null===(l=null==M?void 0:M.design)||void 0===l?void 0:l.logic_entity,logic_attribute:null===(d=null==M?void 0:M.design)||void 0===d?void 0:d.logic_attribute,logic_operator:null===(s=null==M?void 0:M.design)||void 0===s?void 0:s.logic_operator,logic_value:null===(p=null==M?void 0:M.design)||void 0===p?void 0:p.logic_value});if(!U||!L)return i.qy``;const W=(0,r.oD)().getModule(j.type);if(!W)return i.qy``;const B=(null===(h=null===(g=W.metadata)||void 0===g?void 0:g.tags)||void 0===h?void 0:h.includes("pro"))||(null===(v=null===(m=W.metadata)||void 0===m?void 0:m.tags)||void 0===v?void 0:v.includes("premium"))||!1;let V=!1;const F=u.x.checkIntegrationAuth(n);if("pro"===(null===(b=null==F?void 0:F.subscription)||void 0===b?void 0:b.tier)&&"active"===(null===(_=null==F?void 0:F.subscription)||void 0===_?void 0:_.status))V=!0;else if(u.x.isAuthenticated()){const e=u.x.getCurrentUser();"pro"===(null===(x=null==e?void 0:e.subscription)||void 0===x?void 0:x.tier)&&"active"===(null===(w=null==e?void 0:e.subscription)||void 0===w?void 0:w.status)&&(V=!0)}const I=B&&!V;if(W){const e=W.renderPreview(j,n,o,a);if(I)return i.qy`
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
        `;const t=j,r=t.animation_type||(null===(f=t.design)||void 0===f?void 0:f.animation_type);if(r&&"none"!==r){const o=t.animation_duration||(null===(y=t.design)||void 0===y?void 0:y.animation_duration)||"2s",a=t.animation_delay||(null===(k=t.design)||void 0===k?void 0:k.animation_delay)||"0s",l=t.animation_timing||(null===(z=t.design)||void 0===z?void 0:z.animation_timing)||"ease",d=t.animation_entity||(null===($=t.design)||void 0===$?void 0:$.animation_entity),s=t.animation_trigger_type||(null===(S=t.design)||void 0===S?void 0:S.animation_trigger_type)||"state",c=t.animation_attribute||(null===(C=t.design)||void 0===C?void 0:C.animation_attribute),u=t.animation_state||(null===(P=t.design)||void 0===P?void 0:P.animation_state);let p=!1;if(d){if(u&&n&&n.states[d]){const e=n.states[d];p="attribute"===s&&c?String(e.attributes[c])===u:e.state===u}}else p=!0;if(p)return i.qy`
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
        <span>Unknown Module: ${j.type}</span>
      </div>
    `}applyLayoutDesignToChild(e,n){const t=Object.assign({},e);return n.color&&(t.color=n.color),n.font_size&&(t.font_size=n.font_size),n.font_family&&(t.font_family=n.font_family),n.font_weight&&(t.font_weight=n.font_weight),n.text_align&&(t.text_align=n.text_align),n.line_height&&(t.line_height=n.line_height),n.letter_spacing&&(t.letter_spacing=n.letter_spacing),n.text_transform&&(t.text_transform=n.text_transform),n.font_style&&(t.font_style=n.font_style),n.white_space&&(t.white_space=n.white_space),n.text_shadow_h&&(t.text_shadow_h=n.text_shadow_h),n.text_shadow_v&&(t.text_shadow_v=n.text_shadow_v),n.text_shadow_blur&&(t.text_shadow_blur=n.text_shadow_blur),n.text_shadow_color&&(t.text_shadow_color=n.text_shadow_color),n.box_shadow_h&&(t.box_shadow_h=n.box_shadow_h),n.box_shadow_v&&(t.box_shadow_v=n.box_shadow_v),n.box_shadow_blur&&(t.box_shadow_blur=n.box_shadow_blur),n.box_shadow_spread&&(t.box_shadow_spread=n.box_shadow_spread),n.box_shadow_color&&(t.box_shadow_color=n.box_shadow_color),n.animation_type&&(t.animation_type=n.animation_type),n.animation_entity&&(t.animation_entity=n.animation_entity),n.animation_trigger_type&&(t.animation_trigger_type=n.animation_trigger_type),n.animation_attribute&&(t.animation_attribute=n.animation_attribute),n.animation_state&&(t.animation_state=n.animation_state),n.intro_animation&&(t.intro_animation=n.intro_animation),n.outro_animation&&(t.outro_animation=n.outro_animation),n.animation_duration&&(t.animation_duration=n.animation_duration),n.animation_delay&&(t.animation_delay=n.animation_delay),n.animation_timing&&(t.animation_timing=n.animation_timing),t}renderLogicTab(e,n,t,i){return d.X.render(e,n,(e=>i(e)))}validate(e){const n=e,t=[...super.validate(e).errors];return n.vertical_alignment&&!["top","center","bottom","stretch","baseline"].includes(n.vertical_alignment)&&t.push("Vertical alignment must be one of: top, center, bottom, stretch, baseline"),{valid:0===t.length,errors:t}}styleObjectToCss(e){return Object.entries(e).filter((([,e])=>null!=e&&""!==e)).map((([e,n])=>`${this.camelToKebab(e)}: ${n}`)).join("; ")}camelToKebab(e){return e.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}childShouldFillAvailableSpace(e){var n,t,i,o,a,r,l,d;if("justify"===e.alignment)return!0;if("separator"===e.type){const i=e;if("vertical"===(i.orientation||"horizontal"))return!1;const o=[i.width_percent,i.width,null===(n=null==i?void 0:i.design)||void 0===n?void 0:n.width,null===(t=null==i?void 0:i.design)||void 0===t?void 0:t.width_percent];for(const e of o){if(null==e||""===e)continue;const n=this.normalizeSizeValue(e);if(n)if("%"===n.unit){if(n.value>=100)return!0}else if("px"===n.unit)return!1}return!(void 0!==i.width_percent||void 0!==i.width||i.design&&(void 0!==i.design.width||void 0!==i.design.width_percent))}if("bar"===e.type){const n=e,t=[null===(i=null==n?void 0:n.design)||void 0===i?void 0:i.width,null===(o=null==n?void 0:n.design)||void 0===o?void 0:o.width_percent,null==n?void 0:n.width,null==n?void 0:n.width_percent].find((e=>null!=e&&""!==String(e).trim()));if(null!=t){const e=this.normalizeSizeValue(t);if(e){if("%"===e.unit&&e.value>=100){const e=null!==(r=null===(a=null==n?void 0:n.design)||void 0===a?void 0:a.max_width)&&void 0!==r?r:null==n?void 0:n.max_width,t=null!=e&&""!==String(e).trim()?this.normalizeSizeValue(e):null;return!t||"%"===t.unit&&t.value>=100}return!1}}const s=this.normalizeSizeValue(void 0!==n.bar_width&&null!==n.bar_width?n.bar_width:100);if(!s)return!0;if("%"===s.unit&&s.value>=100){const e=null!==(d=null===(l=null==n?void 0:n.design)||void 0===l?void 0:l.max_width)&&void 0!==d?d:null==n?void 0:n.max_width,t=null!=e&&""!==String(e).trim()?this.normalizeSizeValue(e):null;return!t||"%"===t.unit&&t.value>=100}return!1}return!1}getChildPreferredWidth(e){var n,t,i,o;if("bar"===e.type){const o=e,a=[null===(n=null==o?void 0:o.design)||void 0===n?void 0:n.width,null===(t=null==o?void 0:o.design)||void 0===t?void 0:t.width_percent,null==o?void 0:o.width,null==o?void 0:o.width_percent];for(const e of a){if(null==e||""===String(e).trim())continue;const n=this.normalizeSizeValue(e);if(n){if("%"===n.unit&&n.value<100)return`${Math.max(1,Math.min(100,n.value))}%`;if("px"===n.unit)return`${Math.max(0,n.value)}px`}}const r=this.normalizeSizeValue(null!==(i=o.bar_width)&&void 0!==i?i:100);if(r){if("%"===r.unit&&r.value<100)return`${Math.max(1,Math.min(100,r.value))}%`;if("px"===r.unit)return`${Math.max(0,r.value)}px`}}if("separator"===e.type){const n=e,t=[null===(o=null==n?void 0:n.design)||void 0===o?void 0:o.width,null==n?void 0:n.width_percent];for(const e of t){if(null==e||""===String(e).trim())continue;const n=this.normalizeSizeValue(e);if(n){if("%"===n.unit&&n.value<100)return`${Math.max(1,Math.min(100,n.value))}%`;if("px"===n.unit)return`${Math.max(0,n.value)}px`}}}return null}normalizeSizeValue(e){if("number"==typeof e)return{value:e,unit:"%"};const n=String(e).trim();if(!n)return null;if(n.endsWith("%")){const e=parseFloat(n.slice(0,-1));return Number.isNaN(e)?null:{value:e,unit:"%"}}if(n.endsWith("px")){const e=parseFloat(n.slice(0,-2));return Number.isNaN(e)?null:{value:e,unit:"px"}}const t=parseFloat(n);return Number.isNaN(t)?null:{value:t,unit:"%"}}addPixelUnit(e){return e?/^\d+$/.test(e)?`${e}px`:/^[\d\s]+$/.test(e)?e.split(" ").map((e=>e.trim()?`${e}px`:e)).join(" "):e:e}getPaddingCSS(e){return e.padding_top||e.padding_bottom||e.padding_left||e.padding_right?`${this.addPixelUnit(e.padding_top)||"0px"} ${this.addPixelUnit(e.padding_right)||"0px"} ${this.addPixelUnit(e.padding_bottom)||"0px"} ${this.addPixelUnit(e.padding_left)||"0px"}`:"0"}getMarginCSS(e){return e.margin_top||e.margin_bottom||e.margin_left||e.margin_right?`${this.addPixelUnit(e.margin_top)||"0"} ${this.addPixelUnit(e.margin_right)||"0"} ${this.addPixelUnit(e.margin_bottom)||"0"} ${this.addPixelUnit(e.margin_left)||"0"}`:"0"}getBackgroundCSS(e){return e.background_color||"transparent"}getBackgroundImageCSS(e,n){var t,i;if(!e.background_image_type||"none"===e.background_image_type)return e.background_image?`url("${e.background_image}")`:"none";switch(e.background_image_type){case"upload":if(e.background_image)return`url("${(0,a.V)(n,e.background_image)}")`;break;case"url":if(e.background_image)return`url("${e.background_image}")`;break;case"entity":if(e.background_image_entity&&(null==n?void 0:n.states[e.background_image_entity])){const o=n.states[e.background_image_entity];let r="";if((null===(t=o.attributes)||void 0===t?void 0:t.entity_picture)?r=o.attributes.entity_picture:(null===(i=o.attributes)||void 0===i?void 0:i.image)?r=o.attributes.image:o.state&&"string"==typeof o.state&&(o.state.startsWith("/")||o.state.startsWith("http"))&&(r=o.state),r)return`url("${(0,a.V)(n,r)}")`}}return"none"}getBorderCSS(e){return`${this.addPixelUnit(e.border_width)||"0"} ${e.border_style||"solid"} ${e.border_color||"transparent"}`}getJustifyContent(e){switch(e){case"left":default:return"flex-start";case"center":return"center";case"right":return"flex-end";case"space-between":case"justify":return"space-between";case"space-around":return"space-around"}}getAlignItems(e){switch(e){case"top":default:return"flex-start";case"center":return"center";case"bottom":return"flex-end";case"stretch":return"stretch";case"baseline":return"baseline"}}getStyles(){return'\n      /* Horizontal Module Styles */\n      .horizontal-module-preview {\n        /* Let flexbox handle width naturally - no forced width */\n        /* No forced min-height - let content and user design properties control height */\n      }\n\n      .horizontal-preview-content {\n        background: transparent;\n        border-radius: 6px;\n        border: none;\n        transition: all 0.2s ease;\n        position: relative;\n      }\n\n      /* When horizontal layout has actions, disable pointer events on children so container action takes precedence */\n      .horizontal-preview-content[style*="cursor: pointer"] .child-module-preview {\n        pointer-events: none;\n      }\n\n      /* But allow specific interactive elements within children to still work if no parent action */\n      .horizontal-preview-content:not([style*="cursor: pointer"]) .child-module-preview {\n        pointer-events: auto;\n      }\n\n      .child-module-preview {\n        background: transparent;\n        border: none;\n        border-radius: 4px;\n        padding: 0;\n        transition: all 0.2s ease, transform 0.3s ease;\n        /* Child modules should respect parent container bounds */\n        min-height: 0;\n        overflow: visible;\n        box-sizing: border-box;\n      }\n\n      /* Ensure external card wrappers handle scaling properly */\n      .child-module-preview:has(.external-card-container) {\n        overflow: visible;\n        transform-origin: center center;\n      }\n\n      .child-module-preview.negative-gap {\n        background: transparent !important;\n        border: none !important;\n        border-radius: 0 !important;\n        padding: 0 !important;\n      }\n\n      /* Legacy hover effects removed - now handled by new hover effects system */\n\n      .empty-layout-message {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 4px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        width: 100%;\n        padding: 20px;\n      }\n\n      .empty-layout-message span {\n        font-size: 14px;\n        font-weight: 500;\n      }\n\n      .empty-layout-message small {\n        font-size: 12px;\n        opacity: 0.8;\n      }\n\n      .unknown-child-module {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n      }\n\n      /* Icon modules - let them size naturally, only prevent overflow */\n      .child-module-preview .icon-module-preview {\n        max-width: 100%;\n      }\n\n      .child-module-preview .icon-module-container {\n        /* Let flexbox handle sizing naturally */\n        max-width: 100%;\n      }\n\n      .child-module-preview .bar-module-preview {\n        /* Bars expand via flex-grow, only prevent overflow */\n        max-width: 100%;\n      }\n\n      /* When wrapping is enabled, allow items to shrink naturally */\n      /* flex-shrink: 1 is already the default, so we don\'t need to set it */\n      .horizontal-preview-content[data-wrap="true"] .child-module-preview {\n        min-width: 0; /* Allow text truncation */\n      }\n\n      /* When wrapping is disabled, items can shrink to fit */\n      /* flex-shrink: 1 is already the default, so we don\'t need to set it */\n      .horizontal-preview-content:not([data-wrap="true"]) .child-module-preview {\n        min-width: 0; /* Allow text truncation */\n      }\n\n      /* CRITICAL: Minimal constraints for nested layout modules - prevent overflow only */\n      /* Like WPBakery, we only use max-width: 100% to prevent overflow, let flexbox handle sizing */\n      .child-module-preview .horizontal-module-preview,\n      .child-module-preview .vertical-module-preview,\n      .child-module-preview .slider-module {\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Ensure images and media elements don\'t overflow (like WPBakery does) */\n      .child-module-preview img,\n      .child-module-preview .image-module-container,\n      .child-module-preview .image-module-preview {\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n        \n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Custom Range Slider Styling */\n      input[type="range"] {\n        -webkit-appearance: none;\n        appearance: none;\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        outline: none;\n        opacity: 0.7;\n        transition: opacity 0.2s;\n      }\n\n      input[type="range"]:hover {\n        opacity: 1;\n      }\n\n      input[type="range"]::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        appearance: none;\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-webkit-slider-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n        transition: all 0.2s ease;\n      }\n\n      input[type="range"]::-moz-range-thumb:hover {\n        transform: scale(1.1);\n        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);\n      }\n\n      input[type="range"]::-moz-range-track {\n        height: 6px;\n        border-radius: 3px;\n        background: var(--disabled-color);\n        border: none;\n      }\n\n      /* Gap control styles */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 48px !important;\n        max-width: 48px !important;\n        min-width: 48px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    '}}}}]);