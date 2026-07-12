# VERDEVIA - Dev Launcher
# Sobe todo o ambiente local (infraestrutura + microsserviços + gateways)
# Uso: .\dev.ps1

$ROOT = $PSScriptRoot

function Info  { param($msg) Write-Host "[VERDEVIA] $msg" -ForegroundColor Cyan }
function Ok    { param($msg) Write-Host "[OK]   $msg" -ForegroundColor Green }
function Warn  { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Err   { param($msg) Write-Host "[ERR]  $msg" -ForegroundColor Red }

# 1. Liberar portas do backend se ocupadas (3333 ate 3338)
Info "Limpando portas ocupadas..."
for ($port = 3333; $port -le 3338; $port++) {
  $portProcs = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
               Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $portProcs) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Warn "Processo PID $procId na porta $port encerrado."
  }
}

# 2. Subir ambiente completo via Docker Compose em modo watch/dev
Info "Iniciando Docker Compose em modo desenvolvimento..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --remove-orphans
