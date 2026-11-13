import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'lit';
import { UltraExternalCardModule, externalCardHandlesTaps } from '../external-card-module';
import { registerPopupTrigger, unregisterPopupTrigger } from '../../services/popup-trigger-registry';
import { UltraLinkComponent } from '../../components/ultra-link';

const hass: any = { states: {}, language: 'en', locale: { language: 'en' }, themes: {} };

if (!customElements.get('uc-fake-camera-card')) {
  customElements.define(
    'uc-fake-camera-card',
    class extends HTMLElement {
      setConfig() {}
      connectedCallback() {
        // Like WebRTC video: the card swallows its own clicks.
        this.addEventListener('click', e => e.stopPropagation());
      }
    }
  );
}

function makeModule(extra: Record<string, unknown> = {}): any {
  return {
    ...new UltraExternalCardModule().createDefault(),
    id: 'ext-test',
    card_type: 'custom:uc-fake-camera-card',
    card_config: { type: 'custom:uc-fake-camera-card', url: 'rtsp://cam' },
    ...extra,
  };
}

function renderModule(module: any, config: any = {}): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(new UltraExternalCardModule().renderPreview(module, hass, config) as any, host);
  return host;
}

afterEach(() => {
  unregisterPopupTrigger('popup-1');
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('3rd party card actions', () => {
  it('leaves taps to the embedded card by default', () => {
    expect(externalCardHandlesTaps(makeModule())).toBe(false);
    expect(
      externalCardHandlesTaps(
        makeModule({ tap_action: { action: 'nothing' }, hold_action: { action: 'default' } })
      )
    ).toBe(false);
    const host = renderModule(makeModule());
    expect(host.querySelector('.uc-external-card-tap-layer')).toBeNull();
  });

  it('takes taps once an action is set', () => {
    const module = makeModule({ tap_action: { action: 'navigate', navigation_path: '/cams' } });
    expect(externalCardHandlesTaps(module)).toBe(true);
    const host = renderModule(module);
    expect(host.querySelector('.uc-external-card-tap-layer')).not.toBeNull();
  });

  it('takes taps when a popup in the card is triggered by this module', () => {
    const config: any = {
      layout: {
        rows: [
          {
            columns: [
              {
                modules: [
                  makeModule(),
                  { id: 'popup-1', type: 'popup', trigger_type: 'module', trigger_module_id: 'ext-test' },
                ],
              },
            ],
          },
        ],
      },
    };
    expect(externalCardHandlesTaps(makeModule(), config)).toBe(true);
    expect(externalCardHandlesTaps(makeModule({ id: 'other' }), config)).toBe(false);
  });

  it('takes taps when the popup registry points at this module', () => {
    registerPopupTrigger('popup-1', 'ext-test');
    expect(externalCardHandlesTaps(makeModule())).toBe(true);
  });

  it('runs the tap action from the layer', async () => {
    const spy = vi.spyOn(UltraLinkComponent, 'handleAction').mockResolvedValue(undefined as any);
    const module = makeModule({ tap_action: { action: 'navigate', navigation_path: '/cams' } });
    const host = renderModule(module);
    const layer = host.querySelector<HTMLElement>('.uc-external-card-tap-layer')!;
    const opts = { bubbles: true, composed: true, pointerId: 1, clientX: 5, clientY: 5 };
    layer.dispatchEvent(new PointerEvent('pointerdown', opts));
    layer.dispatchEvent(new PointerEvent('pointerup', opts));
    await new Promise(r => setTimeout(r, 400));
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toMatchObject({ action: 'navigate', navigation_path: '/cams' });
  });
});
