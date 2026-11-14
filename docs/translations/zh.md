# 🇨🇳 Chinese (Simplified) translation status

> This page is generated automatically from the translation files. Don't edit it by hand;
> it refreshes itself after every change to the `main` branch.

**70.6% translated** — 5,750 of 8,138 entries. **2,388 still in English.**

🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜

## How to translate these

1. Open [`src/translations/zh.json`](https://github.com/WJDDesigns/Ultra-Card/edit/main/src/translations/zh.json) on GitHub (you'll be asked to sign in and fork the project the first time; that's automatic).
2. Pick a section below. Every entry in it is still in English in your file.
3. Press <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>⌘</kbd>+<kbd>F</kbd> on a Mac) and search for the **English text**. Because the entry hasn't been translated yet, the English text is exactly what's in your file.
4. Replace the English text between the quotes with your translation. Leave the part before the colon, and anything in `{curly braces}`, as it is.
5. Click **Commit changes…** and then **Propose changes** / **Create pull request**. That's it, the maintainer takes it from there.

More help: [translation guide](../../CONTRIBUTING_TRANSLATIONS.md) · [all languages](../../TRANSLATIONS.md)

If the English word really is right in your language (a brand name, or a word you also use), just leave it. It will stay on this list, and that's fine.

## Still in English (2,388)

Biggest sections first. Click a section to open it.

<details>
<summary><strong>Energy price (editor)</strong> — 155 left</summary>

| English text | Key |
| --- | --- |
| Fixed fee per kWh | `editor.energy_price.additive` |
| Added after the multiplier. | `editor.energy_price.additive_desc` |
| Price adjustments | `editor.energy_price.adjust_section` |
| Shown price = source price × multiplier + fee. Use it for VAT, grid fees or a supplier markup when your sensor shows the bare spot price. | `editor.energy_price.adjust_section_desc` |
| Charger on/off | `editor.energy_price.apply_charger` |
| Set helper times | `editor.energy_price.apply_datetime` |
| Done | `editor.energy_price.apply_done` |
| Could not apply the plan | `editor.energy_price.apply_failed` |
| Pick the charger switch above to use this button. | `editor.energy_price.apply_needs_charger` |
| Off | `editor.energy_price.apply_none` |
| Run script | `editor.energy_price.apply_script` |
| Send plan to script | `editor.energy_price.apply_send` |
| Set start to {time} | `editor.energy_price.apply_set` |
| Set start time | `editor.energy_price.apply_set_none` |
| Start charging now | `editor.energy_price.apply_start` |
| Start charging (planned slot) | `editor.energy_price.apply_start_planned` |
| Stop charging | `editor.energy_price.apply_stop` |
| Charger off | `editor.energy_price.charger_off` |
| Charging | `editor.energy_price.charger_on` |
| Chart height | `editor.energy_price.chart_height` |
| Chart span | `editor.energy_price.chart_hours` |
| 0 shows today (and tomorrow when published). Otherwise a rolling window from the current hour. | `editor.energy_price.chart_hours_desc` |
| Price chart from {start} to {end} | `editor.energy_price.chart_label` |
| Cheap | `editor.energy_price.cheap_color` |
| Cheap up to | `editor.energy_price.cheap_percent` |
| Cheap at or below | `editor.energy_price.cheap_price` |
| In the displayed price unit. | `editor.energy_price.cheap_price_desc` |
| Level colors | `editor.energy_price.colors_group` |
| Nord Pool config entry | `editor.energy_price.config_entry` |
| Usually found automatically from the sensor. Only needed if prices do not load. | `editor.energy_price.config_entry_desc` |
| Decimals | `editor.energy_price.decimals` |
| Electricity price | `editor.energy_price.default_title` |
| Detected: {source} | `editor.energy_price.detected` |
| {today} prices today, {tomorrow} tomorrow | `editor.energy_price.detected_counts` |
| This sensor has no price list, so only the current price is shown. Pick the sensor your price integration creates (for core Nord Pool or Tibber, choose the source under Advanced source). | `editor.energy_price.detected_none` |
| Display | `editor.energy_price.display_section` |
| Choose what the card shows. | `editor.energy_price.display_section_desc` |
| Advanced charging | `editor.energy_price.ev_advanced` |
| Split into cheapest hours | `editor.energy_price.ev_allow_split` |
| On: pick the cheapest hours anywhere before departure. Off: one unbroken session. | `editor.energy_price.ev_allow_split_desc` |
| Nothing runs on its own: the button only acts when you tap it. For fully automatic charging, send the plan to a script or set helper times that an automation uses. | `editor.energy_price.ev_apply_desc` |
| Apply plan button | `editor.energy_price.ev_apply_group` |
| Button | `editor.energy_price.ev_apply_mode` |
| At target ({target}%) — no charging needed | `editor.energy_price.ev_at_target` |
| Battery size | `editor.energy_price.ev_capacity` |
| Usable battery capacity. | `editor.energy_price.ev_capacity_desc` |
| Charge now — this is a planned cheap slot | `editor.energy_price.ev_charge_now` |
| Charger switch | `editor.energy_price.ev_charger_entity` |
| Optional: the switch that starts and stops charging. Shows whether the charger is on. | `editor.energy_price.ev_charger_entity_desc` |
| Estimated cost {cost} · avg {price} | `editor.energy_price.ev_cost` |
| Departure entity | `editor.energy_price.ev_departure_entity` |
| Optional input_datetime or timestamp sensor that overrides the departure time. | `editor.energy_price.ev_departure_entity_desc` |
| Departure | `editor.energy_price.ev_departure_time` |
| The car should be charged by this time (next occurrence). | `editor.energy_price.ev_departure_time_desc` |
| Charging efficiency | `editor.energy_price.ev_efficiency` |
| Share of grid energy that ends up in the battery. | `editor.energy_price.ev_efficiency_desc` |
| Plan EV charging | `editor.energy_price.ev_enabled` |
| Plan the cheapest hours to reach your target battery level by departure. | `editor.energy_price.ev_enabled_desc` |
| End time helper | `editor.energy_price.ev_end_entity` |
| Optional input_datetime set to the last planned end. | `editor.energy_price.ev_end_entity_desc` |
| Hours to charge | `editor.energy_price.ev_manual_hours` |
| Used when there is no battery level sensor. | `editor.energy_price.ev_manual_hours_desc` |
| Next charging: {time} | `editor.energy_price.ev_next` |
| No prices available to plan with yet | `editor.energy_price.ev_no_plan` |
| Charging power | `editor.energy_price.ev_power` |
| Typical home chargers: 3.7, 7.4 or 11 kW. | `editor.energy_price.ev_power_desc` |
| Charger power sensor | `editor.energy_price.ev_power_entity` |
| Optional. While it reports more than 0 it replaces the charging power above. | `editor.energy_price.ev_power_entity_desc` |
| Prices after {time} are not published yet; the plan uses what is known. | `editor.energy_price.ev_prices_short` |
| Script | `editor.energy_price.ev_script` |
| Receives charge_start, charge_end, ranges, kwh, cost, target_soc and departure as variables. | `editor.energy_price.ev_script_desc` |
| EV smart charging | `editor.energy_price.ev_section` |
| Not enough time before departure: {short} short. | `editor.energy_price.ev_short` |
| Battery level sensor | `editor.energy_price.ev_soc_entity` |
| Your car’s state of charge in %. Without it the plan uses a fixed number of hours (Advanced charging). | `editor.energy_price.ev_soc_entity_desc` |
| Start time helper | `editor.energy_price.ev_start_entity` |
| input_datetime set to the first planned start. | `editor.energy_price.ev_start_entity_desc` |
| {kwh} kWh · {hours} · by {departure} | `editor.energy_price.ev_summary` |
| Target level entity | `editor.energy_price.ev_target_entity` |
| Optional number / input_number that overrides the target level. | `editor.energy_price.ev_target_entity_desc` |
| Target level | `editor.energy_price.ev_target_soc` |
| Charge up to this level. | `editor.energy_price.ev_target_soc_desc` |
| EV charge plan | `editor.energy_price.ev_title` |
| Expensive | `editor.energy_price.expensive_color` |
| Expensive from | `editor.energy_price.expensive_percent` |
| Expensive at or above | `editor.energy_price.expensive_price` |
| In the displayed price unit. | `editor.energy_price.expensive_price_desc` |
| EV charging | `editor.energy_price.legend_plan` |
| Cheapest run | `editor.energy_price.legend_window` |
| Cheap | `editor.energy_price.level_cheap` |
| Expensive | `editor.energy_price.level_expensive` |
| Cheap and expensive by | `editor.energy_price.level_mode` |
| Relative: position in the day’s low–high range. Percentile: share of the day’s prices. Fixed: your own price limits. | `editor.energy_price.level_mode_desc` |
| Normal | `editor.energy_price.level_normal` |
| Price levels | `editor.energy_price.levels_section` |
| Loading prices… | `editor.energy_price.loading` |
| Price sensor not found | `editor.energy_price.missing_title` |
| Fixed | `editor.energy_price.mode_absolute` |
| Percentile | `editor.energy_price.mode_percentile` |
| Relative | `editor.energy_price.mode_relative` |
| Show details | `editor.energy_price.more_info` |
| Multiplier | `editor.energy_price.multiplier` |
| e.g. 1.25 for 25% VAT. | `editor.energy_price.multiplier_desc` |
| No current price yet. | `editor.energy_price.no_current` |
| This sensor has no price list to chart. Pick the sensor your price integration creates. | `editor.energy_price.no_list` |
| No prices published for this period yet. | `editor.energy_price.no_prices` |
| Normal | `editor.energy_price.normal_color` |
| Price sensor | `editor.energy_price.price_entity` |
| Electricity price | `editor.energy_price.price_section` |
| Pick your price sensor. Nord Pool, Tibber, Octopus Energy, ENTSO-e, Energi Data Service and Amber are detected automatically. | `editor.energy_price.price_section_desc` |
| Price source | `editor.energy_price.price_source` |
| Auto-detect works for almost everyone. Pick a source only if detection gets it wrong. | `editor.energy_price.price_source_desc` |
| Energy Price & EV is a Pro feature: your electricity price curve from Nord Pool, Tibber, Octopus and more, the cheapest time to run appliances, and a smart EV charge plan. | `editor.energy_price.pro_description` |
| Select a price sensor in the General tab | `editor.energy_price.setup_desc` |
| Pick your electricity price sensor | `editor.energy_price.setup_title` |
| Price chart | `editor.energy_price.show_chart` |
| Bars colored by price level, with the current time marked. | `editor.energy_price.show_chart_desc` |
| Current price | `editor.energy_price.show_current` |
| Big current price with its cheap / normal / expensive level. | `editor.energy_price.show_current_desc` |
| Today’s low, average and high | `editor.energy_price.show_stats` |
| Three small figures under the price. | `editor.energy_price.show_stats_desc` |
| Show title | `editor.energy_price.show_title` |
| Header with the source name. | `editor.energy_price.show_title_desc` |
| Include tomorrow | `editor.energy_price.show_tomorrow` |
| Extend the chart once tomorrow’s prices are published (usually early afternoon). | `editor.energy_price.show_tomorrow_desc` |
| Cheapest time to run | `editor.energy_price.show_window` |
| The cheapest block of time ahead, e.g. when to start the dishwasher. | `editor.energy_price.show_window_desc` |
| Auto-detect | `editor.energy_price.source_auto` |
| Generic list | `editor.energy_price.source_generic` |
| Area or home name | `editor.energy_price.source_hint` |
| Core Nord Pool area (e.g. SE3) or Tibber home name when your account has several. | `editor.energy_price.source_hint_desc` |
| Advanced source | `editor.energy_price.source_section` |
| now | `editor.energy_price.start_now` |
| Average | `editor.energy_price.stat_avg` |
| High | `editor.energy_price.stat_high` |
| Low | `editor.energy_price.stat_low` |
| Found price sensors — tap to use: | `editor.energy_price.suggestions` |
| Title | `editor.energy_price.title` |
| Leave blank for “Electricity price”. | `editor.energy_price.title_desc` |
| Tomorrow | `editor.energy_price.tomorrow_short` |
| h | `editor.energy_price.unit_h` |
| min | `editor.energy_price.unit_min` |
| Unit | `editor.energy_price.unit_override` |
| Leave blank to use the sensor’s unit, e.g. “SEK/kWh”. | `editor.energy_price.unit_override_desc` |
| until {time} | `editor.energy_price.until` |
| {range} · avg {price} · in {wait} | `editor.energy_price.window_detail` |
| Until {end} · avg {price} | `editor.energy_price.window_detail_now` |
| Cheapest time to run | `editor.energy_price.window_group` |
| Cheapest {length}: start {time} | `editor.energy_price.window_headline` |
| Run length | `editor.energy_price.window_hours` |
| How long the appliance runs. The card finds the cheapest unbroken block this long. | `editor.energy_price.window_hours_desc` |
| Appliance name | `editor.energy_price.window_label` |
| Optional, e.g. “Dishwasher” → “Dishwasher: start at 02:00”. | `editor.energy_price.window_label_desc` |
| {label}: start {time} | `editor.energy_price.window_labeled` |
| Not enough published prices ahead for a {length} run. | `editor.energy_price.window_none` |

</details>

<details>
<summary><strong>Appliance (editor)</strong> — 132 left</summary>

| English text | Key |
| --- | --- |
| Running color | `editor.appliance.active_color` |
| Accent while a cycle is running | `editor.appliance.active_color_desc` |
| Card background | `editor.appliance.card_bg` |
| Second oven mode | `editor.appliance.cavity_mode` |
| Second oven set point | `editor.appliance.cavity_setpoint` |
| Second oven state | `editor.appliance.cavity_state` |
| Second oven temperature | `editor.appliance.cavity_temp` |
| Child lock | `editor.appliance.child_lock` |
| 1 burner on | `editor.appliance.chip_burner_on` |
| burners on | `editor.appliance.chip_burners_on` |
| Child lock | `editor.appliance.chip_child_lock` |
| Door open | `editor.appliance.chip_door_open` |
| Replace filter | `editor.appliance.chip_filter` |
| Remote off | `editor.appliance.chip_remote_off` |
| Wrinkle prevent | `editor.appliance.chip_wrinkle` |
| Completion time sensor | `editor.appliance.completion_time` |
| Select an appliance | `editor.appliance.config_needed` |
| Choose the main entity in the General tab | `editor.appliance.config_needed_desc` |
| Cooktop burners | `editor.appliance.cooktop` |
| Entities that report each burner’s state (on/off, heating, or a power number). They light the burners on the graphic and show a “burners on” chip. Auto-detected entities appear below. | `editor.appliance.cooktop_desc` |
| Cooktop on | `editor.appliance.cooktop_on` |
| Add a burner entity… | `editor.appliance.cooktop_placeholder` |
| Cooling | `editor.appliance.cooling` |
| Decrease | `editor.appliance.decrease` |
| Display | `editor.appliance.display_section` |
| Choose what to show on the card. | `editor.appliance.display_section_desc` |
| Done color | `editor.appliance.done_color` |
| Door sensor | `editor.appliance.door` |
| Doors open | `editor.appliance.doors_open` |
| Enable animations | `editor.appliance.enable_animations` |
| Drum spin, bubbles, steam, and glow effects while running | `editor.appliance.enable_animations_desc` |
| Ends | `editor.appliance.ends_at` |
| Energy (kWh) | `editor.appliance.energy_sensor` |
| Main entity | `editor.appliance.entity` |
| Main entity | `editor.appliance.entity_section` |
| Pick the machine-state select or sensor (e.g. select.washer or a run-state sensor). Related sensors and switches are found automatically — works with SmartThings, LG ThinQ, Home Connect (Bosch, Siemens, Neff), and sim… | `editor.appliance.entity_section_desc` |
| Pick any entity of the refrigerator device (e.g. a temperature or door sensor). Related sensors and switches are found automatically — works with SmartThings, LG ThinQ, and similar integrations. | `editor.appliance.entity_section_desc_fridge` |
| Pick the oven machine-state sensor (e.g. sensor.range_oven_machine_state) or any entity of the range. Oven temperature, modes, burners, and the light are found automatically. | `editor.appliance.entity_section_desc_range` |
| Feature switches | `editor.appliance.features` |
| Toggle chips shown on the card (sanitize, storm wash, power cool, ice maker, wrinkle prevent…). Auto-detected switches appear below — remove any you don’t want, or add your own. | `editor.appliance.features_desc` |
| Add a switch… | `editor.appliance.features_placeholder` |
| Replace water filter | `editor.appliance.filter_alert` |
| Water filter status | `editor.appliance.filter_status` |
| Freezer | `editor.appliance.freezer` |
| Freezer door | `editor.appliance.freezer_door` |
| Freezer door open | `editor.appliance.freezer_door_open` |
| Freezer setpoint | `editor.appliance.freezer_setpoint` |
| Freezer temperature | `editor.appliance.freezer_temp` |
| Fridge | `editor.appliance.fridge` |
| Fridge door | `editor.appliance.fridge_door` |
| Fridge door open | `editor.appliance.fridge_door_open` |
| Fridge setpoint | `editor.appliance.fridge_setpoint` |
| Fridge temperature | `editor.appliance.fridge_temp` |
| Increase | `editor.appliance.increase` |
| Job state sensor | `editor.appliance.job_state` |
| Layout | `editor.appliance.layout` |
| Compact | `editor.appliance.layout_compact` |
| Hero, standard, or compact | `editor.appliance.layout_desc` |
| Hero | `editor.appliance.layout_hero` |
| Layout | `editor.appliance.layout_section` |
| How the card is arranged. | `editor.appliance.layout_section_desc` |
| Standard | `editor.appliance.layout_standard` |
| Optional overrides | `editor.appliance.links_group` |
| Linked entities | `editor.appliance.links_section` |
| Everything below is auto-detected from the main entity. Only set a field when detection picks the wrong entity. | `editor.appliance.links_section_desc` |
| Lower oven | `editor.appliance.lower_oven` |
| Machine state sensor | `editor.appliance.machine_state` |
| Energy | `editor.appliance.metric_energy` |
| Power | `editor.appliance.metric_power` |
| Name | `editor.appliance.name` |
| Leave empty to use the entity name | `editor.appliance.name_desc` |
| Open | `editor.appliance.open` |
| Oven | `editor.appliance.oven` |
| Oven job state | `editor.appliance.oven_job` |
| Light | `editor.appliance.oven_light` |
| Oven light | `editor.appliance.oven_light_entity` |
| Oven mode (bake, roast…) | `editor.appliance.oven_mode` |
| Oven set point | `editor.appliance.oven_setpoint` |
| Oven machine state | `editor.appliance.oven_state` |
| Oven temperature | `editor.appliance.oven_temp` |
| Pause | `editor.appliance.pause` |
| Power | `editor.appliance.power` |
| Power (W) | `editor.appliance.power_sensor` |
| Power switch | `editor.appliance.power_switch` |
| Program | `editor.appliance.program` |
| Remote control | `editor.appliance.remote_control` |
| Enable remote control on the appliance to allow remote start | `editor.appliance.remote_disabled` |
| Reset filter | `editor.appliance.reset_filter` |
| Resume | `editor.appliance.resume` |
| Set | `editor.appliance.set_to` |
| Cycle setting dropdowns | `editor.appliance.settings` |
| Select entities shown as dropdowns (water temperature, spin level, soil level, wash zone…). Auto-detected selects appear below — remove any you don’t want, or add your own. | `editor.appliance.settings_desc` |
| Add a select… | `editor.appliance.settings_placeholder` |
| Show status chips | `editor.appliance.show_chips` |
| Child lock, remote control, door open, filter alerts | `editor.appliance.show_chips_desc` |
| Show time remaining | `editor.appliance.show_completion` |
| Countdown and finish time while a cycle runs | `editor.appliance.show_completion_desc` |
| Countdown and finish time while the oven runs | `editor.appliance.show_completion_desc_range` |
| Show controls | `editor.appliance.show_controls` |
| Start / Pause / Stop buttons | `editor.appliance.show_controls_desc` |
| Oven light and Stop buttons | `editor.appliance.show_controls_desc_range` |
| Show cooktop burners | `editor.appliance.show_cooktop` |
| Burner indicators on the graphic and a “burners on” chip | `editor.appliance.show_cooktop_desc` |
| Show feature switches | `editor.appliance.show_features` |
| Show appliance graphic | `editor.appliance.show_graphic` |
| Show power & energy | `editor.appliance.show_metrics` |
| Live wattage and energy usage tiles | `editor.appliance.show_metrics_desc` |
| Show power button | `editor.appliance.show_power_button` |
| Show setpoint controls | `editor.appliance.show_setpoints` |
| − / + buttons to adjust target temperatures | `editor.appliance.show_setpoints_desc` |
| Show cycle settings | `editor.appliance.show_settings` |
| Dropdowns for water temperature, spin level, and similar options | `editor.appliance.show_settings_desc` |
| Show status | `editor.appliance.show_status` |
| Cycle phase and job state | `editor.appliance.show_status_desc` |
| Show temperatures | `editor.appliance.show_temps` |
| Fridge and freezer temperature tiles | `editor.appliance.show_temps_desc` |
| Show oven temperature | `editor.appliance.show_temps_range` |
| Current temperature and set point tiles | `editor.appliance.show_temps_range_desc` |
| Show title | `editor.appliance.show_title` |
| Graphic size | `editor.appliance.size` |
| Size of the appliance illustration | `editor.appliance.size_desc` |
| Start | `editor.appliance.start` |
| Done | `editor.appliance.state_done` |
| Error | `editor.appliance.state_error` |
| Idle | `editor.appliance.state_idle` |
| Off | `editor.appliance.state_off` |
| Paused | `editor.appliance.state_paused` |
| Running | `editor.appliance.state_running` |
| Unavailable | `editor.appliance.state_unavailable` |
| Stop | `editor.appliance.stop` |
| Stop button | `editor.appliance.stop_button` |
| Text color | `editor.appliance.text_color` |

</details>

<details>
<summary><strong>Camera grid (editor)</strong> — 131 left</summary>

