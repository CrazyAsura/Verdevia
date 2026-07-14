import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ImageAnalysisService } from '../services/image-analysis.service';
import { ChatbotService } from '../services/chatbot.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';
import { AnalyzeImageDto } from '../dto/analyze-image.dto';

/**
 * AIController — Chatbot domain AI endpoints.
 *
 * All endpoints require a valid JWT (issued by the main platform).
 * No subscription/plan guard in this microservice — the Chatbot domain
 * delegates access control to the upstream JWT issuer.
 */
@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly imageService: ImageAnalysisService,
    private readonly chatbotService: ChatbotService,
  ) {}

  @Post('analyze-image')
  @ApiOperation({ summary: 'Analisar denúncia ambiental por imagem com IA' })
  analyzeImage(@Body() dto: AnalyzeImageDto) {
    return this.imageService.analyzeImage(dto);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chatbot contextual FLAN-T5' })
  chat(
    @Body('message') message: string,
    @Body('context') context?: string,
  ) {
    return this.chatbotService.generateChatResponse(message, context);
  }

  @Get('classify')
  @ApiOperation({ summary: 'Classificação zero-shot de categorias ambientais' })
  classify(@Query('imageUrl') imageUrl: string) {
    return this.imageService.classifyImage(imageUrl);
  }
}
