import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('privacy_audit_logs')
export class PrivacyAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  actorId: string; // ID do usuário, admin ou 'SYSTEM'

  @Column({ nullable: true })
  targetUserId: string; // ID do usuário cujos dados foram expostos/alterados

  @Column()
  action: string; // ex: READ_PROFILE, EXPORT_DATA, ANONYMIZE_DATA

  @Column({ nullable: true })
  purpose: string; // Justificativa da ação

  @Column({ nullable: true })
  ipAddress: string;
}
