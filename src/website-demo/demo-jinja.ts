/**
 * A small Jinja2 interpreter for the ultracard.io demo bundle.
 *
 * Home Assistant renders templates server-side over the `render_template`
 * websocket subscription. The website has no Home Assistant, so every module
 * that uses Template Mode would render blank there. This file evaluates the
 * subset of Jinja + HA template functions that Ultra Card's Template Mode
 * actually uses, letting the real module code run against `demoHass` and paint
 * real results on the marketing site and the Template Mode playground.
 *
 * It is a *simulation*, not a port of Jinja. Supported:
 *
 *  - `{{ expr }}`, `{% if/elif/else %}`, `{% for %}`, `{% set %}`, `{# #}`
 *    plus whitespace control (`{%-`, `-%}`)
 *  - operators: arithmetic, comparison, `and`/`or`/`not`, `in`, `is`, `~`,
 *    inline `a if c else b`
 *  - HA globals: `states()`, `states.domain.object`, `state_attr()`,
 *    `is_state()`, `is_state_attr()`, `has_value()`, `now()`, `utcnow()`,
 *    `as_timestamp()`, `iif()`, `namespace()`
 *  - the filters Ultra Card's documented examples rely on (see FILTERS)
 *
 * Deliberately unsupported: macros, imports, includes, `{% raw %}`, tests
 * beyond the handful in TESTS, and Python's float repr (Jinja prints `23.0`
 * where this prints `23`).
 */

/* ────────────────────────────── values ────────────────────────────── */

/** Marker for Jinja's Undefined. Kept distinct from `null` (Python `None`). */
const UNDEF = Symbol('jinja.undefined');

type JValue = any;

interface StateObj {
  entity_id?: string;
  state: string;
  attributes?: Record<string, JValue>;
  last_changed?: string;
  last_updated?: string;
}

export interface JinjaHassLike {
  states: Record<string, StateObj>;
  config?: { time_zone?: string; location_name?: string };
}

