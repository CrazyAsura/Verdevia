import { Injectable, Inject } from '@nestjs/common';
import { IUsersRepository } from '../domain/ports/users.repository.interface';

@Injectable()
export class RemoveUserUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
  ) {}

  async execute(id: string) {
    const success = await this.repository.delete(id);
    return { success };
  }
}
