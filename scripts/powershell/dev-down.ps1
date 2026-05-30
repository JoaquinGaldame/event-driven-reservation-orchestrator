$ErrorActionPreference = "Stop"
$composeProject = "ero"

Write-Host "[dev:down] Stopping local infrastructure..."

docker compose -p $composeProject -f infra/docker-compose.yml down --remove-orphans

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "[dev:down] Infrastructure stopped"
