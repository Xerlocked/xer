# Astro 블로그 개발 규칙

이 문서는 저장소 전체에 적용한다. 작업 전에 관련 코드와 설정을 읽고, 아래 규칙에 따라 필요한 범위만 수정한다.

## 프로젝트 구조

- Astro 7 기반 정적 블로그·포트폴리오이며 TypeScript strict 설정, Tailwind CSS, SolidJS, Markdown/MDX를 사용한다.
- `src/pages/`: 홈, 블로그, 프로젝트, 검색 페이지 및 RSS·robots 엔드포인트.
- `src/layouts/`: 공통 페이지 구조와 글 상단·본문 레이아웃.
- `src/components/`: Astro UI 및 SolidJS 검색 컴포넌트.
- `src/content/blog/<폴더명>/index.md`, `src/content/projects/<폴더명>/index.md`: 글과 프로젝트 콘텐츠. 관련 이미지는 해당 콘텐츠 폴더에 둔다.
- `src/content.config.ts`: Content Collection 스키마의 기준.
- `src/styles/global.css`, `tailwind.config.mjs`: 공통 스타일과 테마.
- `src/consts.ts`, `src/types.ts`, `src/lib/`: 사이트 정보, 공통 타입, 유틸리티 및 Markdown 플러그인.
- `public/`: 고정 경로로 제공하는 이미지·폰트·스크립트 등 정적 자산.

## 1. 기존 프로젝트 구조와 패턴을 먼저 따른다

- 변경 대상과 유사한 페이지·컴포넌트를 먼저 읽고 기존 레이아웃, 유틸리티, 타입을 재사용한다.
- `PageLayout.astro`와 기존 글 레이아웃을 활용하고, 공통 메타데이터는 `BaseHead.astro`, 사이트 문구는 `src/consts.ts`의 관리 방식을 따른다.
- 기존 `@components`, `@layouts`, `@lib`, `@consts` 등의 import 별칭과 수정 파일의 코드 스타일을 따른다. 파일 전체를 일괄 재포맷하지 않는다.
- 요청 없이 Astro 버전, 렌더링 방식, 프레임워크, 패키지 관리 도구를 교체하지 않는다. 최신 버전의 API를 현재 프로젝트에 그대로 도입하지 않는다.

## 2. 불필요한 client-side JavaScript를 만들지 않는다

- 콘텐츠 조회·정렬·가공과 정적인 화면 렌더링은 Astro frontmatter와 빌드 단계에서 처리한다.
- HTML/CSS로 구현할 수 있는 기능에 상태 관리나 브라우저 스크립트를 추가하지 않는다.
- `client:*` 지시어는 브라우저 상호작용이 필요한 컴포넌트에만 사용한다. `client:load`나 `client:only`를 관성적으로 추가하지 않는다.
- 검색 등 기존 상호작용과 `public/js/`의 테마·스크롤·복사 기능을 재사용하고, 중복 스크립트나 이벤트 리스너를 만들지 않는다.
- 새 의존성은 기존 기능으로 해결할 수 없는 경우에만 추가하고 필요성을 설명한다.

## 3. Astro 컴포넌트를 우선 사용한다

- 새 정적 UI와 레이아웃은 `.astro`로 작성한다.
- 상태와 이벤트 처리가 필요한 UI는 기존 SolidJS 패턴을 따른다. React 등 별도 UI 프레임워크를 추가하지 않는다.
- 기존 `.tsx` 컴포넌트를 단순히 형식을 통일할 목적으로 변환하지 않는다. `.tsx` 사용 자체가 클라이언트 실행을 요구하는 것은 아니다.
- Props와 콘텐츠 타입을 명시하고 `CollectionEntry<"blog">`, `CollectionEntry<"projects">` 등 기존 타입을 활용한다. 오류를 숨기기 위해 `any`나 타입 검사 무시를 추가하지 않는다.

## 4. 기존 글 URL과 slug를 함부로 변경하지 않는다

- 상세 페이지는 `src/pages/blog/[...slug].astro`, `src/pages/projects/[...slug].astro`에서 컬렉션의 `entry.id`를 사용해 생성한다.
- 기존 콘텐츠 폴더명, 파일 경로, 명시적 slug 및 `/blog/…`, `/projects/…` 경로를 임의로 바꾸지 않는다. 제목 수정에 맞춰 slug를 자동 변경하지 않는다.
- URL 변경이 작업에 반드시 필요하면 기존 주소의 리디렉션과 내부 링크, 검색 결과, 이전·다음 글, RSS, sitemap, canonical URL의 영향을 함께 처리한다.
- 링크는 기존 컬렉션과 ID를 기준으로 구성하고, 제목에서 별도의 slug를 추측해 만들지 않는다.

