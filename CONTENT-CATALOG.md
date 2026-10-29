# 문제별 검토 자료

## completed · 모든 고객의 완료 주문 수
난이도:중급(교육적추정), 상태:검증완료
고객 ID, 완료 주문 수를 반환하세요. 완료 주문이 없는 고객도 0으로 포함합니다.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
### 기준 SQL
```sql
SELECT c.id, COUNT(o.id) FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='completed' GROUP BY c.id
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT c.id, COUNT(o.id) FROM customers c LEFT JOIN orders o ON o.customer_id=c.id WHERE o.status='completed' GROUP BY c.id
```
오답2
```sql
SELECT c.id,COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id=c.id AND o.status='completed' GROUP BY c.id
```
### 단계별 힌트
1. 고객을 모두 보존해야 합니다.
2. WHERE는 조인이 끝난 결과를 필터링합니다. 완료 조건의 위치를 살펴보세요.
3. COUNT(*)는 주문이 없는 고객의 보존된 행도 셉니다. 주문 ID를 세어 보세요.
### 기본 해설
관측: 아래 누락/추가 행이 기준 결과와 다릅니다. 가능한 원인: WHERE의 주문 조건이 외부 조인에서 보존한 고객을 제거하거나 COUNT(*)가 빈 주문 행을 셀 수 있습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람');INSERT INTO orders VALUES (1,1,'completed',100);
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,1,'pending',100);
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,1,'completed',100),(2,1,'pending',200),(3,2,'completed',100);
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,NULL,'completed',100),(2,1,'completed',100),(3,1,'completed',100);
```

## revenue · 고객별 주문 매출 합계
난이도:중급(교육적추정), 상태:검증완료
고객 ID, 전체 주문 금액 합계를 반환하세요. 상품 수와 관계없이 주문마다 한 번만 집계하고 주문 없는 고객은 0입니다. 금액은 정수입니다.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
### 기준 SQL
```sql
SELECT c.id, COALESCE(SUM(o.amount),0) FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT c.id, COALESCE(SUM(o.amount),0) FROM customers c LEFT JOIN orders o ON o.customer_id=c.id LEFT JOIN items i ON i.order_id=o.id GROUP BY c.id
```
오답2
```sql
SELECT c.id,COALESCE(SUM(DISTINCT o.amount),0) FROM customers c LEFT JOIN orders o ON o.customer_id=c.id LEFT JOIN items i ON i.order_id=o.id GROUP BY c.id
```
### 단계별 힌트
1. 집계 단위는 상품이 아니라 주문입니다.
2. 상품을 JOIN하면 주문 행이 여러 번 나타날 수 있습니다.
3. SUM(DISTINCT amount)는 금액이 같은 서로 다른 주문까지 합칩니다.
### 기본 해설
가능한 원인: 상품 조인으로 주문 금액이 반복되었거나 SUM(DISTINCT)가 같은 금액의 다른 주문을 제거했을 수 있습니다. 아래 실제 결과 차이를 확인하세요.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람');INSERT INTO orders VALUES (1,1,'completed',100);INSERT INTO items VALUES (1,1,'책');
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,1,'completed',100);INSERT INTO items VALUES (1,1,'책'),(2,1,'펜');
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,1,'completed',100),(2,1,'completed',100);INSERT INTO items VALUES (1,1,'책'),(2,2,'펜');
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,2,'pending',0),(2,2,'completed',200);
```

## never · 구매 이력이 없는 고객
난이도:고급(교육적추정), 상태:검증완료
주문에 한 번도 연결되지 않은 고객 ID를 반환하세요. 상태에 관계없이 주문은 구매 이력입니다. customer_id NULL은 고객을 식별할 수 없는 주문이며 특정 고객의 구매 이력이 아닙니다.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
### 기준 SQL
```sql
SELECT c.id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id)
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)
```
오답2
```sql
SELECT id FROM customers WHERE id NOT IN(SELECT customer_id FROM orders WHERE customer_id IS NOT NULL AND status='completed')
```
### 단계별 힌트
1. 주문에 고객 참조가 NULL인 경우를 확인하세요.
2. NULL과의 비교는 참/거짓 대신 알 수 없음이 됩니다.
3. 고객별로 일치하는 주문의 존재 여부를 물어보세요.
### 기본 해설
가능한 원인: NOT IN의 하위 결과에 NULL이 있으면 비교 결과가 알 수 없음이 되어 고객이 제거될 수 있습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,1,'completed',100);
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,NULL,'completed',100);
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,1,'completed',100),(2,1,'pending',100),(3,2,'pending',100);
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO customers VALUES (1,'가람'),(2,'나래'),(3,'다온');INSERT INTO orders VALUES (1,1,'completed',100),(2,2,'completed',100),(3,3,'completed',100);
```

## pending-orders · 처리 대기 주문 찾기
난이도:초급(교육적추정), 상태:검증완료
status가 pending인 주문의 ID와 금액을 반환하세요. completed와 NULL 상태는 포함하지 않습니다.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
### 기준 SQL
```sql
SELECT id, amount FROM orders WHERE status='pending'
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id, amount FROM orders
```
오답2
```sql
SELECT id,amount FROM orders WHERE status<>'completed'
```
### 단계별 힌트
1. 상태가 pending인 행만 필요합니다.
2. WHERE로 행을 고릅니다.
3. NULL 상태는 pending과 같지 않습니다.
### 기본 해설
가능한 원인: 상태 조건을 빠뜨렸을 수 있습니다. 실제 추가 행의 status를 데이터 표에서 확인하세요.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,1,'pending',100);
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,1,'pending',100),(2,1,'completed',100);
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,NULL,NULL,200);
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,1,'pending',0),(2,2,'pending',0),(3,3,'completed',300),(4,1,'cancelled',50);
```

## amount-band · 금액 구간에 해당하는 주문
난이도:초급(교육적추정), 상태:검증완료
금액이 100 이상 200 미만인 주문의 ID와 금액을 반환하세요. 금액은 정수이며 상태는 관계없습니다.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
### 기준 SQL
```sql
SELECT id, amount FROM orders WHERE amount>=100 AND amount<200
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id, amount FROM orders WHERE amount>100 AND amount<=200
```
오답2
```sql
SELECT id,amount FROM orders WHERE amount BETWEEN 100 AND 200
```
### 단계별 힌트
1. 시작은 포함하고 끝은 제외합니다.
2. 100과 200을 각각 대입해 보세요.
3. 두 조건은 AND로 결합합니다.
### 기본 해설
가능한 원인: 구간 경계의 포함 여부가 요구와 다를 수 있습니다. 100은 포함하고 200은 제외해야 합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,1,'pending',150);
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,1,'pending',100),(2,2,'completed',200);
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,1,'pending',99),(2,1,'pending',199),(3,1,'pending',201);
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,NULL,NULL,100),(2,NULL,NULL,100),(3,1,'pending',0);
```

## unassigned-orders · 고객 미지정 주문 찾기
난이도:초급(교육적추정), 상태:검증완료
customer_id가 NULL인 주문 ID를 반환하세요. NULL은 식별할 수 없는 고객 참조이며 숫자0은 NULL이 아닙니다.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
### 기준 SQL
```sql
SELECT id FROM orders WHERE customer_id IS NULL
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id FROM orders WHERE customer_id = NULL
```
오답2
```sql
SELECT id FROM orders WHERE COALESCE(customer_id,0)=0
```
### 단계별 힌트
1. NULL은 일반 값과 다릅니다.
2. = NULL 비교는 참이 되지 않습니다.
3. NULL 검사에는 IS NULL을 사용합니다.
### 기본 해설
가능한 원인: = NULL은 참 대신 알 수 없음을 반환해 WHERE를 통과하지 못합니다. 숫자0이나 빈 문자열과도 구분해야 합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,1,'completed',100);
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,NULL,'completed',100);
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,0,'pending',100),(2,NULL,'pending',0);
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, amount INTEGER NOT NULL);
CREATE TABLE items(id INTEGER PRIMARY KEY, order_id INTEGER, name TEXT);INSERT INTO orders VALUES (1,NULL,NULL,100),(2,NULL,'pending',200),(3,3,'completed',300),(4,1,'cancelled',50);
```

