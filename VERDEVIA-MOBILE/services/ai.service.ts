import api from './api';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AnalysisLocation {
  latitude: number;
  longitude: number;
}

export interface EnvironmentalImageAnalysis {
  category: string;
  confidence: number;
  isEnvironmentalComplaint: boolean;
  detectedProblems: string[];
  description: string;
  riskLevel: RiskLevel;
  recommendedAction: string;
  authenticityStatus: 'authentic' | 'suspected_ai_or_edited' | 'inconclusive';
  authenticityConfidence: number;
  suspectedManipulation: boolean;
  authenticityMessage: string;
  model: string;
  provider: 'ollama';
}

export interface ImageAnalysisResult {
  requestId: string;
  status: 'completed';
  analysis: EnvironmentalImageAnalysis;
  analyzedAt: string;
  isFake: boolean;
  confidence: number;
  message: string;
  methods: Array<{ name: string; score: number }>;
}

export interface AnalyzeImagePayload {
  imageBase64: string;
  complaintText?: string;
  location: AnalysisLocation;
  requestId?: string;
}

const AIService = {
  analyzeImage: async (payload: AnalyzeImagePayload) => {
    const res = await api.post<ImageAnalysisResult>('/ai/analyze-image', payload);
    return withLegacyImageAnalysisFields(res.data);
  },

  chat: async (message: string, context?: string) => {
    const res = await api.post<string>('/ai/chat', { message, context });
    return res.data;
  },

  classify: async (imageUrl: string) => {
    const res = await api.get<string[]>('/ai/classify', { params: { imageUrl } });
    return res.data;
  }
};

export default AIService;

function withLegacyImageAnalysisFields(
  result: ImageAnalysisResult,
): ImageAnalysisResult {
  const analysis = result.analysis;
  const isFake = analysis.suspectedManipulation;

  return {
    ...result,
    isFake,
    confidence: isFake ? analysis.authenticityConfidence : analysis.confidence,
    message: isFake
      ? analysis.authenticityMessage ||
        'Imagem possivelmente gerada por IA ou com sinais de edição.'
      : analysis.isEnvironmentalComplaint
        ? analysis.description
        : 'A imagem não parece mostrar uma denúncia ambiental.',
    methods: [
      {
        name: `Categoria: ${analysis.category}`,
        score: analysis.confidence,
      },
      {
        name: `Autenticidade: ${analysis.authenticityStatus}`,
        score: analysis.authenticityConfidence,
      },
      {
        name: `Risco: ${analysis.riskLevel}`,
        score:
          analysis.riskLevel === 'high'
            ? 1
            : analysis.riskLevel === 'medium'
              ? 0.6
              : 0.3,
      },
    ],
  };
}
