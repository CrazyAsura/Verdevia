import { Injectable, Logger } from '@nestjs/common';
import type { JwtPayload } from '../../../common/security/jwt.strategy';
import { AccessService } from '../../access/access.service';
import { AiGatewayService } from './ai-gateway.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  constructor(private readonly aiGatewayService: AiGatewayService, private readonly accessService: AccessService) {}

  async generateChatResponse(message: string, context?: string, history: Array<{ role: string; content: string }> = [], documentIds: string[] = [], user?: JwtPayload): Promise<{ answer: string; blockedDocuments: Array<{ documentId: string; filename: string; reason: string }> }> {
    this.logger.log(`Processando mensagem do usuário com RAG: ${message}`);
    const role = user?.role ?? user?.roles?.[0];
    const { allowed, blocked } = await this.accessService.filterAllowedDocuments(documentIds, role);
    const answer = await this.aiGatewayService.generateChatResponse(message, context, history, allowed);
    return { answer, blockedDocuments: blocked.map((item) => ({ documentId: item.documentId, filename: item.filename, reason: item.blockReason ?? 'Seu nível de acesso não permite explicar este documento.' })) };
  }
}
