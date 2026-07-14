import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, Equals } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyForJobDto {
  @ApiProperty({ description: 'ID da vaga' })
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ description: 'Nome do candidato' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email do candidato' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Telefones estruturados' })
  @IsOptional()
  phones?: Array<{ ddi: string; ddd: string; number: string }>;

  @ApiPropertyOptional({ description: 'Endereco estruturado' })
  @IsOptional()
  address?: { zipCode:string; street:string; number:string; complement?:string; district:string; city:string; state:string; country?:string };

  @ApiPropertyOptional({ description: 'URL do currículo' })
  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @ApiPropertyOptional({ description: 'URL do LinkedIn' })
  @IsString()
  @IsOptional()
  linkedInUrl?: string;

  @ApiProperty({
    description:
      'Consentimento LGPD para uso dos dados exclusivamente no processo seletivo',
  })
  @IsBoolean()
  @Equals(true)
  lgpdConsent: boolean;
}
