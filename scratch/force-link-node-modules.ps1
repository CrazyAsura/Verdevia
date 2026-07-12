$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$apps = @('VERDEVIA-WEB-MAIN', 'VERDEVIA-WEB-ADMIN', 'VERDEVIA-WEB-CHATBOT')

foreach ($app in $apps) {
  $target = Join-Path $ROOT "$app\node_modules"
  Write-Host "Forcing removal of $target..."
  cmd /d /c rmdir /s /q $target 2>$null
  Write-Host "Creating junction link for $app..."
  cmd /d /c mklink /j $target (Join-Path $ROOT "VERDEVIA-WEB\node_modules")
}

Write-Host "Force re-linking completed!"
