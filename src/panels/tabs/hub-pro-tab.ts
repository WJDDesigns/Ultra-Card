import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { panelStyles } from '../panel-styles';
import type { HomeAssistant } from 'custom-card-helpers';
import { ucCloudAuthService, CloudUser } from '../../services/uc-cloud-auth-service';
import { ucSnapshotService, SnapshotSettings, SnapshotListItem } from '../../services/uc-snapshot-service';
import { ucSnapshotSchedulerService } from '../../services/uc-snapshot-scheduler-service';

export interface ProAuthData {
  authenticated: boolean;
  user_id?: number;
  username?: string;
  email?: string;
  display_name?: string;
  subscription_tier?: string;
  subscription_status?: string;
  subscription_expires?: number;
}

@customElement('hub-pro-tab')
export class HubProTab extends LitElement {
  @property({ attribute: false }) auth: ProAuthData | null = null;
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _toastMsg = '';
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _snapshotSettingsOpen = false;
  @state() private _ssEnabled = false;
  @state() private _ssTime = '03:00';
  @state() private _ssTimezone = 'UTC';
  @state() private _ssLoading = false;
  @state() private _snapshotsListOpen = false;
  @state() private _snapshotsList: SnapshotListItem[] = [];
  @state() private _snapshotsLoading = false;
  @state() private _creatingSnapshot = false;
  private _snapshotsSummaryLoaded = false;
  private _toastTimer?: ReturnType<typeof setTimeout>;

  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
        padding-bottom: 60px;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      /* Integration status card */
      .integration-status {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 20px;
        border-radius: 14px;
        margin-bottom: 24px;
      }

