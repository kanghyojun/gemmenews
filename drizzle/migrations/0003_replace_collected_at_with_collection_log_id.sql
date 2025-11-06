-- Add collection_log_id column to articles table
ALTER TABLE "articles"
ADD COLUMN "collection_log_id" INTEGER REFERENCES "collection_logs"("id");

-- For existing articles, we'll set collection_log_id to NULL temporarily
-- In production, you might want to create placeholder collection_logs for existing articles

-- Drop the collected_at column from articles
ALTER TABLE "articles"
DROP COLUMN "collected_at";

-- Drop the articles_collected column from collection_logs
-- This can be calculated via JOIN with articles table
ALTER TABLE "collection_logs"
DROP COLUMN "articles_collected";

-- Make collection_log_id NOT NULL after data migration
-- Uncomment this after populating collection_log_id for existing articles
-- ALTER TABLE "articles"
-- ALTER COLUMN "collection_log_id" SET NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "idx_articles_collection_log_id" ON "articles"("collection_log_id");
