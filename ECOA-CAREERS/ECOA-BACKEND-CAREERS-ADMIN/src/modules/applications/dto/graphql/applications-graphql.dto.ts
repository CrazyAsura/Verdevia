import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, Equals } from 'class-validator';
import { JobType } from '../../../jobs/dto/graphql/jobs-graphql.dto';
import { CandidateType } from '../../../candidates/dto/graphql/candidates-graphql.dto';

@ObjectType()
export class ApplicationType {
  @Field(() => ID)
  id: string;

  @Field()
  jobId: string;

  @Field()
  candidateId: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  feedback?: string;

  @Field(() => JobType, { nullable: true })
  job?: JobType;

  @Field(() => CandidateType, { nullable: true })
  candidate?: CandidateType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  lgpdConsent: boolean;

  @Field()
  consentVersion: string;

  @Field()
  consentedAt: Date;

  @Field()
  retainUntil: Date;
}

@InputType()
export class ApplyForJobInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  linkedInUrl?: string;

  @Field()
  @IsBoolean()
  @Equals(true)
  lgpdConsent: boolean;
}

@InputType()
export class UpdateApplicationStatusInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  status: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  feedback?: string;
}
