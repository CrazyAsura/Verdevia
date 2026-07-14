import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';

@Injectable()
export class DislikeForumCommentUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(commentId: string) {
    await this.repository.incrementCommentDislikes(commentId);
    return { success: true };
  }
}
