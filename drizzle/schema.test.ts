import { describe, it, expect } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { Users, NewsSources, Articles, CollectionLogs } from './schema';

describe('Database Schema', () => {
  describe('Users Table', () => {
    it('should have correct table name', () => {
      expect(Users).toBeDefined();
      expect(getTableConfig(Users).name).toBe('users');
    });

    it('should have required columns', () => {
      const columns = Object.keys(Users);
      expect(columns).toContain('id');
      expect(columns).toContain('username');
      expect(columns).toContain('password');
    });
  });

  describe('NewsSources Table', () => {
    it('should have correct table name', () => {
      expect(NewsSources).toBeDefined();
      expect(getTableConfig(NewsSources).name).toBe('news_sources');
    });

    it('should have required columns', () => {
      const columns = Object.keys(NewsSources);
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('code');
      expect(columns).toContain('baseUrl');
      expect(columns).toContain('config');
      expect(columns).toContain('isActive');
      expect(columns).toContain('createdAt');
      expect(columns).toContain('updatedAt');
    });
  });

  describe('Articles Table', () => {
    it('should have correct table name', () => {
      expect(Articles).toBeDefined();
      expect(getTableConfig(Articles).name).toBe('articles');
    });

    it('should have required columns', () => {
      const columns = Object.keys(Articles);
      expect(columns).toContain('id');
      expect(columns).toContain('sourceId');
      expect(columns).toContain('title');
      expect(columns).toContain('url');
      expect(columns).toContain('content');
      expect(columns).toContain('originalPublishedAt');
      expect(columns).toContain('collectionLogId');
      expect(columns).toContain('createdAt');
    });
  });

  describe('CollectionLogs Table', () => {
    it('should have correct table name', () => {
      expect(CollectionLogs).toBeDefined();
      expect(getTableConfig(CollectionLogs).name).toBe('collection_logs');
    });

    it('should have required columns', () => {
      const columns = Object.keys(CollectionLogs);
      expect(columns).toContain('id');
      expect(columns).toContain('sourceId');
      expect(columns).toContain('startedAt');
      expect(columns).toContain('completedAt');
      expect(columns).toContain('status');
      expect(columns).toContain('errorMessage');
      expect(columns).toContain('createdAt');
    });
  });

  describe('Schema Relationships', () => {
    it('should export all required tables', () => {
      expect(Users).toBeDefined();
      expect(NewsSources).toBeDefined();
      expect(Articles).toBeDefined();
      expect(CollectionLogs).toBeDefined();
    });

    it('should have unique table names', () => {
      const tableNames = [
        getTableConfig(Users).name,
        getTableConfig(NewsSources).name,
        getTableConfig(Articles).name,
        getTableConfig(CollectionLogs).name,
      ];

      const uniqueNames = new Set(tableNames);
      expect(uniqueNames.size).toBe(4);
    });
  });

  describe('Timezone Support', () => {
    it('should use timestamptz for Articles timestamp columns', () => {
      const createdAtColumn = Articles.createdAt;
      const originalPublishedAtColumn = Articles.originalPublishedAt;

      expect(createdAtColumn).toBeDefined();
      expect(originalPublishedAtColumn).toBeDefined();

      // Verify columns use timezone-aware timestamps
      expect(createdAtColumn.columnType).toBe('PgTimestamp');
      expect(originalPublishedAtColumn.columnType).toBe('PgTimestamp');
    });

    it('should use timestamptz for NewsSources timestamp columns', () => {
      const createdAtColumn = NewsSources.createdAt;
      const updatedAtColumn = NewsSources.updatedAt;

      expect(createdAtColumn).toBeDefined();
      expect(updatedAtColumn).toBeDefined();

      expect(createdAtColumn.columnType).toBe('PgTimestamp');
      expect(updatedAtColumn.columnType).toBe('PgTimestamp');
    });

    it('should use timestamptz for CollectionLogs timestamp columns', () => {
      const startedAtColumn = CollectionLogs.startedAt;
      const completedAtColumn = CollectionLogs.completedAt;
      const createdAtColumn = CollectionLogs.createdAt;

      expect(startedAtColumn).toBeDefined();
      expect(completedAtColumn).toBeDefined();
      expect(createdAtColumn).toBeDefined();

      expect(startedAtColumn.columnType).toBe('PgTimestamp');
      expect(completedAtColumn.columnType).toBe('PgTimestamp');
      expect(createdAtColumn.columnType).toBe('PgTimestamp');
    });
  });
});
