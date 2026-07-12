import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import type { Lesson } from './lesson.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 60 })
  passingScore: number;

  @OneToOne('Lesson', 'quiz')
  lesson: Lesson;

  @OneToMany('Question', 'quiz', { cascade: true })
  questions: Question[];
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'json' })
  options: string[];

  @Column()
  correctAnswerIndex: number;

  @ManyToOne('Quiz', 'questions')
  quiz: any;
}
