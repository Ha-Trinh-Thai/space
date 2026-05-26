-- Migration: Documents
-- Description: Notion-like document system with recursive tree structure, favorites, and rich content
-- Phase: 2 - Document System

CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "content" JSONB DEFAULT '{}',
    "icon" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "workspace_id" UUID NOT NULL,
    "parent_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- Index for tree queries (children of a parent within workspace)
CREATE INDEX "documents_workspace_id_parent_id_idx"
    ON "documents"("workspace_id", "parent_id");

-- Index for favorites listing
CREATE INDEX "documents_workspace_id_is_favorite_idx"
    ON "documents"("workspace_id", "is_favorite");

ALTER TABLE "documents"
    ADD CONSTRAINT "documents_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "documents"
    ADD CONSTRAINT "documents_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "documents"
    ADD CONSTRAINT "documents_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
