import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUsersRepository } from '../domain/ports/users.repository.interface';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    user.profile = {
      ...(user.profile ?? {}),
      ...(dto.realName !== undefined && { realName: dto.realName }),
      ...((dto.avatarUrl !== undefined || dto.profilePhoto !== undefined) && {
        avatarUrl: dto.avatarUrl ?? dto.profilePhoto,
      }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.phones !== undefined && { phones: dto.phones }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.ethnicity !== undefined && { ethnicity: dto.ethnicity }),
    } as any;

    if (dto.email !== undefined) user.email = dto.email;

    user.gamification = {
      ...(user.gamification ?? {}),
      ...(dto.activeTitle !== undefined && { activeTitle: dto.activeTitle }),
      ...(dto.avatarFrame !== undefined && { avatarFrame: dto.avatarFrame }),
    } as any;

    return this.repository.save(user);
  }
}
