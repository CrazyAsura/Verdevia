import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUsersRepository } from '../../domain/ports/users.repository.interface';
import { User } from '../../entities/user.entity';

@Injectable()
export class TypeORMUsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(user: Partial<User>) {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }

  async update(id: string, user: Partial<User>) {
    await this.repo.update(id, user);
    return this.findById(id);
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'profile',
        'gamification',
        'subscription',
        'parentUser',
        'parentUser.parentUser',
      ],
    });
  }

  async findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      relations: ['profile', 'gamification', 'subscription'],
    });
  }

  async findAll() {
    return this.repo.find({
      relations: ['profile', 'gamification', 'subscription'],
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }

  async save(user: User) {
    return this.repo.save(user);
  }

  async getAchievements(userId: string) {
    // Em uma app real, buscaríamos da tabela Achievement
    // Por enquanto, como o save() no seed funciona, vamos garantir que o repositório retorne do banco
    return this.repo.manager.find('Achievement', {
      where: { user: { id: userId } },
    });
  }
}
