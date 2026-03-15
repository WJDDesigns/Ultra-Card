/*! For license information please see uc-8269.js.LICENSE.txt */
"use strict";(self.webpackChunkultra_card=self.webpackChunkultra_card||[]).push([[8269],{3038:(e,t,r)=>{r.r(t),r.d(t,{entityMapper:()=>i});const i=new class{applyMappingToLayout(e,t){if(!e||!e.rows||0===t.length)return e;const r=new Map;return t.forEach((e=>r.set(e.original,e.mapped))),Object.assign(Object.assign({},e),{rows:e.rows.map((e=>this._mapRow(e,r)))})}applyMappingToRow(e,t){if(!e||0===t.length)return e;const r=new Map;return t.forEach((e=>r.set(e.original,e.mapped))),this._mapRow(e,r)}reverseMappings(e){return e.map((e=>({original:e.mapped,mapped:e.original,domain:e.domain})))}suggestEntities(e,t){if(!e||0===t.length)return[];const r=this._getDomain(e),i=this._getEntityName(e);return t.map((t=>({entityId:t,score:this._calculateMatchScore(e,i,r,t)}))).filter((e=>e.score>0)).sort(((e,t)=>t.score-e.score)).slice(0,10).map((e=>e.entityId))}_calculateMatchScore(e,t,r,i){const a=this._getDomain(i),o=this._getEntityName(i);let s=0;return r!==a?0:(s+=80,t===o?100:(s+=20*(1-this._levenshteinDistance(t,o)/Math.max(t.length,o.length)),s))}_levenshteinDistance(e,t){const r=e.toLowerCase(),i=t.toLowerCase(),a=[];for(let e=0;e<=r.length;e++){let t=e;for(let o=0;o<=i.length;o++)if(0===e)a[o]=o;else if(o>0){let s=a[o-1];r.charAt(e-1)!==i.charAt(o-1)&&(s=Math.min(Math.min(s,t),a[o])+1),a[o-1]=t,t=s}e>0&&(a[i.length]=t)}return a[i.length]}_mapRow(e,t){var r;return Object.assign(Object.assign({},e),{columns:(null===(r=e.columns)||void 0===r?void 0:r.map((e=>this._mapColumn(e,t))))||[]})}_mapColumn(e,t){var r;return Object.assign(Object.assign({},e),{modules:(null===(r=e.modules)||void 0===r?void 0:r.map((e=>this._mapModule(e,t))))||[]})}_mapModule(e,t){if(!e||!e.type)return e;switch(e.type){case"icon":return this._mapIconModule(e,t);case"info":return this._mapInfoModule(e,t);case"bar":return this._mapBarModule(e,t);case"camera":return this._mapCameraModule(e,t);case"light":return this._mapLightModule(e,t);case"horizontal":return this._mapHorizontalModule(e,t);case"vertical":return this._mapVerticalModule(e,t);case"map":return this._mapMapModule(e,t);case"slider":return this._mapSliderModule(e,t);case"image":return this._mapImageModule(e,t);default:if("entity"in e&&"string"==typeof e.entity){const r=e.entity;if(t.has(r))return Object.assign(Object.assign({},e),{entity:t.get(r)})}return e}}_mapIconModule(e,t){var r;return Object.assign(Object.assign({},e),{icons:null===(r=e.icons)||void 0===r?void 0:r.map((e=>Object.assign(Object.assign({},e),{entity:t.get(e.entity)||e.entity})))})}_mapInfoModule(e,t){var r;return Object.assign(Object.assign({},e),{info_entities:null===(r=e.info_entities)||void 0===r?void 0:r.map((e=>Object.assign(Object.assign({},e),{entity:t.get(e.entity)||e.entity})))})}_mapBarModule(e,t){return Object.assign(Object.assign({},e),{entity:t.get(e.entity)||e.entity})}_mapCameraModule(e,t){return Object.assign(Object.assign({},e),{entity:t.get(e.entity)||e.entity})}_mapImageModule(e,t){const r=Object.assign({},e);return e.entity&&(r.entity=t.get(e.entity)||e.entity),e.image_entity&&(r.image_entity=t.get(e.image_entity)||e.image_entity),e.single_entity&&(r.single_entity=t.get(e.single_entity)||e.single_entity),r}_mapLightModule(e,t){var r;return Object.assign(Object.assign({},e),{presets:null===(r=e.presets)||void 0===r?void 0:r.map((e=>{var r;return Object.assign(Object.assign({},e),{entities:(null===(r=e.entities)||void 0===r?void 0:r.map((e=>t.get(e)||e)))||[]})}))})}_mapHorizontalModule(e,t){var r;return Object.assign(Object.assign({},e),{modules:null===(r=e.modules)||void 0===r?void 0:r.map((e=>this._mapModule(e,t)))})}_mapVerticalModule(e,t){var r;return Object.assign(Object.assign({},e),{modules:null===(r=e.modules)||void 0===r?void 0:r.map((e=>this._mapModule(e,t)))})}_mapMapModule(e,t){var r;return Object.assign(Object.assign({},e),{markers:null===(r=e.markers)||void 0===r?void 0:r.map((e=>Object.assign(Object.assign({},e),{entity:e.entity&&t.get(e.entity)||e.entity})))})}_mapSliderModule(e,t){var r;return Object.assign(Object.assign({},e),{modules:null===(r=e.modules)||void 0===r?void 0:r.map((e=>this._mapModule(e,t)))})}_getDomain(e){const t=e.split(".");return t.length>1?t[0]:""}_getEntityName(e){const t=e.split(".");return t.length>1?t.slice(1).join("."):e}}},8269:(e,t,r)=>{r.r(t),r.d(t,{HubPresetsTab:()=>k});var i=r(5183),a=r(4276),o=r(9247);class s{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}class n extends s{constructor(e){if(super(e),this.it=o.s6,2!==e.type)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===o.s6||null==e)return this._t=void 0,this.it=e;if(e===o.c0)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}n.directiveName="unsafeHTML",n.resultType=1;const d=(c=n,(...e)=>({_$litDirective$:c,values:e}));var c;class l{constructor(){this.cache=new Map,this.localStorageDisabled=!1,this.corsProxies=["https://api.allorigins.win/raw?url=","https://corsproxy.io/?","https://cors-anywhere.herokuapp.com/"]}async fetchPresets(e={}){const t=`presets_${JSON.stringify(e)}`,r=this.cache.get(t);if(r&&Date.now()-r.timestamp<l.CACHE_DURATION)return r.data;const i=this._getFromLocalStorage(t);if(i)return this.cache.set(t,i),i.data;try{const r=new URLSearchParams;e.page&&r.set("page",e.page.toString()),e.per_page&&r.set("per_page",e.per_page.toString()),e.category&&r.set("category",e.category),e.search&&r.set("search",e.search),e.sort&&r.set("sort",e.sort),r.set("_embed","true");const i=`${l.API_BASE}/presets_dir_ltg?${r.toString()}`,a=await this._fetchWithCorsResilience(i),o={presets:Array.isArray(a)?a.map((e=>{var t,r,i,a,o,s,n,d,c,l,p,g,u,h,m,_,v,y,b,f,w;const x=e.preset_meta||{},k=x.tags?x.tags.split(",").map((e=>e.trim())):[],S=x.integrations?String(x.integrations).split(",").map((e=>e.trim())).filter(Boolean):[],$=this._stripHtml(x.description||(null===(t=e.excerpt)||void 0===t?void 0:t.rendered)||(null===(r=e.content)||void 0===r?void 0:r.rendered)||"No description available"),C=this._ensureHtml((null===(i=e.content)||void 0===i?void 0:i.rendered)||(null===(a=e.excerpt)||void 0===a?void 0:a.rendered)||x.description_html||$),E=(null===(n=null===(s=null===(o=e._embedded)||void 0===o?void 0:o["wp:featuredmedia"])||void 0===s?void 0:s[0])||void 0===n?void 0:n.source_url)||x.featured_image||e.featured_media_src_url||"";return{id:e.id,name:this._decodeHtmlEntities((null===(d=e.title)||void 0===d?void 0:d.rendered)||"Untitled Preset"),description:this._truncateDescription($,15),description_full:C,shortcode:x.shortcode||'{"rows":[]}',category:x.category||"badges",tags:k,integrations:S,author:(null===(p=null===(l=null===(c=e._embedded)||void 0===c?void 0:c.author)||void 0===l?void 0:l[0])||void 0===p?void 0:p.display_name)||(null===(h=null===(u=null===(g=e._embedded)||void 0===g?void 0:g.author)||void 0===u?void 0:u[0])||void 0===h?void 0:h.name)||(null===(v=null===(_=null===(m=e._embedded)||void 0===m?void 0:m.author)||void 0===_?void 0:_[0])||void 0===v?void 0:v.slug)||"Community",author_avatar:(null===(w=null===(f=null===(b=null===(y=e._embedded)||void 0===y?void 0:y.author)||void 0===b?void 0:b[0])||void 0===f?void 0:f.avatar_urls)||void 0===w?void 0:w[48])||"",downloads:parseInt(x.downloads)||0,rating:parseFloat(x.rating)||0,reviews_count:parseInt(x.rating_count)||0,rating_count:parseInt(x.rating_count)||0,created:e.date,updated:e.modified,is_featured:!1,difficulty:x.difficulty||"beginner",compatibility:x.compatibility?x.compatibility.split(","):[],featured_image:E,gallery:Array.isArray(x.gallery)&&x.gallery.length>0?x.gallery:[],preset_url:e.link||`https://ultracard.io/presets/${e.slug}/`}})):[],total:a.length||0,pages:1,current_page:1};if(!Array.isArray(a))throw new Error("Invalid response format: expected array of posts");const s={data:o,timestamp:Date.now()};return this.cache.set(t,s),this._saveToLocalStorage(t,s),o}catch(e){console.error("Failed to fetch Directories Pro presets:",e);const r=this._getFromLocalStorage(t,!0);if(r)return console.warn("Using stale cached presets due to fetch error"),r.data;const i=this._getFallbackCache();return i?(console.warn("Using fallback cached presets due to fetch error"),i):{presets:[],total:0,pages:0,current_page:1}}}async fetchPreset(e){var t,r,i,a,o,s,n,d,c,p,g,u,h,m,_,v,y,b;const f=`preset_${e}`,w=this.cache.get(f);if(w&&Date.now()-w.timestamp<l.CACHE_DURATION)return w.data;try{const w=`${l.API_BASE}/presets_dir_ltg/${e}?_embed=true`,x=await this._fetchWithCorsResilience(w),k=x.preset_meta||{},S=k.tags?k.tags.split(",").map((e=>e.trim())):[],$=k.integrations?String(k.integrations).split(",").map((e=>e.trim())).filter(Boolean):[],C=this._stripHtml((null===(t=x.excerpt)||void 0===t?void 0:t.rendered)||(null===(r=x.content)||void 0===r?void 0:r.rendered)||"No description available"),E=this._ensureHtml((null===(i=x.content)||void 0===i?void 0:i.rendered)||(null===(a=x.excerpt)||void 0===a?void 0:a.rendered)||k.description_html||C),P={id:x.id,name:this._decodeHtmlEntities((null===(o=x.title)||void 0===o?void 0:o.rendered)||"Untitled Preset"),description:this._truncateDescription(C,15),description_full:E,shortcode:k.shortcode||'{"rows":[]}',category:k.category||"badges",tags:S,integrations:$,author:(null===(d=null===(n=null===(s=x._embedded)||void 0===s?void 0:s.author)||void 0===n?void 0:n[0])||void 0===d?void 0:d.display_name)||(null===(g=null===(p=null===(c=x._embedded)||void 0===c?void 0:c.author)||void 0===p?void 0:p[0])||void 0===g?void 0:g.name)||(null===(m=null===(h=null===(u=x._embedded)||void 0===u?void 0:u.author)||void 0===h?void 0:h[0])||void 0===m?void 0:m.slug)||"Community",author_avatar:(null===(b=null===(y=null===(v=null===(_=x._embedded)||void 0===_?void 0:_.author)||void 0===v?void 0:v[0])||void 0===y?void 0:y.avatar_urls)||void 0===b?void 0:b[48])||"",downloads:parseInt(k.downloads)||0,rating:parseFloat(k.rating)||0,reviews_count:parseInt(k.rating_count)||0,rating_count:parseInt(k.rating_count)||0,created:x.date,updated:x.modified,is_featured:!1,difficulty:k.difficulty||"beginner",compatibility:k.compatibility?k.compatibility.split(","):[],featured_image:k.featured_image||x.featured_media_src_url||"",gallery:Array.isArray(k.gallery)?k.gallery:[],preset_url:x.link||`https://ultracard.io/presets/${x.slug}/`},A={data:P,timestamp:Date.now()};return this.cache.set(f,A),P}catch(t){return console.error(`Failed to fetch preset ${e}:`,t),null}}async trackDownload(e){try{const t=`${l.API_BASE.replace("/wp/v2","/ultra-card/v1")}/presets/${e}/track-download`;await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"}})}catch(t){console.warn(`Failed to track download for preset ${e}:`,t)}}async getCategories(){const e="categories",t=this.cache.get(e);if(t&&Date.now()-t.timestamp<l.CACHE_DURATION)return t.data;try{const t=await fetch(`${l.API_BASE}/categories`,{signal:AbortSignal.timeout(5e3)});if(t.ok){const r=await t.json(),i={data:r,timestamp:Date.now()};return this.cache.set(e,i),r}}catch(e){console.warn("Failed to fetch categories:",e)}return["badges","layouts","widgets","dashboards","themes"]}clearCache(){this.cache.clear(),Object.keys(localStorage).forEach((e=>{e.startsWith("wp-presets-cache-")&&localStorage.removeItem(e)}))}async testConnection(){const e=`${l.API_BASE}/presets_dir_ltg?per_page=1`,t=[];try{await fetch(e,{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(5e3)}),t.push({method:"Direct Fetch",success:!0})}catch(e){t.push({method:"Direct Fetch",success:!1,error:e instanceof Error?e.message:"Unknown error"})}for(const r of this.corsProxies)try{const i=`${r}${encodeURIComponent(e)}`;await fetch(i,{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(8e3)}),t.push({method:`Proxy: ${r}`,success:!0})}catch(e){t.push({method:`Proxy: ${r}`,success:!1,error:e instanceof Error?e.message:"Unknown error"})}return t}getCacheStats(){return{memoryEntries:this.cache.size,localStorageEntries:Object.keys(localStorage).filter((e=>e.startsWith("wp-presets-cache-"))).length}}_saveToLocalStorage(e,t){if(!this.localStorageDisabled)try{this._cleanupExpiredCache();const r=JSON.stringify(t);if(new Blob([r]).size>l.MAX_ENTRY_SIZE)return;const i=`wp-presets-cache-${e}`;localStorage.setItem(i,r)}catch(r){if(r instanceof DOMException&&"QuotaExceededError"===r.name){this._clearAllPresetCache();try{const r=JSON.stringify(t);if(new Blob([r]).size<=l.MAX_ENTRY_SIZE){const t=`wp-presets-cache-${e}`;localStorage.setItem(t,r)}}catch(e){this.localStorageDisabled=!0,this._clearAllPresetCache()}}}}_getFromLocalStorage(e,t=!1){if(this.localStorageDisabled)return null;try{const r=`wp-presets-cache-${e}`,i=localStorage.getItem(r);if(!i)return null;const a=JSON.parse(i);return Date.now()-a.timestamp>(t?l.EXTENDED_CACHE_DURATION:l.CACHE_DURATION)?(t||localStorage.removeItem(r),t?a:null):a}catch(e){return console.warn("Failed to read from localStorage:",e),null}}_stripHtml(e){if(!e)return"";const t=document.createElement("div");return t.innerHTML=e,(t.textContent||t.innerText||"").trim().replace(/\s+/g," ")}_ensureHtml(e){if(!e)return"";if(/<(p|br|ul|ol|li|h[1-6]|blockquote)\b/i.test(e))return e;let t=e.replace(/`([^`\n]+)`/g,"<code>$1</code>");return t.includes("\n")?"<p>"+t.replace(/\n\n+/g,"</p><p>").replace(/\n/g,"<br>")+"</p>":(t=t.replace(/\s+-\s+/g,"<br>– "),`<p>${t}</p>`)}_decodeHtmlEntities(e){if(!e)return"";const t=document.createElement("div");return t.innerHTML=e,t.textContent||t.innerText||e}_truncateDescription(e,t=15){if(!e)return"";const r=e.split(" ");return r.length<=t?e:r.slice(0,t).join(" ")+"..."}async _fetchWithCorsResilience(e){try{const t=await fetch(e,{method:"GET",headers:{Accept:"application/json","Content-Type":"application/json"},signal:AbortSignal.timeout(8e3)});if(!t.ok)throw new Error(`HTTP ${t.status}: ${t.statusText}`);return await t.json()}catch(t){for(const t of this.corsProxies)try{const r=`${t}${encodeURIComponent(e)}`,i=await fetch(r,{method:"GET",headers:{Accept:"application/json"},signal:AbortSignal.timeout(1e4)});if(!i.ok)throw new Error(`Proxy HTTP ${i.status}: ${i.statusText}`);const a=await i.json();return console.log(`Successfully fetched via proxy: ${t}`),a}catch(e){continue}try{return await this._fetchViaJsonp(e)}catch(e){console.warn("JSONP fetch failed:",e)}throw new Error("All CORS-resilient fetch methods failed")}}async _fetchViaJsonp(e){return new Promise(((t,r)=>{const i=`ultracard_jsonp_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,a=document.createElement("script"),o=setTimeout((()=>{s(),r(new Error("JSONP timeout"))}),15e3),s=()=>{a.parentNode&&a.parentNode.removeChild(a),delete window[i],clearTimeout(o)};window[i]=e=>{s(),t(e)},a.onerror=()=>{s(),r(new Error("JSONP script error"))};const n=e.includes("?")?"&":"?";a.src=`${e}${n}callback=${i}`,document.head.appendChild(a)}))}_cleanupExpiredCache(){if(!this.localStorageDisabled)try{const e=Object.keys(localStorage).filter((e=>e.startsWith("wp-presets-cache-"))),t=Date.now();let r=0;e.forEach((e=>{try{const i=localStorage.getItem(e);if(!i)return;const a=JSON.parse(i);t-a.timestamp>l.CACHE_DURATION&&(localStorage.removeItem(e),r++)}catch(t){localStorage.removeItem(e),r++}}));const i=Object.keys(localStorage).filter((e=>e.startsWith("wp-presets-cache-")));if(i.length>l.MAX_CACHE_ENTRIES){const e=i.map((e=>{try{const t=localStorage.getItem(e);return t?{key:e,timestamp:JSON.parse(t).timestamp}:null}catch(t){return{key:e,timestamp:0}}})).filter(Boolean).sort(((e,t)=>((null==e?void 0:e.timestamp)||0)-((null==t?void 0:t.timestamp)||0)));e.slice(0,e.length-l.MAX_CACHE_ENTRIES).forEach((e=>{(null==e?void 0:e.key)&&(localStorage.removeItem(e.key),r++)}))}}catch(e){console.warn("Failed to cleanup expired cache:",e)}}_cleanupCacheAggressively(){try{const e=Object.keys(localStorage).filter((e=>e.startsWith("wp-presets-cache-")));if(e.length<=l.MAX_CACHE_ENTRIES)return;const t=e.map((e=>{try{const t=localStorage.getItem(e);return t?{key:e,timestamp:JSON.parse(t).timestamp}:null}catch(t){return{key:e,timestamp:0}}})).filter(Boolean).sort(((e,t)=>((null==e?void 0:e.timestamp)||0)-((null==t?void 0:t.timestamp)||0)));t.slice(0,t.length-l.MAX_CACHE_ENTRIES).forEach((e=>{(null==e?void 0:e.key)&&localStorage.removeItem(e.key)}))}catch(e){}}_clearAllPresetCache(){try{Object.keys(localStorage).filter((e=>e.startsWith("wp-presets-cache-"))).forEach((e=>{try{localStorage.removeItem(e)}catch(e){}}))}catch(e){}}_getFallbackCache(){if(this.localStorageDisabled)return null;try{const e=Object.keys(localStorage).filter((e=>e.startsWith("wp-presets-cache-presets_"))).map((e=>{try{const t=localStorage.getItem(e);if(!t)return null;const r=JSON.parse(t);return{key:e,timestamp:r.timestamp,data:r.data}}catch(e){return null}})).filter(Boolean).sort(((e,t)=>((null==t?void 0:t.timestamp)||0)-((null==e?void 0:e.timestamp)||0)));if(e.length>0&&e[0])return e[0].data}catch(e){console.warn("Failed to get fallback cache:",e)}return null}}l.API_BASE="https://ultracard.io/wp-json/wp/v2",l.CACHE_KEY="ultra-card-directories-pro-presets-v2",l.CACHE_TIMESTAMP_KEY="ultra-card-directories-pro-presets-v2-timestamp",l.CACHE_DURATION=3e5,l.EXTENDED_CACHE_DURATION=864e5,l.MAX_CACHE_ENTRIES=10,l.MAX_ENTRY_SIZE=512e3;const p=new l;class g{constructor(){this._userPresets=[],this._wordpressPresets=[],this._wordpressLoading=!1,this._wordpressError=null,this._listeners=new Set,this._statusListeners=new Set,this._wordpressLoadTriggered=!1,this._loadFromStorage(),this._setupStorageListener()}ensureWordPressLoaded(){this._wordpressLoadTriggered||(this._wordpressLoadTriggered=!0,this._loadWordPressPresets())}getAllPresets(){return[...this._getBuiltInPresets(),...this._userPresets,...this._wordpressPresets]}getPresetsByCategory(e){const t=this.getAllPresets();return"all"===e?t:t.filter((t=>t.category===e))}getPreset(e){return this.getAllPresets().find((t=>t.id===e))}addUserPreset(e){const t=Object.assign(Object.assign({},e),{id:this._generateId(),metadata:{created:(new Date).toISOString(),updated:(new Date).toISOString()}});return this._userPresets.push(t),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),t}removeUserPreset(e){const t=this._userPresets.findIndex((t=>t.id===e));return-1!==t&&(this._userPresets.splice(t,1),this._saveToStorage(),this._notifyListeners(),this._broadcastChange(),!0)}exportPreset(e){return e.metadata.entityMappings&&e.metadata.entityMappings.length>0?this._reversePresetMappings(e):e}_reversePresetMappings(e){const{entityMapper:t}=r(3038),i=t.reverseMappings(e.metadata.entityMappings),a=t.applyMappingToLayout(e.layout,i);return Object.assign(Object.assign({},e),{layout:a,metadata:Object.assign(Object.assign({},e.metadata),{entityMappings:void 0})})}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}subscribeToStatus(e){return this._statusListeners.add(e),()=>this._statusListeners.delete(e)}getWordPressStatus(){return{loading:this._wordpressLoading,error:this._wordpressError}}async refreshWordPressPresets(){p.clearCache(),await this._loadWordPressPresets(!0)}getWordPressPresetsCount(){return this._wordpressPresets.length}async trackPresetDownload(e){if(e.startsWith("wp-")){const t=parseInt(e.replace("wp-",""));isNaN(t)||await p.trackDownload(t)}}_getBuiltInPresets(){return[]}_generateId(){return`preset-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}_loadFromStorage(){try{const e=localStorage.getItem(g.STORAGE_KEY);if(e){const t=JSON.parse(e);Array.isArray(t)&&(this._userPresets=t.filter(this._isValidPreset.bind(this)))}}catch(e){console.warn("Failed to load user presets from storage:",e),this._userPresets=[]}}_saveToStorage(){try{localStorage.setItem(g.STORAGE_KEY,JSON.stringify(this._userPresets))}catch(e){console.warn("Failed to save user presets to storage:",e)}}_setupStorageListener(){window.addEventListener("storage",(e=>{e.key===g.STORAGE_KEY&&(this._loadFromStorage(),this._notifyListeners())})),window.addEventListener(g.SYNC_EVENT,(()=>{this._loadFromStorage(),this._notifyListeners()}))}_notifyListeners(){const e=this.getAllPresets();this._listeners.forEach((t=>t(e)))}_notifyStatusListeners(){const e=this.getWordPressStatus();this._statusListeners.forEach((t=>t(e)))}async _loadWordPressPresets(e=!1){if(!this._wordpressLoading||e){this._wordpressLoading=!0,this._wordpressError=null,this._notifyStatusListeners();try{const e=await p.fetchPresets({per_page:50,sort:"popular"});this._wordpressPresets=e.presets.map(this._convertWordPressPreset.bind(this)),this._wordpressError=null,this._notifyListeners()}catch(e){console.error("Failed to load WordPress presets from Directories Pro:",e);let t="Unable to load presets from ultracard.io";e instanceof Error&&(t=e.message.includes("CORS")?"Network access blocked. Using cached presets if available.":e.message.includes("timeout")?"Connection timeout. Please check your internet connection.":e.message.includes("Failed to fetch")?"Network error. Using cached presets if available.":`Connection error: ${e.message}`),this._wordpressError=t,this._wordpressPresets.length>0&&(console.warn("Using previously loaded presets due to network error"),this._wordpressError=`${t} (Using cached presets)`)}finally{this._wordpressLoading=!1,this._notifyStatusListeners()}}}_decodeBase64Utf8(e){const t=atob(e),r=new Uint8Array(t.length);for(let e=0;e<t.length;e++)r[e]=t.charCodeAt(e);return new TextDecoder("utf-8").decode(r)}_convertWordPressPreset(e){var t,r,i,a;try{let o,s,n;try{if(o=JSON.parse(e.shortcode),!o.rows||!Array.isArray(o.rows)||0===o.rows.length)throw new Error("Layout has no rows");if(!o.rows.some((e=>e.columns&&e.columns.some((e=>e.modules&&e.modules.length>0)))))throw console.warn(`Preset ${e.id} has no modules, skipping...`),new Error("Layout has no modules")}catch(d){try{const a=e.shortcode.match(/\[ultra[_-]card\]([\s\S]*?)\[\/ultra[_-]card\]/);if(!a)throw new Error("No shortcode format found");{const e=a[1].trim(),d=this._decodeBase64Utf8(e),c=JSON.parse(d);if(n=Array.isArray(c.customVariables)?c.customVariables:Array.isArray(null===(t=c.data)||void 0===t?void 0:t._customVariables)?c.data._customVariables:void 0,"ultra-card-row"===c.type&&c.data)o={rows:[c.data]};else if("ultra-card-full"===c.type&&(null===(i=null===(r=c.data)||void 0===r?void 0:r.layout)||void 0===i?void 0:i.rows))o=c.data.layout,s=this._extractCardSettings(c.data);else if(c.data&&c.data.layout&&c.data.layout.rows)o=c.data.layout,s=this._extractCardSettings(c.data);else if(c.data&&c.data.rows)o=c.data;else if(c.layout&&c.layout.rows)o=c.layout;else{if(!c.rows)throw new Error("No valid layout found in shortcode");o=c}}}catch(t){throw console.error(`Failed to parse shortcode for preset ${e.id}:`,t),console.error("Raw shortcode:",(null===(a=e.shortcode)||void 0===a?void 0:a.substring(0,200))+"..."),new Error(`Failed to parse preset shortcode: ${t instanceof Error?t.message:"Unknown error"}`)}}const d=this._mapWordPressCategory(e.category),c=e.author&&(e.author.toLowerCase().includes("wayne@wjddesigns.com")||e.author.toLowerCase().includes("wjddesigns")),l=e.tags||[],p=c?["standard"]:["community"],g=Object.assign(Object.assign(Object.assign({id:`wp-${e.id}`,name:e.name,description:e.description||"No description provided",category:d,icon:this._getPresetIcon(e.category,e.tags),author:e.author||"Community",version:"1.0.0",tags:[...l,...p],integrations:e.integrations||[],thumbnail:e.featured_image,gallery:e.gallery||[],layout:o},s&&{cardSettings:s}),n&&n.length>0?{customVariables:n}:{}),{metadata:{created:e.created,updated:e.updated||e.created,downloads:e.downloads,rating:e.rating,rating_count:e.rating_count||e.reviews_count||0,featured_image:e.featured_image,gallery:e.gallery||[],date:e.created}});return g.preset_url=e.preset_url,g.description_full=e.description_full,g.rating_count=e.rating_count||e.reviews_count||0,g}catch(t){return console.error(`Error converting WordPress preset ${e.id}:`,t),{id:`wp-error-${e.id}`,name:e.name||"Error Preset",description:"This preset could not be loaded properly",category:"custom",icon:"mdi:alert-circle",author:e.author||"Community",version:"1.0.0",tags:["error","community"],layout:{rows:[{id:`error-row-${e.id}`,columns:[{id:`error-col-${e.id}`,modules:[{id:`error-text-${e.id}`,type:"text",text:"Preset Loading Error",font_size:14,alignment:"center",color:"var(--error-color)"}]}],column_layout:"1-col"}]},metadata:{created:e.created||(new Date).toISOString(),updated:e.updated||(new Date).toISOString()}}}}_mapWordPressCategory(e){return{badges:"badges",layouts:"layouts",widgets:"widgets",custom:"badges",badge:"badges",layout:"layouts",widget:"widgets",dashboard:"layouts",dashboards:"layouts",theme:"custom",themes:"custom"}[e.toLowerCase().trim()]||"badges"}_getPresetIcon(e,t){return t.includes("person")||t.includes("user")?"mdi:account-circle":t.includes("weather")?"mdi:weather-partly-cloudy":t.includes("energy")?"mdi:lightning-bolt":t.includes("climate")?"mdi:thermostat":t.includes("security")?"mdi:shield-home":t.includes("lights")||t.includes("lighting")?"mdi:lightbulb":t.includes("vehicle")||t.includes("car")?"mdi:car":t.includes("location")?"mdi:map-marker":{badge:"mdi:card-account-details",badges:"mdi:card-account-details",layout:"mdi:view-column",layouts:"mdi:view-column",widget:"mdi:widgets",widgets:"mdi:widgets",dashboard:"mdi:view-dashboard",dashboards:"mdi:view-dashboard"}[e.toLowerCase().trim()]||"mdi:card"}_extractCardSettings(e){if(!e)return;const t={};let r=!1;return void 0!==e.card_background&&(t.card_background=e.card_background,r=!0),void 0!==e.card_border_radius&&(t.card_border_radius=e.card_border_radius,r=!0),void 0!==e.card_border_color&&(t.card_border_color=e.card_border_color,r=!0),void 0!==e.card_border_width&&(t.card_border_width=e.card_border_width,r=!0),void 0!==e.card_padding&&(t.card_padding=e.card_padding,r=!0),void 0!==e.card_margin&&(t.card_margin=e.card_margin,r=!0),void 0!==e.card_overflow&&(t.card_overflow=e.card_overflow,r=!0),void 0!==e.card_shadow_enabled&&(t.card_shadow_enabled=e.card_shadow_enabled,r=!0),void 0!==e.card_shadow_color&&(t.card_shadow_color=e.card_shadow_color,r=!0),void 0!==e.card_shadow_horizontal&&(t.card_shadow_horizontal=e.card_shadow_horizontal,r=!0),void 0!==e.card_shadow_vertical&&(t.card_shadow_vertical=e.card_shadow_vertical,r=!0),void 0!==e.card_shadow_blur&&(t.card_shadow_blur=e.card_shadow_blur,r=!0),void 0!==e.card_shadow_spread&&(t.card_shadow_spread=e.card_shadow_spread,r=!0),void 0!==e.card_background_image_type&&(t.card_background_image_type=e.card_background_image_type,r=!0),void 0!==e.card_background_image&&(t.card_background_image=e.card_background_image,r=!0),void 0!==e.card_background_size&&(t.card_background_size=e.card_background_size,r=!0),void 0!==e.card_background_repeat&&(t.card_background_repeat=e.card_background_repeat,r=!0),void 0!==e.card_background_position&&(t.card_background_position=e.card_background_position,r=!0),r?t:void 0}_broadcastChange(){window.dispatchEvent(new CustomEvent(g.SYNC_EVENT))}_isValidPreset(e){return e&&"string"==typeof e.id&&"string"==typeof e.name&&"string"==typeof e.description&&"string"==typeof e.category&&"string"==typeof e.icon&&e.layout&&Array.isArray(e.layout.rows)}}g.STORAGE_KEY="ultra-card-presets",g.SYNC_EVENT="ultra-card-presets-changed";const u=new g;var h=r(378),m=r(7568),_=r(9978),v=r(9418);const y=["script","iframe","object","embed","form","input","button","textarea","select","option"];class b extends i.WF{_close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}render(){return i.qy`
      <ha-dialog open @closed=${this._close} .heading=${"Sign in to Ultra Card"}>
        <div class="login-dialog-content">
          <div class="login-section">
            <p class="login-section-title">Connect with Ultra Card Connect</p>
            <p class="login-section-desc">
              The fastest way to connect — installs in 30 seconds. Syncs across all your devices.
            </p>
            <a
              class="login-cta-btn"
              href="/config/integrations/integration/ultra_card_pro_cloud"
              target="_top"
            >
              <ha-icon icon="mdi:cog"></ha-icon>
              Configure Ultra Card Connect
            </a>
          </div>

          <div class="login-divider"></div>

          <p class="login-note">
            Already have the integration? Open the <strong>Account</strong> tab in the Ultra Card hub to sign in or create an account.
          </p>
        </div>
      </ha-dialog>
    `}}b.styles=i.AH`
    .login-dialog-content {
      padding: 8px 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .login-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .login-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
      margin: 0 0 4px 0;
    }

    .login-section-desc {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .login-cta-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      background: var(--primary-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.15s ease;
    }

    .login-cta-btn:hover {
      opacity: 0.9;
    }

    .login-cta-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    .login-divider {
      height: 1px;
      background: var(--divider-color, rgba(0, 0, 0, 0.08));
      margin: 4px 0;
    }

    .login-note {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
      margin: 0;
    }

    .login-note a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .login-note a:hover {
      text-decoration: underline;
    }
  `,customElements.get("uc-hub-login-dialog")||customElements.define("uc-hub-login-dialog",b);var f=function(e,t,r,i){var a,o=arguments.length,s=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var n=e.length-1;n>=0;n--)(a=e[n])&&(s=(o<3?a(s):o>3?a(t,r,s):a(t,r))||s);return o>3&&s&&Object.defineProperty(t,r,s),s};class w extends i.WF{constructor(){super(...arguments),this.presetId="",this.presetName="",this.existingRating=0,this._selectedRating=0,this._hoveredRating=0,this._submitting=!1,this._error=""}willUpdate(e){(e.has("existingRating")||e.has("presetId"))&&0===this._selectedRating&&this.existingRating>0&&(this._selectedRating=this.existingRating)}_close(){this._selectedRating=0,this._hoveredRating=0,this._error="",this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_displayRating(){return this._hoveredRating>0?this._hoveredRating:this._selectedRating}_ratingLabel(e){var t;return null!==(t=["","Poor","Fair","Good","Great","Excellent"][e])&&void 0!==t?t:""}async _handleSubmit(){if(!(this._selectedRating<1||this._submitting)&&this.presetId){this._submitting=!0,this._error="";try{await m.Q.submitReview(this.presetId,this._selectedRating),this.dispatchEvent(new CustomEvent("rating-submitted",{detail:{presetId:this.presetId,rating:this._selectedRating},bubbles:!0,composed:!0})),this._close()}catch(e){this._error=e instanceof Error?e.message:"Failed to submit rating"}finally{this._submitting=!1}}}render(){const e=this._displayRating();return i.qy`
      <div class="overlay" @click=${e=>{e.target===e.currentTarget&&this._close()}}>
        <div class="dialog-surface">

          <div class="dialog-header">
            <h2 class="dialog-title">Rate this preset</h2>
            <button class="dialog-close" @click=${this._close} ?disabled=${this._submitting}>
              <ha-icon icon="mdi:close" style="--mdc-icon-size:20px;"></ha-icon>
            </button>
          </div>

          ${this.presetName?i.qy`<p class="rate-dialog-subtitle">${this.presetName}</p>`:""}

          <div class="rate-stars-row" @mouseleave=${()=>this._hoveredRating=0}>
            ${[1,2,3,4,5].map((t=>i.qy`
              <ha-icon
                icon=${t<=e?"mdi:star":"mdi:star-outline"}
                class=${t<=e?"":"empty"}
                @mouseenter=${()=>this._hoveredRating=t}
                @click=${()=>this._selectedRating=t}
              ></ha-icon>
            `))}
          </div>

          <p class="rate-hint">${this._ratingLabel(e)}</p>

          ${this._error?i.qy`<p class="rate-error">${this._error}</p>`:""}

          <div class="rate-actions">
            <button
              class="rate-btn rate-btn-submit"
              ?disabled=${this._selectedRating<1||this._submitting}
              @click=${this._handleSubmit}
            >
              ${this._submitting?i.qy`<ha-icon icon="mdi:loading" class="rate-spin"></ha-icon> Submitting…`:this.existingRating>0?"Update rating":"Submit rating"}
            </button>
            <button class="rate-btn rate-btn-cancel" @click=${this._close} ?disabled=${this._submitting}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    `}}w.styles=i.AH`
    /* Full-screen backdrop — position: fixed so it escapes any parent stacking context */
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.55);
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .dialog-surface {
      background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
      border-radius: 16px;
      padding: 24px 28px;
      min-width: 300px;
      max-width: min(480px, 90vw);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.18s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(12px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .dialog-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0;
    }

    .dialog-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: background 0.15s;
    }

    .dialog-close:hover {
      background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.08);
    }

    .rate-dialog-subtitle {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0 0 20px;
    }

    .rate-stars-row {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
      margin-bottom: 8px;
    }

    .rate-stars-row ha-icon {
      --mdc-icon-size: 36px;
      color: #ffb300;
      transition: transform 0.1s ease;
    }

    .rate-stars-row ha-icon.empty {
      color: var(--secondary-text-color);
      opacity: 0.35;
    }

    .rate-stars-row ha-icon:hover {
      transform: scale(1.15);
    }

    .rate-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 20px;
      min-height: 18px;
    }

    .rate-actions {
      display: flex;
      gap: 10px;
    }

    .rate-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s ease, background 0.15s ease;
    }

    .rate-btn-submit {
      background: var(--primary-color);
      color: white;
    }

    .rate-btn-submit:hover:not(:disabled) {
      opacity: 0.88;
    }

    .rate-btn-submit:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .rate-btn-cancel {
      background: transparent;
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    }

    .rate-btn-cancel:hover:not(:disabled) {
      background: rgba(var(--rgb-primary-text-color, 255,255,255), 0.06);
    }

    .rate-error {
      font-size: 12px;
      color: var(--error-color, #db4437);
      margin: 4px 0 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .rate-spin {
      animation: spin 0.8s linear infinite;
    }
  `,f([(0,a.MZ)()],w.prototype,"presetId",void 0),f([(0,a.MZ)()],w.prototype,"presetName",void 0),f([(0,a.MZ)({type:Number})],w.prototype,"existingRating",void 0),f([(0,a.wk)()],w.prototype,"_selectedRating",void 0),f([(0,a.wk)()],w.prototype,"_hoveredRating",void 0),f([(0,a.wk)()],w.prototype,"_submitting",void 0),f([(0,a.wk)()],w.prototype,"_error",void 0),customElements.get("uc-hub-rate-dialog")||customElements.define("uc-hub-rate-dialog",w);var x=function(e,t,r,i){var a,o=arguments.length,s=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var n=e.length-1;n>=0;n--)(a=e[n])&&(s=(o<3?a(s):o>3?a(t,r,s):a(t,r))||s);return o>3&&s&&Object.defineProperty(t,r,s),s};let k=class extends i.WF{constructor(){super(...arguments),this._presets=[],this._category="all",this._loading=!1,this._error=null,this._search="",this._toastMsg="",this._expandedId=null,this._cloudUser=null,this._showLoginDialog=!1,this._ratingPreset=null,this._pendingRateAfterLogin=null,this._userReviews=new Map,this._readMoreId=null}_getSanitizedPresetDescription(e){return t=this._readMoreId===e.id&&e.description_full||e.description||"",v.A.sanitize(t,{USE_PROFILES:{html:!0},FORBID_TAGS:[...y,"style"]});var t}connectedCallback(){super.connectedCallback(),this._cloudUser=h.x.getCurrentUser(),this._authListener=e=>{this._cloudUser=e,e&&m.Q.loadUserReviewsFromServer().then((()=>this.requestUpdate()))},h.x.addListener(this._authListener),this._cloudUser&&m.Q.loadUserReviewsFromServer().then((()=>this.requestUpdate())),this._presets=u.getAllPresets(),this._unsub=u.subscribe((e=>{this._presets=e}));const e=u.getWordPressStatus();this._loading=e.loading,this._error=e.error,this._statusUnsub=u.subscribeToStatus((e=>{this._loading=e.loading,this._error=e.error}))}disconnectedCallback(){var e,t;super.disconnectedCallback(),null===(e=this._unsub)||void 0===e||e.call(this),null===(t=this._statusUnsub)||void 0===t||t.call(this),this._authListener&&(h.x.removeListener(this._authListener),this._authListener=void 0),this._toastTimer&&clearTimeout(this._toastTimer)}_showToast(e){this._toastMsg=e,this._toastTimer&&clearTimeout(this._toastTimer),this._toastTimer=setTimeout((()=>this._toastMsg=""),2500)}_getFilteredPresets(){let e=this._presets;if("all"!==this._category&&(e=e.filter((e=>e.category===this._category))),this._search.trim()){const t=this._search.toLowerCase().trim();e=e.filter((e=>e.name.toLowerCase().includes(t)||(e.description||"").toLowerCase().includes(t)||(e.author||"").toLowerCase().includes(t)))}return e}_refreshPresets(){u.refreshWordPressPresets()}_getOriginLabel(e){return"wordpress"===e.source||"community"===e.origin?"community":"default"===e.origin||"default"===e.source?"default":"builtin"===e.origin||"builtin"===e.source?"builtin":"community"}_isNewPreset(e){var t,r;const i=(null===(t=e.metadata)||void 0===t?void 0:t.created)||(null===(r=e.metadata)||void 0===r?void 0:r.date);return!!i&&new Date(i)>new Date(Date.now()-2592e6)}_buildPresetConfig(e){const t={};return e.layout&&(t.layout=e.layout),e.cardSettings&&Object.entries(e.cardSettings).forEach((([e,r])=>{null!=r&&(t[e]=r)})),e.customVariables&&e.customVariables.length>0&&(t._customVariables=e.customVariables),t}async _copyPresetConfig(e){try{const t=this._buildPresetConfig(e);if(0===Object.keys(t).length)return void this._showToast("No config data in this preset");const r=JSON.stringify(t,null,2);await navigator.clipboard.writeText(r),this._showToast(`Copied "${e.name}" config`)}catch(t){console.warn("Clipboard write failed, using fallback:",t),this._fallbackCopy(JSON.stringify(this._buildPresetConfig(e),null,2)),this._showToast(`Copied "${e.name}" config`)}u.trackPresetDownload(e.id).catch((()=>{}))}async _copyPresetLayout(e){try{if(!e.layout)return void this._showToast("No layout data in this preset");const t=JSON.stringify(e.layout,null,2);await navigator.clipboard.writeText(t),this._showToast(`Copied layout for "${e.name}"`)}catch(t){console.warn("Clipboard write failed, using fallback:",t),e.layout&&(this._fallbackCopy(JSON.stringify(e.layout,null,2)),this._showToast(`Copied layout for "${e.name}"`))}u.trackPresetDownload(e.id).catch((()=>{}))}_fallbackCopy(e){const t=document.createElement("textarea");t.value=e,t.style.position="fixed",t.style.left="-9999px",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)}_toggleDetails(e){this._expandedId=this._expandedId===e?null:e}_renderStars(e){const t=[];for(let r=1;r<=5;r++)t.push(i.qy`<ha-icon
          icon=${r<=Math.round(e)?"mdi:star":"mdi:star-outline"}
          class=${r<=Math.round(e)?"":"empty"}
        ></ha-icon>`);return i.qy`<div class="star-rating">${t}</div>`}_getUserRatingForPreset(e){var t;const r=this._userReviews.get(e);if(null!=r)return r;const i=m.Q.getUserReview(e);return null!==(t=null==i?void 0:i.rating)&&void 0!==t?t:null}_renderInteractiveStars(e,t){var r;const a=this._getUserRatingForPreset(e.id),o=null!==(r=null!=a?a:t.rating)&&void 0!==r?r:0;if(o<=0&&!this._cloudUser)return i.qy`<span class="preset-rating-hint" title="Sign in to rate">Rate it</span>`;const s=[],n=Math.round(o);for(let e=1;e<=5;e++)s.push(i.qy`<ha-icon
          icon=${e<=n?"mdi:star":"mdi:star-outline"}
          class=${e<=n?"":"empty"}
        ></ha-icon>`);return i.qy`<span class="star-rating">${s}</span>`}_handleStarClick(e,t){if(t.stopPropagation(),!this._cloudUser)return this._pendingRateAfterLogin={id:e.id,name:e.name},void(this._showLoginDialog=!0);this._ratingPreset={id:e.id,name:e.name}}_handleRatingSubmitted(e){const{presetId:t,rating:r}=e.detail;this._userReviews=new Map(this._userReviews).set(t,r),this._ratingPreset=null,this._showToast("Thanks for your rating!")}render(){var e,t,r;const a=this._getFilteredPresets();return i.qy`
      ${this._showLoginDialog?i.qy`
            <uc-hub-login-dialog
              @close=${()=>{this._showLoginDialog=!1,this._pendingRateAfterLogin=null}}
            ></uc-hub-login-dialog>
          `:""}
      ${this._ratingPreset?i.qy`
            <uc-hub-rate-dialog
              .presetId=${this._ratingPreset.id}
              .presetName=${this._ratingPreset.name}
              .existingRating=${null!==(r=null!==(e=this._userReviews.get(this._ratingPreset.id))&&void 0!==e?e:null===(t=m.Q.getUserReview(this._ratingPreset.id))||void 0===t?void 0:t.rating)&&void 0!==r?r:0}
              @rating-submitted=${this._handleRatingSubmitted}
              @close=${()=>this._ratingPreset=null}
            ></uc-hub-rate-dialog>
          `:""}
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Presets</strong> are ready-made layouts and widgets you can add to any card. Browse by category, search, or add a preset from the card editor to get started quickly.</p>
      </div>
      <!-- Toolbar -->
      <div class="presets-toolbar">
        <div class="search-box">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="text"
            placeholder="Search presets…"
            .value=${this._search}
            @input=${e=>this._search=e.target.value}
          />
        </div>
        <button class="refresh-btn" ?disabled=${this._loading} @click=${this._refreshPresets}>
          <ha-icon icon="mdi:refresh" class=${this._loading?"spinning":""}></ha-icon>
          Refresh
        </button>
      </div>

      <!-- Filter chips -->
      <div class="filter-row" style="margin-bottom: 16px;">
        ${[{key:"all",label:"All",icon:"mdi:view-grid"},{key:"badges",label:"Badges",icon:"mdi:shield-star"},{key:"layouts",label:"Layouts",icon:"mdi:view-dashboard"},{key:"widgets",label:"Widgets",icon:"mdi:widgets"},{key:"custom",label:"Custom",icon:"mdi:tune-variant"}].map((e=>i.qy`
            <button
              class="filter-chip ${this._category===e.key?"active":""}"
              @click=${()=>this._category=e.key}
            >
              <ha-icon icon=${e.icon}></ha-icon>
              ${e.label}
            </button>
          `))}
      </div>

      <!-- Status bar -->
      <div class="status-bar">
        <span class="count">
          Showing <strong>${a.length}</strong> of ${this._presets.length} presets
        </span>
      </div>

      <!-- States -->
      ${this._loading?i.qy`
            <div class="loading-state">
              <ha-icon icon="mdi:loading" class="spinning"></ha-icon>
              Loading presets…
            </div>
          `:""}
      ${this._error?i.qy`<div class="error-state">${this._error}</div>`:""}

      <!-- Grid -->
      ${this._loading||0!==a.length?i.qy`
            ${a.length>0?i.qy`
                  <div class="presets-hint">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    <span>
                      <strong>Copy Config</strong> copies the full preset (layout + settings + variables) as JSON — paste into your card's raw YAML editor.
                      <strong>Copy Layout</strong> copies only the row/column structure without card styling.
                    </span>
                  </div>
                `:""}
            <div class="presets-grid">
              ${a.map((e=>this._renderPresetCard(e)))}
            </div>
          `:i.qy`
            <div class="empty-state">
              <div class="empty-state-icon">
                <ha-icon icon="mdi:package-variant"></ha-icon>
              </div>
              <h3>No Presets Found</h3>
              <p>
                ${this._search?`No presets match "${this._search}". Try a different search.`:"No presets in this category. Use the card editor to browse and add presets."}
              </p>
            </div>
          `}

      <div class="toast ${this._toastMsg?"show":""}">${this._toastMsg}</div>
    `}_renderPresetCard(e){var t,r,a,o,s,n;const c=this._getOriginLabel(e),l=e.metadata||{},p=!!e.thumbnail||!!e.image||!!e.preview_url,g=e.thumbnail||e.image||e.preview_url,u=this._expandedId===e.id;return i.qy`
      <div class="preset-card">
        <div class="preset-header">
          <div class="preset-header-left">
            <div class="preset-title-info">
              <h4 class="preset-header-title">${e.name}</h4>
              ${e.author?i.qy`<span class="preset-header-author">by ${e.author}</span>`:i.s6}
            </div>
          </div>
          <span class="origin-badge ${c}">${c}</span>
          ${this._isNewPreset(e)?i.qy`<span class="new-badge">New</span>`:i.s6}
        </div>

        ${p?i.qy`
              <div class="preset-preview">
                <img src="${g}" alt="${e.name}" loading="lazy" />
              </div>
            `:i.qy`
              <div class="preset-preview">
                <div class="preset-icon-placeholder">
                  <ha-icon icon="mdi:card-text-outline"></ha-icon>
                </div>
              </div>
            `}

        <div class="preset-content">
          ${e.description?i.qy`
                <div class="preset-description ${this._readMoreId===e.id?"expanded":""}">${d(this._getSanitizedPresetDescription(e))}</div>
                ${e.description_full&&e.description_full!==e.description?i.qy`<button class="read-more-link" @click=${t=>{t.stopPropagation(),this._readMoreId=this._readMoreId===e.id?null:e.id}}>${this._readMoreId===e.id?"Read Less ↑":"Read More ↓"}</button>`:i.s6}
              `:i.s6}

          <div class="preset-stats">
            <span class="stat">
              <ha-icon icon="mdi:download"></ha-icon>
              ${null!==(r=null!==(t=l.downloads)&&void 0!==t?t:e.downloads)&&void 0!==r?r:0}
            </span>
            <div
              class="preset-rating-interactive"
              @click=${t=>this._handleStarClick(e,t)}
              title=${this._cloudUser?"Rate this preset":"Sign in to rate"}
            >
              ${this._renderInteractiveStars(e,l)}
              <span class="rating-count">(${null!==(n=null!==(s=null!==(o=null!==(a=l.rating_count)&&void 0!==a?a:l.reviews_count)&&void 0!==o?o:e.rating_count)&&void 0!==s?s:e.reviews_count)&&void 0!==n?n:0})</span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="preset-actions">
          <button
            class="preset-action-btn primary"
            title="Copy preset code — paste into your card via Import"
            @click=${()=>this._copyPresetConfig(e)}
          >
            <ha-icon icon="mdi:content-copy"></ha-icon>
            Copy Code
          </button>
          <button
            class="preset-action-btn"
            @click=${()=>this._toggleDetails(e.id)}
          >
            <ha-icon icon=${u?"mdi:chevron-up":"mdi:information-outline"}></ha-icon>
            ${u?"Less":"Details"}
          </button>
        </div>

        ${u?this._renderDetails(e):i.s6}
      </div>
    `}_renderDetails(e){var t,r,a,o,s;const n=null!==(a=null===(r=null===(t=e.layout)||void 0===t?void 0:t.rows)||void 0===r?void 0:r.length)&&void 0!==a?a:0,d=null!==(s=null===(o=e.customVariables)||void 0===o?void 0:o.length)&&void 0!==s?s:0,c=!!(e.cardSettings&&Object.keys(e.cardSettings).length>0);return i.qy`
      <div class="preset-details">
        <dl class="detail-info">
          <dt>Category</dt>
          <dd>${e.category}</dd>
          <dt>Version</dt>
          <dd>${e.version||"—"}</dd>
          <dt>Rows</dt>
          <dd>${n}</dd>
          ${d>0?i.qy`<dt>Variables</dt><dd>${d}</dd>`:i.s6}
          ${c?i.qy`<dt>Card settings</dt><dd>Included</dd>`:i.s6}
          ${e.integrations&&e.integrations.length>0?i.qy`<dt>Requires</dt><dd>${e.integrations.join(", ")}</dd>`:i.s6}
        </dl>
        ${e.tags&&e.tags.length>0?i.qy`
              <div class="detail-tags">
                ${e.tags.map((e=>i.qy`<span class="detail-tag">${e}</span>`))}
              </div>
            `:i.s6}
      </div>
    `}};k.styles=[_.z,i.AH`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      /* Toolbar */
      .presets-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        margin-bottom: 20px;
      }

      .search-box {
        flex: 1;
        min-width: 180px;
        position: relative;
      }

      .search-box input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: var(--primary-color);
      }

      .search-box ha-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }

      .refresh-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 500;
      }

      .refresh-btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .refresh-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .refresh-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      /* Preset grid */
      .presets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      @media (max-width: 600px) {
        .presets-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Preset card */
      .preset-card {
        display: flex;
        flex-direction: column;
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      }

      .preset-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: var(--primary-color);
      }

      /* Card header */
      .preset-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        gap: 12px;
      }

      .preset-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .preset-title-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }

      .preset-header-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .preset-header-author {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-style: italic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .origin-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }

      .origin-badge.community {
        background: rgba(255, 152, 0, 0.9);
        color: white;
      }

      .origin-badge.default,
      .origin-badge.standard {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.9);
        color: white;
      }

      .origin-badge.builtin {
        background: rgba(var(--rgb-secondary-text-color, 128, 128, 128), 0.7);
        color: white;
      }

      .new-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
        background: rgba(76, 175, 80, 0.9);
        color: white;
      }

      /* Preview area */
      .preset-preview {
        width: 100%;
        height: 160px;
        background: var(--secondary-background-color, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 8px;
        box-sizing: border-box;
      }

      .preset-preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 6px;
        transition: transform 0.3s ease;
      }

      .preset-card:hover .preset-preview img {
        transform: scale(1.05);
      }

      .preset-icon-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-radius: 50%;
      }

      .preset-icon-placeholder ha-icon {
        --mdc-icon-size: 36px;
        color: var(--primary-color);
        opacity: 0.4;
      }

      /* Content section */
      .preset-content {
        padding: 14px 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .preset-description {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        overflow: hidden;
        max-height: 4.2em; /* ~3 lines */
      }

      .preset-description.expanded {
        max-height: none;
        overflow: visible;
      }

      .read-more-link {
        background: none;
        border: none;
        padding: 2px 0;
        font-size: 12px;
        color: var(--primary-color);
        cursor: pointer;
        font-weight: 500;
        display: block;
        margin-top: 4px;
      }

      /* Scoped styles for WordPress HTML in descriptions */
      .preset-description p,
      .preset-description li {
        margin: 0 0 4px;
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }

      .preset-description a {
        color: var(--primary-color);
        text-decoration: underline;
      }

      .preset-description h1,
      .preset-description h2,
      .preset-description h3 {
        font-size: 13px;
        font-weight: 600;
        margin: 6px 0 2px;
        color: var(--primary-text-color);
      }

      .preset-description ul,
      .preset-description ol {
        padding-left: 16px;
        margin: 2px 0;
      }

      .preset-description img {
        max-width: 100%;
        border-radius: 6px;
      }

      /* Stats row */
      .preset-stats {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 12px;
        color: var(--secondary-text-color);
        padding-top: 4px;
      }

      .preset-stats .stat {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .preset-stats ha-icon {
        --mdc-icon-size: 14px;
        opacity: 0.6;
      }

      /* Rating stars */
      .star-rating {
        display: flex;
        gap: 2px;
      }

      .star-rating ha-icon {
        --mdc-icon-size: 14px;
        color: #ffb300;
        opacity: 1;
      }

      .star-rating ha-icon.empty {
        opacity: 0.25;
      }

      .preset-rating-interactive {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        user-select: none;
      }

      .preset-rating-interactive .rating-count {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-left: 2px;
      }

      .preset-rating-hint {
        font-size: 12px;
        color: var(--primary-color);
        opacity: 0.9;
      }

      /* Action bar at card bottom */
      .preset-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
      }

      .preset-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        flex: 1;
        padding: 5px 10px;
        border-radius: 6px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--secondary-text-color);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .preset-action-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
      }

      .preset-action-btn.primary {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .preset-action-btn.primary:hover {
        filter: brightness(1.1);
        color: white;
      }

      .preset-action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Hint banner above presets grid */
      .presets-hint {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        margin-bottom: 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        border-radius: 10px;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .presets-hint ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .presets-hint strong {
        color: var(--primary-text-color);
      }

      /* Details panel */
      .preset-details {
        padding: 12px 16px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
        animation: fadeSlideIn 0.2s ease-out;
      }

      .detail-info {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 12px;
        font-size: 12px;
        margin-bottom: 10px;
      }

      .detail-info dt {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .detail-info dd {
        margin: 0;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .detail-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }

      .detail-tag {
        display: inline-block;
        padding: 2px 8px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-radius: 4px;
        font-size: 11px;
        color: var(--primary-color);
        font-weight: 500;
      }

      /* Status bar */
      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 10px 14px;
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: 10px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
      }

      .status-bar .count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .status-bar .count strong {
        color: var(--primary-text-color);
      }

      /* Loading */
      .loading-state {
        text-align: center;
        padding: 40px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .loading-state ha-icon {
        --mdc-icon-size: 32px;
        color: var(--primary-color);
        margin-bottom: 12px;
        display: block;
      }

      /* Error */
      .error-state {
        text-align: center;
        padding: 32px;
        color: var(--error-color, #f44336);
        font-size: 14px;
      }
    `],x([(0,a.wk)()],k.prototype,"_presets",void 0),x([(0,a.wk)()],k.prototype,"_category",void 0),x([(0,a.wk)()],k.prototype,"_loading",void 0),x([(0,a.wk)()],k.prototype,"_error",void 0),x([(0,a.wk)()],k.prototype,"_search",void 0),x([(0,a.wk)()],k.prototype,"_toastMsg",void 0),x([(0,a.wk)()],k.prototype,"_expandedId",void 0),x([(0,a.wk)()],k.prototype,"_cloudUser",void 0),x([(0,a.wk)()],k.prototype,"_showLoginDialog",void 0),x([(0,a.wk)()],k.prototype,"_ratingPreset",void 0),x([(0,a.wk)()],k.prototype,"_pendingRateAfterLogin",void 0),x([(0,a.wk)()],k.prototype,"_userReviews",void 0),x([(0,a.wk)()],k.prototype,"_readMoreId",void 0),k=x([(0,a.EM)("hub-presets-tab")],k)}}]);