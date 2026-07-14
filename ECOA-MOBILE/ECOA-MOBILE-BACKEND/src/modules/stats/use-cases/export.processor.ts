import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { IStatsRepository } from '../domain/ports/stats.repository.interface';
import { NotificationsGateway } from '../../notifications/gateways/notifications.gateway';

@Processor('export-queue')
export class ExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(
    @Inject('IStatsRepository')
    private readonly statsRepo: IStatsRepository,
    // Inject the notification gateway to alert users via WebSocket when export is ready
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, role, email, format } = job.data;
    this.logger.log(
      `Processing export job ${job.id} for user ${email} in format ${format}`,
    );

    try {
      // Step 1: Query complaints based on role (contractor visibility isolation)
      const isContractor = role === 'contractor' || role === 'super_contractor';
      const contractorId = isContractor ? userId : undefined;
      const complaints =
        await this.statsRepo.getComplaintsLocations(contractorId);

      // Step 2: Create Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Relatório de Queixas');

      worksheet.columns = [
        { header: 'ID da Queixa', key: 'id', width: 40 },
        { header: 'Categoria', key: 'type', width: 20 },
        { header: 'Descrição', key: 'description', width: 50 },
        { header: 'Localização (Endereço)', key: 'location', width: 30 },
        { header: 'Latitude', key: 'latitude', width: 15 },
        { header: 'Longitude', key: 'longitude', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Data de Criação', key: 'createdAt', width: 25 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '20C997' }, // Neon green brand color
      };

      // Add rows
      complaints.forEach((c) => {
        worksheet.addRow({
          id: c.id,
          type: c.type,
          description: c.description,
          location: c.location || 'Não informado',
          latitude: c.latitude || 0,
          longitude: c.longitude || 0,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
        });
      });

      // Ensure directory exists
      const exportDir = path.join(process.cwd(), 'public', 'exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const filename = `relatorio-queixas-${userId}-${Date.now()}.xlsx`;
      const filepath = path.join(exportDir, filename);

      await workbook.xlsx.writeFile(filepath);
      this.logger.log(`Workbook written to ${filepath}`);

      // Step 3: Notify the user via Websocket
      if (
        this.notificationsGateway &&
        typeof this.notificationsGateway.sendToUser === 'function'
      ) {
        this.notificationsGateway.sendToUser(userId, {
          type: 'EXPORT_COMPLETED',
          title: 'Relatório Disponível',
          message: 'Seu relatório em planilha Excel está pronto para download.',
          filename,
        });
      } else {
        // Fallback notification or direct broadcast if sendToUser is not available
        this.notificationsGateway?.server?.emit('notification', {
          userId,
          type: 'EXPORT_COMPLETED',
          title: 'Relatório Disponível',
          message: 'Seu relatório em planilha Excel está pronto para download.',
          filename,
        });
      }

      return { filename };
    } catch (error) {
      this.logger.error(
        `Error generating spreadsheet for job ${job.id}:`,
        error,
      );
      throw error;
    }
  }
}
