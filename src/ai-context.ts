export type AttemptTrace={sql:string,mismatch:boolean,mode:string,caseIndex?:number,executionId?:number};
export type ChatTurn={q:string,a:string,problemId?:string,sql?:string,executionId?:number,caseIndex?:number,source?:'model'|'fallback'|'error'};
const clipped=(value:string,limit:number)=>value.length>limit?value.slice(0,limit)+'…[일부 생략]':value;
// Full comparison stays on screen; only the optional model context is bounded.
export function buildEvidence(result:any):string{
 if(result==null)return '아직 실행한 결과가 없습니다.';
 const compact=(value:any):any=>{
 if(typeof value==='string')return clipped(value,160);
 if(Array.isArray(value))return value.slice(0,5).map(x=>compact(x));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).slice(0,20).map(([k,v])=>[k,compact(v)]));return value;};
 const text=JSON.stringify({notice:'AI 전달용 요약입니다. 각 배열은 최대 5개 항목이며 긴 셀은 생략될 수 있습니다. 전체 실행 결과와 다릅니다.',result:{...compact(result),executedSQL:result.executedSQL,problemId:result.problemId}});
 return text.length<=14000?text:JSON.stringify({notice:'실행 결과가 커서 상세 근거를 AI에 전달하지 않았습니다. 화면의 결과를 확인하도록 안내하세요.',passed:result.passed,mode:result.mode,index:result.index});
}
export function buildAIContext(problem:string,sql:string,question:string,result:any,history:string[],chat:ChatTurn[],hint:number,includeHistory=false,attempts:AttemptTrace[]=[]){
 const conversation=chat.filter(t=>t.source!=='error'&&(!t.problemId||t.problemId===problem)).slice(-2).map(t=>({question:clipped(t.q,250),answer:clipped(t.a,600),problemId:t.problemId??problem,sql:includeHistory?t.sql:undefined,sqlChanged:t.sql?t.sql!==sql:undefined,executionId:t.executionId,caseIndex:t.caseIndex,source:t.source??'model',truncated:t.q.length>250||t.a.length>600}));
 return {problem,sql,question,evidence:buildEvidence(result),history:includeHistory?history.filter(x=>x!==sql).slice(-3).map(x=>clipped(x,2000)):[],conversation,attempts:includeHistory?attempts.filter(a=>a.executionId!==result?.executionId).slice(-3).map(a=>({sql:clipped(a.sql,1900),mismatch:a.mismatch,mode:a.mode,caseIndex:a.caseIndex})):[],hint};
}
