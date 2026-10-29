# 콘텐츠 검증 현황

작성·공개·검증 완료 **30/30**. 초급10·중급10·고급10이며 난이도는 교육적 추정입니다. 선행문제 잠금은 없습니다.

| ID | 난이도 | 업무 목표 | 검사 | 의미적 오답 | 학습 예시 |
| --- | --- | --- | --- | --- | --- |
| completed | 중급 | 모든 고객의 완료 주문 수 | 5 | 2 | 1 |
| revenue | 중급 | 고객별 주문 매출 합계 | 5 | 2 | 1 |
| never | 고급 | 구매 이력이 없는 고객 | 5 | 2 | 1 |
| pending-orders | 초급 | 처리 대기 주문 찾기 | 5 | 2 | 1 |
| amount-band | 초급 | 금액 구간에 해당하는 주문 | 5 | 2 | 1 |
| unassigned-orders | 초급 | 고객 미지정 주문 찾기 | 5 | 2 | 1 |
| sale-products | 초급 | 판매 가능한 추천 상품 | 5 | 2 | 1 |
| registration-window | 초급 | 기간 내 신청 목록 | 5 | 2 | 1 |
| missing-contact | 초급 | 연락처 없는 회원 | 5 | 2 | 1 |
| unique-buyers | 초급 | 구매 고객 목록 | 5 | 2 | 1 |
| registered-contact-count | 초급 | 연락처 등록 회원 수 | 5 | 2 | 1 |
| score-grade | 초급 | 점수별 등급 | 5 | 2 | 1 |
| conditional-member-count | 초급 | 활성 회원 수 | 5 | 2 | 1 |
| qualifying-order | 중급 | 조건을 만족하는 주문이 있는 고객 | 5 | 2 | 1 |
| store-product-units | 중급 | 매장별 상품 판매량 | 5 | 2 | 1 |
| department-top-salary | 중급 | 부서 최고 급여 직원 모두 | 5 | 2 | 1 |
| latest-customer-order | 중급 | 고객별 최근 주문 | 5 | 2 | 1 |
| no-return-order | 중급 | 반품 없는 주문 | 5 | 2 | 1 |
| colleague-pairs | 중급 | 같은 팀 동료 쌍 | 5 | 2 | 1 |
| above-average-orders | 중급 | 평균보다 주문이 많은 고객 | 5 | 2 | 1 |
| branch-transactions | 중급 | 두 지점 판매 내역 합치기 | 5 | 2 | 1 |
| all-required-courses | 고급 | 필수 과목 모두 수료한 회원 | 5 | 2 | 1 |
| allowed-features-only | 고급 | 허용 기능만 쓰는 계정 | 5 | 2 | 1 |
| top-two-price-levels | 고급 | 카테고리별 상위 두 가격대 | 5 | 2 | 1 |
| running-balance | 고급 | 거래 직후 누적 잔액 | 5 | 2 | 1 |
| device-increase | 고급 | 직전 값보다 증가한 기록 | 5 | 2 | 1 |
| three-day-visits | 고급 | 사흘 연속 방문한 회원 | 5 | 2 | 1 |
| login-sessions | 고급 | 회원별 접속 세션 수 | 5 | 2 | 1 |
| overlapping-reservations | 고급 | 겹치는 예약 쌍 | 5 | 2 | 1 |
| organization-descendants | 고급 | 하위 조직 전체 | 5 | 2 | 1 |

정답150사례, 대표/부분수정 오답60개를 실제 SQLite WASM Worker에서 검사합니다. 대표 사례2는SQL과별개로검토한기대행30개와대조합니다. 증거:qa-content-summary.json과qa-content-results.json. 오답은문법/권한오류가아닌결과불일치여야통과한검증으로셉니다.

전체 계약·스키마·정답·오답·힌트·데이터는 CONTENT-CATALOG.md, 사용자QA는QA.md, AI품질은AI-VALIDATION.md를보세요.
