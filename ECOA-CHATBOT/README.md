# ECOA — Chatbot & AI Domain Microservice

Este repositório contém a infraestrutura e os sub-projetos modulares do domínio de **Chatbot & Inteligência Artificial (AI)** do ecossistema ECOA. Ele é projetado como um microsserviço independente com contingência e suporte a RAG (Retrieval-Augmented Generation).

## 📐 Arquitetura do Domínio

O domínio de Chatbot & AI é composto por três componentes centrais e um proxy de borda rodando em containers dedicados:

```
                          [ Nginx Edge Proxy (Port 8083/8443) ]
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
[ Fullscreen Chatbot ]                                     [ GraphQL Subgraph ]
 (frontend-chatbot)                                        (chatbot-backend)
     Port 3000                                                 Port 3338
```

1. **`ECOA-CHATBOT-BACKEND`**: Servidor de backend construído em NestJS utilizando arquitetura hexagonal (Clean Architecture) e federado ao Apollo Gateway como um subgraph GraphQL na porta `3338`. Controla a orquestração de LLMs e serviços RAG.
2. **`ECOA-WEB-CHATBOT`**: Portal web em Next.js que oferece uma interface de chat imersiva e responsiva em tela cheia para suporte, esclarecimento de dúvidas sobre reciclagem e triagem de denúncias ambientais.
3. **`ECOA-AI-GATEWAY`**: Serviço Python FastAPI integrado para processamento local/remoto de IA e detecção de deepfakes, servindo como motor de inferência.
4. **`nginx`**: Proxy reverso de borda local configurado para expor as portas retransmitindo as requisições aos componentes correspondentes.

---

## 🚀 Como Iniciar

### Pré-requisitos
- Docker & Docker Compose instalados.
- Rede do ecossistema principal criada (rodar no ecossistema global antes se necessário):
  ```bash
  docker network create ECOA_infra_net || true
  docker network create ECOA_web_net || true
  docker network create ECOA_proxy_net || true
  ```

### Executando o Domínio de Chatbot
Suba todos os serviços do domínio rodando o comando na raiz desta pasta:
```bash
docker-compose up -d --build
```

### URLs de Acesso
Após a inicialização, os serviços estarão disponíveis nos seguintes endereços através do proxy reverso de borda:
- **Interface Imersiva do Chatbot**: `http://localhost:8083` (ou porta SSL `8443`)
- **GraphQL Subgraph**: `http://localhost:3338/graphql`

---

## 📦 Tecnologias Utilizadas

- **Backend**: NestJS, GraphQL (Apollo Federation), PostgreSQL / SQLite.
- **AI Gateway**: Python, FastAPI.
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Framer Motion.
- **Proxy**: Nginx Alpine.

*ECOA Chatbot — Triagem inteligente e suporte ambiental automatizado.*