/** Python-ish truthiness: empty string/list/dict are falsey. */
function truthy(v: JValue): boolean {
  if (v === UNDEF || v === undefined || v === null || v === false) return false;
  if (v === true) return true;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

function toNum(v: JValue, fallback = 0): number {
  if (typeof v === 'number') return v;
  if (v === true) return 1;
  if (v === false) return 0;
  if (typeof v === 'string') {
    const n = parseFloat(v.trim().replace(',', '.'));
    return isFinite(n) ? n : fallback;
  }
  return fallback;
}

/**
 * Render a value the way Jinja's output stage would: Python spellings for
 * booleans and None, JSON-ish for containers.
 */
function toOutput(v: JValue): string {
  if (v === UNDEF || v === undefined) return '';
  if (v === null) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  if (Array.isArray(v) || typeof v === 'object') return pyRepr(v);
  if (typeof v === 'function') return String(v);
  return String(v);
}

/** Python `repr` for containers — what Jinja prints for a dict or list. */
function pyRepr(v: JValue): string {
  if (v === null) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
  if (Array.isArray(v)) return `[${v.map(pyRepr).join(', ')}]`;
  if (v && typeof v === 'object') {
    if (typeof v.__pyStr === 'function') return v.__pyStr();
    return `{${Object.entries(v)
      .map(([k, val]) => `${pyRepr(k)}: ${pyRepr(val)}`)
      .join(', ')}}`;
  }
  return String(v);
}

/* ─────────────────────────── datetime helpers ─────────────────────────── */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function pad(n: number, width = 2): string {
  return String(Math.floor(Math.abs(n))).padStart(width, '0');
}

/** The strftime directives HA users reach for; unknown ones pass through. */
function strftime(d: Date, fmt: string): string {
  return fmt.replace(/%[-]?[a-zA-Z%]/g, token => {
    const bare = token.replace('-', '');
    const noPad = token.includes('-');
    const h12 = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
    const num = (n: number, width = 2) => (noPad ? String(n) : pad(n, width));
    switch (bare) {
      case '%Y': return String(d.getFullYear());
      case '%y': return pad(d.getFullYear() % 100);
      case '%m': return num(d.getMonth() + 1);
      case '%d': return num(d.getDate());
      case '%e': return String(d.getDate()).padStart(2, ' ');
      case '%H': return num(d.getHours());
      case '%I': return num(h12);
      case '%M': return num(d.getMinutes());
      case '%S': return num(d.getSeconds());
      case '%p': return d.getHours() < 12 ? 'AM' : 'PM';
      case '%A': return DAYS[d.getDay()];
      case '%a': return DAYS[d.getDay()].slice(0, 3);
      case '%B': return MONTHS[d.getMonth()];
      case '%b': return MONTHS[d.getMonth()].slice(0, 3);
      case '%j': {
        const start = new Date(d.getFullYear(), 0, 0);
        return num(Math.floor((d.getTime() - start.getTime()) / 86400000), 3);
      }
      case '%Z': return 'local';
      case '%z': return '+0000';
      case '%%': return '%';
      default: return token;
    }
  });
}

/** A Python `datetime`-shaped wrapper: attributes plus callable methods. */
function pyDateTime(d: Date): JValue {
  return {
    __date: d,
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    strftime: (fmt: string) => strftime(d, String(fmt)),
    timestamp: () => d.getTime() / 1000,
    weekday: () => (d.getDay() + 6) % 7,
    isoweekday: () => (d.getDay() === 0 ? 7 : d.getDay()),
    date: () => pyDateTime(new Date(d.getFullYear(), d.getMonth(), d.getDate())),
    isoformat: () => d.toISOString(),
    __pyStr: () => strftime(d, '%Y-%m-%d %H:%M:%S'),
  };
}

function asDate(v: JValue): Date | null {
  if (v && typeof v === 'object' && v.__date instanceof Date) return v.__date;
  if (typeof v === 'number') return new Date(v * 1000);
  if (typeof v === 'string') {
    const t = Date.parse(v);
    if (!isNaN(t)) return new Date(t);
  }
  return null;
}

/* ──────────────────────────── HA globals ──────────────────────────── */

/**
 * `states` is both callable (`states('sensor.x')`) and walkable
 * (`states.sensor.x.state`), matching HA's template environment.
 */
function makeStates(hass: JinjaHassLike): JValue {
  const call = (entityId: JValue) => {
    const s = hass.states[String(entityId)];
    return s ? s.state : 'unknown';
  };
  return new Proxy(call as any, {
    get(target, prop) {
      if (typeof prop !== 'string') return Reflect.get(target, prop);
      const domain = prop;
      return new Proxy(
        {},
        {
          get(_t, objectId) {
            if (typeof objectId !== 'string') return undefined;
            const id = `${domain}.${objectId}`;
            const s = hass.states[id];
            if (!s) return UNDEF;
            return {
              entity_id: id,
              state: s.state,
              attributes: s.attributes || {},
              name: s.attributes?.friendly_name ?? objectId,
              last_changed: s.last_changed,
              last_updated: s.last_updated,
              domain,
              object_id: objectId,
            };
          },
        }
      );
    },
  });
}

function buildGlobals(hass: JinjaHassLike): Record<string, JValue> {
  const stateOf = (id: JValue) => hass.states[String(id)];
  return {
    states: makeStates(hass),
    state_attr: (id: JValue, attr: JValue) => {
      const s = stateOf(id);
      const v = s?.attributes?.[String(attr)];
      return v === undefined ? UNDEF : v;
    },
    is_state: (id: JValue, value: JValue) => {
      const s = stateOf(id);
      if (!s) return false;
      return Array.isArray(value) ? value.map(String).includes(s.state) : s.state === String(value);
    },
    is_state_attr: (id: JValue, attr: JValue, value: JValue) => {
      const s = stateOf(id);
      if (!s) return false;
      const a = s.attributes?.[String(attr)];
      return typeof value === 'number' || typeof value === 'boolean'
        ? a === value
        : String(a) === String(value);
    },
    has_value: (id: JValue) => {
      const s = stateOf(id);
      return !!s && s.state !== 'unknown' && s.state !== 'unavailable' && s.state !== '';
    },
    state_translated: (id: JValue) => stateOf(id)?.state ?? 'unknown',
    now: () => pyDateTime(new Date()),
    utcnow: () => pyDateTime(new Date()),
    today_at: (time?: JValue) => {
      const [h = 0, m = 0, s = 0] = String(time ?? '00:00').split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, s, 0);
      return pyDateTime(d);
    },
    as_timestamp: (v: JValue, fallback?: JValue) => {
      const d = asDate(v);
      if (d) return d.getTime() / 1000;
      return fallback === undefined ? UNDEF : fallback;
    },
    as_datetime: (v: JValue) => {
      const d = asDate(v);
      return d ? pyDateTime(d) : UNDEF;
    },
    float: (v: JValue, fallback?: JValue) => {
      const n = parseFloat(String(v));
      return isFinite(n) ? n : fallback === undefined ? 0 : toNum(fallback);
    },
    int: (v: JValue, fallback?: JValue) => {
      const n = parseFloat(String(v));
      return isFinite(n) ? Math.trunc(n) : fallback === undefined ? 0 : Math.trunc(toNum(fallback));
    },
    iif: (cond: JValue, a: JValue, b: JValue) => (truthy(cond) ? a : b === undefined ? '' : b),
    // `namespace()` objects survive `{% set ns.x = ... %}` across loop scopes.
    namespace: (kwargs?: Record<string, JValue>) => ({ __namespace: true, ...(kwargs || {}) }),
    range: (a: JValue, b?: JValue, step?: JValue) => {
      const start = b === undefined ? 0 : toNum(a);
      const end = b === undefined ? toNum(a) : toNum(b);
      const by = step === undefined ? 1 : toNum(step) || 1;
      const out: number[] = [];
      for (let i = start; by > 0 ? i < end : i > end; i += by) out.push(i);
      return out;
    },
    min: (...args: JValue[]) => applyMinMax(args, true),
    max: (...args: JValue[]) => applyMinMax(args, false),
    abs: (v: JValue) => Math.abs(toNum(v)),
    round: (v: JValue, p?: JValue) => roundTo(toNum(v), p === undefined ? 0 : toNum(p)),
    len: (v: JValue) => lengthOf(v),
    string: (v: JValue) => toOutput(v),
    bool: (v: JValue) => truthy(v),
    dict: (kwargs?: Record<string, JValue>) => ({ ...(kwargs || {}) }),
    list: (v: JValue) => toList(v),
    iterable: (v: JValue) => toList(v),
    relative_time: (v: JValue) => {
      const d = asDate(v);
      if (!d) return 'unknown';
      const secs = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
      if (secs < 60) return `${secs} seconds`;
      if (secs < 3600) return `${Math.floor(secs / 60)} minutes`;
      if (secs < 86400) return `${Math.floor(secs / 3600)} hours`;
      return `${Math.floor(secs / 86400)} days`;
    },
  };
}

function applyMinMax(args: JValue[], wantMin: boolean): JValue {
  const values = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  const nums = values.map(v => toNum(v));
  if (!nums.length) return UNDEF;
  return wantMin ? Math.min(...nums) : Math.max(...nums);
}

function roundTo(n: number, precision: number): number {
  const f = Math.pow(10, precision);
  return Math.round(n * f) / f;
}

function lengthOf(v: JValue): number {
  if (typeof v === 'string' || Array.isArray(v)) return v.length;
  if (v && typeof v === 'object') return Object.keys(v).length;
  return 0;
}

function toList(v: JValue): JValue[] {
  if (Array.isArray(v)) return v.slice();
  if (typeof v === 'string') return v.split('');
  if (v && typeof v === 'object') return Object.keys(v);
  if (v === UNDEF || v === undefined || v === null) return [];
  return [v];
}

/* ───────────────────────────── filters ───────────────────────────── */

type Filter = (value: JValue, args: JValue[], kwargs: Record<string, JValue>) => JValue;

