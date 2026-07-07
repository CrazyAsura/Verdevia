@echo off
setlocal
cd /d "%~dp0"

set "LOCAL_NODE=%CD%\.local-node\nodejs"
set "npm_config_cache=%CD%\.npm-cache"
set "npm_config_update_notifier=false"

if not exist "%LOCAL_NODE%\node.exe" (
  echo Copiando Node local...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "New-Item -ItemType Directory -Force '.local-node' | Out-Null; Copy-Item -Path 'C:\nvm4w\nodejs' -Destination '.local-node\nodejs' -Recurse -Force"
)

cd /d "%CD%\VERDEVIA-MOBILE"
"%LOCAL_NODE%\node.exe" "%LOCAL_NODE%\node_modules\npm\bin\npm-cli.js" install --legacy-peer-deps --no-audit --no-fund --registry=https://registry.npmmirror.com --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
