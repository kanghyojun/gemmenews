-- Migration: Add timezone support to all timestamp columns
-- Convert TIMESTAMP to TIMESTAMP WITH TIME ZONE (TIMESTAMPTZ)

-- Update news_sources table
ALTER TABLE "news_sources"
  ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE;

-- Update articles table
ALTER TABLE "articles"
  ALTER COLUMN "original_published_at" TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "collected_at" TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE;

-- Update collection_logs table
ALTER TABLE "collection_logs"
  ALTER COLUMN "started_at" TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "completed_at" TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE;
