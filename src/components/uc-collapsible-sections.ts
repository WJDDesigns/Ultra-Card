import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localize } from '../localize/localize';
import { getModuleRegistry } from '../modules/module-registry';
import type { HomeAssistant } from '../ha/types';

type Dict = Record<string, unknown>;
type SchemaItem = { name?: unknown; schema?: unknown; selector?: Dict };
type SelectOption = string | { value?: unknown; label?: unknown };

/**
 * Wraps a module editor tab (General, Actions, Other) and turns every top-level
 * `.settings-section` that has a `.section-title` / `.section-header` into a
 * collapsible section, without each module having to change its template.
 *
 * - The first section starts open, the rest collapsed (a tab with fewer than
 *   three sections starts fully open).
 * - Open/closed state is remembered per module type and tab (localStorage).
 * - A collapsed header shows a short summary of its current values and a dot
 *   when something inside differs from the module's defaults.
 * - "Expand all / Collapse all" sits above the sections.
 *
 * The section content stays in the parent's light DOM, so the module's own
 * styles keep applying. Collapse is done with a data attribute plus CSS in
 * layout-tab.styles.ts, so Lit's re-renders never fight it.
 */

const STORAGE_KEY = 'uc-editor-sections-v1';
const MIN_SECTIONS_TO_AUTO_COLLAPSE = 3;
const SUMMARY_PARTS = 3;
const SUMMARY_PART_MAX = 24;

/** Elements whose clicks must not toggle the section they sit in. */
const INTERACTIVE =
  'button, a, input, select, textarea, label, ha-switch, ha-checkbox, ha-icon-button, ha-button, mwc-button, ha-select, ha-textfield, ha-form, ha-selector, ultra-color-picker, [contenteditable], [data-uc-no-toggle]';

/** Ancestors that already collapse their own content; sections inside them stay as they are. */
const OWN_COLLAPSE = '.settings-section, ha-expansion-panel, [data-uc-no-collapse]';

interface Rail {
  top: number;
  left: number;
  width: number;
  height: number;
}

type StoredState = Record<string, Record<string, boolean>>;

let storedCache: StoredState | null = null;

function readStored(): StoredState {
  if (storedCache) return storedCache;
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    storedCache = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    storedCache = {};
  }
  return storedCache ?? {};
}

function writeStored(scope: string, key: string, open: boolean): void {
  const all = readStored();
  all[scope] = { ...(all[scope] || {}), [key]: open };
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* private mode or storage full: state lasts for this page only */
  }
}

/** Test hook: forget the cached storage read. */
export function _resetCollapsibleSectionsCache(): void {
  storedCache = null;
}

/** Title text used as the section's storage key: lower-case, counts and punctuation dropped. */
export function sectionKeyFromTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(\s*\d+\s*\)/g, '')
    .replace(/\d+/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every(k => deepEqual((a as Dict)[k], (b as Dict)[k]));
}

export interface ChangedLeaf {
  key: string;
  value: unknown;
}

const IGNORED_KEYS = new Set(['id', 'type', 'module_name', 'design']);

/**
 * Settings that differ from the defaults, as (last path segment, current value) pairs.
 * Arrays are compared whole. Missing values count as default.
 */
export function changedLeaves(current: unknown, defaults: unknown, depth = 0): ChangedLeaf[] {
  const out: ChangedLeaf[] = [];
  if (!current || typeof current !== 'object' || Array.isArray(current) || depth > 4) return out;
  const def = defaults && typeof defaults === 'object' ? (defaults as Record<string, unknown>) : {};
  for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
    if (depth === 0 && IGNORED_KEYS.has(key)) continue;
    if (value === undefined) continue;
    const d = def[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...changedLeaves(value, d, depth + 1));
    } else if (d === undefined) {
      if (value !== '' && value !== null && value !== false) out.push({ key, value });
    } else if (!deepEqual(value, d)) {
      out.push({ key, value });
    }
  }
  return out;
}

interface FormField {
  name: string;
  selector?: Dict | undefined;
  value: unknown;
}

