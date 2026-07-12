$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$SRC = Join-Path $ROOT "VERDEVIA-WEB-MAIN-LOCKED"
$DEST = Join-Path $ROOT "VERDEVIA-WEB-MAIN"

Write-Host "Copying files from $SRC to $DEST..."
Get-ChildItem -Path $SRC | Where-Object { $_.Name -ne "node_modules" } | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $DEST -Recurse -Force
}

Write-Host "Copy complete!"
