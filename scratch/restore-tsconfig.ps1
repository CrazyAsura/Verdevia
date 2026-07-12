# PowerShell script to restore tsconfig.json files to their original format

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
    Write-Host "Restoring tsconfig.json in $app..."
    $config = Get-Content -Path $path -Raw | ConvertFrom-Json
    
    # Remove typeRoots
    if ($config.compilerOptions.typeRoots) {
      $config.compilerOptions.PSObject.Properties.Remove("typeRoots")
    }
    
    # Convert back to JSON and write
    $json = $config | ConvertTo-Json -Depth 10
    Set-Content -Path $path -Value $json -Force
  }
}

Write-Host "All tsconfig.json files restored successfully!" -ForegroundColor Green
