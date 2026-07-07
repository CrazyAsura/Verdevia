import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersResolver } from './resolvers/users.resolver';
import { TypeORMUsersRepository } from './infrastructure/persistence/typeorm-users.repository';
import { ComplianceModule } from '../compliance/compliance.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { GamificationModule } from '../gamification/gamification.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { UpdateUserProfileUseCase } from './use-cases/update-user-profile.usecase';
import { AddXpUseCase } from './use-cases/add-xp.usecase';
import { LoginUserUseCase } from './use-cases/login-user.usecase';
import { FindAllUsersUseCase } from './use-cases/find-all-users.usecase';
import { FindOneUserUseCase } from './use-cases/find-one-user.usecase';
import { GetProfileUseCase } from './use-cases/get-profile.usecase';
import { RemoveUserUseCase } from './use-cases/remove-user.usecase';
import { GetAchievementsUseCase } from './use-cases/get-achievements.usecase';
import { SmtpMailService } from '../../common/mail/smtp-mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ComplianceModule,
    ProfilesModule,
    GamificationModule,
    SubscriptionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'fallback-dev-secret',
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRATION') ?? '7d') as any,
          audience: config.get<string>('JWT_AUDIENCE') ?? 'VERDEVIA-app',
          issuer: config.get<string>('JWT_ISSUER') ?? 'VERDEVIA-backend',
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersResolver,
    {
      provide: 'IUsersRepository',
      useClass: TypeORMUsersRepository,
    },
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateUserProfileUseCase,
    AddXpUseCase,
    LoginUserUseCase,
    FindAllUsersUseCase,
    FindOneUserUseCase,
    GetProfileUseCase,
    RemoveUserUseCase,
    GetAchievementsUseCase,
    SmtpMailService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
