import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Candidate — Domain entity for job applicants.
 *
 * LGPD / ANPD Note:
 *   Candidates are anonymous applicants who do NOT require a platform account.
 *   Address and phones are embedded as JSON — no FK to User.
 *   Data is collected only for recruitment purposes per the ANPD's Legitimate
 *   Interest legal basis (Art. 7º, IX, LGPD).
 */
@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  /**
   * Structured phones — array of { ddi, ddd, number }.
   * Stored as JSONB in Postgres / JSON in SQLite.
   */
  @Column({ type: 'simple-json', nullable: true })
  phones?: { ddi: string; ddd: string; number: string }[];

  /**
   * Structured address — embedded value object.
   * Stored as JSONB in Postgres / JSON in SQLite.
   */
  @Column({ type: 'simple-json', nullable: true })
  address?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    country?: string;
  };

  @Column({ nullable: true })
  resumeUrl?: string;

  @Column({ nullable: true })
  linkedInUrl?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
