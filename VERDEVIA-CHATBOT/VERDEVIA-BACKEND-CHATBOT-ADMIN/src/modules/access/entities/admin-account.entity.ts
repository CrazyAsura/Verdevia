import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
export type AdminRole = 'admin' | 'super_admin';
@Entity('chatbot_admin_accounts')
export class AdminAccount {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) email!: string;
  @Column() name!: string;
  @Column({ type: 'varchar', default: 'admin' }) role!: AdminRole;
  @Column({ default: true }) active!: boolean;
  @Column({ select: false }) passwordHash!: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
