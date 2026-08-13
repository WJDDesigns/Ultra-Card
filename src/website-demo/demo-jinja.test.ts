import { describe, it, expect } from 'vitest';
import { renderJinjaText, renderTemplate, literalEval } from './demo-jinja';

const hass = {
  states: {
    'sensor.temperature': {
      entity_id: 'sensor.temperature',
      state: '31.4',
      attributes: {
        friendly_name: 'Living Room Temperature',
        unit_of_measurement: '°C',
        device_class: 'temperature',
      },
    },
    'sensor.battery': {
      entity_id: 'sensor.battery',
      state: '18',
      attributes: { friendly_name: 'Phone Battery', unit_of_measurement: '%' },
    },
    'sensor.humidity': { entity_id: 'sensor.humidity', state: '54', attributes: {} },
    'sensor.day_period': { entity_id: 'sensor.day_period', state: 'night', attributes: {} },
    'light.kitchen': { entity_id: 'light.kitchen', state: 'on', attributes: { brightness: 180 } },
    'binary_sensor.door': { entity_id: 'binary_sensor.door', state: 'off', attributes: {} },
    'input_boolean.show_section': {
      entity_id: 'input_boolean.show_section',
      state: 'on',
      attributes: {},
    },
    'input_boolean.show_fill': {
      entity_id: 'input_boolean.show_fill',
      state: 'off',
      attributes: {},
    },
    'cover.garage': {
      entity_id: 'cover.garage',
      state: 'open',
      attributes: { current_position: 20 },
    },
    'weather.home': { entity_id: 'weather.home', state: 'sunny', attributes: {} },
    'input_text.guest_wifi_password': {
      entity_id: 'input_text.guest_wifi_password',
      state: 'hunter2',
      attributes: {},
    },
  },
};

/** The entity context Ultra Card injects for a module bound to sensor.temperature. */
const tempContext = {
  entity: 'sensor.temperature',
  state: '31.4',
  name: 'Living Room Temperature',
  friendly_name: 'Living Room Temperature',
  attributes: hass.states['sensor.temperature'].attributes,
  unit: '°C',
  domain: 'sensor',
  device_class: 'temperature',
  state_number: 31.4,
  state_boolean: false,
};

const render = (tpl: string, vars: Record<string, unknown> = {}) =>
  renderJinjaText(tpl, hass, vars).text.trim();

describe('expressions', () => {
  it('reads state via the states() global', () => {
    expect(render("{{ states('sensor.temperature') }}")).toBe('31.4');
  });

  it('reads state via the states object walk', () => {
    expect(render('{{ states.sensor.temperature.state }}')).toBe('31.4');
    expect(render('{{ states.light.kitchen.attributes.brightness }}')).toBe('180');
  });

  it('returns unknown for a missing entity', () => {
    expect(render("{{ states('sensor.nope') }}")).toBe('unknown');
  });

  it('supports state_attr, is_state and is_state_attr', () => {
    expect(render("{{ state_attr('cover.garage', 'current_position') }}")).toBe('20');
    expect(render("{{ is_state('light.kitchen', 'on') }}")).toBe('True');
    expect(render("{{ is_state('light.kitchen', 'off') }}")).toBe('False');
    expect(render("{{ is_state_attr('cover.garage', 'current_position', 20) }}")).toBe('True');
  });

  it('applies filters more tightly than arithmetic', () => {
    expect(render("{{ states('sensor.battery') | float * 2 }}")).toBe('36');
  });

  it('rounds and defaults', () => {
    expect(render("{{ states('sensor.temperature') | float(0) | round(0) }}")).toBe('31');
    expect(render('{{ missing | default(7) }}')).toBe('7');
    expect(render("{{ '' | default('fallback', true) }}")).toBe('fallback');
  });

  it('evaluates inline conditionals, including the else-less form', () => {
    expect(render("{{ 'hot' if state_number > 30 else 'cold' }}", tempContext)).toBe('hot');
    expect(render("{{ ',' if false }}")).toBe('');
  });

  it('honours and/or/not and membership', () => {
    expect(render("{{ is_state('light.kitchen','on') and state_number > 30 }}", tempContext)).toBe('True');
    expect(render("{{ 'sensor' in entity }}", tempContext)).toBe('True');
    expect(render("{{ 'switch' not in entity }}", tempContext)).toBe('True');
  });

  it('supports is-tests', () => {
    expect(render('{{ missing is not defined }}')).toBe('True');
    expect(render('{{ state_number is number }}', tempContext)).toBe('True');
  });

  it('prints booleans and None the way Python does', () => {
    expect(render('{{ true }}')).toBe('True');
    expect(render('{{ none }}')).toBe('None');
  });
});

