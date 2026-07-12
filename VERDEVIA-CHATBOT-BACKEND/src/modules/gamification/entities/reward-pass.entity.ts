import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reward_pass_levels')
export class RewardPassLevel {
  @PrimaryGeneratedColumn()
  level: number;

  @Column()
  freeRewardTitle: string;

  @Column({ nullable: true })
  freeRewardType: 'title' | 'frame' | 'xp';

  @Column({ nullable: true })
  freeRewardValue: string;

  @Column()
  premiumRewardTitle: string;

  @Column({ nullable: true })
  premiumRewardType: 'title' | 'frame' | 'xp' | 'badge';

  @Column({ nullable: true })
  premiumRewardValue: string;

  @Column({ default: false })
  isCompleted: boolean;
}
