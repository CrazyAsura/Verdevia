import logging
import re
from collections import defaultdict
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
    reasoning: str
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
        raw_docs = self.engine.retrieve(request.message, request.documentIds)
        state["retrieved"] = self._select_coherent_sources(request.message, raw_docs)
        return state

    def _select_coherent_sources(self, query: str, docs: list[Document]) -> list[Document]:
        if not docs:
            return []

        ranked_docs = self._rank_documents(query, docs)
        if self._allows_multiple_sources(query):
            return ranked_docs[:settings.rag_top_k]

        primary_key = self._best_source_key(query, ranked_docs)
        selected = [doc for doc in ranked_docs if self._source_key(doc) == primary_key]
        return selected[:settings.rag_top_k]

    def _allows_multiple_sources(self, query: str) -> bool:
        normalized = query.lower()
        multi_source_terms = [
            "compare",
            "comparar",
            "comparacao",
            "comparação",
            "todos os arquivos",
            "todos os documentos",
            "entre os documentos",
            "entre os pdfs",
            "diferencas",
            "diferenças",
        ]
        return any(term in normalized for term in multi_source_terms)

    def _source_key(self, doc: Document) -> str:
        metadata = doc.metadata or {}
        return str(metadata.get("document_id") or metadata.get("source") or "fonte desconhecida")

    def _best_source_key(self, query: str, docs: list[Document]) -> str:
        grouped_scores = defaultdict(float)
        for rank, doc in enumerate(docs):
            grouped_scores[self._source_key(doc)] += self._document_score(query, doc, rank)

        return max(grouped_scores, key=grouped_scores.get)

    def _rank_documents(self, query: str, docs: list[Document]) -> list[Document]:
        if not docs:
            return []

        ranked = sorted(
            enumerate(docs),
            key=lambda doc_rank: self._document_score(query, doc_rank[1], doc_rank[0]),
            reverse=True,
        )
        return [doc for _, doc in ranked]

    def _document_score(self, query: str, doc: Document, rank: int) -> float:
        query_terms = self._tokenize(query)
        content_terms = self._tokenize(doc.page_content)
        metadata = doc.metadata or {}
        metadata_terms = self._tokenize(
            " ".join(
                str(value)
                for key, value in metadata.items()
                if key in {"source", "document_id", "content_type", "title", "page"}
            )
        )

        lexical_hits = len(query_terms & content_terms)
        metadata_hits = len(query_terms & metadata_terms)
        rank_weight = 1 / (rank + 1)
        length_penalty = 0.15 if len(doc.page_content.strip()) < 80 else 0
        return lexical_hits + (metadata_hits * 0.5) + rank_weight - length_penalty

    def _tokenize(self, text: str) -> set[str]:
        stopwords = {
            "a", "as", "com", "da", "de", "do", "dos", "e", "em", "na", "no", "o", "os",
            "para", "por", "que", "um", "uma"
        }
        return {
            token
            for token in re.findall(r"[a-zA-ZÀ-ÿ0-9_]{3,}", text.lower())
            if token not in stopwords
        }

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
            "Você é o chatbot VERDEVIA com arquitetura RAG multimodal. "
            "Mantenha uma linguagem acolhedora, educacional, clara e confiável. "
            "Responda em português do Brasil, seja preciso e cite os documentos usados. "
            "Priorize estritamente arquivos enviados pelo usuário e trechos recuperados. "
            "Se o contexto não responder, diga o que falta. Não invente fontes. "
            "Limite a resposta a 700 palavras, salvo pedido explícito."
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
                    temperature=settings.ollama_temperature,
                    top_p=settings.ollama_top_p,
                    repeat_penalty=settings.ollama_repeat_penalty,
                    num_predict=settings.ollama_num_predict,
                    num_ctx=settings.ollama_num_ctx,
                    keep_alive=settings.ollama_keep_alive,
                    timeout=settings.ollama_timeout_seconds,
                )
                response = llm.invoke(
                    [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
                )
                raw_answer = str(response.content)
                reasoning, clean_text = self._extract_reasoning_and_content(raw_answer)
                cleaned_answer = self._clean_response(clean_text)

                state["answer"] = cleaned_answer
                state["reasoning"] = reasoning
                state["model"] = model_name
                state["acceleration"] = self._acceleration_for(model_name)
                return state
            except Exception as exc:
                last_error = exc
                logger.warning("RAG model %s failed: %s", model_name, exc)

        logger.error("RAG LLM call failed. Falling back to direct context reading.")
        fallback_text = self._fallback_response_from_context(state, last_error or RuntimeError("LLM call failed"))
        state["answer"] = fallback_text
        state["reasoning"] = ""
        state["model"] = self.model_name
        state["acceleration"] = None
        return state

    def _fallback_response_from_context(self, state: RAGState, error: Exception) -> str:
        docs = state.get("retrieved", [])
        source_names = []
        evidence_lines = []
        sheet_lines = []

        for doc in docs:
            metadata = doc.metadata or {}
            source = str(metadata.get("source") or "").strip()
            if source and source not in source_names:
                source_names.append(source)

            for raw_line in doc.page_content.splitlines():
                line = raw_line.strip()
                if not line:
                    continue
                if line.startswith("aba=") or line.startswith("[Planilha:") or "Planilha:" in line:
                    sheet_lines.append(line)
                if (
                    line.startswith("Linhas analisadas:")
                    or line.startswith("Campo numérico")
                    or line.startswith("Campo categórico")
                    or line.startswith("- ")
                ):
                    evidence_lines.append(line)

        source_label = ", ".join(source_names[:3]) or "documentos indexados"
        sections = [
            "Não consegui acionar o modelo local agora, mas encontrei contexto indexado suficiente para uma leitura técnica inicial.",
            f"Arquivo analisado: {source_label}.",
        ]

        if sheet_lines:
            sections.append("Estrutura encontrada:\n" + "\n".join(f"- {line}" for line in sheet_lines[:8]))

        if evidence_lines:
            sections.append("Evidências extraídas:\n" + "\n".join(f"- {line}" for line in evidence_lines[:16]))
        else:
            sections.append(
                "Não encontrei estatísticas ou tabelas específicas no trecho recuperado."
            )

        sections.append(
            "Para uma interpretação narrativa mais completa, verifique se o Ollama/modelo local está ativo e tente novamente."
        )
        sections.append(f"Detalhe técnico: {error}")
        return "\n\n".join(sections)

    def _extract_reasoning_and_content(self, text: str) -> tuple[str, str]:
        think_pattern = re.compile(r"<think(?:ing)?>(.*?)</think(?:ing)?>", re.DOTALL | re.IGNORECASE)
        match = think_pattern.search(text)
        if match:
            reasoning = match.group(1).strip()
            content = think_pattern.sub("", text).strip()
            return reasoning, content

        open_think_pattern = re.compile(r"<think(?:ing)?>(.*)", re.DOTALL | re.IGNORECASE)
        match_open = open_think_pattern.search(text)
        if match_open:
            reasoning = match_open.group(1).strip()
            content = open_think_pattern.sub("", text).strip()
            return reasoning, content

        return "", text

    def _clean_response(self, response: str) -> str:
        text = response.strip()
        text = self._collapse_repeated_blocks(text)
        text = self._remove_repeated_sentences(text)
        text = self._remove_repeated_lines(text)
        text = self._normalize_unstable_casing(text)
        text = re.sub(r"([!?.,;:])\1{2,}", r"\1", text)
        text = re.sub(r"([A-Za-zÀ-ÿ])\1{4,}", r"\1\1\1", text)
        return text.strip()

    def _collapse_repeated_blocks(self, text: str) -> str:
        previous = None
        current = text

        while previous != current:
            previous = current
            current = re.sub(r"(.{24,240}?)\1+", r"\1", current, flags=re.DOTALL)

        return current

    def _remove_repeated_sentences(self, text: str) -> str:
        parts = re.split(r"(?<=[.!?])\s+", text)
        clean_parts = []
        last_sentence = None

        for part in parts:
            normalized = re.sub(r"\s+", " ", part.strip()).lower()
            if normalized and normalized == last_sentence:
                continue
            clean_parts.append(part)
            last_sentence = normalized

        return " ".join(clean_parts)

    def _remove_repeated_lines(self, text: str) -> str:
        clean_lines = []
        last_line = None
        repeat_count = 0

        for line in text.splitlines():
            normalized = re.sub(r"\s+", " ", line.strip()).lower()
            if normalized and normalized == last_line:
                repeat_count += 1
                if repeat_count >= 2:
                    continue
            else:
                repeat_count = 0
                last_line = normalized
            clean_lines.append(line)

        return "\n".join(clean_lines)

    def _normalize_unstable_casing(self, text: str) -> str:
        letters = [char for char in text if char.isalpha()]
        if len(letters) < 80:
            return text

        switches = sum(
            1
            for left, right in zip(letters, letters[1:])
            if left.islower() != right.islower()
        )
        switch_ratio = switches / max(len(letters) - 1, 1)

        if switch_ratio < 0.62:
            return text

        lowered = text.lower()
        lowered = re.sub(r"\beu\b", "Eu", lowered)
        return re.sub(
            r"(^|[.!?]\s+)([a-zà-ÿ])",
            lambda match: match.group(1) + match.group(2).upper(),
            lowered,
        )

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
            reasoning=state.get("reasoning", ""),
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
