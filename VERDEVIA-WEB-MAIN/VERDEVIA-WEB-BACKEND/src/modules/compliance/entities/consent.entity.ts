import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ConsentPurpose {
  ESSENTIAL_TERMS = 'ESSENTIAL_TERMS',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  ANALYTICS = 'ANALYTICS',
  MARKETING_NOTIFICATIONS = 'MARKETING_NOTIFICATIONS',
}

@Entity('consents')
export class Consent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'simple-enum',
    enum: ConsentPurpose,
  })
  purpose: ConsentPurpose;

  @Column({ default: false })
  status: boolean;

  @Column({ default: '1.0.0' })
  version: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @UpdateDateColumn()
  updatedAt: Date;
}
