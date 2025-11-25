import { builder } from './builder';

// Types import
import './types/collection-result';
import './types/collection-log';
import './types/news-source';
import './types/news-item';

// Queries import
import './queries/collection-logs';
import './queries/news-list';

// Mutations import
import './mutations/collect-news';

/**
 * GraphQL 스키마 빌드
 *
 * 모든 타입, 쿼리, 뮤테이션을 포함한 최종 스키마
 */
export const schema = builder.toSchema();
