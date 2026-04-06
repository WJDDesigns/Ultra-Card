"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[4339],{6315:(t,e,i)=>{i.r(e),i.d(e,{UltraButtonModule:()=>g});var o=i(5183),n=i(6478),a=i(7475);class r{static getInstance(){return r.instance||(r.instance=new r),r.instance}setHass(t){this.hass=t}async executeAction(t){if(this.hass&&t.action_type&&"none"!==t.action_type)try{if(t.confirmation&&!confirm(t.confirmation.text||"Are you sure?"))return;switch(t.action_type){case"toggle":t.entity&&await this.hass.callService("homeassistant","toggle",{entity_id:t.entity});break;case"show_more_info":if(t.entity){const e=new CustomEvent("hass-more-info",{detail:{entityId:t.entity},bubbles:!0,composed:!0});document.dispatchEvent(e)}break;case"navigate":if(t.navigation_path){history.pushState(null,"",t.navigation_path);const e=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.dispatchEvent(e)}break;case"url":if(t.url||t.url_path){const e=t.url||t.url_path||"";window.open(e,"_blank")}break;case"call_service":if(t.service){const[e,i]=t.service.split(".");e&&i&&await this.hass.callService(e,i,t.service_data,t.target)}break;case"perform_action":if(t.custom_action){const e=new CustomEvent("action",{detail:{action:"tap",config:t.custom_action},bubbles:!0,composed:!0});document.dispatchEvent(e)}break;case"show_map":if(t.latitude&&t.longitude){const e=`/map?latitude=${t.latitude}&longitude=${t.longitude}`;history.pushState(null,"",e);const i=new CustomEvent("location-changed",{detail:{replace:!1},bubbles:!0,composed:!0});window.dispatchEvent(i)}break;case"voice_assistant":if(!1!==t.start_listening){const t=new CustomEvent("hass-start-voice-conversation",{bubbles:!0,composed:!0});document.dispatchEvent(t)}break;case"trigger":t.entity&&await this.hass.callService("automation","trigger",{entity_id:t.entity});break;default:console.warn("Unknown action type:",t.action_type)}}catch(t){console.error("Error executing action:",t)}}getActionTypeOptions(){return[{value:"none",label:"No Action"},{value:"toggle",label:"Toggle"},{value:"show_more_info",label:"Show More Info"},{value:"navigate",label:"Navigate to Path"},{value:"url",label:"Open URL"},{value:"call_service",label:"Call Service"},{value:"perform_action",label:"Perform Action"},{value:"show_map",label:"Show Map"},{value:"voice_assistant",label:"Voice Assistant"},{value:"trigger",label:"Trigger"}]}validateAction(t){const e=[];if(!t.action_type||"none"===t.action_type)return{valid:!0,errors:[]};switch(t.action_type){case"toggle":case"show_more_info":case"trigger":t.entity||e.push("Entity is required for this action type");break;case"navigate":t.navigation_path||e.push("Navigation path is required");break;case"url":t.url||t.url_path||e.push("URL is required");break;case"call_service":t.service?t.service.includes(".")||e.push("Service must be in domain.service format"):e.push("Service is required");break;case"show_map":void 0!==t.latitude&&void 0!==t.longitude||e.push("Latitude and longitude are required for map action")}return{valid:0===e.length,errors:e}}renderActionForm(t,e,i){return{action:e,actionTypes:this.getActionTypeOptions(),onUpdate:i,validate:()=>this.validateAction(e)}}}const s=r.getInstance();var l=i(5147),c=i(8938),d=i(5262),u=(i(7921),i(6990));class g extends a.m{constructor(){super(...arguments),this.metadata={type:"button",title:"Button",description:"Interactive buttons with actions",author:"WJD Designs",version:"1.0.0",icon:"mdi:gesture-tap-button",category:"interactive",tags:["button","action","click","interactive"]}}createDefault(t,e){return{id:t||this.generateId("button"),type:"button",label:"",action:{action_type:"none"},style:"flat",icon:"",icon_position:"before",show_icon:!1,icon_size:"24px",background_color:"var(--primary-color)",text_color:"white",use_entity_color:!1,background_color_entity:"",background_state_colors:{},tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}getButtonStyles(t){return[{value:"flat",label:(0,n.kg)("editor.button.styles.flat",t,"Flat (Default)")},{value:"glossy",label:(0,n.kg)("editor.button.styles.glossy",t,"Glossy")},{value:"embossed",label:(0,n.kg)("editor.button.styles.embossed",t,"Embossed")},{value:"inset",label:(0,n.kg)("editor.button.styles.inset",t,"Inset")},{value:"gradient-overlay",label:(0,n.kg)("editor.button.styles.gradient_overlay",t,"Gradient Overlay")},{value:"neon-glow",label:(0,n.kg)("editor.button.styles.neon_glow",t,"Neon Glow")},{value:"outline",label:(0,n.kg)("editor.button.styles.outline",t,"Outline")},{value:"glass",label:(0,n.kg)("editor.button.styles.glass",t,"Glass")},{value:"metallic",label:(0,n.kg)("editor.button.styles.metallic",t,"Metallic")}]}getAlignmentOptions(t){return[{value:"left",label:(0,n.kg)("editor.button.align.left",t,"Left")},{value:"center",label:(0,n.kg)("editor.button.align.center",t,"Center")},{value:"right",label:(0,n.kg)("editor.button.align.right",t,"Right")},{value:"justify",label:(0,n.kg)("editor.button.align.justify",t,"Justify (Full Width)")}]}getIconPositionOptions(t){return[{value:"before",label:(0,n.kg)("editor.button.icon.before",t,"Before Text")},{value:"after",label:(0,n.kg)("editor.button.icon.after",t,"After Text")}]}renderGeneralTab(t,e,i,a){var r;const s=t,l=(null===(r=null==e?void 0:e.locale)||void 0===r?void 0:r.language)||"en";return o.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Basic Settings -->
        ${this.renderSettingsSection((0,n.kg)("editor.button.basic.title",l,"Basic Settings"),(0,n.kg)("editor.button.basic.desc",l,"Configure the button appearance and text content."),[{title:(0,n.kg)("editor.button.text.title",l,"Button Text"),description:(0,n.kg)("editor.button.text.desc",l,"Text to display on the button (leave blank for icon-only)."),hass:e,data:s,schema:[this.textField("label")],onChange:t=>a(t.detail.value)},{title:(0,n.kg)("editor.button.style.title",l,"Button Style"),description:(0,n.kg)("editor.button.style.desc",l,"Visual style of the button"),hass:e,data:{style:s.style||"flat"},schema:[this.selectField("style",this.getButtonStyles(l))],onChange:t=>{t.detail.value.style!==(s.style||"flat")&&(a(t.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}},{title:(0,n.kg)("editor.button.alignment.title",l,"Alignment"),description:(0,n.kg)("editor.button.alignment.desc",l,"How the button is aligned within its container"),hass:e,data:{alignment:s.alignment||"center"},schema:[this.selectField("alignment",this.getAlignmentOptions(l))],onChange:t=>{t.detail.value.alignment!==(s.alignment||"center")&&(a(t.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}}])}

        <!-- Icon Settings -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,n.kg)("editor.button.icon.title",l,"Icon Settings")}
          </div>

          <!-- Icon Field - Always visible -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection((0,n.kg)("editor.button.icon_field",l,"Icon"),(0,n.kg)("editor.button.icon_desc",l,"Icon to display (e.g., mdi:home). Selecting an icon will automatically enable icon display."),e,{icon:s.icon||""},[this.iconField("icon")],(t=>{const e=t.detail.value;e.icon&&e.icon.trim()?(e.show_icon=!0,s.icon_position||(e.icon_position="before")):e.icon&&e.icon.trim()||(e.show_icon=!1),a(e)}))}
          </div>

          ${s.show_icon&&s.icon?o.qy`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,n.kg)("editor.button.icon_position",l,"Icon Position"),(0,n.kg)("editor.button.icon_position_desc",l,"Position of the icon relative to text"),e,{icon_position:s.icon_position||"before"},[this.selectField("icon_position",this.getIconPositionOptions(l))],(t=>{t.detail.value.icon_position!==(s.icon_position||"before")&&(a(t.detail.value),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 8px;"
                  >
                    ${(0,n.kg)("editor.button.icon_size",l,"Icon Size")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
                  >
                    ${(0,n.kg)("editor.button.icon_size_desc",l,"Size of the icon in pixels")}
                  </div>
                  <div
                    class="gap-control-container"
                    style="display: flex; align-items: center; gap: 12px;"
                  >
                    <input
                      type="range"
                      class="gap-slider"
                      min="12"
                      max="64"
                      step="1"
                      .value="${String("number"==typeof s.icon_size?s.icon_size:parseInt(String(s.icon_size||"24").replace("px",""))||24)}"
                      @input=${t=>{const e=t.target,i=Number(e.value);a({icon_size:`${i}px`}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                    />
                    <input
                      type="number"
                      class="gap-input"
                      min="12"
                      max="64"
                      step="1"
                      .value="${String("number"==typeof s.icon_size?s.icon_size:parseInt(String(s.icon_size||"24").replace("px",""))||24)}"
                      @input=${t=>{const e=t.target,i=Number(e.value);isNaN(i)||(a({icon_size:`${i}px`}),setTimeout((()=>this.triggerPreviewUpdate()),50))}}
                      @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const e=t.target,i=Number(e.value)||24,o="ArrowUp"===t.key?1:-1,n=Math.max(12,Math.min(64,i+o));a({icon_size:`${n}px`}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}}
                    />
                    <button
                      class="reset-btn"
                      @click=${()=>{a({icon_size:"24px"}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      title="${(0,n.kg)("editor.fields.reset_default_value",l,"Reset to default ({value})").replace("{value}","24")}"
                    >
                      <ha-icon icon="mdi:refresh"></ha-icon>
                    </button>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Colors -->
        <div class="settings-section">
          <div class="section-title">${(0,n.kg)("editor.button.colors.title",l,"Colors")}</div>

          <!-- Entity-based Background Color Toggle -->
          <div class="field-group" style="margin-top: 16px; margin-bottom: 16px;">
            ${this.renderFieldSection((0,n.kg)("editor.button.use_entity_color",l,"Use Entity Color"),(0,n.kg)("editor.button.use_entity_color_desc",l,"Change button background color based on entity state"),e,{use_entity_color:s.use_entity_color||!1},[this.booleanField("use_entity_color")],(t=>{const e=t.detail.value.use_entity_color;a({use_entity_color:e,background_color_entity:e?s.background_color_entity:""}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
          </div>

          ${s.use_entity_color?o.qy`
                <!-- Entity Picker -->
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection((0,n.kg)("editor.button.background_color_entity",l,"Entity"),(0,n.kg)("editor.button.background_color_entity_desc",l,"Entity to watch for color changes"),e,{background_color_entity:s.background_color_entity||""},[this.entityField("background_color_entity")],(t=>{a(t.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
                </div>

                <!-- State Colors Mapping -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 8px;"
                  >
                    ${(0,n.kg)("editor.button.state_colors",l,"State Colors")}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
                  >
                    ${(0,n.kg)("editor.button.state_colors_desc",l,"Optional: Map specific entity states to colors (e.g., on: green, off: gray). If not set, will use entity RGB color or state-based defaults.")}
                  </div>
                  ${this.renderStateColorsEditor(s.background_state_colors||{},e,l,(t=>{a({background_state_colors:t}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
                </div>
              `:o.qy`
                <!-- Static Background Color -->
                <div class="color-controls">
                  <ultra-color-picker
                    .label=${(0,n.kg)("editor.button.colors.background",l,"Background Color")}
                    .value=${s.background_color||"var(--primary-color)"}
                    .defaultValue=${"var(--primary-color)"}
                    .hass=${e}
                    @value-changed=${t=>a({background_color:t.detail.value})}
                  ></ultra-color-picker>
                </div>
              `}

          <!-- Text Color (always visible) -->
          <div class="color-controls" style="margin-top: 16px;">
            <ultra-color-picker
              .label=${(0,n.kg)("editor.button.colors.text",l,"Text Color")}
              .value=${s.text_color||"white"}
              .defaultValue=${"white"}
              .hass=${e}
              @value-changed=${t=>a({text_color:t.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Actions Setup Guide -->
        <div class="settings-section">
          <div class="section-title">
            ${(0,n.kg)("editor.button.actions.title",l,"Button Actions")}
          </div>
          <div
            class="section-description"
            style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 14px;"
          >
            ${(0,n.kg)("editor.button.actions.desc",l,"Configure what happens when users tap, hold, or double-tap this button.")}
          </div>
          <ha-button
            raised
            style="width: 100%; --mdc-theme-primary: var(--primary-color);"
            @click=${()=>{const t=new CustomEvent("switch-to-actions-tab",{bubbles:!0,composed:!0,detail:{tab:"actions"}});document.dispatchEvent(t)}}
          >
            <ha-icon icon="mdi:gesture-tap" slot="icon"></ha-icon>
            ${(0,n.kg)("editor.button.actions.setup",l,"Set up button actions")}
          </ha-button>
        </div>
      </div>
    `}renderLinkActionForm(t,e,i){const n=s.getActionTypeOptions();return o.qy`
      <div class="link-action-form">
        <!-- Action Type -->
        <div class="field-group" style="margin-bottom: 16px;">
          ${this.renderFieldSection("Action Type","Choose what happens when the button is clicked",e,{action_type:t.action_type||"none"},[this.selectField("action_type",n)],(e=>{const o=e.detail.value.action_type;o!==(t.action_type||"none")&&(i(Object.assign(Object.assign({},t),{action_type:o})),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
        </div>

        ${this.renderActionTypeSpecificFields(t,e,i)}
      </div>
    `}renderActionTypeSpecificFields(t,e,i){switch(t.action_type){case"toggle":case"show_more_info":case"trigger":return this.renderFieldSection("Entity","Select the entity to interact with",e,{entity:t.entity||""},[this.entityField("entity")],(e=>i(Object.assign(Object.assign({},t),{entity:e.detail.value.entity}))));case"navigate":return this.renderFieldSection("Navigation Path","Path to navigate to (e.g., /dashboard/energy)",e,{navigation_path:t.navigation_path||""},[this.textField("navigation_path")],(e=>i(Object.assign(Object.assign({},t),{navigation_path:e.detail.value.navigation_path}))));case"url":return this.renderFieldSection("URL","URL to open (e.g., https://example.com)",e,{url:t.url||""},[this.textField("url")],(e=>i(Object.assign(Object.assign({},t),{url:e.detail.value.url}))));case"call_service":return o.qy`
          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection("Service","Service to call (e.g., light.turn_on)",e,{service:t.service||""},[this.textField("service")],(e=>i(Object.assign(Object.assign({},t),{service:e.detail.value.service}))))}
          </div>

          <div class="field-group">
            ${this.renderFieldSection("Service Data (JSON)","Optional data to pass to the service (JSON format)",e,{service_data:JSON.stringify(t.service_data||{})},[this.textField("service_data")],(e=>{try{const o=JSON.parse(e.detail.value.service_data||"{}");i(Object.assign(Object.assign({},t),{service_data:o}))}catch(t){console.warn("Invalid JSON in service data")}}))}
          </div>
        `;default:return o.qy``}}renderActionsTab(t,e,i,o){const n=t;return l.A.render(n,e,(t=>o(t)))}renderButtonActionConfig(t,e,i){return o.qy`
      <div style="margin-bottom: 16px;">
        ${this.renderSingleActionConfig("Tap Action","Action to perform when button is tapped",t.tap_action||{action:"nothing"},e,(t=>i({tap_action:t})))}
      </div>

      <div style="margin-bottom: 16px;">
        ${this.renderSingleActionConfig("Hold Action","Action to perform when button is held down",t.hold_action||{action:"nothing"},e,(t=>i({hold_action:t})))}
      </div>

      <div style="margin-bottom: 16px;">
        ${this.renderSingleActionConfig("Double Tap Action","Action to perform when button is double-tapped",t.double_tap_action||{action:"nothing"},e,(t=>i({double_tap_action:t})))}
      </div>
    `}renderSingleActionConfig(t,e,i,n,a){return o.qy`
      <div style="margin-bottom: 16px;">
        <div
          class="field-title"
          style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
        >
          ${t}
        </div>
        <div style="margin-bottom: 12px;">
          <ha-form
            .hass=${n}
            .data=${{action_config:"nothing"===(null==i?void 0:i.action)?Object.assign(Object.assign({},i),{action:"default"}):i}}
            .schema=${[{name:"action_config",label:"",selector:{ui_action:{actions:["default","more-info","toggle","navigate","url","perform-action","assist"]}}}]}
            .computeLabel=${t=>t.label||""}
            .computeDescription=${t=>t.description||""}
            @value-changed=${t=>{var e;const i=null===(e=t.detail.value)||void 0===e?void 0:e.action_config;i&&a(i)}}
          ></ha-form>
        </div>
      </div>
    `}renderPreview(t,e,i,n){var a,r,s,l,c,u,g,p;const b=t,h=b,_=b.design||{},v="string"==typeof h.font_size?h.font_size:void 0,m=("string"==typeof _.font_size&&""!==_.font_size.trim()?_.font_size:v)||"14px",y=this.addPixelUnit(m)||"14px";let x=_.background_color||b.background_color||"var(--primary-color)";if(b.use_entity_color&&b.background_color_entity&&e){const t=e.states[b.background_color_entity];if(t)if(b.background_state_colors&&Object.keys(b.background_state_colors).length>0){const e=b.background_state_colors[t.state];if(e)x=e;else{const e=this.getEntityStateColor(t);e&&(x=e)}}else{const e=this.getEntityStateColor(t);e&&(x=e)}}const f=!!(_.color||h.color||b.text_color||h.text_color),w=_.color||h.color||b.text_color||h.text_color||"white",k=_.font_weight||h.font_weight||"500",$=_.font_family||h.font_family||"inherit",S=_.font_style||h.font_style||"normal",C=_.text_transform||h.text_transform||"none",P=_.letter_spacing||h.letter_spacing||void 0,A=null!=P&&""!==`${P}`.trim()?`${P}`:void 0,O=_.line_height||h.line_height,U=null!=O&&""!==`${O}`.trim()?`${O}`:void 0,j=b.alignment||"center",T=this.getFlexJustify(j),F=_.text_align||h.text_align||j,z=this.getFlexJustify(F,!0),E=this.resolveTextShadow(_,h),I=b.style||"flat",q={color:w,padding:"12px 24px",fontSize:y,fontWeight:String(k),fontFamily:$,fontStyle:S,textTransform:C,borderRadius:this.addPixelUnit(_.border_radius||h.border_radius)||"8px",cursor:"pointer",transition:"all 0.2s ease",display:"flex",alignItems:"center",justifyContent:z,gap:"8px",minHeight:"40px",textShadow:E};A&&(q.letterSpacing=A),U&&(q.lineHeight=U);const B={flat:{background:x,border:"none",boxShadow:"none"},glossy:{background:`linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${x}`,border:"none"},embossed:{background:x,border:"1px solid rgba(0,0,0,0.15)",boxShadow:"inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.15)"},inset:{background:x,border:"none",boxShadow:"inset 0 2px 6px rgba(0,0,0,0.35)"},"gradient-overlay":{background:`linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,0,0,0.15)), ${x}`,border:"none"},"neon-glow":{background:x,border:"none",boxShadow:`0 0 10px ${x}, 0 0 20px ${x}`},outline:{background:"transparent",border:`2px solid ${x}`},glass:{background:x,backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.25)"},metallic:{background:"linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7)",border:"1px solid #bbb"}};f||(B.outline.color=x,B.metallic.color="#333");const N=Object.assign(Object.assign({},q),B[I]||B.flat);[["width",null!==(a=_.width)&&void 0!==a?a:h.width],["height",null!==(r=_.height)&&void 0!==r?r:h.height],["maxWidth",null!==(s=_.max_width)&&void 0!==s?s:h.max_width],["maxHeight",null!==(l=_.max_height)&&void 0!==l?l:h.max_height],["minWidth",null!==(c=_.min_width)&&void 0!==c?c:h.min_width],["minHeight",null!==(u=_.min_height)&&void 0!==u?u:h.min_height]].forEach((([t,e])=>{const i=this.addPixelUnit(e);i&&(N[t]=i)})),N.width||"justify"!==j||(N.width="100%");const M={display:"flex",justifyContent:T,alignItems:"center",width:"100%"},R=this.addPixelUnit(_.padding_top||h.padding_top),H=this.addPixelUnit(_.padding_right||h.padding_right),L=this.addPixelUnit(_.padding_bottom||h.padding_bottom),D=this.addPixelUnit(_.padding_left||h.padding_left),J=R||H||L||D,G=this.addPixelUnit(_.margin_top||h.margin_top),V=this.addPixelUnit(_.margin_right||h.margin_right),W=this.addPixelUnit(_.margin_bottom||h.margin_bottom),X=this.addPixelUnit(_.margin_left||h.margin_left),Z={width:"100%",height:"auto",maxWidth:"none",maxHeight:"none",minWidth:"auto",minHeight:"auto",padding:J?`${R||"0"} ${H||"0"} ${L||"0"} ${D||"0"}`:"0",margin:G||V||W||X?`${G||"8px"} ${V||"0"} ${W||"8px"} ${X||"0"}`:"8px 0",background:_.background_color||"transparent",backgroundImage:this.getBackgroundImageCSS(Object.assign(Object.assign({},h),_),e),backgroundSize:_.background_size||h.background_size||"cover",backgroundPosition:_.background_position||h.background_position||"center",backgroundRepeat:_.background_repeat||h.background_repeat||"no-repeat",borderRadius:this.addPixelUnit(_.border_radius||h.border_radius)||"8px",border:_.border_style&&"none"!==_.border_style?`${this.addPixelUnit(_.border_width)||"1px"} ${_.border_style} ${_.border_color||"var(--divider-color)"}`:"none",boxShadow:_.box_shadow_h||_.box_shadow_v||_.box_shadow_blur||_.box_shadow_spread?`${this.addPixelUnit(_.box_shadow_h)||"0px"} ${this.addPixelUnit(_.box_shadow_v)||"0px"} ${this.addPixelUnit(_.box_shadow_blur)||"0px"} ${this.addPixelUnit(_.box_shadow_spread)||"0px"} ${_.box_shadow_color||"rgba(0,0,0,.2)"}`:"none",boxSizing:"border-box"},K=this.createGestureHandlers(b.id,{tap_action:b.tap_action,hold_action:b.hold_action,double_tap_action:b.double_tap_action,entity:b.entity,module:b},e,i),Q=null===(g=b.design)||void 0===g?void 0:g.hover_effect,Y=d.k.getHoverEffectClass(Q),tt=this.addPixelUnit(b.icon_size)||"24px";return o.qy`
      <div class="button-module-container" style="${this.styleObjectToCss(Z)}">
        <div class="button-module-preview" style="${this.styleObjectToCss(M)}">
          <button
            class="ultra-button ${I} ${"justify"===j?"justify":""} ${Y}"
            style="${this.styleObjectToCss(N)}"
            aria-label="${(b.label||"Button").trim()||"Button"}"
            @pointerdown=${K.onPointerDown}
            @pointerup=${K.onPointerUp}
            @pointerleave=${K.onPointerLeave}
          >
            ${b.show_icon&&b.icon&&"before"===b.icon_position?o.qy`<ha-icon
                  icon="${b.icon}"
                  style="--mdc-icon-size: ${tt}; width: ${tt}; height: ${tt};"
                ></ha-icon>`:""}
            ${null!==(p=b.label)&&void 0!==p?p:""}
            ${b.show_icon&&b.icon&&"after"===b.icon_position?o.qy`<ha-icon
                  icon="${b.icon}"
                  style="--mdc-icon-size: ${tt}; width: ${tt}; height: ${tt};"
                ></ha-icon>`:""}
          </button>
        </div>
      </div>
    `}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${t.replace(/([A-Z])/g,"-$1").toLowerCase()}: ${e}`)).join("; ")}getFlexJustify(t,e=!1){switch(t){case"left":return"flex-start";case"right":return"flex-end";case"justify":return e?"space-between":"center";default:return"center"}}resolveTextShadow(t,e){return["text_shadow_h","text_shadow_v","text_shadow_blur","text_shadow_color"].some((e=>{const i=t[e];return null!=i&&""!==`${i}`.trim()}))?`${this.addPixelUnit(t.text_shadow_h)||"0px"} ${this.addPixelUnit(t.text_shadow_v)||"0px"} ${this.addPixelUnit(t.text_shadow_blur)||"0px"} ${t.text_shadow_color||"rgba(0,0,0,.2)"}`:["text_shadow_h","text_shadow_v","text_shadow_blur","text_shadow_color"].some((t=>{const i=e[t];return null!=i&&""!==`${i}`.trim()}))?`${this.addPixelUnit(e.text_shadow_h)||"0px"} ${this.addPixelUnit(e.text_shadow_v)||"0px"} ${this.addPixelUnit(e.text_shadow_blur)||"0px"} ${e.text_shadow_color||"rgba(0,0,0,.2)"}`:"none"}addPixelUnit(t){if(null==t)return;const e=String(t).trim();return e?/^-?\d+(?:\.\d+)?$/.test(e)?`${e}px`:/^(?:-?\d+(?:\.\d+)?\s+)+-?\d+(?:\.\d+)?$/.test(e)?e.split(/\s+/).map((t=>/^-?\d+(?:\.\d+)?$/.test(t)?`${t}px`:t)).join(" "):e:void 0}renderStateColorsEditor(t,e,i,a){return o.qy`
      <div class="state-color-editor">
        ${Object.entries(t).map((([i,n])=>o.qy`
            <div
              class="state-color-row"
              style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; min-width: 0; overflow: hidden;"
            >
              <input
                type="text"
                class="state-color-input"
                placeholder="State (e.g., on, off)"
                .value=${i}
                style="flex: 0 0 120px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); flex-shrink: 0;"
                @input=${e=>{const o=e.target.value,r=Object.assign({},t);delete r[i],o.trim()&&(r[o.trim()]=n),a(r)}}
              />
              <div style="flex: 1; min-width: 0; overflow: hidden;">
                <ultra-color-picker
                  .label=${""}
                  .value=${n}
                  .defaultValue=${"gray"}
                  .hass=${e}
                  style="width: 100%;"
                  @value-changed=${e=>{const o=Object.assign(Object.assign({},t),{[i]:e.detail.value});a(o)}}
                ></ultra-color-picker>
              </div>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${()=>{const e=Object.assign({},t);delete e[i],a(e)}}
              ></ha-icon>
            </div>
          `))}
        <button
          class="add-state-color-btn"
          style="margin-top: 8px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
          @click=${()=>{const e=Object.assign(Object.assign({},t),{new_state:"gray"});a(e)}}
        >
          <ha-icon icon="mdi:plus" style="margin-right: 4px;"></ha-icon>
          ${(0,n.kg)("editor.button.add_state_color",i,"Add State Color")}
        </button>
      </div>
    `}getEntityStateColor(t){if(!t||!t.attributes)return null;if(t.attributes.rgb_color&&Array.isArray(t.attributes.rgb_color))return`rgb(${t.attributes.rgb_color.join(",")})`;if(t.attributes.hs_color&&Array.isArray(t.attributes.hs_color)){const[e,i]=t.attributes.hs_color;return`rgb(${this.hsToRgb(e/360,i/100,1).join(",")})`}if(t.attributes.color_name)return t.attributes.color_name;if(t.attributes.color&&"string"==typeof t.attributes.color)return t.attributes.color;if(t.entity_id){const e=t.entity_id.split(".")[0],i=t.state;switch(e){case"light":return"on"===i?"#FFA500":"#666666";case"switch":return"on"===i?"#4CAF50":"#666666";case"binary_sensor":return"on"===i?"#F44336":"#4CAF50";default:return"on"===i||"open"===i||"active"===i?"var(--primary-color)":"#666666"}}return null}hsToRgb(t,e,i){let o,n,a;const r=Math.floor(6*t),s=6*t-r,l=i*(1-e),c=i*(1-s*e),d=i*(1-(1-s)*e);switch(r%6){case 0:o=i,n=d,a=l;break;case 1:o=c,n=i,a=l;break;case 2:o=l,n=i,a=d;break;case 3:o=l,n=c,a=i;break;case 4:o=d,n=l,a=i;break;case 5:o=i,n=l,a=c;break;default:o=0,n=0,a=0}return[Math.round(255*o),Math.round(255*n),Math.round(255*a)]}getBackgroundImageCSS(t,e){var i,o;const n=t.background_image_type,a=t.background_image,r=t.background_image_entity;if(!n||"none"===n)return"none";switch(n){case"upload":if(a)return`url("${(0,u.V)(e,a)}")`;break;case"url":if(a)return`url("${a}")`;break;case"entity":if(r&&e){const t=e.states[r];if(t){const n=(null===(i=t.attributes)||void 0===i?void 0:i.entity_picture)||(null===(o=t.attributes)||void 0===o?void 0:o.image)||("string"==typeof t.state?t.state:"");if(n&&"unknown"!==n&&"unavailable"!==n)return`url("${(0,u.V)(e,n)}")`}}}return"none"}renderLogicTab(t,e,i,o){return c.X.render(t,e,(t=>o(t)))}getStyles(){return"\n      /* State color editor styles */\n      .state-color-editor {\n        width: 100%;\n      }\n\n      .state-color-row {\n        width: 100%;\n        min-width: 0;\n        overflow: hidden;\n      }\n\n      .state-color-row ultra-color-picker {\n        min-width: 0;\n        flex: 1;\n      }\n\n      /* Gap control styles for sliders */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 48px !important;\n        max-width: 48px !important;\n        min-width: 48px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n    "}}}}]);