const FILTERS: Record<string, Filter> = {
  int: (v, a) => {
    const n = parseFloat(String(v));
    return isFinite(n) ? Math.trunc(n) : a[0] === undefined ? 0 : Math.trunc(toNum(a[0]));
  },
  float: (v, a) => {
    const n = parseFloat(String(v));
    return isFinite(n) ? n : a[0] === undefined ? 0 : toNum(a[0]);
  },
  round: (v, a) => {
    const precision = a[0] === undefined ? 0 : toNum(a[0]);
    const method = a[1] === undefined ? 'common' : String(a[1]);
    const f = Math.pow(10, precision);
    const n = toNum(v);
    if (method === 'ceil') return Math.ceil(n * f) / f;
    if (method === 'floor') return Math.floor(n * f) / f;
    return roundTo(n, precision);
  },
  abs: v => Math.abs(toNum(v)),
  string: v => toOutput(v),
  bool: v => truthy(v),
  // Jinja only substitutes Undefined unless the second arg is truthy, in which
  // case any falsey value is replaced.
  default: (v, a) => (v === UNDEF || v === undefined || (truthy(a[1]) && !truthy(v)) ? a[0] : v),
  d: (v, a) => FILTERS.default(v, a, {}),
  lower: v => toOutput(v).toLowerCase(),
  upper: v => toOutput(v).toUpperCase(),
  title: v => toOutput(v).replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
  capitalize: v => {
    const s = toOutput(v);
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  },
  trim: v => toOutput(v).trim(),
  striptags: v => toOutput(v).replace(/<[^>]*>/g, ''),
  replace: (v, a) => toOutput(v).split(String(a[0])).join(String(a[1] ?? '')),
  truncate: (v, a) => {
    const s = toOutput(v);
    const len = a[0] === undefined ? 255 : toNum(a[0]);
    return s.length <= len ? s : `${s.slice(0, len)}...`;
  },
  join: (v, a) => toList(v).map(toOutput).join(a[0] === undefined ? '' : String(a[0])),
  split: (v, a) => (a[0] === undefined ? toOutput(v).split(/\s+/) : toOutput(v).split(String(a[0]))),
  list: v => toList(v),
  length: v => lengthOf(v),
  count: v => lengthOf(v),
  first: v => (Array.isArray(v) ? (v.length ? v[0] : UNDEF) : toOutput(v).charAt(0)),
  last: v => (Array.isArray(v) ? (v.length ? v[v.length - 1] : UNDEF) : toOutput(v).slice(-1)),
  sum: (v, a, k) => {
    const attr = a[0] ?? k.attribute;
    return toList(v).reduce((acc: number, item) => acc + toNum(attr ? item?.[String(attr)] : item), 0);
  },
  min: v => applyMinMax([toList(v)], true),
  max: v => applyMinMax([toList(v)], false),
  average: v => {
    const items = toList(v);
    return items.length ? items.reduce((acc: number, i) => acc + toNum(i), 0) / items.length : 0;
  },
  sort: (v, a, k) => {
    const attr = k.attribute;
    const reverse = truthy(k.reverse ?? a[0]);
    const items = toList(v).slice();
    items.sort((x, y) => {
      const xv = attr ? x?.[String(attr)] : x;
      const yv = attr ? y?.[String(attr)] : y;
      if (typeof xv === 'number' && typeof yv === 'number') return xv - yv;
      return String(xv).localeCompare(String(yv));
    });
    return reverse ? items.reverse() : items;
  },
  reverse: v => toList(v).slice().reverse(),
  unique: v => Array.from(new Set(toList(v).map(x => (typeof x === 'object' ? JSON.stringify(x) : x)))),
  map: (v, a, k) => {
    if (k.attribute !== undefined) return toList(v).map(i => i?.[String(k.attribute)] ?? UNDEF);
    const name = String(a[0] ?? '');
    const f = FILTERS[name];
    return f ? toList(v).map(i => f(i, a.slice(1), {})) : toList(v);
  },
  select: (v, a) => toList(v).filter(i => applyTest(String(a[0] ?? 'truthy'), i, a.slice(1))),
  reject: (v, a) => toList(v).filter(i => !applyTest(String(a[0] ?? 'truthy'), i, a.slice(1))),
  selectattr: (v, a) => filterByAttr(v, a, true),
  rejectattr: (v, a) => filterByAttr(v, a, false),
  tojson: v => JSON.stringify(jsonSafe(v)),
  to_json: v => JSON.stringify(jsonSafe(v)),
  from_json: v => {
    try {
      return JSON.parse(toOutput(v));
    } catch {
      return UNDEF;
    }
  },
  timestamp_custom: (v, a) => {
    const d = asDate(v);
    return d ? strftime(d, String(a[0] ?? '%Y-%m-%dT%H:%M:%S')) : toOutput(v);
  },
  timestamp_local: v => {
    const d = asDate(v);
    return d ? strftime(d, '%Y-%m-%dT%H:%M:%S') : toOutput(v);
  },
  timestamp_utc: v => {
    const d = asDate(v);
    return d ? d.toISOString().replace(/\.\d+Z$/, '+00:00') : toOutput(v);
  },
  as_datetime: v => {
    const d = asDate(v);
    return d ? pyDateTime(d) : UNDEF;
  },
  as_timestamp: (v, a) => {
    const d = asDate(v);
    return d ? d.getTime() / 1000 : a[0] === undefined ? UNDEF : a[0];
  },
  multiply: (v, a) => toNum(v) * toNum(a[0], 1),
  add: (v, a) => toNum(v) + toNum(a[0]),
  // HA registers this as a filter as well as a global.
  iif: (v, a) => (truthy(v) ? a[0] : a[1] === undefined ? '' : a[1]),
  regex_match: (v, a) => new RegExp(String(a[0] ?? ''), truthy(a[1]) ? 'i' : '').test(toOutput(v)),
  regex_search: (v, a) => new RegExp(String(a[0] ?? ''), truthy(a[1]) ? 'i' : '').test(toOutput(v)),
  regex_replace: (v, a) =>
    toOutput(v).replace(new RegExp(String(a[0] ?? ''), 'g'), String(a[1] ?? '')),
  slugify: v => toOutput(v).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
  indent: (v, a) => {
    const width = a[0] === undefined ? 4 : toNum(a[0]);
    return toOutput(v).split('\n').join(`\n${' '.repeat(width)}`);
  },
};

function filterByAttr(v: JValue, a: JValue[], keep: boolean): JValue[] {
  const attr = String(a[0] ?? '');
  const test = a[1] === undefined ? 'truthy' : String(a[1]);
  return toList(v).filter(item => applyTest(test, item?.[attr], a.slice(2)) === keep);
}

