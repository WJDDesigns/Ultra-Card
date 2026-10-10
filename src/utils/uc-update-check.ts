import type { HomeAssistant } from '../ha/types';

/**
 * Detects a page still running an older Ultra Card build than HACS installed.
 *
 * "Clear your cache" is the most common support answer: HACS updated the files
 * but the browser (or the companion app) keeps the old ultra-card.js. HACS
 * exposes the installed version on its update entity, so comparing it with the
 * running VERSION tells us when a reload is needed, without fetching anything.
 */

/** Parse "v3.13.3" / "3.13.4-beta2" into comparable parts. */
export function parseVersion(v: string): { nums: number[]; pre: string } | null {
  const m = String(v || '').trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)(?:[-.]?(.*))?$/);
  if (!m) return null;
  return { nums: [Number(m[1]), Number(m[2]), Number(m[3])], pre: m[4] || '' };
}

/** Negative if a < b, positive if a > b, 0 when equal or unparseable. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i++) {
    const d = (pa.nums[i] ?? 0) - (pb.nums[i] ?? 0);
    if (d) return d;
  }
  // A release sorts after its pre-releases (3.13.4 > 3.13.4-beta2).
  if (pa.pre === pb.pre) return 0;
  if (!pa.pre) return 1;
  if (!pb.pre) return -1;
  return pa.pre.localeCompare(pb.pre, undefined, { numeric: true });
}

/** HACS's update entity for this repository, if HACS manages Ultra Card. */
export function findInstalledVersion(hass: HomeAssistant | undefined): string | null {
  const states = hass?.states;
  if (!states) return null;
  for (const [id, st] of Object.entries(states)) {
    if (!id.startsWith('update.')) continue;
    const url = String(st.attributes?.release_url || '');
    if (/github\.com\/WJDDesigns\/Ultra-Card\/releases/i.test(url)) {
      const installed = st.attributes?.installed_version;
      return typeof installed === 'string' ? installed : null;
    }
  }
  return null;
}

/** The installed version when it is newer than the code running on this page. */
export function staleBuildVersion(hass: HomeAssistant | undefined, running: string): string | null {
  const installed = findInstalledVersion(hass);
  if (!installed) return null;
  return compareVersions(installed, running) > 0 ? installed.replace(/^v/i, '') : null;
}
