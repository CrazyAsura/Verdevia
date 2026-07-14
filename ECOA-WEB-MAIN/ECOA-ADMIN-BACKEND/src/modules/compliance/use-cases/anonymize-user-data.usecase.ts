import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacyAuditService } from '../services/privacy-audit.service';
import { User } from '../../users/entities/user.entity';
import { UserProfile } from '../../profiles/entities/user-profile.entity';
import { Complaint } from '../../complaints/entities/complaint.entity';

@Injectable()
export class AnonymizeUserDataUseCase {
  constructor(
    private readonly auditService: PrivacyAuditService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
  ) {}

  async execute(
    userId: string,
    ipAddress?: string,
  ): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // 1. Anonimizar Perfil
    if (user.profile) {
      const profile = user.profile;
      profile.realName = 'Usuário Anonimizado';
      profile.identity = null;
      profile.bio = null;
      profile.avatarUrl = null;

      // Manter apenas dados demográficos agregados sem identificar
      if (profile.address) {
        profile.address = {
          city: profile.address.city,
          state: profile.address.state,
          country: profile.address.country,
        };
      }
      profile.phones = [];
      await this.profileRepo.save(profile);
    }

    // 2. Limpar IPs de denúncias
    const complaints = await this.complaintRepo.find({
      where: { user: { id: userId } },
    });
    for (const complaint of complaints) {
      complaint.ip = null;
      if (complaint.latitude && complaint.longitude) {
        complaint.latitude = Math.round(complaint.latitude * 1000) / 1000;
        complaint.longitude = Math.round(complaint.longitude * 1000) / 1000;
      }
      await this.complaintRepo.save(complaint);
    }

    // 3. Anonimizar dados de conta
    user.email = `anonymized-${user.id}@ECOA.org`;
    user.password = `ANONYMIZED_${Math.random().toString(36).substring(2)}`;
    await this.userRepo.save(user);

    // 4. Log auditoria de exclusão/anonimização
    await this.auditService.log({
      actorId: userId,
      targetUserId: userId,
      action: 'ANONYMIZE_DATA',
      purpose: 'User erasure / Right to be forgotten (LGPD Art. 18, VI)',
      ipAddress,
    });

    return { success: true };
  }
}
