import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMindmapDto,
  UpdateMindmapDto,
  CreateMindmapNodeDto,
  UpdateMindmapNodeDto,
} from './mindmap.dto';

export interface NodeTree {
  id: string;
  label: string;
  color: string;
  icon: string | null;
  collapsed: boolean;
  position: number;
  parentId: string | null;
  children: NodeTree[];
}

@Injectable()
export class MindmapService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMindmapDto, userId: string) {
    await this.assertWorkspaceAccess(dto.workspaceId, userId, true);
    const mindmap = await this.prisma.mindmap.create({
      data: {
        title: dto.title,
        workspaceId: dto.workspaceId,
        createdById: userId,
      },
    });
    // Create root node
    await this.prisma.mindmapNode.create({
      data: {
        label: dto.title || 'Central Topic',
        color: '#1976d2',
        mindmapId: mindmap.id,
      },
    });
    return mindmap;
  }

  async findByWorkspace(workspaceId: string, userId: string) {
    await this.assertWorkspaceAccess(workspaceId, userId);
    return this.prisma.mindmap.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { nodes: true } },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const mindmap = await this.prisma.mindmap.findUnique({
      where: { id },
      include: { nodes: { orderBy: { position: 'asc' } } },
    });
    if (!mindmap) throw new NotFoundException('Mindmap not found');
    await this.assertWorkspaceAccess(mindmap.workspaceId, userId);
    return { ...mindmap, tree: this.buildTree(mindmap.nodes) };
  }

  async update(id: string, dto: UpdateMindmapDto, userId: string) {
    const mindmap = await this.prisma.mindmap.findUnique({ where: { id } });
    if (!mindmap) throw new NotFoundException('Mindmap not found');
    await this.assertWorkspaceAccess(mindmap.workspaceId, userId, true);
    return this.prisma.mindmap.update({ where: { id }, data: dto });
  }

  async delete(id: string, userId: string) {
    const mindmap = await this.prisma.mindmap.findUnique({ where: { id } });
    if (!mindmap) throw new NotFoundException('Mindmap not found');
    await this.assertWorkspaceAccess(mindmap.workspaceId, userId, true);
    return this.prisma.mindmap.delete({ where: { id } });
  }

  // ─── Nodes ────────────────────────────────────────────

  async createNode(mindmapId: string, dto: CreateMindmapNodeDto, userId: string) {
    const mindmap = await this.prisma.mindmap.findUnique({ where: { id: mindmapId } });
    if (!mindmap) throw new NotFoundException('Mindmap not found');
    await this.assertWorkspaceAccess(mindmap.workspaceId, userId, true);

    // Auto-assign position
    const siblingCount = await this.prisma.mindmapNode.count({
      where: { mindmapId, parentId: dto.parentId ?? null },
    });

    return this.prisma.mindmapNode.create({
      data: {
        label: dto.label,
        color: dto.color,
        parentId: dto.parentId,
        position: dto.position ?? siblingCount,
        mindmapId,
      },
    });
  }

  async updateNode(nodeId: string, dto: UpdateMindmapNodeDto, userId: string) {
    const node = await this.prisma.mindmapNode.findUnique({
      where: { id: nodeId },
      include: { mindmap: true },
    });
    if (!node) throw new NotFoundException('Mindmap node not found');
    await this.assertWorkspaceAccess(node.mindmap.workspaceId, userId, true);

    return this.prisma.mindmapNode.update({
      where: { id: nodeId },
      data: dto,
    });
  }

  async deleteNode(nodeId: string, userId: string) {
    const node = await this.prisma.mindmapNode.findUnique({
      where: { id: nodeId },
      include: { mindmap: true },
    });
    if (!node) throw new NotFoundException('Mindmap node not found');
    await this.assertWorkspaceAccess(node.mindmap.workspaceId, userId, true);

    // Prevent deleting root node
    if (!node.parentId) {
      throw new ForbiddenException('Cannot delete root node');
    }

    return this.prisma.mindmapNode.delete({ where: { id: nodeId } });
  }

  // ─── Helpers ──────────────────────────────────────────

  private buildTree(
    nodes: {
      id: string;
      label: string;
      color: string;
      icon: string | null;
      collapsed: boolean;
      position: number;
      parentId: string | null;
    }[],
  ): NodeTree[] {
    const map = new Map<string, NodeTree>();
    const roots: NodeTree[] = [];

    for (const n of nodes) {
      map.set(n.id, { ...n, children: [] });
    }

    for (const n of nodes) {
      const node = map.get(n.id)!;
      if (n.parentId && map.has(n.parentId)) {
        map.get(n.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private async assertWorkspaceAccess(workspaceId: string, userId: string, requireEdit = false) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');
    if (requireEdit && member.role === 'VIEWER') {
      throw new ForbiddenException('Viewer cannot modify mindmap');
    }
  }
}
