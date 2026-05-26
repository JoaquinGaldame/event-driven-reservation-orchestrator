#!/usr/bin/env bash
set -euo pipefail

echo "[dev:down] Stopping local infrastructure..."

docker compose -f infra/docker-compose.yml down --remove-orphans

echo "[dev:down] Infrastructure stopped"