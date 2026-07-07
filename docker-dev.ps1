# VERDEVIA - Docker Desktop optimized watch launcher
# Uso:
#   .\docker-dev.ps1          # sobe sem build e sincroniza backend/frontend com Watch
#   .\docker-dev.ps1 -NoWatch # sobe sem sincronizar alteracoes de codigo
#   .\docker-dev.ps1 --build  # reconstrui imagens dev quando mudar package*.json
#   .\docker-dev.ps1 --full   # inclui servicos pesados da stack completa

param(
  [switch]$NoWatch,
  [switch]$Build,
  [switch]$Full
)

if ($args -contains "--build") {
  $Build = $true
}

if ($args -contains "--no-watch") {
  $NoWatch = $true
}

if ($args -contains "--full") {
  $Full = $true
}

$Watch = -not $NoWatch

$ROOT = $PSScriptRoot
$composeArgs = @(
  "compose",
  "--env-file", (Join-Path $ROOT "VERDEVIA-BACKEND\.env"),
  "--env-file", (Join-Path $ROOT "VERDEVIA-WEB\.env"),
  "-f", (Join-Path $ROOT "docker-compose.yml"),
  "-f", (Join-Path $ROOT "docker-compose.dev.yml")
)

if ($Build) {
  docker @composeArgs build backend frontend
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$lightServices = @("postgres", "redis", "backend", "frontend")
$heavyServices = @("mongodb", "kafka", "nginx", "tunnel", "spark-processor")
$services = $lightServices

if ($Full) {
  $env:KAFKA_ENABLED = "true"
  $env:KAFKA_CONSUMER_ENABLED = "true"
  $env:MONGODB_ENABLED = "true"
  $services = @("postgres", "mongodb", "redis", "kafka", "backend", "frontend", "nginx", "tunnel")
} else {
  $env:KAFKA_ENABLED = "false"
  $env:KAFKA_CONSUMER_ENABLED = "false"
  $env:MONGODB_ENABLED = "false"
  docker @composeArgs stop @heavyServices 2>$null
}

if ($Watch) {
  docker @composeArgs up -d --no-build --no-deps @services
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  docker @composeArgs watch --no-up backend frontend
} else {
  docker @composeArgs up --no-build --no-deps @services
}
