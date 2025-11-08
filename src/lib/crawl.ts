import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';

/**
 * 관계형 선택자 경로
 * 문자열 형태의 체인 선택자를 지원합니다.
 * 예: "next().find(.subline a).last().attr(href)"
 */
export type SelectorPath = string;

/**
 * 크롤러 설정 인터페이스
 *
 * itemSelector: 각 뉴스 아이템의 기준이 되는 요소 선택자
 * itemRelations: 기준 요소로부터 title과 url을 찾는 관계형 경로
 * contentSelector: 상세 페이지에서 본문을 찾을 선택자
 */
export interface CrawlerConfig {
  /** 각 뉴스 아이템의 기준 요소 선택자 (예: "tr.athing", "article.post") */
  itemSelector: string;

  /** 기준 요소로부터 title과 url을 찾는 관계형 선택자 */
  itemRelations: {
    /** 타이틀을 추출하는 선택자 경로 */
    title: SelectorPath;
    /** URL을 추출하는 선택자 경로 */
    url: SelectorPath;
  };

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
  private url: string;
  private config: CrawlerConfig;

  /**
   * 크롤러 인스턴스 생성
   * @param url 크롤링할 목록 페이지 URL
   * @param config 크롤러 설정 객체
   */
  constructor(url: string, config: CrawlerConfig) {
    this.url = url;
    this.config = config;
  }

  /**
   * 목록 페이지에서 뉴스 제목과 링크를 크롤링합니다.
   * @returns 뉴스 아이템 배열
   */
  async list(): Promise<NewsItem[]> {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const baseUrl = new URL(this.url).origin;
      const $ = cheerio.load(html);
      const items: NewsItem[] = [];

      // itemSelector로 각 아이템 순회
      $(this.config.itemSelector).each((_, itemElement) => {
        const $item = $(itemElement);

        try {
          // 관계형 선택자로 title과 url 추출
          const title = this.executeSelectorPath($, $item, this.config.itemRelations.title);
          const link = this.executeSelectorPath($, $item, this.config.itemRelations.url);

          if (title && link) {
            const url = this.normalizeUrl(link, baseUrl);
            items.push({ url, title });
          }
        } catch (error) {
          // 개별 아이템 파싱 실패는 무시하고 계속 진행
          console.warn(`Failed to parse item: ${error instanceof Error ? error.message : String(error)}`);
        }
      });

      return items;
    } catch (error) {
      throw new Error(`Failed to crawl list: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 관계형 선택자 경로를 실행합니다.
   *
   * 지원하는 메서드:
   * - find(selector) : 하위 요소 검색
   * - next() : 다음 형제
   * - prev() : 이전 형제
   * - parent() : 부모 요소
   * - closest(selector) : 가장 가까운 조상
   * - first() : 첫 번째 요소
   * - last() : 마지막 요소
   * - eq(index) : 인덱스로 선택
   * - text() : 텍스트 추출
   * - attr(name) : 속성 추출
   *
   * 예시: "next().find(.subline a).last().attr(href)"
   *
   * @param $ cheerio 인스턴스
   * @param $element 기준 요소
   * @param path 선택자 경로
   * @returns 추출된 값
   */
  private executeSelectorPath($: cheerio.CheerioAPI, $element: cheerio.Cheerio<AnyNode>, path: SelectorPath): string {
    // 체인 메서드를 파싱
    // 예: "next().find(.subline a).last().attr(href)"
    const methodRegex = /(\w+)\(([^)]*)\)/g;
    const methods: Array<{ name: string; arg: string }> = [];

    let match;
    while ((match = methodRegex.exec(path)) !== null) {
      methods.push({
        name: match[1],
        arg: match[2].trim(),
      });
    }

    let current = $element;

    // 각 메서드를 순차적으로 실행
    for (const method of methods) {
      switch (method.name) {
        case 'find':
          current = current.find(method.arg);
          break;
        case 'next':
          current = current.next(method.arg || undefined);
          break;
        case 'prev':
          current = current.prev(method.arg || undefined);
          break;
        case 'parent':
          current = current.parent(method.arg || undefined);
          break;
        case 'closest':
          current = current.closest(method.arg);
          break;
        case 'first':
          current = current.first();
          break;
        case 'last':
          current = current.last();
          break;
        case 'eq':
          current = current.eq(parseInt(method.arg, 10));
          break;
        case 'text':
          return current.text().trim();
        case 'attr':
          return current.attr(method.arg) || '';
        default:
          throw new Error(`Unknown selector method: ${method.name}`);
      }
    }

    // 최종 결과가 요소인 경우 텍스트 반환
    return current.text().trim();
  }

  /**
   * 상대 경로를 절대 경로로 변환합니다.
   * @param url 변환할 URL
   * @param baseUrl 기준 URL
   * @returns 정규화된 절대 URL
   */
  private normalizeUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    return `${baseUrl}/${url}`;
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
