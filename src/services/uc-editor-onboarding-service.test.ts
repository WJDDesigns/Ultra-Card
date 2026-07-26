import { describe, it, expect, beforeEach } from 'vitest';
import {
  ucEditorOnboardingService,
  LEGACY_EDITOR_SEEN_KEY,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_STEPS,
} from './uc-editor-onboarding-service';

describe('ucEditorOnboardingService', () => {
  beforeEach(() => {
    ucEditorOnboardingService.resetForTests();
  });

  it('shows onboarding when nothing persisted', () => {
    expect(ucEditorOnboardingService.shouldShow()).toBe(true);
  });

  it('hides when legacy seen key is set', () => {
    localStorage.setItem(LEGACY_EDITOR_SEEN_KEY, '1');
    expect(ucEditorOnboardingService.shouldShow()).toBe(false);
  });

  it('tracks completed steps and dismisses when required steps done', () => {
    for (const step of ONBOARDING_STEPS.filter(s => !s.optional)) {
      ucEditorOnboardingService.completeStep(step.id);
    }
    expect(ucEditorOnboardingService.isComplete()).toBe(true);
    expect(ucEditorOnboardingService.shouldShow()).toBe(false);
    expect(localStorage.getItem(LEGACY_EDITOR_SEEN_KEY)).toBe('1');
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeTruthy();
  });

  it('dismiss() hides and sets legacy key', () => {
    ucEditorOnboardingService.dismiss();
    expect(ucEditorOnboardingService.shouldShow()).toBe(false);
    expect(localStorage.getItem(LEGACY_EDITOR_SEEN_KEY)).toBe('1');
  });

  it('optional pick_entity is not required for completion', () => {
    ucEditorOnboardingService.completeStep('add_row');
    ucEditorOnboardingService.completeStep('add_module');
    ucEditorOnboardingService.completeStep('preview_breakpoints');
    expect(ucEditorOnboardingService.isComplete()).toBe(true);
    expect(ucEditorOnboardingService.isStepComplete('pick_entity')).toBe(false);
  });
});
