import { Module } from '@nestjs/common';
import { ImageAnalysisService } from './services/image-analysis.service';
import { ChatbotService } from './services/chatbot.service';
import { AIController } from './controllers/ai.controller';
import { AdminController } from './controllers/admin.controller';
import { AiGatewayService } from './services/ai-gateway.service';
import { UsageMetricsService } from './services/usage-metrics.service';
import { AiWebSocketGateway } from './gateways/ai-websocket.gateway';
import { AccessModule } from '../access/access.module';
import { SecurityModule } from '../../common/security/security.module';

@Module({
  imports: [AccessModule, SecurityModule],
  providers: [
    AiGatewayService,
    AiWebSocketGateway,
    ImageAnalysisService,
    ChatbotService,
    UsageMetricsService,
  ],
  controllers: [AIController, AdminController],
  exports: [AiGatewayService, ImageAnalysisService, ChatbotService, UsageMetricsService],
})
export class AIModule {}
