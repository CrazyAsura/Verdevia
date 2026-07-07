# Verdevia — Mobile App

> **Expo 56 · React Native 0.85 · Expo Router · NativeWind v5 · Redux Toolkit**
>
> Aplicativo mobile do ecossistema Verdevia. Cidadãos registram ocorrências, acompanham respostas, aprendem boas práticas e fortalecem a zeladoria do próprio território.

---

## 📐 Arquitetura

```
.
├── app/                        # File-based Routing (Expo Router)
│   ├── _layout.tsx             # Root layout (providers, splash, auth guard)
│   ├── index.tsx               # Entry point — redireciona conforme auth
│   ├── auth/                   # Fluxo de autenticação (login, cadastro)
│   ├── complaint/              # Telas de detalhes de queixa
│   ├── course/                 # Player de curso e leitor de conteúdo
│   ├── post/                   # Detalhes de post do fórum
│   ├── achievements.tsx        # Conquistas e medalhas do usuário
│   ├── courses.tsx             # Listagem de trilhas Verdevia Academy
│   ├── edit-profile.tsx        # Edição de perfil e avatar
│   ├── forum.tsx               # Feed do fórum comunitário
│   ├── global-complaints.tsx   # Mapa global de denúncias
│   ├── history.tsx             # Histórico de queixas do usuário
│   ├── make-complaint.tsx      # Formulário de nova denúncia (câmera + GPS)
│   ├── notifications.tsx       # Central de notificações
│   ├── profile.tsx             # Perfil público e estatísticas
│   ├── reward-pass.tsx         # Passe de recompensas e XP
│   ├── security.tsx            # Configurações de segurança
│   └── settings.tsx            # Preferências do usuário
├── api/                        # Clientes de API (Axios + GraphQL)
├── components/                 # UI Atoms & Molecules reutilizáveis
│   ├── ui/                     # Componentes base (Button, Card, Input…)
│   └── shared/                 # Componentes de domínio (ComplaintCard, etc.)
├── constants/                  # Constantes globais (cores, URLs, enums)
├── context/                    # React Contexts (AuthContext, ThemeContext)
├── hooks/                      # Custom hooks (useAuth, useLocation, etc.)
├── i18n/                       # Internacionalização (i18next — PT/EN)
├── lib/                        # Configurações (Apollo, axios, crypto)
├── providers/                  # Providers globais (Redux, QueryClient)
├── services/                   # Camada de serviços de negócio
├── store/                      # Redux Toolkit (slices + persist)
├── utils/                      # Helpers, formatadores e utilitários
└── assets/                     # Imagens, ícones e fontes estáticas
```

### Padrões de Design Aplicados

| Padrão | Onde |
|---|---|
| **Repository** | `api/` — abstrai chamadas REST e GraphQL |
| **Provider** | `providers/` — injeção de dependência via Context |
| **Adapter** | `services/` — adapta respostas da API para modelos locais |
| **Singleton** | Store Redux, cliente Apollo |
| **Observer** | WebSocket (Socket.io) para notificações em tempo real |

---

## 🚀 Funcionalidades Principais

### 📍 Sistema de Ocorrências (Core)
- **Registro Geolocalizado**: Captura de coordenadas GPS precisas com mapa interativo
- **Câmera Integrada**: Anexo de evidências fotográficas via `expo-camera`
- **Ciclo de Status**: Pendente → Em Análise → Resolvido (atualização em tempo real)
- **Mapa Global**: Visualização de todas as ocorrências da comunidade

### 🤖 IA & Validação
- **Deepfake Detection**: Verificação automática de autenticidade das imagens enviadas
- **Classificação**: Identificação do tipo de incidente via zero-shot learning
- **Chatbot Verdevia**: Assistente contextual baseado em FLAN-T5

### 🎓 Verdevia Academy
- **Trilhas de Aprendizado**: Cursos modulares sobre ecologia, reciclagem e fauna
- **Conteúdo Multimodal**: Vídeos, PDFs e quizzes interativos
- **Progresso Persistido**: Estado de leitura salvo com Redux Persist

