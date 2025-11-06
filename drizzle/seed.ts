import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { NewsSources } from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema: { NewsSources } });

async function seed() {
  console.log('🌱 Seeding news sources...');

  const newsSources = [
    {
      name: 'Hacker News',
      code: 'hackernews',
      baseUrl: 'https://news.ycombinator.com/',
      config: {
        listPageSelector: {
          itemSelector: '.athing',
          titleSelector: '.titleline > a',
          urlSelector: '.titleline > a',
        },
        maxArticles: 30,
      },
      isActive: true,
    },
    {
      name: 'Geek News',
      code: 'geeknews',
      baseUrl: 'https://news.hada.io/',
      config: {
        listPageSelector: {
          itemSelector: '.topic_list > .topic_row',
          titleSelector: '.topictitle',
          urlSelector: '.topictitle',
        },
        maxArticles: 30,
      },
      isActive: true,
    },
    {
      name: '네이버 뉴스 경제',
      code: 'naver_economy',
      baseUrl: 'https://news.naver.com/section/101',
      config: {
        listPageSelector: {
          itemSelector: '.sa_item._SECTION_HEADLINE',
          titleSelector: '.sa_text_strong',
          urlSelector: '.sa_text_strong',
        },
        maxArticles: 30,
      },
      isActive: true,
    },
  ];

  try {
    for (const source of newsSources) {
      const existing = await db.select()
        .from(NewsSources)
        .where((fields) => fields.code === source.code)
        .execute();

      if (existing.length === 0) {
        await db.insert(NewsSources).values(source).execute();
        console.log(`✅ Added: ${source.name}`);
      } else {
        console.log(`⏭️  Skipped (already exists): ${source.name}`);
      }
    }

    console.log('✨ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
