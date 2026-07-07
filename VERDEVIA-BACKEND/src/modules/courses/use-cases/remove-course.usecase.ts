import { Injectable, Inject } from '@nestjs/common';
import { ICoursesRepository } from '../domain/ports/courses.repository.interface';

@Injectable()
export class RemoveCourseUseCase {
  constructor(
    @Inject('ICoursesRepository')
    private readonly repository: ICoursesRepository,
  ) {}

  async execute(id: string) {
    const success = await this.repository.delete(id);
    return { success };
  }
}
