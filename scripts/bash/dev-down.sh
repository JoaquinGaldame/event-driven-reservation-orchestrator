#!/usr/bin/env bash
set -euo pipefail

echo "[dev:down] Stopping local infrastructure..."

COMPOSE_PROJECT="ero"

docker compose -p "$COMPOSE_PROJECT" -f infra/docker-compose.yml down --remove-orphans

echo "[dev:down] Infrastructure stopped"
