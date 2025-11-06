-- Seed initial news sources from crawler spec

-- 해커뉴스
INSERT INTO "news_sources" ("name", "code", "base_url", "config", "is_active")
VALUES (
  'Hacker News',
  'hackernews',
  'https://news.ycombinator.com',
  '{
    "itemSelector": "tr.athing",
    "itemRelations": {
      "title": "find(span.titleline a).text()",
      "url": "next().find(span.subline a).last().attr(href)"
    },
    "contentSelector": "div.toptext"
  }'::jsonb,
  true
)
ON CONFLICT (code) DO NOTHING;

-- 긱뉴스
INSERT INTO "news_sources" ("name", "code", "base_url", "config", "is_active")
VALUES (
  '긱뉴스',
  'geeknews',
  'https://news.hada.io/',
  '{
    "itemSelector": "div.topic_row",
    "itemRelations": {
      "title": "find(h1).text()",
      "url": "find(div.topicinfo a.u).attr(href)"
    },
    "contentSelector": "#topc_contents"
  }'::jsonb,
  true
)
ON CONFLICT (code) DO NOTHING;

-- 네이버 경제
INSERT INTO "news_sources" ("name", "code", "base_url", "config", "is_active")
VALUES (
  '네이버 경제',
  'naver_economy',
  'https://news.naver.com/section/101',
  '{
    "itemSelector": "div.as_headline ul.sa_list",
    "itemRelations": {
      "title": "find(li strong).text()",
      "url": "find(li a.sa_text_title).attr(href)"
    },
    "contentSelector": "article#dic_area"
  }'::jsonb,
  true
)
ON CONFLICT (code) DO NOTHING;
