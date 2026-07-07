import {
  ObjectType,
  Field,
  ID,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { ConsentPurpose } from '../../entities/consent.entity';
import { UserType } from '../../../users/dto/graphql/users-graphql.dto';
import { ComplaintType } from '../../../complaints/dto/graphql/complaints-graphql.dto';

// ─── Enum Registration ───────────────────────────────────────────────────────

registerEnumType(ConsentPurpose, { name: 'ConsentPurpose' });

// ─── Object Types ────────────────────────────────────────────────────────────

@ObjectType()
export class ConsentType {
  @Field(() => ID)
  id: string;

  @Field(() => ConsentPurpose)
  purpose: ConsentPurpose;

  @Field()
  status: boolean;

  @Field()
  version: string;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ExportDataType {
  @Field()
  exportedAt: Date;

  @Field(() => UserType)
  user: UserType;

  @Field(() => [ComplaintType])
  complaints: ComplaintType[];

  @Field(() => [ConsentType])
  consents: ConsentType[];
}

@ObjectType()
export class ComplianceVersionType {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  version: string;

  @Field()
  content: string;

  @Field()
  pdfName: string;

  @Field()
  isActive: boolean;

  @Field()
  publishedAt: Date;
}

// ─── Input Types ────────────────────────────────────────────────────────────

@InputType()
export class ConsentUpdateInput {
  @Field(() => ConsentPurpose)
  purpose: ConsentPurpose;

  @Field()
  status: boolean;

  @Field({ nullable: true })
  version?: string;
}

@InputType()
export class PublishComplianceVersionInput {
  @Field()
  type: string;

  @Field()
  version: string;

  @Field()
  content: string;

  @Field()
  pdfName: string;
}
