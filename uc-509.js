"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[509],{509:(t,e,o)=>{o.r(e),o.d(e,{UltraTextModule:()=>h});var i=o(5183),n=o(7475),r=o(8869),a=o(766),l=o(5147),s=o(8938),d=o(5320),c=o(5262),p=o(6477),m=o(6478),_=o(9327),u=o(5121),g=o(5155);o(7921),o(9654);class h extends n.m{constructor(){super(...arguments),this.metadata={type:"text",title:"Text Module",description:"Display custom text content",author:"WJD Designs",version:"1.0.0",icon:"mdi:format-text",category:"content",tags:["text","content","typography","template"]},this.clickTimeout=null,this._templateInputDebounce=null,this.holdTimeout=null,this.isHolding=!1}createDefault(t,e){return{id:t||this.generateId("text"),type:"text",text:"Sample Text",link:"",hide_if_no_link:!1,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},icon:"",icon_color:"",icon_position:"before",template_mode:!1,template:"",unified_template_mode:!1,unified_template:"",enable_hover_effect:!0,hover_background_color:"var(--divider-color)",text_size:16,design:{},display_mode:"always",display_conditions:[]}}renderGeneralTab(t,e,o,n){var r;const l=t,s=(null===(r=null==e?void 0:e.locale)||void 0===r?void 0:r.language)||"en";return i.qy`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Module-Wide Size Controls -->
        <div class="settings-section" style="margin-bottom: 32px;">
          <div class="section-title">SIZE CONTROLS</div>
          <div class="section-description" style="margin-bottom: 16px;">
            Control the default sizes for this module. Design tab overrides these settings.
          </div>
          
          <!-- Text Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title">Text Size (${l.text_size||16}px)</div>
            <div class="field-description">Default size for text content</div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="10"
                max="48"
                step="1"
                .value="${String(l.text_size||16)}"
                @input=${t=>{const e=t.target;n({text_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
              />
              <input
                type="number"
                class="gap-input"
                min="10"
                max="100"
                step="1"
                .value="${String(l.text_size||16)}"
                @input=${t=>{const e=t.target,o=Number(e.value);isNaN(o)||(n({text_size:o}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=Number(e.value)||16,i="ArrowUp"===t.key?1:-1,r=Math.max(10,Math.min(100,o+i));n({text_size:r}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
              />
              <button
                class="reset-btn"
                @click=${()=>{n({text_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                title="${(0,m.kg)("editor.fields.reset_default_value",s,"Reset to default ({value})").replace("{value}","16")}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Icon Size Control (only shown when icon is configured) -->
          ${l.icon&&""!==l.icon.trim()?i.qy`
                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">Icon Size (${l.icon_size||24}px)</div>
                  <div class="field-description">Size of the icon</div>
                  <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
                    <input
                      type="range"
                      class="gap-slider"
                      min="12"
                      max="64"
                      step="1"
                      .value="${String(l.icon_size||24)}"
                      @input=${t=>{const e=t.target;n({icon_size:Number(e.value)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                    />
                    <input
                      type="number"
                      class="gap-input"
                      min="12"
                      max="100"
                      step="1"
                      .value="${String(l.icon_size||24)}"
                      @input=${t=>{const e=t.target,o=Number(e.value);isNaN(o)||(n({icon_size:o}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,o=Number(e.value)||24,i="ArrowUp"===t.key?1:-1,r=Math.max(12,Math.min(100,o+i));n({icon_size:r}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
                    />
                    <button
                      class="reset-btn"
                      @click=${()=>{n({icon_size:void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      title="${(0,m.kg)("editor.fields.reset_default_value",s,"Reset to default ({value})").replace("{value}","24")}"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Content Configuration -->
        <!-- Content Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,m.kg)("editor.text.content_section.title",s,"Content Configuration")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,m.kg)("editor.text.content_section.desc",s,"Configure the text content and basic settings for this module.")}
          </div>
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${(0,m.kg)("editor.text.text_content",s,"Text Content")}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,m.kg)("editor.text.text_content_desc",s,"Enter the text content to display in this module.")}
          </div>
          <ha-textfield
            .value=${l.text||""}
            placeholder="Enter text content"
            @input=${t=>{var e;const o=t.target,i=(null===(e=o.shadowRoot)||void 0===e?void 0:e.querySelector("input"))||o,r=o.value,a=i.selectionStart,l=i.selectionEnd;n({text:r}),requestAnimationFrame((()=>{i&&"number"==typeof a&&(o.value=r,i.value=r,i.setSelectionRange(a,l||a))})),setTimeout((()=>{i&&"number"==typeof a&&(o.value=r,i.value=r,i.setSelectionRange(a,l||a))}),0),setTimeout((()=>{i&&"number"==typeof a&&(o.value=r,i.value=r,i.setSelectionRange(a,l||a))}),10)}}
            style="width: 100%; --mdc-theme-primary: var(--primary-color);"
          ></ha-textfield>
        </div>

        <!-- Icon Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,m.kg)("editor.text.icon_section.title",s,"Icon Configuration")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,m.kg)("editor.text.icon_section.desc",s,"Choose an icon to display alongside the text content.")}
          </div>

          ${a.U.renderFieldSection((0,m.kg)("editor.text.icon",s,"Icon"),(0,m.kg)("editor.text.icon_desc",s,"Choose an icon to display alongside the text. Leave empty for no icon."),e,{icon:l.icon||""},[this.iconField("icon")],(t=>n(t.detail.value)))}
          ${l.icon&&""!==l.icon.trim()?i.qy`
                <div style="margin-top: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    ${(0,m.kg)("editor.text.icon_position",s,"Icon Position")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                  >
                    ${(0,m.kg)("editor.text.icon_position_desc",s,"Choose where to position the icon relative to the text.")}
                  </div>
                  <div
                    style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                  >
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"before"===(l.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"before"===(l.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"before"===(l.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>n({icon_position:"before"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-left"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >${(0,m.kg)("editor.text.before_text",s,"Before Text")}</span
                      >
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${"after"===(l.icon_position||"before")?"var(--primary-color)":"var(--divider-color)"}; background: ${"after"===(l.icon_position||"before")?"var(--primary-color)":"transparent"}; color: ${"after"===(l.icon_position||"before")?"white":"var(--primary-text-color)"}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                      @click=${()=>n({icon_position:"after"})}
                    >
                      <ha-icon
                        icon="mdi:format-align-right"
                        style="font-size: 16px; flex-shrink: 0;"
                      ></ha-icon>
                      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        >${(0,m.kg)("editor.text.after_text",s,"After Text")}</span
                      >
                    </button>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Color Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,m.kg)("editor.text.color_section.title",s,"Color Configuration")}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,m.kg)("editor.text.color_section.desc",s,"Configure the text and icon colors for this module.")}
          </div>

          <!-- Text Color -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${(0,m.kg)("editor.text.text_color",s,"Text Color")}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
            >
              ${(0,m.kg)("editor.text.text_color_desc",s,"Choose the color for the text content.")}
            </div>
            <ultra-color-picker
              .value=${l.color||""}
              .defaultValue=${"var(--primary-text-color)"}
              .hass=${e}
              @value-changed=${t=>n({color:t.detail.value})}
            ></ultra-color-picker>
          </div>

          <!-- Icon Color (only show if icon is selected) -->
          ${l.icon&&""!==l.icon.trim()?i.qy`
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
                    <div class="field-container">
                      <div
                        class="field-title"
                        style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                      >
                        ${(0,m.kg)("editor.text.icon_color",s,"Icon Color")}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
                      >
                        ${(0,m.kg)("editor.text.icon_color_desc",s,"Choose the color for the icon.")}
                      </div>
                      <ultra-color-picker
                        .value=${l.icon_color||""}
                        .defaultValue=${"var(--primary-color)"}
                        .hass=${e}
                        @value-changed=${t=>n({icon_color:t.detail.value})}
                      ></ultra-color-picker>
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Template Configuration -->
        <div
          class="settings-section template-mode-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${(0,m.kg)("editor.text.template_mode",s,"Template Mode")}
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${(0,m.kg)("editor.text.template_mode_desc",s,"Use Home Assistant templating syntax to render text")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{template_mode:l.template_mode||!1}}
              .schema=${[{name:"template_mode",label:(0,m.kg)("editor.text.template_mode",s,"Template Mode"),description:(0,m.kg)("editor.text.template_mode_desc",s,"Use Home Assistant templating syntax to render text"),selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>n({template_mode:t.detail.value.template_mode})}
            ></ha-form>
          </div>

          ${l.template_mode?i.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${(0,m.kg)("editor.text.value_template",s,"Value Template")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                  >
                    ${(0,m.kg)("editor.text.value_template_desc",s,"Template to render the text using Jinja2 syntax")}
                  </div>
                  <div
                    @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                    @dragstart=${t=>t.stopPropagation()}
                  >
                    <ultra-template-editor
                      .hass=${e}
                      .value=${l.template||""}
                      .placeholder=${"{{ states('sensor.example') }}"}
                      .minHeight=${100}
                      .maxHeight=${300}
                      @value-changed=${t=>{n({template:t.detail.value})}}
                    ></ultra-template-editor>
                  </div>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${(0,m.kg)("editor.text.examples_title",s,"Common Examples:")}
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.example') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,m.kg)("editor.text.example_basic",s,"Basic value")}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.example') | int(default=0) }}%
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,m.kg)("editor.text.example_percent",s,"With percent")}
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Text Alignment moved to Design tab per spec -->
      </div>
    `}renderActionsTab(t,e,o,i){return l.A.render(t,e,(t=>i(t)))}renderPreview(t,e,o,n){var r,a,s,h,v;const x=t,f=(null===(r=null==e?void 0:e.locale)||void 0===r?void 0:r.language)||"en";if(!(x.template_mode||x.text&&""!==x.text.trim()))return this.renderGradientErrorState("Enter Text Content","Add text in the General tab","mdi:format-text");if(x.template_mode&&(!x.template||""===x.template.trim()))return this.renderGradientErrorState("Configure Template","Enter template code in the General tab","mdi:code-braces");if(x.hide_if_no_link&&!this.hasActiveLink(x))return i.qy`<div class="text-module-hidden">
        ${(0,m.kg)("editor.text.hidden_no_link",f,"Hidden (no link)")}
      </div>`;const b=x,y=x.design||{},w=(()=>{const t=y.text_align;if(t&&"inherit"!==t)return t;const e=b.text_align;return e&&"inherit"!==e?e:b.alignment&&"inherit"!==b.alignment?b.alignment:"center"})();let $,k=x.text||"Sample Text";const S=Object.assign(Object.assign({fontSize:(()=>y.font_size&&"string"==typeof y.font_size&&""!==y.font_size.trim()?/[a-zA-Z%]/.test(y.font_size)?y.font_size:this.addPixelUnit(y.font_size)||y.font_size:void 0!==b.font_size?`${b.font_size}px`:void 0!==x.text_size?`${x.text_size}px`:"clamp(18px, 4vw, 26px)")(),fontFamily:y.font_family||b.font_family||"inherit",color:y.color||$||x.color||"inherit",textAlign:w,fontWeight:y.font_weight?y.font_weight:void 0!==b.font_weight?b.font_weight:"700",fontStyle:y.font_style||b.font_style||"inherit",textTransform:y.text_transform?y.text_transform:void 0!==b.text_transform?b.text_transform:"uppercase",textDecoration:"none",lineHeight:y.line_height||b.line_height||"inherit",letterSpacing:y.letter_spacing||b.letter_spacing||"inherit"},void 0!==y.white_space||void 0!==b.white_space?{whiteSpace:y.white_space||b.white_space||"normal"}:{}),{margin:"0",display:"flex",alignItems:"center",justifyContent:{left:"flex-start",center:"center",right:"flex-end",justify:"flex-start"}[w]||"center",gap:"8px",width:"100%",textShadow:y.text_shadow_h&&y.text_shadow_v?`${y.text_shadow_h||"0"} ${y.text_shadow_v||"0"} ${y.text_shadow_blur||"0"} ${y.text_shadow_color||"rgba(0,0,0,0.5)"}`:b.text_shadow_h&&b.text_shadow_v?`${b.text_shadow_h||"0"} ${b.text_shadow_v||"0"} ${b.text_shadow_blur||"0"} ${b.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none",boxShadow:y.box_shadow_h&&y.box_shadow_v?`${y.box_shadow_h||"0"} ${y.box_shadow_v||"0"} ${y.box_shadow_blur||"0"} ${y.box_shadow_spread||"0"} ${y.box_shadow_color||"rgba(0,0,0,0.1)"}`:b.box_shadow_h&&b.box_shadow_v?`${b.box_shadow_h||"0"} ${b.box_shadow_v||"0"} ${b.box_shadow_blur||"0"} ${b.box_shadow_spread||"0"} ${b.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"}),T=x.icon?i.qy`<ha-icon
          icon="${x.icon}"
          style="color: ${x.icon_color||"var(--primary-color)"}; --mdc-icon-size: ${x.icon_size||24}px;"
        ></ha-icon>`:"";if(x.unified_template_mode&&x.unified_template){if(!this._templateService&&e&&(this._templateService=new d.I(e)),e){const t=(0,g.KD)(x.unified_template,e,o);e.__uvc_template_strings||(e.__uvc_template_strings={});const i=this._hashString(t),n=`unified_text_${x.id}_${i}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(n)){const i=(0,_.pL)("",e,{text:x.text});this._templateService.subscribeToTemplate(t,n,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),i,o)}const r=null===(a=e.__uvc_template_strings)||void 0===a?void 0:a[n];if(r&&""!==String(r).trim()){const t=(0,u.cv)(r);(0,u.HD)(t)||(void 0!==t.content&&(k=t.content),t.color&&($=t.color))}}}else if(x.template_mode&&x.template&&(!this._templateService&&e&&(this._templateService=new d.I(e)),e)){const t=(0,g.KD)(x.template,e,o);e.__uvc_template_strings||(e.__uvc_template_strings={});const i=`state_text_text_${this._hashString(t)}`;this._templateService&&!this._templateService.hasTemplateSubscription(i)&&this._templateService.subscribeToTemplate(t,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,o);const n=null===(s=e.__uvc_template_strings)||void 0===s?void 0:s[i];k=void 0!==n&&""!==String(n).trim()?String(n):"Template Error: Invalid or incomplete template"}const z=i.qy`<span>${k}</span>`;let C;C="before"!==x.icon_position&&x.icon_position?"after"===x.icon_position?i.qy`${z}${T}`:z:i.qy`${T}${z}`;const A=this.hasActiveLink(x)?i.qy`<div
          class="${l.A.getClickableClass(x)}"
          style="${l.A.getClickableStyle(x)}"
          @click=${t=>this.handleClick(t,x,e,o)}
          @dblclick=${t=>this.handleDoubleClick(t,x,e)}
          @mousedown=${t=>this.handleMouseDown(t,x,e)}
          @mouseup=${t=>this.handleMouseUp(t,x,e)}
          @mouseleave=${t=>this.handleMouseLeave(t,x,e)}
          @touchstart=${t=>this.handleTouchStart(t,x,e)}
          @touchend=${t=>this.handleTouchEnd(t,x,e)}
        >
          ${C}
        </div>`:C;let U="";if(x.unified_template_mode&&x.unified_template&&(!this._templateService&&e&&(this._templateService=new d.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(x.unified_template),i=`unified_text_${x.id}_${t}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(i)){const t=(0,_.pL)("",e,{text:x.text});this._templateService.subscribeToTemplate(x.unified_template,i,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),t,o)}const n=null===(h=e.__uvc_template_strings)||void 0===h?void 0:h[i];if(n&&""!==String(n).trim()){const t=(0,u.cv)(n);!(0,u.HD)(t)&&t.container_background_color&&(U=t.container_background_color)}}const D={padding:y.padding_top||y.padding_bottom||y.padding_left||y.padding_right||b.padding_top||b.padding_bottom||b.padding_left||b.padding_right?`${this.addPixelUnit(y.padding_top||b.padding_top)||"0px"} ${this.addPixelUnit(y.padding_right||b.padding_right)||"0px"} ${this.addPixelUnit(y.padding_bottom||b.padding_bottom)||"0px"} ${this.addPixelUnit(y.padding_left||b.padding_left)||"0px"}`:"0",margin:y.margin_top||y.margin_bottom||y.margin_left||y.margin_right||b.margin_top||b.margin_bottom||b.margin_left||b.margin_right?`${y.margin_top||b.margin_top||"8px"} ${y.margin_right||b.margin_right||"0px"} ${y.margin_bottom||b.margin_bottom||"8px"} ${y.margin_left||b.margin_left||"0px"}`:"8px 0",border:(y.border_style||b.border_style)&&"none"!==(y.border_style||b.border_style)?`${y.border_width||b.border_width||"1px"} ${y.border_style||b.border_style} ${y.border_color||b.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(y.border_radius||b.border_radius)||"inherit",position:y.position||b.position||"static",top:y.top||b.top||"auto",bottom:y.bottom||b.bottom||"auto",left:y.left||b.left||"auto",right:y.right||b.right||"auto",zIndex:y.z_index||b.z_index||"auto",width:y.width||b.width||"auto",height:y.height||b.height||"auto",maxWidth:y.max_width||b.max_width||"none",maxHeight:y.max_height||b.max_height||"none",minWidth:y.min_width||b.min_width||"auto",minHeight:y.min_height||b.min_height||"auto",overflow:y.overflow||b.overflow||"visible",clipPath:y.clip_path||b.clip_path||"none",backdropFilter:y.backdrop_filter||b.backdrop_filter||"none",boxShadow:y.box_shadow_h&&y.box_shadow_v?`${y.box_shadow_h||"0"} ${y.box_shadow_v||"0"} ${y.box_shadow_blur||"0"} ${y.box_shadow_spread||"0"} ${y.box_shadow_color||"rgba(0,0,0,0.1)"}`:b.box_shadow_h&&b.box_shadow_v?`${b.box_shadow_h||"0"} ${b.box_shadow_v||"0"} ${b.box_shadow_blur||"0"} ${b.box_shadow_spread||"0"} ${b.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},{styles:H}=(0,p.U9)({color:U||y.background_color||b.background_color,fallback:b.background_color||"inherit",image:this.getBackgroundImageCSS(Object.assign(Object.assign({},b),y),e),imageSize:y.background_size||b.background_size||"cover",imagePosition:y.background_position||b.background_position||"center",imageRepeat:y.background_repeat||b.background_repeat||"no-repeat"});Object.assign(D,H);const I=null===(v=b.design)||void 0===v?void 0:v.hover_effect,j=c.k.getHoverEffectClass(I);return i.qy`
      <div
        class="text-module-container ${j}"
        style=${this.styleObjectToCss(D)}
      >
        <div class="text-module-preview" style=${this.styleObjectToCss(S)}>${A}</div>
      </div>
    `}renderLogicTab(t,e,o,i){return s.X.render(t,e,(t=>i(t)))}validate(t){const e=t,o=[...super.validate(t).errors];if(e.icon&&""!==e.icon.trim()&&(e.icon.includes(":")||o.push('Icon must be in format "mdi:icon-name" or "hass:icon-name"')),e.link&&""!==e.link.trim())try{new URL(e.link)}catch(t){e.link.startsWith("/")||e.link.startsWith("#")||o.push('Link must be a valid URL or start with "/" for relative paths')}return e.tap_action&&"default"!==e.tap_action.action&&"nothing"!==e.tap_action.action&&o.push(...this.validateAction(e.tap_action)),e.hold_action&&"default"!==e.hold_action.action&&"nothing"!==e.hold_action.action&&o.push(...this.validateAction(e.hold_action)),e.double_tap_action&&"default"!==e.double_tap_action.action&&"nothing"!==e.double_tap_action.action&&o.push(...this.validateAction(e.double_tap_action)),{valid:0===o.length,errors:o}}hasActiveLink(t){const e=t.link&&""!==t.link.trim(),o=t.tap_action&&"default"!==t.tap_action.action&&"nothing"!==t.tap_action.action,i=t.hold_action&&"default"!==t.hold_action.action&&"nothing"!==t.hold_action.action,n=t.double_tap_action&&"default"!==t.double_tap_action.action&&"nothing"!==t.double_tap_action.action;return e||o||i||n}validateAction(t){const e=[];switch(t.action){case"more-info":case"toggle":t.entity||e.push(`Entity is required for ${t.action} action`);break;case"navigate":t.navigation_path||e.push("Navigation path is required for navigate action");break;case"url":t.url_path||e.push("URL path is required for url action");break;case"perform-action":t.perform_action||t.service||e.push("Action is required for perform-action")}return e}handleClick(t,e,o,i){t.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(t,e,o,i)}),300)}handleDoubleClick(t,e,o,i){t.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(t,e,o,i)}handleMouseDown(t,e,o,i){this.startHold(t,e,o,i)}handleMouseUp(t,e,o){this.endHold(t,e,o)}handleMouseLeave(t,e,o){this.endHold(t,e,o)}handleTouchStart(t,e,o,i){this.startHold(t,e,o,i)}handleTouchEnd(t,e,o){this.endHold(t,e,o)}startHold(t,e,o,i){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(t,e,o,i)}),500)}endHold(t,e,o){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTapAction(t,e,o,i){this.isHolding||(e.link&&""!==e.link.trim()?e.link.startsWith("http")||e.link.startsWith("https")?window.open(e.link,"_blank"):window.location.href=e.link:e.tap_action&&"default"!==e.tap_action.action&&"nothing"!==e.tap_action.action&&r.K.handleAction(e.tap_action,o,t.target,i,e.entity,e))}handleDoubleAction(t,e,o,i){e.double_tap_action&&"default"!==e.double_tap_action.action&&"nothing"!==e.double_tap_action.action&&r.K.handleAction(e.double_tap_action,o,t.target,i,e.entity,e)}handleHoldAction(t,e,o,i){e.hold_action&&"default"!==e.hold_action.action&&"nothing"!==e.hold_action.action&&r.K.handleAction(e.hold_action,o,t.target,i,e.entity,e)}getStyles(){return`\n      .text-module-preview {\n        min-height: 20px;\n        word-wrap: break-word;\n      }\n      \n      .text-module-hidden {\n        color: var(--secondary-text-color);\n        font-style: italic;\n        text-align: center;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 4px;\n      }\n      \n      /* Field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n \n        margin-bottom: 4px !important;\n        display: block !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        display: block !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      .settings-section {\n        margin-bottom: 16px;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Conditional Fields Grouping CSS */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-group:hover {\n        background: rgba(var(--rgb-primary-color), 0.12);\n      }\n\n      .conditional-fields-header {\n        background: rgba(var(--rgb-primary-color), 0.15);\n        padding: 12px 16px;\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      .conditional-fields-content > .field-title:first-child {\n        margin-top: 0 !important;\n      }\n\n      @keyframes slideInFromLeft {\n        from { \n          opacity: 0; \n          transform: translateX(-10px); \n        }\n        to { \n          opacity: 1; \n          transform: translateX(0); \n        }\n      }\n\n      /* Icon picker specific styling */\n      ha-icon-picker {\n        --ha-icon-picker-width: 100%;\n        --ha-icon-picker-height: 56px;\n      }\n\n      /* Text field and select consistency */\n      ha-textfield,\n      ha-select {\n        --mdc-shape-small: 8px;\n        --mdc-theme-primary: var(--primary-color);\n      }\n\n      code {\n        background: var(--secondary-background-color);\n        padding: 2px 6px;\n        border-radius: 4px;\n        font-family: 'Courier New', monospace;\n        font-size: 0.9em;\n        color: var(--primary-color);\n      }\n\n      /* Clickable text hover styles */\n      ${l.A.getHoverStyles()}\n    `}getBackgroundImageCSS(t,e){const o=t.background_image_type,i=t.background_image,n=t.background_image_entity;switch(o){case"upload":if(i)return i.startsWith("/api/image/serve/")?`url("${this.getImageUrl(e,i)}")`:(i.startsWith("data:image/"),`url("${i}")`);break;case"entity":if(n&&e){const t=e.states[n];if(t){const e=t.attributes.entity_picture||t.attributes.image||t.state;if(e&&"unknown"!==e&&"unavailable"!==e)return`url("${e}")`}}break;case"url":if(i)return`url("${i}")`;break;default:return"none"}return"none"}getImageUrl(t,e){if(!e)return"";if(e.startsWith("http"))return e;if(e.startsWith("data:image/"))return e;if(e.includes("/api/image/serve/")){const o=e.match(/\/api\/image\/serve\/([^\/]+)/);if(o&&o[1]){const i=o[1];try{return`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}/api/image/serve/${i}/original`}catch(t){return e}}return e}return e.startsWith("/")?`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${e}`:e}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}_hashString(t){let e=0;for(let o=0;o<t.length;o+=1)e=(e<<5)-e+t.charCodeAt(o),e|=0;return Math.abs(e)}}},5121:(t,e,o)=>{function i(t){if(null==t)return{_error:"Template returned undefined or null"};if("object"==typeof t&&!Array.isArray(t)){const e={};if(void 0!==t.icon&&(e.icon=String(t.icon).trim()),void 0!==t.icon_color&&(e.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(e.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(e.name=String(t.name).trim()),void 0!==t.name_color&&(e.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(e.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(e.state_color=String(t.state_color).trim()),void 0!==t.content&&(e.content=String(t.content).trim()),void 0!==t.color&&(e.color=String(t.color).trim()),void 0!==t.value&&(e.value=t.value),void 0!==t.label&&(e.label=String(t.label).trim()),void 0!==t.gauge_color&&(e.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(e.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(e.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(e.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const o="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(o)||(e.pie_fill=o)}return void 0!==t.button_background_color&&(e.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(e.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(e.value_color=String(t.value_color).trim()),void 0!==t.entity&&(e.entity=String(t.entity).trim()),void 0!==t.visible&&(e.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(e.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(e.overlay_color=String(t.overlay_color).trim()),e}const e=String(t).trim();if(""===e)return{_error:"Template returned empty string"};if(e.startsWith("{")&&e.endsWith("}")||e.startsWith("[")&&e.endsWith("]"))try{const t=JSON.parse(e);if("object"!=typeof t||Array.isArray(t))return{_error:"Template must return an object, not an array"};const o={};if(void 0!==t.icon&&(o.icon=String(t.icon).trim()),void 0!==t.icon_color&&(o.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(o.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(o.name=String(t.name).trim()),void 0!==t.name_color&&(o.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(o.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(o.state_color=String(t.state_color).trim()),void 0!==t.content&&(o.content=String(t.content).trim()),void 0!==t.color&&(o.color=String(t.color).trim()),void 0!==t.value&&(o.value=t.value),void 0!==t.label&&(o.label=String(t.label).trim()),void 0!==t.gauge_color&&(o.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(o.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(o.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(o.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const e="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(e)||(o.pie_fill=e)}return void 0!==t.button_background_color&&(o.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(o.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(o.value_color=String(t.value_color).trim()),void 0!==t.entity&&(o.entity=String(t.entity).trim()),void 0!==t.visible&&(o.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(o.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(o.overlay_color=String(t.overlay_color).trim()),o}catch(t){return{_error:`Invalid JSON: ${t instanceof Error?t.message:"Unknown error"}`}}return{icon:e,_isString:!0}}function n(t){return void 0!==t._error}o.d(e,{HD:()=>n,cv:()=>i})},9327:(t,e,o)=>{function i(t,e,o){var i;const n=null===(i=null==e?void 0:e.states)||void 0===i?void 0:i[t];if(!n)return{entity:t,state:"unavailable",name:(null==o?void 0:o.name)||t,attributes:{},unit:"",domain:t.split(".")[0]||"unknown",device_class:"",friendly_name:(null==o?void 0:o.name)||t,config:o||{}};const r=t.split(".")[0],a=n.attributes||{};return{entity:t,state:n.state,name:(null==o?void 0:o.name)||a.friendly_name||t,attributes:a,unit:a.unit_of_measurement||"",domain:r,device_class:a.device_class||"",friendly_name:a.friendly_name||"",config:o||{},state_number:parseFloat(n.state),state_boolean:"on"===n.state||"true"===n.state||"yes"===n.state}}function n(t,e,o){const n=t.map(((t,n)=>{const r=null==o?void 0:o[n];return i(t,e,r)})),r=n[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},r),{entities:n})}o.d(e,{pL:()=>i,wI:()=>n})}}]);