### 🏆 Gamificação
- **Sistema de XP**: Pontos por queixas, cursos e engajamento no fórum
- **Níveis & Títulos**: Progressão visual com títulos exclusivos
- **Medalhas (Achievements)**: Conquistas desbloqueáveis por ações específicas
- **Reward Pass**: Passe de recompensas estilo battle pass

### 💬 Fórum Comunitário
- **Feed Dinâmico**: Posts com suporte a likes, dislikes e comentários
- **Categorias**: Discussões organizadas por tema ambiental
- **Real-time**: Atualizações instantâneas via WebSocket

### 🔔 Notificações
- **In-App**: Central de notificações com histórico
- **Push**: Notificações nativas (configurável via EAS)

---

## ⚙️ Configuração de Ambiente

Crie o arquivo `.env` na raiz de `VERDEVIA-MOBILE/`:

```env
# URL da API Verdevia Backend
# Em dispositivo físico: use o IP local da máquina (ex: http://192.168.1.100:3333)
# Em emulador Android: use http://10.0.2.2:3333
# Em simulador iOS: use http://localhost:3333
EXPO_PUBLIC_API_URL=http://localhost:3333
```

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js ≥ 20
- Expo CLI: `npm install -g expo-cli`
- Backend Verdevia rodando (`EXPO_PUBLIC_API_URL` apontando para ele)

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor Expo (Metro Bundler)
npx expo start

# 3. Abrir no dispositivo
# → Escanear o QR code com o app Expo Go
# → Pressionar 'a' para Android emulador
# → Pressionar 'i' para iOS simulador
```

### Execução com Tunnel (Dispositivo Físico + Backend Local)

```bash
# Expõe o Metro Bundler via ngrok — ideal para testes em rede diferente
npm run tunnel
```

---

## 📦 Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| **Framework** | Expo SDK 56 + React Native 0.85 |
| **Linguagem** | TypeScript 6 |
| **Roteamento** | Expo Router 56 (file-based) |
| **Estilização** | NativeWind v5 + Tailwind CSS v4 |
| **Estado** | Redux Toolkit + Redux Persist |
| **Cache / Queries** | TanStack React Query |
| **API REST** | Axios |
| **API GraphQL** | Apollo Client 4 |
| **Real-time** | Socket.io Client |
| **Auth** | JWT via AsyncStorage persistido |
| **Localização** | expo-location (GPS precisão alta) |
| **Câmera** | expo-camera + expo-image-picker |
| **Criptografia** | @noble/ciphers + @noble/curves |
| **i18n** | i18next + react-i18next (PT/EN) |
| **Animações** | react-native-reanimated 4 + @legendapp/motion |

---

## 📱 Builds & Deploy (EAS)

### Build de Desenvolvimento (APK para teste)

```bash
# Build Android local (sem EAS)
npm run android:build-local

# Build Android via EAS (development profile)
npm run android:build
```

### Build de Produção (EAS)

```bash
# Build para todas as plataformas
eas build --platform all

# Apenas Android
eas build --platform android

# Apenas iOS
eas build --platform ios
```

### Configuração EAS (`eas.json`)

Perfis disponíveis:
- `development`: APK com expo-dev-client
- `preview`: APK de homologação
- `production`: Bundle para stores (App Store / Play Store)

---

## 🧪 Testes

```bash
# Executar testes (Jest + jest-expo)
npm run test

# Modo watch
npm run test -- --watchAll
```

---

## 🌍 Internacionalização

O app suporta múltiplos idiomas via `i18next`:

- 🇧🇷 **Português (PT-BR)** — padrão
- 🇺🇸 **English (EN)**

Arquivos de tradução em `i18n/locales/`.

---

## 📄 Geração de Documentação

```bash
# Gera documentação técnica do projeto (DOCX)
npm run generate-docs
```

---

*Verdevia Mobile — Evidências locais, participação cidadã e resposta acompanhável.*
