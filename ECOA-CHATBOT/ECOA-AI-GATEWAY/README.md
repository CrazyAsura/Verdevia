# ECOA AI Gateway

Microserviço FastAPI que consome a API do Ollama via LangChain + LangGraph e expõe RAG multimodal com ChromaDB.

## Rodar localmente

```bash
cd ECOA-AI-GATEWAY
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Com Docker Compose, suba pelo diretório raiz:

```bash
docker compose up --build fastapi-ai-gateway backend nginx
```

Quando o FastAPI roda em Docker e o Ollama está instalado no host, configure `OLLAMA_BASE_URL=http://host.docker.internal:11434`.

## Variáveis

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma:e2b
OLLAMA_FALLBACK_MODEL=gemma4:e4b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
AI_GATEWAY_LOG_LEVEL=INFO
CHROMA_PERSIST_DIR=./data/chroma
RAG_UPLOAD_DIR=./data/uploads
RAG_COLLECTION_NAME=ECOA_rag
RAG_TOP_K=6
RAG_MAX_CONTEXT_CHARS=9000
DSPARK_ENABLED=true
```

## Request

```bash
curl -X POST http://localhost:8000/ai/analyze-image \
  -H "Content-Type: application/json" \
  -d "{\"imageBase64\":\"/9j/4AAQSkZJRgABAQ...\",\"complaintText\":\"Lixo acumulado perto do rio\",\"location\":{\"latitude\":-10,\"longitude\":-37}}"
```

## RAG multimodal

Especificação técnica: [docs/chatbot-rag-spec.md](docs/chatbot-rag-spec.md).

Ingerir documentos:

```bash
curl -X POST http://localhost:8000/ai/rag/ingest \
  -F "files=@politica.pdf" \
  -F "files=@planilha.xlsx"
```

Conversar com prioridade para documentos enviados:

```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Resuma os riscos ambientais citados\", \"documentIds\":[\"DOCUMENT_ID\"]}"
```

O fluxo consulta arquivos enviados, ChromaDB, memória da conversa e base persistente antes de qualquer pesquisa externa. A implementação atual não faz web search automática.

## Arquitetura

O gateway segue uma organização modular com inspiração hexagonal:

- `app/domain`: contratos de dados compartilhados entre módulos.
- `app/core`: configuração e composição transversal.
- `app/modules/<modulo>/domain`: regras, prompts e portas do módulo.
- `app/modules/<modulo>/application`: orquestração de caso de uso com LangGraph.
- `app/modules/<modulo>/infrastructure`: adapters concretos, como ChromaDB, extratores e cache.
- `app/presentation/http`: adapters HTTP FastAPI.
- `app/main.py`: composition root que instancia implementações concretas e conecta portas aos adapters.

Os arquivos antigos (`app/graph.py`, `app/rag.py`, `app/schemas.py`, etc.) permanecem como wrappers de compatibilidade para imports legados.
