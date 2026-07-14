from typing import Any, Protocol

from langchain_core.documents import Document

from app.domain.schemas import RAGChatRequest, RAGChatResponse


class DocumentIngestionPort(Protocol):
    def ingest_bytes(
        self,
        filename: str,
        content: bytes,
        content_type: str | None = None,
    ) -> dict[str, Any]:
        """Persist, extract and index one uploaded document."""


class ContextRetrievalPort(Protocol):
    def retrieve(
        self,
        query: str,
        document_ids: list[str] | None = None,
        top_k: int | None = None,
    ) -> list[Document]:
        """Retrieve relevant context chunks from the vector store."""


class RAGChatPort(Protocol):
    def run(self, request: RAGChatRequest) -> RAGChatResponse:
        """Answer a chat request using the RAG context pipeline."""
