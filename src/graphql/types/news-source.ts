import { builder } from '../builder';

export const NewsSourceEnum = builder.enumType('NewsSource', {
  values: {
    HACKER_NEWS: { value: 'hackernews' },
    GEEK_NEWS: { value: 'geeknews' },
    NAVER_ECONOMY: { value: 'naver_economy' },
  } as const,
  description: '뉴스 소스',
});
