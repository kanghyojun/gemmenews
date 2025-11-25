import { builder } from '../builder';
import { NewsSourceEnum } from './news-source';

export const NewsItemType = builder.objectRef<{
  id: number;
  title: string;
  source: 'hackernews' | 'geeknews' | 'naver_economy';
  url: string;
  content: string | null;
  collectedAtDateTime: Date;
  isRead: boolean;
}>('NewsItem');

NewsItemType.implement({
  description: '뉴스 기사 항목',
  fields: (t) => ({
    id: t.exposeID('id', {
      description: '기사 ID',
    }),
    title: t.exposeString('title', {
      description: '기사 제목',
    }),
    source: t.field({
      type: NewsSourceEnum,
      description: '뉴스 소스',
      resolve: (parent) => parent.source,
    }),
    url: t.exposeString('url', {
      description: '기사 URL',
    }),
    content: t.string({
      nullable: true,
      description: '기사 본문',
      resolve: (parent) => parent.content,
    }),
    collectedAtDateTime: t.field({
      type: 'DateTime',
      description: '수집 일시',
      resolve: (parent) => parent.collectedAtDateTime,
    }),
    isRead: t.exposeBoolean('isRead', {
      description: '읽음 여부',
    }),
  }),
});
