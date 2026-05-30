#!/usr/bin/env bash
set -euo pipefail

echo "[db:generate] Generating Drizzle migrations..."

pnpm --filter @reservation/database db:generate

echo "[db:generate] Done"
