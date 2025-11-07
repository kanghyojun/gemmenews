import { describe, it, expect } from 'vitest';
import type { CollectionResult, OverallCollectionResult } from './news-collection-service';

describe('News Collection Service Types', () => {
  describe('CollectionResult', () => {
    it('should have correct structure for success case', () => {
      const result: CollectionResult = {
        success: true,
        sourceId: 1,
        sourceName: 'Test Source',
        articlesCollected: 10,
      };

      expect(result.success).toBe(true);
      expect(result.sourceId).toBe(1);
      expect(result.sourceName).toBe('Test Source');
      expect(result.articlesCollected).toBe(10);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should have correct structure for failure case', () => {
      const result: CollectionResult = {
        success: false,
        sourceId: 1,
        sourceName: 'Test Source',
        articlesCollected: 0,
        errorMessage: 'Test error',
      };

      expect(result.success).toBe(false);
      expect(result.articlesCollected).toBe(0);
      expect(result.errorMessage).toBe('Test error');
    });
  });

  describe('OverallCollectionResult', () => {
    it('should have correct structure', () => {
      const result: OverallCollectionResult = {
        success: true,
        totalArticles: 30,
        sources: [
          {
            success: true,
            sourceId: 1,
            sourceName: 'Source 1',
            articlesCollected: 10,
          },
          {
            success: true,
            sourceId: 2,
            sourceName: 'Source 2',
            articlesCollected: 20,
          },
        ],
        logId: 123,
      };

      expect(result.success).toBe(true);
      expect(result.totalArticles).toBe(30);
      expect(result.sources).toHaveLength(2);
      expect(result.logId).toBe(123);
    });

    it('should calculate total articles correctly', () => {
      const sources: CollectionResult[] = [
        {
          success: true,
          sourceId: 1,
          sourceName: 'Source 1',
          articlesCollected: 15,
        },
        {
          success: true,
          sourceId: 2,
          sourceName: 'Source 2',
          articlesCollected: 12,
        },
        {
          success: true,
          sourceId: 3,
          sourceName: 'Source 3',
          articlesCollected: 18,
        },
      ];

      const totalArticles = sources.reduce((sum, s) => sum + s.articlesCollected, 0);
      expect(totalArticles).toBe(45);
    });
  });
});

describe('News Collection Service Functions', () => {
  describe('collectFromSource', () => {
    it('should be defined and exported', async () => {
      const { collectFromSource } = await import('./news-collection-service');
      expect(collectFromSource).toBeDefined();
      expect(typeof collectFromSource).toBe('function');
    });
  });

  describe('collectAllNews', () => {
    it('should be defined and exported', async () => {
      const { collectAllNews } = await import('./news-collection-service');
      expect(collectAllNews).toBeDefined();
      expect(typeof collectAllNews).toBe('function');
    });
  });
});
