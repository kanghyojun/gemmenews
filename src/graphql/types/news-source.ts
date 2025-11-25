import { builder } from '../builder';

/**
 * NewsSource - 뉴스 소스 Enum
 */
export const NewsSource = builder.enumType('NewsSource', {
  description: '뉴스 소스',
  values: {
    HACKER_NEWS: {
      value: 'hackernews',
      description: 'Hacker News',
    },
    GEEK_NEWS: {
      value: 'geeknews',
      description: 'Geek News',
    },
    NAVER_ECONOMY: {
      value: 'naver_economy',
      description: 'Naver Economy',
    },
  } as const,
});
