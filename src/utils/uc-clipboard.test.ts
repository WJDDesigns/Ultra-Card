import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { copyTextToClipboard } from './uc-clipboard';

/**
 * Replace navigator.clipboard for a single test. Home Assistant over plain HTTP
 * has no clipboard object at all, which is the case that used to fail silently.
 */
function setClipboard(value: unknown): void {
  Object.defineProperty(navigator, 'clipboard', {
    value,
    configurable: true,
    writable: true,
  });
}

describe('copyTextToClipboard', () => {
  let execCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    execCommand = vi.fn().mockReturnValue(true);
    (document as unknown as { execCommand: unknown }).execCommand = execCommand;
  });

  afterEach(() => {
    setClipboard(undefined);
    vi.restoreAllMocks();
  });

  it('uses the async Clipboard API when it is available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(copyTextToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(execCommand).not.toHaveBeenCalled();
  });

  it('falls back to execCommand when the Clipboard API is missing (HTTP context)', async () => {
    setClipboard(undefined);

    await expect(copyTextToClipboard('hello')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('falls back to execCommand when writeText rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    setClipboard({ writeText });

    await expect(copyTextToClipboard('hello')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('reports failure instead of a false success when every path fails', async () => {
    execCommand.mockReturnValue(false);
    setClipboard(undefined);

    await expect(copyTextToClipboard('hello')).resolves.toBe(false);
  });

  it('reports failure when execCommand throws', async () => {
    execCommand.mockImplementation(() => {
      throw new Error('not allowed');
    });
    setClipboard(undefined);

    await expect(copyTextToClipboard('hello')).resolves.toBe(false);
  });

  it('leaves no textarea behind in the document', async () => {
    setClipboard(undefined);

    await copyTextToClipboard('hello');

    expect(document.querySelectorAll('textarea').length).toBe(0);
  });
});
