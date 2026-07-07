import {
  ObjectType,
  Field,
  ID,
  Float,
  Int,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  ComplaintStatus,
  PollutionType,
  ComplaintPrivacy,
} from '../../enums/complaint.enums';
import { UserType } from '../../../users/dto/graphql/users-graphql.dto';

// ─── Enum Registration ───────────────────────────────────────────────────────

registerEnumType(ComplaintStatus, { name: 'ComplaintStatus' });
registerEnumType(PollutionType, { name: 'PollutionType' });
registerEnumType(ComplaintPrivacy, { name: 'ComplaintPrivacy' });

// ─── Object Types ────────────────────────────────────────────────────────────

@ObjectType()
export class ComplaintType {
  @Field(() => ID)
  id: string;

  @Field(() => PollutionType)
  type: PollutionType;

  @Field()
  description: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => ComplaintStatus)
  status: ComplaintStatus;

  @Field(() => ComplaintPrivacy)
  privacy: ComplaintPrivacy;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  ip?: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedComplaintsType {
  @Field(() => [ComplaintType])
  items: ComplaintType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  lastPage: number;
}

// ─── Input Types ────────────────────────────────────────────────────────────

@InputType()
export class CreateComplaintInput {
  @Field(() => PollutionType)
  type: PollutionType;

  @Field()
  description: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => ComplaintPrivacy)
  privacy: ComplaintPrivacy;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  ip?: string;

  @Field()
  userId: string;
}

@InputType()
export class UpdateComplaintInput {
  @Field(() => PollutionType, { nullable: true })
  type?: PollutionType;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => ComplaintPrivacy, { nullable: true })
  privacy?: ComplaintPrivacy;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  ip?: string;

  @Field(() => ComplaintStatus, { nullable: true })
  status?: ComplaintStatus;
}

@InputType()
export class ComplaintsFilterInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit?: number;

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  status?: string;
}
