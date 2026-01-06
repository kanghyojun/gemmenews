-- Seed Daum News Economy section
-- User Story US-1.2: 다음 뉴스 경제면 수집

-- 다음 뉴스 경제
INSERT INTO "news_sources" ("name", "code", "base_url", "config", "is_active")
VALUES (
  '다음 뉴스 경제',
  'daum_economy',
  'https://news.daum.net/economy',
  '{
    "itemSelector": "ul.list_news2 li",
    "itemRelations": {
      "title": "find(a.link_txt).text()",
      "url": "find(a.link_txt).attr(href)"
    },
    "contentSelector": "div.article_view"
  }'::jsonb,
  true
)
ON CONFLICT (code) DO NOTHING;
