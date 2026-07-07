# Verdevia - Plataforma de Zeladoria Inteligente

![Verdevia Logo](./logo.png)

## 📌 Sobre o Projeto

O **Verdevia** é uma plataforma de zeladoria inteligente para transformar relatos da comunidade em evidências verificadas, filas de atendimento e indicadores de impacto urbano.

A plataforma conecta cidadãos, equipes de campo, administradores e contratantes em um fluxo único: registrar uma ocorrência, validar contexto com IA, acompanhar a resolução e aprender com dados territoriais em tempo real.

---


---

## 📚 Documentação por Módulo

Cada sub-sistema possui sua própria documentação técnica detalhada:

| Módulo | README | Stack Principal |
| :--- | :--- | :--- |
| **Backend API** | [VERDEVIA-BACKEND/README.md](./VERDEVIA-BACKEND/README.md) | NestJS 11 · GraphQL · TypeORM · Redis |
| **Web Platform** | [VERDEVIA-WEB/README.md](./VERDEVIA-WEB/README.md) | Next.js 16 · Tailwind v4 · Framer Motion |
| **Mobile App** | [VERDEVIA-MOBILE/README.md](./VERDEVIA-MOBILE/README.md) | Expo 56 · React Native 0.85 · NativeWind |

---

## 🚀 Funcionalidades Principais

### 1. Sistema de Ocorrências
- **Registro Geolocalizado**: Incidentes urbanos e ambientais com coordenadas precisas.
- **Ciclo de Atendimento**: Acompanhamento em tempo real de pendência, análise, execução e resolução.
- **Evidências Visuais**: Fotos e anexos vinculados ao histórico da ocorrência.

### 2. IA & Confiança
- **Verificação de Evidências**: Algoritmos de autenticidade para reduzir fraude e duplicidade.
- **Classificação de Incidentes**: Triagem automática por tipo, gravidade e contexto territorial.
- **Assistente Contextual**: Suporte inteligente para orientar relatos, dúvidas e próximos passos.

### 3. Fórum & Social
- **Interação Dinâmica**: Sistema de Likes, Dislikes e Compartilhamento nativo.
- **Gamificação**: Medalhas (Achievements), Níveis de XP e Títulos exclusivos para usuários ativos.
- **Engajamento**: Discussões categorizadas sobre sustentabilidade e políticas locais.

### 4. Verdevia Academy (Courses)
- **Trilhas de Aprendizado**: Cursos modulares sobre zeladoria, sustentabilidade, reciclagem e cidadania local.
- **Conteúdo Multimodal**: Suporte a Vídeos, PDFs e Quizzes interativos.
- **Progresso**: Salvamento de estado de leitura e certificação simbólica.

### 5. Auditoria & Stats (Super Admin)
- **Audit Logs**: Rastreamento completo de ações críticas no sistema (logs de acesso, alterações de dados).
- **Dashboard Analítico**: Resumo estatístico de visitas e engajamento da plataforma.

---

## 🔐 Autenticação e Login

O sistema utiliza **RBAC (Role-Based Access Control)** para garantir a segurança dos dados.

### Credenciais Padrão (Desenvolvimento)
Para facilitar os testes iniciais, o sistema conta com usuários pré-semeados:

