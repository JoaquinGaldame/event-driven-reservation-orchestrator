#!/usr/bin/env bash
set -euo pipefail

echo "[db:seed] Seeding database..."

if [ ! -f ".env" ]; then
  echo "[db:seed] ERROR: .env file not found"
  exit 1
fi

set -a
source .env
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[db:seed] ERROR: DATABASE_URL is not defined"
  exit 1
fi

pnpm --filter @reservation/database db:seed

echo "[db:seed] Done"