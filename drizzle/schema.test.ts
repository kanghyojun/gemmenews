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
});
