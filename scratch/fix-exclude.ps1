# PowerShell script to update tsconfig.json exclude patterns to ignore root-level node_modules

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"

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
  $path = Join-Path $ROOT "$app\tsconfig.json"
  if (Test-Path $path) {
    Write-Host "Updating excludes in tsconfig.json in $app..."
    $content = Get-Content -Path $path -Raw
    # Add "../node_modules" to the exclude array if not present
    $content = $content -replace '"exclude":\s*\[\s*"node_modules"', '"exclude": ["node_modules", "../node_modules"'
    Set-Content -Path $path -Value $content -Force
  }
}

Write-Host "Exclude patterns updated successfully!" -ForegroundColor Green
