"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[4383],{4383:(t,e,i)=>{i.r(e),i.d(e,{UltraGraphsModule:()=>v});var r=i(5183),o=i(7475),a=i(5320),n=i(9327),s=i(5121),l=i(5262),d=i(8869),c=i(5147),p=i(8938),h=i(8465),g=i(6477),u=(i(9009),i(7921),i(6990)),m=i(9760),y=i(6478),_=i(1001);class v extends o.m{constructor(){super(...arguments),this.metadata={type:"graphs",title:"Graphs",description:"Display interactive charts and graphs with Home Assistant data",author:"WJD Designs",version:"1.0.0",icon:"mdi:chart-line",category:"data",tags:["charts","graphs","data","visualization","statistics","analytics"]},this._updateInterval=null,this._historyData={},this._historyError={},this._historyLoading={},this._deferredHistoryScheduled={},this._templateResults={},this.clickTimeout=null,this.holdTimeout=null,this.isHolding=!1,this.expandedEntities=new Set,this.DEFAULT_COLORS=["#2196F3","#4CAF50","#FF9800","#F44336","#9C27B0","#00BCD4","#FFEB3B","#795548","#607D8B","#E91E63"],this.FORECAST_ATTRIBUTE_LABELS={temperature:"Temperature",precipitation:"Precipitation",wind_speed:"Wind Speed",humidity:"Humidity",pressure:"Pressure",cloud_coverage:"Cloud Coverage"},this.FORECAST_ATTRIBUTE_UNITS={temperature:"°",precipitation:"mm",wind_speed:"km/h",humidity:"%",pressure:"hPa",cloud_coverage:"%"}}_getCacheStore(){const t=window;if(!t.__ultraGraphsCache)try{const e=localStorage.getItem("__ultraGraphsCache");t.__ultraGraphsCache=e?JSON.parse(e):{}}catch(e){t.__ultraGraphsCache={}}return t.__ultraGraphsCache}_persistCacheStore(t){try{localStorage.setItem("__ultraGraphsCache",JSON.stringify(t))}catch(t){}}_makeCacheKey(t){return"forecast"===(t.data_source||"history")?`forecast::${t.forecast_entity}::${t.forecast_type}::${t.time_period}`:`history::${(t.entities||[]).filter((t=>t.entity)).map((t=>`${t.entity}|${t.attribute||"state"}`)).join(";")}::${t.time_period}`}_tryReadCache(t){const e=this._getCacheStore(),i=this._makeCacheKey(t),r=e[i];if(!r)return null;const o=Date.now();return r.expiresAt&&r.expiresAt>o&&r.data?r.data:(delete e[i],this._persistCacheStore(e),null)}_writeCache(t,e){const i=this._getCacheStore();i[this._makeCacheKey(t)]={expiresAt:Date.now()+3e5,data:e},this._persistCacheStore(i)}createDefault(t,e){return{id:t||this.generateId("graphs"),type:"graphs",name:"New Graph",data_source:"history",forecast_type:"hourly",forecast_entity:"",chart_type:"line",entities:[],time_period:"24h",title:"Chart",chart_width:"100%",chart_width_percent:100,chart_height:345,background_color:"transparent",show_title:!0,chart_alignment:"center",show_display_name:!0,show_entity_value:!0,info_position:"top_left",title_font_size:12,value_font_size:16,show_legend:!0,legend_position:"bottom_left",show_grid:!0,show_time_intervals:!1,smooth_curves:!0,show_tooltips:!0,show_slice_labels:!0,bar_display_limit:0,use_fixed_y_axis:!1,y_axis_min:void 0,y_axis_max:void 0,tap_action:void 0,hold_action:void 0,double_tap_action:void 0,template_mode:!1,template:"",display_mode:"always",display_conditions:[]}}getChartTypeOptions(t){return[{value:"line",label:(0,y.kg)("editor.graphs.types.line",t,"Line Chart")},{value:"bar",label:(0,y.kg)("editor.graphs.types.bar",t,"Bar Chart")},{value:"pie",label:(0,y.kg)("editor.graphs.types.pie",t,"Pie Chart")},{value:"donut",label:(0,y.kg)("editor.graphs.types.donut",t,"Donut Chart")}]}getTimePeriodOptions(t,e){const i="forecast"===e?"Next":"Last";return[{value:"1h",label:(0,y.kg)("editor.graphs.period.1h",t,`${i} Hour`)},{value:"3h",label:(0,y.kg)("editor.graphs.period.3h",t,`${i} 3 Hours`)},{value:"6h",label:(0,y.kg)("editor.graphs.period.6h",t,`${i} 6 Hours`)},{value:"12h",label:(0,y.kg)("editor.graphs.period.12h",t,`${i} 12 Hours`)},{value:"24h",label:(0,y.kg)("editor.graphs.period.24h",t,`${i} 24 Hours`)},{value:"2d",label:(0,y.kg)("editor.graphs.period.2d",t,`${i} 2 Days`)},{value:"7d",label:(0,y.kg)("editor.graphs.period.7d",t,`${i} Week`)},{value:"30d",label:(0,y.kg)("editor.graphs.period.30d",t,`${i} Month`)},{value:"90d",label:(0,y.kg)("editor.graphs.period.90d",t,`${i} 3 Months`)},{value:"365d",label:(0,y.kg)("editor.graphs.period.365d",t,`${i} Year`)}]}getAggregationOptions(t){return[{value:"mean",label:(0,y.kg)("editor.graphs.agg.mean",t,"Average")},{value:"sum",label:(0,y.kg)("editor.graphs.agg.sum",t,"Sum")},{value:"min",label:(0,y.kg)("editor.graphs.agg.min",t,"Minimum")},{value:"max",label:(0,y.kg)("editor.graphs.agg.max",t,"Maximum")},{value:"median",label:(0,y.kg)("editor.graphs.agg.median",t,"Median")},{value:"first",label:(0,y.kg)("editor.graphs.agg.first",t,"First Value")},{value:"last",label:(0,y.kg)("editor.graphs.agg.last",t,"Last Value")},{value:"count",label:(0,y.kg)("editor.graphs.agg.count",t,"Count")},{value:"delta",label:(0,y.kg)("editor.graphs.agg.delta",t,"Change")}]}getLegendPositionOptions(t){return[{value:"top",label:(0,y.kg)("editor.graphs.position.top",t,"Top")},{value:"bottom",label:(0,y.kg)("editor.graphs.position.bottom",t,"Bottom")},{value:"left",label:(0,y.kg)("editor.graphs.position.left",t,"Left")},{value:"right",label:(0,y.kg)("editor.graphs.position.right",t,"Right")},{value:"none",label:(0,y.kg)("editor.graphs.position.hidden",t,"Hidden")}]}renderGeneralTab(t,e,i,o){var a,n,s,l,d,c,p,g,u,m,_,v,b,x,f,w,k,$,S;const C=t,z=(null===(a=null==e?void 0:e.locale)||void 0===a?void 0:a.language)||"en";return r.qy`
      <div class="uc-graphs-general-tab">
        ${h.Q.injectCleanFormStyles()}
        <style>
          .uc-graphs-general-tab {
            padding: 8px;
          }
          .settings-section {
            background: var(--secondary-background-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(var(--rgb-primary-color), 0.12);
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--primary-text-color);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .field-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--primary-text-color);
            margin-bottom: 4px;
          }
          .field-description {
            font-size: 13px;
            color: var(--secondary-text-color);
            margin-bottom: 12px;
            opacity: 0.8;
            line-height: 1.4;
          }
        </style>

        <!-- Data Source Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12); width: 100%; max-width: 100%; box-sizing: border-box; overflow: visible;"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:database" style="color: var(--primary-color);"></ha-icon>
            ${(0,y.kg)("editor.graphs.data_source.title",z,"Data Source")}
          </div>

          ${this.renderFieldSection((0,y.kg)("editor.graphs.data_source.mode",z,"Mode"),(0,y.kg)("editor.graphs.data_source.desc",z,"Choose between historical data or weather forecasts."),e,{data_source:C.data_source||"history"},[this.selectField("data_source",[{value:"history",label:(0,y.kg)("editor.graphs.mode.history",z,"History")},{value:"forecast",label:(0,y.kg)("editor.graphs.mode.forecast",z,"Forecast")}])],(t=>{const e=t.detail.value.data_source;e!==(C.data_source||"history")&&(o({data_source:e}),delete this._historyData[C.id],setTimeout((()=>this.triggerPreviewUpdate()),50))}))}
          ${"forecast"===C.data_source?r.qy`
                <div class="conditional-fields-group" style="padding: 16px; margin-top: 12px;">
                  ${h.Q.renderField((0,y.kg)("editor.graphs.forecast_entity",z,"Weather Entity"),(0,y.kg)("editor.graphs.forecast_entity_desc",z,"Select a weather entity for forecasts."),e,{forecast_entity:C.forecast_entity||""},[h.Q.createSchemaItem("forecast_entity",{entity:{domain:"weather"}})],(t=>{var i;const r=(null===(i=t.detail.value)||void 0===i?void 0:i.forecast_entity)||t.detail.value;if(r===C.forecast_entity)return;o({forecast_entity:r}),delete this._historyData[C.id],delete this._deferredHistoryScheduled[C.id],delete this._historyLoading[C.id];try{const t=this._getCacheStore();delete t[this._makeCacheKey(C)],this._persistCacheStore(t)}catch(t){}const a=Object.assign(Object.assign({},C),{forecast_entity:r});this._loadHistoryData(a,e),this.requestUpdate(),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
                  <div style="margin-top: 16px;">
                    ${this.renderFieldSection((0,y.kg)("editor.graphs.forecast_type",z,"Forecast Type"),(0,y.kg)("editor.graphs.forecast_type_desc",z,"Hourly or daily forecasts."),e,{forecast_type:C.forecast_type||"hourly"},[this.selectField("forecast_type",[{value:"hourly",label:(0,y.kg)("editor.graphs.type.hourly",z,"Hourly")},{value:"daily",label:(0,y.kg)("editor.graphs.type.daily",z,"Daily")}])],(t=>{const i=t.detail.value.forecast_type;if(i===C.forecast_type)return;o({forecast_type:i}),delete this._historyData[C.id],delete this._historyError[C.id],delete this._historyLoading[C.id],delete this._deferredHistoryScheduled[C.id];try{const t=this._getCacheStore();delete t[this._makeCacheKey(C)],this._persistCacheStore(t)}catch(t){}const r=Object.assign(Object.assign({},C),{forecast_type:i});this._loadHistoryData(r,e),this.requestUpdate(),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
                  </div>
                </div>
              `:""}
        </div>

        <!-- Chart Type Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12); width: 100%; max-width: 100%; box-sizing: border-box; overflow: visible;"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:chart-line" style="color: var(--primary-color);"></ha-icon>
            ${(0,y.kg)("editor.graphs.chart_type.title",z,"Chart Type")}
          </div>

          ${this.renderFieldSection((0,y.kg)("editor.graphs.chart_type.type",z,"Type"),(0,y.kg)("editor.graphs.chart_type.desc",z,"Select the visualization style for your data."),e,{chart_type:C.chart_type},[this.selectField("chart_type",this.getChartTypeOptions(z))],(t=>{const e=t.detail.value.chart_type;e!==C.chart_type&&(o({chart_type:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
        </div>

        <!-- Data Sources Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12); width: 100%; max-width: 100%; box-sizing: border-box; overflow: visible;"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:database" style="color: var(--primary-color);"></ha-icon>
            ${"forecast"===C.data_source?(0,y.kg)("editor.graphs.forecast_attributes.title",z,"Forecast Attributes"):(0,y.kg)("editor.graphs.data_sources.title",z,"Data Sources")}
          </div>
          ${"forecast"===C.data_source?r.qy`<div
                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.08); border-radius: 8px; border-left: 3px solid var(--primary-color);"
              >
                ${(0,y.kg)("editor.graphs.forecast_attributes.desc",z,"Select which forecast values to display from the weather entity configured above. Each attribute will be shown as a separate line on the graph.")}
              </div>`:""}

          <div class="entities-grid" style="display: grid; gap: 12px;">
            ${(null===(n=C.entities)||void 0===n?void 0:n.map(((t,i)=>{var a,n,s;return r.qy`
                <div
                  class="entity-card"
                  style="
                    background: var(--primary-background-color); 
                    border-radius: 8px; 
                    padding: 16px; 
                    border-left: 4px solid ${t.color||this._getDefaultColor(i)};
                    position: relative;
                    transition: all 0.2s ease;
                  "
                >
                  ${((null===(a=C.entities)||void 0===a?void 0:a.length)||0)>1?r.qy`
                        <ha-icon-button
                          @click=${()=>this._removeEntity(C,i,o)}
                          style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        --mdc-icon-button-size: 32px;
                        --mdc-icon-size: 16px;
                        color: var(--error-color);
                      "
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </ha-icon-button>
                      `:""}

                  <div
                    style="display: grid; gap: 12px; margin-top: ${((null===(n=C.entities)||void 0===n?void 0:n.length)||0)>1?"20px":"0"};"
                  >
                    <!-- Entity Header -->
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                      <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
                        <div
                          style="
                             width: 12px;
                             height: 12px;
                             background: ${t.color||this._getDefaultColor(i)};
                             border-radius: 2px;
                             flex-shrink: 0;
                           "
                        ></div>
                        <span
                          style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                        >
                          ${t.name||(t.entity?(null===(s=e.states[t.entity])||void 0===s?void 0:s.attributes.friendly_name)||t.entity.split(".")[1]:`Entity ${i+1}`)}
                        </span>
                      </div>
                    </div>

                    <!-- Basic Settings (Always Visible) -->
                    <div style="display: grid; gap: 12px;">
                      <!-- Entity Picker (History Mode Only) -->
                      ${"forecast"!==C.data_source?h.Q.renderField((0,y.kg)("editor.graphs.entity.label",z,"Entity"),(0,y.kg)("editor.graphs.entity.desc",z,"Select an entity to plot."),e,{entity:t.entity||""},[h.Q.createSchemaItem("entity",{entity:{}})],(t=>{var r,a;this._updateEntity(C,i,{entity:(null===(r=t.detail.value)||void 0===r?void 0:r.entity)||(null===(a=t.detail.value)||void 0===a?void 0:a.entity)||t.detail.value},o,e)})):""}

                      <!-- Forecast Attribute Selection (Forecast Mode - Always Visible) -->
                      ${"forecast"===C.data_source?this.renderFieldSection((0,y.kg)("editor.graphs.entity.forecast_attr",z,"Forecast Attribute"),(0,y.kg)("editor.graphs.entity.forecast_attr_desc",z,"Which forecast value to plot on the graph."),e,{forecast_attribute:t.forecast_attribute||"temperature"},[this.selectField("forecast_attribute",[{value:"temperature",label:(0,y.kg)("editor.graphs.forecast.temp",z,"Temperature")},{value:"precipitation",label:(0,y.kg)("editor.graphs.forecast.precip",z,"Precipitation")},{value:"wind_speed",label:(0,y.kg)("editor.graphs.forecast.wind",z,"Wind Speed")},{value:"humidity",label:(0,y.kg)("editor.graphs.forecast.humidity",z,"Humidity")},{value:"pressure",label:(0,y.kg)("editor.graphs.forecast.pressure",z,"Pressure")},{value:"cloud_coverage",label:(0,y.kg)("editor.graphs.forecast.clouds",z,"Cloud Coverage")}])],(r=>{const a=r.detail.value.forecast_attribute;a!==t.forecast_attribute&&this._updateEntity(C,i,{forecast_attribute:a},o,e)})):""}

                      <!-- Display Name -->
                      <input
                        type="text"
                        .value=${t.name||""}
                        placeholder="${(0,y.kg)("editor.graphs.entity.display_name_placeholder",z,"Display name (optional)")}"
                        @input=${t=>{const e=t.target;this._updateEntity(C,i,{name:e.value},o)}}
                        style="
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--secondary-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: border-color 0.2s ease;
                        "
                      />

                      <!-- Series Color (below name) -->
                      <div style="margin-top: 4px;">
                        <ultra-color-picker
                          .value=${t.color||this._getDefaultColor(i)}
                          @value-changed=${t=>{this._updateEntity(C,i,{color:t.detail.value},o)}}
                          style="width: 100%; height: 40px;"
                        ></ultra-color-picker>
                      </div>

                      <!-- Primary entity toggle -->
                      <label
                        style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px; background: var(--primary-background-color);"
                      >
                        <ha-switch
                          .checked=${!0===t.is_primary||0===i&&!(C.entities||[]).some((t=>t.is_primary))}
                          @change=${t=>{const e=t.target,r=C.entities||[];let a;a=e.checked?r.map(((t,e)=>Object.assign(Object.assign({},t),{is_primary:e===i}))):r.some(((t,e)=>e!==i&&t.is_primary))?r.map(((t,e)=>e===i?Object.assign(Object.assign({},t),{is_primary:!1}):t)):r.map(((t,e)=>Object.assign(Object.assign({},t),{is_primary:e===i}))),o({entities:a})}}
                        ></ha-switch>
                        <span style="font-size:13px; color: var(--primary-text-color);"
                          >${(0,y.kg)("editor.graphs.entity.use_as_card_info",z,"Use as card info")}</span
                        >
                      </label>
                    </div>

                    <!-- Advanced Options (Collapsible) -->
                    <div
                      class="entity-advanced-options"
                      style="
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.3s ease, opacity 0.2s ease;
                        opacity: 0;
                        border-top: none;
                        margin-top: 0;
                      "
                    >
                      <div style="padding-top: 16px; display: grid; gap: 16px;">
                        <!-- Attribute Selection (History Mode) -->
                        ${"forecast"!==C.data_source?h.Q.renderField((0,y.kg)("editor.graphs.entity.attribute",z,"Attribute"),(0,y.kg)("editor.graphs.entity.attribute_desc",z,"Use entity state or select a specific attribute to track."),e,{attribute:t.attribute||""},[h.Q.createSchemaItem("attribute",{select:{options:[{value:"",label:(0,y.kg)("editor.graphs.entity.state_default",z,"State (default)")},...this._getEntityAttributes(t.entity,e)],mode:"dropdown"}})],(t=>{this._updateEntity(C,i,{attribute:t.detail.value.attribute},o,e)})):""}

                        <!-- Line Chart Specific Options -->
                        ${["line","area"].includes(C.chart_type)?r.qy`
                              <div
                                style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
                              >
                                <label
                                  style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                                >
                                  <ha-switch
                                    .checked=${!1!==t.show_points}
                                    @change=${t=>{const e=t.target;this._updateEntity(C,i,{show_points:e.checked},o)}}
                                  ></ha-switch>
                                  <span style="font-size: 13px; color: var(--primary-text-color);"
                                    >${(0,y.kg)("editor.graphs.line.show_points",z,"Show Points")}</span
                                  >
                                </label>

                                <label
                                  style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                                >
                                  <ha-switch
                                    .checked=${!0===t.fill_area}
                                    @change=${t=>{const e=t.target;this._updateEntity(C,i,{fill_area:e.checked},o)}}
                                  ></ha-switch>
                                  <span style="font-size: 13px; color: var(--primary-text-color);"
                                    >${(0,y.kg)("editor.graphs.line.fill_area",z,"Fill Area")}</span
                                  >
                                </label>
                              </div>

                              <!-- Line Width and Style -->
                              <div
                                style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
                              >
                                <div>
                                  <label
                                    style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                                  >
                                    ${(0,y.kg)("editor.graphs.line.line_width",z,"Line Width")}:
                                    ${t.line_width||2}px
                                  </label>
                                  <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    step="1"
                                    .value=${t.line_width||2}
                                    @input=${t=>{const e=t.target;this._updateEntity(C,i,{line_width:parseInt(e.value)},o)}}
                                    style="
                                      width: 100%;
                                      height: 4px;
                                      background: var(--divider-color);
                                      border-radius: 2px;
                                      outline: none;
                                      -webkit-appearance: none;
                                    "
                                  />
                                </div>

                                ${this.renderFieldSection((0,y.kg)("editor.graphs.line.line_style",z,"Line Style"),"",e,{line_style:t.line_style||"solid"},[this.selectField("line_style",[{value:"solid",label:(0,y.kg)("editor.graphs.line_styles.solid",z,"Solid")},{value:"dashed",label:(0,y.kg)("editor.graphs.line_styles.dashed",z,"Dashed")},{value:"dotted",label:(0,y.kg)("editor.graphs.line_styles.dotted",z,"Dotted")}])],(e=>{const r=e.detail.value.line_style;r!==(t.line_style||"solid")&&(this._updateEntity(C,i,{line_style:r},o),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}
                              </div>
                            `:""}
                        ${["pie","donut"].includes(C.chart_type)?r.qy`
                              <label
                                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                              >
                                <ha-switch
                                  .checked=${!1!==t.label_show_name}
                                  @change=${t=>{const e=t.target;this._updateEntity(C,i,{label_show_name:e.checked},o)}}
                                ></ha-switch>
                                <span style="font-size: 13px; color: var(--primary-text-color);"
                                  >${(0,y.kg)("editor.graphs.pie.show_title",z,"Show Title in Slice")}</span
                                >
                              </label>
                              <label
                                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                              >
                                <ha-switch
                                  .checked=${!1!==t.label_show_value}
                                  @change=${t=>{const e=t.target;this._updateEntity(C,i,{label_show_value:e.checked},o)}}
                                ></ha-switch>
                                <span style="font-size: 13px; color: var(--primary-text-color);"
                                  >${(0,y.kg)("editor.graphs.pie.show_value",z,"Show Value in Slice")}</span
                                >
                              </label>
                            `:""}
                      </div>
                    </div>

                    <!-- Expand/Collapse Button -->
                    <div style="display:flex; justify-content:center; margin-top: 12px;">
                      <ha-button
                        @click=${t=>this._toggleEntityOptions(t,i)}
                        style="--mdc-theme-primary: var(--secondary-text-color); background: transparent;"
                      >
                        <span style="display:inline-flex; align-items:center; gap:6px;">
                          <ha-icon
                            icon="mdi:chevron-down"
                            class="entity-toggle-btn"
                            style="--mdc-icon-size:20px;"
                          ></ha-icon>
                          <span
                            >${(0,y.kg)("editor.graphs.entity.expand_options",z,"Expand Options")}</span
                          >
                        </span>
                      </ha-button>
                    </div>
                  </div>
                </div>
              `})))||""}
            ${0===((null===(s=C.entities)||void 0===s?void 0:s.length)||0)?r.qy`
                  <div
                    style="
                  text-align: center; 
                  padding: 40px 20px; 
                  color: var(--secondary-text-color); 
                  background: var(--primary-background-color); 
                  border-radius: 8px; 
                  border: 2px dashed var(--divider-color);
                "
                  >
                    <ha-icon
                      icon="mdi:chart-line"
                      style="font-size: 48px; margin-bottom: 12px; opacity: 0.5;"
                    ></ha-icon>
                    <div style="font-size: 16px; margin-bottom: 4px; font-weight: 500;">
                      ${(0,y.kg)("editor.graphs.data_sources.no_entities",z,"No entities added")}
                    </div>
                    <div style="font-size: 14px; opacity: 0.7;">
                      ${(0,y.kg)("editor.graphs.data_sources.add_first_entity",z,"Add your first entity to create a chart")}
                    </div>
                  </div>
                `:""}

            <ha-button
              @click=${()=>this._addEntity(C,o)}
              style="
                margin-top: 8px; 
                width: 100%;
                --mdc-theme-primary: var(--primary-color);
                --mdc-button-outline-color: var(--primary-color);
              "
            >
              <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
              ${(0,y.kg)("editor.graphs.data_sources.add_entity",z,"Add Entity")}
            </ha-button>
          </div>
        </div>

        <!-- Display Options Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12); width: 100%; max-width: 100%; box-sizing: border-box; overflow: visible;"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:cog" style="color: var(--primary-color);"></ha-icon>
            ${(0,y.kg)("editor.graphs.display.title",z,"Display Options")}
          </div>

          <div
            style="display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; width: 100%; overflow: visible;"
          >
            <!-- Show Graph Title Toggle -->
            <label
              style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
            >
              <ha-switch
                .checked=${!1!==C.show_title}
                @change=${t=>{const e=t.target;o({show_title:e.checked})}}
              ></ha-switch>
              <span>${(0,y.kg)("editor.graphs.display.show_title",z,"Show Graph Title")}</span>
            </label>

            <!-- Show Graph Value Toggle -->
            <label
              style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
            >
              <ha-switch
                .checked=${!1!==C.show_entity_value}
                @change=${t=>{const e=t.target;o({show_entity_value:e.checked})}}
              ></ha-switch>
              <span>${(0,y.kg)("editor.graphs.display.show_value",z,"Show Graph Value")}</span>
            </label>

            <!-- Chart Title -->
            ${!1!==C.show_title?r.qy`<div>
                  <label
                    style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                  >
                    ${(0,y.kg)("editor.graphs.display.chart_title",z,"Chart Title")}
                  </label>
                  <input
                    type="text"
                    .value=${C.title||""}
                    placeholder="${(0,y.kg)("editor.graphs.display.chart_title_placeholder",z,"Enter chart title")}"
                    @input=${t=>{const e=t.target;o({title:e.value})}}
                    style="
                      width: 100%;
                      padding: 10px 12px;
                      border: 1px solid var(--divider-color);
                      border-radius: 6px;
                      background: var(--secondary-background-color);
                      color: var(--primary-text-color);
                      font-size: 14px;
                      transition: border-color 0.2s ease;
                      box-sizing: border-box;
                    "
                  />
                </div>`:""}

            <!-- Title Font Size -->
            ${!1!==C.show_title?r.qy`<div>
                  <label
                    style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                  >
                    ${(0,y.kg)("editor.graphs.display.title_font_size",z,"Title Font Size")}
                  </label>
                  <div
                    style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; box-sizing: border-box; width: 100%;"
                  >
                    <input
                      type="range"
                      min="8"
                      max="32"
                      step="1"
                      .value=${null!==(l=C.title_font_size)&&void 0!==l?l:12}
                      @input=${t=>{const e=t.target,i=parseInt(e.value);o({title_font_size:i})}}
                      style="
                        width: 100%;
                        height: 4px;
                        background: var(--divider-color);
                        border-radius: 2px;
                        outline: none;
                        -webkit-appearance: none;
                      "
                    />
                    <span
                      style="font-size: 13px; color: var(--secondary-text-color); min-width: 56px; text-align: right;"
                      >${null!==(d=C.title_font_size)&&void 0!==d?d:12}px</span
                    >
                    <button
                      @click=${()=>o({title_font_size:12})}
                      title="${(0,y.kg)("editor.fields.reset_default_value",z,"Reset to default ({value})").replace("{value}","12px")}"
                      style="
                        width: 32px;
                        height: 32px;
                        padding: 0;
                        border: 1px solid var(--divider-color);
                        border-radius: 4px;
                        background: var(--secondary-background-color);
                        color: var(--primary-text-color);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        flex-shrink: 0;
                      "
                      @mouseenter=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="var(--text-primary-color)",e.style.borderColor="var(--primary-color)"}}
                      @mouseleave=${t=>{const e=t.target;e.style.background="var(--secondary-background-color)",e.style.color="var(--primary-text-color)",e.style.borderColor="var(--divider-color)"}}
                    >
                      <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                    </button>
                  </div>
                </div>`:""}

            <!-- Value Font Size -->
            ${!1!==C.show_entity_value?r.qy`<div>
                  <label
                    style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                  >
                    ${(0,y.kg)("editor.graphs.display.value_font_size",z,"Value Font Size")}
                  </label>
                  <div
                    style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; box-sizing: border-box; width: 100%;"
                  >
                    <input
                      type="range"
                      min="10"
                      max="48"
                      step="1"
                      .value=${null!==(c=C.value_font_size)&&void 0!==c?c:16}
                      @input=${t=>{const e=t.target,i=parseInt(e.value);o({value_font_size:i})}}
                      style="
                        width: 100%;
                        height: 4px;
                        background: var(--divider-color);
                        border-radius: 2px;
                        outline: none;
                        -webkit-appearance: none;
                      "
                    />
                    <span
                      style="font-size: 13px; color: var(--secondary-text-color); min-width: 56px; text-align: right;"
                      >${null!==(p=C.value_font_size)&&void 0!==p?p:16}px</span
                    >
                    <button
                      @click=${()=>o({value_font_size:16})}
                      title="${(0,y.kg)("editor.fields.reset_default_value",z,"Reset to default ({value})").replace("{value}","16px")}"
                      style="
                        width: 32px;
                        height: 32px;
                        padding: 0;
                        border: 1px solid var(--divider-color);
                        border-radius: 4px;
                        background: var(--secondary-background-color);
                        color: var(--primary-text-color);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        flex-shrink: 0;
                      "
                      @mouseenter=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="var(--text-primary-color)",e.style.borderColor="var(--primary-color)"}}
                      @mouseleave=${t=>{const e=t.target;e.style.background="var(--secondary-background-color)",e.style.color="var(--primary-text-color)",e.style.borderColor="var(--divider-color)"}}
                    >
                      <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                    </button>
                  </div>
                </div>`:""}

            <!-- Time Period (History Mode Only) -->
            ${"forecast"!==C.data_source?this.renderFieldSection((0,y.kg)("editor.graphs.display.time_period",z,"Time Period"),(0,y.kg)("editor.graphs.display.time_period_desc",z,"How much historical data to show."),e,{time_period:C.time_period},[this.selectField("time_period",this.getTimePeriodOptions(z,C.data_source))],(t=>{const i=t.detail.value.time_period;if(i===C.time_period)return;o({time_period:i}),delete this._historyData[C.id],delete this._historyError[C.id],delete this._historyLoading[C.id],delete this._deferredHistoryScheduled[C.id];const r=Object.assign(Object.assign({},C),{time_period:i});this._loadHistoryData(r,e),this._triggerHistoryLoad(r,e),this.requestUpdate(),setTimeout((()=>{this.triggerPreviewUpdate()}),50)})):""}

            <!-- Forecast Info (Forecast Mode Only) -->
            ${"forecast"===C.data_source?r.qy`<div
                    style="padding: 12px; background: rgba(var(--rgb-primary-color), 0.08); border-radius: 8px; border-left: 3px solid var(--primary-color); margin-bottom: 16px;"
                  >
                    <div
                      style="font-size: 13px; color: var(--primary-text-color); font-weight: 500;"
                    >
                      ${(0,y.kg)("editor.graphs.forecast_info.title",z,"Forecast Display")}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                    >
                      ${(0,y.kg)("editor.graphs.forecast_info.desc",z,"Forecasts display all available data from your weather service. The forecast type (hourly/daily) determines the time range shown.")}
                    </div>
                  </div>

                  <!-- Forecast Display Limit Controls -->
                  <div
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;"
                  >
                    <div>
                      <label
                        style="font-size: 13px; color: var(--primary-text-color); display: block; margin-bottom: 6px;"
                      >
                        ${(0,y.kg)("editor.graphs.forecast_limit.hours",z,"Limit Hours")}
                      </label>
                      <ha-textfield
                        type="number"
                        min="0"
                        max="168"
                        .value=${String(null!==(g=C.forecast_display_hours)&&void 0!==g?g:0)}
                        @change=${t=>{const i=t.target,r=parseInt(i.value)||0;o({forecast_display_hours:r}),delete this._historyData[C.id],delete this._deferredHistoryScheduled[C.id],delete this._historyLoading[C.id];try{const t=this._getCacheStore();delete t[this._makeCacheKey(C)],this._persistCacheStore(t)}catch(t){}const a=Object.assign(Object.assign({},C),{forecast_display_hours:r});this._loadHistoryData(a,e),this.requestUpdate(),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                        style="width: 100%;"
                        placeholder="0"
                        helper="${(0,y.kg)("editor.graphs.forecast_limit.hours_desc",z,"0 = show all")}"
                      ></ha-textfield>
                    </div>
                    <div>
                      <label
                        style="font-size: 13px; color: var(--primary-text-color); display: block; margin-bottom: 6px;"
                      >
                        ${(0,y.kg)("editor.graphs.forecast_limit.days",z,"Limit Days")}
                      </label>
                      <ha-textfield
                        type="number"
                        min="0"
                        max="14"
                        .value=${String(null!==(u=C.forecast_display_days)&&void 0!==u?u:0)}
                        @change=${t=>{const i=t.target,r=parseInt(i.value)||0;o({forecast_display_days:r}),delete this._historyData[C.id],delete this._deferredHistoryScheduled[C.id],delete this._historyLoading[C.id];try{const t=this._getCacheStore();delete t[this._makeCacheKey(C)],this._persistCacheStore(t)}catch(t){}const a=Object.assign(Object.assign({},C),{forecast_display_days:r});this._loadHistoryData(a,e),this.requestUpdate(),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                        style="width: 100%;"
                        placeholder="0"
                        helper="${(0,y.kg)("editor.graphs.forecast_limit.days_desc",z,"Days override hours")}"
                      ></ha-textfield>
                    </div>
                  </div>`:""}

            <!-- Normalize Values Toggle (only show when multiple entities) -->
            ${((null===(m=C.entities)||void 0===m?void 0:m.filter((t=>"forecast"===C.data_source?t.forecast_attribute:t.entity)).length)||0)>1?r.qy`
                  <div style="margin-bottom: 16px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                      <ha-switch
                        .checked=${C.normalize_values||!1}
                        @change=${t=>o({normalize_values:t.target.checked})}
                      ></ha-switch>
                      <span style="font-size: 14px;"
                        >${(0,y.kg)("editor.graphs.display.normalize_values",z,"Normalize values to same scale")}</span
                      >
                    </label>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px; margin-left: 40px;"
                    >
                      ${(0,y.kg)("editor.graphs.display.normalize_desc",z,"Useful when comparing entities with different units (e.g., % vs miles)")}
                    </div>
                  </div>
                `:""}

            <!-- Fixed Y-Axis Scale -->
            ${["line","bar"].includes(C.chart_type)?r.qy`
                  <div style="margin-bottom: 16px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                      <ha-switch
                        .checked=${C.use_fixed_y_axis||!1}
                        @change=${t=>{const e=t.target.checked;o({use_fixed_y_axis:e}),delete this._historyData[C.id],setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                      ></ha-switch>
                      <span style="font-size: 14px;"
                        >${(0,y.kg)("editor.graphs.display.use_fixed_y_axis",z,"Use Fixed Y-Axis Scale")}</span
                      >
                    </label>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px; margin-left: 40px;"
                    >
                      ${(0,y.kg)("editor.graphs.display.use_fixed_y_axis_desc",z,"Set fixed min/max values instead of auto-scaling. Useful for consistent scales across multiple graphs or time periods.")}
                    </div>
                  </div>
                `:""}
            ${C.use_fixed_y_axis&&["line","bar"].includes(C.chart_type)?r.qy`
                  <div
                    class="conditional-fields-group"
                    style="padding: 16px; margin-top: 12px; margin-bottom: 16px;"
                  >
                    <!-- Min Value -->
                    <div style="margin-bottom: 16px;">
                      <label
                        style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                      >
                        ${(0,y.kg)("editor.graphs.display.y_axis_min",z,"Minimum Value")}
                      </label>
                      <div
                        style="display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center;"
                      >
                        <input
                          type="number"
                          step="any"
                          .value=${String(null!==(_=C.y_axis_min)&&void 0!==_?_:0)}
                          @input=${t=>{const e=t.target,i=""===e.value?void 0:parseFloat(e.value);o({y_axis_min:i}),delete this._historyData[C.id],setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                          placeholder="0"
                          style="
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid var(--divider-color);
                            border-radius: 6px;
                            background: var(--secondary-background-color);
                            color: var(--primary-text-color);
                            font-size: 14px;
                            transition: border-color 0.2s ease;
                            box-sizing: border-box;
                          "
                        />
                        <button
                          @click=${()=>{o({y_axis_min:0}),delete this._historyData[C.id],setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                          title="${(0,y.kg)("editor.fields.reset_default_value",z,"Reset to default ({value})").replace("{value}","0")}"
                          style="
                            width: 32px;
                            height: 32px;
                            padding: 0;
                            border: 1px solid var(--divider-color);
                            border-radius: 4px;
                            background: var(--secondary-background-color);
                            color: var(--primary-text-color);
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                            flex-shrink: 0;
                          "
                          @mouseenter=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="var(--text-primary-color)",e.style.borderColor="var(--primary-color)"}}
                          @mouseleave=${t=>{const e=t.target;e.style.background="var(--secondary-background-color)",e.style.color="var(--primary-text-color)",e.style.borderColor="var(--divider-color)"}}
                        >
                          <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                        </button>
                      </div>
                    </div>

                    <!-- Max Value -->
                    <div>
                      <label
                        style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                      >
                        ${(0,y.kg)("editor.graphs.display.y_axis_max",z,"Maximum Value")}
                      </label>
                      <div
                        style="display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center;"
                      >
                        <input
                          type="number"
                          step="any"
                          .value=${String(null!==(v=C.y_axis_max)&&void 0!==v?v:100)}
                          @input=${t=>{const e=t.target,i=""===e.value?void 0:parseFloat(e.value);o({y_axis_max:i}),delete this._historyData[C.id],setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                          placeholder="100"
                          style="
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid var(--divider-color);
                            border-radius: 6px;
                            background: var(--secondary-background-color);
                            color: var(--primary-text-color);
                            font-size: 14px;
                            transition: border-color 0.2s ease;
                            box-sizing: border-box;
                          "
                        />
                        <button
                          @click=${()=>{o({y_axis_max:100}),delete this._historyData[C.id],setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                          title="${(0,y.kg)("editor.fields.reset_default_value",z,"Reset to default ({value})").replace("{value}","100")}"
                          style="
                            width: 32px;
                            height: 32px;
                            padding: 0;
                            border: 1px solid var(--divider-color);
                            border-radius: 4px;
                            background: var(--secondary-background-color);
                            color: var(--primary-text-color);
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: all 0.2s ease;
                            flex-shrink: 0;
                          "
                          @mouseenter=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="var(--text-primary-color)",e.style.borderColor="var(--primary-color)"}}
                          @mouseleave=${t=>{const e=t.target;e.style.background="var(--secondary-background-color)",e.style.color="var(--primary-text-color)",e.style.borderColor="var(--divider-color)"}}
                        >
                          <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                `:""}

            <!-- Chart Height -->
            <div>
              <label
                style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
              >
                ${(0,y.kg)("editor.graphs.display.chart_height",z,"Chart Height")}
              </label>
              <div
                style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; box-sizing: border-box; width: 100%;"
              >
                <input
                  type="range"
                  min="80"
                  max="400"
                  step="5"
                  .value=${null!==(b=C.chart_height)&&void 0!==b?b:345}
                  @input=${t=>{const e=t.target,i=parseInt(e.value);o({chart_height:i})}}
                  style="
                    width: 100%;
                    height: 4px;
                    background: var(--divider-color);
                    border-radius: 2px;
                    outline: none;
                    -webkit-appearance: none;
                  "
                />
                <span
                  style="font-size: 13px; color: var(--secondary-text-color); min-width: 56px; text-align: right;"
                  >${null!==(x=C.chart_height)&&void 0!==x?x:345}px</span
                >
                <button
                  @click=${()=>o({chart_height:345})}
                  title="${(0,y.kg)("editor.fields.reset_default_value",z,"Reset to default ({value})").replace("{value}","345px")}"
                  style="
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    border: 1px solid var(--divider-color);
                    border-radius: 4px;
                    background: var(--secondary-background-color);
                    color: var(--primary-text-color);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                  "
                  @mouseenter=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="var(--text-primary-color)",e.style.borderColor="var(--primary-color)"}}
                  @mouseleave=${t=>{const e=t.target;e.style.background="var(--secondary-background-color)",e.style.color="var(--primary-text-color)",e.style.borderColor="var(--divider-color)"}}
                >
                  <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Chart Width (%) -->
            <div>
              <label
                style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
              >
                ${(0,y.kg)("editor.graphs.display.chart_width",z,"Chart Width (%)")}
              </label>
              <div
                style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; box-sizing: border-box; width: 100%;"
              >
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  .value=${null!==(f=C.chart_width_percent)&&void 0!==f?f:100}
                  @input=${t=>{const e=t.target,i=Math.max(10,Math.min(100,parseInt(e.value)));o({chart_width_percent:i})}}
                  style="
                    width: 100%;
                    height: 4px;
                    background: var(--divider-color);
                    border-radius: 2px;
                    outline: none;
                    -webkit-appearance: none;
                  "
                />
                <span
                  style="font-size: 13px; color: var(--secondary-text-color); min-width: 56px; text-align: right;"
                  >${null!==(w=C.chart_width_percent)&&void 0!==w?w:100}%</span
                >
                <button
                  @click=${()=>o({chart_width_percent:100})}
                  title="Reset to default (100%)"
                  style="
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    border: 1px solid var(--divider-color);
                    border-radius: 4px;
                    background: var(--secondary-background-color);
                    color: var(--primary-text-color);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                  "
                  @mouseenter=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="var(--text-primary-color)",e.style.borderColor="var(--primary-color)"}}
                  @mouseleave=${t=>{const e=t.target;e.style.background="var(--secondary-background-color)",e.style.color="var(--primary-text-color)",e.style.borderColor="var(--divider-color)"}}
                >
                  <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                </button>
              </div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
                ${(0,y.kg)("editor.graphs.display.chart_width_desc",z,"Percentage of the available module width. Alignment controls placement.")}
              </div>
            </div>
            ${this.renderFieldSection((0,y.kg)("editor.graphs.display.info_position",z,"Info Position"),(0,y.kg)("editor.graphs.display.info_position_desc",z,"Position of the overlay showing the name/value."),e,{info_position:C.info_position||"top_left"},[this.selectField("info_position",[{value:"top_left",label:(0,y.kg)("editor.graphs.position.top_left",z,"Top Left")},{value:"top_right",label:(0,y.kg)("editor.graphs.position.top_right",z,"Top Right")},{value:"bottom_left",label:(0,y.kg)("editor.graphs.position.bottom_left",z,"Bottom Left")},{value:"bottom_right",label:(0,y.kg)("editor.graphs.position.bottom_right",z,"Bottom Right")},{value:"middle",label:(0,y.kg)("editor.graphs.position.middle",z,"Middle")}])],(t=>{const e=t.detail.value.info_position;e!==(C.info_position||"top_left")&&(o({info_position:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}

            <!-- Legend Position -->
            ${!1!==C.show_legend?this.renderFieldSection((0,y.kg)("editor.graphs.display.legend_position",z,"Legend Position"),(0,y.kg)("editor.graphs.display.legend_position_desc",z,"Where to place the legend when enabled."),e,{legend_position:C.legend_position||"bottom_left"},[this.selectField("legend_position",[{value:"bottom_left",label:(0,y.kg)("editor.graphs.position.bottom_left",z,"Bottom Left")},{value:"bottom_right",label:(0,y.kg)("editor.graphs.position.bottom_right",z,"Bottom Right")},{value:"top_left",label:(0,y.kg)("editor.graphs.position.top_left",z,"Top Left")},{value:"top_right",label:(0,y.kg)("editor.graphs.position.top_right",z,"Top Right")}])],(t=>{const e=t.detail.value.legend_position;e!==(C.legend_position||"bottom_left")&&(o({legend_position:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))})):""}

            <!-- Chart Alignment -->
            ${this.renderFieldSection((0,y.kg)("editor.graphs.display.chart_alignment",z,"Chart Alignment"),(0,y.kg)("editor.graphs.display.chart_alignment_desc",z,"Alignment of the chart within its container."),e,{chart_alignment:C.chart_alignment||"center"},[this.selectField("chart_alignment",[{value:"left",label:(0,y.kg)("editor.graphs.position.left",z,"Left")},{value:"center",label:(0,y.kg)("editor.graphs.position.center",z,"Center")},{value:"right",label:(0,y.kg)("editor.graphs.position.right",z,"Right")}])],(t=>{const e=t.detail.value.chart_alignment;e!==(C.chart_alignment||"center")&&(o({chart_alignment:e}),setTimeout((()=>{this.triggerPreviewUpdate()}),50))}))}

            <!-- Background Color -->
            <div style="position: relative; overflow: visible;">
              <label
                style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
              >
                ${(0,y.kg)("editor.graphs.display.background_color",z,"Background Color")}
              </label>
              <ultra-color-picker
                .value=${C.background_color||"transparent"}
                @value-changed=${t=>{o({background_color:t.detail.value})}}
                style="width: 100%; height: 40px;"
              ></ultra-color-picker>
            </div>

            <!-- Bar Display Limit (Only for Bar Charts) -->
            ${"bar"===C.chart_type?r.qy`
                  <div>
                    <label
                      style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                    >
                      ${(0,y.kg)("editor.graphs.display.bar_display_limit",z,"Max Bars to Display")}
                    </label>
                    <div
                      style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center;"
                    >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        .value=${null!==(k=C.bar_display_limit)&&void 0!==k?k:0}
                        @input=${t=>{const e=t.target,i=Math.max(0,Math.min(100,parseInt(e.value)));o({bar_display_limit:i})}}
                        style="
                          width: 100%;
                          height: 4px;
                          background: var(--divider-color);
                          border-radius: 2px;
                          outline: none;
                          -webkit-appearance: none;
                        "
                      />
                      <span
                        style="font-size: 13px; color: var(--secondary-text-color); min-width: 80px; text-align: right;"
                        >${0===(null!==($=C.bar_display_limit)&&void 0!==$?$:0)?"Unlimited":`${null!==(S=C.bar_display_limit)&&void 0!==S?S:0} bars`}</span
                      >
                      <button
                        @click=${()=>o({bar_display_limit:0})}
                        title="${(0,y.kg)("editor.fields.reset_default_value",z,"Reset to default (Unlimited)")}"
                        style="
                          width: 32px;
                          height: 32px;
                          padding: 0;
                          border: 1px solid var(--divider-color);
                          border-radius: 4px;
                          background: var(--secondary-background-color);
                          color: var(--primary-text-color);
                          cursor: pointer;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          transition: all 0.2s ease;
                          flex-shrink: 0;
                        "
                        @mouseenter=${t=>{const e=t.target;e.style.background="var(--primary-color)",e.style.color="var(--text-primary-color)",e.style.borderColor="var(--primary-color)"}}
                        @mouseleave=${t=>{const e=t.target;e.style.background="var(--secondary-background-color)",e.style.color="var(--primary-text-color)",e.style.borderColor="var(--divider-color)"}}
                      >
                        <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                      </button>
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                    >
                      ${(0,y.kg)("editor.graphs.display.bar_display_limit_desc",z,"Set to 0 or higher value to limit the number of bars shown. Useful when time period contains many data points. Set to 0 for unlimited.")}
                    </div>
                  </div>
                `:""}

            <!-- Chart Options -->
            <label
              style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 8px;"
              >${(0,y.kg)("editor.graphs.display.chart_options",z,"Chart Options")}</label
            >
            <div
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;"
            >
              <label
                style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
              >
                <ha-switch
                  .checked=${!1!==C.show_legend}
                  @change=${t=>{const e=t.target;o({show_legend:e.checked})}}
                ></ha-switch>
                <span>${(0,y.kg)("editor.graphs.display.show_legend",z,"Show Legend")}</span>
              </label>
              ${"line"===C.chart_type?r.qy`<label
                    style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                  >
                    <ha-switch
                      .checked=${!1!==C.show_grid}
                      @change=${t=>{const e=t.target;o({show_grid:e.checked})}}
                    ></ha-switch>
                    <span>${(0,y.kg)("editor.graphs.display.show_grid",z,"Show Grid")}</span>
                  </label>`:""}
              ${"line"===C.chart_type&&!1!==C.show_grid?r.qy`<label
                    style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                  >
                    <ha-switch
                      .checked=${!1!==C.show_grid_values}
                      @change=${t=>{const e=t.target;o({show_grid_values:e.checked})}}
                    ></ha-switch>
                    <span
                      >${(0,y.kg)("editor.graphs.display.show_grid_values",z,"Show Grid Values")}</span
                    >
                  </label>`:""}
              ${"line"===C.chart_type?r.qy`<label
                    style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                  >
                    <ha-switch
                      .checked=${!0===C.show_time_intervals}
                      @change=${t=>{const e=t.target;o({show_time_intervals:e.checked})}}
                    ></ha-switch>
                    <span
                      >${(0,y.kg)("editor.graphs.display.show_time_intervals",z,"Show Time Intervals")}</span
                    >
                  </label>`:""}
              ${["pie","donut"].includes(C.chart_type)?r.qy`
                    <label
                      style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                    >
                      <ha-switch
                        .checked=${Number(C.slice_gap||0)>0}
                        @change=${t=>{const e=t.target,i=(C.entities||[]).filter((t=>null==t?void 0:t.entity)).length,r=Math.max(2,Math.min(4,Math.round(360/Math.max(30*i,1))));o({slice_gap:e.checked?r:0})}}
                      ></ha-switch>
                      <span
                        >${(0,y.kg)("editor.graphs.display.add_slice_gap",z,"Add Slice Gap")}</span
                      >
                    </label>
                  `:""}
              ${"line"===C.chart_type?r.qy`
                    <label
                      style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                    >
                      <ha-switch
                        .checked=${!1!==C.smooth_curves}
                        @change=${t=>{const e=t.target;o({smooth_curves:e.checked})}}
                      ></ha-switch>
                      <span
                        >${(0,y.kg)("editor.graphs.display.smooth_lines",z,"Smooth Lines")}</span
                      >
                    </label>
                  `:""}
              ${"line"===C.chart_type?r.qy`<label
                    style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                  >
                    <ha-switch
                      .checked=${!1!==C.show_tooltips}
                      @change=${t=>{const e=t.target;o({show_tooltips:e.checked})}}
                    ></ha-switch>
                    <span
                      >${(0,y.kg)("editor.graphs.display.show_tooltips",z,"Show Tooltips")}</span
                    >
                  </label>`:""}
            </div>
          </div>
        </div>
      </div>
    `}renderActionsTab(t,e,i,r){const o=t;return c.A.render(o,e,(t=>r(t)))}renderPreview(t,e,i,o){var d,c,p,h,u,y,_,v,b,x;const f=t,w=f,k=f.design||{};let $,S,C,z;if(f.template_mode&&f.template&&(!this._templateService&&e&&(this._templateService=new a.I(e)),e)){e.__uvc_template_strings||(e.__uvc_template_strings={});const t=this._hashString(f.template),r=`graphs_${f.id}_${t}`;if(this._templateService&&!this._templateService.hasTemplateSubscription(r)){const t=(null===(c=null===(d=f.entities)||void 0===d?void 0:d.find((t=>t.is_primary&&t.entity)))||void 0===c?void 0:c.entity)||(null===(h=null===(p=f.entities)||void 0===p?void 0:p.find((t=>t.entity)))||void 0===h?void 0:h.entity)||"",o=(f.entities||[]).filter((t=>"forecast"===f.data_source?t.forecast_attribute:t.entity)).map((t=>("forecast"===f.data_source?f.forecast_entity:t.entity)||"")).filter((t=>t)),a=o.length>1?(0,n.wI)(o,e,f.entities):(0,n.pL)(t,e,{entities:f.entities,chart_type:f.chart_type});this._templateService.subscribeToTemplate(f.template,r,(()=>{"undefined"!=typeof window&&(window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update",{bubbles:!0,composed:!0})),window._ultraCardUpdateTimer=null}),50)))}),a,i)}const o=null===(u=e.__uvc_template_strings)||void 0===u?void 0:u[r];if(o&&""!==String(o).trim()){const t=(0,s.cv)(o);(0,s.HD)(t)||(this._templateResults[f.id]=t,t.colors&&Array.isArray(t.colors)&&($=t.colors),t.global_color&&(S=t.global_color),void 0!==t.fill_area&&(C=t.fill_area),void 0!==t.pie_fill&&(z="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill))))}}this._loadHistoryData(f,e);const T=k.color||w.color||"var(--primary-text-color)",D=(()=>{const t=k.font_size||w.font_size;if(t&&"string"==typeof t&&""!==t.trim())return/[a-zA-Z%]/.test(t)?t:`${t}px`})(),M=k.font_family||w.font_family||void 0,A=k.font_weight||w.font_weight||void 0,F=k.text_transform||w.text_transform||void 0,E=k.font_style||w.font_style||void 0,L=k.letter_spacing||w.letter_spacing||void 0,O=k.line_height||w.line_height||void 0,P=(()=>{const t=k.text_shadow_h||w.text_shadow_h,e=k.text_shadow_v||w.text_shadow_v,i=k.text_shadow_blur||w.text_shadow_blur,r=k.text_shadow_color||w.text_shadow_color;if(t||e||i||r)return`${t||"0px"} ${e||"0px"} ${i||"0px"} ${r||"rgba(0,0,0,0.2)"}`})(),U=(k.background_color||w.background_color,(t={})=>{const e=[],i=t.color||T;i&&e.push(`color: ${i}`);const r=t.fontSize||D;return r&&e.push(`font-size: ${r}`),M&&e.push(`font-family: ${M}`),A&&e.push(`font-weight: ${A}`),F&&e.push(`text-transform: ${F}`),E&&e.push(`font-style: ${E}`),L&&e.push(`letter-spacing: ${L}`),O&&e.push(`line-height: ${O}`),P&&e.push(`text-shadow: ${P}`),e.join("; ")}),I=k.background_color||w.background_color||"transparent",j=this.getBackgroundImageCSS(Object.assign(Object.assign({},w),k),e),H=(0,g.U9)({color:I,image:"none"!==j?j:void 0,imageSize:k.background_size||w.background_size||"cover",imagePosition:k.background_position||w.background_position||"center",imageRepeat:k.background_repeat||w.background_repeat||"no-repeat",fallback:"transparent"}),q=Object.assign(Object.assign({padding:k.padding_top||k.padding_bottom||k.padding_left||k.padding_right||w.padding_top||w.padding_bottom||w.padding_left||w.padding_right?`${this.addPixelUnit(k.padding_top||w.padding_top)||"0px"} ${this.addPixelUnit(k.padding_right||w.padding_right)||"0px"} ${this.addPixelUnit(k.padding_bottom||w.padding_bottom)||"0px"} ${this.addPixelUnit(k.padding_left||w.padding_left)||"0px"}`:"0",margin:k.margin_top||k.margin_bottom||k.margin_left||k.margin_right||w.margin_top||w.margin_bottom||w.margin_left||w.margin_right?`${k.margin_top||w.margin_top||"8px"} ${k.margin_right||w.margin_right||"0px"} ${k.margin_bottom||w.margin_bottom||"8px"} ${k.margin_left||w.margin_left||"0px"}`:"8px 0"},H.styles),{backdropFilter:k.backdrop_filter||w.backdrop_filter||"",border:k.border_style?`${k.border_width||"1px"} ${k.border_style} ${k.border_color||"var(--divider-color)"}`:this.getBorderCSS(w),borderRadius:this.addPixelUnit(k.border_radius||w.border_radius)||"0",width:k.width||w.width||"100%",height:k.height||w.height||"",maxWidth:k.max_width||w.max_width||"",maxHeight:k.max_height||w.max_height||"",minWidth:k.min_width||w.min_width||"",minHeight:k.min_height||w.min_height||"",overflow:k.overflow||w.overflow||"",clipPath:k.clip_path||w.clip_path||"",position:k.position||w.position||"",top:k.top||w.top||"",right:k.right||w.right||"",bottom:k.bottom||w.bottom||"",left:k.left||w.left||"",zIndex:k.z_index||w.z_index||"",boxShadow:k.box_shadow_h||k.box_shadow_v||k.box_shadow_blur||k.box_shadow_spread||k.box_shadow_color?`${k.box_shadow_h||"0px"} ${k.box_shadow_v||"0px"} ${k.box_shadow_blur||"0px"} ${k.box_shadow_spread||"0px"} ${k.box_shadow_color||"rgba(0,0,0,0.2)"}`:"",boxSizing:"border-box",display:"block"});"line"===f.chart_type&&(q.padding="0");const W=f.entities&&f.entities.length>0&&("forecast"===f.data_source?f.entities.some((t=>t.forecast_attribute)):f.entities.some((t=>t.entity)));if(!f.chart_type)return this.renderGradientErrorState("Select Chart Type","Choose a chart type in the General tab","mdi:chart-line");if(!W){const t="forecast"===f.data_source?"Configure forecast attributes in the General tab":"Add entities to display chart";return this.renderGradientErrorState("Configure Entities",t,"mdi:chart-line")}const N=f.entities.find((t=>t.is_primary&&t.entity))||f.entities.find((t=>t.entity)),B=N?e.states[N.entity]:void 0,R=f.title||(null==N?void 0:N.name)||(null===(y=null==B?void 0:B.attributes)||void 0===y?void 0:y.friendly_name)||"Chart Title",G=((null==N?void 0:N.attribute)?null===(_=null==B?void 0:B.attributes)||void 0===_?void 0:_.unit_of_measurement:null===(v=null==B?void 0:B.attributes)||void 0===v?void 0:v.unit_of_measurement)||"",V=N?N.attribute?null===(b=null==B?void 0:B.attributes)||void 0===b?void 0:b[N.attribute]:null==B?void 0:B.state:void 0,J="number"==typeof V?V:parseFloat(V);let K=this._prepareSimpleChartData(f,e,$,S,C);"forecast"===f.data_source&&this._historyData[f.id]&&(K=this._historyData[f.id].datasets.map(((t,e)=>{let i;return i=$&&$[e]?this._formatColor($[e]):S?this._formatColor(S):t.color,{name:t.name,value:t.values[t.values.length-1]||0,color:i,unit:t.unit,entityId:t.entityId}})));const Z=f.info_position||"top_left",Q="line"===f.chart_type&&!1!==f.show_grid&&!1!==f.show_grid_values?"32px":"16px",Y={top_left:`top:12px; left:${Q}; text-align:left;`,top_right:"top:12px; right:16px; text-align:right;",bottom_left:`bottom:12px; left:${Q}; text-align:left;`,bottom_right:"bottom:12px; right:16px; text-align:right;",middle:"top:50%; left:50%; transform: translate(-50%, -50%); text-align:center;"},X=(()=>{if(!N||!B)return"";try{const t=void 0!==V?String(V):B.state;return(0,m.formatEntityState)(e,N.entity,{state:t,includeUnit:!0})}catch(t){return`${isNaN(J)?"":J}${G?` ${G}`:""}`}})(),tt=["pie","donut"].includes(f.chart_type)?r.qy``:r.qy`
          <div
            class="graph-header-info"
            style="
              position:absolute; 
              ${Y[Z]}; 
              pointer-events:none; 
              z-index:10;
              max-width: calc(100% - 32px);
              box-sizing: border-box;
              overflow: hidden;
              padding: 4px 8px;
              border-radius: 6px;
              background: rgba(0, 0, 0, 0.3);
              backdrop-filter: blur(4px);
              -webkit-backdrop-filter: blur(4px);
            "
          >
            ${!1!==f.show_display_name&&!1!==f.show_title?r.qy`<div
                  class="graph-title"
                  style="
                    ${U({fontSize:D||`${f.title_font_size||12}px`})}; 
                    font-weight: 600; 
                    ${k.text_align?`text-align:${k.text_align};`:""};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  ${R}
                </div>`:""}
            ${!1!==f.show_entity_value?r.qy`<div
                  class="graph-value"
                  style="
                    ${U({fontSize:D||`${f.value_font_size||16}px`})}; 
                    line-height: 1.1; 
                    font-weight: 600; 
                    margin-top: 6px; 
                    ${k.text_align?`text-align:${k.text_align};`:""};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  ${X}
                </div>`:""}
          </div>
        `,et=this._historyData[f.id],it=!0===this._historyLoading[f.id]&&!et,rt=(this.getBackgroundImageCSS(Object.assign(Object.assign({},w),k),e),f.chart_alignment||"center"),ot="left"===rt?"flex-start":"right"===rt?"flex-end":"center",at=this._resolveChartWidth(f),nt=r.qy`
      <div
        class="uc-graphs-module"
        style="
          ${this.styleObjectToCss(q)};
          position: relative;
          overflow: hidden;
          contain: layout style;
        "
      >
        <uc-preview-container
          .alignment=${f.chart_alignment||"center"}
          .height=${"number"==typeof f.chart_height?f.chart_height:parseInt(String(f.chart_height))||200}
        >
          <div
            style="
            display:flex; 
            width:100%; 
            height:100%;
            justify-content:${ot};
            overflow:hidden;
            box-sizing:border-box;
          "
          >
            <div
              style="
              width:${at}; 
              max-width:100%;
              height:100%;
              position:relative;
              overflow:hidden;
              box-sizing:border-box;
            "
            >
              ${this._renderSimpleChart(f,K,e,(()=>{const t=f,e=f.design||{},i=e.color||t.color||"var(--primary-text-color)",r=[];return i&&r.push(`color: ${i}`),(e.font_size||t.font_size)&&r.push(`font-size: ${e.font_size||t.font_size}`),(e.font_family||t.font_family)&&r.push(`font-family: ${e.font_family||t.font_family}`),(e.font_weight||t.font_weight)&&r.push(`font-weight: ${e.font_weight||t.font_weight}`),(e.text_transform||t.text_transform)&&r.push(`text-transform: ${e.text_transform||t.text_transform}`),(e.font_style||t.font_style)&&r.push(`font-style: ${e.font_style||t.font_style}`),(e.letter_spacing||t.letter_spacing)&&r.push(`letter-spacing: ${e.letter_spacing||t.letter_spacing}`),(e.line_height||t.line_height)&&r.push(`line-height: ${e.line_height||t.line_height}`),r.join("; ")})(),rt,$,S,C,z)}
            </div>
          </div>
        </uc-preview-container>
        ${tt}
        ${!1!==f.show_legend?this._renderLegend(K,f.legend_position||"bottom_left",U({})):""}
        ${it?r.qy`<div
              style="
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                background: linear-gradient(
                  to bottom,
                  rgba(0,0,0,0.18),
                  rgba(0,0,0,0.12)
                );
              "
            >
              <div
                style="
                  background: rgba(0,0,0,0.35);
                  backdrop-filter: blur(2px);
                  border: 1px solid var(--divider-color);
                  border-radius: 10px;
                  padding: 10px 14px;
                  display: inline-flex;
                  align-items: center;
                  gap: 10px;
                  color: var(--secondary-text-color);
                  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                "
              >
                <ha-circular-progress active size="small"></ha-circular-progress>
                <span style="font-size: 13px;">Loading history…</span>
              </div>
            </div>`:""}
      </div>
    `,st=null===(x=f.design)||void 0===x?void 0:x.hover_effect,lt=l.k.getHoverEffectClass(st);return this.hasActiveLink(f)?r.qy`<div
          class="graphs-module-clickable ${lt}"
          style="cursor: pointer; transition: all 0.2s ease; border-radius: 4px;"
          @click=${t=>this.handleClick(t,f,e)}
          @dblclick=${t=>this.handleDoubleClick(t,f,e)}
          @mousedown=${t=>this.handleMouseDown(t,f,e)}
          @mouseup=${t=>this.handleMouseUp(t,f,e)}
          @mouseleave=${t=>this.handleMouseLeave(t,f,e)}
          @touchstart=${t=>this.handleTouchStart(t,f,e)}
          @touchend=${t=>this.handleTouchEnd(t,f,e)}
        >
          ${nt}
        </div>`:lt?r.qy`<div class="graphs-module-container ${lt}">${nt}</div>`:nt}_prepareSimpleChartData(t,e,i,r,o){var a;const n=[];for(let s=0;s<t.entities.length;s++){const l=t.entities[s];if(!l.entity)continue;const d=e.states[l.entity];if(!d)continue;const c=l.attribute?d.attributes[l.attribute]:d.state,p=parseFloat(c);let h;h=i&&i[s]?this._formatColor(i[s]):r?this._formatColor(r):this._formatColor(l.color)||this._getDefaultColor(s);const g=void 0!==o?o:!0===l.fill_area;n.push({name:l.name||d.attributes.friendly_name||l.entity,value:isNaN(p)?0:p,color:h,unit:d.attributes.unit_of_measurement||"",lineWidth:null!==(a=l.line_width)&&void 0!==a?a:2,showPoints:!1!==l.show_points,fillArea:g,lineStyle:l.line_style||"solid",entityId:l.entity})}return n}_formatColor(t){if(!t)return this._getDefaultColor(0);if(Array.isArray(t)&&t.length>=3){const[e,i,r]=t;return isNaN(e)||isNaN(i)||isNaN(r)?this._getDefaultColor(0):`rgb(${Math.round(e)}, ${Math.round(i)}, ${Math.round(r)})`}return"string"==typeof t&&t.startsWith("#")||"string"==typeof t&&t.startsWith("rgb")?t:"string"!=typeof t||!t.startsWith("var(")&&"transparent"!==t?("string"==typeof t&&t.includes("NaN"),this._getDefaultColor(0)):t}_renderSimpleChart(t,e,i,o,a,n,s,l,d){const c="forecast"===t.data_source&&this._historyData[t.id];if(0===e.length&&!c)return r.qy` <div style="color: var(--secondary-text-color);">No data available</div> `;const p=("number"==typeof t.chart_height?t.chart_height:parseInt(String(t.chart_height))||345)-80;return["pie","donut"].includes(t.chart_type)?this._renderPieChart(t,e,p,o,i,a,n,s,d):["line","area"].includes(t.chart_type)?this._renderLineChart(t,e,p,i,n,s,l):this._renderBarChart(t,e,p,o,i,n,s)}_renderPieChart(t,e,i,o,a,n,s,l,d){let c=e.reduce(((t,e)=>t+e.value),0),p=e;if(void 0!==d&&!isNaN(d)){const t=Math.max(0,Math.min(100,d))/100;p=e.map((e=>Object.assign(Object.assign({},e),{value:e.value*t}))),c=p.reduce(((t,e)=>t+e.value),0)}const h=c,g=Math.max(120,Math.min(i,260)),u=g/2,y="donut"===t.chart_type,_=Number(t.slice_gap)||0,v=y?Math.floor(.72*u):_>0?Math.max(2,Math.floor(.04*u)):0,b=u-v;let x=0;const f=p.map(((t,e)=>{const i=h>0?x/h*360:0,r=i+(h>0?t.value/h*360:0);x+=t.value;let o=t.color;return s&&s[e]?o=this._formatColor(s[e]):l&&(o=this._formatColor(l)),{startDeg:i,endDeg:r,color:o,name:t.name,value:t.value,unit:t.unit,entityId:t.entityId}})),w="left"===n?"0 auto 0 0":"right"===n?"0 0 0 auto":"0 auto";return r.qy`
      <div
        style="
        display:block;
        width:${g}px;
        height:${g}px;
        margin:${w};
        overflow:hidden;
        box-sizing:border-box;
      "
      >
        <svg
          width="${g}"
          height="${g}"
          viewBox="${-u} ${-u} ${g} ${g}"
          style="display:block; overflow:visible;"
        >
          ${f.map((t=>{const e=((t,e,i,r)=>{const o=t=>t*Math.PI/180,a=Math.cos(o(i))*t,n=Math.sin(o(i))*t,s=Math.cos(o(r))*t,l=Math.sin(o(r))*t,d=r-i>180?1:0;return e<=0?`M0,0 L${a},${n} A${t},${t} 0 ${d} 1 ${s},${l} Z`:`M${a},${n} A${t},${t} 0 ${d} 1 ${s},${l} L${Math.cos(o(r))*e},${Math.sin(o(r))*e} A${e},${e} 0 ${d} 0 ${Math.cos(o(i))*e},${Math.sin(o(i))*e} Z`})(u,v,t.startDeg,t.endDeg);return r.JW`<path d="${e}" fill="${t.color}" stroke="none" />`}))}
          ${_>0?(()=>{const t=t=>t*Math.PI/180,e=Math.max(2,Math.min(6,Math.round(.012*g)));return r.JW`${f.map((i=>{const o=Math.cos(t(i.startDeg)),a=Math.sin(t(i.startDeg)),n=o*(v>0?v:e),s=a*(v>0?v:e),l=o*u,d=a*u;return r.JW`<line x1="${n}" y1="${s}" x2="${l}" y2="${d}" stroke="${"var(--card-background-color)"}" stroke-width="${e}" stroke-linecap="butt" />`}))}`})():""}
          ${""}
          ${f.map((e=>{const i=(e.startDeg+e.endDeg)/2,n=t=>t*Math.PI/180,s=y||v>0?v+.55*b:.55*u;let l=Math.cos(n(i))*s,d=Math.sin(n(i))*s;const c=.85*u;Math.abs(l)>c&&(l=Math.sign(l)*c),Math.abs(d)>c&&(d=Math.sign(d)*c);const p=e.endDeg-e.startDeg;let h=`${e.value}${e.unit||""}`;if(a&&e.entityId)try{h=(0,m.formatEntityState)(a,e.entityId,{state:e.value,includeUnit:!0})}catch(t){}const g=(t.entities||[]).find((t=>t&&t.entity===e.entityId)),_=(!g||!1!==g.label_show_name)&&p>=15,x=!g||!1!==g.label_show_value,f=p>=10,w=e.name.length>14?e.name.substring(0,14)+"...":e.name,k=h.length>10?h.substring(0,10)+"...":h;return f?r.JW`<g transform="translate(${l}, ${d})" style="pointer-events:none;">
              ${_?r.JW`<text 
                text-anchor="middle" 
                dominant-baseline="middle"
                style="${o||""}; font-size:11px; font-weight:600; fill: currentColor;"
              >${w}</text>`:""}
              ${x?r.JW`<text 
                y="${_?14:0}" 
                text-anchor="middle" 
                dominant-baseline="middle"
                style="${o||""}; font-size:10px; fill: currentColor;"
              >${k}</text>`:""}
            </g>`:r.JW``}))}
        </svg>
      </div>
    `}_renderLineChart(t,e,i,o,a,n,s){var l,d;const c=this._historyData[t.id];let p,h;this._historyError[t.id],this._historyLoading[t.id],c?(p=c.timePoints,h=c.datasets):(p=this._generateTimePoints(t.time_period),h=e.map(((e,i)=>{t.entities[i];const r=e.value||0,o=new Array(p.length).fill(r);return{name:e.name,color:e.color,values:o,lineWidth:e.lineWidth,showPoints:e.showPoints,fillArea:e.fillArea,lineStyle:e.lineStyle,unit:e.unit||"",entityId:e.entityId}}))),h=h.map(((e,i)=>{var r,o,l;const d=null===(r=t.entities)||void 0===r?void 0:r[i];let c;c=a&&a[i]?this._formatColor(a[i]):n?this._formatColor(n):this._formatColor(null==d?void 0:d.color)||e.color||this._getDefaultColor(i);const p=void 0!==s?s:!0===(null==d?void 0:d.fill_area)||e.fillArea;return Object.assign(Object.assign({},e),{color:c,lineWidth:null!==(l=null!==(o=null==d?void 0:d.line_width)&&void 0!==o?o:e.lineWidth)&&void 0!==l?l:2,showPoints:!1!==(null==d?void 0:d.show_points),fillArea:p,lineStyle:(null==d?void 0:d.line_style)||e.lineStyle||"solid"})}));let g,u,y=h;t.normalize_values&&(y=h.map((t=>{const e=Math.max(...t.values),i=Math.min(...t.values),r=e-i||1;return Object.assign(Object.assign({},t),{originalValues:t.values,values:t.values.map((t=>(t-i)/r*100)),normalizedMin:i,normalizedMax:e})}))),t.use_fixed_y_axis?(u=null!==(l=t.y_axis_min)&&void 0!==l?l:0,g=null!==(d=t.y_axis_max)&&void 0!==d?d:100,g<=u&&(g=u+1)):(g=Math.max(...y.flatMap((t=>t.values))),u=Math.min(...y.flatMap((t=>t.values))));const _=g-u,v=!1!==t.show_grid,b=!0===t.show_time_intervals,x=t;let f=(t.design||{}).background_color||x.background_color;f="transparent"===f?"var(--card-background-color)":f?this._formatColor(f):"var(--card-background-color, transparent)",Boolean(c&&"history"===c.source);const w=!1!==t.show_grid_values&&v?28:10,k=12,$=300-w-5,S=88-(b?18:8),C=Math.max(1,Math.ceil(p.length/6));return r.qy`
      <div
        class="line-chart-container"
        style="
          width: 100%; 
          height: ${i}px; 
          position: relative; 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0;
          overflow: visible;
          contain: layout style;
        "
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 100"
          preserveAspectRatio="xMidYMid meet"
          style="
            display: block; 
            width: 100%; 
            height: 100%; 
            margin: 0; 
            padding: 0;
            overflow: visible;
          "
        >
          ${v?r.JW`${Array.from({length:4},((e,i)=>{const o=k+(i+1)/5*S,a=g-(i+1)/5*_,n=!1!==t.show_grid_values;return r.JW`
                  <line 
                    x1="${w}" 
                    y1="${o}" 
                    x2="${295}" 
                    y2="${o}" 
                    stroke="rgba(255,255,255,.08)" 
                    stroke-width="0.5"
                    vector-effect="non-scaling-stroke"
                  />
                  ${n?r.JW`<text 
                          x="${w-3}" 
                          y="${o+2}" 
                          font-size="7" 
                          fill="var(--secondary-text-color)" 
                          opacity="0.6"
                          text-anchor="end"
                        >${Math.round(a)}</text>`:""}
                `}))}`:""}
          ${(()=>y.map((e=>{var i;const a=e.values.map(((t,e)=>`${p.length>1?w+e/(p.length-1)*$:w+$/2},${_>0?k+(g-t)/_*S:k+S/2}`)),n=(e=>{if(!t.smooth_curves)return e.map(((t,e)=>{const[i,r]=t.split(",");return`${0===e?"M":"L"} ${i} ${r}`})).join(" ");if(e.length<2){const[t,i]=e[0].split(",");return`M ${t} ${i}`}let i="";const r=e.map((t=>{const[e,i]=t.split(",");return{x:parseFloat(e),y:parseFloat(i)}}));i=`M ${r[0].x} ${r[0].y}`;for(let t=0;t<r.length-1;t++){const e=r[Math.max(0,t-1)],o=r[t],a=r[t+1],n=r[Math.min(r.length-1,t+2)],s=.5;i+=` C ${o.x+(a.x-e.x)/6*s} ${o.y+(a.y-e.y)/6*s}, ${a.x-(n.x-o.x)/6*s} ${a.y-(n.y-o.y)/6*s}, ${a.x} ${a.y}`}return i})(a),s=a[a.length-1].split(",")[0],l=a[0].split(",")[0],d=this._colorWithAlpha(e.color,.25),c="dashed"===e.lineStyle?"4 3":"dotted"===e.lineStyle?"1 3":"none",u=k+S;return r.JW`<g>
                ${!0===e.fillArea?r.JW`<path d="${n} L ${s} ${u} L ${l} ${u} Z" fill="${d}" stroke="none" />`:""}
                <path d="${n}" stroke="${e.color}" stroke-width="${null!==(i=e.lineWidth)&&void 0!==i?i:2}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${c}" vector-effect="non-scaling-stroke" />
                ${!1!==e.showPoints?r.JW`${e.values.map(((i,a)=>{const n=p.length>1?w+a/(p.length-1)*$:w+$/2,s=_>0?k+(g-i)/_*S:k+S/2,l="transparent"===f?"var(--card-background-color)":f,d=`point-${t.id}-${a}-${h.indexOf(e)}`;return r.JW`
                          <circle 
                            id="${d}"
                            cx="${n}" 
                            cy="${s}" 
                            r="3" 
                            fill="${l}" 
                            stroke="${e.color}" 
                            stroke-width="1.5"
                            vector-effect="non-scaling-stroke"
                            style="cursor: ${!1!==t.show_tooltips?"pointer":"default"};"
                            @mouseenter=${!1!==t.show_tooltips?r=>{const n=e.originalValues?e.originalValues[a]:i;let s=`${n}${e.unit||""}`;e.entityId&&(s=(0,m.formatEntityState)(o,e.entityId,{state:n,includeUnit:!0})),this._showTooltip(r,t.id,e.name,s,p[a])}:null}
                            @mouseleave=${!1!==t.show_tooltips?e=>this._hideTooltip(t.id,e):null}
                          >
                            ${!1!==t.show_tooltips?r.JW`
                              <animate 
                                attributeName="r" 
                                begin="mouseenter" 
                                dur="0.2s" 
                                from="3" 
                                to="5" 
                                fill="freeze" 
                              />
                              <animate 
                                attributeName="r" 
                                begin="mouseleave" 
                                dur="0.2s" 
                                from="5" 
                                to="3" 
                                fill="freeze" 
                              />
                            `:""}
                          </circle>
                        `}))}`:""}
              </g>`})))()}
          ${b?r.JW`${p.map(((t,e)=>{if(e%C!=0&&e!==p.length-1)return r.JW``;const i=p.length>1?w+e/(p.length-1)*$:w+$/2,o=k+S+10;return r.JW`<text
                  x="${i}"
                  y="${o}"
                  font-size="7"
                  fill="var(--secondary-text-color)"
                  opacity="0.8"
                  text-anchor="middle"
                >${t}</text>`}))}`:""}
        </svg>
      </div>
    `}_renderLegend(t,e,i){return r.qy`<div
      class="graph-legend"
      style="
        position:absolute; 
        ${{top_left:"top:8px; left:8px; justify-content:flex-start;",top_right:"top:8px; right:8px; justify-content:flex-end;",bottom_left:"bottom:8px; left:8px; justify-content:flex-start;",bottom_right:"bottom:8px; right:8px; justify-content:flex-end;"}[e]}; 
        display:flex; 
        gap:8px; 
        flex-wrap:wrap; 
        font-size:12px; 
        ${i||""}; 
        z-index:10;
        max-width: calc(100% - 16px);
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      "
    >
      ${t.map((t=>r.qy`<div
            style="
            display:flex; 
            align-items:center; 
            gap:4px;
            min-width: 0;
            flex-shrink: 1;
          "
          >
            <span
              style="
              width:10px; 
              height:10px; 
              background:${t.color}; 
              border-radius:2px;
              flex-shrink: 0;
            "
            ></span>
            <span
              style="
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              min-width: 0;
            "
              >${t.name}</span
            >
          </div>`))}
    </div>`}_colorWithAlpha(t,e){if(!t)return`rgba(33, 150, 243, ${e})`;if(t.startsWith("#")){const i=t.replace("#",""),r=parseInt(3===i.length?i.split("").map((t=>t+t)).join(""):i,16);return`rgba(${r>>16&255}, ${r>>8&255}, ${255&r}, ${e})`}return t.startsWith("rgb(")?t.replace("rgb(","rgba(").replace(")",`, ${e})`):t}_renderBarChart(t,e,i,o,a,n,s){var l,d,c;const p=this._historyData[t.id];let h=[],g=[];if(p&&Array.isArray(p.timePoints)&&p.timePoints.length&&(h=p.timePoints,g=(p.datasets||[]).map(((t,e)=>{let i;return i=n&&n[e]?this._formatColor(n[e]):s?this._formatColor(s):this._formatColor(t.color)||this._getDefaultColor(e),{name:t.name,color:i,values:Array.isArray(t.values)?t.values:[],unit:t.unit,entityId:t.entityId}}))),0!==h.length&&0!==g.length||(h=this._generateTimePoints(t.time_period),g=(t.entities||[]).filter((e=>"forecast"===t.data_source?e.forecast_attribute:e.entity)).map(((i,r)=>{const o=e[r],a=o?o.value:0,l=new Array(h.length).fill(a);let d;return d=n&&n[r]?this._formatColor(n[r]):s?this._formatColor(s):this._formatColor(i.color)||this._getDefaultColor(r),{name:i.name||(null==o?void 0:o.name)||i.entity||this._getForecastAttributeLabel(i.forecast_attribute||""),color:d,values:l,unit:null==o?void 0:o.unit,entityId:(null==o?void 0:o.entityId)||i.entity||t.forecast_entity}}))),0===h.length||0===g.length)return r.qy`<div style="color: var(--secondary-text-color);">No data available</div>`;let u=g;t.normalize_values&&g.length>1&&(u=g.map((t=>{const e=Math.max(...t.values),i=Math.min(...t.values),r=e-i||1;return Object.assign(Object.assign({},t),{originalValues:t.values,values:t.values.map((t=>(t-i)/r*100))})})));const y=u.flatMap((t=>t.values));let _,v;t.use_fixed_y_axis?(v=null!==(l=t.y_axis_min)&&void 0!==l?l:0,_=null!==(d=t.y_axis_max)&&void 0!==d?d:100,_<=v&&(_=v+1)):(_=y.length?Math.max(...y):0,v=y.length?Math.min(...y):0);const b=_-v||1,x=Math.max(40,i-28);let f;f=v>=0?x:_<=0?0:_*(x/b);const w=t.chart_alignment||"center",k="left"===w?"flex-start":"right"===w?"flex-end":"center",$=u.length,S=Math.max(12,Math.min(28,32-$)),C=Math.max(48,Math.round(S+Math.max(0,$-1)*S*.55)+12),z=(Math.max(C*h.length,120),!1!==t.show_tooltips),T=null!==(c=t.bar_display_limit)&&void 0!==c?c:0;let D=h,M=u;if(T>0&&h.length>T){const t=h.length-T;D=h.slice(t),M=u.map((e=>Object.assign(Object.assign({},e),{values:e.values.slice(t),originalValues:e.originalValues?e.originalValues.slice(t):void 0})))}const A=Math.max(C*D.length,120),F=!(t.info_position||"top_left").startsWith("top")||!1===t.show_display_name&&!1===t.show_entity_value?12:80,E=!1!==t.show_legend,L=t.legend_position||"bottom_left",O=E&&L.startsWith("bottom"),P=O?Math.ceil($/2):0,U=O?Math.max(40,24+24*P):12,I=Math.max(40,x-F-U);return r.qy`
      <div
        class="bar-chart-container"
        style="
          width:100%;
          height:${i}px;
          display:flex;
          flex-direction:column;
          align-items:stretch;
          overflow:hidden;
          box-sizing:border-box;
          padding-top:${F}px;
          padding-bottom:${U}px;
        "
      >
        <div
          class="bar-chart-scroll"
          style="
            width:100%;
            max-width:100%;
            flex:1;
            overflow-x:auto;
            overflow-y:hidden;
            box-sizing:border-box;
            -webkit-overflow-scrolling:touch;
            scrollbar-width:thin;
            scrollbar-color:var(--primary-color) transparent;
          "
        >
          <div
            class="bar-chart-groups"
            style="
              position:relative;
              display:flex;
              align-items:flex-end;
              justify-content:${k};
              gap:12px;
              min-width:${A}px;
              width:fit-content;
              height:${I}px;
              padding:0 12px;
              box-sizing:border-box;
            "
          >
            ${D.map(((e,i)=>r.qy`
                <div
                  class="bar-group"
                  style="
                    flex:0 0 ${C}px;
                    height:100%;
                    position:relative;
                    box-sizing:border-box;
                  "
                >
                  <div
                    class="bar-group-inner"
                    style="
                      position:relative;
                      width:100%;
                      height:100%;
                    "
                  >
                    <div
                      class="bar-group-zero-line"
                      style="
                        position:absolute;
                        left:0;
                        right:0;
                        top:${v>=0?I:_<=0?0:_*(I/b)}px;
                        border-top:1px solid rgba(255,255,255,0.1);
                        pointer-events:none;
                      "
                    ></div>
                    ${M.map(((n,s)=>{var l;const d=null!==(l=n.values[i])&&void 0!==l?l:0,c=t.normalize_values&&n.originalValues?n.originalValues[i]:n.values[i],p=n.entityId;let h=`${null!=c?c:0}${n.unit||""}`;if(a&&void 0!==p&&void 0!==c)try{h=(0,m.formatEntityState)(a,p,{state:c,includeUnit:!0})}catch(t){}const g=I/b,u=v>=0?I:_<=0?0:_*g,y=_===v?u:(_-d)*g,x=Math.min(u,y),f=Math.abs(u-y),w=Math.max(2,Math.min(f,I)),k=.55*S*(s-($-1)/2),C=1===$;return r.qy`
                        <div
                          class="bar-segment"
                          style="
                            position:absolute;
                            left:50%;
                            bottom:0;
                            width:${S}px;
                            transform:translateX(${k}px);
                            border-radius:3px 3px 0 0;
                            background:${n.color};
                            box-shadow:0 4px 10px rgba(0,0,0,0.15);
                            cursor:${z?"pointer":"default"};
                            top:${x}px;
                            height:${w}px;
                            z-index:${100+s};
                          "
                          @mouseenter=${z?i=>this._showTooltip(i,t.id,n.name,h,e):null}
                          @mouseleave=${z?e=>this._hideTooltip(t.id,e):null}
                          title=${z?"":h}
                        >
                          ${C?r.qy`<span
                                style="
                                  position:absolute;
                                  left:50%;
                                  bottom:100%;
                                  transform:translate(-50%, -6px);
                                  font-size:11px;
                                  color: var(--secondary-text-color);
                                  white-space:nowrap;
                                  ${o||""};
                                "
                              >
                                ${h}
                              </span>`:""}
                        </div>
                      `}))}
                  </div>
                  <div
                    class="bar-group-label"
                    style="
                      margin-top:4px;
                      font-size:11px;
                      text-align:center;
                      color: var(--secondary-text-color);
                      white-space:nowrap;
                      overflow:hidden;
                      text-overflow:ellipsis;
                    "
                  >
                    ${e}
                  </div>
                </div>
              `))}
          </div>
        </div>
      </div>
    `}_showTooltip(t,e,i,r,o){const a=t.target,n=a.closest(".ultra-popup-portal")||document.body;let s=document.getElementById(`graph-tooltip-${e}`);s&&s.parentElement!==n&&(s.remove(),s=null),s||(s=document.createElement("div"),s.id=`graph-tooltip-${e}`,s.style.cssText=`\n        position: fixed;\n        display: none;\n        background: var(--card-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 6px;\n        padding: 10px 14px;\n        font-size: 14px;\n        color: var(--primary-text-color);\n        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);\n        pointer-events: none;\n        z-index: ${_.Mu.GRAPH_TOOLTIP};\n        white-space: nowrap;\n      `,n.appendChild(s)),s.innerHTML=`\n      <div style="font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;">${i}</div>\n      <div style="color: var(--secondary-text-color); font-size: 12px;">${o}</div>\n      <div style="font-size: 16px; margin-top: 4px; color: var(--primary-color);">${r}</div>\n    `;const l=a.getBoundingClientRect(),d=l.left+l.width/2,c=l.top;s.style.display="block",s.style.left=`${d}px`,s.style.top=c-10+"px",s.style.transform="translate(-50%, -100%)"}_hideTooltip(t,e){const i=document.getElementById(`graph-tooltip-${t}`);i&&(i.style.display="none")}_generateTimePoints(t){const e=[],i=new Date;let r=12,o="hour";switch(t){case"1h":r=12,o="5min";break;case"24h":r=24,o="hour";break;case"7d":r=7,o="day";break;case"30d":r=30,o="day";break;case"90d":r=12,o="week";break;case"365d":r=12,o="month"}for(let t=r-1;t>=0;t--){const r=new Date(i);"5min"===o?(r.setMinutes(r.getMinutes()-5*t),e.push(r.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}))):"hour"===o?(r.setHours(r.getHours()-t),e.push(r.toLocaleTimeString([],{hour:"2-digit"}))):"day"===o?(r.setDate(r.getDate()-t),e.push(r.toLocaleDateString([],{month:"short",day:"numeric"}))):"week"===o?(r.setDate(r.getDate()-7*t),e.push(r.toLocaleDateString([],{month:"short",day:"numeric"}))):"month"===o&&(r.setMonth(r.getMonth()-t),e.push(r.toLocaleDateString([],{month:"short"})))}return e}_generateTimeSeriesData(t,e,i){const r=[];let o=isNaN(t)?50:t;const a=i.toLowerCase().includes("odometer")||i.toLowerCase().includes("counter")||i.toLowerCase().includes("total")||i.toLowerCase().includes("mileage"),n=i.toLowerCase().includes("energy")||i.toLowerCase().includes("kwh");let s=this._hashString(i);a&&o>1e3&&(o*=.95);for(let i=0;i<e;i++){const i=(s=1664525*s+1013904223>>>0,(4294967295&s)/4294967296);if(a){const r=.05*t/e;o=o+r+i*r*.5}else if(n)o+=.1*t/e*i;else{const t=(i-.5)*o*.1;o=Math.max(0,o+t)}r.push(Math.round(10*o)/10)}return r}_hashString(t){let e=2166136261;for(let i=0;i<t.length;i++)e^=t.charCodeAt(i),e=Math.imul(e,16777619);return e>>>0}_triggerHistoryLoad(t,e){this._historyLoading[t.id]||(this._historyLoading[t.id]=!0,this._deferredHistoryScheduled[t.id]=!0,this._fetchHistoryDataAsync(t,e))}_loadHistoryData(t,e){if(t.entities&&0!==t.entities.length)if("forecast"!==t.data_source){if(!this._historyData[t.id]){const e=this._tryReadCache(t);e&&(this._historyData[t.id]=Object.assign(Object.assign({},e),{source:"cache"}))}if(!this._historyData[t.id]){const i=this._tryFastHistoryPath(t,e);i&&(this._historyData[t.id]=i)}this._historyLoading[t.id]||this._deferredHistoryScheduled[t.id]||(this._deferredHistoryScheduled[t.id]=!0,this._historyLoading[t.id]=!0,this._fetchHistoryDataAsync(t,e))}else this._loadForecastData(t,e)}_tryFastHistoryPath(t,e){try{if(0===t.entities.filter((t=>t.entity)).map((t=>t.entity)).length)return null;const i=this._generateTimePoints(t.time_period),r=t.entities.filter((t=>t.entity)).map(((t,r)=>{var o;const a=e.states[t.entity];if(!a)return null;let n=0;n=t.attribute&&a.attributes[t.attribute]?parseFloat(a.attributes[t.attribute])||0:parseFloat(a.state)||0;const s=new Array(i.length).fill(n);return{name:t.name||a.attributes.friendly_name||t.entity,color:this._formatColor(t.color)||this._getDefaultColor(r),values:s,lineWidth:null!==(o=t.line_width)&&void 0!==o?o:2,showPoints:!1!==t.show_points,fillArea:!0===t.fill_area,lineStyle:t.line_style||"solid",unit:(null==a?void 0:a.attributes.unit_of_measurement)||"",entityId:t.entity}})).filter((t=>null!==t));if(0===r.length)return null;const o=r.flatMap((t=>t.values));return{timePoints:i,datasets:r,min:Math.min(...o),max:Math.max(...o),lastUpdated:Date.now(),source:"fast-path"}}catch(t){return null}}async _fetchHistoryDataAsync(t,e){try{const i=new Date;let r=24;switch(t.time_period){case"1h":r=1;break;case"3h":r=3;break;case"6h":r=6;break;case"12h":r=12;break;case"24h":default:r=24;break;case"2d":r=48;break;case"7d":r=168;break;case"30d":r=720;break;case"90d":r=2160;break;case"365d":r=8760}const o=new Date(i.getTime()-60*r*60*1e3),a=t.entities.filter((t=>t.entity)).map((t=>t.entity));if(0===a.length)return;window.ultraCardGraphDebug={entityIds:a,startTime:o.toISOString(),endTime:i.toISOString(),status:"fetching"},Math.min(100,4*r),a.forEach((t=>{e.states[t]}));const n={};try{let t,r;try{r=await e.callWS({type:"history/history_during_period",start_time:o.toISOString(),end_time:i.toISOString(),entity_ids:a,include_start_time_state:!0,significant_changes_only:!1,minimal_response:!1}),t=r&&"object"==typeof r?a.map((t=>r[t]||[])).filter((t=>t.length>0)):[]}catch(r){const n=o.toISOString();t=await e.callApi("GET",`history/period/${n}`,{filter_entity_id:a.join(","),end_time:i.toISOString()})}if(window.ultraCardGraphDebug.response=t,window.ultraCardGraphDebug.status="success",r&&"object"==typeof r&&!Array.isArray(r)?Object.entries(r).forEach((([t,e])=>{Array.isArray(e)&&e.length>0&&(n[t]=e)})):Array.isArray(t)&&t.forEach((t=>{if(Array.isArray(t)&&t.length>0){const e=t[0].entity_id;n[e]=t}})),0===Object.keys(n).length)throw new Error("No history data returned from API")}catch(t){window.ultraCardGraphDebug.error=t,window.ultraCardGraphDebug.errorDetails={message:t.message,status:t.status,statusText:t.statusText,body:t.body,stack:t.stack},window.ultraCardGraphDebug.status="error";for(const t of a){const i=e.states[t];i&&(n[t]=[{entity_id:t,state:i.state,last_changed:(new Date).toISOString(),last_updated:(new Date).toISOString(),attributes:i.attributes}])}}const s=this._generateTimePoints(t.time_period),l=t.entities.map(((t,r)=>{var a;if(!t.entity)return null;let l;if(Array.isArray(n))l=n;else{if(!n[t.entity])return null;l=n[t.entity]}const d=e.states[t.entity],c=this._processHistoryData(l,s,t.attribute,o,i);return{name:t.name||(null==d?void 0:d.attributes.friendly_name)||t.entity,color:this._formatColor(t.color)||this._getDefaultColor(r),values:c,lineWidth:null!==(a=t.line_width)&&void 0!==a?a:2,showPoints:!1!==t.show_points,fillArea:!0===t.fill_area,lineStyle:t.line_style||"solid",unit:(null==d?void 0:d.attributes.unit_of_measurement)||"",entityId:t.entity}})).filter((t=>null!==t)),d=l.flatMap((t=>t.values)),c=Math.min(...d),p=Math.max(...d);this._historyData[t.id]={timePoints:s,datasets:l,min:c,max:p,lastUpdated:Date.now(),source:"history"},this._historyLoading[t.id]=!1,this._writeCache(t,this._historyData[t.id]),this.requestUpdate()}catch(e){this._historyError[t.id]="Failed to load history data",this._historyLoading[t.id]=!1,this.requestUpdate()}}_processHistoryData(t,e,i,r,o){if(!t||0===t.length)return new Array(e.length).fill(0);const a=[],n=t=>{if(null==t)return null;if("number"==typeof t&&isFinite(t))return t;const e=String(t).trim().toLowerCase();if("unknown"===e||"unavailable"===e||"none"===e||"null"===e)return null;const i=parseFloat(e);return isNaN(i)?null:i},s=(null==r?void 0:r.getTime())||Date.now()-864e5,l=((null==o?void 0:o.getTime())||Date.now())-s,d=t.map((t=>{let e;if(void 0!==t.s&&void 0!==t.lu)e={state:t.s,attributes:t.a||{},timestamp:1e3*t.lu};else{if(void 0===t.state||void 0===t.last_changed)return null;e={state:t.state,attributes:t.attributes||{},timestamp:new Date(t.last_changed).getTime()}}return"unavailable"===e.state||"unknown"===e.state?null:e})).filter((t=>null!==t)).sort(((t,e)=>t.timestamp-e.timestamp));return e.forEach(((t,r)=>{const o=r/(e.length-1),c=s+l*o;let p=null;for(let t=d.length-1;t>=0;t--){const e=d[t];if(e.timestamp<=c){const t=i?e.attributes[i]:e.state,r=n(t);if(null!==r){p=r;break}}}if(null===p)for(let t=d.length-1;t>=0;t--){const e=d[t],r=i?e.attributes[i]:e.state,o=n(r);if(null!==o){p=o;break}}a.push(null!=p?p:0)})),a}_coerceNumber(t){if(null==t)return null;if("number"==typeof t&&isFinite(t))return t;const e=String(t).trim().toLowerCase();if("unknown"===e||"unavailable"===e||"none"===e||"null"===e)return null;const i=parseFloat(e);return isNaN(i)?null:i}async _fetchForecastData(t,e){var i,r;if(!t.forecast_entity||!e)throw new Error("Forecast entity not configured");try{const o=await e.callWS({type:"call_service",domain:"weather",service:"get_forecasts",service_data:{type:t.forecast_type||"hourly"},target:{entity_id:t.forecast_entity},return_response:!0}),a=null===(r=null===(i=null==o?void 0:o.response)||void 0===i?void 0:i[t.forecast_entity])||void 0===r?void 0:r.forecast;if(!a||!Array.isArray(a))throw console.error("Ultra Card: Invalid forecast data received from weather service"),new Error("Invalid forecast data received from weather service");return a}catch(t){throw console.error("Ultra Card: Failed to fetch forecast data:",t),t}}_processForecastData(t,e,i){const r=(e.entities||[]).filter((t=>t.forecast_attribute)).map(((r,o)=>{var a;const n=r.forecast_attribute,s=t.map((t=>{const e=t[n];return"number"==typeof e?e:parseFloat(e)||0})).slice(0,i.length);return{name:r.name||this._getForecastAttributeLabel(n),color:this._formatColor(r.color)||this._getDefaultColor(o),values:s,lineWidth:null!==(a=r.line_width)&&void 0!==a?a:2,showPoints:!1!==r.show_points,fillArea:!0===r.fill_area,lineStyle:r.line_style||"solid",unit:this._getForecastAttributeUnit(n),entityId:e.forecast_entity}}));return{timePoints:this._generateForecastTimePoints(t,e.forecast_type),datasets:r,min:Math.min(...r.flatMap((t=>t.values))),max:Math.max(...r.flatMap((t=>t.values))),lastUpdated:Date.now(),source:"forecast"}}_generateForecastTimePoints(t,e){return t.map((t=>{const i=new Date(t.datetime);return"daily"===e?i.toLocaleDateString([],{month:"short",day:"numeric"}):i.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}))}_getForecastAttributeLabel(t){return this.FORECAST_ATTRIBUTE_LABELS[t]||t}_getForecastAttributeUnit(t){return this.FORECAST_ATTRIBUTE_UNITS[t]||""}_loadForecastData(t,e){if(t.forecast_entity){if(!this._historyData[t.id]){const e=this._tryReadCache(t);e&&"forecast"===e.source&&(this._historyData[t.id]=e)}this._historyLoading[t.id]||this._deferredHistoryScheduled[t.id]||(this._deferredHistoryScheduled[t.id]=!0,this._historyLoading[t.id]=!0,this._fetchForecastDataAsync(t,e))}}async _fetchForecastDataAsync(t,e){try{let i=await this._fetchForecastData(t,e);i=this._applyForecastDisplayLimits(i,t);const r=this._generateForecastTimePoints(i,t.forecast_type),o=this._processForecastData(i,t,r);this._historyData[t.id]=o,this._historyLoading[t.id]=!1,this._writeCache(t,o),this.requestUpdate(),setTimeout((()=>{this.triggerPreviewUpdate();const t=document.querySelector("ultra-card");t&&t.requestUpdate&&t.requestUpdate()}),100)}catch(e){console.error("Ultra Card: Failed to load forecast data:",e),this._historyError[t.id]="Failed to load forecast data",this._historyLoading[t.id]=!1,this.requestUpdate()}}_applyForecastDisplayLimits(t,e){var i,r;const o=null!==(i=e.forecast_display_hours)&&void 0!==i?i:0,a=null!==(r=e.forecast_display_days)&&void 0!==r?r:0;if(o<=0&&a<=0)return t;let n;n=a>0?24*a*60*60*1e3:60*o*60*1e3;const s=Date.now()+n;return t.filter((t=>new Date(t.datetime).getTime()<=s))}_getDefaultColor(t){return this.DEFAULT_COLORS[t%this.DEFAULT_COLORS.length]}_addEntity(t,e){var i;const r={id:this.generateId("entity"),entity:"",name:"",attribute:"",color:this._getDefaultColor((null===(i=t.entities)||void 0===i?void 0:i.length)||0),show_points:!0,fill_area:!0,line_width:2,line_style:"solid"};"forecast"===t.data_source&&(r.forecast_attribute="temperature"),e({entities:[...t.entities||[],r]})}_removeEntity(t,e,i){const r=[...t.entities||[]];r.splice(e,1),i({entities:r})}_updateEntity(t,e,i,r,o){const a=[...t.entities||[]];a[e]=Object.assign(Object.assign({},a[e]),i),delete this._historyData[t.id],delete this._historyError[t.id],delete this._historyLoading[t.id],delete this._deferredHistoryScheduled[t.id];try{const e=this._getCacheStore();delete e[this._makeCacheKey(t)],delete e[t.id],this._persistCacheStore(e)}catch(t){}r({entities:a});const n=Object.assign(Object.assign({},t),{entities:a});o&&this._loadHistoryData(n,o),this.requestUpdate(),setTimeout((()=>{this.triggerPreviewUpdate(),window.dispatchEvent(new CustomEvent("ultra-graph-entity-changed",{detail:{moduleId:t.id},bubbles:!0,composed:!0}))}),50)}_toggleEntityOptions(t,e){var i;t.stopPropagation();const r=null===(i=t.target)||void 0===i?void 0:i.closest(".entity-card"),o=null==r?void 0:r.querySelector(".entity-advanced-options"),a=null==r?void 0:r.querySelector(".entity-toggle-btn");o&&a&&(this.expandedEntities.has(e)?(this.expandedEntities.delete(e),o.style.maxHeight="0",o.style.opacity="0",o.style.marginTop="0",o.style.borderTop="none",a.style.transform="rotate(0deg)"):(this.expandedEntities.add(e),o.style.maxHeight=o.scrollHeight+"px",o.style.opacity="1",o.style.marginTop="16px",o.style.borderTop="1px solid var(--divider-color)",a.style.transform="rotate(180deg)"))}_getEntityAttributes(t,e){if(!t||!e.states[t])return[];const i=e.states[t].attributes;return Object.keys(i).filter((t=>!["friendly_name","icon","entity_picture"].includes(t))).map((t=>({value:t,label:t})))}_renderSizeControl(t,e,i,o,a,n,s,l,d,c){return r.qy`
      <div class="field-container" style="margin-bottom: 16px;">
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
        >
          ${d}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
        >
          ${c}
        </div>
        <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
          <input
            type="range"
            class="gap-slider"
            min="${n}"
            max="${s}"
            step="1"
            .value="${a}"
            @input=${r=>{const a=r.target,n=parseInt(a.value);e>=0?this._updateEntity(t,e,{[o]:n},i):i({[o]:n})}}
          />
          <input
            type="number"
            class="gap-input"
            min="${n}"
            max="${s}"
            step="1"
            .value="${a}"
            @input=${r=>{const a=r.target,n=parseInt(a.value);isNaN(n)||(e>=0?this._updateEntity(t,e,{[o]:n},i):i({[o]:n}))}}
            @keydown=${r=>{if("ArrowUp"===r.key||"ArrowDown"===r.key){r.preventDefault();const a=r.target,d=parseInt(a.value)||l,c="ArrowUp"===r.key?1:-1,p=Math.max(n,Math.min(s,d+c));e>=0?this._updateEntity(t,e,{[o]:p},i):i({[o]:p})}}}
          />
          <button
            class="reset-btn"
            @click=${()=>{e>=0?this._updateEntity(t,e,{[o]:l},i):i({[o]:l})}}
            title="Reset to default (${l})"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `}hasActiveLink(t){const e=t.tap_action&&"default"!==t.tap_action.action&&"nothing"!==t.tap_action.action,i=t.hold_action&&"default"!==t.hold_action.action&&"nothing"!==t.hold_action.action,r=t.double_tap_action&&"default"!==t.double_tap_action.action&&"nothing"!==t.double_tap_action.action;return e||i||r}handleClick(t,e,i,r){t.preventDefault(),this.clickTimeout&&clearTimeout(this.clickTimeout),this.clickTimeout=setTimeout((()=>{this.handleTapAction(t,e,i,r)}),300)}handleDoubleClick(t,e,i){t.preventDefault(),this.clickTimeout&&(clearTimeout(this.clickTimeout),this.clickTimeout=null),this.handleDoubleAction(t,e,i)}handleMouseDown(t,e,i){this.isHolding=!1,this.holdTimeout=setTimeout((()=>{this.isHolding=!0,this.handleHoldAction(t,e,i)}),500)}handleMouseUp(t,e,i){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null)}handleMouseLeave(t,e,i){this.holdTimeout&&(clearTimeout(this.holdTimeout),this.holdTimeout=null),this.isHolding=!1}handleTouchStart(t,e,i){this.handleMouseDown(t,e,i)}handleTouchEnd(t,e,i){this.handleMouseUp(t,e,i)}handleTapAction(t,e,i,r){this.isHolding||e.tap_action&&"nothing"===e.tap_action.action||d.K.handleAction(e.tap_action||{action:"default"},i,t.target,r,e.entity,e)}handleHoldAction(t,e,i,r){e.hold_action&&"nothing"===e.hold_action.action||d.K.handleAction(e.hold_action||{action:"default"},i,t.target,r,e.entity,e)}handleDoubleAction(t,e,i,r){e.double_tap_action&&"nothing"===e.double_tap_action.action||d.K.handleAction(e.double_tap_action||{action:"default"},i,t.target,r,e.entity,e)}styleObjectToCss(t){return Object.entries(t).map((([t,e])=>`${this.camelToKebab(t)}: ${e}`)).join("; ")}_resolveChartWidth(t){const e=t.chart_width_percent;if("number"==typeof e&&isFinite(e))return`${Math.max(10,Math.min(100,Math.round(e)))}%`;const i=t.chart_width;return"string"==typeof i&&""!==i.trim()?i.trim():"100%"}camelToKebab(t){return t.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g,"$1-$2").toLowerCase()}addPixelUnit(t){return t?/^\d+$/.test(t)?`${t}px`:/^[\d\s]+$/.test(t)?t.split(" ").map((t=>t.trim()?`${t}px`:t)).join(" "):t:t}getPaddingCSS(t){return t.padding_top||t.padding_bottom||t.padding_left||t.padding_right?`${this.addPixelUnit(t.padding_top)||"0px"} ${this.addPixelUnit(t.padding_right)||"0px"} ${this.addPixelUnit(t.padding_bottom)||"0px"} ${this.addPixelUnit(t.padding_left)||"0px"}`:"0"}getMarginCSS(t){return t.margin_top||t.margin_bottom||t.margin_left||t.margin_right?`${this.addPixelUnit(t.margin_top)||"8px"} ${this.addPixelUnit(t.margin_right)||"0px"} ${this.addPixelUnit(t.margin_bottom)||"8px"} ${this.addPixelUnit(t.margin_left)||"0px"}`:"8px 0"}getBackgroundCSS(t){return t.background_color||"transparent"}getBackgroundImageCSS(t,e){var i,r;const o=t.background_image_type,a=t.background_image,n=t.background_image_entity;if(!o||"none"===o)return"none";switch(o){case"upload":if(a)return`url("${(0,u.V)(e,a)}")`;break;case"url":if(a)return`url("${a}")`;break;case"entity":if(n&&e){const t=e.states[n];if(t){const o=(null===(i=t.attributes)||void 0===i?void 0:i.entity_picture)||(null===(r=t.attributes)||void 0===r?void 0:r.image)||("string"==typeof t.state?t.state:"");if(o&&"unknown"!==o&&"unavailable"!==o)return`url("${(0,u.V)(e,o)}")`}}}return"none"}getBorderCSS(t){const e=t.border;return e&&"none"!==e.style?`${e.width||1}px ${e.style||"solid"} ${e.color||"#ccc"}`:"none"}renderLogicTab(t,e,i,r){return p.X.render(t,e,(t=>r(t)))}validate(t){const e=t,i=[...super.validate(t).errors];return"custom"===e.time_period&&(e.custom_time_start&&!e.custom_time_end&&i.push("Custom end time is required when start time is set"),e.custom_time_end&&!e.custom_time_start&&i.push("Custom start time is required when end time is set")),e.template_mode&&e.template&&""===e.template.trim()&&i.push("Template code is required when template mode is enabled"),{valid:0===i.length,errors:i}}getStyles(){return`\n      .uc-graphs-module {\n        width: 100%;\n        box-sizing: border-box;\n        margin: 0;\n        padding: 0;\n        position: relative;\n        overflow: hidden;\n        contain: layout style;\n      }\n\n      /* Graph content area containment */\n      .uc-graphs-module .chart-container {\n        position: relative;\n        width: 100%;\n        height: 100%;\n        overflow: hidden;\n        box-sizing: border-box;\n      }\n\n      /* Legend containment */\n      .uc-graphs-module .graph-legend {\n        max-width: calc(100% - 16px) !important;\n        box-sizing: border-box;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      .uc-graphs-module .graph-legend > div {\n        min-width: 0;\n        flex-shrink: 1;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n\n      /* Header info containment */\n      .uc-graphs-module .graph-header-info {\n        max-width: calc(100% - 32px) !important;\n        box-sizing: border-box;\n        overflow: hidden;\n      }\n\n      .uc-graphs-module .graph-title,\n      .uc-graphs-module .graph-value {\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n        max-width: 100%;\n      }\n\n      .entity-card {\n        transition: all 0.2s ease;\n      }\n\n      .entity-card:hover {\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n      }\n\n      .entity-advanced-options {\n        transition: max-height 0.3s ease, opacity 0.2s ease;\n        opacity: 0;\n      }\n\n      .entity-advanced-options[data-expanded="true"] {\n        opacity: 1;\n      }\n\n      .entity-toggle-button ha-icon {\n        transition: transform 0.2s ease;\n      }\n\n      .entity-header {\n        cursor: pointer;\n      }\n\n      .entity-header:hover .entity-toggle-button {\n        color: var(--primary-color);\n      }\n\n      .uc-graphs-general-tab,\n      .uc-graphs-actions-tab,\n      .uc-graphs-other-tab {\n        padding: 16px;\n        width: 100%;\n        max-width: 100%;\n        box-sizing: border-box;\n        overflow: visible;\n      }\n\n      .entities-repeater {\n        margin: 16px 0;\n      }\n\n      .entity-item {\n        background: var(--card-background-color);\n        border: 1px solid var(--divider-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 12px;\n      }\n\n      .entity-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin-bottom: 12px;\n      }\n\n      .entity-number {\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n\n      .chart-container {\n        position: relative;\n        width: 100%;\n        margin: 0 !important;\n        padding: 0 !important;\n        box-sizing: border-box;\n      }\n\n      .chart-title {\n        font-weight: 500;\n        margin-bottom: 8px;\n      }\n\n      .chart-legend {\n        margin-top: 12px;\n      }\n\n      .chart-legend.legend-top {\n        margin-top: 0;\n        margin-bottom: 12px;\n      }\n\n      .chart-legend.legend-left,\n      .chart-legend.legend-right {\n        position: absolute;\n        top: 50%;\n        transform: translateY(-50%);\n      }\n\n      .chart-legend.legend-left {\n        left: 0;\n      }\n\n      .chart-legend.legend-right {\n        right: 0;\n      }\n\n      .graphs-module-clickable {\n        cursor: pointer;\n        color: inherit;\n        text-decoration: inherit;\n      }\n\n      .graphs-module-clickable.hover-enabled:hover {\n        transform: scale(1.02);\n        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n      }\n\n      /* Standard field styling */\n      .field-title {\n        font-size: 16px !important;\n        font-weight: 600 !important;\n    \n        margin-bottom: 4px !important;\n      }\n\n      .field-description {\n        font-size: 13px !important;\n        color: var(--secondary-text-color) !important;\n        margin-bottom: 12px !important;\n        opacity: 0.8 !important;\n        line-height: 1.4 !important;\n      }\n\n      .section-title {\n        font-size: 18px !important;\n        font-weight: 700 !important;\n        color: var(--primary-color) !important;\n        text-transform: uppercase !important;\n        letter-spacing: 0.5px !important;\n      }\n\n      /* Conditional fields grouping */\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      /* Number range control styles */\n      .number-range-control {\n        display: flex;\n        gap: 8px;\n        align-items: center;\n      }\n\n      .range-slider {\n        flex: 0 0 65%;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        min-width: 0;\n      }\n\n      .range-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 18px;\n        height: 18px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .range-slider::-moz-range-thumb {\n        width: 18px;\n        height: 18px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .range-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .range-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .range-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .range-input {\n        flex: 0 0 20%;\n        padding: 6px 8px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        box-sizing: border-box;\n      }\n\n      .range-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .range-reset-btn {\n        width: 32px;\n        height: 32px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .range-reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .range-reset-btn ha-icon {\n        font-size: 14px;\n      }\n\n      /* Responsive styles */\n      @media (max-width: 768px) {\n        .chart-container {\n          min-height: 200px;\n        }\n        \n        .uc-graphs-module .graph-legend {\n          max-width: calc(100% - 8px) !important;\n          gap: 4px !important;\n          font-size: 11px !important;\n        }\n        \n        .uc-graphs-module .graph-header-info {\n          max-width: calc(100% - 16px) !important;\n        }\n        \n        .uc-graphs-module .graph-title {\n          font-size: 14px !important;\n        }\n        \n        .uc-graphs-module .graph-value {\n          font-size: 20px !important;\n        }\n      }\n\n      /* Animation styles */\n      .uc-graphs-module[data-animation="true"] {\n        animation: fadeIn 0.5s ease-in-out;\n      }\n\n      @keyframes fadeIn {\n        from {\n          opacity: 0;\n          transform: translateY(10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      /* Hover effects */\n      .uc-graphs-module:hover {\n        transition: box-shadow 0.3s ease;\n      }\n\n      /* Loading state */\n      .chart-loading {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        height: 100%;\n        color: var(--secondary-text-color);\n        overflow: hidden;\n      }\n\n      .chart-error {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        height: 100%;\n        color: var(--error-color);\n        text-align: center;\n        padding: 20px;\n        overflow: hidden;\n        word-wrap: break-word;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n      \n      /* SVG text containment for pie charts */\n      .uc-graphs-module svg text {\n        pointer-events: none;\n        user-select: none;\n      }\n      \n      /* Ensure tooltips stay within bounds and appear above everything */\n      [id^="graph-tooltip-"] {\n        position: fixed !important;\n        z-index: ${_.Mu.GRAPH_TOOLTIP} !important;\n        max-width: calc(100vw - 32px);\n        word-wrap: break-word;\n        box-sizing: border-box;\n        pointer-events: none !important;\n      }\n\n      /* Gap control styles - Standardized Slider Pattern */\n      .gap-control-container {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n\n      .gap-slider {\n        flex: 1;\n        height: 6px;\n        background: var(--divider-color);\n        border-radius: 3px;\n        outline: none;\n        appearance: none;\n        -webkit-appearance: none;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .gap-slider::-webkit-slider-thumb {\n        appearance: none;\n        -webkit-appearance: none;\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider::-moz-range-thumb {\n        width: 20px;\n        height: 20px;\n        background: var(--primary-color);\n        border-radius: 50%;\n        cursor: pointer;\n        border: none;\n        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n      }\n\n      .gap-slider:hover {\n        background: var(--primary-color);\n        opacity: 0.7;\n      }\n\n      .gap-slider:hover::-webkit-slider-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-slider:hover::-moz-range-thumb {\n        transform: scale(1.1);\n      }\n\n      .gap-input {\n        width: 48px !important;\n        max-width: 48px !important;\n        min-width: 48px !important;\n        padding: 4px 6px !important;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        font-size: 13px;\n        text-align: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n        box-sizing: border-box;\n      }\n\n      .gap-input:focus {\n        outline: none;\n        border-color: var(--primary-color);\n        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);\n      }\n\n      .reset-btn {\n        width: 36px;\n        height: 36px;\n        padding: 0;\n        border: 1px solid var(--divider-color);\n        border-radius: 4px;\n        background: var(--secondary-background-color);\n        color: var(--primary-text-color);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        transition: all 0.2s ease;\n        flex-shrink: 0;\n      }\n\n      .reset-btn:hover {\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border-color: var(--primary-color);\n      }\n\n      .reset-btn ha-icon {\n        font-size: 16px;\n      }\n\n      /* Settings section width containment */\n      .settings-section {\n        max-width: 100%;\n        box-sizing: border-box;\n        width: 100%;\n        overflow: visible;\n      }\n\n      .settings-section > div[style*="display: grid"] {\n        max-width: 100%;\n        box-sizing: border-box;\n        width: 100%;\n        overflow: visible;\n      }\n\n      /* Ensure all grid children stay within bounds */\n      .settings-section div {\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Field sections must respect container width */\n      .settings-section .field-section {\n        width: 100%;\n        max-width: 100%;\n        box-sizing: border-box;\n        overflow: visible;\n      }\n\n      /* Ensure ha-form respects container width */\n      .settings-section ha-form {\n        width: 100% !important;\n        max-width: 100% !important;\n        box-sizing: border-box !important;\n      }\n\n      /* Force all ha-form internals to respect width */\n      .settings-section ha-form * {\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* Specific fix for ha-select dropdowns z-index and width */\n      .settings-section ha-select,\n      .settings-section ha-textfield,\n      .settings-section input,\n      .settings-section select {\n        width: 100% !important;\n        max-width: 100% !important;\n        box-sizing: border-box !important;\n      }\n\n      /* Fix ha-select dropdown menu z-index to appear above other UI elements */\n      ha-select,\n      .settings-section ha-select,\n      .field-section ha-select {\n        --mdc-menu-z-index: 9999;\n        --mdc-select-z-index: 9999;\n        position: relative;\n      }\n\n      /* Ensure mwc-menu surfaces can overflow containers */\n      mwc-menu,\n      mwc-menu-surface {\n        z-index: 9999 !important;\n      }\n      .settings-section ultra-color-picker {\n        width: 100%;\n        max-width: 100%;\n        display: block;\n      }\n      .settings-section ultra-color-picker .color-input-field {\n        width: 100%;\n        max-width: 100%;\n        box-sizing: border-box;\n      }\n      .settings-section ultra-color-picker .color-value {\n        min-width: 0;\n      }\n    `}cleanup(){this.clickTimeout&&clearTimeout(this.clickTimeout),this.holdTimeout&&clearTimeout(this.holdTimeout),this._updateInterval&&clearInterval(this._updateInterval),Object.keys(this._historyData).forEach((t=>{const e=document.getElementById(`graph-tooltip-${t}`);e&&e.parentNode===document.body&&document.body.removeChild(e)}))}requestUpdate(){"undefined"!=typeof window&&(window.dispatchEvent(new CustomEvent("ultra-card-update")),window._ultraCardUpdateTimer||(window._ultraCardUpdateTimer=setTimeout((()=>{window.dispatchEvent(new CustomEvent("ultra-card-template-update",{bubbles:!0,composed:!0})),window._ultraCardUpdateTimer=null}),50)))}}},5121:(t,e,i)=>{function r(t){if(null==t)return{_error:"Template returned undefined or null"};if("object"==typeof t&&!Array.isArray(t)){const e={};if(void 0!==t.icon&&(e.icon=String(t.icon).trim()),void 0!==t.icon_color&&(e.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(e.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(e.name=String(t.name).trim()),void 0!==t.name_color&&(e.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(e.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(e.state_color=String(t.state_color).trim()),void 0!==t.content&&(e.content=String(t.content).trim()),void 0!==t.color&&(e.color=String(t.color).trim()),void 0!==t.value&&(e.value=t.value),void 0!==t.label&&(e.label=String(t.label).trim()),void 0!==t.gauge_color&&(e.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(e.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(e.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(e.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const i="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(i)||(e.pie_fill=i)}return void 0!==t.button_background_color&&(e.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(e.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(e.value_color=String(t.value_color).trim()),void 0!==t.entity&&(e.entity=String(t.entity).trim()),void 0!==t.visible&&(e.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(e.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(e.overlay_color=String(t.overlay_color).trim()),e}const e=String(t).trim();if(""===e)return{_error:"Template returned empty string"};if(e.startsWith("{")&&e.endsWith("}")||e.startsWith("[")&&e.endsWith("]"))try{const t=JSON.parse(e);if("object"!=typeof t||Array.isArray(t))return{_error:"Template must return an object, not an array"};const i={};if(void 0!==t.icon&&(i.icon=String(t.icon).trim()),void 0!==t.icon_color&&(i.icon_color=String(t.icon_color).trim()),void 0!==t.container_background_color&&(i.container_background_color=String(t.container_background_color).trim()),void 0!==t.name&&(i.name=String(t.name).trim()),void 0!==t.name_color&&(i.name_color=String(t.name_color).trim()),void 0!==t.state_text&&(i.state_text=String(t.state_text).trim()),void 0!==t.state_color&&(i.state_color=String(t.state_color).trim()),void 0!==t.content&&(i.content=String(t.content).trim()),void 0!==t.color&&(i.color=String(t.color).trim()),void 0!==t.value&&(i.value=t.value),void 0!==t.label&&(i.label=String(t.label).trim()),void 0!==t.gauge_color&&(i.gauge_color=String(t.gauge_color).trim()),void 0!==t.colors&&Array.isArray(t.colors)&&(i.colors=t.colors.map((t=>String(t).trim()))),void 0!==t.global_color&&(i.global_color=String(t.global_color).trim()),void 0!==t.fill_area&&(i.fill_area=Boolean(t.fill_area)),void 0!==t.pie_fill){const e="number"==typeof t.pie_fill?t.pie_fill:parseFloat(String(t.pie_fill));isNaN(e)||(i.pie_fill=e)}return void 0!==t.button_background_color&&(i.button_background_color=String(t.button_background_color).trim()),void 0!==t.button_text_color&&(i.button_text_color=String(t.button_text_color).trim()),void 0!==t.value_color&&(i.value_color=String(t.value_color).trim()),void 0!==t.entity&&(i.entity=String(t.entity).trim()),void 0!==t.visible&&(i.visible=Boolean(t.visible)),void 0!==t.overlay_text&&(i.overlay_text=String(t.overlay_text).trim()),void 0!==t.overlay_color&&(i.overlay_color=String(t.overlay_color).trim()),i}catch(t){return{_error:`Invalid JSON: ${t instanceof Error?t.message:"Unknown error"}`}}return{icon:e,_isString:!0}}function o(t){return void 0!==t._error}i.d(e,{HD:()=>o,cv:()=>r})},9009:(t,e,i)=>{var r=i(5183),o=i(4276),a=i(9811),n=function(t,e,i,r){var o,a=arguments.length,n=a<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(n=(a<3?o(n):a>3?o(e,i,n):o(e,i))||n);return a>3&&n&&Object.defineProperty(e,i,n),n};let s=class extends r.WF{static get styles(){return r.AH`
      ha-entity-picker {
        width: 100%;
        display: block;
      }
    `}render(){return r.qy`
      <ha-entity-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value||""}
        .entityFilter=${this.entityFilter}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>
    `}_valueChanged(t){t.stopPropagation();const e=t.detail.value;e!==this.value&&(this.value=e,(0,a.fireEvent)(this,"value-changed",{value:e}))}};n([(0,o.MZ)({attribute:!1})],s.prototype,"hass",void 0),n([(0,o.MZ)()],s.prototype,"label",void 0),n([(0,o.MZ)()],s.prototype,"value",void 0),n([(0,o.MZ)()],s.prototype,"entityFilter",void 0),s=n([(0,o.EM)("ultra-card-entity-picker")],s)},9327:(t,e,i)=>{function r(t,e,i){var r;const o=null===(r=null==e?void 0:e.states)||void 0===r?void 0:r[t];if(!o)return{entity:t,state:"unavailable",name:(null==i?void 0:i.name)||t,attributes:{},unit:"",domain:t.split(".")[0]||"unknown",device_class:"",friendly_name:(null==i?void 0:i.name)||t,config:i||{}};const a=t.split(".")[0],n=o.attributes||{};return{entity:t,state:o.state,name:(null==i?void 0:i.name)||n.friendly_name||t,attributes:n,unit:n.unit_of_measurement||"",domain:a,device_class:n.device_class||"",friendly_name:n.friendly_name||"",config:i||{},state_number:parseFloat(o.state),state_boolean:"on"===o.state||"true"===o.state||"yes"===o.state}}function o(t,e,i){const o=t.map(((t,o)=>{const a=null==i?void 0:i[o];return r(t,e,a)})),a=o[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},a),{entities:o})}i.d(e,{pL:()=>r,wI:()=>o})},9760:(t,e,i)=>{i.d(e,{formatEntityState:()=>o});var r=i(9811);const o=(t,e,i)=>{var o,a;const n=!1!==(null==i?void 0:i.includeUnit),s=null===(o=null==t?void 0:t.states)||void 0===o?void 0:o[e];if(!t||!s)return void 0!==(null==i?void 0:i.state)?String(i.state):"";const l=t.formatEntityState,d=l?l(s,void 0!==(null==i?void 0:i.state)?String(i.state):void 0):(0,r.computeStateDisplay)(t.localize,s,t.locale,null==i?void 0:i.state);if(n)return d;const c=null===(a=s.attributes)||void 0===a?void 0:a.unit_of_measurement;if(c&&"string"==typeof d){const t=` ${c}`;if(d.endsWith(t))return d.slice(0,-t.length)}return d}}}]);