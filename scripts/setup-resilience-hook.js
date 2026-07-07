const fs = require('fs');
const path = require('path');

const hookPath = path.join('.git', 'hooks', 'pre-push');
const hookContent = `#!/bin/sh
echo "🛡️ [ECOÁ] Sincronizando imagens locais antes do Push..."
# Inicia o build em background com múltiplos arquivos para resolver dependências
docker compose -f docker-compose.yml build &

echo "🛡️ [ECOÁ] Iniciando o Failover Guardian para monitorar o deploy..."
# Tenta fechar guardians anteriores graciosamente via node (ignora se falhar)
node -e "require('http').get('http://localhost:5999/kill').on('error', ()=>{})" > /dev/null 2>&1 || true

# Inicia o guardian em background: se a nuvem cair após o push, ele sobe os containers locais
node scripts/failover-guardian.js > failover-guardian.log 2>&1 &

echo "🚀 [ECOÁ] Imagens sendo preparadas e Guardian ativo. Prosseguindo com o Push."
exit 0
`;

try {
  // Verifica se o diretório .git existe
  if (!fs.existsSync('.git')) {
    console.error('❌ Erro: Diretório .git não encontrado. Certifique-se de estar na raiz do projeto.');
    process.exit(1);
  }

  // Cria a pasta hooks se não existir
  const hooksDir = path.join('.git', 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir);
  }

  fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
  console.log('✅ Hook de resiliência instalado com sucesso em .git/hooks/pre-push');
} catch (err) {
  console.error('❌ Erro ao instalar hook:', err.message);
}
