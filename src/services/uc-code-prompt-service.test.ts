import { describe, it, expect, afterEach } from 'vitest';
import { promptForCode } from './uc-code-prompt-service';

const base = {
  title: 'Unlock Front door',
  confirmText: 'Unlock',
  cancelText: 'Cancel',
  clearLabel: 'Clear',
  placeholder: 'Enter your PIN',
};

function press(keys: string): void {
  for (const k of keys) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  }
}

afterEach(() => {
  document.querySelectorAll('.uc-code-overlay').forEach(el => el.remove());
});

describe('promptForCode with a saved PIN', () => {
  it('stays open on a wrong PIN and resolves on the right one', async () => {
    let result: string | null | undefined;
    const pending = promptForCode({ ...base, expected: '2468', wrongText: 'Wrong PIN' }).then(
      v => (result = v)
    );
    const input = document.querySelector<HTMLInputElement>('.uc-code-input')!;

    press('1111');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await Promise.resolve();
    expect(result).toBeUndefined();
    expect(document.querySelector('.uc-code-overlay')).not.toBeNull();
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Wrong PIN');

    press('2468');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await pending;
    expect(result).toBe('2468');
    expect(document.querySelector('.uc-code-overlay')).toBeNull();
  });

  it('passes any code through when no PIN is saved', async () => {
    const pending = promptForCode(base);
    press('1111');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(await pending).toBe('1111');
  });
});
