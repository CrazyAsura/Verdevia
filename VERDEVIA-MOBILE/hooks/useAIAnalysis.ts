import { useState } from 'react';
import AIService, {
  AnalysisLocation,
  ImageAnalysisResult,
} from '@/services/ai.service';
import { getOptimalModelConfig } from '@/utils/device';

interface AnalyzeImageOptions {
  complaintText?: string;
  location: AnalysisLocation;
  requestId?: string;
}

export function useAIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (
    imageUriOrBase64: string,
    options?: AnalyzeImageOptions,
  ) => {
    setAnalyzing(true);
    setError(null);
    try {
      // Aplica otimização baseada no dispositivo antes de enviar/analisar
      const config = getOptimalModelConfig();
      console.log(`Aplicando configurações otimizadas:`, config);
      
      const data = await AIService.analyzeImage({
        imageBase64: await normalizeImageBase64(imageUriOrBase64),
        complaintText: options?.complaintText,
        location: options?.location ?? { latitude: 0, longitude: 0 },
        requestId: options?.requestId,
      });
      setResult(data);
      return data;
    } catch (err) {
      setError('Falha na análise de IA. Tente novamente.');
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzeImage,
    analyzing,
    result,
    error,
    config: getOptimalModelConfig()
  };
}

async function normalizeImageBase64(value: string): Promise<string> {
  if (value.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(value)) {
    return value;
  }

  const response = await fetch(value);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}
