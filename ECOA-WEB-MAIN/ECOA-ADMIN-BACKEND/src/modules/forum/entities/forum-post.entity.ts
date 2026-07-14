import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ForumComment } from './forum-comment.entity';

@Entity('forum_posts')
export class ForumPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  dislikes: number;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  shares: number;

  @Column({ nullable: true })
  category: string; // ex: 'Denúncia', 'Dúvida', 'Sugestão'

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ForumComment, (comment) => comment.post)
  comments: ForumComment[];
}
