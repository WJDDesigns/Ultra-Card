/**
 * Demo Home Assistant instance for the ultracard.io module directory.
 * Provides realistic sample entities and an interactive callService so the
 * real modules render and behave exactly as they do on a dashboard.
 */

type Listener = () => void;

const now = () => new Date().toISOString();

function st(entity_id: string, state: string, attributes: Record<string, any> = {}) {
  return {
    entity_id,
    state,
    attributes,
    last_changed: now(),
    last_updated: now(),
    context: { id: 'demo', parent_id: null, user_id: null },
  };
}

function buildForecast() {
  const conds = ['sunny', 'partlycloudy', 'rainy', 'sunny', 'sunny'];
  const out: any[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    out.push({
      datetime: d.toISOString(),
      condition: conds[i],
      temperature: [78, 71, 66, 75, 80][i],
      templow: [62, 58, 55, 60, 64][i],
      precipitation: [0, 20, 80, 10, 0][i],
      humidity: [40, 55, 82, 45, 38][i],
      wind_speed: [6, 8, 12, 5, 4][i],
    });
  }
  return out;
}

export function createDemoStates(): Record<string, any> {
  const inHour = (h: number) => {
    const d = new Date();
    d.setHours(d.getHours() + h);
    return d.toISOString();
  };
  return {
    // ---- lights ----
    'light.living_room': st('light.living_room', 'on', {
      friendly_name: 'Living Room',
      brightness: 178,
      color_mode: 'color_temp',
      color_temp_kelvin: 3200,
      supported_color_modes: ['color_temp', 'hs'],
      supported_features: 44,
      icon: 'mdi:sofa',
    }),
    'light.kitchen': st('light.kitchen', 'on', {
      friendly_name: 'Kitchen Spots',
      brightness: 255,
      color_mode: 'hs',
      hs_color: [40, 30],
      rgb_color: [255, 220, 178],
      supported_color_modes: ['hs'],
      supported_features: 44,
    }),
    'light.desk_lamp': st('light.desk_lamp', 'off', {
      friendly_name: 'Desk Lamp',
      supported_color_modes: ['brightness'],
      supported_features: 44,
    }),
    'light.porch': st('light.porch', 'on', {
      friendly_name: 'Porch Light',
      brightness: 120,
      supported_color_modes: ['brightness'],
    }),

    // ---- switches / booleans ----
    'switch.guest_mode': st('switch.guest_mode', 'on', { friendly_name: 'Guest Mode' }),
    'switch.sprinklers': st('switch.sprinklers', 'off', {
      friendly_name: 'Sprinklers',
      icon: 'mdi:sprinkler-variant',
    }),
    'input_boolean.quiet_hours': st('input_boolean.quiet_hours', 'off', {
      friendly_name: 'Quiet Hours',
      icon: 'mdi:bell-off',
    }),
    'input_boolean.guest': st('input_boolean.guest', 'on', { friendly_name: 'Guest Mode' }),

    // ---- sensors ----
    'sensor.living_room_temperature': st('sensor.living_room_temperature', '72.4', {
      friendly_name: 'Living Room Temperature',
      unit_of_measurement: '°F',
      device_class: 'temperature',
      state_class: 'measurement',
    }),
    'sensor.living_room_humidity': st('sensor.living_room_humidity', '41', {
      friendly_name: 'Living Room Humidity',
      unit_of_measurement: '%',
      device_class: 'humidity',
      state_class: 'measurement',
    }),
    'sensor.power_usage': st('sensor.power_usage', '1240', {
      friendly_name: 'Home Power',
      unit_of_measurement: 'W',
      device_class: 'power',
      state_class: 'measurement',
    }),
    'sensor.energy_today': st('sensor.energy_today', '12.4', {
      friendly_name: 'Energy Today',
      unit_of_measurement: 'kWh',
      device_class: 'energy',
      state_class: 'total_increasing',
    }),
    'sensor.solar_power': st('sensor.solar_power', '2840', {
      friendly_name: 'Solar Production',
      unit_of_measurement: 'W',
      device_class: 'power',
      state_class: 'measurement',
      icon: 'mdi:solar-power',
    }),
    'sensor.grid_power': st('sensor.grid_power', '420', {
      friendly_name: 'Grid Import',
      unit_of_measurement: 'W',
      device_class: 'power',
      state_class: 'measurement',
    }),
    'sensor.home_battery_soc': st('sensor.home_battery_soc', '84', {
      friendly_name: 'Home Battery',
      unit_of_measurement: '%',
      device_class: 'battery',
      state_class: 'measurement',
    }),
    'sensor.speed_test': st('sensor.speed_test', '62', {
      friendly_name: 'Download Speed',
      unit_of_measurement: 'Mbit/s',
      state_class: 'measurement',
      icon: 'mdi:speedometer',
    }),
    'sensor.phone_battery': st('sensor.phone_battery', '82', {
      friendly_name: "Wayne's Phone Battery",
      unit_of_measurement: '%',
      device_class: 'battery',
    }),
    'sensor.door_lock_battery': st('sensor.door_lock_battery', '8', {
      friendly_name: 'Door Lock Battery',
      unit_of_measurement: '%',
      device_class: 'battery',
    }),
    'sensor.motion_sensor_battery': st('sensor.motion_sensor_battery', '21', {
      friendly_name: 'Hall Motion Battery',
      unit_of_measurement: '%',
      device_class: 'battery',
    }),
    'sensor.remote_battery': st('sensor.remote_battery', '86', {
      friendly_name: 'Remote Battery',
      unit_of_measurement: '%',
      device_class: 'battery',
    }),
    'sensor.moon_phase': st('sensor.moon_phase', 'waxing_gibbous', {
      friendly_name: 'Moon Phase',
      icon: 'mdi:moon-waxing-gibbous',
    }),
    'sensor.washer_power': st('sensor.washer_power', '540', {
      friendly_name: 'Washer Power',
      unit_of_measurement: 'W',
      device_class: 'power',
      state_class: 'measurement',
    }),
    'sensor.ev_odometer': st('sensor.ev_odometer', '34218', {
      friendly_name: 'Model Y Odometer',
      unit_of_measurement: 'mi',
      icon: 'mdi:counter',
    }),

    // ---- binary sensors ----
    'binary_sensor.front_door': st('binary_sensor.front_door', 'off', {
      friendly_name: 'Front Door',
      device_class: 'door',
    }),
    'binary_sensor.garage_motion': st('binary_sensor.garage_motion', 'on', {
      friendly_name: 'Garage Motion',
      device_class: 'motion',
    }),
    'binary_sensor.leak_laundry': st('binary_sensor.leak_laundry', 'off', {
      friendly_name: 'Laundry Leak Sensor',
      device_class: 'moisture',
    }),

    // ---- climate ----
    'climate.downstairs': st('climate.downstairs', 'heat', {
      friendly_name: 'Downstairs',
      current_temperature: 69.8,
      temperature: 72,
      min_temp: 45,
      max_temp: 95,
      target_temp_step: 1,
      hvac_modes: ['off', 'heat', 'cool', 'heat_cool', 'auto'],
      hvac_action: 'heating',
      fan_modes: ['auto', 'on'],
      fan_mode: 'auto',
      preset_modes: ['none', 'away', 'eco'],
      preset_mode: 'none',
      supported_features: 411,
    }),

    // ---- humidifier ----
    'humidifier.bedroom': st('humidifier.bedroom', 'on', {
      friendly_name: 'Bedroom Humidifier',
      humidity: 45,
      current_humidity: 41,
      min_humidity: 30,
      max_humidity: 70,
      mode: 'auto',
      available_modes: ['normal', 'auto', 'boost'],
      device_class: 'humidifier',
      supported_features: 1,
    }),

    // ---- media player ----
    'media_player.kitchen_speaker': st('media_player.kitchen_speaker', 'playing', {
      friendly_name: 'Kitchen Speaker',
      media_title: 'Dandelion',
      media_artist: 'Ella Langley',
      media_album_name: 'Hungover',
      entity_picture: 'https://i.scdn.co/image/ab67616d0000b2738606848da949bbaddf447d87',
      media_duration: 243,
      media_position: 84,
      media_position_updated_at: now(),
      volume_level: 0.45,
      is_volume_muted: false,
      media_content_type: 'music',
      app_name: 'Spotify',
      supported_features: 152463,
    }),

    // ---- camera ----
    'camera.front_door': st('camera.front_door', 'streaming', {
      friendly_name: 'Front Door Camera',
      supported_features: 2,
    }),

    // ---- cover / fan / lock ----
    'cover.living_room_blinds': st('cover.living_room_blinds', 'open', {
      friendly_name: 'Living Room Blinds',
      current_position: 40,
      device_class: 'blind',
      supported_features: 15,
    }),
    'cover.garage_door': st('cover.garage_door', 'closed', {
      friendly_name: 'Garage Door',
      device_class: 'garage',
      supported_features: 3,
    }),
    'fan.ceiling_fan': st('fan.ceiling_fan', 'on', {
      friendly_name: 'Ceiling Fan',
      percentage: 66,
      percentage_step: 33.3,
      preset_modes: ['auto', 'sleep'],
      oscillating: false,
      direction: 'forward',
      supported_features: 47,
    }),
    'lock.front_door': st('lock.front_door', 'locked', {
      friendly_name: 'Front Door',
      supported_features: 1,
    }),

    // ---- vacuum ----
    'vacuum.robot': st('vacuum.robot', 'cleaning', {
      friendly_name: 'Dusty',
      battery_level: 76,
      battery_icon: 'mdi:battery-70',
      fan_speed: 'balanced',
      fan_speed_list: ['quiet', 'balanced', 'turbo', 'max'],
      status: 'Cleaning kitchen',
      supported_features: 16383,
    }),

    // ---- alarm ----
    'alarm_control_panel.home': st('alarm_control_panel.home', 'disarmed', {
      friendly_name: 'Home Alarm',
      code_format: 'number',
      code_arm_required: false,
      supported_features: 63,
    }),

    // ---- presence ----
    'person.tony': st('person.tony', 'home', {
      friendly_name: 'Tony Stark',
      // tvtropes blocks hotlinking (403), which rendered as a broken avatar.
      // Wikimedia serves freely-licensed media and is already used elsewhere here.
      entity_picture:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg/500px-Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg',
      latitude: 34.03,
      longitude: -118.49,
      gps_accuracy: 8,
      source: 'device_tracker.mark_42',
    }),
    'person.wayne': st('person.wayne', 'home', {
      friendly_name: 'Wayne',
      latitude: 40.0,
      longitude: -75.2,
      gps_accuracy: 12,
    }),
    'person.sarah': st('person.sarah', 'not_home', {
      friendly_name: 'Sarah',
      latitude: 40.03,
      longitude: -75.16,
      gps_accuracy: 20,
    }),
    'device_tracker.model_y': st('device_tracker.model_y', 'not_home', {
      friendly_name: 'Model Y',
      latitude: 40.02,
      longitude: -75.18,
      source_type: 'gps',
      icon: 'mdi:car',
    }),
    'zone.home': st('zone.home', 'zoning', {
      friendly_name: 'Home',
      latitude: 40.0,
      longitude: -75.2,
      radius: 100,
      icon: 'mdi:home',
    }),

    // ---- weather ----
    'weather.home': st('weather.home', 'cloudy', {
      friendly_name: 'Home',
      temperature: 74,
      temperature_unit: '°F',
      apparent_temperature: 76,
      humidity: 41,
      pressure: 29.92,
      pressure_unit: 'inHg',
      wind_speed: 6.2,
      wind_speed_unit: 'mph',
      wind_bearing: 220,
      visibility: 10,
      visibility_unit: 'mi',
      uv_index: 5,
      forecast: buildForecast(),
      supported_features: 3,
    }),
    'sun.sun': st('sun.sun', 'above_horizon', {
      friendly_name: 'Sun',
      elevation: 42.1,
      azimuth: 210.5,
      rising: false,
      next_setting: inHour(5),
      next_rising: inHour(16),
    }),

    // ---- calendar / todo ----
    'calendar.family': st('calendar.family', 'on', {
      friendly_name: 'Family Calendar',
      message: 'Dentist — Emma',
      start_time: inHour(3).replace('T', ' ').slice(0, 19),
      end_time: inHour(4).replace('T', ' ').slice(0, 19),
      all_day: false,
    }),
    'todo.groceries': st('todo.groceries', '2', {
      friendly_name: 'Groceries',
      supported_features: 15,
    }),
    // Plant care stores its history as namespaced JSON in a to-do list.
    'todo.plant_care': st('todo.plant_care', '0', {
      friendly_name: 'Plant Care Log',
      supported_features: 79, // includes SET_DESCRIPTION_ON_ITEM (64)
    }),

    // ---- timer / counter ----
    'timer.pizza': st('timer.pizza', 'active', {
      friendly_name: 'Pizza Timer',
      duration: '0:03:00',
      remaining: '0:03:00',
      finishes_at: new Date(Date.now() + 180000).toISOString(),
      icon: 'mdi:pizza',
    }),
    'counter.coffee': st('counter.coffee', '3', {
      friendly_name: 'Coffees Today',
      minimum: 0,
      maximum: 20,
      step: 1,
      icon: 'mdi:coffee',
    }),

    // ---- inputs ----
    'input_text.guest_wifi': st('input_text.guest_wifi', '', {
      friendly_name: 'Guest Wi-Fi Name',
      mode: 'text',
      icon: 'mdi:wifi',
    }),
    'input_text.accent_color': st('input_text.accent_color', '#8017A2', {
      friendly_name: 'Accent Color',
      mode: 'text',
      icon: 'mdi:palette',
    }),
    'input_number.ev_charge_limit': st('input_number.ev_charge_limit', '80', {
      friendly_name: 'EV Charge Limit',
      min: 50,
      max: 100,
      step: 5,
      mode: 'slider',
      unit_of_measurement: '%',
      icon: 'mdi:ev-station',
    }),
    'input_datetime.wake_up': st(
      'input_datetime.wake_up',
      new Date(Date.now() + 36e5).toISOString().slice(0, 19).replace('T', ' '),
      {
        friendly_name: 'Next Alarm',
        has_date: true,
        has_time: true,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
        minute: 0,
        second: 0,
        timestamp: Math.floor((Date.now() + 36e5) / 1000),
        icon: 'mdi:alarm',
      }
    ),
    'input_select.house_mode': st('input_select.house_mode', 'Home', {
      friendly_name: 'House Mode',
      options: ['Home', 'Away', 'Guest', 'Vacation'],
      icon: 'mdi:home-switch',
    }),
    'input_button.doorbell_test': st('input_button.doorbell_test', now(), {
      friendly_name: 'Doorbell Test',
      icon: 'mdi:bell-ring',
    }),

    // ---- plants ----
    'sensor.monstera_moisture': st('sensor.monstera_moisture', '44', {
      friendly_name: 'Monstera Moisture',
      unit_of_measurement: '%',
      device_class: 'moisture',
    }),
    'sensor.snake_plant_moisture': st('sensor.snake_plant_moisture', '31', {
      friendly_name: 'Snake Plant Moisture',
      unit_of_measurement: '%',
      device_class: 'moisture',
    }),
    'sensor.basil_moisture': st('sensor.basil_moisture', '12', {
      friendly_name: 'Basil Moisture',
      unit_of_measurement: '%',
      device_class: 'moisture',
    }),

    // ---- standby loads (vampire power) ----
    'sensor.tv_standby': st('sensor.tv_standby', '22', {
      friendly_name: 'TV + Soundbar Power',
      unit_of_measurement: 'W',
      device_class: 'power',
      state_class: 'measurement',
    }),
    'sensor.console_standby': st('sensor.console_standby', '14', {
      friendly_name: 'Game Console Power',
      unit_of_measurement: 'W',
      device_class: 'power',
      state_class: 'measurement',
    }),
    'sensor.desktop_standby': st('sensor.desktop_standby', '9', {
      friendly_name: 'Old Desktop Power',
      unit_of_measurement: 'W',
      device_class: 'power',
      state_class: 'measurement',
    }),

    // ---- appliances (SmartThings-style demo sensors) ----
    'switch.washer_power': st('switch.washer_power', 'on', { friendly_name: 'Washer Power' }),
    'sensor.washer_machine_state': st('sensor.washer_machine_state', 'run', { friendly_name: 'Washer State' }),
    'sensor.washer_job_state': st('sensor.washer_job_state', 'wash', { friendly_name: 'Washer Job' }),
    'sensor.washer_completion_time': st('sensor.washer_completion_time', inHour(0.57), {
      friendly_name: 'Washer Completion Time',
      device_class: 'timestamp',
    }),
    'sensor.washer_energy': st('sensor.washer_energy', '0.8', {
      friendly_name: 'Washer Energy',
      unit_of_measurement: 'kWh',
      device_class: 'energy',
    }),
    'binary_sensor.washer_door': st('binary_sensor.washer_door', 'off', {
      friendly_name: 'Washer Door',
      device_class: 'door',
    }),
    'switch.dryer_power': st('switch.dryer_power', 'on', { friendly_name: 'Dryer Power' }),
    'sensor.dryer_machine_state': st('sensor.dryer_machine_state', 'run', { friendly_name: 'Dryer State' }),
    'sensor.dryer_job_state': st('sensor.dryer_job_state', 'drying', { friendly_name: 'Dryer Job' }),
    'sensor.dryer_completion_time': st('sensor.dryer_completion_time', inHour(0.37), {
      friendly_name: 'Dryer Completion Time',
      device_class: 'timestamp',
    }),
    'sensor.dryer_power_w': st('sensor.dryer_power_w', '2900', {
      friendly_name: 'Dryer Power',
      unit_of_measurement: 'W',
      device_class: 'power',
    }),
    'switch.dishwasher_power': st('switch.dishwasher_power', 'on', { friendly_name: 'Dishwasher Power' }),
    'sensor.dishwasher_machine_state': st('sensor.dishwasher_machine_state', 'run', { friendly_name: 'Dishwasher State' }),
    'sensor.dishwasher_job_state': st('sensor.dishwasher_job_state', 'rinse', { friendly_name: 'Dishwasher Job' }),
    'sensor.dishwasher_completion_time': st('sensor.dishwasher_completion_time', inHour(0.78), {
      friendly_name: 'Dishwasher Completion Time',
      device_class: 'timestamp',
    }),
    'binary_sensor.fridge_door': st('binary_sensor.fridge_door', 'off', {
      friendly_name: 'Fridge Door',
      device_class: 'door',
    }),
    'binary_sensor.freezer_door': st('binary_sensor.freezer_door', 'off', {
      friendly_name: 'Freezer Door',
      device_class: 'door',
    }),
    'sensor.fridge_temp': st('sensor.fridge_temp', '37', {
      friendly_name: 'Fridge Temperature',
      unit_of_measurement: '°F',
      device_class: 'temperature',
    }),
    'sensor.freezer_temp': st('sensor.freezer_temp', '0', {
      friendly_name: 'Freezer Temperature',
      unit_of_measurement: '°F',
      device_class: 'temperature',
    }),
    'sensor.fridge_setpoint': st('sensor.fridge_setpoint', '37', {
      friendly_name: 'Fridge Setpoint',
      unit_of_measurement: '°F',
    }),
    'sensor.freezer_setpoint': st('sensor.freezer_setpoint', '0', {
      friendly_name: 'Freezer Setpoint',
      unit_of_measurement: '°F',
    }),
    'sensor.range_machine_state': st('sensor.range_machine_state', 'run', { friendly_name: 'Range State' }),
    'sensor.oven_mode': st('sensor.oven_mode', 'bake', { friendly_name: 'Oven Mode' }),
    'sensor.oven_temp': st('sensor.oven_temp', '348', {
      friendly_name: 'Oven Temperature',
      unit_of_measurement: '°F',
      device_class: 'temperature',
    }),
    'sensor.oven_setpoint': st('sensor.oven_setpoint', '425', {
      friendly_name: 'Oven Setpoint',
      unit_of_measurement: '°F',
    }),

    // ---- Ultra Card Connect (demo Pro subscription so PRO modules render unlocked) ----
    'sensor.ultra_card_pro_cloud_authentication_status': st(
      'sensor.ultra_card_pro_cloud_authentication_status',
      'connected',
      {
        friendly_name: 'Ultra Card Pro Cloud Authentication Status',
        authenticated: true,
        user_id: 'demo',
        username: 'demo',
        email: 'demo@ultracard.io',
        display_name: 'Ultra Card Demo',
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_expires: null,
      }
    ),

    // ---- updates ----
    'update.home_assistant_core': st('update.home_assistant_core', 'on', {
      friendly_name: 'Home Assistant Core',
      installed_version: '2026.7.2',
      latest_version: '2026.8.0',
      release_url: 'https://www.home-assistant.io',
      title: 'Home Assistant Core',
      entity_picture: null,
      supported_features: 21,
    }),
    'update.zigbee2mqtt': st('update.zigbee2mqtt', 'off', {
      friendly_name: 'Zigbee2MQTT',
      installed_version: '2.6.0',
      latest_version: '2.6.0',
      title: 'Zigbee2MQTT',
      supported_features: 21,
    }),
  };
}

