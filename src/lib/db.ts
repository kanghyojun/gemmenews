import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/schema';
import { config } from 'dotenv';

// Load environment variables (.env.local overrides .env)
if (!process.env.DATABASE_URL) {
  config({ path: ['.env.local', '.env'] });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
