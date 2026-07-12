import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICoursesRepository } from '../../domain/ports/courses.repository.interface';
import { Course } from '../../entities/course.entity';

@Injectable()
export class TypeORMCoursesRepository implements ICoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    category?: string,
    level?: string,
  ) {
    const where: any = {};
    if (category) where.category = category;
    if (level) where.level = level;

    const [items, total] = await this.repo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
    });

    return { items, total, lastPage: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'modules',
        'modules.lessons',
        'modules.lessons.quiz',
        'modules.lessons.quiz.questions',
      ],
    });
  }

  async create(course: Partial<Course>) {
    const item = this.repo.create(course);
    return this.repo.save(item);
  }

  async update(id: string, course: Partial<Course>) {
    const result = await this.repo.update(id, course);
    return (result.affected || 0) > 0;
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    return (result.affected || 0) > 0;
  }

  async findLessonById(id: string) {
    return this.repo.manager.findOne('Lesson', {
      where: { id },
      relations: ['quiz', 'quiz.questions', 'module', 'module.course'],
    });
  }
}
