const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Configurations
const PORT = 8082;
const APK_RELATIVE_PATH = '../android/app/build/outputs/apk/debug/app-debug.apk';
const APK_PATH = path.join(__dirname, APK_RELATIVE_PATH);

// Helper to get local IP Address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIp();
const downloadUrl = `http://${localIp}:${PORT}/`;

// Parse command line arguments
const args = process.argv.slice(2);
const argumentUrl = args.find(arg => arg.startsWith('http'));

if (argumentUrl) {
  startServer(argumentUrl);
} else if (!fs.existsSync(APK_PATH)) {
  console.log('\n\x1b[33m[AVISO] APK local não encontrado em:\x1b[0m');
  console.log(`  ${APK_PATH}\n`);
  console.log('Como você realizou um build na nuvem (EAS Build), você pode compartilhar a URL gerada.');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Cole a URL do build do EAS aqui (ou pressione Enter para ver instruções de compilação local): ', (answer) => {
    rl.close();
    const url = answer.trim();
    if (url && url.startsWith('http')) {
      startServer(url);
    } else {
      console.log('\nPara compilar o APK localmente no Windows, certifique-se de ter o JDK instalado e execute:');
      console.log('\x1b[36m  npm run android:build-local\x1b[0m');
      process.exit(1);
    }
  });
} else {
  startServer(null);
}

function startServer(remoteUrl) {
  let fileSizeInMegabytes = 'N/A';
  let buildTime = new Date().toLocaleString();
  let isLocal = !remoteUrl;

  if (isLocal) {
    const stats = fs.statSync(APK_PATH);
    fileSizeInMegabytes = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';
    buildTime = stats.mtime.toLocaleString();
  }

  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      // Serve premium dark mode download page
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ECOA — Instalação Sem Fio</title>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --bg-glow: radial-gradient(circle at 50% -20%, #1c2c42 0%, #0a0f18 80%);
              --card-bg: rgba(255, 255, 255, 0.03);
              --card-border: rgba(255, 255, 255, 0.08);
              --accent: #007aff;
              --accent-glow: rgba(0, 122, 255, 0.35);
              --text-primary: #f5f5f7;
              --text-secondary: #86868b;
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background: var(--bg-glow);
              color: var(--text-primary);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              overflow-x: hidden;
            }

            .container {
              width: 100%;
              max-width: 440px;
              text-align: center;
              animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .logo-wrapper {
              margin-bottom: 32px;
              position: relative;
              display: inline-block;
            }

            .logo-glow {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 80px;
              height: 80px;
              background: var(--accent);
              filter: blur(40px);
              opacity: 0.6;
              z-index: 1;
              border-radius: 50%;
            }

            .logo {
              font-size: 32px;
              font-weight: 700;
              letter-spacing: -1.5px;
              background: linear-gradient(135deg, #ffffff 0%, #a2a2a2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              position: relative;
              z-index: 2;
            }

            .card {
              background: var(--card-bg);
              border: 1px solid var(--card-border);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border-radius: 24px;
              padding: 32px 24px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
              margin-bottom: 24px;
            }

            h1 {
              font-size: 22px;
              font-weight: 600;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }

            p.subtitle {
              font-size: 14px;
              color: var(--text-secondary);
              margin-bottom: 24px;
            }

            .spec-table {
              width: 100%;
              background: rgba(0, 0, 0, 0.15);
              border-radius: 16px;
              padding: 16px;
              margin-bottom: 32px;
              font-size: 14px;
              text-align: left;
            }

            .spec-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .spec-row:last-child {
              border-bottom: none;
            }

            .spec-label {
              color: var(--text-secondary);
            }

            .spec-value {
              font-weight: 600;
              color: var(--text-primary);
            }

            .btn-download {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              background: var(--accent);
              color: #ffffff;
              font-size: 16px;
              font-weight: 600;
              padding: 16px;
              border-radius: 16px;
              text-decoration: none;
              box-shadow: 0 4px 14px var(--accent-glow);
              transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .btn-download:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(0, 122, 255, 0.5);
              background: #1a87ff;
            }

            .btn-download:active {
              transform: translateY(0);
            }

            .footer {
              font-size: 12px;
              color: var(--text-secondary);
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
            }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo-wrapper">
              <div class="logo-glow"></div>
              <div class="logo">ECOA MOBILE</div>
            </div>
            <div class="card">
              <h1>Instalação Sem Fio</h1>
              <p class="subtitle">Instale o seu aplicativo móvel sobre a rede Wi-Fi local.</p>
              
              <div class="spec-table">
                <div class="spec-row">
                  <span class="spec-label">Origem</span>
                  <span class="spec-value">${isLocal ? 'Build Local (Gradle)' : 'Build Nuvem (EAS)'}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Tamanho</span>
                  <span class="spec-value">${fileSizeInMegabytes}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Último Build</span>
                  <span class="spec-value">${buildTime}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Ambiente</span>
                  <span class="spec-value">Development Client</span>
                </div>
              </div>

              <a href="/download" class="btn-download">${isLocal ? 'Baixar Aplicativo (APK)' : 'Abrir Instalação EAS'}</a>
            </div>
            <div class="footer">
              Conectado em: ${localIp}
            </div>
          </div>
        </body>
        </html>
      `);
    } else if (req.url === '/download') {
      if (isLocal) {
        // Serve local APK file
        res.writeHead(200, {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="app-debug.apk"',
          'Content-Length': fs.statSync(APK_PATH).size
        });
        const readStream = fs.createReadStream(APK_PATH);
        readStream.pipe(res);
      } else {
        // Redirect to EAS build page / URL
        res.writeHead(302, { 'Location': remoteUrl });
        res.end();
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log('\n\x1b[32m%s\x1b[0m', '⚡ Antigravity Cable-Free APK Server Active! ⚡');
    console.log('----------------------------------------------------');
    console.log(`Local IP:   \x1b[36m${localIp}\x1b[0m`);
    console.log(`Port:       \x1b[36m${PORT}\x1b[0m`);
    console.log(`URL:        \x1b[35m${downloadUrl}\x1b[0m`);
    if (!isLocal) {
      console.log(`EAS Link:   \x1b[33m${remoteUrl}\x1b[0m`);
    }
    console.log('----------------------------------------------------');
    console.log('1. Certifique-se de que o celular está no mesmo Wi-Fi.');
    console.log('2. Escaneie o QR Code abaixo para acessar o instalador.');
    console.log('3. Após instalar o APK no seu celular:');
    console.log('   - Rode \x1b[33mnpm run start\x1b[0m para iniciar o Metro Bundler.');
    console.log('   - Abra o app instalado e escaneie o QR Code do Metro.');
    console.log('   - Codifique com \x1b[32mHot Reload\x1b[0m instantâneo via Wi-Fi!\n');

    try {
      const qrcode = require('qrcode-terminal');
      qrcode.generate(downloadUrl, { small: true });
    } catch (err) {
      console.log('Instale "qrcode-terminal" para ver o QR Code diretamente aqui.');
      console.log(`Acesse manualmente: ${downloadUrl}`);
    }
  });
}
