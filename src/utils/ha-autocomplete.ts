import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { HomeAssistant } from 'custom-card-helpers';
import { jinja2Keywords, jinja2Filters, haTemplateFunctions } from './jinja2-lang';

/**
 * Home Assistant Autocomplete Provider for CodeMirror
 * Provides intelligent autocomplete for:
 * - Entity IDs from hass.states
 * - Entity attributes
 * - Jinja2 keywords and filters
 * - HA template functions
 */

/**
 * Extract entity IDs from Home Assistant states
 */
function getEntityCompletions(hass: HomeAssistant): Completion[] {
  if (!hass || !hass.states) return [];

  return Object.keys(hass.states).map(entityId => ({
    label: entityId,
    type: 'variable',
    detail: hass.states[entityId].attributes.friendly_name || 'entity',
    info: `State: ${hass.states[entityId].state}`,
  }));
}

/**
 * Get attributes from a specific entity
 */
function getEntityAttributes(hass: HomeAssistant, entityId: string): Completion[] {
  if (!hass || !hass.states || !hass.states[entityId]) return [];

  const entity = hass.states[entityId];
  const attributes = Object.keys(entity.attributes || {});

  return attributes.map(attr => ({
    label: attr,
    type: 'property',
    detail: 'attribute',
    info: `${String(entity.attributes[attr])}`,
  }));
}

/**
 * Get completions for domains (light, switch, sensor, etc.)
 */
function getDomainCompletions(hass: HomeAssistant): Completion[] {
  if (!hass || !hass.states) return [];

  const domains = new Set<string>();
  Object.keys(hass.states).forEach(entityId => {
    const domain = entityId.split('.')[0];
    domains.add(domain);
  });

  return Array.from(domains).map(domain => ({
    label: domain,
    type: 'namespace',
    detail: 'domain',
  }));
}

/**
 * Get Jinja2 keyword completions
 */
function getJinja2KeywordCompletions(): Completion[] {
  return jinja2Keywords.map(kw => ({
    label: kw,
    type: 'keyword',
  }));
}

/**
 * Get Jinja2 filter completions
 */
function getJinja2FilterCompletions(): Completion[] {
  return jinja2Filters.map(filter => ({
    label: filter,
    type: 'function',
    detail: 'filter',
    apply: filter,
  }));
}

/**
 * Get HA template function completions
 */
function getHAFunctionCompletions(): Completion[] {
  return haTemplateFunctions.map(fn => ({
    label: fn,
    type: 'function',
    detail: 'HA function',
    apply: fn.includes('(') ? fn : `${fn}()`,
  }));
}

/**
 * Main autocomplete function for Home Assistant templates
 */
export function haTemplateAutocomplete(hass: HomeAssistant) {
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w.]+/);
    if (!word) return null;

    const text = context.state.doc.toString();
    const pos = context.pos;

    // Get text before cursor
    const textBefore = text.substring(0, pos);
    const textAfter = text.substring(pos);

    // Check if we're inside {{ }} or {% %}
    const inVariable = textBefore.lastIndexOf('{{') > textBefore.lastIndexOf('}}');
    const inBlock = textBefore.lastIndexOf('{%') > textBefore.lastIndexOf('%}');
    const inTemplate = inVariable || inBlock;

    if (!inTemplate && word.from === word.to) return null;

    const completions: Completion[] = [];

    // Check context for more specific completions
    const wordText = word.text;

    // If we're typing after 'states(' or 'is_state(' etc., suggest entities
    if (/states\(['"]?$/.test(textBefore) || /is_state\(['"]?$/.test(textBefore)) {
      completions.push(...getEntityCompletions(hass));
    }
    // If we're typing after 'state_attr(' suggest entity then attribute
    else if (/state_attr\(['"][^'"]*['"],\s*['"]?$/.test(textBefore)) {
      // Extract entity ID from the function call
      const match = textBefore.match(/state_attr\(['"]([^'"]+)['"]/);
      if (match && match[1]) {
        completions.push(...getEntityAttributes(hass, match[1]));
      }
    }
    // If we see a pipe, suggest filters
    else if (/\|\s*\w*$/.test(textBefore)) {
      completions.push(...getJinja2FilterCompletions());
    }
    // If after 'states.', suggest domains
    else if (/states\.\w*$/.test(textBefore)) {
      completions.push(...getDomainCompletions(hass));
    }
    // Check if typing an entity ID pattern (domain.name)
    else if (/^[\w]+\.[\w]*$/.test(wordText) || /['"][\w]+\.[\w]*$/.test(textBefore)) {
      completions.push(...getEntityCompletions(hass));
    }
    // General context: show all available completions
    else {
      // Add keywords if in block
      if (inBlock) {
        completions.push(...getJinja2KeywordCompletions());
      }

      // Always suggest functions and entities
      completions.push(
        ...getHAFunctionCompletions(),
        ...getEntityCompletions(hass),
        ...getJinja2FilterCompletions()
      );
    }

    // Remove duplicates and sort
    const uniqueCompletions = Array.from(new Map(completions.map(c => [c.label, c])).values());

    return {
      from: word.from,
      to: word.to,
      options: uniqueCompletions,
      validFor: /^[\w.]*$/,
    };
  };
}

/**
 * Simple autocomplete for just entities (for specific use cases)
 */
export function entityAutocomplete(hass: HomeAssistant) {
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w.]+/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    return {
      from: word.from,
      to: word.to,
      options: getEntityCompletions(hass),
      validFor: /^[\w.]*$/,
    };
  };
}
