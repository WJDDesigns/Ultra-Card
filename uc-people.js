"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8778],{4821:(e,t,n)=>{n.r(t),n.d(t,{UltraPeopleModule:()=>s});var a=n(5183),i=n(7475),r=n(9760),o=n(6478);n(7921);class s extends i.m{constructor(){super(...arguments),this.metadata={type:"people",title:"People",description:"Display person information with customizable data items",author:"WJD Designs",version:"1.0.0",icon:"mdi:account",category:"data",tags:["people","person","presence","location","avatar","user"]},this._draggedItemIndex=null,this._dragOverIndex=null}createDefault(e,t){return{id:e||this.generateId("people"),type:"people",person_entity:"",layout_style:"compact",data_items:[{id:this.generateId("item"),type:"location",show_icon:!0,show_label:!0,show_value:!0,icon:"mdi:map-marker",icon_color:"var(--primary-color)"}],avatar_settings:{size:80,border_width:3,border_color:"var(--primary-color)",show_status_badge:!0,status_badge_position:"bottom-right",status_badge_home_color:"#4CAF50",status_badge_away_color:"#FF5722",use_state_color:!0,state_home_color:"#4CAF50",state_away_color:"#FF5722",fallback_icon:"mdi:account",show_entity_picture:!0,image_fit:"cover"},banner_settings:{background_type:"gradient",gradient_start:"#667eea",gradient_end:"#764ba2",gradient_direction:"to-bottom-right",background_blur:0,background_opacity:100,overlay_opacity:30,banner_height:120},name_settings:{show:!0,use_friendly_name:!0,font_size:18,font_weight:"600",color:"var(--primary-text-color)",alignment:"center"},location_settings:{show:!0,show_icon:!0,icon:"mdi:map-marker",icon_color:"var(--secondary-text-color)",font_size:14,color:"var(--secondary-text-color)",show_duration:!1,duration_format:"relative"},gap:12,data_items_gap:8,data_items_direction:"column",alignment:"center",vertical_alignment:"center",header_show_badges:!0,header_badges_position:"top",music_show_progress:!0,music_show_album_art:!0,music_blur_background:!0,music_album_blur:5,music_album_opacity:75,tap_action:{action:"more-info"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}_getDataItemsForLayout(e,t){return e[`data_items_${t||e.layout_style}`]||e.data_items||[]}_setDataItemsForLayout(e,t,n){const a=`data_items_${e.layout_style}`;n({[a]:t})}renderGeneralTab(e,t,n,i){var r;const o=e,s=(null===(r=null==t?void 0:t.locale)||void 0===r?void 0:r.language)||"en";return a.qy`
      ${this.injectUcFormStyles()}
      <style>
        ${this._getEditorStyles()}
      </style>
      <div class="module-general-settings">
        <!-- Person Entity Selection -->
        ${this._renderPersonEntitySection(o,t,i,s)}

        <!-- Layout Style Selection -->
        ${this._renderLayoutStyleSection(o,t,i,s)}

        <!-- Avatar Settings -->
        ${this._renderAvatarSettingsSection(o,t,i,s)}

        <!-- Banner Settings (show only for banner layout) -->
        ${"banner"===o.layout_style?this._renderBannerSettingsSection(o,t,i,s):""}

        <!-- Music Settings (show only for music_overlay layout) -->
        ${"music_overlay"===o.layout_style?this._renderMusicSettingsSection(o,t,i,s):""}

        <!-- Name Settings -->
        ${this._renderNameSettingsSection(o,t,i,s)}

        <!-- Data Items Builder -->
        ${this._renderDataItemsBuilder(o,t,n,i,s)}

        <!-- Associated Entities (show for layouts that use them) -->
        ${["banner","music_overlay","horizontal_detailed"].includes(o.layout_style)?this._renderAssociatedEntitiesSection(o,t,i,s):""}

        <!-- Layout & Spacing -->
        ${this._renderLayoutSpacingSection(o,t,i,s)}
      </div>
    `}_renderPersonEntitySection(e,t,n,i){return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.person_entity",i,"Person Entity")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.modules.people.person_entity_desc",i,"Select the person entity to display")}
        </div>
        <ha-form
          .hass=${t}
          .data=${{entity:e.person_entity||""}}
          .schema=${[{name:"entity",label:(0,o.kg)("editor.modules.people.person",i,"Person"),selector:{entity:{domain:"person"}}}]}
          .computeLabel=${e=>e.label||e.name}
          @value-changed=${t=>{const a=t.detail.value.entity;a!==e.person_entity&&(n({person_entity:a}),this.triggerPreviewUpdate())}}
        ></ha-form>
      </div>
    `}_renderLayoutStyleSection(e,t,n,i){return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.layout_style",i,"Layout Style")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.modules.people.layout_style_desc",i,"Choose how the person information is displayed")}
        </div>
        <div class="layout-style-grid">
          ${[{value:"compact",label:"Compact Card",icon:"mdi:card-account-details"},{value:"banner",label:"Banner",icon:"mdi:image-area"},{value:"horizontal_compact",label:"Horizontal Compact",icon:"mdi:view-sequential"},{value:"horizontal_detailed",label:"Horizontal Detailed",icon:"mdi:view-list"},{value:"header",label:"Header",icon:"mdi:page-layout-header"},{value:"music_overlay",label:"Music Overlay",icon:"mdi:music"}].map((t=>a.qy`
              <div
                class="layout-style-option ${e.layout_style===t.value?"selected":""}"
                @click=${()=>{n({layout_style:t.value}),this.triggerPreviewUpdate()}}
              >
                <ha-icon icon="${t.icon}"></ha-icon>
                <span>${t.label}</span>
              </div>
            `))}
        </div>
      </div>
    `}_renderAvatarSettingsSection(e,t,n,i){const r=e.avatar_settings||this.createDefault().avatar_settings,s=["banner","horizontal_detailed","header","music_overlay"].includes(e.layout_style),l=[{name:"show_avatar",label:(0,o.kg)("editor.modules.people.show_avatar",i,"Show Avatar"),selector:{boolean:{}}}];return s&&l.push({name:"show_location_badge",label:(0,o.kg)("editor.modules.people.show_location_badge",i,"Show Location Badge"),selector:{boolean:{}}},{name:"show_battery_badge",label:(0,o.kg)("editor.modules.people.show_battery_badge",i,"Show Battery Badge"),selector:{boolean:{}}}),a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.avatar_settings",i,"Avatar Settings")}
        </div>

        <!-- Element Visibility Toggles -->
        <div class="field-container">
          <ha-form
            .hass=${t}
            .data=${Object.assign({show_avatar:!1!==e.show_avatar},s?{show_location_badge:!1!==e.show_location_badge,show_battery_badge:!1!==e.show_battery_badge}:{})}
            .schema=${l}
            .computeLabel=${e=>e.label}
            .computeDescription=${e=>e.description}
            @value-changed=${e=>{n(e.detail.value),this.triggerPreviewUpdate()}}
          ></ha-form>
        </div>

        <!-- Avatar Size -->
        <div class="field-container">
          <div class="field-title">
            ${(0,o.kg)("editor.modules.people.avatar_size",i,"Avatar Size")}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="40"
              max="200"
              step="4"
              .value="${r.size}"
              @input=${e=>{const t=Number(e.target.value);n({avatar_settings:Object.assign(Object.assign({},r),{size:t})}),this.triggerPreviewUpdate()}}
            />
            <input
              type="number"
              class="range-input"
              min="40"
              max="200"
              step="4"
              .value="${r.size}"
              @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({avatar_settings:Object.assign(Object.assign({},r),{size:t})}),this.triggerPreviewUpdate())}}
              @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=r.size||80,a="ArrowUp"===e.key?4:-4,i=Math.max(40,Math.min(200,t+a));n({avatar_settings:Object.assign(Object.assign({},r),{size:i})}),this.triggerPreviewUpdate()}}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{n({avatar_settings:Object.assign(Object.assign({},r),{size:80})}),this.triggerPreviewUpdate()}}
              title="Reset to default (80px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Border Width -->
        <div class="field-container">
          <div class="field-title">
            ${(0,o.kg)("editor.modules.people.border_width",i,"Border Width")}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="10"
              step="1"
              .value="${r.border_width}"
              @input=${e=>{const t=Number(e.target.value);n({avatar_settings:Object.assign(Object.assign({},r),{border_width:t})}),this.triggerPreviewUpdate()}}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="20"
              step="1"
              .value="${r.border_width}"
              @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({avatar_settings:Object.assign(Object.assign({},r),{border_width:t})}),this.triggerPreviewUpdate())}}
              @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=r.border_width||3,a="ArrowUp"===e.key?1:-1,i=Math.max(0,Math.min(20,t+a));n({avatar_settings:Object.assign(Object.assign({},r),{border_width:i})}),this.triggerPreviewUpdate()}}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{n({avatar_settings:Object.assign(Object.assign({},r),{border_width:3})}),this.triggerPreviewUpdate()}}
              title="Reset to default (3px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Use State Color -->
        <div class="field-container">
          <ha-form
            .hass=${t}
            .data=${{use_state_color:!1!==r.use_state_color}}
            .schema=${[{name:"use_state_color",label:(0,o.kg)("editor.modules.people.use_state_color",i,"Use State-Based Border Color"),description:(0,o.kg)("editor.modules.people.use_state_color_desc",i,"Change border color based on home/away status"),selector:{boolean:{}}}]}
            .computeLabel=${e=>e.label}
            .computeDescription=${e=>e.description}
            @value-changed=${e=>{n({avatar_settings:Object.assign(Object.assign({},r),{use_state_color:e.detail.value.use_state_color})}),this.triggerPreviewUpdate()}}
          ></ha-form>
        </div>

        ${r.use_state_color?a.qy`
              <div class="color-row">
                <div class="color-field">
                  <div class="field-title">
                    ${(0,o.kg)("editor.modules.people.home_color",i,"Home Color")}
                  </div>
                  <ultra-color-picker
                    .value=${r.state_home_color||"#4CAF50"}
                    .defaultValue=${"#4CAF50"}
                    .hass=${t}
                    @value-changed=${e=>{n({avatar_settings:Object.assign(Object.assign({},r),{state_home_color:e.detail.value})}),this.triggerPreviewUpdate()}}
                  ></ultra-color-picker>
                </div>
                <div class="color-field">
                  <div class="field-title">
                    ${(0,o.kg)("editor.modules.people.away_color",i,"Away Color")}
                  </div>
                  <ultra-color-picker
                    .value=${r.state_away_color||"#FF5722"}
                    .defaultValue=${"#FF5722"}
                    .hass=${t}
                    @value-changed=${e=>{n({avatar_settings:Object.assign(Object.assign({},r),{state_away_color:e.detail.value})}),this.triggerPreviewUpdate()}}
                  ></ultra-color-picker>
                </div>
              </div>
            `:a.qy`
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.border_color",i,"Border Color")}
                </div>
                <ultra-color-picker
                  .value=${r.border_color||"var(--primary-color)"}
                  .defaultValue=${"var(--primary-color)"}
                  .hass=${t}
                  @value-changed=${e=>{n({avatar_settings:Object.assign(Object.assign({},r),{border_color:e.detail.value})}),this.triggerPreviewUpdate()}}
                ></ultra-color-picker>
              </div>
            `}

        <!-- Status Badge -->
        <div class="field-container">
          <ha-form
            .hass=${t}
            .data=${{show_status_badge:!1!==r.show_status_badge}}
            .schema=${[{name:"show_status_badge",label:(0,o.kg)("editor.modules.people.show_status_badge",i,"Show Status Badge"),description:(0,o.kg)("editor.modules.people.show_status_badge_desc",i,"Show home/away indicator on avatar"),selector:{boolean:{}}}]}
            .computeLabel=${e=>e.label}
            .computeDescription=${e=>e.description}
            @value-changed=${e=>{n({avatar_settings:Object.assign(Object.assign({},r),{show_status_badge:e.detail.value.show_status_badge})}),this.triggerPreviewUpdate()}}
          ></ha-form>
        </div>

        ${r.show_status_badge?a.qy`
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.badge_position",i,"Badge Position")}
                </div>
                <div class="position-grid">
                  ${["top-left","top-right","bottom-left","bottom-right"].map((e=>a.qy`
                      <div
                        class="position-option ${r.status_badge_position===e?"selected":""}"
                        @click=${()=>{n({avatar_settings:Object.assign(Object.assign({},r),{status_badge_position:e})}),this.triggerPreviewUpdate()}}
                      >
                        ${e.replace("-"," ")}
                      </div>
                    `))}
                </div>
              </div>
            `:""}
      </div>
    `}_renderBannerSettingsSection(e,t,n,i){var r,s,l,d,c,p,u,g;const m=e.banner_settings||this.createDefault().banner_settings;return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.banner_settings",i,"Banner Settings")}
        </div>

        <!-- Background Type -->
        <div class="field-container">
          <div class="field-title">
            ${(0,o.kg)("editor.modules.people.background_type",i,"Background Type")}
          </div>
          <div class="button-group">
            ${["image","gradient","color","entity"].map((e=>a.qy`
                <button
                  class="option-btn ${m.background_type===e?"active":""}"
                  @click=${()=>{n({banner_settings:Object.assign(Object.assign({},m),{background_type:e})}),this.triggerPreviewUpdate()}}
                >
                  ${e.charAt(0).toUpperCase()+e.slice(1)}
                </button>
              `))}
          </div>
        </div>

        ${"image"===m.background_type?a.qy`
              <div class="field-container">
                <ha-form
                  .hass=${t}
                  .data=${{image:m.background_image||""}}
                  .schema=${[{name:"image",label:(0,o.kg)("editor.modules.people.background_image",i,"Image URL"),selector:{text:{}}}]}
                  .computeLabel=${e=>e.label}
                  @value-changed=${e=>{n({banner_settings:Object.assign(Object.assign({},m),{background_image:e.detail.value.image})}),this.triggerPreviewUpdate()}}
                ></ha-form>
              </div>
            `:""}
        ${"gradient"===m.background_type?a.qy`
              <div class="color-row">
                <div class="color-field">
                  <div class="field-title">Start Color</div>
                  <ultra-color-picker
                    .value=${m.gradient_start||"#667eea"}
                    .defaultValue=${"#667eea"}
                    .hass=${t}
                    @value-changed=${e=>{n({banner_settings:Object.assign(Object.assign({},m),{gradient_start:e.detail.value})}),this.triggerPreviewUpdate()}}
                  ></ultra-color-picker>
                </div>
                <div class="color-field">
                  <div class="field-title">End Color</div>
                  <ultra-color-picker
                    .value=${m.gradient_end||"#764ba2"}
                    .defaultValue=${"#764ba2"}
                    .hass=${t}
                    @value-changed=${e=>{n({banner_settings:Object.assign(Object.assign({},m),{gradient_end:e.detail.value})}),this.triggerPreviewUpdate()}}
                  ></ultra-color-picker>
                </div>
              </div>
            `:""}
        ${"color"===m.background_type?a.qy`
              <div class="field-container">
                <div class="field-title">Background Color</div>
                <ultra-color-picker
                  .value=${m.background_color||"#667eea"}
                  .defaultValue=${"#667eea"}
                  .hass=${t}
                  @value-changed=${e=>{n({banner_settings:Object.assign(Object.assign({},m),{background_color:e.detail.value})}),this.triggerPreviewUpdate()}}
                ></ultra-color-picker>
              </div>
            `:""}
        ${"entity"===m.background_type?a.qy`
              <div class="field-container">
                <ha-form
                  .hass=${t}
                  .data=${{entity:m.background_entity||""}}
                  .schema=${[{name:"entity",label:(0,o.kg)("editor.modules.people.background_entity",i,"Entity with Picture"),selector:{entity:{}}}]}
                  .computeLabel=${e=>e.label}
                  @value-changed=${e=>{n({banner_settings:Object.assign(Object.assign({},m),{background_entity:e.detail.value.entity})}),this.triggerPreviewUpdate()}}
                ></ha-form>
              </div>
            `:""}

        <!-- Banner Height -->
        <div class="field-container">
          <div class="field-title">
            ${(0,o.kg)("editor.modules.people.banner_height",i,"Banner Height")}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="60"
              max="300"
              step="10"
              .value="${m.banner_height||120}"
              @input=${e=>{const t=Number(e.target.value);n({banner_settings:Object.assign(Object.assign({},m),{banner_height:t})}),this.triggerPreviewUpdate()}}
            />
            <input
              type="number"
              class="range-input"
              min="60"
              max="400"
              step="10"
              .value="${m.banner_height||120}"
              @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({banner_settings:Object.assign(Object.assign({},m),{banner_height:t})}),this.triggerPreviewUpdate())}}
              @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=m.banner_height||120,a="ArrowUp"===e.key?10:-10,i=Math.max(60,Math.min(400,t+a));n({banner_settings:Object.assign(Object.assign({},m),{banner_height:i})}),this.triggerPreviewUpdate()}}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{n({banner_settings:Object.assign(Object.assign({},m),{banner_height:120})}),this.triggerPreviewUpdate()}}
              title="Reset to default (120px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Blur Amount -->
        <div class="field-container">
          <div class="field-title">
            ${(0,o.kg)("editor.modules.people.blur_amount",i,"Blur Amount")}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="20"
              step="1"
              .value="${m.background_blur||0}"
              @input=${e=>{const t=Number(e.target.value);n({banner_settings:Object.assign(Object.assign({},m),{background_blur:t})}),this.triggerPreviewUpdate()}}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="30"
              step="1"
              .value="${m.background_blur||0}"
              @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({banner_settings:Object.assign(Object.assign({},m),{background_blur:t})}),this.triggerPreviewUpdate())}}
              @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=m.background_blur||0,a="ArrowUp"===e.key?1:-1,i=Math.max(0,Math.min(30,t+a));n({banner_settings:Object.assign(Object.assign({},m),{background_blur:i})}),this.triggerPreviewUpdate()}}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{n({banner_settings:Object.assign(Object.assign({},m),{background_blur:0})}),this.triggerPreviewUpdate()}}
              title="Reset to default (0px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Banner Border Radius -->
        <div class="field-container">
          <div class="field-title-row">
            <span class="field-title">
              ${(0,o.kg)("editor.modules.people.banner_border_radius",i,"Banner Border Radius")}
            </span>
            <button
              class="link-corners-btn ${!1!==m.corners_linked?"linked":""}"
              @click=${()=>{if(!1===m.corners_linked){const e=m.border_radius||0;n({banner_settings:Object.assign(Object.assign({},m),{corners_linked:!0,border_radius_top_left:e,border_radius_top_right:e,border_radius_bottom_left:e,border_radius_bottom_right:e})})}else n({banner_settings:Object.assign(Object.assign({},m),{corners_linked:!1})});this.triggerPreviewUpdate()}}
              title="${!1!==m.corners_linked?"Unlink corners":"Link all corners"}"
            >
              <ha-icon
                icon="${!1!==m.corners_linked?"mdi:link":"mdi:link-off"}"
              ></ha-icon>
            </button>
          </div>

          ${!1!==m.corners_linked?a.qy`
                <!-- All corners linked - single slider -->
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="0"
                    max="48"
                    step="1"
                    value="${m.border_radius||0}"
                    @input=${e=>{const t=Number(e.target.value);n({banner_settings:Object.assign(Object.assign({},m),{border_radius:t,border_radius_top_left:t,border_radius_top_right:t,border_radius_bottom_left:t,border_radius_bottom_right:t})}),this.triggerPreviewUpdate()}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="0"
                    max="48"
                    step="1"
                    value="${m.border_radius||0}"
                    @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({banner_settings:Object.assign(Object.assign({},m),{border_radius:t,border_radius_top_left:t,border_radius_top_right:t,border_radius_bottom_left:t,border_radius_bottom_right:t})}),this.triggerPreviewUpdate())}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>{n({banner_settings:Object.assign(Object.assign({},m),{border_radius:0,border_radius_top_left:0,border_radius_top_right:0,border_radius_bottom_left:0,border_radius_bottom_right:0})}),this.triggerPreviewUpdate()}}
                    title="Reset to 0"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              `:a.qy`
                <!-- Individual corner controls -->
                <div class="corner-radius-grid">
                  <!-- Top Left -->
                  <div class="corner-control top-left">
                    <span class="corner-label">TL</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${null!==(s=null!==(r=m.border_radius_top_left)&&void 0!==r?r:m.border_radius)&&void 0!==s?s:0}"
                      @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({banner_settings:Object.assign(Object.assign({},m),{border_radius_top_left:t})}),this.triggerPreviewUpdate())}}
                    />
                  </div>
                  <!-- Top Right -->
                  <div class="corner-control top-right">
                    <span class="corner-label">TR</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${null!==(d=null!==(l=m.border_radius_top_right)&&void 0!==l?l:m.border_radius)&&void 0!==d?d:0}"
                      @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({banner_settings:Object.assign(Object.assign({},m),{border_radius_top_right:t})}),this.triggerPreviewUpdate())}}
                    />
                  </div>
                  <!-- Bottom Left -->
                  <div class="corner-control bottom-left">
                    <span class="corner-label">BL</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${null!==(p=null!==(c=m.border_radius_bottom_left)&&void 0!==c?c:m.border_radius)&&void 0!==p?p:0}"
                      @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({banner_settings:Object.assign(Object.assign({},m),{border_radius_bottom_left:t})}),this.triggerPreviewUpdate())}}
                    />
                  </div>
                  <!-- Bottom Right -->
                  <div class="corner-control bottom-right">
                    <span class="corner-label">BR</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${null!==(g=null!==(u=m.border_radius_bottom_right)&&void 0!==u?u:m.border_radius)&&void 0!==g?g:0}"
                      @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({banner_settings:Object.assign(Object.assign({},m),{border_radius_bottom_right:t})}),this.triggerPreviewUpdate())}}
                    />
                  </div>
                </div>
              `}
        </div>
      </div>
    `}_renderMusicSettingsSection(e,t,n,i){var r,s,l,d;return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.music_settings",i,"Music Settings")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.modules.people.music_settings_desc",i,"Configure music/media display options")}
        </div>

        <!-- Music Toggles -->
        <ha-form
          .hass=${t}
          .data=${{music_show_progress:!1!==e.music_show_progress,music_show_album_art:!1!==e.music_show_album_art,music_blur_background:!1!==e.music_blur_background}}
          .schema=${[{name:"music_show_progress",label:"Show Progress Bar",selector:{boolean:{}}},{name:"music_show_album_art",label:"Show Album Art",selector:{boolean:{}}},{name:"music_blur_background",label:"Blur Background",selector:{boolean:{}}}]}
          .computeLabel=${e=>e.label}
          @value-changed=${e=>{n(e.detail.value),this.triggerPreviewUpdate()}}
        ></ha-form>

        <!-- Album Art Blur Amount -->
        <div class="field-container">
          <div class="field-title">Album Art Blur</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="20"
              step="1"
              value="${null!==(r=e.music_album_blur)&&void 0!==r?r:5}"
              @input=${e=>{const t=Number(e.target.value);n({music_album_blur:t}),this.triggerPreviewUpdate()}}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="20"
              step="1"
              value="${null!==(s=e.music_album_blur)&&void 0!==s?s:5}"
              @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({music_album_blur:t}),this.triggerPreviewUpdate())}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{n({music_album_blur:5}),this.triggerPreviewUpdate()}}
              title="Reset to default (5px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Album Art Opacity -->
        <div class="field-container">
          <div class="field-title">Album Art Opacity</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="100"
              step="5"
              value="${null!==(l=e.music_album_opacity)&&void 0!==l?l:75}"
              @input=${e=>{const t=Number(e.target.value);n({music_album_opacity:t}),this.triggerPreviewUpdate()}}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="100"
              step="5"
              value="${null!==(d=e.music_album_opacity)&&void 0!==d?d:75}"
              @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({music_album_opacity:t}),this.triggerPreviewUpdate())}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{n({music_album_opacity:75}),this.triggerPreviewUpdate()}}
              title="Reset to default (75%)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Media Player Entity -->
        <div class="field-container">
          <div class="field-title">Media Player Entity</div>
          <ha-form
            .hass=${t}
            .data=${{entity:e.media_player_entity||""}}
            .schema=${[{name:"entity",label:"Media Player",selector:{entity:{domain:"media_player"}}}]}
            .computeLabel=${e=>e.label}
            @value-changed=${e=>{n({media_player_entity:e.detail.value.entity}),this.triggerPreviewUpdate()}}
          ></ha-form>
        </div>
      </div>
    `}_renderNameSettingsSection(e,t,n,i){const r=e.name_settings||this.createDefault().name_settings;return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.name_settings",i,"Name Settings")}
        </div>

        <!-- Show Name -->
        <div class="field-container">
          <ha-form
            .hass=${t}
            .data=${{show_name:!1!==r.show}}
            .schema=${[{name:"show_name",label:(0,o.kg)("editor.modules.people.show_name",i,"Show Name"),selector:{boolean:{}}}]}
            .computeLabel=${e=>e.label}
            @value-changed=${e=>{n({name_settings:Object.assign(Object.assign({},r),{show:e.detail.value.show_name})}),this.triggerPreviewUpdate()}}
          ></ha-form>
        </div>

        ${r.show?a.qy`
              <!-- Custom Name -->
              <div class="field-container">
                <ha-form
                  .hass=${t}
                  .data=${{custom_name:r.custom_name||""}}
                  .schema=${[{name:"custom_name",label:(0,o.kg)("editor.modules.people.custom_name",i,"Custom Name (leave empty to use friendly name)"),selector:{text:{}}}]}
                  .computeLabel=${e=>e.label}
                  @value-changed=${e=>{n({name_settings:Object.assign(Object.assign({},r),{custom_name:e.detail.value.custom_name})}),this.triggerPreviewUpdate()}}
                ></ha-form>
              </div>

              <!-- Font Size -->
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.name_font_size",i,"Font Size")}
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="12"
                    max="36"
                    step="1"
                    .value="${r.font_size}"
                    @input=${e=>{const t=Number(e.target.value);n({name_settings:Object.assign(Object.assign({},r),{font_size:t})}),this.triggerPreviewUpdate()}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="12"
                    max="48"
                    step="1"
                    .value="${r.font_size}"
                    @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({name_settings:Object.assign(Object.assign({},r),{font_size:t})}),this.triggerPreviewUpdate())}}
                    @keydown=${e=>{if("ArrowUp"===e.key||"ArrowDown"===e.key){e.preventDefault();const t=r.font_size||18,a="ArrowUp"===e.key?1:-1,i=Math.max(12,Math.min(48,t+a));n({name_settings:Object.assign(Object.assign({},r),{font_size:i})}),this.triggerPreviewUpdate()}}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>{n({name_settings:Object.assign(Object.assign({},r),{font_size:18})}),this.triggerPreviewUpdate()}}
                    title="Reset to default (18px)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Name Color -->
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.name_color",i,"Name Color")}
                </div>
                <ultra-color-picker
                  .value=${r.color||"var(--primary-text-color)"}
                  .defaultValue=${"var(--primary-text-color)"}
                  .hass=${t}
                  @value-changed=${e=>{n({name_settings:Object.assign(Object.assign({},r),{color:e.detail.value})}),this.triggerPreviewUpdate()}}
                ></ultra-color-picker>
              </div>
            `:""}
      </div>
    `}_renderDataItemsBuilder(e,t,n,i,r){const s=this._getDataItemsForLayout(e);return a.qy`
      <div class="settings-section data-items-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.data_items",r,"Data Items")}
          <span class="layout-badge">${e.layout_style}</span>
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.modules.people.data_items_desc",r,"Drag to reorder, click to configure")}
          - Items are saved per layout style
        </div>

        <!-- Data Items List -->
        <div class="data-items-list">
          ${s.map(((a,o)=>this._renderDataItemRow(a,o,e,t,n,i,r)))}
        </div>

        <!-- Add Data Item Button -->
        <div class="add-item-container">
          <div class="add-item-dropdown">
            <select
              class="add-item-select"
              @change=${t=>{const n=t.target.value;n&&(this._addDataItem(e,n,i),t.target.value="")}}
            >
              <option value="">
                ${(0,o.kg)("editor.modules.people.add_data_item",r,"+ Add Data Item")}
              </option>
              <option value="location">Location</option>
              <option value="battery">Battery</option>
              <option value="time_info">Time Info</option>
              <option value="media">Media</option>
              <option value="sensor">Sensor</option>
              <option value="device_state">Device State</option>
              <option value="attribute">Attribute</option>
              <option value="toggle">Toggle</option>
            </select>
          </div>
        </div>
      </div>
    `}_renderDataItemRow(e,t,n,i,r,o,s){return a.qy`
      <ha-expansion-panel
        .outlined=${!0}
        class="data-item-panel ${this._draggedItemIndex===t?"dragging":""} ${this._dragOverIndex===t?"drag-over":""}"
      >
        <div
          slot="header"
          class="data-item-header"
          draggable="true"
          @dragstart=${e=>this._onDataItemDragStart(e,t)}
          @dragover=${e=>this._onDataItemDragOver(e,t)}
          @dragend=${()=>this._onDataItemDragEnd()}
          @drop=${e=>this._onDataItemDrop(e,t,n,o)}
        >
          <div class="drag-handle" @click=${e=>e.stopPropagation()}>
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <div class="item-icon">
            <ha-icon icon="${e.icon||{location:"mdi:map-marker",battery:"mdi:battery",time_info:"mdi:clock-outline",media:"mdi:music",sensor:"mdi:gauge",device_state:"mdi:wifi",attribute:"mdi:code-tags",toggle:"mdi:toggle-switch"}[e.type]}"></ha-icon>
          </div>
          <div class="item-info">
            <div class="item-type">${{location:"Location",battery:"Battery",time_info:"Time Info",media:"Media",sensor:"Sensor",device_state:"Device State",attribute:"Attribute",toggle:"Toggle"}[e.type]}</div>
            <div class="item-label">${e.label||this._getDefaultItemLabel(e,i)}</div>
          </div>
          <button
            class="item-action-btn delete"
            @click=${e=>{e.stopPropagation(),this._removeDataItem(n,t,o)}}
            title="Delete"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
        <div class="data-item-content">
          ${this._renderDataItemConfig(e,t,n,i,o,s)}
        </div>
      </ha-expansion-panel>
    `}_renderDataItemConfig(e,t,n,i,r,o){return a.qy`
      <!-- Type-specific settings (Entity first) -->
      ${this._renderTypeSpecificConfig(e,t,n,i,r,o)}

      <!-- Icon and Label settings -->
      <ha-form
        .hass=${i}
        .data=${{icon:e.icon||"",label:e.label||""}}
        .schema=${[{name:"icon",label:"Custom Icon",selector:{icon:{}}},{name:"label",label:"Custom Label",selector:{text:{}}}]}
        .computeLabel=${e=>e.label}
        @value-changed=${e=>{this._updateDataItem(n,t,e.detail.value,r)}}
      ></ha-form>

      <!-- Toggle switches -->
      <ha-form
        .hass=${i}
        .data=${{show_icon:!1!==e.show_icon,show_label:!0===e.show_label,show_value:!1!==e.show_value}}
        .schema=${[{name:"show_icon",label:"Show Icon",selector:{boolean:{}}},{name:"show_label",label:"Show Label",selector:{boolean:{}}},{name:"show_value",label:"Show Value",selector:{boolean:{}}}]}
        .computeLabel=${e=>e.label}
        @value-changed=${e=>{this._updateDataItem(n,t,e.detail.value,r)}}
      ></ha-form>

      <!-- Styling section -->
      <div class="styling-section">
        <div class="section-subtitle">Styling</div>

        <!-- Icon Color -->
        <div class="color-row">
          <span class="color-label">Icon Color</span>
          <ultra-color-picker
            .hass=${i}
            .value=${e.icon_color||"var(--secondary-text-color)"}
            @value-changed=${e=>{this._updateDataItem(n,t,{icon_color:e.detail.value},r)}}
          ></ultra-color-picker>
        </div>

        <!-- Value Color -->
        <div class="color-row">
          <span class="color-label">Value Color</span>
          <ultra-color-picker
            .hass=${i}
            .value=${e.value_color||"var(--primary-text-color)"}
            @value-changed=${e=>{this._updateDataItem(n,t,{value_color:e.detail.value},r)}}
          ></ultra-color-picker>
        </div>

        <!-- Label Color -->
        <div class="color-row">
          <span class="color-label">Label Color</span>
          <ultra-color-picker
            .hass=${i}
            .value=${e.label_color||"var(--secondary-text-color)"}
            @value-changed=${e=>{this._updateDataItem(n,t,{label_color:e.detail.value},r)}}
          ></ultra-color-picker>
        </div>

        <!-- Icon Size -->
        <div class="slider-row">
          <span class="slider-label">Icon Size</span>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="12"
              max="48"
              step="1"
              value="${e.icon_size||18}"
              @input=${e=>{const a=parseInt(e.target.value,10);this._updateDataItem(n,t,{icon_size:a},r)}}
            />
            <input
              type="number"
              class="range-input"
              min="12"
              max="48"
              step="1"
              value="${e.icon_size||18}"
              @input=${e=>{const a=parseInt(e.target.value,10);isNaN(a)||this._updateDataItem(n,t,{icon_size:a},r)}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{this._updateDataItem(n,t,{icon_size:18},r)}}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Font Size -->
        <div class="slider-row">
          <span class="slider-label">Font Size</span>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="10"
              max="32"
              step="1"
              value="${e.font_size||14}"
              @input=${e=>{const a=parseInt(e.target.value,10);this._updateDataItem(n,t,{font_size:a},r)}}
            />
            <input
              type="number"
              class="range-input"
              min="10"
              max="32"
              step="1"
              value="${e.font_size||14}"
              @input=${e=>{const a=parseInt(e.target.value,10);isNaN(a)||this._updateDataItem(n,t,{font_size:a},r)}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{this._updateDataItem(n,t,{font_size:14},r)}}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `}_renderTypeSpecificConfig(e,t,n,i,r,o){switch(e.type){case"sensor":case"device_state":case"toggle":return a.qy`
          <div class="config-row">
            <ha-form
              .hass=${i}
              .data=${{entity:e.entity||""}}
              .schema=${[{name:"entity",label:"Entity",selector:{entity:{}}}]}
              .computeLabel=${e=>e.label}
              @value-changed=${e=>{this._updateDataItem(n,t,{entity:e.detail.value.entity},r)}}
            ></ha-form>
          </div>
        `;case"attribute":return a.qy`
          <div class="config-row">
            <ha-form
              .hass=${i}
              .data=${{entity:e.entity||"",attribute:e.attribute||""}}
              .schema=${[{name:"entity",label:"Entity",selector:{entity:{}}},{name:"attribute",label:"Attribute Name",selector:{text:{}}}]}
              .computeLabel=${e=>e.label}
              @value-changed=${e=>{this._updateDataItem(n,t,e.detail.value,r)}}
            ></ha-form>
          </div>
        `;case"time_info":return a.qy`
          <div class="config-row">
            <ha-form
              .hass=${i}
              .data=${{time_format:e.time_format||"relative"}}
              .schema=${[{name:"time_format",label:"Time Format",selector:{select:{options:[{value:"relative",label:"Relative (e.g., 2 hours ago)"},{value:"absolute",label:"Absolute (e.g., 2:30 PM)"},{value:"duration",label:"Duration (e.g., 2h 30m)"}]}}}]}
              .computeLabel=${e=>e.label}
              @value-changed=${e=>{this._updateDataItem(n,t,e.detail.value,r)}}
            ></ha-form>
          </div>
        `;default:return a.qy``}}_onDataItemDragStart(e,t){this._draggedItemIndex=t,e.dataTransfer&&(e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",String(t)))}_onDataItemDragOver(e,t){e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move"),this._dragOverIndex=t}_onDataItemDragEnd(){this._draggedItemIndex=null,this._dragOverIndex=null}_onDataItemDrop(e,t,n,a){e.preventDefault();const i=this._draggedItemIndex;if(null===i||i===t)return void this._onDataItemDragEnd();const r=[...this._getDataItemsForLayout(n)],[o]=r.splice(i,1);r.splice(t,0,o),this._setDataItemsForLayout(n,r,a),this.triggerPreviewUpdate(),this._onDataItemDragEnd()}_addDataItem(e,t,n){const a={id:this.generateId("item"),type:t,show_icon:!0,show_label:!0,show_value:!0,icon:{location:"mdi:map-marker",battery:"mdi:battery",time_info:"mdi:clock-outline",media:"mdi:music",sensor:"mdi:gauge",device_state:"mdi:wifi",attribute:"mdi:code-tags",toggle:"mdi:toggle-switch"}[t]},i=[...this._getDataItemsForLayout(e),a];this._setDataItemsForLayout(e,i,n),this.triggerPreviewUpdate()}_removeDataItem(e,t,n){const a=[...this._getDataItemsForLayout(e)];a.splice(t,1),this._setDataItemsForLayout(e,a,n),this.triggerPreviewUpdate()}_updateDataItem(e,t,n,a){const i=[...this._getDataItemsForLayout(e)];i[t]=Object.assign(Object.assign({},i[t]),n),this._setDataItemsForLayout(e,i,a),this.triggerPreviewUpdate()}_getDefaultItemLabel(e,t){var n;if(e.entity){const a=t.states[e.entity];return(null===(n=null==a?void 0:a.attributes)||void 0===n?void 0:n.friendly_name)||e.entity}return{location:"Location",battery:"Battery",time_info:"At location",media:"Now playing",sensor:"Sensor",device_state:"Device",attribute:"Attribute",toggle:"Toggle"}[e.type]}_renderAssociatedEntitiesSection(e,t,n,i){return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.associated_entities",i,"Associated Entities")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.modules.people.associated_entities_desc",i,"Link additional entities for battery and media display")}
        </div>

        <div class="field-container">
          <ha-form
            .hass=${t}
            .data=${{battery_entity:e.battery_entity||"",media_player_entity:e.media_player_entity||""}}
            .schema=${[{name:"battery_entity",label:(0,o.kg)("editor.modules.people.battery_entity",i,"Battery Entity"),description:"Sensor or device tracker with battery attribute",selector:{entity:{domain:["sensor","device_tracker"]}}},{name:"media_player_entity",label:(0,o.kg)("editor.modules.people.media_player",i,"Media Player"),description:"Media player for music display",selector:{entity:{domain:"media_player"}}}]}
            .computeLabel=${e=>e.label}
            .computeDescription=${e=>e.description}
            @value-changed=${e=>{n(e.detail.value),this.triggerPreviewUpdate()}}
          ></ha-form>
        </div>
      </div>
    `}_renderLayoutSpacingSection(e,t,n,i){return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.modules.people.layout_spacing",i,"Layout & Spacing")}
        </div>

        <!-- Gap -->
        <div class="field-container">
          <div class="field-title">${(0,o.kg)("editor.modules.people.gap",i,"Gap")}</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="48"
              step="2"
              .value="${e.gap||12}"
              @input=${e=>{n({gap:Number(e.target.value)}),this.triggerPreviewUpdate()}}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="48"
              step="2"
              .value="${e.gap||12}"
              @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({gap:t}),this.triggerPreviewUpdate())}}
              @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const a=e.gap||12,i="ArrowUp"===t.key?2:-2,r=Math.max(0,Math.min(48,a+i));n({gap:r}),this.triggerPreviewUpdate()}}}
            />
            <button
              class="range-reset-btn"
              @click=${()=>{n({gap:12}),this.triggerPreviewUpdate()}}
              title="Reset to default (12px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        ${"horizontal_detailed"!==e.layout_style&&"music_overlay"!==e.layout_style?a.qy`
              <!-- Data Items Gap -->
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.data_items_gap",i,"Data Items Gap")}
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="0"
                    max="32"
                    step="2"
                    .value="${e.data_items_gap||8}"
                    @input=${e=>{n({data_items_gap:Number(e.target.value)}),this.triggerPreviewUpdate()}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="0"
                    max="32"
                    step="2"
                    .value="${e.data_items_gap||8}"
                    @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({data_items_gap:t}),this.triggerPreviewUpdate())}}
                    @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const a=e.data_items_gap||8,i="ArrowUp"===t.key?2:-2,r=Math.max(0,Math.min(32,a+i));n({data_items_gap:r}),this.triggerPreviewUpdate()}}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>{n({data_items_gap:8}),this.triggerPreviewUpdate()}}
                    title="Reset to default (8px)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Data Area Height -->
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.data_area_height",i,"Data Area Height")}
                </div>
                <div class="field-description">Set to 0 for auto height</div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="0"
                    max="200"
                    step="4"
                    .value="${e.data_area_height||0}"
                    @input=${e=>{n({data_area_height:Number(e.target.value)}),this.triggerPreviewUpdate()}}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="0"
                    max="300"
                    step="4"
                    .value="${e.data_area_height||0}"
                    @input=${e=>{const t=Number(e.target.value);isNaN(t)||(n({data_area_height:t}),this.triggerPreviewUpdate())}}
                    @keydown=${t=>{if("ArrowUp"===t.key||"ArrowDown"===t.key){t.preventDefault();const a=e.data_area_height||0,i="ArrowUp"===t.key?4:-4,r=Math.max(0,Math.min(300,a+i));n({data_area_height:r}),this.triggerPreviewUpdate()}}}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${()=>{n({data_area_height:0}),this.triggerPreviewUpdate()}}
                    title="Reset to auto (0px)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Data Items Direction -->
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.data_items_direction",i,"Data Items Direction")}
                </div>
                <div class="button-group">
                  <button
                    class="option-btn ${"row"===e.data_items_direction?"active":""}"
                    @click=${()=>{n({data_items_direction:"row"}),this.triggerPreviewUpdate()}}
                  >
                    <ha-icon icon="mdi:arrow-right"></ha-icon>
                    Row
                  </button>
                  <button
                    class="option-btn ${"column"===e.data_items_direction?"active":""}"
                    @click=${()=>{n({data_items_direction:"column"}),this.triggerPreviewUpdate()}}
                  >
                    <ha-icon icon="mdi:arrow-down"></ha-icon>
                    Column
                  </button>
                </div>
              </div>
            `:""}

        <!-- Alignment - only for compact and banner layouts -->
        ${"compact"===e.layout_style||"banner"===e.layout_style?a.qy`
              <div class="field-container">
                <div class="field-title">
                  ${(0,o.kg)("editor.modules.people.alignment",i,"Alignment")}
                </div>
                <div class="button-group">
                  ${["left","center","right"].map((t=>a.qy`
                      <button
                        class="option-btn ${e.alignment===t?"active":""}"
                        @click=${()=>{n({alignment:t}),this.triggerPreviewUpdate()}}
                      >
                        <ha-icon
                          icon="mdi:format-align-${"center"===t?"center":t}"
                        ></ha-icon>
                      </button>
                    `))}
                </div>
              </div>
            `:""}
      </div>
    `}renderPreview(e,t,n,a){const i=e;if(!i.person_entity)return this.renderGradientErrorState("Select Person Entity","Choose a person entity in the General tab");const r=t.states[i.person_entity];if(!r)return this.renderGradientErrorState("Entity Not Found",i.person_entity);const o=this.createGestureHandlers(i.id,{tap_action:i.tap_action,hold_action:i.hold_action,double_tap_action:i.double_tap_action,entity:i.person_entity,module:i},t,n);let s;switch(i.layout_style){case"banner":s=this._renderBannerLayout(i,t,r,o,n);break;case"horizontal_compact":s=this._renderHorizontalCompactLayout(i,t,r,o,n);break;case"horizontal_detailed":s=this._renderHorizontalDetailedLayout(i,t,r,o,n);break;case"header":s=this._renderHeaderLayout(i,t,r,o,n);break;case"music_overlay":s=this._renderMusicOverlayLayout(i,t,r,o,n);break;default:s=this._renderCompactLayout(i,t,r,o,n)}return this.wrapWithAnimation(s,i,t)}_renderCompactLayout(e,t,n,i,r){const o=e.name_settings,s="home"===n.state,l=this.buildDesignStyles(e,t),d=this.getHoverEffectClass(e);return a.qy`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--compact ${d}"
        style="gap: ${e.gap}px; align-items: ${e.alignment}; ${this.buildStyleString(l)}"
        @pointerdown=${i.onPointerDown}
        @pointerup=${i.onPointerUp}
        @pointerleave=${i.onPointerLeave}
        @pointercancel=${i.onPointerCancel}
      >
        ${!1!==e.show_avatar?this._renderAvatar(e,t,n,s):""}
        ${o.show?this._renderName(e,t,n):""}
        ${this._renderDataItems(e,t,n,r)}
      </div>
    `}_renderBannerLayout(e,t,n,i,r){var o,s,l,d;const c=e.banner_settings||this.createDefault().banner_settings,p="home"===n.state,u=this._getBannerBackground(c,t),g=c.border_radius||0,m=null!==(o=c.border_radius_top_left)&&void 0!==o?o:g,v=null!==(s=c.border_radius_top_right)&&void 0!==s?s:g,b=null!==(l=c.border_radius_bottom_left)&&void 0!==l?l:0,_=`${m}px ${v}px ${null!==(d=c.border_radius_bottom_right)&&void 0!==d?d:0}px ${b}px`,h=this.buildDesignStyles(e,t),y=this.getHoverEffectClass(e);return a.qy`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--banner ${y}"
        style="border-radius: ${_}; ${this.buildStyleString(h)}"
        @pointerdown=${i.onPointerDown}
        @pointerup=${i.onPointerUp}
        @pointerleave=${i.onPointerLeave}
        @pointercancel=${i.onPointerCancel}
      >
        <div
          class="people-banner"
          style="
            ${u}
            height: ${c.banner_height||120}px;
            filter: blur(${c.background_blur||0}px);
          "
        ></div>
        ${c.overlay_color?a.qy`<div
              class="people-banner-overlay"
              style="background: ${c.overlay_color}; opacity: ${(c.overlay_opacity||30)/100};"
            ></div>`:""}
        <div class="people-banner-content" style="gap: ${e.gap}px;">
          <div class="people-banner-side">
            ${!1!==e.show_location_badge?this._renderLocationBadge(e,t,n):""}
          </div>
          ${!1!==e.show_avatar?this._renderAvatar(e,t,n,p):""}
          <div class="people-banner-side">
            ${!1!==e.show_battery_badge?this._renderBatteryBadge(e,t):""}
          </div>
        </div>
        <div class="people-banner-info" style="text-align: ${e.alignment};">
          ${e.name_settings.show?this._renderName(e,t,n):""}
          ${this._renderDataItems(e,t,n,r)}
        </div>
      </div>
    `}_renderHorizontalCompactLayout(e,t,n,i,r){const o="home"===n.state,s=this.buildDesignStyles(e,t),l=this.getHoverEffectClass(e);return a.qy`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--horizontal-compact ${l}"
        style="gap: ${e.gap}px; ${this.buildStyleString(s)}"
        @pointerdown=${i.onPointerDown}
        @pointerup=${i.onPointerUp}
        @pointerleave=${i.onPointerLeave}
        @pointercancel=${i.onPointerCancel}
      >
        ${!1!==e.show_avatar?this._renderAvatar(e,t,n,o):""}
        <div class="people-info-column">
          <div class="people-info-header">
            ${e.name_settings.show?this._renderName(e,t,n):""}
          </div>
          ${this._renderDataItems(e,t,n,r)}
        </div>
      </div>
    `}_renderHorizontalDetailedLayout(e,t,n,i,r){const o="home"===n.state,s=this.buildDesignStyles(e,t),l=this.getHoverEffectClass(e);return a.qy`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--horizontal-detailed ${l}"
        style="gap: ${e.gap}px; ${this.buildStyleString(s)}"
        @pointerdown=${i.onPointerDown}
        @pointerup=${i.onPointerUp}
        @pointerleave=${i.onPointerLeave}
        @pointercancel=${i.onPointerCancel}
      >
        ${!1!==e.show_avatar?this._renderAvatar(e,t,n,o):""}
        <div class="people-detailed-info">
          ${e.name_settings.show||!1!==e.show_location_badge?a.qy`
                <div class="people-detailed-header">
                  ${e.name_settings.show?this._renderName(e,t,n):""}
                  ${!1!==e.show_location_badge?this._renderLocationBadge(e,t,n):""}
                </div>
              `:""}
          <div class="people-detailed-items">
            ${this._renderDataItemsList(e,t,n,r)}
          </div>
        </div>
      </div>
    `}_renderHeaderLayout(e,t,n,i,r){const o="home"===n.state,s=this.buildDesignStyles(e,t),l=this.getHoverEffectClass(e);return a.qy`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--header ${l}"
        style="${this.buildStyleString(s)}"
        @pointerdown=${i.onPointerDown}
        @pointerup=${i.onPointerUp}
        @pointerleave=${i.onPointerLeave}
        @pointercancel=${i.onPointerCancel}
      >
        ${e.header_show_badges&&"top"===e.header_badges_position?a.qy`<div class="people-header-badges">
              ${this._renderHeaderBadges(e,t,n)}
            </div>`:""}
        <div class="people-header-main" style="gap: ${e.gap}px;">
          ${!1!==e.show_avatar?this._renderAvatar(e,t,n,o):""}
          <div class="people-header-info">
            ${e.name_settings.show?this._renderName(e,t,n):""}
            ${!1===e.show_location_badge||e.header_show_badges?"":this._renderLocationText(e,t,n)}
          </div>
        </div>
        ${e.header_show_badges&&"bottom"===e.header_badges_position?a.qy`<div class="people-header-badges">
              ${this._renderHeaderBadges(e,t,n)}
            </div>`:""}
        <div class="people-header-items" style="gap: ${e.data_items_gap}px;">
          ${this._renderDataItems(e,t,n,r)}
        </div>
      </div>
    `}_renderMusicOverlayLayout(e,t,n,i,r){var o,s,l;const d="home"===n.state,c=e.media_player_entity?t.states[e.media_player_entity]:null,p="playing"===(null==c?void 0:c.state),u=null===(o=null==c?void 0:c.attributes)||void 0===o?void 0:o.entity_picture,g=this.buildDesignStyles(e,t),m=this.getHoverEffectClass(e);return a.qy`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--music-overlay ${p?"playing":""} ${m}"
        style="${this.buildStyleString(g)}"
        @pointerdown=${i.onPointerDown}
        @pointerup=${i.onPointerUp}
        @pointerleave=${i.onPointerLeave}
        @pointercancel=${i.onPointerCancel}
      >
        ${!1!==e.music_blur_background&&u?a.qy`<div
              class="people-music-blur-bg"
              style="background-image: url(${this._resolveEntityPicture(u,t)}); filter: blur(${null!==(s=e.music_album_blur)&&void 0!==s?s:8}px); opacity: ${(null!==(l=e.music_album_opacity)&&void 0!==l?l:75)/100};"
            ></div>`:""}
        <div class="people-music-header">
          ${this._renderHeaderBadges(e,t,n)}
        </div>
        <div class="people-music-content" style="gap: ${e.gap}px;">
          ${!1!==e.show_avatar?this._renderAvatar(e,t,n,d):""}
          ${p&&c?this._renderMusicInfo(e,c,t):e.name_settings.show?this._renderName(e,t,n):""}
        </div>
        ${p&&e.music_show_progress&&c?this._renderMusicProgress(c):""}
      </div>
    `}_renderAvatar(e,t,n,i){var r;const o=e.avatar_settings,s=null===(r=n.attributes)||void 0===r?void 0:r.entity_picture,l=o.use_state_color?i?o.state_home_color:o.state_away_color:o.border_color,d=o.custom_image||(o.show_entity_picture&&s?this._resolveEntityPicture(s,t):null);return a.qy`
      <div
        class="people-avatar"
        style="
          width: ${o.size}px;
          height: ${o.size}px;
          border: ${o.border_width}px solid ${l};
        "
      >
        ${d?a.qy`<img
              src="${d}"
              alt="Avatar"
              style="object-fit: ${o.image_fit||"cover"}"
            />`:a.qy`<ha-icon
              icon="${o.fallback_icon||"mdi:account"}"
              style="--mdc-icon-size: ${.6*o.size}px;"
            ></ha-icon>`}
        ${o.show_status_badge?a.qy`
              <div
                class="people-avatar-badge people-avatar-badge--${o.status_badge_position}"
                style="background: ${i?o.status_badge_home_color:o.status_badge_away_color};"
              >
                <ha-icon icon="${i?"mdi:home":"mdi:walk"}"></ha-icon>
              </div>
            `:""}
      </div>
    `}_renderName(e,t,n){var i;const r=e.name_settings,o=r.custom_name||(r.use_friendly_name?null===(i=n.attributes)||void 0===i?void 0:i.friendly_name:n.entity_id.split(".")[1]);return a.qy`
      <div
        class="people-name"
        style="
          font-size: ${r.font_size}px;
          font-weight: ${r.font_weight};
          color: ${r.color||"var(--primary-text-color)"};
          text-align: ${r.alignment||"center"};
        "
      >
        ${o}
      </div>
    `}_renderDataItems(e,t,n,i){const r=this._getDataItemsForLayout(e);if(!r||0===r.length)return a.qy``;const o=e.data_area_height?`height: ${e.data_area_height}px; overflow-y: auto;`:"";return a.qy`
      <div
        class="people-data-items people-data-items--${e.data_items_direction}"
        style="gap: ${e.data_items_gap}px; ${o}"
      >
        ${r.map((a=>this._renderDataItem(a,e,t,n,i)))}
      </div>
    `}_renderDataItemsList(e,t,n,i){const r=this._getDataItemsForLayout(e);return r&&0!==r.length?a.qy`
      <div class="people-data-list">
        ${r.map((a=>this._renderDataItemRow_Preview(a,e,t,n,i)))}
      </div>
    `:a.qy``}_renderDataItem(e,t,n,i,r){const o=this._getDataItemValue(e,t,n,i),s=e.icon||this._getDefaultItemIcon(e.type),l=this._getDefaultItemLabel(e,n),d=e.label||l,c=!1!==e.show_icon,p=!0===e.show_label,u=!1!==e.show_value;return a.qy`
      <div class="people-data-item" style="font-size: ${e.font_size||14}px;">
        ${c?a.qy`<ha-icon
              icon="${s}"
              style="color: ${e.icon_color||"var(--secondary-text-color)"}; --mdc-icon-size: ${e.icon_size||18}px;"
            ></ha-icon>`:""}
        ${p?a.qy`<span
              class="people-data-item-label"
              style="color: ${e.label_color||"var(--secondary-text-color)"}"
              >${d}:</span
            >`:""}
        ${u?a.qy`<span
              class="people-data-item-value"
              style="color: ${e.value_color||"var(--primary-text-color)"}"
              >${o||"N/A"}</span
            >`:""}
      </div>
    `}_renderDataItemRow_Preview(e,t,n,i,r){var o;const s=this._getDataItemValue(e,t,n,i),l=e.icon||this._getDefaultItemIcon(e.type);if("toggle"===e.type&&e.entity){const t=n.states[e.entity],i="on"===(null==t?void 0:t.state);return a.qy`
        <div class="people-data-row">
          <div class="people-data-row-left">
            ${!1!==e.show_icon?a.qy`<ha-icon
                  icon="${l}"
                  style="color: ${e.icon_color||"var(--secondary-text-color)"};"
                ></ha-icon>`:""}
            <span>${e.label||(null===(o=null==t?void 0:t.attributes)||void 0===o?void 0:o.friendly_name)||"Toggle"}</span>
          </div>
          <ha-switch
            .checked=${i}
            @change=${t=>{t.stopPropagation();const a=i?"turn_off":"turn_on";n.callService("homeassistant",a,{entity_id:e.entity})}}
          ></ha-switch>
        </div>
      `}return a.qy`
      <div class="people-data-row">
        <div class="people-data-row-left">
          ${!1!==e.show_icon?a.qy`<ha-icon
                icon="${l}"
                style="color: ${e.icon_color||"var(--secondary-text-color)"};"
              ></ha-icon>`:""}
          ${!1!==e.show_label?a.qy`<span>${e.label||this._getDefaultItemLabel(e,n)}</span>`:""}
        </div>
        ${!1!==e.show_value?a.qy`<span class="people-data-row-value">${s||"N/A"}</span>`:""}
      </div>
    `}_renderLocationBadge(e,t,n){const i=this._formatLocation(n.state),r=e.location_settings;return a.qy`
      <div class="people-location-badge">
        ${r.show_icon?a.qy`<ha-icon
              icon="${r.icon||"mdi:map-marker"}"
              style="color: ${r.icon_color||"var(--secondary-text-color)"};"
            ></ha-icon>`:""}
        <span style="color: ${r.color||"var(--secondary-text-color)"};"
          >${i}</span
        >
      </div>
    `}_renderLocationText(e,t,n){const i=this._formatLocation(n.state),r=e.location_settings;return r.show?a.qy`
      <div
        class="people-location-text"
        style="font-size: ${r.font_size}px; color: ${r.color||"var(--secondary-text-color)"};"
      >
        ${i} ${r.show_duration?this._renderDurationText(n):""}
      </div>
    `:a.qy``}_renderDurationText(e){const t=new Date(e.last_changed),n=(new Date).getTime()-t.getTime(),i=Math.floor(n/6e4),r=Math.floor(i/60);let o="";return o=r>0?`for ${r}h ${i%60}m`:i>0?`for ${i}m`:"just arrived",a.qy`<span class="people-duration">${o}</span>`}_renderBatteryBadge(e,t){var n,i,r,o;if(!e.battery_entity)return a.qy``;const s=t.states[e.battery_entity];if(!s)return a.qy``;const l=null!==(o=null!==(i=null===(n=s.attributes)||void 0===n?void 0:n.battery_level)&&void 0!==i?i:null===(r=s.attributes)||void 0===r?void 0:r.battery)&&void 0!==o?o:parseFloat(s.state);if(isNaN(l))return a.qy``;const d=this._getBatteryIcon(l),c=this._getBatteryColor(l);return a.qy`
      <div class="people-battery-badge" style="color: ${c};">
        <ha-icon icon="${d}"></ha-icon>
        <span>${Math.round(l)}%</span>
      </div>
    `}_renderHeaderBadges(e,t,n){const i="home"===n.state,r=!1!==e.show_location_badge,o=!1!==e.show_battery_badge&&e.battery_entity;return r||o?a.qy`
      <div class="people-header-badges-row">
        ${r?a.qy`<div class="people-badge ${i?"home":"away"}">
              <ha-icon icon="${i?"mdi:home":"mdi:walk"}"></ha-icon>
            </div>`:""}
        ${o?this._renderBatteryBadge(e,t):""}
      </div>
    `:a.qy``}_renderMusicInfo(e,t,n){var i,r;const o=(null===(i=t.attributes)||void 0===i?void 0:i.media_title)||"Unknown",s=(null===(r=t.attributes)||void 0===r?void 0:r.media_artist)||"";return a.qy`
      <div class="people-music-info">
        <ha-icon icon="mdi:music-note"></ha-icon>
        <div class="people-music-text">
          <span class="people-music-title">${o}</span>
          ${s?a.qy`<span class="people-music-artist">${s}</span>`:""}
        </div>
      </div>
    `}_renderMusicProgress(e){var t,n;const i=((null===(t=e.attributes)||void 0===t?void 0:t.media_position)||0)/((null===(n=e.attributes)||void 0===n?void 0:n.media_duration)||100)*100;return a.qy`
      <div class="people-music-progress">
        <div class="people-music-progress-bar" style="width: ${i}%;"></div>
      </div>
    `}_getDataItemValue(e,t,n,a){var i,o,s,l,d,c,p;switch(e.type){case"location":return this._formatLocation(a.state);case"battery":if(!t.battery_entity)return"N/A";const u=n.states[t.battery_entity];if(!u)return"N/A";const g=null!==(l=null!==(o=null===(i=u.attributes)||void 0===i?void 0:i.battery_level)&&void 0!==o?o:null===(s=u.attributes)||void 0===s?void 0:s.battery)&&void 0!==l?l:u.state;return`${Math.round(parseFloat(g))}%`;case"time_info":return this._formatTimeInfo(a,e.time_format||"relative");case"media":if(!t.media_player_entity)return"N/A";const m=n.states[t.media_player_entity];if(!m||"playing"!==m.state)return"Not playing";const v=(null===(d=m.attributes)||void 0===d?void 0:d.media_title)||"Unknown",b=null===(c=m.attributes)||void 0===c?void 0:c.media_artist;return b?`${v} - ${b}`:v;case"sensor":case"device_state":return e.entity&&n.states[e.entity]?(0,r.formatEntityState)(n,e.entity):"N/A";case"attribute":if(!e.entity||!e.attribute)return"N/A";const _=n.states[e.entity];if(!_)return"N/A";const h=null===(p=_.attributes)||void 0===p?void 0:p[e.attribute];return void 0!==h?String(h):"N/A";case"toggle":if(!e.entity)return"N/A";const y=n.states[e.entity];return y?y.state:"N/A";default:return"N/A"}}_getDefaultItemIcon(e){return{location:"mdi:map-marker",battery:"mdi:battery",time_info:"mdi:clock-outline",media:"mdi:music",sensor:"mdi:gauge",device_state:"mdi:wifi",attribute:"mdi:code-tags",toggle:"mdi:toggle-switch"}[e]}_formatLocation(e){return"home"===e?"Home":"not_home"===e?"Away":e.charAt(0).toUpperCase()+e.slice(1).replace(/_/g," ")}_formatTimeInfo(e,t){const n=new Date(e.last_changed),a=new Date;switch(t){case"absolute":return n.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});case"duration":{const e=a.getTime()-n.getTime(),t=Math.floor(e/6e4),i=Math.floor(t/60);return i>0?`${i}h ${t%60}m`:`${t}m`}default:{const e=a.getTime()-n.getTime(),t=Math.floor(e/6e4),i=Math.floor(t/60);if(i>24){const e=Math.floor(i/24);return`${e} day${e>1?"s":""} ago`}return i>0?`${i} hour${i>1?"s":""} ago`:t>0?`${t} minute${t>1?"s":""} ago`:"Just now"}}}_getBatteryIcon(e){return e>=90?"mdi:battery":e>=80?"mdi:battery-90":e>=70?"mdi:battery-80":e>=60?"mdi:battery-70":e>=50?"mdi:battery-60":e>=40?"mdi:battery-50":e>=30?"mdi:battery-40":e>=20?"mdi:battery-30":e>=10?"mdi:battery-20":"mdi:battery-10"}_getBatteryColor(e){return e>=50?"#4CAF50":e>=20?"#FF9800":"#F44336"}_getBannerBackground(e,t){var n;switch(e.background_type){case"image":return`background-image: url(${e.background_image}); background-size: cover; background-position: center;`;case"gradient":return`background: linear-gradient(${(e.gradient_direction||"to-bottom-right").replace("to-","to ").replace("-"," ")}, ${e.gradient_start}, ${e.gradient_end});`;case"color":return`background: ${e.background_color};`;case"entity":if(e.background_entity){const a=t.states[e.background_entity],i=null===(n=null==a?void 0:a.attributes)||void 0===n?void 0:n.entity_picture;if(i)return`background-image: url(${this._resolveEntityPicture(i,t)}); background-size: cover; background-position: center;`}return"background: var(--primary-color);";default:return""}}_resolveEntityPicture(e,t){return e?e.startsWith("http")||e.startsWith("data:")?e:e.startsWith("/")?`${(t.hassUrl?t.hassUrl():"").replace(/\/$/,"")}${e}`:e:""}validate(e){const t=[],n=e;return n.person_entity||t.push("Person entity is required"),["compact","banner","horizontal_compact","horizontal_detailed","header","music_overlay"].includes(n.layout_style)||t.push("Invalid layout style"),{valid:0===t.length,errors:t}}getStyles(){return this._getPreviewStyles()}_getEditorStyles(){return"\n      .module-general-settings {\n        padding: 0;\n      }\n\n      .settings-section {\n        background: var(--card-background-color, var(--ha-card-background));\n        border-radius: 12px;\n        padding: 16px;\n        margin-bottom: 16px;\n        border: 1px solid var(--divider-color);\n      }\n\n      .section-title {\n        font-size: 14px;\n        font-weight: 600;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 8px;\n        letter-spacing: 0.5px;\n      }\n\n      .section-description {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-bottom: 16px;\n      }\n\n      .field-container {\n        margin-bottom: 16px;\n      }\n\n      .field-title {\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n      }\n\n      /* Number Range Control - Standard slider pattern */\n      .number-range-control {\n        display: flex;\n        gap: 8px;\n        align-items: center;\n      }\n\n      .range-slider {\n        flex: 1;\n        -webkit-appearance: none;\n        -moz-appearance: none;\n        appearance: none;\n        height: 6px;\n        border-radius: 3px;\n        background: var(--divider-color, #424242);\n        outline: none;\n        cursor: pointer;\n      }\n\n      .range-slider::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        appearance: none;\n        width: 18px;\n        height: 18px;\n        border-radius: 50%;\n        background: var(--primary-color, #03a9f4);\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .range-slider::-moz-range-thumb {\n        width: 18px;\n        height: 18px;\n        border-radius: 50%;\n        background: var(--primary-color, #03a9f4);\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .range-slider::-moz-range-track {\n        height: 6px;\n        border-radius: 3px;\n        background: var(--divider-color, #424242);\n        cursor: pointer;\n      }\n\n      .range-input {\n        width: 72px !important;\n        max-width: 72px !important;\n        min-width: 72px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n        -moz-appearance: textfield;\n      }\n\n      .range-input::-webkit-outer-spin-button,\n      .range-input::-webkit-inner-spin-button {\n        -webkit-appearance: none;\n        margin: 0;\n      }\n\n      .range-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .range-reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .range-reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color, white);\n        border-color: var(--primary-color);\n      }\n\n      .range-reset-btn ha-icon {\n        --mdc-icon-size: 18px;\n      }\n\n      .color-row {\n        display: flex;\n        gap: 16px;\n      }\n\n      .color-field {\n        flex: 1;\n      }\n\n      .position-grid {\n        display: grid;\n        grid-template-columns: repeat(2, 1fr);\n        gap: 8px;\n      }\n\n      .position-option {\n        padding: 8px;\n        text-align: center;\n        border: 1px solid var(--divider-color);\n        border-radius: 6px;\n        cursor: pointer;\n        font-size: 12px;\n        text-transform: capitalize;\n        transition: all 0.2s ease;\n      }\n\n      .position-option:hover {\n        border-color: var(--primary-color);\n      }\n\n      .position-option.selected {\n        background: var(--primary-color);\n        color: white;\n        border-color: var(--primary-color);\n      }\n\n      .layout-style-grid {\n        display: grid;\n        grid-template-columns: repeat(3, 1fr);\n        gap: 8px;\n      }\n\n      .layout-style-option {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 4px;\n        padding: 12px 8px;\n        border: 2px solid var(--divider-color);\n        border-radius: 8px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .layout-style-option:hover {\n        border-color: var(--primary-color);\n      }\n\n      .layout-style-option.selected {\n        background: rgba(var(--rgb-primary-color), 0.1);\n        border-color: var(--primary-color);\n      }\n\n      .layout-style-option ha-icon {\n        --mdc-icon-size: 24px;\n        color: var(--primary-text-color);\n      }\n\n      .layout-style-option span {\n        font-size: 11px;\n        text-align: center;\n      }\n\n      .button-group {\n        display: flex;\n        gap: 4px;\n        flex-wrap: wrap;\n      }\n\n      .option-btn {\n        padding: 8px 12px;\n        border: 1px solid var(--divider-color);\n        border-radius: 6px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        font-size: 12px;\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        transition: all 0.2s ease;\n      }\n\n      .option-btn:hover {\n        border-color: var(--primary-color);\n      }\n\n      .option-btn.active {\n        background: var(--primary-color);\n        color: white;\n        border-color: var(--primary-color);\n      }\n\n      .option-btn ha-icon {\n        --mdc-icon-size: 16px;\n      }\n\n      /* Data Items Builder Styles */\n      .data-items-section {\n        background: var(--secondary-background-color);\n      }\n\n      .data-items-list {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        margin-bottom: 12px;\n      }\n\n      /* Data item expansion panels */\n      ha-expansion-panel.data-item-panel {\n        --ha-card-border-radius: 8px;\n        --expansion-panel-summary-padding: 0;\n        --expansion-panel-content-padding: 12px;\n        margin-bottom: 8px;\n      }\n\n      ha-expansion-panel.data-item-panel::part(summary) {\n        padding: 0;\n        min-height: unset;\n      }\n\n      ha-expansion-panel.data-item-panel::part(content) {\n        padding: 12px;\n      }\n\n      ha-expansion-panel.data-item-panel.dragging {\n        opacity: 0.5;\n      }\n\n      ha-expansion-panel.data-item-panel.drag-over {\n        outline: 2px dashed var(--primary-color);\n        outline-offset: -2px;\n      }\n\n      .data-item-header {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 10px 12px;\n        width: 100%;\n        box-sizing: border-box;\n      }\n\n      .drag-handle {\n        cursor: grab;\n        color: var(--secondary-text-color);\n        padding: 4px;\n        flex-shrink: 0;\n      }\n\n      .drag-handle:active {\n        cursor: grabbing;\n      }\n\n      .item-icon {\n        width: 32px;\n        height: 32px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: rgba(var(--rgb-primary-color), 0.1);\n        border-radius: 6px;\n        color: var(--primary-color);\n        flex-shrink: 0;\n      }\n\n      .item-icon ha-icon {\n        --mdc-icon-size: 18px;\n      }\n\n      .item-info {\n        flex: 1;\n        min-width: 0;\n      }\n\n      .item-type {\n        font-size: 13px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n\n      .item-label {\n        font-size: 11px;\n        color: var(--secondary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      .item-action-btn {\n        width: 28px;\n        height: 28px;\n        padding: 0;\n        border: none;\n        background: transparent;\n        border-radius: 4px;\n        cursor: pointer;\n        color: var(--secondary-text-color);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .item-action-btn:hover {\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n      }\n\n      .item-action-btn.delete:hover {\n        background: rgba(244, 67, 54, 0.1);\n        color: #f44336;\n      }\n\n      .item-action-btn ha-icon {\n        --mdc-icon-size: 18px;\n      }\n\n      .data-item-content {\n        padding-top: 8px;\n      }\n\n      /* Styling section for data items */\n      .styling-section {\n        margin-top: 16px;\n        padding-top: 12px;\n        border-top: 1px solid var(--divider-color);\n      }\n\n      .section-subtitle {\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--primary-color);\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        margin-bottom: 12px;\n      }\n\n      .layout-badge {\n        display: inline-block;\n        padding: 2px 8px;\n        background: rgba(var(--rgb-primary-color), 0.15);\n        color: var(--primary-color);\n        border-radius: 12px;\n        font-size: 10px;\n        font-weight: 600;\n        text-transform: uppercase;\n        margin-left: 8px;\n        vertical-align: middle;\n      }\n\n      .color-row {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        margin-bottom: 12px;\n      }\n\n      .color-label {\n        font-size: 13px;\n        color: var(--primary-text-color);\n      }\n\n      .slider-row {\n        margin-bottom: 12px;\n      }\n\n      .slider-label {\n        display: block;\n        font-size: 13px;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n      }\n\n      /* Corner radius controls */\n      .field-title-row {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        margin-bottom: 8px;\n      }\n\n      .link-corners-btn {\n        width: 32px;\n        height: 32px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        background: transparent;\n        border-radius: 6px;\n        cursor: pointer;\n        color: var(--secondary-text-color);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n      }\n\n      .link-corners-btn:hover {\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n      }\n\n      .link-corners-btn.linked {\n        background: rgba(var(--rgb-primary-color), 0.1);\n        border-color: var(--primary-color);\n        color: var(--primary-color);\n      }\n\n      .link-corners-btn ha-icon {\n        --mdc-icon-size: 18px;\n      }\n\n      .corner-radius-grid {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 8px;\n        padding: 12px;\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n      }\n\n      .corner-control {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .corner-control.top-left {\n        justify-content: flex-start;\n      }\n\n      .corner-control.top-right {\n        justify-content: flex-end;\n      }\n\n      .corner-control.bottom-left {\n        justify-content: flex-start;\n      }\n\n      .corner-control.bottom-right {\n        justify-content: flex-end;\n      }\n\n      .corner-label {\n        font-size: 11px;\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        width: 20px;\n        text-align: center;\n      }\n\n      .corner-input {\n        width: 60px;\n        padding: 6px 8px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--card-background-color, var(--ha-card-background));\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n      }\n\n      .corner-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n      }\n\n      .add-item-container {\n        margin-top: 8px;\n      }\n\n      .add-item-select {\n        width: 100%;\n        padding: 10px 12px;\n        border: 2px dashed var(--divider-color);\n        border-radius: 8px;\n        background: transparent;\n        color: var(--primary-text-color);\n        font-size: 14px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .add-item-select:hover {\n        border-color: var(--primary-color);\n      }\n\n      .add-item-select:focus {\n        outline: none;\n        border-color: var(--primary-color);\n      }\n    "}_getPreviewStyles(){return"\n      /* Base People Module Styles */\n      .people-module {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Background filter support - use pseudo-element to blur background without blurring content */\n      .people-module[style*=\"--bg-filter\"]::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background-color: var(--bg-color, transparent);\n        background-image: var(--bg-image, none);\n        background-size: var(--bg-size, cover);\n        background-position: var(--bg-position, center);\n        background-repeat: var(--bg-repeat, no-repeat);\n        filter: var(--bg-filter);\n        border-radius: inherit;\n        z-index: -1;\n        pointer-events: none;\n      }\n\n      /* Avatar Styles */\n      .people-avatar {\n        position: relative;\n        border-radius: 50%;\n        overflow: visible;\n        flex-shrink: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: var(--card-background-color, var(--ha-card-background));\n      }\n\n      .people-avatar img {\n        width: 100%;\n        height: 100%;\n        border-radius: 50%;\n        object-fit: cover;\n      }\n\n      .people-avatar ha-icon {\n        color: var(--secondary-text-color);\n      }\n\n      .people-avatar-badge {\n        position: absolute;\n        width: 24px;\n        height: 24px;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        border: 2px solid var(--card-background-color, white);\n      }\n\n      .people-avatar-badge ha-icon {\n        --mdc-icon-size: 14px;\n        color: white;\n      }\n\n      .people-avatar-badge--top-left { top: -4px; left: -4px; }\n      .people-avatar-badge--top-right { top: -4px; right: -4px; }\n      .people-avatar-badge--bottom-left { bottom: -4px; left: -4px; }\n      .people-avatar-badge--bottom-right { bottom: -4px; right: -4px; }\n\n      /* Name Styles */\n      .people-name {\n        width: 100%;\n      }\n\n      /* Data Items Styles */\n      .people-data-items {\n        display: flex;\n        flex-wrap: wrap;\n        justify-content: center;\n      }\n\n      .people-data-items--row {\n        flex-direction: row;\n      }\n\n      .people-data-items--column {\n        flex-direction: column;\n        align-items: center;\n      }\n\n      .people-data-item {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n      }\n\n      .people-data-item ha-icon {\n        flex-shrink: 0;\n      }\n\n      .people-data-item-label {\n        font-size: 12px;\n        display: inline-block;\n      }\n\n      .people-data-item-value {\n        font-weight: 500;\n        display: inline-block;\n      }\n\n      /* Data List Styles (for detailed layout) */\n      .people-data-list {\n        width: 100%;\n      }\n\n      .people-data-row {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        padding: 8px 0;\n        border-bottom: 1px solid var(--divider-color);\n      }\n\n      .people-data-row:last-child {\n        border-bottom: none;\n      }\n\n      .people-data-row-left {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .people-data-row-left ha-icon {\n        --mdc-icon-size: 20px;\n      }\n\n      .people-data-row-value {\n        font-weight: 500;\n      }\n\n      /* Location Badge */\n      .people-location-badge,\n      .people-battery-badge {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        font-size: 13px;\n      }\n\n      .people-location-badge ha-icon,\n      .people-battery-badge ha-icon {\n        --mdc-icon-size: 18px;\n      }\n\n      .people-location-text {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .people-duration {\n        opacity: 0.7;\n      }\n\n      /* Compact Layout */\n      .people-module--compact {\n        padding: 16px;\n        text-align: center;\n      }\n\n      /* Banner Layout */\n      .people-module--banner {\n        position: relative;\n        overflow: hidden;\n        padding: 0;\n      }\n\n      .people-banner {\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        z-index: 0;\n      }\n\n      .people-banner-overlay {\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        z-index: 1;\n        height: inherit;\n      }\n\n      .people-banner-content {\n        position: relative;\n        z-index: 2;\n        display: flex;\n        align-items: flex-end;\n        justify-content: center;\n        padding: 16px;\n        padding-top: 60px;\n      }\n\n      .people-banner-side {\n        flex: 1;\n        display: flex;\n        justify-content: center;\n      }\n\n      .people-banner-info {\n        position: relative;\n        z-index: 2;\n        padding: 16px;\n        background: transparent;\n      }\n\n      /* Horizontal Compact Layout */\n      .people-module--horizontal-compact {\n        flex-direction: row;\n        align-items: center;\n        padding: 12px 16px;\n      }\n\n      .people-info-column {\n        flex: 1;\n        min-width: 0;\n      }\n\n      .people-info-header {\n        margin-bottom: 4px;\n      }\n\n      /* Horizontal Detailed Layout */\n      .people-module--horizontal-detailed {\n        flex-direction: row;\n        align-items: flex-start;\n        padding: 16px;\n      }\n\n      .people-detailed-info {\n        flex: 1;\n        min-width: 0;\n      }\n\n      .people-detailed-header {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        margin-bottom: 12px;\n      }\n\n      .people-detailed-items {\n        width: 100%;\n      }\n\n      /* Header Layout */\n      .people-module--header {\n        padding: 12px 16px;\n      }\n\n      .people-header-badges {\n        width: 100%;\n        margin-bottom: 8px;\n      }\n\n      .people-header-badges-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        justify-content: flex-end;\n      }\n\n      .people-badge {\n        width: 24px;\n        height: 24px;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      .people-badge ha-icon {\n        --mdc-icon-size: 14px;\n        color: white;\n      }\n\n      .people-badge.home {\n        background: #4CAF50;\n      }\n\n      .people-badge.away {\n        background: #FF5722;\n      }\n\n      .people-header-main {\n        display: flex;\n        align-items: center;\n        width: 100%;\n      }\n\n      .people-header-info {\n        flex: 1;\n        min-width: 0;\n      }\n\n      .people-header-items {\n        display: flex;\n        flex-wrap: wrap;\n        margin-top: 12px;\n      }\n\n      /* Music Overlay Layout */\n      .people-module--music-overlay {\n        position: relative;\n        overflow: hidden;\n        padding: 16px;\n        background: transparent;\n      }\n\n      .people-music-blur-bg {\n        position: absolute;\n        top: -20px;\n        left: -20px;\n        right: -20px;\n        bottom: -20px;\n        background-size: cover;\n        background-position: center;\n        /* filter and opacity applied via inline style for dynamic control */\n        z-index: 0;\n      }\n\n      .people-music-header {\n        position: relative;\n        z-index: 1;\n        display: flex;\n        justify-content: flex-end;\n        margin-bottom: 8px;\n      }\n\n      .people-music-content {\n        position: relative;\n        z-index: 1;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n      }\n\n      .people-music-info {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px 12px;\n        background: rgba(0, 0, 0, 0.3);\n        border-radius: 20px;\n        margin-top: 8px;\n      }\n\n      .people-music-info ha-icon {\n        --mdc-icon-size: 16px;\n        color: white;\n      }\n\n      .people-music-text {\n        display: flex;\n        flex-direction: column;\n      }\n\n      .people-music-title {\n        font-size: 13px;\n        font-weight: 500;\n        color: white;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        max-width: 150px;\n      }\n\n      .people-music-artist {\n        font-size: 11px;\n        color: rgba(255, 255, 255, 0.8);\n      }\n\n      .people-music-progress {\n        position: absolute;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        height: 3px;\n        background: rgba(255, 255, 255, 0.2);\n      }\n\n      .people-music-progress-bar {\n        height: 100%;\n        background: var(--primary-color);\n        transition: width 1s linear;\n      }\n    "}}},9760:(e,t,n)=>{n.d(t,{formatEntityState:()=>i});var a=n(9811);const i=(e,t,n)=>{var i,r;const o=!1!==(null==n?void 0:n.includeUnit),s=null===(i=null==e?void 0:e.states)||void 0===i?void 0:i[t];if(!e||!s)return void 0!==(null==n?void 0:n.state)?String(n.state):"";const l=e.formatEntityState,d=l?l(s,void 0!==(null==n?void 0:n.state)?String(n.state):void 0):(0,a.computeStateDisplay)(e.localize,s,e.locale,null==n?void 0:n.state);if(o)return d;const c=null===(r=s.attributes)||void 0===r?void 0:r.unit_of_measurement;if(c&&"string"==typeof d){const e=` ${c}`;if(d.endsWith(e))return d.slice(0,-e.length)}return d}}}]);