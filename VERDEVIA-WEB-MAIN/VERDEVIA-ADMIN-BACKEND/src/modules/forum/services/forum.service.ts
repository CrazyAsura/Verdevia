import { Injectable } from '@nestjs/common';
import { ForumPost } from '../entities/forum-post.entity';
import { ForumComment } from '../entities/forum-comment.entity';
import { FindAllForumPostsUseCase } from '../use-cases/find-all-posts.usecase';
import { FindOneForumPostUseCase } from '../use-cases/find-one-post.usecase';
import { CreateForumPostUseCase } from '../use-cases/create-post.usecase';
import { UpdateForumPostUseCase } from '../use-cases/update-post.usecase';
import { RemoveForumPostUseCase } from '../use-cases/remove-post.usecase';
import { LikeForumPostUseCase } from '../use-cases/like-post.usecase';
import { DislikeForumPostUseCase } from '../use-cases/dislike-post.usecase';
import { ShareForumPostUseCase } from '../use-cases/share-post.usecase';
import { IncrementForumPostViewUseCase } from '../use-cases/increment-view.usecase';
import { AddForumCommentUseCase } from '../use-cases/add-comment.usecase';
import { FindForumCommentsUseCase } from '../use-cases/find-comments.usecase';
import { LikeForumCommentUseCase } from '../use-cases/like-comment.usecase';
import { DislikeForumCommentUseCase } from '../use-cases/dislike-comment.usecase';
import { ReportForumCommentUseCase } from '../use-cases/report-comment.usecase';

@Injectable()
export class ForumService {
  constructor(
    private readonly findAllPostsUseCase: FindAllForumPostsUseCase,
    private readonly findOnePostUseCase: FindOneForumPostUseCase,
    private readonly createPostUseCase: CreateForumPostUseCase,
    private readonly updatePostUseCase: UpdateForumPostUseCase,
    private readonly removePostUseCase: RemoveForumPostUseCase,
    private readonly likePostUseCase: LikeForumPostUseCase,
    private readonly dislikePostUseCase: DislikeForumPostUseCase,
    private readonly sharePostUseCase: ShareForumPostUseCase,
    private readonly incrementViewUseCase: IncrementForumPostViewUseCase,
    private readonly addCommentUseCase: AddForumCommentUseCase,
    private readonly findCommentsUseCase: FindForumCommentsUseCase,
    private readonly likeCommentUseCase: LikeForumCommentUseCase,
    private readonly dislikeCommentUseCase: DislikeForumCommentUseCase,
    private readonly reportCommentUseCase: ReportForumCommentUseCase,
  ) {}

  async findAll(page = 1, limit = 10, search?: string, category?: string) {
    return this.findAllPostsUseCase.execute(page, limit, search, category);
  }

  async findOne(id: string) {
    return this.findOnePostUseCase.execute(id);
  }

  async create(data: Partial<ForumPost>) {
    return this.createPostUseCase.execute(data);
  }

  async update(id: string, data: Partial<ForumPost>) {
    return this.updatePostUseCase.execute(id, data);
  }

  async remove(id: string) {
    return this.removePostUseCase.execute(id);
  }

  async like(id: string) {
    return this.likePostUseCase.execute(id);
  }

  async dislike(id: string) {
    return this.dislikePostUseCase.execute(id);
  }

  async share(id: string) {
    return this.sharePostUseCase.execute(id);
  }

  async incrementView(id: string) {
    return this.incrementViewUseCase.execute(id);
  }

  async addComment(postId: string, data: Partial<ForumComment>) {
    return this.addCommentUseCase.execute(postId, data);
  }

  async findComments(postId: string) {
    return this.findCommentsUseCase.execute(postId);
  }

  async likeComment(commentId: string) {
    return this.likeCommentUseCase.execute(commentId);
  }

  async dislikeComment(commentId: string) {
    return this.dislikeCommentUseCase.execute(commentId);
  }

  async reportComment(commentId: string) {
    return this.reportCommentUseCase.execute(commentId);
  }
}
