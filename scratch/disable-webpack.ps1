# PowerShell script to disable Webpack bundling and use NestJS's standard tsc compiler

$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"

$apps = @(
  'VERDEVIA-MOBILE-BACKEND',
  'VERDEVIA-WEB-BACKEND',
  'VERDEVIA-CHATBOT-BACKEND',
  'VERDEVIA-ADMIN-BACKEND',
  'VERDEVIA-MOBILE-GATEWAY',
  'VERDEVIA-WEB-GATEWAY'
)

foreach ($app in $apps) {
  $path = Join-Path $ROOT "$app\nest-cli.json"
  if (Test-Path $path) {
    Write-Host "Disabling Webpack in $app/nest-cli.json..."
    $content = Get-Content -Path $path -Raw
    # Replace webpack: true with webpack: false
    $content = $content -replace '"webpack":\s*true', '"webpack": false'
    Set-Content -Path $path -Value $content -Force
  }
}

Write-Host "Webpack disabled in all nest-cli.json files!" -ForegroundColor Green
