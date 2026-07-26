import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { localize } from '../localize/localize';
import type { CardHealthReport, HealthIssue, HealthSeverity } from '../services/uc-card-health-service';

@customElement('uc-card-health-panel')
export class UcCardHealthPanel extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public report: CardHealthReport | null = null;
  @property({ type: Boolean }) public open = false;

  static override styles = css`
    :host {
      display: block;
    }

    .panel {
      margin: 8px 4px 8px 12px;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
    }

    .title {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 4px;
      border-radius: 4px;
    }

    .empty {
      font-size: 13px;
      color: var(--secondary-text-color);
      padding: 8px 0;
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 280px;
      overflow: auto;
    }

    .issue {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--card-background-color, var(--primary-background-color));
      border-left: 3px solid var(--divider-color);
      font-size: 12px;
      color: var(--primary-text-color);
    }

    .issue.error {
      border-left-color: var(--error-color, #f44336);
    }
    .issue.warning {
      border-left-color: var(--warning-color, #ff9800);
    }
    .issue.info {
      border-left-color: var(--info-color, var(--primary-color));
    }

    .issue-body {
      flex: 1;
      min-width: 0;
    }

    .issue-meta {
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 2px;
      text-transform: capitalize;
    }

    .jump {
      flex-shrink: 0;
      background: none;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      color: var(--primary-color);
    }

    .severity-icon {
      --mdc-icon-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .issue.error .severity-icon {
      color: var(--error-color, #f44336);
    }
    .issue.warning .severity-icon {
      color: var(--warning-color, #ff9800);
    }
    .issue.info .severity-icon {
      color: var(--info-color, var(--primary-color));
    }
  `;

  private _lang(): string {
    return this.hass?.locale?.language || 'en';
  }

  private _icon(severity: HealthSeverity): string {
    if (severity === 'error') return 'mdi:alert-circle';
    if (severity === 'warning') return 'mdi:alert';
    return 'mdi:information-outline';
  }

  private _sortedIssues(): HealthIssue[] {
    const order: Record<HealthSeverity, number> = { error: 0, warning: 1, info: 2 };
    return [...(this.report?.issues || [])].sort(
      (a, b) => order[a.severity] - order[b.severity]
    );
  }

  private _jump(issue: HealthIssue): void {
    this.dispatchEvent(
      new CustomEvent('health-jump', {
        detail: { issue, jump: issue.jump },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _fix(issue: HealthIssue): void {
    this.dispatchEvent(
      new CustomEvent('health-fix', {
        detail: { issue, fixAction: issue.fixAction },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _close(): void {
    this.dispatchEvent(
      new CustomEvent('health-close', { bubbles: true, composed: true })
    );
  }

  protected override render(): TemplateResult {
    if (!this.open) return html``;
    const lang = this._lang();
    const issues = this._sortedIssues();
    const healthy = issues.length === 0;

    return html`
      <div class="panel" role="region" aria-label=${localize('editor.health.title', lang, 'Card Health')}>
        <div class="header">
          <div class="title">
            <ha-icon icon="mdi:heart-pulse"></ha-icon>
            ${localize('editor.health.title', lang, 'Card Health')}
          </div>
          <button
            class="close"
            @click=${this._close}
            aria-label=${localize('editor.health.close', lang, 'Close')}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        ${healthy
          ? html`
              <div class="empty">
                ${localize(
                  'editor.health.healthy',
                  lang,
                  'No issues found. This card looks healthy.'
                )}
              </div>
            `
          : html`
              <ul class="list">
                ${issues.map(
                  issue => html`
                    <li class="issue ${issue.severity}">
                      <ha-icon class="severity-icon" icon=${this._icon(issue.severity)}></ha-icon>
                      <div class="issue-body">
                        <div>${issue.message}</div>
                        <div class="issue-meta">${issue.category} · ${issue.severity}</div>
                      </div>
                      ${issue.jump
                        ? html`
                            <button class="jump" @click=${() => this._jump(issue)}>
                              ${localize('editor.health.jump', lang, 'Jump')}
                            </button>
                          `
                        : ''}
                      ${issue.fixAction === 'open_connect'
                        ? html`
                            <button class="jump" @click=${() => this._fix(issue)}>
                              ${localize('editor.health.open_connect', lang, 'Open Connect')}
                            </button>
                          `
                        : ''}
                    </li>
                  `
                )}
              </ul>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-card-health-panel': UcCardHealthPanel;
  }
}
