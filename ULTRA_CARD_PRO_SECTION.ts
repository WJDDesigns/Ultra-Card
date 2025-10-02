/**
 * ULTRA CARD PRO SECTION - COMPLETE REPLACEMENT
 * 
 * This file contains the complete replacement for the cloud backup section
 * in ultra-card-editor.ts. Replace the entire _renderCloudSyncSection method
 * with the code in this file.
 * 
 * Features:
 * - Branded Ultra Card Pro banner (Free/Pro variants)
 * - Card Name setting for backup identification
 * - Export/Import/Backup action buttons (Pro only)
 * - Manual backup creation (30 total across all cards)
 * - View All Backups modal
 * - Professional, modern UI
 */

/**
 * Render Ultra Card Pro section
 */
private _renderCloudSyncSection(lang: string): TemplateResult {
  const isPro = this._cloudUser?.subscription?.tier === 'pro';
  const isLoggedIn = !!this._cloudUser;

  return html`
    <div class="settings-section ultra-card-pro-section">
      <!-- ULTRA CARD PRO BRANDED BANNER -->
      ${this._renderProBanner(lang, isPro, isLoggedIn)}

      <!-- LOGIN/LOGOUT SECTION -->
      ${this._renderAuthSection(lang, isLoggedIn, isPro)}

      <!-- CARD NAME SETTING (Always visible when logged in) -->
      ${isLoggedIn ? this._renderCardNameSetting(lang) : ''}

      <!-- EXPORT/IMPORT/BACKUP ACTIONS (Pro features) -->
      ${isLoggedIn ? this._renderProActions(lang, isPro) : ''}

      <!-- VIEW ALL BACKUPS BUTTON -->
      ${isLoggedIn ? this._renderViewBackupsButton(lang) : ''}

      <!-- MODALS -->
      ${this._showBackupHistory && this._cloudUser
        ? html`
            <uc-backup-history-modal
              .open="${this._showBackupHistory}"
              .hass="${this.hass}"
              .subscription="${this._cloudUser.subscription!}"
              @close-modal="${() => (this._showBackupHistory = false)}"
              @backup-restored="${this._handleBackupRestored}"
            ></uc-backup-history-modal>
          `
        : ''}
      ${this._showManualBackup && this._cloudUser
        ? html`
            <uc-manual-backup-dialog
              .open="${this._showManualBackup}"
              .config="${this.config}"
              @dialog-closed="${() => (this._showManualBackup = false)}"
              @backup-created="${this._handleManualBackupCreated}"
            ></uc-manual-backup-dialog>
          `
        : ''}
    </div>
  `;
}

/**
 * Render Pro Banner (Free or Pro variant)
 */
private _renderProBanner(lang: string, isPro: boolean, isLoggedIn: boolean): TemplateResult {
  if (!isLoggedIn) {
    // Show minimal banner for logged out users
    return html`
      <div class="ultra-pro-banner ultra-pro-banner-minimal">
        <div class="banner-icon">
          <ha-icon icon="mdi:star-circle"></ha-icon>
        </div>
        <div class="banner-content">
          <h3>${localize('editor.ultra_card_pro.title', lang, 'Ultra Card Pro')}</h3>
          <p>${localize('editor.ultra_card_pro.free_banner_subtitle', lang, 'Professional card management and cloud backups')}</p>
        </div>
      </div>
    `;
  }

  if (isPro) {
    // PRO USER BANNER
    return html`
      <div class="ultra-pro-banner ultra-pro-banner-pro">
        <div class="banner-gradient"></div>
        <div class="banner-icon">
          <ha-icon icon="mdi:star-circle"></ha-icon>
        </div>
        <div class="banner-content">
          <h3>
            <ha-icon icon="mdi:star"></ha-icon>
            ${localize('editor.ultra_card_pro.pro_banner_title', lang, 'Ultra Card Pro')}
          </h3>
          <p>${localize('editor.ultra_card_pro.pro_banner_subtitle', lang, 'Thank you for being a Pro member!')}</p>
        </div>
        <div class="pro-badge">
          <ha-icon icon="mdi:check-decagram"></ha-icon>
          PRO
        </div>
      </div>
    `;
  }

  // FREE USER BANNER
  return html`
    <div class="ultra-pro-banner ultra-pro-banner-free">
      <div class="banner-icon">
        <ha-icon icon="mdi:star-circle-outline"></ha-icon>
      </div>
      <div class="banner-content">
        <h3>${localize('editor.ultra_card_pro.free_banner_title', lang, 'Ultra Card Pro')}</h3>
        <p>${localize('editor.ultra_card_pro.free_banner_subtitle', lang, 'Professional card management and cloud backups')}</p>
      </div>
      <div class="free-badge">FREE</div>
    </div>
  `;
}

