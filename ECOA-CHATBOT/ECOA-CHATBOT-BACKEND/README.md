# ECOA — Chatbot & AI Backend Subgraph

Este é o microsserviço de backend do domínio de Chatbot do ecossistema ECOA. Ele fornece endpoints GraphQL e REST federados via **Apollo Federation v2** sob a filosofia de **Clean Architecture / Hexagonal Architecture**.

## 📐 Arquitetura do Software (Hexagonal)

A separação de camadas do módulo de inteligência artificial (`ai`) é organizada da seguinte forma:

```
[ GraphQL Gateway / Client ]
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

### Estrutura do Módulo `ai`
- `domain/`: Entidades puras e interfaces de portas de repositórios.
- `use-cases/`: Casos de uso operacionais para geração de chats, triagem RAG e integração com LLMs externos.
- `infrastructure/`: Implementação física dos adaptadores de dados e integração de rede com o gateway FastAPI.
- `controllers/` e `resolvers/`: Exposição das rotas de consulta REST e mutations GraphQL.

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

O backend estará escutando na porta configurada (default `3338`).
- GraphQL Playground disponível em `http://localhost:3338/graphql`

---

## 🔒 Segurança e Resiliência
- **Segurança de Comunicação**: O tráfego REST passa pelo `SecurePayloadInterceptor` com criptografia simétrica AES-256-GCM.
- **Cache Local**: Utiliza `RedisModule` de forma fail-safe para cachear tokens de acesso a modelos de IA e dados frequentes.

*ECOA Chatbot Backend — Engenharia robusta e inteligência distribuída de alta performance.*
