$ErrorActionPreference = "Stop"
$composeProject = "ero"

Write-Host "[dev:up] Starting local infrastructure..."

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "[dev:up] ERROR: Docker is not installed"
  exit 1
}

if (-not (Test-Path "infra/docker-compose.yml")) {
  Write-Host "[dev:up] ERROR: infra/docker-compose.yml not found"
  exit 1
}

docker compose -p $composeProject -f infra/docker-compose.yml up -d

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "[dev:up] Infrastructure started"
