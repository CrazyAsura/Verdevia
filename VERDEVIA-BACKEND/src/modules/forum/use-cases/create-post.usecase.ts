import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';
import { ForumPost } from '../entities/forum-post.entity';

@Injectable()
export class CreateForumPostUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(data: Partial<ForumPost>) {
    const post = new ForumPost();
    Object.assign(post, data);
    return this.repository.save(post);
  }
}
