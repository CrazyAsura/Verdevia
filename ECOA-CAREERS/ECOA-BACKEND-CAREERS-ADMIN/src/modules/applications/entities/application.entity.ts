import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @Column()
  candidateId: string;

  @Column({ default: 'applied' })
  status: string; // applied, reviewing, interviewing, accepted, rejected

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ default: true })
  lgpdConsent: boolean;

  @Column({ default: 'careers-privacy-v1' })
  consentVersion: string;

  @Column({ type: 'timestamp', nullable: true })
  consentedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  retainUntil: Date;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
