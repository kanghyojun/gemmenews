# 뉴스 수집 함수 (collectNews)

## 개요

`collectNews()` 함수는 등록된 모든 활성 뉴스 소스에서 기사를 자동으로 수집하는 함수입니다. 이 함수는 이슈 #3의 요구사항을 구현한 것입니다.

## 주요 기능

- ✅ 활성화된 모든 뉴스 소스 자동 탐지
- ✅ 당일 이미 수집된 소스는 자동 건너뛰기
- ✅ URL 중복 방지로 같은 기사 재수집 차단
- ✅ 각 소스별 수집 로그 자동 기록
- ✅ 에러 발생 시 자동 복구 및 상세 로깅
- ✅ 병렬 처리 없이 순차 실행으로 안정성 보장

## 사용법

### 기본 사용

```typescript
import { collectNews } from './lib/collect-news';

async function main() {
  const results = await collectNews();

  console.log(`총 ${results.length}개 소스 처리 완료`);

  results.forEach(result => {
    console.log(`[${result.sourceName}] ${result.articlesCollected}개 기사 수집`);
  });
}
```

### 반환 타입

```typescript
interface CollectionResult {
  sourceId: number;           // 뉴스 소스 ID
  sourceName: string;         // 뉴스 소스 이름
  articlesCollected: number;  // 수집된 기사 수
  status: 'success' | 'failed'; // 수집 상태
  errorMessage?: string;      // 실패 시 에러 메시지
}
```

## 동작 흐름

```
┌─────────────────────────────────────────────────────────┐
│ 1. 활성화된 뉴스 소스 조회                                   │
│    - news_sources 테이블에서 is_active = true인 소스 가져오기   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. 오늘 이미 수집된 소스 확인                                │
│    - collection_logs에서 오늘 started_at된 로그 검색          │
│    - 이미 수집된 소스는 제외                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. collection_logs에 in_progress 상태로 등록               │
│    - 수집할 각 소스에 대해 로그 레코드 생성                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. 각 소스별 순차 수집 (for loop)                          │
│    ├─ started_at 시간 기록                                │
│    ├─ Crawler 클래스로 기사 목록 가져오기                     │
│    ├─ 각 기사의 URL 중복 체크                               │
│    └─ 중복되지 않은 기사만 articles 테이블에 저장              │
│       (collection_log_id 포함)                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. collection_logs 업데이트                              │
│    ├─ 성공: completed_at, status='success'                  │
│    └─ 실패: completed_at, status='failed', error_message     │
│                                                             │
│    * 수집된 기사 수는 articles.collection_log_id로 조회 가능   │
└─────────────────────────────────────────────────────────┘
```

## 에러 핸들링

### 개별 소스 에러

한 소스에서 에러가 발생해도 다른 소스의 수집은 계속 진행됩니다.

```typescript
const results = await collectNews();

// 실패한 소스 확인
const failedSources = results.filter(r => r.status === 'failed');
if (failedSources.length > 0) {
  console.error('실패한 소스들:');
  failedSources.forEach(source => {
    console.error(`- ${source.sourceName}: ${source.errorMessage}`);
  });
}
```

### 치명적 에러

데이터베이스 연결 실패 등 치명적인 에러는 exception을 throw합니다.

```typescript
try {
  await collectNews();
} catch (error) {
  console.error('치명적 에러:', error);
  // 알림 전송, 로그 기록 등
}
```

## 데이터베이스 스키마

### news_sources

```sql
CREATE TABLE news_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  base_url TEXT NOT NULL,
  config JSONB NOT NULL,      -- CrawlerConfig
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### articles

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES news_sources(id),
  collection_log_id INTEGER REFERENCES collection_logs(id),  -- 어느 수집 작업에서 가져왔는지 추적
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,   -- URL 중복 방지
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### collection_logs

```sql
CREATE TABLE collection_logs (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES news_sources(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress',  -- in_progress, success, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수집된 기사 수는 articles 테이블과 JOIN으로 계산
-- SELECT COUNT(*) FROM articles WHERE collection_log_id = ?
```

## 실전 예제

### Cron Job으로 정기 실행

```bash
# 매일 오전 9시에 뉴스 수집
0 9 * * * cd /home/ed/src/gemmenews && node -e "import('./src/lib/collect-news.js').then(m => m.collectNews())"
```

### API 엔드포인트로 노출

```typescript
import { collectNews } from './lib/collect-news';

app.post('/api/collect-news', async (req, res) => {
  try {
    const results = await collectNews();
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        totalArticles: results.reduce((sum, r) => sum + r.articlesCollected, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Discord 알림 통합

```typescript
async function collectWithNotification() {
  const results = await collectNews();

  const totalArticles = results.reduce((sum, r) => sum + r.articlesCollected, 0);
  const failedCount = results.filter(r => r.status === 'failed').length;

  const message = `
📰 뉴스 수집 완료
- 총 ${totalArticles}개 기사 수집
- ${results.length}개 소스 처리
${failedCount > 0 ? `⚠️ ${failedCount}개 소스 실패` : '✅ 모두 성공'}
  `.trim();

  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message })
  });

  return results;
}
```

## 성능 고려사항

### 순차 실행

현재 구현은 안정성을 위해 **순차 실행**합니다. 각 소스는 하나씩 차례대로 처리됩니다.

장점:
- 데이터베이스 부하 분산
- 에러 발생 시 다른 소스에 영향 없음
- 로깅과 디버깅이 쉬움

단점:
- 소스가 많으면 전체 수집 시간이 김
- 네트워크 대기 시간이 누적됨

### 병렬 처리 전환 (향후 개선)

필요시 병렬 처리로 전환할 수 있습니다:

```typescript
// Promise.all로 병렬 처리
await Promise.all(
  sourcesToCollect.map(source => processSingleSource(source))
);
```

하지만 현재는 순차 실행이 권장됩니다.

## 테스트

```bash
# 단위 테스트 실행
npm test -- collect-news.test.ts

# 전체 테스트
npm test
```

테스트 커버리지:
- ✅ 활성 소스가 없는 경우
- ✅ 오늘 이미 수집된 소스 건너뛰기
- ✅ 정상 수집 및 로그 업데이트
- ✅ URL 중복 방지
- ✅ 에러 발생 시 로깅

## 트러블슈팅

### Q: "오늘 수집할 새로운 소스가 없습니다" 메시지가 나옵니다

A: 이미 오늘 해당 소스들을 수집했습니다. `collection_logs` 테이블을 확인하세요.

```sql
SELECT * FROM collection_logs
WHERE started_at >= CURRENT_DATE
ORDER BY started_at DESC;
```

### Q: 특정 소스만 다시 수집하고 싶습니다

A: 해당 소스의 오늘 로그를 삭제하거나, 소스의 `is_active`를 false로 했다가 다시 true로 변경하세요.

```sql
-- 오늘 로그 삭제
DELETE FROM collection_logs
WHERE source_id = 1
AND started_at >= CURRENT_DATE;
```

### Q: URL 중복 체크를 무시하고 싶습니다

A: `articles` 테이블의 `url` unique 제약을 해제하거나, 수집 함수를 수정해야 합니다. (권장하지 않음)

## 관련 파일

- `src/lib/collect-news.ts` - 메인 구현
- `src/lib/collect-news.test.ts` - 테스트 코드
- `src/lib/collect-news.example.ts` - 사용 예제
- `src/lib/crawl.ts` - Crawler 클래스
- `drizzle/schema.ts` - 데이터베이스 스키마

## 기여

이슈 #3을 기반으로 구현되었습니다. 개선 사항이나 버그는 이슈로 등록해주세요.
