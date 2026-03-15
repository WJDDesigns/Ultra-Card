"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[7289],{5121:(t,e,o)=>{function n(t){if(null==t)return{_error:"Template returned undefined or null"};if("object"==typeof t&&!Array.isArray(t)){const e={};if(void 0!==t.icon&&(e.icon=String(t.icon).trim()),void 0!==t.icon_color&&(e.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(e.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(e.name=String(t.name).trim()),void 0!==t.name_color&&(e.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(e.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(e.state_color=String(t.state_color).trim()),void 0!==t.content&&(e.content=String(t.content).trim()),void 0!==t.color&&(e.color=String(t.color).trim()),void 0!==t.value&&(e.value=t.value),void 0!==t.label&&(e.label=String(t.label).trim()),void 0!==t.gauge_color&&(e.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(e.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(e.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(e.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const o="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(o)||(e.pie_fill=o)}return void 0!==t.button_background_color&&(e.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(e.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(e.value_color=String(t.value_color).trim()),void 0!==t.entity&&(e.entity=String(t.entity).trim()),void 0!==t.visible&&(e.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(e.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(e.overlay_color=String(t.overlay_color).trim()),e}const e=String(t).trim();if(""===e)return{_error:"Template returned empty string"};if(e.startsWith("{")&&e.endsWith("}")||e.startsWith("[")&&e.endsWith("]"))try{const t=JSON.parse(e);if("object"!=typeof t||Array.isArray(t))return{_error:"Template must return an object, not an array"};const o={};if(void 0!==t.icon&&(o.icon=String(t.icon).trim()),void 0!==t.icon_color&&(o.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(o.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(o.name=String(t.name).trim()),void 0!==t.name_color&&(o.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(o.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(o.state_color=String(t.state_color).trim()),void 0!==t.content&&(o.content=String(t.content).trim()),void 0!==t.color&&(o.color=String(t.color).trim()),void 0!==t.value&&(o.value=t.value),void 0!==t.label&&(o.label=String(t.label).trim()),void 0!==t.gauge_color&&(o.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(o.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(o.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(o.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const e="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(e)||(o.pie_fill=e)}return void 0!==t.button_background_color&&(o.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(o.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(o.value_color=String(t.value_color).trim()),void 0!==t.entity&&(o.entity=String(t.entity).trim()),void 0!==t.visible&&(o.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(o.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(o.overlay_color=String(t.overlay_color).trim()),o}catch(t){return{_error:`Invalid JSON: ${t instanceof Error?t.message:"Unknown error"}`}}return{icon:e,_isString:!0}}function r(t){return void 0!==t._error}o.d(e,{HD:()=>r,cv:()=>n})},7289:(t,e,o)=>{o.r(e),o.d(e,{UltraMarkdownModule:()=>b});var n=o(5183),r=o(7475),i=o(5147),a=o(8938),d=o(5262),l=o(6990),s=o(6478),c=o(5320),_=o(9327),m=o(5121),p=o(5155),g=o(9418);const h=["script","iframe","object","embed","form","input","button","textarea","select","option"];var u=o(23);class b extends r.m{constructor(){super(...arguments),this._templateService=null,this._renderedContentCache=new Map,this._templateInputDebounce=null,this._templateUpdateListener=null,this.metadata={type:"markdown",title:"Markdown Module",description:"Display rich markdown content",author:"WJD Designs",version:"1.0.0",icon:"mdi:language-markdown",category:"content",tags:["markdown","content","rich-text","formatting","template"]}}_hashString(t){let e=0;for(let o=0;o<t.length;o+=1)e=(e<<5)-e+t.charCodeAt(o)&4294967295;return Math.abs(e).toString(36)}_clearMarkdownCache(t){t?Array.from(this._renderedContentCache.keys()).filter((e=>e.startsWith(`${t}_`))).forEach((t=>{this._renderedContentCache.delete(t)})):this._renderedContentCache.clear()}cleanup(){this._templateUpdateListener&&(window.removeEventListener("ultra-card-template-update",this._templateUpdateListener),this._templateUpdateListener=null),this._templateService&&(this._templateService=null),this._renderedContentCache.clear(),this._templateInputDebounce&&(clearTimeout(this._templateInputDebounce),this._templateInputDebounce=null)}createDefault(t,e){return{id:t||this.generateId("markdown"),type:"markdown",markdown_content:"# Markdown Module\n\nThe **Markdown** module supports rich formatting including **bold**, *italicized*, `inline code`, ~~strikethrough~~, and [links](https://example.com).\n\n> Blockquotes and nested content work perfectly\n>> Including nested blockquotes\n\n**Lists and formatting:**\n- **Bold**, *italic*, ~~strikethrough~~\n- `inline code` and code blocks\n- Tables, headers, and horizontal rules\n\n**Jinja Templates:**\n- Current time: {{now().strftime('%H:%M:%S')}}\n- Date: {{now().strftime('%Y-%m-%d')}}\n\nAll standard markdown features are automatically enabled!",enable_html:!1,enable_tables:!0,enable_code_highlighting:!0,template_mode:!1,unified_template_mode:!1,unified_template:"",template:"",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(t,e,o,r){var i;const a=t,d=(null===(i=null==e?void 0:e.locale)||void 0===i?void 0:i.language)||"en";return n.qy`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Content Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.markdown.content.title",d,"Markdown Content")}
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${(0,s.kg)("editor.markdown.content.label",d,"Content")}
            </div>
            <div
              class="field-description"
              style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
            >
              ${(0,s.kg)("editor.markdown.content.desc",d,"Enter your markdown content with full formatting support")}
            </div>
            <div
              @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
              @dragstart=${t=>t.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${e}
                .value=${a.markdown_content||""}
                .placeholder=${"# Welcome\n\nEnter your **markdown** content here with full formatting support...\n\n- Lists\n- **Bold** and *italic*\n- Tables, code blocks, and more!"}
                .minHeight=${200}
                .maxHeight=${400}
                @value-changed=${t=>{r({markdown_content:t.detail.value})}}
              ></ultra-template-editor>
            </div>
          </div>
        </div>

        <!-- HTML Support Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${(0,s.kg)("editor.markdown.html.title",d,"HTML Support")}
          </div>

          <div class="field-group">
            <ha-form
              .hass=${e}
              .data=${{enable_html:a.enable_html||!1}}
              .schema=${[{name:"enable_html",label:(0,s.kg)("editor.markdown.enable_html",d,"Enable HTML"),description:(0,s.kg)("editor.markdown.enable_html_desc",d,"Allow raw HTML tags in markdown content (all standard markdown features are always enabled)"),selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>r({enable_html:t.detail.value.enable_html})}
            ></ha-form>
          </div>
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
            ${(0,s.kg)("editor.markdown.template_mode",d,"Template Mode")}
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${(0,s.kg)("editor.markdown.template_mode_desc",d,"Use Home Assistant templating syntax to render markdown content dynamically")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${e}
              .data=${{template_mode:a.template_mode||!1}}
              .schema=${[{name:"template_mode",label:(0,s.kg)("editor.markdown.template_mode",d,"Template Mode"),description:(0,s.kg)("editor.markdown.template_mode_desc",d,"Use Home Assistant templating syntax to render markdown content dynamically"),selector:{boolean:{}}}]}
              .computeLabel=${t=>t.label||t.name}
              .computeDescription=${t=>t.description||""}
              @value-changed=${t=>r({template_mode:t.detail.value.template_mode})}
            ></ha-form>
          </div>

          ${a.template_mode?n.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${(0,s.kg)("editor.markdown.template.content",d,"Template Content")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                  >
                    ${(0,s.kg)("editor.markdown.template.content_desc",d,"Enter markdown content with Jinja2 templates that will be processed dynamically")}
                  </div>
                  <div
                    @mousedown=${t=>{const e=t.target;e.closest("ultra-template-editor")||e.closest(".cm-editor")||t.stopPropagation()}}
                    @dragstart=${t=>t.stopPropagation()}
                  >
                    <ultra-template-editor
                      .hass=${e}
                      .value=${a.template||a.markdown_content||""}
                      .placeholder=${"# Welcome Home\n\nToday is **{{ now().strftime('%A, %B %d') }}**\n\nCurrent temperature: {{ states('sensor.temperature') }}°F"}
                      .minHeight=${200}
                      .maxHeight=${400}
                      @value-changed=${t=>{r({template:t.detail.value})}}
                    ></ultra-template-editor>
                  </div>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${(0,s.kg)("editor.markdown.template.examples_title",d,"Common Examples:")}
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      # Dashboard Header<br />
                      Today is **{{ now().strftime('%A, %B %d') }}**<br />
                      Temperature: {{ states('sensor.temperature') }}°F
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,s.kg)("editor.markdown.template.examples.header",d,"Dynamic header with current date and sensor values")}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      ## System Status<br />
                      - ✅ Internet: Connected<br />
                      - ✅ Security: {{ states('alarm_control_panel.home') }}<br />
                      - ⚠️ Backup: {{ states('sensor.backup_status') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,s.kg)("editor.markdown.template.examples.status",d,"Status list with dynamic entity states")}
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      ### Quick Info<br /><br />
                      | Sensor | Value |<br />
                      | ----------- | ------------------------------------ |<br />
                      | Temperature | {{ states('sensor.temperature') }}°F |<br />
                      | Humidity | {{ states('sensor.humidity') }}% |
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      ${(0,s.kg)("editor.markdown.template.examples.table",d,"Table with dynamic sensor data")}
                    </div>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}renderActionsTab(t,e,o,n){return i.A.render(t,e,(t=>n(t)))}renderPreview(t,e,o,r){var i,a,l,s;const b=t;if(!b.markdown_content||""===b.markdown_content.trim())return this.renderGradientErrorState("Add Markdown Content","Enter markdown content in the General tab","mdi:language-markdown-outline");this._templateUpdateListener||"undefined"==typeof window||(this._templateUpdateListener=()=>{this._renderedContentCache.clear(),this.triggerPreviewUpdate()},window.addEventListener("ultra-card-template-update",this._templateUpdateListener));const v=b,w=b.design||{},x={color:b.color||w.color,font_size:b.font_size||w.font_size,font_weight:b.font_weight||w.font_weight,font_style:b.font_style||w.font_style,text_transform:b.text_transform||w.text_transform,font_family:b.font_family||w.font_family,line_height:b.line_height||w.line_height,letter_spacing:b.letter_spacing||w.letter_spacing,text_align:b.text_align||w.text_align,white_space:b.white_space||w.white_space,text_shadow_h:b.text_shadow_h||w.text_shadow_h,text_shadow_v:b.text_shadow_v||w.text_shadow_v,text_shadow_blur:b.text_shadow_blur||w.text_shadow_blur,text_shadow_color:b.text_shadow_color||w.text_shadow_color,background_color:b.background_color||w.background_color,background_image:b.background_image||w.background_image,background_image_type:b.background_image_type||w.background_image_type,background_image_entity:b.background_image_entity||w.background_image_entity,background_repeat:b.background_repeat||w.background_repeat,background_position:b.background_position||w.background_position,background_size:b.background_size||w.background_size,backdrop_filter:b.backdrop_filter||w.backdrop_filter,width:b.width||w.width,height:b.height||w.height,max_width:b.max_width||w.max_width,max_height:b.max_height||w.max_height,min_width:b.min_width||w.min_width,min_height:b.min_height||w.min_height,margin_top:b.margin_top||w.margin_top,margin_bottom:b.margin_bottom||w.margin_bottom,margin_left:b.margin_left||w.margin_left,margin_right:b.margin_right||w.margin_right,padding_top:b.padding_top||w.padding_top,padding_bottom:b.padding_bottom||w.padding_bottom,padding_left:b.padding_left||w.padding_left,padding_right:b.padding_right||w.padding_right,border_radius:b.border_radius||w.border_radius,border_style:b.border_style||w.border_style,border_width:b.border_width||w.border_width,border_color:b.border_color||w.border_color,position:b.position||w.position,top:b.top||w.top,bottom:b.bottom||w.bottom,left:b.left||w.left,right:b.right||w.right,z_index:b.z_index||w.z_index,overflow:b.overflow||w.overflow,clip_path:b.clip_path||w.clip_path,box_shadow_h:b.box_shadow_h||w.box_shadow_h,box_shadow_v:b.box_shadow_v||w.box_shadow_v,box_shadow_blur:b.box_shadow_blur||w.box_shadow_blur,box_shadow_spread:b.box_shadow_spread||w.box_shadow_spread,box_shadow_color:b.box_shadow_color||w.box_shadow_color};let f="";if(b.unified_template_mode&&b.unified_template&&(!this._templateService&&e&&(this._templateService=new c.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(b.unified_template),n=`unified_markdown_${b.id}_${t}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(n)){const t=(0,_.pL)("",e,{markdown_content:b.markdown_content});this._templateService.subscribeToTemplate(b.unified_template,n,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),t,o)}const r=null===(i=e.__uvc_template_strings)||void 0===i?void 0:i[n];if(r&&""!==String(r).trim()){const t=(0,m.cv)(r);!(0,m.HD)(t)&&t.container_background_color&&(f=t.container_background_color)}}const k={padding:x.padding_top||x.padding_bottom||x.padding_left||x.padding_right||v.padding_top||v.padding_bottom||v.padding_left||v.padding_right?`${this.addPixelUnit(x.padding_top||v.padding_top)||"0px"} ${this.addPixelUnit(x.padding_right||v.padding_right)||"0px"} ${this.addPixelUnit(x.padding_bottom||v.padding_bottom)||"0px"} ${this.addPixelUnit(x.padding_left||v.padding_left)||"0px"}`:"16px",margin:x.margin_top||x.margin_bottom||x.margin_left||x.margin_right||v.margin_top||v.margin_bottom||v.margin_left||v.margin_right?`${x.margin_top||v.margin_top||"0px"} ${x.margin_right||v.margin_right||"0px"} ${x.margin_bottom||v.margin_bottom||"0px"} ${x.margin_left||v.margin_left||"0px"}`:"0",background:f&&"transparent"!==f?f:x.background_color&&"transparent"!==x.background_color?x.background_color:v.background_color&&"transparent"!==v.background_color?v.background_color:"transparent",backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},v),x),e),backgroundSize:x.background_size||v.background_size||"cover",backgroundPosition:x.background_position||v.background_position||"center",backgroundRepeat:x.background_repeat||v.background_repeat||"no-repeat",border:(x.border_style||v.border_style)&&"none"!==(x.border_style||v.border_style)?`${this.addPixelUnit(x.border_width||v.border_width)||"1px"} ${x.border_style||v.border_style} ${x.border_color||v.border_color||"var(--divider-color)"}`:"none",borderRadius:this.addPixelUnit(x.border_radius||v.border_radius)||"0",position:x.position||v.position||"static",top:x.top||v.top||"auto",bottom:x.bottom||v.bottom||"auto",left:x.left||v.left||"auto",right:x.right||v.right||"auto",zIndex:x.z_index||v.z_index||"auto",width:x.width||v.width||"100%",height:x.height||v.height||"auto",maxWidth:x.max_width||v.max_width||"100%",maxHeight:x.max_height||v.max_height||"none",minWidth:x.min_width||v.min_width||"none",minHeight:x.min_height||v.min_height||"auto",overflow:x.overflow||v.overflow||"visible",clipPath:x.clip_path||v.clip_path||"none",backdropFilter:x.backdrop_filter||v.backdrop_filter||"none",boxShadow:x.box_shadow_h&&x.box_shadow_v?`${x.box_shadow_h||"0"} ${x.box_shadow_v||"0"} ${x.box_shadow_blur||"0"} ${x.box_shadow_spread||"0"} ${x.box_shadow_color||"rgba(0,0,0,0.1)"}`:v.box_shadow_h&&v.box_shadow_v?`${v.box_shadow_h||"0"} ${v.box_shadow_v||"0"} ${v.box_shadow_blur||"0"} ${v.box_shadow_spread||"0"} ${v.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none",boxSizing:"border-box"},y={fontSize:(()=>x.font_size&&"string"==typeof x.font_size&&""!==x.font_size.trim()?/[a-zA-Z%]/.test(x.font_size)?x.font_size:this.addPixelUnit(x.font_size)||x.font_size:void 0!==v.font_size?`${v.font_size}px`:"clamp(12px, 3vw, 14px)")(),fontFamily:x.font_family||v.font_family||b.font_family||'var(--primary-font-family, "Roboto", sans-serif)',color:x&&x.color||v.color||b.color||"var(--primary-text-color)",textAlign:(x.text_align&&"inherit"!==x.text_align?x.text_align:void 0)||v.text_align||b.alignment||"left",lineHeight:x.line_height||v.line_height||b.line_height||1.4,letterSpacing:x.letter_spacing||v.letter_spacing||b.letter_spacing||"normal",whiteSpace:x.white_space||v.white_space||"normal",padding:"0",maxHeight:(x.max_height&&"none"!==x.max_height?x.max_height:void 0)||(b.max_height&&"none"!==b.max_height?b.max_height:"none"),overflow:(x.max_height&&"none"!==x.max_height?x.overflow||"visible":void 0)||b.max_height&&"none"!==b.max_height&&b.overflow_behavior||"visible",textShadow:x.text_shadow_h&&x.text_shadow_v?`${x.text_shadow_h||"0"} ${x.text_shadow_v||"0"} ${x.text_shadow_blur||"0"} ${x.text_shadow_color||"rgba(0,0,0,0.5)"}`:v.text_shadow_h&&v.text_shadow_v?`${v.text_shadow_h||"0"} ${v.text_shadow_v||"0"} ${v.text_shadow_blur||"0"} ${v.text_shadow_color||"rgba(0,0,0,0.5)"}`:"none",boxShadow:x.box_shadow_h&&x.box_shadow_v?`${x.box_shadow_h||"0"} ${x.box_shadow_v||"0"} ${x.box_shadow_blur||"0"} ${x.box_shadow_spread||"0"} ${x.box_shadow_color||"rgba(0,0,0,0.1)"}`:v.box_shadow_h&&v.box_shadow_v?`${v.box_shadow_h||"0"} ${v.box_shadow_v||"0"} ${v.box_shadow_blur||"0"} ${v.box_shadow_spread||"0"} ${v.box_shadow_color||"rgba(0,0,0,0.1)"}`:"none"},$=t=>{var n;if(!t)return"";let r=t,i=t;if(e&&(i=(0,p.KD)(t,e,o)),/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/.test(i)&&e){this._templateService||(this._templateService=new c.I(e)),e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(i),a=`state_text_markdown_${b.id}_${t}`;this._templateService.hasTemplateSubscription(a)||this._templateService.subscribeToTemplate(i,a,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),void 0,o);const d=null===(n=e.__uvc_template_strings)||void 0===n?void 0:n[a];r=void 0!==d?String(d):"Template processing..."}const a={breaks:!1,gfm:!0,tables:!0,headerIds:!1,mangle:!1};try{return d=(0,u.xI)(r,a),l=!!b.enable_html,g.A.sanitize(d,{USE_PROFILES:{html:!0},FORBID_TAGS:l?h:[...h,"style"]})}catch(t){return console.warn("Ultra Card: Failed to process markdown:",t),r}var d,l};let S,C="";if(b.unified_template_mode&&b.unified_template){if(!this._templateService&&e&&(this._templateService=new c.I(e)),e){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(b.unified_template),n=`unified_markdown_${b.id}_${t}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(n)){const t=(0,_.pL)("",e,{markdown_content:b.markdown_content});this._templateService.subscribeToTemplate(b.unified_template,n,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update")),window._ultraCardUpdateTimer=null}),50)))}),t,o)}const r=null===(a=e.__uvc_template_strings)||void 0===a?void 0:a[n];if(r&&""!==String(r).trim()){const t=(0,m.cv)(r);(0,m.HD)(t)||(void 0!==t.content&&(C=t.content),t.color&&(S=t.color))}}}else C=b.template_mode&&b.template?b.template:b.markdown_content||"";const z=`${b.id}_${this._hashString(C)}`;let T=this._renderedContentCache.get(z)||C;const U=/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/.test(C);if(!this._renderedContentCache.has(z)||U)try{const t=$(C);this._renderedContentCache.set(z,t),T=t}catch(t){console.warn("Ultra Card: Failed to render markdown:",t),T=C}else if(U&&e){const t=this._hashString(C),o=`state_text_markdown_${b.id}_${t}`,n=null===(l=e.__uvc_template_strings)||void 0===l?void 0:l[o];if(void 0!==n){const t=$(String(n));this._renderedContentCache.set(z,t),T=t}}const H=this.createGestureHandlers(b.id,{tap_action:b.tap_action,hold_action:b.hold_action,double_tap_action:b.double_tap_action,entity:b.entity,module:b},e,o),A=n.qy`<div class="markdown-content" .innerHTML=${T}></div>`,L=null===(s=v.design)||void 0===s?void 0:s.hover_effect,M=d.k.getHoverEffectClass(L);return n.qy`
      <div
        class="markdown-module-container ${M}"
        style="${this.styleObjectToCss(k)}; cursor: ${b.tap_action&&"nothing"!==b.tap_action.action||b.hold_action&&"nothing"!==b.hold_action.action||b.double_tap_action&&"nothing"!==b.double_tap_action.action?"pointer":"default"};"
        @pointerdown=${H.onPointerDown}
        @pointerup=${H.onPointerUp}
        @pointerleave=${H.onPointerLeave}
      >
        <div class="markdown-module-preview" style=${this.styleObjectToCss(y)}>
          ${A}
        </div>
      </div>
    `}renderLogicTab(t,e,o,n){return a.X.render(t,e,(t=>n(t)))}validate(t){const e=t,o=[...super.validate(t).errors];if(e.font_size&&(e.font_size<1||e.font_size>200)&&o.push("Font size must be between 1 and 200 pixels"),e.link&&""!==e.link.trim())try{new URL(e.link)}catch(t){e.link.startsWith("/")||e.link.startsWith("#")||o.push('Link must be a valid URL or start with "/" for relative paths')}return{valid:0===o.length,errors:o}}getStyles(){return"\n      /* Match Home Assistant ha-markdown exactly */\n      .markdown-module-preview {\n        display: block;\n        -ms-user-select: text;\n        -webkit-user-select: text;\n        -moz-user-select: text;\n      }\n\n      .markdown-content {\n        width: 100%;\n      }\n\n      /* Match HA's exact first/last child rules */\n      .markdown-content > *:first-child {\n        margin-top: 0;\n      }\n\n      .markdown-content > *:last-child {\n        margin-bottom: 0;\n      }\n\n      /* Links - Match HA exactly */\n      .markdown-content a {\n        color: -webkit-link;\n        cursor: pointer;\n        text-decoration: underline !important;\n      }\n\n      /* Images - Match HA */\n      .markdown-content img {\n        max-width: 100%;\n      }\n\n      /* Code and Pre - Match HA exactly */\n      .markdown-content code,\n      .markdown-content pre {\n        background-color: var(--markdown-code-background-color, none);\n        border-radius: 3px;\n      }\n\n      /* Strikethrough - exact HA styling */\n      .markdown-content del {\n        text-decoration: line-through !important;\n        color: var(--primary-text-color) !important;\n      }\n\n      /* Underline - ensure u tag renders correctly in HA dashboard */\n      .markdown-content u {\n        text-decoration: underline !important;\n      }\n\n      .markdown-content code {\n        font-size: inherit;\n        color: var(--primary-text-color) !important;\n        padding: .2em .4em;\n      }\n\n      .markdown-content pre code {\n        padding: 0;\n      }\n\n      .markdown-content pre {\n        padding: 16px;\n        overflow: auto;\n        line-height: var(--ha-line-height-condensed);\n        font-family: var(--ha-font-family-code);\n      }\n\n      /* Headers - Match HA exactly */\n      .markdown-content h1,\n      .markdown-content h2,\n      .markdown-content h3,\n      .markdown-content h4,\n      .markdown-content h5,\n      .markdown-content h6 {\n        line-height: initial;\n      }\n\n      .markdown-content h2 {\n        font-size: inherit;\n        font-weight: var(--ha-font-weight-bold);\n      }\n\n      /* Horizontal rules - Match HA */\n      .markdown-content hr {\n        border-color: var(--divider-color);\n        border-bottom: none;\n        margin: 16px 0;\n      }\n\n      /* Module-specific grid layouts */\n      .two-column-grid {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 20px;\n        margin-bottom: 20px;\n      }\n\n      .three-column-grid {\n        display: grid;\n        grid-template-columns: 1fr 1fr 1fr;\n        gap: 16px;\n        margin-bottom: 20px;\n      }\n       \n      @media (max-width: 768px) {\n        .two-column-grid,\n        .three-column-grid {\n          grid-template-columns: 1fr;\n          gap: 16px;\n        }\n      }\n    "}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}getBackgroundImageCSS(t,e){var o,n;const r=t.background_image_type,i=t.background_image,a=t.background_image_entity;if(!r||"none"===r)return"none";switch(r){case"upload":if(i)return`url("${(0,l.V)(e,i)}")`;break;case"url":if(i)return`url("${i}")`;break;case"entity":if(a&&e){const t=e.states[a];if(t){const r=(null===(o=t.attributes)||void 0===o?void 0:o.entity_picture)||(null===(n=t.attributes)||void 0===n?void 0:n.image)||("string"==typeof t.state?t.state:"");if(r&&"unknown"!==r&&"unavailable"!==r)return`url("${(0,l.V)(e,r)}")`}}}return"none"}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}}},9327:(t,e,o)=>{function n(t,e,o){var n;const r=null===(n=null==e?void 0:e.states)||void 0===n?void 0:n[t];if(!r)return{entity:t,state:"unavailable",name:(null==o?void 0:o.name)||t,attributes:{},unit:"",domain:t.split(".")[0]||"unknown",device_class:"",friendly_name:(null==o?void 0:o.name)||t,config:o||{}};const i=t.split(".")[0],a=r.attributes||{};return{entity:t,state:r.state,name:(null==o?void 0:o.name)||a.friendly_name||t,attributes:a,unit:a.unit_of_measurement||"",domain:i,device_class:a.device_class||"",friendly_name:a.friendly_name||"",config:o||{},state_number:parseFloat(r.state),state_boolean:"on"===r.state||"true"===r.state||"yes"===r.state}}function r(t,e,o){const r=t.map(((t,r)=>{const i=null==o?void 0:o[r];return n(t,e,i)})),i=r[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},i),{entities:r})}o.d(e,{pL:()=>n,wI:()=>r})}}]);