| English text | Key |
| --- | --- |
| Auto-cycle spotlight | `editor.camera_grid.behaviour.cycle` |
| Rotate the featured camera on an interval. Pauses while motion is holding the spotlight. | `editor.camera_grid.behaviour.cycle_desc` |
| Cycle interval | `editor.camera_grid.behaviour.cycle_interval` |
| Seconds each camera stays in the spotlight. | `editor.camera_grid.behaviour.cycle_interval_desc` |
| What happens when you tap or hold a camera tile, plus auto-cycle and motion spotlight. | `editor.camera_grid.behaviour.desc` |
| Fullscreen | `editor.camera_grid.behaviour.fullscreen` |
| Hold action | `editor.camera_grid.behaviour.hold` |
| Action used when a camera tile is pressed and held. | `editor.camera_grid.behaviour.hold_desc` |
| Motion spotlight | `editor.camera_grid.behaviour.motion` |
| Motion highlight | `editor.camera_grid.behaviour.motion_color` |
| Outline color for tiles that currently have motion. | `editor.camera_grid.behaviour.motion_color_desc` |
| When a tile motion sensor turns on, that camera jumps to the spotlight and stays there for the hold time. | `editor.camera_grid.behaviour.motion_desc` |
| Motion hold | `editor.camera_grid.behaviour.motion_hold` |
| Seconds to keep a motion camera in the spotlight after it triggers. | `editor.camera_grid.behaviour.motion_hold_desc` |
| Nothing | `editor.camera_grid.behaviour.nothing` |
| Spotlight | `editor.camera_grid.behaviour.spotlight` |
| Tap action | `editor.camera_grid.behaviour.tap` |
| Spotlight swaps the featured camera. Fullscreen opens the live feed. More info opens the entity dialog. | `editor.camera_grid.behaviour.tap_desc` |
| Behaviour | `editor.camera_grid.behaviour.title` |
| Add cameras | `editor.camera_grid.empty` |
| Choose camera entities in the General tab to build the grid | `editor.camera_grid.empty_desc` |
| Tile aspect ratio | `editor.camera_grid.layout.aspect` |
| Custom | `editor.camera_grid.layout.aspect_custom` |
| Default shape for camera tiles. Masonry can override this per tile. | `editor.camera_grid.layout.aspect_desc` |
| Custom ratio | `editor.camera_grid.layout.aspect_value` |
| Width divided by height. 1.78 is 16:9. | `editor.camera_grid.layout.aspect_value_desc` |
| Auto-fit | `editor.camera_grid.layout.auto_fit` |
| Columns | `editor.camera_grid.layout.columns` |
| Number of columns in the grid. | `editor.camera_grid.layout.columns_desc` |
| Custom | `editor.camera_grid.layout.custom` |
| Choose how tiles are arranged and sized. | `editor.camera_grid.layout.desc` |
| Gap | `editor.camera_grid.layout.gap` |
| Space between tiles. | `editor.camera_grid.layout.gap_desc` |
| Masonry | `editor.camera_grid.layout.masonry` |
| Minimum tile width | `editor.camera_grid.layout.min_tile_width` |
| Tiles wrap onto new rows when the card is narrower than this width. | `editor.camera_grid.layout.min_tile_width_desc` |
| Grid style | `editor.camera_grid.layout.mode` |
| Regular keeps even cells. Auto-fit wraps by width. Masonry stacks mixed ratios. Spotlight enlarges one tile. Custom uses per-tile spans. | `editor.camera_grid.layout.mode_desc` |
| Tile corner radius | `editor.camera_grid.layout.radius` |
| Round the corners of each tile. | `editor.camera_grid.layout.radius_desc` |
| Regular | `editor.camera_grid.layout.regular` |
| Spotlight | `editor.camera_grid.layout.spotlight` |
| Layout | `editor.camera_grid.layout.title` |
| Status badges | `editor.camera_grid.overlays.badges` |
| Show motion, recording, and offline indicators on tiles. | `editor.camera_grid.overlays.badges_desc` |
| Bottom middle | `editor.camera_grid.overlays.bottom_middle` |
| Name labels, motion and recording badges, and fallback imagery. | `editor.camera_grid.overlays.desc` |
| Fallback image | `editor.camera_grid.overlays.fallback` |
| Shown when a camera is unavailable or a snapshot fails. | `editor.camera_grid.overlays.fallback_desc` |
| Name position | `editor.camera_grid.overlays.name_position` |
| Where the name overlay sits on each tile. | `editor.camera_grid.overlays.name_position_desc` |
| Show names | `editor.camera_grid.overlays.show_names` |
| Overlay the camera or tile name on each feed. | `editor.camera_grid.overlays.show_names_desc` |
| Snapshot time | `editor.camera_grid.overlays.snapshot_time` |
| Show when the last snapshot was taken on snapshot tiles. | `editor.camera_grid.overlays.snapshot_time_desc` |
| Overlays and badges | `editor.camera_grid.overlays.title` |
| Top middle | `editor.camera_grid.overlays.top_middle` |
| Arrows | `editor.camera_grid.pagination.arrows` |
| Auto-page | `editor.camera_grid.pagination.auto` |
| Advance pages automatically on an interval. | `editor.camera_grid.pagination.auto_desc` |
| Page interval | `editor.camera_grid.pagination.auto_interval` |
| Seconds between automatic page changes. | `editor.camera_grid.pagination.auto_interval_desc` |
| Arrows and dots | `editor.camera_grid.pagination.both` |
| Split large camera lists across pages. | `editor.camera_grid.pagination.desc` |
| Dots | `editor.camera_grid.pagination.dots` |
| Next page | `editor.camera_grid.pagination.next` |
| Hidden | `editor.camera_grid.pagination.none` |
| Page {n} | `editor.camera_grid.pagination.page` |
| Tiles per page | `editor.camera_grid.pagination.per_page` |
| 0 shows every tile. Set a number to page through larger sets. | `editor.camera_grid.pagination.per_page_desc` |
| Previous page | `editor.camera_grid.pagination.prev` |
| Pager style | `editor.camera_grid.pagination.style` |
| How page navigation is shown under the grid. | `editor.camera_grid.pagination.style_desc` |
| Pagination | `editor.camera_grid.pagination.title` |
| Center | `editor.camera_grid.spotlight.center` |
| Left | `editor.camera_grid.spotlight.left` |
| Spotlight position | `editor.camera_grid.spotlight.position` |
| Where the featured tile sits in the grid. | `editor.camera_grid.spotlight.position_desc` |
| Right | `editor.camera_grid.spotlight.right` |
| Spotlight size | `editor.camera_grid.spotlight.span` |
| How many columns and rows the featured tile occupies. | `editor.camera_grid.spotlight.span_desc` |
| Tap to spotlight | `editor.camera_grid.spotlight.tap_to_spotlight` |
| Tap a smaller camera to swap it into the featured slot. | `editor.camera_grid.spotlight.tap_to_spotlight_desc` |
| Spotlight | `editor.camera_grid.spotlight.title` |
| Top left | `editor.camera_grid.spotlight.top_left` |
| Top right | `editor.camera_grid.spotlight.top_right` |
| Adaptive streaming | `editor.camera_grid.stream.adaptive` |
| Live stream only the spotlight or large tiles. Small tiles use snapshots to save bandwidth. | `editor.camera_grid.stream.adaptive_desc` |
| How camera tiles fetch video. Adaptive keeps live video on the featured tile only. | `editor.camera_grid.stream.desc` |
| Image fit | `editor.camera_grid.stream.fit` |
| How the feed fills each tile. Cover crops, contain letterboxes, fill stretches. | `editor.camera_grid.stream.fit_desc` |
| Snapshot refresh | `editor.camera_grid.stream.refresh` |
| Seconds between still-image refreshes in snapshot mode. | `editor.camera_grid.stream.refresh_desc` |
| Stream | `editor.camera_grid.stream.title` |
| Stream mode | `editor.camera_grid.stream.view_mode` |
| Auto uses Home Assistant snapshot polling. Live opens a continuous stream. Snapshot refreshes on your interval. | `editor.camera_grid.stream.view_mode_desc` |
| Tile ratio | `editor.camera_grid.tile.aspect` |
| Used by masonry to estimate tile height. | `editor.camera_grid.tile.aspect_desc` |
| Clock format | `editor.camera_grid.tile.clock_format` |
| 12-hour or 24-hour time. | `editor.camera_grid.tile.clock_format_desc` |
| Column span | `editor.camera_grid.tile.col_span` |
| How many columns this tile occupies. | `editor.camera_grid.tile.col_span_desc` |
| Camera entity | `editor.camera_grid.tile.entity` |
| Entity | `editor.camera_grid.tile.entity_pic` |
| Image | `editor.camera_grid.tile.image` |
| Logo or still image shown in this tile. | `editor.camera_grid.tile.image_desc` |
| Image entity | `editor.camera_grid.tile.image_entity` |
| Image fit | `editor.camera_grid.tile.image_fit` |
| Cover crops the image. Contain shows the whole logo. | `editor.camera_grid.tile.image_fit_desc` |
| Image source | `editor.camera_grid.tile.image_source` |
| Upload a logo, paste a URL, or use an entity picture. | `editor.camera_grid.tile.image_source_desc` |
| Inherit | `editor.camera_grid.tile.inherit` |
| Motion sensor | `editor.camera_grid.tile.motion` |
| Name | `editor.camera_grid.tile.name` |
| Optional label. Leave blank to use the entity name. | `editor.camera_grid.tile.name_desc` |
| Recording entity | `editor.camera_grid.tile.recording` |
| Row span | `editor.camera_grid.tile.row_span` |
| How many rows this tile occupies. | `editor.camera_grid.tile.row_span_desc` |
| Show date | `editor.camera_grid.tile.show_date` |
| Show the current date under the time. | `editor.camera_grid.tile.show_date_desc` |
| Text | `editor.camera_grid.tile.text` |
| Shown in the centre of this tile. | `editor.camera_grid.tile.text_desc` |
| Upload | `editor.camera_grid.tile.upload` |
| Tile stream mode | `editor.camera_grid.tile.view_mode` |
| Inherit uses the grid default. Override for this tile only. | `editor.camera_grid.tile.view_mode_desc` |
| Add cameras | `editor.camera_grid.tiles.add_cameras` |
| Pick camera entities to add as tiles. Drag the list below to change order. | `editor.camera_grid.tiles.add_cameras_desc` |
| Choose a camera | `editor.camera_grid.tiles.camera_placeholder` |
| Add cameras and extra tiles, then drag to rearrange the grid. | `editor.camera_grid.tiles.desc` |
| Tiles | `editor.camera_grid.tiles.title` |
| Camera | `editor.camera_grid.tiles.type_camera` |

</details>

<details>
<summary><strong>Irrigation (editor)</strong> — 121 left</summary>

| English text | Key |
| --- | --- |
| Zones | `editor.irrigation.zones_section` |
| Pick the switch or valve entities for each sprinkler zone. Integration zones (OpenSprinkler, Rachio, Irrigation Unlimited, B-hyve) are detected automatically. | `editor.irrigation.zones_section_desc` |
| Zone entities | `editor.irrigation.zone_entities` |
| One entity per zone, shown in this order. | `editor.irrigation.zone_entities_desc` |
| Default run time | `editor.irrigation.default_duration` |
| Minutes per run for zones without their own run time. Home Assistant ends timed runs, so they finish even if this dashboard is closed. | `editor.irrigation.default_duration_desc` |
|  min | `editor.irrigation.unit_min` |
| No zone-like entities found. Add any switch or valve above. | `editor.irrigation.no_suggestions` |
| Suggested zones | `editor.irrigation.suggestions` |
| Add all suggested | `editor.irrigation.add_all_suggested` |
| Runs your custom action with the chosen run time. | `editor.irrigation.plan_custom` |
| {name}: runs for the chosen time and is stopped by Home Assistant. | `editor.irrigation.plan_service` |
| {name}: on/off only. For timed runs use Custom action (for example a script with a delay). | `editor.irrigation.plan_toggle` |
| This entity cannot be switched directly. Choose Integration service or Custom action. | `editor.irrigation.plan_none` |
| Move up | `editor.irrigation.move_up` |
| Move down | `editor.irrigation.move_down` |
| Edit zone | `editor.irrigation.edit_zone` |
| Remove zone | `editor.irrigation.remove_zone` |
| Name | `editor.irrigation.zone_name` |
| Leave blank to use the entity name. | `editor.irrigation.zone_name_desc` |
| Icon | `editor.irrigation.zone_icon` |
| Color | `editor.irrigation.zone_color` |
| Accent for this zone while it runs. | `editor.irrigation.zone_color_desc` |
| Run time | `editor.irrigation.zone_duration` |
| Minutes for this zone. Reset uses the default run time. | `editor.irrigation.zone_duration_desc` |
| Run mode | `editor.irrigation.run_mode` |
| How the Run button starts this zone. | `editor.irrigation.run_mode_desc` |
| Auto | `editor.irrigation.run_mode_auto` |
| On/off | `editor.irrigation.run_mode_toggle` |
| Integration | `editor.irrigation.run_mode_service` |
| Custom action | `editor.irrigation.run_mode_custom` |
| Integration | `editor.irrigation.preset` |
| Which integration service starts the timed run. | `editor.irrigation.preset_desc` |
| Auto-detect | `editor.irrigation.preset_auto` |
| Zone sensors | `editor.irrigation.zone_sensors` |
| Soil moisture sensor | `editor.irrigation.moisture_entity` |
| Remaining time sensor | `editor.irrigation.remaining_entity` |
| Optional. Most integrations expose remaining time on the zone itself; otherwise the card shows an estimate. | `editor.irrigation.remaining_entity_desc` |
| Custom action | `editor.irrigation.custom_action` |
| Start service | `editor.irrigation.custom_service` |
| domain.service, for example script.water_zone or esphome.sprinkler_start_single_valve. | `editor.irrigation.custom_service_desc` |
| Start data | `editor.irrigation.custom_data` |
| Placeholders: {{ entity_id }}, {{ duration }} (minutes), {{ duration_seconds }}, {{ duration_hms }}. | `editor.irrigation.custom_data_desc` |
| Stop service | `editor.irrigation.custom_stop_service` |
| Optional. Leave blank to turn the zone entity off. | `editor.irrigation.custom_stop_service_desc` |
| Display | `editor.irrigation.display_section` |
| Title and what each row shows. | `editor.irrigation.display_section_desc` |
| Show title | `editor.irrigation.show_title` |
| Title | `editor.irrigation.title` |
| Leave blank for "Irrigation". | `editor.irrigation.title_desc` |
| Show remaining time | `editor.irrigation.show_remaining` |
| Run time stepper | `editor.irrigation.show_duration_control` |
| Lets you change the run time on the card before starting a timed zone. | `editor.irrigation.show_duration_control_desc` |
| Layout | `editor.irrigation.layout` |
| Full rows or a compact list. | `editor.irrigation.layout_desc` |
| Full | `editor.irrigation.layout_full` |
| Compact | `editor.irrigation.layout_compact` |
| Accent color | `editor.irrigation.accent_color` |
| Used for running zones and buttons. Defaults to the theme primary color. | `editor.irrigation.accent_color_desc` |
| Advanced | `editor.irrigation.advanced_section` |
| All optional. Anything you leave empty is simply not shown. | `editor.irrigation.advanced_section_desc` |
| System | `editor.irrigation.system_group` |
| Master valve / pump | `editor.irrigation.master_entity` |
| Rain delay | `editor.irrigation.rain_delay_entity` |
| A switch toggles the delay, a number is set in hours (Off / 24 / 48 / 72 h), a select shows its options. | `editor.irrigation.rain_delay_desc` |
| Rain sensor / skip indicator | `editor.irrigation.rain_sensor_entity` |
| Next scheduled run | `editor.irrigation.next_run_entity` |
| Water use | `editor.irrigation.water_group` |
| Flow rate sensor | `editor.irrigation.flow_entity` |
| Water used today | `editor.irrigation.water_used_entity` |
| Tip: point this at a daily utility meter on your water meter. | `editor.irrigation.water_used_desc` |
| Soil moisture | `editor.irrigation.moisture_group` |
| Dry below | `editor.irrigation.moisture_dry` |
| Wet above | `editor.irrigation.moisture_wet` |
| Run all zones | `editor.irrigation.run_all_group` |
| Run all | `editor.irrigation.run_all_mode` |
| Runs through a script or an integration service so the sequence keeps going in Home Assistant. | `editor.irrigation.run_all_mode_desc` |
| Off | `editor.irrigation.run_all_none` |
| Script | `editor.irrigation.run_all_script` |
| Service | `editor.irrigation.run_all_service` |
| Script | `editor.irrigation.run_all_entity` |
| Service | `editor.irrigation.run_all_service_field` |
| domain.service, for example rachio.start_multiple_zone_schedule or opensprinkler.run_program. | `editor.irrigation.run_all_service_desc` |
| Service data | `editor.irrigation.run_all_data` |
| Placeholders: {{ duration }} (default minutes), {{ duration_seconds }}, {{ duration_hms }}. | `editor.irrigation.run_all_data_desc` |
| The script receives duration (minutes) and duration_seconds as variables. | `editor.irrigation.run_all_script_desc` |
| Add your irrigation zones | `editor.irrigation.empty_title` |
| {count} likely zones found. Add them in the General tab. | `editor.irrigation.empty_desc_found` |
| Pick switch or valve entities for your sprinkler zones in the General tab. | `editor.irrigation.empty_desc` |
| Irrigation | `editor.irrigation.default_title` |
| Run all | `editor.irrigation.run_all` |
| Master | `editor.irrigation.master` |
| On | `editor.irrigation.state_on` |
| Off | `editor.irrigation.state_off` |
| Rain: skipping | `editor.irrigation.rain_active` |
| No rain | `editor.irrigation.rain_clear` |
| Next | `editor.irrigation.next_run` |
| Today | `editor.irrigation.water_today` |
| Rain delay | `editor.irrigation.rain_delay` |
| Unavailable | `editor.irrigation.status_unavailable` |
| Queued | `editor.irrigation.status_queued` |
| Running | `editor.irrigation.status_running` |
| {time} left | `editor.irrigation.time_left` |
| est. | `editor.irrigation.estimate` |
| for {time} | `editor.irrigation.time_elapsed` |
| Idle | `editor.irrigation.status_idle` |
| min | `editor.irrigation.unit_min_short` |
| Stop | `editor.irrigation.stop` |
| Run | `editor.irrigation.run` |
| Dry | `editor.irrigation.moisture_dry_label` |
| Wet | `editor.irrigation.moisture_wet_label` |
| Soil moisture | `editor.irrigation.moisture` |
| Less time | `editor.irrigation.less_time` |
| More time | `editor.irrigation.more_time` |
| OpenSprinkler | `editor.irrigation.preset_opensprinkler` |
| Rachio | `editor.irrigation.preset_rachio` |
| Irrigation Unlimited | `editor.irrigation.preset_irrigation_unlimited` |
| B-hyve | `editor.irrigation.preset_bhyve` |
| Valve | `editor.irrigation.preset_valve` |
| Switch (on/off) | `editor.irrigation.preset_switch` |
| Appearance | `editor.irrigation.appearance_section` |

</details>

<details>
<summary><strong>Floorplan (editor)</strong> — 115 left</summary>

| English text | Key |
| --- | --- |
| Floor plan image | `editor.floorplan.image_section` |
| Upload a picture of your floor plan, or paste a link to one. A screenshot of a vacuum map or a photo of a sketch works too. | `editor.floorplan.image_section_desc` |
| Image | `editor.floorplan.image` |
| PNG, JPG, SVG or WebP. Markers are placed in percent, so any size works. | `editor.floorplan.image_desc` |
| Or use an image URL | `editor.floorplan.image_url` |
| A full URL or a /local/ path. Same setting as the upload above. | `editor.floorplan.image_url_desc` |
| Markers | `editor.floorplan.markers_section` |
| Add an entity, then click on the plan to place it. Tapping a marker toggles lights and switches, and opens details for everything else. | `editor.floorplan.markers_section_desc` |
| No markers yet. Add your first one below. | `editor.floorplan.no_markers` |
| Add marker | `editor.floorplan.add_marker` |
| Choose an entity | `editor.floorplan.unbound_marker` |
| Place on the plan | `editor.floorplan.place_marker` |
| Remove | `editor.floorplan.remove` |
| Entity | `editor.floorplan.entity` |
| Horizontal position | `editor.floorplan.pos_x` |
| Percent from the left edge. Clicking on the plan sets this too. | `editor.floorplan.pos_x_desc` |
| Vertical position | `editor.floorplan.pos_y` |
| Percent from the top edge. | `editor.floorplan.pos_y_desc` |
| Hide advanced options | `editor.floorplan.hide_advanced` |
| Advanced options | `editor.floorplan.show_advanced` |
| Advanced | `editor.floorplan.marker_advanced` |
| Name | `editor.floorplan.name` |
| Leave blank to use the entity name. | `editor.floorplan.name_desc` |
| Icon | `editor.floorplan.icon` |
| Leave blank to use the entity icon. | `editor.floorplan.icon_desc` |
| Icon while active | `editor.floorplan.active_icon` |
| Optional. Swaps in while the entity is on, open or home. | `editor.floorplan.active_icon_desc` |
| Icon size | `editor.floorplan.marker_size` |
| Overrides the size set under Display for this marker. | `editor.floorplan.marker_size_override_desc` |
| Show name | `editor.floorplan.show_name` |
| Show state | `editor.floorplan.show_state` |
| Active color | `editor.floorplan.active_color` |
| Icon color while active. Lights use their own color when this is empty. | `editor.floorplan.active_color_marker_desc` |
| Inactive color | `editor.floorplan.inactive_color` |
| Active when state is | `editor.floorplan.active_state` |
| Optional. By default on, open, unlocked, home and playing count as active. | `editor.floorplan.active_state_desc` |
| Glow | `editor.floorplan.glow` |
| A soft halo in the light color, brighter as the light gets brighter. | `editor.floorplan.glow_desc` |
| Label position | `editor.floorplan.label_position` |
| Below | `editor.floorplan.label_below` |
| Above | `editor.floorplan.label_above` |
| Left | `editor.floorplan.label_left` |
| Right | `editor.floorplan.label_right` |
| Tap action | `editor.floorplan.tap_action` |
| Hold action | `editor.floorplan.hold_action` |
| Double-tap action | `editor.floorplan.double_tap_action` |
| Add a floor plan image above to place markers by clicking on it. You can still add markers and set their position with the sliders. | `editor.floorplan.placement_needs_image` |
| Click on the plan to add corners to the selected polygon zone. | `editor.floorplan.hint_polygon` |
| Drag on the plan to draw a room zone. Drag a zone to move it, or its corner to resize. | `editor.floorplan.hint_zones` |
| Click on the plan to move the selected marker there, or drag any marker. | `editor.floorplan.hint_place` |
| Select a marker (or add one) and then click on the plan to place it. | `editor.floorplan.hint_select` |
| Editing | `editor.floorplan.edit_mode` |
| Markers | `editor.floorplan.mode_markers` |
| Room zones | `editor.floorplan.mode_zones` |
| Select a marker in the list first (the crosshair button). | `editor.floorplan.msg_select_marker` |
| Add a marker below first, then click here to place it. | `editor.floorplan.msg_add_marker` |
| Room | `editor.floorplan.new_zone` |
| Display | `editor.floorplan.display_section` |
| How every marker looks. Each marker can override these. | `editor.floorplan.display_section_desc` |
| Marker style | `editor.floorplan.marker_style` |
| Badges stay readable on busy pictures; plain icons are more minimal. | `editor.floorplan.marker_style_desc` |
| Badge | `editor.floorplan.style_badge` |
| Icon only | `editor.floorplan.style_icon` |
| Icons keep this size on any screen; their positions scale. | `editor.floorplan.marker_size_desc` |
| Show names | `editor.floorplan.show_names` |
| Label each marker with its name. | `editor.floorplan.show_names_desc` |
| Show states | `editor.floorplan.show_states` |
| Show the current state, like 21.5 °C or Open. | `editor.floorplan.show_states_desc` |
| Icon color while on. Empty uses the theme state colors; lights use their own color. | `editor.floorplan.active_color_desc` |
| Glow for lights | `editor.floorplan.glow_lights` |
| Lights that are on cast a soft halo tinted by their color and brightness. | `editor.floorplan.glow_lights_desc` |
| Glow | `editor.floorplan.glow_settings` |
| Glow intensity | `editor.floorplan.glow_intensity` |
| Glow size | `editor.floorplan.glow_size` |
| Width of the halo as a share of the plan width. | `editor.floorplan.glow_size_desc` |
| Room zones | `editor.floorplan.zones_section` |
| Optional. Draw rooms on the plan and bind each to a light or sensor; the room fills with color while it is on. | `editor.floorplan.zones_section_desc` |
| Add rectangle | `editor.floorplan.add_rect_zone` |
| Add polygon | `editor.floorplan.add_polygon_zone` |
| No entity | `editor.floorplan.no_entity` |
| Entity (light, motion sensor, door …) | `editor.floorplan.zone_entity` |
| Corners | `editor.floorplan.points` |
| Percent x,y pairs separated by spaces. Select this zone and click on the plan to add corners. | `editor.floorplan.points_desc` |
| Corners | `editor.floorplan.point_count` |
| Clear corners | `editor.floorplan.clear_points` |
| Width | `editor.floorplan.zone_width` |
| Height | `editor.floorplan.zone_height` |
| Fill color | `editor.floorplan.zone_color` |
| Empty uses the light color for lights, otherwise the theme accent. | `editor.floorplan.zone_color_desc` |
| Opacity while active | `editor.floorplan.zone_opacity` |
| Advanced | `editor.floorplan.zone_advanced` |
| Shape | `editor.floorplan.zone_shape` |
| Rectangle | `editor.floorplan.shape_rect` |
| Polygon | `editor.floorplan.shape_polygon` |
| Opacity while off | `editor.floorplan.zone_inactive_opacity` |
| Outline | `editor.floorplan.show_outline` |
| Draw the room edge, even while off. | `editor.floorplan.show_outline_desc` |
| Image & layout | `editor.floorplan.layout_section` |
| Shape | `editor.floorplan.aspect_ratio` |
| Auto follows the picture. A fixed shape keeps cards in a row the same height. | `editor.floorplan.aspect_ratio_desc` |
| Auto | `editor.floorplan.ratio_auto` |
| Image fit | `editor.floorplan.image_fit` |
| Markers are placed relative to this frame, so re-check them after changing it. | `editor.floorplan.image_fit_desc` |
| Fit | `editor.floorplan.fit_contain` |
| Fill & crop | `editor.floorplan.fit_cover` |
| Stretch | `editor.floorplan.fit_fill` |
| Dim when everything is off | `editor.floorplan.dim_when_all_off` |
| Darken the picture while none of the markers or zones are active. | `editor.floorplan.dim_when_all_off_desc` |
| Dim amount | `editor.floorplan.dim_amount` |
| Dark mode image | `editor.floorplan.dark_image` |
| Optional. Shown instead while Home Assistant uses a dark theme. Use the same framing as the main image. | `editor.floorplan.dark_image_desc` |
| Add your floor plan | `editor.floorplan.empty_title` |
| Pick a picture of your floor plan in the General tab, then add lights, sensors and doors as markers. | `editor.floorplan.empty_subtitle` |
| Add markers in the General tab | `editor.floorplan.preview_hint` |
| Not found | `editor.floorplan.entity_missing` |

