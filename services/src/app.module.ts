import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DocumentModule } from './document/document.module';
import { CommentModule } from './comment/comment.module';
import { CanvasModule } from './canvas/canvas.module';
import { MindmapModule } from './mindmap/mindmap.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    DocumentModule,
    CommentModule,
    CanvasModule,
    MindmapModule,
    GatewayModule,
  ],
})
export class AppModule {}
