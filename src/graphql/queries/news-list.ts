import { builder } from '../builder';
import { NewsItem } from '../types/news-item';
import { NewsSource } from '../types/news-source';
import { Articles, NewsSources } from '@/schema';
import { db } from '~/lib/db';
import { eq, and, gte, lte, desc, SQL } from 'drizzle-orm';

/**
 * newsList - 뉴스 목록 조회
 */
builder.queryField('newsList', (t) =>
  t.field({
    type: [NewsItem],
    description: '뉴스 목록을 조회합니다. 기본적으로 읽지 않은 뉴스만 반환합니다.',
    args: {
      isRead: t.arg.boolean({
        required: false,
        description: '읽음 여부 필터 (기본값: false)',
      }),
      source: t.arg({
        type: NewsSource,
        required: false,
        description: '뉴스 소스 필터',
      }),
      fromDate: t.arg.string({
        required: false,
        description: '시작 날짜 (ISO 8601 형식)',
      }),
      toDate: t.arg.string({
        required: false,
        description: '종료 날짜 (ISO 8601 형식)',
      }),
      limit: t.arg.int({
        required: false,
        defaultValue: 20,
        description: '조회할 뉴스 수 (기본값: 20)',
      }),
      offset: t.arg.int({
        required: false,
        defaultValue: 0,
        description: '건너뛸 뉴스 수 (기본값: 0)',
      }),
    },
    resolve: async (parent, args) => {
      // 필터 조건 배열
      const conditions: SQL[] = [];

      // isRead 필터 (기본값: false)
      const isReadFilter = args.isRead ?? false;
      conditions.push(eq(Articles.isRead, isReadFilter));

      // source 필터
      if (args.source) {
        const sourceRecord = await db
          .select()
          .from(NewsSources)
          .where(eq(NewsSources.code, args.source))
          .limit(1)
          .execute();

        if (sourceRecord.length > 0) {
          conditions.push(eq(Articles.sourceId, sourceRecord[0].id));
        } else {
          // 소스를 찾을 수 없으면 빈 배열 반환
          return [];
        }
      }

      // fromDate 필터
      if (args.fromDate) {
        const fromDate = new Date(args.fromDate);
        conditions.push(gte(Articles.createdAt, fromDate));
      }

      // toDate 필터
      if (args.toDate) {
        const toDate = new Date(args.toDate);
        conditions.push(lte(Articles.createdAt, toDate));
      }

      // 쿼리 실행
      const articles = await db
        .select({
          id: Articles.id,
          title: Articles.title,
          url: Articles.url,
          content: Articles.content,
          isRead: Articles.isRead,
          createdAt: Articles.createdAt,
          sourceCode: NewsSources.code,
        })
        .from(Articles)
        .innerJoin(NewsSources, eq(Articles.sourceId, NewsSources.id))
        .where(and(...conditions))
        .orderBy(desc(Articles.createdAt))
        .limit(args.limit ?? 20)
        .offset(args.offset ?? 0)
        .execute();

      // 결과를 NewsItem 타입으로 변환
      return articles.map((article) => ({
        id: article.id,
        title: article.title,
        source: article.sourceCode,
        url: article.url,
        content: article.content,
        collectedAt: article.createdAt,
        isRead: article.isRead,
      }));
    },
  })
);
