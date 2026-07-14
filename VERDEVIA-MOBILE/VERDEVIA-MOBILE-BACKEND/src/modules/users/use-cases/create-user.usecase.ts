import {
  Injectable,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUsersRepository } from '../domain/ports/users.repository.interface';
import * as argon2 from 'argon2';
import { PlanPolicyService } from '../../subscriptions/services/plan-policy.service';
import { PLAN_DEFINITIONS } from '../../subscriptions/plans';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
    private readonly planPolicy: PlanPolicyService,
  ) {}

  async execute(dto: CreateUserDto) {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email já cadastrado');

    const isAdmin =
      dto.email.endsWith('@VERDEVIA.app') ||
      ['super_admin', 'admin', 'contractor', 'super_contractor'].includes(
        (dto as any).role,
      );

    if (isAdmin) {
      const adminPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{15,}$/;
      if (!adminPasswordRegex.test(dto.password)) {
        throw new BadRequestException(
          'A senha administrativa deve conter mais de 14 caracteres, com letras maiusculas, minusculas e numeros, usando apenas caracteres alfanumericos',
        );
      }
    } else {
      if (dto.password.length < 6) {
        throw new BadRequestException(
          'A senha deve ter pelo menos 6 caracteres',
        );
      }
    }

    const hashedPassword = await argon2.hash(dto.password);
    const requestedRole = (dto as any).role;
    const defaultPlan = this.planPolicy.getDefaultPlanForRole(requestedRole);
    const planDefinition = PLAN_DEFINITIONS[defaultPlan];

    const userData: any = {
      email: dto.email,
      password: hashedPassword,
      profile: {
        realName: dto.realName,
        identity: dto.identity,
        gender: dto.gender,
        ethnicity: dto.ethnicity,
        birthDate: dto.birthDate,
        address: dto.address,
        phones: dto.phones,
      } as any,
      gamification: {
        xp: 0,
        level: 1,
        isPremium: defaultPlan !== 'free',
      } as any,
      subscription: {
        plan: defaultPlan,
        billingCycle: defaultPlan === 'free' ? 'none' : 'monthly',
        subscriptionStatus: planDefinition.activeStatus,
        subscriptionExpiresAt: null,
      } as any,
    };

    if (requestedRole) {
      userData.role = requestedRole;
    }

    return this.repository.create(userData);
  }
}