describe('statements', () => {
  it('handles if / elif / else', () => {
    const tpl = "{% if state|int > 25 %}mdi:fire{% elif state|int < 10 %}mdi:snowflake{% else %}mdi:thermometer{% endif %}";
    expect(render(tpl, tempContext)).toBe('mdi:fire');
    expect(render(tpl, { ...tempContext, state: '5' })).toBe('mdi:snowflake');
    expect(render(tpl, { ...tempContext, state: '18' })).toBe('mdi:thermometer');
  });

  it('handles set and for with loop vars', () => {
    const tpl = `{% set marks = [0, 25, 50] %}{% for m in marks %}{{ m }}{{ "," if not loop.last }}{% endfor %}`;
    expect(render(tpl)).toBe('0,25,50');
  });

  it('mutates namespace objects across loop scopes', () => {
    const tpl = `{% set ns = namespace(total=0) %}{% for n in [1,2,3] %}{% set ns.total = ns.total + n %}{% endfor %}{{ ns.total }}`;
    expect(render(tpl)).toBe('6');
  });

  it('appends to a namespace list and serialises it with tojson', () => {
    const tpl = `{% set ns = namespace(mods=[]) %}{% for n in [1,2] %}{% set ns.mods = ns.mods + [{"v": n}] %}{% endfor %}{{ ns.mods | tojson }}`;
    expect(render(tpl)).toBe('[{"v":1},{"v":2}]');
  });

  it('strips whitespace with {%- -%}', () => {
    expect(renderJinjaText('a  {%- if true -%}   b {%- endif %}', hass).text).toBe('ab');
  });

  it('ignores comments', () => {
    expect(render('{# a note #}value')).toBe('value');
  });
});

describe('literalEval mirrors Home Assistant parse_result', () => {
  it('parses JSON objects', () => {
    expect(literalEval('{"icon": "mdi:fire"}')).toEqual({ icon: 'mdi:fire' });
  });

  it('parses Python booleans inside a rendered object', () => {
    expect(literalEval('{"fill_area": True}')).toEqual({ fill_area: true });
  });

  it('parses single-quoted Python dicts', () => {
    expect(literalEval("{'color': '#fff'}")).toEqual({ color: '#fff' });
  });

  it('keeps quoted None and apostrophes intact', () => {
    expect(literalEval('{"color": "None", "label": "Tony\'s room"}')).toEqual({
      color: 'None',
      label: "Tony's room",
    });
  });

  it('converts scalars', () => {
    expect(literalEval('42')).toBe(42);
    expect(literalEval('3.5')).toBe(3.5);
    expect(literalEval('True')).toBe(true);
    expect(literalEval('mdi:fire')).toBe('mdi:fire');
  });

  it('leaves malformed JSON as a string so the card can report it', () => {
    expect(literalEval('{"icon": }')).toBe('{"icon": }');
  });
});

/**
 * Every example the in-app cheatsheet and docs ship must render to something
 * the card can actually use — these are the templates users will copy first.
 */
