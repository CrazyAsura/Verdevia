import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICoursesRepository } from '../domain/ports/courses.repository.interface';
import { Course } from '../entities/course.entity';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject('ICoursesRepository')
    private readonly repository: ICoursesRepository,
  ) {}

  async execute(id: string, data: Partial<Course>) {
    const success = await this.repository.update(id, data);
    if (!success) throw new NotFoundException('Curso não encontrado');

    const course = await this.repository.findById(id);
    if (!course) throw new NotFoundException('Curso não encontrado');
    return course;
  }
}
