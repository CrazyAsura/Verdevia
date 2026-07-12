import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserGender, UserEthnicity } from '../enums/user.enums';
import { UserRole } from '../enums/user.enums';
import { ApiProperty } from '@nestjs/swagger';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  number?: string;
}

class PhoneDto {
  @IsString()
  @IsNotEmpty()
  ddi: string;

  @IsString()
  @IsNotEmpty()
  ddd: string;

  @IsString()
  @IsNotEmpty()
  number: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: 'VERDEVIAAdmin2026Seguro' })
  @IsString()
  @MinLength(4, { message: 'A senha deve ter pelo menos 4 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome real é obrigatório' })
  realName: string;

  @IsString()
  @IsNotEmpty({ message: 'Documento de identidade é obrigatório' })
  identity: string;

  @IsEnum(UserGender, { message: 'Gênero inválido' })
  gender: UserGender;

  @IsEnum(UserEthnicity, { message: 'Etnia inválida' })
  ethnicity: UserEthnicity;

  @IsDateString({}, { message: 'Formato de data inválido (AAAA-MM-DD)' })
  birthDate: string;

  @IsEnum(UserRole, { message: 'Cargo inválido' })
  @IsOptional()
  role?: UserRole;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phones: PhoneDto[];
}
