/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadUltraCardEditor,
  __resetUltraCardEditorLoaderForTests,
} from './load-ultra-card-editor';

vi.mock('./ultra-card-editor', () => ({}));

describe('loadUltraCardEditor', () => {
  beforeEach(() => {
    __resetUltraCardEditorLoaderForTests();
  });

  it('memoizes the import promise', async () => {
    const first = loadUltraCardEditor();
    const second = loadUltraCardEditor();
    expect(first).toBe(second);
    await first;
  });
});
