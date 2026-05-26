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
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Post()
  create(@Body() dto: CreateWorkspaceDto, @Request() req: { user: { id: string } }) {
    return this.workspaceService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.workspaceService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.workspaceService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.workspaceService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.workspaceService.delete(id, req.user.id);
  }

  // ─── Members ─────────────────────────────────────────

  @Post(':id/members')
  inviteMember(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.workspaceService.inviteMember(id, dto, req.user.id);
  }

  @Patch(':id/members/:memberId/role')
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.workspaceService.updateMemberRole(id, memberId, dto, req.user.id);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.workspaceService.removeMember(id, memberId, req.user.id);
  }
}
