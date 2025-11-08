import SchemaBuilder from '@pothos/core';
import DrizzlePlugin from '@pothos/plugin-drizzle';
import { db } from '../lib/db';
import { getTableConfig } from 'drizzle-orm/pg-core';

/**
 * Pothos Schema Builder 설정
 *
 * GraphQL 스키마를 type-safe하게 구축하기 위한 builder
 */
export const builder = new SchemaBuilder({
  plugins: [DrizzlePlugin],
  drizzle: {
    client: db,
    getTableConfig,
  },
});

// 기본 Query와 Mutation 타입 정의
builder.queryType({
  description: 'Root Query',
});

builder.mutationType({
  description: 'Root Mutation',
});
