import { Module } from '@nestjs/common';
import { ImageAnalysisService } from './services/image-analysis.service';
import { ChatbotService } from './services/chatbot.service';
import { AIController } from './controllers/ai.controller';
import { AiGatewayService } from './services/ai-gateway.service';
import { AiWebSocketGateway } from './gateways/ai-websocket.gateway';

@Module({
  providers: [
    AiGatewayService,
    AiWebSocketGateway,
    ImageAnalysisService,
    ChatbotService,
  ],
  controllers: [AIController],
  exports: [AiGatewayService, ImageAnalysisService, ChatbotService],
})
export class AIModule {}
