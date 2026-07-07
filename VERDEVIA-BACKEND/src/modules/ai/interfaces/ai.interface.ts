export interface AnalysisMethodResult {
  name: string;
  score: number;
}

export type EnvironmentalRiskLevel = 'low' | 'medium' | 'high';
export type ImageAuthenticityStatus =
  | 'authentic'
  | 'suspected_ai_or_edited'
  | 'inconclusive';

export interface AiAnalysisLocation {
  latitude: number;
  longitude: number;
}

export interface EnvironmentalImageAnalysis {
  category:
    | 'descarte_irregular'
    | 'lixo_plastico'
    | 'esgoto'
    | 'poluicao_agua'
    | 'poluicao_ar'
    | 'queimadas'
    | 'entulho'
    | 'area_degradada'
    | 'outro';
  confidence: number;
  isEnvironmentalComplaint: boolean;
  detectedProblems: string[];
  description: string;
  riskLevel: EnvironmentalRiskLevel;
  recommendedAction: string;
  authenticityStatus: ImageAuthenticityStatus;
  authenticityConfidence: number;
  suspectedManipulation: boolean;
  authenticityMessage: string;
  model: string;
  provider: 'ollama';
}

export interface ImageAnalysisRequest {
  imageBase64: string;
  complaintText?: string;
  location: AiAnalysisLocation;
  requestId?: string;
}

export interface ImageAnalysisResult {
  requestId: string;
  status: 'completed';
  analysis: EnvironmentalImageAnalysis;
  analyzedAt: string;
}

export interface AIService {
  analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult>;
  classifyImage(imageUrl: string): Promise<string[]>;
  generateChatResponse(message: string, context?: string): Promise<string>;
}
