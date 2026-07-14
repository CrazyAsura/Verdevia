import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as net from 'net';
import * as tls from 'tls';

interface MailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class SmtpMailService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async sendPasswordReset(email: string, displayName?: string, portal?: string) {
    const resetTokenExpiresIn = (this.config.get<string>('PASSWORD_RESET_EXPIRES_IN') ||
      '30m') as any;
    const token = await this.jwtService.signAsync(
      {
        sub: email,
        purpose: 'password-reset',
      },
      {
        expiresIn: resetTokenExpiresIn,
      },
    );
    const resetBaseUrl =
      this.config.get<string>('PASSWORD_RESET_BASE_URL') ||
      this.config.get<string>('NEXT_PUBLIC_API_URL') ||
      'http://localhost:3000';
    const resetUrl = `${resetBaseUrl.replace(/\/$/, '')}/autenticacao/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&portal=${encodeURIComponent(portal || 'admin')}`;
    const name = displayName || email;

    await this.sendMail({
      to: email,
      subject: 'ECOA - Recuperação de senha',
      text: [
        `Olá, ${name}.`,
        '',
        'Recebemos uma solicitação para redefinir sua senha na ECOA.',
        `Acesse: ${resetUrl}`,
        '',
        'Se você não solicitou esta recuperação, ignore este e-mail.',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;background:#050505;color:#f8fafc;padding:28px;border-radius:16px">
          <h1 style="margin:0 0 16px;color:#20c997">Recuperação de senha ECOA</h1>
          <p>Olá, <strong>${this.escapeHtml(name)}</strong>.</p>
          <p>Recebemos uma solicitação para redefinir sua senha na plataforma ECOA.</p>
          <p style="margin:28px 0">
            <a href="${resetUrl}" style="background:#20c997;color:#000;padding:14px 18px;border-radius:10px;text-decoration:none;font-weight:800;text-transform:uppercase;letter-spacing:.08em">
              Redefinir senha
            </a>
          </p>
          <p style="color:#94a3b8;font-size:12px">Este link é protegido, temporário e deve ser usado apenas por você. Se você não solicitou esta recuperação, ignore este e-mail.</p>
        </div>
      `,
    });

    return { token };
  }

  private async sendMail(payload: MailPayload) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const secure = this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('SMTP_FROM') || user;

    if (!host || !user || !pass || !from) {
      throw new InternalServerErrorException(
        'SMTP não configurado. Verifique SMTP_HOST, SMTP_USER, SMTP_PASS e SMTP_FROM.',
      );
    }

    const socket = await this.connect(host, port, secure);

    try {
      await this.expect(socket, 220);
      await this.command(socket, `EHLO ECOA.local`, 250);

      if (!secure) {
        await this.command(socket, 'STARTTLS', 220);
        const upgraded = tls.connect({ socket, host, servername: host });
        await new Promise<void>((resolve, reject) => {
          upgraded.once('secureConnect', resolve);
          upgraded.once('error', reject);
        });
        await this.command(upgraded, `EHLO ECOA.local`, 250);
        await this.authenticate(upgraded, user, pass);
        await this.deliver(upgraded, from, payload);
        return;
      }

      await this.authenticate(socket, user, pass);
      await this.deliver(socket, from, payload);
    } catch (error) {
      throw new BadGatewayException(
        `Falha ao enviar e-mail SMTP: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
    } finally {
      socket.end();
    }
  }

  private connect(host: string, port: number, secure: boolean) {
    return new Promise<net.Socket>((resolve, reject) => {
      const socket = secure
        ? tls.connect({ host, port, servername: host })
        : net.connect({ host, port });
      socket.once(secure ? 'secureConnect' : 'connect', () => resolve(socket));
      socket.once('error', reject);
      socket.setTimeout(15000, () => {
        socket.destroy(new Error('Timeout na conexão SMTP'));
      });
    });
  }

  private async authenticate(socket: net.Socket, user: string, pass: string) {
    await this.command(socket, 'AUTH LOGIN', 334);
    await this.command(socket, Buffer.from(user).toString('base64'), 334);
    await this.command(socket, Buffer.from(pass).toString('base64'), 235);
  }

  private async deliver(socket: net.Socket, from: string, payload: MailPayload) {
    await this.command(socket, `MAIL FROM:<${this.extractEmail(from)}>`, 250);
    await this.command(socket, `RCPT TO:<${payload.to}>`, [250, 251]);
    await this.command(socket, 'DATA', 354);
    await this.command(socket, `${this.buildMessage(from, payload)}\r\n.`, 250);
    await this.command(socket, 'QUIT', 221);
  }

  private buildMessage(from: string, payload: MailPayload) {
    const boundary = `ECOA-${Date.now()}`;
    return [
      `From: ${from}`,
      `To: ${payload.to}`,
      `Subject: ${this.encodeHeader(payload.subject)}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      payload.text,
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      payload.html,
      `--${boundary}--`,
    ].join('\r\n');
  }

  private command(
    socket: net.Socket,
    command: string,
    expected: number | number[],
  ): Promise<string> {
    socket.write(`${command}\r\n`);
    return this.expect(socket, expected);
  }

  private expect(socket: net.Socket, expected: number | number[]) {
    const expectedCodes = Array.isArray(expected) ? expected : [expected];

    return new Promise<string>((resolve, reject) => {
      let buffer = '';
      const onData = (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split(/\r?\n/).filter(Boolean);
        const last = lines[lines.length - 1];
        if (!last || !/^\d{3}\s/.test(last)) return;

        socket.off('data', onData);
        const code = Number(last.slice(0, 3));
        if (expectedCodes.includes(code)) {
          resolve(buffer);
        } else {
          reject(new Error(last));
        }
      };

      socket.on('data', onData);
      socket.once('error', reject);
    });
  }

  private extractEmail(value: string) {
    const match = value.match(/<([^>]+)>/);
    return match?.[1] || value;
  }

  private encodeHeader(value: string) {
    return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[char];
    });
  }
}
