# 작성·실행 검증한 별도 학습 예시30개

채점 사례와 분리된 개념 관찰 예시입니다. 예시 쿼리는 본문 문제 정답을 자동 공개하는 용도가 아니며 임의 사용자 SQL의 원인 설명도 아닙니다. 실제검증:qa-learning-examples-summary.json / qa-learning-examples-results.json. 본문 SQL의 별도실행은정답판정과분리됩니다.

## completed
주문이 없어도 고객 행은 하나 남습니다. COUNT(*)는 그 행을 세고, 주문 ID를 세면 0입니다. 이 쿼리는 두 COUNT를 비교하는 개념 예시이며 문제의 전체 정답은 아닙니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (91,'미나');
```
### 개념 관찰 쿼리
```sql
SELECT c.id,COUNT(*) AS 보존된행,COUNT(o.id) AS 실제주문 FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    1,
    0
  ]
]
```

## revenue
주문 ID 901과902는 서로 다른 주문이고 금액만100으로 같습니다. SUM은200, SUM(DISTINCT)는 금액값 하나만 합쳐100입니다. 이 사실을 임의 사용자 SQL의 원인이라고 단정하지 않습니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (91,'미나');
INSERT INTO orders VALUES (901,91,'completed',100),(902,91,'completed',100);
INSERT INTO items VALUES (1,901,'펜'),(2,902,'책');
```
### 개념 관찰 쿼리
```sql
SELECT SUM(amount) AS 모든금액,SUM(DISTINCT amount) AS 서로다른금액 FROM orders
```
### 수동으로 검토한 기대 결과
```json
[
  [
    200,
    100
  ]
]
```

## never
NULL 고객 참조는 어느 고객도 식별하지 않습니다. 첫 비교는 UNKNOWN(NULL), 빈 식별자 집합과 비교한 두 번째는 참(1)입니다. 이는 비교 원리를 보여주는 예시입니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (91,'미나'),(92,'도윤');
INSERT INTO orders VALUES (901,NULL,'completed',100);
```
### 개념 관찰 쿼리
```sql
SELECT 91 NOT IN(SELECT customer_id FROM orders) AS NULL포함비교,91 NOT IN(SELECT customer_id FROM orders WHERE customer_id IS NOT NULL) AS NULL제외비교
```
### 수동으로 검토한 기대 결과
```json
[
  [
    null,
    1
  ]
]
```

## pending-orders
같은 금액이어도 pending만 대기입니다. cancelled가 completed와 다르다는 사실만으로 대기라고 볼 수 없습니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (901,91,'pending',10),(902,91,'cancelled',10);
```
### 개념 관찰 쿼리
```sql
SELECT status,status='pending' AS 대기여부 FROM orders
```
### 수동으로 검토한 기대 결과
```json
[
  [
    "pending",
    1
  ],
  [
    "cancelled",
    0
  ]
]
```

## amount-band
100은 두 조건을 모두 만족하고200은 끝 제외 조건을 만족하지 않습니다. 숫자 경계를 직접 대입해 비교합니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (901,91,'pending',100),(902,91,'pending',200);
```
### 개념 관찰 쿼리
```sql
SELECT amount,amount>=100 AS 시작포함,amount<200 AS 끝제외 FROM orders
```
### 수동으로 검토한 기대 결과
```json
[
  [
    100,
    1,
    1
  ],
  [
    200,
    1,
    0
  ]
]
```

## unassigned-orders
NULL과의 등호 비교는 참이 되지 않습니다. IS NULL은 NULL만 찾고 숫자0은 포함하지 않습니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (901,NULL,'pending',10),(902,0,'pending',10);
```
### 개념 관찰 쿼리
```sql
SELECT customer_id,customer_id=NULL AS 등호비교,customer_id IS NULL AS NULL검사 FROM orders
```
### 수동으로 검토한 기대 결과
```json
[
  [
    null,
    null,
    1
  ],
  [
    0,
    null,
    0
  ]
]
```

