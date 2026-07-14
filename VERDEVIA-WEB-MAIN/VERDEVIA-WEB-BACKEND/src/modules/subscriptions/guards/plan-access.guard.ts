import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user.enums';
import {
  REQUIRED_PLAN_FEATURES_KEY,
  REQUIRED_PLANS_KEY,
} from '../decorators/require-plan.decorator';
import { PlanFeature, SubscriptionPlan } from '../plans';
import { PlanPolicyService } from '../services/plan-policy.service';

/** Platform-privileged roles that bypass all subscription gates. */
const PRIVILEGED_ROLES = new Set<string>([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

@Injectable()
export class PlanAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
    private readonly planPolicy: PlanPolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<SubscriptionPlan[]>(
      REQUIRED_PLANS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredFeatures = this.reflector.getAllAndOverride<PlanFeature[]>(
      REQUIRED_PLAN_FEATURES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPlans?.length && !requiredFeatures?.length) {
      return true;
    }

    const request = this.getRequest(context);
    const jwtUser = request?.user;
    const userId = jwtUser?.sub ?? jwtUser?.id;

    if (!userId) {
      throw new UnauthorizedException('Autenticacao obrigatoria');
    }

    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: ['subscription'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado');
    }

    // Privileged roles (admin, super_admin) bypass all plan gates
    if (PRIVILEGED_ROLES.has(user.role)) {
      request.user = {
        ...jwtUser,
        id: user.id,
        sub: user.id,
        email: user.email,
        role: user.role,
        plan: user.subscription?.plan ?? this.planPolicy.getDefaultPlanForRole(user.role),
        subscriptionStatus: user.subscription?.subscriptionStatus ?? 'active',
      };
      return true;
    }

    const hasRequiredPlan =
      !requiredPlans?.length ||
      this.planPolicy.canUsePlan(user.subscription, requiredPlans, user.role);
    const hasRequiredFeature =
      !requiredFeatures?.length ||
      this.planPolicy.hasAnyFeature(
        user.subscription,
        requiredFeatures,
        user.role,
      );

    if (!hasRequiredPlan || !hasRequiredFeature) {
      throw new ForbiddenException(
        'Seu plano atual nao permite acessar este recurso',
      );
    }

    request.user = {
      ...jwtUser,
      id: user.id,
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.subscription?.plan ?? this.planPolicy.getDefaultPlanForRole(user.role),
      subscriptionStatus: user.subscription?.subscriptionStatus ?? 'none',
    };

    return true;
  }

  private getRequest(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext<{
      req?: any;
    }>();

    return gqlContext?.req ?? context.switchToHttp().getRequest();
  }
}
