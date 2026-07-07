# =========================================================================
# ECOÁ - Local Hostname Mapper
# =========================================================================
# This script adds 'ecoa' and 'ecoa.local' to the Windows hosts file.
# Requires Administrator privileges.
# =========================================================================

$ErrorActionPreference = "Stop"

# Check for Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "  ERROR: This script requires Administrator rights!  " -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "Relaunching script with Administrator privileges..." -ForegroundColor Yellow
    
    $arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -Verb RunAs
    exit
}

$HostsPath = "C:\Windows\System32\drivers\etc\hosts"
$Entries = @(
    "127.0.0.1 ecoa",
    "127.0.0.1 ecoa.local"
)

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "         VERDEVIA - Local Hostname Mapper     " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

# Check if hosts file exists
if (-not (Test-Path $HostsPath)) {
    Write-Host "ERROR: Hosts file not found at $HostsPath" -ForegroundColor Red
    exit 1
}

$HostsContent = Get-Content $HostsPath

$changed = $false
foreach ($entry in $Entries) {
    # Check if the entry already exists in some form
    $cleanEntry = $entry.Trim()
    $hasEntry = $false
    
    foreach ($line in $HostsContent) {
        $cleanLine = $line.Trim()
        # Simple match check ignoring spacing differences
        if ($cleanLine -replace '\s+', ' ' -match ($cleanEntry -replace '\s+', ' ')) {
            $hasEntry = $true
            break
        }
    }
    
    if (-not $hasEntry) {
        Write-Host "Adding entry to hosts file: $entry" -ForegroundColor Green
        # Add a newline and the entry
        Add-Content -Path $HostsPath -Value "`n# VERDEVIA Local Platform Mapping"
        Add-Content -Path $HostsPath -Value $entry
        $changed = $true
    } else {
        Write-Host "Entry already exists: $entry" -ForegroundColor Gray
    }
}

if ($changed) {
    Write-Host "Success! Local hosts mapping updated." -ForegroundColor Green
} else {
    Write-Host "No changes needed. Local hostnames are already mapped." -ForegroundColor Green
}

Write-Host "==========================================" -ForegroundColor Magenta
Read-Host "Press Enter to exit..."
