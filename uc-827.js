"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[827],{2827:(t,e,o)=>{o.r(e),o.d(e,{UcModuleSelectorShell:()=>n});var i=o(5183),s=o(4276),a=function(t,e,o,i){var s,a=arguments.length,n=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,o,i);else for(var r=t.length-1;r>=0;r--)(s=t[r])&&(n=(a<3?s(n):a>3?s(e,o,n):s(e,o))||n);return a>3&&n&&Object.defineProperty(e,o,n),n};let n=class extends i.WF{constructor(){super(...arguments),this.isAddingToLayoutModule=!1,this.activeTab="modules",this._dragState={isDragging:!1,startX:0,startY:0,initialLeft:0,initialTop:0},this._resizeState={active:!1,startY:0,startHeight:0},this._popupEl=null,this._boundDragMove=t=>this._onDragMove(t),this._boundDragEnd=()=>this._onDragEnd(),this._boundResizeMove=t=>this._onResizeMove(t),this._boundResizeEnd=()=>this._onResizeEnd()}_dispatchClose(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_dispatchTabChange(t){this.dispatchEvent(new CustomEvent("tab-change",{detail:{tab:t},bubbles:!0,composed:!0}))}_startDrag(t){if(this._popupEl=t.target.closest(".selector-content"),!this._popupEl)return;t.preventDefault();const e=this._popupEl.getBoundingClientRect();this._popupEl.style.marginLeft="0",this._popupEl.style.marginTop="0",this._popupEl.style.left=`${e.left}px`,this._popupEl.style.top=`${e.top}px`,this._dragState={isDragging:!0,startX:t.clientX,startY:t.clientY,initialLeft:e.left,initialTop:e.top},document.addEventListener("mousemove",this._boundDragMove),document.addEventListener("mouseup",this._boundDragEnd),this._popupEl.classList.add("popup-dragging")}_onDragMove(t){var e;if(!this._dragState.isDragging||!(null===(e=this._popupEl)||void 0===e?void 0:e.isConnected))return void this._onDragEnd();const o=t.clientX-this._dragState.startX,i=t.clientY-this._dragState.startY,s=this._dragState.initialLeft+o,a=this._dragState.initialTop+i,n=window.innerWidth-this._popupEl.offsetWidth,r=window.innerHeight-this._popupEl.offsetHeight;this._popupEl.style.left=`${Math.max(0,Math.min(s,n))}px`,this._popupEl.style.top=`${Math.max(0,Math.min(a,r))}px`}_onDragEnd(){var t;null===(t=this._popupEl)||void 0===t||t.classList.remove("popup-dragging"),this._popupEl=null,this._dragState={isDragging:!1,startX:0,startY:0,initialLeft:0,initialTop:0},document.removeEventListener("mousemove",this._boundDragMove),document.removeEventListener("mouseup",this._boundDragEnd)}_startResize(t){const e=t.target.closest(".selector-content");e&&(t.preventDefault(),t.stopPropagation(),this._resizeState={active:!0,startY:t.clientY,startHeight:e.offsetHeight},document.addEventListener("mousemove",this._boundResizeMove),document.addEventListener("mouseup",this._boundResizeEnd))}_onResizeMove(t){var e;if(!this._resizeState.active)return;const o=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector(".selector-content");if(!o)return;const i=t.clientY-this._resizeState.startY,s=Math.max(200,this._resizeState.startHeight+i);o.style.maxHeight=`${s}px`}_onResizeEnd(){this._resizeState={active:!1,startY:0,startHeight:0},document.removeEventListener("mousemove",this._boundResizeMove),document.removeEventListener("mouseup",this._boundResizeEnd)}render(){return i.qy`
      <div class="module-selector-popup">
        <div
          class="popup-overlay"
          @click=${this._dispatchClose}
        ></div>
        <div class="selector-content draggable-popup" id="module-selector-popup">
          <div class="selector-header-wrapper">
            <div
              class="selector-header"
              @mousedown=${t=>this._startDrag(t)}
            >
              <div class="selector-header-top">
                <h3>Add Module</h3>
                <button
                  class="close-button"
                  title="Close"
                  @mousedown=${t=>t.stopPropagation()}
                  @click=${this._dispatchClose}
                >
                  ×
                </button>
              </div>
              ${this.isAddingToLayoutModule?i.qy`<p class="selector-subtitle">
                    Adding to layout module (content modules and layout modules allowed up to 2
                    levels deep)
                  </p>`:""}
            </div>
            <div class="module-selector-tabs">
              <button
                class="tab-button ${"modules"===this.activeTab?"active":""}"
                @click=${()=>this._dispatchTabChange("modules")}
              >
                <ha-icon icon="mdi:puzzle"></ha-icon>
                <span>Modules</span>
              </button>
              <button
                class="tab-button ${"cards"===this.activeTab?"active":""}"
                @click=${()=>this._dispatchTabChange("cards")}
              >
                <ha-icon icon="mdi:card-multiple"></ha-icon>
                <span>Cards</span>
              </button>
              <button
                class="tab-button ${"presets"===this.activeTab?"active":""}"
                @click=${()=>this._dispatchTabChange("presets")}
              >
                <ha-icon icon="mdi:palette"></ha-icon>
                <span>Presets</span>
              </button>
              <button
                class="tab-button ${"favorites"===this.activeTab?"active":""}"
                @click=${()=>this._dispatchTabChange("favorites")}
              >
                <ha-icon icon="mdi:heart"></ha-icon>
                <span>Favorites</span>
              </button>
            </div>
          </div>
          <div class="selector-body">
            <slot></slot>
          </div>
          <div
            class="resize-handle"
            @mousedown=${t=>this._startResize(t)}
            title="Drag to resize"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `}};n.styles=i.AH`
    .module-selector-popup {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .module-selector-popup > * {
      pointer-events: auto;
    }
    .popup-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      pointer-events: auto;
      cursor: default;
    }
    .selector-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      width: min(90vw, 720px);
      max-height: min(85vh, 700px);
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      pointer-events: auto;
    }
    .selector-content.popup-dragging {
      cursor: grabbing;
    }
    .selector-header-wrapper {
      flex-shrink: 0;
    }
    .selector-header {
      padding: 16px;
      cursor: grab;
      user-select: none;
    }
    .selector-header:active {
      cursor: grabbing;
    }
    .selector-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .selector-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 4px;
      color: var(--secondary-text-color);
    }
    .close-button:hover {
      color: var(--primary-text-color);
    }
    .selector-subtitle {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .module-selector-tabs {
      display: flex;
      gap: 4px;
      padding: 0 16px 12px;
    }
    .tab-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
      border-radius: 8px;
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
    }
    .tab-button:hover {
      background: var(--secondary-background-color);
    }
    .tab-button.active {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      color: var(--primary-color);
    }
    .tab-button ha-icon {
      --mdc-icon-size: 18px;
    }
    .selector-body {
      flex: 1;
      overflow-y: auto;
      padding: 0 16px 16px;
      min-height: 200px;
    }
    .resize-handle {
      flex-shrink: 0;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: ns-resize;
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--secondary-text-color);
    }
    .resize-handle ha-icon {
      --mdc-icon-size: 16px;
    }
  `,a([(0,s.MZ)({type:Boolean})],n.prototype,"isAddingToLayoutModule",void 0),a([(0,s.MZ)()],n.prototype,"activeTab",void 0),a([(0,s.wk)()],n.prototype,"_dragState",void 0),a([(0,s.wk)()],n.prototype,"_resizeState",void 0),n=a([(0,s.EM)("uc-module-selector-shell")],n)}}]);