| Nível de Acesso | E-mail | Senha |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@verdevia.app` | `VerdeviaAdmin2026Seguro` |
| **Admin** | `admin@verdevia.app` | `VerdeviaAdmin2026Seguro` |
| **Super Contratante** | `supercontractor@verdevia.app` | `VerdeviaContratante2026` |
| **Contratante** | `contractor@verdevia.app` | `VerdeviaContratante2026` |

---

## 🗺️ Mapeamento de Rotas (Web/Dashboard)

A plataforma web possui dashboards especializados dependendo do nível de acesso do usuário.

### 🏢 Gestão de Empresas e Contratadas
- **`/contractors`**: Dashboard principal para empresas prestadoras de serviço.
    - `/contractors/complaints`: Gestão e resolução de queixas ambientais atribuídas.
- **`/super-contractors`**: Dashboard para gestão de holding/empresas master.
    - `/super-contractors/subordinates`: Gerenciamento de empresas subordinadas e desempenho.

### 🛡️ Administração da Plataforma
- **`/admin`**: Painel administrativo operacional.
    - `/admin/courses`: Gestão de conteúdo educacional e trilhas do Verdevia Academy.
- **`/superadmin`**: Painel de controle total da infraestrutura.
    - `/superadmin/admins`: Gestão de privilégios e criação de novos administradores.
    - `/superadmin/logs`: Acesso aos **Audit Logs** detalhados (rastreabilidade total via Meta-standard logs).

---

### Fluxo de Auth
- **JWT (JSON Web Token)**: Autenticação via tokens com expiração configurável.
- **Argon2**: Algoritmo de hashing de última geração para proteção de senhas.
- **Protected Routes**: Decorators customizados no backend que verificam permissões em nível de método.

---

## ⚙️ Configuração de Ambiente (.env)

O projeto requer variáveis de ambiente específicas para o funcionamento total dos motores de IA e Banco de Dados.

### Backend (`/VERDEVIA-BACKEND/.env`)
```env
# Servidor
PORT=3333
NODE_ENV=development

# Banco de Dados (TypeORM)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=verdevia

# Segurança
JWT_SECRET=SuaChaveSecretaUltraSegura
JWT_EXPIRATION=7d

# IA & Deepfake (Obrigatório para módulo AI)
DEEPFAKE_API_KEY=sua_api_key_aqui
AI_STRICT_LEVEL=high
```

### Mobile (`/VERDEVIA-MOBILE/.env`)
```env
# URL da API (Use o IP da sua máquina se testar em dispositivo real)
EXPO_PUBLIC_API_URL=http://localhost:3333
```

---

## 🏗️ Estrutura de Pastas

```text
.
├── VERDEVIA-BACKEND/       # API NestJS (Arquitetura Layered & Modular)
│   ├── src/modules/        # Módulos independentes (SOLID)
│   ├── src/database/       # Migrations e Seeders
│   └── test/               # Suíte de Testes (E2E e Unitários)
├── VERDEVIA-MOBILE/        # App Expo (Mobile)
│   ├── app/                # File-based Routing (Expo Router)
│   ├── components/         # UI Atoms & Molecules
│   ├── store/              # Redux State Management
│   └── services/           # API Consumers (Axios)
├── VERDEVIA-WEB/           # Portal Web Next.js
│   ├── src/app/            # App Router pages
│   └── src/components/     # Componentes React
└── docs/                   # Documentação técnica adicional
```

---

## 🛠️ Execução Local

O ecossistema Antigravity pode ser executado de forma manual ou orquestrada via Docker.

### 1. Via Docker (Recomendado - Meta Standard)
A infraestrutura é segmentada para máxima performance e isolamento. Para evitar problemas de dependências não declaradas entre arquivos separados, inicialize o ecossistema completo de forma conjunta:

```bash
# Iniciar todo o ecossistema (Infraestrutura, Backend e Frontend)
docker compose up -d
```

### 2. Execução Manual (Desenvolvimento)
Certifique-se de configurar os arquivos `.env` antes de iniciar.

*   **Backend**:
    ```bash
    cd VERDEVIA-BACKEND && npm install
    npm run build && npm run seed
    npm run start:dev
    ```
*   **Web**:
    ```bash
    cd VERDEVIA-WEB && npm install
    npm run dev
    ```
*   **Mobile**:
    ```bash
    cd VERDEVIA-MOBILE && npm install
    npx expo start
    ```

---

## 🔐 Gateway Nginx, TLS Local & Túnel Seguro (E2E)

Para atender aos rigorosos critérios de engenharia da Meta e design da Apple, a plataforma utiliza um **Gateway Nginx** para gerenciar todas as conexões locais e externas sobre **HTTPS (SSL/TLS)**.

### 🏗️ Arquitetura do Gateway Nginx
- **Porta de Entrada Única:** O Nginx escuta nas portas `80` (HTTP) e `443` (HTTPS). Todo o tráfego HTTP é automaticamente redirecionado com status `301` para HTTPS.
- **Roteamento Inteligente:**
  - **Frontend (Next.js):** Mapeado na raiz `/` (com suporte a WebSockets/HMR para desenvolvimento).
  - **Backend REST API (NestJS):** Mapeado sob `/api/`. O Nginx realiza a reescrita de caminho (rewrite) automaticamente removendo o prefixo `/api` antes de encaminhar ao NestJS.
  - **GraphQL & Swagger:** Roteados diretamente para `/graphql` e `/api/docs` no backend.
- **Resiliência DNS (Anti-Crash):** Utiliza o DNS interno do Docker (`resolver 127.0.0.11`) com variáveis upstream dinâmicas. Isso impede que o Nginx falhe ou caia se os containers do frontend ou backend estiverem offline ou reiniciando.

### 🛡️ TLS/SSL e Domínio Local (`https://ecoa`)
Você pode acessar o ambiente de desenvolvimento local usando os domínios técnicos legados `https://ecoa` ou `https://ecoa.local`. O projeto inclui scripts utilitários em PowerShell na pasta `./scripts` para automatizar essa configuração no Windows:

