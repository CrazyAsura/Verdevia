import logging

from fastapi import FastAPI, HTTPException

from app.config import settings
from app.graph import EnvironmentalAnalysisGraph
from app.schemas import AnalyzeImageRequest, AnalyzeImageResponse

logging.basicConfig(level=settings.ai_gateway_log_level.upper())
logger = logging.getLogger(__name__)

app = FastAPI(title="VERDEVIA AI Gateway", version="1.0.0")
analysis_graph = EnvironmentalAnalysisGraph()


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "provider": "ollama",
        "model": settings.ollama_model,
    }


@app.post("/ai/analyze-image", response_model=AnalyzeImageResponse)
def analyze_image(payload: AnalyzeImageRequest) -> AnalyzeImageResponse:
    try:
        return analysis_graph.run(payload)
    except Exception as exc:
        logger.exception("Image analysis failed")
        raise HTTPException(
            status_code=502,
            detail=f"Falha ao analisar imagem com Ollama: {exc}",
        ) from exc
