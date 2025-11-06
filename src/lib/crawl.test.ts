import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Crawler } from './crawl';
import type { CrawlerConfig } from './crawl';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('Crawler', () => {
  let crawler: Crawler;
  const mockConfig: CrawlerConfig = {
    url: 'https://example.com/news',
    titleSelector: '.news-title',
    linkSelector: '.news-link',
    contentSelector: '.news-content',
  };

  beforeEach(() => {
    crawler = new Crawler(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a crawler instance with the given config', () => {
      expect(crawler).toBeInstanceOf(Crawler);
    });

    it('should accept all required config fields', () => {
      const config: CrawlerConfig = {
        url: 'https://news.ycombinator.com/news',
        titleSelector: '#bigbox > td > table > tbody > tr > td.title',
        linkSelector: '#bigbox > td > table > tbody > tr td.subtext span.subline a:last-child',
        contentSelector: 'div.toptext',
      };

      const testCrawler = new Crawler(config);
      expect(testCrawler).toBeInstanceOf(Crawler);
    });
  });

  describe('list', () => {
    it('should return an array of news items with url and title', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="news-title">Title 1</div>
            <a class="news-link" href="https://example.com/article1">Link 1</a>
            <div class="news-title">Title 2</div>
            <a class="news-link" href="https://example.com/article2">Link 2</a>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      const result = await crawler.list();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        url: 'https://example.com/article1',
        title: 'Title 1',
      });
      expect(result[1]).toEqual({
        url: 'https://example.com/article2',
        title: 'Title 2',
      });
    });

    it('should convert relative URLs to absolute URLs', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="news-title">Title 1</div>
            <a class="news-link" href="/article1">Link 1</a>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      const result = await crawler.list();

      expect(result[0].url).toBe('https://example.com/article1');
    });

    it('should handle URLs without http prefix', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="news-title">Title 1</div>
            <a class="news-link" href="article1">Link 1</a>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      const result = await crawler.list();

      expect(result[0].url).toBe('https://example.com/article1');
    });

    it('should throw an error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(crawler.list()).rejects.toThrow('Failed to crawl list');
    });

    it('should return empty array when no items match selectors', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="other-content">No news here</div>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      const result = await crawler.list();

      expect(result).toHaveLength(0);
    });

    it('should skip items with missing title or url', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="news-title">Title 1</div>
            <a class="news-link" href="https://example.com/article1">Link 1</a>
            <div class="news-title"></div>
            <a class="news-link" href="https://example.com/article2">Link 2</a>
            <div class="news-title">Title 3</div>
            <a class="news-link">Link 3</a>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      const result = await crawler.list();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Title 1');
    });
  });

  describe('getContent', () => {
    it('should return the content text from the given URL', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="news-content">This is the article content.</div>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      const result = await crawler.getContent('https://example.com/article1');

      expect(result).toBe('This is the article content.');
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/article1');
    });

    it('should trim whitespace from content', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="news-content">

              This is content with whitespace.

            </div>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      const result = await crawler.getContent('https://example.com/article1');

      expect(result).toBe('This is content with whitespace.');
    });

    it('should throw an error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(crawler.getContent('https://example.com/article1')).rejects.toThrow(
        'Failed to get content'
      );
    });

    it('should throw an error when content is not found', async () => {
      const mockHtml = `
        <html>
          <body>
            <div class="other-content">No news content here</div>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockHtml,
      });

      await expect(crawler.getContent('https://example.com/article1')).rejects.toThrow(
        'Content not found with the given selector'
      );
    });
  });
});
