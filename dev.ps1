# VERDEVIA - Dev Launcher
# Sobe infra (Kafka, Postgres, Redis, MongoDB) e depois o NestJS backend.
# Uso: .\dev.ps1 [-SkipInfra] [-BackendOnly]
param(
  [switch]$SkipInfra,
  [switch]$BackendOnly
)

$ROOT    = $PSScriptRoot
$COMPOSE_FILE = Join-Path $ROOT "VERDEVIA-BACKEND\docker-compose.yml"
$BACKEND = Join-Path $ROOT "VERDEVIA-BACKEND"

function Info  { param($msg) Write-Host "[VERDEVIA] $msg" -ForegroundColor Cyan }
function Ok    { param($msg) Write-Host "[OK]   $msg" -ForegroundColor Green }
function Warn  { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Err   { param($msg) Write-Host "[ERR]  $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "  VERDEVIA - Dev Environment Launcher" -ForegroundColor DarkCyan
Write-Host ""

# 1. Subir infraestrutura via Docker
if (-not $SkipInfra -and -not $BackendOnly) {
  Info "Subindo infraestrutura (Kafka, Postgres, Redis, MongoDB)..."
  docker compose -f $COMPOSE_FILE up -d postgres mongodb redis kafka --remove-orphans
  if ($LASTEXITCODE -ne 0) {
    Err "Falha ao subir infra. Verifique se o Docker Desktop esta rodando."
    exit 1
  }
  Ok "Containers iniciados."
}

# 2. Aguardar Kafka ficar healthy
if (-not $BackendOnly) {
  Info "Aguardando Kafka ficar healthy (timeout: 90s)..."
  $maxWait  = 90
  $elapsed  = 0
  $interval = 5

  while ($elapsed -lt $maxWait) {
    $kafkaStatus = docker inspect --format "{{.State.Health.Status}}" verdevia_kafka 2>$null
    if ($kafkaStatus -eq "healthy") {
      Ok "Kafka esta healthy!"
      break
    }
    if ($kafkaStatus -eq "unhealthy") {
      Err "Kafka esta unhealthy. Verifique: docker logs verdevia_kafka"
      exit 1
    }
    Write-Host "  ... aguardando Kafka ($elapsed/$maxWait s) - status: $kafkaStatus" -ForegroundColor DarkGray
    Start-Sleep -Seconds $interval
    $elapsed += $interval
  }

  if ($elapsed -ge $maxWait) {
    Warn "Kafka demorou mais de ${maxWait}s. O backend tentara conectar mesmo assim."
  }
}

# 3. Liberar porta 3333 se ocupada
$portProcs = Get-NetTCPConnection -LocalPort 3333 -ErrorAction SilentlyContinue |
             Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $portProcs) {
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  Warn "Processo PID $procId na porta 3333 encerrado."
}

# 4. Iniciar backend NestJS
Info "Iniciando NestJS backend (watch mode)..."
Write-Host ""
Set-Location $BACKEND
npm run start:dev
