# Especificação: Chatbot RAG Multimodal VERDEVIA

## Objetivo funcional

O chatbot deve responder perguntas priorizando documentos enviados pelo usuário, usando ChromaDB como banco vetorial persistente, LangChain para ingestão/chunking/embeddings/retrieval e LangGraph para orquestrar cache, recuperação, montagem de contexto, inferência e validação da resposta.

## Ordem de contexto

1. Arquivos enviados pelo usuário e informados em `documentIds`.
2. Trechos recuperados no ChromaDB.
3. Memória recente enviada no payload.
4. Base persistente versionada no mesmo ChromaDB.
5. Web somente quando `allowWebSearch=true` e quando não houver evidência suficiente. A versão atual não chama web automaticamente.

## Conteúdos aceitos

PDF, DOCX, XLSX/XLSM/XLS, PPTX, Markdown, texto, código-fonte, CSV, JSON, XML e imagens. Imagens recebem metadados visuais e OCR quando o binário local do Tesseract estiver disponível.

## Critérios de aceitação

- Dado um upload de PDF ou DOCX, quando o usuário perguntar sobre seu conteúdo, a resposta deve usar os trechos do documento e retornar `sources`.
- Dado um documento já ingerido, quando ele for reenviado, a ingestão deve marcar `deduplicated=true` e evitar reindexação.
- Dado um `documentIds`, a recuperação deve consultar esses documentos antes da busca global no ChromaDB.
- Dado contexto suficiente nos documentos, `usedWebSearch` deve permanecer `false`.
- Dado `OLLAMA_MODEL=gemma4:e4b` e `DSPARK_ENABLED=true`, a resposta deve registrar `acceleration="dspark"`.

## Casos de teste

- Ingestão de texto simples com dois parágrafos e retorno de ao menos um chunk.
- Ingestão duplicada do mesmo arquivo e retorno do mesmo `documentId`.
- Chat com `documentIds` retornando fontes do documento priorizado.
- Chat repetido com mesmo payload retornando `cacheHit=true` na segunda chamada.
- Health check expondo modelo de embedding e `vectorStore=chromadb`.

## Validações automáticas recomendadas

- Testes unitários do `MultimodalExtractor` por extensão.
- Teste de integração com ChromaDB temporário.
- Teste de contrato dos endpoints `/ai/rag/ingest` e `/ai/chat`.
- Smoke test com Ollama desativado validando erro 502 controlado.

## Decisões técnicas

- O cache semântico inicial usa chave normalizada de mensagem, contexto e documentos; pode evoluir para cache por embedding.
- O versionamento incremental usa hash SHA-256 do arquivo como identidade estável.
- O limite `RAG_MAX_CONTEXT_CHARS` evita prompts grandes e reduz tokens.
- O fallback de imagem sem OCR preserva metadados visuais para futura análise multimodal.
