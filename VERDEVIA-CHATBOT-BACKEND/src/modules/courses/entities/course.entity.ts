import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CourseModule } from './module.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column()
  category: string; // ex: 'Hidrologia', 'Reciclagem', 'Legislação'

  @Column()
  level: string; // 'Iniciante', 'Intermediário', 'Avançado'

  @Column()
  duration: string;

  @OneToMany('CourseModule', 'course', { cascade: true })
  modules: CourseModule[];

  @CreateDateColumn()
  createdAt: Date;
}
