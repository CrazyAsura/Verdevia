import { Injectable, Inject } from '@nestjs/common';
import { IUsersRepository } from '../domain/ports/users.repository.interface';

@Injectable()
export class GetAchievementsUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
  ) {}

  async execute(userId: string) {
    return this.repository.getAchievements(userId);
  }
}
