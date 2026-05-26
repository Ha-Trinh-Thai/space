import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto, MoveDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDocumentDto, userId: string) {
    await this.assertWorkspaceAccess(dto.workspaceId, userId, ['OWNER', 'EDITOR']);

    const maxPosition = await this.prisma.document.count({
      where: { workspaceId: dto.workspaceId, parentId: dto.parentId ?? null },
    });

    return this.prisma.document.create({
      data: {
        title: dto.title ?? 'Untitled',
        content: dto.content ?? {},
        icon: dto.icon,
        workspaceId: dto.workspaceId,
        parentId: dto.parentId ?? null,
        createdById: userId,
        position: maxPosition,
      },
    });
  }

  async getTree(workspaceId: string, userId: string) {
    await this.assertWorkspaceAccess(workspaceId, userId);

    const documents = await this.prisma.document.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        icon: true,
        parentId: true,
        position: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { position: 'asc' },
    });

    return this.buildTree(documents);
  }

  async getFavorites(workspaceId: string, userId: string) {
    await this.assertWorkspaceAccess(workspaceId, userId);

    return this.prisma.document.findMany({
      where: { workspaceId, isFavorite: true },
      select: { id: true, title: true, icon: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        children: {
          select: { id: true, title: true, icon: true, position: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!doc) throw new NotFoundException('Document not found');
    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.assertWorkspaceAccess(doc.workspaceId, userId, ['OWNER', 'EDITOR']);

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.isFavorite !== undefined && { isFavorite: dto.isFavorite }),
      },
    });
  }

  async move(id: string, dto: MoveDocumentDto, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.assertWorkspaceAccess(doc.workspaceId, userId, ['OWNER', 'EDITOR']);

    return this.prisma.$transaction(async (tx) => {
      // Update positions for siblings in destination
      await tx.document.updateMany({
        where: {
          workspaceId: doc.workspaceId,
          parentId: dto.parentId ?? null,
          position: { gte: dto.position },
        },
        data: { position: { increment: 1 } },
      });

      return tx.document.update({
        where: { id },
        data: { parentId: dto.parentId ?? null, position: dto.position },
      });
    });
  }

  async delete(id: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.assertWorkspaceAccess(doc.workspaceId, userId, ['OWNER', 'EDITOR']);

    await this.prisma.document.delete({ where: { id } });
  }

  async search(workspaceId: string, query: string, userId: string) {
    await this.assertWorkspaceAccess(workspaceId, userId);

    if (!query || query.trim().length < 2) return [];

    // PostgreSQL full-text search on title
    return this.prisma.document.findMany({
      where: {
        workspaceId,
        OR: [{ title: { contains: query, mode: 'insensitive' } }],
      },
      select: { id: true, title: true, icon: true, updatedAt: true, parentId: true },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ─── Helpers ───────────────────────────────────────

  private buildTree(docs: any[]) {
    const map = new Map<string | null, any[]>();
    for (const doc of docs) {
      const parentKey = doc.parentId ?? '__root__';
      if (!map.has(parentKey)) map.set(parentKey, []);
      map.get(parentKey)!.push(doc);
    }

    function attach(parentId: string | null): any[] {
      const key = parentId ?? '__root__';
      const children = map.get(key) || [];
      return children.map((child) => ({
        ...child,
        children: attach(child.id),
      }));
    }

    return attach(null);
  }

  private async assertWorkspaceAccess(
    workspaceId: string,
    userId: string,
    allowedRoles?: string[],
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new ForbiddenException('Access denied');
    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
