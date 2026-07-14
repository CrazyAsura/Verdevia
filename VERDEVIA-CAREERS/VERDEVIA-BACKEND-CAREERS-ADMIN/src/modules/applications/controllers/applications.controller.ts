import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApplyForJobUseCase } from '../use-cases/apply-for-job.usecase';
import { FindAllApplicationsUseCase } from '../use-cases/find-all-applications.usecase';
import { UpdateApplicationStatusUseCase } from '../use-cases/update-application-status.usecase';
import { ApplyForJobDto } from '../dto/apply-for-job.dto';
import { UpdateApplicationStatusDto } from '../dto/update-application-status.dto';

@ApiTags('Applications')
@Controller('applications')
@UseInterceptors(ClassSerializerInterceptor)
export class ApplicationsController {
  constructor(
    private readonly applyUseCase: ApplyForJobUseCase,
    private readonly findAllUseCase: FindAllApplicationsUseCase,
    private readonly updateStatusUseCase: UpdateApplicationStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Enviar uma nova candidatura' })
  apply(@Body() dto: ApplyForJobDto) {
    return this.applyUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as candidaturas' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da candidatura' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.updateStatusUseCase.execute(id, dto);
  }
}
