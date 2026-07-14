# VERDEVIA — Careers Domain Microservice

Este repositório contém a infraestrutura e os sub-projetos modulares do domínio de **Carreiras (Careers)** da rede VERDEVIA. Ele é projetado como um microsserviço independente federado ao ecossistema global.

## 📐 Arquitetura do Domínio

O domínio de Carreiras é composto por quatro componentes centrais rodando em containers dedicados:

```
                          [ Nginx Edge Proxy (Port 8083/8443) ]
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
[ Public Portal ]             [ Admin Portal ]             [ GraphQL Subgraph ]
(frontend-careers)        (frontend-careers-admin)      (backend-careers-admin)
   Port 3003                    Port 3004                    Port 3339
```

1. **`VERDEVIA-BACKEND-CAREERS-ADMIN`**: Servidor de backend construído em NestJS utilizando arquitetura hexagonal (Clean Architecture) e federado ao Apollo Gateway como um subgraph GraphQL na porta `3339`.
2. **`VERDEVIA-WEB-CAREERS`**: Portal público Next.js para visualização de vagas e envio de currículos. Totalmente em conformidade com a **LGPD e ANPD**: não exige senhas ou login para candidatos externos, diminuindo a retenção desnecessária de dados.
3. **`VERDEVIA-WEB-CAREERS-ADMIN`**: Painel administrativo Next.js de uso interno para publicação de vagas, triagem de candidatos e avaliação de candidaturas.
4. **`nginx`**: Proxy reverso de borda configurado localmente para distribuir tráfego HTTP/HTTPS entre os sub-projetos de Carreiras.

---

## 🚀 Como Iniciar

### Pré-requisitos
- Docker & Docker Compose instalados.
- Rede do ecossistema principal criada (rodar no ecossistema global antes se necessário):
  ```bash
  docker network create VERDEVIA_infra_net || true
  docker network create VERDEVIA_web_net || true
  docker network create VERDEVIA_proxy_net || true
  ```

### Executando em Desenvolvimento/Produção
Suba todos os serviços do domínio de Carreiras rodando o comando na raiz desta pasta:
```bash
docker-compose up -d --build
```

### URLs de Acesso
Após a inicialização, os serviços estarão disponíveis nos seguintes endereços através do proxy reverso de borda:
- **Portal Público de Vagas**: `http://localhost:8083` (ou porta SSL `8443`)
- **Painel Administrativo**: `http://localhost:8083/painel` (ou acessando o container diretamente na porta `3004`)
- **GraphQL Subgraph**: `http://localhost:3339/graphql`

---

## 📦 Tecnologias Utilizadas

- **Backend**: NestJS, TypeORM, GraphQL (Apollo Federation), PostgreSQL / SQLite (resiliência ativa).
- **Frontends**: Next.js (App Router), Tailwind CSS v4, Framer Motion, Apollo Client (GraphQL).
- **Proxy**: Nginx Alpine.

*VERDEVIA Carreiras — Recrutamento ágil, privacidade absoluta sob as normas da LGPD e infraestrutura de alta performance.*
