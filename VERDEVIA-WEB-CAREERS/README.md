# Verdevia — Web Platform

> **Next.js 16 · Tailwind CSS v4 · Framer Motion · GraphQL · Shadcn/UI**
>
> Painel operacional do ecossistema Verdevia. A interface organiza ocorrências, contratos, evidências, auditoria e dados territoriais para decisões rápidas de zeladoria.

---

## 📐 Arquitetura

```
src/
├── app/                        # App Router (Next.js 16)
│   ├── administrador/          # Painel Admin — gestão de cursos e moderação
│   ├── autenticacao/           # Fluxo de login com criptografia de URL
│   ├── baixar/                 # Download do app mobile
│   ├── denuncias/              # Painel de queixas ambientais geolocalizadas
│   ├── forum/                  # Feed de discussões comunitárias
│   ├── painel/                 # Dashboard operacional principal
│   ├── perguntas-frequentes/   # Central de suporte e FAQ
│   ├── prestadores/            # Dashboard de equipes de campo (Contractors)
│   ├── privacidade/            # Política de privacidade
│   ├── servicos/               # Gestão de ordens de serviço
│   ├── sobre/                  # Sobre o projeto Verdevia
│   ├── super-administrador/    # Painel Super Admin — auditoria e logs globais
│   ├── super-prestadores/      # Visão de rede e monitoramento de SLA
│   ├── suporte/                # Suporte ao usuário
│   ├── layout.tsx              # Root layout (SEO, fontes, providers)
│   └── page.tsx                # Landing page institucional
├── components/                 # Componentes reutilizáveis (Atoms & Molecules)
├── context/                    # React Contexts (Auth, Theme)
├── graphql/                    # Queries e mutations Apollo Client
├── hooks/                      # Custom hooks (useAuth, useComplaint, etc.)
├── lib/                        # Configurações (Apollo, axios, crypto)
├── providers/                  # Providers globais (QueryClient, Redux, Toast)
├── services/                   # Camada de API (REST + GraphQL)
├── store/                      # Redux Toolkit (estado global)
├── types/                      # TypeScript interfaces e DTOs
└── utils/                      # Helpers, formatadores e utilitários
```

---

## 🛡️ Níveis de Acesso & Dashboards

O sistema implementa **RBAC (Role-Based Access Control)** com 4 painéis operacionais independentes:

| Role | Rota | Funcionalidades |
|---|---|---|
| **Super Admin** | `/super-administrador` | CRUD de admins, audit logs globais, telemetria completa |
| **Admin** | `/administrador` | Gestão de cursos (Verdevia Academy), moderação do fórum, triagem de queixas |
| **Contractor** | `/prestadores` | Ordens de serviço, resolução de queixas, status de missões |
| **Super Contractor** | `/super-prestadores` | Visão de rede, monitoramento de SLA, alertas críticos |

### 🔑 Credenciais de Seed (Desenvolvimento)

| Role | E-mail | Senha |
|---|---|---|
| **Super Admin** | `super@verdevia.br` | `super123` |
| **Admin** | `admin@verdevia.br` | `admin123` |
| **Contratante** | `prestador@verdevia.br` | `field123` |
| **Super Contratante** | `supervisor@verdevia.br` | `boss123` |

---

## 🎨 Design System

- **Paleta**: Tons escuros premium, sem roxo/violeta — evitado por regra de estética do projeto
- **Tipografia**: Inter + Geist — geométrica, legível, cinematográfica
- **Motion**: Framer Motion com curvas Bezier suaves (spring physics)
- **Mapas**: React Leaflet em dark mode customizado para denúncias geolocalizadas
- **Glassmorphism**: Efeitos de blur e materiais translúcidos em painéis críticos
- **Responsividade**: 100% fluido — mobile-first, sem dimensões rígidas em pixels

---

## 🛠️ Funcionalidades Principais

- **Geolocalização Interativa**: Mapa dark mode com clusters de ocorrências em tempo real
- **Segurança de URL**: IDs de recursos criptografados (AES via `@noble/ciphers`) na barra de endereços — previne manipulação maliciosa por enumeração
- **Cache de Alto Desempenho**: Mock Redis para carregamento instantâneo de listas pesadas
- **Proteção de Rotas**: Layout guards verificam role antes de renderizar qualquer página protegida
- **Real-time**: WebSocket (Socket.io) para updates instantâneos no dashboard
- **Virtualização**: `react-window` para listas com milhares de itens sem degradação de performance
- **Exportação**: PDF de relatórios via `@react-pdf/renderer`
- **PWA**: Suporte a instalação via `@ducanh2912/next-pwa`

---

## ⚙️ Instalação e Execução

### Pré-requisitos
- Node.js ≥ 20
- Backend Verdevia rodando em `http://localhost:3333`

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (Turbopack)
npm run dev

# 3. Acessar
# http://localhost:3000
```

### Build de Produção

```bash
npm run build
npm run start
```

### Via Docker

```bash
docker compose up -d
```

---

## 📦 Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Linguagem** | TypeScript 5 |
| **Estilização** | Tailwind CSS v4 + Shadcn/UI |
| **Animações** | Framer Motion + Lenis (smooth scroll) |
| **Estado** | Redux Toolkit + React Query (TanStack) |
| **API** | Axios (REST) + Apollo Client (GraphQL) |
| **Mapas** | React Leaflet (dark mode) |
| **Formulários** | React Hook Form + Zod |
| **Criptografia** | @noble/ciphers + @noble/curves |
| **Real-time** | Socket.io Client |
| **Gráficos** | Recharts |
| **Performance** | react-window, sharp, PWA |

---

## 🌐 Rotas da Aplicação

```
/                           → Landing page institucional Verdevia
/autenticacao               → Login com RBAC
/painel                     → Dashboard operacional (rota principal pós-login)
/denuncias                  → Mapa e listagem de queixas ambientais
/forum                      → Feed de discussões comunitárias
/administrador              → Painel Admin (cursos, fórum, queixas)
/super-administrador        → Painel Super Admin (admins, logs)
/prestadores                → Dashboard de campo (ordens de serviço)
/super-prestadores          → Visão de rede e SLA
/servicos                   → Gestão de serviços
/sobre                      → Sobre o projeto
/privacidade                → Política de privacidade
/suporte                    → Central de suporte e FAQ
/baixar                     → Download do app mobile
```

---

## 🚢 Deploy (Vercel)

O deploy é automático via GitHub Actions em todo push para `main`:

- **Plataforma**: Vercel
- **URL de Produção**: `https://verdevia-green.vercel.app`
- **Framework detectado**: Next.js (auto-configurado)

**Secrets necessárias:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

*Verdevia Web — Operação territorial, evidência confiável e acompanhamento em tempo real.*