## sale-products · 판매 가능한 추천 상품
난이도:초급(교육적추정), 상태:검증완료
판매중(active=1)이며 category가 A 또는 B인 상품 ID를 반환하세요. active는0/1, category는NULL이 아닙니다.

### 스키마
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,active INTEGER NOT NULL,category TEXT NOT NULL);
```
### 기준 SQL
```sql
SELECT id FROM products WHERE active=1 AND category IN ('A','B')
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id FROM products WHERE active=1 AND category='A' OR category='B'
```
오답2
```sql
SELECT id FROM products WHERE category IN ('A','B')
```
### 단계별 힌트
1. 판매 여부와 분류를 모두 확인합니다.
2. AND는 OR보다 먼저 계산됩니다.
3. A/B 조건을 괄호 또는 IN으로 묶습니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. A 또는 B 조건 전체가 판매중 조건과 결합되어야 합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,active INTEGER NOT NULL,category TEXT NOT NULL);INSERT INTO products VALUES (1,1,'A');
```
사례2
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,active INTEGER NOT NULL,category TEXT NOT NULL);INSERT INTO products VALUES (1,0,'B'),(2,1,'A');
```
사례3
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,active INTEGER NOT NULL,category TEXT NOT NULL);INSERT INTO products VALUES (1,0,'A'),(2,1,'C'),(3,1,'B');
```
사례4
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,active INTEGER NOT NULL,category TEXT NOT NULL);
```
사례5
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,active INTEGER NOT NULL,category TEXT NOT NULL);INSERT INTO products VALUES (1,1,'A'),(2,1,'B'),(3,0,'B');
```

## registration-window · 기간 내 신청 목록
난이도:초급(교육적추정), 상태:검증완료
2026-01-01 00:00:00 이상 2026-02-01 00:00:00 미만의 신청 ID를 반환하세요. at는UTC의 고정길이 ISO 날짜시간 텍스트이며 NULL이 없습니다.

### 스키마
```sql
CREATE TABLE registrations(id INTEGER PRIMARY KEY,at TEXT NOT NULL);
```
### 기준 SQL
```sql
SELECT id FROM registrations WHERE at>='2026-01-01 00:00:00' AND at<'2026-02-01 00:00:00'
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id FROM registrations WHERE at BETWEEN '2026-01-01 00:00:00' AND '2026-02-01 00:00:00'
```
오답2
```sql
SELECT id FROM registrations WHERE at>='2026-01-01 00:00:00'
```
### 단계별 힌트
1. 시작은 포함하고 끝은 제외합니다.
2. BETWEEN은 양끝을 포함합니다.
3. >= 시작 AND < 끝으로 표현합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 기간을 반개구간으로 정의하면 인접한 다음 기간의 경계가 중복되지 않습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE registrations(id INTEGER PRIMARY KEY,at TEXT NOT NULL);INSERT INTO registrations VALUES (1,'2026-01-15 12:00:00');
```
사례2
```sql
CREATE TABLE registrations(id INTEGER PRIMARY KEY,at TEXT NOT NULL);INSERT INTO registrations VALUES (1,'2026-01-01 00:00:00'),(2,'2026-02-01 00:00:00');
```
사례3
```sql
CREATE TABLE registrations(id INTEGER PRIMARY KEY,at TEXT NOT NULL);INSERT INTO registrations VALUES (1,'2025-12-31 23:59:59'),(2,'2026-01-31 23:59:59');
```
사례4
```sql
CREATE TABLE registrations(id INTEGER PRIMARY KEY,at TEXT NOT NULL);
```
사례5
```sql
CREATE TABLE registrations(id INTEGER PRIMARY KEY,at TEXT NOT NULL);INSERT INTO registrations VALUES (1,'2026-03-01 00:00:00');
```

## missing-contact · 연락처 없는 회원
난이도:초급(교육적추정), 상태:검증완료
email이NULL 또는 빈문자열인 회원 ID를 반환하세요. 공백문자열은 등록된 값으로 간주합니다.

### 스키마
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);
```
### 기준 SQL
```sql
SELECT id FROM members WHERE email IS NULL OR email=''
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id FROM members WHERE email IS NULL
```
오답2
```sql
SELECT id FROM members WHERE email=''
```
### 단계별 힌트
1. 미등록 상태는 두 종류입니다.
2. NULL과 빈문자열은 다릅니다.
3. IS NULL과 빈문자열 비교를 OR로 합칩니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. NULL 검사만으로 빈문자열을 찾을 수 없고, 빈문자열 비교만으로NULL을 찾을 수 없습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,'a@b');
```
사례2
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,NULL),(2,'');
```
사례3
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,' '),(2,'x');
```
사례4
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);
```
사례5
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,''),(2,NULL),(3,'z');
```

## unique-buyers · 구매 고객 목록
난이도:초급(교육적추정), 상태:검증완료
주문에서 식별 가능한 고객 ID를 한 번씩 반환하세요. NULL참조는 제외하며 주문상태는 관계없습니다.

### 스키마
```sql
CREATE TABLE purchases(id INTEGER PRIMARY KEY,customer_id INTEGER);
```
### 기준 SQL
```sql
SELECT DISTINCT customer_id FROM purchases WHERE customer_id IS NOT NULL
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT customer_id FROM purchases WHERE customer_id IS NOT NULL
```
오답2
```sql
SELECT customer_id FROM purchases GROUP BY customer_id
```
### 단계별 힌트
1. 출력 단위는 주문이 아니라 고객입니다.
2. 같은 고객의 여러 주문을 합칩니다.
3. 중복 제거와 NULL제외는 별개입니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. DISTINCT 또는 그룹화로 고객 중복을 제거해도 NULL참조 제외 조건은 필요합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE purchases(id INTEGER PRIMARY KEY,customer_id INTEGER);INSERT INTO purchases VALUES (1,7);
```
사례2
```sql
CREATE TABLE purchases(id INTEGER PRIMARY KEY,customer_id INTEGER);INSERT INTO purchases VALUES (1,7),(2,7);
```
사례3
```sql
CREATE TABLE purchases(id INTEGER PRIMARY KEY,customer_id INTEGER);INSERT INTO purchases VALUES (1,NULL),(2,8),(3,8);
```
사례4
```sql
CREATE TABLE purchases(id INTEGER PRIMARY KEY,customer_id INTEGER);
```
사례5
```sql
CREATE TABLE purchases(id INTEGER PRIMARY KEY,customer_id INTEGER);INSERT INTO purchases VALUES (1,0),(2,0),(3,9);
```

