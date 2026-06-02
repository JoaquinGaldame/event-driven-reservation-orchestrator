$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$launcherScript = (Resolve-Path (Join-Path $PSScriptRoot "start-service-dev.ps1")).Path

$services = @(
  @{
    Name = "gateway-api"
    Purpose = "HTTP entrypoint for reservation intake and authenticated access"
    Command = "pnpm --filter @reservation/gateway-api dev"
    Color = "Cyan"
  },
  @{
    Name = "reservation-service"
    Purpose = "Reservation saga orchestration and payment request emission"
    Command = "pnpm --filter @reservation/reservation-service dev"
    Color = "Yellow"
  },
  @{
    Name = "inventory-service"
    Purpose = "Availability lock decisions and inventory overlap control"
    Command = "pnpm --filter @reservation/inventory-service dev"
    Color = "Green"
  },
  @{
    Name = "payment-service"
    Purpose = "Payment execution, attempts traceability and result publishing"
    Command = "pnpm --filter @reservation/payment-service dev"
    Color = "Magenta"
  }
)

function Assert-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

function New-ServiceArgumentList {
  param(
    [hashtable]$Service,
    [string]$RootPath,
    [string]$ScriptPath
  )

  return @(
    "powershell.exe",
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", "`"$ScriptPath`"",
    "-Name", "`"$($Service.Name)`"",
    "-Purpose", "`"$($Service.Purpose)`"",
    "-Command", "`"$($Service.Command)`"",
    "-Color", "`"$($Service.Color)`"",
    "-RepoRoot", "`"$RootPath`""
  )
}

function Start-WithWindowsTerminal {
  param(
    [array]$ServiceDefinitions,
    [string]$RootPath,
    [string]$ScriptPath
  )

  $wtCommand = Get-Command wt.exe -ErrorAction SilentlyContinue
  if (-not $wtCommand) {
    return $false
  }

  if ($ServiceDefinitions.Count -lt 4) {
    return $false
  }

  $serviceOne = New-ServiceArgumentList -Service $ServiceDefinitions[0] -RootPath $RootPath -ScriptPath $ScriptPath
  $serviceTwo = New-ServiceArgumentList -Service $ServiceDefinitions[1] -RootPath $RootPath -ScriptPath $ScriptPath
  $serviceThree = New-ServiceArgumentList -Service $ServiceDefinitions[2] -RootPath $RootPath -ScriptPath $ScriptPath
  $serviceFour = New-ServiceArgumentList -Service $ServiceDefinitions[3] -RootPath $RootPath -ScriptPath $ScriptPath

  $args = @(
    "new-tab", "-d", "`"$RootPath`""
  ) + $serviceOne + @(
    ";",
    "split-pane", "-H", "-d", "`"$RootPath`""
  ) + $serviceTwo + @(
    ";",
    "move-focus", "left",
    ";",
    "split-pane", "-V", "-d", "`"$RootPath`""
  ) + $serviceThree + @(
    ";",
    "move-focus", "right",
    ";",
    "split-pane", "-V", "-d", "`"$RootPath`""
  ) + $serviceFour

  Start-Process -FilePath $wtCommand.Source -ArgumentList $args -WorkingDirectory $RootPath
  return $true
}

function Start-WithSeparateWindows {
  param(
    [array]$ServiceDefinitions,
    [string]$RootPath,
    [string]$ScriptPath
  )

  foreach ($service in $ServiceDefinitions) {
    $serviceArgs = New-ServiceArgumentList -Service $service -RootPath $RootPath -ScriptPath $ScriptPath

    Start-Process `
      -FilePath "powershell.exe" `
      -ArgumentList $serviceArgs[1..($serviceArgs.Length - 1)] `
      -WorkingDirectory $RootPath `
      -WindowStyle Normal
  }
}

Assert-Command -Name "pnpm"

Write-Host "[services:up] Bootstrapping visual service launcher from $repoRoot"

if (Start-WithWindowsTerminal -ServiceDefinitions $services -RootPath $repoRoot -ScriptPath $launcherScript) {
  Write-Host "[services:up] Windows Terminal detected. Opened services in split panes."
  exit 0
}

Write-Host "[services:up] Windows Terminal not found. Falling back to separate service windows."
Start-WithSeparateWindows -ServiceDefinitions $services -RootPath $repoRoot -ScriptPath $launcherScript
Write-Host "[services:up] Service windows opened."
