import type { UltraModule } from './base-module';

/**
 * Loader: returns the module instance when needed.
 *
 * Multi-file build (see docs/bundle-strategy.md):
 * - Everyday modules keep `webpackMode: "eager"` so they ship inside
 *   ultra-card.js and a typical card renders with no loading skeleton.
 * - Every other module is its own `uc-m-<type>.<hash>.js` chunk, fetched the
 *   first time a card (or the editor) needs it. Tiny input modules share one
 *   `m-inputs` chunk. Heavy vendors (three, leaflet, swiper, ...) are split
 *   into named vendor chunks by webpack.config.js.
 */
export type ModuleLoader = () => Promise<UltraModule>;

/** Core module loaders. Eager for essentials, lazy chunks for everything else. */
export const coreLoaders: Record<string, ModuleLoader> = {
  text: () => import(/* webpackMode: "eager" */ './text-module').then(m => new m.UltraTextModule()),
  separator: () =>
    import(/* webpackMode: "eager" */ './separator-module').then(m => new m.UltraSeparatorModule()),
  image: () =>
    import(/* webpackMode: "eager" */ './image-module').then(m => new m.UltraImageModule()),
  info: () => import(/* webpackMode: "eager" */ './info-module').then(m => new m.UltraInfoModule()),
  bar: () => import(/* webpackMode: "eager" */ './bar-module').then(m => new m.UltraBarModule()),
  gauge: () =>
    import(/* webpackChunkName: "m-gauge" */ './gauge-module').then(m => new m.UltraGaugeModule()),
  icon: () => import(/* webpackMode: "eager" */ './icon-module').then(m => new m.UltraIconModule()),
  button: () =>
    import(/* webpackMode: "eager" */ './button-module').then(m => new m.UltraButtonModule()),
  spinbox: () =>
    import(/* webpackChunkName: "m-spinbox" */ './spinbox-module').then(
      m => new m.UltraSpinboxModule()
    ),
  markdown: () =>
    import(/* webpackChunkName: "m-markdown" */ './markdown-module').then(
      m => new m.UltraMarkdownModule()
    ),
  horizontal: () =>
    import(/* webpackMode: "eager" */ './horizontal-module').then(
      m => new m.UltraHorizontalModule()
    ),
  vertical: () =>
    import(/* webpackMode: "eager" */ './vertical-module').then(m => new m.UltraVerticalModule()),
  stack: () =>
    import(/* webpackChunkName: "m-stack" */ './stack-module').then(m => new m.UltraStackModule()),
  accordion: () =>
    import(/* webpackChunkName: "m-accordion" */ './accordion-module').then(
      m => new m.UltraAccordionModule()
    ),
  popup: () =>
    import(/* webpackChunkName: "m-popup" */ './popup-module').then(m => new m.UltraPopupModule()),
  slider: () =>
    import(/* webpackChunkName: "m-slider" */ './slider-module').then(
      m => new m.UltraSliderModule()
    ),
  slider_control: () =>
    import(/* webpackChunkName: "m-slider-control" */ './slider-control-module').then(
      m => new m.UltraSliderControlModule()
    ),
  pagebreak: () =>
    import(/* webpackMode: "eager" */ './pagebreak-module').then(m => new m.UltraPageBreakModule()),
  camera: () =>
    import(/* webpackChunkName: "m-camera" */ './camera-module').then(
      m => new m.UltraCameraModule()
    ),
  graphs: () =>
    import(/* webpackChunkName: "m-graphs" */ './graphs-module').then(
      m => new m.UltraGraphsModule()
    ),
  dropdown: () =>
    import(/* webpackChunkName: "m-dropdown" */ './dropdown-module').then(
      m => new m.UltraDropdownModule()
    ),
  light: () =>
    import(/* webpackChunkName: "m-light" */ './light-module').then(m => new m.UltraLightModule()),
  map: () =>
    import(/* webpackChunkName: "m-map" */ './map-module').then(m => new m.UltraMapModule()),
  animated_clock: () =>
    import(/* webpackChunkName: "m-animated-clock" */ './animated-clock-module').then(
      m => new m.UltraAnimatedClockModule()
    ),
  animated_weather: () =>
    import(/* webpackChunkName: "m-animated-weather" */ './animated-weather-module').then(
      m => new m.UltraAnimatedWeatherModule()
    ),
  animated_forecast: () =>
    import(/* webpackChunkName: "m-animated-forecast" */ './animated-forecast-module').then(
      m => new m.UltraAnimatedForecastModule()
    ),
  external_card: () =>
    import(/* webpackChunkName: "m-external-card" */ './external-card-module').then(
      m => new m.UltraExternalCardModule()
    ),
  native_card: () =>
    import(/* webpackChunkName: "m-native-card" */ './native-card-module').then(
      m => new m.UltraNativeCardModule()
    ),
  video_bg: () =>
    import(/* webpackChunkName: "m-video-bg" */ './video-bg-module').then(
      m => new m.UltraVideoBgModule()
    ),
  climate: () =>
    import(/* webpackChunkName: "m-climate" */ './climate-module').then(
      m => new m.UltraClimateModule()
    ),
  dynamic_weather: () =>
    import(/* webpackChunkName: "m-dynamic-weather" */ './dynamic-weather-module').then(
      m => new m.UltraDynamicWeatherModule()
    ),
  background: () =>
    import(/* webpackChunkName: "m-background" */ './background-module').then(
      m => new m.UltraBackgroundModule()
    ),
  status_summary: () =>
    import(/* webpackChunkName: "m-status-summary" */ './status-summary-module').then(
      m => new m.UltraStatusSummaryModule()
    ),
  toggle: () =>
    import(/* webpackChunkName: "m-toggle" */ './toggle-module').then(
      m => new m.UltraToggleModule()
    ),
  tabs: () =>
    import(/* webpackChunkName: "m-tabs" */ './tabs-module').then(m => new m.UltraTabsModule()),
  grid_layout: () =>
    import(/* webpackChunkName: "m-grid-layout" */ './grid-layout-module').then(
      m => new m.UltraGridLayoutModule()
    ),
  flip_card: () =>
    import(/* webpackChunkName: "m-flip-card" */ './flip-card-module').then(
      m => new m.UltraFlipCardModule()
    ),
  drawer: () =>
    import(/* webpackChunkName: "m-drawer" */ './drawer-module').then(
      m => new m.UltraDrawerModule()
    ),
  scroll_row: () =>
    import(/* webpackChunkName: "m-scroll-row" */ './scroll-row-module').then(
      m => new m.UltraScrollRowModule()
    ),
  state_switcher: () =>
    import(/* webpackChunkName: "m-state-switcher" */ './state-switcher-module').then(
      m => new m.UltraStateSwitcherModule()
    ),
  calendar: () =>
    import(/* webpackChunkName: "m-calendar" */ './calendar-module').then(
      m => new m.UltraCalendarModule()
    ),
  sports_score: () =>
    import(/* webpackChunkName: "m-sports-score" */ './sports-score-module').then(
      m => new m.UltraSportsScoreModule()
    ),
  badge_of_honor: () =>
    import(/* webpackChunkName: "m-badge-of-honor" */ './badge-of-honor-module').then(
      m => new m.UltraBadgeOfHonorModule()
    ),
  grid: () =>
    import(/* webpackChunkName: "m-grid" */ './grid-module').then(m => new m.UltraGridModule()),
  vacuum: () =>
    import(/* webpackChunkName: "m-vacuum" */ './vacuum-module').then(
      m => new m.UltraVacuumModule()
    ),
  media_player: () =>
    import(/* webpackChunkName: "m-media-player" */ './media-player-module').then(
      m => new m.UltraMediaPlayerModule()
    ),
  people: () =>
    import(/* webpackChunkName: "m-people" */ './people-module').then(
      m => new m.UltraPeopleModule()
    ),
  navigation: () =>
    import(/* webpackChunkName: "m-navigation" */ './navigation-module').then(
      m => new m.UltraNavigationModule()
    ),
  timer: () =>
    import(/* webpackChunkName: "m-timer" */ './timer-module').then(m => new m.UltraTimerModule()),
  cover: () =>
    import(/* webpackChunkName: "m-cover" */ './cover-module').then(m => new m.UltraCoverModule()),
  fan: () =>
    import(/* webpackChunkName: "m-fan" */ './fan-module').then(m => new m.UltraFanModule()),
  lock: () =>
    import(/* webpackChunkName: "m-lock" */ './lock-module').then(m => new m.UltraLockModule()),
  'dynamic-list': () =>
    import(/* webpackChunkName: "m-dynamic-list" */ './dynamic-list-module').then(
      m => new m.UltraDynamicListModule()
    ),
  qr_code: () =>
    import(/* webpackChunkName: "m-qr-code" */ './qr-code-module').then(
      m => new m.UltraQrCodeModule()
    ),
  energy_display: () =>
    import(/* webpackChunkName: "m-energy-display" */ './energy-display-module').then(
      m => new m.UltraEnergyDisplayModule()
    ),
  living_canvas: () =>
    import(/* webpackChunkName: "m-living-canvas" */ './living-canvas-module').then(
      m => new m.UltraLivingCanvasModule()
    ),
  text_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './text-input-module').then(
      m => new m.UltraTextInputModule()
    ),
  datetime_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './datetime-input-module').then(
      m => new m.UltraDatetimeInputModule()
    ),
  number_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './number-input-module').then(
      m => new m.UltraNumberInputModule()
    ),
  slider_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './slider-input-module').then(
      m => new m.UltraSliderInputModule()
    ),
  select_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './select-input-module').then(
      m => new m.UltraSelectInputModule()
    ),
  boolean_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './boolean-input-module').then(
      m => new m.UltraBooleanInputModule()
    ),
  button_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './button-input-module').then(
      m => new m.UltraButtonInputModule()
    ),
  counter_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './counter-input-module').then(
      m => new m.UltraCounterInputModule()
    ),
  color_input: () =>
    import(/* webpackChunkName: "m-inputs" */ './color-input-module').then(
      m => new m.UltraColorInputModule()
    ),
  activity_feed: () =>
    import(/* webpackChunkName: "m-activity-feed" */ './activity-feed-module').then(
      m => new m.UltraActivityFeedModule()
    ),
  alert_center: () =>
    import(/* webpackChunkName: "m-alert-center" */ './alert-center-module').then(
      m => new m.UltraAlertCenterModule()
    ),
  area_summary: () =>
    import(/* webpackChunkName: "m-area-summary" */ './area-summary-module').then(
      m => new m.UltraAreaSummaryModule()
    ),
  virtual_pet: () =>
    import(/* webpackChunkName: "m-virtual-pet" */ './virtual-pet-module').then(
      m => new m.UltraVirtualPetModule()
    ),
  alarm_panel: () =>
    import(/* webpackChunkName: "m-alarm-panel" */ './alarm-panel-module').then(
      m => new m.UltraAlarmPanelModule()
    ),
  solar_analytics: () =>
    import(/* webpackChunkName: "m-solar-analytics" */ './solar-analytics-module').then(
      m => new m.UltraSolarAnalyticsModule()
    ),
  screensaver: () =>
    import(/* webpackChunkName: "m-screensaver" */ './screensaver-module').then(
      m => new m.UltraScreensaverModule()
    ),
  time_machine: () =>
    import(/* webpackChunkName: "m-time-machine" */ './time-machine-module').then(
      m => new m.UltraTimeMachineModule()
    ),
  lunar_phase: () =>
    import(/* webpackChunkName: "m-lunar-phase" */ './lunar-phase-module').then(
      m => new m.UltraLunarPhaseModule()
    ),
  battery_monitor: () =>
    import(/* webpackChunkName: "m-battery-monitor" */ './battery-monitor-module').then(
      m => new m.UltraBatteryMonitorModule()
    ),
  auto_entity_list: () =>
    import(/* webpackChunkName: "m-auto-entity-list" */ './auto-entity-list-module').then(
      m => new m.UltraAutoEntityListModule()
    ),
  update_monitor: () =>
    import(/* webpackChunkName: "m-update-monitor" */ './update-monitor-module').then(
      m => new m.UltraUpdateMonitorModule()
    ),
  clock: () =>
    import(/* webpackChunkName: "m-clock" */ './clock-module').then(m => new m.UltraClockModule()),
  humidifier: () =>
    import(/* webpackChunkName: "m-humidifier" */ './humidifier-module').then(
      m => new m.UltraHumidifierModule()
    ),
  washer: () =>
    import(/* webpackChunkName: "m-appliance" */ './appliance-module').then(
      m => new m.UltraWasherModule()
    ),
  dryer: () =>
    import(/* webpackChunkName: "m-appliance" */ './appliance-module').then(
      m => new m.UltraDryerModule()
    ),
  dishwasher: () =>
    import(/* webpackChunkName: "m-appliance" */ './appliance-module').then(
      m => new m.UltraDishwasherModule()
    ),
  range: () =>
    import(/* webpackChunkName: "m-appliance" */ './appliance-module').then(
      m => new m.UltraRangeModule()
    ),
  fridge: () =>
    import(/* webpackChunkName: "m-appliance" */ './appliance-module').then(
      m => new m.UltraFridgeModule()
    ),
  todo_list: () =>
    import(/* webpackChunkName: "m-todo-list" */ './todo-list-module').then(
      m => new m.UltraTodoListModule()
    ),
  weather: () =>
    import(/* webpackChunkName: "m-weather" */ './weather-module').then(
      m => new m.UltraWeatherModule()
    ),
  dog_duty: () =>
    import(/* webpackChunkName: "m-dog-duty" */ './dog-duty-module').then(
      m => new m.UltraDogDutyModule()
    ),
  cleaning_zones: () =>
    import(/* webpackChunkName: "m-cleaning-zones" */ './cleaning-zones-module').then(
      m => new m.UltraCleaningZonesModule()
    ),
  battery_fleet: () =>
    import(/* webpackChunkName: "m-battery-fleet" */ './battery-fleet-module').then(
      m => new m.UltraBatteryFleetModule()
    ),
  plant_care: () =>
    import(/* webpackChunkName: "m-plant-care" */ './plant-care-module').then(
      m => new m.UltraPlantCareModule()
    ),
  laundry_tracker: () =>
    import(/* webpackChunkName: "m-laundry-tracker" */ './laundry-tracker-module').then(
      m => new m.UltraLaundryTrackerModule()
    ),
  vehicle_maintenance: () =>
    import(/* webpackChunkName: "m-vehicle-maintenance" */ './vehicle-maintenance-module').then(
      m => new m.UltraVehicleMaintenanceModule()
    ),
  vampire_power: () =>
    import(/* webpackChunkName: "m-vampire-power" */ './vampire-power-module').then(
      m => new m.UltraVampirePowerModule()
    ),
  unifi: () =>
    import(/* webpackChunkName: "m-unifi" */ './unifi-module').then(m => new m.UltraUnifiModule()),
};
