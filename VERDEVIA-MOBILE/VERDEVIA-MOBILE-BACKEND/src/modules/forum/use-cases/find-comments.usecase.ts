import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';

@Injectable()
export class FindForumCommentsUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(postId: string) {
    return this.repository.findComments(postId);
  }
}
