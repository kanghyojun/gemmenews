import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { collectNews, CollectionResult } from './collect-news';
import { db } from '../api/db';
import { Crawler } from './crawl';

// Mocking
vi.mock('../api/db');
vi.mock('./crawl');

describe('collectNews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('활성화된 뉴스 소스가 없으면 빈 배열을 반환한다', async () => {
    // Given: 활성화된 소스가 없음
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    } as any);

    // When
    const results = await collectNews();

    // Then
    expect(results).toEqual([]);
  });

  it('오늘 이미 수집된 소스는 건너뛴다', async () => {
    // Given: 활성화된 소스 2개, 그 중 1개는 오늘 이미 수집됨
    const mockSources = [
      {
        id: 1,
        name: 'Test Source 1',
        code: 'test1',
        baseUrl: 'https://test1.com',
        config: {
          itemSelector: 'tr.athing',
          itemRelations: {
            title: 'find(.titleline).text()',
            url: 'find(.titleline a).attr(href)',
          },
          contentSelector: '.content',
        },
        isActive: true,
      },
      {
        id: 2,
        name: 'Test Source 2',
        code: 'test2',
        baseUrl: 'https://test2.com',
        config: {
          itemSelector: 'article',
          itemRelations: {
            title: 'find(h2).text()',
            url: 'find(a).attr(href)',
          },
          contentSelector: '.body',
        },
        isActive: true,
      },
    ];

    const mockTodayLogs = [
      {
        id: 1,
        sourceId: 1,
        startedAt: new Date(),
        status: 'in_progress',
      },
    ];

    let selectCallCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // Get active sources
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockSources),
          }),
        } as any;
      } else if (selectCallCount === 2) {
        // Check today's logs
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockTodayLogs),
          }),
        } as any;
      } else {
        // Check for duplicate URLs (no duplicates)
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      }
    });

    // Mock insert for collection logs
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 2,
            sourceId: 2,
            startedAt: new Date(),
            status: 'in_progress',
            articlesCollected: 0,
          },
        ]),
      }),
    } as any);

    // Mock update
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as any);

    // Mock crawler
    const mockList = vi.fn().mockResolvedValue([
      { url: 'https://test2.com/article1', title: 'Test Article 1' },
    ]);

    vi.mocked(Crawler).mockImplementation(
      function (this: any, _url: string, _config: any) {
        this.list = mockList;
        return this;
      } as any
    );

    // When
    const results = await collectNews();

    // Then
    expect(results).toHaveLength(1);
    expect(results[0].sourceId).toBe(2);
    expect(results[0].sourceName).toBe('Test Source 2');
    expect(results[0].status).toBe('success');
  });

  it('크롤링 성공 시 기사를 저장하고 로그를 업데이트한다', async () => {
    // Given
    const mockSource = {
      id: 1,
      name: 'Test Source',
      code: 'test',
      baseUrl: 'https://test.com',
      config: {
        itemSelector: 'tr',
        itemRelations: {
          title: 'find(.title).text()',
          url: 'find(a).attr(href)',
        },
        contentSelector: '.content',
      },
      isActive: true,
    };

    let selectCallCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // Get active sources
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockSource]),
          }),
        } as any;
      } else if (selectCallCount === 2) {
        // Check today's logs (no logs)
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any;
      } else {
        // Check for duplicate URLs (no duplicates)
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      }
    });

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            sourceId: 1,
            startedAt: new Date(),
            status: 'in_progress',
            articlesCollected: 0,
          },
        ]),
      }),
    } as any);

    const mockList = vi.fn().mockResolvedValue([
      { url: 'https://test.com/article1', title: 'Article 1' },
      { url: 'https://test.com/article2', title: 'Article 2' },
    ]);

    vi.mocked(Crawler).mockImplementation(
      function (this: any, _url: string, _config: any) {
        this.list = mockList;
        return this;
      } as any
    );

    const mockUpdate = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    vi.mocked(db.update).mockReturnValue({
      set: mockUpdate,
    } as any);

    // When
    const results = await collectNews();

    // Then
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      sourceId: 1,
      sourceName: 'Test Source',
      articlesCollected: 2,
      status: 'success',
    });
  });

  it('URL 중복 시 기사를 건너뛴다', async () => {
    // Given
    const mockSource = {
      id: 1,
      name: 'Test Source',
      code: 'test',
      baseUrl: 'https://test.com',
      config: {
        itemSelector: 'tr',
        itemRelations: {
          title: 'find(.title).text()',
          url: 'find(a).attr(href)',
        },
        contentSelector: '.content',
      },
      isActive: true,
    };

    let selectCallCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // Get active sources
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockSource]),
          }),
        } as any;
      } else if (selectCallCount === 2) {
        // Check today's logs
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any;
      } else if (selectCallCount === 3) {
        // First URL check - duplicate
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue([{ id: 100, url: 'https://test.com/article1' }]),
            }),
          }),
        } as any;
      } else {
        // Second URL check - not duplicate
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      }
    });

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            sourceId: 1,
            startedAt: new Date(),
            status: 'in_progress',
            articlesCollected: 0,
          },
        ]),
      }),
    } as any);

    const mockList = vi.fn().mockResolvedValue([
      { url: 'https://test.com/article1', title: 'Duplicate Article' },
      { url: 'https://test.com/article2', title: 'New Article' },
    ]);

    vi.mocked(Crawler).mockImplementation(
      function (this: any, _url: string, _config: any) {
        this.list = mockList;
        return this;
      } as any
    );

    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as any);

    // When
    const results = await collectNews();

    // Then
    expect(results).toHaveLength(1);
    expect(results[0].articlesCollected).toBe(1); // Only one new article
  });

  it('크롤링 실패 시 에러를 로그에 기록한다', async () => {
    // Given
    const mockSource = {
      id: 1,
      name: 'Test Source',
      code: 'test',
      baseUrl: 'https://test.com',
      config: {
        itemSelector: 'tr',
        itemRelations: {
          title: 'find(.title).text()',
          url: 'find(a).attr(href)',
        },
        contentSelector: '.content',
      },
      isActive: true,
    };

    let selectCallCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockSource]),
          }),
        } as any;
      } else {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any;
      }
    });

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            sourceId: 1,
            startedAt: new Date(),
            status: 'in_progress',
            articlesCollected: 0,
          },
        ]),
      }),
    } as any);

    const mockList = vi.fn().mockRejectedValue(new Error('Network error'));

    vi.mocked(Crawler).mockImplementation(
      function (this: any, _url: string, _config: any) {
        this.list = mockList;
        return this;
      } as any
    );

    const mockSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    vi.mocked(db.update).mockReturnValue({
      set: mockSet,
    } as any);

    // When
    const results = await collectNews();

    // Then
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      sourceId: 1,
      sourceName: 'Test Source',
      articlesCollected: 0,
      status: 'failed',
      errorMessage: 'Network error',
    });
  });
});
