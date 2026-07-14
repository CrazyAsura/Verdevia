import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUsersRepository } from '../domain/ports/users.repository.interface';
import { UserRole } from '../enums/user.enums';
import * as argon2 from 'argon2';
import { ROLE_DEFAULT_PLAN } from '../../subscriptions/plans';

/** Platform-privileged roles that always have active subscription status. */
const PRIVILEGED_ROLES = new Set<string>([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

const LEGACY_SEED_PASSWORD_ALIASES: Record<string, string> = {
  ECOAAdmin2026Seguro: 'EcoaAdmin2026Seguro',
  ECOAAdmin2026Seguro: 'EcoaAdmin2026Seguro',
  ECOAContratante2026: 'EcoaContratante2026',
  ECOAContratante2026: 'EcoaContratante2026',
};

function getEmailCandidates(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const legacyEmail = normalizedEmail.endsWith('@ECOA.app')
    ? normalizedEmail.replace('@ECOA.app', '@ecoa.app')
    : null;

  return legacyEmail && legacyEmail !== normalizedEmail
    ? [normalizedEmail, legacyEmail]
    : [normalizedEmail];
}

function getPasswordCandidates(password: string) {
  const legacyPassword = LEGACY_SEED_PASSWORD_ALIASES[password];
  return legacyPassword && legacyPassword !== password
    ? [password, legacyPassword]
    : [password];
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(credentials: { email: string; password: string }) {
    const emailCandidates = getEmailCandidates(credentials.email);
    const passwordCandidates = getPasswordCandidates(credentials.password);
    const users = await Promise.all(
      emailCandidates.map((email) => this.repository.findByEmail(email)),
    );
    const user = users.find(Boolean);

    if (user) {
      const passwordResults = await Promise.all(
        passwordCandidates.map((password) => argon2.verify(user.password, password)),
      );
      const isPasswordValid = passwordResults.some(Boolean);

      if (isPasswordValid) {
        const { password, ...safeUser } = user as any;
        const isPrivileged = PRIVILEGED_ROLES.has(user.role);

        const payload = {
          sub: user.id,
          email: user.email,
          role: user.role,
          roles: [user.role],
          plan: user.subscription?.plan ?? ROLE_DEFAULT_PLAN[user.role] ?? 'free',
          subscriptionStatus: isPrivileged
            ? 'active'
            : (user.subscription?.subscriptionStatus ??
              (ROLE_DEFAULT_PLAN[user.role] === 'free' ? 'none' : 'active')),
          userName: user.profile?.realName ?? user.email,
        };

        const token = this.jwtService.sign(payload);

        return { user: safeUser, token };
      }
    }

    throw new UnauthorizedException('Credenciais inválidas');
  }
}
