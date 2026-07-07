@echo off
setlocal
cd /d "%~dp0"

set "LOCAL_NODE=%CD%\.local-node\nodejs"
set "PATH=%LOCAL_NODE%;%CD%\VERDEVIA-MOBILE\node_modules\.bin;%PATH%"
set "npm_config_cache=%CD%\.npm-cache"

if not exist "%LOCAL_NODE%\node.exe" (
  echo Node local nao encontrado. Rode mobile-web-setup.cmd primeiro.
  exit /b 1
)

cd /d "%CD%\VERDEVIA-MOBILE"
"%LOCAL_NODE%\node.exe" "%LOCAL_NODE%\node_modules\npm\bin\npm-cli.js" run web
