import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import {
  AIService,
  ImageAnalysisRequest,
  ImageAnalysisResult,
} from '../interfaces/ai.interface';
import { AiGatewayService } from './ai-gateway.service';
import { AiWebSocketGateway } from '../gateways/ai-websocket.gateway';
import { AiAnalysisEvent } from '../enums/ai-analysis-event.enum';

@Injectable()
export class ImageAnalysisService {
  private readonly logger = new Logger(ImageAnalysisService.name);

  constructor(
    private readonly aiGatewayService: AiGatewayService,
    private readonly aiWebSocketGateway: AiWebSocketGateway,
  ) {}

  async analyzeImage(
    request: ImageAnalysisRequest,
  ): Promise<ImageAnalysisResult> {
    const requestId = request.requestId || randomUUID();
    const startedAt = new Date().toISOString();

    this.logger.log(`Iniciando análise ambiental ${requestId}`);
    this.aiWebSocketGateway.emitAnalysisEvent(AiAnalysisEvent.Started, requestId, {
      status: 'started',
      startedAt,
    });

    try {
      this.aiWebSocketGateway.emitAnalysisEvent(
        AiAnalysisEvent.Processing,
        requestId,
        {
          status: 'processing',
          message: 'Imagem enviada ao microserviço de IA.',
        },
      );

      const analysis = await this.aiGatewayService.analyzeImage({
        ...request,
        requestId,
      });

      const result: ImageAnalysisResult = {
        requestId,
        status: 'completed',
        analysis,
        analyzedAt: new Date().toISOString(),
      };

      this.aiWebSocketGateway.emitAnalysisEvent(
        AiAnalysisEvent.Completed,
        requestId,
        {
          status: 'completed',
          analysis,
        },
      );

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha na análise ambiental ${requestId}: ${message}`);
      this.aiWebSocketGateway.emitAnalysisEvent(AiAnalysisEvent.Failed, requestId, {
        status: 'failed',
        message,
      });
      throw error;
    }
  }

  async classifyImage(_imageUrl?: string): Promise<string[]> {
    return [
      'descarte_irregular',
      'lixo_plastico',
      'esgoto',
      'poluicao_agua',
      'poluicao_ar',
      'queimadas',
      'entulho',
      'area_degradada',
      'outro',
    ];
  }
}
