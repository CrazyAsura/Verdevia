# =========================================================================
# ECOÁ - SSL/TLS Self-Signed Certificate Generator
# =========================================================================
# This script locates OpenSSL on Windows and generates a custom TLS
# certificate for 'ecoa', 'ecoa.local', and 'localhost'.
# =========================================================================

$ErrorActionPreference = "Stop"

# Define Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
$CertDir = Join-Path $ProjectRoot "VERDEVIA-WEB\nginx\certs"
$KeyFile = Join-Path $CertDir "ecoa.key"
$CertFile = Join-Path $CertDir "ecoa.crt"

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "   VERDEVIA - SSL/TLS Certificate Generator   " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

# 1. Ensure target directory exists
if (-not (Test-Path $CertDir)) {
    Write-Host "Creating certificates directory: $CertDir..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $CertDir | Out-Null
}

# 2. Locate OpenSSL
$openssl = "openssl"
$opensslPaths = @(
    "C:\Program Files\Git\usr\bin\openssl.exe",
    "C:\Program Files (x86)\Git\usr\bin\openssl.exe",
    "C:\tools\openssl\openssl.exe"
)

# Check if openssl is in PATH first
$inPath = Get-Command "openssl" -ErrorAction SilentlyContinue
if ($inPath) {
    $openssl = $inPath.Source
    Write-Host "Found OpenSSL in PATH: $openssl" -ForegroundColor Green
} else {
    # Check common installation directories
    $found = $false
    foreach ($path in $opensslPaths) {
        if (Test-Path $path) {
            $openssl = $path
            $found = $true
            Write-Host "Found Git OpenSSL: $openssl" -ForegroundColor Green
            break
        }
    }
    
    if (-not $found) {
        Write-Host "ERROR: OpenSSL was not found in PATH or standard Git directories." -ForegroundColor Red
        Write-Host "Please install Git for Windows or OpenSSL, or add it to your PATH." -ForegroundColor Yellow
        exit 1
    }
}

# 3. Generate the self-signed certificate using OpenSSL
Write-Host "Generating certificate and key..." -ForegroundColor Gray

& $openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout "$KeyFile" `
  -out "$CertFile" `
  -subj "/CN=ecoa/O=ECOA/OU=Development/C=BR" `
  -addext "subjectAltName=DNS:ecoa,DNS:ecoa.local,DNS:localhost,IP:127.0.0.1"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Generated TLS certificate files:" -ForegroundColor Green
    Write-Host "  Key:  $KeyFile" -ForegroundColor Cyan
    Write-Host "  Cert: $CertFile" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: OpenSSL failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host "To trust this certificate locally, run:" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\trust-cert.ps1" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Magenta
