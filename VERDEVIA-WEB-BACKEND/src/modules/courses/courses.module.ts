import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseModule as ModuleEntity } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';
import { Quiz, Question } from './entities/quiz.entity';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './application/services/courses.service';
import { CoursesResolver } from './resolvers/courses.resolver';
import { TypeORMCoursesRepository } from './infrastructure/persistence/typeorm-courses.repository';
import { FindAllCoursesUseCase } from './use-cases/find-all-courses.usecase';
import { FindOneCourseUseCase } from './use-cases/find-one-course.usecase';
import { CreateCourseUseCase } from './use-cases/create-course.usecase';
import { UpdateCourseUseCase } from './use-cases/update-course.usecase';
import { RemoveCourseUseCase } from './use-cases/remove-course.usecase';
import { FindLessonUseCase } from './use-cases/find-lesson.usecase';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, ModuleEntity, Lesson, Quiz, Question]),
    SubscriptionsModule,
  ],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    CoursesResolver,
    {
      provide: 'ICoursesRepository',
      useClass: TypeORMCoursesRepository,
    },
    FindAllCoursesUseCase,
    FindOneCourseUseCase,
    CreateCourseUseCase,
    UpdateCourseUseCase,
    RemoveCourseUseCase,
    FindLessonUseCase,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
