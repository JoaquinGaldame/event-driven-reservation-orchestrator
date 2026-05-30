#!/usr/bin/env bash
set -euo pipefail

echo "[db:migrate] Running database migrations..."

if [ ! -f ".env" ]; then
  echo "[db:migrate] ERROR: .env file not found"
  exit 1
fi

set -a
source .env
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[db:migrate] ERROR: DATABASE_URL is not defined"
  exit 1
fi

pnpm --filter @reservation/database db:migrate

echo "[db:migrate] Done"