function jsonSafe(v: JValue): JValue {
  if (v === UNDEF || v === undefined) return null;
  if (Array.isArray(v)) return v.map(jsonSafe);
  if (v && typeof v === 'object') {
    if (typeof v.__date !== 'undefined') return v.__pyStr();
    const out: Record<string, JValue> = {};
    for (const [k, val] of Object.entries(v)) {
      if (k.startsWith('__')) continue;
      out[k] = jsonSafe(val);
    }
    return out;
  }
  return v;
}

/* ───────────────────────────── tests ───────────────────────────── */

function applyTest(name: string, value: JValue, args: JValue[]): boolean {
  switch (name) {
    case 'defined': return value !== UNDEF && value !== undefined;
    case 'undefined': return value === UNDEF || value === undefined;
    case 'none': return value === null;
    case 'number': return typeof value === 'number';
    case 'string': return typeof value === 'string';
    case 'boolean': return typeof value === 'boolean';
    case 'mapping': return !!value && typeof value === 'object' && !Array.isArray(value);
    case 'sequence': return Array.isArray(value) || typeof value === 'string';
    case 'iterable': return Array.isArray(value) || typeof value === 'string';
    case 'even': return toNum(value) % 2 === 0;
    case 'odd': return Math.abs(toNum(value) % 2) === 1;
    case 'divisibleby': return toNum(value) % toNum(args[0], 1) === 0;
    case 'eq':
    case 'equalto':
    case 'sameas': return looseEquals(value, args[0]);
    case 'ne': return !looseEquals(value, args[0]);
    case 'lt': return toNum(value) < toNum(args[0]);
    case 'le': return toNum(value) <= toNum(args[0]);
    case 'gt': return toNum(value) > toNum(args[0]);
    case 'ge': return toNum(value) >= toNum(args[0]);
    case 'in': return contains(args[0], value);
    case 'match':
    case 'search': return new RegExp(String(args[0] ?? '')).test(toOutput(value));
    case 'truthy': return truthy(value);
    case 'falsy': return !truthy(value);
    default: return truthy(value);
  }
}

function looseEquals(a: JValue, b: JValue): boolean {
  if (a === b) return true;
  if (typeof a === 'number' || typeof b === 'number') {
    const an = typeof a === 'number' ? a : parseFloat(String(a));
    const bn = typeof b === 'number' ? b : parseFloat(String(b));
    if (isFinite(an) && isFinite(bn)) return an === bn;
  }
  if (a === UNDEF || b === UNDEF) return false;
  if (typeof a === 'object' || typeof b === 'object') return pyRepr(a) === pyRepr(b);
  return String(a) === String(b);
}

function contains(haystack: JValue, needle: JValue): boolean {
  if (Array.isArray(haystack)) return haystack.some(i => looseEquals(i, needle));
  if (typeof haystack === 'string') return haystack.includes(toOutput(needle));
  if (haystack && typeof haystack === 'object') return Object.keys(haystack).includes(toOutput(needle));
  return false;
}

/* ──────────────────────── expression tokenizer ──────────────────────── */

interface Token {
  kind: 'num' | 'str' | 'name' | 'op' | 'eof';
  value: string | number;
}

const OPERATORS = ['//', '**', '==', '!=', '>=', '<=', '~', '+', '-', '*', '/', '%', '(', ')', '[', ']', '{', '}', ',', '.', ':', '|', '=', '<', '>'];

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let str = '';
      i++;
      while (i < src.length && src[i] !== ch) {
        if (src[i] === '\\') {
          const next = src[i + 1];
          str += next === 'n' ? '\n' : next === 't' ? '\t' : next === 'r' ? '\r' : next;
          i += 2;
          continue;
        }
        str += src[i++];
      }
      i++;
      out.push({ kind: 'str', value: str });
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let num = '';
      while (i < src.length && /[0-9._]/.test(src[i])) num += src[i++];
      out.push({ kind: 'num', value: parseFloat(num.replace(/_/g, '')) });
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let name = '';
      while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) name += src[i++];
      out.push({ kind: 'name', value: name });
      continue;
    }
    const op = OPERATORS.find(o => src.startsWith(o, i));
    if (op) {
      out.push({ kind: 'op', value: op });
      i += op.length;
      continue;
    }
    // Unknown character — skip it rather than aborting the whole render.
    i++;
  }
  out.push({ kind: 'eof', value: '' });
  return out;
}

/* ──────────────────────── expression parser ──────────────────────── */

type Expr =
  | { k: 'lit'; v: JValue }
  | { k: 'name'; n: string }
  | { k: 'attr'; o: Expr; n: string }
  | { k: 'index'; o: Expr; i: Expr }
  | { k: 'call'; f: Expr; args: Expr[]; kwargs: Record<string, Expr> }
  | { k: 'filter'; o: Expr; n: string; args: Expr[]; kwargs: Record<string, Expr> }
  | { k: 'test'; o: Expr; n: string; args: Expr[]; negate: boolean }
  | { k: 'unary'; op: string; o: Expr }
  | { k: 'bin'; op: string; l: Expr; r: Expr }
  | { k: 'and'; l: Expr; r: Expr }
  | { k: 'or'; l: Expr; r: Expr }
  | { k: 'not'; o: Expr }
  | { k: 'ternary'; cond: Expr; then: Expr; other?: Expr | undefined }
  | { k: 'list'; items: Expr[] }
  | { k: 'dict'; entries: [Expr, Expr][] };

class ExprParser {
  private pos = 0;

  constructor(private toks: Token[]) {}

  private peek(): Token {
    return this.toks[this.pos];
  }

  private isOp(v: string): boolean {
    const t = this.peek();
    return t.kind === 'op' && t.value === v;
  }

  private isName(v: string): boolean {
    const t = this.peek();
    return t.kind === 'name' && t.value === v;
  }

  private eat(v?: string): Token {
    const t = this.toks[this.pos++];
    if (v !== undefined && t.value !== v) {
      throw new Error(`expected "${v}" but found "${String(t.value)}"`);
    }
    return t;
  }

  parse(): Expr {
    const e = this.parseTernary();
    return e;
  }

