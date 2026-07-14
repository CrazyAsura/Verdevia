import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_gamification')
export class UserGamification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ nullable: true })
  activeTitle: string;

  @Column({ nullable: true })
  avatarFrame: string;

  @OneToOne(() => User, (user) => user.gamification, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
