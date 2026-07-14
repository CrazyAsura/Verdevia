import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserGender, UserEthnicity } from '../../users/enums/user.enums';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  realName: string;

  @Column({ nullable: true })
  identity: string;

  @Column({
    type: 'simple-enum',
    enum: UserGender,
    default: UserGender.OUTRO,
  })
  gender: UserGender;

  @Column({
    type: 'simple-enum',
    enum: UserEthnicity,
    default: UserEthnicity.PARDA,
  })
  ethnicity: UserEthnicity;

  @Column({ type: 'date', nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column('simple-json', { nullable: true })
  address: {
    zipCode?: string;
    street?: string;
    city?: string;
    state?: string;
    district?: string;
    country?: string;
    number?: string;
  };

  @Column('simple-json', { nullable: true })
  phones: {
    ddi?: string;
    ddd?: string;
    number?: string;
  }[];

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