1. **Mapeamento de Host (`setup-hosts.ps1`)**:
   Insere a entrada `127.0.0.1 ecoa ecoa.local` no seu arquivo `C:\Windows\System32\drivers\etc\hosts`.
   ```powershell
   # Execute como Administrador no PowerShell:
   powershell -ExecutionPolicy Bypass -File .\scripts\setup-hosts.ps1
   ```

2. **Geração do Certificado (`generate-certs.ps1`)**:
   Localiza o OpenSSL no seu sistema (ex: do Git) e gera a chave e o certificado autoassinado com a extensão **Subject Alternative Names (SAN)** contendo os domínios `ecoa`, `ecoa.local`, `localhost` e o IP `127.0.0.1`.
Para permitir testes reais no aplicativo mobile sem a necessidade de instalar certificados adicionais em dispositivos iOS/Android:
1. O ngrok é configurado em [docker-compose.backend.yml](docker-compose.backend.yml) para tunelar tráfego diretamente para o Nginx seguro (`https://nginx:443`).
2. A diretiva `--upstream-tls-verify=false` é ativada no agente do ngrok para ignorar a validação do certificado autoassinado local.
3. **Fluxo Criptográfico:** O tráfego permanece criptografado durante toda a jornada:
   `Dispositivo Cliente (HTTPS Público)` ➔ `ngrok Edge` ➔ `Agente ngrok (Docker)` ➔ `Gateway Nginx (HTTPS Local com TLS)` ➔ `Microserviços (Rede Privada Docker)`.

---

## 🚢 Deployment na Nuvem (CI/CD)

O projeto utiliza um pipeline de **Continuous Deployment** automatizado via GitHub Actions.

### 1. Frontend (Vercel)
O deploy é acionado automaticamente em todo push para `main` na pasta `/web`.
*   **Framework**: Next.js 16 (Turbopack)
*   **Secrets Necessárias**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

### 2. Backend (Render + Docker GHCR)
O backend possui uma estratégia de deploy em dois níveis:
1.  **Render CLI**: Gatilho direto para o serviço via `render-cli`.
2.  **Docker Registry (Fallback)**: Build e push automático de imagem para o `ghcr.io` (GitHub Container Registry).

*   **Secrets Necessárias**: 
    *   `RENDER_API_KEY`: Token de API do Render.
    *   `RENDER_SERVICE_ID`: ID do serviço (formato `srv-xxx`).
    *   `GITHUB_TOKEN`: Gerado automaticamente pelo Actions.

---

## 🛡️ Arquitetura de Resiliência Indestrutível (Failover Guardian)

