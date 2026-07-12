$apps = @(
  'VERDEVIA-COMMON',
  'VERDEVIA-MOBILE-BACKEND',
  'VERDEVIA-WEB-BACKEND',
  'VERDEVIA-CHATBOT-BACKEND',
  'VERDEVIA-ADMIN-BACKEND',
  'VERDEVIA-MOBILE-GATEWAY',
  'VERDEVIA-WEB-GATEWAY'
)

$targetSource = 'c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia\VERDEVIA-BACKEND\node_modules'

foreach ($app in $apps) {
  $dest = Join-Path 'c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia' $app
  $link = Join-Path $dest 'node_modules'
  if (-not (Test-Path $link)) {
    Write-Host "Creating junction link for $app..."
    New-Item -ItemType Junction -Path $link -Value $targetSource | Out-Null
  }
}

Write-Host "Junctions created successfully!"
