# 최신 QA 안내

현재 기준은 [QA-CURRENT.md](QA-CURRENT.md)와 [AI-VALIDATION.md](AI-VALIDATION.md)입니다. 아래는 초기 단계 기록이며 현재 수량/AI 입력과 다릅니다.

# 검증 기록과 수동 QA

2026-10-29 Windows / Node 24.22.1 / Chrome headless에서 검증했습니다.

## 자동 검증 결과

- `npm.cmd test`: multiset 단위 테스트 4개 통과(순서/alias, 중복, NULL 구분, 빈 결과 열 개수).
- `npm.cmd run build`: TypeScript와 Vite 프로덕션 빌드 통과.
- `node qa-browser.mjs`: 샘플 실행, 반례 실패, ORDER/alias 변경된 정답 전체 통과, DDL 차단, 5초 timeout 후 재실행, 실제 AI 미연결 UI, XSS 문자열 표시, 모바일 화면 캡처 통과. pageerror 0.
- `node qa-extra.mjs`: 3문제 각각 샘플의 대표 오답 통과/별도 검사 실패/정답 5개 통과. 여러 문장·PRAGMA·ATTACH·DELETE·확장 함수 차단, 500행 초과 실패, mock AI 응답과 재질문/문제전환 취소 통과.
- desktop/mobile PNG를 실제로 열어 레이아웃과 결과 표를 확인했습니다.
- qa-browser-results.json / qa-extra-results.json은 자동 검증 증거입니다.

두 QA 스크립트는 검증 당시 사용한 5174 포트를 가리킵니다. 기본 개발 포트는 5173이며 서버 메시지에 맞춰 스크립트 URL을 수정할 수 있습니다. Chrome 실행 경로도 Windows 설치에 맞춰 바꾸세요. 의존성 설치와 Chrome localhost 접근은 sandbox 네트워크 제한 때문에 허용된 실행 환경에서 수행했습니다. 시스템 네트워크 설정 변경은 없습니다.

## 직접 확인 순서

1. `npm.cmd run dev` → 출력된 Local URL을 열기 → 첫 문제 선택. 스키마/현재 샘플 데이터 펼치기. 오류 기준: 빈 페이지, 콘솔 예외.
2. 기본 SQL 그대로 **현재 데이터로 실행** → 고객 1의 완료 주문 수 1. **다른 데이터로 검사** → 검사 2 실패, 주문 없는 고객 1/2/3의 `[id,0]` 누락. 오류 기준: 전체 통과 또는 반례 데이터 없음.
3. **힌트 보기** 세 번 → 단계별 힌트. **정답 SQL과 해설 펼치기** → 정답 복사 후 편집기에 붙이기 → 검사 → 5개 통과. 오류 기준: 정답을 펼치기 전에 자동 표시하거나 정답 실패.
4. 둘째 문제 선택 → 기본 SQL 실행 통과 → 별도 검사 실패. SUM(DISTINCT o.amount)로 수정하면 같은 금액 두 주문 사례에서 실패. 정답 복사 → 5개 통과.
5. 셋째 문제 선택 → 기본 SQL 샘플 통과 → NULL 참조 사례 실패. 정답 복사 → 5개 통과.
6. `DROP TABLE customers` 입력 → 실행 오류. 이후 `SELECT 1` → 정상 실행. 여러 문장/PRAGMA/ATTACH도 거부되어야 함.
7. `WITH RECURSIVE x(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM x) SELECT sum(n) FROM x` → 약 5초 후 실행 제한 → `SELECT 1` 재실행 정상. 결과를 잘라 통과하면 오류.
8. **더 물어보기 · 로컬 AI 보조 패널** 펼치기 → 질문 → Ollama 없으면 미연결 안내. 검사/힌트는 계속 사용 가능. 요청 중 문제 변경 → 이전 질문/응답이 새 문제에 나타나면 오류.
9. 질문에 `<img src=x onerror=alert(1)>` 입력 → 문자열로만 보여야 함. 이미지/팝업이 뜨면 오류.
10. Tab 키로 버튼/summary/편집기 이동 → 파란 focus ring, 버튼 최소 44px. 390px 폭에서 문제→편집기→결과→AI 순서. 긴 표는 표 안에서 스크롤되어야 함.

## 남은 검증/제한

- 실제 Ollama 모델 응답·한국어 설명 품질·GPU/메모리 성능 미검증. Ollama endpoint 응답 없음, 설치/모델 다운로드 미수행. AI mock 성공은 실제 모델 성공이 아닙니다.
- 실제 AI 25초 지연 timeout은 미검증. 브라우저 요청 취소/모의 지연과 Worker timeout은 검증했습니다.
- API 요청 제한/크기 schema는 구현됐으나 모든 경계값의 통합 테스트는 아직 없습니다.
- screen reader 수동 검사, 시스템 고대비 모드는 미검증. 공통 스타일과 결과 표는 구현했지만 모든 UI를 독립 React 디자인 시스템 컴포넌트로 추출하는 작업은 후속 정리입니다.
- 학습 기록 영구 저장과 데이터 편집은 미구현입니다. 공개 배포/GitHub 등록은 수행하지 않았습니다.
