import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationStatusDto {
  @ApiProperty({ description: 'Novo status (reviewing, interviewing, accepted, rejected)' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ description: 'Feedback/Observações' })
  @IsString()
  @IsOptional()
  feedback?: string;
}
