import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumPost, ForumPostSchema } from './schemas/forum-post.schema';
import {
  ForumComment,
  ForumCommentSchema,
} from './schemas/forum-comment.schema';
import { ForumController } from './controllers/forum.controller';
import { ForumService } from './services/forum.service';
import { MongooseForumRepository } from './infrastructure/persistence/mongoose-forum.repository';
import { ForumResolver } from './resolvers/forum.resolver';
import { FindAllForumPostsUseCase } from './use-cases/find-all-posts.usecase';
import { FindOneForumPostUseCase } from './use-cases/find-one-post.usecase';
import { CreateForumPostUseCase } from './use-cases/create-post.usecase';
import { UpdateForumPostUseCase } from './use-cases/update-post.usecase';
import { RemoveForumPostUseCase } from './use-cases/remove-post.usecase';
import { LikeForumPostUseCase } from './use-cases/like-post.usecase';
import { DislikeForumPostUseCase } from './use-cases/dislike-post.usecase';
import { ShareForumPostUseCase } from './use-cases/share-post.usecase';
import { IncrementForumPostViewUseCase } from './use-cases/increment-view.usecase';
import { AddForumCommentUseCase } from './use-cases/add-comment.usecase';
import { FindForumCommentsUseCase } from './use-cases/find-comments.usecase';
import { LikeForumCommentUseCase } from './use-cases/like-comment.usecase';
import { DislikeForumCommentUseCase } from './use-cases/dislike-comment.usecase';
import { ReportForumCommentUseCase } from './use-cases/report-comment.usecase';

/**
 * ForumModule — Uses MongoDB (Mongoose) for posts and comments.
 *
 * Architectural decision:
 * - MongoDB chosen for forum content due to flexible schema, text search,
 *   and high write throughput for community interactions.
 * - TypeORM removed from this module; other modules remain PostgreSQL.
 * - GraphQL resolver registered here alongside REST controller.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ForumPost.name, schema: ForumPostSchema },
      { name: ForumComment.name, schema: ForumCommentSchema },
    ]),
  ],
  controllers: [ForumController],
  providers: [
    ForumService,
    MongooseForumRepository,
    ForumResolver,
    // Keep 'IForumRepository' token for backward compat with existing use-cases
    {
      provide: 'IForumRepository',
      useClass: MongooseForumRepository,
    },
    FindAllForumPostsUseCase,
    FindOneForumPostUseCase,
    CreateForumPostUseCase,
    UpdateForumPostUseCase,
    RemoveForumPostUseCase,
    LikeForumPostUseCase,
    DislikeForumPostUseCase,
    ShareForumPostUseCase,
    IncrementForumPostViewUseCase,
    AddForumCommentUseCase,
    FindForumCommentsUseCase,
    LikeForumCommentUseCase,
    DislikeForumCommentUseCase,
    ReportForumCommentUseCase,
  ],
  exports: [ForumService, MongooseForumRepository],
})
export class ForumModule {}
