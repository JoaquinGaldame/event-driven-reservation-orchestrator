$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) {
  Write-Host "[db:seed] ERROR: .env file not found"
  exit 1
}

Get-Content ".env" | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') {
    return
  }

  $parts = $_ -split '=', 2
  if ($parts.Length -eq 2) {
    [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1])
  }
}

if (-not $env:DATABASE_URL) {
  Write-Host "[db:seed] ERROR: DATABASE_URL is not defined"
  exit 1
}

Write-Host "[db:seed] Seeding database..."

pnpm --filter @reservation/database db:seed

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "[db:seed] Done"
