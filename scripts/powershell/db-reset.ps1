$ErrorActionPreference = "Stop"
$composeProject = "ero"

Write-Host "[db:reset] Resetting local database..."

docker compose -p $composeProject -f infra/docker-compose.yml down -v --remove-orphans

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

powershell -ExecutionPolicy Bypass -File ./scripts/powershell/dev-up.ps1
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

powershell -ExecutionPolicy Bypass -File ./scripts/powershell/db-migrate.ps1
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

powershell -ExecutionPolicy Bypass -File ./scripts/powershell/db-seed.ps1
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

powershell -ExecutionPolicy Bypass -File ./scripts/powershell/create-topics.ps1
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "[db:reset] Local environment is ready"
