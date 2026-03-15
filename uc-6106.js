"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6106],{6106:(e,t,i)=>{i.r(t),i.d(t,{UltraNavigationModule:()=>d});var a=i(5183),n=i(7475),o=i(766),l=i(6617),s=(i(7921),i(3917),i(9009),function(e,t){var i={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&t.indexOf(a)<0&&(i[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var n=0;for(a=Object.getOwnPropertySymbols(e);n<a.length;n++)t.indexOf(a[n])<0&&Object.prototype.propertyIsEnumerable.call(e,a[n])&&(i[a[n]]=e[a[n]])}return i});const r=[{id:"uc_modern",name:"UC Modern",description:"Clean modern style with rounded buttons and subtle shadows"},{id:"uc_minimal",name:"UC Minimal",description:"Minimal flat design with sharp edges"},{id:"uc_ios_glass",name:"iOS Glass",description:"iOS-style glassmorphism with heavy blur and vibrancy"},{id:"uc_material",name:"Material Design",description:"Material Design 3 elevated surface with tonal colors"},{id:"uc_floating",name:"Floating Pill",description:"Floating pill design with maximum border radius"},{id:"uc_docked",name:"Docked Bar",description:"Edge-to-edge bar without border radius"},{id:"uc_neumorphic",name:"Neumorphic",description:"Soft UI with light and dark shadows"},{id:"uc_gradient",name:"Gradient",description:"Colorful gradient background"},{id:"uc_sidebar",name:"Sidebar",description:"Vertical sidebar optimized for left/right positions"},{id:"uc_compact",name:"Compact",description:"Ultra-compact with smaller icons and tight spacing"}];class d extends n.m{constructor(){super(...arguments),this.metadata={type:"navigation",title:"Navigation",description:"Add a global navigation bar with routes, popups, and media player controls",author:"WJD Designs",version:"1.0.0",icon:"mdi:compass-outline",category:"layout",tags:["navigation","navbar","menu","routes","layout"]},this._expandedRoutes=new Set,this._expandedSpecialItems=new Set,this._draggedItem=null}createDefault(e,t){return{id:e||this.generateId("navigation"),type:"navigation",nav_routes:[{id:this.generateId("nav-route"),icon:"mdi:home",label:"Home",url:"/lovelace/home"}],nav_scope:"all_views",nav_style:"uc_modern",nav_desktop:{mode:"floating",show_labels:!0,min_width:768,position:"bottom"},nav_mobile:{mode:"docked",show_labels:!1,position:"bottom"},nav_layout:{},nav_haptic:{url:!1,tap_action:!0,hold_action:!0,double_tap_action:!0},nav_media_player:{enabled:!1,entity:"",display_mode:"icon_click",album_cover_background:!1,icon_position:"end",widget_position:"above",desktop_position:"bottom-center"},nav_styles:"",nav_template:"",display_mode:"always",display_conditions:[]}}buildUnifiedNavItems(e){var t,i;const a=[];if((e.nav_routes||[]).forEach(((e,t)=>{a.push({type:"route",id:e.id,data:e,position:t})})),(e.nav_stacks||[]).forEach(((t,i)=>{a.push({type:"stack",id:t.id,data:t,position:(e.nav_routes||[]).length+i})})),null===(t=e.nav_media_player)||void 0===t?void 0:t.enabled){const t=null===(i=e.nav_media_player)||void 0===i?void 0:i.icon_position;let n=a.length;"start"===t?n=0:"end"===t?n=a.length:"number"==typeof t&&(n=t),a.push({type:"media_player",id:"__media_player__",position:n})}a.sort(((e,t)=>e.position-t.position));const n=[];return a.forEach((e=>{n.push(e),"stack"===e.type&&e.data&&(e.data.children||[]).forEach((t=>{n.push({type:"stack_child",id:t.id,data:t,position:-1,parentStackId:e.id})}))})),n}renderGeneralTab(e,t,i,n){var l,s,d,c,p,v,u,g,h,m,b,_,f,y,x,w,k,$,O,S,j,I,C,P,T,U,A,E,D,q,L,R,M,z,N,H,F,B,J,W,V,G,Z;const K=this.resolveNavigationConfig(e,i),Y=K.nav_routes||[],Q=(null===(l=null==t?void 0:t.locale)||void 0===l||l.language,r.map((e=>({value:e.id,label:`${e.name} - ${e.description}`})))),X=this.buildUnifiedNavItems(K);return a.qy`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getEditorStyles()}
      </style>

      <div class="module-settings">
        <!-- Edit Mode Info Banner -->
        <div class="info-box" style="margin-bottom: 16px;">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span
            >Changes preview live in the navbar below. Close this editor to interact with the
            navbar.</span
          >
        </div>

        <!-- Paths Section -->
        <div class="settings-section">
          <div class="section-title">NAVIGATION ITEMS</div>
          <div class="section-description">
            Configure and reorder items that appear in your navbar. Drag to reorder. Drag paths onto
            a stack to add them as children.
          </div>

          <div class="routes-list" id="nav-items-list">
            ${X.map(((e,a)=>{var o,l,s;if("route"===e.type&&e.data){const o=Y.findIndex((t=>t.id===e.id));return this.renderRouteRow(e.data,o,Y,t,K,n,a,X.length,void 0,i)}if("stack_child"===e.type&&e.data&&e.parentStackId)return this.renderRouteRow(e.data,-1,[],t,K,n,a,X.length,e.parentStackId,i);if("stack"===e.type&&e.data){const i=K.nav_stacks||[],o=i.findIndex((t=>t.id===e.id));return this.renderStackRow(e.data,o,i,t,K,n,a,X.length)}if("media_player"===e.type){const e=(null===(o=K.nav_media_player)||void 0===o?void 0:o.entity)&&""!==(null===(l=K.nav_media_player)||void 0===l?void 0:l.entity);return this.renderSpecialItemRow("media_player","mdi:music","Media Player",e?null===(s=K.nav_media_player)||void 0===s?void 0:s.entity:"⚠️ Click to select entity (required)",a,X.length,K,t,n,i)}return""}))}
          </div>

          <div style="display: flex; gap: 12px;">
            <button
              class="add-entity-btn"
              style="flex: 1;"
              @click=${()=>{const e=this.createDefaultRoute();this._expandedRoutes.add(e.id),n({nav_routes:[...Y,e]})}}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              Add Path
            </button>
            <button
              class="add-entity-btn"
              style="flex: 1;"
              @click=${()=>{const e=K.nav_stacks||[],t=this.createDefaultStack();this._expandedRoutes.add(t.id),n({nav_stacks:[...e,t]})}}
            >
              <ha-icon icon="mdi:view-sequential"></ha-icon>
              Add Stack
            </button>
          </div>
        </div>

        <!-- Special Items Section -->
        <div class="settings-section">
          <div class="section-title">SPECIAL ITEMS</div>
          <div class="section-description">
            Enable special navbar items. When enabled, they appear in the items list above for
            reordering.
          </div>

          <div class="field-container">
            <div
              class="field-row"
              style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0;"
            >
              <div style="display: flex; align-items: center; gap: 12px;">
                <ha-icon icon="mdi:music" style="color: var(--primary-color);"></ha-icon>
                <div>
                  <div class="field-title" style="margin: 0;">Media Player Icon</div>
                  <div class="field-description" style="margin: 0;">
                    Show a media player icon in the navbar
                  </div>
                </div>
              </div>
              <ha-switch
                .checked=${!0===(null===(s=K.nav_media_player)||void 0===s?void 0:s.enabled)}
                @change=${e=>{n({nav_media_player:Object.assign(Object.assign({},K.nav_media_player),{enabled:e.target.checked})})}}
              ></ha-switch>
            </div>
          </div>
        </div>

        <!-- Style Section -->
        <div class="settings-section">
          <div class="section-title">NAVBAR STYLE</div>

          ${o.U.renderFieldSection("Visual Preset","Choose a visual style preset for your navbar.",t,{nav_style:K.nav_style||"uc_modern"},[o.U.select("nav_style",Q)],(e=>{n({nav_style:e.detail.value.nav_style})}))}

          <div class="color-field" style="margin-top: 16px;">
            <div class="field-title">Dock Color</div>
            <div class="field-description">
              Custom accent color for the dock background. For glass styles this tints the glass.
            </div>
            <ultra-color-picker
              .hass=${t}
              .value=${K.nav_dock_color||""}
              @value-changed=${e=>n({nav_dock_color:e.detail.value})}
            ></ultra-color-picker>
          </div>

          <div class="color-field" style="margin-top: 12px;">
            <div class="field-title">Icon Color</div>
            <div class="field-description">
              Custom color for navbar icons. Overrides the default icon color from the style preset.
            </div>
            <ultra-color-picker
              .hass=${t}
              .value=${K.nav_icon_color||""}
              @value-changed=${e=>n({nav_icon_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Visibility Scope Section -->
        <div class="settings-section">
          <div class="section-title">VISIBILITY</div>

          ${o.U.renderFieldSection("Show Navigation On","Control where this navbar appears.",t,{nav_scope:K.nav_scope||"all_views"},[o.U.select("nav_scope",[{value:"all_views",label:"All views (global)"},{value:"current_view",label:"Current view only"}])],(e=>{n({nav_scope:e.detail.value.nav_scope})}))}

          <div class="info-box" style="margin-top: 8px;">
            <ha-icon icon="mdi:information"></ha-icon>
            <span>
              <strong>All views:</strong> Navbar appears on every view in your dashboard.<br />
              <strong>Current view:</strong> Navbar only appears on the view where this card is
              placed.
            </span>
          </div>

          <div
            class="info-box"
            style="margin-top: 8px; border-left-color: var(--warning-color); background: rgba(var(--rgb-warning-color), 0.1);"
          >
            <ha-icon icon="mdi:alert" style="color: var(--warning-color);"></ha-icon>
            <span>
              <strong>Note:</strong> Only one global navbar can be active at a time. If you have
              multiple navbars set to "All views", only the first registered one will be displayed.
              Use "Current view only" for navbars on specific pages.
            </span>
          </div>
        </div>

        <!-- Desktop Configuration Section -->
        ${this.renderSettingsSection("DESKTOP MODE","Configure navbar appearance and behavior on desktop devices.",[{title:"Mode",description:"Choose floating (centered with margins) or docked (edge-to-edge).",hass:t,data:{mode:(null===(d=K.nav_desktop)||void 0===d?void 0:d.mode)||"floating"},schema:[o.U.select("mode",[{value:"floating",label:"Floating"},{value:"docked",label:"Docked"}])],onChange:e=>{n({nav_desktop:Object.assign(Object.assign({},K.nav_desktop),{mode:e.detail.value.mode})})}},{title:"Position",description:"Where the navbar appears on desktop.",hass:t,data:{position:(null===(c=K.nav_desktop)||void 0===c?void 0:c.position)||"bottom"},schema:[o.U.select("position",[{value:"bottom",label:"Bottom"},{value:"top",label:"Top"},{value:"left",label:"Left"},{value:"right",label:"Right"}])],onChange:e=>{n({nav_desktop:Object.assign(Object.assign({},K.nav_desktop),{position:e.detail.value.position})})}},{title:"Show Labels",description:"Control label visibility on desktop.",hass:t,data:{show_labels:"boolean"==typeof(null===(p=K.nav_desktop)||void 0===p?void 0:p.show_labels)?K.nav_desktop.show_labels?"true":"false":null!==(u=null===(v=K.nav_desktop)||void 0===v?void 0:v.show_labels)&&void 0!==u?u:"false"},schema:[o.U.select("show_labels",[{value:"false",label:"Hidden"},{value:"true",label:"Icons & Labels"},{value:"text_only",label:"Text only (no icons)"}])],onChange:e=>{const t=e.detail.value.show_labels,i="true"===t||"false"!==t&&t;n({nav_desktop:Object.assign(Object.assign({},K.nav_desktop),{show_labels:i})})}},{title:"Item Alignment",description:"How items are distributed within the dock.",hass:t,data:{alignment:(null===(g=K.nav_desktop)||void 0===g?void 0:g.alignment)||"center"},schema:[o.U.select("alignment",[{value:"center",label:"Center"},{value:"start",label:"Start"},{value:"end",label:"End"},{value:"space-between",label:"Space Between"},{value:"space-around",label:"Space Around"}])],onChange:e=>{n({nav_desktop:Object.assign(Object.assign({},K.nav_desktop),{alignment:e.detail.value.alignment})})}}])}

        ${this.renderSliderField("Min Width","Viewport width (px) that switches to desktop mode.",null!==(m=null===(h=K.nav_desktop)||void 0===h?void 0:h.min_width)&&void 0!==m?m:768,768,320,2560,1,(e=>n({nav_desktop:Object.assign(Object.assign({},K.nav_desktop),{min_width:e})})),"px")}

        <!-- Desktop Offset Slider -->
        <div class="field-group" style="margin: 16px 0; padding: 0 16px;">
          <div>
            <div
              class="field-title"
              style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
            >
              Desktop Offset
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color);"
            >
              Distance from screen edge (px). Pushes the dock away from the edge.
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
            <ha-slider
              style="flex: 1;"
              .min=${0}
              .max=${100}
              .step=${1}
              .value=${null!==(_=null===(b=K.nav_desktop)||void 0===b?void 0:b.offset)&&void 0!==_?_:"floating"===(null===(f=K.nav_desktop)||void 0===f?void 0:f.mode)?16:0}
              @change=${e=>n({nav_desktop:Object.assign(Object.assign({},K.nav_desktop),{offset:parseInt(e.target.value,10)})})}
            ></ha-slider>
            <span style="min-width: 40px; text-align: center; font-weight: 600;">
              ${null!==(x=null===(y=K.nav_desktop)||void 0===y?void 0:y.offset)&&void 0!==x?x:"floating"===(null===(w=K.nav_desktop)||void 0===w?void 0:w.mode)?16:0}px
            </span>
          </div>
        </div>

        <!-- Mobile Configuration Section -->
        ${this.renderSettingsSection("MOBILE MODE","Configure navbar appearance and behavior on mobile devices.",[{title:"Mode",description:"Choose docked (default) or floating (desktop-like).",hass:t,data:{mode:(null===(k=K.nav_mobile)||void 0===k?void 0:k.mode)||"docked"},schema:[o.U.select("mode",[{value:"docked",label:"Docked"},{value:"floating",label:"Floating"}])],onChange:e=>{n({nav_mobile:Object.assign(Object.assign({},K.nav_mobile),{mode:e.detail.value.mode})})}},{title:"Position",description:"Where the navbar appears on mobile.",hass:t,data:{position:(null===($=K.nav_mobile)||void 0===$?void 0:$.position)||"bottom"},schema:[o.U.select("position",[{value:"bottom",label:"Bottom"},{value:"top",label:"Top"}])],onChange:e=>{n({nav_mobile:Object.assign(Object.assign({},K.nav_mobile),{position:e.detail.value.position})})}},{title:"Show Labels",description:"Control label visibility on mobile.",hass:t,data:{show_labels:"boolean"==typeof(null===(O=K.nav_mobile)||void 0===O?void 0:O.show_labels)?K.nav_mobile.show_labels?"true":"false":null!==(j=null===(S=K.nav_mobile)||void 0===S?void 0:S.show_labels)&&void 0!==j?j:"false"},schema:[o.U.select("show_labels",[{value:"false",label:"Hidden"},{value:"true",label:"Icons & Labels"},{value:"text_only",label:"Text only (no icons)"}])],onChange:e=>{const t=e.detail.value.show_labels;n({nav_mobile:Object.assign(Object.assign({},K.nav_mobile),{show_labels:"true"===t||"false"!==t&&t})})}},{title:"Item Alignment",description:"How items are distributed within the dock.",hass:t,data:{alignment:(null===(I=K.nav_mobile)||void 0===I?void 0:I.alignment)||"center"},schema:[o.U.select("alignment",[{value:"center",label:"Center"},{value:"start",label:"Start"},{value:"end",label:"End"},{value:"space-between",label:"Space Between"},{value:"space-around",label:"Space Around"}])],onChange:e=>{n({nav_mobile:Object.assign(Object.assign({},K.nav_mobile),{alignment:e.detail.value.alignment})})}}])}

        <!-- Mobile Offset Slider -->
        <div class="field-group" style="margin: 16px 0; padding: 0 16px;">
          <div>
            <div
              class="field-title"
              style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
            >
              Mobile Offset
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color);"
            >
              Distance from screen edge (px). Pushes the dock away from the edge.
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
            <ha-slider
              style="flex: 1;"
              .min=${0}
              .max=${100}
              .step=${1}
              .value=${null!==(P=null===(C=K.nav_mobile)||void 0===C?void 0:C.offset)&&void 0!==P?P:"floating"===(null===(T=K.nav_mobile)||void 0===T?void 0:T.mode)?16:0}
              @change=${e=>n({nav_mobile:Object.assign(Object.assign({},K.nav_mobile),{offset:parseInt(e.target.value,10)})})}
            ></ha-slider>
            <span style="min-width: 40px; text-align: center; font-weight: 600;">
              ${null!==(A=null===(U=K.nav_mobile)||void 0===U?void 0:U.offset)&&void 0!==A?A:"floating"===(null===(E=K.nav_mobile)||void 0===E?void 0:E.mode)?16:0}px
            </span>
          </div>
        </div>

        <!-- Icon Spacing Section -->
        <div class="field-group" style="margin: 16px 0; padding: 0 16px;">
          <div>
            <div
              class="field-title"
              style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
            >
              Icon Spacing
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color);"
            >
              Gap between icons in the dock (px).
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
            <ha-slider
              style="flex: 1;"
              .min=${0}
              .max=${32}
              .step=${1}
              .value=${null!==(q=null===(D=K.nav_layout)||void 0===D?void 0:D.icon_gap)&&void 0!==q?q:8}
              @change=${e=>n({nav_layout:Object.assign(Object.assign({},K.nav_layout),{icon_gap:parseInt(e.target.value,10)})})}
            ></ha-slider>
            <span style="min-width: 40px; text-align: center; font-weight: 600;">
              ${null!==(R=null===(L=K.nav_layout)||void 0===L?void 0:L.icon_gap)&&void 0!==R?R:8}px
            </span>
          </div>
        </div>

        <!-- Auto-Hide Section -->
        <div class="settings-section">
          <div class="section-title">AUTO-HIDE</div>
          <div class="section-description">
            macOS-style dock auto-hide. The navbar slides off-screen after a period of inactivity
            and reappears when the cursor reaches the screen edge. Off by default.
          </div>

          ${o.U.renderFieldSection("Enable Auto-Hide","Hide the navbar when not in use.",t,{enabled:null!==(z=null===(M=K.nav_autohide)||void 0===M?void 0:M.enabled)&&void 0!==z&&z},[o.U.boolean("enabled")],(e=>{n({nav_autohide:Object.assign(Object.assign({},K.nav_autohide||{}),{enabled:e.detail.value.enabled})})}))}
          ${(null===(N=K.nav_autohide)||void 0===N?void 0:N.enabled)?a.qy`
                <div class="field-group" style="margin: 16px 0; padding: 0 16px;">
                  <div>
                    <div
                      class="field-title"
                      style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                    >
                      Hide Delay
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; color: var(--secondary-text-color);"
                    >
                      Seconds of inactivity before the navbar hides.
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                    <ha-slider
                      style="flex: 1;"
                      .min=${1}
                      .max=${15}
                      .step=${.5}
                      .value=${null!==(F=null===(H=K.nav_autohide)||void 0===H?void 0:H.delay)&&void 0!==F?F:3}
                      @change=${e=>n({nav_autohide:Object.assign(Object.assign({},K.nav_autohide||{}),{delay:parseFloat(e.target.value)})})}
                    ></ha-slider>
                    <span style="min-width: 40px; text-align: center; font-weight: 600;">
                      ${null!==(J=null===(B=K.nav_autohide)||void 0===B?void 0:B.delay)&&void 0!==J?J:3}s
                    </span>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Haptics Section -->
        ${this.renderSettingsSection("HAPTIC FEEDBACK","Configure haptic feedback for interactions.",[{title:"Enable Haptics",description:"Master toggle for all navbar haptic feedback.",hass:t,data:{enabled:!1!==K.nav_haptic},schema:[o.U.boolean("enabled")],onChange:e=>{n({nav_haptic:!!e.detail.value.enabled&&this.getHapticConfig(K)})}},{title:"URL Navigation",description:"Trigger haptic when navigating to a URL.",hass:t,data:{url:null!==(W=this.getHapticConfig(K).url)&&void 0!==W&&W},schema:[o.U.boolean("url")],onChange:e=>{n({nav_haptic:Object.assign(Object.assign({},this.getHapticConfig(K)),{url:e.detail.value.url})})}},{title:"Tap Action",description:"Trigger haptic on tap.",hass:t,data:{tap_action:null===(V=this.getHapticConfig(K).tap_action)||void 0===V||V},schema:[o.U.boolean("tap_action")],onChange:e=>{n({nav_haptic:Object.assign(Object.assign({},this.getHapticConfig(K)),{tap_action:e.detail.value.tap_action})})}},{title:"Hold Action",description:"Trigger haptic on hold.",hass:t,data:{hold_action:null===(G=this.getHapticConfig(K).hold_action)||void 0===G||G},schema:[o.U.boolean("hold_action")],onChange:e=>{n({nav_haptic:Object.assign(Object.assign({},this.getHapticConfig(K)),{hold_action:e.detail.value.hold_action})})}},{title:"Double Tap",description:"Trigger haptic on double tap.",hass:t,data:{double_tap_action:null===(Z=this.getHapticConfig(K).double_tap_action)||void 0===Z||Z},schema:[o.U.boolean("double_tap_action")],onChange:e=>{n({nav_haptic:Object.assign(Object.assign({},this.getHapticConfig(K)),{double_tap_action:e.detail.value.double_tap_action})})}}])}
      </div>
    `}getStyles(){return`${n.m.getSliderStyles()}`}renderPreview(e,t,i,n){var o,s,r;const d=this.resolveNavigationConfig(e,i),c=(()=>{if("live"===n||"ha-preview"===n)return!1;try{return"1"===new URLSearchParams(window.location.search).get("edit")}catch(e){return!1}})(),p=(()=>{try{return"1"===new URLSearchParams(window.location.search).get("edit")}catch(e){return!1}})();if("live"===n||"ha-preview"===n||c){const e=(null===(o=d.nav_routes)||void 0===o?void 0:o.length)||0,t=(null===(s=d.nav_media_player)||void 0===s?void 0:s.enabled)&&(null===(r=d.nav_media_player)||void 0===r?void 0:r.entity),i=!1,c=p&&"live"===n,v=c&&l.q.isEditModePreviewExpanded();return a.qy`
        <div
          style="
            padding: 24px;
            text-align: center;
            background: rgba(var(--rgb-primary-color), 0.1);
            border: 2px dashed var(--primary-color);
            border-radius: 8px;
          "
        >
          <ha-icon
            icon="mdi:compass-outline"
            style="color: var(--primary-color); --mdc-icon-size: 48px; margin-bottom: 8px; display: block;"
          ></ha-icon>
          <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 4px;">
            Navigation Module
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); opacity: 0.8;">
            ${e} path${1!==e?"s":""}
            ${t?" • Media Player":""} ${i?" • Settings":""}
          </div>
          <div
            style="font-size: 11px; color: var(--secondary-text-color); margin-top: 8px; opacity: 0.7;"
          >
            ${"all_views"===d.nav_scope?"Global (all views)":"Current view only"}
          </div>
          <div
            style="font-size: 10px; color: var(--secondary-text-color); margin-top: 12px; opacity: 0.6; font-style: italic;"
          >
            ${c?v?"Dock preview is visible on the dashboard behind this editor.":"The dock is hidden in edit mode so the Save button stays accessible.":"The navbar overlays the dashboard. Exit edit mode to see it in place."}
          </div>
          ${c?a.qy`
                <style>
                  @keyframes uc-dock-btn-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(var(--rgb-primary-color), 0.5); }
                    70% { box-shadow: 0 0 0 8px rgba(var(--rgb-primary-color), 0); }
                    100% { box-shadow: 0 0 0 0 rgba(var(--rgb-primary-color), 0); }
                  }
                </style>
                <button
                  type="button"
                  @click=${()=>{l.q.toggleEditModePreview(!v)}}
                  style="
                    margin-top: 14px;
                    padding: 6px 16px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--primary-color);
                    background: rgba(var(--rgb-primary-color), 0.15);
                    border: 1px solid var(--primary-color);
                    border-radius: 18px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: background 0.2s ease;
                    animation: uc-dock-btn-pulse 2s ease-in-out 3;
                  "
                >
                  <ha-icon
                    icon="${v?"mdi:eye-off":"mdi:eye"}"
                    style="--mdc-icon-size: 16px;"
                  ></ha-icon>
                  ${v?"Hide dock preview":"Preview dock"}
                </button>
              `:""}
        </div>
      `}return a.qy``}validate(e){var t;const i=e,a=[];return i.nav_routes&&0!==i.nav_routes.length||a.push("At least one navigation route is required."),null===(t=i.nav_routes)||void 0===t||t.forEach((e=>{const t=!!e.tap_action||!!e.hold_action||!!e.double_tap_action;e.url||t||a.push(`Route "${e.label||e.id}" must have a URL or an action.`)})),{valid:0===a.length,errors:a}}resolveNavigationConfig(e,t){var i,a,n;if(!t)return e;const o=null===(i=e.nav_template)||void 0===i?void 0:i.trim(),l=o&&t.nav_templates?t.nav_templates[o]:void 0,s=e.nav_routes&&e.nav_routes.length>0?e.nav_routes:(null==l?void 0:l.nav_routes)||[];return Object.assign(Object.assign({},e),{nav_routes:s,nav_desktop:Object.assign(Object.assign({},(null==l?void 0:l.nav_desktop)||{}),e.nav_desktop||{}),nav_mobile:Object.assign(Object.assign({},(null==l?void 0:l.nav_mobile)||{}),e.nav_mobile||{}),nav_layout:Object.assign(Object.assign({},(null==l?void 0:l.nav_layout)||{}),e.nav_layout||{}),nav_haptic:null!==(a=e.nav_haptic)&&void 0!==a?a:null==l?void 0:l.nav_haptic,nav_media_player:Object.assign(Object.assign({},(null==l?void 0:l.nav_media_player)||{}),e.nav_media_player||{}),nav_styles:null!==(n=e.nav_styles)&&void 0!==n?n:null==l?void 0:l.nav_styles})}createDefaultRoute(){return{id:this.generateId("nav-route"),icon:"mdi:home-outline",label:"New Path",url:""}}createDefaultStack(){return{id:this.generateId("nav-stack"),icon:"mdi:dots-horizontal",label:"More",open_mode:"click",orientation:"auto",children:[]}}handleUnifiedReorder(e,t,i,a){var n;const o=this.buildUnifiedNavItems(i);if(e===t||e<0||t<0)return;const l=o[e],s=o[t];if(!l)return;const r=this._draggedItem;if(!r)return;const d=[...i.nav_routes||[]],c=(i.nav_stacks||[]).map((e=>Object.assign(Object.assign({},e),{children:[...e.children||[]]})));let p=(null===(n=i.nav_media_player)||void 0===n?void 0:n.icon_position)||"end";if("stack_child"===r.type&&r.parentStackId&&s&&"stack_child"!==s.type){const e=c.find((e=>e.id===r.parentStackId));if(!e)return;const t=e.children.findIndex((e=>e.id===r.id));if(t<0)return;const[i]=e.children.splice(t,1);let n=d.length;if("route"===s.type){const e=d.findIndex((e=>e.id===s.id));e>=0&&(n=e)}return d.splice(n,0,i),void a({nav_routes:d,nav_stacks:c})}if("stack_child"===r.type&&r.parentStackId&&"stack_child"===(null==s?void 0:s.type)&&s.parentStackId===r.parentStackId){const e=c.find((e=>e.id===r.parentStackId));if(!e)return;const t=e.children.findIndex((e=>e.id===r.id)),i=e.children.findIndex((e=>e.id===s.id));if(t<0||i<0)return;const[n]=e.children.splice(t,1);return e.children.splice(i,0,n),void a({nav_stacks:c})}if("stack_child"===r.type&&r.parentStackId&&"stack_child"===(null==s?void 0:s.type)&&s.parentStackId!==r.parentStackId){const e=c.find((e=>e.id===r.parentStackId)),t=c.find((e=>e.id===s.parentStackId));if(!e||!t)return;const i=e.children.findIndex((e=>e.id===r.id));if(i<0)return;const[n]=e.children.splice(i,1),o=t.children.findIndex((e=>e.id===s.id));return t.children.splice(o>=0?o:t.children.length,0,n),void a({nav_stacks:c})}const v=o.filter((e=>"stack_child"!==e.type)),u=v.findIndex((e=>e.id===l.id)),g=v.findIndex((e=>e.id===(null==s?void 0:s.id)));if(u<0||g<0||u===g)return;const h=[...v],[m]=h.splice(u,1);h.splice(g,0,m);const b=[],_=[];let f=0;h.forEach((e=>{"route"===e.type&&e.data?(b.push(e.data),f++):"stack"===e.type&&e.data?(_.push(e.data),f++):"media_player"===e.type&&(p=f)}));const y=b.length+_.length;"number"==typeof p&&(0===p?p="start":p>=y&&(p="end")),a({nav_routes:b,nav_stacks:_,nav_media_player:Object.assign(Object.assign({},i.nav_media_player),{icon_position:p})})}handleDropOnStack(e,t,i){const a=this._draggedItem;if(!a)return;if("stack"===a.type||"media_player"===a.type)return;if("stack_child"===a.type&&a.parentStackId===e)return;const n=[...t.nav_routes||[]],o=(t.nav_stacks||[]).map((e=>Object.assign(Object.assign({},e),{children:[...e.children||[]]}))),l=o.find((t=>t.id===e));if(!l)return;let s=null;if("route"===a.type){const e=n.findIndex((e=>e.id===a.id));if(e<0)return;[s]=n.splice(e,1)}else if("stack_child"===a.type&&a.parentStackId){const e=o.find((e=>e.id===a.parentStackId));if(!e)return;const t=e.children.findIndex((e=>e.id===a.id));if(t<0)return;[s]=e.children.splice(t,1)}s&&(l.children.push(s),i({nav_routes:n,nav_stacks:o})),this._draggedItem=null}renderSpecialItemRow(e,t,i,n,o,l,s,r,d,c){const p="__media_player__",v=this._expandedSpecialItems.has(p);return a.qy`
      <div
        class="entity-row special-item ${v?"expanded":""}"
        draggable="true"
        @dragstart=${t=>{this._draggedItem={type:e,id:p,visualIndex:o},t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",JSON.stringify({type:e,visualIndex:o}))),t.currentTarget.classList.add("dragging")}}
        @dragend=${e=>{this._draggedItem=null,e.currentTarget.classList.remove("dragging"),document.querySelectorAll(".entity-row.drag-over").forEach((e=>e.classList.remove("drag-over")))}}
        @dragover=${e=>{e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move"),e.currentTarget.classList.add("drag-over")}}
        @dragleave=${e=>{e.currentTarget.classList.remove("drag-over")}}
        @drop=${e=>{e.preventDefault(),e.currentTarget.classList.remove("drag-over"),this._draggedItem&&this._draggedItem.visualIndex!==o&&(this.handleUnifiedReorder(this._draggedItem.visualIndex,o,s,d),this._draggedItem=null)}}
      >
        <div class="entity-header" @click=${()=>{v?this._expandedSpecialItems.delete(p):this._expandedSpecialItems.add(p),d({})}}>
          <div class="drag-handle" @click=${e=>e.stopPropagation()}>
            <ha-icon
              icon="mdi:drag"
              style="--mdc-icon-size: 20px; color: var(--secondary-text-color);"
            ></ha-icon>
          </div>
          <div class="entity-info">
            <ha-icon
              icon="${t}"
              class="entity-icon"
              style="color: var(--primary-color);"
            ></ha-icon>
            <div class="entity-name">${i}</div>
            <div class="entity-detail">${n}</div>
          </div>
          <div class="entity-actions" @click=${e=>e.stopPropagation()}>
            <span class="special-badge">Media</span>
            <ha-icon
              icon="${v?"mdi:chevron-up":"mdi:chevron-down"}"
              class="expand-icon"
            ></ha-icon>
          </div>
        </div>

        ${v&&"media_player"===e?a.qy`
              <div class="entity-expanded">
                ${this.renderMediaPlayerExpandedSettings(s,r,d,c)}
              </div>
            `:""}
      </div>
    `}getInactiveTapActionCategory(e){const t=null==e?void 0:e.inactive_tap_action;return t?"nothing"===t.action?"nothing":"navigate"!==t.action||t.navigation_path?"navigate"===t.action?"navigate":"url"===t.action?"url":"open-popup"===t.action?"open-popup":"toggle"===t.action?"toggle":"more-info"===t.action?"more-info":"assist"===t.action?"assist":("perform-action"===t.action||t.action,"perform-action"):"navigate":"play"}renderMediaPlayerExpandedSettings(e,t,i,n){var l,r,d,c,p,v,u;const g=e.nav_media_player||{},h=g.display_mode||"icon_click",m=g.entity&&""!==g.entity,b=this.getInactiveTapActionCategory(g),_=e=>{i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:Object.assign(Object.assign({},g.inactive_tap_action||{}),e)})})},f=(()=>{const e=g.inactive_tap_action||{};return Object.assign(Object.assign(Object.assign({action:e.perform_action||e.service||""},e.data?{data:e.data}:{}),e.service_data?{data:e.service_data}:{}),e.target?{target:e.target}:{})})();return a.qy`
      ${m?"":a.qy`
            <div
              class="info-box"
              style="background: var(--warning-color, orange); color: var(--text-primary-color); padding: 12px; border-radius: 8px; margin-bottom: 16px;"
            >
              ⚠️ <strong>Entity Required:</strong> Select a media player entity below for the icon
              to appear in the navbar.
            </div>
          `}
      ${o.U.renderFieldSection("Entity","Media player entity to display.",t,{entity:g.entity||""},[o.U.entity("entity",["media_player"])],(e=>{i({nav_media_player:Object.assign(Object.assign({},g),{entity:e.detail.value.entity})})}))}
      ${o.U.renderFieldSection("Interaction Mode","How the media player widget opens.",t,{display_mode:h},[o.U.select("display_mode",[{value:"icon_hover",label:"Expand on hover"},{value:"icon_click",label:"Expand on click"}])],(e=>{i({nav_media_player:Object.assign(Object.assign({},g),{display_mode:e.detail.value.display_mode})})}))}
      ${o.U.renderFieldSection("Widget Position","Where the expanded widget appears relative to the icon.",t,{widget_position:g.widget_position||"above"},[o.U.select("widget_position",[{value:"above",label:"Above icon"},{value:"below",label:"Below icon"}])],(e=>{i({nav_media_player:Object.assign(Object.assign({},g),{widget_position:e.detail.value.widget_position})})}))}
      ${o.U.renderFieldSection("Album Cover Background","Use album art as blurred background for the widget.",t,{album_cover_background:null!==(l=g.album_cover_background)&&void 0!==l&&l},[o.U.boolean("album_cover_background")],(e=>{i({nav_media_player:Object.assign(Object.assign({},g),{album_cover_background:e.detail.value.album_cover_background})})}))}

      <!-- Inactive Tap Action (idle/off/unavailable only) -->
      <div class="field-group-title" style="margin-top: 16px; margin-bottom: 8px;">Inactive Tap Action</div>
      <div class="field-description" style="margin-bottom: 12px;">
        When the media player is idle, off, or unavailable, tapping the icon can do something other than start playback.
      </div>
      <div class="field-container">
        <ha-select
          style="width: 100%;"
          .value=${b}
          @selected=${e=>{var t,a,n;e.stopPropagation();const o=null!==(a=null===(t=e.detail)||void 0===t?void 0:t.value)&&void 0!==a?a:null===(n=e.target)||void 0===n?void 0:n.value;o&&(e=>{var t,a,n,o,l,r,d,c;switch(e){case"play":const{inactive_tap_action:e}=g,p=s(g,["inactive_tap_action"]);i({nav_media_player:Object.assign({},p)});break;case"nothing":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:{action:"nothing"}})});break;case"navigate":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:{action:"navigate",navigation_path:(null===(t=g.inactive_tap_action)||void 0===t?void 0:t.navigation_path)||""}})});break;case"url":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:{action:"url",url_path:(null===(a=g.inactive_tap_action)||void 0===a?void 0:a.url_path)||""}})});break;case"open-popup":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:{action:"open-popup",popup_id:(null===(n=g.inactive_tap_action)||void 0===n?void 0:n.popup_id)||""}})});break;case"toggle":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:{action:"toggle",entity:(null===(o=g.inactive_tap_action)||void 0===o?void 0:o.entity)||g.entity||""}})});break;case"more-info":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:{action:"more-info",entity:(null===(l=g.inactive_tap_action)||void 0===l?void 0:l.entity)||g.entity||""}})});break;case"assist":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:{action:"assist",pipeline_id:null===(r=g.inactive_tap_action)||void 0===r?void 0:r.pipeline_id,start_listening:null!==(c=null===(d=g.inactive_tap_action)||void 0===d?void 0:d.start_listening)&&void 0!==c&&c}})});break;case"perform-action":i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:Object.assign(Object.assign({},g.inactive_tap_action||{}),{action:"perform-action"})})})}})(o)}}
          @closed=${e=>e.stopPropagation()}
        >
          <mwc-list-item value="play">Play (default)</mwc-list-item>
          <mwc-list-item value="nothing">Do nothing</mwc-list-item>
          <mwc-list-item value="open-popup">Open popup</mwc-list-item>
          <mwc-list-item value="navigate">Navigate</mwc-list-item>
          <mwc-list-item value="url">Open URL</mwc-list-item>
          <mwc-list-item value="more-info">More info</mwc-list-item>
          <mwc-list-item value="toggle">Toggle</mwc-list-item>
          <mwc-list-item value="perform-action">Perform action</mwc-list-item>
          <mwc-list-item value="assist">Assist</mwc-list-item>
        </ha-select>
      </div>
      ${"navigate"===b?a.qy`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">Path</div>
              <ultra-navigation-picker
                .hass=${t}
                .value=${(null===(r=g.inactive_tap_action)||void 0===r?void 0:r.navigation_path)||""}
                label=""
                @value-changed=${e=>_({navigation_path:e.detail.value})}
              ></ultra-navigation-picker>
            </div>
          `:""}
      ${"url"===b?a.qy`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">URL</div>
              <ha-textfield
                style="width: 100%;"
                .value=${(null===(d=g.inactive_tap_action)||void 0===d?void 0:d.url_path)||""}
                placeholder="https://example.com"
                @input=${e=>_({url_path:e.target.value})}
                @click=${e=>e.stopPropagation()}
              ></ha-textfield>
            </div>
          `:""}
      ${"open-popup"===b&&n?a.qy`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">Popup</div>
              ${(()=>{var e;const t=this.getPopupModules(n);return 0===t.length?a.qy`
                    <div class="info-box" style="padding: 12px; border-radius: 8px;">
                      No popup modules found. Add a Popup module to this card first.
                    </div>
                  `:a.qy`
                  <ha-select
                    style="width: 100%;"
                    .value=${(null===(e=g.inactive_tap_action)||void 0===e?void 0:e.popup_id)||""}
                    @selected=${e=>{e.stopPropagation(),_({action:"open-popup",popup_id:e.target.value})}}
                    @closed=${e=>e.stopPropagation()}
                  >
                    ${t.map((e=>a.qy`<mwc-list-item value="${e.value}">${e.label}</mwc-list-item>`))}
                  </ha-select>
                `})()}
            </div>
          `:""}
      ${"toggle"===b||"more-info"===b?a.qy`
            <div class="field-container" style="margin-top: 8px;">
              <div class="field-title">Entity</div>
              <ha-entity-picker
                .hass=${t}
                .value=${(null===(c=g.inactive_tap_action)||void 0===c?void 0:c.entity)||g.entity||""}
                @value-changed=${e=>_({entity:e.detail.value})}
                allow-custom-entity
              ></ha-entity-picker>
            </div>
          `:""}
      ${"assist"===b?a.qy`
            <div class="field-container" style="margin-top: 8px;">
              <ha-form
                .hass=${t}
                .data=${{pipeline_id:null===(p=g.inactive_tap_action)||void 0===p?void 0:p.pipeline_id,start_listening:null!==(u=null===(v=g.inactive_tap_action)||void 0===v?void 0:v.start_listening)&&void 0!==u&&u}}
                .schema=${[{name:"pipeline_id",selector:{assist_pipeline:{include_last_used:!0}}},{name:"start_listening",selector:{boolean:{}}}]}
                .computeLabel=${()=>""}
                @value-changed=${e=>{e.stopPropagation();const t=e.detail.value||{};_({action:"assist",pipeline_id:t.pipeline_id,start_listening:t.start_listening})}}
              ></ha-form>
            </div>
          `:""}
      ${"perform-action"===b?a.qy`
            <div class="nav-action-perform-action" style="margin-top: 8px;">
              <div class="field-title">Action</div>
              <ha-service-control
                .hass=${t}
                .value=${f}
                @value-changed=${e=>{var t;e.stopPropagation();const a=(null===(t=e.detail)||void 0===t?void 0:t.value)||{},n=Object.assign(Object.assign({},g.inactive_tap_action||{}),{action:"perform-action",perform_action:a.action||"",target:a.target,data:a.data});a.data||delete n.data,i({nav_media_player:Object.assign(Object.assign({},g),{inactive_tap_action:n})})}}
              ></ha-service-control>
            </div>
          `:""}
    `}renderRouteRow(e,t,i,n,l,s,r,d,c,p){var v;const u=this._expandedRoutes.has(e.id),g=!!c,h=e.label||(g?"Stack Item":`Path ${t+1}`),m=e.icon||"mdi:compass-outline",b=null!=r?r:t,_=t=>{if(g){const i=(l.nav_stacks||[]).map((i=>i.id!==c?i:Object.assign(Object.assign({},i),{children:(i.children||[]).map((i=>i.id===e.id?Object.assign(Object.assign({},i),t):i))})));s({nav_stacks:i})}else{const a=i.map((i=>i.id===e.id?Object.assign(Object.assign({},i),t):i));s({nav_routes:a})}},f=g?(null===(v=(l.nav_stacks||[]).find((e=>e.id===c)))||void 0===v?void 0:v.label)||"Stack":"";return a.qy`
      <div
        class="entity-row ${u?"expanded":""} ${g?"stack-child-row":""}"
        draggable="true"
        @dragstart=${t=>{this._draggedItem={type:g?"stack_child":"route",id:e.id,visualIndex:b,parentStackId:c},t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",JSON.stringify({type:g?"stack_child":"route",id:e.id,visualIndex:b,parentStackId:c}))),t.currentTarget.classList.add("dragging")}}
        @dragend=${e=>{this._draggedItem=null,e.currentTarget.classList.remove("dragging"),document.querySelectorAll(".entity-row.drag-over").forEach((e=>e.classList.remove("drag-over")))}}
        @dragover=${e=>{e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move"),e.currentTarget.classList.add("drag-over")}}
        @dragleave=${e=>{e.currentTarget.classList.remove("drag-over")}}
        @drop=${e=>{e.preventDefault(),e.currentTarget.classList.remove("drag-over"),this._draggedItem&&this._draggedItem.visualIndex!==b&&(this.handleUnifiedReorder(this._draggedItem.visualIndex,b,l,s),this._draggedItem=null)}}
        style="${g?"margin-left: 24px; border-left: 2px solid var(--accent-color); border-radius: 0 12px 12px 0;":""}"
      >
        <div class="entity-header" @click=${()=>{u?this._expandedRoutes.delete(e.id):this._expandedRoutes.add(e.id),s({})}}>
          <div class="drag-handle" @click=${e=>e.stopPropagation()}>
            <ha-icon
              icon="mdi:drag"
              style="--mdc-icon-size: 20px; color: var(--secondary-text-color);"
            ></ha-icon>
          </div>
          <div class="entity-info">
            <ha-icon icon="${m}" class="entity-icon"></ha-icon>
            <div class="entity-name">
              ${g?a.qy`<span
                      style="font-size: 10px; color: var(--accent-color); font-weight: 600; text-transform: uppercase;"
                      >${f} ›</span
                    >
                    ${h}`:h}
            </div>
            ${e.url?a.qy` <div class="entity-detail">${e.url}</div> `:""}
          </div>
          <div class="entity-actions" @click=${e=>e.stopPropagation()}>
            <button class="entity-action-btn duplicate" @click=${()=>{const a=Object.assign(Object.assign({},JSON.parse(JSON.stringify(e))),{id:this.generateId("nav-route"),label:`${e.label||(g?"Stack Item":`Path ${t+1}`)} (Copy)`});if(g){const t=(l.nav_stacks||[]).map((t=>{if(t.id!==c)return t;const i=[...t.children||[]],n=i.findIndex((t=>t.id===e.id));return i.splice(n+1,0,a),Object.assign(Object.assign({},t),{children:i})}));s({nav_stacks:t})}else{const t=[...i],n=t.findIndex((t=>t.id===e.id));t.splice(n+1,0,a),s({nav_routes:t})}}} title="Duplicate">
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button class="entity-action-btn delete" @click=${()=>{if(this._expandedRoutes.delete(e.id),g){const t=(l.nav_stacks||[]).map((t=>t.id!==c?t:Object.assign(Object.assign({},t),{children:(t.children||[]).filter((t=>t.id!==e.id))})));s({nav_stacks:t})}else{const t=i.filter((t=>t.id!==e.id));s({nav_routes:t})}}} title="Delete">
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
            <ha-icon
              icon="${u?"mdi:chevron-up":"mdi:chevron-down"}"
              class="expand-icon"
            ></ha-icon>
          </div>
        </div>

        ${u?a.qy`
              <div class="entity-expanded">
                ${o.U.renderFieldSection("Label","Text shown below the icon in the navbar.",n,{label:e.label||""},[o.U.text("label")],(e=>_({label:e.detail.value.label})))}

                ${this.renderActionEditor(e,n,p||{},_)}

                ${o.U.renderFieldSection("Icon","Material Design icon for this path.",n,{icon:e.icon||""},[o.U.icon("icon")],(e=>_({icon:e.detail.value.icon})))}

                <div class="color-field">
                  <div class="field-title">Icon Color</div>
                  <div class="field-description">Custom color for the icon.</div>
                  <ultra-color-picker
                    .hass=${n}
                    .value=${e.icon_color||""}
                    @value-changed=${e=>_({icon_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                ${o.U.renderFieldSection("Selected Icon (Optional)","Different icon shown when this path is active.",n,{icon_selected:e.icon_selected||""},[o.U.icon("icon_selected")],(e=>_({icon_selected:e.detail.value.icon_selected})))}

                <div class="color-field">
                  <div class="field-title">Selected Color</div>
                  <div class="field-description">Color when path is active.</div>
                  <ultra-color-picker
                    .hass=${n}
                    .value=${e.selected_color||""}
                    @value-changed=${e=>_({selected_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>

                ${o.U.renderFieldSection("Image URL (Optional)","Use custom image instead of icon (e.g., user avatar).",n,{image:e.image||""},[o.U.text("image")],(e=>_({image:e.detail.value.image})))}
                ${o.U.renderFieldSection("Selected Image URL (Optional)","Different image shown when path is active.",n,{image_selected:e.image_selected||""},[o.U.text("image_selected")],(e=>_({image_selected:e.detail.value.image_selected})))}

                <!-- Notification Settings -->
                <div
                  style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--divider-color);"
                >
                  <div class="field-group-title">Notifications</div>
                  ${this.renderNotificationEditor(e,n,_)}
                </div>
              </div>
            `:""}
      </div>
    `}renderStackRow(e,t,i,n,l,s,r,d){const c=this._expandedRoutes.has(e.id),p=e.label||`Stack ${t+1}`,v=e.icon||"mdi:dots-horizontal",u=null!=r?r:t,g=e.children||[],h=t=>{const a=i.map((i=>i.id===e.id?Object.assign(Object.assign({},i),t):i));s({nav_stacks:a})};return a.qy`
      <div
        class="entity-row stack-row ${c?"expanded":""}"
        draggable="true"
        @dragstart=${t=>{this._draggedItem={type:"stack",id:e.id,visualIndex:u},t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",JSON.stringify({type:"stack",id:e.id,visualIndex:u}))),t.currentTarget.classList.add("dragging")}}
        @dragend=${e=>{this._draggedItem=null,e.currentTarget.classList.remove("dragging"),document.querySelectorAll(".entity-row.drag-over, .stack-drop-zone.drag-over").forEach((e=>e.classList.remove("drag-over")))}}
        @dragover=${e=>{e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move"),e.currentTarget.classList.add("drag-over")}}
        @dragleave=${e=>{e.currentTarget.classList.remove("drag-over")}}
        @drop=${e=>{e.preventDefault(),e.currentTarget.classList.remove("drag-over"),this._draggedItem&&this._draggedItem.visualIndex!==u&&(this.handleUnifiedReorder(this._draggedItem.visualIndex,u,l,s),this._draggedItem=null)}}
        style="border: 2px solid var(--accent-color); border-radius: 12px;"
      >
        <div class="entity-header" @click=${()=>{c?this._expandedRoutes.delete(e.id):this._expandedRoutes.add(e.id),s({})}}>
          <div class="drag-handle" @click=${e=>e.stopPropagation()}>
            <ha-icon
              icon="mdi:drag"
              style="--mdc-icon-size: 20px; color: var(--secondary-text-color);"
            ></ha-icon>
          </div>
          <div class="entity-info">
            <ha-icon
              icon="${v}"
              class="entity-icon"
              style="color: var(--accent-color);"
            ></ha-icon>
            <div class="entity-name">
              <span style="color: var(--accent-color);">Stack:</span> ${p}
            </div>
            <div class="entity-detail">
              ${g.length} item${1!==g.length?"s":""} · Drag paths here to add
            </div>
          </div>
          <div class="entity-actions" @click=${e=>e.stopPropagation()}>
            <button
              class="entity-action-btn duplicate"
              @click=${()=>{const a=(g||[]).map((e=>Object.assign(Object.assign({},JSON.parse(JSON.stringify(e))),{id:this.generateId("nav-route")}))),n=Object.assign(Object.assign({},JSON.parse(JSON.stringify(e))),{id:this.generateId("nav-stack"),label:`${e.label||`Stack ${t+1}`} (Copy)`,children:a}),o=[...i],l=o.findIndex((t=>t.id===e.id));o.splice(l+1,0,n),s({nav_stacks:o})}}
              title="Duplicate stack"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button
              class="entity-action-btn delete"
              @click=${()=>{const t=[...g],a=i.filter((t=>t.id!==e.id));this._expandedRoutes.delete(e.id),s({nav_routes:[...l.nav_routes||[],...t],nav_stacks:a})}}
              title="Delete stack (items are moved to top level)"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
            <ha-icon
              icon="${c?"mdi:chevron-up":"mdi:chevron-down"}"
              class="expand-icon"
            ></ha-icon>
          </div>
        </div>

        <!-- Drop zone for adding items to this stack -->
        <div
          class="stack-drop-zone"
          @dragover=${t=>{t.preventDefault(),t.stopPropagation();const i=this._draggedItem;i&&("route"===i.type||"stack_child"===i.type&&i.parentStackId!==e.id)&&(t.dataTransfer&&(t.dataTransfer.dropEffect="move"),t.currentTarget.classList.add("drag-over"))}}
          @dragleave=${e=>{e.currentTarget.classList.remove("drag-over")}}
          @drop=${t=>{t.preventDefault(),t.stopPropagation(),t.currentTarget.classList.remove("drag-over"),this.handleDropOnStack(e.id,l,s)}}
          style="
            padding: 8px 16px;
            border-top: 1px dashed var(--divider-color);
            text-align: center;
            font-size: 12px;
            color: var(--secondary-text-color);
            transition: all 0.2s ease;
          "
        >
          <ha-icon
            icon="mdi:tray-arrow-down"
            style="--mdc-icon-size: 16px; margin-right: 4px;"
          ></ha-icon>
          Drop paths here to add to stack
        </div>

        ${c?a.qy`
              <div class="entity-expanded">
                ${o.U.renderFieldSection("Label","Text shown below the stack icon in the navbar.",n,{label:e.label||""},[o.U.text("label")],(e=>h({label:e.detail.value.label})))}
                ${o.U.renderFieldSection("Icon","Material Design icon for this stack.",n,{icon:e.icon||""},[o.U.icon("icon")],(e=>h({icon:e.detail.value.icon})))}

                <div class="field-container">
                  <div class="field-title">Open Mode</div>
                  <div class="field-description">
                    Choose how the stack opens to show child items.
                  </div>
                  <ha-select
                    style="width: 100%;"
                    .value=${e.open_mode||"click"}
                    @selected=${e=>{e.stopPropagation(),h({open_mode:e.target.value})}}
                    @closed=${e=>e.stopPropagation()}
                  >
                    <mwc-list-item value="click">Click to open</mwc-list-item>
                    <mwc-list-item value="hover">Hover to open</mwc-list-item>
                  </ha-select>
                </div>

                <div class="field-container">
                  <div class="field-title">Stack Orientation</div>
                  <div class="field-description">
                    Direction child items are displayed. Auto will show vertically for horizontal
                    navbars and horizontally for vertical navbars.
                  </div>
                  <ha-select
                    style="width: 100%;"
                    .value=${e.orientation||"auto"}
                    @selected=${e=>{e.stopPropagation(),h({orientation:e.target.value})}}
                    @closed=${e=>e.stopPropagation()}
                  >
                    <mwc-list-item value="auto">Auto (opposite of navbar)</mwc-list-item>
                    <mwc-list-item value="vertical">Vertical</mwc-list-item>
                    <mwc-list-item value="horizontal">Horizontal</mwc-list-item>
                  </ha-select>
                </div>

                <div class="info-box" style="margin-top: 16px;">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  <span>
                    Drag paths from the list above into this stack, or drag children out to eject
                    them back to the top level. Children appear indented below this stack in the
                    items list.
                  </span>
                </div>
              </div>
            `:""}
      </div>
    `}getPopupModules(e){var t;const i=[];if(!(null===(t=null==e?void 0:e.layout)||void 0===t?void 0:t.rows))return i;const a=e=>{var t,n;if(e&&Array.isArray(e))for(const o of e)if(o.columns&&Array.isArray(o.columns))for(const e of o.columns)e.modules&&a(e.modules);else{if("popup"===o.type){const e=o,a=(null===(t=e.title_text)||void 0===t?void 0:t.trim())||(null===(n=e.name)||void 0===n?void 0:n.trim())||`Popup (${e.id.slice(-6)})`;i.push({value:e.id,label:a})}o.modules&&Array.isArray(o.modules)&&a(o.modules)}};return a(e.layout.rows),i}getActionCategory(e){var t,i;const a=null===(t=e.tap_action)||void 0===t?void 0:t.action;return a&&"default"!==a&&("navigate"!==a||(null===(i=e.tap_action)||void 0===i?void 0:i.navigation_path))?"url"===a?"url":"open-popup"===a?"open-popup":"toggle"===a?"toggle":"more-info"===a?"more-info":"assist"===a?"assist":"perform-action"===a||"call-service"===a?"perform-action":"nothing"===a?"nothing":"perform-action":"navigate"}renderActionEditor(e,t,i,n){var o,l,s,r,d;const c=this.getActionCategory(e),p=(()=>{var t;const i=e.tap_action||{},a=i.perform_action||i.service||"",n=null!==(t=i.data)&&void 0!==t?t:i.service_data,o=i.target;return Object.assign(Object.assign({action:a},n?{data:n}:{}),o?{target:o}:{})})();return a.qy`
      <!-- Action Type -->
      <div class="field-container">
        <div class="field-title">Action Type</div>
        <div class="field-description">
          What happens when this icon is tapped.
        </div>
        <ha-select
          style="width: 100%;"
          .value=${c}
          @selected=${t=>{var i,a,o;t.stopPropagation();const l=null!==(a=null===(i=t.detail)||void 0===i?void 0:i.value)&&void 0!==a?a:null===(o=t.target)||void 0===o?void 0:o.value;l&&(t=>{var i,a,o,l,s,r;switch(t){case"navigate":n({tap_action:void 0});break;case"url":n({tap_action:{action:"url",url_path:(null===(i=e.tap_action)||void 0===i?void 0:i.url_path)||""}});break;case"open-popup":n({tap_action:{action:"open-popup",popup_id:(null===(a=e.tap_action)||void 0===a?void 0:a.popup_id)||""}});break;case"toggle":n({tap_action:{action:"toggle",entity:(null===(o=e.tap_action)||void 0===o?void 0:o.entity)||""}});break;case"more-info":n({tap_action:{action:"more-info",entity:(null===(l=e.tap_action)||void 0===l?void 0:l.entity)||""}});break;case"assist":n({tap_action:{action:"assist",pipeline_id:null===(s=e.tap_action)||void 0===s?void 0:s.pipeline_id,start_listening:null===(r=e.tap_action)||void 0===r?void 0:r.start_listening}});break;case"perform-action":n({tap_action:Object.assign(Object.assign({},e.tap_action||{}),{action:"perform-action"})});break;case"nothing":n({tap_action:{action:"nothing"}})}})(l)}}
          @closed=${e=>e.stopPropagation()}
        >
          <mwc-list-item value="navigate">Navigate to Path</mwc-list-item>
          <mwc-list-item value="url">Open External URL</mwc-list-item>
          <mwc-list-item value="open-popup">Open Popup</mwc-list-item>
          <mwc-list-item value="toggle">Toggle Entity</mwc-list-item>
          <mwc-list-item value="more-info">More Info</mwc-list-item>
          <mwc-list-item value="perform-action">Perform Action</mwc-list-item>
          <mwc-list-item value="assist">Assist</mwc-list-item>
          <mwc-list-item value="nothing">No Action</mwc-list-item>
        </ha-select>
      </div>

      <!-- Navigate: Path picker -->
      ${"navigate"===c?a.qy`
            <div class="field-container">
              <div class="field-title">Path</div>
              <div class="field-description">
                Select a dashboard view, or type a full URL (http/https) to open externally.
              </div>
              <ultra-navigation-picker
                .hass=${t}
                .value=${e.url||""}
                label=""
                @value-changed=${e=>n({url:e.detail.value})}
              ></ultra-navigation-picker>
            </div>
          `:""}

      <!-- URL: Text field -->
      ${"url"===c?a.qy`
            <div class="field-container">
              <div class="field-title">URL</div>
              <div class="field-description">
                External website to open in a new tab (e.g., https://google.com).
              </div>
              <ha-textfield
                style="width: 100%;"
                .value=${(null===(o=e.tap_action)||void 0===o?void 0:o.url_path)||""}
                placeholder="https://example.com"
                @input=${t=>{const i=t.target.value;n({tap_action:Object.assign(Object.assign({},e.tap_action),{action:"url",url_path:i})})}}
                @click=${e=>e.stopPropagation()}
              ></ha-textfield>
            </div>
          `:""}

      <!-- Open Popup: Popup picker -->
      ${"open-popup"===c?a.qy`
            <div class="field-container">
              <div class="field-title">Popup</div>
              <div class="field-description">
                Select a popup module from this card to open when tapped.
              </div>
              ${(()=>{var t;const o=this.getPopupModules(i);return 0===o.length?a.qy`
                    <div
                      class="info-box"
                      style="background: var(--warning-color, orange); color: var(--text-primary-color); padding: 12px; border-radius: 8px;"
                    >
                      No popup modules found. Add a Popup module to this card first.
                    </div>
                  `:a.qy`
                  <ha-select
                    style="width: 100%;"
                    .value=${(null===(t=e.tap_action)||void 0===t?void 0:t.popup_id)||""}
                    @selected=${t=>{t.stopPropagation(),n({tap_action:Object.assign(Object.assign({},e.tap_action),{action:"open-popup",popup_id:t.target.value})})}}
                    @closed=${e=>e.stopPropagation()}
                  >
                    ${o.map((e=>a.qy`<mwc-list-item value="${e.value}">${e.label}</mwc-list-item>`))}
                  </ha-select>
                `})()}
            </div>
          `:""}

      <!-- Toggle / More Info: Entity picker -->
      ${"toggle"===c||"more-info"===c?a.qy`
            <div class="field-container">
              <div class="field-title">Entity</div>
              <div class="field-description">
                ${"toggle"===c?"Select the entity to toggle.":"Select the entity to show more info for."}
              </div>
              <ha-form
                .hass=${t}
                .data=${{entity:(null===(l=e.tap_action)||void 0===l?void 0:l.entity)||""}}
                .schema=${[{name:"entity",selector:{entity:{}}}]}
                .computeLabel=${e=>e.label||""}
                @value-changed=${t=>{var i,a;t.stopPropagation();const o=(null===(a=null===(i=t.detail)||void 0===i?void 0:i.value)||void 0===a?void 0:a.entity)||"";n({tap_action:Object.assign(Object.assign({},e.tap_action||{}),{action:c,entity:o})})}}
              ></ha-form>
            </div>
          `:""}

      <!-- Assist: Pipeline picker -->
      ${"assist"===c?a.qy`
            <div class="field-container">
              <div class="field-title">Assist</div>
              <div class="field-description">
                Choose the Assist pipeline and whether to start listening.
              </div>
              <ha-form
                .hass=${t}
                .data=${{pipeline_id:null===(s=e.tap_action)||void 0===s?void 0:s.pipeline_id,start_listening:null!==(d=null===(r=e.tap_action)||void 0===r?void 0:r.start_listening)&&void 0!==d&&d}}
                .schema=${[{name:"pipeline_id",selector:{assist_pipeline:{include_last_used:!0}}},{name:"start_listening",selector:{boolean:{}}}]}
                .computeLabel=${e=>e.label||""}
                @value-changed=${t=>{t.stopPropagation();const i=t.detail.value||{};n({tap_action:Object.assign(Object.assign({},e.tap_action||{}),{action:"assist",pipeline_id:i.pipeline_id,start_listening:i.start_listening})})}}
              ></ha-form>
            </div>
          `:""}

      <!-- Perform Action: Service picker -->
      ${"perform-action"===c?a.qy`
            <div class="nav-action-perform-action">
              <div class="field-container">
                <div class="field-title">Action</div>
                <div class="field-description">
                  Choose the service to call and optional target/data.
                </div>
                <ha-service-control
                  .hass=${t}
                  .value=${p}
                  @value-changed=${t=>{var i;t.stopPropagation();const a=(null===(i=t.detail)||void 0===i?void 0:i.value)||{},o=Object.assign(Object.assign({},e.tap_action||{}),{action:"perform-action",perform_action:a.action||"",target:a.target,data:a.data});a.data||delete o.data,o.service_data&&delete o.service_data,o.service&&delete o.service,n({tap_action:o})}}
                ></ha-service-control>
              </div>
            </div>
          `:""}
    `}renderNotificationEditor(e,t,i){var n;const o=e.badge||{},l=o.mode||"static",s=e=>{i({badge:Object.assign(Object.assign({},o),e)})};return a.qy`
      <div class="field-container">
        <div class="field-title">Notification Source</div>
        <div class="field-description">Choose how to determine the notification count.</div>
        <ha-select
          style="width: 100%;"
          .value=${l}
          @selected=${e=>{e.stopPropagation(),s({mode:e.target.value})}}
          @closed=${e=>e.stopPropagation()}
        >
          <mwc-list-item value="static">Static value</mwc-list-item>
          <mwc-list-item value="entity">Entity state</mwc-list-item>
          <mwc-list-item value="template">Template</mwc-list-item>
        </ha-select>
      </div>

      ${"static"===l?a.qy`
            <div class="info-box" style="margin-bottom: 12px;">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span>Enter a fixed number or text to show in the notification badge.</span>
            </div>
            <div class="field-container">
              <div class="field-title">Count / Text</div>
              <ha-textfield
                style="width: 100%;"
                .value=${o.count||""}
                placeholder="5"
                @input=${e=>s({count:e.target.value})}
                @click=${e=>e.stopPropagation()}
              ></ha-textfield>
            </div>
          `:""}
      ${"entity"===l?a.qy`
            <div class="info-box" style="margin-bottom: 12px;">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span
                >Pull the notification count directly from an entity's state or attribute. Great for
                counters, sensors, or any numeric entity.</span
              >
            </div>
            <div class="field-container">
              <div class="field-title">Entity</div>
              <ha-entity-picker
                .hass=${t}
                .value=${o.entity||""}
                @value-changed=${e=>s({entity:e.detail.value})}
                allow-custom-entity
              ></ha-entity-picker>
            </div>
            <div class="field-container">
              <div class="field-title">Attribute (Optional)</div>
              <div class="field-description">
                Use a specific attribute instead of the entity state.
              </div>
              <ha-textfield
                style="width: 100%;"
                .value=${o.entity_attribute||""}
                placeholder="e.g., unread_count"
                @input=${e=>s({entity_attribute:e.target.value})}
                @click=${e=>e.stopPropagation()}
              ></ha-textfield>
            </div>
          `:""}
      ${"template"===l?a.qy`
            <div class="info-box" style="margin-bottom: 12px;">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span
                >Use a JavaScript template for advanced logic. Access hass, states, and user
                objects. Return a number or string.</span
              >
            </div>
            <div class="field-container">
              <div class="field-title">Count Template</div>
              <div class="field-description">
                Example: return states['sensor.notifications'].state;
              </div>
              <ha-textfield
                style="width: 100%;"
                multiline
                rows="3"
                .value=${o.count_template||"[[[ return 0; ]]]"}
                placeholder="[[[ return hass.states['sensor.example'].state; ]]]"
                @input=${e=>s({count_template:e.target.value})}
                @click=${e=>e.stopPropagation()}
              ></ha-textfield>
            </div>
          `:""}

      <div class="field-container" style="margin-top: 16px;">
        <div class="field-title">Hide When Zero</div>
        <div class="field-description">Hide the badge when the count is 0 or empty.</div>
        <ha-switch
          .checked=${null===(n=o.hide_when_zero)||void 0===n||n}
          @change=${e=>s({hide_when_zero:e.target.checked})}
        ></ha-switch>
      </div>

      <div class="entity-fields-grid" style="margin-top: 16px;">
        <div class="field-container">
          <div class="field-title">Badge Color</div>
          <ultra-color-picker
            .value=${o.color||"red"}
            @value-changed=${e=>s({color:e.detail.value})}
          ></ultra-color-picker>
        </div>
        <div class="field-container">
          <div class="field-title">Text Color</div>
          <ultra-color-picker
            .value=${o.text_color||o.textColor||"#ffffff"}
            @value-changed=${e=>s({text_color:e.detail.value,textColor:void 0})}
          ></ultra-color-picker>
        </div>
      </div>
    `}renderBooleanModeSelect(e,t){return a.qy`
      <ha-select
        style="width: 100%;"
        .value=${e}
        @selected=${e=>{const i=e.target.value;"auto"===i&&t(void 0),"true"===i&&t(!0),"false"===i&&t(!1),"template"===i&&t("[[[ return true; ]]]")}}
      >
        <mwc-list-item value="auto">Auto</mwc-list-item>
        <mwc-list-item value="true">Always True</mwc-list-item>
        <mwc-list-item value="false">Always False</mwc-list-item>
        <mwc-list-item value="template">JS Template</mwc-list-item>
      </ha-select>
    `}getBooleanMode(e){return"boolean"==typeof e?e?"true":"false":"string"==typeof e?"template":"auto"}getHapticConfig(e){return!0===e.nav_haptic?{url:!1,tap_action:!0,hold_action:!0,double_tap_action:!0}:!1!==e.nav_haptic&&e.nav_haptic?e.nav_haptic:{url:!1,tap_action:!0,hold_action:!0,double_tap_action:!0}}getEditorStyles(){return"\n      .module-settings {\n        padding-bottom: 24px;\n      }\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 12px;\n        padding: 20px;\n        margin-bottom: 24px;\n      }\n      .section-title {\n        font-size: 16px;\n        font-weight: 700;\n        color: var(--primary-color);\n        margin-bottom: 8px;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n      .section-description {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        margin-bottom: 20px;\n        line-height: 1.4;\n      }\n      .info-box {\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        padding: 12px;\n        background: rgba(var(--rgb-info-color), 0.1);\n        border-radius: 8px;\n        border-left: 4px solid var(--info-color);\n        font-size: 13px;\n        color: var(--primary-text-color);\n      }\n      .info-box ha-icon {\n        color: var(--info-color);\n        --mdc-icon-size: 20px;\n      }\n      .add-entity-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        width: 100%;\n        padding: 12px;\n        border: 1px dashed var(--primary-color);\n        border-radius: 10px;\n        background: none;\n        color: var(--primary-color);\n        cursor: pointer;\n        font-size: 14px;\n        font-weight: 600;\n        transition: all 0.2s;\n      }\n      .add-entity-btn:hover {\n        background: rgba(var(--rgb-primary-color), 0.08);\n      }\n      .routes-list {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        margin-bottom: 16px;\n      }\n      .entity-row {\n        border: 1px solid var(--divider-color);\n        border-radius: 10px;\n        background: var(--card-background-color);\n        overflow: hidden;\n        transition: all 0.2s;\n      }\n      .entity-row:hover {\n        border-color: var(--primary-color);\n      }\n      .entity-row.expanded {\n        border-color: var(--primary-color);\n        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.15);\n      }\n      .entity-row.dragging {\n        opacity: 0.5;\n        border: 2px dashed var(--primary-color);\n      }\n      .entity-row.drag-over {\n        border: 2px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.05);\n      }\n      .entity-row.stack-child-row {\n        background: rgba(var(--rgb-accent-color, var(--rgb-primary-color)), 0.03);\n      }\n      .entity-row.stack-child-row:hover {\n        border-color: var(--accent-color);\n      }\n      .stack-drop-zone.drag-over {\n        background: rgba(var(--rgb-accent-color, var(--rgb-primary-color)), 0.15) !important;\n        color: var(--accent-color) !important;\n        font-weight: 600;\n        border-top-color: var(--accent-color) !important;\n      }\n      .entity-row.special-item {\n        border-left: 3px solid var(--primary-color);\n      }\n      .special-badge {\n        font-size: 10px;\n        padding: 2px 8px;\n        background: rgba(var(--rgb-primary-color), 0.15);\n        color: var(--primary-color);\n        border-radius: 10px;\n        font-weight: 600;\n        text-transform: uppercase;\n        letter-spacing: 0.3px;\n      }\n      .entity-header {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        padding: 12px 14px;\n        cursor: pointer;\n        user-select: none;\n        gap: 8px;\n      }\n      .drag-handle {\n        cursor: grab;\n        padding: 4px;\n        display: flex;\n        align-items: center;\n        opacity: 0.5;\n        transition: opacity 0.2s;\n      }\n      .drag-handle:hover {\n        opacity: 1;\n      }\n      .drag-handle:active {\n        cursor: grabbing;\n      }\n      .entity-info {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        flex: 1;\n        min-width: 0;\n      }\n      .entity-icon {\n        --mdc-icon-size: 22px;\n        color: var(--primary-color);\n        flex-shrink: 0;\n      }\n      .entity-name {\n        font-weight: 600;\n        font-size: 14px;\n        color: var(--primary-text-color);\n      }\n      .entity-detail {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-left: 8px;\n      }\n      .entity-actions {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        flex-shrink: 0;\n      }\n      .entity-action-btn {\n        border: none;\n        background: none;\n        padding: 6px;\n        cursor: pointer;\n        border-radius: 6px;\n        color: var(--secondary-text-color);\n        transition: all 0.2s;\n      }\n      .entity-action-btn:hover {\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n      }\n      .entity-action-btn.delete:hover {\n        color: var(--error-color);\n      }\n      .entity-action-btn.duplicate:hover {\n        color: var(--accent-color);\n      }\n      .expand-icon {\n        --mdc-icon-size: 20px;\n        color: var(--secondary-text-color);\n        transition: transform 0.2s;\n      }\n      .entity-row.expanded .expand-icon {\n        transform: rotate(180deg);\n      }\n      .entity-expanded {\n        padding: 16px;\n        border-top: 1px solid var(--divider-color);\n        background: var(--secondary-background-color);\n      }\n      .entity-field-group {\n        margin-bottom: 20px;\n      }\n      .entity-field-group:last-child {\n        margin-bottom: 0;\n      }\n      .field-group-title {\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 12px;\n        padding-bottom: 8px;\n        border-bottom: 1px solid var(--divider-color);\n      }\n      .entity-fields-grid {\n        display: grid;\n        gap: 12px;\n        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n      }\n      .field-container {\n        margin-bottom: 12px;\n      }\n      /* Perform Action: hide HA action type dropdown and show only action fields */\n      .nav-action-perform-action ha-selector-ui-action ha-select,\n      .nav-action-perform-action ha-form .label,\n      .nav-action-perform-action ha-form label,\n      .nav-action-perform-action ha-form .mdc-floating-label,\n      .nav-action-perform-action ha-selector-ui-action::part(select),\n      .nav-action-perform-action ha-selector-ui-action::part(action) {\n        display: none;\n      }\n      .nav-action-perform-action ha-selector-ui-action {\n        margin-top: 0;\n      }\n      .field-title {\n        font-size: 13px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 6px;\n      }\n      .field-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        line-height: 1.4;\n        margin-bottom: 8px;\n      }\n      .compact-item-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        margin-bottom: 8px;\n        background: var(--card-background-color);\n      }\n      .color-field {\n        margin-bottom: 16px;\n      }\n    "}}},9009:(e,t,i)=>{var a=i(5183),n=i(4276),o=i(9811),l=function(e,t,i,a){var n,o=arguments.length,l=o<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,a);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(l=(o<3?n(l):o>3?n(t,i,l):n(t,i))||l);return o>3&&l&&Object.defineProperty(t,i,l),l};let s=class extends a.WF{static get styles(){return a.AH`
      ha-entity-picker {
        width: 100%;
        display: block;
      }
    `}render(){return a.qy`
      <ha-entity-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value||""}
        .entityFilter=${this.entityFilter}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>
    `}_valueChanged(e){e.stopPropagation();const t=e.detail.value;t!==this.value&&(this.value=t,(0,o.fireEvent)(this,"value-changed",{value:t}))}};l([(0,n.MZ)({attribute:!1})],s.prototype,"hass",void 0),l([(0,n.MZ)()],s.prototype,"label",void 0),l([(0,n.MZ)()],s.prototype,"value",void 0),l([(0,n.MZ)()],s.prototype,"entityFilter",void 0),s=l([(0,n.EM)("ultra-card-entity-picker")],s)}}]);