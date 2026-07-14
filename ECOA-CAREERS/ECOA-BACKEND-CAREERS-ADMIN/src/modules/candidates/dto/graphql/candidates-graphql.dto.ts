import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ─── Value Object Types ───────────────────────────────────────────────────────

@ObjectType('PhoneType')
@InputType('PhoneInput')
export class PhoneGqlType {
  @Field()
  ddi: string;

  @Field()
  ddd: string;

  @Field()
  number: string;
}

@ObjectType('AddressType')
@InputType('AddressInput')
export class AddressGqlType {
  @Field()
  zipCode: string;

  @Field()
  street: string;

  @Field()
  number: string;

  @Field({ nullable: true })
  complement?: string;

  @Field()
  district: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field({ nullable: true, defaultValue: 'Brasil' })
  country?: string;
}

// ─── Candidate ObjectType ─────────────────────────────────────────────────────

@ObjectType()
export class CandidateType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => [PhoneGqlType], { nullable: true })
  phones?: PhoneGqlType[];

  @Field(() => AddressGqlType, { nullable: true })
  address?: AddressGqlType;

  @Field({ nullable: true })
  resumeUrl?: string;

  @Field({ nullable: true })
  linkedInUrl?: string;

  @Field({ nullable: true })
  portfolioUrl?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ─── CreateCandidateInput ─────────────────────────────────────────────────────

@InputType()
export class PhoneInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  ddi: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  ddd: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  number: string;
}

@InputType()
export class AddressInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  street: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  number: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  complement?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  district: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  state: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;
}

@InputType()
export class CreateCandidateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => [PhoneInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneInput)
  @IsOptional()
  phones?: PhoneInput[];

  @Field(() => AddressInput, { nullable: true })
  @ValidateNested()
  @Type(() => AddressInput)
  @IsOptional()
  address?: AddressInput;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  linkedInUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  portfolioUrl?: string;
}
