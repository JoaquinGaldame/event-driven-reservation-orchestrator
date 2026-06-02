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


function Get-ServiceAscii {
  param([string]$ServiceName)

  switch ($ServiceName) {
    "gateway-api" {
      return @(
        "",
        "   ____    _  _____ _______        ___    __   __        _    ____ ___",
        "  / ___|  / \|_   _| ____\ \      / / \   \ \ / /       / \  |  _ \_ _|",
        " | |  _  / _ \ | | |  _|  \ \ /\ / / _ \   \ V /       / _ \ | |_) | |",
        " | |_| |/ ___ \| | | |___  \ V  V / ___ \   | |       / ___ \|  __/| |",
        "  \____/_/   \_\_| |_____|  \_/\_/_/   \_\  |_|      /_/   \_\_|  |___|",
        ""
      )
    }

    "reservation-service" {
      return @(
        "",
        "  ____  _____ ____  _____ ______     ___  _____ ___ ___  _   _",
        " |  _ \| ____/ ___|| ____|  _ \ \   / / \|_   _|_ _/ _ \| \ | |",
        " | |_) |  _| \___ \|  _| | |_) \ \ / / _ \ | |  | | | | |  \| |",
        " |  _ <| |___ ___) | |___|  _ < \ V / ___ \| |  | | |_| | |\  |",
        " |_| \_\_____|____/|_____|_| \_\ \_/_/   \_\_| |___\___/|_| \_|",
        "",
        "                    SERVICE"
      )
    }

    "inventory-service" {
      return @(
        "",
        "  ___ _   ___     _______ _   _ _____ ___  ______   __",
        " |_ _| \ | \ \   / / ____| \ | |_   _/ _ \|  _ \ \ / /",
        "  | ||  \| |\ \ / /|  _| |  \| | | || | | | |_) \ V /",
        "  | || |\  | \ V / | |___| |\  | | || |_| |  _ < | |",
        " |___|_| \_|  \_/  |_____|_| \_| |_| \___/|_| \_\|_|",
        "",
        "                    SERVICE"
      )
    }

    "payment-service" {
      return @(
        "",
        "  ____   _ __   ____  __ _____ _   _ _____",
        " |  _ \ / \\ \ / /  \/  | ____| \ | |_   _|",
        " | |_) / _ \\ V /| |\/| |  _| |  \| | | |",
        " |  __/ ___ \| | | |  | | |___| |\  | | |",
        " |_| /_/   \_\_| |_|  |_|_____|_| \_| |_|",
        "",
        "                    SERVICE"
      )
    }

    default {
      return @("  $($ServiceName.ToUpperInvariant())")
    }
  }
}

Clear-Host
[Console]::Title = "ERO - $Name"
Set-Location $RepoRoot

$accentColor = $Color
$divider = "=" * 72
$subDivider = "-" * 72
$startedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-BannerLine $divider $accentColor
foreach ($line in (Get-ServiceAscii -ServiceName $Name)) {
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
