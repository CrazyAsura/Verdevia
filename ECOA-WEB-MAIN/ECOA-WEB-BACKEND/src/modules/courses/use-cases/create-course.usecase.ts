import { Injectable, Inject } from '@nestjs/common';
import { ICoursesRepository } from '../domain/ports/courses.repository.interface';
import { Course } from '../entities/course.entity';

@Injectable()
export class CreateCourseUseCase {
  constructor(
    @Inject('ICoursesRepository')
    private readonly repository: ICoursesRepository,
  ) {}

  async execute(data: Partial<Course>) {
    return this.repository.create(data);
  }
}
