import { Course } from '../../entities/course.entity';

export interface ICoursesRepository {
  findAll(
    page: number,
    limit: number,
    category?: string,
    level?: string,
  ): Promise<{ items: Course[]; total: number; lastPage: number }>;
  findById(id: string): Promise<Course | null>;
  create(course: Partial<Course>): Promise<Course>;
  update(id: string, course: Partial<Course>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  findLessonById(id: string): Promise<any>;
}
