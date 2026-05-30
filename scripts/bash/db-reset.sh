#!/usr/bin/env bash
set -euo pipefail

echo "[db:reset] Resetting local database..."

COMPOSE_PROJECT="ero"

docker compose -p "$COMPOSE_PROJECT" -f infra/docker-compose.yml down -v --remove-orphans

bash scripts/bash/dev-up.sh
bash scripts/bash/db-migrate.sh
bash scripts/bash/db-seed.sh
bash scripts/bash/create-topics.sh

echo "[db:reset] Local environment is ready"
