import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';
import { ForumComment } from '../entities/forum-comment.entity';
import { FindOneForumPostUseCase } from './find-one-post.usecase';

@Injectable()
export class AddForumCommentUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
    private readonly findOnePostUseCase: FindOneForumPostUseCase,
  ) {}

  async execute(postId: string, data: Partial<ForumComment>) {
    const post = await this.findOnePostUseCase.execute(postId);
    const comment = new ForumComment();
    Object.assign(comment, { ...data, post });

    await this.repository.incrementPostCommentsCount(postId);
    return this.repository.saveComment(comment);
  }
}