## sale-products
판매중이 아닌 B상품91은 괄호 없는 조건에서는 참이 됩니다. A/B 전체를 판매중 조건과 묶는지 살펴보세요.
### 별도 입력 데이터
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,active INTEGER NOT NULL,category TEXT NOT NULL);INSERT INTO products VALUES (91,0,'B'),(92,1,'A');
```
### 개념 관찰 쿼리
```sql
SELECT id,active=1 AND(category='A' OR category='B') AS 묶은조건,active=1 AND category='A' OR category='B' AS 안묶은조건 FROM products
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    0,
    1
  ],
  [
    92,
    1,
    1
  ]
]
```

## registration-window
종료 시각과 같은 신청92는 끝을 제외하면 빠지고 포함하면 남습니다. 인접한 기간의 경계를 중복 세지 않도록 구간 계약을 확인합니다.
### 별도 입력 데이터
```sql
CREATE TABLE registrations(id INTEGER PRIMARY KEY,at TEXT NOT NULL);INSERT INTO registrations VALUES (91,'2026-01-31 23:59:59'),(92,'2026-02-01 00:00:00');
```
### 개념 관찰 쿼리
```sql
SELECT id,at<'2026-02-01 00:00:00' AS 끝제외,at<='2026-02-01 00:00:00' AS 끝포함 FROM registrations
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    1,
    1
  ],
  [
    92,
    0,
    1
  ]
]
```

## missing-contact
NULL, 빈 문자열, 공백 한 칸은 세 가지 값입니다. NULL 검사와 빈 문자열 검사는 서로 다른 행을 찾습니다.
### 별도 입력 데이터
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (91,NULL),(92,''),(93,' ');
```
### 개념 관찰 쿼리
```sql
SELECT id,email,email IS NULL AS NULL여부,email='' AS 빈문자열여부 FROM members
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    null,
    1,
    null
  ],
  [
    92,
    "",
    0,
    1
  ],
  [
    93,
    " ",
    0,
    0
  ]
]
```

## unique-buyers
주문은 두 건이지만 고객은91 한 명입니다. 출력 단위가 주문인지 고객인지에 따라 중복을 보존하거나 제거합니다.
### 별도 입력 데이터
```sql
CREATE TABLE purchases(id INTEGER PRIMARY KEY,customer_id INTEGER);INSERT INTO purchases VALUES (901,91),(902,91);
```
### 개념 관찰 쿼리
```sql
SELECT COUNT(*) AS 주문수,COUNT(DISTINCT customer_id) AS 고객종류 FROM purchases
```
### 수동으로 검토한 기대 결과
```json
[
  [
    2,
    1
  ]
]
```

## registered-contact-count
회원3명, NULL이 아닌 연락처2개, 연락처 값 종류1개입니다. 세 COUNT가 서로 다른 질문에 답합니다.
### 별도 입력 데이터
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (91,'x'),(92,'x'),(93,NULL);
```
### 개념 관찰 쿼리
```sql
SELECT COUNT(*) AS 회원수,COUNT(email) AS 등록값수,COUNT(DISTINCT email) AS 값종류 FROM members
```
### 수동으로 검토한 기대 결과
```json
[
  [
    3,
    2,
    1
  ]
]
```

## score-grade
CASE는 처음 참인 분기에서 멈춥니다. 90점은 >=80도 만족하므로 넓은 조건을 먼저 두면 B가 됩니다.
### 별도 입력 데이터
```sql
CREATE TABLE scores(id INTEGER PRIMARY KEY,score INTEGER NOT NULL);INSERT INTO scores VALUES (91,90);
```
### 개념 관찰 쿼리
```sql
SELECT score,CASE WHEN score>=80 THEN 'B' WHEN score>=90 THEN 'A' ELSE 'C' END AS 넓은조건먼저,CASE WHEN score>=90 THEN 'A' WHEN score>=80 THEN 'B' ELSE 'C' END AS 좁은조건먼저 FROM scores
```
### 수동으로 검토한 기대 결과
```json
[
  [
    90,
    "B",
    "A"
  ]
]
```

## conditional-member-count
COUNT는 숫자0도 값으로 세고 NULL만 제외합니다. ELSE0을 넣은 비교는 비활성 행까지 세어2가 됩니다.
### 별도 입력 데이터
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,active INTEGER NOT NULL);INSERT INTO members VALUES (91,1),(92,0);
```
### 개념 관찰 쿼리
```sql
SELECT COUNT(CASE WHEN active=1 THEN 1 ELSE 0 END) AS 영도세기,COUNT(CASE WHEN active=1 THEN 1 END) AS NULL제외 FROM members
```
### 수동으로 검토한 기대 결과
```json
[
  [
    2,
    1
  ]
]
```

