#!/usr/bin/env bash
set -euo pipefail

echo "[dev:up] Starting local infrastructure..."

if ! command -v docker >/dev/null 2>&1; then
  echo "[dev:up] ERROR: Docker is not installed"
  exit 1
fi

if [ ! -f "infra/docker-compose.yml" ]; then
  echo "[dev:up] ERROR: infra/docker-compose.yml not found"
  exit 1
fi

docker compose -f infra/docker-compose.yml up -d

echo "[dev:up] Infrastructure started"