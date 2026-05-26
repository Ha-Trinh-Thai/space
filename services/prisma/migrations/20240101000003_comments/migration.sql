-- Migration: Comments
-- Description: Threaded comment system with inline anchoring and resolution status
-- Phase: 2 - Document System (Comments)

CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "anchor_id" TEXT,
    "document_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "parent_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- Index for fetching comments by document
CREATE INDEX "comments_document_id_idx" ON "comments"("document_id");

ALTER TABLE "comments"
    ADD CONSTRAINT "comments_document_id_fkey"
    FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments"
    ADD CONSTRAINT "comments_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comments"
    ADD CONSTRAINT "comments_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
