import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MindmapService } from './mindmap.service';
import {
  CreateMindmapDto,
  UpdateMindmapDto,
  CreateMindmapNodeDto,
  UpdateMindmapNodeDto,
} from './mindmap.dto';

type AuthReq = { user: { id: string } };

@Controller('mindmaps')
@UseGuards(JwtAuthGuard)
export class MindmapController {
  constructor(private mindmapService: MindmapService) {}

  @Post()
  create(@Body() dto: CreateMindmapDto, @Request() req: AuthReq) {
    return this.mindmapService.create(dto, req.user.id);
  }

  @Get('workspace/:workspaceId')
  findByWorkspace(@Param('workspaceId') workspaceId: string, @Request() req: AuthReq) {
    return this.mindmapService.findByWorkspace(workspaceId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthReq) {
    return this.mindmapService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMindmapDto, @Request() req: AuthReq) {
    return this.mindmapService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: AuthReq) {
    return this.mindmapService.delete(id, req.user.id);
  }

  // ─── Nodes ────────────────────────────────────────────

  @Post(':mindmapId/nodes')
  createNode(
    @Param('mindmapId') mindmapId: string,
    @Body() dto: CreateMindmapNodeDto,
    @Request() req: AuthReq,
  ) {
    return this.mindmapService.createNode(mindmapId, dto, req.user.id);
  }

  @Patch('nodes/:nodeId')
  updateNode(
    @Param('nodeId') nodeId: string,
    @Body() dto: UpdateMindmapNodeDto,
    @Request() req: AuthReq,
  ) {
    return this.mindmapService.updateNode(nodeId, dto, req.user.id);
  }

  @Delete('nodes/:nodeId')
  deleteNode(@Param('nodeId') nodeId: string, @Request() req: AuthReq) {
    return this.mindmapService.deleteNode(nodeId, req.user.id);
  }
}
