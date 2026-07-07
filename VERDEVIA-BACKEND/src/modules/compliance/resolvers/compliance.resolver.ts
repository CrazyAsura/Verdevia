import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ComplianceService } from '../services/compliance.service';
import {
  ConsentType,
  ExportDataType,
  ConsentUpdateInput,
  ComplianceVersionType,
  PublishComplianceVersionInput,
} from '../dto/graphql/compliance-graphql.dto';
import { MutationResultType } from '../../forum/dto/graphql/forum-graphql.dto';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';

@Resolver()
export class ComplianceResolver {
  constructor(private readonly complianceService: ComplianceService) {}

  // ─── Queries ──────────────────────────────────────────────────────────────

  @Query(() => [ConsentType], { description: 'Get user privacy consents' })
  @UseGuards(JwtAuthGuard)
  async userConsents(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<ConsentType[]> {
    const consents = await this.complianceService.getConsents(userId);
    return consents.map(this.mapConsent);
  }

  @Query(() => [ComplianceVersionType], {
    description: 'Get legal document version history by type',
  })
  @UseGuards(JwtAuthGuard)
  async complianceVersions(
    @Args('type') type: string,
  ): Promise<ComplianceVersionType[]> {
    const versions = await this.complianceService.getVersions(type);
    return versions.map(this.mapVersion);
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  @Mutation(() => [ConsentType], {
    description: 'Update user privacy consents',
  })
  @UseGuards(JwtAuthGuard)
  async updateUserConsents(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('updates', { type: () => [ConsentUpdateInput] })
    updates: ConsentUpdateInput[],
    @Context() context: any,
  ): Promise<ConsentType[]> {
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    const consents = await this.complianceService.updateConsents(
      userId,
      updates,
      ip,
    );
    return consents.map(this.mapConsent);
  }

  @Mutation(() => ComplianceVersionType, {
    description: 'Publish a new legal document version',
  })
  @UseGuards(JwtAuthGuard)
  async publishComplianceVersion(
    @Args('input') input: PublishComplianceVersionInput,
  ): Promise<ComplianceVersionType> {
    const version = await this.complianceService.publishVersion(
      input.type,
      input.version,
      input.content,
      input.pdfName,
    );
    return this.mapVersion(version);
  }

  @Mutation(() => ComplianceVersionType, {
    description: 'Activate an existing legal document version',
  })
  @UseGuards(JwtAuthGuard)
  async activateComplianceVersion(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ComplianceVersionType> {
    const version = await this.complianceService.activateVersion(id);
    return this.mapVersion(version);
  }

  @Mutation(() => MutationResultType, {
    description: 'Delete a legal document version',
  })
  @UseGuards(JwtAuthGuard)
  async deleteComplianceVersion(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationResultType> {
    await this.complianceService.deleteVersion(id);
    return { success: true, message: 'Versão removida' };
  }

  @Mutation(() => ExportDataType, {
    description: 'Export all personal data for user portability (LGPD)',
  })
  @UseGuards(JwtAuthGuard)
  async exportUserData(
    @Args('userId', { type: () => ID }) userId: string,
    @Context() context: any,
  ): Promise<ExportDataType> {
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    const data = await this.complianceService.exportUserData(userId, ip);
    return {
      exportedAt: data.exportedAt,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        profile: data.user.profile
          ? {
              id: '', // Not strictly needed for export data container, but conforms to type
              realName: data.user.profile.realName,
              identity: data.user.profile.identity,
              gender: data.user.profile.gender,
              ethnicity: data.user.profile.ethnicity,
              birthDate: data.user.profile.birthDate,
              bio: data.user.profile.bio,
              address: data.user.profile.address,
              phones: data.user.profile.phones,
            }
          : undefined,
        gamification: data.user.gamification
          ? {
              id: '',
              xp: data.user.gamification.xp,
              level: data.user.gamification.level,
              isPremium: false,
            }
          : undefined,
        createdAt: data.user.createdAt,
        updatedAt: new Date(),
      },
      complaints: data.complaints.map((c: any) => ({
        id: c.id,
        type: c.type,
        description: c.description,
        location: c.location,
        status: c.status,
        privacy: c.privacy,
        createdAt: c.createdAt,
        updatedAt: c.createdAt,
      })),
      consents: data.consents.map((c: any) => ({
        id: '',
        purpose: c.purpose,
        status: c.status,
        version: c.version,
        updatedAt: c.updatedAt,
      })),
    };
  }

  @Mutation(() => MutationResultType, {
    description: 'Anonymize/Delete user data (Right to be Forgotten)',
  })
  @UseGuards(JwtAuthGuard)
  async anonymizeUserData(
    @Args('userId', { type: () => ID }) userId: string,
    @Context() context: any,
  ): Promise<MutationResultType> {
    const req = context.req;
    const ip = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
    const result = await this.complianceService.anonymizeUserData(userId, ip);
    return {
      success: result.success,
      message: result.success
        ? 'Dados do usuário anonimizados'
        : 'Falha na anonimização',
    };
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapConsent(consent: any): ConsentType {
    return {
      id: consent.id,
      purpose: consent.purpose,
      status: consent.status,
      version: consent.version,
      updatedAt: consent.updatedAt,
    };
  }

  private mapVersion(version: any): ComplianceVersionType {
    return {
      id: version.id,
      type: version.type,
      version: version.version,
      content: version.content,
      pdfName: version.pdfName,
      isActive: version.isActive,
      publishedAt: version.publishedAt,
    };
  }
}