function flattenSchema(schema: unknown, data: Dict, out: FormField[]): void {
  if (!Array.isArray(schema)) return;
  for (const raw of schema) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as SchemaItem;
    if (Array.isArray(item.schema)) {
      const sub = typeof item.name === 'string' ? data?.[item.name] : undefined;
      flattenSchema(item.schema, sub && typeof sub === 'object' ? (sub as Dict) : data, out);
      continue;
    }
    if (typeof item.name === 'string') {
      out.push({ name: item.name, selector: item.selector, value: data?.[item.name] });
    }
  }
}

function formFields(section: Element): FormField[] {
  const out: FormField[] = [];
  section.querySelectorAll('ha-form').forEach(form => {
    const f = form as unknown as { schema?: unknown; data?: Dict };
    flattenSchema(f.schema, f.data || {}, out);
  });
  return out;
}

/** Elements after a section, up to the next collapsible section, that belong to it. */
export function ownedSiblings(section: Element, sections: Set<Element>): Element[] {
  const out: Element[] = [];
  for (let n = section.nextElementSibling; n; n = n.nextElementSibling) {
    if (sections.has(n) || n.hasAttribute('data-uc-no-collapse')) break;
    if (Array.from(sections).some(s => n !== s && n.contains(s))) break;
    if (n.tagName === 'STYLE' || n.tagName === 'SCRIPT') continue;
    out.push(n);
  }
  return out;
}

function truncate(text: string): string {
  const t = text.trim();
  return t.length > SUMMARY_PART_MAX ? `${t.slice(0, SUMMARY_PART_MAX - 1)}…` : t;
}

/** Short "Floating · Bottom · 12px" style text from the section's form values. */
export function summarizeFields(fields: FormField[], hass?: HomeAssistant): string {
  const parts: string[] = [];
  for (const field of fields) {
    if (parts.length >= SUMMARY_PARTS) break;
    const v = field.value;
    if (v === undefined || v === null || v === '' || typeof v === 'boolean') continue;
    if (typeof v === 'object') continue;
    const sel = (field.selector || {}) as {
      select?: { options?: SelectOption[] };
      entity?: unknown;
      icon?: unknown;
      color_rgb?: unknown;
      ui_color?: unknown;
      number?: { unit_of_measurement?: string };
    };
    if (Array.isArray(sel.select?.options)) {
      const opt = sel.select.options.find(o => (typeof o === 'object' ? o?.value === v : o === v));
      const label = typeof opt === 'object' ? opt?.label : opt;
      if (label !== undefined && label !== null && label !== '') {
        parts.push(truncate(String(label).split(' - ')[0]));
        continue;
      }
    }
    if (sel.entity && typeof v === 'string') {
      const name = hass?.states?.[v]?.attributes?.friendly_name;
      parts.push(truncate(name || v));
      continue;
    }
    if (sel.icon || sel.color_rgb || sel.ui_color) continue;
    if (typeof v === 'number') {
      const unit = sel.number?.unit_of_measurement;
      parts.push(unit ? `${v}${unit === '%' || unit === 'px' ? '' : ' '}${unit}` : String(v));
      continue;
    }
    if (typeof v === 'string' && !v.includes('{{') && !v.includes('\n')) parts.push(truncate(v));
  }
  return parts.join(' · ');
}

const defaultsCache = new Map<string, unknown>();

function moduleDefaults(type: string, hass?: HomeAssistant): unknown {
  if (!type) return undefined;
  if (defaultsCache.has(type)) return defaultsCache.get(type);
  let def: unknown;
  try {
    def = getModuleRegistry().getModule(type)?.createDefault('uc-defaults', hass);
  } catch {
    def = undefined;
  }
  if (def) defaultsCache.set(type, def);
  return def;
}

@customElement('uc-collapsible-sections')
export class UcCollapsibleSections extends LitElement {
  @property({ attribute: false }) moduleType = '';
  @property({ attribute: false }) tab = 'general';
  @property({ attribute: false }) module?: Record<string, unknown>;
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private _count = 0;
  @state() private _anyCollapsed = false;
  /** Boxes drawn around an open section plus the fields that sit after it. */
  @state() private _rails: Rail[] = [];

