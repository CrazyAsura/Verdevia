import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ComplaintsService } from '../services/complaints.service';
import {
  ComplaintType,
  PaginatedComplaintsType,
  CreateComplaintInput,
  UpdateComplaintInput,
  ComplaintsFilterInput,
} from '../dto/graphql/complaints-graphql.dto';
import { MutationResultType } from '../../forum/dto/graphql/forum-graphql.dto';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';
import { RequirePlanFeatures } from '../../subscriptions/decorators/require-plan.decorator';
import { PlanAccessGuard } from '../../subscriptions/guards/plan-access.guard';

@Resolver(() => ComplaintType)
export class ComplaintsResolver {
  constructor(private readonly complaintsService: ComplaintsService) {}

  // ─── Queries ──────────────────────────────────────────────────────────────

  @Query(() => PaginatedComplaintsType, {
    description: 'Get paginated list of complaints',
  })
  async complaints(
    @Args('filter', { nullable: true }) filter?: ComplaintsFilterInput,
  ): Promise<PaginatedComplaintsType> {
    const { page = 1, limit = 10, search, status } = filter ?? {};
    const result = await this.complaintsService.findAll(
      page,
      limit,
      search,
      status,
    );

    return {
      items: result.items.map(this.mapComplaint),
      total: result.total,
      page,
      limit,
      lastPage: result.lastPage,
    };
  }

  @Query(() => ComplaintType, {
    nullable: true,
    description: 'Get complaint by ID',
  })
  async complaint(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ComplaintType | null> {
    const complaint = await this.complaintsService.findOne(id);
    return complaint ? this.mapComplaint(complaint) : null;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  @Mutation(() => ComplaintType, { description: 'Create new complaint' })
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('complaints:create', 'complaints:manage')
  async createComplaint(
    @Args('input') input: CreateComplaintInput,
  ): Promise<ComplaintType> {
    const complaint = await this.complaintsService.create(input);
    return this.mapComplaint(complaint);
  }

  @Mutation(() => ComplaintType, {
    nullable: true,
    description: 'Update existing complaint',
  })
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('complaints:manage')
  async updateComplaint(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateComplaintInput,
  ): Promise<ComplaintType | null> {
    const complaint = await this.complaintsService.update(id, input);
    return complaint ? this.mapComplaint(complaint) : null;
  }

  @Mutation(() => MutationResultType, { description: 'Remove a complaint' })
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('complaints:manage')
  async removeComplaint(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationResultType> {
    const result = await this.complaintsService.remove(id);
    return {
      success: result.success,
      message: result.success ? 'Denúncia removida' : 'Denúncia não encontrada',
    };
  }

  // ─── Mapper ───────────────────────────────────────────────────────────────

  private mapComplaint(complaint: any): ComplaintType {
    return {
      id: complaint.id,
      type: complaint.type,
      description: complaint.description,
      location: complaint.location,
      imageUrl: complaint.imageUrl,
      status: complaint.status,
      privacy: complaint.privacy,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      ip: complaint.ip,
      user: complaint.user
        ? {
            id: complaint.user.id,
            email: complaint.user.email,
            role: complaint.user.role,
            createdAt: complaint.user.createdAt,
            updatedAt: complaint.user.updatedAt,
          }
        : undefined,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
    };
  }
}
