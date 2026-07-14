# 🚀 VERDEVIA — Careers Backend Subgraph

Este é o microsserviço de backend público (voltado ao candidato) do domínio de **Carreiras** do ecossistema **VERDEVIA**. Ele é projetado como um GraphQL Subgraph federado via **Apollo Federation v2**, rodando sob os princípios de **Clean Architecture / Hexagonal Architecture** com o framework NestJS.

Sua principal responsabilidade é gerenciar a listagem pública de vagas, cadastro de perfis profissionais de candidatos e submissão de candidaturas.

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

O diretório principal está organizado em torno de limites de contexto bem definidos e focados na experiência do candidato:

*   `src/modules/jobs/`: Listagem e consulta pública de vagas corporativas disponíveis.
*   `src/modules/candidates/`: Cadastro de novos perfis profissionais e arquivos curriculares para o banco de talentos.
*   `src/modules/applications/`: Processamento e submissão de candidaturas de novos candidatos para vagas específicas.
*   `src/modules/candidate-addresses/`: Entidade de valor de endereço para o cadastro do candidato.
*   `src/modules/candidate-phones/`: Entidade de valor de telefones estruturados.
*   `src/modules/messaging/`: Comunicação baseada em eventos (Kafka) para publicação de novas candidaturas e telemetria crítica de auditoria.
*   `src/modules/redis/`: Caching de dados de vagas de alta performance para carregamento rápido no portal.

#### Camadas Internas de Cada Módulo:
*   `domain/`: Entidades de negócios puras e interfaces de repositórios (**Ports**).
*   `use-cases/`: Casos de uso que encapsulam as regras e fluxos de negócio da aplicação.
*   `infrastructure/`: Implementação concreta dos adaptadores baseados em TypeORM (**Adapters**).
*   `resolvers/` e `controllers/`: Pontos de entrada GraphQL e endpoints REST da aplicação.

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

O backend estará ativo e escutando na porta configurada (default `3340`, ou `3333` conforme `.env`).
*   **GraphQL Playground:** `http://localhost:3340/graphql`
*   **Documentação Swagger REST:** `http://localhost:3340/api/docs`

---

## 🔒 Segurança, Resiliência e LGPD

*   **LGPD & ANPD Compliance (Legítimo Interesse)**: Implementação do princípio de *Privacy by Design*. Candidatos são usuários externos/anônimos que **não precisam de conta na plataforma**. Endereço e telefones são embutidos como JSON para mitigar riscos de vazamento. A coleta dos dados é estritamente vinculada ao recrutamento com base no Legítimo Interesse (Art. 7º, IX, LGPD).
*   **Proteção de Endpoint**: Uso de guards de controle de tráfego, sanitizadores contra ataques XSS e validações estritas de inputs DTO.
*   **Resiliência de Dados (Failover)**: Uso do `DatabaseConfigService` com suporte a failover automático para banco local SQLite (`database.sqlite`) caso o banco PostgreSQL corporativo principal esteja offline.

---

*VERDEVIA Careers Public Backend — Experiência do candidato fluida, segura e transparente.*