</details>

<details>
<summary><strong>Rain radar (editor)</strong> — 101 left</summary>

| English text | Key |
| --- | --- |
| Advanced | `editor.rain_radar.advanced_section` |
| Location | `editor.rain_radar.location_section` |
| Center on | `editor.rain_radar.center_mode` |
| Home Assistant has no home location set. Pick an entity or enter coordinates instead. | `editor.rain_radar.center_home_missing` |
| Where the radar map is centered. | `editor.rain_radar.center_mode_desc` |
| Home | `editor.rain_radar.center_home` |
| Entity | `editor.rain_radar.center_entity` |
| Coordinates | `editor.rain_radar.center_manual` |
| Center entity | `editor.rain_radar.center_entity_field` |
| A person, device tracker or zone. The map follows it as it moves. | `editor.rain_radar.center_entity_desc` |
| Latitude | `editor.rain_radar.latitude` |
| Decimal degrees, -90 to 90. | `editor.rain_radar.latitude_desc` |
| Longitude | `editor.rain_radar.longitude` |
| Decimal degrees, -180 to 180. | `editor.rain_radar.longitude_desc` |
| Zoom | `editor.rain_radar.zoom` |
| Lower shows a wider region. RainViewer radar is sharpest at 7 and below. | `editor.rain_radar.zoom_desc` |
| Height | `editor.rain_radar.height` |
| Height of the map. | `editor.rain_radar.height_desc` |
| Map and radar | `editor.rain_radar.map_section` |
| Map style | `editor.rain_radar.map_style` |
| Auto switches between light and dark with Home Assistant. | `editor.rain_radar.map_style_desc` |
| Auto | `editor.rain_radar.style_auto` |
| Light | `editor.rain_radar.style_light` |
| Dark | `editor.rain_radar.style_dark` |
| Streets | `editor.rain_radar.style_streets` |
| Satellite | `editor.rain_radar.style_satellite` |
| Radar opacity | `editor.rain_radar.radar_opacity` |
| Lower lets more of the map show through the rain. | `editor.rain_radar.radar_opacity_desc` |
| Include forecast | `editor.rain_radar.show_forecast` |
| Add the next few forecast frames after "now" when the radar source offers them. | `editor.rain_radar.show_forecast_desc` |
| Snow colors | `editor.rain_radar.snow_colors` |
| Show snow in its own colors. | `editor.rain_radar.snow_colors_desc` |
| Smooth edges | `editor.rain_radar.smooth` |
| Soften the blocky edges of radar cells. | `editor.rain_radar.smooth_desc` |
| Display | `editor.rain_radar.display_section` |
| Title | `editor.rain_radar.title` |
| Shown on the map, for example "Rain near home". Leave blank for none. | `editor.rain_radar.title_desc` |
| Show title | `editor.rain_radar.show_title` |
| Show the title on the map. | `editor.rain_radar.show_title_desc` |
| Timeline | `editor.rain_radar.show_controls` |
| Play / pause button and a scrubber for every radar frame. | `editor.rain_radar.show_controls_desc` |
| Time of frame | `editor.rain_radar.show_timestamp` |
| The time and how long ago the shown frame was captured. | `editor.rain_radar.show_timestamp_desc` |
| Intensity legend | `editor.rain_radar.show_legend` |
| A small light-to-heavy color scale. | `editor.rain_radar.show_legend_desc` |
| Home marker | `editor.rain_radar.show_home_marker` |
| A pulsing dot on your home location. | `editor.rain_radar.show_home_marker_desc` |
| Markers | `editor.rain_radar.marker_entities` |
| People, device trackers or zones to show on the map. Tap a marker for details. | `editor.rain_radar.marker_entities_desc` |
| Marker names | `editor.rain_radar.show_marker_names` |
| Show a name label under each marker. | `editor.rain_radar.show_marker_names_desc` |
| Animation | `editor.rain_radar.animation_section` |
| Time span | `editor.rain_radar.time_span` |
| How far back the loop goes. RainViewer keeps about two hours. | `editor.rain_radar.time_span_desc` |
| {n} min | `editor.rain_radar.span_minutes` |
| {n} h | `editor.rain_radar.span_hours` |
| Play automatically | `editor.rain_radar.autoplay` |
| Loop through the radar frames when the dashboard opens. | `editor.rain_radar.autoplay_desc` |
| Frame speed | `editor.rain_radar.frame_delay` |
| How long each frame is shown. Lower is faster. | `editor.rain_radar.frame_delay_desc` |
| Pause on last frame | `editor.rain_radar.end_pause` |
| Extra time to hold the newest frame before the loop starts again. | `editor.rain_radar.end_pause_desc` |
| Pan and zoom | `editor.rain_radar.interactive` |
| Let people drag and pinch the map. Off keeps it fixed so swiping scrolls the dashboard. | `editor.rain_radar.interactive_desc` |
| Zoom buttons | `editor.rain_radar.show_zoom_controls` |
| Show + and − buttons on the map. | `editor.rain_radar.show_zoom_controls_desc` |
| Radar source URL | `editor.rain_radar.source_url` |
| Leave blank to use RainViewer (free, no key). Or a RainViewer-compatible weather-maps.json URL, such as a self-hosted mirror. | `editor.rain_radar.source_url_desc` |
| Choose where to show the radar | `editor.rain_radar.empty_title` |
| This entity has no location yet. Pick another one or enter coordinates in the General tab. | `editor.rain_radar.empty_entity_desc` |
| Set a home location in Home Assistant, or pick an entity or coordinates in the General tab. | `editor.rain_radar.empty_desc` |
| Now | `editor.rain_radar.now` |
| {n} min ago | `editor.rain_radar.minutes_ago` |
| In {n} min | `editor.rain_radar.in_minutes` |
| Light | `editor.rain_radar.legend_light` |
| Heavy | `editor.rain_radar.legend_heavy` |
| Back to center | `editor.rain_radar.recenter` |
| Loading radar… | `editor.rain_radar.loading` |
| Radar unavailable, retrying soon | `editor.rain_radar.unavailable` |
| Pause | `editor.rain_radar.pause` |
| Play | `editor.rain_radar.play` |
| Radar time | `editor.rain_radar.timeline` |
| Radar source | `editor.rain_radar.radar_source` |
| OpenWeather API key | `editor.rain_radar.openweather_api_key` |
| From your openweathermap.org account. Animated history and forecast need a plan with Weather Maps 2.0; other keys show current rain only. The key is saved in this dashboard, so anyone who can edit it can see the key. | `editor.rain_radar.openweather_api_key_desc` |
| Enter your key from openweathermap.org. Until then the radar uses RainViewer. | `editor.rain_radar.openweather_api_key_missing` |
| Full screen button | `editor.rain_radar.show_fullscreen` |
| A button that opens the map full screen, with pan and zoom. | `editor.rain_radar.show_fullscreen_desc` |
| Full screen | `editor.rain_radar.fullscreen` |
| Exit full screen | `editor.rain_radar.exit_fullscreen` |
| Map provider | `editor.rain_radar.map_provider` |
| Esri is free and needs no key. Google, Mapbox and MapTiler use your own key. | `editor.rain_radar.map_provider_desc` |
| Map API key | `editor.rain_radar.map_api_key` |
| A Google Cloud API key with the Map Tiles API turned on. Google bills by map tile beyond its free monthly allowance. | `editor.rain_radar.map_api_key_google` |
| A Mapbox access token (starts with pk.) from account.mapbox.com. | `editor.rain_radar.map_api_key_mapbox` |
| A MapTiler API key from cloud.maptiler.com. | `editor.rain_radar.map_api_key_maptiler` |
| The key is saved in this dashboard, so anyone who can edit it can see the key. If the key is refused the map switches back to Esri. | `editor.rain_radar.map_api_key_note` |
| Enter your key for this provider. Until then the map uses Esri. | `editor.rain_radar.map_api_key_missing` |
| Rainbow.ai API key | `editor.rain_radar.rainbow_api_key` |
| From your Rainbow.ai developer account. Shows current rain and a 2-hour forecast. Rainbow.ai includes 30,000 map tiles a month at no cost and bills your account for more, so a map left on screen all day can cost money… | `editor.rain_radar.rainbow_api_key_desc` |
| Enter your key from developer.rainbow.ai. Until then the radar uses RainViewer. | `editor.rain_radar.rainbow_api_key_missing` |

</details>

<details>
<summary><strong>Train (editor)</strong> — 89 left</summary>

| English text | Key |
| --- | --- |
| Enable animations | `editor.train.animations` |
| Headlights, rolling track, and the imminent-departure pulse | `editor.train.animations_desc` |
| Route | `editor.train.appearance_section` |
| How the board is titled and laid out. | `editor.train.appearance_section_desc` |
| Thresholds | `editor.train.behaviour_section` |
| When a train counts as delayed and when the next one lights up. | `editor.train.behaviour_section_desc` |
| Style | `editor.train.board_style` |
| Modern follows your theme. LED board is a dark dot-matrix departure display. | `editor.train.board_style_desc` |
| Cancelled | `editor.train.cancelled_color` |
| Cancelled | `editor.train.cancelled_entity` |
| On when the next train is cancelled | `editor.train.cancelled_entity_desc` |
| Card background | `editor.train.card_bg` |
| Colors | `editor.train.colors_section` |
| Each train takes the color of its status. | `editor.train.colors_section_desc` |
| Add a departure sensor | `editor.train.config_needed` |
| Pick your train sensors or a template in the General tab | `editor.train.config_needed_desc` |
| Next departures | `editor.train.default_name` |
| Delay | `editor.train.delay_entity` |
| Minutes or seconds late; the unit is read from the sensor | `editor.train.delay_entity_desc` |
| Delayed from (minutes) | `editor.train.delay_threshold` |
| Shorter delays are still shown as on time | `editor.train.delay_threshold_desc` |
| Delayed | `editor.train.delayed_color` |
| Departed | `editor.train.departed` |
| Departing now | `editor.train.departing_now` |
| Departs in {n} min | `editor.train.departs_in` |
| Departs in {h}h {m}m | `editor.train.departs_in_hours` |
| Departure sensors | `editor.train.departure_entities` |
| One sensor per train, next train first. A sensor whose attributes carry a list of departures is expanded automatically. | `editor.train.departure_entities_desc` |
| Add a departure sensor | `editor.train.departure_entities_placeholder` |
| Display | `editor.train.display_section` |
| Choose what the board shows. | `editor.train.display_section_desc` |
| Icon override | `editor.train.icon` |
| Shown next to the countdown. Leave blank for the timer icon. | `editor.train.icon_desc` |
| Leaving soon (minutes) | `editor.train.imminent_minutes` |
| Within this window the next train pulses and its headlights come on | `editor.train.imminent_minutes_desc` |
| Deviations / info | `editor.train.info_entity` |
| Free-text sensor shown as a ticker under the board | `editor.train.info_entity_desc` |
| Layout | `editor.train.layout` |
| Compact | `editor.train.layout_compact` |
| Standard puts the route on the left and the trains on the right; compact is a single row. | `editor.train.layout_desc` |
| Standard | `editor.train.layout_standard` |
| LED text color | `editor.train.led_color` |
| Reading timetable | `editor.train.loading` |
| Waiting for the template result | `editor.train.loading_desc` |
| Trains to show | `editor.train.max_departures` |
| The next train is always the largest | `editor.train.max_departures_desc` |
| Route name | `editor.train.name` |
| For example "Triangeln – Trelleborg C". Leave blank to use the first sensor name. | `editor.train.name_desc` |
| No departures right now | `editor.train.no_departures` |
| On time | `editor.train.on_time_color` |
| Platform {p} | `editor.train.platform` |
| The Train module turns your departure sensors into an animated departure board: the next trains as status-colored icons, a live countdown, delays and cancellations, and an LED dot-matrix style. | `editor.train.pro_description` |
| Next Train Realtime | `editor.train.realtime_section` |
| All optional. Some integrations publish the next train's realtime state as separate sensors (Trafikverket, for example). Link them here and they color the first train. | `editor.train.realtime_section_desc` |
| Secondary text color | `editor.train.secondary_text_color` |
| Show countdown | `editor.train.show_countdown` |
| "Departs in 23 min" for the next train that is running | `editor.train.show_countdown_desc` |
| Show details | `editor.train.show_details` |
| Line, destination, and platform when the sensor provides them | `editor.train.show_details_desc` |
| Show deviations ticker | `editor.train.show_info` |
| Show route name | `editor.train.show_name` |
| Show status | `editor.train.show_status` |
| On time, delayed by, or cancelled | `editor.train.show_status_desc` |
| Show departure times | `editor.train.show_times` |
| Show track | `editor.train.show_track` |
| Railway track under the trains | `editor.train.show_track_desc` |
| Source | `editor.train.source` |
| Entities reads departure sensors directly. Template lets you shape the departures yourself. | `editor.train.source_desc` |
| Entities | `editor.train.source_entities` |
| Departures | `editor.train.source_section` |
| Pick the sensors that hold your departures, or write a template that returns them as JSON. | `editor.train.source_section_desc` |
| Template | `editor.train.source_template` |
| Cancelled | `editor.train.state_cancelled` |
| Delayed | `editor.train.state_delayed` |
| Delayed {n} min | `editor.train.state_delayed_by` |
| On time | `editor.train.state_on_time` |
| Scheduled | `editor.train.state_scheduled` |
| Departure state | `editor.train.status_entity` |
| Sensor reporting on time, delayed, or cancelled | `editor.train.status_entity_desc` |
| LED board | `editor.train.style_led` |
| Modern | `editor.train.style_modern` |
| Departures template | `editor.train.template` |
| Template cheatsheet | `editor.train.template_cheatsheet` |
| Return a JSON array, next train first. Each item may have time, expected, delay (minutes), status (on_time / delayed / cancelled), destination, line, platform, note, and color. | `editor.train.template_desc` |
| Template must return JSON | `editor.train.template_error` |
| Return an array of departures, for example [{"time": "11:11", "status": "on_time"}] | `editor.train.template_error_desc` |
| Text color | `editor.train.text_color` |
| Auto | `editor.train.time_auto` |
| Time format | `editor.train.time_format` |

</details>

<details>
<summary><strong>Icon (editor)</strong> — 88 left</summary>

| English text | Key |
| --- | --- |
| Show Entity Picture | `editor.icon.icon_section.show_entity_picture` |
| When enabled, entity_picture replaces the configured icon when available. | `editor.icon.icon_section.show_entity_picture_desc` |
| Active Attribute | `editor.icon.active_attribute` |
| Entity attribute to check for active state (e.g., "condition" for weather) | `editor.icon.active_attribute_desc` |
| Active Background Padding | `editor.icon.active_icon_background_padding` |
| Active Icon Size | `editor.icon.active_icon_size` |
| Active Name Size | `editor.icon.active_name_size` |
| Active State Size | `editor.icon.active_state_size` |
| Add Icon | `editor.icon.add_icon` |
| Animation | `editor.icon.animation` |
| Continuous animation for the icon | `editor.icon.animation_desc` |
| Select entity attributes to use instead of the main entity state for determining active/inactive conditions | `editor.icon.attributes_section.desc` |
| ATTRIBUTES | `editor.icon.attributes_section.title` |
| Background Color | `editor.icon.background_color` |
| Color of the background shape | `editor.icon.background_color_desc` |
| Background Padding | `editor.icon.background_padding` |
| Padding between icon and background when active | `editor.icon.background_padding_active` |
| Distance from the icon to the background edge | `editor.icon.background_padding_desc` |
| Padding between icon and background when inactive | `editor.icon.background_padding_inactive` |
| Background Shape | `editor.icon.background_shape` |
| Shape behind the icon | `editor.icon.background_shape_desc` |
| Display Attribute | `editor.icon.display_attribute` |
| Select an attribute to display instead of the entity state. For separate active/inactive attributes, use the options below. | `editor.icon.display_attribute_desc` |
| Icon | `editor.icon.icon` |
| Icon Color | `editor.icon.icon_color` |
| Color of the icon | `editor.icon.icon_color_desc` |
| Select an MDI icon | `editor.icon.icon_desc` |
| Choose between an entity-connected icon or a static standalone icon | `editor.icon.icon_mode.desc` |
| Entity-Based | `editor.icon.icon_mode.entity` |
| Static | `editor.icon.icon_mode.static` |
| ICON MODE | `editor.icon.icon_mode.title` |
| Icon {number} | `editor.icon.icon_row_title` |
| Icon Size | `editor.icon.icon_size` |
| Size of the icon in pixels | `editor.icon.icon_size_desc` |
| Inactive Attribute | `editor.icon.inactive_attribute` |
| Entity attribute to check for inactive state (e.g., "condition" for weather) | `editor.icon.inactive_attribute_desc` |
| Inactive Background Padding | `editor.icon.inactive_icon_background_padding` |
| Inactive Icon Size | `editor.icon.inactive_icon_size` |
| Inactive Name Size | `editor.icon.inactive_name_size` |
| Inactive State Size | `editor.icon.inactive_state_size` |
| Name | `editor.icon.internal_name` |
| Editor-only label to keep icons organized. Never shown on the card. | `editor.icon.internal_name_desc` |
| Center | `editor.icon.layout.align_center` |
| Left | `editor.icon.layout.align_left` |
| Right | `editor.icon.layout.align_right` |
| Space Around | `editor.icon.layout.align_space_around` |
| Space Between | `editor.icon.layout.align_space_between` |
| Alignment | `editor.icon.layout.alignment` |
| Horizontal alignment of the icon grid | `editor.icon.layout.alignment_desc` |
| Allow Wrapping | `editor.icon.layout.allow_wrap` |
| Allow icons to wrap onto new rows when they exceed the column count | `editor.icon.layout.allow_wrap_desc` |
| Columns | `editor.icon.layout.columns` |
| Number of icons per row | `editor.icon.layout.columns_desc` |
| Content Distribution | `editor.icon.layout.content_distribution` |
| Control how the icon and text are distributed inside each item | `editor.icon.layout.content_distribution_desc` |
| Control how icons are arranged in the grid. | `editor.icon.layout.desc` |
| Normal | `editor.icon.layout.dist_normal` |
| Space Around | `editor.icon.layout.dist_space_around` |
| Space Between | `editor.icon.layout.dist_space_between` |
| Space Evenly | `editor.icon.layout.dist_space_evenly` |
| Gap | `editor.icon.layout.gap` |
| Spacing between icons | `editor.icon.layout.gap_desc` |
| Icon Position | `editor.icon.layout.icon_position` |
| Position the icon relative to the name and state (left, top, right, or bottom) | `editor.icon.layout.icon_position_desc` |
| Text Alignment | `editor.icon.layout.name_alignment` |
| Align the name and state text within the item | `editor.icon.layout.name_alignment_desc` |
| Overall Alignment | `editor.icon.layout.overall_alignment` |
| Align each item within its grid cell | `editor.icon.layout.overall_alignment_desc` |
| Bottom | `editor.icon.layout.pos_bottom` |
| Left | `editor.icon.layout.pos_left` |
| Right | `editor.icon.layout.pos_right` |
| Top | `editor.icon.layout.pos_top` |
| Center | `editor.icon.layout.text_center` |
| End | `editor.icon.layout.text_end` |
| Start | `editor.icon.layout.text_start` |
| LAYOUT | `editor.icon.layout.title` |
| Remove Icon | `editor.icon.remove_icon` |
| Circle | `editor.icon.shape_circle` |
| None | `editor.icon.shape_none` |
| Rounded Square | `editor.icon.shape_rounded` |
| Square | `editor.icon.shape_square` |
| Configure the appearance of this static icon | `editor.icon.static_icon_settings.desc` |
| ICON SETTINGS | `editor.icon.static_icon_settings.title` |
| Template Cheatsheet | `editor.icon.template_cheatsheet` |
| Use Jinja2 templates to control icon and color dynamically. Return simple string for icon-only, or JSON object for multiple properties. Uses entity context variables (entity, state, name, attributes) for seamless enti… | `editor.icon.unified_template_section.desc` |
| Template Mode | `editor.icon.unified_template_section.title` |
| Use State Color | `editor.icon.use_state_color_active` |
| Use the entity state color (RGB attributes) for active icon color | `editor.icon.use_state_color_active_desc` |

