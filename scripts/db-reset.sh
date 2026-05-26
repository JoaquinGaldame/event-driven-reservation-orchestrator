#!/usr/bin/env bash
set -euo pipefail

echo "[db:reset] Resetting local database..."

docker compose -f infra/docker-compose.yml down -v --remove-orphans

bash scripts/dev-up.sh
bash scripts/db-migrate.sh
bash scripts/db-seed.sh
bash scripts/create-topics.sh

echo "[db:reset] Local environment is ready"