  private _resize: ResizeObserver | undefined;
  private _railFrame = 0;

  private _observer: MutationObserver | undefined;
  private _frame = 0;
  /** Session state for sections the user hasn't toggled yet (so defaults don't jump around). */
  private _session = new Map<string, boolean>();

  private get _scope(): string {
    return `${this.moduleType || 'module'}::${this.tab}`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._observer = new MutationObserver(() => this._scheduleScan());
    this._observer.observe(this, { childList: true, subtree: true });
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeyDown);
    if (typeof ResizeObserver !== 'undefined') {
      this._resize = new ResizeObserver(() => this._scheduleRails());
      this._resize.observe(this);
    }
    this._scheduleScan();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = undefined;
    this._resize?.disconnect();
    this._resize = undefined;
    if (this._railFrame) cancelAnimationFrame(this._railFrame);
    this._railFrame = 0;
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeyDown);
    if (this._frame) cancelAnimationFrame(this._frame);
    this._frame = 0;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('moduleType') || changed.has('tab')) this._session.clear();
    if (changed.has('module') || changed.has('moduleType') || changed.has('tab')) {
      this._scheduleScan();
    }
  }

  private _scheduleScan(): void {
    if (this._frame) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      this.scan();
    });
  }

  /** Top-level titled sections inside this wrapper, in document order. */
  private _sections(): Array<{ section: HTMLElement; head: HTMLElement }> {
    const out: Array<{ section: HTMLElement; head: HTMLElement }> = [];
    this.querySelectorAll<HTMLElement>('.settings-section').forEach(section => {
      if (section.closest('uc-collapsible-sections') !== this) return;
      const owner = section.parentElement?.closest(OWN_COLLAPSE);
      if (owner && this.contains(owner)) return;
      const children = Array.from(section.children).filter(c => c.tagName !== 'STYLE');
      const head = children.slice(0, 2).find(c => c.matches('.section-title, .section-header')) as
        HTMLElement | undefined;
      if (head) out.push({ section, head });
    });
    return out;
  }

  private _isOpen(key: string, index: number, count: number): boolean {
    const known = this._session.get(key);
    if (known !== undefined) return known;
    const stored = readStored()[this._scope]?.[key];
    const open =
      typeof stored === 'boolean' ? stored : index === 0 || count < MIN_SECTIONS_TO_AUTO_COLLAPSE;
    this._session.set(key, open);
    return open;
  }

  /** Applies headers, collapse state, summaries and change dots. Safe to call repeatedly. */
  scan(): void {
    const sections = this._sections();
    const defaults = this.module ? moduleDefaults(this.moduleType, this.hass) : undefined;
    const leaves = defaults ? changedLeaves(this.module, defaults) : [];
    let anyCollapsed = false;
    const sectionEls = new Set<Element>(sections.map(x => x.section));
    const hiddenNow = new Set<Element>();
    const shownNow = new Set<Element>();

    sections.forEach(({ section, head }, index) => {
      this._decorate(head);
      const key =
        head.dataset.ucSecKey || sectionKeyFromTitle(this._titleText(head)) || `#${index}`;
      head.dataset.ucSecKey = key;
      const open = this._isOpen(key, index, sections.length);
      if (!open) anyCollapsed = true;

      if (section.hasAttribute('data-uc-collapsed') === open) {
        section.toggleAttribute('data-uc-collapsed', !open);
      }
      section.setAttribute('data-uc-collapsible', '');
      if (head.getAttribute('aria-expanded') !== String(open)) {
        head.setAttribute('aria-expanded', String(open));
      }

      // Many editors put a section's sliders/pickers right after the section box
      // instead of inside it; those siblings fold away with the section.
      const owned = ownedSiblings(section, sectionEls);
      owned.forEach(el => {
        if (!open) hiddenNow.add(el);
        else shownNow.add(el);
        if (el.hasAttribute('data-uc-sec-owned-hidden') === open) {
          el.toggleAttribute('data-uc-sec-owned-hidden', !open);
        }
        if (el.hasAttribute('data-uc-sec-owned') !== open) {
          el.toggleAttribute('data-uc-sec-owned', open);
        }
      });
      owned.forEach((el, i) => {
        const last = open && i === owned.length - 1;
        if (el.hasAttribute('data-uc-sec-owned-last') !== last) {
          el.toggleAttribute('data-uc-sec-owned-last', last);
        }
      });
      const hasOwned = owned.length > 0;
      if (section.hasAttribute('data-uc-sec-has-owned') !== hasOwned) {
        section.toggleAttribute('data-uc-sec-has-owned', hasOwned);
      }

      const fields = [section, ...owned].flatMap(el => formFields(el));
      const summary = open ? '' : summarizeFields(fields, this.hass);
      const edited = fields.some(
        f =>
          f.value !== undefined && leaves.some(l => l.key === f.name && deepEqual(l.value, f.value))
      );
      const summaryEl = head.querySelector(':scope > .uc-sec-meta > .uc-sec-summary');
      if (summaryEl && summaryEl.textContent !== summary) summaryEl.textContent = summary;
      if (head.hasAttribute('data-uc-edited') !== edited) {
        head.toggleAttribute('data-uc-edited', edited);
      }
    });

    // Drop stale marks left on elements that moved or lost their title.
    this.querySelectorAll('[data-uc-sec-owned-hidden]').forEach(el => {
      if (!hiddenNow.has(el)) el.removeAttribute('data-uc-sec-owned-hidden');
    });
    this.querySelectorAll('[data-uc-sec-owned]').forEach(el => {
      if (!shownNow.has(el)) el.removeAttribute('data-uc-sec-owned');
    });
    this.querySelectorAll('[data-uc-sec-owned-last]').forEach(el => {
      if (!shownNow.has(el)) el.removeAttribute('data-uc-sec-owned-last');
    });
    this.querySelectorAll('.settings-section[data-uc-collapsible]').forEach(el => {
      if (!sectionEls.has(el)) {
        el.removeAttribute('data-uc-collapsible');
        el.removeAttribute('data-uc-collapsed');
        el.removeAttribute('data-uc-sec-has-owned');
      }
    });

    if (this._count !== sections.length) this._count = sections.length;
    if (this._anyCollapsed !== anyCollapsed) this._anyCollapsed = anyCollapsed;
    this._scheduleRails();
  }

  private _scheduleRails(): void {
    if (this._railFrame) return;
    this._railFrame = requestAnimationFrame(() => {
      this._railFrame = 0;
      this._layoutRails();
    });
  }

  /**
   * One box from an open section's top down to the last field it owns outside
   * the box, so the section and those fields read as a single accordion.
   */
  private _layoutRails(): void {
    const host = this.getBoundingClientRect();
    const rails: Rail[] = [];
    const sectionEls = new Set<Element>(this._sections().map(x => x.section));
    sectionEls.forEach(section => {
      if (section.hasAttribute('data-uc-collapsed')) return;
      const owned = ownedSiblings(section, sectionEls).filter(
        el => el.getBoundingClientRect().height > 0
      );
      if (!owned.length) return;
      const box = section.getBoundingClientRect();
      const last = owned[owned.length - 1].getBoundingClientRect();
      const height = Math.round(last.bottom - box.top + 16);
      if (height <= 0) return;
      rails.push({
        top: Math.round(box.top - host.top),
        left: Math.round(box.left - host.left),
        width: Math.round(box.width),
        height,
      });
    });
    const same =
      rails.length === this._rails.length &&
      rails.every(
        (r, i) =>
          r.top === this._rails[i].top &&
          r.left === this._rails[i].left &&
          r.width === this._rails[i].width &&
          r.height === this._rails[i].height
      );
    if (!same) this._rails = rails;
  }

  private _titleText(head: HTMLElement): string {
    const clone = head.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.uc-sec-meta, .uc-sec-chevron').forEach(n => n.remove());
    return clone.textContent || '';
  }

  private _decorate(head: HTMLElement): void {
    if (head.hasAttribute('data-uc-sec-head')) {
      if (head.querySelector(':scope > .uc-sec-chevron')) return;
    }
    head.setAttribute('data-uc-sec-head', '');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');

    const meta = document.createElement('span');
    meta.className = 'uc-sec-meta';
    const dot = document.createElement('span');
    dot.className = 'uc-sec-dot';
    dot.title = localize(
      'editor.sections.edited',
      this.hass?.locale?.language || 'en',
      'Changed from default'
    );
    const summary = document.createElement('span');
    summary.className = 'uc-sec-summary';
    meta.append(dot, summary);

    // Drawn inline (not ha-icon) so the caret is centred exactly in its circle.
    const chevron = document.createElement('span');
    chevron.className = 'uc-sec-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS(svgNs, 'path');
    path.setAttribute('d', 'M7 9.5l5 5 5-5');
    svg.append(path);
    chevron.append(svg);

    head.append(meta, chevron);
  }

  private _headFromEvent(e: Event): { head: HTMLElement; interactive: boolean } | null {
    let interactive = false;
    for (const node of e.composedPath()) {
      if (node === this) break;
      if (!(node instanceof HTMLElement)) continue;
      if (node.hasAttribute('data-uc-sec-head')) {
        return node.closest('uc-collapsible-sections') === this
          ? { head: node, interactive }
          : null;
      }
      if (node.matches(INTERACTIVE)) interactive = true;
    }
    return null;
  }

  private _onClick = (e: Event): void => {
    const hit = this._headFromEvent(e);
    if (!hit) return;
    const section = hit.head.parentElement;
    if (!section) return;
    if (hit.interactive) {
      // A button in a collapsed header (e.g. "Add") must show what it adds.
      if (section.hasAttribute('data-uc-collapsed')) this._setOpen(hit.head, true);
      return;
    }
    this._setOpen(hit.head, section.hasAttribute('data-uc-collapsed'));
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const target = e.composedPath()[0];
    if (!(target instanceof HTMLElement) || !target.hasAttribute('data-uc-sec-head')) return;
    if (target.closest('uc-collapsible-sections') !== this) return;
    e.preventDefault();
    this._setOpen(target, target.parentElement?.hasAttribute('data-uc-collapsed') ?? false);
  };

  private _setOpen(head: HTMLElement, open: boolean): void {
    const key = head.dataset.ucSecKey;
    if (!key) return;
    this._session.set(key, open);
    writeStored(this._scope, key, open);
    this.scan();
  }

  private _toggleAll(): void {
    const open = this._anyCollapsed;
    this._sections().forEach(({ head }) => {
      const key = head.dataset.ucSecKey;
      if (!key) return;
      this._session.set(key, open);
      writeStored(this._scope, key, open);
    });
    this.scan();
  }

  protected override render() {
    const lang = this.hass?.locale?.language || 'en';
    return html`
      ${
        this._count >= 2
          ? html`<div class="toolbar">
              <button type="button" @click=${() => this._toggleAll()}>
                <ha-icon
                  icon=${this._anyCollapsed ? 'mdi:unfold-more-horizontal' : 'mdi:unfold-less-horizontal'}
                ></ha-icon>
                ${
                  this._anyCollapsed
                    ? localize('editor.sections.expand_all', lang, 'Expand all')
                    : localize('editor.sections.collapse_all', lang, 'Collapse all')
                }
              </button>
            </div>`
          : ''
      }
      ${this._rails.map(
        r =>
          html`<div
            class="rail"
            aria-hidden="true"
            style="top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px"
          ></div>`
      )}
      <slot></slot>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      position: relative;
      isolation: isolate;
    }
    .rail {
      position: absolute;
      z-index: -1;
      box-sizing: border-box;
      border-radius: 8px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-left: 4px solid var(--primary-color);
      pointer-events: none;
    }
    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin: 0 0 8px;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: none;
      background: none;
      color: var(--primary-color);
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 4px 6px;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover {
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }
    button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    ha-icon {
      --mdc-icon-size: 18px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-collapsible-sections': UcCollapsibleSections;
  }
}
