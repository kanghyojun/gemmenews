import { APIEvent } from '@solidjs/start/server';
import { collectAllNews } from '../../services/newsCollectionService';

/**
 * 뉴스 수집 API 엔드포인트
 *
 * GET /api/collect-news
 *
 * 모든 활성 뉴스 소스에서 기사를 수집합니다.
 *
 * Response:
 * {
 *   "success": true,
 *   "totalArticles": 42,
 *   "sources": [
 *     { "sourceName": "Hacker News", "articlesCollected": 15, "success": true },
 *     ...
 *   ],
 *   "logId": 123
 * }
 */
export async function GET(event: APIEvent) {
  try {
    console.log('🚀 Starting news collection...');

    const result = await collectAllNews();

    console.log(`✅ News collection completed: ${result.totalArticles} articles collected`);

    // 응답 형식 변환
    const response = {
      success: result.success,
      totalArticles: result.totalArticles,
      sources: result.sources.map(source => ({
        name: source.sourceName,
        articles: source.articlesCollected,
        success: source.success,
        error: source.errorMessage,
      })),
      logId: result.logId,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ News collection failed:', error);

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * POST 요청도 지원 (동일한 동작)
 */
export async function POST(event: APIEvent) {
  return GET(event);
}
