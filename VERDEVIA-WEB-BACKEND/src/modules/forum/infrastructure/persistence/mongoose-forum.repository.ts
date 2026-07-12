import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ForumPost, ForumPostDocument } from '../../schemas/forum-post.schema';
import {
  ForumComment,
  ForumCommentDocument,
} from '../../schemas/forum-comment.schema';
import { IForumRepository } from '../../domain/ports/forum.repository.interface';

// Type aliases for the legacy entity types that IForumRepository uses
type LegacyForumPost = any;
type LegacyForumComment = any;

/**
 * MongooseForumRepository
 *
 * Adapter (Hexagonal Architecture) implementing both:
 * 1. IForumRepository — legacy interface consumed by existing use-cases
 * 2. Direct Mongoose methods — used by ForumResolver (GraphQL) and REST controller
 *
 * Rationale for MongoDB:
 * - Document model fits flexible forum content (rich media, polls, attachments)
 * - Native full-text search ($text) for post search
 * - Atomic $addToSet/$pull for idempotent, race-condition-free voting
 * - $inc for counters (avoids read-modify-write races)
 * - Horizontal scaling for high write throughput
 */
@Injectable()
export class MongooseForumRepository implements IForumRepository {
  private readonly logger = new Logger(MongooseForumRepository.name);

  constructor(
    @InjectModel(ForumPost.name)
    private readonly postModel: Model<ForumPostDocument>,
    @InjectModel(ForumComment.name)
    private readonly commentModel: Model<ForumCommentDocument>,
  ) {}

  // ─── IForumRepository implementation (used by existing use-cases) ────────

