import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhoneDto {
  @ApiProperty({ example: '+55' })
  @IsString()
  @IsNotEmpty()
  ddi: string;

  @ApiProperty({ example: '11' })
  @IsString()
  @IsNotEmpty()
  ddd: string;

  @ApiProperty({ example: '99999-9999' })
  @IsString()
  @IsNotEmpty()
  number: string;
}

export class AddressDto {
  @ApiProperty({ example: '01310-100' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ example: 'Av. Paulista' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({ example: 'Apto 42' })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({ example: 'Bela Vista' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiPropertyOptional({ example: 'Brasil', default: 'Brasil' })
  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateCandidateDto {
  @ApiProperty({ description: 'Nome completo do candidato' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email do candidato' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Telefones de contato', type: [PhoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  @IsOptional()
  phones?: PhoneDto[];

  @ApiPropertyOptional({ description: 'Endereço do candidato', type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'URL do currículo' })
  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @ApiPropertyOptional({ description: 'URL do LinkedIn' })
  @IsString()
  @IsOptional()
  linkedInUrl?: string;

  @ApiPropertyOptional({ description: 'URL do portfólio' })
  @IsString()
  @IsOptional()
  portfolioUrl?: string;
}
