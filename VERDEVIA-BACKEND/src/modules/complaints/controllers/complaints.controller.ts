import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComplaintsService } from '../services/complaints.service';
import { CreateComplaintDto } from '../dto/create-complaint.dto';
import { UpdateComplaintDto } from '../dto/update-complaint.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';
import { RequirePlanFeatures } from '../../subscriptions/decorators/require-plan.decorator';
import { PlanAccessGuard } from '../../subscriptions/guards/plan-access.guard';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar queixas com busca, filtros e paginação' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.complaintsService.findAll(page, limit, search, status);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('complaints:create', 'complaints:manage')
  @ApiOperation({ summary: 'Criar nova queixa' })
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter queixa por ID' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('complaints:manage')
  @ApiOperation({ summary: 'Atualizar queixa (completo)' })
  update(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    return this.complaintsService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('complaints:manage')
  @ApiOperation({ summary: 'Atualizar queixa (parcial)' })
  patch(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    return this.complaintsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('complaints:manage')
  @ApiOperation({ summary: 'Remover queixa' })
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(id);
  }
}
