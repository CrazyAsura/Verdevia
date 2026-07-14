import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('candidate_addresses')
export class CandidateAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  zipCode: string;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  complement?: string;

  @Column()
  district: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ nullable: true, default: 'Brasil' })
  country?: string;

  @OneToOne(() => Candidate, (candidate) => candidate.address, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  candidate: Candidate;
}
