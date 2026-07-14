import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AiAnalysisLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class AnalyzeImageDto {
  @IsString()
  @IsNotEmpty()
  imageBase64: string;

  @IsString()
  @IsOptional()
  complaintText?: string;

  @ValidateNested()
  @Type(() => AiAnalysisLocationDto)
  location: AiAnalysisLocationDto;

  @IsString()
  @IsOptional()
  requestId?: string;
}
