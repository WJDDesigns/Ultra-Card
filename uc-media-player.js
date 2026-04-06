"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[5801],{7722:(e,n,i)=>{i.r(n),i.d(n,{UltraMediaPlayerModule:()=>r});var t=i(5183),a=i(7475),o=i(8869);i(7921);class r extends a.m{constructor(){super(...arguments),this.metadata={type:"media_player",title:"Media Player",description:"Control media players with album art, progress bar, and playback controls",author:"WJD Designs",version:"1.0.0",icon:"mdi:music",category:"interactive",tags:["media","music","player","audio","video","spotify","chromecast","interactive"]},this._progressUpdateInterval=null,this._expandedModules=new Set,this._volumeDragState=new Map,this._extractedColors=new Map,this._lastMediaContentId=new Map}createDefault(e,n){let i="";if(null==n?void 0:n.states){const e=Object.keys(n.states).filter((e=>e.startsWith("media_player.")));e.length>0&&(i=e[0])}return{id:e||this.generateId("media_player"),type:"media_player",entity:i,name:"",layout:"card",card_size:280,show_name:!0,show_album_art:!0,show_track_info:!0,show_progress:!0,show_duration:!0,show_controls:!0,show_volume:!0,show_source:!1,show_shuffle:!1,show_repeat:!1,show_sound_mode:!1,show_stop_button:!1,show_album_name:!0,enable_seek:!0,auto_hide_when_off:!1,expandable:!0,dynamic_colors:!1,blurred_background:!0,blur_amount:10,blur_opacity:.4,blur_expand:!0,animated_visuals:!1,visualizer_type:"rings",fallback_icon:"mdi:music",play_icon:"mdi:play",pause_icon:"mdi:pause",stop_icon:"mdi:stop",previous_icon:"mdi:skip-previous",next_icon:"mdi:skip-next",shuffle_icon:"mdi:shuffle",repeat_icon:"mdi:repeat",repeat_one_icon:"mdi:repeat-once",volume_muted_icon:"mdi:volume-off",volume_low_icon:"mdi:volume-low",volume_medium_icon:"mdi:volume-medium",volume_high_icon:"mdi:volume-high",progress_color:"var(--primary-color)",progress_background:"var(--divider-color)",button_color:"var(--primary-text-color)",button_active_color:"var(--primary-color)",album_art_border_radius:"8px",tap_action:{action:"more-info"},hold_action:{action:"default"},double_tap_action:{action:"default"}}}renderGeneralTab(e,n,i,a){const r=e;return t.qy`
      <style>
        ${this.injectUcFormStyles()}
      </style>

      <!-- Entity Configuration -->
      ${this.renderSettingsSection("Entity Configuration","Select the media player entity to control",[{title:"Media Player Entity",description:"Select a media player entity (Spotify, Chromecast, etc.)",hass:n,data:{entity:r.entity||""},schema:[{name:"entity",selector:{entity:{domain:"media_player"}}}],onChange:e=>a({entity:e.detail.value.entity})}])}

      <!-- Layout Settings -->
      ${this.renderSettingsSection("Layout","Choose the display layout",[{title:"Layout Mode",description:"Compact: horizontal bar, Card: full display, Mini: single line",hass:n,data:{layout:r.layout||"compact"},schema:[this.selectField("layout",[{value:"compact",label:"Compact"},{value:"card",label:"Card"},{value:"mini",label:"Mini"}])],onChange:e=>a({layout:e.detail.value.layout})}])}

      ${"card"===r.layout?t.qy`
            <div style="margin-top: 8px; margin-bottom: 16px;">
              ${this.renderSliderField("Album Art Size","Size of the album art in pixels (80-400)",r.card_size||280,280,80,400,10,(e=>a({card_size:e})),"px")}
            </div>
          `:""}

      <!-- Display Options -->
      ${this.renderSettingsSection("Display Options","Choose what elements to show",[{title:"Show Album Art",description:"Display album artwork or fallback icon",hass:n,data:{show_album_art:!1!==r.show_album_art},schema:[this.booleanField("show_album_art")],onChange:e=>a({show_album_art:e.detail.value.show_album_art})},{title:"Show Track Info",description:"Display track title and artist",hass:n,data:{show_track_info:!1!==r.show_track_info},schema:[this.booleanField("show_track_info")],onChange:e=>a({show_track_info:e.detail.value.show_track_info})},{title:"Show Album Name",description:"Display album name (when available)",hass:n,data:{show_album_name:!1!==r.show_album_name},schema:[this.booleanField("show_album_name")],onChange:e=>a({show_album_name:e.detail.value.show_album_name})},{title:"Show Progress Bar",description:"Display playback progress",hass:n,data:{show_progress:!1!==r.show_progress},schema:[this.booleanField("show_progress")],onChange:e=>a({show_progress:e.detail.value.show_progress})},{title:"Show Duration",description:"Display current time / total duration",hass:n,data:{show_duration:!1!==r.show_duration},schema:[this.booleanField("show_duration")],onChange:e=>a({show_duration:e.detail.value.show_duration})},{title:"Show Controls",description:"Display play/pause and skip controls",hass:n,data:{show_controls:!1!==r.show_controls},schema:[this.booleanField("show_controls")],onChange:e=>a({show_controls:e.detail.value.show_controls})},{title:"Show Volume",description:"Display volume slider and mute button",hass:n,data:{show_volume:!1!==r.show_volume},schema:[this.booleanField("show_volume")],onChange:e=>a({show_volume:e.detail.value.show_volume})},{title:"Show Stop Button",description:"Display a stop button alongside play/pause",hass:n,data:{show_stop_button:r.show_stop_button||!1},schema:[this.booleanField("show_stop_button")],onChange:e=>a({show_stop_button:e.detail.value.show_stop_button})},{title:"Show Source Selector",description:"Display source/speaker selection dropdown",hass:n,data:{show_source:r.show_source||!1},schema:[this.booleanField("show_source")],onChange:e=>a({show_source:e.detail.value.show_source})},{title:"Show Shuffle Button",description:"Display shuffle toggle button",hass:n,data:{show_shuffle:r.show_shuffle||!1},schema:[this.booleanField("show_shuffle")],onChange:e=>a({show_shuffle:e.detail.value.show_shuffle})},{title:"Show Repeat Button",description:"Display repeat mode button",hass:n,data:{show_repeat:r.show_repeat||!1},schema:[this.booleanField("show_repeat")],onChange:e=>a({show_repeat:e.detail.value.show_repeat})},{title:"Show Sound Mode",description:"Display sound mode selector (if supported)",hass:n,data:{show_sound_mode:r.show_sound_mode||!1},schema:[this.booleanField("show_sound_mode")],onChange:e=>a({show_sound_mode:e.detail.value.show_sound_mode})}])}

      <!-- Behavior Settings -->
      ${this.renderSettingsSection("Behavior","Control interactive behaviors",[{title:"Enable Seek",description:"Allow clicking progress bar to seek",hass:n,data:{enable_seek:!1!==r.enable_seek},schema:[this.booleanField("enable_seek")],onChange:e=>a({enable_seek:e.detail.value.enable_seek})},{title:"Auto-Hide When Off",description:"Hide module when media player is off or idle",hass:n,data:{auto_hide_when_off:r.auto_hide_when_off||!1},schema:[this.booleanField("auto_hide_when_off")],onChange:e=>a({auto_hide_when_off:e.detail.value.auto_hide_when_off})},{title:"Expandable (Compact Mode)",description:"Allow expanding compact layout to show more controls",hass:n,data:{expandable:!1!==r.expandable},schema:[this.booleanField("expandable")],onChange:e=>a({expandable:e.detail.value.expandable})}])}

      <!-- Visual Settings -->
      ${this.renderSettingsSection("Visual","Customize the appearance",[{title:"Blurred Background",description:"Use album art as a blurred, darkened background",hass:n,data:{blurred_background:!1!==r.blurred_background},schema:[this.booleanField("blurred_background")],onChange:e=>a({blurred_background:e.detail.value.blurred_background})}])}

      <!-- Blur Settings (when blurred background is enabled) -->
      ${!1!==r.blurred_background?t.qy`
            <div style="margin-left: 16px; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid var(--primary-color);">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                <div>
                  <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px;">Blur Amount</div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      .value=${r.blur_amount||10}
                      @input=${e=>a({blur_amount:parseInt(e.target.value)})}
                      style="flex: 1; accent-color: var(--primary-color);"
                    />
                    <span style="min-width: 40px; text-align: right; font-size: 12px; color: var(--secondary-text-color);">${r.blur_amount||10}px</span>
                  </div>
                </div>
                <div>
                  <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px;">Blur Opacity</div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input
                      type="range"
                      min="10"
                      max="80"
                      .value=${Math.round(100*(r.blur_opacity||.4))}
                      @input=${e=>a({blur_opacity:parseInt(e.target.value)/100})}
                      style="flex: 1; accent-color: var(--primary-color);"
                    />
                    <span style="min-width: 40px; text-align: right; font-size: 12px; color: var(--secondary-text-color);">${Math.round(100*(r.blur_opacity||.4))}%</span>
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <ha-switch
                  .checked=${!1!==r.blur_expand}
                  @change=${e=>a({blur_expand:e.target.checked})}
                ></ha-switch>
                <div style="font-size: 13px;">Expand past card edges</div>
              </div>
            </div>
          `:""}

      ${this.renderSettingsSection("","",[{title:"Dynamic Colors",description:"Extract accent colors from album art for controls",hass:n,data:{dynamic_colors:r.dynamic_colors||!1},schema:[this.booleanField("dynamic_colors")],onChange:e=>a({dynamic_colors:e.detail.value.dynamic_colors})},{title:"Animated Visuals",description:"Show animated visualizer behind album art when playing",hass:n,data:{animated_visuals:r.animated_visuals||!1},schema:[this.booleanField("animated_visuals")],onChange:e=>a({animated_visuals:e.detail.value.animated_visuals})}])}

      <!-- Visualizer Type (when animated visuals is enabled) -->
      ${r.animated_visuals?t.qy`
            <div style="margin-left: 16px; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid var(--primary-color);">
              <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px;">Visualizer Type</div>
              <select
                .value=${r.visualizer_type||"rings"}
                @change=${e=>a({visualizer_type:e.target.value})}
                style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px; cursor: pointer;"
              >
                <option value="rings">Rings - Pulsing circles</option>
                <option value="bars">Bars - Vertical equalizer bars</option>
                <option value="wave">Wave - Oscillating sine wave</option>
                <option value="dots">Dots - Bouncing dot pattern</option>
                <option value="spectrum">Spectrum - Radial frequency bars</option>
                <option value="pulse">Pulse - Breathing glow effect</option>
                <option value="orbit">Orbit - Rotating particles</option>
                <option value="spiral">Spiral - Rotating spiral pattern</option>
                <option value="equalizer">Equalizer - Classic EQ visualization</option>
                <option value="particles">Particles - Floating particle field</option>
              </select>
            </div>
          `:""}


      <!-- Color Customization (when dynamic colors is disabled) -->
      ${r.dynamic_colors?"":t.qy`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              <div
                class="section-title"
                style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
              >
                COLOR CUSTOMIZATION
              </div>
              <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
                Customize colors for various elements
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Progress Bar Color</div>
                  <ultra-color-picker
                    .hass=${n}
                    .value=${r.progress_color||"var(--primary-color)"}
                    @color-changed=${e=>a({progress_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Progress Background</div>
                  <ultra-color-picker
                    .hass=${n}
                    .value=${r.progress_background||"var(--divider-color)"}
                    @color-changed=${e=>a({progress_background:e.detail.value})}
                  ></ultra-color-picker>
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Button Color</div>
                  <ultra-color-picker
                    .hass=${n}
                    .value=${r.button_color||"var(--primary-text-color)"}
                    @color-changed=${e=>a({button_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Active Button Color</div>
                  <ultra-color-picker
                    .hass=${n}
                    .value=${r.button_active_color||"var(--primary-color)"}
                    @color-changed=${e=>a({button_active_color:e.detail.value})}
                  ></ultra-color-picker>
                </div>
              </div>
            </div>
          `}

      <!-- Icon Customization -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ICON CUSTOMIZATION
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          Customize icons for controls and states
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          ${this.renderFieldSection("Fallback Icon","Icon when no album art available",n,{fallback_icon:r.fallback_icon||"mdi:music"},[this.iconField("fallback_icon")],(e=>a({fallback_icon:e.detail.value.fallback_icon})))}
          ${this.renderFieldSection("Play Icon","Icon for play button",n,{play_icon:r.play_icon||"mdi:play"},[this.iconField("play_icon")],(e=>a({play_icon:e.detail.value.play_icon})))}
          ${this.renderFieldSection("Pause Icon","Icon for pause button",n,{pause_icon:r.pause_icon||"mdi:pause"},[this.iconField("pause_icon")],(e=>a({pause_icon:e.detail.value.pause_icon})))}
          ${this.renderFieldSection("Previous Icon","Icon for previous track button",n,{previous_icon:r.previous_icon||"mdi:skip-previous"},[this.iconField("previous_icon")],(e=>a({previous_icon:e.detail.value.previous_icon})))}
          ${this.renderFieldSection("Next Icon","Icon for next track button",n,{next_icon:r.next_icon||"mdi:skip-next"},[this.iconField("next_icon")],(e=>a({next_icon:e.detail.value.next_icon})))}
        </div>

        <div style="margin-top: 16px;">
          ${this.renderFieldSection("Album Art Border Radius","Border radius for album art (e.g., 8px, 50%)",n,{album_art_border_radius:r.album_art_border_radius||"8px"},[this.textField("album_art_border_radius")],(e=>a({album_art_border_radius:e.detail.value.album_art_border_radius})))}
        </div>
      </div>

      <!-- Link Configuration -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        ${o.K.render(n,{tap_action:r.tap_action||{action:"more-info"},hold_action:r.hold_action||{action:"default"},double_tap_action:r.double_tap_action||{action:"default"}},(e=>{const n={};e.tap_action&&(n.tap_action=e.tap_action),e.hold_action&&(n.hold_action=e.hold_action),e.double_tap_action&&(n.double_tap_action=e.double_tap_action),a(n)}),"Link Configuration")}
      </div>
    `}renderPreview(e,n,i,a){const o=e,r=this.resolveEntity(o.entity,i),s=r?n.states[r]:void 0;if(!r||!s)return this.renderGradientErrorState("Configure Entity","Select a media player entity in the General tab","mdi:music-off");const l=s.state;if(o.auto_hide_when_off&&("off"===l||"idle"===l||"unavailable"===l))return t.qy`<div class="media-player-hidden"></div>`;switch(o.layout){case"card":return this.renderCardLayout(o,n,s,i);case"mini":return this.renderMiniLayout(o,n,s,i);default:return this.renderCompactLayout(o,n,s,i)}}renderCompactLayout(e,n,i,a){const o=this._expandedModules.has(e.id),r=i.state,s=i.attributes,l=s.entity_picture||s.entity_picture_local,d=e.dynamic_colors?this.getDynamicColorStyles(e,i):"";return t.qy`
      <style>
        ${this.getStyles()}
        ${d}
      </style>
      <div
        class="media-player-container media-player-compact ${e.dynamic_colors?"mp-dynamic-colors":""}"
      >
        <!-- Blurred Background -->
        ${!1!==e.blurred_background&&l?t.qy`<div class="mp-blurred-bg ${!1!==e.blur_expand?"mp-blur-expand":"mp-blur-contained"}" style="background-image: url('${l}'); filter: blur(${e.blur_amount||10}px); opacity: ${e.blur_opacity||.4};"></div>`:""}
        
        <!-- Main Row -->
        <div class="mp-compact-row">
          <!-- Album Art -->
          ${!1!==e.show_album_art?this.renderAlbumArt(e,i,48):""}

          <!-- Track Info -->
          <div class="mp-track-info">
            ${!1!==e.show_track_info?t.qy`
                  <div class="mp-track-title">${s.media_title||e.name||i.attributes.friendly_name||"No media"}</div>
                  <div class="mp-track-artist">${s.media_artist||s.app_name||r}</div>
                `:t.qy`
                  <div class="mp-track-title">${e.name||i.attributes.friendly_name}</div>
                  <div class="mp-track-artist">${r}</div>
                `}
          </div>

          <!-- Quick Controls -->
          ${!1!==e.show_controls?t.qy`
                <div class="mp-quick-controls">
                  ${this.renderPlayPauseButton(e,n,i)}
                  ${!1!==e.expandable?t.qy`
                        <button
                          class="mp-control-btn mp-expand-btn"
                          @click=${n=>this.toggleExpand(n,e.id)}
                          title="${o?"Collapse":"Expand"}"
                        >
                          <ha-icon icon="${o?"mdi:chevron-up":"mdi:chevron-down"}"></ha-icon>
                        </button>
                      `:""}
                </div>
              `:""}
        </div>

        <!-- Progress Bar (thin line at bottom) -->
        ${!1===e.show_progress||"playing"!==r&&"paused"!==r?"":this.renderProgressBar(e,n,i,!0)}

        <!-- Expanded Controls -->
        ${o?this.renderExpandedControls(e,n,i):""}
      </div>
    `}renderCardLayout(e,n,i,a){var o,r;const s=i.state,l=i.attributes,d=e.card_size||280,p=l.entity_picture||l.entity_picture_local,c=this.getDynamicColorStyles(e,i);return t.qy`
      <style>
        ${this.getStyles()}
        ${c}
      </style>
      <div class="media-player-container media-player-card ${e.dynamic_colors?"mp-dynamic-colors":""}">
        <!-- Blurred Background -->
        ${!1!==e.blurred_background&&p?t.qy`<div class="mp-blurred-bg ${!1!==e.blur_expand?"mp-blur-expand":"mp-blur-contained"}" style="background-image: url('${p}'); filter: blur(${e.blur_amount||10}px); opacity: ${e.blur_opacity||.4};"></div>`:""}

        <!-- Album Art with Visualizer -->
        <div class="mp-art-wrapper" style="width: ${d}px; height: ${d}px;">
          ${e.animated_visuals&&"playing"===s?this.renderVisualizer(e.visualizer_type||"rings"):""}
          ${!1!==e.show_album_art?this.renderAlbumArt(e,i,d,!0):""}
        </div>

        <!-- Track Info -->
        ${!1!==e.show_track_info?t.qy`
              <div class="mp-card-track-info">
                <div class="mp-card-title">${l.media_title||e.name||i.attributes.friendly_name||"No media"}</div>
                <div class="mp-card-artist">${l.media_artist||l.app_name||""}</div>
                ${!1!==e.show_album_name&&l.media_album_name?t.qy`<div class="mp-card-album">${l.media_album_name}</div>`:""}
              </div>
            `:""}

        <!-- Progress Bar -->
        ${!1===e.show_progress||"playing"!==s&&"paused"!==s?"":this.renderProgressBar(e,n,i,!1)}

        <!-- Control Buttons -->
        ${!1!==e.show_controls?t.qy`
              <div class="mp-card-controls">
                ${e.show_shuffle?this.renderShuffleButton(e,n,i):""}
                ${this.supportsFeature(i,16)?t.qy`
                      <button class="mp-control-btn" @click=${e=>this.handlePrevious(e,n,i)}>
                        <ha-icon icon="${e.previous_icon||"mdi:skip-previous"}"></ha-icon>
                      </button>
                    `:""}
                ${this.renderPlayPauseButton(e,n,i,!0)}
                ${e.show_stop_button&&this.supportsFeature(i,4096)?t.qy`
                      <button class="mp-control-btn" @click=${e=>this.handleStop(e,n,i)}>
                        <ha-icon icon="${e.stop_icon||"mdi:stop"}"></ha-icon>
                      </button>
                    `:""}
                ${this.supportsFeature(i,32)?t.qy`
                      <button class="mp-control-btn" @click=${e=>this.handleNext(e,n,i)}>
                        <ha-icon icon="${e.next_icon||"mdi:skip-next"}"></ha-icon>
                      </button>
                    `:""}
                ${e.show_repeat?this.renderRepeatButton(e,n,i):""}
              </div>
            `:""}

        <!-- Volume Control -->
        ${!1!==e.show_volume&&this.supportsFeature(i,4)?this.renderVolumeControl(e,n,i):""}

        <!-- Source Selector -->
        ${e.show_source&&this.supportsFeature(i,2048)&&(null===(o=i.attributes.source_list)||void 0===o?void 0:o.length)?this.renderSourceSelector(e,n,i):""}

        <!-- Sound Mode Selector -->
        ${e.show_sound_mode&&this.supportsFeature(i,65536)&&(null===(r=i.attributes.sound_mode_list)||void 0===r?void 0:r.length)?this.renderSoundModeSelector(e,n,i):""}
      </div>
    `}renderMiniLayout(e,n,i,a){i.state;const o=i.attributes;let r=e.name||o.friendly_name||"Media Player";return o.media_title&&(r=o.media_artist?`${o.media_title} - ${o.media_artist}`:o.media_title),t.qy`
      <style>
        ${this.getStyles()}
      </style>
      <div class="media-player-container media-player-mini">
        ${!1!==e.show_album_art?this.renderAlbumArt(e,i,24):""}
        <div class="mp-mini-text" title="${r}">${r}</div>
        ${!1!==e.show_controls?this.renderPlayPauseButton(e,n,i):""}
      </div>
    `}renderAlbumArt(e,n,i,a=!1){const o=n.attributes,r=o.entity_picture||o.entity_picture_local,s=e.album_art_border_radius||"8px";return n.state,t.qy`
      <div
        class="mp-album-art ${a?"mp-album-art-card":""}"
        style="width: ${i}px; height: ${i}px; border-radius: ${s};"
      >
        ${r?t.qy`<img src="${r}" alt="Album Art" style="border-radius: ${s};" />`:t.qy`<ha-icon icon="${e.fallback_icon||"mdi:music"}" style="--mdc-icon-size: ${Math.floor(.5*i)}px;"></ha-icon>`}
      </div>
    `}renderVisualizer(e){switch(e){case"rings":return t.qy`
          <div class="mp-visualizer mp-visualizer-rings">
            <div class="mp-viz-ring mp-ring-1"></div>
            <div class="mp-viz-ring mp-ring-2"></div>
            <div class="mp-viz-ring mp-ring-3"></div>
            <div class="mp-viz-ring mp-ring-4"></div>
          </div>
        `;case"bars":return t.qy`
          <div class="mp-visualizer mp-visualizer-bars">
            ${[...Array(20)].map(((e,n)=>t.qy`<div class="mp-viz-bar" style="--bar-index: ${n};"></div>`))}
          </div>
        `;case"wave":return t.qy`
          <div class="mp-visualizer mp-visualizer-wave">
            <div class="mp-viz-wave-line mp-wave-1"></div>
            <div class="mp-viz-wave-line mp-wave-2"></div>
            <div class="mp-viz-wave-line mp-wave-3"></div>
          </div>
        `;case"dots":return t.qy`
          <div class="mp-visualizer mp-visualizer-dots">
            ${[...Array(16)].map(((e,n)=>t.qy`<div class="mp-viz-dot" style="--dot-index: ${n};"></div>`))}
          </div>
        `;case"spectrum":return t.qy`
          <div class="mp-visualizer mp-visualizer-spectrum">
            ${[...Array(24)].map(((e,n)=>t.qy`<div class="mp-viz-spectrum-bar" style="--spectrum-index: ${n};"></div>`))}
          </div>
        `;case"pulse":return t.qy`
          <div class="mp-visualizer mp-visualizer-pulse">
            <div class="mp-viz-pulse-core"></div>
            <div class="mp-viz-pulse-wave mp-pulse-1"></div>
            <div class="mp-viz-pulse-wave mp-pulse-2"></div>
            <div class="mp-viz-pulse-wave mp-pulse-3"></div>
          </div>
        `;case"orbit":return t.qy`
          <div class="mp-visualizer mp-visualizer-orbit">
            <div class="mp-viz-orbit-ring mp-orbit-1">
              <div class="mp-viz-orbit-dot"></div>
              <div class="mp-viz-orbit-dot mp-dot-2"></div>
            </div>
            <div class="mp-viz-orbit-ring mp-orbit-2">
              <div class="mp-viz-orbit-dot"></div>
              <div class="mp-viz-orbit-dot mp-dot-2"></div>
              <div class="mp-viz-orbit-dot mp-dot-3"></div>
            </div>
            <div class="mp-viz-orbit-ring mp-orbit-3">
              <div class="mp-viz-orbit-dot"></div>
              <div class="mp-viz-orbit-dot mp-dot-2"></div>
            </div>
          </div>
        `;case"spiral":return t.qy`
          <div class="mp-visualizer mp-visualizer-spiral">
            <div class="mp-viz-spiral-arm mp-spiral-1"></div>
            <div class="mp-viz-spiral-arm mp-spiral-2"></div>
            <div class="mp-viz-spiral-arm mp-spiral-3"></div>
            <div class="mp-viz-spiral-arm mp-spiral-4"></div>
          </div>
        `;case"equalizer":return t.qy`
          <div class="mp-visualizer mp-visualizer-equalizer">
            ${[...Array(24)].map(((e,n)=>t.qy`<div class="mp-viz-eq-bar" style="--eq-index: ${n};"></div>`))}
          </div>
        `;case"particles":return t.qy`
          <div class="mp-visualizer mp-visualizer-particles">
            ${[...Array(40)].map(((e,n)=>t.qy`<div class="mp-viz-particle" style="--particle-index: ${n}; --particle-total: 40;"></div>`))}
          </div>
        `;default:return t.qy``}}renderPlayPauseButton(e,n,i,a=!1){const o="playing"===i.state,r=o?e.pause_icon||"mdi:pause":e.play_icon||"mdi:play",s=!a&&e.button_active_color&&o?`color: ${e.button_active_color};`:"";return t.qy`
      <button
        class="mp-control-btn ${a?"mp-control-btn-large":""} ${o&&!a?"mp-btn-active":""}"
        @click=${e=>this.handlePlayPause(e,n,i)}
        style="${s}"
        title="${o?"Pause":"Play"}"
      >
        <ha-icon icon="${r}"></ha-icon>
      </button>
    `}renderShuffleButton(e,n,i){if(!this.supportsFeature(i,32768))return t.qy``;const a=!0===i.attributes.shuffle;return t.qy`
      <button
        class="mp-control-btn ${a?"mp-btn-active":""}"
        @click=${e=>this.handleShuffle(e,n,i)}
        title="Shuffle ${a?"On":"Off"}"
        style="${e.button_active_color&&a?`color: ${e.button_active_color};`:""}"
      >
        <ha-icon icon="${e.shuffle_icon||"mdi:shuffle"}"></ha-icon>
      </button>
    `}renderRepeatButton(e,n,i){if(!this.supportsFeature(i,262144))return t.qy``;const a=i.attributes.repeat||"off",o="off"!==a;let r=e.repeat_icon||"mdi:repeat";return"one"===a&&(r=e.repeat_one_icon||"mdi:repeat-once"),t.qy`
      <button
        class="mp-control-btn ${o?"mp-btn-active":""}"
        @click=${e=>this.handleRepeat(e,n,i)}
        title="Repeat: ${a}"
        style="${e.button_active_color&&o?`color: ${e.button_active_color};`:""}"
      >
        <ha-icon icon="${r}"></ha-icon>
      </button>
    `}renderProgressBar(e,n,i,a){const o=this.getCurrentPosition(i),r=i.attributes.media_duration||0,s=r>0?o/r*100:0,l=e.progress_color||"var(--primary-color)",d=e.progress_background||"var(--divider-color)";return t.qy`
      <div class="mp-progress-container ${a?"mp-progress-compact":""}">
        ${a||!1===e.show_duration?"":t.qy`<span class="mp-time">${this.formatTime(o)}</span>`}
        <div
          class="mp-progress-bar"
          style="background: ${d};"
          @click=${!1!==e.enable_seek?e=>this.handleSeek(e,n,i,r):void 0}
        >
          <div class="mp-progress-fill" style="width: ${s}%; background: ${l};"></div>
        </div>
        ${a||!1===e.show_duration?"":t.qy`<span class="mp-time">${this.formatTime(r)}</span>`}
      </div>
    `}renderVolumeControl(e,n,i){var a;const o=null!==(a=i.attributes.volume_level)&&void 0!==a?a:.5,r=i.attributes.is_volume_muted,s=Math.round(100*o);let l=e.volume_high_icon||"mdi:volume-high";return r?l=e.volume_muted_icon||"mdi:volume-off":o<.33?l=e.volume_low_icon||"mdi:volume-low":o<.66&&(l=e.volume_medium_icon||"mdi:volume-medium"),t.qy`
      <div class="mp-volume-control">
        ${this.supportsFeature(i,8)?t.qy`
              <button
                class="mp-control-btn mp-volume-btn ${r?"mp-btn-muted":""}"
                @click=${e=>this.handleMuteToggle(e,n,i)}
                title="${r?"Unmute":"Mute"}"
              >
                <ha-icon icon="${l}"></ha-icon>
              </button>
            `:t.qy`<ha-icon icon="${l}" class="mp-volume-icon"></ha-icon>`}
        <input
          type="range"
          class="mp-volume-slider"
          min="0"
          max="100"
          .value=${s}
          @input=${e=>this.handleVolumeChange(e,n,i)}
          style="--progress: ${s}%; --progress-color: ${e.progress_color||"var(--primary-color)"}; --bg-color: ${e.progress_background||"var(--divider-color)"};"
        />
        <span class="mp-volume-value">${s}%</span>
      </div>
    `}renderSourceSelector(e,n,i){var a,o;const r=i.attributes.source_list||[],s=i.attributes.source||"",l=(null===(a=i.entity_id)||void 0===a?void 0:a.includes("spotify"))||(null===(o=i.attributes.friendly_name)||void 0===o?void 0:o.toLowerCase().includes("spotify")),d=l?"mdi:spotify":"mdi:speaker";return t.qy`
      <div class="mp-source-selector">
        <ha-icon icon="${d}" class="mp-source-icon ${l?"mp-spotify-icon":""}"></ha-icon>
        <select
          class="mp-source-select"
          .value=${s}
          @change=${e=>this.handleSourceChange(e,n,i)}
        >
          ${r.map((e=>t.qy`<option value="${e}" ?selected=${e===s}>${e}</option>`))}
        </select>
      </div>
    `}renderSoundModeSelector(e,n,i){const a=i.attributes.sound_mode_list||[],o=i.attributes.sound_mode||"";return t.qy`
      <div class="mp-source-selector">
        <ha-icon icon="mdi:music-note" class="mp-source-icon"></ha-icon>
        <select
          class="mp-source-select"
          .value=${o}
          @change=${e=>this.handleSoundModeChange(e,n,i)}
        >
          ${a.map((e=>t.qy`<option value="${e}" ?selected=${e===o}>${e}</option>`))}
        </select>
      </div>
    `}renderExpandedControls(e,n,i){var a;return t.qy`
      <div class="mp-expanded-controls">
        <!-- Full Progress -->
        ${!1!==e.show_progress&&!1!==e.show_duration?this.renderProgressBar(e,n,i,!1):""}

        <!-- Control Row -->
        <div class="mp-expanded-row">
          ${e.show_shuffle?this.renderShuffleButton(e,n,i):""}
          ${this.supportsFeature(i,16)?t.qy`
                <button class="mp-control-btn" @click=${e=>this.handlePrevious(e,n,i)}>
                  <ha-icon icon="${e.previous_icon||"mdi:skip-previous"}"></ha-icon>
                </button>
              `:""}
          ${e.show_stop_button&&this.supportsFeature(i,4096)?t.qy`
                <button class="mp-control-btn" @click=${e=>this.handleStop(e,n,i)}>
                  <ha-icon icon="${e.stop_icon||"mdi:stop"}"></ha-icon>
                </button>
              `:""}
          ${this.supportsFeature(i,32)?t.qy`
                <button class="mp-control-btn" @click=${e=>this.handleNext(e,n,i)}>
                  <ha-icon icon="${e.next_icon||"mdi:skip-next"}"></ha-icon>
                </button>
              `:""}
          ${e.show_repeat?this.renderRepeatButton(e,n,i):""}
        </div>

        <!-- Volume -->
        ${!1!==e.show_volume&&this.supportsFeature(i,4)?this.renderVolumeControl(e,n,i):""}

        <!-- Source -->
        ${e.show_source&&this.supportsFeature(i,2048)&&(null===(a=i.attributes.source_list)||void 0===a?void 0:a.length)?this.renderSourceSelector(e,n,i):""}
      </div>
    `}async handlePlayPause(e,n,i){e.stopPropagation();const t=i.state,a=i.entity_id,o=i.attributes,r=a.includes("spotify");if("playing"===t)n.callService("media_player","media_pause",{entity_id:a});else if("paused"===t)n.callService("media_player","media_play",{entity_id:a});else if(r){const e=o.source,i=o.source_list||[];!e&&i.length>0&&(await n.callService("media_player","select_source",{entity_id:a,source:i[0]}),await new Promise((e=>setTimeout(e,1e3)))),n.callService("media_player","media_play",{entity_id:a})}else n.callService("media_player","media_play",{entity_id:a})}handleStop(e,n,i){e.stopPropagation(),n.callService("media_player","media_stop",{entity_id:i.entity_id})}handlePrevious(e,n,i){e.stopPropagation(),n.callService("media_player","media_previous_track",{entity_id:i.entity_id})}handleNext(e,n,i){e.stopPropagation(),n.callService("media_player","media_next_track",{entity_id:i.entity_id})}handleShuffle(e,n,i){e.stopPropagation();const t=i.attributes.shuffle||!1;n.callService("media_player","shuffle_set",{entity_id:i.entity_id,shuffle:!t})}handleRepeat(e,n,i){e.stopPropagation();let t="off";switch(i.attributes.repeat||"off"){case"off":t="all";break;case"all":t="one";break;case"one":t="off"}n.callService("media_player","repeat_set",{entity_id:i.entity_id,repeat:t})}handleMuteToggle(e,n,i){e.stopPropagation();const t=i.attributes.is_volume_muted||!1;n.callService("media_player","volume_mute",{entity_id:i.entity_id,is_volume_muted:!t})}handleVolumeChange(e,n,i){e.stopPropagation();const t=e.target,a=parseInt(t.value,10)/100;n.callService("media_player","volume_set",{entity_id:i.entity_id,volume_level:a})}handleSeek(e,n,i,t){if(e.stopPropagation(),!t||!this.supportsFeature(i,2))return;const a=e.currentTarget.getBoundingClientRect(),o=(e.clientX-a.left)/a.width*t;n.callService("media_player","media_seek",{entity_id:i.entity_id,seek_position:o})}handleSourceChange(e,n,i){e.stopPropagation();const t=e.target;n.callService("media_player","select_source",{entity_id:i.entity_id,source:t.value})}handleSoundModeChange(e,n,i){e.stopPropagation();const t=e.target;n.callService("media_player","select_sound_mode",{entity_id:i.entity_id,sound_mode:t.value})}toggleExpand(e,n){e.stopPropagation(),this._expandedModules.has(n)?this._expandedModules.delete(n):this._expandedModules.add(n),this.triggerPreviewUpdate(!0)}supportsFeature(e,n){return!!((e.attributes.supported_features||0)&n)}getDynamicColorStyles(e,n){const i=n.attributes,t=i.entity_picture||i.entity_picture_local,a=i.media_content_id||"",o=`${e.id}_${a}`;if(!t)return"";const r=this._extractedColors.get(o);return r?`\n        .media-player-container.mp-dynamic-colors {\n          --mp-dynamic-primary: ${r.primary};\n          --mp-dynamic-accent: ${r.accent};\n        }\n      `:(this._lastMediaContentId.get(e.id)!==a&&(this._lastMediaContentId.set(e.id,a),this.extractColorsFromImage(t,o)),"\n      .media-player-container.mp-dynamic-colors {\n        --mp-dynamic-primary: var(--primary-color);\n        --mp-dynamic-accent: var(--primary-color);\n      }\n    ")}async extractColorsFromImage(e,n){try{const i=new Image;i.crossOrigin="anonymous",i.onload=()=>{try{const e=document.createElement("canvas"),t=e.getContext("2d");if(!t)return;const a=50;e.width=a,e.height=a,t.drawImage(i,0,0,a,a);const o=t.getImageData(0,0,a,a).data,r=new Map;for(let e=0;e<o.length;e+=4){const n=o[e],i=o[e+1],t=o[e+2],a=Math.max(n,i,t),s=Math.min(n,i,t),l=(a+s)/2,d=0===a?0:(a-s)/a;if(l<40||l>220)continue;if(d<.2)continue;const p=32*Math.round(n/32),c=`${p},${32*Math.round(i/32)},${32*Math.round(t/32)}`,m=r.get(c);m?(m.count++,d>m.saturation&&(m.r=n,m.g=i,m.b=t,m.saturation=d)):r.set(c,{count:1,r:n,g:i,b:t,saturation:d})}let s={r:255,g:255,b:255,count:0,saturation:0},l=0;for(const e of r.values()){const n=e.count*(1+2*e.saturation);n>l&&(l=n,s=e)}const d=1.3,p=Math.min(255,Math.round(s.r*d)),c=Math.min(255,Math.round(s.g*d)),m=Math.min(255,Math.round(s.b*d));let u=p,v=c,h=m;(p+c+m)/3<120&&(u=Math.min(255,p+80),v=Math.min(255,c+80),h=Math.min(255,m+80));const y=`rgb(${u}, ${v}, ${h})`,b=`rgba(${u}, ${v}, ${h}, 0.6)`;this._extractedColors.set(n,{primary:y,accent:b}),this.triggerPreviewUpdate()}catch(e){}},i.onerror=()=>{},i.src=e}catch(e){}}getCurrentPosition(e){const n=e.attributes;if(!n.media_position||!n.media_position_updated_at)return 0;if("playing"!==e.state)return n.media_position||0;const i=new Date(n.media_position_updated_at).getTime(),t=(Date.now()-i)/1e3;return Math.min(n.media_position+t,n.media_duration||1/0)}formatTime(e){if(!e||e<0)return"0:00";const n=Math.floor(e/3600),i=Math.floor(e%3600/60),t=Math.floor(e%60);return n>0?`${n}:${i.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`:`${i}:${t.toString().padStart(2,"0")}`}validate(e){const n=e,i=[...super.validate(e).errors];return n.entity&&""!==n.entity.trim()||i.push("Media player entity is required"),n.layout&&!["compact","card","mini"].includes(n.layout)&&i.push("Invalid layout mode"),n.card_size&&(n.card_size<80||n.card_size>400)&&i.push("Card size must be between 80 and 400 pixels"),{valid:0===i.length,errors:i}}getStyles(){return`\n      ${a.m.getSliderStyles()}\n      /* Media Player Module Styles */\n      .media-player-container {\n        position: relative;\n        padding: 16px;\n        border-radius: 12px;\n        background: var(--card-background-color, var(--secondary-background-color));\n        opacity: 0.9;\n        transition: all 0.3s ease;\n        overflow: visible;\n      }\n\n\n      .media-player-hidden {\n        display: none;\n      }\n\n      /* Blurred Album Art Background */\n      .mp-blurred-bg {\n        position: absolute;\n        background-size: cover;\n        background-position: center;\n        z-index: 0;\n      }\n\n      .mp-blurred-bg.mp-blur-expand {\n        inset: -20px;\n        transform: scale(1.2);\n      }\n\n      .mp-blurred-bg.mp-blur-contained {\n        inset: 0;\n        transform: scale(1.1);\n        border-radius: 12px;\n      }\n\n      /* Keep everything inside the card */\n      .media-player-container {\n        overflow: hidden;\n      }\n\n      .mp-blurred-bg::after {\n        content: '';\n        position: absolute;\n        inset: 0;\n        background: rgba(0, 0, 0, 0.25);\n      }\n\n      /* Ensure content is above the blurred background */\n      .media-player-container > *:not(.mp-blurred-bg):not(.mp-visualizer-container) {\n        position: relative;\n        z-index: 2;\n      }\n\n      /* Dynamic Colors - applies when dynamic_colors is enabled */\n      .media-player-container.mp-dynamic-colors .mp-control-btn-large {\n        background: var(--mp-dynamic-primary, var(--primary-color));\n      }\n\n      .media-player-container.mp-dynamic-colors .mp-progress-fill {\n        background: var(--mp-dynamic-primary, var(--primary-color)) !important;\n      }\n\n      .media-player-container.mp-dynamic-colors .mp-volume-slider {\n        --progress-color: var(--mp-dynamic-primary, var(--primary-color));\n      }\n\n      .media-player-container.mp-dynamic-colors .mp-volume-slider::-webkit-slider-thumb {\n        background: var(--mp-dynamic-primary, var(--primary-color));\n      }\n\n      .media-player-container.mp-dynamic-colors .mp-volume-slider::-moz-range-thumb {\n        background: var(--mp-dynamic-primary, var(--primary-color));\n      }\n\n      .media-player-container.mp-dynamic-colors .mp-btn-active {\n        color: var(--mp-dynamic-primary, var(--primary-color)) !important;\n      }\n\n      .media-player-container.mp-dynamic-colors .mp-visualizer {\n        --visualizer-color: var(--mp-dynamic-primary, var(--primary-color));\n      }\n\n      /* ============================\n         ALBUM ART WRAPPER\n         ============================ */\n      .mp-art-wrapper {\n        position: relative;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        overflow: hidden;\n      }\n\n      /* ============================\n         ANIMATED VISUALIZERS\n         ============================ */\n      .mp-visualizer {\n        --visualizer-color: var(--mp-dynamic-primary, rgba(255, 255, 255, 0.8));\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        width: 130%;\n        height: 130%;\n        z-index: 3;\n        pointer-events: none;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      /* === RINGS VISUALIZER === */\n      .mp-visualizer-rings .mp-viz-ring {\n        position: absolute;\n        border-radius: 50%;\n        border: 3px solid var(--visualizer-color);\n        opacity: 0;\n        animation: mp-viz-ring-pulse 2s ease-out infinite;\n      }\n\n      .mp-ring-1 { width: 70%; height: 70%; animation-delay: 0s; }\n      .mp-ring-2 { width: 85%; height: 85%; animation-delay: 0.4s; }\n      .mp-ring-3 { width: 100%; height: 100%; animation-delay: 0.8s; }\n      .mp-ring-4 { width: 115%; height: 115%; animation-delay: 1.2s; }\n\n      @keyframes mp-viz-ring-pulse {\n        0% { opacity: 0.9; transform: scale(0.85); }\n        50% { opacity: 0.5; }\n        100% { opacity: 0; transform: scale(1.1); }\n      }\n\n      /* === BARS VISUALIZER === */\n      .mp-visualizer-bars {\n        flex-wrap: nowrap;\n        justify-content: center;\n        align-items: center;\n        gap: 4px;\n      }\n\n      .mp-visualizer-bars .mp-viz-bar {\n        width: 8px;\n        height: 80px;\n        background: var(--visualizer-color);\n        border-radius: 4px;\n        animation: mp-viz-bar-bounce 0.5s ease-in-out infinite;\n        animation-delay: calc(var(--bar-index) * 0.04s);\n        opacity: 0.9;\n      }\n\n      @keyframes mp-viz-bar-bounce {\n        0%, 100% { transform: scaleY(0.3); opacity: 0.6; }\n        50% { transform: scaleY(1); opacity: 1; }\n      }\n\n      /* === WAVE VISUALIZER === */\n      .mp-visualizer-wave {\n        flex-direction: column;\n        justify-content: center;\n        gap: 15px;\n      }\n\n      .mp-viz-wave-line {\n        width: 90%;\n        height: 5px;\n        background: var(--visualizer-color);\n        border-radius: 3px;\n        animation: mp-viz-wave-flow 1.5s ease-in-out infinite;\n        opacity: 0.9;\n      }\n\n      .mp-wave-1 { animation-delay: 0s; }\n      .mp-wave-2 { animation-delay: 0.2s; opacity: 0.7; }\n      .mp-wave-3 { animation-delay: 0.4s; opacity: 0.5; }\n\n      @keyframes mp-viz-wave-flow {\n        0%, 100% { \n          transform: scaleX(0.4) translateX(-30%); \n          opacity: 0.4;\n        }\n        50% { \n          transform: scaleX(1) translateX(30%); \n          opacity: 1;\n        }\n      }\n\n      /* === DOTS VISUALIZER === */\n      .mp-visualizer-dots {\n        justify-content: center;\n        align-items: center;\n        flex-wrap: wrap;\n        gap: 8px;\n        padding: 20px;\n      }\n\n      .mp-visualizer-dots .mp-viz-dot {\n        width: 14px;\n        height: 14px;\n        background: var(--visualizer-color);\n        border-radius: 50%;\n        animation: mp-viz-dot-bounce 0.8s ease-in-out infinite;\n        animation-delay: calc(var(--dot-index) * 0.07s);\n        box-shadow: 0 0 12px var(--visualizer-color);\n      }\n\n      @keyframes mp-viz-dot-bounce {\n        0%, 100% { \n          transform: scale(0.6);\n          opacity: 0.5;\n        }\n        50% { \n          transform: scale(1.3);\n          opacity: 1;\n        }\n      }\n\n      /* === SPECTRUM VISUALIZER === */\n      .mp-visualizer-spectrum .mp-viz-spectrum-bar {\n        position: absolute;\n        width: 5px;\n        background: var(--visualizer-color);\n        border-radius: 3px;\n        transform-origin: center bottom;\n        transform: rotate(calc(var(--spectrum-index) * 15deg)) translateY(-35%);\n        animation: mp-viz-spectrum-grow 0.8s ease-in-out infinite;\n        animation-delay: calc(var(--spectrum-index) * 0.04s);\n        opacity: 0.8;\n      }\n\n      @keyframes mp-viz-spectrum-grow {\n        0%, 100% { height: 25px; opacity: 0.5; }\n        50% { height: 70px; opacity: 1; }\n      }\n\n      /* === PULSE VISUALIZER === */\n      .mp-visualizer-pulse .mp-viz-pulse-core {\n        position: absolute;\n        width: 60%;\n        height: 60%;\n        background: radial-gradient(circle, var(--visualizer-color) 0%, transparent 70%);\n        border-radius: 50%;\n        animation: mp-viz-pulse-breathe 1.2s ease-in-out infinite;\n        opacity: 0.6;\n      }\n\n      .mp-visualizer-pulse .mp-viz-pulse-wave {\n        position: absolute;\n        width: 70%;\n        height: 70%;\n        border: 4px solid var(--visualizer-color);\n        border-radius: 50%;\n        animation: mp-viz-pulse-expand 2s ease-out infinite;\n      }\n\n      .mp-pulse-1 { animation-delay: 0s; }\n      .mp-pulse-2 { animation-delay: 0.6s; }\n      .mp-pulse-3 { animation-delay: 1.2s; }\n\n      @keyframes mp-viz-pulse-breathe {\n        0%, 100% { transform: scale(0.85); opacity: 0.5; }\n        50% { transform: scale(1.1); opacity: 0.8; }\n      }\n\n      @keyframes mp-viz-pulse-expand {\n        0% { transform: scale(0.8); opacity: 0.8; }\n        100% { transform: scale(1.5); opacity: 0; }\n      }\n\n      /* === ORBIT VISUALIZER === */\n      .mp-visualizer-orbit .mp-viz-orbit-ring {\n        position: absolute;\n        border: 3px solid var(--visualizer-color);\n        border-radius: 50%;\n        opacity: 0.4;\n        animation: mp-viz-orbit-spin linear infinite;\n      }\n\n      .mp-orbit-1 { width: 65%; height: 65%; animation-duration: 2s; border-style: dashed; }\n      .mp-orbit-2 { width: 82%; height: 82%; animation-duration: 3s; animation-direction: reverse; }\n      .mp-orbit-3 { width: 100%; height: 100%; animation-duration: 4s; border-style: dotted; }\n\n      .mp-viz-orbit-dot {\n        position: absolute;\n        top: 0;\n        left: 50%;\n        transform: translateX(-50%) translateY(-50%);\n        width: 14px;\n        height: 14px;\n        background: var(--visualizer-color);\n        border-radius: 50%;\n        opacity: 1;\n        box-shadow: 0 0 12px var(--visualizer-color);\n        animation: mp-viz-orbit-dot-pulse 1s ease-in-out infinite;\n      }\n\n      .mp-viz-orbit-dot.mp-dot-2 {\n        top: 50%;\n        left: 100%;\n        animation-delay: 0.3s;\n      }\n\n      .mp-viz-orbit-dot.mp-dot-3 {\n        top: 100%;\n        left: 50%;\n        animation-delay: 0.6s;\n      }\n\n      @keyframes mp-viz-orbit-spin {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n\n      @keyframes mp-viz-orbit-dot-pulse {\n        0%, 100% { transform: translateX(-50%) translateY(-50%) scale(0.8); opacity: 0.7; }\n        50% { transform: translateX(-50%) translateY(-50%) scale(1.3); opacity: 1; }\n      }\n\n      /* === SPIRAL VISUALIZER === */\n      .mp-visualizer-spiral .mp-viz-spiral-arm {\n        position: absolute;\n        border: 4px solid transparent;\n        border-top-color: var(--visualizer-color);\n        border-right-color: var(--visualizer-color);\n        border-radius: 50%;\n        opacity: 0.7;\n      }\n\n      .mp-spiral-1 { \n        width: 45%; \n        height: 45%; \n        animation: mp-viz-spiral-rotate 1s linear infinite;\n      }\n      .mp-spiral-2 { \n        width: 65%; \n        height: 65%; \n        animation: mp-viz-spiral-rotate 1.5s linear infinite reverse;\n      }\n      .mp-spiral-3 { \n        width: 85%; \n        height: 85%; \n        animation: mp-viz-spiral-rotate 2s linear infinite;\n      }\n      .mp-spiral-4 { \n        width: 105%; \n        height: 105%; \n        animation: mp-viz-spiral-rotate 2.5s linear infinite reverse;\n        opacity: 0.4;\n      }\n\n      @keyframes mp-viz-spiral-rotate {\n        from { transform: rotate(0deg); }\n        to { transform: rotate(360deg); }\n      }\n\n      /* === EQUALIZER VISUALIZER === */\n      .mp-visualizer-equalizer {\n        justify-content: center;\n        align-items: flex-end;\n        gap: 4px;\n        padding-bottom: 10%;\n      }\n\n      .mp-visualizer-equalizer .mp-viz-eq-bar {\n        width: 10px;\n        background: linear-gradient(to top, var(--visualizer-color) 0%, transparent 100%);\n        border-radius: 5px 5px 0 0;\n        animation: mp-viz-eq-bounce 0.4s ease-in-out infinite;\n        animation-delay: calc(var(--eq-index) * 0.03s);\n        opacity: 0.85;\n      }\n\n      @keyframes mp-viz-eq-bounce {\n        0%, 100% { height: 20px; }\n        30% { height: calc(30px + var(--eq-index) * 3px); }\n        50% { height: calc(80px + (var(--eq-index) - 12) * (var(--eq-index) - 12) * -0.8px); }\n        70% { height: calc(40px + var(--eq-index) * 2px); }\n      }\n\n      /* === PARTICLES VISUALIZER === */\n      .mp-visualizer-particles {\n        overflow: hidden;\n      }\n\n      .mp-visualizer-particles .mp-viz-particle {\n        position: absolute;\n        width: 8px;\n        height: 8px;\n        background: var(--visualizer-color);\n        border-radius: 50%;\n        opacity: 0;\n        box-shadow: 0 0 8px var(--visualizer-color);\n        animation: mp-viz-particle-rise 3s ease-in-out infinite;\n        animation-delay: calc(var(--particle-index) * 0.075s);\n        left: calc((var(--particle-index) / var(--particle-total)) * 100%);\n        bottom: 0;\n      }\n\n      @keyframes mp-viz-particle-rise {\n        0% {\n          transform: translateY(0) scale(0.5);\n          opacity: 0;\n        }\n        10% {\n          opacity: 1;\n        }\n        50% {\n          transform: translateY(-150px) scale(1);\n          opacity: 0.8;\n        }\n        100% {\n          transform: translateY(-300px) scale(0.3);\n          opacity: 0;\n        }\n      }\n\n      /* ============================\n         COMPACT LAYOUT\n         ============================ */\n      .media-player-compact .mp-compact-row {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .media-player-compact .mp-track-info {\n        flex: 1;\n        min-width: 0;\n        overflow: hidden;\n      }\n\n      .media-player-compact .mp-track-title {\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      .media-player-compact .mp-track-artist {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      .media-player-compact .mp-quick-controls {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n      }\n\n      /* ============================\n         CARD LAYOUT\n         ============================ */\n      .media-player-card {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 12px;\n        text-align: center;\n      }\n\n      .media-player-card .mp-card-track-info {\n        width: 100%;\n        padding: 0 8px;\n      }\n\n      .media-player-card .mp-card-title {\n        font-size: 16px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      .media-player-card .mp-card-artist {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        margin-top: 2px;\n      }\n\n      .media-player-card .mp-card-album {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        opacity: 0.7;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        margin-top: 2px;\n        font-style: italic;\n      }\n\n      .media-player-card .mp-card-controls {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n      }\n\n      /* ============================\n         MINI LAYOUT\n         ============================ */\n      .media-player-mini {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 8px;\n      }\n\n      .media-player-mini .mp-mini-text {\n        flex: 1;\n        font-size: 13px;\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      /* ============================\n         ALBUM ART\n         ============================ */\n      .mp-album-art {\n        position: relative;\n        flex-shrink: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: var(--secondary-background-color);\n        overflow: hidden;\n        z-index: 2;\n      }\n\n      .mp-album-art img {\n        width: 100%;\n        height: 100%;\n        object-fit: cover;\n      }\n\n      .mp-album-art ha-icon {\n        color: var(--secondary-text-color);\n      }\n\n      .mp-album-art-card {\n        max-width: 100%;\n      }\n\n      /* ============================\n         CONTROL BUTTONS\n         ============================ */\n      .mp-control-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: none;\n        border-radius: 50%;\n        background: transparent;\n        color: var(--primary-text-color);\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .mp-control-btn:hover {\n        background: var(--secondary-background-color);\n        color: var(--primary-color);\n      }\n\n      .mp-control-btn:active {\n        transform: scale(0.95);\n      }\n\n      .mp-control-btn.mp-btn-active {\n        color: var(--primary-color);\n      }\n\n      .mp-control-btn.mp-btn-muted {\n        color: var(--disabled-text-color);\n      }\n\n      .mp-control-btn-large {\n        width: 52px;\n        height: 52px;\n        background: var(--primary-color);\n        color: white;\n      }\n\n      .mp-control-btn-large:hover {\n        background: var(--primary-color);\n        filter: brightness(1.1);\n        color: white;\n      }\n\n      .mp-control-btn-large ha-icon {\n        --mdc-icon-size: 28px;\n        color: white;\n        display: flex;\n      }\n\n      .mp-expand-btn {\n        width: 32px;\n        height: 32px;\n      }\n\n      /* ============================\n         PROGRESS BAR\n         ============================ */\n      .mp-progress-container {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        width: 100%;\n        padding: 4px 0;\n      }\n\n      .mp-progress-compact {\n        padding: 0;\n        margin-top: 8px;\n      }\n\n      .mp-progress-bar {\n        flex: 1;\n        height: 4px;\n        border-radius: 2px;\n        cursor: pointer;\n        overflow: hidden;\n        transition: height 0.2s ease;\n      }\n\n      .mp-progress-bar:hover {\n        height: 6px;\n      }\n\n      .mp-progress-compact .mp-progress-bar {\n        height: 3px;\n      }\n\n      .mp-progress-compact .mp-progress-bar:hover {\n        height: 4px;\n      }\n\n      .mp-progress-fill {\n        height: 100%;\n        border-radius: 2px;\n        transition: width 0.1s linear;\n      }\n\n      .mp-time {\n        font-size: 11px;\n        color: var(--secondary-text-color);\n        min-width: 35px;\n        text-align: center;\n      }\n\n      /* ============================\n         VOLUME CONTROL\n         ============================ */\n      .mp-volume-control {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        width: 100%;\n        padding: 4px 0;\n      }\n\n      .mp-volume-icon {\n        color: var(--secondary-text-color);\n        --mdc-icon-size: 20px;\n      }\n\n      .mp-volume-btn {\n        width: 32px;\n        height: 32px;\n      }\n\n      .mp-volume-slider {\n        flex: 1;\n        height: 4px;\n        -webkit-appearance: none;\n        appearance: none;\n        background: linear-gradient(\n          to right,\n          var(--progress-color, var(--primary-color)) 0%,\n          var(--progress-color, var(--primary-color)) var(--progress, 50%),\n          var(--bg-color, var(--divider-color)) var(--progress, 50%),\n          var(--bg-color, var(--divider-color)) 100%\n        );\n        border-radius: 2px;\n        cursor: pointer;\n      }\n\n      .mp-volume-slider::-webkit-slider-thumb {\n        -webkit-appearance: none;\n        appearance: none;\n        width: 12px;\n        height: 12px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);\n        transition: transform 0.1s ease;\n      }\n\n      .mp-volume-slider::-webkit-slider-thumb:hover {\n        transform: scale(1.2);\n      }\n\n      .mp-volume-slider::-moz-range-thumb {\n        width: 12px;\n        height: 12px;\n        border-radius: 50%;\n        background: var(--primary-color);\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);\n      }\n\n      .mp-volume-value {\n        font-size: 11px;\n        color: var(--secondary-text-color);\n        min-width: 35px;\n        text-align: right;\n      }\n\n      /* ============================\n         SOURCE/SOUND MODE SELECTOR\n         ============================ */\n      .mp-source-selector {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        width: 100%;\n        padding: 4px 0;\n      }\n\n      .mp-source-icon {\n        color: var(--secondary-text-color);\n        --mdc-icon-size: 20px;\n        flex-shrink: 0;\n      }\n\n      .mp-spotify-icon {\n        color: #1DB954;\n      }\n\n      .mp-source-select {\n        flex: 1;\n        padding: 6px 10px;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        cursor: pointer;\n        outline: none;\n      }\n\n      .mp-source-select:focus {\n        border-color: var(--primary-color);\n      }\n\n      /* ============================\n         EXPANDED CONTROLS\n         ============================ */\n      .mp-expanded-controls {\n        margin-top: 12px;\n        padding-top: 12px;\n        border-top: 1px solid var(--divider-color);\n        animation: mp-expand-in 0.2s ease-out;\n      }\n\n      @keyframes mp-expand-in {\n        from {\n          opacity: 0;\n          transform: translateY(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      .mp-expanded-row {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        margin: 8px 0;\n      }\n    `}}}}]);