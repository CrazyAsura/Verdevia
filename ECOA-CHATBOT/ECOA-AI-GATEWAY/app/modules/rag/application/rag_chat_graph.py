import logging
from typing import TypedDict

from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from langgraph.graph import END, StateGraph

from app.core.config import settings
from app.domain.schemas import RAGChatRequest, RAGChatResponse, RAGSource
from app.modules.rag.infrastructure.rag_engine import RAGEngine

logger = logging.getLogger(__name__)


class RAGState(TypedDict, total=False):
    request: RAGChatRequest
    retrieved: list[Document]
    context: str
    answer: str
    response: RAGChatResponse
    cache_key: str
    cache_hit: bool
    model: str
    acceleration: str | None


class RAGChatGraph:
    def __init__(self, engine: RAGEngine) -> None:
        self.engine = engine
        self.model_name = settings.ollama_model
        self.fallback_model_name = settings.ollama_fallback_model
        self.graph = self._build_graph()

    def run(self, request: RAGChatRequest) -> RAGChatResponse:
        result = self.graph.invoke({"request": request, "model": self.model_name})
        return result["response"]

    def _build_graph(self):
        graph = StateGraph(RAGState)
        graph.add_node("check_cache", self._check_cache)
        graph.add_node("retrieve_context", self._retrieve_context)
        graph.add_node("assemble_context", self._assemble_context)
        graph.add_node("answer", self._answer)
        graph.add_node("finalize", self._finalize)

        graph.set_entry_point("check_cache")
        graph.add_conditional_edges(
            "check_cache",
            self._route_after_cache,
            {"hit": "finalize", "miss": "retrieve_context"},
        )
        graph.add_edge("retrieve_context", "assemble_context")
        graph.add_edge("assemble_context", "answer")
        graph.add_edge("answer", "finalize")
        graph.add_edge("finalize", END)
        return graph.compile()

    def _check_cache(self, state: RAGState) -> RAGState:
        request = state["request"]
        cache_key = self.engine.cache_key(request.message, request.context, request.documentIds)
        cached = self.engine.response_cache.get(cache_key)
        state["cache_key"] = cache_key
        if cached:
            state["response"] = cached
            state["cache_hit"] = True
        else:
            state["cache_hit"] = False
        return state

    @staticmethod
    def _route_after_cache(state: RAGState) -> str:
        return "hit" if state.get("cache_hit") else "miss"

    def _retrieve_context(self, state: RAGState) -> RAGState:
        request = state["request"]
        state["retrieved"] = self.engine.retrieve(request.message, request.documentIds)
        return state

    def _assemble_context(self, state: RAGState) -> RAGState:
        request = state["request"]
        retrieved_blocks = []
        for index, doc in enumerate(state.get("retrieved", []), start=1):
            metadata = doc.metadata
            retrieved_blocks.append(
                "\n".join(
                    [
                        f"[Fonte {index}]",
                        f"arquivo: {metadata.get('source', 'desconhecido')}",
                        f"documentId: {metadata.get('document_id', '')}",
                        f"chunk: {metadata.get('chunk', 0)}",
                        f"modalidades: {metadata.get('modalities', 'text')}",
                        doc.page_content,
                    ]
                )
            )

        memory = "\n".join(
            f"{message.role}: {message.content}" for message in request.history[-6:]
        )
        context_parts = [
            "Ordem obrigatória de contexto: arquivos enviados, ChromaDB, memória, base persistente, web apenas se autorizado.",
            "Não use pesquisa externa quando os documentos recuperados responderem à pergunta.",
            request.context,
            "\n\n".join(retrieved_blocks),
            f"Memória recente:\n{memory}" if memory else "",
        ]
        context = "\n\n".join(part for part in context_parts if part.strip())
        state["context"] = context[: settings.rag_max_context_chars]
        return state

    def _answer(self, state: RAGState) -> RAGState:
        request = state["request"]
        system_prompt = (
            "Você é o chatbot ECOA com arquitetura RAG multimodal. "
            "Responda em português do Brasil, seja preciso e cite os documentos usados. "
            "Priorize estritamente arquivos enviados pelo usuário e trechos recuperados. "
            "Se o contexto não responder, diga o que falta. Não invente fontes."
        )
        user_prompt = (
            f"Pergunta do usuário:\n{request.message}\n\n"
            f"Contexto recuperado:\n{state.get('context', '')}\n\n"
            "Gere uma resposta objetiva com uma seção curta de referências quando houver fontes."
        )

        last_error: Exception | None = None
        for model_name in self._candidate_models():
            try:
                logger.info("Calling RAG Ollama model %s", model_name)
                llm = ChatOllama(
                    model=model_name,
                    base_url=settings.ollama_base_url,
                    temperature=0.1,
                    num_predict=700,
                )
                response = llm.invoke(
                    [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
                )
                state["answer"] = str(response.content)
                state["model"] = model_name
                state["acceleration"] = self._acceleration_for(model_name)
                return state
            except Exception as exc:
                last_error = exc
                logger.warning("RAG model %s failed: %s", model_name, exc)

        raise RuntimeError(f"RAG chat failed: {last_error}")

    def _finalize(self, state: RAGState) -> RAGState:
        if state.get("cache_hit") and "response" in state:
            cached = state["response"]
            state["response"] = cached.model_copy(update={"cacheHit": True})
            return state

        sources = [
            RAGSource(
                documentId=str(doc.metadata.get("document_id", "")),
                source=str(doc.metadata.get("source", "")),
                contentType=str(doc.metadata.get("content_type", "text/plain")),
                chunk=int(doc.metadata.get("chunk", 0)),
                priority=int(doc.metadata.get("source_priority", 2)),
                metadata={
                    "modalities": doc.metadata.get("modalities", "text"),
                    "scope": doc.metadata.get("source_scope", "vector"),
                },
            )
            for doc in state.get("retrieved", [])
        ]
        response = RAGChatResponse(
            answer=state.get("answer", ""),
            sources=sources,
            model=state.get("model", self.model_name),
            usedWebSearch=False,
            cacheHit=False,
            acceleration=state.get("acceleration"),
        )
        self.engine.response_cache.set(state["cache_key"], response)
        state["response"] = response
        return state

    def _candidate_models(self) -> list[str]:
        candidates = [self.model_name, self.fallback_model_name]
        return list(dict.fromkeys([model for model in candidates if model]))

    @staticmethod
    def _acceleration_for(model_name: str) -> str | None:
        if settings.dspark_enabled and model_name.lower() == "gemma4:e4b":
            return "dspark"
        return None
