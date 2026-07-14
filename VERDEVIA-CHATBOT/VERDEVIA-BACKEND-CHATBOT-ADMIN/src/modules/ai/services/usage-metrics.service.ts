import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Server-side pdfmake via PdfPrinter (not the browser build)
let PdfPrinter: any;
try {
  PdfPrinter = require('pdfmake/src/printer');
} catch {
  try {
    // Fallback for older layout
    PdfPrinter = require('pdfmake').PdfPrinter;
  } catch {
    PdfPrinter = null;
  }
}

// Font paths inside the installed pdfmake package
const FONTS_DIR = path.resolve(
  process.cwd(),
  'node_modules/pdfmake/build/vfs_fonts.js',
);

function getPdfFonts() {
  try {
    const fontsDir = path.resolve(
      process.cwd(),
      'node_modules',
      'pdfmake',
      'build',
      'vfs_fonts',
    );
    const robotoDir = path.resolve(process.cwd(), 'node_modules/pdfmake/build');
    // Try to use system fonts available in the slim Node image
    return {
      Roboto: {
        normal: Buffer.from([]),
        bold: Buffer.from([]),
        italics: Buffer.from([]),
        bolditalics: Buffer.from([]),
      },
    };
  } catch {
    return {};
  }
}

type UsageEvent = {
  timestamp: string;
  username: string;
  role: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type UsageMetricsSummary = {
  totalTokens: number;
  totalMessages: number;
  activeUsers: number;
  currentMonthTokens: number;
  currentYearTokens: number;
  users: Array<{
    username: string;
    role: string;
    messages: number;
    totalTokens: number;
    currentMonthTokens: number;
    currentYearTokens: number;
  }>;
  monthlyUsage: Array<{
    month: string;
    totalTokens: number;
    messages: number;
    users: number;
  }>;
};

@Injectable()
export class UsageMetricsService {
  private readonly logger = new Logger(UsageMetricsService.name);
  private readonly metricsFilePath = path.resolve(
    process.cwd(),
    'database/usage-metrics.json',
  );

  constructor() {
    const dir = path.dirname(this.metricsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  private monthKey(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${m}`;
  }

  private loadEvents(): UsageEvent[] {
    if (!fs.existsSync(this.metricsFilePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(this.metricsFilePath, 'utf-8'));
    } catch {
      return [];
    }
  }

  private saveEvents(events: UsageEvent[]): void {
    try {
      fs.writeFileSync(
        this.metricsFilePath,
        JSON.stringify(events, null, 2),
        'utf-8',
      );
    } catch (err) {
      this.logger.error(`Failed to save metrics events: ${err}`);
    }
  }

  recordChatUsage(input: {
    username: string;
    role: string;
    inputText: string;
    outputText: string;
  }): void {
    const inputTokens = this.estimateTokens(input.inputText);
    const outputTokens = this.estimateTokens(input.outputText);
    const event: UsageEvent = {
      timestamp: new Date().toISOString(),
      username: input.username || 'unknown',
      role: input.role || 'user',
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };

    const events = this.loadEvents();
    events.push(event);
    this.saveEvents(events);
  }

  getSummary(): UsageMetricsSummary {
    const events = this.loadEvents();
    const now = new Date();
    const currentMonth = this.monthKey(now);
    const currentYear = String(now.getFullYear());

    const byUser = new Map<
      string,
      {
        username: string;
        role: string;
        messages: number;
        totalTokens: number;
        currentMonthTokens: number;
        currentYearTokens: number;
      }
    >();
    const byMonth = new Map<string, { totalTokens: number; messages: number; users: Set<string> }>();

    let totalTokens = 0;
    let totalMessages = 0;
    let currentMonthTokens = 0;
    let currentYearTokens = 0;

    for (const event of events) {
      const date = new Date(event.timestamp);
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const month = this.monthKey(date);
      const year = String(date.getFullYear());
      const username = event.username || 'unknown';
      const tokens = Number(event.totalTokens || 0);

      totalTokens += tokens;
      totalMessages += 1;
      if (month === currentMonth) currentMonthTokens += tokens;
      if (year === currentYear) currentYearTokens += tokens;

      const user = byUser.get(username) || {
        username,
        role: event.role || 'user',
        messages: 0,
        totalTokens: 0,
        currentMonthTokens: 0,
        currentYearTokens: 0,
      };
      user.messages += 1;
      user.totalTokens += tokens;
      if (month === currentMonth) user.currentMonthTokens += tokens;
      if (year === currentYear) user.currentYearTokens += tokens;
      byUser.set(username, user);

      const monthBucket = byMonth.get(month) || { totalTokens: 0, messages: 0, users: new Set<string>() };
      monthBucket.totalTokens += tokens;
      monthBucket.messages += 1;
      monthBucket.users.add(username);
      byMonth.set(month, monthBucket);
    }

    return {
      totalTokens,
      totalMessages,
      activeUsers: byUser.size,
      currentMonthTokens,
      currentYearTokens,
      users: Array.from(byUser.values()).sort((a, b) => b.totalTokens - a.totalTokens),
      monthlyUsage: Array.from(byMonth.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([month, bucket]) => ({
          month,
          totalTokens: bucket.totalTokens,
          messages: bucket.messages,
          users: bucket.users.size,
        })),
    };
  }

  async buildPdfReport(): Promise<Buffer> {
    if (!PdfPrinter) {
      throw new Error('pdfmake PdfPrinter is not available on this system.');
    }
    const summary = this.getSummary();
    const generatedAt = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());

    // Use Courier as a built-in font that needs no TTF files
    const fonts = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique',
      },
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [36, 42, 36, 42],
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 9,
        color: '#1F2933',
      },
      content: [
        { text: 'RELATORIO DE CONSUMO - VERDEVIA CHATBOT', fontSize: 16, bold: true, margin: [0, 0, 0, 5] },
        { text: `Gerado em: ${generatedAt}`, fontSize: 9, color: '#6B7280', margin: [0, 0, 0, 20] },
        { text: 'Resumo Geral', fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Total de Tokens', bold: true },
                { text: 'Total de Mensagens', bold: true },
                { text: 'Usuarios Ativos', bold: true },
              ],
              [
                summary.totalTokens.toLocaleString('pt-BR'),
                summary.totalMessages.toLocaleString('pt-BR'),
                summary.activeUsers.toString(),
              ],
            ],
          },
          margin: [0, 0, 0, 20],
        },
        { text: 'Uso Detalhado por Usuario', fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Usuario', bold: true },
                { text: 'Perfil', bold: true },
                { text: 'Mensagens', bold: true },
                { text: 'Total Tokens', bold: true },
              ],
              ...summary.users.map((u) => [
                u.username,
                u.role,
                u.messages.toString(),
                u.totalTokens.toLocaleString('pt-BR'),
              ]),
            ],
          },
        },
      ],
    };

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const printer = new PdfPrinter(fonts);
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);
        pdfDoc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
