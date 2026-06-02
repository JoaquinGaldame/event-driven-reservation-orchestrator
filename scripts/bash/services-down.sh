#!/usr/bin/env bash
set -euo pipefail

TMUX_SESSION="ero-dev"

patterns=(
  "@reservation/gateway-api dev"
  "@reservation/reservation-service dev"
  "@reservation/inventory-service dev"
  "@reservation/payment-service dev"
  "start-service-dev.sh"
)

echo "[services:down] Stopping application service processes..."

if command -v tmux >/dev/null 2>&1; then
  if tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    tmux kill-session -t "$TMUX_SESSION"
    echo "[services:down] Killed tmux session '$TMUX_SESSION'"
  fi
fi

stopped_any=0

for pattern in "${patterns[@]}"; do
  if pgrep -f "$pattern" >/dev/null 2>&1; then
    pkill -f "$pattern" || true
    echo "[services:down] Stopped processes matching: $pattern"
    stopped_any=1
  fi
done

if [[ "$stopped_any" -eq 0 ]]; then
  echo "[services:down] No matching service processes found"
  exit 0
fi

echo "[services:down] Application services stopped"