</details>

<details>
<summary><strong>Accordion (editor)</strong> — 84 left</summary>

| English text | Key |
| --- | --- |
| No modules added. Add modules to this accordion in the Layout tab. | `editor.accordion.preview.no_modules` |
| Icon Side | `editor.accordion.alignment.icon_side` |
| Alignment Mode | `editor.accordion.alignment.mode` |
| Choose how the title and icon are positioned in the header. | `editor.accordion.alignment.section_desc` |
| Header Alignment | `editor.accordion.alignment.section_title` |
| Background Color | `editor.accordion.design.container_bg_color` |
| Border Color | `editor.accordion.design.container_border_color` |
| Border Radius | `editor.accordion.design.container_border_radius` |
| Border Width | `editor.accordion.design.container_border_width` |
| Customize the outer wrapper styling of the accordion. | `editor.accordion.design.container_desc` |
| Box Shadow | `editor.accordion.design.container_shadow` |
| CSS box-shadow value (e.g., 0 2px 8px rgba(0,0,0,0.1)) | `editor.accordion.design.container_shadow_desc` |
| Container Customization | `editor.accordion.design.container_title` |
| Background Color | `editor.accordion.design.content_bg_color` |
| Border Color | `editor.accordion.design.content_border_color` |
| Border Width | `editor.accordion.design.content_border_width` |
| Customize the expanded content area appearance. | `editor.accordion.design.content_desc` |
| Content Padding | `editor.accordion.design.content_padding` |
| Padding around the content area (in pixels). | `editor.accordion.design.content_padding_desc` |
| Content Customization | `editor.accordion.design.content_title` |
| General Module Design | `editor.accordion.design.general_title` |
| Background Color | `editor.accordion.design.header_bg_color` |
| Border Bottom Color | `editor.accordion.design.header_border_color` |
| Border Width | `editor.accordion.design.header_border_width` |
| Customize the clickable header bar appearance. | `editor.accordion.design.header_desc` |
| Font Size | `editor.accordion.design.header_font_size` |
| Font Weight | `editor.accordion.design.header_font_weight` |
| Hover Background Color | `editor.accordion.design.header_hover_color` |
| Header Padding | `editor.accordion.design.header_padding` |
| Padding inside the header (in pixels). | `editor.accordion.design.header_padding_desc` |
| Text Color | `editor.accordion.design.header_text_color` |
| Header Customization | `editor.accordion.design.header_title` |
| Icon Color | `editor.accordion.design.icon_color` |
| Icon Size | `editor.accordion.design.icon_size` |
| Icon | `editor.accordion.icon.custom` |
| Select the icon to display as the control indicator. | `editor.accordion.icon.custom_desc` |
| Configure the control icon displayed in the accordion header (defaults to chevron-down). | `editor.accordion.icon.section_desc` |
| Control Icon | `editor.accordion.icon.section_title` |
| Add Condition | `editor.accordion.open_logic.add_condition` |
| Accordion will always remain open. Users can still manually close it, but it will reopen automatically. | `editor.accordion.open_logic.always_note` |
| Attribute | `editor.accordion.open_logic.attribute` |
| Condition Type | `editor.accordion.open_logic.condition_type` |
| Conditions | `editor.accordion.open_logic.conditions` |
| Custom Name | `editor.accordion.open_logic.custom_name` |
| Optional: Give this condition a custom name | `editor.accordion.open_logic.custom_name_desc` |
| Entity | `editor.accordion.open_logic.entity` |
| Accordion state is controlled manually by user clicks. Set Default State above to choose initial state. | `editor.accordion.open_logic.manual_note` |
| Always Open | `editor.accordion.open_logic.mode_always` |
| Open if ANY condition is met | `editor.accordion.open_logic.mode_any` |
| Choose how the accordion state is controlled. | `editor.accordion.open_logic.mode_desc` |
| Open if EVERY condition is met | `editor.accordion.open_logic.mode_every` |
| Manual | `editor.accordion.open_logic.mode_manual` |
| Accordion State Control | `editor.accordion.open_logic.mode_title` |
| No conditions added yet. Click "Add Condition" to get started. | `editor.accordion.open_logic.no_conditions` |
| Operator | `editor.accordion.open_logic.operator` |
| Control when this accordion automatically opens or closes based on conditions. | `editor.accordion.open_logic.section_desc` |
| Open/Close Logic | `editor.accordion.open_logic.section_title` |
| Template | `editor.accordion.open_logic.template` |
| Jinja2 template that should evaluate to true/false to open the accordion. | `editor.accordion.open_logic.template_desc` |
| From | `editor.accordion.open_logic.time_from` |
| To | `editor.accordion.open_logic.time_to` |
| Entity Attribute | `editor.accordion.open_logic.type_entity_attribute` |
| Entity State | `editor.accordion.open_logic.type_entity_state` |
| Template | `editor.accordion.open_logic.type_template` |
| Time Range | `editor.accordion.open_logic.type_time` |
| Value | `editor.accordion.open_logic.value` |
| Open by Default | `editor.accordion.state.default_open` |
| When enabled, the accordion will be expanded when the card initially loads. | `editor.accordion.state.default_open_desc` |
| Configure whether this accordion starts open or closed when the card loads. | `editor.accordion.state.section_desc` |
| Default State | `editor.accordion.state.section_title` |
| Custom Title Configuration | `editor.accordion.title.custom_config` |
| Title Text | `editor.accordion.title.custom_text` |
| Enter the custom text to display in the accordion header. | `editor.accordion.title.custom_text_desc` |
| Title Entity | `editor.accordion.title.entity` |
| Entity Title Configuration | `editor.accordion.title.entity_config` |
| Select an entity whose state will be used as the accordion header title. | `editor.accordion.title.entity_desc` |
| Title Mode | `editor.accordion.title.mode` |
| Choose whether to use custom text or entity state as title. | `editor.accordion.title.mode_desc` |
| Configure the accordion header title source and content. | `editor.accordion.title.section_desc` |
| Title Configuration | `editor.accordion.title.section_title` |
| Show Entity Name | `editor.accordion.title.show_entity_name` |
| Display the entity friendly name before the state value. | `editor.accordion.title.show_entity_name_desc` |
| Display Options | `editor.accordion.title.show_name` |
| Choose whether to show the entity name along with the state. | `editor.accordion.title.show_name_desc` |

</details>

<details>
<summary><strong>Boiler (editor)</strong> — 79 left</summary>

| English text | Key |
| --- | --- |
| Enable animations | `editor.boiler.animations` |
| Flame flicker, fan spin, and pipe flow | `editor.boiler.animations_desc` |
| Card background | `editor.boiler.card_bg` |
| Cold color | `editor.boiler.cold_color` |
| Cold below | `editor.boiler.cold_temp` |
| At or below this temperature the cold color is used | `editor.boiler.cold_temp_desc` |
| Select a boiler | `editor.boiler.config_needed` |
| Choose an entity in the General tab | `editor.boiler.config_needed_desc` |
| Decrease target | `editor.boiler.decrease` |
| Hot water (DHW) active | `editor.boiler.dhw` |
| Binary sensor that is on while heating tap water | `editor.boiler.dhw_desc` |
| Display | `editor.boiler.display_section` |
| Choose which readouts and controls to show. | `editor.boiler.display_section_desc` |
| Entity | `editor.boiler.entity` |
| water_heater, climate, or temperature sensor | `editor.boiler.entity_desc` |
| Boiler | `editor.boiler.entity_section` |
| Pick the main boiler entity. A water_heater or climate entity provides temperature, target, and modes automatically; a plain temperature sensor works too. | `editor.boiler.entity_section_desc` |
| Flame / burner active | `editor.boiler.flame` |
| Binary sensor that is on while the burner fires | `editor.boiler.flame_desc` |
| Central heating active | `editor.boiler.heating` |
| Binary sensor that is on while heating circulates | `editor.boiler.heating_desc` |
| Hot color | `editor.boiler.hot_color` |
| Hot above | `editor.boiler.hot_temp` |
| At or above this temperature the hot color is used | `editor.boiler.hot_temp_desc` |
| Icon override | `editor.boiler.icon` |
| Shown in the header. Leave blank for the boiler icon. | `editor.boiler.icon_desc` |
| Increase target | `editor.boiler.increase` |
| Layout | `editor.boiler.layout` |
| Compact | `editor.boiler.layout_compact` |
| Standard shows the animated boiler graphic; compact is a single row. | `editor.boiler.layout_desc` |
| Standard | `editor.boiler.layout_standard` |
| Maximum healthy pressure | `editor.boiler.max_pressure` |
| Minimum healthy pressure | `editor.boiler.min_pressure` |
| Burner modulation (%) | `editor.boiler.modulation` |
| Drives the flame size in the graphic | `editor.boiler.modulation_desc` |
| Modulation | `editor.boiler.modulation_label` |
| Name override | `editor.boiler.name` |
| Leave blank to use the entity friendly name. | `editor.boiler.name_desc` |
| Power switch | `editor.boiler.power_switch` |
| Switch for the power button. Falls back to turning the main entity on/off. | `editor.boiler.power_switch_desc` |
| Water pressure | `editor.boiler.pressure` |
| System pressure in bar or psi | `editor.boiler.pressure_desc` |
| Pressure | `editor.boiler.pressure_label` |
| Pressure Range | `editor.boiler.pressure_section` |
| Outside this healthy range the pressure readout turns to the warning color. | `editor.boiler.pressure_section_desc` |
| The Boiler module shows your boiler with temperature-driven colors, live flame, fan and pipe animations, pressure and modulation readouts, and target temperature control. | `editor.boiler.pro_description` |
| Return | `editor.boiler.return_label` |
| Return temperature | `editor.boiler.return_temp` |
| Water temperature returning to the boiler | `editor.boiler.return_temp_desc` |
| Boiler Sensors | `editor.boiler.sensors_section` |
| All optional. Link the individual boiler sensors your integration exposes (EMS-ESP, OpenTherm Gateway, SmartThings, ...). | `editor.boiler.sensors_section_desc` |
| Show boiler graphic | `editor.boiler.show_graphic` |
| Animated boiler drawing (standard layout) | `editor.boiler.show_graphic_desc` |
| Show modes | `editor.boiler.show_modes` |
| Operation mode chips when the entity supports them | `editor.boiler.show_modes_desc` |
| Show modulation | `editor.boiler.show_modulation` |
| Show name | `editor.boiler.show_name` |
| Show power button | `editor.boiler.show_power` |
| Show pressure | `editor.boiler.show_pressure` |
| Show return temperature | `editor.boiler.show_return_temp` |
| Show status label | `editor.boiler.show_status` |
| Show target control | `editor.boiler.show_target` |
| Plus/minus stepper for the setpoint | `editor.boiler.show_target_desc` |
| Show water temperature | `editor.boiler.show_water_temp` |
| Hot water | `editor.boiler.state_dhw` |
| Heating | `editor.boiler.state_heating` |
| Standby | `editor.boiler.state_idle` |
| Off | `editor.boiler.state_off` |
| Unavailable | `editor.boiler.state_unavailable` |
| Target temperature | `editor.boiler.target` |
| Number helper for the setpoint. Falls back to the main entity target. | `editor.boiler.target_desc` |
| Target | `editor.boiler.target_label` |
| Temperature Colors | `editor.boiler.temp_colors_section` |
| The water temperature reading and boiler glow blend from cold to hot between these thresholds. | `editor.boiler.temp_colors_section_desc` |
| Text color | `editor.boiler.text_color` |
| Toggle power | `editor.boiler.toggle_power` |
| Warm color | `editor.boiler.warm_color` |
| Water / flow temperature | `editor.boiler.water_temp` |
| Supply water temperature. Falls back to the main entity current temperature. | `editor.boiler.water_temp_desc` |

</details>

<details>
<summary><strong>Navigation (editor)</strong> — 71 left</summary>

| English text | Key |
| --- | --- |
| Add Path | `editor.navigation.add_path` |
| Add Stack | `editor.navigation.add_stack` |
| Center | `editor.navigation.align_center` |
| End | `editor.navigation.align_end` |
| Space Around | `editor.navigation.align_space_around` |
| Space Between | `editor.navigation.align_space_between` |
| Start | `editor.navigation.align_start` |
| Choose floating (centered with margins) or docked (edge-to-edge). | `editor.navigation.desktop_mode_desc` |
| Desktop Offset | `editor.navigation.desktop_offset` |
| Where the navbar appears on desktop. | `editor.navigation.desktop_position_desc` |
| Control label visibility on desktop. | `editor.navigation.desktop_show_labels_desc` |
| Dock Color | `editor.navigation.dock_color` |
| Custom accent color for the dock background. For glass styles this tints the glass. | `editor.navigation.dock_color_desc` |
| Changes preview live in the navbar below. Close this editor to interact with the navbar. | `editor.navigation.edit_mode_banner` |
| Only one global navbar can be active at a time. If you have multiple navbars set to "All views", only the first registered one will be displayed. Use "Current view only" for navbars on specific pages. | `editor.navigation.global_navbar_warning` |
| Double Tap | `editor.navigation.haptics_double_tap` |
| Trigger haptic on double tap. | `editor.navigation.haptics_double_tap_desc` |
| Enable Haptics | `editor.navigation.haptics_enable` |
| Master toggle for all navbar haptic feedback. | `editor.navigation.haptics_enable_desc` |
| Hold Action | `editor.navigation.haptics_hold` |
| Trigger haptic on hold. | `editor.navigation.haptics_hold_desc` |
| Tap Action | `editor.navigation.haptics_tap` |
| Trigger haptic on tap. | `editor.navigation.haptics_tap_desc` |
| URL Navigation | `editor.navigation.haptics_url` |
| Trigger haptic when navigating to a URL. | `editor.navigation.haptics_url_desc` |
| Icon Color | `editor.navigation.icon_color` |
| Custom color for navbar icons. Overrides the default icon color from the style preset. | `editor.navigation.icon_color_desc` |
| Icon Spacing | `editor.navigation.icon_spacing` |
| Gap between icons in the dock (px). | `editor.navigation.icon_spacing_desc` |
| Item Alignment | `editor.navigation.item_alignment` |
| How items are distributed within the dock. | `editor.navigation.item_alignment_desc` |
| Hidden | `editor.navigation.labels_hidden` |
| Icons & Labels | `editor.navigation.labels_icons` |
| Text only (no icons) | `editor.navigation.labels_text_only` |
| Media Player | `editor.navigation.media_player` |
| Click to select entity (required) | `editor.navigation.media_player_entity_required` |
| Media Player Icon | `editor.navigation.media_player_icon` |
| Show a media player icon in the navbar | `editor.navigation.media_player_icon_desc` |
| Min Width | `editor.navigation.min_width` |
| Viewport width (px) that switches to desktop mode. | `editor.navigation.min_width_desc` |
| Choose docked (default) or floating (desktop-like). | `editor.navigation.mobile_mode_desc` |
| Mobile Offset | `editor.navigation.mobile_offset` |
| Where the navbar appears on mobile. | `editor.navigation.mobile_position_desc` |
| Control label visibility on mobile. | `editor.navigation.mobile_show_labels_desc` |
| Mode | `editor.navigation.mode` |
| Docked | `editor.navigation.mode_docked` |
| Floating | `editor.navigation.mode_floating` |
| Show Navigation On | `editor.navigation.nav_scope` |
| Control where this navbar appears. | `editor.navigation.nav_scope_desc` |
| Note: | `editor.navigation.note_label` |
| Distance from screen edge (px). Pushes the dock away from the edge. | `editor.navigation.offset_desc` |
| Position | `editor.navigation.position` |
| Bottom | `editor.navigation.position_bottom` |
| Left | `editor.navigation.position_left` |
| Right | `editor.navigation.position_right` |
| Top | `editor.navigation.position_top` |
| Navbar appears on every view in your dashboard. | `editor.navigation.scope_all_info` |
| All views: | `editor.navigation.scope_all_label` |
| All views (global) | `editor.navigation.scope_all_views` |
| Navbar only appears on the view where this card is placed. | `editor.navigation.scope_current_info` |
| Current view: | `editor.navigation.scope_current_label` |
| Current view only | `editor.navigation.scope_current_view` |
| NAVIGATION ITEMS | `editor.navigation.section_items` |
| Configure and reorder items that appear in your navbar. Drag to reorder. Drag paths onto a stack to add them as children. | `editor.navigation.section_items_desc` |
| SPECIAL ITEMS | `editor.navigation.section_special` |
| Enable special navbar items. When enabled, they appear in the items list above for reordering. | `editor.navigation.section_special_desc` |
| NAVBAR STYLE | `editor.navigation.section_style` |
| VISIBILITY | `editor.navigation.section_visibility` |
| Show Labels | `editor.navigation.show_labels` |
| Visual Preset | `editor.navigation.visual_preset` |
| Choose a visual style preset for your navbar. | `editor.navigation.visual_preset_desc` |

</details>

<details>
<summary><strong>Bar (editor)</strong> — 68 left</summary>

| English text | Key |
| --- | --- |
| Choose how the bar percentage is calculated | `editor.bar.percentage_type.desc` |
| Current Attribute (Optional) | `editor.bar.range_config.current_attribute` |
| If the value is in an attribute, enter the attribute name here. | `editor.bar.range_config.current_attribute_desc` |
| Optionally show a marker indicating the current/average value within the range. | `editor.bar.range_config.current_marker_desc` |
| Current Value Marker (Optional) | `editor.bar.range_config.current_marker_title` |
| Override auto-detected range with numbers. For dynamic min/max or labels, enable the unified template (value_min, value_max, left_label, right_label). | `editor.bar.range.desc` |
| Override the visible range. Enter values in the same unit as your entities (e.g. km). Leave blank to auto-detect from the Total Entity. | `editor.bar.range.desc_difference` |
| Optional fallback entity for text/labels. Difference mode uses Current and Total entities for bar calculation. | `editor.bar.entity.fallback_desc` |
| Fallback Entity (optional) | `editor.bar.entity.fallback_title` |
| Glass Blur | `editor.bar.appearance.glass_blur` |
| Adjust the blur intensity of the glass effect. | `editor.bar.appearance.glass_blur_desc` |
| Minimal | `editor.bar.appearance.style_minimal` |
| Follow Fill | `editor.bar.text_display.follow_fill` |
| Text Formatting | `editor.bar.text_display.text_formatting` |
| Apply formatting styles to the percentage text. | `editor.bar.text_display.text_formatting_desc` |
| Animation Direction | `editor.bar.animation.direction` |
| Direction Attribute (Optional) | `editor.bar.animation.direction_attribute` |
| Read this attribute instead of entity state when deriving direction. | `editor.bar.animation.direction_attribute_desc` |
| Choose a fixed direction, or derive direction from a sensor value. | `editor.bar.animation.direction_desc` |
| Direction Sensor | `editor.bar.animation.direction_entity` |
| Negative values reverse the animation. Positive values keep normal direction. | `editor.bar.animation.direction_entity_desc` |
| Normal | `editor.bar.animation.direction_modes.normal` |
| Reverse | `editor.bar.animation.direction_modes.reverse` |
| From Sensor | `editor.bar.animation.direction_modes.sensor` |
| Base Speed | `editor.bar.animation.speed` |
| Speed Attribute (Optional) | `editor.bar.animation.speed_attribute` |
| Read this attribute instead of entity state when deriving speed. | `editor.bar.animation.speed_attribute_desc` |
| 1 = default speed. Higher values animate faster. | `editor.bar.animation.speed_desc` |
| Speed Sensor | `editor.bar.animation.speed_entity` |
| Entity whose numeric value controls animation speed. | `editor.bar.animation.speed_entity_desc` |
| Animation Speed Source | `editor.bar.animation.speed_mode` |
| Use a fixed speed value, or derive speed from a sensor. | `editor.bar.animation.speed_mode_desc` |
| Fixed | `editor.bar.animation.speed_modes.fixed` |
| From Sensor | `editor.bar.animation.speed_modes.sensor` |
| Sensor Multiplier | `editor.bar.animation.speed_multiplier` |
| Scales sensor values before converting to animation speed. | `editor.bar.animation.speed_multiplier_desc` |
| Difference entities not found | `editor.bar.error_difference_not_found` |
| Configure Difference | `editor.bar.error_no_difference` |
| Set current and total entities in the Difference configuration. | `editor.bar.error_no_difference_desc` |
| Clamp Edge Labels Inward | `editor.bar.scale.clamp_edge_labels` |
| Slightly nudge the first and last labels inward to reduce clipping on tight layouts. | `editor.bar.scale.clamp_edge_labels_desc` |
| Custom Tick Labels | `editor.bar.scale.custom_labels` |
| Optional comma-separated labels matching each custom tick (e.g. Reserve,1/4,1/2,3/4,Full). Leave a slot empty to show that tick’s numeric value, or enter "-" (a single dash) to hide that tick’s label while keeping its… | `editor.bar.scale.custom_labels_desc` |
| Tip: use "-" in any slot to hide that tick’s label. Accepted hide tokens: -, _, none, {none}, hide. | `editor.bar.scale.custom_labels_hint` |
| Custom Tick Positions | `editor.bar.scale.custom_ticks` |
| Comma-separated values in your entity's unit. Overrides the number of divisions (e.g. 10,20,30,40). Leave blank to use evenly spaced divisions. | `editor.bar.scale.custom_ticks_desc` |
| Add tick marks and labels along the bar to show the scale. Useful for visualizing ranges like temperature or time. | `editor.bar.scale.desc` |
| Number of Divisions | `editor.bar.scale.divisions` |
| How many segments to divide the scale into (e.g., 4 = marks at 0%, 25%, 50%, 75%, 100%). | `editor.bar.scale.divisions_desc` |
| Enable the toggle above to configure scale settings | `editor.bar.scale.enable_toggle` |
| Label Color | `editor.bar.scale.label_color` |
| Label Size | `editor.bar.scale.label_size` |
| Abbreviate Labels on Mobile | `editor.bar.scale.mobile_abbreviate_labels` |
| Shorten numeric labels on mobile (e.g. 1200 -> 1.2k, 700 km -> 700). | `editor.bar.scale.mobile_abbreviate_labels_desc` |
| Mobile Breakpoint | `editor.bar.scale.mobile_breakpoint` |
| Apply mobile label options when viewport width is at or below this value. | `editor.bar.scale.mobile_breakpoint_desc` |
| Enable Mobile Label Options | `editor.bar.scale.mobile_options_enabled` |
| Apply mobile-specific label behavior below the configured viewport width. | `editor.bar.scale.mobile_options_enabled_desc` |
| Reduce Label Density on Mobile | `editor.bar.scale.mobile_reduce_density` |
| Hide every second label on mobile to prevent overlap while keeping all ticks. | `editor.bar.scale.mobile_reduce_density_desc` |
| Scale Position | `editor.bar.scale.position` |
| Above | `editor.bar.scale.position_above` |
| Below | `editor.bar.scale.position_below` |
| Position the scale above or below the bar. | `editor.bar.scale.position_desc` |
| Show Labels | `editor.bar.scale.show_labels` |
| Display numeric values at each tick mark. | `editor.bar.scale.show_labels_desc` |
| Tick Color | `editor.bar.scale.tick_color` |
| Scale / Tick Marks | `editor.bar.scale.title` |

