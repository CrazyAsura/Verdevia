import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ComplianceService } from '../services/compliance.service';
import { ConsentPurpose } from '../entities/consent.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Compliance')
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('users/:id/consents')
  @ApiOperation({ summary: 'Obter consentimentos do usuário' })
  getConsents(@Param('id') userId: string) {
    return this.complianceService.getConsents(userId);
  }

  @Post('users/:id/consents')
  @ApiOperation({ summary: 'Atualizar consentimentos do usuário' })
  updateConsents(
    @Param('id') userId: string,
    @Body()
    body: {
      updates: Array<{
        purpose: ConsentPurpose;
        status: boolean;
        version?: string;
      }>;
    },
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.complianceService.updateConsents(userId, body.updates, ip);
  }

  @Get('users/:id/export')
  @ApiOperation({
    summary: 'Exportar todos os dados pessoais do usuário (Portabilidade)',
  })
  exportData(@Param('id') userId: string, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.complianceService.exportUserData(userId, ip);
  }

  @Post('users/:id/anonymize')
  @ApiOperation({
    summary: 'Anonimizar/Excluir conta do usuário (Direito ao Esquecimento)',
  })
  anonymizeData(@Param('id') userId: string, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.complianceService.anonymizeUserData(userId, ip);
  }

  // Document version endpoints
  @Get('versions/:type')
  @ApiOperation({
    summary: 'Obter histórico de versões de um tipo de política/termo',
  })
  getVersions(@Param('type') type: string) {
    return this.complianceService.getVersions(type);
  }

  @Post('versions/:type')
  @ApiOperation({ summary: 'Publicar uma nova versão de política/termo' })
  publishVersion(
    @Param('type') type: string,
    @Body() body: { version: string; content: string; pdfName: string },
  ) {
    return this.complianceService.publishVersion(
      type,
      body.version,
      body.content,
      body.pdfName,
    );
  }

  @Patch('versions/:id/activate')
  @ApiOperation({ summary: 'Ativar uma versão antiga como vigente' })
  activateVersion(@Param('id') id: string) {
    return this.complianceService.activateVersion(id);
  }

  @Delete('versions/:id')
  @ApiOperation({ summary: 'Excluir uma versão específica' })
  deleteVersion(@Param('id') id: string) {
    return this.complianceService.deleteVersion(id);
  }
}