  atEnd(): boolean {
    return this.peek().kind === 'eof';
  }

  /** Jinja's inline conditional: `a if cond else b` (else is optional). */
  private parseTernary(): Expr {
    const then = this.parseOr();
    if (this.isName('if')) {
      this.eat();
      const cond = this.parseOr();
      let other: Expr | undefined;
      if (this.isName('else')) {
        this.eat();
        other = this.parseTernary();
      }
      return { k: 'ternary', cond, then, other };
    }
    return then;
  }

  private parseOr(): Expr {
    let l = this.parseAnd();
    while (this.isName('or')) {
      this.eat();
      l = { k: 'or', l, r: this.parseAnd() };
    }
    return l;
  }

  private parseAnd(): Expr {
    let l = this.parseNot();
    while (this.isName('and')) {
      this.eat();
      l = { k: 'and', l, r: this.parseNot() };
    }
    return l;
  }

  private parseNot(): Expr {
    if (this.isName('not')) {
      this.eat();
      return { k: 'not', o: this.parseNot() };
    }
    return this.parseCompare();
  }

  private parseCompare(): Expr {
    let l = this.parseConcat();
    for (;;) {
      const t = this.peek();
      if (t.kind === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(String(t.value))) {
        this.eat();
        l = { k: 'bin', op: String(t.value), l, r: this.parseConcat() };
        continue;
      }
      if (this.isName('in')) {
        this.eat();
        l = { k: 'bin', op: 'in', l, r: this.parseConcat() };
        continue;
      }
      if (this.isName('not') && this.toks[this.pos + 1]?.value === 'in') {
        this.eat();
        this.eat();
        l = { k: 'not', o: { k: 'bin', op: 'in', l, r: this.parseConcat() } };
        continue;
      }
      if (this.isName('is')) {
        this.eat();
        let negate = false;
        if (this.isName('not')) {
          this.eat();
          negate = true;
        }
        const name = String(this.eat().value);
        const args: Expr[] = [];
        if (this.isOp('(')) {
          this.eat('(');
          while (!this.isOp(')')) {
            args.push(this.parseTernary());
            if (this.isOp(',')) this.eat(',');
          }
          this.eat(')');
        } else if (['eq', 'equalto', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'divisibleby', 'match', 'search'].includes(name)) {
          args.push(this.parseConcat());
        }
        l = { k: 'test', o: l, n: name, args, negate };
        continue;
      }
      return l;
    }
  }

  private parseConcat(): Expr {
    let l = this.parseAdd();
    while (this.isOp('~')) {
      this.eat();
      l = { k: 'bin', op: '~', l, r: this.parseAdd() };
    }
    return l;
  }

  private parseAdd(): Expr {
    let l = this.parseMul();
    while (this.isOp('+') || this.isOp('-')) {
      const op = String(this.eat().value);
      l = { k: 'bin', op, l, r: this.parseMul() };
    }
    return l;
  }

  private parseMul(): Expr {
    let l = this.parsePow();
    while (this.isOp('*') || this.isOp('/') || this.isOp('//') || this.isOp('%')) {
      const op = String(this.eat().value);
      l = { k: 'bin', op, l, r: this.parsePow() };
    }
    return l;
  }

  private parsePow(): Expr {
    const l = this.parseUnary();
    if (this.isOp('**')) {
      this.eat();
      return { k: 'bin', op: '**', l, r: this.parseUnary() };
    }
    return l;
  }

