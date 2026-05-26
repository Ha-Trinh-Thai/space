import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto, UpdateDocumentDto, MoveDocumentDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  create(@Body() dto: CreateDocumentDto, @Request() req: { user: { id: string } }) {
    return this.documentService.create(dto, req.user.id);
  }

  @Get('tree/:workspaceId')
  getTree(@Param('workspaceId') workspaceId: string, @Request() req: { user: { id: string } }) {
    return this.documentService.getTree(workspaceId, req.user.id);
  }

  @Get('favorites/:workspaceId')
  getFavorites(
    @Param('workspaceId') workspaceId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.documentService.getFavorites(workspaceId, req.user.id);
  }

  @Get('search/:workspaceId')
  search(
    @Param('workspaceId') workspaceId: string,
    @Query('q') query: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.documentService.search(workspaceId, query, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.documentService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.documentService.update(id, dto, req.user.id);
  }

  @Patch(':id/move')
  move(
    @Param('id') id: string,
    @Body() dto: MoveDocumentDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.documentService.move(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.documentService.delete(id, req.user.id);
  }
}
