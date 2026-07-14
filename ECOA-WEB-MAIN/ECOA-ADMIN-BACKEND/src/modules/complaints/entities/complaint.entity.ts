import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  ComplaintStatus,
  PollutionType,
  ComplaintPrivacy,
} from '../enums/complaint.enums';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: PollutionType,
  })
  type: PollutionType;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'simple-enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDENTE,
  })
  status: ComplaintStatus;

  @Column({
    type: 'simple-enum',
    enum: ComplaintPrivacy,
    default: ComplaintPrivacy.PUBLICO,
  })
  privacy: ComplaintPrivacy;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column({ nullable: true })
  ip: string;

  @ManyToOne(() => User, (user) => user.complaints)
  user: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  assignedContractor: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
