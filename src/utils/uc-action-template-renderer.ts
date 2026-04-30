import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import { preprocessTemplateVariables } from './uc-template-processor';

/**
 * Action template renderer
 *
 * Resolves Jinja templates inside tap/hold/double-tap action configs at the
 * moment the action fires. This is a one-shot render via HA's REST template
 * endpoint (`POST /api/template`) — no websocket subscription is held open
 * for actions that may never trigger.
 *
 * Supported fields (rendered when the value is a string and contains `{{` or
 * `{%`):
 *   - `url_path`         (url action)
 *   - `navigation_path`  (navigate action)
 *   - `entity`           (more-info / toggle action)
 *   - String values inside `data`, `service_data`, and `target`
 *     (perform-action) are deep-walked. HA itself does not template
 *     client-initiated `callService` payloads, so we resolve them here.
 *
 * Entity context (`{{ state }}`, `{{ attributes.foo }}`, etc.) is injected for
 * the action's resolved entity — falling back to the module's primary entity
 * when the action doesn't specify one.
 */

const TEMPLATE_PATTERN = /\{\{|\{%/;

/** Returns true when the value is a string that contains a Jinja template. */
export function containsTemplate(value: unknown): value is string {
  return typeof value === 'string' && TEMPLATE_PATTERN.test(value);
}

/**
 * Minimal, bulletproof entity context for action templates.
 *
 * Just two `{% set %}` injections that never fail at render time:
 *   - `entity`  → the entity id (string literal)
 *   - `state`   → `states('<id>')` (HA's documented function, returns string state or None)
 *
 * Anything more (attributes, unit, friendly_name, etc.) the user can read
 * via HA's standard Jinja globals: `state_attr('id', 'attr')`,
 * `states.sensor.foo.attributes.x`, etc. Keeping the injection minimal avoids
 * the strict-render errors the shared `injectEntityContextIntoTemplate` helper
 * triggers on HA's REST `/api/template` endpoint when context-setters reference
 * attributes on undefined or string-typed values.
 */
function injectMinimalActionContext(template: string, entityId?: string): string {
  if (!entityId || typeof entityId !== 'string' || entityId.trim() === '') {
    return template;
  }
  const safeId = entityId.trim().replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const injection = [
    `{% set entity = '${safeId}' %}`,
    `{% set state = states('${safeId}') %}`,
  ].join('\n');
  return `${injection}\n${template}`;
}

/**
 * Render a single template string via HA's REST template endpoint.
 * Returns the rendered string, or the original input if rendering fails or
 * `hass` cannot make API calls. Custom Ultra Card variables (`$var_name`) are
 * resolved before the template is sent to HA.
 */
export async function renderActionTemplate(
  template: string,
  hass: HomeAssistant,
  contextEntityId?: string,
  cardConfig?: UltraCardConfig
): Promise<string> {
  if (!hass?.callApi || !containsTemplate(template)) {
    return template;
  }

  try {
    const withVars = preprocessTemplateVariables(template, hass, cardConfig);
    const withContext = injectMinimalActionContext(withVars, contextEntityId);

    const result = await hass.callApi<string>('POST', 'template', {
      template: withContext,
    });
    return typeof result === 'string' ? result : template;
  } catch (err) {
    // Surface the message string from HA so users can debug their template.
    const msg =
      (err as { message?: string; body?: string })?.message ||
      (err as { body?: string })?.body ||
      String(err);
    console.warn(
      `[UltraCard] Action template render failed for "${template}":\n  ${msg}`
    );
    return template;
  }
}

/**
 * Recursively render every string value inside an object that looks like a
 * template. Non-string values pass through untouched. Returns a fresh object
 * — the input is not mutated.
 */
export async function renderTemplateValues<T>(
  value: T,
  hass: HomeAssistant,
  contextEntityId?: string,
  cardConfig?: UltraCardConfig
): Promise<T> {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return (await renderActionTemplate(
      value,
      hass,
      contextEntityId,
      cardConfig
    )) as unknown as T;
  }

  if (Array.isArray(value)) {
    const out = await Promise.all(
      value.map(item => renderTemplateValues(item, hass, contextEntityId, cardConfig))
    );
    return out as unknown as T;
  }

  if (typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(async ([k, v]) => [
        k,
        await renderTemplateValues(v, hass, contextEntityId, cardConfig),
      ])
    );
    return Object.fromEntries(entries) as T;
  }

  return value;
}