</details>

<details>
<summary><strong>Solar analytics (editor)</strong> — 46 left</summary>

| English text | Key |
| --- | --- |
| Battery | `editor.solar_analytics.battery` |
| Battery SoC (%) | `editor.solar_analytics.battery_entity` |
| State of charge percentage | `editor.solar_analytics.battery_entity_desc` |
| Select a solar sensor | `editor.solar_analytics.config_needed` |
| Choose a solar power sensor in the General tab | `editor.solar_analytics.config_needed_desc` |
| Choose what to show. | `editor.solar_analytics.display_desc` |
| Display | `editor.solar_analytics.display_section` |
| Sensors accumulating today's totals in kWh (optional). | `editor.solar_analytics.energy_desc` |
| Today's Energy Sensors | `editor.solar_analytics.energy_section` |
| Exported | `editor.solar_analytics.exported` |
| Exporting | `editor.solar_analytics.exporting` |
| Grid power (W/kW) | `editor.solar_analytics.grid_entity` |
| Positive = importing, negative = exporting | `editor.solar_analytics.grid_entity_desc` |
| Grid export today (kWh) | `editor.solar_analytics.grid_export_entity` |
| Energy sent to grid today | `editor.solar_analytics.grid_export_entity_desc` |
| Grid import today (kWh) | `editor.solar_analytics.grid_import_entity` |
| Energy pulled from grid today | `editor.solar_analytics.grid_import_entity_desc` |
| Solar Overview | `editor.solar_analytics.header` |
| Home consumption (W/kW) | `editor.solar_analytics.home_entity` |
| Total home load | `editor.solar_analytics.home_entity_desc` |
| Imported | `editor.solar_analytics.imported` |
| Importing | `editor.solar_analytics.importing` |
| Layout | `editor.solar_analytics.layout` |
| Compact | `editor.solar_analytics.layout_compact` |
| Full includes all gauges; compact shows a single row | `editor.solar_analytics.layout_desc` |
| Full | `editor.solar_analytics.layout_full` |
| Layout | `editor.solar_analytics.layout_section` |
| Sensors reporting current power in W or kW. | `editor.solar_analytics.live_desc` |
| Live Power Sensors | `editor.solar_analytics.live_section` |
| Produced | `editor.solar_analytics.produced` |
| Self | `editor.solar_analytics.self` |
| Self-Sufficiency | `editor.solar_analytics.self_sufficiency` |
| Show battery | `editor.solar_analytics.show_battery` |
| Battery SoC ring and value | `editor.solar_analytics.show_battery_desc` |
| Show grid | `editor.solar_analytics.show_grid` |
| Grid import/export power | `editor.solar_analytics.show_grid_desc` |
| Show self-sufficiency | `editor.solar_analytics.show_self_sufficiency` |
| Percentage of home load met by solar | `editor.solar_analytics.show_self_sufficiency_desc` |
| Show today's totals | `editor.solar_analytics.show_today_totals` |
| Daily kWh summary row | `editor.solar_analytics.show_today_totals_desc` |
| Solar | `editor.solar_analytics.solar` |
| Solar today (kWh) | `editor.solar_analytics.solar_energy_entity` |
| Daily solar production | `editor.solar_analytics.solar_energy_entity_desc` |
| Solar power (W/kW) | `editor.solar_analytics.solar_entity` |
| Current solar panel output | `editor.solar_analytics.solar_entity_desc` |
| Today | `editor.solar_analytics.today` |

</details>

<details>
<summary><strong>Badge (editor)</strong> — 45 left</summary>

| English text | Key |
| --- | --- |
| ANIMATION | `editor.badge.animation_title` |
| Badge Size | `editor.badge.badge_size` |
| Overall size of the badge in pixels | `editor.badge.badge_size_desc` |
| Gradient | `editor.badge.bg_gradient` |
| Solid Color | `editor.badge.bg_solid` |
| Transparent | `editor.badge.bg_transparent` |
| Clockwise | `editor.badge.clockwise` |
| Color 1 (Teal) | `editor.badge.color_1` |
| Color 2 (Blue-Teal) | `editor.badge.color_2` |
| Color 3 (Purple) | `editor.badge.color_3` |
| Color 4 (Indigo) | `editor.badge.color_4` |
| Color Shift Animation | `editor.badge.color_shift` |
| Animate gradient colors shifting around the ring | `editor.badge.color_shift_desc` |
| Color Shift Speed | `editor.badge.color_shift_speed` |
| Time in seconds for full color cycle | `editor.badge.color_shift_speed_desc` |
| Set the gradient colors that shift around the badge ring. The colors will smoothly transition creating a beautiful animated effect. | `editor.badge.colors_desc` |
| GRADIENT COLORS | `editor.badge.colors_title` |
| Counter-Clockwise | `editor.badge.counter_clockwise` |
| Glow Effect | `editor.badge.glow` |
| Add a soft glow around the badge | `editor.badge.glow_desc` |
| Glow Intensity | `editor.badge.glow_intensity` |
| Icon Color | `editor.badge.icon_color` |
| Inner Background Type | `editor.badge.inner_bg` |
| Background style for the inner circle | `editor.badge.inner_bg_desc` |
| Inner Background Color | `editor.badge.inner_color` |
| Choose what to display in the center of the badge. | `editor.badge.inner_content_desc` |
| INNER CONTENT | `editor.badge.inner_content_title` |
| Icon | `editor.badge.inner_icon` |
| Image URL | `editor.badge.inner_image` |
| Enter a URL or local path to an image | `editor.badge.inner_image_desc` |
| Inner Badge Ratio | `editor.badge.inner_ratio` |
| Size of inner circle relative to outer (0.4 - 0.8) | `editor.badge.inner_ratio_desc` |
| Text | `editor.badge.inner_text` |
| Content Type | `editor.badge.inner_type` |
| Pulse Effect | `editor.badge.pulse` |
| Add a subtle pulsing animation | `editor.badge.pulse_desc` |
| Pulse Speed | `editor.badge.pulse_speed` |
| Rotation Direction | `editor.badge.rotation_direction` |
| Rotation Speed | `editor.badge.rotation_speed` |
| Time in seconds for one full rotation (lower = faster) | `editor.badge.rotation_speed_desc` |
| SIZE & LAYOUT | `editor.badge.size_title` |
| Text Color | `editor.badge.text_color` |
| Icon | `editor.badge.type_icon` |
| Image | `editor.badge.type_image` |
| Text | `editor.badge.type_text` |

</details>

<details>
<summary><strong>Energy display (editor)</strong> — 44 left</summary>

| English text | Key |
| --- | --- |
| Add Device | `editor.energy_display.add_device` |
| Animation speed | `editor.energy_display.animation_speed` |
| Box border width | `editor.energy_display.box_border_width` |
| Box corner radius | `editor.energy_display.box_corner_radius` |
| Circle size | `editor.energy_display.circle_size` |
| Node circle diameter (px) | `editor.energy_display.circle_size_desc` |
| Column spacing | `editor.energy_display.column_spacing` |
| Configure Solar, Grid, Battery, and Home. Use power sensor entities (W). | `editor.energy_display.core_nodes_desc` |
| Core Energy Nodes | `editor.energy_display.core_nodes_title` |
| Curve factor | `editor.energy_display.curve_factor` |
| Path curvature | `editor.energy_display.curve_factor_desc` |
| Add devices to show individual power consumption. Drag to reorder. | `editor.energy_display.devices_desc` |
| Custom Device Nodes | `editor.energy_display.devices_title` |
| Flow line width | `editor.energy_display.flow_line_width` |
| Line thickness (px) | `editor.energy_display.flow_line_width_desc` |
| Flow and Animation | `editor.energy_display.flow_title` |
| Gauge size | `editor.energy_display.gauge_size` |
| Central gauge diameter (px) | `editor.energy_display.gauge_size_desc` |
| Color | `editor.energy_display.node_color` |
| Enabled | `editor.energy_display.node_enabled` |
| Icon | `editor.energy_display.node_icon` |
| Label | `editor.energy_display.node_label` |
| Node spacing | `editor.energy_display.node_spacing` |
| Spacing between nodes (px) | `editor.energy_display.node_spacing_desc` |
| Energy Display is a Pro feature. Visualize energy flow between grid, solar, battery, home and devices with Circle Flow, Box Flow, or Sankey styles. | `editor.energy_display.pro_description` |
| Sankey width | `editor.energy_display.sankey_width` |
| Diagram width (px) | `editor.energy_display.sankey_width_desc` |
| Show directional arrow | `editor.energy_display.show_arrow` |
| Show icons | `editor.energy_display.show_icons` |
| Show labels | `editor.energy_display.show_labels` |
| Show self-sufficiency gauge | `editor.energy_display.show_self_sufficiency` |
| Show values | `editor.energy_display.show_values` |
| Fast | `editor.energy_display.speed_fast` |
| None | `editor.energy_display.speed_none` |
| Normal | `editor.energy_display.speed_normal` |
| Slow | `editor.energy_display.speed_slow` |
| Layout Style | `editor.energy_display.style` |
| Box Flow | `editor.energy_display.style_box` |
| Circle Flow | `editor.energy_display.style_circle` |
| Choose the visual layout for the energy flow display. | `editor.energy_display.style_desc` |
| Style Options | `editor.energy_display.style_options_title` |
| Sankey | `editor.energy_display.style_sankey` |
| Display Style | `editor.energy_display.style_title` |
| Unit display | `editor.energy_display.unit_display` |

</details>

<details>
<summary><strong>Time machine (editor)</strong> — 43 left</summary>

| English text | Key |
| --- | --- |
| {time} ago | `editor.time_machine.ago` |
| Auto-return to live | `editor.time_machine.auto_return` |
| Seconds of inactivity before snapping back to live. 0 disables auto-return. | `editor.time_machine.auto_return_desc` |
| Default time range | `editor.time_machine.default_span` |
| How far back the timeline reaches when the card loads. | `editor.time_machine.default_span_desc` |
| Scrubber controls | `editor.time_machine.display_section` |
| Choose which controls appear on the timeline. | `editor.time_machine.display_section_desc` |
| Entities | `editor.time_machine.entities` |
| Pick the entities to graph and track on the timeline. Numeric sensors are drawn as graphs; everything else shows its state at the scrub position. | `editor.time_machine.entities_card_desc` |
| The dashboard timeline automatically rewinds every entity used by the Ultra Cards in the view — no selection needed. Add extra entities here to also draw their event markers on the track. | `editor.time_machine.entities_dashboard_desc` |
| Their history powers the graphs, details, and event markers. | `editor.time_machine.entities_desc` |
| Entities | `editor.time_machine.entities_section` |
| Extra entities | `editor.time_machine.extra_entities` |
| Tracked in addition to the auto-discovered view entities. | `editor.time_machine.extra_entities_desc` |
| Live | `editor.time_machine.live` |
| Showing current state | `editor.time_machine.live_desc` |
| Card Timeline | `editor.time_machine.mode_card` |
| An independent history scrubber. Pick the entities you care about and explore their state history with built-in graphs, highs and lows, and details that follow the playhead. Nothing else on the page is affected. | `editor.time_machine.mode_card_desc` |
| Dashboard Timeline | `editor.time_machine.mode_dashboard` |
| Scrub the timeline and watch your dashboard rewind in real time — every Ultra Card in the current view follows, showing its history as you drag. | `editor.time_machine.mode_dashboard_desc` |
| Pick entities in the Time Machine settings to build a timeline with graphs and event markers. | `editor.time_machine.no_entities_card_hint` |
| Nothing to rewind yet — no entities found in this view. Add Ultra Cards with entity modules, or pick extra entities in the Time Machine settings. | `editor.time_machine.no_entities_hint` |
| Now | `editor.time_machine.now` |
| Replay history | `editor.time_machine.replay` |
| Return to live | `editor.time_machine.return_to_live` |
| Line graph | `editor.time_machine.show_chart` |
| Card Timeline: plot numeric entities as lines across the window. | `editor.time_machine.show_chart_desc` |
| Entity details | `editor.time_machine.show_details` |
| Card Timeline: show the per-entity value list under the graph. | `editor.time_machine.show_details_desc` |
| Event markers | `editor.time_machine.show_event_markers` |
| Draw a tick on the track for every entity state change. | `editor.time_machine.show_event_markers_desc` |
| State ribbons | `editor.time_machine.show_lanes` |
| Card Timeline: show on/off ribbons for non-numeric entities. | `editor.time_machine.show_lanes_desc` |
| Replay controls | `editor.time_machine.show_playback` |
| Show play/pause and step buttons to replay history. | `editor.time_machine.show_playback_desc` |
| Time range presets | `editor.time_machine.show_span_presets` |
| Show the 1h / 6h / 24h / 7d range pills. | `editor.time_machine.show_span_presets_desc` |
| Step back | `editor.time_machine.step_back` |
| Step forward | `editor.time_machine.step_forward` |
| Today | `editor.time_machine.today` |
| Place Time Machine directly in a card column (not nested inside a layout module) to enable card-wide rewind. | `editor.time_machine.top_level_hint` |
| Tracking {count} entities | `editor.time_machine.tracking` |
| Yesterday | `editor.time_machine.yesterday` |

</details>

<details>
<summary><strong>Animated forecast (editor)</strong> — 40 left</summary>

| English text | Key |
| --- | --- |
| No hourly forecast for this day | `editor.animated_forecast.preview.no_hourly` |
| Back | `editor.animated_forecast.back` |
| 🎨 Background | `editor.animated_forecast.background.title` |
| Chart Color | `editor.animated_forecast.chart_color` |
| Row Height | `editor.animated_forecast.chart_height` |
| Values | `editor.animated_forecast.chart_metrics` |
| Bars | `editor.animated_forecast.chart_style_bar` |
| Line | `editor.animated_forecast.chart_style_line` |
| 📊 Chart | `editor.animated_forecast.chart.title` |
| 🎨 Colors | `editor.animated_forecast.colors.title` |
| ⚙️ Forecast Configuration | `editor.animated_forecast.config.title` |
| Daily | `editor.animated_forecast.daily` |
| Tap a Day to See Its Hours | `editor.animated_forecast.day_tap_hourly` |
| Tapping a day switches to that day's hourly forecast. Tap Back to return. Day taps no longer run the module tap action. | `editor.animated_forecast.day_tap_hourly_desc` |
| ⚙️ Forecast Entities | `editor.animated_forecast.entities.title` |
| Forecast Background | `editor.animated_forecast.forecast_background` |
| Background for the forecast section (theme-aware by default) | `editor.animated_forecast.forecast_background_desc` |
| Forecast Day Names | `editor.animated_forecast.forecast_day_color` |
| Forecast Day Name Size | `editor.animated_forecast.forecast_day_size` |
| Forecast Days | `editor.animated_forecast.forecast_days` |
| Number of forecast days (3-7) | `editor.animated_forecast.forecast_days_desc` |
| Forecast Entity (Optional) | `editor.animated_forecast.forecast_entity` |
| Separate forecast entity if available | `editor.animated_forecast.forecast_entity_desc` |
| Forecast Hours | `editor.animated_forecast.forecast_hours` |
| Hours shown in the hourly view (3-12) | `editor.animated_forecast.forecast_hours_desc` |
| Forecast Icon Size | `editor.animated_forecast.forecast_icon_size` |
| Size of forecast weather icons (32-80px) | `editor.animated_forecast.forecast_icon_size_desc` |
| Forecast Temps | `editor.animated_forecast.forecast_temp_color` |
| Forecast Temp Size | `editor.animated_forecast.forecast_temp_size` |
| Show First | `editor.animated_forecast.forecast_type` |
| Hourly needs a weather integration that provides an hourly forecast. | `editor.animated_forecast.forecast_type_desc` |
| Hourly | `editor.animated_forecast.hourly` |
| 🎨 Icon Settings | `editor.animated_forecast.icon_settings.title` |
| Icon Style | `editor.animated_forecast.icon_style` |
| Choose between filled or outlined animated icons | `editor.animated_forecast.icon_style_desc` |
| Show Chart Under Forecast | `editor.animated_forecast.show_chart` |
| Adds a small bar or line row per value, lined up with each day or hour. | `editor.animated_forecast.show_chart_desc` |
| 📏 Text Sizes | `editor.animated_forecast.text_sizes.title` |
| Weather Entity | `editor.animated_forecast.weather_entity` |
| Primary weather.* entity with forecast data | `editor.animated_forecast.weather_entity_desc` |

</details>

<details>
<summary><strong>Layout (editor)</strong> — 40 left</summary>

| English text | Key |
| --- | --- |
| Accordion | `editor.layout.accordion_layout` |
| Add Column | `editor.layout.add_column` |
| Add Module to Section | `editor.layout.add_module_to_section` |
| Back to builder | `editor.layout.back_to_builder` |
| Column | `editor.layout.column` |
| Set the spacing between columns in pixels. | `editor.layout.column_gap_desc` |
| Column Layout | `editor.layout.column_layout` |
| Column Vertical Alignment | `editor.layout.column_vertical_alignment` |
| Set the vertical alignment for all columns in this row. This controls how content is aligned vertically within each column. | `editor.layout.column_vertical_alignment_desc` |
| Details | `editor.layout.config_validation_details` |
| Some changes could not be applied because the card configuration is invalid. | `editor.layout.config_validation_failed` |
| Copy | `editor.layout.copy` |
| Delete | `editor.layout.delete` |
| Drag to move | `editor.layout.drag_to_move` |
| Duplicate | `editor.layout.duplicate` |
| Edit | `editor.layout.edit` |
| Edit Section | `editor.layout.edit_section` |
| Export | `editor.layout.export` |
| Full Width | `editor.layout.full_width` |
| When enabled, the row spans the full width of the card. When disabled, you can set a custom width percentage. | `editor.layout.full_width_desc` |
| Module Preview | `editor.layout.module_preview` |
| No modules | `editor.layout.no_modules` |
| Paste | `editor.layout.paste` |
| Paste from Clipboard | `editor.layout.paste_clipboard` |
| Popup | `editor.layout.popup_layout` |
| Remap all entities in this card | `editor.layout.remap_entities_tooltip` |
| Row Name | `editor.layout.row_name` |
| Give this row a custom name to make it easier to identify in the editor. | `editor.layout.row_name_desc` |
| Row Width | `editor.layout.row_width` |
| Save as Favorite | `editor.layout.save_favorite` |
| Please select a column first by clicking "Add Module" on the column where you want to add this card. | `editor.layout.select_column_first` |
| Settings | `editor.layout.settings` |
| Slider Layout | `editor.layout.slider_layout` |
| Slider Module | `editor.layout.slider_module` |
| Stack Overlay | `editor.layout.stack_layout` |
| Tabs Layout | `editor.layout.tabs_layout` |
| No sections. Open settings to add sections. | `editor.layout.tabs_no_sections` |
| Open settings to manage tabs sections | `editor.layout.tabs_open_settings` |
| Width Percentage | `editor.layout.width_percent` |
| Set the row width as a percentage of the card width (0-100%). | `editor.layout.width_percent_desc` |

</details>

<details>
<summary><strong>Alarm panel (editor)</strong> — 39 left</summary>

| English text | Key |
| --- | --- |
| Arm | `editor.alarm_panel.action_arm` |
| Disarm | `editor.alarm_panel.action_disarm` |
| Choose which arm mode buttons to show. Leave unset to auto-detect from the entity. | `editor.alarm_panel.arm_modes_desc` |
| Arm modes | `editor.alarm_panel.arm_modes_label` |
| Arm Modes | `editor.alarm_panel.arm_modes_section` |
| Cancel | `editor.alarm_panel.cancel` |
| Clear | `editor.alarm_panel.clear` |
| Code for | `editor.alarm_panel.code_for` |
| Enter code | `editor.alarm_panel.code_placeholder` |
| Select an alarm panel | `editor.alarm_panel.config_needed` |
| Choose an alarm_control_panel entity in the General tab | `editor.alarm_panel.config_needed_desc` |
| Confirm | `editor.alarm_panel.confirm` |
| Choose what to show. | `editor.alarm_panel.display_desc` |
| Display | `editor.alarm_panel.display_section` |
| Alarm entity | `editor.alarm_panel.entity` |
| Alarm Entity | `editor.alarm_panel.entity_section` |
| Select the alarm_control_panel entity to control. | `editor.alarm_panel.entity_section_desc` |
| Select an alarm_control_panel entity | `editor.alarm_panel.error_entity` |
| PIN keypad | `editor.alarm_panel.keypad_label` |
| Layout | `editor.alarm_panel.layout` |
| Compact | `editor.alarm_panel.layout_compact` |
| Visual style of the alarm panel. | `editor.alarm_panel.layout_desc` |
| Hero | `editor.alarm_panel.layout_hero` |
| Layout | `editor.alarm_panel.layout_section` |
| Standard | `editor.alarm_panel.layout_standard` |
| Hero shows full PIN pad, standard is a single row, compact is a chip | `editor.alarm_panel.layout_style_desc` |
| Show Arm Away | `editor.alarm_panel.show_arm_away` |
| Show Arm Custom Bypass | `editor.alarm_panel.show_arm_custom` |
| Show Arm Home | `editor.alarm_panel.show_arm_home` |
| Show Arm Night | `editor.alarm_panel.show_arm_night` |
| Show Arm Vacation | `editor.alarm_panel.show_arm_vacation` |
| Show icon | `editor.alarm_panel.show_icon` |
| Show shield icon in the status ring | `editor.alarm_panel.show_icon_desc` |
| Show keypad | `editor.alarm_panel.show_keypad` |
| Always show the PIN keypad | `editor.alarm_panel.show_keypad_desc` |
| Show state text | `editor.alarm_panel.show_state` |
| Display the alarm state badge | `editor.alarm_panel.show_state_desc` |
| Show title | `editor.alarm_panel.show_title` |
| Display the alarm name | `editor.alarm_panel.show_title_desc` |

</details>

