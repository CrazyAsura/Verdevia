import { Injectable, Inject } from '@nestjs/common';
import { IUsersRepository } from '../domain/ports/users.repository.interface';

@Injectable()
export class AddXpUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
  ) {}

  async execute(userId: string, amount: number) {
    const user = await this.repository.findById(userId);
    if (!user || !user.gamification) return;

    user.gamification.xp += amount;
    const newLevel = Math.floor(user.gamification.xp / 1000) + 1;
    if (newLevel > user.gamification.level) {
      user.gamification.level = newLevel;
    }

    return this.repository.save(user);
  }
}
