import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const Users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().default(''),
  password: text('password').notNull().default(''),
});

// 뉴스 소스 정보
export const NewsSources = pgTable('news_sources', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // 예: "Hacker News"
  code: text('code').notNull().unique(), // 예: "hackernews"
  baseUrl: text('base_url').notNull(), // 예: "https://news.ycombinator.com/"
  // CSS 선택자 및 기타 설정을 JSON으로 저장
  config: jsonb('config').notNull(), // { listPageSelector: {...}, detailPageSelector: {...} }
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 수집된 기사
export const Articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id')
    .notNull()
    .references(() => NewsSources.id),
  collectionLogId: integer('collection_log_id')
    .notNull()
    .references(() => CollectionLogs.id),
  title: text('title').notNull(),
  url: text('url').notNull().unique(), // 중복 방지
  content: text('content'), // 본문 내용
  isRead: boolean('is_read').notNull().default(false), // 읽음 여부
  originalPublishedAt: timestamp('original_published_at', {
    withTimezone: true,
  }), // 원본 게시일 (옵션)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 수집 로그
export const CollectionLogs = pgTable('collection_logs', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => NewsSources.id), // null이면 전체 수집
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: text('status').notNull().default('in_progress'), // in_progress, success, failed
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
