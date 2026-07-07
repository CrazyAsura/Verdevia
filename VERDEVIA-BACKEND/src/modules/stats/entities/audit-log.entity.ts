import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // Ex: 'LOGIN', 'CREATE_COURSE', 'DELETE_COMPLAINT'

  @Column()
  route: string; // Ex: '/superadmin/logs', '/api/courses'

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  details: any; // Dados extras da ação

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @Column({ nullable: true })
  userName: string; // Backup caso o usuário seja deletado

  @Column({ nullable: true })
  userId: string; // Backup caso o usuário seja deletado

  @CreateDateColumn()
  createdAt: Date;
}
