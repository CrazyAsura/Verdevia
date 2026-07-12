import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  BillingCycle,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../plans';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    default: 'free',
  })
  plan: SubscriptionPlan;

  @Column({
    type: 'varchar',
    default: 'none',
  })
  billingCycle: BillingCycle;

  @Column({
    type: 'varchar',
    default: 'none',
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({
    nullable: true,
  })
  subscriptionExpiresAt: Date;

  @OneToOne(() => User, (user) => user.subscription, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
