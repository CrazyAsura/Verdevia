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

  async listDocuments(): Promise<{ documents: Array<{ documentId: string; filename: string; contentType: string; chunks: number; deduplicated: boolean; modalities: string[] }>; collection: string; persistDir?: string }> {
    const response = await fetch(`${this.baseUrl}/ai/rag/documents`);
    if (!response.ok) throw new BadGatewayException('Falha ao consultar documentos no serviço de IA.');
    return response.json() as Promise<{ documents: Array<{ documentId: string; filename: string; contentType: string; chunks: number; deduplicated: boolean; modalities: string[] }>; collection: string; persistDir?: string }>;
  }

  async uploadDocuments(files: any[]) {
    const form = new FormData();
    for (const file of files) form.append('files', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    const response = await fetch(`${this.baseUrl}/ai/rag/documents`, { method: 'POST', body: form });
    if (!response.ok) throw new BadGatewayException('Falha ao indexar documentos no serviço de IA.');
    return response.json() as Promise<{ documents: Array<{ documentId: string; filename: string; contentType: string; chunks: number; deduplicated: boolean; modalities: string[] }>; collection: string }>;
  }

  async generateChatResponse(message: string, context?: string, history: Array<{ role: string; content: string }> = [], documentIds: string[] = []): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      this.logger.log(`Enviando chat RAG para AI Gateway em ${this.baseUrl}`);

      const response = await fetch(`${this.baseUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: context ?? '',
          history,
          documentIds,
          allowWebSearch: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `AI Gateway chat respondeu ${response.status}: ${body}`,
        );
        throw new BadGatewayException(
          'Falha ao gerar resposta no serviço de IA.',
        );
      }

      const payload = (await response.json()) as { answer?: string };
      return payload.answer ?? '';
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`AI Gateway chat indisponível: ${errorMessage}`);
      throw new ServiceUnavailableException(
        'Serviço de IA indisponível no momento.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
