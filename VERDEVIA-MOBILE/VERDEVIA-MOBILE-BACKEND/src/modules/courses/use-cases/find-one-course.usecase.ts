import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICoursesRepository } from '../domain/ports/courses.repository.interface';

@Injectable()
export class FindOneCourseUseCase {
  constructor(
    @Inject('ICoursesRepository')
    private readonly repository: ICoursesRepository,
  ) {}

  async execute(id: string) {
    const course = await this.repository.findById(id);
    if (!course) throw new NotFoundException('Curso não encontrado');
    return course;
  }
}
