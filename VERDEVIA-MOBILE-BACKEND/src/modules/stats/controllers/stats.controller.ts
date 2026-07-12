import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  UseGuards,
  Res,
  Param,
} from '@nestjs/common';
import { StatsService } from '../services/stats.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
  CurrentUser,
} from '../../../common/security/jwt-auth.guard';
import { JwtPayload } from '../../../common/security/jwt.strategy';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { RequirePlanFeatures } from '../../subscriptions/decorators/require-plan.decorator';
import { PlanAccessGuard } from '../../subscriptions/guards/plan-access.guard';

@ApiTags('Statistics')
@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    @InjectQueue('export-queue')
    private readonly exportQueue: Queue,
  ) {}

  @Post('visit')
  @ApiOperation({ summary: 'Log de entrada no site' })
  logVisit(@Body() data: any, @Req() req: any) {
    return this.statsService.logVisit({
      ...data,
      ip: req.ip || req.headers['x-forwarded-for'] || '0.0.0.0',
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('stats:audit')
  @ApiOperation({ summary: 'Listar logs de auditoria detalhados' })
  getAuditLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('type') type?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.statsService.getAuditLogs(
      Number(page),
      Number(limit),
      type,
      user,
    );
  }

  @Get(['', 'summary'])
  @ApiOperation({ summary: 'Obter resumo de estatísticas' })
  getSummary() {
    return this.statsService.getStats();
  }

  @Get('map')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Obter dados para o mapa de queixas com isolamento',
  })
  getMapData(@CurrentUser() user?: any) {
    const isContractor =
      user && (user.role === 'contractor' || user.role === 'super_contractor');
    return this.statsService.getMapData(isContractor ? user.id : undefined);
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Obter coordenadas de clusters gerados pelo Spark' })
  getPredictions() {
    return this.statsService.getSparkPredictions();
  }

  @Post('export/excel')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('stats:export')
  @ApiOperation({
    summary: 'Solicitar exportação síncrona em fila para planilha Excel',
  })
  async exportExcel(@CurrentUser() user: any) {
    await this.exportQueue.add('generate-excel', {
      userId: user.id,
      role: user.role,
      email: user.email,
      format: 'excel',
    });
    return {
      message:
        'Exportação iniciada em segundo plano. Você será notificado por WebSocket quando o download estiver pronto.',
    };
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Baixar relatório de exportação gerado' })
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = path.join(process.cwd(), 'public', 'exports', filename);
    if (!fs.existsSync(filepath)) {
      return res
        .status(404)
        .json({ message: 'Arquivo não encontrado ou expirado.' });
    }
    return res.download(filepath);
  }
}
