import { localize } from '../localize/localize';

/**
 * Options for Home Assistant `ha-select` (`.options` API). Slotted `mwc-list-item`
 * children are not reliably wired to selection on current HA `ha-select` (ha-dropdown).
 */
export function ucVariableValueTypeHaSelectOptions(
  lang: string,
  labelStyle: 'short' | 'long'
): Array<{ value: string; label: string }> {
  if (labelStyle === 'long') {
    return [
      {
        value: 'entity_id',
        label: localize(
          'editor.custom_variables.value_type_entity_id_desc',
          lang,
          'Entity ID (e.g., sensor.temperature)'
        ),
      },
      {
        value: 'state',
        label: localize(
          'editor.custom_variables.value_type_state_desc',
          lang,
          'State Value (e.g., 23.5)'
        ),
      },
      {
        value: 'attribute',
        label: localize(
          'editor.custom_variables.value_type_attribute_desc',
          lang,
          'Attribute Value (e.g., temperature, friendly_name)'
        ),
      },
    ];
  }
  return [
    {
      value: 'entity_id',
      label: localize('editor.custom_variables.value_type_entity_id', lang, 'Entity ID'),
    },
    {
      value: 'state',
      label: localize('editor.custom_variables.value_type_state', lang, 'State'),
    },
    {
      value: 'attribute',
      label: localize('editor.custom_variables.value_type_attribute', lang, 'Attribute'),
    },
  ];
}
