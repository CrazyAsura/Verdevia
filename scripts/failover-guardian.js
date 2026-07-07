/**
 * 🛡️ ANTIGRAVITY RESILIENCE GUARDIAN
 * Logic: Active Monitoring & Automatic Failover
 * Standards: Meta-Standard Reliability | Apple-Standard Feedback
 */

const { exec } = require('child_process');
const https = require('https');
const http = require('http');

// Cria um servidor HTTP simples para permitir o graceful shutdown pelo pre-push hook
http.createServer((req, res) => {
  if (req.url === '/kill') {
    res.writeHead(200);
    res.end('Killed');
    process.exit(0);
  }
}).listen(5999);

const CONFIG = {
  // URLs de Monitoramento
  // EM PRODUÇÃO: Use suas URLs reais da Render/Vercel
  // EM TESTE: Use as URLs do simulate-chaos.js (http://localhost:4000/5000)
  services: [
    {
      name: 'BACKEND_CLOUD',
      url: process.env.TEST_MODE ? 'http://localhost:4000' : 'https://verdevia-mobile.onrender.com/health',
      composeFile: 'docker-compose.yml',
      localPort: 3333
    },
    {
      name: 'FRONTEND_CLOUD',
      url: process.env.TEST_MODE ? 'http://localhost:5000' : 'https://verdevia-green.vercel.app',
      composeFile: 'docker-compose.yml',
      localPort: 3000
    }
  ],
  checkInterval: 5000, // Reduzido para 5s durante testes de simulação
  timeout: 3000
};

const status = {
  BACKEND_CLOUD: { state: 'UNKNOWN', failures: 0 },
  FRONTEND_CLOUD: { state: 'UNKNOWN', failures: 0 }
};

const FAILURE_THRESHOLD = 3; // Precisa falhar 3 vezes seguidas (15s) para ativar o local

function log(msg, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: '\x1b[36m', // Cyan
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    success: '\x1b[32m' // Green
  };
  console.log(`${colors[type]}[${timestamp}] [GUARDIAN] ${msg}\x1b[0m`);
}

async function checkService(service) {
  return new Promise((resolve) => {
    const protocol = service.url.startsWith('https') ? https : http;
    const req = protocol.get(service.url, { timeout: CONFIG.timeout }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function activateLocal(service) {
  log(`⚠️ Falha detectada em ${service.name}. Ativando redundância local...`, 'warn');
  
  // Orquestração Total: Incluímos infra, backend e frontend para garantir que todas 
  // as dependências (postgres -> backend -> frontend) sejam resolvidas pelo Docker.
  const files = [
    'docker-compose.yml'
  ];
  
  const command = `docker compose ${files.map(f => `-f ${f}`).join(' ')} up -d --remove-orphans`;
  
  exec(command, (err, stdout, stderr) => {
    if (err) {
      log(`❌ Erro ao ativar container local (${service.name}): ${err.message}`, 'error');
      if (err.message.includes('dockerDesktopLinuxEngine')) {
        log('💡 DICA: O Docker Desktop parece estar fechado. Por favor, abra-o e tente novamente.', 'info');
      }
      return;
    }
    log(`✅ Ecossistema local para ${service.name} está UP e ONLINE.`, 'success');
  });
}

async function monitor() {
  for (const service of CONFIG.services) {
    const isAlive = await checkService(service);
    const serviceStatus = status[service.name];
    
    if (!isAlive) {
      serviceStatus.failures++;
      log(`⚠️ Alerta de instabilidade em ${service.name} (${serviceStatus.failures}/${FAILURE_THRESHOLD})`, 'warn');
      
      if (serviceStatus.failures >= FAILURE_THRESHOLD && serviceStatus.state !== 'DOWN') {
        serviceStatus.state = 'DOWN';
        await activateLocal(service);
      }
    } else {
      // Se estava DOWN e voltou, limpa as falhas
      if (serviceStatus.state === 'DOWN') {
        log(`✨ ${service.name} estabilizou na nuvem.`, 'success');
      }
      serviceStatus.failures = 0;
      serviceStatus.state = 'UP';
    }
  }
}

// Inicia o ciclo
setInterval(monitor, CONFIG.checkInterval);
monitor();
