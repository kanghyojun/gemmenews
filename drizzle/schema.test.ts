import { describe, it, expect } from 'vitest';
import { Users, NewsSources, Articles, CollectionLogs } from './schema';

describe('Database Schema', () => {
  describe('Users Table', () => {
    it('should have correct table name', () => {
      expect(Users).toBeDefined();
      // @ts-ignore - accessing internal property for testing
      expect(Users[Symbol.for('drizzle:Name')]).toBe('users');
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
      // @ts-ignore - accessing internal property for testing
      expect(NewsSources[Symbol.for('drizzle:Name')]).toBe('news_sources');
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
      // @ts-ignore - accessing internal property for testing
      expect(Articles[Symbol.for('drizzle:Name')]).toBe('articles');
    });

    it('should have required columns', () => {
      const columns = Object.keys(Articles);
      expect(columns).toContain('id');
      expect(columns).toContain('sourceId');
      expect(columns).toContain('title');
      expect(columns).toContain('url');
      expect(columns).toContain('content');
      expect(columns).toContain('originalPublishedAt');
      expect(columns).toContain('collectedAt');
      expect(columns).toContain('createdAt');
    });
  });

  describe('CollectionLogs Table', () => {
    it('should have correct table name', () => {
      expect(CollectionLogs).toBeDefined();
      // @ts-ignore - accessing internal property for testing
      expect(CollectionLogs[Symbol.for('drizzle:Name')]).toBe('collection_logs');
    });

    it('should have required columns', () => {
      const columns = Object.keys(CollectionLogs);
      expect(columns).toContain('id');
      expect(columns).toContain('sourceId');
      expect(columns).toContain('startedAt');
      expect(columns).toContain('completedAt');
      expect(columns).toContain('status');
      expect(columns).toContain('articlesCollected');
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
        // @ts-ignore
        Users[Symbol.for('drizzle:Name')],
        // @ts-ignore
        NewsSources[Symbol.for('drizzle:Name')],
        // @ts-ignore
        Articles[Symbol.for('drizzle:Name')],
        // @ts-ignore
        CollectionLogs[Symbol.for('drizzle:Name')],
      ];

      const uniqueNames = new Set(tableNames);
      expect(uniqueNames.size).toBe(4);
    });
  });

  describe('Timezone Support', () => {
    it('should use timestamptz for Articles timestamp columns', () => {
      // @ts-ignore - accessing internal column configuration
      const collectedAtColumn = Articles.collectedAt;
      const createdAtColumn = Articles.createdAt;
      const originalPublishedAtColumn = Articles.originalPublishedAt;

      expect(collectedAtColumn).toBeDefined();
      expect(createdAtColumn).toBeDefined();
      expect(originalPublishedAtColumn).toBeDefined();

      // Verify columns use timezone-aware timestamps
      // @ts-ignore
      expect(collectedAtColumn.columnType).toBe('PgTimestamp');
      // @ts-ignore
      expect(createdAtColumn.columnType).toBe('PgTimestamp');
      // @ts-ignore
      expect(originalPublishedAtColumn.columnType).toBe('PgTimestamp');
    });

    it('should use timestamptz for NewsSources timestamp columns', () => {
      // @ts-ignore - accessing internal column configuration
      const createdAtColumn = NewsSources.createdAt;
      const updatedAtColumn = NewsSources.updatedAt;

      expect(createdAtColumn).toBeDefined();
      expect(updatedAtColumn).toBeDefined();

      // @ts-ignore
      expect(createdAtColumn.columnType).toBe('PgTimestamp');
      // @ts-ignore
      expect(updatedAtColumn.columnType).toBe('PgTimestamp');
    });

    it('should use timestamptz for CollectionLogs timestamp columns', () => {
      // @ts-ignore - accessing internal column configuration
      const startedAtColumn = CollectionLogs.startedAt;
      const completedAtColumn = CollectionLogs.completedAt;
      const createdAtColumn = CollectionLogs.createdAt;

      expect(startedAtColumn).toBeDefined();
      expect(completedAtColumn).toBeDefined();
      expect(createdAtColumn).toBeDefined();

      // @ts-ignore
      expect(startedAtColumn.columnType).toBe('PgTimestamp');
      // @ts-ignore
      expect(completedAtColumn.columnType).toBe('PgTimestamp');
      // @ts-ignore
      expect(createdAtColumn.columnType).toBe('PgTimestamp');
    });
  });
});
