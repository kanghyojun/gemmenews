import { builder } from '../builder';
import { CollectionLog } from '../types/collection-log';
import { CollectionLogs } from '@/schema';
import { db } from '~/api/db';
import { eq, desc } from 'drizzle-orm';

/**
 * collectionLog - 특정 수집 로그 조회
 */
builder.queryField('collectionLog', (t) =>
  t.field({
    type: CollectionLog,
    nullable: true,
    description: 'ID로 특정 수집 로그를 조회합니다.',
    args: {
      id: t.arg.int({
        required: true,
        description: '수집 로그 ID',
      }),
    },
    resolve: async (parent, args) => {
      const [log] = await db
        .select()
        .from(CollectionLogs)
        .where(eq(CollectionLogs.id, args.id))
        .execute();

      return log ?? null;
    },
  })
);

/**
 * collectionLogs - 수집 로그 목록 조회
 */
builder.queryField('collectionLogs', (t) =>
  t.field({
    type: [CollectionLog],
    description: '최근 수집 로그 목록을 조회합니다.',
    args: {
      limit: t.arg.int({
        required: false,
        defaultValue: 10,
        description: '조회할 로그 수 (기본값: 10)',
      }),
      sourceId: t.arg.int({
        required: false,
        description: '특정 소스의 로그만 조회 (선택사항)',
      }),
    },
    resolve: async (parent, args) => {
      let query = db.select().from(CollectionLogs);

      // 특정 소스 필터링
      if (args.sourceId !== undefined && args.sourceId !== null) {
        query = query.where(eq(CollectionLogs.sourceId, args.sourceId)) as typeof query;
      }

      // 최신순 정렬 및 제한
      const logs = await query
        .orderBy(desc(CollectionLogs.createdAt))
        .limit(args.limit ?? 10)
        .execute();

      return logs;
    },
  })
);

/**
 * latestCollectionLog - 가장 최근 수집 로그 조회
 */
builder.queryField('latestCollectionLog', (t) =>
  t.field({
    type: CollectionLog,
    nullable: true,
    description: '가장 최근의 전체 수집 로그를 조회합니다 (sourceId가 null인 것).',
    resolve: async () => {
      const [log] = await db
        .select()
        .from(CollectionLogs)
        .where(eq(CollectionLogs.sourceId, null))
        .orderBy(desc(CollectionLogs.createdAt))
        .limit(1)
        .execute();

      return log ?? null;
    },
  })
);