## registered-contact-count · 연락처 등록 회원 수
난이도:초급(교육적추정), 상태:검증완료
NULL이 아닌 email값을 가진 회원 수 한 행을 반환하세요. 빈문자열도 값으로 세며 빈테이블은0입니다.

### 스키마
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);
```
### 기준 SQL
```sql
SELECT COUNT(email) FROM members
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT COUNT(*) FROM members
```
오답2
```sql
SELECT COUNT(DISTINCT email) FROM members
```
### 단계별 힌트
1. 회원행과 등록된 값의 개수는 다릅니다.
2. COUNT(column)은NULL을 제외합니다.
3. 중복된 연락처를 가진 두 회원도 두 명입니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. COUNT(*)는NULL행도 세고 COUNT(DISTINCT email)은 같은값을 가진 여러 회원을 하나로 셉니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,'a');
```
사례2
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,NULL),(2,'a');
```
사례3
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,''),(2,NULL);
```
사례4
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);
```
사례5
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,email TEXT);INSERT INTO members VALUES (1,'a'),(2,'a'),(3,NULL);
```

## score-grade · 점수별 등급
난이도:초급(교육적추정), 상태:검증완료
회원ID와 grade를 반환하세요. score>=90은A, >=80은B, 나머지는C입니다. score는NULL없는0~100정수입니다.

### 스키마
```sql
CREATE TABLE scores(id INTEGER PRIMARY KEY,score INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT id,CASE WHEN score>=90 THEN 'A' WHEN score>=80 THEN 'B' ELSE 'C' END AS grade FROM scores
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id,CASE WHEN score>=80 THEN 'B' WHEN score>=90 THEN 'A' ELSE 'C' END FROM scores
```
오답2
```sql
SELECT id,CASE WHEN score>90 THEN 'A' WHEN score>80 THEN 'B' ELSE 'C' END FROM scores
```
### 단계별 힌트
1. CASE는 먼저 참인 분기를 선택합니다.
2. 더 좁은 높은점수 조건부터 확인합니다.
3. 90과80도 각 등급에 포함됩니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 조건 순서를 바꿔도 같은 뜻이 되는 것이 아니며 정확한 경계값도 검사해야 합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE scores(id INTEGER PRIMARY KEY,score INTEGER NOT NULL);INSERT INTO scores VALUES (1,85);
```
사례2
```sql
CREATE TABLE scores(id INTEGER PRIMARY KEY,score INTEGER NOT NULL);INSERT INTO scores VALUES (1,95),(2,90),(3,80);
```
사례3
```sql
CREATE TABLE scores(id INTEGER PRIMARY KEY,score INTEGER NOT NULL);INSERT INTO scores VALUES (1,79),(2,89),(3,100);
```
사례4
```sql
CREATE TABLE scores(id INTEGER PRIMARY KEY,score INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE scores(id INTEGER PRIMARY KEY,score INTEGER NOT NULL);INSERT INTO scores VALUES (1,0),(2,81);
```

## conditional-member-count · 활성 회원 수
난이도:초급(교육적추정), 상태:검증완료
active=1인 회원 수 한 행을 반환하세요. active는0/1이며 빈테이블도0한 행입니다.

### 스키마
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,active INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT COUNT(CASE WHEN active=1 THEN 1 END) FROM members
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT COUNT(CASE WHEN active=1 THEN 1 ELSE 0 END) FROM members
```
오답2
```sql
SELECT SUM(CASE WHEN active=1 THEN 1 ELSE 0 END) FROM members
```
### 단계별 힌트
1. COUNT는0도 값으로 셉니다.
2. 불일치 행은NULL로 만들거나WHERE로 제외합니다.
3. SUM은빈테이블에서NULL이 될 수 있습니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 조건부COUNT에 ELSE0을 넣으면 불일치행까지 세며, SUM으로 바꾸면 빈테이블 처리가 필요합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,active INTEGER NOT NULL);INSERT INTO members VALUES (1,1);
```
사례2
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,active INTEGER NOT NULL);INSERT INTO members VALUES (1,1),(2,0);
```
사례3
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,active INTEGER NOT NULL);INSERT INTO members VALUES (1,0),(2,0);
```
사례4
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,active INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY,active INTEGER NOT NULL);INSERT INTO members VALUES (1,1),(2,1),(3,0);
```

## qualifying-order · 조건을 만족하는 주문이 있는 고객
난이도:중급(교육적추정), 상태:검증완료
완료(status=done)와 amount>=100을 동시에 만족하는 한 주문이라도 있는 고객ID를 한 번씩 반환하세요.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,status TEXT NOT NULL,amount INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT c.id FROM customers c WHERE EXISTS(SELECT 1 FROM orders o WHERE o.customer_id=c.id AND status='done' AND amount>=100)
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT c.id FROM customers c WHERE EXISTS(SELECT 1 FROM orders o WHERE o.customer_id=c.id AND status='done') AND EXISTS(SELECT 1 FROM orders o WHERE o.customer_id=c.id AND amount>=100)
```
오답2
```sql
SELECT c.id FROM customers c JOIN orders o ON o.customer_id=c.id WHERE status='done' AND amount>=100
```
### 단계별 힌트
1. 두 조건이 같은 주문에 적용되어야 합니다.
2. 각각EXISTS가 참이어도 같은주문은 아닙니다.
3. 고객당 한 행인지 확인합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 별도EXISTS는 서로 다른 주문으로 조건을 충족할 수 있고 일반JOIN은 여러 적격주문만큼 고객을 반복합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,status TEXT NOT NULL,amount INTEGER NOT NULL);INSERT INTO customers VALUES (1);
INSERT INTO orders VALUES (1,1,'done',150);
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,status TEXT NOT NULL,amount INTEGER NOT NULL);INSERT INTO customers VALUES (1);
INSERT INTO orders VALUES (1,1,'done',50),(2,1,'pending',200);
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,status TEXT NOT NULL,amount INTEGER NOT NULL);INSERT INTO customers VALUES (1),(2);
INSERT INTO orders VALUES (1,1,'done',100),(2,1,'done',200);
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,status TEXT NOT NULL,amount INTEGER NOT NULL);INSERT INTO customers VALUES (1);
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,status TEXT NOT NULL,amount INTEGER NOT NULL);
```

## store-product-units · 매장별 상품 판매량
난이도:중급(교육적추정), 상태:검증완료
store_id, product_id, 판매수량합계를 반환하세요. 매장과 상품 조합당 한 행이며 빈테이블은0행입니다.

