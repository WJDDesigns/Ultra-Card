#!/usr/bin/env bash
# Generates small stand-in MP4s for every clip slot in src/storyboard.ts so the
# composition renders end-to-end before real footage exists. Requires ffmpeg.
# Real recordings overwrite these files (same names) in public/clips/.
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=public/clips
mkdir -p "$OUT"

# file|seconds|label   (seconds = recorded length from the storyboard shot list + 1s head)
CLIPS=(
  "clip-02-layout-builder.mp4|8|Layout Builder"
  "clip-03a-gauge.mp4|3|Gauge"
  "clip-03b-graphs.mp4|3|Graphs"
  "clip-03c-climate.mp4|3|Climate"
  "clip-03d-module-picker.mp4|5|Module picker"
  "clip-04-theme-switch.mp4|9|Theme Engine"
  "clip-05-template-mode.mp4|7|Template Mode"
  "clip-06a-presets-gallery.mp4|4|Presets gallery"
  "clip-06b-preset-install.mp4|4|Preset install"
  "clip-06c-hub-open.mp4|4|Hub"
  "clip-06d-hub-docs.mp4|4|Hub docs"
  "clip-06e-pro-backups.mp4|4|Pro cloud backups"
  "clip-06f-phone-view.mp4|4|Phone view"
)

FONT=$(fc-match -f '%{file}' 'sans-serif:bold' 2>/dev/null || true)
FONTOPT=""
if [ -n "$FONT" ]; then FONTOPT="fontfile=$FONT:"; fi

for entry in "${CLIPS[@]}"; do
  IFS='|' read -r file secs label <<<"$entry"
  echo "→ $OUT/$file (${secs}s)"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "gradients=size=1280x720:rate=30:duration=${secs}:speed=0.02:c0=0x0f172a:c1=0x1e1b4b:c2=0x3b0764:c3=0x22d3ee" \
    -vf "drawtext=${FONTOPT}text='PLACEHOLDER':fontsize=28:fontcolor=white@0.5:x=(w-text_w)/2:y=(h/2)-90,\
drawtext=${FONTOPT}text='${label}':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2,\
drawtext=${FONTOPT}text='${file}':fontsize=30:fontcolor=white@0.7:x=(w-text_w)/2:y=(h/2)+70,\
drawtext=${FONTOPT}text='%{pts\:hms}':fontsize=26:fontcolor=white@0.6:x=w-text_w-40:y=h-text_h-30" \
    -c:v libx264 -pix_fmt yuv420p -preset veryfast -crf 30 -movflags +faststart -an \
    "$OUT/$file"
done

echo "done: $(ls "$OUT"/*.mp4 | wc -l) placeholder clips in $OUT"
