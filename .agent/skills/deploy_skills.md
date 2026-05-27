# 🚀 Antigravity Deployment Skill

## 🎯 실행 트리거 (Trigger Condition)
*   **실행 조건:** 사용자가 "배포", "deploy", "배포해줘", "서버 배포 진행해줘", "GitHub에 올려줘" 등의 요청을 하는 경우, 아래의 **`🌐 GitHub 서버 배포 프로세스 (Deployment)`**를 자동으로 감지하여 순차적으로 실행합니다.

---

## 🌐 GitHub 서버 배포 프로세스 (Deployment)

본 프로세스는 프로젝트 완료 후 GitHub를 통해 원격 레포지토리를 생성하고, 코드를 업로드하여 서버 또는 호스팅 환경에 최종 배포하고 검증하는 전 과정을 정의합니다.

---

### 1. 서버배포 준비 (Preparation)

#### 1.1 Git 로그인 상태 및 사용자 계정 확인
*   **계정 일치 여부 검증:** 배포를 진행하기 전, 로컬 Git 환경이 사용자 계정 `'Seungyeon7'`으로 설정되어 있는지 확인합니다.
    *   *검증 명령어:* `git config user.name`
    *   만약 설정이 되어 있지 않거나 다를 경우, 아래 명령어를 실행하여 계정을 일치시킵니다:
        ```bash
        git config --global user.name "Seungyeon7"
        ```
*   **GitHub 인증 상태 확인:** GitHub CLI(`gh`)가 로그인되어 있고 원격 저장소 생성 권한이 활성화되어 있는지 확인합니다.
    *   *검증 명령어:* `gh auth status`

#### 1.2 배포 가능 파일 구조 검증
*   **불필요한 파일 제외 (.gitignore 설정):** `.env`, `node_modules`, `venv`, `.gemini` 등의 빌드 캐시 및 민감한 환경 설정 파일이 배포 대상에 포함되지 않도록 `.gitignore` 파일을 점검 및 생성합니다.
*   **프로젝트 진입점 및 빌드 구조 확인:**
    *   **정적 웹 (Vite, HTML/JS 등):** 루트에 `index.html`이 존재하거나 빌드 출력 디렉토리(`dist`, `build` 등) 설정이 올바른지 확인합니다.
    *   **백엔드/서버 (Python, Node.js 등):** 의존성 파일(`requirements.txt` 또는 `package.json`)과 진입점 파일(`app.py`, `main.py` 등)이 제대로 구성되었는지 확인합니다.

---

### 2. 서버배포 진행 (Execution)

#### 2.1 로컬 저장소 초기화 및 커밋
*   로컬 디렉토리에서 Git 저장소를 초기화하고 모든 작업 내역을 스테이징한 후 커밋을 작성합니다.
    ```bash
    git init
    git add .
    git commit -m "deploy: initial commit for server deployment"
    ```

#### 2.2 GitHub 원격 레포지토리 생성 및 연동
*   **레포지토리 생성:** 현재 작업 중인 폴더명을 기반으로 GitHub 원격 레포지토리를 생성합니다.
    *   *GitHub CLI 사용 시:*
        ```bash
        gh repo create Seungyeon7/<current-folder-name> --public --source=. --remote=origin --push
        ```
    *   *직접 수동 생성 시:* GitHub 웹사이트에서 레포지토리를 생성한 뒤 로컬 저장소에 원격 주소를 연결합니다.
        ```bash
        git remote add origin https://github.com/Seungyeon7/<repository-name>.git
        git branch -M main
        git push -u origin main
        ```

#### 2.3 서버 배포 플랫폼 연동 및 트리거
*   정적 페이지 배포(GitHub Pages)를 활성화합니다.
    *   **GitHub Pages (정적 사이트):**
        1. 레포지토리에 코드가 push된 후, 사용자에게 아래 URL로 접속할 것을 채팅으로 제안합니다:
           `https://github.com/Seungyeon7/<repository-name>/settings/pages`
        2. 해당 페이지에서 **"Build and deployment"** 섹션의 **"Branch"** 드롭다운을 `None`에서 `main`으로 변경하고, **[Save]** 버튼을 클릭하도록 안내합니다.
        3. Save 후 GitHub Actions가 자동으로 빌드 및 배포를 시작하며, 수 분 내에 `https://Seungyeon7.github.io/<repository-name>/` 주소로 사이트가 게시됩니다.

---

### 3. 서버배포 확인 (Verification)

#### 3.1 배포 파이프라인 및 로그 모니터링
*   GitHub Actions 또는 배포 호스팅 서버에서 빌드/배포 프로세스가 에러 없이 성공적으로 끝났는지 확인합니다.
    *   *검증 명령어:* `gh run list` 또는 웹 콘솔을 통한 배포 상태 모니터링.

#### 3.2 배포 링크 접속 및 실 서비스 검증
*   **배포 URL 접속:** 최종 배포 완료 후 제공되는 URL(예: `https://Seungyeon7.github.io/<repository-name>/` 등)로 직접 접속합니다.
*   **기능 및 동작 테스트:**
    *   브라우저 개발자 도구(F12)의 Console 탭을 확인하여 JavaScript 에러나 API 호출 실패(404, 500)가 없는지 점검합니다.
    *   주요 비즈니스 로직(데이터 요청, 렌더링 등)이 정상 작동하는지 수동 검증을 진행합니다.