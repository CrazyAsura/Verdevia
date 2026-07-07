# Verdevia AI Gateway

Microserviço FastAPI que consome a API do Ollama via LangChain + LangGraph.

## Rodar localmente

```bash
cd VERDEVIA-AI-GATEWAY
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
OLLAMA_FALLBACK_MODEL=gemma4:e2b
AI_GATEWAY_LOG_LEVEL=INFO
```

## Request

```bash
curl -X POST http://localhost:8000/ai/analyze-image \
  -H "Content-Type: application/json" \
  -d "{\"imageBase64\":\"/9j/4AAQSkZJRgABAQ...\",\"complaintText\":\"Lixo acumulado perto do rio\",\"location\":{\"latitude\":-10,\"longitude\":-37}}"
```
