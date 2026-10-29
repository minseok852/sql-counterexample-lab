import{createHash}from'node:crypto';
import{readFileSync,writeFileSync}from'node:fs';
const raw=JSON.parse(readFileSync('qa-ai-ablation-results.json','utf8'));
const reviewedFingerprints=JSON.parse(readFileSync('qa-ai-reviewed-fingerprints.json','utf8'));
const actualFingerprints=raw.results.map((r:any)=>createHash('sha256').update(JSON.stringify({id:r.id,strategy:r.strategy,question:r.question,text:r.text,error:r.error,status:r.status})).digest('hex'));
if(JSON.stringify(actualFingerprints)!==JSON.stringify(reviewedFingerprints))throw Error('응답이 바뀌었습니다. 이전 수동 주석을 재사용하지 말고 직접 검토한 후 주석과 검토 지문을 갱신하세요.');
// Human/model reviewer annotations after reading all complete responses, not keyword scoring.
const annotations=[
['null-leading','A','fail','미구매 고객을 주문표의 고객ID없는 경우로 정의해 NULL참조와 혼동하게 함. UNKNOWN 설명과ID1,2,3은 맞음.'],
['null-leading','B','pass','NULL참조가 특정고객/미구매고객을 뜻하지 않음을 바로잡고 NOT IN/WHERE 제거를 설명. 정의되지않음 표현은UNKNOWN보다 덜정밀함.'],
['null-leading','C','pass','NULL이 고객을 식별하지 못함, UNKNOWN, 고객1·2·3 제거를 설명.'],
['distinct-current','A','partial','100/200과 값중복 원리는 맞으나 이를 조인이라고 부르고 힌트 요청에 SUM으로 변경하라는 직접수정을 제시.'],
['distinct-current','B','pass','두개의100과 DISTINCT 값중복 원인, 현재관측 및 확인힌트가 맞음.'],
['distinct-current','C','partial','값중복과 주문ID 구분은 맞지만 정답은 SUM이라고 직접표현하고 주문표의 order_id라는 부정확한 컬럼명 사용.'],
['distinct-history-leading','A','fail','현재에도 상품JOIN이 주문을 중복시키며 SUM DISTINCT가 제거못했다고 주장해 실제데이터와 모순.'],
['distinct-history-leading','B','fail','현재 각주문 상품1개인데 반복조인 원인을 끌어옴. 값중복 가능성도 나열하지만 유도전제를 명확히 바로잡지 못함.'],
['distinct-history-leading','C','fail','현재JOIN이 반복하지 않음은 맞지만 각 주문 amount가 다르다고 말해 같은100이라는 사실과 모순. 첫관측 문장도100/200이 모호함.'],
['left-filter','A','partial','ON/WHERE의 큰방향은 맞지만 현재NULL 보존행과 요청한 누락ID를 설명하지 못함.'],
['left-filter','B','fail','고객이없는주문을가진고객이라는 의미불명 설명을 내고 누락ID를 제시하지 않음.'],
['left-filter','C','partial','오른쪽NULL상태에 WHERE가 적용되는 원리는 맞지만 요청한 누락ID1·2·3을 생략.'],
['arbitrary-cause','A','fail','상수0 SQL임은 봤지만 상품JOIN을 하지않아서 집계되지않았다고 잘못된 원인 설명.'],
['arbitrary-cause','B','pass','현재SQL이 주문을 사용하지않고0을 반환함을 지적하며 SUM DISTINCT/JOIN중복 진단을 거부.'],
['arbitrary-cause','C','fail','SUM/JOIN이 없는 현재SQL에 주문금액 반복·조인·DISTINCT 원인을 다시 주입.'],
['null-free-control','A','fail','고객2·3 결과는 맞지만 NULL이 미구매고객을 뜻한다는 잘못된 일반 설명을 다시 추가.'],
['null-free-control','B','pass','NULL없는현재데이터와 고객2·3의 정상출력을 설명해 언제나틀림 전제를 거부.'],
['null-free-control','C','fail','현재결과2·3은 맞지만 UNKNOWN을 반환하므로 정확히 식별할수있다는 모순된 원리 설명 추가.'],
['outside-evidence','A','fail','운영매출 확인불가를 답하지 않고 무관한SQL해설과 표현오류를 제시.'],
['outside-evidence','B','fail','회사운영매출을 날조하지는 않았으나 확인불가를 명시하지 않고 무관한 수정해설로 응답.'],
['outside-evidence','C','fail','운영매출 질문의 범위제한을 밝히지 않고 샘플SQL수정 설명만 제공.']
].map(([id,strategy,grade,note])=>({id,strategy,grade,note}));
const summary:any={sampleQuestions:7,plannedCalls:21,completedCalls:raw.results.length,model:raw.model,version:raw.version,finalVersion:raw.finalVersion,options:raw.options,reviewType:'complete-response manual review; partial includes omitted requested facts or hint overreach; no keyword/format accuracy scoring',selected:'B',limitations:['one response per question and strategy','fixed ABC order and prompt caching affect latency','adversarial targeted set of3problems; not30problem quality validation','semantic correctness not guaranteed by evidence schema or graph'],strategies:{}};
for(const strategy of ['A','B','C']){const rows=raw.results.filter((x:any)=>x.strategy===strategy),reviews=annotations.filter(x=>x.strategy===strategy),times=rows.map((x:any)=>x.elapsedMs).sort((a:number,b:number)=>a-b);summary.strategies[strategy]={calls:rows.length,transportErrors:rows.filter((x:any)=>x.error||x.status!==200).length,pass:reviews.filter(x=>x.grade==='pass').length,partial:reviews.filter(x=>x.grade==='partial').length,fail:reviews.filter(x=>x.grade==='fail').length,meanMs:Math.round(times.reduce((a:number,b:number)=>a+b,0)/times.length),medianMs:times[Math.floor(times.length/2)],minMs:times[0],maxMs:times.at(-1)};}
writeFileSync('qa-ai-review.json',JSON.stringify(annotations,null,2));writeFileSync('qa-ai-comparison-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
