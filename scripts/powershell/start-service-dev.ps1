param(
  [Parameter(Mandatory = $true)]
  [string]$Name,

  [Parameter(Mandatory = $true)]
  [string]$Purpose,

  [Parameter(Mandatory = $true)]
  [string]$Command,

  [string]$Color = "Cyan",

  [string]$RepoRoot = "."
)

$ErrorActionPreference = "Stop"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

function Write-BannerLine {
  param(
    [string]$Text,
    [string]$Foreground = "Gray"
  )

  Write-Host $Text -ForegroundColor $Foreground
}

function Get-BannerPath {
  param([string]$ServiceName)

  return Join-Path $PSScriptRoot "..\assets\banners\$ServiceName.txt"
}

function Get-ServiceBanner {
  param([string]$ServiceName)

  $bannerPath = Get-BannerPath -ServiceName $ServiceName

  if (-not (Test-Path $bannerPath)) {
    return @("  $($ServiceName.ToUpperInvariant())")
  }

  return Get-Content -Path $bannerPath -Encoding UTF8
}

Clear-Host
[Console]::Title = "ERO - $Name"
Set-Location $RepoRoot

$accentColor = $Color
$divider = "=" * 72
$subDivider = "-" * 72
$startedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-BannerLine $divider $accentColor
foreach ($line in (Get-ServiceBanner -ServiceName $Name)) {
  Write-BannerLine $line $accentColor
}
Write-BannerLine $divider $accentColor
Write-BannerLine (" Purpose : {0}" -f $Purpose) White
Write-BannerLine (" Command : {0}" -f $Command) DarkGray
Write-BannerLine (" Status  : bootstrapping") Yellow
Write-BannerLine (" Started : {0}" -f $startedAt) DarkGray
Write-BannerLine $subDivider DarkGray
Write-BannerLine " Ready to listen. Streaming live logs below." Green
Write-BannerLine ""

Invoke-Expression $Command
