import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables (.env.local overrides .env)
config({ path: ['.env.local', '.env'] });

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations/",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
