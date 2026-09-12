# Ultra Card teaser video (Remotion)

Self-contained [Remotion](https://www.remotion.dev) project for the 30-second Apple-style teaser. It is independent of the card build: its own `package.json`, nothing is added to the repo root.

- Composition: `UltraCardTeaser`, 1920x1080, 30 fps, 900 frames (30 s)
- Storyboard and shot list: `docs/promo-storyboard.md` in the Ultra Card Project store (timecodes match `src/storyboard.ts` 1:1)
- Requires Node 18+ and a Chromium download on first run (Remotion fetches it automatically). `ffmpeg` is only needed for `scripts/make-placeholders.sh`.

## Install

```bash
cd promo
npm install
```

## Preview

```bash
npm run studio
```

Opens Remotion Studio in the browser. Scrub the timeline; every shot is a named `<Sequence>` (`hook`, `layout-builder`, `modules`, `theme-engine`, `template-mode`, `montage`, `end-card`).

## Drop in the recorded clips

Record the footage listed in the storyboard's shot list, then overwrite the placeholders in `public/clips/` using the same file names:

```
clip-02-layout-builder.mp4   clip-04-theme-switch.mp4      clip-06c-hub-open.mp4
clip-03a-gauge.mp4           clip-05-template-mode.mp4     clip-06d-hub-docs.mp4
clip-03b-graphs.mp4          clip-06a-presets-gallery.mp4  clip-06e-pro-backups.mp4
clip-03c-climate.mp4         clip-06b-preset-install.mp4   clip-06f-phone-view.mp4
clip-03d-module-picker.mp4
```

Each slot skips the first second of its clip (`trimBefore` in `src/storyboard.ts`) so you can start recording a moment before the action. Adjust `trimBefore` per clip if a take starts late. If a file is missing, the slot renders a labelled placeholder instead of failing. Any H.264 `.mp4`/`.mov` works; 1920x1080 or larger at 30/60 fps is ideal.

## Music

Copy the chosen track to `public/music/teaser-music.mp3` (git-ignored). Candidates with licenses are in `media/music/LICENSES.md` in the Project store. The track fades in over 0.5 s and out from 27.5 s to 30 s (`MUSIC` in `src/storyboard.ts`). With no file present the video renders silent.

Remember the credit line for CC-BY tracks in the video description.

## Render

```bash
npm run render            # out/ultra-card-teaser.mp4, 1080p H.264, CRF 18
npm run render:preview    # quick half-resolution check
npm run still:endcard     # PNG of the closing frame
```

`npx remotion render UltraCardTeaser out/file.mp4` also works directly; see `npx remotion render --help` for `--scale`, `--crf`, `--codec` (e.g. `prores` for editing handoff).

## Re-timing to a track

All cut points live in `src/storyboard.ts` (`SHOTS[...].start`, `TEXT`, `MUSIC`). Shift a shot's `start` to land on a downbeat; text and clip slots inside the shot move with it. Copy lives in `COPY`.

## Placeholders

`scripts/make-placeholders.sh` regenerates the labelled stand-in clips in `public/clips/` with ffmpeg (used to verify the pipeline before real footage exists).

## Layout

```
promo/
  package.json            scripts: studio, render, render:preview, still:endcard, typecheck
  remotion.config.ts
  src/
    index.ts              registerRoot
    Root.tsx              <Composition id="UltraCardTeaser">
    Teaser.tsx            shot sequences
    storyboard.ts         all timing, clip manifest, copy, music settings
    theme.ts              font stack, colours, easing
    components/
      AppleText.tsx       Headline, Kicker, StaggerWords, PopWord, BottomVignette
      ClipSlot.tsx        <OffthreadVideo> slot with frame, glow, Ken Burns, missing-clip fallback
      EndCard.tsx         logo + ultracard.io closing title
      MusicTrack.tsx      <Audio> with fade in/out
  public/
    brand/ultra-card-logo.jpg   copied from ../assets/Ultra.jpg
    clips/                      placeholder MP4s, overwrite with recordings
    music/                      drop teaser-music.mp3 here
  scripts/make-placeholders.sh
```
