import { Injectable, Inject } from '@nestjs/common';
import { IForumRepository } from '../domain/ports/forum.repository.interface';

@Injectable()
export class RemoveForumPostUseCase {
  constructor(
    @Inject('IForumRepository')
    private readonly repository: IForumRepository,
  ) {}

  async execute(id: string) {
    const success = await this.repository.delete(id);
    return { success };
  }
}
