import { builder } from '../builder';
import { NewsSource } from './news-source';

/**
 * NewsItem 타입 정의
 */
interface NewsItemType {
  id: number;
  title: string;
  source: string; // NewsSource enum 값 (예: 'hackernews')
  url: string;
  content: string | null;
  collectedAt: Date;
  isRead: boolean;
}

/**
 * NewsItem - 뉴스 항목 타입
 */
export const NewsItem = builder.objectRef<NewsItemType>('NewsItem');

NewsItem.implement({
  description: '뉴스 항목',
  fields: (t) => ({
    id: t.exposeID('id', {
      description: '뉴스 ID',
    }),
    title: t.exposeString('title', {
      description: '뉴스 제목',
    }),
    source: t.field({
      type: NewsSource,
      description: '뉴스 소스',
      resolve: (newsItem) => newsItem.source as 'hackernews' | 'geeknews' | 'naver_economy',
    }),
    url: t.exposeString('url', {
      description: '뉴스 URL',
    }),
    content: t.exposeString('content', {
      description: '뉴스 본문',
      nullable: true,
    }),
    collectedAt: t.field({
      type: 'String',
      description: '수집 시간',
      resolve: (newsItem) => newsItem.collectedAt.toISOString(),
    }),
    isRead: t.exposeBoolean('isRead', {
      description: '읽음 여부',
    }),
  }),
});
