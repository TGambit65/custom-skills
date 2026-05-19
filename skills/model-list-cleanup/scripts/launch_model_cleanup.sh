#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-8787}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${MODEL_CLEANUP_APP_DIR:-$SKILL_DIR/assets/model-cleanup-app}"
STATE_DIR="${MODEL_CLEANUP_STATE_DIR:-/home/thoder/.echoagent/workspace/model-cleanup}"
CONFIG="${OPENCLAW_CONFIG:-/home/thoder/.openclaw/openclaw.json}"
STATE="${MODEL_CLEANUP_STATE:-$STATE_DIR/review-state.json}"
mkdir -p "$STATE_DIR"
cd "$STATE_DIR"
OPENCLAW_CONFIG="$CONFIG" MODEL_CLEANUP_APP_DIR="$APP_DIR" MODEL_CLEANUP_STATE="$STATE" PORT="$PORT" node "$APP_DIR/server.js"