/* --------------------------------------------------------------------------
 * UniFi demo network — feeds the UniFi Network pro module.
 *
 * The module discovers gear from HA's entity/device registries (hass.entities /
 * hass.devices) using the official integration's unique_id patterns
 * (device_state-<mac>, port_rx-<mac>_<idx>, …) and translation_keys. This
 * builds a realistic site: UDM-SE gateway → HD24 PoE switch → E8 switch,
 * three APs, and two tracked clients with bandwidth sensors.
 * ------------------------------------------------------------------------ */

interface UnifiDemoPort {
  idx: number;
  /** Link speed in Mbps; 0 = link down. */
  speed: number;
  /** Live receive/transmit rates in Mbps (drives blinking activity LEDs). */
  rx?: number;
  tx?: number;
  /** PoE draw in watts; adds a PoE power sensor + PoE control switch. */
  poeW?: number;
  name?: string;
}

interface UnifiDemoRegistry {
  states: Record<string, any>;
  entities: Record<string, any>;
  devices: Record<string, any>;
}

export function buildUnifiDemoNetwork(): UnifiDemoRegistry {
  const states: Record<string, any> = {};
  const entities: Record<string, any> = {};
  const devices: Record<string, any> = {};

  const reg = (
    entityId: string,
    deviceId: string,
    uniqueId: string,
    translationKey: string | null,
    name: string
  ) => {
    entities[entityId] = {
      entity_id: entityId,
      device_id: deviceId,
      platform: 'unifi',
      unique_id: uniqueId,
      translation_key: translationKey,
      original_name: name,
      disabled_by: null,
      hidden_by: null,
    };
  };

  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
  const mbpsToBytes = (mbps: number) => Math.round(mbps * 125000); // B/s like HA

  const addInfra = (opts: {
    id: string;
    slug: string;
    name: string;
    model: string;
    mac: string;
    sw: string;
    cpu: number;
    mem: number;
    tempC?: number;
    clients?: number;
    uptimeDays: number;
    uplinkMac?: string;
    ports?: UnifiDemoPort[];
    wan?: Array<[string, number]>;
  }) => {
    const macRaw = opts.mac.replace(/:/g, '');
    const s = opts.slug;
    devices[opts.id] = {
      name: opts.name,
      manufacturer: 'Ubiquiti Networks',
      model: opts.model,
      sw_version: opts.sw,
      connections: [['mac', opts.mac]],
      identifiers: [['unifi', opts.mac]],
      disabled_by: null,
    };

    states[`sensor.${s}_state`] = st(`sensor.${s}_state`, 'connected', {
      friendly_name: `${opts.name} State`,
    });
    reg(`sensor.${s}_state`, opts.id, `device_state-${macRaw}`, 'device_state', 'State');

    states[`sensor.${s}_cpu`] = st(`sensor.${s}_cpu`, String(opts.cpu), {
      friendly_name: `${opts.name} CPU utilization`,
      unit_of_measurement: '%',
      state_class: 'measurement',
    });
    reg(`sensor.${s}_cpu`, opts.id, `cpu-${macRaw}`, 'device_cpu_utilization', 'CPU utilization');

    states[`sensor.${s}_memory`] = st(`sensor.${s}_memory`, String(opts.mem), {
      friendly_name: `${opts.name} Memory utilization`,
      unit_of_measurement: '%',
      state_class: 'measurement',
    });
    reg(`sensor.${s}_memory`, opts.id, `memory-${macRaw}`, 'device_memory_utilization', 'Memory utilization');

    if (opts.tempC != null) {
      states[`sensor.${s}_temperature`] = st(`sensor.${s}_temperature`, String(opts.tempC), {
        friendly_name: `${opts.name} Temperature`,
        unit_of_measurement: '°C',
        device_class: 'temperature',
        state_class: 'measurement',
      });
      reg(`sensor.${s}_temperature`, opts.id, `temperature-${macRaw}`, null, 'Temperature');
    }

    if (opts.clients != null) {
      states[`sensor.${s}_clients`] = st(`sensor.${s}_clients`, String(opts.clients), {
        friendly_name: `${opts.name} Clients`,
      });
      reg(`sensor.${s}_clients`, opts.id, `device_clients-${macRaw}`, 'device_clients', 'Clients');
    }

    states[`sensor.${s}_uptime`] = st(`sensor.${s}_uptime`, daysAgo(opts.uptimeDays), {
      friendly_name: `${opts.name} Uptime`,
      device_class: 'timestamp',
    });
    reg(`sensor.${s}_uptime`, opts.id, `device_uptime-${macRaw}`, null, 'Uptime');

    if (opts.uplinkMac) {
      states[`sensor.${s}_uplink_mac`] = st(`sensor.${s}_uplink_mac`, opts.uplinkMac, {
        friendly_name: `${opts.name} Uplink MAC`,
      });
      reg(`sensor.${s}_uplink_mac`, opts.id, `device_uplink_mac-${macRaw}`, 'device_uplink_mac', 'Uplink MAC');
    }

    for (const [target, ms] of opts.wan || []) {
      const t = target.toLowerCase();
      states[`sensor.${s}_${t}_latency`] = st(`sensor.${s}_${t}_latency`, String(ms), {
        friendly_name: `${opts.name} ${target} WAN latency`,
        unit_of_measurement: 'ms',
        state_class: 'measurement',
      });
      reg(`sensor.${s}_${t}_latency`, opts.id, `${t}_wan_latency-${macRaw}`, 'wan_latency', `${target} WAN latency`);
    }

    for (const p of opts.ports || []) {
      const pn = p.name || `Port ${p.idx}`;
      const rxId = `sensor.${s}_port_${p.idx}_rx`;
      const txId = `sensor.${s}_port_${p.idx}_tx`;
      const lnId = `sensor.${s}_port_${p.idx}_link_speed`;
      states[rxId] = st(rxId, String(mbpsToBytes(p.speed > 0 ? p.rx ?? 0 : 0)), {
        friendly_name: `${opts.name} ${pn} RX`,
        unit_of_measurement: 'B/s',
        state_class: 'measurement',
      });
      reg(rxId, opts.id, `port_rx-${macRaw}_${p.idx}`, 'port_bandwidth_rx', `${pn} RX`);
      states[txId] = st(txId, String(mbpsToBytes(p.speed > 0 ? p.tx ?? 0 : 0)), {
        friendly_name: `${opts.name} ${pn} TX`,
        unit_of_measurement: 'B/s',
        state_class: 'measurement',
      });
      reg(txId, opts.id, `port_tx-${macRaw}_${p.idx}`, 'port_bandwidth_tx', `${pn} TX`);
      states[lnId] = st(lnId, String(p.speed), {
        friendly_name: `${opts.name} ${pn} Link speed`,
        unit_of_measurement: 'Mbit/s',
      });
      reg(lnId, opts.id, `port_link_speed-${macRaw}_${p.idx}`, 'port_link_speed', `${pn} Link speed`);
      if (p.poeW) {
        const ppId = `sensor.${s}_port_${p.idx}_poe_power`;
        states[ppId] = st(ppId, String(p.poeW), {
          friendly_name: `${opts.name} ${pn} PoE power`,
          unit_of_measurement: 'W',
          state_class: 'measurement',
        });
        reg(ppId, opts.id, `poe_power-${macRaw}_${p.idx}`, 'port_poe_power', `${pn} PoE power`);
        const psId = `switch.${s}_port_${p.idx}_poe`;
        states[psId] = st(psId, 'on', { friendly_name: `${opts.name} ${pn} PoE` });
        reg(psId, opts.id, `poe-${macRaw}_${p.idx}`, 'poe_port_control', `${pn} PoE`);
      }
    }
  };

  const addClient = (opts: {
    id: string;
    slug: string;
    name: string;
    manufacturer: string;
    model: string;
    mac: string;
    rx: number;
    tx: number;
  }) => {
    const macRaw = opts.mac.replace(/:/g, '');
    devices[opts.id] = {
      name: opts.name,
      manufacturer: opts.manufacturer,
      model: opts.model,
      connections: [['mac', opts.mac]],
      disabled_by: null,
    };
    const rxId = `sensor.${opts.slug}_rx`;
    states[rxId] = st(rxId, String(opts.rx), {
      friendly_name: `${opts.name} RX`,
      unit_of_measurement: 'Mbit/s',
      state_class: 'measurement',
    });
    reg(rxId, opts.id, `rx-${macRaw}`, 'client_bandwidth_rx', 'RX');
    const txId = `sensor.${opts.slug}_tx`;
    states[txId] = st(txId, String(opts.tx), {
      friendly_name: `${opts.name} TX`,
      unit_of_measurement: 'Mbit/s',
      state_class: 'measurement',
    });
    reg(txId, opts.id, `tx-${macRaw}`, 'client_bandwidth_tx', 'TX');
    const trId = `device_tracker.${opts.slug}`;
    states[trId] = st(trId, 'home', { friendly_name: opts.name, source_type: 'router' });
    reg(trId, opts.id, `${macRaw}-default`, null, opts.name);
    const blId = `switch.${opts.slug}_block`;
    states[blId] = st(blId, 'on', { friendly_name: `${opts.name} Block` });
    reg(blId, opts.id, `block-${macRaw}`, 'block_client', 'Block');
  };

  const GW_MAC = 'f4:e2:c6:a0:00:01';
  const HD24_MAC = 'f4:e2:c6:a0:00:02';
  const E8_MAC = 'f4:e2:c6:a0:00:03';

  addInfra({
    id: 'ucd_unifi_gw',
    slug: 'udm_se',
    name: 'Dream Machine SE',
    model: 'UDMPROSE',
    mac: GW_MAC,
    sw: '4.3.6',
    cpu: 31,
    mem: 58,
    tempC: 52,
    clients: 4,
    uptimeDays: 63,
    wan: [
      ['Google', 12],
      ['Cloudflare', 9],
      ['Microsoft', 14],
    ],
    ports: [
      { idx: 1, speed: 2500, rx: 148, tx: 22 },
      { idx: 2, speed: 1000, rx: 12, tx: 3.4 },
      { idx: 3, speed: 1000, rx: 4.2, tx: 1.1 },
      { idx: 4, speed: 100, rx: 0.8, tx: 0.2 },
      { idx: 5, speed: 1000, rx: 6.4, tx: 2.2, poeW: 6.5 },
      { idx: 6, speed: 2500, rx: 88, tx: 14 },
      { idx: 7, speed: 0 },
      { idx: 8, speed: 1000, rx: 2.1, tx: 0.6 },
      { idx: 9, speed: 10000, rx: 620, tx: 240, name: 'SFP+ 9' },
      { idx: 10, speed: 0, name: 'SFP+ 10' },
    ],
  });

  addInfra({
    id: 'ucd_unifi_sw_hd24',
    slug: 'usw_hd24',
    name: 'Switch Pro HD 24 PoE',
    model: 'USWED72',
    mac: HD24_MAC,
    sw: '7.4.1',
    cpu: 6,
    mem: 16,
    tempC: 48,
    clients: 11,
    uptimeDays: 63,
    uplinkMac: GW_MAC,
    ports: [
      { idx: 1, speed: 2500, rx: 92, tx: 31, poeW: 11.2 },
      { idx: 2, speed: 2500, rx: 64, tx: 18, poeW: 12.9 },
      { idx: 3, speed: 2500, rx: 30, tx: 9.5, poeW: 16.9 },
      { idx: 4, speed: 0 },
      { idx: 5, speed: 1000, rx: 3.1, tx: 0.9 },
      { idx: 6, speed: 1000, rx: 5.4, tx: 4.8, poeW: 3.7 },
      { idx: 7, speed: 0 },
      { idx: 8, speed: 1000, rx: 4.9, tx: 4.2, poeW: 3.5 },
      { idx: 9, speed: 100, rx: 0.4, tx: 0.1 },
      { idx: 10, speed: 1000, rx: 1.8, tx: 0.5 },
      { idx: 11, speed: 0 },
      { idx: 12, speed: 1000, rx: 7.2, tx: 2.4 },
      { idx: 13, speed: 0 },
      { idx: 14, speed: 1000, rx: 2.6, tx: 1.2, poeW: 6.2 },
      { idx: 15, speed: 100, rx: 0.3, tx: 0.1, poeW: 2.1 },
      { idx: 16, speed: 2500, rx: 41, tx: 12 },
      { idx: 17, speed: 1000, rx: 1.1, tx: 0.4 },
      { idx: 18, speed: 1000, rx: 3.8, tx: 3.1, poeW: 4.4 },
      { idx: 19, speed: 0 },
      { idx: 20, speed: 1000, rx: 9.6, tx: 3.3, poeW: 8.3 },
      { idx: 21, speed: 1000, rx: 1.5, tx: 0.7, poeW: 4.1 },
      { idx: 22, speed: 0 },
      { idx: 23, speed: 1000, rx: 0.9, tx: 0.3 },
      { idx: 24, speed: 0 },
      { idx: 25, speed: 10000, rx: 610, tx: 235, name: 'SFP+ 25' },
      { idx: 26, speed: 10000, rx: 120, tx: 48, name: 'SFP+ 26' },
    ],
  });

  addInfra({
    id: 'ucd_unifi_sw_e8',
    slug: 'usw_e8',
    name: 'USW Enterprise 8 PoE',
    model: 'US68P',
    mac: E8_MAC,
    sw: '7.4.1',
    cpu: 4,
    mem: 56,
    tempC: 64,
    clients: 1,
    uptimeDays: 30,
    uplinkMac: HD24_MAC,
    ports: [
      { idx: 1, speed: 2500, rx: 38, tx: 11, poeW: 4.2 },
      { idx: 2, speed: 2500, rx: 22, tx: 6.8, poeW: 3.9 },
      { idx: 3, speed: 1000, rx: 2.4, tx: 0.8 },
      { idx: 4, speed: 1000, rx: 1.2, tx: 0.4 },
      { idx: 5, speed: 1000, rx: 4.4, tx: 3.9, poeW: 5.8 },
      { idx: 6, speed: 1000, rx: 0.7, tx: 0.2 },
      { idx: 7, speed: 100, rx: 0.2, tx: 0.1 },
      { idx: 8, speed: 1000, rx: 1.9, tx: 0.6 },
      { idx: 9, speed: 10000, rx: 118, tx: 46, name: 'SFP+ 9' },
      { idx: 10, speed: 0, name: 'SFP+ 10' },
    ],
  });

  addInfra({
    id: 'ucd_unifi_ap_max2',
    slug: 'ap_2nd_floor',
    name: '2nd Floor U7 Pro Max',
    model: 'U7PROMAX',
    mac: 'f4:e2:c6:a0:00:04',
    sw: '7.1.22',
    cpu: 8,
    mem: 67,
    clients: 41,
    uptimeDays: 63,
    uplinkMac: HD24_MAC,
  });

  addInfra({
    id: 'ucd_unifi_ap_maxb',
    slug: 'ap_basement',
    name: 'Basement U7 Pro Max',
    model: 'U7PROMAX',
    mac: 'f4:e2:c6:a0:00:05',
    sw: '7.1.22',
    cpu: 6,
    mem: 64,
    clients: 11,
    uptimeDays: 63,
    uplinkMac: HD24_MAC,
  });

  addInfra({
    id: 'ucd_unifi_ap_wall',
    slug: 'ap_1st_floor',
    name: '1st Floor U7 Pro Wall',
    model: 'U7PIW',
    mac: 'f4:e2:c6:a0:00:06',
    sw: '7.1.22',
    cpu: 6,
    mem: 52,
    clients: 32,
    uptimeDays: 63,
    uplinkMac: E8_MAC,
  });

  addClient({
    id: 'ucd_unifi_cl_mac',
    slug: 'tonys_macbook',
    name: "Tony's MacBook Pro",
    manufacturer: 'Apple',
    model: 'MacBookPro18,3',
    mac: '3c:22:fb:aa:00:01',
    rx: 184.2,
    tx: 12.6,
  });

  addClient({
    id: 'ucd_unifi_cl_ps5',
    slug: 'playstation_5',
    name: 'PlayStation 5',
    manufacturer: 'Sony Interactive Entertainment',
    model: 'CFI-2016',
    mac: 'a8:e3:ee:aa:00:02',
    rx: 32.4,
    tx: 2.1,
  });

  return { states, entities, devices };
}

