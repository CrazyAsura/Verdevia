# VERDEVIA - production Docker refresh
# Rebuilds and recreates production containers after a local commit.

param(
  [switch]$WithTunnel
)

$ROOT = $PSScriptRoot
$composeArgs = @(
  "compose",
  "--env-file", (Join-Path $ROOT "VERDEVIA-BACKEND\.env"),
  "--env-file", (Join-Path $ROOT "VERDEVIA-WEB\.env"),
  "-f", (Join-Path $ROOT "docker-compose.yml")
)

$services = @(
  "postgres",
  "mongodb",
  "redis",
  "kafka",
  "backend",
  "frontend",
  "nginx"
)

if ($WithTunnel) {
  $services += "tunnel"
}

Write-Host "[VERDEVIA] Atualizando Docker de producao..."
docker @composeArgs up -d --build --remove-orphans @services

if ($LASTEXITCODE -ne 0) {
  Write-Error "[VERDEVIA] Falha ao atualizar Docker de producao. Verifique se o Docker Desktop esta aberto."
  exit $LASTEXITCODE
}

Write-Host "[VERDEVIA] Docker de producao atualizado."
