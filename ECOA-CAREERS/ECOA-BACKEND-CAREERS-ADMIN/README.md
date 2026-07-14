# ECOA — Careers Admin Backend Subgraph

Este é o microsserviço de backend do domínio de Carreiras do ecossistema ECOA. Ele é projetado como um GraphQL Subgraph federado via **Apollo Federation v2** rodando sob os princípios de **Clean Architecture / Hexagonal Architecture**.

## 📐 Arquitetura do Software (Hexagonal)

A estrutura do projeto separa rigorosamente o domínio das preocupações de infraestrutura e entrega externa:

```
[ Cliente / GraphQL Gateway ]
             |
             v
     [ Resolvers / Controllers ] (Drivers)
             |
             v
       [ Use Cases ] (Application Core)
        /          \
       v            v
  [ Entities ]    [ Repository Interfaces ] (Ports)
                            ^
                            |
                 [ TypeORM Adapters ] (Driven)
                            |
                        [ Database ]
```

### Estrutura de Pastas
- `src/modules/jobs/`: Módulo de vagas corporativas.
- `src/modules/candidates/`: Módulo de banco de talentos/candidatos.
- `src/modules/applications/`: Módulo de candidaturas e triagem.
- **Camadas de cada Módulo**:
  - `domain/`: Entidades puras e interfaces de repositórios (**Ports**).
  - `use-cases/`: Casos de uso de negócio da aplicação.
  - `infrastructure/`: Implementação concreta dos repositórios via TypeORM (**Adapters**).
  - `controllers/` e `resolvers/`: Pontos de entrada REST e GraphQL que delegam execução para os Casos de Uso.
- `src/common/`: Utilitários compartilhados, interceptor de criptografia e tratamento de erros.

---

## 🛠️ Configuração e Execução

### Execução Local (Desenvolvimento)
1. Instale as dependências:
   ```bash
   yarn install
   ```
2. Inicialize o servidor em modo de desenvolvimento com hot-reload:
   ```bash
   yarn start:dev
   ```

O backend estará escutando na porta configurada (default `3339`).
- GraphQL Playground disponível em `http://localhost:3339/graphql`
- Documentação Swagger REST em `http://localhost:3339/api/docs`

---

## 🔒 Segurança e Resiliência
- **Intercepção Segura**: Inclui `SecurePayloadInterceptor` que utiliza criptografia simétrica AES-256-GCM nas comunicações REST de handshake.
- **Resiliência Ativa de Dados**: Utiliza `DatabaseConfigService` que conecta ao PostgreSQL corporativo por padrão e realiza failover dinâmico para SQLite local (`database.sqlite`) se o PostgreSQL estiver offline, assegurando disponibilidade máxima.

*ECOA Carreiras Backend — Engenharia robusta, desacoplada e resiliente.*