## 5. Content Collection 스키마를 준수한다

- 컬렉션은 `astro/loaders`의 `glob()`으로 로드하고 본문은 `astro:content`의 `render(entry)`로 렌더링한다. Zod는 `astro/zod`에서 가져온다. 기존 글 URL과 일치하는 ID를 유지한다.
- 실제 필드와 타입은 항상 `src/content.config.ts`에서 확인한다.
- `blog`와 `projects`의 필수 필드는 `title`, `summary`, `date`, `tags`다. `date`는 날짜로 변환 가능한 값, `tags`는 문자열 배열로 작성한다.
- 두 컬렉션의 `draft`는 선택적 boolean, `image`는 `image()` 스키마를 따르는 선택적 이미지다. `projects`에는 선택적 문자열 `demoUrl`, `repoUrl`도 있다.
- `work` 스키마를 다룰 경우 `company`, `role`, `dateStart`, `dateEnd`의 정의를 확인한다. `dateEnd`는 날짜 또는 문자열을 허용한다.
- 기존 글의 날짜, 태그, 공개 상태와 본문을 요청 없이 변경하지 않는다. 새 필드를 추가할 때는 스키마, 타입, 소비 코드를 함께 확인한다.
- 홈·목록·검색·이전/다음 글의 기존 draft 제외 및 날짜 정렬 패턴을 따른다. 현재 상세 경로 생성과 RSS에는 같은 draft 필터가 없으므로 `draft: true`만으로 비공개가 보장된다고 가정하지 않는다. 공개 정책 변경은 관련 작업 범위에서 명시적으로 다룬다.
- 글의 상대 이미지 경로와 기존 Markdown/MDX 문법을 보존한다. Markdown 처리 변경 시 수식(KaTeX), admonition, GitHub 카드, 이미지 캡션 플러그인에 미치는 영향을 확인한다.

## 6. 관련 없는 코드를 리팩터링하지 않는다

- 요청을 해결하는 최소 범위를 수정한다. 주변 코드 정리, 파일 이동, 의존성 업데이트, 글 내용 교정을 묶어서 진행하지 않는다.
- 작업 중 발견한 관련 없는 문제는 결과에 따로 알리고 임의로 수정하지 않는다. 사용자의 기존 변경을 덮어쓰거나 되돌리지 않는다.
- `package-lock.json`과 `pnpm-lock.yaml`이 모두 존재한다. 의존성 변경이 없는 작업에서는 잠금 파일을 재생성하거나 삭제하지 않는다.
- `node_modules/`, `dist/`, `.astro/` 등 의존성 및 생성물을 직접 수정하거나 커밋하지 않는다.

## 7. 스타일·접근성·메타데이터를 유지한다

- Tailwind 3은 `postcss.config.mjs`로 연결한다. Astro 7과 호환되지 않는 `@astrojs/tailwind` 통합을 다시 추가하지 않는다.
- 기존 Tailwind 클래스, 공통 CSS, Pretendard 글꼴 및 class 기반 다크 모드를 따른다. 전역 스타일 변경은 전체 페이지에 미치는 영향을 확인한다.
- UI 변경 시 모바일·데스크톱과 밝은·어두운 테마를 확인한다. 의미에 맞는 HTML, 키보드 조작, 포커스 표시, 이미지 대체 텍스트를 유지한다.
- 이미지 처리에는 기존 방식과 `astro:assets`를 우선 검토한다. `public/` 자산의 고정 URL과 콘텐츠의 상대 경로를 구분한다.
- 한국어 페이지 언어 설정과 제목·설명·canonical·Open Graph·RSS·sitemap 메타데이터를 보존한다. 사이트 주소의 기준은 `astro.config.mjs`다.

## 8. 수정 후 `npm run build`로 검증한다

- 프로젝트 루트에서 `npm run build`를 실행한다. 실제 스크립트는 `astro check && astro build`이며 타입·Astro 검사와 정적 사이트 빌드를 모두 통과해야 한다.
- 의존성이 없다면 설치 환경과 잠금 파일을 확인해 준비한다. 검증을 위해 빌드 스크립트나 타입 검사를 약화하지 않는다.
- 화면이나 콘텐츠를 변경했다면 빌드 외에도 해당 페이지의 표시, 링크, 이미지 및 영향을 받은 상호작용을 확인한다. 필요하면 `npm run dev` 또는 빌드 후 `npm run preview`를 사용한다.
- 검증 실패 시 이번 수정으로 발생한 문제는 해결한다. 기존 오류나 환경 제약 때문에 검증할 수 없으면 실패 원인과 미검증 범위를 명시하고 성공했다고 보고하지 않는다.
- 완료 시 변경 내용, 검증 결과, 남은 문제를 간결하게 보고한다.
