$ROOT = "c:\Users\Matheus\Documents\Leon\mobile\projeto-2\Verdevia"
$LEGACY_BACKEND = Join-Path $ROOT "VERDEVIA-BACKEND"

$apps = @(
  @{ name = "VERDEVIA-MOBILE-BACKEND"; port = 3334 },
  @{ name = "VERDEVIA-WEB-BACKEND"; port = 3336 },
  @{ name = "VERDEVIA-CHATBOT-BACKEND"; port = 3337 },
  @{ name = "VERDEVIA-ADMIN-BACKEND"; port = 3338 },
  @{ name = "VERDEVIA-MOBILE-GATEWAY"; port = 3333 },
  @{ name = "VERDEVIA-WEB-GATEWAY"; port = 3335 }
)

Write-Host "Copying and adapting Docker files for each service..." -ForegroundColor Cyan

foreach ($app in $apps) {
  $dest = Join-Path $ROOT $app.name
  
  # Copy entrypoint
  Copy-Item -Path (Join-Path $ROOT "scratch/docker-entrypoint.sh") -Destination (Join-Path $dest "docker-entrypoint.sh") -Force
  
  # Read and adapt Dockerfile
  $dockerfileContent = Get-Content -Path (Join-Path $LEGACY_BACKEND "Dockerfile") -Raw
  # Replace EXPOSE 3333 with the correct port
  $dockerfileContent = $dockerfileContent -replace "EXPOSE 3333", "EXPOSE $($app.port)"
  Set-Content -Path (Join-Path $dest "Dockerfile") -Value $dockerfileContent -Force
  
  # Read and adapt Dockerfile.dev
  $dockerfileDevContent = Get-Content -Path (Join-Path $LEGACY_BACKEND "Dockerfile.dev") -Raw
  # Replace EXPOSE 3333 with the correct port
  $dockerfileDevContent = $dockerfileDevContent -replace "EXPOSE 3333", "EXPOSE $($app.port)"
  Set-Content -Path (Join-Path $dest "Dockerfile.dev") -Value $dockerfileDevContent -Force
  
  Write-Host "Docker files configured for $($app.name) on port $($app.port)." -ForegroundColor Gray
}

Write-Host "Docker files copy completed successfully!" -ForegroundColor Green