/** Build the fake hass object. Mutating services trigger listener callbacks. */
export function createDemoHass() {
  const listeners = new Set<Listener>();
  const states = createDemoStates();
  const unifi = buildUnifiDemoNetwork();
  Object.assign(states, unifi.states);

  const notify = () => listeners.forEach(l => l());

  const setState = (id: string, state: string, attrs?: Record<string, any>) => {
    const cur = states[id];
    if (!cur) return;
    states[id] = {
      ...cur,
      state,
      attributes: { ...cur.attributes, ...(attrs || {}) },
      last_changed: now(),
      last_updated: now(),
    };
    notify();
  };

  const hass: any = {
    states,
    language: 'en',
    locale: { language: 'en', number_format: 'comma_decimal', time_format: '12' },
    config: {
      unit_system: { temperature: '°F', length: 'mi', mass: 'lb', volume: 'gal' },
      time_zone: 'America/New_York',
      location_name: 'Demo Home',
      latitude: 40.0,
      longitude: -75.2,
      version: '2026.8.0',
    },
    themes: { darkMode: true, theme: 'default' },
    user: { id: 'demo', name: 'Demo', is_admin: true },
    // Entity/device/area registries (subset used by area & auto-discovery modules)
    areas: {
      living_room: { area_id: 'living_room', name: 'Living Room', icon: 'mdi:sofa' },
      kitchen: { area_id: 'kitchen', name: 'Kitchen', icon: 'mdi:silverware-fork-knife' },
      bedroom: { area_id: 'bedroom', name: 'Bedroom', icon: 'mdi:bed' },
    },
    devices: { ...unifi.devices },
    entities: {
      ...unifi.entities,
      'light.living_room': { entity_id: 'light.living_room', area_id: 'living_room' },
      'sensor.living_room_temperature': {
        entity_id: 'sensor.living_room_temperature',
        area_id: 'living_room',
      },
      'sensor.living_room_humidity': {
        entity_id: 'sensor.living_room_humidity',
        area_id: 'living_room',
      },
      'binary_sensor.garage_motion': { entity_id: 'binary_sensor.garage_motion', area_id: null },
      'light.kitchen': { entity_id: 'light.kitchen', area_id: 'kitchen' },
      'media_player.kitchen_speaker': {
        entity_id: 'media_player.kitchen_speaker',
        area_id: 'kitchen',
      },
    },

    formatEntityState(stateObj: any) {
      if (!stateObj) return '';
      const unit = stateObj.attributes?.unit_of_measurement;
      return unit ? `${stateObj.state} ${unit}` : String(stateObj.state);
    },
    formatEntityAttributeValue(stateObj: any, attr: string) {
      return String(stateObj?.attributes?.[attr] ?? '');
    },
    localize(key: string) {
      const last = key.split('.').pop() || key;
      return last.replace(/_/g, ' ');
    },

    async callService(domain: string, service: string, data: any = {}, _target?: any) {
      const id: string =
        data?.entity_id || _target?.entity_id || (Array.isArray(data?.entity_id) && data.entity_id[0]);
      const entity = id && states[id];
      const d = (v: any, f: any) => (v === undefined ? f : v);
      if (domain === 'todo' && service === 'get_items') {
        if (id === 'todo.plant_care') {
          const ago = (h: number) => new Date(Date.now() - h * 36e5).toISOString();
          const rec = (uid: string, plant: string, kind: string, hrs: number) => ({
            uid,
            summary: `${kind === 'water' ? 'Watered' : 'Fertilised'} ${plant}`,
            status: 'completed',
            description: JSON.stringify({
              _ns: 'plant_care',
              _v: 1,
              data: { plant_id: plant, kind, at: ago(hrs) },
            }),
          });
          return {
            response: {
              'todo.plant_care': {
                items: [
                  rec('pc1', 'demo_p1', 'water', 30),
                  rec('pc2', 'demo_p2', 'water', 90),
                  rec('pc3', 'demo_p3', 'water', 8),
                  rec('pc4', 'demo_p1', 'fertilize', 260),
                ],
              },
            },
          };
        }
        const items = [
          { uid: '1', summary: 'Milk', status: 'completed' },
          { uid: '2', summary: 'Coffee beans', status: 'completed' },
          { uid: '3', summary: 'Dog food', status: 'needs_action' },
          { uid: '4', summary: 'Batteries AA', status: 'needs_action' },
        ];
        return { response: { [id || 'todo.groceries']: { items } } };
      }
      switch (`${domain}.${service}`) {
        case 'light.toggle':
        case 'switch.toggle':
        case 'fan.toggle':
        case 'input_boolean.toggle':
          if (entity) setState(id, entity.state === 'on' ? 'off' : 'on');
          break;
        case 'light.turn_on':
          if (entity)
            setState(id, 'on', {
              brightness: d(data.brightness, entity.attributes.brightness ?? 255),
              ...(data.rgb_color ? { rgb_color: data.rgb_color, color_mode: 'hs' } : {}),
            });
          break;
        case 'light.turn_off':
        case 'switch.turn_off':
        case 'fan.turn_off':
          if (entity) setState(id, 'off');
          break;
        case 'switch.turn_on':
        case 'fan.turn_on':
          if (entity) setState(id, 'on');
          break;
        case 'climate.set_temperature':
          if (entity) setState(id, entity.state, { temperature: data.temperature });
          break;
        case 'climate.set_hvac_mode':
          if (entity) setState(id, data.hvac_mode);
          break;
        case 'cover.set_cover_position':
          if (entity)
            setState(id, data.position > 0 ? 'open' : 'closed', {
              current_position: data.position,
            });
          break;
        case 'cover.open_cover':
          if (entity) setState(id, 'open', { current_position: 100 });
          break;
        case 'cover.close_cover':
          if (entity) setState(id, 'closed', { current_position: 0 });
          break;
        case 'lock.lock':
          if (entity) setState(id, 'locked');
          break;
        case 'lock.unlock':
          if (entity) setState(id, 'unlocked');
          break;
        case 'fan.set_percentage':
          if (entity) setState(id, data.percentage > 0 ? 'on' : 'off', {
            percentage: data.percentage,
          });
          break;
        case 'media_player.media_play_pause':
          if (entity) setState(id, entity.state === 'playing' ? 'paused' : 'playing');
          break;
        case 'media_player.volume_set':
          if (entity) setState(id, entity.state, { volume_level: data.volume_level });
          break;
        case 'alarm_control_panel.alarm_arm_home':
          if (entity) setState(id, 'armed_home');
          break;
        case 'alarm_control_panel.alarm_arm_away':
          if (entity) setState(id, 'armed_away');
          break;
        case 'alarm_control_panel.alarm_disarm':
          if (entity) setState(id, 'disarmed');
          break;
        case 'vacuum.start':
          if (entity) setState(id, 'cleaning');
          break;
        case 'vacuum.pause':
        case 'vacuum.stop':
          if (entity) setState(id, 'paused');
          break;
        case 'vacuum.return_to_base':
          if (entity) setState(id, 'returning');
          break;
        case 'timer.start':
          if (entity) setState(id, 'active', { finishes_at: new Date(Date.now() + 12 * 60000).toISOString(), remaining: '0:12:00' });
          break;
        case 'timer.pause':
          if (entity) setState(id, 'paused');
          break;
        case 'timer.cancel':
        case 'timer.finish':
          if (entity) setState(id, 'idle');
          break;
        case 'counter.increment':
          if (entity) setState(id, String(Number(entity.state) + 1));
          break;
        case 'counter.decrement':
          if (entity) setState(id, String(Math.max(0, Number(entity.state) - 1)));
          break;
        case 'counter.reset':
          if (entity) setState(id, '0');
          break;
        case 'input_number.set_value':
        case 'input_text.set_value':
        case 'input_select.select_option':
          if (entity) setState(id, String(data.value ?? data.option));
          break;
        case 'input_datetime.set_datetime':
          if (entity) setState(id, data.time || data.datetime || entity.state);
          break;
        case 'input_button.press':
          if (entity) setState(id, now());
          break;
        case 'humidifier.set_humidity':
          if (entity) setState(id, entity.state, { humidity: data.humidity });
          break;
        case 'humidifier.turn_on':
          if (entity) setState(id, 'on');
          break;
        case 'humidifier.turn_off':
          if (entity) setState(id, 'off');
          break;
        case 'todo.update_item':
        case 'todo.add_item':
          break;
        default:
          // Non-mutating/unknown service: no-op in the demo.
          break;
      }
      return Promise.resolve();
    },

    async callApi(method: string, path: string) {
      // History API: synthesize plausible series for graphs modules.
      if (path.startsWith('history/period')) {
        const m = path.match(/filter_entity_id=([^&]+)/);
        const ids = m ? decodeURIComponent(m[1]).split(',') : [];
        return ids.map(eid => {
          const cur = states[eid];
          const base = cur ? parseFloat(cur.state) || 70 : 70;
          const out: any[] = [];
          for (let i = 48; i >= 0; i--) {
            const t = new Date(Date.now() - i * 30 * 60000);
            const v = base + Math.sin(i / 4.5) * base * 0.12 + (Math.random() - 0.5) * base * 0.04;
            out.push({
              entity_id: eid,
              state: v.toFixed(1),
              attributes: cur?.attributes || {},
              last_changed: t.toISOString(),
              last_updated: t.toISOString(),
            });
          }
          return out;
        });
      }
      if (path.startsWith('calendars/')) {
        const d1 = new Date();
        d1.setHours(15, 30, 0, 0);
        const d2 = new Date(d1.getTime() + 45 * 60000);
        const d3 = new Date(Date.now() + 2 * 86400000);
        const d4 = new Date(Date.now() + 5 * 86400000);
        return [
          { summary: 'Dentist — Emma', start: { dateTime: d1.toISOString() }, end: { dateTime: d2.toISOString() } },
          { summary: 'Soccer practice', start: { dateTime: d3.toISOString() }, end: { dateTime: new Date(d3.getTime() + 3600000).toISOString() } },
          { summary: 'Date night', start: { dateTime: d4.toISOString() }, end: { dateTime: new Date(d4.getTime() + 7200000).toISOString() } },
        ];
      }
      return [];
    },

    async callWS(msg: any) {
      if (msg?.type === 'history/history_during_period') {
        // Synthesize a plausible 24h wave per entity (WS compressed format).
        const ids: string[] = msg.entity_ids || [];
        const out: Record<string, any[]> = {};
        const nowS = Date.now() / 1000;
        for (const eid of ids) {
          const cur = states[eid];
          const base = cur ? parseFloat(cur.state) || 70 : 70;
          const rows: any[] = [];
          for (let i = 48; i >= 0; i--) {
            const v =
              base + Math.sin(i / 4.5) * Math.max(2, base * 0.12) + (Math.random() - 0.5) * Math.max(0.6, base * 0.03);
            rows.push({ s: v.toFixed(1), a: cur?.attributes || {}, lu: nowS - i * 30 * 60 });
          }
          out[eid] = rows;
        }
        return out;
      }
      if (msg?.type === 'config/area_registry/list') {
        return [
          { area_id: 'living_room', name: 'Living Room', icon: 'mdi:sofa', picture: null },
          { area_id: 'kitchen', name: 'Kitchen', icon: 'mdi:silverware-fork-knife', picture: null },
          { area_id: 'bedroom', name: 'Bedroom', icon: 'mdi:bed', picture: null },
        ];
      }
      if (msg?.type === 'config/device_registry/list') return [];
      if (msg?.type === 'config/entity_registry/list') {
        return [
          { entity_id: 'light.living_room', area_id: 'living_room', device_id: null, disabled_by: null, hidden_by: null },
          { entity_id: 'light.porch', area_id: 'living_room', device_id: null, disabled_by: null, hidden_by: null },
          { entity_id: 'sensor.living_room_temperature', area_id: 'living_room', device_id: null, disabled_by: null, hidden_by: null },
          { entity_id: 'sensor.living_room_humidity', area_id: 'living_room', device_id: null, disabled_by: null, hidden_by: null },
          { entity_id: 'binary_sensor.garage_motion', area_id: 'living_room', device_id: null, disabled_by: null, hidden_by: null },
          { entity_id: 'media_player.kitchen_speaker', area_id: 'kitchen', device_id: null, disabled_by: null, hidden_by: null },
          { entity_id: 'light.kitchen', area_id: 'kitchen', device_id: null, disabled_by: null, hidden_by: null },
          { entity_id: 'cover.living_room_blinds', area_id: 'living_room', device_id: null, disabled_by: null, hidden_by: null },
        ];
      }
      if (msg?.type === 'todo/item/list') {
        return {
          items: [
            { uid: '1', summary: 'Milk', status: 'completed' },
            { uid: '2', summary: 'Coffee beans', status: 'completed' },
            { uid: '3', summary: 'Dog food', status: 'needs_action' },
            { uid: '4', summary: 'Batteries AA', status: 'needs_action' },
          ],
        };
      }
      if (msg?.type === 'auth/current_user') return hass.user;
      return {};
    },

    connection: {
      subscribeEvents: async () => () => {},
      subscribeMessage: async (_cb: any, _msg: any) => () => {},
      sendMessagePromise: async (msg: any) => hass.callWS(msg),
      addEventListener: () => {},
      removeEventListener: () => {},
    },

    // Demo plumbing
    __setState: setState,
    __subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };

  return hass;
}
