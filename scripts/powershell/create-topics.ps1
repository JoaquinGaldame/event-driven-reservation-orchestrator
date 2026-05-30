$ErrorActionPreference = "Stop"

$composeFile = "infra/docker-compose.yml"
$composeProject = "ero"
$redpandaService = "redpanda"
$topics = @(
  "ReservationRequested",
  "InventoryLockRequested",
  "InventoryLocked",
  "InventoryRejected"
)

Write-Host "Checking Docker..."
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "Checking compose file..."
if (-not (Test-Path $composeFile)) {
  Write-Host "ERROR: $composeFile not found"
  exit 1
}

Write-Host "Checking Redpanda container..."
docker compose -p $composeProject -f $composeFile ps $redpandaService
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "Waiting for Redpanda..."
while ($true) {
  docker compose -p $composeProject -f $composeFile exec -T $redpandaService rpk cluster info *> $null
  if ($LASTEXITCODE -eq 0) {
    break
  }
  Start-Sleep -Seconds 2
}

Write-Host "Creating topics..."
foreach ($topic in $topics) {
  docker compose -p $composeProject -f $composeFile exec -T $redpandaService rpk topic create $topic --partitions 1 --replicas 1 *> $null
}

Write-Host "Existing topics:"
docker compose -p $composeProject -f $composeFile exec -T $redpandaService rpk topic list
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "Topics ready."
