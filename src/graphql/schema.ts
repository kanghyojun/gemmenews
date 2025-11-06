import { builder } from './builder';

// Types import
import './types/collectionResult';
import './types/collectionLog';

// Queries import
import './queries/collectionLogs';

// Mutations import
import './mutations/collectNews';

/**
 * GraphQL 스키마 빌드
 *
 * 모든 타입, 쿼리, 뮤테이션을 포함한 최종 스키마
 */
export const schema = builder.toSchema();