### 스키마
```sql
CREATE TABLE sales(id INTEGER PRIMARY KEY,store_id INTEGER NOT NULL,product_id INTEGER NOT NULL,qty INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT store_id,product_id,SUM(qty) FROM sales GROUP BY store_id,product_id
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT store_id,product_id,SUM(qty) FROM sales GROUP BY store_id
```
오답2
```sql
SELECT store_id,product_id,SUM(DISTINCT qty) FROM sales GROUP BY store_id,product_id
```
### 단계별 힌트
1. 출력 단위는매장과상품의 조합입니다.
2. GROUP BY에두 키가 모두 필요합니다.
3. 같은수량의 다른 거래도 합산합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 일부키만 그룹화하면SQLite가 임의 비집계값을 선택할 수 있고, 수량DISTINCT는 다른거래를 제거합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE sales(id INTEGER PRIMARY KEY,store_id INTEGER NOT NULL,product_id INTEGER NOT NULL,qty INTEGER NOT NULL);INSERT INTO sales VALUES (1,1,10,2);
```
사례2
```sql
CREATE TABLE sales(id INTEGER PRIMARY KEY,store_id INTEGER NOT NULL,product_id INTEGER NOT NULL,qty INTEGER NOT NULL);INSERT INTO sales VALUES (1,1,10,2),(2,1,20,3);
```
사례3
```sql
CREATE TABLE sales(id INTEGER PRIMARY KEY,store_id INTEGER NOT NULL,product_id INTEGER NOT NULL,qty INTEGER NOT NULL);INSERT INTO sales VALUES (1,1,10,2),(2,2,10,4);
```
사례4
```sql
CREATE TABLE sales(id INTEGER PRIMARY KEY,store_id INTEGER NOT NULL,product_id INTEGER NOT NULL,qty INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE sales(id INTEGER PRIMARY KEY,store_id INTEGER NOT NULL,product_id INTEGER NOT NULL,qty INTEGER NOT NULL);INSERT INTO sales VALUES (1,1,10,2),(2,1,10,2),(3,2,20,0);
```

## department-top-salary · 부서 최고 급여 직원 모두
난이도:중급(교육적추정), 상태:검증완료
부서별 최고salary를 받는 모든 직원ID를 반환하세요. 동률은 모두 포함하며 급여는NULL없는정수입니다.

### 스키마
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,dept INTEGER NOT NULL,salary INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT e.id FROM employees e WHERE e.salary=(SELECT MAX(x.salary) FROM employees x WHERE x.dept=e.dept)
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id FROM employees GROUP BY dept HAVING salary=MAX(salary)
```
오답2
```sql
SELECT id FROM employees WHERE salary=(SELECT MAX(salary) FROM employees)
```
### 단계별 힌트
1. 동률인 직원도 모두 필요합니다.
2. GROUP BY로 한 직원만 고르면누락됩니다.
3. 최고값의 범위는 전체가 아니라부서입니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 최고급여값을 부서별로 구한 뒤 그값과 같은 모든직원을 보존해야 합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,dept INTEGER NOT NULL,salary INTEGER NOT NULL);INSERT INTO employees VALUES (1,1,100);
```
사례2
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,dept INTEGER NOT NULL,salary INTEGER NOT NULL);INSERT INTO employees VALUES (1,1,100),(2,1,100),(3,1,50);
```
사례3
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,dept INTEGER NOT NULL,salary INTEGER NOT NULL);INSERT INTO employees VALUES (1,1,100),(2,2,200),(3,2,150);
```
사례4
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,dept INTEGER NOT NULL,salary INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,dept INTEGER NOT NULL,salary INTEGER NOT NULL);INSERT INTO employees VALUES (1,1,0),(2,2,0);
```

## latest-customer-order · 고객별 최근 주문
난이도:중급(교육적추정), 상태:검증완료
고객별 최근주문 한 건의 customer_id,id를 반환하세요. 최근은 at가 큰순, 같은at는 id큰순입니다. 주문없는 고객은결과에없습니다. at는고정길이ISO텍스트입니다.

### 스키마
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,at TEXT NOT NULL);
```
### 기준 SQL
```sql
SELECT o.customer_id,o.id FROM orders o WHERE NOT EXISTS(SELECT 1 FROM orders x WHERE x.customer_id=o.customer_id AND (x.at>o.at OR(x.at=o.at AND x.id>o.id)))
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT customer_id,MAX(id) FROM orders GROUP BY customer_id
```
오답2
```sql
SELECT o.customer_id,o.id FROM orders o WHERE o.at=(SELECT MAX(at) FROM orders x WHERE x.customer_id=o.customer_id)
```
### 단계별 힌트
1. ID와날짜의 순서는같지않을수있습니다.
2. 같은날짜에서한건을정할기준이있습니다.
3. 더최근인주문이없다는조건으로표현합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 날짜우선, 그다음ID라는전체순서를 사용해야날짜와ID의충돌및동률을해결합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO orders VALUES (1,1,'2026-01-01');
```
사례2
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO orders VALUES (9,1,'2026-01-01'),(2,1,'2026-02-01');
```
사례3
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO orders VALUES (1,1,'2026-01-01'),(2,1,'2026-01-01');
```
사례4
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,at TEXT NOT NULL);
```
사례5
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO orders VALUES (1,1,'2026-01-01'),(3,2,'2026-01-02'),(4,2,'2026-01-01');
```

## no-return-order · 반품 없는 주문
난이도:중급(교육적추정), 상태:검증완료
어떤상품도 반품되지 않은 주문ID를 반환하세요. returns의행이하나라도해당주문을참조하면주문전체제외합니다.

