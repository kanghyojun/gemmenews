import { db } from "./db";
import { NewsSources, Articles, CollectionLogs } from "@/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { Crawler, CrawlerConfig } from "./crawl";

/**
 * 뉴스 수집 결과 인터페이스
 */
export interface CollectionResult {
  sourceId: number;
  sourceName: string;
  articlesCollected: number;
  status: "success" | "failed";
  errorMessage?: string;
}

/**
 * 뉴스 수집 함수
 *
 * 실행 시점을 기준으로 등록된 모든 뉴스 소스에서 기사를 수집합니다.
 *
 * 동작 흐름:
 * 1. 활성화된 모든 news_sources를 가져옵니다
 * 2. 오늘 날짜에 이미 시작된 collection_logs가 있는지 확인합니다
 * 3. 수집되지 않은 소스에 대해 collection_logs를 in_progress 상태로 생성합니다
 * 4. 각 소스별로 Crawler를 생성하여 기사를 수집합니다
 * 5. 수집된 기사를 Articles 테이블에 저장합니다 (URL 중복 방지)
 * 6. 수집 완료 후 collection_logs를 업데이트합니다 (status, completed_at)
 *
 * @returns 수집 결과 배열
 */
export async function collectNews(): Promise<CollectionResult[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const results: CollectionResult[] = [];

  try {
    // 1. 활성화된 모든 뉴스 소스 가져오기
    const activeSources = await db.select().from(NewsSources).where(eq(NewsSources.isActive, true));

    if (activeSources.length === 0) {
      console.log("활성화된 뉴스 소스가 없습니다.");
      return results;
    }

    console.log(`${activeSources.length}개의 활성화된 뉴스 소스를 찾았습니다.`);

    // 2. 오늘 이미 시작된 collection_logs 확인
    const todayLogs = await db
      .select()
      .from(CollectionLogs)
      .where(and(gte(CollectionLogs.startedAt, startOfDay), lt(CollectionLogs.startedAt, endOfDay)));

    const loggedSourceIds = new Set(todayLogs.map((log: typeof CollectionLogs.$inferSelect) => log.sourceId));

    // 3. 아직 수집되지 않은 소스만 필터링
    const sourcesToCollect = activeSources.filter(
      (source: typeof NewsSources.$inferSelect) => !loggedSourceIds.has(source.id),
    );

    if (sourcesToCollect.length === 0) {
      console.log("오늘 수집할 새로운 소스가 없습니다.");
      return results;
    }

    console.log(`${sourcesToCollect.length}개의 소스에서 뉴스를 수집합니다.`);

    // 3-1. collection_logs에 in_progress 상태로 등록
    const insertedLogs = await Promise.all(
      sourcesToCollect.map((source: typeof NewsSources.$inferSelect) =>
        db
          .insert(CollectionLogs)
          .values({
            sourceId: source.id,
            startedAt: now,
            status: "in_progress",
          })
          .returning(),
      ),
    );

    const logMap = new Map<number, number>();
    insertedLogs.forEach((logs: Array<typeof CollectionLogs.$inferSelect>) => {
      if (logs[0]) {
        logMap.set(logs[0].sourceId!, logs[0].id);
      }
    });

    // 4. 각 소스별로 크롤링 수행
    for (const source of sourcesToCollect) {
      const logId = logMap.get(source.id);
      if (!logId) {
        console.error(`소스 ID ${source.id}에 대한 로그를 찾을 수 없습니다.`);
        continue;
      }

      try {
        console.log(`[${source.name}] 수집 시작...`);

        // started_at 업데이트
        await db.update(CollectionLogs).set({ startedAt: new Date() }).where(eq(CollectionLogs.id, logId));

        // CrawlerConfig 파싱
        const config = source.config as unknown as CrawlerConfig;

        // Crawler 생성 및 기사 목록 가져오기
        const crawler = new Crawler(source.baseUrl, config);
        const newsItems = await crawler.list();

        console.log(`[${source.name}] ${newsItems.length}개의 기사를 발견했습니다.`);

        // 5. Articles에 등록 (URL 중복 방지)
        let successCount = 0;
        let duplicateCount = 0;

        for (const item of newsItems) {
          try {
            // URL 중복 체크
            const existingArticle = await db.select().from(Articles).where(eq(Articles.url, item.url)).limit(1);

            if (existingArticle.length > 0) {
              duplicateCount++;
              continue;
            }

            // 새 기사 등록
            await db.insert(Articles).values({
              sourceId: source.id,
              collectionLogId: logId,
              title: item.title,
              url: item.url,
            });

            successCount++;
          } catch (error) {
            // 개별 기사 등록 실패는 로깅하고 계속 진행
            console.warn(
              `[${source.name}] 기사 등록 실패 (${item.url}):`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }

        console.log(`[${source.name}] 수집 완료: ${successCount}개 등록, ${duplicateCount}개 중복`);

        // 6. collection_logs 업데이트 (성공)
        await db
          .update(CollectionLogs)
          .set({
            completedAt: new Date(),
            status: "success",
          })
          .where(eq(CollectionLogs.id, logId));

        results.push({
          sourceId: source.id,
          sourceName: source.name,
          articlesCollected: successCount,
          status: "success",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[${source.name}] 수집 실패:`, errorMessage);

        // 6. collection_logs 업데이트 (실패)
        await db
          .update(CollectionLogs)
          .set({
            completedAt: new Date(),
            status: "failed",
            errorMessage,
          })
          .where(eq(CollectionLogs.id, logId));

        results.push({
          sourceId: source.id,
          sourceName: source.name,
          articlesCollected: 0,
          status: "failed",
          errorMessage,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("뉴스 수집 중 치명적인 오류 발생:", error);
    throw error;
  }
}
