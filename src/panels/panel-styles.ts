/**
 * Shared CSS for Ultra Card Hub panel.
 * Uses Home Assistant CSS custom properties for native theming.
 */
import { css } from 'lit';

export const panelStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    /* Prevent the host itself from scrolling — only .hub-content should scroll */
    overflow: hidden;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
    box-sizing: border-box;

    /* Hub design tokens — every tab reads these so surfaces, radii and
       borders stay consistent. All fall back to HA theme variables. */
    --uc-hub-primary-rgb: var(--rgb-primary-color, 3, 169, 244);
    --uc-hub-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --uc-hub-surface-2: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
    --uc-hub-border: var(--divider-color, rgba(0, 0, 0, 0.08));
    --uc-hub-radius-lg: var(--ha-card-border-radius, 14px);
    --uc-hub-radius-md: 10px;
    --uc-hub-radius-sm: 8px;
    --uc-hub-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --uc-hub-shadow-md: 0 6px 20px rgba(0, 0, 0, 0.08);
    --uc-hub-content-max: 1440px;
    --uc-hub-focus-ring: 0 0 0 3px rgba(var(--uc-hub-primary-rgb), 0.35);
  }

  :where(button, [role='tab'], a, input, select, textarea):focus-visible {
    outline: none;
    box-shadow: var(--uc-hub-focus-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .hub-container {
    display: flex;
    flex-direction: column;
    /* Must fill host and be bounded so inner scroll works */
    flex: 1;
    min-height: 0;
    /* Clip any overflow so the page itself never scrolls */
    overflow: hidden;
    box-sizing: border-box;
  }

  .hub-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px 10px;
    gap: 12px;
    min-height: 60px;
    box-sizing: border-box;
    /* Prevent header from ever growing or scrolling away */
    overflow: hidden;
    background: var(--uc-hub-surface);
  }

  .hub-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .hub-brand-mark {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: linear-gradient(
      135deg,
      var(--primary-color),
      var(--accent-color, var(--primary-color))
    );
    box-shadow: 0 2px 6px rgba(var(--uc-hub-primary-rgb), 0.3);
  }

  .hub-brand-mark ha-icon {
    --mdc-icon-size: 20px;
  }

  .hub-brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.15;
  }

  .hub-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--primary-text-color);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hub-brand-sub {
    font-size: 12px;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  @media (max-width: 870px) {
    .hub-header {
      padding: 8px 12px 8px 8px;
      gap: 8px;
      min-height: 56px;
    }
    .hub-header h1 {
      font-size: 18px;
    }
    .hub-brand-mark {
      width: 32px;
      height: 32px;
      border-radius: 9px;
    }
    .hub-brand-sub {
      display: none;
    }
  }

  .hub-account-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 8px;
    border-radius: 999px;
    background: var(--uc-hub-surface-2);
    border: 1px solid var(--uc-hub-border);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    flex-shrink: 0;
    max-width: 260px;
  }

  .hub-account-chip span:first-of-type {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hub-account-chip:hover {
    border-color: rgba(var(--uc-hub-primary-rgb), 0.5);
    background: rgba(var(--uc-hub-primary-rgb), 0.06);
  }

  .hub-account-chip ha-icon {
    --mdc-icon-size: 20px;
    color: var(--primary-color);
  }

  .hub-tier-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .hub-tier-badge.pro {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
    color: var(--primary-color);
  }

  .hub-tier-badge.free {
    background: rgba(158, 158, 158, 0.15);
    color: var(--secondary-text-color);
  }

  .hub-sign-in-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    border: none;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.15s ease;
    flex-shrink: 0;
  }

  .hub-sign-in-btn:hover {
    filter: brightness(1.08);
  }

  .hub-sign-in-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  .hub-tabs {
    flex-shrink: 0;
  }

  .hub-content {
    flex: 1;
    min-height: 0;
    /* Only this region scrolls — vertically only */
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 24px;
    box-sizing: border-box;
  }

  /* Centre content on very wide screens so cards don't stretch edge to edge. */
  .hub-page {
    width: 100%;
    max-width: var(--uc-hub-content-max);
    margin: 0 auto;
  }

  /* Shared buttons */
  .hub-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--uc-hub-radius-sm);
    border: 1px solid var(--uc-hub-border);
    background: var(--uc-hub-surface);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease,
      filter 0.15s ease;
  }

  .hub-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  .hub-btn:hover:not(:disabled) {
    border-color: rgba(var(--uc-hub-primary-rgb), 0.5);
    color: var(--primary-color);
  }

  .hub-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .hub-btn--primary {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .hub-btn--primary:hover:not(:disabled) {
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
    filter: brightness(1.08);
  }

  .hub-btn--outline {
    background: transparent;
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .hub-btn--outline:hover:not(:disabled) {
    background: rgba(var(--uc-hub-primary-rgb), 0.08);
  }

  .hub-btn--ghost {
    background: transparent;
    border-color: transparent;
    color: var(--secondary-text-color);
  }

  .hub-btn--ghost:hover:not(:disabled) {
    background: var(--uc-hub-surface-2);
    border-color: transparent;
    color: var(--primary-text-color);
  }

  .hub-btn--sm {
    padding: 5px 10px;
    font-size: 12px;
  }

  .hub-btn .spin {
    animation: hubSpin 1s linear infinite;
  }

  /* Sync banner — shared by Favorites, Colors and Variables */
  .sync-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--uc-hub-radius-md);
    margin-bottom: 16px;
    font-size: 13px;
    background: var(--uc-hub-surface);
    border: 1px solid var(--uc-hub-border);
  }

  .sync-banner ha-icon {
    --mdc-icon-size: 20px;
    flex-shrink: 0;
    color: var(--secondary-text-color);
  }

  .sync-banner-guest {
    background: rgba(var(--uc-hub-primary-rgb), 0.06);
    border-color: rgba(var(--uc-hub-primary-rgb), 0.18);
  }

  .sync-banner-guest ha-icon {
    color: var(--primary-color);
  }

  .sync-banner-active {
    background: rgba(76, 175, 80, 0.07);
    border-color: rgba(76, 175, 80, 0.22);
  }

  .sync-banner-active ha-icon {
    color: var(--success-color, #4caf50);
  }

  .sync-banner-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .sync-banner-body strong {
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .sync-banner-body span {
    color: var(--secondary-text-color);
    font-size: 12px;
    line-height: 1.4;
  }

  .sync-banner-btn {
    flex-shrink: 0;
    padding: 6px 12px;
    border-radius: var(--uc-hub-radius-sm);
    border: 1px solid var(--primary-color);
    background: none;
    color: var(--primary-color);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .sync-banner-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .sync-banner-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .sync-banner {
      flex-wrap: wrap;
    }
    .sync-banner-btn {
      margin-left: 32px;
    }
  }

  /* Page-level toolbar (search + filters + actions) */
  .hub-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  .hub-search {
    flex: 1;
    min-width: 200px;
    max-width: 360px;
    position: relative;
  }

  .hub-search input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1px solid var(--uc-hub-border);
    border-radius: var(--uc-hub-radius-md);
    background: var(--uc-hub-surface);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .hub-search input:focus {
    border-color: var(--primary-color);
    box-shadow: var(--uc-hub-focus-ring);
  }

  .hub-search ha-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
    pointer-events: none;
  }

  /* Stat tiles */
  .stat-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .stat-tile {
    padding: 14px 16px;
    background: var(--uc-hub-surface-2);
    border: 1px solid var(--uc-hub-border);
    border-radius: var(--uc-hub-radius-md);
  }

  .stat-tile-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }

  .stat-tile-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--secondary-text-color);
  }

  .stat-tile-value.ok {
    color: var(--success-color, #4caf50);
  }

  .stat-tile-value.bad {
    color: var(--error-color, #f44336);
  }

  @keyframes hubSpin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Shared loading placeholder (centered spinner + label) */
  .hub-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
    color: var(--secondary-text-color);
    font-size: 14px;
    text-align: center;
  }

  .hub-loading ha-icon {
    --mdc-icon-size: 32px;
    color: var(--primary-color);
    animation: hubSpin 1s linear infinite;
  }

  /* Section cards (used by pro tab, etc.) */
  .hub-section {
    background: var(--uc-hub-surface);
    border-radius: var(--uc-hub-radius-lg);
    border: 1px solid var(--uc-hub-border);
    box-shadow: var(--uc-hub-shadow-sm);
    padding: 24px;
    margin-bottom: 20px;
  }

  .hub-section:last-child {
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  .header-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color, var(--primary-color)));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .header-icon ha-icon {
    --mdc-icon-size: 24px;
    color: white;
  }

  .header-content h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .header-content p {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: var(--secondary-text-color);
  }

  /* Empty states */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 24px;
    color: var(--secondary-text-color);
  }

  .empty-state-icon {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: rgba(var(--uc-hub-primary-rgb), 0.1);
    border: 1px solid rgba(var(--uc-hub-primary-rgb), 0.18);
  }

  .empty-state-icon ha-icon {
    --mdc-icon-size: 36px;
    color: var(--primary-color);
  }

  .empty-state .hub-btn {
    margin-top: 18px;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    max-width: 400px;
    color: var(--secondary-text-color);
  }

  .empty-state .empty-hint {
    margin-top: 6px;
    font-size: 12px;
    opacity: 0.7;
  }

  /* Grids */
  .grid-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  @media (max-width: 870px) {
    .grid-cards {
      grid-template-columns: 1fr;
    }
    .hub-content {
      padding: 12px;
    }
    .hub-section {
      padding: 16px;
    }
  }

  /* Action buttons (small icon buttons) */
  .action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    border-radius: 8px;
    color: var(--secondary-text-color);
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .action-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
  }

  .action-btn.delete:hover {
    border-color: var(--error-color, #f44336);
    color: var(--error-color, #f44336);
    background: rgba(244, 67, 54, 0.08);
  }

  .action-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Toast notification */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--primary-text-color);
    color: var(--primary-background-color);
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    z-index: 999;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* Section title standalone */
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color);
    margin: 0 0 16px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Filter chips */
  .filter-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--ha-card-background, var(--card-background-color));
    color: var(--secondary-text-color);
    transition: all 0.2s ease;
    user-select: none;
  }

  .filter-chip:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .filter-chip.active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }

  .filter-chip ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Tab intro blurb (what this tab is for) */
  .hub-tab-blurb {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    margin-bottom: 16px;
    background: rgba(var(--uc-hub-primary-rgb), 0.06);
    border: 1px solid rgba(var(--uc-hub-primary-rgb), 0.15);
    border-radius: var(--uc-hub-radius-md);
    font-size: 13px;
    color: var(--secondary-text-color);
    line-height: 1.45;
  }

  .hub-tab-blurb ha-icon {
    --mdc-icon-size: 20px;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .hub-tab-blurb p {
    margin: 0;
  }

  .hub-tab-blurb strong {
    color: var(--primary-text-color);
  }

  .hub-tab-blurb code {
    background: var(--uc-hub-surface-2);
    border: 1px solid var(--uc-hub-border);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-family: var(--code-font-family, 'SF Mono', 'Fira Code', monospace);
  }

  /* Animations */
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
