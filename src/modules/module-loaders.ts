import type { UltraModule } from './base-module';

/**
 * Loader: returns the module instance when needed.
 * True webpack async chunks (uc-mod-*.js) — colocated with ultra-card.js for HACS.
 * See docs/bundle-strategy.md. Rollback: window.__ultraCardLazyModules = false
 * only affects preload policy; loaders always use dynamic import.
 */
export type ModuleLoader = () => Promise<UltraModule>;

/** Core module loaders — one async chunk per module type. */
export const coreLoaders: Record<string, ModuleLoader> = {
  text: () =>
    import(/* webpackChunkName: "mod-text" */ './text-module').then(m => new m.UltraTextModule()),
  separator: () =>
    import(/* webpackChunkName: "mod-separator" */ './separator-module').then(
      m => new m.UltraSeparatorModule()
    ),
  image: () =>
    import(/* webpackChunkName: "mod-image" */ './image-module').then(m => new m.UltraImageModule()),
  info: () =>
    import(/* webpackChunkName: "mod-info" */ './info-module').then(m => new m.UltraInfoModule()),
  bar: () =>
    import(/* webpackChunkName: "mod-bar" */ './bar-module').then(m => new m.UltraBarModule()),
  gauge: () =>
    import(/* webpackChunkName: "mod-gauge" */ './gauge-module').then(m => new m.UltraGaugeModule()),
  icon: () =>
    import(/* webpackChunkName: "mod-icon" */ './icon-module').then(m => new m.UltraIconModule()),
  button: () =>
    import(/* webpackChunkName: "mod-button" */ './button-module').then(
      m => new m.UltraButtonModule()
    ),
  spinbox: () =>
    import(/* webpackChunkName: "mod-spinbox" */ './spinbox-module').then(
      m => new m.UltraSpinboxModule()
    ),
  markdown: () =>
    import(/* webpackChunkName: "mod-markdown" */ './markdown-module').then(
      m => new m.UltraMarkdownModule()
    ),
  horizontal: () =>
    import(/* webpackChunkName: "mod-horizontal" */ './horizontal-module').then(
      m => new m.UltraHorizontalModule()
    ),
  vertical: () =>
    import(/* webpackChunkName: "mod-vertical" */ './vertical-module').then(
      m => new m.UltraVerticalModule()
    ),
  stack: () =>
    import(/* webpackChunkName: "mod-stack" */ './stack-module').then(m => new m.UltraStackModule()),
  accordion: () =>
    import(/* webpackChunkName: "mod-accordion" */ './accordion-module').then(
      m => new m.UltraAccordionModule()
    ),
  popup: () =>
    import(/* webpackChunkName: "mod-popup" */ './popup-module').then(m => new m.UltraPopupModule()),
  slider: () =>
    import(/* webpackChunkName: "mod-slider" */ './slider-module').then(
      m => new m.UltraSliderModule()
    ),
  slider_control: () =>
    import(/* webpackChunkName: "mod-slider-control" */ './slider-control-module').then(
      m => new m.UltraSliderControlModule()
    ),
  pagebreak: () =>
    import(/* webpackChunkName: "mod-pagebreak" */ './pagebreak-module').then(
      m => new m.UltraPageBreakModule()
    ),
  camera: () =>
    import(/* webpackChunkName: "mod-camera" */ './camera-module').then(
      m => new m.UltraCameraModule()
    ),
  graphs: () =>
    import(/* webpackChunkName: "mod-graphs" */ './graphs-module').then(
      m => new m.UltraGraphsModule()
    ),
  dropdown: () =>
    import(/* webpackChunkName: "mod-dropdown" */ './dropdown-module').then(
      m => new m.UltraDropdownModule()
    ),
  light: () =>
    import(/* webpackChunkName: "mod-light" */ './light-module').then(m => new m.UltraLightModule()),
  map: () =>
    import(/* webpackChunkName: "mod-map" */ './map-module').then(m => new m.UltraMapModule()),
  animated_clock: () =>
    import(/* webpackChunkName: "mod-animated-clock" */ './animated-clock-module').then(
      m => new m.UltraAnimatedClockModule()
    ),
  animated_weather: () =>
    import(/* webpackChunkName: "mod-animated-weather" */ './animated-weather-module').then(
      m => new m.UltraAnimatedWeatherModule()
    ),
  animated_forecast: () =>
    import(/* webpackChunkName: "mod-animated-forecast" */ './animated-forecast-module').then(
      m => new m.UltraAnimatedForecastModule()
    ),
  external_card: () =>
    import(/* webpackChunkName: "mod-external-card" */ './external-card-module').then(
      m => new m.UltraExternalCardModule()
    ),
  native_card: () =>
    import(/* webpackChunkName: "mod-native-card" */ './native-card-module').then(
      m => new m.UltraNativeCardModule()
    ),
  video_bg: () =>
    import(/* webpackChunkName: "mod-video-bg" */ './video-bg-module').then(
      m => new m.UltraVideoBgModule()
    ),
  climate: () =>
    import(/* webpackChunkName: "mod-climate" */ './climate-module').then(
      m => new m.UltraClimateModule()
    ),
  dynamic_weather: () =>
    import(/* webpackChunkName: "mod-dynamic-weather" */ './dynamic-weather-module').then(
      m => new m.UltraDynamicWeatherModule()
    ),
  background: () =>
    import(/* webpackChunkName: "mod-background" */ './background-module').then(
      m => new m.UltraBackgroundModule()
    ),
  status_summary: () =>
    import(/* webpackChunkName: "mod-status-summary" */ './status-summary-module').then(
      m => new m.UltraStatusSummaryModule()
    ),
  toggle: () =>
    import(/* webpackChunkName: "mod-toggle" */ './toggle-module').then(
      m => new m.UltraToggleModule()
    ),
  tabs: () =>
    import(/* webpackChunkName: "mod-tabs" */ './tabs-module').then(m => new m.UltraTabsModule()),
  calendar: () =>
    import(/* webpackChunkName: "mod-calendar" */ './calendar-module').then(
      m => new m.UltraCalendarModule()
    ),
  sports_score: () =>
    import(/* webpackChunkName: "mod-sports-score" */ './sports-score-module').then(
      m => new m.UltraSportsScoreModule()
    ),
  badge_of_honor: () =>
    import(/* webpackChunkName: "mod-badge-of-honor" */ './badge-of-honor-module').then(
      m => new m.UltraBadgeOfHonorModule()
    ),
  grid: () =>
    import(/* webpackChunkName: "mod-grid" */ './grid-module').then(m => new m.UltraGridModule()),
  vacuum: () =>
    import(/* webpackChunkName: "mod-vacuum" */ './vacuum-module').then(
      m => new m.UltraVacuumModule()
    ),
  media_player: () =>
    import(/* webpackChunkName: "mod-media-player" */ './media-player-module').then(
      m => new m.UltraMediaPlayerModule()
    ),
  people: () =>
    import(/* webpackChunkName: "mod-people" */ './people-module').then(
      m => new m.UltraPeopleModule()
    ),
  navigation: () =>
    import(/* webpackChunkName: "mod-navigation" */ './navigation-module').then(
      m => new m.UltraNavigationModule()
    ),
  timer: () =>
    import(/* webpackChunkName: "mod-timer" */ './timer-module').then(m => new m.UltraTimerModule()),
  cover: () =>
    import(/* webpackChunkName: "mod-cover" */ './cover-module').then(m => new m.UltraCoverModule()),
  fan: () =>
    import(/* webpackChunkName: "mod-fan" */ './fan-module').then(m => new m.UltraFanModule()),
  lock: () =>
    import(/* webpackChunkName: "mod-lock" */ './lock-module').then(m => new m.UltraLockModule()),
  'dynamic-list': () =>
    import(/* webpackChunkName: "mod-dynamic-list" */ './dynamic-list-module').then(
      m => new m.UltraDynamicListModule()
    ),
  qr_code: () =>
    import(/* webpackChunkName: "mod-qr-code" */ './qr-code-module').then(
      m => new m.UltraQrCodeModule()
    ),
  energy_display: () =>
    import(/* webpackChunkName: "mod-energy-display" */ './energy-display-module').then(
      m => new m.UltraEnergyDisplayModule()
    ),
  living_canvas: () =>
    import(/* webpackChunkName: "mod-living-canvas" */ './living-canvas-module').then(
      m => new m.UltraLivingCanvasModule()
    ),
  text_input: () =>
    import(/* webpackChunkName: "mod-text-input" */ './text-input-module').then(
      m => new m.UltraTextInputModule()
    ),
  datetime_input: () =>
    import(/* webpackChunkName: "mod-datetime-input" */ './datetime-input-module').then(
      m => new m.UltraDatetimeInputModule()
    ),
  number_input: () =>
    import(/* webpackChunkName: "mod-number-input" */ './number-input-module').then(
      m => new m.UltraNumberInputModule()
    ),
  slider_input: () =>
    import(/* webpackChunkName: "mod-slider-input" */ './slider-input-module').then(
      m => new m.UltraSliderInputModule()
    ),
  select_input: () =>
    import(/* webpackChunkName: "mod-select-input" */ './select-input-module').then(
      m => new m.UltraSelectInputModule()
    ),
  boolean_input: () =>
    import(/* webpackChunkName: "mod-boolean-input" */ './boolean-input-module').then(
      m => new m.UltraBooleanInputModule()
    ),
  button_input: () =>
    import(/* webpackChunkName: "mod-button-input" */ './button-input-module').then(
      m => new m.UltraButtonInputModule()
    ),
  counter_input: () =>
    import(/* webpackChunkName: "mod-counter-input" */ './counter-input-module').then(
      m => new m.UltraCounterInputModule()
    ),
  color_input: () =>
    import(/* webpackChunkName: "mod-color-input" */ './color-input-module').then(
      m => new m.UltraColorInputModule()
    ),
  activity_feed: () =>
    import(/* webpackChunkName: "mod-activity-feed" */ './activity-feed-module').then(
      m => new m.UltraActivityFeedModule()
    ),
  alert_center: () =>
    import(/* webpackChunkName: "mod-alert-center" */ './alert-center-module').then(
      m => new m.UltraAlertCenterModule()
    ),
  area_summary: () =>
    import(/* webpackChunkName: "mod-area-summary" */ './area-summary-module').then(
      m => new m.UltraAreaSummaryModule()
    ),
  virtual_pet: () =>
    import(/* webpackChunkName: "mod-virtual-pet" */ './virtual-pet-module').then(
      m => new m.UltraVirtualPetModule()
    ),
  alarm_panel: () =>
    import(/* webpackChunkName: "mod-alarm-panel" */ './alarm-panel-module').then(
      m => new m.UltraAlarmPanelModule()
    ),
  solar_analytics: () =>
    import(/* webpackChunkName: "mod-solar-analytics" */ './solar-analytics-module').then(
      m => new m.UltraSolarAnalyticsModule()
    ),
  screensaver: () =>
    import(/* webpackChunkName: "mod-screensaver" */ './screensaver-module').then(
      m => new m.UltraScreensaverModule()
    ),
  lunar_phase: () =>
    import(/* webpackChunkName: "mod-lunar-phase" */ './lunar-phase-module').then(
      m => new m.UltraLunarPhaseModule()
    ),
  battery_monitor: () =>
    import(/* webpackChunkName: "mod-battery-monitor" */ './battery-monitor-module').then(
      m => new m.UltraBatteryMonitorModule()
    ),
  auto_entity_list: () =>
    import(/* webpackChunkName: "mod-auto-entity-list" */ './auto-entity-list-module').then(
      m => new m.UltraAutoEntityListModule()
    ),
  update_monitor: () =>
    import(/* webpackChunkName: "mod-update-monitor" */ './update-monitor-module').then(
      m => new m.UltraUpdateMonitorModule()
    ),
  clock: () =>
    import(/* webpackChunkName: "mod-clock" */ './clock-module').then(m => new m.UltraClockModule()),
  humidifier: () =>
    import(/* webpackChunkName: "mod-humidifier" */ './humidifier-module').then(
      m => new m.UltraHumidifierModule()
    ),
  todo_list: () =>
    import(/* webpackChunkName: "mod-todo-list" */ './todo-list-module').then(
      m => new m.UltraTodoListModule()
    ),
  weather: () =>
    import(/* webpackChunkName: "mod-weather" */ './weather-module').then(
      m => new m.UltraWeatherModule()
    ),
};
