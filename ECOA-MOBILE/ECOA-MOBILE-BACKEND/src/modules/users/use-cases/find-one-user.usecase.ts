import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUsersRepository } from '../domain/ports/users.repository.interface';

@Injectable()
export class FindOneUserUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
  ) {}

  async execute(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}