<details>
<summary><strong>Dropdown (editor)</strong> — 38 left</summary>

| English text | Key |
| --- | --- |
| Available Options | `editor.dropdown.available_options` |
| Custom Text Configuration | `editor.dropdown.closed_title_custom_config` |
| Custom text to display when dropdown is closed. | `editor.dropdown.closed_title_custom.desc` |
| Custom Text | `editor.dropdown.closed_title_custom.title` |
| Entity State Configuration | `editor.dropdown.closed_title_entity_config` |
| Entity | `editor.dropdown.closed_title_entity.title` |
| Custom | `editor.dropdown.closed_title_mode.custom` |
| Choose what the dropdown displays when closed. | `editor.dropdown.closed_title_mode.desc` |
| Entity State | `editor.dropdown.closed_title_mode.entity_state` |
| First Option | `editor.dropdown.closed_title_mode.first_option` |
| Last Chosen | `editor.dropdown.closed_title_mode.last_chosen` |
| Closed Dropdown Title | `editor.dropdown.closed_title_mode.title` |
| Icon Side | `editor.dropdown.control_alignment.icon_side` |
| Alignment Mode | `editor.dropdown.control_alignment.mode` |
| Control Icon | `editor.dropdown.control_icon.label` |
| Select the icon that indicates the dropdown toggle state. | `editor.dropdown.control_icon.label_desc` |
| Customize the dropdown chevron icon and how it aligns with the selected value. | `editor.dropdown.control_icon.section_desc` |
| Dropdown Control Icon | `editor.dropdown.control_icon.section_title` |
| Entity Source Mode Active | `editor.dropdown.entity_mode_active` |
| Options are automatically managed by the selected entity. The dropdown will display the current state and update the entity when an option is selected. | `editor.dropdown.entity_mode_desc` |
| Entity Source Configuration | `editor.dropdown.entity_source_config` |
| Options will be automatically populated from the entity. The dropdown will display the current state and update the entity when an option is selected. | `editor.dropdown.entity_source_info` |
| Auto | `editor.dropdown.menu_direction.auto` |
| Choose how the dropdown opens: auto picks best fit, or force up/down. | `editor.dropdown.menu_direction.desc` |
| Down | `editor.dropdown.menu_direction.down` |
| Menu Direction | `editor.dropdown.menu_direction.title` |
| Up | `editor.dropdown.menu_direction.up` |
| No options found for this entity | `editor.dropdown.no_options_found` |
| Select or Input Select entity to use as the source for dropdown options. | `editor.dropdown.source_entity.desc` |
| Source Entity | `editor.dropdown.source_entity.title` |
| Manual: Define custom options with actions. Entity: Use options from a Select or Input Select entity. | `editor.dropdown.source_mode.desc` |
| Entity Source | `editor.dropdown.source_mode.entity` |
| Manual Options | `editor.dropdown.source_mode.manual` |
| Source Mode | `editor.dropdown.source_mode.title` |
| Choose whether to manually define options or use a Select or Input Select entity. | `editor.dropdown.source.desc` |
| Dropdown Source | `editor.dropdown.source.title` |
| Number of items visible in the dropdown before scrolling (1-20). | `editor.dropdown.visible_items.desc` |
| Visible Items | `editor.dropdown.visible_items.title` |

</details>

<details>
<summary><strong>Update monitor (editor)</strong> — 38 left</summary>

| English text | Key |
| --- | --- |
| All up to date | `editor.update_monitor.all_ok` |
| Updates | `editor.update_monitor.default_title` |
| No update entities found | `editor.update_monitor.err_empty` |
| Enable "Show up-to-date entities" or adjust exclude filters in the General tab. | `editor.update_monitor.err_empty_desc` |
| Waiting for Home Assistant | `editor.update_monitor.err_ha` |
| Connecting to entity states… | `editor.update_monitor.err_ha_desc` |
| Exclude patterns | `editor.update_monitor.exclude_patterns` |
| Entity ids containing these substrings are ignored. | `editor.update_monitor.exclude_patterns_desc` |
| Hidden entities | `editor.update_monitor.hidden_entities` |
| Specific update entities to hide from the list. | `editor.update_monitor.hidden_entities_desc` |
| Pick an update entity | `editor.update_monitor.hidden_ph` |
| Hide when up to date | `editor.update_monitor.hide_when_empty` |
| On the dashboard, hide this module when no updates are pending. A column, row or card left empty hides too. | `editor.update_monitor.hide_when_empty_desc` |
| Install | `editor.update_monitor.install` |
| Max items | `editor.update_monitor.max_items` |
| Maximum entities to show. | `editor.update_monitor.max_items_desc` |
| e.g. beta, test | `editor.update_monitor.pattern_ph` |
| pending | `editor.update_monitor.pending` |
| Colors | `editor.update_monitor.section_colors` |
| Display | `editor.update_monitor.section_display` |
| What the module shows. | `editor.update_monitor.section_display_desc` |
| Show install button | `editor.update_monitor.show_install` |
| One-tap install when the integration supports it. | `editor.update_monitor.show_install_desc` |
| Show entity picture | `editor.update_monitor.show_picture` |
| Use the integration logo when available. | `editor.update_monitor.show_picture_desc` |
| Show title | `editor.update_monitor.show_title` |
| Display the header. | `editor.update_monitor.show_title_desc` |
| Show up-to-date entities | `editor.update_monitor.show_up_to_date` |
| Also list entities without a pending update. | `editor.update_monitor.show_up_to_date_desc` |
| Show version info | `editor.update_monitor.show_version` |
| Installed and latest version under each name. | `editor.update_monitor.show_version_desc` |
| Sort | `editor.update_monitor.sort` |
| Order of entities. | `editor.update_monitor.sort_desc` |
| Name A–Z | `editor.update_monitor.sort_name` |
| Unchanged | `editor.update_monitor.sort_raw` |
| Updates first | `editor.update_monitor.sort_updates` |
| Title | `editor.update_monitor.title` |
| Header above the list. | `editor.update_monitor.title_desc` |

</details>

<details>
<summary><strong>Popup (editor)</strong> — 37 left</summary>

| English text | Key |
| --- | --- |
| Icon Background | `editor.popup.trigger.icon_background` |
| Circle | `editor.popup.trigger.icon_background_circle` |
| Icon Background Color | `editor.popup.trigger.icon_background_color` |
| Shape drawn behind the icon, like the Icon module. | `editor.popup.trigger.icon_background_desc` |
| None | `editor.popup.trigger.icon_background_none` |
| Icon Background Padding | `editor.popup.trigger.icon_background_padding` |
| Space between the icon and the edge of its background. | `editor.popup.trigger.icon_background_padding_desc` |
| Rounded | `editor.popup.trigger.icon_background_rounded` |
| Trigger Icon Color | `editor.popup.trigger.icon_color` |
| Trigger Icon Size | `editor.popup.trigger.icon_size` |
| Size of the trigger icon in pixels. | `editor.popup.trigger.icon_size_desc` |
| Module | `editor.popup.trigger.module` |
| Module Trigger | `editor.popup.trigger.module_config` |
| Module Linked | `editor.popup.trigger.module_linked` |
| Tapping on "${module}" will now open this popup. | `editor.popup.trigger.module_linked_desc` |
| Select a module in this card that will open the popup when tapped. The selected module will have its tap action overridden to open this popup instead. | `editor.popup.trigger.module_trigger_desc` |
| Module Trigger | `editor.popup.trigger.module_trigger_title` |
| -- Select a Module -- | `editor.popup.trigger.no_module` |
| No Modules Available | `editor.popup.trigger.no_modules_available` |
| Add other modules to this card first, then you can select one to trigger this popup. | `editor.popup.trigger.no_modules_available_desc` |
| Select Module | `editor.popup.trigger.select_module` |
| Choose which module should trigger this popup when clicked. | `editor.popup.trigger.select_module_desc` |
| Animation Speed | `editor.popup.animation.duration` |
| How long the open animation runs, in milliseconds. | `editor.popup.animation.duration_desc` |
| Animation Easing | `editor.popup.animation.easing` |
| How the motion accelerates. Spring adds a little overshoot. | `editor.popup.animation.easing_desc` |
| Ease | `editor.popup.animation.easing_ease` |
| Ease In Out | `editor.popup.animation.easing_ease_in_out` |
| Ease Out | `editor.popup.animation.easing_ease_out` |
| Linear | `editor.popup.animation.easing_linear` |
| Spring | `editor.popup.animation.easing_spring` |
| Slide From Screen Edge | `editor.popup.animation.from_edge` |
| Start the slide off-screen so the popup glides in like a panel instead of nudging into place. | `editor.popup.animation.from_edge_desc` |
| Close | `editor.popup.close_button.label` |
| Background Overlay | `editor.popup.overlay.section_title` |
| Show Background Overlay | `editor.popup.overlay.show` |
| Display a dimmed overlay behind the popup when open. | `editor.popup.overlay.show_desc` |

</details>

<details>
<summary><strong>Linked row (editor)</strong> — 35 left</summary>

| English text | Key |
| --- | --- |
| This shared row was changed somewhere else. Open its General tab to load the newer copy. | `editor.linked_row.preview_newer` |
| This shared row is empty | `editor.linked_row.empty_linked_title` |
| Linked Row | `editor.linked_row.empty_title` |
| Add modules to this container, then share it from the General tab, or pick a shared row there. | `editor.linked_row.empty_desc` |
| Linked Row is a Pro feature: build a row of modules once, show it on any dashboard, and edit it in one place to update every copy. | `editor.linked_row.pro_description` |
| Linked Row | `editor.linked_row.section_title` |
| Shared rows are stored by Ultra Card Connect. Install Connect {version} or newer to share this row. Until then it works like a normal container. | `editor.linked_row.connect_missing` |
| Update Ultra Card Connect to {version} or newer to share this row. Until then it shows the copy saved in this card. | `editor.linked_row.connect_outdated` |
| Build a row once and show it on any dashboard. Edit it in one place and every copy updates. | `editor.linked_row.intro` |
| Use a shared row | `editor.linked_row.pick_existing` |
| Replaces the modules in this container with the shared ones. | `editor.linked_row.pick_existing_replace` |
| Pick a row you already shared from another card. | `editor.linked_row.pick_existing_desc` |
| Choose a shared row | `editor.linked_row.pick_placeholder` |
| Loading shared rows… | `editor.linked_row.library_loading` |
| No shared rows yet. Create the first one below. | `editor.linked_row.library_empty` |
| Create a shared row from these modules | `editor.linked_row.create_title` |
| Give it a name you will recognize when adding it to another card. | `editor.linked_row.create_desc` |
| Create shared row | `editor.linked_row.create_button` |
| This shared row is no longer in the library. Share it again, or unlink to keep it as a normal container. | `editor.linked_row.absent` |
| Share it again | `editor.linked_row.share_again` |
| This shared row was changed somewhere else (revision {revision}). Load the newer copy, or keep yours and overwrite it. | `editor.linked_row.conflict` |
| Load the newer copy | `editor.linked_row.load_newer` |
| Keep mine and overwrite | `editor.linked_row.overwrite` |
| Checking the shared copy… If Ultra Card Connect is offline, this card keeps showing its saved copy. | `editor.linked_row.checking` |
| You changed this row. Saving the card shares the change with every card that uses it. | `editor.linked_row.local_ahead` |
| Share now | `editor.linked_row.share_now` |
| Up to date. Edits you save here update every card that uses this row. | `editor.linked_row.in_sync` |
| Revision {revision} | `editor.linked_row.revision` |
| Unlink (keep a normal copy) | `editor.linked_row.unlink` |
| Could not load that shared row. Check that Ultra Card Connect is running. | `editor.linked_row.load_failed` |
| Linked row | `editor.linked_row.default_name` |
| Only Home Assistant admins can change shared rows. | `editor.linked_row.admin_only` |
| Could not save the shared row: {error} | `editor.linked_row.save_failed` |
| Alignment and spacing of the modules in this shared row. These settings stay on this card and are not shared. | `editor.linked_row.layout_desc` |
| Space between the modules in this row. Use negative values to overlap them. Gap is off when using Space Between or Space Around. | `editor.linked_row.gap_desc` |

</details>

<details>
<summary><strong>Stack (editor)</strong> — 34 left</summary>

| English text | Key |
| --- | --- |
| Anchor point | `editor.stack.layer.anchor` |
| Remove layer | `editor.stack.layer.delete` |
| Move down | `editor.stack.layer.down` |
| Drag to move this layer | `editor.stack.layer.drag_hint` |
| Height | `editor.stack.layer.height` |
| Offset from anchor | `editor.stack.layer.offset` |
| Offset X | `editor.stack.layer.offset_x` |
| Offset Y | `editor.stack.layer.offset_y` |
| Opacity | `editor.stack.layer.opacity` |
| Editing layer | `editor.stack.layer.position.desc` |
| Layer position | `editor.stack.layer.position.title` |
| Click to select this layer | `editor.stack.layer.select_hint` |
| Size | `editor.stack.layer.size` |
| Move up | `editor.stack.layer.up` |
| Toggle visibility | `editor.stack.layer.visibility` |
| Width | `editor.stack.layer.width` |
| Leave empty to use layer list order (bottom to top). | `editor.stack.layer.z_desc` |
| Z-index override | `editor.stack.layer.z_index` |
| Aspect ratio | `editor.stack.aspect_ratio` |
| Clip overflow | `editor.stack.clip` |
| Hide content outside rounded bounds. | `editor.stack.clip_desc` |
| Aspect ratio or fixed height defines the overlay area. | `editor.stack.container.desc` |
| Container | `editor.stack.container.title` |
| No layers yet | `editor.stack.empty` |
| Drag modules into this stack from the layout tree, or pick a Quick start preset | `editor.stack.empty_hint` |
| Height (optional) | `editor.stack.height` |
| When set (e.g. 280px, 40vh), overrides aspect ratio height. | `editor.stack.height_desc` |
| layer | `editor.stack.layer_z` |
| Layers are stacked bottom (first) to top (last). Click a row to edit its position. | `editor.stack.layers.desc` |
| Drag modules into this stack from the layout tree, or pick a Quick start preset above. New layers default to the center of the card so you can offset them in any direction. | `editor.stack.layers.empty_desc` |
| No layers yet | `editor.stack.layers.empty_title` |
| Layers | `editor.stack.layers.title` |
| Pick a starting point — you can edit, reorder, and remove layers afterwards. | `editor.stack.presets.desc` |
| Quick start | `editor.stack.presets.title` |

</details>

<details>
<summary><strong>Background (editor)</strong> — 33 left</summary>

| English text | Key |
| --- | --- |
| Entity | `editor.background.entity` |
| Select an entity that provides a picture URL or image (e.g. person, camera, or media player). | `editor.background.entity_desc` |
| Image URL | `editor.background.image_url` |
| Enter the direct URL to the background image. | `editor.background.image_url_desc` |
| Apply custom background images to your dashboard view. Only the topmost enabled module with passing logic conditions will be applied. | `editor.background.info_desc` |
| View Background | `editor.background.info_title` |
| Opacity | `editor.background.opacity` |
| Control the opacity of the background image (0–100%). | `editor.background.opacity_desc` |
| Background Position | `editor.background.position` |
| Set the position (e.g., center, top left, bottom right). | `editor.background.position_desc` |
| Background Repeat | `editor.background.repeat` |
| Repeat | `editor.background.repeat_both` |
| Control how the background image repeats. | `editor.background.repeat_desc` |
| No Repeat | `editor.background.repeat_none` |
| Repeat Horizontally | `editor.background.repeat_x` |
| Repeat Vertically | `editor.background.repeat_y` |
| Control how the background image is displayed. | `editor.background.settings_desc` |
| Background Settings | `editor.background.settings_title` |
| Background Size | `editor.background.size` |
| Auto (Original size) | `editor.background.size_auto` |
| Contain (Fit within area) | `editor.background.size_contain` |
| Cover (Fill entire area) | `editor.background.size_cover` |
| Control how the background image is sized within the view. | `editor.background.size_desc` |
| Fill (Stretch to fit) | `editor.background.size_fill` |
| Background Source | `editor.background.source_title` |
| Background Type | `editor.background.type` |
| Select the source type for your background image. | `editor.background.type_desc` |
| Entity Image | `editor.background.type_entity` |
| None | `editor.background.type_none` |
| Upload Image | `editor.background.type_upload` |
| Image URL | `editor.background.type_url` |
| Upload Image | `editor.background.upload` |
| Click to upload a background image file from your device. | `editor.background.upload_desc` |

</details>

<details>
<summary><strong>Grid layout (editor)</strong> — 33 left</summary>

| English text | Key |
| --- | --- |
| Auto Fit | `editor.grid_layout.config.auto_fit` |
| Column Mode | `editor.grid_layout.config.column_mode` |
| Fixed uses an exact column count. Auto Fit fills the width with as many columns as fit. | `editor.grid_layout.config.column_mode_desc` |
| Columns | `editor.grid_layout.config.columns` |
| Number of equal-width columns in the grid. | `editor.grid_layout.config.columns_desc` |
| Dense Packing | `editor.grid_layout.config.dense` |
| Backfill gaps left by spanning items (masonry-like packing). | `editor.grid_layout.config.dense_desc` |
| Configure the grid tracks. Children placed in this container flow into the grid cells. | `editor.grid_layout.config.desc` |
| Fixed Columns | `editor.grid_layout.config.fixed` |
| Item Alignment | `editor.grid_layout.config.item_alignment` |
| Vertical alignment of items within their grid cell. | `editor.grid_layout.config.item_alignment_desc` |
| Minimum Column Width | `editor.grid_layout.config.min_width` |
| Smallest allowed column width (e.g. 140px). Columns are added or removed to fit. | `editor.grid_layout.config.min_width_desc` |
| Grid Configuration | `editor.grid_layout.config.title` |
| Add modules in the layout builder to see them in the grid | `editor.grid_layout.empty.add_modules` |
| All modules hidden by logic | `editor.grid_layout.empty.all_hidden` |
| No modules added yet | `editor.grid_layout.empty.no_modules` |
| Mobile Breakpoint (px) | `editor.grid_layout.responsive.breakpoint` |
| Viewport width below which the mobile column count applies. | `editor.grid_layout.responsive.breakpoint_desc` |
| Collapse the grid on small screens. | `editor.grid_layout.responsive.desc` |
| Mobile Columns | `editor.grid_layout.responsive.mobile_columns` |
| Column count used below the breakpoint. Item spans are reset on mobile. | `editor.grid_layout.responsive.mobile_columns_desc` |
| Off | `editor.grid_layout.responsive.off` |
| Responsive | `editor.grid_layout.responsive.title` |
| Gaps between grid cells. | `editor.grid_layout.spacing.desc` |
| Column Gap | `editor.grid_layout.spacing.gap` |
| Row Gap | `editor.grid_layout.spacing.row_gap` |
| Follows the column gap until changed. | `editor.grid_layout.spacing.row_gap_desc` |
| Spacing | `editor.grid_layout.spacing.title` |
| Let individual children span multiple columns or rows. | `editor.grid_layout.spans.desc` |
| Add modules to this grid in the layout builder first, then configure their spans here. | `editor.grid_layout.spans.empty` |
| The first select is column span, the second is row span. | `editor.grid_layout.spans.hint` |
| Item Spans | `editor.grid_layout.spans.title` |

</details>

<details>
<summary><strong>Screensaver (editor)</strong> — 33 left</summary>

| English text | Key |
| --- | --- |
| Activation entity (optional) | `editor.screensaver.activation_entity` |
| Screensaver active | `editor.screensaver.active_label` |
| 24-hour format | `editor.screensaver.clock_24h` |
| Use 24h time instead of AM/PM | `editor.screensaver.clock_24h_desc` |
| Clock & Date | `editor.screensaver.clock_section` |
| Dismiss | `editor.screensaver.dismiss` |
| A binary_sensor that forces the screensaver on when its state is "on". | `editor.screensaver.entity_desc` |
| Activation Entity (optional) | `editor.screensaver.entity_section` |
| Idle timeout | `editor.screensaver.idle_timeout` |
| Seconds of inactivity before activating | `editor.screensaver.idle_timeout_desc` |
| Image interval | `editor.screensaver.image_interval` |
| Image URLs | `editor.screensaver.image_urls` |
| https:// or /local/ paths, one per line | `editor.screensaver.image_urls_desc` |
| One URL per line to cycle as the screensaver background. | `editor.screensaver.images_desc` |
| Image Slideshow (optional) | `editor.screensaver.images_section` |
| Overlay color | `editor.screensaver.overlay_color` |
| Background colour and opacity. | `editor.screensaver.overlay_desc` |
| Screensaver — tap to dismiss | `editor.screensaver.overlay_label` |
| Overlay opacity | `editor.screensaver.overlay_opacity` |
| Overlay | `editor.screensaver.overlay_section` |
| Style | `editor.screensaver.overlay_style` |
| Show clock | `editor.screensaver.show_clock` |
| Show date | `editor.screensaver.show_date` |
| Show weather | `editor.screensaver.show_weather` |
| Visual theme for the screensaver overlay. | `editor.screensaver.style_desc` |
| Style | `editor.screensaver.style_section` |
| Tap anywhere to dismiss | `editor.screensaver.tap_to_dismiss` |
| When the screensaver should appear. | `editor.screensaver.timing_desc` |
| Activation | `editor.screensaver.timing_section` |
| Trigger buffer | `editor.screensaver.trigger_buffer` |
| Seconds to wait after a manual dismiss before the entity can re-trigger | `editor.screensaver.trigger_buffer_desc` |
| Weather entity | `editor.screensaver.weather_entity` |
| Weather | `editor.screensaver.weather_section` |

</details>

<details>
<summary><strong>Clock (editor)</strong> — 31 left</summary>

| English text | Key |
| --- | --- |
| Center | `editor.clock.align_center` |
| Left | `editor.clock.align_left` |
| Right | `editor.clock.align_right` |
| Alignment | `editor.clock.alignment` |
| Date color | `editor.clock.date_color` |
| Friday, June 12 | `editor.clock.date_long` |
| Fri, Jun 12 | `editor.clock.date_short` |
| Date size | `editor.clock.date_size` |
| Date style | `editor.clock.date_style` |
| How the date is written. | `editor.clock.date_style_desc` |
| Time from entity | `editor.clock.entity` |
| Optional. Show the date and time an entity holds, such as when the dishwasher finishes, instead of the current time. Works with timestamp sensors, date/time helpers and date/time entities. | `editor.clock.entity_desc` |
| 12-hour | `editor.clock.format_12` |
| 24-hour | `editor.clock.format_24` |
| Display | `editor.clock.section_display` |
| What the clock shows. | `editor.clock.section_display_desc` |
| Show AM/PM | `editor.clock.show_ampm` |
| Only applies to the 12-hour format. | `editor.clock.show_ampm_desc` |
| Show date | `editor.clock.show_date` |
| Date line under the time. | `editor.clock.show_date_desc` |
| Show seconds | `editor.clock.show_seconds` |
| Tick every second. | `editor.clock.show_seconds_desc` |
| Time color | `editor.clock.time_color` |
| Time format | `editor.clock.time_format` |
| Time size | `editor.clock.time_size` |
| Time weight | `editor.clock.time_weight` |
| Timezone | `editor.clock.timezone` |
| Optional IANA timezone (e.g. Europe/London). Leave blank for local time. | `editor.clock.timezone_desc` |
| Bold | `editor.clock.weight_bold` |
| Medium | `editor.clock.weight_medium` |
| Normal | `editor.clock.weight_normal` |

