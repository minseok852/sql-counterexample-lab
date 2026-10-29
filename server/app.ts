import {selectedStrategy} from './ai-selection';
import {makeMessages,modelOptions,type Strategy} from './ai-prompts';
import {answerPolicy} from './ai-policy';
import express from 'express';
import {z} from 'zod';
import {problems,schema} from '../src/problems';
export const requestSchema=z.object({problem:z.string().max(40),sql:z.string().min(1).max(12000),question:z.string().trim().min(1).max(1000),evidence:z.string().max(14000),history:z.array(z.string().max(12000)).max(3),conversation:z.array(z.object({question:z.string().max(1000),answer:z.string().max(2000),problemId:z.string().max(40).optional(),sql:z.string().max(12000).optional(),sqlChanged:z.boolean().optional(),executionId:z.number().optional(),caseIndex:z.number().int().min(0).max(4).optional(),source:z.enum(['model','fallback']).optional(),truncated:z.boolean().optional()}).strict()).max(3),attempts:z.array(z.object({sql:z.string().max(2000),mismatch:z.boolean(),mode:z.string().max(10),caseIndex:z.number().int().min(0).max(5).optional()}).strict()).max(3).optional(),hint:z.number().int().min(0).max(3)}).strict();
type Dependencies={fetch?:typeof fetch;now?:()=>number;timeoutMs?:number;strategy?:Strategy;schedule?:(callback:()=>void,ms:number)=>any;unschedule?:(timer:any)=>void;};
export function createApp(deps:Dependencies={}){
 const upstream=deps.fetch??fetch,now=deps.now??Date.now,schedule=deps.schedule??setTimeout,unschedule=deps.unschedule??clearTimeout;
 const app=express();app.use(express.json({limit:'256kb'}));let active=0;const times:number[]=[];
 app.get('/api/health',(_q,r)=>r.json({ok:true,model:process.env.OLLAMA_MODEL||'qwen3:4b-instruct'}));
 app.post('/api/ask',async(req,res)=>{
 const parsed=requestSchema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'질문 형식이나 크기를 확인하세요.'});return;}
 const p=problems.find(x=>x.id===parsed.data.problem);if(!p){res.status(400).json({error:'알 수 없는 문제'});return;}
 const current=now();while(times.length&&times[0]<=current-60000)times.shift();if(active>=1||times.length>=6){res.status(429).json({error:'잠시 후 다시 질문하세요.'});return;}times.push(current);active++;
 const controller=new AbortController();let timedOut=false;const timer=schedule(()=>{timedOut=true;controller.abort()},deps.timeoutMs??60000);const disconnect=()=>controller.abort();res.on('close',disconnect);
 try{
 const strategy=deps.strategy??selectedStrategy;
 const response=await upstream('http://127.0.0.1:11434/api/chat',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OLLAMA_MODEL||'qwen3:4b-instruct',stream:false,options:modelOptions,messages:makeMessages(strategy,parsed.data)})}); if(!response.ok)throw Error('model');const result=await response.json();if(!res.destroyed)res.json({...answerPolicy(String(result.message?.content??'').slice(0,10000),parsed.data.question,parsed.data.sql),strategy,truncated:result.done_reason==="length"});
 }catch{if(!res.destroyed)res.status(503).json({error:timedOut?'로컬 AI 응답 시간이 60초를 초과했습니다. 기본 해설은 계속 사용할 수 있습니다.':'로컬 AI에 연결하지 못했습니다. Ollama와 설치된 모델을 확인하세요. 기본 해설은 계속 사용할 수 있습니다.'});}finally{unschedule(timer);res.off('close',disconnect);active--;}
 });
 app.use((error:any,_q:express.Request,r:express.Response,_n:express.NextFunction)=>{r.status(error?.type==='entity.too.large'?413:400).json({error:'요청을 처리할 수 없습니다. 요청 크기와 JSON 형식을 확인하세요.'})});
 return app;
}
