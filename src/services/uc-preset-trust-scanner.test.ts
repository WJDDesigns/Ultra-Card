import { describe, it, expect } from 'vitest';
import { scanPresetForRisks } from './uc-preset-trust-scanner';

describe('scanPresetForRisks', () => {
  it('reports nothing for a purely cosmetic preset', () => {
    const findings = scanPresetForRisks({
      rows: [{ columns: [{ modules: [{ type: 'text', text: 'hello' }] }] }],
    });
    expect(findings.hasAny).toBe(false);
    expect(findings.serviceCalls).toEqual([]);
    expect(findings.remoteHosts).toEqual([]);
    expect(findings.embeddedCards).toEqual([]);
  });

  it('names the services a preset can call', () => {
    const findings = scanPresetForRisks({
      rows: [
        {
          columns: [
            {
              modules: [
                {
                  type: 'button',
                  tap_action: { action: 'perform-action', perform_action: 'lock.unlock' },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(findings.serviceCalls).toEqual(['lock.unlock']);
    expect(findings.hasAny).toBe(true);
  });

  it('recognises the legacy call-service action and its service field', () => {
    const findings = scanPresetForRisks({
      tap_action: { action: 'call-service', service: 'alarm_control_panel.alarm_disarm' },
    });
    expect(findings.serviceCalls).toEqual(['alarm_control_panel.alarm_disarm']);
  });

  it('flags a service action even when the service name is missing', () => {
    const findings = scanPresetForRisks({ tap_action: { action: 'perform-action' } });
    expect(findings.serviceCalls).toEqual(['an unspecified service']);
  });

  it('collects third-party hosts but ignores our own and local assets', () => {
    const findings = scanPresetForRisks({
      a: 'https://raw.githubusercontent.com/x/y/img.png',
      b: 'https://images.unsplash.com/photo.jpg',
      c: 'https://ultracard.io/thumb.png',
      d: 'https://brands.home-assistant.io/icon.png',
      e: '/local/my-image.png',
      f: 'mdi:lightbulb',
    });
    expect(findings.remoteHosts).toEqual(['images.unsplash.com', 'raw.githubusercontent.com']);
  });

  it('reports embedded cards by their card type', () => {
    const findings = scanPresetForRisks({
      rows: [
        {
          columns: [
            {
              modules: [
                { type: 'external_card', card_type: 'custom:mushroom-card' },
                { type: 'native_card', card_config: { type: 'media-control' } },
              ],
            },
          ],
        },
      ],
    });
    expect(findings.embeddedCards).toEqual(['custom:mushroom-card', 'media-control']);
  });

  // A shape-aware walk would miss whichever nesting key a hostile preset chose,
  // so the traversal must not depend on knowing container shapes.
  it('finds risks nested under any container key', () => {
    const findings = scanPresetForRisks({
      rows: [
        {
          columns: [
            {
              modules: [
                {
                  type: 'tabs',
                  tabs: [
                    {
                      panes: [
                        {
                          modules: [
                            {
                              type: 'popup',
                              sections: [
                                {
                                  whatever: [
                                    {
                                      tap_action: {
                                        action: 'perform-action',
                                        perform_action: 'script.turn_on',
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(findings.serviceCalls).toEqual(['script.turn_on']);
  });

  it('deduplicates and sorts repeated findings', () => {
    const findings = scanPresetForRisks([
      { tap_action: { action: 'perform-action', perform_action: 'light.turn_on' } },
      { hold_action: { action: 'perform-action', perform_action: 'light.turn_on' } },
      { tap_action: { action: 'perform-action', perform_action: 'fan.turn_on' } },
    ]);
    expect(findings.serviceCalls).toEqual(['fan.turn_on', 'light.turn_on']);
  });

  it('survives malformed input without throwing', () => {
    for (const input of [null, undefined, 42, 'string', [], {}, [null, [undefined]]]) {
      expect(() => scanPresetForRisks(input)).not.toThrow();
    }
    expect(scanPresetForRisks(null).hasAny).toBe(false);
  });

  it('terminates on a self-referencing object', () => {
    const cyclic: Record<string, unknown> = {
      tap_action: { action: 'perform-action', perform_action: 'lock.lock' },
    };
    cyclic.self = cyclic;
    expect(() => scanPresetForRisks(cyclic)).not.toThrow();
    expect(scanPresetForRisks(cyclic).serviceCalls).toEqual(['lock.lock']);
  });
});
