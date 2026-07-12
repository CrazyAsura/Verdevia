$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$apps = @('VERDEVIA-WEB-MAIN', 'VERDEVIA-WEB-ADMIN', 'VERDEVIA-WEB-CHATBOT')

foreach ($app in $apps) {
  $target = Join-Path $ROOT "$app\node_modules"
  if (Test-Path $target) {
    Write-Host "Removing $target..."
    Remove-Item -Path $target -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
  }
  Write-Host "Linking $target to VERDEVIA-WEB\node_modules..."
  cmd /c mklink /j $target (Join-Path $ROOT "VERDEVIA-WEB\node_modules") | Out-Null
}

Write-Host "Re-linked successfully!"
