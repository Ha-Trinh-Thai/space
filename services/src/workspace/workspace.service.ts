import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  // ─── Workspace CRUD ──────────────────────────────────

  async create(dto: CreateWorkspaceDto, userId: string) {
    const slug = dto.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug: `${slug}-${Date.now().toString(36)}`,
        members: {
          create: { userId, role: 'OWNER' },
        },
      },
    });

    return workspace;
  }

  async findAllForUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          select: { role: true, userId: true, user: { select: { name: true } } },
        },
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');

    return workspace;
  }

  async update(workspaceId: string, dto: UpdateWorkspaceDto, userId: string) {
    await this.assertRole(workspaceId, userId, ['OWNER', 'EDITOR']);

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: dto.name },
    });
  }

  async delete(workspaceId: string, userId: string) {
    await this.assertRole(workspaceId, userId, ['OWNER']);
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }

  // ─── Member Management ───────────────────────────────

  async inviteMember(workspaceId: string, dto: InviteMemberDto, userId: string) {
    await this.assertRole(workspaceId, userId, ['OWNER', 'EDITOR']);

    const invitee = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!invitee) throw new NotFoundException('User not found');

    const existing = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: invitee.id, workspaceId } },
    });
    if (existing) throw new ConflictException('User is already a member');

    // Editors cannot invite with role higher than their own
    if (dto.role === 'OWNER') {
      await this.assertRole(workspaceId, userId, ['OWNER']);
    }

    return this.prisma.workspaceMember.create({
      data: { userId: invitee.id, workspaceId, role: dto.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeMember(workspaceId: string, memberId: string, userId: string) {
    await this.assertRole(workspaceId, userId, ['OWNER']);

    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.userId === userId) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    await this.prisma.workspaceMember.delete({ where: { id: memberId } });
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    userId: string,
  ) {
    await this.assertRole(workspaceId, userId, ['OWNER']);

    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.userId === userId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    return this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  // ─── Helpers ─────────────────────────────────────────

  async getUserRole(workspaceId: string, userId: string): Promise<Role | null> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    return member?.role ?? null;
  }

  private async assertRole(workspaceId: string, userId: string, allowedRoles: Role[]) {
    const role = await this.getUserRole(workspaceId, userId);
    if (!role) throw new ForbiddenException('Access denied');
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
