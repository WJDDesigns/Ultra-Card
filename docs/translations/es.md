# 🇪🇸 Spanish translation status

> This page is generated automatically from the translation files. Don't edit it by hand;
> it refreshes itself after every change to the `main` branch.

**43.8% translated** — 3,566 of 8,137 entries. **4,571 still in English.**

🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜

## How to translate these

1. Open [`src/translations/es.json`](https://github.com/WJDDesigns/Ultra-Card/edit/main/src/translations/es.json) on GitHub (you'll be asked to sign in and fork the project the first time; that's automatic).
2. Pick a section below. Every entry in it is still in English in your file.
3. Press <kbd>Ctrl</kbd>+<kbd>F</kbd> (<kbd>⌘</kbd>+<kbd>F</kbd> on a Mac) and search for the **English text**. Because the entry hasn't been translated yet, the English text is exactly what's in your file.
4. Replace the English text between the quotes with your translation. Leave the part before the colon, and anything in `{curly braces}`, as it is.
5. Click **Commit changes…** and then **Propose changes** / **Create pull request**. That's it, the maintainer takes it from there.

More help: [translation guide](../../CONTRIBUTING_TRANSLATIONS.md) · [all languages](../../TRANSLATIONS.md)

If the English word really is right in your language (a brand name, or a word you also use), just leave it. It will stay on this list, and that's fine.

## Still in English (4,571)

Biggest sections first. Click a section to open it.

<details>
<summary><strong>Themes (ultra card hub)</strong> — 173 left</summary>

| English text | Key |
| --- | --- |
| Themes set the look of every Ultra Card at once: surface (glass, soft, flat), corner radius, shadows and the default style of each module. Pick a global default here, override per card in Card Settings > Appearance, a… | `hub.themes.blurb` |
| Global default | `hub.themes.global_title` |
| Used by every Ultra Card that has no theme of its own. Stored in this browser and synced through Ultra Card Connect when available. | `hub.themes.global_desc` |
| Let themes paint the dashboard background | `hub.themes.paint_page` |
| Themes such as Neumorphic and Wood set the view behind their cards so shadows and materials read correctly. A background set on the view in the dashboard config still wins. | `hub.themes.paint_page_desc` |
| Home Assistant default | `hub.themes.sections_width_default` |
| 500px per column, centred | `hub.themes.sections_width_default_hint` |
| Full width | `hub.themes.sections_width_full` |
| Custom | `hub.themes.sections_width_custom` |
| Pick a max width per column | `hub.themes.sections_width_custom_hint` |
| Max width per column (px) | `hub.themes.sections_column_width` |
| Column gap and side padding (px) | `hub.themes.sections_gap` |
| HA default (32) | `hub.themes.sections_gap_placeholder` |
| Built-in | `hub.themes.filter_builtin` |
| Mine | `hub.themes.filter_local` |
| Official | `hub.themes.filter_official` |
| Community | `hub.themes.filter_community` |
| New theme | `hub.themes.new_theme` |
| Import JSON | `hub.themes.import` |
| Edit | `hub.themes.edit` |
| Duplicate | `hub.themes.duplicate` |
| Export | `hub.themes.export` |
| Delete | `hub.themes.delete` |
| Set as global default | `hub.themes.set_global` |
| Global default | `hub.themes.is_global` |
| Apply to a dashboard | `hub.themes.apply_title` |
| Write a theme onto every Ultra Card of a dashboard. Cards you already gave their own theme are overwritten. The previous configuration is kept so you can undo the last apply. | `hub.themes.apply_desc` |
| Theme | `hub.themes.apply_theme` |
| Follow global default (clear per-card theme) | `hub.themes.apply_follow_global` |
| Apply to all Ultra Cards | `hub.themes.apply_button` |
| Apply theme to dashboard? | `hub.themes.apply_confirm_title` |
| This rewrites uc_theme on every Ultra Card in "{dashboard}". Continue? | `hub.themes.apply_confirm` |
| Updated {count} of {seen} Ultra Cards | `hub.themes.apply_done` |
| No Ultra Cards needed changing | `hub.themes.apply_none` |
| Could not update dashboard | `hub.themes.apply_failed` |
| Undo last apply | `hub.themes.undo` |
| Restored previous dashboard configuration | `hub.themes.undo_done` |
| YAML mode (read-only) | `hub.themes.yaml_mode` |
| Delete theme? | `hub.themes.delete_confirm_title` |
| "{name}" will be removed from this browser. Cards using it fall back to the global default. | `hub.themes.delete_confirm` |
| Import theme | `hub.themes.import_title` |
| Import | `hub.themes.import_button` |
| That does not look like a valid Ultra Card theme | `hub.themes.import_invalid` |
| Imported "{name}" | `hub.themes.import_done` |
| Imported with warnings: {warnings} | `hub.themes.import_warnings` |
| Theme JSON copied to clipboard | `hub.themes.export_copied` |
| Saved "{name}" | `hub.themes.saved` |
| Deleted "{name}" | `hub.themes.deleted` |
| Global default: {name} | `hub.themes.global_set` |
| New theme | `hub.themes.editor_title_new` |
| Edit theme | `hub.themes.editor_title_edit` |
| Basics | `hub.themes.editor_basics` |
| Surface & shape | `hub.themes.editor_tokens` |
| Card chrome | `hub.themes.editor_card` |
| Module defaults | `hub.themes.editor_modules` |
| Custom CSS | `hub.themes.editor_css` |
| Name | `hub.themes.editor_name` |
| Description | `hub.themes.editor_description` |
| Author | `hub.themes.editor_author` |
| Icon (mdi:...) | `hub.themes.editor_icon` |
| Surface | `hub.themes.editor_surface` |
| Card radius (px) | `hub.themes.editor_radius` |
| Control radius (px) | `hub.themes.editor_radius_sm` |
| Glass blur (px) | `hub.themes.editor_blur` |
| Border width (px) | `hub.themes.editor_border_width` |
| Border colour | `hub.themes.editor_border_color` |
| Shadow (CSS box-shadow) | `hub.themes.editor_shadow` |
| Density | `hub.themes.editor_density` |
| Accent colour | `hub.themes.editor_accent` |
| Font family | `hub.themes.editor_font` |
| Leave a field empty to let the card fall back to Home Assistant's own variables. | `hub.themes.editor_card_hint` |
| Background | `hub.themes.editor_card_background` |
| Padding (px) | `hub.themes.editor_card_padding` |
| Card shadow | `hub.themes.editor_card_shadow` |
| Module default | `hub.themes.editor_module_inherit` |
| Theme surface | `hub.themes.editor_module_recipe` |
| Surfaces | `hub.themes.editor_recipes` |
| How controls, tracks, fills and inner panes are painted for modules that follow the theme. Leave on "From surface" to derive from the surface above; Module defaults below can still override one module. | `hub.themes.editor_recipes_hint` |
| From surface | `hub.themes.editor_recipe_from_surface` |
| Controls (buttons, chips) | `hub.themes.editor_recipe_control` |
| Tracks (bars, sliders) | `hub.themes.editor_recipe_track` |
| Fills (bar and slider fill) | `hub.themes.editor_recipe_fill` |
| Panes (rows, tiles) | `hub.themes.editor_recipe_pane` |
| Save theme | `hub.themes.editor_save` |
| Cancel | `hub.themes.editor_cancel` |
| Preview | `hub.themes.editor_preview` |
| Give the theme a name first | `hub.themes.editor_name_required` |
| Desaturate whole card (0 = colour, 1 = monochrome) | `hub.themes.editor_grayscale` |
| Layers | `hub.themes.editor_layers` |
| The page behind the card and the panes modules draw inside it (rows, tiles, chips, tracks). Leave empty to derive panes from the surface and leave the page to Home Assistant. | `hub.themes.editor_layers_hint` |
| Page background (view behind the card) | `hub.themes.editor_page_background` |
| Pane background | `hub.themes.editor_pane_background` |
| Pane border | `hub.themes.editor_pane_border` |
| Pane shadow | `hub.themes.editor_pane_shadow` |
| Colour filter (CSS filter chain, overrides desaturate) | `hub.themes.editor_color_filter` |
| Colours | `hub.themes.editor_palette` |
| Primary | `hub.themes.editor_palette_primary` |
| Accent | `hub.themes.editor_palette_accent` |
| Card background | `hub.themes.editor_palette_card_bg` |
| Text | `hub.themes.editor_palette_text` |
| Secondary text | `hub.themes.editor_palette_text_secondary` |
| Divider | `hub.themes.editor_palette_divider` |
| Text on primary | `hub.themes.editor_palette_on_primary` |
| From HA theme | `hub.themes.ha_import` |
| Import from a Home Assistant theme | `hub.themes.ha_import_title` |
| Reads the card colours, radius, shadow and font from an installed HA theme and opens the result in the editor. Add a surface and module presets, then save. | `hub.themes.ha_import_desc` |
| HA theme | `hub.themes.ha_import_theme` |
| Mode | `hub.themes.ha_import_mode` |
| Current (follow HA dark mode) | `hub.themes.ha_import_mode_auto` |
| Light | `hub.themes.ha_import_mode_light` |
| Dark | `hub.themes.ha_import_mode_dark` |
| Open in editor | `hub.themes.ha_import_button` |
| Mapped {count} values from "{name}" | `hub.themes.ha_import_mapped` |
| "{name}" sets no card variables; starting from defaults | `hub.themes.ha_import_nothing` |
| Share to catalog | `hub.themes.share` |
| Refresh | `hub.themes.catalog_refresh` |
| Loading catalog… | `hub.themes.catalog_loading` |
| Could not reach ultracard.io | `hub.themes.catalog_error` |
| Most installed | `hub.themes.sort_downloads` |
| Newest | `hub.themes.sort_date` |
| Name | `hub.themes.sort_title` |
| Installs | `hub.themes.downloads` |
| Install | `hub.themes.install` |
| Update | `hub.themes.update` |
| Installed | `hub.themes.installed` |
| Installed "{name}" | `hub.themes.installed_done` |
| Install "{name}"? | `hub.themes.install_confirm_title` |
| Before this theme lands on your cards, know that it: | `hub.themes.install_confirm` |
| Loading your themes… | `hub.themes.mine_loading` |
| Theme authoring is available to Home Assistant administrators only. Sign in as an admin via Ultra Card Connect. | `hub.themes.mine_admin_only` |
| Nothing shared yet | `hub.themes.mine_empty_title` |
| Sign in | `hub.themes.sign_in` |
| In review | `hub.themes.status_pending` |
| Update in review | `hub.themes.status_revision` |
| Published | `hub.themes.status_approved` |
| Changes requested | `hub.themes.status_changes` |
| Rejected | `hub.themes.status_rejected` |
| Withdraw | `hub.themes.withdraw` |
| Withdraw submission? | `hub.themes.withdraw_confirm_title` |
| "{name}" is taken out of the review queue. You can edit and resubmit later. | `hub.themes.withdraw_confirm` |
| Withdrew "{name}" | `hub.themes.withdrawn` |
| Delete from ultracard.io? | `hub.themes.delete_submission_title` |
| "{name}" is removed from the catalog for everyone. This cannot be undone. | `hub.themes.delete_submission_confirm` |
| Themes view | `hub.themes.view_switch` |
| Themes | `hub.themes.view_browse` |
| My Themes | `hub.themes.view_mine` |
| set the look of every Ultra Card at once: surface, corners, shadows, colours and each module’s default style. Pick a global default, install more from the catalog, and override per card or per module whenever you like. | `hub.themes.browse_blurb` |
| holds the themes you created, imported or installed in this browser, plus anything you shared with the catalog and where it is in review. | `hub.themes.mine_blurb` |
| Search themes… | `hub.themes.search` |
| Nothing matches "{query}" | `hub.themes.search_empty` |
| Default themes | `hub.themes.default_title` |
| Built into Ultra Card and maintained by the Ultra Card team. Official catalog themes install into your library with one tap. | `hub.themes.default_desc` |
| Community themes | `hub.themes.community_title` |
| Made by Ultra Card members with the theme builder on ultracard.io. Rate the ones you install to help others find the good stuff. | `hub.themes.community_desc` |
| No themes of your own yet | `hub.themes.library_empty_title` |
| Create one here, import a JSON file, or install a theme from the catalog and it shows up in this list. | `hub.themes.library_empty` |
| Browse themes | `hub.themes.browse_catalog` |
| Top rated | `hub.themes.sort_rating` |
| Rating | `hub.themes.rating` |
| Rate "{name}" | `hub.themes.rate_title` |
| Thanks for rating! | `hub.themes.rate_thanks` |
| No ratings yet | `hub.themes.rate_none` |
| You cannot rate your own theme | `hub.themes.rate_own` |
| You rated this {stars}/5. Tap to change. | `hub.themes.rate_yours` |
| you: {stars} | `hub.themes.rate_you` |
| Tap to rate | `hub.themes.rate_tap` |
| Sign in to rate | `hub.themes.rate_sign_in` |
| View on ultracard.io | `hub.themes.view_on_site` |
| Open theme builder | `hub.themes.open_builder` |
| Theme builder | `hub.themes.open_builder_short` |
| Open in theme builder | `hub.themes.open_in_builder` |
| Full theme builder with live previews on ultracard.io | `hub.themes.builder_title` |
| Want to make your own? The theme builder on ultracard.io has live previews for every control, and finished themes sync straight back here. | `hub.themes.builder_hint` |

</details>

<details>
<summary><strong>Vehicle maintenance (editor)</strong> — 161 left</summary>

| English text | Key |
| --- | --- |
| Add from presets | `editor.vehicle_maintenance.add_preset` |
| Add service | `editor.vehicle_maintenance.add_service` |
| Advanced | `editor.vehicle_maintenance.advanced` |
| Charge level | `editor.vehicle_maintenance.battery_entity` |
| Optional. For EVs and plug-in hybrids, shown alongside or instead of fuel. | `editor.vehicle_maintenance.battery_entity_desc` |
| Cancel | `editor.vehicle_maintenance.cancel` |
| Card background | `editor.vehicle_maintenance.card_background_color` |
| Charge | `editor.vehicle_maintenance.charge` |
| Colors | `editor.vehicle_maintenance.colors_section` |
| Leave blank to follow your Home Assistant theme. | `editor.vehicle_maintenance.colors_section_desc` |
| Add a service | `editor.vehicle_maintenance.config_needed` |
| Add at least one service interval in the General tab | `editor.vehicle_maintenance.config_needed_desc` |
| {amount} per {unit} | `editor.vehicle_maintenance.cost_per_distance` |
| Currency symbol | `editor.vehicle_maintenance.currency_symbol` |
| Prefixed to every cost shown on the card. | `editor.vehicle_maintenance.currency_symbol_desc` |
| My Vehicle | `editor.vehicle_maintenance.default_name` |
| Delete | `editor.vehicle_maintenance.delete_confirm` |
| This permanently removes the entry from your service history. | `editor.vehicle_maintenance.delete_log_message` |
| Delete log entry? | `editor.vehicle_maintenance.delete_log_title` |
| This removes the service and its interval from the card. Entries already written to the service log are kept. | `editor.vehicle_maintenance.delete_message` |
| Delete service | `editor.vehicle_maintenance.delete_service` |
| Delete service? | `editor.vehicle_maintenance.delete_title` |
| Display | `editor.vehicle_maintenance.display_section` |
| Pick a layout and choose which parts of the card are visible. | `editor.vehicle_maintenance.display_section_desc` |
| Distance unit | `editor.vehicle_maintenance.distance_unit` |
| Unit used for every interval and reading. Readings from a sensor in the other unit are converted automatically. | `editor.vehicle_maintenance.distance_unit_desc` |
| in {value} {unit} | `editor.vehicle_maintenance.due_in_distance` |
| in {value} | `editor.vehicle_maintenance.due_in_time` |
| overdue by {value} {unit} | `editor.vehicle_maintenance.due_overdue_distance` |
| overdue by {value} | `editor.vehicle_maintenance.due_overdue_time` |
| Due soon | `editor.vehicle_maintenance.due_soon_color` |
| Warn within (time) | `editor.vehicle_maintenance.due_soon_days` |
| Remaining days at which a service turns amber. | `editor.vehicle_maintenance.due_soon_days_desc` |
| Warn within | `editor.vehicle_maintenance.due_soon_distance` |
| Remaining distance at which a service turns amber. | `editor.vehicle_maintenance.due_soon_distance_desc` |
| due today | `editor.vehicle_maintenance.due_today` |
| No history yet | `editor.vehicle_maintenance.due_unknown` |
| 1 day | `editor.vehicle_maintenance.duration_day` |
| {value} days | `editor.vehicle_maintenance.duration_days` |
| 1 month | `editor.vehicle_maintenance.duration_month` |
| {value} months | `editor.vehicle_maintenance.duration_months` |
| 1 week | `editor.vehicle_maintenance.duration_week` |
| {value} weeks | `editor.vehicle_maintenance.duration_weeks` |
| Typical cost | `editor.vehicle_maintenance.estimated_cost` |
| Used as the default amount when you log this service, and to forecast upcoming spend. | `editor.vehicle_maintenance.estimated_cost_desc` |
| Fuel | `editor.vehicle_maintenance.fuel` |
| Fuel level | `editor.vehicle_maintenance.fuel_entity` |
| Optional. A percentage sensor renders as a bar; anything else is shown as a value. | `editor.vehicle_maintenance.fuel_entity_desc` |
| Tracking by time only. Add an odometer entity to unlock distance intervals and mileage-stamped log entries. | `editor.vehicle_maintenance.hint_no_odometer` |
| The odometer sensor is unavailable, so distance intervals are paused. Time-based tracking is still running. | `editor.vehicle_maintenance.hint_odometer_unavailable` |
| Distance interval | `editor.vehicle_maintenance.interval_distance` |
| How far between services, in {unit}. Use 0 for time-only services like registration. | `editor.vehicle_maintenance.interval_distance_desc` |
| every {value} | `editor.vehicle_maintenance.interval_every` |
| Time interval | `editor.vehicle_maintenance.interval_months` |
| Months between services. Use 0 for distance-only services like tire rotation. | `editor.vehicle_maintenance.interval_months_desc` |
| No interval set | `editor.vehicle_maintenance.interval_none` |
| Date of last service | `editor.vehicle_maintenance.last_date` |
| Odometer at last service | `editor.vehicle_maintenance.last_distance` |
| Leave at 0 if you do not know it. Logging a service overwrites this with the reading at the time. | `editor.vehicle_maintenance.last_distance_desc` |
| Layout | `editor.vehicle_maintenance.layout` |
| Compact | `editor.vehicle_maintenance.layout_compact` |
| Hero leads with the vehicle and the next service. List shows every service. Compact is a single summary line. | `editor.vehicle_maintenance.layout_desc` |
| Hero | `editor.vehicle_maintenance.layout_hero` |
| List | `editor.vehicle_maintenance.layout_list` |
| {count} entries | `editor.vehicle_maintenance.log_count` |
| No services logged yet. Use "Mark serviced" on a service to start your history. | `editor.vehicle_maintenance.log_empty` |
| Could not read the service log from that to-do list. | `editor.vehicle_maintenance.log_error` |
| Service log entries | `editor.vehicle_maintenance.log_limit` |
| How many recent entries the card displays. Older entries stay in the to-do list. | `editor.vehicle_maintenance.log_limit_desc` |
| Pick a to-do list in the General tab to keep a permanent service history with costs. | `editor.vehicle_maintenance.log_no_storage` |
| Show all {count} | `editor.vehicle_maintenance.log_show_all` |
| Show less | `editor.vehicle_maintenance.log_show_less` |
| Could not write to the service log. | `editor.vehicle_maintenance.log_write_failed` |
| Log service | `editor.vehicle_maintenance.mark_confirm` |
| Logs {name} as done today. No odometer is configured, so no reading is stored. | `editor.vehicle_maintenance.mark_message_no_odometer` |
| Logs {name} as done today at {odometer} {unit}. | `editor.vehicle_maintenance.mark_message_odometer` |
| Choose a storage list in the General tab to record services from the card | `editor.vehicle_maintenance.mark_needs_list` |
| Mark serviced now | `editor.vehicle_maintenance.mark_serviced` |
| Mark as serviced? | `editor.vehicle_maintenance.mark_title` |
| Logging\u2026 | `editor.vehicle_maintenance.marking` |
| Move down | `editor.vehicle_maintenance.move_down` |
| Move up | `editor.vehicle_maintenance.move_up` |
| New service | `editor.vehicle_maintenance.new_service` |
| Next service | `editor.vehicle_maintenance.next_service` |
| No reading | `editor.vehicle_maintenance.no_reading` |
| Notes | `editor.vehicle_maintenance.notes` |
| Part numbers, oil weight, the shop you use. | `editor.vehicle_maintenance.notes_desc` |
| Odometer | `editor.vehicle_maintenance.odometer` |
| converted from {unit} | `editor.vehicle_maintenance.odometer_converted` |
| Odometer | `editor.vehicle_maintenance.odometer_entity` |
| A sensor from your car integration, an OBD dongle, or an input_number you update yourself. Leave blank to track services by time only. | `editor.vehicle_maintenance.odometer_entity_desc` |
| Odometer offset | `editor.vehicle_maintenance.odometer_offset` |
| offset {value} applied | `editor.vehicle_maintenance.odometer_offset_applied` |
| sensor reports {unit} | `editor.vehicle_maintenance.odometer_source_unit` |
| no unit on the sensor, assuming {unit} | `editor.vehicle_maintenance.odometer_unit_assumed` |
| That entity is not reporting a number right now. Distance tracking stays off until it does; time intervals keep working. | `editor.vehicle_maintenance.odometer_unreadable` |
| On schedule | `editor.vehicle_maintenance.ok_color` |
| Overdue | `editor.vehicle_maintenance.overdue_color` |
| Air Filter | `editor.vehicle_maintenance.preset_air_filter` |
| Battery Check | `editor.vehicle_maintenance.preset_battery` |
| Brake Inspection | `editor.vehicle_maintenance.preset_brakes` |
| Cabin Filter | `editor.vehicle_maintenance.preset_cabin_filter` |
| Coolant Flush | `editor.vehicle_maintenance.preset_coolant` |
| Safety Inspection | `editor.vehicle_maintenance.preset_inspection` |
| Oil Change | `editor.vehicle_maintenance.preset_oil` |
| Registration | `editor.vehicle_maintenance.preset_registration` |
| Spark Plugs | `editor.vehicle_maintenance.preset_spark_plugs` |
| Tire Rotation | `editor.vehicle_maintenance.preset_tires` |
| Transmission Fluid | `editor.vehicle_maintenance.preset_transmission` |
| Wiper Blades | `editor.vehicle_maintenance.preset_wipers` |
| Typical intervals you can adjust after adding. Distances are converted when your unit is kilometers. | `editor.vehicle_maintenance.presets_hint` |
| About {days} days away at {perDay} per day, based on {window} days of history. | `editor.vehicle_maintenance.projection` |
| Tracking from the service log: last done {detail}. This overrides the two fields above. | `editor.vehicle_maintenance.row_from_log` |
| Secondary text | `editor.vehicle_maintenance.secondary_text_color` |
| Icon | `editor.vehicle_maintenance.service_icon` |
| Service log | `editor.vehicle_maintenance.service_log` |
| Name | `editor.vehicle_maintenance.service_name` |
| No services yet. Add one below, or start from a preset. | `editor.vehicle_maintenance.services_empty` |
| Services | `editor.vehicle_maintenance.services_section` |
| Each service is due on whichever comes first: distance or time. Set an interval to 0 to switch that axis off. | `editor.vehicle_maintenance.services_section_desc` |
| Show costs | `editor.vehicle_maintenance.show_costs` |
| Adds amounts to log entries plus a total spend figure. | `editor.vehicle_maintenance.show_costs_desc` |
| Show fuel and charge | `editor.vehicle_maintenance.show_fuel` |
| Show next service due | `editor.vehicle_maintenance.show_next_service` |
| Show odometer | `editor.vehicle_maintenance.show_odometer` |
| Show progress bars | `editor.vehicle_maintenance.show_progress_bars` |
| Show service log | `editor.vehicle_maintenance.show_service_log` |
| Show title | `editor.vehicle_maintenance.show_title` |
| Show vehicle photo | `editor.vehicle_maintenance.show_vehicle_image` |
| Service log storage | `editor.vehicle_maintenance.storage_section` |
| Service history is stored in a Home Assistant to-do list so it survives restarts and syncs to every device. | `editor.vehicle_maintenance.storage_section_desc` |
| {count} due soon | `editor.vehicle_maintenance.tally_due_soon` |
| All up to date | `editor.vehicle_maintenance.tally_ok` |
| {count} overdue | `editor.vehicle_maintenance.tally_overdue` |
| Text | `editor.vehicle_maintenance.text_color` |
| Thresholds | `editor.vehicle_maintenance.thresholds_section` |
| When a service starts warning, and how much history to show. The defaults suit most vehicles. | `editor.vehicle_maintenance.thresholds_section_desc` |
| Title override | `editor.vehicle_maintenance.title` |
| Leave blank to use the vehicle name. | `editor.vehicle_maintenance.title_desc` |
| Storage list | `editor.vehicle_maintenance.todo_entity` |
| Create a Local To-do helper under Settings \u2192 Devices & services \u2192 Helpers \u2192 To-do list, then pick it here. | `editor.vehicle_maintenance.todo_entity_desc` |
| Without a list, service history is not retained. Interval tracking still works from the last-service values on each service below. | `editor.vehicle_maintenance.todo_missing` |
| This list cannot store item descriptions (Shopping List behaves this way). Logging still works, but the stored data rides along in the item title and looks messy in the Home Assistant to-do UI. A Local To-do helper is… | `editor.vehicle_maintenance.todo_no_description` |
| Total spend | `editor.vehicle_maintenance.total_spend` |
| d | `editor.vehicle_maintenance.unit_days_short` |
| km | `editor.vehicle_maintenance.unit_km` |
| Kilometers | `editor.vehicle_maintenance.unit_km_long` |
| mi | `editor.vehicle_maintenance.unit_mi` |
| Miles | `editor.vehicle_maintenance.unit_mi_long` |
| mo | `editor.vehicle_maintenance.unit_months_short` |
| Unit changed to {unit}. Your interval numbers were left exactly as they were. Convert them? | `editor.vehicle_maintenance.unit_offer` |
| Convert numbers | `editor.vehicle_maintenance.unit_offer_convert` |
| Keep as-is | `editor.vehicle_maintenance.unit_offer_keep` |
| Unnamed service | `editor.vehicle_maintenance.unnamed_service` |
| Vehicle photo | `editor.vehicle_maintenance.vehicle_image` |
| Optional. Used as the hero banner; a clean icon header is shown when empty. | `editor.vehicle_maintenance.vehicle_image_desc` |
| Vehicle name | `editor.vehicle_maintenance.vehicle_name` |
| Shown as the heading in the hero layout. | `editor.vehicle_maintenance.vehicle_name_desc` |
| Vehicle photo | `editor.vehicle_maintenance.vehicle_photo_alt` |
| Vehicle | `editor.vehicle_maintenance.vehicle_section` |
| Name your vehicle and point the module at its odometer. Everything else is optional. | `editor.vehicle_maintenance.vehicle_section_desc` |

</details>

<details>
<summary><strong>Plant care (editor)</strong> — 160 left</summary>

| English text | Key |
| --- | --- |
| Open the General tab and add a plant with a name and a watering interval. Photos and moisture sensors are optional extras. | `editor.plant_care.add_first_desc` |
| Add your first plant | `editor.plant_care.add_first_title` |
| Add plant | `editor.plant_care.add_plant` |
| Advanced | `editor.plant_care.advanced_section` |
| Advanced sensors | `editor.plant_care.advanced_sensors` |
| If this plant has a moisture probe, the live reading takes over from the schedule guess. Plants without one keep using the schedule. | `editor.plant_care.advanced_sensors_desc` |
| {days} days ago | `editor.plant_care.ago_days` |
| Today | `editor.plant_care.ago_today` |
| Yesterday | `editor.plant_care.ago_yesterday` |
| Card background | `editor.plant_care.card_background_color` |
| Collapse | `editor.plant_care.collapse` |
| Colors | `editor.plant_care.colors_section` |
| Columns | `editor.plant_care.columns` |
| Default fertilizing interval | `editor.plant_care.default_fertilize` |
| 0 turns fertilizing off. | `editor.plant_care.default_fertilize_desc` |
| Plant Care | `editor.plant_care.default_title` |
| Default watering interval | `editor.plant_care.default_water` |
| Delete plant | `editor.plant_care.delete_plant` |
| {days} days | `editor.plant_care.detail_days` |
| Fertilize | `editor.plant_care.detail_fertilize` |
| Waters every | `editor.plant_care.detail_interval` |
| Last watered | `editor.plant_care.detail_last_water` |
| Light | `editor.plant_care.detail_light` |
| Why | `editor.plant_care.detail_reason` |
| Temperature | `editor.plant_care.detail_temperature` |
| Display | `editor.plant_care.display_section` |
| Choose what the card shows. | `editor.plant_care.display_section_desc` |
| In {days} days | `editor.plant_care.due_in_days` |
| {days} days overdue | `editor.plant_care.due_overdue` |
| Due today | `editor.plant_care.due_today` |
| Tomorrow | `editor.plant_care.due_tomorrow` |
| Edit | `editor.plant_care.edit` |
| Feeding due | `editor.plant_care.fert_due` |
| Feed in {days} days | `editor.plant_care.fert_in_days` |
| Fertilize {name} | `editor.plant_care.fertilize_plant` |
| Happy | `editor.plant_care.happy_color` |
| Plants that need nothing. | `editor.plant_care.happy_color_desc` |
| Your Home Assistant location is in the northern hemisphere, so summer peaks in July. | `editor.plant_care.hemisphere_north` |
| Your Home Assistant location is in the southern hemisphere, so summer peaks in January. | `editor.plant_care.hemisphere_south` |
| Today intervals are multiplied by {factor}×. | `editor.plant_care.hemisphere_today` |
| History kept per plant | `editor.plant_care.history_limit` |
| Older care entries are removed from the to-do list so it does not grow forever. | `editor.plant_care.history_limit_desc` |
| Light sensor | `editor.plant_care.illuminance_entity` |
| Optional. Shown on the plant detail, not used for scheduling. | `editor.plant_care.illuminance_entity_desc` |
| Add | `editor.plant_care.import_add` |
| Added | `editor.plant_care.import_added` |
| Add all missing | `editor.plant_care.import_all` |
| Import from HA plant entities | `editor.plant_care.import_button` |
| Imported {count} plants. | `editor.plant_care.import_done` |
| No plant.* entities found in Home Assistant. Add plants manually instead. | `editor.plant_care.import_none` |
| Everything here has already been imported. | `editor.plant_care.import_nothing_new` |
| Moisture sensor: {entity} | `editor.plant_care.import_with_sensor` |
| Layout | `editor.plant_care.layout` |
| Grid for photos, list for density, map to place plants on a floor plan. | `editor.plant_care.layout_desc` |
| Grid | `editor.plant_care.layout_grid` |
| List | `editor.plant_care.layout_list` |
| Map | `editor.plant_care.layout_map` |
| Layout | `editor.plant_care.layout_section` |
| Loading care history… | `editor.plant_care.loading` |
| Fertilized {name} | `editor.plant_care.log_fertilized` |
| Watered {name} | `editor.plant_care.log_watered` |
| Floor plan | `editor.plant_care.map_image` |
| Background image for the map layout. Place each plant on it from its row above. | `editor.plant_care.map_image_desc` |
| The map layout needs a background image. Upload one under Layout in the General tab, then place each plant on it. | `editor.plant_care.map_needed_desc` |
| Add a floor plan | `editor.plant_care.map_needed_title` |
| Every marker is still sitting in the middle. Open a plant in the General tab and click the plan to place it. | `editor.plant_care.map_place_hint` |
| Position on the map | `editor.plant_care.map_position` |
| Click the plan to drop this plant where it lives. | `editor.plant_care.map_position_help` |
| Upload a floor plan under Layout to place plants by clicking. Until then, use the sliders below. | `editor.plant_care.map_position_no_image` |
| Horizontal position | `editor.plant_care.map_x` |
| Vertical position | `editor.plant_care.map_y` |
| Moisture sensor | `editor.plant_care.moisture_entity` |
| A sensor reporting soil moisture as a percentage. | `editor.plant_care.moisture_entity_desc` |
| Thirst comes from | `editor.plant_care.moisture_source` |
| Thirsty below | `editor.plant_care.moisture_threshold` |
| Readings under this percentage mean the plant wants water. | `editor.plant_care.moisture_threshold_desc` |
| Move down | `editor.plant_care.move_down` |
| Move up | `editor.plant_care.move_up` |
| Never fertilized | `editor.plant_care.never_fertilized` |
| Never watered | `editor.plant_care.never_watered` |
| New plant | `editor.plant_care.new_plant_name` |
| No plants yet. Add one below, or import the plant entities you already have in Home Assistant. | `editor.plant_care.no_plants_editor` |
| Overdue | `editor.plant_care.overdue_color` |
| Well past due, or bone dry. | `editor.plant_care.overdue_color_desc` |
| Sort by urgency | `editor.plant_care.overdue_first` |
| Overdue and thirsty plants float to the top instead of keeping your order. | `editor.plant_care.overdue_first_desc` |
| Fertilize every | `editor.plant_care.plant_fertilize_interval` |
| Set to 0 to turn fertilizing reminders off for this plant. | `editor.plant_care.plant_fertilize_interval_desc` |
| Icon | `editor.plant_care.plant_icon` |
| Shown when there is no photo, and as the fallback if a photo fails to load. | `editor.plant_care.plant_icon_desc` |
| Location | `editor.plant_care.plant_location` |
| Optional room or spot, shown under the name. | `editor.plant_care.plant_location_desc` |
| Name | `editor.plant_care.plant_name` |
| Notes | `editor.plant_care.plant_notes` |
| Photo | `editor.plant_care.plant_photo` |
| Optional. A photo makes the grid layout much easier to scan. | `editor.plant_care.plant_photo_desc` |
| Water every | `editor.plant_care.plant_water_interval` |
| How often this plant wants water. | `editor.plant_care.plant_water_interval_desc` |
| Plants | `editor.plant_care.plants_section` |
| Plant Care is a Pro feature: a visual roster of your houseplants with watering and fertilizing schedules, one-tap care logging, and optional moisture sensors. | `editor.plant_care.pro_description` |
| No watering logged yet | `editor.plant_care.reason_none` |
| From the schedule (no sensor) | `editor.plant_care.reason_schedule` |
| From the schedule | `editor.plant_care.reason_schedule_sensor_off` |
| Sensor {value}% of {threshold}% | `editor.plant_care.reason_sensor` |
| water every {days} days | `editor.plant_care.row_every_days` |
| Schedule defaults | `editor.plant_care.schedule_section` |
| Used by every plant that does not set its own interval. | `editor.plant_care.schedule_section_desc` |
| shoulder season | `editor.plant_care.season_shoulder` |
| summer | `editor.plant_care.season_summer` |
| Seasonal adjustment is on: {phase}, intervals ×{factor} | `editor.plant_care.season_tooltip` |
| winter | `editor.plant_care.season_winter` |
| Seasonal adjustment | `editor.plant_care.seasonal_adjust` |
| Stretch watering intervals in winter and shorten them in summer. The change eases across the year rather than flipping at the solstice, and the hemisphere is taken from your Home Assistant location. | `editor.plant_care.seasonal_adjust_desc` |
| Seasonal factors | `editor.plant_care.seasonal_group` |
| Secondary text | `editor.plant_care.secondary_text_color` |
| Choose a Local To-do helper under Storage in the General tab. Watering history is saved there. | `editor.plant_care.setup_desc` |
| Pick a care history list | `editor.plant_care.setup_title` |
| Show details | `editor.plant_care.show_detail` |
| Show fertilizing | `editor.plant_care.show_fertilize` |
| Adds a secondary fertilize action for plants that have an interval set. | `editor.plant_care.show_fertilize_desc` |
| Show moisture readings | `editor.plant_care.show_moisture` |
| Show next watering due | `editor.plant_care.show_next_due` |
| Show photos | `editor.plant_care.show_photos` |
| Turn off to fall back to icons everywhere. | `editor.plant_care.show_photos_desc` |
| Show summary bar | `editor.plant_care.show_summary_bar` |
| A one-line count of thirsty, overdue and happy plants. | `editor.plant_care.show_summary_bar_desc` |
| Show title | `editor.plant_care.show_title` |
| Both | `editor.plant_care.source_both` |
| Schedule | `editor.plant_care.source_schedule` |
| Sensor | `editor.plant_care.source_sensor` |
| Watering history lives on a to-do list so every device in the house sees the same log. Create one under Settings → Devices & Services → Helpers → To-do list (Local to-do), name it something like “Plant Care”, then pic… | `editor.plant_care.storage_help` |
| Storage | `editor.plant_care.storage_section` |
| due soon | `editor.plant_care.sum_due_soon` |
| happy | `editor.plant_care.sum_happy` |
| never watered | `editor.plant_care.sum_never` |
| Next: {name} {when} | `editor.plant_care.sum_next` |
| overdue | `editor.plant_care.sum_overdue` |
| thirsty | `editor.plant_care.sum_thirsty` |
| Summer factor | `editor.plant_care.summer_factor` |
| Below 1 waters more often at the height of summer. | `editor.plant_care.summer_factor_desc` |
| Tap to log watering | `editor.plant_care.tap_to_water` |
| Temperature sensor | `editor.plant_care.temperature_entity` |
| Optional. Shown on the plant detail, not used for scheduling. | `editor.plant_care.temperature_entity_desc` |
| Text | `editor.plant_care.text_color` |
| Thirsty | `editor.plant_care.thirsty_color` |
| Due now or drifting dry. | `editor.plant_care.thirsty_color_desc` |
| Title | `editor.plant_care.title` |
| Leave blank to use “Plant Care”. | `editor.plant_care.title_desc` |
| Care history list | `editor.plant_care.todo_entity` |
| A Local To-do helper used as storage. Nothing else should write to it. | `editor.plant_care.todo_entity_desc` |
| This list cannot store item descriptions (the Shopping List behaves this way). Care history still works, but the stored data is appended to each item title and looks messy in the Home Assistant to-do panel. A Local To… | `editor.plant_care.todo_no_description` |
| Undo | `editor.plant_care.undo` |
| Fertilized {name} | `editor.plant_care.undo_fertilized` |
| Watered {name} | `editor.plant_care.undo_watered` |
| days | `editor.plant_care.unit_days` |
| Unnamed plant | `editor.plant_care.unnamed_plant` |
| Use the module default ({days} days) | `editor.plant_care.use_default_water` |
| Water {name} | `editor.plant_care.water_plant` |
| Winter factor | `editor.plant_care.winter_factor` |
| Above 1 stretches the gap between waterings in deep winter. | `editor.plant_care.winter_factor_desc` |

</details>

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
<summary><strong>Battery fleet (editor)</strong> — 151 left</summary>

| English text | Key |
| --- | --- |
| Add battery | `editor.battery_fleet.add_entity` |
| Every battery is healthy | `editor.battery_fleet.all_clear` |
| {count} device(s) checked, nothing needs attention. | `editor.battery_fleet.all_clear_desc` |
| Add area | `editor.battery_fleet.area_add` |
| Limit to areas | `editor.battery_fleet.area_filter` |
| Leave empty to include every area. Devices with no area are excluded once a filter is set. | `editor.battery_fleet.area_filter_desc` |
| Row background | `editor.battery_fleet.color_card_bg` |
| Background behind each device row or tile. | `editor.battery_fleet.color_card_bg_desc` |
| Charging | `editor.battery_fleet.color_charging` |
| Rechargeable devices currently charging. | `editor.battery_fleet.color_charging_desc` |
| Critical | `editor.battery_fleet.color_critical` |
| Batteries at or below the critical threshold. | `editor.battery_fleet.color_critical_desc` |
| Low | `editor.battery_fleet.color_low` |
| Batteries at or below the low threshold. | `editor.battery_fleet.color_low_desc` |
| Healthy | `editor.battery_fleet.color_ok` |
| Batteries with nothing to worry about. | `editor.battery_fleet.color_ok_desc` |
| Secondary text | `editor.battery_fleet.color_secondary` |
| Drain rates, estimates and captions. | `editor.battery_fleet.color_secondary_desc` |
| Text | `editor.battery_fleet.color_text` |
| Device names and percentages. | `editor.battery_fleet.color_text_desc` |
| Colors | `editor.battery_fleet.colors_section` |
| High confidence | `editor.battery_fleet.conf_high` |
| Low confidence | `editor.battery_fleet.conf_low` |
| Medium confidence | `editor.battery_fleet.conf_medium` |
| Not enough recorded drain yet to make an honest estimate. | `editor.battery_fleet.conf_none` |
| Critical | `editor.battery_fleet.critical_threshold` |
| At or below this percentage a battery is critical. | `editor.battery_fleet.critical_threshold_desc` |
| Battery Fleet | `editor.battery_fleet.default_title` |
| Devices | `editor.battery_fleet.devices_section` |
| Auto-discovery finds every battery in Home Assistant with no configuration. Switch to Manual to curate the list yourself. | `editor.battery_fleet.devices_section_desc` |
| Discovery | `editor.battery_fleet.discovery_mode` |
| Auto scans Home Assistant, Manual uses only the list below, Both merges them. | `editor.battery_fleet.discovery_mode_desc` |
| Hide this device from the card | `editor.battery_fleet.dismiss_auto` |
| Remove from the manual list | `editor.battery_fleet.dismiss_manual` |
| Display | `editor.battery_fleet.display_section` |
| No batteries found | `editor.battery_fleet.empty_auto` |
| Nothing in Home Assistant reports a battery level. Try enabling battery_level attributes or binary sensors, or relax the exclude patterns. | `editor.battery_fleet.empty_auto_desc` |
| Add your batteries | `editor.battery_fleet.empty_manual` |
| Manual discovery is on but the list is empty. Add entities in the General tab, or switch discovery to Auto. | `editor.battery_fleet.empty_manual_desc` |
| Waiting for Home Assistant | `editor.battery_fleet.err_ha` |
| Connecting to entity states… | `editor.battery_fleet.err_ha_desc` |
| Recorder history is unavailable, so levels are shown without predictions. | `editor.battery_fleet.err_history` |
| Battery Fleet could not render | `editor.battery_fleet.err_render` |
| Add at least one battery entity, or switch discovery to Auto or Both. | `editor.battery_fleet.error_manual_empty` |
| The critical threshold must be lower than the low threshold. | `editor.battery_fleet.error_thresholds` |
| over 6 months | `editor.battery_fleet.eta_beyond` |
| 6mo+ | `editor.battery_fleet.eta_beyond_short` |
| charging | `editor.battery_fleet.eta_charging` |
| replace in about a day | `editor.battery_fleet.eta_day_one` |
| replace in ~{n} days | `editor.battery_fleet.eta_days` |
| ~{n}d | `editor.battery_fleet.eta_days_short` |
| gathering data | `editor.battery_fleet.eta_gathering` |
| gathering… | `editor.battery_fleet.eta_gathering_short` |
| ~{n} months | `editor.battery_fleet.eta_months` |
| ~{n}mo | `editor.battery_fleet.eta_months_short` |
| replace now | `editor.battery_fleet.eta_now` |
| now | `editor.battery_fleet.eta_now_short` |
| ~{n} weeks | `editor.battery_fleet.eta_weeks` |
| ~{n}w | `editor.battery_fleet.eta_weeks_short` |
| Exclude patterns | `editor.battery_fleet.exclude_patterns` |
| Any battery whose entity id or name contains one of these words is skipped. Case-insensitive. | `editor.battery_fleet.exclude_patterns_desc` |
| e.g. test, spare, backup | `editor.battery_fleet.exclude_placeholder` |
| Predictions from {days} days of history · {ready} of {total} devices have enough data | `editor.battery_fleet.footer_basis` |
| Reading {days} days of recorder history… | `editor.battery_fleet.footer_loading` |
| Found {count} batteries | `editor.battery_fleet.found_count` |
| +{count} more | `editor.battery_fleet.found_more` |
| No batteries discovered yet | `editor.battery_fleet.found_none` |
| Nothing matched. Try turning on battery_level attributes or battery binary sensors below, relax your exclude patterns, or add entities manually. | `editor.battery_fleet.found_none_desc` |
| Group by area | `editor.battery_fleet.group_by_area` |
| Split the list into area headings. Devices with no area are listed last. | `editor.battery_fleet.group_by_area_desc` |
| Dismissed devices | `editor.battery_fleet.hidden_entities` |
| {count} device(s) dismissed from the card. Remove a chip to bring one back. | `editor.battery_fleet.hidden_entities_desc` |
| Nothing dismissed. Use the × on a row in the live preview to hide a device. | `editor.battery_fleet.hidden_entities_empty` |
| History window | `editor.battery_fleet.history_days` |
| How far back to read the recorder. Longer windows smooth out noise but cost more to load. | `editor.battery_fleet.history_days_desc` |
| Include battery_level attributes | `editor.battery_fleet.include_attribute` |
| Picks up vacuums, phones, trackers and other devices that report their battery as an attribute instead of a sensor. | `editor.battery_fleet.include_attribute_desc` |
| Include battery binary sensors | `editor.battery_fleet.include_binary` |
| Devices that only report "low" or "OK". They show as 0% or 100% and cannot be predicted. | `editor.battery_fleet.include_binary_desc` |
| Layout | `editor.battery_fleet.layout` |
| Cards | `editor.battery_fleet.layout_cards` |
| Compact | `editor.battery_fleet.layout_compact` |
| Table is the dense planning view, Cards is a tile grid, Compact is one line each. | `editor.battery_fleet.layout_desc` |
| Table | `editor.battery_fleet.layout_table` |
| reading history… | `editor.battery_fleet.loading_history` |
| Low | `editor.battery_fleet.low_threshold` |
| At or below this percentage a battery is low. Must be above the critical threshold. | `editor.battery_fleet.low_threshold_desc` |
| No manual batteries yet. Add one below. | `editor.battery_fleet.manual_empty` |
| Manual batteries | `editor.battery_fleet.manual_heading` |
| Add any entity that reports a battery percentage. Expand a row to set a friendly label, icon and battery type. | `editor.battery_fleet.manual_heading_desc` |
| Maximum devices | `editor.battery_fleet.max_items` |
| How many devices to list. The summary bar always counts the whole fleet. | `editor.battery_fleet.max_items_desc` |
| Minimum evidence | `editor.battery_fleet.min_confidence_hours` |
| How many hours of observed draining are required before any estimate is shown. Lower values give faster but shakier predictions. | `editor.battery_fleet.min_confidence_hours_desc` |
| Auto | `editor.battery_fleet.mode_auto` |
| Both | `editor.battery_fleet.mode_both` |
| Manual | `editor.battery_fleet.mode_manual` |
| No area | `editor.battery_fleet.no_area` |
| Predict replacement dates | `editor.battery_fleet.predict_replacement` |
| Measure each battery\u2019s drain rate and project when it will need changing. | `editor.battery_fleet.predict_replacement_desc` |
| Prediction | `editor.battery_fleet.prediction_section` |
| Prediction tuning | `editor.battery_fleet.prediction_tuning` |
| Battery Fleet reads recorder history to measure how fast every battery in your home is draining, then ranks them by how soon they need replacing. | `editor.battery_fleet.pro_description` |
| {rate}%/day | `editor.battery_fleet.rate_per_day` |
| Replacement floor | `editor.battery_fleet.replacement_floor` |
| The percentage you consider "dead". Predictions count down to this, not to zero. | `editor.battery_fleet.replacement_floor_desc` |
| Restore all dismissed | `editor.battery_fleet.restore_all` |
| Battery type | `editor.battery_fleet.row_battery_type` |
| A note for shopping day, e.g. "CR2032 x2" or "AA x4". | `editor.battery_fleet.row_battery_type_desc` |
| Remove this battery | `editor.battery_fleet.row_delete` |
| Edit this battery | `editor.battery_fleet.row_edit` |
| Entity | `editor.battery_fleet.row_entity` |
| Icon | `editor.battery_fleet.row_icon` |
| Leave blank to use a battery icon that follows the level. | `editor.battery_fleet.row_icon_desc` |
| Label | `editor.battery_fleet.row_label` |
| Leave blank to use the entity name. | `editor.battery_fleet.row_label_desc` |
| No entity selected | `editor.battery_fleet.row_no_entity` |
| Show charging indicator | `editor.battery_fleet.show_charging_indicator` |
| Flag rechargeable devices that are charging right now and exclude them from urgency. | `editor.battery_fleet.show_charging_indicator_desc` |
| Show drain rate | `editor.battery_fleet.show_drain_rate` |
| Percentage lost per day, measured from history. | `editor.battery_fleet.show_drain_rate_desc` |
| Show replacement estimate | `editor.battery_fleet.show_eta` |
| The "replace in ~12 days" column. Hidden automatically when there is not enough data. | `editor.battery_fleet.show_eta_desc` |
| Only show problems | `editor.battery_fleet.show_only_problems` |
| Hide healthy batteries so the card is empty when there is nothing to do. | `editor.battery_fleet.show_only_problems_desc` |
| Show sparkline | `editor.battery_fleet.show_sparkline` |
| A tiny history graph per device. Skipped when there are too few samples. | `editor.battery_fleet.show_sparkline_desc` |
| Show fleet summary | `editor.battery_fleet.show_summary_bar` |
| The one-line roll-up with counts and the most urgent device. | `editor.battery_fleet.show_summary_bar_desc` |
| Show title | `editor.battery_fleet.show_title` |
| Display the header row. | `editor.battery_fleet.show_title_desc` |
| Drain rate | `editor.battery_fleet.sort_drain` |
| Level | `editor.battery_fleet.sort_level` |
| Sort by | `editor.battery_fleet.sort_mode` |
| Urgency blends the current level with how fast it is falling. | `editor.battery_fleet.sort_mode_desc` |
| Name | `editor.battery_fleet.sort_name` |
| Urgency | `editor.battery_fleet.sort_urgency` |
| all healthy | `editor.battery_fleet.sum_all_ok` |
| {count} critical | `editor.battery_fleet.sum_critical` |
| {count} low | `editor.battery_fleet.sum_low` |
| {count} need replacing this month | `editor.battery_fleet.sum_month` |
| Most urgent: {name} | `editor.battery_fleet.sum_most_urgent` |
| {count} batteries | `editor.battery_fleet.sum_total` |
| Thresholds | `editor.battery_fleet.thresholds_section` |
| Levels at or below these values are coloured and counted as problems. | `editor.battery_fleet.thresholds_section_desc` |
| Title | `editor.battery_fleet.title` |
| Header shown above the list. Leave blank for "Battery Fleet". | `editor.battery_fleet.title_desc` |
| days | `editor.battery_fleet.unit_days` |
| h | `editor.battery_fleet.unit_hours` |
| Urgent window | `editor.battery_fleet.urgent_days` |
| A battery projected to die within this many days is flagged urgent and sorted to the top. | `editor.battery_fleet.urgent_days_desc` |

</details>

<details>
<summary><strong>Dog duty (editor)</strong> — 151 left</summary>

| English text | Key |
| --- | --- |
| Dog Duty is a Pro feature that uses your yard camera and LLM Vision to mark where the dog went, with a scrubber and cleanup tracking. | `editor.dog_duty.pro_description` |
| Entities | `editor.dog_duty.entities_section` |
| Camera and to-do list that power the Dog Duty map. | `editor.dog_duty.entities_section_desc` |
| Yard camera | `editor.dog_duty.camera` |
| Additional cameras | `editor.dog_duty.extra_cameras` |
| Optional. Each camera gets its own map; status chips combine across all. | `editor.dog_duty.extra_cameras_desc` |
| Camera layout | `editor.dog_duty.cameras_layout` |
| Stack maps vertically or show them in a grid when you have more than one camera. | `editor.dog_duty.cameras_layout_desc` |
| List (stacked) | `editor.dog_duty.layout_stack` |
| Grid | `editor.dog_duty.layout_grid` |
| To-do list | `editor.dog_duty.todo` |
| This list (e.g. Shopping List) cannot store item descriptions. Markers still work, but a Local To-do named “Dog Duty” is recommended (Settings → Devices & services → Helpers → Local To-do). | `editor.dog_duty.todo_no_description` |
| Dog / motion trigger (optional) | `editor.dog_duty.trigger` |
| How scanning works | `editor.dog_duty.scan_mode_section` |
| The mode is chosen automatically from your setup: pick a trigger sensor for the smartest scanning, or let the automation run on a schedule without one. | `editor.dog_duty.scan_mode_section_desc` |
| Active | `editor.dog_duty.mode_active` |
| Sensor-triggered | `editor.dog_duty.mode_sensor` |
| Scheduled | `editor.dog_duty.mode_scheduled` |
| No sensor needed. The automation scans every {interval} during your active hours. Each scan is one AI call, whether or not the dog was out. | `editor.dog_duty.mode_scheduled_desc` |
| Manual only | `editor.dog_duty.mode_manual` |
| Scheduled scan interval | `editor.dog_duty.scan_interval` |
| How often the automation scans when no trigger sensor is set. Shorter = catches events sooner but uses more AI calls. | `editor.dog_duty.scan_interval_desc` |
| Active hours | `editor.dog_duty.active_hours` |
| Scheduled scans only run inside this window, so you are not paying for AI calls while the dog is asleep. | `editor.dog_duty.active_hours_desc` |
| Changing the trigger sensor or schedule? Re-run "Create automation" in the wizard to update the existing automation. | `editor.dog_duty.scan_mode_reapply` |
| min | `editor.dog_duty.minutes` |
| hour | `editor.dog_duty.hour` |
| hours | `editor.dog_duty.hours` |
| LLM Vision | `editor.dog_duty.provider_section` |
| Provider config entry used for Scan Now and the generated automation. | `editor.dog_duty.provider_section_desc` |
| Provider | `editor.dog_duty.provider` |
| Run Check prerequisites in the wizard to refresh the list. | `editor.dog_duty.provider_desc` |
| Provider ID (manual) | `editor.dog_duty.provider_manual` |
| Paste an LLM Vision provider entry_id if it was not auto-detected. | `editor.dog_duty.provider_manual_desc` |
| None detected | `editor.dog_duty.no_provider` |
| Display | `editor.dog_duty.display_section` |
| Map look and time window. | `editor.dog_duty.display_section_desc` |
| Title | `editor.dog_duty.title` |
| Leave blank to use "Dog Duty". | `editor.dog_duty.title_desc` |
| Show title | `editor.dog_duty.show_title` |
| Show status bar | `editor.dog_duty.show_status_bar` |
| Show time scrubber | `editor.dog_duty.show_scrubber` |
| Show Scan Now button | `editor.dog_duty.show_scan_now` |
| Show cleaned markers | `editor.dog_duty.show_cleaned` |
| Completed to-do items appear as faded checkmarks. | `editor.dog_duty.show_cleaned_desc` |
| Heatmap by default | `editor.dog_duty.show_heatmap` |
| Show density overlay of favorite spots in the lookback window. | `editor.dog_duty.show_heatmap_desc` |
| Map | `editor.dog_duty.map_section` |
| Lookback window | `editor.dog_duty.lookback` |
| How far back the scrubber and markers go. | `editor.dog_duty.lookback_desc` |
| Marker style | `editor.dog_duty.marker_style` |
| X | `editor.dog_duty.marker_x` |
| Emoji | `editor.dog_duty.marker_emoji` |
| Pin | `editor.dog_duty.marker_pin` |
| Background | `editor.dog_duty.background_mode` |
| Live camera snapshot or a fixed reference photo of the yard. | `editor.dog_duty.background_mode_desc` |
| Live snapshot | `editor.dog_duty.bg_live` |
| Reference photo | `editor.dog_duty.bg_reference` |
| Reference image | `editor.dog_duty.reference_image` |
| Upload a still photo of the yard from the same camera angle. | `editor.dog_duty.reference_image_desc` |
| Scan cooldown | `editor.dog_duty.cooldown` |
| Minimum minutes between automation runs / Scan Now calls. | `editor.dog_duty.cooldown_desc` |
| Detection | `editor.dog_duty.detection_section` |
| Scan Now uses these settings immediately. Re-create the automation below to apply them to automatic scans. | `editor.dog_duty.automation_update_hint` |
| Update automation | `editor.dog_duty.update_automation` |
| Sensitivity | `editor.dog_duty.sensitivity` |
| Strict = fewer high-confidence marks. Lenient = more willing to mark uncertain spots. | `editor.dog_duty.sensitivity_desc` |
| Strict | `editor.dog_duty.sensitivity_strict` |
| Balanced | `editor.dog_duty.sensitivity_balanced` |
| Lenient | `editor.dog_duty.sensitivity_lenient` |
| Mark while dog is squatting | `editor.dog_duty.detect_squatting` |
| Also mark when a dog is clearly squatting or defecating, not only piles on the ground. | `editor.dog_duty.detect_squatting_desc` |
| Minimum confidence | `editor.dog_duty.min_confidence` |
| Ignore AI spots below this confidence (0–100%). | `editor.dog_duty.min_confidence_desc` |
| Extra tips | `editor.dog_duty.extra_tips` |
| e.g. Our dog is white; piles are usually dark brown near the fence | `editor.dog_duty.extra_tips_placeholder` |
| Example photos | `editor.dog_duty.example_photos` |
| Up to 3 photos of what waste looks like in your yard. Sent as references with each scan (uses more tokens). | `editor.dog_duty.example_photos_desc` |
| Example {n} | `editor.dog_duty.example_photo_n` |
| Detect zone | `editor.dog_duty.detect_zone` |
| Drag a rectangle on the preview to limit detection to part of the yard (e.g. lawn only). | `editor.dog_duty.detect_zone_desc` |
| Edit zone | `editor.dog_duty.detect_zone_edit` |
| Done | `editor.dog_duty.detect_zone_done` |
| Reset to full frame | `editor.dog_duty.detect_zone_reset` |
| Drag to draw the detect zone | `editor.dog_duty.detect_zone_drag` |
| Setup wizard | `editor.dog_duty.wizard_title` |
| Check prerequisites | `editor.dog_duty.wizard_step1` |
| How to set up LLM Vision | `editor.dog_duty.setup_guide_title` |
| Install “LLM Vision” from Marketplace, then restart Home Assistant. | `editor.dog_duty.setup_guide_1` |
| On the LLM Vision card, press Add Entry (or Configure → Add Entry) and choose a Provider (OpenAI, Google, OpenRouter, or Ollama). | `editor.dog_duty.setup_guide_3` |
| Come back here and press Check prerequisites. | `editor.dog_duty.setup_guide_5` |
| Selected provider: {name} | `editor.dog_duty.provider_auto_selected` |
| Setup docs | `editor.dog_duty.setup_docs` |
| provider(s) | `editor.dog_duty.providers_count` |
| Pick camera & list | `editor.dog_duty.wizard_step2` |
| Choose your yard camera and Dog Duty to-do list below (Entities section), then continue. Create a Local To-do list named "Dog Duty" in Settings → Devices & services → Helpers if needed. | `editor.dog_duty.wizard_step2_desc` |
| Create automation | `editor.dog_duty.wizard_step3` |
| Test scan | `editor.dog_duty.wizard_step4` |
| Checking… | `editor.dog_duty.checking` |
| Check prerequisites | `editor.dog_duty.check_prereqs` |
| LLM Vision found | `editor.dog_duty.llm_found` |
| Continue | `editor.dog_duty.continue` |
| Back | `editor.dog_duty.back` |
| Creating… | `editor.dog_duty.creating` |
| Create automation | `editor.dog_duty.create_automation` |
| Scanning… | `editor.dog_duty.scanning` |
| Run test scan | `editor.dog_duty.run_test` |
| Finish | `editor.dog_duty.finish` |
| Setup complete. Detections will appear on the map. | `editor.dog_duty.setup_done` |
| Tip: Settings → Devices & services → Helpers → Create Helper → Local To-do → name it "Dog Duty", then pick it in Entities above. | `editor.dog_duty.todo_manual_hint` |
| Select or paste an LLM Vision provider ID first. | `editor.dog_duty.need_provider` |
| Automation created: {id}. Reload automations if it does not appear immediately. | `editor.dog_duty.automation_created` |
| Could not create the automation automatically. You may need admin permissions, or create it manually from the generated template. | `editor.dog_duty.automation_failed` |
| Found {count} spot(s). Markers were added to the to-do list. | `editor.dog_duty.test_found` |
| No droppings detected in the current frame. | `editor.dog_duty.test_none` |
| Dog Duty | `editor.dog_duty.default_title` |
| active | `editor.dog_duty.chip_active` |
| this week | `editor.dog_duty.chip_week` |
| Heatmap | `editor.dog_duty.heatmap` |
| Toggle heatmap | `editor.dog_duty.heatmap_toggle` |
| Scan Now | `editor.dog_duty.scan_now` |
| Found {count} spot(s) | `editor.dog_duty.scan_found` |
| No droppings detected | `editor.dog_duty.scan_none` |
| Select a yard camera to show the map | `editor.dog_duty.no_camera` |
| No detections in this time window | `editor.dog_duty.no_events` |
| No detections | `editor.dog_duty.no_events_short` |
| Open the General tab and run the setup wizard to connect a camera, to-do list, and LLM Vision. | `editor.dog_duty.setup_hint` |
| Marker | `editor.dog_duty.marker` |
| Confidence | `editor.dog_duty.confidence` |
| Cleaned | `editor.dog_duty.cleaned` |
| Mark as cleaned | `editor.dog_duty.mark_cleaned` |
| Mark active | `editor.dog_duty.mark_active` |
| False alarm | `editor.dog_duty.false_alarm` |
| Now | `editor.dog_duty.now` |
| Time scrubber | `editor.dog_duty.scrubber` |
| Live | `editor.dog_duty.live` |
| Showing current yard view | `editor.dog_duty.scrub_live_desc` |
| {count} detection(s) in window | `editor.dog_duty.scrub_events` |
| Return to live | `editor.dog_duty.return_to_live` |
| Reopen wizard | `editor.dog_duty.reopen_wizard` |
| View active detections | `editor.dog_duty.chip_active_title` |
| View this week’s detections | `editor.dog_duty.chip_week_title` |
| Active detections | `editor.dog_duty.list_active_title` |
| This week | `editor.dog_duty.list_week_title` |
| No detections in this list. | `editor.dog_duty.list_empty` |
| Time | `editor.dog_duty.sort_time` |
| Camera | `editor.dog_duty.sort_camera` |
| Confidence | `editor.dog_duty.sort_confidence` |
| Status | `editor.dog_duty.sort_status` |
| Placement | `editor.dog_duty.placement` |
| Still there | `editor.dog_duty.status_active` |

</details>

<details>
<summary><strong>Lunar phase (editor)</strong> — 143 left</summary>

| English text | Key |
| --- | --- |
| Lunar Phase is a Pro feature with an animated moon, live lunar data, a month calendar, and a horizon graph. | `editor.lunar_phase.pro_description` |
| Set a location | `editor.lunar_phase.config_needed` |
| Choose a location source in the General tab | `editor.lunar_phase.config_needed_desc` |
| Location | `editor.lunar_phase.location_section` |
| Latitude and longitude used for moon position, rise and set times. | `editor.lunar_phase.location_section_desc` |
| Location source | `editor.lunar_phase.location_source` |
| Use your Home Assistant location, an entity, or manual coordinates. | `editor.lunar_phase.location_source_desc` |
| System | `editor.lunar_phase.location_default` |
| Entity | `editor.lunar_phase.location_entity_opt` |
| Custom | `editor.lunar_phase.location_custom` |
| Location Entity | `editor.lunar_phase.location_entity_group` |
| Entity with latitude/longitude attributes | `editor.lunar_phase.location_entity` |
| Custom Coordinates | `editor.lunar_phase.location_custom_group` |
| Latitude | `editor.lunar_phase.latitude` |
| Decimal degrees, -90 to 90 | `editor.lunar_phase.latitude_desc` |
| Longitude | `editor.lunar_phase.longitude` |
| Decimal degrees, -180 to 180 | `editor.lunar_phase.longitude_desc` |
| Southern hemisphere | `editor.lunar_phase.southern_hemisphere` |
| Mirror the moon image the way it appears south of the equator. | `editor.lunar_phase.southern_hemisphere_desc` |
| Views & Layout | `editor.lunar_phase.layout_section` |
| Choose the default view, layout style, and moon graphic options. | `editor.lunar_phase.layout_section_desc` |
| Default view | `editor.lunar_phase.default_view` |
| View shown when the card loads. | `editor.lunar_phase.default_view_desc` |
| Phase | `editor.lunar_phase.view_phase` |
| Calendar | `editor.lunar_phase.view_calendar` |
| Horizon | `editor.lunar_phase.view_horizon` |
| Layout style | `editor.lunar_phase.layout` |
| Full shows everything; compact styles fit small dashboard slots and expand on tap. | `editor.lunar_phase.layout_desc` |
| Full | `editor.lunar_phase.layout_full` |
| Compact | `editor.lunar_phase.layout_compact` |
| Minimal | `editor.lunar_phase.layout_minimal` |
| Moon only | `editor.lunar_phase.layout_moon_only` |
| Moon position | `editor.lunar_phase.moon_position` |
| Side of the card the moon graphic sits on (full layout). | `editor.lunar_phase.moon_position_desc` |
| Left | `editor.lunar_phase.position_left` |
| Right | `editor.lunar_phase.position_right` |
| Moon size | `editor.lunar_phase.moon_size` |
| Diameter of the moon graphic. | `editor.lunar_phase.moon_size_desc` |
| Data items per page | `editor.lunar_phase.items_per_page` |
| Rows shown before the list paginates. Swipe or use the dots to switch pages. | `editor.lunar_phase.items_per_page_desc` |
| Show view switcher | `editor.lunar_phase.show_view_switcher` |
| Header buttons to switch between phase, calendar, and horizon views. | `editor.lunar_phase.show_view_switcher_desc` |
| Show date navigation | `editor.lunar_phase.show_date_nav` |
| Footer with previous / next day arrows and a back-to-today button. | `editor.lunar_phase.show_date_nav_desc` |
| Data Items | `editor.lunar_phase.data_section` |
| Hide individual data rows and control number and time formatting. | `editor.lunar_phase.data_section_desc` |
| Hidden items | `editor.lunar_phase.hidden_items` |
| Data rows that should not be displayed. | `editor.lunar_phase.hidden_items_desc` |
| Hide an item | `editor.lunar_phase.hide_item_add` |
| Decimal places | `editor.lunar_phase.number_decimals` |
| Precision for numeric values like illumination and azimuth. | `editor.lunar_phase.number_decimals_desc` |
| Distance in miles | `editor.lunar_phase.use_miles` |
| Show the moon distance in miles instead of kilometers. | `editor.lunar_phase.use_miles_desc` |
| 12-hour time | `editor.lunar_phase.time_12hr` |
| Use AM/PM times instead of 24-hour format. | `editor.lunar_phase.time_12hr_desc` |
| Horizon Graph | `editor.lunar_phase.graph_section` |
| Configure the 24-hour moon altitude chart. | `editor.lunar_phase.graph_section_desc` |
| Graph window | `editor.lunar_phase.graph_mode` |
| Today shows midnight to midnight; dynamic shows a rolling 24 hours around now. | `editor.lunar_phase.graph_mode_desc` |
| Today | `editor.lunar_phase.graph_today` |
| Dynamic | `editor.lunar_phase.graph_dynamic` |
| Show rise/set times | `editor.lunar_phase.graph_show_time` |
| Time labels at the moonrise and moonset markers. | `editor.lunar_phase.graph_show_time_desc` |
| Show current position | `editor.lunar_phase.graph_show_current` |
| Pulsing marker at the moon's current altitude. | `editor.lunar_phase.graph_show_current_desc` |
| Show highest point | `editor.lunar_phase.graph_show_highest` |
| Marker at the moon's transit (highest altitude). | `editor.lunar_phase.graph_show_highest_desc` |
| Show time axis | `editor.lunar_phase.graph_x_ticks` |
| Hour labels along the bottom of the chart. | `editor.lunar_phase.graph_x_ticks_desc` |
| Show altitude axis | `editor.lunar_phase.graph_y_ticks` |
| Degree labels along the left of the chart. | `editor.lunar_phase.graph_y_ticks_desc` |
| Appearance | `editor.lunar_phase.appearance_section` |
| Background, starfield, fonts, and colors. | `editor.lunar_phase.appearance_section_desc` |
| Background | `editor.lunar_phase.background_style` |
| Backdrop behind the moon and data. | `editor.lunar_phase.background_style_desc` |
| Night sky | `editor.lunar_phase.bg_night_sky` |
| Theme | `editor.lunar_phase.bg_theme` |
| Image | `editor.lunar_phase.bg_custom` |
| None | `editor.lunar_phase.bg_transparent` |
| Custom Background | `editor.lunar_phase.custom_bg_group` |
| Background image | `editor.lunar_phase.custom_background` |
| Upload an image or paste a URL. | `editor.lunar_phase.custom_background_desc` |
| Animated starfield | `editor.lunar_phase.show_starfield` |
| Twinkling stars layered over the background. | `editor.lunar_phase.show_starfield_desc` |
| Compact stat labels | `editor.lunar_phase.show_compact_labels` |
| Show text labels under the compact layout stats. | `editor.lunar_phase.show_compact_labels_desc` |
| Header font size | `editor.lunar_phase.header_font_size` |
| Size of the phase name header. | `editor.lunar_phase.header_font_size_desc` |
| Header text style | `editor.lunar_phase.header_text_transform` |
| Text transform applied to the header. | `editor.lunar_phase.header_text_transform_desc` |
| Header color | `editor.lunar_phase.header_color` |
| Leave empty for the automatic color. | `editor.lunar_phase.header_color_desc` |
| Label font size | `editor.lunar_phase.label_font_size` |
| Size of data labels and values. | `editor.lunar_phase.label_font_size_desc` |
| Label text style | `editor.lunar_phase.label_text_transform` |
| Text transform applied to data labels. | `editor.lunar_phase.label_text_transform_desc` |
| Label color | `editor.lunar_phase.label_color` |
| Leave empty for the automatic color. | `editor.lunar_phase.label_color_desc` |
| Accent color | `editor.lunar_phase.accent_color` |
| Markers, selected days, glow, and pagination. Leave empty for a moonlight silver. | `editor.lunar_phase.accent_color_desc` |
| Auto | `editor.lunar_phase.font_auto` |
| Small | `editor.lunar_phase.font_small` |
| Medium | `editor.lunar_phase.font_medium` |
| Large | `editor.lunar_phase.font_large` |
| X-Large | `editor.lunar_phase.font_x_large` |
| XX-Large | `editor.lunar_phase.font_xx_large` |
| None | `editor.lunar_phase.transform_none` |
| Capitalize | `editor.lunar_phase.transform_capitalize` |
| Uppercase | `editor.lunar_phase.transform_uppercase` |
| Lowercase | `editor.lunar_phase.transform_lowercase` |
| Today | `editor.lunar_phase.today` |
| Today | `editor.lunar_phase.back_to_today` |
| Previous day | `editor.lunar_phase.prev_day` |
| Next day | `editor.lunar_phase.next_day` |
| Previous month | `editor.lunar_phase.prev_month` |
| Next month | `editor.lunar_phase.next_month` |
| Collapse | `editor.lunar_phase.collapse` |
| days | `editor.lunar_phase.days` |
| Age | `editor.lunar_phase.age_short` |
| Rise | `editor.lunar_phase.rise_short` |
| Set | `editor.lunar_phase.set_short` |
| Over horizon | `editor.lunar_phase.over_horizon` |
| Under horizon | `editor.lunar_phase.under_horizon` |
| Moon age | `editor.lunar_phase.items.moon_age` |
| Illumination | `editor.lunar_phase.items.illumination` |
| Azimuth | `editor.lunar_phase.items.azimuth` |
| Altitude | `editor.lunar_phase.items.altitude` |
| Distance | `editor.lunar_phase.items.distance` |
| Position | `editor.lunar_phase.items.position` |
| Moonrise | `editor.lunar_phase.items.moonrise` |
| Moonset | `editor.lunar_phase.items.moonset` |
| Moon highest | `editor.lunar_phase.items.moon_highest` |
| Next full moon | `editor.lunar_phase.items.next_full_moon` |
| Next new moon | `editor.lunar_phase.items.next_new_moon` |
| Next phase | `editor.lunar_phase.items.next_phase` |
| New Moon | `editor.lunar_phase.phases.new_moon` |
| Waxing Crescent | `editor.lunar_phase.phases.waxing_crescent` |
| First Quarter | `editor.lunar_phase.phases.first_quarter` |
| Waxing Gibbous | `editor.lunar_phase.phases.waxing_gibbous` |
| Full Moon | `editor.lunar_phase.phases.full_moon` |
| Waning Gibbous | `editor.lunar_phase.phases.waning_gibbous` |
| Last Quarter | `editor.lunar_phase.phases.last_quarter` |
| Waning Crescent | `editor.lunar_phase.phases.waning_crescent` |

</details>

<details>
<summary><strong>Laundry tracker (editor)</strong> — 141 left</summary>

| English text | Key |
| --- | --- |
| Allow "Unloaded" | `editor.laundry_tracker.acknowledge_enabled` |
| Adds a button to clear an alert by hand. Resets when the browser reloads. | `editor.laundry_tracker.acknowledge_enabled_desc` |
| Add dryer | `editor.laundry_tracker.add_dryer` |
| Add washer | `editor.laundry_tracker.add_washer` |
| Advanced detection | `editor.laundry_tracker.advanced_detection` |
| Icon | `editor.laundry_tracker.appliance_icon` |
| Leave blank to use the default for this machine type. | `editor.laundry_tracker.appliance_icon_desc` |
| Machine type | `editor.laundry_tracker.appliance_kind` |
| Sets the default icon and detection thresholds. Dryers idle higher than washers. | `editor.laundry_tracker.appliance_kind_desc` |
| Name | `editor.laundry_tracker.appliance_name` |
| Shown on the status card. | `editor.laundry_tracker.appliance_name_desc` |
| Appliances | `editor.laundry_tracker.appliances_section` |
| Forgotten | `editor.laundry_tracker.color_alert` |
| A load is still sitting there. | `editor.laundry_tracker.color_alert_desc` |
| Card background | `editor.laundry_tracker.color_card_bg` |
| Behind each status card. | `editor.laundry_tracker.color_card_bg_desc` |
| Finished | `editor.laundry_tracker.color_done` |
| A cycle just ended. | `editor.laundry_tracker.color_done_desc` |
| Idle | `editor.laundry_tracker.color_idle` |
| Nothing happening. | `editor.laundry_tracker.color_idle_desc` |
| Running | `editor.laundry_tracker.color_running` |
| A cycle is in progress. | `editor.laundry_tracker.color_running_desc` |
| Secondary text | `editor.laundry_tracker.color_secondary` |
| Supporting detail text. | `editor.laundry_tracker.color_secondary_desc` |
| Text | `editor.laundry_tracker.color_text` |
| Primary text. | `editor.laundry_tracker.color_text_desc` |
| Colors | `editor.laundry_tracker.colors_section` |
| Leave any of these blank to follow the Home Assistant theme. | `editor.laundry_tracker.colors_section_desc` |
| Currency symbol | `editor.laundry_tracker.currency_symbol` |
| Prefixed to every cost figure. | `editor.laundry_tracker.currency_symbol_desc` |
| Laundry | `editor.laundry_tracker.default_title` |
| Remove machine | `editor.laundry_tracker.delete_appliance` |
| Display | `editor.laundry_tracker.display_section` |
| Choose which parts of the card are shown. | `editor.laundry_tracker.display_section_desc` |
| Done {time} ago | `editor.laundry_tracker.done_ago` |
| Door / lid sensor | `editor.laundry_tracker.door_entity` |
| Optional but the most reliable unload signal there is: opening the door after a cycle clears the alert. A contact sensor, or the door sensor of a smart appliance (Home Connect: open, closed, locked). | `editor.laundry_tracker.door_entity_desc` |
| Door open | `editor.laundry_tracker.door_open` |
| Drawing {watts} right now | `editor.laundry_tracker.drawing_now` |
| Edit machine | `editor.laundry_tracker.edit_appliance` |
| emptied | `editor.laundry_tracker.emptied` |
| Open the General tab and point a machine at its power sensor. | `editor.laundry_tracker.empty_desc` |
| Add a washer or dryer | `editor.laundry_tracker.empty_title` |
| Energy rate | `editor.laundry_tracker.energy_rate` |
| Cost per kWh used for the cycle cost estimate. | `editor.laundry_tracker.energy_rate_desc` |
| about {time} left, based on your last {count} cycles | `editor.laundry_tracker.est_finish` |
| should finish any minute now | `editor.laundry_tracker.est_finish_soon` |
| not enough past cycles to estimate a finish time yet | `editor.laundry_tracker.est_finish_unknown` |
| The dry load is still in the drum. | `editor.laundry_tracker.forgotten_dryer` |
| The wet load is still in the drum. | `editor.laundry_tracker.forgotten_washer` |
| {washer} is done and {dryer} is free | `editor.laundry_tracker.handoff_sub` |
| Move to dryer | `editor.laundry_tracker.handoff_title` |
| History window | `editor.laundry_tracker.history_days` |
| Longer windows give better averages but ask more of the recorder. | `editor.laundry_tracker.history_days_desc` |
| Could not read recorder history. Live wattage still works. | `editor.laundry_tracker.history_error` |
| History & cost | `editor.laundry_tracker.history_section` |
| How far back to read the recorder, and what a kilowatt-hour costs you. | `editor.laundry_tracker.history_section_desc` |
| Dryer | `editor.laundry_tracker.kind_dryer` |
| Washer | `editor.laundry_tracker.kind_washer` |
| Last cycle {time} ago | `editor.laundry_tracker.last_cycle_ago` |
| Layout | `editor.laundry_tracker.layout` |
| Stack the machines vertically, or sit them side by side. | `editor.laundry_tracker.layout_desc` |
| Row | `editor.laundry_tracker.layout_row` |
| Stack | `editor.laundry_tracker.layout_stack` |
| Reading cycle history… | `editor.laundry_tracker.loading_history` |
| Minimum cycle length | `editor.laundry_tracker.min_cycle_minutes` |
| Shorter runs are treated as noise rather than a real load. | `editor.laundry_tracker.min_cycle_minutes_desc` |
| Move down | `editor.laundry_tracker.move_down` |
| Move up | `editor.laundry_tracker.move_up` |
| No machines yet. Add a washer or a dryer to get started. | `editor.laundry_tracker.no_appliances_hint` |
| No cycles in the last {days} days | `editor.laundry_tracker.no_cycles_window` |
| No power or state sensor selected for this machine. | `editor.laundry_tracker.no_source` |
| {name} finished {time} ago and still has a load in it. | `editor.laundry_tracker.notify_message` |
| Fires at most once per load. A second nag only happens after the next cycle finishes. | `editor.laundry_tracker.notify_once_note` |
| Notifications | `editor.laundry_tracker.notify_section` |
| Optional push when a load is left sitting past its grace period. | `editor.laundry_tracker.notify_section_desc` |
| Notify service | `editor.laundry_tracker.notify_service` |
| For example notify.mobile_app_pixel. Leave blank to turn notifications off. | `editor.laundry_tracker.notify_service_desc` |
| Laundry is waiting | `editor.laundry_tracker.notify_title` |
| Finished | `editor.laundry_tracker.phase_finished` |
| Still loaded | `editor.laundry_tracker.phase_forgotten` |
| Idle | `editor.laundry_tracker.phase_idle` |
| Running | `editor.laundry_tracker.phase_running` |
| Not set up | `editor.laundry_tracker.phase_unknown` |
| Power sensor | `editor.laundry_tracker.power_entity` |
| Watts reported by a smart plug. This is what cycle detection reads. | `editor.laundry_tracker.power_entity_desc` |
| Turn a $15 smart plug into a laundry butler: automatic cycle detection, forgotten-load alerts, and running energy costs. | `editor.laundry_tracker.pro_description` |
| No sensor selected | `editor.laundry_tracker.row_no_entity` |
| running for {time} | `editor.laundry_tracker.running_for` |
| Running states | `editor.laundry_tracker.running_states` |
| States of the machine state entity that mean "running". Leave empty for a broad default set. | `editor.laundry_tracker.running_states_desc` |
| Settle time | `editor.laundry_tracker.settle_minutes` |
| How long the machine must stay quiet before the cycle closes. Stops a soak pause from ending the wash early. | `editor.laundry_tracker.settle_minutes_desc` |
| Show energy and cost | `editor.laundry_tracker.show_energy` |
| Turn off to hide kWh and money figures everywhere on the card. | `editor.laundry_tracker.show_energy_desc` |
| Show washer → dryer hint | `editor.laundry_tracker.show_handoff_hint` |
| Suggests moving the load when a wash finishes and a dryer is free. | `editor.laundry_tracker.show_handoff_hint_desc` |
| Show history stats | `editor.laundry_tracker.show_history_stats` |
| Cycle count, energy, cost and average duration for the window. | `editor.laundry_tracker.show_history_stats_desc` |
| Show forgotten-load alert | `editor.laundry_tracker.show_idle_alert` |
| The loud banner when a finished load is still sitting in the machine. | `editor.laundry_tracker.show_idle_alert_desc` |
| Show status cards | `editor.laundry_tracker.show_status_cards` |
| One card per machine with its current phase. | `editor.laundry_tracker.show_status_cards_desc` |
| Show timeline | `editor.laundry_tracker.show_timeline` |
| A strip of the history window with one lane per machine. | `editor.laundry_tracker.show_timeline_desc` |
| Show title | `editor.laundry_tracker.show_title` |
| Display a heading above the machines. | `editor.laundry_tracker.show_title_desc` |
| Sitting for {time} | `editor.laundry_tracker.sitting_for` |
| Start threshold | `editor.laundry_tracker.start_threshold` |
| Watts above which a cycle counts as started. | `editor.laundry_tracker.start_threshold_desc` |
| Machine state entity | `editor.laundry_tracker.state_entity` |
| Fallback for machines with no power sensor: an entity reporting run/idle from a smart-appliance integration. | `editor.laundry_tracker.state_entity_desc` |
| Average | `editor.laundry_tracker.stats_avg` |
| Busiest | `editor.laundry_tracker.stats_busiest` |
| Cost | `editor.laundry_tracker.stats_cost` |
| Cycles | `editor.laundry_tracker.stats_cycles` |
| Energy | `editor.laundry_tracker.stats_energy` |
| From {days} days of history | `editor.laundry_tracker.stats_footnote` |
| Stop threshold | `editor.laundry_tracker.stop_threshold` |
| Watts below which the machine looks finished. Keep it under the start threshold. | `editor.laundry_tracker.stop_threshold_desc` |
| Suggestion: start {start} W, stop {stop} W. | `editor.laundry_tracker.suggest_preview` |
| Suggest thresholds | `editor.laundry_tracker.suggest_thresholds` |
| Applied. Fine-tune them under Advanced detection if a cycle is missed. | `editor.laundry_tracker.suggested_applied` |
| Standby | `editor.laundry_tracker.threshold_floor` |
| What this sensor actually reported over the history window. | `editor.laundry_tracker.threshold_helper_desc` |
| Threshold helper | `editor.laundry_tracker.threshold_helper_title` |
| Reading recent history for this sensor… | `editor.laundry_tracker.threshold_loading` |
| Max | `editor.laundry_tracker.threshold_max` |
| Median | `editor.laundry_tracker.threshold_median` |
| Min | `editor.laundry_tracker.threshold_min` |
| No cycles recorded in this window yet. | `editor.laundry_tracker.timeline_empty` |
| Last {days} days | `editor.laundry_tracker.timeline_title` |
| Title | `editor.laundry_tracker.title` |
| Leave blank to use "Laundry". | `editor.laundry_tracker.title_desc` |
| d | `editor.laundry_tracker.unit_day` |
| h | `editor.laundry_tracker.unit_hour` |
| m | `editor.laundry_tracker.unit_minute` |
| Unload grace period | `editor.laundry_tracker.unload_grace` |
| How long after a cycle ends before the load counts as forgotten. | `editor.laundry_tracker.unload_grace_desc` |
| unloaded | `editor.laundry_tracker.unloaded_badge` |
| Unloaded | `editor.laundry_tracker.unloaded_button` |

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
<summary><strong>Cleaning zones (editor)</strong> — 122 left</summary>

| English text | Key |
| --- | --- |
| Add your first zone | `editor.cleaning_zones.add_first_title` |
| Add zone | `editor.cleaning_zones.add_zone` |
| Advanced | `editor.cleaning_zones.advanced_section` |
| Everything is on schedule | `editor.cleaning_zones.all_clear` |
| Trigger entity | `editor.cleaning_zones.auto_clean_entity` |
| Automatic cleaning | `editor.cleaning_zones.auto_clean_group` |
| State that means “cleaned” | `editor.cleaning_zones.auto_clean_state` |
| For example “docked” or “returning”. Matching is case-insensitive. | `editor.cleaning_zones.auto_clean_state_desc` |
| Card background | `editor.cleaning_zones.card_background_color` |
| Collapse | `editor.cleaning_zones.collapse` |
| Colors | `editor.cleaning_zones.colors_section` |
| Tap again | `editor.cleaning_zones.confirm_short` |
| {days}d ago | `editor.cleaning_zones.days_ago` |
| {days}d | `editor.cleaning_zones.days_short` |
| Default interval | `editor.cleaning_zones.default_interval` |
| Used by any zone that has not set its own interval. | `editor.cleaning_zones.default_interval_desc` |
| Cleaning Zones | `editor.cleaning_zones.default_title` |
| Delete zone | `editor.cleaning_zones.delete_zone` |
| Display | `editor.cleaning_zones.display_section` |
| Due | `editor.cleaning_zones.due_color` |
| Due in {days} days | `editor.cleaning_zones.due_in` |
| Due today | `editor.cleaning_zones.due_today` |
| Due tomorrow | `editor.cleaning_zones.due_tomorrow` |
| Edit | `editor.cleaning_zones.edit` |
| Floorplan image | `editor.cleaning_zones.floorplan_image` |
| Floorplan | `editor.cleaning_zones.floorplan_section` |
| Optional. Without an image the list view still works as a plain room-chore tracker. | `editor.cleaning_zones.floorplan_section_desc` |
| Fresh | `editor.cleaning_zones.fresh_color` |
| {count} fresh | `editor.cleaning_zones.fresh_count` |
| History kept per zone | `editor.cleaning_zones.history_limit` |
| Older entries are deleted so the to-do list does not grow without bound. | `editor.cleaning_zones.history_limit_desc` |
| Every {days} days | `editor.cleaning_zones.interval_label` |
| last by {name} | `editor.cleaning_zones.last_by` |
| Due | `editor.cleaning_zones.legend_due` |
| Fresh | `editor.cleaning_zones.legend_fresh` |
| Overdue | `editor.cleaning_zones.legend_overdue` |
| Loading cleaning history… | `editor.cleaning_zones.loading` |
| {name} cleaned automatically | `editor.cleaning_zones.log_auto` |
| {name} cleaned | `editor.cleaning_zones.log_clean` |
| Record who cleaned | `editor.cleaning_zones.log_cleaner` |
| Stores a name alongside each entry so you can see who did what. | `editor.cleaning_zones.log_cleaner_desc` |
| {name} marked clean | `editor.cleaning_zones.logged_clean` |
| Mark clean | `editor.cleaning_zones.mark_clean` |
| Move down | `editor.cleaning_zones.move_down` |
| Move up | `editor.cleaning_zones.move_up` |
| {count} need attention | `editor.cleaning_zones.needs_attention` |
| Never cleaned | `editor.cleaning_zones.never_cleaned` |
| New zone | `editor.cleaning_zones.new_zone_name` |
| No cleans recorded yet | `editor.cleaning_zones.no_history` |
| No zones yet. Add one below, or drag a rectangle on the floorplan above. | `editor.cleaning_zones.no_zones_editor` |
| Overdue by {days} days | `editor.cleaning_zones.overdue_by` |
| Overdue | `editor.cleaning_zones.overdue_color` |
| Overdue grace period | `editor.cleaning_zones.overdue_grace` |
| How many days past the interval a room stays merely “due” before it turns overdue. | `editor.cleaning_zones.overdue_grace_desc` |
| Person | `editor.cleaning_zones.person_entity` |
| Whose name to record. The card cannot tell who tapped it, so this is a fixed attribution. | `editor.cleaning_zones.person_entity_desc` |
| Drag on empty space to draw a new zone. Drag a zone to move it, its bottom-right corner to resize, or the knob above it to rotate. Hold Shift while rotating to snap to 15°. | `editor.cleaning_zones.placement_hint` |
| Upload a floorplan above to place zones by dragging. You can still add zones and set their position numerically. | `editor.cleaning_zones.placement_needs_image` |
| Height % | `editor.cleaning_zones.pos_h` |
| Width % | `editor.cleaning_zones.pos_w` |
| Left % | `editor.cleaning_zones.pos_x` |
| Top % | `editor.cleaning_zones.pos_y` |
| Cleaning Zones is a Pro feature: draw rooms on your floorplan, give each one a cleaning interval, and watch them shade from fresh to overdue. Tap a room to log that it was cleaned. | `editor.cleaning_zones.pro_description` |
| Confirm before logging | `editor.cleaning_zones.require_confirm` |
| Asks for a second tap. Worth turning on for a wall tablet where stray taps happen. | `editor.cleaning_zones.require_confirm_desc` |
| Drag to rotate | `editor.cleaning_zones.rotate_handle` |
| every {days} days | `editor.cleaning_zones.row_every_days` |
| Secondary text | `editor.cleaning_zones.secondary_text_color` |
| Choose a Local To-do helper under Storage in the General tab. Every clean you log is saved there. | `editor.cleaning_zones.setup_desc` |
| Pick a cleaning history list | `editor.cleaning_zones.setup_title` |
| Show legend | `editor.cleaning_zones.show_legend` |
| Show summary bar | `editor.cleaning_zones.show_summary_bar` |
| A one-line count of what needs attention, plus the most overdue room. | `editor.cleaning_zones.show_summary_bar_desc` |
| Show title | `editor.cleaning_zones.show_title` |
| Show zone labels | `editor.cleaning_zones.show_zone_labels` |
| Labels are hidden automatically on zones that are too small to fit them. | `editor.cleaning_zones.show_zone_labels_desc` |
| Interval | `editor.cleaning_zones.sort_interval` |
| List order | `editor.cleaning_zones.sort_mode` |
| How rooms are ordered in the list view. | `editor.cleaning_zones.sort_mode_desc` |
| Name | `editor.cleaning_zones.sort_name` |
| Most overdue | `editor.cleaning_zones.sort_staleness` |
| Staleness style | `editor.cleaning_zones.staleness_style` |
| How overdue rooms stand out on the map. | `editor.cleaning_zones.staleness_style_desc` |
| Cleaning history lives on a to-do list so every device in the house sees the same log. Create one under Settings → Devices & Services → Helpers → To-do list (Local to-do), name it something like “Cleaning”, then pick … | `editor.cleaning_zones.storage_help` |
| Storage | `editor.cleaning_zones.storage_section` |
| Badge | `editor.cleaning_zones.style_badge` |
| Heat | `editor.cleaning_zones.style_heat` |
| Outline | `editor.cleaning_zones.style_outline` |
| Text | `editor.cleaning_zones.text_color` |
| Title override | `editor.cleaning_zones.title` |
| Leave blank to use “Cleaning Zones”. | `editor.cleaning_zones.title_desc` |
| Today | `editor.cleaning_zones.today` |
| Cleaning history list | `editor.cleaning_zones.todo_entity` |
| A Local To-do helper used as storage. Entries are saved as completed items, so they stay out of your active to-do view. | `editor.cleaning_zones.todo_entity_desc` |
| This list cannot store item descriptions (the Shopping List behaves this way). Tracking still works, but the stored data is appended to each item title and looks messy in the Home Assistant to-do panel. A Local To-do … | `editor.cleaning_zones.todo_no_description` |
| Undo | `editor.cleaning_zones.undo` |
| days | `editor.cleaning_zones.unit_days` |
| Unnamed zone | `editor.cleaning_zones.unnamed_zone` |
| Use the module default ({days} days) | `editor.cleaning_zones.use_default_interval` |
| Both | `editor.cleaning_zones.view_both` |
| List | `editor.cleaning_zones.view_list` |
| Map | `editor.cleaning_zones.view_map` |
| View | `editor.cleaning_zones.view_mode` |
| What the card shows. Map falls back to the list when no image is set. | `editor.cleaning_zones.view_mode_desc` |
| Most overdue: {name} | `editor.cleaning_zones.worst_zone` |
| Yesterday | `editor.cleaning_zones.yesterday` |
| Zone color override | `editor.cleaning_zones.zone_color` |
| Leave blank to use the fresh → overdue gradient. | `editor.cleaning_zones.zone_color_desc` |
| Icon | `editor.cleaning_zones.zone_icon` |
| Shown in the list view and on larger map zones. | `editor.cleaning_zones.zone_icon_desc` |
| Clean every | `editor.cleaning_zones.zone_interval` |
| How often this area should be cleaned. | `editor.cleaning_zones.zone_interval_desc` |
| Name | `editor.cleaning_zones.zone_name` |
| Notes | `editor.cleaning_zones.zone_notes` |
| Zone opacity | `editor.cleaning_zones.zone_opacity` |
| How strongly zone tints cover the floorplan. | `editor.cleaning_zones.zone_opacity_desc` |
| Position on the floorplan | `editor.cleaning_zones.zone_position` |
| Percentages of the image, measured from the top-left corner. Usually easier to set by dragging on the map above. | `editor.cleaning_zones.zone_position_desc` |
| Rotation | `editor.cleaning_zones.zone_rotation` |
| Angle the zone to line up with a room that is not square to the image, such as on an isometric floorplan. | `editor.cleaning_zones.zone_rotation_desc` |
| Zones | `editor.cleaning_zones.zones_section` |
| One entry per room or area. A name and an interval are all that is required. | `editor.cleaning_zones.zones_section_desc` |

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
<summary><strong>Vampire power (editor)</strong> — 109 left</summary>

| English text | Key |
| --- | --- |
| Advanced thresholds | `editor.vampire_power.advanced_thresholds` |
| Analysis | `editor.vampire_power.analysis_section` |
| A device is measured by the wattage it never drops below. A longer window gives a steadier estimate but takes longer to load. | `editor.vampire_power.analysis_section_desc` |
| Standby percentile | `editor.vampire_power.baseline_percentile` |
| Which point of the wattage distribution counts as idle. 0.10 means the level the device stayed at or below for 10% of the window. Lower is stricter and reports a lower floor; higher includes light activity. | `editor.vampire_power.baseline_percentile_desc` |
| Bar | `editor.vampire_power.color_bar` |
| Row background | `editor.vampire_power.color_card_bg` |
| Offender | `editor.vampire_power.color_offender` |
| Secondary text | `editor.vampire_power.color_secondary` |
| Text | `editor.vampire_power.color_text` |
| Colors | `editor.vampire_power.colors_section` |
| Estimated from limited history ({samples} samples) | `editor.vampire_power.confidence_low` |
| Cost period | `editor.vampire_power.cost_period` |
| Annual figures are the ones large enough to act on; daily figures are easier to sanity-check. | `editor.vampire_power.cost_period_desc` |
| Cost | `editor.vampire_power.cost_section` |
| What the wasted energy is worth. Costs are estimates based on a flat rate. | `editor.vampire_power.cost_section_desc` |
| Currency symbol | `editor.vampire_power.currency_symbol` |
| Shown in front of every cost figure. | `editor.vampire_power.currency_symbol_desc` |
| Vampire Power | `editor.vampire_power.default_title` |
| Discovery | `editor.vampire_power.discovery_mode` |
| Auto scans Home Assistant for power sensors, Manual uses only the list below, Both merges them. | `editor.vampire_power.discovery_mode_desc` |
| Hide this device | `editor.vampire_power.dismiss_row` |
| Dismissed devices | `editor.vampire_power.dismissed` |
| {count} devices were dismissed from the card and are excluded from the ranking and the totals. | `editor.vampire_power.dismissed_desc` |
| Nothing dismissed. Use the × on a row in the card preview to hide a device you do not want ranked. | `editor.vampire_power.dismissed_empty` |
| Display | `editor.vampire_power.display_section` |
| Energy rate | `editor.vampire_power.energy_rate` |
| Cost of one kilowatt-hour, taken from your electricity bill. | `editor.vampire_power.energy_rate_desc` |
| Power sensors | `editor.vampire_power.entities` |
| Sensors added here are always analyzed, even when the whole-home filter would have skipped them. | `editor.vampire_power.entities_desc` |
| Add a power sensor | `editor.vampire_power.entities_ph` |
| No power sensors found | `editor.vampire_power.err_empty` |
| Waiting for Home Assistant | `editor.vampire_power.err_ha` |
| Connecting to entity states… | `editor.vampire_power.err_ha_desc` |
| Could not read history | `editor.vampire_power.err_history` |
| The recorder did not return data for these sensors. Check that the recorder integration is keeping history for them. | `editor.vampire_power.err_history_desc` |
| Add at least one power sensor, or switch discovery to Auto or Both. | `editor.vampire_power.error_manual_empty` |
| The standby noise floor must be lower than the always-on cutoff. | `editor.vampire_power.error_range` |
| Energy rate cannot be negative. | `editor.vampire_power.error_rate_negative` |
| Exclude patterns | `editor.vampire_power.exclude_patterns` |
| Sensors whose entity id or name contains any of these words are skipped. Auto discovery already skips whole-home meters (names like total, house, grid or mains); add your own words here for anything else you never wan… | `editor.vampire_power.exclude_patterns_desc` |
| e.g. solar, inverter | `editor.vampire_power.exclude_patterns_ph` |
| Only the first {max} are analyzed to keep the recorder query fast. | `editor.vampire_power.found_capped` |
| Smart plugs and energy monitors expose these. Switch to Manual to add one by hand. | `editor.vampire_power.found_none_hint` |
| Whole-home and grid meters are skipped so they cannot swamp the ranking. | `editor.vampire_power.found_ok_hint` |
| Found {count} power sensors | `editor.vampire_power.found_sensors` |
| Offender threshold | `editor.vampire_power.highlight_threshold` |
| Devices idling at or above this wattage are drawn in the offender colour. | `editor.vampire_power.highlight_threshold_desc` |
| The top {count} devices cost {cost} a year while idle. Switching them off on a schedule would recover most of that. | `editor.vampire_power.hint_many` |
| {name} alone costs {cost} a year doing nothing. A scheduled smart plug would recover most of that. | `editor.vampire_power.hint_one` |
| History window | `editor.vampire_power.history_days` |
| How far back to read the recorder. Seven days covers a full weekly routine; longer windows need recorder history to match. | `editor.vampire_power.history_days_desc` |
| Layout | `editor.vampire_power.layout` |
| Cards | `editor.vampire_power.layout_cards` |
| Compact | `editor.vampire_power.layout_compact` |
| Ranked shows a bar per device, Cards is a tile grid, Compact is a dense list. | `editor.vampire_power.layout_desc` |
| Ranked | `editor.vampire_power.layout_ranked` |
| Analyzing {count} power sensors over {days} days of history… | `editor.vampire_power.loading_note` |
| Devices shown | `editor.vampire_power.max_items` |
| The total bar always covers every analyzed device, even when the list is trimmed. | `editor.vampire_power.max_items_desc` |
| Always-on cutoff | `editor.vampire_power.max_standby_watts` |
| Floors above this belong to genuinely always-on appliances such as a fridge or a server. They are listed separately instead of being ranked as standby waste. | `editor.vampire_power.max_standby_watts_desc` |
| Noise floor | `editor.vampire_power.min_standby_watts` |
| Standby loads under this are treated as measurement noise and left out entirely. | `editor.vampire_power.min_standby_watts_desc` |
| Auto | `editor.vampire_power.mode_auto` |
| Both | `editor.vampire_power.mode_both` |
| Manual | `editor.vampire_power.mode_manual` |
| No standby waste found | `editor.vampire_power.no_waste` |
| Every sensor idled below {watts} W across the last {days} days. Lower the noise floor under Analysis to see smaller loads. | `editor.vampire_power.no_waste_desc` |
| {count} always-on devices draw more than {watts} W even at rest ({names}). They are running, not idling. | `editor.vampire_power.note_always_on` |
| Analyzing the first {analyzed} of {total} power sensors. | `editor.vampire_power.note_capped` |
| {count} sensors need more history before they can be ranked. | `editor.vampire_power.note_insufficient` |
| /day | `editor.vampire_power.per_day` |
| /mo | `editor.vampire_power.per_month` |
| /yr | `editor.vampire_power.per_year` |
| Day | `editor.vampire_power.period_day` |
| Month | `editor.vampire_power.period_month` |
| Year | `editor.vampire_power.period_year` |
| Vampire Power reads your recorder history to find the standby loads that never switch off, and tells you what each one costs per year. | `editor.vampire_power.pro_description` |
| Restore dismissed | `editor.vampire_power.restore_dismissed` |
| idle {pct}% of the time | `editor.vampire_power.row_idle_fraction` |
| peaks at {watts} W | `editor.vampire_power.row_peak` |
| {pct}% of its usage is idle | `editor.vampire_power.row_waste_ratio` |
| Sensors | `editor.vampire_power.sensors_section` |
| Choose which power sensors are analyzed. Auto finds every sensor reporting watts, so most homes need nothing here. | `editor.vampire_power.sensors_section_desc` |
| Show bars | `editor.vampire_power.show_bars` |
| Each row gets a bar sized against the worst offender. | `editor.vampire_power.show_bars_desc` |
| Show cost | `editor.vampire_power.show_cost` |
| Turn off to show wattage only. | `editor.vampire_power.show_cost_desc` |
| Show takeaway | `editor.vampire_power.show_savings_hint` |
| A one-line summary of what the worst offenders add up to. | `editor.vampire_power.show_savings_hint_desc` |
| Show title | `editor.vampire_power.show_title` |
| Display a header above the card. | `editor.vampire_power.show_title_desc` |
| Show total | `editor.vampire_power.show_total_bar` |
| The headline figure for the whole home. | `editor.vampire_power.show_total_bar_desc` |
| Cost | `editor.vampire_power.sort_cost` |
| Sort by | `editor.vampire_power.sort_mode` |
| Cost ranks by annual waste and breaks ties in favour of devices that are almost purely idle. | `editor.vampire_power.sort_mode_desc` |
| Name | `editor.vampire_power.sort_name` |
| Watts | `editor.vampire_power.sort_watts` |
| Title | `editor.vampire_power.title` |
| Leave blank to use the module name. | `editor.vampire_power.title_desc` |
| Standby load split across {count} devices | `editor.vampire_power.total_bar_aria` |
| Other devices | `editor.vampire_power.total_bar_rest` |
| Across {devices} devices, measured over {days} days of history | `editor.vampire_power.total_footer` |
| Standby waste | `editor.vampire_power.total_label` |
| days | `editor.vampire_power.unit_days` |
| W | `editor.vampire_power.unit_watts` |
| W | `editor.vampire_power.watt_symbol` |

</details>

<details>
<summary><strong>Unifi (editor)</strong> — 104 left</summary>

| English text | Key |
| --- | --- |
| Accent | `editor.unifi.accent_color` |
| Rings, highlights, and flow accents. | `editor.unifi.accent_color_desc` |
| Full | `editor.unifi.anim_full` |
| Off | `editor.unifi.anim_off` |
| Subtle | `editor.unifi.anim_subtle` |
| Animation | `editor.unifi.animation` |
| Port blink, traffic flow, and ring motion. Respects prefers-reduced-motion. | `editor.unifi.animation_desc` |
| Blank background | `editor.unifi.blank_background` |
| Add | `editor.unifi.client_add` |
| Clients | `editor.unifi.client_list` |
| Clients are opt-in: the Clients view only shows the ones you add here. | `editor.unifi.client_list_hint` |
| Remove | `editor.unifi.client_remove` |
| {added} of {total} added | `editor.unifi.clients_added` |
| {count} network clients available in the Clients view. | `editor.unifi.clients_aside` |
| Remove all | `editor.unifi.clients_clear` |
| Showing {shown} of {total} UniFi devices. Manage visibility in the General tab. | `editor.unifi.curation_note` |
| No UniFi Network integration detected. Add it in Home Assistant, then this card will auto-discover your gear. | `editor.unifi.empty` |
| Filter by type | `editor.unifi.filter_kind` |
| {count} clients with bandwidth sensors | `editor.unifi.found_clients` |
| Found {count} UniFi devices | `editor.unifi.found_devices` |
| Devices appear automatically from the UniFi Network integration. | `editor.unifi.found_hint` |
| Gateways, switches, APs and PDUs from the UniFi Network integration. | `editor.unifi.found_hint_infra` |
| Found {count} UniFi devices ({shown} shown) | `editor.unifi.found_infra` |
| No UniFi devices found yet | `editor.unifi.found_none` |
| Hide | `editor.unifi.hide` |
| Hide all | `editor.unifi.hide_all` |
| Include clients | `editor.unifi.include_clients` |
| Discover client bandwidth sensors for the Clients view. | `editor.unifi.include_clients_desc` |
| All ({n}) | `editor.unifi.kind_all` |
| APs ({n}) | `editor.unifi.kind_ap` |
| Cameras ({n}) | `editor.unifi.kind_camera` |
| Gateways ({n}) | `editor.unifi.kind_gateway` |
| NVRs ({n}) | `editor.unifi.kind_nvr` |
| PDUs ({n}) | `editor.unifi.kind_pdu` |
| Plugs ({n}) | `editor.unifi.kind_plug` |
| Switches ({n}) | `editor.unifi.kind_switch` |
| No clients match this filter. | `editor.unifi.no_client_match` |
| Radial | `editor.unifi.layout_radial` |
| Tree | `editor.unifi.layout_tree` |
| No devices match this filter. | `editor.unifi.no_match` |
| Ports device | `editor.unifi.ports_device` |
| Which switch or gateway the Ports view focuses on. | `editor.unifi.ports_device_desc` |
| Rack style | `editor.unifi.rack_style` |
| Visual theme for the virtual rack and faceplates. | `editor.unifi.rack_style_desc` |
| Search | `editor.unifi.search_devices` |
| Filter by name or model. | `editor.unifi.search_devices_desc` |
| Colors | `editor.unifi.section_colors` |
| Optional accent overrides. | `editor.unifi.section_colors_desc` |
| Devices | `editor.unifi.section_devices` |
| Display | `editor.unifi.section_display` |
| Title, style, and eye-candy controls. | `editor.unifi.section_display_desc` |
| View | `editor.unifi.section_view` |
| Pick how this card visualizes your UniFi network. | `editor.unifi.section_view_desc` |
| Show | `editor.unifi.show` |
| Show advanced info | `editor.unifi.show_advanced` |
| Extra stats like RX/TX rates, uptime, and port counts. | `editor.unifi.show_advanced_desc` |
| Live camera previews | `editor.unifi.show_camera_previews` |
| Show live snapshots on UniFi Protect camera tiles instead of product photos. | `editor.unifi.show_camera_previews_desc` |
| Topology links | `editor.unifi.topology_links` |
| Auto ({name}) | `editor.unifi.uplink_auto` |
| Show all | `editor.unifi.show_all` |
| Port tooltips | `editor.unifi.show_port_labels` |
| Show port name / speed tooltips on faceplates. | `editor.unifi.show_port_labels_desc` |
| Show rack gear only | `editor.unifi.show_rack_gear` |
| Show setup wizard | `editor.unifi.show_setup` |
| Show sparklines | `editor.unifi.show_sparklines` |
| Mini history graphs on devices and WAN cards (uses recorder). | `editor.unifi.show_sparklines_desc` |
| Show title | `editor.unifi.show_title` |
| Show the card title above the view. | `editor.unifi.show_title_desc` |
| Search | `editor.unifi.search_clients` |
| Filter by name or MAC. | `editor.unifi.search_clients_desc` |
| Showing {shown} of {total} | `editor.unifi.showing_count` |
| Real device photos | `editor.unifi.use_device_images` |
| Show actual Ubiquiti product photos from ui.com. Falls back to drawn faceplates when offline. | `editor.unifi.use_device_images_desc` |
| Rack order | `editor.unifi.rack_order` |
| Drag devices to arrange the rack top to bottom. | `editor.unifi.rack_order_hint` |
| Move up | `editor.unifi.move_up` |
| Move down | `editor.unifi.move_down` |
| Blank | `editor.unifi.style_blank` |
| Dark | `editor.unifi.style_dark` |
| Glass | `editor.unifi.style_glass` |
| Light | `editor.unifi.style_light` |
| Title | `editor.unifi.title` |
| UniFi Network | `editor.unifi.title_default` |
| Optional heading text. | `editor.unifi.title_desc` |
| Topology layout | `editor.unifi.topology_layout` |
| Tree follows uplinks; radial fans out from the gateway. | `editor.unifi.topology_layout_desc` |
| View mode | `editor.unifi.view` |
| Clients | `editor.unifi.view_clients` |
| Rack is the hero layout. Ports, devices, topology, clients and WAN cover the rest. | `editor.unifi.view_desc` |
| Devices | `editor.unifi.view_devices` |
| Ports | `editor.unifi.view_ports` |
| Rack | `editor.unifi.view_rack` |
| Topology | `editor.unifi.view_topology` |
| Ask a Home Assistant admin to enable these entities, or sign in as an admin to use one-click setup. | `editor.unifi.wizard_admin_required` |
| Port bandwidth sensors are missing entirely. In Settings → Devices & services → UniFi Network → Configure → More options, enable “Bandwidth usage sensors for network clients”, then come back and enable the new sensors. | `editor.unifi.wizard_bandwidth_option` |
| {count} useful UniFi sensors are disabled (port RX/TX, link speed, PoE, etc.). Enable them for live port lights and traffic. | `editor.unifi.wizard_disabled` |
| Dismiss | `editor.unifi.wizard_dismiss` |
| Enable sensors | `editor.unifi.wizard_enable` |
| Enabling… | `editor.unifi.wizard_enabling` |
| Checking UniFi setup… | `editor.unifi.wizard_loading` |
| No Ubiquiti UniFi devices were found. Install the official UniFi Network integration, then reload this card. | `editor.unifi.wizard_no_devices` |
| Open UniFi integration | `editor.unifi.wizard_open_integration` |
| UniFi setup | `editor.unifi.wizard_title` |

</details>

<details>
<summary><strong>Navigation (editor)</strong> — 103 left</summary>

| English text | Key |
| --- | --- |
| COLLAPSE & AUTO-HIDE | `editor.navigation.section_collapse` |
| Hide the navbar to free up dashboard space. Choose an edge handle, icon rail, or hide-on-scroll. Collapse and auto-hide are mutually exclusive. | `editor.navigation.section_collapse_desc` |
| Enable Collapse | `editor.navigation.collapse_enable` |
| Allow the navbar to collapse and expand on demand. | `editor.navigation.collapse_enable_desc` |
| Collapse Mode | `editor.navigation.collapse_mode` |
| How the navbar collapses and reappears. | `editor.navigation.collapse_mode_desc` |
| Edge Handle | `editor.navigation.collapse_mode_handle` |
| Icon Rail | `editor.navigation.collapse_mode_rail` |
| Hide on Scroll | `editor.navigation.collapse_mode_scroll` |
| Start Collapsed | `editor.navigation.start_collapsed` |
| Begin collapsed when no saved preference exists. | `editor.navigation.start_collapsed_desc` |
| Remember State | `editor.navigation.remember_state` |
| Persist collapsed/expanded across reloads. | `editor.navigation.remember_state_desc` |
| Handle Icon | `editor.navigation.handle_icon` |
| Icon shown on the edge tab when collapsed. | `editor.navigation.handle_icon_desc` |
| Handle Size | `editor.navigation.handle_size` |
| Size of the edge tab in pixels. | `editor.navigation.handle_size_desc` |
| Handle Position | `editor.navigation.handle_position` |
| Position of the handle along the edge (percent). | `editor.navigation.handle_position_desc` |
| Rail Size | `editor.navigation.rail_size` |
| Width/height of the collapsed icon rail in pixels. | `editor.navigation.rail_size_desc` |
| Backdrop | `editor.navigation.backdrop` |
| Dim the dashboard behind an expanded lateral navbar. Defaults on for left/right. | `editor.navigation.backdrop_desc` |
| Close on Navigate | `editor.navigation.close_on_navigate` |
| Collapse the navbar after tapping a route. | `editor.navigation.close_on_navigate_desc` |
| Scroll Threshold | `editor.navigation.scroll_threshold` |
| Pixels scrolled before the navbar hides or reappears. | `editor.navigation.scroll_threshold_desc` |
| Enable Auto-Hide | `editor.navigation.autohide_enable` |
| macOS-style: hide after idle, reveal on edge hover. Desktop mouse only. | `editor.navigation.autohide_enable_desc` |
| Hide Delay | `editor.navigation.autohide_delay` |
| Seconds of inactivity before the navbar hides. | `editor.navigation.autohide_delay_desc` |
| Auto-hide is unavailable while collapse is enabled. Disable collapse to use auto-hide. | `editor.navigation.autohide_disabled_by_collapse` |
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
<summary><strong>Rain radar (editor)</strong> — 102 left</summary>

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
| Auto | `editor.rain_radar.weather_model_auto` |

</details>

<details>
<summary><strong>Auto entity list (editor)</strong> — 94 left</summary>

| English text | Key |
| --- | --- |
| Auto Entities List | `editor.auto_entity_list.default_title` |
| Row Style | `editor.auto_entity_list.section_style` |
| Compact | `editor.auto_entity_list.style_compact` |
| Icon + name + state | `editor.auto_entity_list.style_compact_desc` |
| Detailed | `editor.auto_entity_list.style_detailed` |
| Two-line rows | `editor.auto_entity_list.style_detailed_desc` |
| Slim | `editor.auto_entity_list.style_slim` |
| Name only, dense | `editor.auto_entity_list.style_slim_desc` |
| Card | `editor.auto_entity_list.style_card` |
| Pill rows with accent | `editor.auto_entity_list.style_card_desc` |
| Display | `editor.auto_entity_list.section_display` |
| Title | `editor.auto_entity_list.title` |
| Header above the list. | `editor.auto_entity_list.title_desc` |
| Show title | `editor.auto_entity_list.show_title` |
| Display header. | `editor.auto_entity_list.show_title_desc` |
| Show icon | `editor.auto_entity_list.show_icon` |
| Show each entity's icon. | `editor.auto_entity_list.show_icon_desc` |
| Show state | `editor.auto_entity_list.show_state` |
| Show current state value. | `editor.auto_entity_list.show_state_desc` |
| Show last changed | `editor.auto_entity_list.show_last_changed` |
| Show "2m ago" style timestamp. | `editor.auto_entity_list.show_last_changed_desc` |
| Color state with entity color | `editor.auto_entity_list.use_entity_color` |
| When an entity exposes a color (light bulb RGB, etc.) use it for the state, icon, and card accent. | `editor.auto_entity_list.use_entity_color_desc` |
| Card Size | `editor.auto_entity_list.section_card_size` |
| Card height | `editor.auto_entity_list.card_height` |
| Minimum row height. 0 = auto (fits content). | `editor.auto_entity_list.card_height_desc` |
| Card width | `editor.auto_entity_list.card_width` |
| Maximum row width in pixels. 0 = fill container. | `editor.auto_entity_list.card_width_desc` |
| Max items | `editor.auto_entity_list.max_items` |
| Maximum entities to display. | `editor.auto_entity_list.max_items_desc` |
| Row spacing | `editor.auto_entity_list.row_gap` |
| Vertical gap between rows. Applies to every style. | `editor.auto_entity_list.row_gap_desc` |
| Columns | `editor.auto_entity_list.columns` |
| Arrange rows in a grid. 1 = single column (default). | `editor.auto_entity_list.columns_desc` |
| Sort by | `editor.auto_entity_list.sort_by` |
| Order of entities. | `editor.auto_entity_list.sort_by_desc` |
| Name A–Z | `editor.auto_entity_list.sort_name` |
| Last changed | `editor.auto_entity_list.sort_last_changed` |
| State (text) | `editor.auto_entity_list.sort_state` |
| Domain | `editor.auto_entity_list.sort_domain` |
| Sort direction | `editor.auto_entity_list.sort_direction` |
| Ascending | `editor.auto_entity_list.sort_asc` |
| Descending | `editor.auto_entity_list.sort_desc_dir` |
| Filters | `editor.auto_entity_list.section_filters` |
| Domains | `editor.auto_entity_list.include_domains` |
| Only entities from these domains (e.g. light, binary_sensor). Empty = all. | `editor.auto_entity_list.include_domains_desc` |
| e.g. light, sensor | `editor.auto_entity_list.include_domains_ph` |
| Device classes | `editor.auto_entity_list.include_device_classes` |
| Filter by attributes.device_class (e.g. motion, door, temperature). | `editor.auto_entity_list.include_device_classes_desc` |
| e.g. motion, door | `editor.auto_entity_list.include_device_classes_ph` |
| State condition (optional) | `editor.auto_entity_list.state_filter` |
| Only show entities whose state matches. Leave operator empty to disable. | `editor.auto_entity_list.state_filter_desc` |
| Include keywords | `editor.auto_entity_list.include_keywords` |
| Entity id must contain at least one of these substrings. | `editor.auto_entity_list.include_keywords_desc` |
| Exclude keywords | `editor.auto_entity_list.exclude_keywords` |
| Entity ids containing any of these substrings are ignored. | `editor.auto_entity_list.exclude_keywords_desc` |
| e.g. living, kitchen | `editor.auto_entity_list.keyword_ph` |
| Show unavailable / unknown | `editor.auto_entity_list.show_unavailable` |
| When off, entities in unavailable or unknown states are hidden. | `editor.auto_entity_list.show_unavailable_desc` |
| Entity source | `editor.auto_entity_list.section_source` |
| Pinned entities | `editor.auto_entity_list.pinned_entities` |
| Always appear first, regardless of filters. Click a chip to edit overrides; hover to remove. | `editor.auto_entity_list.pinned_entities_desc` |
| Pin entity | `editor.auto_entity_list.pin_entity` |
| Add pinned entity | `editor.auto_entity_list.pinned_add` |
| Hidden entities | `editor.auto_entity_list.hidden_entities` |
| Removed from the auto list. Remove with the × on a chip. | `editor.auto_entity_list.hidden_entities_desc` |
| Add hidden entity | `editor.auto_entity_list.hidden_add` |
| No entity selected | `editor.auto_entity_list.no_entity` |
| Entity | `editor.auto_entity_list.entity` |
| Entity to pin to the top. | `editor.auto_entity_list.entity_desc` |
| Overrides for | `editor.auto_entity_list.overrides_for` |
| Label override | `editor.auto_entity_list.label_override` |
| Icon override | `editor.auto_entity_list.icon_override` |
| Row color override | `editor.auto_entity_list.row_color` |
| Colors | `editor.auto_entity_list.section_colors` |
| Text | `editor.auto_entity_list.color_text` |
| Secondary text | `editor.auto_entity_list.color_secondary` |
| Card background | `editor.auto_entity_list.color_card_bg` |
| Accent / Icon | `editor.auto_entity_list.color_accent` |
| Active state | `editor.auto_entity_list.color_active` |
| Inactive state | `editor.auto_entity_list.color_inactive` |
| Waiting for Home Assistant | `editor.auto_entity_list.err_ha` |
| Connecting to entity states… | `editor.auto_entity_list.err_ha_desc` |
| No entities match | `editor.auto_entity_list.err_empty` |
| Adjust the filters in the General tab or pin some entities. | `editor.auto_entity_list.err_empty_desc` |
| Remove from list | `editor.auto_entity_list.preview_remove` |
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
<summary><strong>Freespace</strong> — 94 left</summary>

| English text | Key |
| --- | --- |
| This view still has {count} cards in Sections. Import them into FreeSpace? | `freespace.import_sections` |
| Import sections | `freespace.import_sections_action` |
| Install Ultra Card Connect to arrange FreeSpace cards. | `freespace.requires_connect` |
| Phone is using the Desktop layout, stacked for readability. Choose Custom in the toolbar to arrange a Phone layout. | `freespace.narrow_hint` |
| Add a card to start building. | `freespace.empty` |
| Add card | `freespace.add_card` |
| Breakpoints | `freespace.breakpoints` |
| Desktop | `freespace.bp_desktop` |
| Laptop | `freespace.bp_laptop` |
| Tablet | `freespace.bp_tablet` |
| Phone | `freespace.bp_phone` |
| Click to select, Shift-click or drag on empty space to select several. Double-click to edit. Right-click for the card menu. | `freespace.select_hint` |
| Showing {bp} at true size. Dashed lines mark the device edges. | `freespace.device_preview_hint` |
| Design canvas edge | `freespace.width_bound` |
| Dashed lines mark the design canvas width (Hub → Home → Full width is off). | `freespace.width_bounds_hint` |
| Some cards sit outside the lines. They still work; drag them back to keep them inside the canvas. | `freespace.outside_bounds_hint` |
| FreeSpace tools | `freespace.toolbar` |
| X position | `freespace.tb_field_x` |
| Y position | `freespace.tb_field_y` |
| Width | `freespace.tb_field_w` |
| Height | `freespace.tb_field_h` |
| Rotation (degrees) | `freespace.tb_field_r` |
| Horizontal pin | `freespace.tb_pin` |
| Pin left | `freespace.tb_pin_left` |
| Pin center | `freespace.tb_pin_center` |
| Pin right | `freespace.tb_pin_right` |
| Pin left & right (stretch) | `freespace.tb_pin_stretch` |
| (takes effect when Full width is on in Hub → Home) | `freespace.tb_pin_inactive` |
| Align | `freespace.tb_align` |
| Align left | `freespace.tb_align_left` |
| Align center | `freespace.tb_align_center` |
| Align right | `freespace.tb_align_right` |
| Align top | `freespace.tb_align_top` |
| Layer | `freespace.tb_layer` |
| Bring to front | `freespace.tb_front` |
| Bring forward | `freespace.tb_forward` |
| Send backward | `freespace.tb_backward` |
| Send to back | `freespace.tb_back` |
| Edit card | `freespace.tb_edit` |
| Duplicate | `freespace.tb_duplicate` |
| Delete | `freespace.tb_delete` |
| Snap to grid | `freespace.tb_snap` |
| Align middle | `freespace.tb_align_middle` |
| Align bottom | `freespace.tb_align_bottom` |
| {count} selected | `freespace.tb_selected` |
| Distribute | `freespace.tb_distribute` |
| Distribute horizontally | `freespace.tb_distribute_h` |
| Distribute vertically | `freespace.tb_distribute_v` |
| Select 3 or more cards to distribute | `freespace.tb_distribute_need` |
| Shift-click or drag on empty space to select several | `freespace.tb_multi_hint` |
| {bp} layout | `freespace.bp_layout` |
| Use Desktop | `freespace.use_desktop` |
| Show the Desktop layout, shrunk and centered to fit this screen size. | `freespace.use_desktop_hint` |
| Custom | `freespace.custom_layout` |
| Arrange this screen size on its own | `freespace.custom_layout_hint` |
| Use the Desktop layout? | `freespace.reset_to_desktop_title` |
| Your {bp} positions will be removed and {bp} will follow the Desktop layout again. | `freespace.reset_to_desktop_body` |
| Use Desktop | `freespace.reset_to_desktop_confirm` |
| Delete {count} cards? | `freespace.delete_selected_title` |
| The selected cards will be removed from this view. | `freespace.delete_selected_body` |
| Card options | `freespace.menu_options` |
| Edit | `freespace.menu_edit` |
| Copy | `freespace.menu_copy` |
| Cut | `freespace.menu_cut` |
| Reset rotation | `freespace.menu_reset_rotation` |
| Rotate | `freespace.menu_rotate` |
| Pin to | `freespace.menu_pin_to` |
| Left | `freespace.menu_pin_left` |
| Center | `freespace.menu_pin_center` |
| Right | `freespace.menu_pin_right` |
| Left & right | `freespace.menu_pin_stretch` |
| FreeSpace view specific settings | `freespace.editor_section` |
| Breakpoint canvas sizes | `freespace.editor_canvas_widths` |
| Artboard design width per breakpoint (defaults: Desktop {desktop}, Laptop {laptop}, Tablet {tablet}, Phone {phone}). On screen, FreeSpace fills the view at 1:1 like Sections. It does not stretch a small canvas to enla… | `freespace.editor_canvas_widths_help` |
| Default {value}. | `freespace.editor_default` |
| Cards use this layout on wide screens. | `freespace.editor_desktop_help` |
| If Phone uses Desktop and “stack” is on, cards stack until you choose Custom and arrange a Phone layout. | `freespace.editor_phone_help` |
| Minimum artboard height | `freespace.editor_min_height` |
| Artboard grows with content; this is the floor (default {value}). | `freespace.editor_min_height_help` |
| Snap grid (0 = off) | `freespace.editor_grid` |
| Snap step in artboard units while dragging and resizing. | `freespace.editor_grid_help` |
| Phone without layout | `freespace.editor_narrow` |
| When Phone uses the Desktop layout: stack cards for readability, or keep scaling the artboard. | `freespace.editor_narrow_help` |
| Stack cards (recommended) | `freespace.editor_narrow_stack` |
| Keep scaled artboard | `freespace.editor_narrow_scale` |
| Desktop canvas width (legacy) | `freespace.editor_canvas_width_legacy` |
| {bp} is using the Desktop layout, shrunk to fit. Choose Custom in the toolbar to arrange {bp} on its own. | `freespace.follow_hint` |
| Align to | `freespace.tb_align_to` |
| Selection | `freespace.tb_align_selection` |
| Line the cards up with each other | `freespace.tb_align_selection_hint` |
| Canvas | `freespace.tb_align_canvas` |
| Move the cards together against the canvas, keeping their spacing | `freespace.tb_align_canvas_hint` |
| Reset to Desktop | `freespace.tb_reset_desktop` |
| Put the selected cards back where Desktop has them, shrunk to fit {bp} | `freespace.tb_reset_desktop_hint` |

</details>

<details>
<summary><strong>Icon (editor)</strong> — 89 left</summary>

| English text | Key |
| --- | --- |
| Show Entity Picture | `editor.icon.icon_section.show_entity_picture` |
| When enabled, entity_picture replaces the configured icon when available. | `editor.icon.icon_section.show_entity_picture_desc` |
| Tada | `editor.icon.animation_tada` |
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
<summary><strong>Accordion (editor)</strong> — 85 left</summary>

| English text | Key |
| --- | --- |
| No modules added. Add modules to this accordion in the Layout tab. | `editor.accordion.preview.no_modules` |
| Auto | `editor.accordion.behavior.direction_auto` |
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
<summary><strong>Battery monitor (editor)</strong> — 78 left</summary>

| English text | Key |
| --- | --- |
| Add at least one entity, or switch discovery to Auto or Both. | `editor.battery_monitor.error_manual_empty` |
| Style | `editor.battery_monitor.section_style` |
| List | `editor.battery_monitor.style_list` |
| Compact rows | `editor.battery_monitor.style_list_desc` |
| Bars | `editor.battery_monitor.style_bars` |
| Full-width bars | `editor.battery_monitor.style_bars_desc` |
| Cards | `editor.battery_monitor.style_cards` |
| Tile grid | `editor.battery_monitor.style_cards_desc` |
| Rings | `editor.battery_monitor.style_rings` |
| Circular gauges | `editor.battery_monitor.style_rings_desc` |
| Strip | `editor.battery_monitor.style_strip` |
| Heatmap strip | `editor.battery_monitor.style_strip_desc` |
| Display | `editor.battery_monitor.section_display` |
| Title | `editor.battery_monitor.title` |
| Header above the list. | `editor.battery_monitor.title_desc` |
| Show title | `editor.battery_monitor.show_title` |
| Display header. | `editor.battery_monitor.show_title_desc` |
| Hide when empty | `editor.battery_monitor.hide_when_empty` |
| On the dashboard, hide this module when no batteries match. A column, row or card left empty hides too. | `editor.battery_monitor.hide_when_empty_desc` |
| Show charging indicator | `editor.battery_monitor.show_charging` |
| When a charging binary_sensor is found. | `editor.battery_monitor.show_charging_desc` |
| Show percentage | `editor.battery_monitor.show_pct` |
| Show numeric % next to each device. | `editor.battery_monitor.show_pct_desc` |
| Show item border | `editor.battery_monitor.show_item_border` |
| Draw a 1px border around each device tile. Turn off for a borderless look. | `editor.battery_monitor.show_item_border_desc` |
| Max items | `editor.battery_monitor.max_items` |
| Maximum devices to show. | `editor.battery_monitor.max_items_desc` |
| Sort | `editor.battery_monitor.sort` |
| Order of devices. | `editor.battery_monitor.sort_desc` |
| Lowest first | `editor.battery_monitor.sort_low` |
| Highest first | `editor.battery_monitor.sort_high` |
| Name A–Z | `editor.battery_monitor.sort_name` |
| Unchanged | `editor.battery_monitor.sort_raw` |
| Thresholds | `editor.battery_monitor.section_thresholds` |
| Critical threshold | `editor.battery_monitor.critical` |
| At or below this % uses critical color. | `editor.battery_monitor.critical_desc` |
| Low threshold | `editor.battery_monitor.low` |
| At or below this % uses low color (above critical). | `editor.battery_monitor.low_desc` |
| Show only below low threshold | `editor.battery_monitor.only_low` |
| Hide devices above the low threshold. | `editor.battery_monitor.only_low_desc` |
| Entity source | `editor.battery_monitor.section_source` |
| Discovery mode | `editor.battery_monitor.discovery_mode` |
| Auto scans Home Assistant; manual uses the list below; both merges them. | `editor.battery_monitor.discovery_mode_desc` |
| Auto | `editor.battery_monitor.mode_auto` |
| Manual | `editor.battery_monitor.mode_manual` |
| Both | `editor.battery_monitor.mode_both` |
| Include battery_level attribute | `editor.battery_monitor.include_bl_attr` |
| Vacuums, trackers, phones, etc. | `editor.battery_monitor.include_bl_attr_desc` |
| Include binary_sensor battery | `editor.battery_monitor.include_bin` |
| Maps on = low / off = OK for device_class battery. | `editor.battery_monitor.include_bin_desc` |
| Manual entities | `editor.battery_monitor.manual_entities` |
| Pick entities to include. Expand a row for overrides. | `editor.battery_monitor.manual_entities_desc` |
| Add entity | `editor.battery_monitor.add_entity` |
| Colors | `editor.battery_monitor.section_colors` |
| Critical | `editor.battery_monitor.color_critical` |
| Low | `editor.battery_monitor.color_low` |
| Charging | `editor.battery_monitor.color_charging` |
| Text | `editor.battery_monitor.color_text` |
| Secondary text | `editor.battery_monitor.color_secondary` |
| Card background | `editor.battery_monitor.color_card_bg` |
| Exclude patterns | `editor.battery_monitor.exclude_patterns` |
| Entity ids containing these substrings are ignored. | `editor.battery_monitor.exclude_patterns_desc` |
| e.g. test, backup | `editor.battery_monitor.pattern_ph` |
| Hidden entities | `editor.battery_monitor.hidden_entities` |
| Removed from auto-discovery; click × to show again. | `editor.battery_monitor.hidden_entities_desc` |
| No entity selected | `editor.battery_monitor.no_entity` |
| Entity | `editor.battery_monitor.entity` |
| Battery or related sensor. | `editor.battery_monitor.entity_desc` |
| Label override | `editor.battery_monitor.label_override` |
| Icon override | `editor.battery_monitor.icon_override` |
| Row color override | `editor.battery_monitor.row_color` |
| Waiting for Home Assistant | `editor.battery_monitor.err_ha` |
| Connecting to entity states… | `editor.battery_monitor.err_ha_desc` |
| No batteries found | `editor.battery_monitor.err_empty` |
| Adjust discovery mode, manual entities, or thresholds in the General tab. | `editor.battery_monitor.err_empty_desc` |
| Battery Monitor | `editor.battery_monitor.default_title` |
| Remove from list | `editor.battery_monitor.preview_remove` |
| Tap a segment for more-info. Colors reflect battery level. | `editor.battery_monitor.strip_hint` |

</details>

<details>
<summary><strong>Printer 3d (editor)</strong> — 76 left</summary>

| English text | Key |
| --- | --- |
| 3D Printer | `editor.printer_3d.title_default` |
| Layout | `editor.printer_3d.layout` |
| How the card is arranged. | `editor.printer_3d.layout_desc` |
| Hero | `editor.printer_3d.layout_hero` |
| Standard | `editor.printer_3d.layout_standard` |
| Compact | `editor.printer_3d.layout_compact` |
| Camera | `editor.printer_3d.layout_camera` |
| Style | `editor.printer_3d.style` |
| Visual theme for surfaces and borders. | `editor.printer_3d.style_desc` |
| Theme | `editor.printer_3d.style_theme` |
| Dark | `editor.printer_3d.style_dark` |
| Light | `editor.printer_3d.style_light` |
| Glass | `editor.printer_3d.style_glass` |
| Illustration | `editor.printer_3d.illustration` |
| Procedural printer drawing, or your own image. | `editor.printer_3d.illustration_desc` |
| Enclosed | `editor.printer_3d.illustration_enclosed` |
| Bedslinger | `editor.printer_3d.illustration_bedslinger` |
| None | `editor.printer_3d.illustration_none` |
| Custom image | `editor.printer_3d.illustration_image` |
| Custom image | `editor.printer_3d.custom_image` |
| Upload a printer photo when illustration is set to Custom image. | `editor.printer_3d.custom_image_desc` |
| Title | `editor.printer_3d.title` |
| Optional heading text. | `editor.printer_3d.title_desc` |
| Show title | `editor.printer_3d.show_title` |
| Source | `editor.printer_3d.source` |
| Manual mapping, or auto-fill from a known integration. | `editor.printer_3d.source_desc` |
| Manual | `editor.printer_3d.source_manual` |
| OctoPrint | `editor.printer_3d.source_octoprint` |
| Moonraker | `editor.printer_3d.source_moonraker` |
| PrusaLink | `editor.printer_3d.source_prusalink` |
| Device | `editor.printer_3d.source_device` |
| Pick a discovered printer device, then auto-fill. | `editor.printer_3d.source_device_desc` |
| Auto-fill entities | `editor.printer_3d.autofill` |
| Map common entities from the selected device. You can edit them afterward. | `editor.printer_3d.autofill_desc` |
| Have a Bambu Lab printer? Use the Pro Bambu Lab module for AMS, farm view, and auto-discovery. | `editor.printer_3d.bambu_hint` |
| Entity mapping | `editor.printer_3d.mapping` |
| Bind Home Assistant entities to printer fields. | `editor.printer_3d.mapping_desc` |
| Status | `editor.printer_3d.status_entity` |
| Progress | `editor.printer_3d.progress_entity` |
| Nozzle temperature | `editor.printer_3d.nozzle_temp_entity` |
| Nozzle target | `editor.printer_3d.nozzle_target_entity` |
| Bed temperature | `editor.printer_3d.bed_temp_entity` |
| Bed target | `editor.printer_3d.bed_target_entity` |
| Chamber temperature | `editor.printer_3d.chamber_temp_entity` |
| Remaining time | `editor.printer_3d.remaining_time_entity` |
| End time | `editor.printer_3d.end_time_entity` |
| Current layer | `editor.printer_3d.current_layer_entity` |
| Total layers | `editor.printer_3d.total_layers_entity` |
| File / task name | `editor.printer_3d.file_name_entity` |
| Camera | `editor.printer_3d.camera_entity` |
| Thumbnail image | `editor.printer_3d.thumbnail_entity` |
| Pause | `editor.printer_3d.pause_entity` |
| Resume | `editor.printer_3d.resume_entity` |
| Stop | `editor.printer_3d.stop_entity` |
| Light | `editor.printer_3d.light_entity` |
| Fans | `editor.printer_3d.fans` |
| Up to three fan entities with optional labels. | `editor.printer_3d.fans_desc` |
| Extra stats | `editor.printer_3d.extra_stats` |
| Additional sensors shown in the details list. | `editor.printer_3d.extra_stats_desc` |
| Sections | `editor.printer_3d.sections` |
| Controls | `editor.printer_3d.show_controls` |
| Temperatures | `editor.printer_3d.show_temps` |
| Fans | `editor.printer_3d.show_fans` |
| Camera | `editor.printer_3d.show_camera` |
| Print job | `editor.printer_3d.show_job` |
| File name, layer, and time remaining. | `editor.printer_3d.show_job_desc` |
| Cover thumbnail | `editor.printer_3d.show_thumbnail` |
| Cover image inside the print job block. | `editor.printer_3d.show_thumbnail_desc` |
| Camera mode | `editor.printer_3d.camera_mode` |
| Snapshots poll a still image (low data). Live streams the camera like Home Assistant does. | `editor.printer_3d.camera_mode_desc` |
| Snapshots | `editor.printer_3d.camera_mode_snapshot` |
| Live | `editor.printer_3d.camera_mode_live` |
| Camera refresh (s) | `editor.printer_3d.camera_refresh` |
| Accent | `editor.printer_3d.accent_color` |
| Text color | `editor.printer_3d.text_color` |
| Secondary text | `editor.printer_3d.secondary_text_color` |

</details>

<details>
<summary><strong>Bambu (editor)</strong> — 68 left</summary>

| English text | Key |
| --- | --- |
| Bambu Lab | `editor.bambu.title_default` |
| Bambu Lab builds a live printer card with AMS trays, temperatures, fans, camera, and farm view from the ha-bambulab integration. | `editor.bambu.pro_description` |
| View | `editor.bambu.view` |
| Printer is the hero illustration. Dashboard, camera, farm and compact cover the rest. | `editor.bambu.view_desc` |
| Printer | `editor.bambu.view_printer` |
| Camera | `editor.bambu.view_camera` |
| Farm | `editor.bambu.view_farm` |
| Compact | `editor.bambu.view_compact` |
| Printer | `editor.bambu.printer` |
| Which discovered Bambu printer to show (Farm uses all). | `editor.bambu.printer_desc` |
| First found | `editor.bambu.printer_auto` |
| Style | `editor.bambu.style` |
| Visual theme for surfaces and borders. | `editor.bambu.style_desc` |
| Theme | `editor.bambu.style_theme` |
| Dark | `editor.bambu.style_dark` |
| Light | `editor.bambu.style_light` |
| Glass | `editor.bambu.style_glass` |
| Carbon | `editor.bambu.style_carbon` |
| Animation | `editor.bambu.animation` |
| Fan spin, heating glow, and progress motion. Respects prefers-reduced-motion. | `editor.bambu.animation_desc` |
| Off | `editor.bambu.anim_off` |
| Subtle | `editor.bambu.anim_subtle` |
| Full | `editor.bambu.anim_full` |
| Title | `editor.bambu.title` |
| Optional heading text. | `editor.bambu.title_desc` |
| Show title | `editor.bambu.show_title` |
| Sections | `editor.bambu.sections` |
| Toggle which blocks appear in the selected view. | `editor.bambu.sections_desc` |
| AMS trays | `editor.bambu.show_ams` |
| AMS layout | `editor.bambu.ams_layout` |
| How several AMS / external spool units are arranged. | `editor.bambu.ams_layout_desc` |
| Stacked | `editor.bambu.ams_layout_stacked` |
| Grid | `editor.bambu.ams_layout_grid` |
| Spools only | `editor.bambu.ams_layout_strip` |
| AMS units | `editor.bambu.ams_units` |
| Drag to reorder AMS and external spool units. Hide ones you do not want. | `editor.bambu.ams_units_desc` |
| Camera | `editor.bambu.show_camera` |
| Controls | `editor.bambu.show_controls` |
| Temperatures | `editor.bambu.show_temps` |
| Fans | `editor.bambu.show_fans` |
| Print details | `editor.bambu.show_print_details` |
| HMS errors | `editor.bambu.show_hms` |
| Speed profiles | `editor.bambu.show_speed` |
| Print job | `editor.bambu.show_job` |
| File name, layer, and time remaining. | `editor.bambu.show_job_desc` |
| Cover thumbnail | `editor.bambu.show_thumbnail` |
| Cover image inside the print job block. | `editor.bambu.show_thumbnail_desc` |
| Camera mode | `editor.bambu.camera_mode` |
| Snapshots poll a still image (low data). Live streams the camera like Home Assistant does. | `editor.bambu.camera_mode_desc` |
| Snapshots | `editor.bambu.camera_mode_snapshot` |
| Live | `editor.bambu.camera_mode_live` |
| Camera refresh (s) | `editor.bambu.camera_refresh` |
| How often to refresh camera snapshots. | `editor.bambu.camera_refresh_desc` |
| Custom printer image | `editor.bambu.custom_image` |
| Optional photo override. Hotspot overlays stay in place. | `editor.bambu.custom_image_desc` |
| Accent | `editor.bambu.accent_color` |
| Highlights and progress accents. | `editor.bambu.accent_color_desc` |
| Text color | `editor.bambu.text_color` |
| Secondary text | `editor.bambu.secondary_text_color` |
| Farm order | `editor.bambu.farm_order` |
| Drag to reorder printers in the farm grid. Hide ones you do not want. | `editor.bambu.farm_order_desc` |
| No Bambu Lab printers discovered. Install greghesp/ha-bambulab, then reload this card. | `editor.bambu.empty` |
| Install and configure the Bambu Lab integration (greghesp/ha-bambulab) to auto-discover printers. | `editor.bambu.hint_no_integration` |
| Bambu Lab is configured but no printers were found. | `editor.bambu.hint_no_printers` |
| Printer appears offline. | `editor.bambu.hint_offline` |
| No AMS units discovered for this printer. | `editor.bambu.hint_no_ams` |
| Dismiss | `editor.bambu.wizard_dismiss` |
| Found {count} Bambu printers | `editor.bambu.found_printers` |

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
<summary><strong>Design (editor)</strong> — 66 left</summary>

| English text | Key |
| --- | --- |
| Reset to Theme | `editor.design.reset_to_theme` |
| Clear background, border, radius and shadow so this element follows the active Ultra Card theme | `editor.design.reset_to_theme_tooltip` |
| 400 - Normal | `editor.design.weight_normal` |
| Normal | `editor.design.style_normal` |
| Normal | `editor.design.white_space_normal` |
| Pre | `editor.design.white_space_pre` |
| 3D Transform | `editor.design.transform_3d_section` |
| Tilt or rotate the module in 3D space. Set perspective for depth, then rotate on X (tilt forward/back), Y (turn left/right), or Z (spin). | `editor.design.transform_3d_desc` |
| Perspective | `editor.design.transform_3d_perspective` |
| none, 400px, 1000px | `editor.design.transform_3d_perspective_placeholder` |
| Rotate X | `editor.design.transform_3d_rotate_x` |
| Rotate Y | `editor.design.transform_3d_rotate_y` |
| Rotate Z | `editor.design.transform_3d_rotate_z` |
| Degrees (-180 to 180) | `editor.design.transform_3d_rotate_placeholder` |
| Rotation values are in degrees (-180 to 180). | `editor.design.transform_3d_rotate_hint` |
| Accepts any CSS length: 8 or 8px, 1rem, 0.5em, 5%, 2vw, auto, calc(). Bare numbers are treated as px. | `editor.design.spacing_units_hint` |
| Design copied ({count} settings) | `editor.design.copied` |
| No design settings to copy | `editor.design.copy_nothing` |
| Design pasted | `editor.design.pasted` |
| Has modifications | `editor.design.has_modifications` |
| Has responsive overrides | `editor.design.has_responsive_overrides` |
| Reset {field} | `editor.design.reset_field` |
| Reset {section} to default | `editor.design.reset_section` |
| Clear {device} overrides for {section} | `editor.design.clear_section_device_overrides` |
| Device overrides exist and stay active while this is off. | `editor.design.overrides_active_hidden` |
| Desktop is the base. Changes here apply to all devices unless overridden. | `editor.design.device_desktop_info` |
| {device} ({range}) overrides the desktop styles. | `editor.design.device_override_info` |
| Desktop | `editor.design.device_desktop` |
| Laptop | `editor.design.device_laptop` |
| Tablet | `editor.design.device_tablet` |
| Mobile | `editor.design.device_mobile` |
| Web-safe Fonts | `editor.design.web_safe_fonts` |
| Google Fonts | `editor.design.google_fonts` |
| Background Size | `editor.design.background_size` |
| Background Repeat | `editor.design.background_repeat` |
| Background Position | `editor.design.background_position` |
| Custom Width | `editor.design.custom_width` |
| Custom Height | `editor.design.custom_height` |
| Entity with an image attribute | `editor.design.bg_image_entity_hint` |
| Remove file | `editor.design.remove_file` |
| Filters what is behind this element (e.g. frosted glass). | `editor.design.backdrop_filter_desc` |
| Filters the background image only; content stays sharp. | `editor.design.background_filter_desc` |
| Offsets | `editor.design.offsets` |
| Z-Index | `editor.design.z_index` |
| Both horizontal and vertical shift are required for the shadow to render. | `editor.design.text_shadow_hint` |
| Entity to Monitor | `editor.design.entity_to_monitor` |
| Choose an entity, then set the state or attribute that triggers the animation. | `editor.design.select_entity_first` |
| Trigger Type | `editor.design.animation_trigger_type` |
| Attribute Name | `editor.design.attribute_name` |
| Attribute Value | `editor.design.attribute_value` |
| State Value | `editor.design.state_value` |
| Entity not found | `editor.design.entity_not_found` |
| Current state: {state} | `editor.design.current_state` |
| Enter the exact state value that triggers the animation | `editor.design.state_value_hint` |
| Enter the attribute name to monitor | `editor.design.attribute_name_hint` |
| Available: {list} | `editor.design.available_attributes` |
| Enter an attribute name first | `editor.design.select_attribute_first` |
| Attribute not found on this entity | `editor.design.attribute_not_found` |
| Current value: {value} | `editor.design.current_value` |
| Custom Targeting | `editor.design.custom_targeting_section` |
| CSS Variable Prefix | `editor.design.css_var_prefix` |
| Prefix for CSS variables (e.g., "my-row" creates --my-row-bg-color, --my-row-text-color). Override with card-mod: style: \| :host { --my-row-bg-color: red; } | `editor.design.css_var_prefix_desc` |
| Extra CSS classes | `editor.design.extra_class` |
| Space-separated class names applied to the module container (for card-mod or themes). | `editor.design.extra_class_desc` |
| Element ID | `editor.design.element_id` |
| Optional HTML id on the module root (use sparingly; must be unique on the page). | `editor.design.element_id_desc` |

</details>

<details>
<summary><strong>Camera (editor)</strong> — 49 left</summary>

| English text | Key |
| --- | --- |
| Bottom Middle | `editor.camera.name_position.options.bottom_middle` |
| Top Middle | `editor.camera.name_position.options.top_middle` |
| Stream Mode | `editor.camera.view_mode.title` |
| Auto: still images refreshed every 10 seconds, exactly like Home Assistant picture cards. Live: a continuous stream. Snapshot: still images on your own refresh interval. | `editor.camera.view_mode.desc` |
| Auto (HA Default) | `editor.camera.view_mode.options.auto` |
| Always Live | `editor.camera.view_mode.options.live` |
| Snapshot Only | `editor.camera.view_mode.options.snapshot` |
| Enable Audio | `editor.camera.audio_enabled.title` |
| Start the stream unmuted where the browser allows it. Browsers block unmuted autoplay until you interact with the page, so the stream may start muted until you use the sound button. | `editor.camera.audio_enabled.desc` |
| Sound Button | `editor.camera.show_audio_button.title` |
| Show a mute/unmute button over the stream. | `editor.camera.show_audio_button.desc` |
| Live / Snapshot Badge | `editor.camera.show_mode_badge.title` |
| Show a small badge in the top corner saying whether the camera is streaming live or showing still snapshots. | `editor.camera.show_mode_badge.desc` |
| Live | `editor.camera.mode_badge.live` |
| Snapshot | `editor.camera.mode_badge.snapshot` |
| Player Controls | `editor.camera.show_controls.title` |
| Show the browser's native video controls on the stream. | `editor.camera.show_controls.desc` |
| Image Fit | `editor.camera.image_fit.title` |
| How the feed fills the frame. Cover crops to fill, Contain shows the whole frame with bars, Fill stretches to the frame. | `editor.camera.image_fit.desc` |
| Cover | `editor.camera.image_fit.options.cover` |
| Contain | `editor.camera.image_fit.options.contain` |
| Fill | `editor.camera.image_fit.options.fill` |
| Mute | `editor.camera.audio.mute` |
| Unmute | `editor.camera.audio.unmute` |
| Camera Unavailable | `editor.camera.unavailable` |
| Snapshot Refresh Settings | `editor.camera.snapshot_refresh.section_title` |
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
<summary><strong>Layout (editor)</strong> — 47 left</summary>

| English text | Key |
| --- | --- |
| Popup | `editor.layout.popup_module` |
| General | `editor.layout.general_tab` |
| Card health | `editor.layout.health_tooltip` |
| {count} issues | `editor.layout.health_badge` |
| Move up | `editor.layout.move_up` |
| Move down | `editor.layout.move_down` |
| Moved up | `editor.layout.moved_up` |
| Moved down | `editor.layout.moved_down` |
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
| Tabs Layout | `editor.layout.tabs_layout` |
| No sections. Open settings to add sections. | `editor.layout.tabs_no_sections` |
| Open settings to manage tabs sections | `editor.layout.tabs_open_settings` |
| Width Percentage | `editor.layout.width_percent` |
| Set the row width as a percentage of the card width (0-100%). | `editor.layout.width_percent_desc` |

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
<summary><strong>Submit preset (ultra card hub)</strong> — 45 left</summary>

| English text | Key |
| --- | --- |
| Share your layout | `hub.submit_preset.create_title` |
| Submit to ultracard.io | `hub.submit_preset.create_subtitle` |
| Edit your preset | `hub.submit_preset.edit_title` |
| Update on ultracard.io | `hub.submit_preset.edit_subtitle` |
| Update the details below. Changes to a live preset are queued for review while the current version stays online. | `hub.submit_preset.edit_blurb` |
| Cancel | `hub.submit_preset.cancel` |
| Send | `hub.submit_preset.send` |
| Save | `hub.submit_preset.save` |
| Sending… | `hub.submit_preset.sending` |
| Saving… | `hub.submit_preset.saving` |
| Uploading photo | `hub.submit_preset.uploading_photo` |
| Preset Title | `hub.submit_preset.field_title` |
| Preset Description | `hub.submit_preset.field_description` |
| Preset Category | `hub.submit_preset.field_category` |
| Preset Tags | `hub.submit_preset.field_tags` |
| Preset Code | `hub.submit_preset.field_code` |
| Featured Image | `hub.submit_preset.field_featured` |
| Preset Photos | `hub.submit_preset.field_photos` |
| Integrations | `hub.submit_preset.field_integrations` |
| Title is required. | `hub.submit_preset.title_required` |
| Description is required. | `hub.submit_preset.description_required` |
| Please select a category. | `hub.submit_preset.category_required` |
| Preset code is required. | `hub.submit_preset.code_required` |
| Featured image is required. | `hub.submit_preset.featured_required` |
| Loading categories… | `hub.submit_preset.loading_categories` |
| Comma-separated | `hub.submit_preset.tags_hint` |
| Auto-filled from your current card layout. Edit if needed. | `hub.submit_preset.code_hint_layout` |
| Paste your Ultra Card layout JSON here. | `hub.submit_preset.code_hint_paste` |
| Update code from current layout | `hub.submit_preset.update_code_from_layout` |
| Existing photos | `hub.submit_preset.existing_photos` |
| Uploaded photo | `hub.submit_preset.kept_photo` |
| Gallery photo | `hub.submit_preset.gallery_photo` |
| Click to upload featured image | `hub.submit_preset.upload_featured` |
| Required · Used as the gallery thumbnail | `hub.submit_preset.featured_hint` |
| Remove / replace | `hub.submit_preset.replace_featured` |
| Up to 5 | `hub.submit_preset.photos_hint` |
| (optional) | `hub.submit_preset.optional` |
| Uploading featured image… | `hub.submit_preset.uploading_featured` |
| Comma-separated list of integrations this preset uses | `hub.submit_preset.integrations_hint` |
| Preset Submitted! | `hub.submit_preset.success_create_title` |
| Thank you for sharing! Your preset is now pending review. Once our team reviews and approves it, it will appear in the Preset Gallery. | `hub.submit_preset.success_create_body` |
| Preset updated | `hub.submit_preset.success_edit_title` |
| Update submitted for review. Your live preset stays online until the update is approved. | `hub.submit_preset.success_edit_review` |
| Saved. | `hub.submit_preset.success_edit_saved` |
| Got it, thanks! | `hub.submit_preset.got_it` |

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
<summary><strong>Dropdown (editor)</strong> — 39 left</summary>

| English text | Key |
| --- | --- |
| Use a single Jinja2 template to generate all dropdown options with icons, labels, and colors. Return a JSON array of option objects. When enabled, manual options are replaced by template-generated options. | `editor.dropdown.unified_template_section.desc` |
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
<summary><strong>Submit theme (ultra card hub)</strong> — 39 left</summary>

| English text | Key |
| --- | --- |
| Share your theme | `hub.submit_theme.create_title` |
| Submit to ultracard.io | `hub.submit_theme.create_subtitle` |
| Edit your theme | `hub.submit_theme.edit_title` |
| Update on ultracard.io | `hub.submit_theme.edit_subtitle` |
| Share your theme with the Ultra Card community. Once reviewed and approved it appears in the Themes catalog for everyone to install. | `hub.submit_theme.create_blurb` |
| Update the details below. Changes to a live theme are queued for review while the current version stays online. | `hub.submit_theme.edit_blurb` |
| Theme name | `hub.submit_theme.field_title` |
| Name is required. | `hub.submit_theme.title_required` |
| Description | `hub.submit_theme.field_description` |
| What does this theme look like, and which HA themes does it pair with? | `hub.submit_theme.description_placeholder` |
| Description is required. | `hub.submit_theme.description_required` |
| Tags | `hub.submit_theme.field_tags` |
| Comma-separated | `hub.submit_theme.tags_hint` |
| Theme JSON | `hub.submit_theme.field_json` |
| Theme JSON is required. | `hub.submit_theme.json_required` |
| Theme JSON is not valid JSON. | `hub.submit_theme.json_invalid` |
| Not a valid Ultra Card theme | `hub.submit_theme.json_rejected` |
| Dropped before publishing | `hub.submit_theme.json_warnings` |
| Exported from the Hub theme editor. Colours may reference HA variables. | `hub.submit_theme.json_hint` |
| Installers will be told this theme: | `hub.submit_theme.risk_title` |
| Preview image | `hub.submit_theme.field_preview` |
| (optional) | `hub.submit_theme.optional` |
| Click to upload a screenshot | `hub.submit_theme.upload_preview` |
| Shown in the catalog instead of the generated swatch | `hub.submit_theme.preview_hint` |
| Preview image exceeds the 16 MB limit. | `hub.submit_theme.preview_too_large` |
| Remove / replace | `hub.submit_theme.replace_preview` |
| Cancel | `hub.submit_theme.cancel` |
| Send | `hub.submit_theme.send` |
| Save | `hub.submit_theme.save` |
| Sending… | `hub.submit_theme.sending` |
| Saving… | `hub.submit_theme.saving` |
| Uploading preview… | `hub.submit_theme.uploading_preview` |
| Failed to submit theme. Please try again. | `hub.submit_theme.submit_failed` |
| Theme submitted | `hub.submit_theme.success_create_title` |
| Thank you for sharing. Your theme is pending review and will appear in the catalog once approved. | `hub.submit_theme.success_create_body` |
| Theme updated | `hub.submit_theme.success_edit_title` |
| Update submitted for review. Your live theme stays online until the update is approved. | `hub.submit_theme.success_edit_review` |
| Saved. | `hub.submit_theme.success_edit_saved` |
| Got it | `hub.submit_theme.got_it` |

</details>

<details>
<summary><strong>Popup (editor)</strong> — 38 left</summary>

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
| Manual | `editor.popup.trigger_logic.mode_manual` |
| Background Overlay | `editor.popup.overlay.section_title` |
| Show Background Overlay | `editor.popup.overlay.show` |
| Display a dimmed overlay behind the popup when open. | `editor.popup.overlay.show_desc` |

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
<summary><strong>Smart (editor)</strong> — 32 left</summary>

| English text | Key |
| --- | --- |
| Smart Cards | `editor.smart.title` |
| Refresh | `editor.smart.refresh` |
| Pro modules enabled | `editor.smart.pro_modules` |
| Free modules | `editor.smart.free_modules` |
| Used: {connector} | `editor.smart.used` |
| Home Assistant Assist | `editor.smart.connector_ha_assist` |
| Generating smart layout... | `editor.smart.generating` |
| Open Assist | `editor.smart.open_assist` |
| Free quota: | `editor.smart.free_quota` |
| {remaining} / {cap} remaining | `editor.smart.remaining` |
| Free Smart generations are used up for today. | `editor.smart.quota_exhausted` |
| Upgrade | `editor.smart.upgrade` |
| Unlimited · runs on your AI | `editor.smart.unlimited` |
| Design with | `editor.smart.ai_provider` |
| AI Task | `editor.smart.ai_task` |
| Conversation agent | `editor.smart.conversation_agent` |
| Add | `editor.smart.add` |
| Regenerate | `editor.smart.regenerate` |
| Preview unavailable | `editor.smart.preview_unavailable` |
| Smart preset live preview | `editor.smart.preview_aria` |
| Smart preset preview | `editor.smart.preview_fallback_aria` |
| Status | `editor.smart.step_status` |
| Compose | `editor.smart.step_compose` |
| Preview | `editor.smart.step_preview` |
| Apply | `editor.smart.step_apply` |
| Back | `editor.smart.back` |
| Continue | `editor.smart.continue` |
| Apply Preset | `editor.smart.apply_preset` |
| Warnings | `editor.smart.warnings_title` |
| No Smart preset was generated. Try a different prompt. | `editor.smart.no_results` |
| Failed to load Smart connectors. | `editor.smart.load_failed` |
| Smart generation failed. | `editor.smart.generate_failed` |

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
<summary><strong>My presets (ultra card hub)</strong> — 30 left</summary>

| English text | Key |
| --- | --- |
| Presets view | `hub.my_presets.view_switch` |
| Browse | `hub.my_presets.browse` |
| My Presets | `hub.my_presets.mine` |
| Sign in to manage your presets | `hub.my_presets.login_title` |
| View submission status, moderator feedback, and update your presets from here. | `hub.my_presets.login_message` |
| Sign in | `hub.my_presets.login_button` |
| Admin access required | `hub.my_presets.admin_only_title` |
| Preset authoring is available to Home Assistant administrators only. Sign in as an admin (via Ultra Card Connect) to manage your submissions. | `hub.my_presets.admin_only_message` |
| Track your submissions, respond to moderator feedback, and update presets without leaving Home Assistant. | `hub.my_presets.blurb` |
| Refresh | `hub.my_presets.refresh` |
| Loading your presets… | `hub.my_presets.loading` |
| Could not load your presets. | `hub.my_presets.load_error` |
| No submissions yet | `hub.my_presets.empty_title` |
| Share a layout from the card editor to submit your first preset. | `hub.my_presets.empty_message` |
| Pending review | `hub.my_presets.status.pending` |
| Live | `hub.my_presets.status.live` |
| Changes requested | `hub.my_presets.status.changes_requested` |
| Rejected | `hub.my_presets.status.rejected` |
| Draft | `hub.my_presets.status.draft` |
| Update awaiting review | `hub.my_presets.pending_revision` |
| Moderator note | `hub.my_presets.moderator_note` |
| Edit | `hub.my_presets.edit` |
| Withdraw | `hub.my_presets.withdraw` |
| Delete | `hub.my_presets.delete` |
| View on site | `hub.my_presets.view_on_site` |
| Withdraw this pending submission or revision? | `hub.my_presets.confirm_withdraw` |
| Delete this preset? This cannot be undone. | `hub.my_presets.confirm_delete` |
| Submission withdrawn | `hub.my_presets.withdrawn` |
| Preset deleted | `hub.my_presets.deleted` |
| Preset update saved | `hub.my_presets.updated` |

</details>

<details>
<summary><strong>Template (editor)</strong> — 30 left</summary>

| English text | Key |
| --- | --- |
| Unrecognized template keys (they will be ignored): | `editor.template.unknown_keys_title` |
| did you mean | `editor.template.did_you_mean` |
| Supported keys for this module: | `editor.template.supported_keys` |
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
<summary><strong>State switcher (editor)</strong> — 25 left</summary>

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
<summary><strong>Tabs module (editor)</strong> — 23 left</summary>

| English text | Key |
| --- | --- |
| Horizontal | `editor.tabs_module.orientation.horizontal` |
| Vertical | `editor.tabs_module.orientation.vertical` |
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
<summary><strong>Image (editor)</strong> — 19 left</summary>

| English text | Key |
| --- | --- |
| Choose file | `editor.image.upload_choose` |
| Remove file | `editor.image.upload_clear` |
| Select an entity that contains an image URL in one of its attributes. | `editor.image.attribute_entity_desc` |
| Horizontal (px) | `editor.image.hover.translate_x` |
| Vertical (px) | `editor.image.hover.translate_y` |
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
<summary><strong>Sports (editor)</strong> — 16 left</summary>

| English text | Key |
| --- | --- |
| Home Assistant Sensor | `editor.sports.ha_sensor_config` |
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
<summary><strong>Modules (editor)</strong> — 15 left</summary>

| English text | Key |
| --- | --- |
| Spinbox | `editor.modules.spinbox` |
| Sensor | `editor.modules.people.data_item.sensor` |
| Color | `editor.modules.people.bg_color` |
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
<summary><strong>Logic (editor)</strong> — 14 left</summary>

| English text | Key |
| --- | --- |
| Hide on Devices | `editor.logic.hide_on_devices` |
| Hide this element on specific screen sizes. Use this to create different layouts for different devices. | `editor.logic.hide_on_devices_desc` |
| Visible to Users | `editor.logic.user_visibility.title` |
| Show or hide this element for specific Home Assistant users. Same idea as Lovelace card Visibility → User. | `editor.logic.user_visibility.desc` |
| Who can see this | `editor.logic.user_visibility.mode` |
| Everyone | `editor.logic.user_visibility.everyone` |
| Show only for | `editor.logic.user_visibility.show_only` |
| Hide for | `editor.logic.user_visibility.hide_for` |
| (you) | `editor.logic.user_visibility.you` |
| No users available yet. Enter a user ID below. | `editor.logic.user_visibility.no_users` |
| User ID | `editor.logic.user_visibility.manual_id` |
| Could not load the full user list (admin permission may be required). Add other users by ID: | `editor.logic.user_visibility.manual_id_desc` |
| Add | `editor.logic.user_visibility.add` |
| You will not see this on the live dashboard while signed in as this user. Card Settings still keep the editor preview visible so you can keep editing. | `editor.logic.user_visibility.self_hidden_warning` |

</details>

<details>
<summary><strong>Appearance (editor)</strong> — 13 left</summary>

| English text | Key |
| --- | --- |
| Transparent Card | `editor.appearance.transparent_card` |
| Remove the card background, border, and shadow so only your content is visible. | `editor.appearance.transparent_card_desc` |
| Home Assistant Theme | `editor.appearance.ha_theme` |
| Follow dashboard theme | `editor.appearance.ha_theme_default` |
| Apply one of your installed Home Assistant themes to this card only. Works with any theme from Marketplace. | `editor.appearance.ha_theme_desc` |
| Ultra Card Theme | `editor.appearance.uc_theme` |
| Sets the surface look (glass, soft, flat...), corner radius and the default style of every module on this card. Modules set to "Inherit from theme" follow it. | `editor.appearance.uc_theme_desc` |
| Active: | `editor.appearance.uc_theme_active` |
| Manage themes and the global default in the Hub | `editor.appearance.uc_theme_manage` |
| Template Cheatsheet | `editor.appearance.template_cheatsheet` |
| Enable template mode | `editor.appearance.template_mode_enable` |
| Use Jinja2 templates to control card background, border, shadow, and padding dynamically. Return a simple color string for background-only, or a JSON object for multiple card appearance properties. | `editor.appearance.unified_template_section.desc` |
| Appearance Template Mode | `editor.appearance.unified_template_section.title` |

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
<summary><strong>Health (editor)</strong> — 12 left</summary>

| English text | Key |
| --- | --- |
| Card Health | `editor.health.title` |
| Close | `editor.health.close` |
| No issues found. This card looks healthy. | `editor.health.healthy` |
| Jump | `editor.health.jump` |
| Open Connect | `editor.health.open_connect` |
| Healthy | `editor.health.badge_ok` |
| {count} issues | `editor.health.badge_issues` |
| Analyze card health | `editor.health.tooltip` |
| Ultra Card Connect is not installed. Hub sidebar and Pro sync require the integration. | `editor.health.connect_not_installed` |
| Ultra Card Connect is installed but not signed in. Open the Hub Account tab to connect. | `editor.health.connect_not_authenticated` |
| Ultra Card Connect needs re-authentication. Open the Hub Account tab to sign in again. | `editor.health.connect_needs_reauth` |
| Ultra Card Connect needs updating (installed {current}, required {required}+). Update the integration so Smart Cards, media upload, and Pro sync work reliably. | `editor.health.connect_needs_update` |

</details>

<details>
<summary><strong>Onboarding (editor)</strong> — 12 left</summary>

| English text | Key |
| --- | --- |
| Getting Started | `editor.onboarding.title` |
| Follow these steps to build your first Ultra Card layout. | `editor.onboarding.subtitle` |
| Don't show again | `editor.onboarding.dismiss` |
| Add a row | `editor.onboarding.step_add_row` |
| Add a module | `editor.onboarding.step_add_module` |
| Pick an entity (optional) | `editor.onboarding.step_pick_entity` |
| Preview breakpoints | `editor.onboarding.step_preview_breakpoints` |
| Add Row | `editor.onboarding.action_add_row` |
| Add Module | `editor.onboarding.action_add_module` |
| Open Module Settings | `editor.onboarding.action_pick_entity` |
| Try Breakpoint Preview | `editor.onboarding.action_preview_breakpoints` |
| Start from a Preset | `editor.onboarding.action_preset` |

</details>

<details>
<summary><strong>Ultra Card Hub</strong> — 12 left</summary>

| English text | Key |
| --- | --- |
| Hub | `hub.subtitle` |
| Sections & FreeSpace width | `hub.sections_width` |
| Widen Sections columns and FreeSpace to fill the screen, or keep Home Assistant’s default centred layout. Applies to every dashboard in this browser. Masonry and Panel views are not affected. | `hub.sections_width_desc` |
| Home Assistant default | `hub.sections_width_default` |
| 500px per column, centred | `hub.sections_width_default_hint` |
| Full width | `hub.sections_width_full` |
| Sections columns and FreeSpace fill the whole screen | `hub.sections_width_full_hint` |
| Custom | `hub.sections_width_custom` |
| Pick a max width per column | `hub.sections_width_custom_hint` |
| Max width per column (px) | `hub.sections_column_width` |
| Column gap and side padding (px) | `hub.sections_gap` |
| HA default (32) | `hub.sections_gap_placeholder` |

</details>

<details>
<summary><strong>Graphs (editor)</strong> — 11 left</summary>

| English text | Key |
| --- | --- |
| Chance of Rain | `editor.graphs.forecast.precip_probability` |
| UV Index | `editor.graphs.forecast.uv_index` |
| Use Fixed Y-Axis Scale | `editor.graphs.display.use_fixed_y_axis` |
| Set fixed min/max values instead of auto-scaling. Useful for consistent scales across multiple graphs or time periods. | `editor.graphs.display.use_fixed_y_axis_desc` |
| Maximum Value | `editor.graphs.display.y_axis_max` |
| Minimum Value | `editor.graphs.display.y_axis_min` |
| Today | `editor.graphs.period.today` |
| Limit Days | `editor.graphs.forecast_limit.days` |
| Days override hours | `editor.graphs.forecast_limit.days_desc` |
| Limit Hours | `editor.graphs.forecast_limit.hours` |
| 0 = show all | `editor.graphs.forecast_limit.hours_desc` |

</details>

<details>
<summary><strong>Map (editor)</strong> — 11 left</summary>

| English text | Key |
| --- | --- |
| General | `editor.map.tabs.general` |
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
<summary><strong>Spinbox (editor)</strong> — 8 left</summary>

| English text | Key |
| --- | --- |
| Horizontal | `editor.spinbox.layout_options.horizontal` |
| Vertical | `editor.spinbox.layout_options.vertical` |
| Inset | `editor.spinbox.styles.inset` |
| Neumorphic | `editor.spinbox.styles.neumorphic` |
| Decrease | `editor.spinbox.decrease` |
| Increase | `editor.spinbox.increase` |
| Configure the numeric range, step size, and default value. | `editor.spinbox.value_section.desc` |
| Value Configuration | `editor.spinbox.value_section.title` |

</details>

<details>
<summary><strong>Animated weather (editor)</strong> — 7 left</summary>

| English text | Key |
| --- | --- |
| 0–32px | `editor.animated_weather.left_column_gap_desc` |
| 0–32px | `editor.animated_weather.right_column_gap_desc` |
| 0–300px | `editor.animated_weather.icon_size_desc` |
| Color | `editor.animated_weather.item_color` |
| Select a weather entity to drive the animated background and forecast display. | `editor.animated_weather.entity_desc` |
| Weather Station Sensors | `editor.animated_weather.station_section` |
| Optional. Use your own weather station for the current values. The animated icon and high/low still come from the weather entity. New items like Feels Like and UV Index appear in the Left Column once their sensor is set. | `editor.animated_weather.station_section_desc` |

</details>

<details>
<summary><strong>Custom variables (editor)</strong> — 7 left</summary>

| English text | Key |
| --- | --- |
| my_variable_name | `editor.custom_variables.variable_name_placeholder` |
| Global | `editor.custom_variables.global` |
| Add card variable | `editor.custom_variables.add_card_variable` |
| Variables that apply only to this card. Use them in templates with {{ $variable_name }}. | `editor.custom_variables.card_only_description` |
| Variables that apply only to this card. For shared variables used across cards, use the Ultra Card Hub → Variables tab in the sidebar. | `editor.custom_variables.card_section_description` |
| Add a variable that applies only to this card, or use the Ultra Card Hub for shared variables. | `editor.custom_variables.empty_card_description` |
| No Card Variables | `editor.custom_variables.empty_card_title` |

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
<summary><strong>Freespace (ultra card hub)</strong> — 7 left</summary>

| English text | Key |
| --- | --- |
| FreeSpace is ready | `hub.freespace.ready` |
| A free-form dashboard layout: drag, resize, rotate, and layer any card anywhere. Looks like Home Assistant Sections, with full canvas freedom. Included with Ultra Card Connect. | `hub.freespace.desc` |
| Install Ultra Card Connect to unlock FreeSpace. Existing FreeSpace views still render without it. | `hub.freespace.needs_connect` |
| Install guide | `hub.freespace.install_connect` |
| Open a dashboard and tap Edit dashboard | `hub.freespace.step1` |
| Pencil the view → Layout → FreeSpace (Ultra Card) | `hub.freespace.step2` |
| Drag cards freely; use corner icons to rotate; layer them as you like | `hub.freespace.step3` |

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
<summary><strong>Theme (editor)</strong> — 5 left</summary>

| English text | Key |
| --- | --- |
| Inherit from theme | `editor.theme.inherit` |
| Theme | `editor.theme.inherit_short` |
| Follow global default | `editor.theme.follow_global` |
| None | `editor.theme.none` |
| Ignore every theme, including the global default. | `editor.theme.none_desc` |

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
<summary><strong>Groups (ultra card hub)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Home | `hub.groups.home` |
| Library | `hub.groups.library` |
| Account | `hub.groups.account` |
| Help | `hub.groups.help` |

</details>

<details>
<summary><strong>Hover effects (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Animation Settings | `editor.hover_effects.animation_settings` |
| Duration | `editor.hover_effects.duration` |
| Timing Function | `editor.hover_effects.timing` |
| Intensity | `editor.hover_effects.intensity` |

</details>

<details>
<summary><strong>Tabs (ultra card hub)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Themes | `hub.tabs.themes` |
| Variables | `hub.tabs.variables` |
| Templates | `hub.tabs.templates` |
| Docs | `hub.tabs.docs` |

</details>

<details>
<summary><strong>Timer (editor)</strong> — 4 left</summary>

| English text | Key |
| --- | --- |
| Digital | `editor.timer.style.digital` |
| Preset durations (minutes) | `editor.timer.preset_durations` |
| Quick-start buttons shown when the timer is idle. | `editor.timer.preset_durations_desc` |
| Minutes (e.g. 10) | `editor.timer.preset_placeholder` |

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
<summary><strong>Dashboard (ultra card hub)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| {count} presets awaiting review | `hub.dashboard.presets_awaiting_review` |
| {count} with changes requested | `hub.dashboard.presets_changes_requested` |
| View My Presets | `hub.dashboard.view_my_presets` |

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
<summary><strong>Rss feed (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| Feeds | `editor.rss_feed.feeds_section` |
|  s | `editor.rss_feed.unit_seconds` |
| Color | `editor.rss_feed.feed_color` |

</details>

<details>
<summary><strong>Separator (editor)</strong> — 3 left</summary>

| English text | Key |
| --- | --- |
| Horizontal | `editor.separator.orientation.horizontal` |
| Vertical | `editor.separator.orientation.vertical` |
| Color | `editor.separator.color.title` |

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
<summary><strong>Living canvas (editor)</strong> — 2 left</summary>

| English text | Key |
| --- | --- |
| Aurora | `editor.living_canvas.preset_aurora` |
| Plasma | `editor.living_canvas.preset_plasma` |

</details>

<details>
<summary><strong>Native card (editor)</strong> — 2 left</summary>

| English text | Key |
| --- | --- |
| {name} Settings | `editor.native_card.settings_title` |
| Configure this native Home Assistant card using its built-in editor. | `editor.native_card.settings_desc` |

</details>

<details>
<summary><strong>About (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Documentation in Ultra Card Hub | `editor.about.hub_docs` |

</details>

<details>
<summary><strong>Color input (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Hex (input_text) | `editor.color_input.mode_options.hex` |

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
<summary><strong>Layout logic (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Variable | `editor.layout_logic.condition_fields.variable` |

</details>

<details>
<summary><strong>Lock (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| PIN | `editor.lock.pin_field` |

</details>

<details>
<summary><strong>Media player (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Visual | `editor.media_player.section_visual` |

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
<summary><strong>Ui (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Variables | `editor.ui.presets_selector_tab.variables` |

</details>

<details>
<summary><strong>Video bg (editor)</strong> — 1 left</summary>

| English text | Key |
| --- | --- |
| Video URL | `editor.video_bg.video_url` |

</details>
