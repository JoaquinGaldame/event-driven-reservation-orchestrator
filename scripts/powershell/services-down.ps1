$ErrorActionPreference = "Stop"

$servicePatterns = @(
  "@reservation/gateway-api dev",
  "@reservation/reservation-service dev",
  "@reservation/inventory-service dev",
  "@reservation/payment-service dev",
  "start-service-dev.ps1"
)

function Get-ProcessMap {
  $map = @{}
  foreach ($process in (Get-CimInstance Win32_Process)) {
    $map[[int]$process.ProcessId] = $process
  }
  return $map
}

function Add-Descendants {
  param(
    [int]$ProcessId,
    [hashtable]$ProcessMap,
    [System.Collections.Generic.HashSet[int]]$Accumulator
  )

  if (-not $Accumulator.Add($ProcessId)) {
    return
  }

  foreach ($candidate in $ProcessMap.Values) {
    if ([int]$candidate.ParentProcessId -eq $ProcessId) {
      Add-Descendants -ProcessId ([int]$candidate.ProcessId) -ProcessMap $ProcessMap -Accumulator $Accumulator
    }
  }
}

function Stop-ProcessesByPatterns {
  param([string[]]$Patterns)

  $processMap = Get-ProcessMap
  $targetIds = [System.Collections.Generic.HashSet[int]]::new()

  foreach ($process in $processMap.Values) {
    $commandLine = $process.CommandLine

    if ([string]::IsNullOrWhiteSpace($commandLine)) {
      continue
    }

    foreach ($pattern in $Patterns) {
      if ($commandLine -like "*$pattern*") {
        Add-Descendants -ProcessId ([int]$process.ProcessId) -ProcessMap $processMap -Accumulator $targetIds
        break
      }
    }
  }

  $orderedIds = @(foreach ($id in $targetIds) { $id }) | Sort-Object -Descending

  foreach ($processId in $orderedIds) {
    if ($processId -eq $PID) {
      continue
    }

    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Write-Host "[services:down] Stopped process $processId"
    } catch {
      # ignore already-exited processes
    }
  }

  return $orderedIds.Count
}

Write-Host "[services:down] Stopping application service processes..."
$stopped = Stop-ProcessesByPatterns -Patterns $servicePatterns

if ($stopped -eq 0) {
  Write-Host "[services:down] No matching service processes found"
  exit 0
}

Write-Host "[services:down] Stopped $stopped process(es)"
