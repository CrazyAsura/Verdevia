@echo off
setlocal
cd /d "%~dp0"
docker rm -f verdevia_mobile_web >nul 2>nul
docker compose -f docker-compose.mobile.yml up mobile-web
