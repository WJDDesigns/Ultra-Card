/**
 * Control helpers for Bambu Lab printers (button / select / light / fan / number).
 */

import type { HomeAssistant } from 'custom-card-helpers';
import type { PrinterSnapshot, PrinterFan } from '../printer-shared/printer-state';
import type { ControlHandlers } from '../printer-shared/widgets';

export function callEntityService(
  hass: HomeAssistant,
  entityId: string | undefined,
  extra?: Record<string, unknown>
): void {
  if (!entityId || !hass?.callService) return;
  const domain = entityId.split('.')[0];
  try {
    if (domain === 'button') {
      hass.callService('button', 'press', { entity_id: entityId });
    } else if (domain === 'switch' || domain === 'input_boolean') {
      hass.callService(domain, 'toggle', { entity_id: entityId });
    } else if (domain === 'light') {
      hass.callService('light', 'toggle', { entity_id: entityId });
    } else if (domain === 'script') {
      hass.callService('script', 'turn_on', { entity_id: entityId });
    } else if (domain === 'select' && extra?.option != null) {
      hass.callService('select', 'select_option', {
        entity_id: entityId,
        option: extra.option,
      });
    } else if (domain === 'number' && extra?.value != null) {
      hass.callService('number', 'set_value', {
        entity_id: entityId,
        value: extra.value,
      });
    } else if (domain === 'fan' && extra?.percentage != null) {
      hass.callService('fan', 'set_percentage', {
        entity_id: entityId,
        percentage: extra.percentage,
      });
    }
  } catch {
    /* ignore */
  }
}

export function buildBambuHandlers(
  hass: HomeAssistant,
  snap: PrinterSnapshot
): ControlHandlers {
  return {
    onPause: () => callEntityService(hass, snap.controls.pauseEntityId),
    onResume: () => callEntityService(hass, snap.controls.resumeEntityId),
    onStop: () => callEntityService(hass, snap.controls.stopEntityId),
    onLight: () => callEntityService(hass, snap.controls.lightEntityId),
    onSpeed: (profile: string) =>
      callEntityService(hass, snap.controls.speedEntityId, { option: profile }),
    onFan: (fan: PrinterFan, percent: number) =>
      callEntityService(hass, fan.entityId, { percentage: percent }),
    onNozzleTarget: (temp: number) =>
      callEntityService(hass, snap.controls.nozzleTargetEntityId, { value: temp }),
    onBedTarget: (temp: number) =>
      callEntityService(hass, snap.controls.bedTargetEntityId, { value: temp }),
    onMoreInfo: (entityId: string) => {
      const ev = new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId },
      });
      document.body.dispatchEvent(ev);
    },
  };
}
