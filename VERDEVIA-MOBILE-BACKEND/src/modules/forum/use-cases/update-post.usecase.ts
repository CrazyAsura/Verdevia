import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';
import { ForumPost } from '../entities/forum-post.entity';
import { FindOneForumPostUseCase } from './find-one-post.usecase';

@Injectable()
export class UpdateForumPostUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
    private readonly findOnePostUseCase: FindOneForumPostUseCase,
  ) {}

  async execute(id: string, data: Partial<ForumPost>) {
    const post = await this.findOnePostUseCase.execute(id);
    Object.assign(post, data);
    return this.repository.save(post);
  }
}
