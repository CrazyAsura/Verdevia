import { ObjectType, Field, ID, Int, InputType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

// ─── Object Types (Response Shape) ───────────────────────────────────────────

@ObjectType()
export class CommentType {
  @Field(() => ID)
  id: string;

  @Field()
  postId: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field()
  content: string;

  @Field()
  userName: string;

  @Field({ nullable: true })
  authorId?: string;

  @Field(() => Int)
  likesCount: number;

  @Field(() => Int)
  dislikesCount: number;

  @Field(() => Int)
  reportCount: number;

  @Field()
  isDeleted: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PostType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  userName: string;

  @Field({ nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => Int)
  likesCount: number;

  @Field(() => Int)
  dislikesCount: number;

  @Field(() => Int)
  views: number;

  @Field(() => Int)
  commentsCount: number;

  @Field(() => Int)
  shares: number;

  @Field()
  isPinned: boolean;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedPostsType {
  @Field(() => [PostType])
  items: PostType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field()
  hasNextPage: boolean;
}

@ObjectType()
export class MutationResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

// ─── Input Types (Mutation Arguments) ────────────────────────────────────────

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  userName: string;

  @Field({ nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  imageUrl?: string;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  imageUrl?: string;
}

@InputType()
export class PostsFilterInput {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  category?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  search?: string;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;
}

@InputType()
export class CreateCommentInput {
  @Field()
  postId: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field()
  content: string;

  @Field()
  userName: string;

  @Field({ nullable: true })
  authorId?: string;
}
