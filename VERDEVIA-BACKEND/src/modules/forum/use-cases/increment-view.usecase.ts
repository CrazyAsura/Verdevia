import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';

@Injectable()
export class IncrementForumPostViewUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(id: string) {
    await this.repository.incrementViews(id);
    return { success: true };
  }
}
