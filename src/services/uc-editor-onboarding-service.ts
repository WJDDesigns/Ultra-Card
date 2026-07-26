import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/safe-storage';

/** Legacy dismissal key from the original getting-started banner. */
export const LEGACY_EDITOR_SEEN_KEY = 'ultra-card-editor-seen';

/** Persisted onboarding state (JSON). */
export const ONBOARDING_STORAGE_KEY = 'ultra-card-editor-onboarding-v1';

export type OnboardingStepId =
  | 'add_row'
  | 'add_module'
  | 'pick_entity'
  | 'preview_breakpoints';

export interface OnboardingStepDef {
  id: OnboardingStepId;
  /** Optional steps can be skipped without blocking completion. */
  optional?: boolean;
}

export const ONBOARDING_STEPS: readonly OnboardingStepDef[] = [
  { id: 'add_row' },
  { id: 'add_module' },
  { id: 'pick_entity', optional: true },
  { id: 'preview_breakpoints' },
] as const;

export interface OnboardingState {
  dismissed: boolean;
  completedSteps: OnboardingStepId[];
}

function defaultState(): OnboardingState {
  return { dismissed: false, completedSteps: [] };
}

function parseState(raw: string | null): OnboardingState {
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    const completed = Array.isArray(parsed.completedSteps)
      ? parsed.completedSteps.filter((id): id is OnboardingStepId =>
          ONBOARDING_STEPS.some(s => s.id === id)
        )
      : [];
    return {
      dismissed: !!parsed.dismissed,
      completedSteps: completed,
    };
  } catch {
    return defaultState();
  }
}

/**
 * First-run editor onboarding: checklist steps + dismissal persistence.
 * Honors the legacy `ultra-card-editor-seen` key as "already dismissed".
 */
class UcEditorOnboardingService {
  private _cache: OnboardingState | null = null;

  /** True when the coach UI should be shown. */
  shouldShow(): boolean {
    if (safeGetItem(LEGACY_EDITOR_SEEN_KEY)) {
      return false;
    }
    const state = this.getState();
    if (state.dismissed) return false;
    return !this.isComplete(state);
  }

  getState(): OnboardingState {
    if (this._cache) return this._cache;
    const state = parseState(safeGetItem(ONBOARDING_STORAGE_KEY));
    this._cache = state;
    return state;
  }

  isStepComplete(stepId: OnboardingStepId, state = this.getState()): boolean {
    return state.completedSteps.includes(stepId);
  }

  /** Required steps all done (optional steps ignored). */
  isComplete(state = this.getState()): boolean {
    return ONBOARDING_STEPS.filter(s => !s.optional).every(s =>
      state.completedSteps.includes(s.id)
    );
  }

  completeStep(stepId: OnboardingStepId): OnboardingState {
    const state = { ...this.getState() };
    if (!state.completedSteps.includes(stepId)) {
      state.completedSteps = [...state.completedSteps, stepId];
    }
    if (this.isComplete(state)) {
      state.dismissed = true;
      this._persistDismissedLegacy();
    }
    this._persist(state);
    return state;
  }

  dismiss(): OnboardingState {
    const state: OnboardingState = {
      ...this.getState(),
      dismissed: true,
    };
    this._persist(state);
    this._persistDismissedLegacy();
    return state;
  }

  /** Test helper — clear persistence and in-memory cache. */
  resetForTests(): void {
    this._cache = null;
    safeRemoveItem(ONBOARDING_STORAGE_KEY);
    safeRemoveItem(LEGACY_EDITOR_SEEN_KEY);
  }

  private _persist(state: OnboardingState): void {
    this._cache = state;
    safeSetItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  }

  private _persistDismissedLegacy(): void {
    safeSetItem(LEGACY_EDITOR_SEEN_KEY, '1');
  }
}

export const ucEditorOnboardingService = new UcEditorOnboardingService();
