import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserUseCase } from '../use-cases/create-user.usecase';
import { UpdateUserUseCase } from '../use-cases/update-user.usecase';
import { UpdateUserProfileUseCase } from '../use-cases/update-user-profile.usecase';
import { AddXpUseCase } from '../use-cases/add-xp.usecase';
import { LoginUserUseCase } from '../use-cases/login-user.usecase';
import { FindAllUsersUseCase } from '../use-cases/find-all-users.usecase';
import { FindOneUserUseCase } from '../use-cases/find-one-user.usecase';
import { GetProfileUseCase } from '../use-cases/get-profile.usecase';
import { RemoveUserUseCase } from '../use-cases/remove-user.usecase';
import { GetAchievementsUseCase } from '../use-cases/get-achievements.usecase';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly addXpUseCase: AddXpUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly getAchievementsUseCase: GetAchievementsUseCase,
  ) {}

  async create(dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    return this.updateUserProfileUseCase.execute(id, dto);
  }

  async addXp(userId: string, amount: number) {
    return this.addXpUseCase.execute(userId, amount);
  }

  async login(credentials: { email: string; password: string }) {
    return this.loginUserUseCase.execute(credentials);
  }

  async findAll() {
    return this.findAllUsersUseCase.execute();
  }

  async findOne(id: string) {
    return this.findOneUserUseCase.execute(id);
  }

  async getProfile(id: string) {
    return this.getProfileUseCase.execute(id);
  }

  async remove(id: string) {
    return this.removeUserUseCase.execute(id);
  }

  async getAchievements(userId: string) {
    return this.getAchievementsUseCase.execute(userId);
  }
}
