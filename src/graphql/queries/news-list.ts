import { builder } from '../builder';
import { NewsItemType } from '../types/news-item';
import { NewsSourceEnum } from '../types/news-source';
import { db } from '~/lib/db';
import { Articles, NewsSources } from '@/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

builder.queryField('newsList', (t) =>
  t.field({
    type: [NewsItemType],
    description: '뉴스 목록 조회',
    args: {
      isRead: t.arg.boolean({
        required: false,
        description: '읽음 여부 필터 (null이면 전체)',
      }),
      source: t.arg({
        type: NewsSourceEnum,
        required: false,
        description: '뉴스 소스 필터',
      }),
      fromDateTime: t.arg({
        type: 'DateTime',
        required: false,
        description: '시작 일시',
      }),
      toDateTime: t.arg({
        type: 'DateTime',
        required: false,
        description: '종료 일시',
      }),
      limit: t.arg.int({
        required: false,
        defaultValue: 20,
        description: '조회 개수 (기본값: 20)',
      }),
      offset: t.arg.int({
        required: false,
        defaultValue: 0,
        description: '시작 위치 (기본값: 0)',
      }),
    },
    resolve: async (_parent, args) => {
      const conditions = [];

      if (args.isRead !== null && args.isRead !== undefined) {
        conditions.push(eq(Articles.isRead, args.isRead));
      }

      if (args.source) {
        const sourceResult = await db
          .select({ id: NewsSources.id })
          .from(NewsSources)
          .where(eq(NewsSources.code, args.source))
          .limit(1);

        if (sourceResult.length > 0) {
          conditions.push(eq(Articles.sourceId, sourceResult[0].id));
        } else {
          return [];
        }
      }

      if (args.fromDateTime) {
        conditions.push(gte(Articles.createdAt, args.fromDateTime as Date));
      }

      if (args.toDateTime) {
        conditions.push(lte(Articles.createdAt, args.toDateTime as Date));
      }

      const query = db
        .select({
          id: Articles.id,
          title: Articles.title,
          sourceId: Articles.sourceId,
          url: Articles.url,
          content: Articles.content,
          collectedAtDateTime: Articles.createdAt,
          isRead: Articles.isRead,
        })
        .from(Articles)
        .$dynamic();

      let queryWithConditions = query;
      if (conditions.length > 0) {
        queryWithConditions = query.where(and(...conditions));
      }

      const articles = await queryWithConditions
        .orderBy(desc(Articles.createdAt))
        .limit(args.limit ?? 20)
        .offset(args.offset ?? 0);

      const sourceIds = [...new Set(articles.map((a) => a.sourceId))];
      const sources = await db
        .select({
          id: NewsSources.id,
          code: NewsSources.code,
        })
        .from(NewsSources)
        .where(
          sql`${NewsSources.id} IN (${sql.join(
            sourceIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );

      const sourceMap = new Map(sources.map((s) => [s.id, s.code]));

      return articles.map((article) => ({
        id: article.id,
        title: article.title,
        source: (sourceMap.get(article.sourceId) ?? 'hackernews') as 'hackernews' | 'geeknews' | 'naver_economy',
        url: article.url,
        content: article.content,
        collectedAtDateTime: article.collectedAtDateTime,
        isRead: article.isRead,
      }));
    },
  })
);
