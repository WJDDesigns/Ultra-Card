import { describe, expect, it } from 'vitest';
import { authorThemeState } from './uc-theme-author-service';

const item = (overrides: Partial<Parameters<typeof authorThemeState>[0]> = {}) => ({
  status: 'pending',
  review_status: 'pending' as const,
  has_pending_revision: false,
  ...overrides,
});

describe('authorThemeState', () => {
  it('reports a published post as live even when the review meta still says pending', () => {
    // wp-admin "Publish" flips post_status but used to leave _uc_review_status alone.
    expect(authorThemeState(item({ status: 'publish', review_status: 'pending' }))).toBe('live');
    expect(authorThemeState(item({ status: 'publish', review_status: 'approved' }))).toBe('live');
  });

  it('keeps a queued revision on a live theme visible as an update in review', () => {
    expect(authorThemeState(item({ status: 'publish', review_status: 'pending', has_pending_revision: true }))).toBe(
      'revision_pending'
    );
  });

  it('falls back to the review meta for anything not published', () => {
    expect(authorThemeState(item())).toBe('pending');
    expect(authorThemeState(item({ status: 'draft', review_status: 'changes_requested' }))).toBe('changes_requested');
    expect(authorThemeState(item({ status: 'draft', review_status: 'rejected' }))).toBe('rejected');
    // Approved once, unpublished since: not live, back in the queue.
    expect(authorThemeState(item({ status: 'draft', review_status: 'approved' }))).toBe('pending');
  });
});
