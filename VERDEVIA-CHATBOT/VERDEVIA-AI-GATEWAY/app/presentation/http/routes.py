import logging
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.domain.schemas import (
    AnalyzeImageRequest,
    AnalyzeImageResponse,
    DocumentIngestResponse,
    IngestedDocument,
    RAGChatRequest,
    RAGChatResponse,
)
from app.modules.image_analysis.domain.ports import ImageAnalysisPort
from app.modules.rag.domain.ports import DocumentIngestionPort, RAGChatPort

logger = logging.getLogger(__name__)


def build_ai_router(
    analysis_graph: ImageAnalysisPort,
    rag_engine: DocumentIngestionPort,
    rag_graph: RAGChatPort,
) -> APIRouter:
    router = APIRouter()

    @router.get("/health")
    def health() -> dict[str, str]:
        return {
            "status": "ok",
            "provider": "ollama",
            "model": settings.ollama_model,
            "embeddingModel": settings.ollama_embedding_model,
            "vectorStore": "chromadb",
        }

    @router.post("/ai/analyze-image", response_model=AnalyzeImageResponse)
    def analyze_image(payload: AnalyzeImageRequest) -> AnalyzeImageResponse:
        try:
            return analysis_graph.run(payload)
        except Exception as exc:
            logger.exception("Image analysis failed")
            raise HTTPException(
                status_code=502,
                detail=f"Falha ao analisar imagem com Ollama: {exc}",
            ) from exc

    @router.post("/ai/rag/ingest", response_model=DocumentIngestResponse)
    async def ingest_documents(
        files: Annotated[
            list[UploadFile],
            File(description="Documentos para indexação RAG multimodal"),
        ],
    ) -> DocumentIngestResponse:
        try:
            documents: list[IngestedDocument] = []
            for file in files:
                content = await file.read()
                record = rag_engine.ingest_bytes(
                    filename=file.filename or "documento",
                    content=content,
                    content_type=file.content_type,
                )
                documents.append(IngestedDocument.model_validate(record))
            return DocumentIngestResponse(
                documents=documents,
                collection=settings.rag_collection_name,
                persistDir=settings.chroma_persist_dir,
            )
        except Exception as exc:
            logger.exception("Document ingestion failed")
            raise HTTPException(
                status_code=502,
                detail=f"Falha ao indexar documentos no RAG: {exc}",
            ) from exc

    @router.get("/ai/rag/documents", response_model=DocumentIngestResponse)
    def list_documents() -> DocumentIngestResponse:
        return DocumentIngestResponse(
            documents=[
                IngestedDocument.model_validate(record)
                for record in rag_engine.list_documents()
            ],
            collection=settings.rag_collection_name,
            persistDir=settings.chroma_persist_dir,
        )

    @router.post("/ai/chat", response_model=RAGChatResponse)
    def rag_chat(payload: RAGChatRequest) -> RAGChatResponse:
        try:
            return rag_graph.run(payload)
        except Exception as exc:
            logger.exception("RAG chat failed")
            raise HTTPException(
                status_code=502,
                detail=f"Falha ao gerar resposta RAG com Ollama: {exc}",
            ) from exc

    return router
