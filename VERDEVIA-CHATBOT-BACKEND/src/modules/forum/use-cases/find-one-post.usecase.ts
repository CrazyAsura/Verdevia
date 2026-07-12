import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';

@Injectable()
export class FindOneForumPostUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(id: string) {
    const post = await this.repository.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
