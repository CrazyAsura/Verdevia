# 🚀 VERDEVIA — Careers Admin Backend Subgraph

Este é o microsserviço de backend administrativo do domínio de **Carreiras** do ecossistema **VERDEVIA**. Ele é projetado como um GraphQL Subgraph federado via **Apollo Federation v2**, rodando sob os princípios de **Clean Architecture / Hexagonal Architecture** com o framework NestJS.

Sua principal responsabilidade é fornecer o ecossistema de gestão de vagas, controle de candidatos, triagem de candidaturas e autorizações corporativas para recrutadores e administradores da plataforma.

---

## 📐 Arquitetura do Software (Hexagonal)

A estrutura do projeto separa rigorosamente o domínio das preocupações de infraestrutura e entrega externa, garantindo facilidade de teste e desacoplamento:

```
[ GraphQL Gateway / Clientes ]
              │
              ▼
   [ Resolvers / Controllers ] (Drivers / Input Adapters)
              │
              ▼
        [ Use Cases ] (Application Core)
         ╱         ╲
        ▼           ▼
  [ Entities ]    [ Repository Interfaces ] (Ports)
                             ▲
                             │
                  [ TypeORM Adapters ] (Driven / Output Adapters)
                             │
                             ▼
                        [ Database ]
```

### 📂 Estrutura de Pastas e Módulos

O diretório principal está organizado em torno de limites de contexto bem definidos:

*   `src/modules/admin-auth/`: Controle de autenticação e autorização para administradores e recrutadores (com guards JWT e controle de permissões organizacionais).
*   `src/modules/jobs/`: Criação, alteração, arquivamento e listagem avançada de vagas de trabalho.
*   `src/modules/candidates/`: Gestão do banco de talentos e visualização do currículo e dados profissionais dos candidatos.
*   `src/modules/applications/`: Triagem de candidaturas, mudança de etapas (Applied, Screening, Interview, Approved, Rejected) e registro de feedbacks internos de recrutamento.
*   `src/modules/messaging/`: Comunicação baseada em eventos (Kafka) para auditoria e publicação de telemetria crítica.
*   `src/modules/redis/`: Caching de consultas e sessões temporárias de alta performance.

#### Camadas Internas de Cada Módulo:
*   `domain/`: Entidades de negócios puras e interfaces de repositórios (**Ports**).
*   `use-cases/`: Casos de uso que encapsulam as regras e orquestrações de negócio da aplicação.
*   `infrastructure/`: Implementação concreta dos adaptadores baseados em TypeORM (**Adapters**).
*   `resolvers/` e `controllers/`: Pontos de entrada GraphQL e endpoints REST que delegam a execução para os Casos de Uso.

---

## 🛠️ Configuração e Execução

### Pré-requisitos
*   **Node.js** v20.x ou superior
*   **Yarn** v1.22.x ou superior
*   **PostgreSQL** e **Redis** ativos em seu ambiente local ou via Docker

### Execução Local (Desenvolvimento)

1.  **Instale as dependências:**
    ```bash
    yarn install
    ```

2.  **Configure as variáveis de ambiente:**
    Copie o arquivo `.env.example` para `.env` e configure conforme as credenciais do seu ambiente.
    ```bash
    cp .env.example .env
    ```

3.  **Inicie o servidor em modo watch:**
    ```bash
    yarn start:dev
    ```

O backend estará ativo e escutando na porta configurada (default `3339`, ou `3333` conforme `.env`).
*   **GraphQL Playground:** `http://localhost:3339/graphql`
*   **Documentação Swagger REST:** `http://localhost:3339/api/docs`

### 🔑 Credenciais Padrão (Seeded)

Para testes locais e de desenvolvimento, os seguintes usuários administradores são configurados por padrão através dos scripts de seed da base de dados:

*   **Super Admin:**
    - **E-mail:** `superadmin@verdevia.app`
    - **Senha:** `VerdeviaAdmin2026Seguro`
*   **Admin:**
    - **E-mail:** `admin@verdevia.app`
    - **Senha:** `VerdeviaAdmin2026Seguro`

---

## 🔒 Segurança, Resiliência e LGPD

*   **Autenticação e Guards JWT**: Bloqueio de rotas sensíveis por meio do `JwtAuthGuard`, validando perfis autorizados (Admin, Super Admin) no processo de recrutamento.
*   **Handshake Criptográfico**: Uso do `SecurePayloadInterceptor` que assegura comunicações seguras por meio de criptografia simétrica AES-256-GCM para transporte de dados sensíveis nas rotas de autenticação REST.
*   **LGPD & ANPD Compliance**: Implementação do princípio de *Privacy by Design*. Coleta mínima e isolamento de dados de candidatos em relação aos dados de usuários de outros módulos do sistema.
*   **Resiliência de Dados (Failover)**: Uso do `DatabaseConfigService` com suporte a failover automático para banco local SQLite (`database.sqlite`) caso o banco PostgreSQL corporativo principal esteja offline.

---

*VERDEVIA Careers Admin Backend — Engenharia robusta, desacoplada e resiliente.*
