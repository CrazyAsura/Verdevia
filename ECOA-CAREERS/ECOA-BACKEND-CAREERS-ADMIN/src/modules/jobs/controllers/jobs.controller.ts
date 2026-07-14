import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateJobUseCase } from '../use-cases/create-job.usecase';
import { FindAllJobsUseCase } from '../use-cases/find-all-jobs.usecase';
import { FindOneJobUseCase } from '../use-cases/find-one-job.usecase';
import { UpdateJobUseCase } from '../use-cases/update-job.usecase';
import { DeleteJobUseCase } from '../use-cases/delete-job.usecase';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';

@ApiTags('Jobs')
@Controller('jobs')
@UseInterceptors(ClassSerializerInterceptor)
export class JobsController {
  constructor(
    private readonly createUseCase: CreateJobUseCase,
    private readonly findAllUseCase: FindAllJobsUseCase,
    private readonly findOneUseCase: FindOneJobUseCase,
    private readonly updateUseCase: UpdateJobUseCase,
    private readonly deleteUseCase: DeleteJobUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova vaga' })
  create(@Body() dto: CreateJobDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as vagas' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma vaga por ID' })
  findOne(@Param('id') id: string) {
    return this.findOneUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma vaga' })
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma vaga' })
  remove(@Param('id') id: string) {
    return this.deleteUseCase.execute(id);
  }
}
