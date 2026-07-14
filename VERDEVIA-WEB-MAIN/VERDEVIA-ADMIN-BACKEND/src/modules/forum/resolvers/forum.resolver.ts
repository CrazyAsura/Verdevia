import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Args,
  ID,
  Int,
} from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import {
  PostType,
  CommentType,
  PaginatedPostsType,
  MutationResultType,
  CreatePostInput,
  UpdatePostInput,
  PostsFilterInput,
  CreateCommentInput,
} from '../dto/graphql/forum-graphql.dto';
import { MongooseForumRepository } from '../infrastructure/persistence/mongoose-forum.repository';

const pubSub = new PubSub();

const POST_ADDED = 'POST_ADDED';
const COMMENT_ADDED = 'COMMENT_ADDED';

/**
 * ForumResolver — GraphQL Resolver (Code-first)
 *
 * Covers: Posts CRUD + voting, Comments CRUD + voting + reporting.
 * Subscriptions: real-time post/comment feeds via PubSub.
 *
 * Security notes:
 * - Input sanitization happens upstream via XssSanitizerInterceptor
 * - Mutations that modify data require @UseGuards(JwtAuthGuard) in prod
 * - Rate limiting applied globally via ThrottlerGuard
 */
@Resolver(() => PostType)
export class ForumResolver {
  constructor(private readonly forumRepo: MongooseForumRepository) {}

  // ─── Queries ──────────────────────────────────────────────────────────────

  @Query(() => PaginatedPostsType, {
    description: 'Paginated list of forum posts with optional filters',
  })
  async posts(
    @Args('filter', { nullable: true }) filter?: PostsFilterInput,
  ): Promise<PaginatedPostsType> {
    const { page = 1, limit = 20, category, search } = filter ?? {};
    const { items, total } = await this.forumRepo.findAllPosts({
      page,
      limit,
      category,
      search,
    });

    return {
      items: items.map(this.mapPost),
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    };
  }

