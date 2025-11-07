import { builder } from '../builder';

/**
 * CollectionLog 타입 정의
 */
interface CollectionLogType {
  id: number;
  sourceId: number | null;
  startedAt: Date;
  completedAt: Date | null;
  status: string;
  articlesCollected: number;
  errorMessage: string | null;
  createdAt: Date;
}

/**
 * CollectionLog - 수집 로그 타입
 */
export const CollectionLog = builder.objectRef<CollectionLogType>('CollectionLog');

CollectionLog.implement({
  description: '뉴스 수집 로그',
  fields: (t) => ({
    id: t.exposeInt('id', {
      description: '로그 ID',
    }),
    sourceId: t.int({
      description: '뉴스 소스 ID (null이면 전체 수집)',
      nullable: true,
      resolve: (log) => log.sourceId,
    }),
    startedAt: t.field({
      type: 'String',
      description: '수집 시작 시간',
      resolve: (log) => log.startedAt.toISOString(),
    }),
    completedAt: t.field({
      type: 'String',
      description: '수집 완료 시간',
      nullable: true,
      resolve: (log) => log.completedAt?.toISOString() ?? null,
    }),
    status: t.exposeString('status', {
      description: '수집 상태 (in_progress, success, failed)',
    }),
    articlesCollected: t.exposeInt('articlesCollected', {
      description: '수집된 기사 수',
    }),
    errorMessage: t.exposeString('errorMessage', {
      description: '에러 메시지',
      nullable: true,
    }),
  }),
});