## qualifying-order
완료 주문과 큰 주문이 각각 있지만 두 조건을 동시에 만족하는 한 주문은 없습니다. 같은 행에 조건이 적용되는지 확인합니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,status TEXT NOT NULL,amount INTEGER NOT NULL);INSERT INTO customers VALUES (91);
INSERT INTO orders VALUES (901,91,'done',50),(902,91,'pending',200);
```
### 개념 관찰 쿼리
```sql
SELECT id,status='done' AS 완료,amount>=100 AS 큰주문,status='done' AND amount>=100 AS 둘다 FROM orders
```
### 수동으로 검토한 기대 결과
```json
[
  [
    901,
    1,
    0,
    0
  ],
  [
    902,
    0,
    1,
    0
  ]
]
```

## store-product-units
매장 합계5에는 두 상품의 수량2와3이 섞여 있습니다. 매장 전체 합계와 매장·상품 조합의 합계는 다른 집계 단위입니다.
### 별도 입력 데이터
```sql
CREATE TABLE sales(id INTEGER PRIMARY KEY,store_id INTEGER NOT NULL,product_id INTEGER NOT NULL,qty INTEGER NOT NULL);INSERT INTO sales VALUES (901,91,10,2),(902,91,20,3);
```
### 개념 관찰 쿼리
```sql
SELECT store_id,COUNT(DISTINCT product_id) AS 상품종류,SUM(qty) AS 매장전체수량 FROM sales GROUP BY store_id
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    2,
    5
  ]
]
```

## department-top-salary
최고급여 값100은 하나지만 그 급여를 받는 직원은91과92 두 명입니다. 최고값 한 개를 구한 것과 해당 직원들을 구한 것은 다릅니다.
### 별도 입력 데이터
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,dept INTEGER NOT NULL,salary INTEGER NOT NULL);INSERT INTO employees VALUES (91,7,100),(92,7,100),(93,7,50);
```
### 개념 관찰 쿼리
```sql
SELECT dept,MAX(salary) AS 최고급여,COUNT(*) AS 직원수 FROM employees GROUP BY dept
```
### 수동으로 검토한 기대 결과
```json
[
  [
    7,
    100,
    3
  ]
]
```

## latest-customer-order
최대ID901과 최근날짜2026-02-01은 서로 다른 주문에서 나옵니다. 각 열의 최대값을 합쳤다고 실제 주문 한 행이 되지는 않습니다.
### 별도 입력 데이터
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO orders VALUES (901,91,'2026-01-01'),(202,91,'2026-02-01');
```
### 개념 관찰 쿼리
```sql
SELECT MAX(id) AS 최대ID,MAX(at) AS 최근날짜 FROM orders
```
### 수동으로 검토한 기대 결과
```json
[
  [
    901,
    "2026-02-01"
  ]
]
```

## no-return-order
상품902가 미반품이어도 같은 주문의 상품901이 반품됐습니다. 상품 한 행의 상태와 주문 전체의 반품 유무를 구분합니다.
### 별도 입력 데이터
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY);
CREATE TABLE lines(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL);
CREATE TABLE returns(line_id INTEGER NOT NULL);INSERT INTO orders VALUES (91);
INSERT INTO lines VALUES (901,91),(902,91);
INSERT INTO returns VALUES (901);
```
### 개념 관찰 쿼리
```sql
SELECT l.id,EXISTS(SELECT 1 FROM returns r WHERE r.line_id=l.id) AS 반품됨 FROM lines l
```
### 수동으로 검토한 기대 결과
```json
[
  [
    901,
    1
  ],
  [
    902,
    0
  ]
]
```

## colleague-pairs
두 사람을 자기조인하면 자기 자신 두 행과 대칭 두 행이 생깁니다. 한 동료 쌍만 원한다면 두 종류의 중복을 구분해야 합니다.
### 별도 입력 데이터
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,team INTEGER NOT NULL);INSERT INTO employees VALUES (91,7),(93,7);
```
### 개념 관찰 쿼리
```sql
SELECT a.id AS 왼쪽,b.id AS 오른쪽 FROM employees a JOIN employees b ON a.team=b.team
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    91
  ],
  [
    91,
    93
  ],
  [
    93,
    91
  ],
  [
    93,
    93
  ]
]
```

## above-average-orders
주문1건을 전체 고객2명으로 나눈 평균은0.5입니다. 무주문 고객을 분모에서 빼면 평균이1로 바뀝니다.
### 별도 입력 데이터
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL);INSERT INTO customers VALUES (91),(92);
INSERT INTO orders VALUES (901,91);
```
### 개념 관찰 쿼리
```sql
SELECT COUNT(DISTINCT c.id) AS 고객수,COUNT(o.id) AS 주문수,CAST(COUNT(o.id) AS REAL)/COUNT(DISTINCT c.id) AS 평균 FROM customers c LEFT JOIN orders o ON o.customer_id=c.id
```
### 수동으로 검토한 기대 결과
```json
[
  [
    2,
    1,
    0.5
  ]
]
```