</details>

<details>
<summary><strong>Info (editor)</strong> — 31 left</summary>

| English text | Key |
| --- | --- |
| Show Entity Picture | `editor.info.icon_section.show_entity_picture` |
| When enabled, entity_picture replaces the configured icon when available. | `editor.info.icon_section.show_entity_picture_desc` |
| These controls affect the selected entity only. | `editor.info.size_section.desc` |
| Allow Wrapping | `editor.info.allow_wrap` |
| Allow grid items to wrap to new rows when they exceed the container width | `editor.info.allow_wrap_desc` |
| Content Distribution | `editor.info.content_distribution` |
| Control how icon and content are distributed along the main axis | `editor.info.content_distribution_desc` |
| Display Attribute | `editor.info.display_attribute` |
| Show an entity attribute instead of the main state | `editor.info.display_attribute_desc` |
| Align the icon along the cross axis | `editor.info.icon_alignment_desc` |
| Position the icon relative to the content (left, top, right, or bottom) | `editor.info.icon_position_desc` |
| Name Alignment | `editor.info.name_alignment` |
| Align the name text within its container | `editor.info.name_alignment_desc` |
| Name First | `editor.info.name_first` |
| Name & Value Gap | `editor.info.name_value_gap` |
| Space between the name and value in pixels | `editor.info.name_value_gap_desc` |
| Layout Direction | `editor.info.name_value_layout.orientation` |
| Choose how to display the name and value | `editor.info.name_value_layout.orientation_desc` |
| Arrange name and value (horizontal places them on one line) | `editor.info.name_value_layout.orientation_desc_vertical_icon` |
| Choose how to arrange the name and value beside the icon | `editor.info.name_value_layout.orientation_desc_with_icon` |
| Name & Value Layout | `editor.info.name_value_layout.title` |
| Name & Value Order | `editor.info.name_value_order` |
| Which one comes first on the line | `editor.info.name_value_order_desc_horizontal` |
| Which one sits on top of the other | `editor.info.name_value_order_desc_vertical` |
| Align the entire info item within its container | `editor.info.overall_alignment_desc` |
| State Alignment | `editor.info.state_alignment` |
| Align the state/value text within its container | `editor.info.state_alignment_desc` |
| Template Cheatsheet | `editor.info.template_cheatsheet` |
| Use Jinja2 templates to control icon and color dynamically. Uses entity context variables for seamless entity remapping. | `editor.info.unified_template_section.desc` |
| Template Mode | `editor.info.unified_template_section.title` |
| Value First | `editor.info.value_first` |

</details>

<details>
<summary><strong>Humidifier (editor)</strong> — 30 left</summary>

| English text | Key |
| --- | --- |
| Active color | `editor.humidifier.active_color` |
| Accent used when the device is on. | `editor.humidifier.active_color_desc` |
| Card background | `editor.humidifier.card_bg` |
| Select a humidifier | `editor.humidifier.config_needed` |
| Choose an entity in the General tab | `editor.humidifier.config_needed_desc` |
| Display | `editor.humidifier.display_section` |
| Choose which controls to show. | `editor.humidifier.display_section_desc` |
| Drying | `editor.humidifier.drying` |
| Entity | `editor.humidifier.entity` |
| A humidifier or dehumidifier entity. | `editor.humidifier.entity_desc` |
| Entity | `editor.humidifier.entity_section` |
| Choose the humidifier to control. | `editor.humidifier.entity_section_desc` |
| Humidifying | `editor.humidifier.humidifying` |
| Icon override | `editor.humidifier.icon` |
| Leave blank to use the entity icon. | `editor.humidifier.icon_desc` |
| Name override | `editor.humidifier.name` |
| Leave blank to use the entity friendly name. | `editor.humidifier.name_desc` |
| Off | `editor.humidifier.off` |
| On | `editor.humidifier.on` |
| Show current humidity | `editor.humidifier.show_current` |
| Large reading when the device reports it. | `editor.humidifier.show_current_desc` |
| Show modes | `editor.humidifier.show_modes` |
| Mode buttons when the device supports them. | `editor.humidifier.show_modes_desc` |
| Show name | `editor.humidifier.show_name` |
| Show power button | `editor.humidifier.show_power` |
| Show target slider | `editor.humidifier.show_slider` |
| Target humidity | `editor.humidifier.target` |
| Text color | `editor.humidifier.text_color` |
| Toggle power | `editor.humidifier.toggle_power` |
| Unavailable | `editor.humidifier.unavailable` |

</details>

<details>
<summary><strong>Weather (editor)</strong> — 30 left</summary>

| English text | Key |
| --- | --- |
| Card background | `editor.weather.card_bg` |
| Select a weather entity | `editor.weather.config_needed` |
| Choose an entity in the General tab | `editor.weather.config_needed_desc` |
| Current conditions | `editor.weather.current_section` |
| The large current weather block. | `editor.weather.current_section_desc` |
| Daily | `editor.weather.daily` |
| Extra details | `editor.weather.details_section` |
| Small values under the condition. Each turns on by itself when you pick its station sensor. | `editor.weather.details_section_desc` |
| Weather entity | `editor.weather.entity` |
| Entity | `editor.weather.entity_section` |
| Choose the weather source. | `editor.weather.entity_section_desc` |
| Forecast items | `editor.weather.forecast_count` |
| Days or hours to show. | `editor.weather.forecast_count_desc` |
| Forecast | `editor.weather.forecast_section` |
| The forecast strip below. | `editor.weather.forecast_section_desc` |
| Forecast type | `editor.weather.forecast_type` |
| Hourly | `editor.weather.hourly` |
| Icon color | `editor.weather.icon_color` |
| Location name | `editor.weather.name` |
| Leave blank to use the entity name. | `editor.weather.name_desc` |
| Show current conditions | `editor.weather.show_current` |
| Show forecast | `editor.weather.show_forecast` |
| Show humidity | `editor.weather.show_humidity` |
| Show condition label | `editor.weather.show_label` |
| Show wind | `editor.weather.show_wind` |
| Show wind direction | `editor.weather.show_wind_direction` |
| An arrow showing which way the wind blows. | `editor.weather.show_wind_direction_desc` |
| Weather station sensors | `editor.weather.station_section` |
| Optional. Use your own weather station for the current values. The icon and forecast still come from the weather entity. | `editor.weather.station_section_desc` |
| Temperature color | `editor.weather.temp_color` |

</details>

<details>
<summary><strong>Camera (editor)</strong> — 29 left</summary>

| English text | Key |
| --- | --- |
| Bottom Middle | `editor.camera.name_position.options.bottom_middle` |
| Top Middle | `editor.camera.name_position.options.top_middle` |
| Live / Snapshot Badge | `editor.camera.show_mode_badge.title` |
| Show a small badge in the top corner saying whether the camera is streaming live or showing still snapshots. | `editor.camera.show_mode_badge.desc` |
| Live | `editor.camera.mode_badge.live` |
| Snapshot | `editor.camera.mode_badge.snapshot` |
| Camera now uses responsive sizing by default (100% width). Use the Design tab for full control over dimensions, or adjust these fallback pixel dimensions for specific use cases. | `editor.camera.dimensions.responsive_note` |
| Go Live When | `editor.camera.live_trigger.title` |
| Switch to a live stream while this entity is on, such as a doorbell ring, motion sensor or toggle helper. Event entities go live each time they fire. | `editor.camera.live_trigger.desc` |
| Stay Live For (seconds) | `editor.camera.live_trigger_hold.title` |
| How long the stream stays live after the entity turns off or the event fires. Range: 0-3600 seconds. | `editor.camera.live_trigger_hold.desc` |
| Action Buttons | `editor.camera.action_buttons.title` |
| Buttons over the feed that also show in fullscreen, such as unlocking the front door. Locks unlock or lock, covers open or close, buttons and scripts run, and anything else toggles. | `editor.camera.action_buttons.desc` |
| Button | `editor.camera.action_buttons.button` |
| Remove button | `editor.camera.action_buttons.remove` |
| Entity | `editor.camera.action_buttons.entity` |
| Icon | `editor.camera.action_buttons.icon` |
| Leave empty to follow the entity, such as an open or closed lock. | `editor.camera.action_buttons.icon_desc` |
| Label | `editor.camera.action_buttons.label` |
| Shown in fullscreen and as the tooltip. Leave empty to use the entity name. | `editor.camera.action_buttons.label_desc` |
| Tap Twice to Confirm | `editor.camera.action_buttons.confirm` |
| Ask for a second tap before running, so a stray tap cannot unlock a door. On by default for locks. | `editor.camera.action_buttons.confirm_desc` |
| Add Button | `editor.camera.action_buttons.add` |
| Button Position | `editor.camera.action_buttons.position` |
| Tap again to confirm | `editor.camera.action_buttons.tap_again` |
| Rotation | `editor.camera.rotation` |
| Rotate the camera image clockwise (0–360 degrees). | `editor.camera.rotation_desc` |
| Tap Camera Opens Fullscreen | `editor.camera.tap_opens_fullscreen` |
| When enabled, tapping anywhere on the camera will open it in fullscreen mode. | `editor.camera.tap_opens_fullscreen_desc` |

</details>

<details>
<summary><strong>Drawer (editor)</strong> — 28 left</summary>

| English text | Key |
| --- | --- |
| Panel Background | `editor.drawer.panel.background` |
| Show Close Button | `editor.drawer.panel.close_button` |
| Where the drawer slides in from and how it looks. Modules added to this container appear inside the drawer. | `editor.drawer.panel.desc` |
| Close On Overlay Click | `editor.drawer.panel.overlay_close` |
| Position | `editor.drawer.panel.position` |
| Panel Size | `editor.drawer.panel.size` |
| Width for left/right drawers, height for top/bottom (e.g. 340px, 50vh, 80%). Leave empty for the default. | `editor.drawer.panel.size_desc` |
| Drawer Panel | `editor.drawer.panel.title` |
| Drawer Title | `editor.drawer.panel.title_field` |
| No modules added. Add modules to this drawer in the layout builder. | `editor.drawer.preview.no_modules` |
| Trigger Background | `editor.drawer.trigger.bg` |
| Button | `editor.drawer.trigger.button` |
| Trigger Text/Icon Color | `editor.drawer.trigger.color` |
| The button rendered in the card that opens the drawer. | `editor.drawer.trigger.desc` |
| Icon Only | `editor.drawer.trigger.icon` |
| Icon Background | `editor.drawer.trigger.icon_background` |
| Circle | `editor.drawer.trigger.icon_background_circle` |
| Shape drawn behind the icon, like the Icon module. | `editor.drawer.trigger.icon_background_desc` |
| None | `editor.drawer.trigger.icon_background_none` |
| Icon Background Padding (1px) | `editor.drawer.trigger.icon_background_padding` |
| Space between the icon and the edge of its background. | `editor.drawer.trigger.icon_background_padding_desc` |
| Rounded | `editor.drawer.trigger.icon_background_rounded` |
| Trigger Icon | `editor.drawer.trigger.icon_field` |
| Icon Size | `editor.drawer.trigger.icon_size` |
| Size of the trigger icon. | `editor.drawer.trigger.icon_size_desc` |
| Trigger Label | `editor.drawer.trigger.label` |
| Trigger Style | `editor.drawer.trigger.style` |
| Trigger | `editor.drawer.trigger.title` |

</details>

<details>
<summary><strong>Template (editor)</strong> — 27 left</summary>

| English text | Key |
| --- | --- |
| Select an entity | `editor.template.config_needed` |
| Choose an entity in the General tab | `editor.template.config_needed_desc` |
| Display | `editor.template.display_section` |
| Choose what to show. | `editor.template.display_section_desc` |
| Entity | `editor.template.entity` |
| The entity to display. | `editor.template.entity_desc` |
| Entity | `editor.template.entity_section` |
| Choose the entity this module displays. | `editor.template.entity_section_desc` |
| Extra option | `editor.template.extra_option` |
| An extra option that only appears when enabled. | `editor.template.extra_option_desc` |
| Extra options | `editor.template.extra_section` |
| Icon override | `editor.template.icon` |
| Leave blank to use the entity icon. | `editor.template.icon_desc` |
| Layout | `editor.template.layout` |
| Compact | `editor.template.layout_compact` |
| Choose a layout style. | `editor.template.layout_desc` |
| Layout | `editor.template.layout_section` |
| How the module is arranged. | `editor.template.layout_section_desc` |
| Standard | `editor.template.layout_standard` |
| Name override | `editor.template.name` |
| Leave blank to use the entity friendly name. | `editor.template.name_desc` |
| Show name | `editor.template.show_name` |
| Display the entity name. | `editor.template.show_name_desc` |
| Show state | `editor.template.show_state` |
| Display the entity state. | `editor.template.show_state_desc` |
| Size | `editor.template.size` |
| Set the display size. | `editor.template.size_desc` |

</details>

<details>
<summary><strong>State switcher (editor)</strong> — 26 left</summary>

| English text | Key |
| --- | --- |
| Add modules in the layout builder, then set each one’s display conditions in its Logic tab | `editor.state_switcher.empty.add_modules` |
| No child conditions match right now | `editor.state_switcher.empty.no_match` |
| Set Fallback Mode to show a default, or add a child without conditions as the last item | `editor.state_switcher.empty.no_match_hint` |
| No modules added yet | `editor.state_switcher.empty.no_modules` |
| What to show when no child conditions match. | `editor.state_switcher.fallback.desc` |
| Show first child | `editor.state_switcher.fallback.first` |
| Show last child | `editor.state_switcher.fallback.last` |
| Fallback Mode | `editor.state_switcher.fallback.mode` |
| Show nothing | `editor.state_switcher.fallback.none` |
| Fallback | `editor.state_switcher.fallback.title` |
| Add modules to this container, then give each one display conditions in its Logic tab. The switcher shows only the FIRST child whose conditions match — top to bottom. A child without conditions always matches, so put … | `editor.state_switcher.how.desc` |
| How It Works | `editor.state_switcher.how.title` |
| Always matches | `editor.state_switcher.order.always` |
| Has conditions | `editor.state_switcher.order.has_conditions` |
| Match Order | `editor.state_switcher.order.title` |
| No modules added yet. Add them in the layout builder and they will be listed here in match order. | `editor.state_switcher.order.empty` |
| Animation when the visible child changes. | `editor.state_switcher.transition.desc` |
| Transition Duration | `editor.state_switcher.transition.duration` |
| Fade | `editor.state_switcher.transition.fade` |
| Scale | `editor.state_switcher.transition.scale` |
| Slide Down | `editor.state_switcher.transition.slide_down` |
| Slide Left | `editor.state_switcher.transition.slide_left` |
| Slide Right | `editor.state_switcher.transition.slide_right` |
| Slide Up | `editor.state_switcher.transition.slide_up` |
| Transition | `editor.state_switcher.transition.title` |
| Transition | `editor.state_switcher.transition.type` |

</details>

<details>
<summary><strong>Todo list (editor)</strong> — 26 left</summary>

| English text | Key |
| --- | --- |
| Accent color | `editor.todo_list.accent_color` |
| Checkboxes and the add button. | `editor.todo_list.accent_color_desc` |
| Add | `editor.todo_list.add` |
| Add item… | `editor.todo_list.add_ph` |
| Card background | `editor.todo_list.card_bg` |
| Select a to-do list | `editor.todo_list.config_needed` |
| Choose a todo entity in the General tab | `editor.todo_list.config_needed_desc` |
| Display | `editor.todo_list.display_section` |
| Choose what to show. | `editor.todo_list.display_section_desc` |
| Nothing to do — list is empty | `editor.todo_list.empty` |
| Enable adding items | `editor.todo_list.enable_add` |
| Input field at the bottom when the list supports it. | `editor.todo_list.enable_add_desc` |
| To-do entity | `editor.todo_list.entity` |
| Any todo entity — shopping lists, tasks, etc. | `editor.todo_list.entity_desc` |
| List | `editor.todo_list.entity_section` |
| Choose the to-do list to display. | `editor.todo_list.entity_section_desc` |
| left | `editor.todo_list.items_left` |
| Max items | `editor.todo_list.max_items` |
| Maximum items to show. | `editor.todo_list.max_items_desc` |
| Show completed items | `editor.todo_list.show_completed` |
| Completed items appear crossed out below active ones. | `editor.todo_list.show_completed_desc` |
| Show due dates | `editor.todo_list.show_due` |
| Show title | `editor.todo_list.show_title` |
| Text color | `editor.todo_list.text_color` |
| Title override | `editor.todo_list.title` |
| Leave blank to use the list name. | `editor.todo_list.title_desc` |

</details>

<details>
<summary><strong>Animated clock (editor)</strong> — 22 left</summary>

| English text | Key |
| --- | --- |
| Center Dot | `editor.animated_clock.analog_show_center_dot` |
| Hour Hand | `editor.animated_clock.analog_show_hour_hand` |
| Minute Hand | `editor.animated_clock.analog_show_minute_hand` |
| Second Hand | `editor.animated_clock.analog_show_seconds` |
| Smooth Sweeping Motion | `editor.animated_clock.analog_smooth_seconds` |
| Clock Size | `editor.animated_clock.clock_size` |
| Scale factor for clock size (0–200) | `editor.animated_clock.clock_size_desc` |
| Clock Style | `editor.animated_clock.clock_style` |
| Choose from 10 different clock display styles | `editor.animated_clock.clock_style_desc` |
| Clock Configuration | `editor.animated_clock.config.title` |
| Clock Customization | `editor.animated_clock.customization.title` |
| Tile Background Color | `editor.animated_clock.flip_tile_color` |
| AM/PM | `editor.animated_clock.show_ampm` |
| Terminal Command | `editor.animated_clock.show_command` |
| Blinking Cursor | `editor.animated_clock.show_cursor` |
| Hours | `editor.animated_clock.show_hours` |
| Minutes | `editor.animated_clock.show_minutes` |
| Terminal Prompt | `editor.animated_clock.show_prompt` |
| Seconds | `editor.animated_clock.show_seconds` |
| Separators (:) | `editor.animated_clock.show_separators` |
| Time Format | `editor.animated_clock.time_format` |
| 12-hour or 24-hour time display | `editor.animated_clock.time_format_desc` |

</details>

<details>
<summary><strong>Flip card (editor)</strong> — 21 left</summary>

| English text | Key |
| --- | --- |
| Style and speed of the flip. | `editor.flip_card.animation.desc` |
| Flip Direction | `editor.flip_card.animation.direction` |
| Flip Duration | `editor.flip_card.animation.duration` |
| Horizontal | `editor.flip_card.animation.horizontal` |
| Animation | `editor.flip_card.animation.title` |
| Vertical | `editor.flip_card.animation.vertical` |
| Attribute (optional) | `editor.flip_card.behavior.attribute` |
| Leave empty to match against the entity state. | `editor.flip_card.behavior.attribute_desc` |
| Choose what causes the card to flip to its back face. | `editor.flip_card.behavior.desc` |
| Entity | `editor.flip_card.behavior.entity` |
| Entity | `editor.flip_card.behavior.entity_field` |
| The card shows the back face while this entity matches the value below. | `editor.flip_card.behavior.entity_field_desc` |
| Hover | `editor.flip_card.behavior.hover` |
| Tap | `editor.flip_card.behavior.tap` |
| Flip Behavior | `editor.flip_card.behavior.title` |
| Flip Trigger | `editor.flip_card.behavior.trigger` |
| Show Back When Value Is | `editor.flip_card.behavior.value` |
| Add a second module for the back face | `editor.flip_card.empty.back` |
| Add a module for the front face | `editor.flip_card.empty.front` |
| The first module added to this container is the front face; the second is the back face. Use a Vertical Layout as a face to show multiple modules on one side. | `editor.flip_card.faces.desc` |
| Card Faces | `editor.flip_card.faces.title` |

</details>

<details>
<summary><strong>Tabs module (editor)</strong> — 21 left</summary>

| English text | Key |
| --- | --- |
| Alignment | `editor.tabs_module.alignment.alignment` |
| Active Tab | `editor.tabs_module.colors.active` |
| Background | `editor.tabs_module.colors.background` |
| Customize the colors for your tabs. | `editor.tabs_module.colors.desc` |
| Icon | `editor.tabs_module.colors.icon` |
| Inactive Tab | `editor.tabs_module.colors.inactive` |
| Track & Icons | `editor.tabs_module.colors.other` |
| Text | `editor.tabs_module.colors.text` |
| Colors | `editor.tabs_module.colors.title` |
| Track | `editor.tabs_module.colors.track` |
| Choose where the tabs appear relative to the content. | `editor.tabs_module.position.desc` |
| Position | `editor.tabs_module.position.position` |
| Tab Position | `editor.tabs_module.position.title` |
| Control how tabs behave on smaller screens or when space is limited. | `editor.tabs_module.responsive.desc` |
| Mobile Breakpoint | `editor.tabs_module.responsive.mobile_breakpoint` |
| Screen width in pixels below which tabs collapse to icons only. | `editor.tabs_module.responsive.mobile_breakpoint_desc` |
| Icons Only on Mobile | `editor.tabs_module.responsive.mobile_icons_only` |
| Only show icons (hide text) on screens narrower than the breakpoint. Requires icons on tabs. | `editor.tabs_module.responsive.mobile_icons_only_desc` |
| Responsive | `editor.tabs_module.responsive.title` |
| Wrap Tabs | `editor.tabs_module.responsive.wrap_tabs` |
| Allow tabs to wrap to multiple lines instead of overflowing. | `editor.tabs_module.responsive.wrap_tabs_desc` |

</details>

<details>
<summary><strong>Scroll row (editor)</strong> — 17 left</summary>

| English text | Key |
| --- | --- |
| Show Scroll Arrows | `editor.scroll_row.appearance.arrows` |
| Overlay arrows for scrolling with a mouse. | `editor.scroll_row.appearance.arrows_desc` |
| Fade Edges | `editor.scroll_row.appearance.fade` |
| Fade out content at the row edges to hint at more items. | `editor.scroll_row.appearance.fade_desc` |
| Show Scrollbar | `editor.scroll_row.appearance.scrollbar` |
| Appearance | `editor.scroll_row.appearance.title` |
| Add modules in the layout builder to see them in this row | `editor.scroll_row.empty.add_modules` |
| All modules hidden by logic | `editor.scroll_row.empty.all_hidden` |
| No modules added yet | `editor.scroll_row.empty.no_modules` |
| Sizing and spacing of the items in the row. Widths under 100% let the next item peek in from the edge. | `editor.scroll_row.items.desc` |
| Gap Between Items | `editor.scroll_row.items.gap` |
| No Snap | `editor.scroll_row.items.no_snap` |
| Snap Alignment | `editor.scroll_row.items.snap` |
| Where items settle when scrolling stops. | `editor.scroll_row.items.snap_desc` |
| Items | `editor.scroll_row.items.title` |
| Item Width | `editor.scroll_row.items.width` |
| Percentage of the row (e.g. 42%) or a fixed width (e.g. 140px). | `editor.scroll_row.items.width_desc` |

