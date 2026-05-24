import { describe, it, expect, vi } from 'vitest';
import { UltraLinkComponent, TapActionConfig } from './ultra-link';

function makeHass() {
  return {
    callService: vi.fn(),
    states: {},
    locale: { language: 'en' },
  } as any;
}

describe('UltraLinkComponent entity-bound action normalization', () => {
  it('uses the current icon entity for stale copied more-info actions', async () => {
    const hass = makeHass();
    const dispatchEvent = vi.fn();
    const element = { dispatchEvent } as any as HTMLElement;

    const action: TapActionConfig = {
      action: 'more-info',
      entity: 'sensor.source_card_entity',
    };

    await UltraLinkComponent.handleAction(
      action,
      hass,
      element,
      { haptic_feedback: false } as any,
      'sensor.duplicated_card_entity',
      {
        type: 'icon',
        icons: [{ entity: 'sensor.duplicated_card_entity' }],
      } as any
    );

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    const event = dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('hass-more-info');
    expect(event.detail.entityId).toBe('sensor.duplicated_card_entity');
  });

  it('heals stale info-module action entities from duplicated modules', async () => {
    const hass = makeHass();
    const dispatchEvent = vi.fn();
    const element = { dispatchEvent } as any as HTMLElement;

    const action: TapActionConfig = {
      action: 'more-info',
      entity: 'sensor.old_info_entity',
    };

    await UltraLinkComponent.handleAction(
      action,
      hass,
      element,
      { haptic_feedback: false } as any,
      undefined,
      {
        type: 'info',
        info_entities: [{ entity: 'sensor.new_info_entity' }],
      } as any
    );

    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    const event = dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('hass-more-info');
    expect(event.detail.entityId).toBe('sensor.new_info_entity');
  });
});