  private parseUnary(): Expr {
    if (this.isOp('-') || this.isOp('+')) {
      const op = String(this.eat().value);
      return { k: 'unary', op, o: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  /** Attribute/index/call/filter chains all bind tighter than arithmetic. */
  private parsePostfix(): Expr {
    let o = this.parsePrimary();
    for (;;) {
      if (this.isOp('.')) {
        this.eat();
        o = { k: 'attr', o, n: String(this.eat().value) };
        continue;
      }
      if (this.isOp('[')) {
        this.eat('[');
        const i = this.parseTernary();
        this.eat(']');
        o = { k: 'index', o, i };
        continue;
      }
      if (this.isOp('(')) {
        const { args, kwargs } = this.parseArgs();
        o = { k: 'call', f: o, args, kwargs };
        continue;
      }
      if (this.isOp('|')) {
        this.eat();
        const n = String(this.eat().value);
        let args: Expr[] = [];
        let kwargs: Record<string, Expr> = {};
        if (this.isOp('(')) {
          ({ args, kwargs } = this.parseArgs());
        }
        o = { k: 'filter', o, n, args, kwargs };
        continue;
      }
      return o;
    }
  }

  private parseArgs(): { args: Expr[]; kwargs: Record<string, Expr> } {
    this.eat('(');
    const args: Expr[] = [];
    const kwargs: Record<string, Expr> = {};
    while (!this.isOp(')')) {
      const isKwarg =
        this.peek().kind === 'name' &&
        this.toks[this.pos + 1]?.kind === 'op' &&
        this.toks[this.pos + 1]?.value === '=';
      if (isKwarg) {
        const name = String(this.eat().value);
        this.eat('=');
        kwargs[name] = this.parseTernary();
      } else {
        args.push(this.parseTernary());
      }
      if (this.isOp(',')) this.eat(',');
      else break;
    }
    this.eat(')');
    return { args, kwargs };
  }

  private parsePrimary(): Expr {
    const t = this.peek();
    if (t.kind === 'num' || t.kind === 'str') {
      this.eat();
      return { k: 'lit', v: t.value };
    }
    if (t.kind === 'name') {
      const name = String(t.value);
      if (name === 'true' || name === 'True') {
        this.eat();
        return { k: 'lit', v: true };
      }
      if (name === 'false' || name === 'False') {
        this.eat();
        return { k: 'lit', v: false };
      }
      if (name === 'none' || name === 'None') {
        this.eat();
        return { k: 'lit', v: null };
      }
      this.eat();
      return { k: 'name', n: name };
    }
    if (this.isOp('(')) {
      this.eat('(');
      const e = this.parseTernary();
      this.eat(')');
      return e;
    }
    if (this.isOp('[')) {
      this.eat('[');
      const items: Expr[] = [];
      while (!this.isOp(']')) {
        items.push(this.parseTernary());
        if (this.isOp(',')) this.eat(',');
        else break;
      }
      this.eat(']');
      return { k: 'list', items };
    }
    if (this.isOp('{')) {
      this.eat('{');
      const entries: [Expr, Expr][] = [];
      while (!this.isOp('}')) {
        const key = this.parseTernary();
        this.eat(':');
        entries.push([key, this.parseTernary()]);
        if (this.isOp(',')) this.eat(',');
        else break;
      }
      this.eat('}');
      return { k: 'dict', entries };
    }
    throw new Error(`unexpected token "${String(t.value)}"`);
  }
}

function parseExpression(src: string): Expr {
  return new ExprParser(tokenize(src)).parse();
}

/* ──────────────────────── template parser ──────────────────────── */

type Node =
  | { k: 'text'; v: string }
  | { k: 'out'; e: Expr }
  | { k: 'if'; branches: { cond?: Expr | undefined; body: Node[] }[] }
  | { k: 'for'; targets: string[]; iter: Expr; body: Node[]; elseBody?: Node[] | undefined }
  | { k: 'set'; target: string[]; e?: Expr | undefined; body?: Node[] | undefined };

interface Tag {
  kind: 'text' | 'out' | 'block';
  src: string;
  trimBefore: boolean;
  trimAfter: boolean;
}

/** Split the source into text / `{{ }}` / `{% %}` pieces, honouring `{%- -%}`. */
function lexTemplate(src: string): Tag[] {
  const tags: Tag[] = [];
  let i = 0;
  let text = '';
  const pushText = (trimEnd: boolean) => {
    let value = text;
    if (trimEnd) value = value.replace(/\s+$/, '');
    if (value) tags.push({ kind: 'text', src: value, trimBefore: false, trimAfter: false });
    text = '';
  };
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open === -1 || open === src.length - 1) {
      text += src.slice(i);
      break;
    }
    const marker = src[open + 1];
    if (marker !== '{' && marker !== '%' && marker !== '#') {
      text += src.slice(i, open + 1);
      i = open + 1;
      continue;
    }
    text += src.slice(i, open);
    const closeTag = marker === '{' ? '}}' : marker === '%' ? '%}' : '#}';
    let cursor = open + 2;
    let trimBefore = false;
    if (src[cursor] === '-') {
      trimBefore = true;
      cursor++;
    }
    const close = src.indexOf(closeTag, cursor);
    if (close === -1) {
      text += src.slice(open);
      break;
    }
    let body = src.slice(cursor, close);
    let trimAfter = false;
    if (body.endsWith('-')) {
      trimAfter = true;
      body = body.slice(0, -1);
    }
    pushText(trimBefore);
    if (marker === '{') tags.push({ kind: 'out', src: body, trimBefore, trimAfter });
    else if (marker === '%') tags.push({ kind: 'block', src: body.trim(), trimBefore, trimAfter });
    i = close + closeTag.length;
    if (trimAfter) {
      while (i < src.length && /\s/.test(src[i])) i++;
    }
  }
  pushText(false);
  return tags;
}

/** Unsupported blocks whose body must be swallowed, not rendered. */
const BLOCKS_WITH_BODY = new Set(['macro', 'raw', 'block', 'filter', 'call', 'autoescape', 'trans']);

function parseTemplate(src: string): Node[] {
  const tags = lexTemplate(src);
  let pos = 0;

  const blockName = (tag: Tag): string => tag.src.split(/\s+/)[0] || '';

  const parseBody = (stopAt: string[]): { body: Node[]; stopped: Tag | null } => {
    const body: Node[] = [];
    while (pos < tags.length) {
      const tag = tags[pos];
      if (tag.kind === 'block' && stopAt.includes(blockName(tag))) {
        pos++;
        return { body, stopped: tag };
      }
      pos++;
      if (tag.kind === 'text') {
        body.push({ k: 'text', v: tag.src });
        continue;
      }
      if (tag.kind === 'out') {
        body.push({ k: 'out', e: parseExpression(tag.src) });
        continue;
      }
      const name = blockName(tag);
      const rest = tag.src.slice(name.length).trim();
      if (name === 'if') {
        const branches: { cond?: Expr | undefined; body: Node[] }[] = [];
        let cond: Expr | undefined = parseExpression(rest);
        for (;;) {
          const inner = parseBody(['elif', 'else', 'endif']);
          branches.push({ cond, body: inner.body });
          const stopped = inner.stopped;
          if (!stopped || blockName(stopped) === 'endif') break;
          if (blockName(stopped) === 'elif') {
            cond = parseExpression(stopped.src.slice(4).trim());
            continue;
          }
          cond = undefined;
        }
        body.push({ k: 'if', branches });
        continue;
      }
      if (name === 'for') {
        const match = rest.match(/^(.+?)\s+in\s+([\s\S]+)$/);
        if (!match) continue;
        const targets = match[1].split(',').map(s => s.trim());
        const iter = parseExpression(match[2]);
        const inner = parseBody(['else', 'endfor']);
        let elseBody: Node[] | undefined;
        if (inner.stopped && blockName(inner.stopped) === 'else') {
          elseBody = parseBody(['endfor']).body;
        }
        body.push({ k: 'for', targets, iter, body: inner.body, elseBody });
        continue;
      }
      if (name === 'set') {
        const eq = rest.indexOf('=');
        // `{% set x %}...{% endset %}` captures the rendered block instead.
        if (eq === -1) {
          const inner = parseBody(['endset']);
          body.push({ k: 'set', target: rest.split('.'), body: inner.body });
          continue;
        }
        const target = rest.slice(0, eq).trim().split('.');
        body.push({ k: 'set', target, e: parseExpression(rest.slice(eq + 1)) });
        continue;
      }
      if (name === 'with') {
        body.push(...parseBody(['endwith']).body);
        continue;
      }
      // Unsupported blocks render as nothing. Those that wrap a body have it
      // discarded too, so a `{% macro %}` definition doesn't leak its contents.
      if (BLOCKS_WITH_BODY.has(name)) {
        parseBody([`end${name}`]);
      }
    }
    return { body, stopped: null };
  };

  return parseBody([]).body;
}

/* ──────────────────────────── evaluation ──────────────────────────── */

class Scope {
  private vars: Record<string, JValue>;