</details>

<details>
<summary><strong>Sports (editor)</strong> — 15 left</summary>

| English text | Key |
| --- | --- |
| Detail Font Size | `editor.sports.detail_font_size` |
| Size of detail text (records, venue, etc.) in pixels | `editor.sports.detail_font_size_desc` |
| Background Logo Opacity | `editor.sports.logo_background_opacity` |
| Transparency of the watermark logos (1-20%) | `editor.sports.logo_background_opacity_desc` |
| Background Logo Size | `editor.sports.logo_background_size` |
| Size of the watermark logos in the background | `editor.sports.logo_background_size_desc` |
| BACKGROUND LOGO OPTIONS | `editor.sports.logo_bg_options` |
| Size of team logos in pixels | `editor.sports.logo_size_desc` |
| Size of score text in pixels | `editor.sports.score_font_size_desc` |
| Show Background Logos | `editor.sports.show_logo_background` |
| Display subtle watermark logos in the background | `editor.sports.show_logo_background_desc` |
| SIZE CONTROLS | `editor.sports.size_controls` |
| Size of team name text in pixels | `editor.sports.team_name_font_size_desc` |
| Text Color | `editor.sports.text_color` |
| Override the default text color for better readability | `editor.sports.text_color_desc` |

</details>

<details>
<summary><strong>Actions (editor)</strong> — 14 left</summary>

| English text | Key |
| --- | --- |
| Close Popup After Action | `editor.actions.close_popup_after_action` |
| When this module is inside a Popup, running its action (tap, hold, or double tap) also closes that popup. Has no effect outside a popup. | `editor.actions.close_popup_after_action_desc` |
| Confirm Action | `editor.actions.confirm_action` |
| Cancel Button Text | `editor.actions.confirm_action_cancel_text` |
| Text shown on the opt-out button. | `editor.actions.confirm_action_cancel_text_desc` |
| Confirm Button Text | `editor.actions.confirm_action_confirm_text` |
| Text shown on the opt-in button. | `editor.actions.confirm_action_confirm_text_desc` |
| When enabled, a confirmation dialog will appear before executing any action (tap, hold, or double tap). | `editor.actions.confirm_action_desc` |
| Show Cancel (opt-out) Button | `editor.actions.confirm_action_show_cancel_button` |
| Show or hide the button users use to back out of the action. | `editor.actions.confirm_action_show_cancel_button_desc` |
| Show Confirm (opt-in) Button | `editor.actions.confirm_action_show_confirm_button` |
| Show or hide the button users use to continue with the action. | `editor.actions.confirm_action_show_confirm_button_desc` |
| Open In Same Tab | `editor.actions.url_same_tab` |
| Replace the current page instead of opening a new browser tab. | `editor.actions.url_same_tab_desc` |

</details>

<details>
<summary><strong>Image (editor)</strong> — 14 left</summary>

| English text | Key |
| --- | --- |
| Aspect Ratio | `editor.image.aspect_ratio` |
| Set the aspect ratio of the image container. | `editor.image.aspect_ratio_desc` |
| Auto (use height setting) | `editor.image.aspect.auto` |
| Mobile (9:16) | `editor.image.aspect.mobile` |
| Photo (3:2) | `editor.image.aspect.photo` |
| Portrait (2:3) | `editor.image.aspect.portrait` |
| Square (1:1) | `editor.image.aspect.square` |
| Standard (4:3) | `editor.image.aspect.standard` |
| Ultrawide (21:9) | `editor.image.aspect.ultrawide` |
| Widescreen (16:9) | `editor.image.aspect.widescreen` |
| Image failed to load | `editor.image.load_error` |
| Rotation (°) | `editor.image.rotation` |
| Rotate the image clockwise (0-360 degrees). | `editor.image.rotation_desc` |
| Size & Display | `editor.image.size_title` |

</details>

<details>
<summary><strong>Slider (editor)</strong> — 13 left</summary>

| English text | Key |
| --- | --- |
| Auto Height | `editor.slider.auto_height` |
| Not available for vertical sliders. Vertical sliders scroll within the fixed Slider Height set below. | `editor.slider.auto_height_vertical_note` |
| Gap | `editor.slider.gap` |
| Fallback spacing between slides in pixels, used when Space Between is 0 | `editor.slider.gap_desc` |
| Modules | `editor.slider.modules_label` |
| Pages | `editor.slider.pages_label` |
| NAVIGATION ARROWS | `editor.slider.section_arrows` |
| AUTO-PLAY | `editor.slider.section_autoplay` |
| INTERACTION | `editor.slider.section_interaction` |
| SLIDER LAYOUT | `editor.slider.section_layout` |
| LINK CONFIGURATION | `editor.slider.section_link_config` |
| PAGINATION | `editor.slider.section_pagination` |
| TRANSITION & ANIMATION | `editor.slider.section_transition` |

</details>

<details>
<summary><strong>Modules (editor)</strong> — 12 left</summary>

| English text | Key |
| --- | --- |
| Banner Border Radius | `editor.modules.people.banner_border_radius` |
| Border Radius | `editor.modules.people.border_radius` |
| Leave empty to use friendly name | `editor.modules.people.custom_name_desc` |
| Data Area Height | `editor.modules.people.data_area_height` |
| Data Items Gap | `editor.modules.people.data_items_gap` |
| Display Options | `editor.modules.people.music_display` |
| Music Settings | `editor.modules.people.music_settings` |
| Configure music/media display options | `editor.modules.people.music_settings_desc` |
| Show Avatar | `editor.modules.people.show_avatar` |
| Show Battery Badge | `editor.modules.people.show_battery_badge` |
| Show Location Badge | `editor.modules.people.show_location_badge` |
| Visibility | `editor.modules.people.visibility` |

</details>

<details>
<summary><strong>Map (editor)</strong> — 11 left</summary>

| English text | Key |
| --- | --- |
| Google Maps | `editor.map.provider.google` |
| Full Screen Button | `editor.map.controls.show_fullscreen` |
| A button that opens the map full screen, with pan and zoom. | `editor.map.controls.show_fullscreen_desc` |
| Full screen | `editor.map.fullscreen` |
| Exit full screen | `editor.map.exit_fullscreen` |
| Manually set the map center coordinates. Leave empty to use first marker or auto-zoom. | `editor.map.center.desc` |
| Center Latitude | `editor.map.center.latitude` |
| Latitude coordinate for map center (-90 to 90) | `editor.map.center.latitude_desc` |
| Center Longitude | `editor.map.center.longitude` |
| Longitude coordinate for map center (-180 to 180) | `editor.map.center.longitude_desc` |
| Map Center | `editor.map.center.title` |

</details>

<details>
<summary><strong>Calendar (editor)</strong> — 10 left</summary>

| English text | Key |
| --- | --- |
| Add Calendar | `editor.calendar.add_calendar` |
| Advanced Options | `editor.calendar.advanced` |
| Configure refresh interval and event filtering. | `editor.calendar.advanced_desc` |
| Add calendar entities to display. Each calendar can have a custom color. | `editor.calendar.calendars_desc` |
| Calendar Entities | `editor.calendar.calendars_section` |
| Configure what information is shown for each event. | `editor.calendar.event_display_desc` |
| Styling | `editor.calendar.styling` |
| Customize colors, fonts, and spacing for the calendar display. | `editor.calendar.styling_desc` |
| View Configuration | `editor.calendar.view_config` |
| Configure the calendar view layout and date range. | `editor.calendar.view_config_desc` |

</details>

<details>
<summary><strong>Graphs (editor)</strong> — 10 left</summary>

| English text | Key |
| --- | --- |
| Chance of Rain | `editor.graphs.forecast.precip_probability` |
| UV Index | `editor.graphs.forecast.uv_index` |
| Use Fixed Y-Axis Scale | `editor.graphs.display.use_fixed_y_axis` |
| Set fixed min/max values instead of auto-scaling. Useful for consistent scales across multiple graphs or time periods. | `editor.graphs.display.use_fixed_y_axis_desc` |
| Maximum Value | `editor.graphs.display.y_axis_max` |
| Minimum Value | `editor.graphs.display.y_axis_min` |
| Limit Days | `editor.graphs.forecast_limit.days` |
| Days override hours | `editor.graphs.forecast_limit.days_desc` |
| Limit Hours | `editor.graphs.forecast_limit.hours` |
| 0 = show all | `editor.graphs.forecast_limit.hours_desc` |

</details>

<details>
<summary><strong>Auto entity list (editor)</strong> — 8 left</summary>

| English text | Key |
| --- | --- |
| Empty list link (optional) | `editor.auto_entity_list.empty_state_link` |
| Tapping the empty-list message navigates to this dashboard view or URL. | `editor.auto_entity_list.empty_state_link_desc` |
| Empty list text | `editor.auto_entity_list.empty_state_text` |
| Custom message shown when no entities match the filters. Leave blank for the default hint. | `editor.auto_entity_list.empty_state_text_desc` |
| Areas | `editor.auto_entity_list.include_areas` |
| Only entities assigned to these areas (directly or via their device). Empty = all areas. | `editor.auto_entity_list.include_areas_desc` |
| Labels | `editor.auto_entity_list.include_labels` |
| Only entities carrying these Home Assistant labels (on the entity, its device, or its area). Empty = all labels. | `editor.auto_entity_list.include_labels_desc` |

</details>

<details>
<summary><strong>Fields (editor)</strong> — 7 left</summary>

| English text | Key |
| --- | --- |
| Background Image Type | `editor.fields.card_background_image_type` |
| Content Overflow | `editor.fields.card_overflow` |
| How to handle content that extends beyond the card boundaries | `editor.fields.card_overflow_desc` |
| Auto | `editor.fields.overflow_auto` |
| Hidden (clip content) | `editor.fields.overflow_hidden` |
| Scroll | `editor.fields.overflow_scroll` |
| Visible (default) | `editor.fields.overflow_visible` |

</details>

<details>
<summary><strong>Tabs (editor)</strong> — 7 left</summary>

| English text | Key |
| --- | --- |
| Switch tabs when hovering over them instead of clicking. | `editor.tabs.behavior.switch_on_hover_desc` |
| Customize the appearance of the currently selected tab. | `editor.tabs.design.active_desc` |
| Customize the appearance of the content area below/beside the tabs. | `editor.tabs.design.content_desc` |
| Customize the appearance when hovering over inactive tabs. | `editor.tabs.design.hover_desc` |
| Customize the appearance of tabs that are not selected. | `editor.tabs.design.inactive_desc` |
| No modules added. Add modules to this section in the Layout tab. | `editor.tabs.preview.no_modules` |
| Manage your tab sections. Drag to reorder, click to edit titles. | `editor.tabs.sections.desc` |

</details>

<details>
<summary><strong>Animated weather (editor)</strong> — 6 left</summary>

| English text | Key |
| --- | --- |
| 0–32px | `editor.animated_weather.left_column_gap_desc` |
| 0–32px | `editor.animated_weather.right_column_gap_desc` |
| 0–300px | `editor.animated_weather.icon_size_desc` |
| Select a weather entity to drive the animated background and forecast display. | `editor.animated_weather.entity_desc` |
| Weather Station Sensors | `editor.animated_weather.station_section` |
| Optional. Use your own weather station for the current values. The animated icon and high/low still come from the weather entity. New items like Feels Like and UV Index appear in the Left Column once their sensor is set. | `editor.animated_weather.station_section_desc` |

</details>

<details>
<summary><strong>Button (editor)</strong> — 6 left</summary>

| English text | Key |
| --- | --- |
| Neumorphic | `editor.button.styles.neumorphic` |
| Configure what happens when users tap, hold, or double-tap this button. | `editor.button.actions.desc` |
| Set up button actions | `editor.button.actions.setup` |
| Button Actions | `editor.button.actions.title` |
| Icon Size | `editor.button.icon_size` |
| Size of the icon in pixels | `editor.button.icon_size_desc` |

</details>

<details>
<summary><strong>Cover (editor)</strong> — 6 left</summary>

| English text | Key |
| --- | --- |
| Icon | `editor.cover.icon` |
| Leave empty to use the entity icon | `editor.cover.icon_desc` |
| Name | `editor.cover.name` |
| Leave empty to use the entity name | `editor.cover.name_desc` |
| Optional overrides for the entity name and icon. | `editor.cover.overrides_desc` |
| Name & Icon | `editor.cover.overrides_section` |

</details>

<details>
<summary><strong>Custom variables (editor)</strong> — 6 left</summary>

| English text | Key |
| --- | --- |
| my_variable_name | `editor.custom_variables.variable_name_placeholder` |
| Add card variable | `editor.custom_variables.add_card_variable` |
| Variables that apply only to this card. Use them in templates with {{ $variable_name }}. | `editor.custom_variables.card_only_description` |
| Variables that apply only to this card. For shared variables used across cards, use the Ultra Card Hub → Variables tab in the sidebar. | `editor.custom_variables.card_section_description` |
| Add a variable that applies only to this card, or use the Ultra Card Hub for shared variables. | `editor.custom_variables.empty_card_description` |
| No Card Variables | `editor.custom_variables.empty_card_title` |

</details>

<details>
<summary><strong>Text (editor)</strong> — 6 left</summary>

| English text | Key |
| --- | --- |
| Icon Size | `editor.text.icon_size` |
| Template Cheatsheet | `editor.text.template_cheatsheet` |
| Text Size | `editor.text.text_size` |
| Rich text is hidden while Unified Template Mode is on. Turn it off to edit static content, or use the unified template JSON for dynamic text. | `editor.text.unified_replaces_content` |
| Return JSON with content, color, and optional container_background_color. Plain Jinja strings are treated as dynamic text. HTML tags in the output are shown as text, so style it with color rather than markup. | `editor.text.unified_template_section.desc` |
| Template Mode | `editor.text.unified_template_section.toggle` |

</details>

<details>
<summary><strong>Toggle (editor)</strong> — 6 left</summary>

| English text | Key |
| --- | --- |
| Create Toggle Points | `editor.toggle.create_toggle_points` |
| QUICK SETUP | `editor.toggle.quick_setup` |
| Automatically create toggle points based on an entity type (replaces existing points) | `editor.toggle.quick_setup_desc` |
| Select Entity | `editor.toggle.quick_setup_entity` |
| Choose an entity, then click "Create Toggle Points" below to auto-generate points based on the entity type | `editor.toggle.quick_setup_entity_desc` |
| This will replace all existing toggle points with auto-generated ones based on the entity type. | `editor.toggle.quick_setup_warning` |

</details>

<details>
<summary><strong>Markdown (editor)</strong> — 5 left</summary>

| English text | Key |
| --- | --- |
| HTML Support | `editor.markdown.html.title` |
| Template Cheatsheet | `editor.markdown.template_cheatsheet` |
| Static markdown editor is hidden while Unified Template Mode is on. Turn it off to edit markdown here, or supply markdown in the unified template `content` field. | `editor.markdown.unified_replaces_editor` |
| Return JSON with a `content` string (markdown). Optional `color` and `container_background_color`. | `editor.markdown.unified_template_section.desc` |
| Template Mode | `editor.markdown.unified_template_section.toggle` |

</details>

<details>
<summary><strong>Spinbox (editor)</strong> — 5 left</summary>

| English text | Key |
| --- | --- |
| Neumorphic | `editor.spinbox.styles.neumorphic` |
| Decrease | `editor.spinbox.decrease` |
| Increase | `editor.spinbox.increase` |
| Configure the numeric range, step size, and default value. | `editor.spinbox.value_section.desc` |
| Value Configuration | `editor.spinbox.value_section.title` |

</details>

<details>
<summary><strong>Appearance (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Template Cheatsheet | `editor.appearance.template_cheatsheet` |
| Enable template mode | `editor.appearance.template_mode_enable` |
| Use Jinja2 templates to control card background, border, shadow, and padding dynamically. Return a simple color string for background-only, or a JSON object for multiple card appearance properties. | `editor.appearance.unified_template_section.desc` |
| Appearance Template Mode | `editor.appearance.unified_template_section.title` |

</details>

<details>
<summary><strong>Boolean input (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Alignment | `editor.boolean_input.content_alignment` |
| Align the control row inside the module | `editor.boolean_input.content_alignment_desc` |
| Show Entity Name | `editor.boolean_input.show_entity_name` |
| Display the entity name beside the control (switch/checkbox) | `editor.boolean_input.show_entity_name_desc` |

</details>

<details>
<summary><strong>Dog duty (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| LLM Vision | `editor.dog_duty.provider_section` |
| X | `editor.dog_duty.marker_x` |
| Emoji | `editor.dog_duty.marker_emoji` |
| Dog Duty | `editor.dog_duty.default_title` |

</details>

<details>
<summary><strong>Dynamic list (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Direction | `editor.dynamic_list.direction` |
| Gap (px) | `editor.dynamic_list.gap` |
| Space between generated modules in pixels | `editor.dynamic_list.gap_desc` |
| Template | `editor.dynamic_list.template_label` |

</details>

<details>
<summary><strong>Gauge (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Select a sensor or input number entity whose value will be displayed on the gauge. | `editor.gauge.entity_desc` |
| Template cheatsheet | `editor.gauge.unified_template.cheatsheet` |
| Use Jinja2 templates to dynamically set gauge value and gauge_color. | `editor.gauge.unified_template.desc` |
| Template Mode | `editor.gauge.unified_template.toggle` |

</details>

<details>
<summary><strong>Vertical (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Horizontal Alignment | `editor.vertical.alignment.horizontal` |
| Choose how items are aligned horizontally within the column. | `editor.vertical.alignment.horizontal_desc` |
| All modules hidden by logic | `editor.vertical.empty.all_hidden` |
| Every module in this layout is hidden by its display conditions | `editor.vertical.empty.all_hidden_desc` |

</details>

<details>
<summary><strong>Battery fleet (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| Battery Fleet | `editor.battery_fleet.default_title` |
| 6mo+ | `editor.battery_fleet.eta_beyond_short` |
| h | `editor.battery_fleet.unit_hours` |

</details>

<details>
<summary><strong>Design (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| Clip-path | `editor.design.clip_path` |
| Google Fonts | `editor.design.google_fonts` |
| Z-Index | `editor.design.z_index` |

</details>

<details>
<summary><strong>Laundry tracker (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| d | `editor.laundry_tracker.unit_day` |
| h | `editor.laundry_tracker.unit_hour` |
| m | `editor.laundry_tracker.unit_minute` |

</details>

<details>
<summary><strong>Pagebreak (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| Page breaks appear as a slim divider in the editor and are invisible on the dashboard. When used inside a Slider Layout, they separate content into different slides. All modules before a page break belong to one page,… | `editor.pagebreak.info_text` |
| How Page Breaks Work: | `editor.pagebreak.info_title` |
| Page Break | `editor.pagebreak.preview_label` |

</details>

<details>
<summary><strong>Printer 3d (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| OctoPrint | `editor.printer_3d.source_octoprint` |
| Moonraker | `editor.printer_3d.source_moonraker` |
| PrusaLink | `editor.printer_3d.source_prusalink` |

</details>

<details>
<summary><strong>Smart (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| Smart Cards | `editor.smart.title` |
| Home Assistant Assist | `editor.smart.connector_ha_assist` |
| AI Task | `editor.smart.ai_task` |

</details>

<details>
<summary><strong>Timer (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| Preset durations (minutes) | `editor.timer.preset_durations` |
| Quick-start buttons shown when the timer is idle. | `editor.timer.preset_durations_desc` |
| Minutes (e.g. 10) | `editor.timer.preset_placeholder` |

</details>

<details>
<summary><strong>Vehicle maintenance (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| d | `editor.vehicle_maintenance.unit_days_short` |
| km | `editor.vehicle_maintenance.unit_km` |
| mi | `editor.vehicle_maintenance.unit_mi` |

</details>

<details>
<summary><strong>Battery monitor (editor)</strong> — 2 left</summary>

| English text | Key |
| --- | --- |
| Hide when empty | `editor.battery_monitor.hide_when_empty` |
| On the dashboard, hide this module when no batteries match. A column, row or card left empty hides too. | `editor.battery_monitor.hide_when_empty_desc` |

</details>

<details>
<summary><strong>Climate (editor)</strong> — 2 left</summary>

| English text | Key |
| --- | --- |
| Decrease target temperature | `editor.climate.decrease_temp` |
| Increase target temperature | `editor.climate.increase_temp` |

</details>

<details>
<summary><strong>Fan (editor)</strong> — 2 left</summary>

| English text | Key |
| --- | --- |
| Decrease speed | `editor.fan.decrease_speed` |
| Increase speed | `editor.fan.increase_speed` |

</details>

<details>
<summary><strong>Horizontal (editor)</strong> — 2 left</summary>

| English text | Key |
| --- | --- |
| All modules hidden by logic | `editor.horizontal.empty.all_hidden` |
| Every module in this layout is hidden by its display conditions | `editor.horizontal.empty.all_hidden_desc` |

</details>

<details>
<summary><strong>Vampire power (editor)</strong> — 2 left</summary>

| English text | Key |
| --- | --- |
| W | `editor.vampire_power.unit_watts` |
| W | `editor.vampire_power.watt_symbol` |

</details>

<details>
<summary><strong>About (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Documentation in Ultra Card Hub | `editor.about.hub_docs` |

</details>

<details>
<summary><strong>Bambu (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Bambu Lab | `editor.bambu.title_default` |

</details>

<details>
<summary><strong>Common (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Default | `editor.common.default` |

</details>

<details>
<summary><strong>Editor</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Pro Feature | `editor.pro_feature` |

</details>

<details>
<summary><strong>Layout extra (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Open module documentation in Hub | `editor.layout_extra.module_docs` |

</details>

<details>
<summary><strong>Living canvas (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Living Canvas | `editor.living_canvas.title` |

</details>

<details>
<summary><strong>Lock (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| PIN | `editor.lock.pin_field` |

</details>

<details>
<summary><strong>Plant care (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Plant Care | `editor.plant_care.default_title` |

</details>

<details>
<summary><strong>Pro (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Badge of Honor is an exclusive Pro feature that displays a beautiful animated badge celebrating your Ultra Card Pro membership. | `editor.pro.badge_description` |

</details>

<details>
<summary><strong>Qr code (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Spotify | `editor.qr_code.type_spotify` |

</details>

<details>
<summary><strong>Ultra Card Hub</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Hub | `hub.subtitle` |

</details>

<details>
<summary><strong>Unifi (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| UniFi Network | `editor.unifi.title_default` |

</details>
