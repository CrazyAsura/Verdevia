import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';

@Injectable()
export class LikeForumCommentUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(commentId: string) {
    await this.repository.incrementCommentLikes(commentId);
    return { success: true };
  }
}
