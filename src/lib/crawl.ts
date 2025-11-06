import * as cheerio from 'cheerio';

/**
 * 크롤러 설정 인터페이스
 */
export interface CrawlerConfig {
  /** 크롤링할 목록 페이지 URL */
  url: string;
  /** 타이틀을 찾을 CSS 선택자 */
  titleSelector: string;
  /** 링크를 찾을 CSS 선택자 */
  linkSelector: string;
  /** 상세 페이지에서 본문 내용을 찾을 CSS 선택자 */
  contentSelector: string;
}

/**
 * 뉴스 아이템 인터페이스
 */
export interface NewsItem {
  url: string;
  title: string;
}

/**
 * 웹 크롤러 클래스
 * 지정된 CSS 선택자를 사용하여 뉴스 목록과 본문을 크롤링합니다.
 */
export class Crawler {
  private config: CrawlerConfig;

  /**
   * 크롤러 인스턴스 생성
   * @param config 크롤러 설정 객체
   */
  constructor(config: CrawlerConfig) {
    this.config = config;
  }

  /**
   * 목록 페이지에서 뉴스 제목과 링크를 크롤링합니다.
   * @returns 뉴스 아이템 배열
   */
  async list(): Promise<NewsItem[]> {
    try {
      const response = await fetch(this.config.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const items: NewsItem[] = [];

      // 타이틀과 링크를 페어링하여 추출
      $(this.config.titleSelector).each((index, titleElement) => {
        const title = $(titleElement).text().trim();

        // 같은 인덱스의 링크 요소를 찾음
        const linkElement = $(this.config.linkSelector).eq(index);
        let url = linkElement.attr('href');

        if (url && title) {
          // 상대 경로를 절대 경로로 변환
          if (url.startsWith('/')) {
            const baseUrl = new URL(this.config.url);
            url = `${baseUrl.origin}${url}`;
          } else if (!url.startsWith('http')) {
            const baseUrl = new URL(this.config.url);
            url = `${baseUrl.origin}/${url}`;
          }

          items.push({ url, title });
        }
      });

      return items;
    } catch (error) {
      throw new Error(`Failed to crawl list: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 상세 페이지에서 본문 내용을 크롤링합니다.
   * @param url 크롤링할 페이지 URL
   * @returns 본문 내용 텍스트
   */
  async getContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const content = $(this.config.contentSelector).text().trim();

      if (!content) {
        throw new Error('Content not found with the given selector');
      }

      return content;
    } catch (error) {
      throw new Error(`Failed to get content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
