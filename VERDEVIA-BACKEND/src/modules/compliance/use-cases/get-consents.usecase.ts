import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IComplianceRepository } from '../domain/ports/compliance.repository.interface';
import { Consent, ConsentPurpose } from '../entities/consent.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class GetConsentsUseCase {
  constructor(
    @Inject('IComplianceRepository')
    private readonly repository: IComplianceRepository,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async execute(userId: string): Promise<Consent[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    let consents = await this.repository.findConsentsByUserId(userId);

    if (consents.length === 0) {
      const purposes = [
        { purpose: ConsentPurpose.ESSENTIAL_TERMS, status: true },
        { purpose: ConsentPurpose.PRIVACY_POLICY, status: true },
        { purpose: ConsentPurpose.ANALYTICS, status: false },
        { purpose: ConsentPurpose.MARKETING_NOTIFICATIONS, status: false },
      ];

      consents = [];
      for (const p of purposes) {
        const consent = new Consent();
        consent.user = user;
        consent.purpose = p.purpose;
        consent.status = p.status;
        consent.version = '1.0.0';
        const saved = await this.repository.saveConsent(consent);
        consents.push(saved);
      }
    }

    return consents;
  }
}
