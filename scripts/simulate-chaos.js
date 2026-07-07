/**
 * 🧪 CHAOS SIMULATOR - ANTIGRAVITY
 * Simula a queda dos serviços em nuvem para validar o Failover Guardian.
 */

const http = require('http');

const CLOUD_SERVICES = [
  { name: 'BACKEND_CLOUD', port: 4000 },
  { name: 'FRONTEND_CLOUD', port: 5000 }
];

const servers = [];

function startSimulation() {
  console.log('\x1b[35m[CHAOS] Iniciando servidores de simulação de nuvem...\x1b[0m');
  
  CLOUD_SERVICES.forEach(service => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: service.name }));
    });

    server.listen(service.port, () => {
      console.log(`\x1b[32m[CHAOS] ${service.name} simulado em http://localhost:${service.port}\x1b[0m`);
    });

    servers.push({ name: service.name, instance: server });
  });

  console.log('\n\x1b[33m[INSTRUÇÃO] Pressione CTRL+C para derrubar os serviços simulados e observar o Guardian agir!\x1b[0m\n');
}

process.on('SIGINT', () => {
  console.log('\n\x1b[31m[CHAOS] DERRUBANDO SERVIÇOS EM NUVEM (Simulação de Falha Crítica)...\x1b[0m');
  servers.forEach(s => s.instance.close());
  console.log('\x1b[31m[CHAOS] Nuvem OFFLINE. O Guardian deve disparar em breve.\x1b[0m');
  process.exit();
});

startSimulation();