/**
 * Render Auth Section (Login or Logout)
 */
private _renderAuthSection(lang: string, isLoggedIn: boolean, isPro: boolean): TemplateResult {
  if (!isLoggedIn) {
    return html`
      <div class="ultra-pro-auth-section">
        ${!this._showLoginForm
          ? html`
              <div class="feature-showcase">
                <h4>${localize('editor.ultra_card_pro.features_title', lang, 'What You Get')}</h4>
                <div class="features-grid">
                  <div class="feature-item">
                    <ha-icon icon="mdi:cloud-upload"></ha-icon>
                    <span>Auto cloud backups</span>
                  </div>
                  <div class="feature-item">
                    <ha-icon icon="mdi:bookmark-multiple"></ha-icon>
                    <span>Manual backups (Pro)</span>
                  </div>
                  <div class="feature-item">
                    <ha-icon icon="mdi:export"></ha-icon>
                    <span>Export configs (Pro)</span>
                  </div>
                  <div class="feature-item">
                    <ha-icon icon="mdi:import"></ha-icon>
                    <span>Import configs (Pro)</span>
                  </div>
                </div>
                <button class="ultra-btn ultra-btn-primary" @click="${() => (this._showLoginForm = true)}">
                  <ha-icon icon="mdi:login"></ha-icon>
                  Sign In to Get Started
                </button>
                <p class="auth-note">
                  Don't have an account?
                  <a href="https://ultracard.io/register" target="_blank" rel="noopener">Create one free</a>
                </p>
              </div>
            `
          : this._renderLoginForm(lang)}
      </div>
    `;
  }

  // Logged in - show user info with logout
  return html`
    <div class="ultra-pro-user-section">
      <div class="user-card">
        <div class="user-info">
          ${this._cloudUser?.avatar
            ? html`<img src="${this._cloudUser.avatar}" alt="Avatar" class="user-avatar" />`
            : html`<ha-icon icon="mdi:account-circle" class="user-avatar-icon"></ha-icon>`}
          <div class="user-details">
            <div class="user-name">${this._cloudUser?.displayName}</div>
            <div class="user-email">${this._cloudUser?.email}</div>
          </div>
        </div>
        <button class="ultra-btn ultra-btn-secondary" @click="${this._handleLogout}">
          <ha-icon icon="mdi:logout"></ha-icon>
          Logout
        </button>
      </div>
    </div>
  `;
}

/**
 * Render Card Name Setting
 */
private _renderCardNameSetting(lang: string): TemplateResult {
  return html`
    <div class="ultra-pro-card-name">
      <div class="setting-header">
        <label for="card-name">
          <ha-icon icon="mdi:card-text"></ha-icon>
          ${localize('editor.ultra_card_pro.card_name', lang, 'Card Name')}
        </label>
        <p class="setting-description">
          ${localize('editor.ultra_card_pro.card_name_desc', lang, 'Give this card a name to identify it in your backups')}
        </p>
      </div>
      <ha-textfield
        id="card-name"
        .value="${this.config.card_name || ''}"
        @input="${this._handleCardNameChange}"
        placeholder="${localize('editor.ultra_card_pro.card_name_placeholder', lang, 'My Ultra Card')}"
        maxlength="100"
      ></ha-textfield>
    </div>
  `;
}

/**
 * Render Pro Actions (Export/Import/Backup)
 */
