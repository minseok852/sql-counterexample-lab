export const concepts={
 'three-valued-logic':{title:'NULL과 세 값 논리',principle:'NOT IN의 집합에 NULL이 있고 같은 값이 없으면 비교 결과는 UNKNOWN이다. WHERE는 TRUE인 행만 남긴다. customer_id가 NULL인 주문은 어느 고객도 식별하지 않는다. 미구매 고객은 고객별 일치 주문의 부재로 확인한다.',hint:'NULL 참조 주문과 구매하지 않은 고객을 서로 다른 대상으로 구분해 보세요.',related:['anti-existence']},
 'anti-existence':{title:'존재하지 않음',principle:'조건을 만족하는 행이 없음과 NULL인 참조 행이 존재함은 다르다. NULL을 제거한 NOT IN은 식별자 NULL 조건에 따라 작동할 수 있으므로 NOT IN이 언제나 틀렸다고 말하지 않는다.',hint:'일치하는 주문이 있는지 고객별로 확인해 보세요.',related:['three-valued-logic']},
 'join-cardinality':{title:'조인의 행 수',principle:'한 주문에 여러 상품 행이 연결되면 표준 주문ID 조인은 주문을 반복할 수 있다. 그러나 서로 다른 두 주문의 금액이 같은 것은 조인 중복이 아니다. 실제 데이터의 주문ID와 상품 연결 수를 먼저 구분한다.',hint:'각 주문 ID에 연결된 상품 행 수를 따로 세어 보세요.',related:['aggregation-grain','distinct-values']},
 'aggregation-grain':{title:'집계 단위',principle:'주문 매출의 집계 단위는 주문ID다. 금액값은 주문의 식별자가 아니며 같은 금액의 서로 다른 주문도 각각 포함한다.',hint:'금액을 유일하게 만들기보다 주문 하나를 한 번만 합하는지 확인해 보세요.',related:['join-cardinality','distinct-values']},
 'distinct-values':{title:'DISTINCT의 대상',principle:'SUM(DISTINCT amount)는 주문ID가 아니라 금액값의 중복을 제거한다. 주문ID가 다른 두 주문의 금액이100씩이면 금액값은 하나지만 합산해야 하는 주문은 둘이다.',hint:'현재 두 행이 같은 주문인지, 금액만 같은 다른 주문인지 확인해 보세요.',related:['aggregation-grain']},
 'outer-join-filter':{title:'외부 조인과 필터 위치',principle:'LEFT JOIN은 오른쪽 일치 행이 없어도 왼쪽 행을 보존하고 오른쪽 값을NULL로 만든다. ON은 일치 조건, WHERE는 조인 이후 필터다. 오른쪽 status에 대한 WHERE의 동등조건은 보존된NULL행에서TRUE가 아니므로 제거할 수 있다.',hint:'주문이 없는 고객의 오른쪽 status가 무엇이 되는지 먼저 생각해 보세요.',related:['null-aware-count','three-valued-logic']},
 'null-aware-count':{title:'COUNT의 대상',principle:'COUNT(*)는 보존된 행도 세지만 COUNT(오른쪽의 NULL 아닌 ID)는 실제로 연결된 행을 센다. 이 원리는 임의 SQL의 원인을 확정하지 않는다.',hint:'고객 행 수와 실제 주문 ID 개수를 구분해 보세요.',related:['outer-join-filter']}
}as const;
export const problemLinks:Record<string,(keyof typeof concepts)[]>={never:['three-valued-logic','anti-existence'],revenue:['join-cardinality','aggregation-grain','distinct-values'],completed:['outer-join-filter','null-aware-count']};
export function retrieveConcepts(problemId:string,evidence:any){
 const ids=problemLinks[problemId]??[];const facts:{id:string,text:string}[]=[];
 if(!ids.length)return{scope:'이 문제의 연결표는 아직 없으며 기본 해설만 사용한다.',facts:[],nodes:[],edges:[]};
 const orders=evidence.tables?.orders;if(Array.isArray(orders)){
 const nullRefs=orders.filter((o:any)=>o.customer_id===null).length;
 facts.push({id:'dataset.null_customer_refs',text:`현재 주문 표에서 customer_id가 NULL인 행은 ${nullRefs}개다. 이는 특정 고객 ID가 아니다.`});
 if(problemId==='revenue'){
 const items=Array.isArray(evidence.tables?.items)?evidence.tables.items:[];
 const links=orders.map((o:any)=>({order_id:o.id,customer_id:o.customer_id,amount:o.amount,linked_item_rows:items.filter((i:any)=>i.order_id===o.id).length}));
 facts.push({id:'dataset.order_item_links',text:'현재 표의 서로 다른 주문과 연결된 상품 수: '+JSON.stringify(links)});
 if(orders.length>1&&new Set(orders.map((o:any)=>o.id)).size===orders.length&&new Set(orders.map((o:any)=>o.amount)).size<orders.length)facts.push({id:'dataset.equal_amount_distinct_orders',text:'금액이 같아도 주문 ID가 다른 행이 있다. 이를 같은 주문의 반복이라고 부르면 안 된다.'});
 }
 }
 const caseNode=`${problemId}:case:${typeof evidence.index==='number'?evidence.index+1:'unknown'}`;
 const trace=[{from:problemId,to:caseNode},...facts.map(f=>({from:caseNode,to:f.id})),...facts.flatMap(f=>ids.map(id=>({from:f.id,to:id}))),...ids.map(id=>({from:id,to:`${id}:verified-principle-and-hint`}))];
 return{scope:'개념 원리와 데이터 관찰이며 사용자 SQL의 확정 진단이 아니다. 문제/사례 ID만으로 원인을 결정하지 않는다.',facts,nodes:ids.map(id=>({id,...concepts[id]})),edges:ids.map(id=>({from:problemId,to:id})),trace};
}
