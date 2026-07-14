# ECOA — Portal do Assistente Virtual (Chatbot Frontend)

Este é o portal web de visualização do Assistente Virtual da plataforma ECOA, oferecendo uma interface conversacional imersiva em tela cheia (Fullscreen) para triagem e suporte ambiental com RAG.

## 🎨 Interface Conversacional (Apple Standard)

A interface do Chatbot é otimizada para ser fluida, responsiva e focada na experiência do usuário:

- **Imersão Total**: Layout de página única (SPA) sem cabeçalhos pesados ou links dispersos, maximizando o espaço útil da janela de conversa.
- **Micro-interações de Chat**: Mensagens sobem com curvas Bezier suaves, sinalizadores visuais de carregamento (`Loader2`) e auto-scroll instantâneo nas novas interações.
- **RAG Triagem Ativa**: O input do chat é processado diretamente pelo subgraph AI acoplando metadados de contexto locais de documentos auditados.

---

## 🔒 Segurança Interceptora

- **Criptografia Simétrica**: Todo tráfego enviado à API do Chatbot utiliza criptografia AES-256-GCM sob handshake do interceptor de segurança Axios.
- **Proteção dos Dados**: Sem login ou coleta desnecessária de dados pessoais, focando apenas no contexto informacional do chat.

---

## 🚀 Como Iniciar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicialize o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse em: `http://localhost:3000` (ou porta de desenvolvimento correspondente).

---

*ECOA Chatbot Front — Conversas fluidas e suporte comunitário instantâneo.*
