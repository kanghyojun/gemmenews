import { db } from '../api/db';
import { NewsSources, Articles, CollectionLogs } from '@/schema';
import { eq } from 'drizzle-orm';

/**
 * 뉴스 수집 결과 타입
 */
export interface CollectionResult {
  success: boolean;
  sourceId: number;
  sourceName: string;
  articlesCollected: number;
  errorMessage?: string;
}

/**
 * 전체 수집 결과 타입
 */
export interface OverallCollectionResult {
  success: boolean;
  totalArticles: number;
  sources: CollectionResult[];
  logId: number;
}

/**
 * Mock 기사 데이터 생성
 */
function generateMockArticles(sourceCode: string, count: number) {
  const articles = [];
  const timestamp = Date.now();

  for (let i = 0; i < count; i++) {
    articles.push({
      title: `[Mock] ${sourceCode} Article ${i + 1} - ${new Date().toISOString()}`,
      url: `https://example.com/${sourceCode}/article-${timestamp}-${i}`,
      content: `This is a mock article content for ${sourceCode}. Generated at ${new Date().toISOString()}.`,
      originalPublishedAt: new Date(),
    });
  }

  return articles;
}

/**
 * 특정 소스에서 뉴스 수집 (Mock)
 */
export async function collectFromSource(sourceId: number): Promise<CollectionResult> {
  try {
    // 뉴스 소스 정보 조회
    const [source] = await db.select().from(NewsSources).where(eq(NewsSources.id, sourceId)).execute();

    if (!source) {
      throw new Error(`News source with id ${sourceId} not found`);
    }

    if (!source.isActive) {
      return {
        success: false,
        sourceId,
        sourceName: source.name,
        articlesCollected: 0,
        errorMessage: 'Source is not active',
      };
    }

    // Mock 기사 데이터 생성 (5-15개 랜덤)
    const mockCount = Math.floor(Math.random() * 11) + 5;
    const mockArticles = generateMockArticles(source.code, mockCount);

    // 기사 저장 (중복 체크)
    let savedCount = 0;
    for (const article of mockArticles) {
      try {
        // URL 중복 체크
        const existing = await db.select().from(Articles).where(eq(Articles.url, article.url)).execute();

        if (existing.length === 0) {
          await db
            .insert(Articles)
            .values({
              sourceId: source.id,
              title: article.title,
              url: article.url,
              content: article.content,
              originalPublishedAt: article.originalPublishedAt,
            })
            .execute();
          savedCount++;
        }
      } catch (error) {
        console.error(`Failed to save article: ${article.url}`, error);
        // 개별 기사 저장 실패는 무시하고 계속 진행
      }
    }

    return {
      success: true,
      sourceId,
      sourceName: source.name,
      articlesCollected: savedCount,
    };
  } catch (error) {
    console.error(`Failed to collect from source ${sourceId}:`, error);
    return {
      success: false,
      sourceId,
      sourceName: 'Unknown',
      articlesCollected: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 모든 활성 뉴스 소스에서 수집
 */
export async function collectAllNews(): Promise<OverallCollectionResult> {
  const startedAt = new Date();
  let logId = 0;

  try {
    // 전체 수집 로그 생성
    const [log] = await db
      .insert(CollectionLogs)
      .values({
        sourceId: null, // null = 전체 수집
        startedAt,
        status: 'in_progress',
        articlesCollected: 0,
      })
      .returning()
      .execute();

    logId = log.id;

    // 활성 뉴스 소스 조회
    const activeSources = await db.select().from(NewsSources).where(eq(NewsSources.isActive, true)).execute();

    if (activeSources.length === 0) {
      // 활성 소스가 없는 경우
      await db
        .update(CollectionLogs)
        .set({
          completedAt: new Date(),
          status: 'success',
          articlesCollected: 0,
        })
        .where(eq(CollectionLogs.id, logId))
        .execute();

      return {
        success: true,
        totalArticles: 0,
        sources: [],
        logId,
      };
    }

    // 각 소스에서 수집
    const results: CollectionResult[] = [];
    for (const source of activeSources) {
      const result = await collectFromSource(source.id);
      results.push(result);

      // 개별 소스 수집 로그 생성
      await db
        .insert(CollectionLogs)
        .values({
          sourceId: source.id,
          startedAt: new Date(),
          completedAt: new Date(),
          status: result.success ? 'success' : 'failed',
          articlesCollected: result.articlesCollected,
          errorMessage: result.errorMessage,
        })
        .execute();
    }

    // 전체 결과 집계
    const totalArticles = results.reduce((sum, r) => sum + r.articlesCollected, 0);
    const allSuccess = results.every((r) => r.success);

    // 전체 수집 로그 업데이트
    await db
      .update(CollectionLogs)
      .set({
        completedAt: new Date(),
        status: allSuccess ? 'success' : 'failed',
        articlesCollected: totalArticles,
      })
      .where(eq(CollectionLogs.id, logId))
      .execute();

    return {
      success: allSuccess,
      totalArticles,
      sources: results,
      logId,
    };
  } catch (error) {
    console.error('Failed to collect all news:', error);

    // 로그가 생성된 경우 실패로 업데이트
    if (logId > 0) {
      await db
        .update(CollectionLogs)
        .set({
          completedAt: new Date(),
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        })
        .where(eq(CollectionLogs.id, logId))
        .execute();
    }

    throw error;
  }
}
