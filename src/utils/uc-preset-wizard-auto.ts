import type { HomeAssistant } from 'custom-card-helpers';
import type { EntityReference, PresetWizardConfig, PresetWizardField } from '../types';

/**
 * Infer Home Assistant entity domain for preset references that are not `domain.object_id`.
 * e.g. `$alarm_control_panel` → `alarm_control_panel` when states include `alarm_control_panel.*`.
 */
export function inferEntityDomainFromReference(
  hass: HomeAssistant,
  entityId: string
): string | undefined {
  if (!entityId || !hass?.states) return undefined;
  const states = hass.states;
  if (states[entityId]) {
    const parts = entityId.split('.');
    return parts.length > 1 ? parts[0] : undefined;
  }
  if (entityId.includes('.')) {
    const d = entityId.split('.')[0];
    return d && !d.startsWith('$') ? d : undefined;
  }
  if (entityId.startsWith('$')) {
    const name = entityId.slice(1);
    if (!name) return undefined;
    const prefix = `${name}.`;
    if (Object.keys(states).some(k => k.startsWith(prefix))) {
      return name;
    }
  }
  return undefined;
}

function fieldIdFromEntityId(entityId: string): string {
  const safe = entityId.replace(/[^a-zA-Z0-9_]/g, '_');
  return `uc_wiz_${safe || 'entity'}`;
}

/**
 * Build a single-step wizard so every preset gets guided mapping without author metadata.
 * One field per unique reference (variables like `$foo` map once for all usages).
 */
export function buildAutoPresetWizard(
  hass: HomeAssistant,
  refs: EntityReference[]
): PresetWizardConfig | null {
  if (!refs?.length) return null;

  const seen = new Set<string>();
  const fields: PresetWizardField[] = [];

  for (const ref of refs) {
    const id = ref.entityId;
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const domain = inferEntityDomainFromReference(hass, id);
    const contexts = refs
      .filter(r => r.entityId === id)
      .map(r => r.context)
      .filter((c): c is string => Boolean(c));
    const uniqueCtx = Array.from(new Set(contexts));
    const desc =
      uniqueCtx.length > 0
        ? uniqueCtx.join(' · ')
        : `Used in ${ref.moduleType} module(s) in this preset`;

    fields.push({
      id: fieldIdFromEntityId(id),
      label: id.startsWith('$') ? `Variable: ${id}` : id,
      description: desc,
      type: 'entity',
      required: true,
      ...(domain ? { entityDomain: domain } : {}),
      targetEntityIds: [id],
    });
  }

  if (!fields.length) return null;

  return {
    steps: [
      {
        id: 'map_entities',
        title: 'Map entities',
        description:
          'Choose Home Assistant entities for each placeholder. Custom variables (names starting with $) must be mapped to a real entity.',
        fields,
      },
    ],
  };
}
