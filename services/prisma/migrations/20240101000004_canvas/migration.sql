-- Migration: Canvas / Whiteboard
-- Description: Infinite canvas system with typed objects (shapes, arrows, text, sticky notes, pencil)
-- Phase: 3 - Canvas/Whiteboard

-- Object type enum
CREATE TYPE "CanvasObjectType" AS ENUM (
    'RECTANGLE',
    'ELLIPSE',
    'ARROW',
    'LINE',
    'TEXT',
    'STICKY_NOTE',
    'IMAGE',
    'PENCIL',
    'GROUP'
);

-- Canvases (one per whiteboard)
CREATE TABLE "canvases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL DEFAULT 'Untitled Canvas',
    "workspace_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canvases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "canvases_workspace_id_idx" ON "canvases"("workspace_id");

ALTER TABLE "canvases"
    ADD CONSTRAINT "canvases_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "canvases"
    ADD CONSTRAINT "canvases_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Canvas objects (shapes, arrows, text, etc.)
CREATE TABLE "canvas_objects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "CanvasObjectType" NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scale_x" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "scale_y" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "props" JSONB NOT NULL DEFAULT '{}',
    "z_index" INTEGER NOT NULL DEFAULT 0,
    "group_id" UUID,
    "canvas_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canvas_objects_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "canvas_objects_canvas_id_idx" ON "canvas_objects"("canvas_id");

ALTER TABLE "canvas_objects"
    ADD CONSTRAINT "canvas_objects_canvas_id_fkey"
    FOREIGN KEY ("canvas_id") REFERENCES "canvases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "canvas_objects"
    ADD CONSTRAINT "canvas_objects_group_id_fkey"
    FOREIGN KEY ("group_id") REFERENCES "canvas_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
