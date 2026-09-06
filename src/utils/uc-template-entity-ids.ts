/**
 * Entity IDs written into a Jinja template as literals.
 *
 * Dynamic List (and similar) generate child modules from a template whose
 * entities never appear as config fields. The host card's shouldUpdate filter
 * only sees those sensors if we pull them out of the template text.
 *
 * Matches:
 *   states('sensor.x') / state_attr("light.y", …)
 *   'entity': 'sensor.x'
 *   states.sensor.x
 *
 * Does not try to resolve `states(s.entity)` — those need HA's own
 * render_template listener list, captured separately.
 */

const QUOTED_ENTITY = /['"]([a-z][a-z0-9_]*\.[a-zA-Z0-9_]+)['"]/g;
const STATES_DOT_ENTITY = /\bstates\.([a-z][a-z0-9_]*\.[a-zA-Z0-9_]+)/g;

export function extractEntityIdsFromTemplate(template: string | undefined | null): string[] {
  if (!template) return [];
  const ids = new Set<string>();
  for (const re of [QUOTED_ENTITY, STATES_DOT_ENTITY]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(template)) !== null) {
      if (match[1]) ids.add(match[1]);
    }
  }
  return [...ids];
}
