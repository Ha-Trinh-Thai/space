import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @Request() req: { user: { id: string } }) {
    return this.commentService.create(dto, req.user.id);
  }

  @Get('document/:documentId')
  findByDocument(
    @Param('documentId') documentId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.commentService.findByDocument(documentId, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.commentService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.commentService.delete(id, req.user.id);
  }
}
