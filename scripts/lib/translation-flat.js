/**
 * Shared helpers for translation scripts (flatten / unflatten / prune).
 * @module scripts/lib/translation-flat
 */

/**
 * Flatten a nested translation object to dot-keyed leaves.
 *
 * Detects two structural smells that would silently corrupt round-trips:
 *  1. A key string that itself contains a literal '.' (would collide with
 *     nested-path lookups and make unflatten lossy).
 *  2. A flat path that is produced more than once (duplicate keys via
 *     mixed literal-dotted + nested style at the same level).
 *
 * Either condition throws with a clear message — easier to fix once at
 * source than to debug mangled translations later.
 *
 * @param {Record<string, unknown>} obj
 * @param {string} prefix
 * @returns {Record<string, string>}
 */
function flatten(obj, prefix = '') {
  /** @type {Record<string, string>} */
  const acc = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.includes('.')) {
      throw new Error(
        `Translation key contains a literal '.' character: ${prefix ? prefix + '.' : ''}${k}\n` +
          `Translation keys must not contain dots — use a nested object instead. ` +
          `Mixing literal-dotted keys with nested paths breaks unflatten() round-trips.`
      );
    }
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sub = flatten(/** @type {Record<string, unknown>} */ (v), key);
      for (const sk of Object.keys(sub)) {
        if (sk in acc) {
          throw new Error(`Duplicate flat path produced by flatten(): ${sk}`);
        }
        acc[sk] = sub[sk];
      }
    } else {
      if (key in acc) {
        throw new Error(`Duplicate flat path produced by flatten(): ${key}`);
      }
      acc[key] = String(v);
    }
  }
  return acc;
}

/**
 * Rebuild nested object from dot-keyed flat map (string leaves only).
 * @param {Record<string, string>} flat
 * @returns {Record<string, unknown>}
 */
function unflatten(flat) {
  /** @type {Record<string, unknown>} */
  const root = {};
  for (const [path, val] of Object.entries(flat)) {
    const parts = path.split('.');
    let o = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!p) continue;
      if (typeof o[p] !== 'object' || o[p] === null || Array.isArray(o[p])) {
        o[p] = {};
      }
      o = /** @type {Record<string, unknown>} */ (o[p]);
    }
    const leaf = parts[parts.length - 1];
    if (leaf) o[leaf] = val;
  }
  return root;
}

/**
 * Remove keys from flat that are not in allowed set; return new flat.
 * @param {Record<string, string>} flat
 * @param {Set<string>} allowed
 * @returns {Record<string, string>}
 */
function filterFlatKeys(flat, allowed) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const k of Object.keys(flat)) {
    if (allowed.has(k)) out[k] = flat[k];
  }
  return out;
}

module.exports = { flatten, unflatten, filterFlatKeys };
