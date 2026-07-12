import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../enums/user.enums';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAddressDto {
  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  number?: string;
}

class UpdatePhoneDto {
  @IsString()
  @IsOptional()
  ddi?: string;

  @IsString()
  @IsOptional()
  ddd?: string;

  @IsString()
  @IsOptional()
  number?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['address', 'phones'] as const),
) {
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  @IsOptional()
  address?: UpdateAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePhoneDto)
  @IsOptional()
  phones?: UpdatePhoneDto[];

  @IsString()
  @IsOptional()
  activeTitle?: string;

  @IsString()
  @IsOptional()
  avatarFrame?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @IsNumber()
  @IsOptional()
  xp?: number;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
