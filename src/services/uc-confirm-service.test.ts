import { afterEach, describe, expect, it } from 'vitest';
import { ucConfirmService } from './uc-confirm-service';

const buttons = (): HTMLButtonElement[] =>
  Array.from(document.querySelectorAll<HTMLButtonElement>('.uc-cd-actions button'));

describe('ucConfirmService', () => {
  afterEach(() => {
    buttons().forEach(b => b.click());
  });

  it('resolves true on confirm and false on cancel, using the given labels', async () => {
    const first = ucConfirmService.confirm('Delete favorite?', 'Sure?', {
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true,
    });
    expect(buttons().map(b => b.textContent)).toEqual(['Keep', 'Delete']);
    buttons()[1].click();
    await expect(first).resolves.toBe(true);

    const second = ucConfirmService.confirm('Delete favorite?', 'Sure?');
    buttons()[0].click();
    await expect(second).resolves.toBe(false);
  });

  it('shows title and message as text', async () => {
    const pending = ucConfirmService.confirm('<b>Title</b>', '<img src=x onerror=1>');
    const panel = document.querySelector('.uc-cd-panel') as HTMLElement;
    expect(panel.querySelector('b, img')).toBeNull();
    expect(panel.querySelector('.uc-cd-title')?.textContent).toBe('<b>Title</b>');
    buttons()[0].click();
    await pending;
  });

  it('notice() shows a single button and resolves when it is pressed', async () => {
    const pending = ucConfirmService.notice('Name already in use', 'Rename it first.', 'Got it');
    expect(buttons().map(b => b.textContent)).toEqual(['Got it']);
    buttons()[0].click();
    await expect(pending).resolves.toBeUndefined();
  });
});
