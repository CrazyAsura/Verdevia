import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/security/jwt-auth.guard';
import type { JwtPayload } from '../../common/security/jwt.strategy';
import { AccessService } from './access.service';
import { CreateAdminDto, SetDocumentPermissionDto, UpdateAdminDto } from './dto/access.dto';
type AuthRequest = Request & { user: JwtPayload };
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AccessController {
  constructor(private readonly access: AccessService) {}
  private role(req: AuthRequest) { return req.user.role ?? req.user.roles?.[0] ?? ''; }
  private requireAdmin(req: AuthRequest) { if (!['admin', 'super_admin'].includes(this.role(req))) throw new ForbiddenException('Acesso administrativo necessário.'); }
  private requireSuper(req: AuthRequest) { if (this.role(req) !== 'super_admin') throw new ForbiddenException('Acesso exclusivo de superadministrador.'); }
  @Get('accounts') list(@Req() req: AuthRequest) { this.requireSuper(req); return this.access.listAdmins(); }
  @Post('accounts') create(@Req() req: AuthRequest, @Body() dto: CreateAdminDto) { this.requireSuper(req); return this.access.createAdmin(dto); }
  @Patch('accounts/:id') update(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateAdminDto) { this.requireSuper(req); return this.access.updateAdmin(id, dto, req.user.sub); }
  @Delete('accounts/:id') remove(@Req() req: AuthRequest, @Param('id') id: string) { this.requireSuper(req); return this.access.removeAdmin(id, req.user.sub); }
  @Get('document-permissions') permissions(@Req() req: AuthRequest) { this.requireAdmin(req); return this.access.listPermissions(); }
  @Put('document-permissions') setPermission(@Req() req: AuthRequest, @Body() dto: SetDocumentPermissionDto) { this.requireSuper(req); return this.access.setPermission(dto, req.user.sub); }
}
