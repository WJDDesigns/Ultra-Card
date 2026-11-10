import { afterEach, describe, expect, it } from 'vitest';
import { ucActionConfirmationService } from './uc-action-confirmation-service';

const overlay = (): HTMLElement =>
  document.querySelector('.uc-confirmation-overlay') as HTMLElement;

const cancel = (): void => {
  (overlay().querySelector('.uc-confirmation-btn.secondary') as HTMLButtonElement).click();
};

describe('ucActionConfirmationService', () => {
  afterEach(() => {
    document.querySelectorAll('.uc-confirmation-overlay').forEach(el => el.remove());
  });

  it('renders action values as text, never as markup', async () => {
    const payload = '<img src=x onerror="window.__ucConfirmPwned = 1"><b>bold</b>';
    const pending = ucActionConfirmationService.showConfirmation({
      action: 'url',
      url_path: payload,
    } as never);

    const details = overlay().querySelector('.uc-confirmation-details-text') as HTMLElement;
    expect(details.textContent).toContain(payload);
    expect(overlay().querySelector('img')).toBeNull();
    expect(overlay().querySelector('b')).toBeNull();

    cancel();
    await expect(pending).resolves.toBe(false);
  });

  it.each([
    [{ action: 'navigate', navigation_path: '"><script>x</script>' }],
    [{ action: 'perform-action', perform_action: '<svg onload=x>', entity: '<i>e</i>' }],
    [{ action: 'toggle', entity: '<u>light.kitchen</u>' }],
    [{ action: '<em>custom</em>' }],
  ])('keeps %j inert', async action => {
    const pending = ucActionConfirmationService.showConfirmation(action as never);
    expect(overlay().querySelectorAll('script, svg, i, u, em')).toHaveLength(0);
    cancel();
    await pending;
  });

  it('describes a service call and resolves true on confirm', async () => {
    const pending = ucActionConfirmationService.showConfirmation(
      { action: 'perform-action', perform_action: 'lock.unlock', entity: 'lock.front' } as never,
      { confirmText: 'Unlock' }
    );

    expect(overlay().querySelector('.uc-confirmation-details-text')?.textContent).toBe(
      'Execute service: lock.unlock on lock.front'
    );
    const confirm = overlay().querySelector('.uc-confirmation-btn.primary') as HTMLButtonElement;
    expect(confirm.textContent).toBe('Unlock');
    confirm.click();
    await expect(pending).resolves.toBe(true);
  });
});
