import json
import logging
import re
from typing import Any, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_ollama import ChatOllama
from langgraph.graph import END, StateGraph
from pydantic import ValidationError

from app.core.config import settings
from app.domain.schemas import (
    AnalyzeImageRequest,
    AnalyzeImageResponse,
    EnvironmentalAnalysis,
)
from app.modules.image_analysis.domain.prompt import CATEGORIES, SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class AnalysisState(TypedDict, total=False):
    request: AnalyzeImageRequest
    context: str
    raw_response: str
    parsed: EnvironmentalAnalysis
    response: AnalyzeImageResponse
    model: str


class EnvironmentalAnalysisGraph:
    def __init__(self) -> None:
        self.model_name = settings.ollama_model
        self.fallback_model_name = settings.ollama_fallback_model
        self.graph = self._build_graph()

    def run(self, request: AnalyzeImageRequest) -> AnalyzeImageResponse:
        result = self.graph.invoke({"request": request, "model": self.model_name})
        return result["response"]

    def _build_graph(self):
        graph = StateGraph(AnalysisState)
        graph.add_node("prepare_context", self._prepare_context)
        graph.add_node("analyze_image", self._analyze_image)
        graph.add_node("validate_response", self._validate_response)
        graph.add_node("classify_risk", self._classify_risk)
        graph.add_node("finalize", self._finalize)

        graph.set_entry_point("prepare_context")
        graph.add_edge("prepare_context", "analyze_image")
        graph.add_edge("analyze_image", "validate_response")
        graph.add_edge("validate_response", "classify_risk")
        graph.add_edge("classify_risk", "finalize")
        graph.add_edge("finalize", END)
        return graph.compile()

    def _prepare_context(self, state: AnalysisState) -> AnalysisState:
        request = state["request"]
        state["context"] = (
            "Contexto RAG inicial ECOA:\n"
            f"- Categorias ambientais aceitas: {', '.join(CATEGORIES)}.\n"
            "- Classifique apenas problemas ambientais visíveis.\n"
            "- Verifique sinais visíveis de imagem gerada por IA ou edição antes de aprovar o envio.\n"
            "- Use risco high para perigo sanitário, ambiental ou humano evidente.\n"
            "- Use risco medium para problema claro sem perigo imediato.\n"
            "- Use risco low para evidência leve, ambígua ou incerta.\n"
            f"- Texto da denúncia: {request.complaintText or 'não informado'}.\n"
            f"- Localização: latitude {request.location.latitude}, longitude {request.location.longitude}."
        )
        return state

    def _analyze_image(self, state: AnalysisState) -> AnalysisState:
        request = state["request"]
        prompt = (
            f"{state['context']}\n\n"
            "Analise a imagem anexada e responda exatamente no formato JSON obrigatório."
        )

        last_error: Exception | None = None
        for model_name in self._candidate_models():
            try:
                logger.info("Calling Ollama model %s", model_name)
                llm = ChatOllama(
                    model=model_name,
                    base_url=settings.ollama_base_url,
                    temperature=0,
                    format="json",
                )
                message = HumanMessage(
                    content=[
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": f"data:image/jpeg;base64,{request.imageBase64}",
                        },
                    ]
                )
                response = llm.invoke([SystemMessage(content=SYSTEM_PROMPT), message])
                state["raw_response"] = str(response.content)
                state["model"] = model_name
                return state
            except Exception as exc:
                last_error = exc
                logger.warning("Ollama model %s failed: %s", model_name, exc)

        raise RuntimeError(f"Ollama analysis failed: {last_error}")

    def _validate_response(self, state: AnalysisState) -> AnalysisState:
        raw = state.get("raw_response", "")
        payload = self._extract_json(raw)
        try:
            state["parsed"] = EnvironmentalAnalysis.model_validate(payload)
            return state
        except ValidationError as exc:
            logger.warning("Invalid model response, applying guarded fallback: %s", exc)
            state["parsed"] = self._fallback_analysis(payload)
            return state

    def _classify_risk(self, state: AnalysisState) -> AnalysisState:
        parsed = state["parsed"]
        problems = " ".join(parsed.detectedProblems).lower()
        description = parsed.description.lower()
        evidence = f"{problems} {description}"

        if any(term in evidence for term in ["sanitário", "esgoto", "fumaça", "queimada", "risco humano"]):
            parsed.riskLevel = "high"
        elif parsed.isEnvironmentalComplaint and parsed.riskLevel not in ("medium", "high"):
            parsed.riskLevel = "medium"
        elif not parsed.isEnvironmentalComplaint:
            parsed.riskLevel = "low"

        state["parsed"] = parsed
        return state

    def _finalize(self, state: AnalysisState) -> AnalysisState:
        parsed = state["parsed"]
        state["response"] = AnalyzeImageResponse(
            **parsed.model_dump(),
            model=state.get("model", self.model_name),
            provider="ollama",
        )
        return state

    def _candidate_models(self) -> list[str]:
        candidates = [self.model_name, self.fallback_model_name]
        return list(dict.fromkeys([model for model in candidates if model]))

    @staticmethod
    def _extract_json(raw: str) -> dict[str, Any]:
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))

    @staticmethod
    def _fallback_analysis(payload: dict[str, Any]) -> EnvironmentalAnalysis:
        category = payload.get("category")
        if category not in CATEGORIES:
            category = "outro"

        confidence = payload.get("confidence", 0.3)
        try:
            confidence = max(0, min(1, float(confidence)))
        except (TypeError, ValueError):
            confidence = 0.3

        is_complaint = bool(payload.get("isEnvironmentalComplaint", False))
        problems = payload.get("detectedProblems")
        if not isinstance(problems, list):
            problems = ["problema ambiental não validado"] if is_complaint else []

        risk = payload.get("riskLevel")
        if risk not in ("low", "medium", "high"):
            risk = "medium" if is_complaint else "low"

        authenticity_status = payload.get("authenticityStatus")
        if authenticity_status not in ("authentic", "suspected_ai_or_edited", "inconclusive"):
            authenticity_status = "inconclusive"

        authenticity_confidence = payload.get("authenticityConfidence", 0.3)
        try:
            authenticity_confidence = max(0, min(1, float(authenticity_confidence)))
        except (TypeError, ValueError):
            authenticity_confidence = 0.3

        authenticity_classification = payload.get("authenticityClassification")
        valid_classifications = {
            "Muito provavelmente real",
            "Provavelmente real",
            "Inconclusiva",
            "Provavelmente gerada ou manipulada por IA",
            "Muito provavelmente gerada ou manipulada por IA",
        }
        if authenticity_classification not in valid_classifications:
            if authenticity_status == "authentic" and authenticity_confidence >= 0.75:
                authenticity_classification = "Provavelmente real"
            elif authenticity_status == "suspected_ai_or_edited" and authenticity_confidence >= 0.75:
                authenticity_classification = "Provavelmente gerada ou manipulada por IA"
            else:
                authenticity_classification = "Inconclusiva"

        suspected_manipulation = bool(payload.get("suspectedManipulation", False))
        if authenticity_status == "suspected_ai_or_edited":
            suspected_manipulation = True

        authenticity_report = str(payload.get("authenticityReport") or "").strip()
        if not authenticity_report:
            confidence_percent = round(authenticity_confidence * 100)
            authenticity_report = (
                "Resumo Executivo\n"
                f"* Classificação: {authenticity_classification}\n"
                f"* Confiança: {confidence_percent}%\n"
                "* Principais evidências: evidências insuficientes para uma conclusão forte.\n\n"
                "Análise Técnica\n"
                "* Evidências que favorecem autenticidade: não identificadas com segurança.\n"
                "* Evidências que sugerem manipulação: não identificadas com segurança.\n"
                "* Inconsistências encontradas: nenhuma inconsistência conclusiva observável.\n"
                "* Limitações da análise: metadados ausentes ou não informados; análise baseada apenas na imagem.\n\n"
                "Conclusão\n"
                "A classificação foi atribuída com base nas evidências disponíveis. Uma imagem, por si só, "
                "nem sempre permite confirmar autenticidade; recomenda-se verificar a origem do arquivo, "
                "comparar com outras versões e realizar análise forense especializada quando necessário."
            )

        return EnvironmentalAnalysis(
            category=category,
            confidence=confidence,
            isEnvironmentalComplaint=is_complaint,
            detectedProblems=[str(problem) for problem in problems],
            description=str(payload.get("description") or "Análise inconclusiva da imagem."),
            riskLevel=risk,
            recommendedAction=str(
                payload.get("recommendedAction")
                or "Encaminhar para revisão manual da equipe ambiental."
            ),
            authenticityStatus=authenticity_status,
            authenticityConfidence=authenticity_confidence,
            authenticityClassification=authenticity_classification,
            suspectedManipulation=suspected_manipulation,
            authenticityMessage=str(
                payload.get("authenticityMessage")
                or "Não foi possível confirmar a autenticidade da imagem."
            ),
            authenticityReport=authenticity_report,
        )
