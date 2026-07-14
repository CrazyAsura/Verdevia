import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApplyForJobUseCase } from '../use-cases/apply-for-job.usecase';
import { ApplyForJobDto } from '../dto/apply-for-job.dto';

@ApiTags('Applications')
@Controller('applications')
@UseInterceptors(ClassSerializerInterceptor)
export class ApplicationsController {
  constructor(
    private readonly applyUseCase: ApplyForJobUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Enviar uma nova candidatura' })
  apply(@Body() dto: ApplyForJobDto) {
    return this.applyUseCase.execute(dto);
  }
}