describe('shipped cheatsheet examples', () => {
  it('icon: simple icon by temperature', () => {
    expect(render('{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}', tempContext)).toBe('mdi:fire');
  });

  it('icon: battery icon and color', () => {
    const tpl = `{% set level = state | int %}
{
  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",
  "icon_color": "{% if level <= 20 %}#FF0000{% elif level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"
}`;
    const { result } = renderTemplate(tpl, hass, { ...tempContext, state: '18' });
    expect(result).toEqual({ icon: 'mdi:battery-20', icon_color: '#FF0000' });
  });

  it('text: styled text via JSON', () => {
    const tpl = `{
  "content": "{{ friendly_name }}: {{ state }}{{ unit }}",
  "color": "{% if state_number > 30 %}#FF4444{% else %}var(--primary-text-color){% endif %}"
}`;
    expect(renderTemplate(tpl, hass, tempContext).result).toEqual({
      content: 'Living Room Temperature: 31.4°C',
      color: '#FF4444',
    });
  });

  it('text: multi-entity summary', () => {
    const tpl = `{% set temp = states('sensor.temperature') %}
{% set hum = states('sensor.humidity') %}
{
  "content": "temp {{ temp }} hum {{ hum }}",
  "color": "{% if temp|float > 30 %}red{% else %}var(--primary-text-color){% endif %}"
}`;
    expect(renderTemplate(tpl, hass).result).toEqual({
      content: 'temp 31.4 hum 54',
      color: 'red',
    });
  });

  it('bar: disk usage with color thresholds', () => {
    const tpl = `{% set used = state | float %}
{
  "value": {{ used }},
  "label": "{{ friendly_name }}: {{ used | round(1) }}%",
  "color": "{% if used > 90 %}#FF0000{% elif used > 70 %}#FF8800{% else %}#4CAF50{% endif %}"
}`;
    expect(renderTemplate(tpl, hass, { ...tempContext, state: '82' }).result).toEqual({
      value: 82,
      label: 'Living Room Temperature: 82%',
      color: '#FF8800',
    });
  });

  it('bar: dynamic tick colors via a Jinja loop', () => {
    const tpl = `{% set lvl = state | float %}
{% set marks = [0, 25, 50, 75, 100] %}
{
  "value": {{ lvl }},
  "ticks": [
    {% for m in marks %}
    {
      "position": {{ m }},
      "label": "{{ m }}%",
      "color": "{% if m == (lvl // 25 * 25) | int %}#2196f3{% else %}var(--secondary-text-color){% endif %}"
    }{{ "," if not loop.last }}
    {% endfor %}
  ]
}`;
    const { result } = renderTemplate(tpl, hass, { ...tempContext, state: '60' });
    expect(result.value).toBe(60);
    expect(result.ticks).toHaveLength(5);
    expect(result.ticks[2]).toEqual({ position: 50, label: '50%', color: '#2196f3' });
    expect(result.ticks[0].color).toBe('var(--secondary-text-color)');
  });

  it('gauge: temperature gauge with color', () => {
    const tpl = `{% set temp = state | float %}
{
  "value": {{ temp }},
  "gauge_color": "{% if temp > 25 %}#FF4444{% elif temp > 20 %}#FF8800{% else %}#00CC00{% endif %}"
}`;
    expect(renderTemplate(tpl, hass, tempContext).result).toEqual({
      value: 31.4,
      gauge_color: '#FF4444',
    });
  });

  it('graphs: multi-entity colors with fill renders a Python bool HA can eval', () => {
    const tpl = `{
  "colors": ["#2196F3", "#4CAF50", "#FF9800"],
  "fill_area": {{ states('input_boolean.show_fill') == 'on' }}
}`;
    expect(renderTemplate(tpl, hass).result).toEqual({
      colors: ['#2196F3', '#4CAF50', '#FF9800'],
      fill_area: false,
    });
  });

  it('graphs: pie fill from state', () => {
    const tpl = `{% set pct = state | float / 100 %}
{
  "pie_fill": {{ pct | round(2) }},
  "global_color": "{% if pct > 0.8 %}#4CAF50{% elif pct > 0.5 %}#FF9800{% else %}#F44336{% endif %}"
}`;
    expect(renderTemplate(tpl, hass, { ...tempContext, state: '90' }).result).toEqual({
      pie_fill: 0.9,
      global_color: '#4CAF50',
    });
  });

  it('spinbox: color buttons by temperature', () => {
    const tpl = `{% set temp = state | float %}
{
  "button_background_color": "{% if temp > 25 %}#FF4444{% elif temp > 18 %}#FF8800{% else %}#2196F3{% endif %}",
  "button_text_color": "white",
  "value_color": "{% if temp > 25 %}#FF4444{% else %}var(--primary-text-color){% endif %}"
}`;
    expect(renderTemplate(tpl, hass, tempContext).result).toMatchObject({
      button_background_color: '#FF4444',
      button_text_color: 'white',
    });
  });

  it('camera: switch camera by weather', () => {
    const tpl = "{{ 'camera.outdoor' if is_state('weather.home', 'sunny') else 'camera.indoor' }}";
    expect(renderTemplate(tpl, hass).result).toBe('camera.outdoor');
  });

  it('camera: overlay with now().strftime', () => {
    const tpl = `{
  "entity": "camera.front_door",
  "overlay_text": "{{ now().strftime('%H:%M') }}",
  "overlay_color": "white"
}`;
    const { result } = renderTemplate(tpl, hass);
    expect(result.entity).toBe('camera.front_door');
    expect(result.overlay_text).toMatch(/^\d{2}:\d{2}$/);
  });

  it('toggle: match by numeric range', () => {
    const tpl = `{
  "match": "{{ state_attr('cover.garage', 'current_position') | int >= 15 and state_attr('cover.garage', 'current_position') | int <= 25 }}"
}`;
    expect(renderTemplate(tpl, hass).result).toEqual({ match: 'True' });
  });

  it('qr: guest wifi from a helper', () => {
    const tpl = `{
  "qr_content": "{{ states('input_text.guest_wifi_password') }}"
}`;
    expect(renderTemplate(tpl, hass).result).toEqual({ qr_content: 'hunter2' });
  });

  it('status summary: color by entity state', () => {
    const tpl = `{
  "color": "{% if is_state(entity, 'on') %}#4caf50{% else %}var(--disabled-text-color){% endif %}"
}`;
    expect(renderTemplate(tpl, hass, { entity: 'light.kitchen' }).result).toEqual({
      color: '#4caf50',
    });
  });

  it('layout: boolean visible from a helper', () => {
    const tpl = `{
  "visible": {{ states('input_boolean.show_section') == 'on' }}
}`;
    expect(renderTemplate(tpl, hass).result).toEqual({ visible: true });
  });

  it('card: background by time of day', () => {
    const tpl = `{% set period = states('sensor.day_period') %}
{% if period == 'night' %}
  #1b1f3a
{% elif period == 'morning' %}
  #fff3cd
{% else %}
  #343a40
{% endif %}`;
    expect(render(tpl)).toBe('#1b1f3a');
  });

  it('card: full appearance JSON', () => {
    const tpl = `{% set period = states('sensor.day_period') %}
{
  "card_background": "{% if period == 'night' %}#1b1f3a{% else %}var(--card-background-color){% endif %}",
  "card_border_radius": 12,
  "card_shadow_enabled": true
}`;
    expect(renderTemplate(tpl, hass).result).toEqual({
      card_background: '#1b1f3a',
      card_border_radius: 12,
      card_shadow_enabled: true,
    });
  });

  it('markdown: status dashboard with escaped newlines', () => {
    const tpl = `{
  "content": "## Status\\n\\n- **Temp:** {{ states('sensor.temperature') }}°"
}`;
    expect(renderTemplate(tpl, hass).result).toEqual({
      content: '## Status\n\n- **Temp:** 31.4°',
    });
  });
});

describe('failure handling', () => {
  it('reports a parse error instead of throwing', () => {
    const { error } = renderJinjaText('{{ 1 + }}', hass);
    expect(error).toBeTruthy();
  });

  it('renders unknown variables as empty strings', () => {
    expect(render('[{{ nope }}]')).toBe('[]');
  });

  it('survives an unsupported block', () => {
    expect(render('{% macro thing() %}x{% endmacro %}kept')).toBe('kept');
  });
});
