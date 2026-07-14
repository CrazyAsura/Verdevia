# ECOA — Painel Administrativo de Carreiras

Este é o portal de uso interno para administradores e recrutadores da plataforma ECOA gerenciarem oportunidades de trabalho, candidatos e triagem de candidaturas.

## 🛠️ Funcionalidades Administrativas

O painel é estruturado em três abas operacionais dinâmicas:

1. **Gestão de Vagas**:
   - Cadastro de novas posições de trabalho com título, requisitos, benefícios, faixa salarial e localidade.
   - Edição de vagas existentes e exclusão de vagas.
2. **Triagem de Candidaturas**:
   - Visualização de todas as candidaturas ativas no funil de contratação.
   - Abertura de perfis de candidatos para visualização de links de currículo e LinkedIn.
   - Alteração de status da candidatura (`Em Análise`, `Entrevista`, `Aprovado`, `Reprovado`) e inclusão de feedback personalizado.
3. **Banco de Talentos**:
   - Listagem consolidada de todos os candidatos que já aplicaram a vagas da plataforma para consultas rápidas de RH.

---

## 🔒 Segurança e Controle de Acesso

- **Restrição por Perfil**: O login é restrito a colaboradores com os perfis de `admin` ou `super-admin`. Usuários comuns que tentarem acessar receberão erro de permissão.
- **Handshake de Sessão**: Realiza a persistência segura do token JWT em localStorage para autenticação dos cabeçalhos das requisições GraphQL subsequentes.

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
   Acesse em: `http://localhost:3004`

---

*ECOA Carreiras Admin — Gestão centralizada de talentos e automação de recrutamento.*