## branch-transactions
같은100원이어도 서로 다른 지점의 별도 거래입니다. 값만 합친 UNION은1행, 중복을 보존한 UNION ALL은2행입니다.
### 별도 입력 데이터
```sql
CREATE TABLE north(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
CREATE TABLE south(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);INSERT INTO north VALUES (91,100);
INSERT INTO south VALUES (92,100);
```
### 개념 관찰 쿼리
```sql
SELECT 'UNION' AS 방식,COUNT(*) AS 행수 FROM(SELECT amount FROM north UNION SELECT amount FROM south) UNION ALL SELECT 'UNION ALL',COUNT(*) FROM(SELECT amount FROM north UNION ALL SELECT amount FROM south)
```
### 수동으로 검토한 기대 결과
```json
[
  [
    "UNION",
    1
  ],
  [
    "UNION ALL",
    2
  ]
]
```

## all-required-courses
수료 행은2개지만 모두 과목10입니다. 필수 과목20은 빠져 있어 행 수와 필수 과목 수가 같아도 모두 수료한 것은 아닙니다.
### 별도 입력 데이터
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE required(course INTEGER PRIMARY KEY);
CREATE TABLE completed(member_id INTEGER NOT NULL,course INTEGER NOT NULL);INSERT INTO members VALUES (91);
INSERT INTO required VALUES (10),(20);
INSERT INTO completed VALUES (91,10),(91,10);
```
### 개념 관찰 쿼리
```sql
SELECT COUNT(*) AS 수료행수,COUNT(DISTINCT course) AS 수료종류,(SELECT COUNT(*) FROM required) AS 필수종류 FROM completed
```
### 수동으로 검토한 기대 결과
```json
[
  [
    2,
    1,
    2
  ]
]
```

## allowed-features-only
허용된 read 사용이 있어도 금지된 delete 사용이 함께 있습니다. 허용 사용의 존재와 금지 사용의 부재는 다른 조건입니다.
### 별도 입력 데이터
```sql
CREATE TABLE accounts(id INTEGER PRIMARY KEY);
CREATE TABLE allowed(feature TEXT PRIMARY KEY);
CREATE TABLE usage(account_id INTEGER NOT NULL,feature TEXT NOT NULL);INSERT INTO accounts VALUES (91);
INSERT INTO allowed VALUES ('read');
INSERT INTO usage VALUES (91,'read'),(91,'delete');
```
### 개념 관찰 쿼리
```sql
SELECT u.feature,EXISTS(SELECT 1 FROM allowed a WHERE a.feature=u.feature) AS 허용됨 FROM usage u
```
### 수동으로 검토한 기대 결과
```json
[
  [
    "read",
    1
  ],
  [
    "delete",
    0
  ]
]
```

## top-two-price-levels
동률100 두 행 뒤에서 RANK는3, DENSE_RANK는2가 됩니다. 행 두 개와 가격대 두 개를 구분하는 예시입니다.
### 별도 입력 데이터
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,category INTEGER NOT NULL,price INTEGER NOT NULL);INSERT INTO products VALUES (91,7,100),(92,7,100),(93,7,90),(94,7,80);
```
### 개념 관찰 쿼리
```sql
SELECT id,price,ROW_NUMBER() OVER(PARTITION BY category ORDER BY price DESC,id) AS 행번호,RANK() OVER(PARTITION BY category ORDER BY price DESC) AS 순위,DENSE_RANK() OVER(PARTITION BY category ORDER BY price DESC) AS 가격대 FROM products
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    100,
    1,
    1,
    1
  ],
  [
    92,
    100,
    2,
    1,
    1
  ],
  [
    93,
    90,
    3,
    3,
    2
  ],
  [
    94,
    80,
    4,
    4,
    3
  ]
]
```

