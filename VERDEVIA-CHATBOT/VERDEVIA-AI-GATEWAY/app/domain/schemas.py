from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


Category = Literal[
    "descarte_irregular",
    "lixo_plastico",
    "esgoto",
    "poluicao_agua",
    "poluicao_ar",
    "queimadas",
    "entulho",
    "area_degradada",
    "outro",
]
RiskLevel = Literal["low", "medium", "high"]
AuthenticityStatus = Literal["authentic", "suspected_ai_or_edited", "inconclusive"]
AuthenticityClassification = Literal[
    "Muito provavelmente real",
    "Provavelmente real",
    "Inconclusiva",
    "Provavelmente gerada ou manipulada por IA",
    "Muito provavelmente gerada ou manipulada por IA",
]


class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class AnalyzeImageRequest(BaseModel):
    imageBase64: str = Field(..., min_length=20)
    complaintText: str = ""
    location: Location

    @field_validator("imageBase64")
    @classmethod
    def normalize_data_url(cls, value: str) -> str:
        stripped = value.strip()
        if "," in stripped and stripped.lower().startswith("data:image/"):
            return stripped.split(",", 1)[1]
        return stripped


class EnvironmentalAnalysis(BaseModel):
    category: Category
    confidence: float = Field(..., ge=0, le=1)
    isEnvironmentalComplaint: bool
    detectedProblems: list[str] = Field(default_factory=list)
    description: str = Field(..., min_length=3)
    riskLevel: RiskLevel
    recommendedAction: str = Field(..., min_length=3)
    authenticityStatus: AuthenticityStatus
    authenticityConfidence: float = Field(..., ge=0, le=1)
    authenticityClassification: AuthenticityClassification
    suspectedManipulation: bool
    authenticityMessage: str = Field(..., min_length=3)
    authenticityReport: str = Field(..., min_length=20)


class AnalyzeImageResponse(EnvironmentalAnalysis):
    model: str
    provider: Literal["ollama"] = "ollama"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1)


class RAGChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    context: str = ""
    history: list[ChatMessage] = Field(default_factory=list)
    documentIds: list[str] = Field(default_factory=list)
    allowWebSearch: bool = False


class RAGSource(BaseModel):
    documentId: str
    source: str
    contentType: str = "text/plain"
    chunk: int = 0
    priority: int = 2
    score: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class RAGChatResponse(BaseModel):
    answer: str
    sources: list[RAGSource] = Field(default_factory=list)
    model: str
    provider: Literal["ollama"] = "ollama"
    usedWebSearch: bool = False
    cacheHit: bool = False
    acceleration: str | None = None
    reasoning: str | None = None


class IngestedDocument(BaseModel):
    documentId: str
    filename: str
    contentType: str
    chunks: int
    deduplicated: bool = False
    modalities: list[str] = Field(default_factory=list)


class DocumentIngestResponse(BaseModel):
    documents: list[IngestedDocument]
    collection: str
    persistDir: str
