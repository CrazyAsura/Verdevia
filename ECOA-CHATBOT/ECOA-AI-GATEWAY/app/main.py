import logging

from fastapi import FastAPI

from app.core.config import settings
from app.modules.image_analysis.application.analysis_graph import (
    EnvironmentalAnalysisGraph,
)
from app.modules.rag.application.rag_chat_graph import RAGChatGraph
from app.modules.rag.infrastructure.rag_engine import RAGEngine
from app.presentation.http.routes import build_ai_router

logging.basicConfig(level=settings.ai_gateway_log_level.upper())


def create_app() -> FastAPI:
    app = FastAPI(title="ECOA AI Gateway", version="1.0.0")
    rag_engine = RAGEngine()
    app.include_router(
        build_ai_router(
            analysis_graph=EnvironmentalAnalysisGraph(),
            rag_engine=rag_engine,
            rag_graph=RAGChatGraph(rag_engine),
        )
    )
    return app


app = create_app()
