import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';

@Injectable()
export class FindAllForumPostsUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(page = 1, limit = 10, search?: string, category?: string) {
    const result = await this.repository.findAll(page, limit, search, category);
    return { ...result, page };
  }
}
