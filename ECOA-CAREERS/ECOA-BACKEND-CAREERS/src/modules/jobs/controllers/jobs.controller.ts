import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FindAllJobsUseCase } from '../use-cases/find-all-jobs.usecase';
import { FindOneJobUseCase } from '../use-cases/find-one-job.usecase';

@ApiTags('Jobs')
@Controller('jobs')
@UseInterceptors(ClassSerializerInterceptor)
export class JobsController {
  constructor(
    private readonly findAllUseCase: FindAllJobsUseCase,
    private readonly findOneUseCase: FindOneJobUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar vagas públicas ativas' })
  async findAll() {
    const jobs = await this.findAllUseCase.execute();
    return jobs.filter((job) => job.status === 'active');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma vaga por ID' })
  findOne(@Param('id') id: string) {
    return this.findOneUseCase.execute(id);
  }
}
