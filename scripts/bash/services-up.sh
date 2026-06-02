#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAUNCHER_SCRIPT="$REPO_ROOT/scripts/bash/start-service-dev.sh"
TMUX_SESSION="ero-dev"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[services:up] ERROR: pnpm is not installed or not available in PATH"
  exit 1
fi

services=(
  "gateway-api|HTTP entrypoint for reservation intake and authenticated access|pnpm --filter @reservation/gateway-api dev|36"
  "reservation-service|Reservation saga orchestration and payment request emission|pnpm --filter @reservation/reservation-service dev|33"
  "inventory-service|Availability lock decisions and inventory overlap control|pnpm --filter @reservation/inventory-service dev|32"
  "payment-service|Payment execution, attempts traceability and result publishing|pnpm --filter @reservation/payment-service dev|35"
)

build_launcher_command() {
  local name="$1"
  local purpose="$2"
  local command="$3"
  local color="$4"

  printf 'bash "%s" %q %q %q %q %q' \
    "$LAUNCHER_SCRIPT" \
    "$name" \
    "$purpose" \
    "$command" \
    "$color" \
    "$REPO_ROOT"
}

start_with_tmux() {
  if ! command -v tmux >/dev/null 2>&1; then
    return 1
  fi

  if tmux has-session -t "$TMUX_SESSION" 2>/dev/null; then
    echo "[services:up] tmux session '$TMUX_SESSION' already exists. Attaching to it."
    tmux attach-session -t "$TMUX_SESSION"
    return 0
  fi

  IFS="|" read -r n1 p1 c1 color1 <<<"${services[0]}"
  IFS="|" read -r n2 p2 c2 color2 <<<"${services[1]}"
  IFS="|" read -r n3 p3 c3 color3 <<<"${services[2]}"
  IFS="|" read -r n4 p4 c4 color4 <<<"${services[3]}"

  tmux new-session -d -s "$TMUX_SESSION" -c "$REPO_ROOT"
  tmux send-keys -t "$TMUX_SESSION:0.0" "$(build_launcher_command "$n1" "$p1" "$c1" "$color1")" C-m
  tmux split-window -h -t "$TMUX_SESSION:0.0" -c "$REPO_ROOT"
  tmux send-keys -t "$TMUX_SESSION:0.1" "$(build_launcher_command "$n2" "$p2" "$c2" "$color2")" C-m
  tmux select-pane -t "$TMUX_SESSION:0.0"
  tmux split-window -v -t "$TMUX_SESSION:0.0" -c "$REPO_ROOT"
  tmux send-keys -t "$TMUX_SESSION:0.2" "$(build_launcher_command "$n3" "$p3" "$c3" "$color3")" C-m
  tmux select-pane -t "$TMUX_SESSION:0.1"
  tmux split-window -v -t "$TMUX_SESSION:0.1" -c "$REPO_ROOT"
  tmux send-keys -t "$TMUX_SESSION:0.3" "$(build_launcher_command "$n4" "$p4" "$c4" "$color4")" C-m
  tmux select-layout -t "$TMUX_SESSION:0" tiled
  tmux select-pane -t "$TMUX_SESSION:0.0"
  tmux attach-session -t "$TMUX_SESSION"
  return 0
}

open_terminal() {
  local title="$1"
  local launch_command="$2"

  if command -v x-terminal-emulator >/dev/null 2>&1; then
    x-terminal-emulator -T "$title" -e bash -lc "$launch_command; exec bash"
    return
  fi

  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title="$title" -- bash -lc "$launch_command; exec bash"
    return
  fi

  if command -v konsole >/dev/null 2>&1; then
    konsole --new-tab -p tabtitle="$title" -e bash -lc "$launch_command; exec bash"
    return
  fi

  if command -v xfce4-terminal >/dev/null 2>&1; then
    xfce4-terminal --title="$title" --command="bash -lc '$launch_command; exec bash'"
    return
  fi

  if command -v xterm >/dev/null 2>&1; then
    xterm -T "$title" -e bash -lc "$launch_command; exec bash" &
    return
  fi

  echo "[services:up] ERROR: no supported terminal emulator found"
  echo "[services:up] Tried: tmux, x-terminal-emulator, gnome-terminal, konsole, xfce4-terminal, xterm"
  exit 1
}

start_with_terminals() {
  echo "[services:up] tmux not available. Falling back to separate terminals."

  for service in "${services[@]}"; do
    IFS="|" read -r name purpose command color <<<"$service"
    launch_command="$(build_launcher_command "$name" "$purpose" "$command" "$color")"
    open_terminal "ERO - $name" "$launch_command"
  done
}

echo "[services:up] Bootstrapping visual service launcher from $REPO_ROOT"

if start_with_tmux; then
  exit 0
fi

start_with_terminals
echo "[services:up] Service terminals opened"
