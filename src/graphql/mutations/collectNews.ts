import { builder } from '../builder';
import { CollectionResult } from '../types/collectionResult';
import { collectAllNews } from '../../services/newsCollectionService';

/**
 * collectNews - 뉴스 수집 뮤테이션
 *
 * 모든 활성 뉴스 소스에서 기사를 수집합니다.
 */
builder.mutationField('collectNews', (t) =>
  t.field({
    type: CollectionResult,
    description: '모든 활성 뉴스 소스에서 기사를 수집합니다.',
    resolve: async () => {
      try {
        console.log('🚀 Starting news collection via GraphQL...');

        const result = await collectAllNews();

        console.log(`✅ News collection completed: ${result.totalArticles} articles collected`);

        // 응답 형식 변환
        return {
          success: result.success,
          totalArticles: result.totalArticles,
          sources: result.sources.map((source) => ({
            sourceName: source.sourceName,
            articles: source.articlesCollected,
            success: source.success,
            error: source.errorMessage ?? null,
          })),
          logId: result.logId,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('❌ News collection failed:', error);

        // 에러 발생 시에도 응답 반환
        return {
          success: false,
          totalArticles: 0,
          sources: [],
          logId: 0,
          timestamp: new Date().toISOString(),
        };
      }
    },
  })
);
