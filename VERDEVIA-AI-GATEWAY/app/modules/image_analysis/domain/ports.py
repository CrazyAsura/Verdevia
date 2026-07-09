from typing import Protocol

from app.domain.schemas import AnalyzeImageRequest, AnalyzeImageResponse


class ImageAnalysisPort(Protocol):
    def run(self, request: AnalyzeImageRequest) -> AnalyzeImageResponse:
        """Analyze an environmental image and return the model contract."""