  async findAll(
    page: number,
    limit: number,
    search?: string,
    category?: string,
  ): Promise<{ items: LegacyForumPost[]; total: number; lastPage: number }> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { isDeleted: false };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [items, total] = await Promise.all([
      this.postModel
        .find(filter)
        .select('-likedBy -dislikedBy')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map(this.mapToLegacy),
      total,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<LegacyForumPost | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.postModel
      .findOne({ _id: id, isDeleted: false })
      .lean({ virtuals: true })
      .exec();
    return doc ? this.mapToLegacy(doc) : null;
  }

  async save(post: LegacyForumPost): Promise<LegacyForumPost> {
    if (post.id || post._id) {
      // Update
      const updated = await this.postModel
        .findByIdAndUpdate(
          post.id || post._id,
          { $set: post },
          { new: true, runValidators: true },
        )
        .lean({ virtuals: true })
        .exec();
      return updated ? this.mapToLegacy(updated) : post;
    }
    // Create
    const created = new this.postModel(post);
    const saved = await created.save();
    return this.mapToLegacy(saved.toObject({ virtuals: true }));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.postModel
      .findByIdAndUpdate(id, { isDeleted: true })
      .exec();
    return !!result;
  }

  async incrementLikes(id: string): Promise<void> {
    await this.postModel
      .findByIdAndUpdate(id, { $inc: { _likesCount: 1 } })
      .exec();
  }

  async incrementDislikes(id: string): Promise<void> {
    await this.postModel
      .findByIdAndUpdate(id, { $inc: { _dislikesCount: 1 } })
      .exec();
  }

  async incrementViews(id: string): Promise<void> {
    await this.postModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
  }

  async incrementShares(id: string): Promise<void> {
    await this.postModel.findByIdAndUpdate(id, { $inc: { shares: 1 } }).exec();
  }

  async findComments(postId: string): Promise<LegacyForumComment[]> {
    const docs = await this.commentModel
      .find({ postId: new Types.ObjectId(postId), isDeleted: false })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true })
      .exec();
    return docs.map(this.mapCommentToLegacy);
  }

  async saveComment(comment: LegacyForumComment): Promise<LegacyForumComment> {
    const created = new this.commentModel({
      ...comment,
      postId: new Types.ObjectId(comment.post?.id || comment.postId),
    });
    const saved = await created.save();
    await this.postModel
      .findByIdAndUpdate(saved.postId, { $inc: { commentsCount: 1 } })
      .exec();
    return this.mapCommentToLegacy(saved.toObject({ virtuals: true }));
  }

  async incrementCommentLikes(commentId: string): Promise<void> {
    await this.commentModel
      .findByIdAndUpdate(commentId, { $inc: { _likesCount: 1 } })
      .exec();
  }

  async incrementCommentDislikes(commentId: string): Promise<void> {
    await this.commentModel
      .findByIdAndUpdate(commentId, { $inc: { _dislikesCount: 1 } })
      .exec();
  }

  async incrementCommentReports(commentId: string): Promise<void> {
    await this.commentModel
      .findByIdAndUpdate(commentId, { $inc: { reportCount: 1 } })
      .exec();
  }

  async incrementPostCommentsCount(postId: string): Promise<void> {
    await this.postModel
      .findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })
      .exec();
  }

  // ─── Extended methods (used by GraphQL Resolver) ──────────────────────────

  async createPost(data: Partial<ForumPost>): Promise<ForumPostDocument> {
    const post = new this.postModel(data);
    return post.save();
  }

  async findAllPosts(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<{ items: ForumPostDocument[]; total: number }> {
    const { page = 1, limit = 20, category, search } = options;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { isDeleted: false };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const [items, total] = await Promise.all([
      this.postModel
        .find(filter)
        .select('-likedBy -dislikedBy')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return { items: items as ForumPostDocument[], total };
  }

  async findPostById(id: string): Promise<ForumPostDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.postModel
      .findOne({ _id: id, isDeleted: false })
      .lean({ virtuals: true })
      .exec() as Promise<ForumPostDocument | null>;
  }

  async updatePost(
    id: string,
    data: Partial<ForumPost>,
  ): Promise<ForumPostDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.postModel
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .exec();
  }

  async softDeletePost(id: string): Promise<boolean> {
    const result = await this.postModel
      .findByIdAndUpdate(id, { isDeleted: true })
      .exec();
    return !!result;
  }

  async likePost(postId: string, userId: string): Promise<number> {
    const post = await this.postModel
      .findByIdAndUpdate(
        postId,
        { $addToSet: { likedBy: userId }, $pull: { dislikedBy: userId } },
        { new: true },
      )
      .exec();
    return post?.likedBy?.length ?? 0;
  }

  async dislikePost(postId: string, userId: string): Promise<number> {
    const post = await this.postModel
      .findByIdAndUpdate(
        postId,
        { $addToSet: { dislikedBy: userId }, $pull: { likedBy: userId } },
        { new: true },
      )
      .exec();
    return post?.dislikedBy?.length ?? 0;
  }

  async createComment(
    data: Partial<ForumComment>,
  ): Promise<ForumCommentDocument> {
    const comment = new this.commentModel(data);
    const saved = await comment.save();
    await this.postModel
      .findByIdAndUpdate(data.postId, { $inc: { commentsCount: 1 } })
      .exec();
    return saved;
  }

  async findCommentsByPost(
    postId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<ForumCommentDocument[]> {
    const { page = 1, limit = 50 } = options;
    return this.commentModel
      .find({
        postId: new Types.ObjectId(postId),
        isDeleted: false,
        parentId: null,
      })
      .select('-likedBy -dislikedBy -reportedBy')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ virtuals: true })
      .exec() as Promise<ForumCommentDocument[]>;
  }

  async findReplies(parentId: string): Promise<ForumCommentDocument[]> {
    return this.commentModel
      .find({ parentId: new Types.ObjectId(parentId), isDeleted: false })
      .sort({ createdAt: 1 })
      .lean({ virtuals: true })
      .exec() as Promise<ForumCommentDocument[]>;
  }

  async likeComment(commentId: string, userId: string): Promise<number> {
    const comment = await this.commentModel
      .findByIdAndUpdate(
        commentId,
        { $addToSet: { likedBy: userId }, $pull: { dislikedBy: userId } },
        { new: true },
      )
      .exec();
    return comment?.likedBy?.length ?? 0;
  }

  async dislikeComment(commentId: string, userId: string): Promise<number> {
    const comment = await this.commentModel
      .findByIdAndUpdate(
        commentId,
        { $addToSet: { dislikedBy: userId }, $pull: { likedBy: userId } },
        { new: true },
      )
      .exec();
    return comment?.dislikedBy?.length ?? 0;
  }

  async reportComment(commentId: string, userId: string): Promise<number> {
    const comment = await this.commentModel
      .findByIdAndUpdate(
        commentId,
        { $addToSet: { reportedBy: userId }, $inc: { reportCount: 1 } },
        { new: true },
      )
      .exec();
    return comment?.reportCount ?? 0;
  }

  async softDeleteComment(commentId: string): Promise<boolean> {
    const result = await this.commentModel
      .findByIdAndUpdate(commentId, {
        isDeleted: true,
        content: '',
        deletedText: '[comentário removido]',
      })
      .exec();
    if (result) {
      await this.postModel
        .findByIdAndUpdate(result.postId, { $inc: { commentsCount: -1 } })
        .exec();
    }
    return !!result;
  }

  // ─── Private mappers ──────────────────────────────────────────────────────

  private mapToLegacy(doc: any): LegacyForumPost {
    return {
      id: doc._id?.toString() ?? doc.id,
      title: doc.title,
      content: doc.content,
      userName: doc.userName,
      authorId: doc.authorId,
      category: doc.category,
      tags: doc.tags ?? [],
      likes: doc.likedBy?.length ?? 0,
      dislikes: doc.dislikedBy?.length ?? 0,
      views: doc.views ?? 0,
      commentsCount: doc.commentsCount ?? 0,
      shares: doc.shares ?? 0,
      isPinned: doc.isPinned ?? false,
      imageUrl: doc.imageUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private mapCommentToLegacy(doc: any): LegacyForumComment {
    return {
      id: doc._id?.toString() ?? doc.id,
      postId: doc.postId?.toString(),
      content: doc.isDeleted ? '[comentário removido]' : doc.content,
      userName: doc.userName,
      authorId: doc.authorId,
      likes: doc.likedBy?.length ?? 0,
      dislikes: doc.dislikedBy?.length ?? 0,
      reportCount: doc.reportCount ?? 0,
      createdAt: doc.createdAt,
    };
  }
}
