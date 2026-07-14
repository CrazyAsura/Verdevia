import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity';
import { UserRole } from '../enums/user.enums';
import { Exclude } from 'class-transformer';
import { UserProfile } from '../../profiles/entities/user-profile.entity';
import { UserGamification } from '../../gamification/entities/user-gamification.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Phone } from '../../phones/entities/phone.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToOne(() => UserGamification, (gamification) => gamification.user, {
    cascade: true,
  })
  gamification: UserGamification;

  @OneToOne(() => Address, (address) => address.user, { cascade: true })
  address: Address;

  @OneToMany(() => Phone, (phone) => phone.user, { cascade: true })
  phones: Phone[];

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaints: Complaint[];

  @OneToOne('Subscription', 'user', { cascade: true })
  subscription: any;

  @Column({ nullable: true })
  parentUserId: string | null;

  @ManyToOne(() => User, (user) => user.subordinates, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentUserId' })
  parentUser: User | null;

  @OneToMany(() => User, (user) => user.parentUser)
  subordinates: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
