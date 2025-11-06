# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

This is a news aggregation system built with SolidStart that crawls and collects articles from multiple news sources. It features a web crawler for extracting content, PostgreSQL database storage via Drizzle ORM, and a SolidJS frontend with session-based authentication.

## Before Starting Work

**Important**: Always sync the git submodule before starting work:

```bash
git submodule update --init --recursive
```

This ensures you have the latest product documentation from `product-docs/` submodule (gemmenews-docs repository).

## Essential Commands

### Development
- `pnpm dev` - Start development server (uses Vinxi)
- `pnpm build` - Build for production
- `pnpm start` - Run production build

### Testing
- `pnpm test` - Run tests in watch mode
- `pnpm test:ui` - Run tests with UI
- `pnpm test:run` - Run tests once (CI mode)

### Linting
- `pnpm lint` - Check code for linting errors
- `pnpm lint:fix` - Automatically fix linting errors

**Important**: Before committing code, always run `pnpm lint` to ensure code passes all linting checks. All code must pass linting without errors.

### Type Checking
- `pnpm typecheck` - Run TypeScript type checking

**Important**: Before committing code, always run `pnpm typecheck` to ensure there are no type errors. All code must pass type checking without errors.

### Database Operations
- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Apply migrations to database
- `pnpm db:push` - Push schema changes directly to database (dev only)
- `pnpm db:studio` - Open Drizzle Studio to inspect database

**Important**: After modifying `drizzle/schema.ts`, run `pnpm db:generate` to create migrations, then `pnpm db:push` or `pnpm db:migrate` to apply them.

## Architecture

### Tech Stack
- **Frontend**: SolidJS + SolidStart (file-based routing)
- **Backend**: Vinxi server with "use server" directives
- **Database**: PostgreSQL with Drizzle ORM
- **Web Crawler**: Cheerio for HTML parsing
- **Testing**: Vitest with happy-dom
- **Linting**: ESLint with TypeScript and SolidJS plugins

### Directory Structure
```
src/
├── api/              # Server-side API logic
│   ├── db.ts         # Database connection (Drizzle + pg Pool)
│   ├── server.ts     # Auth logic ("use server" functions)
│   └── index.ts      # SolidStart query/action exports
├── lib/              # Shared utilities
│   └── crawl.ts      # Web crawler implementation
├── routes/           # File-based routes (SolidStart convention)
└── app.tsx           # Root application component

drizzle/
├── schema.ts         # Database schema definitions
├── schema.test.ts    # Schema object tests
└── migrations/       # Generated migration files
```

### Database Schema

The system uses 4 main tables:

1. **Users**: Authentication (id, username, password)
2. **NewsSources**: News source configurations
   - Stores CSS selectors and crawling config in JSONB field
   - `code` field is unique identifier (e.g., "hackernews")
3. **Articles**: Collected articles with deduplication via unique URL
4. **CollectionLogs**: Audit trail for collection runs

### Key Architectural Patterns

**Server Functions**: Server-side logic uses `"use server"` directive and is exposed via SolidStart's `query()` and `action()` functions in `src/api/index.ts`.

**Database Access**: All database operations use Drizzle ORM. The db instance is initialized in `src/api/db.ts` with the full schema imported.

**Web Crawler**: The `Crawler` class in `src/lib/crawl.ts` accepts a `CrawlerConfig` with CSS selectors to extract:
- List page: titles and links
- Detail page: article content

This design allows adding new news sources by configuring selectors without code changes.

**Authentication**: Session-based auth using Vinxi's `useSession()`. Sessions stored with userId. Protected routes redirect to `/login` if unauthenticated.

## Environment Setup

1. Copy `.env.sample` to `.env`
2. Set `DATABASE_URL` to your PostgreSQL connection string
3. Run `pnpm db:push` to create tables
4. Optional: Set `SESSION_SECRET` for production

## Development Notes

- Node.js >= 20 required
- Package manager: pnpm (lockfile committed to git)
- Drizzle ORM uses `drizzle-orm/node-postgres` dialect
  - Note: PostgreSQL queries return arrays, not single objects
  - Use `await db.select()...` and access first element with `[0]`
  - Do NOT use `.get()` method (not available in PostgreSQL dialect)
- Test environment uses `happy-dom` for DOM simulation
- Path aliases: `~` for `src/`, `@` for `drizzle/` (configured in vitest.config.ts)
- TypeScript: `skipLibCheck: true` to avoid external library type errors
