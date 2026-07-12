import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICoursesRepository } from '../domain/ports/courses.repository.interface';

@Injectable()
export class FindLessonUseCase {
  constructor(
    @Inject('ICoursesRepository')
    private readonly repository: ICoursesRepository,
  ) {}

  async execute(id: string) {
    const lesson = await this.repository.findLessonById(id);
    if (!lesson) throw new NotFoundException('Lição não encontrada');
    return lesson;
  }
}
