$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$LEGACY_NODE_MODULES = Join-Path $ROOT "VERDEVIA-BACKEND\node_modules"
$NEW_NODE_MODULES = Join-Path $ROOT "node_modules"

Write-Host "Moving node_modules to workspace root..." -ForegroundColor Cyan
if (Test-Path $LEGACY_NODE_MODULES) {
  if (Test-Path $NEW_NODE_MODULES) {
    Remove-Item -Path $NEW_NODE_MODULES -Recurse -Force | Out-Null
  }
  Move-Item -Path $LEGACY_NODE_MODULES -Destination $NEW_NODE_MODULES -Force
}

$apps = @(
  'VERDEVIA-COMMON',
  'VERDEVIA-MOBILE-BACKEND',
  'VERDEVIA-WEB-BACKEND',
  'VERDEVIA-CHATBOT-BACKEND',
  'VERDEVIA-ADMIN-BACKEND',
  'VERDEVIA-MOBILE-GATEWAY',
  'VERDEVIA-WEB-GATEWAY'
)

foreach ($app in $apps) {
  $dest = Join-Path $ROOT $app
  $link = Join-Path $dest 'node_modules'
  if (Test-Path $link) {
    Write-Host "Removing old link for $app..."
    Remove-Item -Path $link -Force | Out-Null
  }
  Write-Host "Creating new root-level junction for $app..."
  New-Item -ItemType Junction -Path $link -Value $NEW_NODE_MODULES | Out-Null
}

Write-Host "Re-linking completed successfully!" -ForegroundColor Green