  constructor(vars: Record<string, JValue>, private parent?: Scope) {
    this.vars = vars;
  }

  get(name: string): JValue {
    if (name in this.vars) return this.vars[name];
    if (this.parent) return this.parent.get(name);
    return UNDEF;
  }

  has(name: string): boolean {
    return name in this.vars || (this.parent ? this.parent.has(name) : false);
  }

  /** `set` writes to the scope that already owns the name (namespaces aside). */
  set(name: string, value: JValue): void {
    let owner: Scope | undefined = this;
    while (owner && !(name in owner.vars)) owner = owner.parent;
    (owner || this).vars[name] = value;
  }

  declare(name: string, value: JValue): void {
    this.vars[name] = value;
  }

  child(vars: Record<string, JValue> = {}): Scope {
    return new Scope(vars, this);
  }
}

function evalExpr(e: Expr, scope: Scope): JValue {
  switch (e.k) {
    case 'lit':
      return e.v;
    case 'name':
      return scope.get(e.n);
    case 'attr': {
      const o = evalExpr(e.o, scope);
      return member(o, e.n);
    }
    case 'index': {
      const o = evalExpr(e.o, scope);
      const i = evalExpr(e.i, scope);
      if (Array.isArray(o)) {
        const n = toNum(i);
        return o[n < 0 ? o.length + n : n] ?? UNDEF;
      }
      return member(o, toOutput(i));
    }
    case 'call': {
      const fn = evalExpr(e.f, scope);
      const args = e.args.map(a => evalExpr(a, scope));
      const kwargs = mapValues(e.kwargs, v => evalExpr(v, scope));
      if (typeof fn !== 'function') return UNDEF;
      // Python-style kwargs arrive as a trailing object (namespace(), dict()).
      return Object.keys(kwargs).length ? fn(...args, kwargs) : fn(...args);
    }
    case 'filter': {
      const value = evalExpr(e.o, scope);
      const filter = FILTERS[e.n];
      if (!filter) return value;
      return filter(
        value,
        e.args.map(a => evalExpr(a, scope)),
        mapValues(e.kwargs, v => evalExpr(v, scope))
      );
    }
    case 'test': {
      const value = evalExpr(e.o, scope);
      const result = applyTest(
        e.n,
        value,
        e.args.map(a => evalExpr(a, scope))
      );
      return e.negate ? !result : result;
    }
    case 'unary': {
      const v = toNum(evalExpr(e.o, scope));
      return e.op === '-' ? -v : v;
    }
    case 'bin':
      return binary(e.op, evalExpr(e.l, scope), evalExpr(e.r, scope));
    case 'and':
      return truthy(evalExpr(e.l, scope)) ? evalExpr(e.r, scope) : false;
    case 'or': {
      const l = evalExpr(e.l, scope);
      return truthy(l) ? l : evalExpr(e.r, scope);
    }
    case 'not':
      return !truthy(evalExpr(e.o, scope));
    case 'ternary':
      return truthy(evalExpr(e.cond, scope))
        ? evalExpr(e.then, scope)
        : e.other
          ? evalExpr(e.other, scope)
          : UNDEF;
    case 'list':
      return e.items.map(i => evalExpr(i, scope));
    case 'dict': {
      const out: Record<string, JValue> = {};
      for (const [k, v] of e.entries) out[toOutput(evalExpr(k, scope))] = evalExpr(v, scope);
      return out;
    }
  }
}

function mapValues<T, R>(o: Record<string, T>, f: (v: T) => R): Record<string, R> {
  const out: Record<string, R> = {};
  for (const [k, v] of Object.entries(o)) out[k] = f(v);
  return out;
}

/** Attribute access, including the string/list/dict methods HA users call. */
function member(o: JValue, name: string): JValue {
  if (o === UNDEF || o === undefined || o === null) return UNDEF;
  if (typeof o === 'string') {
    switch (name) {
      case 'split': return (sep?: JValue) => (sep === undefined ? o.split(/\s+/) : o.split(String(sep)));
      case 'strip': return () => o.trim();
      case 'lstrip': return () => o.replace(/^\s+/, '');
      case 'rstrip': return () => o.replace(/\s+$/, '');
      case 'lower': return () => o.toLowerCase();
      case 'upper': return () => o.toUpperCase();
      case 'title': return () => FILTERS.title(o, [], {});
      case 'startswith': return (p: JValue) => o.startsWith(String(p));
      case 'endswith': return (p: JValue) => o.endsWith(String(p));
      case 'replace': return (a: JValue, b: JValue) => o.split(String(a)).join(String(b));
      default: return UNDEF;
    }
  }
  if (Array.isArray(o)) {
    switch (name) {
      case 'append': return (v: JValue) => {
        o.push(v);
        return UNDEF;
      };
      case 'count': return () => o.length;
      case 'index': return (v: JValue) => o.findIndex(i => looseEquals(i, v));
      default: return UNDEF;
    }
  }
  // `states` is a callable proxy, so a domain walk lands here rather than on a
  // plain object.
  if (typeof o === 'function') {
    const v = (o as Record<string, JValue>)[name];
    return v === undefined ? UNDEF : v;
  }
  if (typeof o === 'object') {
    switch (name) {
      case 'items':
        if (!('items' in o)) return () => Object.entries(o);
        break;
      case 'keys':
        if (!('keys' in o)) return () => Object.keys(o);
        break;
      case 'values':
        if (!('values' in o)) return () => Object.values(o);
        break;
      case 'get':
        if (!('get' in o)) return (k: JValue, d?: JValue) => o[toOutput(k)] ?? (d === undefined ? UNDEF : d);
        break;
    }
    const v = o[name];
    return v === undefined ? UNDEF : v;
  }
  return UNDEF;
}

function binary(op: string, l: JValue, r: JValue): JValue {
  switch (op) {
    case '+':
      if (typeof l === 'string' || typeof r === 'string') {
        // Jinja would raise here; concatenating is friendlier in a playground.
        if (typeof l === 'string' && typeof r === 'string') return l + r;
      }
      if (Array.isArray(l) && Array.isArray(r)) return [...l, ...r];
      return toNum(l) + toNum(r);
    case '-': return toNum(l) - toNum(r);
    case '*':
      if (typeof l === 'string') return l.repeat(Math.max(0, Math.trunc(toNum(r))));
      return toNum(l) * toNum(r);
    case '/': {
      const d = toNum(r);
      return d === 0 ? 0 : toNum(l) / d;
    }
    case '//': {
      const d = toNum(r);
      return d === 0 ? 0 : Math.floor(toNum(l) / d);
    }
    case '%': {
      const d = toNum(r);
      return d === 0 ? 0 : toNum(l) % d;
    }
    case '**': return Math.pow(toNum(l), toNum(r));
    case '~': return toOutput(l) + toOutput(r);
    case '==': return looseEquals(l, r);
    case '!=': return !looseEquals(l, r);
    case '<': return compare(l, r) < 0;
    case '>': return compare(l, r) > 0;
    case '<=': return compare(l, r) <= 0;
    case '>=': return compare(l, r) >= 0;
    case 'in': return contains(r, l);
    default: return UNDEF;
  }
}

/** Numeric where both sides look numeric, lexicographic otherwise. */
function compare(l: JValue, r: JValue): number {
  const ln = typeof l === 'number' ? l : parseFloat(String(l));
  const rn = typeof r === 'number' ? r : parseFloat(String(r));
  if (isFinite(ln) && isFinite(rn)) return ln === rn ? 0 : ln < rn ? -1 : 1;
  const ls = toOutput(l);
  const rs = toOutput(r);
  return ls === rs ? 0 : ls < rs ? -1 : 1;
}

function execNodes(nodes: Node[], scope: Scope, out: string[]): void {
  for (const node of nodes) {
    switch (node.k) {
      case 'text':
        out.push(node.v);
        break;
      case 'out':
        out.push(toOutput(evalExpr(node.e, scope)));
        break;
      case 'if': {
        for (const branch of node.branches) {
          if (!branch.cond || truthy(evalExpr(branch.cond, scope))) {
            execNodes(branch.body, scope, out);
            break;
          }
        }
        break;
      }
      case 'for': {
        const items = toList(evalExpr(node.iter, scope));
        if (!items.length && node.elseBody) {
          execNodes(node.elseBody, scope, out);
          break;
        }
        items.forEach((item, index) => {
          const loopScope = scope.child({
            loop: {
              index: index + 1,
              index0: index,
              revindex: items.length - index,
              revindex0: items.length - index - 1,
              first: index === 0,
              last: index === items.length - 1,
              length: items.length,
            },
          });
          if (node.targets.length > 1 && Array.isArray(item)) {
            node.targets.forEach((t, ti) => loopScope.declare(t, item[ti] ?? UNDEF));
          } else {
            loopScope.declare(node.targets[0], item);
          }
          execNodes(node.body, loopScope, out);
        });
        break;
      }
      case 'set': {
        let value: JValue;
        if (node.body) {
          const inner: string[] = [];
          execNodes(node.body, scope, inner);
          value = inner.join('');
        } else {
          value = node.e ? evalExpr(node.e, scope) : UNDEF;
        }
        if (node.target.length > 1) {
          // `{% set ns.items = ... %}` mutates the namespace object in place.
          const root = scope.get(node.target[0]);
          if (root && typeof root === 'object') {
            let target = root;
            for (const part of node.target.slice(1, -1)) target = target[part];
            if (target && typeof target === 'object') {
              target[node.target[node.target.length - 1]] = value;
            }
          }
        } else {
          scope.set(node.target[0], value);
        }
        break;
      }
    }
  }
}

/* ────────────────────────────── public API ────────────────────────────── */

/** Parsed templates are reused — a subscription re-renders on every state tick. */
const templateCache = new Map<string, Node[]>();

export interface JinjaRenderResult {
  /** The rendered text, before Home Assistant's literal-eval step. */
  text: string;
  error?: string;
}

export function renderJinjaText(
  template: string,
  hass: JinjaHassLike,
  variables: Record<string, JValue> = {}
): JinjaRenderResult {
  try {
    let nodes = templateCache.get(template);
    if (!nodes) {
      nodes = parseTemplate(template);
      templateCache.set(template, nodes);
    }
    const scope = new Scope({ ...buildGlobals(hass), ...variables });
    const out: string[] = [];
    execNodes(nodes, scope, out);
    return { text: out.join('') };
  } catch (err) {
    return { text: '', error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Mirror `Template.async_render`'s `parse_result` step: Home Assistant runs the
 * rendered string through `ast.literal_eval`, which is why a template that
 * prints `{"fill_area": True}` reaches the card as a real object even though
 * that text is not valid JSON.
 */
export function literalEval(text: string): JValue {
  const trimmed = text.trim();
  if (trimmed === '') return text;
  if (trimmed === 'True') return true;
  if (trimmed === 'False') return false;
  if (trimmed === 'None') return null;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  const isContainer =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'));
  if (!isContainer) return text;
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through to the Python-literal pass */
  }
  try {
    return JSON.parse(pythonLiteralToJson(trimmed));
  } catch {
    return text;
  }
}

/**
 * Rewrite Python literal syntax as JSON: single-quoted strings and
 * `True`/`False`/`None`. Quoted content is copied verbatim so a color like
 * `'None'` or an apostrophe inside a label survives.
 */
function pythonLiteralToJson(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let str = '';
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') {
          str += src[i] + (src[i + 1] ?? '');
          i += 2;
          continue;
        }
        str += src[i++];
      }
      i++;
      out += JSON.stringify(str);
      continue;
    }
    const word = /^(True|False|None)\b/.exec(src.slice(i));
    if (word) {
      out += word[1] === 'True' ? 'true' : word[1] === 'False' ? 'false' : 'null';
      i += word[1].length;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/**
 * Full `render_template` equivalent: render, then literal-eval, so callers get
 * the same shape Home Assistant sends over the websocket.
 */
export function renderTemplate(
  template: string,
  hass: JinjaHassLike,
  variables: Record<string, JValue> = {}
): { result: JValue; error?: string } {
  const { text, error } = renderJinjaText(template, hass, variables);
  if (error) return { result: '', error };
  return { result: literalEval(text) };
}
