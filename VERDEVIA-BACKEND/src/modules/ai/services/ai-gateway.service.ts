import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EnvironmentalImageAnalysis,
  ImageAnalysisRequest,
} from '../interfaces/ai.interface';

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'AI_GATEWAY_URL',
      'http://localhost:8000',
    );
    this.timeoutMs = Number(
      this.configService.get<string>('AI_GATEWAY_TIMEOUT_MS', '120000'),
    );
  }

  async analyzeImage(
    request: ImageAnalysisRequest,
  ): Promise<EnvironmentalImageAnalysis> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      this.logger.log(
        `Enviando análise ${request.requestId} para AI Gateway em ${this.baseUrl}`,
      );

      const response = await fetch(`${this.baseUrl}/ai/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: request.imageBase64,
          complaintText: request.complaintText ?? '',
          location: request.location,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `AI Gateway respondeu ${response.status} para ${request.requestId}: ${body}`,
        );
        throw new BadGatewayException(
          'Falha ao analisar imagem no serviço de IA.',
        );
      }

      return (await response.json()) as EnvironmentalImageAnalysis;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `AI Gateway indisponível para ${request.requestId}: ${message}`,
      );
      throw new ServiceUnavailableException(
        'Serviço de IA indisponível no momento.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
