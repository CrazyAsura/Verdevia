from typing import Literal

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
    suspectedManipulation: bool
    authenticityMessage: str = Field(..., min_length=3)


class AnalyzeImageResponse(EnvironmentalAnalysis):
    model: str
    provider: Literal["ollama"] = "ollama"
