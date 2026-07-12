import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { ForumPost } from '../entities/forum-post.entity';
import { ForumComment } from '../entities/forum-comment.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Forum')
@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.forumService.findAll(page, limit, search, category);
  }

  @Post()
  create(@Body() data: Partial<ForumPost>) {
    return this.forumService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<ForumPost>) {
    return this.forumService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forumService.remove(id);
  }

  @Patch(':id/like')
  like(@Param('id') id: string) {
    return this.forumService.like(id);
  }

  @Patch(':id/dislike')
  dislike(@Param('id') id: string) {
    return this.forumService.dislike(id);
  }

  @Patch(':id/share')
  share(@Param('id') id: string) {
    return this.forumService.share(id);
  }

  @Patch(':id/view')
  view(@Param('id') id: string) {
    return this.forumService.incrementView(id);
  }

  // --- Comments ---

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() data: Partial<ForumComment>) {
    return this.forumService.addComment(id, data);
  }

  @Get(':id/comments')
  findComments(@Param('id') id: string) {
    return this.forumService.findComments(id);
  }

  @Patch('comments/:commentId/like')
  likeComment(@Param('commentId') commentId: string) {
    return this.forumService.likeComment(commentId);
  }

  @Patch('comments/:commentId/dislike')
  dislikeComment(@Param('commentId') commentId: string) {
    return this.forumService.dislikeComment(commentId);
  }

  @Patch('comments/:commentId/report')
  reportComment(@Param('commentId') commentId: string) {
    return this.forumService.reportComment(commentId);
  }
}
