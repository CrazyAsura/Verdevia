import { User } from '../../entities/user.entity';

export interface IUsersRepository {
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<boolean>;
  save(user: User): Promise<User>;
  getAchievements(userId: string): Promise<any[]>;
}
