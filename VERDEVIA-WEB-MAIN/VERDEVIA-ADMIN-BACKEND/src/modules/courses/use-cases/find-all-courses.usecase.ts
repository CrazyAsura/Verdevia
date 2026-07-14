import { Injectable, Inject } from '@nestjs/common';
import { ICoursesRepository } from '../domain/ports/courses.repository.interface';

@Injectable()
export class FindAllCoursesUseCase {
  constructor(
    @Inject('ICoursesRepository')
    private readonly repository: ICoursesRepository,
  ) {}

  async execute(page = 1, limit = 10, category?: string, level?: string) {
    const result = await this.repository.findAll(page, limit, category, level);
    return { ...result, page };
  }
}
