import { APIEvent } from '@solidjs/start/server';
import { createYoga } from 'graphql-yoga';
import { schema } from '~/graphql/schema';

/**
 * GraphQL Yoga 인스턴스 생성
 */
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  landingPage: true,
});

/**
 * GraphQL 엔드포인트 핸들러
 */
export async function GET(event: APIEvent) {
  const response = await yoga.handleRequest(event.request, {});
  return response;
}

export async function POST(event: APIEvent) {
  const response = await yoga.handleRequest(event.request, {});
  return response;
}

export async function OPTIONS(event: APIEvent) {
  const response = await yoga.handleRequest(event.request, {});
  return response;
}