private _renderProActions(lang: string, isPro: boolean): TemplateResult {
  if (!isPro) {
    // Show upgrade prompt for free users
    return html`
      <div class="ultra-pro-upgrade">
        <div class="upgrade-content">
          <ha-icon icon="mdi:star-box"></ha-icon>
          <div class="upgrade-text">
            <h4>${localize('editor.ultra_card_pro.upgrade_title', lang, 'Unlock Pro Features')}</h4>
            <p>${localize('editor.ultra_card_pro.upgrade_subtitle', lang, 'Get export, import, and manual backups for all your cards')}</p>
            <ul class="upgrade-features">
              <li><ha-icon icon="mdi:check"></ha-icon> ${localize('editor.ultra_card_pro.features.export', lang, 'Export full card configs')}</li>
              <li><ha-icon icon="mdi:check"></ha-icon> ${localize('editor.ultra_card_pro.features.import', lang, 'Import card configs')}</li>
              <li><ha-icon icon="mdi:check"></ha-icon> ${localize('editor.ultra_card_pro.features.backups', lang, '30 manual backups across all cards')}</li>
              <li><ha-icon icon="mdi:check"></ha-icon> ${localize('editor.ultra_card_pro.features.naming', lang, 'Name your cards and backups')}</li>
              <li><ha-icon icon="mdi:check"></ha-icon> ${localize('editor.ultra_card_pro.features.support', lang, 'Priority support')}</li>
            </ul>
          </div>
        </div>
        <button class="ultra-btn ultra-btn-upgrade" @click="${() => window.open('https://ultracard.io/pro', '_blank')}">
          <ha-icon icon="mdi:star"></ha-icon>
          ${localize('editor.ultra_card_pro.upgrade_button', lang, 'Upgrade to Pro - $4.99/month')}
        </button>
      </div>
    `;
  }

  // PRO USER - Show action buttons
  const subscription = this._cloudUser!.subscription!;
  const backupCount = subscription.snapshot_count || 0;
  const backupLimit = subscription.snapshot_limit || 30;
  const canCreateBackup = backupCount < backupLimit;

  return html`
    <div class="ultra-pro-actions">
      <div class="actions-header">
        <h4>
          <ha-icon icon="mdi:tools"></ha-icon>
          Pro Tools
        </h4>
        ${!canCreateBackup
          ? html`
              <div class="limit-warning">
                <ha-icon icon="mdi:alert"></ha-icon>
                Backup limit reached (${backupCount}/${backupLimit})
              </div>
            `
          : html`
              <div class="backup-count">
                <ha-icon icon="mdi:bookmark-multiple"></ha-icon>
                ${backupCount} / ${backupLimit} backups
              </div>
            `}
      </div>
      <div class="actions-grid">
        <button class="action-card" @click="${this._handleExport}">
          <div class="action-icon export">
            <ha-icon icon="mdi:export"></ha-icon>
          </div>
          <div class="action-label">
            ${localize('editor.ultra_card_pro.export_card', lang, 'Export Card')}
          </div>
        </button>
        <button class="action-card" @click="${this._handleImport}">
          <div class="action-icon import">
            <ha-icon icon="mdi:import"></ha-icon>
          </div>
          <div class="action-label">
            ${localize('editor.ultra_card_pro.import_card', lang, 'Import Card')}
          </div>
        </button>
        <button 
          class="action-card" 
          @click="${this._handleCreateBackup}"
          ?disabled="${!canCreateBackup}"
        >
          <div class="action-icon backup">
            <ha-icon icon="mdi:bookmark-plus"></ha-icon>
          </div>
          <div class="action-label">
            ${localize('editor.ultra_card_pro.backup_card', lang, 'Create Backup')}
          </div>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render View Backups Button
 */
private _renderViewBackupsButton(lang: string): TemplateResult {
  return html`
    <div class="ultra-pro-view-backups">
      <button class="ultra-btn ultra-btn-view-backups" @click="${() => (this._showBackupHistory = true)}">
        <ha-icon icon="mdi:history"></ha-icon>
        ${localize('editor.ultra_card_pro.view_backups', lang, 'View All Backups')}
      </button>
    </div>
  `;
}

/**
 * EVENT HANDLERS
 */

private _handleCardNameChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const newConfig = { ...this.config, card_name: input.value };
  this._updateConfig(newConfig);
}

private _handleExport() {
  try {
    const configJson = JSON.stringify(this.config, null, 2);
    const cardName = this.config.card_name || 'ultra-card';
    const filename = `${cardName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.json`;
    
    // Create download
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const lang = 'en';
    alert(localize('editor.ultra_card_pro.export_success', lang, 'Card configuration exported!'));
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export card configuration');
  }
}

private _handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e: Event) => {
    try {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const text = await file.text();
      const config = JSON.parse(text);
      
      // Validate it's an Ultra Card config
      if (config.type !== 'custom:ultra-card' || !config.layout) {
        throw new Error('Invalid Ultra Card configuration file');
      }
      
      if (confirm('Import this card configuration? Your current config will be replaced.')) {
        this._updateConfig(config);
        const lang = 'en';
        alert(localize('editor.ultra_card_pro.import_success', lang, 'Card configuration imported!'));
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import card configuration: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  
  input.click();
}

private _handleCreateBackup() {
  this._showManualBackup = true;
}

private _handleManualBackupCreated(e: CustomEvent) {
  const lang = 'en';
  const { name } = e.detail;
  
  // Refresh subscription to update count
  if (this._cloudUser) {
    ucCloudBackupService.getSubscription().then(subscription => {
      if (this._cloudUser) {
        this._cloudUser.subscription = subscription;
        this.requestUpdate();
      }
    });
  }
  
  alert(localize('editor.ultra_card_pro.backup_created', lang, 'Backup created successfully!') + `\n\n"${name}"`);
}

