import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCanvasDto,
  UpdateCanvasDto,
  CreateCanvasObjectDto,
  UpdateCanvasObjectDto,
  BulkUpdateCanvasObjectDto,
} from './canvas.dto';

@Injectable()
export class CanvasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCanvasDto, userId: string) {
    await this.assertWorkspaceAccess(dto.workspaceId, userId, true);
    return this.prisma.canvas.create({
      data: {
        title: dto.title,
        workspaceId: dto.workspaceId,
        createdById: userId,
      },
    });
  }

  async findByWorkspace(workspaceId: string, userId: string) {
    await this.assertWorkspaceAccess(workspaceId, userId);
    return this.prisma.canvas.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { objects: true } },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const canvas = await this.prisma.canvas.findUnique({
      where: { id },
      include: {
        objects: { orderBy: { zIndex: 'asc' } },
      },
    });
    if (!canvas) throw new NotFoundException('Canvas not found');
    await this.assertWorkspaceAccess(canvas.workspaceId, userId);
    return canvas;
  }

  async update(id: string, dto: UpdateCanvasDto, userId: string) {
    const canvas = await this.prisma.canvas.findUnique({ where: { id } });
    if (!canvas) throw new NotFoundException('Canvas not found');
    await this.assertWorkspaceAccess(canvas.workspaceId, userId, true);
    return this.prisma.canvas.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    const canvas = await this.prisma.canvas.findUnique({ where: { id } });
    if (!canvas) throw new NotFoundException('Canvas not found');
    await this.assertWorkspaceAccess(canvas.workspaceId, userId, true);
    return this.prisma.canvas.delete({ where: { id } });
  }

  // ─── Canvas Objects ───────────────────────────────────

  async createObject(canvasId: string, dto: CreateCanvasObjectDto, userId: string) {
    const canvas = await this.prisma.canvas.findUnique({ where: { id: canvasId } });
    if (!canvas) throw new NotFoundException('Canvas not found');
    await this.assertWorkspaceAccess(canvas.workspaceId, userId, true);

    return this.prisma.canvasObject.create({
      data: {
        ...dto,
        props: dto.props ?? {},
        canvasId,
      },
    });
  }

  async updateObject(objectId: string, dto: UpdateCanvasObjectDto, userId: string) {
    const obj = await this.prisma.canvasObject.findUnique({
      where: { id: objectId },
      include: { canvas: true },
    });
    if (!obj) throw new NotFoundException('Canvas object not found');
    await this.assertWorkspaceAccess(obj.canvas.workspaceId, userId, true);

    return this.prisma.canvasObject.update({
      where: { id: objectId },
      data: dto,
    });
  }

  async bulkUpdateObjects(canvasId: string, updates: BulkUpdateCanvasObjectDto[], userId: string) {
    const canvas = await this.prisma.canvas.findUnique({ where: { id: canvasId } });
    if (!canvas) throw new NotFoundException('Canvas not found');
    await this.assertWorkspaceAccess(canvas.workspaceId, userId, true);

    const results = await this.prisma.$transaction(
      updates.map(({ id, ...data }) => this.prisma.canvasObject.update({ where: { id }, data })),
    );
    return results;
  }

  async deleteObject(objectId: string, userId: string) {
    const obj = await this.prisma.canvasObject.findUnique({
      where: { id: objectId },
      include: { canvas: true },
    });
    if (!obj) throw new NotFoundException('Canvas object not found');
    await this.assertWorkspaceAccess(obj.canvas.workspaceId, userId, true);

    return this.prisma.canvasObject.delete({ where: { id: objectId } });
  }

  async deleteObjects(canvasId: string, objectIds: string[], userId: string) {
    const canvas = await this.prisma.canvas.findUnique({ where: { id: canvasId } });
    if (!canvas) throw new NotFoundException('Canvas not found');
    await this.assertWorkspaceAccess(canvas.workspaceId, userId, true);

    return this.prisma.canvasObject.deleteMany({
      where: { id: { in: objectIds }, canvasId },
    });
  }

  // ─── Helpers ──────────────────────────────────────────

  private async assertWorkspaceAccess(workspaceId: string, userId: string, requireEdit = false) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');
    if (requireEdit && member.role === 'VIEWER') {
      throw new ForbiddenException('Viewer cannot modify canvas');
    }
  }
}
