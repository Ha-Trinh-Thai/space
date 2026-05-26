import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: dto.documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        documentId: dto.documentId,
        authorId: userId,
        anchorId: dto.anchorId,
        parentId: dto.parentId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findByDocument(documentId: string, userId: string) {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.assertWorkspaceAccess(doc.workspaceId, userId);

    // Get top-level comments with replies
    return this.prisma.comment.findMany({
      where: { documentId, parentId: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
        replies: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { document: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    // Only author can edit content, but workspace editors can resolve
    if (dto.content !== undefined && comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can edit this comment');
    }

    if (dto.resolved !== undefined) {
      await this.assertWorkspaceAccess(comment.document.workspaceId, userId, ['OWNER', 'EDITOR']);
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.resolved !== undefined && { resolved: dto.resolved }),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { document: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    // Author or workspace owner/editor can delete
    if (comment.authorId !== userId) {
      await this.assertWorkspaceAccess(comment.document.workspaceId, userId, ['OWNER', 'EDITOR']);
    }

    await this.prisma.comment.delete({ where: { id } });
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
