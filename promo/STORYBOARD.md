# Ultra Card — 30-second teaser storyboard

Apple keynote style: black frames, one idea per card, big type, no voiceover, cuts on the beat. Text + real UI footage only.

- Format: 1920x1080, 30 fps, 900 frames, 0:30.0 exactly
- Look: pure black (#000) between shots, footage floats on black with a soft 28 px radius and a faint edge glow; brand accents cyan `#22d3ee` and violet `#a21caf` (from the logo)
- Type: SF Pro / system stack, weight 600–700, tight tracking (-0.02 em); white text, secondary text at 55 % opacity
- Remotion implementation: `promo/` on branch `promo/teaser-video`; every timecode below maps 1:1 to `promo/src/storyboard.ts`

## Timeline

| # | Time | Frames | Beat | On-screen text | Footage / action | Motion | Music |
|---|------|--------|------|----------------|------------------|--------|-------|
| 1 | 0:00.0–0:03.0 | 0–90 | Cold-open hook | `Skip the YAML.` | Black. No footage. | Text blur-in at 0:00.4 (blur 16→0, scale 0.96→1, 18 f). Hold. Hard cut out at 0:03.0. | Single low pad note / sub hit at 0:00.0. Silence-ish. First rhythmic hit lands on the cut at 0:03.0. |
| 2 | 0:03.0–0:08.0 | 90–240 | Feature 1 — Layout Builder | `Drag.` `Drop.` `Done.` (word by word) | Clip 02: editor open, module picker on the left, drag the **Gauge** module into an empty column; it snaps in and renders live. | Footage cuts in hard at 100 %, slow push-in to 105 % over the shot. Words stagger in at 0:03.5 / 0:04.0 / 0:04.5 (one per beat), hold, fade out 0:07.4–0:07.8. | Groove enters. Word hits on beats 1, 2, 3 of the bar. |
| 3 | 0:08.0–0:13.0 | 240–390 | Feature 2 — Modules | `96 modules.` → `One editor.` | Clips 03a/03b/03c: 1-second close-ups of **Gauge**, **Graphs**, **Climate** (hard cuts at 0:09.0, 0:10.0). Clip 03d (0:11.0–0:13.0): module picker scrolling smoothly. | Close-ups: hard cuts, each with a gentle 103 % drift. Headline `96 modules.` blur-in at 0:08.2, stays over the cuts; crossfades to `One editor.` at 0:11.0 (blur out/in, 12 f). | Cuts on the beat every 1.0 s (60 BPM feel or half-time of 120). |
| 4 | 0:13.0–0:18.0 | 390–540 | Feature 3 — Theme Engine | kicker `THEME ENGINE` + `Every look. One click.` | Clip 04: same dashboard. Hub → **Themes** tab. Click **Glass** → **Liquid Glass** → **Vapor** → **Wood**; ~1 s per switch, whole card restyles live. | Very slow pull-out 106 % → 100 % (the reverse of shot 2). Kicker fades in at 0:13.2; headline blur-in at 0:13.6. Hold until 0:17.4, fade. | Harmonic shift / filter opens here. Theme clicks should land near beats. |
| 5 | 0:18.0–0:22.0 | 540–660 | Feature 4 — Template Mode | kicker `TEMPLATE MODE` + `Reacts to your home.` | Clip 05: module editor with the **Template Mode** toggle already on and a short Jinja icon-color template visible. Toggle an entity (light or door) in a side panel; the module's icon and color change instantly. | Static camera, footage holds still; the *change* is the motion. Text in at 0:18.3, fade 0:21.5. | Build begins (rising hats / riser from ~0:20). |
| 6 | 0:22.0–0:26.0 | 660–780 | Examples montage | `Presets.` (0:22.0–0:23.3) · `Hub.` (0:23.3–0:24.7) · `Pro cloud.` (0:24.7–0:25.7) | Six cuts, 0.67 s each (20 f): 06a preset gallery scroll · 06b one-click preset install · 06c Hub sidebar opens · 06d Hub Docs/Favorites tab · 06e Pro cloud backups / snapshots list · 06f finished dashboard on a phone-width view. | Rapid hard cuts on every third beat; each clip 102 % drift. Words pop in (scale 0.9→1, 8 f), no blur, snappier than the feature beats. Dip to black 0:25.7–0:26.0. | Peak of the build. Cuts at 0:22.0, 0:22.67, 0:23.33, 0:24.0, 0:24.67, 0:25.33. Big resolve hit at 0:26.0. |
| 7 | 0:26.0–0:30.0 | 780–900 | Closing title | Logo / `ULTRA CARD` wordmark · `ultracard.io` · `Free for Home Assistant` | Brand end card from `assets/Ultra.jpg` (gradient + UC monogram + wordmark). No UI footage. | Logo fades in with blur 12→0 and scale 1.06→1.0 over 24 f (0:26.0–0:26.8). `ultracard.io` rises in at 0:27.4. Small line at 0:28.2. Everything holds to 0:30.0. Last 8 frames fade to black. | Resolve chord sustains; music fades from 0:27.5 to silence at 0:30.0. |

Reading pace check: every headline is ≤ 4 words and holds ≥ 1.3 s. Total distinct text cards: 11.

## Text animation spec (Apple style)

- Enter: opacity 0→1, `filter: blur(16px)→0`, scale 0.96→1.0, 18 frames, ease-out cubic. Words in multi-word headlines stagger 15 frames apart.
- Exit: opacity 1→0, blur 0→8 px, 12 frames. Never slide off screen.
- Kickers (`THEME ENGINE`, `TEMPLATE MODE`): 26 px, letter-spacing 0.22 em, uppercase, 55 % white, appear 12 frames before the headline.
- Montage words: scale 0.9→1.0 with a light spring, 8 frames, no blur; harder, faster feel.
- Position: headlines centered on black (shots 1, 3, 7) or bottom-center over footage (shots 2, 4, 5, 6) with a 22 % bottom gradient so text stays legible.
- Nothing moves during the hold. Breathing room is part of the rhythm.

## Camera / footage treatment

- Footage sits in a rounded frame (28 px radius) at 88 % of canvas width on black, faint 1 px white edge at 8 % and a soft cyan/violet glow behind.
- Zooms are slow and small: 100→105 % push-in (shot 2), 106→100 % pull-out (shot 4), 102–103 % drift on quick cuts. Never both zoom and pan.
- Cuts are hard; the only fades are the hook-out, the montage dip-to-black, and the end card.
- Cursor stays visible in the footage; actions should be deliberate (about 60–70 % of normal speed).

## Music cues

- Target: ambient / minimal electronic, ~120 BPM (or 60 BPM half-time), 30–35 s usable length, instrumental, no vocals.
- Structure needed: quiet intro (0–3 s), groove enters at 3 s, texture change at 13 s, build from ~20 s, peak at 22–26 s, resolve hit at 26 s, tail to 30 s.
- Hard cuts on: 0:03.0 · 0:08.0 · 0:13.0 · 0:18.0 · 0:22.0 (then every 0.67 s) · 0:26.0.
- Fade-out 0:27.5 → 0:30.0 (handled in Remotion, `MUSIC.fadeOutStart`).
- If a chosen track's downbeat doesn't land on these, shift the whole timeline in `storyboard.ts` (`SHOTS[...].start`) rather than re-cutting clips.
- Candidates (downloaded, licenses in `media/music/LICENSES.md`): Scott Buckley "Effervescence" (CC BY 4.0, enters 12.5 s, peaks 25 s — closest to this cue sheet), HoliznaCC0 "Lost In Space" (CC0, lift at 17.5 s lands on the Template Mode beat), Scott Buckley "Luminance" (CC BY 4.0, groove at 10 s, step up at 22.5 s).

## Shot list — what to record on the HA test instance

Recording setup

- Browser at exactly **1920x1080** viewport (or 3840x2160 on a 2x display, which downscales sharper). Hide bookmarks bar, no browser extensions visible, 100 % zoom. Dark HA theme.
- Hide the HA sidebar where possible (kiosk mode or the sidebar toggle) except for the Hub shots, which need it.
- 60 fps if the tool allows (macOS `Cmd+Shift+5`, OBS, or Chrome DevTools recorder). Export H.264 `.mp4` or `.mov`. Start recording 1 s before each action and stop 1 s after; Remotion trims.
- Cursor: default size, visible. Move slowly; pause 0.5 s after each click so the UI settles.
- Save clips with the names below into `promo/public/clips/` (overwrite the placeholders).

Demo dashboard (build once, reuse across shots)

- A single Ultra Card with two rows: row 1 = Gauge (living room temperature) · Climate (thermostat) · Media Player (with album art playing); row 2 = Graphs (energy today, 24 h) · Light (living room, on) · Icon row (front door lock, garage, motion, battery). Card background: Living Canvas or Background module with a subtle gradient.
- Entities: `sensor.living_room_temperature`, `climate.living_room`, `media_player.living_room` (something actually playing with artwork), `sensor.energy_today`, `light.living_room`, `lock.front_door`, `binary_sensor.front_door`, `sensor.phone_battery`, `weather.home`, one `person.*` with a photo.
- Start theme: **Glass**. Have Liquid Glass, Vapor, Wood available in Hub → Themes.
- Preset Gallery: pick one visually strong community preset to install in shot 06b.

| Clip file | Length to record | What to do |
|-----------|------------------|------------|
| `clip-02-layout-builder.mp4` | 8 s | Editor open on the demo card, Layout Builder tab. Drag the **Gauge** module from the picker into an empty column. Let it snap and render. Hover the result. |
| `clip-03a-gauge.mp4` | 3 s | Close-up (browser zoom 150–175 %) of the Gauge module; needle/arc animating as value changes if possible. |
| `clip-03b-graphs.mp4` | 3 s | Close-up of the Graphs module; hover to show the tooltip. |
| `clip-03c-climate.mp4` | 3 s | Close-up of the Climate module; tap + once so the target temp changes. |
| `clip-03d-module-picker.mp4` | 5 s | Module picker open at 100 % zoom; scroll slowly and evenly through the list of 96 modules top to bottom. |
| `clip-04-theme-switch.mp4` | 9 s | Hub → **Themes** tab beside the dashboard. Click **Glass** → **Liquid Glass** → **Vapor** → **Wood**, about 1.5 s apart. The dashboard must be visible while it restyles. |
| `clip-05-template-mode.mp4` | 7 s | Module editor on an Icon module, **Template Mode** toggle on, short color template visible (e.g. red if `lock.front_door` is unlocked, green if locked). Toggle the lock from a second window/panel; the icon color changes live. |
| `clip-06a-presets-gallery.mp4` | 4 s | Presets tab → **Browse Marketplace**. Scroll the gallery slowly. |
| `clip-06b-preset-install.mp4` | 4 s | Click **Install** on one preset; card appears in the layout. |
| `clip-06c-hub-open.mp4` | 4 s | Click **Ultra Card Hub** in the HA sidebar; panel opens on Presets/Dashboard tab. |
| `clip-06d-hub-docs.mp4` | 4 s | Hub → Docs or Favorites tab, scroll briefly. |
| `clip-06e-pro-backups.mp4` | 4 s | Hub → Account / Pro → backups & snapshots list (daily backups visible). |
| `clip-06f-phone-view.mp4` | 4 s | Same dashboard in a phone-width responsive view (DevTools device mode, iPhone size) scrolling slowly. |

Optional B-roll (nice to have, not in the cut): `clip-x-ultra-dashboard.mp4` — Settings → Dashboards → Add dashboard → Community dashboards → Ultra Dashboard, one-click full dashboard generation.

Shot 1 and shot 7 need no footage.