### 스키마
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY);
CREATE TABLE lines(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL);
CREATE TABLE returns(line_id INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT o.id FROM orders o WHERE NOT EXISTS(SELECT 1 FROM lines l JOIN returns r ON r.line_id=l.id WHERE l.order_id=o.id)
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT DISTINCT o.id FROM orders o JOIN lines l ON l.order_id=o.id LEFT JOIN returns r ON r.line_id=l.id WHERE r.line_id IS NULL
```
오답2
```sql
SELECT DISTINCT o.id FROM orders o JOIN lines l ON l.order_id=o.id WHERE NOT EXISTS(SELECT 1 FROM lines x JOIN returns r ON r.line_id=x.id WHERE x.order_id=o.id)
```
### 단계별 힌트
1. 반품여부의 판단단위는주문전체입니다.
2. 반품안된상품이하나있다고반품없는주문은아닙니다.
3. 상품없는주문도반품이없습니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 일부상품의미반품행만남기는필터는주문전체의반품존재조건과다릅니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY);
CREATE TABLE lines(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL);
CREATE TABLE returns(line_id INTEGER NOT NULL);INSERT INTO orders VALUES (1);
INSERT INTO lines VALUES (1,1);
```
사례2
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY);
CREATE TABLE lines(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL);
CREATE TABLE returns(line_id INTEGER NOT NULL);INSERT INTO orders VALUES (1);
INSERT INTO lines VALUES (1,1),(2,1);
INSERT INTO returns VALUES (1);
```
사례3
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY);
CREATE TABLE lines(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL);
CREATE TABLE returns(line_id INTEGER NOT NULL);INSERT INTO orders VALUES (1),(2);
INSERT INTO lines VALUES (1,1),(2,2);
INSERT INTO returns VALUES (1),(1);
```
사례4
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY);
CREATE TABLE lines(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL);
CREATE TABLE returns(line_id INTEGER NOT NULL);INSERT INTO orders VALUES (1);
```
사례5
```sql
CREATE TABLE orders(id INTEGER PRIMARY KEY);
CREATE TABLE lines(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL);
CREATE TABLE returns(line_id INTEGER NOT NULL);
```

## colleague-pairs · 같은 팀 동료 쌍
난이도:중급(교육적추정), 상태:검증완료
같은team인 서로다른직원 쌍의 작은ID,큰ID를 반환하세요. 자기자신과대칭중복을제외합니다.

### 스키마
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,team INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT a.id,b.id FROM employees a JOIN employees b ON a.team=b.team AND a.id<b.id
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT a.id,b.id FROM employees a JOIN employees b ON a.team=b.team AND a.id<>b.id
```
오답2
```sql
SELECT a.id,b.id FROM employees a JOIN employees b ON a.team=b.team AND a.id+1=b.id
```
### 단계별 힌트
1. 한쌍은한번만필요합니다.
2. 작은ID를왼쪽에둡니다.
3. 연속된ID끼리만동료인것은아닙니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. a.id<b.id는자기자신과대칭을함께제거하며 ID간격은동료여부와관계없습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,team INTEGER NOT NULL);INSERT INTO employees VALUES (1,1);
```
사례2
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,team INTEGER NOT NULL);INSERT INTO employees VALUES (1,1),(2,1);
```
사례3
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,team INTEGER NOT NULL);INSERT INTO employees VALUES (1,1),(2,1),(3,2);
```
사례4
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,team INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE employees(id INTEGER PRIMARY KEY,team INTEGER NOT NULL);INSERT INTO employees VALUES (1,1),(2,1),(3,1);
```

## above-average-orders · 평균보다 주문이 많은 고객
난이도:중급(교육적추정), 상태:검증완료
전체고객의 주문수평균보다 주문수가큰 고객ID를반환하세요. 무주문고객도평균분모에포함하며 빈고객집합은0행입니다.