## running-balance
같은 시각의 두 거래를 기본 RANGE는 함께 합쳐 첫 행에도80을 보여줍니다. ID로 순서를 정한 ROWS는 첫 거래 직후100, 다음80을 보여줍니다.
### 별도 입력 데이터
```sql
CREATE TABLE transactions(id INTEGER PRIMARY KEY,account INTEGER NOT NULL,at TEXT NOT NULL,delta INTEGER NOT NULL);INSERT INTO transactions VALUES (91,7,'2026-01-01',100),(92,7,'2026-01-01',-20);
```
### 개념 관찰 쿼리
```sql
SELECT id,SUM(delta) OVER(PARTITION BY account ORDER BY at) AS 기본범위,SUM(delta) OVER(PARTITION BY account ORDER BY at,id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS 거래별범위 FROM transactions
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    80,
    100
  ],
  [
    92,
    80,
    80
  ]
]
```

## device-increase
장치8의 첫 기록에 전체 LAG는 다른 장치7의10을 붙입니다. 장치별 LAG에서는 두 기록 모두 자기 장치의 첫 행이라 직전 값이 없습니다.
### 별도 입력 데이터
```sql
CREATE TABLE readings(id INTEGER PRIMARY KEY,device INTEGER NOT NULL,seq INTEGER NOT NULL,value INTEGER NOT NULL);INSERT INTO readings VALUES (91,7,1,10),(92,8,2,20);
```
### 개념 관찰 쿼리
```sql
SELECT id,LAG(value) OVER(ORDER BY seq) AS 전체직전,LAG(value) OVER(PARTITION BY device ORDER BY seq) AS 장치직전 FROM readings
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    null,
    null
  ],
  [
    92,
    10,
    null
  ]
]
```

## three-day-visits
같은 날 세 번 방문해도 방문한 날은 하루입니다. 횟수와 서로 다른 날 수, 그리고 연속성은 각각 다른 조건입니다.
### 별도 입력 데이터
```sql
CREATE TABLE visits(member_id INTEGER NOT NULL,day TEXT NOT NULL);INSERT INTO visits VALUES (91,'2026-01-01'),(91,'2026-01-01'),(91,'2026-01-01');
```
### 개념 관찰 쿼리
```sql
SELECT COUNT(*) AS 방문횟수,COUNT(DISTINCT day) AS 방문한날수 FROM visits
```
### 수동으로 검토한 기대 결과
```json
[
  [
    3,
    1
  ]
]
```

## login-sessions
정확히30분은1800초이고 시간 경계를 넘은10:59→11:01은120초뿐입니다. 시각의 시간 숫자보다 실제 간격을 비교합니다.
### 별도 입력 데이터
```sql
CREATE TABLE logins(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO logins VALUES (91,7,'2026-01-01 10:29:00'),(92,7,'2026-01-01 10:59:00'),(93,7,'2026-01-01 11:01:00');
```
### 개념 관찰 쿼리
```sql
WITH x AS(SELECT id,at,LAG(at) OVER(PARTITION BY member_id ORDER BY at,id) prev FROM logins) SELECT id,unixepoch(at)-unixepoch(prev) AS 직전과초차이 FROM x
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    null
  ],
  [
    92,
    1800
  ],
  [
    93,
    120
  ]
]
```

## overlapping-reservations
91과92는 끝점에서 접하기만 하므로 겹치지 않습니다. 93은91 안에 포함되어 실제로 겹칩니다. 구간은 끝을 제외합니다.
### 별도 입력 데이터
```sql
CREATE TABLE bookings(id INTEGER PRIMARY KEY,room INTEGER NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL);INSERT INTO bookings VALUES (91,7,'10:00','11:00'),(92,7,'11:00','12:00'),(93,7,'10:30','10:45');
```
### 개념 관찰 쿼리
```sql
SELECT b.id,a.start<b.end AND b.start<a.end AS 겹침 FROM bookings a JOIN bookings b ON a.room=b.room AND a.id=91 AND b.id<>a.id
```
### 수동으로 검토한 기대 결과
```json
[
  [
    92,
    0
  ],
  [
    93,
    1
  ]
]
```

## organization-descendants
직접 자식 조회는91만 보여주고 손자92와 그 아래93은 보이지 않습니다. 표에 존재하는 후손과 직접 자식 조건을 구분합니다.
### 별도 입력 데이터
```sql
CREATE TABLE orgs(id INTEGER PRIMARY KEY,parent_id INTEGER);INSERT INTO orgs VALUES (1,NULL),(91,1),(92,91),(93,92);
```
### 개념 관찰 쿼리
```sql
SELECT id,parent_id FROM orgs WHERE parent_id=1
```
### 수동으로 검토한 기대 결과
```json
[
  [
    91,
    1
  ]
]
```