O projeto Verdevia utiliza uma abordagem de **Hybrid Deployment**. O sistema monitora a saúde dos serviços na nuvem e, em caso de falha crítica ou instabilidade, redireciona a carga para containers locais automaticamente.

### 🧩 Componentes do Sistema de Segurança

1.  **Failover Guardian (`failover-guardian.js`)**:
    *   **Monitoramento Ativo (Hosts e Portas)**:
        O Guardian avalia constantemente o estado das seguintes origens:
        
        | Serviço | Nuvem (Produção) | Local (Redundância/Teste) |
        | :--- | :--- | :--- |
        | **Frontend** | `https://verdevia-green.vercel.app` (Porta 443) | `http://localhost:3000` (Simulação em 5000)|
        | **Backend** | `https://verdevia-mobile.onrender.com` (Porta 443) | `http://localhost:3333` (Simulação em 4000)|

    *   **Lógica Anti-Flapping**: Aguarda 3 falhas consecutivas (threshold de 15s) antes de ativar o local, garantindo que o failover não ocorra durante reinicializações breves.
    *   **Health Check Telemetry**: Consome o endpoint `/health` (NestJS Terminus) para validar a saúde do Banco de Dados e Memória, não apenas o status HTTP.

2.  **Sincronização e Orquestração via Git Hook (`pre-push`)**:
    *   Ao executar `git push`, o sistema dispara automaticamente um build das imagens locais em segundo plano, **resolvendo dependências cruzadas (ex: Redis)** orquestrando os múltiplos arquivos (`infra`, `backend` e `frontend`) simultaneamente.
    *   O hook também inicializa (ou reinicia) automaticamente o **Failover Guardian** no background. Ele conta com um mecanismo de **Graceful Shutdown via Micro-servidor HTTP (porta 5999)** para garantir compatibilidade *cross-platform* (funciona nativamente no Windows/Git Bash sem depender do comando `pkill`).
    *   Dessa forma, caso o deploy cause uma queda nos serviços da nuvem, o monitoramento percebe e já sobe as instâncias locais de forma autônoma e segura.

3.  **Redis Fallback (Persistence Layer)**:
    *   O backend tenta conexão primária (Cloud). Se falhar, alterna instantaneamente para o Redis local no Docker.
    *   Garante que sessões e cache não sejam perdidos durante a transição de infraestrutura.

### 🚀 Como operar a Resiliência

1.  **Instalar o Hook de Automação (Uma vez)**:
    ```bash
    node setup-resilience-hook.js
    ```

2.  **Iniciar o Monitoramento**:
    Mantenha este processo rodando para ativação automática em caso de queda:
    ```bash
    node failover-guardian.js
    ```

3.  **Simular Falha (Teste de Estresse)**:
    Use o simulador de caos para ver o Guardian em ação:
    ```bash
    node simulate-chaos.js
    ```

---

## 📈 Monitoramento e Telemetria

O backend expõe um painel de saúde robusto via **NestJS Terminus**:
*   **Endpoint**: `GET /health`
*   **Indicadores**: Status do Banco de Dados (TypeORM), Memória Heap e integridade do Cache.
*   **Logs**: Eventos de failover e recuperação são registrados com timestamps cianos e verdes no terminal do Guardian.

---

## 📱 Mobile Deployment (Expo EAS)

O build do app mobile é gerenciado pelo Expo Application Services (EAS).
*   **Pipeline**: `mobile-deploy.yml`
*   **Comando**: `eas build --platform all`
*   **Distribuição**: Expo Go (Desenvolvimento) e App Store/Play Store (Produção).

---

## 🔒 Segurança & Auditoria
Todas as alterações críticas e acessos são registrados no módulo de **Audit Logs**, seguindo os padrões de rastreabilidade da Meta. O sistema de monitoramento está integrado ao dashboard administrativo para visualização em tempo real de eventos do sistema.

---

*Desenvolvido sob os mais altos padrões de engenharia e design. 🌍*
