# PowerShell script to replace next build with next build --webpack in package.json files

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"

$apps = @(
  'VERDEVIA-WEB-MAIN',
  'VERDEVIA-WEB-ADMIN',
  'VERDEVIA-WEB-CHATBOT'
)

foreach ($app in $apps) {
  $path = Join-Path $ROOT "$app\package.json"
  if (Test-Path $path) {
    Write-Host "Configuring webpack build in $app/package.json..."
    $content = Get-Content -Path $path -Raw
    # Replace next build with next build --webpack
    $content = $content -replace 'next build', 'next build --webpack'
    Set-Content -Path $path -Value $content -Force
  }
}

Write-Host "Webpack build script configured in package.json files!" -ForegroundColor Green
