import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ description: 'Nome do candidato' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email do candidato' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Telefone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'URL do currículo' })
  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @ApiPropertyOptional({ description: 'URL do LinkedIn' })
  @IsString()
  @IsOptional()
  linkedInUrl?: string;
}
