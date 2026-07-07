$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

docker rm -f verdevia_mobile_web 2>$null
docker compose -f docker-compose.mobile.yml up mobile-web
