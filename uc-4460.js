/*! For license information please see uc-4460.js.LICENSE.txt */
"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[4460],{732:(o,r,t)=>{t.d(r,{FB:()=>v});var e=t(5183),i=t(4276),n=t(9247),a=t(5201),s=t(2593);const l=(o,r,t)=>{const e=new Map;for(let i=r;i<=t;i++)e.set(o[i],i);return e},c=(0,a.u$)(class extends a.WL{constructor(o){if(super(o),o.type!==a.OA.CHILD)throw Error("repeat() can only be used in text expressions")}dt(o,r,t){let e;void 0===t?t=r:void 0!==r&&(e=r);const i=[],n=[];let a=0;for(const r of o)i[a]=e?e(r,a):a,n[a]=t(r,a),a++;return{values:n,keys:i}}render(o,r,t){return this.dt(o,r,t).values}update(o,[r,t,e]){const i=(0,s.cN)(o),{values:a,keys:c}=this.dt(r,t,e);if(!Array.isArray(i))return this.ut=c,a;const d=this.ut??=[],p=[];let u,g,v=0,h=i.length-1,b=0,_=a.length-1;for(;v<=h&&b<=_;)if(null===i[v])v++;else if(null===i[h])h--;else if(d[v]===c[b])p[b]=(0,s.lx)(i[v],a[b]),v++,b++;else if(d[h]===c[_])p[_]=(0,s.lx)(i[h],a[_]),h--,_--;else if(d[v]===c[_])p[_]=(0,s.lx)(i[v],a[_]),(0,s.Dx)(o,p[_+1],i[v]),v++,_--;else if(d[h]===c[b])p[b]=(0,s.lx)(i[h],a[b]),(0,s.Dx)(o,i[v],i[h]),h--,b++;else if(void 0===u&&(u=l(c,b,_),g=l(d,v,h)),u.has(d[v]))if(u.has(d[h])){const r=g.get(c[b]),t=void 0!==r?i[r]:null;if(null===t){const r=(0,s.Dx)(o,i[v]);(0,s.lx)(r,a[b]),p[b]=r}else p[b]=(0,s.lx)(t,a[b]),(0,s.Dx)(o,i[v],t),i[r]=null;b++}else(0,s.KO)(i[h]),h--;else(0,s.KO)(i[v]),v++;for(;b<=_;){const r=(0,s.Dx)(o,p[_+1]);(0,s.lx)(r,a[b]),p[b++]=r}for(;v<=h;){const o=i[v++];null!==o&&(0,s.KO)(o)}return this.ut=c,(0,s.mY)(o,p),n.c0}});var d=t(1001),p=(t(7921),function(o,r,t,e){var i,n=arguments.length,a=n<3?r:null===e?e=Object.getOwnPropertyDescriptor(r,t):e;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(o,r,t,e);else for(var s=o.length-1;s>=0;s--)(i=o[s])&&(a=(n<3?i(a):n>3?i(r,t,a):i(r,t))||a);return n>3&&a&&Object.defineProperty(r,t,a),a});function u(o,r,t){const e=g(o),i=g(r);return e&&i?(n=Math.round(e.r+(i.r-e.r)*t),a=Math.round(e.g+(i.g-e.g)*t),s=Math.round(e.b+(i.b-e.b)*t),`#${((1<<24)+(n<<16)+(a<<8)+s).toString(16).slice(1)}`):o;var n,a,s}function g(o){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(o);return r?{r:parseInt(r[1],16),g:parseInt(r[2],16),b:parseInt(r[3],16)}:null}function v(){return[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}]}let h=4,b=class extends e.WF{constructor(){super(...arguments),this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],this.barSize="regular",this.barRadius="round",this.barStyle="flat",this._draggedIndex=null,this._colorPickerOpen=!1,this._colorPickerStopId=null,this._colorPickerCurrentColor="#000000"}render(){const o=[...this.stops].sort(((o,r)=>o.position-r.position));return e.qy`
      <!-- Action Buttons -->
      <div class="buttons-row">
        <button class="add-button" @click=${this._addStop}>
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Stop
        </button>
        <button class="reset-button" @click=${this._resetStops}>
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            />
          </svg>
          Reset
        </button>
      </div>

      <!-- Gradient Stops List -->
      <div class="stops-list ${null!==this._draggedIndex?"drag-active":""}">
        ${c(o,(o=>o.id),((r,t)=>this._renderStopItem(r,t,o.length)))}
      </div>

      <!-- Color Picker Popup -->
      ${this._colorPickerOpen?e.qy`
            <div class="color-picker-overlay" @click=${this._closeColorPicker}>
              <div class="color-picker-popup" @click=${o=>o.stopPropagation()}>
                <div class="color-picker-header">
                  <h3>Choose Color</h3>
                  <button class="close-btn" @click=${this._closeColorPicker}>×</button>
                </div>
                <ultra-color-picker
                  .value=${this._colorPickerCurrentColor}
                  .defaultValue=${this._colorPickerCurrentColor}
                  @value-changed=${this._handleColorPickerChange}
                ></ultra-color-picker>
              </div>
            </div>
          `:""}
    `}_renderStopItem(o,r,t){const i=0===o.position||100===o.position,n=this._draggedIndex===r,a=t>2&&!i;return e.qy`
      <div
        class="stop-item ${i?"boundary":""} ${n?"dragging":""}"
        draggable="true"
        @dragstart=${o=>this._handleDragStart(o,r)}
        @dragend=${this._handleDragEnd}
        @dragover=${this._handleDragOver}
        @drop=${o=>this._handleDrop(o,r)}
      >
        <!-- Drag Handle -->
        <div class="drag-handle">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"
            />
          </svg>
        </div>

        <!-- Color Preview & Picker -->
        <div
          class="color-preview color-circle"
          style="background-color: ${o.color}; cursor: pointer;"
          @click=${()=>this._openColorPicker(o.id,o.color)}
        ></div>

        <!-- Percentage Input -->
        <input
          type="number"
          class="percentage-input"
          .value=${o.position.toString()}
          min="0"
          max="100"
          @input=${r=>this._handlePositionChange(o.id,parseFloat(r.target.value)||0)}
          @blur=${this._validateAndSortStops}
        />

        <!-- Stop Info -->
        <div class="stop-info">
          <span>${o.position}%</span>
        </div>

        <!-- Delete Button -->
        <button
          class="delete-button"
          ?disabled=${!a}
          @click=${()=>this._deleteStop(o.id)}
          title=${a?"Delete stop":"Cannot delete boundary stops"}
        >
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            />
          </svg>
        </button>
      </div>
    `}_addStop(){const o=function(o){if(!o||o.length<2)return{id:"stop-"+h++,position:50,color:"#808080"};const r=[...o].sort(((o,r)=>o.position-r.position));let t=0,e=50,i="#808080";for(let o=0;o<r.length-1;o++){const n=r[o+1].position-r[o].position;n>t&&(t=n,e=r[o].position+n/2,i=u(r[o].color,r[o+1].color,.5))}return{id:"stop-"+h++,position:Math.round(e),color:i}}(this.stops);this.stops=[...this.stops,o],this._notifyChange()}_resetStops(){this.stops=[{id:"1",position:0,color:"#ff0000"},{id:"2",position:50,color:"#ffff00"},{id:"3",position:100,color:"#00ff00"}],h=4,this._notifyChange(),this._dispatchResetEvent()}_deleteStop(o){if(this.stops.length<=2)return;const r=this.stops.find((r=>r.id===o));r&&0!==r.position&&100!==r.position&&(this.stops=this.stops.filter((r=>r.id!==o)),this._notifyChange())}_handleColorChange(o,r){this.stops=this.stops.map((t=>t.id===o?Object.assign(Object.assign({},t),{color:r}):t)),this._notifyChange()}_openColorPicker(o,r){this._colorPickerStopId=o,this._colorPickerCurrentColor=r,this._colorPickerOpen=!0}_closeColorPicker(){this._colorPickerOpen=!1,this._colorPickerStopId=null}_handleColorPickerChange(o){this._colorPickerStopId&&(this._handleColorChange(this._colorPickerStopId,o.detail.value),this._colorPickerCurrentColor=o.detail.value)}_handlePositionChange(o,r){r=Math.max(0,Math.min(100,r)),this.stops=this.stops.map((t=>t.id===o?Object.assign(Object.assign({},t),{position:r}):t)),this.requestUpdate()}_validateAndSortStops(){this.stops=this.stops.map((o=>0===o.position||"1"===o.id&&o.position<50?Object.assign(Object.assign({},o),{position:0}):100===o.position||"3"===o.id&&o.position>50?Object.assign(Object.assign({},o),{position:100}):o)),this._notifyChange()}_notifyChange(){this.dispatchEvent(new CustomEvent("gradient-changed",{detail:{stops:this.stops},bubbles:!0,composed:!0}))}_dispatchResetEvent(){this.dispatchEvent(new CustomEvent("gradient-stop-reset",{bubbles:!0,composed:!0}))}_handleDragStart(o,r){this._draggedIndex=r,o.dataTransfer&&(o.dataTransfer.effectAllowed="move",o.dataTransfer.setData("text/html",r.toString()))}_handleDragEnd(){this._draggedIndex=null}_handleDragOver(o){o.preventDefault(),o.dataTransfer&&(o.dataTransfer.dropEffect="move")}_handleDrop(o,r){if(o.preventDefault(),null===this._draggedIndex||this._draggedIndex===r)return;const t=[...this.stops].sort(((o,r)=>o.position-r.position)),e=t[this._draggedIndex],i=t[r];this.stops=this.stops.map((o=>o.id===e.id?Object.assign(Object.assign({},o),{position:i.position}):o.id===i.id?Object.assign(Object.assign({},o),{position:e.position}):o)),this._draggedIndex=null,this._notifyChange()}};b.styles=e.AH`
    :host {
      display: block;
      width: 100%;
      font-family: var(--mdc-typography-body1-font-family, Roboto, sans-serif);
    }

    .gradient-preview {
      width: 100%;
      height: 16px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
      background-color: var(--card-background-color, #1c1c1c);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .gradient-preview-fill {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      position: relative;
    }

    /* Bar size variants to match actual card bars */
    .gradient-preview.bar-size-thin {
      height: 8px;
      border-radius: 4px;
    }

    .gradient-preview.bar-size-regular {
      height: 16px;
      border-radius: 8px;
    }

    .gradient-preview.bar-size-thick {
      height: 24px;
      border-radius: 12px;
    }

    .gradient-preview.bar-size-thiccc {
      height: 32px;
      border-radius: 16px;
    }

    /* Bar radius variants to match actual card bars */
    .gradient-preview.bar-radius-square {
      border-radius: 0;
    }

    .gradient-preview.bar-radius-round {
      /* Uses default border-radius from size classes */
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thin {
      border-radius: 2px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-regular {
      border-radius: 4px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thick {
      border-radius: 6px;
    }

    .gradient-preview.bar-radius-rounded-square.bar-size-thiccc {
      border-radius: 8px;
    }

    .buttons-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .add-button,
    .reset-button {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .add-button {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .add-button:hover {
      background: var(--primary-color);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .reset-button {
      background: var(--secondary-color, #666);
      color: white;
    }

    .reset-button:hover {
      background: var(--secondary-color, #666);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .stops-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stop-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .stop-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .stop-item.dragging {
      opacity: 0.7;
      transform: scale(1.02);
      z-index: ${d.Mu.MODULE_POPUP_CONTENT};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .drag-handle {
      width: 20px;
      height: 20px;
      cursor: grab;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drag-handle:hover {
      color: var(--primary-text-color);
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    .color-preview {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--divider-color);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .color-preview:hover {
      border-color: var(--primary-color);
      transform: scale(1.1);
    }

    .percentage-input {
      width: 80px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      text-align: center;
      font-weight: 500;
    }

    .percentage-input:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
    }

    .stop-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 14px;
    }

    .delete-button {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--secondary-text-color);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .delete-button:hover {
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
      color: var(--error-color, #f44336);
    }

    .delete-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .stop-item.boundary .delete-button {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .icon {
      width: 18px;
      height: 18px;
    }

    /* Drag and drop styling */
    .stops-list.drag-active .stop-item:not(.dragging) {
      transition: transform 0.2s ease;
    }

    /* Color Circle Styling */
    .color-circle {
      border: 3px solid var(--divider-color);
      transition: all 0.2s ease;
    }

    .color-circle:hover {
      border-color: var(--primary-color);
      transform: scale(1.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Color Picker Popup */
    .color-picker-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${d.Mu.MODULE_POPUP_CONTENT};
      backdrop-filter: blur(2px);
    }

    .color-picker-popup {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--divider-color);
    }

    .color-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--divider-color);
    }

    .color-picker-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--divider-color);
      color: var(--primary-text-color);
    }
  `,p([(0,i.MZ)({type:Array})],b.prototype,"stops",void 0),p([(0,i.MZ)({type:String})],b.prototype,"barSize",void 0),p([(0,i.MZ)({type:String})],b.prototype,"barRadius",void 0),p([(0,i.MZ)({type:String})],b.prototype,"barStyle",void 0),p([(0,i.wk)()],b.prototype,"_draggedIndex",void 0),p([(0,i.wk)()],b.prototype,"_colorPickerOpen",void 0),p([(0,i.wk)()],b.prototype,"_colorPickerStopId",void 0),p([(0,i.wk)()],b.prototype,"_colorPickerCurrentColor",void 0),b=p([(0,i.EM)("uc-gradient-editor")],b)},5121:(o,r,t)=>{function e(o){if(null==o)return{_error:"Template returned undefined or null"};if("object"==typeof o&&!Array.isArray(o)){const r={};if(void 0!==o.icon&&(r.icon=String(o.icon).trim()),void 0!==o.icon_color&&(r.icon_color=String(o.icon_color).trim()),void 0!==o.container_background_color&&(r.container_background_color=String(o.container_background_color).trim()),void 0!==o.name&&(r.name=String(o.name).trim()),void 0!==o.name_color&&(r.name_color=String(o.name_color).trim()),void 0!==o.state_text&&(r.state_text=String(o.state_text).trim()),void 0!==o.state_color&&(r.state_color=String(o.state_color).trim()),void 0!==o.content&&(r.content=String(o.content).trim()),void 0!==o.color&&(r.color=String(o.color).trim()),void 0!==o.value&&(r.value=o.value),void 0!==o.label&&(r.label=String(o.label).trim()),void 0!==o.gauge_color&&(r.gauge_color=String(o.gauge_color).trim()),void 0!==o.colors&&Array.isArray(o.colors)&&(r.colors=o.colors.map((o=>String(o).trim()))),void 0!==o.global_color&&(r.global_color=String(o.global_color).trim()),void 0!==o.fill_area&&(r.fill_area=Boolean(o.fill_area)),void 0!==o.pie_fill){const t="number"==typeof o.pie_fill?o.pie_fill:parseFloat(String(o.pie_fill));isNaN(t)||(r.pie_fill=t)}return void 0!==o.button_background_color&&(r.button_background_color=String(o.button_background_color).trim()),void 0!==o.button_text_color&&(r.button_text_color=String(o.button_text_color).trim()),void 0!==o.value_color&&(r.value_color=String(o.value_color).trim()),void 0!==o.entity&&(r.entity=String(o.entity).trim()),void 0!==o.visible&&(r.visible=Boolean(o.visible)),void 0!==o.overlay_text&&(r.overlay_text=String(o.overlay_text).trim()),void 0!==o.overlay_color&&(r.overlay_color=String(o.overlay_color).trim()),r}const r=String(o).trim();if(""===r)return{_error:"Template returned empty string"};if(r.startsWith("{")&&r.endsWith("}")||r.startsWith("[")&&r.endsWith("]"))try{const o=JSON.parse(r);if("object"!=typeof o||Array.isArray(o))return{_error:"Template must return an object, not an array"};const t={};if(void 0!==o.icon&&(t.icon=String(o.icon).trim()),void 0!==o.icon_color&&(t.icon_color=String(o.icon_color).trim()),void 0!==o.container_background_color&&(t.container_background_color=String(o.container_background_color).trim()),void 0!==o.name&&(t.name=String(o.name).trim()),void 0!==o.name_color&&(t.name_color=String(o.name_color).trim()),void 0!==o.state_text&&(t.state_text=String(o.state_text).trim()),void 0!==o.state_color&&(t.state_color=String(o.state_color).trim()),void 0!==o.content&&(t.content=String(o.content).trim()),void 0!==o.color&&(t.color=String(o.color).trim()),void 0!==o.value&&(t.value=o.value),void 0!==o.label&&(t.label=String(o.label).trim()),void 0!==o.gauge_color&&(t.gauge_color=String(o.gauge_color).trim()),void 0!==o.colors&&Array.isArray(o.colors)&&(t.colors=o.colors.map((o=>String(o).trim()))),void 0!==o.global_color&&(t.global_color=String(o.global_color).trim()),void 0!==o.fill_area&&(t.fill_area=Boolean(o.fill_area)),void 0!==o.pie_fill){const r="number"==typeof o.pie_fill?o.pie_fill:parseFloat(String(o.pie_fill));isNaN(r)||(t.pie_fill=r)}return void 0!==o.button_background_color&&(t.button_background_color=String(o.button_background_color).trim()),void 0!==o.button_text_color&&(t.button_text_color=String(o.button_text_color).trim()),void 0!==o.value_color&&(t.value_color=String(o.value_color).trim()),void 0!==o.entity&&(t.entity=String(o.entity).trim()),void 0!==o.visible&&(t.visible=Boolean(o.visible)),void 0!==o.overlay_text&&(t.overlay_text=String(o.overlay_text).trim()),void 0!==o.overlay_color&&(t.overlay_color=String(o.overlay_color).trim()),t}catch(o){return{_error:`Invalid JSON: ${o instanceof Error?o.message:"Unknown error"}`}}return{icon:r,_isString:!0}}function i(o){return void 0!==o._error}t.d(r,{HD:()=>i,cv:()=>e})},9327:(o,r,t)=>{function e(o,r,t){var e;const i=null===(e=null==r?void 0:r.states)||void 0===e?void 0:e[o];if(!i)return{entity:o,state:"unavailable",name:(null==t?void 0:t.name)||o,attributes:{},unit:"",domain:o.split(".")[0]||"unknown",device_class:"",friendly_name:(null==t?void 0:t.name)||o,config:t||{}};const n=o.split(".")[0],a=i.attributes||{};return{entity:o,state:i.state,name:(null==t?void 0:t.name)||a.friendly_name||o,attributes:a,unit:a.unit_of_measurement||"",domain:n,device_class:a.device_class||"",friendly_name:a.friendly_name||"",config:t||{},state_number:parseFloat(i.state),state_boolean:"on"===i.state||"true"===i.state||"yes"===i.state}}function i(o,r,t){const i=o.map(((o,i)=>{const n=null==t?void 0:t[i];return e(o,r,n)})),n=i[0]||{entity:"",state:"unavailable",name:"",attributes:{},unit:"",domain:"unknown",device_class:"",friendly_name:"",config:{}};return Object.assign(Object.assign({},n),{entities:i})}t.d(r,{pL:()=>e,wI:()=>i})}}]);