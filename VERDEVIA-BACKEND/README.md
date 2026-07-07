# Verdevia — Backend API

> **NestJS 11 · GraphQL · REST · TypeORM · PostgreSQL · Redis · WebSockets**
>
> Motor de alta performance do ecossistema Verdevia. Arquitetura hexagonal, SOLID puro e zero-latência, projetada sob o padrão Meta de engenharia.

---

## 📐 Arquitetura

O backend segue **Arquitetura Hexagonal (Ports & Adapters)** com camadas bem definidas:

```
src/
├── common/               # Infraestrutura transversal
│   ├── compression/      # Middleware de compressão HTTP
│   ├── crypto/           # Utilitários de criptografia
│   ├── decorators/       # Custom decorators (RBAC, CurrentUser…)
│   ├── interceptors/     # Interceptors globais (logging, transform)
│   ├── security/         # Guards e estratégias Passport/JWT
│   └── utils/            # Helpers e funções puras
├── database/             # Migrations, Seeds e configuração TypeORM
├── modules/              # Domínios de negócio (SOLID — 1 módulo, 1 responsabilidade)
│   ├── addresses/        # Endereços e geocodificação
│   ├── ai/               # Deepfake detection, classificação de imagens, chatbot FLAN-T5
│   ├── complaints/       # Ciclo de vida completo de queixas ambientais
│   ├── compliance/       # Auditoria e conformidade regulatória
│   ├── courses/          # Verdevia Academy — trilhas de aprendizado
│   ├── forum/            # Posts, likes, dislikes, comentários
│   ├── gamification/     # XP, níveis, títulos e medalhas (Achievements)
│   ├── health/           # NestJS Terminus — health checks
│   ├── licenses/         # Gestão de licenças de operadores
│   ├── messaging/        # WebSockets em tempo real (Socket.io)
│   ├── notifications/    # Central de notificações push e in-app
│   ├── payments/         # Integração de pagamentos
│   ├── phones/           # Verificação de número de telefone
│   ├── profiles/         # Perfis de usuário e avatares
│   ├── redis/            # Abstração do Redis (cache + fallback local)
│   ├── stats/            # Métricas e dados analíticos do dashboard
│   ├── subscriptions/    # Assinaturas e planos
│   └── users/            # Autenticação, RBAC e gestão de usuários
└── main.ts               # Bootstrap — Swagger, Helmet, Throttler, CORS
```

### Padrões de Design Aplicados

| Padrão | Onde |
|---|---|
| **Repository** | Toda camada de acesso a dados (TypeORM) |
| **Factory** | Criação de entidades complexas nos seeders |
| **Adapter** | Integrações externas (AI, Redis cloud/local) |
| **Decorator** | Guards RBAC, `@CurrentUser`, `@Roles` |
| **Singleton** | Módulos globais (Config, Redis, BullMQ) |
| **Use Case** | Services como orquestradores de regra de negócio |

---

## 🔐 Autenticação & RBAC

- **JWT (JSON Web Token)** com expiração configurável via `JWT_EXPIRATION`
- **Argon2** para hashing de senhas — resistente a ataques de GPU
- **Roles**: `USER`, `ADMIN`, `SUPER_ADMIN`, `CONTRACTOR`, `SUPER_CONTRACTOR`
- **Guards customizados** verificam permissões em nível de método/rota

### Credenciais de Seed (Desenvolvimento)

| Role | E-mail | Senha |
|---|---|---|
| **Super Admin** | `superadmin@verdevia.app` | `VerdeviaAdmin2026Seguro` |
| **Admin** | `admin@verdevia.app` | `VerdeviaAdmin2026Seguro` |
| **Super Contratante** | `supercontractor@verdevia.app` | `VerdeviaContratante2026` |
| **Contratante** | `contractor@verdevia.app` | `VerdeviaContratante2026` |

---

## 🌐 APIs Expostas

### REST (Express + NestJS)
- Base URL: `http://localhost:3333`
- Documentação interativa Swagger: `http://localhost:3333/api/docs`

### GraphQL (Apollo Server 5)
- Endpoint: `http://localhost:3333/graphql`
- Playground: `http://localhost:3333/graphql` (modo development)
- Subscriptions via WebSocket: `ws://localhost:3333/graphql`

### Health Check (NestJS Terminus)
- `GET /health` — valida DB (TypeORM), memória heap e Redis

---

## ⚙️ Configuração de Ambiente

Copie `.env.example` para `.env` e preencha as variáveis:

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

# IA & Deepfake (obrigatório para módulo /ai)
DEEPFAKE_API_KEY=sua_api_key_aqui
AI_STRICT_LEVEL=high

# Redis (fallback automático para instância local se cloud falhar)
REDIS_URL=redis://localhost:6379
```

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js ≥ 20
- PostgreSQL ≥ 15
- Redis ≥ 7

```bash
# 1. Instalar dependências
npm install

# 2. Compilar o projeto
npm run build

# 3. Popular o banco com dados iniciais
npm run seed

# 4. Iniciar em modo desenvolvimento (hot-reload)
npm run start:dev

# 5. Produção
npm run start:prod
```

### Via Docker (Recomendado)

```bash
# Sobe banco + Redis + backend
docker compose up -d
```

---

## 🧪 Testes

```bash
# Unitários
npm run test

# Cobertura
npm run test:cov

# E2E
npm run test:e2e

# Modo watch
npm run test:watch
```

---

## 📦 Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| **Framework** | NestJS 11 |
| **Linguagem** | TypeScript 5.7 |
| **ORM** | TypeORM 0.3 + PostgreSQL 15 |
| **Cache / Filas** | Redis (ioredis) + BullMQ |
| **API** | REST (Swagger) + GraphQL (Apollo 5) |
| **Auth** | Passport.js + JWT + Argon2 |
| **Real-time** | Socket.io + GraphQL Subscriptions |
| **Resiliência** | NestJS Terminus + Redis Fallback |
| **Segurança** | Helmet + Throttler + CORS configurado |
| **IA** | Integração externa (Deepfake API + FLAN-T5) |

---

## 🚢 Deploy (Render + Docker GHCR)

O pipeline CI/CD no GitHub Actions realiza:

1. Build da imagem Docker e push para `ghcr.io`
2. Trigger no Render via `render-cli` para redeploy automático

**Secrets necessárias:**
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`
- `GITHUB_TOKEN` (gerado automaticamente)

---

## 📈 Observabilidade

- **Health Check:** `GET /health` — banco, memória e Redis
- **Logs:** Stdout estruturado com timestamp e nível de severidade
- **Failover Guardian:** monitoramento ativo com threshold de 3 falhas consecutivas antes do failover para ambiente local

---

*Verdevia Backend — Engenharia de alta performance. Construído sob padrão Meta.*
