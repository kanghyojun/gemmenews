import { describe, it, expect } from 'vitest';
import { schema } from '../schema';

describe('collectNews Mutation', () => {
  it('should have correct structure', () => {
    const mutationType = schema.getMutationType();
    const collectNewsField = mutationType?.getFields()['collectNews'];

    expect(collectNewsField).toBeDefined();
    expect(collectNewsField?.type.toString()).toContain('CollectionResult');
    expect(collectNewsField?.description).toBe(
      '모든 활성 뉴스 소스에서 기사를 수집합니다.'
    );
  });

  it('should have no arguments', () => {
    const mutationType = schema.getMutationType();
    const collectNewsField = mutationType?.getFields()['collectNews'];

    expect(collectNewsField?.args).toHaveLength(0);
  });

  it('should return CollectionResult type with correct fields', () => {
    const collectionResultType = schema.getType('CollectionResult');
    expect(collectionResultType).toBeDefined();

    // Check if it's an object type
    if (collectionResultType && 'getFields' in collectionResultType) {
      const fields = collectionResultType.getFields();

      expect(fields).toHaveProperty('success');
      expect(fields).toHaveProperty('totalArticles');
      expect(fields).toHaveProperty('sources');
      expect(fields).toHaveProperty('logId');
      expect(fields).toHaveProperty('timestamp');

      expect(fields.success.type.toString()).toContain('Boolean');
      expect(fields.totalArticles.type.toString()).toContain('Int');
      expect(fields.sources.type.toString()).toContain('SourceCollectionResult');
      expect(fields.logId.type.toString()).toContain('Int');
      expect(fields.timestamp.type.toString()).toContain('String');
    }
  });

  it('should have SourceCollectionResult type with correct fields', () => {
    const sourceResultType = schema.getType('SourceCollectionResult');
    expect(sourceResultType).toBeDefined();

    if (sourceResultType && 'getFields' in sourceResultType) {
      const fields = sourceResultType.getFields();

      expect(fields).toHaveProperty('sourceName');
      expect(fields).toHaveProperty('articles');
      expect(fields).toHaveProperty('success');
      expect(fields).toHaveProperty('error');

      expect(fields.sourceName.type.toString()).toContain('String');
      expect(fields.articles.type.toString()).toContain('Int');
      expect(fields.success.type.toString()).toContain('Boolean');
      expect(fields.error.type.toString()).toContain('String');
    }
  });
});
