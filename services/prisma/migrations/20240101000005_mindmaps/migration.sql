-- Migration: Mindmaps
-- Description: Tree-structured mindmap system with collapsible nodes, colors, and ordering
-- Phase: 4 - Mindmap

-- Mindmaps
CREATE TABLE "mindmaps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL DEFAULT 'Untitled Mindmap',
    "workspace_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mindmaps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mindmaps_workspace_id_idx" ON "mindmaps"("workspace_id");

ALTER TABLE "mindmaps"
    ADD CONSTRAINT "mindmaps_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mindmaps"
    ADD CONSTRAINT "mindmaps_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Mindmap nodes (recursive tree)
CREATE TABLE "mindmap_nodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" TEXT NOT NULL DEFAULT 'New node',
    "color" TEXT NOT NULL DEFAULT '#e3f2fd',
    "icon" TEXT,
    "collapsed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "parent_id" UUID,
    "mindmap_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mindmap_nodes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mindmap_nodes_mindmap_id_idx" ON "mindmap_nodes"("mindmap_id");
CREATE INDEX "mindmap_nodes_mindmap_id_parent_id_idx" ON "mindmap_nodes"("mindmap_id", "parent_id");

ALTER TABLE "mindmap_nodes"
    ADD CONSTRAINT "mindmap_nodes_mindmap_id_fkey"
    FOREIGN KEY ("mindmap_id") REFERENCES "mindmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mindmap_nodes"
    ADD CONSTRAINT "mindmap_nodes_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "mindmap_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
