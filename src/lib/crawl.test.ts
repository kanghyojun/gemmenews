import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Crawler } from './crawl';
import type { CrawlerConfig } from './crawl';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// 실제 Hacker News HTML (2025-11-06 크롤링)
const MOCK_HN_LIST_HTML = `
<table>
<tr class="athing submission" id="45830829"><td align="right" valign="top" class="title"><span class="rank">1.</span></td><td valign="top" class="votelinks"><center><a id='up_45830829'><div class='votearrow' title='upvote'></div></a></center></td><td class="title"><span class="titleline"><a href="https://ratatui.rs/showcase/apps/">Ratatui – App Showcase</a></span></td></tr><tr><td colspan="2"></td><td class="subtext"><span class="subline"><span class="score" id="score_45830829">157 points</span> by <a href="user?id=AbuAssar" class="hnuser">AbuAssar</a> <span class="age"><a href="item?id=45830829">4 hours ago</a></span> | <a href="item?id=45830829">61 comments</a></span></td></tr>
<tr class="athing submission" id="45830770"><td align="right" valign="top" class="title"><span class="rank">3.</span></td><td valign="top" class="votelinks"><center><a id='up_45830770'><div class='votearrow' title='upvote'></div></a></center></td><td class="title"><span class="titleline"><a href="https://support.mozilla.org/en-US/forums/contributors/717446">End of Japanese community</a></span></td></tr><tr><td colspan="2"></td><td class="subtext"><span class="subline"><span class="score" id="score_45830770">415 points</span> by <a href="user?id=phantomathkg" class="hnuser">phantomathkg</a> <span class="age"><a href="item?id=45830770">4 hours ago</a></span> | <a href="item?id=45830770">246 comments</a></span></td></tr>
</table>
`;

const MOCK_HN_ITEM_HTML = `
<table class="fatitem"><tr><td colspan="2"></td><td><div class="toptext">hello world</div></td></tr></table>
<table class="comment-tree">
<tr class="athing comtr"><td><div class="comment"><div class="commtext">First comment text</div></div></td></tr>
<tr class="athing comtr"><td><div class="comment"><div class="commtext">Second comment text</div></div></td></tr>
</table>
`;

describe('Crawler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a crawler instance with url and config separated', () => {
      const crawler = new Crawler('https://example.com', {
        itemSelector: '.item',
        itemRelations: {
          title: 'find(.title).text()',
          url: 'find(.link).attr(href)',
        },
        contentSelector: '.content',
      });

      expect(crawler).toBeInstanceOf(Crawler);
    });
  });

  describe('list() - Hacker News real HTML', () => {
    it('should crawl HN with relation-based selectors (user specification)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => MOCK_HN_LIST_HTML,
      });

      const crawler = new Crawler('https://news.ycombinator.com', {
        itemSelector: 'tr.athing',
        itemRelations: {
          title: 'find(span.titleline a).text()',
          url: 'next().find(span.subline a).last().attr(href)',
        },
        contentSelector: 'div.toptext',
      });

      const items = await crawler.list();

      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({
        title: 'Ratatui – App Showcase',
        url: 'https://news.ycombinator.com/item?id=45830829',
      });
      expect(items[1]).toEqual({
        title: 'End of Japanese community',
        url: 'https://news.ycombinator.com/item?id=45830770',
      });
    });
  });

  describe('list() - Simple structure', () => {
    it('should crawl simple container structure', async () => {
      const mockHTML = `
        <article class="post">
          <h2 class="title">Title 1</h2>
          <a class="link" href="/article1">Link 1</a>
        </article>
        <article class="post">
          <h2 class="title">Title 2</h2>
          <a class="link" href="/article2">Link 2</a>
        </article>
      `;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockHTML,
      });

      const crawler = new Crawler('https://example.com', {
        itemSelector: 'article.post',
        itemRelations: {
          title: 'find(h2.title).text()',
          url: 'find(a.link).attr(href)',
        },
        contentSelector: '.content',
      });

      const result = await crawler.list();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: 'Title 1',
        url: 'https://example.com/article1',
      });
      expect(result[1]).toEqual({
        title: 'Title 2',
        url: 'https://example.com/article2',
      });
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const crawler = new Crawler('https://example.com', {
        itemSelector: '.item',
        itemRelations: {
          title: 'find(.title).text()',
          url: 'find(.link).attr(href)',
        },
        contentSelector: '.content',
      });

      await expect(crawler.list()).rejects.toThrow('Failed to crawl list');
    });
  });

  describe('getContent()', () => {
    it('should extract content from HN item page', async () => {
      // URL에 따라 다른 mock HTML 반환
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('item?id=')) {
          // item 페이지 요청
          return Promise.resolve({
            ok: true,
            text: async () => MOCK_HN_ITEM_HTML,
          });
        } else {
          // 목록 페이지 요청
          return Promise.resolve({
            ok: true,
            text: async () => MOCK_HN_LIST_HTML,
          });
        }
      });

      const crawler = new Crawler('https://news.ycombinator.com', {
        itemSelector: 'tr.athing',
        itemRelations: {
          title: 'find(span.titleline a).text()',
          url: 'next().find(span.subline a).last().attr(href)',
        },
        contentSelector: 'div.toptext',
      });

      const content = await crawler.getContent((await crawler.list())[0].url);

      expect(content).toContain('hello world');
    });

    it('should throw error when content not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<html><body>No content</body></html>',
      });

      const crawler = new Crawler('https://example.com', {
        itemSelector: '.item',
        itemRelations: {
          title: 'find(.title).text()',
          url: 'find(.link).attr(href)',
        },
        contentSelector: '.content',
      });

      await expect(crawler.getContent('https://example.com/article')).rejects.toThrow(
        'Content not found with the given selector'
      );
    });
  });
});
