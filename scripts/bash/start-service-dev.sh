#!/usr/bin/env bash
set -euo pipefail

NAME="${1:?service name is required}"
PURPOSE="${2:?service purpose is required}"
COMMAND="${3:?service command is required}"
COLOR="${4:-36}"
REPO_ROOT="${5:-.}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_banner() {
  local banner_path="$SCRIPT_DIR/../assets/banners/$NAME.txt"

  if [[ -f "$banner_path" ]]; then
    cat "$banner_path"
    return
  fi

  printf '  %s\n' "${NAME^^}"
}

clear
printf '\033[%sm' "$COLOR"
printf '%0.s=' {1..72}
printf '\n'
print_banner
printf '%0.s=' {1..72}
printf '\033[0m\n'
printf ' Purpose : %s\n' "$PURPOSE"
printf ' Command : %s\n' "$COMMAND"
printf ' Status  : bootstrapping\n'
printf ' Started : %s\n' "$(date '+%Y-%m-%d %H:%M:%S')"
printf '%0.s-' {1..72}
printf '\n'
printf ' Ready to listen. Streaming live logs below.\n\n'

cd "$REPO_ROOT"
exec bash -lc "$COMMAND"
