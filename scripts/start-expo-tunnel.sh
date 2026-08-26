#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${EXPO_PORT:-8081}"
LOG="/tmp/expo.log"
CF_LOG="/tmp/cloudflared.log"
CLOUDFLARED="${CLOUDFLARED:-/tmp/cloudflared}"

cd "$ROOT"

pkill -f "cloudflared tunnel --url http://localhost:${PORT}" 2>/dev/null || true
pkill -f "expo start --port ${PORT}" 2>/dev/null || true
sleep 1

: > "$CF_LOG"
nohup "$CLOUDFLARED" tunnel --url "http://localhost:${PORT}" >"$CF_LOG" 2>&1 &
sleep 6

TUNNEL_URL="$(grep -o 'https://[^ ]*trycloudflare.com' "$CF_LOG" | head -1)"
if [[ -z "$TUNNEL_URL" ]]; then
  echo "Cloudflare tunnel URL alınamadı. Log: $CF_LOG" >&2
  exit 1
fi

TUNNEL_HOST="${TUNNEL_URL#https://}"
export REACT_NATIVE_PACKAGER_HOSTNAME="$TUNNEL_HOST"
export EXPO_PACKAGER_PROXY_URL="$TUNNEL_URL"
export EXPO_NO_TELEMETRY=1
export EXPO_NO_TYPESCRIPT_SETUP=1
export EXPO_NO_DEPENDENCY_VALIDATION=1
unset CI

: > "$LOG"
nohup npx expo start --port "$PORT" --clear >>"$LOG" 2>&1 &
sleep 8

echo "Tunnel: $TUNNEL_URL"
echo "Expo Go URL: exp://${TUNNEL_HOST}"
echo "Log: $LOG"
