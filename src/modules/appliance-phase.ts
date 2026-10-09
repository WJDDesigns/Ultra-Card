export type AppliancePhase =
  | 'running'
  | 'paused'
  | 'done'
  | 'idle'
  | 'off'
  | 'error'
  | 'unavailable';

// Covers SmartThings (run/pause/stop), LG ThinQ (running/wash/drying/cooling),
// Miele (in_use/program_running), HomeWhiz (device_state_running /
// washer_substate_*), and common generic integrations.
export const RUN_STATES = new Set([
  'run', 'running', 'wash', 'washing', 'dry', 'drying', 'active', 'rinse', 'rinsing',
  'spin', 'spinning', 'busy', 'in_use', 'working', 'cleaning', 'heating', 'cooling',
  'cooldown', 'steam', 'prewash', 'pre_wash', 'refreshing', 'program_running', 'on',
  'preheat', 'preheating', 'cooking', 'baking', 'roasting', 'broiling', 'warming',
  'water_intake', 'program_started',
]);
const PAUSE_STATES = new Set([
  'pause', 'paused', 'hold', 'program_interrupted', 'delayed_start', 'delay_wash', 'time_delay',
]);
const DONE_STATES = new Set([
  'finish', 'finished', 'done', 'complete', 'completed', 'end', 'ended',
  'program_ended', 'wrinkle_prevent', 'anticrease', 'remove_laundry', 'rinse_hold',
]);
const IDLE_STATES = new Set(['stop', 'stopped', 'idle', 'ready', 'standby', 'none', 'off', 'inactive', 'not_running', 'waiting_to_start']);
const ERROR_STATES = new Set(['error', 'fault', 'failure', 'problem', 'failure_mode']);

/** Checked in this order, so "time_delay_active" reads as paused, not running. */
const PHASE_SETS: Array<[AppliancePhase, Set<string>]> = [
  ['error', ERROR_STATES],
  ['done', DONE_STATES],
  ['paused', PAUSE_STATES],
  ['running', RUN_STATES],
  ['idle', IDLE_STATES],
];

/**
 * Namespaces some integrations put in front of every option of an enum sensor,
 * e.g. HomeWhiz `device_state_running` or `washer_substate_spin`.
 */
const STATE_PREFIX_RE =
  /^(?:device_state|(?:washer|dryer|dishwasher|machine)_sub_?state|sub_?state|state|washer|dryer|dishwasher)_/;
const LABEL_PREFIX_RE =
  /^(?:device[_\s-]state|(?:washer|dryer|dishwasher|machine)[_\s-]sub[_\s-]?state|sub[_\s-]?state)[_\s-]/i;

function normalizeState(state: string): string {
  return state.toLowerCase().trim().replace(/[\s-]+/g, '_');
}

/** Drop an integration's state namespace, keeping the original when nothing is left. */
export function stripStatePrefix(state: string): string {
  let out = state.trim();
  while (LABEL_PREFIX_RE.test(out)) out = out.replace(LABEL_PREFIX_RE, '');
  return out || state;
}

function exactPhase(s: string): AppliancePhase | null {
  for (const [phase, set] of PHASE_SETS) if (set.has(s)) return phase;
  return null;
}

function tokenPhase(s: string): AppliancePhase | null {
  const padded = `_${s}_`;
  for (const [phase, set] of PHASE_SETS) {
    for (const key of set) if (padded.includes(`_${key}_`)) return phase;
  }
  return null;
}

/**
 * `explicit` is false when the phase is a guess: an unrecognised state, or a
 * namespaced "on" that only says the machine is powered up.
 */
function classify(state: string | null | undefined): { phase: AppliancePhase; explicit: boolean } {
  const s = normalizeState(String(state ?? ''));
  if (!s || s === 'unavailable' || s === 'unknown') return { phase: 'unavailable', explicit: true };

  const exact = exactPhase(s);
  if (exact) return { phase: exact, explicit: true };

  let stripped = s;
  while (STATE_PREFIX_RE.test(stripped)) stripped = stripped.replace(STATE_PREFIX_RE, '');
  if (stripped && stripped !== s) {
    // Namespaced integrations report "running" explicitly.
    if (stripped === 'on') return { phase: 'idle', explicit: false };
    const prefixed = exactPhase(stripped);
    if (prefixed) return { phase: prefixed, explicit: true };
  }

  const token = tokenPhase(stripped || s);
  return token ? { phase: token, explicit: true } : { phase: 'idle', explicit: false };
}

/** Map a raw machine/run state onto the card's phase vocabulary. */
export function resolvePhase(state: string | null | undefined): AppliancePhase {
  return classify(state).phase;
}

/**
 * Phase from the machine state, refined by the job/sub state. Some machines
 * stay "on" after a cycle and only the sub state says the load is finished.
 */
export function resolveAppliancePhase(
  machineState: string | null | undefined,
  jobState?: string | null
): AppliancePhase {
  const machine = classify(machineState);
  if (!jobState || resolvePhase(jobState) !== 'done') return machine.phase;
  if (machine.phase === 'running' || (machine.phase === 'idle' && !machine.explicit)) return 'done';
  return machine.phase;
}
