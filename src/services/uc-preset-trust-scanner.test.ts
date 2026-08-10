import { describe, it, expect } from 'vitest';
import { scanPresetForRisks, type PresetRiskItem } from './uc-preset-trust-scanner';

const values = (items: PresetRiskItem[]): string[] => items.map(item => item.value);

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
    expect(findings.serviceCalls).toEqual([{ value: 'lock.unlock', sources: ['button'] }]);
    expect(findings.hasAny).toBe(true);
  });

  it('recognises the legacy call-service action and its service field', () => {
    const findings = scanPresetForRisks({
      tap_action: { action: 'call-service', service: 'alarm_control_panel.alarm_disarm' },
    });
    expect(values(findings.serviceCalls)).toEqual(['alarm_control_panel.alarm_disarm']);
  });

  it('flags a service action even when the service name is missing', () => {
    const findings = scanPresetForRisks({ tap_action: { action: 'perform-action' } });
    expect(values(findings.serviceCalls)).toEqual(['an unspecified service']);
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
    expect(values(findings.remoteHosts)).toEqual([
      'images.unsplash.com',
      'raw.githubusercontent.com',
    ]);
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
    expect(values(findings.embeddedCards)).toEqual(['custom:mushroom-card', 'media-control']);
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
    expect(values(findings.serviceCalls)).toEqual(['script.turn_on']);
  });

  it('deduplicates and sorts repeated findings', () => {
    const findings = scanPresetForRisks([
      { tap_action: { action: 'perform-action', perform_action: 'light.turn_on' } },
      { hold_action: { action: 'perform-action', perform_action: 'light.turn_on' } },
      { tap_action: { action: 'perform-action', perform_action: 'fan.turn_on' } },
    ]);
    expect(values(findings.serviceCalls)).toEqual(['fan.turn_on', 'light.turn_on']);
  });

  describe('module attribution', () => {
    it('attributes a host to the module that references it', () => {
      const findings = scanPresetForRisks({
        rows: [
          {
            columns: [
              {
                modules: [
                  { id: 'm1', type: 'image', image: 'https://images.unsplash.com/a.jpg' },
                  { id: 'm2', type: 'text', text: 'no url here' },
                ],
              },
            ],
          },
        ],
      });
      expect(findings.remoteHosts).toEqual([
        { value: 'images.unsplash.com', sources: ['image'] },
      ]);
    });

    it('collects every module that references the same host', () => {
      const findings = scanPresetForRisks([
        { type: 'image', image: 'https://cdn.example.com/a.png' },
        { type: 'bar', background_image: 'https://cdn.example.com/b.png' },
      ]);
      expect(findings.remoteHosts).toEqual([
        { value: 'cdn.example.com', sources: ['bar', 'image'] },
      ]);
    });

    it('attributes to the innermost module when containers nest', () => {
      const findings = scanPresetForRisks({
        type: 'horizontal',
        modules: [
          {
            type: 'button',
            tap_action: { action: 'perform-action', perform_action: 'light.turn_on' },
          },
        ],
      });
      expect(findings.serviceCalls).toEqual([
        { value: 'light.turn_on', sources: ['button'] },
      ]);
    });

    it('does not mistake an action object for the owning module', () => {
      const findings = scanPresetForRisks({
        type: 'icon',
        tap_action: {
          action: 'perform-action',
          perform_action: 'lock.unlock',
          // A nested type on the action payload must not become the attribution.
          target: { type: 'not-a-module' },
        },
      });
      expect(findings.serviceCalls).toEqual([{ value: 'lock.unlock', sources: ['icon'] }]);
    });

    it('reports no source when a finding sits outside any module', () => {
      const findings = scanPresetForRisks({ background: 'https://cdn.example.com/x.png' });
      expect(findings.remoteHosts).toEqual([{ value: 'cdn.example.com', sources: [] }]);
    });
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
    expect(values(scanPresetForRisks(cyclic).serviceCalls)).toEqual(['lock.lock']);
  });
});
