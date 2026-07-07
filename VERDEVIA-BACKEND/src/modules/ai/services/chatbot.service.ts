import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  async generateChatResponse(
    message: string,
    context?: string,
  ): Promise<string> {
    this.logger.log(`Processando mensagem do usuário com FLAN-T5: ${message}`);

    // Simulação de resposta contextual de IA
    const lowercaseMsg = message.toLowerCase();

    if (lowercaseMsg.includes('reciclagem')) {
      return 'Para reciclar corretamente, separe plásticos, papéis, metais e vidros. No nosso app, você pode ver os pontos de coleta mais próximos na aba de mapas.';
    }

    if (lowercaseMsg.includes('denúncia') || lowercaseMsg.includes('queixa')) {
      return 'Você pode realizar uma denúncia ambiental tirando uma foto do local. Nossa IA analisará a autenticidade e classificará o tipo de poluição automaticamente.';
    }

    return 'Olá! Sou o assistente VERDEVIA. Como posso ajudar você hoje com questões ambientais ou sustentabilidade?';
  }
}
