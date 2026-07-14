import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  Res,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';
import { UsageMetricsService } from '../services/usage-metrics.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Controller('ai')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);
  private readonly logsFilePath = path.resolve(process.cwd(), 'database/error-logs.json');
  private readonly usersFilePath = path.resolve(process.cwd(), 'database/users.json');
  private readonly credentialsFilePath = path.resolve(process.cwd(), 'database/omnichannel-credentials.json');

  constructor(
    private readonly jwtService: JwtService,
    private readonly metricsService: UsageMetricsService,
    private readonly configService: ConfigService,
  ) {
    // Seed default users if users.json is missing or empty
    if (!fs.existsSync(this.usersFilePath) || fs.readFileSync(this.usersFilePath, 'utf-8').trim() === '') {
      const defaultUsers = [
        {
          id: 'admin-1',
          realName: 'Administrador VERDEVIA',
          email: 'admin@verdevia.com',
          role: 'admin',
          passwordHash: 'admin123', // Simple password for seed
          createdAt: new Date().toISOString(),
        },
        {
          id: 'super-admin-1',
          realName: 'Diretor Super Admin',
          email: 'superadmin@verdevia.com',
          role: 'super_admin',
          passwordHash: 'superadmin123',
          createdAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(this.usersFilePath, JSON.stringify(defaultUsers, null, 2), 'utf-8');
    }
  }

  @Post('admin/login')
  async login(@Body() body: any) {
    const { username, password } = body;
    if (!username || !password) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios.');
    }

    let users = [];
    try {
      users = JSON.parse(fs.readFileSync(this.usersFilePath, 'utf-8'));
    } catch {
      users = [];
    }

    const matchedUser = users.find(
      (u: any) =>
        u.email.toLowerCase() === username.trim().toLowerCase() &&
        u.passwordHash === password,
    );

    if (!matchedUser) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const payload = {
      sub: matchedUser.id,
      userName: matchedUser.realName,
      email: matchedUser.email,
      role: matchedUser.role,
      roles: [matchedUser.role],
    };

    const token = await this.jwtService.signAsync(payload);
    return {
      username: matchedUser.email,
      role: matchedUser.role,
      token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('metrics')
  async getMetrics() {
    return this.metricsService.getSummary();
  }

  @UseGuards(JwtAuthGuard)
  @Get('metrics/report.pdf')
  async getMetricsReport(@Res() res: Response) {
    try {
      const pdfBuffer = await this.metricsService.buildPdfReport();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=relatorio-verdevia.pdf',
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (err: any) {
      this.logger.error(`Failed to export PDF: ${err}`);
      res.status(500).send('Failed to generate report PDF');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getLogs() {
    if (!fs.existsSync(this.logsFilePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(this.logsFilePath, 'utf-8'));
    } catch {
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers() {
    try {
      const users = JSON.parse(fs.readFileSync(this.usersFilePath, 'utf-8'));
      return users.map((u: any) => ({
        id: u.id,
        realName: u.realName,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));
    } catch {
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('users')
  async createUser(@Body() body: any) {
    const { name, email, password, role } = body;
    if (!name || !email || !password || !role) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    let users = [];
    try {
      users = JSON.parse(fs.readFileSync(this.usersFilePath, 'utf-8'));
    } catch {
      users = [];
    }

    if (users.some((u: any) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('Já existe um usuário registrado com este e-mail.');
    }

    const newUser = {
      id: crypto.randomUUID(),
      realName: name,
      email: email.trim().toLowerCase(),
      role,
      passwordHash: password, // Store password simply for dev validation
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

    return {
      id: newUser.id,
      realName: newUser.realName,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:email')
  async deleteUser(@Param('email') email: string) {
    let users = [];
    try {
      users = JSON.parse(fs.readFileSync(this.usersFilePath, 'utf-8'));
    } catch {
      users = [];
    }

    const initialLen = users.length;
    users = users.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());

    if (users.length === initialLen) {
      throw new Error('Usuário não encontrado.');
    }

    fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('omnichannel/credentials')
  async getCredentials() {
    if (!fs.existsSync(this.credentialsFilePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(this.credentialsFilePath, 'utf-8'));
    } catch {
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('omnichannel/credentials')
  async saveCredentials(@Body() body: any) {
    const { provider, config } = body;
    if (!provider || !config) {
      throw new Error('Provedor e configuração são obrigatórios.');
    }

    let credentials: any[] = [];
    if (fs.existsSync(this.credentialsFilePath)) {
      try {
        credentials = JSON.parse(fs.readFileSync(this.credentialsFilePath, 'utf-8'));
      } catch {
        credentials = [];
      }
    }

    const existingIdx = credentials.findIndex((c) => c.provider === provider);
    if (existingIdx >= 0) {
      credentials[existingIdx].config = config;
    } else {
      credentials.push({ provider, config });
    }

    fs.writeFileSync(this.credentialsFilePath, JSON.stringify(credentials, null, 2), 'utf-8');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('omnichannel/send')
  async sendOmnichannelMessage(@Body() body: any) {
    const { channel, conversationId, senderId, text, lawfulBasis, metadata } = body;

    if (!channel || !conversationId || !senderId || !text || !lawfulBasis) {
      throw new Error('Todos os campos omnichannel são obrigatórios.');
    }

    // LGPD - Strip secrets in metadata if present
    const cleanMetadata = { ...metadata };
    delete cleanMetadata.secret;
    delete cleanMetadata.password;
    delete cleanMetadata.token;

    // LGPD - Mask sensitive data in text (e.g. CPF, emails)
    let cleanText = text;
    // Mask CPF: XXX.XXX.XXX-XX
    cleanText = cleanText.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '***.***.***-**');
    // Mask Email: xxxx@xxxx.xx
    cleanText = cleanText.replace(/[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/g, '****@****.***');

    // LGPD - Hashing of sender identifier
    const recipientIdHash = crypto
      .createHash('sha256')
      .update(senderId)
      .digest('hex');

    return {
      messageId: `msg_${crypto.randomUUID().slice(0, 8)}`,
      channel,
      conversationId,
      lawfulBasis,
      recipientIdHash,
      text: cleanText,
      metadata: cleanMetadata,
      timestamp: new Date().toISOString(),
    };
  }
}
