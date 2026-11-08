/**
 * Pro setting "Start with Empty Card": when on, a newly added Ultra Card starts
 * with an empty layout instead of the default starter modules.
 *
 * The Hub's Pro tab writes this setting and the card's getStubConfig() reads it.
 * Older Hub builds (bundled with Ultra Card Connect) write the legacy key, while
 * the card used to read a different key, so the toggle never took effect.
 * Read both keys and write both so every Hub/card version agrees.
 */
export const SKIP_DEFAULT_MODULES_KEY = 'ultra-card-pro-skip-default-modules';
export const SKIP_DEFAULT_MODULES_LEGACY_KEY = 'ultra-card-skip-default-modules';
const WINDOW_KEY = '__ultraCardSkipDefaultModules';
const globals = globalThis as unknown as Record<string, unknown>;

function readFlag(storage: Storage | undefined, key: string): boolean | null {
  try {
    const value = storage?.getItem(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
  } catch {
    /* storage unavailable */
  }
  return null;
}

function getLocalStorage(): Storage | undefined {
  try {
    return globals.localStorage as Storage | undefined;
  } catch {
    return undefined;
  }
}

export function getSkipDefaultModules(): boolean {
  const local = getLocalStorage();
  // The legacy key is the one every shipped Hub writes, so it wins.
  for (const key of [SKIP_DEFAULT_MODULES_LEGACY_KEY, SKIP_DEFAULT_MODULES_KEY]) {
    const value = readFlag(local, key);
    if (value !== null) return value;
  }
  // Fallback for when localStorage could not be written (full or disabled).
  return globals[WINDOW_KEY] === true;
}

export function setSkipDefaultModules(enabled: boolean): void {
  const value = String(enabled);
  globals[WINDOW_KEY] = enabled;
  const local = getLocalStorage();
  for (const key of [SKIP_DEFAULT_MODULES_LEGACY_KEY, SKIP_DEFAULT_MODULES_KEY]) {
    try {
      local?.setItem(key, value);
    } catch {
      /* quota or disabled storage */
    }
  }
}
