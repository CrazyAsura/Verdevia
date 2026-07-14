import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ImageAnalysisService } from '@/modules/ai/services/image-analysis.service';
import { ChatbotService } from '@/modules/ai/services/chatbot.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';
import { RequirePlanFeatures } from '../../subscriptions/decorators/require-plan.decorator';
import { PlanAccessGuard } from '../../subscriptions/guards/plan-access.guard';
import { AnalyzeImageDto } from '../dto/analyze-image.dto';

@ApiTags('AI-Advanced')
@Controller('ai')
export class AIController {
  constructor(
    private readonly imageService: ImageAnalysisService,
    private readonly chatbotService: ChatbotService,
  ) {}

  @Post('analyze-image')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('ai:analyze-image')
  @ApiOperation({
    summary: 'Analisar denúncia ambiental por imagem com IA',
  })
  analyzeImage(@Body() dto: AnalyzeImageDto) {
    return this.imageService.analyzeImage(dto);
  }

  @Post('chat')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('ai:chat')
  @ApiOperation({ summary: 'Chatbot contextual FLAN-T5' })
  chat(@Body('message') message: string, @Body('context') context?: string) {
    return this.chatbotService.generateChatResponse(message, context);
  }

  @Get('classify')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('ai:classify')
  @ApiOperation({ summary: 'Classificacao zero-shot de categorias ambientais' })
  classify(@Query('imageUrl') imageUrl: string) {
    return this.imageService.classifyImage(imageUrl);
  }
}
