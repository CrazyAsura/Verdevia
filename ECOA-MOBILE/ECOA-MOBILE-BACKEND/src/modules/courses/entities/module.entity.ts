import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

@Entity('course_modules')
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  orderIndex: number;

  @ManyToOne('Course', 'modules')
  course: Course;

  @OneToMany('Lesson', 'module', { cascade: true })
  lessons: Lesson[];
}
