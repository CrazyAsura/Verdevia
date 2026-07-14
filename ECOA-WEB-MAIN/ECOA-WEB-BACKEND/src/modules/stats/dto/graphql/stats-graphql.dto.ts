import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

@ObjectType()
export class RecentComplaintType {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  description: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class DashboardStatsType {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  totalComplaints: number;

  @Field(() => [RecentComplaintType])
  recentComplaints: RecentComplaintType[];
}

@ObjectType()
export class AuditLogType {
  @Field(() => ID)
  id: string;

  @Field()
  action: string;

  @Field({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  userName?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AuditLogsType {
  @Field(() => [AuditLogType])
  logs: AuditLogType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  lastPage: number;
}

@ObjectType()
export class MapDataPointType {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class SparkPredictionType {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Float, { nullable: true })
  intensity?: number;
}

@InputType()
export class LogVisitInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  path: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  action?: string;
}

@ObjectType()
export class ExportRequestType {
  @Field()
  queued: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class ExportFileType {
  @Field()
  filename: string;

  @Field()
  mimeType: string;

  @Field()
  base64: string;
}
