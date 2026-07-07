import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CourseModule } from './module.entity';
import { Quiz } from './quiz.entity';

export enum LessonType {
  VIDEO = 'video',
  PDF = 'pdf',
  TEXT = 'text',
  QUIZ = 'quiz',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'simple-enum',
    enum: LessonType,
    default: LessonType.TEXT,
  })
  type: LessonType;

  @Column({ type: 'text', nullable: true })
  contentUrl: string; // Para vídeos e PDFs

  @Column({ type: 'text', nullable: true })
  contentBody: string; // Para texto

  @Column({ default: 0 })
  orderIndex: number;

  @ManyToOne('CourseModule', 'lessons')
  module: CourseModule;

  @OneToOne('Quiz', 'lesson', { nullable: true, cascade: true })
  @JoinColumn()
  quiz: Quiz;
}
