import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUsersRepository } from '../domain/ports/users.repository.interface';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
  ) {}

  async execute(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const unlockedItems: any[] = [
      {
        id: '1',
        name: 'Título Iniciante',
        type: 'title',
        value: 'Eco-Iniciante',
      },
    ];
    if (user.gamification?.level >= 2) {
      unlockedItems.push({
        id: '2',
        name: 'Sentinela',
        type: 'title',
        value: 'Sentinela da Natureza',
      });
    }
    if (user.gamification?.level >= 3) {
      unlockedItems.push({
        id: '3',
        name: 'Mestre',
        type: 'title',
        value: user.gamification?.activeTitle || 'Mestre da Reciclagem',
      });
      unlockedItems.push({
        id: 'frame-gold',
        name: 'Borda Ouro',
        type: 'frame',
        value: 'https://i.ibb.co/L5TFrv7/eco-frame-gold.png',
      });
    }

    const { password, profile, ...safeUser } = user as any;
    // Map internal details to the consolidated profile response
    const { gamification, ...cleanUser } = safeUser;

    return {
      ...profile,
      ...cleanUser,
      ...gamification,
      id: user.id,
      profileId: profile?.id,
      unlockedItems,
    };
  }
}
