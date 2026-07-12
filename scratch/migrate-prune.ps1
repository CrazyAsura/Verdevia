# PowerShell Script to copy full monolith src and prune business logic folders in extracted apps

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$LEGACY_BACKEND = Join-Path $ROOT "VERDEVIA-BACKEND"

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

Write-Host "Recopying full src to each service and performing smart pruning..." -ForegroundColor Cyan

# Apps to update
$backends = @("VERDEVIA-MOBILE-BACKEND", "VERDEVIA-WEB-BACKEND", "VERDEVIA-CHATBOT-BACKEND", "VERDEVIA-ADMIN-BACKEND")

foreach ($app in $backends) {
  $targetSrc = Join-Path $ROOT "$app/src"
  if (Test-Path $targetSrc) {
    Remove-Item -Path "$targetSrc/*" -Recurse -Force | Out-Null
  }
  Ensure-Dir $targetSrc
  Copy-Item -Path (Join-Path $LEGACY_BACKEND "src/*") -Destination $targetSrc -Recurse -Force
}

# --- PRUNING FOR VERDEVIA-MOBILE-BACKEND ---
Write-Host "Pruning VERDEVIA-MOBILE-BACKEND..." -ForegroundColor Yellow
$mobileModules = Join-Path $ROOT "VERDEVIA-MOBILE-BACKEND/src/modules"
Remove-Item -Path (Join-Path $mobileModules "forum") -Recurse -Force
Remove-Item -Path (Join-Path $mobileModules "courses") -Recurse -Force
Remove-Item -Path (Join-Path $mobileModules "stats") -Recurse -Force

# --- PRUNING FOR VERDEVIA-WEB-BACKEND ---
Write-Host "Pruning VERDEVIA-WEB-BACKEND..." -ForegroundColor Yellow
$webModules = Join-Path $ROOT "VERDEVIA-WEB-BACKEND/src/modules"
# complaints: keep only entities and enums
Get-ChildItem -Path (Join-Path $webModules "complaints") | Where-Object { $_.Name -ne "entities" -and $_.Name -ne "enums" } | Remove-Item -Recurse -Force
# gamification: keep only entities and enums
Get-ChildItem -Path (Join-Path $webModules "gamification") | Where-Object { $_.Name -ne "entities" -and $_.Name -ne "enums" } | Remove-Item -Recurse -Force
# Delete messaging entirely
Remove-Item -Path (Join-Path $webModules "messaging") -Recurse -Force
# Delete stats entirely
Remove-Item -Path (Join-Path $webModules "stats") -Recurse -Force

# --- PRUNING FOR VERDEVIA-CHATBOT-BACKEND ---
Write-Host "Pruning VERDEVIA-CHATBOT-BACKEND..." -ForegroundColor Yellow
$chatbotModules = Join-Path $ROOT "VERDEVIA-CHATBOT-BACKEND/src/modules"
$chatbotKeepList = @("ai", "redis", "health")

Get-ChildItem -Path $chatbotModules | ForEach-Object {
  $moduleName = $_.Name
  if ($chatbotKeepList -notcontains $moduleName) {
    # Keep only entities and enums
    $modPath = $_.FullName
    Get-ChildItem -Path $modPath | Where-Object { $_.Name -ne "entities" -and $_.Name -ne "enums" } | Remove-Item -Recurse -Force
  }
}
# Delete messaging entirely since it doesn't have entities
Remove-Item -Path (Join-Path $chatbotModules "messaging") -Recurse -Force

# --- PRUNING FOR VERDEVIA-ADMIN-BACKEND ---
Write-Host "Pruning VERDEVIA-ADMIN-BACKEND..." -ForegroundColor Yellow
$adminModules = Join-Path $ROOT "VERDEVIA-ADMIN-BACKEND/src/modules"
$adminKeepList = @("stats", "compliance", "redis", "health")

Get-ChildItem -Path $adminModules | ForEach-Object {
  $moduleName = $_.Name
  if ($adminKeepList -notcontains $moduleName) {
    # Keep only entities and enums
    $modPath = $_.FullName
    Get-ChildItem -Path $modPath | Where-Object { $_.Name -ne "entities" -and $_.Name -ne "enums" } | Remove-Item -Recurse -Force
  }
}
# Delete messaging entirely since it doesn't have entities
Remove-Item -Path (Join-Path $adminModules "messaging") -Recurse -Force

Write-Host "Smart pruning completed successfully!" -ForegroundColor Green
