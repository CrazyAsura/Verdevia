import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ default: 'Conquistado' })
  status: string;

  @Column({ type: 'float', nullable: true })
  progress: number;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ nullable: true })
  date: string;

  @ManyToOne(() => User)
  user: User;
}
