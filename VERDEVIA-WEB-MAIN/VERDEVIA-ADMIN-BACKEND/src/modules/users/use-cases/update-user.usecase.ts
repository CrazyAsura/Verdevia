import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUsersRepository } from '../domain/ports/users.repository.interface';
import * as argon2 from 'argon2';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly repository: IUsersRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (
      dto.realName ||
      dto.address ||
      dto.phones ||
      dto.gender ||
      dto.ethnicity
    ) {
      user.profile = {
        ...user.profile,
        ...(dto.realName && { realName: dto.realName }),
        ...(dto.address && { address: dto.address }),
        ...(dto.phones && { phones: dto.phones }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.ethnicity && { ethnicity: dto.ethnicity }),
      };
    }

    if (dto.email) user.email = dto.email;
    if (dto.password) user.password = await argon2.hash(dto.password);
    if (dto.role) user.role = dto.role;

    return this.repository.save(user);
  }
}
