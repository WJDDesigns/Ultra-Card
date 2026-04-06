"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[9517],{245:(e,n,t)=>{t.r(n),t.d(n,{UltraCalendarModule:()=>_});var a=t(5183),o=t(6478),r=t(7475),i=t(8869),l=t(5147),c=t(8938);t(7921);class d{constructor(e){this._cache=new Map,this._cacheTTL=3e5,e&&(this._cacheTTL=e)}async fetchEvents(e,n,t,a){const o=this.generateCacheKey(n,t,a),r=this._cache.get(o);if(r&&Date.now()-r.timestamp<this._cacheTTL)return r.events;const i=n.map((n=>this.fetchCalendarEvents(e,n,t,a))),l=await Promise.allSettled(i);let c=[];return l.forEach(((e,t)=>{"fulfilled"===e.status?c=c.concat(e.value):console.warn(`Calendar module: Failed to fetch events for ${n[t].entity}`,e.reason)})),c.sort(((e,n)=>e.start.getTime()-n.start.getTime())),this._cache.set(o,{events:c,timestamp:Date.now()}),c}async fetchCalendarEvents(e,n,t,a){if(!n.entity||!(null==e?void 0:e.callApi))return[];try{const o=this.formatDateForApi(t),r=this.formatDateForApi(a),i=await e.callApi("GET",`calendars/${n.entity}?start=${encodeURIComponent(o)}&end=${encodeURIComponent(r)}`);return Array.isArray(i)?i.map((e=>this.processEvent(e,n))):[]}catch(e){throw console.error(`Calendar module: Error fetching ${n.entity}:`,e),e}}processEvent(e,n){const t=this.parseEventDate(e.start),a=this.parseEventDate(e.end),o=this.isAllDayEvent(e),r=this.isMultiDayEvent(t,a,o);return{id:e.uid||`${n.entity}-${t.getTime()}-${e.summary}`,calendarId:n.id,calendarColor:n.color||"#03a9f4",calendarName:n.name||this.getCalendarDisplayName(n.entity),summary:e.summary||"Untitled Event",description:e.description,location:e.location,start:t,end:a,isAllDay:o,isMultiDay:r,raw:e}}parseEventDate(e){return"string"==typeof e?new Date(e):e.dateTime?new Date(e.dateTime):e.date?new Date(e.date+"T00:00:00"):new Date}isAllDayEvent(e){const n=e.start,t=e.end;if("object"==typeof n&&"date"in n&&!("dateTime"in n))return!0;if("string"==typeof n&&"string"==typeof t){const e=new Date(n),a=new Date(t);if(0===e.getHours()&&0===e.getMinutes()&&0===a.getHours()&&0===a.getMinutes())return!0}return!1}isMultiDayEvent(e,n,t){const a=new Date(e);a.setHours(0,0,0,0);const o=new Date(n);return o.setHours(0,0,0,0),t&&o.setDate(o.getDate()-1),o.getTime()>a.getTime()}getCalendarDisplayName(e){const n=e.replace("calendar.","").replace(/_/g," ");return n.charAt(0).toUpperCase()+n.slice(1)}formatDateForApi(e){return e.toISOString()}generateCacheKey(e,n,t){return`${e.map((e=>e.entity)).sort().join("|")}:${n.toISOString().split("T")[0]}:${t.toISOString().split("T")[0]}`}clearCache(){this._cache.clear()}setCacheTTL(e){this._cacheTTL=e}static groupByDay(e){const n=new Map;return e.forEach((e=>{const t=d.getDateKey(e.start);n.has(t)||n.set(t,[]),n.get(t).push(e)})),n}static groupByWeek(e,n="sunday"){const t=new Map;return e.forEach((e=>{const a=d.getWeekKey(e.start,n);t.has(a)||t.set(a,[]),t.get(a).push(e)})),t}static groupByMonth(e){const n=new Map;return e.forEach((e=>{const t=d.getMonthKey(e.start);n.has(t)||n.set(t,[]),n.get(t).push(e)})),n}static getEventsForDate(e,n){const t=d.getDateKey(n),a=new Date(n);a.setHours(0,0,0,0);const o=new Date(n);return o.setHours(23,59,59,999),e.filter((e=>d.getDateKey(e.start)===t||!!(e.isMultiDay&&e.start<=o&&e.end>=a)))}static getDateKey(e){return e.toISOString().split("T")[0]}static getWeekKey(e,n){const t=e.getFullYear(),a=d.getWeekNumber(e,n);return`${t}-W${String(a).padStart(2,"0")}`}static getMonthKey(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}static getWeekNumber(e,n){const t=new Date(e);t.setHours(0,0,0,0);const a=new Date(t.getFullYear(),0,1),o="monday"===n?1:"saturday"===n?6:0,r=Math.floor((t.getTime()-a.getTime())/864e5);return Math.ceil((r+a.getDay()+1-o)/7)}static getWeekDays(e,n="sunday"){const t=[],a=new Date(e);let o=a.getDay()-("monday"===n?1:"saturday"===n?6:0);o<0&&(o+=7),a.setDate(a.getDate()-o),a.setHours(0,0,0,0);for(let e=0;e<7;e++)t.push(new Date(a)),a.setDate(a.getDate()+1);return t}static getMonthDays(e,n,t="sunday"){const a=[],o=new Date(e,n,1),r=new Date(e,n+1,0),i="monday"===t?1:"saturday"===t?6:0;let l=o.getDay()-i;l<0&&(l+=7);for(let t=l;t>0;t--){const o=new Date(e,n,1-t);a.push({date:o,currentMonth:!1})}for(let t=1;t<=r.getDate();t++){const o=new Date(e,n,t);a.push({date:o,currentMonth:!0})}const c=42-a.length;for(let t=1;t<=c;t++){const o=new Date(e,n+1,t);a.push({date:o,currentMonth:!1})}return a}static isSameDay(e,n){return e.getFullYear()===n.getFullYear()&&e.getMonth()===n.getMonth()&&e.getDate()===n.getDate()}static isToday(e){return d.isSameDay(e,new Date)}static formatDuration(e,n){const t=n.getTime()-e.getTime(),a=Math.round(t/6e4);if(a<60)return`${a}m`;const o=Math.floor(a/60),r=a%60;return 0===r?`${o}h`:`${o}h ${r}m`}static formatRelativeTime(e,n){const t=new Date,a=e.getTime()-t.getTime(),o=Math.round(a/6e4),r=Math.round(a/36e5),i=Math.round(a/864e5);return a<0?o>-60?`${Math.abs(o)}m ago`:r>-24?`${Math.abs(r)}h ago`:`${Math.abs(i)}d ago`:o<60?`in ${o}m`:r<24?`in ${r}h`:`in ${i}d`}}function s(e){return a.qy`
    <div class="uc-calendar-empty">
      <ha-icon icon="mdi:calendar-blank"></ha-icon>
      <span>${e}</span>
    </div>
  `}function p(e){return 3===(e=e.replace("#","")).length&&(e=e[0]+e[0]+e[1]+e[1]+e[2]+e[2]),`${parseInt(e.substring(0,2),16)}, ${parseInt(e.substring(2,4),16)}, ${parseInt(e.substring(4,6),16)}`}function u(e){const n=e.replace("#","");return(.299*parseInt(n.substring(0,2),16)+.587*parseInt(n.substring(2,4),16)+.114*parseInt(n.substring(4,6),16))/255>.5?"#000000":"#ffffff"}function v(e,n){return e.length<=n?e:e.substring(0,n-3)+"..."}function h(e){const n=e.split(",");return n.length>1?n.slice(0,-1).join(",").trim():e}class _ extends r.m{constructor(){super(...arguments),this.metadata={type:"calendar",title:"Calendar",description:"Display calendar events with multiple view options",author:"WJD Designs",version:"1.0.0",icon:"mdi:calendar-month",category:"data",tags:["calendar","events","schedule","agenda","planner","pro"]},this._calendarService=null,this._events=[],this._loading=!1,this._error=null,this._lastFetch=0,this._expandedState=!1,this._hass=null,this._refreshInterval=null,this._scrollContainer=null,this._scrollState={canScrollUp:!1,canScrollDown:!1},this._scrollAmount=100,this._scrollContainerId=`cal-scroll-${Math.random().toString(36).substring(2,9)}`}createDefault(e,n){const t={id:this.generateId("cal_entity"),entity:"",name:"",color:"#03a9f4",visible:!0};return{id:e||this.generateId("calendar"),type:"calendar",calendars:[t],view_type:"compact_list",days_to_show:7,title:"",show_title:!1,title_font_size:"20px",title_color:"var(--primary-text-color)",show_title_separator:!1,title_separator_color:"var(--divider-color)",title_separator_width:"1px",compact_events_to_show:5,compact_show_all_day_events:!0,compact_hide_empty_days:!1,compact_show_nav_buttons:!0,show_week_numbers:"none",first_day_of_week:"sunday",month_show_event_count:!0,week_start_hour:0,week_end_hour:24,week_time_interval:60,day_start_hour:0,day_end_hour:24,day_time_interval:60,table_show_date_column:!0,table_show_time_column:!0,table_show_calendar_column:!0,table_show_location_column:!0,table_show_duration_column:!1,grid_columns:2,grid_card_height:"auto",show_event_time:!0,show_end_time:!0,show_event_location:!0,show_event_description:!1,show_event_icon:!0,time_24h:!1,remove_location_country:!1,max_event_title_length:0,show_past_events:!1,date_vertical_alignment:"top",weekday_font_size:"12px",weekday_color:"var(--secondary-text-color)",day_font_size:"24px",day_color:"var(--primary-text-color)",show_month:!1,month_font_size:"12px",month_color:"var(--secondary-text-color)",event_font_size:"14px",event_color:"var(--primary-text-color)",time_font_size:"12px",time_color:"var(--secondary-text-color)",time_icon_size:"14px",location_font_size:"12px",location_color:"var(--secondary-text-color)",location_icon_size:"14px",description_font_size:"12px",description_color:"var(--secondary-text-color)",event_background_opacity:0,vertical_line_width:"3px",accent_color:"var(--primary-color)",row_spacing:"8px",event_spacing:"4px",additional_card_spacing:"0px",show_day_separator:!1,day_separator_width:"1px",day_separator_color:"var(--divider-color)",show_week_separator:!1,week_separator_width:"1px",week_separator_color:"var(--divider-color)",month_separator_width:"1px",month_separator_color:"var(--divider-color)",tap_action_expand:!1,refresh_interval:15,filter_keywords:[],filter_mode:"exclude",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},event_tap_action:{action:"more-info"},enable_hover_effect:!1,hover_background_color:""}}validate(e){const n=e,t=[...super.validate(e).errors];return n.calendars&&0!==n.calendars.length?n.calendars.some((e=>e.entity&&""!==e.entity.trim()))||t.push("At least one calendar must have an entity selected"):t.push("At least one calendar entity must be configured"),{valid:0===t.length,errors:t}}renderActionsTab(e,n,t,a){return l.A.render(e,n,(e=>a(e)))}renderOtherTab(e,n,t,a){return c.X.render(e,n,(e=>a(e)))}renderGeneralTab(e,n,t,o){var r;const i=e,l=(null===(r=null==n?void 0:n.locale)||void 0===r?void 0:r.language)||"en";return a.qy`
      <style>
        ${this.injectUcFormStyles()}
        ${this.getEditorStyles()}
      </style>

      <!-- Calendar Selection Section -->
      ${this.renderCalendarSelectionSection(i,n,o,l)}

      <!-- View Configuration Section -->
      ${this.renderViewConfigSection(i,n,o,l)}

      <!-- Event Display Options Section -->
      ${this.renderEventDisplaySection(i,n,o,l)}

      <!-- Styling Section -->
      ${this.renderStylingSection(i,n,o,l)}

      <!-- Advanced Options Section -->
      ${this.renderAdvancedSection(i,n,o,l)}
    `}renderCalendarSelectionSection(e,n,t,r){const i=e.calendars||[];return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.calendar.calendars_section",r,"Calendar Entities")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.calendar.calendars_desc",r,"Add calendar entities to display. Each calendar can have a custom color.")}
        </div>

        <div class="calendar-list">
          ${i.map(((o,r)=>a.qy`
              <div class="calendar-item">
                <div class="calendar-item-header">
                  <div class="calendar-color-preview" style="background: ${o.color||"#03a9f4"}">
                  </div>
                  <span class="calendar-item-title">
                    ${o.name||o.entity||`Calendar ${r+1}`}
                  </span>
                  <div class="calendar-item-actions">
                    <ha-icon-button
                      @click=${()=>this.toggleCalendarVisibility(r,e,t)}
                      title="${!1!==o.visible?"Hide":"Show"}"
                    >
                      <ha-icon
                        icon="${!1!==o.visible?"mdi:eye":"mdi:eye-off"}"
                      ></ha-icon>
                    </ha-icon-button>
                    ${i.length>1?a.qy`
                          <ha-icon-button
                            @click=${()=>this.removeCalendar(r,e,t)}
                            title="Remove"
                          >
                            <ha-icon icon="mdi:delete"></ha-icon>
                          </ha-icon-button>
                        `:""}
                  </div>
                </div>

                <div class="calendar-item-content">
                  <!-- Entity Picker -->
                  <div class="field-row">
                    <div class="field-title">Entity</div>
                    <ha-form
                      .hass=${n}
                      .data=${{entity:o.entity||""}}
                      .schema=${[{name:"entity",selector:{entity:{domain:"calendar"}}}]}
                      .computeLabel=${()=>""}
                      @value-changed=${n=>this.updateCalendarEntity(r,"entity",n.detail.value.entity,e,t)}
                    ></ha-form>
                  </div>

                  <!-- Custom Name -->
                  <div class="field-row">
                    <div class="field-title">Display Name (optional)</div>
                    <ha-form
                      .hass=${n}
                      .data=${{name:o.name||""}}
                      .schema=${[{name:"name",selector:{text:{}}}]}
                      .computeLabel=${()=>""}
                      @value-changed=${n=>this.updateCalendarEntity(r,"name",n.detail.value.name,e,t)}
                    ></ha-form>
                  </div>

                  <!-- Color Picker -->
                  <div class="field-row">
                    <div class="field-title">Calendar Color</div>
                    <ultra-color-picker
                      .value=${o.color||"#03a9f4"}
                      .defaultValue=${"#03a9f4"}
                      .hass=${n}
                      @value-changed=${n=>this.updateCalendarEntity(r,"color",n.detail.value,e,t)}
                    ></ultra-color-picker>
                  </div>
                </div>
              </div>
            `))}
        </div>

        <button class="add-calendar-btn" @click=${()=>this.addCalendar(e,t)}>
          <ha-icon icon="mdi:plus"></ha-icon>
          ${(0,o.kg)("editor.calendar.add_calendar",r,"Add Calendar")}
        </button>
      </div>
    `}renderViewConfigSection(e,n,t,r){return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.calendar.view_config",r,"View Configuration")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.calendar.view_config_desc",r,"Configure the calendar view layout and date range.")}
        </div>

        <!-- View Type -->
        ${this.renderFieldSection("View Type","Select how events are displayed",n,{view_type:e.view_type||"compact_list"},[this.selectField("view_type",[{value:"compact_list",label:"Compact List"},{value:"month",label:"Month"},{value:"week",label:"Week"},{value:"day",label:"Day"},{value:"table",label:"Table"},{value:"grid",label:"Grid"}])],(e=>{t({view_type:e.detail.value.view_type}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

        <!-- Days to Show -->
        ${this.renderSliderField("Days to Show","Number of days to display events for",e.days_to_show||7,7,1,365,1,(e=>t({days_to_show:e})),"")}

        <!-- Title Configuration -->
        ${this.renderFieldSection("Show Title","Display a title above the calendar",n,{show_title:e.show_title||!1},[this.booleanField("show_title")],(e=>t({show_title:e.detail.value.show_title})))}

        ${e.show_title?a.qy`
              <div class="conditional-fields-group">
                <div class="conditional-fields-content">
                  ${this.renderFieldSection("Title Text","Custom title for the calendar",n,{title:e.title||""},[this.textField("title")],(e=>t({title:e.detail.value.title})))}

                  ${this.renderFieldSection("Show Title Separator","Display a line below the title",n,{show_title_separator:e.show_title_separator||!1},[this.booleanField("show_title_separator")],(e=>t({show_title_separator:e.detail.value.show_title_separator})))}

                  ${e.show_title_separator?a.qy`
                        <div class="color-row" style="margin-top: 16px;">
                          <div class="color-field">
                            <div class="field-title">Separator Color</div>
                            <ultra-color-picker
                              .value=${e.title_separator_color||"var(--divider-color)"}
                              .defaultValue=${"var(--divider-color)"}
                              .hass=${n}
                              @value-changed=${e=>t({title_separator_color:e.detail.value})}
                            ></ultra-color-picker>
                          </div>
                        </div>
                      `:""}
                </div>
              </div>
            `:""}

        <!-- View-specific options -->
        ${this.renderViewSpecificOptions(e,n,t,r)}
      </div>
    `}renderViewSpecificOptions(e,n,t,o){switch(e.view_type||"compact_list"){case"compact_list":return this.renderCompactListOptions(e,n,t,o);case"month":return this.renderMonthViewOptions(e,n,t,o);case"week":return this.renderWeekViewOptions(e,n,t,o);case"day":return this.renderDayViewOptions(e,n,t,o);case"table":return this.renderTableViewOptions(e,n,t,o);case"grid":return this.renderGridViewOptions(e,n,t,o);default:return a.qy``}}renderCompactListOptions(e,n,t,o){var r;return a.qy`
      <div class="view-options-group">
        <div class="view-options-title">Compact List Options</div>

        ${this.renderFieldSection("Auto-fit to Height","Show as many events as fit within a specified height instead of limiting by count",n,{compact_auto_fit_height:e.compact_auto_fit_height||!1},[this.booleanField("compact_auto_fit_height")],(e=>{t({compact_auto_fit_height:e.detail.value.compact_auto_fit_height}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

        ${e.compact_auto_fit_height?a.qy`
              <div class="conditional-fields-group">
                <div class="conditional-fields-content">
                  ${this.renderFieldSection("Container Height","Height of the events container (e.g., 300px, 50vh, 100%)",n,{compact_height:e.compact_height||"300px"},[this.textField("compact_height")],(e=>{t({compact_height:e.detail.value.compact_height}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

                  ${this.renderFieldSection("Overflow Behavior","How to handle events that exceed the container height",n,{compact_overflow:e.compact_overflow||"scroll"},[this.selectField("compact_overflow",[{value:"scroll",label:"Scrollable"},{value:"hidden",label:"Clip (hidden)"}])],(e=>{t({compact_overflow:e.detail.value.compact_overflow}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

                  ${"hidden"===e.compact_overflow?this.renderFieldSection("Show Navigation Buttons","Display up/down buttons to scroll through clipped events",n,{compact_show_nav_buttons:!1!==e.compact_show_nav_buttons},[this.booleanField("compact_show_nav_buttons")],(e=>{t({compact_show_nav_buttons:e.detail.value.compact_show_nav_buttons}),setTimeout((()=>this.triggerPreviewUpdate()),50)})):""}
                </div>
              </div>
            `:this.renderSliderField("Events to Show","Maximum number of events to display (0 for unlimited)",null!==(r=e.compact_events_to_show)&&void 0!==r?r:5,5,0,100,1,(e=>t({compact_events_to_show:e})),"")}

        ${this.renderFieldSection("Show All-Day Events","Include all-day events in the list",n,{compact_show_all_day_events:!1!==e.compact_show_all_day_events},[this.booleanField("compact_show_all_day_events")],(e=>t({compact_show_all_day_events:e.detail.value.compact_show_all_day_events})))}

        ${this.renderFieldSection("Hide Empty Days","Do not show days without events",n,{compact_hide_empty_days:e.compact_hide_empty_days||!1},[this.booleanField("compact_hide_empty_days")],(e=>t({compact_hide_empty_days:e.detail.value.compact_hide_empty_days})))}

        ${this.renderFieldSection("Enable Expand/Collapse","Allow tapping to expand or collapse event details",n,{tap_action_expand:e.tap_action_expand||!1},[this.booleanField("tap_action_expand")],(e=>t({tap_action_expand:e.detail.value.tap_action_expand})))}
      </div>
    `}renderMonthViewOptions(e,n,t,o){return a.qy`
      <div class="view-options-group">
        <div class="view-options-title">Month View Options</div>

        ${this.renderFieldSection("Show Week Numbers","Display week numbers on the left side",n,{show_week_numbers:e.show_week_numbers||"none"},[this.selectField("show_week_numbers",[{value:"none",label:"None"},{value:"iso",label:"ISO (Monday start)"},{value:"us",label:"US (Sunday start)"}])],(e=>{t({show_week_numbers:e.detail.value.show_week_numbers}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

        ${this.renderFieldSection("First Day of Week","Which day starts the week",n,{first_day_of_week:e.first_day_of_week||"sunday"},[this.selectField("first_day_of_week",[{value:"sunday",label:"Sunday"},{value:"monday",label:"Monday"},{value:"saturday",label:"Saturday"}])],(e=>{t({first_day_of_week:e.detail.value.first_day_of_week}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

        ${this.renderFieldSection("Show Event Count","Display number of events on each day",n,{month_show_event_count:!1!==e.month_show_event_count},[this.booleanField("month_show_event_count")],(e=>t({month_show_event_count:e.detail.value.month_show_event_count})))}
      </div>
    `}renderWeekViewOptions(e,n,t,o){var r,i,l;return a.qy`
      <div class="view-options-group">
        <div class="view-options-title">Week View Options</div>

        ${this.renderSliderField("Start Hour","First hour to display (0-23)",null!==(r=e.week_start_hour)&&void 0!==r?r:0,0,0,23,1,(e=>t({week_start_hour:e})),"h")}

        ${this.renderSliderField("End Hour","Last hour to display (1-24)",null!==(i=e.week_end_hour)&&void 0!==i?i:24,24,1,24,1,(e=>t({week_end_hour:e})),"h")}

        ${this.renderFieldSection("Time Interval","Time slot interval in minutes",n,{week_time_interval:String(null!==(l=e.week_time_interval)&&void 0!==l?l:60)},[this.selectField("week_time_interval",[{value:"15",label:"15 minutes"},{value:"30",label:"30 minutes"},{value:"60",label:"1 hour"}])],(e=>{t({week_time_interval:parseInt(e.detail.value.week_time_interval,10)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
      </div>
    `}renderDayViewOptions(e,n,t,o){var r,i,l;return a.qy`
      <div class="view-options-group">
        <div class="view-options-title">Day View Options</div>

        ${this.renderSliderField("Start Hour","First hour to display (0-23)",null!==(r=e.day_start_hour)&&void 0!==r?r:0,0,0,23,1,(e=>t({day_start_hour:e})),"h")}

        ${this.renderSliderField("End Hour","Last hour to display (1-24)",null!==(i=e.day_end_hour)&&void 0!==i?i:24,24,1,24,1,(e=>t({day_end_hour:e})),"h")}

        ${this.renderFieldSection("Time Interval","Time slot interval in minutes",n,{day_time_interval:String(null!==(l=e.day_time_interval)&&void 0!==l?l:60)},[this.selectField("day_time_interval",[{value:"15",label:"15 minutes"},{value:"30",label:"30 minutes"},{value:"60",label:"1 hour"}])],(e=>{t({day_time_interval:parseInt(e.detail.value.day_time_interval,10)}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
      </div>
    `}renderTableViewOptions(e,n,t,o){return a.qy`
      <div class="view-options-group">
        <div class="view-options-title">Table View Options</div>

        ${this.renderFieldSection("Show Date Column","Display the date column",n,{table_show_date_column:!1!==e.table_show_date_column},[this.booleanField("table_show_date_column")],(e=>t({table_show_date_column:e.detail.value.table_show_date_column})))}

        ${this.renderFieldSection("Show Time Column","Display the time column",n,{table_show_time_column:!1!==e.table_show_time_column},[this.booleanField("table_show_time_column")],(e=>t({table_show_time_column:e.detail.value.table_show_time_column})))}

        ${this.renderFieldSection("Show Calendar Column","Display the calendar indicator column",n,{table_show_calendar_column:!1!==e.table_show_calendar_column},[this.booleanField("table_show_calendar_column")],(e=>t({table_show_calendar_column:e.detail.value.table_show_calendar_column})))}

        ${this.renderFieldSection("Show Location Column","Display the location column",n,{table_show_location_column:!1!==e.table_show_location_column},[this.booleanField("table_show_location_column")],(e=>t({table_show_location_column:e.detail.value.table_show_location_column})))}

        ${this.renderFieldSection("Show Duration Column","Display the duration column",n,{table_show_duration_column:e.table_show_duration_column||!1},[this.booleanField("table_show_duration_column")],(e=>t({table_show_duration_column:e.detail.value.table_show_duration_column})))}
      </div>
    `}renderGridViewOptions(e,n,t,o){var r;return a.qy`
      <div class="view-options-group">
        <div class="view-options-title">Grid View Options</div>

        ${this.renderSliderField("Columns","Number of columns in the grid",null!==(r=e.grid_columns)&&void 0!==r?r:2,2,1,6,1,(e=>t({grid_columns:e})),"")}

        ${this.renderFieldSection("Card Height","Height of each event card (e.g., auto, 100px, 150px)",n,{grid_card_height:e.grid_card_height||"auto"},[this.textField("grid_card_height")],(e=>{t({grid_card_height:e.detail.value.grid_card_height}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
      </div>
    `}renderEventDisplaySection(e,n,t,r){return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.calendar.event_display",r,"Event Display")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.calendar.event_display_desc",r,"Configure what information is shown for each event.")}
        </div>

        ${this.renderFieldSection("Show Event Time","Display the start time of events",n,{show_event_time:!1!==e.show_event_time},[this.booleanField("show_event_time")],(e=>t({show_event_time:e.detail.value.show_event_time})))}

        ${this.renderFieldSection("Show End Time","Display the end time of events",n,{show_end_time:!1!==e.show_end_time},[this.booleanField("show_end_time")],(e=>t({show_end_time:e.detail.value.show_end_time})))}

        ${this.renderFieldSection("24-Hour Time Format","Use 24-hour time format instead of AM/PM",n,{time_24h:e.time_24h||!1},[this.booleanField("time_24h")],(e=>t({time_24h:e.detail.value.time_24h})))}

        ${this.renderFieldSection("Show Location","Display event location",n,{show_event_location:!1!==e.show_event_location},[this.booleanField("show_event_location")],(e=>t({show_event_location:e.detail.value.show_event_location})))}

        ${e.show_event_location?this.renderFieldSection("Remove Country from Location","Strip country name from displayed locations",n,{remove_location_country:e.remove_location_country||!1},[this.booleanField("remove_location_country")],(e=>t({remove_location_country:e.detail.value.remove_location_country}))):""}

        ${this.renderFieldSection("Show Description","Display event description",n,{show_event_description:e.show_event_description||!1},[this.booleanField("show_event_description")],(e=>t({show_event_description:e.detail.value.show_event_description})))}

        ${this.renderFieldSection("Show Event Icon","Display calendar icon next to events",n,{show_event_icon:!1!==e.show_event_icon},[this.booleanField("show_event_icon")],(e=>t({show_event_icon:e.detail.value.show_event_icon})))}

        ${this.renderFieldSection("Show Past Events","Include events that have already ended today",n,{show_past_events:e.show_past_events||!1},[this.booleanField("show_past_events")],(e=>t({show_past_events:e.detail.value.show_past_events})))}
      </div>
    `}renderStylingSection(e,n,t,r){var i;return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.calendar.styling",r,"Styling")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.calendar.styling_desc",r,"Customize colors, fonts, and spacing for the calendar display.")}
        </div>

        <!-- Title Styling -->
        ${e.show_title?a.qy`
              <div class="styling-subsection">
                <div class="subsection-title">Title Styling</div>

                <div class="color-row">
                  <div class="color-field">
                    <div class="field-title">Title Color</div>
                    <ultra-color-picker
                      .value=${e.title_color||"var(--primary-text-color)"}
                      .defaultValue=${"var(--primary-text-color)"}
                      .hass=${n}
                      @value-changed=${e=>t({title_color:e.detail.value})}
                    ></ultra-color-picker>
                  </div>
                </div>

                ${this.renderFieldSection("Title Font Size","Size of the title text",n,{title_font_size:e.title_font_size||"20px"},[this.textField("title_font_size")],(e=>t({title_font_size:e.detail.value.title_font_size})))}
              </div>
            `:""}

        <!-- Date Column Styling -->
        <div class="styling-subsection">
          <div class="subsection-title">Date Column</div>

          ${this.renderFieldSection("Date Alignment","Vertical alignment of date column",n,{date_vertical_alignment:e.date_vertical_alignment||"top"},[this.selectField("date_vertical_alignment",[{value:"top",label:"Top"},{value:"middle",label:"Middle"},{value:"bottom",label:"Bottom"}])],(e=>{t({date_vertical_alignment:e.detail.value.date_vertical_alignment}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          <div class="color-row">
            <div class="color-field">
              <div class="field-title">Weekday Color</div>
              <ultra-color-picker
                .value=${e.weekday_color||"var(--secondary-text-color)"}
                .defaultValue=${"var(--secondary-text-color)"}
                .hass=${n}
                @value-changed=${e=>t({weekday_color:e.detail.value})}
              ></ultra-color-picker>
            </div>
            <div class="color-field">
              <div class="field-title">Day Number Color</div>
              <ultra-color-picker
                .value=${e.day_color||"var(--primary-text-color)"}
                .defaultValue=${"var(--primary-text-color)"}
                .hass=${n}
                @value-changed=${e=>t({day_color:e.detail.value})}
              ></ultra-color-picker>
            </div>
          </div>

          ${this.renderFieldSection("Show Month","Display month name with date",n,{show_month:e.show_month||!1},[this.booleanField("show_month")],(e=>t({show_month:e.detail.value.show_month})))}

          ${e.show_month?a.qy`
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
                    <div class="color-row">
                      <div class="color-field">
                        <div class="field-title">Month Color</div>
                        <ultra-color-picker
                          .value=${e.month_color||"var(--secondary-text-color)"}
                          .defaultValue=${"var(--secondary-text-color)"}
                          .hass=${n}
                          @value-changed=${e=>t({month_color:e.detail.value})}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  </div>
                </div>
              `:""}
        </div>

        <!-- Event Styling -->
        <div class="styling-subsection">
          <div class="subsection-title">Event Styling</div>

          <div class="color-row">
            <div class="color-field">
              <div class="field-title">Event Text Color</div>
              <ultra-color-picker
                .value=${e.event_color||"var(--primary-text-color)"}
                .defaultValue=${"var(--primary-text-color)"}
                .hass=${n}
                @value-changed=${e=>t({event_color:e.detail.value})}
              ></ultra-color-picker>
            </div>
            <div class="color-field">
              <div class="field-title">Time Text Color</div>
              <ultra-color-picker
                .value=${e.time_color||"var(--secondary-text-color)"}
                .defaultValue=${"var(--secondary-text-color)"}
                .hass=${n}
                @value-changed=${e=>t({time_color:e.detail.value})}
              ></ultra-color-picker>
            </div>
          </div>

          <div class="color-row">
            <div class="color-field">
              <div class="field-title">Location Text Color</div>
              <ultra-color-picker
                .value=${e.location_color||"var(--secondary-text-color)"}
                .defaultValue=${"var(--secondary-text-color)"}
                .hass=${n}
                @value-changed=${e=>t({location_color:e.detail.value})}
              ></ultra-color-picker>
            </div>
            <div class="color-field">
              <div class="field-title">Description Text Color</div>
              <ultra-color-picker
                .value=${e.description_color||"var(--secondary-text-color)"}
                .defaultValue=${"var(--secondary-text-color)"}
                .hass=${n}
                @value-changed=${e=>t({description_color:e.detail.value})}
              ></ultra-color-picker>
            </div>
          </div>

          ${this.renderSliderField("Event Background Opacity","Background opacity for event items (0-100)",null!==(i=e.event_background_opacity)&&void 0!==i?i:0,0,0,100,1,(e=>t({event_background_opacity:e})),"%")}

          ${this.renderFieldSection("Accent Line Width","Width of the calendar color accent line (e.g., 3px)",n,{vertical_line_width:e.vertical_line_width||"3px"},[this.textField("vertical_line_width")],(e=>{t({vertical_line_width:e.detail.value.vertical_line_width}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <!-- Spacing -->
        <div class="styling-subsection">
          <div class="subsection-title">Spacing</div>

          ${this.renderFieldSection("Row Spacing","Space between day rows (e.g., 8px)",n,{row_spacing:e.row_spacing||"8px"},[this.textField("row_spacing")],(e=>{t({row_spacing:e.detail.value.row_spacing}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${this.renderFieldSection("Event Spacing","Space between events (e.g., 4px)",n,{event_spacing:e.event_spacing||"4px"},[this.textField("event_spacing")],(e=>{t({event_spacing:e.detail.value.event_spacing}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}
        </div>

        <!-- Separators -->
        <div class="styling-subsection">
          <div class="subsection-title">Separators</div>

          <!-- Day Separator -->
          ${this.renderFieldSection("Show Day Separators","Display lines between day rows",n,{show_day_separator:e.show_day_separator||!1},[this.booleanField("show_day_separator")],(e=>{t({show_day_separator:e.detail.value.show_day_separator}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${e.show_day_separator?a.qy`
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
                    <div class="separator-row">
                      <div class="separator-field">
                        <div class="field-title">Day Separator Color</div>
                        <ultra-color-picker
                          .value=${e.day_separator_color||"var(--divider-color)"}
                          .defaultValue=${"var(--divider-color)"}
                          .hass=${n}
                          @value-changed=${e=>{t({day_separator_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  </div>
                </div>
              `:""}

          <!-- Week Separator -->
          ${this.renderFieldSection("Show Week Separators","Display lines between week boundaries",n,{show_week_separator:e.show_week_separator||!1},[this.booleanField("show_week_separator")],(e=>{t({show_week_separator:e.detail.value.show_week_separator}),setTimeout((()=>this.triggerPreviewUpdate()),50)}))}

          ${e.show_week_separator?a.qy`
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
                    <div class="separator-row">
                      <div class="separator-field">
                        <div class="field-title">Week Separator Color</div>
                        <ultra-color-picker
                          .value=${e.week_separator_color||"var(--divider-color)"}
                          .defaultValue=${"var(--divider-color)"}
                          .hass=${n}
                          @value-changed=${e=>{t({week_separator_color:e.detail.value}),setTimeout((()=>this.triggerPreviewUpdate()),50)}}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  </div>
                </div>
              `:""}
        </div>
      </div>
    `}renderAdvancedSection(e,n,t,r){var i,l;return a.qy`
      <div class="settings-section">
        <div class="section-title">
          ${(0,o.kg)("editor.calendar.advanced",r,"Advanced Options")}
        </div>
        <div class="section-description">
          ${(0,o.kg)("editor.calendar.advanced_desc",r,"Configure refresh interval and event filtering.")}
        </div>

        ${this.renderSliderField("Refresh Interval (minutes)","How often to refresh calendar events (0 to disable)",null!==(i=e.refresh_interval)&&void 0!==i?i:15,15,0,1440,1,(e=>t({refresh_interval:e})),"min")}

        ${this.renderSliderField("Max Event Title Length","Truncate event titles to this length (0 for no limit)",null!==(l=e.max_event_title_length)&&void 0!==l?l:0,0,0,500,1,(e=>t({max_event_title_length:e})),"")}
      </div>
    `}addCalendar(e,n){var t;const a={id:this.generateId("cal_entity"),entity:"",name:"",color:this.getNextCalendarColor((null===(t=e.calendars)||void 0===t?void 0:t.length)||0),visible:!0};n({calendars:[...e.calendars||[],a]})}removeCalendar(e,n,t){const a=[...n.calendars||[]];a.splice(e,1),t({calendars:a})}updateCalendarEntity(e,n,t,a,o){const r=[...a.calendars||[]];r[e]&&(r[e]=Object.assign(Object.assign({},r[e]),{[n]:t}),o({calendars:r}),setTimeout((()=>this.triggerPreviewUpdate()),50))}toggleCalendarVisibility(e,n,t){const a=[...n.calendars||[]];a[e]&&(a[e]=Object.assign(Object.assign({},a[e]),{visible:!(!1!==a[e].visible)}),t({calendars:a}),setTimeout((()=>this.triggerPreviewUpdate()),50))}getNextCalendarColor(e){const n=["#03a9f4","#ff6c92","#43a047","#ff9800","#9c27b0","#00bcd4","#f44336","#8bc34a"];return n[e%n.length]}getEditorStyles(){return"\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 24px;\n      }\n\n      .section-title {\n        font-size: 18px;\n        font-weight: 700;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 8px;\n        letter-spacing: 0.5px;\n      }\n\n      .section-description {\n        font-size: 13px;\n        color: var(--secondary-text-color);\n        margin-bottom: 16px;\n        opacity: 0.8;\n        line-height: 1.4;\n      }\n\n      .calendar-list {\n        display: flex;\n        flex-direction: column;\n        gap: 12px;\n        margin-bottom: 16px;\n      }\n\n      .calendar-item {\n        background: var(--card-background-color, var(--ha-card-background));\n        border-radius: 8px;\n        overflow: hidden;\n        border: 1px solid var(--divider-color);\n      }\n\n      .calendar-item-header {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        padding: 12px;\n        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);\n        border-bottom: 1px solid var(--divider-color);\n      }\n\n      .calendar-color-preview {\n        width: 24px;\n        height: 24px;\n        border-radius: 50%;\n        flex-shrink: 0;\n      }\n\n      .calendar-item-title {\n        flex: 1;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      .calendar-item-actions {\n        display: flex;\n        gap: 4px;\n      }\n\n      .calendar-item-content {\n        padding: 16px;\n        display: flex;\n        flex-direction: column;\n        gap: 16px;\n      }\n\n      .field-row {\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n      }\n\n      .field-title {\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n\n      .add-calendar-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        width: 100%;\n        padding: 12px;\n        background: var(--primary-color);\n        color: var(--text-primary-color, #fff);\n        border: none;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 600;\n        cursor: pointer;\n        transition: all 0.2s ease;\n      }\n\n      .add-calendar-btn:hover {\n        opacity: 0.9;\n        transform: translateY(-1px);\n      }\n\n      .view-options-group {\n        margin-top: 24px;\n        padding: 16px;\n        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);\n        border-radius: 8px;\n        border-left: 4px solid var(--primary-color);\n      }\n\n      .view-options-title {\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-color);\n        margin-bottom: 16px;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n\n      .styling-subsection {\n        margin-top: 24px;\n        padding-top: 16px;\n        border-top: 1px solid var(--divider-color);\n      }\n\n      .styling-subsection:first-of-type {\n        margin-top: 0;\n        padding-top: 0;\n        border-top: none;\n      }\n\n      .subsection-title {\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 16px;\n      }\n\n      .color-row {\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n        gap: 16px;\n        margin-bottom: 16px;\n      }\n\n      .color-field {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n      }\n\n      .separator-row {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 16px;\n        margin-bottom: 16px;\n      }\n\n      .separator-field {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n      }\n\n      .conditional-fields-group {\n        margin-top: 16px;\n        border-left: 4px solid var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.08);\n        border-radius: 0 8px 8px 0;\n        overflow: hidden;\n        transition: all 0.2s ease;\n        animation: slideInFromLeft 0.3s ease-out;\n      }\n\n      .conditional-fields-content {\n        padding: 16px;\n      }\n\n      @keyframes slideInFromLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n\n      @media (max-width: 600px) {\n        .color-row,\n        .separator-row {\n          grid-template-columns: 1fr;\n        }\n      }\n    "}renderPreview(e,n,t,o){const r=e;if(this._hass=n,0===(r.calendars||[]).filter((e=>e.entity&&""!==e.entity.trim()&&!1!==e.visible)).length)return this.renderGradientErrorState("Configure Calendars","Select at least one calendar entity in the General tab");this._calendarService||(this._calendarService=new d),this.fetchEventsIfNeeded(r,n);const i=r.compact_auto_fit_height&&"hidden"===r.compact_overflow&&!1!==r.compact_show_nav_buttons;i&&setTimeout((()=>this.findAndSetupScrollContainer()),50);const l=Object.assign({module:r,hass:n,events:this._events,loading:this._loading,error:this._error,expanded:this._expandedState,onEventClick:e=>this.handleEventClick(e,r,n),onExpandToggle:()=>this.handleExpandToggle(),formatTime:e=>this.formatTime(e,r),formatDate:e=>this.formatDate(e,r,n)},i?{scrollState:this._scrollState,onScrollUp:()=>this.handleScrollUp(),onScrollDown:()=>this.handleScrollDown(),scrollContainerId:this._scrollContainerId}:{});return a.qy`
      <style>
        ${this.getPreviewStyles(r)}
      </style>
      <div class="uc-calendar-container">
        ${r.show_title&&r.title?a.qy`
              <div
                class="uc-calendar-title ${r.show_title_separator?"with-separator":""}"
                style="
                  font-size: ${r.title_font_size||"20px"};
                  color: ${r.title_color||"var(--primary-text-color)"};
                  ${r.show_title_separator?`border-bottom: ${r.title_separator_width||"1px"} solid ${r.title_separator_color||"var(--divider-color)"};`:""}
                "
              >
                ${r.title}
              </div>
            `:""}
        ${this.renderCalendarView(l)}
      </div>
    `}renderCalendarView(e){if(e.loading)return this.renderLoadingState();if(e.error)return this.renderErrorState(e.error);switch(e.module.view_type||"compact_list"){case"compact_list":default:return function(e){const{module:n,events:t,expanded:o,onEventClick:r,onExpandToggle:i,formatTime:l,scrollState:c,onScrollUp:u,onScrollDown:_,scrollContainerId:m}=e;if(0===t.length)return s("No upcoming events");const g=d.groupByDay(t),y=Array.from(g.entries()).sort((([e],[n])=>new Date(e).getTime()-new Date(n).getTime())),w=n.compact_hide_empty_days?y.filter((([,e])=>e.length>0)):y,f=n.compact_auto_fit_height&&n.compact_height,x=f?1/0:n.compact_events_to_show||5;let b=0,$=!1;const k=[];for(const[e,t]of w){if(!o&&!f&&b>=x){$=!0;break}const a=!1!==n.compact_show_all_day_events?t:t.filter((e=>!e.isAllDay)),r=o||f?a:a.slice(0,x-b);(r.length>0||!n.compact_hide_empty_days)&&(k.push({dateKey:e,events:r}),b+=r.length),!f&&a.length>r.length&&($=!0)}const S=f?`height: ${n.compact_height}; overflow-y: ${n.compact_overflow||"scroll"};`:"",D=f&&"hidden"===n.compact_overflow&&n.compact_show_nav_buttons;return a.qy`
    <div class="uc-calendar-compact-wrapper ${D?"with-nav-buttons":""}">
      ${D&&(null==c?void 0:c.canScrollUp)?a.qy`
            <button 
              class="uc-calendar-nav-btn uc-calendar-nav-up" 
              @click=${u}
              aria-label="Scroll up"
            >
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </button>
          `:""}
      
      <div 
        class="uc-calendar-compact ${f?"auto-fit-height":""}" 
        style="${S}"
        data-calendar-scroll-container="${m||""}"
      >
        ${k.map((({dateKey:e,events:t})=>{const o=new Date(e+"T00:00:00"),i=d.isToday(o);return a.qy`
            <div class="uc-calendar-day-row ${i?"today":""}">
              <div class="uc-calendar-date-col">
                <span class="uc-calendar-weekday">
                  ${o.toLocaleDateString(n.language||void 0,{weekday:"short"})}
                </span>
                <span class="uc-calendar-day-num">${o.getDate()}</span>
                ${n.show_month?a.qy`
                      <span class="uc-calendar-month">
                        ${o.toLocaleDateString(n.language||void 0,{month:"short"})}
                      </span>
                    `:""}
              </div>
              <div class="uc-calendar-events-col">
                ${t.length>0?t.map((e=>function(e,n,t,o){const r=(n.event_background_opacity||0)/100,i=r>0?`rgba(${p(e.calendarColor)}, ${r})`:"transparent";return a.qy`
    <div
      class="uc-calendar-event"
      style="background: ${i};"
      @click=${()=>o(e)}
    >
      <div
        class="uc-calendar-event-accent"
        style="background: ${e.calendarColor};"
      ></div>
      <div class="uc-calendar-event-content">
        <div class="uc-calendar-event-title">
          ${n.max_event_title_length&&n.max_event_title_length>0?v(e.summary,n.max_event_title_length):e.summary}
        </div>
        
        ${!1!==n.show_event_time?a.qy`
              <div class="uc-calendar-event-time">
                ${!1!==n.show_event_icon?a.qy`<ha-icon icon="mdi:clock-outline"></ha-icon>`:""}
                ${e.isAllDay?"All day":!1!==n.show_end_time?`${t(e.start)} - ${t(e.end)}`:t(e.start)}
              </div>
            `:""}
        
        ${n.show_event_location&&e.location?a.qy`
              <div class="uc-calendar-event-location">
                <ha-icon icon="mdi:map-marker"></ha-icon>
                ${n.remove_location_country?h(e.location):e.location}
              </div>
            `:""}
        
        ${n.show_event_description&&e.description?a.qy`
              <div class="uc-calendar-event-description">
                ${e.description}
              </div>
            `:""}
      </div>
    </div>
  `}(e,n,l,r))):a.qy`<div class="uc-calendar-no-events-day">No events</div>`}
              </div>
            </div>
          `}))}
        
        ${!f&&n.tap_action_expand&&$?a.qy`
              <button class="uc-calendar-expand-btn" @click=${i}>
                <ha-icon icon="${o?"mdi:chevron-up":"mdi:chevron-down"}"></ha-icon>
                ${o?"Show less":"Show more"}
              </button>
            `:""}
      </div>

      ${D&&(null==c?void 0:c.canScrollDown)?a.qy`
            <button 
              class="uc-calendar-nav-btn uc-calendar-nav-down" 
              @click=${_}
              aria-label="Scroll down"
            >
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </button>
          `:""}
    </div>
  `}(e);case"month":return function(e){var n;const{module:t,events:o,hass:r}=e,i=new Date,l=i.getFullYear(),c=i.getMonth(),s=d.getMonthDays(l,c,t.first_day_of_week||"sunday"),p=function(e,n){const t=[],a=new Date(2024,0,7),o="monday"===e?1:"saturday"===e?6:0;for(let e=0;e<7;e++){const r=new Date(a);r.setDate(r.getDate()+o+e),t.push(r.toLocaleDateString(n,{weekday:"short"}))}return t}(t.first_day_of_week||"sunday",t.language||(null===(n=null==r?void 0:r.locale)||void 0===n?void 0:n.language));return a.qy`
    <div class="uc-calendar-month-view">
      <!-- Month Header -->
      <div class="uc-calendar-month-view-header">
        <span class="uc-calendar-month-name">
          ${i.toLocaleDateString(t.language||void 0,{month:"long",year:"numeric"})}
        </span>
      </div>

      <!-- Weekday Headers -->
      <div class="uc-calendar-month-header">
        ${"none"!==t.show_week_numbers?a.qy`<div class="uc-calendar-weekday-header uc-calendar-week-num-header"></div>`:""}
        ${p.map((e=>a.qy`<div class="uc-calendar-weekday-header">${e}</div>`))}
      </div>

      <!-- Calendar Grid -->
      <div class="uc-calendar-month-grid ${"none"!==t.show_week_numbers?"with-week-numbers":""}">
        ${s.map(((n,r)=>{const i=d.getEventsForDate(o,n.date),l=d.isToday(n.date),c="none"!==t.show_week_numbers&&r%7==0;return a.qy`
            ${c?a.qy`
                  <div class="uc-calendar-week-number">
                    ${d.getWeekNumber(n.date,"iso"===t.show_week_numbers?"monday":"sunday")}
                  </div>
                `:""}
            <div
              class="uc-calendar-day-cell ${l?"today":""} ${n.currentMonth?"":"other-month"}"
              @click=${()=>e.onEventClick(i[0])}
            >
              <div class="uc-calendar-day-cell-num">${n.date.getDate()}</div>
              ${i.length>0?a.qy`
                    <div class="uc-calendar-day-cell-events">
                      ${!1!==t.month_show_event_count?i.slice(0,3).map((e=>a.qy`
                              <div
                                class="uc-calendar-day-cell-dot"
                                style="background: ${e.calendarColor};"
                                title="${e.summary}"
                              ></div>
                            `)):""}
                      ${i.length>3?a.qy`<span class="uc-calendar-day-cell-more">+${i.length-3}</span>`:""}
                    </div>
                  `:""}
            </div>
          `}))}
      </div>
    </div>
  `}(e);case"week":return function(e){var n,t;const{module:o,events:r,hass:i,formatTime:l}=e,c=new Date,s=d.getWeekDays(c,o.first_day_of_week||"sunday"),v=null!==(n=o.week_start_hour)&&void 0!==n?n:0,h=null!==(t=o.week_end_hour)&&void 0!==t?t:24,_=o.week_time_interval||60,m=[];for(let e=v;e<h;e++)for(let n=0;n<60;n+=_){const t=new Date;t.setHours(e,n,0,0),m.push(t)}return a.qy`
    <div class="uc-calendar-week-view">
      <!-- Week Header -->
      <div class="uc-calendar-week-header">
        <div class="uc-calendar-week-time-col"></div>
        ${s.map((e=>{var n;const t=d.isToday(e);return a.qy`
            <div class="uc-calendar-week-day-header ${t?"today":""}">
              <span class="uc-calendar-week-day-name">
                ${e.toLocaleDateString(o.language||(null===(n=null==i?void 0:i.locale)||void 0===n?void 0:n.language),{weekday:"short"})}
              </span>
              <span class="uc-calendar-week-day-num">${e.getDate()}</span>
            </div>
          `}))}
      </div>

      <!-- All-day events row -->
      <div class="uc-calendar-week-allday-row">
        <div class="uc-calendar-week-time-col">
          <span class="uc-calendar-time-label">All day</span>
        </div>
        ${s.map((n=>{const t=d.getEventsForDate(r,n).filter((e=>e.isAllDay));return a.qy`
            <div class="uc-calendar-week-allday-cell">
              ${t.map((n=>a.qy`
                  <div
                    class="uc-calendar-week-allday-event"
                    style="background: ${n.calendarColor}; color: ${u(n.calendarColor)};"
                    @click=${()=>e.onEventClick(n)}
                  >
                    ${n.summary}
                  </div>
                `))}
            </div>
          `}))}
      </div>

      <!-- Time Grid -->
      <div class="uc-calendar-week-grid">
        ${m.map((n=>a.qy`
          <div class="uc-calendar-week-row">
            <div class="uc-calendar-week-time-col">
              <span class="uc-calendar-time-label">${l(n)}</span>
            </div>
            ${s.map((t=>{const o=new Date(t);o.setHours(n.getHours(),n.getMinutes(),0,0);const i=new Date(o);i.setMinutes(i.getMinutes()+_);const l=r.filter((e=>!e.isAllDay&&e.start<i&&e.end>o&&d.isSameDay(e.start,t)));return a.qy`
                <div class="uc-calendar-week-cell">
                  ${l.map((n=>a.qy`
                      <div
                        class="uc-calendar-week-event"
                        style="border-left-color: ${n.calendarColor}; background: rgba(${p(n.calendarColor)}, 0.15);"
                        @click=${()=>e.onEventClick(n)}
                      >
                        <span class="uc-calendar-week-event-title">${n.summary}</span>
                      </div>
                    `))}
                </div>
              `}))}
          </div>
        `))}
      </div>
    </div>
  `}(e);case"day":return function(e){var n,t,o;const{module:r,events:i,hass:l,formatTime:c,onEventClick:s}=e,v=new Date,h=d.getEventsForDate(i,v),_=null!==(n=r.day_start_hour)&&void 0!==n?n:0,m=null!==(t=r.day_end_hour)&&void 0!==t?t:24,g=r.day_time_interval||60,y=h.filter((e=>e.isAllDay)),w=h.filter((e=>!e.isAllDay)),f=[];for(let e=_;e<m;e++)for(let n=0;n<60;n+=g){const t=new Date(v);t.setHours(e,n,0,0),f.push(t)}return a.qy`
    <div class="uc-calendar-day-view">
      <!-- Day Header -->
      <div class="uc-calendar-day-header">
        <span class="uc-calendar-day-view-title">
          ${v.toLocaleDateString(r.language||(null===(o=null==l?void 0:l.locale)||void 0===o?void 0:o.language),{weekday:"long",month:"long",day:"numeric"})}
        </span>
      </div>

      <!-- All-day events -->
      ${y.length>0?a.qy`
            <div class="uc-calendar-day-allday">
              <div class="uc-calendar-day-allday-label">All Day</div>
              <div class="uc-calendar-day-allday-events">
                ${y.map((e=>a.qy`
                    <div
                      class="uc-calendar-day-allday-event"
                      style="background: ${e.calendarColor}; color: ${u(e.calendarColor)};"
                      @click=${()=>s(e)}
                    >
                      ${e.summary}
                    </div>
                  `))}
              </div>
            </div>
          `:""}

      <!-- Time Grid -->
      <div class="uc-calendar-day-grid">
        ${f.map((e=>{const n=new Date(e),t=new Date(n);t.setMinutes(t.getMinutes()+g);const o=w.filter((e=>e.start<t&&e.end>n));return a.qy`
            <div class="uc-calendar-day-row">
              <div class="uc-calendar-day-time-col">
                <span class="uc-calendar-time-label">${c(e)}</span>
              </div>
              <div class="uc-calendar-day-events-col">
                ${o.map((e=>a.qy`
                    <div
                      class="uc-calendar-day-event"
                      style="border-left: 3px solid ${e.calendarColor}; background: rgba(${p(e.calendarColor)}, 0.1);"
                      @click=${()=>s(e)}
                    >
                      <div class="uc-calendar-day-event-title">${e.summary}</div>
                      <div class="uc-calendar-day-event-time">
                        ${c(e.start)} - ${c(e.end)}
                      </div>
                      ${r.show_event_location&&e.location?a.qy`
                            <div class="uc-calendar-day-event-location">
                              <ha-icon icon="mdi:map-marker"></ha-icon>
                              ${e.location}
                            </div>
                          `:""}
                    </div>
                  `))}
              </div>
            </div>
          `}))}
      </div>
    </div>
  `}(e);case"table":return function(e){const{module:n,events:t,formatTime:o,onEventClick:r}=e;return 0===t.length?s("No upcoming events"):a.qy`
    <div class="uc-calendar-table-container">
      <table class="uc-calendar-table">
        <thead>
          <tr>
            ${!1!==n.table_show_calendar_column?a.qy`<th class="uc-calendar-table-color"></th>`:""}
            ${!1!==n.table_show_date_column?a.qy`<th>Date</th>`:""}
            ${!1!==n.table_show_time_column?a.qy`<th>Time</th>`:""}
            <th>Event</th>
            ${!1!==n.table_show_location_column?a.qy`<th>Location</th>`:""}
            ${n.table_show_duration_column?a.qy`<th>Duration</th>`:""}
          </tr>
        </thead>
        <tbody>
          ${t.map((e=>a.qy`
              <tr @click=${()=>r(e)}>
                ${!1!==n.table_show_calendar_column?a.qy`
                      <td class="uc-calendar-table-color">
                        <div
                          class="uc-calendar-table-color-bar"
                          style="background: ${e.calendarColor};"
                        ></div>
                      </td>
                    `:""}
                ${!1!==n.table_show_date_column?a.qy`
                      <td>
                        ${e.start.toLocaleDateString(n.language||void 0,{weekday:"short",month:"short",day:"numeric"})}
                      </td>
                    `:""}
                ${!1!==n.table_show_time_column?a.qy`
                      <td>
                        ${e.isAllDay?"All day":!1!==n.show_end_time?`${o(e.start)} - ${o(e.end)}`:o(e.start)}
                      </td>
                    `:""}
                <td>
                  <div class="uc-calendar-table-event-title">${e.summary}</div>
                  ${n.show_event_description&&e.description?a.qy`<div class="uc-calendar-table-event-desc">${e.description}</div>`:""}
                </td>
                ${!1!==n.table_show_location_column?a.qy`<td>${e.location||"-"}</td>`:""}
                ${n.table_show_duration_column?a.qy`<td>${d.formatDuration(e.start,e.end)}</td>`:""}
              </tr>
            `))}
        </tbody>
      </table>
    </div>
  `}(e);case"grid":return function(e){const{module:n,events:t,formatTime:o,onEventClick:r}=e;return 0===t.length?s("No upcoming events"):a.qy`
    <div
      class="uc-calendar-grid"
      style="grid-template-columns: repeat(${n.grid_columns||2}, 1fr);"
    >
      ${t.map((e=>a.qy`
          <div
            class="uc-calendar-grid-card"
            style="border-top: 3px solid ${e.calendarColor}; ${"auto"!==n.grid_card_height?`height: ${n.grid_card_height};`:""}"
            @click=${()=>r(e)}
          >
            <div class="uc-calendar-grid-card-header">
              <div class="uc-calendar-grid-card-date">
                ${e.start.toLocaleDateString(n.language||void 0,{weekday:"short",month:"short",day:"numeric"})}
              </div>
            </div>
            <div class="uc-calendar-grid-card-body">
              <div class="uc-calendar-grid-card-title">${e.summary}</div>
              ${!1!==n.show_event_time?a.qy`
                    <div class="uc-calendar-grid-card-time">
                      <ha-icon icon="mdi:clock-outline"></ha-icon>
                      ${e.isAllDay?"All day":!1!==n.show_end_time?`${o(e.start)} - ${o(e.end)}`:o(e.start)}
                    </div>
                  `:""}
              ${n.show_event_location&&e.location?a.qy`
                    <div class="uc-calendar-grid-card-location">
                      <ha-icon icon="mdi:map-marker"></ha-icon>
                      ${n.remove_location_country?h(e.location):e.location}
                    </div>
                  `:""}
              ${n.show_event_description&&e.description?a.qy`
                    <div class="uc-calendar-grid-card-desc">
                      ${v(e.description,100)}
                    </div>
                  `:""}
            </div>
            <div
              class="uc-calendar-grid-card-calendar"
              style="color: ${e.calendarColor};"
            >
              ${e.calendarName}
            </div>
          </div>
        `))}
    </div>
  `}(e)}}renderLoadingState(){return a.qy`
      <div class="uc-calendar-loading">
        <div class="uc-calendar-spinner"></div>
        <span>Loading events...</span>
      </div>
    `}renderErrorState(e){return a.qy`
      <div class="uc-calendar-error">
        <ha-icon icon="mdi:alert-circle"></ha-icon>
        <span>${e}</span>
      </div>
    `}async fetchEventsIfNeeded(e,n){const t=Date.now(),a=60*(e.refresh_interval||15)*1e3;if(!(this._events.length>0&&t-this._lastFetch<a||this._loading)){this._loading=!0,this._error=null;try{const a=(e.calendars||[]).filter((e=>e.entity&&""!==e.entity.trim()&&!1!==e.visible));if(0===a.length)return this._events=[],void(this._loading=!1);const o=new Date;e.show_past_events||o.setHours(0,0,0,0);const r=new Date(o);r.setDate(r.getDate()+(e.days_to_show||7));const i=await this._calendarService.fetchEvents(n,a,o,r),l=e.show_past_events?i:i.filter((e=>e.end>new Date));this._events=l,this._lastFetch=t,this._loading=!1,this.triggerPreviewUpdate()}catch(e){console.error("Calendar module: Failed to fetch events",e),this._error="Failed to load calendar events",this._loading=!1,this.triggerPreviewUpdate()}}}handleEventClick(e,n,t){if(n.tap_action_expand)return this._expandedState=!this._expandedState,void this.triggerPreviewUpdate();const a=n.event_tap_action||{action:"more-info"};if("more-info"===a.action){const o=(n.calendars||[]).find((n=>n.id===e.calendarId));(null==o?void 0:o.entity)&&i.K.handleAction(Object.assign(Object.assign({},a),{entity:o.entity}),t,void 0,void 0,o.entity)}else i.K.handleAction(a,t)}handleExpandToggle(){this._expandedState=!this._expandedState,this.triggerPreviewUpdate()}findAndSetupScrollContainer(){const e=document.querySelector(`[data-calendar-scroll-container="${this._scrollContainerId}"]`);e&&e!==this._scrollContainer&&(this._scrollContainer=e,e.addEventListener("scroll",(()=>this.updateScrollState())),this.updateScrollState())}updateScrollState(){if(!this._scrollContainer)return;const{scrollTop:e,scrollHeight:n,clientHeight:t}=this._scrollContainer,a=e>0,o=e+t<n-1;a===this._scrollState.canScrollUp&&o===this._scrollState.canScrollDown||(this._scrollState={canScrollUp:a,canScrollDown:o},this.triggerPreviewUpdate())}handleScrollUp(){this._scrollContainer&&(this._scrollContainer.scrollBy({top:-this._scrollAmount,behavior:"smooth"}),setTimeout((()=>this.updateScrollState()),200))}handleScrollDown(){this._scrollContainer&&(this._scrollContainer.scrollBy({top:this._scrollAmount,behavior:"smooth"}),setTimeout((()=>this.updateScrollState()),200))}formatTime(e,n){const t={hour:"numeric",minute:"2-digit",hour12:!n.time_24h};return e.toLocaleTimeString(n.language||void 0,t)}formatDate(e,n,t){var a;const o=n.language||(null===(a=null==t?void 0:t.locale)||void 0===a?void 0:a.language)||"en",r=e.toLocaleDateString(o,{weekday:"short"}),i=e.getDate();return n.show_month?`${r} ${e.toLocaleDateString(o,{month:"short"})} ${i}`:`${r} ${i}`}getPreviewStyles(e){return`\n      .uc-calendar-container {\n        width: 100%;\n        font-family: var(--ha-card-header-font-family, inherit);\n        padding-top: 4px;\n      }\n\n      .uc-calendar-title {\n        font-weight: 600;\n        margin-bottom: 16px;\n        padding-bottom: 0;\n      }\n\n      .uc-calendar-title.with-separator {\n        padding-bottom: 12px;\n        margin-bottom: 16px;\n      }\n\n      .uc-calendar-loading {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 12px;\n        padding: 32px;\n        color: var(--secondary-text-color);\n      }\n\n      .uc-calendar-spinner {\n        width: 24px;\n        height: 24px;\n        border: 3px solid var(--divider-color);\n        border-top-color: var(--primary-color);\n        border-radius: 50%;\n        animation: uc-cal-spin 1s linear infinite;\n      }\n\n      @keyframes uc-cal-spin {\n        to { transform: rotate(360deg); }\n      }\n\n      .uc-calendar-error {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n        padding: 16px;\n        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);\n        border-radius: 8px;\n        color: var(--error-color);\n      }\n\n      .uc-calendar-error ha-icon {\n        --mdc-icon-size: 24px;\n      }\n\n      /* Compact List View Styles */\n      .uc-calendar-compact {\n        display: flex;\n        flex-direction: column;\n        gap: ${e.row_spacing||"8px"};\n        border: none;\n      }\n\n      /* Auto-fit to height mode */\n      .uc-calendar-compact.auto-fit-height {\n        /* Scrollbar styling */\n        scrollbar-width: thin;\n        scrollbar-color: var(--primary-color) transparent;\n        /* Ensure flex children don't shrink - they should maintain natural height */\n        flex-wrap: nowrap;\n      }\n\n      /* Day rows must not shrink when in auto-fit mode */\n      .uc-calendar-compact.auto-fit-height > .uc-calendar-day-row {\n        flex-shrink: 0;\n      }\n\n      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar {\n        width: 6px;\n      }\n\n      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar-track {\n        background: transparent;\n        border-radius: 3px;\n      }\n\n      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar-thumb {\n        background: var(--primary-color);\n        border-radius: 3px;\n      }\n\n      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar-thumb:hover {\n        background: var(--primary-color-dark, var(--primary-color));\n      }\n\n      .uc-calendar-compact > * {\n        border-top: none;\n      }\n\n      .uc-calendar-day-row {\n        display: flex;\n        gap: 16px;\n        padding-bottom: ${e.row_spacing||"8px"};\n        border: none !important;\n        border-top: none !important;\n        border-bottom: none !important;\n      }\n\n      .uc-calendar-day-row:not(:last-child) {\n        border-bottom: ${e.show_day_separator?`${e.day_separator_width||"1px"} solid ${e.day_separator_color||"var(--divider-color)"} !important`:"none !important"};\n      }\n\n      .uc-calendar-day-row:first-child {\n        border-top: none !important;\n        padding-top: 0;\n      }\n\n      .uc-calendar-date-col {\n        flex: 0 0 60px;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: ${"middle"===e.date_vertical_alignment?"center":"bottom"===e.date_vertical_alignment?"flex-end":"flex-start"};\n      }\n\n      .uc-calendar-weekday {\n        font-size: ${e.weekday_font_size||"12px"};\n        color: ${e.weekday_color||"var(--secondary-text-color)"};\n        text-transform: uppercase;\n        font-weight: 500;\n      }\n\n      .uc-calendar-day-num {\n        font-size: ${e.day_font_size||"24px"};\n        color: ${e.day_color||"var(--primary-text-color)"};\n        font-weight: 600;\n        line-height: 1.2;\n      }\n\n      .uc-calendar-month {\n        font-size: ${e.month_font_size||"12px"};\n        color: ${e.month_color||"var(--secondary-text-color)"};\n        text-transform: uppercase;\n      }\n\n      .uc-calendar-events-col {\n        flex: 1;\n        display: flex;\n        flex-direction: column;\n        gap: ${e.event_spacing||"4px"};\n        min-width: 0;\n      }\n\n      .uc-calendar-event {\n        display: flex;\n        align-items: flex-start;\n        gap: 12px;\n        padding: 8px;\n        border-radius: 6px;\n        cursor: pointer;\n        transition: background 0.2s ease;\n      }\n\n      .uc-calendar-event:hover {\n        background: rgba(var(--rgb-primary-color), 0.1);\n      }\n\n      .uc-calendar-event-accent {\n        width: ${e.vertical_line_width||"3px"};\n        min-height: 100%;\n        border-radius: 2px;\n        flex-shrink: 0;\n        align-self: stretch;\n      }\n\n      .uc-calendar-event-content {\n        flex: 1;\n        min-width: 0;\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n      }\n\n      .uc-calendar-event-title {\n        font-size: ${e.event_font_size||"14px"};\n        color: ${e.event_color||"var(--primary-text-color)"};\n        font-weight: 500;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      .uc-calendar-event-time {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: ${e.time_font_size||"12px"};\n        color: ${e.time_color||"var(--secondary-text-color)"};\n      }\n\n      .uc-calendar-event-time ha-icon {\n        --mdc-icon-size: ${e.time_icon_size||"14px"};\n      }\n\n      .uc-calendar-event-location {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        font-size: ${e.location_font_size||"12px"};\n        color: ${e.location_color||"var(--secondary-text-color)"};\n      }\n\n      .uc-calendar-event-location ha-icon {\n        --mdc-icon-size: ${e.location_icon_size||"14px"};\n      }\n\n      .uc-calendar-event-description {\n        font-size: ${e.description_font_size||"12px"};\n        color: ${e.description_color||"var(--secondary-text-color)"};\n        white-space: pre-wrap;\n        word-break: break-word;\n      }\n\n      .uc-calendar-no-events {\n        padding: 16px;\n        text-align: center;\n        color: var(--secondary-text-color);\n        font-style: italic;\n      }\n\n      .uc-calendar-expand-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        padding: 8px 16px;\n        margin-top: 8px;\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border: none;\n        border-radius: 8px;\n        cursor: pointer;\n        font-size: 13px;\n        font-weight: 500;\n        transition: opacity 0.2s ease;\n      }\n\n      .uc-calendar-expand-btn:hover {\n        opacity: 0.9;\n      }\n\n      /* Scroll Navigation Wrapper and Buttons */\n      .uc-calendar-compact-wrapper {\n        position: relative;\n        display: flex;\n        flex-direction: column;\n      }\n\n      .uc-calendar-compact-wrapper.with-nav-buttons {\n        /* Ensure buttons don't overlap content */\n      }\n\n      .uc-calendar-nav-btn {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 100%;\n        padding: 8px;\n        background: linear-gradient(\n          to bottom,\n          rgba(var(--rgb-primary-color, 3, 169, 244), 0.15),\n          rgba(var(--rgb-primary-color, 3, 169, 244), 0.05)\n        );\n        border: none;\n        border-radius: 8px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        color: var(--primary-color);\n        margin: 4px 0;\n      }\n\n      .uc-calendar-nav-up {\n        background: linear-gradient(\n          to bottom,\n          rgba(var(--rgb-primary-color, 3, 169, 244), 0.05),\n          rgba(var(--rgb-primary-color, 3, 169, 244), 0.15)\n        );\n        margin-bottom: 8px;\n      }\n\n      .uc-calendar-nav-down {\n        margin-top: 8px;\n      }\n\n      .uc-calendar-nav-btn:hover {\n        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);\n        transform: scale(1.01);\n      }\n\n      .uc-calendar-nav-btn:active {\n        transform: scale(0.98);\n      }\n\n      .uc-calendar-nav-btn ha-icon {\n        --mdc-icon-size: 24px;\n        transition: transform 0.2s ease;\n      }\n\n      .uc-calendar-nav-btn:hover ha-icon {\n        transform: translateY(-2px);\n      }\n\n      .uc-calendar-nav-down:hover ha-icon {\n        transform: translateY(2px);\n      }\n\n      /* Month View Styles */\n      .uc-calendar-month-view {\n        width: 100%;\n      }\n\n      .uc-calendar-month-header {\n        display: grid;\n        grid-template-columns: repeat(7, 1fr);\n        gap: 2px;\n        margin-bottom: 8px;\n      }\n\n      .uc-calendar-weekday-header {\n        text-align: center;\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        padding: 8px 4px;\n      }\n\n      .uc-calendar-month-grid {\n        display: grid;\n        grid-template-columns: repeat(7, 1fr);\n        gap: 2px;\n      }\n\n      .uc-calendar-day-cell {\n        min-height: 60px;\n        padding: 4px;\n        background: var(--card-background-color);\n        border-radius: 4px;\n        border: 1px solid var(--divider-color);\n        cursor: pointer;\n        transition: background 0.2s ease;\n      }\n\n      .uc-calendar-day-cell:hover {\n        background: rgba(var(--rgb-primary-color), 0.1);\n      }\n\n      .uc-calendar-day-cell.today {\n        border-color: var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.1);\n      }\n\n      .uc-calendar-day-cell.other-month {\n        opacity: 0.5;\n      }\n\n      .uc-calendar-day-cell-num {\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        margin-bottom: 4px;\n      }\n\n      .uc-calendar-day-cell-events {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 2px;\n      }\n\n      .uc-calendar-day-cell-dot {\n        width: 6px;\n        height: 6px;\n        border-radius: 50%;\n      }\n\n      /* Table View Styles */\n      .uc-calendar-table {\n        width: 100%;\n        border-collapse: collapse;\n      }\n\n      .uc-calendar-table th {\n        text-align: left;\n        padding: 12px 8px;\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        border-bottom: 2px solid var(--divider-color);\n        text-transform: uppercase;\n      }\n\n      .uc-calendar-table td {\n        padding: 12px 8px;\n        font-size: 14px;\n        color: var(--primary-text-color);\n        border-bottom: 1px solid var(--divider-color);\n        vertical-align: top;\n      }\n\n      .uc-calendar-table tr:hover td {\n        background: rgba(var(--rgb-primary-color), 0.05);\n      }\n\n      .uc-calendar-table-color {\n        width: 4px;\n        padding: 0 !important;\n      }\n\n      .uc-calendar-table-color-bar {\n        width: 4px;\n        height: 100%;\n        border-radius: 2px;\n      }\n\n      /* Grid View Styles */\n      .uc-calendar-grid {\n        display: grid;\n        grid-template-columns: repeat(${e.grid_columns||2}, 1fr);\n        gap: 12px;\n      }\n\n      .uc-calendar-grid-card {\n        background: var(--card-background-color);\n        border-radius: 8px;\n        border: 1px solid var(--divider-color);\n        overflow: hidden;\n        cursor: pointer;\n        transition: transform 0.2s ease, box-shadow 0.2s ease;\n      }\n\n      .uc-calendar-grid-card:hover {\n        transform: translateY(-2px);\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n      }\n\n      .uc-calendar-grid-card-header {\n        padding: 12px;\n        border-bottom: 1px solid var(--divider-color);\n      }\n\n      .uc-calendar-grid-card-body {\n        padding: 12px;\n      }\n\n      .uc-calendar-grid-card-title {\n        font-size: 14px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        margin-bottom: 8px;\n      }\n\n      .uc-calendar-grid-card-time {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        display: flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      /* Empty State */\n      .uc-calendar-empty {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        justify-content: center;\n        gap: 12px;\n        padding: 32px;\n        color: var(--secondary-text-color);\n        text-align: center;\n      }\n\n      .uc-calendar-empty ha-icon {\n        --mdc-icon-size: 48px;\n        opacity: 0.5;\n      }\n\n      .uc-calendar-no-events-day {\n        padding: 8px;\n        color: var(--secondary-text-color);\n        font-style: italic;\n        font-size: 13px;\n      }\n\n      /* Month View Additional Styles */\n      .uc-calendar-month-view-header {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        margin-bottom: 16px;\n      }\n\n      .uc-calendar-month-name {\n        font-size: 18px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n        text-transform: capitalize;\n      }\n\n      .uc-calendar-month-header.with-week-numbers {\n        grid-template-columns: 40px repeat(7, 1fr);\n      }\n\n      .uc-calendar-month-grid.with-week-numbers {\n        grid-template-columns: 40px repeat(7, 1fr);\n      }\n\n      .uc-calendar-week-number {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 11px;\n        color: var(--secondary-text-color);\n        font-weight: 500;\n      }\n\n      .uc-calendar-week-num-header {\n        width: 40px;\n      }\n\n      .uc-calendar-day-cell-more {\n        font-size: 10px;\n        color: var(--secondary-text-color);\n        margin-left: 2px;\n      }\n\n      /* Week View Styles */\n      .uc-calendar-week-view {\n        display: flex;\n        flex-direction: column;\n        overflow-x: auto;\n      }\n\n      .uc-calendar-week-header {\n        display: grid;\n        grid-template-columns: 60px repeat(7, 1fr);\n        gap: 4px;\n        margin-bottom: 8px;\n        position: sticky;\n        top: 0;\n        background: var(--card-background-color, var(--ha-card-background));\n        z-index: 1;\n      }\n\n      .uc-calendar-week-time-col {\n        width: 60px;\n        text-align: right;\n        padding-right: 8px;\n      }\n\n      .uc-calendar-week-day-header {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        padding: 8px 4px;\n        border-radius: 8px;\n      }\n\n      .uc-calendar-week-day-header.today {\n        background: rgba(var(--rgb-primary-color), 0.15);\n      }\n\n      .uc-calendar-week-day-name {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        text-transform: uppercase;\n      }\n\n      .uc-calendar-week-day-num {\n        font-size: 18px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n\n      .uc-calendar-week-allday-row {\n        display: grid;\n        grid-template-columns: 60px repeat(7, 1fr);\n        gap: 4px;\n        margin-bottom: 8px;\n        padding-bottom: 8px;\n        border-bottom: 2px solid var(--divider-color);\n      }\n\n      .uc-calendar-week-allday-cell {\n        display: flex;\n        flex-direction: column;\n        gap: 2px;\n        min-height: 24px;\n      }\n\n      .uc-calendar-week-allday-event {\n        padding: 2px 6px;\n        border-radius: 4px;\n        font-size: 11px;\n        font-weight: 500;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n        cursor: pointer;\n      }\n\n      .uc-calendar-week-grid {\n        display: flex;\n        flex-direction: column;\n      }\n\n      .uc-calendar-week-row {\n        display: grid;\n        grid-template-columns: 60px repeat(7, 1fr);\n        gap: 4px;\n        min-height: 40px;\n      }\n\n      .uc-calendar-week-cell {\n        border-top: 1px solid var(--divider-color);\n        padding: 2px;\n        position: relative;\n      }\n\n      .uc-calendar-week-event {\n        padding: 2px 6px;\n        border-radius: 4px;\n        font-size: 11px;\n        border-left: 3px solid;\n        margin-bottom: 2px;\n        cursor: pointer;\n        overflow: hidden;\n      }\n\n      .uc-calendar-week-event-title {\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n      }\n\n      /* Day View Styles */\n      .uc-calendar-day-view {\n        display: flex;\n        flex-direction: column;\n      }\n\n      .uc-calendar-day-header {\n        padding: 12px 0;\n        margin-bottom: 16px;\n        border-bottom: 2px solid var(--primary-color);\n      }\n\n      .uc-calendar-day-view-title {\n        font-size: 18px;\n        font-weight: 600;\n        color: var(--primary-text-color);\n      }\n\n      .uc-calendar-day-allday {\n        display: flex;\n        gap: 12px;\n        padding: 12px;\n        background: rgba(var(--rgb-primary-color), 0.05);\n        border-radius: 8px;\n        margin-bottom: 16px;\n      }\n\n      .uc-calendar-day-allday-label {\n        flex: 0 0 60px;\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--secondary-text-color);\n        text-transform: uppercase;\n      }\n\n      .uc-calendar-day-allday-events {\n        flex: 1;\n        display: flex;\n        flex-wrap: wrap;\n        gap: 8px;\n      }\n\n      .uc-calendar-day-allday-event {\n        padding: 6px 12px;\n        border-radius: 6px;\n        font-size: 13px;\n        font-weight: 500;\n        cursor: pointer;\n      }\n\n      .uc-calendar-day-grid {\n        display: flex;\n        flex-direction: column;\n      }\n\n      .uc-calendar-day-row {\n        display: flex;\n        min-height: 48px;\n        border-top: 1px solid var(--divider-color);\n      }\n\n      .uc-calendar-day-time-col {\n        flex: 0 0 60px;\n        padding-right: 12px;\n        text-align: right;\n      }\n\n      .uc-calendar-day-events-col {\n        flex: 1;\n        padding: 4px 0;\n        display: flex;\n        flex-direction: column;\n        gap: 4px;\n      }\n\n      .uc-calendar-day-event {\n        padding: 8px 12px;\n        border-radius: 6px;\n        cursor: pointer;\n        transition: transform 0.2s ease;\n      }\n\n      .uc-calendar-day-event:hover {\n        transform: translateX(4px);\n      }\n\n      .uc-calendar-day-event-title {\n        font-size: 14px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n        margin-bottom: 4px;\n      }\n\n      .uc-calendar-day-event-time {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n      }\n\n      .uc-calendar-day-event-location {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-top: 4px;\n      }\n\n      .uc-calendar-day-event-location ha-icon {\n        --mdc-icon-size: 14px;\n      }\n\n      /* Table View Additional Styles */\n      .uc-calendar-table-container {\n        overflow-x: auto;\n      }\n\n      .uc-calendar-table-event-title {\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n\n      .uc-calendar-table-event-desc {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-top: 4px;\n      }\n\n      .uc-calendar-table tr {\n        cursor: pointer;\n      }\n\n      /* Grid View Additional Styles */\n      .uc-calendar-grid-card-date {\n        font-size: 12px;\n        font-weight: 500;\n        color: var(--secondary-text-color);\n        text-transform: uppercase;\n      }\n\n      .uc-calendar-grid-card-location {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-top: 4px;\n      }\n\n      .uc-calendar-grid-card-location ha-icon {\n        --mdc-icon-size: 14px;\n      }\n\n      .uc-calendar-grid-card-desc {\n        font-size: 12px;\n        color: var(--secondary-text-color);\n        margin-top: 8px;\n        line-height: 1.4;\n      }\n\n      .uc-calendar-grid-card-calendar {\n        padding: 8px 12px;\n        font-size: 11px;\n        font-weight: 600;\n        text-transform: uppercase;\n        border-top: 1px solid var(--divider-color);\n      }\n\n      .uc-calendar-grid-card-time ha-icon {\n        --mdc-icon-size: 14px;\n      }\n\n      /* Responsive adjustments */\n      @media (max-width: 600px) {\n        .uc-calendar-week-header,\n        .uc-calendar-week-allday-row,\n        .uc-calendar-week-row {\n          grid-template-columns: 50px repeat(7, 1fr);\n        }\n\n        .uc-calendar-week-time-col,\n        .uc-calendar-day-time-col {\n          width: 50px;\n          flex: 0 0 50px;\n        }\n\n        .uc-calendar-day-cell {\n          min-height: 48px;\n        }\n\n        .uc-calendar-grid {\n          grid-template-columns: 1fr !important;\n        }\n      }\n    `}getStyles(){return`${r.m.getSliderStyles()}${this.getPreviewStyles({})}`}}}}]);