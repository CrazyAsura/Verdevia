import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../services/users.service';
import { PrivacyAuditService } from '../../compliance/services/privacy-audit.service';
import {
  UserType,
  UserProfileType,
  AchievementType,
  LoginResponseType,
  CreateUserInput,
  UpdateUserInput,
  LoginInput,
  MessageResponseType,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from '../dto/graphql/users-graphql.dto';
import { MutationResultType } from '../../forum/dto/graphql/forum-graphql.dto';
import {
  JwtAuthGuard,
  CurrentUser,
} from '../../../common/security/jwt-auth.guard';
import { KafkaLog } from '../../../common/decorators/kafka-log.decorator';
import { SmtpMailService } from '../../../common/mail/smtp-mail.service';
import { BadRequestException } from '@nestjs/common';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: PrivacyAuditService,
    private readonly smtpMailService: SmtpMailService,
    private readonly jwtService: JwtService,
  ) {
    this.mapUser = this.mapUser.bind(this);
    this.mapProfile = this.mapProfile.bind(this);
    this.mapAchievement = this.mapAchievement.bind(this);
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  @Query(() => [UserType], { description: 'List all users' })
  async users(): Promise<UserType[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => this.mapUser(user));
  }

  @Query(() => UserType, { nullable: true, description: 'Get user by ID' })
  async user(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<UserType | null> {
    const user = await this.usersService.findOne(id);
    return user ? this.mapUser(user) : null;
  }

  @Query(() => UserProfileType, {
    nullable: true,
    description: 'Get consolidated user profile and gamification',
  })
  async profile(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<UserProfileType | null> {
    const profile = await this.usersService.getProfile(id);
    if (!profile) return null;

    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    await this.auditService.log({
      actorId: id,
      targetUserId: id,
      action: 'READ_PROFILE',
      purpose: 'User reading consolidated profile details via GraphQL',
      ipAddress: ip,
    });

    return this.mapProfile(profile);
  }

  @Query(() => [AchievementType], { description: 'Get user achievements' })
  async achievements(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<AchievementType[]> {
    const achievements = await this.usersService.getAchievements(userId);
    return achievements.map((achievement) => this.mapAchievement(achievement));
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  @Mutation(() => UserType, { description: 'Register new user' })
  async registerUser(
    @Args('input') input: CreateUserInput,
    @Context() context: any,
  ): Promise<UserType> {
    const user = await this.usersService.create(input);
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    await this.auditService.log({
      actorId: user.id,
      targetUserId: user.id,
      action: 'REGISTER_USER',
      purpose: 'User self-registration via GraphQL',
      ipAddress: ip,
    });
    return this.mapUser(user);
  }

  @Mutation(() => LoginResponseType, { description: 'Authenticate user' })
  async loginUser(
    @Args('input') input: LoginInput,
    @Context() context: any,
  ): Promise<LoginResponseType> {
    const result = await this.usersService.login(input);
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    await this.auditService.log({
      actorId: result.user.id,
      targetUserId: result.user.id,
      action: 'LOGIN_USER',
      purpose: 'User self-authentication via GraphQL',
      ipAddress: ip,
    });
    return {
      token: result.token,
      user: this.mapUser(result.user),
    };
  }

  @Mutation(() => MessageResponseType, {
    description: 'Request password reset instructions by email',
  })
  async requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput,
    @Context() context: any,
  ): Promise<MessageResponseType> {
    const normalizedEmail = input.email?.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new BadRequestException('Informe um e-mail válido para recuperação.');
    }

    const users = await this.usersService.findAll();
    const user = users.find(
      (item: any) =>
        typeof item.email === 'string' &&
        item.email.toLowerCase() === normalizedEmail,
    );

    if (user) {
      await this.smtpMailService.sendPasswordReset(
        normalizedEmail,
        user.profile?.realName ?? normalizedEmail,
        input.portal,
      );
      const req = context.req;
      await this.auditService.log({
        actorId: user.id,
        targetUserId: user.id,
        action: 'REQUEST_PASSWORD_RESET',
        purpose: `Password reset requested from ${input.portal || 'unknown'} portal via GraphQL`,
        ipAddress: req?.ip || req?.socket?.remoteAddress || '127.0.0.1',
      });
    }

    return {
      message:
        'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação em instantes.',
    };
  }

  @Mutation(() => MessageResponseType, {
    description: 'Reset password using a password recovery token',
  })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
    @Context() context: any,
  ): Promise<MessageResponseType> {
    const normalizedEmail = input.email?.trim().toLowerCase();
    if (!normalizedEmail || !input.token || !input.password) {
      throw new BadRequestException('Token, e-mail e nova senha são obrigatórios.');
    }

    if (input.password.length < 8) {
      throw new BadRequestException('A nova senha deve ter pelo menos 8 caracteres.');
    }

    let payload: { sub?: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(input.token);
    } catch {
      throw new UnauthorizedException('Token de recuperação inválido ou expirado.');
    }

    if (
      payload.purpose !== 'password-reset' ||
      payload.sub?.toLowerCase() !== normalizedEmail
    ) {
      throw new UnauthorizedException('Token de recuperação não corresponde ao e-mail informado.');
    }

    const users = await this.usersService.findAll();
    const user = users.find(
      (item: any) =>
        typeof item.email === 'string' &&
        item.email.toLowerCase() === normalizedEmail,
    );

    if (!user) {
      throw new UnauthorizedException('Token de recuperação inválido ou expirado.');
    }

    await this.usersService.update(user.id, { password: input.password });
    const req = context.req;
    await this.auditService.log({
      actorId: user.id,
      targetUserId: user.id,
      action: 'RESET_PASSWORD',
      purpose: 'Password reset completed from GraphQL recovery link',
      ipAddress: req?.ip || req?.socket?.remoteAddress || '127.0.0.1',
    });

    return { message: 'Senha redefinida com sucesso.' };
  }

  @Mutation(() => UserType, { description: 'Update profile metadata' })
  @UseGuards(JwtAuthGuard)
  @KafkaLog('update_user_profile')
  async updateUserProfile(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
    @Context() context: any,
  ): Promise<UserType> {
    const user = await this.usersService.updateProfile(id, input);
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    await this.auditService.log({
      actorId: id,
      targetUserId: id,
      action: 'UPDATE_PROFILE',
      purpose: 'User updating profile details via GraphQL',
      ipAddress: ip,
    });
    return this.mapUser(user);
  }

  @Mutation(() => UserType, {
    description: 'Update user authentication details',
  })
  @UseGuards(JwtAuthGuard)
  @KafkaLog('update_user_credentials')
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
    @Context() context: any,
  ): Promise<UserType> {
    const user = await this.usersService.update(id, input);
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    await this.auditService.log({
      actorId: id,
      targetUserId: id,
      action: 'UPDATE_ACCOUNT',
      purpose: 'User updating account authentication details via GraphQL',
      ipAddress: ip,
    });
    return this.mapUser(user);
  }

  @Mutation(() => MutationResultType, { description: 'Remove user account' })
  @UseGuards(JwtAuthGuard)
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any,
  ): Promise<MutationResultType> {
    const result = await this.usersService.remove(id);
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    await this.auditService.log({
      actorId: id,
      targetUserId: id,
      action: 'DELETE_USER',
      purpose: 'User account hard deletion via GraphQL (LGPD Art. 18)',
      ipAddress: ip,
    });
    return {
      success: result.success,
      message: result.success
        ? 'Usuário removido com sucesso'
        : 'Falha ao remover usuário',
    };
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapUser(user: any): UserType {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile ? this.mapProfile(user.profile) : undefined,
      gamification: user.gamification
        ? {
            id: user.gamification.id,
            xp: user.gamification.xp ?? 0,
            level: user.gamification.level ?? 1,
            isPremium: user.gamification.isPremium ?? false,
            activeTitle: user.gamification.activeTitle,
            avatarFrame: user.gamification.avatarFrame,
          }
        : undefined,
      plan: user.subscription?.plan ?? 'free',
      billingCycle: user.subscription?.billingCycle ?? 'none',
      subscriptionStatus: user.subscription?.subscriptionStatus ?? 'none',
      subscriptionExpiresAt: user.subscription?.subscriptionExpiresAt,
      createdAt: user.createdAt ?? undefined,
      updatedAt: user.updatedAt ?? undefined,
    };
  }

  private mapProfile(profile: any): UserProfileType {
    return {
      id: profile.id,
      realName: profile.realName,
      identity: profile.identity,
      gender: profile.gender,
      ethnicity: profile.ethnicity,
      birthDate: profile.birthDate,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      address: profile.address
        ? {
            zipCode: profile.address.zipCode,
            street: profile.address.street,
            city: profile.address.city,
            state: profile.address.state,
            district: profile.address.district,
            country: profile.address.country,
            number: profile.address.number,
          }
        : undefined,
      phones: profile.phones
        ? profile.phones.map((p: any) => ({
            ddi: p.ddi,
            ddd: p.ddd,
            number: p.number,
          }))
        : [],
    };
  }

  private mapAchievement(achievement: any): AchievementType {
    return {
      id: achievement.id,
      name: achievement.name,
      icon: achievement.icon,
      status: achievement.status,
      progress: achievement.progress,
      isLocked: achievement.isLocked ?? false,
      date: achievement.date,
    };
  }
}
