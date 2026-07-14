import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Candidate — Entidade de domínio para candidatos às vagas.
 *
 * Nota LGPD / ANPD:
 *   Candidatos são usuários anônimos que NÃO precisam de conta na plataforma.
 *   Endereço e telefones são embutidos como JSON — sem FK para User.
 *   Dados coletados exclusivamente para fins de recrutamento com base no
 *   Legítimo Interesse (Art. 7º, IX, LGPD).
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
   * Telefones estruturados — array de { ddi, ddd, number }.
   * Armazenado como JSONB no Postgres / JSON no SQLite.
   */
  @Column({ type: 'simple-json', nullable: true })
  phones?: { ddi: string; ddd: string; number: string }[];

  /**
   * Endereço estruturado — value object embutido.
   * Armazenado como JSONB no Postgres / JSON no SQLite.
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
