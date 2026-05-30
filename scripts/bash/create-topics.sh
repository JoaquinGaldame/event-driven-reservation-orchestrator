#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="infra/docker-compose.yml"
COMPOSE_PROJECT="ero"
REDPANDA_SERVICE="redpanda"

TOPICS=(
  "ReservationRequested"
  "InventoryLockRequested"
  "InventoryLocked"
  "InventoryRejected"
)

echo "Checking Docker..."
docker info > /dev/null

echo "Checking compose file..."
test -f "$COMPOSE_FILE"

echo "Checking Redpanda container..."
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" ps "$REDPANDA_SERVICE"

echo "Waiting for Redpanda..."
until docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T "$REDPANDA_SERVICE" rpk cluster info > /dev/null 2>&1; do
  sleep 2
done

echo "Creating topics..."

for topic in "${TOPICS[@]}"; do
  docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T "$REDPANDA_SERVICE" \
    rpk topic create "$topic" \
    --partitions 1 \
    --replicas 1 \
    || true
done

echo "Existing topics:"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T "$REDPANDA_SERVICE" rpk topic list

echo "Topics ready."
