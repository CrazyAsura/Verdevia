import { Injectable, Logger } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private readonly aiGatewayService: AiGatewayService) {}

  async generateChatResponse(
    message: string,
    context?: string,
  ): Promise<string> {
    this.logger.log(`Processando mensagem do usuário com RAG: ${message}`);
    return this.aiGatewayService.generateChatResponse(message, context);
  }
}
