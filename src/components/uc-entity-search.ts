import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from '../ha/types';

const MAX_RESULTS = 40;

/**
 * `<uc-entity-search>` — text field that searches entities by ID or friendly name.
 *
 * Built in-house because HA's own entity picker is lazy-loaded and isn't always
 * defined on the Hub panel. Typing an entity ID by hand still works. Fires
 * `value-changed` with `{ value }` on every change.
 */
@customElement('uc-entity-search')
export class UcEntitySearch extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = 'Search entities…';

  @state() private _open = false;
  @state() private _active = -1;

  static override styles = css`
    :host {
      display: block;
      position: relative;
      flex: 1;
      min-width: 0;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      font: inherit;
      font-size: 13px;
      padding: 8px 10px 8px 32px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      background: var(--uc-entity-search-bg, var(--secondary-background-color, transparent));
      color: var(--primary-text-color);
      outline: none;
    }
    input:focus {
      border-color: var(--primary-color);
    }
    .search-icon {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
      pointer-events: none;
    }
    .list {
      position: absolute;
      z-index: 20;
      left: 0;
      right: 0;
      top: calc(100% + 4px);
      max-height: 280px;
      overflow-y: auto;
      margin: 0;
      padding: 4px;
      list-style: none;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      background: var(--card-background-color, #1f1f1f);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
    }
    .item.active,
    .item:hover {
      background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    }
    .item ha-state-icon,
    .item ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      flex-shrink: 0;
    }
    .text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .name,
    .id {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .name {
      font-size: 13px;
      color: var(--primary-text-color);
    }
    .id {
      font-size: 11px;
      color: var(--secondary-text-color);
      font-family: var(--code-font-family, monospace);
    }
    .state {
      font-size: 11px;
      color: var(--secondary-text-color);
      flex-shrink: 0;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty {
      padding: 8px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
  `;

  private _matches(): Array<{ id: string; name: string; state: string }> {
    const states = this.hass?.states;
    if (!states) return [];
    const words = this.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const out: Array<{ id: string; name: string; state: string }> = [];
    for (const id of Object.keys(states).sort()) {
      const s = states[id];
      const name = String(s.attributes?.friendly_name ?? '');
      const hay = `${id} ${name}`.toLowerCase();
      if (words.every(w => hay.includes(w))) {
        out.push({ id, name, state: s.state });
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }

  private _set(value: string): void {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value }, bubbles: true, composed: true })
    );
  }

  private _pick(id: string): void {
    this._set(id);
    this._open = false;
    this._active = -1;
  }

  private _onKey(e: KeyboardEvent, matches: Array<{ id: string }>): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._open = true;
      this._active = Math.min(matches.length - 1, this._active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._active = Math.max(0, this._active - 1);
    } else if (e.key === 'Enter' && this._open && matches[this._active]) {
      e.preventDefault();
      this._pick(matches[this._active].id);
    } else if (e.key === 'Escape') {
      this._open = false;
    }
  }

  override render() {
    const matches = this._open ? this._matches() : [];
    return html`
      <ha-icon class="search-icon" icon="mdi:magnify"></ha-icon>
      <input
        type="text"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-expanded=${this._open ? 'true' : 'false'}
        .value=${this.value}
        placeholder=${this.placeholder}
        @focus=${() => (this._open = true)}
        @blur=${() => setTimeout(() => (this._open = false), 150)}
        @input=${(e: InputEvent) => {
          this._open = true;
          this._active = -1;
          this._set((e.target as HTMLInputElement).value);
        }}
        @keydown=${(e: KeyboardEvent) => this._onKey(e, matches)}
      />
      ${this._open
        ? html`
            <ul class="list" role="listbox">
              ${matches.length === 0
                ? html`<li class="empty">No matching entities</li>`
                : matches.map(
                    (m, i) => html`
                      <li
                        class="item ${i === this._active ? 'active' : ''}"
                        role="option"
                        aria-selected=${i === this._active ? 'true' : 'false'}
                        @mousedown=${(e: Event) => {
                          e.preventDefault();
                          this._pick(m.id);
                        }}
                      >
                        ${this.hass?.states[m.id]
                          ? html`<ha-state-icon
                              .hass=${this.hass}
                              .stateObj=${this.hass.states[m.id]}
                            ></ha-state-icon>`
                          : nothing}
                        <span class="text">
                          <span class="name">${m.name || m.id}</span>
                          ${m.name ? html`<span class="id">${m.id}</span>` : nothing}
                        </span>
                        <span class="state">${m.state}</span>
                      </li>
                    `
                  )}
            </ul>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-entity-search': UcEntitySearch;
  }
}
