import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { IStatsRepository } from '../../domain/ports/stats.repository.interface';
import { User } from '../../../users/entities/user.entity';
import { Complaint } from '../../../complaints/entities/complaint.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { SparkPrediction } from '../../entities/spark-prediction.entity';

@Injectable()
export class TypeORMStatsRepository implements IStatsRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(SparkPrediction)
    private readonly sparkRepo: Repository<SparkPrediction>,
  ) {}

  async countUsers() {
    return this.userRepo.count();
  }

  async countComplaints() {
    return this.complaintRepo.count();
  }

  async getRecentComplaints(limit: number) {
    return this.complaintRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getComplaintsLocations(contractorId?: string) {
    const where: any = {
      latitude: require('typeorm').Not(require('typeorm').IsNull()),
      longitude: require('typeorm').Not(require('typeorm').IsNull()),
    };

    if (contractorId) {
      where.assignedContractor = { id: contractorId };
    }

    return this.complaintRepo.find({
      select: [
        'id',
        'latitude',
        'longitude',
        'type',
        'status',
        'description',
        'createdAt',
      ],
      where,
    });
  }

  async getSparkPredictions() {
    return this.sparkRepo.find({
      order: { id: 'ASC' },
    });
  }

  async createAuditLog(data: any) {
    const log = this.auditRepo.create(data);
    return this.auditRepo.save(log);
  }

  async findAllAuditLogs(
    page: number,
    limit: number,
    type?: string,
    requestingUserId?: string,
    requestingUserRole?: string,
  ): Promise<[AuditLog[], number]> {
    const where: any = {};
    if (type === 'errors') {
      where.action = 'SYSTEM_ERROR';
    } else if (type === 'activities') {
      where.action = Not('SYSTEM_ERROR');
    }

    if (requestingUserId && requestingUserRole) {
      if (requestingUserRole === 'super_contractor') {
        const subordinates = await this.userRepo.find({
          where: [
            { parentUserId: requestingUserId },
            { parentUser: { parentUserId: requestingUserId } },
          ],
          select: ['id'],
        });
        const subordinateIds = subordinates.map((s) => s.id);
        const allowedUserIds = [requestingUserId, ...subordinateIds];

        where.userId = In(allowedUserIds);
      } else if (
        requestingUserRole !== 'super_admin' &&
        requestingUserRole !== 'admin'
      ) {
        where.userId = requestingUserId;
      }
    }

    return this.auditRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
  }
}
