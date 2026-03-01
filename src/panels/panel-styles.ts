/**
 * Shared CSS for Ultra Card Hub panel.
 * Uses Home Assistant CSS custom properties for native theming.
 */
import { css } from 'lit';

export const panelStyles = css`
  :host {
    display: block;
    height: 100%;
    background: var(--primary-background-color);
    color: var(--primary-text-color);
  }

  .hub-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
  }

  .hub-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px 12px;
    gap: 12px;
  }

  .hub-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 400;
    color: var(--primary-text-color);
  }

  .hub-account-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--ha-card-background, var(--card-background-color));
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s ease;
    flex-shrink: 0;
  }

  .hub-account-chip:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }

  .hub-account-chip ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
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
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background: transparent;
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
  }

  .hub-sign-in-btn:hover {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
  }

  .hub-sign-in-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  .hub-tabs {
    flex-shrink: 0;
  }

  .hub-content {
    flex: 1;
    overflow: auto;
    min-height: 0;
    padding: 24px;
  }

  /* Section cards (used by pro tab, etc.) */
  .hub-section {
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
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
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
  }

  .empty-state-icon ha-icon {
    --mdc-icon-size: 40px;
    color: var(--primary-color);
    opacity: 0.6;
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

  @media (max-width: 600px) {
    .grid-cards {
      grid-template-columns: 1fr;
    }
    .hub-content {
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
    margin-bottom: 20px;
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
    border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
    border-radius: 10px;
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
    background: rgba(0, 0, 0, 0.06);
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
