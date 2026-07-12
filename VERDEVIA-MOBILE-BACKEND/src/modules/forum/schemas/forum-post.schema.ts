import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ForumPostDocument = ForumPost & Document;

/**
 * ForumPost Mongoose Schema
 *
 * Rationale for MongoDB:
 * - Flexible content structure (rich media, polls, attachments)
 * - Native full-text search via $text index
 * - Horizontal scaling for high write throughput
 * - Aggregation pipelines for feed ranking algorithms
 */
@Schema({
  timestamps: true,
  collection: 'forum_posts',
  // Performance: compound indexes declared below
})
export class ForumPost {
  @Prop({ required: true, trim: true, maxlength: 500 })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ required: true, index: true })
  userName: string;

  /** Optional reference to User in PostgreSQL — stored as string UUID */
  @Prop({ type: String, index: true })
  authorId?: string;

  @Prop({
    type: String,
    enum: ['Denúncia', 'Dúvida', 'Sugestão', 'Notícia', 'Discussão'],
    index: true,
  })
  category?: string;

  /** Tags for full-text search */
  @Prop({ type: [String], default: [] })
  tags: string[];

  /** Stores userIds to prevent duplicate likes (O(1) lookup in MongoDB sets) */
  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({ type: [String], default: [] })
  dislikedBy: string[];

  @Prop({ type: Number, default: 0, min: 0 })
  views: number;

  @Prop({ type: Number, default: 0, min: 0 })
  commentsCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  shares: number;

  /** Soft delete: keeps data for compliance/audit */
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;

  @Prop({ type: String, nullable: true })
  imageUrl?: string;

  /** Populated virtuals — not stored */
  createdAt?: Date;
  updatedAt?: Date;
}

export const ForumPostSchema = SchemaFactory.createForClass(ForumPost);

// ─── Indexes ─────────────────────────────────────────────────────────────────

/** Full-text search across title, content, tags */
ForumPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

/** Feed sorting: newest first per category */
ForumPostSchema.index({ category: 1, createdAt: -1 });

/** Author's posts feed */
ForumPostSchema.index({ authorId: 1, createdAt: -1 });

/** Trending: high engagement, recent */
ForumPostSchema.index({ views: -1, createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

ForumPostSchema.virtual('likesCount').get(function () {
  return this.likedBy?.length ?? 0;
});

ForumPostSchema.virtual('dislikesCount').get(function () {
  return this.dislikedBy?.length ?? 0;
});

// Ensure virtuals are included in JSON output
ForumPostSchema.set('toJSON', { virtuals: true });
ForumPostSchema.set('toObject', { virtuals: true });
