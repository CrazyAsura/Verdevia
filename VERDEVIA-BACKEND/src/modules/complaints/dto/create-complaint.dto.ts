import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { PollutionType, ComplaintPrivacy } from '../enums/complaint.enums';

export class CreateComplaintDto {
  @IsEnum(PollutionType, { message: 'Tipo de poluição inválido' })
  type: PollutionType;

  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(ComplaintPrivacy, { message: 'Configuração de privacidade inválida' })
  privacy: ComplaintPrivacy;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  userId: string;
}