### 스키마
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL);
```
### 기준 SQL
```sql
WITH counts AS(SELECT c.id,COUNT(o.id) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) SELECT id FROM counts WHERE n>(SELECT AVG(n) FROM counts)
```
### 대표 및 부분수정 오답
오답1
```sql
WITH counts AS(SELECT c.id,COUNT(o.id) n FROM customers c JOIN orders o ON o.customer_id=c.id GROUP BY c.id) SELECT id FROM counts WHERE n>(SELECT AVG(n) FROM counts)
```
오답2
```sql
WITH counts AS(SELECT c.id,COUNT(o.id) n FROM customers c LEFT JOIN orders o ON o.customer_id=c.id GROUP BY c.id) SELECT id FROM counts WHERE n>=(SELECT AVG(n) FROM counts)
```
### 단계별 힌트
1. 평균은모든고객을대상으로합니다.
2. 먼저0을포함한고객별건수를만듭니다.
3. 평균초과는이상이아닙니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. INNER JOIN으로무주문고객을제외하면평균분모가달라지고 >=는평균과같은고객도포함합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL);INSERT INTO customers VALUES (1);
INSERT INTO orders VALUES (1,1);
```
사례2
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL);INSERT INTO customers VALUES (1),(2);
INSERT INTO orders VALUES (1,1);
```
사례3
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL);INSERT INTO customers VALUES (1),(2),(3);
INSERT INTO orders VALUES (1,1),(2,1),(3,2);
```
사례4
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE customers(id INTEGER PRIMARY KEY);
CREATE TABLE orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL);INSERT INTO customers VALUES (1),(2);
```

## branch-transactions · 두 지점 판매 내역 합치기
난이도:중급(교육적추정), 상태:검증완료
두지점의 amount를거래별한행씩합쳐반환하세요. 금액이같아도별도거래이며 중복행개수를보존합니다.

### 스키마
```sql
CREATE TABLE north(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
CREATE TABLE south(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT amount FROM north UNION ALL SELECT amount FROM south
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT amount FROM north UNION SELECT amount FROM south
```
오답2
```sql
SELECT DISTINCT amount FROM north UNION ALL SELECT DISTINCT amount FROM south
```
### 단계별 힌트
1. 결과중복이업무상서로다른거래일수있습니다.
2. UNION은중복을제거합니다.
3. 지점안의동일금액거래도보존합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 행중복을제거하는집합합치기와거래를이어붙이는UNION ALL은다릅니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE north(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
CREATE TABLE south(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);INSERT INTO north VALUES (1,100);
```
사례2
```sql
CREATE TABLE north(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
CREATE TABLE south(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);INSERT INTO north VALUES (1,100);
INSERT INTO south VALUES (1,100);
```
사례3
```sql
CREATE TABLE north(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
CREATE TABLE south(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);INSERT INTO north VALUES (1,100),(2,100);
```
사례4
```sql
CREATE TABLE north(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
CREATE TABLE south(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE north(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);
CREATE TABLE south(id INTEGER PRIMARY KEY,amount INTEGER NOT NULL);INSERT INTO south VALUES (1,50),(2,50);
```

## all-required-courses · 필수 과목 모두 수료한 회원
난이도:고급(교육적추정), 상태:검증완료
required의모든course를수료한회원ID를반환하세요. 중복수료는한과목이며 필수과목이없으면모든회원이해당합니다.

### 스키마
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE required(course INTEGER PRIMARY KEY);
CREATE TABLE completed(member_id INTEGER NOT NULL,course INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT m.id FROM members m WHERE NOT EXISTS(SELECT 1 FROM required r WHERE NOT EXISTS(SELECT 1 FROM completed c WHERE c.member_id=m.id AND c.course=r.course))
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT m.id FROM members m JOIN completed c ON c.member_id=m.id JOIN required r ON r.course=c.course GROUP BY m.id HAVING COUNT(*)=(SELECT COUNT(*) FROM required)
```
오답2
```sql
SELECT m.id FROM members m JOIN completed c ON c.member_id=m.id JOIN required r ON r.course=c.course GROUP BY m.id HAVING COUNT(DISTINCT c.course)=(SELECT COUNT(*) FROM required)
```
### 단계별 힌트
1. 모든필수과목이라는조건입니다.
2. 수료행수와과목종류수는다릅니다.
3. 미수료필수과목이없음을표현하면빈필수집합도다룹니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 중복수료를세면과목을빠뜨려도통과하며 JOIN만쓰면필수과목없는경우의모든회원을잃습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE required(course INTEGER PRIMARY KEY);
CREATE TABLE completed(member_id INTEGER NOT NULL,course INTEGER NOT NULL);INSERT INTO members VALUES (1);
INSERT INTO required VALUES (10);
INSERT INTO completed VALUES (1,10);
```
사례2
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE required(course INTEGER PRIMARY KEY);
CREATE TABLE completed(member_id INTEGER NOT NULL,course INTEGER NOT NULL);INSERT INTO members VALUES (1);
INSERT INTO required VALUES (10),(20);
INSERT INTO completed VALUES (1,10),(1,10);
```
사례3
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE required(course INTEGER PRIMARY KEY);
CREATE TABLE completed(member_id INTEGER NOT NULL,course INTEGER NOT NULL);INSERT INTO members VALUES (1),(2);
INSERT INTO required VALUES (10),(20);
INSERT INTO completed VALUES (1,10),(1,20),(2,10);
```
사례4
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE required(course INTEGER PRIMARY KEY);
CREATE TABLE completed(member_id INTEGER NOT NULL,course INTEGER NOT NULL);INSERT INTO members VALUES (1),(2);
```
사례5
```sql
CREATE TABLE members(id INTEGER PRIMARY KEY);
CREATE TABLE required(course INTEGER PRIMARY KEY);
CREATE TABLE completed(member_id INTEGER NOT NULL,course INTEGER NOT NULL);INSERT INTO members VALUES (1);
INSERT INTO required VALUES (10);
INSERT INTO completed VALUES (1,99);
```

## allowed-features-only · 허용 기능만 쓰는 계정
난이도:고급(교육적추정), 상태:검증완료
금지기능을한번도쓰지않은계정ID를반환하세요. allowed에없는feature는금지이며 사용없는계정도포함합니다. feature는NULL이없습니다.

### 스키마
```sql
CREATE TABLE accounts(id INTEGER PRIMARY KEY);
CREATE TABLE allowed(feature TEXT PRIMARY KEY);
CREATE TABLE usage(account_id INTEGER NOT NULL,feature TEXT NOT NULL);
```
### 기준 SQL
```sql
SELECT a.id FROM accounts a WHERE NOT EXISTS(SELECT 1 FROM usage u WHERE u.account_id=a.id AND NOT EXISTS(SELECT 1 FROM allowed x WHERE x.feature=u.feature))
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT DISTINCT a.id FROM accounts a JOIN usage u ON u.account_id=a.id JOIN allowed x ON x.feature=u.feature
```
오답2
```sql
SELECT a.id FROM accounts a WHERE EXISTS(SELECT 1 FROM usage u WHERE u.account_id=a.id) AND NOT EXISTS(SELECT 1 FROM usage u WHERE u.account_id=a.id AND NOT EXISTS(SELECT 1 FROM allowed x WHERE x.feature=u.feature))
```
### 단계별 힌트
1. 허용사용이있음과금지사용이없음은다릅니다.
2. 허용과금지의혼합계정을확인합니다.
3. 사용없는계정도금지사용이없습니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 존재조건으로허용사용을찾으면금지사용이섞인계정을놓치며 불필요한사용존재조건은빈계정을제외합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE accounts(id INTEGER PRIMARY KEY);
CREATE TABLE allowed(feature TEXT PRIMARY KEY);
CREATE TABLE usage(account_id INTEGER NOT NULL,feature TEXT NOT NULL);INSERT INTO accounts VALUES (1);
INSERT INTO allowed VALUES ('read');
INSERT INTO usage VALUES (1,'read');
```
사례2
```sql
CREATE TABLE accounts(id INTEGER PRIMARY KEY);
CREATE TABLE allowed(feature TEXT PRIMARY KEY);
CREATE TABLE usage(account_id INTEGER NOT NULL,feature TEXT NOT NULL);INSERT INTO accounts VALUES (1);
INSERT INTO allowed VALUES ('read');
INSERT INTO usage VALUES (1,'read'),(1,'delete');
```
사례3
```sql
CREATE TABLE accounts(id INTEGER PRIMARY KEY);
CREATE TABLE allowed(feature TEXT PRIMARY KEY);
CREATE TABLE usage(account_id INTEGER NOT NULL,feature TEXT NOT NULL);INSERT INTO accounts VALUES (1),(2);
INSERT INTO allowed VALUES ('read');
INSERT INTO usage VALUES (1,'read');
```
사례4
```sql
CREATE TABLE accounts(id INTEGER PRIMARY KEY);
CREATE TABLE allowed(feature TEXT PRIMARY KEY);
CREATE TABLE usage(account_id INTEGER NOT NULL,feature TEXT NOT NULL);INSERT INTO accounts VALUES (1);
```
사례5
```sql
CREATE TABLE accounts(id INTEGER PRIMARY KEY);
CREATE TABLE allowed(feature TEXT PRIMARY KEY);
CREATE TABLE usage(account_id INTEGER NOT NULL,feature TEXT NOT NULL);INSERT INTO accounts VALUES (1);
INSERT INTO usage VALUES (1,'read');
```

## top-two-price-levels · 카테고리별 상위 두 가격대
난이도:고급(교육적추정), 상태:검증완료
각category에서서로다른가격기준상위두가격대에속하는상품ID를모두반환하세요. 동률모두포함,price는NULL없는정수입니다.

### 스키마
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,category INTEGER NOT NULL,price INTEGER NOT NULL);
```
### 기준 SQL
```sql
WITH ranked AS(SELECT id,DENSE_RANK() OVER(PARTITION BY category ORDER BY price DESC) n FROM products) SELECT id FROM ranked WHERE n<=2
```
### 대표 및 부분수정 오답
오답1
```sql
WITH ranked AS(SELECT id,ROW_NUMBER() OVER(PARTITION BY category ORDER BY price DESC,id) n FROM products) SELECT id FROM ranked WHERE n<=2
```
오답2
```sql
WITH ranked AS(SELECT id,RANK() OVER(PARTITION BY category ORDER BY price DESC) n FROM products) SELECT id FROM ranked WHERE n<=2
```
### 단계별 힌트
1. 순위단위는상품수가아니라가격대입니다.
2. 동률다음순위에빈칸이생기는지확인합니다.
3. DENSE_RANK는동률뒤의다음가격대를바로잇습니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. ROW_NUMBER는동률을자르고 RANK는동률수만큼순위를건너뛰므로두가격대를다담지못할수있습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,category INTEGER NOT NULL,price INTEGER NOT NULL);INSERT INTO products VALUES (1,1,100);
```
사례2
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,category INTEGER NOT NULL,price INTEGER NOT NULL);INSERT INTO products VALUES (1,1,100),(2,1,100),(3,1,90),(4,1,80);
```
사례3
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,category INTEGER NOT NULL,price INTEGER NOT NULL);INSERT INTO products VALUES (1,1,100),(2,2,100),(3,2,90),(4,2,80);
```
사례4
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,category INTEGER NOT NULL,price INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE products(id INTEGER PRIMARY KEY,category INTEGER NOT NULL,price INTEGER NOT NULL);INSERT INTO products VALUES (1,1,100),(2,1,90),(3,1,90);
```

## running-balance · 거래 직후 누적 잔액
난이도:고급(교육적추정), 상태:검증완료
거래ID와해당거래직후계좌잔액을반환하세요. 시작잔액0, account별 at오름차순·같은at는id오름차순으로처리합니다. delta는정수이며음수가능합니다.

### 스키마
```sql
CREATE TABLE transactions(id INTEGER PRIMARY KEY,account INTEGER NOT NULL,at TEXT NOT NULL,delta INTEGER NOT NULL);
```
### 기준 SQL
```sql
SELECT id,SUM(delta) OVER(PARTITION BY account ORDER BY at,id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM transactions
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id,SUM(delta) OVER(PARTITION BY account ORDER BY at) FROM transactions
```
오답2
```sql
SELECT id,SUM(delta) OVER(ORDER BY at,id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM transactions
```
### 단계별 힌트
1. 같은시각에도거래를순서대로처리합니다.
2. 기본RANGE는같은정렬값의행을함께볼수있습니다.
3. 계좌분리와명시적인ROWS를확인합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 거래전체순서와계좌별파티션을명시해야동시각거래와다른계좌가서로영향을주지않습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE transactions(id INTEGER PRIMARY KEY,account INTEGER NOT NULL,at TEXT NOT NULL,delta INTEGER NOT NULL);INSERT INTO transactions VALUES (1,1,'2026-01-01',100);
```
사례2
```sql
CREATE TABLE transactions(id INTEGER PRIMARY KEY,account INTEGER NOT NULL,at TEXT NOT NULL,delta INTEGER NOT NULL);INSERT INTO transactions VALUES (1,1,'2026-01-01',100),(2,1,'2026-01-01',-20);
```
사례3
```sql
CREATE TABLE transactions(id INTEGER PRIMARY KEY,account INTEGER NOT NULL,at TEXT NOT NULL,delta INTEGER NOT NULL);INSERT INTO transactions VALUES (1,1,'2026-01-01',100),(2,2,'2026-01-01',50);
```
사례4
```sql
CREATE TABLE transactions(id INTEGER PRIMARY KEY,account INTEGER NOT NULL,at TEXT NOT NULL,delta INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE transactions(id INTEGER PRIMARY KEY,account INTEGER NOT NULL,at TEXT NOT NULL,delta INTEGER NOT NULL);INSERT INTO transactions VALUES (1,1,'2026-01-02',10),(2,1,'2026-01-01',20),(3,1,'2026-01-02',-5);
```

## device-increase · 직전 값보다 증가한 기록
난이도:고급(교육적추정), 상태:검증완료
장치별직전기록보다value가큰기록ID를반환하세요. 장치안의순서는seq이며장치별seq유일,첫기록은제외합니다.

### 스키마
```sql
CREATE TABLE readings(id INTEGER PRIMARY KEY,device INTEGER NOT NULL,seq INTEGER NOT NULL,value INTEGER NOT NULL);
```
### 기준 SQL
```sql
WITH x AS(SELECT id,value,LAG(value) OVER(PARTITION BY device ORDER BY seq) prev FROM readings) SELECT id FROM x WHERE value>prev
```
### 대표 및 부분수정 오답
오답1
```sql
WITH x AS(SELECT id,value,LAG(value) OVER(ORDER BY seq) prev FROM readings) SELECT id FROM x WHERE value>prev
```
오답2
```sql
WITH x AS(SELECT id,value,LAG(value) OVER(PARTITION BY device ORDER BY seq) prev FROM readings) SELECT id FROM x WHERE value>=prev
```
### 단계별 힌트
1. 이전행은장치안에서찾습니다.
2. 첫기록의이전값은NULL입니다.
3. 증가는같음이아닌엄격한비교입니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 장치구분없이LAG를쓰면다른장치기록과비교하고 >=는동일값도증가로셉니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE readings(id INTEGER PRIMARY KEY,device INTEGER NOT NULL,seq INTEGER NOT NULL,value INTEGER NOT NULL);INSERT INTO readings VALUES (1,1,1,10),(2,1,2,20);
```
사례2
```sql
CREATE TABLE readings(id INTEGER PRIMARY KEY,device INTEGER NOT NULL,seq INTEGER NOT NULL,value INTEGER NOT NULL);INSERT INTO readings VALUES (1,1,1,10),(2,2,2,20);
```
사례3
```sql
CREATE TABLE readings(id INTEGER PRIMARY KEY,device INTEGER NOT NULL,seq INTEGER NOT NULL,value INTEGER NOT NULL);INSERT INTO readings VALUES (1,1,1,10),(2,1,2,10);
```
사례4
```sql
CREATE TABLE readings(id INTEGER PRIMARY KEY,device INTEGER NOT NULL,seq INTEGER NOT NULL,value INTEGER NOT NULL);
```
사례5
```sql
CREATE TABLE readings(id INTEGER PRIMARY KEY,device INTEGER NOT NULL,seq INTEGER NOT NULL,value INTEGER NOT NULL);INSERT INTO readings VALUES (1,1,2,30),(2,1,1,40),(3,1,3,35);
```

## three-day-visits · 사흘 연속 방문한 회원
난이도:고급(교육적추정), 상태:검증완료
연속된서로다른세날을방문한회원ID를한번씩반환하세요. 같은날여러방문은하루이며 day는UTC ISO날짜입니다.

### 스키마
```sql
CREATE TABLE visits(member_id INTEGER NOT NULL,day TEXT NOT NULL);
```
### 기준 SQL
```sql
SELECT DISTINCT a.member_id FROM visits a WHERE EXISTS(SELECT 1 FROM visits b WHERE b.member_id=a.member_id AND b.day=date(a.day,'+1 day')) AND EXISTS(SELECT 1 FROM visits c WHERE c.member_id=a.member_id AND c.day=date(a.day,'+2 days'))
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT member_id FROM visits GROUP BY member_id HAVING COUNT(*)>=3
```
오답2
```sql
SELECT member_id FROM visits GROUP BY member_id HAVING COUNT(DISTINCT day)>=3
```
### 단계별 힌트
1. 방문횟수와방문한날수는다릅니다.
2. 서로다른세날이어도연속은아닐수있습니다.
3. 다음날과그다음날의존재를확인합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 날짜함수로월경계도처리하며횟수또는날짜종류의개수만으로연속성을증명할수없습니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE visits(member_id INTEGER NOT NULL,day TEXT NOT NULL);INSERT INTO visits VALUES (1,'2026-01-01'),(1,'2026-01-02'),(1,'2026-01-03');
```
사례2
```sql
CREATE TABLE visits(member_id INTEGER NOT NULL,day TEXT NOT NULL);INSERT INTO visits VALUES (1,'2026-01-01'),(1,'2026-01-01'),(1,'2026-01-01');
```
사례3
```sql
CREATE TABLE visits(member_id INTEGER NOT NULL,day TEXT NOT NULL);INSERT INTO visits VALUES (1,'2026-01-01'),(1,'2026-01-02'),(1,'2026-01-04');
```
사례4
```sql
CREATE TABLE visits(member_id INTEGER NOT NULL,day TEXT NOT NULL);
```
사례5
```sql
CREATE TABLE visits(member_id INTEGER NOT NULL,day TEXT NOT NULL);INSERT INTO visits VALUES (1,'2026-01-31'),(1,'2026-02-01'),(1,'2026-02-02'),(2,'2026-02-01');
```

## login-sessions · 회원별 접속 세션 수
난이도:고급(교육적추정), 상태:검증완료
member_id와세션수를반환하세요. 회원별 at,id순으로직전접속과30분초과간격이면새세션,정확히30분은같은세션입니다. 접속없는회원은원본에없어출력하지않습니다. at는UTC ISO초단위입니다.

### 스키마
```sql
CREATE TABLE logins(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL,at TEXT NOT NULL);
```
### 기준 SQL
```sql
WITH x AS(SELECT member_id,at,LAG(at) OVER(PARTITION BY member_id ORDER BY at,id) prev FROM logins) SELECT member_id,SUM(CASE WHEN prev IS NULL OR unixepoch(at)-unixepoch(prev)>1800 THEN 1 ELSE 0 END) FROM x GROUP BY member_id
```
### 대표 및 부분수정 오답
오답1
```sql
WITH x AS(SELECT member_id,at,LAG(at) OVER(PARTITION BY member_id ORDER BY at,id) prev FROM logins) SELECT member_id,SUM(CASE WHEN prev IS NULL OR unixepoch(at)-unixepoch(prev)>=1800 THEN 1 ELSE 0 END) FROM x GROUP BY member_id
```
오답2
```sql
SELECT member_id,COUNT(DISTINCT substr(at,1,13)) FROM logins GROUP BY member_id
```
### 단계별 힌트
1. 세션은시계의시간단위와다릅니다.
2. 정확히1800초는분리하지않습니다.
3. 회원별직전접속과초차이를비교합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 시간경계만넘었다고새세션은아니며정수초차이로정확히30분과30분1초를구분합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE logins(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO logins VALUES (1,1,'2026-01-01 10:00:00');
```
사례2
```sql
CREATE TABLE logins(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO logins VALUES (1,1,'2026-01-01 10:00:00'),(2,1,'2026-01-01 10:30:00');
```
사례3
```sql
CREATE TABLE logins(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO logins VALUES (1,1,'2026-01-01 10:59:00'),(2,1,'2026-01-01 11:01:00');
```
사례4
```sql
CREATE TABLE logins(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL,at TEXT NOT NULL);
```
사례5
```sql
CREATE TABLE logins(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL,at TEXT NOT NULL);INSERT INTO logins VALUES (1,1,'2026-01-01 10:00:00'),(2,1,'2026-01-01 10:30:01'),(3,2,'2026-01-01 10:00:00');
```

## overlapping-reservations · 겹치는 예약 쌍
난이도:고급(교육적추정), 상태:검증완료
같은room의겹치는예약쌍을작은ID,큰ID로한번씩반환하세요. 구간은[start,end)이고접하기만하면겹치지않습니다. start<end이며 모든 예약은 같은 날의 고정 길이 HH:MM 텍스트입니다.

### 스키마
```sql
CREATE TABLE bookings(id INTEGER PRIMARY KEY,room INTEGER NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL);
```
### 기준 SQL
```sql
SELECT a.id,b.id FROM bookings a JOIN bookings b ON a.room=b.room AND a.id<b.id AND a.start<b.end AND b.start<a.end
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT a.id,b.id FROM bookings a JOIN bookings b ON a.room=b.room AND a.id<b.id AND a.start<=b.end AND b.start<=a.end
```
오답2
```sql
SELECT a.id,b.id FROM bookings a JOIN bookings b ON a.room=b.room AND a.id<>b.id AND a.start<b.end AND b.start<a.end
```
### 단계별 힌트
1. 맞닿는끝점은겹침이아닙니다.
2. 포함관계도겹칩니다.
3. 양방향구간비교와작은ID조건을사용합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 엄격한두구간비교는포함과부분중첩을함께다루고ID비교는대칭중복을제거합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE bookings(id INTEGER PRIMARY KEY,room INTEGER NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL);INSERT INTO bookings VALUES (1,1,'10:00','11:00'),(2,1,'12:00','13:00');
```
사례2
```sql
CREATE TABLE bookings(id INTEGER PRIMARY KEY,room INTEGER NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL);INSERT INTO bookings VALUES (1,1,'10:00','11:00'),(2,1,'11:00','12:00');
```
사례3
```sql
CREATE TABLE bookings(id INTEGER PRIMARY KEY,room INTEGER NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL);INSERT INTO bookings VALUES (1,1,'10:00','14:00'),(2,1,'11:00','12:00');
```
사례4
```sql
CREATE TABLE bookings(id INTEGER PRIMARY KEY,room INTEGER NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL);
```
사례5
```sql
CREATE TABLE bookings(id INTEGER PRIMARY KEY,room INTEGER NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL);INSERT INTO bookings VALUES (1,1,'10:00','12:00'),(2,1,'11:00','13:00'),(3,2,'10:00','12:00');
```

## organization-descendants · 하위 조직 전체
난이도:고급(교육적추정), 상태:검증완료
조직1의모든직간접하위조직ID를반환하고1자체는제외하세요. parent_id NULL은루트이며고정데이터에는사이클과중복ID가없습니다.

### 스키마
```sql
CREATE TABLE orgs(id INTEGER PRIMARY KEY,parent_id INTEGER);
```
### 기준 SQL
```sql
WITH RECURSIVE sub(id) AS(SELECT id FROM orgs WHERE parent_id=1 UNION ALL SELECT o.id FROM orgs o JOIN sub s ON o.parent_id=s.id) SELECT id FROM sub
```
### 대표 및 부분수정 오답
오답1
```sql
SELECT id FROM orgs WHERE parent_id=1
```
오답2
```sql
WITH RECURSIVE sub(id) AS(SELECT id FROM orgs WHERE id=1 UNION ALL SELECT o.id FROM orgs o JOIN sub s ON o.parent_id=s.id) SELECT id FROM sub
```
### 단계별 힌트
1. 직접자식만으로는부족합니다.
2. 찾은자식의자식을계속찾습니다.
3. 기준조직자신은출력에서제외합니다.
### 기본 해설
관측된 누락/추가 행과 데이터를 먼저 확인하세요. 다음은 검토된 예시 원리이며 임의 SQL의 실패 원인을 확정하지 않습니다. 재귀CTE의시작집합과확장조건을분리해야깊은후손과다른트리를구분합니다.
### 샘플 및 검사 데이터
사례1 (현재 샘플)
```sql
CREATE TABLE orgs(id INTEGER PRIMARY KEY,parent_id INTEGER);INSERT INTO orgs VALUES (1,NULL),(2,1);
```
사례2
```sql
CREATE TABLE orgs(id INTEGER PRIMARY KEY,parent_id INTEGER);INSERT INTO orgs VALUES (1,NULL),(2,1),(3,2),(4,3);
```
사례3
```sql
CREATE TABLE orgs(id INTEGER PRIMARY KEY,parent_id INTEGER);INSERT INTO orgs VALUES (1,NULL),(2,1),(8,NULL),(9,8);
```
사례4
```sql
CREATE TABLE orgs(id INTEGER PRIMARY KEY,parent_id INTEGER);
```
사례5
```sql
CREATE TABLE orgs(id INTEGER PRIMARY KEY,parent_id INTEGER);INSERT INTO orgs VALUES (1,NULL),(2,1),(3,1),(4,2);
```
