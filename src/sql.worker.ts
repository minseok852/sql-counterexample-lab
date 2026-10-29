import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import wasmUrl from '@sqlite.org/sqlite-wasm/sqlite3.wasm?url';
import {problems} from './problems';
import {diff, type Result} from './compare';
import{learningExamples}from'./learning-examples';
const ready=(sqlite3InitModule as any)({locateFile:()=>wasmUrl});
class LabError extends Error{constructor(public kind:string,message:string){super(message)}}
onmessage=async({data})=>{
 let db:any;
 try{
 const sqlite:any=await ready,c=sqlite.capi;
 const p=problems.find(p=>p.id===data.problem);if(!p)throw new LabError('internal','문제를 찾지 못했습니다.');
 const example=data.mode==='example'||data.mode==='example-inspect'?learningExamples.find(e=>e.problemId===p.id):undefined;
 if((data.mode==='example'||data.mode==='example-inspect')&&!example)throw new LabError('internal','학습용 예시가 없습니다.');
 const snapshot=()=>{
 const names:string[]=db.exec({sql:"SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'",rowMode:0,returnValue:'resultRows'});
 const tableColumns:Record<string,string[]>={},tableSchema:Record<string,any[]>={};
 const tables=Object.fromEntries(names.map(t=>{const quoted='"'+t.replaceAll('"','""')+'"';const columnNames:string[]=[];const rows=db.exec({sql:`SELECT * FROM ${quoted}`,columnNames,rowMode:'object',returnValue:'resultRows'});const info=db.exec({sql:`PRAGMA table_info(${quoted})`,rowMode:'object',returnValue:'resultRows'});tableColumns[t]=columnNames;const pkCount=info.filter((c:any)=>c.pk>0).length;tableSchema[t]=info.map((c:any)=>({name:c.name,type:c.type,nullable:!(c.notnull||(c.pk&&pkCount===1&&c.type.toUpperCase()==='INTEGER')),primaryKey:c.pk>0}));return[t,rows]}));return{tables,tableColumns,tableSchema};
 };
 if(data.mode==='inspect'){const index=Number(data.caseIndex??0);if(!Number.isInteger(index)||index<0||index>=p.cases.length)throw new LabError('input','잘못된 데이터 번호');db=new sqlite.oo1.DB(':memory:');db.exec(p.cases[index]);postMessage({ok:true,...snapshot()});return;}
 if(data.mode==='example-inspect'&&example){db=new sqlite.oo1.DB(':memory:');db.exec(example.dataSQL);const columns:string[]=[];const rows=db.exec({sql:example.query,columnNames:columns,rowMode:'array',returnValue:'resultRows'});if(!diff({columns,rows},{columns,rows:example.expected}).equal)throw new LabError('internal','학습용 예시의 기대 결과와 다릅니다.');postMessage({ok:true,...snapshot(),reference:{columns,rows}});return;}
 if(typeof data.sql!=='string'||!data.sql.trim()||data.sql.length>12000)throw new LabError('input','SQL은 1~12,000자로 입력하세요.');
 const execute=(sql:string):Result=>{
 const out:Result={columns:[],rows:[]};const statements:string[]=[];let bytes=0;
 db.exec({sql,rowMode:'array',columnNames:out.columns,saveSql:statements,callback:(row:any[])=>{bytes+=JSON.stringify(row).length;if(out.rows.length>=500||bytes>100000)throw new LabError('limit','결과 제한(500행/100,000자)을 초과했습니다.');out.rows.push(row);}});
 if(statements.length!==1||!out.columns.length)throw new LabError('input','단일 SELECT만 허용합니다.');return out;
 }; const cases=example?[example.dataSQL]:data.mode==='sample'?p.cases.slice(0,1):p.cases;
 for(let index=0;index<cases.length;index++){
 db=new sqlite.oo1.DB(':memory:');db.exec(cases[index]);c.sqlite3_limit(db.pointer,c.SQLITE_LIMIT_LENGTH,100000);c.sqlite3_limit(db.pointer,c.SQLITE_LIMIT_SQL_LENGTH,12000);c.sqlite3_limit(db.pointer,c.SQLITE_LIMIT_EXPR_DEPTH,100);c.sqlite3_limit(db.pointer,c.SQLITE_LIMIT_COMPOUND_SELECT,10);
 let expected:Result;try{expected=execute(example?example.query:p.answer)}catch{throw new LabError('internal','기준 쿼리 실행 실패');}
 const authCode=c.sqlite3_set_authorizer(db.pointer,(_u:number,action:number,_a:string,b:string)=>{
 if([c.SQLITE_SELECT,c.SQLITE_READ,c.SQLITE_RECURSIVE].includes(action))return c.SQLITE_OK;
 if(action===c.SQLITE_FUNCTION&&['count','sum','total','avg','min','max','coalesce','ifnull','nullif','abs','round','length','lower','upper','trim','substr','substring','typeof','like','glob','iif','date','unixepoch','dense_rank','rank','row_number','lag','lead'].includes(String(b).toLowerCase()))return c.SQLITE_OK;
 return c.SQLITE_DENY;
 },0);if(authCode!==c.SQLITE_OK)throw new LabError('internal','SQL 권한 검사를 시작하지 못했습니다.');
 const actual=execute(data.sql),comparison=diff(actual,expected);
 c.sqlite3_set_authorizer(db.pointer,0,0);
 const inputData=snapshot();
 db.close();db=null;
 if(example){postMessage({ok:true,actual,...inputData,mode:'example',notice:'별도 학습용 데이터 실행이며 정답 판정이 아닙니다.'});return;}
 if(data.mode==='sample'||!comparison.equal){postMessage({ok:true,problemId:p.id,executedSQL:data.sql,index,actual,expected,comparison,...inputData,passed:comparison.equal,total:cases.length,mode:data.mode});return;}
 }
 postMessage({ok:true,problemId:p.id,executedSQL:data.sql,passed:true,total:cases.length,mode:data.mode});
 }catch(error){postMessage({ok:false,kind:error instanceof LabError?error.kind:'sql',message:error instanceof Error?error.message:String(error)});}finally{db?.close();}
};
