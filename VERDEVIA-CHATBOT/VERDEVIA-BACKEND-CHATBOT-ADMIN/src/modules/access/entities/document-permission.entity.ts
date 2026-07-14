import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
export type DocumentAccessLevel = 'admin' | 'super_admin';
@Entity('chatbot_document_permissions')
export class DocumentPermission {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) documentId!: string;
  @Column() filename!: string;
  @Column({ type: 'varchar', default: 'admin' }) minimumRole!: DocumentAccessLevel;
  @Column({ default: true }) explanationAllowed!: boolean;
  @Column({ nullable: true }) blockReason?: string;
  @Column({ nullable: true }) updatedBy?: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
