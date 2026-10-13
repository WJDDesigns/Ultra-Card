#!/bin/bash
# Ultra Card .55 preview watcher (macOS). Run it in a Terminal tab:
#
#   npm run ha55:watch
#
# Polls the `ha55-preview` branch on GitHub. When it moves, builds that commit in
# a separate clone (your own checkout is never touched) and deploys the card, and
# nothing else, to the test Home Assistant at 192.168.4.55, then shows a
# notification. Refresh the dashboard to see it. Ctrl+C stops it.
#
# The target host is fixed on purpose: this never deploys to any other instance.

set -u

HOST="192.168.4.55"
BRANCH="${UC_PREVIEW_BRANCH:-ha55-preview}"
INTERVAL="${UC_PREVIEW_INTERVAL:-15}"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
APP_DIR="${UC_PREVIEW_HOME:-$HOME/Library/Application Support/UltraCardHA55}"
CHECKOUT="$APP_DIR/checkout"
DEPLOY_JS="$APP_DIR/deploy.js"
STATE="$APP_DIR/deployed-sha"
LOCK_HASH="$APP_DIR/lock-hash"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

notify() {
  /usr/bin/osascript -e "display notification \"$2\" with title \"$1\"" >/dev/null 2>&1 || true
}

mkdir -p "$APP_DIR"
# Use the deploy script from the checkout you started this from, not from whatever
# commit is being previewed, so the .55-only behavior can't change under you.
cp "$REPO/deploy.js" "$DEPLOY_JS"
if [ ! -d "$CHECKOUT/.git" ]; then
  log "Cloning the repo for previews (one time)"
  git clone --quiet "$(git -C "$REPO" remote get-url origin)" "$CHECKOUT" || exit 1
fi

failed_sha=""

deploy_sha() {
  local sha="$1"
  log "New $BRANCH commit ${sha:0:7}, building"
  cd "$CHECKOUT" || return 1
  git fetch --quiet origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH" || return 1
  git checkout --quiet --force --detach "$sha" || return 1
  git clean --quiet -fdx -e node_modules || return 1

  local lock
  lock="$(shasum package-lock.json | cut -d' ' -f1)"
  if [ ! -d node_modules ] || [ "$lock" != "$(cat "$LOCK_HASH" 2>/dev/null)" ]; then
    log "Installing dependencies"
    npm ci --no-audit --no-fund --loglevel=error || return 1
    echo "$lock" > "$LOCK_HASH"
  fi

  npm run --silent build >"$APP_DIR/build.log" 2>&1 || {
    tail -20 "$APP_DIR/build.log"
    return 1
  }

  HA_DEPLOY_HOSTS="$HOST" UC_DEPLOY_CARD_ONLY=1 UC_DIST_DIR="$CHECKOUT/dist" \
    node "$DEPLOY_JS" || return 1
}

log "Watching $BRANCH every ${INTERVAL}s; deploys go to $HOST only. Ctrl+C to stop."
while true; do
  sha="$(git -C "$CHECKOUT" ls-remote origin "refs/heads/$BRANCH" 2>/dev/null | cut -f1)"
  if [ -n "$sha" ] && [ "$sha" != "$(cat "$STATE" 2>/dev/null)" ] && [ "$sha" != "$failed_sha" ]; then
    if deploy_sha "$sha"; then
      echo "$sha" > "$STATE"
      failed_sha=""
      subject="$(git -C "$CHECKOUT" log -1 --format=%s "$sha" 2>/dev/null)"
      log "Deployed ${sha:0:7} to $HOST: $subject"
      notify "Ultra Card on .55" "${sha:0:7} is live. Refresh the dashboard."
    else
      failed_sha="$sha"
      log "Deploy of ${sha:0:7} failed; waiting for the next push"
      notify "Ultra Card .55 deploy failed" "${sha:0:7}: see the watcher's Terminal tab"
    fi
  fi
  sleep "$INTERVAL"
done
