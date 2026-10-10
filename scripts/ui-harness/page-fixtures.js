/**
 * Per-module fixture tweaks for the UI harness, applied on top of each module's
 * own createDefault(id, hass). Injected into the HA tab next to page-probe.js.
 *
 * createDefault is already entity-aware (it binds an entity you own), so most
 * modules need nothing here. What does need a fixture:
 *   - layout containers, whose default is empty, so they get a few children;
 *   - modules whose default leaves a key entity blank, which `pick()` fills
 *     with a real entity from the instance under test.
 *
 * A module that still shows a "select an entity" state after this is itself a
 * finding: its default should have bound something.
 *
 * Signature: (cfg, ctx) => void, mutating cfg.
 *   ctx.mk(type, extra)        a fully defaulted child module
 *   ctx.pick(domain, test?)    first entity_id in `domain` (optionally matching test(stateObj))
 *   ctx.hass                   the live hass
 */
(() => {
  const icons = (ctx, n) =>
    ['light', 'switch', 'lock', 'fan', 'cover', 'binary_sensor']
      .map(d => ctx.pick(d))
      .filter(Boolean)
      .slice(0, n)
      .map(entity => {
        const m = ctx.mk('icon');
        if (Array.isArray(m.icons) && m.icons.length) {
          m.icons = [{ ...m.icons[0], icon_mode: 'entity', entity }];
        }
        return m;
      });

  const setIfEmpty = (cfg, key, value) => {
    if (value && !cfg[key]) cfg[key] = value;
  };

  window.__ucFixtures = {
    horizontal: (c, ctx) => (c.modules = icons(ctx, 3)),
    vertical: (c, ctx) =>
      (c.modules = [ctx.mk('text', { text: 'Vertical layout' }), ctx.mk('bar'), ctx.mk('button')]),
    stack: (c, ctx) => (c.modules = [ctx.mk('image'), ctx.mk('text', { text: 'Stacked on top' })]),
    grid_layout: (c, ctx) => (c.modules = icons(ctx, 4)),
    scroll_row: (c, ctx) => (c.modules = icons(ctx, 6)),
    accordion: (c, ctx) => {
      c.modules = [ctx.mk('info')];
      c.default_open = true;
    },
    tabs: (c, ctx) => {
      if (Array.isArray(c.sections) && c.sections.length) {
        c.sections[0].modules = [ctx.mk('info')];
        if (c.sections[1]) c.sections[1].modules = [ctx.mk('bar')];
      }
    },
    popup: (c, ctx) => (c.modules = [ctx.mk('info')]),
    drawer: (c, ctx) =>
      (c.modules = [ctx.mk('text', { text: 'Drawer content' }), ctx.mk('button')]),
    flip_card: (c, ctx) =>
      (c.modules = [ctx.mk('text', { text: 'Front' }), ctx.mk('text', { text: 'Back' })]),
    state_switcher: (c, ctx) => {
      c.modules = [ctx.mk('text', { text: 'State switcher child' })];
      c.fallback_mode = 'first';
    },
    slider: (c, ctx) =>
      (c.modules = [
        ctx.mk('text', { text: 'Page one' }),
        ctx.mk('pagebreak'),
        ctx.mk('text', { text: 'Page two' }),
      ]),

    grid: (c, ctx) => {
      if (!Array.isArray(c.entities) || !c.entities.length) {
        c.entities = ['light', 'switch', 'lock', 'fan', 'cover', 'climate']
          .map(d => ctx.pick(d))
          .filter(Boolean)
          .map((entity, i) => ({ id: `uch_g${i}`, entity }));
      }
    },
    status_summary: (c, ctx) => {
      if (!Array.isArray(c.entities) || !c.entities.length) {
        c.entities = ['binary_sensor', 'lock', 'switch', 'light']
          .map(d => ctx.pick(d))
          .filter(Boolean)
          .map((entity, i) => ({ id: `uch_s${i}`, entity }));
      }
    },
    camera: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('camera')),
    climate: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('climate')),
    cover: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('cover')),
    fan: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('fan')),
    lock: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('lock')),
    vacuum: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('vacuum')),
    media_player: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('media_player')),
    alarm_panel: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('alarm_control_panel')),
    humidifier: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('humidifier')),
    todo_list: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('todo')),
    weather: (c, ctx) => setIfEmpty(c, 'weather_entity', ctx.pick('weather')),
    animated_weather: (c, ctx) => setIfEmpty(c, 'weather_entity', ctx.pick('weather')),
    animated_forecast: (c, ctx) => setIfEmpty(c, 'weather_entity', ctx.pick('weather')),
    people: (c, ctx) => setIfEmpty(c, 'person_entity', ctx.pick('person')),
    gauge: (c, ctx) =>
      setIfEmpty(
        c,
        'entity',
        ctx.pick('sensor', s => !isNaN(parseFloat(s.state)) && s.attributes.unit_of_measurement)
      ),
    timer: (c, ctx) => setIfEmpty(c, 'timer_entity', ctx.pick('timer')),
    boolean_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_boolean')),
    button_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_button')),
    counter_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('counter')),
    number_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_number')),
    slider_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_number')),
    datetime_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_datetime')),
    select_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_select')),
    text_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_text')),
    color_input: (c, ctx) => setIfEmpty(c, 'entity', ctx.pick('input_text')),
    calendar: (c, ctx) => {
      const cal = ctx.pick('calendar');
      if (cal && Array.isArray(c.calendars) && c.calendars.length && !c.calendars[0].entity)
        c.calendars[0].entity = cal;
    },
    'dynamic-list': (c, ctx) => {
      const todo = ctx.pick('todo');
      if (todo && !c.todo_entity) {
        c.source_type = 'todo';
        c.todo_entity = todo;
      }
    },
    auto_entity_list: c => {
      if (!c.include_domains || !c.include_domains.length) c.include_domains = ['light'];
      c.max_items = c.max_items || 4;
    },
  };
})();
