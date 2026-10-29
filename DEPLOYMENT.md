# Vercel 정적 공개판 준비

공개 빌드는 질문 기능을 항상 끕니다. SQL 실행·정답 확인·30문제·고정 해설·30개 학습 예시는 브라우저 SQLite Worker에서 동작하며 Node API/Ollama가 필요하지 않습니다. AI 소스는 보존합니다. 플래그는 보안 경계가 아니며 학습용 정답 데이터는 클라이언트에 있습니다.

## 로컬 확인

```sh
npm ci
npm run build
npm run preview
```

주소: http://127.0.0.1:4173 . 출력은 dist/입니다. 기본 개발은 npm run dev (5174, AI off). 개발용 AI는 설치된 Ollama를 로컬에서 실행한 뒤 npm run dev:ai (5174 + API 3001)로 명시적으로 켭니다. 기존 5174/3001 프로세스와 중복 실행하지 마세요. .env.example은 비밀 키를 요구하지 않습니다. production에서는 VITE_ENABLE_AI=true라도 AI UI가 표시되지 않습니다. Ollama는 정적 배포에 포함되지 않습니다.

## 사용자가 Vercel에서 지정할 값

- Framework Preset: Vite
- Root Directory: 이 폴더의 package.json이 저장소 최상위라면 `.`. 바깥 작업 폴더까지 저장소에 넣었다면 `sql-counterexample-lab`.
- Install Command: npm ci
- Build Command: npm run build
- Output Directory: dist
- 환경변수: 필요 없음. AI/API 키를 추가하지 마세요.

현재 클라이언트 경로 라우터가 없으므로 vercel.json의 API 함수/프록시/SPA 재작성은 추가하지 않았습니다. 루트 URL 새로고침을 검사했습니다. WASM과 Worker는 Vite가 dist/assets로 생성한 상대 자산 참조를 사용합니다. dist만 정적으로 제공하며 server/를 함수로 배포하지 않습니다.

실제 저장소 생성/push/Vercel 프로젝트 생성·계정 연결·배포는 수행하지 않았습니다. 사용자가 저장소를 준비하고 위 설정으로 가져오기/배포를 진행한 뒤 실제 도메인에서 WASM MIME과 Worker 실행을 다시 확인해야 합니다. 로컬 preview 성공은 Vercel 실배포 성공 확인이 아닙니다.

## 수행한 정적 검증 조건

qa-public-preview.mjs / qa-public-preview-results.json: preview proxy 없음. 브라우저에서 API/Ollama 주소를 요청하면 abort하도록 설정하여 미가용 조건을 모의했고 실제 요청 시도는 0입니다. 호스트의 기존 Ollama/API 프로세스를 중지하지 않았으며 오프라인 테스트라고 주장하지 않습니다. Chrome에서 30문제 정답 확인과 30예시 열기/현재 SQL 실행, 보기 선호 새로고침 유지, 원본 SQL 펼침/접힘, 390px 화면을 검사했습니다. WASM 200 application/wasm, Worker 200 text/javascript, 콘솔/페이지 오류 0, 모바일 페이지 가로 넘침 없음. 캡처 qa-public-desktop.png / qa-public-mobile.png를 확인했습니다.
