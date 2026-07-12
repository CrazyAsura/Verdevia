import { ForumPost } from '../../entities/forum-post.entity';
import { ForumComment } from '../../entities/forum-comment.entity';

export interface IForumRepository {
  findAll(
    page: number,
    limit: number,
    search?: string,
    category?: string,
  ): Promise<{ items: ForumPost[]; total: number; lastPage: number }>;
  findById(id: string): Promise<ForumPost | null>;
  save(post: ForumPost): Promise<ForumPost>;
  delete(id: string): Promise<boolean>;
  incrementLikes(id: string): Promise<void>;
  incrementDislikes(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  incrementShares(id: string): Promise<void>;

  findComments(postId: string): Promise<ForumComment[]>;
  saveComment(comment: ForumComment): Promise<ForumComment>;
  incrementCommentLikes(commentId: string): Promise<void>;
  incrementCommentDislikes(commentId: string): Promise<void>;
  incrementCommentReports(commentId: string): Promise<void>;
  incrementPostCommentsCount(postId: string): Promise<void>;
}
