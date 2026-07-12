# PowerShell script to update tsconfig.json files with explicit typeRoots to resolve IDE caching issues

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
    Write-Host "Updating tsconfig.json in $app..."
    $config = Get-Content -Path $path -Raw | ConvertFrom-Json
    
    # Add or update typeRoots
    if (-not $config.compilerOptions) {
      $config | Add-Member -MemberType NoteProperty -Name "compilerOptions" -Value @{}
    }
    
    # Set typeRoots to local node_modules/@types
    if ($config.compilerOptions.typeRoots) {
      $config.compilerOptions.typeRoots = @("./node_modules/@types")
    } else {
      $config.compilerOptions | Add-Member -MemberType NoteProperty -Name "typeRoots" -Value @("./node_modules/@types")
    }
    
    # Convert back to JSON and write
    $json = $config | ConvertTo-Json -Depth 10
    Set-Content -Path $path -Value $json -Force
  }
}

Write-Host "All tsconfig.json files updated with explicit typeRoots!" -ForegroundColor Green
