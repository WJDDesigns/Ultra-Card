import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import type {
  PresetDefinition,
  SmartConnectorStatus,
  SmartGenerateRequest,
  UltraCardConfig,
} from '../types';
import { ucSmartCardsService } from '../services/uc-smart-cards-service';
import '../cards/ultra-card';

@customElement('uc-smart-selector-tab')
export class UcSmartSelectorTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public isPro = false;
  @property({ type: Boolean }) public isCloudAuthenticated = false;

  @state() private _prompt = '';
  @state() private _style: 'clean' | 'minimal' | 'dense' | 'bold' = 'clean';
  @state() private _loadingStatus = true;
  @state() private _statusError: string | null = null;
  @state() private _status: SmartConnectorStatus | null = null;
  @state() private _isGenerating = false;
  @state() private _generateError: string | null = null;
  @state() private _warnings: string[] = [];
  @state() private _connectorUsed: string | null = null;
  @state() private _results: PresetDefinition[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadConnectorStatus();
  }

  focusSearchInput(): void {
    requestAnimationFrame(() => {
      const input = this.shadowRoot?.getElementById('smart-prompt-input') as HTMLTextAreaElement;
      input?.focus();
    });
  }

  private async _loadConnectorStatus(): Promise<void> {
    this._loadingStatus = true;
    this._statusError = null;
    try {
      this._status = await ucSmartCardsService.getConnectorStatus(this.hass);
    } catch (err) {
      this._statusError = err instanceof Error ? err.message : 'Failed to load Smart connectors.';
      this._status = null;
    } finally {
      this._loadingStatus = false;
    }
  }

  private _emitPresetSelected(preset: PresetDefinition): void {
    this.dispatchEvent(
      new CustomEvent('preset-selected', {
        detail: { preset, closeSelector: true, suppressToast: true, skipEntityMapping: true },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _emitOpenPro(): void {
    this.dispatchEvent(new CustomEvent('open-pro', { bubbles: true, composed: true }));
  }

  private _openAssistSettings(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const assistPath = '/config/voice-assistants/assistants';
    const targetWindow = window.top && window.top !== window ? window.top : window;
    targetWindow.location.assign(assistPath);
  }

  private async _generate(): Promise<void> {
    const prompt = this._prompt.trim();
    if (!prompt || this._isGenerating) return;

    this._generateError = null;
    this._warnings = [];
    this._connectorUsed = null;
    this._isGenerating = true;
    try {
      const tier = this.isPro ? 'pro' : 'free';
      const request: SmartGenerateRequest = {
        prompt,
        tier,
        connector_preference: 'ha_assist',
        constraints: {
          style: this._style,
          allow_pro_modules: tier === 'pro',
        },
      };
      const response = await ucSmartCardsService.generatePreset(this.hass, request);
      this._warnings = response.generation?.warnings || [];
      this._connectorUsed = response.generation?.connector_used || null;
      if (response.limits || response.tier_access) {
        const current = this._status || {
          available: { ha_assist: false, user_provider: false, cloud_default: false },
          default_connector: 'auto' as const,
        };
        this._status = {
          ...current,
          ...(response.limits ? { limits: response.limits } : {}),
        };
      }
      this._results = ucSmartCardsService.getPresetCandidates(response);
      if (!this._results.length) {
        this._generateError = response.error || 'No Smart preset was generated. Try a different prompt.';
      }
    } catch (err) {
      this._generateError = err instanceof Error ? err.message : 'Smart generation failed.';
      this._results = [];
    } finally {
      this._isGenerating = false;
    }
  }

  protected override render(): TemplateResult {
    const statusWarnings = this._status?.warnings || [];
    const assistAvailable = !!this._status?.available?.ha_assist;
    const freeRemaining = this._status?.limits?.free_remaining;
    const freeDailyCap = this._status?.limits?.free_daily_generations;
    const freeExhausted =
      !this.isPro &&
      typeof freeRemaining === 'number' &&
      freeRemaining <= 0;
    const canGenerate =
      assistAvailable &&
      !this._isGenerating &&
      !freeExhausted &&
      this._prompt.trim().length > 0;
    const connectorUsedLabel =
      this._connectorUsed === 'ha_assist' ? 'Home Assistant Assist' : this._connectorUsed;
    const hasResults = this._results.length > 0;

    return html`
      <div class="smart-container">
        <div class="smart-header">
          <div>
            <h4>Smart Cards</h4>
            <p>
              Uses your Home Assistant Assist pipeline to turn a description into a ready-to-apply
              Ultra Card preset.
            </p>
          </div>
          <button class="refresh-btn" @click=${this._loadConnectorStatus} ?disabled=${this._loadingStatus}>
            <ha-icon icon="mdi:refresh" class="${this._loadingStatus ? 'spinning' : ''}"></ha-icon>
            <span>Refresh</span>
          </button>
        </div>

        <div class="status-row">
          <span class="chip ${assistAvailable ? 'ok' : 'warn'}">
            ${assistAvailable ? 'HA Assist ready' : 'HA Assist not set up'}
          </span>
          <span class="chip used">${this.isPro ? 'Pro modules enabled' : 'Free modules'}</span>
          ${this._connectorUsed ? html`<span class="chip used">Used: ${connectorUsedLabel}</span>` : ''}
        </div>

        ${this._isGenerating
          ? html`
              <div class="generating-state" role="status" aria-live="polite">
                <ha-icon icon="mdi:brain"></ha-icon>
                <span>Generating smart layout...</span>
              </div>
              <div class="skeleton-grid">
                <div class="skeleton-card"></div>
              </div>
            `
          : ''}

        ${hasResults
          ? html`
              <div class="results">
                ${this._results.map(
                  preset => html`
                    <div class="result-card">
                      <div class="result-head">
                        <h5>${preset.name}</h5>
                        <span class="result-category">${preset.category}</span>
                      </div>
                      <p>${preset.description}</p>
                      ${this._renderPresetPreview(preset)}
                      <div class="tags">
                        ${(preset.tags || []).slice(0, 4).map(tag => html`<span class="tag">${tag}</span>`)}
                      </div>
                      <button class="add-btn" @click=${() => this._emitPresetSelected(preset)}>
                        <ha-icon icon="mdi:plus"></ha-icon>
                        <span>Add</span>
                      </button>
                      <button class="add-btn" @click=${this._generate} ?disabled=${this._isGenerating}>
                        <ha-icon icon="mdi:refresh"></ha-icon>
                        <span>Regenerate</span>
                      </button>
                    </div>
                  `
                )}
              </div>
            `
          : ''}

        ${!assistAvailable && !this._loadingStatus
          ? html`
              <div class="notice warn">
                <ha-icon icon="mdi:assistant"></ha-icon>
                <div>
                  <div class="notice-title">Set up Home Assistant Assist</div>
                  <div>
                    Smart Cards use Home Assistant's Assist/LLM connection. Configure an Assist
                    pipeline in Home Assistant, then refresh this tab.
                  </div>
                </div>
                <button class="mini-btn" @click=${this._openAssistSettings}>Open Assist</button>
              </div>
            `
          : ''}

        ${this._statusError
          ? html`
              <div class="notice error">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <div>${this._statusError}</div>
              </div>
            `
          : ''}

        ${statusWarnings.map(
          warning => html`
            <div class="notice warn compact">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <div>${warning}</div>
            </div>
          `
        )}

        ${(freeDailyCap ?? null) !== null || (freeRemaining ?? null) !== null
          ? html`
              <div class="quota-row">
                <span>Free quota:</span>
                <strong>${freeRemaining ?? '—'} / ${freeDailyCap ?? '—'} remaining</strong>
              </div>
            `
          : ''}
        ${freeExhausted
          ? html`
              <div class="notice warn">
                <ha-icon icon="mdi:lock-outline"></ha-icon>
                <div>Free Smart generations are used up for today.</div>
                <button class="mini-btn" @click=${this._emitOpenPro}>Upgrade</button>
              </div>
            `
          : ''}

        <div class="prompt-panel">
          <label for="smart-prompt-input">What should Assist build?</label>
          <textarea
            id="smart-prompt-input"
            placeholder="Ask Assist to build a compact morning dashboard with weather, commute time, and coffee status..."
            .value=${this._prompt}
            @input=${(e: Event) => {
              this._prompt = (e.target as HTMLTextAreaElement).value;
            }}
          ></textarea>

          <div class="controls-row">
            <div class="group">
              <span class="group-label">Style</span>
              ${(['clean', 'minimal', 'dense', 'bold'] as const).map(
                style => html`
                  <button
                    class="pill ${this._style === style ? 'active' : ''}"
                    @click=${() => (this._style = style)}
                  >
                    ${style}
                  </button>
                `
              )}
            </div>
          </div>

          <button class="generate-btn" @click=${this._generate} ?disabled=${!canGenerate}>
            <ha-icon icon="mdi:brain"></ha-icon>
            <span>${this._isGenerating ? 'Asking Assist...' : 'Ask Assist to Generate'}</span>
          </button>
        </div>

        ${this._generateError
          ? html`
              <div class="notice error">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <div>${this._generateError}</div>
              </div>
            `
          : ''}

        ${this._warnings.map(
          warning => html`
            <div class="notice warn compact">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <div>${warning}</div>
            </div>
          `
        )}

      </div>
    `;
  }

  private _renderPresetPreview(preset: PresetDefinition): TemplateResult {
    if (customElements.get('ultra-card')) {
      return html`
        <div class="smart-preview-live" aria-label="Smart preset live preview">
          <div class="smart-live-viewport">
            <ultra-card
              class="smart-live-card"
              .hass=${this.hass}
              .config=${this._buildLivePreviewConfig(preset)}
            ></ultra-card>
          </div>
        </div>
      `;
    }

    const rootModules = (preset.layout?.rows || [])
      .flatMap(row => row.columns || [])
      .flatMap(column => column.modules || []);

    const modules = this._collectPreviewModules(rootModules).slice(0, 8);

    if (!modules.length) {
      return html`
        <div class="smart-preview empty">
          <ha-icon icon="mdi:view-dashboard-outline"></ha-icon>
          <span>Preview unavailable</span>
        </div>
      `;
    }

    return html`
      <div class="smart-preview" aria-label="Smart preset preview">
        ${modules.map(module => this._renderModulePreview(module as Record<string, unknown>))}
      </div>
    `;
  }

  private _buildLivePreviewConfig(preset: PresetDefinition): UltraCardConfig {
    return {
      type: 'custom:ultra-card',
      layout: preset.layout,
      _config_version: 2,
      ...(preset.cardSettings || {}),
      card_margin: 0,
      card_padding: 0,
    };
  }

  private _collectPreviewModules(modules: unknown[], depth = 0): unknown[] {
    if (depth > 4) return [];
    const collected: unknown[] = [];

    for (const rawModule of modules) {
      if (!rawModule || typeof rawModule !== 'object') continue;
      const module = rawModule as Record<string, unknown>;
      const type = String(module.type || '');

      if (depth === 0 && type === 'vertical' && Array.isArray(module.modules)) {
        collected.push(module);
        continue;
      }

      if ((type === 'horizontal' || type === 'vertical') && Array.isArray(module.modules)) {
        collected.push(...this._collectPreviewModules(module.modules as unknown[], depth + 1));
        continue;
      }
      if (type === 'stack' && Array.isArray(module.modules)) {
        collected.push(...this._collectPreviewModules(module.modules as unknown[], depth + 1));
        continue;
      }
      if (type === 'accordion' && Array.isArray(module.modules)) {
        collected.push(...this._collectPreviewModules(module.modules as unknown[], depth + 1));
        continue;
      }
      if (type === 'tabs' && Array.isArray(module.sections)) {
        for (const section of module.sections as Array<{ modules?: unknown[] }>) {
          if (Array.isArray(section?.modules)) {
            collected.push(...this._collectPreviewModules(section.modules, depth + 1));
          }
        }
        continue;
      }
      collected.push(module);
    }

    return collected;
  }

  private _renderModulePreview(module: Record<string, unknown>): TemplateResult {
    const type = String(module.type || '');
    if ((type === 'horizontal' || type === 'vertical') && Array.isArray(module.modules)) {
      return html`
        <div class="smart-preview-group ${type}">
          ${(module.modules as Record<string, unknown>[])
            .slice(0, 4)
            .map(childModule => this._renderModulePreview(childModule))}
        </div>
      `;
    }

    if (type === 'text') {
      return html`
        <div class="smart-preview-item text">
          <ha-icon icon="mdi:format-title"></ha-icon>
          <div>
            <strong>${String(module.text || 'Text')}</strong>
            <span>Heading</span>
          </div>
        </div>
      `;
    }

    if (type === 'markdown') {
      return html`
        <div class="smart-preview-item markdown">
          <ha-icon icon="mdi:markdown"></ha-icon>
          <div>
            <strong>Markdown</strong>
            <span>${String(module.content || '').slice(0, 48) || 'Formatted text'}</span>
          </div>
        </div>
      `;
    }

    if (type === 'button') {
      return html`
        <div class="smart-preview-item button">
          <ha-icon icon="${String(module.icon || 'mdi:gesture-tap-button')}"></ha-icon>
          <div>
            <strong>${String(module.label || 'Button')}</strong>
            <span>Action button</span>
          </div>
        </div>
      `;
    }

    if (type === 'lock') {
      const entityId = String(module.entity || '');
      const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
      const state = stateObj?.state || 'unknown';
      const name =
        String(module.name || stateObj?.attributes?.friendly_name || this._labelFromEntityId(entityId));
      return html`
        <div class="smart-preview-item lock">
          <ha-icon icon="${state === 'locked' ? 'mdi:lock' : 'mdi:lock-open-variant'}"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${state}</span>
          </div>
        </div>
      `;
    }

    if (type === 'light' && Array.isArray(module.presets)) {
      const presets = module.presets as Array<{ name?: string; action?: string; entities?: string[] }>;
      const firstEntity = presets.find(preset => Array.isArray(preset.entities) && preset.entities[0])?.entities?.[0] || '';
      const stateObj = firstEntity ? this.hass?.states?.[firstEntity] : undefined;
      const name = stateObj?.attributes?.friendly_name || this._labelFromEntityId(firstEntity);
      return html`
        <div class="smart-preview-item light">
          <ha-icon icon="mdi:lightbulb"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${presets.map(preset => preset.name || preset.action || 'Light').join(' / ')}</span>
          </div>
        </div>
      `;
    }

    if (type === 'icon' && Array.isArray(module.icons)) {
      const first = module.icons[0] as { entity?: string; name?: string; icon_active?: string; icon_inactive?: string } | undefined;
      const entityId = first?.entity || '';
      const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
      const state = stateObj?.state || '';
      const name = first?.name || stateObj?.attributes?.friendly_name || this._labelFromEntityId(entityId);
      const icon = state === 'on' ? first?.icon_active : first?.icon_inactive;
      return html`
        <div class="smart-preview-item icon">
          <ha-icon icon="${icon || 'mdi:circle-outline'}"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${state || 'icon'}</span>
          </div>
        </div>
      `;
    }

    if (type === 'info' && Array.isArray(module.info_entities)) {
      const infoEntities = module.info_entities as Array<{ entity?: string; name?: string; attribute?: string }>;
      const first = infoEntities[0];
      const entityId = first?.entity || '';
      const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
      const name = first?.name || stateObj?.attributes?.friendly_name || this._labelFromEntityId(entityId);
      const state = infoEntities
        .slice(0, 2)
        .map(item => this._formatInfoEntityPreview(item))
        .filter(Boolean)
        .join(' · ') || stateObj?.state || type;
      return html`
        <div class="smart-preview-item">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${state}</span>
          </div>
        </div>
      `;
    }

    if (type === 'cover') {
      const entityId = String(module.entity || '');
      const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
      const name =
        String(module.name || stateObj?.attributes?.friendly_name || this._labelFromEntityId(entityId));
      return html`
        <div class="smart-preview-item cover">
          <ha-icon icon="mdi:window-shutter"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${stateObj?.state || 'cover'}</span>
          </div>
        </div>
      `;
    }

    if (type === 'fan') {
      const entityId = String(module.entity || '');
      const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
      const name =
        String(module.name || stateObj?.attributes?.friendly_name || this._labelFromEntityId(entityId));
      return html`
        <div class="smart-preview-item fan">
          <ha-icon icon="mdi:fan"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${stateObj?.state || 'fan'}</span>
          </div>
        </div>
      `;
    }

    if (type === 'climate') {
      const entityId = String(module.entity || '');
      const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
      const name =
        String(module.name || stateObj?.attributes?.friendly_name || this._labelFromEntityId(entityId));
      const temp = stateObj?.attributes?.current_temperature ?? stateObj?.attributes?.temperature;
      return html`
        <div class="smart-preview-item climate">
          <ha-icon icon="mdi:thermostat"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${temp !== undefined ? `${temp}°` : stateObj?.state || 'climate'}</span>
          </div>
        </div>
      `;
    }

    if (type === 'media_player') {
      const entityId = String(module.entity || '');
      const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
      const name =
        String(module.name || stateObj?.attributes?.friendly_name || this._labelFromEntityId(entityId));
      const track = stateObj?.attributes?.media_title || stateObj?.state || 'media';
      return html`
        <div class="smart-preview-item media">
          <ha-icon icon="mdi:play-circle-outline"></ha-icon>
          <div>
            <strong>${name}</strong>
            <span>${track}</span>
          </div>
        </div>
      `;
    }

    if (type === 'status_summary' && Array.isArray(module.entities)) {
      const entities = module.entities as Array<{ entity?: string; name?: string }>;
      const first = entities[0];
      const count = entities.length;
      return html`
        <div class="smart-preview-item summary">
          <ha-icon icon="mdi:format-list-bulleted-square"></ha-icon>
          <div>
            <strong>${String(module.title || 'Status Summary')}</strong>
            <span>${count} ${count === 1 ? 'entity' : 'entities'}${first?.name ? ` · ${first.name}` : ''}</span>
          </div>
        </div>
      `;
    }

    if (type === 'grid' && Array.isArray(module.entities)) {
      const entities = module.entities as Array<{ entity?: string; name?: string }>;
      return html`
        <div class="smart-preview-item grid">
          <ha-icon icon="mdi:view-grid-outline"></ha-icon>
          <div>
            <strong>Entity Grid</strong>
            <span>${entities.length} tiles</span>
          </div>
        </div>
      `;
    }

    if (type === 'gauge') {
      return html`
        <div class="smart-preview-item gauge">
          <ha-icon icon="mdi:gauge"></ha-icon>
          <div>
            <strong>${String(module.name || 'Gauge')}</strong>
            <span>${String(module.entity || 'sensor')}</span>
          </div>
        </div>
      `;
    }

    return html`
      <div class="smart-preview-item">
        <ha-icon icon="mdi:view-module-outline"></ha-icon>
        <div>
          <strong>${type || 'Module'}</strong>
          <span>Preview module</span>
        </div>
      </div>
    `;
  }

  private _labelFromEntityId(entityId: string): string {
    const objectId = entityId.split('.')[1] || entityId || 'Entity';
    return objectId
      .split('_')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private _formatInfoEntityPreview(item: { entity?: string; name?: string; attribute?: string }): string {
    const entityId = item.entity || '';
    const stateObj = entityId ? this.hass?.states?.[entityId] : undefined;
    if (!stateObj) return '';
    if (!item.attribute) return `${item.name || this._labelFromEntityId(entityId)}: ${stateObj.state || 'unknown'}`;
    const rawValue = stateObj.attributes?.[item.attribute];
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return `${item.name || item.attribute}: n/a`;
    }
    if (item.attribute === 'brightness' && typeof rawValue === 'number') {
      return `${item.name || 'Brightness'}: ${Math.round((rawValue / 255) * 100)}%`;
    }
    if (item.attribute === 'rgb_color' && Array.isArray(rawValue)) {
      return `${item.name || 'Color'}: rgb(${rawValue.join(', ')})`;
    }
    if (item.attribute === 'temperature') {
      return `${rawValue}${stateObj.attributes?.temperature_unit ? ` ${stateObj.attributes.temperature_unit}` : ''}`;
    }
    return `${item.name || item.attribute}: ${String(rawValue)}`;
  }

  static override styles = css`
    .smart-container {
      padding: 16px;
      display: grid;
      gap: 12px;
    }
    .smart-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }
    .smart-header h4 {
      margin: 0;
      font-size: 18px;
    }
    .smart-header p {
      margin: 6px 0 0;
      color: var(--secondary-text-color);
      font-size: 13px;
    }
    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 8px 12px;
      background: var(--card-background-color);
      cursor: pointer;
    }
    .refresh-btn[disabled] {
      opacity: 0.6;
      cursor: default;
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    .status-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .chip.ok {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .chip.warn {
      border-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.5);
      color: var(--warning-color);
    }
    .chip.used {
      border-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.5);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
      color: var(--primary-color);
    }
    .notice {
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      padding: 10px 12px;
      font-size: 13px;
      background: var(--card-background-color);
    }
    .notice.warn {
      border-color: rgba(var(--rgb-warning-color, 255, 152, 0), 0.35);
      background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.08);
    }
    .notice.info {
      border-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
    }
    .notice.error {
      border-color: rgba(var(--rgb-error-color, 244, 67, 54), 0.35);
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.08);
    }
    .notice.compact {
      padding: 8px 10px;
      font-size: 12px;
    }
    .notice-title {
      font-weight: 600;
      margin-bottom: 2px;
    }
    .mini-btn {
      margin-left: auto;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 6px 10px;
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 12px;
      color: var(--primary-text-color);
      text-decoration: none;
      white-space: nowrap;
    }
    .quota-row {
      font-size: 12px;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .prompt-panel {
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 12px;
      display: grid;
      gap: 10px;
      background: var(--card-background-color);
    }
    .prompt-panel label {
      font-size: 12px;
      color: var(--secondary-text-color);
      font-weight: 600;
    }
    textarea {
      width: 100%;
      min-height: 96px;
      resize: vertical;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      padding: 10px;
      font-family: inherit;
      font-size: 13px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    textarea:focus {
      outline: 2px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.35);
      border-color: var(--primary-color);
    }
    .controls-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .group {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .group-label {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-right: 4px;
    }
    .pill {
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      background: var(--card-background-color);
      padding: 6px 10px;
      font-size: 12px;
      cursor: pointer;
    }
    .pill.active {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
    }
    .generate-btn {
      border: none;
      border-radius: 10px;
      padding: 10px 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--primary-color);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      min-height: 42px;
    }
    .generate-btn[disabled] {
      opacity: 0.6;
      cursor: default;
    }
    .generating-state {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      padding: 8px 12px;
      border-radius: 10px;
      width: fit-content;
    }
    .skeleton-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .skeleton-card {
      height: 140px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: linear-gradient(
        90deg,
        rgba(var(--rgb-primary-color, 3, 169, 244), 0.05),
        rgba(var(--rgb-primary-color, 3, 169, 244), 0.12),
        rgba(var(--rgb-primary-color, 3, 169, 244), 0.05)
      );
      background-size: 220% 100%;
      animation: shimmer 1.4s ease infinite;
    }
    .results {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .result-card {
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 12px;
      display: grid;
      gap: 8px;
      background: var(--card-background-color);
    }
    .result-head {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: center;
    }
    .result-head h5 {
      margin: 0;
      font-size: 14px;
    }
    .result-category {
      font-size: 11px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }
    .result-card p {
      margin: 0;
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.5;
    }
    .smart-preview {
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      padding: 10px;
      display: grid;
      gap: 8px;
      background: var(--secondary-background-color);
      min-height: 72px;
    }
    .smart-preview-live {
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      padding: 8px;
      background: var(--secondary-background-color);
      max-height: 420px;
      overflow: auto;
    }
    .smart-live-viewport {
      width: min(100%, 640px);
      margin: 0 auto;
    }
    .smart-live-card {
      display: block;
      width: 100%;
      height: auto !important;
      pointer-events: none;
      user-select: none;
    }
    .smart-preview.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .smart-preview-item {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
      border-radius: 9px;
      padding: 8px;
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      min-width: 0;
    }
    .smart-preview-item ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 20px;
    }
    .smart-preview-item div {
      min-width: 0;
      display: grid;
      gap: 2px;
    }
    .smart-preview-item strong {
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .smart-preview-item span {
      color: var(--secondary-text-color);
      font-size: 11px;
      text-transform: capitalize;
    }
    .smart-preview-group {
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      padding: 8px;
      display: grid;
      gap: 8px;
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.03);
    }
    .smart-preview-group.horizontal {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: stretch;
    }
    .smart-preview-group.vertical {
      grid-template-columns: 1fr;
    }
    .smart-preview-group .smart-preview-item {
      min-width: 0;
    }
    .tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .tag {
      font-size: 11px;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      padding: 3px 8px;
      color: var(--secondary-text-color);
    }
    .add-btn {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 8px 10px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    @keyframes shimmer {
      0% {
        background-position: 100% 0;
      }
      100% {
        background-position: 0 0;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-smart-selector-tab': UcSmartSelectorTab;
  }
}
