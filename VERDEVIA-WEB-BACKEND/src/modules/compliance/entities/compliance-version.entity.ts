import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('compliance_versions')
export class ComplianceVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'terms' | 'privacy' | 'cookies'

  @Column()
  version: string;

  @Column('text')
  content: string;

  @Column()
  pdfName: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  publishedAt: Date;
}
