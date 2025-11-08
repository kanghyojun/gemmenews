import { builder } from '../builder';

/**
 * SourceCollectionResult - 개별 소스의 수집 결과
 */
export const SourceCollectionResult = builder.objectRef<{
  sourceName: string;
  articles: number;
  success: boolean;
  error?: string | null;
}>('SourceCollectionResult');

SourceCollectionResult.implement({
  description: '개별 뉴스 소스의 수집 결과',
  fields: (t) => ({
    sourceName: t.exposeString('sourceName', {
      description: '뉴스 소스 이름',
    }),
    articles: t.exposeInt('articles', {
      description: '수집된 기사 수',
    }),
    success: t.exposeBoolean('success', {
      description: '수집 성공 여부',
    }),
    error: t.exposeString('error', {
      description: '에러 메시지 (실패한 경우)',
      nullable: true,
    }),
  }),
});

/**
 * CollectionResult - 전체 수집 결과
 */
export const CollectionResult = builder.objectRef<{
  success: boolean;
  totalArticles: number;
  sources: Array<{
    sourceName: string;
    articles: number;
    success: boolean;
    error?: string | null;
  }>;
  logId: number;
  timestamp: string;
}>('CollectionResult');

CollectionResult.implement({
  description: '뉴스 수집 전체 결과',
  fields: (t) => ({
    success: t.exposeBoolean('success', {
      description: '전체 수집 성공 여부',
    }),
    totalArticles: t.exposeInt('totalArticles', {
      description: '총 수집된 기사 수',
    }),
    sources: t.field({
      type: [SourceCollectionResult],
      description: '각 소스별 수집 결과',
      resolve: (parent) => parent.sources,
    }),
    logId: t.exposeInt('logId', {
      description: '수집 로그 ID',
    }),
    timestamp: t.exposeString('timestamp', {
      description: '수집 완료 시간 (ISO 8601)',
    }),
  }),
});
