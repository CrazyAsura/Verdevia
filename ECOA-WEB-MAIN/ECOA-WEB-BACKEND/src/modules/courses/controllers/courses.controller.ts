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
import { CoursesService } from '../application/services/courses.service';
import { Course } from '../entities/course.entity';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';
import { RequirePlanFeatures } from '../../subscriptions/decorators/require-plan.decorator';
import { PlanAccessGuard } from '../../subscriptions/guards/plan-access.guard';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
    @Query('level') level?: string,
  ) {
    return this.coursesService.findAll(
      Number(page),
      Number(limit),
      category,
      level,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:manage')
  create(@Body() data: Partial<Course>) {
    return this.coursesService.create(data);
  }

  @Get('lessons/:id')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:read', 'courses:manage')
  findLesson(@Param('id') id: string) {
    return this.coursesService.findLesson(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:manage')
  update(@Param('id') id: string, @Body() data: Partial<Course>) {
    return this.coursesService.update(id, data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:manage')
  patch(@Param('id') id: string, @Body() data: Partial<Course>) {
    return this.coursesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:manage')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
