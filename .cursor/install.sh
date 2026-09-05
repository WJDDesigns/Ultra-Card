#!/usr/bin/env bash
#
# Cloud Agent install script for Ultra Card.
# Idempotent: safe to run repeatedly against cached state.
set -euo pipefail

# package.json pins "engines.node": ">=24.15.0" and CI runs on Node 24
# (jsdom 30 used by the test suite requires it). The base image ships an older
# Node, so install the required version with nvm and make it the login default.
NODE_VERSION="24.15.0"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install "$NODE_VERSION"
nvm alias default "$NODE_VERSION"
nvm use "$NODE_VERSION"

echo "Using Node $(node --version) / npm $(npm --version)"

# Reproducible install from the committed lockfile.
npm ci
