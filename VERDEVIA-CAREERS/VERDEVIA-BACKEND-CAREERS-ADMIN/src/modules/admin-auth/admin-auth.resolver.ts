import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CareersAdminRole, CareersLoginInput, CareersLoginResponse } from './admin-auth.dto';

@Injectable()
@Resolver()
export class AdminAuthResolver {
  constructor(private readonly config: ConfigService, private readonly jwt: JwtService) {}

  @Mutation(() => CareersLoginResponse)
  async loginUser(@Args('input') input: CareersLoginInput): Promise<CareersLoginResponse> {
    const accounts = [
      { role: CareersAdminRole.SUPER_ADMIN, email: this.config.get('SEED_SUPER_ADMIN_EMAIL'), password: this.config.get('SEED_SUPER_ADMIN_PASSWORD'), name: this.config.get('SEED_SUPER_ADMIN_NAME') || 'Super Admin' },
      { role: CareersAdminRole.ADMIN, email: this.config.get('SEED_ADMIN_EMAIL'), password: this.config.get('SEED_ADMIN_PASSWORD'), name: this.config.get('SEED_ADMIN_NAME') || 'Administrador' },
    ];
    const account = accounts.find((item) => item.email?.toLowerCase() === input.email.trim().toLowerCase());
    if (!account?.password || !(await this.matches(input.password, account.password))) throw new UnauthorizedException('Credenciais inválidas');
    const id = `${account.role.toLowerCase()}:${account.email}`;
    const token = await this.jwt.signAsync({ sub: id, email: account.email, userName: account.name, role: account.role, roles: [account.role] });
    return { token, user: { id, email: account.email, role: account.role, profile: { realName: account.name } } };
  }

  private async matches(input: string, stored: string) {
    if (stored.startsWith('$argon2')) return argon2.verify(stored, input);
    return input === stored;
  }
}
