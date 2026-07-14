import { Controller, Post, Body, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../../common/security/jwt.strategy';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AiGatewayService } from '../services/ai-gateway.service';
import { AccessService } from '../../access/access.service';
import { ImageAnalysisService } from '../services/image-analysis.service';
import { ChatbotService } from '../services/chatbot.service';
import { UsageMetricsService } from '../services/usage-metrics.service';
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
    private readonly aiGateway: AiGatewayService,
    private readonly accessService: AccessService,
    private readonly metricsService: UsageMetricsService,
  ) {}

  @Get('documents')
  async documents() { const result = await this.aiGateway.listDocuments(); await this.accessService.ensureDocumentPermissions(result.documents); return result; }

  @Post('documents')
  @UseInterceptors(FilesInterceptor('files', 20, { limits: { fileSize: 25 * 1024 * 1024 } }))
  async uploadDocuments(@UploadedFiles() files: any[]) { const result = await this.aiGateway.uploadDocuments(files); await this.accessService.ensureDocumentPermissions(result.documents); return result; }

  @Post('analyze-image')
  @ApiOperation({ summary: 'Analisar denúncia ambiental por imagem com IA' })
  analyzeImage(@Body() dto: AnalyzeImageDto) {
    return this.imageService.analyzeImage(dto);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chatbot contextual FLAN-T5' })
  async chat(
    @Body('message') message: string,
    @Body('context') context?: string,
    @Body('history') history?: Array<{ role: string; content: string }>,
    @Body('documentIds') documentIds?: string[],
    @Req() req?: Request & { user: JwtPayload },
  ) {
    const response = await this.chatbotService.generateChatResponse(message, context, history, documentIds, req?.user);
    try {
      this.metricsService.recordChatUsage({
        username: req?.user?.email || 'anonymous',
        role: req?.user?.role || 'admin',
        inputText: message,
        outputText: typeof response === 'object' && response !== null ? (response as any).answer || JSON.stringify(response) : String(response),
      });
    } catch {}
    return response;
  }

  @Get('classify')
  @ApiOperation({ summary: 'Classificação zero-shot de categorias ambientais' })
  classify(@Query('imageUrl') imageUrl: string) {
    return this.imageService.classifyImage(imageUrl);
  }
}
