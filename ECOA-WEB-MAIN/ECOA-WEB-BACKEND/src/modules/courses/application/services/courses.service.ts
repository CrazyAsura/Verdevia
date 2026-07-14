import { Injectable } from '@nestjs/common';
import { Course } from '../../entities/course.entity';
import { FindAllCoursesUseCase } from '../../use-cases/find-all-courses.usecase';
import { FindOneCourseUseCase } from '../../use-cases/find-one-course.usecase';
import { CreateCourseUseCase } from '../../use-cases/create-course.usecase';
import { UpdateCourseUseCase } from '../../use-cases/update-course.usecase';
import { RemoveCourseUseCase } from '../../use-cases/remove-course.usecase';
import { FindLessonUseCase } from '../../use-cases/find-lesson.usecase';

@Injectable()
export class CoursesService {
  constructor(
    private readonly findAllCoursesUseCase: FindAllCoursesUseCase,
    private readonly findOneCourseUseCase: FindOneCourseUseCase,
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly removeCourseUseCase: RemoveCourseUseCase,
    private readonly findLessonUseCase: FindLessonUseCase,
  ) {}

  async findAll(page = 1, limit = 10, category?: string, level?: string) {
    return this.findAllCoursesUseCase.execute(page, limit, category, level);
  }

  async findOne(id: string) {
    return this.findOneCourseUseCase.execute(id);
  }

  async create(data: Partial<Course>) {
    return this.createCourseUseCase.execute(data);
  }

  async update(id: string, data: Partial<Course>) {
    return this.updateCourseUseCase.execute(id, data);
  }

  async remove(id: string) {
    return this.removeCourseUseCase.execute(id);
  }

  async findLesson(id: string) {
    return this.findLessonUseCase.execute(id);
  }
}
