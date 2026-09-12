import { PRINTER_SHARED_STYLES } from '../printer-shared/styles';

export const BAMBU_STYLES = `
  ${PRINTER_SHARED_STYLES}

  .uc-bambu-root {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .uc-bambu-printer-view {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .uc-bambu-printer-view .uc-bambu-stage { margin-bottom: 6px; }

  .uc-bambu-ams {
    position: relative;
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-bambu-ams .ams-body {
    display: grid;
    grid-template-columns: repeat(var(--ams-slots, 4), minmax(0, 1fr));
    gap: 8px;
  }
  .uc-bambu-ams .ams-name {
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.6;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 40px; /* keep clear of humidity badge */
  }
  .uc-bambu-ams.single { padding: 10px 14px; }
  .uc-bambu-ams.single .ams-name { padding-right: 0; }

  /* Multiple units */
  .uc-bambu-ams-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .uc-bambu-ams-group.layout-grid {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: stretch;
  }
  .uc-bambu-ams-group.layout-grid > .uc-bambu-ams { flex: 1 1 200px; min-width: 0; }
  .uc-bambu-ams-group.layout-grid > .uc-bambu-ams.single { flex: 0 1 96px; }
  .uc-bambu-ams-group.layout-strip {
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-bambu-ams-group.layout-strip .uc-printer-ams-strip { justify-content: space-around; }
  .uc-bambu-ams-group.layout-strip .strip-divider {
    width: 1px;
    align-self: stretch;
    background: var(--uc-printer-border, var(--divider-color));
    margin: 0 2px;
  }
  .uc-bambu-ams .ams-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 4px;
    border-radius: 8px;
    border: 1px solid transparent;
  }
  .uc-bambu-ams .ams-slot.is-clickable:hover {
    background: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
  }
  .uc-bambu-ams .ams-slot.active {
    border-color: var(--success-color, #4caf50);
    background: color-mix(in srgb, var(--success-color, #4caf50) 12%, transparent);
  }
  .uc-bambu-ams .spool {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--c);
    display: grid;
    place-items: center;
    box-shadow: inset 0 0 0 2px rgba(0,0,0,0.25);
  }
  .uc-bambu-ams .ams-slot.active .spool {
    box-shadow: 0 0 10px var(--c), inset 0 0 0 2px rgba(0,0,0,0.25);
  }
  /* ring + hub stack in the same grid cell so the hub is dead-center */
  .uc-bambu-ams .spool > * { grid-area: 1 / 1; }
  .uc-bambu-ams .spool-ring {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
  }
  .uc-bambu-ams .spool-inner {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--uc-printer-hole, var(--uc-printer-surface-2, var(--uc-pane-bg, var(--card-background-color, #1a1a1a))));
  }
  .uc-bambu-ams .mat {
    font-size: 0.65rem;
    opacity: 0.85;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .uc-bambu-ams .remain { font-size: 0.6rem; opacity: 0.65; }
  .uc-bambu-ams .slot-num { opacity: 0.4; font-size: 0.75rem; }
  .uc-bambu-ams .ams-hum {
    position: absolute;
    top: 8px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.75rem;
    opacity: 0.8;
  }
  .uc-bambu-ams .ams-hum ha-icon { --mdc-icon-size: 14px; }

  .uc-bambu-farm {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
    gap: 12px;
  }
  .uc-bambu-farm.single { grid-template-columns: minmax(0, 1fr); }
  .uc-bambu-farm-card {
    min-width: 0;
    padding: 10px;
    border-radius: 12px;
    background: var(--uc-printer-surface-2, var(--secondary-background-color));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
  }
  .uc-bambu-farm-card .farm-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .uc-bambu-farm-card .farm-name {
    font-weight: 700;
    font-size: 0.9rem;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .uc-bambu-farm-card .farm-stage {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  .uc-bambu-farm-card .farm-stage .uc-bambu-stage { max-width: 100%; }
  .uc-bambu-farm-card .farm-temps {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .uc-bambu-farm-card .farm-temps > span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--uc-printer-surface, rgba(0,0,0,0.25));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-bambu-farm-card .farm-temps ha-icon { --mdc-icon-size: 14px; }
  .uc-bambu-farm-card .farm-spools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 10px;
    background: var(--uc-printer-surface, rgba(0,0,0,0.25));
    border: 1px solid var(--uc-printer-border, var(--divider-color));
  }
  .uc-bambu-farm-card .farm-spools .strip-divider {
    width: 1px;
    height: 20px;
    background: var(--uc-printer-border, var(--divider-color));
    margin: 0 2px;
  }
  .uc-bambu-farm-card .farm-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    opacity: 0.8;
  }
  .uc-bambu-farm-card .farm-hms {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: var(--error-color, #f44336);
    font-weight: 600;
  }
  .uc-bambu-farm-card .farm-hms ha-icon { --mdc-icon-size: 14px; }

  .uc-bambu-compact {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .uc-bambu-compact .compact-main { flex: 1; min-width: 120px; }

  .uc-bambu-dashboard {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .uc-bambu-dashboard .dash-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px;
    align-items: stretch;
  }
  .uc-bambu-dashboard .dash-grid > * { min-width: 0; }
  .uc-bambu-dashboard .dash-grid.single { grid-template-columns: minmax(0, 1fr); }
  .uc-bambu-dashboard .dash-grid .uc-printer-camera { height: 100%; }
  @media (max-width: 420px) {
    .uc-bambu-dashboard .dash-grid { grid-template-columns: minmax(0, 1fr); }
    .uc-bambu-dashboard .dash-grid .uc-printer-camera.fill {
      aspect-ratio: 16 / 9;
      height: auto;
    }
  }

  .uc-bambu-setup {
    padding: 10px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--warning-color, #ff9800) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--warning-color, #ff9800) 35%, transparent);
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .uc-bambu-setup.info {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    border-color: color-mix(in srgb, var(--primary-color) 35%, transparent);
  }
  .uc-bambu-setup .hint-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .uc-bambu-setup button {
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    border-radius: 8px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .uc-bambu-empty {
    padding: 24px 16px;
    text-align: center;
    opacity: 0.75;
    font-size: 0.9rem;
  }
`;
