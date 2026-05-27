# 🎨 Demo Page Creation Skill

## 🎯 실행 트리거 (Trigger Condition)
*   **실행 조건:** 사용자가 "페이지 만들어줘", "데모 페이지", "demo page", "랜딩 페이지 만들어", "웹 페이지 생성" 등의 요청과 함께 **주제(topic)**를 제시하는 경우, 아래의 프로세스를 순차적으로 실행합니다.
*   **입력 파라미터:**
    *   `topic` (필수): 페이지의 주제 또는 테마. 사용자가 채팅으로 전달합니다.
    *   `project_name` (선택): 프로젝트 폴더명. 미지정 시 주제를 기반으로 `snake_case`로 자동 생성합니다.

---

## 🌐 데모 페이지 생성 프로세스 (Creation)

사용자가 제시한 주제에 맞는 정적 데모 웹 페이지를 HTML, CSS, JavaScript로 구현하여 GitHub Pages(`github.io`)에 바로 배포 가능한 파일 구조로 생성합니다.

---

### 1. 프로젝트 구조 생성 (Project Scaffolding)

#### 1.1 작업 디렉토리 생성
*   사용자가 지정한 `project_name` 또는 `topic` 기반으로 워크스페이스 내에 새 프로젝트 폴더를 생성합니다.
    ```
    <workspace>/<project_name>/
    ├── index.html      # 메인 진입점 (필수)
    ├── style.css       # 스타일시트
    ├── script.js       # 인터랙션 로직
    └── .gitignore      # Git 제외 파일 목록
    ```

#### 1.2 .gitignore 생성
*   GitHub Pages 배포에 불필요한 파일을 제외하는 `.gitignore`를 생성합니다.
    ```gitignore
    .env
    .agent/
    .gemini/
    node_modules/
    .DS_Store
    Thumbs.db
    ```

---

### 2. 페이지 구현 (Implementation)

#### 2.1 index.html 작성 규칙
*   **GitHub Pages 호환 필수:** 루트에 `index.html`이 반드시 존재해야 합니다. 빌드 도구(Vite, Webpack 등)를 사용하지 않고 순수 HTML로 작성합니다.
*   **SEO 기본 태그 포함:**
    ```html
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="<topic>에 대한 데모 페이지">
        <title><topic> - Demo Page</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <!-- 콘텐츠 영역 -->
        <script src="script.js"></script>
    </body>
    </html>
    ```
*   **필수 구성 요소:**
    *   헤더(Header): 페이지 제목, 네비게이션 또는 로고 영역
    *   메인 콘텐츠(Main): 주제에 맞는 핵심 콘텐츠 섹션
    *   푸터(Footer): 저작권 정보 및 부가 링크

#### 2.2 style.css 작성 규칙
*   **모던 디자인 적용:** 단순한 기본 스타일이 아닌 시각적으로 완성도 높은 디자인을 구현합니다.
    *   Google Fonts(Inter, Roboto, Noto Sans KR 등)를 CDN으로 불러와 적용
    *   조화로운 색상 팔레트(HSL 기반 색 조합) 사용
    *   부드러운 그라데이션, 그림자(box-shadow) 효과 활용
    *   hover 시 미세한 트랜지션/애니메이션 적용
*   **반응형 레이아웃:** 모바일 ~ 데스크톱까지 미디어 쿼리로 대응합니다.
    ```css
    @media (max-width: 768px) { /* 태블릿 이하 */ }
    @media (max-width: 480px) { /* 모바일 */ }
    ```

#### 2.3 script.js 작성 규칙
*   **외부 라이브러리 최소화:** CDN으로 불러올 수 있는 경량 라이브러리만 허용합니다. npm 의존성은 사용하지 않습니다.
*   **인터랙션 구현:** 주제에 적합한 동적 기능을 최소 1가지 이상 포함합니다.
    *   예: 스크롤 애니메이션, 다크모드 토글, 탭 전환, 데이터 시각화, 간단한 폼 처리 등
*   **에러 방지:** `DOMContentLoaded` 이벤트 내에서 DOM 조작을 수행합니다.
    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
        // 모든 DOM 조작 및 이벤트 바인딩
    });
    ```

---

### 3. 경로 및 리소스 규칙 (Path & Resource Rules)

#### 3.1 상대 경로 사용 필수
*   GitHub Pages는 `https://Seungyeon7.github.io/<repository-name>/` 하위에 배포되므로, 모든 리소스 참조는 **상대 경로**를 사용합니다.
    *   ✅ `href="style.css"` / `src="script.js"`
    *   ❌ `href="/style.css"` / `src="/script.js"` (절대 경로 사용 금지)

#### 3.2 이미지 및 미디어
*   이미지가 필요한 경우 `generate_image` 도구를 사용하여 실제 이미지를 생성하고, 프로젝트 내 `assets/` 폴더에 저장합니다.
*   외부 이미지 CDN(Unsplash, Placeholder 등)은 허용하되, 핵심 콘텐츠는 로컬 파일로 구성합니다.

---

### 4. 완성 후 안내 (Post-Creation)

#### 4.1 로컬 미리보기 제안
*   페이지 생성 완료 후, 사용자에게 로컬에서 바로 확인할 수 있도록 안내합니다:
    *   "생성된 `index.html` 파일을 브라우저에서 열어 결과를 확인해 보세요."

#### 4.2 배포 연계 제안
*   페이지 확인이 완료되면, 사용자에게 `deploy_skills.md`의 배포 스킬과 연계하여 GitHub Pages에 배포할 것을 제안합니다:
    *   "배포를 진행하시겠습니까? '배포해줘'라고 말씀해 주시면 GitHub Pages에 자동으로 배포를 시작합니다."
