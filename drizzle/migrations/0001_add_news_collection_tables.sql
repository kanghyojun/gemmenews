-- Create news_sources table
CREATE TABLE IF NOT EXISTS "news_sources" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "base_url" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS "articles" (
  "id" SERIAL PRIMARY KEY,
  "source_id" INTEGER NOT NULL REFERENCES "news_sources"("id"),
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL UNIQUE,
  "content" TEXT,
  "original_published_at" TIMESTAMP,
  "collected_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create collection_logs table
CREATE TABLE IF NOT EXISTS "collection_logs" (
  "id" SERIAL PRIMARY KEY,
  "source_id" INTEGER REFERENCES "news_sources"("id"),
  "started_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "completed_at" TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'in_progress',
  "articles_collected" INTEGER NOT NULL DEFAULT 0,
  "error_message" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_articles_source_id" ON "articles"("source_id");
CREATE INDEX IF NOT EXISTS "idx_articles_collected_at" ON "articles"("collected_at");
CREATE INDEX IF NOT EXISTS "idx_articles_url" ON "articles"("url");
CREATE INDEX IF NOT EXISTS "idx_collection_logs_source_id" ON "collection_logs"("source_id");
CREATE INDEX IF NOT EXISTS "idx_collection_logs_started_at" ON "collection_logs"("started_at");
CREATE INDEX IF NOT EXISTS "idx_news_sources_code" ON "news_sources"("code");
