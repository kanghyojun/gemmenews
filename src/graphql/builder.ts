import SchemaBuilder from '@pothos/core';
import DrizzlePlugin from '@pothos/plugin-drizzle';
import { db } from '../lib/db';
import { getTableConfig } from 'drizzle-orm/pg-core';

export const builder = new SchemaBuilder<{
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [DrizzlePlugin],
  drizzle: {
    client: db,
    getTableConfig,
  },
});

builder.scalarType('DateTime', {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    if (value instanceof Date) {
      return value;
    }
    throw new Error('DateTime must be a Date object or ISO string');
  },
});

builder.queryType({
  description: 'Root Query',
});

builder.mutationType({
  description: 'Root Mutation',
});
