import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ForumCommentDocument = ForumComment & Document;

/**
 * ForumComment Mongoose Schema
 *
 * Supports:
 * - Threaded replies via parentId
 * - Soft delete with [deleted] tombstone
 * - Duplicate-vote prevention via likedBy/dislikedBy arrays
 * - Moderation: reportCount + reportedBy
 */
@Schema({
  timestamps: true,
  collection: 'forum_comments',
})
export class ForumComment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ForumPost', index: true })
  postId: Types.ObjectId;

  /** Threaded replies: null = top-level comment */
  @Prop({
    type: Types.ObjectId,
    ref: 'ForumComment',
    default: null,
    index: true,
  })
  parentId?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  content: string;

  @Prop({ required: true, trim: true })
  userName: string;

  @Prop({ type: String, index: true })
  authorId?: string;

  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({ type: [String], default: [] })
  dislikedBy: string[];

  @Prop({ type: Number, default: 0, min: 0 })
  reportCount: number;

  @Prop({ type: [String], default: [] })
  reportedBy: string[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  /** Tombstone text shown when comment is deleted */
  @Prop({ type: String, default: null })
  deletedText?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ForumCommentSchema = SchemaFactory.createForClass(ForumComment);

// ─── Indexes ─────────────────────────────────────────────────────────────────

/** Paginated comments per post, newest first */
ForumCommentSchema.index({ postId: 1, createdAt: -1 });

/** Thread view: all replies to a parent */
ForumCommentSchema.index({ parentId: 1, createdAt: 1 });

/** Moderation queue: most reported first */
ForumCommentSchema.index({ reportCount: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

ForumCommentSchema.virtual('likesCount').get(function () {
  return this.likedBy?.length ?? 0;
});

ForumCommentSchema.virtual('dislikesCount').get(function () {
  return this.dislikedBy?.length ?? 0;
});

ForumCommentSchema.set('toJSON', { virtuals: true });
ForumCommentSchema.set('toObject', { virtuals: true });
