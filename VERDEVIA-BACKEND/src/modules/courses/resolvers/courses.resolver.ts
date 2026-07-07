import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from '../application/services/courses.service';
import {
  CourseTypeGql,
  LessonTypeGql,
  CreateCourseInput,
  UpdateCourseInput,
  CoursesFilterInput,
} from '../dto/graphql/courses-graphql.dto';
import { MutationResultType } from '../../forum/dto/graphql/forum-graphql.dto';
import { JwtAuthGuard } from '../../../common/security/jwt-auth.guard';
import { RequirePlanFeatures } from '../../subscriptions/decorators/require-plan.decorator';
import { PlanAccessGuard } from '../../subscriptions/guards/plan-access.guard';

@Resolver(() => CourseTypeGql)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  // ─── Queries ──────────────────────────────────────────────────────────────

  @Query(() => [CourseTypeGql], {
    description: 'Get list of courses with pagination and filters',
  })
  async courses(
    @Args('filter', { nullable: true }) filter?: CoursesFilterInput,
  ): Promise<CourseTypeGql[]> {
    const { page = 1, limit = 10, category, level } = filter ?? {};
    const result = await this.coursesService.findAll(
      page,
      limit,
      category,
      level,
    );
    return result.items.map(this.mapCourse);
  }

  @Query(() => CourseTypeGql, {
    nullable: true,
    description: 'Get course by ID',
  })
  async course(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CourseTypeGql | null> {
    const course = await this.coursesService.findOne(id);
    return course ? this.mapCourse(course) : null;
  }

  @Query(() => LessonTypeGql, {
    nullable: true,
    description: 'Get lesson by ID',
  })
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:read', 'courses:manage')
  async lesson(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LessonTypeGql | null> {
    const lesson = await this.coursesService.findLesson(id);
    return lesson ? this.mapLesson(lesson) : null;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  @Mutation(() => CourseTypeGql, { description: 'Create new course' })
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:manage')
  async createCourse(
    @Args('input') input: CreateCourseInput,
  ): Promise<CourseTypeGql> {
    const course = await this.coursesService.create(input as any);
    return this.mapCourse(course);
  }

  @Mutation(() => CourseTypeGql, {
    nullable: true,
    description: 'Update existing course',
  })
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:manage')
  async updateCourse(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCourseInput,
  ): Promise<CourseTypeGql | null> {
    const course = await this.coursesService.update(id, input);
    return course ? this.mapCourse(course) : null;
  }

  @Mutation(() => MutationResultType, { description: 'Remove a course' })
  @UseGuards(JwtAuthGuard, PlanAccessGuard)
  @RequirePlanFeatures('courses:manage')
  async removeCourse(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationResultType> {
    const result = await this.coursesService.remove(id);
    return {
      success: result.success,
      message: result.success ? 'Curso removido' : 'Curso não encontrado',
    };
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapCourse(course: any): CourseTypeGql {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      category: course.category,
      level: course.level,
      duration: course.duration,
      modules: course.modules
        ? course.modules.map(this.mapModule.bind(this))
        : [],
      createdAt: course.createdAt,
    };
  }

  private mapModule(mod: any): any {
    return {
      id: mod.id,
      title: mod.title,
      orderIndex: mod.orderIndex ?? 0,
      lessons: mod.lessons ? mod.lessons.map(this.mapLesson.bind(this)) : [],
    };
  }

  private mapLesson(lesson: any): LessonTypeGql {
    return {
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      contentUrl: lesson.contentUrl,
      contentBody: lesson.contentBody,
      orderIndex: lesson.orderIndex ?? 0,
      quiz: lesson.quiz
        ? {
            id: lesson.quiz.id,
            title: lesson.quiz.title,
            passingScore: lesson.quiz.passingScore ?? 60,
            questions: lesson.quiz.questions
              ? lesson.quiz.questions.map((q: any) => ({
                  id: q.id,
                  text: q.text,
                  options: q.options ?? [],
                  correctAnswerIndex: q.correctAnswerIndex ?? 0,
                }))
              : [],
          }
        : undefined,
    };
  }
}
