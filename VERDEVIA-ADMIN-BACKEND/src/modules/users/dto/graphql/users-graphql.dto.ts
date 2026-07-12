import {
  ObjectType,
  Field,
  ID,
  Int,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { UserGender, UserEthnicity, UserRole } from '../../enums/user.enums';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Enum Registration ───────────────────────────────────────────────────────

registerEnumType(UserGender, { name: 'UserGender' });
registerEnumType(UserEthnicity, { name: 'UserEthnicity' });
registerEnumType(UserRole, { name: 'UserRole' });

// ─── Nested Types ───────────────────────────────────────────────────────────

@ObjectType()
export class AddressType {
  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  street?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  district?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  number?: string;
}

@ObjectType()
export class PhoneType {
  @Field({ nullable: true })
  ddi?: string;

  @Field({ nullable: true })
  ddd?: string;

  @Field({ nullable: true })
  number?: string;
}

// ─── Main Types ─────────────────────────────────────────────────────────────

@ObjectType()
export class UserProfileType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  realName?: string;

  @Field({ nullable: true })
  identity?: string;

  @Field(() => UserGender)
  gender: UserGender;

  @Field(() => UserEthnicity)
  ethnicity: UserEthnicity;

  @Field({ nullable: true })
  birthDate?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => AddressType, { nullable: true })
  address?: AddressType;

  @Field(() => [PhoneType], { nullable: true })
  phones?: PhoneType[];
}

@ObjectType()
export class UserGamificationType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  xp: number;

  @Field(() => Int)
  level: number;

  @Field()
  isPremium: boolean;

  @Field({ nullable: true })
  activeTitle?: string;

  @Field({ nullable: true })
  avatarFrame?: string;
}

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => UserProfileType, { nullable: true })
  profile?: UserProfileType;

  @Field(() => UserGamificationType, { nullable: true })
  gamification?: UserGamificationType;

  @Field({ nullable: true })
  plan?: string;

  @Field({ nullable: true })
  billingCycle?: string;

  @Field({ nullable: true })
  subscriptionStatus?: string;

  @Field({ nullable: true })
  subscriptionExpiresAt?: Date;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class AchievementType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  icon: string;

  @Field()
  status: string;

  @Field(() => Int, { nullable: true })
  progress?: number;

  @Field()
  isLocked: boolean;

  @Field({ nullable: true })
  date?: string;
}

@ObjectType()
export class LoginResponseType {
  @Field()
  token: string;

  @Field(() => UserType)
  user: UserType;
}

@ObjectType()
export class MessageResponseType {
  @Field()
  message: string;
}

// ─── Input Types ────────────────────────────────────────────────────────────

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
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  state: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  district: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  country: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  number?: string;
}

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
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @Field()
  @IsString()
  @IsNotEmpty()
  realName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  identity: string;

  @Field(() => UserGender)
  @IsEnum(UserGender)
  gender: UserGender;

  @Field(() => UserEthnicity)
  @IsEnum(UserEthnicity)
  ethnicity: UserEthnicity;

  @Field()
  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @Field(() => AddressInput)
  @ValidateNested()
  @Type(() => AddressInput)
  address: AddressInput;

  @Field(() => [PhoneInput])
  @ValidateNested({ each: true })
  @Type(() => PhoneInput)
  phones: PhoneInput[];
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  password?: string;

  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  realName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  identity?: string;

  @Field(() => UserGender, { nullable: true })
  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender;

  @Field(() => UserEthnicity, { nullable: true })
  @IsEnum(UserEthnicity)
  @IsOptional()
  ethnicity?: UserEthnicity;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  birthDate?: string;

  @Field(() => AddressInput, { nullable: true })
  @ValidateNested()
  @Type(() => AddressInput)
  @IsOptional()
  address?: AddressInput;

  @Field(() => [PhoneInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => PhoneInput)
  @IsOptional()
  phones?: PhoneInput[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  activeTitle?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  avatarFrame?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  xp?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  level?: number;

  @Field({ nullable: true })
  @IsOptional()
  isPremium?: boolean;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

@InputType()
export class RequestPasswordResetInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  portal?: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}
