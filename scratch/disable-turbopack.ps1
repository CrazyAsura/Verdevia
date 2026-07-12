# PowerShell script to replace next build --turbopack with next build in package.json files

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"

$apps = @(
  'VERDEVIA-WEB-MAIN',
  'VERDEVIA-WEB-ADMIN',
  'VERDEVIA-WEB-CHATBOT'
)

foreach ($app in $apps) {
  $path = Join-Path $ROOT "$app\package.json"
  if (Test-Path $path) {
    Write-Host "Disabling Turbopack in $app/package.json..."
    $content = Get-Content -Path $path -Raw
    # Replace next build --turbopack with next build
    $content = $content -replace 'next build --turbopack', 'next build'
    Set-Content -Path $path -Value $content -Force
  }
}

Write-Host "Turbopack disabled in package.json files!" -ForegroundColor Green