      .integration-status.authenticated {
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.02));
        border: 1px solid rgba(76, 175, 80, 0.2);
      }

      .integration-status.not-configured {
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.08), rgba(255, 152, 0, 0.02));
        border: 1px solid rgba(255, 152, 0, 0.2);
      }

      .integration-status.not-installed {
        background: linear-gradient(135deg, rgba(var(--rgb-primary-color, 3, 169, 244), 0.06), transparent);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .status-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .status-icon-wrap.success {
        background: rgba(76, 175, 80, 0.15);
      }

      .status-icon-wrap.success ha-icon {
        color: #4caf50;
        --mdc-icon-size: 24px;
      }

      .status-icon-wrap.warning {
        background: rgba(255, 152, 0, 0.15);
      }

      .status-icon-wrap.warning ha-icon {
        color: #ff9800;
        --mdc-icon-size: 24px;
      }

      .status-icon-wrap.info {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
      }

      .status-icon-wrap.info ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 24px;
      }

      .status-body {
        flex: 1;
        min-width: 0;
      }

      .status-body h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .status-body p {
        margin: 0 0 4px 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .status-body a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
      }

      .status-body a:hover {
        text-decoration: underline;
      }

      .status-note {
        font-size: 12px;
        opacity: 0.7;
        margin-top: 6px;
      }

      /* Pro Banner */
      .pro-banner {
        position: relative;
        padding: 28px;
        border-radius: 16px;
        margin-bottom: 24px;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .pro-banner::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0.12;
        background: radial-gradient(circle at 80% 20%, white 0%, transparent 60%);
      }

      .pro-banner.pro {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
      }

      .pro-banner.free {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
      }

      .pro-banner.disconnected {
        background: linear-gradient(135deg, #546e7a 0%, #37474f 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(84, 110, 122, 0.25);
      }

      .banner-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .banner-icon-wrap ha-icon {
        --mdc-icon-size: 30px;
        color: white;
      }

      .banner-content {
        flex: 1;
        position: relative;
        z-index: 1;
      }

      .banner-content h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .banner-content h3 ha-icon {
        --mdc-icon-size: 22px;
      }

      .banner-content p {
        margin: 4px 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .banner-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 0.5px;
        position: relative;
        z-index: 1;
      }

      .banner-badge ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Account card */
      .account-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .account-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        font-size: 14px;
      }

      .account-row:last-child {
        border-bottom: none;
      }

      .account-label {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .account-value {
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .tier-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .tier-badge.pro {
        background: linear-gradient(135deg, #f093fb, #f5576c);
        color: white;
      }

      .tier-badge.free {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
        color: var(--secondary-text-color);
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }

      .status-dot.active {
        background: #4caf50;
        box-shadow: 0 0 6px rgba(76, 175, 80, 0.4);
      }

      .status-dot.inactive {
        background: var(--disabled-text-color, #999);
      }

      /* Pro tools section */
      .tools-section {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }

      @media (max-width: 600px) {
        .tools-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
      }

      .tool-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        padding: 20px 14px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        font: inherit;
        color: inherit;
      }

      .tool-card:hover {
        border-color: var(--primary-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      .tool-card:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .tool-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tool-icon ha-icon {
        --mdc-icon-size: 22px;
        color: white;
      }

      .tool-icon.export { background: linear-gradient(135deg, #2196f3, #42a5f5); }
      .tool-icon.import { background: linear-gradient(135deg, #4caf50, #66bb6a); }
      .tool-icon.backup { background: linear-gradient(135deg, #ff9800, #ffb74d); }
      .tool-icon.restore { background: linear-gradient(135deg, #9c27b0, #ba68c8); }
      .tool-icon.history { background: linear-gradient(135deg, #607d8b, #90a4ae); }
      .tool-icon.snapshot { background: linear-gradient(135deg, #e91e63, #f06292); }
      .tool-icon.settings { background: linear-gradient(135deg, #795548, #a1887f); }

      .tool-content h4 {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .tool-content p {
        margin: 2px 0 0;
        font-size: 11px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      /* Snapshot summary below dashboard tools */
      .snapshot-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px 24px;
        margin-top: 16px;
        padding: 14px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        border-radius: 10px;
        font-size: 13px;
      }

      .snapshot-summary-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .snapshot-summary-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .snapshot-summary-label ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
      }

      .snapshot-summary-value {
        color: var(--primary-text-color);
        font-weight: 600;
      }

      .snapshot-summary-latest .snapshot-summary-value {
        font-weight: 500;
        font-size: 12px;
      }

      /* Status info bars */
      .tools-status {
        margin-top: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
      }

      .tools-status.info {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
        color: var(--primary-color);
      }

      .tools-status.warning {
        background: rgba(255, 152, 0, 0.08);
        color: #f57c00;
      }

      .tools-status.success {
        background: rgba(76, 175, 80, 0.08);
        color: #4caf50;
      }

      .tools-status ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }

      /* Upgrade prompt for free users */
      .upgrade-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 2px solid var(--primary-color);
        border-radius: 16px;
        padding: 28px;
        margin-bottom: 24px;
        text-align: center;
      }

      .upgrade-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(240, 147, 251, 0.12), rgba(245, 87, 108, 0.12));
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
      }

      .upgrade-icon ha-icon {
        --mdc-icon-size: 32px;
        color: #f5576c;
      }

      .upgrade-card h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--primary-text-color);
      }

      .upgrade-card > p {
        margin: 0 0 20px 0;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .features-checklist {
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
        max-width: 380px;
        margin: 0 auto 24px;
      }

      .features-checklist li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--primary-text-color);
        list-style: none;
      }

      .features-checklist li ha-icon {
        --mdc-icon-size: 18px;
        color: #4caf50;
        flex-shrink: 0;
      }

      .upgrade-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 32px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #f093fb, #f5576c);
        color: white;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
      }

      .upgrade-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(245, 87, 108, 0.35);
        filter: brightness(1.05);
      }

      .upgrade-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Not installed CTA */
      .install-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        margin-bottom: 24px;
      }

      .install-card .cta-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
      }

      .install-card .cta-icon ha-icon {
        --mdc-icon-size: 36px;
        color: var(--primary-color);
      }

      .install-card h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--primary-text-color);
      }

      .install-card > p {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.5;
        max-width: 480px;
        margin-left: auto;
        margin-right: auto;
      }

      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        margin: 24px 0;
        text-align: left;
      }

      .benefit-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
      }

      .benefit-item ha-icon {
        --mdc-icon-size: 20px;
        color: #4caf50;
        margin-top: 1px;
        flex-shrink: 0;
      }

      .benefit-item strong {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }

      .benefit-item span {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      .install-steps {
        text-align: left;
        max-width: 420px;
        margin: 0 auto 24px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
      }

      .install-steps h5 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .install-steps ol {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.8;
      }

      .install-steps ol strong {
        color: var(--primary-text-color);
      }

      .cta-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
      }

      .cta-btn.primary {
        background: var(--primary-color);
        color: white;
      }

      .cta-btn.primary:hover {
        filter: brightness(1.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .cta-btn.secondary {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .cta-btn.secondary:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .cta-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Features grid */
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
      }

      .feature-card {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .feature-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      .feature-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .feature-icon ha-icon {
        --mdc-icon-size: 20px;
        color: white;
      }

      .feature-icon.sync { background: linear-gradient(135deg, #2196f3, #42a5f5); }
      .feature-icon.backup { background: linear-gradient(135deg, #ff9800, #ffb74d); }
      .feature-icon.presets { background: linear-gradient(135deg, #e91e63, #f06292); }
      .feature-icon.support { background: linear-gradient(135deg, #4caf50, #66bb6a); }

      .feature-info h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .feature-info p {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      /* Pro settings */
      .pro-setting-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
        transition: all 0.2s ease;
      }

      .pro-setting-item:hover {
        background: var(--divider-color, rgba(0, 0, 0, 0.06));
      }

      .setting-icon-wrap {
        width: 44px;
        height: 44px;
        min-width: 44px;
        background: linear-gradient(135deg, var(--primary-color, #03a9f4), #0288d1);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(3, 169, 244, 0.25);
      }

      .setting-icon-wrap ha-icon {
        --mdc-icon-size: 24px;
        color: white;
      }

      .setting-body {
        flex: 1;
        min-width: 0;
      }

      .setting-body h4 {
        margin: 0 0 4px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .setting-body p {
        margin: 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .setting-toggle {
        padding-top: 4px;
      }

      /* Discord support section */
      .discord-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(88, 101, 242, 0.08), rgba(88, 101, 242, 0.02));
        border: 1px solid rgba(88, 101, 242, 0.2);
        border-radius: 14px;
        transition: all 0.2s ease;
      }

      .discord-card:hover {
        border-color: rgba(88, 101, 242, 0.4);
        box-shadow: 0 4px 16px rgba(88, 101, 242, 0.1);
      }

      .discord-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: #5865F2;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
      }

      .discord-icon ha-icon {
        --mdc-icon-size: 26px;
        color: white;
      }

      .discord-body {
        flex: 1;
        min-width: 0;
      }

      .discord-body h4 {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .discord-body p {
        margin: 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .discord-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        background: #5865F2;
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
        flex-shrink: 0;
        white-space: nowrap;
      }

      .discord-btn:hover {
        background: #4752C4;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(88, 101, 242, 0.35);
      }

      .discord-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Snapshot settings inline panel */
      .ss-panel {
        margin-top: 16px;
        padding: 20px;
        background: var(--secondary-background-color, rgba(0,0,0,0.03));
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.08));
        animation: fadeSlideIn 0.2s ease-out;
      }

      .ss-panel h4 {
        margin: 0 0 16px 0;
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color);
      }

      .ss-panel h4 ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); }

      .ss-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .ss-row:last-child { margin-bottom: 0; }

      .ss-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        min-width: 80px;
      }

      .ss-input {
        padding: 8px 12px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        border-radius: 8px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }

      .ss-input:focus { border-color: var(--primary-color); }

      select.ss-input {
        cursor: pointer;
        min-width: 160px;
      }

      .ss-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      .ss-save-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        border: none;
        border-radius: 8px;
        background: var(--primary-color);
        color: white;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ss-save-btn:hover:not(:disabled) { filter: brightness(1.1); }
      .ss-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .ss-cancel-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 18px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        border-radius: 8px;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .ss-cancel-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }

      /* Snapshot list panel */
      .snapshots-list {
        margin-top: 16px;
        animation: fadeSlideIn 0.2s ease-out;
      }

      .snapshot-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.03));
        border-radius: 10px;
        margin-bottom: 8px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        transition: all 0.2s ease;
      }

      .snapshot-item:hover {
        border-color: var(--primary-color);
      }

      .snapshot-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .snapshot-icon.manual { background: linear-gradient(135deg, #e91e63, #f06292); }
      .snapshot-icon.auto { background: linear-gradient(135deg, #4caf50, #66bb6a); }

      .snapshot-icon ha-icon { --mdc-icon-size: 20px; color: white; }

      .snapshot-info { flex: 1; min-width: 0; }
      .snapshot-info h5 { margin: 0; font-size: 14px; font-weight: 600; color: var(--primary-text-color); }
      .snapshot-info p { margin: 2px 0 0; font-size: 12px; color: var(--secondary-text-color); }

      .snapshot-meta {
        text-align: right;
        font-size: 12px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }

      .snapshot-meta .card-count {
        font-weight: 600;
        color: var(--primary-color);
      }
    `,
  ];

  updated(changed: Map<string, unknown>): void {
    if (changed.has('hass') && this.hass) {
      this._cloudUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    }
    // Load snapshot list once when Pro tab is shown so summary has data
    if (
      this.auth?.authenticated &&
      this.auth?.subscription_tier === 'pro' &&
      this.hass &&
      !this._snapshotsSummaryLoaded &&
      !this._snapshotsLoading
    ) {
      this._loadSnapshotsList();
    }
  }

  private _showToast(msg: string): void {
    this._toastMsg = msg;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (this._toastMsg = ''), 2500);
  }

  private _formatExpiry(ts?: number): string {
    if (ts == null) return '—';
    try {
      return new Date(ts * 1000).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  }

  render() {
    const auth = this.auth;
    const isIntegrationInstalled = auth != null;
    const isLoggedIn = !!auth?.authenticated;
    const isPro = isLoggedIn && auth?.subscription_tier === 'pro';
    const isActive = auth?.subscription_status === 'active';

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Ultra Card Connect</strong> is required for all users to access this sidebar. Install it once via HACS — Pro subscribers also get their features synced automatically across every device.</p>
      </div>
      <!-- Integration Status -->
      ${this._renderIntegrationStatus(isIntegrationInstalled, isLoggedIn, isPro)}

      <!-- Banner -->
      ${this._renderBanner(isPro, isLoggedIn)}

      <!-- Authenticated: show account + tools -->
      ${isLoggedIn
        ? html`
            ${this._renderAccount(auth!, isPro, isActive)}
            ${isPro
              ? html`
                  ${this._renderDashboardTools()}
                  ${this._renderProSettings()}
                  ${this._renderProSupport()}
                `
              : this._renderUpgradePrompt()}
            ${this._renderFeaturesGrid()}
          `
        : ''}

      <!-- Not installed / not configured -->
      ${!isIntegrationInstalled ? this._renderInstallCTA() : ''}
      ${isIntegrationInstalled && !isLoggedIn ? this._renderConnectCTA() : ''}

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
    `;
  }

  private _renderIntegrationStatus(installed: boolean, loggedIn: boolean, isPro: boolean) {
    if (loggedIn) {
      const auth = this.auth!;
      return html`
        <div class="integration-status authenticated">
          <div class="status-icon-wrap success">
            <ha-icon icon="mdi:check-circle"></ha-icon>
          </div>
          <div class="status-body">
            <h4>Connected via Ultra Card Connect</h4>
            <p>
              <strong>${auth.display_name || auth.username}${auth.email ? ` · ${auth.email}` : ''}</strong>
            </p>
            <p>Subscription: <strong>${isPro ? 'PRO' : 'Free'}</strong> ${isPro ? '⭐' : ''}</p>
            <p class="status-note">
              Manage in <a href="/config/integrations/integration/ultra_card_pro_cloud" target="_top">Settings → Integrations</a>
            </p>
          </div>
        </div>
      `;
    }

    if (installed) {
      return html`
        <div class="integration-status not-configured">
          <div class="status-icon-wrap warning">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
          </div>
          <div class="status-body">
            <h4>Ultra Card Connect Detected</h4>
            <p>The integration is installed but not configured yet.</p>
            <p class="status-note">Takes 30 seconds to unlock all devices</p>
          </div>
        </div>
      `;
    }

    return nothing;
  }

  private _renderBanner(isPro: boolean, isLoggedIn: boolean) {
    if (!isLoggedIn) {
      return html`
        <div class="pro-banner disconnected">
          <div class="banner-icon-wrap"><ha-icon icon="mdi:star-circle"></ha-icon></div>
          <div class="banner-content">
            <h3>Ultra Card Pro</h3>
            <p>Professional card management and cloud backups</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="pro-banner ${isPro ? 'pro' : 'free'}">
        <div class="banner-icon-wrap"><ha-icon icon="mdi:star-circle"></ha-icon></div>
        <div class="banner-content">
          <h3>
            ${isPro ? html`<ha-icon icon="mdi:star"></ha-icon>` : ''}
            Ultra Card Pro
          </h3>
          <p>${isPro ? 'Thank you for being a Pro member!' : 'Upgrade to unlock all features'}</p>
        </div>
        <div class="banner-badge">
          ${isPro ? html`<ha-icon icon="mdi:check-decagram"></ha-icon>` : ''}
          ${isPro ? 'PRO' : 'FREE'}
        </div>
      </div>
    `;
  }

  private _renderAccount(auth: ProAuthData, isPro: boolean, isActive: boolean) {
    return html`
      <div class="account-card">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:account-circle"></ha-icon></div>
          <div class="header-content">
            <h3>Account</h3>
            <p>Your Ultra Card Pro Cloud account details</p>
          </div>
        </div>
        <div class="account-row">
          <span class="account-label">Display Name</span>
          <span class="account-value">${auth.display_name || auth.username || '—'}</span>
        </div>
        ${auth.email
          ? html`
              <div class="account-row">
                <span class="account-label">Email</span>
                <span class="account-value">${auth.email}</span>
              </div>
            `
          : ''}
        <div class="account-row">
          <span class="account-label">Subscription</span>
          <span class="tier-badge ${isPro ? 'pro' : 'free'}">
            ${isPro ? html`<ha-icon icon="mdi:star" style="--mdc-icon-size:14px"></ha-icon>` : ''}
            ${auth.subscription_tier || 'free'}
          </span>
        </div>
        <div class="account-row">
          <span class="account-label">Status</span>
          <span class="account-value">
            <span class="status-dot ${isActive ? 'active' : 'inactive'}"></span>
            ${auth.subscription_status || '—'}
          </span>
        </div>
        ${auth.subscription_expires != null
          ? html`
              <div class="account-row">
                <span class="account-label">Renews</span>
                <span class="account-value">${this._formatExpiry(auth.subscription_expires)}</span>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderDashboardTools() {
    return html`
      <div class="tools-section">
        <div class="section-header">
          <div class="header-icon" style="background:linear-gradient(135deg,#e91e63,#f06292);">
            <ha-icon icon="mdi:view-dashboard"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Dashboard Pro Tools</h3>
            <p>Manage entire dashboard snapshots</p>
          </div>
        </div>
        <div class="tools-grid">
          <button class="tool-card" @click=${this._handleExportDashboard}>
            <div class="tool-icon export"><ha-icon icon="mdi:export"></ha-icon></div>
            <div class="tool-content"><h4>Export Dashboard</h4><p>Download entire dashboard</p></div>
          </button>
          <button class="tool-card" @click=${this._handleImportDashboard}>
            <div class="tool-icon import"><ha-icon icon="mdi:import"></ha-icon></div>
            <div class="tool-content"><h4>Import Dashboard</h4><p>Load dashboard from file</p></div>
          </button>
          <button class="tool-card" ?disabled=${this._creatingSnapshot} @click=${this._handleCreateSnapshot}>
            <div class="tool-icon snapshot"><ha-icon icon="mdi:camera-plus"></ha-icon></div>
            <div class="tool-content"><h4>${this._creatingSnapshot ? 'Creating…' : 'Create Snapshot'}</h4><p>Manual dashboard snapshot</p></div>
          </button>
          <button class="tool-card" @click=${this._handleViewSnapshots}>
            <div class="tool-icon history"><ha-icon icon="mdi:history"></ha-icon></div>
            <div class="tool-content"><h4>View Snapshots</h4><p>${this._snapshotsListOpen ? 'Hide snapshot list' : 'Browse all snapshots'}</p></div>
          </button>
          <button class="tool-card" @click=${this._handleSnapshotSettings}>
            <div class="tool-icon settings"><ha-icon icon="mdi:cog"></ha-icon></div>
            <div class="tool-content"><h4>Snapshot Settings</h4><p>${this._snapshotSettingsOpen ? 'Close settings' : 'Configure auto-snapshots'}</p></div>
          </button>
        </div>

        ${this._renderSnapshotSummary()}

        ${this._snapshotsListOpen ? this._renderSnapshotsList() : ''}
        ${this._snapshotSettingsOpen ? this._renderSnapshotSettingsPanel() : ''}
      </div>
    `;
  }

  private _renderSnapshotSummary() {
    const list = this._snapshotsList;
    const manualCount = list.filter((s: SnapshotListItem) => s.type === 'manual').length;
    const autoCount = list.filter((s: SnapshotListItem) => s.type === 'auto').length;
    const latest = list.length > 0
      ? list.slice().sort((a, b) => (b.created_timestamp || 0) - (a.created_timestamp || 0))[0]
      : null;
    const latestFormatted = latest
      ? this._formatSnapshotDate(latest.created || latest.date || '')
      : null;

    return html`
      <div class="snapshot-summary">
        <div class="snapshot-summary-row">
          <span class="snapshot-summary-label">
            <ha-icon icon="mdi:camera"></ha-icon>
            Manual
          </span>
          <span class="snapshot-summary-value">${manualCount}</span>
        </div>
        <div class="snapshot-summary-row">
          <span class="snapshot-summary-label">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            Auto
          </span>
          <span class="snapshot-summary-value">${autoCount}</span>
        </div>
        <div class="snapshot-summary-row snapshot-summary-latest">
          <span class="snapshot-summary-label">
            <ha-icon icon="mdi:clock-check-outline"></ha-icon>
            Latest
          </span>
          <span class="snapshot-summary-value">${latestFormatted ?? 'No snapshots yet'}</span>
        </div>
      </div>
    `;
  }

  private _renderSnapshotsList() {
    if (this._snapshotsLoading) {
      return html`<div class="ss-panel" style="text-align:center;padding:24px;"><ha-icon icon="mdi:loading" class="spinning" style="--mdc-icon-size:24px;color:var(--primary-color);"></ha-icon><br/>Loading snapshots…</div>`;
    }
    if (this._snapshotsList.length === 0) {
      return html`<div class="ss-panel" style="text-align:center;"><ha-icon icon="mdi:camera-off" style="--mdc-icon-size:32px;color:var(--secondary-text-color);opacity:0.5;"></ha-icon><p style="margin:8px 0 0;color:var(--secondary-text-color);font-size:13px;">No snapshots yet. Create your first one above.</p></div>`;
    }
    return html`
      <div class="snapshots-list">
        ${this._snapshotsList.map(s => html`
          <div class="snapshot-item">
            <div class="snapshot-icon ${(s as any).type === 'auto' ? 'auto' : 'manual'}">
              <ha-icon icon=${(s as any).type === 'auto' ? 'mdi:clock-outline' : 'mdi:camera'}></ha-icon>
            </div>
            <div class="snapshot-info">
              <h5>${(s as any).type === 'auto' ? 'Auto Snapshot' : 'Manual Snapshot'}</h5>
              <p>${this._formatSnapshotDate((s as any).created || (s as any).date || '')}</p>
            </div>
            <div class="snapshot-meta">
              <span class="card-count">${(s as any).card_count || '?'} cards</span>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private _renderSnapshotSettingsPanel() {
    if (this._ssLoading) {
      return html`<div class="ss-panel" style="text-align:center;padding:24px;"><ha-icon icon="mdi:loading" class="spinning" style="--mdc-icon-size:24px;color:var(--primary-color);"></ha-icon><br/>Loading settings…</div>`;
    }
    const timezones = [
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
    ];
    return html`
      <div class="ss-panel">
        <h4><ha-icon icon="mdi:clock-check-outline"></ha-icon> Auto-Snapshot Schedule</h4>

        <div class="ss-row">
          <span class="ss-label">Enabled</span>
          <ha-switch
            .checked=${this._ssEnabled}
            @change=${(e: Event) => (this._ssEnabled = (e.target as any).checked)}
          ></ha-switch>
        </div>

        <div class="ss-row">
          <span class="ss-label">Time</span>
          <input
            type="time"
            class="ss-input"
            .value=${this._ssTime}
            @input=${(e: InputEvent) => (this._ssTime = (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="ss-row">
          <span class="ss-label">Timezone</span>
          <select
            class="ss-input"
            .value=${this._ssTimezone}
            @change=${(e: Event) => (this._ssTimezone = (e.target as HTMLSelectElement).value)}
          >
            ${timezones.map(tz => html`<option value=${tz} ?selected=${this._ssTimezone === tz}>${tz.replace(/_/g, ' ')}</option>`)}
          </select>
        </div>

        <div class="ss-actions">
          <button class="ss-save-btn" ?disabled=${this._ssLoading} @click=${this._saveSnapshotSettings}>
            <ha-icon icon="mdi:content-save" style="--mdc-icon-size:16px;"></ha-icon>
            Save Settings
          </button>
          <button class="ss-cancel-btn" @click=${() => (this._snapshotSettingsOpen = false)}>
            Cancel
          </button>
        </div>
      </div>
    `;
  }

  private _renderProSettings() {
    return html`
      <div class="tools-section" style="border:2px solid var(--primary-color);">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:cog"></ha-icon></div>
          <div class="header-content">
            <h3>Pro Settings</h3>
            <p>Exclusive settings for Ultra Card Pro subscribers</p>
          </div>
        </div>
        <div class="pro-setting-item">
          <div class="setting-icon-wrap">
            <ha-icon icon="mdi:card-remove-outline"></ha-icon>
          </div>
          <div class="setting-body">
            <h4>Start with Empty Card</h4>
            <p>When adding a new Ultra Card, start with an empty layout instead of the default text and image modules</p>
          </div>
          <div class="setting-toggle">
            <ha-switch
              .checked=${this._getSkipDefaultModules()}
              @change=${this._handleSkipDefaultModulesChange}
            ></ha-switch>
          </div>
        </div>
      </div>
    `;
  }

  private _renderProSupport() {
    return html`
      <div class="tools-section">
        <div class="section-header">
          <div class="header-icon" style="background:#5865F2;">
            <ha-icon icon="mdi:forum"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Pro Support</h3>
            <p>Priority support for Pro subscribers</p>
          </div>
        </div>
        <div class="discord-card">
          <div class="discord-icon">
            <ha-icon icon="mdi:forum"></ha-icon>
          </div>
          <div class="discord-body">
            <h4>Chat with Us on Discord</h4>
            <p>Get direct priority support, share feedback, and connect with the Ultra Card community.</p>
          </div>
          <a
            class="discord-btn"
            href="https://discord.com/users/915385171396689921"
            target="_blank"
            rel="noopener"
          >
            <ha-icon icon="mdi:chat"></ha-icon>
            Message Me
          </a>
        </div>
      </div>
    `;
  }

  private _renderUpgradePrompt() {
    return html`
      <div class="upgrade-card">
        <div class="upgrade-icon">
          <ha-icon icon="mdi:star-shooting"></ha-icon>
        </div>
        <h3>Unlock Pro Features</h3>
        <p>Get export, import, manual backups, dashboard snapshots, and more for all your cards.</p>
        <ul class="features-checklist">
          <li><ha-icon icon="mdi:check"></ha-icon> Export & import full card configs</li>
          <li><ha-icon icon="mdi:check"></ha-icon> 30 manual backups across all cards</li>
          <li><ha-icon icon="mdi:check"></ha-icon> Dashboard snapshots & auto-snapshots</li>
          <li><ha-icon icon="mdi:check"></ha-icon> Name your cards and backups</li>
          <li><ha-icon icon="mdi:check"></ha-icon> Priority support</li>
        </ul>
        <a
          class="upgrade-btn"
          href="https://ultracard.io/pro"
          target="_blank"
          rel="noopener"
        >
          <ha-icon icon="mdi:star"></ha-icon>
          Upgrade to Pro — $4.99/month
        </a>
      </div>
    `;
  }

  private _renderFeaturesGrid() {
    return html`
      <div class="tools-section">
        <div class="section-header">
          <div class="header-icon" style="background:linear-gradient(135deg,#f093fb,#f5576c);">
            <ha-icon icon="mdi:flash"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Pro Features</h3>
            <p>Available when editing your cards</p>
          </div>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon sync"><ha-icon icon="mdi:sync"></ha-icon></div>
            <div class="feature-info"><h4>Cloud Sync</h4><p>Sync card configs across all your devices automatically</p></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon backup"><ha-icon icon="mdi:cloud-upload"></ha-icon></div>
            <div class="feature-info"><h4>Cloud Backups</h4><p>Manual and automatic backups with version history</p></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon presets"><ha-icon icon="mdi:palette"></ha-icon></div>
            <div class="feature-info"><h4>Pro Presets</h4><p>Access exclusive premium presets and templates</p></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon support"><ha-icon icon="mdi:face-agent"></ha-icon></div>
            <div class="feature-info"><h4>Priority Support</h4><p>Get help faster with priority support access</p></div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderInstallCTA() {
    return html`
      <div class="install-card">
        <div class="cta-icon">
          <ha-icon icon="mdi:cloud-lock-outline"></ha-icon>
        </div>
        <h3>Get the Ultra Card Sidebar + Pro Features</h3>
        <p>
          Install <strong>Ultra Card Connect</strong> once — required for all users to access
          the sidebar, plus Pro subscribers get their subscription synced across every device automatically.
        </p>

        <div class="benefits-grid">
          <div class="benefit-item">
            <ha-icon icon="mdi:check-circle"></ha-icon>
            <div>
              <strong>Login Once</strong>
              <span>Works on desktop, mobile, tablet, TV</span>
            </div>
          </div>
          <div class="benefit-item">
            <ha-icon icon="mdi:sync"></ha-icon>
            <div>
              <strong>Auto-Sync</strong>
              <span>No per-device configuration needed</span>
            </div>
          </div>
          <div class="benefit-item">
            <ha-icon icon="mdi:shield-check"></ha-icon>
            <div>
              <strong>Secure & Reliable</strong>
              <span>Server-side auth, automatic token refresh</span>
            </div>
          </div>
          <div class="benefit-item">
            <ha-icon icon="mdi:camera-burst"></ha-icon>
            <div>
              <strong>Dashboard Snapshots</strong>
              <span>Full dashboard backup & restore</span>
            </div>
          </div>
        </div>

        <div class="install-steps">
          <h5>Quick Install (2 minutes):</h5>
          <ol>
            <li>Click <strong>"Install via HACS"</strong> below</li>
            <li>In HACS: Search "<strong>Ultra Card Connect</strong>"</li>
            <li>Click <strong>Download</strong></li>
            <li>Restart Home Assistant</li>
            <li>Go to Settings → Integrations → Add Integration</li>
            <li>Search and add "<strong>Ultra Card Connect</strong>"</li>
            <li>Enter your <strong>ultracard.io</strong> credentials</li>
          </ol>
        </div>

        <div class="cta-buttons">
          <a
            class="cta-btn primary"
            href="https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=ultra-card-connect&category=integration"
            target="_blank"
            rel="noopener"
          >
            <ha-icon icon="mdi:cloud-download"></ha-icon>
            Install via HACS
          </a>
          <a class="cta-btn secondary" href="https://ultracard.io" target="_blank" rel="noopener">
            <ha-icon icon="mdi:cart-outline"></ha-icon>
            Get PRO Subscription
          </a>
        </div>
      </div>

      <!-- Features grid for non-installed users too -->
      ${this._renderFeaturesGrid()}
    `;
  }

  private _renderConnectCTA() {
    return html`
      <div class="install-card">
        <div class="cta-icon">
          <ha-icon icon="mdi:account-key-outline"></ha-icon>
        </div>
        <h3>Connect Your Account</h3>
        <p>
          Go to Settings → Devices &amp; Services → Ultra Card Connect to
          sign in and unlock the sidebar and Pro features.
        </p>
        <div class="cta-buttons">
          <a
            class="cta-btn primary"
            href="/config/integrations/integration/ultra_card_pro_cloud"
            target="_top"
          >
            <ha-icon icon="mdi:cog"></ha-icon>
            Configure Integration
          </a>
          <a class="cta-btn secondary" href="https://ultracard.io" target="_blank" rel="noopener">
            <ha-icon icon="mdi:cart-outline"></ha-icon>
            Get Pro
          </a>
        </div>
      </div>

      ${this._renderFeaturesGrid()}
    `;
  }

  private _getSkipDefaultModules(): boolean {
    try {
      return localStorage.getItem('ultra-card-skip-default-modules') === 'true';
    } catch {
      return false;
    }
  }

  private _handleSkipDefaultModulesChange(e: Event): void {
    const checked = (e.target as any).checked;
    try {
      localStorage.setItem('ultra-card-skip-default-modules', String(checked));
      this._showToast(checked ? 'New cards will start empty' : 'New cards will use default modules');
    } catch { /* ignore */ }
  }

  private _handleExportDashboard(): void {
    try {
      const lovelaceConfig = (this.hass as any)?.panels?.lovelace?.config;
      const dashConfig = {
        views: lovelaceConfig?.views || [],
        dashboard_path: lovelaceConfig?.dashboard_path || 'default',
        exported_at: new Date().toISOString(),
        exported_by: this.auth?.display_name || this.auth?.username || 'Unknown',
      };
      const blob = new Blob([JSON.stringify(dashConfig, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this._showToast('Dashboard exported');
    } catch (err) {
      console.error('Dashboard export failed:', err);
      this._showToast('Failed to export dashboard');
    }
  }

  private _handleImportDashboard(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.views || !Array.isArray(data.views)) {
          this._showToast('Invalid dashboard file');
          return;
        }
        this._showToast(`Read ${data.views.length} views — use HA raw editor to apply`);
      } catch (err) {
        console.error('Dashboard import failed:', err);
        this._showToast('Failed to read dashboard file');
      }
    };
    input.click();
  }

  private _ensureSnapshotInit(): void {
    ucSnapshotService.initialize(this.hass, 'https://ultracard.io');
  }

  private async _handleCreateSnapshot(): Promise<void> {
    this._creatingSnapshot = true;
    try {
      this._ensureSnapshotInit();
      const snapshot = await ucSnapshotService.createSnapshot();
      const count = (snapshot as any)?.snapshot_data?.card_count || 0;
      this._showToast(`Snapshot created (${count} card${count !== 1 ? 's' : ''})`);
      await this._loadSnapshotsList();
    } catch (err: any) {
      console.error('Snapshot failed:', err);
      this._showToast(err?.message || 'Failed to create snapshot');
    } finally {
      this._creatingSnapshot = false;
    }
  }

  private async _handleViewSnapshots(): Promise<void> {
    if (this._snapshotsListOpen) {
      this._snapshotsListOpen = false;
      return;
    }
    this._snapshotsListOpen = true;
    await this._loadSnapshotsList();
  }

  private async _loadSnapshotsList(): Promise<void> {
    this._snapshotsLoading = true;
    try {
      this._ensureSnapshotInit();
      this._snapshotsList = await ucSnapshotService.listSnapshots(20);
    } catch (err: any) {
      console.error('List snapshots failed:', err);
      this._showToast(err?.message || 'Failed to load snapshots');
      this._snapshotsList = [];
    } finally {
      this._snapshotsLoading = false;
      this._snapshotsSummaryLoaded = true;
    }
  }

  private async _handleSnapshotSettings(): Promise<void> {
    if (this._snapshotSettingsOpen) {
      this._snapshotSettingsOpen = false;
      return;
    }
    this._ssLoading = true;
    this._snapshotSettingsOpen = true;
    try {
      this._ensureSnapshotInit();
      const settings = await ucSnapshotService.getSettings();
      this._ssEnabled = settings.enabled;
      this._ssTime = settings.time || '03:00';
      this._ssTimezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      this._showToast(err?.message || 'Failed to load snapshot settings');
    } finally {
      this._ssLoading = false;
    }
  }

  private async _saveSnapshotSettings(): Promise<void> {
    this._ssLoading = true;
    try {
      this._ensureSnapshotInit();
      await ucSnapshotService.updateSettings({
        enabled: this._ssEnabled,
        time: this._ssTime,
        timezone: this._ssTimezone,
      });
      if (this._ssEnabled) {
        ucSnapshotSchedulerService.start();
      } else {
        ucSnapshotSchedulerService.stop();
      }
      this._showToast('Snapshot settings saved');
      this._snapshotSettingsOpen = false;
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      this._showToast(err?.message || 'Failed to save settings');
    } finally {
      this._ssLoading = false;
    }
  }

  private _formatSnapshotDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  }
}
