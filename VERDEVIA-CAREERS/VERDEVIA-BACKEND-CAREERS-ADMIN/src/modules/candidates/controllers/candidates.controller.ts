import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateCandidateUseCase } from '../use-cases/create-candidate.usecase';
import { FindAllCandidatesUseCase } from '../use-cases/find-all-candidates.usecase';
import { FindOneCandidateUseCase } from '../use-cases/find-one-candidate.usecase';
import { CreateCandidateDto } from '../dto/create-candidate.dto';

@ApiTags('Candidates')
@Controller('candidates')
@UseInterceptors(ClassSerializerInterceptor)
export class CandidatesController {
  constructor(
    private readonly createUseCase: CreateCandidateUseCase,
    private readonly findAllUseCase: FindAllCandidatesUseCase,
    private readonly findOneUseCase: FindOneCandidateUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar um candidato' })
  create(@Body() dto: CreateCandidateDto) {
    return this.createUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os candidatos' })
  findAll() {
    return this.findAllUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do candidato por ID' })
  findOne(@Param('id') id: string) {
    return this.findOneUseCase.execute(id);
  }
}
