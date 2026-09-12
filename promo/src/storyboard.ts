/**
 * Single source of truth for the teaser timeline.
 * Mirrors docs/promo-storyboard.md (Project store). All values are frames at 30 fps.
 * Shift a shot's `start` here to re-time the whole cut to a music track's downbeats.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_IN_FRAMES = 30 * FPS; // 900

export const sec = (s: number) => Math.round(s * FPS);

export type ClipCut = {
  /** File under public/clips/. Overwrite the placeholder with the real recording. */
  file: string;
  /** Frame offset relative to the shot start. */
  from: number;
  /** Length in frames. */
  duration: number;
  /** Frames to skip at the start of the recorded clip (trim head). */
  trimBefore?: number;
  /** Zoom from → to across the cut, e.g. [1, 1.05] for a slow push-in. */
  zoom?: [number, number];
  /** Short label shown on the placeholder when the clip is missing. */
  label: string;
};

export type Shot = {
  id: string;
  start: number;
  duration: number;
  cuts: ClipCut[];
};

export const SHOTS = {
  hook: { id: 'hook', start: sec(0), duration: sec(3), cuts: [] },

  layoutBuilder: {
    id: 'layout-builder',
    start: sec(3),
    duration: sec(5),
    cuts: [
      {
        file: 'clip-02-layout-builder.mp4',
        from: 0,
        duration: sec(5),
        trimBefore: sec(1),
        zoom: [1, 1.05],
        label: 'Layout Builder — drag Gauge module into column',
      },
    ],
  },

  modules: {
    id: 'modules',
    start: sec(8),
    duration: sec(5),
    cuts: [
      { file: 'clip-03a-gauge.mp4', from: 0, duration: sec(1), trimBefore: sec(1), zoom: [1, 1.03], label: 'Gauge close-up' },
      { file: 'clip-03b-graphs.mp4', from: sec(1), duration: sec(1), trimBefore: sec(1), zoom: [1, 1.03], label: 'Graphs close-up' },
      { file: 'clip-03c-climate.mp4', from: sec(2), duration: sec(1), trimBefore: sec(1), zoom: [1, 1.03], label: 'Climate close-up' },
      { file: 'clip-03d-module-picker.mp4', from: sec(3), duration: sec(2), trimBefore: sec(1), zoom: [1.02, 1.02], label: 'Module picker scrolling (96 modules)' },
    ],
  },

  themeEngine: {
    id: 'theme-engine',
    start: sec(13),
    duration: sec(5),
    cuts: [
      {
        file: 'clip-04-theme-switch.mp4',
        from: 0,
        duration: sec(5),
        trimBefore: sec(1),
        zoom: [1.06, 1],
        label: 'Theme Engine — Glass → Liquid Glass → Vapor → Wood',
      },
    ],
  },

  templateMode: {
    id: 'template-mode',
    start: sec(18),
    duration: sec(4),
    cuts: [
      {
        file: 'clip-05-template-mode.mp4',
        from: 0,
        duration: sec(4),
        trimBefore: sec(1),
        zoom: [1, 1],
        label: 'Template Mode — icon reacts to entity change',
      },
    ],
  },

  montage: {
    id: 'montage',
    start: sec(22),
    duration: sec(4),
    cuts: [
      { file: 'clip-06a-presets-gallery.mp4', from: 0, duration: 20, trimBefore: sec(1), zoom: [1, 1.02], label: 'Preset gallery scroll' },
      { file: 'clip-06b-preset-install.mp4', from: 20, duration: 20, trimBefore: sec(1), zoom: [1, 1.02], label: 'One-click preset install' },
      { file: 'clip-06c-hub-open.mp4', from: 40, duration: 20, trimBefore: sec(1), zoom: [1, 1.02], label: 'Ultra Card Hub opens' },
      { file: 'clip-06d-hub-docs.mp4', from: 60, duration: 20, trimBefore: sec(1), zoom: [1, 1.02], label: 'Hub Docs / Favorites' },
      { file: 'clip-06e-pro-backups.mp4', from: 80, duration: 20, trimBefore: sec(1), zoom: [1, 1.02], label: 'Pro cloud backups & snapshots' },
      { file: 'clip-06f-phone-view.mp4', from: 100, duration: 20, trimBefore: sec(1), zoom: [1, 1.02], label: 'Dashboard on phone width' },
    ],
  },

  endCard: { id: 'end-card', start: sec(26), duration: sec(4), cuts: [] },
} satisfies Record<string, Shot>;

/** Text cards, in frames relative to their shot. */
export const TEXT = {
  hook: { in: 12, out: sec(3) },
  layoutWords: { firstIn: 15, stagger: 15, out: sec(4.4) },
  modulesA: { in: 6, out: sec(3) },
  modulesB: { in: sec(3), out: sec(5) },
  themeKicker: { in: 6 },
  themeHeadline: { in: 18, out: sec(4.4) },
  templateKicker: { in: 6 },
  templateHeadline: { in: 9, out: sec(3.5) },
  montageWords: [
    { text: 'Presets.', in: 0, out: 40 },
    { text: 'Hub.', in: 40, out: 80 },
    { text: 'Pro cloud.', in: 80, out: 110 },
  ],
  montageDipToBlack: { start: 110 },
  endLogo: { in: 0 },
  endUrl: { in: 42 },
  endTagline: { in: 66 },
};

export const MUSIC = {
  /** Drop a track at public/music/teaser-music.mp3 (see media/music/LICENSES.md for candidates). */
  file: 'music/teaser-music.mp3',
  volume: 0.9,
  fadeInFrames: 15,
  fadeOutStart: sec(27.5),
  fadeOutEnd: DURATION_IN_FRAMES,
};

export const COPY = {
  hook: 'Skip the YAML.',
  layoutWords: ['Drag.', 'Drop.', 'Done.'],
  modulesA: '96 modules.',
  modulesB: 'One editor.',
  themeKicker: 'THEME ENGINE',
  themeHeadline: 'Every look. One click.',
  templateKicker: 'TEMPLATE MODE',
  templateHeadline: 'Reacts to your home.',
  endUrl: 'ultracard.io',
  endTagline: 'Free for Home Assistant',
};
