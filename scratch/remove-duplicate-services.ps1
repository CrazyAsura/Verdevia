$content = Get-Content docker-compose.yml -Raw

# Find the marker: 'kafka_data:' in volumes, then find second 'services:' after it
$lines = $content -split "`r?`n"
$inVolumes = $false
$kafkaDatalLine = -1
$secondServicesLine = -1
$firstServicesFound = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -eq "services:") {
    if (-not $firstServicesFound) {
      $firstServicesFound = $true
    } else {
      $secondServicesLine = $i
      Write-Host "Found second 'services:' block at line $($i + 1)"
      break
    }
  }
}

if ($secondServicesLine -ge 0) {
  # Trim to the line before the second services: block
  $cleanLines = $lines[0..($secondServicesLine - 1)]
  # Remove trailing empty lines
  while ($cleanLines[-1] -match '^\s*$') {
    $cleanLines = $cleanLines[0..($cleanLines.Count - 2)]
  }
  # Write clean content
  $cleanLines -join "`r`n" | Set-Content docker-compose.yml -Encoding UTF8 -NoNewline
  Write-Host "Removed duplicate services block successfully!" -ForegroundColor Green
} else {
  Write-Host "No duplicate services block found" -ForegroundColor Yellow
}
