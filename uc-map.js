"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8544],{9998:(e,t,a)=>{a.r(t),a.d(t,{UltraMapModule:()=>d});var i=a(5183),o=a(8791),r=a(6478),n=a(7475),s=(a(7921),a(7655)),l=a(3481);class d extends n.m{constructor(){super(...arguments),this.mapInstances=new Map,this.initializingMaps=new Set,this.markersGroup=new Map,this.entityStateCache=new Map,this.lastUpdateTime=new Map,this.mapResizeObservers=new Map,this.metadata={type:"map",title:"Map",description:"Interactive map with custom markers and location tracking",author:"WJD Designs",version:"1.0.0",icon:"mdi:map",category:"content",tags:["map","location","tracking","markers","gps"]},this.expandedMarkers=new Set,this.draggedMarkerIndex=null}createDefault(e,t){return{id:e||this.generateId("map"),type:"map",map_provider:"openstreetmap",map_type:"roadmap",zoom:14,show_map_controls:!0,disable_zoom_scroll:!1,disable_touch_drag:!1,auto_zoom_entities:!1,markers:[{id:this.generateId("marker"),name:"My Location",type:"manual",latitude:37.2384841,longitude:-115.8250479,icon:"mdi:alien",icon_color:"var(--primary-color)",icon_size:20,marker_image_type:"icon"}],map_height:400,aspect_ratio:"16:9",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}renderGeneralTab(e,t,a,o){var n,s,l,d;const p=e,c=(null===(n=null==t?void 0:t.locale)||void 0===n?void 0:n.language)||"en",m=[{value:"openstreetmap",label:(0,r.kg)("editor.map.provider.osm",c,"OpenStreetMap (Free)")},{value:"google",label:(0,r.kg)("editor.map.provider.google",c,"Google Maps")}],g=[{value:"roadmap",label:(0,r.kg)("editor.map.type.roadmap",c,"Roadmap")},{value:"satellite",label:(0,r.kg)("editor.map.type.satellite",c,"Satellite")},{value:"hybrid",label:(0,r.kg)("editor.map.type.hybrid",c,"Hybrid")},{value:"terrain",label:(0,r.kg)("editor.map.type.terrain",c,"Terrain")}],u=[{value:"roadmap",label:(0,r.kg)("editor.map.type.osm_standard",c,"Standard")},{value:"cycle",label:(0,r.kg)("editor.map.type.osm_cycle",c,"Cycle Map")},{value:"transport",label:(0,r.kg)("editor.map.type.osm_transport",c,"Transport")},{value:"humanitarian",label:(0,r.kg)("editor.map.type.osm_humanitarian",c,"Humanitarian")}],h="google"===p.map_provider?g:u;return i.qy`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Map Provider Selection -->
        ${this.renderSettingsSection((0,r.kg)("editor.map.provider.title",c,"Map Provider"),(0,r.kg)("editor.map.provider.desc",c,"Choose your map provider"),[{title:(0,r.kg)("editor.map.provider.select",c,"Map Provider"),description:(0,r.kg)("editor.map.provider.select_desc",c,"OpenStreetMap is free and requires no API key. Google Maps offers more features but requires an API key."),hass:t,data:{map_provider:p.map_provider||"openstreetmap"},schema:[this.selectField("map_provider",m)],onChange:e=>{e.detail.value.map_provider!==(p.map_provider||"openstreetmap")&&(o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}}])}

        <!-- Google Maps API Key (only for Google Maps) -->
        ${"google"===p.map_provider?i.qy`
              <div
                style="margin-bottom: 24px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 4px;"
              >
                <div
                  style="font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);"
                >
                  ${(0,r.kg)("editor.map.google_api_key",c,"Google Maps API Key (Optional)")}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,r.kg)("editor.map.google_api_key_desc",c,"Enter your Google Maps API key for full JavaScript API features. Without a key, basic tile layers are used (limited features).")}
                </div>
                <ha-textfield
                  .value=${p.google_api_key||""}
                  placeholder="AIzaSy..."
                  type="password"
                  @input=${e=>{const t=e.target.value;o({google_api_key:t})}}
                  style="width: 100%;"
                >
                  <ha-icon icon="mdi:key" slot="leadingIcon"></ha-icon>
                </ha-textfield>
                <div
                  style="font-size: 12px; margin-top: 8px; color: var(--secondary-text-color); opacity: 0.7;"
                >
                  <a
                    href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                    target="_blank"
                    style="color: var(--primary-color); text-decoration: none;"
                  >
                    ${(0,r.kg)("editor.map.how_to_get_api_key",c,"How to get a Google Maps API Key →")}
                  </a>
                </div>
              </div>
            `:""}

        <!-- Map Style Selection -->
        ${this.renderSettingsSection((0,r.kg)("editor.map.style.title",c,"Map Style"),(0,r.kg)("editor.map.style.desc",c,"Choose the visual style of the map"),[{title:(0,r.kg)("editor.map.style.select",c,"Map Style"),description:(0,r.kg)("editor.map.style.select_desc",c,"google"===p.map_provider?"Choose the visual style for Google Maps":"OpenStreetMap uses standard roadmap style"),hass:t,data:{map_type:p.map_type||"roadmap"},schema:[this.selectField("map_type",h)],onChange:e=>{e.detail.value.map_type!==(p.map_type||"roadmap")&&(o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}}])}

        <!-- Zoom Settings -->
        ${this.renderSettingsSection((0,r.kg)("editor.map.zoom.title",c,"Zoom Settings"),(0,r.kg)("editor.map.zoom.desc",c,"Control map zoom level and auto-fit behavior"),[{title:(0,r.kg)("editor.map.zoom.level",c,"Zoom Level"),description:(0,r.kg)("editor.map.zoom.level_desc",c,"Manual zoom level (1-20). Lower values show more area."),hass:t,data:{zoom:p.zoom||14},schema:[{name:"zoom",label:`${(0,r.kg)("editor.map.zoom.level",c,"Zoom Level")}: ${p.zoom||14}`,selector:{number:{min:1,max:20,step:1,mode:"slider"}}}],onChange:e=>{o({zoom:e.detail.value.zoom}),setTimeout((()=>this.triggerPreviewUpdate()),50)}},{title:(0,r.kg)("editor.map.zoom.auto",c,"Auto-Zoom to Fit Entities"),description:(0,r.kg)("editor.map.zoom.auto_desc",c,"Automatically calculate zoom and center to show all entity markers. Manual zoom acts as a maximum zoom level (you can zoom out further for context)."),hass:t,data:{auto_zoom_entities:p.auto_zoom_entities||!1},schema:[this.booleanField("auto_zoom_entities")],onChange:e=>{o({auto_zoom_entities:e.detail.value.auto_zoom_entities}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}

        <!-- Manual Center Coordinates -->
        ${this.renderSettingsSection((0,r.kg)("editor.map.center.title",c,"Map Center"),(0,r.kg)("editor.map.center.desc",c,"Manually set the map center coordinates. Leave empty to use first marker or auto-zoom."),[{title:(0,r.kg)("editor.map.center.latitude",c,"Center Latitude"),description:(0,r.kg)("editor.map.center.latitude_desc",c,"Latitude coordinate for map center (-90 to 90)"),hass:t,data:{manual_center_latitude:null!==(s=p.manual_center_latitude)&&void 0!==s?s:null},schema:[{name:"manual_center_latitude",label:(0,r.kg)("editor.map.center.latitude",c,"Center Latitude"),selector:{number:{min:-90,max:90,step:1e-6,mode:"box"}}}],onChange:e=>{const t=e.detail.value.manual_center_latitude;o({manual_center_latitude:t||void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}},{title:(0,r.kg)("editor.map.center.longitude",c,"Center Longitude"),description:(0,r.kg)("editor.map.center.longitude_desc",c,"Longitude coordinate for map center (-180 to 180)"),hass:t,data:{manual_center_longitude:null!==(l=p.manual_center_longitude)&&void 0!==l?l:null},schema:[{name:"manual_center_longitude",label:(0,r.kg)("editor.map.center.longitude",c,"Center Longitude"),selector:{number:{min:-180,max:180,step:1e-6,mode:"box"}}}],onChange:e=>{const t=e.detail.value.manual_center_longitude;o({manual_center_longitude:t||void 0}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}])}

        <!-- Map Controls -->
        ${this.renderSettingsSection((0,r.kg)("editor.map.controls.title",c,"Map Controls"),(0,r.kg)("editor.map.controls.desc",c,"Configure map interaction controls"),[{title:(0,r.kg)("editor.map.controls.show",c,"Show Map Controls"),description:(0,r.kg)("editor.map.controls.show_desc",c,"Display zoom, pan, and other map controls"),hass:t,data:{show_map_controls:null===(d=p.show_map_controls)||void 0===d||d},schema:[this.booleanField("show_map_controls")],onChange:e=>o({show_map_controls:e.detail.value.show_map_controls})},{title:(0,r.kg)("editor.map.controls.disable_scroll",c,"Disable Zoom on Mouse Wheel Scroll"),description:(0,r.kg)("editor.map.controls.disable_scroll_desc",c,"Prevent accidental zooming when scrolling the page"),hass:t,data:{disable_zoom_scroll:p.disable_zoom_scroll||!1},schema:[this.booleanField("disable_zoom_scroll")],onChange:e=>o({disable_zoom_scroll:e.detail.value.disable_zoom_scroll})},{title:(0,r.kg)("editor.map.controls.disable_drag",c,"Disable Dragging on Touch Screens"),description:(0,r.kg)("editor.map.controls.disable_drag_desc",c,"Prevent map panning on mobile/touch devices"),hass:t,data:{disable_touch_drag:p.disable_touch_drag||!1},schema:[this.booleanField("disable_touch_drag")],onChange:e=>o({disable_touch_drag:e.detail.value.disable_touch_drag})}])}

        <!-- Map Dimensions -->
        ${this.renderSettingsSection((0,r.kg)("editor.map.dimensions.title",c,"Map Dimensions"),(0,r.kg)("editor.map.dimensions.desc",c,"Control map size and aspect ratio"),[{title:(0,r.kg)("editor.map.dimensions.aspect_ratio",c,"Aspect Ratio"),description:(0,r.kg)("editor.map.dimensions.aspect_ratio_desc",c,"Choose preset aspect ratio or use custom height"),hass:t,data:{aspect_ratio:p.aspect_ratio||"16:9"},schema:[this.selectField("aspect_ratio",[{value:"16:9",label:"16:9 (Widescreen)"},{value:"4:3",label:"4:3 (Standard)"},{value:"1:1",label:"1:1 (Square)"},{value:"custom",label:"Custom (Use Height)"}])],onChange:e=>{e.detail.value.aspect_ratio!==(p.aspect_ratio||"16:9")&&(o(e.detail.value),setTimeout((()=>this.triggerPreviewUpdate()),50))}},..."custom"===p.aspect_ratio?[{title:(0,r.kg)("editor.map.dimensions.height",c,"Map Height"),description:(0,r.kg)("editor.map.dimensions.height_desc",c,"Custom height in pixels"),hass:t,data:{map_height:p.map_height||400},schema:[{name:"map_height",label:(0,r.kg)("editor.map.dimensions.height",c,"Map Height"),selector:{number:{min:100,max:1e3,step:10,mode:"box",unit_of_measurement:"px"}}}],onChange:e=>o({map_height:e.detail.value.map_height})}]:[]])}

        <!-- Markers Section -->
        <div
          style="margin-top: 32px; padding-top: 24px; border-top: 2px solid var(--divider-color);"
        >
          <div style="margin-bottom: 24px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
            >
              <div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
                  ${(0,r.kg)("editor.map.markers.title",c,"Map Markers")}
                </div>
                <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
                  ${(0,r.kg)("editor.map.markers.desc",c,"Add custom markers or track entities with location data")}
                </div>
              </div>
              <mwc-button
                raised
                @click=${()=>{const e={id:this.generateId("marker"),name:"New Marker",type:"manual",latitude:37.2384841,longitude:-115.8250479,icon:"mdi:alien",icon_color:"var(--primary-color)",icon_size:20,marker_image_type:"icon"},t=[...p.markers||[],e];o({markers:t})}}
                style="--mdc-theme-primary: var(--primary-color);"
              >
                <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
                ${(0,r.kg)("editor.map.markers.add",c,"Add Marker")}
              </mwc-button>
            </div>
          </div>

          ${0===(p.markers||[]).length?i.qy`
                <div
                  style="text-align: center; padding: 48px 16px; color: var(--secondary-text-color); background: var(--secondary-background-color); border-radius: 8px; border: 2px dashed var(--divider-color);"
                >
                  <ha-icon
                    icon="mdi:map-marker-question"
                    style="font-size: 48px; opacity: 0.3; display: block; margin: 0 auto 16px;"
                  ></ha-icon>
                  <div style="font-size: 16px; margin-bottom: 8px;">
                    ${(0,r.kg)("editor.map.markers.empty",c,"No markers added yet")}
                  </div>
                  <div style="font-size: 13px; opacity: 0.7;">
                    ${(0,r.kg)("editor.map.markers.empty_desc",c,'Click "Add Marker" to create your first map marker')}
                  </div>
                </div>
              `:i.qy`
                <div class="markers-list">
                  ${(p.markers||[]).map(((e,i)=>this.renderMarkerEditor(e,i,p,t,o,a)))}
                </div>
              `}
        </div>
      </div>
    `}renderMarkerEditor(e,t,a,o,n,s){var l;const d=(null===(l=null==o?void 0:o.locale)||void 0===l?void 0:l.language)||"en",p=()=>{const t=Object.assign(Object.assign({},e),{id:this.generateId("marker"),name:`${e.name} Copy`}),i=[...a.markers||[],t];n({markers:i})},c=(e,t)=>{const i=[...a.markers||[]],[o]=i.splice(e,1);i.splice(t,0,o),n({markers:i})};return(0,r.kg)("editor.map.marker.type.manual",d,"Manual Position"),(0,r.kg)("editor.map.marker.type.entity",d,"Entity Tracker"),(0,r.kg)("editor.map.marker.display.icon",d,"Icon"),(0,r.kg)("editor.map.marker.display.custom_image",d,"Custom Image"),(0,r.kg)("editor.map.marker.display.entity_image",d,"Entity Image"),i.qy`
      <div
        class="marker-item"
        style="margin-bottom: 24px; background: var(--secondary-background-color); border-radius: 8px; border: 1px solid var(--divider-color); overflow: hidden;"
        data-marker-id="${e.id}"
        data-marker-index="${t}"
        @dragover=${e=>this.handleMarkerDragOver(e)}
        @dragenter=${e=>this.handleMarkerDragEnter(e)}
        @dragleave=${e=>this.handleMarkerDragLeave(e)}
        @drop=${e=>this.handleMarkerDrop(e,t,c)}
      >
        <div
          class="marker-header"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(var(--rgb-primary-color), 0.05); border-bottom: 1px solid var(--divider-color); cursor: pointer;"
          @click=${e=>this.toggleMarkerHeader(e)}
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <div
              class="drag-handle"
              style="padding: 8px; margin: -8px; cursor: grab; border-radius: 4px; transition: background-color 0.2s ease;"
              draggable="true"
              @dragstart=${e=>this.handleMarkerDragStart(e,t)}
              @dragend=${e=>this.handleMarkerDragEnd(e)}
              @click=${e=>e.stopPropagation()}
              @mousedown=${e=>e.stopPropagation()}
              .title=${(0,r.kg)("editor.map.marker.drag",d,"Drag to reorder")}
              @mouseenter=${e=>{e.target.style.backgroundColor="rgba(var(--rgb-primary-color), 0.1)"}}
              @mouseleave=${e=>{e.target.style.backgroundColor="transparent"}}
            >
              <ha-icon
                icon="mdi:drag"
                style="color: var(--secondary-text-color); pointer-events: none;"
              ></ha-icon>
            </div>
            <div style="font-weight: 600; color: var(--primary-text-color);">
              ${e.name||`Marker ${t+1}`}
            </div>
            ${"entity"===e.type?i.qy`<ha-icon
                  icon="mdi:map-marker-account"
                  style="color: var(--primary-color);"
                ></ha-icon>`:i.qy`<ha-icon
                  icon="mdi:map-marker"
                  style="color: var(--primary-color);"
                ></ha-icon>`}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <ha-icon-button
              @click=${e=>{e.stopPropagation(),p()}}
              .title=${(0,r.kg)("editor.map.marker.duplicate",d,"Duplicate marker")}
            >
              <ha-icon icon="mdi:content-duplicate"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${e=>{e.stopPropagation(),(()=>{const e=[...a.markers||[]];e.splice(t,1),n({markers:e})})()}}
              .title=${(0,r.kg)("editor.map.marker.delete",d,"Delete marker")}
              .disabled=${(a.markers||[]).length<=1}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
            <ha-icon
              class="expand-caret"
              icon="mdi:chevron-down"
              style="color: var(--secondary-text-color); transition: transform 0.2s ease; transform: ${this.expandedMarkers.has(e.id)?"rotate(180deg)":"rotate(0deg)"}; cursor: pointer; padding: 8px; margin: -8px;"
              @click=${e=>{e.stopPropagation();const t=e.target,a=t.closest(".marker-item"),i=null==a?void 0:a.querySelector(".marker-content");if(a&&i&&t){const e=a.getAttribute("data-marker-id")||"";this.expandedMarkers.has(e)?(this.expandedMarkers.delete(e),i.style.display="none",t.style.transform="rotate(0deg)"):(this.expandedMarkers.add(e),i.style.display="block",t.style.transform="rotate(180deg)")}}}
            ></ha-icon>
          </div>
        </div>

        <div
          class="marker-content"
          style="padding: 16px; display: ${this.expandedMarkers.has(e.id)?"block":"none"};"
        >
          ${this.renderMarkerConfiguration(e,o,(i=>{if(!Object.entries(i).some((([t,a])=>{const i=e[t];return!(i===a||"number"==typeof i&&"number"==typeof a&&(Number.isNaN(i)&&Number.isNaN(a)||i===a))})))return;const o=[...a.markers||[]];o[t]=Object.assign(Object.assign({},e),i);const r=()=>{n({markers:o}),setTimeout((()=>this.triggerPreviewUpdate()),50)};1===Object.keys(i).length&&Object.prototype.hasOwnProperty.call(i,"icon_size")?setTimeout(r,50):r()}),a,s)}
        </div>
      </div>
    `}renderMarkerConfiguration(e,t,a,o,n){var s,l,d,p;const c=(null===(s=null==t?void 0:t.locale)||void 0===s?void 0:s.language)||"en",m=[{value:"manual",label:(0,r.kg)("editor.map.marker.type.manual",c,"Manual Position")},{value:"entity",label:(0,r.kg)("editor.map.marker.type.entity",c,"Entity Tracker")}],g=[{value:"icon",label:(0,r.kg)("editor.map.marker.display.icon",c,"Icon")},{value:"custom_image",label:(0,r.kg)("editor.map.marker.display.custom_image",c,"Custom Image")},{value:"entity_image",label:(0,r.kg)("editor.map.marker.display.entity_image",c,"Entity Image")}];return i.qy`
      <!-- Marker Name -->
      <div class="field-group" style="margin-bottom: 16px;">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${(0,r.kg)("editor.map.marker.name",c,"Marker Name")}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
        >
          ${(0,r.kg)("editor.map.marker.name_desc",c,"Display name for this marker")}
        </div>
        <ha-textfield
          .value=${e.name||""}
          placeholder=${(0,r.kg)("editor.map.marker.name_placeholder",c,"Enter marker name")}
          @input=${e=>{var t;const i=e.target,o=(null===(t=i.shadowRoot)||void 0===t?void 0:t.querySelector("input"))||i,r=i.value,n=o.selectionStart,s=o.selectionEnd;a({name:r}),requestAnimationFrame((()=>{o&&"number"==typeof n&&(i.value=r,o.value=r,o.setSelectionRange(n,s||n))}))}}
          style="width: 100%;"
        ></ha-textfield>
      </div>

      <!-- Marker Type -->
      <div class="field-group" style="margin-bottom: 16px;">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${(0,r.kg)("editor.map.marker.type_label",c,"Marker Type")}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
        >
          ${(0,r.kg)("editor.map.marker.type_desc",c,"Choose marker position source")}
        </div>
        ${this.renderUcForm(t,{type:e.type||"manual"},[this.selectField("type",m)],(t=>{const i=t.detail.value.type,o=e.type||"manual";i&&i!==o&&a({type:i})}),!1)}
      </div>

      <!-- Manual Position Fields -->
      ${"manual"===e.type?i.qy`
            <div
              class="field-group"
              style="margin-bottom: 16px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 4px;"
            >
              <div style="font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);">
                ${(0,r.kg)("editor.map.marker.manual_position",c,"Manual Position")}
              </div>

              <!-- Latitude -->
              <div style="margin-bottom: 12px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${(0,r.kg)("editor.map.marker.latitude",c,"Latitude")}
                </div>
                <ha-textfield
                  .value=${(null===(l=e.latitude)||void 0===l?void 0:l.toString())||""}
                  type="number"
                  inputmode="decimal"
                  min="-90"
                  max="90"
                  step="any"
                  placeholder="40.7128"
                  @input=${e=>{const t=parseFloat(e.target.value);isNaN(t)||a({latitude:t})}}
                  style="width: 100%;"
                >
                  <span slot="suffix">°</span>
                </ha-textfield>
                <div
                  style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                >
                  ${(0,r.kg)("editor.map.marker.latitude_range",c,"Range: -90 to 90")}
                </div>
              </div>

              <!-- Longitude -->
              <div>
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${(0,r.kg)("editor.map.marker.longitude",c,"Longitude")}
                </div>
                <ha-textfield
                  .value=${(null===(d=e.longitude)||void 0===d?void 0:d.toString())||""}
                  type="number"
                  inputmode="decimal"
                  min="-180"
                  max="180"
                  step="any"
                  placeholder="-74.006"
                  @input=${e=>{const t=parseFloat(e.target.value);isNaN(t)||a({longitude:t})}}
                  style="width: 100%;"
                >
                  <span slot="suffix">°</span>
                </ha-textfield>
                <div
                  style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                >
                  ${(0,r.kg)("editor.map.marker.longitude_range",c,"Range: -180 to 180")}
                </div>
              </div>
            </div>
          `:""}

      <!-- Entity Tracker Field -->
      ${"entity"===e.type?i.qy`
            <div
              class="field-group"
              style="margin-bottom: 16px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.05); border-left: 3px solid var(--primary-color); border-radius: 4px;"
            >
              <div style="font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);">
                ${(0,r.kg)("editor.map.marker.entity_tracker",c,"Entity Tracker")}
              </div>
              ${this.renderSettingsSection("","",[{title:(0,r.kg)("editor.map.marker.entity",c,"Entity"),description:(0,r.kg)("editor.map.marker.entity_desc",c,"Select a device_tracker, person, or any entity with location data"),hass:t,data:{entity:e.entity||""},schema:[{name:"entity",selector:{entity:{domain:["device_tracker","person","zone"]}}}],onChange:e=>{a({entity:e.detail.value.entity})}}])}
            </div>
          `:""}

      <!-- Visual Settings -->
      <div class="field-group" style="margin-bottom: 16px;">
        <div
          style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--primary-text-color);"
        >
          ${(0,r.kg)("editor.map.marker.visual",c,"Visual Settings")}
        </div>

        <!-- Marker Display Type -->
        <div style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">
            ${(0,r.kg)("editor.map.marker.display_type",c,"Marker Display Type")}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
          >
            ${(0,r.kg)("editor.map.marker.display_type_desc",c,"Choose how the marker appears")}
          </div>
          ${this.renderUcForm(t,{marker_image_type:e.marker_image_type||"icon"},[this.selectField("marker_image_type",g)],(e=>a({marker_image_type:e.detail.value.marker_image_type})),!1)}
        </div>

        <!-- Icon Settings -->
        ${"icon"!==e.marker_image_type&&e.marker_image_type?"":i.qy`
              <div style="margin-top: 16px;">
                <div style="margin-bottom: 12px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${(0,r.kg)("editor.map.marker.icon",c,"Marker Icon")}
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-bottom: 8px; opacity: 0.7;"
                  >
                    ${(0,r.kg)("editor.map.marker.icon_optional",c,"Optional - Leave empty for solid color teardrop")}
                  </div>
                  <ha-icon-picker
                    .hass=${t}
                    .value=${e.icon||""}
                    @value-changed=${e=>{a({icon:e.detail.value})}}
                  ></ha-icon-picker>
                </div>

                <div style="margin-bottom: 12px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${(0,r.kg)("editor.map.marker.icon_color",c,"Icon Color")}
                  </div>
                  <ultra-color-picker
                    .value=${e.icon_color||"var(--primary-color)"}
                    @value-changed=${e=>{a({icon_color:e.detail.value})}}
                  ></ultra-color-picker>
                </div>

                <div>
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${(0,r.kg)("editor.map.marker.icon_size",c,"Icon Size")}
                  </div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="64"
                      step="1"
                      .value="${e.icon_size||20}"
                      @input=${e=>{const t=e.target,i=parseInt(t.value);a({icon_size:i})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="64"
                      step="1"
                      .value="${e.icon_size||20}"
                      @input=${e=>{const t=e.target,i=parseInt(t.value);isNaN(i)||a({icon_size:i})}}
                    />
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                  >
                    ${(0,r.kg)("editor.map.marker.icon_size_range",c,"Range: 8 to 64 pixels")}
                  </div>
                </div>
              </div>
            `}

        <!-- Custom Image Settings -->
        ${"custom_image"===e.marker_image_type?i.qy`
              <div style="margin-top: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${(0,r.kg)("editor.map.marker.custom_image",c,"Custom Image")}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,r.kg)("editor.map.marker.custom_image_desc",c,"Upload an image or enter an image URL")}
                </div>
                <ha-textfield
                  .value=${e.marker_image||""}
                  placeholder="https://example.com/marker.png"
                  @input=${e=>{const t=e.target.value;a({marker_image:t})}}
                  style="width: 100%; margin-bottom: 12px;"
                >
                  <ha-icon icon="mdi:image" slot="leadingIcon"></ha-icon>
                </ha-textfield>

                <div>
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${(0,r.kg)("editor.map.marker.image_size",c,"Image Size")}
                  </div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="128"
                      step="1"
                      .value="${e.icon_size||32}"
                      @input=${e=>{const t=e.target,i=parseInt(t.value);a({icon_size:i})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="128"
                      step="1"
                      .value="${e.icon_size||32}"
                      @input=${e=>{const t=e.target,i=parseInt(t.value);isNaN(i)||a({icon_size:i})}}
                    />
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                  >
                    ${(0,r.kg)("editor.map.marker.image_size_range",c,"Range: 8 to 128 pixels")}
                  </div>
                </div>
              </div>
            `:""}

        <!-- Entity Image Settings -->
        ${"entity_image"===e.marker_image_type?i.qy`
              <div style="margin-top: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                >
                  ${(0,r.kg)("editor.map.marker.use_entity_picture",c,"Use Entity Picture")}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  ${(0,r.kg)("editor.map.marker.use_entity_picture_desc",c,"Use the entity_picture attribute from the tracked entity")}
                </div>
                ${this.renderUcForm(t,{use_entity_picture:null===(p=e.use_entity_picture)||void 0===p||p},[this.booleanField("use_entity_picture")],(e=>a({use_entity_picture:e.detail.value.use_entity_picture})),!1)}

                <div style="margin-top: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 500; margin-bottom: 4px;"
                  >
                    ${(0,r.kg)("editor.map.marker.image_size",c,"Image Size")}
                  </div>
                  <div class="number-range-control">
                    <input
                      type="range"
                      class="range-slider"
                      min="8"
                      max="128"
                      step="1"
                      .value="${e.icon_size||32}"
                      @input=${e=>{const t=e.target,i=parseInt(t.value);a({icon_size:i})}}
                    />
                    <input
                      type="number"
                      class="range-input"
                      min="8"
                      max="128"
                      step="1"
                      .value="${e.icon_size||32}"
                      @input=${e=>{const t=e.target,i=parseInt(t.value);isNaN(i)||a({icon_size:i})}}
                    />
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; opacity: 0.7;"
                  >
                    ${(0,r.kg)("editor.map.marker.image_size_range",c,"Range: 8 to 128 pixels")}
                  </div>
                </div>
              </div>
            `:""}
      </div>
    `}handleMarkerDragStart(e,t){this.draggedMarkerIndex=t,e.dataTransfer&&(e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/html","")),e.currentTarget.style.opacity="0.5"}handleMarkerDragEnd(e){e.currentTarget.style.opacity="1",this.draggedMarkerIndex=null,document.querySelectorAll(".marker-item").forEach((e=>{e.style.borderTop="",e.style.borderBottom=""}))}handleMarkerDragOver(e){e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move")}handleMarkerDragEnter(e){const t=e.currentTarget.closest(".marker-item");if(t&&null!==this.draggedMarkerIndex){const e=parseInt(t.getAttribute("data-marker-index")||"0");e!==this.draggedMarkerIndex&&(t.style.borderTop=e<this.draggedMarkerIndex?"2px solid var(--primary-color)":"",t.style.borderBottom=e>this.draggedMarkerIndex?"2px solid var(--primary-color)":"")}}handleMarkerDragLeave(e){const t=e.currentTarget.closest(".marker-item");t&&(t.style.borderTop="",t.style.borderBottom="")}handleMarkerDrop(e,t,a){e.preventDefault(),e.stopPropagation();const i=e.currentTarget.closest(".marker-item");i&&(i.style.borderTop="",i.style.borderBottom=""),null!==this.draggedMarkerIndex&&this.draggedMarkerIndex!==t&&a(this.draggedMarkerIndex,t),this.draggedMarkerIndex=null}toggleMarkerHeader(e){const t=e.currentTarget,a=t.closest(".marker-item"),i=null==a?void 0:a.querySelector(".marker-content"),o=t.querySelector(".expand-caret");if(a&&i&&o){const e=a.getAttribute("data-marker-id")||"";this.expandedMarkers.has(e)?(this.expandedMarkers.delete(e),i.style.display="none",o.style.transform="rotate(0deg)"):(this.expandedMarkers.add(e),i.style.display="block",o.style.transform="rotate(180deg)")}}getEffectiveMapProvider(e){const t=e.map_provider||"openstreetmap",a=e.map_type||"roadmap";if("google"!==t)return{provider:t,mapType:a};const i=(e.google_api_key||"").trim();return i===s.Bo||i.toLowerCase().startsWith("***")?{provider:"openstreetmap",mapType:"roadmap"}:{provider:"google",mapType:a}}extractCoordinates(e,t){const a=t.states[e];if(!a)return null;const i=a.attributes;let o,r;if(void 0!==i.latitude&&void 0!==i.longitude)o=i.latitude,r=i.longitude;else if(void 0!==i.Location)if(Array.isArray(i.Location)){if(i.Location.length>=2){const e=parseFloat(i.Location[0]),t=parseFloat(i.Location[1]);isNaN(e)||isNaN(t)||(o=e,r=t)}}else if("string"==typeof i.Location){const e=i.Location.split(",").map((e=>parseFloat(e.trim())));2!==e.length||isNaN(e[0])||isNaN(e[1])||(o=e[0],r=e[1])}return void 0!==o&&void 0!==r?{latitude:o,longitude:r}:null}_trackEntityChanges(e,t,a){var i;const o=(null===(i=e.markers)||void 0===i?void 0:i.filter((e=>"entity"===e.type&&e.entity)))||[];if(0===o.length)return;let r=!1;const n=Date.now();if(!(n-(this.lastUpdateTime.get(t)||0)<2e3)){for(const e of o){if(!e.entity)continue;if(!(null==a?void 0:a.states[e.entity]))continue;const i=this.extractCoordinates(e.entity,a),o=i?`${i.latitude},${i.longitude}`:"unknown",n=`${t}_${e.entity}`;this.entityStateCache.get(n)!==o&&(this.entityStateCache.set(n,o),r=!0)}if(r){this.lastUpdateTime.set(t,n);const i=this.mapInstances.get(t);i&&i._container&&this.updateExistingMap(i,e,a)}}}calculateAutoZoom(e,t){const a=[];for(const i of e)if("entity"===i.type&&i.entity){const e=this.extractCoordinates(i.entity,t);e&&a.push(e)}return 0===a.length?null:{bounds:l.latLngBounds(a.map((e=>l.latLng(e.latitude,e.longitude))))}}handleMapResize(e,t,a){const i=this.mapInstances.get(e);if(i&&i._container&&(i.invalidateSize(),t.auto_zoom_entities&&t.markers&&t.markers.length>0)){const e=this.calculateAutoZoom(t.markers,a);e&&i.fitBounds(e.bounds,{padding:[50,50],maxZoom:t.zoom||14,animate:!0})}}renderPreview(e,t,a,r){const n=e,s=r?`-${r}`:"",l=`map-${n.id}${s}`;r&&"dashboard"!==r||this._trackEntityChanges(n,l,t);let d=n.map_height||400;n.aspect_ratio&&"custom"!==n.aspect_ratio&&(d=400);const p=n.aspect_ratio&&"custom"!==n.aspect_ratio?`position: relative; width: 100%; height: 0; padding-bottom: ${{"16:9":"56.25%","4:3":"75%","1:1":"100%"}[n.aspect_ratio]}; overflow: hidden; border-radius: 8px;`:`width: 100%; height: ${d}px; position: relative; overflow: hidden; border-radius: 8px;`,c=n.aspect_ratio&&"custom"!==n.aspect_ratio?"position: absolute; top: 0; left: 0; width: 100%; height: 100%;":"width: 100%; height: 100%;";return i.qy`
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""
      />
      <style>
        .leaflet-container {
          font-family: var(--primary-font-family, inherit);
        }
        .leaflet-popup-content-wrapper {
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
        .leaflet-popup-tip {
          background: var(--card-background-color);
        }
        .custom-marker-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .custom-marker-icon ha-icon {
          --mdi-icon-size: 24px;
        }

        /* Ensure map panes don't overlay HA UI elements */
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
        .leaflet-overlay-pane {
          z-index: 1 !important;
        }
        .leaflet-shadow-pane {
          z-index: 1 !important;
        }
        .leaflet-marker-pane {
          z-index: 1 !important;
        }
        .leaflet-tooltip-pane {
          z-index: 1 !important;
        }
        .leaflet-popup-pane {
          z-index: 1 !important;
        }

        /* Ensure map controls don't overlay HA UI elements (sidebar, menus, etc.) */
        .leaflet-control-container {
          z-index: 1 !important;
        }
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-left,
        .leaflet-right {
          z-index: 1 !important;
        }
        .leaflet-control-zoom {
          z-index: 1 !important;
        }
        .leaflet-control-attribution {
          z-index: 1 !important;
        }
        .leaflet-control {
          z-index: 1 !important;
        }

        /* Range control styles from Bar module */
        .number-range-control {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .range-slider {
          flex: 1;
        }

        .range-input {
          width: 72px !important;
          max-width: 72px !important;
          min-width: 72px !important;
          padding: 4px 6px !important;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 13px;
          text-align: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .range-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
        }

        .range-input::-webkit-outer-spin-button,
        .range-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .range-input[type='number'] {
          -moz-appearance: textfield;
        }
        .custom-marker-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
      </style>
      <div
        class="map-container"
        style="${p} box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: box-shadow 0.2s ease;"
        @mouseenter=${e=>{e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.15)"}}
        @mouseleave=${e=>{e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.1)"}}
      >
        <div ${(0,o.K)((e=>{if(!e){const e=this.mapResizeObservers.get(l);return void(e&&(e.disconnect(),this.mapResizeObservers.delete(l)))}const a=e;if(a._ucMapInstance){const e=a._ucMapInstance;a._ucLastUpdate&&JSON.stringify(n)===a._ucLastUpdate||(a._ucLastUpdate=JSON.stringify(n),this.updateExistingMap(e,n,t))}else this.initializingMaps.has(l)||(this.initializingMaps.add(l),requestAnimationFrame((()=>{this.initializeLeafletMap(e,l,n,t),this.initializingMaps.delete(l)})))}))} id="${l}" style="${c}"></div>
      </div>
    `}initializeLeafletMap(e,t,a,i){var o,r,n;if(!e)return void this.initializingMaps.delete(t);if(0===e.offsetWidth||0===e.offsetHeight)return this.initializingMaps.delete(t),void setTimeout((()=>{this.mapInstances.has(t)||this.initializingMaps.has(t)||(this.initializingMaps.add(t),this.initializeLeafletMap(e,t,a,i))}),300);const s=this.mapInstances.get(t);s&&(s.remove(),this.mapInstances.delete(t));const d=this.mapResizeObservers.get(t);d&&(d.disconnect(),this.mapResizeObservers.delete(t));let p=null!==(o=a.manual_center_latitude)&&void 0!==o?o:40.7128,c=null!==(r=a.manual_center_longitude)&&void 0!==r?r:-74.006;const m=[];for(const e of a.markers||[]){let t,o;if("manual"===e.type)t=e.latitude,o=e.longitude;else if("entity"===e.type&&e.entity){const a=this.extractCoordinates(e.entity,i);a&&(t=a.latitude,o=a.longitude)}void 0!==t&&void 0!==o&&(m.push({lat:t,lon:o,marker:e}),1!==m.length||a.manual_center_latitude||a.manual_center_longitude||(p=t,c=o))}const g=a.zoom||14,u=a.auto_zoom_entities&&m.length>0,h=u?10:g;try{const o=l.map(e,{zoomControl:null===(n=a.show_map_controls)||void 0===n||n,scrollWheelZoom:!a.disable_zoom_scroll,dragging:!a.disable_touch_drag}).setView([p,c],h);this.mapInstances.set(t,o),e._ucMapInstance=o;const r=new ResizeObserver((()=>{this.handleMapResize(t,a,i)}));r.observe(e),this.mapResizeObservers.set(t,r),setTimeout((()=>{o.invalidateSize()}),100);const{provider:s,mapType:d}=this.getEffectiveMapProvider(a),y=`${s}-${d}`;let v;if("google"===s){const e={roadmap:"https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en",satellite:"https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&hl=en",hybrid:"https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en",terrain:"https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=en"};v=l.tileLayer(e[d]||e.roadmap,{attribution:"&copy; Google Maps",maxZoom:20,subdomains:["0","1","2","3"],detectRetina:!0,keepBuffer:2,updateWhenZooming:!1,updateWhenIdle:!0})}else{const e={standard:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",cycle:"https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",transport:"https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png",humanitarian:"https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"},t="roadmap"===d?"standard":d;v=l.tileLayer(e[t]||e.standard,{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19,detectRetina:!0,keepBuffer:2,updateWhenZooming:!1,updateWhenIdle:!0})}v.addTo(o),o._mapModuleTileLayer=v,o._mapModuleTileKey=y;const k=[];for(const{lat:e,lon:t,marker:a}of m){const e=this.addLeafletMarker(o,a,i);e&&k.push(e)}if(o._mapModuleMarkers=k,u){const e=this.calculateAutoZoom(a.markers||[],i);e&&o.fitBounds(e.bounds,{padding:[50,50],maxZoom:g,animate:!1})}}catch(e){}}updateAllMapsForModule(e,t,a){const i=`updating_${e}`;if(!this[i]){this[i]=!0;try{const i="map-"+e,o=this.mapInstances.get(i);o&&o._container&&this.updateExistingMap(o,t,a)}catch(e){}finally{setTimeout((()=>{this[i]=!1}),500)}}}updateExistingMap(e,t,a){const i=e;if(i._ucUpdating)i._ucUpdatePending=!0;else{i._ucUpdating=!0;try{const o=t.zoom||14;if(t.auto_zoom_entities&&t.markers&&t.markers.length>0){const i=this.calculateAutoZoom(t.markers,a);i&&e.fitBounds(i.bounds,{padding:[50,50],maxZoom:o,animate:!1})}else{let i=null;if(void 0!==t.manual_center_latitude&&void 0!==t.manual_center_longitude)i=l.latLng(t.manual_center_latitude,t.manual_center_longitude);else if(t.markers&&t.markers.length>0)for(const e of t.markers)if("entity"===e.type&&e.entity){const t=this.extractCoordinates(e.entity,a);if(t){i=l.latLng(t.latitude,t.longitude);break}}else if("manual"===e.type&&void 0!==e.latitude&&void 0!==e.longitude){i=l.latLng(e.latitude,e.longitude);break}i?e.setView(i,o,{animate:!1}):e.getZoom()!==o&&e.setZoom(o)}t.show_map_controls?i.zoomControl||e.addControl(l.control.zoom()):i.zoomControl&&e.removeControl(i.zoomControl);const r=i._mapModuleTileLayer,{provider:n,mapType:s}=this.getEffectiveMapProvider(t),d=`${n}-${s}`;if(r&&i._mapModuleTileKey!==d){let t;if("google"===n){const e={roadmap:"https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en",satellite:"https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&hl=en",hybrid:"https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en",terrain:"https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=en"};t=l.tileLayer(e[s]||e.roadmap,{attribution:"&copy; Google Maps",maxZoom:20,subdomains:["0","1","2","3"],detectRetina:!0,keepBuffer:2,updateWhenZooming:!1,updateWhenIdle:!0})}else{const e={standard:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",cycle:"https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",transport:"https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png",humanitarian:"https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"},a="roadmap"===s?"standard":s;t=l.tileLayer(e[a]||e.standard,{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19,detectRetina:!0,keepBuffer:2,updateWhenZooming:!1,updateWhenIdle:!0})}t.addTo(e),setTimeout((()=>{r&&e.hasLayer(r)&&e.removeLayer(r)}),100),i._mapModuleTileLayer=t,i._mapModuleTileKey=d}(i._mapModuleMarkers||[]).forEach((t=>{try{t&&e.hasLayer(t)&&e.removeLayer(t)}catch(e){}})),e.eachLayer((t=>{if(t instanceof l.Marker)try{e.removeLayer(t)}catch(e){}})),i._mapModuleMarkers=[],setTimeout((()=>{const o=[];for(const e of t.markers||[]){let t,i;if("manual"===e.type)t=e.latitude,i=e.longitude;else if("entity"===e.type&&e.entity){const o=this.extractCoordinates(e.entity,a);o&&(t=o.latitude,i=o.longitude)}void 0!==t&&void 0!==i&&o.push({lat:t,lon:i,marker:e})}const r=[];for(const{lat:t,lon:i,marker:n}of o)try{const t=this.addLeafletMarker(e,n,a);t&&r.push(t)}catch(e){}i._mapModuleMarkers=r}),100),setTimeout((()=>e.invalidateSize()),50)}catch(e){}finally{setTimeout((()=>{i._ucUpdating=!1,i._ucUpdatePending&&(i._ucUpdatePending=!1,this.updateExistingMap(e,t,a))}),0)}}}addLeafletMarker(e,t,a){var i;const o=this.extractCoordinates(t.entity||"",a)||{latitude:t.latitude,longitude:t.longitude};if(!o)return null;const r=l.latLng(o.latitude,o.longitude);let n;if("custom_image"===t.marker_image_type&&t.marker_image){const e=t.icon_size||32,a=Math.max(40,e+8),i=l.divIcon({html:`\n          <div style="\n            position: relative;\n            width: ${a}px;\n            height: ${a}px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n          ">\n            <img \n              src="${t.marker_image}" \n              style="\n                width: ${e}px;\n                height: ${e}px;\n                border-radius: 50%;\n                border: 2px solid white;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n                object-fit: cover;\n              "\n            />\n          </div>\n        `,iconSize:[a,a],iconAnchor:[a/2,a],popupAnchor:[0,-a],className:"",shadowUrl:null});n=l.marker(r,{icon:i})}else if("entity_image"===t.marker_image_type&&t.entity){const e=null==a?void 0:a.states[t.entity],o=null===(i=null==e?void 0:e.attributes)||void 0===i?void 0:i.entity_picture;if(o){const e=t.icon_size||32,a=Math.max(40,e+8),i=l.divIcon({html:`\n            <div style="\n              position: relative;\n              width: ${a}px;\n              height: ${a}px;\n              display: flex;\n              align-items: center;\n              justify-content: center;\n            ">\n              <img \n                src="${o}" \n                style="\n                  width: ${e}px;\n                  height: ${e}px;\n                  border-radius: 50%;\n                  border: 2px solid white;\n                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n                  object-fit: cover;\n                "\n              />\n            </div>\n          `,iconSize:[a,a],iconAnchor:[a/2,a],popupAnchor:[0,-a],className:"",shadowUrl:null});n=l.marker(r,{icon:i})}else n=l.marker(r)}else{const e=this.createIconMarker(t);n=l.marker(r,{icon:e});"icon"===(t.marker_image_type||"icon")&&t.icon&&""!==t.icon.trim()&&setTimeout((()=>{this._injectHaIconIntoMarker(n,t)}),0)}return t.name&&n.bindPopup(t.name),n.addTo(e),this.markersGroup.set(t.id,n),n}_injectHaIconIntoMarker(e,t){const a=e._icon;if(!a)return;const i=a.querySelector("[data-icon-placeholder]");if(!i)return;const o=document.createElement("ha-icon");o.setAttribute("icon",t.icon||"");const r=t.icon_color||"var(--primary-color)",n=2.5*(t.icon_size||20)*.8*.6;o.icon=t.icon||"",o.style.cssText=`\n      color: ${r} !important;\n      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));\n      font-size: ${n}px !important;\n      width: ${n}px !important;\n      height: ${n}px !important;\n      min-width: ${n}px !important;\n      min-height: ${n}px !important;\n      line-height: ${n}px !important;\n      --mdi-icon-size: ${n}px !important;\n      display: block !important;\n    `,i.innerHTML="",i.appendChild(o),this._applyIconSizingWithMutationObserver(o,n,r),this._applyIconSizingWithRetry(o,n,r)}_applyIconSizingWithRetry(e,t,a,i=0){if(i>=15)return void this._applyFallbackIconSizing(e,t,a);const o=30*Math.pow(1.3,i);setTimeout((()=>{if(e.shadowRoot){const i=["ha-svg-icon svg","svg","mdi-icon svg","iron-icon svg",".icon svg",'[part="icon"] svg'];let o=null;for(const t of i)if(o=e.shadowRoot.querySelector(t),o)break;if(o){o.style.cssText=`\n            width: ${t}px !important; \n            height: ${t}px !important;\n            color: ${a} !important;\n            display: block !important;\n            margin: 0 !important;\n            padding: 0 !important;\n          `,o.setAttribute("width",t.toString()),o.setAttribute("height",t.toString()),o.setAttribute("viewBox",o.getAttribute("viewBox")||"0 0 24 24"),o.querySelectorAll("path, circle, rect, polygon, line, polyline").forEach((e=>{e.style.cssText=`\n              fill: ${a} !important;\n              stroke: ${a} !important;\n            `}));const e=o.parentElement;e&&(e.style.cssText=`\n              width: ${t}px !important;\n              height: ${t}px !important;\n              display: flex !important;\n              align-items: center !important;\n              justify-content: center !important;\n            `)}else{const i=e.shadowRoot.querySelector("ha-svg-icon");i&&(i.style.cssText=`\n              width: ${t}px !important;\n              height: ${t}px !important;\n              color: ${a} !important;\n              display: block !important;\n            `,i.hasAttribute("size")&&i.setAttribute("size",t.toString()))}}else this._applyIconSizingWithRetry(e,t,a,i+1)}),o)}_applyFallbackIconSizing(e,t,a){e.style.cssText=`\n      width: ${t}px !important;\n      height: ${t}px !important;\n      color: ${a} !important;\n      display: block !important;\n      font-size: ${t}px !important;\n    `,e.hasAttribute("size")&&e.setAttribute("size",t.toString())}_applyIconSizingWithMutationObserver(e,t,a){if(e.shadowRoot)return void this._applyIconSizingToElement(e,t,a);const i=new MutationObserver((o=>{o.forEach((o=>{"childList"===o.type&&e.shadowRoot&&(this._applyIconSizingToElement(e,t,a),i.disconnect())}))}));i.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","style"]}),setTimeout((()=>{i.disconnect()}),5e3)}_applyIconSizingToElement(e,t,a){if(!e.shadowRoot)return!1;const i=["ha-svg-icon svg","svg","mdi-icon svg","iron-icon svg",".icon svg",'[part="icon"] svg'];let o=null;for(const t of i)if(o=e.shadowRoot.querySelector(t),o)break;if(o){o.style.cssText=`\n        width: ${t}px !important; \n        height: ${t}px !important;\n        color: ${a} !important;\n        display: block !important;\n        margin: 0 !important;\n        padding: 0 !important;\n      `,o.setAttribute("width",t.toString()),o.setAttribute("height",t.toString()),o.setAttribute("viewBox",o.getAttribute("viewBox")||"0 0 24 24"),o.querySelectorAll("path, circle, rect, polygon, line, polyline").forEach((e=>{e.style.cssText=`\n          fill: ${a} !important;\n          stroke: ${a} !important;\n        `}));const e=o.parentElement;return e&&(e.style.cssText=`\n          width: ${t}px !important;\n          height: ${t}px !important;\n          display: flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n        `),!0}const r=e.shadowRoot.querySelector("ha-svg-icon");return!!r&&(r.style.cssText=`\n        width: ${t}px !important;\n        height: ${t}px !important;\n        color: ${a} !important;\n        display: block !important;\n      `,r.hasAttribute("size")&&r.setAttribute("size",t.toString()),!0)}createIconMarker(e){const t=e.icon,a=e.icon_color||"var(--primary-color)",i=2.5*(e.icon_size||20),o=.8*i,r=.6*o,n=i;if(!t||""===t.trim())return l.divIcon({html:`\n          <div style="\n            position: relative;\n            width: ${i}px;\n            height: ${i}px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n          ">\n            <div style="\n              position: absolute;\n              width: ${o}px;\n              height: ${o}px;\n              background: ${a};\n              border-radius: 50% 50% 50% 0;\n              transform: rotate(-45deg);\n              box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n              border: 2px solid white;\n            "></div>\n          </div>\n        `,iconSize:[i,i],iconAnchor:[i/2,n],popupAnchor:[0,-n],className:"",shadowUrl:null});const s=`\n        <div style="\n          position: relative;\n          width: ${i}px;\n          height: ${i}px;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n        ">\n          <div style="\n            position: absolute;\n            width: ${o}px;\n            height: ${o}px;\n            background: white;\n            border-radius: 50% 50% 50% 0;\n            transform: rotate(-45deg);\n            box-shadow: 0 2px 8px rgba(0,0,0,0.3);\n            border: 2px solid ${a};\n          "></div>\n          <div\n            data-icon-placeholder\n            style="\n              position: absolute;\n              top: ${.3*o}px;\n              left: 50%;\n              transform: translateX(-50%);\n              width: ${r}px;\n              height: ${r}px;\n              display: flex;\n              align-items: center;\n              justify-content: center;\n              z-index: 1;\n            "\n          >\n            \x3c!-- ha-icon will be injected here --\x3e\n          </div>\n        </div>\n      `;return l.divIcon({html:s,iconSize:[i,i],iconAnchor:[i/2,n],popupAnchor:[0,-n],className:"",shadowUrl:null})}createMarkerPopup(e,t){var a,i;let o=`<div style="padding: 8px;"><strong>${e.name||"Marker"}</strong>`;if("entity"===e.type&&e.entity){const a=t.states[e.entity];a&&(o+=`<br><span style="font-size: 12px;">Entity: ${a.attributes.friendly_name||e.entity}</span>`,o+=`<br><span style="font-size: 12px;">State: ${a.state}</span>`)}else"manual"===e.type&&(o+=`<br><span style="font-size: 12px;">Lat: ${null===(a=e.latitude)||void 0===a?void 0:a.toFixed(6)}</span>`,o+=`<br><span style="font-size: 12px;">Lon: ${null===(i=e.longitude)||void 0===i?void 0:i.toFixed(6)}</span>`);return o+="</div>",o}getCardSize(e){const t=e.map_height||400;return Math.ceil(t/50)}validate(e){const t=[],a=e;return a.markers&&a.markers.length>0&&a.markers.forEach(((e,a)=>{"manual"===e.type?(void 0!==e.latitude&&(e.latitude<-90||e.latitude>90)&&t.push(`Marker ${a+1}: Invalid latitude value`),void 0!==e.longitude&&(e.longitude<-180||e.longitude>180)&&t.push(`Marker ${a+1}: Invalid longitude value`)):e.type})),{valid:0===t.length,errors:t}}}}}]);