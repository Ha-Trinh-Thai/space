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
import { CanvasService } from './canvas.service';
import {
  CreateCanvasDto,
  UpdateCanvasDto,
  CreateCanvasObjectDto,
  UpdateCanvasObjectDto,
  BulkUpdateDto,
  BulkDeleteDto,
} from './canvas.dto';

type AuthReq = { user: { id: string } };

@Controller('canvas')
@UseGuards(JwtAuthGuard)
export class CanvasController {
  constructor(private canvasService: CanvasService) {}

  @Post()
  create(@Body() dto: CreateCanvasDto, @Request() req: AuthReq) {
    return this.canvasService.create(dto, req.user.id);
  }

  @Get('workspace/:workspaceId')
  findByWorkspace(@Param('workspaceId') workspaceId: string, @Request() req: AuthReq) {
    return this.canvasService.findByWorkspace(workspaceId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthReq) {
    return this.canvasService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCanvasDto, @Request() req: AuthReq) {
    return this.canvasService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: AuthReq) {
    return this.canvasService.delete(id, req.user.id);
  }

  // ─── Canvas Objects ───────────────────────────────────

  @Post(':canvasId/objects')
  createObject(
    @Param('canvasId') canvasId: string,
    @Body() dto: CreateCanvasObjectDto,
    @Request() req: AuthReq,
  ) {
    return this.canvasService.createObject(canvasId, dto, req.user.id);
  }

  @Patch('objects/:objectId')
  updateObject(
    @Param('objectId') objectId: string,
    @Body() dto: UpdateCanvasObjectDto,
    @Request() req: AuthReq,
  ) {
    return this.canvasService.updateObject(objectId, dto, req.user.id);
  }

  @Post(':canvasId/objects/bulk-update')
  bulkUpdateObjects(
    @Param('canvasId') canvasId: string,
    @Body() body: BulkUpdateDto,
    @Request() req: AuthReq,
  ) {
    return this.canvasService.bulkUpdateObjects(canvasId, body.updates, req.user.id);
  }

  @Delete('objects/:objectId')
  deleteObject(@Param('objectId') objectId: string, @Request() req: AuthReq) {
    return this.canvasService.deleteObject(objectId, req.user.id);
  }

  @Post(':canvasId/objects/bulk-delete')
  deleteObjects(
    @Param('canvasId') canvasId: string,
    @Body() body: BulkDeleteDto,
    @Request() req: AuthReq,
  ) {
    return this.canvasService.deleteObjects(canvasId, body.objectIds, req.user.id);
  }
}
