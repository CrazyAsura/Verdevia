import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

@ObjectType()
export class JobType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  requirements?: string;

  @Field({ nullable: true })
  benefits?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  salary?: number;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateJobInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  requirements?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  benefits?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  salary?: number;
}

@InputType()
export class UpdateJobInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  requirements?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  benefits?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  salary?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;
}
