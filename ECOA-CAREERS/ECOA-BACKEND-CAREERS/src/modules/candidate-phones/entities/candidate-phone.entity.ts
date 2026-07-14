import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('candidate_phones')
export class CandidatePhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ddi: string;

  @Column()
  ddd: string;

  @Column()
  number: string;

  @ManyToOne(() => Candidate, (candidate) => candidate.phones, {
    onDelete: 'CASCADE',
  })
  candidate: Candidate;
}
