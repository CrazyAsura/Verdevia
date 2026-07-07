# Installs a Git post-commit hook that refreshes the production Docker stack.

$ROOT = $PSScriptRoot
$gitDir = Join-Path $ROOT ".git"
$hooksDir = Join-Path $gitDir "hooks"
$hookPath = Join-Path $hooksDir "post-commit"

if (-not (Test-Path $gitDir)) {
  Write-Error "[VERDEVIA] Pasta .git nao encontrada. Rode este script na raiz do projeto."
  exit 1
}

if (-not (Test-Path $hooksDir)) {
  New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

$hookContent = @'
#!/bin/sh
echo "[VERDEVIA] Commit criado. Atualizando Docker de producao..."

if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./docker-prod-refresh.ps1"
else
  pwsh -NoProfile -ExecutionPolicy Bypass -File "./docker-prod-refresh.ps1"
fi

status=$?
if [ $status -ne 0 ]; then
  echo "[VERDEVIA] Docker de producao nao foi atualizado. Rode: powershell -NoProfile -ExecutionPolicy Bypass -File ./docker-prod-refresh.ps1"
fi

exit 0
'@

Set-Content -Path $hookPath -Value $hookContent -Encoding ascii -ErrorAction Stop

try {
  $acl = Get-Acl $hookPath
  Set-Acl -Path $hookPath -AclObject $acl
} catch {
  # Git for Windows executes the hook by path; chmod is not required on NTFS.
}

if (-not (Test-Path $hookPath)) {
  Write-Error "[VERDEVIA] Falha ao instalar hook em .git/hooks/post-commit"
  exit 1
}

Write-Host "[VERDEVIA] Hook instalado em .git/hooks/post-commit"
