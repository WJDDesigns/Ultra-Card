"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8891],{5121:(t,e,i)=>{function o(t){if(null==t)return{_error:"Template returned undefined or null"};if("object"==typeof t&&!Array.isArray(t)){const e={};if(void 0!==t.icon&&(e.icon=String(t.icon).trim()),void 0!==t.icon_color&&(e.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(e.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(e.name=String(t.name).trim()),void 0!==t.name_color&&(e.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(e.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(e.state_color=String(t.state_color).trim()),void 0!==t.content&&(e.content=String(t.content).trim()),void 0!==t.color&&(e.color=String(t.color).trim()),void 0!==t.value&&(e.value=t.value),void 0!==t.label&&(e.label=String(t.label).trim()),void 0!==t.gauge_color&&(e.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(e.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(e.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(e.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const i="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(i)||(e.pie_fill=i)}return void 0!==t.button_background_color&&(e.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(e.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(e.value_color=String(t.value_color).trim()),void 0!==t.entity&&(e.entity=String(t.entity).trim()),void 0!==t.visible&&(e.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(e.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(e.overlay_color=String(t.overlay_color).trim()),e}const e=String(t).trim();if(""===e)return{_error:"Template returned empty string"};if(e.startsWith("{")&&e.endsWith("}")||e.startsWith("[")&&e.endsWith("]"))try{const t=JSON.parse(e);if("object"!=typeof t||Array.isArray(t))return{_error:"Template must return an object, not an array"};const i={};if(void 0!==t.icon&&(i.icon=String(t.icon).trim()),void 0!==t.icon_color&&(i.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(i.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(i.name=String(t.name).trim()),void 0!==t.name_color&&(i.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(i.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(i.state_color=String(t.state_color).trim()),void 0!==t.content&&(i.content=String(t.content).trim()),void 0!==t.color&&(i.color=String(t.color).trim()),void 0!==t.value&&(i.value=t.value),void 0!==t.label&&(i.label=String(t.label).trim()),void 0!==t.gauge_color&&(i.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(i.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(i.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(i.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const e="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(e)||(i.pie_fill=e)}return void 0!==t.button_background_color&&(i.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(i.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(i.value_color=String(t.value_color).trim()),void 0!==t.entity&&(i.entity=String(t.entity).trim()),void 0!==t.visible&&(i.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(i.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(i.overlay_color=String(t.overlay_color).trim()),i}catch(t){return{_error:`Invalid JSON: ${t instanceof Error?t.message:"Unknown error"}`}}return{icon:e,_isString:!0}}function n(t){return void 0!==t._error}i.d(e,{HD:()=>n,cv:()=>o})},8891:(t,e,i)=>{i.r(e),i.d(e,{UltraSpinboxModule:()=>v});var o=i(5183),n=i(6478),l=i(7475),a=i(5147),r=i(8938),s=i(5262),d=i(5320),c=i(9327),u=i(5121),p=(i(7921),i(6990));class v extends l.m{constructor(){super(...arguments),this._templateInputDebounce=null,this._lastTouchTime=0,this.metadata={type:"spinbox",title:"Spinbox",description:"Number input with increment/decrement buttons",author:"WJD Designs",version:"1.0.0",icon:"mdi:numeric",category:"interactive",tags:["spinbox","number","increment","decrement","input","stepper"]}}createDefault(t,e){return{id:t||this.generateId("spinbox"),type:"spinbox",min_value:0,max_value:100,step:1,value:50,layout:"horizontal",show_value:!0,value_position:"center",show_unit:!1,unit:"",button_style:"flat",button_shape:"rounded",button_size:40,button_spacing:12,button_gap:8,increment_icon:"mdi:plus",decrement_icon:"mdi:minus",button_background_color:"var(--primary-color)",button_text_color:"white",value_color:"var(--primary-text-color)",value_font_size:18,tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[],template_mode:!1,template:""}}getButtonStyles(t){return[{value:"flat",label:(0,n.kg)("editor.spinbox.styles.flat",t,"Flat (Default)")},{value:"glossy",label:(0,n.kg)("editor.spinbox.styles.glossy",t,"Glossy")},{value:"embossed",label:(0,n.kg)("editor.spinbox.styles.embossed",t,"Embossed")},{value:"inset",label:(0,n.kg)("editor.spinbox.styles.inset",t,"Inset")},{value:"gradient-overlay",label:(0,n.kg)("editor.spinbox.styles.gradient_overlay",t,"Gradient Overlay")},{value:"neon-glow",label:(0,n.kg)("editor.spinbox.styles.neon_glow",t,"Neon Glow")},{value:"outline",label:(0,n.kg)("editor.spinbox.styles.outline",t,"Outline")},{value:"glass",label:(0,n.kg)("editor.spinbox.styles.glass",t,"Glass")},{value:"metallic",label:(0,n.kg)("editor.spinbox.styles.metallic",t,"Metallic")}]}getButtonShapeOptions(t){return[{value:"rounded",label:(0,n.kg)("editor.spinbox.shapes.rounded",t,"Rounded Square (Default)")},{value:"square",label:(0,n.kg)("editor.spinbox.shapes.square",t,"Square")},{value:"circle",label:(0,n.kg)("editor.spinbox.shapes.circle",t,"Circle")}]}getLayoutOptions(t){return[{value:"horizontal",label:(0,n.kg)("editor.spinbox.layout_options.horizontal",t,"Horizontal")},{value:"vertical",label:(0,n.kg)("editor.spinbox.layout_options.vertical",t,"Vertical")}]}getValuePositionOptions(t){return[{value:"center",label:(0,n.kg)("editor.spinbox.value_position_options.center",t,"Center (Between Buttons)")},{value:"top",label:(0,n.kg)("editor.spinbox.value_position_options.top",t,"Top (Above Both Buttons)")},{value:"bottom",label:(0,n.kg)("editor.spinbox.value_position_options.bottom",t,"Bottom (Below Both Buttons)")},{value:"left",label:(0,n.kg)("editor.spinbox.value_position_options.left",t,"Left (Before Buttons)")},{value:"right",label:(0,n.kg)("editor.spinbox.value_position_options.right",t,"Right (After Buttons)")}]}getStyles(){return`\n      ${l.m.getSliderStyles()}\n    `}renderGeneralTab(t,e,i,l){var a,r,s,d,c,u,p,v,m,g,b;const _=t,x=(null===(a=null==e?void 0:e.locale)||void 0===a?void 0:a.language)||"en";return o.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity Configuration -->
        ${this.renderSettingsSection((0,n.kg)("editor.spinbox.entity.title",x,"Entity Configuration"),(0,n.kg)("editor.spinbox.entity.desc",x,"Optional: Link to a Home Assistant entity for synced values (e.g., input_number, climate temperature)."),[{title:(0,n.kg)("editor.spinbox.entity_field",x,"Entity"),description:(0,n.kg)("editor.spinbox.entity_field_desc",x,"Select an entity to sync the spinbox value (optional). Supports input_number, number, climate entities."),hass:e,data:{entity:_.entity||""},schema:[this.entityField("entity")],onChange:t=>l(t.detail.value)}])}

        <!-- Value Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,n.kg)("editor.spinbox.value.title",x,"Value Configuration")}
          </div>
          <div class="section-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;">
            ${(0,n.kg)("editor.spinbox.value.desc",x,"Configure the numeric range, step size, and default value.")}
          </div>

          ${this.renderSliderField((0,n.kg)("editor.spinbox.min_value",x,"Minimum Value"),(0,n.kg)("editor.spinbox.min_value_desc",x,"The minimum allowed value"),null!==(r=_.min_value)&&void 0!==r?r:0,0,0,1e3,1,(t=>l({min_value:t})),"")}
          ${this.renderSliderField((0,n.kg)("editor.spinbox.max_value",x,"Maximum Value"),(0,n.kg)("editor.spinbox.max_value_desc",x,"The maximum allowed value"),null!==(s=_.max_value)&&void 0!==s?s:100,100,0,1e3,1,(t=>l({max_value:t})),"")}
          ${this.renderSliderField((0,n.kg)("editor.spinbox.step",x,"Step Size"),(0,n.kg)("editor.spinbox.step_desc",x,"How much the value changes with each button press"),null!==(d=_.step)&&void 0!==d?d:1,1,0,100,1,(t=>l({step:t})),"")}
          ${this.renderSliderField((0,n.kg)("editor.spinbox.value",x,"Default Value"),(0,n.kg)("editor.spinbox.value_desc",x,"The initial value (only used when no entity is linked)"),null!==(c=_.value)&&void 0!==c?c:50,50,0,1e3,1,(t=>l({value:t})),"")}
        </div>

        <!-- Display Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,n.kg)("editor.spinbox.display.title",x,"Display Configuration")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,n.kg)("editor.spinbox.layout_title",x,"Layout"),(0,n.kg)("editor.spinbox.layout_desc",x,"Arrangement of buttons and value"),e,{layout:_.layout||"horizontal"},[this.selectField("layout",this.getLayoutOptions(x))],(t=>{t.detail.value.layout!==(_.layout||"horizontal")&&(l(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${(0,n.kg)("editor.spinbox.show_value",x,"Show Value")}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 0;"
                >
                  ${(0,n.kg)("editor.spinbox.show_value_desc",x,"Display the current numeric value")}
                </div>
              </div>
              <ha-switch
                .checked=${null===(u=_.show_value)||void 0===u||u}
                @change=${t=>{const e=t.target;l({show_value:e.checked})}}
              ></ha-switch>
            </div>
          </div>

          ${_.show_value?o.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,n.kg)("editor.spinbox.value_position_title",x,"Value Position"),(0,n.kg)("editor.spinbox.value_position_desc",x,"Where to display the value relative to buttons"),e,{value_position:_.value_position||"center"},[this.selectField("value_position",this.getValuePositionOptions(x))],(t=>{t.detail.value.value_position!==(_.value_position||"center")&&(l(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
                </div>
              `:""}

          <div class="field-group" style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${(0,n.kg)("editor.spinbox.show_unit",x,"Show Unit")}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 0;"
                >
                  ${(0,n.kg)("editor.spinbox.show_unit_desc",x,"Display a unit label (e.g., °C, %)")}
                </div>
              </div>
              <ha-switch
                .checked=${null!==(p=_.show_unit)&&void 0!==p&&p}
                @change=${t=>{const e=t.target;l({show_unit:e.checked})}}
              ></ha-switch>
            </div>
          </div>

          ${_.show_unit?o.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,n.kg)("editor.spinbox.unit",x,"Unit"),(0,n.kg)("editor.spinbox.unit_desc",x,"Unit to display (e.g., °C, %, km)"),e,{unit:_.unit||""},[this.textField("unit")],(t=>l(t.detail.value)))}
                </div>
              `:""}
        </div>

        <!-- Button Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,n.kg)("editor.spinbox.buttons.title",x,"Button Configuration")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,n.kg)("editor.spinbox.button_style",x,"Button Style"),(0,n.kg)("editor.spinbox.button_style_desc",x,"Visual style for buttons"),e,{button_style:_.button_style||"flat"},[this.selectField("button_style",this.getButtonStyles(x))],(t=>{t.detail.value.button_style!==(_.button_style||"flat")&&(l(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,n.kg)("editor.spinbox.button_shape",x,"Button Shape"),(0,n.kg)("editor.spinbox.button_shape_desc",x,"Shape of the buttons"),e,{button_shape:_.button_shape||"rounded"},[this.selectField("button_shape",this.getButtonShapeOptions(x))],(t=>{t.detail.value.button_shape!==(_.button_shape||"rounded")&&(l(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderSliderField((0,n.kg)("editor.spinbox.button_size",x,"Button Size"),(0,n.kg)("editor.spinbox.button_size_desc",x,"Size of the buttons in pixels (width and height)"),null!==(v=_.button_size)&&void 0!==v?v:40,40,10,200,1,(t=>l({button_size:t})),"px")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderSliderField((0,n.kg)("editor.spinbox.button_spacing",x,"Value Spacing"),(0,n.kg)("editor.spinbox.button_spacing_desc",x,"Space between buttons and value display in pixels"),null!==(m=_.button_spacing)&&void 0!==m?m:12,12,0,100,1,(t=>l({button_spacing:t})),"px")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderSliderField((0,n.kg)("editor.spinbox.button_gap",x,"Button Gap"),(0,n.kg)("editor.spinbox.button_gap_desc",x,"Space between increment and decrement buttons in pixels"),null!==(g=_.button_gap)&&void 0!==g?g:8,8,0,100,1,(t=>l({button_gap:t})),"px")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,n.kg)("editor.spinbox.increment_icon",x,"Increment Icon"),(0,n.kg)("editor.spinbox.increment_icon_desc",x,"Icon for the increment button (e.g., mdi:plus, mdi:chevron-up)"),e,{increment_icon:_.increment_icon||"mdi:plus"},[this.iconField("increment_icon")],(t=>l(t.detail.value)))}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,n.kg)("editor.spinbox.decrement_icon",x,"Decrement Icon"),(0,n.kg)("editor.spinbox.decrement_icon_desc",x,"Icon for the decrement button (e.g., mdi:minus, mdi:chevron-down)"),e,{decrement_icon:_.decrement_icon||"mdi:minus"},[this.iconField("decrement_icon")],(t=>l(t.detail.value)))}
          </div>

          <!-- Button Colors -->
          <div class="color-controls" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${(0,n.kg)("editor.spinbox.button_background_color",x,"Button Background")}
              .value=${_.button_background_color||"var(--primary-color)"}
              .defaultValue=${"var(--primary-color)"}
              .hass=${e}
              @value-changed=${t=>l({button_background_color:t.detail.value})}
            ></ultra-color-picker>
          </div>

          <div class="color-controls">
            <ultra-color-picker
              .label=${(0,n.kg)("editor.spinbox.button_text_color",x,"Button Icon Color")}
              .value=${_.button_text_color||"white"}
              .defaultValue=${"white"}
              .hass=${e}
              @value-changed=${t=>l({button_text_color:t.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Value Display Styling -->
        ${_.show_value?o.qy`
              <div class="settings-section">
                <div class="section-title">
                  ${(0,n.kg)("editor.spinbox.value_style.title",x,"Value Display Styling")}
                </div>

                <div class="color-controls" style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${(0,n.kg)("editor.spinbox.value_color",x,"Value Color")}
                    .value=${_.value_color||"var(--primary-text-color)"}
                    .defaultValue=${"var(--primary-text-color)"}
                    .hass=${e}
                    @value-changed=${t=>l({value_color:t.detail.value})}
                  ></ultra-color-picker>
                </div>

                <div class="field-group">
                  ${this.renderSliderField((0,n.kg)("editor.spinbox.value_font_size",x,"Value Font Size"),(0,n.kg)("editor.spinbox.value_font_size_desc",x,"Font size for the value display (in pixels)"),null!==(b=_.value_font_size)&&void 0!==b?b:18,18,8,100,1,(t=>l({value_font_size:t})),"px")}
                </div>
              </div>
            `:""}

        <!-- Template Mode -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,n.kg)("editor.spinbox.template.title",x,"Template Mode")}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${(0,n.kg)("editor.spinbox.template_mode",x,"Enable Template Mode")}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 0;"
                >
                  ${(0,n.kg)("editor.spinbox.template_mode_desc",x,"Use Jinja2 templates to dynamically compute the displayed value")}
                </div>
              </div>
              <ha-switch
                .checked=${_.template_mode||!1}
                @change=${t=>{const e=t.target;l({template_mode:e.checked})}}
              ></ha-switch>
            </div>
          </div>

          ${_.template_mode?o.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    ${(0,n.kg)("editor.spinbox.template",x,"Value Template")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
                  >
                    ${(0,n.kg)("editor.spinbox.template_desc",x,'Jinja2 template for value (e.g., {{ states("input_number.temperature") }})')}
                  </div>
                  <ha-form
                    .hass=${e}
                    .data=${{template:_.template||""}}
                    .schema=${[{name:"template",label:"",selector:{text:{multiline:!0}}}]}
                    .computeLabel=${t=>t.label||t.name}
                    .computeDescription=${t=>t.description||""}
                    @value-changed=${t=>{l(t.detail.value)}}
                  ></ha-form>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${(0,n.kg)("editor.spinbox.template_examples",x,"Common Examples:")}
                  </div>
                  <div class="example-item" style="margin-bottom: 12px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 11px; color: #d4d4d4; margin-bottom: 4px;"
                    >
                      {{ states('input_number.temperature') | float }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 11px; color: var(--secondary-text-color);"
                    >
                      Read value from input_number entity
                    </div>
                  </div>
                  <div class="example-item">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 11px; color: #d4d4d4; margin-bottom: 4px;"
                    >
                      {{ state_attr('climate.thermostat', 'temperature') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 11px; color: var(--secondary-text-color);"
                    >
                      Read temperature from climate entity
                    </div>
                  </div>
                </div>
              `:o.qy`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  ${(0,n.kg)("editor.spinbox.template_disabled",x,"Enable template mode to use dynamic values")}
                </div>
              `}
        </div>
      </div>
    `}renderActionsTab(t,e,i,o){const n=t;return a.A.render(n,e,(t=>o(t)))}renderLogicTab(t,e,i,o){return r.X.render(t,e,(t=>o(t)))}renderPreview(t,e,i,n){var l,a,r,p,v,m,g;const b=t;let _,x,y,h;if(b.template_mode&&b.template&&(!this._templateService&&e&&(this._templateService=new d.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(b.template),o=`spinbox_${b.id}_${t}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(o)){const t=(0,c.pL)(b.entity||"",e,{value:b.value,min_value:b.min_value,max_value:b.max_value});this._templateService.subscribeToTemplate(b.template,o,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update",{bubbles:!0,composed:!0})),window._ultraCardUpdateTimer=null}),50)))}),t,i)}const n=null===(l=e.__uvc_template_strings)||void 0===l?void 0:l[o];if(n&&""!==String(n).trim()){const t=(0,u.cv)(n);if(!(0,u.HD)(t)){if(void 0!==t.value){const e="number"==typeof t.value?t.value:parseFloat(String(t.value));isNaN(e)||(_=e)}t.button_background_color&&(x=t.button_background_color),t.button_text_color&&(y=t.button_text_color),t.value_color&&(h=t.value_color)}}}let f=void 0!==_?_:null!==(a=b.value)&&void 0!==a?a:50,$="";if(void 0===_&&b.entity&&e){const t=e.states[b.entity];if($=b.entity.split(".")[0],t)if("climate"===$)if(void 0!==(null===(r=t.attributes)||void 0===r?void 0:r.temperature)){const e=parseFloat(String(t.attributes.temperature));isNaN(e)||(f=e)}else{const e=parseFloat(t.state);isNaN(e)||(f=e)}else{const e=parseFloat(t.state);isNaN(e)||(f=e)}}f=Math.max(b.min_value,Math.min(b.max_value,f));const k=b,S=b.design||{},w=x||S.button_background_color||b.button_background_color||"var(--primary-color)",z=y||S.button_text_color||b.button_text_color||"white",C=b.button_style||"flat",F=null!==(p=b.button_size)&&void 0!==p?p:40,T=b.button_shape||"rounded",B=null!==(v=b.button_spacing)&&void 0!==v?v:12,q=null!==(m=b.button_gap)&&void 0!==m?m:8;let D="8px";"circle"===T?D="50%":"square"===T&&(D="0");const V={flat:"box-shadow: none;",glossy:`background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${w}; border: none;`,embossed:"border: 1px solid rgba(0,0,0,0.15); box-shadow: inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.15);",inset:"box-shadow: inset 0 2px 6px rgba(0,0,0,0.35);","gradient-overlay":`background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,0,0,0.15)), ${w};`,"neon-glow":`box-shadow: 0 0 10px ${w}, 0 0 20px ${w};`,outline:`background: transparent; border: 2px solid ${w}; color: ${w};`,glass:"backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.25);",metallic:"background: linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7); color: #333; border: 1px solid #bbb;"},j=`\n      background: ${w};\n      color: ${z};\n      padding: 0;\n      border-radius: ${D};\n      cursor: pointer;\n      transition: all 0.2s ease;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      min-width: ${F}px;\n      min-height: ${F}px;\n      width: ${F}px;\n      height: ${F}px;\n      border: none;\n     ${V[C]||V.flat}`,A=h||S.value_color||b.value_color||"var(--primary-text-color)",N=S.value_font_size||b.value_font_size||18,O=`\n      color: ${A};\n      font-size: ${N}px;\n      font-weight: 600;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      min-width: 60px;\n    `,E={width:"100%",height:"auto",maxWidth:"none",maxHeight:"none",minWidth:"auto",minHeight:"auto",padding:S.padding_top||S.padding_bottom||S.padding_left||S.padding_right?`${S.padding_top||"0px"} ${S.padding_right||"0px"} ${S.padding_bottom||"0px"} ${S.padding_left||"0px"}`:"0",margin:S.margin_top||S.margin_bottom||S.margin_left||S.margin_right?`${S.margin_top||"8px"} ${S.margin_right||"0px"} ${S.margin_bottom||"8px"} ${S.margin_left||"0px"}`:"8px 0",background:S.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},k),S),e),"background-size":"cover","background-position":"center","background-repeat":"no-repeat","border-radius":S.border_radius||"8px",border:S.border_style&&"none"!==S.border_style?`${S.border_width||"1px"} ${S.border_style} ${S.border_color||"var(--divider-color)"}`:"none","box-shadow":S.box_shadow_h||S.box_shadow_v||S.box_shadow_blur||S.box_shadow_spread?`${S.box_shadow_h||"0px"} ${S.box_shadow_v||"0px"} ${S.box_shadow_blur||"0px"} ${S.box_shadow_spread||"0px"} ${S.box_shadow_color||"rgba(0,0,0,.2)"}`:"none","box-sizing":"border-box"},I=t=>{if(t.stopPropagation(),"click"===t.type&&t.timeStamp-(this._lastTouchTime||0)<500)return;"touchend"===t.type&&(this._lastTouchTime=t.timeStamp,t.preventDefault());const i=t.target.closest(".spinbox-button");if(b.entity&&e){const t=Math.min(b.max_value,f+b.step);this.callEntityService(b.entity,t,e,$)}i&&(i.blur(),requestAnimationFrame((()=>{i.blur()})))},U=t=>{if(t.stopPropagation(),"click"===t.type&&t.timeStamp-(this._lastTouchTime||0)<500)return;"touchend"===t.type&&(this._lastTouchTime=t.timeStamp,t.preventDefault());const i=t.target.closest(".spinbox-button");if(b.entity&&e){const t=Math.max(b.min_value,f-b.step);this.callEntityService(b.entity,t,e,$)}i&&(i.blur(),requestAnimationFrame((()=>{i.blur()})))},M=null===(g=b.design)||void 0===g?void 0:g.hover_effect,P=s.k.getHoverEffectClass(M),L="vertical"===b.layout,H=!1!==b.show_value,W=b.value_position||"center",G=b.show_unit&&b.unit,J=H?o.qy`
          <div class="spinbox-value" style="${O}">
            ${f.toFixed(this.getDecimalPlaces(b.step))}${G?o.qy`<span style="margin-left: 4px; font-size: ${.8*N}px;"
                  >${b.unit}</span
                >`:""}
          </div>
        `:"",R=o.qy`
      <button
        class="spinbox-button decrement ${P}"
        style="${j}"
        @click=${U}
        @touchend=${U}
        ?disabled=${f<=b.min_value}
      >
        <ha-icon icon="${b.decrement_icon||"mdi:minus"}"></ha-icon>
      </button>
    `,X=o.qy`
      <button
        class="spinbox-button increment ${P}"
        style="${j}"
        @click=${I}
        @touchend=${I}
        ?disabled=${f>=b.max_value}
      >
        <ha-icon icon="${b.increment_icon||"mdi:plus"}"></ha-icon>
      </button>
    `,Z=q>=0,K=B>=0,Q=Z?`display: flex; gap: ${q}px; ${L?"flex-direction: column;":"flex-direction: row;"}`:"display: flex; "+(L?"flex-direction: column;":"flex-direction: row;");return o.qy`
      <style>
        .spinbox-button {
          flex-shrink: 0;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          -webkit-user-select: none;
          user-select: none;
          outline: none;
        }
        .spinbox-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        /* Hover effects only on devices that support hover */
        @media (hover: hover) {
          .spinbox-button:not(:disabled):hover {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        /* Active state for touch feedback on mobile */
        .spinbox-button:not(:disabled):active {
          opacity: 0.8;
          transform: scale(1.05);
        }
        /* Aggressively remove focus state on mobile/touch devices */
        @media (hover: none) {
          .spinbox-button:not(:disabled):focus {
            outline: none !important;
            opacity: 1 !important;
            transform: scale(1) !important;
          }
          .spinbox-button:not(:disabled):focus:active {
            opacity: 0.8;
            transform: scale(1.05);
          }
          /* Ensure hover state is cleared on touch devices */
          .spinbox-button:not(:disabled):hover {
            opacity: 1;
            transform: scale(1);
          }
        }
        /* Clear focus state after touch ends - global rule */
        .spinbox-button:not(:disabled):focus:not(:active) {
          opacity: 1 !important;
          transform: scale(1) !important;
        }
        /* Prevent sticky focus on touch end */
        .spinbox-button:focus-visible {
          outline: none;
        }
        /* Ensure no visual changes on focus for touch devices */
        @media (pointer: coarse) {
          .spinbox-button:focus {
            outline: none !important;
            opacity: 1 !important;
            transform: scale(1) !important;
          }
        }
      </style>
      <div class="spinbox-module-container" style=${this.styleObjectToCss(E)}>
        <div
          class="spinbox-container"
          style="display: flex; align-items: center; justify-content: center;"
        >
          ${(()=>{const t=o.qy`
        <div style="${Q}">
          ${L?o.qy` <div style="${Z?"":`margin-bottom: ${q}px;`}">
                  ${X}
                </div>
                <div>${R}</div>`:o.qy` <div style="${Z?"":`margin-right: ${q}px;`}">
                  ${R}
                </div>
                <div>${X}</div>`}
        </div>
      `,e=K?`gap: ${B}px;`:"";switch(W){case"top":return o.qy`
            <div
              style="display: flex; flex-direction: column; align-items: center; ${e}"
            >
              <div style="${K?"":`margin-bottom: ${B}px;`}">
                ${J}
              </div>
              ${t}
            </div>
          `;case"bottom":return o.qy`
            <div
              style="display: flex; flex-direction: column; align-items: center; ${e}"
            >
              <div style="${K?"":`margin-bottom: ${B}px;`}">
                ${t}
              </div>
              ${J}
            </div>
          `;case"left":return o.qy`
            <div style="display: flex; flex-direction: row; align-items: center; ${e}">
              <div style="${K?"":`margin-right: ${B}px;`}">
                ${J}
              </div>
              ${t}
            </div>
          `;case"right":return o.qy`
            <div style="display: flex; flex-direction: row; align-items: center; ${e}">
              <div style="${K?"":`margin-right: ${B}px;`}">
                ${t}
              </div>
              ${J}
            </div>
          `;default:return L?o.qy`
              <div
                style="display: flex; flex-direction: column; align-items: center; ${e}"
              >
                <div style="${K?"":`margin-bottom: ${B}px;`}">
                  ${X}
                </div>
                <div style="${K?"":`margin-bottom: ${B}px;`}">
                  ${J}
                </div>
                ${R}
              </div>
            `:o.qy`
              <div style="display: flex; flex-direction: row; align-items: center; ${e}">
                <div style="${K?"":`margin-right: ${B}px;`}">
                  ${R}
                </div>
                <div style="${K?"":`margin-right: ${B}px;`}">
                  ${J}
                </div>
                ${X}
              </div>
            `}})()}
        </div>
      </div>
    `}async callEntityService(t,e,i,o){var n,l,a,r,s;const d=o||t.split(".")[0],c=i.states[t];console.log(`[Spinbox] Calling service for ${t} with value ${e}`);let u="",p={};try{switch(d){case"input_number":case"number":u=`${d}.set_value`,p={entity_id:t,value:e};break;case"climate":u="climate.set_temperature";const i=null==c?void 0:c.state,o=void 0!==(null===(n=null==c?void 0:c.attributes)||void 0===n?void 0:n.target_temp_high),v=void 0!==(null===(l=null==c?void 0:c.attributes)||void 0===l?void 0:l.target_temp_low);if(p={entity_id:t},"heat_cool"===i&&(o||v)){const t=null===(a=null==c?void 0:c.attributes)||void 0===a?void 0:a.temperature,i=null===(r=null==c?void 0:c.attributes)||void 0===r?void 0:r.target_temp_high,o=null===(s=null==c?void 0:c.attributes)||void 0===s?void 0:s.target_temp_low;if(void 0!==t&&void 0!==i&&void 0!==o){Math.abs(e-i)<Math.abs(e-o)?(p.target_temp_high=e,p.target_temp_low=o):(p.target_temp_low=e,p.target_temp_high=i)}else p.target_temp_high=e+2,p.target_temp_low=e-2;console.log("[Spinbox] Climate heat_cool mode - serviceData:",p)}else p.temperature=e,console.log(`[Spinbox] Climate single temp mode - temperature: ${e}`);break;default:return void console.warn(`[Spinbox] Unsupported entity domain: ${d}`)}console.log(`[Spinbox] Calling service ${u} with data:`,p),await i.callService(u.split(".")[0],u.split(".")[1],p),console.log("[Spinbox] Service call successful")}catch(e){console.error(`[Spinbox] Failed to call service for ${t}:`,e),console.error("[Spinbox] Service data was:",p)}}getDecimalPlaces(t){const e=t.toString();return e.includes(".")?e.split(".")[1].length:0}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${e}`)).join("; ")}getBackgroundImageCSS(t,e){var i,o;const n=t.background_image_type,l=t.background_image,a=t.background_image_entity;if(!n||"none"===n)return"none";switch(n){case"upload":if(l)return`url("${(0,p.V)(e,l)}")`;break;case"url":if(l)return`url("${l}")`;break;case"entity":if(a&&e){const t=e.states[a];if(t){const n=(null===(i=t.attributes)||void 0===i?void 0:i.entity_picture)||(null===(o=t.attributes)||void 0===o?void 0:o.image)||("string"==typeof t.state?t.state:"");if(n&&"unknown"!==n&&"unavailable"!==n)return`url("${(0,p.V)(e,n)}")`}}}return"none"}_hashString(t){let e=0;for(let i=0;i<t.length;i+=1)e=(e<<5)-e+t.charCodeAt(i),e|=0;return e}}},9327:(t,e,i)=>{function o(t,e,i){var o;const n=null===(o=null==e?void 0:e.states)||void 0===o?void 0:o[t];if(!n)return{entity:t,state:"unavailable",name:(null==i?void 0:i.name)||t,attributes:{},unit:"",domain:t.split(".")[0]||"unknown",device_class:"",friendly_name:(null==i?void 0:i.name)||t,config:i||{}};const l=t.split(".")[0],a=n.attributes||{};return{entity:t,state:n.state,name:(null==i?void 0:i.name)||a.friendly_name||t,attributes:a,unit:a.unit_of_measurement||"",domain:l,device_class:a.device_class||"",friendly_name:a.friendly_name||"",config:i||{},state_number:parseFloat(n.state),state_boolean:"on"===n.state||"true"===n.state||"yes"===n.state}}function n(t,e,i){const n=t.map(((t,n)=>{const l=null==i?void 0:i[n];return o(t,e,l)})),l=n[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},l),{entities:n})}i.d(e,{pL:()=>o,wI:()=>n})}}]);