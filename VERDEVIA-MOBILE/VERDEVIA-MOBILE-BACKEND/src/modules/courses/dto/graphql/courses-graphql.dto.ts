import {
  ObjectType,
  Field,
  ID,
  Int,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { LessonType } from '../../entities/lesson.entity';
import { IsInt, IsOptional, IsString } from 'class-validator';

// ─── Enum Registration ───────────────────────────────────────────────────────

registerEnumType(LessonType, { name: 'LessonType' });

// ─── Object Types ────────────────────────────────────────────────────────────

@ObjectType()
export class QuestionType {
  @Field(() => ID)
  id: string;

  @Field()
  text: string;

  @Field(() => [String])
  options: string[];

  @Field(() => Int)
  correctAnswerIndex: number;
}

@ObjectType()
export class QuizType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  passingScore: number;

  @Field(() => [QuestionType], { nullable: true })
  questions?: QuestionType[];
}

@ObjectType()
export class LessonTypeGql {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => LessonType)
  type: LessonType;

  @Field({ nullable: true })
  contentUrl?: string;

  @Field({ nullable: true })
  contentBody?: string;

  @Field(() => Int)
  orderIndex: number;

  @Field(() => QuizType, { nullable: true })
  quiz?: QuizType;
}

@ObjectType()
export class ModuleTypeGql {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  orderIndex: number;

  @Field(() => [LessonTypeGql], { nullable: true })
  lessons?: LessonTypeGql[];
}

@ObjectType()
export class CourseTypeGql {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field()
  category: string;

  @Field()
  level: string;

  @Field()
  duration: string;

  @Field(() => [ModuleTypeGql], { nullable: true })
  modules?: ModuleTypeGql[];

  @Field()
  createdAt: Date;
}

// ─── Input Types ────────────────────────────────────────────────────────────

@InputType()
export class QuestionInput {
  @Field()
  text: string;

  @Field(() => [String])
  options: string[];

  @Field(() => Int)
  correctAnswerIndex: number;
}

@InputType()
export class QuizInput {
  @Field()
  title: string;

  @Field(() => Int, { defaultValue: 60 })
  passingScore?: number;

  @Field(() => [QuestionInput], { nullable: true })
  questions?: QuestionInput[];
}

@InputType()
export class LessonInput {
  @Field()
  title: string;

  @Field(() => LessonType)
  type: LessonType;

  @Field({ nullable: true })
  contentUrl?: string;

  @Field({ nullable: true })
  contentBody?: string;

  @Field(() => Int, { defaultValue: 0 })
  orderIndex?: number;

  @Field(() => QuizInput, { nullable: true })
  quiz?: QuizInput;
}

@InputType()
export class ModuleInput {
  @Field()
  title: string;

  @Field(() => Int, { defaultValue: 0 })
  orderIndex?: number;

  @Field(() => [LessonInput], { nullable: true })
  lessons?: LessonInput[];
}

@InputType()
export class CreateCourseInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field()
  category: string;

  @Field()
  level: string;

  @Field()
  duration: string;

  @Field(() => [ModuleInput], { nullable: true })
  modules?: ModuleInput[];
}

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  level?: string;

  @Field({ nullable: true })
  duration?: string;
}

@InputType()
export class CoursesFilterInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit?: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  category?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  level?: string;
}
