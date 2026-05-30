$ErrorActionPreference = "Stop"

Write-Host "[db:generate] Generating Drizzle migrations..."

pnpm --filter @reservation/database db:generate

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "[db:generate] Done"
