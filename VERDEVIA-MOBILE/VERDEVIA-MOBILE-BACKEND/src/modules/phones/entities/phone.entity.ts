import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../../../../../VERDEVIA-MOBILE/VERDEVIA-MOBILE-BACKEND/src/modules/users/entities/user.entity';

@Entity('phones')
export class Phone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ddi: string;

  @Column()
  ddd: string;

  @Column()
  number: string;

  @ManyToOne(() => User, (user) => user.phones)
  user: User;
}
