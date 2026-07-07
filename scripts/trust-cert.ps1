# =========================================================================
# ECOÁ - Trust Local SSL/TLS Certificate
# =========================================================================
# This script imports the self-signed certificate into the Windows
# Trusted Root Certification Authorities store.
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

# Define Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
$CertFile = Join-Path $ProjectRoot "VERDEVIA-WEB\nginx\certs\ecoa.crt"

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   VERDEVIA - Trust TLS Certificate Locally   " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

if (-not (Test-Path $CertFile)) {
    Write-Host "ERROR: Certificate file not found at $CertFile" -ForegroundColor Red
    Write-Host "Please generate the certificate first by running generate-certs.ps1." -ForegroundColor Yellow
    exit 1
}

Write-Host "Importing certificate into Trusted Root Store..." -ForegroundColor Gray

# Import using certutil or Import-Certificate cmdlet
Import-Certificate -FilePath "$CertFile" -CertStoreLocation Cert:\LocalMachine\Root

Write-Host "Success! The certificate has been trusted locally." -ForegroundColor Green
Write-Host "You may need to restart your browser (Chrome/Edge/Firefox) for changes to take effect." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Magenta
Read-Host "Press Enter to exit..."
