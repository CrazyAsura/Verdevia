import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { IForumRepository } from '../../domain/ports/forum.repository.interface';
import { ForumPost } from '../../entities/forum-post.entity';
import { ForumComment } from '../../entities/forum-comment.entity';

@Injectable()
export class TypeORMForumRepository implements IForumRepository {
  constructor(
    @InjectRepository(ForumPost)
    private readonly postRepo: Repository<ForumPost>,
    @InjectRepository(ForumComment)
    private readonly commentRepo: Repository<ForumComment>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
    category?: string,
  ) {
    const where: any = {};
    if (search) where.content = Like(`%${search}%`);
    if (category) where.category = category;

    const [items, total] = await this.postRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { items, total, lastPage: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.postRepo.findOne({ where: { id }, relations: ['comments'] });
  }

  async save(post: ForumPost) {
    return this.postRepo.save(post);
  }

  async delete(id: string) {
    const result = await this.postRepo.delete(id);
    return result.affected > 0;
  }

  async incrementLikes(id: string) {
    await this.postRepo.increment({ id }, 'likes', 1);
  }

  async incrementDislikes(id: string) {
    await this.postRepo.increment({ id }, 'dislikes', 1);
  }

  async incrementViews(id: string) {
    await this.postRepo.increment({ id }, 'views', 1);
  }

  async incrementShares(id: string) {
    await this.postRepo.increment({ id }, 'shares', 1);
  }

  async findComments(postId: string) {
    return this.commentRepo.find({
      where: { post: { id: postId } },
      order: { createdAt: 'DESC' },
    });
  }

  async saveComment(comment: ForumComment) {
    return this.commentRepo.save(comment);
  }

  async incrementCommentLikes(commentId: string) {
    await this.commentRepo.increment({ id: commentId }, 'likes', 1);
  }

  async incrementCommentDislikes(commentId: string) {
    await this.commentRepo.increment({ id: commentId }, 'dislikes', 1);
  }

  async incrementCommentReports(commentId: string) {
    await this.commentRepo.increment({ id: commentId }, 'reportCount', 1);
  }

  async incrementPostCommentsCount(postId: string) {
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
  }
}
