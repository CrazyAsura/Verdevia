import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IComplianceRepository } from '../domain/ports/compliance.repository.interface';
import { PrivacyAuditService } from '../services/privacy-audit.service';
import { User } from '../../users/entities/user.entity';
import { Complaint } from '../../complaints/entities/complaint.entity';

@Injectable()
export class ExportUserDataUseCase {
  constructor(
    @Inject('IComplianceRepository')
    private readonly repository: IComplianceRepository,
    private readonly auditService: PrivacyAuditService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
  ) {}

  async execute(userId: string, ipAddress?: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile', 'gamification'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const complaints = await this.complaintRepo.find({
      where: { user: { id: userId } },
    });

    const consents = await this.repository.findConsentsByUserId(userId);

    await this.auditService.log({
      actorId: userId,
      targetUserId: userId,
      action: 'EXPORT_DATA',
      purpose: 'User data portability request (LGPD Art. 18, V)',
      ipAddress,
    });

    return {
      exportedAt: new Date(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.profile
          ? {
              realName: user.profile.realName,
              identity: user.profile.identity,
              gender: user.profile.gender,
              ethnicity: user.profile.ethnicity,
              birthDate: user.profile.birthDate,
              bio: user.profile.bio,
              address: user.profile.address,
              phones: user.profile.phones,
            }
          : null,
        gamification: user.gamification
          ? {
              xp: user.gamification.xp,
              level: user.gamification.level,
            }
          : null,
      },
      complaints: complaints.map((c) => ({
        id: c.id,
        type: c.type,
        description: c.description,
        location: c.location,
        status: c.status,
        privacy: c.privacy,
        createdAt: c.createdAt,
      })),
      consents: consents.map((c) => ({
        purpose: c.purpose,
        status: c.status,
        version: c.version,
        updatedAt: c.updatedAt,
      })),
    };
  }
}
