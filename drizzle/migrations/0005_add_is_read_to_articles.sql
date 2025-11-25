-- Add is_read column to articles table
ALTER TABLE articles ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
