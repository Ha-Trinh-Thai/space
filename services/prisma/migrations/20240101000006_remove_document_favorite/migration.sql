-- Migration: Remove document favorite
-- Description: Drops the favorites feature (is_favorite column and its listing index)

DROP INDEX "documents_workspace_id_is_favorite_idx";

ALTER TABLE "documents" DROP COLUMN "is_favorite";
