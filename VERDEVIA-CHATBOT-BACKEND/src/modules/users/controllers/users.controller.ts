import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrivacyAuditService } from '../../compliance/services/privacy-audit.service';
import { Request } from 'express';
import { KafkaLog } from '../../../common/decorators/kafka-log.decorator';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: PrivacyAuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('resolve-by-email')
  @ApiOperation({ summary: 'Resolver usuario por e-mail' })
  async resolveByEmail(@Query('email') email: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) return null;

    const users = await this.usersService.findAll();
    const user = users.find(
      (item: any) =>
        typeof item.email === 'string' &&
        item.email.toLowerCase() === normalizedEmail,
    );

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
    };
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Obter perfil consolidado e gamificação' })
  async getProfile(@Param('id') id: string, @Req() req: Request) {
    const profile = await this.usersService.getProfile(id);
    const ip = req.ip || req.socket.remoteAddress;
    // Log de acesso a dados de perfil (LGPD exigência de transparência e controle de acessos)
    await this.auditService.log({
      actorId: id, // Em app real, seria extraído do token JWT de quem requisitou
      targetUserId: id,
      action: 'READ_PROFILE',
      purpose: 'User reading consolidated profile details',
      ipAddress: ip,
    });
    return profile;
  }

  @Patch('profile/:id')
  @ApiOperation({ summary: 'Atualizar metadados do perfil' })
  @KafkaLog('update_user_profile_rest')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = await this.usersService.updateProfile(id, dto);
    const ip = req.ip || req.socket.remoteAddress;
    await this.auditService.log({
      actorId: id,
      targetUserId: id,
      action: 'UPDATE_PROFILE',
      purpose: 'User updating profile details',
      ipAddress: ip,
    });
    return user;
  }

  @Post('profile/:id/photo')
  @ApiOperation({ summary: 'Atualizar foto do perfil' })
  async updateProfilePhoto(
    @Param('id') id: string,
    @Body() dto: { imageBase64?: string },
    @Req() req: Request,
  ) {
    if (!dto.imageBase64) {
      throw new Error('imageBase64 is required');
    }

    const match = dto.imageBase64.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/);
    if (!match) {
      throw new Error('Formato de imagem invalido');
    }

    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64 = match[2];
    const uploadDir = join(process.cwd(), 'uploads', 'profile');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${id}-${Date.now()}.${extension}`;
    const filePath = join(uploadDir, fileName);
    writeFileSync(filePath, Buffer.from(base64, 'base64'));

    const protocol = req.protocol;
    const host = req.get('host');
    const avatarUrl = `${protocol}://${host}/uploads/profile/${fileName}`;
    await this.usersService.updateProfile(id, { avatarUrl });

    return { avatarUrl };
  }

  @Get(':id/achievements')
  @ApiOperation({ summary: 'Obter conquistas do usuário' })
  getAchievements(@Param('id') id: string) {
    return this.usersService.getAchievements(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter usuário base por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de autenticação' })
  @KafkaLog('update_user_credentials_rest')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = await this.usersService.update(id, dto);
    const ip = req.ip || req.socket.remoteAddress;
    await this.auditService.log({
      actorId: id,
      targetUserId: id,
      action: 'UPDATE_ACCOUNT',
      purpose: 'User updating account authentication details',
      ipAddress: ip,
    });
    return user;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuário' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const result = await this.usersService.remove(id);
    const ip = req.ip || req.socket.remoteAddress;
    await this.auditService.log({
      actorId: id,
      targetUserId: id,
      action: 'DELETE_USER',
      purpose: 'User account hard deletion (LGPD Art. 18)',
      ipAddress: ip,
    });
    return result;
  }
}