  @Query(() => PostType, {
    nullable: true,
    description: 'Get a single post by ID (increments view counter)',
  })
  async post(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PostType | null> {
    const doc = await this.forumRepo.findPostById(id);
    if (!doc) return null;

    // Fire-and-forget view increment (non-blocking)
    this.forumRepo.incrementViews(id).catch(() => {});

    return this.mapPost(doc);
  }

  @Query(() => [CommentType], {
    description: 'Get top-level comments for a post',
  })
  async comments(
    @Args('postId', { type: () => ID }) postId: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit?: number,
  ): Promise<CommentType[]> {
    const docs = await this.forumRepo.findCommentsByPost(postId, {
      page,
      limit,
    });
    return docs.map(this.mapComment);
  }

  @Query(() => [CommentType], {
    description: 'Get threaded replies to a comment',
  })
  async replies(
    @Args('parentId', { type: () => ID }) parentId: string,
  ): Promise<CommentType[]> {
    const docs = await this.forumRepo.findReplies(parentId);
    return docs.map(this.mapComment);
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  @Mutation(() => PostType)
  async createPost(@Args('input') input: CreatePostInput): Promise<PostType> {
    const doc = await this.forumRepo.createPost(input);
    const post = this.mapPost(doc);
    // Broadcast to subscribers
    pubSub.publish(POST_ADDED, { postAdded: post });
    return post;
  }

  @Mutation(() => PostType, { nullable: true })
  async updatePost(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePostInput,
  ): Promise<PostType | null> {
    const doc = await this.forumRepo.updatePost(id, input);
    return doc ? this.mapPost(doc) : null;
  }

  @Mutation(() => MutationResultType)
  async deletePost(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MutationResultType> {
    const success = await this.forumRepo.softDeletePost(id);
    return {
      success,
      message: success ? 'Post removido' : 'Post não encontrado',
    };
  }

  @Mutation(() => Int, { description: 'Like a post. Returns new like count.' })
  async likePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Args('userId') userId: string,
  ): Promise<number> {
    return this.forumRepo.likePost(postId, userId);
  }

  @Mutation(() => Int, {
    description: 'Dislike a post. Returns new dislike count.',
  })
  async dislikePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Args('userId') userId: string,
  ): Promise<number> {
    return this.forumRepo.dislikePost(postId, userId);
  }

  @Mutation(() => MutationResultType)
  async sharePost(
    @Args('postId', { type: () => ID }) postId: string,
  ): Promise<MutationResultType> {
    await this.forumRepo.incrementShares(postId);
    return { success: true };
  }

  @Mutation(() => CommentType)
  async addComment(
    @Args('input') input: CreateCommentInput,
  ): Promise<CommentType> {
    const doc = await this.forumRepo.createComment({
      ...input,
      postId: input.postId as any,
      parentId: input.parentId as any,
    });
    const comment = this.mapComment(doc);
    pubSub.publish(COMMENT_ADDED, { commentAdded: comment });
    return comment;
  }

  @Mutation(() => Int)
  async likeComment(
    @Args('commentId', { type: () => ID }) commentId: string,
    @Args('userId') userId: string,
  ): Promise<number> {
    return this.forumRepo.likeComment(commentId, userId);
  }

  @Mutation(() => Int)
  async dislikeComment(
    @Args('commentId', { type: () => ID }) commentId: string,
    @Args('userId') userId: string,
  ): Promise<number> {
    return this.forumRepo.dislikeComment(commentId, userId);
  }

  @Mutation(() => Int, {
    description: 'Report a comment. Returns total report count.',
  })
  async reportComment(
    @Args('commentId', { type: () => ID }) commentId: string,
    @Args('userId') userId: string,
  ): Promise<number> {
    return this.forumRepo.reportComment(commentId, userId);
  }

  @Mutation(() => MutationResultType)
  async deleteComment(
    @Args('commentId', { type: () => ID }) commentId: string,
  ): Promise<MutationResultType> {
    const success = await this.forumRepo.softDeleteComment(commentId);
    return {
      success,
      message: success ? 'Comentário removido' : 'Comentário não encontrado',
    };
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  @Subscription(() => PostType, {
    description: 'Subscribe to new posts in real-time',
  })
  postAdded() {
    return pubSub.asyncIterableIterator(POST_ADDED);
  }

  @Subscription(() => CommentType, {
    description: 'Subscribe to new comments for a specific post',
    filter: (payload, variables) =>
      payload.commentAdded.postId === variables.postId,
  })
  commentAdded(@Args('postId', { type: () => ID }) postId: string) {
    return pubSub.asyncIterableIterator(COMMENT_ADDED);
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapPost(doc: any): PostType {
    return {
      id: doc._id?.toString() ?? doc.id,
      title: doc.title,
      content: doc.content,
      userName: doc.userName,
      authorId: doc.authorId,
      category: doc.category,
      tags: doc.tags ?? [],
      likesCount: doc.likedBy?.length ?? doc.likesCount ?? 0,
      dislikesCount: doc.dislikedBy?.length ?? doc.dislikesCount ?? 0,
      views: doc.views ?? 0,
      commentsCount: doc.commentsCount ?? 0,
      shares: doc.shares ?? 0,
      isPinned: doc.isPinned ?? false,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private mapComment(doc: any): CommentType {
    return {
      id: doc._id?.toString() ?? doc.id,
      postId: doc.postId?.toString(),
      parentId: doc.parentId?.toString(),
      content: doc.isDeleted ? '[comentário removido]' : doc.content,
      userName: doc.userName,
      authorId: doc.authorId,
      likesCount: doc.likedBy?.length ?? doc.likesCount ?? 0,
      dislikesCount: doc.dislikedBy?.length ?? doc.dislikesCount ?? 0,
      reportCount: doc.reportCount ?? 0,
      isDeleted: doc.isDeleted ?? false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
