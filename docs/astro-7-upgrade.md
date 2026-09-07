# Astro 4 → 7 업그레이드

2026-09-07 기준 Astro 7.3.1로 업그레이드했다. 정적 사이트 출력과 기존 글 URL을 유지한다.

## 이 프로젝트에서 변경한 부분

| 항목 | 이전 | 변경 후 |
| --- | --- | --- |
| Astro | `^4.4.13` | `^7.3.1` |
| Node.js 요구 사항 | 별도 명시 없음 | `>=22.12.0` (검증 환경: 24.19.0) |
| 컬렉션 설정 | `src/content/config.ts`, `type: "content"` | `src/content.config.ts`, `glob()` loader |
| 글 식별자 | `entry.slug` | `entry.id` — 기존 폴더 기반 URL 유지 |
| 본문 렌더링 | `entry.render()` | `render(entry)` |
| 스키마 import | `z` from `astro:content` | `z` from `astro/zod` |
| Markdown | 기본 remark/rehype 처리 | `@astrojs/markdown-remark`의 `unified()` 명시 |
| Tailwind 3 | `@astrojs/tailwind` 통합 | PostCSS + autoprefixer, 기존 CSS·테마 유지 |
| 공백 처리 | 기존 HTML 방식 | `compressHTML: true`로 이전 동작 유지 |

- MDX 8.0.0, SolidJS 통합 7.0.2 및 Astro 검사·RSS·sitemap 패키지를 호환 버전으로 갱신했다.
- `body`가 선택적 값이 된 타입에 맞춰 읽기 시간 계산에 빈 문자열 기본값을 적용했다.
- 상세 페이지, 카드, 검색 인덱스, 이전·다음 글, RSS를 새 ID 방식에 맞췄다. RSS 경로는 글 ID 문자열을 추측하는 대신 `collection`으로 결정한다.
- TypeScript 검사에 생성된 `.astro/types.d.ts`를 포함하고 Tailwind 설정의 CommonJS `require`를 ESM import로 바꿨다.
- Astro 7에서 정적 자산과 엔드포인트가 겹치는 경우를 피하도록, localhost 주소가 들어 있던 `public/robots.txt`를 제거했다. `src/pages/robots.txt.ts`가 실제 사이트의 sitemap 주소를 생성한다.
- 비어 있는 `work` 컬렉션은 스키마를 유지하고 콘텐츠 디렉터리를 추가했다.
- npm과 pnpm 잠금 파일 및 `AGENTS.md`를 갱신했다. 본문·태그·날짜·draft 정책은 변경하지 않았다.

## 버전별 주요 차이

### Astro 5

Content Layer가 도입되어 로컬 파일뿐 아니라 외부 데이터도 loader로 컬렉션에 연결할 수 있다. 새로운 컬렉션 API는 `id`와 독립적인 `render()` 함수를 사용한다. `<ViewTransitions />`는 `<ClientRouter />`로 이름이 바뀌고 TypeScript에 생성 타입 포함이 필요해졌다. 이 사이트에는 활성화된 ViewTransitions 컴포넌트가 없어 클라이언트 라우터를 새로 추가하지 않았다.

출처: [Astro 5 마이그레이션 가이드](https://docs.astro.build/en/guides/upgrade-to/v5/)

### Astro 6

Node.js 22.12 이상, Vite 7, Zod 4로 기반이 바뀌었다. 기존 Content Collection API와 `<ViewTransitions />`가 제거되어 오래된 사용법을 수정해야 한다. `z`는 `astro/zod`에서 가져온다. 파일 확장자를 가진 엔드포인트의 trailing slash 처리, 이미지 처리, Markdown 제목 ID 생성 등에도 변경이 있어 관련 출력 확인이 필요하다.

출처: [Astro 6 마이그레이션 가이드](https://docs.astro.build/en/guides/upgrade-to/v6/)

### Astro 7

Vite 8과 Rust 기반 Astro 컴파일러가 기본이 되었다. 닫히지 않은 태그는 오류가 되고, 잘못 중첩된 HTML을 컴파일러가 자동으로 고쳐주지 않는다. 빌드 성능 개선이 있지만 이 프로젝트는 기존 버전과 동일 환경에서 시간을 비교하지 않았으므로 개선율을 단정하지 않는다.

기본 Markdown 엔진은 Sätteri로 바뀌었다. 이 프로젝트는 수식, 알림 상자, GitHub 카드, 이미지 캡션 플러그인을 유지하기 위해 지원되는 `unified()` 경로를 선택했다. 기본 공백 처리도 JSX 방식으로 바뀌므로 이전 HTML 방식은 설정으로 명시했다.

고급 라우팅, route caching, 로깅 시스템이 안정화되었다. `src/fetch.ts`는 라우팅용 예약 파일명이다. 정적 블로그에는 새 서버 라우팅·캐시를 추가할 필요가 없어 활성화 설정을 추가하지 않았다. 7.2의 증분 정적 빌드는 실험 기능이며 이번 변경에 사용하지 않았다.

출처: [Astro 7 마이그레이션 가이드](https://docs.astro.build/en/guides/upgrade-to/v7/), [Astro 7.2 릴리스](https://astro.build/blog/astro-720/)

## 검증 방법

```sh
npm ci
npm run build
node scripts/verify-build.mjs
```

빌드 명령은 `astro check && astro build`를 실행한다. 추가 검증은 기존 45개 글·프로젝트의 생성 경로, canonical·RSS·sitemap 링크, 로컬 이미지·스크립트, 글 간 링크, 수식·알림 상자·GitHub 카드·캡션, 검색 island의 생성 여부를 검사한다. 이는 브라우저에서 검색·페이지 이동·반응형 화면을 직접 확인하는 검증을 대체하지 않는다.

로컬 확인은 `npm run preview`로 실행한다. 배포 환경도 Node.js 22.12 이상을 사용해야 한다. 사이트 배포는 이번 작업에 포함하지 않았다.

### 이번 작업의 검증 결과

- `npm run build` 성공: Astro 검사 30개 파일의 오류·경고·힌트 0개, 정적 페이지 49개 생성, 이미지 253개 처리.
- `node scripts/verify-build.mjs` 성공: 기존 글·프로젝트 URL 45개와 관련 출력 검사 통과.
- `git diff --check` 통과.
- 빌드에는 콘텐츠가 없는 `work` 컬렉션 알림과 오래된 Browserslist 데이터 알림이 남아 있다. 빌드 실패는 발생하지 않는다.
- 미리보기 서버는 실행됐지만 브라우저 도구가 연결되지 않아 모바일·데스크톱 화면과 검색·필터·페이지 이동의 실제 조작 검증은 하지 못했다.
