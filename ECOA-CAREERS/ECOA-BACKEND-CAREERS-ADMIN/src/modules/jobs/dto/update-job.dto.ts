import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobDto {
  @ApiPropertyOptional({ description: 'Título da vaga' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição da vaga' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Requisitos' })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional({ description: 'Benefícios' })
  @IsString()
  @IsOptional()
  benefits?: string;

  @ApiPropertyOptional({ description: 'Localização' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Salário' })
  @IsNumber()
  @IsOptional()
  salary?: number;

  @ApiPropertyOptional({ description: 'Status (active, inactive)' })
  @IsString()
  @IsOptional()
  status?: string;
}
