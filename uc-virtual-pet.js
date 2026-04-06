"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[6784],{7241:(e,p,n)=>{n.r(p),n.d(p,{UltraVirtualPetModule:()=>b});var t=n(5183),s=n(7475),a=n(766),i=n(5147),o=n(8938);n(7921);const r={indoor_f:{label:"Indoor (°F)",cold:58,min:65,max:78,hot:85},indoor_c:{label:"Indoor (°C)",cold:14,min:18,max:26,hot:30},outdoor_f:{label:"Outdoor (°F)",cold:32,min:55,max:85,hot:100},outdoor_c:{label:"Outdoor (°C)",cold:0,min:13,max:30,hot:38},server_f:{label:"Server Room (°F)",cold:55,min:60,max:75,hot:85},server_c:{label:"Server Room (°C)",cold:13,min:16,max:24,hot:30},pool_f:{label:"Pool/Spa (°F)",cold:70,min:78,max:88,hot:95},pool_c:{label:"Pool/Spa (°C)",cold:21,min:26,max:31,hot:35},custom:{label:"Custom",cold:0,min:18,max:26,hot:40}};function l(e,p,n){if(p>n){const e=p;p=n,n=e}const t=n-p||1;if(e>=p&&e<=n)return 90;const s=e<p?p-e:e-n;return Math.max(0,Math.round(90*(1-s/t)))}const d={ecstatic:["Everything is perfect! 🎉","Best home ever! ✨","I love it here! 💖","So much energy today!"],happy:["Feeling great!","Life is good 😊","What a nice day!","Cozy and happy!"],content:["All is well.","Doing just fine.","Comfortable 😌","Can't complain!"],neutral:["Hmm...","It's okay, I guess.","Not bad, not great.","Just chilling."],bored:["Kinda boring here...","*yawn*","Anything happening?","Could be more fun..."],sad:["Not feeling it today...","A bit gloomy 😢","Miss the sunshine.","Could use a hug."],sleepy:["Zzz... 💤","So tired...","Need a nap...","Five more minutes..."],cold:["Brrr! So cold! 🥶","Need a blanket!","Turn up the heat!","Freezing here!"],hot:["So hot! 🥵","Need some AC!","Melting over here!","Too warm!"],alert:["Something is wrong! ⚠️","Check the security!","Stay alert! 👀","Danger detected!"]},c=10;function m(e,p,n,s){const a=[];for(let i=0;i<e.length;i++){const o=e[i];let r=0;for(;r<o.length;){const e=o[r];if("."!==e&&s[e]){let l=1;for(;r+l<o.length&&o[r+l]===e;)l++;a.push(t.JW`<rect x="${p+r*c}" y="${n+i*c}" width="${l*c}" height="${c}" fill="${s[e]}"/>`),r+=l}else r++}}return t.JW`${a}`}function h(e,p,n,s,a,i=1,o=1){return t.JW`<rect x="${e+n*c}" y="${p+s*c}" width="${i*c}" height="${o*c}" fill="${a}"/>`}const u={cat:{eyeL:[5,5],eyeR:[10,5],mouth:[7,7],nosePos:[7,6],noseW:2,noseColor:"#FF8A9E"},dog:{eyeL:[5,4],eyeR:[10,4],mouth:[7,7],nosePos:[7,5],noseW:2,noseColor:"#333"},fox:{eyeL:[5,6],eyeR:[10,6],mouth:[7,8],nosePos:[7,7],noseW:2,noseColor:"#333"},rabbit:{eyeL:[5,5],eyeR:[10,5],mouth:[7,7],nosePos:[7,6],noseW:2,noseColor:"#FF8A9E"},owl:{eyeL:[4,4],eyeR:[11,4],mouth:[7,6],nosePos:[7,5],noseW:2,noseColor:"#F4A623"},penguin:{eyeL:[5,3],eyeR:[10,3],mouth:[7,5],nosePos:[7,4],noseW:2,noseColor:"#F4A623"},robot:{eyeL:[5,4],eyeR:[10,4],mouth:[7,5]},shrimp:{eyeL:[5,3],eyeR:[10,3],mouth:[7,5]},snail:{eyeL:[3,1],eyeR:[6,1],mouth:[4,6]},snake:{eyeL:[5,3],eyeR:[10,3],mouth:[7,5]},turtle:{eyeL:[5,5],eyeR:[10,5],mouth:[7,7]},frog:{eyeL:[1,1],eyeR:[13,1],mouth:[7,6]}},g={ecstatic:"star",happy:"happy",content:"open",neutral:"open",bored:"half",sad:"sad",sleepy:"closed",cold:"squint",hot:"squint",alert:"wide"},y={ecstatic:"big-smile",happy:"smile",content:"smile",neutral:"neutral",bored:"neutral",sad:"frown",sleepy:"o",cold:"wavy",hot:"open",alert:"o"},v={cat:["..pp........pp..",".pppp......pppp.",".pspp......ppsp.","..pppppppppppp..","..pppppppppppp..","..pppppppppppp..","..pppppppppppp..","..pppppppppppp..","...pppppppppp...","..ppsssssssspp..","..ppsssssssspp..","..pppppppppppp..","...ppp....ppp...","...ppp....ppp..."],dog:["....pppppppp....","...pppppppppp...","..pppppppppppp..","ssppppppppppppss","ssppppppppppppss",".s.pppppppppp.s.","...ppppsspppp...","....pppppppp....","...pppppppppp...","..ppppsssspppp..","..ppppsssspppp..","..pppppppppppp..","...ppp....ppp...","...ppp....ppp..."],fox:[".pp..........pp.","pppp........pppp","pssp........pssp","pppp........pppp","..pppppppppppp..","..pppppppppppp..","..pppppppppppp..","..ppppsssspppp..","..ppppsssspppp..","...pppppppppp...","...ppsssssspp...","...ppsssssspp...","...ddd....ddd...","...ddd....ddd..."],rabbit:["...pp......pp...","...pp......pp...","...ps......sp...","...pp......pp...","..pppppppppppp..","..pppppppppppp..","..pppppppppppp..","...pppppppppp...","...pppppppppp...","..ppppsssspppp..","..ppppsssspppp..","..pppppppppppp..","...ppp....ppp...","...ppp....ppp..."],owl:["..pp........pp..","..pppppppppppp..",".pppppppppppppp.",".ppssppppppsspp.",".ppssppppppsspp.",".pppppppppppppp.","..pppppppppppp..","..pppppppppppp..","..pppssssssppp..","..pppssssssppp..","..pppppppppppp..","...pppppppppp...","....oo....oo....","................"],penguin:[".....pppppp.....","....pppppppp....","...pppppppppp...","..pppppppppppp..",".pppssssssssppp.",".pppssssssssppp.",".pppssssssssppp.",".pppssssssssppp.","..ppsssssssspp..","...pppppppppp...","....pppppppp....",".....pppppp.....","....oo....oo....","................"],robot:["......pppp......",".....pppppp.....","...pppppppppp...","...pppppppppp...","...pppppppppp...","...pppppppppp...","..pppppppppppp..","..ppppsssspppp..","..ppppsssspppp..","..pppppppppppp..","pp.pppppppppp.pp","pp.pppppppppp.pp","...ppp....ppp...","...ppp....ppp..."],shrimp:["..ss..........ss","...ss........ss.","....pppppppp....","...pppppppppp...","..pppppppppppp..","..pppppppppppp..","...ppsssssspp...","....pppppppp....",".....pppppp.....","......pppp......","......pppp......",".....pppp.......","....pppp........","...ppp.........."],snail:["...p.....p......","...p.....p......","..pp....pp......","..pppppppp......","..pppppp........","..ppppppdddddd..",".pppppdddsssddd.",".ppppddssddssddd",".ppppddssddssddd",".pppppdddsssddd.","..ppppppdddddd..","dddddddddddddddd","................","................"],snake:["................","....pppppppp....","...pppppppppp...","...pppppppppp...","...pppppppppp...","...ssppppppss...","....ssssssss....","........ssss....","......ssss......","....ssss........","..ssss..........","..ss............","................","................"],turtle:["................","................","...pppp.........","...pppp.........","..ppppdddddddd.","..ppppddssdddd..",".pp.pddddddssdd.",".pp.pddssdddddd.","..ppppdddddddd..","..ppppdddddddd..","....pp.pp..pp.pp","....pp.pp..pp.pp","................","................"],frog:[".pp..........pp.","pppp........pppp","pppp........pppp",".pppppppppppppp.","..pppppppppppp..","..pppppppppppp..","..ppppsssspppp..","..ppsssssssspp..","..ppsssssssspp..","...pppppppppp...","..pp.pp..pp.pp..",".pp..pp..pp..pp.",".pp..........pp.","................"]};class b extends s.m{constructor(){super(...arguments),this.metadata={type:"virtual_pet",title:"Virtual Pet",description:"A digital pet whose mood is driven by your smart home data",author:"WJD Designs",version:"1.0.0",icon:"mdi:paw",category:"interactive",tags:["pet","fun","tamagotchi","animated","interactive","pro","premium"]},this._expandedBindings=new Set}createDefault(e){return{id:e||this.generateId("virtual_pet"),type:"virtual_pet",pet_name:"Buddy",species:"cat",entity_bindings:[],show_name:!0,show_mood:!0,show_stats:!0,show_speech_bubble:!0,show_background_scene:!0,pet_size:160,background_scene:"auto",enable_animations:!0,enable_particles:!1,enable_idle_animations:!0,lcd_filter:!0,accent_color:"",pet_primary_color:"",pet_secondary_color:"",bubble_color:"",stats_color:"",tap_action:{action:"nothing"},hold_action:{action:"nothing"},double_tap_action:{action:"nothing"},display_mode:"always",display_conditions:[]}}validate(e){const p=e,n=[...super.validate(e).errors];return p.pet_name&&""!==p.pet_name.trim()||n.push("Pet name is required"),{valid:0===n.length,errors:n}}renderActionsTab(e,p,n,t){return i.A.render(e,p,(e=>t(e)))}renderOtherTab(e,p,n,t){return o.X.render(e,p,(e=>t(e)))}renderGeneralTab(e,p,n,s){const i=e;return t.qy`
      ${this.injectUcFormStyles()}
      <style>${this._editorStyles()}</style>

      <div class="module-settings">
        <!-- Pet Identity -->
        <div class="settings-section">
          <div class="section-title">PET IDENTITY</div>
          ${a.U.renderFieldSection("Pet Name","Give your pet a name!",p,{pet_name:i.pet_name||"Buddy"},[a.U.text("pet_name")],(e=>s({pet_name:e.detail.value.pet_name})))}
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Species</div>
          <div class="species-grid">
            ${[{id:"cat",icon:"mdi:cat",label:"Cat"},{id:"dog",icon:"mdi:dog",label:"Dog"},{id:"fox",icon:"mdi:firefox",label:"Fox"},{id:"rabbit",icon:"mdi:rabbit",label:"Rabbit"},{id:"owl",icon:"mdi:owl",label:"Owl"},{id:"penguin",icon:"mdi:penguin",label:"Penguin"},{id:"robot",icon:"mdi:robot",label:"Robot"},{id:"shrimp",icon:"mdi:fish",label:"Shrimp"},{id:"snail",icon:"mdi:bug",label:"Snail"},{id:"snake",icon:"mdi:snake",label:"Snake"},{id:"turtle",icon:"mdi:turtle",label:"Turtle"},{id:"frog",icon:"mdi:spa",label:"Frog"}].map((e=>t.qy`
                <div
                  class="species-btn ${i.species===e.id?"active":""}"
                  @click=${()=>s({species:e.id})}
                >
                  <ha-icon icon="${e.icon}"></ha-icon>
                  <span>${e.label}</span>
                </div>
              `))}
          </div>
        </div>

        <!-- Entity Bindings -->
        <div class="settings-section">
          <div class="section-title">ENTITY BINDINGS</div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            Connect your smart home entities to influence your pet's mood.
            Each binding affects a different aspect of your pet's wellbeing.
          </div>
          ${(i.entity_bindings||[]).map(((e,n)=>this._renderBindingRow(e,n,i,p,s)))}
          <button
            class="add-btn full-width"
            @click=${()=>{const e=[...i.entity_bindings||[]],p={id:this.generateId("pet_bind"),entity:"",role:"happiness"};e.push(p),s({entity_bindings:e}),this._expandedBindings.add(p.id)}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity Binding
          </button>
        </div>

        <!-- Display -->
        <div class="settings-section">
          <div class="section-title">DISPLAY</div>
          ${this.renderSettingsSection("","",[{title:"Show Name",description:"Display the pet's name below it.",hass:p,data:{show_name:i.show_name},schema:[this.booleanField("show_name")],onChange:e=>s({show_name:e.detail.value.show_name})},{title:"Show Mood",description:"Display the current mood label.",hass:p,data:{show_mood:i.show_mood},schema:[this.booleanField("show_mood")],onChange:e=>s({show_mood:e.detail.value.show_mood})},{title:"Show Stats",description:"Display happiness, energy, and other stat bars.",hass:p,data:{show_stats:i.show_stats},schema:[this.booleanField("show_stats")],onChange:e=>s({show_stats:e.detail.value.show_stats})},{title:"Show Speech Bubble",description:"Display a thought bubble with mood messages.",hass:p,data:{show_speech_bubble:i.show_speech_bubble},schema:[this.booleanField("show_speech_bubble")],onChange:e=>s({show_speech_bubble:e.detail.value.show_speech_bubble})},{title:"Enable Animations",description:"Idle bounce, tail wag, and other animations.",hass:p,data:{enable_animations:i.enable_animations},schema:[this.booleanField("enable_animations")],onChange:e=>s({enable_animations:e.detail.value.enable_animations})},{title:"LCD Filter",description:"Retro LCD color overlay for an authentic screen look.",hass:p,data:{lcd_filter:i.lcd_filter},schema:[this.booleanField("lcd_filter")],onChange:e=>s({lcd_filter:e.detail.value.lcd_filter})}])}
          ${this.renderSliderField("Pet Size","Size of the pet in pixels.",i.pet_size||160,160,80,300,4,(e=>s({pet_size:e})),"px")}
        </div>

        <!-- Colors -->
        <div class="settings-section">
          <div class="section-title">COLORS</div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            Customize your pet's colors. Leave empty for species defaults.
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${"Primary Color (body)"}
              .value=${i.pet_primary_color||""}
              .defaultValue=${this._speciesDefaults(i.species).primary}
              .hass=${p}
              @value-changed=${e=>s({pet_primary_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${"Secondary Color (belly, ears)"}
              .value=${i.pet_secondary_color||""}
              .defaultValue=${this._speciesDefaults(i.species).secondary}
              .hass=${p}
              @value-changed=${e=>s({pet_secondary_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${"Accent Color"}
              .value=${i.accent_color||""}
              .defaultValue=${"var(--primary-color)"}
              .hass=${p}
              @value-changed=${e=>s({accent_color:e.detail.value})}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `}_renderBindingRow(e,p,n,s,i){var o,l,d,c,m,h,u,g,y,v,b,_,x,f,$,w,C;const F=this._expandedBindings.has(e.id);return t.qy`
      <div class="binding-row">
        <ha-icon icon="${{happiness:"mdi:emoticon-happy",energy:"mdi:lightning-bolt",temperature:"mdi:thermometer",activity:"mdi:run",security:"mdi:shield-check",custom:"mdi:tune"}[e.role]||"mdi:tune"}" style="color: var(--primary-color); flex-shrink: 0;"></ha-icon>
        <div class="binding-info ${e.entity?"":"empty"}">
          ${e.entity?t.qy`${e.label||(null===(o=s.states[e.entity])||void 0===o?void 0:o.attributes.friendly_name)||e.entity}
                <span style="opacity: 0.5; font-size: 11px; margin-left: 4px;">(${e.role})</span>`:"No entity selected"}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${F?"expanded":""}"
          @click=${p=>{const n=!this._expandedBindings.has(e.id);n?this._expandedBindings.add(e.id):this._expandedBindings.delete(e.id);const t=p.currentTarget;t.classList.toggle("expanded",n);const s=t.closest(".binding-row"),a=null==s?void 0:s.nextElementSibling;(null==a?void 0:a.classList.contains("binding-settings"))&&a.classList.toggle("collapsed",!n)}}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${()=>{const t=[...n.entity_bindings||[]];t.splice(p,1),this._expandedBindings.delete(e.id),i({entity_bindings:t})}}
        ></ha-icon>
      </div>
      ${t.qy`
            <div class="binding-settings ${F?"":"collapsed"}">
              ${a.U.renderFieldSection("Entity","The entity that affects this stat.",s,{entity:e.entity||""},[a.U.entity("entity")],(e=>this._updateBinding(p,{entity:e.detail.value.entity},n,i)))}
              ${this.renderFieldSection("Role","What aspect of your pet does this entity affect?",s,{role:e.role||"happiness"},[this.selectField("role",[{value:"happiness",label:"Happiness"},{value:"energy",label:"Energy"},{value:"temperature",label:"Temperature"},{value:"activity",label:"Activity"},{value:"security",label:"Security"},{value:"custom",label:"Custom"}])],(e=>this._updateBinding(p,{role:e.detail.value.role},n,i)))}
              ${"happiness"===e.role||"custom"===e.role?t.qy`
                    ${a.U.renderFieldSection("Happy State",'State value that makes the pet happy (e.g. "on", "home").',s,{happy_state:e.happy_state||""},[a.U.text("happy_state")],(e=>this._updateBinding(p,{happy_state:e.detail.value.happy_state},n,i)))}
                    ${a.U.renderFieldSection("Sad State",'State value that makes the pet sad (e.g. "off", "not_home").',s,{sad_state:e.sad_state||""},[a.U.text("sad_state")],(e=>this._updateBinding(p,{sad_state:e.detail.value.sad_state},n,i)))}
                  `:""}
              ${"temperature"===e.role?t.qy`
                    ${this.renderFieldSection("Temperature Preset","Quick-start ranges for common setups.",s,{temp_preset:e.temp_preset||""},[this.selectField("temp_preset",[{value:"",label:"None (manual)"},...Object.entries(r).map((([e,p])=>({value:e,label:p.label})))])],(e=>{const t=e.detail.value.temp_preset,s=r[t];s?this._updateBinding(p,{temp_preset:t,cold_threshold:s.cold,range_min:s.min,range_max:s.max,hot_threshold:s.hot},n,i):this._updateBinding(p,{temp_preset:""},n,i)}))}
                    <div class="temp-zone-bar">
                      <div class="temp-zone cold" style="flex: ${Math.max(1,(null!==(l=e.range_min)&&void 0!==l?l:18)-(null!==(d=e.cold_threshold)&&void 0!==d?d:14))}">
                        <span>Cold</span>
                      </div>
                      <div class="temp-zone cool" style="flex: ${Math.max(1,(null!==(c=e.range_min)&&void 0!==c?c:18)-(null!==(m=e.cold_threshold)&&void 0!==m?m:14))}">
                        <span>Cool</span>
                      </div>
                      <div class="temp-zone comfort" style="flex: ${Math.max(1,(null!==(h=e.range_max)&&void 0!==h?h:26)-(null!==(u=e.range_min)&&void 0!==u?u:18))}">
                        <span>Comfort</span>
                      </div>
                      <div class="temp-zone warm" style="flex: ${Math.max(1,(null!==(g=e.hot_threshold)&&void 0!==g?g:30)-(null!==(y=e.range_max)&&void 0!==y?y:26))}">
                        <span>Warm</span>
                      </div>
                      <div class="temp-zone hot" style="flex: ${Math.max(1,(null!==(v=e.hot_threshold)&&void 0!==v?v:30)-(null!==(b=e.range_max)&&void 0!==b?b:26))}">
                        <span>Hot</span>
                      </div>
                    </div>
                    <div class="temp-thresholds">
                      ${a.U.renderFieldSection("Cold Below","Below this value the pet shivers.",s,{cold_threshold:null!==(_=e.cold_threshold)&&void 0!==_?_:14},[a.U.number("cold_threshold",-50,200,1)],(e=>this._updateBinding(p,{cold_threshold:e.detail.value.cold_threshold,temp_preset:"custom"},n,i)))}
                      ${a.U.renderFieldSection("Comfort Min","Start of the comfort zone.",s,{range_min:null!==(x=e.range_min)&&void 0!==x?x:18},[a.U.number("range_min",-50,200,1)],(e=>this._updateBinding(p,{range_min:e.detail.value.range_min,temp_preset:"custom"},n,i)))}
                      ${a.U.renderFieldSection("Comfort Max","End of the comfort zone.",s,{range_max:null!==(f=e.range_max)&&void 0!==f?f:26},[a.U.number("range_max",-50,200,1)],(e=>this._updateBinding(p,{range_max:e.detail.value.range_max,temp_preset:"custom"},n,i)))}
                      ${a.U.renderFieldSection("Hot Above","Above this value the pet overheats.",s,{hot_threshold:null!==($=e.hot_threshold)&&void 0!==$?$:30},[a.U.number("hot_threshold",-50,200,1)],(e=>this._updateBinding(p,{hot_threshold:e.detail.value.hot_threshold,temp_preset:"custom"},n,i)))}
                    </div>
                  `:""}
              ${"temperature"!==e.role&&"security"!==e.role?t.qy`
                    <div class="range-fields">
                      ${a.U.renderFieldSection("Ideal Range Min","Values in this range keep your pet happy.",s,{range_min:null!==(w=e.range_min)&&void 0!==w?w:""},[a.U.number("range_min",void 0,void 0,1)],(e=>this._updateBinding(p,{range_min:e.detail.value.range_min},n,i)))}
                      ${a.U.renderFieldSection("Ideal Range Max","",s,{range_max:null!==(C=e.range_max)&&void 0!==C?C:""},[a.U.number("range_max",void 0,void 0,1)],(e=>this._updateBinding(p,{range_max:e.detail.value.range_max},n,i)))}
                    </div>
                  `:""}
              ${this.renderSettingsSection("","",[{title:"Invert",description:"Flip the effect (high value = unhappy).",hass:s,data:{invert:e.invert||!1},schema:[this.booleanField("invert")],onChange:e=>this._updateBinding(p,{invert:e.detail.value.invert},n,i)}])}
            </div>
          `}
    `}_updateBinding(e,p,n,t){const s=[...n.entity_bindings||[]];s[e]=Object.assign(Object.assign({},s[e]),p),t({entity_bindings:s})}renderPreview(e,p,n){var s;const a=e;if(!p||!p.states)return this.renderGradientErrorState("Waiting for Home Assistant","Connecting to entity states...","mdi:loading");const i=a.entity_bindings&&a.entity_bindings.length>0?function(e,p){var n,t,s,a,i,o,d,c,m;let h=0,u=0,g=0,y=0,v=50,b=!1,_=0,x=0,f=0,$=0;for(const w of e){const e=p.states[w.entity];if(!e)continue;const C=null!==(n=w.weight)&&void 0!==n?n:1,F=e.state,k=parseFloat(F),S=void 0!==w.range_min&&void 0!==w.range_max;switch(w.role){case"happiness":{let e=50;w.happy_state&&F===w.happy_state?e=100:w.sad_state&&F===w.sad_state?e=0:!isNaN(k)&&S?e=l(k,w.range_min,w.range_max):isNaN(k)?"on"===F||"home"===F?e=80:"off"!==F&&"not_home"!==F||(e=30):e=Math.min(100,Math.max(0,k)),w.invert&&(e=100-e),h+=e*C,u+=C;break}case"energy":{let e=50;!isNaN(k)&&S?e=l(k,w.range_min,w.range_max):isNaN(k)?"on"===F?e=80:"off"===F&&(e=20):e=Math.min(100,Math.max(0,k)),w.invert&&(e=100-e),g+=e*C,y+=C;break}case"temperature":if(!isNaN(k)){const e=w.temp_preset&&r[w.temp_preset]?r[w.temp_preset]:null,p=null!==(s=null!==(t=w.cold_threshold)&&void 0!==t?t:null==e?void 0:e.cold)&&void 0!==s?s:14,n=null!==(i=null!==(a=w.range_min)&&void 0!==a?a:null==e?void 0:e.min)&&void 0!==i?i:18,l=null!==(d=null!==(o=w.range_max)&&void 0!==o?o:null==e?void 0:e.max)&&void 0!==d?d:26,h=null!==(m=null!==(c=w.hot_threshold)&&void 0!==c?c:null==e?void 0:e.hot)&&void 0!==m?m:30,[u,g,y,_]=[p,n,l,h].sort(((e,p)=>e-p));v=k<=u?0:k<g?15+(k-u)/(g-u||1)*25:k<=y?50:k<_?60+(k-y)/(_-y||1)*25:100,b=!0}break;case"activity":{let e=50;!isNaN(k)&&S?e=l(k,w.range_min,w.range_max):isNaN(k)?"on"===F||"detected"===F?e=90:"off"!==F&&"clear"!==F||(e=10):e=Math.min(100,Math.max(0,k)),w.invert&&(e=100-e),_+=e*C,x+=C;break}case"security":{let e=80;"armed_home"===F||"armed_away"===F?e=100:"disarmed"===F?e=60:"triggered"===F?e=5:"locked"===F?e=100:"unlocked"===F?e=30:"on"===F?e=20:"off"===F&&(e=90),w.invert&&(e=100-e),f+=e*C,$+=C;break}case"custom":{let e=50;w.happy_state&&F===w.happy_state?e=100:w.sad_state&&F===w.sad_state?e=0:!isNaN(k)&&S?e=l(k,w.range_min,w.range_max):isNaN(k)||(e=Math.min(100,Math.max(0,k))),w.invert&&(e=100-e),h+=e*C,u+=C;break}}}const w=u>0?h/u:60,C=y>0?g/y:60,F=b?v:50,k=x>0?_/x:40,S=$>0?f/$:80;return{mood:function(e,p,n,t){return t<20?"alert":n>85?"hot":n<15?"cold":p<15?"sleepy":e>=85&&p>=60?"ecstatic":e>=65?"happy":e>=45?"content":e>=30?"neutral":e>=15?"bored":"sad"}(w,C,F,S),happiness:w,energy:C,temperature:F,activity:k,security:S}}(a.entity_bindings,p):{mood:"content",happiness:60,energy:60,temperature:50,activity:40,security:80},o=this._speciesDefaults(a.species),b=a.pet_primary_color||o.primary,_=a.pet_secondary_color||o.secondary,x=a.accent_color||"var(--primary-color)",f=a.pet_size||160,$=!1!==a.enable_animations,w=a.show_speech_bubble?function(e){const p=d[e];return p[Math.floor(Date.now()/3e4)%p.length]}(i.mood):"",C=!1!==a.lcd_filter,F=t.qy`
      <style>${this._previewStyles()}</style>
      <div class="vp-device">
        <div class="vp-screen ${C?"lcd-on":""}">
          ${a.show_speech_bubble&&w?t.qy`
                <div class="vp-bubble">
                  <span class="vp-bubble-text">"${w}"</span>
                </div>
              `:t.s6}

          <div class="vp-pet-area">
            ${function(e,p,n,s,a,i){const o=20,r=15,l=u[e],d={p:n,s,d:"#2A2A2A",o:"#F4A623"},b=i?"pet-pixel-idle":"",_="cold"===p&&i?"pet-pixel-shiver":"";return t.JW`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${a}" height="${a}"
         style="image-rendering: pixelated; overflow: visible;">
      ${m(["....pppppppppp..",".....pppppppp..."],o,165,{p:"rgba(0,0,0,0.08)"})}
      <g class="${b} ${_}">
        ${m(v[e]||v.cat,o,r,d)}
        ${function(e,p,n,s,a,i){const o=i?"pet-pixel-tail":"";switch(e){case"cat":return t.JW`<g class="${o}">
        ${h(s,a,14,9,p)} ${h(s,a,15,8,p)} ${h(s,a,15,7,p)}
      </g>`;case"dog":return t.JW`<g class="${o}">
        ${h(s,a,14,8,p)} ${h(s,a,15,7,p)}
      </g>`;case"fox":return t.JW`<g class="${o}">
        ${h(s,a,14,9,p)} ${h(s,a,15,9,p)}
        ${h(s,a,15,8,p)} ${h(s,a,16,8,n)}
      </g>`;case"rabbit":return t.JW`${h(s,a,13,9,n)} ${h(s,a,14,9,n)} ${h(s,a,13,10,n)}`;case"penguin":return t.JW`${h(s,a,0,5,p)} ${h(s,a,0,6,p)} ${h(s,a,15,5,p)} ${h(s,a,15,6,p)}`;case"snake":case"turtle":case"frog":case"snail":default:return t.JW``;case"shrimp":return t.JW`<g class="${o}">
        ${h(s,a,6,12,p)} ${h(s,a,7,11,p)}
        ${h(s,a,8,12,p)} ${h(s,a,9,11,p)}
      </g>`}}(e,n,s,o,r,i)}
        ${function(e,p,n,s){const[a,i]=p.eyeL,[o,r]=p.eyeR,l="#1A1A1A",d="#FFFFFF";switch(e){case"star":return t.JW`
        ${h(n,s,a,i-1,l)} ${h(n,s,a-1,i,l)} ${h(n,s,a,i,l)} ${h(n,s,a+1,i,l)} ${h(n,s,a,i+1,l)}
        ${h(n,s,o,r-1,l)} ${h(n,s,o-1,r,l)} ${h(n,s,o,r,l)} ${h(n,s,o+1,r,l)} ${h(n,s,o,r+1,l)}
      `;case"happy":return t.JW`
        ${h(n,s,a-1,i,l)} ${h(n,s,a+1,i,l)} ${h(n,s,a,i-1,l)}
        ${h(n,s,o-1,r,l)} ${h(n,s,o+1,r,l)} ${h(n,s,o,r-1,l)}
      `;case"open":return t.JW`
        ${h(n,s,a,i,l)} ${h(n,s,a+1,i,d)}
        ${h(n,s,o,r,l)} ${h(n,s,o+1,r,d)}
      `;case"half":case"closed":return t.JW`
        ${h(n,s,a,i,l,2,1)}
        ${h(n,s,o,r,l,2,1)}
      `;case"sad":return t.JW`
        ${h(n,s,a,i,l)} ${h(n,s,a+1,i,d)}
        ${h(n,s,o,r,l)} ${h(n,s,o+1,r,d)}
        ${h(n,s,a-1,i-1,l)} ${h(n,s,a,i-1,l)}
        ${h(n,s,o+1,r-1,l)} ${h(n,s,o+2,r-1,l)}
      `;case"squint":return t.JW`
        ${h(n,s,a,i,l)}
        ${h(n,s,o,r,l)}
      `;case"wide":return t.JW`
        ${h(n,s,a,i,d,2,2)} ${h(n,s,a,i,l)} ${h(n,s,a+1,i+1,l)}
        ${h(n,s,o,r,d,2,2)} ${h(n,s,o,r,l)} ${h(n,s,o+1,r+1,l)}
      `;default:return t.JW`${h(n,s,a,i,l)} ${h(n,s,o,r,l)}`}}(g[p],l,o,r)}
        ${l.nosePos&&l.noseColor?h(o,r,l.nosePos[0],l.nosePos[1],l.noseColor,l.noseW||1):t.s6}
        ${function(e,p,n,s){const[a,i]=p,o="#1A1A1A";switch(e){case"big-smile":return t.JW`${h(n,s,a-1,i,o)} ${h(n,s,a+2,i,o)} ${h(n,s,a,i+1,o,2,1)}`;case"smile":return t.JW`${h(n,s,a-1,i,o)} ${h(n,s,a+2,i,o)} ${h(n,s,a,i+1,o)} ${h(n,s,a+1,i+1,o)}`;case"neutral":return t.JW`${h(n,s,a,i,o,2,1)}`;case"frown":return t.JW`${h(n,s,a,i,o,2,1)} ${h(n,s,a-1,i+1,o)} ${h(n,s,a+2,i+1,o)}`;case"o":return t.JW`${h(n,s,a,i,o,2,2)}`;case"wavy":return t.JW`${h(n,s,a-1,i+1,o)} ${h(n,s,a,i,o)} ${h(n,s,a+1,i+1,o)} ${h(n,s,a+2,i,o)}`;case"open":return t.JW`${h(n,s,a,i,o,3,1)}`;default:return t.JW``}}(y[p],l.mouth,o,r)}
        ${"robot"===e?(x=s,t.JW`
    <rect x="${90}" y="${15}" width="${20}" height="${c}" fill="${x}">
      <animate attributeName="fill" values="${x};#FF5252;${x}" dur="2s" repeatCount="indefinite"/>
    </rect>
  `):t.s6}
        ${t.s6}
        ${"sleepy"===p?function(e,p){const n="var(--primary-color)";return t.JW`
    <g opacity="0.7">
      ${h(e,p,14,1,n)} ${h(e,p,15,1,n)} ${h(e,p,15,2,n)} ${h(e,p,14,3,n)} ${h(e,p,15,3,n)}
    </g>
    <g opacity="0.4">
      ${h(e,p,16,0,n)}
    </g>
  `}(o,r):t.s6}
        ${"hot"===p?t.JW`
    <rect x="${170}" y="${35}" width="${c}" height="${20}" fill="#64B5F6" opacity="0.7">
      <animate attributeName="y" values="${35};${65};${35}" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
    </rect>
  `:t.s6}
        ${"alert"===p?function(){const e="#FF5252";return t.JW`${h(20,15,16,0,e)} ${h(20,15,16,1,e)} ${h(20,15,16,2,e)} ${h(20,15,16,4,e)}`}():t.s6}
      </g>
    </svg>
  `;var x}(a.species,i.mood,b,_,f,$)}
          </div>

          ${a.show_name||a.show_mood?t.qy`
                <div class="vp-info">
                  ${a.show_name?t.qy`<div class="vp-name">${a.pet_name||"Buddy"}</div>`:t.s6}
                  ${a.show_mood?t.qy`<div class="vp-mood" style="color: ${this._moodColor(i.mood)};">
                        ${this._moodEmoji(i.mood)} ${this._moodLabel(i.mood)}
                      </div>`:t.s6}
                </div>
              `:t.s6}

          ${a.show_stats?t.qy`
                <div class="vp-stats">
                  ${this._renderStatBar("HP",i.happiness,"#FFB300",x)}
                  ${this._renderStatBar("EP",i.energy,"#43A047",x)}
                  ${50!==i.temperature?this._renderStatBar("TMP",100-2*Math.abs(i.temperature-50),"#1E88E5",x):t.s6}
                  ${(null===(s=a.entity_bindings)||void 0===s?void 0:s.some((e=>"security"===e.role)))?this._renderStatBar("DEF",i.security,"#E53935",x):t.s6}
                </div>
              `:t.s6}
        </div>
      </div>
    `;return this.wrapWithAnimation(F,e,p)}_renderStatBar(e,p,n,s){const a=Math.min(100,Math.max(0,Math.round(p))),i=Math.round(a/10),o=[];for(let e=0;e<10;e++)o.push(t.qy`<div class="vp-seg ${e<i?"on":""}" style="${e<i?`background:${n};`:""}"></div>`);return t.qy`
      <div class="vp-stat">
        <span class="vp-stat-lbl">${e}</span>
        <div class="vp-stat-bar">${o}</div>
        <span class="vp-stat-val">${a}</span>
      </div>
    `}_speciesDefaults(e){const p={cat:{primary:"#7E57C2",secondary:"#D1C4E9"},dog:{primary:"#8D6E63",secondary:"#D7CCC8"},fox:{primary:"#FF7043",secondary:"#FFCCBC"},rabbit:{primary:"#EC407A",secondary:"#F8BBD0"},owl:{primary:"#5C6BC0",secondary:"#C5CAE9"},penguin:{primary:"#37474F",secondary:"#ECEFF1"},robot:{primary:"#78909C",secondary:"#4FC3F7"},shrimp:{primary:"#EF5350",secondary:"#FFCDD2"},snail:{primary:"#A1887F",secondary:"#8D6E63"},snake:{primary:"#66BB6A",secondary:"#C8E6C9"},turtle:{primary:"#4CAF50",secondary:"#795548"},frog:{primary:"#43A047",secondary:"#C8E6C9"}};return p[e]||p.cat}_moodLabel(e){return{ecstatic:"Ecstatic",happy:"Happy",content:"Content",neutral:"Neutral",bored:"Bored",sad:"Sad",sleepy:"Sleepy",cold:"Cold",hot:"Hot",alert:"Alert"}[e]}_moodEmoji(e){return{ecstatic:"★★★",happy:"♥",content:"~",neutral:"•",bored:"...",sad:";;",sleepy:"Zzz",cold:"***",hot:"!!!",alert:"⚡"}[e]}_moodColor(e){return{ecstatic:"#FFD600",happy:"#66BB6A",content:"#42A5F5",neutral:"#90A4AE",bored:"#78909C",sad:"#5C6BC0",sleepy:"#AB47BC",cold:"#29B6F6",hot:"#EF5350",alert:"#FF5252"}[e]}_editorStyles(){return"\n      .settings-section {\n        background: var(--secondary-background-color);\n        border-radius: 8px;\n        padding: 16px;\n        margin-bottom: 24px;\n      }\n      .section-title {\n        font-size: 18px;\n        font-weight: 700;\n        text-transform: uppercase;\n        color: var(--primary-color);\n        margin-bottom: 16px;\n        padding-bottom: 8px;\n        border-bottom: 2px solid var(--primary-color);\n        letter-spacing: 0.5px;\n      }\n      .species-grid {\n        display: grid;\n        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));\n        gap: 8px;\n        margin-bottom: 16px;\n      }\n      .species-btn {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 6px;\n        padding: 14px 8px;\n        border: 2px solid var(--divider-color);\n        border-radius: 12px;\n        background: var(--card-background-color);\n        cursor: pointer;\n        text-align: center;\n        transition: all 0.2s ease;\n        font-size: 12px;\n        font-weight: 500;\n        color: var(--primary-text-color);\n      }\n      .species-btn:hover {\n        border-color: var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.05);\n      }\n      .species-btn.active {\n        border-color: var(--primary-color);\n        background: rgba(var(--rgb-primary-color), 0.1);\n        color: var(--primary-color);\n      }\n      .species-btn ha-icon {\n        color: var(--primary-color);\n        --mdc-icon-size: 28px;\n      }\n      .binding-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        padding: 12px;\n        background: var(--card-background-color);\n        border-radius: 8px;\n        margin-bottom: 8px;\n        border: 1px solid var(--divider-color);\n        transition: all 0.2s ease;\n      }\n      .binding-row:hover {\n        background: var(--primary-color);\n        opacity: 0.9;\n      }\n      .binding-info {\n        flex: 1;\n        font-size: 14px;\n        color: var(--primary-text-color);\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n      .binding-info.empty {\n        color: var(--secondary-text-color);\n        font-style: italic;\n      }\n      .expand-icon {\n        cursor: pointer;\n        color: var(--primary-color);\n        flex-shrink: 0;\n        transition: transform 0.2s ease;\n      }\n      .expand-icon.expanded {\n        transform: rotate(180deg);\n      }\n      .delete-icon {\n        cursor: pointer;\n        color: var(--error-color);\n        flex-shrink: 0;\n      }\n      .binding-settings {\n        padding: 16px;\n        background: rgba(var(--rgb-primary-color), 0.05);\n        border-left: 3px solid var(--primary-color);\n        border-radius: 0 8px 8px 0;\n        margin-bottom: 8px;\n      }\n      .binding-settings.collapsed {\n        display: none;\n      }\n      .temp-zone-bar {\n        display: flex;\n        height: 28px;\n        border-radius: 6px;\n        overflow: hidden;\n        margin: 8px 0 12px;\n        font-size: 10px;\n        font-weight: 600;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n      }\n      .temp-zone {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        min-width: 30px;\n        color: #fff;\n        text-shadow: 0 1px 2px rgba(0,0,0,0.3);\n      }\n      .temp-zone.cold { background: #42A5F5; }\n      .temp-zone.cool { background: #80DEEA; color: #37474F; text-shadow: none; }\n      .temp-zone.comfort { background: #66BB6A; }\n      .temp-zone.warm { background: #FFA726; }\n      .temp-zone.hot { background: #EF5350; }\n      .temp-thresholds {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 8px;\n      }\n      .range-fields {\n        display: grid;\n        grid-template-columns: 1fr 1fr;\n        gap: 8px;\n        margin-top: 4px;\n      }\n      .add-btn {\n        padding: 8px 16px;\n        background: var(--primary-color);\n        color: var(--text-primary-color);\n        border: none;\n        border-radius: 8px;\n        cursor: pointer;\n        font-weight: 600;\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        transition: all 0.2s ease;\n      }\n      .add-btn:hover {\n        opacity: 0.9;\n        transform: translateY(-1px);\n      }\n      .add-btn.full-width {\n        width: 100%;\n        justify-content: center;\n        padding: 12px;\n      }\n    "}_previewStyles(){return"\n      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');\n\n      .vp-device {\n        display: flex;\n        justify-content: center;\n        width: 100%;\n        box-sizing: border-box;\n      }\n\n      /* ---- Dot-Matrix LCD Screen ---- */\n      .vp-screen {\n        position: relative;\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        padding: 12px 14px 14px;\n        width: 100%;\n        max-width: 320px;\n        aspect-ratio: 10 / 9;\n        box-sizing: border-box;\n        font-family: 'Press Start 2P', 'Courier New', monospace;\n        image-rendering: pixelated;\n        background: #1a1e24;\n        border: 2px solid rgba(255,255,255,0.08);\n        overflow: hidden;\n      }\n\n      /* Dot-matrix pixel grid */\n      .vp-screen::before {\n        content: '';\n        position: absolute;\n        top: 0; left: 0; right: 0; bottom: 0;\n        background:\n          linear-gradient(to right, rgba(0,0,0,0.18) 0px, transparent 1px),\n          linear-gradient(to bottom, rgba(0,0,0,0.18) 0px, transparent 1px);\n        background-size: 3px 3px;\n        pointer-events: none;\n        z-index: 3;\n      }\n\n      /* LCD color overlay (green tint like classic Gameboy) */\n      .vp-screen.lcd-on::after {\n        content: '';\n        position: absolute;\n        top: 0; left: 0; right: 0; bottom: 0;\n        background: radial-gradient(\n          ellipse at center,\n          rgba(132, 208, 125, 0.06) 0%,\n          rgba(94, 120, 93, 0.10) 60%,\n          rgba(62, 73, 67, 0.14) 100%\n        );\n        mix-blend-mode: screen;\n        pointer-events: none;\n        z-index: 4;\n      }\n\n      /* ---- Speech Bubble ---- */\n      .vp-bubble {\n        text-align: center;\n        padding: 0 4px;\n        z-index: 2;\n        flex-shrink: 0;\n        animation: vp-bubble-in 0.3s steps(4);\n      }\n\n      .vp-bubble-text {\n        font-size: 10px;\n        line-height: 1.5;\n        color: var(--secondary-text-color);\n        letter-spacing: 0.3px;\n        font-style: italic;\n      }\n\n      @keyframes vp-bubble-in {\n        from { opacity: 0; }\n        to { opacity: 1; }\n      }\n\n      /* ---- Pet (centered in remaining space) ---- */\n      .vp-pet-area {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        z-index: 2;\n        flex: 1;\n        min-height: 0;\n        margin: auto 0;\n      }\n\n      .pet-pixel-idle {\n        animation: pet-px-bounce 1.6s steps(4) infinite;\n      }\n\n      @keyframes pet-px-bounce {\n        0%, 100% { transform: translateY(0); }\n        50% { transform: translateY(-6px); }\n      }\n\n      .pet-pixel-tail {\n        animation: pet-px-tail 0.5s steps(2) infinite;\n      }\n\n      @keyframes pet-px-tail {\n        0%, 100% { transform: translateY(0) rotate(0deg); }\n        50% { transform: translateY(-4px) rotate(6deg); }\n      }\n\n      .pet-pixel-shiver {\n        animation: pet-px-shiver 0.12s steps(2) infinite !important;\n      }\n\n      @keyframes pet-px-shiver {\n        0%, 100% { transform: translateX(0); }\n        50% { transform: translateX(-4px); }\n      }\n\n      /* ---- Name + Mood (stacked, tight) ---- */\n      .vp-info {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: 3px;\n        padding: 0;\n        margin-top: -20px;\n        z-index: 2;\n        flex-shrink: 0;\n      }\n\n      .vp-name {\n        font-size: 14px;\n        color: var(--primary-text-color);\n        text-transform: uppercase;\n        letter-spacing: 3px;\n      }\n\n      .vp-mood {\n        font-size: 11px;\n        text-transform: uppercase;\n        letter-spacing: 1.5px;\n      }\n\n      /* ---- Stat Bars (inline HUD) ---- */\n      .vp-stats {\n        width: 100%;\n        display: flex;\n        flex-direction: column;\n        gap: 5px;\n        padding-top: 4px;\n        z-index: 2;\n        flex-shrink: 0;\n      }\n\n      .vp-stat {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .vp-stat-lbl {\n        font-size: 9px;\n        width: 30px;\n        color: var(--secondary-text-color);\n        text-transform: uppercase;\n        flex-shrink: 0;\n        letter-spacing: 0.5px;\n      }\n\n      .vp-stat-bar {\n        display: flex;\n        gap: 2px;\n        flex: 1;\n        height: 12px;\n      }\n\n      .vp-stat-val {\n        font-size: 9px;\n        width: 28px;\n        text-align: right;\n        color: var(--secondary-text-color);\n        flex-shrink: 0;\n      }\n\n      .vp-seg {\n        flex: 1;\n        background: rgba(255,255,255,0.06);\n      }\n\n      .vp-seg.on {\n        box-shadow: inset 0 -2px 0 0 rgba(0,0,0,0.3);\n      }\n    "}getStyles(){return`${s.m.getSliderStyles()}`}}}}]);