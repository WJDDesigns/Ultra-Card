import { LanguageSupport, StreamLanguage } from '@codemirror/language';
import { completeFromList, autocompletion } from '@codemirror/autocomplete';

// Jinja2 language definition for CodeMirror 6
// Provides syntax highlighting for Home Assistant templates
// Using a simple StreamLanguage for now (can be enhanced with Lezer parser later)

/**
 * Jinja2 keywords used in Home Assistant templates
 */
export const jinja2Keywords = [
  'if',
  'elif',
  'else',
  'endif',
  'for',
  'endfor',
  'in',
  'is',
  'not',
  'and',
  'or',
  'true',
  'false',
  'none',
  'True',
  'False',
  'None',
  'set',
  'endset',
  'block',
  'endblock',
  'macro',
  'endmacro',
  'call',
  'endcall',
  'filter',
  'endfilter',
];

/**
 * Common Jinja2 filters available in Home Assistant
 */
export const jinja2Filters = [
  'abs',
  'attr',
  'batch',
  'capitalize',
  'center',
  'default',
  'dictsort',
  'escape',
  'filesizeformat',
  'first',
  'float',
  'forceescape',
  'format',
  'groupby',
  'indent',
  'int',
  'join',
  'last',
  'length',
  'list',
  'lower',
  'map',
  'max',
  'min',
  'pprint',
  'random',
  'reject',
  'rejectattr',
  'replace',
  'reverse',
  'round',
  'safe',
  'select',
  'selectattr',
  'slice',
  'sort',
  'string',
  'striptags',
  'sum',
  'title',
  'tojson',
  'trim',
  'truncate',
  'unique',
  'upper',
  'urlencode',
  'urlize',
  'wordcount',
  'wordwrap',
  'xmlattr',
  // HA specific filters
  'as_timestamp',
  'timestamp_custom',
  'timestamp_local',
  'timestamp_utc',
  'is_defined',
  'regex_match',
  'regex_replace',
  'regex_search',
  'regex_findall',
  'distance',
  'closest',
  'expand',
  'device_entities',
  'integration_entities',
  'area_entities',
  'area_devices',
  'slugify',
];

/**
 * Home Assistant template functions
 */
export const haTemplateFunctions = [
  'states',
  'state_attr',
  'is_state',
  'is_state_attr',
  'has_value',
  'states.domain',
  'now',
  'today_at',
  'utcnow',
  'as_datetime',
  'as_local',
  'as_timestamp',
  'device_id',
  'device_attr',
  'is_device_attr',
  'area_id',
  'area_name',
  'area_entities',
  'area_devices',
  'integration_entities',
  'device_entities',
  'closest',
  'distance',
  'expand',
  'log',
  'sin',
  'cos',
  'tan',
  'sqrt',
  'e',
  'pi',
  'max',
  'min',
  'float',
  'int',
  'bool',
  'round',
];

/**
 * Autocomplete for Jinja2 keywords, filters, and functions
 */
export const jinja2Completions = completeFromList([
  ...jinja2Keywords.map(kw => ({ label: kw, type: 'keyword' })),
  ...jinja2Filters.map(filter => ({ label: filter, type: 'function', detail: 'filter' })),
  ...haTemplateFunctions.map(fn => ({
    label: fn,
    type: 'function',
    detail: 'HA function',
    apply: fn.endsWith(')') ? fn : `${fn}()`,
  })),
]);

/**
 * Simple stream-based Jinja2 language for CodeMirror
 * Provides basic syntax highlighting without a full parser
 */
const jinja2StreamLanguage = StreamLanguage.define({
  startState: () => ({ inBlock: false, inVariable: false }),
  token: (stream, state) => {
    // Check for Jinja2 block start
    if (stream.match('{{')) {
      state.inVariable = true;
      return 'bracket';
    }
    if (stream.match('}}')) {
      state.inVariable = false;
      return 'bracket';
    }
    if (stream.match('{%')) {
      state.inBlock = true;
      return 'bracket';
    }
    if (stream.match('%}')) {
      state.inBlock = false;
      return 'bracket';
    }
    if (stream.match('{#')) {
      stream.skipToEnd();
      return 'comment';
    }

    // Inside template blocks
    if (state.inBlock || state.inVariable) {
      // Keywords
      if (stream.match(/\b(if|elif|else|endif|for|endfor|in|is|not|and|or|true|false|none)\b/i)) {
        return 'keyword';
      }
      // Functions
      if (stream.match(/\b(states|state_attr|is_state|now|as_timestamp)\b/)) {
        return 'function';
      }
      // Strings
      if (stream.match(/"([^"\\]|\\.)*"/) || stream.match(/'([^'\\]|\\.)*'/)) {
        return 'string';
      }
      // Numbers
      if (stream.match(/\b\d+(\.\d+)?\b/)) {
        return 'number';
      }
      // Filter pipe
      if (stream.match('|')) {
        return 'operator';
      }
    }

    stream.next();
    return null;
  },
});

/**
 * Create a complete Jinja2 language support for CodeMirror
 */
export function jinja2() {
  return new LanguageSupport(jinja2StreamLanguage, [
    autocompletion({ override: [jinja2Completions] }),
  ]);
}
